import { Grammar, Production, ProductionBody, EOF_SYM, SymbolType, Symbol } from "../types/grammar.js";
import { processClosure, Item, FOLLOW } from "../util/common.js";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment";
import { stmt } from "@candlefw/js";
import { translateSymbolValue, getLexPeekComparisonStringCached, getReduceFunctionSymbolIndiceSet, has_INLINE_FUNCTIONS, getRootSym } from "./utilities/utilities.js";
import { RDProductionFunction } from "./types/RDProductionFunction";
import { RDItem } from "./types/RDItem";
import { getTerminalSymsFromClosure } from "./utilities/get_terminal_syms_from_closure.js";
import { insertFunctions } from "./utilities/insert_body_functions.js";
import { CompilerRunner } from "./types/CompilerRunner.js";

let TEMP_FLAG = false;

function checkForLeftRecursion(p: Production, start_items: RDItem[], grammar: Grammar) {

    const closure_items = start_items.map(g => g.item);

    processClosure(closure_items, grammar, true);

    for (const i of closure_items) {

        const sym = i.sym(grammar);

        if (sym) {

            if (sym.type == "production")
                if (grammar[sym.val] == p)
                    return true;
        }
    }

    return false;
}

function RDItemToItem(v: RDItem): Item {
    return new Item(v.body_index, v.len, v.off, EOF_SYM);
}

function ItemToRDItem(i: Item, grammar: Grammar, body_offset = 0): RDItem {
    const c = [i];
    processClosure(c, grammar, true);
    return <RDItem>{ body_index: i.body, body_offset, off: i.offset, len: i.len, item: i, closure: c };
}

function BodyToRDItem(b: ProductionBody, grammar: Grammar): RDItem {
    return ItemToRDItem(new Item(b.id, b.length, 0, EOF_SYM), grammar);
}

function renderItemSym(
    item: Item,
    grammar: Grammar,
    runner: CompilerRunner,
    AUTO_RETURN = true,
    productions: Set<number> = new Set
): string {

    const
        stmts = [],
        body = item.body_(grammar);

    stmts.push(insertFunctions(item, grammar, true));

    if (item.atEND) {
        //  stmts.push(`stack_ptr -= 1;`);
        if (!(item.len == 1 && !body.reduce_function))
            stmts.push(`add_reduce(${item.len},${item.body});`);

        if (AUTO_RETURN) stmts.push(`return;`);
    } else {
        const sym = getRootSym(item.sym(grammar), grammar);

        if (sym.type == "production") {

            productions.add(<number>sym.val);

            if (AUTO_RETURN) stmts.push(`if(FAILED) return;`);

            stmts.push(`$${grammar[sym.val].name}(l)`);

        } else {

            //Get skips from grammar - TODO get symbols from bodies / productions
            const skip_symbols = `[${grammar.meta.ignore.flatMap(d => d.symbols).map(s => getRootSym(s, grammar)).map(s => translateSymbolValue(s, grammar)).join(",")}]`;

            stmts.push(`_(l, /* e.eh, */ ${skip_symbols}, ${translateSymbolValue(sym, grammar)});`);
        }
    }

    return stmts.join("\n");
}

function renderItem(item: Item, grammar: Grammar, runner: CompilerRunner, AUTO_RETURN: boolean = true, productions: Set<number> = new Set): string {
    const stmts = [];

    while (true) {
        stmts.push(renderItemSym(item, grammar, runner, AUTO_RETURN, productions));
        if (item.atEND) break;
        item = item.increment();
    }

    stmts.splice(stmts.length - 1, 0, `setProduction(${item.getProduction(grammar).id})`);
    //stmts.splice(stmts.length - 1, 0, `prod =  (-1&(~(FAILED-1))) | (${item.getProduction(grammar).id}&(~(!FAILED-1)))`);

    return stmts.join("\n");
}


