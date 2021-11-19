import {
    GrammarObject, Resolved_IR_State, StateAttrib, ExportableStateData, StateMap
} from '@hctoolkit/common';
import {
    getProductionByName, parser
} from '@hctoolkit/grammar';
import { build_logger, ir } from '../ir/compile_scanner_states.js';


export function convertParseProductsIntoStatesMap(ir_states: string[], grammar: GrammarObject, states_map: StateMap) {
    for (const [string, ir_state_ast] of <([string, Resolved_IR_State])[]>[
        ...ir_states.map(

            //@ts-ignore
            function (str) {

                try {
                    const { result: [ir_state], err } = parser(str, {}, ir);

                    if (err)
                        throw err;

                    return [str, ir_state];
                } catch (e) {
                    build_logger.get("PARSER").debug(str);
                    throw e;
                }
            }
        ),
        ...(grammar.ir_states?.map(ir => [
            ir.tok.slice(),
            ir
        ]) ?? [])
    ])
        insertIrStateBlock(ir_state_ast, string, grammar, states_map);
}

function insertIrStateBlock(
    ir_state_ast: Resolved_IR_State,
    string: string,
    grammar: GrammarObject,
    states_map: StateMap,
    state_attributes: StateAttrib = 0
) {

    const id = ir_state_ast.id;


    const IS_PRODUCTION_ENTRY = getProductionByName(grammar, id) != null;

    states_map.set(id + "", {
        reference_count: 0,
        block_offset: 0,
        pointer: -1,
        attributes: (IS_PRODUCTION_ENTRY ? StateAttrib.PRODUCTION_ENTRY : 0) | state_attributes,
        string: ((StateAttrib.FAIL_STATE & state_attributes) ? "[FAILURE HANDLER]\n\n" : "") + string,
        ir_state_ast: ir_state_ast,
        block: null,
    });

    if (ir_state_ast.fail)
        insertIrStateBlock(<any>ir_state_ast.fail, ir_state_ast.fail.tok.slice(), grammar, states_map, StateAttrib.FAIL_STATE);
}

/**
 * Prepares StateMap of InternalStateData object for export to a JSON file.
 * @param states_map 
 * @returns 
 */
export function createExportableStateData(states_map: StateMap): { [key: string]: ExportableStateData; } {
    return <{ [key: string]: ExportableStateData; }>Object.fromEntries([...states_map]
        .map(([k, v]): [string, ExportableStateData] => {
            return [k, {
                name: k,
                block_offset: v.block_offset,
                pointer: v.pointer,
                string: v.string,
                active_tokens: <number[]>(v.ir_state_ast.symbol_meta?.expected ?? []),
                skipped_tokens: <number[]>(v.ir_state_ast.symbol_meta?.skipped ?? [])
            }];
        }));
}
