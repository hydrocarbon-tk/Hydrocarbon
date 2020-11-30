import { Grammar, Production, ProductionBody, EOF_SYM, SymbolType } from "../types/grammar.js";
import { Symbol } from "../types/Symbol";
import { processClosure, Item, FOLLOW, FIRST } from "../util/common.js";
import {
    createNoCheckShift,
    has_INLINE_FUNCTIONS,
    getRootSym,
    getSkipArray,
    getIncludeBooleans,
    createReduceFunction,
    createEmptyShift,
    translateSymbolValue,
    createDefaultReduceFunction,
    addRecoveryHandlerToFunctionBodyArray,
    createAssertionShiftWithSkip,
    addSkipCall,
    isSymADefinedToken,
    isSymAnAssertFunction,
    getResetSymbols,
    createNoCheckShiftWithSkip,
    createAssertionShift,
    getMappedArray
} from "./utilities/utilities.js";
import { RDProductionFunction } from "./types/RDProductionFunction";
import { RDItem } from "./types/RDItem";
import { getTerminalSymsFromClosure } from "./utilities/get_terminal_syms_from_closure.js";
import { CompilerRunner } from "./types/CompilerRunner.js";
const enum TOKEN_BIT {
    ID = 1,
    TYPE = 2,

    IS_MULTIPLE = 4
}

function checkForLeftRecursion(p: Production, item: RDItem, grammar: Grammar) {

    const closure_items = [RDItemToItem(item)];

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

    if (item.atEND) {
        if (body.reduce_id >= 0)
            stmts.push(createReduceFunction(item, grammar));
        else if (item.len > 1)
            stmts.push(createDefaultReduceFunction(item));
    } else {
        const sym = getRootSym(item.sym(grammar), grammar);

        if (sym.type == "production") {

            productions.add(<number>sym.val);

            stmts.push(`$${grammar[sym.val].name}(l)`);

        } else {
            const
                inc_item = item.increment(),
                syms =
                    inc_item.atEND
                        ? [...FOLLOW(grammar, item.getProduction(grammar).id, true).values()]
                        : inc_item.sym(grammar).type == SymbolType.PRODUCTION
                            ? FIRST(grammar, inc_item.sym(grammar))
                            : [inc_item.sym(grammar)];


            if (sym.type == SymbolType.PRODUCTION_ASSERTION_FUNCTION) {
                if (sym.DOES_SHIFT) {
                    stmts.push(translateSymbolValue(sym, grammar, runner.ANNOTATED));
                } else {
                    if (!RENDER_WITH_NO_CHECK)
                        stmts.push(translateSymbolValue(sym, grammar, runner.ANNOTATED));
                    stmts.push(createEmptyShift());
                }
            }
            else if (RENDER_WITH_NO_CHECK) {
                if (item.offset == item.len - 1)
                    stmts.push(createNoCheckShift(grammar, runner, "l"));
                else
                    stmts.push(createNoCheckShiftWithSkip(grammar, runner, "l", syms));
            }
            else {
                if (item.offset == item.len - 1)
                    stmts.push(createAssertionShift(grammar, runner, sym, "l"));
                else
                    stmts.push(createAssertionShiftWithSkip(grammar, runner, sym, "l", syms));
            }
        }
    }

    return stmts.join("\n");
}

enum ReturnType {
    ACCEPT = 0,
    RETURN = 1,
    NONE = 2

}

