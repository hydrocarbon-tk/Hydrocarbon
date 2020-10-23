import { Grammar, SymbolType, Symbol, ProductionBody } from "../types/grammar.js";
import { Lexer } from "@candlefw/wind";
import { stmt, renderWithFormatting, extendAll, JSNodeType } from "@candlefw/js";
import { State } from "./State.js";
import { traverse } from "@candlefw/conflagrate";
import { Item } from "../util/item.js";



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
Array.prototype.setFilter = function <T>(this: Array<T>, fn: (T) => (string | number)[] = _ => _ ? _.toString() : ""): T[] {

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

export function translateSymbolLiteral(sym: number | string): string {
    switch (typeof sym) {
        case "number":
            return sym + "";
        case "string":
            if (sym == "$eof")
                return `0xFF`;
            if (sym == "\"") return `'"'`;
            return `"${sym}"`;
    }
}

export function translateSymbolLiteralToLexerBool(sym: number | string, lex_name: string = "l"): string {
    switch (typeof sym) {
        case "number":
            if (sym == 0xFF)
                return `${lex_name}.END`;
            return `ty == ${sym + ""}`;
        case "string":
            if (sym == "any") { return "true"; }
            if (sym == "$eof") return `${lex_name}.END`;
            return `tx == ${translateSymbolLiteral(sym)}`;
    }
}

export function translateSymbolValue(sym: Symbol): string {
    switch (sym.type) {
        case SymbolType.GENERATED:
            if (sym.val == "any") { return "true"; }
            if (sym.val == "$eof")
                return `0xFF`;
            return Lexer.types[sym.val];
        case SymbolType.LITERAL:
        case SymbolType.ESCAPED:
        case SymbolType.SYMBOL:
            if (sym.val == "\"") return `'"'`;
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
            if (sym.val == "any") { return "true"; }
            if (sym.val == "$eof")
                return `l.${pk}END`;
            return `l.${pk}ty == ${translateSymbolValue(sym)}`;
        case SymbolType.LITERAL:
        case SymbolType.ESCAPED:
        case SymbolType.SYMBOL:
            return `l.${pk}tx == ${translateSymbolValue(sym)}`;
        case SymbolType.END_OF_FILE:
            return `l.${pk}END`;
        case SymbolType.EMPTY:
            return "true";
    }
}
export function getLexComparisonString(sym: Symbol): string {
    switch (sym.type) {
        case SymbolType.GENERATED:
            if (sym.val == "any") { return "true"; }
            if (sym.val == "$eof")
                return `l.END`;
            return `l.ty == ${translateSymbolValue(sym)}`;
        case SymbolType.LITERAL:
        case SymbolType.ESCAPED:
        case SymbolType.SYMBOL:
            return `l.tx == ${translateSymbolValue(sym)}`;
        case SymbolType.END_OF_FILE:
            return `l.END`;
        case SymbolType.EMPTY:
            return "true";
    }
}

export function getLexPeekComparisonStringCached(sym: Symbol): string {

    switch (sym.type) {
        case SymbolType.GENERATED:
            if (sym.val == "any") { return "true"; }
            if (sym.val == "$eof")
                return `l.END`;
            return `ty == ${translateSymbolValue(sym)}`;
        case SymbolType.LITERAL:
        case SymbolType.ESCAPED:
        case SymbolType.SYMBOL:
            return `tx == ${translateSymbolValue(sym)}`;
        case SymbolType.END_OF_FILE:
            return `l.END`;
        case SymbolType.EMPTY:
            return "true";
    }
}
export function getLexPeekComparisonString(sym: Symbol): string {

    switch (sym.type) {
        case SymbolType.GENERATED:
            if (sym.val == "any") { return "true"; }
            if (sym.val == "$eof")
                return `l.END`;
            return `l.ty == ${translateSymbolValue(sym)}`;
        case SymbolType.LITERAL:
        case SymbolType.ESCAPED:
        case SymbolType.SYMBOL:
            return `l.tx == ${translateSymbolValue(sym)}`;
        case SymbolType.END_OF_FILE:
            return `l.END`;
        case SymbolType.EMPTY:
            return "true";
    }
}
//
export function integrateState(state: State, states: State[], grammar: Grammar, id_nodes: any[], existing_refs: Set<number>, name = "s", existing_state): string {

    if (!existing_refs.has(state.index))
        existing_refs.add(state.index);

    return `State${state.index}(l, e)`;
}

export function getCompletedItems(state: State): Item[] {
    return state.items.filter(e => e.atEND).group(i => i.id);
}
export function getCompletedItemsNew(state: State): Item[] {
    return state.items.filter(e => e.atEND);
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

export function has_INLINE_FUNCTIONS(body: ProductionBody): boolean {
    return body.functions.length > 0;
}

export function getReduceFunctionSymbolIndiceSet(item: Item, grammar: Grammar): Set<number> {

    const reduce_function = item.body_(grammar).reduce_function, sym_set: Set<number> = new Set;

    if (reduce_function) {

        const statement = stmt(reduce_function.txt);

        if (statement.type == JSNodeType.ReturnStatement) {
            for (const { node } of traverse(statement.nodes[0], "nodes")
                .filter("type", JSNodeType.MemberExpression)) {
                if (node.nodes[0].value == "sym" && node.COMPUTED) {
                    sym_set.add(parseInt(<string>node.nodes[1].value));
                }
            }
        }
    }

    return sym_set;
}
export function createReduceFunction(node_str: string, pre_fix = "", increment: number = 0, post_fix = ""): string {

    const statement = stmt(node_str), hook = { ast: null };

    if (statement.type == JSNodeType.ReturnStatement) {
        for (const { node, meta: { replace } } of traverse(statement.nodes[0], "nodes")
            .filter("type", JSNodeType.MemberExpression)
            .makeReplaceable()
            .extract(hook)) {
            if (node.nodes[0].value == "sym" && node.COMPUTED && (pre_fix || post_fix)) {
                replace({
                    type: JSNodeType.Identifier,
                    value: pre_fix + (increment + parseInt(node.nodes[1].value)) + post_fix,
                    pos: node.pos,
                    nodes: []
                });
            }
        }

        return `${renderWithFormatting(hook.ast)}`;
    }

    return `null`;
}
export function getAllProductionIds(state: State, grammar: Grammar): number[] {
    return [...new Set(state.items.map(m => m.getProduction(grammar).id)).values()];
}
