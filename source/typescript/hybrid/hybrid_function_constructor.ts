import { Grammar, Production, EOF_SYM, SymbolType } from "../types/grammar.js";
import { TokenSymbol } from "../types/Symbol";
import { Item }
    from "../util/common.js";
import {
    getIncludeBooleans,
    isSymAProduction,
    isSymGeneratedSym,
    isSymSpecifiedSymbol,
    isSymGeneratedId,
    isSymSpecifiedIdentifier,
    isSymGeneratedNum,
    isSymSpecifiedNumeric,
    isSymGeneratedWS,
    isSymGeneratedNL,
    g_lexer_name,
    addSkipCallNew,
    getSkippableSymbolsFromItems,
    itemsToProductions,
    getUniqueSymbolName,
} from "./utilities/utilities.js";
import { RDProductionFunction } from "./types/RDProductionFunction";
import { CompilerRunner } from "./types/CompilerRunner.js";
import { SC } from "./utilities/skribble.js";
import { getClosure, getFollow } from "../util/process_closure.js";
import { ReturnType, RenderBodyOptions } from "./types/RenderBodyOptions";
import { createStandardRDSequence } from "./create_rd_sequence.js";
import { defaultMultiItemLeaf, defaultSelectionClause, defaultSingleItemLeaf, processStateGenerator } from "./process_state_generator.js";
import { create_production_shift_sequence } from "./create_production_shift_sequence.js";

export const
    accept_loop_flag = SC.Variable("ACCEPT:boolean"),
    production_global = SC.Variable("prod:unsigned int");

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
    runner: CompilerRunner,
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
        lr_productions,
        called_productions: new Set(),
        leaf_productions: new Set()
    };
}

function addClauseSuccessCheck(options: RenderBodyOptions): SC {
    const { production } = options;
    const condition = SC.Binary(production_global, SC.Value("=="), SC.Value(production.id));
    return SC.UnaryPre(SC.Return, SC.Call("assertSuccess", g_lexer_name, condition));
}

export function constructHybridFunction(production: Production, grammar: Grammar, runner: CompilerRunner): RDProductionFunction {

    const
        p = production,
        code_node = SC.Function(SC.Constant("$" + production.name + ":bool"), g_lexer_name);

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
            genA = createStandardRDSequence(
                //Filter out items that are left recursive for the given production
                items.filter(i => {
                    const sym = i.sym(grammar);
                    if (sym && isSymAProduction(sym) && sym.val == production.id)
                        return false;
                    return true;
                }), optionsA, g_lexer_name
            ),
            genB = create_production_shift_sequence(optionsB);


        code_node.addStatement(
            runner.DEBUG
                ? SC.Value(`console.log("${production.name} START", { prod, tx:str.slice(l.off, l.off + l.tl), ty:l.ty, tl:l.tl, utf:l.getUTF(), FAILED, offset:l.off})`)
                : undefined,
            processStateGenerator(
                optionsA, genA, defaultSelectionClause,
                (item, state, options) => {
                    const { leaves, prods, root } = defaultMultiItemLeaf(item, state, options);
                    lr_prods.push(...prods);
                    return { leaves, prods, root };

                },
                (item, state, options) => {
                    const { leaf, prods, root } = defaultSingleItemLeaf(item, state, options);
                    lr_prods.push(...prods);
                    return { leaf, prods, root };

                }),
            processStateGenerator(optionsB, genB,
                (gen, state, items, level, options) => {

                    if (state.offset == 0) {

                        let switch_stmt: SC = SC.Switch(SC.Value("prod"));

                        const
                            pending_productions = [...lr_prods.setFilter()],
                            active_productions = new Set,
                            case_clauses = [...gen].map(({ code, items, syms, prods }) => {
                                const key = <number>items[0].decrement().sym(grammar).val;

                                return { key, code, syms, hash: code.hash(), prods: prods.slice(), items };
                            })
                                .group(({ hash }) => hash)
                                .groupMap(group => {
                                    return group.map(g => g.key).setFilter();
                                }),
                            active_groups = [];

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
                        console.log({ active_productions, pending_productions });
                        if (active_groups.length == 0)
                            return new SC;

                        for (const group of active_groups) {

                            const
                                keys = group.map(g => g.key).setFilter(),
                                code = group[0].code,
                                items = group.flatMap(g => g.items).setFilter(i => i.id).map(i => i.increment()),
                                shift_items = items.filter(i => !i.atEND),
                                end_items = items.filter(i => i.atEND),
                                skippable = getSkippableSymbolsFromItems(items, grammar).filter(sym =>
                                    !getFollow(keys[0], grammar).includes(sym)
                                );

                            let interrupt_statement = null;

                            if (shift_items.length > 0) {
                                const
                                    closure = getClosure(shift_items.slice(), grammar),
                                    anticipated_syms = [...closure.filter(i => !i.atEND && !isSymAProduction(i.sym(grammar))).map(i => <TokenSymbol>i.sym(grammar))];

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

                                        const booleans = getIncludeBooleans(lookahead_syms, grammar, runner, g_lexer_name, anticipated_syms);

                                        if (booleans)
                                            interrupt_statement = SC.If(booleans).addStatement(SC.Break);
                                    }

                                }
                            }

                            switch_stmt.addStatement(
                                ...keys.slice(0, -1).map(k => SC.If(SC.Value(k + ""))),
                                SC.If(SC.Value(keys.pop() + ""))
                                    .addStatement(
                                        shift_items.length > 0 || end_items.length > 1
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

                        const while_stmts = SC.While(
                            active_groups.length > 1
                                ? SC.Value("true")
                                : SC.Binary(production_global, "==", active_groups[0][0].key)
                        )
                            .addStatement(
                                SC.Declare(SC.Assignment(accept_loop_flag, SC.False)),
                                switch_stmt,
                                SC.If(SC.UnaryPre(SC.Value("!"), accept_loop_flag)).addStatement(SC.Break)
                            );



                        return (new SC).addStatement(SC.Comment(`Level: ${state.offset}`), while_stmts);
                    }
                    state.offset--;
                    return defaultSelectionClause(gen, state, items, level, options);
                },
                defaultMultiItemLeaf,
                (item, group, options) => {
                    const { root, leaf, prods } = defaultSingleItemLeaf(item, group, options);
                    addReturnType(ReturnType.ACCEPT, leaf);
                    return { root, leaf, prods };
                }
            ),
            runner.DEBUG
                ? SC.Value(`console.log("${production.name} END", {prod, tx:str.slice(l.off, l.off + l.tl), FAILED, offset:l.off})`)
                : undefined,
            addClauseSuccessCheck(optionsA),
        );

        return {
            productions: new Set([...optionsA.called_productions.values(), ...optionsB.called_productions.values()]),
            id: p.id,
            fn: (new SC).addStatement(
                (runner.ANNOTATED) ? annotation : undefined,
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
