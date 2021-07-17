
import { copy, experimentalConstructRenderers, experimentalRender, traverse } from "@candlelib/conflagrate";
import { EOF_SYM, EOP_SYM } from "../../types/grammar.js";
import {
    HCG3Grammar,
    HCG3Production,
    HCG3ProductionSymbol,
    HCG3ProductionTokenSymbol,
    HCG3Symbol,
    HCG3ProductionBody
} from "../../types/grammar_nodes";
import { createSequenceData } from "../../utilities/grammar.js";
import { getUniqueSymbolName, Sym_Is_A_Production, Sym_Is_A_Production_Token, Sym_Is_Defined } from "../nodes/symbol.js";
import {
    addBodyToProduction,

    copyBody,
    removeBodySymbol
} from "../nodes/common.js";
import { hcg3_mappings } from "../nodes/mappings.js";
import { HCG3SymbolNode } from "@candlelib/hydrocarbon/build/types/types/grammar_nodes";

let renderers = null;
export const render = (grammar_node) => {
    if (!renderers)
        renderers = experimentalConstructRenderers(hcg3_mappings);
    return experimentalRender(grammar_node, hcg3_mappings, renderers);
};

/**
 * Finds all unique symbols types amongst production and ignore symbols and
 * adds them to the grammar's meta.all_symbols Map, keyed by the result 
 * of c
 * @param grammar 
 */
export function createUniqueSymbolSet(grammar: HCG3Grammar, errors: Error[] = []) {


    const unique_map: Map<string, HCG3Symbol> = <Map<string, HCG3Symbol>>new Map();

    unique_map.set(getUniqueSymbolName(EOF_SYM), EOF_SYM);
    unique_map.set(getUniqueSymbolName(EOP_SYM), EOP_SYM);

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

            for (const sym of body.sym) {
                processSymbol(sym, production_lookup, unique_map, errors);
                //sym.id = s_counter++;
            }
        }
    }

    grammar.meta = Object.assign({}, grammar.meta ?? {}, {
        all_symbols: unique_map,
        ignore: [grammar.preamble.filter(t => t.type == "ignore")[0]].filter(i => !!i),
        reduce_functions: reduce_lu
    });

    for (const ignore of grammar.meta.ignore)
        for (const sym of ignore.symbols)
            processSymbol(sym, production_lookup, unique_map, errors);

    grammar.reduce_functions = reduce_lu;

    grammar.bodies = bodies;
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
    errors: Error[]
) {

    if (Sym_Is_A_Production(sym) || Sym_Is_A_Production_Token(sym)) {

        const prod = production_lookup.get(sym.name);

        if (!prod) {
            errors.push(new MissingProduction(sym));
        } else
            sym.val = production_lookup.get(sym.name)?.id;
    }

    const unique_name = getUniqueSymbolName(sym, true);

    if (!unique_map.has(unique_name)) {
        const copy_sym = copy(sym);
        copy_sym.id = unique_map.size;
        unique_map.set(unique_name, copy(sym));
    }

    if (Sym_Is_A_Production(sym) || Sym_Is_A_Production_Token(sym))
        sym.production = production_lookup.get(sym.name);

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


