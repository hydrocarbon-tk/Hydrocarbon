
import { copy, experimentalConstructRenderers, experimentalRender, traverse } from "@candlelib/conflagrate";
import { exp, ext, JSNodeClass, JSNodeType, renderCompressed } from "@candlelib/js";
import URI from "@candlelib/url";
import {
    HCG3EmptySymbol,
    HCG3Function,
    HCG3Grammar,
    HCG3GrammarNode,
    HCG3GroupProduction,
    HCG3ListProductionSymbol,
    HCG3Production,
    HCG3ProductionSymbol,
    HCG3Symbol,
    HCG3TokenPosition,
    HCGProductionBody
} from "../types/grammar_nodes";
import { nodeHash } from "../utilities/code_generating";
import { hcg3_mappings } from "./mappings.js";

const renderers = experimentalConstructRenderers(hcg3_mappings);
const render = (grammar_node) => experimentalRender(grammar_node, hcg3_mappings, renderers);
/**
 * Entry point to loading a grammar from a string
 * @param str 
 * @param grammar_parser 
 * @returns 
 */
export function loadGrammarFromString(str: string, grammar_parser: any): HCG3Grammar {
    const env = {};

    return grammar_parser(str, {})[0];
}

/**
 * Merges imported into a single mono grammar 
 */
export function getMonoGrammar(grammar: HCG3Grammar): HCG3Grammar {

}

export function convertToFullyQualifiedProductionNames(grammar: HCG3Grammar): HCG3Grammar {

}

export function createProductionLinks(grammar: HCG3Grammar): HCG3Grammar {
    return grammar;
}

export function expandOptionals(grammar: HCG3Grammar): HCG3Grammar {

    for (const production of grammar.productions) {

        expandOptionalBody(production);
    }


    return grammar;
}

export function createJSFunctionsFromExpressions(grammar: HCG3Grammar) {
    for (const production of grammar.productions) {
        for (const body of production.bodies) {
            if (body.reduce) {
                const expression = exp(`(${body.reduce.txt})`);

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

                        const index = parseInt(
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
                            replace(exp(`sym[${index}]`));
                        }
                    }
                }
                body.reduce.js = `()=>${renderCompressed(receiver.ast)}`;
            }
        }
    }
}

