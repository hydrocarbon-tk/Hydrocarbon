/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { RecognizeInitializer } from "../types/parser_data";
import { ParserStateIterator } from "./core_parser";
import { jump8bit_table_byte_size } from "./parser_memory_new.js";
import { fillByteBufferWithUTF8FromString } from "./utf8.js";

function get4AlignedOffset(request_size: number) {
    return (8 - (request_size % 8)) + request_size;
}

/**
Simple WASM loader for Hydrocarbon Parser Recognizers
*/
export async function loadWASM(source: BufferSource): Promise<RecognizeInitializer> {

    let allocation_head = 8;
    let heap_start = 0;
    var memory: WebAssembly.Memory = null;
    var memory_buffer: ArrayBuffer = null;
    var memory_buffer_size = 0;
    var memory_buckets = new Map();
    function malloc(request_size: number) {

        const book_keep_size = 8;

        let new_ptr = allocation_head + heap_start;

        if (memory_buckets.has(request_size)) {

            new_ptr = memory_buckets.get(request_size).pop();

        } else {

            //the next increment must be on a 4 byte boundary

            const block = get4AlignedOffset(request_size) + book_keep_size;

            growMemoryIfNeeded(block);

            allocation_head += block;

            if (new_ptr > 0)
                (new Uint32Array(memory_buffer, new_ptr - 8, 1))[0] = request_size;
        }

        return new_ptr;
    }

    function growMemoryIfNeeded(additional_space) {
        if (allocation_head + heap_start + additional_space >= memory_buffer_size - 16) {
            const diff = (allocation_head + heap_start + additional_space) - memory_buffer_size;
            const grow_size = Math.ceil(((diff / 65536) + 1) * 1.2);
            memory.grow(grow_size);
            memory_buffer = memory.buffer;
            memory_buffer_size = memory_buffer.byteLength;
        }
    }

    function free(freed_pointer: number) {
        const [request_size] = (new Uint32Array(memory_buffer, freed_pointer - 8, 1));

        if (!memory_buckets.has(request_size))
            memory_buckets.set(request_size, []);

        memory_buckets.get(request_size).push(freed_pointer);
        /** NOOP */ return 0;

    }
    function proc_exit() { /*NOOP*/ }

    const wasm_imports = {
        wasi_snapshot_preview1: { proc_exit },
        env: { malloc, free }
    };

    const
        module = await WebAssembly.compile(source),
        instance = await WebAssembly.instantiate(module, wasm_imports),
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
        wasm_create_iterator: any = wasm_exports.create_iterator,
        wasm_init_table: any = wasm_exports.init_table,

        wasm_iterator_next: any = wasm_exports.iterator_next,
        wasm_iterator_valid: any = wasm_exports.iterator_valid,

        wasm_buffer_valid: any = wasm_exports.buffer_valid,
        wasm_buffer_len: any = wasm_exports.buffer_len,
        wasm_buffer_get_mut_state: any = wasm_exports.buffer_get_mut_state;


    class ParserResultsBufferWrapper {
        __ptr__: number;
        constructor(ptr) {
            this.__ptr__ = ptr;
        }

        get_mut_state(index: number) {
            return new ParserStateWrapper(wasm_buffer_get_mut_state(this.__ptr__, index));
        }

        len() {
            return wasm_buffer_len(this.__ptr__);
        }

        have_valid() {
            return wasm_buffer_valid(this.__ptr__);
        }
    }

    class ParserStateWrapper {
        __ptr__: number;

        constructor(ptr) {
            this.__ptr__ = ptr;
        }

        get lexer(): LexerWrapper {
            return new LexerWrapper(this.__ptr__);
        }
    }

    class LexerWrapper {
        __ptr__: number;

        constructor(ptr) {
            this.__ptr__ = ptr;
        }

        get byte_offset(): number {
            return new Uint32Array(memory_buffer, this.__ptr__ + 8, 1,)[0];
        }

        get byte_length(): number {
            return new Uint16Array(memory_buffer, this.__ptr__ + 36, 1)[0];
        }
    }

    class ParserIteratorWrapper {

        __ptr__: number;
        constructor(ptr) {
            this.__ptr__ = ptr;
        }
        next(): number {
            return wasm_iterator_next(this.__ptr__);
        }

        is_valid(): boolean {
            return wasm_iterator_valid(this.__ptr__) > 0;
        }
    }
    let dd = null;

    return {
        recognize(input_string: string, production_id: number = 0) {
            dd;
            //Clear heap
            allocation_head = 0;
            memory_buckets.clear();

            //Create Input buffer 

            //Pre-fill before allocation since actual string length is
            //unknown before transfer to module memory
            const temp_length = input_string.length * 4;

            growMemoryIfNeeded(temp_length);

            const temp_buffer = new Uint8Array(memory_buffer, heap_start, temp_length);

            const actual_length = fillByteBufferWithUTF8FromString(input_string, temp_buffer, temp_buffer.length);

            const buffer_ptr = malloc(actual_length);

            const out_ptr = wasm_recognize(buffer_ptr, actual_length, production_id);

            const Pointers = new Uint32Array(memory_buffer, out_ptr, 2);

            const [valid_ptr, invalid_ptr] = Pointers;

            return {
                invalid: new ParserResultsBufferWrapper(invalid_ptr),
                valid: new ParserResultsBufferWrapper(valid_ptr)
            };
        },

        create_iterator(data: any /* ParserResultsBufferWrapper */) {
            return <any>new ParserIteratorWrapper(wasm_create_iterator(data.__ptr__));
        },

        init_table() {

            const table_pointer = wasm_init_table();

            const destination = new Uint8Array(memory_buffer, table_pointer, jump8bit_table_byte_size);

            // Since the LU table will never be reinitialized after 
            // allocation, we set the heap start after the LU table.
            // This allows the clearing of the heap to execute as a NOOP
            // when a new parser run is started.

            heap_start += allocation_head;

            allocation_head = 0;

            dd = destination;

            return destination;
        }
    };
}