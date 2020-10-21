import { Grammar, Production, ProductionBody, EOF_SYM, SymbolType, Symbol } from "../types/grammar.js";
import { processClosure, Item, FOLLOW } from "../util/common.js";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment";
import { stmt, JSNode, JSNodeType, exp, extendAll } from "@candlefw/js";
import { createReduceFunction, translateSymbolValue, getLexPeekComparisonStringCached, getReduceFunctionSymbolIndiceSet, has_INLINE_FUNCTIONS } from "./utilities.js";
import { LLProductionFunction } from "./LLProductionFunction";
import { LLItem } from "./LLItem";
import { getClosureTerminalSymbols } from "./getClosureTerminalSymbols.js";
import { insertFunctions } from "./insertFunctions.js";
import { CompilerRunner } from "./CompilerRunner.js";

function checkForLeftRecursion(p: Production, start_items: LLItem[], grammar: Grammar) {

    const closure_items = start_items.map(g => g.item);

    processClosure(closure_items, grammar);

    for (const c of closure_items.map(i => i.sym(grammar))) {
        if (c.type == "production")
            if (grammar[c.val] == p)
                return true;
    }

    return false;
}

function LLItemToItem(v: LLItem): Item {
    return new Item(v.body_index, v.len, v.off, EOF_SYM);
}

function ItemToLLItem(i: Item, grammar: Grammar): LLItem {
    const c = [i];
    processClosure(c, grammar);
    return <LLItem>{ body_index: i.body, off: i.offset, len: i.len, item: i, closure: c };
}

function BodyToLLItem(b: ProductionBody, grammar: Grammar): LLItem {
    return ItemToLLItem(new Item(b.id, b.length, 0, EOF_SYM), grammar);
}

function renderItemSym(
    item: Item,
    grammar: Grammar,
    runner: CompilerRunner,
    index_offset: number = 0,
    rdi: Set<number> = new Set,
    HAS_INLINE_FUNCTIONS: boolean = false
): JSNode[] {

    const
        stmts = [], sym = "$", cn = (HAS_INLINE_FUNCTIONS) ? `s[${index_offset}]` : `${sym}${index_offset + 1}_`,
        body = item.body_(grammar),
        reduce_function = body?.reduce_function?.txt;

    stmts.push(...insertFunctions(item, grammar, true));

    if (item.atEND) {

        if (reduce_function) {
            if (HAS_INLINE_FUNCTIONS)
                stmts.push(stmt(`return (${createReduceFunction(reduce_function, "s[", 0, "]")});`));
            else
                stmts.push(stmt(`return (${createReduceFunction(reduce_function, sym, 1, "_")});`));
        } else {

            stmts.push(stmt(`return ${cn}`));
        }
    } else {
        const
            sym = item.sym(grammar),
            REDUCE_TO_LAST = (item.increment().atEND && !reduce_function);

        if (sym.type == "production") {

            if (runner.ANNOTATED)
                stmts.push(runner.createAnnotationJSNode("LL-CALL", grammar, item));

            stmts.push(stmt(`if(e.FAILED) return;`));

            if (HAS_INLINE_FUNCTIONS)
                stmts.push(stmt(`s.push($${grammar[sym.val].name}(l, e));`));
            else if (rdi.has(index_offset) || REDUCE_TO_LAST)
                stmts.push(stmt(`const ${cn} = $${grammar[sym.val].name}(l, e)`));
            else
                stmts.push(stmt(`$${grammar[sym.val].name}(l, e)`));
        } else {
            if (runner.ANNOTATED)
                stmts.push(runner.createAnnotationJSNode("LL-ASSERT", grammar, item));

            //Get skips from grammar - TODO get symbols from bodies / productions
            const skip_symbols = exp(`[${grammar.meta.ignore.flatMap(d => d.symbols).map(translateSymbolValue).join(",")}]`);
            let call;


            if (HAS_INLINE_FUNCTIONS) {
                call = stmt(`s.push(_(l, e, e.eh, null, ${translateSymbolValue(sym)}));`);
                call.nodes[0].nodes[1].nodes[0].nodes[1].nodes[3] = runner.add_constant(skip_symbols);
            } else if (rdi.has(index_offset) || REDUCE_TO_LAST) {
                call = stmt(`const ${cn} = _(l, e, e.eh, null, ${translateSymbolValue(sym)});`);
                call.nodes[0].nodes[1].nodes[1].nodes[3] = runner.add_constant(skip_symbols);
            } else {
                call = stmt(`_(l, e, e.eh, null, ${translateSymbolValue(sym)});`);
                call.nodes[0].nodes[1].nodes[3] = runner.add_constant(skip_symbols);
            }

            stmts.push(call);
        }
    }

    return stmts;
}

