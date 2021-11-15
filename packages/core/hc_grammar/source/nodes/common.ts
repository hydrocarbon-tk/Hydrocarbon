/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { copy } from "@candlelib/conflagrate";
import {
    EmptySymbol,
    GrammarObject,
    GrammarProduction,
    GroupProductionSymbol,
    HCG3ProductionBody,
    HCG3Symbol,
    HCG3TokenPosition,
    ListProductionSymbol,
    ProductionFunction,
    ProductionImportSymbol,
    ProductionSymbol,
    ProductionTokenSymbol,
    SymbolNode,
    SymbolType,
    Token
} from '@hctoolkit/common';

export function getImportedGrammarFromReference(local_grammar: GrammarObject, module_name: string) {
    return local_grammar.imported_grammars.filter(g => g.reference == module_name)[0];
}

export function getProductionByName(
    grammar: GrammarObject,
    ref_symbol: ProductionTokenSymbol | ProductionSymbol | ProductionImportSymbol | string
): GrammarProduction {

    if (typeof ref_symbol == "string") {
        if (grammar.productions.some(p => p.name == ref_symbol))
            return grammar.productions.filter(p => p.name == ref_symbol)[0];

    } else if (ref_symbol.type == SymbolType.IMPORT_PRODUCTION) {
        const ref = grammar.imported_grammars.filter(s => s.reference == ref_symbol.module).pop();

        if (ref) {

            for (const p of ref.grammar.productions) {
                if (
                    (p.name
                        &&
                        p.name == ref_symbol.name)
                    ||
                    (
                        p.symbol.type == SymbolType.PRODUCTION
                        &&
                        p.symbol.name == ref_symbol.name
                    )
                )
                    return p;

                if (p.symbol.type == SymbolType.IMPORT_PRODUCTION) {

                    const module = p.symbol.module;

                    const inner_ref = getImportedGrammarFromReference(ref.grammar, module);

                    if (inner_ref) {


                        let production = getProductionByName(inner_ref.grammar, p.symbol);

                        if (production)
                            return production;
                    }
                }
            }
        }

    } else {

        const name = ref_symbol.name;

        if (grammar.productions.some(p => p.name == name))
            return grammar.productions.filter(p => p.name == name)[0];
    }

    return null;
}
export function Body_Has_Reduce_Action(body: HCG3ProductionBody) {
    return body.reduce_function != null;
}
export function copyBody(body: HCG3ProductionBody) {
    return copy(body);
}
export function replaceBodySymbol(body: HCG3ProductionBody, index: number, ...symbols: HCG3Symbol[]) {
    // Extend index values after the first body 
    const extension_count = getRealSymbolCount(symbols);

    offsetReduceFunctionSymRefs(body, index, extension_count - 1);

    body.sym.splice(index, 1, ...symbols);

    if (body.sym.length == 0) {
        body.length = 0;
        //body.sym.push(createEmptySymbol());
    }
}
export function getRealSymbolCount(symbols: (HCG3Symbol)[]) {

    //return symbols.length;
    return symbols.filter(s => !s.meta).length;
}

export function offsetReduceFunctionSymRefs(body: HCG3ProductionBody, offset_start: number, offset_count: number) {

    if (offset_count > 0 && Body_Has_Reduce_Action(body)) {

        if (body.reduce_function.type != "env-function-reference") {
            body.reduce_function.txt = body.reduce_function.txt.replace(/\$(\d+)/g, (m, p1) => {
                const val = parseInt(p1) - 1;
                if (val >= offset_start)
                    return "$" + (val + 1 + offset_count);
                return m;
            });
        }
    }
}

