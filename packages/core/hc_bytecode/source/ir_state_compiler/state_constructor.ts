/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import {
    convert_symbol_to_friendly_name,
    getStartItemsFromProduction,
    getUniqueSymbolName,
    GrammarObject,
    GrammarProduction,
    hashString,
    HCG3ProductionBody,
    ProductionSymbol,
    skipped_scan_prod,
    Sym_Is_A_Generic_Type,
    Sym_Is_A_Token, Sym_Is_DEFAULT, Sym_Is_Defined, Sym_Is_Not_Consumed,
    Sym_Is_Recovery,
    TokenSymbol,
    user_defined_state_mux
} from '@hctoolkit/common';
import { create_symbol_clause, create_symbol_comment } from '../ir/create_symbol_clause.js';
import { ConstructionOptions } from '../types/construction_options.js';
import { TransitionGraphOptions } from '../types/transition_graph_options.js';
import { TransitionStateType as TST } from '../types/transition_tree_nodes.js';
import { constructDescent, constructGoto, createNode, Node } from './transition_graph.js';

const hash_cache: Map<string, HashAction> = new Map();

interface HashAction {
    hash: string;
    action: string;
    assertion: string;
}

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
            scope: "DESCENT",
            IS_LAZY: production.name.slice(-5) == '_lazy',
            lazy_end_sym: undefined,
            lazy_start_sym: undefined,
            IS_SCANNER: production.type == "scanner-production",
            IS_ROOT_SCANNER: production.name.slice(0, 9) == "__SCANNER",
            LOCAL_HAVE_ROOT_PRODUCTION_GOTO: false
        },

        root_prod_name = production.name,

        goto_hash = createProductionGotoName(production),

        parse_states: Map<string, string> = new Map;

    validateLazyCandidate(options, production);

    try {
        const
            tt_options: TransitionGraphOptions = {
                root_production: production,
                max_tree_depth: 10,
                time_limit: 150,
                IS_SCANNER: options.IS_SCANNER,
                resolved_items: [],
                goto_items: [],
                scope: "DESCENT",
                ambig_ids: new Set
            };

        // If forks separate out the conflicting items into 
        // parse paths and use fork mechanism to run concurrent
        // parses of the input and then join at the end of the
        // production

        {
            const descent_graph = constructDescent(
                grammar,
                production,
                tt_options,
            );


            //Output code for recursive descent items.
            processTransitionTree(
                descent_graph,
                grammar,
                options,
                parse_states,
                root_prod_name
            );
        }

        {
            options.scope = "GOTO";
            tt_options.scope = "GOTO";

            const goto_graph = constructGoto(
                grammar,
                production,
                Object.assign({}, tt_options),
                tt_options.goto_items
            );

            if (goto_graph.children.length > 0) {

                const HAVE_ROOT_PRODUCTION_GOTO =
                    goto_graph.children.some(c => (<ProductionSymbol><any>c.sym).name == production.name);

                if (!HAVE_ROOT_PRODUCTION_GOTO) {



                    // Ensure correct production id has been assigned to the production's symbol
                    production.symbol.val = production.id;

                    const node = createNode(tt_options, production.symbol, [], goto_graph);
                    node.addType(TST.O_GOTO, TST.I_PASS);
                }

                processTransitionTree(
                    goto_graph,
                    grammar,
                    options,
                    parse_states,
                    root_prod_name + "_goto",
                );

                if (HAVE_ROOT_PRODUCTION_GOTO) {
                    const state_string = parse_states.get(goto_hash);

                    parse_states.set(goto_hash, state_string + `
    
    on fail state [ ${root_prod_name}_goto_failed ]
        assert PRODUCTION [ ${production.id} ] ( pass )`);
                }
            } else {
                parse_states.set(goto_hash, `state [ ${goto_hash} ] \n    pass`);
            }
        }


        if (options.IS_LAZY) {

            const lazy_hash = `lazy_production_${production.name}`;

            const { lazy_end_sym, lazy_start_sym } = options;

            if (lazy_end_sym && lazy_start_sym) {

                parse_states.set(lazy_hash,
                    `
                    state [${lazy_hash}]
                    
                    lazy [ ${lazy_start_sym.val.codePointAt(0)} ${lazy_end_sym.val.codePointAt(0)} ] ( ${root_prod_name} )
                    
                    `);

                debugger;
            }
        }
        return {
            parse_states: parse_states,
            id: production.id,
        };

    } catch (e: any) {
        console.log(e);
        throw new Error(`Error encountered while compiling [${production.name}]\n${getStartItemsFromProduction(production).map(i => i.rup(grammar)).join("\n\n")} \n${e.stack}`);
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

function processTransitionTree(
    state: Node,
    grammar: GrammarObject,
    options: ConstructionOptions,
    parse_code_blocks: Map<string, string>,
    default_hash: string | undefined = undefined,
    depth = 0
) {
    if (depth == 0)
        processTransitionNode(state, grammar, options, parse_code_blocks, default_hash);
    else
        processTransitionNode(state, grammar, options, parse_code_blocks);

    for (const child_state of state.states) {

        processTransitionTree(child_state, grammar, options, parse_code_blocks, undefined, depth + 1);
    }
}

function processTransitionNode(
    state: Node,
    grammar: GrammarObject,
    options: ConstructionOptions,
    parse_code_blocks: Map<string, string>,
    default_hash = generateStateHashAction(state, grammar, options).hash
) {

    if (parse_code_blocks.has(default_hash))
        return;

    const

        items = state.children.length > 0
            ? state.children.flatMap(c => c.items)
            : state.items,

        state_string = [`state [ ${default_hash} ] `
            + `\n/*\n    ${/**/
            items.map(i => i.renderUnformattedWithProduction(grammar).replace(/\*/g, "ast")).join("\n    ")
            }\n*/\n`
        ];

    state_string.push(generateStateHashAction(state, grammar, options).action);

    /**
     * The only time we do not determine the composition of expected tokens is
     * when the current state is a GOTO state comprised of branch instructions
     * switching on the value of the last reduced production; or, when the state 
     * is a SCANNER state, and we are directly considering the values of the 
     * input stream.
     */
    if (!options.IS_SCANNER && !(state.is(TST.I_GOTO_START))) {

        const symbol_clause = create_symbol_clause(
            items,
            grammar,
            options
        );

        if (symbol_clause)
            state_string.push(symbol_clause);
    }

    const string = state_string.join("\n    ");

    parse_code_blocks.set(default_hash, string);
}
function generateStateHashAction(

    state: Node,

    grammar: GrammarObject,

    options: ConstructionOptions

): HashAction {

    let assertion_type = "";

    if (state.hash_action)
        return state.hash_action;

    const action = generateStateAction(state, grammar, options);

    const hash_basis_string = action;

    const hash = "h" + hashString(action)
        .slice(0, 12)
        .split("")
        .map((p) => (("hjklmnpqrst".split(""))[parseInt(p)] ?? p))
        .join("");

    if (!hash_cache.has(hash_basis_string))
        hash_cache.set(hash_basis_string, {
            hash: hash,
            action: action,
            assertion: assertion_type
        });

    return <HashAction>hash_cache.get(hash_basis_string);
}
function generateStateAction(
    state: Node,
    grammar: GrammarObject,
    options: ConstructionOptions
): string {
    const branch_actions = [];

    let post_amble = state.depth == 1 ? ` then goto state [ ${options.production.name}_goto ]` : " ";

    if (state.children.length == 0) {
        // This state is a empty state and will never be
        // reached through other parse states.

        if (state.is(TST.I_OUT_OF_SCOPE) || state.is(TST.I_FAIL)) {
            branch_actions.push("fail");
        } else if (state.is(TST.I_PASS)) {
            branch_actions.push("pass");
        } else {
            branch_actions.push(createEndAction(state, grammar, options));
        }


    } else if (state.is(TST.I_FORK)) {

        const hashes = [];

        for (const child of state.children)
            hashes.push(generateStateHashAction(child, grammar, options).hash);

        branch_actions.push(`fork to (  ${hashes.map(h => `state [ ${h} ]`).join(",")}  )`);

    } else/*  if (state.children.length == 1 && state.children[0].is(TST.I_FORK)) {
        return generateStateAction(state.children[0], grammar, options);
    } else */ for (const child of state.children) {

            let { action, hash, assertion } = generateStateHashAction(child, grammar, options);
            const sym = child.sym;

            let action_string = "";

            if ((child.is(TST.I_END) || child.is(TST.I_FAIL)) && state.children.length == 1) {

                action_string = action;
            } else {

                if (child.is(TST.O_PEEK)) {

                    const mode = getSymbolMode(<TokenSymbol>sym, options.IS_SCANNER);

                    if (Sym_Is_A_Token(sym))

                        action_string = `peek ${mode} [${sym.id} /* ${create_symbol_comment(sym)} */ ] ( goto state [${hash}]${post_amble})`;
                    else
                        throw new Error(`Invalid peek state on non-token symbol ${convert_symbol_to_friendly_name(sym)}`);

                } else if (child.is(TST.O_TERMINAL)) {

                    const mode = getSymbolMode(<TokenSymbol>sym, options.IS_SCANNER);

                    if (Sym_Is_Recovery(sym)) {

                        const item = state.items[0];

                        const production = <GrammarProduction>item.getProduction(grammar);

                        action_string = `goto state [ ${user_defined_state_mux}${production.name}_${1 + item.offset} ] then goto state [ ${hash} ]${post_amble}`;

                    } else if (Sym_Is_A_Token(sym)) {

                        if (Sym_Is_DEFAULT(sym) && state.children.length == 1) {
                            action_string = `goto state [${hash}]${post_amble}`;
                        } else if (child.is(TST.I_CONSUME)) {

                            /*  if (child.children.length == 1) {
                                 //Skip ahead to the state's child since the state's main action has been performed.
                                 ({ action, hash, assertion } = generateStateHashAction(child.children[0], grammar, options));
                             } */

                            if (Sym_Is_Not_Consumed(sym)) {
                                action_string = `assert ${mode} [${getSymbolID(sym, options.IS_SCANNER)} /* ${create_symbol_comment(sym)} */ ] ( consume nothing then goto state [${hash}]${post_amble})`;
                            } else {
                                action_string = `assert ${mode} [${getSymbolID(sym, options.IS_SCANNER)} /* ${create_symbol_comment(sym)} */ ] ( consume then goto state [${hash}]${post_amble})`;
                            }
                        } else {
                            action_string = `assert ${mode} [${getSymbolID(sym, options.IS_SCANNER)} /* ${create_symbol_comment(sym)} */ ] ( goto state [${hash}]${post_amble})`;
                        }
                    }

                } else if (child.is(TST.O_GOTO)) {

                    if (child.is(TST.I_PASS))
                        action_string = `assert PRODUCTION [${sym.val} /* ${getUniqueSymbolName(sym)} */ ] ( pass )`;
                    else
                        action_string = `assert PRODUCTION [${sym.val} /* ${getUniqueSymbolName(sym)} */ ] ( goto state [${hash}]${post_amble})`;

                } else if (child.is(TST.O_PRODUCTION)) {

                    action_string = `goto state [${(<any>sym).name}] then goto state [${hash}]${post_amble}`;
                } else {
                    action_string = `goto state [${hash}]${post_amble}`;
                }
            }

            branch_actions.push(action_string);
        }

    return branch_actions.join("\n    ");
}
function createEndAction(state: Node, grammar: GrammarObject, options: ConstructionOptions) {
    const [item] = state.items;

    let string = "";

    if (!item.atEND) {

        throw new Error(`Item [${item.rup(grammar)}] should not be at end position in this branch`);

    } else {

        const body = <HCG3ProductionBody>item.body_(grammar);

        const production = <GrammarProduction>item.getProduction(grammar);

        const set_prod_clause = `set prod to ${production.id}`;

        const len = Sym_Is_DEFAULT(item.decrement().sym(grammar))
            ? item.len - 1
            : item.len;

        if (state.is(TST.I_SCANNER)) {
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

                    const token_id = <number>prod.token_id;

                    if (token_id >= 0)
                        set_token = `assign token [ ${token_id} ] then `;
                }
            }
            if (production.name.slice(0, 9) == "__SCANNER" && options.scope != "GOTO") {
                const token_prod = item.decrement().getProductionAtSymbol(grammar);
                string = `${set_token}set prod to ${token_prod.id}`;
            } else {
                string = set_token + set_prod_clause;
            }
        } else {
            string = `reduce ${len} ${body.id} then ${set_prod_clause}`;
        }
    }
    return string;
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

function getSymbolID(sym: TokenSymbol, SCANNER: boolean) {

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
