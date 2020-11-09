import { Lexer } from "@candlefw/wind";
import { Grammar, SymbolType, ProductionBody, Production } from "../../types/grammar.js";
import { Symbol } from "../../types/Symbol";
import { State } from "../types/State.js";
import { Item } from "../../util/item.js";
import { CompilerRunner } from "../types/CompilerRunner.js";
import { createAssertionFunctionBody } from "../../util/common.js";



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

export function getRDFNName(production: Production) {
    return `$${production.name}`;
}

export function createAssertionShift(grammar: Grammar, runner: CompilerRunner, sym: Symbol, lexer_name: string = "l"): any {
    return `_(${lexer_name},  ${getSkipArray(grammar, runner)}, ${translateSymbolValue(sym, grammar, runner.ANNOTATED)});`;
}

export function createNoCheckShift(grammar: Grammar, runner: CompilerRunner, lexer_name: string = "l"): any {
    return `_no_check(${lexer_name}, ${getSkipArray(grammar, runner)});`;
}

export function createEmptyShift(): string {
    return `add_shift(0);`;
}
export function createLRReduceCompletionWithoutFn(item: Item, grammar: Grammar): string {
    return `completeProductionPlain(${item.len},${item.getProduction(grammar).id});`;
}
export function createLRReduceCompletionWithFn(item: Item, grammar: Grammar): string {
    return `completeProduction(${item.body_(grammar).reduce_id + 1},${item.len},${item.getProduction(grammar).id});`;
}
export function createReduceFunction(item: Item, grammar: Grammar): string {
    return `add_reduce(${item.len},${item.body_(grammar).reduce_id + 1});`;
}

export function createDefaultReduceFunction(item: Item): string {
    return `add_reduce(${item.len},${0});`;
}

export function getUniqueSymbolName(sym: Symbol) {
    return sym.val + sym.type + (sym.DOES_SHIFT ? "----" : "");
}

export function getSkipArray(grammar: Grammar, runner: CompilerRunner) {

    const skip_symbols = grammar.meta.ignore.flatMap(d => d.symbols)
        .map(s => getRootSym(s, grammar))
        .setFilter(s => s.val)
        .map(s => translateSymbolValue(s, grammar, runner.ANNOTATED));

    return runner.add_constant(`StaticArray.fromArray<u32>([${skip_symbols.join(",")}])`, undefined, "");
}

export function getRootSym(sym: Symbol, grammar: Grammar) {
    const name = getUniqueSymbolName(sym);

    return grammar.meta.all_symbols.get(name) || sym;
}

export function getLexerBooleanExpression(sym: Symbol, grammar: Grammar, lex_name: string = "l", NOT: boolean = false): string {
    const equality = NOT ? "!=" : "==", not = NOT ? "!" : "";
    switch (sym.type) {
        case SymbolType.PRODUCTION_ASSERTION_FUNCTION:
            return `(${not}${translateSymbolValue(sym, grammar, false, lex_name)})`;
        case SymbolType.GENERATED:
            if (sym.val == "any") { return "true"; }
            if (sym.val == "eof")
                return `(${lex_name}.ty ${equality} 0)`;
            return `(${lex_name}.ty ${equality} ${translateSymbolValue(sym, grammar)})`;
        case SymbolType.LITERAL:
        case SymbolType.ESCAPED:
        case SymbolType.SYMBOL:
            return `(${lex_name}.id ${equality} ${translateSymbolValue(sym, grammar)})`;
        case SymbolType.END_OF_FILE:
            return `(${not}${lex_name}.END)`;
        case SymbolType.EMPTY:
            return (!NOT) + "";
    }
}

export function translateSymbolValue(sym: Symbol, grammar: Grammar, ANNOTATED: boolean = false, lex_name = "l"): string | number {
    const annotation = ANNOTATED ? `/* ${sym.val} */` : "";

    if (sym.val == "$eof")
        return `0` + (ANNOTATED ? "/* EOF */" : "");

    switch (sym.type) {
        case SymbolType.PRODUCTION_ASSERTION_FUNCTION:
            if (sym.DOES_SHIFT)
                return `__${sym.val}__(${lex_name})`;
            else
                return `__${sym.val}__(${lex_name}.copy())`;
        case SymbolType.GENERATED:
            if (sym.val == "any") { return "88"; }
            switch (sym.val) {
                case "ws": return 1 + annotation;
                case "num": return 2 + annotation;
                case "id": return 3 + annotation;
                case "nl": return 4 + annotation;
                case "tok": return 5 + annotation;
                default:
                case "sym": return 6 + annotation;
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

    const
        id = syms.filter(s => s.id != undefined & s.type !== SymbolType.PRODUCTION_ASSERTION_FUNCTION)
            .map(s => s.id + (runner.ANNOTATED ? `/* ${s.val} */` : ""))
            .setFilter().sort(),
        ty = syms.filter(s => s.type == SymbolType.GENERATED)
            .map(s => translateSymbolValue(s, grammar, runner.ANNOTATED, lex_name))
            .setFilter().sort(),
        fn = syms.filter(s => s.type == SymbolType.PRODUCTION_ASSERTION_FUNCTION)
            .map(s => translateSymbolValue(s, grammar, runner.ANNOTATED))
            .setFilter().sort();

    if (id.length + ty.length == 0) console.log(syms);

    let out_id, out_ty, out_fn;

    if (fn.length > 0)
        out_fn = (fn.map(s => `${fn}`).join("||"));

    if (id.length > 0) {
        if (id.length < 3) {
            out_id = (id.map(s => `${lex_name}.id == ${s}`).join("||"));
        } else {
            out_id = `${runner.add_constant(`[${id.join(",")}]`, undefined, "u32[]")}.includes(${lex_name}.id)`;
        }
    }

    if (ty.length > 0) {
        if (ty.length < 3) {
            out_ty = (ty.map(s => `${lex_name}.ty == ${s}`).join("||"));
        } else {
            out_ty = `${runner.add_constant(`[${ty.join(",")}]`, undefined, "u32[]")}.includes(${lex_name}.ty)`;
        }
    }

    return [out_id, out_ty, out_fn].filter(_ => _).join("||");
}

export function getRealSymValue(sym: Symbol) {

    let val;
    switch (sym.type) {
        case SymbolType.PRODUCTION_ASSERTION_FUNCTION:
            return `${sym.val}(l.copy())`;
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
//
export function integrateState(state: State, existing_refs: Set<number>): string {

    if (!existing_refs.has(state.index))
        existing_refs.add(state.index);

    return `State${state.index}(l)`;
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

export function addRecoveryHandlerToFunctionBodyArray(
    stmts: any[],
    production: Production,
    grammar: Grammar,
    runner: CompilerRunner,
    RECURSIVE_DESCENT = false
) {
    if (RECURSIVE_DESCENT)
        stmts.unshift("const sp = stack_ptr;");
    else
        stmts.push("if(!FAILED) return;");

    stmts.push(`
        //ERROR RECOVERY
        FAILED = false;
        //failed SYMBOL TOKEN
        add_shift(l.tl);
        //Shift to next token;
        l.next();
        const start = l.off;
        ${createAssertionFunctionBody(production.recovery_handler.lexer_text, grammar, runner, production.id)}
        //Skipped Symbols
        add_shift(l.off - start);
        //Consume the end symbol of the production
        ${createNoCheckShift(grammar, runner, "l")};
        
        add_reduce(stack_ptr - sp${RECURSIVE_DESCENT ? "" : ""} - 1, ${1 + production.recovery_handler.reduce_id});
        
        setProduction(${production.id});
    `);
}
