import { performance } from "perf_hooks";
import { EOF_SYM, Grammar } from "../types/grammar.js";
import { Production } from "../types/production";
import { RDProductionFunction } from "../types/rd_production_function";
import { TRANSITION_TYPE } from "../types/recognizer_state.js";
import { RenderBodyOptions, ReturnType } from "../types/render_body_options";
import { TokenSymbol } from "../types/symbol";
import { SymbolType } from "../types/symbol_type";
import { getClosure } from "../utilities/closure.js";
import { addSkipCallNew, getIncludeBooleans } from "../utilities/code_generating.js";
import { getFollow } from "../utilities/follow.js";
import {
    rec_glob_lex_name,
    rec_state,
    rec_state_prod
} from "../utilities/global_names.js";
import { Item } from "../utilities/item.js";
import { getProductionFunctionName } from "../utilities/render_item.js";
import { SC } from "../utilities/skribble.js";
import {
    getExcludeSymbolSet, getSkippableSymbolsFromItems,
    getSymbolName,
    getSymbolsFromClosure,
    getUniqueSymbolName, isSymAProduction,
    isSymGeneratedId, isSymGeneratedNL,
    isSymGeneratedNum, isSymGeneratedSym,
    isSymGeneratedWS, isSymSpecifiedIdentifier,
    isSymSpecifiedNumeric, isSymSpecifiedSymbol
} from "../utilities/symbol.js";
import { Helper } from "./helper.js";
import { defaultMultiItemLeaf, defaultSelectionClause, defaultSingleItemLeaf, processRecognizerStates } from "./states/process_recognizer_states.js";
import { yieldNontermStates } from "./states/yield_nonterm_states.js";
import { yieldStates } from "./states/yield_states.js";


export const

    accept_loop_flag = SC.Variable("ACCEPT:boolean");

function addReturnType(RETURN_TYPE: ReturnType, code_node: SC = new SC) {
    switch (RETURN_TYPE) {
        case ReturnType.ACCEPT:
            code_node.addStatement(SC.Assignment(accept_loop_flag, SC.True));
            break;
        case ReturnType.RETURN:
            code_node.addStatement(SC.Return);
            break;
        case ReturnType.NONE: break;
    }

    return code_node;
}

function generateRDOptions(
    grammar: Grammar,
    runner: Helper,
    /**
     * The production currently being processed.
     */
    production: Production,
    /**
     * Set of all production ids that are referenced within the function
     */
    lr_productions: Item[]
): RenderBodyOptions {
    return {
        grammar,
        runner,
        production,
        production_shift_items: lr_productions,
        extended_production_shift_items: [],
        called_productions: new Set(),
        leaf_productions: new Set(),
        cache: new Map()
    };
}

function addClauseSuccessCheck(options: RenderBodyOptions): SC {
    const { production } = options;
    const condition = SC.Binary(rec_state_prod, "==", SC.Value(production.id));
    return SC.UnaryPre(SC.Return, SC.Call("assertSuccess", rec_glob_lex_name, rec_state, condition));
}

