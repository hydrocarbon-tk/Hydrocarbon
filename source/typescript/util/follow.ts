import { FIRST } from "./first.js";
import { Grammar, Symbol, SymbolType, EOF_SYM } from "../types/grammar.js";

//@ts-nocheck
export const EMPTY_PRODUCTION = "{!--EMPTY_PRODUCTION--!}";

export const isNonTerm = (f: Symbol) => f.type == "production";

const merge = (follow, first) => {
    first.forEach((v) => {
        if (v !== EMPTY_PRODUCTION)
            follow.set(v.val, v);
    });
};

export function FOLLOW(grammar: Grammar, production: number) {

    const
        prod = grammar[production],
        table = [];

    if (prod.follow) return grammar[production].follow;

    for (let i = 0; i < grammar.length; i++) {
        grammar[i].follow = new Map();
        table.push(grammar[i].follow);
    }

    table[0].set("$eof", EOF_SYM); //End of Line

    for (let i = 0; i < grammar.length; i++) {

        const production = grammar[i];

        for (let i = 0; i < production.bodies.length; i++) {

            const body = production.bodies[i];

            for (let i = 0; i < body.length; i++) {

                const val = body.sym[i];

                if (isNonTerm(val)) {

                    const follow = table[val.val];

                    for (var j = i + 1; j < body.length; j++) {

                        const sym = body.sym[j];

                        if (isNonTerm(sym)) {

                            merge(follow, FIRST(grammar, sym));

                            if (new Set(FIRST(grammar, sym)).has(EMPTY_PRODUCTION))
                                continue;
                        } else {
                            if (sym.type != SymbolType.EMPTY)
                                follow.set(sym.val, sym);
                        }
                        break;
                    }

                }
            }
        }
    }

    for (let production_index = 0; production_index < grammar.length; production_index++) {

        const production = grammar[production_index];

        for (let i = 0; i < production.bodies.length; i++) {

            const body = production.bodies[i];

            for (let i = body.length; i > 0; i--) {

                const sym = body.sym[i - 1];

                if (isNonTerm(sym)) {

                    if (sym.val !== production_index)
                        merge(table[sym.val], table[production_index]);

                    if (new Set(FIRST(grammar, sym)).has(EMPTY_PRODUCTION))
                        continue;
                }

                break;
            }
        }
    }

    return prod.follow;
}