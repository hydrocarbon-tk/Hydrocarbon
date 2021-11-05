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
        HAS_NULL,
        REQUIRES_DYNAMIC,
        HAVE_STRUCT,
        HAVE_STRUCT_VECTORS,
        structs
    } = prop;

    let type_string = "any";

    if (types.length == 0) {
        type_string = "null";
    } else if (HAVE_STRUCT) {
        type_string = `(${structs.map(s => s.name).join(" | ")})`;
    } else if (HAVE_STRUCT_VECTORS) {
        type_string = `(${structs.map(s => s.name).join(" | ")})[]`;
    } else if (REQUIRES_DYNAMIC) {
        type_string = `(${types.filter(TypeIsNotNull).map(t => getTypeString(t, context)).join(" | ")})`;
    } else if (TypesAre(types, TypeIsVector)) {
        type_string = getTypeString(types[0], context);
    } else if (types[0])
        type_string = getTypeString(types[0], context);
    else
        type_string = "any";

    return type_string;
}

export function createTsTypes(grammar: GrammarObject, context: ASYTRIPContext) {
    //Imports for you file

    context.resolved_struct_types = new Map();

    const strings = [
        //Header ------------------------------------------------------------------------
        `import {ASTNode, Token} from "@candlelib/hydrocarbon";`
    ];

    //Class Filters --------------------------------------------------------------------
    strings.push(`
export enum ASTClass {
${[...context.class].map(([k, v]) => `${k} = ${v}`).join(",\n")}
}
`);

    strings.push(`
export enum ASTType {
${[...context.type].map(([k, v]) => `${k} = ${v}`).join(",\n")}
}
`);


    //Structs ------------------------------------------------------------------------
    for (const [name, struct] of context.structs) {
        const prop_vals = generateResolvedProps(struct,
            context,
            context.resolved_struct_types,
            getTypeString,
            GenerateTypeString
        );

        const struct_props = prop_vals.filter(p => p.HAVE_STRUCT || p.HAVE_STRUCT_VECTORS);

        const struct_strings = [`
export class ${name} extends ASTNode<ASTType> {
    type: ASTType.${name};
    tok:Token;
    ${prop_vals.map(({ name: n, type: v, HAS_NULL: nil }) => `${n}${nil ? "?" : ""}:${v};`).join("\n")}

    constructor(
        tok: Token${prop_vals.map(({ name: n, type: v }) => `,\n        _${n}:${v}`).join("")}
    ) {
        super(ASTType.${name}, tok);
            ${prop_vals.map(({ name: n }) => {
            return `this.${n} = _${n};`;
        }).join("\n        ")}
        
    }${struct_props.flatMap(({ name: prop_name, HAS_NULL, HAVE_STRUCT, structs }, j) => {
            const ifs = [];

            let out_type = "ASTNode<ASTType>";

            if (HAVE_STRUCT) {
                if (HAS_NULL) {
                    ifs.push(`
        if(child === null){
            let old = this.${prop_name};           

            this.${prop_name} = null;
            
            return old;
        }
                    `);
                }
                ifs.push([`
        if(
            ${structs.map(s => s.name + ".nodeIs(child)").join(`
            || `)}
        ){
            
            let old = this.${prop_name};           

            this.${prop_name} = child;
            
            return old;
        }`].join("\n"));
            } else {

                ifs.push([`
        if(child === null){
            if(j < this.${prop_name}.length && j >= 0){
                return this.${prop_name}.splice(j, 1)[0];
            }
        }else if(
            ${structs.map(s => s.name + ".nodeIs(child)").join(`
            || `)}
        ){
            if(j < 0){
                this.${prop_name}.unshift(child);
            }else if(j >= this.${prop_name}.length){
                this.${prop_name}.push(child);
            }else {
                return this.${prop_name}.splice(j, 1, child)[0];
            } 
        }`].join("\n"));
            }
            return `
    replace_${prop_name}(child: ASTNode<ASTType>${HAVE_STRUCT ? "" : ",j:number"}) : null | ${out_type} {
        ${ifs.join(" else ")}
        return null;
    }`;
        }).join("\n")}`,
        //Iterator Implementation ------------------------------------------------------------------------
        `
    $$____Iterate_$_$_$(
        _yield: (a:ASTNode<ASTType>, b:ASTNode<ASTType>, c:number, d:number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return };
    ${struct_props.flatMap(({ name: prop_name, types, HAS_NULL, HAVE_STRUCT }, i) => {


            const ifs = [];
            if (HAVE_STRUCT) {
                if (TypesRequiresDynamic(types) || HAS_NULL) {
                    ifs.push([
                        `
        if(this.${prop_name} instanceof ASTNode)
            this.${prop_name}.$$____Iterate_$_$_$( _yield, this, ${i}, 0);`].join("\n"));
                } else {
                    ifs.push([
                        `
        this.${prop_name}.$$____Iterate_$_$_$( _yield, this, ${i}, 0);`,].join("\n"));
                }
            } else {
                ifs.push([`
        for(let i = 0; i < this.${prop_name}.length; i++){
            this.${prop_name}[i].$$____Iterate_$_$_$(_yield, this, ${i}, i);
        } `].join("\n"));
            }
            return ifs.join(" else ");
        }).filter(i => !!i).join("\n    ")}
    }
    
    Replace(child: ASTNode<ASTType>, i: number, j: number) : ASTNode<ASTType> | null {

        switch(i){
            ${struct_props.flatMap(({ name: prop_name, HAVE_STRUCT }, j) => {
            if (HAVE_STRUCT) {
                return `case ${j}: return this.replace_${prop_name}(child);`;
            } else {
                return `case ${j}: return this.replace_${prop_name}(child, j);`;
            }
        }).filter(i => !!i).join("\n    ")}
    }
        return null;
    }

    Token(): Token{
        return this.tok;
    }

    static is(s:any ): s is ${name} {
        if(typeof s == "object")
            return s instanceof ${name};
        return false;
    }

    static nodeIs(s:ASTNode<ASTType> ): s is ${name} {
        return s.type == ASTType.${name};
    }

    static Type(): ASTType.${name} {
        return ASTType.${name};
    }
}
`];
        strings.push(struct_strings.join("\n"));
    }

    //Functions ------------------------------------------------------------------------

    const fns = new Map();
    const ids = [];

    for (const [id, { args, struct: name, source }] of context.fn_map) {

        const length = grammar.bodies[id].sym.length;

        const init = [/* "let i = args.length()-1;" */];

        for (let i = 0; i < length; i++) {
            init.push(`let v${length - i - 1} = args.pop();`);
        }

        let init_string = init.join("\n");

        let str = "", inits = new Inits();

        if (args.length == 0 && !name) {
            str = `{  ${init_string} return v${length - 1}; }`;
        } else {

            const expression = args[0];
            const [type] = expression.types;
            const resolved_type = getResolvedType(type, context)[0];
            let data = getExpressionString(type, context, inits);
            switch (resolved_type.type) {
                case ASYTRIPType.DOUBLE:
                    str = `{${init_string} ${inits.render_ts(`return ${data}`)}}`;
                    break;
                case ASYTRIPType.STRING:
                    str = `{ ${init_string} ${inits.render_ts(` return ${data}`)}}`;
                    break;
                case ASYTRIPType.VECTOR_PUSH:
                case ASYTRIPType.VECTOR:

                    const types = (<ASYTRIPTypeObj[ASYTRIPType.VECTOR]>getResolvedType(type, context)[0]).types;
                    const unique_types = types.setFilter(t => t.type);

                    if (TypesAre(unique_types, TypeIsStruct)) {
                        if (type.type == ASYTRIPType.ADD || type.type == ASYTRIPType.VECTOR_PUSH) {
                            str = `{ 
                                ${init_string}
                                ${inits.render_ts(` `)}
                                return ${data} } `;
                        } else {

                            //Dereference the vector
                            str = `{ 
                                ${init_string}
                                ${inits.render_ts(` `)}
                                return ${data} } `;
                        }
                    } else if (unique_types.length > 1) {
                        str = `{ 
                                ${init_string}
                                ${inits.render_ts(`
                                return ${data}; `)}
                            }`;
                    } else {
                        str = `{
                            ${init_string} 
                                ${inits.render_ts(`
                                return ${data} `)}
                            }`;
                    }
                    break;
                default:
                    str = `{ 
                        ${init_string}
                                ${inits.render_ts(`
                                return ${data} `)}
                            }`;
            }
        }



        if (!fns.has(str)) {
            let i = fns.size;

            fns.set(str, {
                size: fns.size,
                name: `_FN${i}_`,
                str: `/*\n${source}\n*/\nfunction _FN${i}_ (args: any[], tok: Token) : any ` + str
            });
        }

        ids[id] = fns.get(str).name;

    }
    const functions = `
${[...fns.values()].map(k => k.str).join("\n")}
`;
    strings.push(functions);

    const function_map = `
export  const FunctionMaps = [
    ${ids.map(i => i + ",").join("\n")}
];`;

    strings.push(function_map);

    return strings.join("\n\n") + "\n";
}



