
import { Leaf, RecognizerState, TRANSITION_TYPE } from "../../types/recognizer_state.js";
import { RenderBodyOptions } from "../../types/render_body_options";

import { Item } from "../../utilities/item.js";
import { SC } from "../../utilities/skribble.js";
import { isSymAProduction } from "../../utilities/symbol.js";
import { rec_glob_lex_name } from "../../utilities/global_names.js";
import { yieldStates } from "./yield_states.js";

export function* yieldGotoStates(options: RenderBodyOptions): Generator<RecognizerState[], { code: SC, prods: number[]; leaves: Leaf[], hash: string; }> {

    const { grammar, goto_items: production_shift_items, production, extended_goto_items: extended_production_shift_items } = options;
    let nonterm_shift_items: Item[] = production_shift_items;
    const LEFT_RECURSION = nonterm_shift_items.some(i => i.getProduction(grammar).id == production.id && i.getProductionAtSymbol(grammar).id == production.id);

    /** 
     * If left recursive, gather ALL items that transition on the production to ensure the 
     * processor is aware of shift/reduce ambiguities. Completed items that are added
     * from the GOTO check should not be used for actual parsing, and instead their code paths 
     * should be discarded.
     */

    if (LEFT_RECURSION) {
        //gather all items that transition on the production
        const prod_id = production.id;

        for (const { item } of grammar.item_map.values()) {
            if (
                !item.atEND
                && isSymAProduction(item.sym(grammar))
                && item.getProductionAtSymbol(grammar).id == prod_id
                && item.getProduction(grammar).id != prod_id
                && !nonterm_shift_items.some(i => i.id == item.id)
            )
                extended_production_shift_items.push(item);
        }

        nonterm_shift_items = nonterm_shift_items.concat(extended_production_shift_items).setFilter(i => i.id);
    }

    if (nonterm_shift_items.length > 0) {

        /**
         * Generate transition sequences for all productions shift items
         */
        const
            goto_items = nonterm_shift_items
                .setFilter(i => i.id)
                .group(i => i.sym(grammar).val),
            groups: RecognizerState[] = [];

        for (const group of goto_items) {

            const
                keys = group.map(i => i.getProductionAtSymbol(grammar).id),
                shifted_items = group.map(i => i.increment()),
                sym = group[0].sym(grammar);

            options.active_keys = keys;

            const gen = yieldStates(shifted_items, options, rec_glob_lex_name, 1);

            let val = gen.next();


            while (!val.done) {
                const obj = <RecognizerState[]>val.value;

                yield obj;

                val = gen.next();
            }

            groups.push(<RecognizerState>{
                code: val.value.code,
                hash: val.value.hash,
                transition_type: TRANSITION_TYPE.ASSERT,
                symbol: sym,
                items: group,
                completing: false,
                offset: 0,
                peek_level: -1,
                prods: val.value.prods,
                leaves: val.value.leaves
            });
        }

        yield groups;

        return { code: groups[0].code, prods: groups[0].prods, leaves: groups[0].leaves, hash: groups[0].hash };
    } else {
        options.NO_GOTOS = true;
        return { code: new SC, prods: [], leaves: [], hash: "" };
    }
}
