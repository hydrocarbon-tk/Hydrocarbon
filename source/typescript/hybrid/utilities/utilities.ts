import { traverse } from "@candlefw/conflagrate";
import { exp, JSNode, JSNodeClass, JSNodeType, parser, stmt } from "@candlefw/js";
import { Lexer } from "@candlefw/wind";

import { Grammar, GrammarFunction, Production, ProductionBody, SymbolType } from "../../types/grammar.js";
import { AssertionFunctionSymbol, EOFSymbol, GeneratedSymbol, ProductionSymbol, SpecifiedCharacterSymbol, SpecifiedIdentifierSymbol, SpecifiedNumericSymbol, SpecifiedSymbol, Symbol, TokenSymbol } from "../../types/Symbol";
import { Item } from "../../util/item.js";
import { CompilerRunner } from "../types/CompilerRunner.js";
import { AS, ConstSC, ExprSC, SC, StmtSC, VarSC } from "./skribble.js";


/**
 * Function names
 */
export const consume_call = SC.Variable("consume:void");
export const consume_skip_call = SC.Variable("consume_skip:void");
/**
 * Consume With Assert and skip call signature
 */
export const consume_assert_skip_call = SC.Variable("consume_assert_skip:void");

export const consume_assert_call = SC.Variable("consume_assert:void");

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
    //  console.log({ lex: lex.str, bool: !(lex.ty == lex.types.id || lex.ty == lex.types.num) });
    return !(lex.ty == lex.types.id || lex.ty == lex.types.num);
}
export function isSymNotLengthOneDefined(sym: TokenSymbol): boolean {
    return !isSymLengthOneDefined(sym);
}
export function isSymGeneratedNL(sym: TokenSymbol) { return sym.val == "nl"; }
export function isSymGeneratedId(sym: TokenSymbol) { return sym.val == "id"; }
export function isSymGeneratedSym(sym: TokenSymbol) { return sym.val == "sym"; }
export function isSymGeneratedNum(sym: TokenSymbol) { return sym.val == "num"; }
export function isSymGeneratedWS(sym: TokenSymbol): boolean { return sym.val == "ws"; }
export function getRDFNName(production: Production) { return `$${production.name}`; }

export function addSkipCall(grammar: Grammar, runner: CompilerRunner, exclude_set: TokenSymbol[] | Set<string> = new Set, lex_name: ConstSC | VarSC = SC.Variable("l", "Lexer")): StmtSC {
    const skips = getSkipFunction(grammar, runner, exclude_set);
    if (skips)
        return SC.Expressions(SC.Call(SC.Constant("_skip"), lex_name, skips));//`_skip(${lex_name}, ${skips})`;
    return SC.Expressions(SC.Empty());
}

export function createAssertionShiftWithSkip(grammar: Grammar,
    runner: CompilerRunner,
    sym: TokenSymbol,
    lex_name: ConstSC | VarSC = SC.Variable("l:Lexer"),
    exclude_set: TokenSymbol[] | Set<string> = new Set
): StmtSC {
    const skip = getSkipFunction(grammar, runner, exclude_set);

    if (skip)
        SC.Expressions(SC.Call(consume_skip_call, lex_name, getIncludeBooleans([sym], grammar, runner)));
    else
        return createAssertionShift(grammar, runner, sym, lex_name);
}

export function createNoCheckShiftWithSkip(grammar: Grammar, runner: CompilerRunner, lex_name: ConstSC | VarSC = SC.Variable("l:Lexer"), exclude_set: TokenSymbol[] | Set<string> = new Set): StmtSC {
    const skip = getSkipFunction(grammar, runner, exclude_set);
    if (skip)
        return SC.Expressions(SC.Call(consume_skip_call, lex_name, skip));
    else
        return createNoCheckShift(grammar, runner, lex_name);
}

export function createSkipCall(grammar: Grammar, runner: CompilerRunner, lex_name: ConstSC | VarSC = SC.Variable("l:Lexer"), exclude_set: TokenSymbol[] | Set<string> = new Set): SC {
    const skip = getSkipFunction(grammar, runner, exclude_set);
    if (skip)
        return SC.Call(SC.Constant("_skip"), lex_name, skip);
    else
        return lex_name;

}

