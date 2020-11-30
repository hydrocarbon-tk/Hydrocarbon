import { Lexer } from "@candlefw/wind";
import { Grammar, SymbolType, ProductionBody, Production } from "../../types/grammar.js";
import { Symbol } from "../../types/Symbol";
import { LRState } from "../types/State.js";
import { Item } from "../../util/item.js";
import { CompilerRunner } from "../types/CompilerRunner.js";
import { createAssertionFunctionBody, FOLLOW } from "../../util/common.js";
import { stmt } from "@candlefw/js";



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

export function isSymAnAssertFunction(s: Symbol): boolean {
    return s.type == SymbolType.PRODUCTION_ASSERTION_FUNCTION;
}

export function isSymAGenericType(s: Symbol): boolean {
    return s.type == SymbolType.GENERATED || s.type == SymbolType.END_OF_FILE;
}

export function isSymADefinedToken(s: Symbol): boolean {
    return s.type != SymbolType.PRODUCTION && s.type != SymbolType.GENERATED && s.type != SymbolType.PRODUCTION_ASSERTION_FUNCTION && s.id != undefined;
}
export function getRDFNName(production: Production) {
    return `$${production.name}`;
}

export function addSkipCall(grammar: Grammar, runner: CompilerRunner, exclude_set: Array<Symbol> | Set<string>) {
    const skips = getSkipArray(grammar, runner, exclude_set);
    if (skips.length > 0)
        return `_skip(l, ${skips})`;
    return "";
}

export function createAssertionShiftWithSkip(grammar: Grammar, runner: CompilerRunner, sym: Symbol, lexer_name: string = "l", exclude_set: Symbol[] | Set<string> = new Set): any {
    const skip = getSkipArray(grammar, runner, exclude_set);

    if (skip)
        return `_with_skip(${lexer_name}, ${skip}, ${getIncludeBooleans([sym], grammar, runner)});`;
    else
        return createAssertionShift(grammar, runner, sym);
}

export function createNoCheckShiftWithSkip(grammar: Grammar, runner: CompilerRunner, lexer_name: string = "l", exclude_set: Symbol[] | Set<string> = new Set): any {
    const skip = getSkipArray(grammar, runner, exclude_set);
    if (skip)
        return `_no_check_with_skip(${lexer_name}, ${skip});`;
    else
        return createNoCheckShift(grammar, runner, lexer_name);

}

export function createAssertionShift(grammar: Grammar, runner: CompilerRunner, sym: Symbol, lexer_name: string = "l"): any {
    return `_(${lexer_name}, ${getIncludeBooleans([sym], grammar, runner)});`;
}

export function createNoCheckShift(grammar: Grammar, runner: CompilerRunner, lexer_name: string = "l"): any {
    return `_no_check(${lexer_name});`;
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

export function getMaxProductionBodyLength(grammar: Grammar, prod_id: number): number {
    const production: Production = grammar[prod_id];

    if (!production) return -1;

    let max = -1;

    for (const body of production.bodies)
        max = Math.max(body.length, max);

    return max;
}

export function getUniqueSymbolName(sym: Symbol) {
    if (!sym) return "";
    return sym.val + sym.type + (sym.DOES_SHIFT ? "----" : "");
}

export function getSymbolFromUniqueName(grammar: Grammar, name: string): Symbol {
    return grammar.meta.all_symbols.get(name);
}
export function getSkipArray(grammar: Grammar, runner: CompilerRunner, exclude_set: Set<string> | Symbol[] = new Set) {

    if (Array.isArray(exclude_set)) {
        exclude_set = new Set(exclude_set.map(e => getUniqueSymbolName(e)));
    }

    const skip_symbols: Symbol[] = grammar.meta.ignore.flatMap(d => d.symbols)
        .map(s => getRootSym(s, grammar))
        .setFilter(s => s.val)
        .filter(s => !exclude_set.has(getUniqueSymbolName(s)));

    if (skip_symbols.length == 0)
        return "";

    return runner.add_constant(`(l:Lexer)=>(${getIncludeBooleans(skip_symbols, grammar, runner)})`, "skip_fn", "(l:Lexer)=>boolean");
}

export function getRootSym(sym: Symbol, grammar: Grammar) {
    if (sym.type == SymbolType.END_OF_FILE)
        return sym;

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
            return `(${lex_name}.ty ${equality} ${translateSymbolValue(sym, grammar)})`;
        case SymbolType.LITERAL:
        case SymbolType.ESCAPED:
        case SymbolType.SYMBOL:
            return `(${lex_name}.id ${equality} ${translateSymbolValue(sym, grammar)})`;
        case SymbolType.END_OF_FILE:
            return `(${lex_name}.ty ${equality} ${translateSymbolValue(sym, grammar)})`;
        case SymbolType.EMPTY:
            return (!NOT) + "";
    }
}

