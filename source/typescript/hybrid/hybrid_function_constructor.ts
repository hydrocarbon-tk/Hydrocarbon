import { Grammar, Production, ProductionBody, EOF_SYM, SymbolType } from "../types/grammar.js";
import { AssertionFunctionSymbol, Symbol, TokenSymbol } from "../types/Symbol";
import { processClosure, Item, FOLLOW, FIRST } from "../util/common.js";
import {
    createNoCheckShift,
    getRootSym,
    getIncludeBooleans,
    createReduceFunction,
    createDefaultReduceFunction,
    addRecoveryHandlerToFunctionBodyArray,
    addSkipCall,
    createAssertionShift,
    getMappedArray,
    isSymAProduction,
    sanitizeSymbolValForComment,
    isSymGeneratedSym,
    isSymSpecifiedSymbol,
    isSymGeneratedId,
    isSymSpecifiedIdentifier,
    isSymGeneratedNum,
    isSymSpecifiedNumeric,
    isSymGeneratedWS,
    isSymGeneratedNL,
    isSymAnAssertFunction,
    getAssertionSymbolFirst,
    isSymSpecified,
    getSkipFunction,
    createSkipCall
} from "./utilities/utilities.js";
import { RDProductionFunction } from "./types/RDProductionFunction";
import { RDItem } from "./types/RDItem";
import { CompilerRunner } from "./types/CompilerRunner.js";
import { AS, BlockSC, ConstSC, CPP, IfSC, RS, SC, VarSC } from "./utilities/skribble.js";
import { TypeKind } from "assemblyscript";
import { ClosureGraph } from "../util/process_closure.js";

const
    failed_global_var = SC.Variable("FAILED:boolean"),
    global_lexer_name = SC.Variable("l:Lexer"),
    accept_loop_flag = SC.Variable("ACCEPT:boolean"),
    production_global = SC.Variable("prod:unsigned int");



interface RenderBodyOptions {
    pk_name: VarSC,
    block_depth: number;
    peek_depth: number;
    RETURN_TYPE: ReturnType;

    NO_CHECK: boolean;

}
function checkForLeftRecursion(p: Production, item: Item, grammar: Grammar, encountered_productions = new Set([p.id])) {
    // return p.IS_LEFT_RECURSIVE;

    const closure_items = [item];

    processClosure(closure_items, grammar, true);

    for (const i of closure_items) {

        const sym = i.sym(grammar);

        if (sym) {

            if (sym.type == "production") {

                if (encountered_productions.has(grammar[sym.val].id))
                    return true;
            }
        }
    }

    return false;
}
function renderItemProduction(
    code_node: SC,
    item: Item,
    grammar: Grammar,
    runner: CompilerRunner,
    productions: Set<number> = new Set,
    RENDER_WITH_NO_CHECK = false,
    lexer_name: VarSC = global_lexer_name,
    RETURN_TYPE: ReturnType
): { code_node: SC; } {


    const production = item.getProduction(grammar);

    productions.add(<number>production.id);

    const _if = SC.If(SC.Call(SC.Constant("$" + production.name), lexer_name));

    code_node.addStatement(_if);

    code_node.addStatement(SC.Empty());

    return { code_node: _if };
}
function renderItemSym(
    code_node: SC,
    item: Item,
    grammar: Grammar,
    runner: CompilerRunner,
    productions: Set<number> = new Set,
    RENDER_WITH_NO_CHECK = false,
    lexer_name: VarSC = global_lexer_name
): { code_node: SC; } {

    const
        body = item.body_(grammar);

    if (item.atEND) {
        if (body.reduce_id >= 0)
            code_node.addStatement(createReduceFunction(item, grammar));
        else if (item.len > 1)
            code_node.addStatement(createDefaultReduceFunction(item));
    } else {
        const sym = getRootSym(item.sym(grammar), grammar);

        if (sym.type == "production") {

            productions.add(<number>sym.val);

            code_node.addStatement(SC.Call(SC.Constant("$" + grammar[sym.val].name), lexer_name));

            RENDER_WITH_NO_CHECK = false;

        } else {
            if (RENDER_WITH_NO_CHECK) {
                code_node.addStatement(createNoCheckShift(grammar, runner, lexer_name));
            } else {
                const syms: TokenSymbol[] = (
                    isSymAProduction(sym)
                        ? FIRST(grammar, sym)
                        : <TokenSymbol[]>[sym]
                );
                //code_node.addStatement(addSkipCall(grammar, runner, syms, lexer_name));
                code_node.addStatement(createAssertionShift(grammar, runner, sym, lexer_name));

                RENDER_WITH_NO_CHECK = false;
            }
        }
    }

    if (!RENDER_WITH_NO_CHECK) {
        const _if = SC.If(SC.UnaryPre(SC.Value("!"), failed_global_var));
        code_node.addStatement(_if);
        code_node.addStatement(SC.Empty());
        return { code_node: _if };
    }

    return { code_node };
}

