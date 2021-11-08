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

export function dis_address(count: number) {
    return ("000000000" + ((count & 0xFFFFFF) * 4).toString(16)).slice(-6);
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


export function disassemble(
    bytecode: Uint32Array,
    ip: number,
    count: { c: number; } = { c: ip & 0xFFFFFF },
): { string: string, ip: number; } {
    const state_index_mask = (1 << 24) - 1;
    let buffer = [];

    ip = ip & state_index_mask;


    let start = count.c;

    outer: while (true) {
        const instruction = bytecode[ip++] >>> 0;

        switch ((instruction & 0xF0000000) >>> 0) {
            case 0x00000000: { // pass
                buffer.push(`${dis_address(ip - 1)}:                 END_`);
            } break outer;
            case 0x10000000: { // consume
                buffer.push(`${dis_address(ip - 1)}:                 EAT_`);
            } break;

            case 0x20000000: { // goto
                buffer.push(`${dis_address(ip - 1)}:                 GOTO %${dis_address(bytecode[(ip - 1)])}`);
            } break;

            case 0x30000000: { // set_production
                buffer.push(`${dis_address(ip - 1)}:                 PROD ${instruction & 0xFFFFFFF}`);
            } break;

            case 0x40000000: { // reduce
                let body_id = (instruction) & 0xFFFF;
                let length = ((instruction >> 16) & 0xFFF);
                buffer.push(`${dis_address(ip - 1)}:                 RED_ LEN:${length} BDY:${body_id}`);
            } break;

            case 0x50000000: { // set_token
                const length = instruction & 0xFFFFFF;
                if (instruction & 0x80000000)
                    buffer.push(`${dis_address(ip - 1)}:                 TKLN ${length}`);
                else
                    buffer.push(`${dis_address(ip - 1)}:                 TKID ${length}`);
            } break;

            case 0x60000000: { // fork
                let length = (instruction & 0xFFFFFFF);
                const gotos = Array.from(bytecode.slice(ip, ip + length));
                ip += length;
                buffer.push(`${dis_address(ip - 1)}:                 FORK ${gotos.map(i => `%${dis_address(i)}`).join(" | ")}`);
            } break;

            case 0x70000000: { // scan_to
                buffer.push(`${dis_address(ip - 1)}:                 SCN_`);
            } break;

            case 0x80000000: { // noop
                buffer.push(`${dis_address(ip - 1)}:                 NOOP`);
            } break;

            case 0x90000000: { // index_jump
                let token_state = bytecode[ip];

                let table_data = bytecode[ip + 1];

                let token_basis = instruction & 0xFFFF;

                const input_type = ((instruction >> 22) & 0x7);

                const lexer_type = ((instruction >> 26) & 0x3);

                buffer.push(`
${dis_address(ip - 1)}:                  JMPT  

            INPUT:    ${["PRODUCTION", "TOKEN", "CLASS", "CODEPOINT", "BYTE"][input_type]} 
            LEX:      ${["PEEK", "ASSERT"][lexer_type - 1]} 
            SCANNER:  %${dis_address(token_state)}% 
            BASIS:    ${token_basis} 
========================================================\n`);

                const t_id = `JUMP_TABLE${dis_address(ip - 1)}`;

                ip += 2;
                let string = "";
                let number_of_rows = table_data >> 16;
                let row_size = table_data & 0xFFFF;

                const temp_buffer = [];

                ({ string } = disassemble(
                    bytecode,
                    ip,
                    count,
                ));

                buffer.push(`--------------------------------------------------- START ${t_id}::DEFAULT`, string, `--------------------------------------------------- END   ${t_id}::DEFAULT\n`);
                ip += row_size;

                for (let i = 0; i < number_of_rows; i++) {
                    const address = i + token_basis;

                    ({ string } = disassemble(
                        bytecode,
                        ip,
                        count,
                    ));

                    buffer.push(`--------------------------------------------------- START ${t_id}::${address}`, string, `--------------------------------------------------- END   ${t_id}::${address}\n`);

                    ip += row_size;
                };

                buffer.push(...temp_buffer);
            } break outer;

            case 0xA0000000: { // hash_jump

                const input_type = ((instruction >> 22) & 0x7);

                const lexer_type = ((instruction >> 26) & 0x3);

                let token_state = bytecode[ip];

                let table_data = bytecode[ip + 1];

                const mod = (1 << ((table_data >>> 16) & 0xFFFF)) - 1;

                buffer.push(`
${dis_address(ip - 1)}:                   HASH  

            INPUT:    ${["PRODUCTION", "TOKEN", "CLASS", "CODEPOINT", "BYTE"][input_type]} 
            LEX:      ${["PEEK", "ASSERT"][lexer_type - 1]} 
            SCANNER:  %${dis_address(token_state)}% 
            DENOM:    ${mod} 
========================================================\n`);

                const t_id = `HASH_TABLE${dis_address(ip - 1)}`;
                let i = 0; ip += 2;

                const table_size = (table_data) & 0xFFFF;
                const hash_table_start = ip;
                const instruction_field_start = hash_table_start + table_size;
                const instruction_field_size = instruction & 0xFFFF;
                const temp_buffer = [];

                ip = instruction_field_start;

                let string = "";

                for (let i = 0; i < table_size; i++) {
                    const cell = bytecode[hash_table_start + i];
                    const value = cell & 0x7FF;

                    const ip = ((cell >> 11) & 0x7FF) + instruction_field_start;

                    ({ string } = disassemble(
                        bytecode,
                        ip,
                        count,
                    ));

                    buffer.push(`--------------------------------------------------- START ${t_id}::${value}`, string, `--------------------------------------------------- END   ${t_id}::${value}\n`);
                }

                ip = instruction_field_start + instruction_field_size;

            } break;

            case 0xB0000000: { // push_fail_state
                buffer.push(`${dis_address(ip)}:                 SETF ${dis_address(instruction)}`);
            } break;

            case 0xC0000000: { // repeat
                buffer.push(`${dis_address(ip - 1)}:                 REPT`);
            } break;

            case 0xD0000000: { // noop
                buffer.push(`${dis_address(ip - 1)}:                 NOOP`);
            } break;

            case 0xE0000000: { // assert_consume
                const mode = instruction & 0x0F000000;
                let val = instruction & 0x00FFFFFF;
                buffer.push(`${dis_address(ip - 1)}:                 ASCS MODE:${mode} VAL:${val}`);
            } break;

            case 0xF0000000: { // advanced_return
                buffer.push(`${dis_address(ip - 1)}:                 FAIL`);

            } break outer;
        }

    }

    return { string: buffer.join("\n"), ip };
}
