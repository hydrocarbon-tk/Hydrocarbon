import { GrammarProduction } from '@hc/common/source/types/grammar_nodes';
import { Item } from "@hc/common/source/utilities/item";




export interface TransitionGraphOptions {

    /**
     * The maximum peek depth allowed before a branch
     * is deemed ambiguous
     */
    max_tree_depth: number;

    /**
     * Max amount of time the search process may take,
     * measured in milliseconds.
     *
     * Default is 150 milliseconds
     */
    time_limit: number;
    /**
     * The id of the root production
     */
    root_production: GrammarProduction;

    IS_SCANNER: boolean;

    resolved_items: Item[];

    goto_items: Item[];

    mode: "GOTO" | "DESCENT";

    ambig_ids: Set<string>;
}
