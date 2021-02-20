import { Grammar, ProductionBody } from "../types/grammar.js";
import { Production, VirtualProduction } from "../types/production.js";
import { Item } from "./item.js";
import { buildItemMaps } from "./item_map.js";
import { getUniqueSymbolName } from "./symbol.js";

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
                    name: `virtual-${item.id}`,
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
    }

    return { links: output, V_PRODS_ALREADY_EXIST };
}
