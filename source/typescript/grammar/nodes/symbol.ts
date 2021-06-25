/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Lexer } from "@candlelib/wind";
import { Grammar } from "../../types/grammar.js";
import { HCG3Grammar, HCG3Symbol } from "../../types/grammar_nodes.js";
import {
    DefinedCharacterSymbol,
    DefinedIdentifierSymbol,
    DefinedNumericSymbol,
    DefinedSymbol, EOFSymbol,
    GeneratedSymbol,
    ProductionSymbol,
    ProductionTokenSymbol,
    TokenSymbol
} from "../../types/symbol";
import { SymbolType } from "../../types/symbol_type.js";
import { Item } from "../../utilities/item.js";

export function getTrueSymbolValue(sym: TokenSymbol, grammar: HCG3Grammar): TokenSymbol[] {
    return [<TokenSymbol>sym];
}
export function characterToUTF8(char: string) {

    const code_point = char.codePointAt(0);

    if ((code_point & 0x7F) == code_point) {
        return `utf8_1(l,${code_point})`;
    } else if ((code_point & 0x7FF) == code_point) {
        return `utf8_2(l,${code_point})`;
    } else if ((code_point & 0xFFFF) == code_point) {
        return `utf8_3(l,${code_point})`;
    } else {
        return `utf8_4(l,${code_point})`;
    }
}
export function convertSymbolToString(sym: HCG3Symbol) {
    switch (sym.type) {
        case SymbolType.ESCAPED:
        case SymbolType.SYMBOL:
            return `${sym.val}`;
        case SymbolType.GENERATED:
            return `θ${sym.val}`;
        case SymbolType.LITERAL:
            return `τ${sym.val}` + (sym.IS_NON_CAPTURE ? "-ns" : "");
        case SymbolType.EMPTY:
            return `ɛ`;
        case SymbolType.END_OF_FILE:
            return `END_OF_FILE`;
        case SymbolType.PRODUCTION_TOKEN_SYMBOL:
            return `tk:${sym.name}`;
        default:
            return sym.val;
    }
}
export function getSymbolName(sym: HCG3Symbol) {
    if (!sym)
        return "";

    return "[" + (sym.val ?? sym.name) + "]" + sym.type;
}
export function getUniqueSymbolName(sym: HCG3Symbol, INCLUDE_META: boolean = false) {
    if (!sym)
        return "not-a-symbol";
    return getSymbolName(sym)
        + (sym.DOES_SHIFT ? "----" : "")
        + (sym.IS_NON_CAPTURE && INCLUDE_META ? "-->" : "");
}

export function Sym_Is_Compound(s: HCG3Symbol): s is DefinedCharacterSymbol {
    return Sym_Is_Defined_Symbols(s) && s.val.length > 1;
}
export function Sym_Is_Not_Consumed(s: HCG3Symbol): boolean {
    return !!s.IS_NON_CAPTURE;
}
export function Sym_Is_EOF(s: HCG3Symbol): s is EOFSymbol {
    return s.type == SymbolType.END_OF_FILE || s.val == "END_OF_FILE";
}
export function Sym_Is_Consumed(s: HCG3Symbol): boolean {
    return !Sym_Is_Not_Consumed(s);
}
export function Sym_Is_A_Production(s: HCG3Symbol): s is ProductionSymbol {
    if (!s) return false;
    return s.type == SymbolType.PRODUCTION || s.type == "sym-production" || Sym_Is_A_Production_Token(s);
}

export function Sym_Is_A_Production_Token(s: HCG3Symbol): s is (ProductionTokenSymbol) {
    if (!s) return false;
    return (s.type == SymbolType.PRODUCTION_TOKEN_SYMBOL);
}

export function Sym_Is_A_Terminal(s: HCG3Symbol): s is TokenSymbol {
    return false == Sym_Is_A_Production(s) || Sym_Is_A_Production_Token(s);
}

export function Sym_Is_A_Token(s: HCG3Symbol): s is TokenSymbol {
    return Sym_Is_A_Terminal(s);
}


