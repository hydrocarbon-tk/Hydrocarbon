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
import { getClosureAtOffset } from "./getClosureAtOffset.js";
import { inspect } from "util";


function incrementLexerName(sc: VarSC) {
    const name = sc.value;
    return SC.Variable(name + 1 + ":Lexer");

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

function addCheckpointStart(block: BlockSC, old_lexer_name: VarSC): VarSC {
    const lr_lexer_name = incrementLexerName(old_lexer_name);
    block.addStatement(
        SC.Declare(
            SC.Assignment(lr_lexer_name, SC.Call(SC.Member(old_lexer_name, "copy"))),
            SC.Assignment(SC.Constant("m:unsigned int"), SC.Call("mark")),
            SC.Assignment(SC.Constant("p:unsigned int"), production_global)
        )
    );
    return lr_lexer_name;
}

function addUnskippableAnnotation(runner: CompilerRunner, stmts: string[], unskippable_symbols: TokenSymbol[]) {
    if (runner.ANNOTATED)
        stmts.push(`/* UNSKIPPABLE SYMBOLS: ${unskippable_symbols.map(s => `[${sanitizeSymbolValForComment(s)}]`).join(" ")} */`);
}
function checkForLeftRecursion(p: Production, item: Item, grammar: Grammar, encountered_productions = new Set([p.id])) {
    // return p.IS_LEFT_RECURSIVE;

    const closure_items = [item];

    processClosure(closure_items, grammar, true);

    for (const i of closure_items) {

        const sym = i.sym(grammar);

        if (sym) {

            if (sym.type == "production") {

                if (encountered_productions.has(grammar[sym.val].id))
                    return true;

                // encountered_productions.add(grammar[sym.val].id);
            }
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
): { code_node: SC, IS_PRODUCTION: boolean; } {
    let IS_PRODUCTION = false;
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

            IS_PRODUCTION = true;

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
        return { code_node: _if, IS_PRODUCTION };
    }

    return { code_node, IS_PRODUCTION };
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
): boolean {

    let IS_PRODUCTION = false;

    if (!item.atEND) {
        const { code_node: leaf, IS_PRODUCTION: IP } = renderItemSym(code_node, item, grammar, runner, productions, DONT_CHECK, lexer_name);

        IS_PRODUCTION = IP;

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

    return IS_PRODUCTION;
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
    pk_name: VarSC,
    block_depth: number;
    peek_depth: number;
    RETURN_TYPE: ReturnType;

    NO_CHECK: boolean;

}

function generateRBOptions(RT: ReturnType = ReturnType.RETURN, pd: number = 0, bd: number = 0, NC: boolean = false, peek_name = SC.Variable("pk:Lexer")): RenderBodyOptions {
    return {
        pk_name: peek_name,
        peek_depth: pd,
        block_depth: bd,
        RETURN_TYPE: RT,
        NO_CHECK: NC
    };
}
export function renderFunctionBody(
    rd_items: Item[],
    grammar: Grammar,
    runner: CompilerRunner,
    production: Production,
    productions: Set<number> = new Set,
    options: RenderBodyOptions = generateRBOptions(),
    lexer_name: VarSC = global_lexer_name,
    FORCE_IF = false,
    lr_items_global = []
): ({ sym_map: Map<string, TokenSymbol>, sc: SC, IS_PRODUCTION: boolean; }) {

    const code_node = new SC;

    const active_items = rd_items
        .filter(i => !i.atEND && !!i);

    const completed_items = rd_items
        .filter(i => i.atEND && !!i);

    const symboled_items: Map<TokenSymbol, Item[]> = active_items
        .filter(i => i.sym(grammar).type != SymbolType.PRODUCTION)
        .groupMap(i => <TokenSymbol>getRootSym(i.sym(grammar), grammar));

    const production_items: Item[] = active_items
        .filter(i => i.sym(grammar).type != SymbolType.PRODUCTION);

    code_node.addStatement(addSkipCall(grammar, runner, [...symboled_items.keys()], lexer_name));

    let if_count = 0, leaf = null, root = leaf;

    for (const [sym, items] of symboled_items) {
        let [first] = items;
        if (items.length > 1) {
            const _if = SC.If(getIncludeBooleans([sym], grammar, runner));
            const d = items.map(i => i.increment());
            processClosure(d, grammar, true);
            const sc = renderFunctionBody(
                d,
                grammar, runner, production, productions,
                options, lexer_name, false, lr_items_global
            ).sc;
            _if.addStatement(sc);
            //render out the item
            //renderItem(_if, first, grammar, runner, productions, true, options.RETURN_TYPE);
            if (leaf) {
                leaf.addStatement(_if);
                leaf = _if;
            } else {
                leaf = _if;
                root = leaf;
            }
            //Need to disambiguate
        } else if (first.increment().atEND) {
            //Need to pull in all items that transition on this production
            const _if = SC.If(getIncludeBooleans([sym], grammar, runner));
            //render out the item
            renderItem(_if, first, grammar, runner, productions, true, options.RETURN_TYPE);
            if (leaf) {
                leaf.addStatement(_if);
                leaf = _if;
            } else {
                leaf = _if;
                root = leaf;
            }

            //walk back up the stack, grabbing all items that could transition on the symbol
            while (true) {
                const accompanying_items = getAccompanyingItems(grammar, first.getProduction(grammar).id, active_items);

                if (accompanying_items.length == 0) {
                    break;
                } else if (accompanying_items.length > 1) {

                    const sc = renderFunctionBody(
                        accompanying_items.map(i => i.increment()),
                        grammar, runner, production, productions,
                        options, lexer_name, false, lr_items_global
                    ).sc;
                    leaf.addStatement(sc);
                    break;
                } else {
                    first = accompanying_items[0].increment();
                    renderItem(leaf, first, grammar, runner, productions, true, options.RETURN_TYPE);
                    //render item
                    const p = first.getProduction(grammar);

                    if (p.id == production.id) break;
                    break;
                }

                break;
            }



            //render out the item
            /* if (HAS_SHIFTS) {
 
             } else {
 
                 //IF the goal is present without any shifts
                 console.log({ HAS_SHIFTS, i: first.renderUnformattedWithProduction(grammar), items: renderItems(accompanying_items, grammar) });
                 //Gather accompanying_items
             }*/
        } else {
            const accompanying_items = getAccompanyingItems(grammar, first.getProduction(grammar).id, active_items, undefined, true);
            const HAS_LR = accompanying_items.some(i => i.IS_LR);
            const _if = SC.If(getIncludeBooleans([sym], grammar, runner));
            //render out the item
            renderItem(_if, first, grammar, runner, productions, true, options.RETURN_TYPE);
            if (leaf) {
                leaf.addStatement(_if);
                leaf = _if;
            } else {
                leaf = _if;
                root = leaf;
            }

            if (HAS_LR) lr_items_global.push(...accompanying_items);
        }
    }

    for (const item of completed_items) {
        if_count++;
        const _if = SC.If(SC.Value("true"));
        //render out the item
        renderItem(_if, item, grammar, runner, productions, true, options.RETURN_TYPE);

        if (leaf) {
            leaf.addStatement(_if);
            leaf = _if;
        } else {
            leaf = _if;
            root = leaf;
        }
    }

    code_node.addStatement(root);

    return ({ sc: code_node });
}
function getAccompanyingItems(grammar: Grammar, prod_id, items: Item[], out: Item[] = [], all = false) {
    const to_process = [];
    for (const item of items.reverse()) {
        const sym = item.sym(grammar);
        if (isSymAProduction(item.sym(grammar)) && prod_id == sym.val) {
            out.push(item);
            if (item.increment().atEND) {
                to_process.push(item);

            }
        }
    }
    if (all)
        for (const item of to_process) {
            getAccompanyingItems(grammar, item.getProduction(grammar).id, items, out, all);
        }
    return out;//.setFilter(i => i.id);
}
function renderItems(rd_items: Item[], grammar: Grammar): string[] {
    return rd_items.map(i => i.renderUnformattedWithProduction(grammar));
}

export function constructHybridFunction(production: Production, grammar: Grammar, runner: CompilerRunner): RDProductionFunction {

    const
        p = production,
        code_node = SC.Function(SC.Constant("$" + production.name + ":void"), global_lexer_name),
        stmts = [],
        productions: Set<number> = new Set(),
        INLINE_FUNCTIONS = p.bodies.some(has_INLINE_FUNCTIONS);

    let items: Item[] = p.bodies
        .map(b => new Item(b.id, b.length, 0, {}));

    processClosure(items, grammar, true);

    items.forEach(i => (i.IS_LR = checkForLeftRecursion(i.getProduction(grammar), i, grammar), i));

    let left_recursion_items: Item[] = [];
    const start_items: RDItem[] = p.bodies.map(b => BodyToRDItem(b, grammar));

    code_node.addStatement(
        SC.If(SC.Value("true")).addStatement(
            SC.Declare(SC.Assignment("p:unsigned int", "prod")),
            SC.Assignment("prod", production.id),
            SC.Call("probe", "l:Lexer"),
            SC.Assignment("prod", "p:unsigned int")

        )
    );


    //if (runner.ANNOTATED) {
    //    stmts.push("//Production Start");
    //    stmts.push("/*\n" + closure.filter(_ => !!_).map(i => i.renderUnformattedWithProduction(grammar)).join("\n"), "*/");
    //}



    //if (INLINE_FUNCTIONS) code_node.addStatement(SC.Declare stmts.push("const s = []");
    /*if (HAVE_LR)*/ code_node.addStatement(SC.Declare(SC.Assignment(accept_loop_flag, SC.False)));
    //build non left recursive items first
    try {
        const sc =
            renderFunctionBody(
                items,
                grammar,
                runner,
                production,
                productions,
                generateRBOptions(ReturnType.ACCEPT),
                global_lexer_name,
                false,
                left_recursion_items
            ).sc;
        code_node.addStatement(sc);

        const
            lr_items = left_recursion_items
                .filter(c => c.sym(grammar).type == SymbolType.PRODUCTION)
                .setFilter(i => i.id)
                .groupMap(i => i.sym(grammar).val);



        if (left_recursion_items.length > 0) {
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
                            lex_name = global_lexer_name,
                            follow_symbols = [...FOLLOW(grammar, production.id).values()];

                        if (key == production.id) {
                            /*   
                                Early exit should only occur if there is an occluding generic ( such as g:sym, g:id ) 
                                that could capture a symbol that would otherwise cause a reduce.  FOLLOW Symbols that 
                                would otherwise be matched match by the generic type should be selected for the early 
                                exit check. If there are no such generics in the excluded  items, then there is no 
                                need to do this check. 
                            */

                            const block_node = SC.If(SC.Empty()),
                                l_lex_name = addCheckpointStart(block_node, lex_name),
                                { sym_map, sc } = renderFunctionBody(
                                    items.map(i => i.increment),
                                    grammar,
                                    runner,
                                    production,
                                    productions,
                                    generateRBOptions(ReturnType.ACCEPT, 0, 1),
                                    l_lex_name
                                ),
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


                            block_node.addStatement(sc);
                            const _if = addCheckpointContinue(block_node, lex_name, l_lex_name, null, false);

                            block_node.addStatement(SC.Empty());
                            addCheckpointElseComplete(_if, global_lexer_name, l_lex_name);
                            if_node.addStatement(block_node);
                        } else {

                            const d = items.map(i => i.increment());
                            processClosure(d, grammar, true);
                            //  d.forEach(i => (i.IS_LR = checkForLeftRecursion(i.getProduction(grammar), i, grammar), i));

                            if_node.addStatement(
                                SC.Comment(renderItems(d, grammar).join("\n"))
                            );
                            //*
                            const { sym_map, sc } = renderFunctionBody(
                                d,
                                grammar,
                                runner,
                                production,
                                productions,
                                generateRBOptions(ReturnType.ACCEPT, 0, 1),
                                lex_name
                            );
                            //*/
                            if_node.addStatement(sc);
                        }

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
                SC.Binary(SC.Binary(production_global, SC.Value("!="), SC.Value(production.id)), "&&", SC.UnaryPre("!", SC.Value("FAILED"))))
                .addStatement(
                    SC.Call(SC.Constant("fail"), global_lexer_name),
                    SC.Empty()
                )
            );

        code_node.addStatement(
            SC.If(SC.Value("FAILED")).addStatement(
                SC.Declare(SC.Assignment("p:unsigned int", "prod")),
                SC.Assignment("prod", production.id),
                SC.Call("probe", "l:Lexer"),
                SC.Assignment("prod", "p:unsigned int")
            ));

    } catch (e) {

        return {
            productions,
            id: p.id,
            fn: code_node.addStatement(SC.Expressions(SC.Comment(`Could Not Parse [${production.name}] in Recursive Descent Mode \n${e.message + e.stack + ""}\n`)))
        };
    }

    return {
        productions,
        id: p.id,
        fn: code_node
    };
}