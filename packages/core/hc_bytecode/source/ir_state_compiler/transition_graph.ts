/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import {
    default_DEFAULT,
    getClosure,
    getProductionClosure,
    getSkippableSymbolsFromItems,
    getStartItemsFromProduction,
    getSymbolFromUniqueName,
    getUniqueSymbolName,
    getUniqueSymbolName as gusn,
    GrammarObject,
    GrammarProduction,
    HCG3Symbol,
    Item,
    OutOfScopeItemState,
    ProductionSymbol,
    SymbolsCollide,
    SymbolType,
    Sym_Is_A_Generic_Identifier,
    Sym_Is_A_Generic_Symbol,
    Sym_Is_A_Generic_Type,
    Sym_Is_A_Production,
    Sym_Is_A_Production_Token,
    Sym_Is_DEFAULT,
    Sym_Is_Defined,
    Sym_Is_Defined_Identifier, Sym_Is_Defined_Symbol, Sym_Is_Exclusive,
    Token,
    TokenSymbol
} from '@hctoolkit/common';
import { TransitionGraphOptions as TGO } from '../types/transition_graph_options.js';
import { TransitionStateType as TST } from '../types/transition_tree_nodes.js';

//Module scoped variable for convenience
var GRAMMAR: GrammarObject;

export function constructDescent(
    grammar: GrammarObject,
    production: GrammarProduction,
    options: TGO,

    //Internal recursive arguments
): Node {

    if (process.stdout._handle) process.stdout._handle.setBlocking(true);

    GRAMMAR = grammar;

    const production_items = getStartItemsFromProduction(production);

    options.goto_items = [];

    options.root_production = production;

    options.branch_cache = new Map;

    const node = createNode(options, default_DEFAULT, production_items);

    let tpn: Node[] = [];

    node.addType(TST.I_DESCENT_START);

    options.root = node;

    processNode(options, node, tpn, false);

    let v = null;

    while ((v = tpn.shift()))
        processNode(options, v, tpn);

    return node;
}

export function constructGoto(
    grammar: GrammarObject,
    production: GrammarProduction,
    options: TGO,
    goto_items: Item[]
): Node {
    GRAMMAR = grammar;

    options.scope = "GOTO";

    options.goto_items = [];

    options.root_production = production;

    options.branch_cache = new Map;

    const goto_state = processGoto(options, goto_items);

    goto_state.addType(TST.I_GOTO_START);

    return goto_state;
}

export function getGotoSTARTs(
    production: GrammarProduction,
    seed_items: Item[],
    grammar: GrammarObject
): Map<number, Item[]> {

    const lr_items = getProductionClosure(production.id, grammar).filter(i => i.offset == 0
        &&
        !i.atEND
        &&
        Sym_Is_A_Production(i.sym(grammar))
    ).groupMap(i => i.getProductionAtSymbol(grammar).id);
    const batch = seed_items.map(i => i.getProductionID(grammar)).setFilter();

    const output: Map<number, Item[]> = new Map();

    for (const id of batch) {

        if (!output.has(id) && lr_items.has(id)) {

            let items = <Item[]>lr_items.get(id);

            output.set(id, items);
            batch.push(...items.map(i => i.getProductionID(grammar)));
        }
    }

    return output;
}

function processGoto(options: TGO, goto_items: Item[], parent: Node | null = null): Node {

    const goto_item_map = getGotoSTARTs(options.root_production, goto_items, GRAMMAR);

    parent = createNode(options, default_DEFAULT, goto_items);

    const nodes: Node[] = [];

    for (const [id, group] of goto_item_map) {
        // If some items in the group are completed, we'll use peek to 
        // disambiguate potential conflicts between oos items and 
        // any other non-completed items.

        //This will default to a peek
        const
            items = <Item[]>group.map(inc),
            prod = GRAMMAR.productions[id],
            node = createNode(options, {
                type: SymbolType.PRODUCTION,
                id: id,
                val: id,
                name: prod.name,
                IS_NON_CAPTURE: false,
                tok: new Token("", 0, 0, 0),
                meta: false
            }, items, parent);

        node.addType(TST.O_GOTO);

        if (
            group.length > 1
            &&
            (// Have some completed items
                group.some(i => i.increment()?.atEND ?? false)
                ||
                // Is root production 
                id == options.root_production.id
            )
        ) {
            if (id == options.root_production.id) {
                // Need to include out of scope states that will be used
                // to overcome shift reduce ambiguities that may occur
                // when resolving items that the root production may be 
                // reduced into.

                //Get all items that the root production may be a member of
                const
                    reducible = GRAMMAR.lr_items
                        ?.get(id)
                        ?.filter(i => !group.some(g => g.id == i.id))
                        .map(inc)
                        .map(s => s.toState(OutOfScopeItemState))
                        ?? [];

                node.items = node.items.concat(reducible);
            }

            createPeek(options, node, node.items, nodes);
        } else
            processNode(options, node, nodes, false);
    }

    let v = null;

    while ((v = nodes.shift()))
        processNode(options, v, nodes);

    return parent;
}

function get_sym(i: Item) {
    return i.sym(GRAMMAR);
}

