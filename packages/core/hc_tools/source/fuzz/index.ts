import { GrammarObject, getEntryProductions, GrammarProduction, HCG3ProductionBody, SymbolType, ProductionSymbol, ProductionTokenSymbol, Sym_Is_A_Token, Sym_Is_A_Production, Sym_Is_A_Production_Token } from '@hctoolkit/common';
/**
 * Creates a random string that can be produced by the language 
 * defined by the given grammar. 
 * 
 * @param grammar 
 */
export function createFuzz(grammar: GrammarObject): string {

    const entry = getEntryProductions(grammar);

    return fuzzProduction(rs(entry), grammar, false);
}

function fuzzProductionSym(sym: ProductionSymbol | ProductionTokenSymbol, g: GrammarObject, IS_TOKEN: boolean): string {

    const production = g.productions[sym.val];

    return fuzzProduction(production, g, IS_TOKEN || Sym_Is_A_Production_Token(sym));
}

function fuzzProduction(production: GrammarProduction, g: GrammarObject, IS_TOKEN: boolean): string {

    return fuzzBody(rs(production.bodies), g, IS_TOKEN);
}

function fuzzBody(body: HCG3ProductionBody, g: GrammarObject, IS_TOKEN: boolean): string {
    const str: string[] = [];

    outer: for (const sym of body.sym) {

        if (Sym_Is_A_Token(sym) || Sym_Is_A_Production(sym))

            switch (sym.type) {

                case SymbolType.GENERATED:
                    switch (sym.val) {
                        case "ids":
                        case "id": str.push(getGeneratedID()); break;
                        case "nums":
                        case "num": str.push(getGeneratedNum()); break;
                        case "syms":
                        case "sym": str.push("$"); break;
                        case "nl": str.push("\n"); break;
                        case "sp": str.push(" "); break;
                        case "END_OF_FILE": break outer;
                    }
                    break;

                case SymbolType.EXCLUSIVE_LITERAL:
                    str.push(sym.val);
                    break;

                case SymbolType.LITERAL:
                    str.push(sym.val);
                    break;

                case SymbolType.END_OF_FILE:
                    break outer;

                case SymbolType.PRODUCTION:
                    str.push(fuzzProductionSym(sym, g, IS_TOKEN));
                    break;

                case SymbolType.PRODUCTION_TOKEN_SYMBOL:
                    str.push(fuzzProductionSym(sym, g, IS_TOKEN));
                    break;
            }
    }
    if (IS_TOKEN)
        return str.join("");

    return str.join(" ");
}

function getGeneratedID(): string {
    return "abcdefghijklmnopqrstuvwxyz"[Math.round(Math.random() * 26)];
}

function getGeneratedNum(): string {
    return "0123456789"[Math.round(Math.random() * 10)];
}

/**
 * Select a random member from the given array
 * @param array 
 * @returns 
 */
export function rs<T>(array: T[]): T {
    const random_number = Math.random();

    const index = (array.length - 1) * random_number;

    return array[Math.round(index)];
}