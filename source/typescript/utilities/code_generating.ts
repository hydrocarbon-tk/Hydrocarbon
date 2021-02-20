/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import crypto from "crypto";
import { Helper } from "../compiler/helper.js";
import { Grammar } from "../types/grammar.js";
import { Production } from "../types/production.js";
import { BaseOptions, RenderBodyOptions } from "../types/render_body_options.js";
import {
    DefinedSymbol,
    ProductionTokenSymbol,
    Symbol,
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
    Sym_Is_A_Generic_Identifier,
    Sym_Is_A_Generic_Number,
    Sym_Is_A_Generic_Type,
    Sym_Is_A_Production_Token,
    Sym_Is_A_Terminal,
    Sym_Is_Consumed,
    Sym_Is_Defined,
    Sym_Is_Defined_Identifier,
    Sym_Is_Defined_Natural_Number,
    Sym_Is_EOF,
    Sym_Is_Not_A_Defined_Identifier,
    Sym_Is_Not_Consumed
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
export function createAssertionShift(options: BaseOptions, sym: TokenSymbol, lex_name: ConstSC | VarSC = SC.Variable("l:Lexer")): ExprSC {
    return createAssertConsume(lex_name, getIncludeBooleans([sym], options, lex_name));
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
    options: BaseOptions,
    lex_name: ExprSC = SC.Variable("l", "Lexer"),
    peek: boolean,
    exclude: TokenSymbol[] = []
): StmtSC {

    const { helper: runner } = options;

    const skips = getSkipFunctionNew(symbols, options, undefined, lex_name, exclude);

    if (skips)
        return SC.Expressions(SC.Call(skips, SC.UnaryPost(lex_name, SC.Comment(symbols.map(s => `[ ${s.val} ]`).join(""))), rec_glob_data_name, SC.Value((!peek) + "")));

    return SC.Expressions(SC.Empty());
}

export function getSkipFunctionNew(
    skip_symbols: TokenSymbol[],
    options: BaseOptions,
    custom_skip_code: SC = null,
    lex_name: ExprSC = SC.Variable("l", "Lexer"),
    exclude: TokenSymbol[] = []
): VarSC {

    const { helper: runner } = options;

    if (skip_symbols.length == 0)
        return null;

    let fn_ref = getGlobalObject("skip", skip_symbols, runner);

    if (!fn_ref) {


        const
            boolean = getIncludeBooleans(skip_symbols, options, rec_glob_lex_name, exclude),

            skip_function =
                SC.Function(
                    ":Lexer",
                    "l:Lexer&",
                    rec_glob_data_name,
                    "APPLY:boolean"
                ).addStatement(
                    SC.Value("const off = l.token_offset"),
                    SC.While(SC.Value(1)).addStatement(
                        custom_skip_code ? custom_skip_code : SC.Empty(),
                        SC.If(SC.UnaryPre("!", SC.Group("(", boolean)))
                            .addStatement(SC.Break),
                        SC.Call(SC.Member("l", "next"), rec_glob_data_name),
                    ),
                    SC.If(SC.Value("APPLY")).addStatement(SC.Call("add_skip", "l", "data", SC.Value("l.token_offset - off")))
                );

        fn_ref = packGlobalFunction("skip", "Lexer", skip_symbols, skip_function, runner);
    }

    return <VarSC>fn_ref;
}

export function collapseBranchNames(options: RenderBodyOptions) {
    const { branches, helper: runner } = options;

    for (const { name, body } of branches) {
        let fn_ref;

        const
            hash = body.hash(),

            token_function = SC.Function(
                ":u32",
                rec_glob_lex_name,
                rec_glob_data_name,
                "state:u32",
                "prod:u32"
            ).addStatement(body,
                hash,
            );

        fn_ref = <VarSC>packGlobalFunction("branch", "bool", body, token_function, runner);

        name.type = (<VarSC>fn_ref).type;
    }
}
/**
 * It is important that the actual assignment of the branch names is differed 
 * until the complete processing of all leaf items, as further code can be
 * add from now until then, which should be reflected in the name of the branch
 * function.
 * 
 * @param items 
 * @param branch_code 
 * @param options 
 */
export function createBranchFunction(items: SC, branch_code: SC, options: RenderBodyOptions): VarSC {

    let fn_ref = SC.Variable(branch_code.hash() + "temporary_name:void");

    options.branches.push({
        name: fn_ref,
        body: branch_code
    });

    return <VarSC>fn_ref;
}
export function createProductionTokenFunction(tok: ProductionTokenSymbol, options: BaseOptions): VarSC {
    const { grammar, helper: runner } = options;
    const prod_id = getProductionID(tok, grammar);
    const closure = getProductionClosure(prod_id, grammar, true);

    let fn_ref = getGlobalObject("tk", closure, runner);

    if (!fn_ref) {

        const production = grammar[prod_id];

        runner.referenced_production_ids.add(production.id);

        const

            anticipated_syms = getTokenSymbolsFromItems(closure, grammar),

            boolean = getIncludeBooleans(anticipated_syms, options),

            token_function = SC.Function(
                ":bool",
                rec_glob_lex_name,
                rec_glob_data_name
            ).addStatement(
                SC.If(boolean).addStatement(SC.Value(`                
        //This assumes the token production does not fork

        // preserve the current state of the data
        const stack_ptr = data.stack_ptr;
        const input_ptr = data.input_ptr;
        const state = data.state;
        const copy = l.copy();

        pushFN(data, ${getProductionFunctionName(production, grammar)});
        data.state = 0;

        let ACTIVE = true;

        while (ACTIVE) {
            ACTIVE = false;
            ACTIVE = stepKernel(data, stack_ptr + 1);
        }
        
        data.state = state;

        if (data.prod == ${production.id}) {
            data.stack_ptr = stack_ptr;
            data.input_ptr = input_ptr;
            l.slice(copy);
            return true;
        } else {
            l.sync(copy);
            data.stack_ptr = stack_ptr;
            data.input_ptr = input_ptr;
            return false;
        }`), SC.Empty()),
                SC.UnaryPre(SC.Return, SC.False)
            );

        fn_ref = <VarSC>packGlobalFunction("tk", "bool", closure, token_function, runner);
    }

    return <VarSC>fn_ref;
}

export function createNonCaptureBooleanCheck(symbols: TokenSymbol[], options: BaseOptions, ambient_symbols: TokenSymbol[]): VarSC {

    const { helper: runner } = options;

    let fn_ref = getGlobalObject("nocap", symbols, runner);


    if (!fn_ref) {
        const
            boolean =
                getIncludeBooleans(symbols.map(sym => Object.assign({}, sym, { IS_NON_CAPTURE: false })), options, rec_glob_lex_name, ambient_symbols),

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
            );

        fn_ref = packGlobalFunction("nocap", "bool", symbols, token_function, runner);
    }

    return <VarSC>fn_ref;
}


