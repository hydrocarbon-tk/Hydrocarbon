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
    InstructionType,
    IRReduce,
    IsAssertInstruction,
    IsPeekInstruction,
    ProductionFunction,
    stateIsBranch,
    Sym_Is_A_Production,
    Token,
    TokenType
} from '@hctoolkit/common';
import {
    CondenseTypes,
    getPropertyFromExpression,
    getResolvedType,
    JSONFilter,
    TypeIsNotNull,
    TypeIsNull,
    TypeIsNumber, TypeIsString,
    TypeIsStruct,
    TypeIsVector,
    TypeIsVectorPush,
    TypesAre, TypesInclude
} from './common.js';

export function createASYTripContext(
    grammar: GrammarObject,
    logger: Logger = Logger.get("ASYTrip").activate()
): ASYTRIPContext | null {

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
            class_groups: new Map,
            resolved_struct_types: new Map,
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

        let offset = 0;
        for (const production of grammar.productions) {

            if (production.type == "scanner-production")
                continue;

            //custom function


            for (const body of production.bodies) {

                const fn = <ProductionFunction>body.reduce_function;

                if (!(fn?.txt))
                    body.reduce_function = undefined;


                const expr = fn?.txt ? exp(`${fn.txt.replace(/(\${1,2}\d+)/g, "$1")}`) : null;

                offset++;

                fns.push({
                    production_id: production.id,
                    body,
                    tok: body?.reduce_function?.tok ?
                        Token.from(body?.reduce_function?.tok).token_slice(5)
                        : new Token("", 0, 0, 0),
                    fn: expr,
                    source: renderWithFormatting(<any>expr)
                });
            }


            // Get the return types for each body. 
        }
        {
            function addIRFN(instr: IRReduce) {

                const fn = <ProductionFunction>instr.reduce_fn;
                const body = {
                    sym: [],
                    id: offset++,
                };

                const expr = fn?.txt ? exp(`${fn.txt.replace(/(\${1,2}\d+)/g, "$1")}`) : null;
                if (typeof instr.reduce_fn == "object") {
                    fns.push({
                        production_id: -1,
                        body,
                        tok: Token.from(instr?.tok ?? instr.pos),
                        fn: expr,
                        source: renderWithFormatting(<any>expr)
                    });
                }
            }

            // Process user authored IR states. 
            for (const ir_state of grammar?.ir_states || []) {
                if (stateIsBranch(ir_state)) {
                    for (const branch of ir_state.instructions) {
                        if (IsPeekInstruction(branch) || IsAssertInstruction(branch)) {
                            for (const instr of branch.instructions) {
                                if (instr.type == InstructionType.reduce) {
                                    if (typeof instr.reduce_fn == "object") {
                                        addIRFN(instr);
                                    }
                                }
                            }
                        }
                    }
                } else {
                    for (const instr of ir_state.instructions) {
                        if (instr.type == InstructionType.reduce) {
                            if (typeof instr.reduce_fn == "object") {
                                addIRFN(instr);
                            }
                        }
                    }
                }
            }
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



                return_type.push(...prop.initializers);

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
            const temp = CondenseTypes(types.slice());
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


        for (const [id, types] of context.return_types) {

            let intermediate_types = [];

            for (const type of types)
                intermediate_types.push(...getResolvedType(type, context));

            const resolved_types
                = mergeVectorTypes(CondenseTypes(intermediate_types));

            for (const r of resolved_types.filter(TypeIsVector)) {
                if (r.types.some(TypeIsVector)) {

                    console.dir(resolved_types, { depth: 8 });


                    console.dir(types, { depth: 8 });
                    console.dir(types.map(t => getResolvedType(t, context)), { depth: 8 });

                    throw new Error("Invalid nested vectors 0");
                }
            }

            context.resolved_return_types.set(id, CondenseTypes(resolved_types));
        }

        // For each struct compile the properties into 
        // Sets of prop types
        /* for (const [prop_name, struct] of context.structs) {
            for (const [name, prop] of struct.properties) {

                const types = (prop.types.flatMap(v => {
                    return v;
                    return getResolvedType(v, context);
                })).setFilter(JSONFilter);

                //Resolves production types
                struct.properties.get(name).types = types;
            }
        } */

        for (const [struct_name, struct] of context.structs) {

            for (const [name, prop] of struct.properties) {

                const types = (CondenseTypes(prop.initializers));

                let intermediate_types = [];

                for (const type of types) {
                    intermediate_types.push(...getResolvedType(type, context));
                }

                const resolved_types
                    = mergeVectorTypes(CondenseTypes(intermediate_types));

                //Resolves production types
                //@ts-ignore
                struct.properties.get(name).initializers = types;
                //@ts-ignore
                struct.properties.get(name).resolved_types = resolved_types;

                //Assert types are valid:
                // For simplicities sake, ensure properties 
                // are one of Struct Type | Vector<Struct Type> | Other
                //
                // Do not allow mixing of Structs|Vector<Struct> and other types.

                const productions: ASYTRIPTypeObj[ASYTRIPType.PRODUCTION][] = [];

                const real_types = types.flatMap(
                    t => getResolvedType(t, context, new Set([struct.name]), productions)
                ).filter(TypeIsNotNull);

                if (TypesInclude(resolved_types, TypeIsStruct)
                    &&
                    resolved_types.some(t => !(TypeIsNull(t) || TypeIsStruct(t)))
                ) {

                    const non_struct_types = real_types.filter(t => !(TypeIsNull(t) || TypeIsStruct(t)));

                    const message = [
                        `
Invalid property <${name}> of struct <${struct_name}>

Properties of type struct must not be assigned to any other value type.`];

                    for (const nvt of non_struct_types) {
                        let body = grammar.bodies[0];

                        if (nvt.body)
                            body = grammar.bodies[nvt.body[0]];
                        let tok_ = body?.tok ?? body?.pos;

                        if (body && tok_ && body.production !== undefined) {

                            const tok = Token.from(tok_);

                            message.push(tok.createError(
                                `\nProduction ${body.production.name}[${body.production.bodies.indexOf(body)}]:`
                            ).message,
                                `
produces non-struct types [ ${[nvt].map(t => {
                                    if (TypeIsVector(t)) {
                                        return `${ASYTRIPType[t.type]}<${t.types.map(t => ASYTRIPType[t.type]).setFilter(JSONFilter).join(" | ")}>`;
                                    }
                                    else return ASYTRIPType[t.type];
                                }).join(" | ")} ]`
                            );
                        } else {
                            message.push(`\nType ${ASYTRIPType[nvt.type]} is generated`);
                        }
                    }

                    errors.push(["0x014", message.join("")]);

                } else if (TypesInclude(resolved_types, TypeIsVector)) {

                    const vector_types = resolved_types.filter(TypeIsVector);
                    const vector_types_types = vector_types.flatMap(v => v.types).filter(TypeIsNotNull);
                    const non_vector_types = resolved_types.filter(v => !TypeIsVector(v) && !TypeIsVectorPush(v)).filter(TypeIsNotNull);

                    if (non_vector_types.length > 0) {


                        const message = [
                            `
Invalid property <${name}> of struct <${struct_name}>

Properties of type Vector must not be assigned to any other value type.`];

                        for (const type of prop.initializers) {

                            const [b] = type.body;
                            const r_types = getResolvedType(type, context).filter(t => !TypeIsVector(t)).filter(TypeIsNotNull);

                            if (r_types.length > 0) {

                                const body = grammar.bodies[b];

                                let tok_ = body?.tok ?? body?.pos;

                                if (body && tok_ && body.production !== undefined) {

                                    const tok = Token.from(tok_);

                                    message.push(tok.createError(
                                        `\nProduction ${body.production.name}[${body.production.bodies.indexOf(body)}]:`
                                    ).message,
                                        `
    produces non-vector types [ ${r_types.map(t => {
                                            if (TypeIsVector(t)) {
                                                return `${ASYTRIPType[t.type]}<${t.types.map(t => ASYTRIPType[t.type]).setFilter(JSONFilter).join(" | ")}>`;
                                            }
                                            else return ASYTRIPType[t.type];
                                        }).join(" | ")} ]`
                                    );
                                } else {
                                    for (const nvt of r_types)
                                        message.push(`\nType ${ASYTRIPType[nvt.type]} is generated`);
                                }
                            }
                        }

                        errors.push(["0x014", message.join("")]);
                    } else if (TypesInclude(vector_types_types, TypeIsStruct)) {

                        if (!TypesAre(vector_types_types, TypeIsStruct)) {
                            const non_vector_types = vector_types_types.filter(v => !TypeIsStruct(v));

                            const message = [
                                `
Invalid vector property <${name}> of struct <${struct_name}>
        
Vector<Struct> properties that can contain struct types MUST NOT contain
types that are not structs. This is not the case with ${struct_name}.${name}:`];
                            for (const nvt of non_vector_types) {
                                let body = grammar.bodies[0];
                                if (nvt.body)
                                    body = grammar.bodies[nvt.body[0]];

                                let tok = body.tok ?? body.pos;

                                if (body && tok && body.production !== undefined) {

                                    tok = Token.from(tok);

                                    message.push(tok.createError(
                                        `\nProduction ${body.production.name}[${body.production.bodies.indexOf(body)}]:`
                                    ).message,
                                        `produces non-struct types [ ${[nvt].map(t => {
                                            if (TypeIsVector(t)) {
                                                return `${ASYTRIPType[t.type]}<${t.types.map(t => ASYTRIPType[t.type]).setFilter(JSONFilter).join(" | ")}>`;
                                            }
                                            else return ASYTRIPType[t.type];
                                        }).join(" | ")} ] that prevents ${struct_name}.${name} from being a Vector that only contains structs`
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
    let rest = r_types.filter(t => !TypeIsVector(t));

    if (vectors.length > 0) {

        const vector = <ASYTRIPTypeObj[ASYTRIPType.VECTOR]>{
            type: ASYTRIPType.VECTOR,
            args: [],
            types: [],
            arg_pos: undefined,
            body: []
        };

        for (const v of vectors) {
            for (const type of v.types) {
                if (type.type == ASYTRIPType.PRODUCTION)
                    throw new Error("Have production at resolved point");
                if (TypeIsVector(type))
                    vectors.push(type);
                else
                    vector.types.push(type);
            }
        }

        vector.types = CondenseTypes(vector.types.filter(TypeIsNotNull));

        rest.push(vector);
    }

    if (
        rest.length == 2
        &&
        rest.every(t =>
            TypeIsNull(t)
            ||
            TypeIsVector(t)
            ||
            TypeIsString(t)
            ||
            TypeIsNumber(t)
        )
    ) rest = rest.filter(TypeIsNotNull);

    return rest;
}

