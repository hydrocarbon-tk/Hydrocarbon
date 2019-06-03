/** OBJECT **/

import base from "./base.mjs";

import types from "./types.mjs";

export default class extends base {
    constructor(sym) {
        super(sym[0] || []);
    }

    get props() { return this.vals[0] }

    * traverseDepthFirst(p) {
        this.parent = p;
        yield this;
        for (const prop of this.props)
            yield* prop.traverseDepthFirst(this);
    }

    get type() { return types.object }

    render() { return `{${this.props.map(p=>p.render()).join(",")}}` }
}
