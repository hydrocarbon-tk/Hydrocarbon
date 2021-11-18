#! /usr/bin/node

import {
    createDepend,
    getCandlePackage, validateEligibilityPackages
} from "@candlelib/dev-tools";
import { getPackageJsonObject } from "@candlelib/paraffin";
import URI from "@candlelib/uri";
import fs from "fs";
await URI.server();

// Grab the names of the hctoolkit packages of which we
// will version.
const { package: wksp_pkg, FOUND } = await getPackageJsonObject(URI.getCWDURL());

if (FOUND && wksp_pkg.name == "@hctoolkit/workspace") {


    const target_packages = await Promise.all(wksp_pkg.devPackages.map(createDepend));

    if (target_packages.every(d => d !== null)) {

        await validateEligibilityPackages(target_packages, (pkg) => {
            return Object.getOwnPropertyNames(pkg?.dependencies ?? {}).filter(n => wksp_pkg.devPackages.includes(n));
        }, false);
    } else {
        throw new Error("Unable to resolve required packages");
    }
} else {
    throw new Error("Unable to locate workspace package.json");
}