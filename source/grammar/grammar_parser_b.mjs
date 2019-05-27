/**
 * Parses HC Grammars. Parser Built by Hydrocarbon
 */
import parser from './hcg_v1.mjs';

import whind from "@candlefw/whind";

function convertProductionNamesToIndexes(productions, LU) {
    let sym = "",
        body;
    try {
        for (let i = 0; i < productions.length; i++) {
            const
                production = productions[i],
                bodies = production.bodies;

            for (let i = 0; i < bodies.length; i++) {
                body = bodies[i];

                body.production = production;

                if (body.precedence < 0)
                    body.precedence = bodies.length - i - 1;

                for (let i = 0; i < body.length; i++) {
                    sym = body.sym[i];

                    if (sym.type == "production") {
                        try {
                            sym.val = LU.get(sym.name).id;
                        } catch (e) {
                            throw new SyntaxError(`Missing Production for symbol ${sym.name}`);
                        }
                    } else if (sym.type == "literal")
                        productions.reserved.add(sym.val);
                }
            }
        }

        for (let i = 0; i < productions.meta.length; i++) {
            if (productions.meta[i].type == "ignore")
                productions.meta.ignore = productions.meta[i];
        }


    } catch (e) {
        console.error(e);
        throw e;
    }
}

export function grammarParser(grammar) {

    const env = {
        productions: [],
        functions: {

            body: function(sym, env, lex) {

                const c = env.host_lex;
                c.fence(lex);
                this.lex = c;

                const s = sym[0];
                this.sym = s.body || [];
                this.length = 0;
                this.excludes = new Map();
                this.ignore = new Map();
                this.error = new Map();
                this.functions = [];
                this.reduce_function = s.reduce || null;

            },

            listProduction: function(sym, env) {
                this.type = "production";
                this.name = sym[0].val + "_list";
                this.val = -1;
                this.IS_OPTIONAL = sym[1] == "*";
                const listProduction = {
                    name: this.val,
                    bodies: [{
                            sym: [{ type: "production", val: this.val },
                                { type: "symbol", val: "," },
                                sym[0]
                            ],
                            excludes: new Map(),
                            error: new Map(),
                            ignore: new Map(),
                            functions: [],
                            length: 2,
                            reduce_function: {
                                type: "INLINE",
                                txt: "sym[0].push(sym[2]),sym[0]",
                                name: "",
                                env: false
                            }
                        },
                        {
                            sym: [sym[0]],
                            length: 1,
                            excludes: new Map(),
                            error: new Map(),
                            ignore: new Map(),
                            functions: [],
                            reduce_function: {
                                type: "INLINE",
                                txt: "[sym[0]]",
                                name: "",
                                env: false
                            }
                        }
                    ],
                    id: -1
                };

                listProduction.id = env.productions.length;
                env.functions.compileProduction(listProduction);
                env.productions.push(listProduction, lex);
            },

            compileProduction: function(production, lex) {
                const bodies = production.bodies;

                for (let i = 0; i < bodies.length; i++) {
                    const body = bodies[i];

                    const NO_BLANK = body.NO_BLANK || false;

                    //First pass splits optionals, expands repeats, and handles lists
                    for (let j = 0; j < body.sym.length; j++) {
                        const sym = body.sym[j];

                        if (sym.IS_OPTIONAL && (!NO_BLANK && body.sym.length > 1)) {

                            const new_sym = body.sym.slice();

                            new_sym.splice(j, 1);

                            const new_body = new env.functions.body({ body: new_sym, reduce: body.reduce_function }, env, lex);
                            new_body.lex = lex;

                            bodies.push(new_body);
                        }

                        if (sym.GROUPED) {
                            //This will unravel the group
                            body.sym.splice.apply(body.sym, [j, 1, ...sym.sym]);
                            //reparse symbols
                            j--;
                        }
                    }

                    //second pass removes functions, excludes, errors, and ignores
                    for (let j = 0; j < body.sym.length; j++) {

                        const new_sym = Object.assign({}, body.sym[j]);
                        
                        let map = null,
                            extract = false;
                        
                        new_sym.offset = j;

                        switch (sym.type) {
                            case "INLINE":
                                body.functions.push(new_sym);
                                extract = true;
                                break;
                            case "exc":
                                map = body.excludes;
                                extract = true;
                                break;
                            case "ign":
                                map = body.ignore;
                                extract = true;
                                break;
                            case "err":
                                map = body.error;
                                extract = true;
                                break;
                        }

                        if(map){
                            if(!map.get(j))
                                map.set(j, []);
                            map.get(j).push(new_sym);
                        }

                        if (extract) {
                            j--;
                            body.sym.splice(j,1);
                        }
                    }

                    body.length = body.sym.length;
                }
            }
        }
    };

    try {
        const productions = parser(whind(grammar), env);
        //Setup the productions object
        productions.forEach((p, i) => p.id = i);

        productions.reserved = new Set();
        productions.symbols = null;
        productions.meta = productions.meta || [];

        console.log(productions)

        const LU = new Map(productions.map(p => [p.name, p]));
        convertProductionNamesToIndexes(productions, LU);

        for (const pre of productions.meta) {
            switch (pre.type) {
                case "symbols":
                    productions.meta.symbols = new Map(pre.symbols.map(e => [e, { val: e }]));
                    break;
            }

        }

        return productions;
    } catch (e) {
        console.error(e);
    }

    return null;
}
