/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import {
    convert_symbol_to_string,
    default_array,
    GrammarObject,
    numeric_sort,
    ReverseStateLookupMap,
} from '@hctoolkit/common';


export function addressHTML(count: number) {
    const val = ("000000000" + ((count & 0xFFFFFF) * 4).toString(16)).slice(-6);
    return `<span class="address" id="${count.toString(16)}">${val}</span>`;
}

export function dis_address(count: number) {
    return ("000000000" + ((count & 0xFFFFFF) * 4).toString(16)).slice(-6);
}

function getCharacterValueHTML(
    grammar: GrammarObject | undefined,
    input_type: "BYTE" | "CODEPOINT" | "PRODUCTION" | "TOKEN" | "CLASS" | "UNDEFINED",
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

        return "";

    }
    switch (input_type) {
        case "BYTE":
        case "CODEPOINT":
            return `<code class="codepoint">${String.fromCodePoint(value)}</code>`;
        case "CLASS":
            return `<code class="class">${convert_symbol_to_string(<any>default_array[value])}</code>`;
        case "TOKEN":
            return `<code class="token">${convert_symbol_to_string(<any>grammar.meta?.all_symbols?.by_id.get(value))}</code>`;
        case "PRODUCTION":
            return `<a class="production" href="#${grammar.productions[value]?.name ?? ""}">${grammar.productions[value]?.name ?? ""}</a>`;
    }
}

export function getStateNameLink(
    name_candidate: number,
    lookup: ReverseStateLookupMap
): string {

    const state = lookup.get(0xFFFFFF & name_candidate);

    if (!state)
        return `<a class="goto" href="#${((0xFFFFFF & name_candidate) * 4).toString(16)}">${dis_address(name_candidate)}</a>`;

    const name = state.name;

    return `<a class="goto" href="#${name}">${name}</a>`;
}

export function getScannerNameLink(
    name_candidate: number,
    lookup: ReverseStateLookupMap
): string {

    const state = lookup.get(0xFFFFFF & name_candidate);

    if (!state) {
        return "";
    }

    const name = state.name;

    return `<a class="scanner" href="#${name}">${name}</a>`;
}


export function renderHTMLStateFromBytecode(
    ip: number,
    bytecode: Uint32Array,
    states_lookup: ReverseStateLookupMap,
    grammar?: GrammarObject,
) {
    const state = states_lookup.get(0xFFFFFF & ip);

    if (state) {

        let { ip: pointer, string: dis_string } = disassemble(
            ip,
            bytecode,
            states_lookup,
            grammar
        );
        const string = [
            `<div id="${state.name}" class="state">`,
            `<div class="state-header"> <h2>${state.name.replace(/\_+/g, " ").toUpperCase()} </h2>`,
            `Address: <b class="address">${dis_address(state.pointer)}</b> | Bytesize: ${(pointer - ip) << 2}</div>`,
            `<div class="ir"><h3>Intermediate Representation</h3><pre><code>${state.string}</code></pre></div>`,
            `<h3>Bytecode</h3>`,
            `<div class="instructions">`,
            dis_string,
            `</div>`,
            `</div>`
        ].join("\n");
        return string;
    }

    return "";

}


