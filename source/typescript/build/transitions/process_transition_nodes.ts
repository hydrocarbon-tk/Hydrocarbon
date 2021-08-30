/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { bidirectionalTraverse, TraverseState } from "@candlelib/conflagrate";
import { TokenSymbol } from "source/typescript/types/grammar_nodes.js";
import {
    Symbols_Occlude,
    Sym_Is_A_Generic_Identifier,
    Sym_Is_A_Generic_Type,
    Sym_Is_Defined_Identifier,
    Sym_Is_Defined_Natural_Number, Sym_Is_Defined_Symbol,
    Sym_Is_EOF,
    Sym_Is_EOP
} from "../../grammar/nodes/symbol.js";
import { SKExpression } from "../../skribble/types/node";
import { RenderBodyOptions } from "../../types/render_body_options";
import { MultiItemReturnObject, SingleItemReturnObject, TransitionClauseGenerator, TransitionGroup } from "../../types/transition_generating";
import { GeneratorStateReturn, TransitionNode, TRANSITION_TYPE } from "../../types/transition_node.js";
import { Item } from "../../utilities/item.js";
import { table_resolveBranches } from '../table_branch_resolution/table_branch_resolution.js';
import { table_resolveResolvedLeaf } from '../table_branch_resolution/table_resolved_leaf_resolution.js';
import { table_resolveUnresolvedLeaves } from '../table_branch_resolution/table_unresolved_leaves_resolution.js';

export function defaultGrouping(g) { return g.hash; }
type UnresolvedLeavesResolver = (node: TransitionNode, nodes: TransitionNode[], options: RenderBodyOptions) => MultiItemReturnObject;

type InteriorNodesResolver = (gen: TransitionClauseGenerator, node: TransitionNode, items: Item[], level: number, options: RenderBodyOptions) => SKExpression[];

type LeafNodeResolver = (item: Item, group: TransitionNode, options: RenderBodyOptions) => SingleItemReturnObject;

export function processTransitionNodes(
    options: RenderBodyOptions,
    nodes: TransitionNode[],
    branch_resolve_function: InteriorNodesResolver = table_resolveBranches,
    conflicting_leaf_resolve_function: UnresolvedLeavesResolver = table_resolveUnresolvedLeaves,
    leaf_resolve_function: LeafNodeResolver = table_resolveResolvedLeaf,
    grouping_fn: (node: TransitionNode, level: number, peeking: boolean) => string = defaultGrouping
): GeneratorStateReturn {

    if (nodes.length == 0)
        return { prods: [], leaves: [], hash: "" };

    const finale_node = { ast: <TransitionNode>null };

    for (const { node: node, meta: { traverse_state, skip, depth, parent } } of
        bidirectionalTraverse<TransitionNode, "nodes">(<TransitionNode>{ nodes: nodes }, "nodes",
            false
        )
            .extract(finale_node)
            .makeSkippable()
    ) {

        if (traverse_state == TraverseState.EXIT || traverse_state == TraverseState.LEAF) {

            if (node.PROCESSED) {
                skip();
                continue;
            }

            node.PROCESSED = true;
        }

        switch (traverse_state) {

            case TraverseState.EXIT:

                const
                    nodes = node.nodes,
                    prods = nodes.flatMap(g => g.prods).setFilter(),
                    items = nodes.flatMap(g => g.items).setFilter(i => i.id),
                    filtered_nodes = nodes,//.filter(s => /*s.transition_type !== TRANSITION_TYPE.IGNORE &&*/ !!s.code),
                    WE_HAVE_UNRESOLVED_LEAVES = nodes.some(s => s.UNRESOLVED_LEAF);

                let
                    leaves = nodes.flatMap(g => g.leaves);

                let hash = "ignore";

                if (filtered_nodes.length > 0) {

                    const virtual_state: TransitionNode = {
                        UNRESOLVED_LEAF: WE_HAVE_UNRESOLVED_LEAVES,
                        PUIDABLE: false,
                        PROCESSED: false,
                        nodes: [],
                        symbols: [],
                        hash: "", //filtered_nodes[0].hash,
                        prods,
                        items,
                        closure: filtered_nodes.flatMap(n => n.closure).setFilter(i => i.id),
                        root_id: node.root_id,
                        peek_level: filtered_nodes[0].peek_level,
                        offset: filtered_nodes[0].offset,
                        transition_type: filtered_nodes[0].transition_type,
                        leaves
                    };

                    if (WE_HAVE_UNRESOLVED_LEAVES) {

                        ({ leaves } = conflicting_leaf_resolve_function(virtual_state, nodes, options));

                    } else {

                        branch_resolve_function(
                            traverseInteriorNodes(filtered_nodes, options, grouping_fn),
                            virtual_state,
                            items,
                            nodes[0].peek_level,
                            options
                        );
                    }

                    hash = virtual_state.hash;
                }

                node.leaves = leaves;
                node.prods = prods;
                node.hash = hash;
                node.PROCESSED = true;

                break;

            case TraverseState.LEAF:

                if (node.items.length > 1) {
                    throw new Error("Flow should not enter this block: Multi-item moved to group section");
                } else if (node.items.length == 0)
                    throw new Error("Transition node has no items");
                else {

                    const { leaf } = leaf_resolve_function(node.items[0], node, options);

                    node.hash = leaf.hash;
                    node.prods = leaf.prods;
                    node.leaves = [leaf];
                }
                break;

        }
    }

    const { prods, hash, leaves } = finale_node.ast;

    return { prods, hash, leaves };
}

