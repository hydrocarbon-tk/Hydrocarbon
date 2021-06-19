import { copy, traverse } from "@candlelib/conflagrate";
import {
    HCG3Grammar,
    HCG3Symbol,
    RECURSIVE_STATE
} from "../../types/grammar_nodes";
import {
    addBodyToProduction,
    getProductionByName,
    offsetReduceFunctionSymRefs,
    replaceBodySymbol
} from "../nodes/common.js";

/**
 * Sets the recursion state on all productions in a grammar
 * @param grammar
 * @param error
 */

export function generateProductionRecursionStates(grammar: HCG3Grammar, error) {
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
export function mergeProductions(grammar: HCG3Grammar, error) {

    generateProductionRecursionStates(grammar, error);

    for (const production of grammar.productions) {


        for (const body of production.bodies) {

            let tracking = new Map();

            for (const { node, meta: { mutate, index } } of traverse(body, "sym").makeMutable()) {

                if (!tracking.get(index))
                    tracking.set(index, new Set());

                const set = tracking.get(index);

                let sym = <HCG3Symbol><any>node;
                if (sym.type == "sym-production") {
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
                        for (const cpu_body of ref_prod.bodies) {
                            if (i++ > 0) {
                                const new_body = copy(body_base);

                                replaceBodySymbol(new_body, index, ...cpu_body.sym);

                                addBodyToProduction(production, new_body);
                            } else {

                                offsetReduceFunctionSymRefs(body, index, cpu_body.sym.length - 1);

                                mutate(cpu_body.sym, true);
                            }
                        }
                    }
                }
            }
        }
    }
}
