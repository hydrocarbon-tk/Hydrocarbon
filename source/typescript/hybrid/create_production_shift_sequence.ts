import { Item } from "../util/common.js";
import { g_lexer_name } from "./utilities/utilities.js";
import { SC } from "./utilities/skribble.js";
import { RenderBodyOptions } from "./types/RenderBodyOptions";
import { createStandardRDSequence } from "./create_rd_sequence.js";
import { RecognizerState } from "./types/RecognizerState.js";

export function* create_production_shift_sequence(options: RenderBodyOptions): Generator<RecognizerState[], SC> {

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
            const shifted_items = group.map(i => i.increment());
            const sym = group[0].sym(grammar);
            const gen = createStandardRDSequence(
                //Filter out items that are left recursive for the given production
                shifted_items,
                options,
                g_lexer_name,
                1,
                true
            );

            let val = gen.next(), prods = [];

            while (!val.done) {
                const obj = <RecognizerState[]>val.value;
                yield obj;
                prods.push(...obj[0].prods);
                val = gen.next();
            }

            groups.push({
                code: val.value,
                hash: val.value.hash(),
                yielder: "lr-sequence",
                sym,
                items: group,
                leaf: false,
                offset: 0,
                peek_level: -1,
                prods: prods.setFilter()
            });
        }

        yield groups;

        return groups[0].code;
    }

    return SC.Empty();
}
