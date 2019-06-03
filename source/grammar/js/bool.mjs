/** BOOLEAN **/

import base from "./base.mjs";

import types from "./types.mjs";

export default class bool extends base {
    constructor(sym) { super(sym[0]) }

    get type() { return types.bool }

    * traverseDepthFirst(p) {
        this.parent = p;
        yield this;
    }
}
