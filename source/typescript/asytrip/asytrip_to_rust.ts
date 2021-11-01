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
import { Inits } from './Inits.js';
import { ASYTRIPContext, ASYTRIPType, ASYTRIPTypeObj } from './types.js';


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

function getTypeString<T extends keyof ASYTRIPTypeObj>(
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



type NewType_1<T extends keyof ASYTRIPTypeObj> = [T, (v: ASYTRIPTypeObj[T], c: ASYTRIPContext, inits: Inits) => any];

type NewType = NewType_1<ASYTRIPType>[];

function convertValToString(v, t) {
    if (TypeIsString(t))
        return `(HCGObjDouble{Val:${v}}).String()`;
    return `(${v}).String()`;
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

export function createRustTypes(grammar: GrammarObject, context: ASYTRIPContext) {
    console.log("--------------- RUST ------------------");

    const strings = [
        `
import (
    . "candlelib/hc_completer"
)
`
    ];

    const value_type = "uint32";
    const class_type = `const ( \n    ${[...context.class].map(([name, value]) => {
        return `Class${name} ${value_type} = ${value}`;
    }).join("\n")} \n)`;

    const type_type = `const ( \n    ${[...context.type].map(([name, value]) => {
        return `Type_${name} ${value_type} = ${value}`;
    }).join("\n    ")} \n)`;

    strings.push(class_type);
    strings.push(type_type);

    for (const [name, struct] of context.structs) {

        const props = [...struct.properties];
        const prop_vals = props.map(([n, p]) => {
            const types = p.types.flatMap(t => getResolvedType(t, context, new Set([name])));

            let type_string = "interface{}";

            const real_types = types.filter(TypeIsNotNull);

            let type = real_types[0];

            if (TypesAre(real_types, TypeIsStruct)) {
                if (real_types.length > 1)
                    type_string = "HCNode";
                else if (type)
                    type_string = getTypeString(type, context);
            } else if (TypesAre(real_types, TypeIsVector)) {
                type_string = getTypeString(real_types[0], context);
            } else if (TypesRequiresDynamic(types))
                type_string = "interface{}";
            else if (type)
                type_string = getTypeString(type, context);
            else
                type_string = "HCNode";

            return {
                name: n,
                type: type_string,
                types,
                prop: p
            };

        });

        let i = 0;
        const str = `
type ${name} struct {
    _type ${value_type}
    tok Token
    ${prop_vals.map(({ name: n, type: v }) => `${n} ${v}`).join("\n    ")}
}


func new${name}( tok *Token, ${prop_vals.map(({ name: n, type: v }) => `_${n} ${v}`).join(", ")}) *${name} {
    return &${name}{
        _type: Type_${name},
        tok: *tok,
        ${prop_vals.map(({ name: n }) => {
            return `${n} : _${n}`;
        }).map(s => s + ",").join("\n        ")}
    }
}

func (node *${name}) GetType() uint32 {
    return node._type
}

func (node *${name}) Iterate(yield HCNodeIterator, parent HCNode, i int, j int){

    yield(node, parent, i, j);
    ${prop_vals.flatMap(({ name: n, type: v, types, prop: p }, j) => {

            if (j == 0) i = 0;
            const HAVE_STRUCT = TypesInclude(types, TypeIsStruct);
            const ifs = [];
            if (HAVE_STRUCT) {
                if (TypesRequiresDynamic(types)) {
                    ifs.push([
                        `_struct, ok := node.${n}.(HCNode)`,
                        `if ok {`,
                        `    _struct.Iterate(yield, node, ${i}, 0)`,
                        `}`
                    ].join("\n"));
                } else {
                    ifs.push([
                        `if node.${n} != nil {`,
                        `    node.${n}.Iterate(yield, node, ${i}, 0)`,
                        `}`
                    ].join("\n"));
                }
            } else if (TypesInclude(types, TypeIsVector)) {

                const vectors = types.filter(TypeIsVector);
                const HAS_STRUCTS = vectors.some(v => TypesInclude(v.types, TypeIsStruct));

                if (HAS_STRUCTS) {

                    if (types.length > 1 && vectors.length !== types.length) {
                        ifs.push([
                            `if(Array.isArray(node.${n})){`,
                            `   for i := 0; i < len(node.${n}); i+=1 { `,
                            `       node.${n}[i].Iterate(yield, node, ${i}, i);`,
                            `   }`,
                            `}`
                        ].join("\n"));

                    } else {
                        ifs.push([
                            `for i := 0; i < len(node.${n}); i+=1 { `,
                            `   node.${n}[i].Iterate(yield, node, ${i}, i);`,
                            `}`
                        ].join("\n"));
                    }
                }
            }
            i++;
            return ifs.join(" else ");
        }).filter(i => !!i).join("\n    ")}
}

func (node *${name}) Replace(child HCNode, i int, j int){

    switch i{
    ${prop_vals.flatMap(({ name: n, type: v, types, prop: p }, j) => {

            if (j == 0) i = 0;

            const HAVE_STRUCT = TypesInclude(types, TypeIsStruct);

            const ifs = [];
            if (HAVE_STRUCT) {
                const structs = types.filter(TypeIsStruct);
                ifs.push([
                    `_struct, ok := child.(${(structs.length > 1) ? "HCNode" : "*" + structs[0].name})`,
                    `if ok {`,
                    `   node.${n} = _struct;`,
                    `}`
                ].join("\n"));
            } else if (TypesInclude(types, TypeIsVector)) {

                const vectors = types.filter(TypeIsVector);
                const HAS_STRUCTS = vectors.some(v => TypesInclude(v.types, TypeIsStruct));

                if (HAS_STRUCTS) {

                    if (types.length > 1 && vectors.length !== types.length) {
                        ifs.push([
                            `_array, ok := node.${n}(HCGObjNodeArray)`,
                            `if ok {`,
                            `   //node.${j}[i] = child`,
                            `}`
                        ].join("\n"));

                    } else {
                        ifs.push([
                            `for i := 0; i < len(node.${n}); i+=1 { `,
                            `   //node.${n}[i].Iterate(yield, child, ${i}, i);`,
                            `}`
                        ].join("\n"));
                    }
                }
            }

            if (ifs.length > 0) {
                return `case ${i++}:
                    ${ifs.join(" else ")}
                `;
            }

            return "";
        }).filter(i => !!i).join("\n    ")}
    }
}

