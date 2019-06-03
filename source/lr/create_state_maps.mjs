//Root State Functions
const max = Math.max,

    reduce_with_value = (ret, fn, plen, ln, t, e, o, l, s) => {
        ln = max(o.length - plen, 0);
        o[ln] = fn(o.slice(-plen), e, l, s, o, plen);
        o.length = ln + 1;
        return ret;
    },

    reduce_with_new_value = (ret, Fn, plen, ln, t, e, o, l, s) => {
        ln = max(o.length - plen, 0);
        o[ln] = new Fn(o.slice(-plen), e, l, s, o, plen);
        o.length = ln + 1;
        return ret;
    },

    reduce_to_null = (ret, plen, t, e, o, l, s) => {
        if(plen > 0){
            let ln = max(o.length - plen, 0);
            o[ln] = o[o.length -1];
            o.length = ln + 1;
        }
        return ret;
    },

    shift_with_function = (ret, fn, t, e, o, l, s) => (fn(o, e, l, s), ret),
    reduce_with_value_name = "redv",
    reduce_with_new_value_name = "rednv",
    reduce_to_null_name = "redn",
    shift_with_function_name = "shftf";

function setNode(funct, length, functions, id, return_val, COMPILE_FUNCTION = false) {
    if (funct.type == "CLASS") {
        return (!COMPILE_FUNCTION && funct.env) ?
            { id, str: `${reduce_with_new_value_name}(${return_val},fn.${funct.name},${length},0,...v)` } :
            { id, str: `${reduce_with_new_value_name}(${return_val},${funct.name},${length},0,...v)` };
    } else {
        return (!COMPILE_FUNCTION && funct.env) ?
            { id, str: `${reduce_with_value_name}(${return_val},fn.${funct.name},${length},0,...v)` } :
            { id, str: `${reduce_with_value_name}(${return_val},${funct.name},${length},0,...v)` };
    }
}

