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

    return sym.val
        + sym.type;
}
export function getUniqueSymbolName(sym: Symbol) {
    if (!sym)
        return "";
    return getSymbolName(sym)
        + (sym.DOES_SHIFT ? "----" : "")
        + (sym.IS_NON_CAPTURE ? "-->" : "");
}
export function isSymNonConsume(s: Symbol): boolean {
    return !!s.IS_NON_CAPTURE;
}
export function isSymNotNonConsume(s: Symbol): boolean {
    return !isSymNonConsume(s);
}
export function isSymAProduction(s: Symbol): s is ProductionSymbol {
    return s.type == SymbolType.PRODUCTION;
}

export function isSymAnAssertFunction(s: Symbol): s is AssertionFunctionSymbol {
    return s.type == SymbolType.PRODUCTION_ASSERTION_FUNCTION;
}

export function isSymAGenericType(s: Symbol): s is (GeneratedSymbol | EOFSymbol) {
    return (s.type == SymbolType.GENERATED || s.type == SymbolType.END_OF_FILE);
}

export function isSymAProductionToken(s: Symbol): s is (ProductionTokenSymbol) {
    return (s.type == SymbolType.PRODUCTION_TOKEN_SYMBOL);
}
/**
 * Any symbol that is not Generated, an AssertFunction, or a Production
 * @param s
 */

export function isSymSpecified(s: Symbol): s is SpecifiedSymbol {
    return !isSymAProduction(s) && !isSymAGenericType(s) && !isSymAnAssertFunction(s) && !isSymAProductionToken(s);
}
/**
 * A SpecifiedSymbol that is not a SpecifiedIdentifierSymbol nor a SpecifiedNumericSymbol
 * @param s
 */
export function isSymSpecifiedSymbol(s: Symbol): s is SpecifiedCharacterSymbol {
    return isSymSpecified(s) && !isSymIdentifier(s) && !isSymNumeric(s);
}
export function isSymSpecifiedIdentifier(s: Symbol): s is SpecifiedIdentifierSymbol {
    return isSymSpecified(s) && isSymIdentifier(s);
}
export function isSymSpecifiedNumeric(s: Symbol): s is SpecifiedNumericSymbol {
    return isSymSpecified(s) && isSymNumeric(s);
}
export function isSymNumeric(sym: TokenSymbol): sym is SpecifiedNumericSymbol {
    const lex = new Lexer(sym.val + "");
    return lex.ty == lex.types.num && lex.pk.END;
}
export function isSymNotNumeric(sym: TokenSymbol): boolean {
    return !isSymNumeric(sym);
}
export function isSymIdentifier(sym: TokenSymbol): sym is SpecifiedIdentifierSymbol {
    const lex = new Lexer(sym.val + "");
    return lex.ty == lex.types.id && lex.pk.END;
}
export function isSymNotIdentifier(sym: TokenSymbol): boolean {
    return !isSymIdentifier(sym);
}
export function isSymLengthOneDefined(sym: TokenSymbol) {

    if ((sym.val + "").length > 1)
        return false;

    const lex = new Lexer(sym.val + "");

    return !(lex.ty == lex.types.id || lex.ty == lex.types.num);
}
export function isSymNotLengthOneDefined(sym: TokenSymbol): boolean {
    return !isSymLengthOneDefined(sym);
}
export function isSymGeneratedNL(sym: TokenSymbol) { return sym.val == "nl" && sym.type == SymbolType.GENERATED; }
export function isSymGeneratedId(sym: TokenSymbol) { return sym.val == "id" && sym.type == SymbolType.GENERATED; }
export function isSymGeneratedSym(sym: TokenSymbol) { return sym.val == "sym" && sym.type == SymbolType.GENERATED; }
export function isSymGeneratedNum(sym: TokenSymbol) { return sym.val == "num" && sym.type == SymbolType.GENERATED; }
export function isSymGeneratedWS(sym: TokenSymbol): boolean { return sym.val == "ws"; }

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
        .filter(sym => !isSymAProduction(sym));
}

export function getSkippableSymbolsFromItems(items: Item[], grammar: Grammar): TokenSymbol[] {

    return items.flatMap(i => [...grammar.item_map.get(i.id).skippable.values()])
        .group()
        .filter(grp => grp.length == items.length)
        .map(grp => grp[0])
        .map(sym => <TokenSymbol>grammar.meta.all_symbols.get(sym))
        .flatMap(sym => <TokenSymbol[]>getTrueSymbolValue(sym, grammar));
}
export function getExcludeSymbolSet(setA: TokenSymbol[], setB: TokenSymbol[]): TokenSymbol[] {
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
export function createAssertionShiftManual(lex_name: ConstSC | VarSC = SC.Variable("l:Lexer"), boolean: ExprSC): ExprSC {
    return SC.Call(rec_consume_assert_call, lex_name, rec_state, boolean);
}

export function getRootSym<T = Symbol>(sym: T, grammar: Grammar): T {
    if ((<Symbol><any>sym).type == SymbolType.END_OF_FILE)
        return sym;

    const name = getUniqueSymbolName(<Symbol><any>sym);

    return <T><any>grammar.meta.all_symbols.get(name) || sym;
}

export function doSymbolsOcclude(symA: Symbol, symB: Symbol): boolean {

    if (
        isSymAProduction(symA)
        || isSymAProduction(symB)
        || isSymGeneratedId(symA)
        || isSymGeneratedId(symB)
    ) return false;

    if (symA.val == symB.val) return false;

    let
        short = symA.val,
        long = symB.val;

    if (short.length > long.length) {
        short = long;
        long = symA.val;
    }

    for (let i = 0; i < short.length; i++)
        if (short[i] !== long[i]) return false;

    return true;
}
export function getUnskippableSymbolsFromClosure(closure: Item[], grammar: Grammar): any {
    return [...new Set(closure.flatMap(i => grammar.item_map.get(i.id).reset_sym)).values()].map(sym => grammar.meta.all_symbols.get(sym));
}


export function getSymbolsFromClosure(closure: Item[], grammar: Grammar): any {
    return [
        ...new Set(
            closure
                .filter(i => !i.atEND)
                .filter(i => !isSymAProduction(i.sym(grammar)))
                .flatMap(i => getTrueSymbolValue(<TokenSymbol>i.sym(grammar), grammar))
        ).values()
    ];
}
