import {
    GrammarObject,
    getEntryProductions,
    GrammarProduction,
    HCG3ProductionBody,
    SymbolType,
    ProductionSymbol,
    ProductionTokenSymbol,
    Sym_Is_A_Token,
    Sym_Is_A_Production
} from '@hctoolkit/common';
/**
 * Creates a random string that can be produced by the language 
 * defined by the given grammar. 
 * 
 * @param grammar 
 */
export function createRR(grammar: GrammarObject): string {

    const seen: Set<number> = new Set;

    for (const production of grammar) {

    }


    const entry = getEntryProductions(grammar);

    return fuzzProduction(rs(entry), grammar);
}

function fuzzProductionSym(sym: ProductionSymbol | ProductionTokenSymbol, g: GrammarObject): string {

    const production = g.productions[sym.val];

    return fuzzProduction(production, g);
}

function fuzzProduction(production: GrammarProduction, g: GrammarObject): string {
    return fuzzBody(rs(production.bodies), g);
}

function fuzzBody(body: HCG3ProductionBody, g: GrammarObject): string {
    const str: string[] = [];

    outer: for (const sym of body.sym) {

        if (Sym_Is_A_Token(sym) || Sym_Is_A_Production(sym))

            switch (sym.type) {

                case SymbolType.GENERATED:
                    switch (sym.val) {
                        case "id": str.push(getGeneratedID()); break;
                        case "num": str.push(getGeneratedNum()); break;
                        case "nl": str.push("\n"); break;
                        case "sym": str.push("$"); break;
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
                    str.push(fuzzProductionSym(sym, g));

                case SymbolType.PRODUCTION_TOKEN_SYMBOL:
                    str.push(fuzzProductionSym(sym, g));
            }
    }

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