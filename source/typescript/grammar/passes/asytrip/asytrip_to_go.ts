import { GrammarObject } from '../../../types/grammar_nodes';
import {
    getResolvedType,
    TypeIsDouble,
    TypeIsNotNull,
    TypeIsNull,
    TypeIsString,
    TypeIsStruct,
    TypeIsVector,
    TypesAre,
    TypesInclude,
    TypesRequiresDynamic
} from './common.js';
import { ASYTRIPContext, ASYTRIPType, ASYTRIPTypeObj } from './types';


const type_mapper = new Map(
    [
        [ASYTRIPType.NULL, (v, c) => "null"],
        [ASYTRIPType.PRODUCTION, (v, c) => {
            const type = getResolvedType(v, c)[0];
            return type_mapper.get(type.type)(type);
        }],
        [ASYTRIPType.STRUCT, (v, c) => {
            return "* " + v.name;
        }],
        [ASYTRIPType.STRING, (v, c) => {
            if (v.val) {
                return `"${v.val}"`;
            } else {
                return "string";
            }
        }],
        [ASYTRIPType.TOKEN, (v, c) => "* Token"],
        [ASYTRIPType.DOUBLE, (v, c) => "float64"],
        [ASYTRIPType.VECTOR, (v, c) => {
            return `[]HCObj`;
            debugger;
        }],
        [ASYTRIPType.ADD, (v, c) => {
            const type = getResolvedType(v, c)[0];
            return type_mapper.get(type.type)(type);
            debugger;
        }],
        [ASYTRIPType.SUB, (v, c) => {
            debugger;
        }],
        [ASYTRIPType.VECTOR_PUSH, (v, c) => {
            debugger;
        }],
    ]
);

class Inits {

    vals: { str: string, init: boolean; }[];
    constructor() {
        this.vals = [];
    }

    push(string: string, initialize: boolean = true) {

        const ref = "ref_" + this.vals.length;

        this.vals.push({ str: string, init: initialize });

        return ref;
    }

    render() {

        return this.vals.map(({ str, init }, i) => {
            if (init)
                return `ref_${i} := ${str}`;
            else
                return str;
        }).join("\n");
    }
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

const expr_mapper = new Map(
    <NewType>[
        [ASYTRIPType.NULL, (v, c: ASYTRIPContext, inits: Inits) => "null"],
        [ASYTRIPType.PRODUCTION, (v: ASYTRIPTypeObj[ASYTRIPType.PRODUCTION], c: ASYTRIPContext, inits: Inits) => {

            if (!isNaN(v.arg_pos)) {
                return `args[${v.arg_pos}]`;
            }
            return "null";
        }],
        [ASYTRIPType.STRUCT, (v: ASYTRIPTypeObj[ASYTRIPType.STRUCT], c: ASYTRIPContext, inits: Inits) => {
            return v.name;
        }],
        [ASYTRIPType.STRING, (v: ASYTRIPTypeObj[ASYTRIPType.STRING], c: ASYTRIPContext, inits: Inits) => {

            if (v.val) {
                return `"${v.val}"`;
            } else {
                return "string";
            }
        }],
        [ASYTRIPType.TOKEN, (v: ASYTRIPTypeObj[ASYTRIPType.TOKEN], c: ASYTRIPContext, inits: Inits) => {
            if (!isNaN(v.arg_pos)) {
                return `args[${v.arg_pos}]`;
            }
            return "null";
        }],
        [ASYTRIPType.DOUBLE, (v: ASYTRIPTypeObj[ASYTRIPType.DOUBLE], c: ASYTRIPContext, inits: Inits) => v.val],
        [ASYTRIPType.VECTOR, (v: ASYTRIPTypeObj[ASYTRIPType.VECTOR], c: ASYTRIPContext, inits: Inits) => {

            const type = getResolvedType(v.args[0], c)[0];

            if (TypeIsString(type)) {
                const vals = v.args.map(convertArgsToType(c, inits, TypeIsString, convertValToString));

                return inits.push(`&HCGObjStringArray{Val: []string { ${vals.join(", ")}}}`);
            } else if (TypeIsDouble(type)) {
                const vals = v.args.map(convertArgsToType(c, inits, TypeIsDouble, convertValToDouble));

                return inits.push(`&HCGObjDoubleArray{Val: []float64 { ${vals.join(", ")}}}`);
            } else if (TypeIsStruct(type)) {
                const vals = v.args.map(convertArgsToType(c, inits, TypeIsStruct, _ => `nil`));

                return inits.push(`&HCGObjNodeArray{Val: []HCObj { ${vals.join(", ")}}}`);
            } else {
                return `[${v.args.map(t => expr_mapper.get(t.type)(t, c, inits))
                    .setFilter().join(",")}]`;
            }



            debugger;
        }],
        [ASYTRIPType.ADD, (v: ASYTRIPTypeObj[ASYTRIPType.ADD], c: ASYTRIPContext, inits: Inits) => {
            const { left: l, right: r } = v;
            const left_type = getResolvedType(l, c)[0];
            const right_type = getResolvedType(r, c)[0];
            const left = expr_mapper.get(l.type)(l, c, inits);
            const right = expr_mapper.get(r.type)(r, c, inits);

            if (TypeIsString(left_type) && !TypeIsString(right_type)) {

                return `(${left} + ${right}.String())`;
            }

            return `${left} + ${right}`;
        }],
        [ASYTRIPType.SUB, (v: ASYTRIPTypeObj[ASYTRIPType.SUB], c: ASYTRIPContext, inits: Inits) => {
            debugger;
        }],
        [ASYTRIPType.VECTOR_PUSH, (v: ASYTRIPTypeObj[ASYTRIPType.VECTOR_PUSH], c: ASYTRIPContext, inits: Inits) => {

            const vector = expr_mapper.get(v.vector.type)(v.vector, c, inits);
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
                    expr_mapper.get(v.type)(v, c, inits)
                ).join(",");

                inits.push(`${vector}.Append(${v.args.length > 1 ? `...[${vals}]` : vals})`, false);

            }
            return `${vector}`;
        }],
    ]
);




