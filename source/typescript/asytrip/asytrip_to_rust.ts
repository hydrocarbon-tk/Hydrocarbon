import { GrammarObject } from '../types/grammar_nodes';
import {
    getResolvedType,
    JSONFilter,
    TypeIsDouble,
    TypeIsNotNull,
    TypeIsNull,
    TypeIsString,
    TypeIsStruct,
    TypeIsToken,
    TypeIsVector,
    TypesAre,
    TypesInclude,
    TypesRequiresDynamic
} from './common.js';
import { generateResolvedProps } from './generate_resolved_props.js';
import { Inits } from './Inits.js';
import { ASYTRIPContext, ASYTRIPType, ASYTRIPTypeObj, ResolvedProp } from './types.js';

const type_mapper = new Map();
const expr_mapper = new Map();

function addExpressMap<T extends keyof ASYTRIPTypeObj>(
    name: T,
    fn: (v: ASYTRIPTypeObj[T], c: ASYTRIPContext, inits: Inits) => string
) { expr_mapper.set(name, fn); }

function addTypeMap<T extends keyof ASYTRIPTypeObj>(
    name: T,
    fn: (v: ASYTRIPTypeObj[T], c: ASYTRIPContext) => string
) { type_mapper.set(name, fn); }

export function getTypeString<T extends keyof ASYTRIPTypeObj>(
    v: ASYTRIPTypeObj[T],
    c: ASYTRIPContext
): string {

    if (!v) debugger;

    if (!type_mapper.has(v.type))
        throw new Error(`Cannot get type string mapper for ${ASYTRIPType[v.type]}`);

    return type_mapper.get(v.type)(v, c);
}

function typeToExpression<T extends keyof ASYTRIPTypeObj>(
    v: ASYTRIPTypeObj[T],
    c: ASYTRIPContext,
    inits: Inits
): string {

    if (!expr_mapper.has(v.type))
        throw new Error(`Cannot expression mapper for ${ASYTRIPType[v.type]}`);

    return expr_mapper.get(v.type)(v, c, inits);
}

function convertValToString(v, t) {
    if (TypeIsString(t))
        return `(HCGObjDouble{Val:${v}}).String()`;
    return `&(${v}).String()`;
};
function convertValToDouble(v, t) {
    if (TypeIsString(t))
        return `(HCGObjString{Val:${v}}).Double()`;
    return `(${v}).Double()`;
};

function convertArgsToType(
    c: ASYTRIPContext,
    inits: Inits,
    check: (t: any) => boolean,
    convert: (a: string, t: ASYTRIPTypeObj[ASYTRIPType]) => string
): (val: ASYTRIPTypeObj[ASYTRIPType]) => string {
    return v => {
        const val = typeToExpression(v, c, inits);
        const type = getResolvedType(v, c)[0];
        if (!check(type))
            return convert(val, type);
        return val;
    };
}

function GenerateTypeString(
    context: ASYTRIPContext,
    real_types: ASYTRIPTypeObj[ASYTRIPType][],
    HAS_NULL: boolean,
    REQUIRES_DYNAMIC: boolean,
    HAVE_STRUCT: boolean,
    HAVE_STRUCT_VECTORS: boolean
): string {
    let type = real_types[0];

    let type_string = "HCO";

    if (TypesAre(real_types, TypeIsStruct)) {
        if (real_types.length > 1)
            type_string = "ASTNode";
        else if (type) {
            type_string = getTypeString(type, context);
            if (HAS_NULL)
                type_string = `Option<${type_string}>`;
        }
    } else if (REQUIRES_DYNAMIC) {
        type_string = "HCO";
    } else if (TypesAre(real_types, TypeIsVector)) {
        type_string = getTypeString(real_types[0], context);
    } else if (type)
        type_string = getTypeString(type, context);

    else
        type_string = "HCNode";

    return type_string;
}

