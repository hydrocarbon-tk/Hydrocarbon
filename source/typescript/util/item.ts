import { ProductionBody, Grammar, Symbol, SymbolType } from "../types/grammar.js";

export function SymbolToString(sym:{type?:SymbolType, val:string}) {
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

export class Item extends Array {

    static fromArray(array: Item) : Item {
        return new Item(array[0], array[1], array[2], array.follow);
    }

    USED:boolean;
    follow:Symbol;

    constructor(body_id:number, length:number, offset:number, follow:Symbol) {
        super(...[body_id, length, offset]);
        
        this.follow = follow;
        
        this.USED = false;
    }

    get atEND() {
        return this.offset >= this.len;
    }

    get v() {
        return this.follow.val;
    }

    get p() {
        return this.follow.precedence;
    }

    get id() {
        return "" + this.body + "" + this.len + "" + this.offset + "|";
    }

    get full_id() {
        return this.id + this.v;
    }

    get body() {
        return this[0];
    }

    get len() {
        return this[1];
    }


    get offset() {
        return this[2];
    }

    body_(grammar:Grammar):ProductionBody {
        return grammar.bodies[this.body];
    }

    sym(grammar:Grammar) {
        return this.body_(grammar).sym[this.offset];
    }

    render(grammar:Grammar) {
        
        const a = this.body_(grammar).sym
            .map(sym => sym.type == "production" ? { val: "\x1b[38;5;8m" + grammar[sym.val].name.replace(/\$/, "::\x1b[38;5;153m") } : sym)
            //@ts-ignore
            .flatMap((sym, i) => (i == this.offset) ? ["\x1b[38;5;226m•", SymbolToString(sym)] : SymbolToString(sym));
        if (a.length == this.offset)
            a.push("\x1b[38;5;226m•");
        return a.join(" ");
    }

    renderWithProduction(grammar:Grammar):string {
        return `\x1b[48;5;233m\x1b[38;5;226m[ ${this.renderProductionName(grammar)} \x1b[38;5;226m⇒ ${this.render(grammar)} \x1b[38;5;226m]\x1b[0m`;
    }

    renderWithProductionAndFollow(grammar:Grammar):string {
        //@ts-ignore
        return `[ ${this.body_(grammar).production.name.replace(/\$/, "::")}\x1b[0m ⇒ ${this.render(grammar)}, ${this.v}]`;
    }

    renderProductionName(grammar:Grammar):string{
        //@ts-ignore
        return `\x1b[38;5;8m${this.body_(grammar).production.name.replace(/\$/, "::\x1b[38;5;153m")}`;
    }

    renderProductionNameWithBackground(grammar):string{
        //@ts-ignore
        return `\x1b[48;5;233m\x1b[38;5;8m ${this.body_(grammar).production.name.replace(/\$/, "::\x1b[38;5;153m")} \x1b[0m`;
    }

    renderSymbol(grammar:Grammar):string{
        const sym = this.sym(grammar);
        //@ts-ignore
        return `\x1b[48;5;233m ${SymbolToString(sym)} \x1b[0m`;
    }

    increment() : Item | null {
        if (this.offset < this.len)
            return new Item(this.body, this.len, this.offset + 1, this.follow);
        return null;
    }

    match(item:Item) :boolean {
        return item.id == this.id;
    }

    toString(): string {
        return this.id;
    }
}