function convertArgsToType(
    c: ASYTRIPContext,
    inits: Inits,
    check: (t: any) => boolean,
    convert: (a: string, t: ASYTRIPTypeObj[ASYTRIPType]) => string
): (val: ASYTRIPTypeObj[ASYTRIPType]) => string {
    return v => {
        const val = expr_mapper.get(v.type)(v, c, inits);
        const type = getResolvedType(v, c)[0];
        if (!check(type))
            return convert(val, type);
        return val;
    };
}

export function createGoTypes(grammar: GrammarObject, context: ASYTRIPContext) {
    console.log("--------------- GO ------------------");

    const strings = [
        `
import (
    . "candlelib/hc_recognizer"
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
            const types = p.types.flatMap(t => getResolvedType(t, context));

            if (TypesRequiresDynamic(types))
                return [n, "interface{}"];

            let type = types.filter(TypeIsNotNull)[0];

            return [n, type_mapper.get(type.type)(type)];

        });

        const str = `
type ${name} struct {
    _type ${value_type}
    tok Token
    ${prop_vals.map(([n, v]) => `${n} ${v}`).join("\n    ")}
}


func new${name}( tok *Token, ${prop_vals.map(([n, v]) => `_${n} ${v}`).join(", ")}) *${name} {
    return &${name}{
        _type: Type_${name},
        tok: *tok,
        ${prop_vals.map(([n, p]) => {
            return `${n} : _${n}`;
        }).map(s => s + ",").join("\n        ")}
    }
}

func (node *${name}) GetType() uint32 {
    return node._type
}

func (node *${name}) Iterate(yield HCObjIterator, parent HCObj){

    yield(node, parent);

    ${props.flatMap(([n, p]) => {
            const types = p.types.flatMap(t => getResolvedType(t, context));

            if (TypesInclude(types, TypeIsStruct) && (
                (types.length == 1)
                || TypesInclude(types, TypeIsNull)
                && types.length == 2)
            ) {
                return [
                    `if node.${n} != nil {`,
                    `    node.${n}.Iterate(yield, node)`,
                    `}`
                ];
            } else if (TypesInclude(types, TypeIsVector)) {

                const vectors = types.filter(TypeIsVector);
                const HAS_STRUCTS = vectors.some(v => TypesInclude(v.args, TypeIsStruct));

                if (HAS_STRUCTS) {
                    if (types.length > 1 && vectors.length !== types.length) {

                        return [
                            `if(Array.isArray(node.${n})){`,
                            `   for i := 0; i < len(node.${n}); i+=1 { `,
                            `       node.${n}[i].Iterate(yield, node);`,
                            `   }`,
                            `}`
                        ];

                    } else {
                        return [
                            `for i := 0; i < len(node.${n}); i+=1 { `,
                            `   node.${n}[i].Iterate(yield, node);`,
                            `}`
                        ];
                    }
                }
            }

            return "";

        }).filter(i => !!i).join("\n    ")}
}

func (node *${name}) String() string{
    return node.tok.String()
}

func (node *${name}) Double() float64{
    return 0
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



        if (!args && !name) {

            str = `{ 
    ${inits.render()}
    return args[len(args)-1] 
}`;
        } else if (!name) {

            const expression = args[0];
            const [type] = expression.types;
            const resolved_type = getResolvedType(type, context)[0];
            const data = expr_mapper.get(type.type)(type, context, inits);
            if (TypeIsString(resolved_type)) {
                str = `{ 
    ${inits.render()}
    val := ${data};
    return HCGObjString{Val:val}
}`;
            } else if (TypeIsDouble(resolved_type)) {


                str = `{ 
    ${inits.render()}
    val := ${data};
    return HCGObjDOUBLE{Val:val}
}`;
            } else {
                str = `{ 
    ${inits.render()}
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
                        const val = expr_mapper.get(type.type)(type, context, inits);
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
    ${inits.render()}
    return new${name}(\n        tok,\n        ${data}\n    ) \n}`;
        }



        if (!fns.has(str)) {
            let i = fns.size;
            fns.set(str, {
                size: fns.size,
                name: `reduceFN${i}`,
                str: `func reduceFN${i} (args []HCObj, tok *Token) HCObj ` + str
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

    return strings.join("\n\n");
}