export function createRustTypes(grammar: GrammarObject, context: ASYTRIPContext) {

    const structs = [...context.structs];
    //Imports for you file

    const resolved_struct_types: Map<string, Map<string, ResolvedProp>> = new Map();

    const strings = [
        //Header ------------------------------------------------------------------------
        `
use std::cell::UnsafeCell;

use candlelib_hydrocarbon::ast::{HCObj, HCObjTrait, ReduceFunction};

use candlelib_hydrocarbon::Token;

type RF = ReduceFunction<ASTNode>;

type HCO = HCObj<ASTNode>;`
    ];

    //Classes ------------------------------------------------------------------------
    for (const class_ of [...context.class.keys()]) {
        const nodes = structs.filter(([, s]) => s.classes.has(class_));

        const class_type = `
enum ${class_}{   
    ${nodes.map(([name, value]) => {
            return `${name}(Box<${name}>)`;
        }).join(",\n")} \n}
`;

        strings.push(class_type);
    }

    strings.push(
        //ASTNode ------------------------------------------------------------------------
        `
#[derive(Debug, Clone)]
pub enum ASTNode {NONE,${structs.map(([name, value]) => {
            return `${name}(Box<${name}>)`;
        }).join(",\n")} \n}
    
impl HCObjTrait for ASTNode {
    fn String(&self) -> String {
        use ASTNode::*;
        match self {
            ROOT(bx) => bx.tok.String(),
            MIN(bx) => bx.tok.String(),

            _ => String::from(""),
        }
    }
}`,
        //Iterator ------------------------------------------------------------------------
        `

#[derive(Debug)]
pub enum NodeIteration<'a> {
    NONE,
    STOP,
    CONTINUE,
    REPLACE(ASTNode),
    ${structs.map(([name, value]) => {
            return `${name}(&'a mut ${name})`;
        }).join(",\n")}
}

impl<'a> NodeIteration<'a> {
    pub fn name(&self) -> &str {
        use NodeIteration::*;
        match self {
            STOP => "stop",
            ${structs.map(([n, s]) => `
                ${n}(_0) => {
                    "node-${n}"
                }`)}
            REPLACE(node) => "replace",
            _ => "unknown",
        }
    }
}

pub trait ASTNodeTraits<'a>
where
    Self: Sized,
{
    fn iterate(
        self: &'a mut Box<Self>,
        _yield: &'a mut impl FnMut(&mut NodeIteration<'a>, &mut NodeIteration<'a>) -> NodeIteration<'a>,
    ) {
        let mut closure = |a: &mut NodeIteration<'a>, b: &mut NodeIteration<'a>, ty:u32, c: i32, d: i32| {
            use NodeIteration::*;
            match _yield(a, b) {
                STOP => false,
                REPLACE(node) => match b {
                    ${structs.map(([n, s]) => `
                    ${n}(par) => {
                        par.Replace(node, c, d);
                        true
                    }`)
        }
                    _ => true,
                },
                _ => true,
            }
        };

        self.Iterate(&mut closure, &mut NodeIteration::NONE, 0, 0)
    }
    fn Replace(&mut self, node: ASTNode, i: i32, j: i32) -> ASTNode {
        ASTNode::NONE
    }
    fn Iterate(
        self: &'a mut Box<Self>,
        _yield: &mut impl FnMut(&mut NodeIteration<'a>, &mut NodeIteration<'a>,u32, i32, i32) -> bool,
        parent: &mut NodeIteration<'a>,
        i: i32,
        j: i32,
    );
    fn Token(&self) -> Token;
    fn Type() -> u32;
    fn GetType(&self) -> u32;
}
`);


    //Structs ------------------------------------------------------------------------
    for (const [struct_name, struct] of context.structs) {
        const prop_vals = generateResolvedProps(struct,
            context,
            resolved_struct_types,
            getTypeString,
            GenerateTypeString
        );

        let i = 0;
        const struct_strings = [`

#[derive(Debug, Clone)]
pub struct ${struct_name} {
    pub tok:Token,
    ${prop_vals.map(({ name: n, type: v }) => `pub ${n}:${v}`).join(",\n")}
}

/* impl Drop for ${struct_name} {
    fn drop(&mut self) {
        println!("DROPPED ${struct_name}");
    }
}
 */
