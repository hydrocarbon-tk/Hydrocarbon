import { ProductionBody, Symbol } from "../types/grammar.js";

export default function convertProductionNamesToIndexes(productions, LU) {
    let sym : Symbol,
        body : ProductionBody;
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