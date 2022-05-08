/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import {
    ASYTRIPContext,
    ASYTRIPStruct,
    ASYTRIPType,
    ASYTRIPTypeObj,
    GrammarObject,
    ResolvedProp
} from '@hctoolkit/common';
import {
    getResolvedType,
    JSONFilter, TypeIsNotNull, TypeIsString,
    TypeIsStruct,
    TypeIsToken,
    TypeIsVector,
    TypesAre, TypesInclude, TypesRequiresDynamic
} from '../context/common.js';
import { generateResolvedProps } from '../context/generate_resolved_props.js';
import { Inits } from './Inits.js';

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

function getExpressionString<T extends keyof ASYTRIPTypeObj>(
    v: ASYTRIPTypeObj[T],
    c: ASYTRIPContext,
    inits: Inits
): string {

    if (!expr_mapper.has(v.type))
        throw new Error(`Cannot expression mapper for ${ASYTRIPType[v.type]}`);

    return expr_mapper.get(v.type)(v, c, inits);
}

function GenerateTypeString(
    context: ASYTRIPContext,
    prop: ResolvedProp,
): string {

    const {
        types,
        REQUIRES_DYNAMIC,
        HAVE_STRUCT,
        HAVE_STRUCT_VECTORS,
        HAS_NULL
    } = prop;

    let type_string = "HCO";

    if (types.length == 0) {
        type_string = "HCO";
    } else if (HAVE_STRUCT_VECTORS) {
        /* const names = [
            ...prop.struct_types.classes.map(s => "c_" + s),
            ...prop.struct_types.structs
        ];
        type_string = `${names.join(" | ")}`;
        if (names.length > 1)
            type_string = `(${type_string})`; */
        if (types[0].type == ASYTRIPType.VECTOR) {

            const vec_types: ASYTRIPTypeObj[ASYTRIPType.STRUCT][] = <any[]>types[0].types;

            //if (vec_types.length > 1)
            type_string = `Vec<ASTNode>`;
            //else
            //    type_string = `Vec<Box<${vec_types[0].name}>>`;
        }

    } else if (HAVE_STRUCT) {
        /* const names = [
            ...prop.struct_types.classes.map(s => "c_" + s),
            ...prop.struct_types.structs
        ];
        type_string = `${names.join(" | ")}`; */
        if (types.length > 1) {

            type_string = `ASTNode`;


        } else {
            type_string = `Box<${types[0].name}>`;

            if (HAS_NULL)
                type_string = `Option<${type_string}>`;
        }

    } else if (REQUIRES_DYNAMIC) {
        type_string = `(${types.filter(TypeIsNotNull).map(t => getTypeString(t, context)).join(" | ")})`;
    } else if (TypesAre(types, TypeIsVector)) {
        type_string = getTypeString(types[0], context);
    } else if (types[0])
        type_string = getTypeString(types[0], context);
    else
        type_string = "HCO";

    return type_string;
}

