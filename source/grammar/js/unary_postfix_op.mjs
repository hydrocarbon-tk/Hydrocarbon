/** OPERATOR **/

import base from "./base.mjs";

export default class extends base {

    constructor(sym) {
        super(sym[0]);
        this.op = "";
    }

    get expr() { return this.vals[0] }
    render() { return `${this.expr.render()}${this.op}` }
}
