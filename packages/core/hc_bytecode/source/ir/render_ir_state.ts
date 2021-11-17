/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import {
    experimentalConstructRenderers,
    experimentalRender,
    NodeMapping,
    NodeMappings
} from "@candlelib/conflagrate";
import {
    BaseIRState,
    FailedIRState,
    InstructionType,
    IRAssert,
    IRConsume,
    IRFail,
    IRFallThrough,
    IRFork,
    IRGoto,
    IRInlineAssert, IRNode,
    IRNotInScopes,
    IRPass,
    IRPeek, IRReduce,
    IRRepeat,
    IRScanBackTo,
    IRScanTo,
    IRSetProd,
    IRSetScope,
    IRSetTokenLength,
    IRTokenAssign, Token
} from '@hctoolkit/common';


function state_custom_render(state: any, render_fn: any) {
    const node = Object.assign({}, state.node);

    if (node.type == "sym-production")
        return node.name;

    try {

        if (!node.instructions)
            throw new Error("Missing instructions in state");

        if (node.instructions[0].type == InstructionType.assert
            ||
            node.instructions[0].type == InstructionType.peek)
            node.instructs = node.instructions.map((i: any) => render_fn(state, i))
                .join("\n").split("\n").join("\n" + " ".repeat(state.indent + 4));

        else
            node.instructs = node.instructions.map((i: any) => render_fn(state, i)).join(" then ");
    } catch (e) {
        throw e;
    }

    return render_fn(state, node);
}
export const ir_state_mappings: NodeMappings<IRNode, "type"> = <NodeMappings<IRNode, "type">>{
    typename: "type",
    type_lookup: () => 0,
    mappings: [

        <NodeMapping<BaseIRState>>{
            type: "state",
            child_keys: ["instructions", "symbol_meta", "fail"],
            template: "state \\[ m:s @id m:s \\] i:s m:n o:n @instructs...[ m:s ] o:n o:n { symbol_meta: m:n @symbol_meta o:n o:n } { fail: m:n on m:s fail m:s @fail} i:e",
            custom_render: state_custom_render
        },

        <NodeMapping<FailedIRState>>{
            type: "on-fail-state",
            child_keys: ["instructions", "symbol_meta", "fail"],
            template: "state \\[ m:s @id m:s \\] i:s o:n o:n @instructs...[ m:s ] o:n o:n { symbol_meta: @symbol_meta o:n o:n } @fail? i:e",
            custom_render: state_custom_render
        },

        <NodeMapping<IRGoto>>{
            type: "goto",
            child_keys: [],
            template: "goto m:s state o:s \\[ o:s @state o:s \\] o:s"
        },

        <NodeMapping<IRSetTokenLength>>{
            type: "token-length",
            child_keys: [],
            template: "set m:s token m:s length m:s @len"
        },
        <NodeMapping<IRTokenAssign>>{
            type: "token-assign",
            child_keys: [],
            template: "assign m:s token m:s \\[ o:s @ids...[m:s] o:s \\]"
        },

        <NodeMapping<IRRepeat>>{
            type: "repeat-state",
            child_keys: [],
            template: "repeat"
        },

        <NodeMapping<IRAssert>>{
            type: "assert",
            child_keys: [],
            template: "assert m:s @mode m:s \\[ o:s @ids...[m:s] o:s \\] \\( i:s o:n @instructions...[ o:n m:s \\then m:s o:n ] i:e o:n \\) "
        },

        <NodeMapping<IRPeek>>{
            type: "peek",
            child_keys: [],
            template: "peek m:s @mode m:s \\[ o:s @ids...[m:s] o:s \\] \\( i:s o:n @instructions...[ o:n m:s \\then m:s o:n ] i:e o:n \\) "
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

        <NodeMapping<IRFallThrough>>{
            type: "fall_through",
            child_keys: [],
            template: "fall_through"
        },

        <NodeMapping<IRConsume>>{
            type: "consume",
            child_keys: [],
            template: "{nothing: consume m:s nothing or consume  }"
        },

        <NodeMapping<IRFork>>{
            type: "fork-to",
            child_keys: [],
            template: "fork m:s to o:s \\( o:s state \\[ o:s @states...[ o:s \\] o:s state \\[ o:s ] o:s \\] o:s \\)",
        },

        <NodeMapping<IRScanTo>>{
            type: "scan-until",
            child_keys: [],
            template: "scan m:s until o:s \\[ o:s @ids...[m:s] o:s \\]"
        },

        <NodeMapping<IRScanBackTo>>{
            type: "scan-back-until",
            child_keys: [],
            template: "scan m:s back m:s until o:s \\[ o:s @ids...[m:s] o:s \\]"
        },

        <NodeMapping<IRNotInScopes>>{
            type: "not-in-scopes",
            child_keys: [],
            template: "not m:s in m:s scopes o:s \\[ o:s @ids...[m:s]  o:s\\]"
        },

        <NodeMapping<IRSetScope>>{
            type: "set-scope",
            child_keys: [],
            template: "set m:s scope m:s to m:s @scope"
        },

        <NodeMapping<IRInlineAssert>>{
            type: "inline-assert",
            child_keys: [],
            template: `o:n inline-assert m:s @mode m:s \\[ o:s @ids...[m:s] o:s \\] i:s o:n m:s 
                       { token_ids: token_ids o:s \\[ o:s @token_ids...[m:s] o:s \\] o:n m:s } 
                       { skipped_ids: skipped o:s \\[ o:s @skipped_ids...[m:s] o:s \\] o:n }
                       i:e
                       o:n 
                    `
        },

        <NodeMapping<IRSetProd>>{
            type: "set-prod",
            child_keys: [],
            template: "set m:s prod m:s to m:s @id"
        },

        <NodeMapping<IRReduce>>{
            type: "reduce",
            child_keys: [],
            template: "reduce m:s @len m:s @reduce_fn"
        },

        <NodeMapping<BaseIRState["symbol_meta"]>>{
            type: "symbols",
            child_keys: [],
            template: "symbols: i:s o:n  { expected: expected o:s \\[ o:s @expected...[m:s] o:s \\] o:n } { skipped: o:n skipped o:s \\[ o:s @skipped...[m:s] o:s \\] o:n } i:e"
        }


    ]
};

const lu_table = new Map(ir_state_mappings.mappings.map((i, j) => [i.type, j]));
ir_state_mappings.type_lookup = (node, name) => lu_table.get(node.type) || -1;

var renderers: any;
export function renderIRNode(node: IRNode): string {

    if (!renderers)
        renderers = experimentalConstructRenderers(<NodeMappings<IRNode, "type">>ir_state_mappings);

    return experimentalRender(node, <NodeMappings<IRNode, "type">>ir_state_mappings, renderers).string;
}
