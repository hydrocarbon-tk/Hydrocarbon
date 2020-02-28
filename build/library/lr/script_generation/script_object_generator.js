/** Compiles a stand alone JS parser from a LR rules table and env object **/
//@ts-ignore
import { types as js_types, arrow_function_declaration, parse as ecmascript_parse } from "@candlefw/js";
import createStateArrays from "./create_state_arrays.js";
import { verboseTemplate } from "./data_object_template.js";
import { types as t, filloutGrammar } from "../../util/common.js";
import { SymbolType } from "../../types/grammar";
function generateCompactFunction(function_string) {
    //return function_string.replace(/(anonymous)?[\n\t]*/g, "");
    let fn = ecmascript_parse(function_string).statements;
    fn.id.vals[0] = "";
    if (fn.body) {
        const ids = new Set;
        const cls = new Set;
        if (fn.body.type == js_types.return_statement) {
            fn = new arrow_function_declaration(null, fn.args, fn.body);
            fn.vals[2] = fn.body.expr;
        }
        fn.body.getRootIds(ids, cls);
        const args = fn.args;
        for (let i = args.length - 1; i > -1; i--) {
            const id = args.args[i].name;
            if (ids.has(id)) {
                args.vals = args.args.slice(0, i + 1);
                break;
            }
            if (i == 0) {
                args.vals = [];
            }
        }
    }
    else {
        fn.vals[1] = [];
    }
    return fn.render();
}
export default function GenerateLRParseDataObject(states, grammar, env) {
    //Build new env variables if they are missing 
    if (!grammar.bodies)
        filloutGrammar(grammar, env);
    if (states.type !== "lr")
        throw new Error("");
    const GEN_SYM_LU = new Map(), types = Object.assign({}, t);
    //@ts-ignore
    types.any = 200;
    //@ts-ignore
    types.keyword = 201;
    let n = 0;
    for (const a in types)
        GEN_SYM_LU.set(a, (((n++) / 2) | 0) + 1);
    n = n / 2;
    GEN_SYM_LU.set("white_space_new_line", n++);
    GEN_SYM_LU.set("any", n++);
    GEN_SYM_LU.set("keyword", n++);
    //parse body function
    const COMPILE_FUNCTION = (env.options) ? !!env.options.integrate : false, functions = [];
    if (env.functions)
        for (const n in env.functions) {
            const funct = env.functions[n];
            if (COMPILE_FUNCTION || funct.INTEGRATE)
                funct.id = functions.push(`${generateCompactFunction(funct.toString())}`) - 1;
        }
    const error_handlers = [], SYMBOL_INDEX_OFFSET = ++n, //Must leave room for symbol types indices
    //Convert all terminals to indices and create lookup map for terminals
    SYM_LU = new Map([
        ...[...GEN_SYM_LU.entries()].map(e => [types[e[0]], e[1]]),
        ...[...grammar.meta.all_symbols.values()]
            .map((e, i) => [
            (e.type == SymbolType.GENERATED)
                ? types[e[0]]
                : e.val,
            (e.type == SymbolType.GENERATED)
                ? GEN_SYM_LU.get(e.val)
                : i + SYMBOL_INDEX_OFFSET
        ])
    ]), { state_functions, goto_map_lookup, state_str_functions, state_maps, goto_maps, fork_map } = createStateArrays(grammar, states, env, functions, SYM_LU, types);
    for (let i = 0; i < states.length; i++) {
        const production = grammar.bodies[states[i].body].production;
        if (production.error) {
            const funct = production.error;
            error_handlers.push(`${funct.toString().replace(/(anonymous)?[\n\t]*/g, "")}`);
        }
        else {
            error_handlers.push("e");
        }
    }
    let default_error = `(tk,r,o,l,p)=>{if(l.END)l.throw("Unexpected end of input");else if(l.ty & (${types.ws | types.nl})) l.throw(\`Unexpected space character within input "\${p.slice(l)}" \`) ; else l.throw(\`Unexpected token [\${l.tx}]\`)}`;
    if (env.functions.defaultError)
        default_error = `(...d)=>d[1].fn.defaultError(...d)`;
    const output = verboseTemplate(fork_map, goto_maps, state_maps, state_functions, SYM_LU, default_error, error_handlers, functions, state_str_functions, goto_map_lookup, GEN_SYM_LU, [...(grammar.meta.symbols || new Map).values()].map(e => e.val));
    return output;
}
