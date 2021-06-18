
import { copy, experimentalConstructRenderers, experimentalRender, traverse } from "@candlelib/conflagrate";
import { EOF_SYM } from "../../types/grammar.js";
import {
    HCG3Grammar,
    HCG3Production,
    HCG3ProductionSymbol,
    HCG3ProductionTokenSymbol,
    HCG3Symbol,
    HCGProductionBody
} from "../../types/grammar_nodes";
import { createSequenceData } from "../../utilities/grammar.js";
import { getUniqueSymbolName, Sym_Is_A_Production, Sym_Is_A_Production_Token } from "../nodes/symbol.js";
import {
    addBodyToProduction,

    Body_Has_Reduce_Action,
    copyBody,
    createProduction,

    createProductionSymbol,
    offsetReduceFunctionSymRefs,
    registerProduction,
    removeBodySymbol,

    replaceBodySymbol,
    Sym_Is_Group_Production
} from "../nodes/common.js";
import { hcg3_mappings } from "../nodes/mappings.js";

const renderers = experimentalConstructRenderers(hcg3_mappings);
const render = (grammar_node) => experimentalRender(grammar_node, hcg3_mappings, renderers);

/**
 * Finds all unique symbols types amongst production and ignore symbols and
 * adds them to the grammar's meta.all_symbols Map, keyed by the result 
 * of c
 * @param grammar 
 */
export function createUniqueSymbolSet(grammar: HCG3Grammar, errors: Error[] = []) {

    const unique_map: Map<string, HCG3Symbol> = new Map([[getUniqueSymbolName(EOF_SYM), EOF_SYM]]);

    let s_counter = 0, b_counter = 0, p_counter = 0, bodies = [], reduce_lu: Map<string, number> = new Map();

    const production_lookup = new Map();

    for (const production of grammar.productions) {
        grammar[p_counter] = production;
        production.id = p_counter++;
        production_lookup.set(production.name, production);
    }

    for (const production of grammar.productions) {

        for (const body of production.bodies) {

            body.production = production;

            bodies.push(body);

            body.id = b_counter++;

            body.length = body.sym.length;

            body.reset = new Map;

            body.excludes = new Map;

            if (body.reduce_function) {
                const txt = body.reduce_function.js;

                if (!reduce_lu.has(txt)) {
                    reduce_lu.set(txt, reduce_lu.size);
                }

                body.reduce_id = reduce_lu.get(txt);
            } else {
                body.reduce_id = -1;
            }

            for (const sym of body.sym) {
                processSymbol(sym, production_lookup, unique_map, errors);
                sym.id = s_counter++;
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

    const unique_name = getUniqueSymbolName(sym);

    if (!unique_map.has(unique_name))
        unique_map.set(unique_name, copy(sym));

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
        for (const sym of body.sym)
            sym.id = 1n << (i++);


    for (const body of production.bodies) {
        for (const { node, meta } of traverse(body, "sym").makeMutable()) {
            if (node.IS_OPTIONAL) {
                const new_id = body.sym.filter((_, i) => i != meta.index).reduce((r, n) => (n.id | r), 0n);

                if (!processed_set.has(new_id)) {
                    processed_set.add(new_id);
                    const new_body = copyBody(body);
                    removeBodySymbol(new_body, meta.index);
                    addBodyToProduction(production, new_body);
                }
            }
        }
    }
}

export function getProductionSignature(production: HCG3Production) {

    const body_strings = production.bodies.map(getBodySignature).sort();

    return body_strings.join("\n | ");
}

export function getBodySignature(body: HCGProductionBody) {

    return render(body) || "$EMPTY";
}

export function convertGroupProductions(grammar: HCG3Grammar): HCG3Grammar {
    for (const production of grammar.productions) {
        for (const { node: body, meta: b_meta } of traverse(production, "bodies").makeMutable()) {
            let REMOVE_ORIGINAL_BODY = false;
            for (const { node, meta } of traverse(body, "sym").makeMutable()) {
                const sym: any = node;

                REMOVE_ORIGINAL_BODY = processGroupSymbol(sym, REMOVE_ORIGINAL_BODY, body, meta, production, grammar);
            }
            if (REMOVE_ORIGINAL_BODY)
                b_meta.mutate(null);
        }
    }
    return grammar;
}


export function processGroupSymbol(sym: any, body: HCGProductionBody, meta: any, production: HCG3Production, grammar: HCG3Grammar, index: number) {


    if (Sym_Is_Group_Production(sym)) {

        if (sym.IS_OPTIONAL) {

            const new_body = copyBody(body);

            removeBodySymbol(new_body, meta.index);

            addBodyToProduction(production, new_body);
        }

        let i = 0;

        for (const group_body of sym.val) {

            const new_body: HCGProductionBody = (i == sym.val.length - 1) ? body : copyBody(body);

            if (Body_Has_Reduce_Action(group_body)) {

                // Complex grouped productions (those with reduce actions) will need to be
                // turned into new productions
                const
                    new_production_name = production.name + "_group_" + index + "_" + i + "_";


                let new_production = createProduction(new_production_name, sym);

                addBodyToProduction(new_production, group_body);

                new_production = registerProduction(grammar, getProductionSignature(new_production), new_production);

                const new_production_symbol = createProductionSymbol(new_production.name, sym.IS_OPTIONAL, sym);


                if (new_body == body) {
                    meta.mutate(new_production_symbol, true);
                } else
                    replaceBodySymbol(new_body, meta.index, new_production_symbol);

            } else {
                // Simple grouped productions bodies with no reduce actions can rolled into the original
                // production as new bodies. Script refs will need to updated to point to the correct
                // symbol indexes after this process is completed. 

                if (new_body == body) {

                    offsetReduceFunctionSymRefs(body, meta.index, group_body.sym.length - 1);
                    meta.mutate(group_body.sym, true);
                }
                else
                    replaceBodySymbol(new_body, meta.index, ...group_body.sym);

            }


            if (new_body != body)
                addBodyToProduction(production, new_body);


            i++;
        }
    }
}