/**
 * Creates a function that maps symbols to numbers
 * @param options 
 * @param lex_name 
 * @param defined_symbol_mappings 
 * @param generic_symbol_mappings 
 * @param all_syms 
 */
export function createSymbolMappingFunction(
    options: RenderBodyOptions,
    lex_name: VarSC,
    symbol_mappings: [number, Symbol][]
): VarSC | ConstSC {
    const symbols = symbol_mappings.map(([, s]) => s);

    let fn_ref;// = getGlobalObject("sym_map", symbols, options.helper);

    if (!fn_ref) {

        const
            { grammar, helper: runner } = options,

            defined_symbol_mappings: [number, DefinedSymbol][]
                = <[number, DefinedSymbol][]>symbol_mappings.filter(([, sym]) => Sym_Is_Defined(sym)),

            generic_symbol_mappings: [number, TokenSymbol][]
                = <[number, TokenSymbol][]>symbol_mappings.filter(([, sym]) => Sym_Is_A_Generic_Type(sym)),

            production_token_symbol: [number, TokenSymbol][]
                = <[number, TokenSymbol][]>symbol_mappings.filter(([, sym]) => Sym_Is_A_Production_Token(sym)),

            defined_symbols_reversed_map = new Map(defined_symbol_mappings.map((([i, s]) => [s, i]))),

            all_syms: Symbol[] = generic_symbol_mappings.map(([, sym]) => sym),

            fn_lex_name = SC.Constant("l:Lexer"),

            gen = buildSwitchIfsAlternate(grammar, defined_symbol_mappings.map(([, s]) => s), fn_lex_name);

        //Defined Symbols
        let yielded = gen.next();

        while (yielded.done == false) {
            const { code_node, sym } = yielded.value;

            let discretion = (Sym_Is_Defined_Identifier(sym) && all_syms.some(Sym_Is_A_Generic_Identifier))
                ? code_node.convert(SC.If(SC.Value(`l.isDiscrete(data, TokenIdentifier,${sym.byte_length})`)))
                : (Sym_Is_Defined_Natural_Number(sym) && all_syms.some(Sym_Is_A_Generic_Number))
                    ? code_node.convert(SC.If(SC.Value(`l.isDiscrete(data, TokenNumber,${sym.byte_length})`)))
                    : code_node;

            discretion.addStatement(
                (options.helper.ANNOTATED) ? sym.val : undefined,
                SC.Value(`${lex_name.value}.setToken(${"TokenSymbol"}, ${sym.byte_length}, ${sym.val.length})`),
                SC.UnaryPre(SC.Return, SC.Value(defined_symbols_reversed_map.get(sym)))
            );


            yielded = gen.next();
        }

        //Generic Symbols

        let if_root = null, leaf = null;

        for (const [id, sym] of [
            ...production_token_symbol,
            ...generic_symbol_mappings
        ]) {
            const sc = SC.If(
                getIncludeBooleans(
                    [sym],
                    options,
                    lex_name,
                    symbol_mappings.map(([, s]) => s)
                        .filter(Sym_Is_A_Terminal)
                ))
                .addStatement(SC.UnaryPre(SC.Return, SC.Value(id)))
                ;
            if (!if_root) {
                if_root = sc;
                leaf = sc;
            } else {
                leaf.addStatement(sc);
                leaf = sc;
            }
        }

        const
            code_node = yielded.value,
            fn = SC.Function(":boolean", fn_lex_name, rec_glob_data_name)
                .addStatement(
                    symbols.map(s => s.val).join(" "),
                    code_node,
                    if_root
                );

        fn_ref = packGlobalFunction("sym_map", "int", fn, fn, options.helper);
    }

    return fn_ref;
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
): Generator<IfNode, SC, void> {

    const code_node = (new SC);

    if (off == 0)
        syms = ensureSymbolsAreGlobal(syms, grammar);

    //Group symbols based on their 
    let pending_syms = syms
        .filter(s => (s.byte_length - off) > 0)
        .group(s => getUTF8ByteAt(s, off));

    let leaf = code_node;

    for (const syms of pending_syms) {

        //Construct a compare on the longest string
        const shortest = syms.sort((a, b) => a.byte_length - b.byte_length)[0];

        let gen: Generator<IfNode, SC, void>;

        if (syms.length == 1) {
            gen = buildSwitchIfs(grammar, syms, lex_name, occluders, off + 1);
        } else {
            gen = buildSwitchIfsAlternate(grammar, syms, lex_name, occluders, off + 1);
        }

        let yielded = gen.next();

        while (yielded.done == false) {
            yield yielded.value;
            yielded = gen.next();
        }

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

type IfNode = {
    sym: DefinedSymbol;
    code_node: SC;
};

export function* buildSwitchIfs(
    grammar: Grammar,
    syms: DefinedSymbol[],
    lex_name: ConstSC | VarSC = SC.Variable("l:Lexer"),
    occluders: TokenSymbol[] = [],
    off = 0
): Generator<IfNode, SC, void> {

    if (off == 0)
        syms = ensureSymbolsAreGlobal(syms, grammar);

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
        while (yielded.done == false) {
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
    options: BaseOptions,
    syms: DefinedSymbol[],
    lex_name: ConstSC | VarSC = SC.Variable("l:Lexer"),
    occluders: TokenSymbol[] = []
): SC {

    const
        { grammar } = options,
        gen = buildSwitchIfs(grammar, syms, lex_name, occluders);

    let yielded = gen.next();

    while (yielded.done == false) {

        const { code_node, sym } = yielded.value;

        code_node.addStatement(
            (options.helper.ANNOTATED) ? sym.val : undefined,
            SC.Value(`${lex_name.value}.setToken(${"TokenSymbol"}, ${sym.byte_length}, ${sym.val.length})`)
        );

        if (Sym_Is_Defined_Identifier(sym) && occluders.some(Sym_Is_A_Generic_Identifier))
            code_node.addStatement(SC.If(SC.Value(`!l.isDiscrete(data, TokenIdentifier,${sym.byte_length})`)).addStatement(SC.UnaryPre(SC.Return, SC.False)));

        if (Sym_Is_Defined_Natural_Number(sym) && occluders.some(Sym_Is_A_Generic_Number))
            code_node.addStatement(SC.If(SC.Value(`!l.isDiscrete(data, TokenNumber,${sym.byte_length})`)).addStatement(SC.UnaryPre(SC.Return, SC.False)));

        code_node.addStatement(SC.UnaryPre(SC.Return, SC.True));

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
    options: BaseOptions,
    lex_name: ConstSC | VarSC = SC.Variable("l:Lexer"),
    /* List of all symbols that can be encountered*/
    ambient_symbols: TokenSymbol[] = []
): ExprSC {

    const { grammar, helper: runner } = options;

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
        id = id.filter(Sym_Is_Not_A_Defined_Identifier);

    if (id.length + ty.length + fn.length + tk.length + non_consume.length == 0)
        return null;

    let out_id: ExprSC[] = [], out_ty: ExprSC[] = [], out_fn: ExprSC[] = [], out_tk: ExprSC[] = [], out_non_consume: ExprSC[] = [];

    if (non_consume.length > 0) {

        const
            fn_name = createNonCaptureBooleanCheck(non_consume, options, ambient_symbols);

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
                sym = <DefinedSymbol>getCardinalSymbol(grammar, sym);

                if (sym.byte_length == 1) {
                    const
                        char_code = sym.val.charCodeAt(0);
                    booleans.push(getLexerByteBoolean(lex_name, char_code));
                } else {
                    booleans.push(
                        SC.Call("cmpr_set", lex_name, rec_glob_data_name, sym.byte_offset, sym.byte_length, sym.val.length)
                    );
                }
            } else {
                let fn_ref = getGlobalObject("dt", [...syms, ...occluders], runner);

                if (!fn_ref) {

                    const
                        fn_lex_name = SC.Constant("l:Lexer"),
                        fn = SC.Function(":boolean", fn_lex_name, rec_glob_data_name).addStatement(buildIfs(options, syms, fn_lex_name, occluders));

                    fn_ref = packGlobalFunction("dt", "bool", [...syms, ...occluders], fn, runner);
                }

                booleans.push(SC.Call(fn_ref, lex_name, rec_glob_data_name));
            }
        }

        if (table > 0n) {

            if (table_syms.length < 3) {

                for (const sym of table_syms)
                    booleans.push(getLexerByteBoolean(lex_name, sym.val.charCodeAt(0)));

            } else {

                booleans.push(SC.Call("assert_ascii", lex_name,
                    "0x" + ((table >> 0n) & 0xffffffffn).toString(16),
                    "0x" + ((table >> 32n) & 0xffffffffn).toString(16),
                    "0x" + ((table >> 64n) & 0xffffffffn).toString(16),
                    "0x" + ((table >> 96n) & 0xffffffffn).toString(16))
                );
            }
        }

        out_id = booleans;
    }

    if (ty.length > 0)
        out_ty = ty.sort((a, b) => a.val < b.val ? -1 : 1).map(s => translateSymbolValue(s, grammar, lex_name));

    //*
    if (tk.length > 0) {
        for (const tok of tk) {

            const
                fn_name = createProductionTokenFunction(tok, options),
                fn = SC.Call(fn_name, lex_name, rec_glob_data_name);

            out_tk.push(fn);
        }
    }
    //*/

    return convertExpressionArrayToBoolean([...out_non_consume, ...out_tk, ...out_id, ...out_ty, ...out_fn]);
}


function ensureSymbolsAreGlobal<T = Symbol>(syms: T[], grammar: Grammar): T[] {
    return <T[]><any>(<Symbol[]><any>syms).map(s => getCardinalSymbol(grammar, s));
}

function getCardinalSymbol(grammar: Grammar, sym: Symbol): Symbol {
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
/**
 * 
 */
export function packGlobalFunction(fn_class: string, fn_type: string, unique_objects: ((Symbol | Item)[] | SC), fn: SC, helper: Helper) {
    const string_name = getGloballyConsistentName(fn_class, unique_objects);
    const function_name = SC.Variable(string_name + ":" + fn_type);
    return helper.add_constant(function_name, fn);
}

function getGlobalObject(fn_class: string, unique_objects: ((Symbol | Item)[] | SC), runner: Helper) {
    const name = getGloballyConsistentName(fn_class, unique_objects);

    return runner.constant_map.has(name)
        ? runner.constant_map.get(name).name
        : null;
}
/**
 * Generate a function name that is consistent amongst
 * all workers. 
 */
export function getGloballyConsistentName(prepend_js_identifier: string, unique_objects: ((Symbol | Item)[] | SC)): string {

    let string_to_hash = "";
    if ((unique_objects instanceof SC)) {
        string_to_hash = unique_objects.hash();
    } else {
        if (This_Is_An_Item_Array(unique_objects)) {
            string_to_hash = unique_objects.map(i => i.id).setFilter().sort().join("");
        } else {
            string_to_hash = (<Symbol[]>unique_objects).map(getUniqueSymbolName).setFilter().sort().join("");
        }

        string_to_hash = crypto.createHash('md5').update(string_to_hash).digest("hex");
    }


    return `${prepend_js_identifier}_${string_to_hash.slice(0, 16)}`;
}

function This_Is_An_Item_Array(input: any[]): input is Item[] {
    if (Array.isArray(input) && input.every(i => i instanceof Item)) {
        return true;
    }
    return false;
}