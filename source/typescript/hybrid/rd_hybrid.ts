import { Grammar, Production, ProductionBody, EOF_SYM, SymbolType } from "../types/grammar.js";
import { AssertionFunctionSymbol, TokenSymbol } from "../types/Symbol";
import { processClosure, Item, FOLLOW, FIRST } from "../util/common.js";
import {
    createNoCheckShift,
    has_INLINE_FUNCTIONS,
    getRootSym,
    getSkipFunction,
    getIncludeBooleans,
    createReduceFunction,
    createDefaultReduceFunction,
    addRecoveryHandlerToFunctionBodyArray,
    addSkipCall,
    isSymSpecified,
    isSymAnAssertFunction,
    getResetSymbols,
    createAssertionShift,
    getMappedArray,
    isSymAProduction,
    getAssertionSymbolFirst,
    getUniqueSymbolName,
    sanitizeSymbolValForComment,
    isSymAGenericType,
    isSymGeneratedSym,
    isSymSpecifiedSymbol,
    isSymGeneratedId,
    isSymSpecifiedIdentifier,
    isSymGeneratedNum,
    isSymSpecifiedNumeric,
    isSymGeneratedWS,
    isSymGeneratedNL
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



function getPeekAtDepth(item: Item, grammar: Grammar, depth = 0, visited = new Set()): { closure: Item[], COMPLETED: boolean; } {
    if (!item || item.atEND) return { closure: [], COMPLETED: true };

    const closure = [item];

    let COMPLETED = false;

    processClosure(closure, grammar, true);

    const out = [];

    // if (depth <= 0) {
    //     return { closure: closure.filter(i => !i.atEND && i.sym(grammar).type != SymbolType.PRODUCTION), COMPLETED, LEFT_RECURSION };
    // } else {
    for (const item of closure) {

        if (item.atEND) { if (depth > 0) COMPLETED = true; continue; }

        const sym = item.sym(grammar);

        if (isSymAProduction(sym)) {
            //If closure contains an item with the production as the current symbol then left recursion has occurred
            if (!visited.has(sym.val) && depth > 0) {
                visited.add(sym.val);
                const { closure: c, COMPLETED: C } = getPeekAtDepth(item, grammar, depth, visited);
                COMPLETED = C || COMPLETED;
                out.push(...c);
            }
            if (depth <= 0)
                out.push(item);
        } else {
            if (depth > 0) {
                const { closure: c, COMPLETED: C } = getPeekAtDepth(item.increment(), grammar, depth - 1);
                COMPLETED = C || COMPLETED;
                out.push(...c);
            } else {
                out.push(item);
            }
        }
    }
    // }

    if (COMPLETED) {
        const data = getPeekAtDepth(item.increment(), grammar, depth - 1);
        data.closure.unshift(...out);
        return data;
    }

    return { closure: out, COMPLETED };
}
function checkForLeftRecursion(p: Production, item: RDItem, grammar: Grammar) {
    // return p.IS_LEFT_RECURSIVE;

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

function doesClosureHaveLR(closure: Item[], grammar: Grammar) {
    for (const item of closure) {

        if (item.atEND) continue;

        const sym = item.sym(grammar);

        if (isSymAProduction(sym) && item.getProductionAtSymbol(grammar).IS_LEFT_RECURSIVE)
            return true;
    }

    return false;
}

function ItemToRDItem(i: Item, grammar: Grammar, body_offset = 0): RDItem {
    const c = [i];
    processClosure(c, grammar, true);
    const HAS_LR = doesClosureHaveLR(c, grammar);
    return <RDItem>{ body_index: i.body, body_offset, off: i.offset, len: i.len, item: i, closure: c, HAS_LR };
}

function BodyToRDItem(b: ProductionBody, grammar: Grammar): RDItem {
    return ItemToRDItem(new Item(b.id, b.length, 0, EOF_SYM), grammar);
}

function renderItemSym(
    item: Item,
    grammar: Grammar,
    runner: CompilerRunner,
    productions: Set<number> = new Set,
    RENDER_WITH_NO_CHECK = false,
    lexer_name: string = "l"
): { DONT_CHECK: boolean, stmts: string; } {

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

            stmts.push(`$${grammar[sym.val].name}(${lexer_name})`);

            RENDER_WITH_NO_CHECK = false;

        } else {
            const inc_item = item.increment(), inc_sym = inc_item.sym(grammar);


            if (RENDER_WITH_NO_CHECK) {
                stmts.push(createNoCheckShift(grammar, runner, lexer_name));

                //RENDER_WITH_NO_CHECK = false;
            } else {

                if (true && !isSymAProduction(item.sym(grammar))) {
                    const syms: TokenSymbol[] = (
                        inc_item.atEND
                            ? [...FOLLOW(grammar, item.getProduction(grammar).id).values()]
                            : isSymAProduction(inc_sym)
                                ? FIRST(grammar, inc_sym)
                                : <TokenSymbol[]>[inc_sym]
                    );
                    stmts.push(addSkipCall(grammar, runner, syms));
                }

                stmts.push(createAssertionShift(grammar, runner, sym, lexer_name));

                RENDER_WITH_NO_CHECK = false;
            }
        }
    }

    return { stmts: stmts.join("\n"), DONT_CHECK: RENDER_WITH_NO_CHECK };
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
    RETURN_TYPE: ReturnType = ReturnType.RETURN,
    lexer_name: string = "l"
): string {

    const stmts = [];

    if (!item.atEND) {

        const { stmts: st, DONT_CHECK: DC } = renderItemSym(item, grammar, runner, productions, DONT_CHECK, lexer_name);
        stmts.push(st);
        if (!DC && !item.increment().atEND) stmts.push("if(!FAILED){");
        stmts.push(renderItem(item.increment(), grammar, runner, productions, DC, RETURN_TYPE, lexer_name));
        if (!DC && !item.increment().atEND) stmts.push("}");
    } else {
        if (!DONT_CHECK) stmts.push("if(!FAILED){");
        stmts.push(`setProduction(${item.getProduction(grammar).id})`);
        stmts.push(renderItemSym(item, grammar, runner, productions, DONT_CHECK, lexer_name).stmts);
        switch (RETURN_TYPE) {
            case ReturnType.ACCEPT:
                stmts.push(`ACCEPT = true;`);
                break;
            case ReturnType.RETURN:
                stmts.push(`return;`);
                break;
            case ReturnType.NONE: break;
        }
        if (!DONT_CHECK) stmts.push(`}/*else probe(${lexer_name})*/`);
    }



    return stmts.join("\n");
}


