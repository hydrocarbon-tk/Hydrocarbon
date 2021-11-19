/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import {
    ASYTRIPContext,
    ASYTRIPType,
    ASYTRIPTypeObj,
    GrammarObject,
    ResolvedProp
} from '@hctoolkit/common';
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
    TypesAre, TypesRequiresDynamic
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
        const val = getExpressionString(v, c, inits);
        const type = getResolvedType(v, c)[0];
        if (!check(type))
            return convert(val, type);
        return val;
    };
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
    } = prop;

    let type_string = "any";

    if (types.length == 0) {
        type_string = "interface{}";
    } else if (HAVE_STRUCT) {
        /* const names = [
            ...prop.struct_types.classes.map(s => "c_" + s),
            ...prop.struct_types.structs
        ];
        type_string = `${names.join(" | ")}`; */
        if (types.length > 1)
            type_string = `HCNode`;
        else
            type_string = `&${types[0].name}`;

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

            if (vec_types.length > 1)
                type_string = `[] HCNode`;
            else
                type_string = `[] &${types[0].name}`;
        }

    } else if (REQUIRES_DYNAMIC) {
        type_string = `interface{}`;
    } else if (TypesAre(types, TypeIsVector)) {
        type_string = getTypeString(types[0], context);
    } else if (types[0])
        type_string = getTypeString(types[0], context);
    else
        type_string = "interface{}";

    return type_string;
}

