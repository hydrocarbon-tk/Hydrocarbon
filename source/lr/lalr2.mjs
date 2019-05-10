"use strict";

import { FIRST, isNonTerm, filloutGrammar, Item, EMPTY_PRODUCTION } from "../common.mjs";
import { gotoCollisionCheck, reduceCollisionCheck, shiftCollisionCheck } from "./error.mjs";

function processState(items, state, states, grammar, items_set, error, LALR_MODE = false) {

    const bodies = grammar.bodies;

    processClosure(state.id, items, grammar, error);

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

                switch (reduceCollisionCheck(grammar, state, item, error)) {
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
                        if (item.USED) {
                            //error.log(item.body_.slice())
                            continue;
                        }

                        item.USED = true;

                        const new_item = item.increment();

                        sid.add(new_item.id);

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

            if (state.map.has(tok)) {
                const existing_state = state.map.get(tok);

                const nsid = [...(new Set(...existing_state.real_id.split(";"), sid.split(";")))].sort((a, b) => a < b ? -1 : 1).join(";");

                new_state = existing_state;
                existing_state.real_id = nsid;

                if (!(states.map.has(nsid))) {
                    states.map.set(nsid, existing_state);
                }
            } else if (states.map.has(sid)) {
                new_state = states.map.get(sid);
            }

            if (!new_state) {
                const body = out_items[0].body_;
                states.push({
                    action: new Map,
                    goto: new Map,
                    id: states.length,
                    body: body.production,
                    b: [grammar[body.production].name, "→", ...body.map((d) => isNaN(d) ? d : grammar[d].name)],
                    d: `${state.d} => [${[...(out_items.map(i=>`${grammar[i.body_.production].name} → ${(i.body_.slice().map((d) => isNaN(d) ? d : grammar[d].name)).join(" ")}`)).reduce((r,e)=>(r.add(e), r) ,new Set).values()].join(", ")}]`,
                    real_id: sid,
                    follows: null,
                    map: new Map(),
                });


                new_state = states[states.length - 1];

                state.map.set(tok, new_state);
                states.map.set(sid, new_state);
            }

            state.map.set(tok, new_state);

            if (!isNonTerm(tok)) {

                if (tok != "$" /*&& tok !== EMPTY_PRODUCTION */ ) {

                    let SKIP = false;

                    if (!SKIP) {
                        switch (shiftCollisionCheck(grammar, state, new_state, item, size, error)) {
                            case -1:
                                return false;
                            case 0:
                                state.action.set(tok, { name: "SHIFT", state: new_state.id, body: item[0], original_body: body.id, len: size });
                                break;
                        }
                    }
                }
            } else {

                switch (gotoCollisionCheck(grammar, state, new_state, item, error)) {
                    case -1: //failed
                        return false;
                    case 0: //Original
                        break;
                    case 1: //New
                        state.goto.set(tok == EMPTY_PRODUCTION ? item.v : tok, { name: "GOTO", state: new_state.id, body: body.id });
                        break;
                }
            }

            if (new_state.follows) {
                out_items = out_items.reduce((a, i) => (!new_state.follows.has(i.full_id)) ? (new_state.follows.add(i.full_id), a.push(i), a) : a, []);
            } else
                new_state.follows = id_append;

            if (out_items.length == 0)
                continue;

            out_items.excludes = items.excludes.slice();

            items.s = new_state;

            items_set.push({ c: out_items, s: new_state });
        }
    }
    return true;
}

