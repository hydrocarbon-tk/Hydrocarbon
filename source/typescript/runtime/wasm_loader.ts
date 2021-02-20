/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { jump8bit_table_byte_size } from "./parser_memory_new.js";
import { ParserData, RecognizeInitializer } from "../types/parser_data";


/**
Simple WASM loader

Some code is taken from @assemblyscript/loader
*/
export function loadWASM(source: BufferSource): RecognizeInitializer {
    let wasm;
    let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

    cachedTextDecoder.decode();

    let cachegetUint8Memory0 = null;
    function getUint8Memory0() {
        if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
            cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
        }
        return cachegetUint8Memory0;
    }

    function getStringFromWasm0(ptr, len) {
        return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
    }

    try {
        const imports = {
            wbg: {
                __wbindgen_throw: function (arg0, arg1) {
                    throw new Error(getStringFromWasm0(arg0, arg1));
                }
            }
        };

        const module = new WebAssembly.Module(source);
        //@ts-ignore
        const instance: WebAssembly.Instance = new WebAssembly.Instance(module, imports);

        wasm = instance.exports;

        let active_ptr = -(Math.random() * 2532158);

        return {
            delete_data: (data) => {

                if (data.ptr !== active_ptr)
                    throw new Error("Invalid Parser data passed to recigizer fuc");

                wasm.delete_data(data);

                active_ptr = -(Math.random() * 2532158);
            },

            init_data: (input_len, rules_len, error_len, debug_len) => {

                const
                    ptr = wasm.init_data(input_len, rules_len, error_len, debug_len),
                    input = new Uint8Array(wasm.memory.buffer, wasm.parserbuffers_get_input(), input_len),
                    rules = new Uint32Array(wasm.memory.buffer, wasm.parserbuffers_get_rules(), rules_len),
                    error = new Uint8Array(wasm.memory.buffer, wasm.parserbuffers_get_error(), error_len),
                    debug = new Uint8Array(wasm.memory.buffer, wasm.parserbuffers_get_debug(), debug_len);

                active_ptr = ptr;

                return <ParserData>{
                    ptr,
                    input,
                    rules,
                    error,
                    debug,
                    input_len,
                    rules_len,
                    error_len,
                    debug_len,
                    debug_ptr: 0,
                    error_ptr: 0,
                    input_ptr: 0,
                    rules_ptr: 0,
                };
            },

            init_table: () => {
                return new Uint8Array(wasm.memory.buffer, wasm.init_table(), jump8bit_table_byte_size);
            },

            recognizer: (data: ParserData, start_production: number) => {

                if (data.ptr !== active_ptr)
                    throw new Error("Invalid Parser data passed to recigizer fuc");

                wasm.run_production(active_ptr, 0);

                return true;
            }
        };

    } catch (e) {
        console.log(e);
    }
}