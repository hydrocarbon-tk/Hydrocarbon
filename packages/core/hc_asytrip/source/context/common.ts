/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { traverse } from "@candlelib/conflagrate";
import {
    exp,
    JSBindingProperty,
    JSIdentifierProperty,
    JSNode,
    JSNodeClass,
    JSNodeType,
    JSObjectLiteral,
    JSRightHandExpressionClass,
    renderCompressed
} from "@candlelib/js";
import {
    ASYTRIPContext,
    ASYTRIPProperty,
    ASYTRIPStruct,
    ASYTRIPType,
    ASYType,
    HCG3ProductionBody,
    HCG3Symbol,
    ProductionSymbol,
    Sym_Is_A_Production,
    Token
} from '@hctoolkit/common';

export function parseAsytripStruct(
    body: HCG3ProductionBody,
    expr: JSObjectLiteral,
    tok: Token,
    context: ASYTRIPContext): {
        name: string;
        args: ASYTRIPProperty[];
    } {
    let type_name = "", classes: Set<string> = new Set, properties: Map<string, ASYTRIPProperty> = new Map();

    const sub_expressions = expr.nodes;

    for (let sub_expr of <(JSBindingProperty | JSIdentifierProperty)[]>sub_expressions) {

        let eval_node = sub_expr;

        if (sub_expr.type == (JSNodeType.IdentifierName | JSNodeClass.PROPERTY_NAME)) {
            const val: string = (<any>sub_expr).value;
            if (val == "tok") {
                eval_node = <any>exp(`{tok:tok}`).nodes[0];
            } else if (val.slice(0, 2) == "t_") {
                eval_node = <any>exp(`{_type_:${val}}`).nodes[0];
            } else if (val.slice(0, 2) == "c_") {
                eval_node = <any>exp(`{_type_:${val}}`).nodes[0];
            } else if (val[0] == "$" && val.slice(1).match(/\w+$/)) {
                const prop = val.slice(1);
                if (prop !== "_type_")
                    eval_node = <any>exp(`{${prop}:${val}}`).nodes[0];
            }
        }

        if (eval_node.type == JSNodeType.PropertyBinding) {

            const [id, val] = eval_node.nodes;

            if (id.type != (JSNodeType.IdentifierName | JSNodeClass.PROPERTY_NAME))
                throwAsytripTokenError(tok, id, "ASYTRIP_Invalid_Struct_Property_Identifier");

            const name = (<any>id).value;

            if (name == "_type_") {
                // Special handler that expects values of the form:
                // type_****** | class_*******
                type_name = extractTypeInfo(val, tok, context, classes, type_name, expr);

                continue;
            } else {
                //Create a property 
                extractPropInfo(context, body, name, tok, val, properties);

                continue;
            }
        }

        throwAsytripTokenError(tok, sub_expr, "ASYTRIP_Invalid_Struct_Property");
    }

    if (!type_name)
        throwAsytripTokenError(tok, expr, "ASYTRIP_Struct_No_Type_Name");

    if (context.structs.has(type_name)) {

        const struct = context.structs.get(type_name);

        if (struct) {

            for (const _class of classes)
                struct.classes.add(_class);

            for (const [name, prop] of struct.properties) {
                if (properties.has(name))
                    //@ts-ignore
                    mergeNewTypesIntoProp(prop, properties.get(name)?.initializers ?? []);
                else
                    prop.initializers.push({ type: ASYTRIPType.NULL, body: [body.id] });
            }

            for (const [name, prop] of properties) {
                if (!struct.properties.has(name)) {
                    struct.properties.set(name, prop);
                    prop.initializers.push({ type: ASYTRIPType.NULL, body: [body.id] });
                }
            }
        }
    } else {

        const struct = <ASYTRIPStruct>{
            type: ASYTRIPType.STRUCT,
            name: type_name,
            classes: classes,
            properties: properties,
        };

        context.structs.set(type_name, struct);
    }

    return { name: type_name, args: [...properties.values()] };
}
/**
 * Merges an array of ASTType object into the types field of a ASYTRIPType.STRUCT_TYPE 
 * object. 
 * 
 * All vector types are merged into one vector type object.
 */
