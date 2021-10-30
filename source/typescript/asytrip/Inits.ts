export class Inits {
    refs: Map<string, string>;
    vals: { str: string, init: string | boolean; }[];
    constructor() {
        this.refs = new Map();
        this.vals = [];
    }

    push(string: string, initialize: string | boolean = true) {

        const ref = "ref_" + this.vals.length;

        this.vals.push({ str: string, init: initialize });

        return ref;
    }

    push_ref(string: string) {

        if (this.refs.has(string))
            return this.refs.get(string);

        const ref = "r_" + this.refs.size;

        this.refs.set(string, ref);

        return ref;
    }

    render_js() {
        return this.vals.map(({ str, init }, i) => {
            if (init)
                return `const ref_${i} = ${str};`;
            else
                return str;
        }).join("\n");
    }

    render_ts() {
        return this.vals.map(({ str, init }, i) => {
            if (init)
                return `const ref_${i}${typeof init == "string" ? ":" + init : ""} = ${str};`;
            else
                return str;
        }).join("\n");
    }

    render_go() {
        return [
            ...[...this.refs].map(([val, ref]) => {
                return `${ref} := ${val}`;
            }),
            ...this.vals.map(({ str, init }, i) => {
                if (init)
                    return `ref_${i}${typeof init == "string" ? " " + init : ""} := ${str}`;
                else
                    return str;
            })].join("\n");
    }

    render_rust() {
        return this.vals.map(({ str, init }, i) => {
            if (init)
                return `let ref_${i}${typeof init == "string" ? ":" + init : ""} = ${str};`;
            else
                return str;
        }).join("\n");
    }

    render_cpp() {
        return this.vals.map(({ str, init }, i) => {
            if (init)
                return `${typeof init == "string" ? ":" + init : ""} ref_${i} = ${str};`;
            else
                return str;
        }).join("\n");
    }

    render_java() {
        return this.vals.map(({ str, init }, i) => {
            if (init)
                return `${typeof init == "string" ? ":" + init : ""} ref_${i} = ${str}`;
            else
                return str;
        }).join("\n");
    }
}
