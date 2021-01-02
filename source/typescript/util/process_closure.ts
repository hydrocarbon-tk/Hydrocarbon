import { Item, ItemGraphNode } from "./item.js";

import { FIRST } from "./first.js";
import { EOF_SYM, Grammar, SymbolType } from "../types/grammar.js";
import { Symbol, TokenSymbol } from "../types/Symbol";


export function getClosure(items: Item[], grammar: Grammar): Item[] {
    let closure = [];

    for (const item of items) {
        closure.push(...grammar.item_map.get(item.id).closure);
    }

    if (items.length > 1)
        closure = closure.setFilter(i => i);

    return closure.map(i => grammar.item_map.get(i).item);
}



export function getFollow(production_id: number, grammar: Grammar): TokenSymbol[] {
    const prod = grammar[production_id];

    return prod.bodies
        .map(b => new Item(b.id, b.length, b.length, EOF_SYM))
        .flatMap(i => [...grammar.item_map.get(i.id).follow.values()])
        .setFilter()
        .map(sym => <TokenSymbol>grammar.meta.all_symbols.get(sym));
}


export function processClosure(
    items: Item[],
    grammar: Grammar,
    USE_GENERAL_ID = false,
    excludes: any[] = [],
    offset = 0,
    added = new Set(),
    graph_map: Map<string, ItemGraphNode> = new Map()
): { closure: Item[], graph: ClosureGraph, exclusion_count: number; } {
    let exclusion_count = 0;
    const bodies = grammar.bodies,
        g = items.length;


    for (let i = offset; i < g; i++) {

        const
            item = items[i],
            body = bodies[item.body],
            len = item.len,
            index = item.offset,
            B = body.sym[index],
            Be = body.sym.slice(index + 1),
            b = item.follow,
            end = items.length,
            step_excludes = excludes.slice(),
            new_excludes = [],
            out_excludes = [],
            graph_node = getGraphNode(graph_map, item, grammar);

        if (item.atEND) continue;

        if (body.excludes.has(index))
            body.excludes.get(index).forEach(e => step_excludes.push({ body: item.body, symbols: Array.isArray(e) ? e : [e], offset: 0, l: Array.isArray(e) ? e.length : 1, inner_offset: index }));

        for (let u = 0; u < step_excludes.length; u++) {

            const ex = step_excludes[u];

            if (item.body == ex.body && index == ex.inner_offset) {

                const
                    d = ex.offset,
                    j = index, //, clock = 0;
                    i_sym = body.sym[j],
                    e_sym = ex.symbols[d];

                if (i_sym && i_sym.type !== SymbolType.PRODUCTION && i_sym.val == e_sym.val) {

                    if (d == ex.l - 1) {
                        exclusion_count++;
                        item.USED = true;
                        break;
                    }
                    //Excludes going to next round
                    excludes.push({ body: ex.body, symbols: ex.symbols, offset: d + 1, l: ex.l, inner_offset: 0 });
                }
            }
        }

        if (item.USED) continue;

        if (index < len && B.type == SymbolType.PRODUCTION) {

            let first: Symbol[];

            if (Be.length > 0)
                first = FIRST(grammar, ...Be, b);
            else
                first = [b];

            const production = grammar[B.val];

            if (production.graph_id < 0)
                production.graph_id = grammar.graph_id++;



            for (let i = 0; i < production.bodies.length; i++) {
                const
                    pbody = production.bodies[i],
                    body_index = pbody.id,
                    first_mod = ([...first]).concat(...pbody.reduce.values());


                out_excludes.push(...new_excludes.map(e => ({ body: body_index, symbols: e.symbols, offset: e.offset, l: e.l, inner_offset: e.inner_offset })));

                for (let i = 0, l = first_mod.length; i < l; i++) {


                    if (!first_mod[i])
                        continue;

                    const
                        item = new Item(pbody.id, pbody.length, 0, first_mod[i]),
                        sig = (USE_GENERAL_ID) ? item.id : item.full_id,
                        subnode = getGraphNode(graph_map, item, grammar);

                    subnode.supitems.push(graph_node);
                    graph_node.subitems.push(subnode);
                    subnode.supitems = subnode.supitems.setFilter(s => s.item.id);
                    graph_node.subitems = graph_node.subitems.setFilter(s => s.item.id);



                    if (!added.has(sig)) {
                        items.push(item);
                        added.add(sig);
                    }
                }


                if (pbody.reduce && pbody.reduce.size > 0) {
                    pbody.reduce.forEach(v => v.forEach(s => {

                        const
                            item = new Item(pbody.id, pbody.length, 0, s),
                            sig = (USE_GENERAL_ID) ? item.id : item.full_id,
                            subnode = getGraphNode(graph_map, item, grammar);

                        subnode.supitems.push(graph_node);
                        graph_node.subitems.push(subnode);
                        subnode.supitems = subnode.supitems.setFilter(s => s.item.id);
                        graph_node.subitems = graph_node.subitems.setFilter(s => s.item.id);

                        if (!added.has(sig)) {
                            items.push(item);
                            added.add(sig);
                        }
                    })
                    );
                }
            }

            //*
            const
                added_count = items.length - end,
                count = processClosure(items, grammar, USE_GENERAL_ID, out_excludes, g, added, graph_map).exclusion_count;

            if (count > 0 && count == added_count) {
                item.USED = true;
                exclusion_count++;
            }

            exclusion_count += count;
            //*/
        }
    }

    return { closure: items, graph: offset == 0 ? new ClosureGraph(graph_map) : null, exclusion_count };
}

