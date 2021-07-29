import { Lexer } from "@candlelib/wind";
import { getSkippableSymbolsFromItems, getUniqueSymbolName, Sym_Is_A_Generic_Type, Sym_Is_A_Production, Sym_Is_A_Production_Token, Sym_Is_Defined, Sym_Is_Empty, Sym_Is_Look_Behind, Sym_Is_Virtual_Token } from "../grammar/nodes/symbol.js";
import { HCG3Grammar, TokenSymbol, VirtualTokenSymbol } from "../types/grammar_nodes";
import { getClosure, getFollowClosure } from "./closure.js";
import { Item } from "./item";
import { getProductionClosure } from "./production.js";


//Assign unique id to every symbol
function getSymbolValueAtOffset(sym, offset = 0) {

    if (Sym_Is_Defined(sym))
        return sym.val[offset];
    else if (Sym_Is_A_Generic_Type(sym))
        return "--" + sym.val;

    else
        return "-1";
}

function getCharType(id) {
    let type = "";
    switch ((new Lexer(id)).type) {
        case Lexer.types.id:
            type = "--id";
            break;
        case Lexer.types.number:
            type = "--num";
            break;
        case Lexer.types.new_line:
            type = "--nl-no-conflict";
            break;
        case Lexer.types.white_space:
            type = "--ws-no-conflict";
            break;
        default:
            type = "--sym-no-conflict";
    }
    return type;
}

function getTKProdSymbolsFromClosure(
    closure: Item[],
    grammar: HCG3Grammar,
    defined_buckets: TokenNode[],
    generic_buckets: TokenNode[],
    symbol: VirtualTokenSymbol,
    offset: number
) {

    const skippable = getSkippableSymbolsFromItems(closure, grammar);


    for (const item of closure) {

        const sym = item.sym(grammar);

        if (!Sym_Is_A_Production(sym))
            (Sym_Is_Defined(sym) ? defined_buckets : generic_buckets).push({
                id: getSymbolValueAtOffset(sym) + "",
                symbol: <VirtualTokenSymbol>{
                    item,
                    type: "v-token-production",
                    root: symbol.root,
                    closure: closure,
                    root_offset: offset,
                    production_offset: symbol.production_offset + 1,
                    token_offset: 0,
                    peek_depth: symbol.peek_depth + 1
                }
            });

        for (const sym of skippable)
            if (!Sym_Is_A_Production(sym) && !Sym_Is_A_Production_Token(sym))
                (Sym_Is_Defined(sym) ? defined_buckets : generic_buckets).push({
                    id: getSymbolValueAtOffset(sym) + "",
                    symbol: <VirtualTokenSymbol>{
                        item,
                        type: "v-token-production",
                        root: symbol.root,
                        closure: closure,
                        root_offset: offset,
                        production_offset: symbol.production_offset + 1,
                        token_offset: 0,
                        peek_depth: symbol.peek_depth
                    }
                });

    }
}
interface TokenNode {
    id: string,
    symbol: TokenSymbol;
}
export interface TokenTreeNode {
    id: string;

    symbols: TokenSymbol[];

    nodes: TokenTreeNode[];

    offset: number;

    /**
     * Number of defined symbols
     */
    tk_length: number;
}
export function getSymbolTree(symbols: TokenSymbol[], grammar, offset = 0): TokenTreeNode {

    if (offset == 0)
        symbols = symbols.filter(s => !Sym_Is_Empty(s));

    //if (offset > 4)
    //    return { id:"", symbols: [], nodes: [], offset };

    const defined_buckets = [], token_buckets = [], generic_buckets = [], syms = symbols.sort((a, b) => {
        const [scoreA, scoreB] = [a, b].map(sym => {
            if (Sym_Is_Look_Behind(sym))
                return 6;
            if (Sym_Is_A_Production_Token(sym))
                return 4;
            if (Sym_Is_A_Generic_Type(sym))
                return 2;
            return 0;
        });

        return scoreA - scoreB;
    }), nodes: TokenTreeNode[] = [], id = "";

    let ABORT = false;

    let tk_length = 0;

    if (symbols.length > 1) {
        for (const symbol of symbols) {

            if (Sym_Is_Virtual_Token(symbol)) {

                const item = symbol.item, sym = item.sym(grammar), off = offset - symbol.root_offset;

                if (Sym_Is_Defined(sym)) {

                    if (sym.val.length <= off) {

                        let new_item = item.increment();

                        const closure = new_item.atEND
                            ? getFollowClosure([new_item], symbol.closure, grammar).filter(i => !i.atEND)
                            : getClosure([new_item], grammar, true);

                        getTKProdSymbolsFromClosure(closure, grammar, token_buckets, generic_buckets, symbol, offset);

                    } else {
                        token_buckets.push({
                            id: getSymbolValueAtOffset(sym, off),
                            symbol
                        });
                    }
                } else {
                    let new_item = item.increment();

                    const closure = new_item.atEND
                        ? getFollowClosure([new_item], symbol.closure, grammar)
                        : getClosure([new_item], grammar, true);

                    getTKProdSymbolsFromClosure(closure, grammar, token_buckets, generic_buckets, symbol, offset);

                    generic_buckets.push({
                        id: getSymbolValueAtOffset(sym),
                        symbol: Object.assign({}, symbol, {
                            peek_depth: symbol.peek_depth + 1
                        })
                    });
                }

            } else if (Sym_Is_A_Production_Token(symbol)) {

                const closure = getProductionClosure(symbol.production.id, grammar, true);

                getTKProdSymbolsFromClosure(
                    closure,
                    grammar,
                    token_buckets,
                    generic_buckets,
                    <VirtualTokenSymbol>{
                        root: symbol,
                        production_offset: -1,
                        peek_depth: -1
                    },
                    offset
                );

            } else if (Sym_Is_Defined(symbol)) {
                tk_length++;
                if (symbol.val.length > offset)
                    defined_buckets.push({ id: symbol.val[offset], symbol });
            } else {
                generic_buckets.push({ id: getSymbolValueAtOffset(symbol), symbol });
            }
        }

        if (!ABORT) {

            const defined_sets = defined_buckets.sort((a, b) => {
                //if (Sym_Is_Virtual_Token(a.symbol))
                //    return 1;
                //if (Sym_Is_Virtual_Token(b.symbol))
                //    return -1;
                return b.symbol.val.length - a.symbol.val.length;
            }).groupMap(d => d.id);
            const generic_sets = generic_buckets.groupMap(d => d.id);
            const token_sets = token_buckets.groupMap(d => d.id);

            for (const [char, set] of defined_sets.entries()) {

                //if (offset == 0 && set.length == 1 && Sym_Is_Virtual_Token(set[0].symbol))
                //    continue;

                const symbols = set.map(s => s.symbol);

                let type = getCharType(char);

                const gen_symbols = generic_sets.get(type) || [];
                const token_symbols = token_sets.get(char) || [];

                const combined = symbols.concat(...gen_symbols.map(s => s.symbol), ...token_symbols.map(s => s.symbol));

                const node = getSymbolTree(combined, grammar, offset + 1);
                node.id = char;
                nodes.push(node);
            }
        }
    } else {
        tk_length = 1;
    }


    return { id, symbols: syms, nodes, offset, tk_length };
}

export function* getSymbolTreeLeaves(out) {
    if (out.nodes.length == 0) {
        yield out;
    } else {
        for (const node of out.nodes)
            yield* getSymbolTreeLeaves(node);
    }
}