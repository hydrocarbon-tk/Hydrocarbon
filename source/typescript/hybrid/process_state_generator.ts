import {
    getIncludeBooleans,
    g_lexer_name,
    isSymAProduction
} from "./utilities/utilities.js";
import { AS, JS, SC, VarSC } from "./utilities/skribble.js";
import { RenderBodyOptions } from "./types/RenderBodyOptions";
import { processProductionChain, itemsToProductions } from "./hybrid_function_constructor.js";
import { renderItem, renderItemProduction, renderProduction } from "./item_render_functions.js";
import { Item } from "../util/item.js";
import { getCommonAncestors } from "../util/common.js";
import { Grammar, Production } from "../types/grammar.js";
import { Symbol, TokenSymbol } from "../types/Symbol.js";
import { NewType } from "./types/RecognizerState.js";
import { g } from "@candlefw/wind/build/types/ascii_code_points";


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

function* traverseInteriorNodes(
    group: NewType[],
    options: RenderBodyOptions,
    grouping_fn: (node: NewType, level: number, peeking: boolean) => string
): Generator<{ syms: Symbol[], code: SC, items: Item[]; hash: string; }> {
    const groups = group.group(g => grouping_fn(g, g.state.level, g.state.peeking));

    for (const group of groups) {
        const syms = group.map(s => s.state.sym);
        const code = group[0].code;
        const hash = group[0].hash;
        const items = group.flatMap(g => g.state.items).setFilter(i => i.id);
        yield { syms, code, items, hash };
    }
}

export function processStateGenerator(
    options: RenderBodyOptions,
    gen: Generator<NewType[], SC>,
    selection_clause_fn:
        (gen: Generator<{ syms: Symbol[], code: SC, items: Item[]; hash: string; }>, items: Item[], level: number, options: RenderBodyOptions) => SC =
        (gen: Generator<{ syms: Symbol[], code: SC, items: Item[]; hash: string; }>, items: Item[], level: number, options: RenderBodyOptions) => {
            const { grammar, runner } = options;
            let root, leaf = root;
            for (const { syms, items, code, hash } of gen) {
                const boolean =
                    syms.length == 1 && isSymAProduction(syms[0])
                        ? SC.Value(syms[0].val)
                        : getIncludeBooleans(<TokenSymbol[]>syms, grammar, runner, g_lexer_name);
                const if_stmt = SC.If(boolean);
                if_stmt.addStatement(SC.Comment(hash));
                if_stmt.addStatement(code);

                if (!leaf) {
                    leaf = if_stmt;
                    root = if_stmt;
                } else {
                    leaf.addStatement(if_stmt);
                    leaf = if_stmt;
                }
            }
            leaf.addStatement(SC.Empty());
            return root;
        },
    multi_item_leaf_fn:
        (items: Item[], group: NewType, options: RenderBodyOptions) => SC =
        (items: Item[], group: NewType, options: RenderBodyOptions) => {
            const { grammar, runner, productions } = options;
            return SC.Comment("TESTS");
        },
    single_item_leaf_fn:
        (item: Item, group: NewType, options: RenderBodyOptions) => SC =
        (item: Item, group: NewType, options: RenderBodyOptions) => {
            const { grammar, runner, productions } = options;
            const code = new SC;
            const sc = renderItem(code, item, grammar, runner);
            for (const prod of processProductionChain(sc, options, itemsToProductions([item], grammar), true))
                productions.add(prod);
            return code;
        },
    grouping_fn: (node: NewType, level: number, peeking: boolean) => string = g => {
        return g.state.items.map(i => i.id).sort() + "-" + g.state.leaf + g.hash;
    }
): SC {
    let val = gen.next();
    while (!val.done) {

        const group: NewType[] = <NewType[]>val.value;

        const items = group[0].state.items;

        if (group.length == 1 && group[0].state.leaf == true) {
            if (items.length == 1) {
                const code = single_item_leaf_fn(items[0], group[0], options);
                group[0].code = code;
                group[0].hash = code.hash();

            }
            else {
                const code = multi_item_leaf_fn(items, group[0], options);
                group[0].code = code;
                group[0].hash = code.hash();
            }
        } else {
            //Multi-group transitions on symbol
            //May be peeking
            //decide how the group should be combined

            const items = group.flatMap(g => g.state.items).setFilter(i => i.id);

            const root = selection_clause_fn(
                traverseInteriorNodes(group, options, grouping_fn),
                items,
                group[0].state.level,
                options
            );

            group.forEach(g => {
                g.code = root;
                g.hash = root.hash();
            });
        }

        val = gen.next();
    }
    return val.value;
}