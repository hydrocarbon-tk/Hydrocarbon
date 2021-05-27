import { NodeMapping, NodeMappings } from "@candlelib/conflagrate";
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

export const ts_mappings: NodeMappings<SKNode, "type"> = <NodeMappings<SKNode, "type">>{
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
            template: "number"
        },
        <NodeMapping<SKTypeReference>>{
            type: "type-u32",
            template: "number"
        },
        <NodeMapping<SKTypeReference>>{
            type: "type-i64",
            template: "number"
        },
        <NodeMapping<SKTypeReference>>{
            type: "type-u64",
            template: "number"
        },
        <NodeMapping<SKTypeReference>>{
            type: "type-i16",
            template: "number"
        },
        <NodeMapping<SKTypeReference>>{
            type: "type-u16",
            template: "number"
        },
        <NodeMapping<SKTypeReference>>{
            type: "type",
            template: "@value"
        },
        <NodeMapping<SKTypeReference>>{
            type: "type-i8",
            template: "number"
        },
        <NodeMapping<SKTypeReference>>{
            type: "type-u8",
            template: "number"
        },
        <NodeMapping<SKAssignment>>{
            type: "assignment",
            child_keys: ["target", "expression"],
            template: "@target o:s = o:s @expression"
        },
        <NodeMapping<SKIf>>{
            type: "if",
            child_keys: ["assertion", "expression", "else"],
            template: "if \\( o:s @assertion o:s \\) @expression {else: m:s else m:s @else }"
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
            template: "while { assertion: \\( o:s @assertion? o:s \\) } i:s m:s @expression i:e"
        },
        <NodeMapping<SKFor>>{
            type: "for-loop",
            child_keys: ["initializers", "assertion", "post_iteration", "expression"],
            template: "for \\( o:s @initializers...[,] o:s \\; o:s @assertion? o:s \\; o:s  @post_iteration...[, o:s] o:s \\) o:s o:n @expression",
            custom_render: (state, template_fn) => {
                return template_fn(state);
            }
        },

        <NodeMapping<SKIn>>{
            type: "in-loop",
            child_keys: ["initializer", "target", "expression"],
            template: "for \\( o:s @initializer m:s in m:s @target o:s \\) o:nl @expression"
        },
        <NodeMapping<SKMatch>>{
            type: "match",
            child_keys: ["match_expression", "matches"],
            template: "switch \\( @match_expression \\) \\{ i:s o:n @matches...[o:n] i:e o:n\\}"
        },
        <NodeMapping<SKMatchTarget>>{
            type: "match-clause",
            child_keys: ["match", "expression"],
            template: "case @match \\: o:s o:n @expression",
            custom_render: (state, template_fn) => {

                const { node, indent } = state;

                const cases = [];

                if (node.match.type == "operator-expression") {

                    cases.push(...node.match.list.map(s => {
                        if (s.type == "operator")
                            return null;
                        if (s?.value?.trim() == "default")
                            return "default:";
                        return `case ${template_fn(state, s)}:`;


                    }).filter(s => s));
                } else if (node.match?.value == "default") {
                    cases.push(`default:`);
                } else {
                    cases.push(`case ${template_fn(state, node.match)}:`);
                }

                const offset = " ".repeat(4 * indent);

                return `${cases.join("\n" + offset)} ${"\n" + offset}${template_fn(state, node.expression)}`;

            }
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
            template: "break"
        },
        <NodeMapping<SKBlock>>{
            type: "block",
            child_keys: ["expressions"],
            template: "\\{ i:s o:n   @expressions...[\\;o:n]  i:e o:n \\}"
        },
        <NodeMapping<SKReturn>>{
            type: "return",
            child_keys: ["expression"],
            template: "return {expression : m:s @expression }"
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
            template: "@var_type m:s @name:@primitive_type{initialization: o:s = o:s {new: new m:s} @initialization}",
            custom_render: (state, template_fn) => {
                let variable_type = "var";

                const { node } = state;

                if (node.modifiers.includes("new")) {
                    node.new = true;
                }

                if (node.modifiers.includes("imut")) {
                    variable_type = "const";
                }

                return template_fn(state, Object.assign({}, node, {
                    var_type: variable_type
                }));
            }
        },
        <NodeMapping<SKPrimitiveDeclaration>>{
            type: "argument",
            child_keys: ["type", "primitive_type", "initialization"],
            template: "@name:@primitive_type{initialization: o:s = o:s @initialization}",
        },
        <NodeMapping<SKStructure>>{
            type: "structure",
            child_keys: ["name", "properties"],
            template: "{ modifiers:  \\[ @modifiers...[ m:s ]\\] m:s } struct m:s @name \\{@properties...[,o:n]\\}"
        },
        <NodeMapping<SKClass>>{
            type: "class",
            child_keys: ["name", "members"],
            template: "class m:s @name \\{ i:s o:n @members...[\\; o:n] i:e o:n \\}",
            custom_render: (state, template_fn) => {

                const new_node: SKClass = Object.assign({}, state.node);

                new_node.members = new_node.members.map(n => {
                    if (n.type == "function") {
                        if (n.name.value == state.node.name.value) {
                            return Object.assign({}, n, { type: "method", return_type: null, name: Object.assign({}, n.name, { value: "constructor" }) });
                        }
                        return Object.assign({}, n, { type: "method" });
                    } else if (n.type == "declaration") {
                        return Object.assign({}, n, { type: "class_declaration" });
                    }

                    return n;
                });

                return template_fn(state, new_node);

            }
        },
        <NodeMapping<SKFunction>>{
            type: "method",
            child_keys: ["name", "return_type", "parameters", "expressions"],
            template: "@name (@parameters...[,o:s]) {return_type: \\: @return_type} \\{ i:s o:n @expressions...[;o:n] i:e o:n \\}",
            custom_render: (state, template_fn) => {

                const new_node: SKFunction = Object.assign({}, state.node);

                if (new_node.parameters)
                    new_node.parameters = new_node.parameters.map(p => Object.assign({}, p, { type: 'argument' }));

                return template_fn(state, new_node);

            }
        },
        <NodeMapping<SKFunction>>{
            type: "class_declaration",
            child_keys: ["name", "return_type", "parameters", "expressions"],
            template: "@name:@primitive_type"
        },
        <NodeMapping<SKFunction>>{
            type: "function",
            child_keys: ["name", "return_type", "parameters", "expressions"],
            template: "function m:s @name (@parameters...[,o:s]) {return_type: \\: @return_type} \\{ i:s o:n @expressions...[;o:n] i:e o:n \\}",
            custom_render: (state, template_fn) => {

                const new_node: SKFunction = Object.assign({}, state.node);

                new_node.parameters = new_node.parameters.map(p => Object.assign({}, p, { type: 'argument' }));

                return template_fn(state, new_node);

            }
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

const lu_table = new Map(ts_mappings.mappings.map((i, j) => [i.type, j]));

ts_mappings.type_lookup = (node, name) => lu_table.get(node.type) || -1;