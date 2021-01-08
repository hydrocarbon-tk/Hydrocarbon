import { Grammar, Production, EOF_SYM, SymbolType } from "../types/grammar.js";
import { AssertionFunctionSymbol, ProductionSymbol, Symbol, TokenSymbol } from "../types/Symbol";
import { Item, doesItemHaveLeftRecursion, getCommonAncestors }
    from "../util/common.js";
import { TransitionTreeNode } from "../util/TransitionTreeNode";
import {
    createNoCheckShift,
    getRootSym,
    getIncludeBooleans,
    createReduceFunction,
    createDefaultReduceFunction,
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
    addFollowCheckCall,
    addSkipCallNew,
    getSkippableSymbolsFromItems,
} from "./utilities/utilities.js";
import { RDProductionFunction } from "./types/RDProductionFunction";
import { CompilerRunner } from "./types/CompilerRunner.js";
import { ConstSC, SC, VarSC } from "./utilities/skribble.js";
import { getClosure, getFollow } from "../util/process_closure.js";
import { ReturnType, RenderBodyOptions } from "./types/RenderBodyOptions";
import { addEndItemSequence } from "./add_end_item_sequence.js";
import { addItemListComment } from "./add_item_list_comment.js";
import { createMultiItemSequence } from "./create_multi_item_sequence.js";

const
    accept_loop_flag = SC.Variable("ACCEPT:boolean"),
    production_global = SC.Variable("prod:unsigned int");

