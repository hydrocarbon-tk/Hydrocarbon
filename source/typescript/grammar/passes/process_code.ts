import { traverse } from "@candlelib/conflagrate";
import { exp, JSExpressionClass, JSIdentifierReference, JSNodeClass, JSNodeType, JSNodeTypeLU, JSObjectLiteral, renderCompressed } from "@candlelib/js";
import { HCG3Grammar, HCG3Production, HCG3ProductionBody } from "../../types/grammar_nodes";

interface CPPType {
    __type__: string;

    __p_id__: number;

    __b_id__: number;

    type_name: string;
}

interface CPPTokenClass extends CPPType {
    __type__: "class";
    enums: {
        [name in string]: EnumType
    };
}

interface EnumType extends CPPType {
    __type__: "enum";

    group: string;

    value: string;
}

export function createCPPCode(grammar: HCG3Grammar) {
    // Reset the reduce_functions lookup to prepare the grammar for output
    // to C++ format. 
    grammar.reduce_functions = <Map<string, number>>new Map();

    const class_types = [];

    const non_class_types = [];
    const production_values = new Map(grammar.productions.map(p => [p.name, []]));

    //Create classes based on return values
    for (const production of grammar.productions) {

        // Store type information per production
        // this will be used later to assign types to
        // class members. 

        for (const body of production.bodies) {

            const cpp_type: CPPType = { __type__: "undefined", __p_id__: production.id, __b_id__: body.id };

            let i = 0;

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

                //Object literals serve as the main AST node definition type. 

                if (expression.type == JSNodeType.ObjectLiteral) {
                    // CPP only accepts basic member types:
                    // PropertyBinding with identifiers keys
                    convertObjectLiteralToClassInfo(<any>cpp_type, expression, body);
                    class_types.push(cpp_type);
                } else {
                    non_class_types.push(cpp_type);
                    convertExpressionToCPPInfo(cpp_type, expression, body);
                }
            }
            i++;
        }
    }

    //Merge class types that have the same enum
    const enum_types = class_types.groupMap(s => {

        const enum_keys = [];

        for (const key in s) {

            const val = s[key];

            if (val.__type__ == "enum")
                enum_keys.push(key);
        }

        return enum_keys;
    });

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
        const groups = largest_enum_set.groupMap(s => s[largest_enum_key].default_val);

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

    const cpp_classes = [];

    //Build classes
    for (const processed_class of processed_classes) {

        const { __cardinal_name__ } = processed_class;
        const key_vals = Object.entries(processed_class).filter(([key]) => !Key_Is_Internal(key));

        const assigned_kv = key_vals.filter(([, b]) => b.type != "ENUM");

        const class_member_declaration = key_vals.map(([k, b]) => {
            if (b.type == "ENUM") {
                return `${b.type_name}_enum ${k} = ${b.type_name}_enum::${b.default_val};`;
            } else
                return `HYDROCARBON::ASTRef ${k} = 0;`;
        }).join("\n");

        let class_ = `class ${__cardinal_name__} : public HYDROCARBON::Node { 
            public:
            ${class_member_declaration}    

        ${__cardinal_name__}( ${assigned_kv.map(([k]) => `HYDROCARBON::ASTRef ${k}_`).join(",")} ) 
            : HYDROCARBON::Node(), ${assigned_kv.map(([k, b]) => `${k}(${k}_)`).join(",")} {}
        };`;

        cpp_classes.push(class_);

        console.log(class_);
    }

    grammar.cpp_classes = cpp_classes;

    //Convert body functions to lambdas

    for (const body of grammar.bodies) {
        const { cpp_value, id } = body;

        if (cpp_value) {
            if (cpp_value.__type__ == "class") {

                const { __cardinal_name__ } = cpp_value;

                console.log(cpp_value);

                const key_vals = Object.entries(cpp_value).filter(([key]) => !Key_Is_Internal(key));
                const args = key_vals.filter(([, v]) => v.index >= 0).sort((a, b) => a[1].index - b[1].index).map(([k, v]) => v.stack_index >= 0 ? `stack[${v.stack_index}]` : "0");

                const fn = `[](HYDROCARBON::ASTRef * stack, int len){return HYDROCARBON::ASTRef(new class ${__cardinal_name__} (${args.join(",")})); }`;

                addReduceFNStringToLUT(body, grammar, fn);
            } else {
                //TODO - Allow parsing of expressions. 
                addReduceFNStringToLUT(body, grammar);
            }
        } else {
            addReduceFNStringToLUT(body, grammar);
        }
    }
}

