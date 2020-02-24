export function SymbolToString(sym) {
    switch (sym.type) {
        case "escaped":
        case "symbol":
            return `\x1b[38;5;208m${sym.val}`;
        case "generated":
            return `\x1b[38;5;208mθ${sym.val}`;
        case "literal":
            return `\x1b[38;5;229mτ${sym.val}`;
        case "empty":
            return `\x1b[38;5;208mɛ`;
        case "eof":
            return `\x1b[38;5;208m$eof`;
        default:
            return `\x1b[38;5;68m${sym.val}`;
    }
}

export class Item extends Array {

    static fromArray(array) {
        return new Item(array[0], array[1], array[2], array.follow);
    }

    constructor(body_id, length, offset, follow) {
        super(body_id, length, offset);
        this.follow = follow;
        this.USED = false;
        //this.grammar = g;
    }

    get atEND() {
        return this.offset >= this.len;
    }

    get v() {
        return this.follow.v;
    }

    get p() {
        return this.follow.p;
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

    body_(grammar) {
        return grammar.bodies[this.body];
    }

    sym(grammar) {
        return this.body_(grammar).sym[this.offset];
    }

    render(grammar) {
        const a = this.body_(grammar).sym
            .map(sym => sym.type == "production" ? { val: "\x1b[38;5;8m" + grammar[sym.val].name.replace(/\$/, "::\x1b[38;5;153m") } : sym)
            .flatMap((sym, i) => (i == this.offset) ? ["\x1b[38;5;226m•", SymbolToString(sym)] : SymbolToString(sym));
        if (a.length == this.offset)
            a.push("\x1b[38;5;226m•");
        return a.join(" ");
    }

    renderWithProduction(grammar) {
        return `\x1b[48;5;233m\x1b[38;5;226m[ ${this.renderProductionName(grammar)} \x1b[38;5;226m⇒ ${this.render(grammar)} \x1b[38;5;226m]\x1b[0m`;
    }

    renderWithProductionAndFollow(grammar) {
        return `[ ${this.body_(grammar).production.name.replace(/\$/, "::")}\x1b[0m ⇒ ${this.render(grammar)}, ${this.v}]`;
    }

    renderProductionName(grammar){
        return `\x1b[38;5;8m${this.body_(grammar).production.name.replace(/\$/, "::\x1b[38;5;153m")}`;
    }

    renderProductionNameWithBackground(grammar){
        return `\x1b[48;5;233m\x1b[38;5;8m ${this.body_(grammar).production.name.replace(/\$/, "::\x1b[38;5;153m")} \x1b[0m`;
    }

    renderSymbol(grammar){
        const sym = this.sym(grammar);
        return `\x1b[48;5;233m ${SymbolToString(sym)} \x1b[0m`;
    }

    increment() {
        if (this.offset < this.len)
            return new Item(this.body, this.len, this.offset + 1, this.follow);
        return null;
    }

    match(item) {
        return item.id == this.id;
    }

    toString() {
        return this.id;
    }
}