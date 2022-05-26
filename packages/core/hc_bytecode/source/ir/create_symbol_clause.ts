/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import {
    convert_symbol_to_string,
    default_DEFAULT,
    getClosure,
    getFollowClosure,
    getSkippableSymbolsFromItems,
    getUniqueSymbolName,
    GrammarObject,
    Item,
    Symbols_Are_The_Same,
    Sym_Is_Ambiguous,
    Sym_Is_A_Production,
    Sym_Is_A_Token,
    Sym_Is_Defined,
    TokenSymbol
} from '@hctoolkit/common';
import { ConstructionOptions } from '../types/construction_options.js';
export function create_symbol_clause(
    items: Item[],
    grammar: GrammarObject,
    { scope }: ConstructionOptions,
    USE_DEFAULT_SKIP: boolean = false
) {

    const active_items = items.filter(i => !i.atEND);
    const end_items = items.filter(i => i.atEND);

    if (scope == "GOTO") {
        let left_recursive_items = active_items.filter(i => i.offset == 1);
        end_items.push(...left_recursive_items.map(i => i.toEND()));


    }

    const follow = getFollowClosure(end_items, [], grammar);
    active_items.push(...follow.filter(i => !i.atEND));

    const expected_symbols: TokenSymbol[] = active_items.flatMap(i => {
        const sym = i.sym(grammar);;

        if (Sym_Is_A_Production(sym)) {
            return <TokenSymbol[]>getClosure([i], grammar).filter(i => Sym_Is_A_Token(i.sym(grammar))).map(i => i.sym(grammar));
        } else {
            return <TokenSymbol>sym;
        }
    }).setFilter(s => getUniqueSymbolName(s));
    const
        default_skip = USE_DEFAULT_SKIP ? grammar.meta?.ignore ?? [] : [],
        skipped_symbols = [...default_skip, ...getSkippableSymbolsFromItems(items, grammar)].filter(skipped => USE_DEFAULT_SKIP || !expected_symbols.some(
            expected => Symbols_Are_The_Same(expected, skipped) /* || SymbolsCollide(expected, skipped, grammar) */)
        );

    if (end_items.length > 0)
        expected_symbols.push(default_DEFAULT);

    if (expected_symbols.length < 1)
        return "";

    let code = `
    symbols: 
        
        expected [ ${expected_symbols.flatMap(convert_sym_to_code).setFilter().sort().join("  ")} ]

        /* Expected symbols 

        ${expected_symbols.sort((a, b) => <number>a.id - <number>b.id).map(create_symbol_comment).join(" ")}
    
        */
        
    `;

    if (skipped_symbols.length > 0)
        code += `/* Skipped symbols  

        ${skipped_symbols.sort((a, b) => <number>a.id - <number>b.id).map(create_symbol_comment).setFilter().join(" ")}
        
        */
        
        skipped [ ${skipped_symbols.flatMap(convert_sym_to_code).setFilter().sort().join("  ")} ]`;

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
    return ` ${sym.id}[ ${convert_symbol_to_string(<any>sym)} ]`.replace(/\*\//g, "asterisk/");
}