function processNode(
    opt: TGO,
    node: Node,
    /** To Process Nodes */
    tpn: Node[],
    INCREMENT = true
): void {

    let items = node.items.slice();

    if (INCREMENT)
        items = <Item[]>items.map(
            i => i.atEND
                ? i

                : i.increment());

    let n_term = items.filter(term_item);

    let n_nonterm = items.filter(nonterm_item);

    let n_end = items.filter(end_item);

    if (n_nonterm.length > 0) {

        //Remove direct left recursive items
        n_nonterm = n_nonterm
            .filter(i => i.offset > 0 || i.getProductionAtSymbol(GRAMMAR).name != opt.root_production.name);

        const productions: ProductionSymbol[] =
            <any[]>n_nonterm.map(get_sym).setFilter(gusn);

        // Filter out shift reduce conflicts

        // If all the non-terminal items are the same production
        // and there are no terminal items then
        // we can do a production call provided that
        // the production does not loop back into the 
        // host production (Indirect Left Recursion). 
        if (n_term.length == 0
            && (n_end.length == 0)
            && productions.length == 1
            && (node.depth > 1 || nonRecursive(n_nonterm, opt.root_production))
        ) {
            createProductionCall(opt, productions[0], n_nonterm, node, tpn);
        } else {
            // Break down non-terminal items to get terminal items

            // If we can call different productions depending
            // on the a series of discriminating terminal symbols
            // then we shall do so. This utilizes the disambiguate 
            // peek process. 
            //
            // If in SCANNER mode then we can turn 
            // the peek states into regular parse states.

            // If the production items deform into pure terminal states
            // then we can use simply transition on terminal symbols

            //group production by name
            const p_groups = n_nonterm
                .group(iToSymID)
                .map(createProdGroup);

            let RESOLVED = false;

            if (n_end.length == 0)

                if (!productionStartsIntersect(p_groups, n_term, opt)) {
                    // Each production group consume a non-intersecting set of terminal
                    // symbols at this point so we can branch to separate production 
                    // calls based on these terminal symbols.

                    RESOLVED = true;

                    if (p_groups.length == 1 && n_term.length == 0) {
                        const prod = get_sym(p_groups[0].group[0]);
                        createProductionCall(opt, <ProductionSymbol>prod, p_groups[0].group, node, tpn);
                    } else {


                        for (const group of p_groups) {
                            const prod = get_sym(group.group[0]);
                            for (const term of group.terms.map(get_sym).setFilter(gusn)) {
                                createTermedProductionCall(
                                    opt,
                                    <TokenSymbol>term,
                                    <ProductionSymbol>prod,
                                    group.group,
                                    node,
                                    tpn
                                );
                            }
                        }
                    }
                } else if (node.depth == 1) {

                    // We have an opportunity to parse independent terminal 
                    // items, forgoing LL/RD style production call states.

                    const new_term = [...n_term, ...p_groups.flatMap(g => g.terms)].setFilter(item_id);
                    const new_nonterm = [...n_nonterm, ...p_groups.flatMap(g => g.nonterms)].setFilter(item_id);

                    opt.goto_items.push(...new_nonterm);

                    node.items = new_term;

                    node.closure = [...new_nonterm].setFilter(item_id);

                    return processNode(
                        opt,
                        node,
                        tpn,
                        false
                    );
                }

            if (!RESOLVED) {


                // Some production groups consume symbols shared with other
                // production groups or terminal items.

                // If there is an infinite series of discriminating symbols
                // then there may be no recourse other than to issue a
                // fork and let the runtime handle the potential ambiguous
                // parses.

                // We'll need to disambiguate all items.
                createPeek(opt, node, items, tpn);
                return;
            }
        }
    }

    if (n_end.length > 0) {
        if (n_end.length == 1) {
            processEndItem(
                opt,
                node,
                n_end[0]
            );
        } else {

            // We'll need to disambiguate all items.
            createPeek(opt, node, items, tpn);
            return;
        }
    }

    incrementTerminals(
        opt,
        node,
        n_term,
        tpn
    );
}

function incrementTerminals(
    opt: TGO,
    node: Node,
    items: Item[],
    tpn: Node[]
) {

    const symbol_groups = items.filter(i => i.state !== OutOfScopeItemState).group(iToSymID);

    if (opt.IS_SCANNER) {
        //Combine Generated symbols with terminal symbols 
        const generated = symbol_groups.filter(g => Sym_Is_A_Generic_Type(g[0].sym(GRAMMAR)));
        const terminal = symbol_groups.filter(g => Sym_Is_Defined(g[0].sym(GRAMMAR)));

        if (generated.length > 0 && terminal.length > 0) {

            //Disambiguate
            createPeek(opt, node, items, tpn);
            return;
        }
    }

    for (const group of symbol_groups) {

        const new_node = createNode(opt, item_sym(group[0]), group, node);

        new_node.addType(TST.O_TERMINAL, TST.I_CONSUME);

        tpn.push(new_node);
    }
}

function processEndItem(
    options: TGO<Node>,
    node: Node,
    end_item: Item,
) {


    if (options.IS_SCANNER
        &&
        options.IS_ROOT_SCANNER
        &&
        options.root
        &&
        /**
         * If the production that has just been complete is not one of the root
         * productions found within the scanner function
         */
        !options.root.closure.some(
            i =>
                i.getProductionID(GRAMMAR) == options.root_production.id
                && i.getProductionAtSymbol(GRAMMAR)?.id == end_item.getProductionID(GRAMMAR)
        )
    ) {

        const new_items = node.scanItems(true);

        node.closure = [...new_items, end_item].setFilter(item_id);

        const root_item = new_items.filter(i => i.atEND && i.getProductionID(GRAMMAR) == options.root_production.id)[0];

        if (root_item) {
            const new_node = createNode(options, default_DEFAULT, [root_item], node);

            options.goto_items.push(end_item);

            new_node.addType(TST.I_END, TST.O_TERMINAL);

            return;
        }
    }

    const new_node = createNode(options, default_DEFAULT, [end_item], node);

    options.goto_items.push(end_item);

    new_node.addType(TST.I_END, TST.O_TERMINAL);


}