impl ${struct_name} {
fn new( tok: Token, ${prop_vals.map(({ name: n, type: v }) => `_${n}:${v}`).join(", ")}) -> Box<Self> {
    Box::new(${struct_name}{
        tok: tok,
        ${prop_vals.map(({ name: n }) => {
            return `${n} : _${n}`;
        }).map(s => s + ",").join("\n        ")}
    })
}

${prop_vals.flatMap(({ name: prop_name, type: v, types, prop: p, HAS_NULL }, j) => {
            const HAVE_STRUCT = TypesInclude(types, TypeIsStruct);
            const HAVE_STRUCT_VECTORS = types.filter(TypeIsVector).some(v => TypesInclude(v.types, TypeIsStruct));
            const ifs = [];

            let out_type = "ASTNode";

            if (HAVE_STRUCT || HAVE_STRUCT_VECTORS) {

                if (HAVE_STRUCT) {
                    const structs = types.filter(TypeIsStruct);
                    if (structs.length > 1) {
                        ifs.push([
                            `
    match &child {
        ASTNode::NONE => {
            let old = std::mem::replace(&mut self.${prop_name}, ASTNode::NONE);
            return Some(old);
        }
        ${structs.map(({ name }) => `
        ASTNode::${name}(_child) => { 
            return Some(std::mem::replace(&mut self.${prop_name}, child));
        }`).join(",\n")}
        _ => None
        
    }`
                        ].join("\n"));
                    } else if (TypesRequiresDynamic(types)) {
                        out_type = "HCO";
                        ifs.push([
                            `
    match child {
        ASTNode::NONE => {
            let old = std::mem::replace(&mut self.${prop_name}, HCO::NONE);
            return Some(old);
        }

        ASTNode::MIN(_) => {
            let old = std::mem::replace(&mut self.${prop_name}, HCO::NODE(child));
            return Some(old);
        }
        _ => None,
    }
        `
                        ]);
                    } else if (HAS_NULL) {
                        const { name } = structs[0];
                        ifs.push([
                            `
    match child {
        ASTNode::NONE => {
            if self.${prop_name}.is_some() {
                let old = std::mem::replace(&mut self.${prop_name}, None);
                if let Some(old_node) = old {
                    return Some(ASTNode::${name}(old_node));
                }
            }
        }

        ASTNode::${name}(child) => {
            if self.${prop_name}.is_none() {
                self.${prop_name} = Some(child);
            } else {
                let old = std::mem::replace(&mut self.${prop_name}, Some(child));

                if let Some(old_node) = old {
                    return Some(ASTNode::${name}(old_node));
                }
            }
        }
        _ => {}
    }
    None`
                        ].join("\n"));
                    } else {
                        const { name } = structs[0];
                        ifs.push([
                            `
    if let ASTNode::${name}(child) = child {
        return Some(ASTNode::${name}(std::mem::replace(&mut self.${prop_name}, child)))
    }else {
        return None
    }
    `,
                        ].join("\n"));
                    }
                } else if (TypesInclude(types, TypeIsVector)) {

                    const vectors = types.filter(TypeIsVector);
                    const HAS_STRUCTS = vectors.some(v => TypesInclude(v.types, TypeIsStruct));

                    if (HAS_STRUCTS) {

                        const structs = vectors.flatMap(v => v.types).filter(TypeIsStruct).setFilter(JSONFilter);

                        ifs.push([
                            `
    match &child {
        ${structs.map(({ name }, i) => `ASTNode::${name}(_${i})`).join("|")} => {
            if index as usize >= self.${prop_name}.len() {
                self.${prop_name}.push(child);
                None
            }else {
                self.${prop_name}.push(child);
                let node = self.${prop_name}.swap_remove(index as usize);
                Some(node)
            }
        }
        ASTNode::NONE => {
            if (index as usize)< self.${prop_name}.len() {
                let node = self.${prop_name}.remove(index as usize);
                Some(node)
            }else {
                None
            }
        }
        _ => None
    }`].join("\n"));
                    }
                }
                i++;
                return `
fn  replace_${prop_name}(&mut self, child: ASTNode,${HAVE_STRUCT_VECTORS ? "index: i32," : ""}) -> Option<${out_type}> {
    ${ifs.join(" else ")}
}`;
            } else {
                return "";
            }
        }).join("\n")}
}
`,
        //Iterator Implementation ------------------------------------------------------------------------
        `
