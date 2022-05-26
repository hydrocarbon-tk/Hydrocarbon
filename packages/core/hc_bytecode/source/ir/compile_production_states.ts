/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Logger } from '@candlelib/log';
import spark from "@candlelib/spark";
import {
    getSkippableSymbolsFromItems,
    getStartItemsFromProduction,
    GrammarObject,
    InstructionType,
    StateAttrib,
    StateMap,
    TokenTypes,
    user_defined_state_mux
} from '@hctoolkit/common';
import { convertParseProductsIntoStatesMap } from "../common/state_data.js";
import { WorkerRunner } from "../workers/worker_runner.js";
import { create_symbol_clause } from './create_symbol_clause.js';

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

    const raw_states = [...mt_code_compiler.states.values()];

    for (const entry_production of grammar.productions.filter(p => p.IS_ENTRY)) {

        const { name, entry_name } = entry_production;

        const open_state_name = entry_name + "_open";
        const close_state_name = entry_name + "_close";

        const open_state = `
state [${open_state_name}] 

        goto state [${name}] then goto state [${close_state_name}]
        
`;

        const end_body_items = getStartItemsFromProduction(entry_production).map(i => i.toEND());

        const clause = create_symbol_clause(end_body_items, grammar, <any>{ scope: "DESCENT" }, true);

        const close_state = `
state [${close_state_name}]

        assert TOKEN [1] ( pass )

        ${clause}`;

        raw_states.unshift(open_state, close_state);

    }

    const states_map: StateMap = new Map();

    convertParseProductsIntoStatesMap(raw_states, grammar, states_map);

    // Build Scanner states based on the transition requirements of each core state. 
    // Map recovery states to state of their target production ---------------------
    for (const [id, state] of states_map) {


        for (const instruction of state.ir_state_ast.instructions) {
            if (instruction.type == InstructionType.assert
                ||
                instruction.type == InstructionType.peek) {
                if (instruction.ids.includes(0) && instruction.mode != "PRODUCTION")
                    instruction.ids.push(TokenTypes.DEFAULT);
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
                const result = states_map.get(target_production + "_goto");

                if (result) {

                    const { ir_state_ast } = result;

                    if (ir_state_ast.instructions.length == 1
                        &&
                        ir_state_ast.instructions[0].type == InstructionType.pass) {
                        //@ts-ignore
                        ir_state_ast.instructions[0].type = InstructionType.fall_through;
                    }
                }
            }
        }
    }
    return states_map;
}
