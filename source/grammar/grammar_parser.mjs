/**
 * Parses HC Grammars. Parser Built by Hydrocarbon
 */

import { null_literal, member_expression, numeric_literal, identifier, parse as ecmascript_parse } from "@candlefw/js";
import whind from "@candlefw/whind";
import URL from "@candlefw/url";
import parser_data from "./hcg.mjs";
import parser from "../lr/runtime/lr_parser.js";

function convertProductionNamesToIndexes(productions, LU) {
    let sym = "",
        body;
    try {
        for (let i = 0; i < productions.length; i++) {
            const
                production = productions[i],
                bodies = production.bodies;
            production.graph_id = -1;

            for (let i = 0; i < bodies.length; i++) {
                body = bodies[i];

                body.production = production;

                if (body.precedence < 0)
                    body.precedence = bodies.length - i - 1;

                for (let i = 0; i < body.length; i++) {
                    sym = body.sym[i];

                    if (sym.type == "production") {
                        if (sym.production || (sym.IMPORTED && sym.RESOLVED)) {
                            sym.val = sym.production.id;
                        } else try {
                            sym.production = LU.get(sym.name);
                            sym.val = LU.get(sym.name).id;
                        } catch (e) {
                            console.error("Error found in " + productions.uri);
                            throw new SyntaxError(`Missing Production for symbol ${sym.name} in body of production ${production.name}`);
                        }
                        sym.resolveFunction = null; // For DataClone 
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

export async function grammarParser(grammar, FILE_URL, stamp = 112, meta_imported_productions = new Map, pending_hook = { count: 0 }) {

    const AWAIT = { count: 0 };

    async function SLEEPER(data) {
        return new Promise(res => {
            const id = setInterval(() => {
                if (data.count == 0) {
                    clearInterval(id);
                    res();
                }
            }, 2);
        });
    }

    const bodies = new Map();

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
                this.RESOLVED = false;
                this.production = null;
                this.resolveFunction = () => {};

                const id = env.imported.get(sym[0]);
                const productions = meta_imported_productions.get(id);
                if (productions) {
                    if (productions.SYMBOL_LIST) {
                        productions.push(this);
                    } else {
                        try {
                            const production = productions.LU.get(this.name);
                            this.name = production.name;
                            this.production = production;
                            this.RESOLVED = true;
                        } catch (e) {
                            throw Error(`Grammar ${id} does not have a production named ${this.name}.`);
                        }
                    }
                } else {
                    const list = [this];
                    list.SYMBOL_LIST = true;
                    meta_imported_productions.set(id, list);
                }
            },

            importData: function(sym, env) {
                const url = sym[3];
                const id = sym[6];

                const
                    //load data from the other file
                    uri = URL.resolveRelative(url, FILE_URL + ""),

                    key = uri + "";


                env.imported.set(id, key);


                if (meta_imported_productions.has(key)) {
                    const p = meta_imported_productions.get(key);
                    if (!p.SYMBOL_LIST || p.PENDING)
                        return { type: "import", id, url };
                } else
                    meta_imported_productions.set(key, Object.assign([], { SYMBOL_LIST: true, PENDING: true }));

                AWAIT.count++;
                pending_hook.count++;

                uri.fetchText().then(async txt => {
                    let prods = null;

                    try {
                        prods = await grammarParser(txt, uri, stamp * env.body_count ** AWAIT + 1 + (Math.random() * 10000) | 0, meta_imported_productions, pending_hook);
                    } catch (e) {
                        console.warn("Error encountered in " + uri);
                        throw e;
                    }

                    let EXISTING = false;
                    prods.imported = true;

                    for (let i = 0; i < prods.length; i++) {
                        const prod = prods[i];

                        if (!prod.IMPORTED) { //Only allow one level of namespacing

                            prod.name = `${id}$${prod.name}`;
                            prod.IMPORTED = true;

                            if (prod.bodies) {
                                for (let i = 0; i < prod.bodies.length; i++) {
                                    const body = prod.bodies[i];
                                    for (let i = 0; i < body.sym.length; i++) {
                                        const sym = body.sym[i];
                                        if (sym.type == "production" && !sym.IMPORTED && sym.val !== -55) {
                                            sym.val = -55;
                                            sym.name = `${id}$${sym.name}`;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    let p;
                    //Make sure only one instance of any URL resource is used in grammar.


                    if ((p = meta_imported_productions.get(key))) {
                        if (p.SYMBOL_LIST) {
                            //meta_imported_productions.set(key, prods);
                            p.forEach(sym => {
                                try {
                                    const production = prods.LU.get(sym.name);
                                    sym.name = `${id}$${production.name}`;
                                    sym.RESOLVED = true;
                                    sym.production = production;
                                    sym.resolveFunction(production);
                                } catch (e) {
                                    console.error(`Error in ${uri}`)
                                    console.error(e);
                                    throw Error(`Grammar ${id} does not have a production named ${sym.name}`);
                                }

                            });
                        } else
                            EXISTING = true;
                    }

                    if (!EXISTING) {
                        env.productions.push(...prods);
                        env.productions.meta.push(...prods.meta);
                        meta_imported_productions.set(key, prods);
                    }

                    pending_hook.count--;
                    AWAIT.count--;
                }).catch(e => {
                    throw e;
                });

                return { type: "import", id, url };
            },

            body: function(sym, env, lex, form = (~(0xFFFFFFFFFFFFF << sym[0].body.length)) & 0xFFFFFF) {

                //const c = lex.host_lex.copy();

                const s = sym[0];
                let bc = 0;

                this.lex = lex;
                this.sym = s.body || [];
                this.sym_map = this.sym.map((e, i) => (e.IS_CONDITION ? -1 : bc++));
                this.length = 0;
                this.excludes = new Map();
                this.ignore = new Map();
                this.error = new Map();
                this.reset = new Map();
                this.reduce = [];
                this.functions = [];
                this.reduce_function = s.reduce || null;
                this.grammar_stamp = env.stamp;
                this.form = form;

                //Used to identifier the unique form of the body.
                this.uid = this.sym.map(e => e.type == "production" ? e.name : e.val).join(":");

                //*
                this.build = function() {
                    if (true && this.reduce_function && this.reduce_function.txt) {
                        const str = (this.reduce_function.type == "RETURNED") ?
                            `function temp(temp){return ${this.reduce_function.txt}}` :
                            `function temp(temp){ ${this.reduce_function.txt}}`;
                        let fn = ecmascript_parse(str);

                        fn = fn.statements;

                        const iter = fn.traverseDepthFirst();

                        for (const node of iter) {

                            //If encountering an identifier with a value of the form "$sym*" where * is an integer.
                            if (node instanceof identifier && (node.val.slice(0, 4) == "$sym" || node.val.slice(0, 5) == "$$sym")) {

                                // Retrieve the symbol index
                                const index = parseInt(
                                    node.val.slice(0, 5) == "$$sym" ?
                                    node.val.slice(5) :
                                    node.val.slice(4)
                                ) - 1;

                                let n = null,
                                    v = -1;
                                // Replace node with either null or "sym[*]"" depending on the presence of nonterms
                                // within the body.  

                                if ((v = this.sym_map.indexOf(index)) >= 0) {
                                    n = new member_expression(new identifier(["sym"]), new numeric_literal([v]), true);
                                } else if (node.val.slice(0, 5) == "$$sym") {
                                    n = new null_literal();
                                }

                                node.replace(n);
                            }
                        }

                        // Replace the reduce_function with a new object (that contains the modified
                        // functions string)?
                        this.reduce_function = Object.assign({}, this.reduce_function);

                        this.reduce_function.txt = (this.reduce_function.type == "RETURNED") ?
                            fn.body.expr.render() :
                            fn.body.render();
                    }

                    //Removing build function ensures that this object can be serialized. 
                    delete this.build;
                };
            },

            groupProduction: function(sym, env, lex) {

                this.type = "production";
                this.name = env.prod_name + "" + env.body_count + "" + env.body_offset + sym[1].length + "_group";
                this.val = -1;

                var uid = sym[1].map(e => e.uid).sort((a, b) => a < b ? -1 : 1).join(":");

                if (bodies.has(uid)) {
                    return bodies.get(uid);
                }

                bodies.set(uid, this);

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
                                    `sym[0] + sym[1]` : `(sym[1] !== null) ? sym[0].push(sym[${delimeter?2:1}]) : null,sym[0]`,
                                name: "",
                                env: false
                            }
                        }], env, lex),
                        new env.functions.body([{
                            body: [sym[0]],
                            reduce: {
                                type: "RETURNED",
                                txt: STRING ?
                                    `sym[0] + ""` : "(sym[0] !== null) ? [sym[0]] : []",
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

                

                if (production.IMPORT_APPEND || production.IMPORT_OVERRIDE) {

                    production.name.resolveFunction = (p) => {
                        if (production.IMPORT_APPEND)
                            p.bodies.unshift(...production.bodies);
                        else
                            p.bodies = production.bodies;

                        //Set production entries for all production symbols in the bodies that are defined in this production.
                        production.bodies.forEach(body => body.sym.forEach((sym) => {
                            if (sym.type == "production" && !sym.IMPORTED) {
                                sym.production = env.productions.LU.get(sym.name);
                            }
                        }));

                        env.functions.compileProduction(p, lex);

                        production.name = p.name;

                        delete production.name.resolveFunction;
                    };

                    if (production.name.RESOLVED) {
                        production.name.resolveFunction(production.name.production);
                    }

                    return;
                }

                const bodies = production.bodies;

                for (let i = 0; i < bodies.length; i++) {
                    const body = bodies[i];
                    const lex = body.lex;
                    var form = body.form;

                    //First pass splits optionals, expands repeats, and handles lists
                    outer:
                        for (let j = 0; j < body.sym.length; j++) {
                            const sym = body.sym[j];

                            if (sym.IS_OPTIONAL && (!sym.NO_BLANK || body.sym.length > 1)) {

                                const new_sym = body.sym.slice();
                                const sym_map = body.sym_map.slice();

                                new_sym.splice(j, 1);
                                const s = sym_map.splice(j, 1)[0];

                                const new_body = new env.functions.body([{ body: new_sym, reduce: body.reduce_function }], env, lex, form ^ (1 << s));

                                new_body.lex = lex;
                                new_body.sym_map = sym_map;

                                //Check to see if we have already derived this body form. 
                                // If so, skip adding to list of production bodies.

                                for (let j = 0; j < bodies.length; j++) {
                                    if (bodies[j].uid == new_body.uid)
                                        continue outer;
                                }

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
                            case "rst":
                                map = 4;
                                extract = true;
                                break;
                            case "red":
                                map = 5;
                                extract = true;
                                break;
                        }

                        if (map > 0) {

                            const m = body[(["excludes", "ignore", "error", "reset", "reduce"][map - 1])];

                            if (map == 5) {
                                m.push({ v: new_sym.sym.val, p: undefined, type: new_sym.sym.type });
                            } else if (map == 1) {
                                if (!m.get(j))
                                    m.set(j, []);
                                m.get(j).push(new_sym.sym);
                            } else {
                                if (!m.get(j))
                                    m.set(j, []);
                                m.get(j).push(...new_sym.sym);
                            }
                        }

                        if (extract) {
                            body.sym.splice(j, 1);
                            body.sym_map.splice(j, 1);
                            j--;
                        }
                    }
                    body.length = body.sym.length;


                    if (body.build)
                        body.build();
                }
            }
        }
    };

    const productions = parser(whind(grammar), parser_data, env).result;

    productions.uri = FILE_URL;

    productions.LU = new Map(productions.map(p => [p.name, p]));
    //Pause here to allow impoted productions to process.
    await SLEEPER(AWAIT);

    productions.LU = new Map(productions.map(p => [p.name, p]));

    //If the production is at the root of the import tree, then complete the processing of production data. 
    if (stamp == 112) {

        await SLEEPER(pending_hook);
        //Convient lookup map for production non-terminal names. 

        //Setup the productions object
        productions.forEach((p, i) => p.id = i);
        productions.symbols = null;
        productions.meta = productions.meta || [];
        productions.reserved = new Set();

        convertProductionNamesToIndexes(productions, productions.LU);

        if (!productions.meta.error)
            productions.meta.error = [];
        if (!productions.meta.ignore)
            productions.meta.ignore = [];

        for (const pre of productions.meta) {
            if (pre)
                switch (pre.type) {
                    case "error":

                        productions.meta.error.push(pre);
                        break;
                    case "ignore":

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
    }

    if (productions.length == 0)
        throw ("This grammar does not define any productions.");

    return productions;
}