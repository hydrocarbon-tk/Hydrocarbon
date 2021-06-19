import { compileGrammar } from "../../build/library/grammar/compile.js";
import { loadGrammarFromString } from "../../build/library/grammar/passes/load.js";

const test_grammar_string =
    `@IGNORE g:ws g:nl

        <> start > A f:r { $1 + "test" }
        
        <> A >  B | C
                  
        <> B > A \\tz  |  \\tx C \\ty C
             | C \\tz
             | D

        <> D > E

        <> E > R f:r { $1 + "test" }

        <> R > G

        <> G >G \\tz
            | \\tr
            | \( D \)

        <> C >  \\tx \\ty C
            | \\ty \\tx 
        `;

const test_grammar = await loadGrammarFromString(test_grammar_string);
const grammar = await compileGrammar(test_grammar);

assert("Should merge body of productions into referencing bodies if there is no reduce action or conflicting recursion", grammar.productions[1].bodies.length == 5);
