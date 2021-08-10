/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import crypto from "crypto";
import { Helper } from "../build/helper.js";
import {
    getSkippableSymbolsFromItems,
    getSymbolsFromClosure, getUniqueSymbolName,
    Sym_Is_A_Generic_Type,
    Sym_Is_A_Production_Token,
    Sym_Is_Defined,
    Sym_Is_EOF,
    Sym_Is_EOP,
    Sym_Is_Exclusive,
    Sym_Is_Look_Behind,
    Sym_Is_Virtual_Token
} from "../grammar/nodes/symbol.js";
import { NULL_STATE, STATE_ALLOW_SKIP } from "../render/skribble_recognizer_template.js";
import { sk, skRenderAsSK } from "../skribble/skribble.js";
import {
    SKCall,
    SKExpression,
    SKFunction,
    SKIdentifierReference,
    SKIf,
    SKNode, SKPrimitiveDeclaration,
    SKReference
} from "../skribble/types/node.js";
import {
    DefinedSymbol,
    HCG3Grammar,
    HCG3LookBehind,
    HCG3Production,
    HCG3Symbol,
    ProductionTokenSymbol,

    SymbolType, TokenSymbol,

    VirtualTokenSymbol
} from "../types/grammar_nodes.js";
import {
    BaseOptions,
    RenderBodyOptions
} from "../types/render_body_options.js";
import { getClosure } from "./closure.js";
import { getSymbolTree, TokenTreeNode } from "./getSymbolValueAtOffset.js";
import { Item } from "./item.js";
import { getProductionClosure, getProductionID } from "./production.js";

export const createReduceFunctionSK = (item: Item, grammar: HCG3Grammar): SKCall =>
    <SKCall>sk`add_reduce(state, data, ${item.len}, ${item.body_(grammar).reduce_id + 1})`;

export const createDefaultReduceFunctionSk =
    (item: Item): SKCall => <SKCall>sk`add_reduce(state, data, ${item.len})`;

export function getProductionFunctionName(production: HCG3Production): string {
    return "$" + production.name;
}
export const getProductionFunctionNameSk = (production: HCG3Production): string => "$" + production.name;

export const createConsumeSk = (lex_name: string): SKCall => <SKCall>sk`consume(${lex_name}, data, state)`;

export function sanitizeSymbolValForComment(sym: string | TokenSymbol): string {
    if (typeof sym == "string")
        return sym.replace(/\*/g, "asterisk");
    return sym.val.toString().replace(/\*/g, "asterisk");
}

export function getSymbolBoolean(sym: TokenSymbol, grammar: HCG3Grammar, lex_name: string = "l"): string {

    const
        char_len = sym.val.toString().length,
        annotation = `/*[${sanitizeSymbolValForComment(sym)}]*/`;

    if (Sym_Is_EOF(sym))
        return <SKExpression>`${lex_name}.END(data)`;

    if (Sym_Is_EOP(sym))
        return <SKExpression>`${lex_name}.EOP_TRUE()`;

    const USE_UNICODE = "true";

    switch (sym.type) {

        case SymbolType.GENERATED:
            switch (sym.val) {
                case "sp": return `${lex_name}.isSP(${USE_UNICODE}, data)`;
                case "num": return `${lex_name}.isNum(data)`;
                case "id": return `${lex_name}.isUniID(data)`;
                case "nl": return `${lex_name}.isNL()`;
                case "sym": return `${lex_name}.isSym(${USE_UNICODE}, data)`;
                default: return `false`;
            }
        case SymbolType.LITERAL:
            if (char_len == 1) {
                return `${sym.val.codePointAt(0)}${annotation}`;
            } else {
                return `${sym.val.codePointAt(0)}${annotation}`;
            }
        case SymbolType.EMPTY:
            return null;
    }
}
export function createSkipCall(
    symbols: TokenSymbol[],
    options: BaseOptions,
    lex_name: string = "l",
    peek: boolean,
    exclude: TokenSymbol[] = [],
    USE_NUMBER = false
): SKExpression {

    const { helper: runner } = options;

    const skip = getSkipFunctionNew(symbols, options, undefined, exclude);

    if (skip)
        return <SKExpression>sk`${skip}(${lex_name}/*${symbols.map(s => `[ ${s.val} ]`).join("")}*/, data, ${!peek ? USE_NUMBER ? 0xFFFFFF : "state" : STATE_ALLOW_SKIP});\n`;

    return null;
}

