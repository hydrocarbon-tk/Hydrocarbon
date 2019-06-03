import _function from "./function_declaration.mjs";
import types from "./types.mjs";

export default class extends _function {
    constructor(...sym) {
        super(...sym);
    }

    getRootIds(ids, closure) {
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

    get name() { return null }

    get type() { return types.arrow_function_declaration }

    render() {
        const
            body_str = this.body.render(),
            args_str = this.args.map(e => e.render()).join(",");
        return `${this.args.length == 1 ? args_str : `(${args_str})`} => ${body_str}`;
    }
}
