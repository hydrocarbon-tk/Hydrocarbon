import { Grammar, Production, ProductionBody, EOF_SYM, SymbolType } from "../types/grammar.js";
import { AssertionFunctionSymbol, TokenSymbol } from "../types/Symbol";
import { processClosure, Item, FOLLOW, FIRST } from "../util/common.js";
import {
    createNoCheckShift,
    has_INLINE_FUNCTIONS,
    getRootSym,
    getSkipFunction,
    getIncludeBooleans,
    createReduceFunction,
    createDefaultReduceFunction,
    addRecoveryHandlerToFunctionBodyArray,
    addSkipCall,
    isSymSpecified,
    isSymAnAssertFunction,
    getResetSymbols,
    createAssertionShift,
    getMappedArray,
    isSymAProduction,
    getAssertionSymbolFirst,
    getUniqueSymbolName,
    sanitizeSymbolValForComment,
    isSymAGenericType,
    isSymGeneratedSym,
    isSymSpecifiedSymbol,
    isSymGeneratedId,
    isSymSpecifiedIdentifier,
    isSymGeneratedNum,
    isSymSpecifiedNumeric,
    isSymGeneratedWS,
    isSymGeneratedNL
} from "./utilities/utilities.js";
import { RDProductionFunction } from "./types/RDProductionFunction";
import { RDItem } from "./types/RDItem";
import { getTerminalSymsFromClosure } from "./utilities/get_terminal_syms_from_closure.js";
import { CompilerRunner } from "./types/CompilerRunner.js";
import { AS, BlockSC, ConstSC, CPP, IfSC, RS, SC, VarSC } from "./utilities/skribble.js";

function getPeekAtDepth(item: Item, grammar: Grammar, depth = 0, visited = new Set()): { closure: Item[], COMPLETED: boolean; } {
    if (!item || item.atEND) return { closure: [], COMPLETED: true };

    const closure = [item];

    let COMPLETED = false;

    processClosure(closure, grammar, true);

    const out = [];

    for (const item of closure) {

        if (item.atEND) { if (depth > 0) COMPLETED = true; continue; }

        const sym = item.sym(grammar);

        if (isSymAProduction(sym)) {
            //If closure contains an item with the production as the current symbol then left recursion has occurred
            if (!visited.has(sym.val) && depth > 0) {
                visited.add(sym.val);
                const { closure: c, COMPLETED: C } = getPeekAtDepth(item, grammar, depth, visited);
                COMPLETED = C || COMPLETED;
                out.push(...c);
            }
            if (depth <= 0)
                out.push(item);
        } else {
            if (depth > 0) {
                const { closure: c, COMPLETED: C } = getPeekAtDepth(item.increment(), grammar, depth - 1);
                COMPLETED = C || COMPLETED;
                out.push(...c);
            } else {
                out.push(item);
            }
        }
    }
    // }

    if (COMPLETED) {
        const data = getPeekAtDepth(item.increment(), grammar, depth - 1);
        data.closure.unshift(...out);
        return data;
    }

    return { closure: out, COMPLETED };
}
function checkForLeftRecursion(p: Production, item: RDItem, grammar: Grammar) {
    // return p.IS_LEFT_RECURSIVE;

    const closure_items = [RDItemToItem(item)];

    processClosure(closure_items, grammar, true);

    for (const i of closure_items) {

        const sym = i.sym(grammar);

        if (sym) {

            if (sym.type == "production")
                if (grammar[sym.val] == p)
                    return true;
        }
    }

    return false;
}

function RDItemToItem(v: RDItem): Item {
    return new Item(v.body_index, v.len, v.off, EOF_SYM);
}

function doesClosureHaveLR(closure: Item[], grammar: Grammar) {
    for (const item of closure) {

        if (item.atEND) continue;

        const sym = item.sym(grammar);

        if (isSymAProduction(sym) && item.getProductionAtSymbol(grammar).IS_LEFT_RECURSIVE)
            return true;
    }

    return false;
}

