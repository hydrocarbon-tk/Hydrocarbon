import { FIRST, isNonTerm, createFunctions } from "../common.mjs";

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

    let bodies = [];

    for (let i = 0, j = 0; i < grammar.length; i++) {
        let production = grammar[i];
        for (let i = 0; i < production.bodies.length; i++, j++) {
            let body = production.bodies[i];
            body.id = j;
            bodies.push(body);
            createFunctions(body, env);
        }
    }

    let production = grammar[0];
    //start with first body
    let body = production.bodies[0];

    let state_count = 0;

    let states = [{ action: new Map, goto: new Map, id: state_count++ }];
    states.bodies = bodies;
    states.grammar = grammar;

    let state_maps = new Map();

    let len = body.length;

    let items = [
        [0, len, 0, "$"]
    ];

    function Closure(items, offset = 0, added = new Set()) {
        let g = items.length;

        for (let i = offset; i < g; i++) {
            let item = items[i];
            let body = bodies[item[0]];

            let len = item[1];
            let index = item[2];

            let B = body[index];
            let Be = body.slice(index + 1);
            let b = item[3];

            if (index < len && isNonTerm(B)) { //Taking the closure

                let first;

                if (Be.length > 0) {
                    first = FIRST(grammar, ...Be, b);
                } else {
                    first = [b];
                }

                //Add all items B;
                added.add(B);

                let production = grammar[B];

                for (let i = 0; i < production.bodies.length; i++) {
                    let body = production.bodies[i];
                    for (let i = 0; i < first.length; i++) {

                        let sig = "" + body.id + body.length + 0 + first[i];

                        if (!added.has(sig)) {
                            items.push([body.id, body.length, 0, first[i]]);
                            added.add(sig);
                        }
                    }
                }

                Closure(items, g, added);
            }
        }

        return items;
    }


    function Goto(items, state) {
        let Sets = new Map();

        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let body = bodies[item[0]];
            let len = item[1];
            let index = item[2];


            //Figure out if the item is already in a set. 
            if (index < len) {
                //States generated here

                if (!Sets.has(body[index])) {
                    Sets.set(body[index], []);
                    Sets.get(body[index]).body = item[0];
                    Sets.get(body[index]).len = index;
                }

                Sets.get(body[index]).push([item[0], len, index + 1, item[3]]);
                //If new items are set already then either merge or discard. 
            } else {
                if (item[0] == 0 && item[3] == "$")
                    state.action.set("$", { name: "ACCEPT", size: len, production: body.production, body: body.id, len });
                else {
                    state.action.set(item[3], { name: "REDUCE", size: len, production: body.production, body: body.id, len });
                }
            }
        }

        Sets.forEach((v, k) => {

            //If set is already declared, use that instead.
            let signature = "";
            let full_sig = "";

            v.forEach((k) => { let y = k.slice(0, -1).join("");
                full_sig += k.join(""); if (y != signature) signature += y; });

            let PROCESSED_STATE = state_maps.get(signature);

            let state_id = (PROCESSED_STATE) ? PROCESSED_STATE.id : state_count++;

            if (!isNonTerm(k)) {
                if (k != "$") 
                    state.action.set(k, { name: "SHIFT", state: state_id, body: v.body, len: v.len });
            } else
                state.goto.set(k, state_id);

            //Set transitions for this function. 

            if (!PROCESSED_STATE) {
                let new_state = { action: new Map, goto: new Map, id: state_id };
                states.push(new_state);
                state_maps.set(signature, { id: state_id, sig: new Set([full_sig]) });
                Goto(Closure(v), new_state);
            } else { //Merge the states
                let DIFF_MERGE = !PROCESSED_STATE.sig.has(full_sig);
                if (DIFF_MERGE) {
                    PROCESSED_STATE.sig.add(full_sig);
                    Goto(Closure(v), states[PROCESSED_STATE.id]);
                }
            }
        });
    }

    Goto(Closure(items), states[0]);

    //get the closure 
    return states;
}
