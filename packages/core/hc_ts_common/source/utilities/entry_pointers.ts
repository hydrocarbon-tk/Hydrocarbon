import { GrammarObject, GrammarProduction } from '../types/';

export function getEntryPointers(grammar: GrammarObject, state_name_to_pointer: Map<string, number>) {

    //Map states to pointer

    return getEntryProductions(grammar)
        .map(p => ({
            production: p,
            name: p.entry_name ?? p.name[0].toUpperCase() + p.name.slice(1),
            pointer: state_name_to_pointer.get(p.entry_name + "_open") ?? 0
        }));
}

export function getEntryProductions(grammar: GrammarObject): GrammarProduction[] {
    return grammar.productions.filter(p => p.IS_ENTRY);
}

