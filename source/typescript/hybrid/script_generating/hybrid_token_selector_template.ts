import { Grammar, SymbolType } from "../../types/grammar.js";
import { Symbol } from "../../types/Symbol";

function buildIfs(syms: Symbol[], off = 0, USE_MAX = false, token_val = "TokenSymbol"): string[] {
    const stmts: string[] = [];

    for (const sym of syms) {
        if ((<string>sym.val).length <= off) {
            if (USE_MAX)
                stmts.unshift(`if(length <= ${off}){type = ${token_val}; this.id =${sym.id}; length = ${off};}`);
            else
                stmts.unshift(`type = TokenSymbol; this.id =${sym.id} /* ${sym.val} */; length = ${off};`);
        }
    }
    let first = true;

    for (const group of syms.filter(s => (<string>s.val).length > off).group(s => s.val[off])) {
        if (first)
            stmts.push(`const val: u32 = str.charCodeAt(base+${off})`);
        const v = group[0].val[off];
        stmts.push(
            `${first ? "" : "else "}if(val == ${v.charCodeAt(0)} ){`,
            ...buildIfs(group, off + 1, USE_MAX, token_val),
            "}"
        );
        first = false;
    };

    return stmts;
}


export const getTokenSelectorStatements = (grammar: Grammar): { symbols: string, keywords: string; } => {
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