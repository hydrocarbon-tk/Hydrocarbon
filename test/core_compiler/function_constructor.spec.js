import URL from "@candlelib/uri";
import { constructHybridFunction } from "../../build/library/compiler/function_constructor.js";
import { constructCompilerRunner } from "../../build/library/compiler/helper.js";
import { getGrammar } from "../tools.js";

assert_group(sequence, 10000, () => {

    const
        url = await URL.resolveRelative("../languages/mock.javascript.hcg"),
        grammar = await getGrammar(url + ""),
        helper = constructCompilerRunner(false, false),
        production = grammar[0];

    assert_group("constructHybridFunction Does Not Throw With Good Input", () => {
        assert("Production A", constructHybridFunction(grammar[0], grammar, helper));
        assert("Production B", constructHybridFunction(grammar[1], grammar, helper));
        assert("Production C", constructHybridFunction(grammar[2], grammar, helper));
        assert("Production D", constructHybridFunction(grammar[3], grammar, helper));
        assert("Production E", constructHybridFunction(grammar[4], grammar, helper));
    });

    assert("constructHybridFunction Throws when production is undefined", !constructHybridFunction(undefined, grammar, helper));
    assert("constructHybridFunction Throws when grammar is undefined", !constructHybridFunction(production, undefined, helper));
    assert("constructHybridFunction Throws when runner is undefined", !constructHybridFunction(production, grammar));
});