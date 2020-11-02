import { Item } from "./item.js";

import { FIRST } from "./first.js";
import { Grammar } from "../types/grammar.js";
import { Symbol } from "../types/Symbol";

export function processClosure(items: Item[], grammar: Grammar, USE_GENERAL_ID = false, excludes: any[] = [], offset = 0, added = new Set(), last_production = -1) {

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
            out_excludes = [];

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

                if (i_sym && i_sym.type !== "production" && i_sym.val == e_sym.val) {

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

        if (item.USED)
            continue;

        if (index < len && B.type == "production") {
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
                        sig = (USE_GENERAL_ID) ? item.id : item.full_id;

                    item.last_production = last_production;

                    if (!added.has(sig)) {
                        items.push(item);
                        added.add(sig);
                    }
                }


                if (pbody.reduce && pbody.reduce.size > 0)
                    pbody.reduce.forEach(v => v.forEach(s => {

                        const
                            item = new Item(pbody.id, pbody.length, 0, s),
                            sig = (USE_GENERAL_ID) ? item.id : item.full_id;

                        item.last_production = last_production;

                        if (!added.has(sig)) {
                            items.push(item);
                            added.add(sig);
                        }
                    })

                    );
            }

            const
                added_count = items.length - end,
                count = processClosure(items, grammar, USE_GENERAL_ID, out_excludes, g, added, last_production >= 0 ? last_production : production.id);


            if (count > 0 && count == added_count) {
                item.USED = true;
                exclusion_count++;
            }

            exclusion_count += count;
        }
    }
    return exclusion_count;
}
