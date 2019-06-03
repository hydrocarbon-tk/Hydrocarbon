import base from "./base.mjs";
import types from "./types.mjs";

export default class extends base {
    constructor(sym) {
        super(sym[0]);
    }

    get exprs() { return this.vals[0] }

    getRootIds(ids, closure) {
        this.exprs.forEach(e => e.getRootIds(ids, closure));
    }

    replaceNode(original, _new = null) {
        let index = 0;
        if ((index = super.replaceNode(original, _new, this.vals[0])) > -1) {
            this.vals[0].splice(index, 1);
        }
    }

    * traverseDepthFirst(p) {
        this.parent = p;

        yield this;

        for (let i = 0; i < this.exprs.length; i++) {

            const expr = this.exprs[i];

            yield* expr.traverseDepthFirst(this);

            if (this.exprs[i] !== expr)
                yield* this.exprs[i].traverseDepthFirst(this);
        }
    }

    get name() { return this.id.name }

    get type() { return types.array_literal }

    render() { return `[${this.exprs.map(a=>a.render()).join(",")}]` }
}