impl<'a> ASTNodeTraits<'a> for ${struct_name}
where
    Self: Sized,
{

fn Iterate(
    self: &'a mut Box<Self>,
    _yield: &mut impl FnMut(&mut NodeIteration<'a>, &mut NodeIteration<'a>,u32, i32, i32) -> bool,
    parent: &mut NodeIteration<'a>,
    i: i32,
    j: i32,
) {
    let node = UnsafeCell::from(self);

    {
        let mut_me = unsafe { (*node.get()).as_mut() };

        if !_yield(&mut NodeIteration::${struct_name}(mut_me), parent, ${context.type.get(struct_name)}, i, j) { return };
    }
        
    ${prop_vals.flatMap(({ name: n, type: v, types, prop: p, HAS_NULL }, j) => {

            if (j == 0) i = 0;
            const HAVE_STRUCT = TypesInclude(types, TypeIsStruct);
            const ifs = [];
            if (HAVE_STRUCT) {
                const structs = types.filter(TypeIsStruct);
                if (TypesRequiresDynamic(types)) {
                    ifs.push([
                        `
        match &mut (unsafe { (*node.get()).as_mut() }.${n}){
            ${structs.map(({ name }) => {
                            return `
                ASTNode::${name}(child) => { 
                    let mut_me_b = unsafe { (*node.get()).as_mut() };
                    child.Iterate( _yield, &mut NodeIteration::${struct_name}(mut_me_b), ${i}, 0);
                }`;
                        }).join(",\n")}
            _ => {}
            
        }`
                    ].join("\n"));
                } else if (HAS_NULL) {
                    ifs.push([
                        `
        {
            if let Some(child) = &mut (unsafe { (*node.get()).as_mut() }.${n}) {
                let mut_me_b = unsafe { (*node.get()).as_mut() };
                child.Iterate(_yield, &mut NodeIteration::${struct_name}(mut_me_b), ${i}, 0);
            }
        }`
                    ].join("\n"));
                } else {
                    ifs.push([
                        `
        {
            let mut_me_b = unsafe { (*node.get()).as_mut() };
            (unsafe { (*node.get()).as_mut() }.${n}).Iterate( _yield, &mut NodeIteration::${struct_name}(mut_me_b), ${i}, 0);
            
        }`,
                    ].join("\n"));
                }
            } else if (TypesInclude(types, TypeIsVector)) {

                const vectors = types.filter(TypeIsVector);
                const HAS_STRUCTS = vectors.some(v => TypesInclude(v.types, TypeIsStruct));

                if (HAS_STRUCTS) {

                    const structs = vectors.flatMap(v => v.types).filter(TypeIsStruct).setFilter(JSONFilter);

                    ifs.push([
                        `
        {

            let mut_me_a = unsafe { (*node.get()).as_mut() };
            for j in 0..mut_me_a.${n}.len() {
                let mut_me_b = unsafe { (*node.get()).as_mut() };
                let child = &mut mut_me_b.${n}[j];

                ${structs.length > 1 ? `match child {
                    ${structs.map(({ name }) => {
                            return `
                        ASTNode::${name}(child) => { 
                            let mut_me = unsafe { (*node.get()).as_mut() };
                            child.Iterate(_yield, &mut NodeIteration::${struct_name}(mut_me) ${i}, j as i32)   
                        }`;
                        }).join(",\n")}
                    _ => {}
                }` :
                            `
                if let ASTNode::${structs[0].name}(child) = child {
                    let mut_me = unsafe { (*node.get()).as_mut() };
                    child.Iterate( _yield, &mut NodeIteration::${struct_name}(mut_me), ${i}, j as i32);
                }`}
            }
        }`
                    ].join("\n"));

                }
            }
            i++;
            return ifs.join(" else ");
        }).filter(i => !!i).join("\n    ")}
    
}

fn Replace(&mut self, child: ASTNode, i: i32, j: i32) -> ASTNode{

    match i{
    ${prop_vals.flatMap(({ name: n, type: v, types, prop: p, HAS_NULL }, j) => {
            if (j == 0) i = 0;
            const HAVE_STRUCT = TypesInclude(types, TypeIsStruct);
            const ifs = [];
            if (HAVE_STRUCT) {
                const structs = types.filter(TypeIsStruct);
                ifs.push([
                    `
        if let Some(old) = self.replace_${n}(child){ 
                return old;
            }else{
                return ASTNode::NONE;
            }`].join("\n"));

            } else if (TypesInclude(types, TypeIsVector)) {
                const vectors = types.filter(TypeIsVector);
                const HAS_STRUCTS = vectors.some(v => TypesInclude(v.types, TypeIsStruct));
                if (HAS_STRUCTS) {
                    ifs.push([
                        `
        if let Some(old) = self.replace_${n}(child, j){ 
            return old;
        }else{
            return ASTNode::NONE;
        }`].join("\n"));
                }
            }

            if (ifs.length > 0) {
                return `${i++} => {
                    ${ifs.join(" else ")}
                }`;
            }

            return "";
        }).filter(i => !!i).join("\n    ")}
        _ => {}
    };

    ASTNode::NONE
}


fn Token(&self) -> Token{
    return self.tok;
}

fn Type()-> u32{
    return ${context.type.get(struct_name)};
}

fn GetType(&self) -> u32 {
    return ${context.type.get(struct_name)};
}
}
`];
        strings.push(...struct_strings);
    }

    //Functions ------------------------------------------------------------------------

    const fns = new Map();
    const ids = [];

    for (const [id, { args, struct: name }] of context.fn_map) {

        const length = grammar.bodies[id].sym.length;

        const init = ["let mut i = args.len()-1;"];

        for (let i = 0; i < length; i++) {
            init.push(`let mut v${length - i - 1} = args.remove(i-${i});`);
        }

        let init_string = init.join("\n");

        let str = "", inits = new Inits();

        if (args.length == 0 && !name) {
            str = `{  ${init_string} v${length - 1} }`;
        } else if (!name) {

            const expression = args[0];
            const [type] = expression.types;
            const resolved_type = getResolvedType(type, context)[0];
            let data = typeToExpression(type, context, inits);
            switch (resolved_type.type) {
                case ASYTRIPType.DOUBLE:
                    str = `{${init_string} ${inits.render_rust(`return HCO::DOUBLE(${data})`)}}`;
                    break;
                case ASYTRIPType.STRING:
                    str = `{ ${init_string} ${inits.render_rust(` return HCO::STRING(${data})`)}}`;
                    break;
                case ASYTRIPType.VECTOR_PUSH:
                case ASYTRIPType.VECTOR:

                    let vector = typeToExpression(resolved_type, context, new Inits);

                    if (type.type == ASYTRIPType.ADD)
                        vector = typeToExpression(type.left, context, new Inits);


                    const types = getResolvedType(type, context)[0].types;
                    const unique_types = types.setFilter(t => t.type);

                    if (TypesAre(unique_types, TypeIsStruct)) {
                        if (type.type == ASYTRIPType.ADD || type.type == ASYTRIPType.VECTOR_PUSH) {
                            str = `{ 
                                ${init_string}
                                ${inits.render_rust(` `)}
                                ${data} } `;
                        } else {

                            //Dereference the vector
                            str = `{ 
                                ${init_string}
                                ${inits.render_rust(``)}
                                HCO::NODES(${vector}) } `;
                        }
                    } else if (unique_types.length > 1) {
                        //Returns a HCO::OBJECTS<Vec<HCO>>
                        str = `{ 
                                ${init_string}
                                ${inits.render_rust(`
                                return HCO::OBJECTS(${data}); `)}
                            }`;
                    } else {
                        str = `{
                            ${init_string} 
                                ${inits.render_rust(`
                                return ${data} `)}
                            }`;
                    }
                    break;
                default:
                    str = `{ 
                        ${init_string}
                                ${inits.render_rust(`
                                return ${data} `)}
                            }`;
            }
        } else {
            const struct = context.structs.get(name);
            const resolved_props = resolved_struct_types.get(name);
            //Create an initializer function for this object
            const data = [...struct.properties]
                .map(([name]) => {

                    const {
                        REQUIRES_DYNAMIC,
                        HAS_NULL: TARGET_HAS_NULL,
                        types: target_types,
                    } = resolved_props.get(name);
                    const source_arg = args.filter(a => a.name == name)[0];
                    let target_structs = target_types.filter(TypeIsStruct);
                    if (source_arg) {
                        const type = source_arg.types[0];
                        const arg_types = getResolvedType(type, context).filter(TypeIsNotNull);
                        const val = typeToExpression(type, context, inits);
                        if (TypesInclude(arg_types, TypeIsStruct)) {

                            const arg = arg_types[0];

                            let ref = inits.push_closure(`if let HCO::NODE($$) = ${val}`);

                            if (target_structs.length == 1) {
                                ref = inits.push_closure(`if let ASTNode::${arg.name}($$) = ${ref}`);
                                if (TARGET_HAS_NULL)
                                    return `Some(${ref})`;
                            }

                            return ref;


                        } else if (REQUIRES_DYNAMIC) {

                            if ("arg_pos" in type)
                                return val;

                            switch (type.type) {
                                case ASYTRIPType.ADD:
                                case ASYTRIPType.SUB:
                                case ASYTRIPType.VECTOR_PUSH:

                                    switch (arg_types[0].type) {
                                        case ASYTRIPType.STRING:
                                            return `HCO::STRING(${val})`;
                                    }

                                default: return val;
                            }
                        } else if (TypesAre(arg_types, TypeIsVector)) {

                            if (val == "__NULL__") {
                                return "Vec::new()";
                            }
                            const types = arg_types.flatMap(t => t.types);
                            if (TypesAre(types, TypeIsStruct)) {
                                return inits.push_closure(`if let HCO::NODES($$) = ${val}`);
                            }

                        } else if (arg_types.length == 1) {
                            const arg = arg_types[0];
                            switch (arg.type) {
                                case ASYTRIPType.STRING:
                                    return val;
                            }
                        }

                        return val;

                    } else {
                        if (TypesInclude(target_types, TypeIsStruct)) {
                            if (target_structs.length > 1) {
                                //This will be an ASTNode enum type
                                return "ASTNode::NONE";
                            } else {
                                return "None";
                            }
                        } else if (REQUIRES_DYNAMIC) {
                            return "HCO::NONE";
                        } else {
                            const type = target_types[0];
                            switch (type.type) {
                                case ASYTRIPType.VECTOR:
                                    return "Vec::new()";
                                case ASYTRIPType.BOOL:
                                    return false;
                                case ASYTRIPType.DOUBLE:
                                    return 0;
                                case ASYTRIPType.STRING:
                                    return "String::from('')";
                            }
                            return "None";
                        }
                    }
                }
                ).map(s => s + ",").join("\n        ");

            str = `{${init_string} ${inits.render_rust(`return HCO::NODE(ASTNode::${name}(${name}::new(\n        tok,\n        ${data}\n    ) \n));`)}; 
            ${inits.HAVE_CLOSURE ? "return HCO::NONE;" : ""}}`;
        }



        if (!fns.has(str)) {
            let i = fns.size;
            fns.set(str, {
                size: fns.size,
                name: `_fn${i}`,
                str: `fn _fn${i} (args:&mut Vec<HCO>, tok: Token) -> HCO ` + str
            });
        }

        ids[id] = fns.get(str).name;

    }
    const functions = `
