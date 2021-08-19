import { buildRecognizer } from "../../build/library/build/build.js";
import { compileGrammarFromString } from "../../build/library/grammar/compile.js";
import { createAddHocParser } from "../../build/library/render/create_add_hoc_parser.js";
import { generateWebAssemblyParser } from "../../build/library/render/render.js";

//################################################################################################


//Compile existing HCG grammar object
assert_group(
    "Parser should be able to reset and complete multiple parse passes",
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

            parse = await createAddHocParser(compiled_grammar, recognizer_functions, meta, generateWebAssemblyParser);
        const d = "a".repeat(65535);
        assert(parse(`tree ${d} ;`) == { result: [{ b: { b: d } }] });
        assert(parse("tree gorilla ;") == { result: [{ b: { b: "gorilla" } }] });
        assert(parse("tree bear ;") == { result: [{ b: { b: "bear" } }] });
        assert(parse("tree peacock ;") == { result: [{ b: { b: "peacock" } }] });
    });