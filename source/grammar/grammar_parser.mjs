/**
 * Parses HC Grammars. Parser Built by Hydrocarbon
 */
import parser from './hcg_v1.mjs';
import whind from "@candlefw/whind";
import URL from "@candlefw/url";

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

    } catch (e) {
        console.error(e);
        throw e;
    }
}

export async function grammarParser(grammar, FILE_URL, stamp = 112, meta_imported_productions = new Map) {
    let AWAIT = 0;

    async function SLEEPER() {
        return new Promise(res => {
            const id = setInterval(() => {
                if (AWAIT == 0) {
                    clearInterval(id);
                    res();
                }
            }, 2);
        });
    }

    const env = {
        productions: [],
        refs: new Map(),
        body_count: 0,
        stamp,
        imported: new Map(),
        functions: {
            importProduction: function(sym, env, lex) {
                this.type = "production";
                this.name = sym[2];
                this.val = -1;
                this.IMPORTED = true;

                const id = env.imported.get(sym[0]);
                const productions = meta_imported_productions.get(id);
                if (productions) {
                    if (productions.SYMBOL_LIST) {
                        productions.push(this);
                    } else {
                        try {
                            this.name = productions.LU.get(this.name).name;
                        } catch (e) {
                            throw Error(`Grammar ${id} does not have a production named ${this.name}.`)
                        }
                    }
                } else {
                    const list = [this];
                    list.SYMBOL_LIST = true;
                    meta_imported_productions.set(id, list);
                }
            },
            importData: function(sym, env, lex) {
                const id = sym[5];
                const url = sym[2];


                const symbol = {
                        type: "production",
                        name: "",
                        val: -1
                    },

                    //load data from the other file
                    uri = URL.resolveRelative(url, FILE_URL + ""),

                    key = uri + "";

                env.imported.set(id, key);

                AWAIT++;

                uri.fetchText().then(async txt => {

                    const prods = await grammarParser(txt, uri, stamp * env.body_count ** AWAIT + 1, meta_imported_productions);
                    let EXISTING = false;
                    prods.imported = true;

                    for (let i = 0; i < prods.length; i++) {
                        const prod = prods[i];
                        console.log(prod.name)
                        prod.name = `${id}$${prod.name}`;
                        for (let i = 0; i < prod.bodies.length; i++) {
                            const body = prod.bodies[i];
                            for (let i = 0; i < body.sym.length; i++) {
                                const sym = body.sym[i];
                                if (sym.type == "production" && !sym.IMPORTED && sym.val !== -55){
                                    sym.val = -55;
                                    sym.name = `${id}$${sym.name}`;
                                }
                            }
                        }
                    }
                    //Make sure only one instance of any URL resource is used in grammar.
                    if (meta_imported_productions.has(key)) {

                        const p = meta_imported_productions.get(key);

                        if (p.SYMBOL_LIST) {
                            p.forEach(sym => {
                                try {
                                    sym.name = prods.LU.get(sym.name).name;
                                } catch (e) {
                                    throw Error(`Grammar ${id} does not have a production named ${sym.name}.`);
                                }
                            });
                        }else
                            EXISTING = true;
                    } 

                    if(!EXISTING) {
                        //Morph names to prevent collisions;
                        env.productions.push(...prods);
                        env.productions.meta.push(...prods.meta);
                        meta_imported_productions.set(key, prods);
                    }

                    AWAIT--;
                }).catch(e => {
                    console.log(uri, FILE_URL)
                    throw e;
                });

                return { type: "import", id, url };
            },

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
                this.grammar_stamp = env.stamp;

            },

            groupProduction: function(sym, env, lex) {

                this.type = "production";
                this.name = env.prod_name + "" + env.body_count + "" + env.body_offset + sym[1].length + "_group";
                this.val = -1;

                const groupProduction = {
                    name: this.name,
                    bodies: sym[1],
                    id: -1
                };

                groupProduction.id = env.productions.length;
                env.productions.push(groupProduction);
                env.functions.compileProduction(groupProduction, lex);
            },

            listProduction: function(sym, env, lex, s, a, b) {
                if (sym[0].type == "production") {
                    this.name = sym[0].name + "_list";
                } else {
                    this.name = env.prod_name + env.body_offset + "_list";
                }

                this.type = "production";
                this.val = -1;
                this.IS_OPTIONAL = (sym[1] == "(*");

                const STRING = sym[2].val === "\"" || sym[2].val === "'";

                let delimeter = null;

                if (!STRING && sym.length > 3)
                    delimeter = sym[2];

                const listProduction = {
                    name: this.name,
                    bodies: [
                        new env.functions.body([{
                            body: [{ type: "production", name: this.name, val: -1 },
                                ...(delimeter ? [delimeter, sym[0]] : [sym[0]])
                            ],
                            reduce: {
                                type: "RETURNED",
                                txt: STRING ?
                                    `sym[0] + sym[1]` : `sym[0].push(sym[${delimeter?2:1}]),sym[0]`,
                                name: "",
                                env: false
                            }
                        }], env, lex),
                        new env.functions.body([{
                            body: [sym[0]],
                            reduce: {
                                type: "RETURNED",
                                txt: STRING ?
                                    `sym[0] + ""` : "[sym[0]]",
                                name: "",
                                env: false
                            }
                        }], env, lex)
                    ],
                    id: -1
                };

                listProduction.id = env.productions.length;
                env.productions.push(listProduction);
                env.functions.compileProduction(listProduction, lex);
            },

            compileProduction: function(production, lex) {


                const bodies = production.bodies;

                for (let i = 0; i < bodies.length; i++) {
                    const body = bodies[i];
                    const lex = body.lex;

                    //First pass splits optionals, expands repeats, and handles lists
                    for (let j = 0; j < body.sym.length; j++) {
                        const sym = body.sym[j];

                        if (sym.IS_OPTIONAL && (!sym.NO_BLANK || body.sym.length > 1)) {

                            const new_sym = body.sym.slice();

                            new_sym.splice(j, 1);

                            const new_body = new env.functions.body([{ body: new_sym, reduce: body.reduce_function }], env, lex);

                            new_body.lex = lex;

                            bodies.push(new_body);
                        }
                    }

                    //second pass removes functions, excludes, errors, and ignores
                    for (let j = 0; j < body.sym.length; j++) {

                        const new_sym = Object.assign({}, body.sym[j]);

                        let map = 0,
                            extract = false;

                        new_sym.offset = j;

                        switch (new_sym.type) {
                            case "INLINE":
                                body.functions.push(new_sym);
                                extract = true;
                                break;
                            case "exc":
                                map = 1;
                                extract = true;
                                break;
                            case "ign":
                                map = 2;
                                extract = true;
                                break;
                            case "err":
                                map = 3;
                                extract = true;
                                break;
                        }

                        if (map > 0) {
                            const m = body[(["excludes", "ignore", "error"][map - 1])];
                            if (!m.get(j))
                                m.set(j, []);

                            if (m == 1) {
                                m.get(j).push(new_sym.sym);
                            } else {
                                m.get(j).push(...new_sym.sym);
                            }
                        }

                        if (extract) {
                            body.sym.splice(j, 1);
                            j--;
                        }
                    }

                    body.length = body.sym.length;
                }
            }
        }
    };

    try {

        const productions = parser(whind(grammar), env);

        //Pause here to allow impoted productions to process.
        await SLEEPER();

        //Convient lookup map for production non-terminal names. 
        productions.LU = new Map(productions.map(p => [p.name, p]));

        //If the production is at the root of the import tree, then complete the processing of the production data. 
        if (stamp == 112) {
            //Setup the productions object
            productions.forEach((p, i) => p.id = i);
            productions.reserved = new Set();
            productions.symbols = null;
            productions.meta = productions.meta || [];

            convertProductionNamesToIndexes(productions, productions.LU);


            for (const pre of productions.meta) {
                switch (pre.type) {
                    case "ignore":
                        if (!productions.meta.ignore)
                            productions.meta.ignore = [];
                        productions.meta.ignore.push(pre);
                        break;
                    case "symbols":
                        if (!productions.meta.symbols)
                            productions.meta.symbols = new Map(pre.symbols.map(e => [e, { val: e }]));
                        else
                            pre.symbols.forEach(e => productions.meta.symbols.set(e, { val: e }));
                        break;
                }

            }

            console.log(productions)
        }

        return productions;
    } catch (e) {
        console.error(e);
    }

    return null;
}
