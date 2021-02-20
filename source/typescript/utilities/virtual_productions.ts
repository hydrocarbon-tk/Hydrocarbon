import { Grammar, ProductionBody } from "../types/grammar.js";
import { Production, VirtualProduction } from "../types/production.js";
import { RenderBodyOptions } from "../types/render_body_options.js";
import { Item } from "./item.js";
import { buildItemMaps, getItemMapEntry } from "./item_map.js";
import { getFollowSymbolsFromItems, getSymbolsFromClosure, getUniqueSymbolName, Sym_Is_A_Terminal } from "./symbol.js";

function remapBodyModifiers<B>(map: Map<number, B>, item: Item): Map<number, B> {
    return new Map([...map.entries()]
        .filter(([number]) => number >= item.offset)
        .map(([number, value]) => [number - item.offset, value]));
}
export type VirtualProductionLinks = Map<string, { p: Production; i: number; }>;
export function createVirtualProductions(items: Item[], options: RenderBodyOptions): {
    V_PRODS_ALREADY_EXIST: boolean;
    links: VirtualProductionLinks;
} {
    const output: VirtualProductionLinks = new Map;
    const { grammar } = options;

    let V_PRODS_ALREADY_EXIST = false;
    let i = 0;

    //Check to so if these virtual productions already exist
    if (items.every(i => i.getProduction(grammar).type == "virtual-production")) {

        for (const item of items)
            output.set(item.id, { p: item.getProduction(grammar), i: i++ });

        V_PRODS_ALREADY_EXIST = true;

    } else {

        //Create virtual productions for this item. 

        for (const item of items) {
            const
                body = item.body_(grammar),
                sym = body.sym.slice(item.offset),
                virtual_body = <ProductionBody>{
                    id: grammar.bodies.length,
                    name: `virtual-body-${item.id}`,
                    BUILT: true,
                    FORK_ON_ENTRY: false,
                    error: null,
                    sym: sym,
                    excludes: remapBodyModifiers(body.excludes, item),
                    reset: remapBodyModifiers(body.reset, item),
                    ignore: remapBodyModifiers(body.ignore, item),
                    length: sym.length,
                    uid: sym.map(getUniqueSymbolName).join(":"),
                    production: null,
                },

                production = <VirtualProduction>{
                    id: grammar.length,
                    name: `virtual-${item.id}-lvl:${options.VIRTUAL_LEVEL}`,
                    type: "virtual-production",
                    HAS_EMPTY: false,
                    CHECKED_FOR_EMPTY: false,
                    IMPORTED: false,
                    bodies: [virtual_body],
                    original_item: item
                };

            virtual_body.production = production;

            grammar.bodies.push(virtual_body);
            grammar.push(production);
            output.set(item.id, { p: production, i: i++ });
        }

        buildItemMaps(grammar, Array.from(output.values()).map(({ p }) => p));

        for (const [item_id, { p: production }] of output.entries()) {
            const item_map = getItemMapEntry(grammar, getItemMapEntry(grammar, item_id).item.toEND().id);
            const body = production.bodies[0];
            const v_item = new Item(body.id, body.length, body.length);
            const v_item_map = getItemMapEntry(grammar, v_item.id);

            if (item_map.item.atEND) {
                for (const value of item_map.follow.values())
                    v_item_map.follow.add(value);
            } else {
                let next_item_map = getItemMapEntry(grammar, item_map.item.increment().id);
                const closure = next_item_map.closure.map(i => getItemMapEntry(grammar, i).item);
                for (const sym of getSymbolsFromClosure(closure, grammar).filter(Sym_Is_A_Terminal).map(getUniqueSymbolName))
                    v_item_map.follow.add(sym);
            }
        }
    }

    return { links: output, V_PRODS_ALREADY_EXIST };
}
