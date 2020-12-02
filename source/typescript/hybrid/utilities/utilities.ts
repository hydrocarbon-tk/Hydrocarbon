import { traverse } from "@candlefw/conflagrate";
import { exp, JSNode, JSNodeClass, JSNodeType, JSNodeTypeLU, parser, renderWithFormatting, stmt } from "@candlefw/js";
import { Lexer } from "@candlefw/wind";

import { Grammar, GrammarFunction, Production, ProductionBody, SymbolType } from "../../types/grammar.js";
import { AssertionFunctionSymbol, GeneratedSymbol, Symbol, TokenSymbol } from "../../types/Symbol";
import { FOLLOW } from "../../util/common.js";
import { Item } from "../../util/item.js";
import { CompilerRunner } from "../types/CompilerRunner.js";
import { LRState } from "../types/State.js";


declare global {
    interface Array<T> {
        /**
        * Map groups of items based on a common identifier. Returns a new map object of these groups with
        * the key being the identifier and the value being an array of matching objects.
        */
        groupMap: <KeyType>(this: Array<T>,
            /**
             * A function that returns a string or number, or an array of strings and/or numbers, 
             * that is used to determine which group(s) the object belongs to. Defaults to a function
             * that returns the string value of the object.
             */
            fn: (item: T) => (KeyType | KeyType[])) => Map<KeyType, T[]>;

        /**
         * Reduces items that share the same identifier to the first matching item.
         */
        setFilter: (this: Array<T>,
            /**
             * A function that returns a string or number that is used to 
             * determine which set the object belongs to. Defaults to a function
             * that returns the string value of the object.
             */
            fn?: (item: T) => (string | number)
        ) => T[];

        /**
         * Group items into sub-arrays based on an identifier.
         */
        group: <KeyType>(this: Array<T>,
            /**
             * A function that returns a string or number, or an array of strings and/or numbers, 
             * that is used to determine which group(s) the object belongs to. Defaults to a function
             * that returns the string value of the object.
             */
            fn: (item: T) => (KeyType | KeyType[])
        ) => T[][];
    }
}

Array.prototype.groupMap = function <T, KeyType>(
    this: Array<T>,
    fn: (T) => (KeyType | KeyType[])
): Map<KeyType, T[]> {

    const groups: Map<KeyType, T[]> = new Map;

    this.forEach(e => {

        const id = fn(e);

        for (const ident of Array.isArray(id) ? id : [id]) {
            if (!groups.has(ident))
                groups.set(ident, []);
            groups.get(ident).push(e);
        }
    });

    return groups;
};


Array.prototype.setFilter = function <T>(
    this: Array<T>,
    fn: (T) => (string | number) = _ => _ ? _.toString() : ""
): T[] {

    const set = new Set;

    return this.filter(i => {
        const id = fn(i);

        if (set.has(id)) return false;
        set.add(id);
        return true;
    });
};


Array.prototype.group = function <T, KeyType>(this: Array<T>, fn: (T) => (KeyType | KeyType[])): T[][] {
    return [...this.groupMap(fn).values()];
};

export function isSymAProduction(s: Symbol): boolean {
    return s.type == SymbolType.PRODUCTION;
}

export function isSymAnAssertFunction(s: Symbol): boolean {
    return s.type == SymbolType.PRODUCTION_ASSERTION_FUNCTION;
}

export function isSymAGenericType(s: Symbol): boolean {
    return (s.type == SymbolType.GENERATED || s.type == SymbolType.END_OF_FILE);
}

export function isSymADefinedToken(s: Symbol): boolean {
    return !isSymAProduction(s) && !isSymAGenericType(s) && !isSymAnAssertFunction(s);
}
export function getRDFNName(production: Production) {
    return `$${production.name}`;
}

export function addSkipCall(grammar: Grammar, runner: CompilerRunner, exclude_set: TokenSymbol[] | Set<string> = new Set, lex_name: string = "l") {
    const skips = getSkipFunction(grammar, runner, exclude_set);
    if (skips.length > 0)
        return `_skip(${lex_name}, ${skips})`;
    return "";
}

