import { Grammar, Production, EOF_SYM } from "../types/grammar.js";
import { processClosure, Item, FOLLOW } from "../util/common.js";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment";
import { stmt, JSNode } from "@candlefw/js";
import {
    getNonTerminalTransitionStates,
    integrateState
} from "./utilities.js";
import { State } from "./State";
import { Symbol } from "../../../build/types/types/grammar.js";
export interface States {
    states: State[];
    map: Map<string, State>;
}



//Integrates a LR state into existing set of states
export function IntegrateState(production: Production, states: States, grammar: Grammar, env: GrammarParserEnvironment, runner) {

    const start_state: State = <State>{
        sym: "",
        sid: "",
        id: "",
        index: 0,
        roots: [],
        items: [],
        maps: new Map,
        state_merge_tracking: new Set,
        yields: new Set,
        origins: new Map,
        reachable: new Set,
        REACHABLE: false,
    };

    CompileHybridLRStates(grammar, env, runner, production.id, states, start_state, [...FOLLOW(grammar, production.id).values()]);

    return start_state;
}

export function CompileHybridLRStates(
    grammar: Grammar,
    env: GrammarParserEnvironment,
    runner,
    production_index = 0,
    states: States = { map: new Map, states: [] },
    start_state: State = <State>{
        sym: "",
        sid: "",
        id: "",
        index: 0,
        items: [],
        roots: [],
        maps: new Map,
        state_merge_tracking: new Set,
        yields: new Set,
        origins: new Map,
        reachable: new Set,
        REACHABLE: false,
    },
    follows: Symbol[] = [EOF_SYM]
): States {

    const unprocessed_state_items = [{
        old_state: start_state,
        items: createProductionItems(production_index, grammar, follows)
    }];

    unprocessed_state_items[0].old_state.items = unprocessed_state_items[0].items;

    /*
        Go through each item set ----
        Gather each item that transitions on a particular symbol; 
        This combinations represent whole groups that can transition 
        to a new state;
    */
    for (let i = 0; i < unprocessed_state_items.length; i++) {

        const
            { items: to_process_items, old_state } = unprocessed_state_items[i],
            roots = new Set(to_process_items.map(i => i.getProduction(grammar).id));

        old_state.roots.push(...roots.values());

        to_process_items.filter(i => !i.atEND).forEach(i => {
            const sym = i.sym(grammar);

            if (sym.type == "production" && !roots.has(sym.val))
                old_state.yields.add(sym.val);
        });

        processClosure(to_process_items, grammar);

        [
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

                if (sym.type != "production")
                    old_state.origins.set(val, i.getProduction(grammar).id);

                //groups.get(val).items.push(i.increment());

                return groups;

            }, <Map<string, { sym: string, items: Item[]; }>>new Map()).values()
        ]

            .flatMap(values => processStateItems(values, grammar))

            .map(s => mergeState(s, states.map, old_state, unprocessed_state_items));
    }

    states.states = [...states.map.values()];

    return states;
}

export function createProductionItems(production_index: number, grammar: Grammar, follows: Symbol[] = [EOF_SYM]) {
    return follows.flatMap(sym => grammar[production_index].bodies.map(
        b => new Item(
            b.id,
            b.length,
            0, sym
        )));
}

function processStateItems(item_set: { sym: string; items: Item[]; }[], grammar): State[] {

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
            yields: new Set,
            origins: new Map,
            reachable: new Set,
            REACHABLE: false,
        });
    }

    return out;
}

function mergeState(
    state: State,
    states: Map<string, State>,
    old_state: State,
    unprocessed_state_items: { old_state: State; items: Item[]; }[]) {


    const { id, sid, sym } = state;

    if (!states.has(id)) {
        state.index = states.size;
        states.set(id, state);
    }

    if (!old_state.maps.has(sym))
        old_state.maps.set(sym, []);

    const
        active_state = states.get(id),
        transition_map = old_state.maps.get(sym);

    if (transition_map.indexOf(active_state.index) < 0)
        transition_map.push(active_state.index);

    states.set(id, active_state);

    if (!active_state.state_merge_tracking.has(sid)) {
        unprocessed_state_items.push({ old_state: state, items: state.items });
        active_state.state_merge_tracking.add(sid);
    }

    active_state.items.push(...state.items);

    const filter_set = new Set();

    active_state.items = active_state.items.filter(i => (!filter_set.has(i.full_id) && (filter_set.add(i.full_id), true)));

    //if (old_state.index == 4)
    //    console.log(0, 2, active_state.index, active_state);

    return active_state;
}
