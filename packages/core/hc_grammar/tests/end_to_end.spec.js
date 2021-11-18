import URI from "@candlelib/uri";
import { spawnSync } from "child_process";
import { assert } from "console";
import { unlink } from "fs/promises";
import { tmpdir } from "os";

assert_group("End to End with test grammar - file rename", sequence, () => {

    await URI.server();

    const expected_path = new URI(tmpdir() + "/test_result.hcgr");

    let DELETED = false;

    spawnSync(`npx`, [`./`, `compile`, `--o`, `"${tmpdir()}/test_result"`, `./grammar/test.hcg`]);

    assert("Grammar resource file created", (await expected_path.DOES_THIS_EXIST()) == true);

    //Cleanup
    if (await expected_path.DOES_THIS_EXIST()) {
        await unlink(expected_path + "");

        DELETED = true;
    }

    assert("Grammar resource file deleted", DELETED == true);
});

assert_group("End to End with test grammar - default name", sequence, () => {

    await URI.server();

    const expected_path = new URI(tmpdir() + "/test.hcgr");

    let DELETED = false;

    spawnSync(`npx`, [`./`, `compile`, `--o`, `"${tmpdir()}/"`, `./grammar/test.hcg`]);

    assert("Grammar resource file created", (await expected_path.DOES_THIS_EXIST()) == true);

    //Cleanup
    if (await expected_path.DOES_THIS_EXIST()) {
        await unlink(expected_path + "");

        DELETED = true;
    }

    assert("Grammar resource file deleted", DELETED == true);
});
