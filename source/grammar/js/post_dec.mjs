/** OPERATOR **/

import base from "./base.mjs";
import types from "./types.mjs";

export default class extends base {

    constructor(sym) {
        super(sym);
        this.op = "--";
    }

    get type() { return types.post_dec }
}
