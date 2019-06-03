import types from "./types.mjs";

export default class {
    constructor(...vals) {
        this.vals = vals;
        this.parent = null;
    }

    replaceNode(original, _new = null, vals = this.vals) {
        for (let i = 0; i < vals.length; i++) {
            if (vals[i] === original)
                if (_new === null) {
                    return i;
                } else
                    return vals[i] = _new, -1;
        }
    }

    replace(node) {
        if (this.parent)
            this.parent.replaceNode(this, node);
    }

    getRootIds() {}

    * traverseDepthFirst(p, vals = this.vals) {
        this.parent = p;
        yield this;

        for (let i = 0; i < vals.length; i++) {

            const expr = vals[i];

            if (!expr) continue;

            if(Array.isArray(expr)){
                yield* this.traverseDepthFirst(p, expr);
            }else
                yield* expr.traverseDepthFirst(this);

            if (vals[i] !== expr) // Check to see if expression has been replaced. 
                i--;
        }
    }

    skip(trvs) {

        for (let val = trvs.next().value; val && val !== this; val = trvs.next().value);

        return trvs;
    }
    spin(trvs) {
        let val = trvs.next().value;
        while (val !== undefined && val !== this) { val = trvs.next().value };
    }
    toString() { return this.render() }

    render() { return this.vals.join("") }
}
