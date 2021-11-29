import {
    GrammarObject,
    getEntryProductions,
    GrammarProduction,
    HCG3ProductionBody,
    SymbolType,
    ProductionSymbol,
    ProductionTokenSymbol,
    Sym_Is_A_Token,
    Sym_Is_A_Production,
    Sym_Is_A_Production_Token,
    char_lu_table,
    TokenTypes
} from '@hctoolkit/common';

let sym_lu: number[] = [];
let id_cont_lu: number[] = [];
let id_start_lu: number[] = [];
let num_lu: number[] = [];
let LOOKUPS_BUILT = false;

function buildLookups() {
    if (LOOKUPS_BUILT)
        return;

    for (let i = 10; i < char_lu_table.length; i++) {
        const cp = i;

        if (i < 9 || (i > 10 && i < 32) || (i > 126 && i < 160))
            continue;

        const val = char_lu_table[i];

        if (val & 32) { id_start_lu.push(cp); id_cont_lu.push(cp); }
        if (val & 64) { id_cont_lu.push(cp); }

        if ((val & 0x1F) == TokenTypes.NUMBER)
            num_lu.push(cp);

        if ((val & 0x1F) == TokenTypes.SYMBOL)
            sym_lu.push(cp);
    }

    LOOKUPS_BUILT = true;
}

/**
 * Creates a random string that can be produced by the language 
 * defined by the given grammar. 
 * 
 * @param grammar 
 */
export function createFuzz(grammar: GrammarObject): string {
    buildLookups();
    const entry = getEntryProductions(grammar);
    try {
        return fuzzProduction(rs(entry), grammar, false);
    } catch (e) {
        console.error(e);
        return "";
    }
}

function fuzzProductionSym(
    sym: ProductionSymbol | ProductionTokenSymbol,
    g: GrammarObject,
    IS_TOKEN: boolean
): string {

    const production = g.productions[sym.val];

    return fuzzProduction(production, g, IS_TOKEN || Sym_Is_A_Production_Token(sym));
}

function fuzzProduction(
    production: GrammarProduction,
    g: GrammarObject,
    IS_TOKEN: boolean
): string {

    return fuzzBody(rs(production.bodies), g, IS_TOKEN);
}

function fuzzBody(
    body: HCG3ProductionBody,
    g: GrammarObject,
    IS_TOKEN: boolean
): string {
    const str: string[] = [];

    outer: for (const sym of body.sym) {

        if (Sym_Is_A_Token(sym) || Sym_Is_A_Production(sym))

            switch (sym.type) {

                case SymbolType.GENERATED:
                    switch (sym.val) {
                        case "ids": str.push(getCharSequence(id_start_lu, 20, id_cont_lu)); break;
                        case "id": str.push(getCharSequence(id_start_lu)); break;
                        case "nums": str.push(getCharSequence(num_lu, 20)); break;
                        case "num": str.push(getCharSequence(num_lu)); break;
                        case "syms": str.push(getCharSequence(sym_lu, 20)); break;
                        case "sym": str.push(getCharSequence(sym_lu)); break;
                        case "nl": str.push("\n"); break;
                        case "sp": str.push(" "); break;
                        case "DEFAULT": break outer;
                    }
                    break;

                case SymbolType.EXCLUSIVE_LITERAL:
                    str.push(sym.val);
                    break;

                case SymbolType.LITERAL:
                    str.push(sym.val);
                    break;

                case SymbolType.DEFAULT:
                    break outer;

                case SymbolType.PRODUCTION:
                    str.push(fuzzProductionSym(sym,
                        g, IS_TOKEN));
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


function getCharSequence(array: number[], max_length: number = 1, cont_array: number[] = array): string {

    const length = max_length > 1 ? Math.min(max_length, 2 + Math.round(Math.random() * 50)) : 1;

    const id = [getRandomCharFromArray(array)];

    for (let i = 1; i++ < length;) {
        id.push(getRandomCharFromArray(cont_array));
    }

    return id.join("");
}

function getRandomCharFromArray(array: number[]) {
    const len = array.length;
    return String.fromCodePoint(array[Math.round(Math.random() * (len - 1))]);
};

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