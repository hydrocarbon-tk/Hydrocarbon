import { traverse } from "@candlelib/conflagrate";
import {
    JSBindingProperty,
    JSNode,
    JSNodeClass,
    JSNodeType,
    JSObjectLiteral,
    JSRightHandExpressionClass
} from "@candlelib/js";
import { Token } from '../runtime/token.js';
import { HCG3ProductionBody } from "../types/grammar_nodes";
import { Sym_Is_A_Production } from '../grammar/nodes/symbol.js';
import {
    ASYTRIPContext,
    ASYTRIPProperty,
    ASYTRIPType,
    ASYTRIPTypeObj
} from './types.js';

export function parseAsytripStruct(
    body: HCG3ProductionBody,
    expr: JSObjectLiteral,
    tok: Token,
    asytrip_context: ASYTRIPContext): {
        name: string;
        args: ASYTRIPProperty[];
    } {
    let type_name = "", classes: Set<string> = new Set, properties: Map<string, ASYTRIPProperty> = new Map();

    const sub_expressions = expr.nodes;

    for (const sub_expr of <JSBindingProperty[]>sub_expressions) {

        if (sub_expr.type != JSNodeType.PropertyBinding)
            throwAsytripTokenError(tok, sub_expr, "ASYTRIP_Invalid_Struct_Property");

        const [id, val] = sub_expr.nodes;

        if (id.type != (JSNodeType.IdentifierName | JSNodeClass.PROPERTY_NAME))
            throwAsytripTokenError(tok, id, "ASYTRIP_Invalid_Struct_Property_Identifier");

        const name = id.value;

        if (name == "type") {
            // Special handler that expects values of the form:
            // type_****** | class_*******
            type_name = extractTypeInfo(val, tok, asytrip_context, classes, type_name);
        } else {
            //Create a property 
            extractPropInfo(body, name, tok, val, properties);
        }
    }

    if (!type_name)
        throwAsytripTokenError(tok, expr, "ASYTRIP_Struct_No_Type_Name");

    if (asytrip_context.structs.has(type_name)) {

        const struct = asytrip_context.structs.get(type_name);

        for (const [, _class] of classes)
            struct.classes.add(_class);

        for (const [name, prop] of struct.properties) {
            if (properties.has(name)) {
                //Merge
                const types = [...prop.types, ...properties.get(name).types]
                    .setFilter(JSONFilter);

                const vectors = types.filter(TypeIsVector);
                const rest = types.filter(t => !TypeIsVector(t));
                const vector_args = vectors.flatMap(v => v.args).setFilter(JSONFilter);
                vectors.forEach(v => v.types = vector_args);

                prop.types = [...rest, ...vectors];
            } else {
                prop.types.push({ type: ASYTRIPType.NULL });
            }
        }

        for (const [name, prop] of properties) {
            if (!struct.properties.has(name)) {
                struct.properties.set(name, prop);
                prop.types.push({ type: ASYTRIPType.NULL });
            }
        }
    } else {
        const struct = {
            name: type_name,
            classes: classes,
            properties: properties,
        };
        asytrip_context.structs.set(type_name, struct);
    }

    return { name: type_name, args: [...properties.values()] };
}
export function JSONFilter(v: any) {
    return JSON.stringify(v);
}

