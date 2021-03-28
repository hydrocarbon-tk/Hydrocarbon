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

export const skribble_mappings: NodeMappings<SKNode, "type"> = <NodeMappings<SKNode, "type">>{
    typename: "type",
    type_lookup: () => 0,
    mappings: [
        <NodeMapping<SKType>>{ type: "type-u32", template: "u32" },
        <NodeMapping<SKType>>{ type: "type-u32", template: "u32" },
        <NodeMapping<SKType>>{ type: "type-u64", template: "u64" },
        <NodeMapping<SKNumber>>{ type: "number", child_keys: [], template: "@value" },
        <NodeMapping<SKBoolean>>{ type: "boolean", child_keys: [], template: "@value" },
        <NodeMapping<SKNull>>{ type: "null", template: "null" },
        <NodeMapping<SKString>>{ type: "string", template: "\\'@value\\'" },
        <NodeMapping<SKSOperator>>{ type: "operator", child_keys: [], template: "@val" },
        <NodeMapping<SKNakedTemplate>>{ type: "template" },
        <NodeMapping<SKTemplateStatement>>{ type: "template-statement" },
        <NodeMapping<SKTemplateExpression>>{ type: "template-expression" },
        <NodeMapping<SKTemplateValue>>{ type: "template-value" },
        <NodeMapping<SKIdentifier>>{ type: "identifier", template: "@value" },
        <NodeMapping<SKIdentifierReference>>{
            type: "reference",
            template: "@value"
        },
        <NodeMapping<SKMemberReference>>{
            type: "member-reference",
            child_keys: ["reference", "property"],
            template: "@reference \. @property"

        },
        <NodeMapping<SKMemberExpression>>{
            type: "member-expression",
            child_keys: ["reference", "expression"],
            template: "@reference\\[ @expression \\]"
        },
        <NodeMapping<SKTypeString>>{
            type: "type-string",
            template: "String"
        },
        <NodeMapping<SKTypeReference>>{
            type: "type-reference",
            template: "@value"
        },
        <NodeMapping<SKTypeReference>>{
            type: "type-i32",
            template: "i32"
        },
        <NodeMapping<SKTypeReference>>{
            type: "type-u32",
            template: "u32"
        },
        <NodeMapping<SKTypeReference>>{
            type: "type-i64",
            template: "i64"
        },
        <NodeMapping<SKTypeReference>>{
            type: "type-u64",
            template: "u64"
        },
        <NodeMapping<SKTypeReference>>{
            type: "type-i16",
            template: "i16"
        },
        <NodeMapping<SKTypeReference>>{
            type: "type-u16",
            template: "u16"
        },
        <NodeMapping<SKTypeReference>>{
            type: "type",
            template: "@value"
        },
        <NodeMapping<SKTypeReference>>{
            type: "type-i8",
            template: "i8"
        },
        <NodeMapping<SKTypeReference>>{
            type: "type-u8",
            template: "u8"
        },
        <NodeMapping<SKAssignment>>{
            type: "assignment",
            child_keys: ["target", "expression"],
            template: "@target o:s = o:s @expression"
        },
        <NodeMapping<SKIf>>{
            type: "if",
            child_keys: ["assertion", "expression", "else"],
            template: "if m:s @assertion? o:s \\: o:s @expression {else: m:s else m:s @else }"
        },
        <NodeMapping<SKOperatorExpression>>{
            type: "operator-expression",
            child_keys: ["list"],
            template: "@list...[o:s]",
            custom_render: (state, template_fn) => {
                const { node, line, column, } = state;


                const new_node = Object.assign({}, node);

                new_node.list = node.list.slice();

                const list = [];
                // Double equals should be replace with an equals sign
                for (let i = 0; i < node.list.length; i++) {
                    const A = node.list[i];
                    const B = node.list[i + 1];
                    const C = node.list[i + 2];

                    if (A && B) {
                        if (A.type == "operator" && A.val == "?" && C?.type == "operator") {
                            i += 2;
                            list.push(A, B, Object.assign({}, C, { val: ":" }));
                            continue;
                        } else if (A.type == "operator" && A.val == "~=") {
                            list.push(Object.assign({}, A, { val: "==" }));
                            continue;
                        } else if (A.type == "operator" && B.type == "operator") {
                            if (A.val == "=" && B.val == "=") {
                                const C = Object.assign({}, A);
                                C.val = "==";
                                list.push(C);
                                i++;
                                continue;
                            }
                        }
                    }

                    list.push(A);
                }

                new_node.list = list;

                return template_fn(state, new_node, true);
            }
        },
        <NodeMapping<SKLoop>>{
            type: "loop",
            child_keys: ["assertion", "expression"],
            template: "loop { assertion: \\( o:s @assertion? o:s \\) } i:s m:s @expression i:e"
        },
        <NodeMapping<SKFor>>{
            type: "for-loop",
            child_keys: ["initializers", "assertion", "post_iteration", "expression"],
            template: "loop ( o:s @initializers...[,] o:s ; o:s @assertion? o:s ;o:s  @post_iteration? o:s ) o:s i:s o:nl @expression i:e"
        },

        <NodeMapping<SKIn>>{
            type: "in-loop",
            child_keys: ["initializer", "target", "expression"],
            template: "loop \\( o:s @initializer m:s in m:s @target o:s \\) o:nl @expression"
        },
        <NodeMapping<SKMatch>>{
            type: "match",
            child_keys: ["match_expression", "matches"],
            template: "match m:s @match_expression \\: i:s o:n @matches...[\\, o:n o:n] i:e"
        },
        <NodeMapping<SKMatchTarget>>{
            type: "match-clause",
            child_keys: ["match", "expression"],
            template: "@match \\: o:s o:n @expression"
        },
        <NodeMapping<SKCall>>{
            type: "call",
            child_keys: ["reference", "parameters"],
            template: "@reference ( o:s @parameters...[,o:s] o:s )"
        },
        <NodeMapping<SKParenthesis>>{
            type: "parenthesis",
            child_keys: ["expression"],
            template: "( o:s @expression o:s )"
        },
        <NodeMapping<SKBreak>>{
            type: "break",
            child_keys: ["expression"],
            template: "continue"
        },
        <NodeMapping<SKBlock>>{
            type: "block",
            child_keys: ["expressions"],
            template: "\\{ i:s o:n   @expressions...[\\;o:n]  i:e o:n \\}"
        },
        <NodeMapping<SKReturn>>{
            type: "return",
            child_keys: ["expression"],
            template: "return {expression : \\: o:s @expression }"
        },
        <NodeMapping<SKContinue>>{
            type: "continue",
            template: "continue"
        },
        <NodeMapping<SKNamespace>>{
            type: "namespace",
            child_keys: ["statements"],
            template: "ns m:s @name \\{@statements...[;o:n]\\}"
        },
        <NodeMapping<SKPrimitiveDeclaration>>{
            type: "declaration",
            child_keys: ["type", "primitive_type", "initialization"],
            template: "{ modifiers:  \\[ @modifiers...[ m:s ]\\] m:s } @name:@primitive_type{initialization: o:s = o:s @initialization}"
        },
        <NodeMapping<SKStructure>>{
            type: "structure",
            child_keys: ["name", "properties"],
            template: "{ modifiers:  \\[ @modifiers...[ m:s ]\\] m:s } struct m:s @name \\{@properties...[,o:n]\\}"
        },
        <NodeMapping<SKClass>>{
            type: "class",
            child_keys: ["name", "members"],
            template: "{ modifiers:  \\[ @modifiers...[ m:s ]\\] m:s } cls m:s @name \\{@members...[;o:n]\\}"
        },
        <NodeMapping<SKFunction>>{
            type: "function",
            child_keys: ["name", "return_type", "parameters", "expressions"],
            template: "{ modifiers:  \\[ @modifiers...[ m:s ] \\] m:s } fn m:s @name:@return_type (@parameters...[,o:s])\\{ i:s o:n @expressions...[;o:n] i:e o:n \\}"
        },
        <NodeMapping<SKLambda>>{
            type: "lambda",
            child_keys: ["return_type", "parameters", "expressions"]
        },
        <NodeMapping<SKModule>>{
            type: "module",
            child_keys: ["statements"],
            template: "@statements...[o:n]"
        }
    ]
};

const lu_table = new Map(skribble_mappings.mappings.map((i, j) => [i.type, j]));
skribble_mappings.type_lookup = (node, name) => lu_table.get(node.type) || -1;