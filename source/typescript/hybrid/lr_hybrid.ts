import { Grammar, Production, EOF_SYM, SymbolType } from "../types/grammar.js";
import { processClosure, Item, FOLLOW } from "../util/common.js";
import { State } from "./types/State";
import { Symbol } from "../../../build/types/types/grammar.js";

export interface States {
    states: State[];
    map: Map<string, State>;
}

//Integrates a LR state into existing set of states
export function IntegrateState(production: Production, grammar: Grammar, name: string = undefined) {

    const items = [...FOLLOW(grammar, production.id).values(), { type: SymbolType.GENERATED, val: "$eof" }].flatMap(sym => grammar[production.id].bodies.map(
        b => new Item(
            b.id,
            b.length,
            0,
            sym
        )));

    const id = items
        .map(i => i.id)
        .setFilter(i => i)
        .sort((a, b) => a < b ? -1 : 1).join(""),

        sid = items
            .map(i => i.full_id)
            .filter((e, i, a) => a.indexOf(e) == i)
            .sort((a, b) => a < b ? -1 : 1).join(":");

    //Out pops a new state. 
    const start_state = <State>{
        sym: "",
        name,
        id,
        sid,
        bid: "",
        roots: [],
        items: items.slice(),
        index: 0,
        REACHABLE: false,
    };

    const potential_states = CompileHybridLRStates(grammar, { old_state: 0, items });

    return { start_state, potential_states };
}

export function CompileHybridLRStates(
    grammar: Grammar,
    item_set: { old_state: number; items: Item[]; },
): State[] {

    const
        old_state = item_set.old_state,
        to_process_items = item_set.items;

    processClosure(to_process_items, grammar);

    const groups = <Map<string, Map<string | number, { sym: Symbol, items: Item[]; }>>>new Map();

    for (const i of to_process_items) {

        if (i.atEND) continue;

        const
            sym = i.sym(grammar),
            val = sym.val + "";

        if (sym.type == SymbolType.EMPTY || i.len == 0) continue;

        if (!groups.has(val)) groups.set(val, { sym: sym, items: [] });

        const group = groups.get(val);

        group.items.push(i.increment());
    }

    const potential_states = [];

    for (const { sym, items } of groups.values()) {

        const unique_items = items.setFilter(i => i.id);

        const id = unique_items
            .map(i => i.id)
            .sort((a, b) => a < b ? -1 : 1).join(";"),

            sid = "";

        //Out pops a new state. 
        potential_states.push(<State>{
            sym: sym.val,
            id,
            sid,
            bid: unique_items.map(i => i.renderUnformattedWithProduction(grammar)).join(" :\n "),
            roots: [],
            items,
            index: 0,
            REACHABLE: false
        });
    }

    return potential_states.flat().map(s => (s.os = old_state, s));
}


export function mergeState(
    state: State,
    states: Map<string, State>,
    old_state: State,
    unprocessed_state_items: { old_state: number; items: Item[]; }[]
) {

    const { id, sym, items } = state;

    let active_state = states.get(id);

    if (!states.has(id)) {
        state.index = states.size;

        states.set(id, state);

        state.state_merge_tracking = new Set;
        state.maps = new Map;
        state.reachable = new Set;
        state.items = [];

        active_state = state;
    }

    if (old_state) {
        if (!old_state.maps.has(sym))
            old_state.maps.set(sym, []);

        const transition_map = old_state.maps.get(sym);

        if (transition_map.indexOf(active_state.index) < 0)
            transition_map.push(active_state.index);
    }

    if (state.name && !active_state.name) {
        state.name = active_state.name;
    }

    const out_items = [];

    for (const i of items) {
        if (!active_state.state_merge_tracking.has(i.full_id)) {
            active_state.state_merge_tracking.add(i.full_id);
            active_state.items.push(i);
            out_items.push(i);
        }
    }

    if (out_items.length > 0)
        unprocessed_state_items.push({ old_state: state.index, items: out_items });

    return active_state;
}
