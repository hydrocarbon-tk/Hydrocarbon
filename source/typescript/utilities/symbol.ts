import { Lexer } from "@candlefw/wind";
import { Helper } from "../compiler/helper.js";
import { Grammar } from "../types/grammar.js";
import {
    AssertionFunctionSymbol,
    EOFSymbol,
    GeneratedSymbol,
    ProductionSymbol,
    ProductionTokenSymbol,
    SpecifiedCharacterSymbol,
    SpecifiedIdentifierSymbol,
    SpecifiedNumericSymbol,
    SpecifiedSymbol,
    Symbol,
    TokenSymbol
} from "../types/symbol";
import { SymbolType } from "../types/symbol_type.js";
import { getTrueSymbolValue } from "./code_generating.js";
import { Item } from "./item.js";
import { ConstSC, ExprSC, SC, StmtSC, VarSC } from "./skribble.js";
import { rec_consume_assert_call, rec_consume_call, rec_state } from "./global_names.js";
export function SymbolToStringUnformatted(sym: { type?: SymbolType, val: string; }) {
    switch (sym.type) {
        case SymbolType.ESCAPED:
        case SymbolType.SYMBOL:
            return `${sym.val}`;
        case SymbolType.GENERATED:
            return `θ${sym.val}`;
        case SymbolType.LITERAL:
            return `τ${sym.val}`;
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
export function SymbolToString(sym: { type?: SymbolType, val: string; }) {
    switch (sym.type) {
        case SymbolType.ESCAPED:
        case SymbolType.SYMBOL:
            return `\x1b[38;5;208m${sym.val}`;
        case SymbolType.GENERATED:
            return `\x1b[38;5;208mθ${sym.val}`;
        case SymbolType.LITERAL:
            return `\x1b[38;5;229mτ${sym.val}`;
        case SymbolType.EMPTY:
            return `\x1b[38;5;208mɛ`;
        case SymbolType.END_OF_FILE:
            return `\x1b[38;5;208m$eof`;
        default:
            return `\x1b[38;5;68m${sym.val}`;
    }
}

export function getSymbolName(sym: Symbol) {
    if (!sym)
        return "";

    return "[" + sym.val + "]" + sym.type;
}
export function getUniqueSymbolName(sym: Symbol) {
    if (!sym)
        return "";
    return getSymbolName(sym)
        + (sym.DOES_SHIFT ? "----" : "")
        + (sym.IS_NON_CAPTURE ? "-->" : "");
}

export function symIsACompoundSymbol(s: Symbol): s is SpecifiedCharacterSymbol {
    return symIsSpecifiedSymbol(s) && s.val.length > 1;
}
export function symIsNonConsume(s: Symbol): boolean {
    return !!s.IS_NON_CAPTURE;
}
export function symIsEndOfFile(s: Symbol): s is EOFSymbol {
    return s.type == SymbolType.END_OF_FILE;
}
export function symIsNotNonConsume(s: Symbol): boolean {
    return !symIsNonConsume(s);
}
export function symIsAProduction(s: Symbol): s is ProductionSymbol {
    return s.type == SymbolType.PRODUCTION;
}

export function symIsAnAssertFunction(s: Symbol): s is AssertionFunctionSymbol {
    return s.type == SymbolType.PRODUCTION_ASSERTION_FUNCTION;
}

export function symIsAGenericType(s: Symbol): s is (GeneratedSymbol | EOFSymbol) {
    return (s.type == SymbolType.GENERATED || s.type == SymbolType.END_OF_FILE);
}

export function symIsAProductionToken(s: Symbol): s is (ProductionTokenSymbol) {
    return (s.type == SymbolType.PRODUCTION_TOKEN_SYMBOL);
}
/**
 * Any symbol that is not Generated, an AssertFunction, or a Production
 * @param s
 */

export function symIsSpecified(s: Symbol): s is SpecifiedSymbol {
    return !symIsAProduction(s) && !symIsAGenericType(s) && !symIsAProductionToken(s);
}
/**
 * A SpecifiedSymbol that is not a SpecifiedIdentifierSymbol nor a SpecifiedNumericSymbol
 * @param s
 */
export function symIsSpecifiedSymbol(s: Symbol): s is SpecifiedCharacterSymbol {
    return symIsSpecified(s) && !symIsIdentifier(s) && !symIsNumeric(s);
}
export function symIsSpecifiedIdentifier(s: Symbol): s is SpecifiedIdentifierSymbol {
    return symIsSpecified(s) && symIsIdentifier(s);
}
export function symIsSpecifiedNumeric(s: Symbol): s is SpecifiedNumericSymbol {
    return symIsSpecified(s) && symIsNumeric(s);
}
export function symIsNumeric(sym: TokenSymbol): sym is SpecifiedNumericSymbol {
    const lex = new Lexer(sym.val + "");
    return lex.ty == lex.types.num && lex.pk.END;
}
export function symIsNotNumeric(sym: TokenSymbol): boolean {
    return !symIsNumeric(sym);
}
export function symIsIdentifier(sym: TokenSymbol): sym is SpecifiedIdentifierSymbol {
    const lex = new Lexer(sym.val + "");
    return lex.ty == lex.types.id && lex.pk.END;
}
export function symIsNotIdentifier(sym: TokenSymbol): boolean {
    return !symIsIdentifier(sym);
}
export function symIsLengthOneDefined(sym: TokenSymbol) {

    if ((sym.val + "").length > 1)
        return false;

    const lex = new Lexer(sym.val + "");

    return !(lex.ty == lex.types.id || lex.ty == lex.types.num);
}
export function symIsNotLengthOneDefined(sym: TokenSymbol): boolean {
    return !symIsLengthOneDefined(sym);
}
export function symIsGeneratedNL(sym: TokenSymbol) { return sym.val == "nl" && sym.type == SymbolType.GENERATED; }
export function symIsGeneratedId(sym: TokenSymbol) { return sym.val == "id" && sym.type == SymbolType.GENERATED; }
export function symIsGeneratedSym(sym: TokenSymbol) { return sym.val == "sym" && sym.type == SymbolType.GENERATED; }
export function symIsGeneratedNum(sym: TokenSymbol) { return sym.val == "num" && sym.type == SymbolType.GENERATED; }
export function symIsGeneratedWS(sym: TokenSymbol): boolean { return sym.val == "ws"; }

export function getFollowSymbolsFromItems(items: Item[], grammar: Grammar): TokenSymbol[] {
    return items.filter(i => i.atEND)
        .flatMap(i => [...grammar.item_map.get(i.id).follow.values()])
        .setFilter()
        .map(sym => <TokenSymbol>grammar.meta.all_symbols.get(sym));
}

export function getTokenSymbolsFromItems(items: Item[], grammar: Grammar): TokenSymbol[] {
    return items.filter(i => !i.atEND)
        .flatMap(i => getTrueSymbolValue(<TokenSymbol>i.sym(grammar), grammar))
        .setFilter(getUniqueSymbolName)
        .filter(sym => !symIsAProduction(sym));
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
export function createNoCheckShift(grammar: Grammar, runner: Helper, lex_name: ConstSC | VarSC): StmtSC {
    return SC.Expressions(SC.Call(rec_consume_call, lex_name));
}

export function createReduceFunction(item: Item, grammar: Grammar): StmtSC {
    return SC.Expressions(SC.Call(SC.Constant("add_reduce"), rec_state, SC.Value(item.len + ""), SC.Value((item.body_(grammar).reduce_id + 1) + "")));
}

export function createDefaultReduceFunction(item: Item): StmtSC {
    return SC.Expressions(SC.Call(SC.Constant("add_reduce"), rec_state, SC.Value(item.len + ""), SC.Value("0")));
}

export function getSymbolFromUniqueName(grammar: Grammar, name: string): Symbol {
    return grammar.meta.all_symbols.get(name);
}
export function getRootSym<T = Symbol>(sym: T, grammar: Grammar): T {
    if ((<Symbol><any>sym).type == SymbolType.END_OF_FILE)
        return sym;

    const name = getUniqueSymbolName(<Symbol><any>sym);

    return <T><any>grammar.meta.all_symbols.get(name) || sym;
}

export function doDefinedSymbolsOcclude(target: TokenSymbol, potential_occluder: TokenSymbol): boolean {

    if (getUniqueSymbolName(target) == getUniqueSymbolName(potential_occluder)) return false;
    if (symIsAProduction(target) || symIsAProduction(potential_occluder)) return false;
    if (symIsGeneratedSym(target) && symIsSpecifiedSymbol(potential_occluder)) return true;
    if (symIsGeneratedId(target) && symIsSpecifiedIdentifier(potential_occluder)) return true;
    if (symIsGeneratedNum(target) && symIsSpecifiedNumeric(potential_occluder)) return true;
    if (target.val == potential_occluder.val) return false;
    let
        short = target.val.toString(),
        long = potential_occluder.val.toString();

    if (short.length > long.length) return false;

    for (let i = 0; i < short.length; i++)
        if (short[i] !== long[i]) return false;

    return true;
}
export function getUnskippableSymbolsFromClosure(closure: Item[], grammar: Grammar): any {
    return [...new Set(closure.flatMap(i => grammar.item_map.get(i.id).reset_sym)).values()].map(sym => grammar.meta.all_symbols.get(sym));
}


export function getSymbolsFromClosure(closure: Item[], grammar: Grammar): Symbol[] {
    return [
        ...new Set(
            closure
                .filter(i => !i.atEND)
                .filter(i => !symIsAProduction(i.sym(grammar)))
                .flatMap(i => getTrueSymbolValue(<TokenSymbol>i.sym(grammar), grammar))
        ).values()
    ];
}
