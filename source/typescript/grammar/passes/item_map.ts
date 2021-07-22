/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { getStartItemsFromProduction } from "../../build/function_constructor.js";
import { EOF_SYM, EOP_SYM, ItemMapEntry } from "../../types/item_map.js";
import { HCG3Grammar, HCG3Production } from "../../types/grammar_nodes.js";
import { Production } from "../../types/production.js";
import { ProductionSymbol, Symbol, TokenSymbol } from "../../types/symbol";
import { getFirstTerminalSymbols } from "../../utilities/first.js";
import { Item } from "../../utilities/item.js";
import { doesProductionHaveEmpty, getProductionID } from "../../utilities/production.js";
import {
    getSymbolName,
    getTrueSymbolValue, getUniqueSymbolName,
    Sym_Is_A_Production,
    Sym_Is_A_Production_Token,
    Sym_Is_LookBehind
} from "../nodes/symbol.js";

type IntermediateItemMapEntry = (ItemMapEntry & {
    closure: Item[];
});
type ItemMapVariables = {
    item_maps_in_process: ItemMapEntry[];
    extant_production_item_maps: {
        count: number;
        item_maps: IntermediateItemMapEntry[];
    }[];
};

export function buildItemMaps(grammar: HCG3Grammar, productions: HCG3Production[] = grammar.productions) {

    /////////////////////////////////////////////////////////////
    ensureGrammarHasItemMap(grammar);

    /////////////////////////////////////////////////////////////
    const {
        item_maps_in_process,
        extant_production_item_maps
    }: ItemMapVariables = getItemMapVariables(grammar, productions);

    /////////////////////////////////////////////////////////////
    processClosures(grammar, item_maps_in_process, extant_production_item_maps);

    /////////////////////////////////////////////////////////////
    addItemMapsToGrammar(item_maps_in_process, grammar);

    /////////////////////////////////////////////////////////////
    processFollowSymbols(grammar, productions);

    /////////////////////////////////////////////////////////////
    processSkippedSymbols(grammar, item_maps_in_process);

    ////////////////////////////////////////////////////////////
    addPositionalItemIds(grammar, productions);

    return item_maps_in_process;
}

function getItemMapVariables(grammar: HCG3Grammar, productions: HCG3Production[]) {
    const
        extant_production_item_maps = (grammar.productions ?? grammar).map(p => ({
            count: 0, item_maps: (grammar.productions ?? grammar) != productions ? getInterMediateItemMapEntriesFromProduction(p, grammar) : []
        })),

        item_maps_in_process: ItemMapEntry[] = productions.flatMap((p) => {

            const array_of_item_maps = getStartItemsFromProduction(p).map(item => {


                const out_syms: IntermediateItemMapEntry[] = [];

                // let depth = item.body + p.id * grammar.length;
                const b = item.body_(grammar);

                do {

                    if (!item.atEND) {
                        const sym = item.sym(grammar);
                        if (Sym_Is_A_Production(sym) && sym.subtype) {
                            const sub_production = grammar.productions[sym.val];

                            for (const body of sub_production.bodies) {
                                body.reset[0] = b.reset[0];
                            }
                        }
                    }

                    const reset_sym = item.offset >= 0 ? (b.reset[item.offset] ?? []).map(getUniqueSymbolName) : [];

                    out_syms.push(<IntermediateItemMapEntry>{
                        item,
                        closure: [],
                        reset_sym,
                        excludes: b.excludes[item.offset] ?? [],
                        rank: item.offset,
                        hash: "",
                        follow: new Set,
                        skippable: null,
                        containing_items: new Set,
                        breadcrumbs: new Set,
                        sym_uid: 0,
                        id: -1
                    });
                    // depth++;
                } while (item = item.increment());

                return out_syms;
            });
            extant_production_item_maps[p.id].item_maps = array_of_item_maps.map(i => i[0]);

            return array_of_item_maps.flat();
        });

    return { item_maps_in_process, extant_production_item_maps };
}

function getInterMediateItemMapEntriesFromProduction(p: HCG3Production, grammar: HCG3Grammar): (ItemMapEntry & { closure: Item[]; })[] {
    return getStartItemsFromProduction(p).map(i => getItemMapEntry(grammar, i.id))
        .filter(_ => _)
        .map(i => Object.assign({}, i, { closure: i.closure.map(i => getItemMapEntry(grammar, i).item) }));
}

function ensureGrammarHasItemMap(grammar: HCG3Grammar) {
    if (!grammar.item_map) grammar.item_map = new Map;
}

