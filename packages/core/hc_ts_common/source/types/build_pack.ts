import { GrammarObject } from "./grammar";
import { StateMap } from './ir_state_data';

export interface BuildPack {
    grammar: GrammarObject;
    state_buffer: Uint32Array;
    states_map: StateMap;
}
