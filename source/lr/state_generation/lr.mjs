"use strict";

import { filloutGrammar, Item } from "../../util/common.mjs";
import StateProcessor from "./state_processor.js";

import {
    ERROR,
    IGNORE
} from "../common/state_action_enums.js";

function createInitialState(grammar) {
    const states = [{ grammar_stamp: grammar.bodies[0].grammar_stamp, action: new Map, goto: new Map, map: new Map, id: 0, body: 0, exclude: new Set(), d: "start" }];
    states.type = "lr";
    states.map = new Map([]);
    states.count = 1;
    grammar.states = states;
    return states;
}

export default function* (grammar, env = {}, processor = new StateProcessor) {

    const error = new(class {
        constructor() {
            this.strings = [];
        }

        log(...vals) {
            this.strings.push(`${vals.map(e=>typeof e !== "string" ? JSON.stringify(e).replace(/"/g,"") : e).join(", ")}`);
        }
        get output() { return this.strings.join("\n") }
    });

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

    grammar.graph_id = 0;

    const bodies = grammar.bodies;

    bodies[0].production.graph_id = grammar.graph_id++;

    let states = createInitialState(grammar),
        items_set = [{ c: [new Item(0, bodies[0].length, 0, { v: "$eof", p: 0, type: "generated" }, grammar)], s: states[0] }],
        LALR_MODE = true,
        total_items = 1;

    items_set[0].c.excludes = [];

    states.COMPILED = false;

    while (items_set.length > 0) {
        const
            start = items_set.length,
            items = items_set.shift();

        new StateProcessor();

        if (!processor.process(items.c, items.s, states, grammar, items_set, error, LALR_MODE)) {
            if (LALR_MODE) {
                error.log("Unable to continue in LALR mode. Restarting in CLR Mode. \n");
                states = createInitialState(grammar);
                items_set = [{ c: [new Item(0, bodies[0].length, 0, "$eof", 0, grammar)], s: states[0] }];
                LALR_MODE = false;
                return yield  { error, states: states, num_of_states: states.length, total_items, items_left: items_set.length, COMPLETE: true, ERROR: true, error_msg: "Unable to continue in LALR mode. Restarting in CLR Mode. \n" };
            } else {
                states.INVALID = true;
                return yield { error, states, num_of_states: states.length, total_items, items_left: items_set.length, COMPLETE: true, ERROR: true, error_msg: "Unable to parse grammar. It does not appear to be a LR grammar.\n" };
            }
        }

        if (items_set.length > start)
            total_items += items_set.length - start;

        yield { error, states, num_of_states: states.length, total_items, items_left: items_set.length, COMPLETE: false };
    }


    if (grammar.meta.ignore) {
        states.forEach(state => {
            grammar.meta.ignore.forEach(
                i => i.symbols.forEach((sym) => {
                    if (!state.action.has(sym.val) && state.grammar_stamp == i.grammar_stamp) {
                        state.action.set(sym.val, { symbol_type: sym.type, name: IGNORE, state: state.id, body: state.body, len: 0, original_body: state.body });
                    }
                })
            );

            grammar.meta.error.forEach(
                i => i.symbols.forEach((sym) => {
                    if (!state.action.has(sym.val) && state.grammar_stamp == i.grammar_stamp) {
                        state.action.set(sym.val, { symbol_type: sym.type, name: ERROR, state: state.id, body: state.body, len: 0, original_body: state.body });
                    }
                })
            );
        });
    }

    states.COMPILED = true;

    return yield { error, states, num_of_states: states.length, total_items, items_left: 0, COMPLETE: true, ERROR: false };
}