/** NEGATE **/

import unary_prefix_op from "./unary_prefix_op.mjs";
import types from "./types.mjs";

export default class extends unary_prefix_op {
    constructor(sym) { super(sym);
        this.op = "-";
    }
    get type() { return types.negate }
}
