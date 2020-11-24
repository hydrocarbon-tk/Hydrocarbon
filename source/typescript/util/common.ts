import wind from "@candlefw/wind";

import { Item } from "./item.js";
import { FIRST } from "./first.js";
import { FOLLOW } from "./follow.js";

import { processClosure } from "./process_closure.js";
import { EOF_SYM, Grammar, SymbolType } from "../types/grammar.js";
import { Symbol } from "../types/Symbol";
import { createNoCheckShift, getIncludeBooleans, getLexerBooleanExpression, getUniqueSymbolName } from "../hybrid/utilities/utilities.js";
import { exp, parser, stmt, renderWithFormatting, JSNodeClass } from "@candlefw/js";
import { JSNodeType } from "@candlefw/js";
import { traverse } from "@candlefw/conflagrate";
import { CompilerRunner } from "../hybrid/types/CompilerRunner.js";

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

    let terminal_symbol_index = 10;

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
            case SymbolType.SYMBOL:
            case SymbolType.ESCAPED:
            case SymbolType.LITERAL:
                s.id = terminal_symbol_index++;
            case SymbolType.GENERATED:
            case SymbolType.PRODUCTION_ASSERTION_FUNCTION:
                symbols.set(getUniqueSymbolName(s), s);
        }
    };

    for (const sym of syms.setFilter(s => getUniqueSymbolName(s)) sym_function(sym);

    grammar.meta = Object.assign({}, grammar.meta, { all_symbols: symbols, reduce_functions: reduce_lu });

    grammar.bodies = bodies;

    return grammar;
}

/**
 * Take a string from an assertion function pre-compiled 
 * script and convert into an assertion function body string.
 * 
 * - Replaces symbol place holders with equivalent type or token
 * boolean expression
 * - Replace `$next` place holder with a call to lexer next
 * - Replace `$fork` place holder with a call to lexer copy
 * - Replace `$join` place holder with a call to lexer sync
 * - Replace `$tk_start` place holder with a mile marker to the start of a token sequence
 * - Replace `$tk_end` with a shift insertion with length from the start of the previous call to `$tk_start`
 * 
 * @param af_body_content 
 */
export function createAssertionFunctionBody(af_body_content: string, grammar: Grammar, runner: CompilerRunner = null, prod_id: number = -1) {
    // Replace symbol placeholders
    let txt = (<string>af_body_content).replace(/(\!)?\<\-\-(\w+)\^\^([^-]+)\-\-\>/g, (a, not, type, val) => {
        const sym = <Symbol>{ type, val };
        return getLexerBooleanExpression(sym, grammar, "__lex__", not == "!");
    });

    const receiver = { ast: null }, lexer_name = ["l"];

    let lex_name_ptr = 0, HAS_TK = false;

    for (const { node, meta: { parent, mutate } } of traverse(parser(txt).ast, "nodes")
        .makeMutable().extract(receiver)) {
        if (node.type & JSNodeClass.IDENTIFIER) {
            if (node.value == "__lex__") {
                node.value = lexer_name[lex_name_ptr];
            } else if (node.value[0] == "$")
                switch ((<string>node.value).slice(1)) {

                    case "next":
                        //mutate(exp(createNoCheckShift(grammar, runner)));
                        mutate(exp(`${lexer_name[lex_name_ptr]}.next()`));
                        break;
                    case "fork":
                        if (parent.type == JSNodeType.ExpressionStatement) {
                            const start = lex_name_ptr;
                            lex_name_ptr = lexer_name.length;
                            lexer_name[lex_name_ptr] = "pk" + lex_name_ptr;
                            mutate(stmt(`const ${lexer_name[lex_name_ptr]} = ${lexer_name[start]}.copy();`));
                        }
                        break;
                    case "join":
                        if (parent.type == JSNodeType.ExpressionStatement) {
                            mutate(exp(`${lexer_name[lex_name_ptr]}.sync(${lexer_name[lex_name_ptr + 1]})`));
                            lex_name_ptr = 0;
                        }
                        break;
                    case "abort_fork":
                        lex_name_ptr = Math.max(lex_name_ptr - 1, 0);
                        break;
                    case "abort_all_forks":
                        lex_name_ptr = 0;
                        break;
                    case "tk_start":
                        HAS_TK = true;
                        {
                            const start = lex_name_ptr;
                            lexer_name[++lex_name_ptr] = "pk" + lex_name_ptr;
                            mutate(stmt(`const ${lexer_name[lex_name_ptr]} = ${lexer_name[start]}.copy();`));
                        }
                        break;
                    case "tk_end":
                        if (HAS_TK) {
                            const prev = lexer_name[lex_name_ptr - 1],
                                curr = lexer_name[lex_name_ptr];
                            mutate(exp(`add_shift(${prev}, ${curr}.off - ${prev}.off), ${prev}.sync(${curr}),${prev}.syncOffsetRegion()`));
                            lex_name_ptr--;
                        }
                    case "FOLLOW":
                        if (prod_id > -1 && runner) {
                            const symbols = [...FOLLOW(grammar, prod_id).values()];
                            const str = getIncludeBooleans(symbols, grammar, runner);
                            mutate(exp(`(${str || "false"})`));
                        }
                        break;
                    default:
                        if (node.value.includes("produce")) {

                            const
                                fn_name = node.value.split("_").slice(1).join("_"),
                                txt = grammar.functions.get(fn_name).txt;

                            if (!grammar.meta.reduce_functions.has(txt))
                                grammar.meta.reduce_functions.set(txt, grammar.meta.reduce_functions.size);

                            const id = grammar.meta.reduce_functions.get(txt);

                            const prev = lexer_name[lex_name_ptr - 1],
                                curr = lexer_name[lex_name_ptr];
                            mutate(exp(`add_shift(${prev}, ${curr}.off - ${prev}.off), ${prev}.sync(${curr}),${prev}.syncOffsetRegion(), add_reduce(1, ${id + 1}, true)`));
                            lex_name_ptr--;
                        }
                }
        }
    }

    return renderWithFormatting(receiver.ast);
}