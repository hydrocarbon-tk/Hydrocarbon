import { FIRST, isNonTerm, filloutGrammar, Item, actions, EMPTY_PRODUCTION } from "../common.mjs";
import { gotoCollisionCheck, reduceCollisionCheck, shiftCollisionCheck } from "./error.mjs";

function ProcessState(items, state, states, grammar, items_set, LALR_MODE = false) {

    const bodies = grammar.bodies;

    if (!state.b) {
        state.b = [grammar[bodies[items[0][0]].production].name, "→", ...bodies[items[0][0]]].map((d) => isNaN(d) ? d : grammar[d].name);
    }

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (item.USED) {
            continue;
        }

        let len = item.len,
            offset = item.offset;

        const body = bodies[item.body];

        if (i == 0 && state.body == undefined)
            state.body = item[0];

        
        if (body[offset] == EMPTY_PRODUCTION) {
            offset=len;
            len=0;
        }

        //Figure out if the item is already in a set. 
        if (offset < len) {
            const k = body[offset];
            //consume additional similar items if possible.
            let new_state, MERGE = false,
                new_items = [item.increment()];
            //States generated here  

            for (let j = i + 1; j < items.length; j++) {
                const o_item = items[j];
                if ((k == bodies[o_item.body][o_item.offset])) {
                    o_item.USED = true;
                    new_items.push(o_item.increment());
                }
            }

            const check = new Set(),
                id = new_items
                .slice()
                .sort((a, b) => a[0] < b[0] ? -1 : 1)
                .sort((a, b) => a[2] < b[2] ? -1 : 1)
                .map(k => (LALR_MODE) ? k.id : k.full_id)
                .reduce((a, k) => a += check.has(k) ? "" : ((check.add(k), k)), ""),
                fnc = (s, items) => {
                    if (s.has(items[0].v))
                        return s.get(items[0].v);
                    return undefined;
                };

            if (
                (new_state = states.map.get(id)) &&
                (
                    (LALR_MODE && (new_state = (new_state.values().next().value))) ||
                    (new_state = fnc(new_state, items))
                )
            ) {
                const out = [];
                new_items.forEach(e => {
                    if (!new_state.sigs.has(e.full_id)) {
                        out.push(e);
                        new_state.sigs.add(e.full_id);
                    }
                });

                if (out.length > 0) {
                    MERGE = true;
                    new_items = out;
                }
            } else {
                MERGE = true;
                states.push({
                    action: new Map,
                    goto: new Map,
                    id: states.length,
                    body: body.production,
                    sigs: new Set(new_items.map((k) => k.full_id)),
                    real_id: id
                });

                new_state = states[states.length - 1];

                if (!states.map.has(id))
                    states.map.set(id, new Map);

                const map = states.map.get(id);
                new_items.forEach(e => map.set(e.v, new_state));
            }

            const ASSOCIATION = (item[0] == state.body) && !!grammar.rules.assc;
            if (!isNonTerm(k)) {
                if (k != "$" /*&& k !== EMPTY_PRODUCTION*/ ) {

                    let SKIP = false;

                    if (state.action.has(k) && (SKIP = true))
                        if (ASSOCIATION && grammar.rules.assc[k] == "right")
                            SKIP = false;

                    if (!SKIP) {
                        if (shiftCollisionCheck(grammar, state, new_state, item))
                            return false;


                        state.action.set(k, { name: "SHIFT", state: new_state.id, body: item[0], len: offset, original_body: body.id });
                    }
                }
            } else {

                if (gotoCollisionCheck(grammar, state, new_state, item))
                    return false;


                state.goto.set(k, { name: "GOTO", state: new_state.id, body: body.id, fid: item.full_id });
            }

            //Add closure
            if (MERGE)
                items_set.push({ c: Closure(new_items, grammar), s: new_state });

        } else {
            const k = item.v;
            
            if(k == EMPTY_PRODUCTION)
                continue;

            if (item.body == 0 && k == "$")
                state.action.set(k, { name: "ACCEPT", size: len, production: body.production, body: body.id, len });

            else {
                const p1 = body.precedence;
                const p2 = item.p;

                if (p2 < p1 && k !== "$" && i > 0)
                    continue;

                if (reduceCollisionCheck(grammar, state, item))
                    return false;


                state.action.set(k, { name: "REDUCE", size: len, production: body.production, body: body.id, len });
            }
        }
    }

    return true;
}


function Closure(items, grammar, offset = 0, added = new Set()) {
    const bodies = grammar.bodies,
        g = items.length;

    for (let i = offset; i < g; i++) {
        const item = items[i],
            body = bodies[item.body],
            len = item.len,
            index = item.offset,
            B = body[index],
            Be = body.slice(index + 1),
            b = item.follow;

        if (index < len && isNonTerm(B)) { //Taking the closure
            let first;

            if (Be.length > 0) {
                first = FIRST(grammar, ...(Be.map(x => isNonTerm(x) ? x : { v: x, p: body.precedence })), b);
            } else {
                first = [b];
            }

            //Add all items B;
            added.add(B);

            const production = grammar[B];

            for (let i = 0; i < production.bodies.length; i++) {
                const pbody = production.bodies[i];

                for (let i = 0; i < first.length; i++) {
                    let item = new Item(pbody.id, pbody.length, 0, first[i].v, first[i].p);
                    let sig = item.full_id;
                    if (!added.has(sig)) {
                        items.push(item);
                        added.add(sig);
                    }
                }
            }
            Closure(items, grammar, g, added);
        }
    }
    return items;
}

function createInitialState(grammar) {
    let states = [{ action: new Map, goto: new Map, id: 0, body: 0 }];
    states.bodies = grammar.bodies;
    states.grammar = grammar;
    states.type = "lr";
    states.map = new Map([]);
    states.count = 1;
    return states;
}

export function LALRTable(grammar, env = {}) {
    /* Storage for Items is determined by three numbers. 
     * 1. The index offset of a production body in a grammar.
     * 2. The length of the production body
     * 3. The offset of the item point. Can equal the value of (2)
     */

    /* Storage for pointers to productions. 
     * All productions are converted to indexes. This includes the bodies of grammars. 
     * The index indicates the start of the first production. Taking the difference of prod[B]- prod[A] gives the number of 
     * bodies in prod[A]
     */
    filloutGrammar(grammar, env);

    const bodies = grammar.bodies,
        start_closure = Closure([new Item(0, bodies[0].length, 0, "$", 0)], grammar);

    let states = createInitialState(grammar),
        items_set = [{ c: start_closure, s: states[0] }],
        LALR_MODE = true,
        i = 0;

    while (items_set.length > 0 && i++ < 100000) {

        const items = items_set.shift();

        if (!ProcessState(items.c, items.s, states, grammar, items_set, LALR_MODE)) {
            if (LALR_MODE) {
                console.error("Unable to continue in LALR mode. Restarting in CLR Mode. \n")
                states = createInitialState(grammar)
                items_set = [{ c: start_closure, s: states[0] }];
                LALR_MODE = false;
            } else {
                console.error("Unable to parse grammar. It does not appear to be a LR grammar.\n")
                states.INVALID = true;
                break;
            }
        }
    }

    if (i == 100000)
        throw new Error("Failed process grammar. Max step limit reached. The current limit is set to 100000 iterations.")

    return states;
}
