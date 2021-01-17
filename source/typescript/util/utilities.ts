import { traverse } from "@candlefw/conflagrate";
import { exp, JSNode, JSNodeClass, JSNodeType, parser, stmt } from "@candlefw/js";
import { Lexer } from "@candlefw/wind";

import { EOF_SYM, Grammar, GrammarFunction, ProductionBody, SymbolType } from "../types/grammar.js";
import { Production } from "../types/production";
import {
    AssertionFunctionSymbol,
    EOFSymbol,
    GeneratedSymbol,
    ProductionSymbol,
    SpecifiedCharacterSymbol,
    SpecifiedIdentifierSymbol,
    SpecifiedNumericSymbol,
    SpecifiedSymbol,
    Symbol,
    TokenSymbol
} from "../types/symbol";
import { FOLLOW } from "./follow.js";
import { Item } from "./item.js";
import { getClosure } from "./get_closure.js";
import { Helper } from "../compiler/helper.js";
import { AS, ConstSC, ExprSC, SC, StmtSC, VarSC } from "./skribble.js";

export const rec_glob_lex_name = SC.Variable("l:Lexer");
/**
 * Recognizer function names
 */
export const rec_consume_call = SC.Variable("consume:void");

export const rec_consume_assert_call = SC.Variable("assert_consume:bool");

export const rec_state = SC.Variable("state:State");

export const rec_state_prod = SC.Member(rec_state, "prod:unsigned int");

export const TokenSpaceIdentifier = 1,
    TokenNumberIdentifier = 2,
    TokenIdentifierIdentifier = 4,
    TokenNewLineIdentifier = 8,
    TokenSymbolIdentifier = 16;

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
            fn: (item: T, array: T[]) => (KeyType | KeyType[])) => Map<KeyType, T[]>;

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
             * A function that should return a string or number, or an array of strings and/or numbers, 
             * that is used to determine which group(s) the object belongs to. Defaults to a function
             * that returns the string value of the object.
             */
            fn?: (item: T, array: T[]) => (KeyType | KeyType[])
        ) => T[][];
    }
}

