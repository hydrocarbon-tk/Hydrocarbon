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
    Sym_Is_Defined_Identifier,
    Sym_Is_Exclusive,
    Token,
    TokenSymbol,
} from '@hctoolkit/common';
import { TransitionGraphOptions as TGO } from '../types/transition_graph_options';
import { TransitionStateType as TST } from '../types/transition_tree_nodes';

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

    options.mode = "GOTO";

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

            let items = lr_items.get(id);

            output.set(id, items);
            batch.push(...items.map(i => i.getProductionID(grammar)));
        }
    }

    return output;
}

function processGoto(options: TGO, goto_items: Item[], parent = null): Node {

    const goto_item_map = getGotoSTARTs(options.root_production, goto_items, GRAMMAR);

    parent = createNode(options, default_EOF, goto_items);

    const nodes = [];

    for (const [id, group] of goto_item_map) {

        if (id == options.root_production.id) {
            // Check for any existing productions that can be confused
            // with this one.
            const seen: Set<number> = new Set;

            const new_group = [...group, ...(
                (
                    GRAMMAR.lr_items.get(id)
                        ?.flatMap(s => getOuterScopeGotoItems(GRAMMAR, seen, s))
                        //Prevent self intersection
                        .filter(i => (i.getProductionID(GRAMMAR) != id) || i.offset != 0)
                        .map(i => i.toState(OutOfScopeItemState))
                        .filter(i => !i.increment().atEND)
                ) ?? []
            )].setFilter(item_id);

            if (new_group.length > group.length) {
                //This will default to a peek
                const
                    items = new_group.map(inc),
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

                createPeek(options, node, items, nodes);

                continue;
            }
        }

        const
            items = group.map(inc),
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

function get_sym(i: Item) {
    return i.sym(GRAMMAR);
}

function processNode(
    opt: TGO,
    node: Node,
    /** To Process Nodes */
    tpn: Node[],
    INCREMENT = true
) {

    let items = node.items.slice();

    if (INCREMENT)
        items = items.map(
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

    let end_item = 0;

    //separate node into a set of groups
    const roots = items.group(s => {
        if (s.state == OutOfScopeItemState)
            return "out-of-scope-state-" + iToSymID(s);
        if (s.atEND) {
            return "end" + end_item++;
        } else {
            return iToSymID(s);
        }
    }).map((g, j) => {

        const state = 10000 * (j + 1);
        const items = g.map(i => i.toState(state));

        const n = createNode(opt, item_sym(g[0]), items, null);

        parent.items.push(...items);
        n.closure = getClosure(items, GRAMMAR, state);
        n.depth = state;
        n.root = n;

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
            return nodes.map(n => (n.closure.push(...r.closure), n));


        }), roots, tpn, [], parent);
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

        // We must first complete end-items and generate new
        // nodes that arise from the completion of a production. 

        const final_nodes: Node[] = [];

        for (const node of end_nodes) {

            const items = node.scanItems();

            if (items.length > 0) {
                const parent = node.pruneLeaf();
                term_nodes.push(...items.flatMap(createNodeClosure(opt, parent, node.root)));
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
            const roots = final_nodes.map(s => s.root).setFilter(s => s.items.map(item_id).sort().join("|"));

            if (roots.length == 1) {
                final_nodes.slice(1).map(s => s.pruneLeaf());

                const node = final_nodes[0];

                if ((node.depth % 10000) > 0)
                    node.addType(TST.O_PEEK);
                else
                    node.addType(TST.O_TERMINAL);

                if (roots[0].is(TST.I_OUT_OF_SCOPE))
                    node.addType(TST.I_OUT_OF_SCOPE);
                else
                    completeRoots(node, roots[0], opt, tpn);
            } else {
                const parent = final_nodes.map(s => s.pruneLeaf())[0];

                handleUnresolvedRoots(opt, roots, parent, tpn);
            }

        } else if (final_nodes.length > 0) {

            if ((final_nodes[0].depth % 10000) > 0)
                final_nodes[0].addType(TST.O_PEEK);
            else
                final_nodes[0].addType(TST.O_TERMINAL);

            completeRoots(final_nodes[0], root, opt, tpn);
        }
    }

    const next_steps: Node[][] = [];

    const groups = term_nodes.groupMap(n => gusn(n.sym));

    mergeOccludingGroups(groups);

    for (const [, group] of groups) {

        //combine the nodes into a single item
        const prime_node = group[0];

        if ((prime_node.depth % 10000) > 0)
            prime_node.addType(TST.O_PEEK);
        else
            prime_node.addType(TST.O_TERMINAL);

        const new_groups = [];

        if (group.length > 1) {

            for (const node of group) {

                if (node != prime_node) {
                    node.pruneLeaf();
                    prime_node.items.push(...node.items);
                    prime_node.closure.push(...node.closure);
                }

                new_groups.push(...node.items.map(inc).flatMap(createNodeClosure(opt, prime_node, node.root)));
            }

            next_steps.push(new_groups);
        } else {
            completeRoots(group[0], root, opt, tpn);
        }
    }

    for (const step of next_steps) {

        const id = getNodesId(step);

        if (ids.includes(id) && step.length > 0) {
            handleTransitionCollision(step, opt, tpn);
        } else {
            disambiguate(opt, step, roots, tpn, ids.concat(id), root, depth + 1);
        }
    }
}
function handleTransitionCollision(step: Node[], options: TGO, tpn: Node[]) {

    if (options.IS_SCANNER) {

    } else {

        const roots = step.map(s => s.root).setFilter(s => s.items.map(item_id).sort().join("|"));
        const parent = step.map(s => s.pruneBranch()).pop();

        handleUnresolvedRoots(options, roots, parent, tpn);
    }
}

function completeRoots(
    node: Node,
    parent: Node,
    opt: TGO,
    tpn: Node[]
) {
    const root = node.root.clone();

    if (root.is(TST.I_OUT_OF_SCOPE)) {

        node.addType(TST.I_FAIL, TST.I_OUT_OF_SCOPE);

        //createFailState(opt, node, root.items).addType(TST.I_OUT_OF_SCOPE);
        //node.children.push();
    } else if (opt.IS_SCANNER) {

        node.clearPeek();

        processNode(opt, node, tpn, false);

    } else {
        const r = node.root.clone();
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
    return step.map(i => i.items.map(i => i.id).sort().join("-")).sort().join("|");
}

function handleUnresolvedRoots(
    opt: TGO,
    roots: Node[],
    parent: Node,
    tpn: Node[]
) {

    const sym = parent.sym;

    const items = roots.flatMap(i => i.items).setFilter(item_id);

    const node = createNode(opt, sym, items, parent);

    if (roots.length < 2) {

        console.log(parent.debug);
        console.log(...roots.map(r => r.debug));
        throw new Error("Unexpected outcome: Single root interpreted as an unresolved root.");
    }

    if (((parent.depth % 10000 > 0) && parent.depth >= 10000))
        node.addType(TST.O_PEEK);
    else
        node.addType(TST.O_TERMINAL);

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


        //Remove out of scope roots.
        const oos_roots = roots.filter(r => r.is(TST.I_OUT_OF_SCOPE));
        const is_roots = roots.filter(r => !r.is(TST.I_OUT_OF_SCOPE));
        const items = is_roots.flatMap(i => i.items).setFilter(item_id);

        //Resort to good ol' forks. 
        node.addType(TST.I_FORK);

        for (const fork_items of items.group(s => s.state)) {

            const sym = fork_items[0].sym(GRAMMAR);

            const new_node = createNode(opt, sym, fork_items);

            processNode(opt, new_node, tpn, false);

            node.children.push(...new_node.children.map(c => (c.parent = node, c)));
        }

        createFailState(opt, node, oos_roots.flatMap(r => r.items).setFilter(item_id));

    } else {

        const priority_ordered_roots = roots.sort((a, b) => b.priority - a.priority);

        // Try filtering out low priority roots 

        if (priority_ordered_roots[0].priority > 0) {
            const highest_priority_roots = priority_ordered_roots.filter(g => g.priority > 0);

            if (highest_priority_roots.length < 2) {

                node.items = highest_priority_roots[0].items;

                processNode(opt, node, tpn, false);

                return;
            }
        }

        //Resort to good ol' forks. 
        node.addType(TST.I_FORK);

        for (const fork_items of items.group(s => s.state)) {

            const sym = fork_items[0].sym(GRAMMAR);

            const new_node = createNode(opt, sym, fork_items);

            processNode(opt, new_node, tpn, false);

            node.children.push(...new_node.children.map(c => (c.parent = node, c)));

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


function createFailState(opt: TGO, parent: Node, items: Item[] = []): Node {
    const node = createNode(opt, default_EOF, items, parent);
    node.addType(TST.I_FAIL);
    return node;
}

function processLoopBackNode(opt: TGO, node: Node, tpn: Node[]) {

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
}
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
): (this: undefined, value: Item, index: number, array: Item[]) => any {
    return i => {

        if (!i)
            debugger;

        const nodes = [];

        if (nonterm_item(i)) {

            const closure = [i];

            for (const item of getClosure(closure, GRAMMAR, root.depth)) {

                if (nonterm_item(item)) {
                    closure.push(item);
                } else {
                    return createNode(opt, item.sym(GRAMMAR), [item], parent_node, closure, root.root);
                }

            }
        }
        else
            return createNode(opt, i.sym(GRAMMAR), [i], parent_node, [], root.root);

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

function inc(i: Item) {
    return i.increment();
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
    parent: Node = null,
    closure: Item[] = [],
    root: Node = null
) {
    const node = new Node(sym, items, parent, closure, root);

    if (options.IS_SCANNER)
        node.addType(TST.I_SCANNER);

    return node;
}

export class Node {

    constructor(sym: HCG3Symbol, items: Item[], parent?: Node, closure: Item[] = [], root: Node = null) {

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

    pruneBranch() {
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

    getNodeAtDepth(depth: number): Node {

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

    get debug() {
        return `
[${this.depth}] [${gusn(this.sym)}] [${getTypeValue(this.type)}]
items:
${itemsDebug(this.items).join("\n")}
closure:
${itemsDebug(this.closure).join("\n")} 
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

        let out = [];

        for (const item of items) {

            const state = item.state;

            const production = item.getProductionID(GRAMMAR);

            let node: Node = this;

            while (node) {

                if (node.hasState(state)) {

                    const production_items = node.closure
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
    parent: Node;
    depth: number;
    closure: Item[];
    root: Node;
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
