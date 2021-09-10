
import { copy, experimentalConstructRenderers, experimentalRender, traverse } from "@candlelib/conflagrate";
import { TokenTypes } from "../../runtime/TokenTypes";
import { token_lu_bit_size } from "../../utilities/code_generating.js";
import {
    GrammarObject,
    GrammarProduction,
    HCG3ProductionBody, ProductionSymbol,
    ProductionTokenSymbol,
    HCG3Symbol, SymbolNode, ExportPreamble, ProductionNode
} from "../../types/grammar_nodes";
import { createSequenceData } from "../../utilities/create_byte_sequences.js";
import { getSymbolTreeLeaves, getSymbolTree } from "../../utilities/getSymbolValueAtOffset.js";
import {
    addBodyToProduction,
    copyBody,
    removeBodySymbol
} from "../nodes/common.js";
import { default_array } from "../nodes/default_symbols.js";
import { hcg3_mappings } from "../nodes/mappings.js";
import { getUniqueSymbolName, Symbols_Are_The_Same, Sym_Is_A_Production, Sym_Is_A_Production_Token, Sym_Is_A_Token, Sym_Is_Defined, Sym_Is_EOF, Sym_Is_EOP, Sym_Is_Exclusive, Sym_Is_Look_Behind } from "../nodes/symbol.js";
import { InstructionType, IR_Instruction, IR_State } from '../../types/ir_types';
let renderers = null;
export const render = (grammar_node) => {
    if (!renderers)
        renderers = experimentalConstructRenderers(hcg3_mappings);
    return experimentalRender(grammar_node, hcg3_mappings, renderers);
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
    const unique_map: Map<string, HCG3Symbol> = <Map<string, HCG3Symbol>>new Map(
        default_array.map(sym => [getUniqueSymbolName(sym), sym])
    );

    const token_production_set: Set<string> = new Set();

    let b_counter = 0, p_counter = 0, bodies = [];

    const production_lookup: Map<string, GrammarProduction> = new Map();

    grammar.productions[0].ROOT_PRODUCTION = true;


    for (const production of grammar.productions)
        production_lookup.set(production.name, production);


    for (const production of grammar.productions)
        production.id = p_counter++;


    for (const production of grammar.productions)
        ({ b_counter, id_offset } = processProductionBodySymbols(
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
            ir_state,
            id_offset,
            production_lookup,
            unique_map,
            token_production_set,
            errors
        );


    grammar.meta.all_symbols = <any>unique_map;

    grammar.bodies = bodies;

    for (const g of [grammar, ...grammar.imported_grammars.map(g => g.grammar)])
        for (const sym of g.meta.ignore)
            id_offset = processSymbol(sym, production_lookup, unique_map, token_production_set, errors, id_offset);

    const symbol_ids_array = [...unique_map.values()].filter(s => s.id).map(s => s.id).sort((a, b) => a - b).filter(i => i >= 1);
    grammar.meta.all_symbols.by_id = new Map([...unique_map.values()].map((sym) => [sym.id, sym]));
    grammar.meta.token_row_size = (Math.ceil(symbol_ids_array.slice(-1)[0] / 32) * 32) / token_lu_bit_size;

    assignEntryProductions(grammar, production_lookup);
}

function processProductionBodySymbols(production: GrammarProduction,
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
            id_offset = processSymbol(sym, production_lookup, unique_map, token_production_set, errors, id_offset);
    }
    return { b_counter, id_offset };
}

function processIRStateSymbols(ir_state: IR_State,
    id_offset: TokenTypes,
    production_lookup: Map<any, any>,
    unique_map: Map<string, HCG3Symbol>,
    token_production_set: Set<string>,
    errors: Error[]
) {


    const instructions = ir_state.instructions;

    id_offset = processIRInstructionSymbols(instructions, id_offset, production_lookup, unique_map, token_production_set, errors);

    if (ir_state.fail) {
        id_offset = processIRStateSymbols(ir_state.fail, id_offset, production_lookup, unique_map, token_production_set, errors);
    }

    return id_offset;
}