function createPeek(
    opt: TGO,
    parent: Node,
    parent_items: Item[],
    tpn: Node[]
) {

    let
        end_item = 0,
        closure: Item[] =
            [...(GRAMMAR.lr_items?.values() ?? [])].flat().setFilter(item_id);

    parent.items = [];

    //separate node into a set of groups
    const roots = parent_items.setFilter(item_id).group(s => {
        if (s.state == OutOfScopeItemState)
            return "out-of-scope-state-" + iToSymID(s);
        else if (s.atEND)
            return "end" + end_item++;
        else
            return iToSymID(s);
    }).map((g, j) => {

        let
            state = 10000 * (j + 1),
            items = g.map(i => i.toState(state)).setFilter(item_id),
            _closure = closure,
            n = createNode(opt, item_sym(g[0]), items, null);

        if (opt.scope == "GOTO") {
            if (items[0].atEND) {
                n.addType(TST.I_COMPLETE);

                const active_productions = new Set(
                    parent_items.map(i => i.decrement().getProductionAtSymbol(GRAMMAR).id).setFilter()
                );

                _closure = closure.filter(
                    i => {
                        return !active_productions.has(i.getProductionAtSymbol(GRAMMAR).id);
                    }
                );


                //if (opt.root_production.name == "element_block_list_2" && state == 10000)
                //    console.error({ c: itemsDebug(_closure), r: itemsDebug(closure), active_productions, parent_items: itemsDebug(parent_items) });
            }
        }

        n.closure = getClosure(items, GRAMMAR, state);
        n.depth = state;
        n.root = n;

        if (g[0].state == OutOfScopeItemState)
            n.addType(TST.I_OUT_OF_SCOPE);

        parent.closure.push(..._closure.map(i => i.toState(state)));



        parent.makeClosureUnique(true);
        parent.items.push(...items);

        return n;
    }).filter(i => !!i);

    const leaves: { node: Node, parent: Node; }[] = [];

    disambiguate(
        opt,
        roots.flatMap((r, j) => {

            //Combine nodes with the same symbol
            const
                out = [],
                nodes = r.items.flatMap(createNodeClosure(opt, parent, r)),
                groups = nodes.group(n => getUniqueSymbolName(n.sym));

            for (const group of groups) {

                const primary = group[0];

                for (const node of group.slice(1)) {

                    node.makeClosureUnique(true);

                    primary.items.push(...node.items);

                    primary.closure = primary.closure.concat(node.closure);

                    primary.makeClosureUnique(true);
                }


                out.push(primary);
            }

            for (const node of out) node.depth = r.depth;

            if (opt.IS_SCANNER)
                out.forEach(n => { if (!Sym_Is_DEFAULT(n.sym)) { n.addType(TST.I_CONSUME); } });

            return nodes;
        }), roots, tpn, leaves, [], parent);

    parent.items = parent.items.setFilter(item_id);

    completeLeaves(opt, tpn, leaves);
}

/**
 * Uses a modified Earley parser algorithm to trace the parse forest to leaves
 * that are unambiguous. 
 * 
 * The depth of the trace can be limited through the 
 * @type {TGO["max_tree_depth"]} parameter
 * 
 */
