import { FIRST } from "./first.js";
import { Grammar, SymbolType, EOF_SYM } from "../types/grammar.js";
import { AssertionFunctionSymbol, Symbol, TokenSymbol } from "../types/Symbol";
import { getAssertionSymbolFirst, isSymAnAssertFunction } from "../hybrid/utilities/utilities.js";

//@ts-nocheck
export const EMPTY_PRODUCTION = "{!--EMPTY_PRODUCTION--!}";

export const isNonTerm = (f: Symbol) => f.type == "production";

const merge = (to: Map<string, Symbol>, from: (Map<string, Symbol> | Symbol[])) => {
    from.forEach((v, k) => {
        if (v.type !== SymbolType.EMPTY)
            to.set(v.val, v);
    });
};
/**
 * A Memoized function that collects all terminal symbols following the productions in a grammar
 * and sets the production's follow property to a map of these Symbols keyed by the symbol's
 * value.
 * @param grammar A grammar
 * @param production Index of a production within the grammar. 
 * 
 * Returns the follow map for the given production. 
 */
export function FOLLOW(grammar: Grammar, production: number): Map<string, TokenSymbol> {

    const
        prod = grammar[production],
        table: Map<string, Symbol>[] = [],
        follow_combinations: number[][] = grammar.map(_ => []),
        excludes: Map<string, Symbol>[] = [];

    if (prod.follow) return grammar[production].follow;

    for (let i = 0; i < grammar.length; i++) {
        grammar[i].follow = new Map();
        table.push(grammar[i].follow);
        excludes.push(new Map);
    }

    table[0].set("$eof", EOF_SYM); //End of Line

    for (const production of grammar) {

        for (const sym of production?.reduce?.values() ?? []) {
            production.follow.set(sym.val, sym);
        }

        for (const body of production.bodies) {

            for (let i = 0; i < body.length; i++) {

                const sym = body.sym[i];

                if (isNonTerm(sym)) {

                    const child_production_index = sym.val;

                    const child_follow = table[child_production_index];

                    for (var j = i + 1; j < body.length; j++) {

                        const sym = body.sym[j];

                        if (isNonTerm(sym)) {
                            const syms = FIRST(grammar, sym);
                            merge(child_follow, syms);

                            if (syms.some(s => s.type == SymbolType.EMPTY))
                                continue;
                        } else {
                            if (sym.type != SymbolType.EMPTY)
                                if (isSymAnAssertFunction(sym)) {
                                    for (const s of getAssertionSymbolFirst(<AssertionFunctionSymbol>sym, grammar))
                                        child_follow.set(s.val, s);
                                } else
                                    child_follow.set(sym.val, sym);
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

            for (let i = body.length - 1; i >= 0; i--) {

                const sym = body.sym[i];

                if (isNonTerm(sym)) {

                    const child_production_index: number = <number>sym.val;

                    if (child_production_index !== production_index) {
                        follow_combinations[production_index].push(child_production_index, ...follow_combinations[child_production_index]);
                        //merge(table[child_production_index], table[production_index]);
                    }

                    if (FIRST(grammar, sym).some(s => s.type == SymbolType.EMPTY))
                        continue;
                }

                break;
            }
        }
    }

    for (let i = 0; i < grammar.length; i++) {
        for (const child_production_index of new Set(follow_combinations[i])) {
            merge(table[child_production_index], table[i]);
        }
    }

    return prod.follow;
}