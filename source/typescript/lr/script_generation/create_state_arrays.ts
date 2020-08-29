import { Grammar } from "source/typescript/types/grammar.js";
import { LRStates } from "source/typescript/types/lr_state.js";
import { ParserEnvironment } from "source/typescript/types/parser_environment.js";
import { processStateTransition, convertSymbols } from "./process_state_transition.js";
import { fillAndCompress } from "./fill_and_compress.js";


export default function (grammar: Grammar, states: LRStates, env: ParserEnvironment, functions, SYM_LU, types) {

    const
        bodies = grammar.bodies,
        state_functions = [],
        goto_map_lookup = [],
        state_str_functions = [],
        state_functions_map = new Map(),
        state_maps = [],
        state_maps_map = new Map(),
        goto_maps = new Map(),
        COMPILE_FUNCTION = (env.options) ? !!env.options.integrate : !1,
        error_handlers = [],
        fork_map = [];


    for (let i = 0; i < states.length; i++) {

        const
            state = states[i],
            production = bodies[state.body].production,
            state_map = [];

        if (production.error) {
            const funct = production.error;
            error_handlers.push(`${funct.toString().replace(/(anonymous)?[\n\t]*/g, "")}`);
        } else {
            error_handlers.push("e");
        }

        [...state.actions.entries()]
            .map(s => convertSymbols(s, SYM_LU, types))
            .sort((a, b) => (a[0] < b[0]) ? -1 : 1)
            .forEach((s) => (processStateTransition(
                s,
                env,
                bodies,
                state_map,
                state_functions_map,
                state_str_functions,
                COMPILE_FUNCTION,
                fork_map,
                SYM_LU,
                types
            )));

        //Create the goto tables. Find matches and consolidate.
        //Goto tables are found at top of the parser.

        const goto_out = fillAndCompress(([...state.goto.entries()])
            .sort((a, b) => a[0] < b[0] ? -1 : 1)
            .reduce(((r, k) => (r[k[0]] = (k[1].state), r)), []));

        let id = -1;

        if (goto_out.length > 1) {
            const goto_id = goto_out;//.join("");
            if (goto_maps.has(goto_id)) {
                id = goto_maps.get(goto_id).id;
            } else {
                id = goto_maps.size;
                goto_maps.set(goto_id, { id, goto: goto_out });
            }
        }

        goto_map_lookup.push((goto_out.length > 1) ? id : `-1`);

        const
            out_state_map = fillAndCompress(state_map),
            sm_id = `[${out_state_map/*.join(",")*/}]`;

        /*  Create a UID for state map and use this to determine 
            if one has been created from another state */
        let mm = state_maps_map.get(sm_id);

        if (mm == undefined) {
            mm = state_maps.length;
            state_maps_map.set(sm_id, mm);
            state_maps.push(out_state_map);
        }

        state_functions.push(`${mm}`);
    }

    return { state_functions, goto_map_lookup, state_str_functions, state_maps, goto_maps, fork_map };
}