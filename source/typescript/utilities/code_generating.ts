/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { ProductionTokenSymbol } from "@candlelib/hydrocarbon/build/types/types/symbol";
import crypto from "crypto";
import { Helper } from "../build/helper.js";
import {
    getTokenSymbolsFromItems,
    getUniqueSymbolName, Symbols_Occlude,
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
    Sym_Is_EOP,
    Sym_Is_Not_Consumed
} from "../grammar/nodes/symbol.js";
import { sk, skRenderAsSK } from "../skribble/skribble.js";
import { SKAssignment, SKBlock, SKCall, SKExpression, SKFunction, SKIdentifierReference, SKIf, SKNode, SKOperatorExpression, SKPrimitiveDeclaration, SKReference } from "../skribble/types/node.js";
import { HCG3Grammar, HCG3Production } from "../types/grammar_nodes.js";
import { BaseOptions, RenderBodyOptions } from "../types/render_body_options.js";
import {
    DefinedSymbol,

    Symbol,
    TokenSymbol
} from "../types/symbol";
import { SymbolType } from "../types/symbol_type";
import { Item } from "./item.js";
import { getProductionClosure, getProductionID } from "./production.js";
/**
 * Length of code hash string appended to GUID constant names. 
 */
const hash_length = 16;



export const createReduceFunctionSK = (item: Item, grammar: HCG3Grammar): SKCall =>
    <SKCall>sk`add_reduce(state, data, ${item.len}, ${item.body_(grammar).reduce_id + 1})`;



export const createDefaultReduceFunctionSk =
    (item: Item): SKCall => <SKCall>sk`add_reduce(state, data, ${item.len})`;


export function getProductionFunctionName(production: HCG3Production, grammar: HCG3Grammar): string {
    return "$" + production.name;
}
export const getProductionFunctionNameSk = (production: HCG3Production, grammar: HCG3Grammar): string => "$" + production.name;

export const createConsumeSk = (lex_name: string): SKCall => <SKCall>sk`consume(${lex_name}, data, state)`;

export const createAssertConsumeSk = (lex_name: string = "l:Lexer", boolean: SKExpression): SKOperatorExpression =>
    <SKOperatorExpression>sk`((${boolean}) && ${createConsumeSk(lex_name)})`;
export const createAssertionShiftSk = (options: BaseOptions, sym: TokenSymbol, lex_name: string = "l"): SKOperatorExpression =>
    createAssertConsumeSk(lex_name, getIncludeBooleansSk([sym], options, lex_name));

export function createProductionCallSk(
    production: HCG3Production,
    options: RenderBodyOptions,
    lexer_name: string = "l"
): SKAssignment {

    const { called_productions, grammar } = options;

    called_productions.add(<number>production.id);

    return <SKAssignment>sk`state = ${getProductionFunctionName(production, grammar)}(${lexer_name}, data, state)`;
}

export function sanitizeSymbolValForCommentSk(sym: string | TokenSymbol): string {
    if (typeof sym == "string")
        return sym.replace(/\*/g, "asterisk");
    return sym.val.toString().replace(/\*/g, "asterisk");
}

