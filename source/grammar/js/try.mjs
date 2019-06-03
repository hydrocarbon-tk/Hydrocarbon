/** TRY **/

import base from "./base.mjs";
import types from "./types.mjs";
export default class extends base {
    constructor(body, _catch, _finally) {
        super(body, _catch, _finally);


    }
    get catch() { return this.vals[0] }
    get body() { return this.vals[1] }
    get finally() { return this.vals[2] }

    getRootIds(ids, clsr) {
        this.body.getRootIds(ids, clsr);
        if (this.catch) this.catch.getRootIds(ids, clsr);
        if (this.finally) this.finally.getRootIds(ids, clsr);
    }

    * traverseDepthFirst(p) {
        this.parent = p;
        yield this;
        if (this.body) yield* this.body.traverseDepthFirst(p);
        if (this.catch) yield* this.catch.traverseDepthFirst(p);
        if (this.finally) yield* this.finally.traverseDepthFirst(p);
    }

    get type() { return types.try }
}