addTypeMap(ASYTRIPType.NULL, (v, c) => "null");
addTypeMap(ASYTRIPType.PRODUCTION, (v, c) => {
    const type = getResolvedType(v, c)[0];
    return getTypeString(type, c);
});

// STRUCT ---------------------------------------------------
addTypeMap(ASYTRIPType.STRUCT, (v, c) => {
    return `${v.name}`;
});

addExpressMap(ASYTRIPType.STRUCT, (v, c, inits) => {

    const name = v.name;

    if (v.args) {

        const args = v.args;

        //ASTNode Struct Initialization ----------------------------------------------
        const struct = c.structs.get(name);



        const resolved_props = c.resolved_struct_types.get(name);

        //Create an initializer function for this object
        const data = [...struct.properties]
            .map(([name]) => {

                const {
                    REQUIRES_DYNAMIC,
                    types: target_types,
                } = resolved_props.get(name);
                const source_arg = args.filter(a => a.name == name)[0];
                let target_structs = target_types.filter(TypeIsStruct);
                if (source_arg) {
                    const type = source_arg.types[0];
                    const arg_types = getResolvedType(type, c).filter(TypeIsNotNull);
                    const val = getExpressionString(type, c, inits);

                    if (REQUIRES_DYNAMIC) {

                        if ("arg_pos" in type)
                            return val;

                        switch (type.type) {
                            case ASYTRIPType.ADD:
                            case ASYTRIPType.SUB:
                            case ASYTRIPType.VECTOR_PUSH:

                                switch (arg_types[0].type) {
                                    case ASYTRIPType.STRING:
                                        return `${val}`;
                                }

                            default: return val;
                        }
                    } else if (TypesAre(arg_types, TypeIsVector)) {
                        const types = arg_types.flatMap(t => t.types);
                        if (TypesAre(types, TypeIsStruct)) {
                            return val;
                        }

                    } else if (arg_types.length == 1) {
                        const arg = arg_types[0];
                        switch (arg.type) {
                            case ASYTRIPType.STRING:
                                break;
                            case ASYTRIPType.STRUCT:
                                return val;
                        }
                    }

                    return val;

                } else {
                    if (REQUIRES_DYNAMIC) {
                        return "null";
                    } else if (TypesAre(target_types, TypeIsStruct)) {
                        if (target_types.length > 1) {
                            //This will be an ASTNode enum type
                            return "null";
                        } else {
                            return "null";
                        }
                    } else {
                        const type = target_types[0];
                        switch (type.type) {
                            case ASYTRIPType.VECTOR:
                                return "[]";
                            case ASYTRIPType.BOOL:
                                return false;
                            case ASYTRIPType.DOUBLE:
                                return 0;
                            case ASYTRIPType.STRING:
                                return "''";
                        }
                        return "null";
                    }
                }
            }
            ).map(s => s + ",").join("\n        ");

        return inits.push(`new ${name}(\n        tok,\n        ${data}\n   );`, name);

    } else if (v.arg_pos) {
        return "v" + v.arg_pos;
    } else
        return v.name;
});

