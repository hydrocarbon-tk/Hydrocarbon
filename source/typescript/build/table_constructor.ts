/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { traverse } from "@candlelib/conflagrate";
import { getUniqueSymbolName, Sym_Is_A_Production, Sym_Is_A_Token } from "../grammar/nodes/symbol.js";
import { GrammarObject, GrammarProduction, TokenSymbol } from "../types/grammar_nodes.js";
import { TransitionForestStateA, TransitionStateType } from '../types/transition_tree_nodes.js';
import { hashString } from '../utilities/code_generating.js';
import { Item } from "../utilities/item.js";
import { create_symbol_clause } from './create_symbol_clause.js';
import { constructTransitionForest, getDescentItems, getGotoItems } from './transition_tree.js';

export function constructTableParser(
    production: GrammarProduction,
    grammar: GrammarObject
): {
    parse_code_blocks: Map<string, string>;
    id: number;
} {

    const root_prod_name = production.name;

    let goto_hash = root_prod_name + "_goto";

    const root_prod_id = production.id;

    const parse_code_blocks: Map<string, string> = new Map;

    const recursive_descent_items = getDescentItems(production, grammar);

    const goto_item_map = getGotoItems(production, recursive_descent_items, grammar);

    const recursive_descent_graph = constructTransitionForest(
        grammar,
        recursive_descent_items
    );

    const goto_item_map_graphs = ([...goto_item_map.entries()]
        .map(([production_id, items]) =>
            [production_id, constructTransitionForest(
                grammar,
                items.map(i => i.increment())
            )]
        ) as [number, TransitionForestStateA][])
        .sort(([a], [b]) => b - a);

    //Output code for recursive descent items.
    processTransitionForest(
        recursive_descent_graph,
        grammar,
        parse_code_blocks,
        "DESCENT",
        root_prod_name,
        goto_item_map_graphs.length > 0
            ? goto_hash
            : ""
    );

    if (goto_item_map_graphs.length > 0) {

        const goto_groups = goto_item_map_graphs.group(
            ([, g]) => generateStateHashAction(g, grammar).hash
        );

        let goto_function_code = [`state [ ${goto_hash} ]`];

        let HAVE_ROOT_PRODUCTION_GOTO = false;

        for (const goto_group of goto_groups) {
            const production_ids = goto_group.map(([pid]) => pid);

            if (production_ids.includes(root_prod_id))
                HAVE_ROOT_PRODUCTION_GOTO = true;

            for (const [_, gotostate] of goto_group)
                processTransitionForest(
                    gotostate,
                    grammar,
                    parse_code_blocks,
                    "GOTO"
                );

            const { hash } = generateStateHashAction(goto_group[0][1], grammar);

            goto_function_code.push(
                f`${4}
                on prod [ ${production_ids.join(" ")} ] ( 
                    goto state [ ${hash} ] then goto state [ ${goto_hash} ]
                )`
            );
        }

        if (HAVE_ROOT_PRODUCTION_GOTO) {
            goto_function_code.push(
                f`${4}
                on fail state [ ${root_prod_name}_goto_failed ]
                    on prod [ ${root_prod_id} ] ( pass )`
            );

        } else {
            goto_function_code.push(
                `   on prod [ ${root_prod_id} ] ( pass )`
            );
        }

        parse_code_blocks.set(goto_hash, goto_function_code.join("\n"));
    }

    return {
        parse_code_blocks,
        id: production.id,
    };
}

function processTransitionForest(
    root_state: TransitionForestStateA,
    grammar: GrammarObject,
    parse_code_blocks: Map<string, string>,
    scope: "DESCENT" | "GOTO",
    default_hash?: string,
    default_goto_hash?: string
) {
    for (const { node: state, meta: { depth, parent } } of
        traverse<TransitionForestStateA, "states">(root_state, "states")
    ) {
        if (depth == 0)
            processTransitionNode(state, grammar, parse_code_blocks, scope, default_hash, default_goto_hash);
        else
            processTransitionNode(state, grammar, parse_code_blocks, scope);
    }
}