type TransitionGroup = {
    id: string;
    syms: Set<string>;
    trs: RDItem[];
    priority: number;
};

function renderAnnotatedRDItem(rd_item: RDItem, grammar: Grammar) {
    return `${rd_item.item.renderUnformattedWithProduction(grammar)}`;// \n ${rd_item.closure.map(i => i.renderUnformattedWithProduction(grammar)).join("\n")}`;
}


interface RenderBodyOptions {
    block_depth: number;
    peek_depth: number;
    RETURN_TYPE: ReturnType;

    NO_CHECK: boolean;

}

function generateRBOptions(RT: ReturnType = ReturnType.RETURN, pd: number = 0, bd: number = 0, NC: boolean = false): RenderBodyOptions {
    return {
        peek_depth: pd,
        block_depth: bd,
        RETURN_TYPE: RT,
        NO_CHECK: NC
    };
}
export function renderFunctionBody(
    rd_items: RDItem[],
    grammar: Grammar,
    runner: CompilerRunner,
    productions: Set<number> = new Set,
    options: RenderBodyOptions = generateRBOptions(),
    lexer_name: string = "l",
): ({ stmts: string; sym_map: Map<string, TokenSymbol>; }) {

    let { block_depth, peek_depth, RETURN_TYPE, NO_CHECK } = options;

    const stmts = [], sym_map: Map<string, TokenSymbol> = new Map();

    let HAVE_ONLY_PRODUCTIONS = true;

    if (peek_depth > 3) {
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
            ${rd_items.map(i => renderAnnotatedRDItem(i, grammar)).join("\n")}
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
                stmts.push(`/* ${renderAnnotatedRDItem(i, grammar)} peek ${peek_depth} state: \n${i
                    .closure.map(i => i.renderUnformattedWithProduction(grammar)).join("\n")}*/\n`);

            const syms: string[] = [];

            for (const sym of getTerminalSymsFromClosure(i.closure, grammar)) {
                syms.push(getUniqueSymbolName(sym));
                sym_map.set(getUniqueSymbolName(sym), sym);
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

            if (isSymAnAssertFunction(sym) && isSymAProduction(trs[0].item.sym(grammar))) {
                for (const s of getAssertionSymbolFirst(<AssertionFunctionSymbol>sym, grammar)) {
                    group.syms.add(getUniqueSymbolName(s));
                    sym_map.set(getUniqueSymbolName(s), s);
                }
            } else {
                group.syms.add(symbol_val);
            }

            group.priority +=
                isSymSpecified(sym)
                    ? 1 : isSymAnAssertFunction(sym)
                        ? 64
                        : 1024;
        }

        let token_bit = 0;

        let
            MULTIPLE_GROUPS = !(group_maps.size == 1),
            if_else_stmts = [];

        if (MULTIPLE_GROUPS) {
            block_depth++;
            HAVE_ONLY_PRODUCTIONS = false;
        }

        //Now create the necessary if statements with peek if depth > 0
        for (const group of [...group_maps.values()].sort((a, b) => a.priority - b.priority)) {

            let _peek_depth = peek_depth;
            const
                pk = peek_depth,
                body = [],
                trs = group.trs,
                syms = [...group.syms.values()],
                AT_END = syms.length == 1 && syms[0] == getUniqueSymbolName(EOF_SYM);

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
            let tests = [...syms.map(s => sym_map.get(s))];

            // if (runner.ANNOTATED) body.push("//considered syms: " + tests.map(sanitizeSymbolValForComment).join(" "));

            if (trs.length > 1) {

                //Advance through each symbol until there is a difference
                //When there is a difference create a peek if-else sequence
                let items: Item[] = trs.filter(_ => !!_).map(RDItemToItem).filter(_ => !!_);

                while (true) {
                    const sym = items.map(i => i).filter(i => !i.atEND)?.shift()?.sym(grammar),
                        off = items.filter(i => !i.atEND)?.[0]?.offset;

                    //If any items at end do something
                    //
                    if (off != undefined && sym && !items.some((i) => (i.atEND || (i.sym(grammar)?.val != sym.val)))) {

                        if (_peek_depth >= 0 && HAVE_ONLY_PRODUCTIONS)
                            HAVE_ONLY_PRODUCTIONS = isSymAProduction(sym);

                        //All items transition on the same symbol; resolve body disputes. 
                        body.push(renderItemSym(items[0], grammar, runner, productions, _peek_depth >= 0, lexer_name).stmts);
                        items = items.map(i => i.increment()).filter(i => i);
                        _peek_depth = -1;

                    } else {

                        const
                            items_at_end = items.filter(i => i.atEND),

                            items_not_at_end = items.filter(i => !i.atEND),

                            prod_items = items_not_at_end
                                .filter(i => isSymAProduction(i.sym(grammar))),

                            term_items = items_not_at_end
                                .filter(i => isSymSpecified(i.sym(grammar)) || isSymAGenericType(i.sym(grammar))),

                            paf_la_items = items_not_at_end
                                .filter(i => isSymAnAssertFunction(i.sym(grammar))),

                            new_trs: RDItem[] = []
                                .concat(prod_items.map(i => {

                                    const rd_item = ItemToRDItem(i, grammar);

                                    if (!rd_item.HAS_LR) {

                                        const { closure, COMPLETED } = getPeekAtDepth(rd_item.item, grammar, _peek_depth + 1);

                                        rd_item.closure = closure.setFilter(i => i.id + "-" + i.offset);

                                        // Variant of production is completed at this peek level.
                                        if (COMPLETED) items_at_end.push(i);

                                        rd_item.HAS_LR = doesClosureHaveLR(closure, grammar);
                                    }

                                    return rd_item;
                                }))
                                .concat(term_items.map(i => ItemToRDItem(i, grammar)))
                                .concat(paf_la_items.map(i => ItemToRDItem(i, grammar)))
                                .concat(items_at_end.slice(0, 1).map(i => ItemToRDItem(i, grammar)));


                        if (new_trs.length > 0 || items_at_end.length > 0) {

                            // MULTIPLE_GROUPS = true;

                            token_bit |= TOKEN_BIT.ID;

                            const
                                continuable = new_trs.filter(f => f.closure.length > 0 && (!f.HAS_LR)),
                                has_lr = new_trs.filter(f => f.closure.length > 0 && f.HAS_LR);



                            if (runner.ANNOTATED) {
                                body.push("\n//Look Ahead Level " + (_peek_depth + 1));
                                body.push("/*CONTINUE:" + continuable.map(RDItemToItem).map(i => i.renderUnformattedWithProduction(grammar)).join("\n"), "*/");
                                body.push("/*HAS_LR:" + has_lr.map(RDItemToItem).map(i => i.renderUnformattedWithProduction(grammar)).join("\n"), "*/");
                            }


                            items_at_end.push(...new_trs.filter(f => f.closure.length == 0).map(RDItemToItem));

                            //group has_lr based on sym
                            const lr_groups = has_lr.group(l => getUniqueSymbolName(l.item.sym(grammar)));
                            const lr_lexer_name = lexer_name + 1;

                            if (lr_groups.length > 0) {
                                addCheckpointStart(body, lexer_name, lr_lexer_name);
                                let i = 0;
                                if (continuable.length > 0) lr_groups.push(continuable);

                                for (const grp of lr_groups.sort((a, b) => {
                                    const a_max = a.reduce((r, i) => Math.max(r, i.len), 0);
                                    const b_max = b.reduce((r, i) => Math.max(r, i.len), 0);
                                    a.mm = a_max;
                                    b.mm = b_max;
                                    return b_max - a_max;
                                })
                                ) {

                                    body.push(`/*${grp.mm}*/`);

                                    const str = renderFunctionBody(
                                        grp,
                                        grammar,
                                        runner,
                                        productions,
                                        generateRBOptions(RETURN_TYPE, 0, block_depth + 1),
                                        lr_lexer_name
                                    ).stmts;

                                    if (i++ > 0)
                                        addCheckpointContinue(body, lexer_name, lr_lexer_name, str);
                                    else
                                        body.push(str);
                                }

                                addCheckpointComplete(body, lexer_name, lr_lexer_name);
                            } else if (continuable.length > 0)
                                body.push(renderFunctionBody(
                                    continuable,
                                    grammar,
                                    runner,
                                    productions,
                                    generateRBOptions(RETURN_TYPE, _peek_depth + 1, block_depth + 1),
                                    lexer_name
                                ).stmts);
                        }

                        break;
                    };
                }
            } else {

                //Just complete the grammar symbols
                const item = RDItemToItem(trs[0]);

                if (runner.ANNOTATED) body.push("/*" + renderAnnotatedRDItem(trs[0], grammar) + "*/");

                if (!item.atEND && HAVE_ONLY_PRODUCTIONS)
                    HAVE_ONLY_PRODUCTIONS = isSymAProduction(item.sym(grammar));

                body.push(renderItem(item, grammar, runner, productions, _peek_depth >= 0 && block_depth >= 0, RETURN_TYPE, lexer_name));
            }

            if (MULTIPLE_GROUPS || !HAVE_ONLY_PRODUCTIONS) {
                if (AT_END)
                    if_else_stmts.push(`{\n ${body.join("\n")}\n}`);
                else if (NO_CHECK && HAVE_ONLY_PRODUCTIONS)
                    if_else_stmts.push(`if(!FAILED &&  ${getIncludeBooleans(tests, grammar, runner, pk > 0 ? "pk" + (pk) : lexer_name)}){\n ${body.join("\n")}\n}`);
                else
                    if_else_stmts.push(`if(${getIncludeBooleans(tests, grammar, runner, pk > 0 ? "pk" + (pk) : lexer_name)}){\n ${body.join("\n")}\n}`);
            } else {
                if (HAVE_ONLY_PRODUCTIONS)
                    stmts.push(...body);
                else
                    if_else_stmts.push(`if(${getIncludeBooleans(tests, grammar, runner, pk > 0 ? "pk" + (pk) : lexer_name)}){\n ${body.join("\n")}\n}`);
            }
        }

        const
            unskip = getResetSymbols(rd_items.map(RDItemToItem), grammar),
            unskippable_symbols = [...sym_map.values(), ...unskip];

        //Item annotations if required
        if (if_else_stmts.length > 0) {

            if_else_stmts.sort((a, b) => +(b.slice(0, 2) == "if") - +(a.slice(0, 2) == "if"));

            const const_node = ["const"], const_body = [];

            let lx = lexer_name;

            if (peek_depth > 0) {
                addUnskippableAnnotation(runner, stmts, unskippable_symbols);
                lx = `pk${peek_depth}`;
                const_body.push(`${lx}:Lexer =_pk( ${peek_depth > 1 ? "pk" + (peek_depth - 1) : lexer_name}.copy(), ${getSkipFunction(grammar, runner, unskippable_symbols)})`);
            } else if (!HAVE_ONLY_PRODUCTIONS) {
                addUnskippableAnnotation(runner, stmts, unskippable_symbols);
                stmts.push(addSkipCall(grammar, runner, unskippable_symbols, lexer_name));
            }

            const_node.push(const_body.join(","), ";");

            if (const_body.length > 0)
                stmts.unshift(const_node.join(" "));

            stmts.push(if_else_stmts.join(" else "));
        } else if (!HAVE_ONLY_PRODUCTIONS) {
            addUnskippableAnnotation(runner, stmts, unskippable_symbols);
            stmts.push(addSkipCall(grammar, runner, unskippable_symbols, lexer_name));
        }
    }

    return { stmts: stmts.join("\n"), sym_map };
}

