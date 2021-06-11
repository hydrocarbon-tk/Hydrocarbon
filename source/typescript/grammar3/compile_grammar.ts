
import { copy, experimentalConstructRenderers, experimentalRender, traverse } from "@candlelib/conflagrate";
import { exp, JSNodeClass, JSNodeType, renderCompressed } from "@candlelib/js";
import { EOF_SYM } from "../types/grammar.js";
import {
    HCG3Grammar,
    HCG3Production,
    HCG3Symbol,
    HCGProductionBody
} from "../types/grammar_nodes";
import { createSequenceData } from "../utilities/grammar.js";
import { buildItemMaps } from "../utilities/item_map.js";
import { getUniqueSymbolName, Sym_Is_A_Production, Sym_Is_A_Production_Token } from "../utilities/symbol.js";
import {
    addBodyToProduction,
    addSymbolToBody,
    Body_Has_Reduce_Action,
    copyBody,
    createProduction,
    createProductionBody,
    createProductionSymbol,
    registerProduction,
    removeBodySymbol,
    replaceAllBodySymbols,
    replaceBodySymbol,
    setBodyReduceExpressionAction, Sym_Is_Group_Production, Sym_Is_List_Production
} from "./common.js";
import { hcg3_mappings } from "./conflagrate_mappings.js";

const renderers = experimentalConstructRenderers(hcg3_mappings);
const render = (grammar_node) => experimentalRender(grammar_node, hcg3_mappings, renderers);

/**
 * Finds all unique symbols types amongst production and ignore symbols and
 * adds them to the grammar's meta.all_symbols Map, keyed by the result 
 * of c
 * @param grammar 
 */
export function createUniqueSymbolSet(grammar: HCG3Grammar) {

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
            }

            for (const sym of body.sym) {

                if (Sym_Is_A_Production(sym) || Sym_Is_A_Production_Token(sym)) {
                    sym.val = production_lookup.get(sym.name)?.id;
                }

                const unique_name = getUniqueSymbolName(sym);

                if (!unique_map.has(unique_name))
                    unique_map.set(unique_name, copy(sym));

                if (Sym_Is_A_Production(sym) || Sym_Is_A_Production_Token(sym)) {
                    sym.production = production_lookup.get(sym.name);
                }

                sym.id = s_counter++;
            }
        }
    }

    grammar.meta = Object.assign({}, grammar.meta ?? {}, {
        all_symbols: unique_map,
        ignore: [grammar.preamble.filter(t => t.type == "ignore")[0]].filter(i => !!i),
        reduce_functions: reduce_lu
    });

    for (const ignore of grammar.meta.ignore) {
        for (const sym of ignore.symbols) {
            if (Sym_Is_A_Production(sym) || Sym_Is_A_Production_Token(sym)) {
                sym.val = production_lookup.get(sym.name)?.id;
            }

            const unique_name = getUniqueSymbolName(sym);

            if (!unique_map.has(unique_name))
                unique_map.set(unique_name, copy(sym));
        }
    }

    grammar.reduce_functions = reduce_lu;

    grammar.bodies = bodies;


}

export function createItemMaps(grammar: HCG3Grammar) {
    const processing_symbols = [];
    buildItemMaps(grammar);


}

export function buildSequenceString(grammar: HCG3Grammar) {
    grammar.sequence_string = createSequenceData(grammar);
}


export function createJSFunctionsFromExpressions(grammar: HCG3Grammar) {
    for (const production of grammar.productions) {
        for (const body of production.bodies) {
            if (body.reduce_function) {
                const expression = exp(`(${body.reduce_function.txt.replace(/(\${1,2}\d+)/g, "$1_")})`);

                const receiver = { ast: null };

                for (const { node, meta: { replace } } of traverse(expression, "nodes")
                    .bitFilter("type", JSNodeClass.IDENTIFIER)
                    .makeReplaceable((
                        parent,
                        child,
                        child_index,
                        children,
                        replaceParent
                    ) => {
                        if (child == null) {
                            if (
                                (parent.type &
                                    (
                                        JSNodeClass.UNARY_EXPRESSION
                                        | JSNodeClass.TERNARY_EXPRESSION
                                    )
                                )
                                || parent.type == JSNodeType.AssignmentExpression
                                || parent.type == JSNodeType.PropertyBinding
                                || parent.type == JSNodeType.VariableStatement
                                || parent.type == JSNodeType.BindingExpression
                                || parent.type == JSNodeType.MemberExpression
                                || parent.type == JSNodeType.SpreadExpression
                                || parent.type == JSNodeType.Parenthesized
                                || parent.type == JSNodeType.ExpressionStatement
                            )
                                return null;

                            if (parent.type == JSNodeType.Arguments && children.length <= 1) {
                                replaceParent();
                                return null;
                            }

                            if (parent.type == JSNodeType.CallExpression) {
                                return null;
                            }

                            if (parent.type == JSNodeType.ExpressionList
                                && child_index == 0
                                && children.length <= 1) {
                                return null;
                            }

                            if (parent.type & JSNodeClass.BINARY_EXPRESSION) {
                                replaceParent();
                                return children[1 - child_index];
                            }
                        }

                        return parent ? Object.assign({}, parent) : null;
                    })
                    .extract(receiver)
                ) {


                    const
                        value = <string>node.value,
                        IS_REPLACE_SYM = value.slice(0, 1) == "$",
                        IS_NULLIFY_SYM = value.slice(0, 2) == "$$";


                    if (IS_NULLIFY_SYM || IS_REPLACE_SYM) {

                        let index = parseInt(
                            IS_NULLIFY_SYM ?
                                value.slice(2) :
                                value.slice(1)
                        ) - 1;

                        if (value == "$NULL" || value == "$$NULL") {

                            if (IS_NULLIFY_SYM)
                                replace(exp("null"));
                            else
                                replace(null, true);

                        } else {
                            if (index >= 100)
                                index = body.sym.length - 1;
                            replace(exp(`sym[${index}]`));
                        }
                    }
                }

                const js = renderCompressed(receiver.ast);

                if (!js) {
                    body.reduce_function = null;
                } else {

                    body.reduce_function.js = `(env, sym, pos)=>${js}`;
                }
            }
        }
    }
}

