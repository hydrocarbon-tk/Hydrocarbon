import { SC } from "./skribble.js";

export const rec_glob_lex_name = SC.Variable("l:Lexer");
/**
 * Recognizer function names
 */
export const rec_consume_call = SC.Variable("consume:void");

export const rec_consume_assert_call = SC.Variable("assert_consume:bool");

export const rec_state = SC.Variable("state:State");

export const rec_state_prod = SC.Variable("prod:unsigned int");

export const TokenSpaceIdentifier = 1,
    TokenNumberIdentifier = 2,
    TokenIdentifierIdentifier = 4,
    TokenNewLineIdentifier = 8,
    TokenSymbolIdentifier = 16;




