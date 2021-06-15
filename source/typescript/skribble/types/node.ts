////////////////////////////////////////////////////////////
// Primitives
export interface SKNumber { type: "number"; value: string; }
export interface SKBoolean { type: "boolean", value: string; }
export interface SKNull { type: "null"; }
export interface SKString { type: "string"; value: string; }
export interface SKSOperator { type: "operator"; val: string; precedence: number; }
export type SKPrimitive = SKNumber | SKBoolean | SKNull | SKString;

////////////////////////////////////////////////////////////
// Templates
export interface SKNakedTemplate { type: "template"; }
export interface SKTemplateStatement { type: "template-statement"; }
export interface SKTemplateExpression { type: "template-expression"; }
export interface SKTemplateValue { type: "template-value"; }
export type SKTemplate = SKNakedTemplate | SKTemplateStatement | SKTemplateExpression | SKTemplateValue;

////////////////////////////////////////////////////////////
// Identifiers & References
export interface SKIdentifierBase { type: string; value: string; }
export interface SKIdentifier extends SKIdentifierBase { type: "identifier"; }
export interface SKIdentifierReference extends SKIdentifierBase { type: "reference"; }
export interface SKMemberReference { type: "member-reference"; reference: SKReference; property: SKReference; value: string; }
export interface SKMemberExpression { type: "member-expression"; reference: SKReference; expression: SKExpression; }
export interface SKPrimitiveDeclaration { type: "declaration"; name: SKIdentifier, modifiers: string[], primitive_type?: SKType, init?: SKExpression; initialization?: SKExpression; }
export interface SKPrimitiveArgument { type: "argument"; name: SKIdentifier, modifiers: string[], primitive_type?: SKType, init?: SKExpression; initialization?: SKExpression; }
export type SKReference = SKIdentifier | SKMemberReference | SKPrimitiveDeclaration | SKMemberExpression | SKIdentifierReference;

////////////////////////////////////////////////////////////
// Types
export interface SKTypeString { type: "type-string"; }
export interface SKTypeReference extends SKIdentifierBase { type: "type-reference"; }
export type SKType = SKTypeReference | SKTypeString;

////////////////////////////////////////////////////////////
// Expression
export interface SKAssignment { type: "assignment"; target: SKReference; expression: SKExpression; }
export interface SKIf { type: "if"; assertion: SKExpression; expression: SKExpression; else?: SKExpression; }
export interface SKOperatorExpression { type: "operator-expression"; list: (SKExpression | SKSOperator)[]; }
export interface SKLoop { type: "loop"; assertion: SKPrimitiveDeclaration[]; expression: SKExpression; }
export interface SKFor { type: "for-loop"; initializers: SKPrimitiveDeclaration[]; assertion: SKExpression; post_iteration: SKExpression[]; expression: SKExpression; }
export interface SKIn { type: "in-loop"; initializer: SKPrimitiveDeclaration; target: SKExpression; expression: SKExpression; }
export interface SKMatch { type: "match"; match_expression: SKExpression; matches: SKMatchTarget[]; }
export interface SKMatchTarget { type: "match-clause", match: SKExpression; expression: SKExpression; }
export interface SKCall { type: "call", reference: SKReference; parameters: (SKExpression)[]; }
export interface SKParenthesis { type: "parenthesis", expression?: SKExpression; }
export interface SKBreak { type: "break", expression?: SKExpression; }
export interface SKBlock { type: "block", expressions: SKExpression[]; }
export interface SKReturn { type: "return", expression?: SKExpression; }
export interface SKContinue { type: "continue"; }
export type SKExpression = SKReference | SKAssignment | SKTemplateExpression | SKAssignment
    | SKIf | SKOperatorExpression | SKLoop | SKFor | SKIn | SKMatch | SKMatchTarget
    | SKCall | SKParenthesis | SKBreak | SKBlock | SKReturn | SKContinue
    | SKLambda | SKNumber | SKNull;

////////////////////////////////////////////////////////////
// Statements
export interface SKNamespace {
    type: "namespace",
    name: SKIdentifier,
    statements: SKStatement[];
}

export interface SKStructure {
    type: "structure";
    name: SKIdentifier;
    modifiers: string[];
    properties: SKPrimitiveDeclaration[];
}

export interface SKClass {
    type: "class";
    name: SKIdentifier;
    modifiers: string[];
    members: (SKStructure | SKPrimitiveDeclaration | SKFunction)[];
}

export interface SKFunction {
    type: "function";
    name: SKIdentifier;
    return_type: SKType;
    modifiers: string[];
    parameters: SKPrimitiveDeclaration[];
    expressions: (SKExpression | SKPrimitiveDeclaration)[];
}

export interface SKMethod {
    type: "method";
    name: SKIdentifier;
    return_type: SKType;
    modifiers: string[];
    parameters: SKPrimitiveDeclaration[];
    expressions: (SKExpression | SKPrimitiveDeclaration)[];
}

export interface SKLambda {
    type: "lambda";
    return_type: SKType;
    modifiers: string[];
    parameters: SKPrimitiveDeclaration[];
    expressions: (SKExpression | SKPrimitiveDeclaration)[];
}

export interface SKModule {
    type: "module",
    statements: SKStatement[];
}
export type SKStatement = SKNamespace
    | SKStructure
    | SKClass
    | SKFunction
    | SKPrimitiveDeclaration;

export type SKNode = SKStatement | SKType | SKExpression | SKTemplate | SKPrimitive | SKModule;