export class ClosureGraph {
    graph: Map<string, ItemGraphNode>;

    constructor(graph: Map<string, ItemGraphNode>) {
        this.graph = graph;
        this.assignGraphID();

    }

    assignGraphID() {
        const graph = this.graph;

        let max_score = 0;
        let i = 0;
        for (const entry of this.graph.values()) {
            entry.score = 1;
            entry.id = i++;
        }
        for (const entry of this.graph.values()) {
            for (const sub_node of entry.subitems) {
                sub_node.score += entry.score;
                max_score = Math.max(max_score, sub_node.score);
            }
        }

        for (const entry of this.graph.values()) {
            entry.score = graph.size * (entry.score / max_score);
        }
    }

    getCommonRoot(...items: Item[]) {
        function getSimpleRoot(graph_node: ItemGraphNode, root_nodes: ItemGraphNode[] = [], visited: Set<number> = new Set): ItemGraphNode[] {
            if (!graph_node) return [];

            let local_roots = [];

            local_roots.push(graph_node);

            if (visited.has(graph_node.id) || graph_node.supitems.length > 1) {
                local_roots = [];
            } else {
                root_nodes.push(graph_node);
            }

            visited.add(graph_node.id);

            for (const supitem of graph_node.supitems) {
                if (supitem && visited.has(supitem.id)) continue;
                root_nodes.push(...getSimpleRoot(supitem, local_roots, visited));
            }

            return root_nodes.setFilter(r => r.item.id).sort((a, b) => b.id - a.id);
        }

        const roots = [...items.map(item => getSimpleRoot(this.graph.get(item?.id)))
            .reduce((r, items: ItemGraphNode[]) => {
                for (const item of items) {
                    if (!r.has(item.id))
                        r.set(item.id, { count: 0, item });
                    r.get(item.id).count++;
                }
                return r;
            }, <Map<number, { count: number, item: ItemGraphNode; }>>new Map).values()]
            .filter(i => i.count == items.length).map(i => i.item);
        return { source: items.filter(i => i).map(i => this.graph.get(i.id)).map(i => i?.name), roots };
    }

    render() {

    }
}


function getGraphNode(graph_map: Map<string, ItemGraphNode>, item: Item, grammar: Grammar) {
    if (!graph_map.has(item.id))
        graph_map.set(item.id, {
            name: item.renderUnformattedWithProductionAndFollow(grammar);
            item,
            subitems: [],
            supitems: []
        });
    return graph_map.get(item.id);
}

