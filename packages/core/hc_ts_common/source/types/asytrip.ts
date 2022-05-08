/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { JSExpressionClass, JSIdentifierReference, JSNumericLiteral, JSStringLiteral } from "@candlelib/js";
import { Token } from '../objects/token.js';

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
        source: string;
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
    resolved_struct_types: Map<string, Map<string, ResolvedProp>>;
    class_groups: Map<string, [string, ASYTRIPStruct][]>;
};

export enum ASYTRIPType {
    NULL,
    PRODUCTION,
    STRUCT,
    VECTOR,
    STRING,
    TOKEN,
    I64,
    I32,
    I16,
    I8,
    F64,
    F32,
    ADD,
    SUB,
    BOOL,
    EQUALS,
    VECTOR_PUSH,
    VECTOR_PREPEND,
    EXPRESSIONS,
    /**
     * An assignment expression to a struct property.
     */
    STRUCT_ASSIGN,
    STRUCT_PROP_REF,
    CONVERT_TYPE,
    CONVERT_STRING,
    TERNARY,
    OR,
    STRUCT_CLASS,
    STRUCT_TYPE,
    /**
     * A set of [`c_<id>` class] and/or [`t_<id>` type] values to be applied to 
     * a struct.
     */
    STRUCT_CLASSIFICATION
}
export interface ASYTRIPStruct {
    name: string;
    type: number;
    classes: Set<string>;
    properties: Map<string, ASYTRIPProperty>;
}

export interface ASYTRIPProperty {
    name: string;
    types: ASYTRIPTypeObj[ASYTRIPType][];
    node: (
        JSExpressionClass |
        JSIdentifierReference |
        JSNumericLiteral |
        JSStringLiteral) | null;

