/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Sym_Is_Defined, Sym_Is_Defined_Symbol } from "../grammar/nodes/symbol.js";
import { HCG3Grammar } from "../types/grammar_nodes.js";
import { DefinedSymbol } from "../types/symbol";


/************ Grammar Production Functions *****************************/

/**
 * Niave implementation ATM
 * @param grammar 
 */
export function createSequenceData(grammar: HCG3Grammar, rounds = 2): string {

    const symbols = [...grammar.meta.all_symbols.values()].filter(Sym_Is_Defined);

    let sequence = "";

    let left_overs = [...symbols];

    while (rounds-- > 0) {

        const groups = left_overs
            .sort((a, b) => (20 * +Sym_Is_Defined_Symbol(b)) - (20 * +Sym_Is_Defined_Symbol(a)))
            .group(s => s.val[0]);

        left_overs.length = 0;

        for (const syms of groups) {

            const longest = syms.sort((a, b) => b.val.length - a.val.length)[0];

            sequence = packSymbol(sequence, longest);

            let offset = longest.byte_offset;

            for (const sym of syms) {
                if (longest == sym) continue;
                let index = 0;
                if ((index = longest.val.indexOf(sym.val)) >= 0) {
                    sym.byte_length = sym.val.length;
                    sym.byte_offset = offset + index;
                } else {
                    left_overs.push(sym);
                }
            }
        }
    }

    for (const sym of left_overs)
        sequence = packSymbol(sequence, sym);

    return sequence;
}

function packSymbol(sequence: string, sym: DefinedSymbol) {
    let index = 0;
    if ((index = sequence.indexOf(sym.val)) >= 0) {
        sym.byte_offset = index;
        sym.byte_length = sym.val.length;
    } else if (sequence[sequence.length - 1] == sym.val[0]) {
        sym.byte_offset = sequence.length - 1;
        sym.byte_length = sym.val.length;
        sequence += sym.val.slice(1);
    } else {
        sym.byte_offset = sequence.length;
        sym.byte_length = sym.val.length;
        sequence += sym.val;
    }
    return sequence;
}