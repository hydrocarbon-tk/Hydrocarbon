import { Grammar, Production, EOF_SYM, SymbolType } from "../types/grammar.js";
import { TokenSymbol } from "../types/Symbol";
import { Item, doesItemHaveLeftRecursion }
    from "../util/common.js";
import { TransitionTreeNode } from "../util/TransitionTreeNode";
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
    getAccompanyingItems,
} from "./utilities/utilities.js";
import { RDProductionFunction } from "./types/RDProductionFunction";
import { CompilerRunner } from "./types/CompilerRunner.js";
import { AS, ConstSC, SC, VarSC } from "./utilities/skribble.js";
import { getClosure, getFollow } from "../util/process_closure.js";
import { ReturnType, RenderBodyOptions } from "./types/RenderBodyOptions";
import { addEndItemSequence } from "./add_end_item_sequence.js";
import { createMultiItemSequence } from "./create_multi_item_sequence.js";
import { processStateGenerator } from "./process_state_generator.js";
import { addItemListComment } from "./add_item_list_comment.js";
import { renderItemReduction, renderItem } from "./item_render_functions.js";
import { NewType } from "./types/RecognizerState.js";

const
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
    productions: Set<number>,
    lr_productions: Item[]
): RenderBodyOptions {
    return {
        grammar,
        runner,
        production,
        productions,
        lr_productions
    };
}

export function incrementLexerName(sc: VarSC | ConstSC) {
    const name = sc.value.includes("pk") ? sc.value : "pk";
    return SC.Variable(name + 1 + ":Lexer");
}

export function createSkipCallFromItems(items: Item[], grammar: Grammar, runner: CompilerRunner, lex_name: VarSC): SC {
    const skippable = getSkippableSymbolsFromItems(items, grammar);
    return addSkipCallNew(skippable, grammar, runner, lex_name);
}
export function itemsToProductions(items: Item[], grammar: Grammar): number[] {
    return items.map(i => i.getProduction(grammar).id);
}
function addClauseSuccessCheck(options: RenderBodyOptions): SC {
    const { production } = options;
    const condition = SC.Binary(production_global, SC.Value("=="), SC.Value(production.id));
    return SC.UnaryPre(SC.Return, SC.Call("assertSuccess", g_lexer_name, condition));
}
export function cleanLeaves(node: TransitionTreeNode) {
    if (node.next.length > 0)
        return node.next.every(cleanLeaves);
    return node.roots.length == 1;
}

export function doItemsHaveSameSymbol(items: Item[], grammar: Grammar) {
    return items.every(i => !i.atEND && i.sym(grammar).val == items[0].sym(grammar).val);
}

export function processProductionChain(
    code_node: SC,
    options: RenderBodyOptions,
    /**
     * List of production id numbers that have been generated from
     * the proceeding code sequence.
     */
    active_productions: number[],
    SINGLE_REDUCE_ONLY = false
): number[] {
    let active_items: Item[] = [], { grammar, runner, production, productions, lr_productions } = options;

    let prod = active_productions, visited_prods: Set<string> = new Set;

    const items = (lr_productions);

    active_items = getAccompanyingItems(grammar, active_productions, items);

    if (active_items.length == 0) {
        code_node.addStatement(SC.Assignment(production_global, prod[0]));
        return prod;
    }

    if (active_items.length == 1 && active_items.every(i => i.len == 1)) {
        prod.length = 1;
        while (active_items.length == 1 && active_items.every(i => i.len == 1)) {
            prod[0] = active_items[0].getProduction(grammar).id;
            renderItemReduction(code_node, active_items[0], grammar);
            active_items = getAccompanyingItems(grammar, itemsToProductions(active_items, grammar), lr_productions);
        }
    }

    code_node.addStatement(SC.Assignment(production_global, prod[0]));

    if (active_items.length > 0) {

        if (active_items.some(i => doesItemHaveLeftRecursion(i, grammar)) || SINGLE_REDUCE_ONLY) {
            while (active_items.length > 0) {
                const new_items = active_items.filter(i => !visited_prods.has(i.id));
                new_items.forEach(i => visited_prods.add(i.id));
                active_items = getAccompanyingItems(grammar, itemsToProductions(new_items, grammar), lr_productions);
            }
        } else if (!SINGLE_REDUCE_ONLY) {
            const { node: sc, production_id } = createShiftAndComplete(active_items.map(i => i.increment()), options, -1);
            code_node.addStatement(sc);
            active_items = getAccompanyingItems(grammar, itemsToProductions(active_items, grammar), lr_productions);

            prod = [...production_id.values()];

            while (active_items.length > 0) {
                const new_items = active_items.filter(i => !visited_prods.has(i.id));
                new_items.forEach(i => visited_prods.add(i.id));
                active_items = getAccompanyingItems(grammar, itemsToProductions(new_items, grammar), lr_productions);
            }
        }
    }
    return prod;
}

