import { Grammar, Production, EOF_SYM, SymbolType } from "../types/grammar.js";
import { AssertionFunctionSymbol, TokenSymbol } from "../types/Symbol";
import { Item, FOLLOW, FIRST, doesItemHaveLeftRecursion, getCommonAncestors, getTransitionTree, TransitionTreeNode, getUnskippableSymbolsFromClosure }
    from "../util/common.js";
import {
    createNoCheckShift,
    getRootSym,
    getIncludeBooleans,
    createReduceFunction,
    createDefaultReduceFunction,
    addSkipCall,
    createAssertionShift,
    getMappedArray,
    isSymAProduction,
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
    g_lexer_name,
    addFollowCheckCall
} from "./utilities/utilities.js";
import { RDProductionFunction } from "./types/RDProductionFunction";
import { CompilerRunner } from "./types/CompilerRunner.js";
import { ConstSC, SC, VarSC } from "./utilities/skribble.js";
import { getClosure } from "../util/process_closure.js";

const
    accept_loop_flag = SC.Variable("ACCEPT:boolean"),
    production_global = SC.Variable("prod:unsigned int");



interface RenderBodyOptions {
    /**
     * Source grammar for the language
     */
    grammar?: Grammar;
    /**
     * Active Compiler Runner
     */
    runner?: CompilerRunner,
    /**
     * Production currently being processed
     */
    production?: Production,
    /**
     * List of all production ids referenced
     */
    productions?: Set<number>;
    pk_name: VarSC,
    block_depth: number;
    peek_depth: number;
    RETURN_TYPE: ReturnType;
    NO_CHECK: boolean;
}
enum ReturnType {
    ACCEPT = 0,
    RETURN = 1,
    NONE = 2

}

function renderProduction(
    code_node: SC,
    production: Production,
    grammar: Grammar,
    runner: CompilerRunner,
    productions: Set<number> = new Set,
    lexer_name: VarSC = g_lexer_name,
    USE_IF: boolean = true
): { code_node: SC; } {

    productions.add(<number>production.id);

    if (USE_IF) {
        const _if = SC.If(SC.Call(SC.Constant("$" + production.name), lexer_name));
        code_node.addStatement(_if);
        code_node.addStatement(SC.Empty());
        return { code_node: _if };
    } else {
        code_node.addStatement(SC.Call(SC.Constant("$" + production.name), lexer_name));
        return { code_node };
    }
}

function renderItemProduction(
    code_node: SC,
    item: Item,
    grammar: Grammar,
    runner: CompilerRunner,
    productions: Set<number> = new Set,
    lexer_name: VarSC = g_lexer_name,
    USE_IF: boolean = true
): { code_node: SC; } {
    const production = item.offset == 0 ? item.getProduction(grammar)
        : item.getProductionAtSymbol(grammar) ?? item.getProduction(grammar);
    return renderProduction(code_node, production, grammar, runner, productions, lexer_name, USE_IF);
}
function renderItemReduction(
    code_node: SC,
    item: Item,
    grammar: Grammar
) {
    const body = item.body_(grammar);

    if (body.reduce_id >= 0)
        code_node.addStatement(createReduceFunction(item, grammar));
    else if (item.len > 1)
        code_node.addStatement(createDefaultReduceFunction(item));
}

function renderItemSym(
    code_node: SC,
    item: Item,
    grammar: Grammar,
    runner: CompilerRunner,
    productions: Set<number> = new Set,
    RENDER_WITH_NO_CHECK = false,
    lexer_name: VarSC = g_lexer_name
): { code_node: SC; } {

    let bool_expression = null;

    if (item.atEND) {
        renderItemReduction(code_node, item, grammar);
    } else {
        const sym = getRootSym(item.sym(grammar), grammar);

        if (sym.type == "production") {

            productions.add(<number>sym.val);

            bool_expression = SC.Call(SC.Constant("$" + grammar[sym.val].name), lexer_name);

            RENDER_WITH_NO_CHECK = false;

        } else {
            if (RENDER_WITH_NO_CHECK) {
                code_node.addStatement(createNoCheckShift(grammar, runner, lexer_name));
            } else {
                bool_expression = createAssertionShift(grammar, runner, sym, lexer_name).expressions[0];

                RENDER_WITH_NO_CHECK = false;
            }
        }
    }

    if (!RENDER_WITH_NO_CHECK) {
        const _if = SC.If(bool_expression);
        code_node.addStatement(_if);
        code_node.addStatement(SC.Empty());
        return { code_node: _if };
    } else if (bool_expression) {
        code_node.addStatement(bool_expression);
    }

    return { code_node };
}

