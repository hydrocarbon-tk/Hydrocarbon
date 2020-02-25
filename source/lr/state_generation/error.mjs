import {SymbolToString} from "../../util/item.mjs";

export function shiftReduceCollision(grammar, state, shift, reduce, error = console) {
    const sym = shift.item.renderSymbol(grammar);

    const symA = shift.item.sym(grammar);

    error.log(
        `\x1b[43m SHIFT/REDUCE \x1b[43m COLLISION ERROR ENCOUNTERED:\x1b[0m

 Reduce action on {${sym}} has already been defined for state:

 ${state.production_string} ${symA.type} ${symA.type} ${symA.val}
 
    Shift Action: 
        Shift to state ${shift.item.increment().renderWithProduction(grammar)}
        Definition found in: 
            \x1b[38;5;250mfile://${shift.item.body_(grammar).production.url}?${shift.item.body_(grammar).lex.line+1}:${shift.item.body_(grammar).lex.char+1}\x1b[0m

    Reduce Action: 
         Reduce to ${reduce.item.renderProductionNameWithBackground(grammar)} from production ${reduce.item.renderWithProduction(grammar)}
         Definition found in: 
            \x1b[38;5;250mfile://${reduce.item.body_(grammar).production.url}?${reduce.item.body_(grammar).lex.line+1}:${reduce.item.body_(grammar).lex.char+1}\x1b[0m
`);
}

export function reduceCollision(grammar, state, reduce_existing, reduce_new, error = console) {
    const sym = reduce_existing.item.renderSymbol(grammar);

    error.log(`\x1b[41m REDUCE \x1b[43m COLLISION ERROR ENCOUNTERED:\x1b[0m
                
 A reduction on {${sym}} has already been defined for state:

 ${state.production_string} 

        Existing Action:
            Reduce to ${reduce_existing.item.renderProductionNameWithBackground(grammar)} from production ${reduce_existing.item.renderWithProduction(grammar)}
            Definition found in:
                \x1b[38:5:250mfile://${reduce_existing.item.body_(grammar).production.url}?${reduce_existing.item.body_(grammar).lex.line+1}:${reduce_existing.item.body_(grammar).lex.char+1}\x1b[0m
            Graph ID: file://${reduce_existing.item.body_(grammar).production.graph_id}

        New Action:
            Reduce to {${reduce_new.item.renderProductionNameWithBackground(grammar)}} from production ${reduce_new.item.renderWithProduction(grammar)}
            Definition found in:
                \x1b[38:5:250mfile://${reduce_new.item.body_(grammar).production.url}?${reduce_new.item.body_(grammar).lex.line+1}:${reduce_new.item.body_(grammar).lex.char+1}\x1b[0m
            Graph ID: ${reduce_new.item.body_(grammar).production.graph_id}
            `);
}