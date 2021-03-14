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
    Symbols_Occlude,
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
import { parser, sk, skRenderAsSK } from "../skribble/skribble.js";
import { SKIdentifierReference, SKIf, SKBlock, SKReference, SKExpression, SKPrimitiveDeclaration, SKFunction, SKNode, SKCall, SKOperatorExpression, SKAssignment } from "../skribble/types/node.js";
/**
 * Length of code hash string appended to GUID constant names. 
 */
const hash_length = 16;

export function createReduceFunction(item: Item, grammar: Grammar): StmtSC {
    return SC.Expressions(SC.Call(SC.Constant("add_reduce"), rec_state, rec_glob_data_name, SC.Value(item.len + ""), SC.Value((item.body_(grammar).reduce_id + 1) + "")));
}

export const createReduceFunctionSK = (item: Item, grammar: Grammar): SKCall => 
    <SKCall>sk`add_reduce(state, data, ${item.len}, ${item.body_(grammar).reduce_id + 1})`


export function createDefaultReduceFunction(item: Item): StmtSC {
    return SC.Expressions(SC.Call(SC.Constant("add_reduce"), rec_state, rec_glob_data_name, SC.Value(item.len + ""), SC.Value("0")));
}
export const createDefaultReduceFunctionSk = 
    (item: Item):SKCall => <SKCall>sk`add_reduce(state, data, ${item.len})`

export function generateGUIDConstName(fn_data: SC, prefix: string = "id", type: string = "void") {
    return SC.Constant(`${prefix}_${fn_data.hash().slice(-hash_length)}:${type}`);
}

export const generateGUIDConstNameSK = (fn_data: SC, prefix: string = "id", type: string = "void"):SKPrimitiveDeclaration => 
    <SKPrimitiveDeclaration>sk`${prefix}_${fn_data.hash().slice(-hash_length)}:${type}`;

export function getProductionFunctionName(production: Production, grammar: Grammar): string {
    return "$" + production.name;
}
export const getProductionFunctionNameSk = (production: Production, grammar: Grammar): string => "$" + production.name;
export function createConsume(lex_name: ConstSC | VarSC): ExprSC {
    return SC.Call(rec_consume_call, lex_name, rec_glob_data_name, rec_state);
}
export const createConsumeSk = (lex_name: string): SKCall => <SKCall>sk`consume(${lex_name}, data, state)`;
export function createAssertConsume(lex_name: ConstSC | VarSC = SC.Variable("l:Lexer"), boolean: ExprSC): ExprSC {
    return SC.Binary(boolean, "&&", createConsume(lex_name));
}
export const createAssertConsumeSk = (lex_name: string = "l:Lexer", boolean: SKExpression): SKOperatorExpression => 
    <SKOperatorExpression>sk`${boolean} && ${createConsumeSk(lex_name)}`;
export function createAssertionShift(options: BaseOptions, sym: TokenSymbol, lex_name: ConstSC | VarSC = SC.Variable("l:Lexer")): ExprSC {
    return createAssertConsume(lex_name, getIncludeBooleans([sym], options, lex_name));
}

export const createAssertionShiftSk = (options: BaseOptions, sym: TokenSymbol, lex_name: string = "l"): SKOperatorExpression => 
    createAssertConsumeSk(lex_name, getIncludeBooleansSk([sym], options, lex_name));

export function createProductionCall(
    production: Production,
    options: RenderBodyOptions,
    lexer_name: VarSC = rec_glob_lex_name
): ExprSC {

    const { called_productions, grammar } = options;

    called_productions.add(<number>production.id);


    return SC.Binary(rec_state, "=", SC.Call(SC.Constant(getProductionFunctionName(production, grammar) + ":unsigned int"), lexer_name, rec_glob_data_name, rec_state));
}

export function createProductionCallSk(
    production: Production,
    options: RenderBodyOptions,
    lexer_name: string = "l"
): SKAssignment {

    const { called_productions, grammar } = options;

    called_productions.add(<number>production.id);

    return <SKAssignment>sk`state = ${getProductionFunctionName(production, grammar) }(${lexer_name}, data, state)`
}

