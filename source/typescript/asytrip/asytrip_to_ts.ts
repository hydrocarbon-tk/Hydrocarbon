import { GrammarObject } from '../types/grammar_nodes';
import { formatArray } from '../utilities/format_array.js';
import {
    getResolvedType, TypeIsNotNull, TypeIsNull, TypeIsString,
    TypeIsStruct,
    TypeIsVector, TypesAre, TypesInclude
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

export function createTsTypes(grammar: GrammarObject, context: ASYTRIPContext) {
    const strings = [
        `
import {Token, ASTNode, iterate, HCObjIterator} from "@candlelib/hydrocarbon";
type HCObjIterator = (node:ASTNode<Type>, par:ASTNode<Type>, replace_prop_index:number, replace_array_index:number)=>void;
class ASTNode<T> {
    constructor(type: T, tok: Token) {
        this.type = type;
        this.tok = tok;
    }
    iterate(iter:HCObjIterator, parent:ASTNode<Type>,replace_prop_index:number, replace_array_index:number){}
    replace(node: ASTNode<Type>, node_index:number, array_index:number ){}
    type:T;
    tok:Token;
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

            if (n == "ref")
                debugger;
            const types = p.types.flatMap(t => getResolvedType(t, context, new Set([name])));
            const OPTIONAL = TypesInclude(types, TypeIsNull);
            let union = types.filter(TypeIsNotNull)
                .map(type => getTypeString(type, context))
                .setFilter()
                .sort()
                .join(" | ");

            if (!union) {
                union = "ASTNode<Type>";
            }

            return {
                name: n,
                type: union,
                types,
                prop: p,
                OPTIONAL
            };

        });
        let i = 0;
        const str = `
export class ${name} extends ASTNode<Type> {
    ${prop_vals.map(({ name: n, type: v, OPTIONAL }) => `${n}${OPTIONAL ? "?" : ""}:${v}`).join("\n    ")}
    constructor( tok:Token, ${prop_vals.map(({ name: n, type: v }) => `_${n}:${v}`).join(", ")}) {
        super(Type.${name}, tok);
        ${prop_vals.map(({ name: n }) => {
            return `this.${n} = _${n}`;
        }).map(s => s + ";").join("\n        ")}
    }

    iterate(iter:HCObjIterator, parent:ASTNode<Type>, replace_prop_index:number, replace_array_index:number){

        iter(this, parent, replace_prop_index, replace_array_index);

        ${prop_vals.flatMap(({ name: n, type: v, types, prop: p }, j) => {

            if (j == 0) i = 0;
            const HAVE_STRUCT = TypesInclude(types, TypeIsStruct);
            const ifs = [];
            if (HAVE_STRUCT) {
                if (!TypesAre(types, TypeIsStruct)) {
                    ifs.push([
                        `if (this.${n} instanceof ASTNode){`,
                        `    this.${n}.iterate(iter, this, ${i}, 0)`,
                        `}`
                    ].join("\n"));
                } else {
                    ifs.push(`this.${n}.iterate(iter, this, ${i}, 0)`);
                }
            } else if (TypesInclude(types, TypeIsVector)) {

                const vectors = types.filter(TypeIsVector);
                const HAS_STRUCTS = vectors.some(v => TypesInclude(v.args, TypeIsStruct));
                const HAVE_OTHERS = vectors.some(v => !TypesInclude(v.args, TypeIsStruct));

                if (HAS_STRUCTS) {

                    let val = [
                        `for( let i = 0; i < this.${n}.length; i++){ `,
                        HAVE_OTHERS ? `   if (this.${n}[i] instanceof ASTNode)` : "",
                        `      this.${n}[i].iterate(iter, this, ${i}, i);`,
                        `}`,
                    ];

                    if (types.length > 1 && vectors.length !== types.length)
                        val = [`if(Array.isArray(this.${n})){`, ...val, "}"];

                    ifs.push(val.join("\n"));
                }
            }
            i++;
            return ifs.join(" else ");
        }).filter(i => !!i).join("\n    ")}
    }
    
    replace( node: ASTNode<Type>, i:number, j:number ){
        ${prop_vals.length > 0 ? `
        switch(i){
            ${prop_vals.flatMap(({ name: n, type: v, types, prop: p }, j) => {

            if (j == 0) i = 0;

            const HAVE_STRUCT = TypesInclude(types, TypeIsStruct);

            const ifs = [];

            if (HAVE_STRUCT) {

                const structs = types.filter(TypeIsStruct);

                ifs.push([
                    `if(${structs.map(
                        s => `node instanceof ${s.name}`).join("\n                    ||")}){`,
                    `   this.${n} = node;`,
                    `}`,
                ].join("\n"));

            } else if (TypesInclude(types, TypeIsVector)) {

                const vectors = types.filter(TypeIsVector);
                const HAS_VECTOR_OF_STRUCTS = vectors.some(v => TypesInclude(v.args, TypeIsStruct));

                if (HAS_VECTOR_OF_STRUCTS) {

                    const structs = vectors.flatMap(v => v.args.filter(TypeIsStruct));

                    let val = [
                        `if(${structs.map(
                            s => `node instanceof ${s.name}`).join("\n                    ||")}){`,
                        `   this.${n}[j] = node;`,
                        `} else if(node === null){`,
                        `   this.${n}.splice(j,1);`,
                        `}`,
                    ];

                    if (types.length > 1 && vectors.length !== types.length)
                        val = [`if(Array.isArray(this.${n})){`, ...val, "}"];

                    ifs.push(val.join("\n"));

                }
            }

            if (ifs.length > 0) {
                return `case ${i++}:
                    ${ifs.join(" else ")}
                    break;
                `;
            }

            return "";

        }).filter(i => !!i).join("\n    ")}
        }` : ""}
    }
}`;
        //Build interfaces for traversal, rendering, etc
        strings.push(str);
    }

    const fns = new Map();
    const ids = [];

    for (const [id, { args, struct: name }] of context.fn_map) {

        let str = "", inits = new Inits();



        if (args.length == 0 && !name) {

            str = `{ 
    ${inits.render_ts()}
    return args[args.length-1] 
}`;
        } else if (!name) {
            const expression = args[0];
            const [type] = expression.types;
            const data = typeToExpression(type, context, inits);

            str = `{ 
    ${inits.render_ts()}
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
                        return typeToExpression(type, context, inits);
                    } else {
                        return "null";
                    }
                }
                ).map(s => s + ",").join("\n        ");

            str = `{    
    ${inits.render_ts()}
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
    ${formatArray(ids, 60)}
]`;

    strings.push(function_map);

    return strings.join("\n\n");
}

addTypeMap(ASYTRIPType.NULL, (v, c) => "null");
addTypeMap(ASYTRIPType.TOKEN, (v, c) => "Token");
addTypeMap(ASYTRIPType.DOUBLE, (v, c) => "number");
addTypeMap(ASYTRIPType.BOOL, (v, c) => "boolean");

addTypeMap(ASYTRIPType.PRODUCTION, (v, c) => {
    const type = getResolvedType(v, c)[0];
    return getTypeString(type, c);
});
addTypeMap(ASYTRIPType.STRUCT, (v, c) => {
    return v.name;
});
addTypeMap(ASYTRIPType.STRING, (v, c) => {
    if (v.val) {
        return `"${v.val}"`;
    } else {
        return "string";
    }
});

addTypeMap(ASYTRIPType.VECTOR, (v, c) => {

    if (v.types.length == 0)
        return "any[]";
    return `(${v.types.flatMap(a => {
        const type = getResolvedType(a, c)[0];
        return getTypeString(type, c);
    }).setFilter().join(" | ")
        })[]`;
    debugger;
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





addExpressMap(ASYTRIPType.NULL, (v, c, inits) => "null");

addExpressMap(ASYTRIPType.BOOL, (v, c, inits) => (v.val + "") || "false");

addExpressMap(ASYTRIPType.CONVERT_BOOL, (v, c, inits) => {
    const val = typeToExpression(v.value, c, inits);

    if (val == "null" || val == "false")
        return "false";

    if (val == "true")
        return "true";

    return `!!(${val})`;
});
addExpressMap(ASYTRIPType.CONVERT_DOUBLE, (v, c, inits) => `+(${typeToExpression(v.value, c, inits)})`);

addExpressMap(ASYTRIPType.CONVERT_STRING, (v, c, inits) => `""+(${typeToExpression(v.value, c, inits)})`);
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
        return `""`;
    }
});