function mergeNewTypesIntoProp(prop: ASYTRIPProperty, new_types: ASYType[]) {
    const types = CondenseTypes([...prop.initializers, ...new_types]);

    const vectors = types.filter(TypeIsVector);
    const rest = types.filter(t => !TypeIsVector(t));

    const vector_types = CondenseTypes([
        ...vectors.flatMap(v => v.types),
        ...vectors.flatMap(v => v.args)
    ]);
    vectors.forEach(v => v.types = vector_types);

    prop.initializers = [...rest, ...vectors];
}

export function JSONFilter(v: any) {
    return JSON.stringify(Object.assign({}, v, { body: [] }));
}

function extractPropInfo(
    context: ASYTRIPContext,
    body: HCG3ProductionBody,
    name: any,
    source: Token,
    val: JSRightHandExpressionClass,
    properties: Map<string, ASYTRIPProperty>
) {

    const property: ASYTRIPProperty = getPropertyFromExpression(
        body,
        val,
        source,
        context
    );

    property.name = name;
    // Can be: STRING, Reference, Double, or a simple expression 
    // comprised of a set of those values;
    // 
    properties.set(name, property);
}
export function getPropertyFromExpression(
    body: HCG3ProductionBody,
    node: JSRightHandExpressionClass,
    tok: Token,
    context: ASYTRIPContext
): ASYTRIPProperty {

    const prop: ASYTRIPProperty = {
        name: "",
        node: node,
        source: tok,
        initializers: [],
        resolved_types: []
    };

    const out_type = parseExpression(
        body,
        node,
        tok,
        context
    );

    prop.initializers = [out_type];

    return prop;
}


