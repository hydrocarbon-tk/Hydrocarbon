import {
    exp, JSNodeType
} from "@candlelib/js";
import { GrammarObject } from "../../../types/grammar_nodes";
import { getPropertyFromExpression, getResolvedType, parseAsytripStruct } from './common.js';
import { ASYTRIPContext, ASYTRIPProperty, ASYTRIPType } from './types';

export function createAsytripContext(grammar: GrammarObject): ASYTRIPContext {

    let BYPASS_ASYTRIP = false;

    // Steps: 

    // Identify Struct and create frames for each struct type

    // For each struct define the potential object that can be 
    // bound to its properties. Types are:
    // - other structs
    // - vector of structs/tokens
    // - tokens
    // - strings
    // - doubles
    // 
    // Anything else will invalidate the asytrip syntax and fall back
    // to JavaScript evaluation
    try {


        const fn_map: Map<number, {
            args: ASYTRIPProperty[];
            struct: string;
        }> = new Map;

        const context: ASYTRIPContext = {
            structs: new Map(),
            type_names: new Set(),
            class_names: new Set(),
            class: new Map(),
            type: new Map(),
            initializers: [],
            fn_map: fn_map,
            return_types: new Map(),
            type_mask: 0,
            class_mask: 0,
            type_offset: 0
        };

        const return_types = context.return_types;

        if (BYPASS_ASYTRIP)
            throw new Error("ASYTRIP_BYPASS");

        for (const production of grammar.productions) {
            if (production.type == "scanner-production")
                continue;

            let return_type = [];


            for (const body of production.bodies) {

                const fn = body.reduce_function;

                if (fn) {

                    //@ts-ignore
                    if (fn.type == "env-function-reference") {
                        // TODO - Reference reduce function in CPP output
                        debugger;
                        continue;
                        //@ts-ignore
                    } else if (!fn.txt) {

                        body.reduce_function = null;

                        fn_map.set(body.id, {
                            args: [],
                            struct: ""
                        });

                        return_type.push({ type: ASYTRIPType.TOKEN });

                        continue;
                    }

                    const expression = exp(`${fn.txt.replace(/(\${1,2}\d+)/g, "$1")}`);

                    if (expression.type == JSNodeType.ObjectLiteral) {

                        const { name, args } = parseAsytripStruct(
                            body,
                            expression,
                            body.reduce_function.pos.token_slice(5),
                            context
                        );

                        fn_map.set(body.id, {
                            args: args,
                            struct: name
                        });

                        return_type.push({ type: ASYTRIPType.STRUCT, name: name });
                    } else {

                        const prop = getPropertyFromExpression(
                            body, expression, body.reduce_function.pos.token_slice(5),
                        );

                        fn_map.set(body.id, {
                            args: [prop],
                            struct: ""
                        });

                        return_type.push(...prop.types);
                    }

                } else {

                    fn_map.set(body.id, { args: [], struct: "" });

                    return_type.push({ type: ASYTRIPType.TOKEN });
                }
            }

            return_types.set(production.id, return_type.setFilter(fn => JSON.stringify(fn)));
            // Get the return types for each body. 
        }

        //Create type names
        const class_size = context.type_offset = context.class_names.size + 1;
        const class_mask = context.class_mask = ((1 << class_size) - 1);
        const type_mask = context.type_mask = (0xFFFFFFFF ^ class_mask) >>> 0;
        const class_lookup = context.class = new Map([...context.class_names.values()]
            .map((c, i) => [c, 1 << (i + 1)]));
        const type_lookup = context.type;

        let counter = 1;

        for (const [name, { classes }] of context.structs) {
            const type = ((counter++) << class_size) | [...classes].map(
                v => class_lookup.get(v)
            ).reduce((r, v) => r | v, 0);
            type_lookup.set(name, type);
        }

        // For each struct compile the properties into 
        // Sets of prop types
        for (const [name, struct] of context.structs) {

            for (const [name, prop] of struct.properties) {
                const t = (prop.types.flatMap(v => {
                    return v;
                    return getResolvedType(v, context);
                }));

                //Resolves production types
                struct.properties.get(name).types =
                    t.setFilter(fn => JSON.stringify(fn));
            }
        }

        context.type_mask = type_mask;
        context.class_mask = class_mask;

        return context;
    } catch (e) {
        // Asytrip failed, fall back to whatever mode is suitable
        // to correctly parse reduce expressions.
        console.log(e);
        return null;
    };
}
