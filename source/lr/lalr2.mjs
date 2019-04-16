"use strict";

import { FIRST, isNonTerm, filloutGrammar, Item, actions, EMPTY_PRODUCTION } from "../common.mjs";
import { gotoCollisionCheck, reduceCollisionCheck, shiftCollisionCheck } from "./error.mjs";

function MergeFind(states, id){
    return undefined;
}

function ProcessState(items, state, states, grammar, items_set, LALR_MODE = false) {

    const bodies = grammar.bodies;

    if (!state.b) 
        state.b = [grammar[bodies[items[0][0]].production].name, "→", ...bodies[items[0][0]]].map((d) => isNaN(d) ? d : grammar[d].name);

    for(let i = 0, l = items.length;i<l; i++){
        let item = items[i],
            len = item.len,
            offset = item.offset;
        const body = bodies[item.body];

        if(item.USED)
            continue;

        if(offset >= len){ //At an accepting state for this input
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

                switch(reduceCollisionCheck(grammar, state, item)){
                    case -1: 
                        return false;
                    case 0:
                         state.action.set(k, { name: "REDUCE", size: len, production: body.production, body: body.id, len });
                         break;        
                }
            }
        }else{
            let getSym =(i)=>bodies[i[0]][i.offset];
            const k = body[offset];
            item.USED = true;
            let new_item = item.increment(), 
                new_state = null,
                sid = new_item.id, 
                osid = getSym(item),
                id_append = new Set([new_item.follow.v]),
                out_items = [new_item];

            for(let j = i+1; j < l; j++)
                if(getSym(items[j]) == osid){
                    out_items.push(items[j].increment());
                    items[j].USED = true;
                    id_append.add(items[j].follow.v);
                }
        
            if(!LALR_MODE)
                sid += [...id_append.values()].sort((a,b)=>a<b?-1:1).join("");

            let MERGE = true;

            if(states.map.has(sid)){
                new_state = states.map.get(sid);
            }else{
                states.push({
                    action: new Map,
                    goto: new Map,
                    id: states.length,
                    body: body.production,
                    b:[grammar[bodies[new_item[0]].production].name, "→", ...bodies[new_item[0]]].map((d) => isNaN(d) ? d : grammar[d].name),
                    sigs: 'dd', //new Set(new_items.map((k) => k.full_id)),
                    real_id: sid,
                    follows: null
                });

                new_state = states[states.length - 1];

                states.map.set(sid, new_state);
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
                    
                switch(gotoCollisionCheck(grammar, state, new_state, item)){
                    case -1: //Original
                        MERGE = false;
                        break;
                    case 0: //Failed
                        return false;
                    case 1: //New
                        state.goto.set(k, { name: "GOTO", state: new_state.id, body: body.id, fid: item.full_id });
                        break;
                }
            }

            if (new_state.follows){
                if(new_state.follows.has(new_item.follow.v))
                    continue; // Already parsed the new_state with this item. 
                id_append.forEach(function(e){this.add(e)}, new_state.follows);
            }else
                new_state.follows = id_append;
            

            items.s = new_state;

            items_set.push({ c: Closure(out_items, grammar), s: new_state });
        }
    }
    return true;
}


function Closure(items, grammar, offset = 0, added = new Set(), exclude = []) {
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

            let out_exclude = exclude;

            if(body.exclude)
                out_exclude = out_exclude.concat(body.exclude);

            if (Be.length > 0) {
                first = FIRST(grammar, ...(Be.map(x => isNonTerm(x) ? x : { v: x, p: body.precedence })), b);
            } else {
                first = [b];
            }



            //Add all items B;
            added.add(B);

            const production = grammar[B];
            let u = 0;
            outer:
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

            Closure(items, grammar, g, added, out_exclude);
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
    grammar.states = states;
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

    const bodies = grammar.bodies;

    let states = createInitialState(grammar),
        items_set = [{ c: Closure([new Item(0, bodies[0].length, 0, "$", 0)], grammar), s: states[0] }],
        LALR_MODE = true,
        i = 0;

    while (items_set.length > 0 && i++ < 100000) {

        const items = items_set.shift();
        const item = items.c[0];
        //console.log(`items length ${items_set.length}`)
        
        if (!ProcessState(items.c, items.s, states, grammar, items_set, LALR_MODE)) {
            if (LALR_MODE) {
                console.error("Unable to continue in LALR mode. Restarting in CLR Mode. \n")
                states = createInitialState(grammar)
                items_set = [{ c: Closure([new Item(0, bodies[0].length, 0, "$", 0)], grammar), s: states[0] }];
                LALR_MODE = false;
                //states.INVALID = true;
                //return states;
            } else {
                console.error("Unable to parse grammar. It does not appear to be a LR grammar.\n")
                states.INVALID = true;
                break;
            }
        }
    }

    if (i == 100000)
        throw new Error("Failed process grammar. Max step limit reached. The current limit is set to 100000 iterations.")
    //console.log(states)
    return states;
}