function disambiguate(
    opt: TGO,
    nodes: Node[],
    roots_: Node[],
    tpn: Node[],
    leaves: { node: Node, parent: Node; }[],
    ids: string[] = [],
    root: Node,
    depth: number = 0,
    prev_time: number = 0
) {

    // We are starting with a set of nodes, each representing either
    // a terminal symbol or an item in the end position. 
    // Each node has a common parent. 

    let start = performance.now();

    const
        end_nodes = nodes.filter(n => n.end_items.length > 0),
        term_nodes = nodes.filter(n => n.end_items.length == 0);

    if (end_nodes.length > 0) {

        // Detect if else conflicts and find in favo


        // We must first complete end-items and generate new
        // nodes that arise from the completion of a production. 

        const final_nodes: Node[] = [];

        for (const node of end_nodes) {

            const items = node.scanItems();

            if (items.length > 0) {

                const parent = <Node>node.parent;

                if (opt.scope == "GOTO" || opt.IS_SCANNER)
                    term_nodes.push(...items.flatMap(createNodeClosure(opt, parent, <Node>node.root)));

                if (end_nodes.length > 1) {
                    node.pruneLeaf();
                } else {
                    final_nodes.push(node);
                }
            } else {
                final_nodes.push(node);
            }
        }

        // FINAL item is an end-item  a state such that it is the top 
        // most production and cannot be resolved to any other items, 
        // that . If more than one FINAL item is present
        // then we have a GENERAL ambiguity that may only be resolved
        // through the issuance of a fork state. 

        if (final_nodes.length > 1) {
            const roots = getRootsFromNodes(final_nodes);
            if (roots.length == 1) {
                final_nodes.slice(1).map(s => s.pruneLeaf());

                const node = final_nodes[0];

                setTransitionType(node);

                gatherLeaves(node, roots[0], leaves);

            } else {
                const parent = final_nodes.map(s => s.pruneLeaf()).pop();

                handleUnresolvedRoots(opt, final_nodes[0].sym, getRootsFromNodes(final_nodes), parent, leaves, tpn);
            }

        } else if (final_nodes.length > 0) {

            let final_node = final_nodes[0];

            setTransitionType(final_node);

            gatherLeaves(final_node, root, leaves);

        }
    }

    const next_steps: Node[][] = [];

    if (term_nodes.length > 0 && term_nodes.every(t => t.root?.is(TST.I_OUT_OF_SCOPE))) {

        const parent = term_nodes.map(s => s.pruneLeaf())[0];

        parent.addType(TST.I_FAIL);

        return;
    } else if (term_nodes.length == 0) {
        return;
    }

    const groups = term_nodes.groupMap(n => gusn(n.sym));

    mergeOccludingGroups(opt, groups);

    for (const [sym, group] of groups) {

        //combine the nodes into a single item
        const prime_node = group[0];

        setTransitionType(prime_node);

        const new_groups = [];

        const node_root_id = group.map(s => s.root?.depth + "").setFilter();

        if (group.length > 1 && node_root_id.length > 1) {

            for (const node of group) {

                if (node != prime_node) {

                    node.pruneLeaf();

                    prime_node.items.push(...node.items);

                    prime_node.closure = prime_node.closure.concat(node.closure);

                    prime_node.makeClosureUnique(true);
                }

                if (node.is(TST.I_SKIPPED_COLLISION))
                    new_groups.push(...node.items
                        .flatMap(createNodeClosure(opt, prime_node, <Node>node.root)));
                else
                    new_groups.push(...node.items
                        .map(inc).flatMap(createNodeClosure(opt, prime_node, <Node>node.root)));
            }


            if (new_groups.length == 0) {
                if (group.every(i => i.root?.is((TST.I_OUT_OF_SCOPE)))) {
                    gatherLeaves(prime_node, root, leaves);
                } else {
                    throw new Error(
                        "Invalid state, unable to continue disambiguating \n"
                        +
                        group.map(i => i.root?.debug).setFilter().join("\n")
                    );
                }
            } else {
                prime_node.addType(TST.I_TEST);
                next_steps.push(new_groups);
            }

            prime_node.items = prime_node.items.setFilter(item_id);

        } else {

            for (const node of group) {

                if (node != prime_node) {

                    node.pruneLeaf();

                    prime_node.items.push(...node.items);

                    prime_node.closure = prime_node.closure.concat(node.closure);

                    prime_node.makeClosureUnique(true);
                }
            }

            prime_node.items = prime_node.items.setFilter(item_id);

            gatherLeaves(prime_node, root, leaves);
        }
    }

    let end = performance.now();

    let total_time = prev_time + (end - start);
    for (let step of next_steps) {

        const id = getNodesId(step);

        if (step.length > 0) {
            if (handleShiftReduceConflicts(opt, step, leaves, root, depth)) {
                continue;
            } else if (groupsAreAliased(step)) {

                if (opt.scope == "GOTO") {

                    const candidate_roots = getRootsFromNodes(step);

                    if (candidate_roots.length == 2) {
                        //Secondary check of shift reduce conflicts

                        if (candidate_roots.some(r => r.items[0].atEND) && candidate_roots.some(r => !r.items[0].atEND)) {
                            const winner = candidate_roots.filter(r => !r.items[0].atEND)[0];
                            const loser = candidate_roots.filter(r => r.items[0].atEND)[0];

                            const prime_node = step[0];

                            setTransitionType(prime_node);

                            for (const node of step) {
                                if (node != prime_node) {
                                    node.pruneLeaf();
                                    if (node.root == winner) {
                                        prime_node.items.push(...node.items);
                                        prime_node.closure.push(...node.closure);
                                        prime_node.makeClosureUnique(true);
                                    }
                                }
                            }

                            prime_node.items = prime_node.items.setFilter(item_id);

                            gatherLeaves(prime_node, root, leaves);

                            console.log("--------");

                            continue;
                        }
                    }
                }


                handleTransitionCollision(step, opt, tpn, leaves);
            } else if ((ids.includes(id)) /* || depth > 2 */ || total_time > 100) {
                //Remove out of scope
                if (total_time > 100)
                    console.error("TIMED OUT");
                if (handleShiftReduceConflicts(opt, step, leaves, root, depth, opt.scope == "GOTO" && root.depth <= 2)) { }
                else if (step.length > 0)
                    handleTransitionCollision(step, opt, tpn, leaves);
            } else {
                disambiguate(opt, step, roots_, tpn, leaves, ids.concat(id), root, depth + 1, total_time);
            }
        }
    }
}

function getNodesId(step: Node[]) {
    return step.map(i => i.items.setFilter(i => i.id).map(i => i.id).sort().join("-")).sort().setFilter().join("|");
}

function getClosureId(step: Node[]) {
    return step.map(i => i.closure.setFilter(i => i.id).map(i => i.id).sort().join("-")).sort().setFilter().join("|");
}