function renderItem(item: Item, grammar: Grammar, runner: CompilerRunner, index_offset = 0, rdi: Set<number> = new Set, HAS_INLINE_FUNCTIONS: boolean = false): JSNode[] {
    const stmts = [];
    while (true) {
        stmts.push(...renderItemSym(item, grammar, runner, index_offset, rdi, HAS_INLINE_FUNCTIONS));
        if (item.atEND) break;
        item = item.increment();
        if (!item.atEND) index_offset++;
    }
    return stmts;
}


type TransitionGroup = {
    id: string;
    syms: Set<string>;
    trs: LLItem[];
};
function renderFunctionBody(llitems: LLItem[], grammar: Grammar, runner: CompilerRunner, peek_depth: number = 0, INLINE_FUNCTIONS = false) {

    const stmts = [];

    if (peek_depth > 4) throw "Can't complete";


    const items = llitems.map(LLItemToItem);




    /* 
        Each item has a closure which yields transition symbols. 
        We are only interested in terminal transition symbols. 

        If a set of items have the same transition symbols then 
        they are likely the same and can be treated in one pass. 

        If the transition symbols differ, then the production will 
        need to be disambiguated until we find either matching
        transition symbols or 
    */

    const sym_map = new Map();

    // sort into transition groups - groups gathered based on a single transition symbol
    const transition_groups: Map<string, LLItem[]> = llitems.groupMap((i: LLItem) => {
        const syms = [];

        for (const sym of getClosureTerminalSymbols(i.closure, grammar)) {
            syms.push(sym.val);
            sym_map.set(sym.val, sym);
        }

        if (syms.length == 0 && i.item.atEND) {
            for (const sym of FOLLOW(grammar, i.item.getProduction(grammar).id).values()) {
                syms.push(sym.val);
                sym_map.set(sym.val, sym);
            }
        }

        return syms;
    });

    // find transition combinations: groups that have the same bodies. 
    const group_maps: Map<string, TransitionGroup> = new Map();

    for (const [key, trs] of transition_groups.entries()) {

        const id = trs.map(i => LLItemToItem(i).id).setFilter(i => i).sort().join("");

        if (!group_maps.has(id)) {

            group_maps.set(id, {
                id,
                syms: new Set(),
                trs
            });
        }

        group_maps.get(id).syms.add(key);
    }

    const try_groups: Map<string, TransitionGroup[]> = new Map();



    // Determine if these groups are unique - This means 
    // Their ids do not contain ids of other groups. 
    // If they do, they need to be wrapped into try groups
    outer: for (const [id, group] of [...group_maps.entries()].sort((a, b) => {
        const
            syms_val_a = [...a[1].syms.values()].map(s => sym_map.get(s).val).reduce((r, d) => r + (typeof d == "string" ? 1 : d << 1), 0),
            syms_val_b = [...b[1].syms.values()].map(s => sym_map.get(s).val).reduce((r, d) => r + (typeof d == "string" ? 1 : d << 1), 0);

        return syms_val_a < syms_val_b ? -1 : syms_val_a > syms_val_b ? 1 : 0;
    })) {

        for (const [try_id, try_group] of try_groups.entries()) {

            const m = try_id.split("|").map(e => e + "|");

            if (group.trs.map(LLItemToItem).map(i => i.id).some(i => m.indexOf(i) >= 0)) {

                const new_group = try_group.concat(group);

                try_groups.delete(id);

                try_groups.set(try_id + id, new_group);

                continue outer;
            }
        }

        try_groups.set(id, [group]);
    }
    const MULTIPLE_GROUPS = try_groups.size > 1;
    let token_bit = 0;


    //Now create the necessary if statements with peek if depth > 0
    for (const try_group of try_groups.values()) {

        if (try_group.length > 1) {

            const new_group = try_group[0];

            new_group.trs = try_group.flatMap(i => i.trs);

            // for (const group of try_group) {
            token_bit |= buildGroupStatement(grammar, runner, new_group, peek_depth, stmts, sym_map, !MULTIPLE_GROUPS, INLINE_FUNCTIONS);
            // }

            //Make a try catch chain.
        } else {
            token_bit |= buildGroupStatement(grammar, runner, try_group[0], peek_depth, stmts, sym_map, !MULTIPLE_GROUPS, INLINE_FUNCTIONS);
        }
    }

    if (MULTIPLE_GROUPS) {
        //Item annotations if required
        if (runner.ANNOTATED)
            stmts.unshift(runner.createAnnotationJSNode("LL-PEEK:" + (peek_depth + 1), grammar, ...llitems.map(LLItemToItem)));

        if (token_bit) {
            const const_node = stmt("const d;");
            const nodes = const_node.nodes;

            nodes.pop();

            let lx = "l";

            if (peek_depth > 0) {
                lx = "pk";
                nodes.push(exp("pk = l" + (".pk".repeat(peek_depth))));
            }
            if (token_bit & TOKEN_BIT.TEXT)
                nodes.push(exp(`tx = ${lx}.tx`));

            if (token_bit & TOKEN_BIT.TYPE)
                nodes.push(exp(`ty = ${lx}.ty`));

            stmts.unshift(const_node);
        }
    }


    return stmts;
}