type TransitionGroup = {
    id: string;
    syms: Set<string>;
    trs: RDItem[];
};
export function renderFunctionBody(
    llitems: RDItem[],
    grammar: Grammar,
    runner: CompilerRunner,
    peek_depth: number = 0,
    ELSE_REDUCE = false,
    AUTO_RETURN: boolean = true,
    productions: Set<number> = new Set,
)
    : string {

    const stmts = [];

    if (peek_depth > 3)
        throw "Can't complete";

    /* 
        Each item has a closure which yields transition symbols. 
        We are only interested in terminal transition symbols. 

        If a set of items have the same transition symbols then 
        they are likely the same and can be treated in one pass. 

        If the transition symbols differ, then the production will 
        need to be disambiguated until we find either matching
        transition symbols or 
    */

    const sym_map = new Map();

    // sort into transition groups - groups gathered based on a single transition symbol
    const transition_groups: Map<string, RDItem[]> = llitems.groupMap((i: RDItem) => {

        const syms = [];

        for (const sym of getTerminalSymsFromClosure(i.closure, grammar)) {
            syms.push(sym.val);
            sym_map.set(sym.val, sym);
        }

        return syms;
    });


    // Combine transition groups that have the same RDItems. Merge their transition symbols together
    const group_maps: Map<string, TransitionGroup> = new Map();

    for (const [key, trs] of transition_groups.entries()) {

        const id = trs.map(i => RDItemToItem(i).id).setFilter(i => i).sort().join("");

        if (!group_maps.has(id)) {

            group_maps.set(id, {
                id,
                syms: new Set(),
                trs
            });
        }

        group_maps.get(id).syms.add(key);
    }

    let token_bit = 0;

    //Now create the necessary if statements with peek if depth > 0
    for (const try_group of group_maps.values())
        token_bit |= buildGroupStatement(grammar, runner, try_group, peek_depth, stmts, sym_map, group_maps.size == 1 && !ELSE_REDUCE, AUTO_RETURN, productions);


    const MULTIPLE_GROUPS = token_bit & TOKEN_BIT.IS_MULTIPLE;

    if (MULTIPLE_GROUPS) {
        //Item annotations if required


        if (token_bit) {
            const const_node = ["const"];
            const const_body = [];

            let lx = "l";

            if (peek_depth > 0) {
                const skip_symbols = `[${grammar.meta.ignore.flatMap(d => d.symbols).map(s => getRootSym(s, grammar)).map(s => translateSymbolValue(s, grammar)).join(",")}]`;

                lx = `pk${peek_depth}`;

                const_body.push(`${lx}:Lexer =_pk( ${peek_depth > 1 ? "pk" + (peek_depth - 1) : "l"}.copy(), /* e.eh, */${skip_symbols})`);
            }

            if (token_bit & TOKEN_BIT.ID)
                const_body.push(`id:u32 = ${lx}.id`);

            if (token_bit & TOKEN_BIT.TYPE)
                const_body.push(`ty:u32 = ${lx}.ty`);

            const_node.push(const_body.join(","), ";");

            stmts.unshift(const_node.join(" "));
        }
    }

    return stmts.join("\n");
}

const enum TOKEN_BIT {
    ID = 1,
    TYPE = 2,

    IS_MULTIPLE = 4
}


