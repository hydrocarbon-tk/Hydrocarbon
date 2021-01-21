import { doesProductionHaveEmpty, getProductionID } from "./production.js";
import { getFirst } from "./first.js";
import { getTrueSymbolValue } from "./code_generating.js";
import {
    getSymbolName,
    getUniqueSymbolName,
    isSymAProduction,
    isSymAProductionToken
} from "./symbol.js";
import { EOF_SYM, Grammar, ItemMapEntry } from "../types/grammar.js";
import { SymbolType } from "../types/symbol_type";
import { Item, ItemIndex } from "./item.js";
import { ProductionSymbol, Symbol, TokenSymbol } from "../types/symbol";
import { Production } from "../types/production.js";

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
        if (isSymAProduction(sym)) {

            follow = [];

            let look_ahead = item.increment(),
                sym = look_ahead.sym(grammar);

            do {

                if (!look_ahead.atEND) {

                    if (isSymAProduction(sym) || isSymAProductionToken(sym)) {
                        follow = follow.concat(getFirst(getProductionID(sym, grammar), grammar)).setFilter(getUniqueSymbolName);
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

    if (isSymAProduction(item_sym) || isSymAProductionToken(item_sym)) {

        const
            parent_prod_id = item.getProduction(grammar).id,
            prod_id = getProductionID(item_sym, grammar),
            prod: Production = grammar[prod_id];

        for (const body of prod.bodies) {

            for (const follow_sym of follow) {

                const
                    new_item = new Item(body.id, body.length, 0, follow_sym),
                    id = new_item.full_id;
                if (!check_set[prod_id].has(id)) {
                    check_set[prod_id].add(id);
                    addFollowInformation(new_item, grammar, check_set, follow_sym, breadcrumbs.concat([parent_prod_id]), item_map);
                } else {
                    const new_item = new Item(body.id, body.length, body.length, follow_sym);
                    grammar.item_map.get(new_item.id).follow.add(getUniqueSymbolName(follow_sym));
                }
            }
        }
    }

    addFollowInformation(item.increment(), grammar, check_set, follow_sym, breadcrumbs, item_map);
}

export function getItemMapEntry(grammar: Grammar, item_id: string): ItemMapEntry {
    if (!grammar.item_map.has(item_id)) {
        grammar.item_map.set(item_id, <ItemMapEntry>{
            item: null,
            closure: null,
            containing_items: new Set,
            depth: Infinity
        });
    }

    return grammar.item_map.get(item_id);
}

export function buildItemMap(grammar: Grammar) {

    const
        production_ready = grammar.map(i => ({ count: 0, items: null })),

        items_sets: ItemMapEntry[] = grammar.flatMap(p => {

            const items = p.bodies.map(b => {

                const out_syms: ItemMapEntry[] = [];

                let item = new Item(b.id, b.length, 0, EOF_SYM);

                let depth = b.id + p.id * grammar.length;

                do {

                    if (!item.atEND) {
                        const sym = item.sym(grammar);
                        if (isSymAProduction(sym) && sym.subtype) {
                            const sub_production = grammar[sym.val];

                            for (const body of sub_production.bodies) {
                                body.reset.set(0, b.reset.get(0));
                            }
                        }
                    }

                    const reset_sym = item.offset >= 0 ? (b.reset.get(item.offset) ?? []).map(getUniqueSymbolName) : [];

                    out_syms.push(<ItemMapEntry>{
                        item,
                        closure: [],
                        reset_sym,
                        LR: false,
                        RR: [],
                        excludes: b.excludes.get(item.offset) ?? [],
                        rank: item.offset,
                        depth: depth,
                        hash: "",
                        follow: new Set,
                        skippable: null,
                        containing_items: new Set,
                        breadcrumbs: new Set
                    });
                    depth++;
                } while (item = item.increment());

                return out_syms;
            });

            production_ready[p.id].items = items.map(i => i[0]);

            return items.flat();
        });

    /////////////////////////////////////////////////////////////
    // Compile closure information
    let CHANGE = true, pending: ItemMapEntry[] = items_sets.slice();

    while (CHANGE || pending.length > 0) {

        CHANGE = false;

        let temp_pending = pending.slice();

        pending.length = 0;

        for (const obj of temp_pending) {

            const { closure, item, excludes, hash } = obj;

            let temp = [];

            temp.push(item);

            if (item.atEND) {
                obj.closure = temp;
                continue;
            };

            const sym = item.sym(grammar);

            if (sym.type == SymbolType.PRODUCTION) {
                const prod_id = sym.val;
                temp.push(...production_ready[prod_id].items.flatMap(i => i.closure));
            }

            temp = temp.setFilter(i => i.id);

            let new_hash = temp.map(i => i.id).sort().join("");

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

            if (obj.hash != new_hash)
                pending.push(obj);

            else
                CHANGE = true;

            obj.closure = temp;
            obj.hash = new_hash;
        }
    }

    // Assign item map to grammar
    grammar.item_map = new Map(items_sets.map(i => [i.item.id, i]));

    /////////////////////////////////////////////////////////////
    // Add recursion information
    for (const obj of items_sets) {

        const { item } = obj, item_id = item.id;

        //Convert items to their string identifier to be more data friendly when transferring to workers. 
        obj.closure = (<Item[]><any>obj.closure).map(i => i.id);

        for (const sub_item_id of obj.closure)
            if (item_id !== sub_item_id)
                getItemMapEntry(grammar, sub_item_id).containing_items.add(item_id);
    }

    /////////////////////////////////////////////////////////////
    //Add Follow Information
    const check_set: Set<string>[] = grammar.map(() => new Set());
    const item_map = [];
    for (const b of grammar.flatMap(d => d.bodies))
        addFollowInformation(new Item(b.id, b.length, 0, EOF_SYM), grammar, check_set, EOF_SYM, [b.production.id], item_map);

    /////////////////////////////////////////////////////////////
    //Add ignored symbol information
    const standard_skips = [];

    for (const i of grammar.meta.ignore)
        standard_skips.push(...i.symbols);

    for (const obj of items_sets) {

        const first = obj.item.atEND
            ? obj.follow
            : isSymAProduction(obj.item.sym(grammar))
                ? new Set(getFirst(+obj.item.sym(grammar).val, grammar).map(getSymbolName))
                : new Set((getTrueSymbolValue(<TokenSymbol>obj.item.sym(grammar), grammar)).map(getSymbolName));

        obj.skippable = new Set(
            standard_skips
                .filter(i => {
                    if (isSymAProductionToken(i) && (obj.breadcrumbs.has(getProductionID(i, grammar)))) {
                        return false;
                    }
                    return true;
                })
                .map(getSymbolName)
                .filter(i => !obj.reset_sym.includes(i))
                .filter(i => !first.has(i))
        );
    }

    return items_sets;
}