const enum TOKEN_BIT {
    TEXT = 1,
    TYPE = 2,
}

function buildGroupStatement(
    grammar: Grammar,
    runner: CompilerRunner,
    group: TransitionGroup,
    peek_depth,
    stmts,
    sym_map: Map<string, Symbol>,
    IS_SINGLE = false,
    INLINE_FUNCTIONS = false
) {

    const
        trs = group.trs,
        syms = [...group.syms.values()],
        token_bit = [...syms.map(s => sym_map.get(s))].reduce((r, v) => {
            let bit = 0;

            switch (v.type) {
                case SymbolType.GENERATED: bit = TOKEN_BIT.TYPE; break;
                case SymbolType.LITERAL:
                case SymbolType.SYMBOL:
                case SymbolType.ESCAPED:
                    bit = TOKEN_BIT.TEXT;
            }

            return r |= bit;
        }, 0),
        tests = [...syms.map(s => sym_map.get(s)).map(i => getLexPeekComparisonStringCached(i))];

    let if_stmt = stmt(`if(${tests.join("||")}){}`);

    if (!IS_SINGLE) stmts.push(if_stmt);

    const if_body = (IS_SINGLE) ? stmts : if_stmt.nodes[1].nodes;

    /** Reduce function indices */
    const rdi: Set<number> = new Set(trs.map(LLItemToItem).setFilter(i => i.id).flatMap(i => [...getReduceFunctionSymbolIndiceSet(i, grammar).values()]));

    if (trs.length > 1) {


        //Advance through each symbol until there is a difference
        //When there is a difference create a peeking switch
        let items: Item[] = trs.filter(_ => !!_).map(LLItemToItem).filter(_ => !!_), peek = peek_depth;



        while (true) {
            const sym = items.map(i => i).filter(i => !i.atEND)?.shift()?.sym(grammar),
                off = items.filter(i => !i.atEND)[0].offset;
            //If any items at end do something

            //All items agree
            if (sym && !items.reduce((r, i) => (r || i.atEND || (i.sym(grammar)?.val != sym.val)), false)) {
                if_body.push(...renderItemSym(items[0], grammar, runner, off, rdi, INLINE_FUNCTIONS));
                items = items.map(i => i.increment()).filter(i => i);
                peek = -1;

            } else {

                const
                    new_items = items
                        .filter(i => !i.atEND),
                    new_trs = new_items
                        .map(i => ItemToLLItem(i, grammar)).map(i => {
                            const closure = [i.item];
                            i.closure = closure;
                            processClosure(closure, grammar);
                            return i;
                        });

                if (new_trs.length > 0)
                    if_body.push(...renderFunctionBody(new_trs, grammar, runner, peek + 1, INLINE_FUNCTIONS));

                //If any items at end render here?
                for (const d of items.filter(i => i.atEND))
                    if_body.push(...renderItem(d, grammar, runner, off, rdi, INLINE_FUNCTIONS));

                break;
            };
        }
    } else {

        //Just complete the grammar symbols
        const item = LLItemToItem(trs[0]);
        if_body.push(...renderItem(item, grammar, runner, item.offset, rdi, INLINE_FUNCTIONS));
    }

    return token_bit;
}

export function GetLLHybridFunctions(grammar: Grammar, env: GrammarParserEnvironment, runner: CompilerRunner): LLProductionFunction[] {

    return grammar.map(p => {

        const fn = stmt(`function $${p.name}(l, e){;}`),
            body = fn.nodes[2].nodes,
            INLINE_FUNCTIONS = p.bodies.some(has_INLINE_FUNCTIONS),
            start_items: LLItem[] = p.bodies.map(b => BodyToLLItem(b, grammar));

        if (p.IMPORTED && (false && runner.INTEGRATE)) {
            const foreign_grammar = p.name.split("$");
            //IF name i
            return {
                refs: 0,
                id: p.id,
                L_RECURSION: false,
                fn: stmt(`function $${p.name}(l,e){
                    return ${foreign_grammar.join(".$")}(l,e)
                }`)
            };
        }

        body.pop();

        if (INLINE_FUNCTIONS)
            body.push(stmt("const s = []"));

        if (checkForLeftRecursion(p, start_items, grammar)) {
            return {
                refs: 0,
                id: p.id,
                L_RECURSION: true,
                fn: stmt(`\n\'Left recursion found in ${p.name}'\n`)
            };
        }

        try {
            body.push(...renderFunctionBody(start_items, grammar, runner, 0, INLINE_FUNCTIONS));
        } catch (e) {
            return {
                refs: 0,
                id: p.id,
                L_RECURSION: true,
                fn: stmt(`\n\'Left recursion found in ${p.name}'\n`)
            };
        }

        if (body.slice(-1)[0].type != JSNodeType.ReturnStatement) {
            body.push(stmt(`e.FAILED = true`));
        }

        return {
            refs: 0,
            id: p.id,
            L_RECURSION: false,
            fn
        };
    });
}
