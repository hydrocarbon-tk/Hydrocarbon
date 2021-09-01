import { copy, NodeMapping, NodeMappings } from "@candlelib/conflagrate";
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

export const rust_mappings: NodeMappings<SKNode, "type"> = <NodeMappings<SKNode, "type">>{
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


                if (node.reference.value == "this") {

                    const new_node = copy(node);

                    new_node.reference.value = "self";

                    return template_fn(state, new_node, false);
                }

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

                let val = node.value;

                if (val.includes("array_")) {
                    const [first, rest] = node.value.split("array_");

                    const [name, _rest] = rest.split("$");


                    node.value = (first ?? "") + `[${name}]` + (_rest ? "$" + _rest : "");
                    console.log({ val, first, rest, name, _rest, val1: node.value });
                }

                val = node.value;

                if (val.slice(0, 2) == "__") {
                    const parts = val.trim().slice(2).split("$");

                    const type_name = parts[0];

                    const name = template_fn(state, (sk`[c]a:${type_name}`).primitive_type, true);

                    if (parts.includes("ref")) {
                        return "&mut " + name;

                    } else if (parts.includes("ptr")) {

                        return `&${type_name}`;

                        return name + "*".repeat(parts.filter(d => d == "ptr").length);
                    }
                }

                return template_fn(state);
            }
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
            template: "@target o:s = {new: new m:s} o:s @expression"
        },
        <NodeMapping<SKIf>>{
            type: "if",
            child_keys: ["assertion", "expression", "else"],
            template: `if o:s @assertion {IS_BLOCKLESS: \\{ } i:s o:s @expression i:e {IS_BLOCKLESS: \\} } 
            
            {else: m:s  else  m:s \\{ i:s o:n o:n @else i:e o:n \\} } 
            
            {else_if: m:s else m:s @else_if }
            `,

            custom_render: (state, template_fn) => {
                const { node } = state;

                if (node.expression.type != "block") {
                    node.IS_BLOCKLESS = true;
                }

                //Add else

                if (node.else && node.else.type == "if") {
                    //@ts-ignore
                    node.else_if = node.else;
                    //@ts-ignore
                    node.else = null;
                    //@ts-ignore
                    const string = template_fn(state);
                    //@ts-ignore
                    node.else = node.else_if;
                    //@ts-ignore
                    node.else_if = null;
                    return string;
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
                        if (B.type == "operator" && B.val == "?") {
                            i += 2;

                            list.push("if ", A, "{", C, "} else {", template_fn(state, { type: "operator-expression", list: node.list.slice(i + 2) }), "}");
                            break;
                        } else if (A.type == "operator" && A.val == "****") {
                            list.push(Object.assign({}, A, { val: "delete " }), B);
                            i += 2;
                            continue;
                        } else if (A.type == "operator" && A.val == "%%%%") {
                            list.push(Object.assign({}, A, { val: "delete[] " }), B);
                            i += 2;
                            continue;
                        } else if (A.type == "operator" && A.val == "&>") {
                            list.push(B);
                            //list.push(Object.assign({}, A, { val: "&" }), B);

                            i += 2;
                            continue;
                        } else if (A.type == "operator" && A.val == "&>>") {
                            //list.push(B);
                            list.push(Object.assign({}, A, { val: "&" }), B);

                            i += 2;
                            continue;
                        } else if (A.type == "operator" && A.val == "*>") {
                            list.push(Object.assign({}, A, { val: "*" }), B);
                            i += 2;
                            continue;
                        } else if (A.type == "operator" && A.val == "?" && C?.type == "operator") {
                            i += 2;
                            list.push("if {", B, "} else {", C, "}");
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
            template: "{is_infinite : loop \or while m:s { assertion: @assertion? } }i:s m:s @expression i:e",
            custom_render: (state, template_fn) => {

                if (state.node.assertion.type == "boolean")
                    return template_fn(state, Object.assign({}, state.node, { is_infinite: true }));


                return template_fn(state);
            }
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
            template: "match \\( @match_expression \\) \\{ i:s o:n @matches...[o:n] i:e o:n \\}"
        },
        <NodeMapping<SKMatchTarget>>{
            type: "match-clause",
            child_keys: ["match", "expression"],
            template: "@match \\=> o:s o:n @expression",
            custom_render: (state, template_fn) => {

                const { node, indent } = state;

                const cases = [];

                if (node.match.type == "operator-expression") {

                    cases.push(...node.match.list.map(s => {
                        if (s.type == "operator")
                            return null;
                        if (s?.value?.trim() == "default")
                            return "_";
                        return `${template_fn(state, s)}`;


                    }).filter(s => s));
                } else if (node.match?.value.trim() == "default") {
                    cases.push(`_`);
                } else {
                    cases.push(`${template_fn(state, node.match)}`);
                }


                if (node.expression.type.trim() == "break") {
                    node.expression = "()";
                }

                const offset = " ".repeat(4 * indent);

                return `${cases.join(" | ")} => ${"\n" + offset}${template_fn(state, node.expression)},`;

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
            template: "let m:s @name {primitive_type: \\:  m:s @primitive_type} {initialization: o:s = o:s @initialization}",
            custom_render: parameterCustomRender
        },

        <NodeMapping<SKPrimitiveDeclaration>>{
            type: "parameter-declaration",
            child_keys: ["type", "primitive_type", "initialization"],
            template: "{mutable: \\mut m:s} @name {primitive_type: \\:  m:s @primitive_type} {initialization: o:s = o:s @initialization}",
            custom_render: parameterCustomRender
        },

        <NodeMapping<SKPrimitiveArgument>>{
            type: "argument",
            child_keys: ["type", "primitive_type", "initialization"],
            template: "@name : @primitive_type  {initialization: o:s = o:s @initialization}",
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
            template: "struct m:s @name \\{ o:n @prop_str i:e o:n \\} { fn_str : impl m:s @name \\{ @fn_str \\} }",
            custom_render: (state, template_fn) => {

                const new_node: SKClass = Object.assign({}, state.node);

                const props = new_node.members.filter(m => m.type == 'declaration');
                const methods = new_node.members.filter(m => m.type == "function");

                state.indent++;

                let prop_str = props.map(m => {
                    m.type = "parameter-declaration";
                    m.initialization = null;
                    return template_fn(state, m, false);
                }).join(",\n" + " ".repeat(Math.max(0, state.indent * 4)));

                let fn_str = methods.map(m => {

                    m = copy(m);

                    if (m.return_type.value == "destructor") {

                        m.name.value = "~" + new_node.name.value;

                        m.return_type.value = "";

                    } else if (m.name.value == new_node.name.value) {

                        m.name.value = "new";
                    }

                    m.type = "method";

                    return template_fn(state, m, false);
                }).join(",\n" + " ".repeat(Math.max(0, state.indent * 4)));

                state.indent--;
                //@ts-ignore
                new_node.prop_str = prop_str;
                new_node.fn_str = fn_str;

                return template_fn(state, new_node);

            }
        },
        <NodeMapping<SKMethod>>{
            type: "method",
            child_keys: ["name", "return_type", "parameters", "expressions"],
            template: "pub m:s fn m:s @name (  @a_self  @parameters...[,o:s] ) {return_type: \\-> @return_type } \\{ i:s o:n @expressions...[;o:n] \\; i:e o:n \\}",
            custom_render: (state, template_fn) => {

                let new_node: SKMethod = state.node;

                new_node.a_self = "";

                if (new_node.modifiers.includes("pub")) {
                    //@ts-ignore
                    new_node.pub = true;
                }

                if (new_node?.return_type?.value?.trim() == "void") {
                    new_node.return_type = null;
                }

                new_node.a_self = "&mut self, ";
                new_node.parameters = new_node.parameters.map(p => (p.type = "parameter-declaration", p));

                return template_fn(state, new_node);


            }
        },
        <NodeMapping<SKFunction>>{
            type: "function",
            child_keys: ["name", "return_type", "parameters", "expressions"],
            template: "{pub: \\pub m:s} fn m:s @name (@parameters...[,o:s]) {return_type: \\-> @return_type } \\{ i:s o:n @expressions...[;o:n] \\; i:e o:n \\}",

            custom_render: (state, template_fn) => {

                const new_node = copy(state.node);

                if (new_node?.return_type?.value?.trim() == "void") {
                    new_node.return_type = null;
                }

                if (new_node.modifiers.includes("pub")) {
                    new_node.pub = true;
                }

                new_node.parameters = new_node.parameters.map(p => (p.type = "parameter-declaration", p));


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
            template: "@statements...[o:n]",
            custom_render: (state, template_fn) => {

                const new_node: SKModule = Object.assign({}, state.node);
                let str = state.node.statements.map(m => {
                    if (m.type == "declaration")
                        return "static " + template_fn(state, m, false) + ";";
                    else if (m.type == "class") {
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

const lu_table = new Map(rust_mappings.mappings.map((i, j) => [i.type, j]));

rust_mappings.type_lookup = (node, name) => lu_table.get(node.type) || -1;

function parameterCustomRender(state, template_fn) {

    let node: SKPrimitiveDeclaration = copy(state.node);

    const name = template_fn(state, node.name, false);

    if (node.type == "parameter-declaration") {
        if (node.modifiers.includes("mut"))
            node.mutable = true;
    }

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
                        return type + "* " + name.trim() + "=" + `${type}[${template_fn(state, call.parameters[0], false)}]`;
                    //Single number indicates length of array. Use this to create new array
                    //Of the appropriate length with each member initialized to 0
                    return type + " " + name.trim() + `[${call.parameters[0].value}] = {0}`;


                } else if (call.parameters.length > 0 && call.parameters.every(e => e.type == "number")) {
                    return "const " + name.trim() + `: [${type}; ${call.parameters.length}] = [${call.parameters.map(p => p.value)}]`;

                } else if (call.parameters.length == 1) {

                    if (node.modifiers.includes("this_"))
                        return name.trim() + "=" + `${type}[${template_fn(state, call.parameters[0], false)}]`;


                    else
                        return type + " " + name.trim() + "=" + `[${template_fn(state, call.parameters[0], false)}]`;

                }
            } else {
                //Array will be a pointer
                return name.trim() + `: Vec<${type}>`;
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
};

