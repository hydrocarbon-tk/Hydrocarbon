import { getStartItemsFromProduction } from "../compiler/function_constructor.js";
import { EOF_SYM, Grammar, ItemMapEntry } from "../types/grammar.js";
import { Production } from "../types/production.js";
import { ProductionSymbol, Symbol, TokenSymbol } from "../types/symbol";
import { SymbolType } from "../types/symbol_type";
import { getTrueSymbolValue } from "./code_generating.js";
import { getFirstTerminalSymbols } from "./first.js";
import { Item } from "./item.js";
import { doesProductionHaveEmpty, getProductionID } from "./production.js";
import {
    getSymbolName,
    getUniqueSymbolName,
    Sym_Is_A_Production,
    Sym_Is_A_Production_Token
} from "./symbol.js";

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

export function buildItemMaps(grammar: Grammar, productions: Production[] = grammar) {

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
    convertItemMapClosureItemsToStrings(item_maps_in_process, grammar);

    /////////////////////////////////////////////////////////////
    processFollowSymbols(grammar, productions);

    /////////////////////////////////////////////////////////////
    processSkippedSymbols(grammar, item_maps_in_process);

    return item_maps_in_process;
}

function getItemMapVariables(grammar: Grammar, productions: Production[]) {
    const
        extant_production_item_maps = grammar.map(p => ({
            count: 0, item_maps: grammar != productions ? getInterMediateItemMapEntriesFromProduction(p, grammar) : []
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
                            const sub_production = grammar[sym.val];

                            for (const body of sub_production.bodies) {
                                body.reset.set(0, b.reset.get(0));
                            }
                        }
                    }

                    const reset_sym = item.offset >= 0 ? (b.reset.get(item.offset) ?? []).map(getUniqueSymbolName) : [];

                    out_syms.push(<IntermediateItemMapEntry>{
                        item,
                        closure: [],
                        reset_sym,
                        excludes: b.excludes.get(item.offset) ?? [],
                        rank: item.offset,
                        // depth: depth,
                        hash: "",
                        follow: new Set,
                        skippable: null,
                        containing_items: new Set,
                        breadcrumbs: new Set
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

function getInterMediateItemMapEntriesFromProduction(p: Production, grammar: Grammar): (ItemMapEntry & { closure: Item[]; })[] {
    return getStartItemsFromProduction(p).map(i => getItemMapEntry(grammar, i.id))
        .filter(_ => _)
        .map(i => Object.assign({}, i, { closure: i.closure.map(i => getItemMapEntry(grammar, i).item) }));
}

function ensureGrammarHasItemMap(grammar: Grammar) {
    if (!grammar.item_map) grammar.item_map = new Map;
}

function addFollowInformation(item: Item, grammar: Grammar, check_set: Set<string>[], follow_sym: TokenSymbol = EOF_SYM, breadcrumbs = [], item_map) {

    for (const crumb of breadcrumbs)
        grammar.item_map.get(item.id).breadcrumbs.add(crumb);

    if (item.atEND) {
        grammar.item_map.get(item.id).follow.add(getUniqueSymbolName(follow_sym));
        return;
    }

    item_map.push(item.renderUnformattedWithProduction(grammar));

    let sym: Symbol =
        !item.increment().atEND
            ? item.increment().sym(grammar)
            : null,
        item_sym = item.sym(grammar),
        follow: TokenSymbol[] = [follow_sym];

    if (sym)
        if (Sym_Is_A_Production(sym)) {

            follow = [];

            let look_ahead = item.increment(),
                sym = look_ahead.sym(grammar);

            do {

                if (!look_ahead.atEND) {

                    if (Sym_Is_A_Production(sym) || Sym_Is_A_Production_Token(sym)) {
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

    if (Sym_Is_A_Production(item_sym) || Sym_Is_A_Production_Token(item_sym)) {

        const
            parent_prod_id = item.getProduction(grammar).id,
            prod_id = getProductionID(item_sym, grammar),
            prod: Production = grammar[prod_id];

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

                    grammar.item_map.get(new_item.id).follow.add(getUniqueSymbolName(follow_sym));

                }
            }
        }
    }

    addFollowInformation(item.increment(), grammar, check_set, follow_sym, breadcrumbs, item_map);
}

export function getItemMapEntry(grammar: Grammar, item_id: string): ItemMapEntry {
    if (!grammar.item_map.has(item_id)) {
        return null;
        grammar.item_map.set(item_id, <ItemMapEntry>{
            item: null,
            closure: [],
            containing_items: new Set,
            //depth: Infinity
        });
    }

    return grammar.item_map.get(item_id);
}

function processClosures(
    grammar: Grammar,
    item_maps_in_process: ItemMapEntry[],
    extant_production_item_maps: { count: number, item_maps: ItemMapEntry[]; }[]
) {
    let CHANGE = true, pending_item_maps_scratch: ItemMapEntry[] = item_maps_in_process.slice();

    while (CHANGE || pending_item_maps_scratch.length > 0) {

        CHANGE = false;

        let pending_item_maps = pending_item_maps_scratch.slice();

        pending_item_maps_scratch.length = 0;

        for (const item_map of pending_item_maps) {

            const { item, excludes } = item_map;

            let temp = [];

            temp.push(item);

            if (item.atEND) { item_map.closure = temp; continue; };

            const sym = item.sym(grammar);

            if (sym.type == SymbolType.PRODUCTION) {
                const prod_id = sym.val;
                temp.push(...extant_production_item_maps[prod_id].item_maps.flatMap(i => i.closure));
            }

            let new_hash = temp.map(i => i.id).setFilter().sort().join("");

            for (const exclude of excludes) {

                outer: for (let i = 0; i < temp.length; i++) {
                    let itm = Item.fromArray(<Item>temp[i]);
                    if (itm.length < exclude.length)
                        continue;
                    itm[2] = exclude.length - 1;

                    for (let i = exclude.length - 1; i >= 0; i--) {
                        const sym = itm.sym(grammar);
                        if (getUniqueSymbolName(sym) != getUniqueSymbolName(exclude[i]))
                            continue outer;
                        itm = itm.decrement();
                    }
                    temp.splice(i--, 1);
                }
            }

            if (item_map.hash != new_hash)
                pending_item_maps_scratch.push(item_map);
            else
                CHANGE = true;

            item_map.closure = temp;
            item_map.hash = new_hash;
        }
    }
}


function addItemMapsToGrammar(item_maps_in_process: ItemMapEntry[], grammar: Grammar) {
    for (const i of item_maps_in_process) grammar.item_map.set(i.item.id, i);
}

function convertItemMapClosureItemsToStrings(item_maps_in_process: ItemMapEntry[], grammar: Grammar) {
    for (const item_map of item_maps_in_process) {

        const { item } = item_map, item_id = item.id;

        //Convert items to their string identifier to be more data friendly when transferring to workers. 
        item_map.closure = (<Item[]><any>item_map.closure).map(i => i.id).setFilter();

        //for (const sub_item_id of item_map.closure)
        //    if (item_id !== sub_item_id)
        //        getItemMapEntry(grammar, sub_item_id).containing_items.add(item_id);
    }
}

function processFollowSymbols(grammar: Grammar, productions: Production[]) {
    const check_set: Set<string>[] = grammar.map(() => new Set());
    const item_map = [];
    for (const item of productions.flatMap(getStartItemsFromProduction))
        addFollowInformation(item, grammar, check_set, EOF_SYM, [item.body_(grammar).production.id], item_map);
}


function processSkippedSymbols(grammar: Grammar, item_maps_in_process: ItemMapEntry[]) {

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
                .filter(i => {
                    if (Sym_Is_A_Production_Token(i) && (item_map.breadcrumbs.has(getProductionID(i, grammar)))) {
                        return false;
                    }
                    return true;
                })
                .map(getSymbolName)
                .filter(i => !item_map.reset_sym.includes(i))
                .filter(i => !first.has(i))
        );
    }
}