export function Sym_Is_An_Assert_Function(s: HCG3Symbol): s is any {
    return false;
}

export function Sym_Is_A_Generic_Type(s: HCG3Symbol): s is (GeneratedSymbol | EOFSymbol) {
    return (s.type == SymbolType.GENERATED || Sym_Is_EOF(s));
}
/**
 * Any symbol that is not Generated, an AssertFunction, or a Production
 * @param s
 */

export function Sym_Is_Defined(s: HCG3Symbol): s is DefinedSymbol {
    return !Sym_Is_A_Production(s) && !Sym_Is_A_Generic_Type(s);
}
/**
 * A SpecifiedSymbol that is not a SpecifiedIdentifierSymbol nor a SpecifiedNumericSymbol
 * @param s
 */
export function Sym_Is_Defined_Symbols(s: HCG3Symbol): s is DefinedCharacterSymbol {
    return Sym_Is_Defined(s) && !Defined_Sym_Is_An_Identifier(s) && !Sym_Is_Numeric(s);
}
export function Sym_Is_Defined_Identifier(s: HCG3Symbol): s is DefinedIdentifierSymbol {
    return Sym_Is_Defined(s) && Defined_Sym_Is_An_Identifier(s);
}
export function Sym_Is_Defined_Natural_Number(s: HCG3Symbol): s is DefinedNumericSymbol {
    return Sym_Is_Defined(s) && Sym_Is_Numeric(s);
}
export function Sym_Is_Numeric(sym: HCG3Symbol): sym is DefinedNumericSymbol {
    const lex = new Lexer(sym.val + "");
    return lex.ty == lex.types.num && lex.pk.END;
}
export function Sym_Is_Not_Numeric(sym: HCG3Symbol): boolean {
    return !Sym_Is_Numeric(sym);
}
/**
 * Any defined symbol whose character sequence begins with a character from
 * the Unicode *ID_Start* class.
 * 
 * see: https://unicode.org/reports/tr31/
 * @param sym 
 */
export function Defined_Sym_Is_An_Identifier(sym: HCG3Symbol): sym is DefinedIdentifierSymbol {
    const val = sym.val + "";
    const lex = new Lexer(val + "");
    return lex.ty == lex.types.id && lex.tl == val.length;
}
export function Sym_Is_Not_A_Defined_Identifier(sym: HCG3Symbol): boolean {
    return !Sym_Is_Defined_Identifier(sym);
}
export function Sym_Has_Just_One_Character(sym: HCG3Symbol) {

    if ((sym.val + "").length > 1)
        return false;

    const lex = new Lexer(sym.val + "");

    return !(lex.ty == lex.types.id || lex.ty == lex.types.num);
}
export function Sym_Has_Multiple_Characters(sym: HCG3Symbol): boolean {
    return !Sym_Has_Just_One_Character(sym);
}
export function Sym_Is_A_Generic_Newline(sym: HCG3Symbol): sym is GeneratedSymbol { return sym.val == "nl" && sym.type == SymbolType.GENERATED; }
export function Sym_Is_A_Generic_Identifier(sym: HCG3Symbol): sym is GeneratedSymbol { return sym.val == "id" && sym.type == SymbolType.GENERATED; }
export function Sym_Is_A_Generic_Symbol(sym: HCG3Symbol): sym is GeneratedSymbol { return sym.val == "sym" && sym.type == SymbolType.GENERATED; }
export function Sym_Is_A_Generic_Number(sym: HCG3Symbol): sym is GeneratedSymbol { return sym.val == "num" && sym.type == SymbolType.GENERATED; }
export function Sym_Is_A_Space_Generic(sym: HCG3Symbol): sym is GeneratedSymbol { return sym.val == "ws"; }

export function getFollowSymbolsFromItems(items: Item[], grammar: Grammar): TokenSymbol[] {
    return items.filter(i => i.atEND)
        .flatMap(i => [...grammar.item_map.get(i.id).follow.values()])
        .setFilter()
        .map(sym => <TokenSymbol>grammar.meta.all_symbols.get(sym));
}