function parseExpression(
    body: HCG3ProductionBody,
    node: any,
    tok: Token,
    context: ASYTRIPContext,
): ASYType {
    if (node.type == JSNodeType.ObjectLiteral) {
        const {
            name,
            args
        } = parseAsytripStruct(body, node, tok, context);

        return { type: ASYTRIPType.STRUCT, name: name, args: args, body: [body.id] };

    } else if (node.type == JSNodeType.ExpressionList) {
        const expressions = [];
        for (const expr of node.nodes) {
            expressions.push(parseExpression(body, expr, tok, context));
        }

        return {
            type: ASYTRIPType.EXPRESSIONS, expressions: expressions, body: [body.id]
        };

    } else if (node.type == JSNodeType.IdentifierReference) {

        let ref = node.value;
        if (ref == "tok") {
            return { type: ASYTRIPType.TOKEN, arg_pos: -1, body: [body.id] };
        } else if (ref.slice(0, 2) == "t_") {
            return { type: ASYTRIPType.STRUCT_CLASSIFICATION, vals: [{ type: ASYTRIPType.STRUCT_TYPE, val: ref.slice(2), body: [body.id] }], body: [body.id] };
        } else if (ref.slice(0, 2) == "c_") {

            return { type: ASYTRIPType.STRUCT_CLASSIFICATION, vals: [{ type: ASYTRIPType.STRUCT_CLASS, val: ref.slice(2), body: [body.id] }], body: [body.id] };
        } else if (ref[0] == "$" && ref[1] != "$") {
            const syms = body.sym;
            ref = ref.slice(1);
            let sym = null;
            let index = parseInt(ref) - 1;

            if (ref == "__last__") {
                return createArgReference(node, syms[syms.length - 1], syms.length - 1, tok, body);
            } else if (ref == "__first__") {
                return createArgReference(node, syms[0], 0, tok, body);
            } else if (!isNaN(index)) {
                if (syms[index])
                    return createArgReference(node, syms[index], index, tok, body);
            } else {

                let candidate_prod_sym: { sym: ProductionSymbol, index: number; } | null = null;

                for (let i = 0; i < syms.length; i++) {
                    sym = syms[i];
                    if (sym.annotation && sym.annotation == ref) {
                        return createArgReference(node, sym, i, tok, body);
                    } else if (!candidate_prod_sym && Sym_Is_A_Production(sym) && sym.name == ref) {
                        candidate_prod_sym = { sym, index: i };
                    }
                }

                if (candidate_prod_sym)
                    return createArgReference(node, candidate_prod_sym.sym, candidate_prod_sym.index, tok, body);
            }

            return <ASYType<ASYTRIPType.NULL>>{ type: ASYTRIPType.NULL };

            // If referred to value exists then we can lookup the symbol type
            // and: 
            //     a) If production lookup return types for production and push them to property types
            //     b) If type is a symbol: it's either a vector or a token
        } else {
            throwAsytripTokenError(tok, node, "ASYTRIP_Invalid_Struct_Property_Value" + renderCompressed(node));
        }
    } else if (node.type == JSNodeType.AdditiveExpression) {

        const [left, right] = node.nodes;

        const left_val = parseExpression(body, left, tok, context);

        const right_val = parseExpression(body, right, tok, context);

        if (
            TypeIsVector(left_val)
            ||
            TypeIsVector(right_val)
            ||
            TypeIsVectorPush(left_val)
            ||
            TypeIsVectorPush(right_val)
        ) {
            if (TypeIsVector(left_val) || TypeIsVectorPush(left_val)) {
                return {
                    type: ASYTRIPType.VECTOR_PUSH,
                    PREPEND: false,
                    vector: left_val,
                    args: [right_val],
                    body: [body.id]
                };
            };

            if (TypeIsVector(right_val) || TypeIsVectorPush(right_val)) return {
                type: ASYTRIPType.VECTOR_PUSH,
                PREPEND: true,
                vector: right_val,
                args: [left_val],
                body: [body.id]
            };

        } else if (TypeIsString(left_val) && !left_val.val)
            return {
                type: ASYTRIPType.CONVERT_STRING,
                value: right_val,
                body: [body.id]
            };

        if (TypeIsString(right_val) && !right_val.val)
            return {
                type: ASYTRIPType.CONVERT_STRING,
                value: left_val,
                body: [body.id]
            };


        return {
            type: node.symbol == "+" ? ASYTRIPType.ADD : ASYTRIPType.SUB,
            left: left_val,
            right: right_val,
            body: []
        };
    } else if (node.type == JSNodeType.ConditionalExpression) {
        const [assert, left, right] = node.nodes;
        const assertion = parseExpression(body, assert, tok, context);
        const left_val = parseExpression(body, left, tok, context);
        const right_val = parseExpression(body, right, tok, context);
        return <ASYType<ASYTRIPType.TERNARY>>{
            type: ASYTRIPType.TERNARY,
            assertion,
            left: left_val,
            right: right_val, body: [body.id]
        };
    } else if (node.type == JSNodeType.LogicalExpression) {
        if (node.symbol == "||") {
            const [left, right] = node.nodes;
            const left_val = parseExpression(body, left, tok, context);
            const right_val = parseExpression(body, right, tok, context);

            return {
                type: ASYTRIPType.OR,
                left: left_val,
                right: right_val, body: [body.id]
            };
        }
    } else if (node.type == JSNodeType.BitwiseExpression) {
        let vals = [];

        for (const type of [
            parseExpression(body, node.nodes[0], tok, context),
            parseExpression(body, node.nodes[1], tok, context)
        ]) {
            if (TypeIsClassification(type)) {
                vals.push(...type.vals);
            } else {
                throwAsytripTokenError(tok, node, "ASYTRIP_Invalid_Use_Of_Struct_Classification_Union");
            }
        }

        return { type: ASYTRIPType.STRUCT_CLASSIFICATION, vals, body: [] };

    } else if (node.type == JSNodeType.EqualityExpression) {
        const [left, right] = node.nodes;
        const left_val = parseExpression(body, left, tok, context);
        const right_val = parseExpression(body, right, tok, context);

        if (node.symbol == "==")
            return {
                type: ASYTRIPType.EQUALS,
                left: left_val,
                right: right_val, body: [body.id]
            };
    } else if (node.type == JSNodeType.Parenthesized) {
        return parseExpression(body, <any>node.nodes[0], tok, context);
    } else if (node.type == JSNodeType.NullLiteral) {
        return <ASYType<ASYTRIPType.NULL>>{
            type: ASYTRIPType.NULL
        };
    } else if (node.type == JSNodeType.StringLiteral) {

        return { type: ASYTRIPType.STRING, val: node.value, body: [body.id] };

    } else if (node.type == JSNodeType.NumericLiteral) {

        return { type: ASYTRIPType.F64, val: node.value, body: [body.id] };

    } else if (node.type == JSNodeType.BooleanLiteral) {

        return { type: ASYTRIPType.BOOL, val: (node.value + "") == "true", body: [body.id] };

    } else if (node.type == JSNodeType.ArrayLiteral) {
        const members = node.nodes.map((n: any) => parseExpression(body, n, tok, context));

        const args = members.filter(TypeIsNotClassification);

        return { type: ASYTRIPType.VECTOR, args: args, types: members, arg_pos: undefined, body: [body.id] };

    } else if (node.type == JSNodeType.MemberExpression) {

        const [ref, prop] = node.nodes;

        if (
            prop.type == (JSNodeType.IdentifierName | JSNodeClass.PROPERTY_NAME)
            &&
            (ref.type == JSNodeType.IdentifierReference && ref.value[0] == "$")
        ) {
            const struct = parseExpression(body, ref, tok, context);
            const property = prop.value;

            return <ASYType<ASYTRIPType.STRUCT_PROP_REF>>{
                type: ASYTRIPType.STRUCT_PROP_REF,
                struct,
                property,
                body: [body.id]
            };

        }

    } else if (node.type == JSNodeType.AssignmentExpression) {

        const [id, args] = node.nodes;

        if (id.type == JSNodeType.MemberExpression) {
            const [ref, prop] = id.nodes;
            if (
                prop.type == (JSNodeType.IdentifierName | JSNodeClass.PROPERTY_NAME)
                &&
                (ref.type == JSNodeType.IdentifierReference && ref.value[0] == "$")
            ) {
                const struct = parseExpression(body, ref, tok, context);
                const property = prop.value;
                const value = parseExpression(body, args, tok, context);

                return <ASYType<ASYTRIPType.STRUCT_ASSIGN>>{
                    type: ASYTRIPType.STRUCT_ASSIGN,
                    struct,
                    property,
                    value,
                    body: [body.id]
                };
            }
        }

    } else if (node.type == JSNodeType.CallExpression) {

        //Only push on member expressions are allowed
        const [id, args] = node.nodes;

        if (id.type == JSNodeType.IdentifierReference) {
            let ident = id.value.toLowerCase();
            if (
                ["i8", "i16", "i32", "i64", "f32", "f64", "bool", "str",].
                    includes(ident)
            ) {
                const type: ASYType<ASYTRIPType.CONVERT_TYPE> = <any>{
                    type: ASYTRIPType.CONVERT_TYPE,
                    conversion_type: <ASYType>getTypeFromIdentifier(body, ident),
                    value: parseExpression(body, args.nodes[0], tok, context),
                    body: [body.id],
                };

                return type;
            };
            throwAsytripTokenError(tok, node, `
            ASYTRIP_Invalid_Call_Expression
            
            Expected one of "i8" | "i16" | "i32" | "i64" | "f32" | "f64" | "bool" | "str"

            Did not expect ${ident}

            ${node.pos.blameDiagram()}
            `);
        } else if (id.type == JSNodeType.MemberExpression) {

            const [expr, call_identifier] = id.nodes;

            const expression = parseExpression(body, expr, tok, context);

            if (call_identifier.type == (JSNodeType.IdentifierName | JSNodeClass.PROPERTY_NAME)) {

                const call_name = call_identifier.value;

                if (call_name == "push"
                    && (
                        expression.type == ASYTRIPType.VECTOR
                        ||
                        expression.type == ASYTRIPType.PRODUCTION
                    )) {
                    const args_ = args.nodes.map(n => parseExpression(body, n, tok, context));
                    return { type: ASYTRIPType.VECTOR_PUSH, vector: <any>expression, args: args_, body: [body.id] };
                }
            }
        }

        throwAsytripTokenError(tok, node, `
ASYTRIP_Invalid_Call_Expression

Expected one of 
`);
    }
    console.error(renderCompressed(node));
    throwAsytripTokenError(tok, node, "ASYTRIP_Invalid_Expression");

    return <any>undefined;
}

