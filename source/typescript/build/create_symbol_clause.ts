/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import {
    convert_symbol_to_string,
    getFollowSymbolsFromItems,
    getSkippableSymbolsFromItems,
    getTokenSymbolsFromItems,
    getUniqueSymbolName,
    SymbolsCollide,
    Symbols_Are_The_Same,
    Sym_Is_Ambiguous, Sym_Is_Defined
} from "../grammar/nodes/symbol.js";
import { GrammarObject, TokenSymbol } from '../types/grammar_nodes';
import { getClosure, getFollowClosure } from "../utilities/closure.js";
import { Item } from "../utilities/item.js";
export function create_symbol_clause(
    items: Item[],
    additional_tokens: TokenSymbol[],
    grammar: GrammarObject,
    scope: "GOTO" | "DESCENT" = "DESCENT",
    INCLUDE_SKIPS: boolean = true
) {

    const active_items = items.filter(i => !i.atEND);
    const end_items = items.filter(i => i.atEND);

    if (scope == "GOTO") {
        let left_recursive_items = active_items.filter(i => i.offset == 1);
        end_items.push(...left_recursive_items.map(i => i.toEND()));
    }

    const expected_symbols = [
        ...additional_tokens,
        ...getTokenSymbolsFromItems([
            ...active_items.flatMap(i => getClosure([i], grammar)),
        ], grammar),
        ...getFollowSymbolsFromItems(end_items, grammar)
    ].setFilter(getUniqueSymbolName);

    const skipped_symbols = INCLUDE_SKIPS ? getSkippableSymbolsFromItems(items, grammar).filter(skipped => !expected_symbols.some(
        expected => Symbols_Are_The_Same(expected, skipped) /* || SymbolsCollide(expected, skipped, grammar) */)
    ) : [];

    if (expected_symbols.length < 1)
        return "";

    let code = `
    symbols: 
        
        expected [ ${expected_symbols.flatMap(convert_sym_to_code).setFilter().sort().join("  ")} ]`;

    if (skipped_symbols.length > 0)
        code += `
        
        skipped [ ${skipped_symbols.flatMap(convert_sym_to_code).setFilter().sort().join("  ")} ]

    /* Expected symbols 

    ${expected_symbols.sort((a, b) => a.id - b.id).map(create_symbol_comment).join(" ")}

    */


    /* Skipped symbols  

   ${skipped_symbols.sort((a, b) => a.id - b.id).map(create_symbol_comment).join(" ")}
   
   */`;

    return code;
}

export function convert_sym_to_code(input: any, index: number, array: any[]): string | string[] {

    let sym = input as TokenSymbol;

    if (Sym_Is_Ambiguous(sym)) {

        const defined_symbols = sym.syms.filter(Sym_Is_Defined);

        return [...defined_symbols.flatMap(convert_sym_to_code)].join("  ");
    }

    return `${sym.id}`;
};

export function create_symbol_comment(sym: TokenSymbol) {
    return ` ${sym.id}[ ${convert_symbol_to_string(<any>sym).replace(/\*\//g, "asterisk/")} ]`;
}

