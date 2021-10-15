import { experimentalRender, traverse } from "@candlelib/conflagrate";
import { exp, JSIdentifierReference, JSNodeType, JSObjectLiteral } from "@candlelib/js";
import { duplicate as cpp_duplicate, renderers as cpp_renderers } from "../../render/cpp_render.js";
import { BOOLType, CompilableStruct, DBLType, EnumType, ValType } from "../../types/compilable_nodes";
import { GrammarObject, HCG3ProductionBody } from "../../types/grammar_nodes";
import { addReduceFNStringToLUT } from "./process_js_code.js";

function parseAndRenderCPP(ast) { return experimentalRender(ast, cpp_duplicate, cpp_renderers).string; }

export function createCompilableCode(grammar: GrammarObject): void {
    // Reset the reduce_functions lookup to prepare the grammar for output
    // to Struct / Class formats. 


    grammar.reduce_functions = <Map<string, { id: number, data: any; }>>new Map();
    grammar.compiled = {
        structs: null,
        primary_enum: null
    };

    const class_types = [];

    //Create classes based on return values
    for (const production of grammar.productions) {

        // Store type information per production
        // this will be used later to assign types to
        // class members. 
        for (const body of production.bodies) {

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

                        const cpp_type = <any>convertObjectLiteralNodeToCPPClassNode(node, body);
                        mutate(cpp_type);
                        class_types.push(cpp_type);
                    } else {
                        if (node.type == JSNodeType.ArrayLiteral) {

                            //@ts-ignore
                            node.type = "cpp_ast_ref_vector";

                        } else if (node.type == JSNodeType.IdentifierReference) {
                            const val = JSIdentifierRefToCompilableVal(node, "", body);
                            if (val)
                                mutate(<any>val);
                        }
                    }
                }

                body.reduce_function.compilable_ast = receiver.ast;
            }
        }
    }

    //Merge class types that have the same enum
    grammar.compiled.structs = processStructs(class_types, grammar);

    convertBodyFunctionsToLambdas(grammar);
}


function convertBodyFunctionsToLambdas(grammar: GrammarObject) {

    for (const body of grammar.bodies) {

        const { reduce_function } = body;

        if (reduce_function) {

            const fn = `[](HYDROCARBON::ASTRef * stack, int len){return (${parseAndRenderCPP(reduce_function.compilable_ast)}); }`;

            body.reduce_id = addReduceFNStringToLUT(grammar, fn, reduce_function.compilable_ast);
        } else {
            body.reduce_id = -1;
        }
    }
}
function convertObjectLiteralNodeToCPPClassNode(obj_literal: JSObjectLiteral, body: HCG3ProductionBody) {

    const class_info: CompilableStruct = { type: "cpp_class_constructor", cardinal_name__: "", enums: {}, properties: {}, type_name: "" };

    const data = class_info.properties;


    for (const node of obj_literal.nodes) {

        if (node.type == JSNodeType.PropertyBinding) {

            const [key, val] = node.nodes;

            if (key.type == JSNodeType.ComputedProperty)
                throw new SyntaxError("Only Identifiers are allowed for CPP node keys");

            let cpp_class_member = data[key.value];

            if (!cpp_class_member)
                cpp_class_member = data[key.value] = <ValType>{
                    stack_index: -1,
                    type: null, index: -1, type_name: "", value: ""
                };

            switch (val.type) {

                case JSNodeType.NumericLiteral:
                    //Convert expression to a double value
                    data[key.value] = <DBLType>{
                        stack_index: -1,
                        type: "DOUBLE", index: -1, type_name: "", value: parseFloat(val.value) * (val.NEGATIVE ? -1 : 1)
                    };
                    break;

                case JSNodeType.BooleanLiteral:
                    data[key.value] = <BOOLType>{
                        stack_index: -1,
                        type: "BOOLEAN", index: -1, type_name: "", value: val.value
                    };
                    break;

                case JSNodeType.IdentifierReference:
                    const type = JSIdentifierRefToCompilableVal(val, key.value, body);
                    if (type) {
                        data[key.value] = type;
                        break;
                    }
                default:
                    throw new Error("Unable to convert type object literal type :" + node.pos.toString());

            }
        }
    }

    return class_info;
}
function JSIdentifierRefToCompilableVal(val: JSIdentifierReference, type_name: string, body: HCG3ProductionBody): void | EnumType | ValType {
    const ref = val.value;

    if (ref[0] == "$") {
        let converted_ref = ref.slice(1);

        if (converted_ref[0] == "$")
            converted_ref = ref.slice(2);

        if (converted_ref == "NULL") {
            return <ValType>{ type: "VAL", stack_index: -1, index: -1, type_name: "", value: "" };
        } else {
            const val = parseInt(converted_ref);

            if (isNaN(val)) {

                if (["vec_create", "vec_join", "string_create", "string_join"].includes(converted_ref)) {
                    //Produce Vector Type
                    return <ValType>{ type: converted_ref.toLocaleUpperCase(), length: body.length };
                }

                throw new Error("Unexpected non integer value from " + ref + " " + converted_ref);
            }

            let index = val - 1;

            if (index >= 100)
                index = body.sym.length - 1;

            return <ValType>{ type: "VAL", stack_index: index, index: -1, type_name: "", value: "" };
        }
    } else if (ref.slice(0, 6) == "enum__") {
        return <EnumType>{ type: "ENUM", type_name, default_val: ref.slice(6) };
    }
}


function processStructs(class_types: any[], grammar: GrammarObject): CompilableStruct[] {

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
    const processed_structs = [];

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

            processed_structs.push(cardinal_class);

        }
    }

    let i = 0;
    //Process remaining classes
    for (const class_type of class_types.filter(t => !existing.has(t))) {

        const { cardinal_class } = processClassInfo("Node" + i++, [class_type], grammar);

        processed_structs.push(cardinal_class);
    }

    return processed_structs;
}


function groupEnums(s) {

    const enum_keys = [];

    for (const key in s.properties) {

        const val = s.properties[key];

        if (val.type == "ENUM")
            enum_keys.push(key);
    }

    return enum_keys;
};


function processClassInfo(class_name: string, class_values: CompilableStruct[], grammar: GrammarObject) {

    const
        cardinal_class = { type: "class", cardinal_name__: class_name, properties: {} },
        key_vals = new Map;

    for (const class_value of class_values) {

        const { properties } = class_value;

        let i = 0;

        for (const key in properties) {

            if (!key_vals.has(key)) {

                key_vals.set(key, []);

                const index = properties[key].type == "ENUM" ? -1 : i++;

                cardinal_class.properties[key] = Object.assign({}, properties[key], { index });
            }
        }
    }

    for (const class_value of class_values) {
        for (const key in cardinal_class.properties) {
            const cardinal_val = cardinal_class.properties[key];

            if (!class_value.properties[key]) {
                class_value.properties[key] = Object.assign({}, cardinal_val, { index: -1, stack_index: -1 });
            } else {

                const
                    class_val = class_value.properties[key];

                if (class_val.type != cardinal_val.type) {
                    throw new Error(`Class type ${class_val.type} does not equal cardinal type ${cardinal_val.type}`);
                }

                class_val.index = cardinal_val.index;
            }
        }

        class_value.cardinal_name__ = class_name;
    }

    return { key_vals, cardinal_class };
}