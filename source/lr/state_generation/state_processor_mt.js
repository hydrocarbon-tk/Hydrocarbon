import { processClosure } from "../../util/common.mjs";
import {
    SET_NEW_ACTION,
    KEEP_EXISTING_ACTION
} from "../common/state_parse_action_enums.js";
import {
    ERROR,
    ACCEPT,
    SHIFT,
    REDUCE,
    GOTO,
    DO_NOTHING,
    IGNORE
} from "../common/state_action_enums.js";

/*
interface State {
    name : ACTION_ENUM;
    id : Number;
    real_id: String;
}
*/

export default class StateProcessor {

    errorAtSymbol(state, symbol, body, item) {
        return {
            name: ERROR,
            state_real_id: state.real_id,
            state:-1,
            body: state.body,
            symbol_type: symbol.type,
            symbol: symbol.val,
            item,
            item_string: item.renderWithProduction()
        };
    }

    resetAtSymbol(state, symbol, body, item) {
        return {
            name: DO_NOTHING,
            state_real_id: state.real_id,
            state:-1,
            body: state.body,
            symbol_type: symbol.type,
            symbol: symbol.val,
            item,
            item_string: item.renderWithProduction()
        };
    }

    ignoreAtSymbol(state, symbol, body, item) {
        return {
            name: IGNORE,
            state_real_id: state.real_id,
            state:-1,
            body: state.body,
            symbol_type: symbol.type,
            symbol: symbol.val,
            item,
            item_string: item.renderWithProduction()
        };
    }

    acceptAtSymbol(state, symbol, body, item) {
        return  {
            name: ACCEPT,
            state_real_id: state.real_id,
            state:-1,
            size: item.len,
            body: body.id,
            symbol_type: symbol.type,
            symbol: item.v,
            production: body.production,
            item,
            item_string: item.renderWithProduction()
        };
    }

    reduceAtSymbol(state, symbol, body, item) {
        return  {
            name: REDUCE,
            state_real_id: state.real_id,
            state:-1,
            size: item.len,
            body: body.id,
            symbol_type: symbol.type,
            symbol: item.v,
            production: body.production,
            item,
            item_string: item.renderWithProduction()
        };
    }


    shiftAtSymbol(state, symbol, body, item, shift_state_id) {
        return {
            name: SHIFT,
            state_real_id: shift_state_id,
            state:-1,
            offset: item.offset + 1,
            body: body.id,
            symbol_type: symbol.type,
            symbol: symbol.val,
            item,
            item_string: item.renderWithProduction()
        };
    }

    gotoAtSymbol(state, symbol, body, item, goto_state_id) {

        const sym = symbol.type == "empty" ? item.v : symbol.val;

        return {
            name: GOTO,
            symbol_type: symbol.type == "empty" ? item.follow.type : symbol.type,
            symbol: sym,
            state_real_id: goto_state_id,
            state: -1,
            body: body.id,
            item,
            item_string: item.renderWithProduction()
        };
    }

    createState(item, sid) {

        return {
            grammar_stamp: item.body_.grammar_stamp,
            action: new Map,
            goto: new Map,
            body: item.body_.id,
            production: item.body_.production,
            production_string: item.renderWithProduction(),
            id: -1,
            real_id: sid,
            follows: null,
            map: new Map(),
            item: item.render(),
        };
    }

    handleReduceCollision(grammar, states, state, item) {
        const symbol = item.v,
            existing_action = state.action.get(symbol);

        const bodies = grammar.bodies,
            body_a = bodies[item.body],
            body_b = grammar.bodies[existing_action.body];

        if (existing_action.name == SHIFT)
            return this.handleShiftReduceCollision({ val: symbol }, grammar, states, state, item);

        if (body_a.production.graph_id < body_b.production.graph_id)
            return SET_NEW_ACTION;
        else
            return KEEP_EXISTING_ACTION;
    }

    handleShiftReduceCollision(symbol, grammar, states, state) {

        const existing_action = state.action.get(symbol.val);

        if (existing_action.name == REDUCE)
            return SET_NEW_ACTION;
        else
            return KEEP_EXISTING_ACTION;
    }

    process(items, osid, grammar, excludes = [], error = {},  LALR_MODE = false) {
        const to_process_items = [];

        /* Create a new state for the set of items that have been passed to it. */

        const state = this.createState(items[0], osid);
        const actions = [];

        try {
            processClosure(items, grammar, error, excludes);
        } catch (e) {
            console.error(e);
            return { error: "could not create closure" };
        }

        for (let i = 0, l = items.length; i < l; i++) {

            const item = items[i],
                body = item.body_,
                offset = item.offset,
                symbol = body.sym[offset];

            if (item.USED)
                continue;

            if (body.error.has(offset)) body.error.get(offset).forEach(s => this.errorAtSymbol(state, s, body, item));
            if (body.reset.has(offset)) body.error.get(offset).forEach(s => this.resetAtSymbol(state, s, body, item));
            if (body.ignore.has(offset)) body.error.get(offset).forEach(s => this.ignoreAtSymbol(state, s, body, item));

            if (item.atEND || symbol.type == "empty") { //At an accepting state for this input

                const k = item.v;


                if (item.body == 0 && k == "$eof") {
                    actions.push(this.acceptAtSymbol(state, item.follow, body, item));
                    //this.acceptAtSymbol(state, item.follow, body, item);
                } else {
                    actions.push(this.reduceAtSymbol(state, item.follow, body, item));

                }
            } else {

                if (symbol.type == "empty")
                    continue;

                const id_append = new Set(),
                    osid = item.sym;

                let //new_state = null,
                    sid = new Set();

                const
                    out_items = [];

                for (let j = i; j < l; j++) {
                    const item = items[j];
                    if (item.sym && item.sym.val === osid.val) {
                        if (!id_append.has(item.full_id)) {

                            if (item.USED) continue;

                            const new_item = item.increment();

                            item.USED = true;

                            sid.add(new_item.id);
                            out_items.push(new_item);
                            id_append.add(new_item.full_id);
                        }
                    }
                }

                sid = [...sid.values()].sort((a, b) => a < b ? -1 : 1).join(";");

                if (out_items.length == 0)
                    continue;

                if (!LALR_MODE)
                    sid = [...id_append.values()].slice(1).sort((a, b) => a < b ? -1 : 1).join("");
                /*
                if (state.map.has(symbol.val)) {
                    const
                        existing_state = state.map.get(symbol.val),
                        nsid = [...(new Set(...existing_state.real_id.split(";"), sid.split(";")))].sort((a, b) => a < b ? -1 : 1).join(";");

                    new_state = existing_state;
                    existing_state.real_id = nsid;

                    if (!(states.map.has(nsid)))
                        states.map.set(nsid, existing_state);

                } else if (states.map.has(sid))
                    new_state = states.map.get(sid);

                if (!new_state) {
                    states.push(this.createState(state, out_items[0].body_, item, out_items, states, grammar, sid));
                    new_state = states[states.length - 1];
                    state.map.set(symbol.val, new_state);
                    states.map.set(sid, new_state);
                }

                state.map.set(symbol.val, new_state);
                */

                if (symbol.type !== "production") {
                    if (symbol.type !== "EOF") {
                        actions.push(this.shiftAtSymbol(state, symbol, body, item, sid));
                    }
                } else {
                    actions.push(this.gotoAtSymbol(state, symbol, body, item, sid));
                }

                if (out_items.length == 0)
                    continue;

                to_process_items.push({ items: out_items, state_id: sid, excludes: excludes.slice() });
            }
        }

        state.to_process_actions = actions;

        return { to_process_items, state, error: "" };
    }
}