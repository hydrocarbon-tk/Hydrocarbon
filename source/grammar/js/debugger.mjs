/** DEBUGGER STATEMENT  **/

import base from "./base.mjs";
import types from "./types.mjs";

export default class extends base {
    constructor() {
        super();
    }

    getRootIds(ids, closure) {
        if (this.expr) this.expr.getRootIds(ids, closure);
    }

    * traverseDepthFirst(p) {
        this.parent = p;
        yield this;
    }

    get type() { return types.debugger }

    render() { return `debugger` }
}
