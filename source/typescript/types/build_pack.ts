import { GrammarObject } from "./grammar_nodes.js";
import { StateMap } from './ir_state_data.js';

export interface BuildPack {
    grammar: GrammarObject;
    state_buffer: Uint32Array;
    states_map: StateMap;
}
