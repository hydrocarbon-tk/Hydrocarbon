/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Logger } from '@candlelib/log';
import {
    default_case_indicator,
    GrammarObject,
    InstructionType,
    numeric_sort,
    Resolved_IR_State,
    skipped_scan_prod,
    StateAttrib,
    StateMap,
    Sym_Is_Exclusive
} from '@hctoolkit/common';
import { addRootScannerFunction, entry_points, getSymbolProductionName, parser, getProductionByName } from '@hctoolkit/grammar';
import { createProductionLookup, processSymbol } from '@hctoolkit/grammar/build/passes/common';
import { buildItemMaps } from '@hctoolkit/grammar/build/passes/item_map';
import { constructProductionStates } from '../ir_state_compiler/state_constructor.js';
import { IsAssertInstruction, IsPeekInstruction } from './optimize.js';

const ir = entry_points.ir;

const build_logger = Logger.get("MAIN").createLogger("COMPILER").get("SCANNER").activate();

export function compileScannerStates(
    states_map: StateMap,
    grammar: GrammarObject
) {

    const scanner_states: StateMap = new Map;

    const raw_scanner_states = new Map;

    const scanner_id_to_state = new Map;

    for (const [, state_data] of states_map) {

        let { expected_tokens, skipped_tokens, ir_state_ast } = state_data;

        if (expected_tokens.length > 0 || skipped_tokens.length > 0) {

            //create a meta lookup instruction
            constructScannerState(
                expected_tokens.setFilter(),
                skipped_tokens.setFilter(),
                grammar,
                scanner_id_to_state,
                raw_scanner_states
            );
        }

        const potential_scanner_instructions = [...ir_state_ast.instructions];

        for (const instruction of potential_scanner_instructions) {
            if (IsAssertInstruction(instruction) || IsPeekInstruction(instruction)) {
                if (instruction.mode == "TOKEN" || instruction.mode == "PRODUCTION")
                    potential_scanner_instructions.push(...instruction.instructions);
            } else if (instruction.type == InstructionType.inline_assert) {
                if (instruction.mode == "TOKEN") {

                    const expected_tokens = [...instruction.ids, ...instruction.token_ids];
                    const skipped_tokens = instruction.skipped_ids;

                    constructScannerState(
                        expected_tokens.setFilter(),
                        skipped_tokens.setFilter(),
                        grammar,
                        scanner_id_to_state,
                        raw_scanner_states
                    );
                }
            }
        }
    }

    convertParseProductsIntoStatesMap(
        [...raw_scanner_states.entries()],
        grammar, scanner_states
    );

    return {
        scanner_states,
        scanner_id_to_state
    };
}


export function constructScannerState(
    consumed_ids: number[],
    skipped_ids: number[],
    grammar: GrammarObject,
    scanner_id_to_state: Map<string, string>,
    scanner_states: Map<string, string>
) {
    let scanner_id = createSymMapId(consumed_ids, skipped_ids, grammar);

    if (!scanner_id) return scanner_id;

    if (scanner_id_to_state.has(scanner_id)) {
        return scanner_id_to_state.get(scanner_id);
    }

    const consumed_symbols = consumed_ids
        .filter(i => i > 1 && i != default_case_indicator)
        .setFilter()
        .map(i => grammar.meta.all_symbols.by_id.get(i));

    const skipped_symbols = skipped_ids
        .filter(s => !consumed_ids.includes(s))
        .filter(i => i > 1 && i != default_case_indicator)
        .setFilter()
        .map(i => grammar.meta.all_symbols.by_id.get(i));


    //Create checkpoints for original grammar data
    let productions_length = grammar.productions.length;
    let bodies_length = grammar.bodies.length;
    let old_item_map = grammar.item_map;

    grammar.item_map = new Map(old_item_map);

    let old_symbol_offset = grammar.meta.id_offset;
    let old_symbols = grammar.meta.all_symbols;

    grammar.meta.all_symbols = Object.assign(
        new Map(grammar.meta.all_symbols),
        { by_id: new Map(grammar.meta.all_symbols.by_id) }
    );

    const local_id = scanner_id_to_state.size;

    const name = `__SCANNER${local_id}__`;

    //Insert a generated production for these symbols
    let entry = addRootScannerFunction(
        `<> ${name} > ${consumed_symbols.map(
            sym => {
                return `${Sym_Is_Exclusive(sym) ? "!" : ""}` + getSymbolProductionName(sym);
            }).filter(a => !!a).join("\n    | ")
        + ((skipped_symbols.length > 0 && consumed_symbols.length > 0) ? "\n    | " : "") +
        skipped_symbols.map(
            sym => {
                return "skip " + getSymbolProductionName(sym);
            }).filter(a => !!a).join("\n    | ")
        }\n`,
        9999
    );

    entry.id = grammar.productions.push(entry) - 1;
    entry.name = name;
    entry.bodies.forEach((b, i) => {
        b.production = entry;
        b.length = 1;

        if (b.sym[0].name == "skip") {
            b.sym.splice(0, 1);
            b.priority = skipped_scan_prod;
        }

        const sym = b.sym[0];
        const production_lookup = createProductionLookup(grammar);
        processSymbol(
            grammar,
            sym,
            production_lookup,
            grammar.meta.all_symbols,
        );

        b.id = i + grammar.bodies.length;
    });

    grammar.bodies.push(...entry.bodies);

    buildItemMaps(grammar, [entry]);

    const data = constructProductionStates(
        entry,
        grammar,
    );

    for (const [name, state] of data.parse_states) {
        if (!scanner_states.has(name))
            scanner_states.set(name, state);
    }

    scanner_id_to_state.set(scanner_id, name);

    //Restore the original grammar

    grammar.productions.length = productions_length;
    grammar.bodies.length = bodies_length;
    grammar.item_map = old_item_map;
    grammar.meta.id_offset = old_symbol_offset;
    grammar.meta.all_symbols = old_symbols;

    return name;
}

export function convertParseProductsIntoStatesMap(ir_states: [string, string][], grammar: GrammarObject, states_map: StateMap) {
    for (const [string, ir_state_ast] of <([string, Resolved_IR_State])[]>[
        ...ir_states.map(

            //@ts-ignore
            function ([hash, str]) {

                try {
                    const { result: [ir_state], err } = parser(str, {}, ir);

                    if (err)
                        throw err;

                    return [str, ir_state];
                } catch (e) {
                    build_logger.get("PARSER").debug(str);
                    build_logger.get("PARSER").critical(hash, str);
                    throw e;
                }
            }
        ),
        ...grammar.ir_states.map(ir => [
            ir.tok.slice(),
            ir
        ])
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

export function createSymMapId(
    consumed_ids: number[],
    skipped_ids: number[],
    grammar: GrammarObject
) {

    const consumed = consumed_ids.filter(
        i => i > 1 && i != default_case_indicator
    ).map(i => grammar.meta.all_symbols.by_id.get(i));

    const skipped = skipped_ids.filter(
        i => i > 1 && i != default_case_indicator
    ).map(i => grammar.meta.all_symbols.by_id.get(i));

    if (consumed.length < 1 && skipped_ids.length < 1)
        return "";

    return (
        consumed.map(i => i.id).setFilter().sort(numeric_sort).join("-")
        + "-s-" +

        skipped.map(i => i.id).setFilter().sort(numeric_sort).join("-")
    );
}
