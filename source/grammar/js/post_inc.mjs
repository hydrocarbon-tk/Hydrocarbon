/** OPERATOR **/

import unary_post from "./unary_postfix_op.mjs";
import types from "./types.mjs";

export default class extends unary_post {

    constructor(sym) {
        super(sym);
        this.op = "++";
    }

    get type() { return types.post_inc }

}
