import {
    addSkipCallNew,
    consume_assert_call,
    getIncludeBooleans,
    getSkippableSymbolsFromItems,
    g_lexer_name,
    isSymAProduction,
    itemsToProductions
} from "./utilities/utilities.js";
import { AS, ExprSC, JS, SC, VarSC } from "./utilities/skribble.js";
import { RenderBodyOptions } from "./types/RenderBodyOptions";
import { processProductionChain } from "./process_production_chain.js";
import { renderItem, renderItemProduction, renderItemSym, renderProduction } from "./item_render_functions.js";
import { Item } from "../util/item.js";
import { getCommonAncestors } from "../util/common.js";
import { Grammar, Production } from "../types/grammar.js";
import { Symbol, TokenSymbol } from "../types/Symbol.js";
import { RecognizerState } from "./types/RecognizerState.js";


function getCommonAncestorAmongstSets(descendants: Item[], grammar: Grammar): Production[] {
    const ancestors = getCommonAncestors(grammar, descendants);
    const matching_productions = ([
        ...ancestors.map(i => i.getProductionAtSymbol(grammar).id).setFilter()
    ]).group(i => i).filter(i => i.length > 1).map(i => grammar[i[0]]);

    return matching_productions;
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
        called_productions: productions
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

function* traverseInteriorNodes(
    group: RecognizerState[],
    options: RenderBodyOptions,
    grouping_fn: (node: RecognizerState, level: number, peeking: boolean) => string
): Generator<{ syms: Symbol[], code: SC, items: Item[]; hash: string; FIRST: boolean, LAST: boolean; }> {
    const groups = group.group(g => grouping_fn(g, g.peek_level, g.peeking));
    let i = 0;
    for (const group of groups) {
        const syms = group.map(s => s.sym);
        const code = group[0].code;
        const hash = group[0].hash;
        const items = group.flatMap(g => g.items).setFilter(i => i.id);
        yield { syms, code, items, hash, FIRST: i == 0, LAST: ++i == groups.length };
    }
}
export type SelectionClauseGenerator = Generator<{
    syms: Symbol[];
    code: SC;
    items: Item[];
    hash: string;
    LAST: boolean;
    FIRST: boolean;
}>;

export function defaultSelectionClause(
    gen: SelectionClauseGenerator,
    state: RecognizerState,
    items: Item[],
    level: number,
    options: RenderBodyOptions
): SC {
    const { grammar, runner } = options;
    let root = new SC, leaf = null, mid = root, lex_name = g_lexer_name;
    root.addStatement(
        //   SC.Comment(`CLAUSE: ${state.yielder}`),
        // SC.Comment("off:" + state.offset + " pk:" + state.peek_level)
    );

    if (state.peek_level >= 0) {
        let peek_name = SC.Variable("pk:Lexer");
        if (state.peek_level == 1) {

            root.addStatement(
                //SC.Call(consume_call, lex_name),
                SC.Declare(SC.Assignment(peek_name, SC.Call(SC.Member(lex_name, "copy")))),
                //SC.Comment(items.map(i => i.renderUnformattedWithProduction(grammar)))
            );
        }
        if (state.offset > 0 && state.peek_level == 0) {
            const skippable = getSkippableSymbolsFromItems(items, grammar);
            root.addStatement(addSkipCallNew(skippable, grammar, runner, lex_name));
        } else if (state.peek_level >= 1) {
            lex_name = peek_name;
            const skippable = getSkippableSymbolsFromItems(items, grammar);
            root.addStatement(addSkipCallNew(skippable, grammar, runner, SC.Call(SC.Member(lex_name, "next"))));
        }
    } else if (state.offset > 0) {
        //Consume
        const skippable = getSkippableSymbolsFromItems(items, grammar);
        root.addStatement(addSkipCallNew(skippable, grammar, runner));
    }

    for (const { syms, items, code, hash, LAST, FIRST } of gen) {
        const boolean = syms.length == 1 && isSymAProduction(syms[0])
            ? SC.Call("$" + grammar[syms[0].val].name, lex_name)
            : getIncludeBooleans(<TokenSymbol[]>syms, grammar, runner, lex_name);
        const if_stmt = SC.If(
            (false && LAST && !FIRST) ? undefined :
                state.peek_level >= 0 || (syms.length == 1 && isSymAProduction(syms[0]))
                    ? boolean
                    : SC.Call(consume_assert_call, boolean)
        );

        if_stmt.addStatement(
            SC.Comment(hash),
            code,
            SC.Empty()
        );

        if (leaf) {
            leaf.addStatement(if_stmt);
        } else {
            mid.addStatement(if_stmt);
        }
        leaf = if_stmt;
    }
    root.addStatement(SC.Empty());
    mid.addStatement(SC.Empty());
    if (leaf)
        leaf.addStatement(SC.Empty());
    return root;
}

export function defaultMultiItemLeaf(items: Item[], groups: RecognizerState[], options: RenderBodyOptions): { root: SC, leaves: SC[]; } {
    const { grammar, runner, called_productions: productions } = options;
    const root = new SC;
    root.addStatement(
        SC.Declare(
            SC.Assignment("mk:int", SC.Call("mark")),
            SC.Assignment("anchor:Lexer", SC.Call(SC.Member(g_lexer_name, "copy")))
        )
    );

    root.addStatement(
        groups.reduce((r, g, i, a) => {
            const sym = g.sym;
            let boolean: ExprSC = isSymAProduction(sym)
                ? SC.Call("$" + grammar[sym.val].name, g_lexer_name)
                : SC.Call(consume_assert_call, getIncludeBooleans(<TokenSymbol[]>[sym], grammar, runner));
            const stmt = SC.If(boolean).addStatement(
                SC.Comment(g.hash),
                g.code
            );
            if (!r.root) {
                r.root = new SC().addStatement(stmt);
                r.leaf = r.root;
            } else {
                const expected_prods = a[i - 1].prods;
                const reset = SC.If(SC.Call(
                    "reset:bool",
                    "mk",
                    "anchor:Lexer",
                    g_lexer_name,
                    expected_prods.reduce((r, n) => {
                        if (!r) return SC.Binary("prod", "==", n);
                        return SC.Binary(r, "||", SC.Binary("prod", "==", n));
                    }, null)
                )).addStatement(stmt, SC.Empty());
                r.leaf.addStatement(reset, SC.Empty());
                r.leaf = reset;
            }

            return r;
        }, { root: null, leaf: null }).root
    );
    return { root, leaves: [] };
}

export function defaultSingleItemLeaf(item: Item, state: RecognizerState, options: RenderBodyOptions): { root: SC, leaf: SC; prods: number[]; } {
    const { grammar, runner, leaf_productions } = options;
    const code = new SC;
    code.addStatement(
        //SC.Comment(item.renderUnformattedWithProduction(grammar)),
        //    SC.Comment(`SINGLE: ${state.yielder}`)
    );
    const sc = renderItem(code, item, grammar, runner, options.called_productions, state.offset > 0);
    const prods = processProductionChain(sc, options, itemsToProductions([item], grammar));
    for (const prod of prods)
        leaf_productions.add(prod);
    return { root: code, leaf: sc, prods };
}

export function defaultGrouping(g) {
    return g.hash;
}
export function processStateGenerator(
    options: RenderBodyOptions,
    gen: Generator<RecognizerState[], SC>,
    selection_clause_fn:
        (gen: SelectionClauseGenerator, state: RecognizerState, items: Item[], level: number, options: RenderBodyOptions) => SC =
        defaultSelectionClause,
    multi_item_leaf_fn:
        (items: Item[], groups: RecognizerState[], options: RenderBodyOptions) => { root: SC, leaves: SC[]; } =
        defaultMultiItemLeaf,
    single_item_leaf_fn:
        (item: Item, group: RecognizerState, options: RenderBodyOptions) => { root: SC, leaf: SC; prods: number[]; } =
        defaultSingleItemLeaf,
    grouping_fn: (node: RecognizerState, level: number, peeking: boolean) => string = defaultGrouping
): SC {
    let val = gen.next();
    while (!val.done) {

        const group: RecognizerState[] = <RecognizerState[]>val.value;

        const items = group[0].items;

        if (group.every(g => g.leaf)) {
            if (group.length == 1) {
                const { root, prods } = single_item_leaf_fn(items[0], group[0], options);
                group[0].code = root;
                group[0].hash = root.hash();
                group[0].prods = prods;
            } else {
                const { root } = multi_item_leaf_fn(items, group, options);
                group[0].code = root;
                group[0].hash = root.hash();
            }
        } else {
            //Multi-group transitions on symbol
            //May be peeking
            //decide how the group should be combined


            const prods = group.flatMap(g => g.prods).setFilter();
            const items = group.flatMap(g => g.items).setFilter(i => i.id);

            const root = selection_clause_fn(
                traverseInteriorNodes(group, options, grouping_fn),
                group[0],
                items,
                group[0].peek_level,
                options
            );

            group.forEach(g => {
                g.prods = prods;
                g.code = root;
                g.hash = root.hash();
            });
        }

        val = gen.next();
    }
    return val.value;
}