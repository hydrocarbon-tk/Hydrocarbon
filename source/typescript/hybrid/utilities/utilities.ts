import { Grammar, SymbolType, Symbol, ProductionBody } from "../../types/grammar.js";
import { Lexer } from "@candlefw/wind";
import { stmt, renderWithFormatting, extendAll, JSNodeType } from "@candlefw/js";
import { State } from "../types/State.js";
import { traverse } from "@candlefw/conflagrate";
import { Item } from "../../util/item.js";
import { CompilerRunner } from "../types/CompilerRunner.js";



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

export function getSkipArray2(grammar: Grammar, runner: CompilerRunner) {
    const skip_symbols = grammar.meta.ignore.flatMap(d => d.symbols).map(s => getRootSym(s, grammar)).setFilter(s => s.val).map(s => translateSymbolValue(s, grammar, runner.ANNOTATED));
    return runner.add_constant(`[${skip_symbols.join(",")}]`, "skip_boo", "u32[]");
}
export function getSkipArray(grammar: Grammar, runner: CompilerRunner) {
    const skip_symbols = grammar.meta.ignore.flatMap(d => d.symbols).map(s => getRootSym(s, grammar)).setFilter(s => s.val).map(s => translateSymbolValue(s, grammar, runner.ANNOTATED));
    return runner.add_constant(`[${skip_symbols.join(",")}]`, undefined, "u32[]");
}

export function getRootSym(sym: Symbol, grammar: Grammar) {
    const name = sym.val + sym.type;

    if (!grammar.meta.all_symbols.has(name) && sym.type !== SymbolType.PRODUCTION && sym.type !== SymbolType.GENERATED) {
        console.log({ sym, syms: grammar.meta.all_symbols });
    }
    return grammar.meta.all_symbols.get(name) || sym;
}

export function translateSymbolValue(sym: Symbol, grammar: Grammar, ANNOTATED: boolean = false): string | number {
    const annotation = ANNOTATED ? `/* ${sym.val} */` : "";
    switch (sym.type) {
        case SymbolType.GENERATED:
            if (sym.val == "any") { return "88"; }
            if (sym.val == "$eof")
                return `0` + (ANNOTATED ? "/* EOF */" : "");
            switch (sym.val) {
                case "ws": return 1 + annotation;
                case "num": return 2 + annotation;
                case "id": return 3 + annotation;
                case "nl": return 4 + annotation;
                default:
                case "sym": return 5 + annotation;
            }
        case SymbolType.LITERAL:
        case SymbolType.ESCAPED:
        case SymbolType.SYMBOL:
            if (!sym.id)
                sym = getRootSym(sym, grammar);
            if (!sym.id) console.log({ sym });
            return (sym.id ?? 888) + annotation;
        case SymbolType.END_OF_FILE:
            return 0;
        case SymbolType.EMPTY:
            return "";
    }
}


export function getIncludeBooleans(syms: Symbol[], grammar: Grammar, runner: CompilerRunner, lex_name: string = "l") {
    syms = syms.map(s => getRootSym(s, grammar));


    for (const sym of syms) {
        if (!sym) console.log(syms);
    }
    const
        id = syms.filter(s => s.id != undefined)
            .map(s => s.id + (runner.ANNOTATED ? `/* ${s.val} */` : ""))
            .setFilter().sort(),
        ty = syms.filter(s => s.type == SymbolType.GENERATED)
            .map(s => translateSymbolValue(s, grammar, runner.ANNOTATED))
            .setFilter().sort();

    if (id.length + ty.length == 0) console.log(syms);

    let out_id, out_ty;

    if (id.length > 0) {
        if (id.length < 3) {
            out_id = (id.map(s => `${lex_name}.id == ${s}`).join("||"));
        } else {
            out_id = `${
                runner.add_constant(`[${id.join(",")}]`, undefined, "u32[]")}.includes(${lex_name}.id)`;
        }
    }

    if (ty.length > 0) {
        if (ty.length < 3) {
            out_ty = (ty.map(s => `${lex_name}.ty == ${s}`).join("||"));
        } else {
            out_ty = `${
                runner.add_constant(`[${ty.join(",")}]`, undefined, "u32[]")}.includes(${lex_name}.ty)`;
        }
    }

    return [out_id, out_ty].filter(_ => _).join("||");
}

export function getRealSymValue(sym: Symbol) {

    let val;
    switch (sym.type) {
        case SymbolType.GENERATED:
            if (sym.val == "keyword") { val = "keyword"; break; }
            if (sym.val == "any") { val = "true"; break; }
            if (sym.val == "$eof") { val = 0xFF; break; }
            { val = Lexer.types[sym.val]; break; }
        case SymbolType.LITERAL:
        case SymbolType.ESCAPED:
        case SymbolType.SYMBOL:
            if (sym.val == "\\") { val = `'\\'`; break; }
            if (sym.val == "\"") { val = `\\"`; break; }
            { val = sym.val; break; }
        case SymbolType.END_OF_FILE:
            { val = 0xFF; break; }
        case SymbolType.EMPTY:
            { val = "emptry"; break; }

    }

    return val;
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
