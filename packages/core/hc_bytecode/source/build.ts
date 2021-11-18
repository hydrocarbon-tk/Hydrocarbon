/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Logger } from '@candlelib/log';
import {
    BuildPack,
    GrammarObject,
    StateAttrib,
    StateMap
} from "@hctoolkit/common";
import {
    assignStateAttributeInformation,
    compileIRStatesIntoBytecode,
    extractTokenSymbols
} from './bytecode/bytecode.js';
import { createIrStates } from './ir/compile_production_states.js';
import { compileScannerStates } from './ir/compile_scanner_states.js';
import {
    garbageCollect,
    iterateStateGraph,
    optimize
} from './ir/optimize.js';



export async function createBuildPack(
    grammar: GrammarObject,
    number_of_workers: number = 1,
    OPTIMIZE = true,
    build_logger = Logger.get("MAIN").createLogger("COMPILER")
): Promise<BuildPack> {

    const states_map: StateMap = await createIrStates(grammar, number_of_workers);

    // Process States -------------------------------------------------------------

    const reserved_states = [
        ...grammar.productions.filter(p => p.IS_ENTRY).map(i => i.entry_name + "_open"),
        ...grammar.productions.filter(p => p.type == "scanner-production").map(i => i.name + "")
    ].setFilter();

    garbageCollect(states_map, grammar, reserved_states);

    assignStateAttributeInformation(states_map, grammar);


    let original_states = new Map(states_map);

    build_logger.log(`Created ${states_map.size} raw parse states`);

    if (OPTIMIZE) {

        optimizeStates(states_map, grammar, reserved_states, build_logger);

        build_logger.debug(`Reduced ${original_states.size} raw states to ${states_map.size} optimized states`);

        build_logger.debug(`Total reduction ratio ${Math.round((1 - (states_map.size / original_states.size)) * 100)}%`);

    }

    //Render state strings for later reference

    for (const [, state_data] of states_map)
        extractTokenSymbols(state_data, grammar);

    const {
        scanner_states,
        scanner_id_to_state,
    } = compileScannerStates(states_map, grammar);

    // Merge scanner_states and normal states into a single 
    // uber state collection

    assignStateAttributeInformation(scanner_states, grammar);

    const uber_collection: StateMap = new Map([...scanner_states, ...states_map]);

    reserved_states.length = 0;

    reserved_states.push(
        ...scanner_id_to_state.values(),
        ...grammar.productions.filter(p => p.IS_ENTRY).map(i => i.entry_name + "_open")
    );

    garbageCollect(uber_collection, grammar, reserved_states);

    if (OPTIMIZE) {

        optimizeStates(uber_collection, grammar, reserved_states, build_logger);

        build_logger.debug(`Reduced ${original_states.size} raw states to ${states_map.size} optimized states`);

        build_logger.debug(`Total reduction ratio ${Math.round((1 - (states_map.size / original_states.size)) * 100)}%`);

    }

    //Mark scanner states
    for (const { state } of iterateStateGraph(uber_collection, [...scanner_id_to_state.values()]))
        state.attributes |= StateAttrib.SCANNER;

    //Build states buffer -------------------------------------------------------------

    const state_buffer =
        new Uint32Array(compileIRStatesIntoBytecode(uber_collection, grammar, scanner_id_to_state));

    build_logger.log(`Parse states have been compiled into a ${state_buffer.length * 4}byte states buffer.`);

    build_logger.debug(`Outputting BuildPack`);

    return <BuildPack>{
        grammar,
        state_buffer,
        states_map: uber_collection
    };
}

function optimizeStates(
    states_map: StateMap,
    grammar: GrammarObject,
    reserved_states: string[],
    build_logger: Logger,
    prev_size: number = states_map.size,
) {
    build_logger.log("Optimizing States");

    let round = 0;

    const excludes = new Set(["Advanced State Analysis"]);

    while (optimize(states_map, grammar, reserved_states, excludes)) {
        const p = prev_size;

        prev_size = states_map.size;

        round++;

        build_logger.rewrite_log(`Optimizing State round ${round}: Reduction ratio ${Math.round((1 - (states_map.size / p)) * 100)}%`);
    }

    while (optimize(states_map, grammar, reserved_states)) {
        //Include last ditch optimizations
        round++;
    }
}