function expandOptionalBody(production: HCG3Production) {
    const processed_set = new Set();

    let i = 0n;

    for (const body of production.bodies)
        for (const sym of body.symbols)
            sym.id = 1n << (i++);


    for (const body of production.bodies) {
        for (const { node, meta } of traverse(body, "symbols").makeMutable()) {
            if (node.IS_OPTIONAL) {
                const new_id = body.symbols.filter((_, i) => i != meta.index).reduce((r, n) => (n.id | r), 0n);

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
            for (const { node, meta } of traverse(body, "symbols").makeMutable()) {
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
            for (const { node, meta } of traverse(body, "symbols").skipRoot().makeMutable()) {

                const sym: any = node;

                if (!processListSymbol(sym, body, production, meta, grammar)) {

                    processGroupSymbol(sym, body, meta, production, grammar);
                }
            }
        }

        expandOptionalBody(production);
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

        for (const group_body of sym.value) {

            const new_body = (i == sym.value.length - 1) ? body : copyBody(body);

            if (Body_Has_Reduce_Action(group_body)) {

                // Complex grouped productions (those with reduce actions) will need to be
                // turned into new productions
                const
                    new_production_name = production.name + ".g[" + meta.index + "," + i + "]";

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
                    meta.mutate(group_body.symbols, true);
                else
                    replaceBodySymbol(new_body, meta.index, ...group_body.symbols);

            }

            if (new_body != body)
                addBodyToProduction(production, new_body);


            i++;
        }
    }
}

function processListSymbol(sym: any, body: HCGProductionBody, production: HCG3Production, meta: any, grammar: HCG3Grammar) {
    if (Sym_Is_List_Production(sym)) {

        if (body.symbols.length == 1 && !Body_Has_Reduce_Action(body) && production.bodies.length == 1) {
            // If the body is simple ( P => a(+) ) and contains no reduce actions
            // then unroll the body into two different bodies with synthesized 
            // reduce actions that wrap the parsed tokens into an array
            // ( P => a ) and ( P => P a )
            const inner_symbol = sym.value,
                terminal_symbol = sym.terminal_symbol,
                /** Contains the normal pattern */
                new_production_body = createProductionBody(sym),
                /** Contains the left recursive pattern */
                new_production_symbol = createProductionSymbol(production.name, sym);

            setBodyReduceExpressionAction(body, "[$1]");

            setBodyReduceExpressionAction(new_production_body, "$1 .concat($2), $1");

            //replaceAllBodySymbols(body, inner_symbol);
            if (terminal_symbol)
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
/**
 * Responsible discovering and collecting ALL imported modules.
 * Multiple references to the same module are resolved and import 
 * names are unified
 */
export async function integrateImportedGrammars(grammar: HCG3Grammar, imports: Map<string, HCG3Grammar> = new Map) {
    //pull imports from the input grammar metadata

    // Unify grammar names
    // - create a common name for every imported grammar
    let i = 0;
    for (const import_ of grammar.imported_grammars) {
        import_.grammar.common_import_name = (new URI(import_.uri)).filename;

    }

    const imported_productions = new Map();

    // In primary grammar, find all import symbols. For each import symbol
    // look in respective grammar file for symbol. Import the production into the 
    // current grammar. Recurse into that production and import any production that have
    // not yet been imported. Repeat until all imported production symbols have been handled

    for (const production of grammar.productions)
        integrateImportedProductions(grammar, grammar, production, imported_productions);

    // Now remove merge productions and insert their bodies into the imported production. 
    // If the import does not exists, then the merge production is discarded
    for (const grmmr of [grammar, ...grammar.imported_grammars.map(g => g.grammar)])
        for (const { node: production, meta: { mutate } } of traverse(grmmr, "productions").makeMutable())
            if (production.type == "production-import") {

                const imported = getImportedGrammarFromReference(grmmr, production.name.module);

                const name = imported.grammar.common_import_name + "::" + production.name.production;

                if (imported_productions.has(name)) {

                    //Integrate the production 
                    integrateImportedGrammars(grammar, grmmr, production, imported_productions);

                    //And merge the production body into the target production
                    imported_productions.get(name).bodies = [...production.bodies];
                }

            } else if (production.type == "production-merged-import") {

                const imported = getImportedGrammarFromReference(grmmr, production.name.module);

                const name = imported.grammar.common_import_name + "::" + production.name.production;

                if (imported_productions.has(name)) {

                    //Integrate the production 
                    integrateImportedGrammars(grammar, grmmr, production, imported_productions);

                    //And merge the production body into the target production
                    imported_productions.get(name).bodies.push(...production.bodies);

                    mutate(null);
                }
            }

}

function integrateImportedProductions(root_grammar: HCG3Grammar, local_grammar: HCG3Grammar, production: HCG3Production, imported_productions: Map<any, any>) {


    for (const body of production.bodies) {
        for (const { node: sym, meta: { mutate } } of traverse(body, "symbols").makeMutable()) {
            if (root_grammar != local_grammar) {
                if (sym.type == "sym-production") {

                    const original_name = sym.value;

                    const name = local_grammar.common_import_name + "::" + original_name;

                    sym.value = name;


                    if (imported_productions.has(name)) {

                    } else {

                        const prd = getProductionByName(local_grammar, original_name);

                        if (prd) {
                            const cp = copy(prd);
                            cp.name = name;
                            console.log({ name });
                            imported_productions.set(name, cp);
                            root_grammar.productions.push(cp);
                            integrateImportedProductions(root_grammar, local_grammar, cp, imported_productions);
                        }
                    }
                }
            }

            if (sym.type == "sym-production-import") {
                const imported = getImportedGrammarFromReference(local_grammar, sym.module);

                //Convert symbol to a local name
                //Find the production that is referenced in the grammar
                const prd = getProductionByName(imported.grammar, sym.production);
                const name = imported.grammar.common_import_name + "::" + prd.name;

                mutate(<HCG3ProductionSymbol>{
                    type: "sym-production",
                    value: name,
                    IS_NON_CAPTURE: false,
                    IS_OPTIONAL: sym.IS_OPTIONAL || false,
                    pos: sym.pos
                });

                if (imported_productions.has(name)) {
                } else {

                    //copy production and convert the copies name to a local name 
                    const cp = copy(prd);
                    cp.name = name;

                    imported_productions.set(name, cp);
                    root_grammar.productions.push(cp);

                    integrateImportedProductions(root_grammar, imported.grammar, cp, imported_productions);
                }
            }
        }
    }
}

function getImportedGrammarFromReference(local_grammar: HCG3Grammar, module_: string) {
    return local_grammar.imported_grammars.filter(g => g.reference == module_)[0];
}

function registerProduction(grammar: HCG3Grammar, hash_string, production: HCG3Production): HCG3Production {

    if (!grammar.production_hash_lookup)
        grammar.production_hash_lookup = new Map;

    if (grammar.production_hash_lookup.has(hash_string))
        return grammar.production_hash_lookup.get(hash_string);

    grammar.production_hash_lookup.set(hash_string, production);

    addProductionToGrammar(grammar, production);

    return production;
}

function getProductionByName(grammar: HCG3Grammar, name: string): HCG3Production {
    if (grammar.productions.some(p => p.name == name))
        return grammar.productions.filter(p => p.name == name)[0];

    return null;
}

function getProductionByNameOrCreate(grammar: HCG3Grammar, name: string): HCG3Production {

    const prod = getProductionByName(grammar, name);

    if (prod) {

        return prod;

    } else {

        const
            new_production = createProduction(name);

        addProductionToGrammar(grammar, new_production);

        return new_production;
    }
}

function Body_Has_Reduce_Action(body: HCGProductionBody) {

    return body.reduce != null;

}


function copyBody(body: HCGProductionBody) {
    return copy(body);
}

function replaceBodySymbol(body: HCGProductionBody, index: number, ...symbols: HCG3Symbol[]) {
    // Extend index values after the first body 
    const extension_count = symbols.length;

    if (extension_count > 1 && Body_Has_Reduce_Action(body)) {
        body.reduce.txt = body.reduce.txt.replace(/\$(\d+)/g, (m, p1) => {
            const val = parseInt(p1);
            if (val > index)
                return "$" + (val + extension_count);
            return m;
        });
    }

    body.symbols.splice(index, 1, ...symbols);

    if (body.symbols.length == 0)
        body.symbols.push(createEmptySymbol());
}

function removeBodySymbol(body: HCGProductionBody, index: number) {
    // Extend index values after the first body 

    if (Body_Has_Reduce_Action(body)) {
        body.reduce.txt = body.reduce.txt.replace(/\$(\d+)/g, (m, p1) => {
            const val = parseInt(p1);
            if (val > index + 1)
                return "$" + (val - 1);
            if (val == index + 1)
                return "\$NULL";
            return m;
        });
    }

    body.symbols.splice(index, 1);

    if (body.symbols.length == 0)
        body.symbols.push(createEmptySymbol());
}


function setBodyReduceExpressionAction(body: HCGProductionBody, reduce_function_string: string) {

    const function_node: HCG3Function = {
        type: "RETURNED",
        txt: reduce_function_string
    };

    body.reduce = function_node;
}

function replaceAllBodySymbols(body: HCGProductionBody, ...symbols: HCG3Symbol[]) {
    body.symbols = [...symbols];
}

function addSymbolToBody(new_production_body: HCGProductionBody, sym: HCG3ListProductionSymbol) {
    new_production_body.symbols.push(sym);
}

function addBodyToProduction(new_production: HCG3Production, new_production_body: HCGProductionBody) {
    new_production.bodies.push(new_production_body);
}

function addProductionToGrammar(grammar: HCG3Grammar, new_production: HCG3Production) {
    grammar.productions.push(new_production);
}

function Sym_Is_List_Production(sym: any): sym is HCG3ListProductionSymbol {
    return sym.type && (<HCG3ListProductionSymbol>sym).type == "list-production";
}

function Sym_Is_Group_Production(sym: any): sym is HCG3GroupProduction {
    return sym.type && (<HCG3GroupProduction>sym).type == "group-production";
}

function createProductionSymbol(name: string, IS_OPTIONAL: boolean = false, mapped_sym: HCG3GrammarNode = null): HCG3ProductionSymbol {
    return {
        type: 'sym-production',
        value: name,
        IS_NON_CAPTURE: false,
        IS_OPTIONAL: false,
        pos: mapped_sym?.pos ?? createZeroedPosition()
    };
}

function createEmptySymbol(): HCG3EmptySymbol {
    return {
        type: 'empty',
        value: "",
        IS_NON_CAPTURE: false,
        IS_OPTIONAL: false,
        pos: createZeroedPosition()
    };
}

function createZeroedPosition(): HCG3TokenPosition {
    return {
        column: 0,
        length: 0,
        line: 0,
        offset: 0
    };
}

function createProduction(name: string, mapped_sym: HCG3GrammarNode = null): HCG3Production {
    return {
        type: "production",
        name: name,
        bodies: [],
        id: -1,
        recovery_handler: null,
        pos: mapped_sym?.pos ?? createZeroedPosition(),
    };
}

function createProductionBody(mapped_sym: HCG3GrammarNode = null): HCGProductionBody {
    return {
        type: "body",
        FORCE_FORK: false,
        id: -1,
        symbols: [],
        pos: mapped_sym?.pos ?? createZeroedPosition(),
        reduce: null,
    };
}

/**
 * Entry point to loading a grammar file from a URI 
 */
export async function loadGrammarFromFile(uri: URI, grammar_parser: any, existing_grammars = new Map): HCG3Grammar {

    if (uri.IS_RELATIVE)
        uri = URI.resolveRelative(uri);

    const str = await uri.fetchText();

    const grammar = loadGrammarFromString(str, grammar_parser);

    grammar.uri = uri + "";

    //Load imported grammars

    for (const preamble of grammar.preamble) {

        if (preamble.type == "import") {

            const location = URI.resolveRelative(preamble.uri, uri);

            preamble.full_uri = location + "";

            if (existing_grammars.has(location + "")) {
                grammar.imported_grammars.push({
                    reference: preamble.reference,
                    uri: location + "",
                    grammar: existing_grammars.get(location + "")
                });

            } else {
                const import_grammar = await loadGrammarFromFile(location, grammar_parser, existing_grammars);

                grammar.imported_grammars.push({
                    reference: preamble.reference,
                    uri: location + "",
                    grammar: import_grammar
                });
            }
        }
    }

    existing_grammars.set(uri + "", grammar);

    return grammar;
};

/**
 * Loads grammar file from import nodes
 */
export function importGrammarFile() { }