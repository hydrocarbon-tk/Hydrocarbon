/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { experimentalConstructRenderers, experimentalRender, traverse } from "@candlelib/conflagrate";
import {
    ExportPreamble, GrammarObject,
    GrammarProduction,
    HCG3ProductionBody, HCG3Symbol, ProductionSymbol,
    ProductionTokenSymbol, SymbolNode
} from "../../types/grammar_nodes";
import { InstructionType, IR_Instruction, IR_State } from '../../types/ir_types';
import { TokenTypes } from "../../types/TokenTypes";
import { token_lu_bit_size } from "../../utilities/code_generating.js";
import { createSequenceData } from "../../utilities/create_byte_sequences.js";
import { getSymbolTree, getSymbolTreeLeaves } from "../../utilities/getSymbolValueAtOffset.js";
import {
    addBodyToProduction,
    copyBody,
    removeBodySymbol
} from "../nodes/common.js";
import { default_array } from "../nodes/default_symbols.js";
import { hcg3_mappings } from "../nodes/mappings.js";
import {
    getUniqueSymbolName,
    Symbols_Are_The_Same,
    Sym_Is_A_Production,
    Sym_Is_A_Production_Token,
    Sym_Is_A_Token,
    Sym_Is_Defined,
    Sym_Is_EOF,
    Sym_Is_EOP,
    Sym_Is_Exclusive,
    Sym_Is_Look_Behind
} from "../nodes/symbol.js";
let renderers = null;
export const render_grammar = (grammar_node) => {

    if (!renderers)
        renderers = experimentalConstructRenderers(hcg3_mappings);

    return experimentalRender(grammar_node, hcg3_mappings, renderers).string;
};

function assignEntryProductions(grammar: GrammarObject, production_lookup) {

    let HAVE_ENTRY_PRODUCTIONS = false;
    //*
    for (const { production: { production }, reference } of grammar.preamble.filter((p): p is ExportPreamble => p.type == "export")) {

        if (production) {
            production.IS_ENTRY = true;
            production.entry_name = reference;
            HAVE_ENTRY_PRODUCTIONS = true;
        }
    }
    //*/

    if (!HAVE_ENTRY_PRODUCTIONS) {
        grammar.productions[0].IS_ENTRY = true;
        grammar.productions[0].entry_name = grammar.productions[0].name;
    }

}

/**
 * Finds all unique symbols types amongst production and ignore symbols and
 * adds them to the grammar's meta.all_symbols Map, keyed by the result 
 * of c
 * @param grammar 
 */
export function processSymbols(grammar: GrammarObject, errors: Error[] = []) {


    let id_offset = TokenTypes.CUSTOM_START_POINT;

    //Add default generated symbols to grammar
    const unique_map: Map<string, HCG3Symbol> = getUniqueSymbolMap(grammar);

    if (grammar.meta.id_offset)
        id_offset = grammar.meta.id_offset;

    const token_production_set: Set<string> = new Set();

    let b_counter = 0, p_counter = 0, bodies = [];

    grammar.productions[0].ROOT_PRODUCTION = true;

    const production_lookup: Map<string, GrammarProduction>
        = createProductionLookup(grammar);

    for (const production of grammar.productions)
        production.id = p_counter++;

    for (const production of grammar.productions)
        ({ b_counter, id_offset } = processProductionBodySymbols(
            grammar,
            production,
            bodies,
            b_counter,
            id_offset,
            production_lookup,
            unique_map,
            token_production_set,
            errors
        ));

    for (const export_preamble of grammar.preamble.filter((p): p is ExportPreamble => p.type == "export")) {
        id_offset = processSymbol(
            grammar,
            export_preamble.production,
            production_lookup,
            unique_map,
            token_production_set,
            errors,
            id_offset
        );
    }

    for (const ir_state of grammar.ir_states)

        id_offset = processIRStateSymbols(
            grammar,
            ir_state,
            id_offset,
            production_lookup,
            unique_map,
            token_production_set,
            errors
        );

    for (const g of [grammar, ...grammar.imported_grammars.map(g => g.grammar)])
        for (const sym of g.meta.ignore)
            id_offset = processSymbol(grammar, sym, production_lookup, unique_map, token_production_set, errors, id_offset);


    grammar.bodies = bodies;

    grammar.meta.id_offset = id_offset;

    buildSymbolContainers(grammar, production_lookup, unique_map);
}

function getUniqueSymbolMap(grammar: GrammarObject): Map<string, HCG3Symbol> {
    return <Map<string, HCG3Symbol>>grammar.meta.all_symbols
        ??
        new Map(default_array.map(sym => [getUniqueSymbolName(sym), sym]));
}

export function createProductionLookup(grammar: GrammarObject) {
    const production_lookup: Map<string, GrammarProduction> = new Map();

    for (const production of grammar.productions)
        production_lookup.set(production.name, production);
    return production_lookup;
}

