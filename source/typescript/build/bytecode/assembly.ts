/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { numeric_sort } from '../../utilities/array_globals.js';
import { default_array } from '../../grammar/nodes/default_symbols.js';
import {
    convert_symbol_to_string,
} from '../../grammar/nodes/symbol.js';
import { GrammarObject, Instruction, InstructionType, ProductionSymbol, ProductionImportSymbol, StateMap, IRStateData, } from '../../types/index.js';
import { getStateName } from "./get_state_name.js";
;
export function address(count: { c: number; }) {
    return ("000000000" + count.c.toString(16)).slice(-6);
}

export function addressHTML(count: { c: number; }) {
    const val = ("000000000" + count.c.toString(16)).slice(-6);
    return `<span class="address" id="${count.c.toString(16)}">${val}</span>`;
}

export function dis_address(count: number) {
    return ("000000000" + ((count & 0xFFFFFF) * 4).toString(16)).slice(-6);
}


function getCharacterValueHTML(
    grammar: GrammarObject | null,
    input_type: "BYTE" | "CODEPOINT" | "PRODUCTION" | "TOKEN" | "CLASS",
    value: number
) {
    if (!grammar) {
        switch (input_type) {
            case "BYTE":
            case "CODEPOINT":
                return ` "${String.fromCodePoint(value)}"`;
            case "CLASS":
                return ` "${convert_symbol_to_string(<any>default_array[value])}"`;
            case "TOKEN":
                return "";
            case "PRODUCTION":
                return "";
        }
    }
    switch (input_type) {
        case "BYTE":
        case "CODEPOINT":
            return `<code class="codepoint">${String.fromCodePoint(value)}</code>`;
        case "CLASS":
            return `<code class="class">${convert_symbol_to_string(<any>default_array[value])}</code>`;
        case "TOKEN":
            return `<code class="token">${convert_symbol_to_string(<any>grammar.meta.all_symbols.by_id.get(value))}</code>`;
        case "PRODUCTION":
            return `<a class="production" href="#${grammar.productions[value]?.name ?? ""}">${grammar.productions[value]?.name ?? ""}</a>`;
    }
}


function getCharacterValue(
    grammar: GrammarObject | null,
    input_type: "BYTE" | "CODEPOINT" | "PRODUCTION" | "TOKEN" | "CLASS",
    value: number
) {
    if (!grammar) {
        switch (input_type) {
            case "BYTE":
            case "CODEPOINT":
                return ` "${String.fromCodePoint(value)}"`;
            case "CLASS":
                return ` "${convert_symbol_to_string(<any>default_array[value])}"`;
            case "TOKEN":
                return "";
            case "PRODUCTION":
                return "";
        }
    }
    switch (input_type) {
        case "BYTE":
        case "CODEPOINT":
            return ` "${String.fromCodePoint(value)}"`;
        case "CLASS":
            return ` "${convert_symbol_to_string(<any>default_array[value])}"`;
        case "TOKEN":
            return ` "${convert_symbol_to_string(<any>grammar.meta.all_symbols.by_id.get(value))}"`;
        case "PRODUCTION":
            return ` "${grammar.productions[value]?.name ?? ""}"`;
    }
}