function createArgReference(
    node: any,
    sym: HCG3Symbol,
    index: number,
    tok: Token,
    body: HCG3ProductionBody
): ASYType {
    if (Sym_Is_A_Production(sym)) {

        return {
            type: ASYTRIPType.PRODUCTION,
            val: sym.val,
            arg_pos: index,
            args: [],
            tok: tok.token_slice(node.pos.off, node.pos.off + node.pos.len),
            body: [body.id]
        };
    } else {
        return { type: ASYTRIPType.TOKEN, arg_pos: index, body: [body.id] };
    }
};

function getTypeFromIdentifier(body: HCG3ProductionBody,
    ident: "i8" | "i16" | "i32" | "i64" | "f32" | "f64" | "bool" | "str"
): ASYType {
    return {
        i8: <any>{ type: ASYTRIPType.I8, val: undefined, body: [body.id] },
        i16: <any>{ type: ASYTRIPType.I16, val: undefined, body: [body.id] },
        i32: <any>{ type: ASYTRIPType.I32, val: undefined, body: [body.id] },
        i64: <any>{ type: ASYTRIPType.I64, val: undefined, body: [body.id] },
        f32: <any>{ type: ASYTRIPType.F32, val: undefined, body: [body.id] },
        f64: <any>{ type: ASYTRIPType.F64, val: undefined, body: [body.id] },
        bool: <any>{ type: ASYTRIPType.BOOL, val: undefined, body: [body.id] },
        str: <any>{ type: ASYTRIPType.STRING, val: undefined, body: [body.id] }
    }[ident];
}

