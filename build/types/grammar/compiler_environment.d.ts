import URL from "@candlefw/url";
import { ProductionBody, Production } from "../types/grammar";
import { AwaitTracker } from "./grammar_parser";
export declare type ImportedProductionList = Array<Production> & {
    SYMBOL_LIST: boolean;
    LU: Map<string, Production>;
};
export declare type ImportedProductions = Map<string, ImportedProductionList>;
export interface CompilerEnvironment {
    SLEEP: (arg0: AwaitTracker) => void;
    bodies: Map<string, ProductionBody>;
    grammarParser: any;
    FILE_URL: URL;
    PENDING_FILES: AwaitTracker;
    AWAIT: AwaitTracker;
    productions: Array<Production>;
    refs: Map<string, string>;
    body_count: number;
    stamp: string;
    /**
     * Maps local grammar file identifiers to global grammar file identifiers to
     * resolve grammar files that have been imported from multiple sources
     */
    imported: Map<string, string>;
    /**
     * Productions imported through the importProductionConstructor
     */
    meta_imported_productions: ImportedProductions;
    functions: {};
}
