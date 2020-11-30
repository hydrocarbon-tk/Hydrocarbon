import { Grammar, SymbolType } from "../../types/grammar.js";
import { Symbol } from "../../types/Symbol";
import { buildIfs } from "../utilities/utilities.js";


export const getTokenSelectorStatements = (grammar: Grammar): { symbols: string, keywords: string; } => {
    return {
        keywords: "",
        symbols: ""
    };
    const syms: Symbol[] = [], keywords: Symbol[] = [];

    for (const sym of grammar.meta.all_symbols.values()) {
        if (
            sym.type == SymbolType.SYMBOL
            || sym.type == SymbolType.ESCAPED
            || sym.type == SymbolType.LITERAL
        ) {
            if (sym.type == SymbolType.LITERAL) {
                keywords.push(sym);
            } else
                syms.push(sym);
        }
    }
    return {
        symbols: buildIfs(syms.sort((a, b) => a.id - b.id)).join("\n"),
        keywords: buildIfs(keywords.sort((a, b) => a.id - b.id), 0, true, "TokenKeyword").join("\n")
    };
};