
import { rec_glob_lex_name, isSymAProduction } from "../../util/utilities.js";
import { SC } from "../../util/skribble.js";
import { RenderBodyOptions } from "../../types/render_body_options";
import { yieldStates } from "./yield_states.js";
import { RecognizerState, TRANSITION_TYPE } from "../../types/recognizer_state.js";
import { Item } from "../../util/item.js";

export function* yieldNontermStates(options: RenderBodyOptions): Generator<RecognizerState[], { code: SC, prods: number[]; hash: string; }> {

    const { grammar, production_shift_items, production, extended_production_shift_items } = options;
    let nonterm_shift_items: Item[] = production_shift_items;
    const LEFT_RECURSION = nonterm_shift_items.some(i => i.getProduction(grammar).id == production.id && i.getProductionAtSymbol(grammar).id == production.id);

    // If left recursive, gather ALL items that transition on the production to ensure the 
    // processor is aware of shift/reduce ambiguities. Completed items that are added
    // from the LR check should not be used for actual parsing, and instead their code paths 
    // should be discarded. 

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
            lr_items = nonterm_shift_items
                .setFilter(i => i.id)
                .group(i => i.sym(grammar).val),
            groups: RecognizerState[] = [];

        for (const group of lr_items) {

            const
                shifted_items = group.map(i => i.increment()),
                sym = group[0].sym(grammar),
                gen = yieldStates(shifted_items, options, rec_glob_lex_name, 1);

            let val = gen.next(), prods = [];


            while (!val.done) {
                const obj = <RecognizerState[]>val.value;

                yield obj;
                if (obj.length > 0)
                    prods.push(...obj[0].prods);

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
                prods: val.value.prods
            });
        }

        yield groups;

        return { code: groups[0].code, prods: [], hash: groups[0].hash };
    }

    else return { code: new SC, prods: [], hash: "" };
}