export function renderProduction(
    code_node: SC,
    production: Production,
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
    return renderProduction(code_node, production, productions, lexer_name, USE_IF);
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

export function renderItemSym(
    code_node: SC,
    item: Item,
    grammar: Grammar,
    runner: CompilerRunner,
    productions: Set<number> = new Set,
    RENDER_WITH_NO_CHECK = false,
    lexer_name: VarSC = g_lexer_name
): { code_node: SC; } {

    let bool_expression = null;
    let IS_PASSTHROUGH = false, passthrough_chain = null, first_non_passthrough = 0;
    if (item.atEND) {
        renderItemReduction(code_node, item, grammar);
    } else {
        const sym = getRootSym(item.sym(grammar), grammar);

        if (sym.type == "production") {

            ({ IS_PASSTHROUGH, first_non_passthrough, passthrough_chain } = isProductionPassthrough(sym.val, grammar));

            bool_expression = SC.Call(SC.Constant("$" + grammar[first_non_passthrough].name), lexer_name);

            productions.add(first_non_passthrough);

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
        code_node = _if;
    } else if (bool_expression) {
        code_node.addStatement(bool_expression);
    }

    if (IS_PASSTHROUGH) {
        for (let prod_id of passthrough_chain.reverse()) {
            const body = grammar[prod_id].bodies[0];
            const body_item = new Item(body.id, body.length, body.length);
            renderItemReduction(code_node, body_item, grammar);
        }
    }

    return { code_node };
}

function isProductionPassthrough(production_id: number, grammar: Grammar): {
    IS_PASSTHROUGH: boolean; first_non_passthrough: number; passthrough_chain: number[];
} {
    const production = grammar[production_id];

    const IS_PASSTHROUGH =
        production.bodies.length == 1
        && production.bodies[0].sym.length == 1
        && isSymAProduction(production.bodies[0].sym[0]);

    let first_non_passthrough = -1, passthrough_chain = [];

    if (IS_PASSTHROUGH) {
        const sym = <ProductionSymbol>production.bodies[0].sym[0];

        const { first_non_passthrough: fnp, passthrough_chain: pc } = isProductionPassthrough(sym.val, grammar);
        passthrough_chain = passthrough_chain.concat(production_id, pc);
        first_non_passthrough = fnp;
    } else {
        first_non_passthrough = production_id;

    }

    return {
        IS_PASSTHROUGH,
        first_non_passthrough,
        passthrough_chain
    };
}

export function renderItem(
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
            const { reset_sym } = grammar.item_map.get(item.id),
                skippable = getSkippableSymbolsFromItems([item], grammar);
            leaf.addStatement(addSkipCallNew(skippable, grammar, runner, lexer_name));
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


function generateRDOptions(
    RT: ReturnType = ReturnType.RETURN,
    pd: number = 0,
    bd: number = 0,
    NC: boolean = false,
    peek_name = SC.Variable("pk:Lexer"),
    grammar: Grammar,
    runner: CompilerRunner,
    /**
     * The production currently being processed.
     */
    production: Production,
    /**
     * Set of all production ids that are referenced within the function
     */
    productions: Set<number>,
    lr_productions: Item[]
): RenderBodyOptions {
    return {
        grammar,
        runner,
        production,
        productions,
        pk_name: peek_name,
        peek_depth: pd,
        block_depth: bd,
        RETURN_TYPE: RT,
        NO_CHECK: NC,
        lr_productions
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
                ? 1 : isSymAnAssertFunction(sym)addSkipCallNew
                    ? 64
                    : isSymGeneratedId(sym)
                        ? 1 << 24
                        : 1024;
    }

    return group_maps;
}

export function getAccompanyingItems(grammar: Grammar, active_productions: number[], items: Item[], out: Item[] = [], all = false) {

    const prod_id = new Set(active_productions);

    const to_process = [];

    for (const item of items.reverse()) {
        if (!item || item.atEND) continue;

        const sym = item.sym(grammar);
        if (isSymAProduction(sym) && prod_id.has(<number>sym.val)) {

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

export function createSkipCallFromItems(items: Item[], grammar: Grammar, runner: CompilerRunner, lex_name: VarSC): SC {
    const skippable = getSkippableSymbolsFromItems(items, grammar);
    return addSkipCallNew(skippable, grammar, runner, lex_name);
}


export function itemsToProductions(items: Item[], grammar: Grammar): number[] {
    return items.map(i => i.getProduction(grammar).id);
}
function addClauseSuccessCheck(code_node: SC, production: Production, grammar: Grammar, runner: CompilerRunner) {
    const condition = SC.Binary(production_global, SC.Value("=="), SC.Value(production.id));
    code_node.addStatement(SC.UnaryPre(SC.Return, SC.Call("assertSuccess", g_lexer_name, condition)));
    return;
}

export function cleanLeaves(node: TransitionTreeNode) {
    if (node.next.length > 0)
        return node.next.every(cleanLeaves);
    return node.roots.length == 1;
}

export function doItemsHaveSameSymbol(items: Item[], grammar: Grammar) {
    return items.every(i => !i.atEND && i.sym(grammar).val == items[0].sym(grammar).val);
}

function getCommonAncestorAmongstSets(descendants: Item[], grammar: Grammar): Production[] {
    const ancestors = getCommonAncestors(grammar, descendants);
    const matching_productions = ([
        ...ancestors.map(i => i.getProductionAtSymbol(grammar).id).setFilter()
    ]).group(i => i).filter(i => i.length > 1).map(i => grammar[i[0]]);

    return matching_productions;
}

export function* createClosureSequence(
    items: Item[],
    code_node: SC,
    options: RenderBodyOptions,
    lex_name: VarSC,
    offset: number
): Generator<{ prods: number[], _if: SC, filter_productions: number[]; }, SC> {

    const {
        grammar,
        runner,
        productions
    } = options,

        true_items = items.filter(_ => _),

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

    let leaf: SC = null, root = null;

    if (runner.ANNOTATED)
        addItemListComment(code_node, items, grammar, "CLOSURE");

    let _if = new SC, leaf_count = 0;

    for (let { syms: s, items } of group_maps.values()) {

        const syms = [...s.values()];

        _if = SC.If(getIncludeBooleans(syms, grammar, runner, lex_name));

        renderItemSym(_if, items[0], grammar, runner, productions, true, lex_name);

        if (leaf) {
            leaf.addStatement(_if);
            leaf = _if;
        } else
            root = leaf = _if;

        yield* (items.length > 1)
            ? createMultiItemSequence(items.map(i => i.increment()), _if, options, lex_name, offset + 1, false)
            : createSingleItemSequence(items.map(i => i.increment()), _if, options, lex_name, offset + 1);
    }

    code_node.addStatement(root);

    return root;
}

export function* createBacktrackingSequence(
    items: Item[],
    root: SC,
    options: RenderBodyOptions,
    lex_name: VarSC
): Generator<{ prods: number[], _if: SC, filter_productions: number[]; }, SC> {

    const {
        grammar,
        runner,
        productions
    } = options;

    if (runner.ANNOTATED)
        addItemListComment(root, items, grammar, "BACKTRACKING");

    let filter_productions = [], i = 0;

    const lex_copy_name = incrementLexerName(lex_name || g_lexer_name);
    const mark = SC.Variable("mk:unsigned int");
    const pass = SC.Variable("pass:bool");

    root.addStatement(SC.Declare(lex_copy_name));
    root.addStatement(SC.Declare(SC.Assignment(mark, SC.Call("mark"))));
    root.addStatement(SC.Declare(SC.Assignment(pass, SC.False)));

    for (const itm of items.map(i => {
        return <[Symbol, Item]>[i.sym(grammar), i];
    }).group(([sym]) => sym)) {

        const [[sym, first]] = itm;
        const items = itm.map(([, i]) => i);

        let temp,
            a = SC.Call("reset", mark, pass),
            b =
                isSymAProduction(sym) ? SC.Binary(
                    SC.Call(
                        "$" + grammar[sym.val].name,
                        SC.Assignment(lex_copy_name, SC.Call(SC.Member(lex_name, "copy")))),
                    "&&",
                    addFollowCheckCall(grammar, runner, grammar[sym.val], lex_copy_name)
                ) :
                    createAssertionShift(grammar, runner, sym, lex_name).expressions[0],
            c = SC.Binary(
                a, "&&",
                b
            );
        temp = SC.If(i++ == 0 ? b : c);
        if (isSymAProduction(sym))
            productions.add(sym.val);
        if (itm.length > 1) {

            const inc = items.map(i => i.increment());
            const gen = createMultiItemSequence(inc, temp, options, lex_copy_name);
            let val;
            while (!(val = gen.next()).done) {
                const _if = val.value._if;
                if (_if) {
                    _if.addStatement(
                        SC.Call(SC.Member(lex_name, "sync"), lex_copy_name),
                        SC.Assignment(pass, SC.True)
                    );
                }
                yield val.value;
            }
            root.addStatement(temp, SC.Empty());
        } else {
            const _if = renderItem(temp, first.increment(), grammar, runner, productions, false, lex_copy_name);
            temp.addStatement(SC.Empty());
            root.addStatement(temp, SC.Empty());
            _if.addStatement(SC.Call(SC.Member(lex_name, "sync"), lex_copy_name), SC.Assignment(pass, SC.True));
            yield ({ prods: [first.getProduction(grammar).id], _if, filter_productions });
        }
    }

    return root;
}
export function* createSingleItemSequence(
    items: Item[],
    _if: SC,
    options: RenderBodyOptions,
    lex_name: VarSC,
    offset: number = 0
): Generator<{ prods: number[], _if: SC, filter_productions: number[]; }, SC> {
    const {
        grammar,
        runner,
        production,
        productions
    } = options;
    let
        [first] = items,
        prods = itemsToProductions(items, grammar),
        filter_productions = [],
        matching_productions = getCommonAncestorAmongstSets(items, grammar);

    if (offset > 0 && matching_productions.length > 0) {
        const prod = matching_productions[0];
        filter_productions.push((items[0].getProduction(grammar).id != production.id) ? items[0].getProduction(grammar).id : -1);
        renderProduction(_if, prod, productions, lex_name, false);
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

export function processProductionChain(
    code_node: SC,
    options: RenderBodyOptions,
    /**
     * List of production id numbers that have been generated from
     * the proceeding code sequence.
     */
    active_productions: number[],
    SINGLE_REDUCE_ONLY = false
): number[] {
    let active_items: Item[] = [], { grammar, runner, production, productions, lr_productions } = options;

    let prod = active_productions, visited_prods: Set<string> = new Set;

    const items = (lr_productions);

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
            active_items = getAccompanyingItems(grammar, itemsToProductions(active_items, grammar), lr_productions);
        }
    }

    code_node.addStatement(SC.Assignment(production_global, prod[0]));

    if (active_items.length > 0) {

        if (active_items.some(i => doesItemHaveLeftRecursion(i, grammar)) || SINGLE_REDUCE_ONLY) {
            while (active_items.length > 0) {
                const new_items = active_items.filter(i => !visited_prods.has(i.id));
                new_items.forEach(i => visited_prods.add(i.id));
                active_items = getAccompanyingItems(grammar, itemsToProductions(new_items, grammar), lr_productions);
            }
        } else if (!SINGLE_REDUCE_ONLY) {
            const { node: sc, production_id } = createShiftAndComplete(active_items.map(i => i.increment()), lr_productions, options, -1);
            code_node.addStatement(sc);
            active_items = getAccompanyingItems(grammar, itemsToProductions(active_items, grammar), lr_productions);

            prod = [...production_id.values()];

            while (active_items.length > 0) {
                const new_items = active_items.filter(i => !visited_prods.has(i.id));
                new_items.forEach(i => visited_prods.add(i.id));
                active_items = getAccompanyingItems(grammar, itemsToProductions(new_items, grammar), lr_productions);
            }
        }
    }
    return prod;
}

function addProductionShifts(
    nonterm_shift_items: Item[],
    production_items: Item[],
    options: RenderBodyOptions,
    production_id: Set<number> = new Set,
): SC {

    let code_node: SC = new SC;
    const {
        grammar,
        runner,
        production,
    } = options;

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

        for (const [key, val] of lr_items.entries()) {
            const hash = val
                .map((i) => (i.increment().atEND || i.len + " " + i.body) + " " + i.getProduction(grammar).id + " " + (<Item>i).body_(grammar)?.reduce_function?.txt).join("");
            getMappedArray(hash, outcome_groups).push([<number>key, val]);
        }

        const
            case_clauses = new Map,
            case_array = [];

        let
            pending_productions = [...production_id.values()],
            active_productions = new Set();

        for (const [, sw_group] of outcome_groups.entries()) {

            for (let i = 0; i < sw_group.length; i++) {

                const key = sw_group[i][0];

                if (i == (sw_group.length - 1)) {
                    const keys = sw_group.map(sw => sw[0]),
                        block = SC.If(),
                        { node, production_id: sub_ids, PURE_COMPLETE } = createShiftAndComplete(sw_group[i][1].map(i => i.increment()), production_items, options, key);

                    for (const id of sub_ids.values()) production_id.add(id);
                    block.addStatement(node, SC.Empty());
                    for (const key of keys)
                        case_clauses.set(key, { code_node: block, PURE_COMPLETE, keys, sub_ids });
                }
            }
        }

        for (let i = 0; i < pending_productions.length; i++) {

            const prod = pending_productions[i];

            if (active_productions.has(prod)) continue;

            active_productions.add(prod);

            if (case_clauses.has(prod)) {

                const { code_node, PURE_COMPLETE, sub_ids, keys } = case_clauses.get(prod);

                if (!PURE_COMPLETE || keys.some(key => production_id.has(key))) {
                    case_array.push([keys, code_node]);

                    for (const key of keys) active_productions.add(key);

                    for (const prod of sub_ids)
                        if (!active_productions.has(prod))
                            pending_productions.push(prod);
                }
            }
        }

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


                if (runner.DEBUG)
                    while_node.addStatement(SC.Value(`console.log("PRODUCTION LR", {prod, tx:str.slice(l.off, l.off + l.tl), FAILED, offset:l.off, name:"${production.name}"})`));

                while_node.addStatement(SC.Declare(SC.Assignment(accept_loop_flag, SC.False)));
                while_node.addStatement(switch_node);
                while_node.addStatement(SC.If(SC.UnaryPre(SC.Value("!"), accept_loop_flag)).addStatement(SC.Break));
                code_node.addStatement(while_node);
            } else {
                if (runner.DEBUG)
                    code_node.addStatement(SC.Value(`console.log("PRODUCTION SHIFTS", {prod, tx:str.slice(l.off, l.off + l.tl), FAILED, offset:l.off, name:"${production.name}"})`));
                code_node.addStatement(switch_node);
            }
        }
    }
    return code_node;
}


function createShiftAndComplete(
    items: Item[],
    production_shift_items: Item[],
    options: RenderBodyOptions,
    key: any,
    RETURN_TYPE = ReturnType.ACCEPT
): { production_id: Set<number>, node: SC, PURE_COMPLETE: boolean; } {

    let code_node = new SC;

    const
        { runner, grammar, productions, production } = options,
        shift_items = items.filter(i => !i.atEND),
        end_items = items.filter(i => i.atEND),
        lex_name = g_lexer_name,
        follow_symbols = getFollow(key, grammar),
        production_id: Set<number> = new Set,
        PURE_COMPLETE = end_items.length == 1 && shift_items.length == 0;

    let active_node = null, ALLOW_FALL_THROUGH = end_items.length == 0 && key != production.id;

    const skippable = getSkippableSymbolsFromItems(items, grammar).filter(sym =>
        !getFollow(key, grammar).includes(sym)
    );

    if (runner.ANNOTATED) {
        addItemListComment(code_node, items, grammar);
        code_node.addStatement(SC.Comment(items.map(i => i.renderUnformattedWithProduction(grammar)).join("\n")));
    }

    if (skippable.length > 0 && (shift_items.length > 0 || end_items.length > 1))
        code_node.addStatement(addSkipCallNew(skippable, grammar, runner, lex_name));

    if (shift_items.length > 0) {

        //process the shift item to completion. 
        const
            closure = getClosure(shift_items.slice(), grammar),
            anticipated_syms = [...closure.filter(i => !i.atEND && !isSymAProduction(i.sym(grammar))).map(i => <TokenSymbol>i.sym(grammar))];


        if (key == production.id) {
            /*
                Early exit should only occur if there is an occluding generic ( such as g:sym, g:id )
                that could capture a symbol that would otherwise cause a reduce.  FOLLOW Symbols that
                would otherwise be matched match by the generic type should be selected for the early
                exit check. If there are no such generics in the excluded  items, then there is no
                need to do this check.
            */
            const
                lookahead_syms = [...follow_symbols.filter(s => isSymGeneratedWS(s) || isSymGeneratedNL(s))];

            if (anticipated_syms.some(isSymGeneratedSym))
                lookahead_syms.push(...follow_symbols.filter(isSymSpecifiedSymbol));

            if (anticipated_syms.some(isSymGeneratedId))
                lookahead_syms.push(...follow_symbols.filter(isSymSpecifiedIdentifier));

            if (anticipated_syms.some(isSymGeneratedNum))
                lookahead_syms.push(...follow_symbols.filter(isSymSpecifiedNumeric));

            if (lookahead_syms.length > 0) {

                const booleans = getIncludeBooleans(lookahead_syms, grammar, runner, g_lexer_name, anticipated_syms);

                if (booleans)
                    code_node.addStatement(SC.If(booleans).addStatement(SC.Break));
            }

        }

        if (shift_items.length == 1) {
            //Simply confirm the current token is within the shift items first set then 

            let _if: SC = SC.If(getIncludeBooleans(anticipated_syms, grammar, runner, lex_name, []));
            const inner_if = renderItem(_if, shift_items[0], grammar, runner, productions, true);
            active_node = _if;
            code_node.addStatement(_if);

            for (const prod of processProductionChain(inner_if, options, itemsToProductions(shift_items, grammar), true))
                production_id.add(prod);

            addReturnType(RETURN_TYPE, inner_if);

        } else {

            let d: Item[] = shift_items.slice(),
                node = new SC, val = null;

            const gen = createMultiItemSequence(d, node, options, lex_name, 0, false, ALLOW_FALL_THROUGH, true);

            while (!(val = gen.next()).done) {
                const { _if, prods, filter_productions } = val.value;
                if (_if) {

                    for (const prod of processProductionChain(_if, options, prods, true))
                        production_id.add(prod);

                    addReturnType(RETURN_TYPE, _if);
                }
            };
            active_node = val.value;
            code_node.addStatement(node);
            code_node.addStatement(SC.Empty());
        }
    }

    if (end_items.length > 0) {
        let val;
        const gen = addEndItemSequence(end_items, options, shift_items.length > 0 || end_items.length > 1);
        while (!(val = gen.next()).done) {

            const { _if, prods } = val.value;

            for (const prod of processProductionChain(_if, options, prods, true))
                production_id.add(prod);

            addReturnType(RETURN_TYPE, _if);
        };
        const end = val.value;

        if (!active_node) {
            code_node.addStatement(end);
        } else {
            active_node.addStatement(end);
        }
    }

    return { node: code_node, production_id, PURE_COMPLETE };
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
    \t${items.map(i => i.renderUnformattedWithProduction(grammar) + " - " + grammar.item_map.get(i.id).reset_sym.join(",")).join("\n\t\t")}`));


    try {
        if (runner.DEBUG)
            code_node.addStatement(SC.Value(`console.log("${production.name} START", { prod, tx:str.slice(l.off, l.off + l.tl), ty:l.ty, tl:l.tl, utf:l.getUTF(), FAILED, offset:l.off})`));

        let val;

        const non_lr_shift_items = items.filter(i => {
            const sym = i.sym(grammar);
            if (sym && isSymAProduction(sym) && sym.val == production.id)
                return false;
            return true;
        }),

            closure_items = getClosure(items, grammar),

            production_shift_items = closure_items
                .filter(i => !i.atEND && i.sym(grammar).type == SymbolType.PRODUCTION);


        const
            production_id: Set<number> = new Set(),
            options = generateRDOptions(
                ReturnType.NONE,
                p.id,
                0, false, g_lexer_name, grammar, runner,
                production, productions,
                production_shift_items
            ),
            gen = createMultiItemSequence(
                non_lr_shift_items,//.filter(i => !i.atEND),
                code_node,
                options,
                g_lexer_name,
                0,
                true,
                false
            );

        while (!(val = gen.next()).done) {
            const { _if, prods, filter_productions } = val.value;
            if (_if) {
                for (const prod of processProductionChain(
                    _if, options,
                    prods, true
                )) {
                    production_id.add(prod);
                };
                addReturnType(options.RETURN_TYPE, _if);
            }
        };

        const lr_shifts = addProductionShifts(production_shift_items, production_shift_items, options, production_id);

        code_node.addStatement(lr_shifts);
        if (runner.DEBUG)
            code_node.addStatement(SC.Value(`console.log("${production.name} END", {prod, tx:str.slice(l.off, l.off + l.tl), FAILED, offset:l.off})`));
        addClauseSuccessCheck(code_node, production, grammar, runner);

        return {
            productions,
            id: p.id,
            fn: (new SC).addStatement(
                (runner.ANNOTATED) ? annotation : undefined,
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