export function getAssertionFunctionNameSk(name: string) {
    return `__${name}__`;
}
export function translateSymbolValueSk(sym: TokenSymbol, grammar: HCG3Grammar, lex_name: string = "l"): SKExpression {

    const
        char_len = sym.val.toString().length,
        annotation = `/*[${sanitizeSymbolValForCommentSk(sym)}]*/`;

    if (Sym_Is_EOF(sym))
        return <SKExpression>sk`${lex_name}.END(data)`;

    if (Sym_Is_EOP(sym))
        return <SKExpression>sk`${lex_name}.EOP_TRUE()`;

    const USE_UNICODE = "true";
    switch (sym.type) {

        case SymbolType.GENERATED:
            switch (sym.val) {
                case "ws": return <SKExpression>sk`${lex_name}.isSP(${USE_UNICODE}, data)`;
                case "num": return <SKExpression>sk`${lex_name}.isNum(data)`;
                case "id": return <SKExpression>sk`${lex_name}.isUniID(data)`;
                case "nl": return <SKExpression>sk`${lex_name}.isNL()`;
                case "sym": return <SKExpression>sk`${lex_name}.isSym(${USE_UNICODE}, data)`;
                default: return <SKExpression>sk`false`;
            }
        case SymbolType.LITERAL:
        case SymbolType.ESCAPED:
        case SymbolType.SYMBOL:
            if (char_len == 1) {
                return <SKExpression>sk`${sym.val.codePointAt(0)}${annotation}`;
            } else {
                return <SKExpression>sk`${sym.val.codePointAt(0)}${annotation}`;
            }
        case SymbolType.EMPTY:
            return null;
    }
}
export function createSkipCallSk(
    symbols: TokenSymbol[],
    options: BaseOptions,
    lex_name: string = "l",
    peek: boolean,
    exclude: TokenSymbol[] = [],
    USE_NUMBER = false
): SKExpression {

    const { helper: runner } = options;

    const skip = getSkipFunctionNewSk(symbols, options, undefined, exclude);

    if (skip)
        return <SKExpression>sk`${skip}(${lex_name}/*${symbols.map(s => `[ ${s.val} ]`).join("")}*/, data, ${!peek ? USE_NUMBER ? 0xFFFFFF : "state" : "STATE_ALLOW_SKIP"});\n`;

    return null;
}

export function getSkipFunctionNewSk(
    skip_symbols: TokenSymbol[],
    options: BaseOptions,
    custom_skip_code: SKNode,
    exclude: TokenSymbol[] = []
): SKReference {

    const { helper: runner } = options;

    if (skip_symbols.length == 0)
        return null;

    let fn_ref = getGlobalObjectSk("skip", skip_symbols, runner);

    if (!fn_ref) {


        const
            boolean = getIncludeBooleansSk(skip_symbols, options, "l", exclude),

            skip_function = <SKFunction>sk`
            fn temp:void (l:__Lexer$ref,data:__ParserData$ref, state:u32){

                if (state) == NULL_STATE : return;

                [const] off:u32 = l.token_offset;
                
                loop (1){
                    
                    ${custom_skip_code ? custom_skip_code : ""}
                    
                    if !(${boolean}) : {
                        break;
                    };

                    l.next(data);
                };
                if isOutputEnabled(state) : add_skip(data, l.token_offset - off);
            }`;

        fn_ref = packGlobalFunctionSk("skip", "Lexer", skip_symbols, skip_function, runner);
    }

    return fn_ref;
}

function hashSK(node: SKNode) {
    return hashString(skRenderAsSK(node));
}

export function collapseBranchNamesSk(options: RenderBodyOptions) {
    const { branches, helper: runner } = options;

    for (const { name, body } of branches) {

        const
            hash = expressionListHash(body),

            token_function = <SKFunction>sk`fn temp:i32 (l:__Lexer$ref, data:__ParserData$ref, db:__ParserDataBuffer$ref, state:u32, prod:u32, prod_start:u32){
                /*${hash}*/
            }`;

        token_function.expressions = body;

        var val = packGlobalFunctionSk("branch", "int", token_function, token_function, runner);

        name.value = val.value;
    }
}
/**
 * It is important that the actual assignment of the branch names is differed 
 * until the complete processing of all leaf items, as further code can be
 * added from now until then, which should be reflected in the name of the branch
 * function.
 * 
 * @param branch_expressions 
 * @param options 
 */
export function createBranchFunctionSk(branch_expressions: SKExpression[], options: RenderBodyOptions): SKIdentifierReference {

    let fn_ref: SKIdentifierReference = { type: "reference", value: "temp_" + hashString(branch_expressions.map(skRenderAsSK).join("")) };

    options.branches.push({
        name: fn_ref,
        body: branch_expressions
    });

    return fn_ref;
}

