/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import crypto from "crypto";
import {
    getSkippableSymbolsFromItems, getTokenSymbolsFromItems, getUniqueSymbolName,
    Sym_Is_A_Generic_Type,
    Sym_Is_A_Production_Token,
    Sym_Is_A_Token,
    Sym_Is_Defined,
    Sym_Is_EOF,
    Sym_Is_EOP,
    Sym_Is_Exclusive,
    Sym_Is_Look_Behind,
    Sym_Is_Virtual_Token
} from "../grammar/nodes/symbol.js";
import { sk, skRenderAsSK } from "../skribble/skribble.js";
import {
    SKBlock, SKExpression,
    SKFunction, SKIf,
    SKMatch
} from "../skribble/types/node.js";
import {
    DefinedSymbol,
    GrammarObject,
    LookBehindSymbol, HCG3Symbol,
    ProductionTokenSymbol,
    SymbolType, TokenSymbol,
    VirtualTokenSymbol
} from "../types/grammar_nodes.js";
import {
    BaseOptions
} from "../types/render_body_options.js";
import { getClosure } from "./closure.js";
import { getSymbolTree, TokenTreeNode } from "./getSymbolValueAtOffset.js";
import { Item } from "./item.js";
import { getProductionClosure, getProductionID } from "./production.js";


export function sanitizeSymbolValForComment(sym: string | TokenSymbol): string {
    if (typeof sym == "string")
        return sym.replace(/\*/g, "asterisk");
    return sym.val.toString().replace(/\*/g, "asterisk");
}

