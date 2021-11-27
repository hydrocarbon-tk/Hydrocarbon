/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import {
    default_EOF,
    getClosure,
    getProductionClosure,
    getStartItemsFromProduction,
    getSymbolFromUniqueName,
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
    Sym_Is_A_Production,
    Sym_Is_A_Production_Token,
    Sym_Is_Defined_Identifier, Sym_Is_Exclusive,
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

    GRAMMAR = grammar;

    const production_items = getStartItemsFromProduction(production);

    options.goto_items = [];

    options.root_production = production;

    options.ambig_ids = new Set;

    const node = createNode(options, default_EOF, production_items);

    let tpn: Node[] = [];

    node.addType(TST.I_DESCENT_START);

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

    options.ambig_ids = new Set;

    const goto_state = processGoto(options, goto_items);

    goto_state.addType(TST.I_GOTO_START);

    return goto_state;
}

function getOuterScopeGotoItems(grammar: GrammarObject, seen: Set<number>, i: Item, out: Item[] = []) {

    out.push(i);

    const id = i.getProductionAtSymbol(grammar).id;

    if (!seen.has(id) && i.increment()?.atEND) {

        let id = i.getProductionAtSymbol(grammar).id;

        seen.add(id);

        out.push(...(grammar.lr_items?.get(id) ?? []).flatMap(s => getOuterScopeGotoItems(grammar, seen, s)));
    }

    return out;
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

    parent = createNode(options, default_EOF, goto_items);

    const nodes: Node[] = [];

    for (const [id, group] of goto_item_map) {

        if (id == options.root_production.id) {
            // Check for any existing productions that can be confused
            // with this one.
            const seen: Set<number> = new Set;

            const new_group = [
                ...group,
                ...getProductionFollowThrough(id, seen)
                    .map(i => i.toState(OutOfScopeItemState))
            ].setFilter(item_id);

            if (group.length > 0 && new_group.length > group.length) {
                //This will default to a peek
                const
                    items = <Item[]>new_group.map(inc),
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

                createPeek(options, node, items, nodes);

                node.addType(TST.O_GOTO);

                continue;
            }
        }

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

        processNode(options, node, nodes, false);
    }

    let v = null;

    while ((v = nodes.shift()))
        processNode(options, v, nodes);

    return parent;
}

