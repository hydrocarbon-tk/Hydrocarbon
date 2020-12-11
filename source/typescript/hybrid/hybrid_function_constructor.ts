import { Grammar, Production, ProductionBody, EOF_SYM, SymbolType } from "../types/grammar.js";
import { AssertionFunctionSymbol, Symbol, TokenSymbol } from "../types/Symbol";
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
    createAssertionShift,
    getMappedArray,
    isSymAProduction,
    sanitizeSymbolValForComment,
    isSymGeneratedSym,
    isSymSpecifiedSymbol,
    isSymGeneratedId,
    isSymSpecifiedIdentifier,
    isSymGeneratedNum,
    isSymSpecifiedNumeric,
    isSymGeneratedWS,
    isSymGeneratedNL,
    isSymAnAssertFunction,
    getAssertionSymbolFirst,
    isSymSpecified
} from "./utilities/utilities.js";
import { RDProductionFunction } from "./types/RDProductionFunction";
import { RDItem } from "./types/RDItem";
import { CompilerRunner } from "./types/CompilerRunner.js";
import { AS, BlockSC, ConstSC, CPP, IfSC, RS, SC, VarSC } from "./utilities/skribble.js";
import { TypeKind } from "assemblyscript";



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
            }
        }
    }

    return false;
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



function renderItemProduction(
    code_node: SC,
    item: Item,
    grammar: Grammar,
    runner: CompilerRunner,
    productions: Set<number> = new Set,
    RENDER_WITH_NO_CHECK = false,
    lexer_name: VarSC = global_lexer_name,
    RETURN_TYPE: ReturnType
): { code_node: SC, IS_PRODUCTION: boolean; } {
    let IS_PRODUCTION = false;


    const production = item.getProduction(grammar);

    productions.add(<number>production.id);

    const _if = SC.If(SC.Call(SC.Constant("$" + production.name), lexer_name));

    code_node.addStatement(_if);

    code_node.addStatement(SC.Empty());

    return { code_node: _if, IS_PRODUCTION };
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
                //code_node.addStatement(addSkipCall(grammar, runner, syms, lexer_name));
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
    lexer_name: VarSC = global_lexer_name
): SC {


    if (!item.atEND) {
        const { code_node: leaf, IS_PRODUCTION: IP } = renderItemSym(code_node, item, grammar, runner, productions, DONT_CHECK, lexer_name);
        const new_item = item.increment();

        if (!new_item.atEND) {
            code_node.addStatement(addSkipCall(grammar, runner, FIRST(grammar, new_item.sym(grammar)), lexer_name));
        }
        code_node = renderItem(leaf, item.increment(), grammar, runner, productions, false, lexer_name);
    } else {

        code_node.addStatement(SC.Assignment(SC.Constant("prod"), SC.Value(item.getProduction(grammar).id)));

        return renderItemSym(code_node, item, grammar, runner, productions, true, lexer_name).code_node;
    }

    return code_node;
}

interface RenderBodyOptions {
    pk_name: VarSC,
    block_depth: number;
    peek_depth: number;
    RETURN_TYPE: ReturnType;

    NO_CHECK: boolean;

}

