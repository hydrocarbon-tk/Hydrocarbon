import {
    ERROR,
    ACCEPT,
    SHIFT,
    REDUCE,
    FORK_ACTION,
    DO_NOTHING,
    IGNORE
} from "../common/state_action_enums.js";

function setNode(funct, length, functions, return_val, COMPILE_FUNCTION = false) {
    if (funct.type == "CLASS") {
        return (!COMPILE_FUNCTION && funct.env)
            ? { str: `p.rnv(b.fn.${funct.name},${length},0,a,b,c,e,f)` }
            : { str: `p.rnv(g[${functions[funct.name].id}],${length},0,a,b,c,e,f)` };
    } else {
        return (!COMPILE_FUNCTION && funct.env)
            ? { str: `p.rv(b.fn.${funct.name},${length},0,a,b,c,e,f)` }
            : { str: `p.rv(g[${functions[funct.name].id}],${length},0,a,b,c,e,f)` };
    }
}

function convertSymbols(s, SYM_LU, types) {

    const state = s[1],

        k = s[0];

    if (k == "$eof")
        s[0] = 0;

    else switch (state.symbol_type) {
        case "generated":
            s[0] = SYM_LU.get(types[k]);
            break;
        case "literal":
        case "escaped":
        default:
            s[0] = SYM_LU.get(k);
            break;

    }

    return s;
}

function processStateTransition(
    s,
    env,
    st,
    bodies,
    state_map,
    state_functions_map,
    state_str_functions,
    COMPILE_FUNCTION,
    fork_map,
    SYM_LU,
    types
) {
    const state = s[1],
        k = s[0],
        length = state.size,
        body = bodies[state.body],
        funct = [];

    if (k == st.pos)
        return;

    st.pos = k;

    let
        st_fn_id = "",
        return_value = 0,
        fn = 0;

    if (body && body.functions)
        for (let i = 0; i < body.functions.length; i++) {
            const f = body.functions[i];
            if (f.offset == state.offset) {
                const name = f.name;
                st_fn_id += name;
                if (f.env)
                    funct.push(`p.s(b.functions.${name},a,b,c,e,f)`);
                else
                    funct.push(`p.s(g[${env.functions[name].id}],a,b,c,e,f)`);
            }
        }

    switch (state.name) {
        case FORK_ACTION:

            var fork_ids = state.actions.map(s => convertSymbols([k, s], SYM_LU, types))
                .map(s => processStateTransition(
                    s,
                    env, { id: 0, pos: Infinity },
                    bodies,
                    [],
                    state_functions_map,
                    state_str_functions,
                    COMPILE_FUNCTION,
                    SYM_LU,
                    types
                ));

            return_value = (FORK_ACTION | (fork_ids.length << 3) | (fork_map.length << 16));

            fork_map.push(...fork_ids);

            st_fn_id = `e=>${return_value}`;

            fn = state_functions_map.get(st_fn_id);

            if (!fn) {
                fn = state_str_functions.push(st_fn_id);
                state_functions_map.set(st_fn_id, fn);
            }
            state_map[k] = fn;
            break;
        case ACCEPT:

            st_fn_id += "a";
            return_value = (ACCEPT | (state.state << 3));
            /*intentional*/
        case REDUCE:

            if (!return_value) {

                st_fn_id += "r";

                return_value = (REDUCE | (length << 3) | (state.production << 11));
            }

            if (length > 0) {
                if (body.reduce_function) {
                    const out = setNode(body.reduce_function, length, env.functions, return_value, COMPILE_FUNCTION);
                    funct.push(out.str);
                    st_fn_id += body.reduce_function.name;
                } else {
                    funct.push(`p.rn(${length},a,b,c,e,f)`);
                }
            } else
                funct.push(`(p.rn(0,a,b,c,e,f))`); /* empty production*/
            /*intentional*/
        case SHIFT:

            if (!return_value) {

                st_fn_id += "s";

                return_value = (SHIFT | (state.state << 3));
            }

            st_fn_id += return_value;

            fn = state_functions_map.get(st_fn_id);

            if (!fn) {
                fn = state_str_functions.push(`${funct.length > 0 ? "(a,b,c,e,f,g,p)" : "e"}=>${ funct.length > 0 
                            ?  funct.length > 0 
                                ? "(" + funct.join(",")+`,${return_value})` 
                                : funct.join(",") 
                            : return_value}`);
                state_functions_map.set(st_fn_id, fn);
            }
            //state_map.push(fn);
            state_map[k] = fn;
            break;
        case IGNORE:
        case DO_NOTHING:
            state_map[k] = 0;
            //state_map.push(0);
            break;
        case ERROR:
            state_map[k] = -1;
            //state_map.push(-1);
            break;
    }

    return fn;
}


export default function(grammar, states, env, functions, SYM_LU, types) {

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
            error_handlers.push(`${funct.toString().replace(/(anonymous)?[\n\t]*/g,"")}`);
        } else {
            error_handlers.push("e");
        }
        //*
        [...state.actions.entries()]
        .map(s => convertSymbols(s, SYM_LU, types))
            .sort((a, b) => (a[0] < b[0]) ? -1 : 1)
            .reduce((r, s) => (processStateTransition(
                s,
                env,
                r,
                bodies,
                state_map,
                state_functions_map,
                state_str_functions,
                COMPILE_FUNCTION,
                fork_map,
                SYM_LU,
                types
            ), r), { id: 0, pos: -1 }); //*/

        //Create the goto tables. Find matches and consolidate.
        //Goto tables are found at top of the parser.

        const goto_out = fillAndCompress(([...state.goto.entries()])
            .sort((a, b) => a[0] < b[0] ? -1 : 1)
            .reduce(((r, k) => (r[k[0]] = (k[1].state), r)), []));

        let id = -1;

        if (goto_out.length > 1) {
            const goto_id = goto_out.join("");
            if (goto_maps.has(goto_id)) {
                id = goto_maps.get(goto_id).id;
            } else {
                id = goto_maps.size;
                goto_maps.set(goto_id, { id, goto: goto_out });
            }
        }

        goto_map_lookup.push((goto_out.length > 1) ? id : `-1`);

        const out_state_map = fillAndCompress(state_map),
            sm_id = `[${out_state_map.join(",")}]`;

        /*  Create a uid for state map and use this to determine 
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

function fillAndCompress(array) {
    const copy = array.slice();
    /* Fill out empty entries in state_map with -1 */
    for (let i = 0; i < copy.length; i++)
        if (copy[i] === undefined) copy[i] = -1;
    /* Compress state map by reducing -1 entries */
    return copy.reduce((r, i, l) => (l = r.length - 1, ((+r[l] < 0) && i < 0) ? r[l]-- : r.push(i), r), []);
}