/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import {
    getTokenSymbolsFromItems, getUniqueSymbolName,
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
import { sk } from "../skribble/skribble.js";
import {
    SKBlock, SKExpression,
    SKFunction, SKIf,
    SKMatch
} from "../skribble/types/node.js";
import {
    DefinedSymbol,
    GrammarObject, HCG3Symbol,
    ProductionTokenSymbol,
    SymbolType, TokenSymbol,
    VirtualTokenSymbol
} from "../types/grammar_nodes.js";
import { getSymbolTree, TokenTreeNode } from "./getSymbolValueAtOffset.js";
import { getProductionClosure, getProductionID } from "./production.js";
const string_to_md5 = await (async (crypto) => {

    return typeof globalThis["window"]
        ? (() => {

            //  A formatted version of a popular md5 implementation.
            //  Copyright(c) Denes Kellner 2020
            //  https://deneskellner.com/
            //  Original copyright (c) Paul Johnston & Greg Holt.
            //  The function itself is now 42 lines long.

            // Retrieved 2021 https://stackoverflow.com/a/60467595

            function md5(inputString) {
                var hc = "0123456789abcdef";
                function rh(n) { var j, s = ""; for (j = 0; j <= 3; j++) s += hc.charAt((n >> (j * 8 + 4)) & 0x0F) + hc.charAt((n >> (j * 8)) & 0x0F); return s; }
                function ad(x, y) { var l = (x & 0xFFFF) + (y & 0xFFFF); var m = (x >> 16) + (y >> 16) + (l >> 16); return (m << 16) | (l & 0xFFFF); }
                function rl(n, c) { return (n << c) | (n >>> (32 - c)); }
                function cm(q, a, b, x, s, t) { return ad(rl(ad(ad(a, q), ad(x, t)), s), b); }
                function ff(a, b, c, d, x, s, t) { return cm((b & c) | ((~b) & d), a, b, x, s, t); }
                function gg(a, b, c, d, x, s, t) { return cm((b & d) | (c & (~d)), a, b, x, s, t); }
                function hh(a, b, c, d, x, s, t) { return cm(b ^ c ^ d, a, b, x, s, t); }
                function ii(a, b, c, d, x, s, t) { return cm(c ^ (b | (~d)), a, b, x, s, t); }
                function sb(x) {
                    var i; var nblk = ((x.length + 8) >> 6) + 1; var blks = new Array(nblk * 16); for (i = 0; i < nblk * 16; i++) blks[i] = 0;
                    for (i = 0; i < x.length; i++) blks[i >> 2] |= x.charCodeAt(i) << ((i % 4) * 8);
                    blks[i >> 2] |= 0x80 << ((i % 4) * 8); blks[nblk * 16 - 2] = x.length * 8; return blks;
                }
                var i, x = sb(inputString), a = 1732584193, b = -271733879, c = -1732584194, d = 271733878, olda, oldb, oldc, oldd;
                for (i = 0; i < x.length; i += 16) {
                    olda = a; oldb = b; oldc = c; oldd = d;
                    a = ff(a, b, c, d, x[i + 0], 7, -680876936); d = ff(d, a, b, c, x[i + 1], 12, -389564586); c = ff(c, d, a, b, x[i + 2], 17, 606105819);
                    b = ff(b, c, d, a, x[i + 3], 22, -1044525330); a = ff(a, b, c, d, x[i + 4], 7, -176418897); d = ff(d, a, b, c, x[i + 5], 12, 1200080426);
                    c = ff(c, d, a, b, x[i + 6], 17, -1473231341); b = ff(b, c, d, a, x[i + 7], 22, -45705983); a = ff(a, b, c, d, x[i + 8], 7, 1770035416);
                    d = ff(d, a, b, c, x[i + 9], 12, -1958414417); c = ff(c, d, a, b, x[i + 10], 17, -42063); b = ff(b, c, d, a, x[i + 11], 22, -1990404162);
                    a = ff(a, b, c, d, x[i + 12], 7, 1804603682); d = ff(d, a, b, c, x[i + 13], 12, -40341101); c = ff(c, d, a, b, x[i + 14], 17, -1502002290);
                    b = ff(b, c, d, a, x[i + 15], 22, 1236535329); a = gg(a, b, c, d, x[i + 1], 5, -165796510); d = gg(d, a, b, c, x[i + 6], 9, -1069501632);
                    c = gg(c, d, a, b, x[i + 11], 14, 643717713); b = gg(b, c, d, a, x[i + 0], 20, -373897302); a = gg(a, b, c, d, x[i + 5], 5, -701558691);
                    d = gg(d, a, b, c, x[i + 10], 9, 38016083); c = gg(c, d, a, b, x[i + 15], 14, -660478335); b = gg(b, c, d, a, x[i + 4], 20, -405537848);
                    a = gg(a, b, c, d, x[i + 9], 5, 568446438); d = gg(d, a, b, c, x[i + 14], 9, -1019803690); c = gg(c, d, a, b, x[i + 3], 14, -187363961);
                    b = gg(b, c, d, a, x[i + 8], 20, 1163531501); a = gg(a, b, c, d, x[i + 13], 5, -1444681467); d = gg(d, a, b, c, x[i + 2], 9, -51403784);
                    c = gg(c, d, a, b, x[i + 7], 14, 1735328473); b = gg(b, c, d, a, x[i + 12], 20, -1926607734); a = hh(a, b, c, d, x[i + 5], 4, -378558);
                    d = hh(d, a, b, c, x[i + 8], 11, -2022574463); c = hh(c, d, a, b, x[i + 11], 16, 1839030562); b = hh(b, c, d, a, x[i + 14], 23, -35309556);
                    a = hh(a, b, c, d, x[i + 1], 4, -1530992060); d = hh(d, a, b, c, x[i + 4], 11, 1272893353); c = hh(c, d, a, b, x[i + 7], 16, -155497632);
                    b = hh(b, c, d, a, x[i + 10], 23, -1094730640); a = hh(a, b, c, d, x[i + 13], 4, 681279174); d = hh(d, a, b, c, x[i + 0], 11, -358537222);
                    c = hh(c, d, a, b, x[i + 3], 16, -722521979); b = hh(b, c, d, a, x[i + 6], 23, 76029189); a = hh(a, b, c, d, x[i + 9], 4, -640364487);
                    d = hh(d, a, b, c, x[i + 12], 11, -421815835); c = hh(c, d, a, b, x[i + 15], 16, 530742520); b = hh(b, c, d, a, x[i + 2], 23, -995338651);
                    a = ii(a, b, c, d, x[i + 0], 6, -198630844); d = ii(d, a, b, c, x[i + 7], 10, 1126891415); c = ii(c, d, a, b, x[i + 14], 15, -1416354905);
                    b = ii(b, c, d, a, x[i + 5], 21, -57434055); a = ii(a, b, c, d, x[i + 12], 6, 1700485571); d = ii(d, a, b, c, x[i + 3], 10, -1894986606);
                    c = ii(c, d, a, b, x[i + 10], 15, -1051523); b = ii(b, c, d, a, x[i + 1], 21, -2054922799); a = ii(a, b, c, d, x[i + 8], 6, 1873313359);
                    d = ii(d, a, b, c, x[i + 15], 10, -30611744); c = ii(c, d, a, b, x[i + 6], 15, -1560198380); b = ii(b, c, d, a, x[i + 13], 21, 1309151649);
                    a = ii(a, b, c, d, x[i + 4], 6, -145523070); d = ii(d, a, b, c, x[i + 11], 10, -1120210379); c = ii(c, d, a, b, x[i + 2], 15, 718787259);
                    b = ii(b, c, d, a, x[i + 9], 21, -343485551); a = ad(a, olda); b = ad(b, oldb); c = ad(c, oldc); d = ad(d, oldd);
                }
                return rh(a) + rh(b) + rh(c) + rh(d);
            }

            return md5;
        })()
        : (crypto = (await import("crypto")), str => {
            return crypto.createHash('md5').update(str).digest("hex");
        });
})(null);

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

function getUTF8ByteAt(s: DefinedSymbol, off: number): number {
    return s.val.charCodeAt(off);
}

function getCardinalSymbol<T = HCG3Symbol>(grammar: GrammarObject, sym: T): T {
    return <any>grammar.meta.all_symbols.get(getUniqueSymbolName(<any>sym));
}

export function hashString(string: string) {

    return string_to_md5(string).slice(0, 16);

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
        ? `if ${active_token_query} l.get_byte_at(l.byte_offset ${start > 0 ? "+" + start : ""}) ~= ${getUTF8ByteAt(symbol, offset)} :`
        : `if ${active_token_query} ${length} == compare(l, l.byte_offset  ${start > 0 ? "+" + start : ""}, ${symbol.byte_offset + offset}, ${length}, &>>token_sequence_lookup) :`;
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

export function createProductionTokenCall(tok: ProductionTokenSymbol, grammar: GrammarObject, ADD_PRE_SCAN_BOOLEAN: boolean = false, ALLOW_RSL: boolean = true): string {

    const prod_id = getProductionID(tok, grammar);
    const production = grammar.productions[prod_id];
    const prod_name = production.name;

    let pre_scan = "";

    if (ADD_PRE_SCAN_BOOLEAN) {

        const symbols = getTokenSymbolsFromItems(getProductionClosure(prod_id, grammar, false), grammar).setFilter(getUniqueSymbolName);

        const symbol_map_id = getSymbolMapPlaceHolder(symbols, grammar);

        pre_scan = `pre_scan(l, ${symbol_map_id}) &&`;
    }

    return `${pre_scan} token_production(l, _A_${prod_name}_A_, ${prod_id}, ${tok.id}, ${1 << tok.token_id}, &> states_buffer, &> scan)`;
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
    fn scan:void(l:__Lexer$ref, token:u32, skip:u32){
        //Do look behind        
        if((l._type) <= 0) : 
            scan_core(l, token);

        if(skip > 0 && isTokenActive(l._type, skip)) : {
            loop((isTokenActive(l._type, skip))){
                l.next();
                scan_core(l, token);
            };
        }
    }
    `;

    const tree = getSymbolTree(<any>id_symbols, grammar);

    const tk_syms = tree.symbols.filter(Sym_Is_A_Production_Token).setFilter(getUniqueSymbolName);

    const gen_syms = tree.symbols.filter(Sym_Is_A_Generic_Type).setFilter(getUniqueSymbolName);

    const group_size = 0x7F;

    if (tk_syms.length > 0)
        functions.push(buildPreScanFunction());

    const fn = <SKFunction>sk`fn scan_core:void(l:__Lexer$ref, tk_row:u32){  }`;

    const expression_array = fn.expressions;

    const match_stmt: SKMatch = <SKMatch>sk`match (l.get_byte_at(l.byte_offset) & ${group_size}): default:break`;

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
        ifs.push(sk`if ${getActiveTokenQuery(gen_sym)} && ${getSymbolBoolean(gen_sym, grammar, "l")} : { l._type = ${gen_sym.id} ; return }`);

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

        length_assertion = (node.offset >= 0) ? `&& l.byte_length > ${node.offset}` : "";

    for (const tk_sym of tk_syms) {

        const token_production_call = createProductionTokenCall(Sym_Is_Virtual_Token(tk_sym) ? tk_sym.root : tk_sym, grammar);

        default_bin.push(sk`if ${getActiveTokenQuery(tk_sym)} && ${token_production_call} ${length_assertion} : { return; }`);
    }

    for (const gen_sym of gen_syms) {

        default_bin.push(sk`if ${getActiveTokenQuery(gen_sym)} && ${getSymbolBoolean(gen_sym, grammar, "l")} ${length_assertion} :  { l._type = ${gen_sym.id} ; return }`);
    }

    for (const defined of id) {

        const preamble = defined.byte_length <= node.offset
            ? "if " + getActiveTokenQuery(defined) + ":"
            : getIfClausePreamble(defined.byte_length - node.offset, node.offset, defined, node.offset, grammar);

        ifs.push(sk`${preamble}{l.setToken(${defined.id}, ${defined.byte_length},${defined.val.length}); return;}`);
    }

    const [first] = mergeIfStatement(ifs);

    return first ? [...prepend, first, ...append] : [...prepend, ...append];
}
export function buildPreScanFunction() {
    return <SKFunction>sk`fn pre_scan:bool(l:__Lexer$ref, token:u32){
        
        [mut] tk_length: u16 = l.token_length;
        [mut] bt_length: u16 = l.byte_length;
        [mut] type_cache: u32 = l._type;
        
        scan(l, token, 0);
        
        [mut] type_out:i32 = l._type;
    
        l._type = type_cache;
        l.token_length = tk_length;
        l.byte_length = bt_length;
    
        return : type_out > 0;
    }`;
}
