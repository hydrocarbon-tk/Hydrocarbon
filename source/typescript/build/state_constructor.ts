/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { getUniqueSymbolName, Sym_Is_A_Production, Sym_Is_A_Token, Sym_Is_EOF, Sym_Is_Not_Consumed } from "../grammar/nodes/symbol.js";
import { GrammarObject, GrammarProduction, HCG3Symbol, TokenSymbol } from "../types/grammar_nodes.js";
import { TransitionForestStateA, TransitionStateType } from '../types/transition_tree_nodes.js';
import { hashString } from '../utilities/code_generating.js';
import { getFollow } from '../utilities/follow.js';
import { Item } from "../utilities/item.js";
import { default_case_indicator } from './build.js';
import { create_symbol_clause } from './create_symbol_clause.js';
import { getGotoSTARTs, getSTARTs as getSTARTItems } from "./STARTs.js";
import { constructTransitionForest } from './transition_tree.js';



export function constructProductionStates(
    production: GrammarProduction,
    grammar: GrammarObject
): {
    parse_states: Map<string, string>;
    id: number;
} {


    const root_prod_name = production.name;

    const goto_hash = createProductionGotoName(production);

    const root_prod_id = production.id;

    const parse_states: Map<string, string> = new Map;

    const recursive_descent_items = getSTARTItems(production, grammar);

    const goto_item_map = getGotoSTARTs(production, recursive_descent_items, grammar);

    const recursive_descent_graph = constructTransitionForest(
        grammar,
        recursive_descent_items
    );

    // If forks seperate out the conflicting items into 
    // parse paths and use fork mechanism to run concurrent
    // parses of the input and then join at the end of the
    // production

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
        parse_states,
        "DESCENT",
        -1,
        root_prod_name,
        ` then goto state [ ${goto_hash} ]`,
        `set scope to ${root_prod_id} then `
    );

    let goto_function_code = [`state [ ${goto_hash} ]`];

    if (goto_item_map_graphs.length > 0) {

        const goto_groups = goto_item_map_graphs.group(
            ([i, g]) => generateStateHashAction(g, grammar, i == production.id ? production.id : -1).hash
        );

        let HAVE_ROOT_PRODUCTION_GOTO = false;

        for (const goto_group of goto_groups) {

            let LOCAL_HAVE_ROOT_PRODUCTION_GOTO = false;
            const production_ids = goto_group.map(([pid]) => pid);

            if (production_ids.includes(root_prod_id))
                LOCAL_HAVE_ROOT_PRODUCTION_GOTO = true;

            for (const [_, gotostate] of goto_group)
                processTransitionForest(
                    gotostate,
                    grammar,
                    parse_states,
                    "GOTO",
                    LOCAL_HAVE_ROOT_PRODUCTION_GOTO ? production.id : -1,
                    undefined,
                    ` then goto state [ ${goto_hash} ]`,
                    undefined,
                    1
                );

            const state = goto_group[0][1];

            const { hash, action } = generateStateHashAction(state, grammar,
                LOCAL_HAVE_ROOT_PRODUCTION_GOTO ? production.id : -1
            );

            let prelude = "";

            goto_function_code.push(
                f`${4}
                on prod [ ${production_ids.join(" ")} ] ( 
                    ${prelude}goto state [ ${hash} ] then goto state [ ${goto_hash} ]
                )`
            );

            HAVE_ROOT_PRODUCTION_GOTO ||= LOCAL_HAVE_ROOT_PRODUCTION_GOTO;
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

    } else {
        goto_function_code.push("    pass");
    }

    parse_states.set(goto_hash, goto_function_code.join("\n"));

    return {
        parse_states: parse_states,
        id: production.id,
    };
}



function createProductionGotoName(production: GrammarProduction) {
    return production.name + "_goto";
}

