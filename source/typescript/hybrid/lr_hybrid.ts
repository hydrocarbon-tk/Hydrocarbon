import { Grammar, Production, EOF_SYM, SymbolType } from "../types/grammar.js";
import { Symbol } from "../types/Symbol.js";
import { processClosure, Item, FOLLOW } from "../util/common.js";
import { LRState } from "./types/State";
import { getUniqueSymbolName } from "./utilities/utilities.js";

export interface States {
    states: LRState[];
    map: Map<string, LRState>;
}

//Integrates a LR state into existing set of states
export function IntegrateState(production: Production, grammar: Grammar, name: string = undefined) {

    const
        items =
            [
                ...FOLLOW(grammar, production.id, true).values(),
                EOF_SYM
            ].flatMap(sym => grammar[production.id].bodies.map(
                b => new Item(
                    b.id,
                    b.length,
                    0,
                    sym
                ))),


        id = items
            .map(i => i.id)
            .setFilter(i => i)
            .sort((a, b) => a < b ? -1 : 1).join(""),

        sid = items
            .map(i => i.full_id)
            .filter((e, i, a) => a.indexOf(e) == i)
            .sort((a, b) => a < b ? -1 : 1).join(":"),

        start_state = <LRState>{
            sym: "",
            name,
            prod_id: production.id,
            id,
            sid,
            bid: "",
            roots: [],
            items: items.slice(),
            follow_symbols: new Set,
            shift_symbols: new Set,
            index: -1,
            REACHABLE: false,
        },

        potential_states = CompileHybridLRStates(grammar, { old_state: -1, items });

    return { start_state, potential_states };
}

export function CompileHybridLRStates(
    grammar: Grammar,
    item_set: { old_state: number; items: Item[]; },
): LRState[] {

    const
        old_state = item_set.old_state,
        to_process_items = item_set.items;

    const yields = to_process_items.slice();

    processClosure(to_process_items, grammar);

    const groups = <Map<string, { sym: Symbol, items: Item[]; }>>new Map();

    for (const i of to_process_items) {

        if (i.atEND) continue;

        const
            sym = i.sym(grammar),
            val = sym.val + "";

        if (sym.type == SymbolType.EMPTY || i.len == 0) continue;

        if (!groups.has(val)) groups.set(val, { sym, items: <Item[]>[] });

        const group = groups.get(val);

        group.items.push(i.increment());
    }

    const potential_states: LRState[] = [];

    for (const { sym, items } of groups.values()) {

        const unique_items = items.setFilter(i => i.id);

        const id = unique_items
            .map(i => i.id)
            .sort((a, b) => a < b ? -1 : 1).join(";"),

            sid = "";

        //Out pops a new state. 
        potential_states.push(<LRState>{
            sym: sym.type == SymbolType.PRODUCTION ? sym.val : getUniqueSymbolName(sym),
            id,
            yields,
            sid,
            bid: unique_items.map(i => i.renderUnformattedWithProduction(grammar)).join(" :\n "),
            roots: [],
            items,
            follow_symbols: new Set,
            shift_symbols: new Set,
            index: -1,
            old_state_index: old_state,
            REACHABLE: false
        });
    }

    return potential_states.flat();
}


export function mergeState(
    state: LRState,
    states: Map<string, LRState>,
    old_state: LRState,
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
    if (state.name && !active_state.name) {
        state.name = active_state.name;
    }

    //-----------------------------------

    if (old_state) {

        if (!old_state.maps.has(sym))
            old_state.maps.set(sym, []);

        if (typeof sym == "string")
            old_state.shift_symbols.add(sym);

        const transition_map = old_state.maps.get(sym);

        if (transition_map.indexOf(active_state.index) < 0)
            transition_map.push(active_state.index);
    }


    const out_items = [];


    for (const i of items) {
        if (!active_state.state_merge_tracking.has(i.full_id)) {
            active_state.state_merge_tracking.add(i.full_id);
            active_state.items.push(i);
            // if (i.atEND)
            active_state.follow_symbols.add(getUniqueSymbolName(i.follow));
            out_items.push(i);
        }
    }

    if (out_items.length > 0)
        unprocessed_state_items.push({ old_state: active_state.index, items: out_items });

    return active_state;
}
