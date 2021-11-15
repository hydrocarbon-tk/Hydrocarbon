import {
    getSymbolName,
    GrammarObject,
    HCG3ProductionBody,
    HCG3Symbol,
    ProductionFunction,
    SymbolType
} from "@hctoolkit/common";


export function integrateReferencedProductions(grammar: GrammarObject, errors) {
    const fn_lu = grammar.functions.filter(fn => "reference" in fn && !("production" in fn)
    ).reduce((r, v) => (r.set(v.reference.val, v), r), new Map);

    for (const production of grammar.productions) {

        for (const body of production.bodies) {

            if (body.reduce_function
                &&
                body.reduce_function.ref
                &&
                fn_lu.has(body.reduce_function.ref.val)) {
                const fn = fn_lu.get(body.reduce_function.ref.val);
                body.reduce_function = <ProductionFunction>{
                    js: "",
                    txt: fn.txt,
                    type: "RETURNED",
                    tok: fn.tok
                };
            }
        }
    }

    outer: for (const fn of grammar.functions) {

        if ("production" in fn) {

            const production = fn?.production?.production;

            if (production) {

                const index: number[] = fn.index ?? [];

                let bodies: (HCG3ProductionBody | HCG3Symbol)[] = production.bodies, body: HCG3ProductionBody | HCG3Symbol = production.bodies[0];

                for (let i = 0; i < index.length; i++) {
                    let old_body = body;
                    body = bodies[index[i]];

                    if (!body) {
                        errors.push(
                            old_body.tok.createError(`Unable to retrieve body at index [ ${index[i]} ] max length is ${bodies.length}`)
                        );
                        continue outer;
                    }

                    if (body.type == "body") {
                        bodies = body.sym;
                        continue;
                    } else if (body.type == SymbolType.GROUP_PRODUCTION) {
                        bodies = body.val;
                        body = bodies[0];
                        continue;
                    } else if (body.type == SymbolType.LIST_PRODUCTION) {
                        const sym = body.val;

                        if (sym.type == SymbolType.GROUP_PRODUCTION) {
                            body = sym.val[0];
                            bodies = sym.val;
                            continue;
                        }
                        body = body.val;
                    }

                    errors.push(
                        fn.tok.createError(
                            `${body.tok.createError(
                                `Expected production body at location [ ${production.name}[${index.join(" > ") || 0}] ] \nFound [ ${getSymbolName(body)} ] instead`
                            ).message} \n Cannot apply Out-Of-Band function found`,
                            fn.loc + ""
                        )
                    );

                    continue outer;
                }

                const production_body: HCG3ProductionBody = <HCG3ProductionBody>body;

                if (production_body.reduce_function) {
                    errors.push(
                        production_body.reduce_function.tok.createError(
                            production_body
                                .tok.createError(
                                    `${fn.tok.createError(
                                        "Cannot set reduce action ", fn.loc + ""
                                    ).message}\n on [ ${production.name}[${index.join(">") || 0}] ]`
                                ).message + "\n Reduce action has already been set"
                        )
                    );

                    continue outer;
                }

                if ("reference" in fn) {
                    production_body.reduce_function = {
                        type: "referenced-function",
                        ref: fn.reference,
                        pos: fn.tok
                    };
                } else {
                    production_body.reduce_function = {
                        type: "RETURNED",
                        txt: fn.txt,
                        pos: fn.tok
                    };
                }
            }
        }
    }
}
