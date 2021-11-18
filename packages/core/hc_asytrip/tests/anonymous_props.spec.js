import { ASYTRIPType } from "../../hc_ts_common";
import { compileGrammarFromString } from "../../hc_grammar";
import { createAsytripContext } from "../build/index.js";

assert_group(`ASYTrip non-struct expressions are allowed to create new properties on structs through
property assignment. Type validation is still enforced on these properties`,
    sequence,
    () => {

        const grammar = await compileGrammarFromString(`

<> start > A        f:r { $1.test1 = i32(0), $1.test2 = "", $1 }

<> A > g:id         f:r { { t_A } }

`);

        const context = await createAsytripContext(grammar);

        assert("Struct A exists", context.structs.has("A") == true);

        assert("Struct A~test1 property exists", context.structs.get("A").properties.has("test1") == true);

        assert("Struct A~test2 property exists", context.structs.get("A").properties.has("test2") == true);

        assert("Struct A~test1 property type is I32", context.structs.get("A").properties.get("test1").types[0].type == ASYTRIPType.I32);

        assert("Struct A~test2 property type is STRING", context.structs.get("A").properties.get("test2").types[0].type == ASYTRIPType.STRING);


    });
