import { FOLLOW, isNonTerm, createFunctions } from "../common.mjs";

export function SLRTable(grammar, env = {}) {

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

    let state_count = 0;
    let production = grammar[0];
    //start with first body
    let body = production.bodies[0];
    let states = [{ action: new Map, goto: new Map, id: state_count++ }];
    states.bodies = bodies;
    states.grammar = grammar;

    let state_maps = new Map();

    let len = body.length;

    let items = [
        [0, len, 0]
    ];

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

                Sets.get(body[index]).push([item[0], len, index + 1]);
                //If new items are set already then either merge or discard. 
            } else {
                let follow = FOLLOW(grammar, body.production);

                const FIRST_PRODUCTION = item[0] == 0;

                follow.forEach((k) => {
                    if (FIRST_PRODUCTION && k == "$")
                        state.action.set("$", { name: "ACCEPT", size: len, production: body.production, body: body.id, len });
                    else
                        state.action.set(k, { name: "REDUCE", size: len, production: body.production, body: body.id, len });
                });
            }
        }

        Sets.forEach((v, k) => {

            //If set is already declared, use that instead.
            let signature = "";
            let full_sig = "";

            v.forEach((k) => {
                let y = k.slice(0, -1).join("");
                full_sig += k.join("");
                if (y != signature) signature += y;
            });
            signature = full_sig;
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
            }
        });
    }

    function Closure(items, offset = 0, added = new Set()) {
        let g = items.length;
        for (let i = offset; i < g; i++) {
            let item = items[i];
            let body = bodies[item[0]];

            let len = item[1];
            let index = item[2];

            let B = body[index];

            if (index < len && isNonTerm(B)) {
                let production = grammar[B];

                for (let i = 0; i < production.bodies.length; i++) {
                    let body = production.bodies[i];

                    let sig = "" + body.id + body.length + 0;

                    if (!added.has(sig)) {
                        items.push([body.id, body.length, 0]);
                        added.add(sig);
                    }
                }

                Closure(items, g, added);
            }
        }

        return items;
    }

    Goto(Closure(items), states[0]);

    return states;
}
