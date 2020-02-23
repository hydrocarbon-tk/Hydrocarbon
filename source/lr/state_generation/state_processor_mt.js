import { processClosure } from "../../util/common.mjs";

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

    errorAtSymbol(grammar, state, symbol, body, item) {
        return {
            name: ERROR,
            state_real_id: state.real_id,
            state: -1,
            body: state.body,
            symbol_type: symbol.type,
            symbol: symbol.val,
            item,
            item_string: item.renderWithProduction(grammar)
        };
    }

    resetAtSymbol(grammar, state, symbol, body, item) {
        return {
            name: DO_NOTHING,
            state_real_id: state.real_id,
            state: -1,
            body: state.body,
            symbol_type: symbol.type,
            symbol: symbol.val,
            item,
            item_string: item.renderWithProduction(grammar)
        };
    }

    ignoreAtSymbol(grammar, state, symbol, body, item) {
        return {
            name: IGNORE,
            state_real_id: state.real_id,
            state: -1,
            body: state.body,
            symbol_type: symbol.type,
            symbol: symbol.val,
            item,
            item_string: item.renderWithProduction(grammar)
        };
    }

    acceptAtSymbol(grammar, state, symbol, body, item) {
        return {
            name: ACCEPT,
            state_real_id: state.real_id,
            state: -1,
            size: item.len,
            body: body.id,
            symbol_type: symbol.type,
            symbol: item.v,
            production: body.production,
            item,
            item_string: item.renderWithProduction(grammar)
        };
    }

    reduceAtSymbol(grammar, state, symbol, body, item) {
        return {
            name: REDUCE,
            state_real_id: state.real_id,
            state: -1,
            size: item.len,
            body: body.id,
            symbol_type: symbol.type,
            symbol: item.v,
            production: body.production.id,
            item,
            item_string: item.renderWithProduction(grammar)
        };
    }


    shiftAtSymbol(grammar, state, symbol, body, item, shift_state_id) {
        return {
            name: SHIFT,
            state_real_id: shift_state_id,
            state: -1,
            offset: item.offset + 1,
            body: body.id,
            symbol_type: symbol.type,
            symbol: symbol.val,
            item,
            item_string: item.renderWithProduction(grammar)
        };
    }

    gotoAtSymbol(grammar, state, symbol, body, item, goto_state_id) {

        const sym = symbol.type == "empty" ? item.v : symbol.val;

        return {
            name: GOTO,
            symbol_type: symbol.type == "empty" ? item.follow.type : symbol.type,
            symbol: sym,
            state_real_id: goto_state_id,
            state: -1,
            body: body.id,
            item,
            item_string: item.renderWithProduction(grammar)
        };
    }

    createState(item, sid, grammar) {

        return {
            grammar_stamp: item.body_(grammar).grammar_stamp,
            body: item.body_(grammar).id,
            production: item.body_(grammar).production.ids,
            production_string: item.renderWithProduction(grammar),
            id: -1,
            real_id: sid,
            follows: null,
            item: item.render(grammar),
        };
    }

    process(items, state_id, grammar, excludes = [], error = {}, LALR_MODE = true) {

        const
            osid = state_id.id,
            to_process_items = [],
            actions = [],
            /* Create a new state for the set of items that have been passed to it. */
            state = this.createState(items[0], osid, grammar);

        try {
            processClosure(items, grammar, error, []);
        } catch (e) {
            console.log(e)
            return { error: "Could not create closure for items " + items.map(e => e.renderWithProduction(grammar)).join(" | "), msg: e };
        }

        for (let i = 0, l = items.length; i < l; i++) {

            const item = items[i],
                body = item.body_(grammar),
                offset = item.offset,
                symbol = body.sym[offset];

            if (item.USED)
                continue;

            if (body.error.has(offset)) body.error.get(offset).forEach(s => actions.push(this.errorAtSymbol(grammar, state, s, body, item)));
            if (body.reset.has(offset)) body.error.get(offset).forEach(s => actions.push(this.resetAtSymbol(grammar, state, s, body, item)));
            if (body.ignore.has(offset)) body.error.get(offset).forEach(s => actions.push(this.ignoreAtSymbol(grammar, state, s, body, item)));

            if (item.atEND || symbol.type == "empty") { //At an accepting state for this input

                if (item.body == 0 && item.v == "$eof")
                    actions.push(this.acceptAtSymbol(grammar, state, item.follow, body, item));
                else
                    actions.push(this.reduceAtSymbol(grammar, state, item.follow, body, item));

            } else {

                if (symbol.type == "empty")
                    continue;

                const
                    id_append = new Set(),
                    osid = item.sym(grammar),
                    out_items = [],
                    sid_set = new Set();

                for (let j = i; j < l; j++) {
                    const item = items[j];
                    if (item.sym(grammar) && item.sym(grammar).val === osid.val) {
                        if (!id_append.has(item.full_id)) {

                            if (item.USED) continue;

                            const new_item = item.increment();

                            item.USED = true;

                            sid_set.add(new_item.id);
                            out_items.push(new_item);
                            id_append.add(new_item.full_id);
                        }
                    }
                }

                const sid = [...sid_set.values()].sort((a, b) => a < b ? -1 : 1).join(";");

                if (out_items.length == 0)
                    continue;

                // /if (!LALR_MODE)
                // /    sid = [...id_append.values()].slice(1).sort((a, b) => a < b ? -1 : 1).join("");

                if (symbol.type !== "production") {
                    if (symbol.type !== "EOF")
                        actions.push(this.shiftAtSymbol(grammar, state, symbol, body, item, sid));
                } else
                    actions.push(this.gotoAtSymbol(grammar, state, symbol, body, item, sid));

                if (out_items.length == 0)
                    continue;

                to_process_items.push({ items: out_items, state_id: { id: sid, sym: symbol.val }, excludes });
            }
        }

        state.to_process_actions = actions;

        return { to_process_items, state, error: "" };
    }
}