/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { experimentalConstructRenderers, experimentalRender, NodeMapping, NodeMappings } from "@candlelib/conflagrate";

import {
    BaseIRState,
    FailedIRState,
    InstructionType,
    IRAssert,
    IRConsume,
    IRFail,
    IRFork,
    IRGoto,
    IRLeftMost,
    IRNode,
    IRPass,
    IRPeek,
    IRProductionBranch,
    IRReduce,
    IRScanBackTo,
    IRScanTo,
    IRSetProd
} from '../types/ir_types';

function state_custom_render(state, render_fn) {
    const node = Object.assign({}, state.node);

    if (node.instructions[0].type == InstructionType.assert
        ||
        node.instructions[0].type == InstructionType.prod
        ||
        node.instructions[0].type == InstructionType.peek)
        node.instructs = node.instructions.map(i => render_fn(state, i))
            .join("\n").split("\n").join("\n" + " ".repeat(state.indent + 4));

    else
        node.instructs = node.instructions.map(i => render_fn(state, i)).join(" then ");

    return render_fn(state, node);
}
export const ir_state_mappings: NodeMappings<IRNode, "type"> = <NodeMappings<IRNode, "type">>{
    typename: "type",
    type_lookup: () => 0,
    mappings: [

        <NodeMapping<BaseIRState>>{
            type: "state",
            child_keys: ["instructions", "symbol_meta", "fail"],
            template: "state \\[ m:s @id m:s \\] i:s o:n o:n @instructs...[ o:n ] o:n o:n { symbol_meta: @symbol_meta o:n o:n } { fail: on o:s fail o:s @fail} i:e",
            custom_render: state_custom_render
        },

        <NodeMapping<FailedIRState>>{
            type: "on-fail-state",
            child_keys: ["instructions", "symbol_meta", "fail"],
            template: "state \\[ m:s @id m:s \\] i:s o:n o:n @instructs...[ o:n ] o:n o:n { symbol_meta: @symbol_meta o:n o:n } @fail? i:e",
            custom_render: state_custom_render
        },

        <NodeMapping<IRGoto>>{
            type: "goto",
            child_keys: [],
            template: "goto o:s state o:s \\[ o:s @state o:s \\] o:s"
        },

        <NodeMapping<IRAssert>>{
            type: "assert",
            child_keys: [],
            template: "assert o:s \\[ o:s @ids...[o:s] o:s \\] \\( i:s o:n @instructions...[ o:s \\then o:s ] i:e o:n \\) "
        },

        <NodeMapping<IRPeek>>{
            type: "peek",
            child_keys: [],
            template: "peek o:s \\[ o:s @ids...[o:s] o:s \\] \\( i:s o:n @instructions...[ o:s \\then o:s ] i:e o:n \\) "
        },

        <NodeMapping<IRProductionBranch>>{
            type: "prod",
            child_keys: [],
            template: "on o:s prod o:s \\[ o:s @ids...[o:s] o:s \\] \\( i:s o:n @instructions...[ o:s \\then o:s ] i:e o:n \\) "
        },

        <NodeMapping<IRPass>>{
            type: "pass",
            child_keys: [],
            template: "pass"
        },

        <NodeMapping<IRFail>>{
            type: "fail",
            child_keys: [],
            template: "fail"
        },

        <NodeMapping<IRConsume>>{
            type: "consume",
            child_keys: [],
            template: "{nothing: consume o:n nothing or consume  }"
        },

        <NodeMapping<IRFork>>{
            type: "fork-to",
            child_keys: [],
            template: "fork o:s to o:s \\( o:s state \\[ o:s @states...[ o:s \\] o:s state \\[ o:s ] o:s \\] o:s \\)",
        },

        <NodeMapping<IRScanTo>>{
            type: "scan-until",
            child_keys: [],
            template: "scan o:s until o:s \\[ o:s @ids...[o:s] o:s \\]"
        },

        <NodeMapping<IRScanBackTo>>{
            type: "scan-back-until",
            child_keys: [],
            template: "scan o:s back o:s until o:s \\[ o:s @ids...[o:s] o:s \\]"
        },

        <NodeMapping<IRLeftMost>>{
            type: "assert-left",
            child_keys: [],
            template: "assert o:n left"
        },

        <NodeMapping<IRSetProd>>{
            type: "set-prod",
            child_keys: [],
            template: "set o:s prod o:s to o:s @id"
        },

        <NodeMapping<IRReduce>>{
            type: "reduce",
            child_keys: [],
            template: "reduce o:s @len o:s @reduce_fn"
        },

        <NodeMapping<BaseIRState["symbol_meta"]>>{
            type: "symbols",
            child_keys: [],
            template: "symbols: i:s o:n  { expected: expected o:s \\[ o:s @expected...[o:s] o:s \\] o:n } { skipped: o:n skipped o:s \\[ o:s @skipped...[o:s] o:s \\] o:n } i:e"
        }


    ]
};

const lu_table = new Map(ir_state_mappings.mappings.map((i, j) => [i.type, j]));
ir_state_mappings.type_lookup = (node, name) => lu_table.get(node.type) || -1;

let renderers;
export function renderIRNode(node: IRNode): string {
    if (!renderers)
        renderers = experimentalConstructRenderers(<NodeMappings<IRNode, "type">>ir_state_mappings);
    return experimentalRender(node, <NodeMappings<IRNode, "type">>ir_state_mappings, renderers);
}
