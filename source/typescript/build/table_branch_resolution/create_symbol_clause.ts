import {
    convert_symbol_to_string,
    getFollowSymbolsFromItems,
    getSkippableSymbolsFromItems,
    getTokenSymbolsFromItems,
    getUniqueSymbolName,
    Sym_Is_Ambiguous, Sym_Is_Defined
} from "../../grammar/nodes/symbol.js";
import { TokenSymbol } from '../../types/grammar_nodes';
import { RenderBodyOptions } from "../../types/render_body_options";
import { getClosure, getFollowClosure } from "../../utilities/closure.js";
import { Item } from "../../utilities/item.js";
export function create_symbol_clause(items: Item[], prods: number[], { scope, grammar }: RenderBodyOptions) {
    const active_items = items.filter(i => !i.atEND);
    const end_items = items.filter(i => i.atEND);

    const expected_symbols = [
        ...getTokenSymbolsFromItems([
            ...active_items.flatMap(i => getClosure([i], grammar, false)),
            ...prods.flatMap(i => grammar.productions[i].bodies).map(b => new Item(b.id, b.length, b.length)),
        ], grammar),
        ...getFollowSymbolsFromItems(end_items, grammar)
    ].setFilter(getUniqueSymbolName);

    const skipped_symbols = getSkippableSymbolsFromItems(getFollowClosure(
        [...items,

        ...(scope == "GOTO"
            ? prods.flatMap(i => grammar.productions[i].bodies).map(b => new Item(b.id, b.length, b.length))
            : [])
        ],
        grammar.lr_items,
        grammar
    ), grammar);
    let code = `
        
    symbols: 
        expected[${expected_symbols.flatMap(convert_sym_to_code).setFilter().sort().join("   ")}]`;

    if (skipped_symbols.length > 0)
        code += `\n        skipped[${skipped_symbols.flatMap(convert_sym_to_code).setFilter().sort().join("   ")}]`;
    return code;
}

export function convert_sym_to_code(input: any, index: number, array: any[]): string | string[] {

    let sym = input as TokenSymbol;

    if (Sym_Is_Ambiguous(sym)) {

        const defined_symbols = sym.syms.filter(Sym_Is_Defined);

        return [create_symbol_comment(sym), ...defined_symbols.flatMap(convert_sym_to_code)].join("  ");
    }

    return `${sym.id} ${create_symbol_comment(sym)}`;
}
;
export function create_symbol_comment(sym: TokenSymbol) {
    return `/* ${convert_symbol_to_string(<any>sym).replace(/\*\//g, "asterisk/")} */`;
}