function renderItem(
    code_node: SC,
    item: Item,
    grammar: Grammar,
    runner: CompilerRunner,
    productions: Set<number> = new Set,
    DONT_CHECK = false,
    lexer_name: VarSC = g_lexer_name
): SC {


    if (!item.atEND) {
        const { code_node: leaf } = renderItemSym(code_node, item, grammar, runner, productions, DONT_CHECK, lexer_name);
        const new_item = item.increment();

        if (!new_item.atEND) {
            const { reset_sym } = grammar.item_map.get(item.id);
            const no_skip = [...FIRST(grammar, new_item.sym(grammar)), ...reset_sym.map(i => grammar.meta.all_symbols.get(i))];

            leaf.addStatement(addSkipCall(grammar, runner, no_skip, lexer_name));
        }

        code_node = renderItem(leaf, item.increment(), grammar, runner, productions, false, lexer_name);
    } else {
        return renderItemSym(code_node, item, grammar, runner, productions, true, lexer_name).code_node;
    }

    return code_node;
}

function addReturnType(RETURN_TYPE: ReturnType, code_node: SC = new SC) {
    switch (RETURN_TYPE) {
        case ReturnType.ACCEPT:
            code_node.addStatement(SC.Assignment(accept_loop_flag, SC.True));
            break;
        case ReturnType.RETURN:
            code_node.addStatement(SC.Return);
            break;
        case ReturnType.NONE: break;
    }

    return code_node;
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

function getAccompanyingItems(grammar: Grammar, active_productions: number[], items: Item[], out: Item[] = [], all = false) {

    const prod_id = new Set(active_productions);

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
    return out;
}

function incrementLexerName(sc: VarSC | ConstSC) {
    const name = sc.value.includes("pk") ? sc.value : "pk";
    return SC.Variable(name + 1 + ":Lexer");
}

function getNoSkipSymbolsFromPeekNode(peek_nodes: TransitionTreeNode, grammar: Grammar, current_production_id: number = -1): TokenSymbol[] {
    return peek_nodes.next.map(i => <TokenSymbol>grammar.meta.all_symbols.get(i.sym));
}

function* buildPeekTree(
    peek_nodes: TransitionTreeNode[],
    grammar: Grammar,
    runner: CompilerRunner,
    lex_name: VarSC,
    current_production_id: number = -1,
    ALLOW_FALL_THROUGH: boolean = true
): Iterator<{ _if: SC, items: Item[]; }, { _if: SC, items: Item[], leaf: SC; }> {
    let _if = null, leaf = null, root = null;
    const grouped_nodes = peek_nodes.group(i => {
        return "_" + i.roots.map(i => i.id).sort().join("__") + "_";
    }).sort((a, b) => {
        const count = a[0].final_count - b[0].final_count;
        if (count == 0) {
            return a.length - b.length;
        }
        return count;
    });

    ALLOW_FALL_THROUGH = ALLOW_FALL_THROUGH && grouped_nodes.length > 1;

    let i = 0;
    for (const nodes of grouped_nodes) {

        i++;

        // Each peek node represents one symbol and a set of next values.
        // combine next values and filter out duplicates based on symbol
        const unskippable = nodes.flatMap(n => n.unskippable);
        const syms = nodes.map(i => <TokenSymbol>grammar.meta.all_symbols.get(i.sym));
        const next = nodes.flatMap(i => i.next).setFilter(i => i.sym);
        const roots = nodes[0].roots;
        const prod_id = roots[0].getProduction(grammar).id;
        /**
         * IF all current root items of the same production and they are
         * all at the initial state, then use this as an
         * to exit the peek and allow that production to be called. 
         * Check to make sure the current production function is not the one 
         * being called to prevent a live lock to prevent infinite recursion.
         */
        const SAME_ROOTS = current_production_id != prod_id
            && roots.every(r => r.getProduction(grammar).id == prod_id)
            && roots.every(r => r.offset == 0);


        _if = i == grouped_nodes.length && ALLOW_FALL_THROUGH ? SC.If() : SC.If(getIncludeBooleans(syms, grammar, runner, lex_name));

        if (leaf) leaf.addStatement(_if);
        if (!root) root = _if;
        leaf = _if;

        if (next.length == 0 || SAME_ROOTS) {
            yield ({
                _if,
                items: roots
            });

            _if.addStatement(SC.Empty());
        } else {
            _if.addStatement(addSkipCall(grammar, runner, syms, <any>SC.Call(SC.Member(lex_name, "next"))));
            const gen = buildPeekTree(next, grammar, runner, lex_name, current_production_id, true);
            let val = gen.next();
            while (!val.done) {
                yield val.value;
                val = gen.next();
            }
            _if.addStatement(val.value._if);
        }
    }

    if (leaf) leaf.addStatement(SC.Empty());

    return {
        _if: root || new SC, leaf, items: []
    };
}

function addItemListComment(sc: SC, items: Item[], grammar: Grammar) {
    sc.addStatement(SC.Comment(items.map(i => i.renderUnformattedWithProduction(grammar)).join("\n")));
}

function addClauseSuccessCheck(code_node: SC, production: Production, grammar: Grammar, runner: CompilerRunner) {
    const condition = SC.Binary(production_global, SC.Value("=="), SC.Value(production.id));
    code_node.addStatement(SC.UnaryPre(SC.Return, SC.Call("assertSuccess", g_lexer_name, condition)));
    return;
}


function doItemsHaveSameSymbol(items: Item[], grammar: Grammar) {
    return items.every(i => !i.atEND && i.sym(grammar).val == items[0].sym(grammar).val);
}

function getCommonAncestorAmongstSets(descendants: Item[], set_b: Item[], grammar: Grammar): Production[] {
    const ancestors = getCommonAncestors(grammar, descendants);
    const matching_productions = ([
        ...ancestors.map(i => i.getProductionAtSymbol(grammar).id).setFilter(),
        ...set_b.map(i => i.getProductionAtSymbol(grammar).id).setFilter()
    ]).group(i => i).filter(i => i.length > 1).map(i => grammar[i[0]]);

    return matching_productions;
}

function* createBacktrackingSequence(
    items: Item[],
    root: SC,
    grammar: Grammar,
    runner: CompilerRunner,
    production: Production,
    productions: Set<number>,
    options: RenderBodyOptions,
    lex_name: VarSC,
    offset: number
): Generator<{ prods: number[], _if: SC, filter_productions: number[]; }, SC> {

    let filter_productions = [], i = 0;

    const cp = incrementLexerName(lex_name || g_lexer_name);
    const mark = SC.Variable("mk:unsigned int");

    root.addStatement(SC.Declare(cp));
    root.addStatement(SC.Declare(SC.Assignment(mark, SC.Call("mark"))));
    for (const item of items) {

        const prod = item.offset == 0 ? item.getProduction(grammar) : item.getProductionAtSymbol(grammar) ?? item.getProduction(grammar);

        let temp,
            a = SC.Call("reset", mark),
            b = SC.Binary(
                SC.Call(
                    "$" + prod.name,
                    SC.Assignment(cp, SC.Call(SC.Member(lex_name, "copy")))), "&&",
                addFollowCheckCall(grammar, runner, prod, cp)
            ),
            c = SC.Binary(
                a, "&&",
                b
            );

        temp = SC.If(i++ == 0 ? b : c);
        const _if = renderItem(temp, item.increment(), grammar, runner, productions, false, cp);
        temp.addStatement(SC.Empty());
        productions.add(prod.id);
        root.addStatement(temp, SC.Empty());
        _if.addStatement(SC.Call(SC.Member(lex_name, "sync"), cp));
        yield ({ prods: [item.getProduction(grammar).id], _if, filter_productions });
    }

    return root;
}
function* createMultiItemSequence(
    items: Item[],
    production_lr_items: Item[],
    code_node: SC,
    grammar: Grammar,
    runner: CompilerRunner,
    production: Production,
    productions: Set<number>,
    options: RenderBodyOptions,
    production_items: Item[],
    lex_name: VarSC,
    offset: number = 0,
    INITIAL: boolean = false,
    ALLOW_FALL_THROUGH: boolean = true
): Generator<{ prods: number[], _if: SC, filter_productions: number[]; }, SC> {


    let
        filter_productions = [],
        root: SC = null;

    const
        SAME_PRODUCTION = items.setFilter(i => i.getProduction(grammar).id).length == 1,
        SAME_SYMBOL = doItemsHaveSameSymbol(items, grammar),
        max_item_offset = items.reduce((r, i) => Math.max(i.offset, r), 0),
        first_production = items[0].getProduction(grammar),
        ROOT_PRODUCTION = SAME_PRODUCTION && first_production.id == production.id;

    /**
    * If all items are from the same production and the current production function is NOT processing
    * that production, simply do a call to that production function. 
    * 
    * This should only occur if all items are at the initial shift state or peek was used
    * to get to this offset.
    */
    if (SAME_PRODUCTION && !ROOT_PRODUCTION && (max_item_offset == 0)) {
        const first = items[0];
        items = [new Item(first.body, first.len, 0, first.follow)];
        yield* createSingleItemSequence(items, production_lr_items, code_node, grammar, runner, production, productions, options, lex_name);

        return code_node;
    }

    const matching_productions = getCommonAncestorAmongstSets(items, production_lr_items, grammar);

    if (matching_productions.length > 0 && !INITIAL) {
        code_node.addStatement(SC.Comment(items.map(i => i.renderUnformattedWithProduction(grammar)).join("\n")));
        const prod = matching_productions[0];
        filter_productions.push((items[0].getProduction(grammar).id != production.id) ? items[0].getProduction(grammar).id : -1);
        code_node = renderProduction(code_node, prod, grammar, runner, productions, lex_name, false).code_node;


        yield { _if: code_node, prods: [prod.id], filter_productions };
        return code_node;
    }

    if (SAME_SYMBOL && (offset > 0 || ROOT_PRODUCTION || SAME_PRODUCTION)) {

        let NO_CHECK = INITIAL;

        while (items.every(i => !i.atEND && i.sym(grammar).val == items[0].sym(grammar).val)) {
            code_node = renderItemSym(code_node, items[0], grammar, runner, productions, NO_CHECK).code_node;
            root = root || code_node;
            items = items.map(i => i.increment());
            NO_CHECK = false;
        }

        try {
            if (items.length > 0) {
                const { node: sc, production_id } = createShiftAndComplete(items, grammar, runner, production, productions, production_items, options, -1);
                code_node.mergeStatement(sc);
                code_node.addStatement(SC.Empty());
                yield { _if: null, filter_productions: [], prods: [...production_id.values()] };
            }
        } catch (e) {
            code_node.addStatement(SC.Empty());
            yield { _if: code_node, filter_productions, prods: [] };
        }

        return root;
    }

    const
        { tree_nodes } = getTransitionTree(grammar, items, 10, 8),
        peek_name = SC.Variable("pk:Lexer"),
        no_skip = getNoSkipSymbolsFromPeekNode(tree_nodes[0], grammar),
        next = tree_nodes[0].next,
        gen = buildPeekTree(next, grammar, runner, peek_name, production.id, ALLOW_FALL_THROUGH);

    let val = gen.next(), block_count = 0;

    while (!val.done) {
        block_count++;
        const { _if: __if, items } = val.value, [first] = items,
            SAME_PRODUCTION = items.setFilter(i => i.getProduction(grammar).id).length == 1;
        const prod = first.getProduction(grammar);

        if (offset == 0 && SAME_PRODUCTION && INITIAL && prod.id !== prod.id) {
            filter_productions.push((first.getProduction(grammar).id != production.id) ? items[0].getProduction(grammar).id : -1);
            renderProduction(__if, prod, grammar, runner, productions, lex_name, false);
        } else if (items.length > 1) {
            const SAME_SYMBOL = doItemsHaveSameSymbol(items, grammar);
            if ((INITIAL && SAME_PRODUCTION)) {
                yield* createMultiItemSequence(items, production_lr_items, __if, grammar, runner, production, productions, options, production_items, lex_name, 0, true);
            } else if (SAME_SYMBOL) {
                yield* createMultiItemSequence(items, production_lr_items, __if, grammar, runner, production, productions, options, production_items, lex_name, offset + 1);
            } else {
                __if.addStatement(SC.Comment("AAAA"));
                yield* createBacktrackingSequence(items, __if, grammar, runner, production, productions, options, lex_name, offset);
            }
        } else {
            const prod_id = prod.id;
            filter_productions.push((prod_id != production.id) ? prod_id : -1);
            /**
             * If the item is at the start of the offset, then we can simply call into the items production
             * to reduce the amount of processing done in the calling function
             */
            const _if = renderItem(__if, first, grammar, runner, productions, true);
            yield { _if, filter_productions, prods: [prod_id] };
        }

        val = gen.next();
    }

    if (block_count > 1) {

        if (INITIAL) {
            code_node.addStatement(SC.Declare(SC.Assignment(peek_name, SC.Call(SC.Member(lex_name, "copy")))));
            code_node.addStatement(addSkipCall(grammar, runner, no_skip, SC.Call(SC.Member(peek_name, "next"))));
        } else
            code_node.addStatement(SC.Declare(SC.Assignment(peek_name, SC.Call(SC.Member(lex_name, "copy")))));

        const __if = val.value.leaf;

        code_node.addStatement(val.value._if);
        code_node.addStatement(SC.Empty());
        code_node = __if;
    } else {
        code_node.addStatement(...val.value._if.statements);

    }

    code_node.addStatement(SC.Empty());

    return val.value.leaf;
}

/**
 * Create code that handles cases of items reaching their end point. If multiple items
 * are found to be completed, then follow is used to determine which production should
 * be used.
 */
function* addEndItemSequence(
    end_items: Item[],
    grammar: Grammar,
    runner: CompilerRunner,
    productions: Set<number>,
    options: RenderBodyOptions,
    USE_IF: boolean
): Generator<{ prods: number[], _if: SC; }, SC> {
    USE_IF = USE_IF || end_items.length > 1;
    let node = null, root = null;
    for (let i = 0; i < end_items.length; i++) {
        const item = end_items[i];
        if (USE_IF) {
            const _if = SC.If(
                (i == end_items.length - 1 && end_items.length > 1) ? undefined :
                    addFollowCheckCall(grammar, runner, item.getProduction(grammar), <any>SC.Call(SC.Member(g_lexer_name, "copy")))
            );
            const sc = renderItem(_if, item, grammar, runner, productions, true);
            yield { prods: itemsToProductions([item], grammar), _if };
            if (!node) {
                node = _if;
                root = _if;
            } else {
                node.addStatement(_if);
                node = _if;
            }
        } else {
            root = new SC;
            const _if = renderItem(root, item, grammar, runner, productions, true);
            yield { prods: itemsToProductions([item], grammar), _if };
        }
    }

    return root;
}

function* createSingleItemSequence(
    items: Item[],
    production_lr_items: Item[],
    _if: SC,
    grammar: Grammar,
    runner: CompilerRunner,
    production: Production,
    productions: Set<number>,
    options: RenderBodyOptions,
    lex_name: VarSC,
    offset: number = 0
): Generator<{ prods: number[], _if: SC, filter_productions: number[]; }, SC> {

    let
        [first] = items,
        prods = itemsToProductions(items, grammar),
        filter_productions = [],
        matching_productions = getCommonAncestorAmongstSets(items, production_lr_items, grammar);

    if (offset > 0 && matching_productions.length > 0) {
        const prod = matching_productions[0];
        filter_productions.push((items[0].getProduction(grammar).id != production.id) ? items[0].getProduction(grammar).id : -1);
        renderProduction(_if, prod, grammar, runner, productions, lex_name, false);
        prods = [prod.id];
    } else if (first.offset == 0 && first.getProduction(grammar).id != production.id) {
        _if = renderItemProduction(_if, first, grammar, runner, productions, lex_name, true).code_node;
    } else {
        _if = renderItem(_if, first, grammar, runner, productions, true, lex_name);
    }

    filter_productions.push((first.getProduction(grammar).id != production.id) ? first.getProduction(grammar).id : -1);

    _if.addStatement(SC.Empty());

    yield { prods, _if, filter_productions };

    return _if;
}

export function createFunctionBody(
    rd_items: Item[],
    grammar: Grammar,
    runner: CompilerRunner,
    production: Production,
    productions: Set<number> = new Set,
    options: RenderBodyOptions = generateRDOptions(),
    lex_name: VarSC = g_lexer_name

): ({ sym_map: Map<TokenSymbol, any>, sc: SC; _if: SC; }) {
    let CAN_DISAMBIGUATE = true;

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

        production_shift_items = active_items
            .filter(i => i.sym(grammar).type == SymbolType.PRODUCTION),

        symboled_items_map: Map<TokenSymbol, Item[]> = symboled_items
            .groupMap(i => <TokenSymbol>getRootSym(i.sym(grammar), grammar)),

        group_maps: Map<string, { syms: Set<TokenSymbol>, items: Item[]; priority: number; }> = getGroups(symboled_items_map, grammar);

    let leaf: SC = null, root: SC = leaf;

    const cd = [];
    let _if = new SC, leaf_count = 0;

    let prod_ids: Set<number> = new Set;

    for (let { syms: s, items } of group_maps.values()) {

        const syms = [...s.values()];

        _if = SC.If(getIncludeBooleans(syms, grammar, runner, lex_name));

        if (leaf) {
            leaf.addStatement(_if);
            leaf = _if;
        } else
            root = leaf = _if;

        const gen = (items.length > 1)
            ? createMultiItemSequence(items, production_shift_items, _if, grammar, runner, production, productions, options, production_shift_items, lex_name, 0, true)
            : createSingleItemSequence(items, production_shift_items, _if, grammar, runner, production, productions, options, lex_name, 0);

        for (const { prods, _if: __if, filter_productions } of gen) {
            if (__if) {

                leaf_count++;

                for (const id of processProductionChain(
                    __if, grammar, runner,
                    production, productions,
                    options, production_shift_items,
                    prods, filter_productions, false
                )) prod_ids.add(id);

                _if = __if;
            } else {
                for (const id of prods)
                    prod_ids.add(id);
            }
        }
    }


    /**
     * At this point, items that have reached their end are processed. 
     * Any item that transitioned to the end on a terminal will simply
     * be included in a else statement that serves as the fall back action
     * in the case the current token doesn't match any items that would
     * cause a shift. 
     */

    if (terminal_completed_items.length > 0) {
        let val;
        const gen = addEndItemSequence(terminal_completed_items, grammar, runner, productions, options, !!leaf);
        while (!(val = gen.next()).done) {
            const { _if, prods } = val.value;
            for (const id of processProductionChain(
                _if, grammar, runner,
                production, productions,
                options, production_shift_items,
                prods, [], true
            )) prod_ids.add(id);
        };
        const end = val.value;

        if (leaf) {
            leaf.addStatement(end);
            leaf = end;
        } else {
            leaf = end;
            root = leaf;
        }
    }

    nonterm_shift_items.push(...production_completed_items.map(i => i.decrement()));

    code_node.addStatement(root);

    code_node.addStatement(SC.Comment("PRODS: " + [...prod_ids.values()].join(" ")));

    const lr_shifts = addProductionShifts(production_shift_items, grammar, runner, production, productions, production_shift_items, options, prod_ids);

    if (leaf_count == 1)
        _if.addStatement(lr_shifts, SC.Empty());
    else
        code_node.addStatement(lr_shifts);

    if (code_node == _if) _if = leaf || code_node;


    return ({ sc: code_node, _if, sym_map: symboled_items_map });
}

function processProductionChain(
    code_node: SC,
    grammar: Grammar,
    runner: CompilerRunner,
    production: Production,
    productions: Set<number>,
    options: RenderBodyOptions = generateRDOptions(),
    production_items: Item[],
    active_productions: number[],
    filter_productions: number[] = [],
    SINGLE_REDUCE_ONLY = false
): number[] {
    let active_items: Item[] = [];

    let prod = active_productions, visited_prods: Set<string> = new Set;

    const items = (production_items).filter(i => !filter_productions.includes(i.getProduction(grammar).id));

    active_items = getAccompanyingItems(grammar, active_productions, items);

    if (active_items.length == 0) {
        code_node.addStatement(SC.Assignment(production_global, prod[0]));
        return prod;
    }

    if (active_items.length == 1 && active_items.every(i => i.len == 1)) {

        prod.length = 1;
        while (active_items.length == 1 && active_items.every(i => i.len == 1)) {
            prod[0] = active_items[0].getProduction(grammar).id;
            renderItemReduction(code_node, active_items[0], grammar);
            active_items = getAccompanyingItems(grammar, itemsToProductions(active_items, grammar), production_items);
        }
    }

    code_node.addStatement(SC.Assignment(production_global, prod[0]));

    if (active_items.length > 0) {

        if (active_items.some(i => doesItemHaveLeftRecursion(i, grammar)) || SINGLE_REDUCE_ONLY) {
            while (active_items.length > 0) {
                const new_items = active_items.filter(i => !visited_prods.has(i.id));
                new_items.forEach(i => visited_prods.add(i.id));
                active_items = getAccompanyingItems(grammar, itemsToProductions(new_items, grammar), production_items);
            }
        } else if (!SINGLE_REDUCE_ONLY) {
            const { node: sc, production_id } = createShiftAndComplete(active_items.map(i => i.increment()), grammar, runner, production, productions, production_items, options, -1);
            code_node.addStatement(sc);
            active_items = getAccompanyingItems(grammar, itemsToProductions(active_items, grammar), production_items);

            prod = [...production_id.values()];

            while (active_items.length > 0) {
                const new_items = active_items.filter(i => !visited_prods.has(i.id));
                new_items.forEach(i => visited_prods.add(i.id));
                active_items = getAccompanyingItems(grammar, itemsToProductions(new_items, grammar), production_items);
            }
        }
    }
    return prod;
}

function itemsToProductions(items: Item[], grammar: Grammar): number[] {
    return items.map(i => i.getProduction(grammar).id);
}

function addProductionShifts(
    nonterm_shift_items: Item[],
    grammar: Grammar,
    runner: CompilerRunner,
    production: Production,
    productions: Set<number>,
    production_items: Item[],
    options: RenderBodyOptions,
    production_id: Set<number> = new Set,
): SC {



    let code_node: SC = new SC;

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
            outcome_groups: Map<string, [number, Item[]][]> = new Map();

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
            getMappedArray(hash, outcome_groups).push([<number>key, val]);
        }


        const
            case_clauses = new Map,
            case_array = [];

        let ACTIVE_KEY,
            pending_productions = [...production_id.values()],
            active_productions = new Set;


        for (const [, sw_group] of outcome_groups.entries()) {

            for (let i = 0; i < sw_group.length; i++) {

                const key = sw_group[i][0];

                if (i == (sw_group.length - 1)) {
                    const keys = sw_group.map(sw => sw[0]),
                        block = SC.If(),
                        options = generateRDOptions(RETURN_TYPE, production.id),
                        { node, production_id: sub_ids, PURE_COMPLETE } = createShiftAndComplete(sw_group[i][1].map(i => i.increment()), grammar, runner, production, productions, production_items, options, key);
                    for (const id of sub_ids.values()) production_id.add(id);
                    block.addStatement(node, SC.Empty());
                    for (const key of keys)
                        case_clauses.set(key, { code_node: block, PURE_COMPLETE, keys, sub_ids });
                }
            }
        }

        for (let i = 0; i < pending_productions.length; i++) {
            const prod = pending_productions[i];
            active_productions.add(prod);
            if (case_clauses.has(prod)) {

                const { code_node, PURE_COMPLETE, sub_ids, keys } = case_clauses.get(prod);

                if (!PURE_COMPLETE || keys.some(key => production_id.has(key))) {
                    case_array.push([keys, code_node]);

                    for (const key of keys)
                        active_productions.add(key);

                    for (const prod of sub_ids)
                        if (!active_productions.has(prod))
                            pending_productions.push(prod);
                }

            }
        }

        code_node.addStatement(SC.Comment("FULL PRODS: " + [...case_clauses.keys()].join(" ")));

        if (case_array.length > 0) {
            const NOT_USING_SWITCH = case_array.length == 1,
                switch_node = NOT_USING_SWITCH
                    ? new SC
                    : SC.Switch(production_global),
                ACTIVE_KEY = case_array[0][0][0];

            switch_node.addStatement(
                ...case_array.sort((a, b) => a[0][0] - b[0][0]).flatMap(a => NOT_USING_SWITCH
                    ? a[1].statements
                    : [
                        ...a[0].slice(0, -1).map(i => SC.If(SC.Value(i + ""))),
                        SC.If(SC.Value(a[0].slice(-1)[0] + "")).addStatement(a[1], SC.Break)
                    ]
                )
            );

            if (HAS_PRODUCTION_RECURSION) {

                const
                    while_node = NOT_USING_SWITCH
                        ? SC.While(SC.Binary("prod", "==", ACTIVE_KEY))
                        : SC.While(SC.Value("1"));

                if (runner.ANNOTATED)
                    while_node.addStatement(SC.Value(`console.log("PRODUCTION LR", {prod, tx:str.slice(l.off, l.off + l.tl), FAILED, offset:l.off, name:"${production.name}"})`));

                while_node.addStatement(SC.Declare(SC.Assignment(accept_loop_flag, SC.False)));
                while_node.addStatement(switch_node);
                while_node.addStatement(SC.If(SC.UnaryPre(SC.Value("!"), accept_loop_flag)).addStatement(SC.Break));
                code_node.addStatement(while_node);
            } else {
                if (runner.ANNOTATED)
                    code_node.addStatement(SC.Value(`console.log("PRODUCTION SHIFTS", {prod, tx:str.slice(l.off, l.off + l.tl), FAILED, offset:l.off, name:"${production.name}"})`));
                code_node.addStatement(switch_node);
            }
        }
    }
    return code_node;
}

