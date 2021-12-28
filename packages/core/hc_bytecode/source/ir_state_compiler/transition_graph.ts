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
    Sym_Is_A_Generic_Type,
    Sym_Is_A_Production,
    Sym_Is_A_Production_Token,
    Sym_Is_DEFAULT,
    Sym_Is_Defined,
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

    options.branch_cache = new Map;



    const node = createNode(options, default_DEFAULT, production_items);

    let tpn: Node[] = [];

    node.addType(TST.I_DESCENT_START);

    options.root = node;

    processNode(options, node, tpn, false);

    let v = null;
    let i = 0;

    while ((v = tpn.shift())) {
        i++;
        processNode(options, v, tpn);
    }

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

    parent = createNode(options, default_DEFAULT, goto_items);

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

        // If all the non-terminal items are the same 
        // and there are no terminal items then
        // we can do a production call provided that
        // the production does not loop back into the 
        // host production. 
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

function getShiftOnlyItems(items: Item[]) {
    return items.filter(i => {
        if (!i.atEND)
            return true;
        const segment = i.renderUnformatted(GRAMMAR);
        for (const item of items) {
            if (item.atEND)
                continue;

            if (item.body_ == i.body_
                &&
                item.renderUnformatted(GRAMMAR).indexOf(segment) == 0)
                return false;

        }

        return true;
    });
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

        node.closure = [...new_items, end_item];

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
    items: Item[],
    tpn: Node[]
) {

    const out_of_scope = new Set(items.filter(i => i.state == OutOfScopeItemState).map(i => i.id));

    let end_item = 0;

    let collapsed_closure: Item[] = [];

    if (opt.scope == "GOTO" || true) {
        collapsed_closure.push(...[...(GRAMMAR.lr_items?.values() ?? [])].flat()
            .filter(i => !out_of_scope.has(i.increment()?.id ?? "")));
    } else {

        collapsed_closure.push(...(GRAMMAR.lr_items?.get(opt.root_production.id) ?? [])
            .filter(i => i.getProductionID(GRAMMAR) != opt.root_production.id));

        let n: null | Node = parent;

        while (n) {
            collapsed_closure.push(...n.closure);
            n = n.parent;
        }
    }

    //parent.closure = [];
    parent.items = [];

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

    const leaves: { node: Node, parent: Node; }[] = [];

    disambiguate(
        opt,
        roots.flatMap((r, j) => {

            const nodes = r.items.flatMap(createNodeClosure(opt, parent, r));


            let out = [];
            //Combine nodes with the same symbol
            const groups = nodes.group(n => getUniqueSymbolName(n.sym));

            for (const group of groups) {

                const primary = group[0];

                for (const node of group.slice(1)) {
                    primary.items.push(...node.items);
                    primary.closure.push(...node.closure);
                    primary.makeClosureUnique();
                }


                out.push(primary);
            }

            //out = nodes;

            for (const node of out) node.depth = r.depth;

            if (opt.IS_SCANNER)
                out.forEach(n => { if (!Sym_Is_DEFAULT(n.sym)) { n.addType(TST.I_CONSUME); } });

            return nodes;
        }), roots, tpn, leaves, [], parent);

    parent.items = parent.items.setFilter(item_id);


    completeLeaves(opt, tpn, leaves);

    //Allow resource to be garbage collected
    //parent.closure.length = 0;
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
    roots: Node[],
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
                    gatherLeaves(node, roots[0], leaves);
                }
            } else {
                const parent = final_nodes.map(s => s.pruneLeaf())[0];

                handleUnresolvedRoots(opt, final_nodes[0].sym, roots, parent, tpn);
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

                    prime_node.closure.push(...node.closure);

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
                next_steps.push(new_groups);
            }

            prime_node.items = prime_node.items.setFilter(item_id);

        } else {

            for (const node of group) {

                if (node != prime_node) {

                    node.pruneLeaf();

                    prime_node.items.push(...node.items);

                    prime_node.closure.push(...node.closure);

                    prime_node.makeClosureUnique();
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

        // console.log(total_time, prev_time);

        if (step.length > 0) {

            if (handleShiftReduceConflicts(opt, step, roots, tpn, leaves, root, depth)) {

                continue;
            } else if ((ids.includes(id)) /* || depth > 2 */ || total_time > 300) {
                if (total_time > 300)
                    console.error("TIMED OUT");
                handleTransitionCollision(step, opt, tpn);
            } else {
                disambiguate(opt, step, roots, tpn, leaves, ids.concat(id), root, depth + 1, total_time);
            }
        }
    }

}
function handleShiftReduceConflicts(
    opt: TGO,
    step: Node[],
    roots: Node[],
    tpn: Node[],
    leaves: { node: Node, parent: Node; }[],
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
                                prime_node.makeClosureUnique(true);
                            }
                        }
                    }

                    prime_node.items = prime_node.items.setFilter(item_id);

                    //completeLeaves(opt, tpn, [{ node: prime_node, parent: root }]);

                    gatherLeaves(prime_node, root, leaves);

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

    //for (const leaf of leaves)
    //    console.error(leaf.debug);

    for (const depth_group of leaves.group(({ node: l }) => l.root)) {
        //Join group into one common parent

        const { node: first_node, parent: first_parent } = depth_group[0];

        const central = first_node.clone();
        central.items = depth_group.flatMap(d => d.node.items).setFilter(item_id);
        central.closure = depth_group.flatMap(d => d.node.closure).setFilter(item_id);

        const root = central.root;

        const cid = getClosureId([central]);

        if (!root)
            throw new Error("Root is not defined");

        /* for (const { node, parent } of depth_group) {
            //if (node.parent !== parent)
            //    throw new Error("Unexpected: Node is not child of parent");
            if (node.root !== root)
                throw new Error("Invalid use of mixed roots!");
        } */

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
                    parent.addType(TST.I_TEST);
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

                    if (node.items.some(i => i.atEND)) {
                        node.removeType(TST.I_CONSUME);
                        //processEndItem(opt, node, node.items[0]);
                        processNode(opt, node, tpn, false);
                    } else {

                        if (!Sym_Is_DEFAULT(node.sym))
                            node.addType(TST.I_CONSUME);

                        node.depth = (parent.depth + 1) % 10000;


                        node.closure.push(...getClosure(node.items, GRAMMAR), ...node.items);

                        node.closure = node.closure.setFilter(item_id);

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

            //opt.branch_cache.set(cid, central);
        }
    }
}

