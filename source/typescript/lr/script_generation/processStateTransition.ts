import { StateActionEnum } from "../../types/state_action_enums.js";
import { ProductionBody, Symbol } from "source/typescript/types/grammar.js";
import { LRState, ParserAction } from "source/typescript/types/LRState.js";
import { ParserEnvironment } from "source/typescript/types/parser_environment.js";

export function setNode(funct, length, functions, return_val, COMPILE_FUNCTION = false) {
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

export function convertSymbols(s, SYM_LU, types) {

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

export function processStateTransition(
    s: [number, ParserAction], 
    env: ParserEnvironment, 
    bodies: ProductionBody[], 
    state_map: any[], 
    state_functions_map: Map<any, any>, 
    state_str_functions: any[], 
    COMPILE_FUNCTION: boolean, 
    fork_map: number[], 
    SYM_LU: any, 
    types: undefined
    ) : number {

    const state = s[1], k = s[0], length = state.size, body = bodies[state.body], funct = [];
    
    /**
     * @todo not sure if the following check is needed. Disabling for now.
     //if (k == st.pos)
     //    return;
     //
     //st.pos = k;
     */
     
    let st_fn_id = "", return_value = 0, action_function_index = 0;
    
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

        case StateActionEnum.FORK:

            const fork_ids = state.actions.map(s => convertSymbols([k, s], SYM_LU, types))
                .map(s => 
                        processStateTransition(
                            s, 
                            env, 
                            bodies, 
                            [], 
                            state_functions_map, 
                            state_str_functions, 
                            COMPILE_FUNCTION,
                            [], 
                            SYM_LU, 
                            types
                            )
                    );
            return_value = (StateActionEnum.FORK | (fork_ids.length << 3) | (fork_map.length << 16));
            fork_map.push(...fork_ids);
            st_fn_id = `e=>${return_value}`;
            action_function_index = state_functions_map.get(st_fn_id);
            
            if (!action_function_index) {
                action_function_index = state_str_functions.push(st_fn_id);
                state_functions_map.set(st_fn_id, action_function_index);
            }
            
            state_map[k] = action_function_index;

            break;

        case StateActionEnum.ACCEPT:
            st_fn_id += "a";
            return_value = (StateActionEnum.ACCEPT | (state.state << 3));
        /*intentional*/
        case StateActionEnum.REDUCE:
            if (!return_value) {
                st_fn_id += "r";
                return_value = (StateActionEnum.REDUCE | (length << 3) | (state.production << 11));
            }
            if (length > 0) {
                if (body.reduce_function) {
                    const out = setNode(body.reduce_function, length, env.functions, return_value, COMPILE_FUNCTION);
                    funct.push(out.str);
                    st_fn_id += body.reduce_function.name;
                }
                else {
                    funct.push(`p.rn(${length},a,b,c,e,f)`);
                }
            }
            else
                funct.push(`(p.rn(0,a,b,c,e,f))`); /* empty production*/
        /*intentional*/
        case StateActionEnum.SHIFT:
            if (!return_value) {
                st_fn_id += "s";
                return_value = (StateActionEnum.SHIFT | (state.state << 3));
            }
            st_fn_id += return_value;
            action_function_index = state_functions_map.get(st_fn_id);
            if (!action_function_index) {
                action_function_index = state_str_functions.push(`${funct.length > 0 ? "(a,b,c,e,f,g,p)" : "e"}=>${funct.length > 0
                    ? funct.length > 0
                        ? "(" + funct.join(",") + `,${return_value})`
                        : funct.join(",")
                    : return_value}`);
                state_functions_map.set(st_fn_id, action_function_index);
            }
            //state_map.push(fn);
            state_map[k] = action_function_index;
            break;
        case StateActionEnum.IGNORE:
        case StateActionEnum.DO_NOTHING:
            state_map[k] = 0;
            //state_map.push(0);
            break;
        case StateActionEnum.ERROR:
            state_map[k] = -1;
            //state_map.push(-1);
            break;
    }
    return action_function_index;
}