function createShiftAndComplete(
    items: Item[],
    grammar: Grammar,
    runner: CompilerRunner,
    production: Production,
    productions: Set<number>,
    production_items: Item[],
    options: RenderBodyOptions,
    key: any
): { production_id: Set<number>, node: SC, PURE_COMPLETE: boolean; } {
    let if_node = new SC;
    const
        shift_items = items.filter(i => !i.atEND),
        end_items = items.filter(i => i.atEND),
        lex_name = g_lexer_name,
        follow_symbols = [...FOLLOW(grammar, production.id).values()],
        production_id: Set<number> = new Set,
        PURE_COMPLETE = end_items.length == 1 && shift_items.length == 0;

    let active_node = null, ALLOW_FALL_THROUGH = end_items.length == 0 && key != production.id;

    if (shift_items.length > 0) {

        //process the shift item to completion. 
        const
            closure = getClosure(shift_items.slice(), grammar),
            syms = [...closure.filter(i => !i.atEND && !isSymAProduction(i.sym(grammar))).map(i => <TokenSymbol>i.sym(grammar))],
            unskippable = [...syms, ...getUnskippableSymbolsFromClosure(closure, grammar)];

        if (shift_items.length == 1) {
            //Simply confirm the current token is within the shift items first set then 

            let _if: SC = SC.If(getIncludeBooleans(syms, grammar, runner, lex_name, []));
            const inner_if = renderItem(_if, shift_items[0], grammar, runner, productions, true);
            active_node = _if;
            if_node.addStatement(addSkipCall(grammar, runner, unskippable, lex_name));
            if_node.addStatement(_if);
            for (const prod of processProductionChain(
                inner_if, grammar, runner,
                production, productions,
                options, production_items,
                itemsToProductions(shift_items, grammar), [], true
            )) production_id.add(prod);
            addReturnType(options.RETURN_TYPE, inner_if);

        } else {

            let d: Item[] = shift_items.slice(),
                node = new SC, val = null;

            const gen = createMultiItemSequence(d, [], node, grammar, runner, production, productions, options, production_items, lex_name, 0, false, ALLOW_FALL_THROUGH);

            while (!(val = gen.next()).done) {
                const { _if, prods, filter_productions } = val.value;
                if (_if) {
                    for (const prod of processProductionChain(
                        _if, grammar, runner,
                        production, productions,
                        options, production_items,
                        prods, [], true
                    )) production_id.add(prod);
                    addReturnType(options.RETURN_TYPE, _if);
                }
            };
            active_node = val.value;

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
                    exclude_syms = unskippable;

                if (exclude_syms.some(isSymGeneratedSym))
                    lookahead_syms.push(...follow_symbols.filter(isSymSpecifiedSymbol));

                if (exclude_syms.some(isSymGeneratedId))
                    lookahead_syms.push(...follow_symbols.filter(isSymSpecifiedIdentifier));

                if (exclude_syms.some(isSymGeneratedNum))
                    lookahead_syms.push(...follow_symbols.filter(isSymSpecifiedNumeric));

                if_node.addStatement(addSkipCall(grammar, runner, [...exclude_syms, ...lookahead_syms], lex_name));

                if (lookahead_syms.length > 0) {
                    const booleans = getIncludeBooleans(lookahead_syms, grammar, runner, g_lexer_name, exclude_syms, false);

                    if (booleans)
                        if_node.addStatement(SC.If(booleans).addStatement(SC.Break));
                }
                if_node.addStatement(node);
                if_node.addStatement(SC.Empty());

            } else {
                if_node.addStatement(addSkipCall(grammar, runner, unskippable, lex_name));
                if_node.addStatement(node);
            }
        }
    }

    if (end_items.length > 0) {
        let val;
        const gen = addEndItemSequence(end_items, grammar, runner, productions, options, shift_items.length > 0);
        while (!(val = gen.next()).done) {
            const { _if, prods, filter_productions } = val.value;
            for (const prod of processProductionChain(
                _if, grammar, runner,
                production, productions,
                options, production_items,
                prods, [], true
            )) production_id.add(prod);
            addReturnType(options.RETURN_TYPE, _if);
        };
        const end = val.value;

        if (!active_node) {
            if_node.addStatement(end);
        } else {
            active_node.addStatement(end);
        }
    }

    return { node: if_node, production_id, PURE_COMPLETE };
}