function addFollowInformation(item: Item, grammar: HCG3Grammar, check_set: Set<string>[], follow_sym: TokenSymbol = null, breadcrumbs = [], item_map) {

    for (const crumb of breadcrumbs)
        grammar.item_map.get(item.id).breadcrumbs.add(crumb);

    if (item.atEND) {
        if (follow_sym && !Sym_Is_LookBehind(follow_sym))
            grammar.item_map.get(item.id).follow.add(getUniqueSymbolName(follow_sym));
        return;
    }

    item_map.push(item.renderUnformattedWithProduction(grammar));

    let sym: Symbol =
        !item.increment().atEND
            ? item.increment().sym(grammar)
            : null,
        item_sym = item.sym(grammar),
        follow: TokenSymbol[] = follow_sym ? [follow_sym] : [];

    if (sym)
        if (Sym_Is_A_Production(sym)) {

            follow = [];

            let look_ahead = item.increment(),
                sym = look_ahead.sym(grammar);

            do {

                if (!look_ahead.atEND) {

                    if (Sym_Is_A_Production(sym)) {
                        follow = follow.concat(getFirstTerminalSymbols(getProductionID(sym, grammar), grammar)).setFilter(getUniqueSymbolName);
                    } else {
                        follow = follow.concat(sym).setFilter(getUniqueSymbolName);
                        break;
                    }

                } else {
                    follow.push(follow_sym);
                    break;
                }

                look_ahead = look_ahead.increment();

            } while (false && doesProductionHaveEmpty(getProductionID(<ProductionSymbol>sym, grammar), grammar));

        } else follow = getTrueSymbolValue(sym, grammar);

    if (Sym_Is_A_Production(item_sym)) {

        const
            parent_prod_id = item.getProduction(grammar).id,
            prod_id = getProductionID(item_sym, grammar),
            prod: HCG3Production = grammar.productions[prod_id];

        for (const body of prod.bodies) {

            for (const follow_sym of follow) {

                const

                    new_item = new Item(body.id, body.length, 0),

                    id = new_item.id + getUniqueSymbolName(follow_sym);

                if (!check_set[prod_id].has(id)) {

                    check_set[prod_id].add(id);

                    addFollowInformation(new_item, grammar, check_set, follow_sym, breadcrumbs.concat([parent_prod_id]), item_map);

                } else {

                    const new_item = new Item(body.id, body.length, body.length);

                    if (!Sym_Is_LookBehind(follow_sym))
                        grammar.item_map.get(new_item.id).follow.add(getUniqueSymbolName(follow_sym));

                }
            }
        }
    }

    addFollowInformation(item.increment(), grammar, check_set, follow_sym, breadcrumbs, item_map);
}

export function getItemMapEntry(grammar: HCG3Grammar, item_id: string): ItemMapEntry {

    if (!grammar.item_map.has(item_id))
        return null;

    return grammar.item_map.get(item_id);
}
/**
 * Builds the closure of every item 
 * @param grammar 
 * @param item_maps_in_process 
 * @param extant_production_item_maps 
 */
