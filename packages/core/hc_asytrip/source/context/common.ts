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
    JSRightHandExpressionClass
} from "@candlelib/js";
import {
    ASYTRIPContext,
    ASYTRIPProperty,
    ASYTRIPStruct,
    ASYTRIPType,
    ASYTRIPTypeObj,
    HCG3ProductionBody,
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
                eval_node = <any>exp(`{type:${val}}`).nodes[0];
            } else if (val.slice(0, 2) == "c_") {
                eval_node = <any>exp(`{type:${val}}`).nodes[0];
            } else if (val[0] == "$" && val.slice(1).match(/\w+$/)) {
                const prop = val.slice(1);
                if (prop !== "type")
                    eval_node = <any>exp(`{${prop}:${val}}`).nodes[0];
            }
        }

        if (eval_node.type == JSNodeType.PropertyBinding) {

            const [id, val] = eval_node.nodes;

            if (id.type != (JSNodeType.IdentifierName | JSNodeClass.PROPERTY_NAME))
                throwAsytripTokenError(tok, id, "ASYTRIP_Invalid_Struct_Property_Identifier");

            const name = (<any>id).value;

            if (name == "type") {
                // Special handler that expects values of the form:
                // type_****** | class_*******
                type_name = extractTypeInfo(val, tok, context, classes, type_name);

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

            for (const _class of classes) {
                struct.classes.add(_class);
            }

            for (const [name, prop] of struct.properties) {
                if (properties.has(name)) {
                    //@ts-ignore
                    const types = [...prop.types, ...properties.get(name).types]
                        .setFilter(JSONFilter);

                    const vectors = types.filter(TypeIsVector);
                    const rest = types.filter(t => !TypeIsVector(t));
                    const vector_types = [
                        ...vectors.flatMap(v => v.types),
                        ...vectors.flatMap(v => v.args)
                    ].setFilter(JSONFilter);
                    vectors.forEach(v => v.types = vector_types);

                    prop.types = [...rest, ...vectors];
                } else {
                    prop.types.push({ type: ASYTRIPType.NULL, body: [body.id] });
                }
            }

            for (const [name, prop] of properties) {
                if (!struct.properties.has(name)) {
                    struct.properties.set(name, prop);
                    prop.types.push({ type: ASYTRIPType.NULL, body: [body.id] });
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
        target_id: body.id,
        types: []
    };

    const out_type = parseExpression(
        body,
        node,
        tok,
        context
    );

    prop.types = [out_type];

    return prop;
}
function parseExpression(
    body: HCG3ProductionBody,
    node: any,
    tok: Token,
    context: ASYTRIPContext,
): ASYTRIPTypeObj[ASYTRIPType] {
    if (node.type == JSNodeType.ObjectLiteral) {
        const {
            name,
            args
        } = parseAsytripStruct(body, node, tok, context);

        return { type: ASYTRIPType.STRUCT, name: name, arg_pos: null, args: args, body: [body.id] };

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
                sym = syms.slice(-1)[0];
                index = syms.length - 1;
            } else if (ref == "__first__") {
                sym = syms[0];
                index = 0;
            } else if (!isNaN(index)) {
                sym = syms[index] ?? null;
            } else {
                for (let i = 0; i < syms.length; i++) {
                    sym = syms[i];
                    if (sym.annotation && sym.annotation == ref) {
                        index = i;
                        break;
                    }
                }

                if (isNaN(index)) {
                    return <ASYTRIPTypeObj[ASYTRIPType.NULL]>{
                        type: ASYTRIPType.NULL
                    };
                }
            }
            if (sym) {
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
            } else {
                return <ASYTRIPTypeObj[ASYTRIPType.NULL]>{
                    type: ASYTRIPType.NULL
                };
            }
            // If referred to value exists then we can lookup the symbol type
            // and: 
            //     a) If production lookup return types for production and push them to property types
            //     b) If type is a symbol: it's either a vector or a token
        } else {
            throwAsytripTokenError(tok, node, "ASYTRIP_Invalid_Struct_Property_Value");
        }
    } else if (node.type == JSNodeType.AdditiveExpression) {

        const [left, right] = node.nodes;

        const left_val = parseExpression(body, left, tok, context);

        const right_val = parseExpression(body, right, tok, context);

        if (TypeIsVector(left_val) || TypeIsVector(right_val)) {
            if (TypeIsVector(left_val)) return {
                type: ASYTRIPType.VECTOR_PUSH,
                vector: <any>left_val.args[0],
                args: [right_val],
                body: [body.id]
            };

            if (TypeIsVector(right_val)) return {
                type: ASYTRIPType.VECTOR_PUSH,
                vector: <any>right_val.args[0],
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
        return <ASYTRIPTypeObj[ASYTRIPType.TERNARY]>{
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
        return <ASYTRIPTypeObj[ASYTRIPType.NULL]>{
            type: ASYTRIPType.NULL
        };
    } else if (node.type == JSNodeType.StringLiteral) {

        return { type: ASYTRIPType.STRING, val: node.value, body: [body.id] };

    } else if (node.type == JSNodeType.NumericLiteral) {

        return { type: ASYTRIPType.F64, val: node.value, body: [body.id] };

    } else if (node.type == JSNodeType.BooleanLiteral) {

        return { type: ASYTRIPType.BOOL, val: (node.value + "") == "true", body: [body.id] };

    } else if (node.type == JSNodeType.ArrayLiteral) {
        const members = node.nodes.map(n => parseExpression(body, n, tok, context));

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

            return <ASYTRIPTypeObj[ASYTRIPType.STRUCT_PROP_REF]>{
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

                return <ASYTRIPTypeObj[ASYTRIPType.STRUCT_ASSIGN]>{
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
                const type: ASYTRIPTypeObj[ASYTRIPType.CONVERT_TYPE] = <any>{
                    type: ASYTRIPType.CONVERT_TYPE,
                    conversion_type: <any>{
                        i8: <any>{ type: ASYTRIPType.I8, val: undefined, body: [body.id] },
                        i16: <any>{ type: ASYTRIPType.I16, val: undefined, body: [body.id] },
                        i32: <any>{ type: ASYTRIPType.I32, val: undefined, body: [body.id] },
                        i64: <any>{ type: ASYTRIPType.I64, val: undefined, body: [body.id] },
                        f32: <any>{ type: ASYTRIPType.F32, val: undefined, body: [body.id] },
                        f64: <any>{ type: ASYTRIPType.F64, val: undefined, body: [body.id] },
                        bool: <any>{ type: ASYTRIPType.BOOL, val: undefined, body: [body.id] },
                        str: <any>{ type: ASYTRIPType.STRING, val: undefined, body: [body.id] }
                    }[ident],
                    value: parseExpression(body, args.nodes[0], tok, context),
                    body: [body.id],
                };

                return type;
            };
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

        throwAsytripTokenError(tok, node, "ASYTRIP_Invalid_Call_Expression");
    }

    throwAsytripTokenError(tok, node, "ASYTRIP_Invalid_Expression");

    return <any>undefined;
}
export function getResolvedType(
    node: ASYTRIPTypeObj[ASYTRIPType],
    context: ASYTRIPContext,
    _structs: Set<string> = new Set,
    productions: any[] = []
): ASYTRIPTypeObj[ASYTRIPType][] {
    if (node)
        switch (node.type) {
            case ASYTRIPType.STRUCT_CLASSIFICATION:
                const structs: ASYTRIPTypeObj[ASYTRIPType.STRUCT][] = [];
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
                const types = node.types
                    .flatMap(a => getResolvedType(a, context, _structs, productions))
                    .setFilter(JSONFilter);

                return [{ type: ASYTRIPType.VECTOR, args: [], types, arg_pos: node.arg_pos, body: node.body }];
            }
            case ASYTRIPType.STRUCT_PROP_REF: {
                const values = getResolvedType(node.struct, context, undefined, productions);
                const structs = values.filter(TypeIsStruct);
                if (structs.length == 0) {
                    throw new Error("Structs undefined");
                }
                const results = [];

                for (const { name } of structs) {
                    if (_structs.has(name))
                        continue;
                    _structs.add(name);
                    const struct = context.structs.get(name);
                    const prop = struct.properties.get(node.property);

                    if (prop) {
                        const vals = prop.types.flatMap(c => getResolvedType(c, context, _structs, productions));

                        results.push(...vals);
                    }
                }

                return results.setFilter(JSONFilter);
            }
            case ASYTRIPType.EXPRESSIONS:
                return getResolvedType(
                    node.expressions[node.expressions.length - 1],
                    context,
                    undefined,
                    productions
                );
            case ASYTRIPType.VECTOR_PUSH:

                const vec_args = node?.vector?.args?.slice() ?? [];
                const types = node?.vector?.types?.slice() ?? [];
                const args = node.args.slice();

                types.push(...args, ...vec_args);

                const results = types
                    .flatMap(v => getResolvedType(v, context, undefined, productions))
                    .flatMap(v => TypeIsVector(v) ? v.types : v)
                    .setFilter(JSONFilter);



                return [{ type: ASYTRIPType.VECTOR, args: [], types: results, arg_pos: undefined, body: node.body }];
            case ASYTRIPType.PRODUCTION:
                const val = node.val;
                if (!context.resolved_return_types.has(val)) {

                    let recursive = [];

                    let non_recursive = [];

                    context.resolved_return_types.set(val, null);

                    for (const v of context.return_types.get(val)) {
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

                    context.resolved_return_types.set(val, non_recursive.setFilter(JSONFilter));

                    for (const v of recursive) {
                        const types = getResolvedType(v, context, undefined, productions);
                        non_recursive.push(...types);
                    }

                    context.resolved_return_types.set(val, non_recursive.setFilter(JSONFilter));
                } else if (context.resolved_return_types.get(val) == null) {
                    throw "Unresolved recursion";
                }
                productions.push(node);
                return context.resolved_return_types.get(val);

            case ASYTRIPType.ADD:
                const { left, right } = node;


                // If either type is a vector then 
                // do a vector merge or vector push
                if (TypeIsVector(left)) {
                    return [{
                        type: ASYTRIPType.VECTOR_PUSH, vector: left,
                        args: getResolvedType(right, context, _structs, productions),
                        body: []
                    }];
                } else if (TypeIsVector(right)) {
                    return [{
                        type: ASYTRIPType.VECTOR_PUSH, vector: right,
                        args: getResolvedType(left, context, _structs, productions),
                        body: []
                    }];
                }

                if (
                    left.type == ASYTRIPType.STRING
                    ||
                    right.type == ASYTRIPType.STRING
                ) return [{ type: ASYTRIPType.STRING, val: "", body: node.body }];

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
                    return [{
                        type: ASYTRIPType.VECTOR,
                        args: [],
                        types: vector_types.setFilter(JSONFilter),
                        arg_pos: undefined,
                        body: node.body
                    }];
                }

                if (TypesInclude(l, TypeIsToken) || TypesInclude(l, TypeIsString))
                    return [{ type: ASYTRIPType.STRING, val: "", body: node.body }];

                if (TypesInclude(r, TypeIsToken) || TypesInclude(r, TypeIsString))
                    return [{ type: ASYTRIPType.STRING, val: "", body: node.body }];

                if (l[0].type == ASYTRIPType.NULL || r[0].type == ASYTRIPType.NULL) {
                    return left.type == ASYTRIPType.NULL ? r : l;
                }

                return [{ type: ASYTRIPType.STRING, val: "", body: node.body }];
            case ASYTRIPType.SUB:
                debugger;
                break;

            case ASYTRIPType.OR:
                return [
                    ...getResolvedType(node.left, context, _structs, productions),
                    ...getResolvedType(node.right, context, _structs, productions)
                ].setFilter(JSONFilter);

            case ASYTRIPType.TERNARY:
                return [
                    ...getResolvedType(node.left, context, _structs, productions),
                    ...getResolvedType(node.right, context, _structs, productions)
                ].setFilter(JSONFilter);

            case ASYTRIPType.EQUALS:
                return [{ type: ASYTRIPType.BOOL, val: undefined, body: node.body }];
        }

    return [];
}

function extractTypeInfo(
    val: JSRightHandExpressionClass,
    tok: Token,
    asytrip_context: { type_names: Set<unknown>; class_names: Set<unknown>; },
    classes: Set<unknown>,
    type_name: string
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
                    throwAsytripTokenError(tok, node,
                        InvalidTypeSpecifier
                    );
                }
        }
    }
    return type_name;
}
function throwAsytripTokenError(tok: Token, node: JSNode, str: string) {
    tok.token_slice(node.pos.off, node.pos.off + node.pos.len).throw(str);
}