function groupsAreAliased(step: Node[]) {
    //const groups = step.setFilter(g => g.root?.depth + " " + itemsDebug(g.items).join("\n")).groupMap(n => itemsDebug(n.items));
    const groups = step.setFilter(g => g.root?.items.map(i => i.id).sort().join("-") ?? "").groupMap(
        n => n.items.map(i => i.toState(0).id).setFilter().sort().join("-")
    );
    // const maps = groups.map(g => g.map(i => itemsDebug(i.items).sort().join("")).sort().join("")).setFilter();

    for (const group of groups.values())
        if (group.length > 1) {
            return true;
        }

    return false;
}

function handleShiftReduceConflicts(
    opt: TGO,
    step: Node[],
    leaves: { node: Node, parent: Node; }[],
    root: Node,
    depth: number,
    IN_GOTO: boolean = false
): boolean {

    if (step.length == 0) return false;

    const candidate_roots = getRootsFromNodes(step);

    if (candidate_roots.every(r => r.items.length == 1)) {

        const prod = candidate_roots[0].items[0].getProductionID(GRAMMAR);

        if (candidate_roots.every(r => r.items[0].getProductionID(GRAMMAR) == prod) || IN_GOTO) {

            if (candidate_roots.length == 2) {
                if (candidate_roots.some(r => r.items[0].atEND) && candidate_roots.some(r => !r.items[0].atEND)) {
                    const winner = candidate_roots.filter(r => !r.items[0].atEND)[0];
                    const loser = candidate_roots.filter(r => r.items[0].atEND)[0];

                    const prime_node = step[0];

                    setTransitionType(prime_node);

                    for (const node of step) {
                        if (node != prime_node) {
                            node.pruneLeaf();
                            if (node.root == winner) {
                                prime_node.items.push(...node.items);
                                prime_node.closure.push(...node.closure);
                                prime_node.makeClosureUnique(true);
                            }
                        }
                    }

                    prime_node.items = prime_node.items.setFilter(item_id);

                    gatherLeaves(prime_node, root, leaves);

                    return true;
                }
            }
        }
    }
    if (opt.root_production.name == "element_block_list_2" && opt.scope == "GOTO")
        console.error({ r: step.map(i => itemsDebug(i.items)) });



    return false;
}

function setTransitionType(node: Node) {
    if ((node.depth % 10000) > 0 && node.depth >= 10000)
        node.addType(TST.O_PEEK);
    else
        node.addType(TST.O_TERMINAL);
}

function handleTransitionCollision(step: Node[], options: TGO, tpn: Node[], leaves: { node: Node, parent: Node; }[]) {

    if (options.IS_SCANNER) {
        //Remove generic symbols

    } else {

        const roots = getRootsFromNodes(step);
        const sym = step[0].sym;
        const parent = <Node>step.map(s => s.pruneBranch()).pop();

        handleUnresolvedRoots(options, sym, roots, parent, leaves, tpn);
    }
}


function getRootsFromNodes(step: Node[]) {
    return step.map(s => <Node>s.root).setFilter(s => s.items.map(item_id).sort().join("|"));

}

function gatherLeaves(
    node: Node,
    parent: Node,
    leaves: { node: Node, parent: Node; }[],
) {
    leaves.push({ node, parent });
}
function completeLeaves(
    opt: TGO,
    tpn: Node[],
    leaves: { node: Node, parent: Node; }[],
) {

    for (const depth_group of leaves.group(({ node: l }) => l.root)) {
        //Join group into one common parent

        const { node: first_node, parent: first_parent } = depth_group[0];

        const central = first_node.clone();
        central.items = depth_group.flatMap(d => d.node.items).setFilter(item_id);
        central.closure = depth_group.flatMap(d => d.node.closure).setFilter(item_id);

        const root = central.root;

        if (!root)
            throw new Error("Root is not defined");

        if (root.is(TST.I_OUT_OF_SCOPE)) {
            depth_group.forEach(n => n.node.addType(TST.I_FAIL, TST.I_OUT_OF_SCOPE));
        } else if (opt.IS_SCANNER) {

            for (const { parent, node } of depth_group) {

                //If the root is a production call try using that
                node.clearPeek();

                if (!Sym_Is_DEFAULT(parent.sym))
                    parent.addType(TST.I_CONSUME);

                parent.addType(TST.I_CONSUME);

                if (root.depth == node.depth && Sym_Is_A_Production(root.sym)) {
                    node.pruneLeaf();

                    createTermedProductionCall(
                        opt,
                        <TokenSymbol>node.sym,
                        <ProductionSymbol>root.sym,
                        root.items,
                        parent,
                        tpn
                    );
                } else {

                    parent.closure.push(...parent.items);

                    parent.makeClosureUnique();

                    if (node.items.some(i => i.atEND)) {
                        node.removeType(TST.I_CONSUME);
                        //processEndItem(opt, node, node.items[0]);
                        processNode(opt, node, tpn, false);
                    } else {

                        if (!Sym_Is_DEFAULT(node.sym))
                            node.addType(TST.I_CONSUME);

                        node.depth = (parent.depth + 1) % 10000;

                        node.closure.push(...getClosure(node.items, GRAMMAR), ...node.items);

                        node.makeClosureUnique();

                        processNode(opt, node, tpn, true);
                    }
                }
            }

        } else {

            const r = root;

            const depth = first_parent.depth;

            if (!depth)
                throw new Error("Depth not defined");

            r.items = r.items.map(i => i.toState(depth + 1)).setFilter(item_id);
            r.depth = depth;
            r.parent = central;

            processNode(opt, r, tpn, false);

            for (const { node } of depth_group) {
                for (const child of r.children) {
                    child.parent = node;
                    node.children.push(child);
                }
            }
        }
    }
}

