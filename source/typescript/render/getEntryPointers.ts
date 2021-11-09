import { GrammarObject } from '../types/grammar_nodes.js';
import { StateMap } from '../types/ir_state_data.js';

export function getEntryPointers(grammar: GrammarObject, states_map: StateMap) {
    return grammar.productions.filter(p => p.IS_ENTRY)
        .map(p => ({
            production: p,
            name: p.entry_name ?? p.name[0].toUpperCase() + p.name.slice(1),
            pointer: states_map.get(p.entry_name + "_open")?.pointer ?? 0
        }));
}
