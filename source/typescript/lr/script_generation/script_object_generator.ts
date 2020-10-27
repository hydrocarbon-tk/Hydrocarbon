/** Compiles a stand alone JS parser from a LR rules table and env object **/
//@ts-ignore
import { JSNodeClass } from "@candlefw/js";
import { traverse } from "@candlefw/conflagrate";

import createStateArrays from "./create_state_arrays.js";
import { compressedTemplate } from "./data_object_template.js";
import { types as t, filloutGrammar } from "../../util/common.js";
import { LRStates } from "../../types/lr_state.js";
import { Grammar, SymbolType } from "../../types/grammar.js";
import { ParserEnvironment } from "../../types/parser_environment.js";
import { generateCompactFunction } from "./generate_compact_function.js";

export function getValueID(e) {
    for (const { node: id } of traverse(e, "nodes")
        .bitFilter("type", JSNodeClass.IDENTIFIER)
    ) return id;
    return "";
}
export default function GenerateLRParseDataObject(states: LRStates, grammar: Grammar, env: ParserEnvironment) {
    //Build new env variables if they are missing 
    if (!grammar.bodies)
        filloutGrammar(grammar, env);

    const
        GEN_SYM_LU = <Map<string | number, number>>new Map(),
        types = Object.assign({}, t);

    //@ts-ignore
    types.any = 200;

    //@ts-ignore
    types.keyword = 201;

    let n = 0, sym_num_to_id = new Map();

    for (const a in types) {
        if (!sym_num_to_id.has(types[a]))
            sym_num_to_id.set(types[a], n++);

        GEN_SYM_LU.set(a, sym_num_to_id.get(types[a]));
    }

    GEN_SYM_LU.set("white_space_new_line", n++);
    GEN_SYM_LU.set("any", n++);
    GEN_SYM_LU.set("keyword", n++);

    //parse body function
    const
        COMPILE_FUNCTION = (env.options) ? !!env.options.integrate : false,
        functions = [];


    if (env.functions)
        for (const n in env.functions) {
            const funct = env.functions[n];
            if (COMPILE_FUNCTION || funct.INTEGRATE)
                funct.id = functions.push(`${generateCompactFunction(funct.toString())}`) - 1;
        }

    const
        error_handlers = [],
        SYMBOL_INDEX_OFFSET = ++n, //Must leave room for symbol types indices
        //Convert all terminals to indices and create lookup map for terminals

        SYM_LU = <Map<number | string, number>>new Map([
            ...[...GEN_SYM_LU.entries()].map(e => <[string | number, number]>[types[e[0]], e[1]]),
            ...[...grammar.meta.all_symbols.values()]
                .map((e, i) => (
                    <[string | number, number]>[
                        (e.type == SymbolType.GENERATED)
                            ? types[e[0]]
                            : e.val,
                        (e.type == SymbolType.GENERATED)
                            ? GEN_SYM_LU.get(e.val)
                            : i + SYMBOL_INDEX_OFFSET
                    ]
                )
                )
        ]),
        { state_functions, goto_map_lookup, state_str_functions, state_maps, goto_maps, fork_map } = createStateArrays(grammar, states, env, functions, SYM_LU, types);

    for (let i = 0; i < states.length; i++) {
        const production = grammar.bodies[states[i].body].production;
        if (production.error) {
            const funct = production.error;
            error_handlers.push(`${funct.toString().replace(/(anonymous)?[\n\t]*/g, "")}`);
        } else {
            error_handlers.push("e");
        }
    }

    const output = compressedTemplate(
        fork_map,
        goto_maps,
        state_maps,
        state_functions,
        SYM_LU,
        functions,
        state_str_functions,
        goto_map_lookup,
        GEN_SYM_LU,
        [...(grammar.meta.symbols || new Map).values()].map(e => e.val));

    return output;
}