function getNodesId(step: Node[]) {
    return step.map(i => i.items.setFilter(i => i.id).map(i => i.id).sort().join("-")).sort().setFilter().join("|");
}

function getClosureId(step: Node[]) {
    return step.map(i => i.closure.setFilter(i => i.id).map(i => i.id).sort().join("-")).sort().setFilter().join("|");
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

        clone.parent = node;

        node.children.push(clone);
    }
}

function createFailState(opt: TGO, parent: Node, items: Item[] = []): Node {
    const node = createNode(opt, default_DEFAULT, items, parent);
    node.addType(TST.I_FAIL);
    return node;
}

function mergeOccludingGroups(
    opt: TGO,
    groups: Map<string, Node[]>
) {

    for (const [symA, groupA] of groups) {
        let seen = new WeakMap;
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

                    seen.set(groupB, new WeakSet(groupA));

                    groupB.push(
                        ...groupA
                            //Remove states to prevent symbol overlapping
                            .map(g => g.clone())
                    );
                }
            }
        }

        //check for skipped occlusion

        //Only in production states as peek in scanner states has no purpose
        if (opt.IS_SCANNER)
            continue;

        const skipped_symbol_groups = groupA.groupMap(g => getSkippableSymbolsFromItems(g.items, GRAMMAR));

        for (const [skipped_sym, group] of skipped_symbol_groups) {
            const skipped_id = getUniqueSymbolName(skipped_sym);
            for (const [symB, groupB] of groups) {

                if (groupA == groupB)
                    continue;

                if (symB == skipped_id) {

                    if (!seen.has(groupB))
                        seen.set(groupB, new WeakSet);


                    for (const node of group) {

                        if (!(node.root?.is(TST.I_OUT_OF_SCOPE)))
                            continue;

                        if (groupB.some(s =>
                            s.items[0].getProductionID(GRAMMAR) == node.items[0].getProductionID(GRAMMAR)
                        ))
                            continue;

                        if (seen.get(groupB).has(node))
                            continue;

                        seen.get(groupB).add(node);

                        const clone = node.clone();

                        clone.addType(TST.I_SKIPPED_COLLISION);

                        //console.error(`ADD Skipped Collision ${skipped_id} \n-->\n${groupB[0].debug} \n-->\n${node.debug}`);

                        groupB.push(clone);
                    }
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
