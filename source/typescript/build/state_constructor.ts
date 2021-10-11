/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { user_defined_state_mux } from '../grammar/nodes/default_symbols.js';
import { getUniqueSymbolName, Sym_Is_A_Generic_Type, Sym_Is_A_Production, Sym_Is_A_Token, Sym_Is_EOF, Sym_Is_Not_Consumed, Sym_Is_Recovery } from "../grammar/nodes/symbol.js";
import { GrammarObject, GrammarProduction, HCG3Symbol, TokenSymbol } from "../types/grammar_nodes.js";
import { TransitionForestStateA, TransitionStateType } from '../types/transition_tree_nodes.js';
import { hashString } from '../utilities/code_generating.js';
import { getFollow } from '../utilities/follow.js';
import { Item } from "../utilities/item.js";
import { getProductionClosure } from '../utilities/production.js';
import { default_case_indicator } from './build.js';
import { create_symbol_clause } from './create_symbol_clause.js';
import { getGotoSTARTs, getSTARTs as getSTARTItems } from "./STARTs.js";
import { constructTransitionForest, TransitionForestOptions } from './transition_tree.js';

const numeric_sort: (a: any, b: any) => number = (z, w) => z - w;

export function constructProductionStates(
    production: GrammarProduction,
    grammar: GrammarObject
): {
    parse_states: Map<string, string>;
    id: number;
} {

    //*  
    if (production.name == "__SCANNER__") {
        // debugger;
    }
    else {
        return {
            id: 0,
            parse_states: new Map
        };
    } //*/

    const
        PRODUCTION_IS_SCANNER = production.type == "scanner-production",

        root_prod_name = production.name,

        goto_hash = createProductionGotoName(production),

        root_prod_id = production.id,

        parse_states: Map<string, string> = new Map,

        recursive_descent_items = (PRODUCTION_IS_SCANNER)
            ? getProductionClosure(production.id, grammar).filter(
                i => !i.atEND && !Sym_Is_A_Production(i.sym(grammar)))
            : getSTARTItems(production, grammar),

        goto_item_map = getGotoSTARTs(production, recursive_descent_items, grammar);

    try {
        const

            tt_options: TransitionForestOptions = {
                root_production: production.id,
                max_tree_depth: 10,
                time_limit: 150,
                PRODUCTION_IS_SCANNER
            },

            recursive_descent_graph = constructTransitionForest(
                grammar,
                recursive_descent_items,
                tt_options,
                [
                    ...(grammar.lr_items.get(production.id) ?? []),
                    ...getProductionClosure(production.id, grammar).filter(i => Sym_Is_A_Production(i.sym(grammar)))
                ]
                    .setFilter(i => i.id).map(i => i.toState(5555))
            ),

            // If forks separate out the conflicting items into 
            // parse paths and use fork mechanism to run concurrent
            // parses of the input and then join at the end of the
            // production

            goto_item_map_graphs = ([...goto_item_map.entries()]
                .map(([production_id, items]) =>
                    [
                        production_id, constructTransitionForest(
                            grammar,
                            items.map(i => i.increment()),
                            tt_options
                        )
                    ]
                ) as [number, TransitionForestStateA][])
                .sort(([a], [b]) => b - a);

        //Output code for recursive descent items.
        processTransitionForest(
            recursive_descent_graph,
            grammar,
            PRODUCTION_IS_SCANNER,
            parse_states,
            "DESCENT",
            -1,
            root_prod_name,
            ` then goto state [ ${goto_hash} ]`,
            PRODUCTION_IS_SCANNER
                ? ""
                : `set scope to ${root_prod_id} then `
        );

        let goto_function_code = [`state [ ${goto_hash} ]`];

        if (goto_item_map_graphs.length > 0) {

            const goto_groups = goto_item_map_graphs.group(
                ([i, g]) => generateStateHashAction(
                    g,
                    grammar,
                    PRODUCTION_IS_SCANNER,
                    i == production.id ? production.id : -1).hash
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
                        PRODUCTION_IS_SCANNER,
                        parse_states,
                        "GOTO",
                        LOCAL_HAVE_ROOT_PRODUCTION_GOTO ? production.id : -1,
                        undefined,
                        ` then goto state [ ${goto_hash} ]`,
                        undefined,
                        1
                    );

                const state = goto_group[0][1];

                const { hash, action } = generateStateHashAction(
                    state,
                    grammar,
                    PRODUCTION_IS_SCANNER,
                    LOCAL_HAVE_ROOT_PRODUCTION_GOTO ? production.id : -1
                );

                let prelude = "";

                goto_function_code.push(
                    f`${4}
                assert PRODUCTION [ ${production_ids.join(" ")} ] ( 
                    ${prelude}goto state [ ${hash} ] then goto state [ ${goto_hash} ]
                )`
                );

                HAVE_ROOT_PRODUCTION_GOTO ||= LOCAL_HAVE_ROOT_PRODUCTION_GOTO;
            }
            if (production.name == "__SCANNER__") {
                goto_function_code.push(
                    f`${4}
                on fail state [ ${root_prod_name}_goto_failed ]
                    pass`
                );
            } else if (HAVE_ROOT_PRODUCTION_GOTO) {
                goto_function_code.push(
                    f`${4}
                on fail state [ ${root_prod_name}_goto_failed ]
                    assert PRODUCTION [ ${root_prod_id} ] ( pass )`
                );

            } else {
                goto_function_code.push(
                    `   assert PRODUCTION [ ${root_prod_id} ] ( pass )`
                );
            }

        } else {
            goto_function_code.push("    pass");
        }

        parse_states.set(goto_hash, goto_function_code.join("\n"));
        //* 
        for (const [, state] of parse_states)
            console.log(state);
        //*/

        return {
            parse_states: parse_states,
            id: production.id,
        };

    } catch (e) {
        throw new Error(`Error encountered while compiling [${production.name}]\n${recursive_descent_items.map(i => i.rup(grammar)).join("\n\n")} \n${e.stack}`);
    }
}