function handleUnresolvedRoots(
    opt: TGO,
    sym: HCG3Symbol,
    roots: Node[],
    parent: Node,
    leaves: { node: Node, parent: Node; }[],
    tpn: Node[]
) {
    const items = roots.flatMap(i => i.items).setFilter(item_id);

    const node = createNode(opt, sym, items, parent);

    if (roots.length < 2) {

        /*  node.items = roots[0].items;
 
         processNode(opt, node, tpn, false);
 
         return;*/

        console.error(parent.debug);
        console.error(...roots.map(r => r.debug));
        throw new Error("Unexpected outcome: Single root interpreted as an unresolved root.");
    }

    setTransitionType(parent);

    const priority_ordered_roots = roots.sort((a, b) => b.priority - a.priority);

    // Try filtering out low priority roots 

    if (priority_ordered_roots[0].priority > 0) {
        const highest_priority_roots = priority_ordered_roots.filter(g => g.priority > 0);

        if (highest_priority_roots.length == 1) {

            node.items = highest_priority_roots[0].items.setFilter(item_id);

            processNode(opt, node, tpn, false);

            parent.depth += 60;


            parent.items = node.items.setFilter(item_id);

            return;
        } else {
            const items = highest_priority_roots.flatMap(r => r.items).setFilter();
            convertStateToFork(node, items, opt, tpn);
        }
    } else {

        //Resort to good ol' forks. 
        convertStateToFork(node, items, opt, tpn);
    }
}


function convertStateToFork(node: Node, items: Item[], opt: TGO, tpn: Node[]) {

    node.addType(TST.I_FORK);
    for (const fork_items of items.setFilter(item_id).group(s => s.state)) {

        const sym = fork_items[0].sym(GRAMMAR);

        const clone = node.clone();

        clone.sym = sym;

        clone.items = fork_items;

        processNode(opt, clone, tpn, false);

        clone.removeType(TST.I_FORK);

        /**
         * Wrapping each fork group into a clone of the fork allows
         * the state rendering pass to tree branch states and non-branching
         * states appropriately and produce correct hashes
         */

        clone.parent = node;

        node.children.push(clone);
    }
}

function symbolsOcclude(
    symA: string,
    symB: string,
    opt: TGO,
) {

    const
        sym_A = getSymbolFromUniqueName(GRAMMAR, symA),
        sym_B = getSymbolFromUniqueName(GRAMMAR, symB);

    if (
        Sym_Is_A_Production_Token(sym_A)
        ||
        Sym_Is_A_Generic_Identifier(sym_A)
        ||
        (opt.IS_SCANNER && Sym_Is_A_Generic_Symbol(sym_A))
        ||
        (
            Sym_Is_Defined_Identifier(sym_A)
            &&
            Sym_Is_Exclusive(sym_A)
        )
    ) {

        if (Sym_Is_A_Generic_Symbol(sym_A) && !opt.IS_SCANNER) return false;

        if (

            (Sym_Is_Defined_Identifier(sym_B) || (Sym_Is_Defined_Symbol(sym_B)))
            &&
            !Sym_Is_Exclusive(sym_B)
            &&
            SymbolsCollide(sym_A, sym_B, GRAMMAR)) {

            return true;
        }
    }

    return false;
}

function mergeOccludingGroups(
    opt: TGO,
    groups: Map<string, Node[]>
) {


    for (const [symA, groupA] of groups) {
        let seen = new WeakMap;
        const sym_A = getSymbolFromUniqueName(GRAMMAR, symA);

        for (const [symB, groupB] of groups) {

            if (symA == symB)
                continue;

            if (symbolsOcclude(symA, symB, opt)) {
                if (Sym_Is_A_Generic_Symbol(sym_A)) {
                    const min_item_length = Math.min(...groupB.map(g => g.root).flatMap(r => r?.items.flatMap(i => i.len) ?? [0]));
                    if (min_item_length < 2)
                        continue;
                }

                seen.set(groupB, new WeakSet(groupA));

                groupB.push(
                    ...groupA
                        //Remove states to prevent symbol overlapping
                        .map(g => g.clone())
                );
            }
        }

        //check for skipped occlusion

        //Only in production states as peek in scanner states has no purpose
        if (opt.IS_SCANNER)
            continue;

        /*    const skipped_symbol_groups = groupA.groupMap(g => getSkippableSymbolsFromItems(g.items, GRAMMAR));
   
           for (const [skipped_sym, group] of skipped_symbol_groups) {
               const skipped_id = getUniqueSymbolName(skipped_sym);
               for (const [symB, groupB] of groups) {
   
                   if (groupA == groupB)
                       continue;
   
                   if (symB == skipped_id) {
   
                       if (!seen.has(groupB))
                           seen.set(groupB, new WeakSet);
   
   
                       for (const node of group) {
   
                           if (true)
                               continue;
   
                           if (groupB.some(s =>
                               s.items[0].getProductionID(GRAMMAR) == node.items[0].getProductionID(GRAMMAR)
                           ))
                               continue;
   
                           if (seen.get(groupB).has(node))
                               continue;
   
                           seen.get(groupB).add(node);
   
                           const clone = node.clone();
   
                           console.log(symA, symB);
   
                           clone.addType(TST.I_SKIPPED_COLLISION);
   
                           //console.error(`ADD Skipped Collision ${skipped_id} \n-->\n${groupB[0].debug} \n-->\n${node.debug}`);
   
                           groupB.push(clone);
                       }
                   }
               }
           } */
    }
}

