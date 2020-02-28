import { LRStates } from "../../types/lr_state.js";
import { Grammar } from "../../types/grammar.js";
import { ParserEnvironment } from "../../types/parser_environment.js";
export default function GenerateLRParseDataObject(states: LRStates, grammar: Grammar, env: ParserEnvironment): string;
