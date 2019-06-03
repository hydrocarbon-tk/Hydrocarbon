/** MEMBER **/

import base from "./base.mjs";
import types from "./types.mjs";
import identifer from "./identifier.mjs";

export default class mem extends base {
    constructor(sym) { super(sym[0], sym[2]);
        this.root = true;
        this.mem.root = false;
    }

    get id() { return this.vals[0] }
    get mem() { return this.vals[1] }

    getRootIds(ids, closuere) {
        this.id.getRootIds(ids, closuere);
    }

    * traverseDepthFirst(p) {
        this.parent = p;
        yield this;
        yield* this.id.traverseDepthFirst(this);
        yield* this.mem.traverseDepthFirst(this);
    }

    get name() { return this.id.name }
    get type() { return types.member }

    render() { 
        if(this.mem instanceof mem || this.mem instanceof identifer){
            return `${this.id.render()}.${this.mem.render()}`;
        }else{
            return `${this.id.render()}[${this.mem.render()}]`;
        }
    }
}
