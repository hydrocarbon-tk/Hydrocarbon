/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { jump8bit_table_byte_size } from "./parser_memory_new.js";
import { ParserData, ForkData, RecognizeInitializer } from "../types/parser_data";

function get4AlignedOffset(request_size: number) {
    return (4 - request_size % 4) + request_size;
}

/**
Simple WASM loader for Hydrocarbon Parser Recognizers
*/
export function loadWASM(source: BufferSource): RecognizeInitializer {

    let allocation_head = 0;
    let heap_start = 0;
    var memory: WebAssembly.Memory = null;
    var memory_buffer: ArrayBuffer = null;
    var memory_buffer_size = 0;
    function malloc(request_size: number) {

        //increment the baseline

        const new_ptr = allocation_head + heap_start;

        //the next increment must be on a 4 byte boundary

        allocation_head += get4AlignedOffset(request_size);

        if (allocation_head + heap_start >= memory_buffer_size) {
            const diff = (allocation_head + heap_start) - memory_buffer_size;
            const grow_size = Math.ceil(((diff / 65536) + 1) * 1.2);
            memory.grow(grow_size);
            memory_buffer = memory.buffer;
            memory_buffer_size = memory_buffer.byteLength;
        }

        return new_ptr;
    }

    function free(freed_pointer: number) { /** NOOP */ return 0; }
    function proc_exit() { /*NOOP*/ }

    const wasm_imports = {
        wasi_snapshot_preview1: { proc_exit },
        env: { malloc, free }
    };

    const
        module = new WebAssembly.Module(source),
        instance = new WebAssembly.Instance(module, wasm_imports),
        wasm_exports = instance.exports;

    memory = <any>wasm_exports.memory;
    memory_buffer = memory.buffer;
    memory_buffer_size = memory_buffer.byteLength;

    //@ts-ignore - Offset the heap pointer to 4 byte aligned memory location
    heap_start = get4AlignedOffset(wasm_exports.stackSave());

    //@ts-ignore - Initialize the instance 
    wasm_exports._initialize();

    const
        wasm_recognize: any = wasm_exports.recognize,
        wasm_get_fork_pointers: any = wasm_exports.get_fork_pointers,
        wasm_init_table: any = wasm_exports.init_table,
        wasm_get_next_command_block: any = wasm_exports.get_next_command_block,
        wasm_init_data: any = wasm_exports.init_data;



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
            //Automatically clear all allocated data.
            allocation_head = 0;

            fork_count = 0;

            previous_fork_reference = null;

            const input_ptr = wasm_init_data(input_len, rules_len, error_len);

            return new Uint8Array(memory_buffer, input_ptr, input_len);
        },

        init_table() {

            const table_pointer = wasm_init_table();

            // Since the LU table will never be reinitialized after 
            // allocation, we set the heap start after the LU table.
            // This allows the clearing of the heap to execute as a NOOP
            // when a new parser run is started.

            heap_start = allocation_head;

            allocation_head = 0;

            return new Uint8Array(memory_buffer, table_pointer, jump8bit_table_byte_size);
        }
    };
}