export function constructHybridFunction(production: Production, grammar: Grammar, runner: CompilerRunner): RDProductionFunction {
    const
        p = production,
        code_node = SC.Function(SC.Constant("$" + production.name + ":bool"), g_lexer_name),
        productions: Set<number> = new Set();

    let items: Item[] = p.bodies.map(b => new Item(b.id, b.length, 0, EOF_SYM));

    const annotation = SC.Expressions(SC.Comment(
        `
    production name: ${production.name}
    grammar index: ${production.id}
    bodies: 
    \t${items.map(i => i.renderUnformattedWithProduction(grammar)).join("\n\t\t")}`));


    try {

        items = getClosure(items, grammar);

        //*
        const
            sc =
                createFunctionBody(
                    items,
                    grammar,
                    runner,
                    production,
                    productions,
                    generateRDOptions(ReturnType.NONE),
                    g_lexer_name
                ).sc;
        if (runner.ANNOTATED)
            code_node.addStatement(SC.Value(`console.log("PRODUCTION START", {prod, tx:str.slice(l.off, l.off + l.tl), ty:l.ty, tl:l.tl, utf:l.getUTF(), FAILED, offset:l.off, name:"${production.name}"})`));

        code_node.addStatement(sc);

        if (runner.ANNOTATED)
            code_node.addStatement(SC.Value(`console.log("PRODUCTION END", {prod, tx:str.slice(l.off, l.off + l.tl), FAILED, offset:l.off, name:"${production.name}"})`));
        //*/

        addClauseSuccessCheck(code_node, production, grammar, runner);

        return {
            productions,
            id: p.id,
            fn: (new SC).addStatement(
                annotation,
                code_node
            )
        };
    } catch (e) {

        return {
            productions,
            id: p.id,
            fn: code_node.addStatement(annotation, SC.Expressions(SC.Comment(`Could Not Parse [${production.name}] in Recursive Descent Mode \n${e.message + e.stack + ""}\n`)))
        };
    }

}
