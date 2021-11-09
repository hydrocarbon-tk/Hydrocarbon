/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { user_defined_state_mux } from '../../grammar/nodes/default_symbols.js';
import {
    getUniqueSymbolName,
    Sym_Is_A_Generic_Type,
    Sym_Is_A_Production,
    Sym_Is_A_Token,
    Sym_Is_Defined,
    Sym_Is_EOF,
    Sym_Is_Not_Consumed,
    Sym_Is_Recovery
} from "../../grammar/nodes/symbol.js";

import {
    GrammarObject, GrammarProduction, HCG3Symbol, TokenSymbol,
    TransitionForestStateA, TransitionStateType
} from '../../types/index.js';

import { hashString } from '../../utilities/code_generating.js';
import { getFollow } from '../../utilities/follow.js';
import { Item } from "../../utilities/item.js";
import { default_case_indicator, InScopeItemState, skipped_scan_prod } from '../../utilities/magic_numbers.js';
import { getProductionClosure } from '../../utilities/production.js';
import { create_symbol_clause } from '../ir/create_symbol_clause.js';
import { ConstructionOptions } from './ConstructionOptions';
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
    const
        options: ConstructionOptions = {
            production,
            scope: "REDUCE",
            IS_LAZY: production.name.slice(-5) == '_lazy',
            lazy_end_sym: null,
            lazy_start_sym: null,
            IS_SCANNER: production.type == "scanner-production",
            IS_ROOT_SCANNER: production.name.slice(0, 9) == "__SCANNER",
            LOCAL_HAVE_ROOT_PRODUCTION_GOTO: false
        },

        root_prod_name = production.name,

        goto_hash = createProductionGotoName(production),

        root_prod_id = production.id,

        parse_states: Map<string, string> = new Map,

        recursive_descent_items = (options.IS_SCANNER)
            ? getProductionClosure(production.id, grammar).filter(
                i => !i.atEND && !Sym_Is_A_Production(i.sym(grammar)))
            : getSTARTItems(production, grammar);

    validateLazyCandidate(options, production);

    try {
        const
            tt_options: TransitionForestOptions = {
                root_production: production.id,
                max_tree_depth: 10,
                time_limit: 150,
                PRODUCTION_IS_SCANNER: options.IS_SCANNER,
                resolved_items: [],
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

            goto_item_map = getGotoSTARTs(production, [...recursive_descent_items, ...tt_options.resolved_items], grammar),

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
            options,
            parse_states,
            root_prod_name,
            ` then goto state [ ${goto_hash} ]`,
        );

        let goto_function_code = [`state [ ${goto_hash} ]`];

        if (goto_item_map_graphs.length > 0) {

            options.scope = "GOTO";

            const goto_groups = goto_item_map_graphs.group(
                ([i, g]) => generateStateHashAction(
                    g,
                    grammar,
                    options
                ).hash,

            );

            let HAVE_ROOT_PRODUCTION_GOTO = false;

            for (const goto_group of goto_groups) {

                options.LOCAL_HAVE_ROOT_PRODUCTION_GOTO = false;
                const production_ids = goto_group.map(([pid]) => pid);

                if (production_ids.includes(root_prod_id))
                    options.LOCAL_HAVE_ROOT_PRODUCTION_GOTO = true;

                for (const [_, gotostate] of goto_group)
                    processTransitionForest(
                        gotostate,
                        grammar,
                        options,
                        parse_states,
                        undefined,
                        ` then goto state [ ${goto_hash} ]`,
                        undefined,
                        1
                    );

                const state = goto_group[0][1];

                const { hash, action } = generateStateHashAction(
                    state,
                    grammar,
                    options,
                );

                let prelude = "";

                if (options.IS_ROOT_SCANNER) {

                    for (const id of production_ids) {
                        const body
                            = production.bodies.filter(b => b.sym[0].val == id)[0];

                        let prelude = "";


                        if (body) {
                            if (body.priority == skipped_scan_prod) {
                                prelude = `assign token [ ${skipped_scan_prod} ] then `;
                            } else {
                                const token_id = grammar.productions[body.sym[0].val].token_id;
                                if (token_id >= 0)
                                    prelude = `assign token [ ${token_id} ] then `;
                            }
                        }

                        goto_function_code.push(
                            f`${6}
                            assert PRODUCTION [ ${id} ] ( 
                                ${prelude}goto state [ ${hash} ] then goto state [ ${goto_hash} ]
                            )`
                        );
                    }

                } else {

                    goto_function_code.push(
                        f`${4}
                        assert PRODUCTION [ ${production_ids.join(" ")} ] ( 
                            ${prelude}goto state [ ${hash} ] then goto state [ ${goto_hash} ]
                            )`
                    );
                }

                HAVE_ROOT_PRODUCTION_GOTO ||= options.LOCAL_HAVE_ROOT_PRODUCTION_GOTO;
            }

            if (HAVE_ROOT_PRODUCTION_GOTO) {
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


        if (options.IS_LAZY) {
            const lazy_hash = `lazy_production_${production.name}`;
            const { lazy_end_sym, lazy_start_sym } = options;
            parse_states.set(lazy_hash,
                `
state [${lazy_hash}]

    lazy [ ${lazy_start_sym.val.codePointAt(0)} ${lazy_end_sym.val.codePointAt(0)} ] ( ${root_prod_name} )

                `);

            console.log(parse_states.get(lazy_hash));

            debugger;
        }

        return {
            parse_states: parse_states,
            id: production.id,
        };

    } catch (e) {
        throw new Error(`Error encountered while compiling [${production.name}]\n${recursive_descent_items.map(i => i.rup(grammar)).join("\n\n")} \n${e.stack}`);
    }
}



function validateLazyCandidate(options: ConstructionOptions, production: GrammarProduction) {
    if (options.IS_LAZY && !options.IS_SCANNER) {
        /**
         * The only true lazy productions allowed at this point are ones which
         * are defined with sentinel characters in the first and last position
         * of the only body within the production.
         */
        const last = production.bodies.map(b => b.sym[0]).group(g => getUniqueSymbolName(g));
        const first = production.bodies.map(b => b.sym.slice(-1)[0]).group(g => getUniqueSymbolName(g));

        if (last.length == 1 && first.length == 1) {
            const first_sym = first[0][0];
            const last_sym = last[0][0];

            if (Sym_Is_Defined(first_sym)
                &&
                Sym_Is_Defined(last_sym)
                &&
                first_sym.val.length == 1
                &&
                last_sym.val.length == 1
                &&
                first_sym.val != last_sym.val) {
                options.lazy_start_sym = first_sym;
                options.lazy_end_sym = last_sym;
            } else {
                options.IS_LAZY = false;
            }
        } else {
            options.IS_LAZY = false;
        }
    }
}

function createProductionGotoName(production: GrammarProduction) {
    return production.name + "_goto";
}

function processTransitionForest(
    state: TransitionForestStateA,
    grammar: GrammarObject,
    options: ConstructionOptions,
    parse_code_blocks: Map<string, string>,
    default_hash: string = undefined,
    default_goto_hash: string = undefined,
    default_prelude_hash: string = undefined,
    depth = 0
) {
    if (depth == 0)
        processTransitionNode(state, grammar, options, parse_code_blocks, default_hash, default_goto_hash, default_prelude_hash);
    else
        processTransitionNode(state, grammar, options, parse_code_blocks);

    for (const child_state of state.states) {

        processTransitionForest(child_state, grammar, options, parse_code_blocks, undefined, undefined, undefined, depth + 1);
    }
}

function processTransitionNode(
    state: TransitionForestStateA,
    grammar: GrammarObject,
    options: ConstructionOptions,
    parse_code_blocks: Map<string, string>,
    default_hash = generateStateHashAction(state, grammar, options).hash,
    postlude_command = "",
    prelude_command = "",
) {

    generateStateHashAction(state, grammar, options);

    const

        state_string = [`state [ ${default_hash} ] `
            + `\n/* ${state.depth} ${state.type & TransitionStateType.COMPLETED ? "COMPLETED" : ""}\n   ${/**/
            state.items.map(i => i.renderUnformattedWithProduction(grammar).replace(/\*/g, "ast")).join("\n  ")
            }\n*/`
        ],

        global_symbols = [],

        global_items: Item[] = [];

    if (state.type & TransitionStateType.TOKEN_ASSIGNMENT) {

        let hash = "";

        if (state.states.length > 0)
            ({ hash } = generateStateHashAction(state.states[0], grammar, options));
        const end_items = state.items.filter(i => i.atEND);
        const root_items = end_items.filter(i => i.getProduction(grammar).name == "__SCANNER__").map(i => i.decrement().getProductionAtSymbol(grammar).token_id);
        const interior_items = end_items.filter(i => i.getProduction(grammar).name != "__SCANNER__").map(i => i.getProduction(grammar).token_id);

        state_string.push(`
                assign token [ ${[...root_items, ...interior_items].join("  ")} ]`
            + (hash ? ` then goto state [ ${hash} ]` : ""));

    } else if (state.type & TransitionStateType.MULTI) {

        //join all types that have the same hash

        processMultiChildStates(
            state,
            grammar,
            options,
            state_string,
            global_symbols,
            global_items,
            postlude_command,
            prelude_command,
        );

    } else {

        let { action, assertion } = generateSingleStateAction(state, grammar, options);

        if (
            assertion
            &&
            !(state.type & TransitionStateType.PRODUCTION)
            &&
            state.symbols.filter(s => !(Sym_Is_EOF(s) || Sym_Is_A_Production(s))).length > 0
        ) {

            const mode = getSymbolMode(state.symbols.filter(Sym_Is_A_Token)[0], options.IS_SCANNER);

            state_string.push(`
                ${assertion} ${mode} [ ${state.symbols.filter(Sym_Is_A_Token).map(i => getSymbolID(i, options.IS_SCANNER)).setFilter().join(" ")} ] (
                    ${prelude_command}${action}${postlude_command}
                )
            `);
        } else {
            state_string.push(prelude_command + action + postlude_command);
        }

        global_symbols.push(...state.symbols.filter(Sym_Is_A_Token));

        global_items.push(...state.items);
    }

    if (global_items.some(i => i.offset == 1 && i.state >= InScopeItemState)) {
        // Include the items from the productions follow
        const production = (global_items.filter(i => i.state >= InScopeItemState)[0]).getProductionID(grammar);

        const follow = getFollow(production, grammar).filter(s => !Sym_Is_EOF(s) && !Sym_Is_A_Production(s));

        global_symbols.push(...follow);
    }

    if (!options.IS_SCANNER) {
        const symbol_clause = create_symbol_clause(
            global_items,
            global_symbols.filter(Sym_Is_A_Token),
            grammar,
            options
        );

        if (symbol_clause)
            state_string.push(symbol_clause);
    }

    const string = state_string.join("\n    ");

    parse_code_blocks.set(default_hash, string);
}


const hash_cache: Map<string, { hash: string, action: string, assertion: string; }> = new Map();


function generateStateHashAction(

    state: TransitionForestStateA,

    grammar: GrammarObject,

    options: ConstructionOptions

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
            options,
            action_string,
        );

        action_string.sort();

        hash_string = action_string;

    } else if (state.type & TransitionStateType.TOKEN_ASSIGNMENT) {

        if (state.states.length > 0) {

            processMultiChildStates(
                state,
                grammar,
                options,
                action_string,
            );

            action_string.sort();
        }

        hash_string = action_string.concat(state.items.map(i => i.id).join(""));

    } else {

        const { combined, action, assertion, symbol_ids: ids } = generateSingleStateAction(state, grammar, options);

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

    if (hash == "hklhahsjslhar")
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
    options: ConstructionOptions,
    state_string: string[],
    global_symbols: TokenSymbol[] = [],
    items: Item[] = [],
    postlude_command = "",
    prelude_command = "",
) {

    const states_string = [];

    items.push(...state.items);

    if (state.type & TransitionStateType.FORK) {

        const hashes = state.states.map(s => (generateStateHashAction(s, grammar, options).hash));

        const root_prod = options.production.id;
        state_string.push(`\n set prod to ${root_prod} then fork to ( ${hashes.map(h => `state [ ${h} ]`).join(", ")} )`);

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
                ({ assertion, hash } = generateStateHashAction(states[0].states[0], grammar, options));
            else
                ({ assertion, hash } = generateStateHashAction(states[0], grammar, options));

            let action = `goto state [ ${hash} ]`;
            //if State is multi merge the states of the multi state?
            let IS_OUT_OF_SCOPE = states.some(i => i.type & TransitionStateType.OUT_OF_SCOPE);

            let AUTO_FAIL = IS_OUT_OF_SCOPE;

            let AUTO_PASS = false && (states[0].items.some(i => i.state >= InScopeItemState) && !assertion);

            const IS_LAST_GROUP = AUTO_PASS;

            const symbols = getSymbolsFromStates(states).filter(Sym_Is_A_Token);

            if (symbols.length == 0)
                debugger;

            global_symbols.push(...symbols);

            let lexer_state = state.type & TransitionStateType.PEEK ? "peek" : "assert";

            const action_string = AUTO_FAIL
                ? "fail"
                : prelude_command + action + postlude_command;

            const mode_groups = symbols.groupMap(s => getSymbolMode(s, options.IS_SCANNER));

            for (const [mode, symbols] of mode_groups) {
                for (const sym of symbols.map(s => getSymbolID(s, options.IS_SCANNER))
                    .setFilter().sort(numeric_sort)) {
                    states_string.push(
                        f`${4}
                                ${lexer_state} ${mode} [ ${sym} ${IS_LAST_GROUP ? " " + default_case_indicator : ""} ](
                                    ${action_string}
                                )`
                    );
                }
            }

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
        } else
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
    options: ConstructionOptions
): { action: string; assertion: string; combined: string; symbol_ids: number[]; } {

    const { symbols, states, type, items } = state;

    const peek = (type & TransitionStateType.PEEK) > 0;

    const token_symbols = <TokenSymbol[]>symbols.filter(s => !Sym_Is_A_Production(s));

    let symbol_ids = [];

    let assertion = "";

    let action_string = "";

    let combined_string = "";

    if (states.length > 1)
        throw new Error("Single item states should not lead to multiple branches");

    if (type & TransitionStateType.OUT_OF_SCOPE) {

        assertion = peek ? "peek" : "assert";

        action_string = `set prod to ${options.production.id} then fail`;
        symbol_ids.push(...token_symbols.map(i => i.id).setFilter());

        const mode = getSymbolMode(token_symbols[0], options.IS_SCANNER);

        combined_string = `${assertion} ${mode} [ ${symbol_ids.sort(numeric_sort).join(" ")} ] ( ${action_string} )`;

    } else if (type & TransitionStateType.PEEK) {
        //Assert the children symbols

        const [child_state] = state.states;

        const hash = generateStateHashAction(child_state, grammar, options).hash;

        let { symbols } = state;

        assertion = peek ? "peek" : "assert";

        if (type & TransitionStateType.PRODUCTION) {

            const production_symbol = symbols.filter(Sym_Is_A_Production)[0];

            action_string = `goto state [ ${production_symbol.name} ] then goto state [ ${hash} ]`;

        } else
            action_string = `goto state [ ${hash} ]`;

        symbol_ids.push(...token_symbols.map(i => i.id).setFilter());

        const mode = getSymbolMode(token_symbols[0], options.IS_SCANNER);

        combined_string = `${assertion} ${mode} [ ${symbol_ids.sort(numeric_sort).join(" ")} ] ( ${action_string} )`;

    } else if (type & TransitionStateType.END) {

        const [item] = state.items;

        if (!item.atEND) {

            throw new Error(`Item [${item.rup(grammar)}] should not be at end position in this branch`);

        } else {

            const body = item.body_(grammar);

            const production = item.getProduction(grammar);

            const set_prod_clause = `set prod to ${production.id}`;

            const len = Sym_Is_EOF(item.decrement().sym(grammar))
                ? item.len - 1
                : item.len;

            if (options.IS_SCANNER) {
                let set_token = "";
                if (production.name.slice(0, 2) == "__") {
                    let prod = production;
                    if (production.name.slice(0, 9) == "__SCANNER") {
                        prod = item.decrement().getProductionAtSymbol(grammar);
                    }
                    //set_token id 
                    if (body.priority == skipped_scan_prod) {
                        set_token = `assign token [ ${skipped_scan_prod} ] then `;
                    } else {
                        const token_id = prod.token_id;
                        if (token_id >= 0)
                            set_token = `assign token [ ${token_id} ] then `;
                    }
                }
                if (production.name.slice(0, 9) == "__SCANNER" && options.scope != "GOTO") {
                    const token_prod = item.decrement().getProductionAtSymbol(grammar);
                    action_string = `${set_token}set prod to ${token_prod.id}`;
                } else {
                    action_string = set_token + set_prod_clause;
                }
            } else {
                action_string = `reduce ${len} ${body.id} then ${set_prod_clause}`;
            }

            if (options.LOCAL_HAVE_ROOT_PRODUCTION_GOTO && production.id != options.production.id) {
                //This will allow upgrade to complete
                action_string += ` then goto state [ ${createProductionGotoName(production)} ]`;
            }
        }

        combined_string = action_string;

    } else if (type & TransitionStateType.PRODUCTION) {

        let postamble = "";

        if (state.states.length > 0) {

            const { hash } = generateStateHashAction(state.states[0], grammar, options);

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

        assertion = peek ? "peek" : "assert";

    } else if (state.type & TransitionStateType.TERMINAL) {

        const [child_state] = state.states;

        const hash = generateStateHashAction(child_state, grammar, options).hash;
        if (symbols.some(s => Sym_Is_Recovery(s))) {

            const item = state.items[0];

            const production = item.getProduction(grammar);

            action_string = `goto state [ ${user_defined_state_mux}${production.name}_${1 + item.offset} ] then goto state [ ${hash} ]`;

        } else if (symbols.some(s => Sym_Is_Not_Consumed(s)))
            action_string = `consume nothing then goto state [ ${hash} ]`;
        else if (symbols.length == 1 && Sym_Is_EOF(symbols[0])) {
            action_string = `goto state [ ${hash} ]`;
        } else {
            action_string = `consume then goto state [ ${hash} ]`;
        }

        symbol_ids.push(...token_symbols.setFilter(i => i.id));

        const mode = getSymbolMode(token_symbols[0], options.IS_SCANNER);


        const mode_groups = token_symbols.groupMap(s => getSymbolMode(s, options.IS_SCANNER));

        for (const [mode, symbols] of mode_groups) {
            combined_string += (
                f`${4}
                        assert ${mode} [ ${symbols.map(s => getSymbolID(s, options.IS_SCANNER))
                        .setFilter().sort(numeric_sort).join(" ")} ](
                            ${action_string}
                        )`
            );
        }

        assertion = "assert";
    }

    if (
        (!(state.type & TransitionStateType.PEEK) || state.type & TransitionStateType.PRODUCTION)
        &&
        !(state.type & TransitionStateType.OUT_OF_SCOPE)
        &&
        (options.LOCAL_HAVE_ROOT_PRODUCTION_GOTO && state.items[0].getProductionID(grammar) != options.production.id)
        &&
        state.items.some(i => i.state >= InScopeItemState)
        &&
        state.items.some(i => i.offset == 1)
    ) {
        debugger;

        action_string = action_string;
    }

    return { action: action_string, combined: "\n    " + combined_string, assertion, symbol_ids };
}


function getSymbolMode(sym: TokenSymbol, SCANNER: boolean) {

    if (SCANNER) {

        if (Sym_Is_A_Generic_Type(sym)) {
            return "CLASS";
        } else {
            const cp = sym.val.codePointAt(0);
            if (cp < 128) {
                return "BYTE";
            } else {
                return "CODEPOINT";
            }
        }
    }

    return "TOKEN";
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