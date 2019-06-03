/** LEXICAL DECLARATION **/

import base from "./base.mjs";
import types from "./types.mjs";
export default class extends base {
    constructor(sym, ) {
        super(sym[0], sym[1] ? sym[1] : null);
        this.id.root = false;
    }

    get id() { return this.vals[0] }
    get init() { return this.vals[1] }

    getRootIds(ids, closure) {
        this.ids.getRootIds(closure, closure);
        if (this.init) this.init.getRootIds(ids, closure);
    }

    render() { return `${this.id}${this.init ? ` = ${this.init.render()}` : ""}` }
}