enum ReturnType {
    ACCEPT = 0,
    RETURN = 1,
    NONE = 2

}

function renderItem(
    code_node: SC,
    item: Item,
    grammar: Grammar,
    runner: CompilerRunner,
    productions: Set<number> = new Set,
    DONT_CHECK = false,
    lexer_name: VarSC = global_lexer_name
): SC {


    if (!item.atEND) {
        const { code_node: leaf } = renderItemSym(code_node, item, grammar, runner, productions, DONT_CHECK, lexer_name);
        const new_item = item.increment();

        if (!new_item.atEND) {
            code_node.addStatement(addSkipCall(grammar, runner, FIRST(grammar, new_item.sym(grammar)), lexer_name));
        }
        code_node = renderItem(leaf, item.increment(), grammar, runner, productions, false, lexer_name);
    } else {

        code_node.addStatement(SC.Assignment(SC.Constant("prod"), SC.Value(item.getProduction(grammar).id)));

        return renderItemSym(code_node, item, grammar, runner, productions, true, lexer_name).code_node;
    }

    return code_node;
}

function addReturnType(RETURN_TYPE: ReturnType, code_node: SC) {
    switch (RETURN_TYPE) {
        case ReturnType.ACCEPT:
            code_node.addStatement(SC.Assignment(accept_loop_flag, SC.True));
            break;
        case ReturnType.RETURN:
            code_node.addStatement(SC.Return);
            break;
        case ReturnType.NONE: break;
    }
}

function generateRDOptions(RT: ReturnType = ReturnType.RETURN, pd: number = 0, bd: number = 0, NC: boolean = false, peek_name = SC.Variable("pk:Lexer")): RenderBodyOptions {
    return {
        pk_name: peek_name,
        peek_depth: pd,
        block_depth: bd,
        RETURN_TYPE: RT,
        NO_CHECK: NC
    };
}
function getGroups(symboled_items: Map<TokenSymbol, Item[]>, grammar: Grammar) {
    const group_maps: Map<string, { syms: Set<TokenSymbol>; items: Item[]; priority: number; }> = new Map;
    for (const [sym, items] of symboled_items) {

        const group_items = items.setFilter(i => i.id);

        const id = group_items.map(i => {
            const PROD_ID = i.getProduction(grammar).id;
            const BODY = i.body;
            const HAS_REDUCE_FUNCTION = !!i.body_(grammar).reduce_function;
            const str = [PROD_ID];
            if (HAS_REDUCE_FUNCTION)
                str.push("b" + BODY);
            return str.join("_") + "_";

            return i.id;
        }).sort().join("");
        if (!group_maps.has(id))
            group_maps.set(id, { syms: new Set, items: group_items, priority: 0 });
        const group = group_maps.get(id);
        if (isSymAnAssertFunction(sym) && isSymAProduction(sym)) {
            for (const s of getAssertionSymbolFirst(<AssertionFunctionSymbol>sym, grammar))
                group.syms.add(getRootSym(s, grammar));
        } else
            group.syms.add(sym);
        group.priority +=
            isSymSpecified(sym)
                ? 1 : isSymAnAssertFunction(sym)
                    ? 64
                    : isSymGeneratedId(sym)
                        ? 1 << 24
                        : 1024;
    }

    return group_maps;
}

