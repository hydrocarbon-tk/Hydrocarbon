import { FIRST } from "./first.js";
import { Grammar, SymbolType, EOF_SYM } from "../types/grammar.js";
import { Symbol } from "../types/Symbol";

//@ts-nocheck
export const EMPTY_PRODUCTION = "{!--EMPTY_PRODUCTION--!}";

export const isNonTerm = (f: Symbol) => f.type == "production";

const merge = (follow, first) => {
    first.forEach((v) => {
        if (v !== EMPTY_PRODUCTION)
            follow.set(v.val, v);
    });
};

export function FOLLOW(grammar: Grammar, production: number, IGNORE_SELF_RECURSION = false): Map<string, Symbol> {

    const
        prod = grammar[production],
        table: Map<string, Symbol>[] = [],
        excludes: Map<string, Symbol>[] = [];

    if (prod.follow) return grammar[production].follow;

    for (let i = 0; i < grammar.length; i++) {
        grammar[i].follow = new Map();
        table.push(grammar[i].follow);
        excludes.push(new Map);
    }

    table[0].set("$eof", EOF_SYM); //End of Line

    for (let i = 0; i < grammar.length; i++) {

        const production = grammar[i];

        for (let i = 0; i < production.bodies.length; i++) {

            const body = production.bodies[i];

            for (let i = 0; i < body.length; i++) {

                const sym = body.sym[i];

                if (isNonTerm(sym)) {

                    const ADD_TO_EXCLUDES = (!IGNORE_SELF_RECURSION && sym.val == production.id);

                    const follow = table[sym.val];
                    const exclude = excludes[sym.val];

                    for (var j = i + 1; j < body.length; j++) {

                        const sym = body.sym[j];

                        if (isNonTerm(sym)) {
                            const syms = FIRST(grammar, sym);

                            merge((ADD_TO_EXCLUDES ? exclude : follow), syms);

                            if (new Set(syms).has(EMPTY_PRODUCTION))
                                continue;
                        } else {
                            if (sym.type != SymbolType.EMPTY)
                                (ADD_TO_EXCLUDES ? exclude : follow).set(sym.val, sym);
                        }
                        break;
                    }

                }
            }
        }
    }

    //Clear off excluded values.
    for (let i = 0; i < grammar.length; i++)
        for (const key of excludes[i].keys())
            table[i].delete(key);



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