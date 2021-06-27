/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { bidirectionalTraverse, TraverseState } from "@candlelib/conflagrate";
import { sk } from "../../skribble/skribble.js";
import { SKExpression } from "../../skribble/types/node";
import { RenderBodyOptions } from "../../types/render_body_options";
import { TokenSymbol } from "../../types/symbol";
import { MultiItemReturnObject, SingleItemReturnObject, TransitionClauseGenerator, TransitionGroup } from "../../types/transition_generating";
import { GeneratorStateReturn, TransitionNode, TRANSITION_TYPE } from "../../types/transition_node.js";
import { expressionListHash } from "../../utilities/code_generating.js";
import { Item } from "../../utilities/item.js";
import {
    Symbols_Occlude,
    Sym_Is_A_Generic_Identifier,
    Sym_Is_A_Generic_Type,
    Sym_Is_Defined_Identifier,
    Sym_Is_Defined_Natural_Number, Sym_Is_Defined_Symbol,
    Sym_Is_EOF,
    Sym_Is_EOP
} from "../../grammar/nodes/symbol.js";
import { default_resolveBranches } from "../branch_resolution/default_branch_resolution.js";
import { default_resolveResolvedLeaf } from "../branch_resolution/default_resolved_leaf_resolution.js";
import { default_resolveUnresolvedLeaves } from "../branch_resolution/default_ambiguous_leaves_resolution.js";
import { Items_Are_From_Same_Production } from "./yield_transitions.js";

export function defaultGrouping(g) { return g.hash; }
type UnresolvedLeavesResolver = (node: TransitionNode, nodes: TransitionNode[], options: RenderBodyOptions) => MultiItemReturnObject;

type InteriorNodesResolver = (gen: TransitionClauseGenerator, node: TransitionNode, items: Item[], level: number, options: RenderBodyOptions) => SKExpression[];

type LeafNodeResolver = (item: Item, group: TransitionNode, options: RenderBodyOptions) => SingleItemReturnObject;

export function processTransitionNodes(
    options: RenderBodyOptions,
    nodes: TransitionNode[],
    branch_resolve_function: InteriorNodesResolver = default_resolveBranches,
    conflicting_leaf_resolve_function: UnresolvedLeavesResolver = default_resolveUnresolvedLeaves,
    leaf_resolve_function: LeafNodeResolver = default_resolveResolvedLeaf,
    grouping_fn: (node: TransitionNode, level: number, peeking: boolean) => string = defaultGrouping
): GeneratorStateReturn {

    if (nodes.length == 0)
        return { code: [], prods: [], leaves: [], hash: "" };

    const finale_node = { ast: <TransitionNode>null };

    for (const { node: node, meta: { traverse_state, skip, depth, parent } } of bidirectionalTraverse<TransitionNode, "nodes">(<TransitionNode>{ nodes: nodes }, "nodes", false)
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

        if (traverse_state == TraverseState.ENTER || traverse_state == TraverseState.LEAF) {

            //Determine if state is PUIDABLE
            if (depth == 1) {
                node.PUIDABLE = Items_Are_From_Same_Production(node.items, options.grammar);
            } else {
                node.PUIDABLE = parent?.PUIDABLE;
            }
        }

        switch (traverse_state) {

            case TraverseState.EXIT:

                const
                    nodes = node.nodes,
                    prods = nodes.flatMap(g => g.prods).setFilter(),
                    items = nodes.flatMap(g => g.items).setFilter(i => i.id),
                    filtered_nodes = nodes.filter(s => s.transition_type !== TRANSITION_TYPE.IGNORE && !!s.code),
                    WE_HAVE_UNRESOLVED_LEAVES = nodes.some(s => s.UNRESOLVED_LEAF);

                let
                    leaves = nodes.flatMap(g => g.leaves);

                //Set the transition type of any state with a null code property to IGNORE
                nodes.forEach(g => { if (!g.code) g.transition_type = TRANSITION_TYPE.IGNORE; g.PROCESSED = true; });

                let
                    root: SKExpression[] = [], hash = "ignore";

                if (filtered_nodes.length > 0) {

                    const virtual_state: TransitionNode = {
                        UNRESOLVED_LEAF: WE_HAVE_UNRESOLVED_LEAVES,
                        PUIDABLE: false,
                        PROCESSED: false,
                        nodes: [],
                        symbols: [],
                        code: filtered_nodes[0].code,
                        hash: filtered_nodes[0].hash,
                        prods,
                        items,
                        completing: false,
                        peek_level: filtered_nodes[0].peek_level,
                        offset: filtered_nodes[0].offset,
                        transition_type: filtered_nodes[0].transition_type,
                        leaves
                    };

                    if (WE_HAVE_UNRESOLVED_LEAVES) {

                        ({ root, leaves } = conflicting_leaf_resolve_function(virtual_state, nodes, options));

                    } else {
                        root = branch_resolve_function(
                            traverseInteriorNodes(filtered_nodes, options, grouping_fn),
                            virtual_state,
                            items,
                            nodes[0].peek_level,
                            options
                        );
                    }
                    hash = expressionListHash(root);
                } else {
                    root = null;
                }

                node.leaves = leaves;
                node.prods = prods;
                node.code = root;
                node.hash = hash;
                node.PROCESSED = true;

                break;

            case TraverseState.LEAF:

                if (node.items.length > 1) {
                    const { root, leaves, prods } = conflicting_leaf_resolve_function(node, [node], options);
                    node.code = root;
                    root.unshift(<SKExpression>sk`"__TESTING__HOW_WE_GOT_HERE__"`);
                    console.log("Flow should not enter this block: Multi-item moved to group section");

                    node.hash = expressionListHash(root);
                    node.prods = prods;
                    node.leaves = leaves;
                    if (options.helper.ANNOTATED)
                        if (root)
                            root.unshift(<SKExpression>sk`"--UNRESOLVED-LEAF--"`);
                    break;
                    throw new Error("Flow should not enter this block: Multi-item moved to group section");
                }

                if (node.items.length == 0)
                    throw new Error("Flow should not enter this block: Multi-item moved to group section");

                const { leaf } = leaf_resolve_function(node.items[0], node, options);

                node.code = leaf.root;
                node.hash = leaf.hash;
                node.prods = leaf.prods;
                node.leaves = [leaf];

                if (options.helper.ANNOTATED)
                    if (leaf.root)
                        leaf.root.unshift(<SKExpression>sk`"--LEAF--"`);
                break;

        }
    }

    const { code, prods, hash, leaves } = finale_node.ast;

    return { code, prods, hash, leaves };
}

function* traverseInteriorNodes(
    group: TransitionNode[],
    options: RenderBodyOptions,
    grouping_fn: (node: TransitionNode, level: number, peeking: boolean) => string
): TransitionClauseGenerator {

    const
        groups = group.group(g => grouping_fn(g, g.peek_level, g.peek_level >= 0)),

        sel_group: TransitionGroup[] = groups.map((group) => {

            const
                syms = group.flatMap(s => s.symbols),
                code = group[0].code,
                PUIDABLE = group.every(g => g.PUIDABLE),
                hash = group[0].hash,
                items = group.flatMap(g => g.items).setFilter(i => i.id),
                leaves = group.flatMap(g => g.leaves),
                yielders = group.map(i => i.transition_type).setFilter();

            return { PUIDABLE, leaves, transition_types: yielders, syms, code, items, hash, LAST: false, FIRST: false, prods: group.flatMap(g => g.prods).setFilter() };
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