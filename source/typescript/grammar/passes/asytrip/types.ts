import { JSExpressionClass, JSIdentifierReference, JSNumericLiteral, JSStringLiteral } from "@candlelib/js";
import { Token } from '../../../runtime/token.js';

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
};

export const enum ASYTRIPType {
    NULL,
    PRODUCTION,
    STRUCT,
    STRING,
    TOKEN,
    DOUBLE,
    VECTOR,
    ADD,
    SUB,
    VECTOR_PUSH
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
        type: ASYTRIPType.VECTOR; args: ASYTRIPTypeObj[ASYTRIPType][]; arg_pos?: number;
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
    [ASYTRIPType.STRUCT]: {
        type: ASYTRIPType.STRUCT; name: string; arg_pos?: number;
    };
    [ASYTRIPType.ADD]: {
        type: ASYTRIPType.ADD; left: ASYTRIPTypeObj[ASYTRIPType]; right: ASYTRIPTypeObj[ASYTRIPType];
    };
    [ASYTRIPType.SUB]: {
        type: ASYTRIPType.SUB; left: ASYTRIPTypeObj[ASYTRIPType]; right: ASYTRIPTypeObj[ASYTRIPType];
    };
}