export function createGoTypes(grammar: GrammarObject, context: ASYTRIPContext) {

    const structs = [...context.structs];

    const resolved_struct_types: Map<string, Map<string, ResolvedProp>> = new Map();

    const strings = [
        //Header ------------------------------------------------------------------------
        `
import (
    . "candlelib/hc_completer"
)`
    ];

    //Classes ------------------------------------------------------------------------
    /*     for (const class_ of [...context.class.keys()]) {
            const nodes = structs.filter(([, s]) => s.classes.has(class_));
    
            const class_type = `
    enum ${class_}{   
        ${nodes.map(([name, value]) => {
                return `${name}(Box<${name}>)`;
            }).join(",\n")} \n}
    `;
    
            strings.push(class_type);
        } */

    //Structs ------------------------------------------------------------------------
    for (const [struct_name, struct] of context.structs) {
        const prop_vals = generateResolvedProps(struct,
            context,
            resolved_struct_types,
            getTypeString,
            GenerateTypeString
        );

        const struct_props = prop_vals.filter(p => p.HAVE_STRUCT || p.HAVE_STRUCT_VECTORS);

        let i = 0;
        const struct_strings = [`
type ${struct_name} struct {
    tok Token
    ${prop_vals.map(({ name: n, type: v }) => `${n} ${v}`).join("\n")}
}
func new${struct_name}( tok *Token, ${prop_vals.map(({ name: n, type: v }) => `_${n} ${v}`).join(", ")}) *${struct_name} {
    return &${struct_name}{
        tok: *tok,
        ${prop_vals.map(({ name: n }) => {
            return `${n} : _${n}`;
        }).map(s => s + ",").join("\n        ")}
    }
}

${struct_props.flatMap(({ name: prop_name, type: v, types, prop: p, HAS_NULL }, j) => {
            const HAVE_STRUCT = TypesInclude(types, TypeIsStruct);
            const HAVE_STRUCT_VECTORS = types.filter(TypeIsVector).some(v => TypesInclude(v.types, TypeIsStruct));
            const ifs = [];

            let out_type = "HCNode";

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
    switch child {
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
            return "";
            return `
func (node *${struct_name}) replace_${prop_name}(child HCNode,${HAVE_STRUCT_VECTORS ? "index int," : ""}) ${out_type} {
    ${ifs.join(" else ")}
}`;
        }).join("\n")}
`,
        //Iterator Implementation ------------------------------------------------------------------------
        `

func (node *${struct_name}) Iterate( yield HCNodeIterator, parent HCNode, i int, j int,) {
    
    yield(node, parent, i, j);
        
    ${struct_props.flatMap(({ name: n, type: v, types, prop: p, HAS_NULL, HAVE_STRUCT }, j) => {

            if (j == 0) i = 0;
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
            } else {

                const vectors = types.filter(TypeIsVector);

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
                            child.Iterate(_yield, &mut NodeIteration::${struct_name}(mut_me), ${i}, j as i32)   
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

            i++;
            return "";
            return ifs.join(" else ");
        }).filter(i => !!i).join("\n    ")}
    
}

func (node *${struct_name}) Replace(child HCNode, i int, j int){

/*     match i{
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
    }; */
}


func (node *${struct_name}) String() string{
    return node.tok.String()
}

func (node *${struct_name}) F64() float64{ return 0 }
func (node *${struct_name}) F32() float32{ return 0 }
func (node *${struct_name}) I64() int64{ return 0 }
func (node *${struct_name}) I32() int32{ return 0 }
func (node *${struct_name}) I16() int16{ return 0 }
func (node *${struct_name}) I8() int8{ return 0 }

func (node *${struct_name}) BOOL() bool{ return false }


func (node *${struct_name}) Token() *Token{
    return &node.tok
}
func (node *${struct_name}) GetType() uint32{
    return ${context.type.get(struct.name)}
}
func (node *${struct_name}) Type() uint32{
    return ${context.type.get(struct.name)}
}
`];
        strings.push(...struct_strings);
    }

    //Functions ------------------------------------------------------------------------

    const fns = new Map();
    const ids = [];


    for (const [id, { args, struct: name, source }] of context.fn_map) {

        const length = grammar.bodies[id].sym.length;

        const init = ["i := len(args)-1"];

        for (let i = 0; i < length; i++) {
            init.push(`v${length - i - 1} := args[i]`);
            init.push(`args = append(args[:i], args[i+1:]...)`);
            init.push(`i--`);
        }

        let init_string = init.join("\n");

        let str = "", inits = new Inits();

        if (args.length == 0 && !name) {
            if (length == 1)
                str = "{ return args }";
            else
                str = `{  ${init_string}\n return append(args, v${length - 1}); }`;
        } else {

            const expression = args[0];
            const [type] = expression.types;
            const resolved_type = getResolvedType(type, context)[0];
            const data = getExpressionString(type, context, inits);
            if (TypeIsString(resolved_type)) {
                str = `{ 
    ${init_string}
    ${inits.render_go(`
    val := ${data}
    return append(args, HCGObjString{Val:val})
    `)}
}`;
            } else if (TypeIsDouble(resolved_type)) {
                str = `{ 
                    ${init_string}
                    ${inits.render_go(`
                    val := ${data}
                    return append(args, HCGObjDOUBLE{Val:val})
                    `)}
                }`;
            } else {
                str = `{ 
    ${init_string}
    ${inits.render_go(`
    return append(args, ${data})
    `)}
}`;
            }
        }

        const hash = str.replace(/[ \n]/g, "");

        if (!fns.has(hash)) {
            let i = fns.size;
            fns.set(hash, {
                size: fns.size,
                name: `_FN${i}_`,
                str: `func _FN${i}_ (args []HCObj, tok *Token) []HCObj ` + str
            });
        }

        ids[id] = fns.get(hash).name;

    }

    const functions = `
${[...fns.values()].map(k => k.str).join("\n")}
`;
    strings.push(functions);

    const function_map = `
var FunctionMaps = []ReduceFunction  {
    ${ids.map(i => i + ",").join("\n    ")}
}`;

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

    if (!isNaN(v.arg_pos)) {
        return `v${v.arg_pos}`;
    }
    return "null";
});
addExpressMap(ASYTRIPType.STRUCT, (v, c, inits) => {

    const name = v.name;

    if (v.args) {
        const args = v.args;

        const struct = c.structs.get(name);
        //Create an initializer function for this object
        const data = [...struct.properties]
            .map(([name]) => {
                const a = args.filter(a => a.name == name)[0];
                if (a) {
                    const type = a.types[0];
                    const r_types = getResolvedType(type, c).filter(TypeIsNotNull);
                    const val = getExpressionString(type, c, inits);
                    if (r_types.length == 0) {

                    } else if (r_types.length == 1) {
                        if (TypeIsStruct(r_types[0])) {
                            return `(${val}).(*${r_types[0].name})`;
                        }
                    }

                    return val;

                } else {
                    return "nil";
                }
            }
            ).map(s => s + ",").join("\n        ");

        const ref = inits.push(`new${name}(\n        tok,\n        ${data}\n    ) \n`);

        return ref;
    } else if (v.arg_pos) {
        return "v" + v.arg_pos;
    } else
        return v.name;
});

