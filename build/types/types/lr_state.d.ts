import { Item } from "../util/item";
import { SymbolType } from "./grammar.js";
import { StateActionEnum } from "./state_action_enums.js";
export interface ParserAction {
    name: StateActionEnum;
    state: number;
    body: number;
    sid?: string;
    symbol_type: SymbolType;
    symbol?: string | number;
    item?: Item;
    item_string?: string;
    size?: number;
    offset?: number;
    production?: number;
    original_body?: any;
    state_real_id?: string;
    actions?: Array<ParserAction>;
    registered?: Set<string>;
}
export declare type LRStates = Array<LRState> & {
    type: string;
    lu_map: Map<string, LRState>;
    count: number;
    COMPILED: boolean;
};
export interface LRState {
    thread_id: number;
    grammar_stamp: any;
    body: any;
    production: any;
    production_string: any;
    id: number;
    real_id: string;
    follows: any;
    item: string;
    to_process_actions?: Array<ParserAction>;
    actions?: Map<string | number, ParserAction>;
    goto?: Map<string | number, ParserAction>;
}