function createNodeClosure(
    opt: TGO,
    parent_node: Node,
    root: Node
): (this: undefined, value: Item, index: number, array: Item[]) => Node[] {

    return i => {

        const state = i.state;

        const nodes: Node[] = [];

        if (nonterm_item(i)) {

            const closure = [i], seen = new Set();

            for (const item of closure) {

                if (nonterm_item(item)) {

                    const prod = item.getProductionAtSymbol(GRAMMAR);

                    for (const item of getStartItemsFromProduction(prod)) {

                        if (seen.has(item.id))
                            continue;

                        seen.add(item.id);

                        closure.push(item.toState(state));
                    }

                } else {
                    seen.add(item.id);
                    nodes.push(createNode(opt, item.sym(GRAMMAR), [item], parent_node, closure, root.root));
                }

            }
        }
        else
            nodes.push(createNode(opt, i.sym(GRAMMAR), [i], parent_node, [], root.root));

        return nodes;
    };
}
function createTermedProductionCall(
    opt: TGO,
    symbol: TokenSymbol,
    production: ProductionSymbol,
    n_nonterm: Item[],
    parent: Node,
    tpn: Node[]
) {

    const intermediate = createNode(opt, symbol, n_nonterm, parent);

    intermediate.addType(TST.O_TERMINAL);

    createProductionCall(opt, production, n_nonterm, intermediate, tpn);
}

function createProductionCall(
    opt: TGO,
    production: ProductionSymbol,
    n_nonterm: Item[],
    parent: Node,
    tpn: Node[]
) {
    const prod_node = createNode(opt, production, n_nonterm, parent);

    prod_node.addType(TST.O_PRODUCTION);

    tpn.push(prod_node);
}


function createProdGroup(p: Item[]): ProductionGroup {
    return new ProductionGroup(p);
}

class ProductionGroup {
    group: Item[];
    closure: Item[];
    terms: Item[];
    ends: Item[];
    nonterms: Item[];

    constructor(p: Item[]) {
        const c = getClosure(p, GRAMMAR);
        this.group = p;
        this.closure = c;
        this.terms = c.filter(term_item);
        this.ends = c.filter(end_item);
        this.nonterms = c.filter(nonterm_item);
    }

    debug() {
        return {
            group: this.group.map(iDebug),
            closure: this.closure.map(iDebug),
            terms: this.terms.map(iDebug),
            ends: this.ends.map(iDebug),
            nonterms: this.nonterms.map(iDebug)
        };
    }
}

function productionStartsIntersect(
    production_groups: ProductionGroup[],
    term: Item[],
    opt: TGO
) {

    for (const group of production_groups) {

        if (group.ends.length != 0)
            //This production group contains end items and cannot be assumed to be independent
            return true;

        const global_symbols =
            [...term, ...production_groups.filter(g => g != group).flatMap(g => g.terms)].map(iToSymID).setFilter();

        if (
            !group.terms.map(iToSymID).every(a => !global_symbols.some(b => b == a || symbolsOcclude(a, b, opt)))
        ) {
            //We cannot call this production independently based on its terminal symbols
            return true;
        }
    }

    return false;
}

function iToSymID(i: Item): string {
    return gusn(item_sym(i));
}

function inc(i: Item): Item {
    return <Item>i.increment();
}

function nonRecursive(
    items: Item[],
    production: GrammarProduction
) {

    const closure = getClosure(items, GRAMMAR);

    return closure.filter(nonterm_item)
        .map(item_sym)
        .filter(Sym_Is_A_Production)
        .some(s => s.name == production.name);
}

export function createNode(
    options: TGO,
    sym: HCG3Symbol,
    items: Item[],
    parent: Node | null = null,
    closure: Item[] = [],
    root: Node | null = null
) {
    const node = new Node(sym, items, parent, closure, root);

    if (options.IS_SCANNER)
        node.addType(TST.I_SCANNER);

    return node;
}

export class Node {

    constructor(
        sym: HCG3Symbol,
        items: Item[],
        parent: Node | null = null,
        closure: Item[] = [],
        root: Node | null = null
    ) {

        this.type = TST.UNDEFINED;

        this.sym = sym;

        this.children = [];

        this.parent = parent;

        if (parent)
            parent.children.push(this);
        this.items = items.map(i => i.offset == 0 ? i.toState(this.depth) : i);

        this.depth = this.get_depth();
        this.closure = closure;//.map(i => i.toState(this.depth));

        this.root = root;

        this._prior = -1;
    }

    merge(node: Node) {
        this.children = node.children;
        this.type = node.type;
    }

    get priority(): number {

        if (this._prior < 0)
            this._prior = Math.max(0, this.items.reduce((r, i) => (i.body_(GRAMMAR)?.priority ?? 0) + r, 0));

        return this._prior;
    }

    get IS_MULTI(): boolean {
        return this.children.length > 1;
    }

    get states() {
        return this.children;
    }

    get symbols() {
        return [this.sym];
    }

    is(type: TST): boolean {
        return (this.type & type) == type;
    }

