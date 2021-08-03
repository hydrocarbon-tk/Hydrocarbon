
import { copy, experimentalConstructRenderers, experimentalRender, traverse } from "@candlelib/conflagrate";
import { TokenTypes } from "source/typescript/runtime/TokenTypes";
import {
    HCG3Grammar,
    HCG3Production,
    HCG3ProductionBody, HCG3ProductionSymbol,
    HCG3ProductionTokenSymbol,
    HCG3Symbol, HCG3SymbolNode
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
import { getUniqueSymbolName, Sym_Is_A_Production, Sym_Is_A_Production_Token, Sym_Is_Defined, Sym_Is_EOF, Sym_Is_EOP, Sym_Is_Exclusive, Sym_Is_Look_Behind } from "../nodes/symbol.js";
let renderers = null;
export const render = (grammar_node) => {
    if (!renderers)
        renderers = experimentalConstructRenderers(hcg3_mappings);
    return experimentalRender(grammar_node, hcg3_mappings, renderers);
};

function assignEntryProductions(grammar: HCG3Grammar, production_lookup) {
    let i = 0;

    let HAVE_ENTRY_PRODUCTIONS = false;
    //*
    for (const production of grammar.productions) {

        if (production.name == "__entries__") {

            for (const body of production.bodies) {

                const [sym] = body.sym;

                if (sym.type == "sym-production") {

                    production_lookup.get(sym.name).IS_ENTRY = true;

                    HAVE_ENTRY_PRODUCTIONS = true;
                }
            }

            grammar.productions.splice(i, 1);

            break;
        }
        i++;
    }
    //*/

    if (!HAVE_ENTRY_PRODUCTIONS)
        grammar.productions[0].IS_ENTRY = true;

}

/**
 * Finds all unique symbols types amongst production and ignore symbols and
 * adds them to the grammar's meta.all_symbols Map, keyed by the result 
 * of c
 * @param grammar 
 */
export function processSymbols(grammar: HCG3Grammar, errors: Error[] = []) {


    let id_offset = TokenTypes.CUSTOM_START_POINT;

    //Add default generated symbols to grammar
    const unique_map: Map<string, HCG3Symbol> = <Map<string, HCG3Symbol>>new Map(
        default_array.map(sym => [getUniqueSymbolName(sym), sym])
    );

    let b_counter = 0, p_counter = 0, bodies = [], reduce_lu: Map<string, number> = new Map();

    const production_lookup = new Map();

    grammar.productions[0].ROOT_PRODUCTION = true;


    for (const production of grammar.productions)
        production_lookup.set(production.name, production);

    assignEntryProductions(grammar, production_lookup);


    for (const production of grammar.productions)
        production.id = p_counter++;


    for (const production of grammar.productions) {
        for (const body of production.bodies) {

            body.production = production;

            bodies.push(body);

            body.id = b_counter++;

            body.length = body.sym.length;

            if (body.reduce_function) {
                const txt = body.reduce_function.js;

                if (!reduce_lu.has(txt))
                    reduce_lu.set(txt, reduce_lu.size);

                body.reduce_id = reduce_lu.get(txt);

            } else
                body.reduce_id = -1;

            for (const sym of body.sym)
                id_offset = processSymbol(sym, production_lookup, unique_map, errors, id_offset);
        }
    }

    grammar.meta.all_symbols = unique_map;
    grammar.reduce_functions = reduce_lu;
    grammar.bodies = bodies;

    for (const g of [grammar, ...grammar.imported_grammars.map(g => g.grammar)])
        for (const sym of g.meta.ignore)
            id_offset = processSymbol(sym, production_lookup, unique_map, errors, id_offset);


}

export function createCollisionMatrix(grammar: HCG3Grammar) {

    const collision_matrix: boolean[][] = [];

    for (const symA of grammar.meta.all_symbols.values()) {

        if (Sym_Is_A_Production(symA))
            continue;

        const j = [];

        collision_matrix[symA.id] = j;

        for (const symB of grammar.meta.all_symbols.values()) {

            if (symB == symA || Sym_Is_EOF(symA) || Sym_Is_EOP(symA) || Sym_Is_EOF(symB) || Sym_Is_EOP(symB) || Sym_Is_Look_Behind(symA) || Sym_Is_Look_Behind(symB)) {
                j[symB.id] = (!!0);
            } else if (Sym_Is_A_Production(symB)) {
                continue;
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
            if (node.symbols.filter(Sym_Is_Exclusive).length == 1)
                return false;
            else
                return true;
        }
    }

    return false;
}


class MissingProduction extends Error {
    constructor(ref_sym: HCG3ProductionSymbol | HCG3ProductionTokenSymbol) {
        super(`Missing production ${ref_sym.name}`);
    }
    get stack() { return ""; }
}

export function processSymbol(
    sym: HCG3Symbol,
    production_lookup: Map<any, any>,
    unique_map: Map<string, HCG3Symbol>,
    errors: Error[],
    id_offset: number
): number {
    //-----------------------
    sym.pos = {};
    //-----------------------

    if (Sym_Is_A_Production(sym) || Sym_Is_A_Production_Token(sym)) {

        const prod = production_lookup.get(sym.name);

        if (!prod) {
            errors.push(new MissingProduction(sym));
        } else
            sym.val = production_lookup.get(sym.name)?.id;
    }

    const unique_name = getUniqueSymbolName(sym, true);

    if (!unique_map.has(unique_name)) {

        if (Sym_Is_Defined(sym))
            sym.byte_length = sym.val.length;

        const copy_sym = copy(sym);

        if (Sym_Is_A_Production(sym) || Sym_Is_A_Production_Token(sym))
            copy_sym.production = production_lookup.get(sym.name);

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

    if (Sym_Is_Defined(prime))
        //@ts-ignore
        sym.byte_length = prime.byte_length;

    sym.id = prime.id;

    return id_offset;
}


export function buildSequenceString(grammar: HCG3Grammar) {
    grammar.sequence_string = createSequenceData(grammar);
}

export function expandOptionalBody(production: HCG3Production) {
    const processed_set = new Set();

    let i = 0n;

    for (const body of production.bodies)
        for (const sym of body.sym) {
            sym.opt_id = 1n << (i);
            if (!sym.meta) i++;
        }


    for (const body of production.bodies) {
        for (const { node, meta } of traverse(body, "sym").makeMutable()) {
            const sym: HCG3SymbolNode = <any>node;
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

export function getProductionSignature(production: HCG3Production) {

    const body_strings = production.bodies.map(getBodySignature).sort();

    return body_strings.join("\n | ");
}

export function getBodySignature(body: HCG3ProductionBody) {

    return render(body) || "$EMPTY";
}


