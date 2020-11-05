import { Grammar, Production, ProductionBody, EOF_SYM, SymbolType } from "../types/grammar.js";
import { Symbol } from "../types/Symbol";
import { processClosure, Item, createAssertionFunctionBody } from "../util/common.js";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment";
import {
    createNoCheckShift,
    createAssertionShift,
    has_INLINE_FUNCTIONS,
    getRootSym,
    getSkipArray,
    getIncludeBooleans,
    createReduceFunction,
    createEmptyShift,
    translateSymbolValue,
    createDefaultReduceFunction,
    addRecoveryHandlerToFunctionBodyArray
} from "./utilities/utilities.js";
import { RDProductionFunction } from "./types/RDProductionFunction";
import { RDItem } from "./types/RDItem";
import { getTerminalSymsFromClosure } from "./utilities/get_terminal_syms_from_closure.js";
import { insertFunctions } from "./utilities/insert_body_functions.js";
import { CompilerRunner } from "./types/CompilerRunner.js";
const enum TOKEN_BIT {
    ID = 1,
    TYPE = 2,

    IS_MULTIPLE = 4
}

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
    productions: Set<number> = new Set,
    RENDER_WITH_NO_CHECK = false
): string {

    const
        stmts = [],
        body = item.body_(grammar);

    stmts.push(insertFunctions(item, grammar, true));

    if (item.atEND) {
        if (body.reduce_id >= 0)
            stmts.push(createReduceFunction(item, grammar));
        else if (item.len > 1)
            stmts.push(createDefaultReduceFunction(item));

        stmts.push(`return;`);
    } else {
        const sym = getRootSym(item.sym(grammar), grammar);

        if (sym.type == "production") {

            productions.add(<number>sym.val);

            stmts.push(`$${grammar[sym.val].name}(l)`);

        } else {
            if (sym.type == SymbolType.PRODUCTION_ASSERTION_FUNCTION) {
                if (sym.DOES_SHIFT) {
                    stmts.push(translateSymbolValue(sym, grammar, runner.ANNOTATED));
                } else {
                    if (!RENDER_WITH_NO_CHECK)
                        stmts.push(translateSymbolValue(sym, grammar, runner.ANNOTATED));
                    stmts.push(createEmptyShift());
                }
            }
            else if (RENDER_WITH_NO_CHECK)
                stmts.push(createNoCheckShift(grammar, runner));
            else
                stmts.push(createAssertionShift(grammar, runner, sym));
        }
    }

    return stmts.join("\n");
}