function addReturnType(RETURN_TYPE: ReturnType, code_node: SC) {
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

function generateRBOptions(RT: ReturnType = ReturnType.RETURN, pd: number = 0, bd: number = 0, NC: boolean = false, peek_name = SC.Variable("pk:Lexer")): RenderBodyOptions {
    return {
        pk_name: peek_name,
        peek_depth: pd,
        block_depth: bd,
        RETURN_TYPE: RT,
        NO_CHECK: NC
    };
}
function getGroups(symboled_items: Map<TokenSymbol, Item[]>, grammar: Grammar) {
    const group_maps: Map<string, { syms: Set<TokenSymbol>; items: Item[]; priority: number; }> = new Map;
    for (const [sym, items] of symboled_items) {

        const id = items.setFilter(i => i.id).map(i => {
            const PROD_ID = i.getProduction(grammar).id;
            const BODY = i.body;
            const HAS_REDUCE_FUNCTION = !!i.body_(grammar).reduce_function;
            const str = [PROD_ID];
            if (HAS_REDUCE_FUNCTION)
                str.push("b" + BODY);
            return str.join("_") + "_";

            return i.id;
        }).sort().join("");
        if (!group_maps.has(id))
            group_maps.set(id, { syms: new Set, items, priority: 0 });
        const group = group_maps.get(id);
        if (isSymAnAssertFunction(sym) && isSymAProduction(sym)) {
            for (const s of getAssertionSymbolFirst(<AssertionFunctionSymbol>sym, grammar))
                group.syms.add(getRootSym(s, grammar));
        } else
            group.syms.add(sym);
        group.priority +=
            isSymSpecified(sym)
                ? 1 : isSymAnAssertFunction(sym)
                    ? 64
                    : isSymGeneratedId(sym)
                        ? 1 << 24
                        : 1024;
    }

    return group_maps;
}

function getAccompanyingItems(grammar: Grammar, prod_items: Item[], items: Item[], out: Item[] = [], all = false) {
    const prod_id = new Set((prod_items).map(i => i.getProduction(grammar).id));

    const to_process = [];
    for (const item of items.reverse()) {
        if (!item || item.atEND) continue;

        const sym = item.sym(grammar);
        if (isSymAProduction(item.sym(grammar)) && prod_id.has(<number>sym.val)) {
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

export function renderFunctionBody(
    rd_items: Item[],
    grammar: Grammar,
    runner: CompilerRunner,
    production: Production,
    productions: Set<number> = new Set,
    options: RenderBodyOptions = generateRBOptions(),
    lr_items_globald: Item[] = [],
    production_items: Item[][] = null,
    offset = 0,
): ({ sym_map: Map<TokenSymbol, any>, sc: SC, IS_PRODUCTION: boolean; }) {

    const lr_items_global = [];
    const code_node = new SC;
    const active_items = rd_items
        .filter(i => !i.atEND && !!i);
    const completed_items = rd_items
        .filter(i => i.atEND && !!i);
    const symboled_items: Map<TokenSymbol, Item[]> = active_items
        .filter(i => i.sym(grammar).type != SymbolType.PRODUCTION)
        .groupMap(i => <TokenSymbol>getRootSym(i.sym(grammar), grammar));
    const group_maps: Map<string, { syms: Set<TokenSymbol>, items: Item[]; priority: number; }> = getGroups(symboled_items, grammar);

    let leaf: SC = null, root: SC = leaf;

    for (const { syms: s, items } of group_maps.values()) {

        const syms = [...s.values()];

        let [first] = items;
        let _if: SC = SC.If(getIncludeBooleans(syms, grammar, runner));
        let accompanying_items = items;

        if (items.length > 1) {


            const d = items.map(i => i.increment());

            _if.addStatement(SC.Comment(`Multiple items on [ ${syms.map(s => s.val).join(" ")} ] \n    ` + renderItems(d, grammar).join("\n    ") + "\n"));

            processClosure(d, grammar, true);
            const sc = renderFunctionBody(
                d,
                grammar, runner, production, productions,
                options, lr_items_global, [...production_items, d.setFilter(s => s.id)], offset + 1
            ).sc;
            const sc1 = renderItemSym(_if, first, grammar, runner, productions, true).code_node;

            sc1.addStatement(sc);

            if (leaf) {
                leaf.addStatement(_if);
                leaf = _if;
            } else {
                leaf = _if;
                root = leaf;
            }
        } else {

            const AT_END = first.increment();

            //Need to pull in all items that transition on this production
            if (leaf) {
                leaf.addStatement(_if);
                leaf = _if;
            } else {
                leaf = _if;
                root = leaf;
            }
            if (AT_END)
                _if.addStatement(SC.Comment(`Single item on [ ${syms.map(s => s.val).join(" ")} ] to reduce \n    ` + renderItems(items, grammar).join("\n    ") + "\n"));
            else
                _if.addStatement(SC.Comment(`Items that are expecting production [ ${first.getProduction(grammar).name} ]  \n    `));

            if (first.offset == 0 && first.getProduction(grammar).id != production.id) {
                _if = renderItemProduction(_if, first, grammar, runner, productions, true, global_lexer_name, options.RETURN_TYPE).code_node;
                const new_if = SC.If();
            } else {
                //render out the item
                _if = renderItem(_if, first, grammar, runner, productions, true);
            }

            _if.addStatement(SC.Empty());
        }

        while (offset >= 0) {


            accompanying_items = getAccompanyingItems(grammar, accompanying_items, production_items[offset]);


            //_if.addStatement(SC.Comment(`Items that are expecting production [ ${first.getProduction(grammar).name} ]  \n    ` + renderItems(accompanying_items.map(i => i.increment()), grammar).join("\n    ") + "\n"));

            if (accompanying_items.some(i => i.IS_LR)) {
                lr_items_global.push(...accompanying_items);
                break;
            }

            if (accompanying_items.length == 0) {
                break;
            } else if (accompanying_items.length > 1) {
                while (accompanying_items.length > 0) {
                    lr_items_global.push(...accompanying_items);
                    accompanying_items = getAccompanyingItems(grammar, accompanying_items, production_items[offset]);
                }
                break;
                const closureA = accompanying_items.map(i => i);
                processClosure(closureA, grammar, true);
                const closure = accompanying_items.map(i => i.increment());
                processClosure(closure, grammar, true);
                console.log(closure.map(i => i.renderUnformattedWithProduction(grammar)));
                const globs = [];
                const results = [];
                const sc = renderFunctionBody(
                    closure,
                    grammar, runner, production, productions,
                    options, globs, [...production_items, accompanying_items.map(i => i.increment()).filter(i => i && !i.atEND)],
                    offset + 1
                ).sc;

                accompanying_items = accompanying_items.map(i => i.increment()).filter(i => !i.atEND);
                _if.addStatement(sc);
                //    _if.addStatement(SC.Comment(`Items that are ready for completion [ ${offset} ]  \n    ` + renderItems(accompanying_items, grammar).join("\n    ") + "\n"));
                _if = sc;
                //  break;
            } else {
                first = accompanying_items[0].increment();
                _if = renderItem(_if, first, grammar, runner, productions, true);
                //render item
                const p = first.getProduction(grammar);

                accompanying_items = accompanying_items.map(i => i.increment());

                if (p.id == production.id) {
                    addReturnType(options.RETURN_TYPE, _if);
                    break;
                };
            }
        }
        //Need to disambiguate
    }
    //This is where the while 

    lr_items_global.push(...completed_items.map(i => i.decrement()));

    code_node.addStatement(root);

    let _if = renderLRLoop(lr_items_global, grammar, runner, production, productions, code_node, production_items[offset]);

    if (code_node == _if) {
        _if = leaf || code_node;
    }

    return ({ sc: code_node, _if, sym_map: symboled_items });
}
function renderLRLoop(
    left_recursion_items: Item[],
    grammar: Grammar,
    runner: CompilerRunner,
    production: Production,
    productions: Set<number>,
    code_node: SC,
    production_items: Item[]
) {
    if (left_recursion_items.length > 0) {

        const lr_items = left_recursion_items
            .setFilter(i => i.id)
            .groupMap(i => i.sym(grammar).val),
            production_io_map = left_recursion_items.reduce((r, i) => {
                const trans_production = i.getProductionAtSymbol(grammar).id;
                if (!r.has(trans_production))
                    r.set(trans_production, []);
                r.get(trans_production).push(i.getProduction(grammar).id);
                return r;
            }, new Map),
            outcome_groups = new Map();

        let HAS_PRODUCTION_RECURSION = false;

        for (const prod_ids of production_io_map.values()) {
            HAS_PRODUCTION_RECURSION = HAS_PRODUCTION_RECURSION || prod_ids.some(id => production_io_map.has(id));
            if (HAS_PRODUCTION_RECURSION) break;
        }

        const RETURN_TYPE = HAS_PRODUCTION_RECURSION ? ReturnType.ACCEPT : ReturnType.NONE;

        //Optimization: Productions with identical outcomes are joined to the same switch clause

        for (const [key, val] of lr_items.entries()) {
            const hash = val
                .map((i) => (i.increment().atEND || i.len + " " + i.body) + " " + i.getProduction(grammar).id + " " + (<Item>i).body_(grammar)?.reduce_function?.txt).join("");
            getMappedArray(hash, outcome_groups).push([key, val]);
        }

        const switch_node = SC.Switch(production_global);


        for (const [, sw_group] of outcome_groups.entries()) {

            for (let i = 0; i < sw_group.length; i++) {

                const
                    key = sw_group[i][0],
                    if_node = SC.If(SC.Value(key));

                switch_node.addStatement(if_node);


                if (i == (sw_group.length - 1)) {

                    const
                        shift_items = sw_group[i][1].map(i => i.increment()).filter(i => !i.atEND),
                        end_items = sw_group[i][1].map(i => i.increment()).filter(i => i.atEND),
                        lex_name = global_lexer_name,
                        follow_symbols = [...FOLLOW(grammar, production.id).values()];
                    let
                        active_node = if_node;

                    if (shift_items.length > 0)
                        if_node.addStatement(SC.Comment(`Items that shift on production \n    ` + renderItems(shift_items, grammar).join("\n    ") + "\n"));
                    if (end_items.length > 0)
                        if_node.addStatement(SC.Comment(`Items that reduce on production \n    ` + renderItems(end_items, grammar).join("\n    ") + "\n"));

                    if (shift_items.length > 0) {

                        const d = shift_items.slice();

                        if (key != production.id)
                            processClosure(d, grammar, true);
                        const { sym_map, sc, _if: __if } = renderFunctionBody(
                            shift_items,
                            grammar,
                            runner,
                            production,
                            productions,
                            generateRBOptions(RETURN_TYPE, 0, 1),
                            [],
                            [production_items]
                        );

                        active_node = __if;

                        if_node.addStatement(addSkipCall(grammar, runner, [...sym_map.keys()], global_lexer_name));

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
                                lookahead_syms = [...follow_symbols.filter(s => isSymGeneratedWS(s) || isSymGeneratedNL(s))],
                                exclude_syms = [...sym_map.values()];

                            if (exclude_syms.some(isSymGeneratedSym))
                                lookahead_syms.push(...follow_symbols.filter(isSymSpecifiedSymbol));

                            if (exclude_syms.some(isSymGeneratedId))
                                lookahead_syms.push(...follow_symbols.filter(isSymSpecifiedIdentifier));

                            if (exclude_syms.some(isSymGeneratedNum))
                                lookahead_syms.push(...follow_symbols.filter(isSymSpecifiedNumeric));

                            if (lookahead_syms.length > 0) {
                                const booleans = getIncludeBooleans(lookahead_syms, grammar, runner, global_lexer_name, exclude_syms, false);

                                if (booleans)
                                    if_node.addStatement(SC.If(booleans).addStatement(SC.Break));
                            }
                            block_node.addStatement(sc);
                            const _if = addCheckpointContinue(block_node, lex_name, l_lex_name, null, false);

                            block_node.addStatement(SC.Empty());
                            addCheckpointElseComplete(_if, global_lexer_name, l_lex_name);
                            if_node.addStatement(block_node);
                        } else {
                            if_node.addStatement(sc);
                        }
                    }

                    for (const item of end_items) {
                        if (shift_items.length > 0) {
                            const _if = SC.If();
                            const sc = renderItem(_if, item, grammar, runner, productions, true);
                            addReturnType(ReturnType.ACCEPT, sc);
                            active_node.addStatement(sc);
                        } else {
                            renderItem(active_node, item, grammar, runner, productions, true);
                            addReturnType(ReturnType.ACCEPT, active_node);
                        }
                    }
                    if_node.addStatement(SC.Break);
                }
            }
        }

        const _if = SC.If(SC.Value([...production_io_map.keys()].map(i => "prod==" + i).join(" || ")));

        code_node.addStatement(_if);

        if (HAS_PRODUCTION_RECURSION) {
            const
                while_node = SC.While(SC.Value("1"));
            while_node.addStatement(SC.Declare(SC.Assignment(accept_loop_flag, SC.False)));
            while_node.addStatement(switch_node);
            while_node.addStatement(SC.If(SC.UnaryPre(SC.Value("!"), accept_loop_flag)).addStatement(SC.Break));
            _if.addStatement(while_node);
        } else {
            _if.addStatement(switch_node);
        }

        return _if;
    }

    return code_node;
}

export function constructHybridFunction(production: Production, grammar: Grammar, runner: CompilerRunner): RDProductionFunction {

    const
        p = production,
        code_node = SC.Function(SC.Constant("$" + production.name + ":bool"), global_lexer_name),
        stmts = [],
        productions: Set<number> = new Set();

    let items: Item[] = p.bodies.map(b => new Item(b.id, b.length, 0, EOF_SYM));

    processClosure(items, grammar, true);

    items.forEach(i => (i.IS_LR = checkForLeftRecursion(i.getProduction(grammar), i, grammar), i));


    code_node.addStatement(
        SC.If(SC.Value("true")).addStatement(
            SC.Declare(SC.Assignment("p:unsigned int", "prod")),
            SC.Assignment("prod", 1000000 + production.id),
            SC.Call("probe", "l:Lexer"),
            SC.Assignment("prod", "p:unsigned int")

        )
    );

    try {

        const
            left_recursion_items: Item[] = [],
            production_items = items.filter(i => i.sym(grammar).type == SymbolType.PRODUCTION),
            sc =
                renderFunctionBody(
                    items,
                    grammar,
                    runner,
                    production,
                    productions,
                    generateRBOptions(ReturnType.ACCEPT),
                    left_recursion_items,
                    [production_items]
                ).sc;


        code_node.addStatement(sc);

        code_node.addStatement(SC.Declare(SC.Assignment("SUCCESS:bool", SC.Binary(production_global, SC.Value("=="), SC.Value(production.id)))));

        if (production.recovery_handler)
            addRecoveryHandlerToFunctionBodyArray(stmts, production, grammar, runner, true);
        else
            code_node.addStatement(SC.If(
                SC.Binary(SC.UnaryPre("!", SC.Value("SUCCESS")), "&&", SC.UnaryPre("!", SC.Value("FAILED"))))
                .addStatement(
                    SC.Call(SC.Constant("fail"), global_lexer_name),
                    SC.Empty()
                )
            );



        code_node.addStatement(
            SC.If(SC.Value("true")).addStatement(
                SC.Declare(SC.Assignment("p:unsigned int", "prod")),
                SC.Assignment("prod", 1000000 + production.id),
                SC.Call("probe", "l:Lexer"),
                SC.Assignment("prod", "p:unsigned int")

            )
        );
        code_node.addStatement(SC.UnaryPre(SC.Return, SC.Value("SUCCESS")));

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