function buildSymbolContainers(
    grammar: GrammarObject,
    production_lookup: Map<string, GrammarProduction>,
    unique_map: Map<string, HCG3Symbol>,
) {

    grammar.meta.all_symbols = <any>unique_map;

    const symbol_ids_array = [...unique_map.values()].filter(s => s.id).map(s => s.id).sort((a, b) => a - b).filter(i => i >= 1);
    grammar.meta.all_symbols.by_id = new Map([...unique_map.values()].map((sym) => [sym.id, sym]));

    grammar.meta.token_row_size = (Math.ceil(symbol_ids_array.slice(-1)[0] / 32) * 32) / token_lu_bit_size;

    assignEntryProductions(grammar, production_lookup);
}

function processProductionBodySymbols(
    grammar: GrammarObject,
    production: GrammarProduction,
    bodies: any[],
    b_counter: number,
    id_offset: TokenTypes,
    production_lookup: Map<any, any>,
    unique_map: Map<string, HCG3Symbol>,
    token_production_set: Set<string>,
    errors: Error[]
) {
    for (const body of production.bodies) {

        body.production = production;

        bodies.push(body);

        body.id = b_counter++;

        body.length = body.sym.length;

        for (const sym of body.sym)
            id_offset = processSymbol(grammar, sym, production_lookup, unique_map, token_production_set, errors, id_offset);

        for (const sym of body?.reset?.flat() ?? [])
            id_offset = processSymbol(grammar, sym, production_lookup, unique_map, token_production_set, errors, id_offset);

        for (const sym of body?.ignore?.flat() ?? [])
            id_offset = processSymbol(grammar, sym, production_lookup, unique_map, token_production_set, errors, id_offset);

        for (const sym of body?.excludes?.flat(2) ?? [])
            id_offset = processSymbol(grammar, sym, production_lookup, unique_map, token_production_set, errors, id_offset);
    }
    return { b_counter, id_offset };
}

function processIRStateSymbols(
    grammar: GrammarObject,
    ir_state: IR_State,
    id_offset: TokenTypes,
    production_lookup: Map<any, any>,
    unique_map: Map<string, HCG3Symbol>,
    token_production_set: Set<string>,
    errors: Error[]
) {


    const instructions = ir_state.instructions;

    id_offset = processIRInstructionSymbols(grammar, instructions, id_offset, production_lookup, unique_map, token_production_set, errors);

    if (ir_state.fail) {
        id_offset = processIRStateSymbols(grammar, ir_state.fail, id_offset, production_lookup, unique_map, token_production_set, errors);
    }

    return id_offset;
}

function processIRInstructionSymbols(
    grammar: GrammarObject,
    instructions: IR_Instruction[],
    id_offset: TokenTypes,
    production_lookup: Map<any, any>,
    unique_map: Map<string, HCG3Symbol>,
    token_production_set: Set<string>,
    errors: Error[]
) {
    for (const instruction of instructions) {
        switch (instruction.type) {

            case InstructionType.assert:
            case InstructionType.peek:
            case InstructionType.scan_back_until:
            case InstructionType.scan_until:

                const new_ids: number[] = [];
                for (const sym of instruction.ids)
                    if (typeof sym != "number") {
                        id_offset = processSymbol(grammar, sym, production_lookup, unique_map, token_production_set, errors, id_offset);
                        if (Sym_Is_A_Token(sym)) {
                            new_ids.push(sym.id);
                        } else {
                            //@ts-ignore
                            new_ids.push(sym.production.id);
                        }
                    } else
                        new_ids.push(sym);

                instruction.ids = new_ids;

                if ("instructions" in instruction) {
                    processIRInstructionSymbols(grammar, instruction.instructions, id_offset, production_lookup, unique_map, token_production_set, errors);
                } break;

            case InstructionType.set_prod:
                //case InstructionType.set_token:
                if (typeof instruction.id != "number") {

                    id_offset = processSymbol(grammar, instruction.id, production_lookup, unique_map, token_production_set, errors, id_offset);
                    //@ts-ignore
                    instruction.id = instruction.id.production.id;

                } break;

            case InstructionType.fork_to: {

                const new_states: string[] = [];

                for (const sym of instruction.states)
                    if (typeof sym != "string") {
                        id_offset = processSymbol(grammar, sym, production_lookup, unique_map, token_production_set, errors, id_offset);
                        new_states.push(sym.name);
                    } else
                        new_states.push(sym);

                instruction.states = new_states;

            } break;

            case InstructionType.goto:
                if (typeof instruction.state != "string") {

                    id_offset = processSymbol(grammar, instruction.state, production_lookup, unique_map, token_production_set, errors, id_offset);

                    instruction.state = instruction.state.name;
                } break;
        }
    }
    return id_offset;
}

