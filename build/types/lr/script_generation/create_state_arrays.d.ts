import { Grammar } from "source/typescript/types/grammar.js";
import { LRStates } from "source/typescript/types/lr_state.js";
import { ParserEnvironment } from "source/typescript/types/parser_environment.js";
export default function (grammar: Grammar, states: LRStates, env: ParserEnvironment, functions: any, SYM_LU: any, types: any): {
    state_functions: any[];
    goto_map_lookup: any[];
    state_str_functions: any[];
    state_maps: any[];
    goto_maps: Map<any, any>;
    fork_map: any[];
};