function processClosures(
    grammar: HCG3Grammar,
    item_maps_in_process: ItemMapEntry[],
    extant_production_item_maps: { count: number, item_maps: ItemMapEntry[]; }[]
) {
    let CHANGE = true, pending_item_maps_scratch: ItemMapEntry[] = item_maps_in_process.slice();

    for (const item_map of pending_item_maps_scratch) {

        const { item, excludes } = item_map;

        let productions = new Set();

        const pending_items = [item];

        const pending_non_token_items = [item];

        if (!item.atEND) {


            for (let i = 0, item = pending_items[i]; i < pending_items.length; item = pending_items[++i]) {

                let sym = item.sym(grammar);

                if (Sym_Is_A_Production(sym)/* && !Sym_Is_A_Production_Token(sym)*/) {

                    const prod_id: number = <number>sym.val;

                    if (productions.has(prod_id))
                        continue;

                    productions.add(prod_id);

                    for (const { item } of (extant_production_item_maps[prod_id].item_maps)) {

                        pending_items.push(item);
                    }
                }
            }

            for (const exclude of excludes) {

                outer: for (let i = 0; i < pending_items.length; i++) {

                    let item = Item.fromArray(pending_items[i]);

                    if (item.length < exclude.length)
                        continue;

                    item[2] = exclude.length - 1;

                    for (let i = exclude.length - 1; i >= 0; i--) {
                        const sym = item.sym(grammar);
                        if (getUniqueSymbolName(sym) != getUniqueSymbolName(exclude[i])) {
                            continue outer;
                        }
                        item = item.decrement();
                    }
                    pending_items.splice(i--, 1);
                }
            }

            productions = new Set;

            for (let i = 0, item = pending_non_token_items[i]; i < pending_non_token_items.length; item = pending_non_token_items[++i]) {

                let sym = item.sym(grammar);

                if (Sym_Is_A_Production(sym) && !Sym_Is_A_Production_Token(sym)) {

                    const prod_id: number = <number>sym.val;

                    if (productions.has(prod_id))
                        continue;

                    productions.add(prod_id);

                    for (const { item } of (extant_production_item_maps[prod_id].item_maps)) {

                        pending_non_token_items.push(item);
                    }
                }
            }

            for (const exclude of excludes) {

                outer: for (let i = 0; i < pending_non_token_items.length; i++) {

                    let item = Item.fromArray(pending_non_token_items[i]);

                    if (item.length < exclude.length)
                        continue;

                    item[2] = exclude.length - 1;

                    for (let i = exclude.length - 1; i >= 0; i--) {
                        const sym = item.sym(grammar);
                        if (getUniqueSymbolName(sym) != getUniqueSymbolName(exclude[i])) {
                            continue outer;
                        }
                        item = item.decrement();
                    }
                    pending_non_token_items.splice(i--, 1);
                }
            }
        }

        item_map.closure = pending_items.map(i => i.id).setFilter();
        item_map.non_token_closure = pending_non_token_items.map(i => i.id).setFilter();
        item_map.hash = item_map.closure.sort().join("");
    }
}

function addPositionalItemIds(grammar: HCG3Grammar, productions: HCG3Production[]) {
    for (const production of productions)
        if (production.type != "virtual-production")
            addPositionalSymbolId(grammar, production);
        else for (let item of getStartItemsFromProduction(production))
            do {
                grammar.item_map.get(item.id).sym_uid = 0;
                item = item.increment();
            } while (!item.atEND);
};

function addPositionalSymbolId(grammar: HCG3Grammar, production: HCG3Production) {

    const
        { item_map } = grammar,
        items = getStartItemsFromProduction(production),
        sym_map = new Map();

    for (let item of items) {

        const set = new Set;
        let cumulative_id = 0;

        while (1) {
            if (item.atEND) {
                item_map.get(item.id).sym_uid = cumulative_id;
                break;
            } else {

                const sym = getUniqueSymbolName(item.sym(grammar));

                let i = -1;

                while (set.has(sym + ++i));

                set.add(sym + i);

                if (!sym_map.has(sym))
                    sym_map.set(sym, 1 << sym_map.size);

                let id = sym_map.get(sym);


                item_map.get(item.id).sym_uid = id;

                cumulative_id |= id;
            }

            item = item.increment();
        }
    }
}


function addItemMapsToGrammar(item_maps_in_process: ItemMapEntry[], grammar: HCG3Grammar) {

    for (const i of item_maps_in_process) grammar.item_map.set(i.item.id, i);
}


function processFollowSymbols(grammar: HCG3Grammar, productions: HCG3Production[]) {
    const check_set: Set<string>[] = (grammar.productions ?? grammar).map(() => new Set());
    const item_map = [];

    for (const production of productions) {

        const start_symbol = production.ROOT_PRODUCTION ? EOF_SYM : EOP_SYM;

        for (const item of getStartItemsFromProduction(production))
            addFollowInformation(item, grammar, check_set, start_symbol, [item.body_(grammar).production.id], item_map);

    }
}


function processSkippedSymbols(grammar: HCG3Grammar, item_maps_in_process: ItemMapEntry[]) {

    const standard_skips = [];

    for (const skipped_symbol of grammar.meta.ignore)
        standard_skips.push(...skipped_symbol.symbols);

    for (const item_map of item_maps_in_process) {

        const first = item_map.item.atEND
            ? item_map.follow
            : Sym_Is_A_Production(item_map.item.sym(grammar))
                ? new Set(getFirstTerminalSymbols(+item_map.item.sym(grammar).val, grammar).map(getSymbolName))
                : new Set((getTrueSymbolValue(<TokenSymbol>item_map.item.sym(grammar), grammar)).map(getSymbolName));

        item_map.skippable = new Set(
            standard_skips
                .map(getSymbolName)
                .filter(i => !item_map.reset_sym.includes(i))
                .filter(i => !first.has(i))
        );
    }
}