function createProductionGotoName(production: GrammarProduction) {
    return production.name + "_goto";
}

function processTransitionForest(
    state: TransitionForestStateA,
    grammar: GrammarObject,
    PRODUCTION_IS_SCANNER: boolean,
    parse_code_blocks: Map<string, string>,
    scope: "DESCENT" | "GOTO",
    root_prod: number,
    default_hash: string = undefined,
    default_goto_hash: string = undefined,
    default_prelude_hash: string = undefined,
    depth = 0
) {
    if (depth == 0)
        processTransitionNode(state, grammar, PRODUCTION_IS_SCANNER, parse_code_blocks, scope, root_prod, default_hash, default_goto_hash, default_prelude_hash);
    else
        processTransitionNode(state, grammar, PRODUCTION_IS_SCANNER, parse_code_blocks, scope, root_prod);

    for (const child_state of state.states) {

        processTransitionForest(child_state, grammar, PRODUCTION_IS_SCANNER, parse_code_blocks, scope, root_prod, undefined, undefined, undefined, depth + 1);
    }
}

function processTransitionNode(
    state: TransitionForestStateA,
    grammar: GrammarObject,
    PRODUCTION_IS_SCANNER: boolean,
    parse_code_blocks: Map<string, string>,
    scope: "DESCENT" | "GOTO",
    root_prod: number,
    default_hash = generateStateHashAction(state, grammar, PRODUCTION_IS_SCANNER, root_prod).hash,
    postlude_command = "",
    prelude_command = "",
) {

    generateStateHashAction(state, grammar, PRODUCTION_IS_SCANNER, root_prod);

    const

        state_string = [`state [ ${default_hash} ] `
            + `\n/* ${state.depth} \n   ${/**/
            state.items.map(i => i.renderUnformattedWithProduction(grammar).replace(/\*/g, "ast")).join("\n  ")
            }\n*/`
        ],

        global_symbols = [],

        global_items: Item[] = [];

    if (state.type & TransitionStateType.TOKEN_ASSIGNMENT) {

        let hash = "";

        if (state.states.length > 0)
            ({ hash } = generateStateHashAction(state.states[0], grammar, PRODUCTION_IS_SCANNER, root_prod));
        const end_items = state.items.filter(i => i.atEND);
        const root_items = end_items.filter(i => i.getProduction(grammar).name == "__SCANNER__").map(i => i.decrement().getProductionAtSymbol(grammar).id);
        const interior_items = end_items.filter(i => i.getProduction(grammar).name != "__SCANNER__").map(i => i.getProductionID(grammar));

        state_string.push(`
                token_assign [ ${[...root_items, ...interior_items].join("  ")} ]`
            + (hash ? ` then goto [ ${hash} ]` : ""));

    } else if (state.type & TransitionStateType.MULTI) {

        //join all types that have the same hash

        processMultiChildStates(
            state,
            grammar,
            PRODUCTION_IS_SCANNER,
            root_prod,
            state_string,
            global_symbols,
            global_items,
            postlude_command,
            prelude_command,
        );

    } else {

        let { action, assertion } = generateSingleStateAction(state, grammar, PRODUCTION_IS_SCANNER, root_prod);

        if (
            assertion
            &&
            !(state.type & TransitionStateType.PRODUCTION)
            &&
            state.symbols.filter(s => !(Sym_Is_EOF(s) || Sym_Is_A_Production(s))).length > 0
        ) {

            const mode = getSymbolMode(state.symbols.filter(Sym_Is_A_Token)[0], PRODUCTION_IS_SCANNER);

            state_string.push(`
                ${assertion} ${mode} [ ${state.symbols.filter(Sym_Is_A_Token).map(i => getSymbolID(i, PRODUCTION_IS_SCANNER)).setFilter().join(" ")} ] (
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
        scope,
        !PRODUCTION_IS_SCANNER
    );

    if (symbol_clause)
        state_string.push(symbol_clause);

    const string = state_string.join("\n    ");

    parse_code_blocks.set(default_hash, string);
}


const hash_cache: Map<string, { hash: string, action: string, assertion: string; }> = new Map();

function convertSymbolToPoint(PRODUCTION_IS_SCANNER: boolean): (value: TokenSymbol, index: number, array: TokenSymbol[]) => number {
    return i => PRODUCTION_IS_SCANNER ? i.val.codePointAt(0) : i.id;
}

function generateStateHashAction(

    state: TransitionForestStateA,

    grammar: GrammarObject,

    PRODUCTION_IS_SCANNER: boolean,

    root_prod: number

): { hash: string, action: string, assertion: string; } {

    if (!state)
        debugger;

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
            PRODUCTION_IS_SCANNER,
            root_prod,
            action_string,
            [],
            []
        );

        action_string.sort();

        hash_string = action_string;

    } else if (state.type & TransitionStateType.TOKEN_ASSIGNMENT) {

        if (state.states.length > 0) {

            processMultiChildStates(
                state,
                grammar,
                PRODUCTION_IS_SCANNER,
                root_prod,
                action_string,
                [],
                []
            );

            action_string.sort();
        }

        hash_string = action_string.concat(state.items.map(i => i.id).join(""));

    } else {

        const { combined, action, assertion, symbol_ids: ids } = generateSingleStateAction(state, grammar, PRODUCTION_IS_SCANNER, root_prod);

        hash_string.push(combined);

        symbol_ids = ids;

        action_string.push(action);

        assertion_type = assertion;
    }

    const action = action_string.join(" ");

    const hash_basis_string = hash_string.join("") + symbol_ids.sort(numeric_sort).join(" ");

    const hash = "h" + hashString(assertion_type + hash_basis_string)
        .slice(0, 12)
        .split("")
        .map(p => (("hjklmnpqrst".split(""))[parseInt(p)] ?? p))
        .join("");

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
    PRODUCTION_IS_SCANNER: boolean,
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

        const hashes = state.states.map(s => (generateStateHashAction(s, grammar, PRODUCTION_IS_SCANNER, root_prod).hash));

        state_string.push(`\n    fork to ( ${hashes.map(h => `state [ ${h} ]`).join(", ")} )`);

    } else {

        let i = 0;

        for (const states of state.states.map(i => [i])) {

            const { depth, type } = states[0];

            let assertion = null, hash = "";

            // If a single item state is at peek depth that is the same
            // as this multi item state we have reached the end of the 
            // peek sequence. The peek that would otherwise be performed
            // in the single item state has been performed by this multi
            // state. Thus, instead of a GOTO to the leaf state, we goto
            // the leaf state's child state, to ensure erroneous peek commands
            // are not generated.
            if (depth == state.depth && !(type & TransitionStateType.MULTI) && type & TransitionStateType.PEEK)
                ({ assertion, hash } = generateStateHashAction(states[0].states[0], grammar, PRODUCTION_IS_SCANNER, root_prod));
            else
                ({ assertion, hash } = generateStateHashAction(states[0], grammar, PRODUCTION_IS_SCANNER, root_prod));

            let action = `goto state [ ${hash} ]`;
            //if State is multi merge the states of the multi state?
            let IS_OUT_OF_SCOPE = states.some(i => i.type & TransitionStateType.OUT_OF_SCOPE);

            let AUTO_FAIL = IS_OUT_OF_SCOPE;

            let AUTO_PASS = false && (states[0].items.some(i => i.state >= 9999) && !assertion);

            const IS_LAST_GROUP = AUTO_PASS;

            const symbols = getSymbolsFromStates(states).filter(Sym_Is_A_Token);

            if (symbols.length < 1)
                debugger;

            global_symbols.push(...symbols);

            let lexer_state = state.depth > 0 ? "peek" : "assert";

            const action_string = AUTO_FAIL
                ? "fail"
                : prelude_command + action + postlude_command;

            const mode = symbols.map(s => getSymbolMode(symbols[0], PRODUCTION_IS_SCANNER)).setFilter();

            if (mode.length > 1)
                debugger;

            states_string.push(
                f`${4}
                    ${lexer_state} ${mode.join(" ")} [ ${symbols.map(s => getSymbolID(s, PRODUCTION_IS_SCANNER))
                        .setFilter().sort(numeric_sort).join(" ")} ${IS_LAST_GROUP ? " " + default_case_indicator : ""} ](
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
        if (state.type & TransitionStateType.MULTI && !(state.type & TransitionStateType.FORK)) {
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
    PRODUCTION_IS_SCANNER: boolean,
    root_prod: number,
): { action: string; assertion: string; combined: string; symbol_ids: number[]; } {

    const { symbols, states, type, items } = state;

    const token_symbols = <TokenSymbol[]>symbols.filter(s => !Sym_Is_A_Production(s));

    let symbol_ids = [];

    let assertion = "";

    let action_string = "";

    let combined_string = "";

    if (states.length > 1)
        throw new Error("Single item states should not lead to multiple branches");

    if (type & TransitionStateType.OUT_OF_SCOPE) {

        let { depth } = state;

        assertion = depth > 0 ? "peek" : "assert";

        action_string = `set prod to ${root_prod} then fail`;
        symbol_ids.push(...token_symbols.map(i => i.id).setFilter());

        const mode = getSymbolMode(token_symbols[0], PRODUCTION_IS_SCANNER);

        combined_string = `${assertion} ${mode} [ ${symbol_ids.sort(numeric_sort).join(" ")} ] ( ${action_string} )`;

    } else if (type & TransitionStateType.PEEK) {
        //Assert the children symbols

        const [child_state] = state.states;

        const hash = generateStateHashAction(child_state, grammar, PRODUCTION_IS_SCANNER, root_prod).hash;

        let { symbols, depth, items } = state;

        assertion = depth > 0 ? "peek" : "assert";

        if (type & TransitionStateType.PRODUCTION) {

            const production_symbol = symbols.filter(Sym_Is_A_Production)[0];

            action_string = `goto state [ ${production_symbol.name} ] then goto state [ ${hash} ]`;

        } else
            action_string = `goto state [ ${hash} ]`;

        symbol_ids.push(...token_symbols.map(i => i.id).setFilter());

        const mode = getSymbolMode(token_symbols[0], PRODUCTION_IS_SCANNER);

        combined_string = `${assertion} ${mode} [ ${symbol_ids.sort(numeric_sort).join(" ")} ] ( ${action_string} )`;

    } else if (type & TransitionStateType.END) {

        const [item] = state.items;

        if (!item.atEND) {

            throw new Error("Item should be at end position in this branch");

        } else {

            const body = item.body_(grammar);

            const production = item.getProduction(grammar);

            const set_prod_clause = `set prod to ${body.production.id}`;

            const len = Sym_Is_EOF(item.decrement().sym(grammar))
                ? item.len - 1
                : item.len;

            if (PRODUCTION_IS_SCANNER) {
                if (body.production.name == "__SCANNER__") {
                    action_string = `token_assign [ ${item.decrement().getProductionAtSymbol(grammar).id} ] then ${set_prod_clause}`;
                } else {
                    action_string = `token_assign [ ${item.getProductionID(grammar)} ]`;
                }
            } else if (body.reduce_id >= 0)
                action_string = `reduce ${len} ${body.reduce_id} then ${set_prod_clause}`;
            else if (len > 1)
                action_string = `reduce ${len} 0 then ${set_prod_clause}`;
            else
                action_string = `${set_prod_clause}`;

            if (root_prod >= 0 && production.id != root_prod) {
                //This will allow upgrade to complete
                action_string += ` then goto state [ ${createProductionGotoName(production)} ]`;
            }
        }

        combined_string = action_string;

    } else if (type & TransitionStateType.PRODUCTION) {

        let postamble = "";

        if (state.states.length > 0) {

            const { hash } = generateStateHashAction(state.states[0], grammar, PRODUCTION_IS_SCANNER, root_prod);

            postamble = ` then goto state [ ${hash} ]`;
        }

        if (symbols.length > 1) {

            const production_symbol = symbols.filter(Sym_Is_A_Production)[0];

            action_string =
                f`${4}
                    goto state [ ${production_symbol.name} ]${postamble}
                    `;

        } else {

            const [production_symbol] = symbols;



            if (!Sym_Is_A_Production(production_symbol))
                throw new Error(`Production type states should contain a production symbol`);

            action_string = `goto state [ ${production_symbol.name} ]${postamble}`;
        }

        combined_string = action_string;

        assertion = state.depth > 0 ? "peek" : "assert";

    } else if (state.type & TransitionStateType.TERMINAL) {

        const [child_state] = state.states;

        const hash = generateStateHashAction(child_state, grammar, PRODUCTION_IS_SCANNER, root_prod).hash;
        if (symbols.some(s => Sym_Is_Recovery(s))) {

            const item = state.items[0];

            const production = item.getProduction(grammar);

            action_string = `goto state [ ${user_defined_state_mux}${production.name}_${1 + item.offset} ] then goto state [ ${hash} ]`;

        } else if (symbols.some(s => Sym_Is_Not_Consumed(s)))

            action_string = `consume nothing then goto state [ ${hash} ]`;

        else if (symbols.length == 1 && Sym_Is_EOF(symbols[0]))
            action_string = `goto state [ ${hash} ]`;
        else
            action_string = `consume then goto state [ ${hash} ]`;




        symbol_ids.push(...token_symbols.setFilter(i => i.id));

        const mode = getSymbolMode(token_symbols[0], PRODUCTION_IS_SCANNER);

        combined_string = `assert ${mode} [ ${symbol_ids.sort(numeric_sort).join(" ")} ] ( ${action_string} )`;

        assertion = "assert";
    }

    if (
        (!(state.type & TransitionStateType.PEEK) || state.type & TransitionStateType.PRODUCTION)
        &&
        !(state.type & TransitionStateType.OUT_OF_SCOPE)
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


function getSymbolMode(sym: TokenSymbol, SCANNER) {

    if (SCANNER) {

        if (Sym_Is_A_Generic_Type(sym)) {
            return "CLASS";
        } else {
            const cp = sym.val.codePointAt(0);
            if (cp < 128) {
                return "BYTE";
            } else {
                return "";
            }
        }
    }

    return sym.id;
}

function getSymbolID(sym: TokenSymbol, SCANNER) {

    if (SCANNER) {
        if (Sym_Is_A_Generic_Type(sym)) {
            return sym.id;
        } else {
            const cp = sym.val.codePointAt(0);
            if (cp < 128) {
                return cp;
            } else {
                return cp;
            }
        }
    }

    return sym.id;
}