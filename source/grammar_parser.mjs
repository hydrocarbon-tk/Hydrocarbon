/**
 * Parses HC Grammars.
 * 
 * HC grammar - based on BNS syntax
 * 
 *  production → production + body                 ↦ cstr this.purpose = "construct nodes within `cstr` statements using js syntax"
 *                                                     ↦ 0 console.log("this will yield an action when parser reaches the particular index in the body")
 *             | secondary + production + body
 *             | ɛ {empty production}                  ↦ ^functionName - if an 'env' object with function declarations is provided to the parser this will match the functionName to a function in env and attach that to the generated node.
 *  
 *  secondary → τDenotesTerminalSymbol ( )
 *            | θid | θnumber 
 */



import whind from "../node_modules/@candlefw/whind/source/whind.mjs";

import { isNonTerm } from "./common.mjs";

function convertProductionNamesToIndexes(productions, LU) {

    for (let i = 0; i < productions.length; i++) {
        let production = productions[i];
        let bodies = production.bodies;
        for (let i = 0; i < bodies.length; i++) {
            let body = bodies[i];

            if(body.precedence < 0)
                body.precedence = bodies.length - i - 1;

            for (let i = 0; i < body.length; i++) {
                if (isNonTerm(body[i]))
                    body[i] = LU.get(body[i]).id;
            }
        }
    }
}

export function grammarParser(grammer) {
    let lex = whind(grammer);
    const types = lex.types;

    let productions = [];
    let LU = new Map();
    let current_production = null;
    let body = null;
    let expression = null;
    let expression_name = null;
    let PREPROCESS = true;
    let rules = {};
    productions.reserved = new Set();
    productions.rules = rules;

    function sealExpression(name) {
        if (body && expression !== null){
            if(expression_name == "error"){
                current_production.funct = {error: expression};
            }else
                body.funct[expression_name] = expression;
        }
        if (name) {
            expression_name = name;
            expression = "";
        } else {
            expression_name = "";
            expression = null;
        }
    }

    function createBody() {
        body = [];
        body.funct = {};
        body.precedence = -1;
        body.production = current_production.id;
        current_production.bodies.push(body);
    }

    //Terminals are symbols, and identifiers *id*
    while (!lex.END) {
        let pk;

        if (lex.ch == "#" && PREPROCESS) {
            lex.next();

            if (lex.ty !== types.id)
                lex.throw("Preprocess entry needs to begin with an identifier");
            
            let name = lex.tx;

            if (!rules[name])
                rules[name] = {};

            let x = 0;
            
            rules[name][lex.n.tx] = (!isNaN((x = lex.n.tx))) ? parseFloat(x) : x;

        } else

            switch (lex.ty) {
                case types.identifier:
                    if (lex.pk.ch == "→") {
                        PREPROCESS = false;
                        current_production = { name: lex.tx, bodies: [], id: 0, follow: null, first: null };
                        current_production.id = productions.push(current_production) - 1;

                        LU.set(current_production.name, current_production);

                        sealExpression();
                        createBody();
                        lex.sync();
                    } else {
                        if (expression !== null)
                            expression += lex.tx;
                        else{
                            if(body)
                                body.push(lex.tx);
                            else
                                throw lex.throw(`Unable to add symbol "${lex.tx}" to body. No body exists. Check your input file.`);
                        }
                    }
                    break;
                case types.symbol:
                case types.operator:
                case types.ob:
                case types.cb:
                    switch (lex.ch) {
                        case "θ":
                            pk = lex.pk.n;
                            body.push(pk.slice(lex).trim());
                            lex.sync();
                            continue;
                        case "↦":
                            sealExpression(lex.n.tx);
                            break;
                        case "│":
                            sealExpression();
                            createBody();
                            break;
                        case "τ":
                            pk = lex.pk.n;
                            productions.reserved.add(pk.slice(lex).slice(1));
                            body.push(pk.slice(lex).trim());
                            lex.sync();
                            continue;
                        case "%":
                            body.precedence = parseInt(lex.n.tx);
                            break;
                        default:
                            if (expression !== null)
                                expression += lex.tx;
                            else {
                                body.push(lex.tx);
                            }
                            break;
                    }
                    break;
                default:
                    if (expression !== null)
                        expression += lex.tx;

            }

        lex.next();
    }

    sealExpression(lex.n.tx);
    convertProductionNamesToIndexes(productions, LU);

    if(productions.length < 1)
        throw new Error("No productions were generated from the input!");

    return productions;
}