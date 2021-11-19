import { assert, assert_group } from "@candlelib/cure";
import { createExportableStateData } from "../build/common/state_data.js";
import { createStateMap } from "./tools.js";

assert_group("", sequence, () => {

    const states = createStateMap(
        `
        state[A]
        
        assert TOKEN [2 3 4]( goto state [B] then goto state [C] )
        
        symbols:
        
        expected [2 3 4]
        
        skipped [5 8 9]`
    );

    states.get("A").block_offset = 56;

    const data = createExportableStateData(states);

    assert("State A exists", data["A"] !== undefined);

    assert("State A~name is A", data["A"].name == "A");

    assert("State A~block_offset is 56", data["A"].block_offset == 56);

    assert("Expect active_tokens is filled with data", data["A"].active_tokens == [2, 3, 4]);

    assert("Expect skipped_tokens is filled with data", data["A"].skipped_tokens == [5, 8, 9]);

});