export function collapseBranchNames(options: RenderBodyOptions) {
    const { branches, helper: runner } = options;

    for (const { name, body } of branches) {

        const
            hash = expressionListHash(body),

            token_function = <SKFunction>sk`fn temp:i32 (l:__Lexer$ref, data:__ParserData$ref, db:__ParserDataBuffer$ref, state:u32, prod:u32, prod_start:u32){
                /*${hash}*/
            }`;

        token_function.expressions = body;

        var val = packGlobalFunction("branch", "int", token_function, token_function, runner);

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
export function createBranchFunction(branch_expressions: SKExpression[], options: RenderBodyOptions): SKIdentifierReference {

    let fn_ref: SKIdentifierReference = { type: "reference", value: "temp_" + hashString(branch_expressions.map(skRenderAsSK).join("")) };

    options.branches.push({
        name: fn_ref,
        body: branch_expressions
    });

    return fn_ref;
}


function createNonCaptureLookBehind(symbol: HCG3LookBehind, options: RenderBodyOptions): SKReference {

    const phased_symbol = getCardinalSymbol(options.grammar, symbol.phased);

    const { helper: runner } = options;

    let fn_ref = getGlobalObject("nocap_lb", [<HCG3Symbol>phased_symbol], options.helper);

    if (!fn_ref) {

        const type_info = symbol.id;

        const boolean = getIncludeBooleans([phased_symbol], "pk");

        const token_function = <SKFunction>sk`
        fn temp:bool(l:__Lexer$ref, data:__ParserData$ref, state:u32){

            if (l.type) == ${type_info} : return : true;

            [mut]pk:Lexer = l.copyInPlace();
            
            pk.byte_offset = l.prev_byte_offset;
            pk.byte_length = 0;

            loop((pk.byte_offset < l.byte_offset)) {
                ${createSymbolScanFunctionCall([phased_symbol], options, "pk")};
                if ${boolean}: { 
                    l.setToken(${type_info},0,0);
                    return : true;
                };
                pk.next(data);
            };

            return : false;        
        }`;

        return packGlobalFunction("nocap_lb", "bool", [phased_symbol], token_function, runner);
    }
    return fn_ref;
}


export function createProductionTokenFunction(tok: ProductionTokenSymbol, options: BaseOptions): SKReference {
    const { grammar, helper: runner } = options;
    const prod_id = getProductionID(tok, grammar);
    const closure = getProductionClosure(prod_id, grammar, true);


    let fn_ref = getGlobalObject("tk", closure, runner);

    if (!fn_ref) {
        const type_info = tok.id;

        const production = grammar.productions[prod_id];

        runner.referenced_production_ids.add(production.id);

        const

            token_function = <SKFunction>sk`
            fn temp:bool(l:__Lexer$ref,data:__ParserData$ref){       
                if (l.type) == ${type_info} : return : true;     
                    
                // preserve the current state of the data
                [const] stack_ptr :u32 = data.stack_ptr;
                [const] input_ptr:u32 = data.input_ptr;
                [const] state:u32 = data.state;
                [const] copy:Lexer = l.copyInPlace();
                [mut new cpp_ignore] data_buffer : ParserDataBuffer = ParserDataBuffer();
                [mut js_ignore] data_buffer : ParserDataBuffer;

                pushFN(data, &> ${getProductionFunctionNameSk(production, grammar)}, 0);

                data.state = ${NULL_STATE};

                [mut]ACTIVE:bool = true;

                loop ( (ACTIVE) ) {
                    ACTIVE = stepKernel(data, l, data_buffer, stack_ptr + 1);
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
                
                return: false;
            }`;

        return packGlobalFunction("tk", "bool", closure, token_function, runner);
    } else
        return fn_ref;
}
function getUTF8ByteAt(s: DefinedSymbol, off: number): number {
    return s.val.charCodeAt(off);
}
export function getIncludeBooleans(
    syms: TokenSymbol[],
    lex_name: string = "l",
): SKExpression {
    const types = [];
    if (syms.length < 3) {
        types.push(...syms.map(s => {
            return <SKExpression>sk`${lex_name}.type ~= ${s.id}}`;
        }));


    } else {
        const nums = syms.map(sym => sym.id);
        const low = nums.filter(num => num <= 255);
        const high = nums.filter(num => num > 255);

        types.push(...high.map(val => {
            return <SKExpression>sk`${lex_name}.type ~= ${val}}`;
        }));

        types.push(...[low.filter(num => num < 32),
        low.filter(num => num >= 32 && num < 64),
        low.filter(num => num >= 64 && num < 96),
        low.filter(num => num >= 96 && num < 128),
        low.filter(num => num >= 128 && num < 160),
        low.filter(num => num >= 160 && num < 192),
        low.filter(num => num >= 192 && num < 224),
        low.filter(num => num >= 224 && num < 256)].map((array, i) => {
            if (array.length == 0)
                return null;
            const val = array.reduce((r, v, i) => r | (1 << (v % 32)), 0);

            return sk`( 
                        ${lex_name}.type >= ${i * 32} 
                        && 
                        ${lex_name}.type < ${(i + 1) * 32} 
                        && 
                        0 < ( 
                            ${val >>> 0} & (
                                1 << (  ${lex_name}.type - ${i * 32} )
                            )
                        )
                    )`;
        }).filter(s => !!s));



    }
    return convertExpressionArrayToBoolean(types);
}

function getCardinalSymbol<T = HCG3Symbol>(grammar: HCG3Grammar, sym: T): T {
    return <any>grammar.meta.all_symbols.get(getUniqueSymbolName(<any>sym));
}

function convertExpressionArrayToBoolean(array: SKExpression[], delimiter: string = "||"): SKExpression {
    return <SKExpression>sk`${array.flatMap(m => [m, delimiter]).slice(0, -1)}`;
}

/**
 * 
 */
export function packGlobalFunction(fn_class: string, fn_type: string, unique_objects: ((HCG3Symbol | Item)[] | SKFunction), fn: SKFunction, helper: Helper): SKReference {

    const string_name = getGloballyConsistentName(fn_class, unique_objects);
    const function_name = <SKPrimitiveDeclaration>sk`${string_name}:${fn_type}`;
    return helper.add_constant(function_name, fn);
}

function getGlobalObject(fn_class: string, unique_objects: ((HCG3Symbol | Item)[] | SKFunction), runner: Helper) {
    const name = getGloballyConsistentName(fn_class, unique_objects);

    return runner.constant_map.has(name)
        ? runner.constant_map.get(name).name
        : null;
}
/**
 * Generate a function name that is consistent amongst
 * all workers. 
 */
export function getGloballyConsistentName(prepend_js_identifier: string, unique_objects: ((HCG3Symbol | Item)[] | SKFunction)): string {

    let string_to_hash = "";
    if (This_Is_An_SKFunction(unique_objects)) {
        string_to_hash = skRenderAsSK(unique_objects);
    } else {
        if (This_Is_An_Item_Array(unique_objects)) {
            string_to_hash = unique_objects.map(i => i.id).setFilter().sort().join("");
        } else {
            string_to_hash = (<HCG3Symbol[]>unique_objects).map(getUniqueSymbolName).setFilter().sort().join("");
        }
    }

    return `${prepend_js_identifier}_${hashString(string_to_hash).slice(0, 16)}`;
}

export function expressionListHash(exprs: SKExpression[]) {
    return hashString(exprs.map(skRenderAsSK).join(""));
}

export function hashString(string: string) {
    return crypto.createHash('md5').update(string).digest("hex");
}

function This_Is_An_Item_Array(input: any[] | any): input is Item[] {
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
        root.push(<SKExpression><any>{

            type: "string",
            value: item_str.replace(/\'/g, '"').replace(/\\/g, "f:s")
        });
}

export function addSymbolAnnotationsToExpressionList(syms: HCG3Symbol[], grammar: HCG3Grammar, expression_list: SKExpression[], comment: string = "") {
    const symbol_string = syms.map(s => ("" + s.val).replace(/\'/g, '"').replace(/\\/g, "f:s")).join(" ");

    expression_list.unshift(<SKExpression><any>{
        type: "string",
        value: comment + " [  " + symbol_string + "  ]"
    });

}
export function createSymbolScanIntermediate(node: TokenTreeNode, options: BaseOptions, PEEKING: boolean = false, ALLOW_SKIP: boolean = true): SKReference {

    const id_symbols = node.symbols.setFilter(getUniqueSymbolName);

    let fn_ref = getGlobalObject("inter_scan", id_symbols, options.helper);

    if (!fn_ref) {

        const scan_function: SKFunction = <any>sk`fn temp:bool(l:__Lexer$ref, data:__ParserData$ref){ }`;

        scan_function.expressions.push(...render(node, options, [], true), <SKExpression>sk`return:false`);

        fn_ref = packGlobalFunction("inter_scan", "bool", id_symbols, scan_function, options.helper);
    }

    return fn_ref;
}


function render(node: TokenTreeNode, options: BaseOptions, insert_expression: SKExpression[] = [], USE_BOOLEAN: boolean = false) {

    let ifs = [];

    let append = [];

    let prepend = [];

    if (node.nodes.length == 0) {

        return renderLeaf(node, options, USE_BOOLEAN);

    } else {

        let base = node;

        if (base.nodes.length == 1) {

            const tk_len = base.tk_length;

            while (base.nodes[0].nodes.length == 1 && base.nodes[0].nodes[0].tk_length == tk_len)
                base = base.nodes[0];

            if (base.nodes.length > 1 && node.offset == 0) {
                const result = createSymbolScanIntermediate(base.nodes[0], options);

                ifs.push(createIfClause(node.symbols[0], node.offset, base.nodes[0].offset - node.offset, options, [sk`if ${result}(l,data):{ return }`]));

            } else {

                ifs.push(createIfClause(node.symbols[0], node.offset, base.nodes[0].offset - node.offset, options, render(base.nodes[0], options, [], USE_BOOLEAN)));
            }


        } else for (const n of base.nodes) {

            if (base.nodes.length > 1 && node.offset == 0) {
                const result = createSymbolScanIntermediate(n, options);

                ifs.push(createIfClause(n.symbols[0], node.offset, base.nodes[0].offset - node.offset, options, [sk`if ${result}(l,data):{ return }`]));
            } else {

                ifs.push(createIfClause(n.symbols[0], node.offset, n.offset - node.offset, options, render(n, options, [], USE_BOOLEAN)));
            }
        }

        const completed_ids = base.symbols.filter(Sym_Is_Defined).filter(s => s.val.length == node.offset).setFilter(getUniqueSymbolName);

        if (completed_ids.length > 0) {
            const copy = Object.assign({}, base);
            copy.symbols = copy.symbols.filter(s => {
                if (Sym_Is_Defined(s))
                    if (s.val.length > node.offset)
                        return false;
                return true;
            }

            );
            ifs.push(...renderLeaf(copy, options, USE_BOOLEAN));
        }

        if (node.offset == 0) {

            const ifs = [];

            const lb_syms = node.symbols.filter(Sym_Is_Look_Behind).setFilter(getUniqueSymbolName);

            const tk_syms = node.symbols.filter(Sym_Is_A_Production_Token).setFilter(getUniqueSymbolName);

            const gen_syms = node.symbols.filter(Sym_Is_A_Generic_Type).setFilter(getUniqueSymbolName);

            for (const lb_sym of lb_syms) {

                const lb_name = createNonCaptureLookBehind(lb_sym, options);

                prepend.push(sk`if ${lb_name}(l,data, state) : { return }`);
            }

            for (const tk_sym of tk_syms) {
                const tk_name = createProductionTokenFunction(tk_sym, options);

                ifs.push(sk`if ${tk_name}(l,data) : { return }`);
            }

            for (const gen_sym of gen_syms) {
                ifs.push(sk`if ${getSymbolBoolean(gen_sym, options.grammar, "l")} : { return }`);
            }

            ifs.reduce((r: SKIf, a: SKIf) => ((!r) ? a : (r.else = a, a)), null);

            if (ifs[0])
                append.push(ifs[0]);
        }
    }

    ifs.reduce((r: SKIf, a: SKIf) => ((!r) ? a : (r.else = a, a)), null);

    return ifs[0] ? [...prepend, ...insert_expression, ifs[0], ...append] : [...prepend, ...insert_expression, ...append];
}

function renderLeaf(node: TokenTreeNode, options: any, USE_BOOLEAN: boolean = false) {

    let ifs = [];

    let append = [];

    let prepend = [];

    const return_str = USE_BOOLEAN ? "return : true" : "return";

    const id = node.symbols.filter(Sym_Is_Defined).setFilter(getUniqueSymbolName);
    const tk_syms: (ProductionTokenSymbol | VirtualTokenSymbol)[] = <any>node.symbols.filter(s => Sym_Is_Virtual_Token(s) || Sym_Is_A_Production_Token(s)).setFilter(getUniqueSymbolName);

    const gen_syms = node.symbols.filter(Sym_Is_A_Generic_Type).setFilter(getUniqueSymbolName);

    const look_behind_symbols: HCG3LookBehind[] = <any>node.symbols.filter(Sym_Is_Look_Behind).setFilter(getUniqueSymbolName);

    const default_bin = node.offset > 0 ? ifs : append;

    const length_assertion = (node.offset > 0) ? `&& l.byte_length > ${node.offset}` : "";

    for (const lb_sym of look_behind_symbols) {

        const lb_name = createNonCaptureLookBehind(lb_sym, options);

        prepend.push(sk`if ${lb_name}(l,data, state) : { ${return_str} }`);
    }

    for (const tk_sym of tk_syms) {

        const tk_name = createProductionTokenFunction(Sym_Is_Virtual_Token(tk_sym) ? tk_sym.root : tk_sym, options);

        default_bin.push(sk`if ${tk_name}(l,data) ${length_assertion} : { ${return_str} }`);
    }

    for (const gen_sym of gen_syms) {

        default_bin.push(sk`if ${getSymbolBoolean(gen_sym, options.grammar, "l")} ${length_assertion} : { ${return_str} }`);
    }

    for (const defined of id) {

        const preamble = node.offset > 0 && defined.byte_length <= node.offset ? "" : getIfClausePreamble(defined.byte_length - node.offset, node.offset, defined, node.offset, options);

        if (Sym_Is_Exclusive(defined)) {

            ifs.push(sk`${preamble}{l.setToken(${defined.id}, ${defined.byte_length},${defined.val.length});${return_str}}`);

        } else {
            const symbols = node.symbols.map(s => Sym_Is_Virtual_Token(s) ? s.root : s);

            const id = generateHybridIdentifier(symbols);

            ifs.push(sk`${preamble}{l.setToken(${id}, ${defined.byte_length},${defined.val.length});${return_str}}`);
        }
    }

    ifs.reduce((r: SKIf, a: SKIf) => ((!r) ? a : (r.else = a, a)), null);

    return ifs[0] ? [...prepend, ifs[0], ...append] : [...prepend, ...append];
}

function createIfClause(symbol: DefinedSymbol | VirtualTokenSymbol, offset: number, length: number, options: any, expressions: SKExpression[]) {

    const start = offset;

    if (Sym_Is_Virtual_Token(symbol)) {
        length = 1;
        offset = offset - symbol.root_offset;
        symbol = <DefinedSymbol>symbol.item.sym(options.grammar);
    }
    let _if = sk`${getIfClausePreamble(length, start, symbol, offset, options)} {}`;


    if (expressions.length == 1 && expressions[0].type == "block") {
        _if.expression = expressions[0];
    } else
        _if.expression.expressions.push(...expressions);

    return _if;
}

function getIfClausePreamble(length: number, start: number, symbol: DefinedSymbol, offset: number, options) {

    symbol = getCardinalSymbol(options.grammar, symbol);

    return length == 1
        ? `if data.input[l.byte_offset ${start > 0 ? "+" + start : ""}] ~= ${getUTF8ByteAt(symbol, offset)} :`
        : `if ${length} == compare(data, l.byte_offset  ${start > 0 ? "+" + start : ""}, ${symbol.byte_offset + offset}, ${length}) :`;
}

export function generateHybridIdentifier(symbols: HCG3Symbol[]) {
    return symbols.map(s => s.id).setFilter().sort().reduce((r, s, i) => r | (s << (10 * i)), 0);
}

export function createItemScanFunction(items: Item[], options: BaseOptions, PEEKING: boolean = false, extra_symbols: TokenSymbol[] = []): SKReference {

    const { grammar } = options;

    const symbols = [...getSymbolsFromClosure(getClosure(items, grammar), grammar), ...extra_symbols].setFilter(getUniqueSymbolName);
    const skippable = getSkippableSymbolsFromItems(items, grammar).filter(sym => !symbols.some(s => getUniqueSymbolName(s) == getUniqueSymbolName(sym)));

    const id_symbols = [...symbols, ...skippable.map(sym => Object.assign({}, sym, { type: sym.type + "---" }))].setFilter(getUniqueSymbolName);

    let fn_ref = getGlobalObject("skip", id_symbols, options.helper);

    if (!fn_ref) {

        let skip_fn_call = null;

        if (skippable.length > 0)
            skip_fn_call = createSkipCall(skippable, options, "l", PEEKING);

        const scan_function: SKFunction = <any>sk`fn temp:void(l:__Lexer$ref, data:__ParserData$ref, state:u32){   }`;

        if (options.helper.ANNOTATED)
            addSymbolAnnotationsToExpressionList(symbols, options.grammar, scan_function.expressions, "test");

        if (skip_fn_call)
            scan_function.expressions.push(skip_fn_call);

        scan_function.expressions.push(...render(getSymbolTree(symbols, options.grammar), options, [sk`if l.type > 0 : return;`]
        ));

        fn_ref = packGlobalFunction("scan", "void", id_symbols, scan_function, options.helper);
    }

    return fn_ref;
}

export function createSymbolScanFunction(symbols: TokenSymbol[], options: BaseOptions, PEEKING: boolean = false, ALLOW_SKIP: boolean = true): SKReference {

    const id_symbols = [...symbols].setFilter(getUniqueSymbolName);

    let fn_ref = getGlobalObject("skip", id_symbols, options.helper);

    if (!fn_ref) {

        const scan_function: SKFunction = <any>sk`fn temp:void(l:__Lexer$ref, data:__ParserData$ref, state:u32){ if l.type > 0 : return;  }`;

        scan_function.expressions.push(...render(getSymbolTree(symbols, options.grammar), options));

        fn_ref = packGlobalFunction("sym_scan", "void", id_symbols, scan_function, options.helper);
    }

    return fn_ref;
}

export function createScanFunctionCall(
    items: Item[],
    options: BaseOptions,
    lex_name: string = "l",
    PEEK: boolean = false,
    extra_symbols: TokenSymbol[] = [],
): SKExpression {

    const scan = createItemScanFunction(items, options, PEEK, extra_symbols);
    return <SKExpression>sk`${scan}(${lex_name}, data, ${!PEEK ? "state" : STATE_ALLOW_SKIP});`;
}
export function createSymbolScanFunctionCall(
    symbols: TokenSymbol[],
    options: BaseOptions,
    lex_name: string = "l",
    PEEK: boolean = false,
): SKExpression {

    const scan = createSymbolScanFunction(symbols, options, PEEK);
    return <SKExpression>sk`${scan}(${lex_name}, data, ${!PEEK ? "state" : STATE_ALLOW_SKIP});`;
}
export function getSkipFunctionNew(
    skip_symbols: TokenSymbol[],
    options: BaseOptions,
    custom_skip_code: SKNode,
    exclude: TokenSymbol[] = []
): SKReference {

    const { helper: runner } = options;

    if (skip_symbols.length == 0)
        return null;

    let fn_ref = getGlobalObject("skip", skip_symbols, runner);

    if (!fn_ref) {

        const
            boolean = getIncludeBooleans(skip_symbols, "l"),

            skip_function = <SKFunction>sk`
            fn temp:void (l:__Lexer$ref,data:__ParserData$ref, state:u32){

                if l.type > 0 : return;

                if (state) == ${NULL_STATE} : return;

                [const] off:u32 = l.token_offset;
                
                loop (1){

                    ${createSymbolScanFunctionCall(skip_symbols, options, "l")};
                    
                    ${custom_skip_code ? custom_skip_code : ""}
                    
                    if !(${boolean}) : {
                        break;
                    };

                    l.next(data);
                };
                if isOutputEnabled(state) : add_skip(data, l.token_offset - off);
            }`;

        fn_ref = packGlobalFunction("skip", "Lexer", skip_symbols, skip_function, runner);
    }

    return fn_ref;
}