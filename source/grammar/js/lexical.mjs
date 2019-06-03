/** LEXICAL DECLARATION **/

import base from "./base.mjs";
import types from "./types.mjs";
export default class extends base {
    constructor(sym) {
        super(sym[1]);
        this.mode = sym[0];
    }

    get bindings() { return this.vals[0] }

    getRootIds(ids, closure) {
        this.bindings.forEach(b => b.getRootIds(ids, closure));
    }

    get type() { return types.lex }

    render() { return `${this.mode} ${this.bindings.map(b=>b.render()).join(",")};` }
}
