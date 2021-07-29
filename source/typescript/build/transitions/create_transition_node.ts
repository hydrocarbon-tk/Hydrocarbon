/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { HCG3Symbol } from "../../types/grammar_nodes.js";
import { TransitionNode, TRANSITION_TYPE } from "../../types/transition_node.js";
import { Item } from "../../utilities/item.js";

export function createTransitionNode(
    items: Item[],
    symbols: HCG3Symbol[],
    transition_type: TRANSITION_TYPE,
    offset: number = -1,
    peek_level: number = -1,
    UNRESOLVED_LEAF: boolean = false,
    root_id = -1,
    t_items: Item[] = []
): TransitionNode {
    return <TransitionNode>{
        UNRESOLVED_LEAF: UNRESOLVED_LEAF,
        PROCESSED: false,
        code: null,
        hash: "",
        symbols,
        transition_type,
        items,
        offset,
        peek_level,
        root_id,
        nodes: [],
        t_items,
        PUIDABLE: false,
        completing: false
    };
}
