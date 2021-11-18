/**
 * Test the garbage collecting and graph traversal functionality for
 * states build process.
 */
import { assert, run } from "@candlelib/cure";
import { garbageCollect } from "../build/ir/optimize.js";
import { createStateMap } from "./tools";
const a = 0;

// Build a state graph from a few of states and ensure after GC
// the states reachable from the roots are still there
const phony_map = createStateMap(
    `
state [stateA]

    goto state [stateB]
`,
    `
state [stateB]

    goto state [stateA]
`,
    `
state [stateC]

    goto state [stateA]
`);

assert("Phony map has three states", phony_map.size == 3);

garbageCollect(phony_map, {}, ["stateA"]);

assert("After GC phony map has two states", phony_map.size == 2);

assert("After GC phony map has stateA", phony_map.has("stateA") == true);

assert("After GC phony map has stateB", phony_map.has("stateB") == true);

assert("After GC phony map does not have stateC", phony_map.has("stateC") == false);

run();