// STRUCT_PROP_REF -----------------------------------------

addTypeMap(ASYTRIPType.STRUCT_PROP_REF, (v, c) => {
    const types = getResolvedType(v.struct, c);

    const r_names = types.map(t => getTypeString(t, c)).setFilter();

    return `(${r_names.join(" | ")})`;
});
addExpressMap(ASYTRIPType.STRUCT_PROP_REF, (v, c, inits) => {

    const ref = getExpressionString(v.struct, c, inits);

    const prop = v.property;

    return `${ref}.${prop}`;
});

// STRUCT_ASSIGN -----------------------------------------

addTypeMap(ASYTRIPType.STRUCT_ASSIGN, (v, c) => {
    const types = getResolvedType(v.struct, c);

    const r_names = types.map(t => getTypeString(t, c)).setFilter();

    return `(${r_names.join(" | ")})`;
});
addExpressMap(ASYTRIPType.STRUCT_ASSIGN, (v, c, inits) => {

    const ref = getExpressionString(v.struct, c, inits);

    const prop = v.property;

    const val = getExpressionString(v.value, c, inits);

    return `${ref}.${prop} = ${val}`;
});

// STRUCT_ASSIGN -----------------------------------------

addTypeMap(ASYTRIPType.STRUCT_CLASSIFICATION, (v, c) => {
    const types = getResolvedType(v, c);
    const r_names = types.map(t => getTypeString(t, c)).setFilter();

    return `(${r_names.join(" | ")})`;
});
addExpressMap(ASYTRIPType.STRUCT_CLASSIFICATION, (v, c, inits) => {

    return "null";
});

