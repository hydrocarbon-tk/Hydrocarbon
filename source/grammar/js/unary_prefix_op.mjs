/** OPERATOR **/

import base from "./base.mjs";
export default class extends base {

    constructor(sym) {
        super(sym[1]);
        this.op = "";
    }

    get expr() { return this.vals[0] }

    render() { return `${this.op}${this.expr.render()}` }
}