function processTransitionNode(
    state: TransitionForestStateA,
    grammar: GrammarObject,
    parse_code_blocks: Map<string, string>,
    scope: "DESCENT" | "GOTO",
    default_hash = generateStateHashAction(state, grammar).hash,
    default_goto_hash = ""
) {
    const
        { action } = generateStateHashAction(state, grammar),

        state_string = [`state [ ${default_hash} ] `
            //+ `\n/* ${state.depth} \n   ${state.transitioned_items.map(i => i.renderUnformattedWithProduction(grammar)).join("\n  ")}\n*/`
        ],

        global_symbols = [], global_items = [];

    if (state.states.length > 1) {

        //join all types that have the same hash

        processMultiChildStates(
            state,
            grammar,
            state_string,
            global_symbols,
            global_items,
            default_goto_hash
        );

    } else if (state.states.length == 1) {

        let state_action = action;

        if (state.type & TransitionStateType.START) {

            const child_state = state.states[0];

            const child_hash = generateStateHashAction(child_state, grammar).hash;

            const post_amble = default_goto_hash ? ` then goto state [ ${default_goto_hash} ]` : "";

            if (child_state.type & TransitionStateType.PRODUCTION) {
                const sym = child_state.symbols[0];
                state_action = `goto state [ ${sym.name} ] then goto state [ ${[child_hash]} ]${post_amble}`;
            } else {
                const symbols = child_state.symbols;
                state_action = `${child_state.depth < 0 ? "consume" : "assert"} [ ${symbols.map(i => i.id).join(" ")} ] (
                        goto state [ ${[child_hash]} ]${post_amble}
                )`;
            }
        }

        global_symbols.push(...state.symbols.filter(Sym_Is_A_Token));
        global_items.push(...state.transitioned_items.map(i => i));

        state_string.push(state_action);

    } else {
        if (!(state.type & TransitionStateType.END))
            throw new Error("Leaf states should have END flag set");
        // End states can be discarded
        return;
    }

    const symbol_clause = create_symbol_clause(
        global_items,
        [],
        grammar,
        scope
    );

    if (symbol_clause)
        state_string.push(symbol_clause);

    parse_code_blocks.set(default_hash, state_string.join("\n    "));
}


const hash_cache: Map<string, { hash: string, action: string; }> = new Map();

function generateStateHashAction(
    state: TransitionForestStateA,
    grammar: GrammarObject,
): { hash: string, action: string; } {
    let action_string = [];

    if (state.hash_action)
        return state.hash_action;

    if (state.states.length > 1) {

        for (const { symbols, type, transitioned_items } of state.states) {

            const state_string = [];

            state_string.push(...symbols.map(getUniqueSymbolName).sort());

            state_string.push(type + "");
            state_string.push(transitioned_items.map(i => i.id).sort().join("-"));

            action_string.push(state_string.join("-"));
        }
    } else if (state.states.length == 1) {

        action_string.push(generateSingleStateAction(state, grammar));

    } else {

        return { hash: "", action: "" };
    }

    const string = action_string.join("-");

    if (!hash_cache.has(string))
        hash_cache.set(string, {
            hash: "h" + hashString(string).slice(0, 12).split("").map(p => (("hjklmnpqrst".split(""))[parseInt(p)] ?? p)).join(""),
            action: string
        });

    return hash_cache.get(string);
}


function processMultiChildStates(
    state: TransitionForestStateA,
    grammar: GrammarObject,
    state_string: string[],
    global_symbols: TokenSymbol[],
    items: Item[],
    default_goto_hash = ""
) {

    const states_string = [], default_clause = default_goto_hash
        ? ` then goto state [ ${default_goto_hash} ]`
        : "";


    items.push(...state.transitioned_items);

    if (state.type & TransitionStateType.FORK) {

        const hashes = state.states.map(s => generateStateHashAction(s, grammar).hash);

        state_string.push(`\n    fork to ( ${hashes.map(h => `state [ ${h} ]`).join(", ")} )`);

    } else {

        const state_groups = state.states.groupMap(
            s => generateStateHashAction(s, grammar).hash + (
                s.type & TransitionStateType.PRODUCTION
                    ? s.symbols.filter(Sym_Is_A_Production).map(getUniqueSymbolName).sort().join()
                    : ""
            )
        );

        for (const [_, states] of state_groups) {
            const depth = states[0].depth;

            const { hash } = generateStateHashAction(states[0], grammar);
            const type = states.reduce((r, s) => r | s.type, 0);
            const symbols = <TokenSymbol[]>states.flatMap(s => s.symbols).setFilter(getUniqueSymbolName);

            global_symbols.push(...symbols);

            let lexer_state = "consume";


            if (type & TransitionStateType.PRODUCTION) {

                lexer_state = depth > 0 ? "peek" : "assert";

                const production_symbol = symbols.filter(Sym_Is_A_Production)[0];
                const assertion_symbols = <TokenSymbol[]>symbols.filter(s => !Sym_Is_A_Production(s));

                global_symbols.push(...assertion_symbols);

                states_string.push(
                    f`${4}
                    ${lexer_state} [ ${assertion_symbols.map(i => i.id).sort((a, b) => a - b).join(" ")} ](
                        goto state [ ${production_symbol.name} ] then goto state [ ${hash} ]${default_clause}
                    )`
                );

            } else {

                lexer_state = depth > 0 ? "peek" :
                    depth < 0
                        ? "consume"
                        : "assert";

                states_string.push(
                    f`${4}
                    ${lexer_state} [ ${symbols.map(i => i.id).sort((a, b) => a - b).join(" ")} ](
                        goto state [ ${hash} ]${default_clause}
                    )`
                );
            }

        }
    }

    state_string.push(...states_string);
}

