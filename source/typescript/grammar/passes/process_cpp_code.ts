import { experimentalConstructRenderers, experimentalRender, traverse } from "@candlelib/conflagrate";
import { exp, JSExpressionClass, JSIdentifierReference, JSNodeType, JSNodeTypeLU, JSObjectLiteral, render_mappings } from "@candlelib/js";
import { HCG3Grammar, HCG3ProductionBody } from "../../types/grammar_nodes";
import { addReduceFNStringToLUT } from "./process_js_code.js";

const duplicate = Object.assign({}, render_mappings);
duplicate.mappings = render_mappings.mappings.slice();
duplicate.mappings.push(
    {
        type: "ENUM",
        template: "@type_name \\_enum",
    },
    {
        type: "VAL",
        template: "",
        custom_render: state =>
            (state.node.stack_index > -1) ?
                `stack[${state.node.stack_index}]` : "0"
    },
    {
        type: "cpp_class_constructor",
        template: "ASTRef \\( \\new m:s \\class m:s @cardinal_name__ \\( @args...[\\,] \\) \\) ",
        custom_render(state, template_fn) {
            state.node.args = Object.entries(state.node.properties).map(([k, v]) => (v.name = k, v)).filter(v => v.type != "ENUM");

            return template_fn(state);
        }
    }, {
    type: "cpp_ast_ref_vector",
    template: "ASTRef \\:: vector \\(  @nodes...[\\, ] \\) ",
});
const lu_table = new Map(duplicate.mappings.map((i, j) => [i.type, j]));
duplicate.type_lookup = (node, name) => lu_table.get(node.type) || -1;

const renderers = experimentalConstructRenderers(duplicate);

function parseAndRender(ast) { return experimentalRender(ast, duplicate, renderers); }

interface CPPType {
    __type__: string;

    __p_id__: number;

    __b_id__: number;

    type_name: string;
}
interface CPPTokenClass extends CPPType {
    __type__: "class";
    enums: {
        [name in string]: EnumType;
    };

    properties: {
        [name in string]: CPPType;
    };
}
interface EnumType extends CPPType {
    __type__: "enum";

    group: string;

    value: string;
}

export function createCPPCode(grammar: HCG3Grammar): void {
    // Reset the reduce_functions lookup to prepare the grammar for output
    // to C++ format. 
    grammar.reduce_functions = <Map<string, number>>new Map();

    const class_types = [];

    const non_class_types = [];

    //Create classes based on return values
    for (const production of grammar.productions) {

        // Store type information per production
        // this will be used later to assign types to
        // class members. 
        for (const body of production.bodies) {

            const cpp_type: CPPType = { __type__: "undefined", __p_id__: production.id, __b_id__: body.id };

            if (body.reduce_function) {

                const fn = body.reduce_function;

                if (fn.type == "env-function-reference") {
                    // TODO - Reference reduce function in CPP output
                    continue;
                } else if (!fn.txt) {
                    body.reduce_function = null;
                    continue;
                }

                const expression = exp(`(${fn.txt.replace(/(\${1,2}\d+)/g, "$1_")})`).nodes[0];

                const receiver = { ast: null };

                for (const { node, meta: { mutate } } of traverse(expression, "nodes").makeMutable().extract(receiver)) {
                    //Object literals serve as the main AST node definition type. 
                    if (node.type == JSNodeType.ObjectLiteral) {
                        // CPP only accepts basic member types:
                        // PropertyBinding with identifiers keys
                        const cpp_type: CPPTokenClass = { type: "cpp_class_constructor", __type__: "class", __p_id__: production.id, __b_id__: body.id };
                        mutate(<any>convertObjectLiteralNodeToCPPClassNode(cpp_type, node, body));
                        class_types.push(cpp_type);
                    } else {
                        non_class_types.push(cpp_type);

                        if (node.type == JSNodeType.ArrayLiteral) {
                            node.type = "cpp_ast_ref_vector";
                        } else if (node.type == JSNodeType.IdentifierReference) {
                            mutate(JSIdentifierRefToCPPVal(node, "", body));
                        }
                    }
                }

                body.reduce_function.raw = receiver.ast;
            }
        }
    }

    //Merge class types that have the same enum
    const processed_classes = processClasses(class_types, grammar);

    buildCPPClasses(processed_classes, grammar);

    convertBodyFunctionsToLambdas(grammar);
}

function processClasses(class_types: any[], grammar: HCG3Grammar) {

    const enum_types = class_types.groupMap(groupEnums);

    let largest_enum_set = null, largest_enum_key = "", largest_enum_size = -1;

    // Extract the largest enum set and make this the basis class type
    for (const [key, val] of enum_types.entries()) {
        if (val.length > largest_enum_size) {
            largest_enum_key = key;
            largest_enum_size = val.length;
            largest_enum_set = val;
        }
    }

    const existing = new Set;
    const processed_classes = [];

    // Merge class types that have the same enum value from the largest 
    // enum set. 
    if (largest_enum_set) {

        for (const _class of largest_enum_set.values())
            existing.add(_class);
        const groups = largest_enum_set.groupMap(s => s.properties[largest_enum_key].default_val);

        grammar.enums = { name: largest_enum_key, keys: [] };

        for (const [key, class_values] of groups.entries()) {


            grammar.enums.keys.push(key);

            const { key_vals, cardinal_class } = processClassInfo(key, class_values, grammar);

            processed_classes.push(cardinal_class);
        }
    }

    let i = 0;
    //Process remaining classes
    for (const class_type of class_types.filter(t => !existing.has(t))) {

        const { cardinal_class } = processClassInfo("Node" + i++, [class_type], grammar);

        processed_classes.push(cardinal_class);
    }
    return processed_classes;
}

