import { EOF_SYM, SymbolType, Grammar } from "../types/grammar.js";
import { AssertionFunctionSymbol, TokenSymbol } from "../types/Symbol";
import { Item } from "../util/common.js";
import {
    getRootSym,
    isSymAnAssertFunction,
    isSymAProduction,
    getAssertionSymbolFirst,
    isSymSpecified,
    isSymGeneratedId
} from "./utilities/utilities.js";
import { SC, VarSC } from "./utilities/skribble.js";
import { RenderBodyOptions } from "./types/RenderBodyOptions";
import { createStandardRDSequence } from "./create_rd_sequence.js";
import { RecognizerState } from "./types/RecognizerState.js";
import { addEndItemSequence } from "./add_end_item_sequence.js";

export function getGroups(symboled_items: Map<TokenSymbol, Item[]>, grammar: Grammar) {
    const group_maps: Map<string, { syms: Set<TokenSymbol>; items: Item[]; priority: number; }> = new Map;
    for (const [sym, items] of symboled_items) {

        const group_items = items.setFilter(i => i.id);

        const id = group_items.map(i => {
            const PROD_ID = i.getProduction(grammar).id;
            const BODY = i.body;
            const HAS_REDUCE_FUNCTION = !!i.body_(grammar).reduce_function;
            const str = [PROD_ID];
            if (HAS_REDUCE_FUNCTION)
                str.push("b" + BODY);
            return str.join("_") + "_";
        }).sort().join("");
        if (!group_maps.has(id))
            group_maps.set(id, { syms: new Set, items: group_items, priority: 0 });
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

export function* createClosureSequence(
    items: Item[],
    options: RenderBodyOptions,
    lex_name: VarSC,
    offset: number
): Generator<RecognizerState[], SC> {

    const { grammar } = options,

        true_items = items.filter(_ => _),

        active_items = true_items.filter(i => !i.atEND),

        symboled_items = active_items
            .filter(i => i.sym(grammar).type != SymbolType.PRODUCTION),

        symboled_items_map: Map<TokenSymbol, Item[]> = symboled_items
            .groupMap(i => <TokenSymbol>getRootSym(i.sym(grammar), grammar)),

        group_maps: Map<string, { syms: Set<TokenSymbol>; items: Item[]; priority: number; }> = getGroups(symboled_items_map, grammar);

    const group: RecognizerState[] = [];
    /*
    if (end_items.length > 0) {
        const gen = addEndItemSequence(end_items, options, offset);
        let val = gen.next(), prods = null, last = null;
        while (!val.done) {
            yield <RecognizerState[]>val.value;
            val = gen.next();
        }
        group.push(...val.value);
    }
    */

    for (let { syms: s, items } of group_maps.values()) {

        const syms = [...s.values()];

        let code = new SC, prods = null;

        if (items.length > 1) {
            const gen = createStandardRDSequence(items.map(i => i.increment()), options, lex_name, offset + 1, false);
            let val = gen.next();
            while (!val.done) {
                const obj = <RecognizerState[]>val.value;
                yield obj;
                prods = obj[0].prods;
                val = gen.next();
            }
            code = val.value;
        } else {
            const obj: RecognizerState = {
                code: new SC,
                hash: "not-defined-closure",
                items,
                yielder: "closure-single-2",
                leaf: true,
                peek_level: -1,
                offset: offset + 1,
                sym: EOF_SYM

            };
            yield [obj];
            prods = obj.prods;
            code = obj.code;
            obj.hash = obj.code.hash();
        }

        for (const sym of syms) {
            group.push({
                code: code,
                hash: code.hash(),
                items,
                peek_level: -1,
                yielder: "closure-2",
                offset,
                leaf: false,
                sym: sym,
                prods
            });
        }
    }

    if (group.length > 0) {
        yield group;
        return group[0].code;
    }
    return new SC;
}