function* traverseInteriorNodes(
    group: TransitionNode[],
    options: RenderBodyOptions,
    grouping_fn: (node: TransitionNode, level: number, peeking: boolean) => string
): TransitionClauseGenerator {

    const
        groups = group.group(g => grouping_fn(g, g.peek_level, g.peek_level >= 0)),

        sel_group: TransitionGroup[] = groups.map((group): TransitionGroup => {

            const
                closure = group.flatMap(i => i.closure).setFilter(i => i.id),
                syms = group.flatMap(s => s.symbols),

                hash = group[0].hash,
                items = group.flatMap(g => g.items).setFilter(i => i.id),
                leaves = group.flatMap(g => g.leaves),
                yielders = group.map(i => i.transition_type).setFilter();

            return {
                root_id: group[0].root_id,
                leaves,
                transition_types: yielders,
                syms,
                items,
                hash,
                closure,
                LAST: false,
                FIRST: false,
                prods: group.flatMap(g => g.prods).setFilter()
            };
        });
    let i = 0;
    for (const group of sel_group.sort((a, b) => {

        const groupAEnd = +(a.transition_types[0] == TRANSITION_TYPE.ASSERT_END);
        const groupBEnd = +(b.transition_types[0] == TRANSITION_TYPE.ASSERT_END);

        if (groupAEnd * groupBEnd == 1)
            return getGroupScore(b) - getGroupScore(a);

        if (groupAEnd)
            return 1;

        if (groupBEnd)
            return -1;

        for (const sym_a of a.syms)
            for (const sym_b of b.syms)
                if (Symbols_Occlude(<TokenSymbol>sym_b, <TokenSymbol>sym_a))
                    return 1;
                else if (Symbols_Occlude(<TokenSymbol>sym_a, <TokenSymbol>sym_b))
                    return -1;

        return getGroupScore(b) - getGroupScore(a);
    })) {
        group.FIRST = i++ == 0;
        group.LAST = i == groups.length;
        yield group;
    }
}


function getGroupScore(a: TransitionGroup) {
    /** 
     * Classes: 
     * EOF                          :     Lowest Score Period
     * 
     * DefinedSymbol DefinedNumeric :     0x00000001
     * 
     * DefinedIdentifier            :     0x00010000
     * 
     * Generic(Symbol | NL  | WS | NUM )        
     *                              :     0x00100000
     * 
     * GenericIdentifier            :     0x01000000
     */

    let has_eof = (a.syms.some(s => Sym_Is_EOF(s) || Sym_Is_EOP(s))) ? 0 : 1;

    let _0x000000001 = a.syms.filter(s => Sym_Is_Defined_Symbol(s) || Sym_Is_Defined_Natural_Number(s)).length;
    let _0x000010000 = a.syms.filter(s => Sym_Is_Defined_Identifier(s)).length << 16;
    let _0x001000000 = +a.syms.filter(s => Sym_Is_A_Generic_Type(s) && !Sym_Is_A_Generic_Identifier(s)) << 28;
    let _0x010000000 = +a.syms.filter(s => Sym_Is_A_Generic_Identifier(s)) << 24;

    return (_0x000000001 | _0x000010000 | _0x001000000 | _0x010000000) * has_eof;
}