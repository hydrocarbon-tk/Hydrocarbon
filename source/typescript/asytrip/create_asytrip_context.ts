import {
    exp, JSNodeType
} from "@candlelib/js";
import { GrammarObject, HCG3ProductionBody, ProductionFunction } from "../types/grammar_nodes";
import { Sym_Is_A_Production } from '../grammar/nodes/symbol.js';
import { getPropertyFromExpression, getResolvedType, JSONFilter, parseAsytripStruct, TypeIsVector } from './common.js';
import { ASYTRIPContext, ASYTRIPProperty, ASYTRIPType } from './types.js';
import { Token } from '../runtime/token.js';

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
            resolved_return_types: new Map(),
            type_mask: 0,
            class_mask: 0,
            type_offset: 0
        };

        const return_types = context.return_types;

        if (BYPASS_ASYTRIP)
            throw new Error("ASYTRIP_BYPASS");

        const fns: {
            body: HCG3ProductionBody;
            fn: JSNode | null,
            production_id: number,
            tok: Token;
        }[] = [];

        for (const production of grammar.productions) {

            if (production.type == "scanner-production")
                continue;


            for (const body of production.bodies) {

                const fn = <ProductionFunction>body.reduce_function;

                if (!(fn?.txt)) {
                    body.reduce_function = null;
                }

                fns.push({
                    production_id: production.id,
                    body,
                    tok: body?.reduce_function?.pos.token_slice(5) ?? new Token("", 0, 0, 0),
                    fn: fn?.txt ? exp(`${fn.txt.replace(/(\${1,2}\d+)/g, "$1")}`) : null
                });
            }
            // Get the return types for each body. 
        }

        fns.sort((a, b) => {
            let valA = 0, valB = 0;
            if (a.fn) {
                if (a.fn.type == JSNodeType.ObjectLiteral)
                    valA = 2;
                else
                    valA = 1;
            }
            if (b.fn) {
                if (b.fn.type == JSNodeType.ObjectLiteral)
                    valB = 2;
                else
                    valB = 1;
            }

            return valB - valA;
        });


        for (const { fn, production_id, body, tok } of fns) {

            const return_type = [];

            if (fn) {

                if (fn.type == JSNodeType.ObjectLiteral) {

                    const { name, args } = parseAsytripStruct(
                        body,
                        fn,
                        tok,
                        context
                    );

                    fn_map.set(body.id, {
                        args: args,
                        struct: name
                    });

                    return_type.push({ type: ASYTRIPType.STRUCT, name: name });
                } else {

                    const prop = getPropertyFromExpression(
                        body, fn, tok,
                    );

                    fn_map.set(body.id, {
                        args: [prop],
                        struct: ""
                    });

                    return_type.push(...prop.types);
                }
            } else {

                fn_map.set(body.id, { args: [], struct: "" });

                //get last symbol
                const sym = body.sym.slice(-1)[0];

                if (Sym_Is_A_Production(sym)) {
                    return_type.push({ type: ASYTRIPType.PRODUCTION, val: sym.val, arg_pos: body.sym.length - 1 });
                } else {
                    return_type.push({ type: ASYTRIPType.TOKEN, arg_pos: body.sym.length - 1 });
                }
            }

            if (!return_types.has(production_id)) {
                return_types.set(production_id, []);
            }

            return_types.get(production_id).push(...return_type);
        }

        for (const [, types] of return_types) {
            const temp = types.slice().setFilter(JSONFilter);
            types.length = 0;
            types.push(...temp);
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
                const types = (prop.types.flatMap(v => {
                    return v;
                    return getResolvedType(v, context);
                })).setFilter(fn => JSON.stringify(fn));

                //Resolves production types
                struct.properties.get(name).types = types;
            }
        }

        for (const [id, types] of context.return_types) {


            context.resolved_return_types.set(id,
                types
                    .flatMap(t => getResolvedType(t, context))
                    .setFilter(t => JSON.stringify(t))
            );
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