export function createRustTypes(grammar: GrammarObject, context: ASYTRIPContext) {

    const structs = [...context.structs];

    const strings = [
        //Header ------------------------------------------------------------------------
        `
use std::cell::UnsafeCell;

use hctk::ast::{HCObj, HCObjTrait, ReduceFunction};

use hctk::Token;

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
        String::from("")
        /* use ASTNode::*;
        match self {
            ${structs.map(([name, value]) => {
            return `
            ${name}(bx) => bx.tok.String(),`;
        }).join("\n")}
            _ => String::from(""),
        } */
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
        &'a mut self,
        _yield: &mut impl FnMut(&mut NodeIteration<'a>, &mut NodeIteration<'a>,u32, i32, i32) -> bool,
        parent: &mut NodeIteration<'a>,
        i: i32,
        j: i32,
    );
    fn Token(&self) -> Token;
    fn Type() -> u32;
    fn GetType(&self) -> u32;

    //fn serialize(ByteWriter) -> none
    //fn deserialize(ByteReader) -> Self
}
`);

    strings.push(`
impl<'a> ASTNodeTraits<'a> for ASTNode
where
    Self: Sized,
{
    fn Replace(&mut self, n: ASTNode, i: i32, j: i32) -> ASTNode {
        use ASTNode::*;
        match self {
            _ => ASTNode::NONE,
            ${structs.map(([n, s]) => `
                ${n}(node) => {
                    node.as_mut().Replace(n, i, j)
            }`)
        }}
    }

    fn Iterate(&'a mut self, 
        _yield: &mut impl FnMut(&mut NodeIteration<'a>, &mut NodeIteration<'a>,u32, i32, i32) -> bool,
        parent: &mut NodeIteration<'a>,
        i: i32,
        j: i32,
    ){
        use ASTNode::*;
        match self {
            _ => {},
            ${structs.map(([n, s]) => `
                ${n}(node) => {
                    node.as_mut().Iterate(_yield, parent, i, j)
            }`)
        }}
    }

    fn Token(&self) -> Token {
        Token::empty()
        /* 
        use ASTNode::*;
        match self {
            _ => Token::empty(),
            ${structs.map(([n, s]) => `
                ${n}(node) => node.as_ref().Token()`)
        }} */
    }

    fn GetType(&self) -> u32 {
        use ASTNode::*;
        match self {
            _ => 0,
            ${structs.map(([n, s]) => `
                ${n}(node) => 
                    node.as_ref().GetType()`)
        }}
    }

    fn Type() -> u32 { 0 }
    
}

`);


    //Structs ------------------------------------------------------------------------
    for (const [struct_name, struct] of context.structs) {
        const prop_vals = generateResolvedProps(struct,
            context,
            context.resolved_struct_types,
            getTypeString,
            GenerateTypeString
        );

        const struct_props = prop_vals.filter(p => p.HAVE_STRUCT || p.HAVE_STRUCT_VECTORS);

        let i = 0;
        const struct_strings = [`

#[derive(Debug, Clone)]
pub struct ${struct_name} {
    ${prop_vals.map(({ name: n, type: v, types }) => `pub ${n}:${v} /* ${types.map(function (t) {
            if (t.type == ASYTRIPType.STRUCT)
                return `${t.name}`;
            else return ASYTRIPType[t.type];
        }).join(" | ")} */`).join(",\n")}
}

impl ${struct_name} {
fn new( ${prop_vals.map(({ name: n, type: v }) => `_${n}:${v}`).join(", ")}) -> Box<Self> {
    Box::new(${struct_name}{
        ${prop_vals.map(({ name: n }) => {
            return `${n} : _${n}`;
        }).map(s => s + ",").join("\n        ")}
    })
}



${struct_props.flatMap(({ name: prop_name, type: v, types, prop: p, HAS_NULL }, j) => {
            const HAVE_STRUCT = TypesInclude(types, TypeIsStruct);
            const HAVE_STRUCT_VECTORS = types.filter(TypeIsVector).some(v => TypesInclude(v.types, TypeIsStruct));
            const ifs = [];

            let out_type = "ASTNode";

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
        ASTNode::${name}(_) => { 
            return Some(std::mem::replace(&mut self.${prop_name}, child));
        }`).join(",\n")}
        _ => None
        
    }`
                    ].join("\n"));
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
            } else {

                const vectors = types.filter(TypeIsVector);
                const HAS_STRUCTS = vectors.some(v => TypesInclude(v.types, TypeIsStruct));

                if (HAS_STRUCTS) {

                    const structs = vectors.flatMap(v => v.types).filter(TypeIsStruct).setFilter(JSONFilter);

                    ifs.push([
                        `
    match &child {
        ${structs.map(({ name }, i) => `ASTNode::${name}(_)`).join("|")} => {
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
    &'a mut self,
    _yield: &mut impl FnMut(&mut NodeIteration<'a>, &mut NodeIteration<'a>,u32, i32, i32) -> bool,
    parent: &mut NodeIteration<'a>,
    i: i32,
    j: i32,
) {
    let node = UnsafeCell::from(self);

    unsafe{
        let mut_me = node.get();

        if !_yield(&mut NodeIteration::${struct_name}(*mut_me), parent, ${context.type.get(struct_name)}, i, j) { return };
    }
        
    ${struct_props.flatMap(({ name: n, type: v, types, prop: p, HAS_NULL, HAVE_STRUCT, REQUIRES_DYNAMIC }, j) => {

            if (j == 0) i = 0;
            const ifs = [];
            if (HAVE_STRUCT) {
                const structs = types.filter(TypeIsStruct);
                if (TypesRequiresDynamic(types)) {
                    ifs.push([
                        `
        match &mut (unsafe { (*node.get()) }.${n}){
            ${structs.map(({ name }) => {
                            return `
                ASTNode::${name}(child) => { 
                    unsafe { 
                        let mut_me_b = node.get();
                        child.Iterate( _yield, &mut NodeIteration::${struct_name}(*mut_me_b), ${i}, 0);
                    };
                }`;
                        }).join(",\n")}
            _ => {}
            
        }`
                    ].join("\n"));
                } else if (HAS_NULL) {
                    if (types.length > 1) /* Uses ASTNode type */ {
                        ifs.push([
                            `
        unsafe {
            let reference = node.get();
            if let child = &mut (*reference).${n} /* HAS_NULL:${HAS_NULL} */{
                 
                let mut_me_b = node.get();
                child.Iterate( _yield, &mut NodeIteration::${struct_name}(*mut_me_b), ${i}, 0);
    
            }
        }`
                        ].join("\n"));
                    } else
                        ifs.push([
                            `
        unsafe { 
            let reference = node.get();
            if let Some(child) = &mut ( *reference).${n} /* HAS_NULL:${HAS_NULL} */{
                let mut_me_b = node.get();
                child.Iterate( _yield, &mut NodeIteration::${struct_name}(*mut_me_b), ${i}, 0);
            }
        }`
                        ].join("\n"));
                } else {
                    ifs.push([
                        `
        unsafe {
            let mut_me_b = node.get();
            let mut_me_d = node.get();

            ((*mut_me_d).${n}).Iterate( _yield, &mut NodeIteration::${struct_name}(*mut_me_b), ${i}, 0);
            
        }`,
                    ].join("\n"));
                }
            } else {

                const vectors = types.filter(TypeIsVector);

                const structs = vectors.flatMap(v => v.types).filter(TypeIsStruct).setFilter(JSONFilter);

                ifs.push([
                    `
        unsafe {

            let mut_me_a = node.get();
            for j in 0..(*mut_me_a).${n}.len() {
                let mut_me_b = node.get();
                let child = &mut (*mut_me_b).${n}[j];

                ${structs.length > 1 ? `match child {
                    ${structs.map(({ name }) => {
                        return `
                        ASTNode::${name}(child) => { 
                            unsafe { 
                                let mut_me = node.get();
                                child.Iterate(_yield, &mut NodeIteration::${struct_name}(*mut_me), ${i}, j as i32)   
                            };
                        }`;
                    }).join(",\n")}
                    _ => {}
                }` :
                        `
                if let ASTNode::${structs[0].name}(child) = child {
                    unsafe { 
                        let mut_me = node.get();
                        child.Iterate(_yield, &mut NodeIteration::${struct_name}(*mut_me), ${i}, j as i32)   
                    };
                }`}
            }
        }`
                ].join("\n"));

            }

            i++;
            return ifs.join(" else ");
        }).filter(i => !!i).join("\n    ")}
}

fn Replace(&mut self, child: ASTNode, i: i32, j: i32) -> ASTNode{

    match i{
    ${struct_props.flatMap(({ name: n, type: v, types, prop: p, HAS_NULL, HAVE_STRUCT }, j) => {
            if (j == 0) i = 0;
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

            } else {
                const vectors = types.filter(TypeIsVector);

                ifs.push([
                    `
        if let Some(old) = self.replace_${n}(child, j){ 
            return old;
        }else{
            return ASTNode::NONE;
        }`].join("\n"));
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
    Token::empty()
    //return self.tok;
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


    for (const [id, { args, struct: name, source }] of context.fn_map) {

        const length = grammar.bodies[id].sym.length;

        const init = ["let mut i = args.len()-1;"];

        for (let i = 0; i < length; i++) {
            init.push(`let mut v${length - i - 1} = args.remove(i-${i});`);
        }

        let init_string = init.join("\n");

        let str = "", inits = new Inits();

        if (args.length == 0 && !name) {
            if (length == 1)
                str = "{}";
            else
                str = `{  ${init_string}\n args.push(v${length - 1}); }`;
        } else {

            const expression = args[0];
            const [type] = expression.initializers;
            const resolved_type = getResolvedType(type, context)[0];
            let data = getExpressionString(type, context, inits);

            switch (resolved_type.type) {
                case ASYTRIPType.F64:
                    str = `{${init_string} ${inits.render_rust(`args.push(HCO::DOUBLE(${data}))`)}}`;
                    break;
                case ASYTRIPType.STRING: {
                    let val = productionToType(data, inits, ASYTRIPType.STRING);
                    str = `{ ${init_string} ${inits.render_rust(` args.push(HCO::STRING(${val}))`)}}`;
                }
                    break;
                case ASYTRIPType.TOKEN:
                    str = `{ ${init_string} ${inits.render_rust(` args.push(HCO::TOKEN(${data}))`)}}`;
                    break;
                case ASYTRIPType.STRUCT:
                    str = `{ ${init_string} ${inits.render_rust(` args.push(HCO::NODE(${data}))`)}}`;
                    break;
                case ASYTRIPType.VECTOR_PUSH:
                case ASYTRIPType.VECTOR:

                    let vector = getExpressionString(resolved_type, context, new Inits);

                    if (type.type == ASYTRIPType.ADD)
                        vector = getExpressionString(type.left, context, new Inits);

                    const types = resolved_type.types;

                    if (TypesInclude(types, TypeIsStruct)) {

                        //Dereference the vector
                        str = `{ 
                                ${init_string}
                                ${inits.render_rust(`
                                args.push(HCO::NODES(${data}));`)}
                                 } `;

                    } else if (TypesAre(types, TypeIsToken)) {
                        str = `{ 
                            ${init_string}
                            ${inits.render_rust(`
                            args.push(HCO::TOKENS(${data}));`)}
                        }`;
                    } else if (TypesAre(types, TypeIsString)) {
                        str = `{ 
                            ${init_string}
                            ${inits.render_rust(`
                            args.push(HCO::STRINGS(${data})); `)}
                        }`;
                    } else if (types.length > 1) {
                        str = `{ 
                                ${init_string}
                                ${inits.render_rust(`
                                args.push(HCO::OBJECTS(${data})); `)}
                            }`;
                    } else {
                        str = `{
                            ${init_string} 
                                ${inits.render_rust(`
                                args.push(${data});`)}
                            }`;
                    }
                    break;
                default:
                    str = `{ 
                        ${init_string}
                                ${inits.render_rust(`
                                args.push(${data});`)}
                            }`;
            }
        }

        const hash = str.replace(/[ \n]/g, "");

        if (!fns.has(hash)) {
            let i = fns.size;
            fns.set(hash, {
                size: fns.size,
                name: `_fn${i}`,
                str: `/**\n\`\`\`\n${source}\n\`\`\`\*/\nfn _fn${i} (args:&mut Vec<HCO>, tok: Token)` + str
            });
        }

        ids[id] = fns.get(hash).name;

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
        inits.push(getExpressionString(expression, c, inits), false);
    }

    return getExpressionString(last, c, inits);
});

addExpressMap(ASYTRIPType.STRUCT_ASSIGN, (v, c, inits) => {
    const ref = getExpressionString(v.struct, c, inits);
    const prop = v.property;
    const value = getExpressionString(v.value, c, inits);
    return `${ref}.${prop} = ${value}`;
});
addExpressMap(ASYTRIPType.EQUALS, (v, c, inits) => {
    const { left: l, right: r } = v;
    const left = getExpressionString(l, c, inits);
    const right = getExpressionString(r, c, inits);
    return `${left} == ${right}`;
});



addExpressMap(ASYTRIPType.TERNARY, (v, c, inits) => {
    const { assertion: a, left: l, right: r } = v;
    const boolean = getExpressionString(a, c, inits);
    const left = getExpressionString(l, c, inits);
    const right = getExpressionString(r, c, inits);

    if (boolean == "false")
        return right;
    if (boolean == "true")
        return left;

    const ref = inits.push(left);

    inits.push(`if ${boolean} { ${ref} = ${right} }`, false);

    return ref;
});


addExpressMap(ASYTRIPType.CONVERT_TYPE, (v, c, inits) => `(${getExpressionString(v.value, c, inits)}).Double()`);

addExpressMap(ASYTRIPType.CONVERT_STRING, (v, c, inits) => `(${getExpressionString(v.value, c, inits)}).String()`);

addExpressMap(ASYTRIPType.PRODUCTION, (v, c, inits) => {

    if (!isNaN(v.arg_pos ?? NaN)) {
        const resolved_types = getResolvedType(v, c).filter(TypeIsNotNull);
        const val = `v${v.arg_pos}`;

        const r_types = resolved_types.setFilter(JSONFilter);

        let dd = r_types.length > 1 ? `/* multi ${r_types.map(i => ASYTRIPType[i.type]).join(" | ")} */` : "";

        if (TypesAre(resolved_types, TypeIsVector))
            return deref_vector(val, resolved_types[0], inits);
        else if (TypesAre(resolved_types.slice(0, 1), TypeIsToken))
            return val; //inits.push_closure(`if let HCO::TOKEN($$) = ${val}`);
        else if (TypesAre(resolved_types.slice(0, 1), TypeIsString))
            return val; //inits.push_closure(`if let HCO::STRING($$) = ${val}`);
        else if (TypesAre(resolved_types.slice(0, 1), TypeIsStruct))
            return inits.push_closure(`if let HCO::NODE($$) = ${val}`);


        return val;
    }
    return "null";
});
addExpressMap(ASYTRIPType.STRUCT, (v, c, inits) => {

    const name = v.name;

    if (v.args) {

        const args = v.args;

        //ASTNode Struct Initialization ----------------------------------------------
        const struct = <ASYTRIPStruct>c.structs.get(name);

        const resolved_props = <Map<string, ResolvedProp>>c.resolved_struct_types.get(name);

        //Create an initializer function for this object
        const data = [...struct.properties]
            .map(([name, {
                types
            }]) => {

                const {
                    REQUIRES_DYNAMIC,
                    HAS_NULL: TARGET_HAS_NULL,
                    types: target_types,
                } = <ResolvedProp>resolved_props.get(name);
                const source_arg = args.filter(a => a.name == name)[0];

                let target_structs = target_types.filter(TypeIsStruct);

                if (source_arg) {

                    const type = source_arg.initializers[0];

                    const arg_types = getResolvedType(type, c).filter(TypeIsNotNull);

                    const temp_val = getExpressionString(type, c, new Inits);

                    if (temp_val !== "null") {

                        if (TypesInclude(arg_types, TypeIsStruct)) {

                            const arg = arg_types[0];

                            let ref = getExpressionString(type, c, inits);

                            if (target_structs.length == 1) {
                                ref = inits.push_closure(`if let ASTNode::${arg.name}($$) = ${ref}`);
                                if (TARGET_HAS_NULL)
                                    return `Some(${ref})`;
                            }

                            return ref;

                        } else if (REQUIRES_DYNAMIC) {

                            const val = getExpressionString(type, c, inits);

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
                            return "" + getExpressionString(type, c, inits);
                            //return "*" + deref_vector(val, arg_types[0], inits);

                        } else if (arg_types.length == 1 || refIsArg(temp_val)) {

                            // if (type == ASYTRIPType.CONVERT_TYPE) {
                            //     return getExpressionString(Object.assign({}, type, { DEREF_PRODUCTIONS: true }), c, inits);
                            // } else {

                            return "/* AAA */" + getExpressionString(<ASYTRIPTypeObj[ASYTRIPType.CONVERT_TYPE]>{
                                type: ASYTRIPType.CONVERT_TYPE,
                                body: [],
                                conversion_type: arg_types[0],
                                value: type,
                                DEREF_PRODUCTIONS: true
                            }, c, inits);
                            //}
                        }

                        return getExpressionString(type, c, inits);
                    }
                }

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
                        case ASYTRIPType.F64:
                            return 0;
                        case ASYTRIPType.STRING:
                            return "String::from(\"\")";
                    }
                    return "None";
                }

            }
            ).map(s => s + ",").join("\n        ");

        const ref = inits.push(`ASTNode::${name}(${name}::new(\n        ${data}\n    ) \n);`);

        return ref;
    } else if (v.arg_pos) {
        return "v" + v.arg_pos;
    } else
        return v.name;
});

function deref_vector(
    val: string,
    vector: ASYTRIPTypeObj[ASYTRIPType.VECTOR],
    inits: Inits
): string {

    const types = vector.types;

    if (TypesAre(types, TypeIsStruct)) {
        return inits.push_closure(`if let HCO::NODES(mut $$) = ${val}`);
    } else if (TypesAre(types, TypeIsString))
        //Need to create a local dereference to push values
        return inits.push_closure(`if let HCO::STRINGS(mut $$) = ${val}`);
    else if (TypesAre(types, TypeIsToken))
        return inits.push_closure(`if let HCO::TOKENS(mut $$)= ${val}`);
    else
        return inits.push_closure(`if let HCO::OBJECTS(mut $$) = ${val}`);
}

addExpressMap(ASYTRIPType.OR, (v, c, inits) => {

    const { left: l, right: r } = v;
    const lv = getTypeString(l, c);
    const rv = getTypeString(r, c);

    if (lv == "null")
        return getExpressionString(r, c, inits);

    if (rv == "null")
        return getExpressionString(l, c, inits);

    return `${getExpressionString(l, c, inits)} || ${getExpressionString(r, c, inits)}`;
});
addExpressMap(ASYTRIPType.ADD, (v, c, inits) => {
    const { left: l, right: r } = v;
    const type_l = getResolvedType(l, c)[0];
    const type_r = getResolvedType(r, c)[0];


    if (TypeIsVector(type_l)) {
        return getExpressionString(<ASYTRIPTypeObj[ASYTRIPType.VECTOR_PUSH]>{
            type: ASYTRIPType.VECTOR_PUSH,
            args: [r],
            vector: l
        }, c, inits);
    }

    if (TypeIsVector(type_r)) {
        return getExpressionString(<ASYTRIPTypeObj[ASYTRIPType.VECTOR_PUSH]>{
            type: ASYTRIPType.VECTOR_PUSH,
            args: [l],
            vector: r
        }, c, inits);
    }


    if (TypeIsString(type_l) || TypeIsString(type_r)) {
        let lval = getExpressionString(<ASYTRIPTypeObj[ASYTRIPType.CONVERT_TYPE]>{
            type: ASYTRIPType.CONVERT_TYPE,
            body: [],
            conversion_type: <any>{ type: ASYTRIPType.STRING },
            value: l,
            DEREF_PRODUCTIONS: true
        }, c, inits);
        let rval = getExpressionString(<ASYTRIPTypeObj[ASYTRIPType.CONVERT_TYPE]>{
            type: ASYTRIPType.CONVERT_TYPE,
            body: [],
            conversion_type: <any>{ type: ASYTRIPType.STRING },
            value: r,
            DEREF_PRODUCTIONS: true
        }, c, inits);
        return `${lval} + &${rval}`;
    }


    const left = getExpressionString(l, c, inits);
    const right = getExpressionString(r, c, inits);

    return `${left} + ${right}`;
});

addExpressMap(ASYTRIPType.SUB, (v, c, inits) => {
    debugger;
    return "";
});

addExpressMap(ASYTRIPType.STRUCT_PROP_REF, (v, c, inits) => {

    const ref = inits.push_ref(`(${getExpressionString(v.struct, c, inits)}).(${getTypeString(v.struct, c)})`);

    const prop = v.property;

    return `${ref}.${prop}`;
});

addExpressMap(ASYTRIPType.VECTOR_PUSH, (v, c, inits) => {

    let vector = getExpressionString(v.vector, c, inits);

    if (vector == "null")
        return "[]";

    const ref = vector;
    let HAVE_ARGS = v.args.filter(TypeIsNotNull).length > 0;

    const vector_types = getResolvedType(v.vector, c)
        .setFilter(t => t.type)
        .filter(TypeIsVector);

    const types = vector_types.flatMap(v => v.types)
        .flatMap(v => getResolvedType(v, c))
        .setFilter(JSONFilter);

    if (HAVE_ARGS)
        if (TypesAre(types, TypeIsStruct)) {

            for (const arg of v.args) {

                const types = getResolvedType(arg, c);
                let val = getExpressionString(arg, c, inits);

                if (val == "null") continue;


                if (TypesInclude(types, TypeIsVector)) {
                    inits.push(`${ref}.push(...${val});`, false);
                } else {

                    //  let sr_ref = inits.push_closure(`if let HCO::NODE($$) = ${val}`);

                    inits.push(`${ref}.push(${val});`, false);
                }
            }

        } else if (types.length == 1) {

            const [type] = types;

            if (TypeIsToken(type) || TypeIsString(type)) {
                const vals = v.args.filter(TypeIsNotNull).map(v => {
                    let t = type;
                    if (refIsArg(ref))
                        t = <ASYTRIPTypeObj[ASYTRIPType.PRODUCTION]>{
                            type: ASYTRIPType.PRODUCTION, args: [], body: [], val: 0,
                        };

                    return getExpressionString(<ASYTRIPTypeObj[ASYTRIPType.CONVERT_TYPE]>{
                        type: ASYTRIPType.CONVERT_TYPE,
                        body: [],
                        conversion_type: type,
                        value: v,
                        DEREF_PRODUCTIONS: true
                    }, c, inits);
                });

                if (vals.length > 0)
                    inits.push(`${ref}.push(${vals.join(", ")});`, false);
            }
        } else {

            for (const arg of v.args) {
                let val = getExpressionString(arg, c, inits);

                if (val == "null")
                    continue;

                inits.push(`${ref}.push(${val});`, false);
            }

        }

    return `${vector}`;
});

addExpressMap(ASYTRIPType.VECTOR, (v, c, inits) => {
    const types = v.types.flatMap(v => getResolvedType(v, c));

    if (!isNaN(v.arg_pos ?? NaN))
        return deref_vector(`v${v.arg_pos}`, v, inits);


    if (TypesAre(types, TypeIsStruct)) {

        //const ref = inits.push(` Box::new(Vec::new()).as_mut()`, "Vec<ASTNode>");
        //const ref = inits.push(` Box::new(Vec::new()).as_mut()`, "&mut Vec<ASTNode>");
        const ref = inits.push(` Vec::new()`, "Vec<ASTNode>");

        for (const arg of v.args) {

            let val = getExpressionString(arg, c, inits);

            //let node = inits.push_closure(`if let HCO::NODE($$) = ${val}`);

            inits.push(`${ref}.push(${val});`, false);
        }

        return ref;

    } else if (types.length == 1) {

        const [type] = types;

        if (TypeIsVector(type)) {
            const vals = v.args.filter(TypeIsNotNull).map(v => getExpressionString(v, c, inits));
            return inits.push(`[${vals.map(v => `...${v}`).join(", ")}]`, getTypeString(v, c));
        } else {
            //  const ref = inits.push(`Vec::new()`, `Vec<${getTypeString(type, c)}>`);
            const ref = inits.push(`Vec::new()`, `Vec<${getTypeString(type, c)}>`);
            const vals = v.args.filter(TypeIsNotNull).map(v => {
                return getExpressionString(<ASYTRIPTypeObj[ASYTRIPType.CONVERT_TYPE]>{
                    type: ASYTRIPType.CONVERT_TYPE,
                    body: [],
                    conversion_type: type,
                    value: v,
                    DEREF_PRODUCTIONS: true,
                }, c, inits);
            }).filter(t => t != 'null');

            for (const val of vals)
                inits.push(`${ref}.push(${val});`, false);

            return ref;
        }
    } else {
        //const ref = inits.push(`Vec::new()`, "Vec<HCO>");
        const ref = inits.push(`Vec::new()`, "Vec<HCO>");

        for (const arg of v.args) {

            let val = getExpressionString(arg, c, inits);

            switch (arg.type) {
                case ASYTRIPType.STRING:
                    val = `HCO::STRING(${val})`;
                    break;
                case ASYTRIPType.F64:
                    val = `HCO::DOUBLE(${val})`;
                    break;
            }

            inits.push(`${ref}.push(${val});`, false);
        }

        return ref;
    }
});

// STRING --------------------------------------------------

addTypeMap(ASYTRIPType.STRING, (v, c) => {
    return "String";
});

addExpressMap(ASYTRIPType.STRING, (v, c, inits) => {

    if (v.val) {
        return `String::from("${v.val}")`;
    } else {
        return "String::from(\"\")";
    }
});

// TOKEN --------------------------------------------------

addTypeMap(ASYTRIPType.TOKEN, (v, c) => "Token");

addExpressMap(ASYTRIPType.TOKEN, (v, c, inits) => {

    if (!isNaN(v.arg_pos ?? NaN)) {
        return inits.push_closure(`if let HCO::TOKEN($$) = ${`v` + v.arg_pos}`);
        return `v` + v.arg_pos;
    }
    return "null";
});


// NUMERIC TYPES-------------------------------------------
addTypeMap(ASYTRIPType.F64, (v, c) => "f64");
addTypeMap(ASYTRIPType.F32, (v, c) => "f32");
addTypeMap(ASYTRIPType.I64, (v, c) => "164");
addTypeMap(ASYTRIPType.I32, (v, c) => "i32");
addTypeMap(ASYTRIPType.I16, (v, c) => "i16");
addTypeMap(ASYTRIPType.I8, (v, c) => "i8");

addExpressMap(ASYTRIPType.F64, (v, c, inits) => {
    const val = parseFloat(v.val ?? "0").toFixed(20).replace(/0/g, " ").trim().replace(/ /g, "0") + "0";
    if (val[0] == ".")
        return "0" + val;
    return val;
});

addExpressMap(ASYTRIPType.F32, (v, c, inits) => {
    const val = parseFloat(v.val ?? "0").toFixed(20).replace(/0/g, " ").trim().replace(/ /g, "0") + "0";
    if (val[0] == ".")
        return "0" + val;
    return val;
});

addExpressMap(ASYTRIPType.I64, (v, c, inits) => {
    const val = parseInt(v.val ?? "0").toFixed(20).replace(/0/g, " ").trim().replace(/ /g, "0") + "0";
    return val;
});

addExpressMap(ASYTRIPType.I32, (v, c, inits) => {
    const val = parseInt(v.val ?? "0").toFixed(20).replace(/0/g, " ").trim().replace(/ /g, "0") + "0";
    return val;
});
addExpressMap(ASYTRIPType.I16, (v, c, inits) => {
    const val = parseInt(v.val ?? "0").toFixed(20).replace(/0/g, " ").trim().replace(/ /g, "0") + "0";
    return val;
});

addExpressMap(ASYTRIPType.I8, (v, c, inits) => {
    const val = parseInt(v.val ?? "0").toFixed(20).replace(/0/g, " ").trim().replace(/ /g, "0") + "0";
    return val;
});

// NULL ---------------------------------------------------

addExpressMap(ASYTRIPType.NULL, (v, c, inits) => "null");

// BOOL ---------------------------------------------------
addTypeMap(ASYTRIPType.BOOL, (v, c) => "bool");

addExpressMap(ASYTRIPType.BOOL, (v, c, inits) => (v.val + "") || "false");

// CONVERT_TYPE ------------------------------------------

const A = ASYTRIPType;


const conversion_table =
{
    [A.F64]:
        (t: number, v: string, i: Inits): string => "" + ({
            [A.F64]: v, [A.F32]: `${v} as f64`, [A.I64]: `${v} as f64`, [A.I32]: `${v} as f64`, [A.I16]: `${v} as f64`, [A.I8]: `${v} as f64`, [A.BOOL]: `${v} as f64`, [A.NULL]: "0.0",
            [A.TOKEN]: `${v}.to_f64()`, [A.STRING]: `${v}`, [A.STRUCT]: `${v}.to_f64_()`, [A.VECTOR]: `(${v}.len() as f64)`, [A.PRODUCTION]: `(${v}.len() as f64)`
        })[t],
    [A.F32]:
        (t: number, v: string, i: Inits): string => "" + ({
            [A.F64]: `${v} as f32`, [A.F32]: v, [A.I64]: `${v} as f32`, [A.I32]: `${v} as f32`, [A.I16]: `${v} as f32`, [A.I8]: `${v} as f32`, [A.BOOL]: `${v} as f32`, [A.NULL]: "0.0",
            [A.TOKEN]: `${v}.to_f32()`, [A.STRING]: `${v}`, [A.STRUCT]: `${v}.to_f32()`, [A.VECTOR]: `(${v}.len() as f32)`, [A.PRODUCTION]: `(${v}.len() as f32)`
        })[t],
    [A.I64]:
        (t: number, v: string, i: Inits): string => "" + ({
            [A.F64]: `${v} as i64`, [A.F32]: `${v} as i64`, [A.I64]: v, [A.I32]: `${v} as i64`, [A.I16]: `${v} as i64`, [A.I8]: `${v} as i64`, [A.BOOL]: `${v} as i64`, [A.NULL]: "0i64",
            [A.TOKEN]: `${v}.to_i64()`, [A.STRING]: `${v}`, [A.STRUCT]: `${v}.to_i64()`, [A.VECTOR]: `(${v}.len() as i64)`, [A.PRODUCTION]: `(${v}.len() as i64)`
        })[t],
    [A.I32]:
        (t: number, v: string, i: Inits): string => "" + ({
            [A.F64]: `${v} as i32`, [A.F32]: `${v} as i32`, [A.I64]: `${v} as i32`, [A.I32]: v, [A.I16]: `${v} as i32`, [A.I8]: `${v} as i32`, [A.BOOL]: `${v} as i32`, [A.NULL]: "0i32",
            [A.TOKEN]: `${v}.to_i32()`, [A.STRING]: `${v}`, [A.STRUCT]: `${v}.to_i32()`, [A.VECTOR]: `(${v}.len() as i32)`, [A.PRODUCTION]: `(${v}.len() as i32)`
        })[t],
    [A.I16]:
        (t: number, v: string, i: Inits): string => "" + ({
            [A.F64]: `${v} as i16`, [A.F32]: `${v} as i16`, [A.I64]: `${v} as i16`, [A.I32]: `${v} as i16`, [A.I16]: v, [A.I8]: `${v} as i16`, [A.BOOL]: `${v} as i16`, [A.NULL]: "0i16",
            [A.TOKEN]: `${v}.to_i16()`, [A.STRING]: `${v}`, [A.STRUCT]: `${v}.to_i16()`, [A.VECTOR]: `(${v}.len() as i16)`, [A.PRODUCTION]: `(${v}.len() as i16)`
        })[t],
    [A.I8]:
        (t: number, v: string, i: Inits): string => "" + ({
            [A.F64]: `${v} as i8`, [A.F32]: `${v} as i8`, [A.I64]: `${v} as i8`, [A.I32]: `${v} as i8`, [A.I16]: `${v} as i8`, [A.I8]: v, [A.BOOL]: `${v} as i8`, [A.NULL]: "0i8",
            [A.TOKEN]: `${v}.to_i8()`, [A.STRING]: `${v}`, [A.STRUCT]: `${v}.to_i8()`, [A.VECTOR]: `(${v}.len() as i8)`, [A.PRODUCTION]: `(${v}.len() as i8)`
        })[t],
    [A.BOOL]:
        (t: number, v: string, i: Inits): string => "" + ({
            [A.F64]: `${v} as bool`, [A.F32]: `${v} as bool`, [A.I64]: `${v} as bool`, [A.I32]: `${v} as bool`, [A.I16]: `${v} as bool`, [A.I8]: `${v} as bool`, [A.BOOL]: v, [A.NULL]: "false",
            [A.TOKEN]: `${v}.to_bool()`, [A.STRING]: `${v}`, [A.STRUCT]: `${v}.to_bool()`, [A.VECTOR]: `(${v}.len() > 0)`, [A.PRODUCTION]: `${v}.to_f64()`
        })[t],
    [A.NULL]:
        (t: number, v: string, i: Inits): string => "" + ({
            [A.F64]: "null", [A.F32]: "null", [A.I64]: "null", [A.I32]: "null", [A.I16]: "null", [A.I8]: "null", [A.BOOL]: "null", [A.NULL]: /*       */ v, [A.TOKEN]: `null`,
            [A.STRUCT]: "null", [A.STRING]: "null", [A.VECTOR]: "null", [A.PRODUCTION]: `${v}.to_f64()`
        })[t],
    [A.STRING]:
        (t: number, v: string, i: Inits): string => "" + ({
            [A.F64]: `${v}.String()`, [A.F32]: `${v}.String()`, [A.I64]: `${v}.String()`, [A.I32]: `${v}.String()`, [A.I16]: `${v}.String()`, [A.I8]: `${v}.String()`,
            [A.BOOL]: `${v}.String()`, [A.NULL]: /*       */ "\"\".to_string()", [A.TOKEN]: `${v}.String()`, [A.STRING]: `${v}`, [A.STRUCT]: `${v}.String()`, [A.VECTOR]: `${v}.String()`,
            [A.PRODUCTION]: `${v}.String()`
        })[t],
    [A.TOKEN]:
        (t: number, v: string, i: Inits): string => "" + ({
            [A.F64]: `null`, [A.F32]: `null`, [A.I64]: `null`, [A.I32]: `null`, [A.I16]: `null`, [A.I8]: `null`,
            [A.BOOL]: `null`, [A.NULL]: /*       */ "null", [A.TOKEN]: v, [A.STRING]: `${v}`, [A.STRUCT]: `null`, [A.VECTOR]: `null`,
            [A.PRODUCTION]: `${v}.Token()`
        })[t],
    //[A.VECTOR]:
    //    (t: number, v: string, i : Inits): string => "" + ({
    //        [A.F64]: `null`, [A.F32]: `null`, [A.I64]: `null`, [A.I32]: `null`, [A.I16]: `null`, [A.I8]: `null`,
    //        [A.BOOL]: `null`, [A.NULL]: /*       */ "null", [A.TOKEN]: v, [A.STRING]: `${v}`, [A.STRUCT]: `null`, [A.VECTOR]: `...(${v})`, [A.PRODUCTION]: `...(${v})`
    //    })[t],
};


addExpressMap(ASYTRIPType.CONVERT_TYPE, (v, c, inits) => {
    const val = getExpressionString(v.value, c, inits);
    const type = getResolvedType(v.value, c)[0];
    if (v.value.type == ASYTRIPType.PRODUCTION)
        return conversion_table[v.conversion_type.type](v.value.type, val, inits);
    return conversion_table[v.conversion_type.type](type.type, val, inits);
});

function refIsArg(ref: string) {
    return ref.match(/^v[0-9]+$/);
}

function productionToType(ref: string, init: Inits, type: ASYTRIPType) {
    if (!refIsArg(ref))
        return ref;

    switch (type) {
        case ASYTRIPType.STRING:
            return `${ref}.String()`;
        case ASYTRIPType.TOKEN:
            return `${ref}.Token()`;
    }

    return ref;
}