addExpressMap(ASYTRIPType.OR, (v, c, inits) => {

    const { left: l, right: r } = v;
    const lv = getTypeString(l, c);
    const rv = getTypeString(r, c);

    if (lv == "nil")
        return getExpressionString(r, c, inits);

    if (rv == "nil")
        return getExpressionString(l, c, inits);

    return `${getExpressionString(l, c, inits)} || ${getExpressionString(r, c, inits)}`;
});
addExpressMap(ASYTRIPType.ADD, (v, c, inits) => {
    const { left: l, right: r } = v;
    const type_l = getResolvedType(l, c)[0];
    const type_r = getResolvedType(r, c)[0];
    const left = getExpressionString(l, c, inits);
    const right = getExpressionString(r, c, inits);


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

    const ref = inits.push_ref(`(${getExpressionString(v.struct, c, inits)}).(${getTypeString(v.struct, c)})`);

    const prop = v.property;

    return `${ref}.${prop}`;
});

addExpressMap(ASYTRIPType.VECTOR_PUSH, (v, c, inits) => {

    let vector = getExpressionString(v.vector, c, inits);
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
            push_ref = inits.push(`${vector}.(*[]interface{})`);
        }

        for (const arg of v.args) {

            let val = getExpressionString(arg, c, inits);

            if (!isNaN(arg.arg_pos)) {
                val = inits.push(`${val}`);
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

        return inits.push(`&HCGObjNodeArray{Val: [HCNode] { ${vals.join(", ")}}}`);
    } else {

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

            inits.push(`${push_ref}.push(${val});`, false);
        }

    }

    return `${vector}`;
});


addExpressMap(ASYTRIPType.VECTOR, (v, c, inits) => {

    const types = v.types.flatMap(v => getResolvedType(v, c));

    if (types.length == 1) {
        const type = types[0];

        if (TypeIsString(type) || TypeIsToken(type)) {
            const vals = v.args.map(convertArgsToType(c, inits, TypeIsString, convertValToString));

            return inits.push(`&HCGObjStringArray{Val: []string { ${vals.join(", ")}}}`);
        } else if (TypeIsDouble(type)) {
            const vals = v.args.map(convertArgsToType(c, inits, TypeIsDouble, convertValToDouble));

            return inits.push(`&HCGObjDoubleArray{Val: []float64 { ${vals.join(", ")}}}`);
        } else if (TypeIsStruct(type)) {

            const vals = v.args.map(convertArgsToType(c, inits, TypeIsNull, (a, t) => {
                return `(${a}).(${getTypeString(t, c)})`;
            }));

            return inits.push(`${getTypeString(v, c)}{ ${vals.join(", ")}}`, true);
        } else {
            return `[${v.args.map(t => getExpressionString(t, c, inits))
                .setFilter().join(",")}]`;
        }
    } else if (TypesAre(types, TypeIsStruct)) {
        const vals = v.args.map(convertArgsToType(c, inits, TypeIsStruct, _ => `nil`));

        return inits.push(`&HCGObjNodeArray{Val: []HCNode { ${vals.join(", ")}}}`);
    } else {
        return `[]HCObj`;
    }
});

// STRING --------------------------------------------------