function extractPropInfo(
    body: HCG3ProductionBody,
    name: any,
    source: Token,
    val: JSRightHandExpressionClass,
    properties: Map<string, ASYTRIPProperty>
) {
    const property: ASYTRIPProperty = getPropertyFromExpression(
        body,
        val,
        source
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
    tok: Token): ASYTRIPProperty {

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
        tok
    );

    prop.types = [out_type];

    return prop;
}
function parseExpression(
    body: HCG3ProductionBody,
    node: JSNode,
    tok: Token
): ASYTRIPTypeObj[ASYTRIPType] {
    if (node.type == JSNodeType.ExpressionList) {
        const expressions = [];
        for (const expr of node.nodes) {
            expressions.push(parseExpression(body, expr, tok));
        }

        return {
            type: ASYTRIPType.EXPRESSIONS, expressions: expressions
        };

    } else if (node.type == JSNodeType.IdentifierReference) {

        let ref = node.value;


        if (ref[0] == "$" && ref[1] != "$") {
            const syms = body.sym;
            ref = ref.slice(1);
            let sym = null;
            let index = parseInt(ref) - 1;

            if (!isNaN(index)) {
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
                    return { type: ASYTRIPType.PRODUCTION, val: sym.val, arg_pos: index, args: [] };
                } else {
                    return { type: ASYTRIPType.TOKEN, arg_pos: index };
                }
            } else {
                //push void to the return values
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

        const left_val = parseExpression(body, left, tok);

        const right_val = parseExpression(body, right, tok);

        if (TypeIsVector(left_val) || TypeIsVector(right_val)) {
            if (TypeIsVector(left_val)) return {
                type: ASYTRIPType.VECTOR_PUSH,
                vector: left_val.args[0],
                args: [right_val],
            };

            if (TypeIsVector(right_val)) return {
                type: ASYTRIPType.VECTOR_PUSH,
                vector: right_val.args[0],
                args: [left_val]
            };

        } else if (TypeIsString(left_val) && !left_val.val)
            return {
                type: ASYTRIPType.CONVERT_STRING,
                value: right_val,
            };

        if (TypeIsString(right_val) && !right_val.val)
            return {
                type: ASYTRIPType.CONVERT_STRING,
                value: left_val,
            };


        return {
            type: node.symbol == "+" ? ASYTRIPType.ADD : ASYTRIPType.SUB,
            left: left_val,
            right: right_val,
        };
    } else if (node.type == JSNodeType.ConditionalExpression) {
        const [assert, left, right] = node.nodes;
        const assertion = parseExpression(body, assert, tok);
        const left_val = parseExpression(body, left, tok);
        const right_val = parseExpression(body, right, tok);
        return <ASYTRIPTypeObj[ASYTRIPType.TERNARY]>{
            type: ASYTRIPType.TERNARY,
            assertion,
            left: left_val,
            right: right_val,
        };
    } else if (node.type == JSNodeType.LogicalExpression) {
        if (node.symbol == "||") {
            const [left, right] = node.nodes;
            const left_val = parseExpression(body, left, tok);
            const right_val = parseExpression(body, right, tok);

            return {
                type: ASYTRIPType.OR,
                left: left_val,
                right: right_val,
            };
        }
    } else if (node.type == JSNodeType.EqualityExpression) {
        const [left, right] = node.nodes;
        const left_val = parseExpression(body, left, tok);
        const right_val = parseExpression(body, right, tok);

        if (node.symbol == "==")
            return {
                type: ASYTRIPType.EQUALS,
                left: left_val,
                right: right_val,
            };
    } else if (node.type == JSNodeType.UnaryExpression) {
        switch (node.symbol) {
            case "+":
                return <ASYTRIPTypeObj[ASYTRIPType.CONVERT_DOUBLE]>{
                    type: ASYTRIPType.CONVERT_DOUBLE,
                    value: parseExpression(body, <any>node.nodes[0], tok)
                };
            case "!":
                if (node.nodes[0].type == JSNodeType.UnaryExpression
                    && (node.nodes[0].symbol == "!")
                ) return <ASYTRIPTypeObj[ASYTRIPType.CONVERT_BOOL]>{
                    type: ASYTRIPType.CONVERT_BOOL,
                    value: parseExpression(body, <any>node.nodes[0].nodes[0], tok)
                };
        }
        throwAsytripTokenError(tok, node, "ASYTRIP_Invalid_Unary_Expression");
    } else if (node.type == JSNodeType.Parenthesized) {
        return parseExpression(body, <any>node.nodes[0], tok);
    } else if (node.type == JSNodeType.NullLiteral) {
        return <ASYTRIPTypeObj[ASYTRIPType.NULL]>{
            type: ASYTRIPType.NULL
        };
    } else if (node.type == JSNodeType.StringLiteral) {

        return { type: ASYTRIPType.STRING, val: node.value };

    } else if (node.type == JSNodeType.NumericLiteral) {

        return { type: ASYTRIPType.DOUBLE, val: node.value };

    } else if (node.type == JSNodeType.BooleanLiteral) {

        return { type: ASYTRIPType.BOOL, val: (node.value + "") == "true" };

    } else if (node.type == JSNodeType.ArrayLiteral) {
        const members = node.nodes.map(n => parseExpression(body, n, tok));

        return { type: ASYTRIPType.VECTOR, args: members, types: members };

    } else if (node.type == JSNodeType.MemberExpression) {

        const [ref, prop] = node.nodes;

        if (
            prop.type == (JSNodeType.IdentifierName | JSNodeClass.PROPERTY_NAME)
            &&
            (ref.type == JSNodeType.IdentifierReference && ref.value[0] == "$")
        ) {
            const struct = parseExpression(body, ref, tok);
            const property = prop.value;

            return <ASYTRIPTypeObj[ASYTRIPType.STRUCT_PROP_REF]>{
                type: ASYTRIPType.STRUCT_PROP_REF,
                struct,
                property
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
                const struct = parseExpression(body, ref, tok);
                const property = prop.value;
                const value = parseExpression(body, args, tok);

                return <ASYTRIPTypeObj[ASYTRIPType.STRUCT_ASSIGN]>{
                    type: ASYTRIPType.STRUCT_ASSIGN,
                    struct,
                    property,
                    value
                };
            }
        }

        throwAsytripTokenError(tok, node, "ASYTRIP_Invalid_Assignment_Expression");

    } else if (node.type == JSNodeType.CallExpression) {

        //Only push on member expressions are allowed
        const [id, args] = node.nodes;

        if (id.type == JSNodeType.MemberExpression) {

            const [expr, call_identifier] = id.nodes;

            const expression = parseExpression(body, expr, tok);

            if (call_identifier.type == (JSNodeType.IdentifierName | JSNodeClass.PROPERTY_NAME)) {

                const call_name = call_identifier.value;

                if (call_name == "push"
                    && (
                        expression.type == ASYTRIPType.VECTOR
                        ||
                        expression.type == ASYTRIPType.PRODUCTION
                    )) {
                    const args_ = args.nodes.map(n => parseExpression(body, n, tok));
                    return { type: ASYTRIPType.VECTOR_PUSH, vector: expression, args: args_ };
                }
            }
            debugger;
        }

        throwAsytripTokenError(tok, node, "ASYTRIP_Invalid_Call_Expression");

    } else {
        throwAsytripTokenError(tok, node, "ASYTRIP_Invalid_Expression");
    }
}
export function getResolvedType(
    node: ASYTRIPTypeObj[ASYTRIPType],
    context: ASYTRIPContext,
    _structs: Set<string> = new Set
): ASYTRIPTypeObj[ASYTRIPType][] {
    if (node)
        switch (node.type) {
            case ASYTRIPType.DOUBLE:
            case ASYTRIPType.STRING:
            case ASYTRIPType.NULL:
            case ASYTRIPType.TOKEN:
            case ASYTRIPType.STRUCT:
            case ASYTRIPType.BOOL:
                return [node];
            case ASYTRIPType.CONVERT_DOUBLE:
                return [{ type: ASYTRIPType.DOUBLE, val: "" }];
            case ASYTRIPType.CONVERT_BOOL:
                return [{ type: ASYTRIPType.BOOL, val: false }];
            case ASYTRIPType.CONVERT_STRING:
                return [{ type: ASYTRIPType.STRING, val: "" }];
            case ASYTRIPType.VECTOR: {
                const types = node.types
                    .flatMap(a => getResolvedType(a, context, _structs))
                    .setFilter(JSONFilter);

                return [{ type: ASYTRIPType.VECTOR, args: [], types, arg_pos: node.arg_pos }];
            }
            case ASYTRIPType.STRUCT_PROP_REF: {
                const values = getResolvedType(node.struct, context);
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
                        const vals = prop.types.flatMap(c => getResolvedType(c, context, _structs));

                        results.push(...vals);
                    }
                }

                return results.setFilter(JSONFilter);
            }
            case ASYTRIPType.EXPRESSIONS:
                return getResolvedType(
                    node.expressions[node.expressions.length - 1],
                    context
                );
            case ASYTRIPType.VECTOR_PUSH:
                const types = node.vector.args.slice();
                const args = node.args.slice();

                types.push(...args);
                const results = types
                    .flatMap(v => getResolvedType(v, context))
                    .setFilter(JSONFilter);

                if (args.length == 0)
                    debugger;
                return [{ type: ASYTRIPType.VECTOR, args: results, types: results }];
            case ASYTRIPType.PRODUCTION:
                const val = node.val;
                if (!context.resolved_return_types.has(val)) {
                    context.resolved_return_types.set(val, []);
                    const results = context.return_types.get(val)
                        .flatMap(v => getResolvedType(v, context))
                        .setFilter(JSONFilter);
                    context.resolved_return_types.set(val, results);
                }
                return context.resolved_return_types.get(val);

            case ASYTRIPType.ADD:
                const { left, right } = node;

                if (
                    left.type == ASYTRIPType.STRING
                    ||
                    right.type == ASYTRIPType.STRING
                ) return [{ type: ASYTRIPType.STRING, val: "" }];


                if (left.type == ASYTRIPType.ADD)
                    return getResolvedType(left, context);

                const l = getResolvedType(left, context);
                const r = getResolvedType(right, context);

                if (TypesInclude(l, TypeIsVector))
                    return l.filter(TypeIsVector);

                if (TypesInclude(l, TypeIsToken) || TypesInclude(l, TypeIsString))
                    return [{ type: ASYTRIPType.STRING, val: "" }];

                if (TypesInclude(r, TypeIsToken) || TypesInclude(r, TypeIsString))
                    return [{ type: ASYTRIPType.STRING, val: "" }];

                return [{ type: ASYTRIPType.STRING, val: "" }];
            case ASYTRIPType.SUB:
                debugger;
                break;

            case ASYTRIPType.OR:
                return [
                    ...getResolvedType(node.left, context, _structs),
                    ...getResolvedType(node.right, context, _structs)
                ].setFilter(JSONFilter);

            case ASYTRIPType.TERNARY:
                return [
                    ...getResolvedType(node.left, context, _structs),
                    ...getResolvedType(node.right, context, _structs)
                ].setFilter(JSONFilter);
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
                    throwAsytripTokenError(tok, node, "ASYTRIP_Invalid_Type_Value");
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

    return true;
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
export function TypeIsDouble(t: ASYTRIPTypeObj[ASYTRIPType]): t is ASYTRIPTypeObj[ASYTRIPType.DOUBLE] {
    return t.type == ASYTRIPType.DOUBLE;
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
export function TypeIsNotNull(t: ASYTRIPTypeObj[ASYTRIPType]) {
    return !TypeIsNull(t);
}
