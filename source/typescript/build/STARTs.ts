/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import {
    Sym_Is_A_Production,
    Sym_Is_A_Token
} from "../grammar/nodes/symbol.js";
import { GrammarObject, GrammarProduction } from '../types/grammar_nodes';
import { getClosure } from "../utilities/closure.js";
import { Item } from "../utilities/item.js";
import { getProductionClosure } from '../utilities/production.js';
import { getStartItemsFromProduction } from "./get_start_items_from_production.js";
import { GlobalState, OutOfScopeItemState } from './magic_numbers.js';


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
                &&
                (true ||
                    lr_items.get(id).some(i => i.increment().atEND)
                    ||
                    lr_items.get(id).group(i => i.getProductionID(grammar)).length > 1
                )

            ) {

                if (items.length == 0)
                    continue;

                // This is responsible for generating items that 
                // provide FOLLOW information. 

                const seen = new Set([]);

                /**
                 * Mark items with depth (state) 9999 as "in scope" and items
                 * with states that match `OutOfScopeItemState` as "out of scope".
                 * Out of scope items are only used to determine if a production
                 * should be reduced to another production or left as is.
                 */
                items = [
                    ...items.map(i => i.copy(undefined, undefined, undefined, 9999)),
                    ...grammar.lr_items.get(production.id)
                        .flatMap(s => getOuterScopeGotoItems(grammar, seen, s))
                        //Prevent self intersection
                        .filter(i => i.getProductionID(grammar) != id)
                        .map(i => i.copy(undefined, undefined, undefined, OutOfScopeItemState))
                        .filter(i => !i.increment().atEND || !ACTIVE_IDS.has(i.getProductionID(grammar)))
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

    return getStartsFromItems(initial_candidates, new Set([production.id]), grammar,);
}

export function getStartsFromItems(
    initial_candidates: Item[],
    root_productions: Set<number>,
    grammar: GrammarObject
) {


    let START_set = [];


    let descend_candidates = initial_candidates.slice();

    const seen_candidates = new Set(root_productions);
    while (descend_candidates.length > 0) {

        const START_set_candidates = START_set.slice();

        for (const descend_candidate of descend_candidates)
            extractSTARTCandidates(root_productions, descend_candidate, START_set_candidates, grammar);

        descend_candidates.length = 0;

        START_set = START_set_candidates
            .filter(i => Sym_Is_A_Token(i.sym(grammar)));

        const conflict_items = START_set_candidates
            .setFilter(i => i.id);

        //Remove mutual conflicts
        const conflicts = conflict_items.group(i => {
            const closure = getClosure([i], grammar);
            return closure.map(i => i.id);
        });

        let seen = new Set();
        for (const mutual_conflict of conflicts.sort((a, b) => b.length - a.length)) {

            const candidate_production_items = mutual_conflict
                .filter(i => Sym_Is_A_Production(i.sym(grammar)));

            if (
                mutual_conflict.length == 1
                ||
                candidate_production_items.group(i => i.getProductionAtSymbol(grammar).id).length == 1
            ) {
                START_set.push(...candidate_production_items.filter(i => !seen.has(i.id)));
            } else {

                //Add the production to descend_candidates

                for (const production of candidate_production_items
                    .map(i => i.getProductionAtSymbol(grammar))) {
                    if (!seen_candidates.has(production.id)) {

                        descend_candidates.push(...getStartItemsFromProduction(production));

                        seen_candidates.add(production.id);
                    }
                }
            }

            for (const id of mutual_conflict.map(i => i.id))
                seen.add(id);
        }

        START_set = START_set.setFilter(i => i.id);

        // seen_candidates.clear();
    }


    const filtered_START = START_set.setFilter(i => i.id);

    return filtered_START;
}
function extractSTARTCandidates(
    root_productions: Set<number>,
    candidate_item: Item,
    START_candidate_set: Item[],
    grammar: GrammarObject,
    check_items: Set<string> = new Set
) {
    // Check for recursion with root candidate. If 
    // known is found than the candidate is available
    // for use with the original grammar. 
    const closure = getClosure([candidate_item], grammar);
    if (closure.some(i => root_productions.has((i.getProductionAtSymbol(grammar)?.id ?? -1)))
        ||
        closure.every(i => Sym_Is_A_Production(i.sym(grammar)))
        ||
        closure.some(i => grammar.item_map.get(i.id).excludes.length > 0)
    ) {

        const production_candidate = grammar.productions[candidate_item.getProductionAtSymbol(grammar).id];

        const initial_candidates = getStartItemsFromProduction(production_candidate);

        START_candidate_set.push(
            ...initial_candidates.filter(i => !Sym_Is_A_Production(i.sym(grammar)))
        );

        const descend_candidates = initial_candidates.filter(
            i => Sym_Is_A_Production(i.sym(grammar))
                && !root_productions.has(i.getProductionID(grammar))
                && !check_items.has(i.id)
        );

        for (const descend_candidate of descend_candidates) {
            check_items.add(descend_candidate.id);
            extractSTARTCandidates(
                root_productions,
                descend_candidate,
                START_candidate_set,
                grammar,
                check_items
            );
        }

    } else {
        START_candidate_set.push(candidate_item);
    }
}


export function isRecursive(
    root_production: number,
    candidate_items: Item[],
    grammar: GrammarObject
) {
    return getClosure(candidate_items, grammar).map(i => i.getProductionAtSymbol(grammar)?.id ?? -1).includes(root_production);
}