// STRING --------------------------------------------------

addTypeMap(ASYTRIPType.STRING, (v, c) => {
    if (v.val) {
        return `"${v.val}"`;
    } else {
        return "string";
    }
});

addExpressMap(ASYTRIPType.STRING, (v, c, inits) => {

    if (v.val) {
        return `"${v.val}"`;
    } else {
        return "\"\"";
    }
});

// TOKEN --------------------------------------------------

addTypeMap(ASYTRIPType.TOKEN, (v, c) => "Token");

// DOUBLE -------------------------------------------------
addTypeMap(ASYTRIPType.DOUBLE, (v, c) => "number");

addExpressMap(ASYTRIPType.DOUBLE, (v, c, inits) => {
    const val = parseFloat(v.val).toFixed(20).replace(/0/g, " ").trim().replace(/ /g, "0") + "0";
    if (val[0] == ".")
        return "0" + val;
    return val;
}
);

// BOOL ---------------------------------------------------
addTypeMap(ASYTRIPType.BOOL, (v, c) => "boolean");

addExpressMap(ASYTRIPType.BOOL, (v, c, inits) => (v.val + "") || "false");

// VECTOR -------------------------------------------------
addTypeMap(ASYTRIPType.VECTOR, (v, c) => {
    const types = v.types.flatMap(v => getResolvedType(v, c));

    if (TypesAre(types, TypeIsStruct)) {
        return `ASTNode<ASTType>[]`;
    } else if (types.length == 1) {
        return `${getTypeString(types[0], c)}[]`;
    } else {
        return `(string | number | boolean | Token )[]`;
    }
});

addExpressMap(ASYTRIPType.VECTOR, (v, c, inits) => {

    const types = v.types.flatMap(v => getResolvedType(v, c));

    if (!isNaN(v.arg_pos)) {
        return `v${v.arg_pos}`;
    }

    if (v.args.length < 1) {
        return "[]";
    } else if (TypesAre(types, TypeIsStruct)) {
        const type_string = `(${types.map(t => t.name).join(" | ")})`;

        const ref = inits.push(`[${v.args.map(v => getExpressionString(v, c, inits))}]`, `${type_string}[]`);

        return ref;
    } else if (types.length == 1) {
        const type = types[0];

        if (TypeIsString(type) || TypeIsToken(type)) {
            const vals = v.args.map(convertArgsToType(c, inits, TypeIsString, convertValToString));

            return inits.push(`[${vals.join(", ")}]`);
        } else if (TypeIsDouble(type)) {
            const vals = v.args.map(convertArgsToType(c, inits, TypeIsDouble, convertValToDouble));

            return inits.push(`[${vals.join(", ")}]`);
        } else if (TypeIsStruct(type)) {

            const vals = v.args.map(convertArgsToType(c, inits, TypeIsNull, (a, t) => a));

            return inits.push(`${getTypeString(v, c)} : [ ${vals.join(", ")} ]`, true);
        } else {
            return `[${v.args.map(t => getExpressionString(t, c, inits))
                .setFilter().join(",")}]`;
        }
    } else {

        const vals = v.args.map(convertArgsToType(c, inits, TypeIsString, convertValToString));

        const ref = inits.push(`[]`, "any[]");

        for (const arg of v.args) {

            let val = getExpressionString(arg, c, inits);

            if (ref == "null")
                debugger;

            inits.push(`${ref}.push(${val});`, false);
        }

        return ref;
    }
});