function processTransitionForest(
    state: TransitionForestStateA,
    grammar: GrammarObject,
    parse_code_blocks: Map<string, string>,
    scope: "DESCENT" | "GOTO",
    root_prod: number,
    default_hash: string = undefined,
    default_goto_hash: string = undefined,
    default_prelude_hash: string = undefined,
    depth = 0
) {
    if (depth == 0)
        processTransitionNode(state, grammar, parse_code_blocks, scope, root_prod, default_hash, default_goto_hash, default_prelude_hash);
    else
        processTransitionNode(state, grammar, parse_code_blocks, scope, root_prod);

    for (const child_state of state.states) {

        processTransitionForest(child_state, grammar, parse_code_blocks, scope, root_prod, undefined, undefined, undefined, depth + 1);
    }
}

function processTransitionNode(
    state: TransitionForestStateA,
    grammar: GrammarObject,
    parse_code_blocks: Map<string, string>,
    scope: "DESCENT" | "GOTO",
    root_prod: number,
    default_hash = generateStateHashAction(state, grammar, root_prod).hash,
    postlude_command = "",
    prelude_command = ""
) {

    generateStateHashAction(state, grammar, root_prod);

    const

        state_string = [`state [ ${default_hash} ] `
            + `\n/* ${state.depth} \n   ${/**/
            state.items.map(i => i.renderUnformattedWithProduction(grammar).replace(/\*/g, "ast")).join("\n  ")
            }\n*/`
        ],

        global_symbols = [],

        global_items: Item[] = [];

    if (state.type & TransitionStateType.MULTI) {

        //join all types that have the same hash

        processMultiChildStates(
            state,
            grammar,
            root_prod,
            state_string,
            global_symbols,
            global_items,
            postlude_command,
            prelude_command,
        );

    } else {

        /* if (
            scope == "GOTO" 
            && state.items[0].offset == 1 
            && root_prod >= 0 
            && state.items.length == 1
            && state.
        ) {
            
        } */

        let { action, assertion } = generateSingleStateAction(state, grammar, root_prod);

        if (
            assertion
            &&
            !(state.type & TransitionStateType.PRODUCTION)
            &&
            state.symbols.filter(s => !(Sym_Is_EOF(s) || Sym_Is_A_Production(s))).length > 0
        ) {

            state_string.push(`
                ${assertion} [ ${state.symbols.filter(Sym_Is_A_Token).map(i => i.id).join(" ")} ] (
                    ${prelude_command}${action}${postlude_command}
                )
            `);
        } else {
            state_string.push(prelude_command + action + postlude_command);
        }

        global_symbols.push(...state.symbols.filter(Sym_Is_A_Token));

        global_items.push(...state.items);

    }

    if (global_items.some(i => i.offset == 1 && i.state >= 9999)) {
        // Include the items from the productions follow
        const production = (global_items.filter(i => i.state >= 9999)[0]).getProductionID(grammar);

        const follow = getFollow(production, grammar).filter(s => !Sym_Is_EOF(s) && s.type != "eop" && !Sym_Is_A_Production(s));

        global_symbols.push(...follow);
    }

    const symbol_clause = create_symbol_clause(
        global_items,
        global_symbols.filter(Sym_Is_A_Token),
        grammar,
        scope
    );

    if (symbol_clause)
        state_string.push(symbol_clause);

    const string = state_string.join("\n    ");

    parse_code_blocks.set(default_hash, string);
}


const hash_cache: Map<string, { hash: string, action: string, assertion: string; }> = new Map();

