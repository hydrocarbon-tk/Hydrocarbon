import { traverse } from "@candlefw/conflagrate";
import { exp, JSNode, JSNodeClass, JSNodeType, parser, stmt } from "@candlefw/js";
import { Helper } from "../compiler/helper.js";
import { Grammar, GrammarFunction } from "../types/grammar.js";
import {
    AssertionFunctionSymbol,
    ProductionTokenSymbol,
    TokenSymbol
} from "../types/symbol";
import { SymbolType } from "../types/symbol_type";
import { rec_glob_lex_name } from "./global_names.js";
import { getProductionID } from "./production.js";
import { getProductionFunctionName } from "./render_item.js";
import { ConstSC, ExprSC, SC, StmtSC, VarSC } from "./skribble.js";
import {
    createAssertionShiftManual,
    doSymbolsOcclude,
    getUniqueSymbolName,
    isSymAGenericType,
    isSymAnAssertFunction,
    isSymAProductionToken,
    isSymGeneratedId,
    isSymGeneratedNum,
    isSymGeneratedSym,
    isSymNonConsume,
    isSymNotIdentifier,
    isSymNotLengthOneDefined,
    isSymNotNonConsume,
    isSymSpecified,
} from "./symbol.js";


export function sanitizeSymbolValForComment(sym: string | TokenSymbol): string {
    if (typeof sym == "string")
        return sym.replace(/\*/g, "asterisk");
    return sym.val.toString().replace(/\*/g, "asterisk");
}

export function getAssertionFunctionName(name: string) {
    return `__${name}__`;
}

export function createAssertionShift(grammar: Grammar, runner: Helper, sym: TokenSymbol, lex_name: ConstSC | VarSC = SC.Variable("l:Lexer")): ExprSC {
    return createAssertionShiftManual(lex_name, getIncludeBooleans([sym], grammar, runner, lex_name));
}
export function translateSymbolValue(sym: TokenSymbol, grammar: Grammar, lex_name: ConstSC | VarSC = SC.Variable("l:Lexer")): ExprSC {

    const
        char_len = sym.val.toString().length,
        annotation = SC.Comment(`[${sanitizeSymbolValForComment(sym)}]`);

    if (sym.type == SymbolType.END_OF_FILE || sym.val == "END_OF_FILE")
        return SC.Call(SC.Member(lex_name, "END"));

    switch (sym.type) {
        case SymbolType.PRODUCTION_ASSERTION_FUNCTION:
            if (sym.DOES_SHIFT)
                return SC.Call(SC.Value(getAssertionFunctionName(sym.val)), lex_name);

            else
                return SC.Call(SC.Value(getAssertionFunctionName(sym.val)), lex_name);

        case SymbolType.GENERATED:
            switch (sym.val) {
                case "ws": return SC.UnaryPost(SC.Call(SC.Member(lex_name, SC.Constant("isSP"))), annotation);
                case "num": return SC.UnaryPost(SC.Call(SC.Member(lex_name, SC.Constant("isNum"))), annotation);
                case "id": return SC.UnaryPost(SC.Call(SC.Member(lex_name, SC.Constant("isID"))), annotation);
                case "nl": return SC.UnaryPost(SC.Call(SC.Member(lex_name, SC.Constant("isNL"))), annotation);
                case "sym": return SC.UnaryPost(SC.Call(SC.Member(lex_name, SC.Constant("isSym"))), annotation);
                default: return SC.False; // + annotation;
            }
        case SymbolType.LITERAL:
        case SymbolType.ESCAPED:
        case SymbolType.SYMBOL:
            if (char_len == 1) {
                return SC.UnaryPost(SC.Value(sym.val.codePointAt(0) + ""), annotation);
            } else {
                return SC.UnaryPost(SC.Value(sym.id + ""), annotation);
            }
        case SymbolType.EMPTY:
            return SC.Empty();
    }
}

