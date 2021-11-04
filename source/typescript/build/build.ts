/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Logger } from '@candlelib/log';
import spark from "@candlelib/spark";
import { WorkerRunner } from "../build/workers/worker_runner.js";
import { addRootScannerFunction, getSymbolProductionName } from '../grammar/compile.js';
import loader from "../grammar/hcg_parser_pending.js";
import { getProductionByName } from '../grammar/nodes/common.js';
import { user_defined_state_mux } from '../grammar/nodes/default_symbols.js';
import { getRootSym, Sym_Is_A_Token } from '../grammar/nodes/symbol.js';
import { createProductionLookup, processSymbol } from '../grammar/passes/common.js';
import { buildItemMaps } from '../grammar/passes/item_map.js';
import { BuildPack } from "../render/render.js";
import { fail_state_mask, goto_state_mask, normal_state_mask } from '../runtime/kernel_next.js';
import { Token } from '../runtime/token.js';
import { GrammarObject, ProductionImportSymbol, ProductionSymbol, TokenSymbol } from "../types/grammar_nodes";
import { BranchIRStateData, IRStateData, StateAttrib, StateMap } from '../types/ir_state_data';
import { BlockData, BranchIRState, Instruction, InstructionType, IRAssert, IRPeek, IR_Instruction, Resolved_IR_State } from '../types/ir_types';
import { ir_reduce_numeric_len_id } from './magic_numbers.js';
import { garbageCollect, IsAssertInstruction, IsPeekInstruction, optimize } from './optimize.js';
import { renderIRNode } from './render_ir_state.js';
import { constructProductionStates } from './state_constructor.js';


const { parse: parser, entry_points: { ir } } = await loader;

export const default_case_indicator = 9999;

const build_logger = Logger.get("MAIN").createLogger("COMPILER");
build_logger.get("PARSER").activate();

function createSymMapId(
    consumed_ids: number[],
    skipped_ids: number[],
    grammar: GrammarObject
) {

    const consumed = consumed_ids.filter(
        i => i > 1 && i != default_case_indicator
    ).map(i => grammar.meta.all_symbols.by_id.get(i));

    const skipped = skipped_ids.filter(
        i => i > 1 && i != default_case_indicator
    ).map(i => grammar.meta.all_symbols.by_id.get(i));

    if (consumed.length < 1)
        return "";

    return (
        consumed.map(i => i.id).setFilter().sort(numeric_sort).join("-")
        + "-s-" +

        skipped.map(i => i.id).setFilter().sort(numeric_sort).join("-")
    );
}

export function constructScannerState(
    consumed_ids: number[],
    skipped_ids: number[],
    grammar: GrammarObject,
    scanner_id_to_state: Map<string, string>,
    scanner_states: Map<string, string>
) {
    let scanner_id = createSymMapId(consumed_ids, skipped_ids, grammar);

    if (!scanner_id) return scanner_id;

    if (scanner_id_to_state.has(scanner_id)) {
        return scanner_id_to_state.get(scanner_id);
    }

    const consumed_symbols = consumed_ids
        .filter(i => i > 1 && i != default_case_indicator)
        .setFilter()
        .map(i => grammar.meta.all_symbols.by_id.get(i));

    const skipped_symbols = skipped_ids
        .filter(s => !consumed_ids.includes(s))
        .filter(i => i > 1 && i != default_case_indicator)
        .setFilter()
        .map(i => grammar.meta.all_symbols.by_id.get(i));


    //Create checkpoints for original grammar data
    let productions_length = grammar.productions.length;
    let bodies_length = grammar.bodies.length;
    let old_item_map = grammar.item_map;

    grammar.item_map = new Map(old_item_map);

    let old_symbol_offset = grammar.meta.id_offset;
    let old_symbols = grammar.meta.all_symbols;

    grammar.meta.all_symbols = Object.assign(
        new Map(grammar.meta.all_symbols),
        { by_id: new Map(grammar.meta.all_symbols.by_id) }
    );

    const local_id = scanner_id_to_state.size;

    const name = `__SCANNER${local_id}__`;

    //Insert a generated production for these symbols
    let entry = addRootScannerFunction(
        `<> ${name} > ${consumed_symbols.map(
            sym => {
                return getSymbolProductionName(sym);
            }).filter(a => !!a).join("\n    | ")
        + (skipped_symbols.length > 0 ? "\n    | " : "") +
        skipped_symbols.map(
            sym => {
                return "! " + getSymbolProductionName(sym);
            }).filter(a => !!a).join("\n    | ")
        }\n`,
        9999
    );

    entry.id = grammar.productions.push(entry) - 1;
    entry.name = name;
    entry.bodies.forEach((b, i) => {
        b.production = entry;
        b.length = 1;
        const sym = b.sym[0];
        const production_lookup = createProductionLookup(grammar);
        processSymbol(
            grammar,
            sym,
            production_lookup,
            grammar.meta.all_symbols,
        );

        b.id = i + grammar.bodies.length;
    });

    grammar.bodies.push(...entry.bodies);

    buildItemMaps(grammar, [entry]);

    const data = constructProductionStates(
        entry,
        grammar,
    );

    for (const [name, state] of data.parse_states) {
        if (!scanner_states.has(name))
            scanner_states.set(name, state);
    }

    scanner_id_to_state.set(scanner_id, name);

    //Restore the original grammar

    grammar.productions.length = productions_length;
    grammar.bodies.length = bodies_length;
    grammar.item_map = old_item_map;
    grammar.meta.id_offset = old_symbol_offset;
    grammar.meta.all_symbols = old_symbols;

    return name;
}