function renderItem(
    item: Item,
    grammar: Grammar,
    runner: CompilerRunner,
    productions: Set<number> = new Set,
    DONT_CHECK = false,
    block_depth = 0,
    RETURN_TYPE: ReturnType = ReturnType.RETURN
): string {

    const
        DONT_CREATE_BLOCK = ((DONT_CHECK || block_depth == 0) /*&& !item.atEND*/),
        stmts = DONT_CREATE_BLOCK ? [] : ["if(!FAILED){" + `/*${item.renderUnformattedWithProduction(grammar)} ${DONT_CHECK}*/`];


    stmts.push(renderItemSym(item, grammar, runner, productions, DONT_CHECK));
    if (!item.atEND) {
        stmts.push(renderItem(item.increment(), grammar, runner, productions, (item.increment().atEND && DONT_CHECK), block_depth + 1, RETURN_TYPE));
    } else {
        stmts.splice(stmts.length - 1, 0, `setProduction(${item.getProduction(grammar).id})`);

        switch (RETURN_TYPE) {
            case ReturnType.ACCEPT:
                stmts.push(`ACCEPT = true;`);
                break;
            case ReturnType.RETURN:
                stmts.push(`return;`);
                break;
            case ReturnType.NONE: break;
        }
    }

    if (!DONT_CREATE_BLOCK) stmts.push("}");

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
    priority: number;
};
export function renderFunctionBody(
    rd_items: RDItem[],
    grammar: Grammar,
    runner: CompilerRunner,
    block_depth: number = 0,
    peek_depth: number = 0,
    productions: Set<number> = new Set,
    RETURN_TYPE: ReturnType = ReturnType.RETURN,
    HAS_ERROR_RECOVERY: boolean = false,
): ({ stmts: string; sym_map: Map<string, Symbol>; }) {

    const stmts = [], sym_map: Map<string, Symbol> = new Map();

    if (peek_depth > 4) {
        //If two or more items can't be resolved by a peek sequence
        //proceed with the parsing the longest item, and should that fail
        //attempt to parse with subsequent items, ordered by their maximum 
        //parse lengths
        console.dir({
            depth: peek_depth,
            d: rd_items.map(i => ({
                g: RDItemToItem(i).renderUnformattedWithProduction(grammar),
                b: i.closure.sort((i, j) => i.getProduction(grammar).id - j.getProduction(grammar).id).map(i => i.renderUnformattedWithProduction(grammar))
            }))
        }, { depth: null });

        stmts.push(`/*
            ${rd_items.map(RDItemToItem).map(i => i.renderUnformattedWithProduction(grammar)).join("\n")}
        */`);
    } else {



        /* 
            Each item has a closure which yields transition symbols. 
            We are only interested in terminal transition symbols. 
    
            If a set of items have the same transition symbols then 
            they are likely the same and can be treated in one pass. 
    
            If the transition symbols differ, then the production will 
            need to be disambiguated until we find either matching
            transition symbols or 
        */

        // sort into transition groups - groups gathered based on a single transition symbol
        const transition_groups: Map<string, RDItem[]> = rd_items.groupMap((i: RDItem) => {

            if (runner.ANNOTATED && peek_depth > 0)
                stmts.push(`/*${new Item(i.body_index, grammar.bodies[i.body_index].length, 0, {})
                    .renderUnformattedWithProduction(grammar)} peek ${peek_depth} state: \n${i
                        .closure.map(i => i.renderUnformattedWithProduction(grammar)).join("\n")}*/\n`);

            const syms = [];

            for (const sym of getTerminalSymsFromClosure(i.closure, grammar)) {
                syms.push(sym.val);
                sym_map.set(sym.val, sym);
            }

            return syms;
        });

        // Combine transition groups that have the same RDItems. Merge their transition symbols together
        const group_maps: Map<string, TransitionGroup> = new Map();

        for (const [symbol_val, trs] of transition_groups.entries()) {

            const id = trs.map(i => RDItemToItem(i).id).setFilter(i => i).sort().join("");

            if (!group_maps.has(id))
                group_maps.set(id, { id, syms: new Set(), trs, priority: 0 });

            const group = group_maps.get(id), sym = sym_map.get(symbol_val);

            group.syms.add(symbol_val);
            group.priority +=
                isSymADefinedToken(sym)
                    ? 512 : isSymAnAssertFunction(sym)
                        ? 64 : -1024;
        }

        let token_bit = 0;

        const
            MULTIPLE_GROUPS = !(group_maps.size == 1),
            if_else_stmts = [];

        if (MULTIPLE_GROUPS) block_depth++;

        //Now create the necessary if statements with peek if depth > 0
        for (const group of [...group_maps.values()].sort((a, b) => b.priority - a.priority)) {
            let _peek_depth = peek_depth;
            const
                pk = peek_depth,
                body = [],
                trs = group.trs,
                syms = [...group.syms.values()],
                AT_END = syms.length == 1 && syms[0] == SymbolType.END_OF_ITEM;

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

            if (runner.ANNOTATED) body.push("//considered syms: " + syms);

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
                        body.push(renderItemSym(items[0], grammar, runner, productions, _peek_depth >= 0));
                        items = items.map(i => i.increment()).filter(i => i);
                        _peek_depth = -1;
                    } else {

                        const
                            items_at_end = items.filter(i => i.atEND),

                            items_not_at_end = items.filter(i => !i.atEND),

                            prod_items = items_not_at_end
                                .filter(i => i.sym(grammar).type == SymbolType.PRODUCTION),

                            term_items = items_not_at_end
                                .filter(i => i.sym(grammar).type != SymbolType.PRODUCTION && i.sym(grammar).type !== SymbolType.PRODUCTION_ASSERTION_FUNCTION),

                            paf_la_items = items_not_at_end
                                .filter(i => i.sym(grammar).type == SymbolType.PRODUCTION_ASSERTION_FUNCTION),

                            new_trs = []
                                .concat(prod_items.map(i => {

                                    const rd_item = ItemToRDItem(i, grammar);

                                    const { closure, COMPLETED } = getPeekAtDepth(rd_item.item, grammar, _peek_depth + 1);

                                    rd_item.closure = closure.setFilter(i => i.id + "-" + i.offset);

                                    // Variant of production is completed at this peek level.
                                    if (COMPLETED) items_at_end.push(i);

                                    return rd_item;
                                }))
                                .concat(term_items.map(i => ItemToRDItem(i, grammar)))
                                .concat(paf_la_items.map(i => ItemToRDItem(i, grammar)))
                                .concat(items_at_end.map(i => ItemToRDItem(i, grammar)));

                        if (new_trs.length > 0) {
                            const has_closures = new_trs.filter(f => f.closure.length > 0);

                            items_at_end.push(...new_trs.filter(f => f.closure.length == 0).map(RDItemToItem));

                            if (runner.ANNOTATED) {
                                body.push("\n//Look Ahead Level " + (_peek_depth + 1));
                                body.push("/*\n" + prod_items.filter(_ => !!_).map(i => i.renderUnformattedWithProduction(grammar)).join("\n"), "*/");
                            }

                            body.push(renderFunctionBody(has_closures, grammar, runner, block_depth + 1, _peek_depth + 1, productions, RETURN_TYPE).stmts);
                        }

                        break;
                    };
                }
            } else {

                //Just complete the grammar symbols
                const item = RDItemToItem(trs[0]);
                if (runner.ANNOTATED) {
                    // body.push("\n//Single Production Completion");
                    // body.push(`\n//peek ${peek_depth}`);
                    // body.push(`\n//block ${block_depth}`);
                    // body.push(`\n//groups ${MULTIPLE_GROUPS}`);
                    body.push("/*\n" + [item].map(i => i.renderUnformattedWithProduction(grammar)).join("\n"), "*/");
                }
                body.push(renderItem(item, grammar, runner, productions, _peek_depth >= 0 && block_depth > 0, 0, RETURN_TYPE));
                //if (item.atEND) IS_SINGLE = true;
            }

            if (MULTIPLE_GROUPS) {
                if (AT_END)
                    if_else_stmts.push(`{\n ${body.join("\n")}\n}`);
                else if (_peek_depth <= 0)
                    if_else_stmts.push(`if(${getIncludeBooleans(tests, grammar, runner, pk > 0 ? "pk" + (pk) : "l")}){\n ${body.join("\n")}\n}`);
                else
                    if_else_stmts.push(`if(!FAILED &&  ${getIncludeBooleans(tests, grammar, runner, pk > 0 ? "pk" + (pk) : "l")}){\n ${body.join("\n")}\n}`);
            } else {
                stmts.push(...body);
            }
        }

        if_else_stmts.sort((a, b) => +(b.slice(0, 2) == "if") - +(a.slice(0, 2) == "if"));

        const unskip = getResetSymbols(rd_items.map(RDItemToItem), grammar);
        const unskippable_symbols = [...sym_map.values(), ...unskip];

        if (MULTIPLE_GROUPS) {
            //Item annotations if required

            if (token_bit) {
                const const_node = ["const"], const_body = [];

                let lx = "l";

                if (peek_depth > 0) {
                    lx = `pk${peek_depth}`;
                    const_body.push(`${lx}:Lexer =_pk( ${peek_depth > 1 ? "pk" + (peek_depth - 1) : "l"}.copy(), /* e.eh, */${getSkipArray(grammar, runner, unskippable_symbols)})`);
                } else
                    stmts.unshift(addSkipCall(grammar, runner, unskippable_symbols));

                const_node.push(const_body.join(","), ";");

                if (const_body.length > 0)
                    stmts.unshift(const_node.join(" "));
            } else
                stmts.unshift(addSkipCall(grammar, runner, unskippable_symbols));

            stmts.push(if_else_stmts.join(" else "));
        } else if (rd_items.map(RDItemToItem).some(i => !i.atEND))
            stmts.unshift(addSkipCall(grammar, runner, unskippable_symbols));
    }

    return { stmts: stmts.join("\n"), sym_map };
}