function renderItem(item: Item, grammar: Grammar, runner: CompilerRunner, productions: Set<number> = new Set, DONT_CHECK = false, block_depth = 0): string {


    const stmts = (DONT_CHECK && !item.atEND) ? [] : ["if(!FAILED){"];

    stmts.push(renderItemSym(item, grammar, runner, productions, DONT_CHECK && block_depth > 0));

    if (!item.atEND) {
        const SHOULD_CHECK = DONT_CHECK
            && item.sym(grammar).type !== SymbolType.PRODUCTION
            && item.sym(grammar).type !== SymbolType.PRODUCTION_ASSERTION_FUNCTION;
        stmts.push(renderItem(item.increment(), grammar, runner, productions, SHOULD_CHECK, 1));
    } else
        stmts.splice(stmts.length - 1, 0, `setProduction(${item.getProduction(grammar).id})`);

    if (!DONT_CHECK || item.atEND) stmts.push("}");

    return stmts.join("\n");
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
        return data;
    }

    return { closure: out, COMPLETED };
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
    block_depth: number = 0,
    peek_depth: number = 0,
    productions: Set<number> = new Set,
    HAS_ERROR_RECOVERY: boolean = false
)
    : string {

    const stmts = [];

    if (peek_depth > 4)
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

        if (runner.ANNOTATED && peek_depth > 0)
            stmts.push(`/*${new Item(i.body_index, grammar.bodies[i.body_index].length, 0, {}).renderUnformattedWithProduction(grammar)} peek ${peek_depth} state: \n${i.closure.map(i => i.renderUnformattedWithProduction(grammar)).join("\n")}*/\n`);

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

    const
        MULTIPLE_GROUPS = !(group_maps.size == 1),
        if_else_stmts = [];

    //Now create the necessary if statements with peek if depth > 0
    for (const group of group_maps.values()) {

        const
            pk = peek_depth,
            body = [],
            trs = group.trs,
            syms = [...group.syms.values()];

        token_bit |= [...syms.map(s => sym_map.get(s))].reduce((r, v) => {
            let bit = 0;

            switch (v.type) {
                case SymbolType.GENERATED: bit = TOKEN_BIT.TYPE; break;
                case SymbolType.LITERAL:
                case SymbolType.SYMBOL:
                case SymbolType.ESCAPED:
                    bit = TOKEN_BIT.ID;
            }

            return r |= bit;
        }, 0);
        let
            tests = [...syms.map(s => sym_map.get(s))];
        if (runner.ANNOTATED) {
            body.push("//considered syms: " + syms);
        }

        if (trs.length > 1) {

            //Advance through each symbol until there is a difference
            //When there is a difference create a peek if-else sequence
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
                    body.push(renderItemSym(items[0], grammar, runner, productions));
                    items = items.map(i => i.increment()).filter(i => i);
                    peek_depth = -1;
                    peek_depth = -1;

                } else {

                    const
                        no_closures = items.filter(i => i.atEND),

                        prod_items = items
                            .filter(i => !i.atEND && (i.sym(grammar).type == SymbolType.PRODUCTION)),

                        term_items = items
                            .filter(i => !i.atEND && (i.sym(grammar).type != SymbolType.PRODUCTION && i.sym(grammar).type !== SymbolType.PRODUCTION_ASSERTION_FUNCTION)),

                        paf_la_items = items
                            .filter(i => !i.atEND && (i.sym(grammar).type == SymbolType.PRODUCTION_ASSERTION_FUNCTION)),

                        new_trs = [].concat(prod_items.map(i => {

                            const rd_item = ItemToRDItem(i, grammar);

                            const { closure, COMPLETED } = getPeekAtDepth(rd_item.item, grammar, peek_depth + 1);

                            rd_item.closure = closure.setFilter(i => i.id);

                            // Variant of production is completed at this peek level.
                            if (COMPLETED) no_closures.push(i);

                            return rd_item;
                        }))
                            .concat(term_items.map(i => ItemToRDItem(i, grammar)))
                            .concat(paf_la_items.map(i => ItemToRDItem(i, grammar)));

                    if (new_trs.length > 0) {
                        const has_closures = new_trs.filter(f => f.closure.length > 0);

                        no_closures.push(...new_trs.filter(f => f.closure.length == 0).map(RDItemToItem));

                        if (runner.ANNOTATED) {
                            body.push("\n//Look Ahead Level " + (peek_depth + 1));
                            body.push("/*\n" + prod_items.filter(_ => !!_).map(i => i.renderUnformattedWithProduction(grammar)).join("\n"), "*/");
                        }

                        body.push(renderFunctionBody(has_closures, grammar, runner, block_depth + 1, peek_depth + 1, productions));
                    }

                    for (const d of no_closures.setFilter(i => i.id).slice(0)) {
                        if (runner.ANNOTATED) {
                            body.push("\n//Completed Production");
                            body.push("/*\n" + [d].filter(_ => !!_).map(i => i.renderUnformattedWithProduction(grammar)).join("\n"), "*/");
                        }
                        body.push(renderItem(d, grammar, runner, productions, peek_depth == 0 || !MULTIPLE_GROUPS));
                    }

                    break;
                };
            }
        } else {

            //Just complete the grammar symbols
            const item = RDItemToItem(trs[0]);
            if (runner.ANNOTATED) {
                body.push("\n//Single Production Completion");
                body.push("/*\n" + [item].map(i => i.renderUnformattedWithProduction(grammar)).join("\n"), "*/");
            }
            body.push(renderItem(item, grammar, runner, productions, peek_depth == 0 || !MULTIPLE_GROUPS, block_depth));
            //if (item.atEND) IS_SINGLE = true;
        }

        if (MULTIPLE_GROUPS) {
            if (peek_depth <= 0)
                if_else_stmts.push(`if(${getIncludeBooleans(tests, grammar, runner, pk > 0 ? "pk" + (pk) : "l")}){\n ${body.join("\n")}\n}`);
            else
                if_else_stmts.push(`if(!FAILED &&  ${getIncludeBooleans(tests, grammar, runner, pk > 0 ? "pk" + (pk) : "l")}){\n ${body.join("\n")}\n}`);
        } else {

            stmts.push(...body);
        }
    }

    if (MULTIPLE_GROUPS) {
        //Item annotations if required

        if (token_bit) {
            const const_node = ["const"], const_body = [];

            let lx = "l";

            if (peek_depth > 0) {
                lx = `pk${peek_depth}`;
                const_body.push(`${lx}:Lexer =_pk( ${peek_depth > 1 ? "pk" + (peek_depth - 1) : "l"}.copy(), /* e.eh, */${getSkipArray(grammar, runner)})`);
            }

            const_node.push(const_body.join(","), ";");

            if (const_body.length > 0)

                stmts.unshift(const_node.join(" "));

        }
        stmts.push(if_else_stmts.join(" else "));
    }

    return stmts.join("\n");
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

    let productions: Set<number> = new Set();

    const stmts = [],

        HAS_ERROR_RECOVERY = !!production.error_recovery,

        INLINE_FUNCTIONS = p.bodies.some(has_INLINE_FUNCTIONS),

        start_items: RDItem[] = p.bodies.map(b => BodyToRDItem(b, grammar)),

        closure = start_items.map(RDItemToItem);

    processClosure(closure, grammar, true);

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
            stmts.push("/*\n" + closure.filter(_ => !!_).map(i => i.renderUnformattedWithProduction(grammar)).join("\n"), "*/");
        }

        stmts.push(renderFunctionBody(start_items, grammar, runner, 0, 0, productions, HAS_ERROR_RECOVERY));


    } catch (e) {
        console.dir(e);
        return {
            refs: 0,
            id: p.id,
            IS_RD: false,
            fn: `/* Could Not Parse in Recursive Descent Mode */`
        };
    }

    if (production.recovery_handler) {
        addRecoveryHandlerToFunctionBodyArray(stmts, production, grammar, runner, true);
    } else {
        stmts.push(`fail(l);`);
    }

    return {
        productions,
        refs: 0,
        id: p.id,
        IS_RD: true,
        fn: `function $${p.name}(l:Lexer) :void{${stmts.join("\n")}}`
    };
}