/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
export interface CompilableStruct {
    type: string;
    type_name: string;
    cardinal_name__: string;
    enums: {
        [name in string]: EnumType;
    };

    properties: {
        [name in string]: CompilableTypes;
    };
}
interface CompilableType {
    type: string;
    type_name: string;
    index: number;
}
export interface EnumType extends CompilableType {
    type: "ENUM";

    group: string;

    value: string;

    default_val: string;
}
export interface ValType extends CompilableType {

    type: "VAL";

    value: string;
}
export interface DBLType extends CompilableType {
    type: "DOUBLE";
    value: number;
}
export interface BOOLType extends CompilableType {
    type: "BOOLEAN";
    value: boolean;
}
export type CompilableTypes = ValType | EnumType | DBLType | BOOLType;
