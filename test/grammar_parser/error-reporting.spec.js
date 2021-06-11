/**
 * Should compile a new HCG grammar parser, 
 * which then should be able to compile
 * a new HCG parser
 */
import {
    compileGrammarFromString
} from "../../build/library/grammar3/compile.js";

//################################################################################################

//Take parser and do a sanity parse of a simple grammar
assert_group("Should throw error when grammar has missing production", 20000, sequence, () => {
    const grammar = `
    <> A > C ( D | R )
    
    <> C > B
    
    <> B > D
    `;
    
    assert(!await compileGrammarFromString(grammar));
});