function addCheckpointElseComplete(body: string[], old_lexer_name: string, new_lexer_name: string) {
    body.push(`else ${old_lexer_name}.sync(${new_lexer_name});`);
}

function addCheckpointComplete(body: string[], old_lexer_name: string, new_lexer_name: string) {
    body.push(`if(!FAILED) ${old_lexer_name}.sync(${new_lexer_name});`);
}


function addCheckpointContinue(body: string[], old_lexer_name: string, new_lexer_name: string, str: string, RESET_LEXER: boolean = true) {
    body.push("if(FAILED){");
    body.push(`prod = p;`);
    if (RESET_LEXER) body.push(`${new_lexer_name} = ${old_lexer_name}.copy();`);
    body.push(` FAILED = false;`);
    body.push(` reset(m);`);
    if (str) body.push(str);
    body.push("}");
}

function addCheckpointStart(body: string[], old_lexer_name: string, lr_lexer_name: string) {
    body.push(`let ${lr_lexer_name} = ${old_lexer_name}.copy(), m = mark(), p = prod;`);
}

function addUnskippableAnnotation(runner: CompilerRunner, stmts: string[], unskippable_symbols: TokenSymbol[]) {
    if (runner.ANNOTATED)
        stmts.push(`/* UNSKIPPABLE SYMBOLS: ${unskippable_symbols.map(s => `[${sanitizeSymbolValForComment(s)}]`).join(" ")} */`);
}