function ItemToRDItem(i: Item, grammar: Grammar, body_offset = 0): RDItem {
    const c = [i];
    processClosure(c, grammar, true);
    const HAS_LR = doesClosureHaveLR(c, grammar);
    return <RDItem>{ body_index: i.body, body_offset, off: i.offset, len: i.len, item: i, closure: c, HAS_LR };
}

function BodyToRDItem(b: ProductionBody, grammar: Grammar): RDItem {
    return ItemToRDItem(new Item(b.id, b.length, 0, EOF_SYM), grammar);
}

function renderItemSym(
    code_node: SC,
    item: Item,
    grammar: Grammar,
    runner: CompilerRunner,
    productions: Set<number> = new Set,
    RENDER_WITH_NO_CHECK = false,
    lexer_name: VarSC = global_lexer_name
): SC {

    const
        body = item.body_(grammar);

    if (item.atEND) {
        if (body.reduce_id >= 0)
            code_node.addStatement(createReduceFunction(item, grammar));
        else if (item.len > 1)
            code_node.addStatement(createDefaultReduceFunction(item));
    } else {
        const sym = getRootSym(item.sym(grammar), grammar);

        if (sym.type == "production") {

            productions.add(<number>sym.val);

            code_node.addStatement(SC.Call(SC.Constant("$" + grammar[sym.val].name), lexer_name));

            RENDER_WITH_NO_CHECK = false;

        } else {
            if (RENDER_WITH_NO_CHECK) {
                code_node.addStatement(createNoCheckShift(grammar, runner, lexer_name));
            } else {
                const syms: TokenSymbol[] = (
                    isSymAProduction(sym)
                        ? FIRST(grammar, sym)
                        : <TokenSymbol[]>[sym]
                );
                code_node.addStatement(addSkipCall(grammar, runner, syms, lexer_name));

                code_node.addStatement(createAssertionShift(grammar, runner, sym, lexer_name));

                RENDER_WITH_NO_CHECK = false;
            }
        }
    }

    if (!RENDER_WITH_NO_CHECK) {
        const _if = SC.If(SC.UnaryPre(SC.Value("!"), failed_global_var));
        code_node.addStatement(_if);
        code_node.addStatement(SC.Empty());
        return _if;
    }

    return code_node;
}

enum ReturnType {
    ACCEPT = 0,
    RETURN = 1,
    NONE = 2

}

function renderItem(
    code_node: SC,
    item: Item,
    grammar: Grammar,
    runner: CompilerRunner,
    productions: Set<number> = new Set,
    DONT_CHECK = false,
    RETURN_TYPE: ReturnType = ReturnType.RETURN,
    lexer_name: VarSC = global_lexer_name
): void {

    if (!item.atEND) {
        const leaf = renderItemSym(code_node, item, grammar, runner, productions, DONT_CHECK, lexer_name);
        renderItem(leaf, item.increment(), grammar, runner, productions, false, RETURN_TYPE, lexer_name);
    } else {

        code_node.addStatement(SC.Call(SC.Constant("setProduction"), SC.Value(item.getProduction(grammar).id)));

        renderItemSym(code_node, item, grammar, runner, productions, true, lexer_name);

        switch (RETURN_TYPE) {
            case ReturnType.ACCEPT:
                code_node.addStatement(SC.Assignment(accept_loop_flag, SC.True));
                break;
            case ReturnType.RETURN:
                code_node.addStatement(SC.Return);
                break;
            case ReturnType.NONE: break;
        }
    }
}


type TransitionGroup = {
    id: string;
    syms: Set<string>;
    trs: RDItem[];
    priority: number;
};

function renderAnnotatedRDItem(rd_item: RDItem, grammar: Grammar) {
    return `${rd_item.item.renderUnformattedWithProduction(grammar)}`;
}


interface RenderBodyOptions {
    block_depth: number;
    peek_depth: number;
    RETURN_TYPE: ReturnType;