export function TypesRequiresDynamic(types: ASYTRIPTypeObj[ASYTRIPType][]): boolean {
    if (types.length == 1)
        return false;


    if (types.some(t => t.type == ASYTRIPType.NULL)) {
        if (types.length == 2)
            return false;
    }

    return types.setFilter(t => t.type).length > 1;
}
export function TypesInclude<T, B>(types: (T | B)[], fn: (d: (B | T)) => d is B): boolean {
    return types.some(fn);
}

export function TypesAre<T, B>(types: (T | B)[], fn: (d: (B | T)) => d is B): types is B[] {
    return types.every(fn);
}

export function TypesAreNot<T, B>(types: (T | B)[], fn: (d: (B | T)) => d is B): boolean {
    return !types.some(fn);
}
function TypesNotInclude<T, B>(types: (T | B)[], fn: (d: (B | T)) => d is B): types is T[] {
    return !types.some(fn);
}


export function TypeIsString(t: ASYTRIPTypeObj[ASYTRIPType]): t is ASYTRIPTypeObj[ASYTRIPType.STRING] {
    return t.type == ASYTRIPType.STRING;
}
export function TypeIsDouble(t: ASYTRIPTypeObj[ASYTRIPType]): t is ASYTRIPTypeObj[ASYTRIPType.F64] {
    return t.type == ASYTRIPType.F64;
}
export function TypeIsBool(t: ASYTRIPTypeObj[ASYTRIPType]): t is ASYTRIPTypeObj[ASYTRIPType.BOOL] {
    return t.type == ASYTRIPType.BOOL;
}
export function TypeIsToken(t: ASYTRIPTypeObj[ASYTRIPType]): t is ASYTRIPTypeObj[ASYTRIPType.TOKEN] {
    return t.type == ASYTRIPType.TOKEN;
}
export function TypeIsStruct(t: ASYTRIPTypeObj[ASYTRIPType]): t is ASYTRIPTypeObj[ASYTRIPType.STRUCT] {
    return t.type == ASYTRIPType.STRUCT;
}
export function TypeIsVector(t: ASYTRIPTypeObj[ASYTRIPType]): t is ASYTRIPTypeObj[ASYTRIPType.VECTOR] {
    return t.type == ASYTRIPType.VECTOR;
}
export function TypeIsNull(t: ASYTRIPTypeObj[ASYTRIPType]): t is ASYTRIPTypeObj[ASYTRIPType.NULL] {
    return t.type == ASYTRIPType.NULL;
}
export function TypeIsClassification(t: ASYTRIPTypeObj[ASYTRIPType]): t is ASYTRIPTypeObj[ASYTRIPType.STRUCT_CLASSIFICATION] {
    return t.type == ASYTRIPType.STRUCT_CLASSIFICATION;
}
export function TypeIsNotClassification(t: ASYTRIPTypeObj[ASYTRIPType]): boolean {
    return !TypeIsClassification(t);
}
export function TypeIsNotNull(t: ASYTRIPTypeObj[ASYTRIPType]): boolean {
    return !TypeIsNull(t);
}


const InvalidTypeSpecifier =
    "ASYTRIP_Invalid_Type_Value:\n Expected either a type specifier [ t_[\\d\\w\_]+ ] \n or a class specifier [ c_[\\d\\w\_]+ ]";
