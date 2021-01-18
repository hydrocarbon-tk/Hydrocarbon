import { performance } from "perf_hooks";
import {
    doesProductionHaveEmpty,
    getAccompanyingItems,
    getAssertionSymbolFirst,
    getProductionFirst,
    getProductionID,
    getTrueSymbolValue,
    getUniqueSymbolName,
    isSymAnAssertFunction,
    isSymAProduction,
    isSymAProductionToken,
    itemsToProductions
} from "./utilities.js";
import { EOF_SYM, Grammar, ItemMapEntry } from "../types/grammar.js";
import { SymbolType } from "../types/symbol_type";
import { Production } from "../types/production";
import { AssertionFunctionSymbol, ProductionSymbol, ProductionTokenSymbol, Symbol, TokenSymbol } from "../types/symbol";
import { FOLLOW } from "./follow.js";
import { Item } from "./item.js";
import { getClosure } from "./get_closure.js";
import { closure_group, TransitionTreeNode } from "../types/transition_tree_nodes";
import { ItemIndex } from "../../../build/types/util/item.js";
import { Token } from "assemblyscript";

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
export function filloutGrammar(grammar: Grammar, env) {

    const bodies = [],
        reduce_lu: Map<string, number> = new Map,
        symbols: Map<string, Symbol> = new Map([[getUniqueSymbolName(EOF_SYM), EOF_SYM]]),
        syms = [];

    for (let i = 0, j = 0; i < grammar.length; i++) {
        const production = grammar[i];
        production.follow_ref = [];

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
    grammar.item_map = null;

    for (const sym of syms.filter(isSymAnAssertFunction)) getAssertionSymbolFirst(<AssertionFunctionSymbol>sym, grammar);

    buildItemMap(grammar);

    return grammar;
}

export function getItemMapEntry(grammar: Grammar, item_id: string): ItemMapEntry {
    if (!grammar.item_map.has(item_id)) {
        grammar.item_map.set(item_id, <ItemMapEntry>{
            item: null,
            closure: null,
            LR: false,
            RR: null,
            //index: -1,
            containing_items: new Set,
            depth: Infinity
        });
    }

    return grammar.item_map.get(item_id);
}

function addFollowInformation(item: Item, grammar: Grammar, check_set: Set<string>[], follow_sym: TokenSymbol = EOF_SYM, item_map) {

    if (item.atEND) {
        grammar.item_map.get(item.id).follow.add(getUniqueSymbolName(follow_sym));
        return;
    }

    item_map.push(item.renderUnformattedWithProduction(grammar));
    let sym: Symbol =
        !item.increment().atEND
            ? item.increment().sym(grammar)
            : null,
        item_sym = item.sym(grammar),
        follow: TokenSymbol[] = [follow_sym];

    if (sym)
        if (isSymAProduction(sym)) {

            //follow = follow.concat(getProductionFirst(sym.val, grammar));

            let look_ahead = item.increment(),
                sym = look_ahead.sym(grammar);

            do {

                if (!look_ahead.atEND) {

                    if (isSymAProduction(sym) || isSymAProductionToken(sym)) {
                        follow = follow.concat(getProductionFirst(getProductionID(sym, grammar), grammar)).setFilter(getUniqueSymbolName);
                    } else {
                        follow = follow.concat(sym).setFilter(getUniqueSymbolName);
                        break;
                    }

                } else {
                    follow.push(follow_sym);
                    break;
                }

                look_ahead = look_ahead.increment();

            } while (doesProductionHaveEmpty(getProductionID(sym, grammar), grammar));

        } else follow = getTrueSymbolValue(sym, grammar);

    if (isSymAProduction(item_sym) || isSymAProductionToken(item_sym)) {

        const
            prod_id = getProductionID(item_sym, grammar),
            prod: Production = grammar[prod_id];

        item_map.push(grammar[prod_id].name);
        for (const body of prod.bodies) {

            for (const follow_sym of follow) {

                const
                    new_item = new Item(body.id, body.length, 0, follow_sym),
                    id = new_item.full_id;

                if (!check_set[prod_id].has(id)) {
                    check_set[prod_id].add(id);
                    addFollowInformation(new_item, grammar, check_set, follow_sym, item_map);
                } else {
                    new_item[ItemIndex.offset] = new_item[ItemIndex.length];
                    grammar.item_map.get(new_item.id).follow.add(getUniqueSymbolName(follow_sym));
                }
            }
        }
    }

    addFollowInformation(item.increment(), grammar, check_set, follow_sym, item_map);
}
export function buildItemClosures(grammar: Grammar) {
    const
        production_ready = grammar.map(i => ({ count: 0, items: null })),
        items_sets: ItemMapEntry[] = grammar.flatMap(p => {
            // If there are any reduces on p add to the 

            const items = p.bodies.map(b => {
                const out_syms: ItemMapEntry[] = [];
                let item = new Item(b.id, b.length, 0, EOF_SYM);
                let depth = b.id + p.id * grammar.length;
                do {
                    if (!item.atEND && item.sym(grammar).type == SymbolType.PRODUCTION) {
                        const other_prod = item.getProductionAtSymbol(grammar);
                        if (item.len - item.offset == 1) {
                            other_prod.follow_ref.push(p.id);
                        }
                    }

                    if (!item.atEND) {
                        const sym = item.sym(grammar);
                        if (isSymAProduction(sym) && sym.subtype) {
                            const sub_production = grammar[sym.val];

                            for (const body of sub_production.bodies) {
                                body.reset.set(0, b.reset.get(0));
                            }
                        }
                    }

                    const reset_sym = item.offset >= 0 ? (b.reset.get(item.offset) ?? []).map(getUniqueSymbolName) : [];

                    out_syms.push(<ItemMapEntry>{
                        item,
                        closure: [],
                        reset_sym,
                        LR: false,
                        RR: [],
                        excludes: b.excludes.get(item.offset) ?? [],
                        rank: item.offset,
                        depth: depth,
                        hash: "",
                        follow: new Set,
                        skippable: null,
                        containing_items: new Set
                    });
                    depth++;
                } while (item = item.increment());

                return out_syms;
            });
            production_ready[p.id].all_items = items;
            production_ready[p.id].items = items.map(i => i[0]);

            return items.flat();
        }),
        sorted = new Set(),
        completed: typeof items_sets = [],
        prods = [];

    // Sort items and set item rank data
    function setItemRankAndDepth(i: ItemMapEntry, rank = 1, depth = Infinity) {
        const { item } = i;
        i.depth = Math.min(i.depth, depth);
        if (!sorted.has(item.id)) {
            sorted.add(item.id);
            if (item.atEND) completed.push(i);
            else {
                const sym = item.sym(grammar);
                if (sym.type == SymbolType.PRODUCTION) {
                    const prod_id = sym.val;
                    prods.push(i);
                    for (const items of production_ready[prod_id].all_items) {
                        let j = 0;
                        for (const a of items) {
                            a.rank = rank;
                            setItemRankAndDepth(a, a.rank + 1, i.depth + 1 + j++);
                        }
                    }
                } else {
                    completed.push(i);
                }
            }
        }
    }

    //for (const i of items_sets) setItemRankAndDepth(i);

    /////////////////////////////////////////////////////////////
    // Compile closure information

    let CHANGE = true, pending: ItemMapEntry[] = items_sets.slice();//.concat(prods);

    while (CHANGE || pending.length > 0) {

        CHANGE = false;

        let temp_pending = pending.slice();

        pending.length = 0;

        for (const obj of temp_pending) {

            const { closure, item, excludes, hash } = obj;

            let temp = [];

            temp.push(item);

            if (item.atEND) {
                obj.closure = temp;
                continue;
            };

            const sym = item.sym(grammar);

            if (sym.type == SymbolType.PRODUCTION) {
                const prod_id = sym.val;
                temp.push(...production_ready[prod_id].items.flatMap(i => i.closure));
            }

            temp = temp.setFilter(i => i.id);

            let new_hash = temp.map(i => i.id).sort().join("");

            for (const exclude of excludes) {

                outer:
                for (let i = 0; i < temp.length; i++) {
                    let itm = Item.fromArray(<Item>temp[i]);
                    if (itm.length < exclude.length) continue;
                    itm[2] = exclude.length - 1;

                    for (let i = exclude.length - 1; i >= 0; i--) {
                        const sym = itm.sym(grammar);
                        if (getUniqueSymbolName(sym) != getUniqueSymbolName(exclude[i])) continue outer;
                        itm = itm.decrement();
                    }
                    temp.splice(i--, 1);
                }
            }

            if (obj.hash != new_hash)
                pending.push(obj);
            else
                CHANGE = true;

            obj.closure = temp;
            obj.hash = new_hash;
        }
    }

    // Assign item map to grammar

    grammar.item_map = new Map(items_sets.map(i => [i.item.id, i]));

    /////////////////////////////////////////////////////////////
    // Add recursion information

    for (const obj of items_sets) {

        const { item, closure } = obj,
            item_id = item.id,
            production_id = item.getProduction(grammar).id;

        const LR = item.offset == 0 &&
            closure.filter(i => i?.sym(grammar)?.type == SymbolType.PRODUCTION).some(i => i.getProductionAtSymbol(grammar).id == production_id);

        //Right recursion occurs when the origin item shows up in a shifted item's list. 
        const RR = item.offset > 0
            ? closure.slice(1).filter(i => i?.sym(grammar)?.type != SymbolType.PRODUCTION)
                .filter(i => i.body == item.body)
                .map(i => getUniqueSymbolName(i.sym(grammar)))
            : [];

        //Convert items to their string identifier to be more data friendly when transferring to workers. 
        obj.closure = obj.closure.map(i => i.id);

        for (const sub_item_id of obj.closure)
            if (item_id !== sub_item_id) getItemMapEntry(grammar, sub_item_id).containing_items.add(item_id);

        obj.LR = LR;
        obj.RR = RR;
    }

    /////////////////////////////////////////////////////////////
    //Add Follow Information

    const check_set: Set<string>[] = grammar.map(() => new Set());
    const item_map = [];
    for (const b of grammar[0].bodies)
        addFollowInformation(new Item(b.id, b.length, 0, EOF_SYM), grammar, check_set, EOF_SYM, item_map);

    /////////////////////////////////////////////////////////////
    //Add ignored symbols information

    const standard_skips = [];

    for (const i of grammar.meta.ignore)
        standard_skips.push(...i.symbols);

    for (const obj of items_sets) {

        const first = obj.item.atEND
            ? obj.follow
            : isSymAProduction(obj.item.sym(grammar))
                ? new Set(getProductionFirst(obj.item.sym(grammar).val, grammar).map(getUniqueSymbolName))
                : new Set((getTrueSymbolValue(obj.item.sym(grammar), grammar)).map(getUniqueSymbolName));

        obj.skippable = new Set(
            standard_skips
                .map(getUniqueSymbolName)
                .filter(i => !obj.reset_sym.includes(i))
                .filter(i => !first.has(i))
        );
    }

    return items_sets;
}

export function buildItemMap(grammar: Grammar) {
    buildItemClosures(grammar);
}

/**
 * Get closure that includes items that transition from completed item productions
 * @param closure 
 * @param lr_transition_items 
 * @param grammar 
 * @param productions 
 */
export function getFollowClosure(closure: Item[], lr_transition_items: Item[], grammar: Grammar, productions: Set<number> = new Set) {
    const new_closure = closure.slice();
    if (closure.some(i => i.atEND)) {
        const prods = itemsToProductions(closure.filter(i => i.atEND), grammar);
        for (let prod of prods) {
            if (productions.has(prod))
                continue;
            productions.add(prod);
            const items = getAccompanyingItems(grammar, [prod], lr_transition_items).map(i => i.increment());
            const c = getClosure(items, grammar);
            new_closure.push(...getFollowClosure(c, lr_transition_items, grammar, productions));

        }
    }
    return new_closure.setFilter(i => i.id).filter(i => !i.atEND);
}

export function getSymbolsFromClosure(closure: Item[], grammar: Grammar): any {
    return [
        ...new Set(
            closure
                .filter(i => !i.atEND)
                .filter(i => !isSymAProduction(i.sym(grammar)))
                .flatMap(i => getTrueSymbolValue(<TokenSymbol>i.sym(grammar), grammar))
        ).values()
    ];
}



/**
 * Givin a set of root items, return a tree of nodes where each node represents a
 * transition on a symbol and a the collection of root items that still exist at 
 * that node. Depth limited to some givin value to prevent infinite recursion.
 * 
 * Default depth is 1.
 */
export function getTransitionTree(
    grammar: Grammar,
    root_items: Item[],
    lr_transition_items: Item[],
    max_tree_depth = 1,
    max_no_progress = 3,
    /**
     * Max amount of time the search process may take,
     * measured in milliseconds. 
     * 
     * Default is 150 milliseconds
     */
    max_time_limit = 150,
    depth: number = -1,
    closures: closure_group[] = null,
    len = 0,
    last_progress = 0,
    root_time = performance.now(),
): { tree_nodes: TransitionTreeNode[], clear: boolean, AMBIGUOUS: boolean; max_depth: number; } {

    if (!closures) {

        closures = root_items.map((i, index) => ({ final: 0, sym: null, index, closure: getClosure([i], grammar) }));

        const { AMBIGUOUS, clear, max_depth, tree_nodes } =
            getTransitionTree(grammar, root_items, lr_transition_items, max_tree_depth, max_no_progress, max_time_limit, 0, closures);

        return {
            AMBIGUOUS,
            clear,
            max_depth,
            tree_nodes: [
                {
                    item_ids: [],
                    unskippable: [],
                    depth: -1,
                    next: tree_nodes,
                    roots: root_items,
                    sym: null,
                    closure: [],
                    final_count: 0
                }
            ]
        };
    }

    if (performance.now() - root_time > max_time_limit)
        return { tree_nodes: [], clear: true, AMBIGUOUS: true, max_depth: depth };

    if (root_items.length == 1)
        return { tree_nodes: [], clear: true, AMBIGUOUS: false, max_depth: depth };

    if (depth > max_tree_depth)
        return { tree_nodes: [], clear: true, AMBIGUOUS: true, max_depth: depth };

    let
        GLOBAL_PROGRESS = false,
        CLEAR_REQUESTED = false,
        AMBIGUOUS = false,
        max_depth = depth;

    const
        occluders = new Map,
        groups = closures.flatMap(cg => getClosureGroups(grammar, cg, lr_transition_items)).group(
            (cg, cgs) => {
                for (const { sym } of cgs)
                    //if (doSymbolsOcclude(cg.sym, sym)) {
                    //    const char = cg.sym.val[0];
                    //    if (!occluders.has(char))
                    //        occluders.set(char, "!---occluders" + occluders.size);
                    //    return occluders.get(char);
                    //}

                    return getUniqueSymbolName(cg.sym);
            }
        ),
        tree_nodes: TransitionTreeNode[] = [];

    for (const group of groups) {

        let next = [];

        const
            unskippable = group.flatMap(g => g.unskippable),
            sym = group[0].sym,
            new_roots = group.map(cg => cg.index).setFilter().map(i => root_items[i]),
            progress = new_roots.length != len,
            quit = !progress && (depth - last_progress) >= Math.max(max_tree_depth - depth, max_no_progress),
            closure = group.filter(g => g.final == 0).flatMap(g => g.closure).filter(i => i.offset > 0).setFilter(i => i.id),
            starts = group.flatMap(g => g.starts ?? []).setFilter(i => i.id),
            curr_progress = progress ? depth : last_progress;

        if (progress) GLOBAL_PROGRESS = true;

        if (quit) CLEAR_REQUESTED = true;

        if (!quit && new_roots.length > 1) {

            const { tree_nodes, clear, AMBIGUOUS: A, max_depth: md } =
                getTransitionTree(grammar, root_items, lr_transition_items, max_tree_depth, max_no_progress, max_time_limit, depth + 1, group, new_roots.length, curr_progress, root_time);

            AMBIGUOUS = AMBIGUOUS || A;

            if (clear) CLEAR_REQUESTED = true; else {
                max_depth = Math.max(md, max_depth + 1);
                next = tree_nodes;
            }
        }

        tree_nodes.push({
            last_progress: depth - last_progress,
            progress,
            sym: getUniqueSymbolName(sym),
            item_ids: group.map(i => i.item_id),
            unskippable,
            depth,
            closure,
            roots: new_roots,
            starts,
            next: progress ? next : [],
            final_count: group.reduce((r, c) => c.final + r, 0)
        });
    }

    if (CLEAR_REQUESTED && !GLOBAL_PROGRESS)
        return { tree_nodes: [], clear: true, AMBIGUOUS: true, max_depth: max_depth };

    return { tree_nodes, clear: false, AMBIGUOUS, max_depth: max_depth };
}

function getClosureGroups(
    grammar: Grammar,
    { index, closure, final, starts }: closure_group,
    lr_transition_items: Item[]
): closure_group[] {

    if (final > 1)
        return [];

    const
        group = [],
        unskippable: TokenSymbol[] = <any>getUnskippableSymbolsFromClosure(closure, grammar);

    for (const item of closure) {
        const sym = item.sym?.(grammar);
        if (item.atEND) {
            const new_closure = getFollowClosure([item], lr_transition_items, grammar);

            if (new_closure.length == 0) {
                const production_id = closure[0].getProduction(grammar).id;
                const follow = FOLLOW(grammar, production_id);

                for (const sym of follow.values())
                    group.push({ sym, index, item_id: item.decrement().id, unskippable, closure: closure.slice(0, 1), final: final + 2 });

            } else {
                const new_group = getClosureGroups(
                    grammar,
                    { sym: null, item_id: item.id, unskippable, index, closure: new_closure, final: 0, starts },
                    lr_transition_items
                );
                group.push(...new_group);
            }
        } else if (!isSymAProduction(sym)) {
            const new_closure = [];//closure.slice().filter((item, i) => !item.atEND && isSymAProduction(sym));
            new_closure.push(...incrementWithClosure(grammar, item, null, true));
            group.push({ sym, index: index, item_id: item.id, unskippable, closure: new_closure.setFilter(i => i.id), final: final, starts: starts ? starts : [item] });
        }
    }
    return group;
}

function incrementWithClosure(grammar: Grammar, item: Item, prod: Production, AUTO_INCREMENT: boolean = false): Item[] {
    //if (grammar.item_map.get(item.id).LR || grammar.item_map.get(item.id).RR.length > 0)
    //    return [];
    if (AUTO_INCREMENT || item.getProductionAtSymbol(grammar).id == prod.id)
        return getClosure([item.increment()], grammar);
    return [item];
}

export function getUnskippableSymbolsFromClosure(closure: Item[], grammar: Grammar): any {
    return [...new Set(closure.flatMap(i => grammar.item_map.get(i.id).reset_sym)).values()].map(sym => grammar.meta.all_symbols.get(sym));
}