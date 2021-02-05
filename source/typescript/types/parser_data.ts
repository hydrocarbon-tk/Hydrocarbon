export interface ParserData {
    ptr?: number;
    input_ptr: number;
    rules_ptr: number;
    error_ptr: number;
    debug_ptr: number;
    input_len: number;
    rules_len: number;
    error_len: number;
    debug_len: number;
    input: Uint8Array;
    rules: Uint32Array;
    error: Uint8Array;
    debug: Uint8Array;
}
export interface RecognizeInitializer {
    recognizer: (data: ParserData, production?: number) => boolean,
    init_data: (
        input_len: number,
        rules_len: number,
        error_len: number,
        debug_len: number,
    ) => ParserData,
    init_table: () => Uint8Array,
    delete_data: (data: ParserData) => void;
}