function getPeekAtDepth(item: Item, grammar: Grammar, depth = 0, visited = new Set()): { closure: Item[], COMPLETED: boolean; } {

    if (!item || item.atEND) return { closure: [], COMPLETED: true };

    const closure = [item];

    let COMPLETED = false;

    processClosure(closure, grammar, true);

    const out = [];

    if (depth <= 0) {
        return { closure: closure.filter(i => !i.atEND && i.sym(grammar).type != SymbolType.PRODUCTION), COMPLETED };
    } else {
        for (const item of closure) {
            if (item.atEND) {
                COMPLETED = true;
            } else if (item.sym(grammar).type == SymbolType.PRODUCTION) {
                if (!visited.has(item.sym(grammar).val)) {
                    visited.add(item.sym(grammar).val);
                    const { closure: c, COMPLETED: C } = getPeekAtDepth(item, grammar, depth, visited);
                    out.push(...c);
                    COMPLETED = C || COMPLETED;
                }
            } else {
                const { closure: c, COMPLETED: C } = getPeekAtDepth(item.increment(), grammar, depth - 1);
                out.push(...c);
                COMPLETED = C || COMPLETED;
            }
        }
    }

    if (COMPLETED) {
        const data = getPeekAtDepth(item.increment(), grammar, depth - 1);
        data.closure.unshift(...out);
        data.COMPLETED = COMPLETED || data.COMPLETED;
        return data;
    }

    return { closure: out, COMPLETED };
}
export function buildGroupStatement(
    grammar: Grammar,
    runner: CompilerRunner,
    group: TransitionGroup,
    peek_depth,
    stmts,
    sym_map: Map<string, Symbol>,
    IS_SINGLE = false,
    AUTO_RETURN: boolean = true,
    productions: Set<number> = new Set
) {



    const
        body = [],
        trs = group.trs,
        syms = [...group.syms.values()];

    let
        token_bit = [...syms.map(s => sym_map.get(s))].reduce((r, v) => {
            let bit = 0;

            switch (v.type) {
                case SymbolType.GENERATED: bit = TOKEN_BIT.TYPE; break;
                case SymbolType.LITERAL:
                case SymbolType.SYMBOL:
                case SymbolType.ESCAPED:
                    bit = TOKEN_BIT.ID;
            }

            return r |= bit;
        }, 0),
        tests = [...syms.map(s => sym_map.get(s)).map(i => getLexPeekComparisonStringCached(i, grammar))];
    if (runner.ANNOTATED) {
        body.push("//considered syms: " + syms);
    }

    if (trs.length > 1) {

        //Advance through each symbol until there is a difference
        //When there is a difference create a peeking switch
        let items: Item[] = trs.filter(_ => !!_).map(RDItemToItem).filter(_ => !!_);

        while (true) {
            const sym = items.map(i => i).filter(i => !i.atEND)?.shift()?.sym(grammar),
                off = items.filter(i => !i.atEND)?.[0]?.offset;

            //If any items at end do something
            //
            if (off != undefined && sym && !items.reduce((r, i) => (r || i.atEND || (i.sym(grammar)?.val != sym.val)), false)) {
                if (runner.ANNOTATED) {
                    body.push("\n//Parallel Transition");
                    body.push("/*\n" + items.filter(_ => !!_).map(i => i.renderUnformattedWithProduction(grammar)).join("\n"), "*/");
                }
                //All items transition on the same symbol; resolve body disputes. 
                body.push(renderItemSym(items[0], grammar, runner, AUTO_RETURN, productions));
                items = items.map(i => i.increment()).filter(i => i);
                peek_depth = -1;
                peek_depth = -1;

            } else {
                const no_closures = items.filter(i => i.atEND);
                {
                    const
                        new_items = items
                            .filter(i => !i.atEND && !(i.sym(grammar).type != SymbolType.PRODUCTION)),
                        new_trs = new_items
                            .map(i => ItemToRDItem(i, grammar)).map(rd_item => {

                                rd_item.closure = getPeekAtDepth(rd_item.item, grammar, peek_depth + 1).closure;

                                return rd_item;
                            });

                    if (new_trs.length > 0) {
                        const has_closures = new_trs.filter(f => f.closure.length > 0);

                        no_closures.push(...new_trs.filter(f => f.closure.length == 0).map(RDItemToItem));

                        if (runner.ANNOTATED) {
                            body.push("\n//Production Look Ahead peek:" + (peek_depth + 1));
                            body.push("/*\n" + new_items.filter(_ => !!_).map(i => i.renderUnformattedWithProduction(grammar)).join("\n"), "*/");
                        }

                        body.push(renderFunctionBody(has_closures, grammar, runner, peek_depth + 1, true, AUTO_RETURN, productions));
                    }
                }
                {
                    const
                        new_items = items
                            .filter(i => !i.atEND && (i.sym(grammar).type != SymbolType.PRODUCTION)),

                        new_trs = new_items
                            .map(i => ItemToRDItem(i, grammar)).map(i => {
                                const closure = [i.item];
                                i.closure = closure;
                                processClosure(closure, grammar, true);
                                //Remove the root item
                                return i;
                            });
                    if (new_trs.length > 0) {
                        if (runner.ANNOTATED) {
                            body.push("\n//Terminal Look Ahead");
                            body.push("/*\n" + new_items.filter(_ => !!_).map(i => i.renderUnformattedWithProduction(grammar)).join("\n"), "*/");
                        }
                        body.push(renderFunctionBody(new_trs, grammar, runner, peek_depth, items.some(i => i.atEND), AUTO_RETURN, productions));
                    }
                }

                for (const d of no_closures) {
                    if (runner.ANNOTATED) {
                        body.push("\n//Completed Production");
                        body.push("/*\n" + [d].filter(_ => !!_).map(i => i.renderUnformattedWithProduction(grammar)).join("\n"), "*/");
                    }
                    body.push(renderItem(d, grammar, runner, AUTO_RETURN, productions));
                }

                break;
            };
        }
    } else {
        //IS_SINGLE = false;
        //Just complete the grammar symbols
        const item = RDItemToItem(trs[0]);
        if (item.atEND) IS_SINGLE = true;
        if (runner.ANNOTATED) {
            body.push("\n//Single Production Completion");
            body.push("/*\n" + [item].map(i => i.renderUnformattedWithProduction(grammar)).join("\n"), "*/");
        }
        body.push(renderItem(item, grammar, runner, AUTO_RETURN, productions));
    }

    if (!IS_SINGLE) {
        token_bit |= TOKEN_BIT.IS_MULTIPLE;
        stmts.push(`if(${tests.join("||")}){`, ...body, "}");
    } else {
        stmts.push(...body);
    }
    return token_bit;
}

