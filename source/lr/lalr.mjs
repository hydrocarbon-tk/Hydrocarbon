"use strict";

import { FIRST, isNonTerm, filloutGrammar, Item, EMPTY_PRODUCTION, types, processClosure } from "../util/common.mjs";
import { gotoCollisionCheck, reduceCollisionCheck, shiftCollisionCheck } from "./error.mjs";
import util from "util";

function processState(items, state, states, grammar, items_set, error, LALR_MODE = false) {

    const bodies = grammar.bodies;

    try {
        processClosure(state.id, items, grammar, error);
    } catch (e) {
        console.error(e);
        console.log(items);
        return -1;
    }

    if (!state.b)
        state.b = [bodies[items[0][0]].production.name, "→", ...bodies[items[0][0]].sym.map((d) => d.type == "production" ? grammar[d.val].name : d.val)];

    for (let i = 0, l = items.length; i < l; i++) {

        const body = bodies[items[i].body],
            item = items[i],
            len = item.len,
            offset = item.offset,
            tok = body.sym[offset];

        if (item.USED)
            continue;
        //*
        if (body.error.has(offset)) {
            body.error.get(offset).forEach(sym => {
                state.action.set(sym.val, { symbol_type: sym.type, name: "ERROR", state: state.id, body: state.body, len: 0, original_body: state.body });
            });
        } //*/

        if (body.ignore.has(offset)) {
            body.ignore.get(offset).forEach(sym => {
                state.action.set(sym.val, { symbol_type: sym.type, name: "IGNORE", state: state.id, body: state.body, len: 0, original_body: state.body });
            });
        } //*/

        //const size = tok.type == "empty" ? 0 : len;

        const size = len;

        if (offset >= len || tok.type == "empty") { //At an accepting state for this input
            const k = item.v;

            if (item.body == 0 && k == "$")
                state.action.set(k, { name: "ACCEPT", symbol_type: item.follow.type, size, production: body.production, body: body.id, len, offset: item.offset });

            else {
                const p1 = body.precedence;
                const p2 = item.p;

                if (p2 < p1 && k !== "$" && i > 0)
                    continue;

                switch (reduceCollisionCheck(grammar, state, item, error)) {
                    case -1:
                        return false;
                    case 0:
                        state.action.set(k, { name: "REDUCE", symbol_type: item.follow.type, state: state.id, size, production: body.production, body: body.id, len, offset: item.offset });
                        break;
                }
            }
        } else {

            if (tok.type == "empty")
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
                // /if(!item.sym)
                // /    error.log(util.inspect([item.body, item.len, item.offset, item.body_.production.name, item.sym, item.body_], false, null, true))
                if (item.sym && item.sym.val == osid.val) {
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

            if (state.map.has(tok.val)) {
                const existing_state = state.map.get(tok.val);

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
                    grammar_stamp:body.grammar_stamp,
                    action: new Map,
                    goto: new Map,
                    id: states.length,
                    body: body.id,
                    b: [body.production.name, "→", ...body.sym.map(d => d.type == "production" ? grammar[d.val].name : d.val)],
                    d: `${state.d} =>\n [${[...(out_items.map(i=>`${i.body_.production.name} → ${(i.body_.sym.slice().map(d=>d.type == "production" ? grammar[d.val].name : d.val)).join(" ")}`)).reduce((r,e)=>(r.add(e), r) ,new Set).values()].join(", ")}]`,
                    real_id: sid,
                    follows: null,
                    map: new Map(),
                });


                new_state = states[states.length - 1];

                state.map.set(tok.val, new_state);
                states.map.set(sid, new_state);
            }

            state.map.set(tok.val, new_state);

            if (tok.type != "production") {

                if (tok.type != "EOF" /*&& tok !== EMPTY_PRODUCTION */ ) {

                    let SKIP = false;

                    if (!SKIP) {
                        switch (shiftCollisionCheck(grammar, state, new_state, item, size, error)) {
                            case -1:
                                return false;
                            case 0:
                                state.action.set(tok.val, { name: "SHIFT", symbol_type: tok.type, state: new_state.id, body: item[0], original_body: body.id, len: size, offset: item.offset + 1 });
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
                        state.goto.set(tok.type == "empty" ? item.v : tok.val, { name: "GOTO", symbol_type: tok.type == "empty" ? item.follow.type : tok.type, state: new_state.id, body: body.id });
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

function createInitialState(grammar) {
    const states = [{grammar_stamp:grammar.bodies[0].grammar_stamp, action: new Map, goto: new Map, map: new Map, id: 0, body: 0, exclude: new Set(), d: "start" }];
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
        items_set = [{ c: [new Item(0, bodies[0].length, 0, { v: "$", p: 0, type: "generated" }, grammar)], s: states[0] }],
        LALR_MODE = true,
        i = 0,
        total_items = 1;

    items_set[0].c.excludes = [];

    states.COMPILED = false;

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


    if (grammar.meta.ignore) {
        states.forEach(state => {
            grammar.meta.ignore.forEach(
                i => i.symbols.forEach((sym) => {
                    if (!state.action.has(sym.val) && state.grammar_stamp == i.grammar_stamp) {
                        state.action.set(sym.val, { symbol_type: sym.type, name: "IGNORE", state: state.id, body: state.body, len: 0, original_body: state.body });
                    }
                })
            );
        });
    }

    states.COMPILED = true;

    //console.log(util.inspect(states, false, null, true))
    //console.log(grammar.meta.ignore)
    //throw "SDFSDF";
    return { error, states, num_of_states: states.length, total_items, items_left: 0, COMPLETE: true, ERROR: false };
}
