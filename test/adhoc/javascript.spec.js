import { buildRecognizer } from "../../build/library/build/build.js";
import { compileGrammarFromString } from "../../build/library/grammar/compile.js";
import { createAddHocParser } from "../../build/library/render/create_add_hoc_parser.js";

//################################################################################################


//Compile existing HCG grammar object
assert_group(
    "Should generate a parser from grammar string using a JavaScript pipeline",
    10000, sequence, () => {

        const
            compiled_grammar = await compileGrammarFromString(`
            @IGNORE g:sp

            <> start > B  f:r{ {b: $1} }
            
            <> B > A g:id \\; f:r{ { b: $2 } }

            <> A > \\tree 

            `),
            {
                recognizer_functions,
                meta,
            } = await buildRecognizer(compiled_grammar, 1),

            parse = await createAddHocParser(compiled_grammar, recognizer_functions, meta);

        assert("Input Correctly Parsed", parse("tree gorilla ;") == { result: [{ b: { b: "gorilla" } }] });
    });