export function addTypesToVector(
    node: ASYType,
    context: ASYTRIPContext,
    types: ASYType[]
) {
    if (TypeIsVector(node)) {
        node.types = CondenseTypes([...node.types, ...types]).filter(TypeIsNotNull);
    } else if (TypeIsVectorPush(node)) {
        addTypesToVector(node.vector, context, types);
        for (const arg of node.args)
            addTypesToVector(arg, context, types);
    }
}

export function getResolvedType(
    node: ASYType,
    context: ASYTRIPContext,
    _structs: Set<string> = new Set,
    productions: any[] = []
): ASYType[] {


    if (node)
        switch (node.type) {
            case ASYTRIPType.STRUCT_CLASSIFICATION: {

                const structs: ASYType<ASYTRIPType.STRUCT | ASYTRIPType.NULL>[] = [{ type: ASYTRIPType.NULL, body: [] }];

                const seen = new Set;

                for (const type of node.vals) {
                    if (type.type == ASYTRIPType.STRUCT_TYPE) {
                        const struct = context.structs.get(type.val);
                        if (struct && !seen.has(struct.name)) {
                            structs.push({
                                type: ASYTRIPType.STRUCT,
                                name: struct.name,
                                arg_pos: undefined,
                                body: []
                            });
                            seen.add(struct.name);
                        }
                    } else {
                        for (const [, struct] of context.structs) {
                            if (struct.classes.has(type.val)) {
                                if (struct && !seen.has(struct.name)) {
                                    structs.push({
                                        type: ASYTRIPType.STRUCT,
                                        name: struct.name,
                                        arg_pos: undefined,
                                        body: []
                                    });
                                    seen.add(struct.name);
                                }
                            }
                        }
                    }
                }
                return structs;
            }

            case ASYTRIPType.STRUCT_ASSIGN: {

                const
                    values = getResolvedType(node.struct, context, undefined, productions),
                    structs = values.filter(TypeIsStruct),
                    prop_name = node.property;

                if (structs.length == 0) { throw new Error("Structs undefined"); }

                //Ensure the property exists

                const types = getResolvedType(node.value, context, undefined, productions);

                for (const { name } of structs) {

                    if (_structs.has(name))
                        continue;

                    _structs.add(name);

                    const struct = context.structs.get(name);

                    if (struct) {

                        const prop = struct.properties.get(prop_name);

                        if (!prop) {
                            struct.properties.set(prop_name, {
                                name: prop_name,
                                node: null,
                                source: new Token("", 0, 0, 0),
                                initializers: types.slice()

                            });
                        } else {
                            mergeNewTypesIntoProp(prop, types);
                        }
                    }
                }

                return [];// This does not return any types.
            }

            case ASYTRIPType.STRUCT_PROP_REF: {

                const values = getResolvedType(node.struct, context, undefined, productions);

                const structs = values.filter(TypeIsStruct);

                if (structs.length == 0) { throw new Error("Structs undefined"); }

                const results = [];

                for (const { name } of structs) {

                    if (_structs.has(name))
                        continue;

                    _structs.add(name);

                    const struct = <ASYTRIPStruct>context.structs.get(name);

                    const prop = struct.properties.get(node.property);

                    if (prop) {
                        const vals = prop.initializers.flatMap(c => getResolvedType(c, context, _structs, productions));

                        results.push(...vals);
                    }
                }

                return CondenseTypes(results);
            }
            case ASYTRIPType.STRUCT:
                return [{ type: ASYTRIPType.STRUCT, name: node.name, arg_pos: undefined, args: undefined, body: node.body }];
            case ASYTRIPType.F64:
            case ASYTRIPType.STRING:
            case ASYTRIPType.NULL:
            case ASYTRIPType.TOKEN:
            case ASYTRIPType.BOOL:
                return [node];
            case ASYTRIPType.CONVERT_TYPE: {
                return [node.conversion_type];
            }
            case ASYTRIPType.CONVERT_STRING:
                return [{ type: ASYTRIPType.STRING, val: "", body: node.body }];

            case ASYTRIPType.VECTOR: {
                const types = CondenseTypes([...node.types, ...node.args]
                    .flatMap(a => getResolvedType(a, context, _structs, productions))
                    .flatMap(t => {
                        if (TypeIsVector(t))
                            return t.types;
                        return t;
                    }))
                    .filter(TypeIsNotNull);

                if (types.some(TypeIsVector)) {
                    console.dir({ node, types }, { depth: 8 });
                    throw new Error("Invalid nested vectors");
                }
                return [{ type: ASYTRIPType.VECTOR, args: [], types, arg_pos: node.arg_pos, body: node.body }];
            }
            case ASYTRIPType.EXPRESSIONS: {

                const types: ASYType[][] = [];

                for (const n of node.expressions) {
                    types.push(getResolvedType(
                        n,
                        context,
                        undefined,
                        productions
                    ));
                }

                return types.pop() ?? [];
            }

            case ASYTRIPType.VECTOR_PUSH: {

                const vector_types = getResolvedType(node.vector, context, _structs, productions);

                const args = node.args.slice();

                vector_types.push(...args);

                const results = CondenseTypes(vector_types
                    .flatMap(v => getResolvedType(v, context, _structs, productions))
                    .flatMap(v => TypeIsVector(v) ? v.types : v))

                    .filter(TypeIsNotNull);

                //Update vector type
                addTypesToVector(node, context, results);

                return [{ type: ASYTRIPType.VECTOR, args: [], types: results, arg_pos: undefined, body: node.body }];

            } case ASYTRIPType.PRODUCTION:
                const val = node.val;
                if (!context.resolved_return_types.has(val)) {

                    let recursive = [];

                    let non_recursive = [];

                    context.resolved_return_types.set(val, []);

                    for (const v of context.return_types.get(val) ?? []) {
                        try {
                            const types = getResolvedType(v, context, undefined, productions);
                            non_recursive.push(...types);
                        } catch (E) {
                            if (E == "Unresolved recursion") {
                                recursive.push(v);
                            } else {
                                throw E;
                            }
                        }
                    }

                    context.resolved_return_types.set(val, CondenseTypes(non_recursive));

                    for (const v of recursive) {
                        const types = getResolvedType(v, context, undefined, productions);
                        non_recursive.push(...types);
                    }

                    context.resolved_return_types.set(val, CondenseTypes(non_recursive));
                } else if (context.resolved_return_types.get(val)?.length == 0) {
                    throw "Unresolved recursion";
                }
                productions.push(node);

                if (context.resolved_return_types.get(val)?.some(t => t.type == ASYTRIPType.PRODUCTION))
                    throw "Unresolved recursion";

                return context.resolved_return_types.get(val);

            case ASYTRIPType.ADD:
                const { left, right } = node;

                const body = (left?.body ?? []).concat(right.body, node.body).setFilter();

                // If either type is a vector then 
                // do a vector merge or vector push
                if (TypeIsVector(left)) {
                    return [{
                        type: ASYTRIPType.VECTOR_PUSH, vector: left,
                        PREPEND: false,
                        args: getResolvedType(right, context, _structs, productions),
                        body
                    }];
                } else if (TypeIsVector(right)) {
                    return [{
                        type: ASYTRIPType.VECTOR_PUSH, vector: right,
                        PREPEND: true,
                        args: getResolvedType(left, context, _structs, productions),
                        body
                    }];
                }

                if (
                    left.type == ASYTRIPType.STRING
                    ||
                    right.type == ASYTRIPType.STRING
                ) return [{ type: ASYTRIPType.STRING, val: "", body }];

                const l = getResolvedType(left, context, undefined, productions);
                const r = getResolvedType(right, context, undefined, productions);

                let vector_types = [], IS_VECTOR = false;

                for (const v of [l, r])

                    if (TypesInclude(v, TypeIsVector)) {
                        IS_VECTOR = true;
                        vector_types.push(...v.filter(TypeIsVector).flatMap(v => v.types));
                    } else {
                        vector_types.push(...v);
                    }

                if (IS_VECTOR) {

                    if (vector_types.some(TypeIsVector))
                        throw new Error("Invalid nested vectors from push");

                    return [{
                        type: ASYTRIPType.VECTOR,
                        args: [],
                        types: CondenseTypes(vector_types),
                        arg_pos: undefined,
                        body
                    }];
                }

                if (TypesInclude(l, TypeIsToken) || TypesInclude(l, TypeIsString)) {

                    return [{ type: ASYTRIPType.STRING, val: "", body }];
                }

                if (TypesInclude(r, TypeIsToken) || TypesInclude(r, TypeIsString)) {
                    return [{ type: ASYTRIPType.STRING, val: "ab", body }];
                }

                if (l[0].type == ASYTRIPType.NULL || r[0].type == ASYTRIPType.NULL) {
                    return left.type == ASYTRIPType.NULL ? r : l;
                }

                return [{ type: ASYTRIPType.STRING, val: "", body }];
            case ASYTRIPType.SUB:
                debugger;
                break;

            case ASYTRIPType.OR:
                return CondenseTypes([
                    ...getResolvedType(node.left, context, _structs, productions),
                    ...getResolvedType(node.right, context, _structs, productions)
                ]);

            case ASYTRIPType.TERNARY:
                return CondenseTypes([
                    ...getResolvedType(node.left, context, _structs, productions),
                    ...getResolvedType(node.right, context, _structs, productions)
                ]);

            case ASYTRIPType.EQUALS:
                return [{ type: ASYTRIPType.BOOL, val: false, body: node.body }];
        }

    return [];
}

