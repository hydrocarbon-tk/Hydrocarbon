import { traverse } from "@candlelib/conflagrate";
import {
    JSBindingProperty,
    JSNode,
    JSNodeClass,
    JSNodeType,
    JSObjectLiteral,
    JSRightHandExpressionClass
} from "@candlelib/js";
import { Token } from '../../../runtime/token.js';
import { HCG3ProductionBody } from "../../../types/grammar_nodes";
import { Sym_Is_A_Production } from '../../nodes/symbol.js';
import {
    ASYTRIPContext,
    ASYTRIPProperty,
    ASYTRIPType,
    ASYTRIPTypeObj
} from './types';

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
                properties.get(name)
                    .types.push(...prop.types);
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
export function getResolvedType(
    node: ASYTRIPTypeObj[ASYTRIPType],
    context: ASYTRIPContext,
    productions_seen: Map<number, ASYTRIPTypeObj[ASYTRIPType][]> = new Map
): ASYTRIPTypeObj[ASYTRIPType][] {

    switch (node.type) {
        case ASYTRIPType.VECTOR_PUSH:
            const types = node.vector.args.slice();
            const args = node.args.slice();

            types.push(...args);
            const results = types
                .flatMap(v => getResolvedType(v, context, productions_seen))
                .setFilter(fn => JSON.stringify(fn));
            return [{ type: ASYTRIPType.VECTOR, args: results }];
        case ASYTRIPType.DOUBLE:
        case ASYTRIPType.STRING:
        case ASYTRIPType.NULL:
        case ASYTRIPType.TOKEN:
        case ASYTRIPType.STRUCT:
            return [node];
        case ASYTRIPType.VECTOR:
            return getResolvedType(node.args[0], context, productions_seen);
        case ASYTRIPType.PRODUCTION:
            const val = node.val;
            if (!productions_seen.has(val)) {
                productions_seen.set(val, []);
                const results = context.return_types.get(val)
                    .flatMap(v => getResolvedType(v, context, productions_seen))
                    .setFilter(fn => JSON.stringify(fn));
                productions_seen.set(val, results);
            }
            return productions_seen.get(val);
        case ASYTRIPType.ADD:
            const { left, right } = node;

            if (left.type == ASYTRIPType.STRING) {
                return [{ type: ASYTRIPType.STRING, val: "" }];
            }

            if (left.type == ASYTRIPType.ADD)
                return getResolvedType(left, context, productions_seen);

            const l = getResolvedType(left, context, productions_seen);
            const r = getResolvedType(right, context, productions_seen);

            debugger;
            break;
        case ASYTRIPType.SUB:
            debugger;
            break;
    }

    return [];
}
function parseExpression(
    body: HCG3ProductionBody,
    node: JSNode,
    tok: Token
) {
    if (node.type == JSNodeType.IdentifierReference) {

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
                    throwAsytripTokenError(tok, node, "ASYTRIP_Invalid_Symbol_Reference");
                }
            }
            if (sym) {
                if (Sym_Is_A_Production(sym)) {
                    return { type: ASYTRIPType.PRODUCTION, val: sym.val, arg_pos: index };
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
        return {
            type: node.symbol == "+" ? ASYTRIPType.ADD : ASYTRIPType.SUB,
            left: left_val,
            right: right_val,
        };
    } /* else if (node.type == JSNodeType.MultiplicativeExpression) {

    } */

    else if (node.type == JSNodeType.Parenthesized) {
        return parseExpression(body, node.nodes[0], tok);
    } else if (node.type == JSNodeType.StringLiteral) {
        return { type: ASYTRIPType.STRING, val: node.value };
    } else if (node.type == JSNodeType.NumericLiteral) {
        return { type: ASYTRIPType.DOUBLE, val: node.value };
    } else if (node.type == JSNodeType.ArrayLiteral) {
        const members = node.nodes.map(n => parseExpression(body, n, tok));
        return { type: ASYTRIPType.VECTOR, args: members };
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

                if (val.slice(0, 7) == "class__") {
                    const name = val.slice(7);
                    asytrip_context.class_names.add(name);
                    classes.add(name);

                } else if (val.slice(0, 6) == "type__") {
                    const name = val.slice(6);
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

export function TypesAre<T, B>(types: (T | B)[], fn: (d: (B | T)) => d is B): boolean {
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