export function createCollisionMatrix(grammar: GrammarObject) {

    const collision_matrix: boolean[][] = [];

    for (const symA of grammar.meta.all_symbols.values()) {

        if (Sym_Is_A_Production(symA))
            continue;

        const j = [];

        collision_matrix[symA.id] = j;

        for (const symB of grammar.meta.all_symbols.values()) {

            if (
                symB == symA
                || Sym_Is_EOF(symA)
                || Sym_Is_EOF(symB)
                || Sym_Is_Look_Behind(symA) || Sym_Is_Look_Behind(symB)
            ) {
                j[symB.id] = (!!0);
            } else if (Sym_Is_A_Production(symB)) {
                continue;
            }
            if (Sym_Is_Defined(symA) && Sym_Is_Defined(symB) &&
                symA.val == symB.val && !Symbols_Are_The_Same(symB, symA)) {
                j[symB.id] = (!!1);
            } else if (Symbols_Are_Ambiguous(symA, symB, grammar)) {
                j[symB.id] = (!!1);
            } else {
                j[symB.id] = (!!0);
            }
        }
    }

    grammar.collision_matrix = collision_matrix;
}

function Symbols_Are_Ambiguous(symA, symB, grammar) {

    for (const node of getSymbolTreeLeaves(getSymbolTree([symA, symB], grammar))) {
        if (node.symbols.length > 1 && node.offset > 0) {
            if (node.symbols.filter(Sym_Is_Exclusive).length > 0)
                return false;
            else {
                return true;
            }
        }
    }
    return false;
}


class MissingProduction extends Error {
    constructor(ref_sym: ProductionSymbol | ProductionTokenSymbol) {
        super(`Missing production ${ref_sym.name}`);
    }
    get stack() { return ""; }
}


export function processSymbol(
    grammar: GrammarObject,
    sym: HCG3Symbol,
    production_lookup: Map<string, GrammarProduction>,
    unique_map: Map<string, HCG3Symbol>,
    token_production_set: Set<string> = new Set,
    errors: Error[] = [],
    id_offset: number = 0
): number {
    //-----------------------

    //-----------------------

    if (Sym_Is_A_Production(sym) || Sym_Is_A_Production_Token(sym)) {

        let prod = production_lookup.get(sym.name);

        if (!prod) {
            addProductionNotFoundError(errors, sym);
        } else
            sym.val = prod.id;
    }


    if (Sym_Is_A_Production(sym) || Sym_Is_A_Production_Token(sym))
        sym.production = <any>production_lookup.get(sym.name);

    const unique_name = getUniqueSymbolName(sym, true);

    if (!unique_map.has(unique_name)) {
        if (Sym_Is_Defined(sym))
            sym.byte_length = sym.val.length;

        const copy_sym = Object.assign({}, sym);

        if (Sym_Is_A_Production_Token(copy_sym) && !token_production_set.has(unique_name)) {
            copy_sym.token_id = token_production_set.size;
            token_production_set.add(unique_name);
        }

        if (Sym_Is_A_Production(sym))
            copy_sym.id = -1;
        else {

            copy_sym.id = id_offset++;
        }

        copy_sym.IS_NON_CAPTURE = undefined;

        unique_map.set(unique_name, copy_sym);
    }

    const prime = unique_map.get(unique_name);

    if (Sym_Is_A_Production_Token(prime))
        //@ts-ignore
        sym.token_id = prime.token_id;

    if (Sym_Is_Defined(prime))
        //@ts-ignore
        sym.byte_length = prime.byte_length;

    sym.id = prime.id;

    return id_offset;
}


function addProductionNotFoundError(errors: Error[], sym: ProductionSymbol | ProductionTokenSymbol) {
    const tok = (sym.tok || (<any>sym).pos);

    if (tok.createError) {
        errors.push(tok.createError(
            `Production [${sym.name}] not found`
        ));
    } else {
        errors.push(new Error(`Production [${sym.name}] not found`));
    }
}

export function buildSequenceString(grammar: GrammarObject) {
    grammar.sequence_string = createSequenceData(grammar);
}

export function expandOptionalBody(production: GrammarProduction) {
    const processed_set = new Set();

    let i = -1n;

    for (const body of production.bodies)
        for (const sym of body.sym) {
            if (!sym.meta) i++;
            sym.opt_id = 1n << (i);
        }


    for (const body of production.bodies) {
        for (const { node, meta } of traverse(body, "sym", 2).skipRoot().makeMutable()) {
            const sym: SymbolNode = <any>node;
            if (sym.IS_OPTIONAL) {
                const OPTIONAL_CLASS = sym.IS_OPTIONAL >> 8;
                if (OPTIONAL_CLASS == 0 || body.sym.filter(s => s.IS_OPTIONAL && (s.IS_OPTIONAL >> 8) == OPTIONAL_CLASS && s !== sym).length > 0) {

                    const new_id = body.sym.filter((s) => s.opt_id != sym.opt_id).reduce((r, n) => (n.opt_id | r), 0n);

                    if (!processed_set.has(new_id)) {
                        processed_set.add(new_id);
                        const new_body = copyBody(body);
                        removeBodySymbol(new_body, meta.index, sym.opt_id);
                        addBodyToProduction(production, new_body);
                    }
                } else {
                    sym.IS_OPTIONAL = 0;
                }
            }
        }
    }
}

export function getProductionSignature(production: GrammarProduction) {

    const body_strings = production.bodies.map(getBodySignature).sort();

    return body_strings.join("\n | ");
}

export function getBodySignature(body: HCG3ProductionBody) {

    return render_grammar(body) || "$EMPTY";
}


