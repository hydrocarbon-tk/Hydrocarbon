import { Lexer } from "@candlefw/whind";
import { Production } from "../types/grammar.js";
import { GrammarParserEnvironment } from "./grammar_compiler_environment.js";
export default function (production: Production, env: GrammarParserEnvironment, lex: Lexer): void;