export function disassemble(
    ip: number,
    bytecode: Uint32Array,
    states_lookup: ReverseStateLookupMap,
    grammar?: GrammarObject
): { string: string, ip: number; } {
    const state_index_mask = (1 << 24) - 1;
    let buffer = [];

    ip = ip & state_index_mask;

    outer: while (true) {
        const instruction = bytecode[ip++] >>> 0;

        switch ((instruction & 0xF0000000) >>> 0) {
            case 0x00000000:  // pass
                buffer.push(`<p class="instruction-line">${addressHTML(ip - 1)}<span class="instruction-label">END_</span></p>`);
                break outer;

            case 0x10000000: { // consume
                if (instruction & 0x8000000) {
                    buffer.push(`<p class="instruction-line">${addressHTML(ip - 1)}<span class="instruction-label">EATN</span></p>`);
                } else {
                    buffer.push(`<p class="instruction-line">${addressHTML(ip - 1)}<span class="instruction-label">EAT_</span></p>`);
                }
            } break;

            case 0x20000000: { // goto
                buffer.push(`<p class="instruction-line">${addressHTML(ip - 1)}<span class="instruction-label">GOTO</span> ${getStateNameLink(bytecode[(ip - 1)], states_lookup)}</p>`);
            } break;

            case 0x30000000: { // set_production
                buffer.push(`<p class="instruction-line">${addressHTML(ip - 1)}<span class="instruction-label">PROD</span> Production ID: ${instruction & 0xFFFFFFF}</p>`);
            } break;

            case 0x40000000: { // reduce
                let body_id = (instruction) & 0xFFFF;
                let length = ((instruction >> 16) & 0xFFF);
                buffer.push(`<p class="instruction-line">${addressHTML(ip - 1)}<span class="instruction-label">RED_</span> Length: ${length} Body: ${body_id}</p>`);
            } break;

            case 0x50000000: { // set_token
                const length = instruction & 0xFFFFFF;
                if (instruction & 0x8000000) {
                    if (instruction & 0x1000000)
                        buffer.push(`<p class="instruction-line">${addressHTML(ip - 1)}<span class="instruction-label">TKCS</span> ${length}</p>`);
                    else
                        buffer.push(`<p class="instruction-line">${addressHTML(ip - 1)}<span class="instruction-label">TKID</span> ID: ${length}</p>`);
                } else
                    buffer.push(`<p class="instruction-line">${addressHTML(ip - 1)}<span class="instruction-label">TKLN</span> Length: ${length}</p>`);
            } break;

            case 0x60000000: { // fork
                let length = (instruction & 0xFFFFFFF);
                const gotos = Array.from(bytecode.slice(ip, ip + length));
                ip += length;
                buffer.push(`<p class="instruction-line">${addressHTML(ip - 1)}<span class="instruction-label">FORK</span> ${gotos.map(i => `${getStateNameLink(i, states_lookup)}`).join(" | ")}</p>`);
            } break;

            case 0x70000000: { // scan_to

                const token_state: number = 0;
                const ids: number[] = [];

                if (true)
                    buffer.push(`<p class="instruction-line">${addressHTML(ip - 1)}<span class="instruction-label">SCNB</span> %${token_state}% ${ids.map(i => `%${i}`).join(" | ")}</p>`);
                else
                    buffer.push(`<p class="instruction-line">${addressHTML(ip - 1)}<span class="instruction-label">SCNB</span> %${token_state}% ${ids.map(i => `%${i}`).join(" | ")}</p>`);
            } break;

            case 0x80000000: { // noop
                buffer.push(`<p class="instruction-line">${addressHTML(ip - 1)}<span class="instruction-label">NOOP</span></p>`);
            } break;

            case 0x90000000: { // index_jump

                const input_type = getInputTypeFromNumber(instruction >> 22);

                const lexer_type = ["PEEK", "ASSERT"][((instruction >> 26) & 0x3) - 1];

                let token_state = bytecode[ip];

                let table_data = bytecode[ip + 1];

                let token_basis = instruction & 0xFFFF;

                buffer.push(`<div class="jumptable">
<p class="instruction-line">${addressHTML(ip - 1)}:                 <span class="instruction-label">JMPT</span>  </p>
<table class="table-data">
    <tr><td>INPUT</td><td>${input_type}</td></tr>
    <tr><td>LEX</td><td>${lexer_type}</td></tr>
    <tr><td>SCANNER</td><td>${getScannerNameLink(token_state, states_lookup)}</td></tr>
    <tr><td>BASIS</td><td>${token_basis}</td></tr>
</table>`);

                const t_id = `JUMP_TABLE_${dis_address(ip - 1)}`;

                ip += 2;
                let string = "";
                let number_of_rows = table_data >> 16;
                let row_size = table_data & 0xFFFF;

                const temp_buffer = [];

                ({ string } = disassemble(
                    ip,
                    bytecode,
                    states_lookup,
                    grammar
                ));

                temp_buffer.push(
                    `<div class="table-branch">
                    <h5>${t_id} - DEFAULT</h5><div class="branch-internals">`,
                    string,
                    `</div></div>`,
                );

                ip += row_size;

                for (let i = 0; i < number_of_rows; i++) {

                    const address = i + token_basis;

                    const character = getCharacterValueHTML(grammar, input_type, address);

                    temp_buffer.push(
                        `<div class="table-branch">
                        <h5>${t_id} - ${address}<span class="character-position">${character}</span></h5>
                        <div class="branch-internals">`,
                        (disassemble(
                            ip,
                            bytecode,
                            states_lookup,
                            grammar
                        ).string),
                        `</div></div>`);

                    ip += row_size;
                };

                buffer.push(...temp_buffer, `</div>`);
            } break outer;

            case 0xA0000000: { // hash_jump

                const input_type = getInputTypeFromNumber(instruction >> 22);

                const lexer_type = ["PEEK", "ASSERT"][((instruction >> 26) & 0x3) - 1];

                let token_state = bytecode[ip];

                let table_data = bytecode[ip + 1];

                const mod_mask = (1 << ((table_data >>> 16) & 0xFFFF)) - 1;

                buffer.push(`<div class="hashtable">
<p class="instruction-line">${addressHTML(ip - 1)}:                 <span class="instruction-label">HASH</span>  </p>
<table class="table-data">
    <tr><td>INPUT</td><td>${input_type}</td></tr>
    <tr><td>LEX</td><td>${lexer_type}</td></tr>
    <tr><td>SCANNER</td><td>${getScannerNameLink(token_state, states_lookup)}</td></tr>
    <tr><td>DENOMINATOR</td><td>${mod_mask}</td></tr>
</table>`);

                const t_id = `HASH_TABLE_${dis_address(ip - 1)}`;

                ip += 2;

                const table_size = (table_data) & 0xFFFF;
                const hash_table_start = ip;
                const instruction_field_start = hash_table_start + table_size;
                const instruction_field_size = instruction & 0xFFFF;

                ip = instruction_field_start;

                let fields = [];

                for (let i = 0; i < table_size; i++) {
                    const cell = bytecode[hash_table_start + i];
                    const val = cell & 0x7FF;
                    const ip = ((cell >> 11) & 0x7FF) + instruction_field_start;
                    const addrs = dis_address(ip);
                    fields.push(ip);
                    const value = getCharacterValueHTML(undefined, <any>input_type, val);
                    buffer.push(`<tr><td>${val}</td><td>${value}</td><td>=></td><td><a href="#${addrs}">${t_id}::${addrs}</a></td></tr>`);
                }

                fields = fields.sort(numeric_sort).setFilter();

                for (const ip of fields) {

                    const value = dis_address(ip);

                    buffer.push(
                        `<div id="${value}" class="table-branch">
                        <h5>${t_id} - ${value}</h5><div class="branch-internals">`,
                        (disassemble(
                            ip,
                            bytecode,
                            states_lookup,
                            grammar
                        ).string),
                        `</div> </div>`,
                    );
                }

                ip = instruction_field_start + instruction_field_size;

            } break;

            case 0xB0000000: { // push_fail_state
                buffer.push(`<p class="instruction-line">${addressHTML(ip - 1)}<span class="instruction-label">SETF</span> ${getStateNameLink(instruction, states_lookup)}</p>`);
            } break;

            case 0xC0000000: { // repeat
                buffer.push(`<p class="instruction-line">${addressHTML(ip - 1)}<span class="instruction-label">REPT</span></p>`);
            } break;

            case 0xD0000000: { // noop
                buffer.push(`<p class="instruction-line">${addressHTML(ip - 1)}<span class="instruction-label">NOOP</span></p>`);
            } break;

            case 0xE0000000: { // assert_consume
                const mode = instruction & 0x0F000000;
                let val = instruction & 0x00FFFFFF;
                buffer.push(`<p class="instruction-line">${addressHTML(ip - 1)}<span class="instruction-label">TKCS</span> ASCS MODE:${mode} VAL:${val}</p>`);
            } break;

            case 0xF0000000: { // advanced_return
                if (instruction & 1)
                    buffer.push(`<p class="instruction-line">${addressHTML(ip - 1)}<span class="instruction-label">FALL</span></p>`);
                else
                    buffer.push(`<p class="instruction-line">${addressHTML(ip - 1)}<span class="instruction-label">FAIL</span></p>`);

            } break outer;
        }
    }

    while (ip < bytecode.length && 0 == bytecode[ip]) {
        buffer.push(`<p class="instruction-line">${addressHTML(ip)}<span class="instruction-label">NOOP</span></p>`);
        ip++;
    }

    return { string: buffer.join("\n"), ip };
}
function getInputTypeFromNumber(type: number): "PRODUCTION" | "TOKEN" | "CLASS" | "CODEPOINT" | "BYTE" | "UNDEFINED" {
    return <any>["PRODUCTION", "TOKEN", "CLASS", "CODEPOINT", "BYTE", "UNDEFINED", "UNDEFINED", "UNDEFINED"][(type & 0x7)];
}

