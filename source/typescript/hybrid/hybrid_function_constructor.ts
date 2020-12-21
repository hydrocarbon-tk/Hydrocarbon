import { Grammar, Production, EOF_SYM, SymbolType, ItemMapEntry } from "../types/grammar.js";
import { AssertionFunctionSymbol, TokenSymbol } from "../types/Symbol";
import { Item, FOLLOW, FIRST, doesItemHaveLeftRecursion, doesSymbolLeadToRightRecursion, getCommonAncestors, getTransitionTree, PeekNode }
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

    grammar?: Grammar;
    runner?: CompilerRunner,
    production?: Production,
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

function checkForLeftRecursion(p: Production, item: Item, grammar: Grammar, encountered_productions = new Set([p.id])) {
    return !!(grammar.item_map.get(item.id).LR);
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

function renderItemSym(
    code_node: SC,
    item: Item,
    grammar: Grammar,
    runner: CompilerRunner,
    productions: Set<number> = new Set,
    RENDER_WITH_NO_CHECK = false,
    lexer_name: VarSC = g_lexer_name
): { code_node: SC; } {

    const
        body = item.body_(grammar);

    let bool_expression = null;//SC.UnaryPre(SC.Value("!"), failed_global_var);

    if (item.atEND) {
        if (body.reduce_id >= 0)
            code_node.addStatement(createReduceFunction(item, grammar));
        else if (item.len > 1)
            code_node.addStatement(createDefaultReduceFunction(item));
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
                const syms: TokenSymbol[] = (
                    isSymAProduction(sym)
                        ? FIRST(grammar, sym)
                        : <TokenSymbol[]>[sym]
                );

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

        if (!new_item.atEND)
            leaf.addStatement(addSkipCall(grammar, runner, FIRST(grammar, new_item.sym(grammar)), lexer_name));

        code_node = renderItem(leaf, item.increment(), grammar, runner, productions, false, lexer_name);
    } else {

        code_node.addStatement(SC.Assignment(SC.Constant("prod"), SC.Value(item.getProduction(grammar).id)));

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
    return out;
}

function incrementLexerName(sc: VarSC | ConstSC) {
    const name = sc.value.includes("pk") ? sc.value : "pk";
    return SC.Variable(name + 1 + ":Lexer");
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
    filter_productions: number[] = [],
): SC {
    while (1) {


        accompanying_items = getAccompanyingItems(
            grammar, accompanying_items, (production_items[offset])
                .filter(i => !filter_productions.includes(i.getProduction(grammar).id))
        );

        filter_productions.length = 0;

        if (accompanying_items.length == 0) {
            break;
        } else if (accompanying_items.length > 0 || accompanying_items.some(i => doesItemHaveLeftRecursion(i, grammar))) {
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


function getItemData(item_id: string, grammar: Grammar): ItemMapEntry {
    return grammar.item_map.get(item_id);
}

function getMaxDistance(
    grammar: Grammar,
    production: Production,
    items: Item[]
): number {
    const prod_bodies = production.bodies.map(b => new Item(b.id, b.length, 0, EOF_SYM).id);
    const prod_depth = Math.max(...prod_bodies.map(i => getItemData(i, grammar)).map(n => n.depth));
    const item_depth = Math.max(...items.map(i => getItemData(i.id, grammar)).map(n => Math.abs(n.depth - prod_depth)));
    return item_depth;
}

function getNoSkipSymbolsFromPeekNode(peek_nodes: PeekNode, grammar: Grammar): TokenSymbol[] {
    return peek_nodes.next.map(i => <TokenSymbol>grammar.meta.all_symbols.get(i.sym));
}

function* buildPeekTree(peek_nodes: PeekNode[], grammar: Grammar, runner: CompilerRunner, lex_name: VarSC): Iterator<{ _if: SC, items: Item[]; }, { _if: SC, items: Item[]; }> {
    let _if = null, leaf = null, root = null;
    for (const nodes of peek_nodes.group(i => {
        return "_" + i.roots.map(i => i.id).sort().join("__") + "_";
    })) {

        // Each peek node represents one symbol and a set of next values.
        // combine next values and filter out duplicates based on symbol
        const syms = nodes.map(i => <TokenSymbol>grammar.meta.all_symbols.get(i.sym));
        const next = nodes.flatMap(i => i.next).setFilter(i => i.sym);
        const roots = nodes[0].roots;

        _if = SC.If(getIncludeBooleans(syms, grammar, runner, lex_name));
        if (leaf) leaf.addStatement(_if);
        if (!root) root = _if;
        leaf = _if;

        if (next.length == 0) {
            yield ({
                _if,
                items: roots
            });

            _if.addStatement(SC.Empty());
        } else {
            _if.addStatement(addSkipCall(grammar, runner, syms, <any>SC.Call(SC.Member(lex_name, "next"))));
            const gen = buildPeekTree(next, grammar, runner, lex_name);
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

function renderClauseSuccessCheck(code_node: SC, production: Production, grammar: Grammar, runner: CompilerRunner) {
    code_node.addStatement(SC.Declare(SC.Assignment("SUCCESS:bool", SC.Binary(production_global, SC.Value("=="), SC.Value(production.id)))));
    code_node.addStatement(SC.If(
        SC.Binary(SC.UnaryPre("!", SC.Value("SUCCESS")), "&&", SC.UnaryPre("!", SC.Value("FAILED"))))
        .addStatement(
            SC.Call(SC.Constant("fail"), g_lexer_name),
            SC.Empty()
        )
    );
    code_node.addStatement(SC.UnaryPre(SC.Return, SC.Value("SUCCESS")));
}

function createBacktrackingSequence(
    items: Item[],
    _if: SC,
    grammar: Grammar,
    runner: CompilerRunner,
    production: Production,
    productions: Set<number>,
    options: RenderBodyOptions,
    lex_name: VarSC,
    offset: number
): { items: Item[], _if: SC, filter_productions: number[]; } {

    let filter_productions = [];
    let leaf = new SC;

    const cp = incrementLexerName(lex_name || g_lexer_name);
    const mark = SC.Variable("mk:unsigned int");
    const own_items = items.filter(i => i.getProduction(grammar).id == production.id).setFilter(i => i.getProduction(grammar).id);
    const other_items = items;//.filter(i => i.getProduction(grammar).id != production.id).setFilter(i => i.getProduction(grammar).id);

    _if.addStatement(SC.Declare(cp));
    _if.addStatement(SC.Declare(SC.Assignment(mark, SC.Call("mark"))));
    _if.addStatement(leaf);

    if (false && offset == 0) {

        for (const item of own_items) {
            renderItemSym(leaf, item, grammar, runner, productions, true, cp);
            //Render this out normally
            const closure = getClosure([item.increment()], grammar);

            const { sc } = renderFunctionBody(
                closure,
                grammar,
                runner,
                production,
                productions,
                generateRDOptions(ReturnType.ACCEPT),
                [[], closure.filter(i => isSymAProduction(i.sym(grammar)))],
                cp,
                offset + 1
            );

            leaf.addStatement(sc);
            const _if = SC.If(SC.Binary("prod", "==", production.id)).addStatement(
                SC.Call(SC.Member(lex_name, "sync"), cp),
                addReturnType(options.RETURN_TYPE),
                SC.Empty()
            );

            leaf.addStatement(_if);
            leaf = _if;
        }
    } else {
        //other_items.unshift(...own_items);
    }

    leaf.addStatement(SC.Comment("Item count:" + other_items.length));

    for (const item of other_items) {

        const prod = item.offset == 0 ? item.getProduction(grammar) : item.getProductionAtSymbol(grammar) ?? item.getProduction(grammar);

        let temp;
        temp = SC.If(
            SC.Binary(
                SC.Call("reset", mark), "&&",
                SC.Binary(

                    SC.Call(
                        "$" + prod.name,
                        SC.Assignment(cp, SC.Call(SC.Member(lex_name, "copy")))), "&&",
                    addFollowCheckCall(grammar, runner, prod, cp)
                )
            )
        ).addStatement(
            SC.Call(SC.Member(lex_name, "sync"), cp),
        );
        renderItem(temp, item.increment(), grammar, runner, productions);
        addReturnType(options.RETURN_TYPE, temp);
        temp.addStatement(SC.Empty());
        productions.add(prod.id);

        leaf.addStatement(temp);
        leaf = temp;
    }

    return { items, _if, filter_productions };
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
function createMultiItemSequence(
    items: Item[],
    production_lr_items: Item[],
    _if: SC,
    grammar: Grammar,
    runner: CompilerRunner,
    production: Production,
    productions: Set<number>,
    options: RenderBodyOptions,
    production_items: Item[][],
    lex_name: VarSC,
    offset: number,
    INITIAL: boolean = false,
): { items: Item[], _if: SC, filter_productions: number[]; } {

    let
        filter_productions = [],
        out_items = [];

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
        return createSingleItemSequence(items, production_lr_items, _if, grammar, runner, production, productions, options, lex_name, offset);
    }

    const matching_productions = getCommonAncestorAmongstSets(items, production_lr_items, grammar);

    if (matching_productions.length > 0 && !INITIAL) {
        const prod = matching_productions[0];
        filter_productions.push((items[0].getProduction(grammar).id != production.id) ? items[0].getProduction(grammar).id : -1);
        _if = renderProduction(_if, prod, grammar, runner, productions, lex_name, false).code_node;
        return { items: out_items, _if, filter_productions };
    }

    if (SAME_SYMBOL && (offset > 0 || ROOT_PRODUCTION || SAME_PRODUCTION)) {

        let NO_CHECK = true;

        while (items.every(i => !i.atEND && i.sym(grammar).val == items[0].sym(grammar).val)) {
            _if = renderItemSym(_if, items[0], grammar, runner, productions, NO_CHECK).code_node;
            items = items.map(i => i.increment());
            NO_CHECK = false;
        }

        try {
            if (items.length > 0) {
                shiftAndComplete(items, _if, grammar, runner, production, productions, options, -1);
                out_items.push(...items);
                return { items: out_items, _if, filter_productions };
            }
        } catch (e) {
            return { _if, filter_productions, items: [] };//createBacktrackingProductionCallSequence(items, _if, grammar, runner, production, productions, options, lex_name, offset);
        }
        return;
    }


    /**
     * Get the maximum depth necessary to disambiguate
     */
    const { tree_nodes } = getTransitionTree(grammar, items, 5, 3);

    const peek_name = SC.Variable("pk:Lexer");
    const no_skip = getNoSkipSymbolsFromPeekNode(tree_nodes[0], grammar);
    _if.addStatement(SC.Declare(SC.Assignment(peek_name, SC.Call(SC.Member(lex_name, "copy")))));
    _if.addStatement(addSkipCall(grammar, runner, no_skip, peek_name/* SC.Call(SC.Member(peek_name, "next")) */));
    const next = INITIAL ? tree_nodes[0].next : tree_nodes[0].next;
    const gen = buildPeekTree(next, grammar, runner, peek_name);

    let val = gen.next();

    while (!val.done) {
        const { _if: __if, items } = val.value, [first] = items,
            SAME_PRODUCTION = items.setFilter(i => i.getProduction(grammar).id).length == 1;

        if (offset == 0 && SAME_PRODUCTION && INITIAL) {
            const prod = first.getProduction(grammar);
            filter_productions.push((first.getProduction(grammar).id != production.id) ? items[0].getProduction(grammar).id : -1);
            renderProduction(__if, prod, grammar, runner, productions, lex_name, false);
            out_items.push(...production_lr_items.filter(i => i.getProductionAtSymbol(grammar).id == prod.id));
        } else if (items.length > 1) {
            const SAME_SYMBOL = doItemsHaveSameSymbol(items, grammar);
            //_if.addStatement(SC.Comment(`BB ${SAME_SYMBOL} ${SAME_PRODUCTION}-----------\n${items.map(i => i.renderUnformattedWithProduction(grammar)).join("\n")}\n --------`));
            if (INITIAL && SAME_PRODUCTION)
                filter_productions.push(...createMultiItemSequence(items, production_lr_items, __if, grammar, runner, production, productions, options, production_items, lex_name, 0, true).filter_productions);
            else if (SAME_SYMBOL)
                filter_productions.push(...createMultiItemSequence(items, production_lr_items, __if, grammar, runner, production, productions, options, production_items, lex_name, offset + 1).filter_productions);
            else
                filter_productions.push(...createBacktrackingSequence(items, __if, grammar, runner, production, productions, options, lex_name, offset).filter_productions);
            out_items.push(...items);
        } else {
            filter_productions.push((first.getProduction(grammar).id != production.id) ? first.getProduction(grammar).id : -1);
            /**
             * If the item is at the start of the offset, then we can simply call into the items production
             * to reduce the amount of processing done in the calling function
             */
            const _if = renderItem(__if, first, grammar, runner, productions, true);
            addReturnType(options.RETURN_TYPE, _if);
            out_items.push(first);

        }

        val = gen.next();

    }
    const __if = val.value.leaf;
    __if.addStatement(SC.Empty());
    _if.addStatement(val.value._if);
    _if.addStatement(SC.Empty());
    _if = __if;

    return { items: out_items, _if, filter_productions };
}

function createSingleItemSequence(
    items: Item[],
    production_lr_items: Item[],
    _if: SC,
    grammar: Grammar,
    runner: CompilerRunner,
    production: Production,
    productions: Set<number>,
    options: RenderBodyOptions,
    lex_name: VarSC,
    offset: number
): { items: Item[], _if: SC, filter_productions: number[]; } {

    let [first] = items;

    const
        out_items = [],
        filter_productions = [],
        matching_productions = getCommonAncestorAmongstSets(items, production_lr_items, grammar);

    if (offset > 0 && matching_productions.length > 0) {
        const prod = matching_productions[0];
        filter_productions.push((items[0].getProduction(grammar).id != production.id) ? items[0].getProduction(grammar).id : -1);
        renderProduction(_if, prod, grammar, runner, productions, lex_name, false);
        out_items.push(...production_lr_items.filter(i => i.getProductionAtSymbol(grammar).id == prod.id));
    } else if (first.offset == 0 && first.getProduction(grammar).id != production.id) {
        _if = renderItemProduction(_if, first, grammar, runner, productions, lex_name, false).code_node;
        out_items.push(...items);
    } else {
        _if = renderItem(_if, first, grammar, runner, productions, true, lex_name);
        addReturnType(options.RETURN_TYPE, _if);
        out_items.push(...items);
    }

    filter_productions.push((first.getProduction(grammar).id != production.id) ? first.getProduction(grammar).id : -1);

    _if.addStatement(SC.Empty());

    return { items: out_items, _if, filter_productions };
}

export function renderFunctionBody(
    rd_items: Item[],
    grammar: Grammar,
    runner: CompilerRunner,
    production: Production,
    productions: Set<number> = new Set,
    options: RenderBodyOptions = generateRDOptions(),
    production_items: Item[][] = [],
    lex_name: VarSC = g_lexer_name,
    offset = 0,
    INITIAL = false

): ({ sym_map: Map<TokenSymbol, any>, sc: SC; _if: SC; }) {
    let CAN_DISAMBIGUATE = true;

    if (offset > 10) return { sc: new SC, sym_map: new Map, _if: new SC };

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

        group_maps: Map<string, { syms: Set<TokenSymbol>, items: Item[]; priority: number; }> = getGroups(symboled_items_map, grammar),

        visited_prods: Set<string> = new Set();

    let leaf: SC = null, root: SC = leaf;

    const cd = [];

    for (let { syms: s, items } of group_maps.values()) {

        const syms = [...s.values()];

        let
            _if: SC = SC.If(getIncludeBooleans(syms, grammar, runner, lex_name)),
            filter_productions = [],
            RIGHT_RECURSION_PRESENT = items.some(i => syms.some(sym => doesSymbolLeadToRightRecursion(sym, i.increment(), grammar)));

        if (leaf) {
            leaf.addStatement(_if);
            leaf = _if;
        } else
            root = leaf = _if;

        if (RIGHT_RECURSION_PRESENT)
            ({ items, _if, filter_productions } = createBacktrackingSequence(items, _if, grammar, runner, production, productions, options, lex_name, offset));
        else if (items.length > 1)
            ({ items, _if, filter_productions } = createMultiItemSequence(items, production_shift_items, _if, grammar, runner, production, productions, options, production_items, lex_name, offset, INITIAL));
        else
            ({ items, _if, filter_productions } = createSingleItemSequence(items, production_shift_items, _if, grammar, runner, production, productions, options, lex_name, offset));

        _if = processProductionChain(
            _if, grammar, runner,
            production, productions,
            options, production_items,
            items, nonterm_shift_items, visited_prods,
            offset, filter_productions
        );
    }

    let _if = new SC;

    if (cd.length == group_maps.size) CAN_DISAMBIGUATE = false;

    if (CAN_DISAMBIGUATE) {

        /**
         * At this point, items that have reached their end are processed. 
         * Any item that transitioned to the end on a terminal will simply
         * be included in a else statement that serves as the fall back action
         * in the case the current token doesn't match any items that would
         * cause a shift. 
         */

        if (terminal_completed_items.length > 0) {
            const end = renderEndItemSequence(terminal_completed_items, grammar, runner, productions, options, !!leaf);

            if (leaf) {
                leaf.addStatement(end);
                leaf = end;
            } else {
                leaf = end;
                root = leaf;
            }

            leaf = processProductionChain(
                leaf, grammar, runner,
                production, productions,
                options, production_items,
                terminal_completed_items,
                nonterm_shift_items, visited_prods,
                offset
            );
        }

        nonterm_shift_items.push(...production_completed_items.map(i => i.decrement()));

        code_node.addStatement(root);

        _if = renderProductionShifts(nonterm_shift_items, grammar, runner, production, productions, code_node, offset, options);

        if (code_node == _if) _if = leaf || code_node;
    }

    return ({ sc: code_node, _if, sym_map: symboled_items_map });
}

function logItems(items: Item[], grammar: Grammar) {
    console.log(items.map(i => i.renderUnformattedWithProduction(grammar)));
}

function renderProductionShifts(
    nonterm_shift_items: Item[],
    grammar: Grammar,
    runner: CompilerRunner,
    production: Production,
    productions: Set<number>,
    code_node: SC,
    offset: number,
    options: RenderBodyOptions
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

        for (const [, sw_group] of outcome_groups.entries()) {

            for (let i = 0; i < sw_group.length; i++) {

                const
                    key = sw_group[i][0],
                    if_node: SC = SC.If(SC.Value(key));

                switch_node.addStatement(if_node);

                if (i == (sw_group.length - 1)) {
                    const block = SC.If();
                    const options = generateRDOptions(RETURN_TYPE, production.id);
                    shiftAndComplete(sw_group[i][1].map(i => i.increment()), block, grammar, runner, production, productions, options, key);
                    if_node.addStatement(block.addStatement(SC.Empty()), SC.Break);
                }
            }
        }

        const _if = SC.If(SC.Value([...production_io_map.keys()].map(i => "prod==" + i).join(" || ")));

        if (offset >= 0 && options.RETURN_TYPE == ReturnType.ACCEPT)
            _if.addStatement(SC.Assignment("ACCEPT", "true"));

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

function shiftAndComplete(items: Item[], if_node: SC, grammar: Grammar, runner: CompilerRunner, production: Production, productions: Set<number>, options: RenderBodyOptions, key: any) {
    const
        shift_items = items.filter(i => !i.atEND),
        end_items = items.filter(i => i.atEND),
        lex_name = g_lexer_name,
        follow_symbols = [...FOLLOW(grammar, production.id).values()];

    let active_node = null;


    if (shift_items.length > 0) {
        if_node.addStatement(SC.Comment(items.map(i => i.renderUnformattedWithProduction(grammar)).join("\n")));
        if_node.addStatement(SC.Value(`console.log({before:true, key:${key}, offset:l.off, name:"${production.name}", prod, txt:String.fromCharCode(l.getUTF()), items:\`${items.map(i => i.renderUnformattedWithProduction(grammar)).join("\n")}\` })`));


        //process the shift item to completion. 
        const closure = getClosure(shift_items.slice(), grammar);
        const syms = closure.filter(i => !i.atEND && !isSymAProduction(i.sym(grammar))).map(i => <TokenSymbol>i.sym(grammar));

        if (shift_items.length == 1) {
            //Simply confirm the current token is within the shift items first set then 

            let _if: SC = SC.If(getIncludeBooleans(syms, grammar, runner, lex_name, []));
            const inner_if = renderItem(_if, shift_items[0], grammar, runner, productions, true);

            addReturnType(options.RETURN_TYPE, inner_if);
            active_node = _if;
            if_node.addStatement(addSkipCall(grammar, runner, syms, lex_name));
            if_node.addStatement(_if);
        } else {

            let d: Item[] = shift_items.slice();

            const node = new SC;

            const _if = createMultiItemSequence(d, [], node, grammar, runner, production, productions, options, [], lex_name, 0)._if;

            active_node = _if;


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
                    exclude_syms = syms;

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
                if_node.addStatement(addSkipCall(grammar, runner, syms, lex_name));
                if_node.addStatement(node);
            }
        }
        if_node.addStatement(SC.Value(`console.log({after:true, key:${key}, offset:l.off, name:"${production.name}", prod, txt:String.fromCharCode(l.getUTF()) })`));
    }

    if (end_items.length > 0) {
        const end = renderEndItemSequence(end_items, grammar, runner, productions, options, shift_items.length > 0);


        if (!active_node) {
            if_node.addStatement(end);
        } else {
            active_node.addStatement(end);
        }
    }
}

function renderEndItemSequence(
    end_items: Item[],
    grammar: Grammar,
    runner: CompilerRunner,
    productions: Set<number>,
    options: RenderBodyOptions,
    USE_IF: boolean): SC {
    USE_IF = USE_IF || end_items.length > 1;
    let node = null, root = null;
    for (let i = 0; i < end_items.length; i++) {
        const item = end_items[i];
        if (USE_IF) {
            const _if = SC.If(
                i == end_items.length - 1 ? undefined :
                    addFollowCheckCall(grammar, runner, item.getProduction(grammar), <any>SC.Call(SC.Member(g_lexer_name, "copy")))
            );
            const sc = renderItem(_if, item, grammar, runner, productions, true);
            addReturnType(options.RETURN_TYPE, sc);
            if (!node) {
                node = _if;
                root = _if;
            } else {
                node.addStatement(_if);
                node = _if;
            }
        } else {
            root = new SC;
            renderItem(root, item, grammar, runner, productions, true);
            addReturnType(options.RETURN_TYPE, root);

        }
    }

    return root;
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

        items.forEach(i => (i.IS_LR = checkForLeftRecursion(i.getProduction(grammar), i, grammar), i));

        const
            production_items = items.filter(i => i.sym(grammar) && isSymAProduction(i.sym(grammar))),
            sc =
                renderFunctionBody(
                    items,
                    grammar,
                    runner,
                    production,
                    productions,
                    generateRDOptions(ReturnType.NONE),
                    [production_items],
                    g_lexer_name,
                    0,
                    true
                ).sc;

        code_node.addStatement(sc);

        renderClauseSuccessCheck(code_node, production, grammar, runner);

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
