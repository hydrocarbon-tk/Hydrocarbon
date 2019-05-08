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

function convertProductionNamesToIndexes(productions, LU, lex) {
    let sym = "";
    try {
        for (let i = 0; i < productions.length; i++) {
            let production = productions[i];
            let bodies = production.bodies;
            for (let i = 0; i < bodies.length; i++) {
                let body = bodies[i];

                if (body.precedence < 0)
                    body.precedence = bodies.length - i - 1;

                for (let i = 0; i < body.length; i++) {
                    sym = body[i];
                    if (isNonTerm(body[i]))
                        body[i] = LU.get(body[i]).id;
                }
            }
        }
    } catch (e) {
        console.warn(`Error encountered while processing the symbol "${sym}"`);
        throw e;
    }
}

export function grammarParser(grammar) {

    let lex = whind(grammar);
    const types = lex.types;

    let productions = [];
    let LU = new Map();
    let current_production = null;
    let body = null;
    let expression = null;
    let expression_name = null;
    let PREPROCESS = true;
    let rules = {};
    productions.symbols = [];
    productions.reserved = new Set();
    productions.rules = rules;
    let time = 0;


    function sealExpression(lex) {
        let name = "";

        if (body && expression !== null) {
            if (expression_name == "error") {
                current_production.funct = { error: lex.slice(time).trim() };
            } else {
                body.funct[expression_name] = lex.slice(time).trim();
            }
        }

        if (!lex.END && lex.tx == "↦") {
            name = lex.n.tx;
            lex.next();
        }

        if (name) {
            expression_name = name;
            time = lex.off;
            lex.PARSE_STRING = true;
            expression = "";
        } else {
            lex.PARSE_STRING = false;
            expression_name = "";
            expression = null;
        }
    }

    function createBody(lex) {
        body = [];
        body.excludeSet = new Map();
        body.errorOnSet = new Map();
        body.lex = lex.copy();
        body.funct = {};
        body.precedence = 1;
        body.production = current_production.id;
        current_production.bodies.push(body);
    }

    function fence(body, lex) {
        if (body && !body.fenced) {
            body.lex.fence(lex);
            body.fenced = true;
        }
    }

    function getSymbol(lex) {
        let pk = lex.pk;
        pk.sync(lex);

        switch (lex.ch) {
            case "θ":
            case "τ":
                pk.next();
                break;
            default:
                break;
        }

        if (pk.pk.ch == "!" && pk.pk.off == pk.off + pk.tl)
            pk.sync();
        pk.next();

        const sym = pk.slice(lex);
        lex.sync();
        return sym.trim();
    }

    //Terminals are symbols, and identifiers *id*
    while (!lex.END) {
        let pk, sym;


        if (PREPROCESS && lex.ch == "#") {
            lex.IWS = false;
            lex.next();

            if (lex.ty !== types.id) {

                lex.IWS = false;
                while (!lex.END && lex.n.ty !== types.new_line);

                lex.IWS = true;
            } else if (lex.tx == "SYMBOLS") {
                lex.next();

                lex.IWS = false;

                while (!lex.END && lex.type !== types.new_line) {

                    const l = lex.copy();

                    while (!l.END && !(l.n.ty & (types.new_line | types.ws)));

                    const sym = l.slice(lex);

                    if (sym) {
                        productions.symbols.push(sym.trim());
                        lex.addSymbol(sym.trim());
                    }

                    lex.sync(l);
                }

                lex.IWS = true;

            } else if (lex.tx == "IGNORE") {

                if (!productions.ignore)
                    productions.ignore = [];

                lex.next();

                lex.IWS = false;

                while (!lex.END && lex.type !== types.new_line) {
                    const l = lex.copy();

                    while (!l.END && !(l.n.ty & (types.new_line | types.ws)));

                    let sym = l.slice(lex);

                    if (l.ty == types.id) {
                        l.next();
                        while (!l.END && !(l.n.ty & (types.new_line | types.ws)));
                        sym = l.slice(lex);
                    }

                    if (sym)
                        productions.ignore.push(sym.trim());

                    lex.sync(l);
                }

                lex.IWS = true;
            } else {
                lex.IWS = true;

                const name = lex.tx;

                if (!rules[name])
                    rules[name] = {};

                let x = 0;

                rules[name][lex.n.tx] = (!isNaN((x = lex.n.tx))) ? parseFloat(x) : x;
            }
        } else switch (lex.ty) {
            case types.identifier:
                if (lex.tx == "EXCLUDE") {
                    fence(body, lex);
                    sealExpression(lex);
                    while (lex.n.tx !== "ENDEXCLUDE") {
                        let v = "";
                        if (lex.ch == "τ") {
                            v += lex.ch;
                            lex.next();
                        }

                        v += lex.tx;

                        if (body) {
                            if (!body.exclude)
                                body.exclude = [];

                            body.exclude.push(v);
                        }
                    }
                    sealExpression(lex);
                } else if (lex.pk.ch == "→") {

                    fence(body, lex);

                    PREPROCESS = false;
                    current_production = { name: lex.tx, bodies: [], id: 0, follow: null, first: null, lex: lex.copy() };
                    current_production.id = productions.push(current_production) - 1;

                    LU.set(current_production.name, current_production);

                    sealExpression(lex);
                    lex.sync();
                    createBody(lex);
                } else {
                    if (expression !== null) {
                        fence(body, lex);
                        expression += lex.tx;
                    } else {
                        if (body)
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
                    case "#": //comment
                        fence(body, lex);
                        sealExpression(lex);
                        lex.IWS = false;
                        while (!lex.END && lex.n.ty !== types.new_line);
                        lex.IWS = true;
                        lex.next();
                        continue;

                    case "↦":
                        fence(body, lex);
                        sealExpression(lex);
                        break;
                    case "│":
                        fence(body, lex);
                        sealExpression(lex);
                        createBody(lex);
                        break;
                    case "θ":
                        sym = getSymbol(lex);
                        body.push(sym);
                        continue;
                    case "τ":
                        sym = getSymbol(lex);
                        productions.reserved.add(sym.slice(1));
                        body.push(sym.trim());
                        continue;
                    case "!":
                        if (lex.tx == "!") {
                            const NEXT_SYMBOL_ADJACENT = (((lex.off + lex.tl) - lex.pk.off) == 0);
                            const pos = body.length;
                            if (NEXT_SYMBOL_ADJACENT) {
                                if (lex.pk.tx == "ERR") {
                                    ERROR_ON_SYMBOL = true;
                                    lex.next().next(); // ! > ERR > ? 

                                    if (!body.errorOnSet.has(pos))
                                        body.errorOnSet.set(pos, new Set());

                                    body.errorOnSet.get(pos).add(getSymbol(lex));

                                    lex.next(); // ?

                                    continue;
                                }

                                if (lex.pk.tx == "EXC") {
                                    lex.next().next(); // ! > EXC > ?                                    

                                    const arr = [];

                                    while (!lex.END && lex.tx !== "END_EXC") {
                                        const s = getSymbol(lex)
                                        console.log(s)
                                        arr.push(s);

                                    }

                                    lex.next(); // END_EXC

                                    if (!body.excludeSet.has(pos))
                                        body.excludeSet.set(pos, new Set());

                                    body.excludeSet.get(pos).add(arr);

                                     console.log(body.excludeSet)
                                    continue;
                                }
                            }

                        }
                        //intentional
                    case "%":
                        if (lex.ch == "%" && lex.pk.tx == "%") {
                            lex.sync();
                            fence(body, lex);
                            body.precedence = parseInt(lex.n.tx);
                            break;
                        }
                        //intentional
                    default:
                        if (expression !== null) {
                            fence(body, lex);
                            expression += lex.tx;
                        } else {
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

    sealExpression(lex);
    convertProductionNamesToIndexes(productions, LU);

    if (productions.length < 1)
        throw new Error("No productions were generated from the input!");

    return productions;
}
