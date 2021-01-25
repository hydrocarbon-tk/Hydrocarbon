import { EOF_SYM, Grammar, ProductionBody } from "../types/grammar.js";
import { Production } from "../types/production.js";
import { Symbol } from "../types/symbol";
import { SymbolType } from "../types/symbol_type";
import { Item } from "./item.js";
import { buildItemMap } from "./item_map.js";
import { getUniqueSymbolName, Sym_Is_A_Production } from "./symbol.js";

const
    production_stack_arg_name = "sym",
    environment_arg_name = "env",
    lexer_arg_name = "lex";

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
/**
 * Fillout Worker Grammar
 * 
 * Takes an existing filled out grammar that has been transferred to 
 * a worker and re-implements missing methods for custom types.
 * 
 * Returns nothing
 */
export function filloutWorkerGrammar(grammar: Grammar) {
    for (const [key, val] of grammar.item_map.entries()) {
        val.item = Item.fromArray(val.item);
    }
}
/**
 * Adds additional properties to the grammar and its sub objects:
 * 
 * Productions functions
 * Meta symbol list
 * Follow items for each production
 * Item set
 */
export function completeGrammar(grammar: Grammar, env) {

    const bodies = [],
        reduce_lu: Map<string, number> = new Map,
        symbols: Map<string, Symbol> = new Map([[getUniqueSymbolName(EOF_SYM), EOF_SYM]]),
        processing_symbols = [];

    for (const { symbols } of grammar.meta.ignore) {
        processing_symbols.push(...symbols);
    }

    for (let i = 0, j = 0; i < grammar.length; i++) {

        const production = grammar[i];

        removeDirectRecursiveBodies(production);

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
            processing_symbols.push(...[...body.error.values(), ...body.excludes.values(), ...body.ignore.values(), body.sym].flat());

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

    for (const sym of processing_symbols.setFilter(s => getUniqueSymbolName(s))) sym_function(sym);

    grammar.meta = Object.assign({}, grammar.meta, { all_symbols: symbols, reduce_functions: reduce_lu });
    grammar.bodies = bodies;
    grammar.item_map = null;

    buildItemMap(grammar);

    return grammar;
}


function removeDirectRecursiveBodies(production: Production, bodies: ProductionBody[] = production.bodies) {

    for (let i = 0; i < bodies.length; i++) {
        const
            body = bodies[i],
            [sym] = body.sym;

        if (
            body.sym.length == 1
            &&
            Sym_Is_A_Production(sym)
            &&
            sym.val == production.id
        ) {
            bodies.splice(i, 1);
            i--;
        }
    }
}