function* create_production_shift_sequence(
    options: RenderBodyOptions,
): Generator<NewType[], SC> {

    let code_node: SC = new SC;

    const {
        grammar,
        runner,
        production,
        productions,
        lr_productions
    } = options;

    const production_id = productions;
    const nonterm_shift_items: Item[] = lr_productions;

    if (nonterm_shift_items.length > 0) {


        /**
         * Generate transition sequences for all productions shift items
         */
        const lr_items = nonterm_shift_items
            .setFilter(i => i.id)
            .group(i => i.sym(grammar).val);

        const groups: NewType[] = [];

        for (const group of lr_items) {
            const shifted_items = group.map(i => i.increment());
            const sym = group[0].sym(grammar);
            const gen = createMultiItemSequence(
                //Filter out items that are left recursive for the given production
                shifted_items,
                options,
                g_lexer_name,
                1,
                true
            );

            let val = gen.next();

            while (!val.done) {
                yield <NewType[]>val.value;
                val = gen.next();
            }

            groups.push({
                code: new SC,
                hash: val.value.hash(),
                state: {
                    sym,
                    items: group,
                    leaf: false,
                    peeking: false,
                    level: 0
                }
            });
        }
        yield groups;

        const obj = groups[0].code;

        return obj;
    }

    return SC.Empty();
}