function processClassInfo(class_name: string, class_values: CPPType[], grammar: HCG3Grammar) {
    const cardinal_class = { __type__: "class", __cardinal_name__: class_name };

    const key_vals = new Map;

    for (const class_value of class_values) {

        const { __b_id__ } = class_value;

        grammar.bodies[__b_id__].cpp_value = class_value;

        let i = 0;

        for (const key in class_value) {

            if (Key_Is_Internal(key))
                continue;
            if (!key_vals.has(key)) {

                key_vals.set(key, []);

                const index = class_value[key].__type__ == "enum" ? -1 : i++;

                cardinal_class[key] = {
                    type: {
                        node: "VAL",
                        class: "VAL",
                        enum: "ENUM"
                    }[class_value[key].__type__] ?? "VAL", index, type_name: (class_value[key].type_name ?? "").toUpperCase(), default_val: class_value[key].default_val
                };
            } else {

            }
        }
    }

    for (const class_value of class_values) {
        for (const key in cardinal_class) {
            if (Key_Is_Internal(key))
                continue;

            if (!class_value[key])
                class_value[key] = { index: -1, stack_index: -1 };
            else
                class_value[key] = Object.assign({ stack_index: class_value[key].stack_index ?? -1 }, cardinal_class[key]);


        }
        class_value.__type__ = "class";
        class_value.__cardinal_name__ = class_name;
    }


    return { key_vals, cardinal_class };
}

function Key_Is_Internal(key: string) {
    return key.slice(0, 2) == "__" && key.slice(-2) == "__";
}

function convertExpressionToCPPInfo(cpp_info: CPPType, expression: JSExpressionClass, body: HCG3ProductionBody) {
    if (expression.type == JSNodeType.ArrayLiteral) {
        const [val] = expression.nodes;

        cpp_info.__type__ = "vector_initializer";

        if (val.type == JSNodeType.IdentifierReference) {
            cpp_info.vector_type = JSIdentifierRefToCPPVal(val, "", body);
        }
    }
}

function convertObjectLiteralToClassInfo(class_info: CPPTokenClass, obj_literal: JSObjectLiteral, body: HCG3ProductionBody) {

    class_info.__type__ = "class";

    for (const node of obj_literal.nodes) {

        if (node.type == JSNodeType.PropertyBinding) {

            const [key, val] = node.nodes;

            if (key.type == JSNodeType.ComputedProperty)
                throw new SyntaxError("Only Identifiers are allowed for CPP node keys");

            let cpp_class_member = class_info[key.value];

            if (!cpp_class_member)
                cpp_class_member = class_info[key.value] = {
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

                    class_info[key.value] = JSIdentifierRefToCPPVal(val, key.value, body);
                    break;
                default:
                    throw new Error("Unable to convert type: " + JSNodeTypeLU[node.type] + " object object literal");

            }
        }
    }
}

function JSIdentifierRefToCPPVal(val: JSIdentifierReference, type_name: string, body: HCG3ProductionBody) {
    const ref = val.value;

    if (ref[0] == "$") {
        let converted_ref = ref.slice(1);
        if (converted_ref[1] == "$")
            converted_ref = converted_ref.slice(1);

        if (converted_ref == "NULL") {
            return { __type__: "class", stack_index: -1, type: null };
        } else {
            const val = parseInt(converted_ref);

            if (isNaN(val))
                throw new Error("Unexpected non integer value");
            return { __type__: "class", stack_index: val - 1, hcg_types: [body.sym[val - 1]] };
        }
    } else if (ref.slice(0, 6) == "enum__") {
        return { __type__: "enum", type_name, default_val: ref.slice(6) };
    }
}

