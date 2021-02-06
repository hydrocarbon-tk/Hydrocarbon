import { Helper } from "../compiler/helper.js";
import { Grammar } from "../types/grammar.js";
import { Production } from "../types/production.js";
import { RenderBodyOptions } from "../types/render_body_options.js";
import {
    DefinedSymbol,
    ProductionTokenSymbol,
    TokenSymbol
} from "../types/symbol";
import { SymbolType } from "../types/symbol_type";
import { rec_consume_call, rec_glob_data_name, rec_glob_lex_name, rec_state } from "./global_names.js";
import { Item } from "./item.js";
import { getProductionClosure, getProductionID } from "./production.js";
import { ConstSC, ExprSC, SC, StmtSC, VarSC } from "./skribble.js";
import {
    Defined_Symbols_Occlude,
    getTokenSymbolsFromItems,
    getUniqueSymbolName,
    Sym_Is_An_Assert_Function,
    Sym_Is_A_Generic_Identifier, Sym_Is_A_Generic_Type,
    Sym_Is_A_Production_Token,
    Sym_Is_Consumed,
    Sym_Is_Defined, Sym_Is_EOF, Sym_Is_Not_An_Identifier, Sym_Is_Not_Consumed
} from "./symbol.js";

/**
 * Length of code hash string appended to GUID constant names. 
 */
const hash_length = 16;

export function createReduceFunction(item: Item, grammar: Grammar): StmtSC {
    return SC.Expressions(SC.Call(SC.Constant("add_reduce"), rec_state, rec_glob_data_name, SC.Value(item.len + ""), SC.Value((item.body_(grammar).reduce_id + 1) + "")));
}

export function createDefaultReduceFunction(item: Item): StmtSC {
    return SC.Expressions(SC.Call(SC.Constant("add_reduce"), rec_state, rec_glob_data_name, SC.Value(item.len + ""), SC.Value("0")));
}
export function generateGUIDConstName(fn_data: SC, prefix: string = "id", type: string = "void") {
    return SC.Constant(`${prefix}_${fn_data.hash().slice(-hash_length)}:${type}`);
}

export function getProductionFunctionName(production: Production, grammar: Grammar): string {
    return "$" + production.name;
}
export function createConsume(lex_name: ConstSC | VarSC): ExprSC {
    return SC.Call(rec_consume_call, lex_name, rec_glob_data_name, rec_state);
}
export function createAssertConsume(lex_name: ConstSC | VarSC = SC.Variable("l:Lexer"), boolean: ExprSC): ExprSC {
    return SC.Binary(boolean, "&&", createConsume(lex_name));
}
export function createAssertionShift(grammar: Grammar, runner: Helper, sym: TokenSymbol, lex_name: ConstSC | VarSC = SC.Variable("l:Lexer")): ExprSC {
    return createAssertConsume(lex_name, getIncludeBooleans([sym], grammar, runner, lex_name));
}