export function sanitizeSymbolValForComment(sym: string | TokenSymbol): string {
    if (typeof sym == "string")
        return sym.replace(/\*/g, "asterisk");
    return sym.val.toString().replace(/\*/g, "asterisk");
}

export function sanitizeSymbolValForCommentSk(sym: string | TokenSymbol): string {
    if (typeof sym == "string")
        return sym.replace(/\*/g, "asterisk");
    return sym.val.toString().replace(/\*/g, "asterisk");
}

export function getAssertionFunctionName(name: string) {
    return `__${name}__`;
}

export function getAssertionFunctionNameSk(name: string) {
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

export function translateSymbolValueSk(sym: TokenSymbol, grammar: Grammar, lex_name: string = "l"): SKExpression {

    const
        char_len = sym.val.toString().length,
        annotation = `/*[${sanitizeSymbolValForComment(sym)}]*/`;

    if (Sym_Is_EOF(sym))
        return <SKExpression>sk`${lex_name}.END(data)`;
    const USE_UNICODE = "true";
    switch (sym.type) {
        case SymbolType.PRODUCTION_ASSERTION_FUNCTION:
            if (sym.DOES_SHIFT)
                return <SKExpression>sk`${SC.Value(getAssertionFunctionName(sym.val))}(${lex_name})`;
            else
                return <SKExpression>sk`${SC.Value(getAssertionFunctionName(sym.val))}(${lex_name})`;

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

export function createSkipCall(
    symbols: TokenSymbol[],
    options: BaseOptions,
    lex_name: ExprSC = SC.Variable("l", "Lexer"),
    peek: boolean,
    exclude: TokenSymbol[] = [],
    USE_NUMBER = false
): StmtSC {

    const { helper: runner } = options;

    const skips = getSkipFunctionNew(symbols, options, undefined, lex_name, exclude);

    if (skips)
        return SC.Expressions(SC.Call(skips, SC.UnaryPost(lex_name, SC.Comment(symbols.map(s => `[ ${s.val} ]`).join(""))), rec_glob_data_name, !peek ? USE_NUMBER ? 0xFFFFFF : "state" : "0"));

    return SC.Expressions(SC.Empty());
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

    const skips = getSkipFunctionNewSk(symbols, options, undefined, lex_name, exclude);

    if (skips)
        return <SKExpression>sk`${skips}(${lex_name}/*${symbols.map(s => `[ ${s.val} ]`).join("")}*/, data, ${!peek ? USE_NUMBER ? 0xFFFFFF : "state" : "0"});\n`;

    return null;
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
                    "state:int"
                ).addStatement(
                    SC.Value("const off = l.token_offset"),
                    SC.While(SC.Value(1)).addStatement(
                        custom_skip_code ? custom_skip_code : SC.Empty(),
                        SC.If(SC.UnaryPre("!", SC.Group("(", boolean)))
                            .addStatement(SC.Break),
                        SC.Call(SC.Member("l", "next"), rec_glob_data_name),
                    ),
                    SC.If(SC.Value("isOutputEnabled(state)")).addStatement(SC.Call("add_skip", "l", "data", SC.Value("l.token_offset - off")))
                );

        fn_ref = packGlobalFunction("skip", "Lexer", skip_symbols, skip_function, runner);
    }

    return <VarSC>fn_ref;
}

export function getSkipFunctionNewSk(
    skip_symbols: TokenSymbol[],
    options: BaseOptions,
    custom_skip_code: SC = null,
    lex_name: string = "l",
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
            fn temp:void (l:Lexer, data:Data, state:u32){
                [const] off = l.token_offset;
                loop(1):{
                    
                    ${custom_skip_code ? custom_skip_code + ";" : ""}
                    
                    if !(${boolean}) : {
                        break;
                    }

                    l.next(data);
                    
                    if isOutputEnabled(state) : add_skip(l, data, l.token_offset - off);
                }
            }`;

        fn_ref = packGlobalFunctionSk("skip", "Lexer", skip_symbols, skip_function, runner);
    }

    return fn_ref;
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
                "prod:u32",
                "puid:u32"
            ).addStatement(body,
                hash,
            );

        fn_ref = <VarSC>packGlobalFunction("branch", "int", body, token_function, runner);

        name.type = (<VarSC>fn_ref).type;
    }
}

function hashSK(node:SKNode){
    return hashString(skRenderAsSK(node))
}

export function collapseBranchNamesSk(options: RenderBodyOptions) {
    const { branches, helper: runner } = options;

    for (const { name, body } of branches) {

        const
            hash = hashSK(body),

            token_function = <SKFunction>sk`fn temp:u32 (l:Lexer, data:Data, state:u32, prod:u32, puid:u32){
                ${body};
                /*${hash}*/
            }`;

            
        packGlobalFunctionSk("branch", "int", body, token_function, runner);
    }
}
/**
 * It is important that the actual assignment of the branch names is differed 
 * until the complete processing of all leaf items, as further code can be
 * added from now until then, which should be reflected in the name of the branch
 * function.
 * 
 * @param items 
 * @param branch_code 
 * @param options 
 */
export function createBranchFunction(branch_code: SC, options: RenderBodyOptions): VarSC {

    let fn_ref = SC.Variable(branch_code.hash() + "temporary_name:void");

    options.branches.push({
        name: fn_ref,
        body: branch_code
    });

    return <VarSC>fn_ref;
}

export function createBranchFunctionSk(branch_expressions: SKExpression[], options: RenderBodyOptions): SKIdentifierReference {

    let fn_ref:SKIdentifierReference = { type:"reference", value: hashString(branch_expressions.map(skRenderAsSK).join(""))  };

    options.branches.push({
        name: fn_ref,
        body: branch_expressions
    });

    return fn_ref;
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

export function createProductionTokenFunctionSk(tok: ProductionTokenSymbol, options: BaseOptions): SKReference {
    const { grammar, helper: runner } = options;
    const prod_id = getProductionID(tok, grammar);
    const closure = getProductionClosure(prod_id, grammar, true);

    let fn_ref = getGlobalObjectSk("tk", closure, runner);

    if (!fn_ref) {

        const production = grammar[prod_id];

        runner.referenced_production_ids.add(production.id);

        const

            anticipated_syms = getTokenSymbolsFromItems(closure, grammar),

            boolean = getIncludeBooleansSk(anticipated_syms, options),

            token_function = <SKFunction>sk`
            fn temp:bool(l:Lexer, data:Data){       
                /*! --- This assumes the token production does not fork --- !*/

                if (${boolean}):{               
                    // preserve the current state of the data
                    [const] stack_ptr :u32 = data.stack_ptr;
                    [const] input_ptr:u32 = data.input_ptr;
                    [const] state:u32 = data.state;
                    [const] copy:Lexer = l.copy();

                    pushFN(data, ${getProductionFunctionNameSk(production, grammar)});

                    data.state = 0;

                    ACTIVE:bool = true;

                    loop ACTIVE: {
                        ACTIVE = false;
                        ACTIVE = stepKernel(data, stack_ptr + 1);
                    }

                    data.state = state;

                    if data.prod == ${production.id} : {
                        data.stack_ptr = stack_ptr;
                        data.input_ptr = input_ptr;
                        l.slice(copy);
                        return: true;
                    } else {
                        l.sync(copy);
                        data.stack_ptr = stack_ptr;
                        data.input_ptr = input_ptr;
                        return: false;
                    }
                }
                
                return: false;
            }`

        return packGlobalFunctionSk("tk", "bool", closure, token_function, runner);
    }else 
        return fn_ref;
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
                SC.Declare(SC.Assignment("a", SC.Member("l", "token_length"))),
                SC.Declare(SC.Assignment("b", SC.Member("l", "byte_length"))),
                SC.If(boolean)
                    .addStatement(
                        SC.Assignment(SC.Member("l", "token_length"), "a"),
                        SC.Assignment(SC.Member("l", "byte_length"), "b"),
                        SC.UnaryPre(SC.Return, SC.True)
                    ),
                SC.UnaryPre(SC.Return, SC.False)
            );

        fn_ref = packGlobalFunction("nocap", "bool", symbols, token_function, runner);
    }

    return <VarSC>fn_ref;
}

export function createNonCaptureBooleanCheckSk(symbols: TokenSymbol[], options: BaseOptions, ambient_symbols: TokenSymbol[]): SKReference {

    const { helper: runner } = options;

    let fn_ref = getGlobalObjectSk("nocap", symbols, runner);


    if (!fn_ref) {
        const
            boolean =
                getIncludeBooleansSk(symbols.map(sym => Object.assign({}, sym, { IS_NON_CAPTURE: false })), options, "l", ambient_symbols),

            token_function = <SKFunction>sk`
                fn temp:bool(l:Lexer){
                    [const] a:u32 = l.token_length;
                    [const] b:u32 = l.byte_length;

                    if (${boolean}): {
                        l.token_length = a;
                        l.byte_length = b;
                        return : true;
                    }

                    return : false;
                }
            `

        return packGlobalFunctionSk("nocap", "bool", symbols, token_function, runner);
    }else return fn_ref;
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
    symbol_mappings: [number, Symbol][],
    default_return_value:ExprSC = SC.Value("-1")
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
            fn = SC.Function(":int", fn_lex_name, rec_glob_data_name)
                .addStatement(
                    symbols.map(s => s.val).join(" "),
                    code_node,
                    if_root,
                    SC.UnaryPre(SC.Return, default_return_value)
                );

        fn_ref = packGlobalFunction("sym_map", "int", fn, fn, options.helper);
    }

    return fn_ref;
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
    default_return_value:string = "-1"
): SKReference {
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

            fn_lex_name = "l",

            gen = buildSwitchIfsAlternateSk(grammar, defined_symbol_mappings.map(([, s]) => s), fn_lex_name);

        //Defined Symbols
        let yielded = gen.next();

        while (yielded.done == false) {

            const { code_node, sym } = yielded.value;
            
            let discretion = (Sym_Is_Defined_Identifier(sym) && all_syms.some(Sym_Is_A_Generic_Identifier))
                ? Object.assign(code_node, sk`if l.isDiscrete(data, TokenIdentifier,${sym.byte_length}) : { }`)
                : (Sym_Is_Defined_Natural_Number(sym) && all_syms.some(Sym_Is_A_Generic_Number))
                    ? Object.assign(code_node, sk`if l.isDiscrete(data, TokenNumber,${sym.byte_length}) : { }`)
                    : code_node;

            discretion.expression.expressions.push(
                <SKExpression>sk`/* ${sym.val} */`,
                <SKExpression>sk`${lex_name}.setToken(TokenSymbol, ${sym.byte_length}, ${sym.val.length});`,
                <SKExpression>sk`return: ${defined_symbols_reversed_map.get(sym)};`
            )

            yielded = gen.next();
        }

        //Generic Symbols

        let ifs = [], leaf = null;

        for (const [id, sym] of [
            ...production_token_symbol,
            ...generic_symbol_mappings
        ]) {
            const sc =`
                if (${getIncludeBooleansSk(
                    [sym],
                    options,
                    lex_name,
                    symbol_mappings.map(([, s]) => s)
                        .filter(Sym_Is_A_Terminal)
                )}) : {
                    return : ${id};
                }
            `;

            ifs.push(sc);
        }
        
        ifs.reduce((r:SKIf,a:SKIf)=>((!r) ? a : (r.else = a, a)), null)

        const
            code_node = yielded.value,    

            fn = <SKFunction>sk`fn temp:i32(l:Lexer, data:Data){
                /*${symbols.map(s => s.val).join(" ")}*/
                ${code_node};
                ${ifs[0]};
                return:${default_return_value};
            }`

        return packGlobalFunctionSk("sym_map", "int", fn, fn, options.helper);
    }

    return fn_ref;
}


function getUTF8ByteAt(s: DefinedSymbol, off: number): number {
    return s.val[off].charCodeAt(0);
}

function getUTF8ByteAtSk(s: DefinedSymbol, off: number): number {
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

export function* buildSwitchIfsAlternateSk(
    grammar: Grammar,
    syms: DefinedSymbol[],
    lex_name: string = "l",
    occluders: TokenSymbol[] = [],
    off = 0
): Generator<IfNode, IfNode["code_node"], void> {
    if (off == 0) syms = ensureSymbolsAreGlobal(syms, grammar);

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

        const _if = sk`if data.input[l.byte_offset + ${off}] == ${getUTF8ByteAtSk(shortest, off)} : { ${yielded.value}; }`;
            
        ifs.push(_if);
    }


    ifs.reduce((r:SKIf,a:SKIf)=>((!r) ? a : (r.else = a, a)), null)

    const code_node = <IfNode["code_node"]>ifs[0];

    for (const sym of syms) {
        if (sym.byte_length <= off)
            yield { sym, code_node };
    }

    return code_node;
}

type IfNode = {
    sym: DefinedSymbol;
    code_node:  SKExpression[];
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

export function* buildSwitchIfsSk(
    grammar: Grammar,
    syms: DefinedSymbol[],
    lex_name: string = "l",
    occluders: TokenSymbol[] = [],
    off = 0
): Generator<IfNode, SKExpression[], void> {

    if (off == 0)
        syms = ensureSymbolsAreGlobal(syms, grammar);

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
        const vals = yielded.value.flatMap(m=>[m,";"]).slice(0, -1);
        let _if = length == 1
            ? sk`if (data.input[l.byte_offset + ${off}] == ${getUTF8ByteAtSk(shortest, off)} ): { ${vals} }`
            : sk`if (${length} == compare(data, l.byte_offset + ${off}, ${offset}, ${length})) : { ${vals} }`;

        ifs.push(_if);
    }


    ifs.reduce((r:SKIf,a:SKIf)=>((!r) ? a : (r.else = a, a)), null)

    const code_node = ifs.length>0 ? [ifs[0]] : [];

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

        if( code_node){
            
            
            code_node.push(
                <SKExpression>sk`${lex_name}.setToken(TokenSymbol, ${sym.byte_length}, ${sym.val.length})`
                )
            
            if (Sym_Is_Defined_Identifier(sym) && occluders.some(Sym_Is_A_Generic_Identifier))
            code_node.push( <SKExpression>sk`if !l.isDiscrete(data,TokenIdentifier,${sym.byte_length}) : return : false` )
            
            if (Sym_Is_Defined_Natural_Number(sym) && occluders.some(Sym_Is_A_Generic_Number))
            code_node.push( <SKExpression>sk`if !l.isDiscrete(data,TokenNumber,${sym.byte_length}) : return : false` )
            
            code_node.push(<SKExpression>sk`return : true`);
        }

        yielded = gen.next();
    }

    const code_node = yielded.value;

    code_node.push(<SKExpression>sk`return : false`)

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
                occluders = ambient_symbols.filter(a_sym => Symbols_Occlude(a_sym, sym));

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
                        SC.UnaryPre(`/*[${sanitizeSymbolValForComment(sym)}]*/`, SC.Call("cmpr_set", lex_name, rec_glob_data_name, sym.byte_offset, sym.byte_length, sym.val.length))
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

export function getIncludeBooleansSk(
    syms: TokenSymbol[],
    options: BaseOptions,
    lex_name: string = "l",
    /* List of all symbols that can be encountered*/
    ambient_symbols: TokenSymbol[] = []
): SKExpression {

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
            .map(s => translateSymbolValueSk(s, grammar, lex_name)).sort();

    if (id.length + ty.length + fn.length + tk.length + non_consume.length == 0)
        return null;

    let out_id: SKExpression[] = [], out_ty: SKExpression[] = [], out_fn: SKExpression[] = [], out_tk: SKExpression[] = [], out_non_consume: SKExpression[] = [];

    if (non_consume.length > 0) {

        const
            fn_name = createNonCaptureBooleanCheckSk(non_consume, options, ambient_symbols);

        out_non_consume.push(<SKExpression>sk`${fn_name}(${lex_name}) /*${non_consume.map(sym => `[${sanitizeSymbolValForCommentSk(sym)}]`).join(" ")}*/`)
    }

    if (fn.length > 0)
        out_fn = fn;

    if (id.length > 0) {

        const
            booleans:SKExpression[] = [],
            char_tuples: [DefinedSymbol, TokenSymbol[]][] = [];

        let table = 0n, table_syms = [];

        for (const sym of id) {

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

                //Make sure we are working with the "true" symbol
                sym = <DefinedSymbol>getCardinalSymbol(grammar, sym);

                if (sym.byte_length == 1) {
                    const
                        char_code = sym.val.charCodeAt(0);
                    booleans.push(getLexerByteBooleanSk(lex_name, char_code));
                } else {
                    booleans.push(
                        <SKExpression>
                        sk`/*[${sanitizeSymbolValForComment(sym)}]*/cmpr_set(${lex_name},data, ${sym.byte_offset}, ${sym.byte_length}, ${sym.val.length})`
                    );
                }
            } else {
                let fn_ref = getGlobalObject("dt", [...syms, ...occluders], runner);

                if (!fn_ref) {

                    const
                        nodes = buildIfsSk(options, syms, "l", occluders),
                        fn = <SKFunction>sk`fn temp:bool(l:Lexer, data:Data){
                            ${nodes.flatMap((m=>[m,";"]))}
                        }`;
                    fn_ref = packGlobalFunctionSk("dt", "bool", [...syms, ...occluders], fn, runner);
                }

                booleans.push (
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
                    sk`assert_ascii(${lex_name}, ${
                        ["0x" + ((table >> 0n) & 0xffffffffn).toString(16),
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

function ensureSymbolsAreGlobal<T = Symbol>(syms: T[], grammar: Grammar): T[] {
    return <T[]><any>(<Symbol[]><any>syms).map(s => getCardinalSymbol(grammar, s));
}

function ensureSymbolsAreGlobalSk<T = Symbol>(syms: T[], grammar: Grammar): T[] {
    return <T[]><any>(<Symbol[]><any>syms).map(s => getCardinalSymbolSk(grammar, s));
}

function getCardinalSymbol(grammar: Grammar, sym: Symbol): Symbol {
    return <any>grammar.meta.all_symbols.get(getUniqueSymbolName(sym));
}

function getCardinalSymbolSk(grammar: Grammar, sym: Symbol): Symbol {
    return <any>grammar.meta.all_symbols.get(getUniqueSymbolName(sym));
}

function convertExpressionArrayToBoolean(array: ExprSC[], delimiter: string = "||"): ExprSC {
    return (array.filter(_ => _).reduce((r, s) => {
        if (!r) return s;
        return SC.Binary(r, delimiter, s);
    }, null));
}

function convertExpressionArrayToBooleanSk(array: SKExpression[], delimiter: string = "||"): SKExpression {
    return <SKExpression>sk`${array.flatMap(m => [m, delimiter]).slice(0,-1)}`;
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

function getLexerByteBooleanSk(lex_name: string, char_code: number, operator: string = "=="): SKExpression {
    return <SKExpression>sk`${lex_name}.current_byte ${operator} ${char_code} /*[${String.fromCharCode(char_code)}]*/`;
}
export function getTrueSymbolValue(sym: TokenSymbol, grammar: Grammar): TokenSymbol[] {
    return [<TokenSymbol>sym];
}

export function getTrueSymbolValueSk(sym: TokenSymbol, grammar: Grammar): TokenSymbol[] {
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

export function packGlobalFunctionSk(fn_class: string, fn_type: string, unique_objects: ((Symbol | Item)[] | SKFunction), fn: SKFunction, helper: Helper): SKReference {
    const string_name = getGloballyConsistentNameSk(fn_class, unique_objects);
    const function_name = <SKPrimitiveDeclaration>sk`${string_name}:${fn_type}`;
    return helper.add_constant(function_name, fn);
}



function getGlobalObject(fn_class: string, unique_objects: ((Symbol | Item)[] | SC), runner: Helper) {
    const name = getGloballyConsistentName(fn_class, unique_objects);

    return runner.constant_map.has(name)
        ? runner.constant_map.get(name).name
        : null;
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

export function expressionListHash(exprs:SKExpression[]){
    return hashString(exprs.map(skRenderAsSK).join(""))
}

export function hashString(string:string){
    return crypto.createHash('md5').update(string).digest("hex")
}

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
    if (input.type == "function" && input.name && input.return_type && input.parameters && input.expressions)  {
        return true;
    }
    return false;
}