${[...fns.values()].map(k => k.str).join("\n")}
`;
    strings.push(functions);

    const function_map = `
pub const FunctionMaps:[RF; ${ids.length}]= [
    ${ids.map(i => i + ",").join("")}
];`;

    strings.push(function_map);

    return strings.join("\n\n") + "\n";
}



addTypeMap(ASYTRIPType.NULL, (v, c) => "null");
addTypeMap(ASYTRIPType.PRODUCTION, (v, c) => {
    const type = getResolvedType(v, c)[0];
    return getTypeString(type, c);
});
addTypeMap(ASYTRIPType.STRUCT, (v, c) => {
    return `Box<${v.name}>`;
});
addTypeMap(ASYTRIPType.STRING, (v, c) => {
    if (v.val) {
        return `"${v.val}"`;
    } else {
        return "String";
    }
});
addTypeMap(ASYTRIPType.TOKEN, (v, c) => "Token");
addTypeMap(ASYTRIPType.DOUBLE, (v, c) => "f64");
addTypeMap(ASYTRIPType.BOOL, (v, c) => "bool");
addTypeMap(ASYTRIPType.VECTOR, (v, c) => {
    const types = v.types.flatMap(v => getResolvedType(v, c));

    if (TypesAre(types, TypeIsStruct)) {
        return `Vec<ASTNode>`;
    } else if (types.length == 1) {
        return `Vec<${getTypeString(types[0], c)}>`;
    } else {
        return `Vec<HCO>`;
    }
});
addTypeMap(ASYTRIPType.ADD, (v, c) => {
    const type = getResolvedType(v, c)[0];
    return getTypeString(type, c);
    debugger;
});
addTypeMap(ASYTRIPType.SUB, (v, c) => {
    debugger;
    return "";
});
addTypeMap(ASYTRIPType.VECTOR_PUSH, (v, c) => {
    debugger;
    return "";
});
addExpressMap(ASYTRIPType.EXPRESSIONS, (v, c, inits) => {

    const last = v.expressions.slice(-1)[0];

    for (const expression of v.expressions.slice(0, -1)) {
        inits.push(typeToExpression(expression, c, inits), false);
    }

    return typeToExpression(last, c, inits);
});

addExpressMap(ASYTRIPType.STRUCT_ASSIGN, (v, c, inits) => {
    const ref = typeToExpression(v.struct, c, inits);
    const prop = v.property;
    const value = typeToExpression(v.value, c, inits);
    return `${ref}.${prop} = ${value}`;
});
addExpressMap(ASYTRIPType.EQUALS, (v, c, inits) => {
    const { left: l, right: r } = v;
    const left = typeToExpression(l, c, inits);
    const right = typeToExpression(r, c, inits);
    return `${left} == ${right}`;
});



addExpressMap(ASYTRIPType.TERNARY, (v, c, inits) => {
    const { assertion: a, left: l, right: r } = v;
    const boolean = typeToExpression(a, c, inits);
    const left = typeToExpression(l, c, inits);
    const right = typeToExpression(r, c, inits);

    if (boolean == "false")
        return right;
    if (boolean == "true")
        return left;

    const ref = inits.push(left);

    inits.push(`if ${boolean} { ${ref} = ${right} }`, false);

    return ref;
});

addExpressMap(ASYTRIPType.NULL, (v, c, inits) => "__NULL__");

addExpressMap(ASYTRIPType.BOOL, (v, c, inits) => (v.val + "") || "false");

addExpressMap(ASYTRIPType.DOUBLE, (v, c, inits) => {
    const val = parseFloat(v.val).toFixed(20).replace(/0/g, " ").trim().replace(/ /g, "0") + "0";
    if (val[0] == ".")
        return "0" + val;
    return val;
}
);

addExpressMap(ASYTRIPType.CONVERT_BOOL, (v, c, inits) => {
    const val = typeToExpression(v.value, c, inits);

    if (val == "__NULL__" || val == "false")
        return "false";

    if (val == "true")
        return "true";

    return `(${val}).Bool()`;
});

addExpressMap(ASYTRIPType.CONVERT_DOUBLE, (v, c, inits) => `(${typeToExpression(v.value, c, inits)}).Double()`);

addExpressMap(ASYTRIPType.CONVERT_STRING, (v, c, inits) => `(${typeToExpression(v.value, c, inits)}).String()`);

addExpressMap(ASYTRIPType.PRODUCTION, (v, c, inits) => {

    if (!isNaN(v.arg_pos)) {
        return `v${v.arg_pos}`;
    }
    return "null";
});
addExpressMap(ASYTRIPType.STRUCT, (v, c, inits) => {
    return v.name;
});
addExpressMap(ASYTRIPType.STRING, (v, c, inits) => {

    if (v.val) {
        return `String::from("${v.val}")`;
    } else {
        return "String::from(\"\")";
    }
});
addExpressMap(ASYTRIPType.TOKEN, (v, c, inits) => {
    if (!isNaN(v.arg_pos)) {
        return `v${v.arg_pos}`;
    }
    return "null";
});
addExpressMap(ASYTRIPType.OR, (v, c, inits) => {

    const { left: l, right: r } = v;
    const lv = getTypeString(l, c);
    const rv = getTypeString(r, c);

    if (lv == "null")
        return typeToExpression(r, c, inits);

    if (rv == "null")
        return typeToExpression(l, c, inits);

    return `${typeToExpression(l, c, inits)} || ${typeToExpression(r, c, inits)}`;
});
addExpressMap(ASYTRIPType.ADD, (v, c, inits) => {
    const { left: l, right: r } = v;
    const type_l = getResolvedType(l, c)[0];
    const type_r = getResolvedType(r, c)[0];
    const left = typeToExpression(l, c, inits);
    const right = typeToExpression(r, c, inits);


    if (TypeIsVector(type_l)) {
        return typeToExpression(<ASYTRIPTypeObj[ASYTRIPType.VECTOR_PUSH]>{
            type: ASYTRIPType.VECTOR_PUSH,
            args: [r],
            vector: l
        }, c, inits);
    }

    if (TypeIsVector(type_r)) {
        return typeToExpression(<ASYTRIPTypeObj[ASYTRIPType.VECTOR_PUSH]>{
            type: ASYTRIPType.VECTOR_PUSH,
            args: [l],
            vector: r
        }, c, inits);
    }

    if (TypeIsString(type_l) && !TypeIsString(type_r)) {

        return `${left} + &${right}.String()`;
    } else if (TypeIsString(type_l) && TypeIsString(type_r)) {
        return `${left} + &${right}`;
    } else if (TypeIsString(type_r) && !TypeIsString(type_r)) {
        return `${left}.String() + &${right}`;
    }

    return `${left} + ${right}`;
});
addExpressMap(ASYTRIPType.SUB, (v, c, inits) => {
    debugger;
    return "";
});

addExpressMap(ASYTRIPType.STRUCT_PROP_REF, (v, c, inits) => {

    const ref = inits.push_ref(`(${typeToExpression(v.struct, c, inits)}).(${getTypeString(v.struct, c)})`);

    const prop = v.property;

    return `${ref}.${prop}`;
});

addExpressMap(ASYTRIPType.VECTOR_PUSH, (v, c, inits) => {

    let vector = typeToExpression(v.vector, c, inits);
    let push_ref = vector;
    const vector_types = getResolvedType(v.vector, c).setFilter(t => {
        return t.type;
    }).filter(TypeIsVector);

    const types = vector_types.flatMap(v => v.types)
        .flatMap(v => getResolvedType(v, c))
        .setFilter(JSONFilter);
    if (TypesAre(types, TypeIsStruct)) {
        if (!isNaN(v.vector.arg_pos)) {
            //Need to create a local dereference to push values
            push_ref = inits.push_closure(`if let HCO::NODES($$) = &mut ${vector}`);
        }

        for (const arg of v.args) {

            let val = typeToExpression(arg, c, inits);

            if (!isNaN(arg.arg_pos)) {
                val = inits.push_closure(`if let HCO::NODE($$) = ${val}`);
            }

            inits.push(`${push_ref}.push(${val});`, false);
        }
    } else if (types.length == 1) {

        if (TypeIsToken(types[0]) || TypeIsString(types[0])) {
            const vals = v.args.map(convertArgsToType(c, inits, TypeIsString, convertValToString));
            inits.push(`${push_ref}.(*HCGObjStringArray).Append(${vals.join(", ")})`, false);
        }
    } else if (TypesAre(types, TypeIsStruct)) {
        const vals = v.args.map(convertArgsToType(c, inits, TypeIsStruct, _ => `niil`));

        return inits.push(`&HCNode{Val: [HCNode] { ${vals.join(", ")}}}`);
    } else {

        for (const arg of v.args) {

            let val = typeToExpression(arg, c, inits);

            switch (arg.type) {
                case ASYTRIPType.STRING:
                    val = `HCO::STRING(${val})`;
                    break;
                case ASYTRIPType.DOUBLE:
                    val = `HCO::DOUBLE(${val})`;
                    break;
            }

            inits.push(`${push_ref}.push(${val});`, false);
        }

    }

    return `${vector}`;
});


addExpressMap(ASYTRIPType.VECTOR, (v, c, inits) => {

    const types = v.types.flatMap(v => getResolvedType(v, c));

    if (!isNaN(v.arg_pos)) {
        return `v${v.arg_pos}`;
    }

    if (TypesAre(types, TypeIsStruct)) {
        /* const vals = v.args.map(convertArgsToType(c, inits, TypeIsString, (a, t) => {
            return a;
        })); */

        const ref = inits.push(`Vec::new()`, "Vec<ASTNode>");

        for (const arg of v.args) {

            let val = typeToExpression(arg, c, inits);

            let node = inits.push_closure(`if let HCO::NODE($$) = ${val}`);

            inits.push(`${ref}.push(${node});`, false);
        }

        return ref;
    } else if (types.length == 1) {
        const type = types[0];

        if (TypeIsString(type) || TypeIsToken(type)) {
            const vals = v.args.map(convertArgsToType(c, inits, TypeIsString, convertValToString));

            return inits.push(`&HCGObjStringArray{Val: [String] { ${vals.join(", ")}}}`);
        } else if (TypeIsDouble(type)) {
            const vals = v.args.map(convertArgsToType(c, inits, TypeIsDouble, convertValToDouble));

            return inits.push(`&HCGObjDoubleArray{Val: [f64] { ${vals.join(", ")}}}`);
        } else if (TypeIsStruct(type)) {

            const vals = v.args.map(convertArgsToType(c, inits, TypeIsNull, (a, t) => {
                return inits.push_closure(`(${a}).(${getTypeString(t, c)})`);
            }));

            return inits.push(`${getTypeString(v, c)}{ ${vals.join(", ")}}`, true);
        } else {
            return `[${v.args.map(t => typeToExpression(t, c, inits))
                .setFilter().join(",")}]`;
        }
    } else {

        const vals = v.args.map(convertArgsToType(c, inits, TypeIsString, convertValToString));

        const ref = inits.push(`Vec::new()`, "Vec<HCO>");

        for (const arg of v.args) {

            let val = typeToExpression(arg, c, inits);

            switch (arg.type) {
                case ASYTRIPType.STRING:
                    val = `HCO::STRING(${val})`;
                    break;
                case ASYTRIPType.DOUBLE:
                    val = `HCO::DOUBLE(${val})`;
                    break;
            }

            inits.push(`${ref}.push(${val});`, false);
        }

        return ref;
    }
});