addTypeMap(ASYTRIPType.STRING, (v, c) => {
    return "string";
});

addExpressMap(ASYTRIPType.STRING, (v, c, inits) => {

    if (v.val) {
        return `"${v.val}"`;
    } else {
        return `""`;
    }
});

// TOKEN --------------------------------------------------

addTypeMap(ASYTRIPType.TOKEN, (v, c) => "Token");

addExpressMap(ASYTRIPType.TOKEN, (v, c, inits) => {
    if (!isNaN(v.arg_pos)) {
        return `v${v.arg_pos}`;
    }
    return "null";
});


// NUMERIC TYPES-------------------------------------------
addTypeMap(ASYTRIPType.F64, (v, c) => "float64");
addTypeMap(ASYTRIPType.F32, (v, c) => "float32");
addTypeMap(ASYTRIPType.I64, (v, c) => "int64");
addTypeMap(ASYTRIPType.I32, (v, c) => "int32");
addTypeMap(ASYTRIPType.I16, (v, c) => "int16");
addTypeMap(ASYTRIPType.I8, (v, c) => "int8");

addExpressMap(ASYTRIPType.F64, (v, c, inits) => {
    const val = parseFloat(v.val).toFixed(20).replace(/0/g, " ").trim().replace(/ /g, "0") + "0";
    if (val[0] == ".")
        return "0" + val;
    return val;
});

addExpressMap(ASYTRIPType.F32, (v, c, inits) => {
    const val = parseFloat(v.val).toFixed(20).replace(/0/g, " ").trim().replace(/ /g, "0") + "0";
    if (val[0] == ".")
        return "0" + val;
    return val;
});

addExpressMap(ASYTRIPType.I64, (v, c, inits) => {
    const val = parseInt(v.val).toFixed(20).replace(/0/g, " ").trim().replace(/ /g, "0") + "0";
    return val;
});

addExpressMap(ASYTRIPType.I32, (v, c, inits) => {
    const val = parseInt(v.val).toFixed(20).replace(/0/g, " ").trim().replace(/ /g, "0") + "0";
    return val;
});
addExpressMap(ASYTRIPType.I16, (v, c, inits) => {
    const val = parseInt(v.val).toFixed(20).replace(/0/g, " ").trim().replace(/ /g, "0") + "0";
    return val;
});

addExpressMap(ASYTRIPType.I8, (v, c, inits) => {
    const val = parseInt(v.val).toFixed(20).replace(/0/g, " ").trim().replace(/ /g, "0") + "0";
    return val;
});

// NULL ---------------------------------------------------

addExpressMap(ASYTRIPType.NULL, (v, c, inits) => "nil");

// BOOL ---------------------------------------------------
addTypeMap(ASYTRIPType.BOOL, (v, c) => "boolean");

addExpressMap(ASYTRIPType.BOOL, (v, c, inits) => (v.val + "") || "false");

// CONVERT_TYPE ------------------------------------------

const A = ASYTRIPType;

