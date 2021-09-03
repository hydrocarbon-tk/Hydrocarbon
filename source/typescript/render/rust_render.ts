import { copy, experimentalConstructRenderers, experimentalRender, filter, NodeMapping } from "@candlelib/conflagrate";
import { render_mappings } from "@candlelib/js";
import { CompilableStruct } from "../types/compilable_nodes";
import { GrammarObject } from "../types/grammar_nodes";
import { getEnumTypeName } from "./cpp_render.js";


const enum_name = "TypeEnum";
export const duplicate = Object.assign({}, render_mappings);
duplicate.mappings = render_mappings.mappings.slice();
duplicate.mappings.push(
    {
        type: "VEC_CREATE",
        custom_render: state => {
            const { length } = state.node;
            return `Box::new(ASTRef::VECTOR(vec![stack.remove(${length - 1})]))`;

        }
    },
    {
        type: "VEC_JOIN",
        custom_render: state => {
            const { length } = state.node;
            return `
                let node = stack.remove(${length - 1});
                let mut vec = stack.remove(0);

                if let ASTRef::VECTOR(ref mut vector) = vec.as_mut() {
                    vector.push(node);
                }

                vec
            `;
        }
    },
    {
        type: "STRING_CREATE",
        custom_render: state => {
            const { length } = state.node;
            return `let node = stack.remove${length - 1};`;
        }
    },
    {
        type: "STRING_JOIN",
        custom_render: state => {
            const { length } = state.node;
            return `let node = stack.remove${length - 1};`;
        }
    },
    {
        type: "ENUM",
        template: "@type_name \\_enum",
    },
    {
        type: "DOUBLE",
        custom_render: state => {
            const { name, value, stack_index } = state.node;

            if (!name) {
                return `${value}`;
            } else {
                return `let ${name}: f64 = ${value} as f64`;
            }
        }
    },

    {
        type: "VAL",
        template: "",
        custom_render: state => {
            const { name, stack_index } = state.node;

            if (!name) {
                return `stack.remove(${stack_index})`;
            } if (stack_index > -1) {
                return `let ${name} = stack.remove(0)`;
            } else {
                return `let ${name} = Box::new(ASTRef::NONE)`;

            }
        }
    },
    <NodeMapping<CompilableStruct>>{
        type: "cpp_class_constructor",
        template: `i:s o:n @args...[\\; o:n] \\; m:s o:n Box::new(ASTRef::NODE(${enum_name}::@cardinal_name__(@cardinal_name__ \\{ @arg_names...[\\,] \\} \\))) o:n i:e`,

        custom_render(state, template_fn) {

            const out_props = Object.entries(state.node.properties).map(([k, v]) => (v.name = k, v)).filter(v => v.type != "ENUM");


            state.node.args = out_props;

            state.node.arg_names = out_props.map(v => v.name);

            return template_fn(state);
        }
    }, {
    type: "cpp_ast_ref_vector",
    template: "ASTRef \\:: vector \\(  @nodes...[\\, ] \\) ",
});
const lu_table = new Map(duplicate.mappings.map((i, j) => [i.type, j]));
duplicate.type_lookup = (node, name) => lu_table.get(node.type) || -1;
export const renderers = experimentalConstructRenderers(duplicate);


export function buildCompilableStructs(grammar: GrammarObject):
    string[] {

    const processed_structs: CompilableStruct[] = grammar.compiled.structs;

    const struct_strings = [];

    let base_enum_type = "";

    if (grammar.enums) {
        const name = grammar.enums.name;
        base_enum_type = getEnumTypeName(name);
    }

    //Build classes
    for (const processed_class of processed_structs) {

        const

            { cardinal_name__ } = processed_class,

            key_vals = Object.entries(processed_class.properties),

            class_member_declaration = key_vals.map(([k, b]) => {
                switch (b.type) {
                    case "DOUBLE":
                        return `${k}:f64`;
                    case "ENUM":
                        const enum_type = getEnumTypeName(b.type_name);
                        if (enum_type != base_enum_type)
                            return `${k}:${enum_type}`;
                        else { return ""; }
                    case "VAL":
                        return `${k}:BoxedNodeRef`;
                }

            }).filter(i => !!i).join(",\n            ");

        let struct = `pub struct ${cardinal_name__}  { 
            ${class_member_declaration}
        }`;

        struct_strings.push(struct);
    }

    return struct_strings;
}

function parseAndRenderCPP(ast) { return experimentalRender(ast, duplicate, renderers); }

export function renderRustFunctionLUArray(grammar: GrammarObject): string {

    const reduce_functions_str = [...grammar.reduce_functions.values()].map(({ data }) => {
        const fn = `|mut stack: Vec<BoxedNodeRef>, body_len: u32| -> BoxedNodeRef{ ${parseAndRenderCPP(data)} }`;
        return fn;
    }).join(",\n");

    return `static reduce_functions : [ReduceFunction<TypeEnum>; ${grammar.reduce_functions.size + 1}] = [\n|mut data: Vec<BoxedNodeRef>, body_len: u32| -> BoxedNodeRef { data.remove(data.len() - 1) },\n${reduce_functions_str}]`;
}
export function createRustEnumList(grammar: GrammarObject) {
    const list_contents = grammar
        .compiled.structs
        .map(({ cardinal_name__ }) => `${cardinal_name__}(${cardinal_name__})`)
        .join(",\n");

    return `pub enum ${enum_name} { ${list_contents} }`;
}
