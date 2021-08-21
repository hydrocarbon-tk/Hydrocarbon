/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import crypto from "crypto";
import { Helper } from "../build/helper.js";
import {
    getSkippableSymbolsFromItems, getTokenSymbolsFromItems, getUniqueSymbolName,
    Sym_Is_A_Generic_Type,
    Sym_Is_A_Production_Token,
    Sym_Is_A_Terminal,
    Sym_Is_Defined,
    Sym_Is_EOF,
    Sym_Is_EOP,
    Sym_Is_Exclusive,
    Sym_Is_Look_Behind,
    Sym_Is_Virtual_Token
} from "../grammar/nodes/symbol.js";
import { sk, skRenderAsSK } from "../skribble/skribble.js";
import {
    SKBlock,
    SKCall,
    SKExpression,
    SKFunction,
    SKIdentifierReference,
    SKIf,
    SKMatch, SKPrimitiveDeclaration,
    SKReference,
    SKReturn
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
    <SKCall>sk`add_reduce(state, ${item.len}, ${item.body_(grammar).reduce_id + 1})`;

export const createDefaultReduceFunctionSk =
    (item: Item): SKCall => <SKCall>sk`add_reduce(state, ${item.len}, 0)`;

export function getProductionFunctionName(production: HCG3Production): string {
    return "hc_" + production.name;
}
export const getProductionFunctionNameSk = (production: HCG3Production): string => "hc_" + production.name;

export const createConsumeSk = (lex_name: string): SKCall => <SKCall>sk`consume(state)`;

export function sanitizeSymbolValForComment(sym: string | TokenSymbol): string {
    if (typeof sym == "string")
        return sym.replace(/\*/g, "asterisk");
    return sym.val.toString().replace(/\*/g, "asterisk");
}

export function getSymbolBoolean(sym: TokenSymbol, grammar: HCG3Grammar, lex_name: string = "state.lexer"): string {

    const
        char_len = sym.val.toString().length,
        annotation = `/*[${sanitizeSymbolValForComment(sym)}]*/`;

    if (Sym_Is_EOF(sym))
        return `${lex_name}.END(state)`;

    if (Sym_Is_EOP(sym))
        return `${lex_name}.EOP_TRUE()`;

    const USE_UNICODE = "true";

    switch (sym.type) {

        case SymbolType.GENERATED:
            switch (sym.val) {
                case "sp": return `${lex_name}.isSP(${USE_UNICODE})`;
                case "num": return `${lex_name}.isNum()`;
                case "id": return `${lex_name}.isUniID()`;
                case "nl": return `${lex_name}.isNL()`;
                case "sym": return `${lex_name}.isSym(${USE_UNICODE})`;
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


export function createProductionReturn(production: HCG3Production, prod: string = "0", stash: string = "prod_start"): SKExpression {
    return <SKReturn>sk`return: ${getProductionFunctionNameSk(production)}(state,db,${prod});`;
}

export function collapseBranchNames(options: RenderBodyOptions) {
    const { grammar: { branches }, helper: runner } = options;

    for (const { name: ref, body } of branches) {

        // Remove single call functions and replace source reference with the callee name
        if (body.length == 1 && body[0].type == "return") {

            const [_return] = body;
            if (_return.expression.type == "call") {

                //Since the calling site name represents is `state.push_fn(XXXXX, production id)` 
                //This can be trivially replaced by the contents the return value to reduce the 
                //number of branch functions and runtime calls. 

                ref.value = _return.expression.reference.value + ` /*${skRenderAsSK(_return.expression)}*/`;

                //No longer need to create a branch function. So skip rest of processing for this
                //reference
                continue;
            } else if (_return.expression.type == "number") {
                ref.value = `set_production /*${skRenderAsSK(_return.expression)}*/`;
                //No longer need to create a branch function. So skip rest of processing for this
                //reference
                continue;
            }
        }

        const
            hash = expressionListHash(body),

            token_function = <SKFunction>sk`fn temp:i32 (state:__ParserState$ref, db:__ParserStateBuffer$ref, [mut] prod:i32){
                /*${hash}*/
            }`;

        token_function.expressions = body;

        if (!body.slice(-1)[0] || body.slice(-1)[0].type != "return") {
            body.push(<SKExpression>sk`return : -1`);
        }

        var val = packGlobalFunction("branch", "int", token_function, token_function, runner);

        ref.value = val.value;
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

    if (!options.grammar.branches)
        options.grammar.branches = [];

    options.grammar.branches.push({
        name: fn_ref,
        body: branch_expressions
    });

    return fn_ref;
}


function createNonCaptureLookBehind(symbol: HCG3LookBehind, options: BaseOptions): SKReference {

    const phased_symbol = getCardinalSymbol(options.grammar, symbol.phased);

    const { helper: runner } = options;

    let fn_ref = getGlobalObject("nocap_lb", [<HCG3Symbol>phased_symbol], options.helper);

    if (!fn_ref) {

        const type_info = symbol.id;

        const boolean = getIncludeBooleans([phased_symbol], options.grammar, "pk");

        const token_function = <SKFunction>sk`
        fn temp:bool(lexer:__Lexer$ref){

            if (lexer._type) == ${type_info} : return : true;

            [mut]pk:Lexer = lexer.copy_in_place();
            
            pk.byte_offset = lexer.prev_byte_offset;
            pk.byte_length = 0;

            loop((pk.byte_offset < lexer.byte_offset)) {
                ${createSymbolScanFunctionCall([phased_symbol], options, "pk")};
                if ${boolean}: { 
                    lexer.setToken(${type_info},0,0);
                    return : true;
                };
                pk.next();
            };

            return : false;        
        }`;

        return packGlobalFunction("nocap_lb", "bool", [phased_symbol], token_function, runner);
    }
    return fn_ref;
}



function getUTF8ByteAt(s: DefinedSymbol, off: number): number {
    return s.val.charCodeAt(off);
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

function createIfClause(symbol: DefinedSymbol | VirtualTokenSymbol, offset: number, length: number, options: any, expressions: SKExpression[]) {

    const start = offset;

    if (Sym_Is_Virtual_Token(symbol)) {
        length = 1;
        offset = offset - symbol.root_offset;
        symbol = <DefinedSymbol>symbol.item.sym(options.grammar);
    }
    let _if = <SKIf>sk`${getIfClausePreamble(length, start, symbol, offset, options, false)} {}`;


    if (expressions.length == 1 && expressions[0].type == "block") {
        _if.expression = expressions[0];
    } else
        _if.expression.expressions.push(...expressions);

    return _if;
}

function getIfClausePreamble(length: number, start: number, symbol: DefinedSymbol, offset: number, options, ADD_TOKEN_QUERY = true) {

    symbol = getCardinalSymbol(options.grammar, symbol);

    const active_token_query = ADD_TOKEN_QUERY ? getActiveTokenQuery(symbol) + " &&" : "";


    return length == 1
        ? `if ${active_token_query} lexer.get_byte_at(lexer.byte_offset ${start > 0 ? "+" + start : ""}) ~= ${getUTF8ByteAt(symbol, offset)} :`
        : `if ${active_token_query} ${length} == compare(lexer, lexer.byte_offset  ${start > 0 ? "+" + start : ""}, ${symbol.byte_offset + offset}, ${length}, &>>token_sequence_lookup) :`;
}

export function generateHybridIdentifier(symbols: HCG3Symbol[]) {
    return symbols.map(s => s.id).setFilter().sort().reduce((r, s, i) => r ^ (s << 10), 1);
}


export const token_lu_bit_size_offset = 5;
export const token_lu_bit_size = 1 << token_lu_bit_size_offset;
export function getSymbolMap(symbols: TokenSymbol[], grammar: HCG3Grammar): number[] {
    const ids = symbols.filter(s => s.id).map(s => s.id).sort((a, b) => a - b).filter(i => i >= 1);

    const max = grammar.meta.token_row_size * token_lu_bit_size;
    const flags = [0];
    let base = 0;
    let index = 0;

    for (const id of ids) {
        while (id >= (base + token_lu_bit_size)) {
            base += token_lu_bit_size;
            index++;
            flags.push(0);
        }
        flags[index] |= 1 << (id - base);
    }

    while (max > (base + token_lu_bit_size)) {
        base += token_lu_bit_size;
        index++;
        flags.push(0);
    }

    return flags;
}
export function getSymbolMapPlaceHolder(symbols: TokenSymbol[], grammar: HCG3Grammar) {
    return "symbollookup_" + getSymbolMap(symbols, grammar).map(i => i >>> 0).join("_");
}


export function getIncludeBooleans(
    syms: TokenSymbol[],
    grammar: HCG3Grammar,
    lex_name: string = "state.lexer",
): SKExpression {
    const types = [];
    // Dump hybrid symbols into own bucket.
    const used_syms = syms.flatMap(s => {
        if (Sym_Is_Hybrid(s)) {
            return [s, ...s.syms];
        }
        return s;
    }).setFilter(getUniqueSymbolName);

    if (used_syms.length < 5) {
        types.push(...used_syms.map(s => {
            return <SKExpression>sk`${lex_name}._type ~= ${s.id}}`;
        }));
    } else {
        const tabled = used_syms.filter(sym => sym.id <= 255 && sym.id >= 1);
        const non_table = used_syms.filter(sym => sym.id > 255 && sym.id < 1);

        types.push(...non_table.map(sym => {
            return <SKExpression>sk`${lex_name}._type ~= ${sym.id}}`;
        }));

        const symbol_map_id = getSymbolMapPlaceHolder(tabled, grammar);

        types.push(sk`isTokenActive(${lex_name}._type, ${symbol_map_id})`);
    }
    return convertExpressionArrayToBoolean(types);
}

export function createProductionTokenCall(tok: ProductionTokenSymbol, options: BaseOptions, ADD_PRE_SCAN_BOOLEAN: boolean = false): string {
    const { grammar, helper: runner } = options;
    const prod_id = getProductionID(tok, grammar);
    const production = grammar.productions[prod_id];
    const prod_name = getProductionFunctionNameSk(production);

    let pre_scan = "";

    if (ADD_PRE_SCAN_BOOLEAN) {

        const symbols = getTokenSymbolsFromItems(getProductionClosure(prod_id, grammar, false), grammar).setFilter(getUniqueSymbolName);

        const symbol_map_id = getSymbolMapPlaceHolder(symbols, grammar);

        pre_scan = `pre_scan(lexer, ${symbol_map_id}) &&`;
    }

    return `${pre_scan} token_production(lexer, &> ${prod_name}, ${prod_id}, ${tok.id}, ${1 << tok.token_id})`;
}
export function createScanFunctionCall(
    items: Item[],
    options: BaseOptions,
    lex_name: string = "state.lexer",
    PEEK: boolean = false,
    extra_symbols: TokenSymbol[] = [],
): SKExpression {

    const { grammar } = options;

    const symbols = [...getTokenSymbolsFromItems(getClosure(items, grammar), grammar), ...extra_symbols].setFilter(getUniqueSymbolName);
    const skippable = getSkippableSymbolsFromItems(items, grammar).filter(sym => !symbols.some(s => getUniqueSymbolName(s) == getUniqueSymbolName(sym)));

    const full_mapped_symbols = symbols.concat(skippable).setFilter(getUniqueSymbolName);

    const symbol_map_id = getSymbolMapPlaceHolder(full_mapped_symbols, grammar);

    const skippable_map_id = (skippable.length > 0) ? getSymbolMapPlaceHolder(skippable, grammar) : "0";

    return <SKExpression>sk`scan(${lex_name}, ${symbol_map_id}, ${skippable_map_id});`;
}

export function createSymbolScanFunctionCall(
    symbols: TokenSymbol[],
    options: BaseOptions,
    lex_name: string = "state.lexer",
    PEEK: boolean = false,
): SKExpression {
    const { grammar } = options;
    const symbol_map_id = getSymbolMapPlaceHolder(symbols, grammar);
    return <SKExpression>sk`scan(${lex_name}, ${symbol_map_id}, 0);`;
}

function getActiveTokenQuery(symbol: TokenSymbol | ProductionTokenSymbol): string {
    return Sym_Is_Virtual_Token(symbol) ? `isTokenActive(${symbol.root.id}, tk_row)` : `isTokenActive(${symbol.id}, tk_row)`;
}

export function createSymbolScanFunctionNew(options: BaseOptions): SKFunction[] {

    const { grammar } = options;

    const id_symbols = [...grammar.meta.all_symbols.values()]
        .filter(s => Sym_Is_A_Terminal(s) || Sym_Is_A_Production_Token(s))
        .filter(sym => !Sym_Is_EOF(sym) && !Sym_Is_EOP(sym) && !Sym_Is_Hybrid(sym))

        .setFilter(getUniqueSymbolName);

    const outer_fn = <SKFunction>sk`
    fn scan:void(lexer:__Lexer$ref, tk_row:u32, pk_row:u32){
        //Do look behind        
        if((lexer._type) <= 0) : 
            scan_core(lexer, tk_row);

        if(pk_row > 0 && isTokenActive(lexer._type, pk_row)) : {
            loop((isTokenActive(lexer._type, pk_row))){
                lexer.next();
                scan_core(lexer, tk_row);
            };
        }
    }
    `;

    const tree = getSymbolTree(id_symbols, grammar);

    const lb_syms = tree.symbols.filter(Sym_Is_Look_Behind).setFilter(getUniqueSymbolName);

    const tk_syms = tree.symbols.filter(Sym_Is_A_Production_Token).setFilter(getUniqueSymbolName);

    const gen_syms = tree.symbols.filter(Sym_Is_A_Generic_Type).setFilter(getUniqueSymbolName);

    const group_size = 0x7F;

    for (const lb_sym of lb_syms.reverse()) {

        const lb_name = createNonCaptureLookBehind(lb_sym, options);

        outer_fn.expressions.splice(1, 0, (<SKExpression>sk`if ${getActiveTokenQuery(lb_sym)} && ${lb_name}(lexer) : { return }`));
    }

    const fn = <SKFunction>sk`fn scan_core:void(lexer:__Lexer$ref, tk_row:u32){  }`;


    const expression_array = fn.expressions;

    const match_stmt: SKMatch = <SKMatch>sk`match (lexer.get_byte_at(lexer.byte_offset) & ${group_size}): default:break`;

    expression_array.push(match_stmt);

    //Add defined & interfering token look ups

    const group = tree.nodes.groupMap(n => n.id.charCodeAt(0) & group_size);

    for (const [key, nodes] of [...group.entries()].sort((a, b) => a[0] - b[0])) {

        const tree: TokenTreeNode = {
            id: "",
            nodes,
            offset: 0,
            tk_length: nodes.flatMap(n => n.symbols).setFilter(getUniqueSymbolName).length,
            symbols: nodes.flatMap(n => n.symbols).setFilter(getUniqueSymbolName)
        };

        const match_clause = (<SKMatch>sk`match 1 : ${key}: ${(<SKBlock>{
            type: "block",
            expressions: [...renderNew(tree, options)]
        })}; break;`).matches[0];

        match_stmt.matches.push(match_clause);
    }

    //Reorder the default match statement to be the last one 
    match_stmt.matches.push(match_stmt.matches.shift());

    //Add fallback types

    const ifs = [];

    for (const tk_sym of tk_syms) {
        const token_production_call = createProductionTokenCall(tk_sym, options, true);

        ifs.push(sk`if ${getActiveTokenQuery(tk_sym)} && ${token_production_call} : { return }`);
    }

    for (const gen_sym of gen_syms)
        ifs.push(sk`if ${getActiveTokenQuery(gen_sym)} && ${getSymbolBoolean(gen_sym, options.grammar, "lexer")} : { return }`);

    const [first] = mergeIfStatement(ifs);

    if (first)
        expression_array.push(first);

    return [fn, outer_fn];
}
/**
 * Combine a list of seperate SK if nodes into an if-else chain.
 * Return a tuple containing the first and last if node (may be aliased 
 * or undefined if ifs.length == 0)
 * @param ifs <SKIF>  A list of if statements
 */
function mergeIfStatement(ifs: SKIf[]) {
    ifs.reduce((r: SKIf, a: SKIf) => ((!r) ? a : (r.else = a, a)), null);

    return [ifs[0], ifs[ifs.length - 1]];
}

function Sym_Is_Hybrid(sym: TokenSymbol): sym is any {
    return sym.type == "hybrid";
}

function renderNew(node: TokenTreeNode, options: BaseOptions, insert_expression: SKExpression[] = [], USE_BOOLEAN: boolean = false) {

    let ifs = [];

    if (node.nodes.length == 0) {

        return renderLeafNew(node, options, true);

    } else {

        let base = node;

        if (base.nodes.length == 1) {

            const tk_len = base.tk_length;

            while (base.nodes[0].nodes.length == 1 && base.nodes[0].nodes[0].tk_length == tk_len)
                base = base.nodes[0];

            ifs.push(createIfClause(node.symbols[0], node.offset, base.nodes[0].offset - node.offset, options, renderNew(base.nodes[0], options, [], USE_BOOLEAN)));

        } else for (const n of base.nodes) {
            ifs.push(createIfClause(n.symbols[0], node.offset, n.offset - node.offset, options, renderNew(n, options, [], USE_BOOLEAN)));
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
            ifs.push(...renderLeafNew(copy, options, true));
        }
    }

    const [first] = mergeIfStatement(ifs);

    return first ? [...insert_expression, first] : [...insert_expression];
}

function renderLeafNew(node: TokenTreeNode, options: any, USE_BOOLEAN: boolean = false) {

    let
        ifs = [],

        append = [],

        prepend = [];

    const
        id = node.symbols.filter(Sym_Is_Defined).setFilter(getUniqueSymbolName).sort((a, b) => (+Sym_Is_Exclusive(b)) - (+Sym_Is_Exclusive(a))),

        tk_syms: (ProductionTokenSymbol | VirtualTokenSymbol)[] = <any>node.symbols.filter(s => Sym_Is_Virtual_Token(s) || Sym_Is_A_Production_Token(s)).setFilter(getUniqueSymbolName),

        gen_syms = node.symbols.filter(Sym_Is_A_Generic_Type).setFilter(getUniqueSymbolName),

        default_bin = node.offset >= 0 ? ifs : append,

        length_assertion = (node.offset >= 0) ? `&& lexer.byte_length > ${node.offset}` : "";

    for (const tk_sym of tk_syms) {

        const token_production_call = createProductionTokenCall(Sym_Is_Virtual_Token(tk_sym) ? tk_sym.root : tk_sym, options);

        default_bin.push(sk`if ${getActiveTokenQuery(tk_sym)} && ${token_production_call} ${length_assertion} : { return; }`);
    }

    for (const gen_sym of gen_syms) {

        default_bin.push(sk`if ${getActiveTokenQuery(gen_sym)} && ${getSymbolBoolean(gen_sym, options.grammar, "lexer")} ${length_assertion} : { return  }`);
    }

    for (const defined of id) {

        if (Sym_Is_Exclusive(defined) || (tk_syms.length + gen_syms.length) < 1) {

            const preamble = defined.byte_length <= node.offset
                ? "if " + getActiveTokenQuery(defined) + ":"
                : getIfClausePreamble(defined.byte_length - node.offset, node.offset, defined, node.offset, options);

            ifs.push(sk`${preamble}{lexer.setToken(${defined.id}, ${defined.byte_length},${defined.val.length}); return;}`);

        } else {

            const preamble = defined.byte_length <= node.offset
                ? "if " + getActiveTokenQuery(defined) + ":"
                : getIfClausePreamble(defined.byte_length - node.offset, node.offset, defined, node.offset, options);

            const symbols = [...tk_syms, ...gen_syms].map(s => Sym_Is_Virtual_Token(s) ? s.root : s).setFilter(getUniqueSymbolName);

            const id = generateHybridIdentifier([defined, ...symbols]);

            ifs.push(sk`${preamble}{
                if ${symbols.filter(s => s.id != defined.id).map(getActiveTokenQuery).join("  || ")}: {
                    lexer.setToken(${id}, ${defined.byte_length},${defined.val.length}); return;
                }else if ${getActiveTokenQuery(defined)} : {
                    lexer.setToken(${defined.id}, ${defined.byte_length},${defined.val.length}); return;
                }
            }`);
        }
    }

    const [first] = mergeIfStatement(ifs);

    return first ? [...prepend, first, ...append] : [...prepend, ...append];
}
export function renderPreScanFunction() {
    return <SKFunction>sk`fn pre_scan:bool(lexer:__Lexer$ref, tk_row:u32){
        
        [mut] tk_length: u16 = lexer.token_length;
        [mut] bt_length: u16 = lexer.byte_length;
        [mut] type_cache: u32 = lexer._type;
        
        scan(lexer, tk_row, 0);
        
        [mut] type_out:i32 = lexer._type;
    
        lexer._type = type_cache;
        lexer.token_length = tk_length;
        lexer.byte_length = bt_length;
    
        return : type_out > 0;
    }`;
}
