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
    TypesAreNot,
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
            return v.name;
        }],
        [ASYTRIPType.STRING, (v, c) => {
            if (v.val) {
                return `"${v.val}"`;
            } else {
                return "string";
            }
        }],
        [ASYTRIPType.TOKEN, (v, c) => "Token"],
        [ASYTRIPType.DOUBLE, (v, c) => "number"],
        [ASYTRIPType.VECTOR, (v, c) => {
            return `(${v.args.flatMap(a => {
                const type = getResolvedType(v, c)[0];
                return type_mapper.get(type.type)(type);
            }).setFilter().join(" | ")
                })[]`;
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
                return `const ref_${i} = ${str}`;
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
            return inits.push(`[${v.args.map(t => expr_mapper.get(t.type)(t, c, inits))
                .setFilter().join(",")}]`);
        }],
        [ASYTRIPType.ADD, (v: ASYTRIPTypeObj[ASYTRIPType.ADD], c: ASYTRIPContext, inits: Inits) => {
            const { left: l, right: r } = v;
            const left = expr_mapper.get(l.type)(l, c, inits);
            const right = expr_mapper.get(r.type)(r, c, inits);
            return `${left} + ${right}`;
        }],
        [ASYTRIPType.SUB, (v: ASYTRIPTypeObj[ASYTRIPType.SUB], c: ASYTRIPContext, inits: Inits) => {
            debugger;
        }],
        [ASYTRIPType.VECTOR_PUSH, (v: ASYTRIPTypeObj[ASYTRIPType.VECTOR_PUSH], c: ASYTRIPContext, inits: Inits) => {

            const vector = expr_mapper.get(v.vector.type)(v.vector, c, inits);

            const vals = v.args.map(v =>
                expr_mapper.get(v.type)(v, c, inits)
            ).join(",");

            inits.push(`${vector}.push(${v.args.length > 1 ? `...[${vals}]` : vals})`, false);

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

export function createTsTypes(grammar: GrammarObject, context: ASYTRIPContext) {
    const strings = [
        `
import {Token} from "@candlelib/hydrocarbon";
type HCObjIterator = (node:HCNode, par:HCNode)=>void;
class HCNode {

}
`
    ];

    const class_type = `export enum Class { \n    ${[...context.class].map(([name, value]) => {
        return `${name} = ${value}`;
    }).join(",    \n")} \n}`;

    const type_type = `export enum Type { \n    ${[...context.type].map(([name, value]) => {
        return `${name} = ${value}`;
    }).join(",\n    ")} \n}`;

    strings.push(class_type);
    strings.push(type_type);

    for (const [name, struct] of context.structs) {
        const props = [...struct.properties];
        const prop_vals = props.map(([n, p]) => {
            const types = p.types.flatMap(t => getResolvedType(t, context));

            let union = types.filter(TypeIsNotNull)
                .map(type => type_mapper.get(type.type)(type))
                .setFilter()
                .sort()
                .join(" | ");

            return [n, union];

        });

        const str = `
export class ${name} extends HCNode {
    type: Type;
    tok: Token;
    ${prop_vals.map(([n, v]) => `${n}:${v}`).join("\n    ")}
    constructor( tok:Token, ${prop_vals.map(([n, v]) => `_${n}:${v}`).join(", ")}) {
        super();
        this.type= Type.${name};
        this.tok= tok;
        ${prop_vals.map(([n, p]) => {
            return `this.${n} = _${n}`;
        }).map(s => s + ";").join("\n        ")}
    }

    iterate(iter:HCObjIterator, parent:HCNode){

        iter(this, parent);

        ${props.flatMap(([n, p]) => {
            const types = p.types.flatMap(t => getResolvedType(t, context));

            if (TypesInclude(types, TypeIsStruct) && TypesAreNot(types, TypeIsVector)) {
                return [
                    `if (this.${n} instanceof HCNode){`,
                    `    this.${n}.iterate(iter, this)`,
                    `}`
                ];
            } else if (TypesInclude(types, TypeIsVector)) {

                const vectors = types.filter(TypeIsVector);
                const HAS_STRUCTS = vectors.some(v => TypesInclude(v.args, TypeIsStruct));

                if (HAS_STRUCTS) {
                    if (types.length > 1 && vectors.length !== types.length) {

                        return [
                            `if(Array.isArray(this.${n})){`,
                            `   for( let i = 0; i < this.${n}.length; i++) { `,
                            `       if (this.${n}[i] instanceof HCNode)`,
                            `          this.${n}[i].iterate(iter, this);`,
                            `   }`,
                            `}`
                        ];

                    } else {
                        return [
                            `for( let i = 0; i < this.${n}.length; i++){ `,
                            `   if (this.${n}[i] instanceof HCNode)`,
                            `      this.${n}[i].iterate(iter, this);`,
                            `}`
                        ];
                    }
                }

                if (TypesInclude(types, TypeIsStruct)) {
                    return [
                        `if (this.${n} instanceof HCNode){`,
                        `    this.${n}.iterate(iter, this)`,
                        `}`
                    ];
                }
            }

            return "";

        }).filter(i => !!i).join("\n    ")}
    }
}`;
        //Build interfaces for traversal, rendering, etc
        strings.push(str);
    }

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
            const data = expr_mapper.get(type.type)(type, context, inits);

            str = `{ 
    ${inits.render()}
    return ${data} 
}`;


        } else {
            const struct = context.structs.get(name);
            //Create an initializer function for this object
            const data = [...struct.properties]
                .map(([name]) => {
                    const a = args.filter(a => a.name == name)[0];
                    if (a) {
                        const type = a.types[0];
                        return expr_mapper.get(type.type)(type, context, inits);
                    } else {
                        return "null";
                    }
                }
                ).map(s => s + ",").join("\n        ");

            str = `{    
    ${inits.render()}
    return new ${name}(\n        tok,\n        ${data}\n    ) \n}`;
        }



        if (!fns.has(str)) {
            let i = fns.size;
            fns.set(str, {
                size: fns.size,
                name: `reduceFN${i}`,
                str: `function reduceFN${i} (args :any[], tok: Token) : any ` + str
            });
        }

        ids[id] = fns.get(str).name;

    }
    const functions = `
${[...fns.values()].map(k => k.str).join("\n")}
`;
    strings.push(functions);

    const function_map = `
export const FunctionMaps = [
    ${ids.map(i => i + ",").join("\n    ")}
]`;

    strings.push(function_map);

    return strings.join("\n\n");
}