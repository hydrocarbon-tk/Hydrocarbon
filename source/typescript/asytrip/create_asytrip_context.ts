import {
    exp, JSNodeType
} from "@candlelib/js";
import { Sym_Is_A_Production } from '../grammar/nodes/symbol.js';
import { render_grammar } from '../grammar/passes/common.js';
import { Token } from '../runtime/token.js';
import { GrammarObject, HCG3ProductionBody, ProductionFunction } from "../types/grammar_nodes";
import { getPropertyFromExpression, getResolvedType, JSONFilter, parseAsytripStruct, TypeIsNotNull, TypeIsStruct, TypeIsVector, TypesAre, TypesInclude } from './common.js';
import { ASYTRIPContext, ASYTRIPProperty, ASYTRIPType, ASYTRIPTypeObj } from './types.js';

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
            length: number;
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

                console.log(render_grammar(body));

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
                        length: body.sym.length,
                        struct: name
                    });

                    return_type.push({ type: ASYTRIPType.STRUCT, name: name });
                } else {

                    const prop = getPropertyFromExpression(
                        body, fn, tok,
                    );

                    fn_map.set(body.id, {
                        args: [prop],
                        length: body.sym.length,
                        struct: ""
                    });

                    return_type.push(...prop.types);
                }
            } else {

                fn_map.set(body.id, { args: [], length: body.sym.length, struct: "" });

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
        /**
         * Set type ids for all nodes
         */
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

        for (const [s_name, struct] of context.structs) {
            for (const [name, prop] of struct.properties) {

                // For simplicities sake, ensure properties 
                // are one of Struct Type | Vector<Struct Type> | Other
                //
                // Do not allow mixing of Structs|Vector<Struct> and other types.
                const productions: ASYTRIPTypeObj[ASYTRIPType.PRODUCTION][] = [];
                const real_types = prop.types.flatMap(
                    t => getResolvedType(t, context, new Set([struct.name]), productions)
                )
                    .filter(TypeIsNotNull);

                if (TypesInclude(real_types, TypeIsStruct)
                    && !TypesAre(real_types, TypeIsStruct)
                ) {

                    const message = [
                        `Invalid property ${name} of struct ${s_name}:

Struct properties that can be assigned to struct types 
MUST only be assigned to Struct types or Null. 
This is not the case with ${s_name}~${name}`];

                    for (const args of productions) {
                        const production = grammar.productions[args.val];
                        const types = context.resolved_return_types.get(production.id);
                        const bad_types = types.filter(t => !TypeIsStruct(t)).setFilter(JSONFilter);

                        if (bad_types.length == 0)
                            continue;

                        message.push(args.tok.createError(
                            `Production ${production.name}: \n--------------------------\n ${render_grammar(production)} \n--------------------------\n  assigned to reference ${args.tok.slice()} produces non Struct types [ ${bad_types.map(t => {
                                if (TypeIsVector(t)) {
                                    return `${ASYTRIPType[t.type]}<${t.types.map(t => ASYTRIPType[t.type]).setFilter(JSONFilter).join(" | ")}>`;
                                }
                                else return ASYTRIPType[t.type];
                            }).join(" | ")
                            } ]`
                        ).message);
                    }

                    const invalid = real_types.filter(t => !TypeIsStruct(t));
                    const valid = real_types.filter(TypeIsStruct);

                    throw new Error(message.join("\n") + "\n\n");

                    debugger;
                } else if (TypesInclude(real_types, TypeIsVector)) {

                    const vector_types = real_types.filter(TypeIsVector);
                    const non_vector_types = real_types.filter(v => !TypeIsVector(v));
                    if (non_vector_types.length > 0) {
                        debugger;
                    } else if (vector_types.some(v => TypesInclude(v.types, TypeIsStruct))) {

                        if (vector_types.some(v => !TypesAre(v.types, TypeIsStruct))
                            || non_vector_types.length > 0
                        ) {
                            debugger;
                        }
                    }
                }
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