function f(strings: TemplateStringsArray, ...args: any[]) {

    const tab_indent = args[0];

    args[0] = "";

    const leading_spaces = (strings[1].trim() == "" ?
        strings[1] : "\n").slice(1);

    const regex = new RegExp(`\\n\\s{${leading_spaces.length}}`, "g");

    const output = strings.map(str => str.replace(regex, "\n" + " ".repeat(tab_indent))).
        flatMap((str, i) => [str, (args[i] ?? "") + ""]);

    return output.join("");
}

function generateSingleStateAction(
    state: TransitionForestStateA,
    grammar: GrammarObject,
): string {

    const { transitioned_items, symbols, states, type } = state;

    const state_string = [];

    if (states.length > 1)
        throw new Error("Single item states should need lead to multiple branches");

    if (type & TransitionStateType.PEEK) {
        //Assert the children symbols

        const [child_state] = state.states;

        const { symbols } = child_state;

        const hash = generateStateHashAction(child_state, grammar).hash;
        state_string.push(`peek [ ${symbols.map(s => s.id).sort((a, b) => a - b).join(" ")} ] ( goto state [ ${hash} ] )`);

    } else if (type & TransitionStateType.END) {

        const [item] = state.transitioned_items;

        if (!item.atEND)
            throw new Error("Item should be at end position in this branch");

        const body = item.body_(grammar);

        const set_prod_clause = `set prod to ${body.production.id}`;

        let string = "";

        if (body.reduce_id >= 0)
            string = `reduce ${item.len} ${body.reduce_id} then ${set_prod_clause}`;
        else if (item.len > 1)
            string = `reduce ${item.len} 0 then ${set_prod_clause}`;
        else
            string = `${set_prod_clause}`;

        state_string.push(string);

    } else if (state.type & TransitionStateType.TERMINAL) {

        const [child_state] = state.states;

        const { symbols } = child_state;

        const hash = generateStateHashAction(child_state, grammar).hash;
        state_string.push(`consume [ ${symbols.map(s => s.id).sort((a, b) => a - b).join(" ")} ] ( goto state [ ${hash} ] )`);
    } else if (type & TransitionStateType.PRODUCTION) {

        if (symbols.length > 1) {

            const production_symbol = symbols.filter(Sym_Is_A_Production)[0];
            const assertion_symbols = <TokenSymbol[]>symbols.filter(s => !Sym_Is_A_Production(s));

            const { hash } = generateStateHashAction(state.states[0], grammar);

            state_string.push(
                f`${4}
                    ${"assert"} [ ${assertion_symbols.map(i => i.id).sort((a, b) => a - b).join(" ")} ](
                        gotostate [ ${production_symbol.name} ] then goto state [ ${hash} ]
                    )`
            );
        } else {
            const [production_symbol] = symbols;

            const { hash } = generateStateHashAction(state.states[0], grammar);

            if (!Sym_Is_A_Production(production_symbol))
                throw new Error(`Production type states should contain a production symbol`);

            state_string.push(`goto state [ ${production_symbol.name} ] then goto state [ ${hash} ]`);
        }
    }

    return "\n    " + state_string.join("\n");
}