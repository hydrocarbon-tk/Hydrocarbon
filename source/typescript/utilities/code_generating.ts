import { Helper } from "../compiler/helper.js";
import { Grammar } from "../types/grammar.js";
import { Production } from "../types/production.js";
import { RenderBodyOptions } from "../types/render_body_options.js";
import {
    ProductionTokenSymbol,
    TokenSymbol
} from "../types/symbol";
import { SymbolType } from "../types/symbol_type";
import { rec_consume_assert_call, rec_glob_lex_name, rec_state } from "./global_names.js";
import { getProductionClosure, getProductionID } from "./production.js";
import { ConstSC, ExprSC, SC, StmtSC, VarSC } from "./skribble.js";
import {
    doDefinedSymbolsOcclude,
    getTokenSymbolsFromItems,
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

/**
 * Length of code hash string appended to GUID constant names. 
 */
const hash_length = 16;

function generateGUIDConstName(fn_data: SC, prefix: string = "id", type: string = "void") {
    return SC.Constant(`${prefix}_${fn_data.hash().slice(-hash_length)}:${type}`);
}

export function getProductionFunctionName(production: Production, grammar: Grammar): string {
    return "$" + production.name;
}

export function createAssertionShiftManual(lex_name: ConstSC | VarSC = SC.Variable("l:Lexer"), boolean: ExprSC): ExprSC {
    return SC.Call(rec_consume_assert_call, lex_name, rec_state, boolean);
}
export function createAssertionShift(grammar: Grammar, runner: Helper, sym: TokenSymbol, lex_name: ConstSC | VarSC = SC.Variable("l:Lexer")): ExprSC {
    return createAssertionShiftManual(lex_name, getIncludeBooleans([sym], grammar, runner, lex_name));
}

export function renderProductionCall(
    production: Production,
    options: RenderBodyOptions,
    lexer_name: VarSC = rec_glob_lex_name
): ExprSC {

    const { called_productions, grammar } = options;

    called_productions.add(<number>production.id);


    return SC.Binary(rec_state, "=", SC.Call(SC.Constant(getProductionFunctionName(production, grammar) + ":unsigned int"), lexer_name, rec_state));
}

export function createProductionTokenFunction(tok: ProductionTokenSymbol, grammar: Grammar, runner: Helper): VarSC {

    const production = grammar[getProductionID(tok, grammar)];

    runner.referenced_production_ids.add(production.id);

    const

        anticipated_syms = getTokenSymbolsFromItems(getProductionClosure(production.id, grammar, true), grammar),

        boolean = getIncludeBooleans(anticipated_syms, grammar, runner),

        prod_name = production.name,

        token_function = SC.Function(
            ":bool",
            "l:Lexer&"
        ).addStatement(
            SC.If(boolean).addStatement(
                SC.Declare(SC.Assignment("c:Lexer", SC.Call(SC.Member("l", "copy")))),
                SC.If(SC.Call(getProductionFunctionName(production, grammar), "c:Lexer", SC.Call("createState", 0)))
                    .addStatement(SC.Assignment(SC.Member("l", "tl"),
                        SC.Binary(SC.Member("c", "off"), "-", SC.Member("l", "off"))),
                        SC.UnaryPre(SC.Return, SC.True)),
                SC.Empty()
            ),
            SC.UnaryPre(SC.Return, SC.False)
        ),

        SF_name = generateGUIDConstName(token_function, `${prod_name}_tok`, "bool");

    return <VarSC>runner.add_constant(SF_name, token_function);
}

export function sanitizeSymbolValForComment(sym: string | TokenSymbol): string {
    if (typeof sym == "string")
        return sym.replace(/\*/g, "asterisk");
    return sym.val.toString().replace(/\*/g, "asterisk");
}

export function getAssertionFunctionName(name: string) {
    return `__${name}__`;
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

    const
        boolean = getIncludeBooleans(skip_symbols, grammar, runner, rec_glob_lex_name, exclude),

        skip_function =
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
            ),

        SF_name = generateGUIDConstName(skip_function, "sk", "Lexer");

    return <VarSC>runner.add_constant(SF_name, skip_function);
}


export function createNonCaptureBooleanCheck(symbols: TokenSymbol[], grammar: Grammar, runner: Helper, ambient_symbols: TokenSymbol[]): VarSC {

    const
        boolean =
            getIncludeBooleans(symbols.map(sym => Object.assign({}, sym, { IS_NON_CAPTURE: false })), grammar, runner, rec_glob_lex_name, ambient_symbols),

        token_function = SC.Function(
            ":bool",
            "l:Lexer&"
        ).addStatement(

            SC.If(boolean)
                .addStatement(
                    SC.Assignment(SC.Member("l", "tl"), 0),
                    SC.UnaryPre(SC.Return, SC.True)
                ),
            SC.UnaryPre(SC.Return, SC.False)
        ),

        SF_name = generateGUIDConstName(token_function, "non_capture", "bool");

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
            char_tuples: [TokenSymbol, TokenSymbol[]][] = [];

        let table = 0n, table_syms = [];

        for (const sym of id) {

            const
                char_code = sym.val.charCodeAt(0),
                occluders = ambient_symbols.filter(a_sym => doDefinedSymbolsOcclude(a_sym, sym));

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
                node_name = generateGUIDConstName(fn, `defined_token`, "bool"),
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
        out_ty = ty.sort((a, b) => a.val < b.val ? -1 : 1).map(s => translateSymbolValue(s, grammar, lex_name));

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

export function getTrueSymbolValue(sym: TokenSymbol, grammar: Grammar): TokenSymbol[] {

    return [<TokenSymbol>sym];
}