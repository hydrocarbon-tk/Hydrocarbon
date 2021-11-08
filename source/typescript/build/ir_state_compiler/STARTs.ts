/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import {
    Sym_Is_A_Production
} from "../../grammar/nodes/symbol.js";
import { GrammarObject, GrammarProduction } from '../../types/index.js';;
import { getClosure } from "../../utilities/closure.js";
import { Item } from "../../utilities/item.js";
import { getProductionClosure } from '../../utilities/production.js';
import { getStartItemsFromProduction } from "./get_start_items_from_production.js";
import { InScopeItemState, OutOfScopeItemState } from '../../utilities/magic_numbers.js';


export function getGotoSTARTs(
    production: GrammarProduction,
    seed_items: Item[],
    grammar: GrammarObject
): Map<number, Item[]> {

    const lr_items = getProductionClosure(production.id, grammar).filter(i => i.offset == 0
        &&
        !i.atEND
        &&
        Sym_Is_A_Production(i.sym(grammar))
    ).groupMap(i => i.getProductionAtSymbol(grammar).id);
    const batch = seed_items.map(i => i.getProductionID(grammar)).setFilter();

    const output: Map<number, Item[]> = new Map();

    for (const id of batch) {

        if (!output.has(id) && lr_items.has(id)) {

            let items = lr_items.get(id);

            const ACTIVE_IDS = new Set(items.filter(i => i.increment().atEND).map(i => i.getProductionID(grammar)));

            if (
                id == production.id
            ) {

                if (items.length == 0)
                    continue;

                // This is responsible for generating items that 
                // provide FOLLOW information. 

                const seen = new Set([]);

                /**
                 * Mark items with state [InScopeItemState] as "in scope" and items
                 * with states that match `OutOfScopeItemState` as "out of scope".
                 * Out of scope items are only used to determine if a production
                 * should be reduced to another production or left as is.
                 */
                items = [
                    ...items.map(i => i.toState(InScopeItemState)),
                    ...(
                        (
                            grammar.lr_items.get(id)
                                ?.flatMap(s => getOuterScopeGotoItems(grammar, seen, s))
                                //Prevent self intersection
                                .filter(i => (i.getProductionID(grammar) != id) || i.offset != 0)
                                .map(i => i.toState(OutOfScopeItemState))
                                .filter(i => !i.increment().atEND || !ACTIVE_IDS.has(i.getProductionID(grammar)))
                        ) ?? []
                    )
                ].setFilter(i => i.id);


            }

            output.set(id, items);
            batch.push(...items.map(i => i.getProductionID(grammar)));
        }
    }

    return output;
}

function getOuterScopeGotoItems(grammar: GrammarObject, seen: Set<number>, i: Item, out: Item[] = []) {

    out.push(i);

    const id = i.getProductionAtSymbol(grammar).id;

    if (!seen.has(id) && i.increment().atEND) {

        let id = i.getProductionAtSymbol(grammar).id;

        seen.add(id);

        out.push(...(grammar.lr_items.get(id) ?? []).flatMap(s => getOuterScopeGotoItems(grammar, seen, s)));
    }

    return out;
}

export function getSTARTs(production: GrammarProduction, grammar: GrammarObject) {
    const initial_candidates = getStartItemsFromProduction(production);

    return getStartsFromItems(production.id, initial_candidates, grammar,);
}
export function getStartsFromItems(
    root_production: number,
    initial_candidates: Item[],
    grammar: GrammarObject
) {
    let START_set = [];

    return extractSTARTCandidates2(root_production, initial_candidates, START_set, grammar);
}

function extractSTARTCandidates2(
    root_production: number,
    initial_candidates: Item[],
    START_candidate_set: Item[],
    grammar: GrammarObject,
) {
    // Check for recursion with root candidate. If 
    // known is found than the candidate is available
    // for use with the original grammar. 
    const closure = getClosure(initial_candidates, grammar);


    // Separate into groups comprised of productions
    const production_groups = closure.groupMap(i => i.getProductionID(grammar));

    // Get production_items 
    const production_items = closure.filter(i => Sym_Is_A_Production(i.sym(grammar)));

    // Create reverse lookups
    let reverse_lookups: [number, number][] = <any>production_items
        .map(i => [i.getProductionAtSymbol(grammar).id, i.getProduction(grammar).id])
        .setFilter(i => i.join(":"))
        .sort((a, b) => a[0] - b[0]);

    reverse_lookups.push([root_production, root_production]);

    //Remove top-down recursion conflicts
    //reverse_lookups = reverse_lookups.filter(a => !reverse_lookups.some(b => a[0] == b[1] && a[1] < b[1]));

    // Find conflicting reductions, these productions will be invalid for use in LL style 
    // parsing. Remove direct left recursion first.
    const conflict_groups = reverse_lookups
        //.filter(a => a[0] != a[1])
        .group(a => a[0]).filter(i => i.length > 1);

    //Add invalid productions to no fly set
    const no_fly = new Set(conflict_groups.flatMap(i => i.map(i => i[1]).filter(i => i >= 0)));
    const no_fly_list = [...no_fly.values()];

    //For every invalid production add its caller to the list
    for (const p of no_fly_list) {
        for (const [callee, caller] of reverse_lookups) {
            if (p == callee && !no_fly.has(caller) && caller >= 0) {
                no_fly_list.push(caller);
                no_fly.add(caller);
            }
        }
    }

    //From the no fly list add their terminal symbols
    for (const p of no_fly) {
        START_candidate_set.push(...production_groups.get(p).filter(i => !Sym_Is_A_Production(i.sym(grammar))));
    }
    const canfly = new Set([...production_groups.keys()].filter(p => !no_fly.has(p)));

    // For canfly, reduce to top level caller production that is not
    // in the no_fly_list

    const fly_list: Set<number> = new Set();

    for (const p of canfly) {
        let top_prod = p;
        let seen = new Set();

        while (!no_fly.has(top_prod)) {
            const ps = reverse_lookups.filter(i => i[0] == top_prod);

            if (ps.length < 1 || ps.length > 1 || no_fly.has(ps[0][1]))
                break;

            top_prod = ps[0][1];

            if (seen.has(top_prod))
                break;

            seen.add(top_prod);
        }

        fly_list.add(top_prod);
    }

    //For every other production, add their callers to the START_candidate_set. 
    for (const p of fly_list) {
        const starts =
            closure.filter(
                i =>
                    Sym_Is_A_Production(i.sym(grammar))
                    &&
                    i.getProductionAtSymbol(grammar).id == p
            ).filter(i => i.getProductionID(grammar) != p);

        if (starts.length > 0) {
            START_candidate_set.push(...starts);
        } else {
            START_candidate_set.push(
                ...production_groups.get(p).filter(i => i.getProductionAtSymbol(grammar)?.id != p));
        }
    }

    return START_candidate_set.setFilter(i => i.id);
}

export function isRecursive(
    root_production: number,
    candidate_items: Item[],
    grammar: GrammarObject
) {
    return getClosure(candidate_items, grammar).map(i => i.getProductionAtSymbol(grammar)?.id ?? -1).includes(root_production);
}