func (node *${name}) String() string{
    return node.tok.String()
}

func (node *${name}) Double() float64{
    return 0
}

func (node *${name}) Token() *Token{
    return &node.tok
}

func (node *${name}) Type() uint32{
    return node._type
}
`;
        //Build interfaces for traversal, rendering, etc
        strings.push(str);
    }

    let i = 0;

    const fns = new Map();
    const ids = [];

    for (const [id, { args, struct: name }] of context.fn_map) {

        let str = "", inits = new Inits();



        if (args.length == 0 && !name) {

            str = `{ 
    ${inits.render_go()}
    return args[len(args)-1] 
}`;
        } else if (!name) {

            const expression = args[0];
            const [type] = expression.types;
            const resolved_type = getResolvedType(type, context)[0];
            const data = typeToExpression(type, context, inits);
            if (TypeIsString(resolved_type)) {
                str = `{ 
    ${inits.render_go()}
    val := ${data};
    return HCGObjString{Val:val}
}`;
            } else if (TypeIsDouble(resolved_type)) {


                str = `{ 
    ${inits.render_go()}
    val := ${data};
    return HCGObjDOUBLE{Val:val}
}`;
            } else {
                str = `{ 
    ${inits.render_go()}
    return ${data} 
}`;
            }

        } else {
            const struct = context.structs.get(name);
            //Create an initializer function for this object
            const data = [...struct.properties]
                .map(([name]) => {
                    const a = args.filter(a => a.name == name)[0];
                    if (a) {
                        const type = a.types[0];
                        const r_types = getResolvedType(type, context).filter(TypeIsNotNull);
                        const val = typeToExpression(type, context, inits);
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

            str = `{    
    ${inits.render_go()}
    return new${name}(\n        tok,\n        ${data}\n    ) \n}`;
        }



        if (!fns.has(str)) {
            let i = fns.size;
            fns.set(str, {
                size: fns.size,
                name: `_FN${i}_`,
                str: `func _FN${i}_ (args []HCObj, tok *Token) HCObj ` + str
            });
        }

        ids[id] = fns.get(str).name;

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
    return "* " + v.name;
});
addTypeMap(ASYTRIPType.STRING, (v, c) => {
    if (v.val) {
        return `"${v.val}"`;
    } else {
        return "string";
    }
});
addTypeMap(ASYTRIPType.TOKEN, (v, c) => "* Token");
addTypeMap(ASYTRIPType.DOUBLE, (v, c) => "float64");
addTypeMap(ASYTRIPType.BOOL, (v, c) => "bool");
addTypeMap(ASYTRIPType.VECTOR, (v, c) => {
    const types = v.types.flatMap(v => getResolvedType(v, c));

    if (types.length == 1) {
        return `[]${getTypeString(types[0], c)}`;
    } else if (TypesAre(types, TypeIsStruct)) {
        return `[]HCNode`;
    } else {
        return `[]HCObj`;
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

addExpressMap(ASYTRIPType.NULL, (v, c, inits) => "nil");

addExpressMap(ASYTRIPType.BOOL, (v, c, inits) => (v.val + "") || "false");

addExpressMap(ASYTRIPType.DOUBLE, (v, c, inits) => v.val);

addExpressMap(ASYTRIPType.CONVERT_BOOL, (v, c, inits) => {
    const val = typeToExpression(v.value, c, inits);

    if (val == "nil" || val == "false")
        return "false";

    if (val == "true")
        return "true";

    return `(${val}).Bool()`;
});

addExpressMap(ASYTRIPType.CONVERT_DOUBLE, (v, c, inits) => `(${typeToExpression(v.value, c, inits)}).Double()`);

addExpressMap(ASYTRIPType.CONVERT_STRING, (v, c, inits) => `(${typeToExpression(v.value, c, inits)}).String()`);

addExpressMap(ASYTRIPType.PRODUCTION, (v, c, inits) => {

    if (!isNaN(v.arg_pos)) {
        return `args[${v.arg_pos}]`;
    }
    return "null";
});
addExpressMap(ASYTRIPType.STRUCT, (v, c, inits) => {
    return v.name;
});
addExpressMap(ASYTRIPType.STRING, (v, c, inits) => {

    if (v.val) {
        return `"${v.val}"`;
    } else {
        return "string";
    }
});
addExpressMap(ASYTRIPType.TOKEN, (v, c, inits) => {
    if (!isNaN(v.arg_pos)) {
        return `args[${v.arg_pos}]`;
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
        typeToExpression(<ASYTRIPTypeObj[ASYTRIPType.VECTOR_PUSH]>{
            type: ASYTRIPType.VECTOR_PUSH,
            args: [r],
            vector: l
        }, c, inits);
        return "";
    }

    if (TypeIsVector(type_r)) {
        typeToExpression(<ASYTRIPTypeObj[ASYTRIPType.VECTOR_PUSH]>{
            type: ASYTRIPType.VECTOR_PUSH,
            args: [l],
            vector: r
        }, c, inits);
        return "";
    }

    if (TypeIsString(type_l) && !TypeIsString(type_r)) {

        return `(${left} + ${right}.String())`;
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

    const vector = typeToExpression(v.vector, c, inits);
    const vector_types = getResolvedType(v.vector, c).setFilter(t => {
        return t.type;
    }).filter(TypeIsVector);

    const types = vector_types.flatMap(v => v.types)
        .flatMap(v => getResolvedType(v, c))
        .setFilter(JSONFilter);

    if (types.length == 1) {

        if (TypeIsToken(types[0]) || TypeIsString(types[0])) {
            const vals = v.args.map(convertArgsToType(c, inits, TypeIsString, convertValToString));
            inits.push(`${vector}.(*HCGObjStringArray).Append(${vals.join(", ")})`, false);
        } else {

            const vals = v.args.map(convertArgsToType(c, inits, TypeIsNull, (a, t) => {
                return `(${a}).(${getTypeString(t, c)})`;
            }));

            inits.push(`${vector} = append(${vector},  ${vals.join(", ")})`, false);


        }
    } else if (TypesAre(types, TypeIsStruct)) {
        const vals = v.args.map(convertArgsToType(c, inits, TypeIsStruct, _ => `nil`));

        return inits.push(`&HCNode{Val: []HCNode { ${vals.join(", ")}}}`);
    } else {
        return `[]HCObj`;
    }

    return `${vector}`;
    /* 
        const vector = typeToExpression(v.vector, c, inits);
        const r_type = getResolvedType(v.vector, c)[0];
    
        if (TypeIsString(r_type)) {
            const vals = v.args.map(convertArgsToType(c, inits, TypeIsString, convertValToString));
            inits.push(`${vector}.Append(${vals.join(", ")})`, false);
        } else if (TypeIsDouble(r_type)) {
            const vals = v.args.map(convertArgsToType(c, inits, TypeIsDouble, convertValToDouble));
            inits.push(`${vector}.Append(${vals.join(", ")})`, false);
        } else if (TypeIsStruct(r_type)) {
            if (!TypesAre(v.args, TypeIsStruct)) {
                throw "Uh Oh";
            }
            const vals = v.args.map(convertArgsToType(c, inits, TypeIsDouble, v => `(${v}).Double()`));
            inits.push(`${vector}.Append(${vals.join(", ")})`, false);
        } else {
    
            const vals = v.args.map(v =>
                typeToExpression(v, c, inits)
            ).join(",");
    
            inits.push(`${vector}.Append(${v.args.length > 1 ? `...[${vals}]` : vals})`, false);
    
        }
        return `${vector}`; */
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
            return `[${v.args.map(t => typeToExpression(t, c, inits))
                .setFilter().join(",")}]`;
        }
    } else if (TypesAre(types, TypeIsStruct)) {
        const vals = v.args.map(convertArgsToType(c, inits, TypeIsStruct, _ => `nil`));

        return inits.push(`&HCNode{Val: []HCNode { ${vals.join(", ")}}}`);
    } else {
        return `[]HCObj`;
    }/* 

    if (!type) {

        const vals = v.args.map(convertArgsToType(c, inits, TypeIsString, convertValToString));

        return `[]interface{} {${vals.join(",")}}`;
    }

    if (TypeIsString(type)) {
        const vals = v.args.map(convertArgsToType(c, inits, TypeIsString, convertValToString));

        return inits.push(`&HCGObjStringArray{Val: []string { ${vals.join(", ")}}}`);
    } else if (TypeIsDouble(type)) {
        const vals = v.args.map(convertArgsToType(c, inits, TypeIsDouble, convertValToDouble));

        return inits.push(`&HCGObjDoubleArray{Val: []float64 { ${vals.join(", ")}}}`);
    } else if (TypeIsStruct(type)) {
        const vals = v.args.map(convertArgsToType(c, inits, TypeIsStruct, _ => `nil`));

        return inits.push(`&HCGObjNodeArray{Val: []HCNode { ${vals.join(", ")}}}`);
    } else {
        return `[${v.args.map(t => typeToExpression(t, c, inits))
            .setFilter().join(",")}]`;
    } */



    debugger;
});