export function translateSymbolValue(sym: Symbol, grammar: Grammar, ANNOTATED: boolean = false, lex_name = "l"): string | number {
    const char_len = sym.val.length;


    const annotation = ANNOTATED ? `/* \\${sym.val} */` : "";

    if (sym.type == SymbolType.END_OF_FILE || sym.val == "END_OF_FILE")
        return `0 /*--*/` + (ANNOTATED ? "/* EOF */" : "");

    switch (sym.type) {
        case SymbolType.PRODUCTION_ASSERTION_FUNCTION:
            if (sym.DOES_SHIFT)
                return `__${sym.val}__(${lex_name})`;
            else
                return `__${sym.val}__(${lex_name}.copy())`;

        case SymbolType.GENERATED:
            if (sym.val == "any") { return "88"; }
            switch (sym.val) {
                case "ws": return `${lex_name}.isSP()` + annotation;
                case "num": return `${lex_name}.isNUM()` + annotation;
                case "id": return `${lex_name}.isID()` + annotation;
                case "nl": return `${lex_name}.isNL()` + annotation;
                case "tok": return ` false /*__deprecated tok__*/` + annotation;
                case "key": return ` false /*__deprecated key__*/` + annotation;
                case "sym": return `${lex_name}.isSYM()` + annotation;
                default: return `false` + annotation;
            }
        case SymbolType.LITERAL:
        case SymbolType.ESCAPED:
        case SymbolType.SYMBOL:
            if (char_len == 1) {
                return sym.val.codePointAt(0) + `/*${sym.val + ":" + sym.val.codePointAt(0)}*/`;
            } else {
                if (!sym.id)
                    sym = getRootSym(sym, grammar);
                if (!sym.id) console.log({ sym });
                return (sym.id ?? 888) + annotation;
            }
        case SymbolType.EMPTY:
            return "";
    }

    return 0;
}

export function buildIfs(syms: Symbol[], lex_name = "l", off = 0, USE_MAX = false, token_val = "TokenSymbol"): string[] {

    const stmts: string[] = [];


    if (off == 0) stmts.push("let ACCEPT = false, val = 0;");


    for (const sym of syms) {
        if ((<string>sym.val).length <= off) {
            if (USE_MAX)
                stmts.unshift(`if(length <= ${off}){l.ty = ${token_val}; l.tl = ${off}; ACCEPT = true;}`);
            else
                stmts.unshift(`l.ty = TokenSymbol; /* ${sym.val.replace(/\*/g, "asterisk")} */; l.tl = ${off}; ACCEPT = true;`);
        }
    }
    let first = true;

    if (syms.length == 1 && syms[0].val.length > off) {
        const str = syms[0].val, l = str.length - off;
        stmts.push(
            `if(${str.slice(off).split("").reverse().map((v, i) => `${lex_name}.getUTF(${off + l - i - 1}) == /* ${v.replace(/\*/g, "asterisk")} */${v.codePointAt(0)}`).join("&&")}){`,
            ...buildIfs(syms, lex_name, off + l, USE_MAX, token_val),
            "}"
        );
    } else {

        const groups = syms.filter(s => (<string>s.val).length > off).group(s => s.val[off]);

        for (const group of groups) {
            if (first && groups.length > 1) stmts.push(`val= l.getUTF(${off})`);
            const v = group[0].val[off];
            console.log(group, v, off);
            stmts.push(
                `${first ? "" : "else "} if(${groups.length == 1 ? `l.getUTF(${off})` : "val"} == ${v.codePointAt(0)} ){`,
                ...buildIfs(group, lex_name, off + 1, USE_MAX, token_val),
                "}"
            );
            first = false;
        };

    }

    if (off == 0) stmts.push("return ACCEPT");

    return stmts;
}


