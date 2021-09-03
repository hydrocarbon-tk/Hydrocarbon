/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { default_EOF } from "../grammar/nodes/default_symbols.js";
import { convert_symbol_to_string, getRootSym, Sym_Is_A_Production } from "../grammar/nodes/symbol.js";
import { GrammarObject, GrammarProduction, HCG3ProductionBody, HCG3Symbol } from "../types/grammar_nodes.js";

export const enum ItemIndex {
    body_id = 0,
    length = 1,
    offset = 2
}
export class ItemGraphNode {
    subitems: ItemGraphNode[];
    supitems: ItemGraphNode[];
    item: Item;
    id?: number;
    name?: string;

    /**
     * Higher score represents a greater depth from the root nodes. 
     */
    score?: number;
}
/**
 * Represents a state within a production body, with an offset
 * indicating the current considered symbol of the body. If offset
 * is the same as the number symbols that make up the body, then 
 * the Item is at the END state of the body. An item item that is
 * at the END state indicates a successful parse of the production 
 * body. 
 */
export class Item extends Array {

    static fromString(str: string): Item {
        const array = str.replace("|-", "").split(":").map(i => parseInt(i));

        return Item.fromArray(array);
    }

    static fromArray(array: Array<any>): Item {

        if (array instanceof Item) return new Item(array.body, array.len, array.offset);

        return new Item(array[ItemIndex.body_id], array[ItemIndex.length], array[ItemIndex.offset]);
    }

    constructor(body_id: number, length: number, offset: number) {
        //@ts-ignore
        super(body_id, length, offset);
    }

    get atEND(): boolean {
        return this.offset >= this.len;
    }

    get id(): string {
        return "" + this.body + ":" + this.len + ":" + this.offset + "|-";
    }

    get body(): number {
        return this[ItemIndex.body_id];
    }

    get len(): number {
        return this[ItemIndex.length];
    }


    get offset(): number {
        return this[ItemIndex.offset];
    }

    body_(grammar: GrammarObject): HCG3ProductionBody {
        return grammar.bodies[this.body];
    }

    sym(grammar: GrammarObject): HCG3Symbol {
        return this.body_(grammar).sym[this.offset] || default_EOF;
    }

    render(grammar: GrammarObject): string {

        const a = this.body_(grammar).sym
            .map(sym => Sym_Is_A_Production(sym) ? { val: "\x1b[38;5;8m" + grammar.productions[sym.val].name.replace(/\$/, "::\x1b[38;5;153m") } : sym)
            //@ts-ignore
            .flatMap((sym, i) => (i == this.offset) ? ["\x1b[38;5;226m•", SymbolToString(sym)] : SymbolToString(sym));
        if (a.length == this.offset)
            a.push("\x1b[38;5;226m•");
        return a.join(" ");
    }

    renderUnformatted(grammar: GrammarObject): string {

        const a = this.body_(grammar).sym
            .map(sym => Sym_Is_A_Production(sym) ? Object.assign({}, sym, { val: grammar.productions[sym.val].name }) : sym)
            .map(sym => getRootSym(sym, grammar))
            //@ts-ignore
            .flatMap((sym, i) => (i == this.offset) ? ["•", convert_symbol_to_string(sym)] : convert_symbol_to_string(sym));
        if (a.length == this.offset)
            a.push("•");

        return a.join(" ");
    }

    renderUnformattedWithProduction(grammar: GrammarObject): string {
        //const all_items = [...grammar.item_map.values()].map(e => e.item).filter(i => !i.atEND && i.sym(grammar).type == "sym-production");

        //const closure = this.atEND ? getFollowClosure(getClosure([this], grammar, true), all_items, grammar) : getClosure([this], grammar, true);

        // const syms = getSymbolsFromClosure(closure, grammar).map(convertSymbolToString).setFilter();

        return (this.getProduction(grammar).id + ":" + this.body) + " " + this.body_(grammar).production.name + "=>" + this.renderUnformatted(grammar); //+ ` [ ${syms.join(", ")} ]`;
    }
    getProductionID(grammar: GrammarObject): number {
        return this.body_(grammar).production.id;
    }
    //@ts-ignore
    getProduction(grammar: GrammarObject): GrammarProduction {
        return this.body_(grammar).production;
    }

    getProductionAtSymbol(grammar: GrammarObject): GrammarProduction {
        //@ts-ignore
        const prod = this.sym(grammar).val;

        return grammar.productions[prod];
    }
    /**
     * Returns the item incremented to its final position.
     * @returns Item
     */
    toEND(): Item {
        const item = this.decrement();

        item[ItemIndex.offset] = item[ItemIndex.length];

        return item;
    }

    increment(): Item | null {
        if (this.offset < this.len) {

            const item = new Item(this.body, this.len, this.offset + 1);

            return item;
        }
        return null;
    }

    decrement(): Item | null {
        const item = new Item(this.body, this.len, this.offset);
        item[ItemIndex.offset] = Math.max(0, item[ItemIndex.offset] - 1);
        return item;
    }

    match(item: Item): boolean {
        return item.id == this.id;
    }

    toString(): string {
        return this.id;
    }
}
export function getGotoItems(grammar: GrammarObject, active_productions: number[], items: Item[], out: Item[] = [], all = false) {

    const
        prod_id = new Set(active_productions),
        to_process = [];

    for (const item of items.reverse()) {
        if (!item || item.atEND) continue;

        const sym = item.sym(grammar);
        if (Sym_Is_A_Production(sym) && prod_id.has(<number>sym.val)) {

            out.push(item);
            if (item.increment().atEND) {
                to_process.push(item);
            }
        }
    }

    if (all)
        for (const item of to_process) {
            getGotoItems(grammar, item.getProduction(grammar).id, items, out, all);
        }

    return out;
}

export function itemsToProductionIDs(items: Item[], grammar: GrammarObject): number[] {
    return items.map(i => i.getProduction(grammar).id);
}

export function Items_Have_The_Same_Active_Symbol(items: Item[], grammar: GrammarObject) {
    return items.every(
        i => !i.atEND
            &&
            i.sym(grammar).val == items[0].sym(grammar).val
        //  &&
        //  !Sym_Is_A_Production(i.sym(grammar))
    );
}
