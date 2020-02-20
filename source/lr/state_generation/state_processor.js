import { processClosure } from "../../util/common.mjs";
import { gotoCollisionCheck, reduceCollisionCheck, shiftCollisionCheck } from "./error.mjs";
import {
    SET_NEW_ACTION,
    KEEP_EXISTING_ACTION,
    ACTION_COLLISION_ERROR
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


export default class StateProcessor {

    errorAtSymbol(state, symbol, body, item) {
        state.action.set(symbol.val, {
            name: ERROR,
            state: state.id,
            body: state.body,
            symbol_type: symbol.type,
            item
        });
    }

    resetAtSymbol(state, symbol, body, item) {
        state.action.set(symbol.val, {
            name: DO_NOTHING,
            state: state.id,
            body: state.body,
            symbol_type: symbol.type,
            item
        });
    }

    ignoreAtSymbol(state, symbol, body, item) {
        state.action.set(symbol.val, {
            name: IGNORE,
            state: state.id,
            body: state.body,
            symbol_type: symbol.type,
            item
        });
    }

    acceptAtSymbol(state, symbol, body, item) {
        state.action.set(item.v, {
            name: ACCEPT,
            state: state.id,
            size: item.len,
            body: body.id,
            symbol_type: symbol.type,
            production: body.production,
            item
        });
    }

    reduceAtSymbol(state, symbol, body, item) {
        state.action.set(item.v, {
            name: REDUCE,
            state: state.id,
            size: item.len,
            body: body.id,
            symbol_type: symbol.type,
            production: body.production,
            item
        });
    }


    shiftAtSymbol(state, symbol, body, item, shift_state) {
        state.action.set(symbol.val, {
            name: SHIFT,
            state: shift_state.id,
            offset: item.offset + 1,
            body: body.id,
            symbol_type: symbol.type,
            item
        });
    }

    gotoAtSymbol(state, symbol, body, item, goto_state) {
        state.goto.set(symbol.type == "empty" ? item.v : symbol.val, {
            name: GOTO,
            symbol_type: symbol.type == "empty" ? item.follow.type : symbol.type,
            state: goto_state.id,
            body: body.id,
            item
        });
    }

    createState(state, body, item, out_items, states, grammar, sid) {
        return ({
            grammar_stamp: body.grammar_stamp,
            action: new Map,
            goto: new Map,
            id: states.length,
            body: body.id,
            production: item.body_.production,
            production_string: item.renderWithProduction(),
            d: `${state.d} =>\n [${[...(out_items.map(i=>`${i.body_.production.name} → ${(i.body_.sym.slice().map(d=>d.type == "production" ? grammar[d.val].name : d.val)).join(" ")}`)).reduce((r,e)=>(r.add(e), r) ,new Set).values()].join(", ")}]`,
            real_id: sid,
            follows: null,
            map: new Map(),
            item: item.render(),
        });
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

    process(items, state, states, grammar, items_set, error, LALR_MODE = false) {

        try {
            processClosure(state.id, items, grammar, error);
        } catch (e) {
            console.error(e);
            return -1;
        }

        if (!state.production_string)
            state.production_string = items[0].renderWithProduction();

        for (let i = 0, l = items.length; i < l; i++) {

            const item = items[i],
                body = item.body_,
                body_length = item.len,
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
                    this.acceptAtSymbol(state, item.follow, body, item);
                } else {

                    if (body.precedence < item.p && k !== "$eof" && i > 0)
                        continue;

                    let action = reduceCollisionCheck(grammar, state, item, error);

                    if (action == ACTION_COLLISION_ERROR)
                        action = this.handleReduceCollision(grammar, states, state, item, body, error);

                    switch (action) {
                        case ACTION_COLLISION_ERROR:
                            return false;
                        case SET_NEW_ACTION:
                            this.reduceAtSymbol(state, item.follow, body, item);
                            break;
                        case KEEP_EXISTING_ACTION: //Original
                            break;
                    }
                }
            } else {

                if (symbol.type == "empty")
                    continue;

                const id_append = new Set(),
                    osid = item.sym;

                let new_state = null,
                    sid = new Set(),
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

                if (symbol.type !== "production") {
                    if (symbol.type !== "EOF") {
                        let action = shiftCollisionCheck(grammar, state, new_state, item, body_length, error);

                        if (action === ACTION_COLLISION_ERROR)
                            action = this.handleShiftReduceCollision(symbol, grammar, states, state, item, body, new_state, error);

                        switch (action) {
                            case ACTION_COLLISION_ERROR:
                                return false;
                            case SET_NEW_ACTION:
                                this.shiftAtSymbol(state, symbol, body, item, new_state);
                                break;
                            case KEEP_EXISTING_ACTION:
                                break;
                        }
                    }
                } else {
                    switch (gotoCollisionCheck(grammar, state, new_state, item, error)) {
                        case ACTION_COLLISION_ERROR:
                            return false;
                        case SET_NEW_ACTION:
                            this.gotoAtSymbol(state, symbol, body, item, new_state);
                            break;
                        case KEEP_EXISTING_ACTION:
                            break;
                    }
                }
                if (new_state.follows)
                    out_items = out_items.reduce((a, i) => (!new_state.follows.has(i.full_id)) ? (new_state.follows.add(i.full_id), a.push(i), a) : a, []);
                else
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
}