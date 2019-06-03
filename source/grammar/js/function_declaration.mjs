import base from "./base.mjs";
import types from "./types.mjs";

export default class extends base {
    constructor(id, args, body) {
        
        args = (Array.isArray(args)) ? args : [args];

        super(id, args || [], body || []);

        //This is a declaration and id cannot be a closure variable. 
        if (this.id)
            this.id.root = false;
    }

    get id() { return this.vals[0] }
    get args() { return this.vals[1] }
    get body() { return this.vals[2] }

    getRootIds(ids, closure) {
        if (this.id)
            this.id.getRootIds(ids, closure);
        this.args.forEach(e => e.getRootIds(ids, closure));
    }

    * traverseDepthFirst(p) {
        this.parent = p;

        yield this;

        if (this.id)
            yield* this.id.traverseDepthFirst(this);

        for (const arg of this.args)
            yield* arg.traverseDepthFirst(this);

        yield* this.body.traverseDepthFirst(this);

    }

    get name() { return this.id.name }

    get type() { return types.function_declaration }

    render() {
        const
            body_str = this.body.render(),
            args_str = this.args.map(e => e.render()).join(","),
            id = this.id ? this.id.render() : "";

        return `function ${id}(${args_str}){${body_str}}`;
    }
}
