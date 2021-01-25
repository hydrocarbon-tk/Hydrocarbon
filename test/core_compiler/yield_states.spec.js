import URL from "@candlefw/url";
import { generateOptions, getProductionItemsThatAreNotRightRecursive } from "../../build/library/compiler/function_constructor.js";
import { constructCompilerRunner } from "../../build/library/compiler/helper.js";
import { yieldStates } from "../../build/library/compiler/states/yield_states.js";
import { getGrammar } from "../tools.js";

assert_group(sequence, 10000, () => {

    const
        url = await URL.resolveRelative("../languages/mock.javascript.hcg"),
        grammar = await getGrammar(url + ""),
        helper = constructCompilerRunner(false, false),
        production = grammar[0];

    assert("yieldStates Does Not Throw With Good Input", yieldStates(getProductionItemsThatAreNotRightRecursive(production, grammar), generateOptions(grammar, helper, production)));
    assert("yieldStates Throws when options is undefined", !yieldStates(getProductionItemsThatAreNotRightRecursive(production, grammar)));
    assert("yieldStates Throws when items are undefined", !yieldStates(undefined, generateOptions(grammar, helper, production)));
});