function generateStateHashAction(

    state: TransitionForestStateA,

    grammar: GrammarObject,

    root_prod: number

): { hash: string, action: string, assertion: string; } {

    let action_string = [],
        hash_string = [],
        assertion_type = "",
        symbol_ids = [];

    if (state.hash_action)
        return state.hash_action;

    if (state.type & TransitionStateType.MULTI) {

        processMultiChildStates(
            state,
            grammar,
            root_prod,
            action_string,
            [],
            []
        );

        action_string.sort();

        hash_string = action_string;
    } else {

        const { combined, action, assertion, symbol_ids: ids } = generateSingleStateAction(state, grammar, root_prod);

        hash_string.push(combined);

        symbol_ids = ids;

        action_string.push(action);

        assertion_type = assertion;
    }

    const action = action_string.join(" ");

    const hash_basis_string = hash_string.join("") + symbol_ids.sort((a, b) => a - b).join(" ");

    const hash = "h" + hashString(assertion_type + hash_basis_string)
        .slice(0, 12)
        .split("")
        .map(p => (("hjklmnpqrst".split(""))[parseInt(p)] ?? p))
        .join("");

    if (hash == "hnmahqeahbenj")
        debugger;

    if (!hash_cache.has(hash_basis_string))
        hash_cache.set(hash_basis_string, {
            hash: hash,
            action: action,
            assertion: assertion_type
        });

    return hash_cache.get(hash_basis_string);
}


function processMultiChildStates(
    state: TransitionForestStateA,
    grammar: GrammarObject,
    root_prod: number,
    state_string: string[],
    global_symbols: TokenSymbol[],
    items: Item[],
    postlude_command = "",
    prelude_command = "",
    scope: string = ""
) {

    const states_string = [];

    items.push(...state.items);

    if (state.type & TransitionStateType.FORK) {

        const hashes = state.states.map(s => (generateStateHashAction(s, grammar, root_prod).hash));

        state_string.push(`\n    fork to ( ${hashes.map(h => `state [ ${h} ]`).join(", ")} )`);

    } else {

        let i = 0;

        for (const states of state.states.map(i => [i])) {

            let { assertion, hash } = generateStateHashAction(states[0], grammar, root_prod);

            let action = `goto state [ ${hash} ]`;
            //if State is multi merge the states of the multi state?
            let IS_OUT_OF_SCOPE = states.some(i => i.type & TransitionStateType.OUT_OF_SCOPE);

            let AUTO_FAIL = IS_OUT_OF_SCOPE;

            let AUTO_PASS = false && (states[0].items.some(i => i.state >= 9999) && !assertion);

            const IS_LAST_GROUP = AUTO_PASS;

            const symbols = getSymbolsFromStates(states).filter(Sym_Is_A_Token);

            if (symbols.length == 0)
                debugger;

            global_symbols.push(...symbols);

            let lexer_state = state.depth > 0 ? "peek" : "assert";

            const action_string = AUTO_FAIL
                ? "fail"
                : prelude_command + action + postlude_command;

            states_string.push(
                f`${4}
                    ${lexer_state} [ ${symbols.map(i => i.id).sort((a, b) => a - b).join(" ")} ${IS_LAST_GROUP ? " " + default_case_indicator : ""} ](
                        ${action_string}
                    )`
            );

            i++;
        }
    }

    state_string.push(...states_string);
}