export function createAssertionShiftWithSkip(grammar: Grammar, runner: CompilerRunner, sym: TokenSymbol, lexer_name: string = "l", exclude_set: TokenSymbol[] | Set<string> = new Set): any {
    const skip = getSkipFunction(grammar, runner, exclude_set);

    if (skip)
        return `_with_skip(${lexer_name}, ${skip}, ${getIncludeBooleans([sym], grammar, runner)});`;
    else
        return createAssertionShift(grammar, runner, sym);
}

export function createNoCheckShiftWithSkip(grammar: Grammar, runner: CompilerRunner, lexer_name: string = "l", exclude_set: TokenSymbol[] | Set<string> = new Set): any {
    const skip = getSkipFunction(grammar, runner, exclude_set);
    if (skip)
        return `_no_check_with_skip(${lexer_name}, ${skip});`;
    else
        return createNoCheckShift(grammar, runner, lexer_name);

}

export function createAssertionShift(grammar: Grammar, runner: CompilerRunner, sym: TokenSymbol, lexer_name: string = "l"): any {
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
export function getSkipFunction(grammar: Grammar, runner: CompilerRunner, exclude: Set<string> | TokenSymbol[] = new Set) {
    const exclude_set: Set<string> = Array.isArray(exclude) ? new Set(exclude.map(e => getUniqueSymbolName(e))) : exclude;
    const skip_symbols: TokenSymbol[] = grammar.meta.ignore.flatMap(d => d.symbols)
        .map(s => getRootSym(s, grammar))
        .setFilter(s => s.val)
        .filter(s => !exclude_set.has(getUniqueSymbolName(s)));

    if (skip_symbols.length == 0)
        return "";

    return runner.add_constant(`(l:Lexer)=>(${getIncludeBooleans(skip_symbols, grammar, runner)})`, "skip_fn", "(l:Lexer)=>boolean");
}

export function getRootSym<T = Symbol>(sym: T, grammar: Grammar): T {
    if ((<Symbol><any>sym).type == SymbolType.END_OF_FILE)
        return sym;

    const name = getUniqueSymbolName(<Symbol><any>sym);

    return <T><any>grammar.meta.all_symbols.get(name) || sym;
}

export function getLexerBooleanExpression(sym: TokenSymbol, grammar: Grammar, lex_name: string = "l", NOT: boolean = false): string {
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

export function translateSymbolValue(sym: TokenSymbol, grammar: Grammar, ANNOTATED: boolean = false, lex_name = "l"): string | number {

    const
        char_len = sym.val.length,
        annotation = ANNOTATED ? `/* \\${sym.val} */` : "";

    if (sym.type == SymbolType.END_OF_FILE || sym.val == "END_OF_FILE")
        return `${lex_name}.END` + (ANNOTATED ? "/* EOF */" : "");

    switch (sym.type) {
        case SymbolType.PRODUCTION_ASSERTION_FUNCTION:
            if (sym.DOES_SHIFT)
                return `__${sym.val}__(${lex_name})`;
            else
                return `__${sym.val}__(${lex_name}.copy())`;

        case SymbolType.GENERATED:
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
                return sym.val.codePointAt(0) + (ANNOTATED ? `/*${sym.val + ":" + sym.val.codePointAt(0)}*/` : "");
            } else {
                if (!sym.id) sym = getRootSym(sym, grammar);
                if (!sym.id) console.log({ sym });
                return (sym.id ?? 888) + annotation;
            }
        case SymbolType.EMPTY:
            return "";
    }

    return `false /* unknown_symbol ${sanitizeSymbolValForComment(getUniqueSymbolName(sym))} */`;
}

export function sanitizeSymbolValForComment(sym: string | TokenSymbol): string {
    if (typeof sym == "string")
        return sym.replace(/\*/g, "asterisk");
    return sym.val.replace(/\*/g, "asterisk");
}

export function buildIfs(syms: TokenSymbol[], lex_name = "l", off = 0, USE_MAX = false, token_val = "TokenSymbol"): string[] {

    const stmts: string[] = [];


    if (off == 0) stmts.push("let ACCEPT = false, val = 0;");


    for (const sym of syms) {
        if ((<string>sym.val).length <= off) {
            if (USE_MAX)
                stmts.unshift(`if(length <= ${off}){l.ty = ${token_val}; l.tl = ${off}; ACCEPT = true;}`);
            else
                stmts.unshift(`l.ty = TokenSymbol; /* ${sanitizeSymbolValForComment(sym)} */; l.tl = ${off}; ACCEPT = true;`);
        }
    }
    let first = true;

    if (syms.length == 1 && syms[0].val.length > off) {
        const str = syms[0].val, l = str.length - off;
        stmts.push(
            `if(${str.slice(off).split("").reverse().map((v, i) => `${lex_name}.getUTF(${off + l - i - 1}) ==  ${v.codePointAt(0)}`).join("&&")}){`,
            ...buildIfs(syms, lex_name, off + l, USE_MAX, token_val),
            "}"
        );
    } else {

        const groups = syms.filter(s => (<string>s.val).length > off).group(s => s.val[off]);

        for (const group of groups) {
            if (first && groups.length > 1) stmts.push(`val= l.getUTF(${off})`);
            const v = group[0].val[off];
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
function isNumericSymbol(sym: TokenSymbol) {
    const lex = new Lexer(sym.val);
    return lex.ty == lex.types.num && lex.pk.END;
}
function isNotNumericSymbol(sym: TokenSymbol): boolean {
    return !isNumericSymbol(sym);
}
function isIdentifierSymbol(sym: TokenSymbol) {
    const lex = new Lexer(sym.val);
    return lex.ty == lex.types.id && lex.pk.END;
}
function isNotIdentifierSymbol(sym: TokenSymbol): boolean {
    return !isIdentifierSymbol(sym);
}
function isSingleDefinedSymbol(sym: TokenSymbol) {
    if (sym.val.length > 1) return false;
    const lex = new Lexer(sym.val);
    //  console.log({ lex: lex.str, bool: !(lex.ty == lex.types.id || lex.ty == lex.types.num) });
    return !(lex.ty == lex.types.id || lex.ty == lex.types.num);
}

function isNotSingleDefinedSymbol(sym: TokenSymbol): boolean {
    return !isSingleDefinedSymbol(sym);
}

function isGeneratedIdentifierSymbol(sym: GeneratedSymbol) {
    return sym.val == "id";
}
function isGeneratedSymbolSymbol(sym: GeneratedSymbol) {
    return sym.val == "sym";
}

function isGeneratedNumericSymbol(sym: GeneratedSymbol) {
    return sym.val == "num";
}

export function getIncludeBooleans(syms: TokenSymbol[], grammar: Grammar, runner: CompilerRunner, lex_name: string = "l", exclude_symbols: TokenSymbol[] = [], optimize = true) {

    syms = syms.setFilter(s => getUniqueSymbolName(s));

    if (syms.some(sym => sym.val == "any")) {
        return `!(${getIncludeBooleans(exclude_symbols, grammar, runner, lex_name) || "false"} )`;
    } else {
        const exclusion_list = new Set(exclude_symbols.map(getUniqueSymbolName));
        syms = syms.filter(sym => !exclusion_list.has(getUniqueSymbolName(sym))).map(s => getRootSym(s, grammar));

        let
            id = syms.filter(isSymADefinedToken),
            ty = syms.filter(isSymAGenericType),
            fn = syms.filter(isSymAnAssertFunction)
                .map(s => translateSymbolValue(s, grammar, runner.ANNOTATED, lex_name)).sort();


        if (ty.some(isGeneratedIdentifierSymbol))
            id = id.filter(isNotIdentifierSymbol);

        //Filter out any symbol that is a single non-numeric or id symbol
        if (optimize) {
            if (ty.some(isGeneratedSymbolSymbol))
                id = id.filter(isNotSingleDefinedSymbol);

            if (id.length + ty.length + fn.length == 0)
                return "";
        }

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

                    booleans.push(`${name}(${lex_name})/* ${group.map(s => sanitizeSymbolValForComment(s)).join("; ")} */`);
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
    const syms: Map<string, TokenSymbol> = new Map();

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

export function generateCompiledAssertionFunction(sym: AssertionFunctionSymbol, grammar: Grammar, runner: CompilerRunner):
    GrammarFunction {
    const fn_name = sym.val;
    const fn = grammar.functions.get(fn_name);
    if (fn && !fn.assemblyscript_txt) {
        const { txt, first } = createAssertionFunctionBody(fn.txt, grammar, runner);
        fn.assemblyscript_txt = txt;
        fn.first = first;
    }
    return fn;
}

export function getAssertionSymbolFirst(sym: AssertionFunctionSymbol, grammar: Grammar): TokenSymbol[] {
    const fn = generateCompiledAssertionFunction(sym, grammar, <CompilerRunner>{ ANNOTATED: false });
    if (fn)
        return fn.first;
    else return [];
};

/**
 * Take a string from an assertion function pre-compiled 
 * script and convert into an assertion function body string.
 * 
 * - Replaces symbol place holders with equivalent type or token
 * boolean expression
 * - Replace `$next` place holder with a call to lexer next
 * - Replace `$fork` place holder with a call to lexer copy
 * - Replace `$join` place holder with a call to lexer sync
 * - Replace `$tk_start` place holder with a mile marker to the start of a token sequence
 * - Replace `$tk_end` with a shift insertion with length from the start of the previous call to `$tk_start`
 * 
 * @param af_body_content 
 */
export function createAssertionFunctionBody(af_body_content: string, grammar: Grammar, runner: CompilerRunner)
    : { txt: string, first: TokenSymbol[]; } {
    const
        syms: Map<string, { id: number, sym: TokenSymbol; }> = new Map(),
        first = [],
        // Replace symbol placeholders
        txt = (<string>af_body_content).replace(/(\!)?\<\-\-(\w+)\^\^([^-]+)\-\-\>/g,
            (a, not, type, val) => {

                const sym = <TokenSymbol>{ type, val };

                if (!syms.has(getUniqueSymbolName(sym)))
                    syms.set(getUniqueSymbolName(sym), { id: syms.size, sym });

                const id = syms.get(getUniqueSymbolName(sym)).id;

                return (not ? "!" : "") + `(${getIncludeBooleans([sym], grammar, runner, "__lex__z" + id)})`;
            }),
        sym_lu: TokenSymbol[] = [...syms.values()].map(_ => _.sym),
        receiver = { ast: null };

    for (const { node } of traverse(parser(txt).ast, "nodes", 1)
        .makeMutable().extract(receiver)) {
        processFunctionNodes(node, grammar, runner, sym_lu, first);
    }

    return { txt: renderWithFormatting(receiver.ast), first };
}

function processFunctionNodes(
    ast: JSNode,
    grammar: Grammar,
    runner: CompilerRunner,
    sym_lu: TokenSymbol[],
    first: TokenSymbol[] = [],
    lex_name_ptr = 0,
    lexer_name = ["l"],
    ALLOW_FIRST = true,
    HAS_TK = false
): { node: JSNode, HAS_TK: boolean; } {

    const receiver = { ast: null };

    for (const { node, meta: { parent, mutate, skip } } of traverse(ast, "nodes")
        .skipRoot()
        .makeMutable()
        .makeSkippable()
        .extract(receiver)) {

        switch (node.type) {
            case JSNodeType.IfStatement:
                if (node.nodes[2]) {
                    const _else_ = node.nodes[2];
                    node.nodes[2] = null;
                    HAS_TK = processFunctionNodes(
                        node,
                        grammar,
                        runner,
                        sym_lu,
                        first,
                        lex_name_ptr,
                        lexer_name,
                        ALLOW_FIRST,
                        HAS_TK
                    ).HAS_TK;
                    const { HAS_TK: tk, node: new_else_ } = processFunctionNodes(
                        _else_,
                        grammar,
                        runner,
                        sym_lu,
                        first,
                        lex_name_ptr,
                        lexer_name,
                        ALLOW_FIRST,
                        HAS_TK
                    );
                    HAS_TK = tk;
                    node.nodes[2] = new_else_;
                }
            case JSNodeType.WhileStatement:
            case JSNodeType.DoStatement:
            case JSNodeType.ForStatement:
                HAS_TK = processFunctionNodes(
                    node,
                    grammar,
                    runner,
                    sym_lu,
                    first,
                    lex_name_ptr,
                    lexer_name,
                    ALLOW_FIRST,
                    HAS_TK
                ).HAS_TK;
                skip();
                continue;
        }

        if (node.type & JSNodeClass.IDENTIFIER) {
            if ((<string>node.value).includes("__lex__z")) {
                if (ALLOW_FIRST) {
                    const id = +((<string>node.value).split("z")[1]);
                    first.push(sym_lu[id]);
                }
                node.value = lexer_name[lex_name_ptr];

            } else if (node.value[0] == "$")
                switch ((<string>node.value).slice(1)) {

                    case "next":
                        ALLOW_FIRST = false;
                        mutate(exp(`${lexer_name[lex_name_ptr]}.next()`));
                        break;

                    case "fork":
                        if (parent.type == JSNodeType.ExpressionStatement) {
                            const start = lex_name_ptr;
                            lex_name_ptr = lexer_name.length;
                            lexer_name[lex_name_ptr] = "pk" + lex_name_ptr;
                            mutate(stmt(`const ${lexer_name[lex_name_ptr]} = ${lexer_name[start]}.copy();`));
                        }
                        break;
                    case "join":
                        if (parent.type == JSNodeType.ExpressionStatement) {
                            mutate(exp(`${lexer_name[lex_name_ptr - 1]}.sync(${lexer_name[lex_name_ptr]})`));
                            lex_name_ptr = 0;
                        }
                        break;
                    case "abort_fork":
                        lex_name_ptr = Math.max(lex_name_ptr - 1, 0);
                        break;
                    case "abort_all_forks":
                        lex_name_ptr = 0;
                        break;
                    case "tk_start":
                        HAS_TK = true;
                        {
                            const start = lex_name_ptr;
                            lexer_name[++lex_name_ptr] = "pk" + lex_name_ptr;
                            mutate(stmt(`const ${lexer_name[lex_name_ptr]} = ${lexer_name[start]}.copy();`));
                        }
                        break;
                    case "tk_end":
                        if (HAS_TK) {
                            const prev = lexer_name[lex_name_ptr - 1],
                                curr = lexer_name[lex_name_ptr];
                            mutate(exp(`${prev}.tl = ${curr}.off - ${prev}.off`));
                            lex_name_ptr--;
                        }
                    // case "FOLLOW":
                    //     if (prod_id > -1 && runner) {
                    //         const symbols = [...FOLLOW(grammar, prod_id).values()];
                    //         const str = getIncludeBooleans(symbols, grammar, runner);
                    //         mutate(exp(`(${str || "false"})`));
                    //     }
                    //     break;
                    default:

                        if (node.value.includes("produce")) {

                            const
                                fn_name = node.value.split("_").slice(1).join("_"),
                                txt = grammar.functions.get(fn_name).txt;

                            if (!grammar.meta.reduce_functions.has(txt))
                                grammar.meta.reduce_functions.set(txt, grammar.meta.reduce_functions.size);

                            const id = grammar.meta.reduce_functions.get(txt);

                            const prev = lexer_name[lex_name_ptr - 1],
                                curr = lexer_name[lex_name_ptr];
                            mutate(exp(`add_shift(${prev}, ${curr}.off - ${prev}.off), ${prev}.sync(${curr}),${prev}.syncOffsetRegion(), add_reduce(1, ${id + 1}, true)`));
                            lex_name_ptr--;
                        }
                }
        }
    }
    return { node: receiver.ast, HAS_TK };
};
