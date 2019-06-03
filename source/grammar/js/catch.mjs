/** CATCH **/

import base from "./base.mjs";
import types from "./types.mjs";
export default class extends base {
    constructor(sym) {
        super(sym[2], sym[4]);
    }

    get param() { return this.vals[0] }
    get body() { return this.vals[1] }

    getRootIds(ids, closure) {
        if (this.body) this.body.getRootIds(ids, closure);
    }

    * traverseDepthFirst(p) {
        this.parent = p;
        yield this;
        yield* this.param.traverseDepthFirst(this);
        yield* this.body.traverseDepthFirst(this);
    }

    get type() { return types.catch }
}