export function CondenseTypes(types: ASYType[]): ASYType[] {
    const groups = types.group(JSONFilter);

    return groups.map(g => {
        g[0].body = g.flatMap(g => g.body).setFilter().filter(i => i !== undefined);
        return g[0];
    });

}

function extractTypeInfo(
    val: JSRightHandExpressionClass,
    tok: Token,
    asytrip_context: { type_names: Set<unknown>; class_names: Set<unknown>; },
    classes: Set<unknown>,
    type_name: string,
    expr: JSNode
) {

    for (const { node } of traverse(val, "nodes")) {
        switch (node.type) {
            default:
                throwAsytripTokenError(tok, node, "ASYTRIP_Invalid_Type_Value");
            case JSNodeType.BitwiseExpression:
                break;
            case JSNodeType.IdentifierReference:

                const val = node.value;

                if (val.slice(0, 2) == "c_") {
                    const name = val.slice(2);
                    asytrip_context.class_names.add(name);
                    classes.add(name);

                } else if (val.slice(0, 2) == "t_") {
                    const name = val.slice(2);
                    if (type_name)
                        throwAsytripTokenError(tok, node, "ASYTRIP_Redeclared_Type_Name");

                    type_name = name;
                    asytrip_context.type_names.add(name);
                } else {
                    console.error(renderCompressed(expr));
                    throwAsytripTokenError(tok, node,
                        InvalidTypeSpecifier
                    );
                }
        }
    }
    return type_name;
}
function throwAsytripTokenError(tok: Token, node: JSNode, str: string) {
    console.error(tok);
    tok.token_slice(node.pos.off, node.pos.off + node.pos.len).throw(str);
}



