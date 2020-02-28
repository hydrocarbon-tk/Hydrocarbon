/** Compiles a stand alone JS parser from a LR rules table and env object **/
import { LRStates } from "source/typescript/types/LRState";
import { Grammar } from "source/typescript/types/grammar";
import { ParserEnvironment } from "source/typescript/types/parser_environment.js";
export default function GenerateLRParseDataObject(states: LRStates, grammar: Grammar, env: ParserEnvironment): string;
