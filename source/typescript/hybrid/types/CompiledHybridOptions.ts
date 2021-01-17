

export interface HybridCompilerOptions {
    /**
     * Type of recognizer to create
     */
    type: "wasm" | "js" | "JavaScript" | "javascript" | "WebAssembly" | "WASM" | "webassemby";
    /**
     * Number of worker threads to use when generating parser
     * recognizer code.
     */
    number_of_workers?: number;

    /**
     * Set the byte size of the action array buffer.
     */
    action_array_byte_size?: number;

    /**
     * Set the byte size of the error array buffer.
     */
    error_array_byte_size?: number;

    /**
     * Add debugging statements to output
     */
    debug?: boolean;

    /**
     * Include comment notations in typescript recognizer file.
     */
    add_annotations?: boolean;

    /**
     * Set the output directory for the completer/parser files.
     */

    completer_output_dir?: string;

    /**
     * Set the output directory for the recognizer files.
     */
    recognizer_output_dir?: string;

    /**
     * Instead of a separate recognizer file, include the recognizer within the 
     * completer file. 
     */
    combine_recognizer_and_completer?: boolean;

    /**
     * Do not write any files to disk
     */
    no_file_output: boolean;

    /**
     * Allows alternate parse of sub-productions
     */
    alternate_parse_entries?: string[];

    /**
     * Override the default location of the memory loader file that is 
     * imported by parser.ts
     */
    memory_loader_url?: string;

    /**
     * Turn on performance and size optimizations
     */
    optimize: boolean;

    /**
     * Return a parser function that can be immediately used by the calling script.
     */
    create_function: boolean;
}
