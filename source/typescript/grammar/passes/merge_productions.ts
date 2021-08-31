import { copy, traverse } from "@candlelib/conflagrate";
import {
    GrammarObject,
    HCG3Symbol,
    RECURSIVE_STATE
} from "../../types/grammar_nodes";
import {
    addBodyToProduction,
    getProductionByName,
    getRealSymbolCount,
    offsetReduceFunctionSymRefs,
    replaceBodySymbol
} from "../nodes/common.js";
import { getUniqueSymbolName, Sym_Is_A_Production, Sym_Is_A_Production_Token } from "../nodes/symbol.js";
import { render } from "./common.js";

/**
 * Sets the recursion state on all productions in a grammar
 * @param grammar
 * @param error
 */

export function generateProductionRecursionStates(grammar: GrammarObject, error) {
    // Gather all nodes that are reachable 
    const splat = new Map();

    for (const production of grammar.productions) {
        production.RECURSIVE = RECURSIVE_STATE.UNKNOWN;
        const called_names = new Set;
        splat.set(production.name, called_names);

        for (const body of production.bodies) {
            let i = 0;
            for (const sym of body.sym) {
                if (sym.type == "sym-production") {
                    if (i++ == 0 && sym.name == production.name)
                        production.RECURSIVE |= RECURSIVE_STATE.LEFT;

                    else
                        called_names.add(sym.name);
                }
            }
        }
    }

    for (const production of grammar.productions) {
        const data = splat.get(production.name);

        if (data.has(production.name) && !production.RECURSIVE) {
            production.RECURSIVE |= RECURSIVE_STATE.RIGHT;
        } else {
            //Do a system traversal. 
            function batch(root_name, name, splat: Map<string, Set<string>>, lu = new Set) {
                if (splat.get(name).has(root_name))
                    return true;

                for (const n of splat.get(name)) {

                    if (lu.has(n))
                        continue;

                    lu.add(n);

                    if (batch(root_name, n, splat, lu))
                        return true;
                }

                return false;
            }

            const RECURSION = batch(production.name, production.name, splat);

            if (RECURSION)
                production.RECURSIVE |= RECURSIVE_STATE.RIGHT;

        }
    }
}

/**
 * Merges productions into each other
 * @param grammar
 * @param error
 */
export function mergeProductions(grammar: GrammarObject, error) {

    generateProductionRecursionStates(grammar, error);

    for (const production of grammar.productions) {


        for (const body of production.bodies) {

            let tracking = new Map();

            let depth = 0;

            for (const { node, meta: { mutate, index } } of traverse(body, "sym").makeMutable()) {

                if (!tracking.get(index))
                    tracking.set(index, new Set());

                const set = tracking.get(index);

                let sym = <HCG3Symbol><any>node;
                if (sym.type == "sym-production") {

                    if (depth++ > 1) break;
                    const name = sym.name;

                    const ref_prod = getProductionByName(grammar, name);

                    // This process will fail horribly on Productions that are recursive
                    // so we will avoid them?
                    if (ref_prod.RECURSIVE & RECURSIVE_STATE.LEFT)
                        continue;

                    if (ref_prod.RECURSIVE & RECURSIVE_STATE.RIGHT) {
                        let i = 0, CANT_RECURSE = false;
                        for (let i = 0; i <= index; i++) {
                            if (tracking.get(i).has(name)) {
                                CANT_RECURSE = true;
                                break;
                            }
                        }
                        if (CANT_RECURSE)
                            continue;
                    }

                    set.add(name);

                    let HAS_REDUCED_BODY = false;

                    for (const body of ref_prod.bodies) {
                        //Bodies that are left recursive
                        if (body.reduce_function || body.sym[0].name == ref_prod.name) {
                            HAS_REDUCED_BODY = true;
                            break;
                        }
                    }

                    if (!HAS_REDUCED_BODY) {
                        let i = 0;
                        let body_base = copy(body);

                        // Check for any excludes that should
                        // prevent this body from existing

                        for (const cpu_body of ref_prod.bodies) {

                            let ALLOW_INCLUSION = true;

                            const active_symbol = cpu_body.sym[0];

                            if (!Sym_Is_A_Production(active_symbol)) {

                                for (let i = 0; i <= index; i++) {
                                    const excludes = body.excludes[i];
                                    if (excludes) {
                                        for (let j = 0; j < excludes.length; j++) {
                                            const block = excludes[j];
                                            const x = index - i;
                                            const sym = block[x];

                                            if (sym && getUniqueSymbolName(sym) == getUniqueSymbolName(active_symbol)) {

                                                let i = 1;
                                                for (; i < cpu_body.sym.length && x + i < block.length; i++) {
                                                    const n_sym = cpu_body.sym[i];
                                                    const o_sym = block[x + i];

                                                    if (!Sym_Is_A_Production(n_sym)) {
                                                        if (getUniqueSymbolName(n_sym) != getUniqueSymbolName(o_sym))
                                                            break;
                                                    } else {
                                                        break;
                                                    }

                                                }

                                                if (i + x >= block.length) {
                                                    ALLOW_INCLUSION = false;
                                                } else {
                                                    // Create new exclusion sliced to the block length
                                                    // and positioned at the current index.
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            if (i++ > 0) {
                                const new_body = copy(body_base);

                                replaceBodySymbol(new_body, index, ...cpu_body.sym);

                                if (ALLOW_INCLUSION)
                                    addBodyToProduction(production, new_body);
                            } else {

                                offsetReduceFunctionSymRefs(body, index, getRealSymbolCount(cpu_body.sym) - 1);

                                mutate(cpu_body.sym, true);
                            }
                        }
                    }
                }
            }
        }
    }

    throw new Error("done");
}
