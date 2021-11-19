#! /usr/bin/node

import {
    createDepend
} from "@candlelib/dev-tools";
import { getPackageJsonObject } from "@candlelib/paraffin";
import URI from "@candlelib/uri";
import { exec, execSync } from "child_process";
await URI.server();

// Grab the names of the hctoolkit packages of which we
// will version.
const { package: wksp_pkg, FOUND } = await getPackageJsonObject(URI.getCWDURL());

if (FOUND && wksp_pkg.name == "@hctoolkit/workspace") {

    const target_packages = await Promise.all(wksp_pkg.devPackages.map(createDepend));

    for (const target of target_packages) {
        const bounty_path = URI.resolveRelative("./commit.bounty", target.package._workspace_location + "/");
        if (await bounty_path.DOES_THIS_EXIST()) {

            execSync(bounty_path + "", {
                cwd: bounty_path.dir
            });


        }
    }

} else {
    throw new Error("Unable to locate workspace package.json");
}
