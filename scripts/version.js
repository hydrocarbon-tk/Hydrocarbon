#! /usr/bin/node

import {
    validateEligibilityPackages
} from "@candlelib/dev-tools";
import { Logger } from "@candlelib/log";
import { getPackageJsonObject } from "@candlelib/paraffin";
import URI from "@candlelib/uri";
await URI.server();
const logger = Logger.get("HCToolkit").activate();
// Grab the names of the hctoolkit packages of which we
// will version.
const { package: wksp_pkg, FOUND } = await getPackageJsonObject(URI.getCWDURL());

if (FOUND && wksp_pkg.name == "@hctoolkit/workspace") {
    if (wksp_pkg.devPackages.every(d => d !== null)) {
        try {

            if (!await validateEligibilityPackages(wksp_pkg.devPackages, (pkg) => {
                return Object.getOwnPropertyNames(pkg?.dependencies ?? {}).filter(n => wksp_pkg.devPackages.includes(n));
            }, false)) {
                logger.log("Unable to version packages");
            };
        } catch (E) {
            logger.log("Unable to version packages");
            process.exit(-1);
        }
    } else {
        throw new Error("Unable to resolve required packages");
    }
} else {
    throw new Error("Unable to locate workspace package.json");
}