export function renderInstructionSequences(
    grammar: GrammarObject,
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

            case InstructionType.token_consume_assign: {
                buffer.push(`${address(count)}:                 TKCS ${instruction[1]}`);
                count.c += 4;
            } break;

            case InstructionType.fork_to: {
                const [, length, gotos] = instruction;
                buffer.push(`${address(count)}:                 FORK ${gotos.map(i => `%${getStateName(i)}`).join(" | ")}`);
                count.c += 4 + gotos.length * 4;
            } break;

            case InstructionType.assert_consume: {
                const [, mode, val] = instruction;
                buffer.push(`${address(count)}:                 ASCS MODE:${mode} VAL:${val} ${getCharacterValue(grammar, mode, val)}`);
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

                const t_id = `JUMP_TABLE_${address(count)}`;
                let i = 0;

                count.c += 12;

                const temp_buffer = [];

                for (const table_entry of table_entries.slice(0, 1)) {
                    temp_buffer.push(
                        `--------------------------------------------------- START ${t_id}::DEFAULT`,
                        ...renderInstructionSequences(
                            grammar,
                            table_entry,
                            state_map,
                            count,
                            row_size * 4
                        ),
                        `--------------------------------------------------- END   ${t_id}::DEFAULT\n`,
                    );
                }

                for (const table_entry of table_entries.slice(1)) {

                    const value = i++ + token_basis;

                    const character = getCharacterValue(grammar, input_type, value);

                    temp_buffer.push(
                        `--------------------------------------------------- START ${t_id}::${value}${character}`,
                        ...renderInstructionSequences(
                            grammar,
                            table_entry,
                            state_map,
                            count,
                            row_size * 4
                        ),
                        `--------------------------------------------------- END   ${t_id}::${value}\n`);
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

                const t_id = `HASH_TABLE_${address(count)}`;
                let i = 0;

                count.c += 12 + 4 * scanner_key_index_pairs.length;

                const temp_buffer = [];

                for (const [val, offset] of scanner_key_index_pairs) {
                    const value = getCharacterValue(grammar, input_type, val);
                    const addrs = address({ c: offset * 4 + count.c });
                    temp_buffer.push(`        #${i++} ${val}[ ${value} ] \n            => ${t_id}::${addrs}`);
                }

                for (const sequence of sequence_entries) {
                    const value = address(count);
                    temp_buffer.push(
                        `--------------------------------------------------- START ${t_id}::${value}`,
                        ...renderInstructionSequences(
                            grammar,
                            sequence,
                            state_map,
                            count
                        ),
                        `--------------------------------------------------- END   ${t_id}::${value}\n`,
                    );
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

    //buffer.unshift(`####### ${count.c - start} bytes #######`);

    return buffer;
}


export function getStateNameLink(
    name_candidate: ProductionSymbol | ProductionImportSymbol | string
): string {
    const name = getStateName(name_candidate);

    return `<a class="goto" href="#${name}">${name}</a>`;
}

export function renderHTMLState(
    grammar: GrammarObject,
    state_data: IRStateData,
    state_map: StateMap,
    count: { c: number; } = { c: 0 },
    default_block_size: number = 0
) {
    const string = [
        `<div id="${state_data.ir_state_ast.id}" class="state">`,
        `<div class="state-header"> <h2>${state_data.ir_state_ast.id.toString().replace(/\_+/g, " ").toUpperCase()} </h2>`,
        `Address: <b class="address">${address({ c: ((state_data.pointer & 0xFFFFFF) * 4) })}</b> | Bytesize: ${state_data.block.total_size}</div>`,
        `<div class="ir"><h3>Intermediate Representation</h3><pre><code>${state_data.string}</code></pre></div>`,
        `<h3>Assembly</h3>`,
        `<div class="instructions">`,
        ...renderHTMLInstructionSequences(
            grammar,
            state_data.block.instruction_sequence,
            state_map,
            count,
            state_data.block.total_size
        ),
        `</div>`,
        `</div>`
    ].join("\n");

    return string;
}

export function renderHTMLInstructionSequences(
    grammar: GrammarObject,
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
                buffer.push(`<p class="instruction-line">${addressHTML(count)}<span class="instruction-label">END_</span></p>`);
                count.c += 4;
                break;

            case InstructionType.consume: {
                buffer.push(`<p class="instruction-line">${addressHTML(count)}<span class="instruction-label">EAT_</span></p>`);
                count.c += 4;
            } break;

            case InstructionType.empty_consume: {
                buffer.push(`<p class="instruction-line">${addressHTML(count)}<span class="instruction-label">EATN</span></p>`);
                count.c += 4;
            } break;

            case InstructionType.goto: {
                buffer.push(`<p class="instruction-line">${addressHTML(count)}<span class="instruction-label">GOTO</span> ${getStateNameLink(instruction[1])}</p>`);
                count.c += 4;
            } break;

            case InstructionType.set_prod: {
                buffer.push(`<p class="instruction-line">${addressHTML(count)}<span class="instruction-label">PROD</span> Production ID: ${instruction[1]}</p>`);
                count.c += 4;
            } break;

            case InstructionType.reduce: {
                buffer.push(`<p class="instruction-line">${addressHTML(count)}<span class="instruction-label">RED_</span> Length: ${instruction[1]} Body: ${instruction[2]}</p>`);
                count.c += 4;
            } break;

            case InstructionType.token_length: {
                buffer.push(`<p class="instruction-line">${addressHTML(count)}<span class="instruction-label">TKLN</span> Length: ${instruction[1]}</p>`);
                count.c += 4;
            } break;

            case InstructionType.token_assign: {
                buffer.push(`<p class="instruction-line">${addressHTML(count)}<span class="instruction-label">TKID</span> ID: ${instruction[1]}</p>`);
                count.c += 4;
            } break;

            case InstructionType.token_consume_assign: {
                buffer.push(`<p class="instruction-line">${addressHTML(count)}<span class="instruction-label">TKCS</span> ${instruction[1]}</p>`);
                count.c += 4;
            } break;

            case InstructionType.fork_to: {
                const [, length, gotos] = instruction;
                buffer.push(`<p class="instruction-line">${addressHTML(count)}<span class="instruction-label">FORK</span> ${gotos.map(i => `${getStateNameLink(i)}`).join(" | ")}</p>`);
                count.c += 4 + gotos.length * 4;
            } break;

            case InstructionType.assert_consume: {
                const [, mode, val] = instruction;
                buffer.push(`<p class="instruction-line">${addressHTML(count)}<span class="instruction-label">ASCS</span> Mode: ${mode} Value: ${val} ${getCharacterValue(grammar, mode, val)}</p>`);
                count.c += 4;
            } break;

            case InstructionType.scan_back_until: {
                const [, token_state, length, ids] = instruction;
                buffer.push(`<p class="instruction-line">${addressHTML(count)}<span class="instruction-label">SCNF</span> %${token_state}% ${ids.map(i => `%${i}`).join(" | ")}</p>`);
                count.c += 8 + ids.length * 4;
            } break;

            case InstructionType.scan_until: {
                const [, token_state, length, ids] = instruction;
                buffer.push(`<p class="instruction-line">${addressHTML(count)}<span class="instruction-label">SCNB</span> %${token_state}% ${ids.map(i => `%${i}`).join(" | ")}</p>`);
                count.c += 8 + ids.length * 4;
            } break;

            case "table": {

                const [, input_type, lexer_type, token_state = "", token_basis, number_of_rows, row_size, table_entries
                ] = instruction;

                buffer.push(`<div class="jumptable">
<p class="instruction-line">${addressHTML(count)}:                 <span class="instruction-label">JMPT</span>  </p>
<table class="table-data">
    <tr><td>INPUT</td><td>${input_type}</td></tr>
    <tr><td>LEX</td><td>${lexer_type}</td></tr>
    <tr><td>SCANNER</td><td><a href="#${token_state}">${token_state}</a></td></tr>
    <tr><td>BASIS</td><td>${token_basis}</td></tr>
</table>`);

                const t_id = `JMPT_${address(count)}`;
                let i = 0;

                count.c += 12;

                const temp_buffer = [];

                for (const table_entry of table_entries.slice(0, 1)) {
                    temp_buffer.push(
                        `<div class="table-branch">
                        <h5>${t_id} - DEFAULT</h5><div class="branch-internals">`,
                        ...renderHTMLInstructionSequences(
                            grammar,
                            table_entry,
                            state_map,
                            count,
                            row_size * 4
                        ),
                        `</div></div>`,
                    );
                }

                for (const table_entry of table_entries.slice(1)) {

                    const value = i++ + token_basis;

                    const character = getCharacterValueHTML(grammar, input_type, value);

                    temp_buffer.push(
                        `<div class="table-branch">
                        <h5>${t_id} - ${value}<span class="character-position">${character}</span></h5>
                        <div class="branch-internals">`,
                        ...renderHTMLInstructionSequences(
                            grammar,
                            table_entry,
                            state_map,
                            count,
                            row_size * 4
                        ),
                        `</div></div>`);
                };

                buffer.push(...temp_buffer, `</div>`);

            } break;

            case "scanner": {

                const
                    [, input_type, lexer_type, token_state, scan_field_length, instruction_field_size, scanner_key_index_pairs, sequence_entries
                    ] = instruction;
                const mod_base = Math.floor(Math.log2(scanner_key_index_pairs.length));
                const mod_mask = (1 << mod_base) - 1;

                buffer.push(`<div class="hashtable">
<p class="instruction-line">${addressHTML(count)}:                 <span class="instruction-label">HASH</span>  </p>
<table class="table-data">
    <tr><td>INPUT</td><td>${input_type}</td></tr>
    <tr><td>LEX</td><td>${lexer_type}</td></tr>
    <tr><td>SCANNER</td><td><a href="#${token_state}">${token_state}</a></td></tr>
    <tr><td>DENOMINATOR</td><td>${mod_mask}</td></tr>
</table>`);

                const t_id = `HASH_${address(count)}`;
                let i = 0;

                count.c += 12 + 4 * scanner_key_index_pairs.length;

                const temp_buffer = ["<table class=\"hash-pointers\"><tbody>"];

                for (const [val, offset] of scanner_key_index_pairs) {
                    const value = getCharacterValueHTML(grammar, input_type, val);
                    const addrs = address({ c: offset * 4 + count.c });
                    temp_buffer.push(`<tr><td>${val}</td><td>${value}</td><td>=></td><td><a href="#${addrs}">${t_id}::${addrs}</a></td></tr>`);
                }

                temp_buffer.push("</tbody></table>");

                for (const sequence of sequence_entries) {
                    const value = address(count);
                    temp_buffer.push(
                        `<div id="${value}" class="table-branch">
                        <h5>${t_id} - ${value}</h5><div class="branch-internals">`,
                        ...renderHTMLInstructionSequences(
                            grammar,
                            sequence,
                            state_map,
                            count
                        ),
                        `</div> </div>`,
                    );
                };

                buffer.push(...temp_buffer, "</div>");
            } break;

            case "set fail": {
                buffer.push(`<p class="instruction-line">${addressHTML(count)}<span class="instruction-label">SETF</span> ${instruction[1]}</p>`);
                count.c += 4;
            } break;

            case InstructionType.repeat: {
                buffer.push(`<p class="instruction-line">${addressHTML(count)}<span class="instruction-label">REPT</span></p>`);
                count.c += 4;
            } break;

            case InstructionType.fail:
                buffer.push(`<p class="instruction-line">${addressHTML(count)}<span class="instruction-label">FAIL</span></p>`);
                count.c += 4;
                break;

            case InstructionType.fall_through:
                buffer.push(`<p class="instruction-line">${addressHTML(count)}<span class="instruction-label">FALL</span></p>`);
                count.c += 4;

        }
    }

    while ((count.c - start) < default_block_size) {
        buffer.push(`<p class="instruction-line">${addressHTML(count)}<span class="instruction-label">NOOP</span></p>`);
        count.c += 4;
    }

    //buffer.unshift(`####### ${count.c - start} bytes #######`);

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
                if (instruction & 0x8000000) {
                    if (instruction & 0x1000000)
                        buffer.push(`${dis_address(ip - 1)}:                 TKCS ${length}`);
                    else
                        buffer.push(`${dis_address(ip - 1)}:                 TKID ${length}`);
                } else
                    buffer.push(`${dis_address(ip - 1)}:                 TKLN ${length}`);
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

                const input_type = ["PRODUCTION", "TOKEN", "CLASS", "CODEPOINT", "BYTE"][((instruction >> 22) & 0x7)];

                const lexer_type = ["PEEK", "ASSERT"][((instruction >> 26) & 0x3) - 1];

                let token_state = bytecode[ip];

                let table_data = bytecode[ip + 1];

                let token_basis = instruction & 0xFFFF;

                buffer.push(`
${dis_address(ip - 1)}:                  JMPT  

            INPUT:    ${input_type} 
            LEX:      ${lexer_type} 
            SCANNER:  %${dis_address(token_state)}% 
            BASIS:    ${token_basis} 
========================================================\n`);

                const t_id = `JUMP_TABLE_${dis_address(ip - 1)}`;

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

                buffer.push(
                    `--------------------------------------------------- START ${t_id}::DEFAULT`,
                    string,
                    `--------------------------------------------------- END   ${t_id}::DEFAULT\n`);
                ip += row_size;

                for (let i = 0; i < number_of_rows; i++) {
                    const address = i + token_basis;
                    const value = getCharacterValue(null, input_type, address);

                    ({ string } = disassemble(
                        bytecode,
                        ip,
                        count,
                    ));

                    buffer.push(
                        `--------------------------------------------------- START ${t_id}::${address}${value}`,
                        string,
                        `--------------------------------------------------- END   ${t_id}::${address}\n`);

                    ip += row_size;
                };

                buffer.push(...temp_buffer);
            } break outer;

            case 0xA0000000: { // hash_jump

                const input_type = ["PRODUCTION", "TOKEN", "CLASS", "CODEPOINT", "BYTE"][((instruction >> 22) & 0x7)];

                const lexer_type = ["PEEK", "ASSERT"][((instruction >> 26) & 0x3) - 1];

                let token_state = bytecode[ip];

                let table_data = bytecode[ip + 1];

                const mod = (1 << ((table_data >>> 16) & 0xFFFF)) - 1;

                buffer.push(`
${dis_address(ip - 1)}:                   HASH  

            INPUT:    ${input_type} 
            LEX:      ${lexer_type} 
            SCANNER:  %${dis_address(token_state)}% 
            DENOM:    ${mod} 
========================================================\n`);

                const t_id = `HASH_TABLE_${dis_address(ip - 1)}`;

                ip += 2;

                const table_size = (table_data) & 0xFFFF;
                const hash_table_start = ip;
                const instruction_field_start = hash_table_start + table_size;
                const instruction_field_size = instruction & 0xFFFF;

                ip = instruction_field_start;

                let string = "";

                let fields = [];

                for (let i = 0; i < table_size; i++) {
                    const cell = bytecode[hash_table_start + i];
                    const val = cell & 0x7FF;
                    const ip = ((cell >> 11) & 0x7FF) + instruction_field_start;
                    const addrs = dis_address(ip);
                    fields.push(ip);
                    const value = getCharacterValue(null, <any>input_type, val);
                    buffer.push(`        #${i} ${val}[ ${value} ] \n            => ${t_id}::${addrs}`);
                }

                fields = fields.sort(numeric_sort).setFilter();

                for (const ip of fields) {

                    const addrs = dis_address(ip);
                    ({ string } = disassemble(
                        bytecode,
                        ip,
                        count,
                    ));


                    buffer.push(
                        `--------------------------------------------------- START ${t_id}::${addrs}`,
                        string,
                        `--------------------------------------------------- END   ${t_id}::${addrs}\n`
                    );
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

    while (ip < bytecode.length && 0 == bytecode[ip]) {
        buffer.push(`${dis_address(ip)}:                 NOOP`);
        ip++;
    }

    return { string: buffer.join("\n"), ip };
}
