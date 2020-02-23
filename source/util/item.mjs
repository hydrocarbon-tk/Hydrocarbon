export class Item extends Array {

    static fromArray(array){
        return new Item(array[0], array[1], array[2], array.follow);
    }

    constructor(body_id, length, offset, follow) {
        super(body_id, length, offset);
        this.follow = follow;
        this.USED = false;
        //this.grammar = g;
    }

    get atEND(){
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
            .map(sym=> sym.type == "production" ? {val:grammar[sym.val].name} : sym )
            .flatMap((sym, i) => (i == this.offset) ? ["•", sym.val] : sym.val);
        if (a.length == this.offset)
            a.push("•");
        return a.join(" ");
    }

    renderWithProduction(grammar){
        return `[ ${this.body_(grammar).production.name} ⇒ ${this.render(grammar)} ]`;
    }

    renderWithProductionAndFollow(grammar){
        return `[${this.body_(grammar).production.name}⇒ ${this.render(grammar)}, ${this.v}]`;
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