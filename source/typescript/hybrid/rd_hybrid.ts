import { Grammar, Production, ProductionBody, EOF_SYM, SymbolType, Symbol } from "../types/grammar.js";
import { processClosure, Item, FOLLOW } from "../util/common.js";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment";
import { stmt } from "@candlefw/js";
import { translateSymbolValue, getLexPeekComparisonStringCached, getReduceFunctionSymbolIndiceSet, has_INLINE_FUNCTIONS, getRootSym } from "./utilities/utilities.js";
import { RDProductionFunction } from "./types/RDProductionFunction";
import { RDItem } from "./types/RDItem";
import { getTerminalSymsFromClosure } from "./utilities/get_terminal_syms_from_closure.js";
import { insertFunctions } from "./utilities/insert_body_functions.js";
import { CompilerRunner } from "./types/CompilerRunner.js";

let TEMP_FLAG = false;

function checkForLeftRecursion(p: Production, start_items: RDItem[], grammar: Grammar) {

    const closure_items = start_items.map(g => g.item);

    processClosure(closure_items, grammar);

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

function ItemToRDItem(i: Item, grammar: Grammar, body_offset = 0): RDItem {
    const c = [i];
    processClosure(c, grammar);
    return <RDItem>{ body_index: i.body, body_offset, off: i.offset, len: i.len, item: i, closure: c };
}

function BodyToRDItem(b: ProductionBody, grammar: Grammar): RDItem {
    return ItemToRDItem(new Item(b.id, b.length, 0, EOF_SYM), grammar);
}

function renderItemSym(
    item: Item,
    grammar: Grammar,
    runner: CompilerRunner,
    AUTO_RETURN = true,
    productions: Set<number> = new Set
): string {

    const
        stmts = [],
        body = item.body_(grammar);

    stmts.push(insertFunctions(item, grammar, true));

    if (item.atEND) {

        if (!(item.len == 1 && !body.reduce_function))
            stmts.push(`add_reduce(${item.len},${item.body});`);

        if (AUTO_RETURN) stmts.push(`return;`);
    } else {
        const sym = getRootSym(item.sym(grammar), grammar);

        if (sym.type == "production") {

            productions.add(<number>sym.val);

            if (runner.ANNOTATED)
                stmts.push(runner.createAnnotationJSNode("RD-CALL", grammar, item));

            if (AUTO_RETURN) stmts.push(`if(FAILED) return;`);

            stmts.push(`$${grammar[sym.val].name}(l)`);

        } else {
            if (runner.ANNOTATED)
                stmts.push(runner.createAnnotationJSNode("RD-ASSERT", grammar, item));

            //Get skips from grammar - TODO get symbols from bodies / productions
            const skip_symbols = `[${grammar.meta.ignore.flatMap(d => d.symbols).map(s => getRootSym(s, grammar)).map(s => translateSymbolValue(s, grammar)).join(",")}]`;

            stmts.push(`_(l, /* e.eh, */ ${skip_symbols}, ${translateSymbolValue(sym, grammar)});`);
        }
    }

    return stmts.join("\n");
}

function renderItem(item: Item, grammar: Grammar, runner: CompilerRunner, AUTO_RETURN: boolean = true, productions: Set<number> = new Set): string {
    const stmts = [];

    while (true) {
        stmts.push(renderItemSym(item, grammar, runner, AUTO_RETURN, productions));
        if (item.atEND) break;
        item = item.increment();
    }

    stmts.splice(stmts.length - 1, 0, `prod = (FAILED) ? -1 : ${item.getProduction(grammar).id}`);
    //stmts.splice(stmts.length - 1, 0, `prod =  (-1&(~(FAILED-1))) | (${item.getProduction(grammar).id}&(~(!FAILED-1)))`);

    return stmts.join("\n");
}


type TransitionGroup = {
    id: string;
    syms: Set<string>;
    trs: RDItem[];
};
export function renderFunctionBody(
    llitems: RDItem[],
    grammar: Grammar,
    runner: CompilerRunner,
    peek_depth: number = 0,
    ELSE_REDUCE = false,
    AUTO_RETURN: boolean = true,
    productions: Set<number> = new Set
)
    : string {



    const stmts = [];

    if (peek_depth > 4) {
        if (TEMP_FLAG) console.log("AAAAAAAAAAAAAAAAAA00000000000000000000000000AaA");
        throw "Can't complete";
    }

    if (TEMP_FLAG) {
        console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaA", llitems.map(RDItemToItem).setFilter(i => i.id).map(i => i.renderUnformattedWithProduction(grammar)));
        console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaA", llitems.flatMap(i => i.closure).setFilter(i => i.id).map(i => i.renderUnformattedWithProduction(grammar)));
    }

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
    const transition_groups: Map<string, RDItem[]> = llitems.groupMap((i: RDItem) => {

        const syms = [];

        if (TEMP_FLAG)
            console.log(getTerminalSymsFromClosure(i.closure, grammar).map(s => s.val));

        for (const sym of getTerminalSymsFromClosure(i.closure, grammar)) {

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

        const id = trs.map(i => RDItemToItem(i).id).setFilter(i => i).sort().join("");

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

    if (TEMP_FLAG)
        console.dir({ group_maps }, { depth: 3 });



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

            if (group.trs.map(RDItemToItem).map(i => i.id).some(i => m.indexOf(i) >= 0)) {

                const new_group = try_group.concat(group);

                try_groups.delete(id);

                try_groups.set(try_id + id, new_group);

                continue outer;
            }
        }

        try_groups.set(id, [group]);
    }

    let token_bit = 0;

    //Now create the necessary if statements with peek if depth > 0
    for (const try_group of try_groups.values()) {

        if (try_group.length > 1) {

            const new_group = try_group[0];

            new_group.trs = try_group.flatMap(i => i.trs);

            token_bit |= buildGroupStatement(grammar, runner, new_group, peek_depth, stmts, sym_map, false, AUTO_RETURN, productions);

            //Make a try catch chain.
        } else {
            token_bit |= buildGroupStatement(grammar, runner, try_group[0], peek_depth, stmts, sym_map, false, AUTO_RETURN, productions);
        }
    }

    const MULTIPLE_GROUPS = token_bit & TOKEN_BIT.IS_MULTIPLE;

    if (MULTIPLE_GROUPS) {
        //Item annotations if required
        if (runner.ANNOTATED)
            stmts.unshift(runner.createAnnotationJSNode("RD-PEEK:" + (peek_depth + 1), grammar, ...llitems.map(RDItemToItem)));

        if (token_bit) {
            const const_node = ["const"];
            const const_body = [];

            let lx = "l";

            if (peek_depth > 0) {
                lx = "pk";
                const_body.push("pk:Lexer = l" + (".pk".repeat(peek_depth)));
            }
            if (token_bit & TOKEN_BIT.ID)
                const_body.push(`id:u32 = ${lx}.id`);

            if (token_bit & TOKEN_BIT.TYPE)
                const_body.push(`ty:u32 = ${lx}.ty`);

            const_node.push(const_body.join(","), ";");

            stmts.unshift(const_node.join(" "));
        }
    }

    return stmts.join("\n");
}

const enum TOKEN_BIT {
    ID = 1,
    TYPE = 2,

    IS_MULTIPLE = 4
}

export function buildGroupStatement(
    grammar: Grammar,
    runner: CompilerRunner,
    group: TransitionGroup,
    peek_depth,
    stmts,
    sym_map: Map<string, Symbol>,
    IS_SINGLE = false,
    AUTO_RETURN: boolean = true,
    productions: Set<number> = new Set
) {

    IS_SINGLE = true;

    const
        body = [],
        trs = group.trs,
        syms = [...group.syms.values()];

    let
        token_bit = [...syms.map(s => sym_map.get(s))].reduce((r, v) => {
            let bit = 0;

            switch (v.type) {
                case SymbolType.GENERATED: bit = TOKEN_BIT.TYPE; break;
                case SymbolType.LITERAL:
                case SymbolType.SYMBOL:
                case SymbolType.ESCAPED:
                    bit = TOKEN_BIT.ID;
            }

            return r |= bit;
        }, 0),
        tests = [...syms.map(s => sym_map.get(s)).map(i => getLexPeekComparisonStringCached(i, grammar))];

    if (trs.length > 1) {


        token_bit |= TOKEN_BIT.IS_MULTIPLE;
        IS_SINGLE = false;

        //Advance through each symbol until there is a difference
        //When there is a difference create a peeking switch
        let items: Item[] = trs.filter(_ => !!_).map(RDItemToItem).filter(_ => !!_), peek = peek_depth;

        while (true) {
            const sym = items.map(i => i).filter(i => !i.atEND)?.shift()?.sym(grammar),
                off = items.filter(i => !i.atEND)?.[0]?.offset;
            //If any items at end do something
            //
            if (off != undefined && sym && !items.reduce((r, i) => (r || i.atEND || (i.sym(grammar)?.val != sym.val)), false)) {
                //All items transition on the same symbol; resolve body disputes. 
                body.push(renderItemSym(items[0], grammar, runner, AUTO_RETURN, productions));
                items = items.map(i => i.increment()).filter(i => i);
                peek = -1;

            } else {

                const
                    new_items = items
                        .filter(i => !i.atEND),
                    new_trs = new_items
                        .map(i => ItemToRDItem(i, grammar)).map(i => {
                            const closure = [i.item];
                            i.closure = closure;
                            processClosure(closure, grammar);
                            //Remove the root item
                            i.closure = closure.map((i, a) => a > 0 ? i.increment() : i).filter(i => i);
                            return i;
                        });

                if (new_trs.length > 0)
                    body.push(renderFunctionBody(new_trs, grammar, runner, peek + 1, items.some(i => i.atEND), AUTO_RETURN, productions));

                //If any items at end render here? 
                for (const d of items.filter(i => i.atEND))
                    body.push(renderItem(d, grammar, runner, AUTO_RETURN, productions));

                break;
            };
        }
    } else {
        token_bit |= TOKEN_BIT.IS_MULTIPLE;
        IS_SINGLE = false;
        //Just complete the grammar symbols
        const item = RDItemToItem(trs[0]);
        body.push(renderItem(item, grammar, runner, AUTO_RETURN, productions));
    }

    if (!IS_SINGLE) {
        stmts.push(`if(${tests.join("||")}){`, ...body, "}");
    } else {
        stmts.push(...body);
    }
    return token_bit;
}

export function buildIntermediateRD(items: Item[], grammar: Grammar, runner: CompilerRunner, ll_fns: RDProductionFunction[]): string {

    const start_items: RDItem[] = items.map(i => ItemToRDItem(i, grammar));

    let productions: Set<number> = new Set();

    const val = renderFunctionBody(start_items, grammar, runner, 0, false, false, productions);

    for (const production of productions.values()) {
        const ll = ll_fns[production];

        if (ll) {
            if (!ll.IS_RD) ll.state.REACHABLE = true;
            else ll.RENDER = true;
        }
    }

    return val;
}

export function makeRDHybridFunction(production: Production, grammar: Grammar, runner: CompilerRunner): RDProductionFunction {

    const p = production;

    if (p.name == "AT_RULE")
        TEMP_FLAG = true;
    else
        TEMP_FLAG = false;

    let productions: Set<number> = new Set();

    const stmts = [`function $${p.name}(l:Lexer) :void{`],

        INLINE_FUNCTIONS = p.bodies.some(has_INLINE_FUNCTIONS),

        start_items: RDItem[] = p.bodies.map(b => BodyToRDItem(b, grammar));

    if (p.IMPORTED && (false && runner.INTEGRATE)) {
        const foreign_grammar = p.name.split("$");
        //IF name i
        return {
            refs: 0,
            id: p.id,
            IS_RD: false,
            fn: stmt(`function $${p.name}(l,e){
            return ${foreign_grammar.join(".$")}(l,e)
        }`)
        };
    }

    if (INLINE_FUNCTIONS)
        stmts.push("const s = []");

    if (checkForLeftRecursion(p, start_items, grammar)) {
        return {
            refs: 0,
            id: p.id,
            IS_RD: false,
            fn: `/* Could Not Parse in Recursive Descent Mode */`
        };
    }


    try {
        stmts.push(renderFunctionBody(start_items, grammar, runner, 0, false, true, productions));
    } catch (e) {
        console.dir(e);
        return {
            refs: 0,
            id: p.id,
            IS_RD: false,
            fn: `/* Could Not Parse in Recursive Descent Mode */`
        };
    }

    stmts.push(`FAILED = true`);

    stmts.push(`}`);

    return {

        productions,
        refs: 0,
        id: p.id,
        IS_RD: true,
        fn: stmts.join("\n")
    };
}

export function GetLLHybridFunctions(grammar: Grammar, env: GrammarParserEnvironment, runner: CompilerRunner): RDProductionFunction[] {

}