    addType(...types: TST[]) {
        this.type |= types.reduce((r, t) => r | t, 0);
    }

    removeType(...types: TST[]) {
        this.type ^= (this.type & types.reduce((r, t) => r | t, 0));
    }

    clone() {

        const node = new Node(
            this.sym,
            this.items.slice(),
            null,
            this.closure.slice(),
            this.root
        );

        node.type = this.type;
        node.depth = this.depth;

        return node;
    }

    get_depth() {
        if (this.parent)
            return this.parent.depth + 1;
        else return 1;
    }

    clearPeek() {
        if (this.is(TST.O_PEEK)) {
            this.removeType(TST.O_PEEK);
            this.addType(TST.O_TERMINAL);
            this.addType(TST.I_CONSUME);
            if (this.parent)
                this.parent.clearPeek();
        }
    }

    pruneLeaf() {
        if (this.parent) {
            let index = this.parent.children.indexOf(this);
            if (index >= 0) {
                this.parent.children.splice(index, 1);
                return this.parent;
            }
        }
        return this;
    }

    pruneBranch(): Node {
        if (this.parent) {
            const parent = this.parent;
            let index = parent.children.indexOf(this);
            if (index >= 0) {
                parent.children.splice(index, 1);
                this.parent = null;
                if (parent.children.length == 0)
                    return parent.pruneBranch();
                return parent;
            }
        }
        return this;
    }

    getNodeAtDepth(depth: number): Node | null {

        if (this.depth == depth)
            return this;

        if (this.parent)
            return this.parent.getNodeAtDepth(depth);

        return null;
    }

    addChild(child: Node) {
        this.children.push(child);
    }

    hasState(state: number) {
        for (const i of this.items)
            if (i.state == state)
                return true;

        return false;
    }
    /**
     * Remove duplicate item entries in this nodes closure.
     * 
     * If PRESERVE_STATE is true then consider items that differ 
     * only in the state value as unique. 
     * 
     */
    makeClosureUnique(PRESERVE_STATE: boolean = false) {
        if (PRESERVE_STATE)
            this.closure = this.closure.setFilter(i => i.id + "|" + i.state);
        else
            this.closure = this.closure.setFilter(item_id);

        this.items = this.items.setFilter(i => i.id + "|" + i.state);
    }

    get debug(): string {
        return `
[${this.depth}] [${gusn(this.sym)}] [${getTypeValue(this.type)}]${this.root ? `\n  r: [${this.root.depth}] [${gusn(this.root.sym)}] [${getTypeValue(this.root.type)}]` : ""}
items:
${itemsDebug(this.items.setFilter(item_id)).join("\n")}
closure:
${itemsDebug(this.closure.setFilter(item_id)).join("\n")} 
${this.children.flatMap(c => c.debug.split("\n")).join("\n  ")}
`;
    }

    get non_terminal_items() {
        return this.items.filter(nonterm_item);
    }

    get terminal_items() {
        return this.items.filter(term_item);
    }

    get end_items() {
        return this.items.filter(i => i.atEND);
    }

    scanItems(IGNORE_STATE: boolean = false): Item[] {

        let items = this.end_items.slice();

        let out = [], seen = new Set;

        let i = 0;

        for (const item of items) {

            if (seen.has(item.id))
                continue;

            seen.add(item.id);

            const state = item.state;

            const production = item.getProductionID(GRAMMAR);

            let node: Node | null = this;

            let INCREMENTED = false;

            while (node) {


                if (node.hasState(state)) {

                    const production_items = <Item[]>node.closure

                        .filter(nonterm_item)
                        .filter(i => (IGNORE_STATE || i.state == state) && production == i.getProductionAtSymbol(GRAMMAR).id)

                        .map(inc);

                    if (production_items.length > 0) {
                        INCREMENTED = true;
                        for (const item of production_items) {
                            if (item.atEND) {
                                items.push(item);
                            } else {
                                out.push(item);
                            }
                        }

                        if (!IGNORE_STATE)
                            break;
                    }
                }

                node = node.parent;
            }

            if (IGNORE_STATE && !INCREMENTED) {
                out.push(item);
            }
        }

        return out.setFilter(item_id);
    }

    sym: HCG3Symbol;
    items: Item[];
    children: Node[];
    parent: Node | null;
    depth: number;
    closure: Item[];
    root: Node | null;
    hash_action?: { hash: string, action: string, assertion: string; };
    private type: TST;
    private _prior: number;
}

function getTypeValue(type: TST) {
    const names = [];


    for (const key in TST) {
        const v = <number><any>TST[key];

        if (v > 0) {

            if (v & type)
                names.push(key);
        }
    }

    if (names.length == 0)
        return "UNDEFINED";

    return names.join(" ");
}

function itemsDebug(i: Item[]): string[] {
    return i.map(iDebug);
}

function iDebug(i: Item): string {
    return i.rup(GRAMMAR);
}

function nonterm_item(i: Item) {
    return !i.atEND && Sym_Is_A_Production(i.sym(GRAMMAR));
}

function term_item(i: Item) {
    return !i.atEND && !Sym_Is_A_Production(i.sym(GRAMMAR));
}

function end_item(i: Item) {
    return i.atEND;
}

function item_sym(i: Item) {
    return i.atEND ? default_DEFAULT : i.sym(GRAMMAR);
}

function item_id(i: Item) {
    return i.id;
}
