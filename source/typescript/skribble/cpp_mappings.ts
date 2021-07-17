import { NodeMapping, NodeMappings } from "@candlelib/conflagrate";
import { sk } from "./skribble.js";
import {
    SKAssignment,
    SKBlock, SKBoolean,
    SKMethod,
    SKBreak, SKCall,
    SKClass, SKContinue, SKFor, SKFunction, SKIdentifier, SKIdentifierReference,
    SKIf, SKIn, SKLambda,
    SKLoop,
    SKMatch, SKMatchTarget, SKMemberExpression, SKMemberReference,
    SKModule, SKNakedTemplate,
    SKNamespace, SKNode,
    SKNull, SKNumber,
    SKOperatorExpression,
    SKParenthesis, SKPrimitiveArgument, SKPrimitiveDeclaration,
    SKReturn, SKSOperator, SKString,
    SKStructure, SKTemplateExpression, SKTemplateStatement,
    SKTemplateValue,
    SKType, SKTypeReference, SKTypeString
} from "./types/node";

export const cpp_mappings: NodeMappings<SKNode, "type"> = <NodeMappings<SKNode, "type">>{
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
            template: "@reference \. @property",
            custom_render: (state, template_fn) => {
                const { node } = state;

                if (node.reference.value == "this")
                    return template_fn(state, node.property, false);

                return template_fn(state);
            }

        },
        <NodeMapping<SKMemberExpression>>{
            type: "member-expression",
            child_keys: ["reference", "expression"],
            template: "@reference\\[ @expression \\]"
        },
        <NodeMapping<SKTypeString>>{
            type: "type-string",
            template: "std::string"
        },
        <NodeMapping<SKTypeReference>>{
            type: "type-reference",
            template: "@value",
            custom_render: (state, template_fn) => {
                const node: SKTypeReference = state.node;

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
            template: "int"
        },
        <NodeMapping<SKTypeReference>>{
            type: "type-u32",
            template: "unsigned m:s int"
        },
        <NodeMapping<SKTypeReference>>{
            type: "type-i64",
            template: "long m:s long"
        },
        <NodeMapping<SKTypeReference>>{
            type: "type-u64",
            template: "unsigned m:s long m:s long"
        },
        <NodeMapping<SKTypeReference>>{
            type: "type-i16",
            template: "short"
        },
        <NodeMapping<SKTypeReference>>{
            type: "type-u16",
            template: "unsigned m:s short"
        },
        <NodeMapping<SKTypeReference>>{
            type: "type",
            template: "@value"
        },
        <NodeMapping<SKTypeReference>>{
            type: "type-i8",
            template: "char"
        },
        <NodeMapping<SKTypeReference>>{
            type: "type-u8",
            template: "unsigned m:s char"
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
                            list.push(Object.assign({}, A, { val: "delete " }), B);
                            i += 2;
                            continue;
                        } else if (A.type == "operator" && A.val == "%%%%") {
                            list.push(Object.assign({}, A, { val: "delete[] " }), B);
                            i += 2;
                            continue;
                        } else if (A.type == "operator" && A.val == "&>") {
                            list.push(Object.assign({}, A, { val: "&" }), B);
                            i += 2;
                            continue;
                        } else if (A.type == "operator" && A.val == "*>") {
                            list.push(Object.assign({}, A, { val: "*" }), B);
                            i += 2;
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
                } else if (node.match?.value.trim() == "default") {
                    cases.push(`default:`);
                } else {
                    cases.push(`case ${template_fn(state, node.match)}:`);
                }

                const offset = " ".repeat(4 * indent);

                return `${cases.join("\n" + offset)} ${"\n" + offset}${template_fn(state, node.expression)};`;

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
            template: "\\{ i:s o:n   @expressions...[\\; o:n] \\;  i:e o:n \\}"
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
            template: "ns m:s @name \\{@statements...[\\; o:n] \\; \\}"
        },
        <NodeMapping<SKPrimitiveDeclaration>>{
            type: "declaration",
            child_keys: ["type", "primitive_type", "initialization"],
            template: "{primitive_type: @primitive_type} m:s @name {initialization: o:s = o:s {new: new m:s} @initialization}",
            custom_render: (state, template_fn) => {
                let variable_type = "var";

                let node: SKPrimitiveDeclaration = state.node;

                const name = template_fn(state, node.name, false);

                if (node.modifiers.includes("cpp_ignore"))
                    return "";

                if (node.primitive_type.type == "type-reference") {
                    const primitive_type: SKTypeReference = node.primitive_type;

                    if (primitive_type.value.trim() == "function_pointer" && node.initialization?.type == "lambda") {

                        const lambda = node.initialization;

                        const args = lambda.parameters.map(m => template_fn(state, m.primitive_type, false));
                        const body = lambda.expressions;
                        const return_type = template_fn(state, lambda.return_type, false);

                        if (body.length == 1 && body[0].type == "number") {
                            //Array
                            return `${return_type} (*${name}[${body[0].value}])( ${args}) `;
                        } else if (body.length == 1) {
                            return `${return_type} (*${name})( ${args}) = ${template_fn(state, body[0], false)}`;
                        } else if (body.length == 0) {
                            return `${return_type} (*${name})( ${args})`;
                        }
                        //Other possible choices: References other functions 
                        //Single reference to function. 


                    } else if (primitive_type.value.trim().slice(0, 6) == "array_") {

                        /*  Convert assignments to array initializers
                        */
                        const type_node = sk`[const] e : ${primitive_type.value.slice(6).trim()};`;

                        const type = template_fn(state, type_node.primitive_type, false);

                        if (node.initialization && node.initialization.type == "call") {
                            const call = node.initialization;

                            if (call.parameters.length == 1 && call.parameters[0].type == "number") {

                                if (node.modifiers.includes("new"))
                                    return type + "* " + name.trim() + "=" + `new ${type}[${template_fn(state, call.parameters[0], false)}]`;
                                //Single number indicates length of array. Use this to create new array
                                //Of the appropriate length with each member initialized to 0
                                return type + " " + name.trim() + `[${call.parameters[0].value}] = {0}`;


                            } else if (call.parameters.length > 0 && call.parameters.every(e => e.type == "number")) {
                                return type + " " + name.trim() + `[${call.parameters.length}] = {${call.parameters.map(p => p.value)}}`;
                            } else if (call.parameters.length == 1) {

                                if (node.modifiers.includes("this_"))
                                    return name.trim() + "=" + `new ${type}[${template_fn(state, call.parameters[0], false)}]`;
                                else
                                    return type + " " + name.trim() + "=" + `new [${template_fn(state, call.parameters[0], false)}]`;

                            }
                        } else {
                            //Array will be a pointer

                            return type + "* " + name.trim();
                        }

                    }
                }

                if (node.modifiers.includes("new") && node.initialization) {
                    //@ts-ignore
                    node.new = true;
                }
                if (node.modifiers.includes("this_")) {
                    node.primitive_type = null;
                }

                return template_fn(state, Object.assign({}, node));
            }
        },
        <NodeMapping<SKPrimitiveArgument>>{
            type: "argument",
            child_keys: ["type", "primitive_type", "initialization"],
            template: "@primitive_type m:s @name{initialization: o:s = o:s @initialization}",
            custom_render: (state, template_fn) => {

                let { node } = state;
                return template_fn(state, Object.assign({}, node));
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
            template: "class m:s @name \\{ i:s o:n \\public: o:n @mem_str i:e o:n \\}",
            custom_render: (state, template_fn) => {

                const new_node: SKClass = Object.assign({}, state.node);


                state.indent++;
                let str = new_node.members.map(m => {
                    if (m.type == "declaration") {
                        return template_fn(state, m, false) + ";";
                    } else if (m.type == "function") {

                        if (m.return_type.value == "destructor") {

                            m.name.value = "~" + new_node.name.value;

                            m.return_type.value = "";

                        } else if (m.name.value == new_node.name.value) {

                            m.name.value = "";
                        }

                        return template_fn(state, m, false);
                    }
                }).join("\n" + " ".repeat(state.indent * 4));
                state.indent--;
                //@ts-ignore
                new_node.mem_str = str;

                return template_fn(state, new_node);

            }
        },
        <NodeMapping<SKMethod>>{
            type: "method",
            child_keys: ["name", "return_type", "parameters", "expressions"],
            template: "{pub: public\\: } @return_type m:s @name (@parameters...[,o:s]) \\{ i:s o:n @expressions...[;o:n] \\; i:e o:n \\}",
            custom_render: (state, template_fn) => {

                let new_node: SKMethod = Object.assign({}, state.node);

                if (new_node.modifiers.includes("pub")) {
                    //@ts-ignore
                    new_node.pub = true;
                }

                if (new_node.parameters)
                    new_node.parameters = new_node.parameters.map(p => Object.assign({}, p));

                return template_fn(state, new_node);

            }
        },
        <NodeMapping<SKFunction>>{
            type: "function",
            child_keys: ["name", "return_type", "parameters", "expressions"],
            template: "@return_type m:s @name (@parameters...[,o:s]) \\{ i:s o:n @expressions...[;o:n] \\; i:e o:n \\}",

            custom_render: (state, template_fn) => {

                if (state.node.modifiers.includes("extern")) {
                    state.indent++;

                    const out = `extern "C" {\n    ${template_fn(state)}\n  }`;

                    state.indent--;
                    return out;
                }


                return template_fn(state);
            }
        },
        <NodeMapping<SKLambda>>{
            type: "lambda",
            child_keys: ["return_type", "parameters", "expressions"]
        },
        <NodeMapping<SKModule>>{
            type: "module",
            child_keys: ["statements"],
            template: "@statements...[o:n]",
            custom_render: (state, template_fn) => {

                const new_node: SKModule = Object.assign({}, state.node);
                let str = state.node.statements.map(m => {
                    if (m.type == "declaration" || m.type == "class") {
                        return template_fn(state, m, false) + ";";
                    } else
                        return template_fn(state, m, false);
                }).join("\n");

                return str;


                return template_fn(state, new_node);
            }
        }
    ]
};

const lu_table = new Map(cpp_mappings.mappings.map((i, j) => [i.type, j]));

cpp_mappings.type_lookup = (node, name) => lu_table.get(node.type) || -1;