export function makeRDHybridFunction(production: Production, grammar: Grammar, runner: CompilerRunner): RDProductionFunction {

    const p = production;

    let productions: Set<number> = new Set();

    const stmts = [],

        INLINE_FUNCTIONS = p.bodies.some(has_INLINE_FUNCTIONS),

        { left: left_recursion_items = [], non: non_left_recursion_items = [] }
            = <{ left: RDItem[], non: RDItem[]; }>Object.fromEntries(p.bodies
                .map(b => BodyToRDItem(b, grammar))
                .groupMap(i => checkForLeftRecursion(p, i, grammar) ? "left" : "non")),

        start_items: RDItem[] = p.bodies.map(b => BodyToRDItem(b, grammar)),

        HAVE_LR = left_recursion_items.length > 0,

        return_type = HAVE_LR ? ReturnType.ACCEPT : ReturnType.NONE,

        closure = start_items.map(RDItemToItem);

    if (runner.ANNOTATED) {
        stmts.push("//Production Start");
        stmts.push("/*\n" + closure.filter(_ => !!_).map(i => i.renderUnformattedWithProduction(grammar)).join("\n"), "*/");
    }

    processClosure(closure, grammar, true);
    //stmts.push(`let g = prod; prod = ${production.id}; probe(l); prod = g;`);
    if (INLINE_FUNCTIONS) stmts.push("const s = []");
    if (HAVE_LR) stmts.push("let ACCEPT = false;");

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
                .groupMap(i => i.sym(grammar).val),
            rd_items = closure
                .filter(c => c.sym(grammar).type != SymbolType.PRODUCTION)
                .setFilter(i => i.id)
                .map(i => ItemToRDItem(i, grammar));

        if (non_left_recursion_items.length > 0) {
            stmts.push(
                renderFunctionBody(
                    non_left_recursion_items,
                    grammar,
                    runner,
                    productions,
                    generateRBOptions(return_type)
                ).stmts);
        } else {
            stmts.push(renderFunctionBody(
                rd_items,
                grammar,
                runner,
                productions,
                generateRBOptions(return_type)
            ).stmts
            );
        }

        if (HAVE_LR) {
            //Optimization: Productions with identical outcomes are joined to the same switch clause
            const outcome_groups = new Map();

            for (const [key, val] of lr_items.entries()) {
                const hash = val
                    .map((i) => (i.increment().atEND || i.len + " " + i.body) + " " + i.getProduction(grammar).id + " " + (<Item>i).body_(grammar)?.reduce_function?.txt).join("");
                getMappedArray(hash, outcome_groups).push([key, val]);
            }

            stmts.push(`while(ACCEPT) {ACCEPT  = false; switch(prod){`);

            for (const [hash, sw_group] of outcome_groups.entries()) {

                const stmts = [];

                for (let i = 0; i < sw_group.length; i++) {

                    const key = sw_group[i][0],
                        items = sw_group[i][1];

                    stmts.push(`case ${key}:`);


                    if (i == (sw_group.length - 1)) {

                        const
                            lex_name = key == production.id ? "pd" : "l",
                            follow_symbols = [...FOLLOW(grammar, production.id).values()],
                            { stmts: s, sym_map } = renderFunctionBody(
                                items.map(k => ItemToRDItem(k.increment(), grammar)),
                                grammar,
                                runner,
                                productions,
                                generateRBOptions(ReturnType.ACCEPT, 0, 1),
                                lex_name
                            );

                        if (key == production.id) {
                            /*   
                                Early exit should only occur if there is an occluding generic ( such as g:sym, g:id ) 
                                that could capture a symbol that would otherwise cause a reduce.  FOLLOW Symbols that 
                                would otherwise be matched match by the generic type should be selected for the early 
                                exit check. If there are no such generics in the excluded  items, then there is no 
                                need to do this check. 
                            */
                            const
                                lookahead_syms = [...follow_symbols.filter(s => isSymGeneratedWS(s) || isSymGeneratedNL(s))],
                                exclude_syms = [...sym_map.values()];

                            if (exclude_syms.some(isSymGeneratedSym))
                                lookahead_syms.push(...follow_symbols.filter(isSymSpecifiedSymbol));

                            if (exclude_syms.some(isSymGeneratedId))
                                lookahead_syms.push(...follow_symbols.filter(isSymSpecifiedIdentifier));

                            if (exclude_syms.some(isSymGeneratedNum))
                                lookahead_syms.push(...follow_symbols.filter(isSymSpecifiedNumeric));

                            if (lookahead_syms.length > 0) {
                                if (runner.ANNOTATED) {
                                    stmts.push(`//FOLLOW SYMS: ${follow_symbols.map(i => `[${i.val}]`).join(" ")}`);
                                    stmts.push(`//EXCLUDE SYMS: ${exclude_syms.map(i => `[${i.val}]`).join(" ")}`);
                                }
                                const booleans = getIncludeBooleans(lookahead_syms, grammar, runner, "l", exclude_syms, false);

                                if (booleans) stmts.push(`if(${booleans}) break;`);
                            }

                            stmts.push("{");
                            addCheckpointStart(stmts, "l", lex_name);
                            stmts.push(s);
                            addCheckpointContinue(stmts, "l", lex_name, "", false);
                            addCheckpointElseComplete(stmts, "l", lex_name);
                            //stmts.push("probe(l)");
                            stmts.push("}");
                        } else
                            stmts.push(s);
                    } else {
                        if (runner.ANNOTATED)
                            stmts.push(`/*\n${items.map(i => i.increment().renderUnformattedWithProduction(grammar)).join("\n")}\n*/`);

                    }
                }

                stmts.push(
                    `break;`
                );

                prod_stmts.push(stmts.join("\n"));
            }

            stmts.push(...prod_stmts, `}}`);
        }

        if (production.recovery_handler) {
            addRecoveryHandlerToFunctionBodyArray(stmts, production, grammar, runner, true);
        } else {
            stmts.push(` if(prod != ${production.id}) fail(l);`);
            //stmts.push(` if(prod != ${production.id}) {FAILED = true;probe(l);}`);
        }
    } catch (e) {

        console.dir({ name: production.name, error: e });
        return {
            productions,
            id: p.id,
            IS_RD: false,
            fn: `/* Could Not Parse in Recursive Descent Mode */`
        };
    }

    return {
        productions,
        id: p.id,
        IS_RD: true,
        fn: `function $${p.name}(l:Lexer) :void{${stmts.join("\n")}}`
    };
}