export function removeBodySymbol(
    body: HCG3ProductionBody,
    index: number,
    opt_id: bigint = -1n,
    sym_ids?: WeakMap<SymbolNode, bigint>
) {
    // Extend index values after the first body 
    if (Body_Has_Reduce_Action(body)) {

        if (
            body.reduce_function.type != "env-function-reference"
            &&
            body.reduce_function.type != "local-function-reference"

        ) {

            const removal_index = body.sym.reduce((r, s, i) => {
                if (!s.meta && i <= index && i > 0)
                    return r + 1;
                return r;
            }, 0);

            body.reduce_function.txt = body.reduce_function.txt.replace(/\$(\d+)/g, (m, p1) => {
                const val = parseInt(p1);
                if (val - 1 > removal_index)
                    return "$" + (val - 1);
                if (val - 1 == removal_index)
                    return "\$NULL";
                return m;

            });
        }
    }

    if (sym_ids) {

        body.sym = body.sym.filter(s => s.temp_id != opt_id);
    } else
        body.sym.splice(index, 1);



    if (body.sym.length == 0)
        body.sym.push(createEmptySymbol());
}

export function setBodyReduceExpressionAction(body: HCG3ProductionBody, reduce_function_string: string) {

    const function_node: ProductionFunction = {
        js: null,
        type: "RETURNED",
        txt: reduce_function_string,
        pos: new Token("     " + reduce_function_string, 0, reduce_function_string.length + 5, 0)
    };

    body.reduce_function = function_node;
}

export function replaceAllBodySymbols(body: HCG3ProductionBody, ...symbols: HCG3Symbol[]) {
    body.sym = [...symbols];
}

export function addSymbolToBody(new_production_body: HCG3ProductionBody, sym: ListProductionSymbol) {
    new_production_body.sym.push(sym);
}

export function addBodyToProduction(new_production: GrammarProduction, new_production_body: HCG3ProductionBody) {
    new_production.bodies.push(new_production_body);
}

export function addProductionToGrammar(grammar: GrammarObject, new_production: GrammarProduction) {
    grammar.productions.push(new_production);
}

export function Sym_Is_List_Production(sym: any): sym is ListProductionSymbol {
    return sym.type && (<ListProductionSymbol>sym).type == "list-production";
}

export function Sym_Is_Group_Production(sym: any): sym is GroupProductionSymbol {
    return sym.type && (<GroupProductionSymbol>sym).type == "group-production";
}

export function createProductionSymbol(name: string, IS_OPTIONAL: number = 0, mapped_sym: HCG3Symbol = null): ProductionSymbol {

    return {
        type: SymbolType.PRODUCTION,
        id: -1,
        val: -1,
        name: name,
        IS_NON_CAPTURE: false,
        IS_OPTIONAL: IS_OPTIONAL,
        tok: mapped_sym?.tok ?? createZeroedPosition(),
        meta: false,
        annotation: mapped_sym?.annotation ?? ""
    };
}
function createEmptySymbol(): EmptySymbol {
    return {
        type: SymbolType.EMPTY,
        val: "",
        byte_length: 0,
        byte_offset: 0,
        IS_NON_CAPTURE: false,
        IS_OPTIONAL: 0,
        tok: createZeroedPosition(),
        meta: false
    };
}
function createZeroedPosition(): HCG3TokenPosition {
    return new Token("", 0, 0, 0);
}
export function createProduction(name: string, mapped_sym: { pos?: Token, tok?: Token; } | null = null): GrammarProduction {
    return {
        type: "production",
        name: name,
        bodies: [],
        id: -1,
        tok: mapped_sym?.pos ?? mapped_sym?.tok ?? createZeroedPosition(),
        RECURSIVE: 0,
        recovery_handler: null,
    };
}
export function createProductionBody(mapped_sym: { pos?: Token, tok?: Token; } | null = null): HCG3ProductionBody {
    return {
        type: "body",
        FORCE_FORK: false,
        id: -1,
        sym: [],
        tok: mapped_sym?.pos ?? mapped_sym?.tok ?? createZeroedPosition(),
        reduce_function: null,
    };
}

export function registerProduction(
    grammar: GrammarObject,
    hash_string: string,
    production: GrammarProduction
): GrammarProduction {

    if (!grammar.production_hash_lookup)
        grammar.production_hash_lookup = new Map;

    if (grammar.production_hash_lookup.has(hash_string))
        return grammar.production_hash_lookup.get(hash_string);

    grammar.production_hash_lookup.set(hash_string, production);

    addProductionToGrammar(grammar, production);

    return production;
}