function getStrictAccompanyingItems(grammar: Grammar, prod_items: Item[], items: Item[], out: Item[] = [], all = false) {
    const accompanying = getAccompanyingItems(grammar, prod_items, items);
    const prod_id = new Set((accompanying).map(i => i.getProductionAtSymbol(grammar).id));
    if (!prod_items.every(i => prod_id.has(i.getProduction(grammar).id)))
        return [];
    return accompanying;
}

function getAccompanyingItems(grammar: Grammar, prod_items: Item[], items: Item[], out: Item[] = [], all = false) {
    const prod_id = new Set((prod_items).map(i => i.getProduction(grammar).id));

    const to_process = [];
    for (const item of items.reverse()) {
        if (!item || item.atEND) continue;

        const sym = item.sym(grammar);
        if (isSymAProduction(item.sym(grammar)) && prod_id.has(<number>sym.val)) {
            out.push(item);
            if (item.increment().atEND) {
                to_process.push(item);

            }
        }
    }
    if (all)
        for (const item of to_process) {
            getAccompanyingItems(grammar, item.getProduction(grammar).id, items, out, all);
        }
    return out;//.setFilter(i => i.id);
}
function renderItems(rd_items: Item[], grammar: Grammar): string[] {
    return rd_items.map(i => i.renderUnformattedWithProduction(grammar));
}



export function getMinDisambiguatedDepth(items: Item[], grammar: Grammar, depth: number = 0, limit: number = 10): { depth: number, UNAMBIGUOUS: boolean; } {
    if (items.length == 0) return { depth: depth, UNAMBIGUOUS: true };
    if (depth >= limit) return { depth: Infinity, UNAMBIGUOUS: false };

    const closure = items.slice();

    processClosure(closure, grammar, true);

    const
        active_items = closure
            .filter(i => !i.atEND && !!i),

        completed_items = closure
            .filter(i => i.atEND && !!i),

        symboled_items: Map<TokenSymbol, Item[]> = active_items
            .filter(i => i.sym(grammar).type != SymbolType.PRODUCTION)
            .groupMap(i => <TokenSymbol>getRootSym(i.sym(grammar), grammar));

    let COMPLETELY_UNAMBIGUOUS = symboled_items.size > 0 && !(completed_items.length > 0);

    if (completed_items.length > 0)
        depth++;

    if (COMPLETELY_UNAMBIGUOUS)
        for (const [sym, items] of symboled_items.entries()) {
            const [first] = items;
            let new_depth = -1;
            if (items.length == 1) {
                //complete item and get all items that transition on the item's production
                if (depth < 10) {
                    let offset = first.len - first.offset;
                    //let accompanying = getAccompanyingItems(grammar, [first], active_items);
                    new_depth = depth;
                }
            } else {

                let { depth: d, UNAMBIGUOUS: D } = getMinDisambiguatedDepth(items.map(i => i.increment()), grammar, depth + 1);
                new_depth = d;
                if (new_depth != Infinity && new_depth < limit && !D) {
                    let accompanying = getStrictAccompanyingItems(grammar, items, active_items);

                    if (accompanying.length == 0) COMPLETELY_UNAMBIGUOUS = false;

                    while (accompanying.length > 0 && new_depth < limit && !D) {
                        const items = accompanying.map(i => i.increment());
                        let { depth: d, UNAMBIGUOUS: DD } = getMinDisambiguatedDepth(items, grammar, new_depth, limit);
                        D = DD;
                        new_depth = d;

                        accompanying = getStrictAccompanyingItems(grammar, items, active_items);
                    }
                }

                if (!D || new_depth >= 10) COMPLETELY_UNAMBIGUOUS = false;
            }

            depth = Math.max(new_depth, depth);
        }

    return { depth, UNAMBIGUOUS: COMPLETELY_UNAMBIGUOUS };
}