    source: Token;
}
export interface ASYTRIPTypeObj {
    [ASYTRIPType.STRUCT_CLASSIFICATION]: {
        type: ASYTRIPType.STRUCT_CLASSIFICATION,
        vals: ASYTRIPTypeObj[ASYTRIPType.STRUCT_CLASS | ASYTRIPType.STRUCT_TYPE][];
        body: number[];
    },
    [ASYTRIPType.STRUCT_TYPE]: {
        type: ASYTRIPType.STRUCT_TYPE;
        val: string;
        body: number[];
    },
    [ASYTRIPType.STRUCT_CLASS]: {
        type: ASYTRIPType.STRUCT_CLASS;
        val: string;
        body: number[];
    };
    [ASYTRIPType.VECTOR_PUSH]: {
        type: ASYTRIPType.VECTOR_PUSH;
        vector: ASYTRIPTypeObj[ASYTRIPType.VECTOR];
        args: ASYTRIPTypeObj[ASYTRIPType][];
        body: number[];
    };
    [ASYTRIPType.VECTOR_PREPEND]: {
        type: ASYTRIPType.VECTOR_PREPEND;
        vector: ASYTRIPTypeObj[ASYTRIPType.VECTOR];
        args: ASYTRIPTypeObj[ASYTRIPType][];
        body: number[];
    };
    [ASYTRIPType.VECTOR]: {
        type: ASYTRIPType.VECTOR;
        args: ASYTRIPTypeObj[ASYTRIPType][];
        types: ASYTRIPTypeObj[ASYTRIPType][];
        arg_pos?: number;
        body: number[];
    };
    [ASYTRIPType.BOOL]: {
        type: ASYTRIPType.BOOL; val: boolean;
        body: number[];
    };
    [ASYTRIPType.I64]: {
        type: ASYTRIPType.I64;
        val?: string;
        body: number[];
    };
    [ASYTRIPType.I32]: {
        type: ASYTRIPType.I32;
        val?: string;
        body: number[];
    };
    [ASYTRIPType.I16]: {
        type: ASYTRIPType.I16;
        val?: string;
        body: number[];
    };
    [ASYTRIPType.I8]: {
        type: ASYTRIPType.I8;
        val?: string;
        body: number[];
    };
    [ASYTRIPType.F64]: {
        type: ASYTRIPType.F64;
        val?: string;
        body: number[];
    };
    [ASYTRIPType.F32]: {
        type: ASYTRIPType.F32;
        val?: string;
        body: number[];
    };
    [ASYTRIPType.STRING]: {
        type: ASYTRIPType.STRING;
        val?: string;
        body: number[];
    };
    [ASYTRIPType.NULL]: {
        type: ASYTRIPType.NULL;
        body: number[];
    };
    [ASYTRIPType.TOKEN]: {
        arg_pos?: number;
        type: ASYTRIPType.TOKEN;
        body: number[];
    };
    [ASYTRIPType.PRODUCTION]: {
        type: ASYTRIPType.PRODUCTION;
        args: ASYTRIPTypeObj[ASYTRIPType][];
        val: number;
        arg_pos?: number;
        tok?: Token;
        body: number[];
    };
    [ASYTRIPType.EXPRESSIONS]: {
        type: ASYTRIPType.EXPRESSIONS;
        expressions: ASYTRIPTypeObj[ASYTRIPType][];
        body: number[];
    };
    [ASYTRIPType.STRUCT]: {
        type: ASYTRIPType.STRUCT;
        name: string;
        arg_pos?: number;
        args?: ASYTRIPProperty[];
        body: number[];
    };
    [ASYTRIPType.STRUCT_ASSIGN]: {
        type: ASYTRIPType.STRUCT_ASSIGN;
        struct: ASYTRIPTypeObj[ASYTRIPType.PRODUCTION | ASYTRIPType.STRUCT];
        property: string,
        value: ASYTRIPTypeObj[ASYTRIPType];
        body: number[];
    };
    [ASYTRIPType.STRUCT_PROP_REF]: {
        type: ASYTRIPType.STRUCT_PROP_REF;
        struct: ASYTRIPTypeObj[ASYTRIPType.PRODUCTION | ASYTRIPType.STRUCT];
        property: string;
        body: number[];
    };
    [ASYTRIPType.ADD]: {
        type: ASYTRIPType.ADD;
        left: ASYTRIPTypeObj[ASYTRIPType];
        right: ASYTRIPTypeObj[ASYTRIPType];
        body: number[];
    };
    [ASYTRIPType.TERNARY]: {
        type: ASYTRIPType.TERNARY;
        assertion: ASYTRIPTypeObj[ASYTRIPType];
        left: ASYTRIPTypeObj[ASYTRIPType];
        right: ASYTRIPTypeObj[ASYTRIPType];
        body: number[];
    };
    [ASYTRIPType.OR]: {
        type: ASYTRIPType.OR;
        left: ASYTRIPTypeObj[ASYTRIPType];
        right: ASYTRIPTypeObj[ASYTRIPType];
        body: number[];
    };
    [ASYTRIPType.EQUALS]: {
        type: ASYTRIPType.EQUALS;
        left: ASYTRIPTypeObj[ASYTRIPType];
        right: ASYTRIPTypeObj[ASYTRIPType];
        body: number[];
    };
    [ASYTRIPType.SUB]: {
        type: ASYTRIPType.SUB;
        left: ASYTRIPTypeObj[ASYTRIPType];
        right: ASYTRIPTypeObj[ASYTRIPType];
        body: number[];
    };
    [ASYTRIPType.CONVERT_TYPE]: {
        type: ASYTRIPType.CONVERT_TYPE;
        conversion_type: ASYTRIPTypeObj[
        ASYTRIPType.BOOL
        | ASYTRIPType.STRING
        | ASYTRIPType.I64
        | ASYTRIPType.I32
        | ASYTRIPType.I16
        | ASYTRIPType.I8
        | ASYTRIPType.F64
        | ASYTRIPType.F32
        ];
        value: ASYTRIPTypeObj[ASYTRIPType];
        body: number[];
    };
    [ASYTRIPType.CONVERT_STRING]: {
        type: ASYTRIPType.CONVERT_STRING;
        value: ASYTRIPTypeObj[ASYTRIPType];
        body: number[];
    };
}

export type ASYType<R extends ASYTRIPType = ASYTRIPType> = ASYTRIPTypeObj[R];

export type getTypeString<T extends keyof ASYTRIPTypeObj> = (
    v: ASYTRIPTypeObj[T],
    c: ASYTRIPContext
) => string;
export interface ResolvedProp {
    REQUIRES_DYNAMIC: boolean,
    HAVE_STRUCT: boolean,
    HAVE_STRUCT_VECTORS: boolean,
    types: ASYTRIPTypeObj[ASYTRIPType][];
    name: string;
    HAS_NULL: boolean;
    type: string;
    prop: ASYTRIPProperty;
    structs: ASYTRIPStruct[];
    /**
     * A combination of Class Types 
     * and struct types that cover 
     * the range of structs types
     */
    struct_types: {
        structs: string[],
        classes: string[];
    };

}