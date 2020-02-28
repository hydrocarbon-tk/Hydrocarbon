import { Grammar } from "../types/grammar";
export declare type AwaitTracker = {
    count: number;
};
export declare function grammarParser(grammar_string: any, grammar_file_url: any, unique_grammar_file_id?: number, meta_imported_productions?: Map<any, any>, global_pending_files?: {
    count: number;
}): Promise<Grammar>;