function expandOptionalBody(production: HCG3Production) {
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

export function getProductionHash(production: HCG3Production) {

    const body_strings = production.bodies.map(getBodyHash).sort();

    return body_strings.join("\n | ");
}

export function getBodyHash(body: HCGProductionBody) {

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


export function convertListProductions(grammar: HCG3Grammar): HCG3Grammar {
    for (const production of grammar.productions) {

        for (const body of production.bodies) {
            for (const { node, meta } of traverse(body, "sym").skipRoot().makeMutable()) {

                const sym: any = node;

                if (!processListSymbol(sym, body, production, meta, grammar)) {

                    processGroupSymbol(sym, body, meta, production, grammar);
                }
            }
        }

        expandOptionalBody(production);

        //Remove bodies that are direct recursion: S=>S
        production.bodies = production.bodies.filter(b => {
            if (b.sym.length == 1 && b.sym[0].type == "sym-production" && b.sym[0].name == production.name) {
                return false;
            }
            return true;
        });
    }



    return grammar;
}
function processGroupSymbol(sym: any, body: HCG3Production, meta: any, production: HCG3Production, grammar: HCG3Grammar) {


    if (Sym_Is_Group_Production(sym)) {

        if (sym.IS_OPTIONAL) {

            const new_body = copyBody(body);

            removeBodySymbol(new_body, meta.index);

            addBodyToProduction(production, new_body);
        }

        let i = 0;

        for (const group_body of sym.val) {

            const new_body = (i == sym.val.length - 1) ? body : copyBody(body);

            if (Body_Has_Reduce_Action(group_body)) {

                // Complex grouped productions (those with reduce actions) will need to be
                // turned into new productions
                const
                    new_production_name = production.name + "_group_" + meta.index + "_" + i + "_";

                let new_production = createProduction(new_production_name, sym);

                addBodyToProduction(new_production, group_body);

                new_production = registerProduction(grammar, getProductionHash(new_production), new_production);

                const new_production_symbol = createProductionSymbol(new_production.name, sym.IS_OPTIONAL, sym);


                if (new_body == body)
                    meta.mutate(new_production_symbol, true);
                else
                    replaceBodySymbol(new_body, meta.index, new_production_symbol);

            } else {
                // Simple grouped productions bodies with no reduce actions can rolled into the original
                // production as new bodies. Script refs will need to updated to point to the correct
                // symbol indexes after this process is completed. 

                if (new_body == body)
                    meta.mutate(group_body.sym, true);
                else
                    replaceBodySymbol(new_body, meta.index, ...group_body.sym);

            }


            if (new_body != body)
                addBodyToProduction(production, new_body);


            i++;
        }
    }
}

function processListSymbol(sym: any, body: HCGProductionBody, production: HCG3Production, meta: any, grammar: HCG3Grammar) {
    if (Sym_Is_List_Production(sym)) {

        if (body.sym.length == 1 && !Body_Has_Reduce_Action(body) && production.bodies.length == 1) {
            // If the body is simple ( P => a(+) ) and contains no reduce actions
            // then unroll the body into two different bodies with synthesized 
            // reduce actions that wrap the parsed tokens into an array
            // ( P => a ) and ( P => P a )
            const inner_symbol = sym.val,
                terminal_symbol = sym.terminal_symbol,
                /** Contains the normal pattern */
                new_production_body = createProductionBody(sym),
                /** Contains the left recursive pattern */
                new_production_symbol = createProductionSymbol(production.name),

                TERMINAL_SYMBOL_IS_QUOTE = ["\"", "'", "`"].includes(terminal_symbol?.val);


            if (TERMINAL_SYMBOL_IS_QUOTE) {
                setBodyReduceExpressionAction(body, "$101 + \"\"");

                setBodyReduceExpressionAction(new_production_body, "$1 + $101");
            } else {

                setBodyReduceExpressionAction(body, "[$101]");



                setBodyReduceExpressionAction(new_production_body, "$1 .concat($101)");
            }

            //replaceAllBodySymbols(body, inner_symbol);
            if (terminal_symbol && !TERMINAL_SYMBOL_IS_QUOTE)
                replaceAllBodySymbols(new_production_body, new_production_symbol, terminal_symbol, inner_symbol);

            else
                replaceAllBodySymbols(new_production_body, new_production_symbol, inner_symbol);

            addBodyToProduction(production, new_production_body);

            meta.mutate(inner_symbol, true);

        } else {
            // Otherwise, create a new production with a single body containing 
            // the list symbols, and replace the symbol in the current body with 
            // a reference symbol to the new production. The new production will 
            // subsequently be converted.
            let
                new_production_name = production.name + "_list_" + meta.index,
                new_production = createProduction(new_production_name, sym),
                new_production_body = createProductionBody(sym);

            addSymbolToBody(new_production_body, sym);

            addBodyToProduction(new_production, new_production_body);

            new_production = registerProduction(grammar, getProductionHash(new_production), new_production);

            const new_production_symbol = createProductionSymbol(new_production.name, sym.IS_OPTIONAL, sym);

            new_production_symbol.IS_OPTIONAL = sym.IS_OPTIONAL;

            meta.mutate(new_production_symbol);
        }

        return true;
    }

    return false;
}