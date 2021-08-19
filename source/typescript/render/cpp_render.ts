import { experimentalConstructRenderers } from "@candlelib/conflagrate";
import { render_mappings } from "@candlelib/js";
import { CompilableStruct, CompilableTypes } from "../types/compilable_nodes";
import { HCG3Grammar } from "../types/grammar_nodes";

export const duplicate = Object.assign({}, render_mappings);
duplicate.mappings = render_mappings.mappings.slice();
duplicate.mappings.push(
    {
        type: "VEC_CREATE",
        template: "\\vector @length",
    },
    {
        type: "VEC_JOIN",
        template: "\\vector @length",
    },
    {
        type: "STRING_CREATE",
        template: "\\string @length",
    },
    {
        type: "STRING_JOIN",
        template: "\\string @length",
    },
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
        custom_render: state => (state.node.stack_index > -1) ?
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
export const renderers = experimentalConstructRenderers(duplicate);


function buildCompilableStructs(processed_structs: CompilableStruct[], grammar: HCG3Grammar):
    string[] {

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
    for (const processed_class of processed_structs) {

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

    return cpp_classes;
}

export function getEnumTypeName(enum_name: string) {
    return `${enum_name}_enum`;
}


export function convertTypeToClassArg([k, b]: [string, CompilableTypes], i: number) {
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

export function convertTypeToPropInitializer([k, b]: [string, CompilableTypes], i: number) {
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

export function filterNullVals(i: any) {
    return !!i;
}

