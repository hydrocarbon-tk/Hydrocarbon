/**
 * Test the garbage collecting and graph traversal functionality for
 * states build process.
 */
import { convertParseProductsIntoStatesMap } from "../build/common/state_data.js";

export function createStateMap(...states) {

    const sm = new Map;

    convertParseProductsIntoStatesMap(states, { ir_states: [] }, sm);

    return sm;
}