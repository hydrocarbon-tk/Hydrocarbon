import wind from "@candlefw/wind";

import { getAssertionSymbolFirst, getUniqueSymbolName, isSymAnAssertFunction, isSymAProduction } from "../hybrid/utilities/utilities.js";
import { EOF_SYM, Grammar, SymbolType } from "../types/grammar.js";
import { AssertionFunctionSymbol, Symbol, TokenSymbol } from "../types/Symbol";
import { FIRST } from "./first.js";
import { FOLLOW } from "./follow.js";
import { Item } from "./item.js";
import { processClosure } from "./process_closure.js";



export { Item, FOLLOW, FIRST, processClosure };

export const types = wind.types;

const
    production_stack_arg_name = "sym",
    environment_arg_name = "env",
    lexer_arg_name = "lex";

export function getToken(l, SYM_LU, IGNORE_GRAMMAR_SYMBOLS: boolean = false) {
    if (l.END) return 0;

    if (!IGNORE_GRAMMAR_SYMBOLS)
        if (SYM_LU.has(l.tx) || SYM_LU.has(l.ty)) return SYM_LU.get(l.tx) || SYM_LU.get(l.ty);

    if ((l.ty & types.num)) {

        switch (l.ty) {
            case types.sci:
                return "sci";
            case types.hex:
                return "hex";
            case types.oct:
                return "oct";
            case types.bin:
                return "bin";
            case types.flt:
                return "flt";
            case types.int:
                return "int";
            default:
            case types.num:
                return "num";
        }
    }

    switch (l.ty) {
        case types.id:
            return "id";
        case types.string:
            return "str";
        case types.new_line:
            return "nl";
        case types.ws:
            return "ws";
        case types.tab:
            return "tb";
    }

    return "any";
}

/************ Grammar Production Functions *****************************/

function setFunction(env, funct, function_params = [], this_object = null) {

    let func;

    try {
        func = (Function).apply(this_object, function_params.concat([(funct.type == "RETURNED" ? "" : "") + funct.txt.trim()]));
    } catch (e) {
        func = () => { return { error: e, type: "error" }; };

        throw e;
    }

    return func;
}

function addFunctions(funct, production, env) {

    if (!env.id)
        env.id = 1;

    if (!env.FLUT)
        env.FLUT = new Map;

    if (!production.func_counter)
        production.func_counter = 0;

    if (!funct.env) {
        const str = funct.txt.trim();
        let name = env.FLUT.get(str);
        if (!name) {
            name = funct.type[0] + production.id + (production.func_counter++) + "_" + production.name.replace(/\$/g, "_");
            //funct.name = name;
            env.functions[name] = setFunction(null, funct, [production_stack_arg_name, environment_arg_name, lexer_arg_name, "pos", "output", "len"], {});
            env.functions[name].INTEGRATE = true;
            env.FLUT.set(str, name);
        }

        //funct.name = name;
    }
}

export function getPrecedence(term, grammar) {
    return -1;
}

export function createPrecedence(body, grammar) {
    const prec = body.precedence;
    let l = 0;
    for (let i = 0; i < body.length; i++) {
        l = Math.max(getPrecedence(body[i], grammar), l);
    }
    return (l >= 0) ? prec : Math.min(l, prec);
}