export function getSkipFunctionNew(
    skip_symbols: TokenSymbol[],
    grammar: Grammar,
    runner: Helper,
    custom_skip_code: SC = null,
    lex_name: ExprSC = SC.Variable("l", "Lexer"),
    exclude: TokenSymbol[] = []
): VarSC {

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


export function createNonCaptureBooleanCheck(symbols: TokenSymbol[], grammar: Grammar, runner: Helper, ambient_symbols: TokenSymbol[]): VarSC {
    const boolean = getIncludeBooleans(symbols.map(sym => Object.assign({}, sym, { IS_NON_CAPTURE: false })), grammar, runner, rec_glob_lex_name, ambient_symbols);
    const token_function = SC.Function(
        ":bool",
        "l:Lexer&"
    ).addStatement(

        SC.If(boolean)
            .addStatement(
                SC.Assignment(SC.Member("l", "tl"), 0),
                SC.UnaryPre(SC.Return, SC.True)
            ),
        SC.UnaryPre(SC.Return, SC.False)
    );

    const SF_name = SC.Constant(`non_capture_:bool`);

    return <VarSC>runner.add_constant(SF_name, token_function);
}


export function buildIfs(
    syms: TokenSymbol[],
    lex_name: ConstSC | VarSC = SC.Variable("l:Lexer"),
    occluders: TokenSymbol[] = [],
    off = 0,
    USE_MAX = false,
    token_val = "TokenSymbol"
): SC {

    let HAS_VAL = false;
    const code_node = new SC;
    const lex_get_utf = SC.Member(lex_name, "getUTF");
    const declaration = SC.Declare(
        SC.Assignment("ACCEPT:bool", "false")
    );

    if (off == 0)
        code_node.addStatement(declaration);

    for (const sym of syms) {
        if ((<string>sym.val).length <= off) {
            code_node.addStatement(
                SC.Assignment(SC.Member(lex_name, "ty"), "TokenSymbol"),
                SC.Assignment(SC.Member(lex_name, "tl"), off),
                SC.Assignment("ACCEPT", "true")
            );
        }
    }

    const val: string = syms[0].val.toString();

    if (syms.length == 1 && val.length > off) {

        const l = val.length - off,

            booleans = val
                .slice(off)
                .split("")
                .reverse()
                .map((v, i) => SC.Binary(SC.Call(lex_get_utf, off + l - i - 1), "==", v.codePointAt(0)))
                .reduce((r, a) => {
                    if (!r)
                        return a; return SC.Binary(r, "&&", a);
                }, null),
            occlusion_checks = [];

        for (const sym of occluders) {
            if (isSymGeneratedId(sym)) {
                occlusion_checks.push(SC.Binary(SC.Call(SC.Member(lex_name, "typeAt"), off + l), "!=", "TokenIdentifier"));
            } else if (isSymGeneratedNum(sym)) {
                occlusion_checks.push(SC.Binary(SC.Call(SC.Member(lex_name, "typeAt"), off + l), "!=", "TokenNumber"));
            } else {
                const char_code = sym.val.toString().charCodeAt(val.length);
                occlusion_checks.push(SC.Binary(SC.Call(lex_get_utf, off + l), "!=", char_code));
            }
        }

        const check_sequence = occlusion_checks.length > 0
            ? SC.Binary(expressionArrayToBoolean(occlusion_checks, "&&"), "&&", booleans)
            : booleans;

        code_node.addStatement(
            SC.If(check_sequence)
                .addStatement(buildIfs(syms, lex_name, occluders, off + l, USE_MAX, token_val), SC.Empty())
        );
    } else {
        let first = true;
        const
            incremented_syms = syms.filter(s => (<string>s.val).length > off).groupMap(s => s.val[off]),
            incremented_occluders = occluders.filter(isSymSpecified).filter(s => (<string>s.val).length > off).groupMap(s => s.val[off]),
            generated_occluders = occluders.filter(isSymAGenericType);

        let leaf = code_node;

        if (!HAS_VAL)
            declaration.expressions.push(SC.Assignment("val:unsigned int", 0));

        for (const [key, syms] of incremented_syms.entries()) {

            const occluders = [].concat(incremented_occluders.get(key) || [], generated_occluders);

            if (first && incremented_syms.size > 1)
                code_node.addStatement(SC.Assignment("val", SC.Call(lex_get_utf, off)));

            first = false;

            const
                v = syms[0].val[off],
                _if = SC.If(SC.Binary(incremented_syms.size == 1 ? SC.Call(lex_get_utf, off) : "val", "==", v.codePointAt(0)))
                    .addStatement(buildIfs(syms, lex_name, occluders, off + 1, USE_MAX, token_val));

            leaf.addStatement(_if);
            leaf = _if;
        }

        leaf.addStatement(SC.Empty());
    }

    if (off == 0)
        code_node.addStatement(SC.UnaryPre(SC.Return, SC.Variable("ACCEPT")));

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
 * @param ambient_symbols
 */
export function getIncludeBooleans(
    syms: TokenSymbol[],
    grammar: Grammar,
    runner: Helper,
    lex_name: ConstSC | VarSC = SC.Variable("l:Lexer"),
    /* List of all symbols that can be encountered*/
    ambient_symbols: TokenSymbol[] = []
): ExprSC {

    syms = syms.setFilter(s => getUniqueSymbolName(s));

    ambient_symbols = ambient_symbols.concat(syms).setFilter(getUniqueSymbolName);

    let
        non_consume = syms.filter(isSymNonConsume),
        consume = syms.filter(isSymNotNonConsume),
        id = consume.filter(isSymSpecified),
        ty = consume.filter(isSymAGenericType),
        tk = consume.filter(isSymAProductionToken),
        fn = consume.filter(isSymAnAssertFunction)
            .map(s => translateSymbolValue(s, grammar, lex_name)).sort();

    const HAS_GEN_ID = ty.some(isSymGeneratedId);

    if (HAS_GEN_ID)
        id = id.filter(isSymNotIdentifier);

    if (ty.some(isSymGeneratedSym))
        id = id.filter(isSymNotLengthOneDefined);

    if (id.length + ty.length + fn.length + tk.length + non_consume.length == 0)
        return null;

    let out_id: ExprSC[] = [], out_ty: ExprSC[] = [], out_fn: ExprSC[] = [], out_tk: ExprSC[] = [], out_non_consume: ExprSC[] = [];

    if (non_consume.length > 0) {

        const
            fn_name = createNonCaptureBooleanCheck(non_consume, grammar, runner, ambient_symbols);

        out_non_consume.push(SC.UnaryPost(SC.Call(fn_name, lex_name), SC.Comment(non_consume.map(sym => `[${sanitizeSymbolValForComment(sym)}]`).join(" "))));
    }

    if (fn.length > 0)
        out_fn = fn;

    if (id.length > 0) {

        const
            booleans = [],
            table_count = 0,
            char_tuples: [TokenSymbol, TokenSymbol[]][] = [];

        let table = 0n, table_syms = [];

        for (const sym of id) {

            const
                char_code = sym.val.charCodeAt(0),
                occluders = ambient_symbols.filter(a_sym => doSymbolsOcclude(a_sym, sym));

            if (occluders.length > 0 || sym.val.length > 1) {

                char_tuples.push(<[TokenSymbol, TokenSymbol[]]>[sym, occluders]);

            } else if (char_code < 128) {

                table_syms.push(sym);

                table |= 1n << BigInt(char_code);

            } else {
                booleans.push(lexerUTFBoolean(lex_name, char_code));
            }
        }

        const char_groups = char_tuples
            .group(([sym]) => sym.val.toString()[0])
            .map((tuples) => {
                const syms = tuples.map(([a]) => a);
                const occluders = tuples.flatMap(([, a]) => a).setFilter(getUniqueSymbolName);
                return { syms, occluders };
            });

        for (const { syms, occluders } of char_groups) {

            const
                fn_lex_name = SC.Constant("l:Lexer"),
                fn = SC.Function(":boolean", fn_lex_name).addStatement(buildIfs(syms, fn_lex_name, occluders)),
                node_name = SC.Constant(`cp${fn.hash().slice(0, 8)}_:bool`),
                fn_name = runner.add_constant(node_name, fn);

            booleans.push(SC.UnaryPost(SC.Call(fn_name, lex_name), SC.Comment(syms.map(sym => `[${sanitizeSymbolValForComment(sym)}]`).join(" "))));
        }

        if (table > 0n) {
            if (table_syms.length < 3) {
                for (const sym of table_syms)
                    booleans.push(lexerUTFBoolean(lex_name, sym.val.charCodeAt(0)));
            } else {

                booleans.push(
                    SC.UnaryPost(SC.Call("assert_table", lex_name,
                        "0x" + ((table >> 0n) & 0xffffffffn).toString(16),
                        "0x" + ((table >> 32n) & 0xffffffffn).toString(16),
                        "0x" + ((table >> 64n) & 0xffffffffn).toString(16),
                        "0x" + ((table >> 96n) & 0xffffffffn).toString(16)
                    ), SC.Comment("tbl:" + table_syms.map(d => `[ ${d.val} ]`).join(" "))
                    )
                );
            }
        }

        out_id = booleans;
    }

    if (ty.length > 0)
        out_ty = ty.map(s => translateSymbolValue(s, grammar, lex_name));

    if (tk.length > 0) {
        for (const tok of tk) {

            const
                fn_name = createProductionTokenFunction(tok, grammar, runner),
                fn = SC.Call(fn_name, lex_name);

            out_tk.push(fn);
        }
    }

    return expressionArrayToBoolean([...out_non_consume, ...out_tk, ...out_id, ...out_ty, ...out_fn]);
}

function expressionArrayToBoolean(array: ExprSC[], delimiter: string = "||"): ExprSC {
    return (array.filter(_ => _).reduce((r, s) => {
        if (!r) return s;
        return SC.Binary(r, delimiter, s);
    }, null));
}

function lexerUTFBoolean(lex_name: VarSC | ConstSC, char_code: number, operator: string = "=="): any {
    return SC.Binary(
        SC.Member(lex_name, "utf"),
        operator,
        SC.UnaryPost(
            SC.Value(char_code),
            SC.Comment(`[${String.fromCharCode(char_code)}]`)
        )
    );
}

export function createProductionTokenFunction(tok: ProductionTokenSymbol, grammar: Grammar, runner: Helper): VarSC {

    const production = grammar[getProductionID(tok, grammar)];

    runner.referenced_production_ids.add(production.id);

    const token_function = SC.Function(
        ":bool",
        "l:Lexer&"
    ).addStatement(
        SC.Declare(SC.Assignment("c:Lexer", SC.Call(SC.Member("l", "copy")))),
        SC.Declare(SC.Assignment("s:State", SC.UnaryPre("new", SC.Call(SC.Constant("State:State"))))),
        SC.Call(SC.Member("s", "setENABLE_STACK_OUTPUT"), SC.Value(0)),
        SC.If(SC.Call(getProductionFunctionName(production, grammar), "c:Lexer", "s:State"))
            .addStatement(SC.Assignment(SC.Member("l", "tl"),
                SC.Binary(SC.Member("c", "off"), "-", SC.Member("l", "off"))),
                SC.UnaryPre(SC.Return, SC.True)),
        SC.UnaryPre(SC.Return, SC.False)
    );

    const SF_name = SC.Constant(`tok_fn_:bool`);

    return <VarSC>runner.add_constant(SF_name, token_function);
}


export function createNonCaptureProductionTokenFunction(tok: ProductionTokenSymbol, grammar: Grammar, runner: Helper): VarSC {
    const production = grammar[getProductionID(tok, grammar)];

    runner.referenced_production_ids.add(production.id);

    const token_function = SC.Function(
        ":bool",
        "l:Lexer&"
    ).addStatement(
        SC.Declare(SC.Assignment("c:Lexer", SC.Call(SC.Member("l", "copy")))),
        SC.Declare(SC.Assignment("s:State", SC.UnaryPre("new", SC.Call(SC.Constant("State:State"))))),
        SC.Call(SC.Member("s", "setENABLE_STACK_OUTPUT"), SC.Value(0)),
        SC.If(SC.Call(getProductionFunctionName(production, grammar), "c:Lexer", "s:State"))
            .addStatement(SC.UnaryPre(SC.Return, SC.True)),
        SC.UnaryPre(SC.Return, SC.False)
    );
    const SF_name = SC.Constant(`tok_fn_:bool`);

    return <VarSC>runner.add_constant(SF_name, token_function);
}

export function generateCompiledAssertionFunction(sym: AssertionFunctionSymbol, grammar: Grammar, runner: Helper): GrammarFunction {
    const fn_name = sym.val;
    const fn = grammar.functions.get(fn_name);
    if (fn && !fn.assemblyscript_txt) {
        const { sc: txt, first } = convertAssertionFunctionBodyToSkribble(fn.txt, grammar, runner);
        //@ts-ignore
        fn.assemblyscript_txt = txt;
        fn.first = first;
    }
    return fn;
}
export function getAssertionSymbolFirst(sym: AssertionFunctionSymbol, grammar: Grammar): TokenSymbol[] {
    const fn = generateCompiledAssertionFunction(sym, grammar, <Helper><any>{ ANNOTATED: false, add_constant: (name) => { return name; } });
    if (fn)
        return fn.first;
    else
        return [];
}
;
export function getTrueSymbolValue(sym: TokenSymbol, grammar: Grammar): TokenSymbol[] {

    if (isSymAnAssertFunction(sym)) {
        const val = grammar.functions.get(sym.val);
        const { first } = getAssertionFunctionData(val.txt, grammar);
        return first;
    }

    return [<TokenSymbol>sym];
}

export function getAssertionFunctionData(af_body_content: string, grammar: Grammar): { first: TokenSymbol[]; ast: JSNode; rev_lu: { id: number; sym: TokenSymbol; }[]; } {

    const
        rev_lu: { id: number; sym: TokenSymbol; }[] = [],
        syms: Map<string, { id: number; sym: TokenSymbol; }> = new Map(),
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

export function convertAssertionFunctionBodyToSkribble(af_body_content: string, grammar: Grammar, runner: Helper): { sc: SC; first: TokenSymbol[]; } {

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
                        n3 ? n3?.type == JSNodeType.IfStatement ? convertToSkribble(n3) : SC.If().addStatement(convertToSkribble(n3)) : SC.Empty()
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
): { node: JSNode; HAS_TK: boolean; } {
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

                        if (node.value.toString().includes("produce")) {
                            const
                                fn_name = node.value.toString().split("_").slice(1).join("_"),
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
}
;
