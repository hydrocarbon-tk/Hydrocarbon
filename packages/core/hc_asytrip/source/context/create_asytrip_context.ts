/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import {
    exp,
    JSNode,
    JSNodeType,
    renderWithFormatting
} from "@candlelib/js";
import { Logger } from '@candlelib/log';
import {
    ASYTRIPContext,
    ASYTRIPProperty,
    ASYTRIPType,
    ASYTRIPTypeObj,
    GrammarObject,
    HCG3ProductionBody,
    ProductionFunction,
    Sym_Is_A_Production,
    Token,
    TokenType
} from '@hctoolkit/common';
import { render_grammar } from '@hctoolkit/grammar';
import {
    getPropertyFromExpression,
    getResolvedType,
    JSONFilter,
    TypeIsNotNull,
    TypeIsStruct,
    TypeIsVector,
    TypesAre,
    TypesInclude
} from './common.js';

export function createASYTripContext(
    grammar: GrammarObject,
    logger: Logger = Logger.get("ASYTrip").activate()
): ASYTRIPContext {

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

    const errors = [];
    try {


        const fn_map: Map<number, {
            args: ASYTRIPProperty[];
            length: number;
            struct: string;
            source: string;
        }> = new Map;

        const context: ASYTRIPContext = {
            class_groups: null,
            resolved_struct_types: null,
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
            source: string,
        }[] = [];

        for (const production of grammar.productions) {

            if (production.type == "scanner-production")
                continue;


            for (const body of production.bodies) {

                const fn = <ProductionFunction>body.reduce_function;

                if (!(fn?.txt)) {
                    body.reduce_function = null;
                }

                const expr = fn?.txt ? exp(`${fn.txt.replace(/(\${1,2}\d+)/g, "$1")}`) : null;

                fns.push({
                    production_id: production.id,
                    body,
                    tok: Token.from(body?.reduce_function?.pos).token_slice(5) ?? new Token("", 0, 0, 0),
                    fn: expr,
                    source: renderWithFormatting(expr)
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


        for (const { fn, production_id, body, tok, source } of fns) {

            const return_type = [];

            if (fn) {

                const prop = getPropertyFromExpression(
                    body, <any>fn, tok, context
                );

                fn_map.set(body.id, {
                    args: [prop],
                    length: body.sym.length,
                    struct: "",
                    source: source
                });



                return_type.push(...prop.types);

            } else {

                fn_map.set(body.id, { args: [], length: body.sym.length, struct: "", source });

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

        // Struct types start iterating after the highest non-struct type val
        let counter = TokenType + 1;

        /**
         * Set type ids for all nodes
         */
        for (const [name, { classes }] of context.structs) {

            const type = ((counter++) << class_size)
                | ([...classes].map(
                    v => <number>class_lookup.get(v)
                ).reduce((r, v) => r | v, 0));

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

            let intermediate_types = [];

            for (const type of types) {
                intermediate_types.push(...getResolvedType(type, context));
            }

            const resolved_types
                = mergeVectorTypes(intermediate_types.setFilter(JSONFilter));

            context.resolved_return_types.set(id, resolved_types.setFilter(JSONFilter));
        }

        for (const [s_name, struct] of context.structs) {

            struct.type = context.type.get(s_name);

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
                        `
Invalid Struct property <${name}> of struct <${s_name}>

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
                            `Production ${production.name}: 
-------------------------- 
${render_grammar(production)} 
-------------------------- 
 assigned to reference ${args.tok.slice()} produces non-Vector<Struct> types [ Vector<${bad_types.map(t => {
                                if (TypeIsVector(t)) {
                                    return `${ASYTRIPType[t.type]}<${t.types.map(t => ASYTRIPType[t.type]).setFilter(JSONFilter).join(" | ")}>`;
                                }
                                else return ASYTRIPType[t.type];
                            }).join(" | ")
                            }> ]`
                        ).message);
                    }

                    errors.push(["0x014", message.join("")]);

                } else if (TypesInclude(real_types, TypeIsVector)) {

                    const vector_types = real_types.filter(TypeIsVector);
                    const non_vector_types = real_types.filter(v => !TypeIsVector(v));

                    if (non_vector_types.length > 0) {
                        debugger;
                    } else if (vector_types.some(v => TypesInclude(v.types, TypeIsStruct))) {

                        if (vector_types.some(v => !TypesAre(v.types, TypeIsStruct))) {
                            const non_vector_types = vector_types.flatMap(v => v.types).filter(v => !TypeIsStruct(v));
                            const message = [
                                `
Invalid Vector<Struct> property <${name}> of struct <${s_name}>
        
Vector<Struct> properties that can contain struct types MUST NOT contain
types that are not structs. This is not the case with ${s_name}.${name}:`];
                            for (const nvt of non_vector_types) {
                                let body = grammar.bodies[0];
                                if (nvt.body)
                                    body = grammar.bodies[nvt.body[0]];

                                if (body) {
                                    message.push(body.pos.createError(
                                        `\nProduction ${body.production.name}[${body.production.bodies.indexOf(body)}]:`
                                    ).message,
                                        `
produces non-struct types [ ${[nvt].map(t => {
                                            if (TypeIsVector(t)) {
                                                return `${ASYTRIPType[t.type]}<${t.types.map(t => ASYTRIPType[t.type]).setFilter(JSONFilter).join(" | ")}>`;
                                            }
                                            else return ASYTRIPType[t.type];
                                        }).join(" | ")} ] that prevents ${s_name}.${name} from being a Vector that only contains structs`
                                    );
                                }
                            }

                            errors.push(["0x015", message.join("")]);
                        }
                    }
                }
            }
        }

        context.type_mask = type_mask;
        context.class_mask = class_mask;
        context.resolved_struct_types = new Map();
        context.class_groups = [...context.structs].groupMap(([, s]) => [...s.classes]);



        if (errors.length > 0)
            throw errors;

        return context;
    } catch (e) {
        if (Array.isArray(e))
            for (const [code, message] of e) {
                logger.get(`[${code}]`).error(message);
            }

        else
            logger.error(e);
        // Asytrip failed, fall back to whatever mode is suitable
        // to correctly parse reduce expressions.

        logger.warn("Unable to compile ASYTrip context\n");
        return null;
    };
}
function mergeVectorTypes(r_types: any[]) {
    const vectors = r_types.filter(TypeIsVector);
    const rest = r_types.filter(t => !TypeIsVector(t));

    if (vectors.length > 0) {


        const vector = vectors.reduce((r, t) => {
            r.types.push(...t.types);
            return r;
        }, <ASYTRIPTypeObj[ASYTRIPType.VECTOR]>{
            type: ASYTRIPType.VECTOR,
            args: [],
            types: [],
            arg_pos: undefined
        });

        vector.types = vector.types.filter(TypeIsNotNull).setFilter(JSONFilter);

        rest.push(vector);
    }
    return rest;
}

