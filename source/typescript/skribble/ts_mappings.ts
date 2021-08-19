import { NodeMapping, NodeMappings } from "@candlelib/conflagrate";
import { sk } from "./skribble.js";
import {
    SKNode, SKNumber,
    SKBoolean, SKNull, SKString, SKSOperator, SKNakedTemplate, SKTemplateStatement,
    SKTemplateExpression, SKTemplateValue, SKIdentifier, SKIdentifierReference,
    SKMemberReference, SKMemberExpression, SKPrimitiveDeclaration, SKLambda,
    SKFunction, SKTypeString, SKTypeReference, SKAssignment,
    SKIf, SKOperatorExpression, SKLoop, SKFor, SKIn,
    SKMatch, SKMatchTarget, SKCall, SKParenthesis, SKBreak,
    SKBlock, SKReturn, SKContinue, SKNamespace, SKStructure, SKClass, SKModule, SKType, SKReference, SKMethod, SKPrimitiveArgument,
} from "./types/node";

export const ts_mappings: NodeMappings<SKNode, "type"> = <NodeMappings<SKNode, "type">>{
    typename: "type",
    type_lookup: () => 0,
    mappings: [
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
            template: "@value",
            custom_render: (state, template_fn) => {
                const node: SKTypeReference = state.node;

                if (node.value.slice(0, 6) == "array_") {
                    const val = node.value.slice(6).split("$")[0].trim();
                    switch (val) {
                        case "u32": return "Uint32Array";
                        case "u16": return "Uint16Array";
                        case "u8": return "Uint8Array";
                        case "i32": return "Int32Array";
                        case "i16": return "Int16Array";
                        case "i8": return "Int8Array";
                        default:
                            return "Array";
                    }

                }

                if (node.value.slice(0, 2) == "__") {
                    const parts = node.value.trim().slice(2).split("$");

                    const type_name = parts[0];

                    const name = template_fn(state, (sk`[c]a:${type_name}`).primitive_type, true);

                    if (parts.includes("ref")) {
                        return name + "&";
                    } else if (parts.includes("ptr")) {
                        return name + "*".repeat(parts.filter(d => d == "ptr").length);
                    }
                }

                return template_fn(state);
            }
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
            template: "@target o:s = {new: new m:s} o:s @expression"
        },
        <NodeMapping<SKIf>>{
            type: "if",
            child_keys: ["assertion", "expression", "else"],
            template: "if \\( o:s @assertion o:s \\) @expression {IS_BLOCKLESS: \\;} {else: m:s else m:s @else }",
            custom_render: (state, template_fn) => {
                const { node } = state;

                if (node.expression.type !== "block") {
                    //@ts-ignore
                    node.IS_BLOCKLESS = true;
                }

                return template_fn(state);
            }

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

                        if (A.type == "operator" && A.val == "****") {
                            //Skip delete operator
                            return "";
                        } else if (A.type == "operator" && A.val == "%%%%") {
                            //Skip array_delete operator
                            return "";
                        } else if ((A.type == "operator" && A.val == "&>") || (A.type == "operator" && A.val == "&>>")) {
                            //Skip memory operator
                            continue;
                        } else if (A.type == "operator" && A.val == "*>") {
                            //Skip dereference operator
                            continue;
                        } else if (A.type == "operator" && A.val == "?" && C?.type == "operator") {
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
            template: "for \\( o:s @initializer m:s of m:s @target o:s \\) o:n @expression"
        },
        <NodeMapping<SKMatch>>{
            type: "match",
            child_keys: ["match_expression", "matches"],
            template: "switch \\( @match_expression \\) \\{ i:s o:n @matches...[o:n  \\break; o:n] i:e o:n\\}"
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
                } else if (node.match?.value.trim() == "default") {
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
            template: "@var_type m:s @name {initialization: o:s = o:s {new: new m:s} @initialization}",
            custom_render: (state, template_fn) => {

                let variable_type = "var";

                let { node } = state;

                const name = template_fn(state, node.name, false);

                if (node.modifiers.includes("js_ignore"))
                    return "";

                if (node.modifiers.includes("new")) {
                    //@ts-ignore
                    node.new = true;
                }

                if (node.modifiers.includes("imut")) {
                    variable_type = "const";
                }

                if (node.modifiers.includes("this_")) {
                    node = Object.assign({}, node, <SKAssignment>{
                        type: "assignment",
                        target: <SKMemberReference>{
                            type: "member-reference",
                            property: node.name,
                            reference: <SKReference>{
                                type: "identifier",
                                value: "this"
                            }
                        },
                        expression: node.initialization
                    });
                }

                if (node.primitive_type.type == "type-reference") {

                    const primitive_type: SKTypeReference = node.primitive_type;

                    if (primitive_type.value.trim() == "function_pointer" && node.initialization?.type == "lambda") {

                        node.initialization = null;
                        /*
                        const args = lambda.parameters.map(m => template_fn(state, m.primitive_type, false));
                        const body = lambda.expressions;
                        const return_type = template_fn(state, lambda.return_type, false);

                        if (body.length == 1 && body[0].type == "number") {
                            //Array
                            return `${return_type} (*${name}[${body[0].value}])( ${args}) `;
                        } else if (body.length == 1) {
                            return `${return_type} (*${name})( ${args})`;
                        } else if (body.length == 0) {
                            return `${return_type} (*${name})( ${args})`;
                        }
                        */
                        //Other possible choices: References other functions 
                        //Single reference to function. 


                    } else if (primitive_type.value.trim().slice(0, 6) == "array_") {

                        /*  Convert assignments to array initializers
                        */

                        const type = template_fn(state, primitive_type, false);

                        const prefix = node.modifiers.includes("this_") ? "this." : "var ";

                        if (node.initialization && node.initialization.type == "call") {
                            const call = node.initialization;

                            if (call.parameters) {

                                if (call.parameters.length == 1 && call.parameters[0].type == "number") {
                                    return prefix + name.trim() + ` = new ${type}(${template_fn(state, call.parameters[0], false)})`;
                                } else if (call.parameters.length > 0 && call.parameters.every(e => e.type == "number")) {
                                    return prefix + name.trim() + ` = new ${type}([${call.parameters.map(p => p.value)}])`;
                                } else if (call.parameters.length == 1) {
                                    return prefix + name.trim() + ` = new ${type}(${template_fn(state, call.parameters[0], false)})`;
                                }
                            } else
                                return prefix + name.trim() + ` = []`;
                        } else {
                            //Array will be a pointer

                            return type + "* " + name.trim();
                        }

                    }
                }

                return template_fn(state, Object.assign({}, node, {
                    var_type: variable_type
                }));
            }
        },
        <NodeMapping<SKPrimitiveArgument>>{
            type: "argument",
            child_keys: ["type", "primitive_type", "initialization"],
            template: "@name{initialization: o:s = o:s @initialization}",
            custom_render: (state, render_fn) => {
                const node = state.node;
                if (node.primitive_type.type == "type-reference")
                    if (node.primitive_type.value.trim() == "function_pointer" && node.initialization?.type == "lambda")
                        state.node.initialization = null;
                return render_fn(state);
            }
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
                        if (n.return_type.value == "destructor")
                            return null;
                        if (n.name.value == state.node.name.value) {
                            return Object.assign({}, n, { type: "method", return_type: null, name: Object.assign({}, n.name, { value: "constructor" }) });
                        }
                        return Object.assign({}, n, { type: "method" });
                    } else if (n.type == "declaration") {
                        return null;
                    }

                    return n;
                }).filter(i => i);

                return template_fn(state, new_node);

            }
        },
        <NodeMapping<SKMethod>>{
            type: "method",
            child_keys: ["name", "return_type", "parameters", "expressions"],
            template: "@name (@parameters...[,o:s]) \\{ i:s o:n @expressions...[;o:n] i:e o:n \\}",
            custom_render: (state, template_fn) => {

                const new_node: SKMethod = Object.assign({}, state.node);

                if (new_node.parameters)
                    new_node.parameters = new_node.parameters.map(p => Object.assign({}, p, { type: 'argument' }));
                //@ts-ignore
                new_node.expressions = new_node.expressions.map(exp => template_fn(state, exp, false)).filter(e => !!e);

                return template_fn(state, new_node);

            }
        },
        <NodeMapping<SKFunction>>{
            type: "function",
            child_keys: ["name", "return_type", "parameters", "expressions"],
            template: "function m:s @name (@parameters...[,o:s]) \\{ i:s o:n @expressions...[;o:n] i:e o:n \\}",
            custom_render: (state, template_fn) => {

                const new_node: SKFunction = Object.assign({}, state.node);

                new_node.parameters = new_node.parameters.map(p => Object.assign({}, p, { type: 'argument' }));
                //@ts-ignore
                new_node.expressions = new_node.expressions.map(exp => template_fn(state, exp, false)).filter(e => !!e);

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