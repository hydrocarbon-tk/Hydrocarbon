import { doesProductionHaveEmpty, getProductionFirst, getProductionID } from "./production.js";
import { getTrueSymbolValue } from "./code_generating.js";
import {
    getUniqueSymbolName,
    isSymAProduction,
    isSymAProductionToken
} from "./symbol.js";
import { EOF_SYM, Grammar, ItemMapEntry } from "../types/grammar.js";
import { SymbolType } from "../types/symbol_type";
import { Item, ItemIndex } from "./item.js";
import { Symbol, TokenSymbol } from "../types/symbol";
import { Production } from "../types/production.js";



function addFollowInformation(item: Item, grammar: Grammar, check_set: Set<string>[], follow_sym: TokenSymbol = EOF_SYM, item_map) {

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

            //follow = follow.concat(getProductionFirst(sym.val, grammar));

            let look_ahead = item.increment(),
                sym = look_ahead.sym(grammar);

            do {

                if (!look_ahead.atEND) {

                    if (isSymAProduction(sym) || isSymAProductionToken(sym)) {
                        follow = follow.concat(getProductionFirst(getProductionID(sym, grammar), grammar)).setFilter(getUniqueSymbolName);
                    } else {
                        follow = follow.concat(sym).setFilter(getUniqueSymbolName);
                        break;
                    }

                } else {
                    follow.push(follow_sym);
                    break;
                }

                look_ahead = look_ahead.increment();

            } while (doesProductionHaveEmpty(getProductionID(sym, grammar), grammar));

        } else follow = getTrueSymbolValue(sym, grammar);

    if (isSymAProduction(item_sym) || isSymAProductionToken(item_sym)) {

        const
            prod_id = getProductionID(item_sym, grammar),
            prod: Production = grammar[prod_id];

        item_map.push(grammar[prod_id].name);
        for (const body of prod.bodies) {

            for (const follow_sym of follow) {

                const
                    new_item = new Item(body.id, body.length, 0, follow_sym),
                    id = new_item.full_id;

                if (!check_set[prod_id].has(id)) {
                    check_set[prod_id].add(id);
                    addFollowInformation(new_item, grammar, check_set, follow_sym, item_map);
                } else {
                    new_item[ItemIndex.offset] = new_item[ItemIndex.length];
                    grammar.item_map.get(new_item.id).follow.add(getUniqueSymbolName(follow_sym));
                }
            }
        }
    }

    addFollowInformation(item.increment(), grammar, check_set, follow_sym, item_map);
}
export function buildItemMap(grammar: Grammar) {
    buildItemClosures(grammar);
}
export function getItemMapEntry(grammar: Grammar, item_id: string): ItemMapEntry {
    if (!grammar.item_map.has(item_id)) {
        grammar.item_map.set(item_id, <ItemMapEntry>{
            item: null,
            closure: null,
            LR: false,
            RR: null,
            //index: -1,
            containing_items: new Set,
            depth: Infinity
        });
    }

    return grammar.item_map.get(item_id);
}

export function buildItemClosures(grammar: Grammar) {
    const
        production_ready = grammar.map(i => ({ count: 0, items: null })),
        items_sets: ItemMapEntry[] = grammar.flatMap(p => {
            // If there are any reduces on p add to the 
            const items = p.bodies.map(b => {
                const out_syms: ItemMapEntry[] = [];
                let item = new Item(b.id, b.length, 0, EOF_SYM);
                let depth = b.id + p.id * grammar.length;
                do {
                    if (!item.atEND && item.sym(grammar).type == SymbolType.PRODUCTION) {
                        const other_prod = item.getProductionAtSymbol(grammar);
                        if (item.len - item.offset == 1) {
                            other_prod.follow_ref.push(p.id);
                        }
                    }

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
                        containing_items: new Set
                    });
                    depth++;
                } while (item = item.increment());

                return out_syms;
            });
            production_ready[p.id].all_items = items;
            production_ready[p.id].items = items.map(i => i[0]);

            return items.flat();
        });

    /////////////////////////////////////////////////////////////
    // Compile closure information
    let CHANGE = true, pending: ItemMapEntry[] = items_sets.slice(); //.concat(prods);

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

        const { item, closure } = obj,
            item_id = item.id,
            production_id = item.getProduction(grammar).id;

        const LR = item.offset == 0 &&
            closure.filter((i: any) => i?.sym(grammar)?.type == SymbolType.PRODUCTION).some((i: any) => (<Item>i).getProductionAtSymbol(grammar).id == production_id);

        //Right recursion occurs when the origin item shows up in a shifted item's list. 
        const RR = item.offset > 0
            ? closure.slice(1).filter(i => i?.sym(grammar)?.type != SymbolType.PRODUCTION)
                .filter(i => i.body == item.body)
                .map(i => getUniqueSymbolName(i.sym(grammar)))
            : [];

        //Convert items to their string identifier to be more data friendly when transferring to workers. 
        obj.closure = obj.closure.map(i => i.id);

        for (const sub_item_id of obj.closure)
            if (item_id !== sub_item_id)
                getItemMapEntry(grammar, sub_item_id).containing_items.add(item_id);

        obj.LR = LR;
        obj.RR = RR;
    }

    /////////////////////////////////////////////////////////////
    //Add Follow Information
    const check_set: Set<string>[] = grammar.map(() => new Set());
    const item_map = [];
    for (const b of grammar[0].bodies)
        addFollowInformation(new Item(b.id, b.length, 0, EOF_SYM), grammar, check_set, EOF_SYM, item_map);

    /////////////////////////////////////////////////////////////
    //Add ignored symbols information
    const standard_skips = [];

    for (const i of grammar.meta.ignore)
        standard_skips.push(...i.symbols);

    for (const obj of items_sets) {

        const first = obj.item.atEND
            ? obj.follow
            : isSymAProduction(obj.item.sym(grammar))
                ? new Set(getProductionFirst(obj.item.sym(grammar).val, grammar).map(getUniqueSymbolName))
                : new Set((getTrueSymbolValue(obj.item.sym(grammar), grammar)).map(getUniqueSymbolName));

        obj.skippable = new Set(
            standard_skips
                .map(getUniqueSymbolName)
                .filter(i => !obj.reset_sym.includes(i))
                .filter(i => !first.has(i))
        );
    }

    return items_sets;
}
