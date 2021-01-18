import { GrammarParserEnvironment } from "./grammar_compiler_environment.js";

export type HCGParser<T = any> = (input: string, env: GrammarParserEnvironment) => {
    FAILED: boolean;
    result: T[];
    action_length: number;
    error_message: string;
};
