import { JSExpressionClass, JSIdentifierReference, JSNumericLiteral, JSStringLiteral } from "@candlelib/js";
import { Token } from '../runtime/token.js';

export type ASYTRIPContext = {
    structs: Map<string, ASYTRIPStruct>;
    type_names: Set<string>;
    class_names: Set<string>;
    type: Map<string, number>;
    class: Map<string, number>;
    initializers: any[];
    fn_map: Map<number, {
        args: ASYTRIPProperty[];
        struct: string;
    }>,
    type_mask: number,
    class_mask: number,
    type_offset: number,
    /**
     * Return types that each production
     * can produce
     */
    return_types: Map<number, ASYTRIPTypeObj[ASYTRIPType][]>;
    resolved_return_types: Map<number, ASYTRIPTypeObj[ASYTRIPType][]>;
};

export enum ASYTRIPType {
    NULL,
    PRODUCTION,
    STRUCT,
    STRING,
    TOKEN,
    DOUBLE,
    VECTOR,
    ADD,
    SUB,
    EQUALS,
    VECTOR_PUSH,
    EXPRESSIONS,
    STRUCT_ASSIGN,
    STRUCT_PROP_REF,
    BOOL,
    CONVERT_DOUBLE,
    CONVERT_BOOL,
    CONVERT_STRING,
    TERNARY,
    OR
}
interface ASYTRIPStruct {
    name: string;
    classes: Set<string>;
    properties: Map<string, ASYTRIPProperty>;
}

export interface ASYTRIPProperty {
    name: string;
    types: ASYTRIPTypeObj[ASYTRIPType][];
    target_id: number;
    node: (
        JSExpressionClass |
        JSIdentifierReference |
        JSNumericLiteral |
        JSStringLiteral);

    source: Token;
}
export interface ASYTRIPTypeObj {

    [ASYTRIPType.VECTOR_PUSH]: {
        type: ASYTRIPType.VECTOR_PUSH;
        vector: ASYTRIPTypeObj[ASYTRIPType.VECTOR];
        args: ASYTRIPTypeObj[ASYTRIPType][];
    };
    [ASYTRIPType.VECTOR]: {
        type: ASYTRIPType.VECTOR;
        args: ASYTRIPTypeObj[ASYTRIPType][];
        types: ASYTRIPTypeObj[ASYTRIPType][];
        arg_pos?: number;
    };
    [ASYTRIPType.BOOL]: {
        type: ASYTRIPType.BOOL; val: boolean;
    };
    [ASYTRIPType.DOUBLE]: {
        type: ASYTRIPType.DOUBLE; val: string;
    };
    [ASYTRIPType.STRING]: {
        type: ASYTRIPType.STRING; val?: string;
    };
    [ASYTRIPType.NULL]: {
        type: ASYTRIPType.NULL;
    };
    [ASYTRIPType.TOKEN]: {
        arg_pos?: number;
        type: ASYTRIPType.TOKEN;
    };
    [ASYTRIPType.PRODUCTION]: {
        type: ASYTRIPType.PRODUCTION; args: ASYTRIPTypeObj[ASYTRIPType][]; val: number; arg_pos?: number;
    };
    [ASYTRIPType.EXPRESSIONS]: {
        type: ASYTRIPType.EXPRESSIONS; expressions: ASYTRIPTypeObj[ASYTRIPType][];
    };
    [ASYTRIPType.STRUCT]: {
        type: ASYTRIPType.STRUCT; name: string; arg_pos?: number;
    };
    [ASYTRIPType.STRUCT_ASSIGN]: {
        type: ASYTRIPType.STRUCT_ASSIGN;
        struct: ASYTRIPTypeObj[ASYTRIPType.PRODUCTION] | ASYTRIPTypeObj[ASYTRIPType.STRUCT];
        property: string,
        value: ASYTRIPTypeObj[ASYTRIPType];
    };
    [ASYTRIPType.STRUCT_PROP_REF]: {
        type: ASYTRIPType.STRUCT_PROP_REF;
        struct: ASYTRIPTypeObj[ASYTRIPType.PRODUCTION] | ASYTRIPTypeObj[ASYTRIPType.STRUCT];
        property: string;
    };
    [ASYTRIPType.ADD]: {
        type: ASYTRIPType.ADD; left: ASYTRIPTypeObj[ASYTRIPType]; right: ASYTRIPTypeObj[ASYTRIPType];
    };
    [ASYTRIPType.TERNARY]: {
        type: ASYTRIPType.TERNARY;
        assertion: ASYTRIPTypeObj[ASYTRIPType];
        left: ASYTRIPTypeObj[ASYTRIPType];
        right: ASYTRIPTypeObj[ASYTRIPType];
    };
    [ASYTRIPType.OR]: {
        type: ASYTRIPType.OR; left: ASYTRIPTypeObj[ASYTRIPType]; right: ASYTRIPTypeObj[ASYTRIPType];
    };
    [ASYTRIPType.EQUALS]: {
        type: ASYTRIPType.EQUALS; left: ASYTRIPTypeObj[ASYTRIPType]; right: ASYTRIPTypeObj[ASYTRIPType];
    };
    [ASYTRIPType.SUB]: {
        type: ASYTRIPType.SUB; left: ASYTRIPTypeObj[ASYTRIPType]; right: ASYTRIPTypeObj[ASYTRIPType];
    };
    [ASYTRIPType.CONVERT_DOUBLE]: {
        type: ASYTRIPType.CONVERT_DOUBLE; value: ASYTRIPTypeObj[ASYTRIPType];
    };
    [ASYTRIPType.CONVERT_BOOL]: {
        type: ASYTRIPType.CONVERT_BOOL; value: ASYTRIPTypeObj[ASYTRIPType];
    };
    [ASYTRIPType.CONVERT_STRING]: {
        type: ASYTRIPType.CONVERT_STRING; value: ASYTRIPTypeObj[ASYTRIPType];
    };
}