export function TypesRequiresDynamic(types: ASYType[]): boolean {
    if (types.length == 1)
        return false;


    if (types.some(t => t.type == ASYTRIPType.NULL)) {
        if (types.length == 2)
            return false;
    }

    return types.setFilter(t => t.type).length > 1;
}
export function TypesInclude<T, B>(types: (T | B)[], fn: (d: (B | T)) => d is B): boolean {
    return types.length > 0 && types.some(fn);
}

export function TypesAre<T, B>(types: (T | B)[], fn: (d: (B | T)) => d is B): types is B[] {
    return types.length > 0 && types.every(fn);
}

export function TypesAreNot<T, B>(types: (T | B)[], fn: (d: (B | T)) => d is B): boolean {
    return !types.some(fn);
}
function TypesNotInclude<T, B>(types: (T | B)[], fn: (d: (B | T)) => d is B): types is T[] {
    return !types.some(fn);
}

export function TypeIsNumber(t: ASYType): t is ASYType<
    ASYTRIPType.I64 |
    ASYTRIPType.I32 |
    ASYTRIPType.I16 |
    ASYTRIPType.I8 |
    ASYTRIPType.F64 |
    ASYTRIPType.F32
> {
    return [
        ASYTRIPType.I64,
        ASYTRIPType.I32,
        ASYTRIPType.I16,
        ASYTRIPType.I8,
        ASYTRIPType.F64,
        ASYTRIPType.F32
    ].includes(t.type);
}

