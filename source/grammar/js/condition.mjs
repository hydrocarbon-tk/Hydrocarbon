/** CONDITION EXPRESSIONS **/

import base from "./base.mjs";
import types from "./types.mjs";
export default class extends base {
    constructor(sym) {
        super(sym[0], sym[2], sym[4]);
    }

    get bool() { return this.vals[0] }
    get left() { return this.vals[1] }
    get right() { return this.vals[2] }

    getRootIds(ids, closure) {
        this.bool.getRootIds(ids, closure);
        this.left.getRootIds(ids, closure);
        this.right.getRootIds(ids, closure);
    }

    get type() { return types.condition }

    render() {
        const
            bool = this.bool.render(),
            left = this.left.render(),
            right = this.right.render();

        return `${bool} ? ${left} : ${right}`;
    }
}