// VECTOR_PUSH --------------------------------------------

addTypeMap(ASYTRIPType.VECTOR_PUSH, (v, c) => {
    debugger;
    return "";
});

addExpressMap(ASYTRIPType.VECTOR_PUSH, (v, c, inits) => {

    let vector = getExpressionString(v.vector, c, inits);
    let push_ref = vector;


    if (push_ref == "null")
        return "[]";
    const vector_types = getResolvedType(v.vector, c).setFilter(t => {
        return t.type;
    }).filter(TypeIsVector);

    const types = vector_types.flatMap(v => v.types)
        .flatMap(v => getResolvedType(v, c))
        .setFilter(JSONFilter);
    if (TypesAre(types, TypeIsStruct)) {
        if (!isNaN(v.vector.arg_pos)) {
            //Need to create a local dereference to push values
            push_ref = vector;
        }

        for (const arg of v.args) {

            let val = getExpressionString(arg, c, inits);

            inits.push(`${push_ref}.push(${val});`, false);
        }
    } else if (types.length == 1) {

        if (TypeIsToken(types[0]) || TypeIsString(types[0])) {
            const vals = v.args.map(convertArgsToType(c, inits, TypeIsString, convertValToString));
            inits.push(`${push_ref}.push(${vals.join(", ")})`, false);
        }
    } else {

        for (const arg of v.args) {
            let val = getExpressionString(arg, c, inits);


            inits.push(`${push_ref}.push(${val});`, false);
        }

    }

    return `${vector}`;
});


addTypeMap(ASYTRIPType.ADD, (v, c) => {
    const type = getResolvedType(v, c)[0];
    return getTypeString(type, c);
});
addTypeMap(ASYTRIPType.SUB, (v, c) => {
    return "";
});
addExpressMap(ASYTRIPType.EXPRESSIONS, (v, c, inits) => {

    const last = v.expressions.slice(-1)[0];

    for (const expression of v.expressions.slice(0, -1)) {
        inits.push(getExpressionString(expression, c, inits), false);
    }

    return getExpressionString(last, c, inits);
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

    if (boolean == "false" || boolean == "null")
        return right;
    if (boolean == "true")
        return left;

    const ref = inits.push(left);

    inits.push(`if( ${boolean} ){ ${ref} = ${right} }`, false);

    return ref;
});

addExpressMap(ASYTRIPType.NULL, (v, c, inits) => "null");



addExpressMap(ASYTRIPType.CONVERT_BOOL, (v, c, inits) => {
    const val = getExpressionString(v.value, c, inits);

    if (val == "null" || val == "false")
        return "false";

    if (val == "true")
        return "true";

    return `(!!${val})`;
});

addExpressMap(ASYTRIPType.CONVERT_DOUBLE, (v, c, inits) => `parseFloat((${getExpressionString(v.value, c, inits)}).toString())`);

addExpressMap(ASYTRIPType.CONVERT_STRING, (v, c, inits) => `(${getExpressionString(v.value, c, inits)}).toString()`);

addExpressMap(ASYTRIPType.PRODUCTION, (v, c, inits) => {

    if (!isNaN(v.arg_pos)) {
        return `v${v.arg_pos}`;
    }
    return "null";
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
        return getExpressionString(r, c, inits);

    if (rv == "null")
        return getExpressionString(l, c, inits);

    return `${getExpressionString(l, c, inits)} || ${getExpressionString(r, c, inits)}`;
});
addExpressMap(ASYTRIPType.ADD, (v, c, inits) => {
    const { left: l, right: r } = v;
    const type_l = getResolvedType(l, c)[0];
    const type_r = getResolvedType(r, c)[0];
    const left = getExpressionString(l, c, inits);
    const right = getExpressionString(r, c, inits);

    if (left == "null" && right == "null")
        return "null";

    if (right == "null")
        return left;

    if (left == "null")
        return right;

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

        return `${left} + ${right}.toString()`;
    } else if (TypeIsString(type_l) && TypeIsString(type_r)) {
        return `${left} + ${right}`;
    } else if (TypeIsString(type_r) && !TypeIsString(type_r)) {
        return `${left}.toString() + ${right}`;
    }

    return `${left} + ${right}`;
});
addExpressMap(ASYTRIPType.SUB, (v, c, inits) => {
    debugger;
    return "";
});
