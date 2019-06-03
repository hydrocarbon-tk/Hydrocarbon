/** STATEMENTS **/

import base from "./base.mjs";
import types from "./types.mjs";

export default class if_stmt extends base {
    constructor(sym) {
        const expr = sym[2],
            stmt = sym[4],
            else_stmt = (sym.length > 5) ? sym[6] : null;

        super(expr, stmt, else_stmt);
    }

    get expr() { return this.vals[0] }
    get stmt() { return this.vals[1] }
    get else_stmt() { return this.vals[2] }

    getRootIds(ids, closure) {
        this.expr.getRootIds(ids, closure);
        this.stmt.getRootIds(ids, closure);
        if (this.else_stmt)
            this.else_stmt.getRootIds(ids, closure);
    }

    * traverseDepthFirst(p) {

        this.parent = p;

        yield this;

        yield* this.expr.traverseDepthFirst(this);
        yield* this.stmt.traverseDepthFirst(this);

        if (this.else_stmt)
            yield* this.else_stmt.traverseDepthFirst(this);
    }

    get type() { return types.if }

    render() {
        const
            expr = this.expr.render(),
            stmt = this.stmt.render(),
            _else = (this.else_stmt) ? " else " + this.else_stmt.render() : "";
        return `if(${expr})${stmt}${_else}`;
    }
}