export function createProductionTokenFunctionSk(tok: ProductionTokenSymbol, options: BaseOptions): SKReference {
    const { grammar, helper: runner } = options;
    const prod_id = getProductionID(tok, grammar);
    const closure = getProductionClosure(prod_id, grammar, true);

    const type_info = prod_id << 16;

    let fn_ref = getGlobalObjectSk("tk", closure, runner);

    if (!fn_ref) {

        const production = grammar.productions[prod_id];

        runner.referenced_production_ids.add(production.id);

        const

            anticipated_syms = getTokenSymbolsFromItems(closure, grammar),

            boolean = getIncludeBooleansSk(anticipated_syms, options),

            token_function = <SKFunction>sk`
            fn temp:bool(l:__Lexer$ref,data:__ParserData$ref){       
                if (l.type) == ${type_info} : return : true;
                
                if ${boolean} :{          
                    
                    // preserve the current state of the data
                    [const] stack_ptr :u32 = data.stack_ptr;
                    [const] input_ptr:u32 = data.input_ptr;
                    [const] state:u32 = data.state;
                    [const] copy:Lexer = l.copyInPlace();

                    pushFN(data, &> ${getProductionFunctionNameSk(production, grammar)});

                    data.state = NULL_STATE;

                    [mut]ACTIVE:bool = true;

                    loop ( (ACTIVE) ) {
                        ACTIVE = stepKernel(data, l, stack_ptr + 1);
                    };

                    data.state = state;

                    if data.prod ~= ${production.id} : {
                        data.stack_ptr = stack_ptr;
                        data.input_ptr = input_ptr;
                        l.slice(copy);
                        l.type = ${type_info};
                        return: true;
                    } else {
                        l.sync(copy);
                        data.stack_ptr = stack_ptr;
                        data.input_ptr = input_ptr;
                        return: false;
                    };
                };
                
                return: false;
            }`;

        return packGlobalFunctionSk("tk", "bool", closure, token_function, runner);
    } else
        return fn_ref;
}

export function createNonCaptureBooleanCheckSk(symbols: TokenSymbol[], options: BaseOptions, ambient_symbols: TokenSymbol[]): SKReference {

    const { helper: runner } = options;

    let fn_ref = getGlobalObjectSk("nocap", symbols, runner);



    if (!fn_ref) {
        const
            boolean =
                getIncludeBooleansSk(symbols.map(sym => Object.assign({}, sym, { IS_NON_CAPTURE: false })), options, "l", ambient_symbols),

            token_function = <SKFunction>sk`
                fn temp:bool(l:__Lexer$ref, data:__ParserData$ref){
                    [const] a:u32 = l.token_length;
                    [const] b:u32 = l.byte_length;

                    if (${boolean}): {
                        l.token_length = 0;
                        l.byte_length = 0;
                        return : true;
                    };

                    l.token_length = a;
                    l.byte_length = b;

                    return : false;
                }
            `;

        return packGlobalFunctionSk("nocap", "bool", symbols, token_function, runner);
    } else return fn_ref;
}

/**
 * Creates a function that maps symbols to numbers
 * @param options 
 * @param lex_name 
 * @param defined_symbol_mappings 
 * @param generic_symbol_mappings 
 * @param all_syms 
 */
