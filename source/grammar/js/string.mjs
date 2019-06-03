/** STRING **/

import base from "./base.mjs";

import types from "./types.mjs";

export default class extends base {
    constructor(sym) { super(sym.length === 3 ? sym[1]: "") }

    get val() { return this.vals[0] }

    getRootIds(ids, closuere) { if (!closuere.has(this.val)) ids.add(this.val); }

    * traverseDepthFirst(p) {
        this.parent = p;
        yield this;
    }


    get type() { return types.string }

    render() { return `"${this.val}"` }
}