function processProductionChain(
    code_node: SC,
    grammar: Grammar,
    runner: CompilerRunner,
    production: Production,
    productions: Set<number>,
    options: RenderBodyOptions = generateRDOptions(),
    production_items: Item[][],
    accompanying_items: Item[],
    nonterm_shift_items: Item[],
    visited_prods: Set<string> = new Set,
    offset: number = 0,
    filter_production: number = 0,
): SC {
    while (1) {

        accompanying_items = getAccompanyingItems(
            grammar, accompanying_items, (production_items[offset])
                .filter(i => i.getProduction(grammar).id != filter_production)
        );

        filter_production = -1;

        if (accompanying_items.length == 0) {
            break;
        } else if (accompanying_items.length > 1 || accompanying_items.some(i => i.IS_LR)) {
            while (accompanying_items.length > 0) {
                const new_items = accompanying_items.filter(i => !visited_prods.has(i.id));
                new_items.forEach(i => visited_prods.add(i.id));
                nonterm_shift_items.push(...new_items);
                accompanying_items = getAccompanyingItems(grammar, new_items, production_items[offset]);
            }
            break;
        } else {
            const first = accompanying_items[0].increment();

            code_node = renderItem(code_node, first, grammar, runner, productions, true);
            //render item
            const p = first.getProduction(grammar);

            if (p.id == production.id) {
                addReturnType(options.RETURN_TYPE, code_node);
                break;
            };
            accompanying_items = [first];
            break;
        }
    }
    return code_node;
}
export function renderFunctionBody(
    rd_items: Item[],
    graph: ClosureGraph,
    grammar: Grammar,
    runner: CompilerRunner,
    production: Production,
    productions: Set<number> = new Set,
    options: RenderBodyOptions = generateRDOptions(),
    production_items: Item[][] = null,
    offset = 0,
    peek_offset = 0
): ({ sym_map: Map<TokenSymbol, any>, sc: SC; }) {

    const WAS_PEEKING = peek_offset !== offset;

    if (offset > 1) {
        //console.log(getMinDisambiguatedDepth(rd_items, grammar));
        //console.log("overflow", rd_items.map(i => i.renderUnformattedWithProduction(grammar)));
        return { sc: new SC, sym_map: new Map };
    }

    const nonterm_shift_items = [],

        code_node = new SC,

        true_items = rd_items.filter(_ => _),

        active_items = true_items.filter(i => !i.atEND),

        completed_items = true_items.filter(i => i.atEND),

        production_completed_items = completed_items
            .filter(i => i?.decrement()?.sym(grammar)?.type == SymbolType.PRODUCTION),

        terminal_completed_items = completed_items
            .filter(i => i?.decrement()?.sym(grammar)?.type != SymbolType.PRODUCTION),

        symboled_items = active_items
            .filter(i => i.sym(grammar).type != SymbolType.PRODUCTION),

        symboled_items_map: Map<TokenSymbol, Item[]> = symboled_items
            .groupMap(i => <TokenSymbol>getRootSym(i.sym(grammar), grammar)),

        group_maps: Map<string, { syms: Set<TokenSymbol>, items: Item[]; priority: number; }> = getGroups(symboled_items_map, grammar),

        visited_prods: Set<string> = new Set();

    let leaf: SC = null, root: SC = leaf;

    for (let { syms: s, items } of group_maps.values()) {
        const syms = [...s.values()];

        let peek = 0;
        let _if: SC = SC.If(getIncludeBooleans(syms, grammar, runner));
        let accompanying_items = items;
        let filter_production = -1;
        const { UNAMBIGUOUS, depth: ambiguous_depth } = getMinDisambiguatedDepth(items, grammar);

        _if.addStatement(SC.Comment(`${UNAMBIGUOUS ? `Unambiguous` : `Ambiguous`} Depth ${ambiguous_depth}`));

        if (!UNAMBIGUOUS) {
            peek = peek_offset;
            _if.addStatement(SC.Comment(`Peeking at depth: ${(offset) - peek} was_peeking:${WAS_PEEKING}`));
        } else peek = offset + 1;

        if (items.length > 1)
            _if.addStatement(SC.Comment(`Multiple items on [ ${syms.map(s => s.val).join(" ")} ] \n    ` + renderItems(items, grammar).join("\n    ") + "\n"));

        if (graph && items.length > 1) {

            const root = graph.getCommonRoot(...items);

            if (root.roots.length > 0) {
                const closest_root = root.roots[0].item;
                //    / if (closest_root.getProduction(grammar).id !== production.id)
                const common_root = closest_root;

                _if.addStatement(SC.Comment("Common Root:\n" + closest_root.renderUnformattedWithProduction(grammar)));
                //  items = [common_root];
            }

        }

        let [first] = items;

        if (items.length > 1) {
            _if.addStatement(SC.Comment(`Multiple items on [ ${syms.map(s => s.val).join(" ")} ] \n    ` + renderItems(items, grammar).join("\n    ") + "\n"));

            const SAME_PRODUCTION = items.setFilter(i => i.getProduction(grammar).id).length == 1;
            if (SAME_PRODUCTION)
                _if.addStatement(SC.Comment(`All are from the same production`));

            // Get minimum number of steps need to resolve multiple transitions. If it exceeds some 
            // predetermined limit, then use alternative such as speculative parsing.
            const { graph, closure } = processClosure(items.map(i => i.increment()), grammar, true);
            let sc = new SC;
            try {

                sc = renderFunctionBody(
                    closure, graph,
                    grammar, runner, production, productions,
                    options,
                    [
                        ...production_items,
                        closure.setFilter(s => s.id)
                            .filter(closure => !closure.atEND)
                            .filter(closure => closure.sym(grammar).type == SymbolType.PRODUCTION)
                    ],
                    offset + 1,
                    peek
                ).sc;



                const sc1 = renderItemSym(_if, first, grammar, runner, productions, true).code_node;

                sc1.addStatement(sc);

                if (leaf) {
                    leaf.addStatement(_if);
                    leaf = _if;
                } else {
                    leaf = _if;
                    root = leaf;
                }

            } catch (e) {
                if (offset == 0 || items.every(i => i.offset == 0)/* && e instanceof AmbiguousParse*/) {
                    //*
                    const root2 = new SC;
                    let _if;
                    const cp = SC.Variable("cp");
                    root2.addStatement(SC.Declare(SC.Variable("cp:Lexer")));
                    root2.addStatement(SC.Comment(`Collision found on symbol [ ${syms.map(s => s.val).join(" ")} ] \n ${renderItems(items, grammar).join("\n    ")} \n  Using backtracking \n error:\n${e.message + e.stack}`));
                    for (const item of items.setFilter(i => i.getProduction(grammar).id)) {
                        const production = item.getProduction(grammar);
                        const follow = [...FOLLOW(grammar, production.id).values()];
                        const skip = createSkipCall(grammar, runner, cp, follow);
                        const bools = getIncludeBooleans(follow, grammar, runner, skip, []);
                        const temp = SC.If(
                            SC.Binary(
                                SC.Call(
                                    "$" + production.name,
                                    SC.Assignment(cp, SC.Call(SC.Member(global_lexer_name, "copy")))), "&&",
                                bools)
                        ).addStatement(
                            SC.Call(SC.Member(global_lexer_name, "sync"), cp)
                        );
                        temp.addStatement(SC.Comment(`Trying ${production.name}`));
                        temp.addStatement(SC.Empty());
                        if (_if) temp.addStatement(_if);
                        _if = temp;
                    }


                    root2.addStatement(_if);

                    if (leaf) {
                        leaf.addStatement(root2);
                        leaf = root2;
                    } else {
                        leaf = root2;
                        root = leaf;
                    }//*/
                } else {
                    throw e;
                }
            }

        } else {

            const AT_END = first.increment().atEND;

            //Need to pull in all items that transition on this production
            if (leaf) {
                leaf.addStatement(_if);
                leaf = _if;
            } else {
                leaf = _if;
                root = leaf;
            }
            if (AT_END)
                _if.addStatement(SC.Comment(`Single item on [ ${syms.map(s => s.val).join(" ")} ] to reduce \n    ` + renderItems(items, grammar).join("\n    ") + "\n"));
            else
                _if.addStatement(SC.Comment(`Items that are expecting production [ ${first.getProduction(grammar).name} ]  \n    `));

            if (first.offset == 0 && first.getProduction(grammar).id != production.id) {
                _if = renderItemProduction(_if, first, grammar, runner, productions, true, global_lexer_name, options.RETURN_TYPE).code_node;
            } else {
                //render out the item
                _if = renderItem(_if, first, grammar, runner, productions, true);
                addReturnType(options.RETURN_TYPE, _if);
            }

            filter_production = (first.getProduction(grammar).id != production.id) ? first.getProduction(grammar).id : -1;

            _if.addStatement(SC.Empty());
        }
        _if = processProductionChain(
            _if, grammar, runner,
            production, productions,
            options, production_items,
            accompanying_items,
            nonterm_shift_items, visited_prods,
            offset, filter_production
        );
    }
    code_node.addStatement(SC.Comment("Terminal Completed Items:\n" + terminal_completed_items.map(i => i.renderUnformattedWithProduction(grammar)).join("\n")));
    /**
     * At this point, items that have reached their end are processed. 
     * Any item that transitioned to the end on a terminal will simply
     * be included in a else statement that serves as the fall back action
     * in the case the current token doesn't match any items that would
     * cause a shift. 
     */
    for (const item of terminal_completed_items) {
        let _if: SC = SC.If();

        _if = renderItem(_if, item, grammar, runner, productions, true);
        addReturnType(options.RETURN_TYPE, _if);

        _if = processProductionChain(
            _if, grammar, runner,
            production, productions,
            options, production_items,
            [item],
            nonterm_shift_items, visited_prods,
            offset
        );

        if (leaf) {
            leaf.addStatement(_if);
            leaf = _if;
        } else {
            leaf = _if;
            root = leaf;
        }
    }

    /* If there are any completed items that do not transition from a production
    // then throw. This results from multiple productions resulting in an ambiguous parse 
    if (production_completed_items.some(i => i?.decrement()?.sym(grammar)?.type != SymbolType.PRODUCTION)) {

        code_node.addStatement(SC.Comment("FAILED_COMPLETE:\n" + production_completed_items.map(i => i.renderUnformattedWithProduction(grammar)).join("\n")));
        //return ({ sc: code_node, _if: null, sym_map: symboled_items });
        throw new AmbiguousParse("Unresolved items: \n" +
            production_completed_items
                .filter(i => i?.decrement()?.sym(grammar)?.type != SymbolType.PRODUCTION)
                .map(i => i.renderUnformattedWithProduction(grammar))
                .join("\n")
        );
    }*/

    nonterm_shift_items.push(...production_completed_items.map(i => i.decrement()));

    code_node.addStatement(root);

    let _if = renderProductionShifts(nonterm_shift_items, grammar, runner, production, productions, code_node, production_items[offset]);

    if (code_node == _if) {
        _if = leaf || code_node;
    }

    return ({ sc: code_node, _if, sym_map: symboled_items_map });
}