    NO_CHECK: boolean;

}

function generateRBOptions(RT: ReturnType = ReturnType.RETURN, pd: number = 0, bd: number = 0, NC: boolean = false): RenderBodyOptions {
    return {
        peek_depth: pd,
        block_depth: bd,
        RETURN_TYPE: RT,
        NO_CHECK: NC
    };
}
export function renderFunctionBody(
    rd_items: RDItem[],
    grammar: Grammar,
    runner: CompilerRunner,
    code_node_: SC,
    productions: Set<number> = new Set,
    options: RenderBodyOptions = generateRBOptions(),
    lexer_name: VarSC = global_lexer_name
): ({ stmts: string; sym_map: Map<string, TokenSymbol>; sc: SC; }) {





    let { block_depth, peek_depth, RETURN_TYPE, NO_CHECK } = options;

    const stmts = [], sym_map: Map<string, TokenSymbol> = new Map();
    const code_node = new SC();

    let HAVE_ONLY_PRODUCTIONS = true;

    if (peek_depth > 3) {
        //If two or more items can't be resolved by a peek sequence
        //proceed with the parsing the longest item, and should that fail
        //attempt to parse with subsequent items, ordered by their maximum 
        //parse lengths
        console.dir({
            depth: peek_depth,
            d: rd_items.map(i => ({
                g: RDItemToItem(i).renderUnformattedWithProduction(grammar),
                b: i.closure.sort((i, j) => i.getProduction(grammar).id - j.getProduction(grammar).id).map(i => i.renderUnformattedWithProduction(grammar))
            }))
        }, { depth: null });

        stmts.push(`/* 
            ${rd_items.map(i => renderAnnotatedRDItem(i, grammar)).join("\n")}
        */`);
    } else {
        /* 
            Each item has a closure which yields transition symbols. 
            We are only interested in terminal transition symbols. 
    
            If a set of items have the same transition symbols then 
            they are likely the same and can be treated in one pass. 
    
            If the transition symbols differ, then the production will 
            need to be disambiguated until we find either matching
            transition symbols or 
        */

        // sort into transition groups - groups gathered based on a single transition symbol
        const transition_groups: Map<string, RDItem[]> = rd_items.groupMap((i: RDItem) => {

            if (runner.ANNOTATED && peek_depth > 0)
                stmts.push(`/* ${renderAnnotatedRDItem(i, grammar)} peek ${peek_depth} state: \n${i
                    .closure.map(i => i.renderUnformattedWithProduction(grammar)).join("\n")}*/\n`);

            const syms: string[] = [];

            for (const sym of getTerminalSymsFromClosure(i.closure, grammar)) {
                syms.push(getUniqueSymbolName(sym));
                sym_map.set(getUniqueSymbolName(sym), sym);
            }

            return syms;
        });

        // Combine transition groups that have the same RDItems. Merge their transition symbols together
        const group_maps: Map<string, TransitionGroup> = new Map();

        for (const [symbol_val, trs] of transition_groups.entries()) {

            const id = trs.map(i => RDItemToItem(i).id).setFilter(i => i).sort().join("");

            if (!group_maps.has(id))
                group_maps.set(id, { id, syms: new Set(), trs, priority: 0 });

            const group = group_maps.get(id), sym = sym_map.get(symbol_val);

            if (isSymAnAssertFunction(sym) && isSymAProduction(trs[0].item.sym(grammar))) {
                for (const s of getAssertionSymbolFirst(<AssertionFunctionSymbol>sym, grammar)) {
                    group.syms.add(getUniqueSymbolName(s));
                    sym_map.set(getUniqueSymbolName(s), s);
                }
            } else {
                group.syms.add(symbol_val);
            }

            group.priority +=
                isSymSpecified(sym)
                    ? 1 : isSymAnAssertFunction(sym)
                        ? 64
                        : 1024;
        }

        let
            MULTIPLE_GROUPS = !(group_maps.size == 1),
            if_else_stmts: IfSC[] = [];

        if (MULTIPLE_GROUPS) {
            block_depth++;
            HAVE_ONLY_PRODUCTIONS = false;
        }

        //Now create the necessary if statements with peek if depth > 0
        for (const group of [...group_maps.values()].sort((a, b) => a.priority - b.priority)) {

            let _peek_depth = peek_depth, body: SC = new SC, leaf: SC = body;
            const
                pk = peek_depth,
                trs = group.trs,
                syms = [...group.syms.values()],
                AT_END = syms.length == 1 && syms[0] == getUniqueSymbolName(EOF_SYM);

            let tests = [...syms.map(s => sym_map.get(s))];

            // if (runner.ANNOTATED) body.push("//considered syms: " + tests.map(sanitizeSymbolValForComment).join(" "));

            if (trs.length > 1) {

                //Advance through each symbol until there is a difference
                //When there is a difference create a peek if-else sequence
                let items: Item[] = trs.filter(_ => !!_).map(RDItemToItem).filter(_ => !!_);

                while (true) {
                    const sym = items.map(i => i).filter(i => !i.atEND)?.shift()?.sym(grammar),
                        off = items.filter(i => !i.atEND)?.[0]?.offset;

                    //If any items at end do something
                    //
                    if (off != undefined && sym && !items.some((i) => (i.atEND || (i.sym(grammar)?.val != sym.val)))) {

                        if (_peek_depth >= 0 && HAVE_ONLY_PRODUCTIONS)
                            HAVE_ONLY_PRODUCTIONS = isSymAProduction(sym);

                        //All items transition on the same symbol; resolve body disputes. 
                        leaf = renderItemSym(leaf, items[0], grammar, runner, productions, _peek_depth >= 0, lexer_name);
                        items = items.map(i => i.increment()).filter(i => i);
                        _peek_depth = -1;

                    } else {

                        const
                            items_at_end = items.filter(i => i.atEND),

                            items_not_at_end = items.filter(i => !i.atEND),

                            prod_items = items_not_at_end
                                .filter(i => isSymAProduction(i.sym(grammar))),

                            term_items = items_not_at_end
                                .filter(i => isSymSpecified(i.sym(grammar)) || isSymAGenericType(i.sym(grammar))),

                            paf_la_items = items_not_at_end
                                .filter(i => isSymAnAssertFunction(i.sym(grammar))),

                            new_trs: RDItem[] = []
                                .concat(prod_items.map(i => {

                                    const rd_item = ItemToRDItem(i, grammar);

                                    if (!rd_item.HAS_LR) {

                                        const { closure, COMPLETED } = getPeekAtDepth(rd_item.item, grammar, _peek_depth + 1);

                                        rd_item.closure = closure.setFilter(i => i.id + "-" + i.offset);

                                        // Variant of production is completed at this peek level.
                                        if (COMPLETED) items_at_end.push(i);

                                        rd_item.HAS_LR = doesClosureHaveLR(closure, grammar);
                                    }

                                    return rd_item;
                                }))
                                .concat(term_items.map(i => ItemToRDItem(i, grammar)))
                                .concat(paf_la_items.map(i => ItemToRDItem(i, grammar)))
                                .concat(items_at_end.slice(0, 1).map(i => ItemToRDItem(i, grammar)));


                        if (new_trs.length > 0 || items_at_end.length > 0) {

                            const
                                continuable = new_trs.filter(f => f.closure.length > 0 && (!f.HAS_LR)),
                                has_lr = new_trs.filter(f => f.closure.length > 0 && f.HAS_LR);

                            //Annotations
                            leaf.addStatement(SC.Comment("Look Ahead Level " + (_peek_depth + 1)));
                            leaf.addStatement(SC.Comment("CONTINUE:" + continuable.map(RDItemToItem).map(i => i.renderUnformattedWithProduction(grammar)).join("\n")));
                            leaf.addStatement(SC.Comment("HAS_LR:" + has_lr.map(RDItemToItem).map(i => i.renderUnformattedWithProduction(grammar)).join("\n")));


                            items_at_end.push(...new_trs.filter(f => f.closure.length == 0).map(RDItemToItem));

                            //group has_lr based on sym
                            const lr_groups = has_lr.group(l => getUniqueSymbolName(l.item.sym(grammar))),
                                lr_lexer_name = SC.Variable(lexer_name.value + 1 + ":Lexer");

                            if (lr_groups.length > 0) {
                                addCheckpointStart(<BlockSC>leaf, lexer_name, lr_lexer_name);
                                let i = 0;
                                if (continuable.length > 0) lr_groups.push(continuable);

                                for (const lr_group of lr_groups.sort((a, b) => {
                                    const a_max = a.reduce((r, i) => Math.max(r, i.len), 0);
                                    const b_max = b.reduce((r, i) => Math.max(r, i.len), 0);
                                    a.mm = a_max;
                                    b.mm = b_max;
                                    return b_max - a_max;
                                })
                                ) {

                                    const sc = renderFunctionBody(
                                        lr_group,
                                        grammar,
                                        runner,
                                        code_node,
                                        productions,
                                        generateRBOptions(RETURN_TYPE, 0, block_depth + 1),
                                        lr_lexer_name,
                                    ).sc;

                                    if (i++ > 0)
                                        addCheckpointContinue(<BlockSC>leaf, lexer_name, lr_lexer_name, sc);
                                    else
                                        leaf.addStatement(sc);
                                }

                                addCheckpointComplete(<BlockSC>leaf, lexer_name, lr_lexer_name);

                            } else if (continuable.length > 0)

                                leaf.addStatement(renderFunctionBody(
                                    continuable,
                                    grammar,
                                    runner,
                                    code_node,
                                    productions,
                                    generateRBOptions(RETURN_TYPE, _peek_depth + 1, block_depth + 1),
                                    lexer_name,
                                ).sc);
                        }

                        break;
                    };
                }
            } else {

                //Just complete the grammar symbols
                const item = RDItemToItem(trs[0]);

                if (!item.atEND && HAVE_ONLY_PRODUCTIONS)
                    HAVE_ONLY_PRODUCTIONS = isSymAProduction(item.sym(grammar));

                renderItem(leaf, item, grammar, runner, productions, _peek_depth >= 0 && block_depth >= 0, RETURN_TYPE, lexer_name);
            }

            if (MULTIPLE_GROUPS || !HAVE_ONLY_PRODUCTIONS) {
                if (AT_END)
                    if_else_stmts.push(SC.If().addStatement(body));
                else if (NO_CHECK && HAVE_ONLY_PRODUCTIONS)
                    if_else_stmts.push(SC.If(
                        SC.Binary(SC.UnaryPre(SC.Value("!"), failed_global_var), SC.Value("&&"), getIncludeBooleans(tests, grammar, runner, pk > 0 ? SC.Variable("pk" + (pk), "Lexer") : lexer_name))
                    ).addStatement(body));
                else
                    if_else_stmts.push(SC.If(
                        getIncludeBooleans(tests, grammar, runner, pk > 0 ? SC.Variable("pk" + (pk) + ":Lexer") : lexer_name)
                    ).addStatement(body));
            } else {
                if (HAVE_ONLY_PRODUCTIONS)
                    code_node.addStatement(body);
                else
                    if_else_stmts.push(SC.If(
                        getIncludeBooleans(tests, grammar, runner, pk > 0 ? SC.Variable("pk" + (pk) + ":Lexer") : lexer_name)
                    ).addStatement(body));
            }
        }

        const
            unskip = getResetSymbols(rd_items.map(RDItemToItem), grammar),
            unskippable_symbols = [...sym_map.values(), ...unskip];

        //Item annotations if required
        if (if_else_stmts.length > 0) {

            if_else_stmts.sort((a, b) => +(a.isEmptyIf()) - +(b.isEmptyIf()));
            const declarations = [];
            let lx: VarSC | ConstSC = lexer_name;

            if (peek_depth > 0) {
                addUnskippableAnnotation(runner, stmts, unskippable_symbols);
                lx = SC.Constant(`pk${peek_depth}:Lexer`);
                const prev_lx = peek_depth > 1 ? SC.Constant(`pk${peek_depth - 1}:Lexer`) : lexer_name;

                declarations.push(
                    SC.Assignment(lx,
                        SC.Call(SC.Constant("_pk"),
                            SC.Call(SC.Member(prev_lx, SC.Constant("copy"))),
                            getSkipFunction(grammar, runner, unskippable_symbols)
                        )
                    )
                );
            } else if (!HAVE_ONLY_PRODUCTIONS) {
                addUnskippableAnnotation(runner, stmts, unskippable_symbols);
                code_node.addStatement(addSkipCall(grammar, runner, unskippable_symbols, lexer_name));
            }

            if (declarations.length > 0) code_node.addStatement(SC.Declare(...declarations));

            const root = if_else_stmts[0];
            if_else_stmts.reduce((r, b) => {
                if (r) r.addStatement(b);
                return b;
            }, null);
            code_node.addStatement(root);
        } else if (!HAVE_ONLY_PRODUCTIONS) {
            addUnskippableAnnotation(runner, stmts, unskippable_symbols);
            code_node.addStatement(addSkipCall(grammar, runner, unskippable_symbols, lexer_name));
        }
    }

    return { stmts: stmts.join("\n"), sym_map, sc: code_node };
}
const
    failed_global_var = SC.Variable("FAILED:boolean"),
    global_lexer_name = SC.Variable("l:Lexer"),
    accept_loop_flag = SC.Variable("ACCEPT:boolean"),
    production_global = SC.Variable("prod:unsigned int");

