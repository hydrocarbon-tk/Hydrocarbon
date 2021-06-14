/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { sk } from "../../skribble/skribble.js";
import { SKBlock, SKExpression } from "../../skribble/types/node";
import { RenderBodyOptions } from "../../types/render_body_options";
import { MultiItemReturnObject } from "../../types/transition_generating";
import { Leaf, TransitionNode, TRANSITION_TYPE } from "../../types/transition_node.js";
import { createBranchFunctionSk } from "../../utilities/code_generating.js";
import { getUniqueSymbolName, Sym_Is_A_Production } from "../../utilities/symbol.js";
import { createVirtualProductionSequence } from "../function_constructor.js";

const SC = null;
export function default_resolveUnresolvedLeaves(node: TransitionNode, nodes: TransitionNode[], options: RenderBodyOptions): MultiItemReturnObject {

    const

        items = nodes.flatMap(s => s.items).setFilter(i => i.id),

        expected_symbols =
            nodes.flatMap(s => s.symbols).setFilter(getUniqueSymbolName)
                .concat(
                    items.flatMap(i => {
                        const sym = i.sym(options.grammar);
                        if (!Sym_Is_A_Production(sym))
                            return sym;
                        return [];
                    })
                ),

        IS_LEFT_RECURSIVE_WITH_FOREIGN_PRODUCTION_ITEMS = nodes.some(i => i.transition_type == TRANSITION_TYPE.IGNORE),

        out_prods: number[] = [],

        out_leaves: Leaf[] = [];

    let root: SKExpression[] = [];

    for (const node of nodes)
        for (const leaf of node.leaves)
            leaf.INDIRECT = true;

    let FALLBACK_REQUIRED = items.every(i => i.atEND);
    let v_depth = options.VIRTUAL_LEVEL;

    if (!FALLBACK_REQUIRED)
        try {
            root = createVirtualProductionSequence(options, items, expected_symbols, out_leaves, out_prods);
        } catch (e) {
            //throw e;

            if (v_depth > 0) throw e;

            root.length = 0;

            FALLBACK_REQUIRED = true;
        }

    if (FALLBACK_REQUIRED) {

        const
            USE_BACKTRACKING = false,
            USE_FORKING = true,
            output_nodes = nodes.filter(i => i.transition_type !== TRANSITION_TYPE.IGNORE);

        let leaf = root;// prev_prods;

        if (USE_BACKTRACKING) {

            const statements = createBackTrackingSequence(
                output_nodes,
                out_prods,
                out_leaves,
                IS_LEFT_RECURSIVE_WITH_FOREIGN_PRODUCTION_ITEMS
            );

            root.push(...statements);

        } else if (USE_FORKING) {

            const statements = createForkSequence(
                options,
                output_nodes,
                out_prods,
                out_leaves,
            );

            root.push(...statements);
        } else
            throw new Error(
                `Unable to resolve parsing ambiguities \n${items.map(i => i.renderUnformattedWithProduction(options.grammar)).join("\n")} `
            );
    }

    return { root, leaves: out_leaves, prods: out_prods.setFilter() };
}

function createBackTrackingSequence(
    output_nodes: TransitionNode[],
    out_prods: number[],
    out_leaves: Leaf[],
    IS_LEFT_RECURSIVE_WITH_FOREIGN_PRODUCTION_ITEMS: boolean
): SKExpression[] {

    let I = 0;

    const out: SKExpression[] = [];

    out.push(
        <SKExpression>sk`[mut] mk:i32 = mark();`,
        <SKExpression>sk`[mut] anchor:Lexer = l.copy();`,
        <SKExpression>sk`[mut] anchor_state:u32 = state;`
    );

    for (const { code, items, prods, leaves } of output_nodes) {

        out_prods.push(...prods);

        out_leaves.push(...leaves);

        out.push(SC.Comment(items));

        if (I++ == 0) {
            // Preserve the `code` array to allow additional statements to
            // be added to it
            const block = <SKBlock>sk`{}`;
            block.expressions = code;
            out.push(block);

        } else {
            // Preserve the `code` array to allow additional statements to
            // be added to it
            const block = <SKBlock>sk`{}`;
            block.expressions = code;
            out.push(
                <SKExpression>sk`state = reset(mk, anchor, l, anchor_state)`,
                block
            );

        }
    }

    if (IS_LEFT_RECURSIVE_WITH_FOREIGN_PRODUCTION_ITEMS) {
        out.push(
            <SKExpression>sk`state = reset(mk, anchor, l, anchor_state)`
        );
    }

    return out;
}

function createForkSequence(
    options: RenderBodyOptions,
    output_nodes: TransitionNode[],
    out_prods: number[],
    out_leaves: Leaf[],
): SKExpression[] {

    let I = 0;


    const out: SKExpression[] = [];


    for (const { code, items, prods, leaves } of output_nodes) {

        out_prods.push(...prods);
        out_leaves.push(...leaves);

        const call_name = createBranchFunctionSk(code, options);

        if (I++ == output_nodes.length - 1) {
            out.push(
                <SKExpression>sk`pushFN(data, &> ${call_name})`
            );
        } else {
            I++;
            out.push(
                <SKExpression>sk`[static] fk${I}:ParserData = fork(data);`,
                <SKExpression>sk`pushFN(fk${I}, &> ${call_name})`
            );
        }
    }

    out.push(<SKExpression>sk`return:0`);

    return out;
}
