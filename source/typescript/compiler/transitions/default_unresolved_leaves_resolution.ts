/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { RenderBodyOptions } from "../../types/render_body_options";
import { MultiItemReturnObject } from "../../types/transition_generating";
import { Leaf, TransitionNode, TRANSITION_TYPE } from "../../types/transition_node.js";
import { createBranchFunction } from "../../utilities/code_generating.js";
import { rec_glob_lex_name, rec_state } from "../../utilities/global_names.js";
import { SC, VarSC } from "../../utilities/skribble.js";
import { getUniqueSymbolName, Sym_Is_A_Production } from "../../utilities/symbol.js";
import { createVirtualProductionSequence } from "../function_constructor.js";

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

        anchor_state = SC.Variable("anchor_state:unsigned"),

        root: SC = (new SC),

        IS_LEFT_RECURSIVE_WITH_FOREIGN_PRODUCTION_ITEMS = nodes.some(i => i.transition_type == TRANSITION_TYPE.IGNORE),

        out_prods: number[] = [],

        out_leaves: Leaf[] = [];

    for (const node of nodes)
        for (const leaf of node.leaves)
            leaf.INDIRECT = true;

    let FALLBACK_REQUIRED = items.every(i => i.atEND);
    let v_depth = options.VIRTUAL_LEVEL;

    if (!FALLBACK_REQUIRED)
        try {
            createVirtualProductionSequence(options, items, expected_symbols, root, out_leaves, out_prods);
        } catch (e) {
            //throw e;
            if (v_depth > 0) throw e;
            root.statements.length = 0;
            root.addStatement(e.stack);
            FALLBACK_REQUIRED = true;
        }

    if (FALLBACK_REQUIRED) {

        const USE_BACKTRACKING = false;
        const USE_FORKING = true;

        let leaf = root;// prev_prods;

        const output_nodes = nodes.filter(i => i.transition_type !== TRANSITION_TYPE.IGNORE);

        if (USE_BACKTRACKING) {

            createBackTrackingSequence(
                leaf,
                root,
                anchor_state,
                output_nodes,
                out_prods,
                out_leaves,
                IS_LEFT_RECURSIVE_WITH_FOREIGN_PRODUCTION_ITEMS
            );
        } else if (USE_FORKING) {
            createForkSequence(
                options,
                leaf,
                output_nodes,
                out_prods,
                out_leaves,
            );
        } else
            throw new Error(
                `Unable to resolve parsing ambiguities \n${items.map(i => i.renderUnformattedWithProduction(options.grammar)).join("\n")} `
            );
    }

    return { root, leaves: out_leaves, prods: out_prods.setFilter() };
}

function createBackTrackingSequence(
    leaf: SC,
    root: SC,
    anchor_state: VarSC,
    output_nodes: TransitionNode[],
    out_prods: number[],
    out_leaves: Leaf[],
    IS_LEFT_RECURSIVE_WITH_FOREIGN_PRODUCTION_ITEMS: boolean
) {
    let I = 0;

    root.addStatement(
        SC.Declare(
            SC.Assignment("mk:int", SC.Call("mark")),
            SC.Assignment("anchor:Lexer", SC.Call(SC.Member(rec_glob_lex_name, "copy"))),
            SC.Assignment(anchor_state, rec_state)
        ));

    for (const { code, items, prods, leaves } of output_nodes) {

        out_prods.push(...prods);

        out_leaves.push(...leaves);

        leaf.addStatement(SC.Comment(items));

        if (I++ == 0) {

            leaf.addStatement(
                SC.Comment(prods),
                code
            );

        } else {
            leaf.addStatement(
                SC.Assignment(rec_state, SC.Call(
                    "reset:bool",
                    "mk",
                    "anchor:Lexer",
                    rec_glob_lex_name,
                    anchor_state
                )),
                code,
                SC.Empty()
            );

        }
    }

    if (IS_LEFT_RECURSIVE_WITH_FOREIGN_PRODUCTION_ITEMS) {
        leaf.addStatement(
            SC.Assignment(rec_state, SC.Call(
                "reset:bool",
                "mk",
                "anchor:Lexer",
                rec_glob_lex_name,
                anchor_state
            )),
            SC.Empty()
        );
    }
}

function createForkSequence(
    options: RenderBodyOptions,
    leaf: SC,
    output_nodes: TransitionNode[],
    out_prods: number[],
    out_leaves: Leaf[],
) {

    let I = 0;

    for (const { code, items, prods, leaves } of output_nodes) {

        out_prods.push(...prods);
        out_leaves.push(...leaves);

        // leaf.addStatement(items.map(i => i.renderUnformattedWithProduction(options.grammar)).join("\n"));
        const call_name = createBranchFunction(code, code, options);

        if (I++ == output_nodes.length - 1) {

            leaf.addStatement(
                SC.Call("pushFN", "data", call_name)
            );

        } else {
            leaf.addStatement(SC.If().addStatement(
                SC.Value("const fk = fork(data);"),
                SC.Call("pushFN", "fk", call_name)
            ));
        }
    }

    leaf.addStatement(SC.UnaryPre(SC.Return, SC.Value("0")));

    return I;
}
