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

                    if (sym.type == "production"){
                        console.log(sym.name);
                        sym.val = LU.get(sym.name).id;
                    }
                    else if (sym.type == "literal")
                        productions.reserved.add(sym.val);
                }
            }
        }

        for(let i = 0; i < productions.meta.length; i++){
            if(productions.meta[i].type == "ignore")
                productions.meta.ignore = productions.meta[i];
        }

    } catch (e) {
        console.error(e);
        throw e;
    }
}

export function grammarParser(grammar) {
    try {
        const productions = parser(whind(grammar));
        //Setup the productions object
        productions.forEach((p, i) => p.id = i);

        productions.reserved = new Set();
        productions.symbols = null;
        
        const LU = new Map(productions.map(p => [p.name, p]));
        convertProductionNamesToIndexes(productions, LU);

        for (const pre of productions.meta) {
            switch (pre.type) {
                case "symbols":
                    productions.meta.symbols = new Map(pre.symbols.map(e=>[e, {val:e}]));
                    break;
            }

        }

        return productions;
    } catch (e) {
        console.error(e);
    }

    return null;
}