export function createAssertionShift(grammar: Grammar, runner: CompilerRunner, sym: TokenSymbol, lex_name: ConstSC | VarSC = SC.Variable("l:Lexer")): StmtSC {
    return SC.Expressions(SC.Call(consume_assert_call, lex_name, getIncludeBooleans([sym], grammar, runner, lex_name)));
}

export function createNoCheckShift(grammar: Grammar, runner: CompilerRunner, lex_name: ConstSC | VarSC,): StmtSC {
    return SC.Expressions(SC.Call(consume_call, lex_name));
}

export function createReduceFunction(item: Item, grammar: Grammar): StmtSC {
    return SC.Expressions(SC.Call(SC.Constant("add_reduce"), SC.Value(item.len + ""), SC.Value((item.body_(grammar).reduce_id + 1) + "")));
}

export function createDefaultReduceFunction(item: Item): StmtSC {
    return SC.Expressions(SC.Call(SC.Constant("add_reduce"), SC.Value(item.len + ""), SC.Value("0")));
}

export function getUniqueSymbolName(sym: Symbol) {
    if (!sym) return "";
    return sym.val + sym.type + (sym.DOES_SHIFT ? "----" : "");
}

export function getSymbolFromUniqueName(grammar: Grammar, name: string): Symbol {
    return grammar.meta.all_symbols.get(name);
}
export function getSkipFunction(grammar: Grammar, runner: CompilerRunner, exclude: Set<string> | TokenSymbol[] = new Set):
    ExprSC {
    const exclude_set: Set<string> = Array.isArray(exclude) ? new Set(exclude.map(e => getUniqueSymbolName(e))) : exclude;
    const skip_symbols: TokenSymbol[] = grammar.meta.ignore.flatMap(d => d.symbols)
        .map(s => getRootSym(s, grammar))
        .setFilter(s => s.val)
        .filter(s => !exclude_set.has(getUniqueSymbolName(s)));

    if (skip_symbols.length == 0)
        return null;

    const SF_name = SC.Constant("skip_fn:bool");

    const FN = SC.Function(":bool", "l:Lexer").addStatement(SC.UnaryPre(SC.Return, SC.Group("(", getIncludeBooleans(skip_symbols, grammar, runner))));

    return runner.add_constant(SF_name, FN);
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

export function translateSymbolValue(sym: TokenSymbol, grammar: Grammar, ANNOTATED: boolean = false, lex_name: ConstSC | VarSC = SC.Variable("l:Lexer")): ExprSC {

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
                return SC.Call(SC.Member(lex_name, SC.Constant("isSP")));// `${getAssertionFunctionName(sym.val)}(${lex_name}.copy())`;

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
                if (!sym.id) sym = getRootSym(sym, grammar);
                if (!sym.id) console.log({ sym });
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

export function buildIfs(syms: TokenSymbol[], lex_name: ConstSC | VarSC = SC.Variable("l:Lexer"), off = 0, USE_MAX = false, token_val = "TokenSymbol"): SC {

    const code_node = new SC;
    const lex_get_utf = SC.Member(lex_name, "getUTF");


    if (off == 0)
        code_node.addStatement(SC.Declare(SC.Assignment("ACCEPT:bool", "false"), SC.Assignment("val:unsigned int", 0)));

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

            initial_check = SC.Binary(SC.Call(SC.Member(lex_name, "typeAt"), off + l), "!=", "TokenIdentifier");

        code_node.addStatement(
            SC.If(isSymSpecifiedIdentifier(syms[0]) ? SC.Binary(initial_check, "&&", booleans) : booleans)
                .addStatement(buildIfs(syms, lex_name, off + l, USE_MAX, token_val), SC.Empty())
        );
    } else {
        let first = true;
        const groups = syms.filter(s => (<string>s.val).length > off).group(s => s.val[off]);
        let leaf = code_node;
        for (const group of groups) {
            if (first && groups.length > 1) code_node.addStatement(SC.Assignment("val", SC.Call(lex_get_utf, off)));
            first = false;
            const
                v = group[0].val[off],
                _if = SC.If(SC.Binary(groups.length == 1 ? SC.Call(lex_get_utf, off) : "val", "==", v.codePointAt(0)))
                    .addStatement(buildIfs(group, lex_name, off + 1, USE_MAX, token_val));

            leaf.addStatement(_if);
            leaf = _if;
        };
        leaf.addStatement(SC.Empty());

    }

    if (off == 0) code_node.addStatement(SC.UnaryPre(SC.Return, SC.Variable("ACCEPT")));

    return code_node;
}

export function getIncludeBooleans(syms: TokenSymbol[],
    grammar: Grammar,
    runner: CompilerRunner,
    lex_name: ConstSC | VarSC = SC.Variable("l:Lexer"),
    exclude_symbols: TokenSymbol[] = [],
    optimize = true
): ExprSC {

    syms = syms.setFilter(s => getUniqueSymbolName(s));

    if (syms.some(sym => sym.val == "any")) {
        return SC.UnaryPre(SC.Value("!"), SC.Group("(", getIncludeBooleans(exclude_symbols, grammar, runner, lex_name) || SC.Value("false")));
    } else {
        const exclusion_list = new Set(exclude_symbols.map(getUniqueSymbolName));
        syms = syms.filter(sym => !exclusion_list.has(getUniqueSymbolName(sym))).map(s => getRootSym(s, grammar));

        let
            id = syms.filter(isSymSpecified),
            ty = syms.filter(isSymAGenericType),
            fn = syms.filter(isSymAnAssertFunction)
                .map(s => translateSymbolValue(s, grammar, runner.ANNOTATED, lex_name)).sort();


        if (ty.some(isSymGeneratedId))
            id = id.filter(isSymNotIdentifier);

        //Filter out any symbol that is a single non-numeric or id symbol
        if (optimize) {
            if (ty.some(isSymGeneratedSym))
                id = id.filter(isSymNotLengthOneDefined);

            if (id.length + ty.length + fn.length == 0)
                return SC.Empty();
        }

        let out_id: ExprSC[] = [], out_ty: ExprSC[] = [], out_fn: ExprSC[] = [];

        if (fn.length > 0)
            out_fn = fn;

        if (id.length > 0) {

            const booleans = [], char_groups = id.groupMap(sym => sym.val[0]);

            for (const group of char_groups.values()) {
                if (group.some(sym => sym.val.length > 1 || isSymIdentifier(sym))) {

                    const
                        node_name = SC.Constant("CPT:bool"),
                        fn = SC.Function(":boolean", "l:Lexer").addStatement(buildIfs(group)),
                        fn_name = runner.add_constant(node_name, fn);

                    booleans.push(SC.UnaryPost(SC.Call(fn_name, lex_name), SC.Comment(group.map(sym => `[${sanitizeSymbolValForComment(sym)}]`).join(" "))));
                } else
                    booleans.push(...group.map(s =>
                        SC.Binary(
                            SC.Call(SC.Member(lex_name, SC.Constant("getUTF"))),
                            SC.Value("=="),
                            translateSymbolValue(s, grammar, runner.ANNOTATED, lex_name)
                        )
                    ));
            }

            out_id = booleans;
        }

        if (ty.length > 0)
            out_ty = ty.map(s => translateSymbolValue(s, grammar, runner.ANNOTATED, lex_name));

        return ([...out_id, ...out_ty, ...out_fn].filter(_ => _).reduce((r, s) => {
            if (!r) return s;
            return SC.Binary(r, SC.Value("||"), s);
        }, null));
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
        ${convertAssertionFunctionBodyToSkribble(production.recovery_handler.lexer_text, grammar, runner)}
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
        const { sc: txt, first } = convertAssertionFunctionBodyToSkribble(fn.txt, grammar, runner);
        fn.assemblyscript_txt = txt;
        fn.first = first;
    }
    return fn;
}

export function getAssertionSymbolFirst(sym: AssertionFunctionSymbol, grammar: Grammar): TokenSymbol[] {
    const fn = generateCompiledAssertionFunction(sym, grammar, <CompilerRunner>{ ANNOTATED: false, add_constant: (name) => { return name; } });
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
export function convertAssertionFunctionBodyToSkribble(af_body_content: string, grammar: Grammar, runner: CompilerRunner)
    : { sc: SC, first: TokenSymbol[]; } {
    const
        rev_lu = [],
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
        processFunctionNodes(node, grammar, runner, sym_lu, first);
    }

    const sc = convertToSkribble(receiver.ast);

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
    runner: CompilerRunner,
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
            if ((<string>node.value).includes("__sym__z")) {
                if (ALLOW_FIRST) {
                    const id = +((<string>node.value).split("z")[1]);
                    first.push(sym_lu[id]);
                }
                node.value += "_" + lexer_name[lex_name_ptr];

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