function convertBodyFunctionsToLambdas(grammar: HCG3Grammar) {
    for (const body of grammar.bodies) {
        const { reduce_function } = body;

        if (reduce_function) {
            const fn = `[](HYDROCARBON::ASTRef * stack, int len){return (${parseAndRender(reduce_function.raw)}); }`;

            console.log(fn);

            addReduceFNStringToLUT(body, grammar, fn);
        } else {
            addReduceFNStringToLUT(body, grammar);
        }
    }
}

function buildCPPClasses(processed_classes: any[], grammar: HCG3Grammar) {

    const cpp_classes = [];

    //Build classes
    for (const processed_class of processed_classes) {

        const { cardinal_name__ } = processed_class;

        const key_vals = Object.entries(processed_class.properties);

        const assigned_kv = key_vals.filter(([, b]) => b.type != "ENUM");

        const class_member_declaration = key_vals.map(([k, b]) => {
            if (b.type == "ENUM") {
                return `${b.type_name}_enum ${k} = ${b.type_name}_enum::${b.default_val};`;
            }

            else
                return `HYDROCARBON::ASTRef ${k} = 0;`;
        }).join("\n");

        let class_ = `class ${cardinal_name__} : public HYDROCARBON::Node { 
            public:
            ${class_member_declaration}    

        ${cardinal_name__}( ${assigned_kv.map(([k]) => `HYDROCARBON::ASTRef ${k}_`).join(",")} ) 
            : HYDROCARBON::Node(), ${assigned_kv.map(([k, b]) => `${k}(${k}_)`).join(",")} {}
        };`;

        cpp_classes.push(class_);
    }

    grammar.cpp_classes = cpp_classes;
}

function groupEnums(s) {

    const enum_keys = [];


    for (const key in s.properties) {

        const val = s.properties[key];

        if (val.__type__ == "enum")
            enum_keys.push(key);
    }

    return enum_keys;
};


function processClassInfo(class_name: string, class_values: CPPTokenClass[], grammar: HCG3Grammar) {

    const
        cardinal_class = { __type__: "class", cardinal_name__: class_name, properties: {} },
        key_vals = new Map;

    for (const class_value of class_values) {

        const { __b_id__, properties } = class_value;

        grammar.bodies[__b_id__].cpp_value = class_value;

        let i = 0;

        for (const key in properties) {

            if (!key_vals.has(key)) {

                key_vals.set(key, []);

                const index = properties[key].type == "ENUM" ? -1 : i++;

                cardinal_class.properties[key] = {
                    type: properties[key].type, index, type_name: (properties[key].type_name ?? "").toUpperCase(), default_val: properties[key].default_val
                };
            }
        }
    }

    for (const class_value of class_values) {
        for (const key in cardinal_class.properties) {

            if (!class_value.properties[key])
                class_value.properties[key] = { index: -1, stack_index: -1 };
            else
                class_value.properties[key] = Object.assign({
                    stack_index: class_value.properties[key].stack_index ?? -1
                }, cardinal_class.properties[key]);
        }

        class_value.__type__ = "class";

        class_value.cardinal_name__ = class_name;
    }


    return { key_vals, cardinal_class };
}

function convertObjectLiteralNodeToCPPClassNode(class_info: CPPTokenClass, obj_literal: JSObjectLiteral, body: HCG3ProductionBody) {

    class_info.__type__ = "class";

    const data = class_info.properties = {};

    for (const node of obj_literal.nodes) {

        if (node.type == JSNodeType.PropertyBinding) {

            const [key, val] = node.nodes;

            if (key.type == JSNodeType.ComputedProperty)
                throw new SyntaxError("Only Identifiers are allowed for CPP node keys");

            let cpp_class_member = data[key.value];

            if (!cpp_class_member)
                cpp_class_member = data[key.value] = {
                    stack_index: -1,
                    type: null
                };

            switch (val.type) {

                case JSNodeType.NumericLiteral:

                    break;

                case JSNodeType.NullLiteral:

                    break;

                case JSNodeType.BooleanLiteral:

                    break;

                case JSNodeType.BooleanLiteral:

                    break;

                case JSNodeType.IdentifierReference:
                    data[key.value] = JSIdentifierRefToCPPVal(val, key.value, body);
                    break;
                default:
                    throw new Error("Unable to convert type: " + JSNodeTypeLU[node.type] + " object object literal");

            }
        }
    }

    return class_info;
}
function JSIdentifierRefToCPPVal(val: JSIdentifierReference, type_name: string, body: HCG3ProductionBody) {
    const ref = val.value;

    if (ref[0] == "$") {
        let converted_ref = ref.slice(1);
        if (converted_ref[1] == "$")
            converted_ref = converted_ref.slice(1);

        if (converted_ref == "NULL") {
            return { type: "VAL", stack_index: -1, index: -1 };
        } else {
            const val = parseInt(converted_ref);

            if (isNaN(val))
                throw new Error("Unexpected non integer value");

            let index = val - 1;

            if (index >= 100)
                index = body.sym.length - 1;

            return { type: "VAL", stack_index: index, index: -1 };
        }
    } else if (ref.slice(0, 6) == "enum__") {
        return { type: "ENUM", type_name, default_val: ref.slice(6) };
    }
}
