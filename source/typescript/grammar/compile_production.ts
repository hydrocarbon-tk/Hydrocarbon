/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Lexer } from "@candlefw/wind";

import { ProductionBody, ProductionBodyFunction } from "../types/grammar.js";
import { Production } from "../types/production";
import { Symbol } from "../types/symbol";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment.js";
import { Sym_Is_A_Production } from "../utilities/symbol.js";

export default function (production: Production, env: GrammarParserEnvironment, lex: Lexer) {

    const grammar_file_url = env.FILE_URL;

    production.url = grammar_file_url.path;

    if (production.IMPORT_APPEND || production.IMPORT_OVERRIDE) {

        const imported = <Production><any>production.name;

        imported.resolveFunction = (p) => {
            if (production.IMPORT_APPEND)
                p.bodies.unshift(...production.bodies);
            else
                p.bodies = production.bodies;

            //Set production entries for all production symbols in the bodies that are defined in this production.
            production.bodies.forEach(body => body.sym.forEach((sym) => {
                if (Sym_Is_A_Production(sym) && !sym.IMPORTED) {
                    sym.production = env.productions.LU.get(sym.name);
                }
            }));

            env.functions.compileProduction(p, env, lex);

            production.name = p.name;

            delete (<Symbol><any>production.name).resolveFunction;
        };

        if (imported.RESOLVED)
            imported.resolveFunction((<Symbol><any>production.name).production);

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
        }
        //*/;
    }

    for (let i = 0; i < bodies.length; i++) {

        const body = bodies[i];

        extractDerivativesFromBody(body, bodies, env, lex);

        //second pass removes functions, excludes, errors, and ignores
        extractMetaInfoFromBody(body);

        body.length = body.sym.length;

        if (body.build) body.build();
    }

    //Remove bodies that are direct recursion: S=>S
}

/**
splits optionals, expands repeats, and handles lists
*/
export function extractDerivativesFromBody(
    body: ProductionBody,
    bodies: ProductionBody[],
    env: GrammarParserEnvironment,
    lex: Lexer
) {

    var form = body.form;

    for (let j = 0; j < body.sym.length; j++) {

        const sym = body.sym[j];

        if (sym.IS_OPTIONAL && (!sym.NO_BLANK || body.sym.filter(s => s.NO_BLANK == sym.NO_BLANK && !s.IS_CONDITION).length > 1)) {

            const
                new_sym = body.sym.slice(),
                sym_map = body.sym_map.slice();

            let u = j + 1;

            for (; u < body.sym.length; u++)
                if (!body.sym[u].IS_CONDITION) break;

            new_sym.splice(j, 1);

            const s = sym_map.splice(j, 1)[0];
            const new_body: ProductionBody = new env.functions.body([{ body: new_sym, reduce: body.reduce_function }], env, lex, form ^ (1 << s));

            //new_body.lex = lex;
            new_body.sym_map = sym_map;

            // Check to see if we have already derived this body form. 
            // If so, skip adding to list of production bodies.

            if (Body_Has_Already_Been_Derived(new_body, bodies)) continue;

            bodies.push(new_body);
        }
    }
}

function Body_Has_Already_Been_Derived(body: ProductionBody, bodies: ProductionBody[]): boolean {

    for (let j = 0; j < bodies.length; j++)
        if (bodies[j].uid == body.uid) return true;

    return false;
}

export function extractMetaInfoFromBody(body: ProductionBody) {
    for (let j = 0; j < body.sym.length; j++) {

        const new_sym = Object.assign({}, body.sym[j]);

        let map = 0,
            extract = false;

        new_sym.offset = j;

        switch (<string>new_sym.type) {
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
}