export function filloutGrammar(grammar: Grammar, env) {

    const bodies = [],
        reduce_lu: Map<string, number> = new Map,
        symbols: Map<string, Symbol> = new Map([[getUniqueSymbolName(EOF_SYM), EOF_SYM]]),
        syms = [...grammar?.meta?.symbols?.values() ?? []];

    for (let i = 0, j = 0; i < grammar.length; i++) {
        const production = grammar[i];

        if (production.recovery_handler) {
            const rh = production.recovery_handler;
            rh.txt = "return " + rh.body_text;

            if (!reduce_lu.has(rh.txt))
                reduce_lu.set(rh.txt, reduce_lu.size);

            rh.reduce_id = reduce_lu.get(rh.txt);
        }

        for (let i = 0; i < production.bodies.length; i++, j++) {

            const body = production.bodies[i];

            if (!!body.reduce_function) {

                const txt = body.reduce_function.name
                    ? `${body.reduce_function.type == "CLASS" ? "return new" : "return"} env.functions.${body.reduce_function.name}(sym, env, pos);`
                    : body.reduce_function.txt;

                if (!reduce_lu.has(txt))
                    reduce_lu.set(txt, reduce_lu.size);
                body.reduce_id = reduce_lu.get(txt);
            } else
                body.reduce_id = -1;

            body.id = j;
            body.production = production;
            bodies.push(body);
            body.precedence = createPrecedence(body, grammar);

            //Dedupes symbols 
            syms.push(...[...body.error.values(), ...body.excludes.values(), ...body.ignore.values(), body.sym].flat());

            if (env) {
                if (body.reduce_function)
                    addFunctions(body.reduce_function, production, env);

                body.functions.forEach(f => {
                    addFunctions(f, production, env);
                });
            }
        }
    }

    const sym_function = (s: Symbol) => {
        switch (s.type) {
            case SymbolType.PRODUCTION:
                /*Do nothing */ break;
            case SymbolType.PRODUCTION_ASSERTION_FUNCTION:
            case SymbolType.GENERATED:
            case SymbolType.SYMBOL:
            case SymbolType.ESCAPED:
            case SymbolType.LITERAL:
            default:
                symbols.set(getUniqueSymbolName(s), s);
        }
    };

    for (const sym of syms.setFilter(s => getUniqueSymbolName(s))) sym_function(sym);

    grammar.meta = Object.assign({}, grammar.meta, { all_symbols: symbols, reduce_functions: reduce_lu });
    grammar.bodies = bodies;

    for (const sym of syms.filter(isSymAnAssertFunction)) getAssertionSymbolFirst(<AssertionFunctionSymbol>sym, grammar);

    buildItemMap(grammar);

    return grammar;
}

export function buildItemMap(grammar: Grammar) {
    grammar.item_map = new Map(grammar.map(p => p.bodies.map(b => new Item(b.id, b.length, 0, EOF_SYM))).flatMap(i => {
        const out = [];

        for (let item of i) {
            while (item) {
                const { closure } = processClosure([item], grammar, true);
                //Check for left and right recursion

                // Left recursion occurs when the production symbol shows up on the
                // leftmost side of an item. This is only relevant when the originating
                // item is at the initial state
                const production_id = item.getProduction(grammar).id;

                const LR = item.offset == 0 &&
                    closure.filter(i => i?.sym(grammar)?.type == SymbolType.PRODUCTION).some(i => i.getProductionAtSymbol(grammar).id == production_id);

                //Right recursion occurs when the origin item shows up in a shifted item's list. 
                const RR = item.offset > 0
                    ? closure.slice(1).filter(i => i?.sym(grammar)?.type != SymbolType.PRODUCTION)
                        .filter(i => i.body == item.body)
                        .map(i => getUniqueSymbolName(i.sym(grammar)))
                    : [];


                out.push([item.id, { item: item, closure: closure.map(i => i.id), LR, RR }]);
                item = item.increment();
            }
        }

        return out;
    }));

}
export function preCalcLeftRecursion(grammar: Grammar) {
    o: for (const production of grammar) {
        production.IS_LEFT_RECURSIVE = false;
        const closure = production.bodies.map(b => new Item(b.id, b.length, 0, EOF_SYM));
        processClosure(closure, grammar, true);
        for (const i of closure) {
            const sym = i.sym(grammar);
            if (sym && isSymAProduction(sym)) {
                if (grammar[sym.val] == production) {
                    production.IS_LEFT_RECURSIVE = true;
                    continue o;
                }
            }
        }
    }
    let change = true;
    while (change) {
        change = false;
        o: for (const production of grammar) {
            if (!production.IS_LEFT_RECURSIVE) {
                for (const body of production.bodies) {
                    if (body.sym[0] && isSymAProduction(body.sym[0]) && grammar[body.sym[0].val].IS_LEFT_RECURSIVE) {
                        production.IS_LEFT_RECURSIVE = true;
                        change = true;
                        continue o;
                    }
                }
            }
        }
    }
}

export function doesItemHaveLeftRecursion(item: Item, grammar: Grammar): boolean {
    return grammar.item_map.get(item.id).LR;
};

export function doesSymbolLeadToRightRecursion(sym: TokenSymbol, item: Item, grammar: Grammar): boolean {
    if (!item) return false;
    return grammar.item_map.get(item.id).RR.includes(getUniqueSymbolName(sym));
}