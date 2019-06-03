/** THIS EXPRESSION  **/

import base from "./base.mjs";
import types from "./types.mjs";



export default class extends base {
    constructor() {
        super();
        this.root = false;
    }

    getRootIds(ids, closure) {
        if (this.expr) this.expr.getRootIds(ids, closure);
    }

    * traverseDepthFirst(p) {
        this.parent = p;
        yield this;
    }
    get name() { return "this" }
    get type() { return types.this_expr }

    render() { return `this` }
}