export function createSymbolMappingFunctionSk(
    options: RenderBodyOptions,
    lex_name: string,
    symbol_mappings: [number, Symbol][],
    default_return_value: string = "-1"
): SKReference {
    const symbols = symbol_mappings.map(([, s]) => s);
    const empty = symbol_mappings.filter(([i, s]) => s.type == "empty")[0];

    if (empty)
        default_return_value = "l.setToken( TokenSymbol, 0, 0 ); return:" + empty[0];
    else
        default_return_value = "return:" + (default_return_value || "-1");

    let fn_ref;// = getGlobalObject("sym_map", symbols, options.helper);

    if (!fn_ref) {

        const
            { grammar, helper: runner } = options,

            defined_symbol_mappings: [number, DefinedSymbol][]
                = <[number, DefinedSymbol][]>symbol_mappings.filter(([, sym]) => Sym_Is_Defined(sym) && sym.type !== "empty"),

            generic_symbol_mappings: [number, TokenSymbol][]
                = <[number, TokenSymbol][]>symbol_mappings.filter(([, sym]) => Sym_Is_A_Generic_Type(sym)),

            production_token_symbol: [number, TokenSymbol][]
                = <[number, TokenSymbol][]>symbol_mappings.filter(([, sym]) => Sym_Is_A_Production_Token(sym)),

            defined_symbols_reversed_map = new Map(defined_symbol_mappings.map((([i, s]) => [getUniqueSymbolName(s), i]))),

            all_syms: Symbol[] = generic_symbol_mappings.map(([, sym]) => sym),

            fn_lex_name = "l",

            gen = buildSwitchIfsAlternateSk(grammar, defined_symbol_mappings.map(([, s]) => s), fn_lex_name);

        //Defined Symbols
        let yielded = gen.next();

        while (yielded.done == false) {

            const { code_node, sym } = yielded.value;

            let block = code_node;

            if (Sym_Is_Defined_Identifier(sym) && all_syms.some(Sym_Is_A_Generic_Identifier)) {
                const _if = <SKIf>sk`if l.isDiscrete(data, TokenIdentifier,${sym.byte_length}) : { }`;
                block.push(_if);
                block = (<SKBlock>_if.expression).expressions;
            } else if (Sym_Is_Defined_Natural_Number(sym) && all_syms.some(Sym_Is_A_Generic_Number)) {
                const _if = <SKIf>sk`if l.isDiscrete(data, TokenNumber,${sym.byte_length}) : { }`;
                block.push(_if);
                block = (<SKBlock>_if.expression).expressions;
            }

            const sym_id = getUniqueSymbolName(sym);

            block.push(
                <SKExpression>sk`${lex_name}.setToken(TokenSymbol, ${sym.byte_length}, ${sym.val.length});`,
                <SKExpression>sk`return: ${defined_symbols_reversed_map.get(sym_id)};`
            );

            yielded = gen.next();
        }

        //Generic Symbols

        let ifs = [], leaf = null;

        for (const [id, sym] of [
            ...production_token_symbol,
            ...generic_symbol_mappings
        ]) {
            const sc = sk`
                if ${getIncludeBooleansSk(
                [sym],
                options,
                lex_name,
                symbol_mappings.map(([, s]) => s)
                    .filter(Sym_Is_A_Terminal)
            )} : {
                    return : ${id};
                }
            `;

            ifs.push(sc);
        }
        // Merge the separate if statements in to a single if-elseif-else chain
        ifs.reduce((r: SKIf, a: SKIf) => ((!r) ? a : (r.else = a, a)), null);

        const
            code_node = yielded.value,

            fn = <SKFunction>sk`fn temp:i32(l:__Lexer$ref, data:__ParserData$ref){
                //'"${symbols.map(s => s.val).join(" ")}"';
                ${[code_node, ";", ifs[0], ";"]}
                ${default_return_value};
            }`;

        return packGlobalFunctionSk("sym_map", "int", fn, fn, options.helper);
    }

    return fn_ref;
}

function getUTF8ByteAtSk(s: DefinedSymbol, off: number): number {
    return s.val.charCodeAt(off);
}

export function* buildSwitchIfsAlternateSk(
    grammar: HCG3Grammar,
    syms: DefinedSymbol[],
    lex_name: string = "l",
    occluders: TokenSymbol[] = [],
    off = 0
): Generator<IfNode, IfNode["code_node"], void> {
    if (off == 0) syms = ensureSymbolsAreGlobalSk(syms, grammar);

    //Group symbols based on their 
    let pending_syms = syms
        .filter(s => (s.byte_length - off) > 0)
        .group(s => getUTF8ByteAtSk(s, off));

    let ifs = [];

    for (const syms of pending_syms) {

        //Construct a compare on the longest string
        const shortest = syms.sort((a, b) => a.byte_length - b.byte_length)[0];

        let gen: Generator<IfNode, IfNode["code_node"], void>;

        if (syms.length == 1) {
            gen = buildSwitchIfsSk(grammar, syms, lex_name, occluders, off + 1);
        } else {
            gen = buildSwitchIfsAlternateSk(grammar, syms, lex_name, occluders, off + 1);
        }

        let yielded = gen.next();

        while (yielded.done == false) {
            yield yielded.value;
            yielded = gen.next();
        }

        const _if = sk`if data.input[l.byte_offset + ${off}] ~= ${getUTF8ByteAtSk(shortest, off)} : { ${yielded.value.flatMap(v => [v, ";"])}; }`;

        ifs.push(_if);
    }

    ifs.reduce((r: SKIf, a: SKIf) => ((!r) ? a : (r.else = a, a)), null);

    const code_node = ifs.length > 0 ? [ifs[0]] : [];

    for (const sym of syms) {
        if (sym.byte_length <= off) {

            yield { sym, code_node };
            break;
        }
    }

    return code_node;
}