function createShiftAndComplete(
    items: Item[],
    options: RenderBodyOptions,
    key: any,
    RETURN_TYPE = ReturnType.ACCEPT
): { production_id: Set<number>, node: SC, PURE_COMPLETE: boolean; } {

    let code_node = new SC;

    const
        { runner, grammar, production } = options,
        shift_items = items.filter(i => !i.atEND),
        end_items = items.filter(i => i.atEND),
        lex_name = g_lexer_name,
        follow_symbols = getFollow(key, grammar),
        production_id: Set<number> = new Set,
        PURE_COMPLETE = end_items.length == 1 && shift_items.length == 0;

    let active_node = null, ALLOW_FALL_THROUGH = end_items.length == 0 && key != production.id;

    const productions: Set<number> = new Set;

    let new_options = generateRDOptions(
        options.grammar,
        options.runner,
        options.production,
        productions,
        options.lr_productions
    );

    const gen = createMultiItemSequence(
        //Filter out items that are left recursive for the given production
        items,
        new_options,
        g_lexer_name,
        5,
        true,
    );
    const sc = processStateGenerator(new_options, gen);
    const node = new SC;
    const skippable = getSkippableSymbolsFromItems(items, grammar).filter(sym =>
        !getFollow(key, grammar).includes(sym)
    );

    if (runner.ANNOTATED) {
        addItemListComment(code_node, items, grammar);
        node.addStatement(SC.Comment(items.map(i => i.renderUnformattedWithProduction(grammar)).join("\n")));
    }

    if (skippable.length > 0 && (shift_items.length > 0 || end_items.length > 1))
        node.addStatement(addSkipCallNew(skippable, grammar, runner, lex_name));


    node.addStatement(sc);

    console.log(
        "ASDASDADS",
        items.map(i => i.renderUnformattedWithProduction(grammar)),
        Object.assign(new AS, node).renderCode()
    );

    return { production_id: productions, node, PURE_COMPLETE };


    if (shift_items.length > 0) {

        //process the shift item to completion. 
        const
            closure = getClosure(shift_items.slice(), grammar),
            anticipated_gyms = [...closure.filter(i => !i.atEND && !isSymAProduction(i.sym(grammar))).map(i => <TokenSymbol>i.sym(grammar))];


        if (key == production.id) {
            /*
                Early exit should only occur if there is an occluding generic ( such as g:sym, g:id )
                that could capture a symbol that would otherwise cause a reduce.  FOLLOW Symbols that
                would otherwise be matched match by the generic type should be selected for the early
                exit check. If there are no such generics in the excluded  items, then there is no
                need to do this check.
            */
            const
                lookahead_syms = [...follow_symbols.filter(s => isSymGeneratedWS(s) || isSymGeneratedNL(s))];

            if (anticipated_gyms.some(isSymGeneratedSym))
                lookahead_syms.push(...follow_symbols.filter(isSymSpecifiedSymbol));

            if (anticipated_gyms.some(isSymGeneratedId))
                lookahead_syms.push(...follow_symbols.filter(isSymSpecifiedIdentifier));

            if (anticipated_gyms.some(isSymGeneratedNum))
                lookahead_syms.push(...follow_symbols.filter(isSymSpecifiedNumeric));

            if (lookahead_syms.length > 0) {

                const booleans = getIncludeBooleans(lookahead_syms, grammar, runner, g_lexer_name, anticipated_gyms);

                if (booleans)
                    code_node.addStatement(SC.If(booleans).addStatement(SC.Break));
            }

        }

        if (shift_items.length == 1) {
            //Simply confirm the current token is within the shift items first set then 

            let _if: SC = SC.If(getIncludeBooleans(anticipated_gyms, grammar, runner, lex_name, []));
            const inner_if = renderItem(_if, shift_items[0], grammar, runner, productions, true);
            active_node = _if;
            code_node.addStatement(_if);

            for (const prod of processProductionChain(inner_if, options, itemsToProductions(shift_items, grammar), true))
                production_id.add(prod);

            addReturnType(RETURN_TYPE, inner_if);

        } else {

            let d: Item[] = shift_items.slice(),
                node = new SC, val = null;

            const gen = createMultiItemSequence(d, node, options, lex_name, 0, false, ALLOW_FALL_THROUGH, true);

            while (!(val = gen.next()).done) {
                const { _if, prods, filter_productions } = val.value;
                if (_if) {

                    for (const prod of processProductionChain(_if, options, prods, true))
                        production_id.add(prod);

                    addReturnType(RETURN_TYPE, _if);
                }
            };
            active_node = val.value;
            code_node.addStatement(node);
            code_node.addStatement(SC.Empty());
        }
    }

    if (end_items.length > 0) {
        let val;
        const gen = addEndItemSequence(end_items, options, shift_items.length > 0 || end_items.length > 1);
        while (!(val = gen.next()).done) {

            const { _if, prods } = val.value;

            for (const prod of processProductionChain(_if, options, prods, true))
                production_id.add(prod);

            addReturnType(RETURN_TYPE, _if);
        };
        const end = val.value;

        if (!active_node) {
            code_node.addStatement(end);
        } else {
            active_node.addStatement(end);
        }
    }

    return { node: code_node, production_id, PURE_COMPLETE };
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
            optionsA = generateRDOptions(
                grammar, runner,
                production, new Set,
                getClosure(items, grammar).filter(i => !i.atEND && i.sym(grammar).type == SymbolType.PRODUCTION)
            ),
            optionsB = generateRDOptions(
                grammar, runner,
                production, new Set,
                getClosure(items, grammar).filter(i => !i.atEND && i.sym(grammar).type == SymbolType.PRODUCTION)
            ),
            genA = createMultiItemSequence(
                //Filter out items that are left recursive for the given production
                items.filter(i => {
                    const sym = i.sym(grammar);
                    if (sym && isSymAProduction(sym) && sym.val == production.id)
                        return false;
                    return true;
                }), optionsA, g_lexer_name,
                0, false
            ),
            genB = create_production_shift_sequence(optionsB);


        code_node.addStatement(
            runner.DEBUG
                ? SC.Value(`console.log("${production.name} START", { prod, tx:str.slice(l.off, l.off + l.tl), ty:l.ty, tl:l.tl, utf:l.getUTF(), FAILED, offset:l.off})`)
                : undefined,
            processStateGenerator(optionsA, genA),
            null && processStateGenerator(optionsB, genB,
                (gen, items, level, options) => {
                    if (level == 0) {
                        const pending_productions = [...optionsA.productions.values()];
                        const active_productions = new Set;
                        const switch_stmt = SC.Switch(SC.Value("prod"));
                        const case_clauses = [...gen].map(({ code, items, syms }) => {
                            const key = <number>items[0].decrement().sym(grammar).val;
                            const prods = itemsToProductions(items, grammar);
                            return { key, code, syms, hash: code.hash(), prods };
                        })
                            .group(({ hash }) => hash)
                            .groupMap(group => {
                                return group.map(g => g.key).setFilter();
                            });
                        const active_groups = [];

                        for (let i = 0; i < pending_productions.length; i++) {
                            const prod = pending_productions[i];
                            if (active_productions.has(prod)) continue;
                            active_productions.add(prod);
                            if (case_clauses.has(prod)) {
                                const group = case_clauses.get(prod)[0];
                                const prods = group.flatMap(g => g.prods).setFilter();
                                for (const key of group.map(g => g.key).setFilter())
                                    active_productions.add(key);
                                pending_productions.push(...prods);
                                active_groups.push(group);
                            }
                        }

                        for (const group of active_groups) {
                            const keys = group.map(g => g.key).setFilter();
                            const code = group[0].code;
                            const hash = group[0].hash;
                            const prods = group.flatMap(g => g.prods).setFilter();
                            switch_stmt.addStatement(
                                ...keys.slice(0, -1).map(k => SC.If(SC.Value(k + ""))),
                                SC.If(SC.Value(keys.pop() + ""))
                                    .addStatement(
                                        SC.Comment(prods.join(" ")),
                                        SC.Comment(hash),
                                        code,
                                        SC.Break
                                    )
                            );
                        }

                        return (new SC).addStatement(SC.Comment(`Level: ${level}`), switch_stmt);
                    } else {

                        const { grammar, runner } = options;
                        let root, leaf = root;
                        for (const { syms, items, code } of gen) {
                            const boolean =
                                syms.length == 1 && isSymAProduction(syms[0])
                                    ? SC.Value(syms[0].val)
                                    : getIncludeBooleans(<TokenSymbol[]>syms, grammar, runner, g_lexer_name);
                            const if_stmt = SC.If(boolean);
                            if_stmt.addStatement(code);

                            if (!leaf) {
                                leaf = if_stmt;
                                root = if_stmt;
                            } else {
                                leaf.addStatement(if_stmt);
                                leaf = if_stmt;
                            }
                        }
                        leaf.addStatement(SC.Empty());
                        return (new SC).addStatement(SC.Comment(`Level: ${level}`), root);;
                    }
                }
            ),
            runner.DEBUG
                ? SC.Value(`console.log("${production.name} END", {prod, tx:str.slice(l.off, l.off + l.tl), FAILED, offset:l.off})`)
                : undefined,
            addClauseSuccessCheck(optionsA),
        );

        return {
            productions: new Set([...optionsA.productions.values(), ...optionsB.productions.values()]),
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
