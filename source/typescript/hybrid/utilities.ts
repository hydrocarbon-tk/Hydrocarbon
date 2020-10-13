import { Grammar, SymbolType, Symbol } from "../types/grammar.js";
import { Lexer } from "@candlefw/wind";
import { stmt, renderWithFormatting, extendAll, JSNodeType } from "@candlefw/js";
import { State } from "./State.js";



Array.prototype.groupMap = function <T>(this: Array<T>, fn: (T) => (string | number)[]): Map<(string | number), T[]> {

    const groups: Map<number | string, T[]> = new Map;

    this.forEach(e => {
        
        const id = fn(e);

        for (const ident of Array.isArray(id) && id || [id]) {
            if (!groups.has(ident))
                groups.set(ident, []);
            groups.get(ident).push(e);
        }
    });

    return groups;
};
/**
 * Filters all items based on whether a certain value is contained within a set or not
 */
Array.prototype.setFilter = function <T>(this: Array<T>, fn: (T) => (string | number)[]): T[] {

    const set = new Set;

    return this.filter(i => {
        const id = fn(i);

        if (set.has(id)) return false;
        set.add(id);
        return true;
    });
};

//@ts-ignore
Array.prototype.group = function <T>(this: Array<T>, fn: (T) => (string | number)[]): T[][] {
    return [...this.groupMap(fn).values()];
};


export function translateSymbolValue(sym: Symbol): string {
    switch (sym.type) {
        case SymbolType.GENERATED:
            if (sym.val == "$eof")
                return `0xFF`;
            return Lexer.types[sym.val];
        case SymbolType.LITERAL:
        case SymbolType.ESCAPED:
        case SymbolType.SYMBOL:
            return `"${sym.val}"`;
        case SymbolType.END_OF_FILE:
            return `0xFF`;
        case SymbolType.EMPTY:
            return "";
    }
}
export function getLexComparisonStringPeekNoEnv(sym: Symbol, grammar: Grammar, pk_depth: number = 1): string {
    const pk = "pk.".repeat(pk_depth);
    switch (sym.type) {
        case SymbolType.GENERATED:
            if (sym.val == "$eof")
                return `lex.${pk}END`;
            return `lex.${pk}ty == ${Lexer.types[sym.val]}`;
        case SymbolType.LITERAL:
        case SymbolType.ESCAPED:
        case SymbolType.SYMBOL:
            return `lex.${pk}tx == "${sym.val}"`;
        case SymbolType.END_OF_FILE:
            return `lex.${pk}END`;
        case SymbolType.EMPTY:
            return "true";
    }
}
export function getLexComparisonString(sym: Symbol): string {
    switch (sym.type) {
        case SymbolType.GENERATED:
            if (sym.val == "$eof")
                return `lex.END`;
            return `lex.ty == ${Lexer.types[sym.val]}`;
        case SymbolType.LITERAL:
        case SymbolType.ESCAPED:
        case SymbolType.SYMBOL:
            return `lex.tx == "${sym.val}"`;
        case SymbolType.END_OF_FILE:
            return `lex.END`;
        case SymbolType.EMPTY:
            return "true";
    }
}
export function getLexPeekComparisonString(sym: Symbol): string {

    switch (sym.type) {
        case SymbolType.GENERATED:
            if (sym.val == "$eof")
                return `lex.END`;
            return `lex.ty == ${"$" + sym.val ?? Lexer.types[sym.val]}`;
        case SymbolType.LITERAL:
        case SymbolType.ESCAPED:
        case SymbolType.SYMBOL:
            return `lex.tx == "${sym.val}"`;
        case SymbolType.END_OF_FILE:
            return `lex.END`;
        case SymbolType.EMPTY:
            return "true";
    }
}
//
export function integrateState(state: State, states: State[], grammar: Grammar, id_nodes: any[], existing_refs: Set<number>) {

    if (!existing_refs.has(state.index)) {
        state.refs++;
        existing_refs.add(state.index);
    }

    const
        goto_stmt = stmt(`const { p:pval, v:val } = State${state.index}(lex, e, s)`),
        goto_id = goto_stmt.nodes[0].nodes[1].nodes[0];

    id_nodes[state.index].push(goto_id);

    return {
        stmts: [goto_stmt, stmt(`s = val, p = pval;`)],
        //The productions that the transition should reduce to eventually
        productions: [...state.origins.values()].flatMap(_ => _),

        bodies: state.items.map(i => i.body)
    };
    //}
}
/** UTILS */
function isStatePurelyCompressible(state: State) {
    return state.PURE && state.HAS_COMPLETED_PRODUCTION && state.CONTAINS_ONLY_COMPLETE;
}
export function getCompletedItems(state: State) {
    return state.items.filter(e => e.atEND).group(i => i.id);
}
export function getShiftStates(state: State): [string | number, number[]][] {
    return [...state.maps.entries()].filter(([k, v]) => typeof k == "string"); //.map(([k, v]) => v);
}
export function getNonTerminalTransitionStates(state: State): [string | number, number[]][] {
    return [...state.maps.entries()].filter(([k, v]) => typeof k == "number"); //.map(([k, v]) => v);;
}
export function getStatesFromNumericArray(value: number[], states: State[]): State[] {
    return value.map(i => states[i]);
}
export function createReduceFunction(node_str: string): string {
    const statement = extendAll(stmt(node_str));

    if (statement.type == JSNodeType.ReturnStatement) {
        return `${renderWithFormatting(statement.nodes[0])}`;
    }

    return `null`;
}
export function getAllProductionIds(state: State, grammar: Grammar): number[] {
    return [...new Set(state.items.map(m => m.getProduction(grammar).id)).values()];
}