export default function(grammar, states, env, functions, SYM_LU, types) {
    functions.push(
        `${reduce_with_value_name} = ${reduce_with_value.toString().replace(/(anonymous)?[\n\t]*/g,"")}`,
        `${reduce_with_new_value_name} = ${reduce_with_new_value.toString().replace(/(anonymous)?[\n\t]*/g,"")}`,
        `${reduce_to_null_name} = ${reduce_to_null.toString().replace(/(anonymous)?[\n\t]*/g,"")}`,
        `${shift_with_function_name} = ${shift_with_function.toString().replace(/(anonymous)?[\n\t]*/g,"")}`,
    );

    let fn_id = 0;

    const
        bodies = grammar.bodies,
        state_functions = [],
        goto_functions = [],
        state_str_functions = [],
        state_functions_map = new Map(),
        state_maps = [],
        state_maps_map = new Map(),
        goto_maps = new Map(),
        COMPILE_FUNCTION = (env.options) ? !!env.options.integrate : !1,
        error_handlers = [];

    for (let i = 0; i < states.length; i++) {

        const
            state = states[i],
            production = bodies[state.body].production,
            state_map = [0];

        if (production.error) {
            const funct = production.error;
            error_handlers.push(`${funct.toString().replace(/(anonymous)?[\n\t]*/g,"")}`);
        } else {
            error_handlers.push("e");
        }

        let last_pos = -1;
        ([...state.action.entries()]).map(s => {

            const state = s[1],
            
                k = s[0];

            if (k == "$eof")
                s[0] = 0;
            
            else switch (state.symbol_type) {
                case "literal":
                case "escaped":
                default:
                    s[0] = SYM_LU.get(k);
                    break;
                case "generated":
                    //if (k == "any") {
                    //    s[0] = SYM_LU.get(k);
                    //} else
                        s[0] = SYM_LU.get(types[k]);
            }

            //console.log(k, s[0])
            return s;
        }).sort((a, b) => (a[0] < b[0]) ? -1 : 1).forEach(s => {
            const state = s[1],
                k = s[0],
                length = state.size,
                body = bodies[state.body],
                funct = [];
            
            if (k == last_pos) 
                return;

            if (k - last_pos > 1) {
                /*
                    let v = k - last_pos - 1;
                    while (v-- > 0)
                        state_map.push(-1);
                */
                state_map.push(-(k - last_pos - 1));
            }
            //console.log(k, last_pos, k - last_pos, state.name)

            last_pos = k;

            let
                st_fn_id = "",
                return_value = 0,
                fn = 0;
            switch (state.name) {
                case "ACCEPT":

                    st_fn_id = "a";
                    return_value = 1 | (length << 2);

                    /*intentional*/
                case "REDUCE":

                    if (!st_fn_id) {

                        st_fn_id = "r";

                        return_value = (3 | (length << 2) | (state.production.id << 10));
                    }

                    if (length > 0) {
                        if (body.reduce_function) {
                            const out = setNode(body.reduce_function, length, functions, fn_id, return_value, COMPILE_FUNCTION);
                            funct.push(out.str);
                            st_fn_id += body.reduce_function.name;
                            fn_id = out.id;
                        }else{
                            funct.push(`redn(${return_value},${length},...v)`);
                        }
                    } else
                        funct.push(`(${reduce_to_null_name}(${return_value},0,...v))`); /* empty production*/
                    /*intentional*/
                case "SHIFT":

                    if (!st_fn_id) {

                        st_fn_id = "s";

                        return_value = (2 | (state.state << 2));
                    }

                    for (let i = 0; i < body.functions.length; i++) {
                        const f = body.functions[i];
                        if (f.offset == state.offset) {
                        //console.log(f, state.offset)
                            const name = f.name;
                            st_fn_id += name;
                            if (f.env)
                                funct.push(`${shift_with_function_name}(${return_value},v[1].functions.${name},...v)`);
                            else
                                funct.push(`${shift_with_function_name}(${return_value},${name},...v)`);
                        }
                    }

                    st_fn_id += return_value;

                    fn = state_functions_map.get(st_fn_id);

                    if (!fn) {
                        fn = state_str_functions.push(`(${funct.length > 0 ? "...v" : ""})=>(${ funct.length > 0 ?  funct.join(",") : ""+return_value})`);
                        state_functions_map.set(st_fn_id, fn);
                    }

                    state_map.push(fn);

                    break;

                case "IGNORE":
                    state_map.push(0);
                    break;

                case "ERROR":
                    state_map.push(-1);
                    break;
            }
        });


        //Create the goto tables. Find matches and consolidate.
        //Goto tables are found at top of the parser.
        const goto = [0];
        let last = -1;
        [...state.goto.entries()]
        .sort((a, b) => a[0] < b[0] ? -1 : 1)
            .forEach(k => {
                if (k[0] - last > 1) {
                    /*
                    let v = k[0] - last - 1;
                    while (v-- > 0)
                        goto.push(-1);
                    */
                    goto.push(-(k[0] - last - 1));
                }
                goto.push(k[1].state);
                last = k[0];
            });

        let id = -1;

        if (goto.length > 1) {

            const goto_id = goto.join("");


            if (goto_maps.has(goto_id)) {
                id = goto_maps.get(goto_id).id;
            } else {
                id = goto_maps.size;
                goto_maps.set(goto_id, { id, goto });
            }
        }

        goto_functions.push((goto.length > 1) ? `v=>lsm(v,gt${id})` : `nf`);

        const sm_id = `[${state_map.join(",")}]`;
        let mm = state_maps_map.get(sm_id);
        if (mm == undefined) {
            mm = state_maps.length;
            state_maps_map.set(sm_id, mm);
            state_maps.push(sm_id);
        }
        state_functions.push(`sm${mm}`);
    }

    return { state_functions, goto_functions, state_str_functions, state_maps, goto_maps };
}