export function getSymbolBoolean(sym: TokenSymbol, grammar: GrammarObject, lex_name: string = "state.lexer"): string {

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


function createNonCaptureLookBehind(symbol: LookBehindSymbol, grammar: GrammarObject): SKFunction {

    const phased_symbol = getCardinalSymbol(grammar, symbol.phased);

    const type_info = symbol.id;

    const boolean = getIncludeBooleans([phased_symbol], grammar, "pk");

    const token_function = <SKFunction>sk`
        fn no_cap_lb_${symbol.id}:bool(lexer:__Lexer$ref){

            if (lexer._type) == ${type_info} : return : true;

            [mut]pk:Lexer = lexer.copy_in_place();
            
            pk.byte_offset = lexer.prev_byte_offset;
            pk.byte_length = 0;

            loop((pk.byte_offset < lexer.byte_offset)) {
                ${createSymbolScanFunctionCall([phased_symbol], grammar, "pk")};
                if ${boolean}: { 
                    lexer.setToken(${type_info},0,0);
                    return : true;
                };
                pk.next();
            };

            return : false;        
        }`;

    return token_function;
}



function getUTF8ByteAt(s: DefinedSymbol, off: number): number {
    return s.val.charCodeAt(off);
}

function getCardinalSymbol<T = HCG3Symbol>(grammar: GrammarObject, sym: T): T {
    return <any>grammar.meta.all_symbols.get(getUniqueSymbolName(<any>sym));
}

function convertExpressionArrayToBoolean(array: SKExpression[], delimiter: string = "||"): SKExpression {
    return <SKExpression>sk`${array.flatMap(m => [m, delimiter]).slice(0, -1)}`;
}

export function expressionListHash(exprs: SKExpression[]) {
    return hashString(exprs.map(skRenderAsSK).join(""));
}

export function hashString(string: string) {
    return crypto.createHash('md5').update(string).digest("hex").slice(0, 16);
}

function createIfClause(symbol: DefinedSymbol | VirtualTokenSymbol, offset: number, length: number, grammar: GrammarObject, expressions: SKExpression[]) {

    const start = offset;

    if (Sym_Is_Virtual_Token(symbol)) {
        length = 1;
        offset = offset - symbol.root_offset;
        symbol = <DefinedSymbol>symbol.item.sym(grammar);
    }
    let _if = <SKIf>sk`${getIfClausePreamble(length, start, symbol, offset, grammar, false)} {}`;


    if (expressions.length == 1 && expressions[0].type == "block") {
        _if.expression = expressions[0];
    } else
        //@ts-ignore
        _if.expression.expressions.push(...expressions);

    return _if;
}

function getIfClausePreamble(length: number, start: number, symbol: DefinedSymbol, offset: number, grammar: GrammarObject, ADD_TOKEN_QUERY = true) {

    symbol = getCardinalSymbol(grammar, symbol);

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
export function getSymbolMap(symbols: TokenSymbol[], grammar: GrammarObject): number[] {
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

export function getSymbolMapFromIds(ids: number[], grammar: GrammarObject): number[] {
    ids = ids.sort((a, b) => a - b).filter(i => i >= 1);

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
export function getSymbolMapPlaceHolder(symbols: TokenSymbol[], grammar: GrammarObject) {
    return "symbollookup_" + getSymbolMap(symbols, grammar).map(i => i >>> 0).join("_");
}


export function getIncludeBooleans(
    syms: TokenSymbol[],
    grammar: GrammarObject,
    lex_name: string = "state.lexer",
): SKExpression {
    const types = [];
    // Dump hybrid symbols into own bucket.
    const used_syms = syms.flatMap(s => {
        if (Sym_Is_Hybrid(s)) {
            //@ts-expect-error
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

export function createProductionTokenCall(tok: ProductionTokenSymbol, grammar: GrammarObject, ADD_PRE_SCAN_BOOLEAN: boolean = false): string {

    const prod_id = getProductionID(tok, grammar);
    const production = grammar.productions[prod_id];
    const prod_name = production.name;

    let pre_scan = "";

    if (ADD_PRE_SCAN_BOOLEAN) {

        const symbols = getTokenSymbolsFromItems(getProductionClosure(prod_id, grammar, false), grammar).setFilter(getUniqueSymbolName);

        const symbol_map_id = getSymbolMapPlaceHolder(symbols, grammar);

        pre_scan = `pre_scan(lexer, ${symbol_map_id}) &&`;
    }

    return `${pre_scan} token_production(lexer, _A_${prod_name}_A_, ${prod_id}, ${tok.id}, ${1 << tok.token_id}, &> state_buffer, &> scan)`;
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
    grammar: GrammarObject,
    lex_name: string = "state.lexer",
    PEEK: boolean = false,
): SKExpression {
    const symbol_map_id = getSymbolMapPlaceHolder(symbols, grammar);
    return <SKExpression>sk`scan(${lex_name}, ${symbol_map_id}, 0);`;
}

function getActiveTokenQuery(symbol: TokenSymbol | ProductionTokenSymbol): string {
    return Sym_Is_Virtual_Token(symbol) ? `isTokenActive(${symbol.root.id}, tk_row)` : `isTokenActive(${symbol.id}, tk_row)`;
}

export function getSymbolScannerFunctions(grammar: GrammarObject): SKFunction[] {

    const functions = [];

    const id_symbols = [...grammar.meta.all_symbols.values()]
        .filter(s => Sym_Is_A_Token(s) || Sym_Is_A_Production_Token(s))
        //@ts-expect-error
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

    const tree = getSymbolTree(<any>id_symbols, grammar);

    const lb_syms = tree.symbols.filter(Sym_Is_Look_Behind).setFilter(getUniqueSymbolName);

    const tk_syms = tree.symbols.filter(Sym_Is_A_Production_Token).setFilter(getUniqueSymbolName);

    const gen_syms = tree.symbols.filter(Sym_Is_A_Generic_Type).setFilter(getUniqueSymbolName);

    const group_size = 0x7F;

    if (tk_syms.length > 0)
        functions.push(buildPreScanFunction());

    for (const lb_sym of lb_syms.reverse()) {

        const lb_function = createNonCaptureLookBehind(<any>lb_sym, grammar);

        functions.push(lb_function);

        outer_fn.expressions.splice(1, 0, (<SKExpression>sk`if ${getActiveTokenQuery(lb_sym)} && ${lb_function.name}(lexer) : { return }`));
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
            expressions: [...renderNew(tree, grammar)]
        })}; break;`).matches[0];

        match_stmt.matches.push(match_clause);
    }

    //Reorder the default match statement to be the last one 
    match_stmt.matches.push(match_stmt.matches.shift());

    //Add fallback types

    const ifs = [];

    for (const tk_sym of tk_syms) {
        const token_production_call = createProductionTokenCall(tk_sym, grammar, true);

        ifs.push(sk`if ${getActiveTokenQuery(tk_sym)} && ${token_production_call} : { return }`);
    }

    for (const gen_sym of gen_syms)
        ifs.push(sk`if ${getActiveTokenQuery(gen_sym)} && ${getSymbolBoolean(gen_sym, grammar, "lexer")} : { return }`);

    const [first] = mergeIfStatement(ifs);

    if (first)
        expression_array.push(first);

    functions.push(fn, outer_fn);

    return functions;
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
    //@ts-expect-error
    return sym.type == "hybrid";
}

function renderNew(node: TokenTreeNode, grammar: GrammarObject, insert_expression: SKExpression[] = [], USE_BOOLEAN: boolean = false) {

    let ifs = [];

    if (node.nodes.length == 0) {

        return renderLeafNew(node, grammar);

    } else {

        let base = node;

        if (base.nodes.length == 1) {

            const tk_len = base.tk_length;

            while (base.nodes[0].nodes.length == 1 && base.nodes[0].nodes[0].tk_length == tk_len)
                base = base.nodes[0];

            ifs.push(createIfClause(<any>node.symbols[0], node.offset, base.nodes[0].offset - node.offset, grammar, renderNew(base.nodes[0], grammar, [], USE_BOOLEAN)));

        } else for (const n of base.nodes) {
            ifs.push(createIfClause(<any>n.symbols[0], node.offset, n.offset - node.offset, grammar, renderNew(n, grammar, [], USE_BOOLEAN)));
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
            ifs.push(...renderLeafNew(copy, grammar));
        }
    }

    const [first] = mergeIfStatement(ifs);

    return first ? [...insert_expression, first] : [...insert_expression];
}

function renderLeafNew(node: TokenTreeNode, grammar: GrammarObject) {

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

        const token_production_call = createProductionTokenCall(Sym_Is_Virtual_Token(tk_sym) ? tk_sym.root : tk_sym, grammar);

        default_bin.push(sk`if ${getActiveTokenQuery(tk_sym)} && ${token_production_call} ${length_assertion} : { return; }`);
    }

    for (const gen_sym of gen_syms) {

        default_bin.push(sk`if ${getActiveTokenQuery(gen_sym)} && ${getSymbolBoolean(gen_sym, grammar, "lexer")} ${length_assertion} : { return  }`);
    }

    for (const defined of id) {

        if (true  /*Sym_Is_Exclusive(defined) || (tk_syms.length + gen_syms.length) < 1*/) {

            const preamble = defined.byte_length <= node.offset
                ? "if " + getActiveTokenQuery(defined) + ":"
                : getIfClausePreamble(defined.byte_length - node.offset, node.offset, defined, node.offset, grammar);

            ifs.push(sk`${preamble}{lexer.setToken(${defined.id}, ${defined.byte_length},${defined.val.length}); return;}`);

        }/* else {

            const preamble = defined.byte_length <= node.offset
                ? "if " + getActiveTokenQuery(defined) + ":"
                : getIfClausePreamble(defined.byte_length - node.offset, node.offset, defined, node.offset, options);

            const symbols = [...tk_syms, ...gen_syms].map(s => Sym_Is_Virtual_Token(s) ? s.root : s).setFilter(getUniqueSymbolName);

            const id = defined.id; //generateHybridIdentifier([defined, ...symbols]);

            ifs.push(sk`${preamble}{
                if ${symbols.filter(s => s.id != defined.id).map(getActiveTokenQuery).join("  || ")}: {
                    lexer.setToken(${id}, ${defined.byte_length},${defined.val.length}); return;
                }else if ${getActiveTokenQuery(defined)} : {
                    lexer.setToken(${defined.id}, ${defined.byte_length},${defined.val.length}); return;
                }
            }`);
        }*/
    }

    const [first] = mergeIfStatement(ifs);

    return first ? [...prepend, first, ...append] : [...prepend, ...append];
}
export function buildPreScanFunction() {
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