type IfNode = {
    sym: DefinedSymbol;
    code_node: SKExpression[];
};

export function* buildSwitchIfsSk(
    grammar: HCG3Grammar,
    syms: DefinedSymbol[],
    lex_name: string = "l",
    occluders: TokenSymbol[] = [],
    off = 0
): Generator<IfNode, SKExpression[], void> {

    if (off == 0)
        syms = ensureSymbolsAreGlobalSk(syms, grammar);

    let ifs = [];

    //Group symbols based on their 
    let pending_syms = syms
        .filter(s => typeof s.byte_offset == "number")
        .filter(s => (s.byte_length - off) > 0)
        .group(s => s.byte_offset);

    for (const syms of pending_syms) {

        //Construct a compare on the longest string
        const shortest = syms.sort((a, b) => a.byte_length - b.byte_length)[0];
        const length = shortest.byte_length - off;
        const offset = shortest.byte_offset + off;

        const gen = buildSwitchIfsSk(grammar, syms, lex_name, occluders, off + length);

        let yielded = gen.next();
        while (yielded.done == false) {
            yield yielded.value;
            yielded = gen.next();
        }
        const vals = yielded.value.flatMap(m => [m, ";"]).slice(0, -1);
        let _if = length == 1
            ? sk`if data.input[l.byte_offset + ${off}] ~= ${getUTF8ByteAtSk(shortest, off)} : { ${vals} }`
            : sk`if ${length} == compare(data, l.byte_offset + ${off}, ${offset}, ${length}) : { ${vals} }`;

        ifs.push(_if);
    }


    ifs.reduce((r: SKIf, a: SKIf) => ((!r) ? a : (r.else = a, a)), null);

    const code_node = ifs.length > 0 ? [ifs[0]] : [];

    for (const sym of syms) {
        if (sym.byte_length <= off)
            yield { sym, code_node };
    }

    return code_node;
}

export function buildIfsSk(
    options: BaseOptions,
    syms: DefinedSymbol[],
    lex_name: string = "l",
    occluders: TokenSymbol[] = []
): SKExpression[] {

    const
        { grammar } = options,
        gen = buildSwitchIfsSk(grammar, syms, lex_name, occluders);

    let yielded = gen.next();

    while (yielded.done == false) {

        const { code_node, sym } = yielded.value;

        if (code_node) {


            code_node.push(
                <SKExpression>sk`${lex_name}.setToken(TokenSymbol, ${sym.byte_length}, ${sym.val.length})`
            );

            if (Sym_Is_Defined_Identifier(sym) && occluders.some(Sym_Is_A_Generic_Identifier))
                code_node.push(<SKExpression>sk`if !l.isDiscrete(data,TokenIdentifier,${sym.byte_length}) : return : false`);

            if (Sym_Is_Defined_Natural_Number(sym) && occluders.some(Sym_Is_A_Generic_Number))
                code_node.push(<SKExpression>sk`if !l.isDiscrete(data,TokenNumber,${sym.byte_length}) : return : false`);

            code_node.push(<SKExpression>sk`return : true`);
        }

        yielded = gen.next();
    }

    const code_node = yielded.value;

    code_node.push(<SKExpression>sk`return : false`);

    return code_node;
}

