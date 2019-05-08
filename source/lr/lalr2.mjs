"use strict";

import { FIRST, isNonTerm, filloutGrammar, Item, EMPTY_PRODUCTION } from "../common.mjs";
import { gotoCollisionCheck, reduceCollisionCheck, shiftCollisionCheck } from "./error.mjs";

function ProcessState(items, state, states, grammar, items_set, LALR_MODE = false) {
    const bodies = grammar.bodies;

    items = Closure(state.id, items, grammar);

    if (!state.b)
        state.b = [grammar[bodies[items[0][0]].production].name, "→", ...bodies[items[0][0]]].map((d) => isNaN(d) ? d : grammar[d].name);

    for (let i = 0, l = items.length; i < l; i++) {

        const body = bodies[items[i].body],
            item = items[i],
            len = item.len,
            offset = item.offset,
            tok = body[offset];

        if (item.USED)
            continue;

        if (body.errorOnSet.has(offset)) {
            body.errorOnSet.get(offset).forEach(tok => {
                state.action.set(tok, { name: "ERROR" });
            });
        }

        const size = tok == EMPTY_PRODUCTION ? 0 : len;

        if (offset >= len || tok == EMPTY_PRODUCTION) { //At an accepting state for this input
            const k = item.v;

            if (item.body == 0 && k == "$")
                state.action.set(k, { name: "ACCEPT", size, production: body.production, body: body.id, len });

            else {
                const p1 = body.precedence;
                const p2 = item.p;

                if (p2 < p1 && k !== "$" && i > 0)
                    continue;

                switch (reduceCollisionCheck(grammar, state, item)) {
                    case -1:
                        return false;
                    case 0:
                        state.action.set(k, { name: "REDUCE", state: state.id, size, production: body.production, body: body.id, len });
                        break;
                }
            }
        } else {

            if (tok == EMPTY_PRODUCTION)
                continue;

            item.USED = true;

            const id_append = new Set(),
                osid = item.sym;

            let new_state = null,
                sid = new Set(),
                exc_cache = new Set(),
                out_items = [],
                new_exclude = [];

                let I = 0;

            for (let j = i; j < l; j++) {
                const item = items[j];

                if (item.sym == osid) {
                    if (!id_append.has(item.full_id)) {
                        item.USED = true;
                        let SKIP = false;

                        for (let i = 0; i < items.exclude.length; i++) {
                            let e = items.exclude[i];



                            if (SKIP) break;

                            if (item.body == e.body && item.offset == e.offset) {
                                if (!isNonTerm(item.sym)) {
                                    if (item.sym == e.symbols[e.offset]) {
                                        if (e.offset == e.l - 1) {
                                            const body = item.body_
                                            //console.log(state.id, grammar[body.production].name + " " + body.join(" "), e.symbols.join(" "),item.follow.v);
                                            SKIP = true;
                                            break;
                                        }
                                        new_exclude.push({ body: e.body, symbols: e.symbols, offset: e.offset + 1, l: e.l });
                                    }
                                } else {

                                    if (e.symbols[e.offset + 1] && item.body_[item.offset + 1] == e.symbols[e.offset + 1]) {
                                        grammar[item.sym].bodies.forEach(b => {
                                            //console.log({ body: b.id, symbols: e.symbols.slice(1), offset: 0, l: e.l - 1 })
                                            items.exclude.push({ body: b.id, symbols: e.symbols.slice(1), offset: 0, l: e.l - 1 });
                                            //new_exclude.add({ body: b.id, symbols: e.symbols.slice(1), offset: 0, l: e.l - 1 });
                                        });
                                    } else {


                                        if(sid.has(item.increment().id)) continue; // Have already added all bodies for this particular item. 
                                        
                                        
                                        const sym_bodies = grammar[item.sym].bodies,
                                            stack = [],
                                            set = new Set();

                                        for (let i = 0; i < sym_bodies.length; i++) {
                                            stack.push(sym_bodies[i]);
                                            //if (isNonTerm(sym_bodies[i][0]))
                                            set.add(sym_bodies[i]);
                                        }

                                        while (stack.length > 0) {
                                            let body = stack.shift();

                                            if (!isNonTerm(body[0])) {
                                                if (body[0] == e.symbols[e.offset]) {
                                                    I++
                                                    let id = body.id + "" + e.symbols.join("") + e.offset + e.l;
                                                    if(!exc_cache.has(id)){
                                                        items.exclude.push({ body: body.id, symbols: e.symbols, offset: e.offset, l: e.l });
                                                        exc_cache.add(id);
                                                    }
                                                }
                                            } else {
                                                const sym_bodies = grammar[body[0]].bodies;
                                                for (let i = 0; i < sym_bodies.length; i++) {
                                                    if (!set.has(sym_bodies[i])) {
                                                        stack.push(sym_bodies[i]);
                                                        set.add(sym_bodies[i]);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        const new_item = item.increment();
                        sid.add(new_item.id);

                        if (SKIP)
                            continue;

                        out_items.push(new_item);
                        id_append.add(new_item.full_id);
                    }
                }
            }

            sid = [...sid.values()].sort((a, b) => a < b ? -1 : 1).join(";");

            if (out_items.length == 0) 
                continue

            if (!LALR_MODE)
                sid = [...id_append.values()].slice(1).sort((a, b) => a < b ? -1 : 1).join("");

            //console.log(tok,state.id, [...state.map.keys()].join("`"), );
            //while (true) {
                

                if (state.map.has(tok)) {
                    //
                    //console.log(state.id, "state_existing", tok)
                    const existing_state = state.map.get(tok);

                    const nsid = [...(new Set(...existing_state.real_id.split(";"), sid.split(";")))].sort((a, b) => a < b ? -1 : 1).join(";");

                    //console.log("nnn", existing_state.real_id, nsid);
                    //if(new_state.real_id.length < sid.length)
                    new_state = existing_state;
                    existing_state.real_id = nsid;



                    if(!(states.map.has(nsid)) ){
                        states.map.set(nsid, existing_state);
                      //  break;
                    }

                   // continue;
                    
                }else

                if (states.map.has(sid)) {
                    //console.log(state.id, "existing", tok)
                    new_state = states.map.get(sid);
                }

               // break;
            //}

            if (!new_state) {
                const body = out_items[0].body_;
                //console.log(state.id, "new", tok)
                states.push({
                    action: new Map,
                    goto: new Map,
                    id: states.length,
                    body: body.production,
                    b: [grammar[body.production].name, "→", ...body.map((d) => isNaN(d) ? d : grammar[d].name)],
                    d: `${state.d} => [${[...(out_items.map(i=>`${grammar[i.body_.production].name} → ${(i.body_.slice().map((d) => isNaN(d) ? d : grammar[d].name)).join(" ")}`)).reduce((r,e)=>(r.add(e), r) ,new Set).values()].join(", ")}]`,
                    sigs: 'dd', //new Set(new_items.map((k) => k.full_id)),
                    real_id: sid,
                    follows: null,
                    map: new Map(),
                });


                new_state = states[states.length - 1];

                //console.log(new_state.id , sid)
                state.map.set(tok, new_state);
                states.map.set(sid, new_state);
            }

            state.map.set(tok, new_state);

            if (!state.map.has(tok))
                console.log("AWEASDASDWQWDASDASDEW")

            //const ASSOCIATION = (item[0] == state.body) && !!grammar.rules.assc;

            if (!isNonTerm(tok)) {

                if (tok != "$" /*&& tok !== EMPTY_PRODUCTION */ ) {

                    let SKIP = false;

                    if (!SKIP) {
                        //console.log(`${tok} ${sid} [${new_state.d}]`);
                        //  console.log(tok,shiftCollisionCheck(grammar, state, new_state, item, size))
                        switch (shiftCollisionCheck(grammar, state, new_state, item, size)) {
                            case -1:
                                return false;
                            case 0:
                                state.action.set(tok, { name: "SHIFT", state: new_state.id, body: item[0], original_body: body.id, len: size });
                                break;
                        }
                    }
                }

            } else {

                switch (gotoCollisionCheck(grammar, state, new_state, item)) {
                    case -1: //failed
                        return false;
                    case 0: //Original
                        break;
                    case 1: //New
                        state.goto.set(tok == EMPTY_PRODUCTION ? item.v : tok, { name: "GOTO", state: new_state.id, body: body.id, fid: item.full_id });
                        break;
                }
            }


            if (new_state.follows) {
                out_items = out_items.reduce((a, i) => (!new_state.follows.has(i.full_id)) ? (new_state.follows.add(i.full_id), a.push(i), a) : a, []);
            } else
                new_state.follows = id_append;

            if (out_items.length == 0)
                continue;
            //console.log(new_state.id, "ZOmbie", new_exclude);
            out_items.exclude = new_exclude;

            items.s = new_state;

            items_set.push({ c: out_items, s: new_state });
        }
    }
    return true;
}


function Closure(state_id, items, grammar, exclude = null, offset = 0, added = new Set()) {
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

        if (body.excludeSet.has(index)) {
            if (!items.exclude)
                items.exclude = [];
            body.excludeSet.get(index).forEach(e => items.exclude.push({ body: item.body, symbols: Array.isArray(e) ? e : [e], offset: 0, l: Array.isArray(e) ? e.length : 1 }));
        }

        if (item.USED)
            continue;

        if (index < len && isNonTerm(B)) {
            let first;


            if (Be.length > 0)
                first = FIRST(grammar, ...(Be.map(x => isNonTerm(x) ? x : { v: x, p: body.precedence })), b);
            else
                first = [b];

            const production = grammar[B];

            for (let i = 0; i < production.bodies.length; i++) {

                const pbody = production.bodies[i];

                //Check the first in the body to see if there is a set that should exclude a particular production of B

                for (let i = 0; i < first.length; i++) {
                    if (!first[i])
                        continue;

                    const item = new Item(pbody.id, pbody.length, 0, first[i].v, first[i].p, grammar);
                    const sig = item.full_id;

                    if (!added.has(sig)) {
                        items.push(item);
                        added.add(sig);
                    }
                }
            }

            Closure(state_id, items, grammar, exclude, g, added);
        }
    }
    return items;
}

function createInitialState(grammar) {
    const states = [{ action: new Map, goto: new Map, map: new Map, id: 0, body: 0, exclude: new Set(), d: "start" }];
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
        items_set = [{ c: [new Item(0, bodies[0].length, 0, "$", 0, grammar)], s: states[0] }],
        LALR_MODE = true,
        i = 0;

    items_set[0].c.exclude = [];

    while (items_set.length > 0 && i++ < 2000000) {
        let items = items_set.shift();

        console.log(items_set.length, i)
        if (!ProcessState(items.c, items.s, states, grammar, items_set, LALR_MODE)) {
            if (LALR_MODE) {
                console.error("Unable to continue in LALR mode. Restarting in CLR Mode. \n");
                states = createInitialState(grammar);
                items_set = [{ c: Closure(0, [new Item(0, bodies[0].length, 0, "$", 0, grammar)], grammar), s: states[0] }];
                LALR_MODE = false;
                break
            } else {
                console.error("Unable to parse grammar. It does not appear to be a LR grammar.\n");
                states.INVALID = true;
                break;
            }
        }
    }

    if (grammar.ignore) {
        states.forEach(state => {
            grammar.ignore.forEach((sym) => {
                if (!state.action.has(sym))
                    state.action.set(sym, { name: "IGNORE", state: state.id, body: state.body, len: 0, original_body: state.body });
            });
        });
    }
    if (i >= 100000)
        throw new Error("Failed process grammar. Max step limit reached. The current limit is set to 100000 iterations.");

    return states;
}
