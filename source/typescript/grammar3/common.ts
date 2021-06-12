import { copy } from "@candlelib/conflagrate";
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
    HCGProductionBody,
    HCG3SymbolNode
} from "../types/grammar_nodes";


export function getProductionByName(grammar: HCG3Grammar, name: string): HCG3Production {
    if (grammar.productions.some(p => p.name == name))
        return grammar.productions.filter(p => p.name == name)[0];

    return null;
}
export function Body_Has_Reduce_Action(body: HCGProductionBody) {

    return body.reduce_function != null;

}
export function copyBody(body: HCGProductionBody) {
    return copy(body);
}
export function replaceBodySymbol(body: HCGProductionBody, index: number, ...symbols: HCG3Symbol[]) {
    // Extend index values after the first body 
    const extension_count = symbols.length;

    offsetReduceFunctionSymRefs(body, index, extension_count - 1);

    body.sym.splice(index, 1, ...symbols);

    if (body.sym.length == 0)
        body.sym.push(createEmptySymbol());
}
export function offsetReduceFunctionSymRefs(body: HCGProductionBody, offset_start: number, offset_count: number) {

    if (offset_count > 0 && Body_Has_Reduce_Action(body)) {
        body.reduce_function.txt = body.reduce_function.txt.replace(/\$(\d+)/g, (m, p1) => {
            const val = parseInt(p1);
            if (val > offset_start)
                return "$" + (val + offset_count);
            return m;
        });
    }
}

export function removeBodySymbol(body: HCGProductionBody, index: number) {
    // Extend index values after the first body 
    if (Body_Has_Reduce_Action(body)) {
        body.reduce_function.txt = body.reduce_function.txt.replace(/\$(\d+)/g, (m, p1) => {
            const val = parseInt(p1);
            if (val > index + 1)
                return "$" + (val - 1);
            if (val == index + 1)
                return "\$NULL";
            return m;
        });
    }

    body.sym.splice(index, 1);

    if (body.sym.length == 0)
        body.sym.push(createEmptySymbol());
}
export function setBodyReduceExpressionAction(body: HCGProductionBody, reduce_function_string: string) {

    const function_node: HCG3Function = {
        js: null,
        type: "RETURNED",
        txt: reduce_function_string
    };

    body.reduce_function = function_node;
}
export function replaceAllBodySymbols(body: HCGProductionBody, ...symbols: HCG3Symbol[]) {
    body.sym = [...symbols];
}
export function addSymbolToBody(new_production_body: HCGProductionBody, sym: HCG3ListProductionSymbol) {
    new_production_body.sym.push(sym);
}
export function addBodyToProduction(new_production: HCG3Production, new_production_body: HCGProductionBody) {
    new_production.bodies.push(new_production_body);
}
export function addProductionToGrammar(grammar: HCG3Grammar, new_production: HCG3Production) {
    grammar.productions.push(new_production);
}
export function Sym_Is_List_Production(sym: any): sym is HCG3ListProductionSymbol {
    return sym.type && (<HCG3ListProductionSymbol>sym).type == "list-production";
}
export function Sym_Is_Group_Production(sym: any): sym is HCG3GroupProduction {
    return sym.type && (<HCG3GroupProduction>sym).type == "group-production";
}

export function createProductionSymbol(name: string, IS_OPTIONAL: boolean = false, mapped_sym: HCG3GrammarNode = null): HCG3ProductionSymbol {
    return {
        type: 'sym-production',
        val: -1,
        name: name,
        IS_NON_CAPTURE: false,
        IS_OPTIONAL: IS_OPTIONAL,
        pos: mapped_sym?.pos ?? createZeroedPosition()
    };
}
function createEmptySymbol(): HCG3EmptySymbol {
    return {
        type: 'empty',
        val: "",
        byte_length: 0,
        byte_offset: 0,
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
export function createProduction(name: string, mapped_sym: HCG3GrammarNode = null): HCG3Production {
    return {
        type: "production",
        name: name,
        bodies: [],
        id: -1,
        recovery_handler: null,
        pos: mapped_sym?.pos ?? createZeroedPosition(),
    };
}
export function createProductionBody(mapped_sym: HCG3GrammarNode = null): HCGProductionBody {
    return {
        type: "body",
        FORCE_FORK: false,
        id: -1,
        sym: [],
        pos: mapped_sym?.pos ?? createZeroedPosition(),
        reduce_function: null,
    };
}

export function registerProduction(grammar: HCG3Grammar, hash_string, production: HCG3Production): HCG3Production {

    if (!grammar.production_hash_lookup)
        grammar.production_hash_lookup = new Map;

    if (grammar.production_hash_lookup.has(hash_string))
        return grammar.production_hash_lookup.get(hash_string);

    grammar.production_hash_lookup.set(hash_string, production);

    addProductionToGrammar(grammar, production);

    return production;
}

