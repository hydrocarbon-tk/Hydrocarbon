import { Item } from "../util/common.js";
import { g_lexer_name } from "./utilities/utilities.js";
import { SC } from "./utilities/skribble.js";
import { RenderBodyOptions } from "./types/RenderBodyOptions";
import { yieldStates } from "./yield_states.js";
import { RecognizerState, TRANSITION_TYPE } from "./types/RecognizerState.js";

export function* yieldNontermStates(options: RenderBodyOptions): Generator<RecognizerState[], { code: SC, prods: number[]; }> {

    const { grammar, lr_productions } = options,
        nonterm_shift_items: Item[] = lr_productions;

    if (nonterm_shift_items.length > 0) {
        /**
         * Generate transition sequences for all productions shift items
         */
        const lr_items = nonterm_shift_items
            .setFilter(i => i.id)
            .group(i => i.sym(grammar).val),
            groups: RecognizerState[] = [];

        for (const group of lr_items) {
            const
                shifted_items = group.map(i => i.increment()),
                sym = group[0].sym(grammar),
                gen = yieldStates(shifted_items, options, g_lexer_name, 1);

            let val = gen.next(), prods = [];

            while (!val.done) {
                const obj = <RecognizerState[]>val.value;
                yield obj;
                prods.push(...obj[0].prods);
                val = gen.next();

            }

            groups.push(<RecognizerState>{
                code: val.value.code,
                hash: val.value.code.hash(),
                transition_type: TRANSITION_TYPE.ASSERT,
                symbol: sym,
                items: group,
                completing: false,
                offset: 0,
                peek_level: -1,
                prods: val.value.prods//prods.setFilter()
            });
        }

        yield groups;

        return { code: groups[0].code, prods: [] };
    }

    return SC.Empty();
}
