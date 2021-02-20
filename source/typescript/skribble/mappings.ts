import { NodeMapping, NodeMappings } from "@candlefw/conflagrate";
import {
    SKNode, SKNumber,
    SKBoolean, SKNull, SKString, SKSOperator, SKNakedTemplate, SKTemplateStatement,
    SKTemplateExpression, SKTemplateValue, SKIdentifier, SKIdentifierReference,
    SKMemberReference, SKMemberExpression, SKPrimitiveDeclaration, SKLambda,
    SKFunction, SKTypeString, SKTypeReference, SKAssignment,
    SKIf, SKOperatorExpression, SKLoop, SKFor, SKIn,
    SKMatch, SKMatchTarget, SKCall, SKParenthesis, SKBreak,
    SKBlock, SKReturn, SKContinue, SKNamespace, SKStructure, SKClass, SKModule, SKType,
} from "./types/node";

export const skribble_mappings = <NodeMappings<SKNode, "type">>{
    typename: "type",
    type_lookup: () => 0,
    mappings: [
        <NodeMapping<SKType>>{ type: "type-u32", template_pattern: "u32" },
        <NodeMapping<SKType>>{ type: "type-u32", template_pattern: "u32" },
        <NodeMapping<SKType>>{ type: "type-u64", template_pattern: "u64" },
        <NodeMapping<SKNumber>>{ type: "number", child_keys: [], template_pattern: "@value" },
        <NodeMapping<SKBoolean>>{ type: "boolean", child_keys: [], template_pattern: "@value" },
        <NodeMapping<SKNull>>{ type: "null", template_pattern: "null" },
        <NodeMapping<SKString>>{ type: "string", template_pattern: "\\'@value\\'" },
        <NodeMapping<SKSOperator>>{ type: "operator", child_keys: [], template_pattern: "@val" },
        <NodeMapping<SKNakedTemplate>>{ type: "template" },
        <NodeMapping<SKTemplateStatement>>{ type: "template-statement" },
        <NodeMapping<SKTemplateExpression>>{ type: "template-expression" },
        <NodeMapping<SKTemplateValue>>{ type: "template-value" },
        <NodeMapping<SKIdentifier>>{ type: "identifier", template_pattern: "@value" },
        <NodeMapping<SKIdentifierReference>>{
            type: "reference",
            template_pattern: "@value"
        },
        <NodeMapping<SKMemberReference>>{
            type: "member-reference",
            child_keys: ["reference", "property"],
            template_pattern: "@reference \. @property"

        },
        <NodeMapping<SKMemberExpression>>{
            type: "member-expression",
            child_keys: ["reference", "expression"],
            template_pattern: "@reference\\[ @expression \\]"
        },
        <NodeMapping<SKTypeString>>{
            type: "type-string",
            template_pattern: "String"
        },
        <NodeMapping<SKTypeReference>>{
            type: "type-reference",
            template_pattern: "@value"
        },
        <NodeMapping<SKAssignment>>{
            type: "assignment",
            child_keys: ["target", "expression"],
            template_pattern: "@target o:s = o:s @expression"
        },
        <NodeMapping<SKIf>>{
            type: "if",
            child_keys: ["assertion", "expression", "else"],
            render_rules: "if \\( o:s @assertion? o:s \\) o:s @expression {else: else m:s @else }"
        },
        <NodeMapping<SKOperatorExpression>>{
            type: "operator-expression",
            child_keys: ["list"],
            template_pattern: "@list...[o:s]"
        },
        <NodeMapping<SKLoop>>{
            type: "loop",
            child_keys: ["assertion", "expression"],
            render_rules: "loop { assertion:\\( o:s @assertion? o:s \\) i:s o:nl } m:s @expression"
        },
        <NodeMapping<SKFor>>{
            type: "for-loop",
            child_keys: ["initializers", "assertion", "post_iteration", "expression"],
            render_rules: "loop \\( o:s @initializers...[,] o:s \\; o:s @assertion? o:s \\;o:s  @post_iteration? o:s \\) o:s i:s o:nl @expression i:e"
        },

        <NodeMapping<SKIn>>{
            type: "in-loop",
            child_keys: ["initializer", "target", "expression"],
            render_rules: "loop \\( o:s @initializer m:s in m:s @target o:s \\) o:s i:s o:nl @expression i:e"
        },
        <NodeMapping<SKMatch>>{
            type: "match",
            child_keys: ["match_expression", "matches"],
            render_rules: "match @match_expression \\: i:s @matches...[\\, o:n] i:e"
        },
        <NodeMapping<SKMatchTarget>>{
            type: "match-clause",
            child_keys: ["match", "expression"],
            template_pattern: " @match o:s \\: o:s i:s @expression i:e"
        },
        <NodeMapping<SKCall>>{
            type: "call",
            child_keys: ["reference", "arguments"],
            template_pattern: "@reference ( o:s @arguments...[,o:s] o:s )"
        },
        <NodeMapping<SKParenthesis>>{
            type: "parenthesis",
            child_keys: ["expression"],
            template_pattern: "( o:s @expression o:s )"
        },
        <NodeMapping<SKBreak>>{
            type: "break",
            child_keys: ["expression"],
            template_pattern: "continue"
        },
        <NodeMapping<SKBlock>>{
            type: "block",
            child_keys: ["expressions"],
            template_pattern: "\\{ i:s  @expressions...[\\;o:n]  i:e \\}"
        },
        <NodeMapping<SKReturn>>{
            type: "return",
            child_keys: ["expression"],
            template_pattern: "return ${expression : \\: o:s @expression }"
        },
        <NodeMapping<SKContinue>>{
            type: "continue",
            template_pattern: "continue"
        },
        <NodeMapping<SKNamespace>>{
            type: "namespace",
            child_keys: ["statements"],
            template_pattern: "ns m:s @name \\{@statements...[;o:n]\\}"
        },
        <NodeMapping<SKPrimitiveDeclaration>>{
            type: "declaration",
            child_keys: ["type", "primitive_type", "initialization"],
            template_pattern: "{ modifiers:  \\[ @modifiers...[ m:s ]\\] m:s } @name:@primitive_type{initialization: o:s = o:s @initialization}"
        },
        <NodeMapping<SKStructure>>{
            type: "structure",
            child_keys: ["name", "properties"],
            template_pattern: "{ modifiers:  \\[ @modifiers...[ m:s ]\\] m:s } struct m:s @name \\{@properties...[,o:n]\\}"
        },
        <NodeMapping<SKClass>>{
            type: "class",
            child_keys: ["name", "members"],
            template_pattern: "{ modifiers:  \\[ @modifiers...[ m:s ]\\] m:s } cls m:s @name \\{@members...[;o:n]\\}"
        },
        <NodeMapping<SKFunction>>{
            type: "function",
            child_keys: ["name", "return_type", "parameters", "expressions"],
            template_pattern: "{ modifiers:  \\[ @modifiers...[ m:s ] \\] m:s } fn m:s @name:@return_type (@parameters...)\\{@expressions...[;]\\}"
        },
        <NodeMapping<SKLambda>>{
            type: "lambda",
            child_keys: ["return_type", "parameters", "expressions"]
        },
        <NodeMapping<SKModule>>{
            type: "module",
            child_keys: ["statements"],
            template_pattern: "@statements...[o:n]"
        }
    ]
};

const lu_table = new Map(skribble_mappings.mappings.map((i, j) => [i.type, j]));
skribble_mappings.type_lookup = (node, name) => lu_table.get(node.type) || -1; 