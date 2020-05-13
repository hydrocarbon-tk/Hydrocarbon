import { Lexer } from "@candlefw/wind";

import { Production, Symbol, ProductionBodyFunction } from "../types/grammar.js";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment.js";

const
    EXCLUDE_MAP = 1,
    IGNORE_MAP = 2,
    ERROR_MAP = 3,
    RESET_MAP = 4,
    REDUCE_MAP = 5,
    extractable_symbol_lookup = {
        exc: EXCLUDE_MAP,
        ign: IGNORE_MAP,
        err: ERROR_MAP,
        rst: RESET_MAP,
        red: REDUCE_MAP
    };

export default function (production: Production, env: GrammarParserEnvironment, lex: Lexer) {

    const grammar_file_url = env.FILE_URL;

    production.url = grammar_file_url.path;

    if (production.IMPORT_APPEND || production.IMPORT_OVERRIDE) {

        const imported = <Production><unknown>production.name;

        imported.resolveFunction = (p) => {
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

            env.functions.compileProduction(p, env, lex);

            production.name = p.name;

            delete (<Symbol>production.name).resolveFunction;
        };

        if (imported.RESOLVED)
            imported.resolveFunction((<Symbol>production.name).production);

        return;
    }

    const bodies = production.bodies;

    if (bodies.length == 1) {
        //This may be a group. If so, we'll flatten it into the current production. 

        const body = bodies[0];

        ///*
        if (body.sym.filter(s => !s.IS_CONDITION).length == 1 && body.sym[0].subtype == "list") {
            //*
            //Retrieve the production
            const sym = body.sym[0];

            const prod = env.productions.filter(e => e.name == sym.name)[0];

            //We'll replace our bodies with replicas of the two bodies found in the other production
            const [bodyA, bodyB] = prod.bodies;
            const newBodyA = Object.assign({}, bodyA);
            const newBodyB = Object.assign({}, bodyB);

            newBodyA.sym = newBodyA.sym.map(a => Object.assign({}, a));

            //Rename the production these bodies point to.
            newBodyA.sym[0].name = <string>production.name;
            //newBodyB.sym[0].name = production.name;

            //Merge any functions found on the existing body
            //newBodyA.sym.push(...body.sym.filter(s => s.IS_CONDITION));
            //newBodyB.sym.push(...body.sym.filter(s => s.IS_CONDITION));


            //replace the productions body with the new ones.
            production.bodies = [newBodyA, newBodyB];
            //prost
        }
        //*/;

    }

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
                    body.functions.push(<ProductionBodyFunction><unknown>new_sym);
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
                    if (!m.get(j))
                        m.set(j, []);
                    m.get(j).push(new_sym.sym);
                    //m.push({ v: new_sym.sym.val, p: undefined, type: new_sym.sym.type });
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
        /*
                body.sym = body.sym
                    //Remove inline functions
                    //And action modifiers
                    .reduce((r, sym) => {
                        const map = extractable_symbol_lookup[sym.type] || 0,
                            off = r.length;
    
                        sym.offset = off;
    
                        if (sym.type == "INLINE")
                            body.functions.push(Object.assign({}, sym));
                        else if (map > 0) {
                            const m = body[(["excludes", "ignore", "error", "reset", "reduce"][map - 1])];
    
                            if (!m.get(off))
                                m.set(off, []);
                            if (map == 1 || map == 5)
                                m.get(off).push(sym.sym);
                            else
                                m.get(off).push(...sym.sym);
                        } else
                            r.push(sym);
    
                        return r;
                    }, []);
        */
        body.length = body.sym.length;

        if (body.build) body.build();
    }
}