addExpressMap(ASYTRIPType.EXPRESSIONS, (v, c, inits) => {
    return v.expressions.map(t => typeToExpression(t, c, inits)).filter(i => !!i).join(", ");
});

addExpressMap(ASYTRIPType.STRUCT_ASSIGN, (v, c, inits) => {
    const ref = typeToExpression(v.struct, c, inits);
    const prop = v.property;
    const value = typeToExpression(v.value, c, inits);
    return `${ref}.${prop} = ${value}`;
});
addExpressMap(ASYTRIPType.STRUCT_PROP_REF, (v, c, inits) => {
    const ref = typeToExpression(v.struct, c, inits);
    const prop = v.property;
    return `${ref}.${prop}`;
});

addExpressMap(ASYTRIPType.TOKEN, (v, c, inits) => {
    if (!isNaN(v.arg_pos)) {
        return `args[${v.arg_pos}]`;
    }
    return "null";
});
addExpressMap(ASYTRIPType.DOUBLE, (v, c, inits) => v.val);
addExpressMap(ASYTRIPType.VECTOR, (v, c, inits) => {
    return inits.push(`[${v.args.map(t => typeToExpression(t, c, inits))
        .setFilter().join(",")}]`, getTypeString(v, c));
});
addExpressMap(ASYTRIPType.ADD, (v, c, inits) => {

    const { left: l, right: r } = v;

    const type_l = getResolvedType(l, c)[0];
    const type_r = getResolvedType(r, c)[0];


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

    const left = typeToExpression(l, c, inits);
    const right = typeToExpression(r, c, inits);
    return `${left} + ${right}`;
});

addExpressMap(ASYTRIPType.TERNARY, (v, c, inits) => {
    const { assertion: a, left: l, right: r } = v;
    const boolean = typeToExpression(a, c, inits);
    const left = typeToExpression(l, c, inits);
    const right = typeToExpression(r, c, inits);

    if (boolean == "true")
        return left;

    if (boolean == "null" || boolean == "false")
        return right;

    return `${boolean} ? ${left} : ${right}`;
});
addExpressMap(ASYTRIPType.EQUALS, (v, c, inits) => {
    const { left: l, right: r } = v;
    const left = typeToExpression(l, c, inits);
    const right = typeToExpression(r, c, inits);
    return `${left} == ${right}`;
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
addExpressMap(ASYTRIPType.SUB, (v, c, inits) => {
    debugger;
    return "";
});
addExpressMap(ASYTRIPType.VECTOR_PUSH, (v, c, inits) => {

    const vector = typeToExpression(v.vector, c, inits);

    const vals = v.args.map(v =>
        typeToExpression(v, c, inits)
    ).join(",");

    inits.push(`${vector}.push(${v.args.length > 1 ? `...[${vals}]` : vals})`, false);

    return `${vector}`;
});