export function getIncludeBooleans(syms: Symbol[], grammar: Grammar, runner: CompilerRunner, lex_name: string = "l", exclude_symbols: Symbol[] = []) {

    syms = syms.setFilter(s => getUniqueSymbolName(s));

    if (syms.some(sym => sym.val == "any")) {
        return `!(${getIncludeBooleans(exclude_symbols, grammar, runner, lex_name) || "false"} )`;
    } else {
        const exclusion_list = new Set(exclude_symbols.map(getUniqueSymbolName));
        syms = syms.filter(sym => !exclusion_list.has(getUniqueSymbolName(sym))).map(s => getRootSym(s, grammar));

        const
            id = syms.filter(isSymADefinedToken),
            ty = syms.filter(isSymAGenericType),
            fn = syms.filter(isSymAnAssertFunction)
                .map(s => translateSymbolValue(s, grammar, runner.ANNOTATED, lex_name)).sort();

        if (id.length + ty.length == 0)
            return "";

        let out_id, out_ty, out_fn;

        if (fn.length > 0)
            out_fn = (fn.map(s => `${fn}`).join("||"));

        if (id.length > 0) {
            const booleans = [];
            //sort each id by its length
            const char_groups = id.groupMap(sym => sym.val[0]);

            for (const group of char_groups.values()) {
                if (group.some(sym => sym.val.length > 1)) {
                    const fn_name = `compound_token_check`;
                    const name = runner.add_constant(`(l:Lexer)=>{
                        ${buildIfs(group).join("\n")}
                    }`, fn_name, "(l:Lexer) => boolean");

                    booleans.push(`${name}(${lex_name})/* ${group.map(s => s.val).join("; ")} */`);
                } else {
                    booleans.push(...group.map(s => `${lex_name}.getUTF() == ${translateSymbolValue(s, grammar, runner.ANNOTATED, lex_name)}`));
                }
            }

            out_id = booleans.join("||");
        }

        if (ty.length > 0) {
            out_ty = (ty.map(s => translateSymbolValue(s, grammar, runner.ANNOTATED, lex_name)).join("||"));
        }
        return [out_id, out_ty, out_fn].filter(_ => _).join("||");
    }
}
export function getMappedArray<Val>(string: string, map: Map<string, Val[]>): Val[] {
    if (!map.has(string))
        map.set(string, []);
    return map.get(string);
}

function filteredMapOfSet<A, T>(set: Set<A>, fn: (a: A) => T): T[] {
    const mapped_array: T[] = [];

    for (const a of set.values()) {
        const v = fn(a);
        if (v !== undefined)
            mapped_array.push(v);
    }

    return mapped_array;
}

export function getResetSymbols(items: Item[], grammar: Grammar) {
    const syms: Map<string, Symbol> = new Map();

    for (const item of items) {
        for (const symbol of item.body_(grammar).reset.get(item.offset) || []) {
            syms.set(getUniqueSymbolName(symbol), symbol);
        }
    }

    return [...syms.values()];
}
export function getLRStateSymbolsAndFollow(state: LRState, grammar: Grammar): { state_symbols: Symbol[]; follow_symbols: Symbol[]; } {
    const follow_symbols = new Set(state.follow_symbols.values());
    //Any item with bodies with reduce should also show up here
    for (const item of state.items)
        for (const follow_map of item.body_(grammar).reduce.values())
            for (const sym of follow_map)
                follow_symbols.add(getUniqueSymbolName(sym));




    //get the exclusion set from follow
    return {
        state_symbols: filteredMapOfSet(follow_symbols, name => getSymbolFromUniqueName(grammar, name)),
        follow_symbols: filteredMapOfSet(state.follow_symbols, name => state.shift_symbols.has(name) ? undefined : getSymbolFromUniqueName(grammar, name)),
    };
}
export function integrateState(state: LRState, existing_refs: Set<number>, lex_name: string = "l"): string {

    if (!existing_refs.has(state.index))
        existing_refs.add(state.index);

    return `State${state.index}(${lex_name})`;
}

export function getStatesFromNumericArray(value: number[], states: LRState[]): LRState[] {
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