function getSymbolsFromStates(states: TransitionForestStateA[]): HCG3Symbol[] {

    const symbols: HCG3Symbol[] = [];
    for (const state of states) {
        if (state.type & TransitionStateType.MULTI) {
            symbols.push(...getSymbolsFromStates(state.states));
        }
        else
            symbols.push(...state.symbols);
    }

    return symbols.setFilter(getUniqueSymbolName);
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
    root_prod: number
): { action: string; assertion: string; combined: string; symbol_ids: number[]; } {

    const { symbols, states, type, items } = state;

    const token_symbols = <TokenSymbol[]>symbols.filter(s => !Sym_Is_A_Production(s));

    let symbol_ids = [];

    let assertion = "";

    let action_string = "";

    let combined_string = "";

    if (states.length > 1)
        throw new Error("Single item states should need lead to multiple branches");


    if (type & TransitionStateType.OUT_OF_SCOPE) {

        let { depth } = state;

        assertion = depth > 0 ? "peek" : "assert";

        action_string = `set prod to ${root_prod} then fail`;
        symbol_ids.push(...token_symbols.map(i => i.id));
        combined_string = `${assertion} [ ${symbol_ids.sort((a, b) => a - b).join(" ")} ] ( ${action_string} )`;

    } else if (type & TransitionStateType.PEEK) {
        //Assert the children symbols

        const [child_state] = state.states;

        const hash = generateStateHashAction(child_state, grammar, root_prod).hash;

        let { symbols, depth, items } = state;

        assertion = depth > 0 ? "peek" : "assert";

        if (type & TransitionStateType.PRODUCTION) {

            const production_symbol = symbols.filter(Sym_Is_A_Production)[0];

            action_string = `goto state [ ${production_symbol.name} ] then goto state [ ${hash} ]`;

        } else
            action_string = `goto state [ ${hash} ]`;

        symbol_ids.push(...token_symbols.map(i => i.id));

        combined_string = `${assertion} [ ${symbol_ids.sort((a, b) => a - b).join(" ")} ] ( ${action_string} )`;

    } else if (type & TransitionStateType.END) {

        const [item] = state.items;

        if (!item.atEND) {

            throw new Error("Item should be at end position in this branch");

        } else {

            const body = item.body_(grammar);

            const production = item.getProduction(grammar);

            const set_prod_clause = `set prod to ${body.production.id}`;

            if (body.reduce_id >= 0)
                action_string = `reduce ${item.len} ${body.reduce_id} then ${set_prod_clause}`;
            else if (item.len > 1)
                action_string = `reduce ${item.len} 0 then ${set_prod_clause}`;
            else
                action_string = `${set_prod_clause}`;

            if (root_prod >= 0 && production.id != root_prod) {
                //This will allow upgrade to complete
                action_string += ` then goto state [ ${createProductionGotoName(production)} ]`;
            }
        }

        combined_string = action_string;

    } else if (type & TransitionStateType.PRODUCTION) {

        if (symbols.length > 1) {

            const production_symbol = symbols.filter(Sym_Is_A_Production)[0];

            const assertion_symbols = <TokenSymbol[]>symbols.filter(s => !Sym_Is_A_Production(s));

            const { hash } = generateStateHashAction(state.states[0], grammar, root_prod);

            action_string =
                f`${4}
                    goto state [ ${production_symbol.name} ] then goto state [ ${hash} ]
                    `;

        } else {

            const [production_symbol] = symbols;

            const { hash } = generateStateHashAction(state.states[0], grammar, root_prod);

            if (!Sym_Is_A_Production(production_symbol))
                throw new Error(`Production type states should contain a production symbol`);

            action_string = `goto state [ ${production_symbol.name} ] then goto state [ ${hash} ]`;
        }

        combined_string = action_string;

        assertion = state.depth > 0 ? "peek" : "assert";

    } else if (state.type & TransitionStateType.TERMINAL) {

        const [child_state] = state.states;

        const hash = generateStateHashAction(child_state, grammar, root_prod).hash;

        if (symbols.some(s => Sym_Is_Not_Consumed(s)))

            action_string = `consume nothing then goto state [ ${hash} ]`;

        else if (symbols.length == 1 && Sym_Is_EOF(symbols[0]))
            action_string = `goto state [ ${hash} ]`;
        else
            action_string = `consume then goto state [ ${hash} ]`;
        symbol_ids.push(...token_symbols.map(i => i.id));
        combined_string = `assert [ ${symbol_ids.sort((a, b) => a - b).join(" ")} ] ( ${action_string} )`;

        assertion = "assert";
    }

    if (
        (!(state.type & TransitionStateType.PEEK) || state.type & TransitionStateType.PRODUCTION)
        &&
        (root_prod >= 0 && state.items[0].getProductionID(grammar) != root_prod)
        &&
        state.items.some(i => i.state >= 9999)
        &&
        state.items.some(i => i.offset == 1)
    )
        action_string = `not within scopes [ ${state.items[0].getProductionID(grammar)} ] then set scope to ${state.items[0].getProductionID(grammar)} then ` + action_string;

    return { action: action_string, combined: "\n    " + combined_string, assertion, symbol_ids };
}
