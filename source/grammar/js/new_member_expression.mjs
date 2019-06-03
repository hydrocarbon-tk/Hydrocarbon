/** MEMBER **/

import base from "./base.mjs";
import types from "./types.mjs";
import identifer from "./identifier.mjs";

export default class mem extends base {
    constructor(sym) { super(sym[1], sym[2]);
        this.root = false;
        this.id.root = false;
    }

    get id() { return this.vals[0] }
    get args() { return this.vals[1] }

    getRootIds(ids, closuere) {
        this.id.getRootIds(ids, closuere);
    }

    get name() { return this.id.name }
    get type() { return types.new_member }

    render() { 
        const
            args_str = this.args.map(e => e.render()).join(",");

        return `new ${this.id.render()}(${args_str})`;
    }
}