function renderProductionShifts(
    nonterm_shift_items: Item[],
    grammar: Grammar,
    runner: CompilerRunner,
    production: Production,
    productions: Set<number>,
    code_node: SC,
    production_items: Item[]
) {
    if (nonterm_shift_items.length > 0) {



        const lr_items = nonterm_shift_items
            .setFilter(i => i.id)
            .groupMap(i => i.sym(grammar).val),
            production_io_map = nonterm_shift_items.reduce((r, i) => {

                const trans_production = i.getProductionAtSymbol(grammar).id;
                if (!r.has(trans_production))
                    r.set(trans_production, []);
                r.get(trans_production).push(i.getProduction(grammar).id);
                return r;
            }, new Map),
            outcome_groups = new Map();

        let HAS_PRODUCTION_RECURSION = false;

        for (const prod_ids of production_io_map.values()) {
            HAS_PRODUCTION_RECURSION = HAS_PRODUCTION_RECURSION || prod_ids.some(id => production_io_map.has(id));
            if (HAS_PRODUCTION_RECURSION) break;
        }


        const RETURN_TYPE = HAS_PRODUCTION_RECURSION ? ReturnType.ACCEPT : ReturnType.NONE;

        //Optimization: Productions with identical outcomes are joined to the same switch clause

        for (const [key, val] of lr_items.entries()) {
            const hash = val
                .map((i) => (i.increment().atEND || i.len + " " + i.body) + " " + i.getProduction(grammar).id + " " + (<Item>i).body_(grammar)?.reduce_function?.txt).join("");
            getMappedArray(hash, outcome_groups).push([key, val]);
        }

        const switch_node = SC.Switch(production_global);

        code_node.addStatement(SC.Comment("Production Items:\n" + production_items.map(i => i.renderUnformattedWithProduction(grammar)).join("\n")));


        for (const [, sw_group] of outcome_groups.entries()) {

            for (let i = 0; i < sw_group.length; i++) {

                const
                    key = sw_group[i][0],
                    if_node = SC.If(SC.Value(key));

                switch_node.addStatement(if_node);


                if (i == (sw_group.length - 1)) {

                    const
                        shift_items = sw_group[i][1].map(i => i.increment()).filter(i => !i.atEND),
                        end_items = sw_group[i][1].map(i => i.increment()).filter(i => i.atEND),
                        lex_name = global_lexer_name,
                        follow_symbols = [...FOLLOW(grammar, production.id).values()];

                    let
                        active_node = if_node;

                    if (shift_items.length > 0)
                        if_node.addStatement(SC.Comment(`Items that shift on production \n    ` + renderItems(shift_items, grammar).join("\n    ") + "\n"));
                    if (end_items.length > 0)
                        if_node.addStatement(SC.Comment(`Items that reduce on production \n    ` + renderItems(end_items, grammar).join("\n    ") + "\n"));

                    if (shift_items.length > 0) {

                        const d = shift_items.slice();

                        if (key != production.id)
                            processClosure(d, grammar, true);
                        const { sym_map, sc, _if: __if } = renderFunctionBody(
                            d,
                            null,
                            grammar,
                            runner,
                            production,
                            productions,
                            generateRDOptions(RETURN_TYPE, 0, 1),
                            [/*production_items*/[]]
                        );

                        active_node = __if;

                        if_node.addStatement(addSkipCall(grammar, runner, [...sym_map.keys()], global_lexer_name));

                        if (key == production.id) {
                            /*
                                Early exit should only occur if there is an occluding generic ( such as g:sym, g:id )
                                that could capture a symbol that would otherwise cause a reduce.  FOLLOW Symbols that
                                would otherwise be matched match by the generic type should be selected for the early
                                exit check. If there are no such generics in the excluded  items, then there is no
                                need to do this check.
                            */
                            const block_node = SC.If(SC.Empty()),
                                // l_lex_name = addCheckpointStart(block_node, lex_name),
                                lookahead_syms = [...follow_symbols.filter(s => isSymGeneratedWS(s) || isSymGeneratedNL(s))],
                                exclude_syms = [...sym_map.values()];

                            if (exclude_syms.some(isSymGeneratedSym))
                                lookahead_syms.push(...follow_symbols.filter(isSymSpecifiedSymbol));

                            if (exclude_syms.some(isSymGeneratedId))
                                lookahead_syms.push(...follow_symbols.filter(isSymSpecifiedIdentifier));

                            if (exclude_syms.some(isSymGeneratedNum))
                                lookahead_syms.push(...follow_symbols.filter(isSymSpecifiedNumeric));

                            if (lookahead_syms.length > 0) {
                                const booleans = getIncludeBooleans(lookahead_syms, grammar, runner, global_lexer_name, exclude_syms, false);

                                if (booleans)
                                    if_node.addStatement(SC.If(booleans).addStatement(SC.Break));
                            }
                            block_node.addStatement(sc);
                            // const _if = addCheckpointContinue(block_node, lex_name, l_lex_name, null, false);

                            block_node.addStatement(SC.Empty());
                            // addCheckpointElseComplete(_if, global_lexer_name, l_lex_name);
                            if_node.addStatement(block_node);
                        } else {
                            if_node.addStatement(sc);
                        }
                    }

                    for (const item of end_items) {
                        if (shift_items.length > 0) {
                            const _if = SC.If();
                            const sc = renderItem(_if, item, grammar, runner, productions, true);
                            addReturnType(ReturnType.ACCEPT, sc);
                            active_node.addStatement(sc);
                        } else {
                            renderItem(active_node, item, grammar, runner, productions, true);
                            addReturnType(ReturnType.ACCEPT, active_node);
                        }
                    }
                    if_node.addStatement(SC.Break);
                }
            }
        }

        const _if = SC.If(SC.Value([...production_io_map.keys()].map(i => "prod==" + i).join(" || ")));

        code_node.addStatement(_if);

        if (HAS_PRODUCTION_RECURSION) {
            const
                while_node = SC.While(SC.Value("1"));
            while_node.addStatement(SC.Declare(SC.Assignment(accept_loop_flag, SC.False)));
            while_node.addStatement(switch_node);
            while_node.addStatement(SC.If(SC.UnaryPre(SC.Value("!"), accept_loop_flag)).addStatement(SC.Break));
            _if.addStatement(while_node);
        } else {
            _if.addStatement(switch_node);
        }

        return _if;
    }

    return code_node;
}

