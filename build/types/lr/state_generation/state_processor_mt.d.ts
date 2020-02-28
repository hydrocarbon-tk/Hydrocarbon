import { LRState, ParserAction } from "../../types/LRState.js";
import { Item } from "../../util/item.js";
import { Grammar, Symbol, ProductionBody } from "../../types/grammar.js";
import { ItemSet } from "./ItemSet.js";
export default class StateProcessor {
    errorAtSymbol(grammar: Grammar, state: LRState, symbol: {
        type: any;
        val: any;
    }, body: ProductionBody, item: Item): ParserAction;
    resetAtSymbol(grammar: any, state: LRState, symbol: Symbol, item: Item): ParserAction;
    ignoreAtSymbol(grammar: any, state: LRState, symbol: Symbol, item: Item): ParserAction;
    acceptAtSymbol(grammar: Grammar, state: LRState, symbol: Symbol, body: ProductionBody, item: Item): ParserAction;
    reduceAtSymbol(grammar: Grammar, state: LRState, symbol: Symbol, body: ProductionBody, item: Item): ParserAction;
    shiftAtSymbol(grammar: Grammar, state: LRState, symbol: Symbol, body: ProductionBody, item: Item, shift_state_id: string): ParserAction;
    gotoAtSymbol(grammar: Grammar, state: LRState, symbol: Symbol, body: ProductionBody, item: Item, goto_state_id: string): ParserAction;
    createState(item: Item, sid: string, grammar: Grammar): LRState;
    process(items: Array<Item>, state_id: {
        id: string;
        sym: string;
    }, grammar: Grammar, excludes?: any[], error?: {}, LALR_MODE?: boolean): {
        error: string;
        msg: any;
        to_process_items?: undefined;
        state?: undefined;
    } | {
        to_process_items: ItemSet[];
        state: LRState;
        error: string;
        msg?: undefined;
    };
}