const conversion_table =
{
    [A.F64]:
        (t, v) => ({ [A.F64]: /*       */ v, [A.F32]: `float64(${v})`, [A.I64]: `float64(${v})`, [A.I32]: `float64(${v})`, [A.I16]: `float64(${v})`, [A.I8]: `float64(${v})`, [A.BOOL]: `float64(${v})`, [A.NULL]: "0.0", [A.TOKEN]: `${v}.F64()`, [A.STRUCT]: `${v}.F64()`, [A.VECTOR]: `${v}.F64()` })[t],
    [A.F32]:
        (t, v) => ({ [A.F64]: `float32(${v})`, [A.F32]: /*       */ v, [A.I64]: `float32(${v})`, [A.I32]: `float32(${v})`, [A.I16]: `float32(${v})`, [A.I8]: `float32(${v})`, [A.BOOL]: `float32(${v})`, [A.NULL]: "0.0", [A.TOKEN]: `${v}.F32()`, [A.STRUCT]: `${v}.F32()`, [A.VECTOR]: `${v}.F32()` })[t],
    [A.I64]:
        (t, v) => ({ [A.F64]: `int64(${v})`, [A.F32]: `int64(${v})`, [A.I64]: /*       */ v, [A.I32]: `int64(${v})`, [A.I16]: `int64(${v})`, [A.I8]: `int64(${v})`, [A.BOOL]: `int64(${v})`, [A.NULL]: " 0 ", [A.TOKEN]: `${v}.I64()`, [A.STRUCT]: `${v}.I64()`, [A.VECTOR]: `${v}.I64()` })[t],
    [A.I32]:
        (t, v) => ({ [A.F64]: `int32(${v})`, [A.F32]: `int32(${v})`, [A.I64]: `int32(${v})`, [A.I32]: /*       */ v, [A.I16]: `int32(${v})`, [A.I8]: `int32(${v})`, [A.BOOL]: `int32(${v})`, [A.NULL]: " 0 ", [A.TOKEN]: `${v}.I32()`, [A.STRUCT]: `${v}.I32()`, [A.VECTOR]: `${v}.I32()` })[t],
    [A.I16]:
        (t, v) => ({ [A.F64]: `int16(${v})`, [A.F32]: `int16(${v})`, [A.I64]: `int16(${v})`, [A.I32]: `int16(${v})`, [A.I16]: /*       */ v, [A.I8]: `int16(${v})`, [A.BOOL]: `int16(${v})`, [A.NULL]: " 0 ", [A.TOKEN]: `${v}.I16()`, [A.STRUCT]: `${v}.I16()`, [A.VECTOR]: `${v}.I16()` })[t],
    [A.I8]:
        (t, v) => ({ [A.F64]: `int8(${v}) `, [A.F32]: `int8(${v}) `, [A.I64]: `int8(${v}) `, [A.I32]: `int8(${v}) `, [A.I16]: `int8(${v}) `, [A.I8]: /*       */ v, [A.BOOL]: `int8(${v}) `, [A.NULL]: " 0 ", [A.TOKEN]: `${v}.I8() `, [A.STRUCT]: `${v}.I8() `, [A.VECTOR]: `${v}.I8() `, })[t],
    [A.BOOL]:
        (t, v) => ({ [A.F64]: `(${v} == 0)`, [A.F32]: `(${v} == 0)`, [A.I64]: `(${v} == 0)`, [A.I32]: `(${v} == 0)`, [A.I16]: `(${v} == 0)`, [A.I8]: `(${v} == 0)`, [A.BOOL]: /**/ v, [A.NULL]: "false", [A.TOKEN]: `${v}.BOOL()`, [A.STRUCT]: `${v}.BOOL()`, [A.VECTOR]: `${v}.BOOL()` })[t],
    [A.NULL]:
        (t, v) => ({ [A.F64]: "nil  ", [A.F32]: "nil  ", [A.I64]: "nil  ", [A.I32]: "nil  ", [A.I16]: "nil  ", [A.I8]: "nil  ", [A.BOOL]: "nil  ", [A.NULL]: /*       */ v, [A.TOKEN]: `nil  `, [A.STRUCT]: "nil  ", [A.VECTOR]: "nil  " })[t],
    [A.STRING]:
        (t, v) => ({
            [A.F64]: `${v}.String()`, [A.F32]: `${v}.String()`, [A.I64]: `${v}.String()`, [A.I32]: `${v}.String()`, [A.I16]: `${v}.String()`, [A.I8]: `${v}.String()`,
            [A.BOOL]: `${v}.String()`, [A.NULL]: /*       */ '""""', [A.TOKEN]: `${v}.String()`, [A.STRUCT]: `${v}.String()`, [A.VECTOR]: `${v}.String()`
        })[t],
};

addExpressMap(ASYTRIPType.CONVERT_TYPE, (v, c, inits) => {
    const val = getExpressionString(v.value, c, inits);
    const type = getResolvedType(v.value, c)[0];

    return conversion_table[v.conversion_type.type](type.type, val);
});