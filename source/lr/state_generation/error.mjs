export function shiftReduceCollision(grammar, state, shift, reduce, error = console) {
    const sym = shift.symbol;
    error.log(
        `\x1b[43m SHIFT/REDUCE \x1b[43m COLLISION ERROR ENCOUNTERED:\x1b[0m

 Reduce action on symbol < ${sym} > has already been defined for state:
 <${state.production_string} > 
 
    Existing Action: 
         Reduce to {${reduce.item.body_(grammar).production.name}} from production ${reduce.item.renderWithProduction(grammar)}
         Definition found on line ${reduce.item.body_(grammar).lex.line+1}:${reduce.item.body_(grammar).lex.char} in input.

    Replacing Action: 
        Shift to state ${shift.item.increment().renderWithProduction(grammar)} from input { ${sym} }
        Definition found on line ${shift.item.body_(grammar).lex.line+1}:${shift.item.body_(grammar).lex.char} in input.
`);
}

export function reduceCollision(grammar, state, reduce_existing, reduce_new, error = console) {
    const sym = reduce_existing.symbol;

    error.log(`\x1b[41m REDUCE \x1b[43m COLLISION ERROR ENCOUNTERED:\x1b[0m
                
 A reduction on symbol < ${sym} > has already been defined for state:
 <${state.production_string}> 

        Existing Action:
            Reduce to {${reduce_existing.item.body_(grammar).production.name}} from production ${reduce_existing.item.renderWithProduction(grammar)}
            Definition found on line ${reduce_existing.item.body_(grammar).lex.line+1}:${reduce_existing.item.body_(grammar).lex.char} in input.
            Graph ID: ${reduce_existing.item.body_(grammar).production.graph_id}

        Replacing Action:
            Reduce to {${reduce_new.item.body_(grammar).production.name}} from production ${reduce_new.item.renderWithProduction(grammar)}
            Definition found on line ${reduce_new.item.body_(grammar).lex.line+1}:${reduce_new.item.body_(grammar).lex.char} in input.
            Graph ID: ${reduce_new.item.body_(grammar).production.graph_id}
            `);
}