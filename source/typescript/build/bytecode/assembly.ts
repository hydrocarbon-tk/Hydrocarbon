/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Instruction, InstructionType, StateMap } from '../../types/index.js';;
import { getStateName } from "./get_state_name.js";
export function address(count: { c: number; }) {
    return ("000000000" + count.c.toString(16)).slice(-6);
}

export function renderInstructionSequences(
    instruction_sections: Instruction[],
    state_map: StateMap,
    count: { c: number; } = { c: 0 },
    default_block_size: number = 0
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

                const [, input_type, lexer_type, token_state = "", token_basis, number_of_rows, row_size, table_entries
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
                    [, input_type, lexer_type, token_state, scan_field_length, instruction_field_size, scanner_key_index_pairs, sequence_entries
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
