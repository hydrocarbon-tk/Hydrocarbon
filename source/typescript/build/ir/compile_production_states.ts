/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Logger } from '@candlelib/log';
import spark from "@candlelib/spark";
import { user_defined_state_mux } from '../../grammar/nodes/default_symbols.js';
import { GrammarObject } from "../../types/grammar_nodes";
import { StateAttrib, StateMap } from '../../types/ir_state_data';
import { InstructionType } from '../../types/ir_types';
import { default_case_indicator } from '../../utilities/magic_numbers.js';
import { WorkerRunner } from "../workers/worker_runner.js";
import { convertParseProductsIntoStatesMap } from './compile_scanner_states.js';

export const build_logger = Logger.get("MAIN").createLogger("COMPILER");

export async function createIrStates(grammar: GrammarObject, number_of_workers: number) {
    const
        mt_code_compiler = new WorkerRunner(grammar, number_of_workers);

    let old_val = -1;

    for await (const { COMPLETE, total_jobs, completed_jobs } of mt_code_compiler.run()) {

        if (!COMPLETE) {
            const val = Math.round(completed_jobs * 100 / total_jobs);
            if (val != old_val)
                build_logger.rewrite_log(`Productions processed ${val}%`);
            old_val = val;
            await spark.sleep(10);
        }
    }

    const raw_states = [...mt_code_compiler.states.entries()];

    const states_map: StateMap = new Map();

    const scanner_states_map: StateMap = new Map();

    convertParseProductsIntoStatesMap(raw_states, grammar, states_map);

    // Build Scanner states based on the transition requirements of each core state. 
    // Map recovery states to state of their target production ---------------------
    for (const [id, state] of states_map) {
        for (const instruction of state.ir_state_ast.instructions) {
            if (instruction.type == InstructionType.assert
                ||
                instruction.type == InstructionType.peek) {
                if (instruction.ids.includes(0) && instruction.mode != "PRODUCTION")
                    instruction.ids.push(default_case_indicator);
            }
        }


        if (id.slice(0, user_defined_state_mux.length) == user_defined_state_mux) {

            const target_production = id.slice(user_defined_state_mux.length);

            if (states_map.has(target_production)) {

                //@ts-ignore
                states_map.get(target_production).ir_state_ast.fail = state.ir_state_ast;
                state.attributes |= StateAttrib.FAIL_STATE;

                // If there is a "pass" only goto state for the production, replace
                // the pass instruction with a fall through instruction
                const { ir_state_ast } = states_map.get(target_production + "_goto");

                if (ir_state_ast.instructions.length == 1
                    &&
                    ir_state_ast.instructions[0].type == InstructionType.pass) {
                    //@ts-ignore
                    ir_state_ast.instructions[0].type = InstructionType.fall_through;
                }
            }
        }
    }
    return states_map;
}