function addCheckpointComplete(block: BlockSC, old_lexer_name: VarSC, new_lexer_name: VarSC) {
    block.addStatement(SC.If(SC.UnaryPre(SC.Value("!"), failed_global_var)).addStatement(
        SC.Call(SC.Member(old_lexer_name, SC.Constant("sync")), new_lexer_name)),
        SC.Empty()

    );
}

function addCheckpointElseComplete(block: BlockSC, old_lexer_name: VarSC, new_lexer_name: VarSC) {
    block.addStatement(SC.If().addStatement(
        SC.Call(SC.Member(old_lexer_name, SC.Constant("sync")), new_lexer_name)),
    );
}

function addCheckpointContinue(block: BlockSC, old_lexer_name: VarSC, new_lexer_name: VarSC, statements: SC = null, RESET_LEXER: boolean = true): SC {
    const _if = SC.If(failed_global_var)
        .addStatement(SC.Assignment(production_global, SC.Constant("p")));
    if (RESET_LEXER) _if.addStatement(SC.Assignment(new_lexer_name, SC.Call(SC.Member(old_lexer_name, SC.Constant("copy")))));
    _if.addStatement(SC.Assignment(failed_global_var, SC.False));
    _if.addStatement(SC.Call(SC.Constant("reset"), SC.Constant("m")));
    if (statements) _if.addStatement(statements);
    block.addStatement(_if);
    return _if;
}