export async function createBuildPack(
    grammar: GrammarObject,
    number_of_workers: number = 1
): Promise<BuildPack> {

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
                instruction.type == InstructionType.peek
            ) {
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

                if (
                    ir_state_ast.instructions.length == 1
                    &&
                    ir_state_ast.instructions[0].type == InstructionType.pass
                ) {
                    //@ts-ignore
                    ir_state_ast.instructions[0].type = InstructionType.fall_through;
                }
            }
        }
    }

    // Process States -------------------------------------------------------------

    const sym_map: Map<string, string> = new Map();

    let OPTIMIZE = true;

    const reserved_states = [
        ...grammar.productions.filter(p => p.IS_ENTRY || p.type == "scanner-production").map(i => i.name + "")
    ].setFilter();

    garbageCollect(states_map, grammar, reserved_states);

    assignStateAttributeInformation(states_map, grammar);

    let original_states = new Map(states_map);

    build_logger.log(`Created ${states_map.size} raw parse states`);

    if (OPTIMIZE) {

        optimizeStates(states_map, grammar, reserved_states);

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
    reserved_states.push(...scanner_id_to_state.values(), ...grammar.productions.filter(p => p.IS_ENTRY).map(i => i.name + ""));

    garbageCollect(uber_collection, grammar, reserved_states);

    if (OPTIMIZE) {

        optimizeStates(uber_collection, grammar, reserved_states);

        build_logger.debug(`Reduced ${original_states.size} raw states to ${states_map.size} optimized states`);

        build_logger.debug(`Total reduction ratio ${Math.round((1 - (states_map.size / original_states.size)) * 100)}%`);

    }

    for (const [, state_data] of uber_collection) {

        //Replace id 0 with 9999

        state_data.string = (state_data.string.match(/\/\*[^\*]+\*\//sm)?.[0] ?? "")
            + "\n"
            + renderIRNode(state_data.ir_state_ast);

        build_logger.debug(state_data.string);
    }

    //Build states buffer -------------------------------------------------------------

    const state_buffer = new Uint32Array(statesOutputsBuildPass(uber_collection, grammar, scanner_id_to_state));

    build_logger.log(`Parse states have been compiled into a ${state_buffer.length * 4}byte states buffer.`);

    build_logger.debug(`Outputting BuildPack`);

    return <BuildPack>{
        grammar,
        state_buffer,
        states_map: uber_collection
    };
}


const numeric_sort = (a: number, b: number): number => a - b;

function optimizeStates(
    states_map: StateMap,
    grammar: GrammarObject,
    reserved_states: string[],
    prev_size: number = states_map.size
) {
    build_logger.log("Optimizing States");

    let round = 0;

    const excludes = new Set(["Advanced State Analysis"]);
    //build_logger.debug(`Optimizing State round ${++round}`);
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

function convertParseProductsIntoStatesMap(ir_states: [string, string][], grammar: GrammarObject, states_map: StateMap) {
    for (const [string, ir_state_ast] of <([string, Resolved_IR_State])[]>[
        ...ir_states.map(

            //@ts-ignore
            function ([hash, str]) {

                try {
                    const { result: [ir_state], err } = parser(str, {}, ir);

                    if (err)
                        throw err;

                    return [str, ir_state];
                } catch (e) {
                    build_logger.get("PARSER").debug(str);
                    build_logger.get("PARSER").critical(hash, str);
                    throw e;
                }
            }
        ),
        ...grammar.ir_states.map(ir => [
            ir.tok.slice(),
            ir
        ])
    ])
        insertIrStateBlock(ir_state_ast, string, grammar, states_map);
}

function insertIrStateBlock(
    ir_state_ast: Resolved_IR_State,
    string: string,
    grammar: GrammarObject,
    states_map: StateMap,
    state_attributes: StateAttrib = 0
) {

    const id = ir_state_ast.id;


    const IS_PRODUCTION_ENTRY = getProductionByName(grammar, id) != null;

    states_map.set(id + "", {
        reference_count: 0,
        block_offset: 0,
        pointer: -1,
        attributes: (IS_PRODUCTION_ENTRY ? StateAttrib.PRODUCTION_ENTRY : 0) | state_attributes,
        string: ((StateAttrib.FAIL_STATE & state_attributes) ? "[FAILURE HANDLER]\n\n" : "") + string,
        ir_state_ast: ir_state_ast,
        block: null,
    });

    if (ir_state_ast.fail)
        insertIrStateBlock(ir_state_ast.fail, ir_state_ast.fail.tok.slice(), grammar, states_map, StateAttrib.FAIL_STATE);
}




function insertInstructionSequences(
    instruction_sections: Instruction[],
    state_map: StateMap,
    block_info: BlockData,
    default_block_size: number = 0,
    instruction_offset = 0,
): number[] {



    let buffer = [];

    let local_offset = instruction_offset;

    for (const instruction of instruction_sections) {

        let temp_buffer = [];

        local_offset = instruction_offset + buffer.length + temp_buffer.length;

        switch (instruction[0]) {

            case "end": case InstructionType.pass:
                temp_buffer.push(0 >>> 0); break;

            case InstructionType.left_most: {
                temp_buffer.push(13 << 28);
            } break;

            case InstructionType.consume: {
                temp_buffer.push(1 << 28);
            } break;

            case InstructionType.empty_consume: {
                temp_buffer.push((1 << 28) | 1);
            } break;

            case InstructionType.goto: {
                temp_buffer.push((2 << 28) | normal_state_mask | state_map.get(getStateName(instruction[1])).pointer);
            } break;

            case InstructionType.set_prod: {
                temp_buffer.push(3 << 28 | instruction[1]);
            } break;

            case InstructionType.reduce: {
                let [, sym_len, id] = instruction;

                if (sym_len == ir_reduce_numeric_len_id) {
                    let reduce_fn_id = id;

                    temp_buffer.push(4 << 28 | reduce_fn_id << 16 | 0xFFFF);
                } else {

                    let reduce_fn_id = id;

                    temp_buffer.push(4 << 28 | sym_len << 16 | reduce_fn_id);
                }

            } break;

            case InstructionType.assert_consume: {

                let mode = ((["CLASS", "CODEPOINT", "BYTE"].indexOf(instruction[1])) << 24);

                temp_buffer.push(14 << 28 | mode | (instruction[2] & 0xFFFFFF));
            } break;

            case InstructionType.token_length: {

                let length = instruction[1];

                temp_buffer.push(5 << 28 | 0x04000000 | (length & 0xFFFFFF));
            } break;

            case InstructionType.token_assign: {

                let ids = instruction[1];

                let val = ids[0];

                temp_buffer.push(5 << 28 | 0x08000000 | (val & 0xFFFFFF));
            } break;

            case InstructionType.fork_to: {

                const [, length, gotos] = instruction;

                temp_buffer.push(6 << 28 | length);

                for (const gt of gotos)
                    temp_buffer.push(state_map.get(getStateName(gt)).pointer);

            } break;

            case InstructionType.scan_back_until: {
                const [, token_state, length, ids] = instruction;
                temp_buffer.push(7 << 28 | 0x00100000 | (length & 0xFFFF), state_map.get(token_state)?.pointer ?? 0, ...ids);
            } break;

            case InstructionType.scan_until: {
                const [, token_state, length, ids] = instruction;
                temp_buffer.push(7 << 28 | (length & 0xFFFF), state_map.get(token_state)?.pointer ?? 0, ...ids);
            } break;

            case "table": {

                const [,
                    input_type,
                    lexer_type,
                    token_state = "",
                    token_basis,
                    number_of_rows,
                    row_size,
                    table_entries
                ] = instruction;

                const
                    table_header =
                        (9 << 28) |
                        ((["PRODUCTION", "TOKEN", "CLASS", "CODEPOINT", "BYTE"].indexOf(input_type)) << 22)
                        |
                        ((["peek", "assert"].indexOf(lexer_type) + 1) << 26)
                        |
                        (token_basis & 0xFFFF),

                    token_info = state_map.get(token_state)?.pointer ?? 0,

                    table_info =
                        ((number_of_rows & 0xFFFF) << 16)
                        |
                        (row_size & 0xFFFF);

                temp_buffer.push(table_header >>> 0, token_info >>> 0, table_info >>> 0);


                for (const table_entry of table_entries) {
                    temp_buffer.push(...insertInstructionSequences(
                        table_entry, state_map, block_info, row_size,
                        local_offset + temp_buffer.length
                    ));
                };
            } break;

            case "scanner": {

                const
                    [,
                        input_type,
                        lexer_type,
                        token_state,
                        scan_field_length,
                        instruction_field_size,
                        scanner_key_index_pairs,
                        sequence_entries
                    ] = instruction;

                //construct the hash entries

                const hash_entries = (new Array(scanner_key_index_pairs.length))
                    .fill(0, 0, scanner_key_index_pairs.length);

                const pending_pairs = scanner_key_index_pairs.slice();

                const mod_base = Math.floor(Math.log2(scanner_key_index_pairs.length));

                const mod_mask = (1 << mod_base) - 1;

                for (let i = 0, j = 0; i < (1 << mod_base); i++) {

                    for (let j = 0; j < pending_pairs.length; j++) {
                        const [val, instr] = pending_pairs[j];
                        if ((val & mod_mask) == i) {
                            pending_pairs.splice(j, 1);
                            hash_entries[i] = (
                                (val & 0x7FF)
                                |
                                ((instr & 0x7FF) << 11)
                                |
                                (512 << 22)
                            ) >>> 0;
                            break;
                        }
                    }
                }

                for (let i = 0; i < pending_pairs.length; i++) {

                    const [val, instr] = pending_pairs[i];

                    let pointer = 0;

                    let node = val & mod_mask;

                    while (true) {

                        pointer = ((hash_entries[node] >>> 22) & 0x3FF) - 512;

                        if (pointer == 0)
                            break;

                        else
                            node += pointer;
                    }

                    for (let j = 0; j < hash_entries.length; j++) {
                        if (hash_entries[j] == 0) {

                            hash_entries[node] =
                                (
                                    ((((j - node) + 512) & 0x3FF) << 22)
                                    |
                                    (hash_entries[node] & ((1 << 22) - 1))
                                ) >>> 0;

                            hash_entries[node] = hash_entries[node] >>> 0;

                            hash_entries[j] = (
                                (val & 0x7FF)
                                |
                                ((instr & 0x7FF) << 11)
                                |
                                (512 << 22)
                            ) >>> 0;

                            break;
                        }
                    }
                }

                const
                    table_header =
                        (10 << 28) |
                        ((["PRODUCTION", "TOKEN", "CLASS", "CODEPOINT", "BYTE"].indexOf(input_type)) << 22)
                        |
                        ((["peek", "assert"].indexOf(lexer_type) + 1) << 26)
                        |
                        (instruction_field_size & 0xFFFF),

                    token_info = (state_map.get(token_state)?.pointer ?? 0),

                    table_info =
                        ((mod_base & 0xFFFF) << 16)
                        |
                        (scanner_key_index_pairs.length & 0xFFFF);

                temp_buffer.push(table_header, token_info, table_info);

                temp_buffer.push(...hash_entries);

                for (const sequence of sequence_entries) {
                    temp_buffer.push(...insertInstructionSequences(
                        sequence, state_map, block_info, 0,
                        local_offset + temp_buffer.length
                    ));
                };

            } break;

            case "set fail": {
                temp_buffer.push(11 << 28 | fail_state_mask | state_map.get(getStateName(instruction[1])).pointer);
            } break;

            case InstructionType.repeat: {
                const origin = local_offset + 1;
                temp_buffer.push(12 << 28 | origin);
            } break;

            case InstructionType.fail: temp_buffer.push((15 << 28) >>> 0); break;

            case InstructionType.fall_through: temp_buffer.push((15 << 28) | 1); break;

        }

        buffer.push(...temp_buffer);

        local_offset = instruction_offset + buffer.length;
    }

    while (buffer.length < default_block_size)
        buffer.push(0);

    return buffer;
}



function renderInstructionSequences(
    instruction_sections: Instruction[],
    state_map: StateMap,
    count: { c: number; } = { c: 0 },
    default_block_size: number = 0,
): string[] {

    let buffer = [];

    let start = count.c;

    for (const instruction of instruction_sections) {

        switch (instruction[0]) {

            case "end": case InstructionType.pass:
                buffer.push(`${address(count)}:                 END_`);
                count.c += 4;
                break;

            case InstructionType.consume: {
                buffer.push(`${address(count)}:                 EAT_`);
                count.c += 4;
            } break;

            case InstructionType.empty_consume: {
                buffer.push(`${address(count)}:                 EATN`);
                count.c += 4;
            } break;

            case InstructionType.goto: {
                buffer.push(`${address(count)}:                 GOTO %${getStateName(instruction[1])}`);
                count.c += 4;
            } break;

            case InstructionType.set_prod: {
                buffer.push(`${address(count)}:                 PROD ${instruction[1]}`);
                count.c += 4;
            } break;

            case InstructionType.reduce: {
                buffer.push(`${address(count)}:                 RED_ LEN:${instruction[1]} BDY:${instruction[2]}`);
                count.c += 4;
            } break;

            case InstructionType.token_length: {
                buffer.push(`${address(count)}:                 TKLN ${instruction[1]}`);
                count.c += 4;
            } break;

            case InstructionType.token_assign: {
                buffer.push(`${address(count)}:                 TKID ${instruction[1]}`);
                count.c += 4;
            } break;

            case InstructionType.fork_to: {
                const [, length, gotos] = instruction;
                buffer.push(`${address(count)}:                 FORK ${gotos.map(i => `%${i}`).join(" | ")}`);
                count.c += 4 + gotos.length * 4;
            } break;

            case InstructionType.assert_consume: {
                const [, mode, val] = instruction;
                buffer.push(`${address(count)}:                 ASCS MODE:${mode} VAL:${val}`);
                count.c += 4;
            } break;

            case InstructionType.scan_back_until: {
                const [, token_state, length, ids] = instruction;
                buffer.push(`${address(count)}:                 SCNF %${token_state}% ${ids.map(i => `%${i}`).join(" | ")}`);
                count.c += 8 + ids.length * 4;
            } break;

            case InstructionType.scan_until: {
                const [, token_state, length, ids] = instruction;
                buffer.push(`${address(count)}:                 SCNB %${token_state}% ${ids.map(i => `%${i}`).join(" | ")}`);
                count.c += 8 + ids.length * 4;
            } break;

            case "table": {

                const [,
                    input_type,
                    lexer_type,
                    token_state = "",
                    token_basis,
                    number_of_rows,
                    row_size,
                    table_entries
                ] = instruction;

                buffer.push(`
${address(count)}:                  JMPT  

            INPUT:    ${input_type} 
            LEX:      ${lexer_type} 
            SCANNER:  %${token_state}% 
            BASIS:    ${token_basis} 
========================================================\n`);

                const t_id = `JUMP_TABLE${address(count)}`;
                let i = 0;

                count.c += 12;

                const temp_buffer = [];

                for (const table_entry of table_entries.slice(0, 1)) {
                    temp_buffer.push(`---START ${t_id}::DEFAULT`, ...renderInstructionSequences(
                        table_entry,
                        state_map,
                        count,
                        row_size * 4
                    ), `---END   ${t_id}::DEFAULT\n`);
                }

                for (const table_entry of table_entries.slice(1)) {

                    temp_buffer.push(`---START ${t_id}::${i + token_basis}`, ...renderInstructionSequences(
                        table_entry,
                        state_map,
                        count,
                        row_size * 4
                    ), `---END   ${t_id}::${(i++) + token_basis}\n`);
                };

                buffer.push(...temp_buffer);

            } break;

            case "scanner": {

                const
                    [,
                        input_type,
                        lexer_type,
                        token_state,
                        scan_field_length,
                        instruction_field_size,
                        scanner_key_index_pairs,
                        sequence_entries
                    ] = instruction;
                const mod_base = Math.floor(Math.log2(scanner_key_index_pairs.length));
                const mod_mask = (1 << mod_base) - 1;

                buffer.push(`
${address(count)}:                  HASH  

            INPUT:    ${input_type} 
            LEX:      ${lexer_type} 
            SCANNER:  %${token_state}% 
            DENOM:    ${mod_mask} 
========================================================\n`);

                const t_id = `HASH_TABLE${address(count)}`;
                let i = 0;

                count.c += 12 + 4 * scanner_key_index_pairs.length;

                const temp_buffer = [];

                for (const sequence of sequence_entries) {

                    temp_buffer.push(`---START ${t_id}::${scanner_key_index_pairs[i][0]}`, ...renderInstructionSequences(
                        sequence,
                        state_map,
                        count
                    ), `---END   ${t_id}::${scanner_key_index_pairs[i++][0]}\n`);
                };

                buffer.push(...temp_buffer);
            } break;

            case "set fail": {
                buffer.push(`${address(count)}:                 SETF ${instruction[1]}`);
                count.c += 4;
            } break;

            case InstructionType.repeat: {
                buffer.push(`${address(count)}:                 REPT`);
                count.c += 4;
            } break;

            case InstructionType.fail:
                buffer.push(`${address(count)}:                 FAIL`);
                count.c += 4;
                break;

            case InstructionType.fall_through:
                buffer.push(`${address(count)}:                 FALL`);
                count.c += 4;

        }
    }

    while ((count.c - start) < default_block_size) {
        buffer.push(`${address(count)}:                 NOOP`);
        count.c += 4;
    }

    buffer.unshift(`####### ${count.c - start} bytes #######`);

    return buffer;
}


function address(count: { c: number; }) {
    return ("000000000" + count.c.toString(16)).slice(-6);
}

function createInstructionSequence(
    active_instructions: IR_Instruction[],
    grammar: GrammarObject,
    token_state: string,
    token_id_to_state: Map<string, string>
): { byte_length: number, byte_sequence: Instruction[]; } {

    const instruction_sequence: Instruction[] = [];

    // The order of the goto instructions are reversed to change 
    // their execution order from FIFO to FILO, conforming to 
    // behavior observed on a stack.

    const goto_instructions = active_instructions.filter(i => i.type == InstructionType.goto || i.type == InstructionType.repeat).reverse();
    const standard_instructions = active_instructions.filter(i => !(i.type == InstructionType.goto || i.type == InstructionType.repeat));

    let byte_length = 0;
    const combined = [...standard_instructions, ...goto_instructions];

    for (let i = 0; i < combined.length; i++) {

        const instr = combined[i];

        switch (instr.type) {
            case InstructionType.inline_assert: {

                let token_state = "";

                if (instr.mode == "TOKEN") {

                    const id = createSymMapId(
                        [...instr.token_ids, ...instr.ids].setFilter(),
                        instr.skipped_ids.setFilter(),
                        grammar
                    );

                    token_state = token_id_to_state.get(id);
                } else if (instr.mode != "PRODUCTION" && instr.ids.length == 1) {
                    if (combined[i + 1] && combined[i + 1].type == InstructionType.consume) {
                        i++; byte_length += 4;
                        instruction_sequence.push([
                            InstructionType.assert_consume,
                            instr.mode,
                            instr.ids[0]
                        ]);

                    }
                    continue;
                }

                let instruction: Instruction = null;

                if (instr.ids.length > 1) {
                    byte_length += 12 + instr.ids.length * 4 + 4;
                    instruction = [
                        "scanner",
                        instr.mode,
                        InstructionType.assert,
                        token_state,
                        instr.ids.length,
                        0,
                        <[number, number][]>instr.ids.map(i => [i, 1]),
                        []
                    ];
                    instruction_sequence.push(instruction, [InstructionType.fail]);
                } else {
                    byte_length += 16;
                    const basis = instr.ids[0];
                    instruction = createTableInstruction(
                        instr.mode,
                        InstructionType.assert,
                        token_state,
                        basis,
                        1,
                        1,
                        [[[InstructionType.fail]]]
                    );
                    instruction_sequence.push(instruction);
                }

            } break;

            case InstructionType.token_assign:
                byte_length += 4;
                instruction_sequence.push([InstructionType.token_assign, instr.ids]);
                break;

            case InstructionType.token_length:
                byte_length += 4;
                instruction_sequence.push([InstructionType.token_length, instr.len]);
                break;

            case InstructionType.pass:
                byte_length += 4;
                instruction_sequence.push([InstructionType.pass]);
                break;

            case InstructionType.fall_through:
                byte_length += 4;
                instruction_sequence.push([InstructionType.fall_through]);
                break;

            case InstructionType.consume:

                byte_length += 4;

                if (instr.EMPTY)
                    instruction_sequence.push([InstructionType.empty_consume]);
                else
                    instruction_sequence.push([InstructionType.consume]);

                break;

            case InstructionType.fail:
                byte_length += 4;
                instruction_sequence.push([InstructionType.fail]);
                break;

            case InstructionType.goto:
                byte_length += 4;
                instruction_sequence.push([InstructionType.goto, <string>instr.state]);
                break;

            case InstructionType.set_prod:
                byte_length += 4;
                instruction_sequence.push([
                    InstructionType.set_prod,
                    <number>convertTokenIDsToSymbolIds([<any>instr.id], grammar)[0]
                ]);
                break;

            case InstructionType.fork_to:
                byte_length += 4 + 4 * (instr.states.length);
                instruction_sequence.push([InstructionType.fork_to, instr.states.length, <string[]>instr.states]);
                break;

            case InstructionType.scan_back_until:
                byte_length += 8 + 4 * instr.ids.length;
                instruction_sequence.push([
                    InstructionType.scan_back_until,
                    token_state,
                    instr.ids.length,
                    <number[]>convertTokenIDsToSymbolIds(instr.ids, grammar)
                ]);
                break;

            case InstructionType.scan_until:
                byte_length += 8 + 4 * instr.ids.length;
                instruction_sequence.push([
                    InstructionType.scan_until,
                    token_state,
                    instr.ids.length,
                    convertTokenIDsToSymbolIds(instr.ids, grammar)
                ]);
                break;

            case InstructionType.reduce:
                byte_length += 4;
                instruction_sequence.push([InstructionType.reduce, instr.len, <number>instr.reduce_fn]);
                break;

            case InstructionType.repeat:
                byte_length += 4;
                instruction_sequence.push([InstructionType.repeat]);
                break;
        }
    }

    const last = instruction_sequence.slice().pop();

    if (last[0] != InstructionType.pass && last[0] != InstructionType.fail) {
        instruction_sequence.push(["end"]);
        byte_length += 4;
    }


    return { byte_length, byte_sequence: instruction_sequence };
}

function getStateName(
    name_candidate: ProductionSymbol | ProductionImportSymbol | string
): string {
    if (!name_candidate) return "";

    if (typeof name_candidate == "string")
        return name_candidate;

    if (name_candidate instanceof Token || "IS_TOKEN" in name_candidate)
        return name_candidate + "";

    return name_candidate.name;
}

function assignStateAttributeInformation(StateMap: StateMap, grammar: GrammarObject) {


    for (const [state_name, state_data] of StateMap) {

        let attributes = state_data.attributes;

        //Construct base state attributes 

        // Get all initial states. if branch function,
        // assert all top level instructions are of the
        // the same class [prod or token]

        if (state_name.match(/_goto/))
            attributes |= StateAttrib.REQUIRED_GOTO;

        const token_instr_types = {
            [InstructionType.assert]: StateAttrib.ASSERT_BRANCH,
            [InstructionType.peek]: StateAttrib.PEEK_BRANCH,
        };

        attributes |= state_data.ir_state_ast.instructions.reduce(
            (r, v) => (r | (token_instr_types[v.type] ?? 0))
            , 0);

        if ((attributes & (StateAttrib.TOKEN_BRANCH)) > 0
            &&
            state_data.ir_state_ast.instructions.length > 1
        ) attributes |= StateAttrib.MULTI_BRANCH;

        if (
            (attributes & StateAttrib.TOKEN_BRANCH) > 0
            &&
            (attributes & StateAttrib.PROD_BRANCH) > 0
        ) new Error(`Unsupported mixture of token branch (assert | peek) and production branch ( on prod ) instructions`);

        if (
            (attributes & (StateAttrib.ASSERT_BRANCH)) > 0
            &&
            (attributes & StateAttrib.PEEK_BRANCH) > 0
        ) new Error(`Unsupported mixture of assertion branch ( assert ) and peek branch ( peek ) instructions`);

        state_data.attributes = attributes;
    }
}

function convertTokenIDsToSymbolIds(ids: (number | string | TokenSymbol | ProductionSymbol)[], grammar: GrammarObject): number[] {
    let out_ids: number[] = [];

    for (const id of ids) {

        if (typeof id == "number" || typeof id == "string")

            out_ids.push(<number>id);

        else if (Sym_Is_A_Token(id))

            out_ids.push(getRootSym(id, grammar).id);

        else {
            out_ids.push(grammar.productions[id.val].id);
        }
    }

    return out_ids;
}

function processInstructionTokens(
    instructions: IR_Instruction[],
    expected_symbols: number[],
    grammar: GrammarObject
) {
    for (const instruction of instructions) {
        switch (instruction.type) {
            case InstructionType.assert:
            case InstructionType.peek:

                if (instruction.mode == "TOKEN") {
                    //@ts-ignore
                    expected_symbols.push(...convertTokenIDsToSymbolIds(instruction.ids, grammar));
                    processInstructionTokens(instruction.instructions, expected_symbols, grammar);
                }

                break;
            case InstructionType.scan_until:
                //@ts-ignore
                expected_symbols.push(...convertTokenIDsToSymbolIds(instruction.ids, grammar));
                break;

        }
    }
}
function extractTokenSymbols(state_data: IRStateData, grammar: GrammarObject) {

    const expected_symbols = [];
    const skipped_symbols = [];

    processInstructionTokens(
        state_data.ir_state_ast.instructions,
        expected_symbols,
        grammar
    );

    if (state_data.ir_state_ast.symbol_meta) {
        const { expected, skipped } = state_data.ir_state_ast.symbol_meta;
        expected_symbols.push(...expected);
        skipped_symbols.push(...skipped);
    }

    state_data.expected_tokens = expected_symbols.filter(s => s != default_case_indicator); // <- remove default value
    state_data.skipped_tokens = skipped_symbols.filter(s => s != default_case_indicator);// <- remove default value
}

function statesOutputsBuildPass(StateMap: StateMap, grammar: GrammarObject, sym_map: Map<string, string>) {

    let total_instruction_byte_size = 24; // Ensure the zero position is reserved for the "null" state

    for (const [, state_data] of StateMap) {

        const { ir_state_ast: state_ast, attributes, string } = state_data;

        let { expected_tokens, skipped_tokens } = state_data;

        let token_state: string = "";

        if (expected_tokens?.length > 0 || skipped_tokens?.length > 0) {
            //create a meta lookup instruction

            const id = createSymMapId(
                expected_tokens.setFilter(),
                skipped_tokens.setFilter(),
                grammar
            );

            token_state = sym_map.get(id);
        }

        state_data.block_offset = total_instruction_byte_size;

        if (stateHasBranchIR(state_data)) {
            //sort branch instructions into groups

            const { ir_state_ast: state_ast, attributes } = state_data;

            let _default = state_ast.instructions.filter(g => g.mode != "PRODUCTION" && g.ids.some(i => i == 9999 || i == 1))[0]
                ?.instructions;

            const modes = state_ast.instructions.filter(g => !(g.mode != "PRODUCTION" && g.ids.some(i => i == 9999 || i == 1)))
                .group(s => s.mode);

            if (_default)
                state_data.block = buildBasicInstructionBlock(state_ast, _default, token_state, grammar, sym_map);

            modes.sort(([a], [b]) => {

                const ids = ["PRODUCTION", "TOKEN", "CLASS", "CODEPOINT", "BYTE"];

                return ids.indexOf(a.mode) - ids.indexOf(b.mode);
            });

            for (const mode of modes) {

                const

                    jump_block_info = buildJumpTableBranchBlock(
                        state_ast, mode, attributes, token_state, grammar, sym_map,
                        state_data.block
                    ),

                    hash_block_info = buildHashTableBranchBlock(
                        state_ast, mode, attributes, token_state, grammar, sym_map,
                        state_data.block
                    ),

                    block = hash_block_info ? selectBestFitBlockType(jump_block_info, hash_block_info)
                        : jump_block_info;

                state_data.block = block;
            }

            if (state_ast.fail) {
                state_data.block.total_size += 4;
                state_data.block.instruction_sequence.unshift(["set fail", <string>state_ast.fail.id]);
            }

            total_instruction_byte_size += state_data.block.total_size;

        } else {

            const block_info = buildBasicInstructionBlock(
                state_ast,
                state_ast.instructions,
                token_state,
                grammar,
                sym_map
            );

            total_instruction_byte_size += block_info.total_size;

            state_data.block = block_info;
        }

        state_data.pointer = (state_data.block_offset / 4);

        if ((attributes & StateAttrib.FAIL_STATE) > 0)
            state_data.pointer |= fail_state_mask;
        else
            state_data.pointer |= normal_state_mask;

        if (attributes & StateAttrib.REQUIRED_GOTO)
            state_data.pointer |= goto_state_mask;

    }

    const out_buffer = [
        (15 << 28) | 1, // Default Pass Through
        0 << 28, //Default Pass
        15 << 28, // Default Fail
        (8 << 28) | (1 << 24), // Scope Pop
        0 | normal_state_mask,
        grammar.meta.token_row_size,
    ]; // The pass, fail, scope pop, and pass through return instructions

    const offset = { c: out_buffer.length * 4 };

    for (const [_, state_data] of StateMap) {
        /* console.log(
            "\n\nSTATE " + state_data.ir_state_ast.id + "\n",
            `e-size ${state_data.block.total_size}`,
            "-------------------------------------------------------------",
            state_data.string + "\n",
            "-------------------------------------------------------------\n",
            renderInstructionSequences(
                state_data.block.instruction_sequence,
                StateMap,
                offset,
                state_data.block.total_size
            ).join("\n")); */

        const buffer = convertBlockDataToBufferData(state_data, StateMap);

        out_buffer.push(...buffer);
    }

    return out_buffer;
}
function convertBlockDataToBufferData(state_data: IRStateData, state_map: StateMap): number[] {

    const block_info = state_data.block;

    const buffer = [];



    buffer.push(...insertInstructionSequences(
        block_info.instruction_sequence,
        state_map,
        block_info,
        (block_info.total_size / 4)
    ));

    if (buffer.length != (block_info.total_size / 4)) {
        throw new Error(
            `Buffer data length does not match length calculated in BlockData. 
    Expected a block size of ${block_info.total_size / 4} words;
         Got a block size of ${buffer.length} words;
    Original state [ ${state_data.ir_state_ast.id} ]: \n\n${state_data.string}\n\n
            `);
    }

    return buffer;
}

function compileScannerStates(
    states_map: StateMap,
    grammar: GrammarObject,
) {

    const scanner_states: StateMap = new Map;

    const raw_scanner_states = new Map;

    const scanner_id_to_state = new Map;

    for (const [, state_data] of states_map) {

        let { expected_tokens, skipped_tokens, ir_state_ast } = state_data;

        if (expected_tokens.length > 0 || skipped_tokens.length > 0) {

            //create a meta lookup instruction
            constructScannerState(
                expected_tokens.setFilter(),
                skipped_tokens.setFilter(),
                grammar,
                scanner_id_to_state,
                raw_scanner_states
            );
        }

        const potential_scanner_instructions = [...ir_state_ast.instructions];

        for (const instruction of potential_scanner_instructions) {
            if (IsAssertInstruction(instruction) || IsPeekInstruction(instruction)) {
                if (instruction.mode == "TOKEN" || instruction.mode == "PRODUCTION")
                    potential_scanner_instructions.push(...instruction.instructions);
            } else if (instruction.type == InstructionType.inline_assert) {
                if (instruction.mode == "TOKEN") {

                    const expected_tokens = [...instruction.ids, ...instruction.token_ids];
                    const skipped_tokens = instruction.skipped_ids;

                    constructScannerState(
                        expected_tokens.setFilter(),
                        skipped_tokens.setFilter(),
                        grammar,
                        scanner_id_to_state,
                        raw_scanner_states
                    );
                }
            }
        }
    }

    convertParseProductsIntoStatesMap(
        [...raw_scanner_states.entries()]
        , grammar, scanner_states
    );

    return {
        scanner_states,
        scanner_id_to_state
    };
}

function stateHasBranchIR(state_data: IRStateData): state_data is BranchIRStateData {
    return (
        state_data.ir_state_ast.instructions[0].type == InstructionType.assert
        ||
        state_data.ir_state_ast.instructions[0].type == InstructionType.peek
    );
}


function selectBestFitBlockType(jump_table_block: BlockData, hash_table_block: BlockData) {

    // How much bigger a jump table block is compared to a hash table block
    // in ratio form
    const block_size_ratio = jump_table_block.total_size / hash_table_block.total_size;

    // How many more jump table entries there are compared to hash table entries
    // in ratio form
    const sparse_table_fill_ratio = jump_table_block.number_of_elements
        / (hash_table_block.number_of_elements);

    const block = (
        (!isNaN(sparse_table_fill_ratio) && !isNaN(block_size_ratio)) &&
        (sparse_table_fill_ratio < 4 && block_size_ratio < 4)) ? jump_table_block : hash_table_block;


    return block;
}

function get8AlignedOffset(request_size: number) {
    return Math.ceil(request_size / 4) * 4;
}

function get32AlignedOffset(request_size: number) {
    return Math.ceil(request_size / 32) * 32;
}

function createTableInstruction(
    input_type: "PRODUCTION" | "TOKEN" | "BYTE" | "CODEPOINT" | "CLASS",
    lexer_type: InstructionType.peek | InstructionType.assert = InstructionType.assert,
    token_state: string,
    basis: number,
    number_of_rows: number,
    row_32bit_size: number,
    table_entries: Instruction[][]
): Instruction {
    return ["table",
        input_type,
        lexer_type,
        token_state,
        basis,
        number_of_rows,
        row_32bit_size,
        table_entries,];
}

function buildJumpTableBranchBlock(
    state_ast: BranchIRState,
    instructions: (IRPeek | IRAssert)[],
    attributes: StateAttrib,
    token_state: string,
    grammar: GrammarObject,
    token_id_to_state: Map<string, string>,
    default_block: BlockData = null
): BlockData {


    let standard_instructions = instructions;//.filter(i => !i.ids.some(i => i == default_case_indicator));


    const input_type = instructions[0].mode;
    const lexer_type = instructions[0].type;

    const ids: number[] = <number[]>standard_instructions.flatMap(i => i.ids).sort(numeric_sort);

    const standard_byte_codes = standard_instructions
        .flatMap(({ ids, instructions, type }) => {

            const instr = createInstructionSequence(instructions, grammar, token_state, token_id_to_state);
            return ids.filter(i => i != default_case_indicator).map(i => ({ id: i, code: instr }));
        });


    const number_of_rows = 1 + ids[ids.length - 1] - ids[0];

    const basis = ids[0];

    const table_entries: Instruction[][] = [];

    let last_offset = basis;

    let max_instruction_byte_size = 4;
    for (const { id, code } of standard_byte_codes.sort((a, b) => <number>a.id - <number>b.id)) {


        while (++last_offset <= id) {
            if (default_block) {
                table_entries.push(default_block.instruction_sequence);
                max_instruction_byte_size = Math.max(max_instruction_byte_size, default_block.total_size);
            } else {
                table_entries.push([[InstructionType.fail]]);
                max_instruction_byte_size = Math.max(max_instruction_byte_size, 4);
            }
        }
        max_instruction_byte_size = Math.max(max_instruction_byte_size, code.byte_length);
        table_entries.push(code.byte_sequence);
    }

    let base_size = 12;

    const instruction_sequence: Instruction[] = [];

    if (default_block) {

        max_instruction_byte_size = Math.max(max_instruction_byte_size, default_block.total_size);

        table_entries.unshift(default_block.instruction_sequence);

    } else {
        table_entries.unshift([[InstructionType.fail]]);
    }

    const row_size = max_instruction_byte_size / 4;

    instruction_sequence.push(
        createTableInstruction(
            input_type,
            lexer_type,
            token_state,
            basis,
            number_of_rows,
            row_size,
            table_entries
        )
    );

    return {
        number_of_elements: number_of_rows,
        instruction_sequence,
        total_size: get8AlignedOffset(base_size + max_instruction_byte_size * (number_of_rows + 1))
    };
}

function buildHashTableBranchBlock(
    state_ast: BranchIRState,
    instructions: (IRPeek | IRAssert)[],
    attributes: StateAttrib,
    token_state: string,
    grammar: GrammarObject,
    token_ids_to_state: Map<string, string>,
    default_block: BlockData = null
): BlockData {


    let standard_instructions = instructions.filter(i => !i.ids.some(i => i == default_case_indicator));

    const input_type = instructions[0].mode;
    const lexer_type = instructions[0].type;

    let instruction_field_byte_size = 0;

    const standard_byte_codes = standard_instructions
        .map(({ instructions, type, ids }) => {

            const instr = createInstructionSequence(instructions, grammar, token_state, token_ids_to_state);

            //@ts-expect-error
            instr.pointer = instruction_field_byte_size / 4;

            instruction_field_byte_size += instr.byte_length;

            return instr;
        });

    const scanner_key_index_pairs = standard_instructions
        //@ts-expect-error
        .flatMap(({ ids }, instr_idx) => ids.map(id => [id, standard_byte_codes[instr_idx].pointer]))
        .sort(([a], [b]) => a - b);

    if (
        scanner_key_index_pairs.length > 512
        ||
        scanner_key_index_pairs.slice(-1)[0][0] > 2048
        ||
        (instruction_field_byte_size / 4) > 2048
    ) {
        return null;
    }

    const scan_field_length = scanner_key_index_pairs.length;

    const sequence_entries: Instruction[][] = [];

    for (const code of standard_byte_codes)
        sequence_entries.push(code.byte_sequence);

    let base_byte_size = 12;

    const instruction_sequence: Instruction[] = [];

    instruction_sequence.push(
        <Instruction>["scanner",
            input_type,
            lexer_type,
            token_state,
            scan_field_length,
            instruction_field_byte_size / 4,
            scanner_key_index_pairs,
            sequence_entries
        ]
    );


    if (default_block) {

        instruction_sequence.push(...default_block.instruction_sequence);

        return {
            number_of_elements: scanner_key_index_pairs.length,
            instruction_sequence,
            total_size: get8AlignedOffset(base_byte_size + default_block.total_size + instruction_field_byte_size + scan_field_length * 4)
        };
    }

    instruction_sequence.push([InstructionType.fail]);

    base_byte_size += 4;

    return {
        number_of_elements: scanner_key_index_pairs.length,
        instruction_sequence,
        total_size: get8AlignedOffset(base_byte_size + instruction_field_byte_size + scan_field_length * 4)
    };
}
function buildBasicInstructionBlock(
    state_ast: Resolved_IR_State,
    instructions: IR_Instruction[],
    token_state: string,
    grammar: GrammarObject,
    sym_map: Map<string, string>
): BlockData {

    let { byte_length, byte_sequence } = createInstructionSequence(instructions, grammar, token_state, sym_map);


    const instruction_sequence = [...byte_sequence];

    if (state_ast.fail) {

        byte_length += 4;

        instruction_sequence
            .unshift(["set fail", <string>state_ast.fail.id]);
    }

    return { number_of_elements: 1, instruction_sequence: instruction_sequence, total_size: byte_length };
}

function getPeekConsumptionFlags(attributes: StateAttrib, state_ast: Resolved_IR_State) {

    const use_peek_for_assert_or_consume = (!(attributes & (StateAttrib.MULTI_BRANCH)))
        &&
        !(attributes & (StateAttrib.PEEK_BRANCH))
        &&
        (state_ast.instructions[0].type == InstructionType.assert);


    const consume_peek = (!(attributes & (StateAttrib.MULTI_BRANCH)))
        &&
        (!(attributes & (StateAttrib.ASSERT_BRANCH)))
        &&
        state_ast.instructions[0].type == InstructionType.consume;

    return { use_peek_for_assert_or_consume, consume_peek };
}

