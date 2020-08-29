
import { processClosure } from "../../util/common.js";
import { LRState, ParserAction } from "../../types/lr_state.js";
import { Item } from "../../util/item.js";
import { Grammar, SymbolType, Symbol, ProductionBody } from "../../types/grammar.js";
import { StateActionEnum } from "../../types/state_action_enums.js";
import { ItemSet } from "../../types/item_set.js";
import { CompilerErrorStore } from "./compiler_error_store.js";



export default class StateProcessor {

    errorAtSymbol(grammar: Grammar, state: LRState, symbol: { type: any; val: any; }, body: ProductionBody, item: Item): ParserAction {
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

    resetAtSymbol(grammar: any, state: LRState, symbol: Symbol, item: Item): ParserAction {
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

    ignoreAtSymbol(grammar: any, state: LRState, symbol: Symbol, item: Item): ParserAction {
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

    acceptAtSymbol(grammar: Grammar, state: LRState, symbol: Symbol, body: ProductionBody, item: Item): ParserAction {
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

    reduceAtSymbol(grammar: Grammar, state: LRState, symbol: Symbol, body: ProductionBody, item: Item): ParserAction {

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


    shiftAtSymbol(grammar: Grammar, state: LRState, symbol: Symbol, body: ProductionBody, item: Item, shift_state_id: string): ParserAction {
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

    gotoAtSymbol(grammar: Grammar, state: LRState, symbol: Symbol, body: ProductionBody, item: Item, goto_state_id: string): ParserAction {

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

    createState(item: Item, sid: string, grammar: Grammar): LRState {

        const state = <LRState>{
            hash: "",
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

        return state;
    }

    process(items: Array<Item>, state_id: { id: string, sym: string; }, grammar: Grammar, excludes: any[] = [], error: CompilerErrorStore) {

        /**
         * Old State Identifier
         * 
         * The identifier of the state that immediately proceeded this current state.
         */
        const old_state_id = state_id.id;

        const to_process_items = <Array<ItemSet>>[],

            actions = <Array<ParserAction>>[],
            /* Create a new state for the set of items that have been passed to it. */
            state = this.createState(items[0], old_state_id, grammar);

        try {
            processClosure(items, grammar, error, excludes);
        } catch (e) {
            console.log(e);
            return { error: "Could not create closure for items " + items.map(e => e.renderWithProduction(grammar)).join(" | "), msg: e };
        }

        state.items = items;

        for (let i = 0, l = items.length; i < l; i++) {

            const item = items[i],
                body = item.body_(grammar),
                offset = item.offset,
                symbol: Symbol = body.sym[offset];

            if (item.USED)
                continue;

            if (body.error.has(offset)) body.error.get(offset).forEach(s => actions.push(this.errorAtSymbol(grammar, state, s, body, item)));
            if (body.reset.has(offset)) body.reset.get(offset).forEach(s => actions.push(this.resetAtSymbol(grammar, state, s, item)));
            if (body.ignore.has(offset)) body.ignore.get(offset).forEach(s => actions.push(this.ignoreAtSymbol(grammar, state, s, item)));

            if (item.atEND || symbol.type == SymbolType.EMPTY) { //At an accepting state for this input

                if (item.body == 0 && item.v == "$eof")
                    actions.push(this.acceptAtSymbol(grammar, state, item.follow, body, item));
                else
                    actions.push(this.reduceAtSymbol(grammar, state, item.follow, body, item));

            } else {

                const
                    id_append = <Set<string>>new Set(),
                    osid = item.sym(grammar),
                    out_items: Item[] = [],
                    sid_set = new Set();

                if (item.offset == 0 && item.body_(grammar).FORK_ON_ENTRY) {

                    for (let j = i; j < l; j++) {
                        const item = items[j];
                        if (item.sym(grammar) && item.sym(grammar).val === osid.val) {
                            if (!id_append.has(item.full_id)) {

                                if (item.body != items[i].body) { continue; }

                                if (item.USED) continue;

                                const new_item = item.increment();

                                item.USED = true;

                                sid_set.add(new_item.id);
                                out_items.push(new_item);
                                id_append.add(new_item.full_id);
                            }
                        }
                    }
                } else {

                    for (let j = i; j < l; j++) {

                        const item = items[j];

                        if (item.sym(grammar) && item.sym(grammar).val === osid.val) {
                            if (!id_append.has(item.full_id)) {

                                if (item.body != items[i].body
                                    && item.offset == 0
                                    && item.body_(grammar).FORK_ON_ENTRY
                                ) {
                                    continue;
                                }

                                if (item.USED) continue;

                                const new_item = item.increment();

                                item.USED = true;

                                sid_set.add(new_item.id);
                                out_items.push(new_item);
                                id_append.add(new_item.full_id);
                            }
                        }
                    }
                }

                const sid = [...sid_set.values()].sort((a, b) => a < b ? -1 : 1).join(";");

                if (out_items.length == 0)
                    continue;

                if (symbol.type !== SymbolType.PRODUCTION) {
                    if (symbol.type !== SymbolType.END_OF_FILE)
                        actions.push(this.shiftAtSymbol(grammar, state, symbol, body, item, sid));
                } else
                    actions.push(this.gotoAtSymbol(grammar, state, symbol, body, item, sid));

                to_process_items.push(<ItemSet>{ items: out_items, state_id: { id: sid, sym: symbol.val }, excludes });
            }
        }

        state.to_process_actions = actions;

        return { to_process_items, state, error: "" };
    }
}