export function getTokenSymbolsFromItems(items: Item[], grammar: HCG3Grammar): TokenSymbol[] {
    return items.filter(i => !i.atEND)
        .flatMap(i => getTrueSymbolValue(<TokenSymbol>i.sym(grammar), grammar))
        .setFilter(getUniqueSymbolName)
        .filter(sym => !Sym_Is_A_Production(sym) || Sym_Is_A_Production_Token(sym));
}

export function getSkippableSymbolsFromItems(items: Item[], grammar: Grammar): TokenSymbol[] {

    return items.flatMap(i => [...grammar.item_map.get(i.id).skippable.values()])
        .group()
        .filter(grp => grp.length == items.length)
        .map(grp => grp[0])
        .map(sym => <TokenSymbol>grammar.meta.all_symbols.get(sym))
        .flatMap(sym => <TokenSymbol[]>getTrueSymbolValue(sym, grammar));
}

/**
 * ret = setA \ setB
 * @param setA 
 * @param setB 
 */
export function getComplementOfSymbolSets(setA: TokenSymbol[], setB: TokenSymbol[]): TokenSymbol[] {
    return setA.filter(a => {
        const unique_name = getUniqueSymbolName(a);
        return !setB.some(b => getUniqueSymbolName(b) == unique_name);
    });
}
;

export function getSymbolFromUniqueName(grammar: HCG3Grammar, name: string): HCG3Symbol {
    return grammar.meta.all_symbols.get(name);
}
export function getRootSym<T = HCG3Symbol>(sym: T, grammar: HCG3Grammar): T {
    if ((<HCG3Symbol><any>sym).type == SymbolType.END_OF_FILE)
        return sym;

    const name = getUniqueSymbolName(<HCG3Symbol><any>sym);

    return <T><any>grammar.meta.all_symbols.get(name) || sym;
}

export function Symbols_Occlude(target: HCG3Symbol, potentially_occludes: HCG3Symbol): boolean {

    if (Sym_Is_A_Production(target) || Sym_Is_A_Production(potentially_occludes)) return false;
    if (Symbols_Are_The_Same(target, potentially_occludes)) return false;
    if (target.val == potentially_occludes.val) return false;

    if (Sym_Is_A_Generic_Symbol(potentially_occludes) && Sym_Is_Defined_Symbols(target)) return true;
    if (Sym_Is_A_Generic_Identifier(potentially_occludes) && Sym_Is_Defined_Identifier(target)) return true;
    if (Sym_Is_A_Generic_Number(potentially_occludes) && Sym_Is_Defined_Natural_Number(target)) return true;

    return Defined_Symbols_Occlude(target, potentially_occludes);
}

export function Defined_Symbols_Occlude(target: HCG3Symbol, potentially_occludes: HCG3Symbol): boolean {

    if (!Sym_Is_Defined(target) || !Sym_Is_Defined(potentially_occludes)) return false;

    let
        short = target.val.toString(),
        long = potentially_occludes.val.toString();

    if (short.length > long.length) return false;

    for (let i = 0; i < short.length; i++)
        if (short[i] !== long[i]) return false;

    return true;
}
export function Symbols_Are_The_Same(a: HCG3Symbol, b: HCG3Symbol) {
    return getUniqueSymbolName(a) == getUniqueSymbolName(b);
}

export function getUnskippableSymbolsFromClosure(closure: Item[], grammar: HCG3Grammar): any {
    return [...new Set(closure.flatMap(i => grammar.item_map.get(i.id).reset_sym)).values()].map(sym => grammar.meta.all_symbols.get(sym));
}

export function getSymbolsFromClosure(closure: Item[], grammar: HCG3Grammar): HCG3Symbol[] {
    return [
        ...new Set(
            closure
                .filter(i => !i.atEND)
                .filter(i => !Sym_Is_A_Production(i.sym(grammar)) || Sym_Is_A_Production_Token(i.sym(grammar)))
                .flatMap(i => getTrueSymbolValue(<TokenSymbol>i.sym(grammar), grammar))
        ).values()
    ];
}