export function createProductionCall(
    production: Production,
    options: RenderBodyOptions,
    lexer_name: VarSC = rec_glob_lex_name
): ExprSC {

    const { called_productions, grammar } = options;

    called_productions.add(<number>production.id);


    return SC.Binary(rec_state, "=", SC.Call(SC.Constant(getProductionFunctionName(production, grammar) + ":unsigned int"), lexer_name, rec_glob_data_name, rec_state));
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
            rec_glob_lex_name,
            rec_glob_data_name
        ).addStatement(
            SC.If(boolean).addStatement(
                SC.Declare(SC.Assignment("c:Lexer", SC.Call(SC.Member("l", "copy")))),
                SC.If(SC.Call(getProductionFunctionName(production, grammar), "c:Lexer", rec_glob_data_name, SC.Call("createState", 0)))
                    .addStatement(
                        SC.Assignment(SC.Member("l", "token_length"), SC.Binary(SC.Member("c", "token_offset"), "-", SC.Member("l", "token_offset"))),
                        SC.Assignment(SC.Member("l", "byte_length"), SC.Binary(SC.Member("c", "byte_offset"), "-", SC.Member("l", "byte_offset"))),
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

    if (Sym_Is_EOF(sym))
        return SC.Call(SC.Member(lex_name, "END"), rec_glob_data_name);
    const USE_UNICODE = "true";
    switch (sym.type) {
        case SymbolType.PRODUCTION_ASSERTION_FUNCTION:
            if (sym.DOES_SHIFT)
                return SC.Call(SC.Value(getAssertionFunctionName(sym.val)), lex_name);

            else
                return SC.Call(SC.Value(getAssertionFunctionName(sym.val)), lex_name);

        case SymbolType.GENERATED:
            switch (sym.val) {
                case "ws": return SC.Call(SC.Member(lex_name, SC.Constant("isSP")), USE_UNICODE, rec_glob_data_name);
                case "num": return SC.Call(SC.Member(lex_name, SC.Constant("isNum")), rec_glob_data_name);
                case "id": return SC.Call(SC.Member(lex_name, SC.Constant("isUniID")), rec_glob_data_name);
                case "nl": return SC.Call(SC.Member(lex_name, SC.Constant("isNL")));
                case "sym": return SC.Call(SC.Member(lex_name, SC.Constant("isSym")), USE_UNICODE, rec_glob_data_name);
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

export function createSkipCall(
    symbols: TokenSymbol[],
    grammar: Grammar,
    runner: Helper,
    lex_name: ExprSC = SC.Variable("l", "Lexer"),
    exclude: TokenSymbol[] = []
): StmtSC {

    const skips = getSkipFunctionNew(symbols, grammar, runner, undefined, lex_name, exclude);

    if (skips)
        return SC.Expressions(SC.Call(skips, SC.UnaryPost(lex_name, SC.Comment(symbols.map(s => `[ ${s.val} ]`).join(""))), rec_glob_data_name));

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
                "l:Lexer&",
                rec_glob_data_name
            ).addStatement(
                SC.While(SC.Value(1)).addStatement(
                    custom_skip_code ? custom_skip_code : SC.Empty(),
                    SC.If(SC.UnaryPre("!", SC.Group("(", boolean)))
                        .addStatement(SC.Break),
                    SC.Call(SC.Member("l", "next"), rec_glob_data_name),
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
                    SC.Assignment(SC.Member("l", "token_length"), 0),
                    SC.Assignment(SC.Member("l", "byte_length"), 0),
                    SC.UnaryPre(SC.Return, SC.True)
                ),
            SC.UnaryPre(SC.Return, SC.False)
        ),

        SF_name = generateGUIDConstName(token_function, "non_capture", "bool");

    return <VarSC>runner.add_constant(SF_name, token_function);
}

function getUTF8ByteAt(s: DefinedSymbol, off: number): number {
    return s.val[off].charCodeAt(0);
}
export function* buildSwitchIfsAlternate(
    grammar: Grammar,
    syms: DefinedSymbol[],
    lex_name: ConstSC | VarSC = SC.Variable("l:Lexer"),
    occluders: TokenSymbol[] = [],
    off = 0
): Generator<{ sym: DefinedSymbol, code_node: SC; }, SC> {

    const code_node = (new SC);

    //Group symbols based on their 
    let pending_syms = syms
        .filter(s => (s.byte_length - off) > 0)
        .group(s => getUTF8ByteAt(s, off));

    let leaf = code_node;

    for (const syms of pending_syms) {

        //Construct a compare on the longest string
        const shortest = syms.sort((a, b) => a.byte_length - b.byte_length)[0];
        let gen;
        if (syms.length == 1) {
            gen = buildSwitchIfs(grammar, syms, lex_name, occluders, off + 1);
        } else {
            gen = buildSwitchIfsAlternate(grammar, syms, lex_name, occluders, off + 1);
        }

        let yielded = gen.next();

        while (!yielded.done) {
            yield yielded.value;
            yielded = gen.next();
        }

        //  console.log({ pending_syms, syms, off, length, g });
        const _if = SC.If(SC.Value(`data.input[l.byte_offset + ${off}] == ${getUTF8ByteAt(shortest, off)}`))
            .addStatement(yielded.value);

        leaf.addStatement(_if);
        leaf = _if;
    }

    leaf.addStatement(SC.Empty());


    for (const sym of syms) {
        if (sym.byte_length <= off)
            yield { sym, code_node };
    }

    return code_node;
}

export function* buildSwitchIfs(
    grammar: Grammar,
    syms: DefinedSymbol[],
    lex_name: ConstSC | VarSC = SC.Variable("l:Lexer"),
    occluders: TokenSymbol[] = [],
    off = 0
): Generator<{ sym: DefinedSymbol, code_node: SC; }, SC> {
    const code_node = (new SC);


    //Group symbols based on their 
    let pending_syms = syms
        .filter(s => typeof s.byte_offset == "number")
        .filter(s => (s.byte_length - off) > 0)
        .group(s => s.byte_offset);
    let leaf = code_node;

    for (const syms of pending_syms) {
        //Construct a compare on the longest string
        const shortest = syms.sort((a, b) => a.byte_length - b.byte_length)[0];
        const length = shortest.byte_length - off;
        const offset = shortest.byte_offset + off;

        const gen = buildSwitchIfs(grammar, syms, lex_name, occluders, off + length);

        let yielded = gen.next();
        while (!yielded.done) {
            yield yielded.value;
            yielded = gen.next();
        }
        let _if = length == 1

            ? SC.If(SC.Value(`data.input[l.byte_offset + ${off}] == ${getUTF8ByteAt(shortest, off)}`))
                .addStatement(yielded.value)

            : SC.If(SC.Binary(length, "==", SC.Call("compare", "data", "l.byte_offset +" + off, offset, length)))
                .addStatement(yielded.value);


        leaf.addStatement(_if);
        leaf = _if;
    }

    leaf.addStatement(SC.Empty());


    for (const sym of syms) {
        if (sym.byte_length <= off)
            yield { sym, code_node };
    }

    return code_node;
}
export function buildIfs(
    grammar: Grammar,
    syms: DefinedSymbol[],
    lex_name: ConstSC | VarSC = SC.Variable("l:Lexer"),
    occluders: TokenSymbol[] = []
): SC {


    const gen = buildSwitchIfs(grammar, syms, lex_name, occluders);
    let yielded = gen.next();

    while (!yielded.done) {
        const { code_node, sym } = yielded.value;
        code_node.addStatement(
            SC.Assignment(SC.Member(lex_name, "type"), "TokenSymbol"),
            SC.Assignment(SC.Member(lex_name, "byte_length"), sym.byte_length),
            SC.Assignment(SC.Member(lex_name, "token_length"), sym.val.length),
            SC.UnaryPre(SC.Return, SC.True),
        );
        yielded = gen.next();
    }

    const code_node = yielded.value;

    code_node.addStatement(SC.UnaryPre(SC.Return, SC.False));

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
        non_consume = syms.filter(Sym_Is_Not_Consumed),
        consume = syms.filter(Sym_Is_Consumed),
        id = consume.filter(Sym_Is_Defined),
        ty = consume.filter(Sym_Is_A_Generic_Type),
        tk = consume.filter(Sym_Is_A_Production_Token),
        fn = consume.filter(Sym_Is_An_Assert_Function)
            .map(s => translateSymbolValue(s, grammar, lex_name)).sort();

    const HAS_GEN_ID = ty.some(Sym_Is_A_Generic_Identifier);

    if (HAS_GEN_ID)
        id = id.filter(Sym_Is_Not_An_Identifier);

    // if (ty.some(Sym_Is_A_Symbol_Character))
    //     id = id.filter(Sym_Has_Multiple_Characters);

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
            char_tuples: [DefinedSymbol, TokenSymbol[]][] = [];

        let table = 0n, table_syms = [];

        for (const sym of id) {

            const
                char_code = sym.val.charCodeAt(0),
                occluders = ambient_symbols.filter(a_sym => Defined_Symbols_Occlude(a_sym, sym));

            if (occluders.length > 0 || sym.val.length > 1) {

                char_tuples.push(<[DefinedSymbol, TokenSymbol[]]>[sym, occluders]);

            } else if (char_code < 128) {

                table_syms.push(sym);

                table |= 1n << BigInt(char_code);

            } else {
                booleans.push(getLexerByteBoolean(lex_name, char_code));
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

            if (syms.length == 1) {
                let [sym] = syms;

                //Make sure we are working with the "true" symbol
                sym = getCardinalSymbol(grammar, sym);

                if (sym.byte_length == 1) {
                    const
                        char_code = sym.val.charCodeAt(0);
                    booleans.push(getLexerByteBoolean(lex_name, char_code));
                } else {
                    booleans.push(SC.UnaryPost(
                        SC.Call("cmpr_set", lex_name, rec_glob_data_name, sym.byte_offset, sym.byte_length, sym.val.length),
                        SC.Comment((syms.map(sym => `[${sanitizeSymbolValForComment(sym)}]`).join(" "))))
                    );
                }
            } else {


                const
                    fn_lex_name = SC.Constant("l:Lexer"),
                    fn = SC.Function(":boolean", fn_lex_name, rec_glob_data_name).addStatement(buildIfs(grammar, syms, fn_lex_name, occluders)),
                    node_name = generateGUIDConstName(fn, `defined_token`, "bool"),
                    fn_name = runner.add_constant(node_name, fn);

                booleans.push(SC.UnaryPost(SC.Call(fn_name, lex_name, rec_glob_data_name), SC.Comment(syms.map(sym => `[${sanitizeSymbolValForComment(sym)}]`).join(" "))));
            }
        }

        if (table > 0n) {

            if (table_syms.length < 3) {

                for (const sym of table_syms)
                    booleans.push(getLexerByteBoolean(lex_name, sym.val.charCodeAt(0)));

            } else {

                booleans.push(
                    SC.UnaryPost(SC.Call("assert_ascii", lex_name,
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
                fn = SC.Call(fn_name, lex_name, rec_glob_data_name);

            out_tk.push(fn);
        }
    }

    return convertExpressionArrayToBoolean([...out_non_consume, ...out_tk, ...out_id, ...out_ty, ...out_fn]);
}

function getCardinalSymbol(grammar: Grammar, sym: DefinedSymbol): DefinedSymbol {
    return <any>grammar.meta.all_symbols.get(getUniqueSymbolName(sym));
}

function convertExpressionArrayToBoolean(array: ExprSC[], delimiter: string = "||"): ExprSC {
    return (array.filter(_ => _).reduce((r, s) => {
        if (!r) return s;
        return SC.Binary(r, delimiter, s);
    }, null));
}

function getLexerByteBoolean(lex_name: VarSC | ConstSC, char_code: number, operator: string = "=="): any {
    return SC.Binary(
        SC.Member(lex_name, "current_byte"),
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