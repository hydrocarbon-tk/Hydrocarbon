//Root State Functions
function setNode(funct, length, functions, id, form) {
    return { id: id + "" + form, str: `reduceToValue(tk,output_offset,output,${length},&NodeFunctions::${funct.name}, ${form}, alloc)` };
}
export default function (grammar, states, env, functions, SYM_LU, types) {
    let fn_id = 0;
    const bodies = grammar.bodies, state_functions = [], goto_functions = [], state_str_functions = [], state_functions_map = new Map(), state_maps = [], state_maps_map = new Map(), goto_maps = new Map(), COMPILE_FUNCTION = (env.options) ? !!env.options.integrate : !1, error_handlers = [], symbol_count = SYM_LU.size;
    goto_maps.set("gtd", { id: "d", goto: (new Array(states.length)).fill(0) });
    for (let i = 0; i < states.length; i++) {
        var HAS_ANY = false;
        const state = states[i], production = bodies[state.body].production, state_map = [];
        if (production.error) {
            const funct = production.error;
            error_handlers.push(`${funct.toString().replace(/(anonymous)?[\n\t]*/g, "")}`);
        }
        else {
            error_handlers.push("defaultError");
        }
        let last_pos = -1;
        ([...state.action.entries()]).map(s => {
            const state = s[1], k = s[0];
            if (k == "$eof")
                s[0] = 0;
            else
                switch (state.symbol_type) {
                    case "generated":
                        if (k == "any")
                            HAS_ANY = true;
                        s[0] = SYM_LU.get(types[k]);
                        break;
                    case "literal":
                    case "escaped":
                    default:
                        s[0] = SYM_LU.get(k);
                        break;
                }
            return s;
        }).sort((a, b) => (a[0] < b[0]) ? -1 : 1).forEach(s => {
            const state = s[1], k = s[0], length = state.size, body = bodies[state.body], funct = [];
            if (k == last_pos)
                return;
            if (k - last_pos > 1)
                state_map.push(...(new Array(k - last_pos - 1).fill(-1)));
            last_pos = k;
            let st_fn_id = "", return_value = 0, fn = 0;
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
                            const out = setNode(body.reduce_function, length, functions, fn_id, body.form);
                            funct.push(out.str);
                            st_fn_id += body.reduce_function.name + body.form;
                            fn_id = out.id;
                        }
                        else {
                            funct.push(`reduceToNull(${length}, output_offset, output)`);
                        }
                    }
                    else
                        funct.push(`(reduceToNull(0, output_offset, output))`); /* empty production*/
                /*intentional*/
                case "SHIFT":
                    if (!st_fn_id) {
                        st_fn_id = "s";
                        return_value = (2 | (state.state << 2));
                    }
                    for (let i = 0; i < body.functions.length; i++) {
                        const f = body.functions[i];
                        if (f.offset == state.offset) {
                            const name = f.name;
                            st_fn_id += name;
                            /*
                            if (f.env)
                                funct.push(`${shift_with_function_name}(${return_value},v[1].functions.${name},...v)`);
                            else
                                funct.push(`${shift_with_function_name}(${return_value},${name},...v)`);
                            */
                        }
                    }
                    st_fn_id += return_value;
                    fn = state_functions_map.get(st_fn_id);
                    if (!fn) {
                        fn = state_str_functions.push(`[](Token& tk, int& output_offset, void ** output, void * alloc)->int{${funct.join(";") + ";"} return ${return_value};}`);
                        state_functions_map.set(st_fn_id, fn);
                    }
                    state_map.push(fn);
                    break;
                case "IGNORE":
                    state_map.push(0);
                    break;
                case "DO-NOTHING":
                    state_map.push(0);
                    break;
                case "ERROR":
                    state_map.push(-1);
                    break;
            }
        });
        state_map.push(...(new Array(symbol_count - last_pos).fill(-1)));
        //Create the goto tables. Find matches and consolidate.
        //Goto tables are found at top of the parser.
        const goto = [];
        let last = -1;
        [...state.goto.entries()]
            .sort((a, b) => a[0] < b[0] ? -1 : 1)
            .forEach(k => {
            if (k[0] - last > 1) {
                goto.push(...(new Array(k[0] - last - 1).fill(-1)));
            }
            goto.push(k[1].state);
            last = k[0];
        });
        goto.push(...(new Array(states.length - last).fill(-1)));
        let id = -1;
        if (goto.length > 1) {
            const goto_id = goto.join("");
            if (goto_maps.has(goto_id)) {
                id = goto_maps.get(goto_id).id;
            }
            else {
                id = goto_maps.size;
                goto_maps.set(goto_id, { id, goto });
            }
        }
        goto_functions.push((goto.length > 1) ? `gt${id}` : `gtd`);
        const sm_id = `[${state_map.join(",")}]`;
        let mm = state_maps_map.get(sm_id);
        if (mm == undefined) {
            mm = state_maps.length;
            state_maps_map.set(sm_id, mm);
            state_maps.push(state_map);
        }
        state_functions.push(`sm${mm}`);
    }
    return { state_functions, goto_functions, state_str_functions, state_maps, goto_maps };
}
