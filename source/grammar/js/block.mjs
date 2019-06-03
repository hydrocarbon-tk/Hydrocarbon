/** BLOCK **/

import stmts from "./stmts.mjs";
import types from "./types.mjs";
export default class extends stmts {

    constructor(sym) {
        if (!(sym[1] instanceof stmts))
            return sym[1];

        super(sym[1].vals);
    }

    getRootIds(ids, closure) {
        super.getRootIds(ids, new Set([...closure.values()]));
    }

    get type() { return types.block }

    render() { return `{${super.render()}}` }
}