export function getIncludeBooleansSk(
    syms: TokenSymbol[],
    options: BaseOptions,
    lex_name: string = "l",
    /* List of all symbols that can be encountered*/
    ambient_symbols: TokenSymbol[] = [],
    ALLOW_GEN_OCCLUSION = false
): SKExpression {

    const { grammar, helper: runner } = options;

    syms = syms.setFilter(s => getUniqueSymbolName(s));

    ambient_symbols = ambient_symbols.concat(syms).setFilter(getUniqueSymbolName);

    let
        HAVE_GEN_ID = syms.some(Sym_Is_A_Generic_Identifier),
        non_consume = syms.filter(Sym_Is_Not_Consumed),
        consume = syms.filter(Sym_Is_Consumed),
        def = consume.filter(Sym_Is_Defined),
        ty = consume.filter(Sym_Is_A_Generic_Type),
        tk = consume.filter(Sym_Is_A_Production_Token),
        fn = consume.filter(Sym_Is_An_Assert_Function)
            .map(s => translateSymbolValueSk(s, grammar, lex_name)).sort();

    if (def.length + ty.length + fn.length + tk.length + non_consume.length == 0)
        return null;

    let out_id: SKExpression[] = [], out_ty: SKExpression[] = [], out_fn: SKExpression[] = [], out_tk: SKExpression[] = [], out_non_consume: SKExpression[] = [];

    if (non_consume.length > 0) {

        const
            fn_name = createNonCaptureBooleanCheckSk(non_consume, options, ambient_symbols);

        out_non_consume.push(<SKExpression>sk`${fn_name}(${lex_name}, data) /*${non_consume.map(sym => `[${sanitizeSymbolValForCommentSk(sym)}]`).join(" ")}*/`);
    }

    if (fn.length > 0)
        out_fn = fn;

    if (def.length > 0) {

        if (HAVE_GEN_ID && ALLOW_GEN_OCCLUSION)
            def = def.filter(id => !Sym_Is_Defined_Identifier(id));

        const
            booleans: SKExpression[] = [],
            char_tuples: [DefinedSymbol, TokenSymbol[]][] = [];

        let table = 0n, table_syms = [];

        for (const sym of def) {

            const
                char_code = sym.val.charCodeAt(0),
                occluders = ambient_symbols.filter(a_sym => Symbols_Occlude(a_sym, sym));

            if (occluders.length > 0 || sym.val.length > 1) {

                char_tuples.push(<[DefinedSymbol, TokenSymbol[]]>[sym, occluders]);

            } else if (char_code < 128) {

                table_syms.push(sym);

                table |= 1n << BigInt(char_code);

            } else {
                booleans.push(getLexerByteBooleanSk(lex_name, char_code));
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

                sym = <DefinedSymbol>getCardinalSymbol(grammar, sym);

                if (sym.byte_length == 1) {
                    const
                        char_code = sym.val.charCodeAt(0);
                    booleans.push(getLexerByteBooleanSk(lex_name, char_code));
                } else {
                    booleans.push(
                        <SKExpression>
                        sk`/*[${sanitizeSymbolValForCommentSk(sym)}]*/cmpr_set(${lex_name},data, ${sym.byte_offset}, ${sym.byte_length}, ${sym.val.length})`
                    );
                }
            } else {
                let fn_ref = getGlobalObjectSk("dt", [...syms, ...occluders], runner);

                if (!fn_ref) {

                    const
                        nodes = buildIfsSk(options, syms, "l", occluders),
                        fn = <SKFunction>sk`fn temp:bool(l:__Lexer$ref, data:__ParserData$ref){
                            ${nodes.flatMap((m => [m, ";"]))}
                        }`;
                    fn_ref = packGlobalFunctionSk("dt", "bool", [...syms, ...occluders], fn, runner);
                }

                booleans.push(
                    <SKExpression>
                    sk`${fn_ref}(${lex_name}, data)`
                );
            }
        }

        if (table > 0n) {

            if (table_syms.length < 3) {

                for (const sym of table_syms)
                    booleans.push(getLexerByteBooleanSk(lex_name, sym.val.charCodeAt(0)));

            } else {

                booleans.push(
                    <SKExpression>
                    sk`assert_ascii(${lex_name}, ${["0x" + ((table >> 0n) & 0xffffffffn).toString(16),
                    "0x" + ((table >> 32n) & 0xffffffffn).toString(16),
                    "0x" + ((table >> 64n) & 0xffffffffn).toString(16),
                    "0x" + ((table >> 96n) & 0xffffffffn).toString(16)].join(",")

                        })`
                );
            }
        }

        out_id = booleans;
    }

    if (ty.length > 0)
        out_ty = ty.sort((a, b) => a.val < b.val ? -1 : 1).map(s => translateSymbolValueSk(s, grammar, lex_name));

    //*
    if (tk.length > 0) {
        for (const tok of tk) {

            const
                fn_name = createProductionTokenFunctionSk(tok, options),
                fn = <SKExpression>sk`${fn_name}(${lex_name}, data)`;

            out_tk.push(fn);
        }
    }
    //*/

    return convertExpressionArrayToBooleanSk([...out_non_consume, ...out_tk, ...out_id, ...out_ty, ...out_fn]);
}