export function constructHybridFunction(production: Production, grammar: Grammar, runner: CompilerRunner): RDProductionFunction {

    const
        p = production,
        code_node = SC.Function(SC.Constant("$" + production.name + ":bool"), global_lexer_name),
        stmts = [],
        productions: Set<number> = new Set();

    let items: Item[] = p.bodies.map(b => new Item(b.id, b.length, 0, EOF_SYM));

    const { graph } = processClosure(items, grammar, true);

    items.forEach(i => (i.IS_LR = checkForLeftRecursion(i.getProduction(grammar), i, grammar), i));

    /*
    code_node.addStatement(
        SC.If(SC.Value("true")).addStatement(
            SC.Declare(SC.Assignment("p:unsigned int", "prod")),
            SC.Assignment("prod", 1000000 + production.id),
            SC.Call("probe", "l:Lexer"),
            SC.Assignment("prod", "p:unsigned int")

        )
    );
    //*/

    try {

        const
            production_items = items.filter(i => i.sym(grammar) && isSymAProduction(i.sym(grammar))),
            sc =
                renderFunctionBody(
                    items,
                    graph,
                    grammar,
                    runner,
                    production,
                    productions,
                    generateRDOptions(ReturnType.NONE),
                    [production_items]
                ).sc;


        code_node.addStatement(sc);

        code_node.addStatement(SC.Declare(SC.Assignment("SUCCESS:bool", SC.Binary(production_global, SC.Value("=="), SC.Value(production.id)))));

        if (production.recovery_handler)
            addRecoveryHandlerToFunctionBodyArray(stmts, production, grammar, runner, true);
        else
            code_node.addStatement(SC.If(
                SC.Binary(SC.UnaryPre("!", SC.Value("SUCCESS")), "&&", SC.UnaryPre("!", SC.Value("FAILED"))))
                .addStatement(
                    SC.Call(SC.Constant("fail"), global_lexer_name),
                    SC.Empty()
                )
            );

        /*
        code_node.addStatement(
            SC.If(SC.Value("true")).addStatement(
                SC.Declare(SC.Assignment("p:unsigned int", "prod")),
                SC.Assignment("prod", 1000000 + production.id),
                SC.Call("probe", "l:Lexer"),
                SC.Assignment("prod", "p:unsigned int")

            )
        );
        //*/
        code_node.addStatement(SC.UnaryPre(SC.Return, SC.Value("SUCCESS")));

    } catch (e) {

        return {
            productions,
            id: p.id,
            fn: code_node.addStatement(SC.Expressions(SC.Comment(`Could Not Parse [${production.name}] in Recursive Descent Mode \n${e.message + e.stack + ""}\n`)))
        };
    }

    return {
        productions,
        id: p.id,
        fn: code_node
    };
}
