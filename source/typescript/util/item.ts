import { getRootSym } from "../hybrid/utilities/utilities.js";
import { ProductionBody, Grammar, SymbolType, Production } from "../types/grammar.js";
import { Symbol } from "../types/Symbol";

export function SymbolToString(sym: { type?: SymbolType, val: string; }) {
    switch (sym.type) {
        case SymbolType.ESCAPED:
        case SymbolType.SYMBOL:
            return `\x1b[38;5;208m${sym.val}`;
        case SymbolType.GENERATED:
            return `\x1b[38;5;208mθ${sym.val}`;
        case SymbolType.LITERAL:
            return `\x1b[38;5;229mτ${sym.val}`;
        case SymbolType.EMPTY:
            return `\x1b[38;5;208mɛ`;
        case SymbolType.END_OF_FILE:
            return `\x1b[38;5;208m$eof`;
        default:
            return `\x1b[38;5;68m${sym.val}`;
    }
}

export const enum ItemIndex {
    body_id = 0,
    length = 1,
    offset = 2
}

export function SymbolToStringUnformatted(sym: { type?: SymbolType, val: string; }) {
    switch (sym.type) {
        case SymbolType.ESCAPED:
        case SymbolType.SYMBOL:
            return `${sym.val}`;
        case SymbolType.GENERATED:
            return `θ${sym.val}`;
        case SymbolType.LITERAL:
            return `τ${sym.val}`;
        case SymbolType.EMPTY:
            return `ɛ`;
        case SymbolType.END_OF_FILE:
            return `END_OF_FILE`;
        default:
            return sym.val;
    }
}

export class Item extends Array {

    static fromArray(array: Item): Item {
        if (array instanceof Item) return array;

        const new_item = new Item(array[ItemIndex.body_id], array[ItemIndex.length], array[ItemIndex.offset], (<Item>array).follow);

        return new_item;
    }

    USED: boolean;
    follow: Symbol;

    constructor(body_id: number, length: number, offset: number, follow: Symbol) {
        //@ts-ignore
        super(body_id, length, offset);

        this.follow = follow;

        this.USED = false;
    }

    get atEND(): boolean {
        return this.offset >= this.len;
    }

    get v(): string | number {
        return this.follow.val;
    }

    get p(): number {
        return this.follow.precedence;
    }

    get id(): string {
        return "" + this.body + "" + this.len + "" + this.offset + "|";
    }

    get full_id(): string {
        return this.id + this.v;
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

    body_(grammar: Grammar): ProductionBody {
        return grammar.bodies[this.body];
    }

    sym(grammar: Grammar): Symbol {
        return this.body_(grammar).sym[this.offset];
    }

    render(grammar: Grammar): string {

        const a = this.body_(grammar).sym
            .map(sym => sym.type == SymbolType.PRODUCTION ? { val: "\x1b[38;5;8m" + grammar[sym.val].name.replace(/\$/, "::\x1b[38;5;153m") } : sym)
            //@ts-ignore
            .flatMap((sym, i) => (i == this.offset) ? ["\x1b[38;5;226m•", SymbolToString(sym)] : SymbolToString(sym));
        if (a.length == this.offset)
            a.push("\x1b[38;5;226m•");
        return a.join(" ");
    }

    renderUnformatted(grammar: Grammar): string {

        const a = this.body_(grammar).sym
            .map(sym => sym.type == SymbolType.PRODUCTION ? Object.assign({}, sym, { val: grammar[sym.val].name + "::" + grammar[sym.val].IS_LEFT_RECURSIVE }) : sym)
            .map(sym => getRootSym(sym, grammar))
            //@ts-ignore
            .flatMap((sym, i) => (i == this.offset) ? ["•", SymbolToStringUnformatted(sym)] : SymbolToStringUnformatted(sym));
        if (a.length == this.offset)
            a.push("•");
        return a.join(" ");
    }

    renderUnformattedWithProductionAndFollow(grammar: Grammar): string {
        return this.renderUnformattedWithProduction(grammar) + "|" + this.follow.val;
    }

    renderUnformattedWithProduction(grammar: Grammar): string {
        return this.body_(grammar).production.name + "=>" + this.renderUnformatted(grammar);
    }

    renderWithProduction(grammar: Grammar): string {
        return `\x1b[48;5;233m\x1b[38;5;226m[ ${this.renderProductionName(grammar)} \x1b[38;5;226m⇒ ${this.render(grammar)} \x1b[38;5;226m]\x1b[0m`;
    }

    renderWithProductionAndFollow(grammar: Grammar): string {
        //@ts-ignore
        return `\x1b[48;5;233m\x1b[38;5;226m[ ${this.renderProductionName(grammar)} \x1b[38;5;226m⇒ ${this.render(grammar)}, ${this.v} \x1b[38;5;226m]\x1b[0m`;;
    }

    getProduction(grammar: Grammar): Production {
        //@ts-ignore
        return this.body_(grammar).production;
    }

    getProductionAtSymbol(grammar: Grammar): Production {
        //@ts-ignore
        const prod = this.sym(grammar).val;

        return grammar[prod];
    }


    renderProductionName(grammar: Grammar): string {
        //@ts-ignore
        return `\x1b[38;5;8m${this.body_(grammar).production.name.replace(/\$/, "::\x1b[38;5;153m")}`;
    }

    renderProductionNameWithBackground(grammar): string {
        //@ts-ignore
        return `\x1b[48;5;233m\x1b[38;5;8m ${this.body_(grammar).production.name.replace(/\$/, "::\x1b[38;5;153m")} \x1b[0m`;
    }

    renderSymbol(grammar: Grammar): string {
        const sym = this.sym(grammar);
        //@ts-ignore
        return `\x1b[48;5;233m ${SymbolToString(sym)} \x1b[0m`;
    }

    increment(): Item | null {
        if (this.offset < this.len) {

            const item = new Item(this.body, this.len, this.offset + 1, this.follow);
            return item;
        }
        return null;
    }

    decrement(): Item | null {
        if (this.offset > 0)
            return new Item(this.body, this.len, this.offset - 1, this.follow);
        return this;
    }

    match(item: Item): boolean {
        return item.id == this.id;
    }

    toString(): string {
        return this.id;
    }

    getFunctions(grammar: Grammar) {
        const body = this.body_(grammar);

        if (this.atEND) {
            return body.functions.filter(fn => {
                return fn.offset >= this.offset;
            });
        } else {
            return body.functions.filter(fn => {
                return fn.type == "INLINE" && fn.offset == this.offset;
            });
        }
    }

}