export function makeRDHybridFunction(production: Production, grammar: Grammar, runner: CompilerRunner): RDProductionFunction {

    const p = production;

    let productions: Set<number> = new Set();

    const stmts = [],

        HAS_ERROR_RECOVERY = !!production.error_recovery,

        INLINE_FUNCTIONS = p.bodies.some(has_INLINE_FUNCTIONS),

        { left: left_recursion_items = [], non: non_left_recursion_items = [] }
            = <{ left: RDItem[], non: RDItem[]; }>Object.fromEntries(p.bodies
                .map(b => BodyToRDItem(b, grammar))
                .groupMap(i => checkForLeftRecursion(p, i, grammar) ? "left" : "non")),

        start_items: RDItem[] = p.bodies.map(b => BodyToRDItem(b, grammar)),

        closure = start_items.map(RDItemToItem);

    if (runner.ANNOTATED) {
        stmts.push("//Production Start");
        stmts.push("/*\n" + closure.filter(_ => !!_).map(i => i.renderUnformattedWithProduction(grammar)).join("\n"), "*/");
    }

    processClosure(closure, grammar, true);

    if (INLINE_FUNCTIONS)
        stmts.push("const s = []");
    //build non left recursive items first
    try {

        // get production states for the givin item 
        // each state is a mini LR item that will be used to yield the goal production on completion. 
        const prod_stmts = [];
        // for (const item of left_recursion_items) {
        const closure = [left_recursion_items.map(RDItemToItem)].flat();
        processClosure(closure, grammar, true);
        const
            lr_items = closure
                .filter(c => c.sym(grammar).type == SymbolType.PRODUCTION)
                .setFilter(i => i.id)
                .groupMap(i => i.sym(grammar).val);
        const rd_items = closure
            .filter(c => c.sym(grammar).type != SymbolType.PRODUCTION)
            .setFilter(i => i.id)
            .map(i => ItemToRDItem(i, grammar));

        if (non_left_recursion_items.length > 0) {
            stmts.push(renderFunctionBody(
                non_left_recursion_items,
                grammar,
                runner, 0, 0,
                productions,
                left_recursion_items.length == 0 ? ReturnType.RETURN : ReturnType.NONE,
                HAS_ERROR_RECOVERY
            ).stmts);
        } else {
            //Use the RD semi production;
            stmts.push(renderFunctionBody(
                rd_items,
                grammar,
                runner, 0, 0,
                productions,
                ReturnType.NONE,
                HAS_ERROR_RECOVERY).stmts
            );
        }

        if (left_recursion_items.length > 0) {
            //Optimization: Productions with identical outcomes are joined into same switch groups
            const outcome_groups = new Map();

            for (const [key, val] of lr_items.entries()) {
                const hash = val
                    .map((i) => (i.increment().atEND || i.len + " " + i.body) + " " + i.getProduction(grammar).id + " " + (<Item>i).body_(grammar)?.reduce_function?.txt).join("");
                getMappedArray(hash, outcome_groups).push([key, val]);
            }

            stmts.push(`while(true){ let ACCEPT = false; switch(prod){`);

            for (const [hash, sw_group] of outcome_groups.entries()) {

                const stmts = [`/* ${hash} */`];

                for (let i = 0; i < sw_group.length; i++) {

                    const key = sw_group[i][0],
                        items = sw_group[i][1];

                    stmts.push(`case ${key}:`);

                    if (runner.ANNOTATED)
                        stmts.push(`/*\n${items.map(i => i.renderUnformattedWithProduction(grammar) + "\n")}\n*/`);

                    if (i == (sw_group.length - 1)) {
                        stmts.push("{");
                        const
                            follow_symbols = [...FOLLOW(grammar, production.id).values()],
                            { stmts: s, sym_map } = renderFunctionBody(items.map(k => ItemToRDItem(k.increment(), grammar)), grammar, runner, 0, 0, productions, ReturnType.ACCEPT, HAS_ERROR_RECOVERY);

                        if (key == production.id)
                            stmts.push(`if(${getIncludeBooleans(follow_symbols, grammar, runner, "l", [...sym_map.values()])}) break;`);

                        stmts.push(s);
                    }

                }

                stmts.push(
                    `}break;`
                );

                prod_stmts.push(stmts.join("\n"));
            }

            stmts.push(...prod_stmts, `} if(!ACCEPT) break; }`);
            //group into sets 
            //strip any item in the closure that is a terminal
            //this cannot possibly yield the root production
            // }
        }

        if (production.recovery_handler) {
            addRecoveryHandlerToFunctionBodyArray(stmts, production, grammar, runner, true);
        } else {
            stmts.push(`if(prod != ${production.id}) fail(l);`);
        }
    } catch (e) {

        console.dir({ name: production.name, error: e });
        return {
            refs: 0,
            id: p.id,
            IS_RD: false,
            fn: `/* Could Not Parse in Recursive Descent Mode */`
        };
    }

    return {
        productions,
        refs: 0,
        id: p.id,
        IS_RD: true,
        fn: `function $${p.name}(l:Lexer) :void{${stmts.join("\n")}}`
    };
}