function ensureSymbolsAreGlobalSk<T = Symbol>(syms: T[], grammar: HCG3Grammar): T[] {
    return <T[]><any>(<Symbol[]><any>syms).map(s => getCardinalSymbolSk(grammar, s));
}

function getCardinalSymbol(grammar: HCG3Grammar, sym: Symbol): Symbol {
    return <any>grammar.meta.all_symbols.get(getUniqueSymbolName(sym));
}

function getCardinalSymbolSk(grammar: HCG3Grammar, sym: Symbol): Symbol {
    return <any>grammar.meta.all_symbols.get(getUniqueSymbolName(sym));
}
function convertExpressionArrayToBooleanSk(array: SKExpression[], delimiter: string = "||"): SKExpression {
    return <SKExpression>sk`${array.flatMap(m => [m, delimiter]).slice(0, -1)}`;
}

function getLexerByteBooleanSk(lex_name: string, char_code: number, operator: string = "~="): SKExpression {
    return <SKExpression>sk`${lex_name}.current_byte ${operator} ${char_code} /*[${String.fromCharCode(char_code)}]*/`;
}
/**
 * 
 */
export function packGlobalFunctionSk(fn_class: string, fn_type: string, unique_objects: ((Symbol | Item)[] | SKFunction), fn: SKFunction, helper: Helper): SKReference {

    const string_name = getGloballyConsistentNameSk(fn_class, unique_objects);
    const function_name = <SKPrimitiveDeclaration>sk`${string_name}:${fn_type}`;
    return helper.add_constant(function_name, fn);
}

function getGlobalObjectSk(fn_class: string, unique_objects: ((Symbol | Item)[] | SKFunction), runner: Helper) {
    const name = getGloballyConsistentNameSk(fn_class, unique_objects);

    return runner.constant_map.has(name)
        ? runner.constant_map.get(name).name
        : null;
}
/**
 * Generate a function name that is consistent amongst
 * all workers. 
 */
export function getGloballyConsistentNameSk(prepend_js_identifier: string, unique_objects: ((Symbol | Item)[] | SKFunction)): string {

    let string_to_hash = "";
    if (This_Is_An_SKFunction(unique_objects)) {
        string_to_hash = skRenderAsSK(unique_objects);
    } else {
        if (This_Is_An_Item_ArraySk(unique_objects)) {
            string_to_hash = unique_objects.map(i => i.id).setFilter().sort().join("");
        } else {
            string_to_hash = (<Symbol[]>unique_objects).map(getUniqueSymbolName).setFilter().sort().join("");
        }
    }

    return `${prepend_js_identifier}_${hashString(string_to_hash).slice(0, 16)}`;
}


export function nodeHash(node: SKNode) {
    return hashString(skRenderAsSK(node));
}


export function expressionListHash(exprs: SKExpression[]) {
    return hashString(exprs.map(skRenderAsSK).join(""));
}

export function hashString(string: string) {
    return crypto.createHash('md5').update(string).digest("hex");
}
function This_Is_An_Item_Array(input: any[]): input is Item[] {
    if (Array.isArray(input) && input.every(i => i instanceof Item)) {
        return true;
    }
    return false;
}

function This_Is_An_Item_ArraySk(input: any[] | any): input is Item[] {
    if (Array.isArray(input) && input.every(i => i instanceof Item)) {
        return true;
    }
    return false;
}

function This_Is_An_SKFunction(input: any): input is SKFunction {
    if (input.type == "function" && input.name && input.return_type && input.parameters && input.expressions) {
        return true;
    }
    return false;
}

export function addItemAnnotationToExpressionList(items: Item[], grammar: HCG3Grammar, root: SKExpression[]) {
    for (const item_str of items.map(i => i.renderUnformattedWithProduction(grammar)))
        root.push(<SKExpression><SKString>{
            type: "string",
            value: item_str.replace(/\'/g, '"').replace(/\\/g, "f:s")
        });
}

export function addSymbolAnnotationsToExpressionList(syms: Symbol[], grammar: HCG3Grammar, expression_list: SKExpression[], comment: string = "") {
    const symbol_string = syms.map(s => ("" + s.val).replace(/\'/g, '"').replace(/\\/g, "f:s")).join(" ");

    expression_list.unshift(<SKExpression><SKString>{
        type: "string",
        value: comment + " [  " + symbol_string + "  ]"
    });

}