export function TypeIsString(t: ASYType): t is ASYType<ASYTRIPType.STRING> {
    return t.type == ASYTRIPType.STRING;
}
export function TypeIsDouble(t: ASYType): t is ASYType<ASYTRIPType.F64> {
    return t.type == ASYTRIPType.F64;
}
export function TypeIsBool(t: ASYType): t is ASYType<ASYTRIPType.BOOL> {
    return t.type == ASYTRIPType.BOOL;
}
export function TypeIsToken(t: ASYType): t is ASYType<ASYTRIPType.TOKEN> {
    return t.type == ASYTRIPType.TOKEN;
}
export function TypeIsStruct(t: ASYType): t is ASYType<ASYTRIPType.STRUCT> {
    return t.type == ASYTRIPType.STRUCT;
}

export function TypeIsProd(t: ASYType): t is ASYType<ASYTRIPType.PRODUCTION> {
    return t.type == ASYTRIPType.PRODUCTION;
}
export function TypeIsVector(t: ASYType): t is ASYType<ASYTRIPType.VECTOR> {
    return t.type == ASYTRIPType.VECTOR;
}

export function TypeIsVectorPush(t: ASYType): t is ASYType<ASYTRIPType.VECTOR_PUSH> {
    return t.type == ASYTRIPType.VECTOR_PUSH;
}
export function TypeIsNull(t: ASYType): t is ASYType<ASYTRIPType.NULL> {
    return t.type == ASYTRIPType.NULL;
}
export function TypeIsClassification(t: ASYType): t is ASYType<ASYTRIPType.STRUCT_CLASSIFICATION> {
    return t.type == ASYTRIPType.STRUCT_CLASSIFICATION;
}
export function TypeIsNotClassification(t: ASYType): boolean {
    return !TypeIsClassification(t);
}
export function TypeIsNotNull(t: ASYType): boolean {
    return !TypeIsNull(t);
}


const InvalidTypeSpecifier =
    "ASYTRIP_Invalid_Type_Value:\n Expected either a type specifier [ t_[\\d\\w\_]+ ] \n or a class specifier [ c_[\\d\\w\_]+ ]";