Array.prototype.groupMap = function <T, KeyType>(
    this: Array<T>,
    fn: (T, G: T[]) => (KeyType | KeyType[])
): Map<KeyType, T[]> {

    const groups: Map<KeyType, T[]> = new Map;

    this.forEach(e => {

        const id = fn(e, this);

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


Array.prototype.group = function <T, KeyType>(this: Array<T>, fn: (T, G: T[]) => (KeyType | KeyType[]) = _ => _ ? _.toString() : ""): T[][] {
    return [...this.groupMap(fn).values()];
};

export function isSymAProduction(s: Symbol): s is ProductionSymbol {
    return s.type == SymbolType.PRODUCTION;
}

export function isSymAnAssertFunction(s: Symbol): s is AssertionFunctionSymbol {
    return s.type == SymbolType.PRODUCTION_ASSERTION_FUNCTION;
}

export function isSymAGenericType(s: Symbol): s is (GeneratedSymbol | EOFSymbol) {
    return (s.type == SymbolType.GENERATED || s.type == SymbolType.END_OF_FILE);
}

/**
 * Any symbol that is not Generated, an AssertFunction, or a Production
 * @param s 
 */
export function isSymSpecified(s: Symbol): s is SpecifiedSymbol {
    return !isSymAProduction(s) && !isSymAGenericType(s) && !isSymAnAssertFunction(s);
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
    const lex = new Lexer(sym.val);
    return lex.ty == lex.types.num && lex.pk.END;
}
export function isSymNotNumeric(sym: TokenSymbol): boolean {
    return !isSymNumeric(sym);
}
export function isSymIdentifier(sym: TokenSymbol): sym is SpecifiedIdentifierSymbol {
    const lex = new Lexer(sym.val);
    return lex.ty == lex.types.id && lex.pk.END;
}
export function isSymNotIdentifier(sym: TokenSymbol): boolean {
    return !isSymIdentifier(sym);
}
export function isSymLengthOneDefined(sym: TokenSymbol) {

    if (sym.val.length > 1) return false;

    const lex = new Lexer(sym.val);

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

export function getSkipFunctionNew(
    skip_symbols: TokenSymbol[],
    grammar: Grammar,
    runner: Helper,
    custom_skip_code: SC = null,
    lex_name: ExprSC = SC.Variable("l", "Lexer"),
    exclude: TokenSymbol[] = []
):
    VarSC {

    if (skip_symbols.length == 0)
        return null;

    const boolean = getIncludeBooleans(skip_symbols, grammar, runner, rec_glob_lex_name, exclude);

    if (grammar.functions.has("custom_skip")) {
        let str = grammar.functions.get("custom_skip").txt;
        const sc = convertAssertionFunctionBodyToSkribble(str, grammar, runner).sc;
        custom_skip_code = new SC().addStatement(...sc.statements);
    }

    const skip_function =
        SC.Function(
            ":Lexer",
            "l:Lexer&"
        ).addStatement(
            SC.While(SC.Value(1)).addStatement(
                custom_skip_code ? custom_skip_code : SC.Empty(),
                SC.If(SC.UnaryPre("!", SC.Group("(", boolean)))
                    .addStatement(SC.Break),
                SC.Call(SC.Member("l", "next")),
            ),
            SC.UnaryPre(SC.Return, SC.Value("l"))
        );

    const hash = skip_function.hash();

    const SF_name = SC.Constant(`skip_fn_:Lexer`);

    const FN = SC.Function(":bool", "l:Lexer").addStatement(SC.UnaryPre(SC.Return, SC.Group("(", boolean)));

    return <VarSC>runner.add_constant(SF_name, skip_function);
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
};
export function addSkipCallNew(
    symbols: TokenSymbol[],
    grammar: Grammar,
    runner: Helper,
    lex_name: ExprSC = SC.Variable("l", "Lexer"),
    exclude: TokenSymbol[] = []
): StmtSC {
    const skips = getSkipFunctionNew(symbols, grammar, runner, undefined, lex_name, exclude);
    if (skips)
        return SC.Expressions(SC.Call(skips, SC.UnaryPost(lex_name, SC.Comment(symbols.map(s => `[ ${s.val} ]`).join("")))));
    return SC.Expressions(SC.Empty());
}
export function createAssertionShift(grammar: Grammar, runner: Helper, sym: TokenSymbol, lex_name: ConstSC | VarSC = SC.Variable("l:Lexer")): ExprSC {
    return createAssertionShiftManual(lex_name, getIncludeBooleans([sym], grammar, runner, lex_name));

}
export function createAssertionShiftManual(lex_name: ConstSC | VarSC = SC.Variable("l:Lexer"), boolean: ExprSC): ExprSC {
    return SC.Call(rec_consume_assert_call, lex_name, rec_state, boolean);
}
export function createNoCheckShift(grammar: Grammar, runner: Helper, lex_name: ConstSC | VarSC,): StmtSC {
    return SC.Expressions(SC.Call(rec_consume_call, lex_name));
}

export function createReduceFunction(item: Item, grammar: Grammar): StmtSC {
    return SC.Expressions(SC.Call(SC.Constant("add_reduce"), rec_state, SC.Value(item.len + ""), SC.Value((item.body_(grammar).reduce_id + 1) + "")));
}

export function createDefaultReduceFunction(item: Item): StmtSC {
    return SC.Expressions(SC.Call(SC.Constant("add_reduce"), rec_state, SC.Value(item.len + ""), SC.Value("0")));
}

export function getUniqueSymbolName(sym: Symbol) {
    if (!sym) return "";
    return sym.val + sym.type + (sym.DOES_SHIFT ? "----" : "");
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

export function getAssertionFunctionName(name: string) {
    return `__${name}__`;
}

export function translateSymbolValue(sym: TokenSymbol, grammar: Grammar, lex_name: ConstSC | VarSC = SC.Variable("l:Lexer")): ExprSC {

    const
        char_len = sym.val.length,
        annotation = SC.Comment(`[${sanitizeSymbolValForComment(sym)}]`);

    if (sym.type == SymbolType.END_OF_FILE || sym.val == "END_OF_FILE")
        return SC.Call(SC.Member(lex_name, "END"));//`${lex_name}.END` + (ANNOTATED ? "/* EOF */" : "");

    switch (sym.type) {
        case SymbolType.PRODUCTION_ASSERTION_FUNCTION:
            if (sym.DOES_SHIFT)
                return SC.Call(SC.Value(getAssertionFunctionName(sym.val)), lex_name);// `${getAssertionFunctionName(sym.val)}(${lex_name})`;
            else
                return SC.Call(SC.Value(getAssertionFunctionName(sym.val)), lex_name);// `${getAssertionFunctionName(sym.val)}(${lex_name})`;

        case SymbolType.GENERATED:
            switch (sym.val) {
                case "ws": return SC.UnaryPost(SC.Call(SC.Member(lex_name, SC.Constant("isSP"))), annotation);//`${lex_name}.isSP()` + annotation;
                case "num": return SC.UnaryPost(SC.Call(SC.Member(lex_name, SC.Constant("isNum"))), annotation);// `${lex_name}.isNUM()` + annotation;
                case "id": return SC.UnaryPost(SC.Call(SC.Member(lex_name, SC.Constant("isID"))), annotation);// `${lex_name}.isID()` + annotation;
                case "nl": return SC.UnaryPost(SC.Call(SC.Member(lex_name, SC.Constant("isNL"))), annotation);// `${lex_name}.isNL()` + annotation;
                case "sym": return SC.UnaryPost(SC.Call(SC.Member(lex_name, SC.Constant("isSym"))), annotation);// `${lex_name}.isSYM()` + annotation;
                default: return SC.False;// + annotation;
            }
        case SymbolType.LITERAL:
        case SymbolType.ESCAPED:
        case SymbolType.SYMBOL:
            if (char_len == 1) {
                return SC.UnaryPost(SC.Value(sym.val.codePointAt(0) + ""), annotation);//sym.val.codePointAt(0) + (ANNOTATED ? `/*${sym.val + ":" + sym.val.codePointAt(0)}*/` : "");
            } else {
                return SC.UnaryPost(SC.Value(sym.id + ""), annotation);// + annotation;
            }
        case SymbolType.EMPTY:
            return SC.Empty();
    }
}

export function sanitizeSymbolValForComment(sym: string | TokenSymbol): string {
    if (typeof sym == "string")
        return sym.replace(/\*/g, "asterisk");
    return sym.val.replace(/\*/g, "asterisk");
}

export function buildIfs(
    syms: TokenSymbol[],
    lex_name: ConstSC | VarSC = SC.Variable("l:Lexer"),
    USE_LOOKAHEAD = false,
    off = 0,
    USE_MAX = false,
    token_val = "TokenSymbol",
    //Create a negative assertion for tokens following the expected tokens
): SC {

    let HAS_VAL = false;
    const code_node = new SC;
    const lex_get_utf = SC.Member(lex_name, "getUTF");
    const declaration = SC.Declare(
        SC.Assignment("ACCEPT:bool", "false"),
    );

    if (off == 0)
        code_node.addStatement(declaration)
            ;

    for (const sym of syms) {
        if ((<string>sym.val).length <= off) {
            code_node.addStatement(
                SC.Assignment(SC.Member(lex_name, "ty"), "TokenSymbol"),
                SC.Assignment(SC.Member(lex_name, "tl"), off),
                SC.Assignment("ACCEPT", "true"),
            );
        }
    }

    if (syms.length == 1 && syms[0].val.length > off) {
        const
            str = syms[0].val, l = str.length - off,

            booleans = str
                .slice(off)
                .split("")
                .reverse()
                .map((v, i) => SC.Binary(SC.Call(lex_get_utf, off + l - i - 1), "==", v.codePointAt(0)))
                .reduce((r, a) => { if (!r) return a; return SC.Binary(r, "&&", a); }, null),

            check_sequence =
                USE_LOOKAHEAD && isSymSpecifiedIdentifier(syms[0])
                    ? SC.Binary(SC.Binary(SC.Call(SC.Member(lex_name, "typeAt"), off + l), "!=", "TokenIdentifier"), "&&", booleans)
                    : booleans;

        code_node.addStatement(
            SC.If(check_sequence)
                .addStatement(buildIfs(syms, lex_name, USE_LOOKAHEAD, off + l, USE_MAX, token_val), SC.Empty())
        );
    } else {
        let first = true;
        const groups = syms.filter(s => (<string>s.val).length > off).group(s => s.val[off]);
        let leaf = code_node;

        if (!HAS_VAL)
            declaration.expressions.push(SC.Assignment("val:unsigned int", 0));

        for (const group of groups) {
            if (first && groups.length > 1) code_node.addStatement(SC.Assignment("val", SC.Call(lex_get_utf, off)));
            first = false;
            const
                v = group[0].val[off],
                _if = SC.If(SC.Binary(groups.length == 1 ? SC.Call(lex_get_utf, off) : "val", "==", v.codePointAt(0)))
                    .addStatement(buildIfs(group, lex_name, USE_LOOKAHEAD, off + 1, USE_MAX, token_val));

            leaf.addStatement(_if);
            leaf = _if;
        };
        leaf.addStatement(SC.Empty());

    }

    if (off == 0) code_node.addStatement(SC.UnaryPre(SC.Return, SC.Variable("ACCEPT")));

    return code_node;
}
/**
 * Build a boolean code sequence that compares the current lexer state with 
 * expected tokens that will resolve to true if at least one token can be matched to 
 * the input at the lexer offset. 
 * @param syms 
 * @param grammar 
 * @param runner 
 * @param lex_name 
 * @param exclude_symbols 
 */
export function getIncludeBooleans(
    syms: TokenSymbol[],
    grammar: Grammar,
    runner: Helper,
    lex_name: ConstSC | VarSC = SC.Variable("l:Lexer"),
    /* List of all symbols that can be encountered*/
    symbol_pool: TokenSymbol[] = [],
): ExprSC {

    syms = syms.setFilter(s => getUniqueSymbolName(s));

    //const exclusion_list = new Set(exclude_symbols.map(getUniqueSymbolName));

    //syms = syms.filter(sym => !exclusion_list.has(getUniqueSymbolName(sym))).map(s => getRootSym(s, grammar));

    let
        id = syms.filter(isSymSpecified),
        ty = syms.filter(isSymAGenericType),
        fn = syms.filter(isSymAnAssertFunction)
            .map(s => translateSymbolValue(s, grammar, lex_name)).sort();

    const HAS_GEN_ID = ty.some(isSymGeneratedId);

    if (HAS_GEN_ID)
        id = id.filter(isSymNotIdentifier);

    if (ty.some(isSymGeneratedSym))
        id = id.filter(isSymNotLengthOneDefined);

    if (id.length + ty.length + fn.length == 0)
        return null;

    let out_id: ExprSC[] = [], out_ty: ExprSC[] = [], out_fn: ExprSC[] = [];

    if (fn.length > 0)
        out_fn = fn;

    if (id.length > 0) {

        const booleans = [], char_groups = id.groupMap(sym => sym.val[0]),
            SHOULD_LOOK_AHEAD = HAS_GEN_ID || symbol_pool.some(isSymGeneratedId);

        let table = 0n, tbl_ids = [];

        for (const group of char_groups.values()) {
            if (group.some(sym => sym.val.length > 1 || (isSymIdentifier(sym) && SHOULD_LOOK_AHEAD))) {

                const
                    fn_lex_name = SC.Constant("l:Lexer"),
                    fn = SC.Function(":boolean", fn_lex_name).addStatement(buildIfs(group, fn_lex_name, SHOULD_LOOK_AHEAD)),
                    node_name = SC.Constant(`cp${fn.hash().slice(0, 8)}_:bool`),
                    fn_name = runner.add_constant(node_name, fn);

                booleans.push(SC.UnaryPost(SC.Call(fn_name, lex_name), SC.Comment(group.map(sym => `[${sanitizeSymbolValForComment(sym)}]`).join(" "))));
            } else {
                for (const sym of group) {
                    const code = sym.val.codePointAt(0);
                    if ((code < 128) && char_groups.size > 1) {
                        tbl_ids.push(sym.val);
                        table |= 1n << BigInt(code);
                    } else {
                        booleans.push(SC.Binary(
                            SC.Member(lex_name, "utf"),
                            SC.Value("=="),
                            translateSymbolValue(sym, grammar, lex_name)
                        ));
                    }
                }
            }
        }

        if (table > 0n) {
            booleans.push(
                SC.UnaryPost(SC.Call("assert_table", lex_name,
                    "0x" + ((table >> 0n) & 0xFFFFFFFFn).toString(16),
                    "0x" + ((table >> 32n) & 0xFFFFFFFFn).toString(16),
                    "0x" + ((table >> 64n) & 0xFFFFFFFFn).toString(16),
                    "0x" + ((table >> 96n) & 0xFFFFFFFFn).toString(16),
                ), SC.Comment("tbl:" + tbl_ids.map(d => `[ ${d} ]`).join(" "))
                )
            );
        }

        out_id = booleans;
    }

    if (ty.length > 0)
        out_ty = ty.map(s => translateSymbolValue(s, grammar, lex_name));

    return ([...out_id, ...out_ty, ...out_fn].filter(_ => _).reduce((r, s) => {
        if (!r) return s;
        return SC.Binary(r, SC.Value("||"), s);
    }, null));
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

export function has_INLINE_FUNCTIONS(body: ProductionBody): boolean {
    return body.functions.length > 0;
}

export function addRecoveryHandlerToFunctionBodyArray(
    stmts: any[],
    production: Production,
    grammar: Grammar,
    runner: Helper,
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
        ${convertAssertionFunctionBodyToSkribble(production.recovery_handler.lexer_text, grammar, runner)}
        //Skipped Symbols
        add_shift(l.off - start);
        //Consume the end symbol of the production
        ${createNoCheckShift(grammar, runner, "l")};
        
        add_reduce(stack_ptr - sp${RECURSIVE_DESCENT ? "" : ""} - 1, ${1 + production.recovery_handler.reduce_id});
        
        setProduction(${production.id});
    `);
}

export function generateCompiledAssertionFunction(sym: AssertionFunctionSymbol, grammar: Grammar, runner: Helper):
    GrammarFunction {
    const fn_name = sym.val;
    const fn = grammar.functions.get(fn_name);
    if (fn && !fn.assemblyscript_txt) {
        const { sc: txt, first } = convertAssertionFunctionBodyToSkribble(fn.txt, grammar, runner);
        fn.assemblyscript_txt = txt;
        fn.first = first;
    }
    return fn;
}

export function getAssertionSymbolFirst(sym: AssertionFunctionSymbol, grammar: Grammar): TokenSymbol[] {
    const fn = generateCompiledAssertionFunction(sym, grammar, <Helper>{ ANNOTATED: false, add_constant: (name) => { return name; } });
    if (fn)
        return fn.first;
    else return [];
};

export function getProductionClosure(production_id: number, grammar: Grammar) {
    const prod = grammar[production_id];
    return getClosure(prod.bodies.map(b => new Item(b.id, b.length, 0, EOF_SYM)), grammar);
}

export function getProductionFirst(production_id: number, grammar: Grammar) {
    const closure = getProductionClosure(production_id, grammar);
    const syms = closure.filter(i => !i.atEND && !isSymAProduction(i.sym(grammar)))
        .flatMap(i => getTrueSymbolValue(<TokenSymbol>i.sym(grammar), grammar))
        .setFilter(getUniqueSymbolName);

    return syms;
}


export function getTrueSymbolValue(sym: TokenSymbol, grammar: Grammar): TokenSymbol[] {
    if (isSymAnAssertFunction(sym)) {
        const val = grammar.functions.get(sym.val);
        const { first } = getAssertionFunctionData(val.txt, grammar);
        return first;
    }
    return [<TokenSymbol>sym];
}

export function doesProductionHaveEmpty(production_id: number, grammar: Grammar) {
    return getProductionClosure(production_id, grammar).some(i => i.len == 0 || (i.len == 1 && i.offset == 0 && i.sym(grammar).type == SymbolType.EMPTY));
}


export function getAssertionFunctionData(af_body_content: string, grammar: Grammar): { first: TokenSymbol[]; ast: JSNode; rev_lu: { id: number, sym: TokenSymbol; }[]; } {
    const
        rev_lu: { id: number, sym: TokenSymbol; }[] = [],
        syms: Map<string, { id: number, sym: TokenSymbol; }> = new Map(),
        first = [],
        // Replace symbol placeholders
        txt = (<string>af_body_content).replace(/(\!)?\<\-\-(\w+)\^\^([^-]+)\-\-\>/g,
            (a, not, type, val) => {

                const sym = <TokenSymbol>{ type, val };

                if (!syms.has(getUniqueSymbolName(sym))) {
                    const obj = { id: syms.size, sym };
                    syms.set(getUniqueSymbolName(sym), obj);
                    rev_lu.push(obj);
                }

                const id = syms.get(getUniqueSymbolName(sym)).id;

                return (not ? "!" : "") + `(${"__sym__z" + id})`;
            }),
        sym_lu: TokenSymbol[] = [...syms.values()].map(_ => _.sym),
        receiver = { ast: null };


    for (const { node } of traverse(parser(txt).ast, "nodes", 1)
        .makeMutable().extract(receiver)) {
        processFunctionNodes(node, grammar, sym_lu, first);
    }

    return { first, ast: receiver.ast, rev_lu };
}

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
export function convertAssertionFunctionBodyToSkribble(af_body_content: string, grammar: Grammar, runner: Helper)
    : { sc: SC, first: TokenSymbol[]; } {

    const { ast, first, rev_lu } = getAssertionFunctionData(af_body_content, grammar);
    const sc = convertToSkribble(ast);

    sc.modifyIdentifiers(i => {
        const str = i.value;

        if (str.slice(0, 2) == "pk") {
            return SC.Variable(str + ":Lexer");
        }

        if (str.includes("__sym__z")) {
            const [sym_id, lex_name] = str.replace("__sym__z", "").split("_");
            const { sym } = rev_lu[+sym_id];
            return getIncludeBooleans([sym], grammar, runner, SC.Variable(lex_name + ":Lexer"));
        }

    });

    return { sc: sc, first };
}


function convertToSkribble(node: JSNode, i = 0, v = [], USE_CONSTANT = false): SC<any> {
    if (node) {
        const { nodes } = node;
        const [n1, n2, n3] = nodes ?? [];
        switch (node.type) {
            case JSNodeType.NumericLiteral:
            case JSNodeType.NullLiteral:
            case JSNodeType.BooleanLiteral:
            case JSNodeType.StringLiteral:
                return SC.Value(node.value + "");
            case JSNodeType.MemberExpression:
                return SC.Member(convertToSkribble(n1), convertToSkribble(n2));
            case JSNodeType.ThisLiteral:
                return SC.Value("this");
            case JSNodeType.BindingExpression:
            case JSNodeType.AssignmentExpression:
                return SC.Assignment(convertToSkribble(n1), convertToSkribble(n2));
            case JSNodeType.LexicalDeclaration:
                if (node.symbol == "const")
                    return SC.Declare(...nodes.map(n => convertToSkribble(n, null, null, true)));
            case JSNodeType.VariableStatement:
            case JSNodeType.VariableDeclaration:

                return SC.Declare(...nodes.map(convertToSkribble));
            case JSNodeType.Identifier:
            case JSNodeType.IdentifierBinding:
            case JSNodeType.IdentifierDefault:
            case JSNodeType.IdentifierLabel:
            case JSNodeType.IdentifierModule:
            case JSNodeType.IdentifierName:
            case JSNodeType.IdentifierReference:
            case JSNodeType.IdentifierProperty:
                return SC[USE_CONSTANT ? "Constant" : "Variable"]((node.value + "").trim());
            case JSNodeType.Parenthesized:
                return SC.Group("(", ...nodes.filter(_ => !!_).map(convertToSkribble));
            case JSNodeType.CallExpression:
                return SC.Call(convertToSkribble(n1), ...n2.nodes.map(convertToSkribble));
            case JSNodeType.BreakStatement:
                return SC.Break;
            case JSNodeType.ReturnStatement:
                if (n1)
                    return SC.UnaryPre(SC.Return, convertToSkribble(n1));
                return SC.Return;
            case JSNodeType.SwitchStatement:
                return SC.Switch(convertToSkribble(n1))
                    .addStatement(
                        ...nodes.slice(1)
                            .map(n1 => convertToSkribble(
                                Object.assign(n1, { type: JSNodeType.IfStatement }))
                            )
                    );
            case JSNodeType.BlockStatement:
                return SC.If()
                    .addStatement(...nodes.map(convertToSkribble), SC.Empty());
            case JSNodeType.WhileStatement:
                return SC.While(convertToSkribble(n1))
                    .addStatement(...nodes.slice(1).map(convertToSkribble));
            case JSNodeType.IfStatement:
                return SC.If(convertToSkribble(n1))
                    .addStatement(
                        ...(n2.type == JSNodeType.BlockStatement ? n2.nodes.map(convertToSkribble) : [convertToSkribble(n2)]),
                        n3 ? n3?.type == JSNodeType.IfStatement ? convertToSkribble(n3) : SC.If().addStatement(convertToSkribble(n3)) : SC.Empty(),
                    );
            case JSNodeType.PostExpression:
                SC.UnaryPost(convertToSkribble(n1), node.symbol);
            case JSNodeType.PreExpression:
            case JSNodeType.UnaryExpression:
                return SC.UnaryPre(node.symbol, convertToSkribble(n1));
            case JSNodeType.LogicalExpression:
            case JSNodeType.BitwiseExpression:
            case JSNodeType.MultiplicativeExpression:
            case JSNodeType.AdditiveExpression:
            case JSNodeType.EqualityExpression:
                return SC.Binary(convertToSkribble(n1), node.symbol, convertToSkribble(n2));
            case JSNodeType.FunctionDeclaration:
            case JSNodeType.FunctionExpression:
            case JSNodeType.Method:
                return SC.Function(convertToSkribble(n1), ...(n2.nodes || []).map(convertToSkribble))
                    .addStatement(...(n3.nodes || []).map(convertToSkribble));
            case JSNodeType.ExpressionStatement:
                return SC.Expressions(...nodes.map(convertToSkribble));
            case JSNodeType.Script:
            case JSNodeType.Module:
                return (new SC).addStatement(...nodes.map(convertToSkribble));
        }
    }

    return null;
}

function processFunctionNodes(
    ast: JSNode,
    grammar: Grammar,
    sym_lu: TokenSymbol[],
    first: TokenSymbol[] = [],
    lex_name_ptr = 0,
    lexer_name = ["l"],
    ALLOW_FIRST = true,
    HAS_TK = false
): { node: JSNode, HAS_TK: boolean; } {
    //Convert JS to Skribble
    //If + else + while +

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
            if ((<string>node.value).includes("__sym__z")) {
                if (ALLOW_FIRST) {
                    const id = +((<string>node.value).split("z")[1]);
                    first.push(sym_lu[id]);
                }
                node.value += "_" + lexer_name[lex_name_ptr];

            } else if (node.value[0] == "$")
                switch ((<string>node.value).slice(1)) {
                    /**
                     * Advance the active lexer to the next token
                     */
                    case "next":
                        ALLOW_FIRST = false;
                        mutate(exp(`${lexer_name[lex_name_ptr]}.next()`));
                        break;
                    /**
                     * Create copy the active lexer and set the copy as the active lexer
                     */
                    case "fork":
                        if (parent.type == JSNodeType.ExpressionStatement) {
                            const start = lex_name_ptr;
                            lex_name_ptr = lexer_name.length;
                            lexer_name[lex_name_ptr] = "pk" + lex_name_ptr;
                            mutate(stmt(`const ${lexer_name[lex_name_ptr]} = ${lexer_name[start]}.copy();`));
                        }
                        break;
                    /**
                     * Merge the currently forked lexer with its originating lexer. The originating lexer
                     * then becomes the active lexer.
                     */
                    case "join":
                        if (parent.type == JSNodeType.ExpressionStatement) {
                            mutate(exp(`${lexer_name[lex_name_ptr - 1]}.sync(${lexer_name[lex_name_ptr]})`));
                            lex_name_ptr = 0;
                        }
                        break;
                    /**
                     * Reset the active lexer to the originating lexer, discarding any progress made
                     * with the forked lexer
                     */
                    case "discard":
                        lex_name_ptr = Math.max(lex_name_ptr - 1, 0);
                        break;
                    /**
                     * Reset the active lexer to the first originating lexer, discarding any progress made
                     * with all forked lexers
                     */
                    case "discard_all":
                        lex_name_ptr = 0;
                        break;

                    /**
                     * Set the current offset position as the beginning of a token
                     */
                    case "tk_start":
                        HAS_TK = true;
                        {
                            const start = lex_name_ptr;
                            lexer_name[++lex_name_ptr] = "pk" + lex_name_ptr;
                            mutate(stmt(`const ${lexer_name[lex_name_ptr]} = ${lexer_name[start]}.copy();`));
                        }
                        break;

                    /**
                     * Set the token length of the active token to offset - tk_start_offset
                     */
                    case "tk_end":
                        if (HAS_TK) {
                            const prev = lexer_name[lex_name_ptr - 1],
                                curr = lexer_name[lex_name_ptr];
                            mutate(exp(`${prev}.tl = ${curr}.off - ${prev}.off`));
                            lex_name_ptr--;
                        }
                    /**
                     * Consume any characters that have been skipped and also and the current token 
                     */
                    case "consume":
                        mutate(exp(`consume(${lexer_name[lex_name_ptr]})`));
                        break;
                    /**
                     * Consume any characters that have been skipped and also a zero length token
                     * The current lexer state remains unchanged
                     */
                    case "empty_consume":
                        mutate(exp(`consume_empty(${lexer_name[lex_name_ptr]})`));
                        break;
                    /**
                     * Accept the current token and return true
                     */
                    case "true":
                        mutate(stmt("return true;"));
                        break;
                    /**
                     * Accept the current token and return true
                     */
                    case "false":
                        mutate(stmt("return false;"));
                        break;

                    /**
                     * Zero out the length of the current token
                     */
                    case "zero":
                        mutate(exp(`${lexer_name[lex_name_ptr]}.tl = 0`));
                        break;

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


export function getAccompanyingItems(grammar: Grammar, active_productions: number[], items: Item[], out: Item[] = [], all = false) {

    const prod_id = new Set(active_productions);

    const to_process = [];

    for (const item of items.reverse()) {
        if (!item || item.atEND) continue;

        const sym = item.sym(grammar);
        if (isSymAProduction(sym) && prod_id.has(<number>sym.val)) {

            out.push(item);
            if (item.increment().atEND) {
                to_process.push(item);
            }
        }
    }
    if (all)
        for (const item of to_process) {
            getAccompanyingItems(grammar, item.getProduction(grammar).id, items, out, all);
        }
    return out;
}


export function doItemsHaveSameSymbol(items: Item[], grammar: Grammar) {
    return items.every(i => !i.atEND && i.sym(grammar).val == items[0].sym(grammar).val);
}

export function itemsToProductions(items: Item[], grammar: Grammar): number[] {
    return items.map(i => i.getProduction(grammar).id);
}