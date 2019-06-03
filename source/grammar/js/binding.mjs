/** BINDING DECLARATION **/

import base from "./base.mjs";
import types from "./types.mjs";
export default class extends base {
    constructor(sym) {
        super(sym[0], sym[1] || null);
        this.id.root = false;
    }

    get id() { return this.vals[0] }
    get init() { return this.vals[1] }

    getRootIds(ids, closure) {
        this.id.getRootIds(closure, closure);
        if (this.init) this.init.getRootIds(ids, closure);
    }

    * traverseDepthFirst(p) {
        this.parent = p;
        yield this;
        yield* this.id.traverseDepthFirst(this);
        yield* this.init.traverseDepthFirst(this);
    }

    render() { return `${this.id}${this.init ? ` = ${this.init.render()}` : ""}` }
}
