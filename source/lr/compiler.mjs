/** Compiles a stand alone JS parser from a LR rules table and env object **/
import { types as t, filloutGrammar } from "../util/common.mjs";

import createSparseStateMaps from "./create_state_maps.mjs";

import { verboseCompiler, compressedCompiler } from "./compiler_script.mjs";

import { types as js_types, null_literal, arrow_function_declaration, argument_list, member_expression, numeric_literal, identifier, parse as ecmascript_parse } from "@candlefw/js";

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
    types.keyword = 201;

    for (let a in types)
        GEN_SYM_LU.set(a, (((n++) / 2) | 0) + 1);

    GEN_SYM_LU.set("any", 13);
    GEN_SYM_LU.set("keyword", 14);



    //parse body function
    const
        COMPILE_FUNCTION = (env.options) ? !!env.options.integrate : false,
        functions = [],
        error_handlers = [],
        SYMBOL_INDEX_OFFSET = 15, //Must leave room for symbol types indices
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

            if (COMPILE_FUNCTION || funct.INTEGRATE) {
                console.log(generateCompactFunction(funct.toString()));
                //functions.push(`${n}=${funct.toString().replace(/(anonymous)?[\n\t]*/g,"")}`);
                functions.push(`${n}=${generateCompactFunction(funct.toString())}`);
            }
        }
    }

    let default_error = `(tk,r,o,l,p)=>{if(l.END)l.throw("Unexpected end of input");else if(l.ty & (${types.ws | types.nl})) l.throw(\`Unexpected space character within input "\${p.slice(l)}" \`) ; else l.throw(\`Unexpected token \${l.tx}" \`)}`;

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

function generateCompactFunction(function_string) {
    const fn = ecmascript_parse(function_string).statements;

           // / console.log(function_string);
    if (fn.body) {

        const ids = new Set;
        const cls = new Set;

        if (fn.body.type == js_types.return_statement) {
            const arrow = new arrow_function_declaration(null, [new argument_list(fn.args)], fn.body);

            arrow.vals[2] = arrow.body.expr;

            arrow.body.getRootIds(ids, cls);

            const args = arrow.args;

            for (let i = args.length - 1; i > -1; i--) {
                let id = args.args[i].name;
                if (ids.has(id)) {
                    args.vals[0] = args.args.slice(0, i + 1);
                    break;
                }

                if(i == 0){
                    args.vals[0] = [];
                }
            }

            return arrow.render();
        } else {


            fn.body.getRootIds(ids, cls);

            const args = fn.args;

            for (let i = args.length - 1; i > -1; i--) {
                let id = args[i].name;
                if (ids.has(id)) {
                    fn.vals[1] = args.slice(0, i + 1);
                    break;
                }

                if(i == 0){
                    fn.vals[1] = [];
                }
            }
            //return function_string.replace(/(anonymous)?[\n\t]*/g, "");
        }
    } else {
        fn.vals[1] = [];
    }

    fn.id.vals[0] = "";

    return fn.render();


}