export function constructHybridFunction(production: Production, grammar: Grammar, runner: Helper): RDProductionFunction {
    const
        start = performance.now(),
        p = production,
        code_node = SC.Function(SC.Constant(getProductionFunctionName(production, grammar) + ":bool"), rec_glob_lex_name, rec_state);

    let items: Item[] = p.bodies.map(b => new Item(b.id, b.length, 0, EOF_SYM));

    const annotation = SC.Expressions(SC.Comment(
        `
    production name: ${production.name}
    grammar index: ${production.id}
    bodies: 
    \t${items.map(i => i.renderUnformattedWithProduction(grammar) + " - " + grammar.item_map.get(i.id).reset_sym.join(",")).join("\n\t\t")}`));

    try {

        const
            lr_productions = getClosure(items, grammar).filter(i => !i.atEND && i.sym(grammar).type == SymbolType.PRODUCTION),
            lr_prods: number[] = [],
            optionsA = generateRDOptions(
                grammar, runner,
                production,
                lr_productions
            ),
            optionsB = generateRDOptions(
                grammar, runner,
                production,
                lr_productions
            ),
            genA = yieldStates(
                //Filter out items that are left recursive for the given production
                items.filter(i => {
                    const sym = i.sym(grammar);
                    if (sym && isSymAProduction(sym) && sym.val == production.id)
                        return false;
                    return true;
                }), optionsA, rec_glob_lex_name
            ),
            genB = yieldNontermStates(optionsB);


        code_node.addStatement(
            runner.DEBUG
                ? SC.Value(`debug_stack.push("${production.name} START", { prod:state.prod, tx:str.slice(l.off, l.off + l.tl), ty:l.ty, tl:l.tl, utf:l.getUTF(), FAILED:state.getFAILED(),offset:l.off})`)
                : undefined,
            processRecognizerStates(
                optionsA, genA, defaultSelectionClause,
                (state, states, options) => {
                    const { leaves, prods, root } = defaultMultiItemLeaf(state, states, options);
                    lr_prods.push(...prods);
                    return { leaves, prods, root };

                },
                (item, state, options) => {
                    const { leaf, prods, root } = defaultSingleItemLeaf(item, state, options);
                    lr_prods.push(...prods);
                    return { leaf, prods, root };

                }),
            processRecognizerStates(optionsB, genB,
                (gen, state, items, level, options) => {

                    if (state.offset == 0) {

                        let switch_stmt: SC = SC.Switch(rec_state_prod);

                        type case_clause_data = {
                            key: number;
                            code: SC;
                            syms: TokenSymbol[];
                            hash: string;
                            prods: number[];
                            items: Item[];
                        };

                        const
                            { extended_production_shift_items } = options,
                            pending_productions = [...lr_prods.setFilter()],
                            active_productions: Set<number> = new Set,
                            active_groups: case_clause_data[][] = [],
                            case_clauses: Map<number, case_clause_data[][]>
                                = [...gen].flatMap(({ code, items, syms, prods }) => {
                                    const
                                        keys = <number[]>items.map(i => i.sym(grammar).val),
                                        output = [];

                                    for (const key of keys.setFilter())
                                        output.push({ key, code, syms, hash: code.hash(), prods: prods.slice(), items });

                                    return output;
                                })
                                    .group(({ hash }) => hash)
                                    .groupMap(group => {
                                        return group.map(g => g.key).setFilter();
                                    });


                        for (let i = 0; i < pending_productions.length; i++) {

                            const prod = pending_productions[i];

                            if (active_productions.has(prod)) continue;

                            active_productions.add(prod);

                            if (case_clauses.has(prod)) {

                                const
                                    group = case_clauses.get(prod)[0],
                                    prods = group.flatMap(g => g.prods).setFilter();

                                for (const key of group.map(g => g.key).setFilter())
                                    active_productions.add(key);

                                pending_productions.push(...prods);
                                active_groups.push(group);
                            }
                        }

                        if (active_groups.length == 0) return (new SC).addStatement(SC.Comment("value"));

                        for (const clauses of active_groups.sort((([{ key: keyA }], [{ key: keyB }]) => keyA - keyB))) {
                            let anticipated_syms;

                            const
                                keys = clauses.map(g => g.key).setFilter(),
                                code = clauses[0].code,
                                items = clauses.flatMap(g => g.items).setFilter(i => i.id).filter(i => !extended_production_shift_items.some(s => s.body == i.body)).map(i => i.increment()),
                                active_items = items.filter(i => !i.atEND),
                                end_items = items.filter(i => i.atEND),
                                skippable = getSkippableSymbolsFromItems(items, grammar).filter(sym =>
                                    !getFollow(keys[0], grammar).some(s => getSymbolName(s) == getSymbolName(sym))
                                );

                            let interrupt_statement = null;

                            if (active_items.length > 0) {
                                const
                                    closure = getClosure(active_items.slice(), grammar);
                                anticipated_syms = getSymbolsFromClosure(closure, grammar);

                                if (keys.some(k => k == production.id)) {
                                    const follow_symbols = keys.flatMap(k => getFollow(k, grammar)).setFilter(sym => getUniqueSymbolName(sym));


                                    /*
                                        Early exit should only occur if there is an occluding generic ( such as g:sym, g:id )
                                        that could capture a symbol that would otherwise cause a reduce.  FOLLOW Symbols that
                                        would otherwise be matched match by the generic type should be selected for the early
                                        exit check. If there are no such generics in the excluded  items, then there is no
                                        need to do this check.
                                    */
                                    const
                                        lookahead_syms = [...follow_symbols.filter(s => isSymGeneratedWS(s) || isSymGeneratedNL(s))];

                                    if (anticipated_syms.some(isSymGeneratedSym))
                                        lookahead_syms.push(...follow_symbols.filter(isSymSpecifiedSymbol));

                                    if (anticipated_syms.some(isSymGeneratedId))
                                        lookahead_syms.push(...follow_symbols.filter(isSymSpecifiedIdentifier));

                                    if (anticipated_syms.some(isSymGeneratedNum))
                                        lookahead_syms.push(...follow_symbols.filter(isSymSpecifiedNumeric));

                                    if (lookahead_syms.length > 0) {

                                        const
                                            syms = getExcludeSymbolSet(lookahead_syms, anticipated_syms),
                                            booleans = getIncludeBooleans(syms, grammar, runner, rec_glob_lex_name);

                                        if (booleans)
                                            interrupt_statement = SC.If(booleans).addStatement(SC.Break);
                                    }
                                }
                            }

                            switch_stmt.addStatement(
                                ...keys.slice(0, -1).map(k => SC.If(SC.Value(k + ""))),
                                SC.If(SC.Value(keys.pop() + ""))
                                    .addStatement(
                                        active_items.length > 0 || end_items.length > 1
                                            ? addSkipCallNew(skippable, grammar, runner)
                                            : undefined,
                                        interrupt_statement,
                                        code
                                    )
                            );

                            if (active_groups.length == 1) {
                                switch_stmt = new SC().addStatement(...switch_stmt.statements[0].statements);
                            } else {
                                switch_stmt.statements[switch_stmt.statements.length - 1].addStatement(SC.Break);
                            }
                        }

                        const out_stmt = SC.While(
                            active_groups.length > 1
                                ? SC.Value("true")
                                : SC.Binary(rec_state_prod, "==", active_groups[0][0].key)
                        )
                            .addStatement(
                                SC.Declare(SC.Assignment(accept_loop_flag, SC.False)),
                                switch_stmt,
                                SC.If(SC.UnaryPre(SC.Value("!"), accept_loop_flag)).addStatement(SC.Break)
                            );

                        return out_stmt;
                    }

                    state.offset--;

                    return defaultSelectionClause(gen, state, items, level, options, state.offset <= 1);
                },
                defaultMultiItemLeaf,
                (item, state, options) => {
                    const { root, leaf, prods } = defaultSingleItemLeaf(item, state, options);

                    if (state.transition_type !== TRANSITION_TYPE.IGNORE)
                        addReturnType(ReturnType.ACCEPT, leaf);

                    return { root, leaf, prods };
                }
            ),
            runner.DEBUG
                ? SC.Value(`debug_stack.push("${production.name} END", {prod:state.prod, tx:str.slice(l.off, l.off + l.tl), FAILED:state.getFAILED(), offset:l.off})`)
                : undefined,
            addClauseSuccessCheck(optionsA),
        );
        //const hash = code_node.hash();
        //const end = performance.now();
        return {
            productions: new Set([...optionsA.called_productions.values(), ...optionsB.called_productions.values(), ...runner.referenced_production_ids.values()]),
            id: p.id,
            fn: (new SC).addStatement(
                // SC.Comment("Compile Time:" + ((((end - start) * 1000) | 0) / 1000) + "ms hash:" + hash),
                // //SC.Comment([...new Set([...optionsA.called_productions.values(), ...optionsB.called_productions.values()]).values()].map(i => grammar[i].name).join(" ")),
                // (runner.ANNOTATED) ? annotation : undefined,
                code_node
            )
        };
    } catch (e) {

        return {
            productions: new Set,
            id: p.id,
            fn: code_node.addStatement(annotation, SC.Expressions(SC.Comment(`Could Not Parse [${production.name}] in Recursive Descent Mode \n${e.message + e.stack + ""}\n`)))
        };
    }

}