export function buildIntermediateRD(items: Item[], grammar: Grammar, runner: CompilerRunner, ll_fns: RDProductionFunction[]): string {

    const start_items: RDItem[] = items.map(i => ItemToRDItem(i, grammar));

    let productions: Set<number> = new Set();

    const val = renderFunctionBody(start_items, grammar, runner, 0, false, false, productions);

    for (const production of productions.values()) {
        const ll = ll_fns[production];

        if (ll) {
            if (!ll.IS_RD) ll.state.REACHABLE = true;
            else ll.RENDER = true;
        }
    }

    return val;
}

export function makeRDHybridFunction(production: Production, grammar: Grammar, runner: CompilerRunner): RDProductionFunction {

    const p = production;

    if (p.name == "mf_range")
        TEMP_FLAG = true;
    else
        TEMP_FLAG = false;

    let productions: Set<number> = new Set();

    const stmts = [`function $${p.name}(l:Lexer) :void{`],



        INLINE_FUNCTIONS = p.bodies.some(has_INLINE_FUNCTIONS),

        start_items: RDItem[] = p.bodies.map(b => BodyToRDItem(b, grammar));

    if (INLINE_FUNCTIONS)
        stmts.push("const s = []");

    if (checkForLeftRecursion(p, start_items, grammar)) {
        return {
            refs: 0,
            id: p.id,
            IS_RD: false,
            fn: `/* Could Not Parse in Recursive Descent Mode */`
        };
    }
    try {
        if (runner.ANNOTATED) {
            stmts.push("//Production Start");
            stmts.push("/*\n" + start_items.map(RDItemToItem).filter(_ => !!_).map(i => i.renderUnformattedWithProduction(grammar)).join("\n"), "*/");
        }

        stmts.push(renderFunctionBody(start_items, grammar, runner, 0, false, true, productions));

        if (TEMP_FLAG) {
            const v = `${stmts.join("\n")}`;
            console.log({ v });
        }
    } catch (e) {
        return {
            refs: 0,
            id: p.id,
            IS_RD: false,
            fn: `/* Could Not Parse in Recursive Descent Mode */`
        };
    }

    stmts.push(`fail(l);`);

    stmts.push(`}`);

    return {

        productions,
        refs: 0,
        id: p.id,
        IS_RD: true,
        fn: stmts.join("\n")
    };
}

export function GetLLHybridFunctions(grammar: Grammar, env: GrammarParserEnvironment, runner: CompilerRunner): RDProductionFunction[] {

}
