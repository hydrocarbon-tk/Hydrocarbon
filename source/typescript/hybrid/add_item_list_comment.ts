import { Grammar } from "../types/grammar.js";
import { Item } from "../util/common.js";
import { SC } from "./utilities/skribble.js";

export function addItemListComment(sc: SC, items: Item[], grammar: Grammar, label: string = "") {
    return;
    if (label)
        sc.addStatement(SC.Comment(label + ":\n" + items.map(i => i.renderUnformattedWithProduction(grammar)).join("\n")));

    else
        sc.addStatement(SC.Comment(items.map(i => i.renderUnformattedWithProduction(grammar)).join("\n")));
}
