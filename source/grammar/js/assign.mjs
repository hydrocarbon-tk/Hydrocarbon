/** ASSIGNEMENT EXPRESSION **/

import operator from "./operator.mjs";

import types from "./types.mjs";

export default class extends operator {
    constructor(sym) {
        super(sym);
        this.op = sym[1];
    }
    get id() { return this.vals[0] }
    get expr() { return this.vals[2] }
    get type() { return types.assign }
}
