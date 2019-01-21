import { FIRST, isNonTerm, filloutGrammar } from "../common.mjs";

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

    let bodies = grammar.bodies;

    //start with first body
    let body = bodies[0];
    let state_count = 0;

    let states = [{ action: new Map, goto: new Map, id: state_count++, body: 0 }];
    states.bodies = bodies;
    states.grammar = grammar;
    states.type = "lr";

    let state_maps = new Map();

    let len = body.length;

    let items = [
        [0, len, 0, { v: "$", p: 0 }]
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
                    first = FIRST(grammar, ...(Be.map(x => isNonTerm(x) ? x : { v: x, p: body.precedence })), b);
                } else {
                    first = [b];
                }

                //Add all items B;
                added.add(B);

                let production = grammar[B];

                for (let i = 0; i < production.bodies.length; i++) {
                    let body = production.bodies[i];

                    for (let i = 0; i < first.length; i++) {

                        let sig = "" + body.id + body.length + 0 + (first[i].v);

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

    const GOTO = [];

    function Goto(items, state) {
        let state_body = 0;
        let Sets = new Map();
        outer:
            for (let i = 0; i < items.length; i++) {
                let item = items[i];
                let body = bodies[item[0]];
                let len = item[1];
                let index = item[2];

                if (i == 0)
                    state_body = item[0];
                //Figure out if the item is already in a set. 
                if (index < len) {
                    //States generated here
                    let k = /*body[index][0] == "τ" ? body[index].slice(1) :*/ body[index]
                    let set = Sets.get(k);
                    
                    if (!set) {
                        set = [];
                        set.body = item[0];
                        set.len = index;
                        Sets.set(k, set);
                    }

                    set.push([item[0], len, index + 1, item[3]])
                    //If new items are set already then either merge or discard. 
                } else {
                    let k = item[3].v;
                        let p1 = body.precedence;
                        let p2 = item[3].p;

                    if (item[0] == 0 && k == "$")
                        state.action.set(k, { name: "ACCEPT", size: len, production: body.production, body: body.id, len });
                    else {
                      //*  
                        if (p2 < p1 && k !== "$" && i > 0) {
                            continue outer;
                        }//*/
                        state.action.set(k, { name: "REDUCE", size: len, production: body.production, body: body.id, len });
                    }
                }
            }

        Sets.forEach((v, k) => {

            let ASSOCIATION = v[0][0] == state_body && !!grammar.rules.assc;

            //If set is already declared, use that instead.
            let signature = "";
            let full_sig = "";

            v.forEach((k) => {
                let y = k.slice(0, -1).join("");
                full_sig += y + k[3].v;
                if (y != signature) signature += y;
            });

            let PROCESSED_STATE = state_maps.get(signature);

            let state_id = (PROCESSED_STATE) ? PROCESSED_STATE.id : state_count++;

            if (!isNonTerm(k)) {
                if (k != "$") {
                    let SKIP = false;
                    if (state.action.has(k)) {
                        SKIP = true; // Favor reductions
                        if (ASSOCIATION) {
                            if (grammar.rules.assc[k] == "right")
                                SKIP = false;
                        }
                    }
                    if (!SKIP)
                        state.action.set(k, { name: "SHIFT", state: state_id, body: v.body, len: v.len });
                }
            } else
                state.goto.set(k, state_id);

            //Set transitions for this function. 
            if (!PROCESSED_STATE) {
                let new_state = { action: new Map, goto: new Map, id: state_id, body: bodies[v.body].production };
                states.push(new_state);
                state_maps.set(signature, { id: state_id, sig: new Set([full_sig]) });
                GOTO.push({c:Closure(v),s:new_state});
                //Goto(Closure(v), new_state);
            } else { //Merge the states
                let DIFF_MERGE = !PROCESSED_STATE.sig.has(full_sig);
                if (DIFF_MERGE) {
                    PROCESSED_STATE.sig.add(full_sig);
                    GOTO.push({c:Closure(v),s:states[PROCESSED_STATE.id]});
                    //Goto(Closure(v), states[PROCESSED_STATE.id]);
                }
            }
        });
    }

    GOTO.push({c:Closure(items),s:states[0]})

    while(GOTO.length > 0){
        const item = GOTO.shift();
        Goto(item.c, item.s);
    }
    
    return states;
}