function addCheckpointStart(block: BlockSC, old_lexer_name: VarSC, lr_lexer_name: VarSC) {
    block.addStatement(
        SC.Declare(
            SC.Assignment(lr_lexer_name, SC.Call(SC.Member(old_lexer_name, "copy"))),
            SC.Assignment(SC.Constant("m:unsigned int"), SC.Call("mark")),
            SC.Assignment(SC.Constant("p:unsigned int"), production_global)
        )
    );
}

function addUnskippableAnnotation(runner: CompilerRunner, stmts: string[], unskippable_symbols: TokenSymbol[]) {
    if (runner.ANNOTATED)
        stmts.push(`/* UNSKIPPABLE SYMBOLS: ${unskippable_symbols.map(s => `[${sanitizeSymbolValForComment(s)}]`).join(" ")} */`);
}

export function constructHybridFunction(production: Production, grammar: Grammar, runner: CompilerRunner): RDProductionFunction {

    const
        p = production,
        code_node = SC.Function(SC.Constant("$" + production.name + ":void"), global_lexer_name),
        stmts = [],
        productions: Set<number> = new Set(),
        INLINE_FUNCTIONS = p.bodies.some(has_INLINE_FUNCTIONS),

        { left: left_recursion_items = [], non: non_left_recursion_items = [] }
            = <{ left: RDItem[], non: RDItem[]; }>Object.fromEntries(p.bodies
                .map(b => BodyToRDItem(b, grammar))
                .groupMap(i => checkForLeftRecursion(p, i, grammar) ? "left" : "non")),

        start_items: RDItem[] = p.bodies.map(b => BodyToRDItem(b, grammar)),
        HAVE_LR = left_recursion_items.length > 0,
        return_type = HAVE_LR ? ReturnType.ACCEPT : ReturnType.NONE,
        closure = start_items.map(RDItemToItem);


    //if (runner.ANNOTATED) {
    //    stmts.push("//Production Start");
    //    stmts.push("/*\n" + closure.filter(_ => !!_).map(i => i.renderUnformattedWithProduction(grammar)).join("\n"), "*/");
    //}

    processClosure(closure, grammar, true);

    if (INLINE_FUNCTIONS) stmts.push("const s = []");
    if (HAVE_LR) code_node.addStatement(SC.Declare(SC.Assignment(accept_loop_flag, SC.False)));

    //build non left recursive items first
    try {

        const closure = [left_recursion_items.map(RDItemToItem)].flat();

        processClosure(closure, grammar, true);

        const
            lr_items = closure
                .filter(c => c.sym(grammar).type == SymbolType.PRODUCTION)
                .setFilter(i => i.id)
                .groupMap(i => i.sym(grammar).val),
            rd_items = closure
                .filter(c => c.sym(grammar).type != SymbolType.PRODUCTION)
                .setFilter(i => i.id)
                .map(i => ItemToRDItem(i, grammar));

        if (non_left_recursion_items.length > 0) {
            const sc =
                renderFunctionBody(
                    non_left_recursion_items,
                    grammar,
                    runner,
                    code_node,
                    productions,
                    generateRBOptions(return_type)
                ).sc;
            code_node.addStatement(sc);

        } else {
            const sc = renderFunctionBody(
                rd_items,
                grammar,
                runner,
                code_node,
                productions,
                generateRBOptions(return_type)
            ).sc;
            code_node.addStatement(sc);
        }

        if (HAVE_LR) {
            //Optimization: Productions with identical outcomes are joined to the same switch clause
            const outcome_groups = new Map();

            for (const [key, val] of lr_items.entries()) {
                const hash = val
                    .map((i) => (i.increment().atEND || i.len + " " + i.body) + " " + i.getProduction(grammar).id + " " + (<Item>i).body_(grammar)?.reduce_function?.txt).join("");
                getMappedArray(hash, outcome_groups).push([key, val]);
            }
            code_node.addStatement(SC.Declare(SC.Assignment("i:int", 0)));

            const
                while_node = SC.While(accept_loop_flag),
                switch_node = SC.Switch(production_global);

            while_node.addStatement(SC.Assignment(accept_loop_flag, SC.False));
            while_node.addStatement(switch_node);

            //while_node.addStatement(SC.If(SC.UnaryPre("!", accept_loop_flag)).addStatement(SC.Break));
            code_node.addStatement(while_node);

            for (const [hash, sw_group] of outcome_groups.entries()) {

                const stmts = [];

                for (let i = 0; i < sw_group.length; i++) {

                    const
                        key = sw_group[i][0],
                        items = sw_group[i][1],
                        if_node = SC.If(SC.Value(key));

                    switch_node.addStatement(if_node);

                    if (i == (sw_group.length - 1)) {

                        const
                            lex_name = key == production.id ? SC.Variable("pd:Lexer") : global_lexer_name,
                            follow_symbols = [...FOLLOW(grammar, production.id).values()],
                            { sym_map, sc } = renderFunctionBody(
                                items.map(k => ItemToRDItem(k.increment(), grammar)),
                                grammar,
                                runner,
                                if_node,
                                productions,
                                generateRBOptions(ReturnType.ACCEPT, 0, 1),
                                lex_name
                            );

                        if (key == production.id) {
                            /*   
                                Early exit should only occur if there is an occluding generic ( such as g:sym, g:id ) 
                                that could capture a symbol that would otherwise cause a reduce.  FOLLOW Symbols that 
                                would otherwise be matched match by the generic type should be selected for the early 
                                exit check. If there are no such generics in the excluded  items, then there is no 
                                need to do this check. 
                            */
                            const
                                lookahead_syms = [...follow_symbols.filter(s => isSymGeneratedWS(s) || isSymGeneratedNL(s))],
                                exclude_syms = [...sym_map.values()];

                            if (exclude_syms.some(isSymGeneratedSym))
                                lookahead_syms.push(...follow_symbols.filter(isSymSpecifiedSymbol));

                            if (exclude_syms.some(isSymGeneratedId))
                                lookahead_syms.push(...follow_symbols.filter(isSymSpecifiedIdentifier));

                            if (exclude_syms.some(isSymGeneratedNum))
                                lookahead_syms.push(...follow_symbols.filter(isSymSpecifiedNumeric));

                            if (lookahead_syms.length > 0) {
                                // if (runner.ANNOTATED) {
                                //     stmts.push(`//FOLLOW SYMS: ${follow_symbols.map(i => `[${i.val}]`).join(" ")}`);
                                //     stmts.push(`//EXCLUDE SYMS: ${exclude_syms.map(i => `[${i.val}]`).join(" ")}`);
                                // }
                                const booleans = getIncludeBooleans(lookahead_syms, grammar, runner, global_lexer_name, exclude_syms, false);

                                if (booleans) if_node.addStatement(SC.If(booleans).addStatement(SC.Break));
                            }

                            const block_node = SC.If(SC.Empty());

                            addCheckpointStart(block_node, global_lexer_name, lex_name);
                            block_node.addStatement(sc);
                            const _if = addCheckpointContinue(block_node, global_lexer_name, lex_name, null, false);

                            block_node.addStatement(SC.Empty());
                            addCheckpointElseComplete(_if, global_lexer_name, lex_name);
                            if_node.addStatement(block_node);
                        } else
                            if_node.addStatement(sc);
                    } else {
                        if (runner.ANNOTATED)
                            stmts.push(`/*\n${items.map(i => i.increment().renderUnformattedWithProduction(grammar)).join("\n")}\n*/`);

                    }

                    if (i == sw_group.length - 1) if_node.addStatement(SC.Break);
                }
            }
        }

        if (production.recovery_handler)
            addRecoveryHandlerToFunctionBodyArray(stmts, production, grammar, runner, true);
        else
            code_node.addStatement(SC.If(
                SC.Binary(SC.Binary(production_global, SC.Value("!="), SC.Value(production.id)), "&&", SC.UnaryPre("!", SC.Value("FAILED")))).addStatement(
                    //SC.Call("probe", "l"),
                    SC.Call(SC.Constant("fail"), global_lexer_name))
            );

    } catch (e) {

        console.dir({ name: production.name, error: e });
        return {
            productions,
            id: p.id,
            fn: SC.Expressions(SC.Comment(`/* Could Not Parse in Recursive Descent Mode */`))
        };
    }

    return {
        productions,
        id: p.id,
        fn: code_node
    };
}