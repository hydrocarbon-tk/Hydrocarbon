import base from "./base.mjs";
import types from "./types.mjs";

export default class extends base {
    constructor(sym) {
        super(sym[0], (Array.isArray(sym[1])) ? sym[1] : [sym[1]]);
    }

    get id() { return this.vals[0] }
    get args() { return this.vals[1] }

    replaceNode(original, _new) {
        if (original == this.id)
            this.id = _new;
        else
            for (let i = 0; i < this.args.length; i++) {
                if (this.args[i] == original)
                    return this.args[i] = _new;
            }
    }

    getRootIds(ids, closure) {
        this.id.getRootIds(ids, closure);
        this.args.forEach(e => e.getRootIds(ids, closure));
    }

    * traverseDepthFirst(p) {
        this.parent = p;
        yield this;
        yield* this.id.traverseDepthFirst(this);
        yield* super.traverseDepthFirst(p, this.args);
    }

    get name() { return this.id.name }
    get type() { return types.call }

    render() { 
        return `${this.id.render()}(${this.args.map(a=>a.render()).join(",")})` 
    }
}
