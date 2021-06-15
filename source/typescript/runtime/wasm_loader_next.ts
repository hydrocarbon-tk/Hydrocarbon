/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { jump8bit_table_byte_size } from "./parser_memory_new.js";
import { ParserData, ForkData, RecognizeInitializer } from "../types/parser_data";


/**
Simple WASM loader

Some code is taken from @assemblyscript/loader
*/
export function loadWASM(source: BufferSource): RecognizeInitializer {
    function emscripten_notify_memory_growth(new_size) {
        console.log(new_size);
    }
    function proc_exit() {
        console.log("application exited");
    }

    const wasm_imports = {
        wasi_snapshot_preview1: { proc_exit },
        env: { emscripten_notify_memory_growth }
    };

    const module = new WebAssembly.Module(source);

    const instance = new WebAssembly.Instance(module, wasm_imports);

    const wasm_exports = instance.exports;

    let memory: WebAssembly.Memory = <any>wasm_exports.memory;

    let memory_buffer = memory.buffer;

    const wasm_recognize: any = wasm_exports.recognize;
    const wasm_get_fork_pointers: any = wasm_exports.get_fork_pointers;
    const wasm_init_table: any = wasm_exports.init_table;
    const wasm_get_next_command_block: any = wasm_exports.get_next_command_block;
    const wasm_init_data: any = wasm_exports.init_data;

    let previous_fork_reference = null, previous_command_block = null, fork_count = 0;

    return {
        recognize(input_size, production_id: number = 0) {
            return (fork_count = wasm_recognize(input_size, production_id));
        },

        get_fork_pointers() {

            const forks_ptr = wasm_get_fork_pointers();
            const fork_ptrs = new Uint32Array(memory_buffer, forks_ptr, fork_count);
            const forks: ForkData[] = [];

            for (const fork_ptr of fork_ptrs) {

                const reader = new DataView(memory_buffer, fork_ptr);

                //const fork_data_ptr = reader.getInt32(0, true);
                const valid = reader.getUint8(4);
                //const depth = reader.getInt32(8, true);
                const byte_offset = reader.getInt32(12, true);
                const byte_length = reader.getInt32(16, true);
                const line = reader.getInt32(20, true);

                forks.push({
                    //@ts-ignore
                    ptr: fork_ptr,
                    VALID: valid == 1,
                    byte_offset,
                    byte_length,
                    line,
                });
            }

            return forks;
        },

        get_next_command_block(fork_reference: ForkData) {
            //@ts-ignore
            const command_block_ptr = wasm_get_next_command_block(fork_reference.ptr);

            if (previous_fork_reference != fork_reference) {
                previous_command_block = new Uint16Array(memory_buffer, command_block_ptr, 64);
                previous_fork_reference = fork_reference;
            }

            return previous_command_block;
        },

        init_data(input_len: number, rules_len: number, error_len: number) {
            fork_count = 0;
            previous_fork_reference = null;
            const input_ptr = wasm_init_data(input_len, rules_len, error_len);
            return new Uint8Array(memory_buffer, input_ptr, input_len);
        },

        init_table() {
            return new Uint8Array(memory_buffer, wasm_init_table(), jump8bit_table_byte_size);
        }
    };
}