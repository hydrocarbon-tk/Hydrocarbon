export default function (grammar: any, states: any, env: any, functions: any, SYM_LU: any, types: any): {
    state_functions: any[];
    goto_map_lookup: any[];
    state_str_functions: any[];
    state_maps: any[];
    goto_maps: Map<any, any>;
    fork_map: any[];
};