function getProductionFollowThrough(id: number, seen: Set<number>): Item[] {
    const seen_ids = new Set([id]);

    let items: Item[] = [];

    for (const id of seen_ids) {

        const lr_items = GRAMMAR.lr_items?.get(id);

        if (lr_items) {
            const outer_scope = lr_items.flatMap(s => getOuterScopeGotoItems(GRAMMAR, seen, s));

            const filtered = outer_scope;

            const end = filtered.filter(i => (<Item>i.increment()).atEND);
            items.push(...filtered.filter(i => !(<Item>i.increment()).atEND));

            for (const end_item of end)
                seen_ids.add(end_item.getProductionID(GRAMMAR));

        }
    }

    return items.setFilter(item_id).filter(i => (i.getProductionID(GRAMMAR) != id));
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

    const n_term = items.filter(term_item);

    let n_nonterm = items.filter(nonterm_item);

    const n_end = items.filter(end_item);

    if (n_nonterm.length > 0) {

        //Remove direct left recursive items
        n_nonterm = n_nonterm
            .filter(i => i.offset > 0 || i.getProductionAtSymbol(GRAMMAR).name != opt.root_production.name);

        const productions: ProductionSymbol[] =
            <any[]>n_nonterm.map(get_sym).setFilter(gusn);


        // If all the non-terminal items are the same 
        // and there are no terminal items then
        // we can do a production call provided that
        // the production does not loop back into the 
        // host production. 
        if (n_term.length == 0
            && n_end.length == 0
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

                if (canCall(p_groups, n_term, opt.root_production)) {
                    // Each production group consume an independent set of terminal
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
            processFirstEndItem(
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
function createPeek(
    opt: TGO,
    parent: Node,
    items: Item[],
    tpn: Node[]
) {

    parent.closure = [];
    parent.items = [];

    const out_of_scope = new Set(items.filter(i => i.state == OutOfScopeItemState).map(i => i.id));

    let end_item = 0;

    let collapsed_closure: Item[] = [];

    if (opt.scope == "GOTO") {
        collapsed_closure.push(...[...(GRAMMAR.lr_items?.values() ?? [])].flat()
            .filter(i => !out_of_scope.has(i.increment()?.id ?? "")));
    } else {

        collapsed_closure.push(...(GRAMMAR.lr_items?.get(opt.root_production.id) ?? []).filter(i => i.getProductionID(GRAMMAR) != opt.root_production.id));

        let n: null | Node = parent;

        while (n) {
            collapsed_closure.push(...n.closure);
            n = n.parent;
        }
    }

    collapsed_closure = collapsed_closure.setFilter(item_id);

    //separate node into a set of groups
    const roots = items.setFilter(item_id).group(s => {
        if (s.state == OutOfScopeItemState)
            return "out-of-scope-state-" + iToSymID(s);
        if (s.atEND) {
            return "end" + end_item++;
        } else {
            return iToSymID(s);
        }
    }).map((g, j) => {

        const state = 10000 * (j + 1);
        const items = g.map(i => i.toState(state)).setFilter(item_id);

        const n = createNode(opt, item_sym(g[0]), items, null);

        n.closure = getClosure(items, GRAMMAR, state);
        n.depth = state;
        n.root = n;

        parent.closure.push(
            ...collapsed_closure.map(i => i.toState(state))
        );

        if (g[0].state != OutOfScopeItemState)
            parent.closure.push(...collapsed_closure.map(i => i.toState(state)));

        parent.items.push(...items);

        if (g[0].state == OutOfScopeItemState) {
            n.addType(TST.I_OUT_OF_SCOPE);
        }

        return n;
    });

    disambiguate(
        opt,
        roots.flatMap((r, j) => {

            const nodes = r.items.flatMap(createNodeClosure(opt, parent, r));

            for (const node of nodes)
                node.depth = r.depth;

            return nodes;
        }), roots, tpn, [], parent);

    parent.items = parent.items.setFilter(item_id);

    //Allow resource to be garbage collected
    parent.closure.length = 0;
}
function disambiguate(
    opt: TGO,
    nodes: Node[],
    roots: Node[],
    tpn: Node[],
    ids: string[] = [],
    root: Node,
    depth: number = 0
) {
    // We are starting with a set of nodes, each representing either
    // a terminal symbol or an item in the end position. 
    // Each node has a common parent. 

    const end_nodes = nodes.filter(n => n.end_items.length > 0);
    const term_nodes = nodes.filter(n => n.end_items.length == 0);


    if (end_nodes.length > 0) {

        // Detect if else conflicts and find in favo


        // We must first complete end-items and generate new
        // nodes that arise from the completion of a production. 

        const final_nodes: Node[] = [];

        for (const node of end_nodes) {

            const items = node.scanItems();

            if (items.length > 0) {
                const parent = <Node>node.parent;
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

        // If an end-item is in a state such that it is top most production
        // and cannot be resolved to any other items, then we shall call 
        // that a FINAL item. If more than one FINAL item is present
        // then we have a GENERAL ambiguity that may only be resolved
        // through the issuance of a fork state. 

        if (final_nodes.length > 1) {
            const roots = <Node[]>final_nodes
                .map(s => <Node>s.root)
                .setFilter(s => s.items.map(item_id).sort().join("|"));

            if (roots.length == 1) {
                final_nodes.slice(1).map(s => s.pruneLeaf());

                const node = final_nodes[0];

                setTransitionType(node);

                if (roots[0].is(TST.I_OUT_OF_SCOPE)) {

                    node.addType(TST.I_OUT_OF_SCOPE);
                } else {
                    completeRoots(node, roots[0], opt, tpn);
                }
            } else {
                const parent = final_nodes.map(s => s.pruneLeaf())[0];

                handleUnresolvedRoots(opt, final_nodes[0].sym, roots, parent, tpn);
            }

        } else if (final_nodes.length > 0) {

            const final_node = final_nodes[0];

            setTransitionType(final_node);

            completeRoots(final_node, root, opt, tpn);
        }
    }

    const next_steps: Node[][] = [];

    if (term_nodes.length > 0 && term_nodes.every(t => t.root?.is(TST.I_OUT_OF_SCOPE))) {

        const parents = term_nodes.map(s => s.pruneBranch());
        const parent = parents[0];

        parent.addType(TST.I_FAIL);

        return;
    } else if (term_nodes.length == 0) {
        return;
    }

    const groups = term_nodes.groupMap(n => gusn(n.sym));

    mergeOccludingGroups(groups);

    for (const [, group] of groups) {

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
                    //  prime_node.items = prime_node.items.setFilter(i => i.id);
                    prime_node.closure.push(...node.closure);
                }

                new_groups.push(...node.items
                    .map(inc).flatMap(createNodeClosure(opt, prime_node, <Node>node.root)));
            }

            if (new_groups.length == 0) {
                if (group.every(i => i.root?.is((TST.I_OUT_OF_SCOPE)))) {
                    completeRoots(prime_node, root, opt, tpn);
                } else {
                    throw new Error(
                        "Invalid state, unable to continue disambiguating \n"
                        +
                        group.map(i => i.root?.debug).setFilter().join("\n")
                    );
                }
            } else {
                next_steps.push(new_groups);
            }

            prime_node.items = prime_node.items.setFilter(item_id);

        } else {

            for (const node of group) {
                if (node != prime_node) {
                    node.pruneLeaf();
                    prime_node.items.push(...node.items);
                    prime_node.closure.push(...node.closure);
                }
            }

            prime_node.items = prime_node.items.setFilter(item_id);

            completeRoots(prime_node, root, opt, tpn);
        }
    }

    for (let step of next_steps) {

        const id = getNodesId(step);

        if (step.length > 0) {

            //Check for shift-reduce conflicts
            if (handleShiftReduceConflicts(opt, step, roots, tpn, root, depth)) {
                continue;
            } else if ((ids.includes(id)) /* || depth > 2 */) {
                handleTransitionCollision(step, opt, tpn);
            } else {
                disambiguate(opt, step, roots, tpn, ids.concat(id), root, depth + 1);
            }
        }
    }
}
function handleShiftReduceConflicts(
    opt: TGO,
    step: Node[],
    roots: Node[],
    tpn: Node[],
    root: Node,
    depth: number
): boolean {
    const candidate_roots = step.map(s => <Node>s.root).setFilter(r => r.depth);
    if (candidate_roots.every(r => r.items.length == 1)) {
        const prod = candidate_roots[0].items[0].getProductionID(GRAMMAR);
        if (candidate_roots.every(r => r.items[0].getProductionID(GRAMMAR) == prod)) {
            if (candidate_roots.length == 2) {
                if (candidate_roots.some(r => r.items[0].atEND) && candidate_roots.some(r => !r.items[0].atEND)) {
                    const winner = candidate_roots.filter(r => !r.items[0].atEND)[0];
                    const loser = candidate_roots.filter(r => r.items[0].atEND)[0];
                    //console.log(`Favoring shift of:\n\t${winner.items[0].rup(GRAMMAR)}\nOver reduce of:\n\t${loser.items[0].rup(GRAMMAR)}\n\n`);

                    const prime_node = step[0];

                    setTransitionType(prime_node);

                    for (const node of step) {
                        if (node != prime_node) {
                            node.pruneLeaf();
                            if (node.root == winner) {
                                prime_node.items.push(...node.items);
                                prime_node.closure.push(...node.closure);
                            }
                        }
                    }

                    prime_node.items = prime_node.items.setFilter(item_id);

                    completeRoots(prime_node, root, opt, tpn);

                    return true;
                }
            }
        }
    }
    return false;
}

function setTransitionType(node: Node) {
    if ((node.depth % 10000) > 0 && node.depth >= 10000)
        node.addType(TST.O_PEEK);
    else
        node.addType(TST.O_TERMINAL);
}

function handleTransitionCollision(step: Node[], options: TGO, tpn: Node[]) {

    if (options.IS_SCANNER) {

    } else {

        const roots = step.map(s => <Node>s.root).setFilter(s => s.items.map(item_id).sort().join("|"));

        const sym = step[0].sym;
        const parent = <Node>step.map(s => s.pruneBranch())[0];

        handleUnresolvedRoots(options, sym, roots, parent, tpn);
    }
}

function completeRoots(
    node: Node,
    parent: Node,
    opt: TGO,
    tpn: Node[]
) {
    const root = (<Node>node.root).clone();

    if (root.is(TST.I_OUT_OF_SCOPE)) {

        node.addType(TST.I_FAIL, TST.I_OUT_OF_SCOPE);

    } else if (opt.IS_SCANNER) {

        node.clearPeek();

        processNode(opt, node, tpn, false);

    } else {
        const r = (<Node>node.root).clone();
        r.items = r.items.map(i => i.toState(parent.depth + 1));
        r.depth = parent.depth;
        r.parent = node;

        processNode(opt, r, tpn, false);

        for (const child of r.children) {
            child.parent = node;
            node.children.push(child);
        }
    }
}

function getNodesId(step: Node[]) {
    return step.map(i => i.items.setFilter(i => i.id).map(i => i.id).sort().join("-")).sort().setFilter().join("|");
}

function handleUnresolvedRoots(
    opt: TGO,
    sym: HCG3Symbol,
    roots: Node[],
    parent: Node,
    tpn: Node[]
) {

    //const sym = parent.sym;

    const items = roots.flatMap(i => i.items).setFilter(item_id);

    const node = createNode(opt, sym, items, parent);


    if (roots.length < 2) {

        /*  node.items = roots[0].items;
 
         processNode(opt, node, tpn, false);
 
         return;*/

        console.log(parent.debug);
        console.log(...roots.map(r => r.debug));
        throw new Error("Unexpected outcome: Single root interpreted as an unresolved root.");
    }

    setTransitionType(parent);
    if (roots.some(r => r.is(TST.I_OUT_OF_SCOPE))) {
        // We are parsing the root production GOTO
        // and are encountering production out of the 
        // root production scope that have a series
        // of tokens that are ambiguous with the
        // current production.
        // 
        // At this point, simplest course of action is to 
        // create a fork that attempts to consume more tokens that
        // may be part of this production,
        // and failing that we use a trivial fail fork, 
        // allowing the fail state to unset the fail mode and
        // pass the already completed production.

        if (roots.every(r => r.is(TST.I_OUT_OF_SCOPE))) {
            //Prune and set parent to fail
            const parent = roots.map(r => r.pruneBranch())[0];
            parent.addType(TST.I_FAIL);
            node.addType(TST.I_FAIL);
            return;
        }

        //Remove out of scope roots.
        const oos_roots = roots.filter(r => r.is(TST.I_OUT_OF_SCOPE));
        const is_roots = roots.filter(r => !r.is(TST.I_OUT_OF_SCOPE));
        const items = is_roots.flatMap(i => i.items).setFilter(item_id);

        //Resort to good ol' forks. 
        node.addType(TST.I_FORK);

        convertStateToFork(node, items, opt, tpn);
        createFailState(opt, node, oos_roots.flatMap(r => r.items).setFilter(item_id));

    } else {

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

    return;
    /* node.type |= ;

    if (!options.depth)
        options.depth = 0;



    try {
        options.depth++;
        processLoopBackNode(options, node, tpn);
        options.depth--;

    } catch (e) {

        options.depth--;

        if (options.depth > 0) {
            throw e;
        }

        node.type |= TransitionStateType.FORK;

        console.log(e);
    }


    //const id = getNodesId(roots);
    debugger; */
}


function convertStateToFork(node: Node, items: Item[], opt: TGO, tpn: Node[]) {

    node.addType(TST.I_FORK);
    for (const fork_items of items.setFilter(item_id).group(s => s.state)) {

        const sym = fork_items[0].sym(GRAMMAR);

        const clone = node.clone();

        clone.sym = sym;

        clone.items = fork_items;

        processNode(opt, clone, tpn, false);

        /**
         * Wrapping each fork group into a clone of the fork allows
         * the state rendering pass to tree branch states and non-branching
         * states appropriately and produce correct hashes
         */
        //clone.removeType(TST.I_FORK);

        clone.parent = node;

        node.children.push(clone);
    }
}

function createFailState(opt: TGO, parent: Node, items: Item[] = []): Node {
    const node = createNode(opt, default_EOF, items, parent);
    node.addType(TST.I_FAIL);
    return node;
}

/* function processLoopBackNode(opt: TGO, node: Node, tpn: Node[]) {

    const id = getNodesId([node]);

    if (!opt.ambig_ids.has(id)) {

        opt.ambig_ids.add(id);

        const closure = getClosure(node.items, GRAMMAR);

        const terminals = closure.filter(term_item);

        const non_terminals = closure.filter(nonterm_item);

        const debug_term = terminals.map(iDebug);

        const debug_nonterm = non_terminals.map(iDebug);

        //process terminal items

        const term_node = createNode(opt, node.sym, terminals, node.parent, closure);

        term_node.depth = 0;

        tpn.push(term_node);

        const parent = processGoto(opt, non_terminals, opt);

        node.children.push(parent);
    } else {
        throw new Error("Invalid Parse Path");
    }

    debugger;
} */
function mergeOccludingGroups(
    groups: Map<string, Node[]>
) {
    for (const [symA, groupA] of groups) {
        const sym_A = getSymbolFromUniqueName(GRAMMAR, symA);
        if (
            Sym_Is_A_Production_Token(sym_A)
            ||
            Sym_Is_A_Generic_Identifier(sym_A)
            ||
            (
                Sym_Is_Defined_Identifier(sym_A)
                &&
                Sym_Is_Exclusive(sym_A)
            )
        ) {
            for (const [symB, groupB] of groups) {

                if (symA == symB)
                    continue;

                const sym_B = getSymbolFromUniqueName(GRAMMAR, symB);

                if (

                    Sym_Is_Defined_Identifier(sym_B)
                    &&
                    !Sym_Is_Exclusive(sym_B)
                    &&
                    SymbolsCollide(sym_A, sym_B, GRAMMAR)) {

                    groupB.push(
                        ...groupA
                            //Remove states to prevent symbol overlapping
                            .map(g => g.clone())
                    );
                }
            }
        }
    }
}

function createNodeClosure(
    opt: TGO,
    parent_node: Node,
    root: Node
): (this: undefined, value: Item, index: number, array: Item[]) => Node[] {

    const EXCLUDE_ROOT = root.is(TST.I_OUT_OF_SCOPE);

    const id = opt.root_production.id;
    return i => {

        const nodes: Node[] = [];

        if (nonterm_item(i)) {

            const closure = [i], seen = new Set();

            for (const item of closure) {

                if (nonterm_item(item)) {

                    const prod = item.getProductionAtSymbol(GRAMMAR);

                    if (EXCLUDE_ROOT && prod.id == id) {
                        continue;
                    }

                    for (const item of getStartItemsFromProduction(prod)) {

                        if (seen.has(item.id))
                            continue;

                        seen.add(item.id);

                        closure.push(item);
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

function processFirstEndItem(
    options: TGO,
    node: Node,
    end_item: Item,
) {

    const new_node = createNode(options, default_EOF, [end_item], node);

    options.goto_items.push(end_item);

    new_node.addType(TST.I_END, TST.O_TERMINAL);
}

function incrementTerminals(
    options: TGO,
    node: Node,
    items: Item[],
    to_process_nodes: Node[]
) {

    const symbol_groups = items.filter(i => i.state !== OutOfScopeItemState).group(iToSymID);

    for (const group of symbol_groups) {

        const new_node = createNode(options, item_sym(group[0]), group, node);

        new_node.addType(TST.O_TERMINAL, TST.I_CONSUME);

        to_process_nodes.push(new_node);
    }
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

function canCall(
    production_groups: ProductionGroup[],
    term: Item[],
    production: GrammarProduction,
) {
    for (const group of production_groups) {

        const global_terms = [...term, ...production_groups.filter(g => g != group).flatMap(g => g.terms)].groupMap(iToSymID);

        if (!(
            group.ends.length == 0
            &&
            group.terms.map(iToSymID).every(i => !global_terms.has(i)))
        ) {
            //We can call this production based on its terminal symbols
            return false;
        }

    }
    return true;
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

    get debug(): string {
        return `
[${this.depth}] [${gusn(this.sym)}] [${getTypeValue(this.type)}]
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

    scanItems(): Item[] {

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

            while (node) {

                if (node.hasState(state)) {

                    const production_items = <Item[]>node.closure
                        .filter(nonterm_item)
                        .filter(i => i.state == state && production == i.getProductionAtSymbol(GRAMMAR).id)
                        .map(inc);

                    if (production_items.length > 0) {

                        for (const item of production_items) {
                            if (item.atEND) {
                                items.push(item);
                            } else {
                                out.push(item);
                            }
                        }


                        break;
                    } else {
                        node = node.parent;
                    }

                } else {
                    node = node.parent;
                }
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
    return i.atEND ? default_EOF : i.sym(GRAMMAR);
}

function item_id(i: Item) {
    return i.id;
}
