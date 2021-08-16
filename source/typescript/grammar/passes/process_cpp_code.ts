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
        type: "DOUBLE",
        template: "@value",
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
        template: "ASTRef \\( \\new m:s @cardinal_name__ \\( @args...[\\,] \\) \\) ",
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

interface CPPTokenClass {
    type: string;
    type_name: string;
    cardinal_name__: string;
    enums: {
        [name in string]: EnumType;
    };

    properties: {
        [name in string]: CPPTypes;
    };
}
interface CPPType {
    type: string;
    type_name: string;
    index: number;
}

interface EnumType extends CPPType {
    type: "ENUM";

    group: string;

    value: string;

    default_val: string;
}

interface ValType extends CPPType {

    type: "VAL";

    value: string;
}
interface DBLType extends CPPType {
    type: "DOUBLE";
    value: number;
}


interface BOOLType extends CPPType {
    type: "BOOLEAN";
    value: boolean;
}

type CPPTypes = ValType | EnumType | DBLType | BOOLType;

export function createCPPCode(grammar: HCG3Grammar): void {
    // Reset the reduce_functions lookup to prepare the grammar for output
    // to C++ format. 
    grammar.reduce_functions = <Map<string, number>>new Map();
    grammar.cpp = {
        classes: null,
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
                            const val = JSIdentifierRefToCPPVal(node, "", body);
                            if (val)
                                mutate(<any>val);
                        }
                    }
                }

                body.reduce_function.raw = receiver.ast;
            }
        }
    }

    //Merge class types that have the same enum
    const { processed_classes } = processClasses(class_types, grammar);

    buildCPPClasses(processed_classes, grammar);

    convertBodyFunctionsToLambdas(grammar);
}

function convertObjectLiteralNodeToCPPClassNode(obj_literal: JSObjectLiteral, body: HCG3ProductionBody) {

    const class_info: CPPTokenClass = { type: "cpp_class_constructor", cardinal_name__: "", enums: {}, properties: {}, type_name: "" };

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
                    const type = JSIdentifierRefToCPPVal(val, key.value, body);
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
function JSIdentifierRefToCPPVal(val: JSIdentifierReference, type_name: string, body: HCG3ProductionBody): void | EnumType | ValType {
    const ref = val.value;

    if (ref[0] == "$") {
        let converted_ref = ref.slice(1);

        if (converted_ref[0] == "$")
            converted_ref = ref.slice(2);

        if (converted_ref == "NULL") {
            return <ValType>{ type: "VAL", stack_index: -1, index: -1, type_name: "", value: "" };
        } else {
            const val = parseInt(converted_ref);

            if (isNaN(val))
                throw new Error("Unexpected non integer value from " + ref + " " + converted_ref);

            let index = val - 1;

            if (index >= 100)
                index = body.sym.length - 1;

            return <ValType>{ type: "VAL", stack_index: index, index: -1, type_name: "", value: "" };
        }
    } else if (ref.slice(0, 6) == "enum__") {
        return <EnumType>{ type: "ENUM", type_name, default_val: ref.slice(6) };
    }
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
    return { processed_classes, largest_enum_key };
}

function convertBodyFunctionsToLambdas(grammar: HCG3Grammar) {

    for (const body of grammar.bodies) {

        const { reduce_function } = body;

        if (reduce_function) {

            const fn = `[](HYDROCARBON::ASTRef * stack, int len){return (${parseAndRender(reduce_function.raw)}); }`;

            addReduceFNStringToLUT(body, grammar, fn);
        } else {

            addReduceFNStringToLUT(body, grammar);
        }
    }
}

export function getEnumTypeName(enum_name: string) {
    return `${enum_name}_enum`;
}

function buildCPPClasses(processed_classes: CPPTokenClass[], grammar: HCG3Grammar) {

    const cpp_classes = [];

    let base_enum_type = "";

    if (grammar.enums) {
        const name = grammar.enums.name;
        base_enum_type = getEnumTypeName(name);
        cpp_classes.push(
            `
class BASE : public HYDROCARBON::NODE{
    public:
    const ${base_enum_type} ${name} = ${base_enum_type}::UNDEFINED;

    BASE(${base_enum_type} ${name}_) : HYDROCARBON::NODE(), ${name}(${name}_){}
}`
        );
    }

    //Build classes
    for (const processed_class of processed_classes) {

        let base_enum_name = "";

        const

            { cardinal_name__ } = processed_class,

            key_vals = Object.entries(processed_class.properties),

            class_member_declaration = key_vals.map(([k, b]) => {
                switch (b.type) {
                    case "DOUBLE":
                        return `double ${k} = ${b.value};`;
                    case "ENUM":
                        const enum_type = getEnumTypeName(b.type_name);
                        if (enum_type != base_enum_type)
                            return `${enum_type} ${k} = ${getEnumTypeName(b.type_name)}::${b.default_val};`;
                        else {
                            base_enum_name = b.default_val;
                            return "";
                        }
                    case "VAL":
                        return `HYDROCARBON::ASTRef ${k} = 0;`;
                }

            }).join("\n");

        let class_ = `class ${cardinal_name__} : public BASE { 
            public:
            ${class_member_declaration}    

            ${cardinal_name__}( ${key_vals.map(convertTypeToClassArg).filter(filterNullVals).join(",")} ) 
            : ${base_enum_type ? `BASE(${base_enum_type}::${base_enum_name})` : `HYDROCARBON::NODE()`}, ${key_vals.map(convertTypeToPropInitializer).filter(filterNullVals).join(",")} {}
        }`;

        cpp_classes.push(class_);
    }

    grammar.cpp.classes = cpp_classes;
}

function convertTypeToClassArg([k, b]: [string, CPPTypes], i: number) {
    switch (b.type) {
        case "BOOLEAN":
            return `bool bool_${i}`;
        case "DOUBLE":
            return `double double_${i}`;
        case "VAL":
            return `HYDROCARBON::ASTRef ${k}_`;
    }
    return "";
}

function convertTypeToPropInitializer([k, b]: [string, CPPTypes], i: number) {
    switch (b.type) {
        case "BOOLEAN":
            return `${k}(bool_${i})`;
        case "DOUBLE":
            return `${k}(double_${i})`;
        case "VAL":
            return `${k}(${k}_)`;
    }
    return "";
}

function filterNullVals(i: any) {
    return !!i;
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


function processClassInfo(class_name: string, class_values: CPPTokenClass[], grammar: HCG3Grammar) {

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