function processIRInstructionSymbols(
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
            case InstructionType.prod:
            case InstructionType.scan_back_until:
            case InstructionType.scan_until:

                const new_ids: number[] = [];
                for (const sym of instruction.ids)
                    if (typeof sym != "number") {
                        id_offset = processSymbol(sym, production_lookup, unique_map, token_production_set, errors, id_offset);
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
                    processIRInstructionSymbols(instruction.instructions, id_offset, production_lookup, unique_map, token_production_set, errors);
                } break;

            case InstructionType.set_prod:
                //case InstructionType.set_token:
                if (typeof instruction.id != "number") {

                    id_offset = processSymbol(instruction.id, production_lookup, unique_map, token_production_set, errors, id_offset);
                    //@ts-ignore
                    instruction.id = instruction.id.production.id;

                } break;

            case InstructionType.fork_to: {

                const new_states: string[] = [];

                for (const sym of instruction.states)
                    if (typeof sym != "string") {
                        id_offset = processSymbol(sym, production_lookup, unique_map, token_production_set, errors, id_offset);
                        new_states.push(sym.name);
                    } else
                        new_states.push(sym);

                instruction.states = new_states;

            } break;

            case InstructionType.goto:
                if (typeof instruction.state != "string") {

                    id_offset = processSymbol(instruction.state, production_lookup, unique_map, token_production_set, errors, id_offset);

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
                || Sym_Is_EOF(symA) || Sym_Is_EOP(symA)
                || Sym_Is_EOF(symB) || Sym_Is_EOP(symB)
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
    sym: HCG3Symbol,
    production_lookup: Map<string, GrammarProduction>,
    unique_map: Map<string, HCG3Symbol>,
    token_production_set: Set<string>,
    errors: Error[],
    id_offset: number
): number {
    //-----------------------
    sym.pos = {};
    //-----------------------

    if (Sym_Is_A_Production(sym) || Sym_Is_A_Production_Token(sym)) {

        const prod = production_lookup.get(sym.name);

        if (!prod) {
            console.dir(production_lookup, { depth: 1 });

            errors.push(new MissingProduction(sym));
        } else
            sym.val = production_lookup.get(sym.name)?.id;
    }

    const unique_name = getUniqueSymbolName(sym, true);

    if (!unique_map.has(unique_name)) {

        if (Sym_Is_Defined(sym))
            sym.byte_length = sym.val.length;

        const copy_sym = copy(sym);

        if (Sym_Is_A_Production(copy_sym) || Sym_Is_A_Production_Token(copy_sym))
            copy_sym.production = production_lookup.get(copy_sym.name);

        if (Sym_Is_A_Production_Token(copy_sym) && !token_production_set.has(unique_name)) {
            copy_sym.token_id = token_production_set.size;
            token_production_set.add(unique_name);
        }

        if (Sym_Is_A_Production(sym))
            copy_sym.id = -1;
        else
            copy_sym.id = id_offset++;

        copy_sym.IS_NON_CAPTURE = undefined;

        unique_map.set(unique_name, copy_sym);
    }


    if (Sym_Is_A_Production(sym) || Sym_Is_A_Production_Token(sym))
        sym.production = production_lookup.get(sym.name);

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


export function buildSequenceString(grammar: GrammarObject) {
    grammar.sequence_string = createSequenceData(grammar);
}

export function expandOptionalBody(production: GrammarProduction) {
    const processed_set = new Set();

    let i = 0n;

    for (const body of production.bodies)
        for (const sym of body.sym) {
            sym.opt_id = 1n << (i);
            if (!sym.meta) i++;
        }


    for (const body of production.bodies) {
        for (const { node, meta } of traverse(body, "sym").makeMutable()) {
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

    return render(body) || "$EMPTY";
}


