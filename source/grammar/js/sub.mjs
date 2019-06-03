/** SUBTRACT **/

import operator from "./operator.mjs";
import types from "./types.mjs";
export default class extends operator {

    constructor(sym) {
        super(sym);
        this.op = "-";
    }

    get type () { return types.sub }
}
