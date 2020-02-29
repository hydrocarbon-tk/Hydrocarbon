import { Item } from "./item.js";
import { Grammar } from "../types/grammar.js";
import { CompilerErrorStore } from "../lr/state_generation/compiler_error_store.js";
export declare function processClosure(items: Item[], grammar: Grammar, error: CompilerErrorStore, excludes: [], offset?: number, added?: Set<unknown>): number;
