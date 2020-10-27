import { Grammar, SymbolType, Symbol, ProductionBody } from "../../types/grammar.js";
import { Lexer } from "@candlefw/wind";
import { stmt, renderWithFormatting, extendAll, JSNodeType } from "@candlefw/js";
import { State } from "../types/State.js";
import { traverse } from "@candlefw/conflagrate";
import { Item } from "../../util/item.js";



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
export function getRootSym(sym: Symbol, grammar: Grammar) {
    const name = sym.val + sym.type;
    return grammar.meta.all_symbols.get(name) ?? sym;
}

export function translateSymbolValue(sym: Symbol, grammar: Grammar): string | number {
    switch (sym.type) {
        case SymbolType.GENERATED:
            if (sym.val == "any") { return "88"; }
            if (sym.val == "$eof")
                return `0`;
            switch (sym.val) {
                case "ws": return 1 + `/* ${sym.val} */`;
                case "num": return 2 + `/* ${sym.val} */`;
                case "id": return 3 + `/* ${sym.val} */`;
                case "nl": return 4 + `/* ${sym.val} */`;
                default:
                case "sym": return 5 + `/* ${sym.val} */`;
            }
            return Lexer.types[sym.val] + `/* ${sym.val} */`;
        case SymbolType.LITERAL:
        case SymbolType.ESCAPED:
        case SymbolType.SYMBOL:
            if (!sym.id)
                sym = getRootSym(sym, grammar);
            if (!sym.id) console.log({ sym });
            return (sym.id ?? 888) + `/* ${sym.val} */`;
        case SymbolType.END_OF_FILE:
            return 0;
        case SymbolType.EMPTY:
            return "";
    }
}

export function getLexPeekComparisonStringCached(sym: Symbol, grammar: Grammar): string {
    switch (sym.type) {
        case SymbolType.GENERATED:
            if (sym.val == "any") { return "true"; }
            if (sym.val == "$eof")
                return `ty == 0`;
            return `ty == ${translateSymbolValue(sym, grammar)}`;
        case SymbolType.LITERAL:
        case SymbolType.ESCAPED:
        case SymbolType.SYMBOL:
            return `id == ${translateSymbolValue(sym, grammar)}`;
        case SymbolType.END_OF_FILE:
            return `l.END`;
        case SymbolType.EMPTY:
            return "true";
    }
}

//
export function integrateState(state: State, existing_refs: Set<number>): string {

    if (!existing_refs.has(state.index))
        existing_refs.add(state.index);

    return `State${state.index}(l)`;
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
