/** Compiles a stand alone JS parser from a LR rules table and env object **/
import { types as t, filloutGrammar } from "../util/common.mjs";

import createSparseStateMaps from "./create_state_maps.mjs";

import { verboseCompiler, compressedCompiler } from "./compiler_script.mjs";

export function LRParserCompiler(states, grammar, env) {
    //Build new env variables if they are missing 
    if (!grammar.bodies) {
        filloutGrammar(grammar, env);
    }

    if (states.type !== "lr") {
        throw new Error("");
    }

    const GEN_SYM_LU = new Map();

    let n = 0;

    let types = Object.assign({}, t);

    types.any = 200;

    for (let a in types)
        GEN_SYM_LU.set(a, (((n++) / 2) | 0) + 1);

    GEN_SYM_LU.set("any", 13);


    //parse body function
    const
        COMPILE_FUNCTION = (env.options) ? !!env.options.integrate : false,
        functions = [],
        error_handlers = [],
        SYMBOL_INDEX_OFFSET = 14, //Must leave room for symbol types indices
        //Convert all terminals to indices and create lookup map for terminals
        SYM_LU = new Map([
            ...[...GEN_SYM_LU.entries()].map(e => [types[e[0]], e[1]]),
            ...[...grammar.meta.all_symbols.values()].map((e, i) => ([(e.type == "generated") ? (types[e[0]]) : e.val, (e.type == "generated") ? GEN_SYM_LU.get(e.val) : i + SYMBOL_INDEX_OFFSET]))
        ]),



        { state_functions, goto_functions, state_str_functions, state_maps, goto_maps } = createSparseStateMaps(grammar, states, env, functions, SYM_LU, types);

    for (let i = 0; i < states.length; i++) {
        const production = grammar.bodies[states[i].body].production;
        if (production.error) {
            const funct = production.error;
            error_handlers.push(`${funct.toString().replace(/(anonymous)?[\n\t]*/g,"")}`);
        } else {
            error_handlers.push("e");
        }
    }

    if (env.functions) {
        for (let n in env.functions) {
            const funct = env.functions[n];

            if (COMPILE_FUNCTION || funct.INTEGRATE)
                functions.push(`${n}=${funct.toString().replace(/(anonymous)?[\n\t]*/g,"")}`);
        }
    }

    let default_error = `(tk,r,o,l,p)=>{if(l.END)l.throw("Unexpected end of input");else if(l.ty & (${types.ws | types.nl})) l.throw(\`Unexpected space character within input "\${1}" \`) ; else l.throw(\`Unexpected token \${l.tx} within input "\${111}" \`)}`;

    if (env.functions.defaultError)
        default_error = `(...d)=>fn.defaultError(...d)`;

    const output = verboseCompiler(
        goto_maps,
        state_maps,
        state_functions,
        SYM_LU,
        default_error,
        error_handlers,
        functions,
        state_str_functions,
        goto_functions,
        GEN_SYM_LU,
        [...(grammar.meta.symbols || new Map).values()].map(e => e.val));

    return output;
}