export function createJSFunctionsFromExpressions(grammar: HCG3Grammar, error) {
    // Reset the reduce_functions lookup to prepare the grammar for output
    // to JavaScript/TypeScript format. 
    grammar.reduce_functions = <Map<string, number>>new Map();

    for (const production of grammar.productions) {

        for (const body of production.bodies) {

            if (body.reduce_function) {

                const fn = body.reduce_function;


                if (fn.type == "env-function-reference") {
                    fn.js = `(env, sym, pos)=> env.functions.${fn.ref} (env, sym, pos)`;
                    continue;
                } else if (!fn.txt) {
                    body.reduce_function = null;
                    continue;
                }

                const expression = exp(`(${fn.txt.replace(/(\${1,2}\d+)/g, "$1_")})`);

                const receiver = { ast: null };

                for (const { node, meta: { replace } } of traverse(expression, "nodes")
                    .bitFilter("type", JSNodeClass.IDENTIFIER)
                    .makeReplaceable((
                        parent,
                        child,
                        child_index,
                        children,
                        replaceParent
                    ) => {
                        if (child == null) {
                            if ((parent.type &
                                (
                                    JSNodeClass.UNARY_EXPRESSION
                                    | JSNodeClass.TERNARY_EXPRESSION
                                )
                            )
                                || parent.type == JSNodeType.AssignmentExpression
                                || parent.type == JSNodeType.PropertyBinding
                                || parent.type == JSNodeType.VariableStatement
                                || parent.type == JSNodeType.BindingExpression
                                || parent.type == JSNodeType.MemberExpression
                                || parent.type == JSNodeType.SpreadExpression
                                || parent.type == JSNodeType.Parenthesized
                                || parent.type == JSNodeType.ExpressionStatement)
                                return null;

                            if (parent.type == JSNodeType.Arguments && children.length <= 1) {
                                replaceParent();
                                return null;
                            }

                            if (parent.type == JSNodeType.CallExpression) {
                                return null;
                            }

                            if (parent.type == JSNodeType.ExpressionList
                                && child_index == 0
                                && children.length <= 1) {
                                return null;
                            }

                            if (parent.type & JSNodeClass.BINARY_EXPRESSION) {
                                replaceParent();
                                return children[1 - child_index];
                            }
                        }

                        return parent ? Object.assign({}, parent) : null;
                    })
                    .extract(receiver)) {


                    const
                        value = <string>node.value,
                        IS_REPLACE_SYM = value.slice(0, 1) == "$",
                        IS_NULLIFY_SYM = value.slice(0, 2) == "$$";


                    if (IS_NULLIFY_SYM || IS_REPLACE_SYM) {

                        let index = parseInt(
                            IS_NULLIFY_SYM ?
                                value.slice(2) :
                                value.slice(1)
                        ) - 1;

                        if (value == "$NULL" || value == "$$NULL") {

                            if (IS_NULLIFY_SYM)
                                replace(exp("null"));

                            else
                                replace(null, true);

                        } else {
                            if (index >= 100)
                                index = body.sym.length - 1;
                            replace(exp(`sym[${index}]`));
                        }
                    }
                }

                const js = renderCompressed(receiver.ast);

                if (!js) {
                    addReduceFNStringToLUT(body, grammar);
                    body.reduce_function = null;
                } else {
                    addReduceFNStringToLUT(body, grammar, `(env, sym, pos)=> ${js} `);
                }
            }
        }
    }
}

function addReduceFNStringToLUT(body: HCG3ProductionBody, grammar: HCG3Grammar, txt: string = null) {
    if (txt) {

        if (!grammar.reduce_functions.has(txt))
            grammar.reduce_functions.set(txt, grammar.reduce_functions.size);

        body.reduce_id = grammar.reduce_functions.get(txt);

    }
    else
        body.reduce_id = -1;
}
