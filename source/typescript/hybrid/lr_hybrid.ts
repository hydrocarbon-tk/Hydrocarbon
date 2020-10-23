import { Grammar, Production, EOF_SYM } from "../types/grammar.js";
import { processClosure, Item, FOLLOW } from "../util/common.js";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment";
import { State } from "./State";
import { Symbol } from "../../../build/types/types/grammar.js";
export interface States {
    states: State[];
    map: Map<string, State>;
}



//Integrates a LR state into existing set of states
export function IntegrateState(production: Production, grammar: Grammar, name: string = undefined) {


    const items = createProductionItems(production.id, grammar, [...FOLLOW(grammar, production.id).values()]);

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
        bid: "", //items.setFilter(i => i.id).map(i => i.renderUnformattedWithProduction(grammar)).join(" : "),
        roots: [],
        items: items.slice(),
        state_merge_tracking: new Set,
        index: 0,
        maps: new Map,
        reachable: new Set,
        REACHABLE: true,
    };

    const potential_states = CompileHybridLRStates(grammar, { old_state: 0, items });

    return { start_state, potential_states };
}

export function CompileHybridLRStates(
    grammar: Grammar,
    item_set: { old_state: number; items: Item[]; },
): State[] {

    const old_state = item_set.old_state;
    const to_process_items = item_set.items;

    processClosure(to_process_items, grammar);

    const potential_states = [
        ...to_process_items.reduce((groups, i) => {

            if (i.atEND) return groups;

            const
                production = i.getProduction(grammar).id,
                sym = i.sym(grammar),
                val = sym.val + "";

            if (!groups.has(val)) groups.set(val, new Map);

            const group = groups.get(val);

            if (!group.has(production)) {
                group.set(production, { sym: i.sym(grammar), items: [i.increment()] });
            } else {
                group.get(production).items.push(i.increment());
            }

            return groups;

        }, <Map<string, { sym: string, items: Item[]; }>>new Map()).values()
    ].flatMap(values => processStateItems(values, grammar));

    return potential_states.map(s => (s.os = old_state, s));
}

export function createProductionItems(production_index: number, grammar: Grammar, follows: Symbol[] = [EOF_SYM]) {
    return follows.flatMap(sym => grammar[production_index].bodies.map(
        b => new Item(
            b.id,
            b.length,
            0,
            sym
        )));
}

export function processStateItems(item_set: { sym: string; items: Item[]; }[], grammar): State[] {

    const out = [];

    for (const iset of item_set.values()) {
        const id = iset.items
            .map(i => i.id)
            .setFilter(i => i)
            .sort((a, b) => a < b ? -1 : 1).join(""),

            sid = iset.items
                .map(i => i.full_id)
                .filter((e, i, a) => a.indexOf(e) == i)
                .sort((a, b) => a < b ? -1 : 1).join(":");

        //Out pops a new state. 
        out.push(<State>{
            sym: iset.sym.val,
            id,
            sid,
            bid: iset.items.setFilter(i => i.id).map(i => i.renderUnformattedWithProduction(grammar)).join(" : "),
            roots: [],
            items: iset.items,
            state_merge_tracking: new Set,
            index: 0,
            maps: new Map,
            reachable: new Set,
            REACHABLE: false,
        });
    }

    return out;
}

export function mergeState(
    state: State,
    states: Map<string, State>,
    old_state: State,
    unprocessed_state_items: { old_state: number; items: Item[]; }[]
) {

    const { id, sid, sym } = state;

    if (!states.has(id)) {
        state.index = states.size;
        states.set(id, state);
    }

    const active_state = states.get(id);

    if (state.name && !active_state.name) {
        state.name = active_state.name;
        active_state.REACHABLE = true;
    }

    if (old_state) {
        if (!old_state.maps.has(sym))
            old_state.maps.set(sym, []);

        const transition_map = old_state.maps.get(sym);
        if (transition_map.indexOf(active_state.index) < 0)
            transition_map.push(active_state.index);
    }

    states.set(id, active_state);

    if (!active_state.state_merge_tracking.has(sid)) {
        unprocessed_state_items.push({ old_state: state.index, items: state.items });
        active_state.state_merge_tracking.add(sid);
    }

    active_state.items.push(...state.items);

    const filter_set = new Set();
    
    active_state.items = active_state.items.setFilter(i => i.full_id);

    return active_state;
}
