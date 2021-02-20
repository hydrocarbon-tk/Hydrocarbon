/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
export interface ScriptNode {
    type: string;
    expressions?: boolean;
    statements?: boolean;
    value?: string;
    val_type?: string;
    isEXPRESSION?: boolean;
    isSTATEMENT?: boolean;
    isBLOCK?: boolean;
}

export interface Expression extends ScriptNode { isEXPRESSION: true; }
export interface Statement extends ScriptNode { isSTATEMENT: true; expressions: true; }
export interface Block extends Statement { isBLOCK: true; statements: true; }
export interface Function extends Block { type: "function"; expressions: true; statements: true; }
export interface Call extends Expression { type: "call"; }
export interface Expressions extends Statement { type: "expressions"; expressions: true; }
export interface Variable extends Expression { type: "variable"; value: string; val_type: string; }
export interface Constant extends Expression { type: "constant"; value: string; val_type: string; }
export interface Assignment extends Expression { type: "assign"; expressions: true; }
export interface Declare extends Statement { type: "declare"; expressions: true; }
export interface Class extends Block { type: "class"; }
export interface Value extends Expression { type: "value"; value: string; value_type: string; }
export interface Member extends Expression { type: "member"; }
export interface Binary extends Expression { type: "binary"; }
export interface UnaryPre extends Expression { type: "unary-prefix"; }
export interface UnaryPost extends Expression { type: "unary-postfix"; }
export interface Group extends Expression { type: "group"; value: string; }
export interface While extends Block { type: "while"; expressions: true; }
;
export interface This extends Expression { type: "this"; expressions: false; }
;
export interface If extends Block { type: "if"; expressions: true; }
;
export interface Comment extends Expression { type: "comment"; value: string; }
;
export interface Switch extends Block { type: "switch"; expressions: true; }
;
export type Node =
    ScriptNode |
    Expression |
    Statement |
    Block |
    Assignment |
    Call |
    Expressions |
    Variable |
    Constant |
    Assignment |
    Class |
    Value |
    While |
    This |
    If |
    Comment |
    Binary |
    UnaryPre |
    UnaryPost |
    Group |
    Member |
    Declare |
    Switch;