function processClosure(state_id, items, grammar, error, excludes, offset = 0, added = new Set()) {
    let exclusion_count = 0;

    if (!excludes) {
        if (items.excludes)
            excludes = items.excludes.slice();
        else
            excludes = [];
        items.excludes = [];
    }

    const bodies = grammar.bodies,
        g = items.length;

    for (let i = offset; i < g; i++) {
        const item = items[i],
            body = bodies[item.body],
            len = item.len,
            index = item.offset,
            B = body[index],
            Be = body.slice(index + 1),
            b = item.follow,
            end = items.length;

        const step_excludes = excludes.slice();

        if (body.excludeSet.has(index)) {
            if (!items.excludes)
                items.excludes = [];
            body.excludeSet.get(index).forEach(e => step_excludes.push({ body: item.body, symbols: Array.isArray(e) ? e : [e], offset: 0, l: Array.isArray(e) ? e.length : 1, inner_offset: index }));
        }

        const new_excludes = [];
        const out_excludes = [];
        const item_excludes = [];

        for (let u = 0; u < step_excludes.length; u++) {

            let ex = step_excludes[u];

            if (item.body == ex.body && index == ex.inner_offset) {
                let d = ex.offset,
                    j = index; //, clock = 0;
                let i_sym = body[j];
                let e_sym = ex.symbols[d];

                if (!isNonTerm(i_sym) && i_sym == e_sym) {

                    if (d == ex.l - 1) {
                        const body = item.body_
                        exclusion_count++;
                        item.USED = true;
                        break;
                    }

                    //Excludes going to next round
                    items.excludes.push({ body: ex.body, symbols: ex.symbols, offset: d + 1, l: ex.l, inner_offset: j + 1 });
                } else {
                    new_excludes.push({ body: ex.body, symbols: ex.symbols, offset: d, l: ex.l, inner_offset: 0 });

                }
            }
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
                const body_index = pbody.id;

                out_excludes.push(...new_excludes.map(e => ({ body: body_index, symbols: e.symbols, offset: e.offset, l: e.l, inner_offset: e.inner_offset })));

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
            const added_count = items.length - end;

            const count = processClosure(state_id, items, grammar, error, out_excludes, g, added)

            if (count > 0 && count == added_count) {
                item.USED = true;
                exclusion_count++;
            }

            exclusion_count += count;
        }
    }


    return exclusion_count;
}

function createInitialState(grammar) {
    const states = [{ action: new Map, goto: new Map, map: new Map, id: 0, body: 0, exclude: new Set(), d: "start" }];
    states.type = "lr";
    states.map = new Map([]);
    states.count = 1;
    grammar.states = states;
    return states;
}

export function* compileLRStates(grammar, env = {}) {

    const error = new(class {
        constructor() {
            this.strings = []
        }

        log(...vals) {
            this.strings.push(`${vals.map(e=>typeof e !== "string" ? JSON.stringify(e).replace(/\"/g,"") : e).join(", ")}`);
        }
        get output() { return strings.join("\n") }
    })
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
        i = 0,
        total_items = 1;

    items_set[0].c.excludes = [];

    while (items_set.length > 0) {
        let start = items_set.length;

        let items = items_set.shift();

        if (!processState(items.c, items.s, states, grammar, items_set, error, LALR_MODE)) {
            if (LALR_MODE) {
                error.log("Unable to continue in LALR mode. Restarting in CLR Mode. \n")
                states = createInitialState(grammar);
                items_set = [{ c: [new Item(0, bodies[0].length, 0, "$", 0, grammar)], s: states[0] }];
                LALR_MODE = false;
                yield { error, states: states, num_of_states: states.length, total_items, items_left: items_set.length, COMPLETE: false, ERROR: true, error_msg: "Unable to continue in LALR mode. Restarting in CLR Mode. \n" }
                return { error, states: states, num_of_states: states.length, total_items, items_left: items_set.length, COMPLETE: true, ERROR: true, error_msg: "Unable to continue in LALR mode. Restarting in CLR Mode. \n" }
                break
            } else {
                states.INVALID = true;
                return { error, states, num_of_states: states.length, total_items, items_left: items_set.length, COMPLETE: true, ERROR: true, error_msg: "Unable to parse grammar. It does not appear to be a LR grammar.\n" }
            }
        }

        if (items_set.length > start)
            total_items += items_set.length - start;

        yield { error, states, num_of_states: states.length, total_items, items_left: items_set.length, COMPLETE: false }
    }

    if (grammar.ignore) {
        states.forEach(state => {
            grammar.ignore.forEach((sym) => {
                if (!state.action.has(sym))
                    state.action.set(sym, { name: "IGNORE", state: state.id, body: state.body, len: 0, original_body: state.body });
            });
        });
    }

    return { error, states, num_of_states: states.length, total_items, items_left: 0, COMPLETE: true, ERROR: false };
}
