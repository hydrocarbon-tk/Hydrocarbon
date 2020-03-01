import { processClosure } from "../../util/common.js";
import { SymbolType } from "../../types/grammar.js";
import { StateActionEnum } from "../../types/state_action_enums.js";
export default class StateProcessor {
    errorAtSymbol(grammar, state, symbol, body, item) {
        return {
            name: StateActionEnum.ERROR,
            state_real_id: state.real_id,
            state: -1,
            body: state.body,
            symbol_type: symbol.type,
            symbol: symbol.val,
            item,
            item_string: item.renderWithProduction(grammar)
        };
    }
    resetAtSymbol(grammar, state, symbol, item) {
        return {
            name: StateActionEnum.DO_NOTHING,
            state_real_id: state.real_id,
            state: -1,
            body: state.body,
            symbol_type: symbol.type,
            symbol: symbol.val,
            item,
            item_string: item.renderWithProduction(grammar)
        };
    }
    ignoreAtSymbol(grammar, state, symbol, item) {
        return {
            name: StateActionEnum.DO_NOTHING,
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
            name: StateActionEnum.ACCEPT,
            state_real_id: state.real_id,
            state: -1,
            size: item.len,
            body: body.id,
            symbol_type: symbol.type,
            symbol: symbol.val,
            production: body.production.id,
            item,
            item_string: item.renderWithProduction(grammar)
        };
    }
    reduceAtSymbol(grammar, state, symbol, body, item) {
        return {
            name: StateActionEnum.REDUCE,
            state_real_id: state.real_id,
            state: -1,
            size: item.len,
            body: body.id,
            offset: item.offset,
            symbol_type: symbol.type,
            symbol: symbol.val,
            production: body.production.id,
            item,
            item_string: item.renderWithProduction(grammar)
        };
    }
    shiftAtSymbol(grammar, state, symbol, body, item, shift_state_id) {
        return {
            name: StateActionEnum.SHIFT,
            state_real_id: shift_state_id,
            state: -1,
            offset: item.offset,
            body: body.id,
            symbol_type: symbol.type,
            symbol: symbol.val,
            item,
            item_string: item.renderWithProduction(grammar)
        };
    }
    gotoAtSymbol(grammar, state, symbol, body, item, goto_state_id) {
        const sym = symbol.type == SymbolType.EMPTY ? item.v : symbol.val;
        return {
            name: StateActionEnum.GOTO,
            symbol_type: symbol.type == SymbolType.EMPTY ? item.follow.type : symbol.type,
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
            thread_id: 0,
            grammar_stamp: item.body_(grammar).grammar_stamp,
            body: item.body_(grammar).id,
            production: item.body_(grammar).production.id,
            production_string: item.renderWithProduction(grammar),
            id: -1,
            real_id: sid,
            follows: null,
            item: item.render(grammar),
        };
    }
    process(items, state_id, grammar, excludes = [], error = {}, LALR_MODE = true) {
        const osid = state_id.id, to_process_items = [], actions = [], 
        /* Create a new state for the set of items that have been passed to it. */
        state = this.createState(items[0], osid, grammar);
        try {
            processClosure(items, grammar, error, excludes);
        }
        catch (e) {
            return { error: "Could not create closure for items " + items.map(e => e.renderWithProduction(grammar)).join(" | "), msg: e };
        }
        for (let i = 0, l = items.length; i < l; i++) {
            const item = items[i], body = item.body_(grammar), offset = item.offset, symbol = body.sym[offset];
            if (item.USED)
                continue;
            if (body.error.has(offset))
                body.error.get(offset).forEach(s => actions.push(this.errorAtSymbol(grammar, state, s, body, item)));
            if (body.reset.has(offset))
                body.reset.get(offset).forEach(s => actions.push(this.resetAtSymbol(grammar, state, s, item)));
            if (body.ignore.has(offset))
                body.ignore.get(offset).forEach(s => actions.push(this.ignoreAtSymbol(grammar, state, s, item)));
            if (item.atEND || symbol.type == SymbolType.EMPTY) { //At an accepting state for this input
                if (item.body == 0 && item.v == "$eof")
                    actions.push(this.acceptAtSymbol(grammar, state, item.follow, body, item));
                else
                    actions.push(this.reduceAtSymbol(grammar, state, item.follow, body, item));
            }
            else {
                const id_append = new Set(), osid = item.sym(grammar), out_items = [], sid_set = new Set();
                for (let j = i; j < l; j++) {
                    const item = items[j];
                    if (item.sym(grammar) && item.sym(grammar).val === osid.val) {
                        if (!id_append.has(item.full_id)) {
                            if (item.USED)
                                continue;
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
                if (symbol.type !== SymbolType.PRODUCTION) {
                    if (symbol.type !== SymbolType.END_OF_FILE)
                        actions.push(this.shiftAtSymbol(grammar, state, symbol, body, item, sid));
                }
                else
                    actions.push(this.gotoAtSymbol(grammar, state, symbol, body, item, sid));
                to_process_items.push({ items: out_items, state_id: { id: sid, sym: symbol.val }, excludes });
            }
        }
        state.to_process_actions = actions;
        return { to_process_items, state, error: "" };
    }
}
