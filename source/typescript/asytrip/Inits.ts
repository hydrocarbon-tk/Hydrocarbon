/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
export class Inits {
    private refs: Map<string, string>;
    private closure: string[];
    private vals: { str: string, init: string | boolean; }[];

    private sequence: {
        t: "refs" | "closure" | "vals",
        str: string;
        init?: string | boolean;
        ref?: string;
    }[];
    constructor() {
        this.refs = new Map();
        this.closure = [];
        this.vals = [];
        this.sequence = [];
    }

    push(string: string, initialize: string | boolean = true) {

        const ref = "ref_" + this.vals.length;


        this.vals.push({ str: string, init: initialize });

        this.sequence.push({
            t: "vals",
            str: string,
            init: initialize,
            ref
        });

        return ref;
    }

    push_ref(string: string) {

        if (this.refs.has(string))
            return this.refs.get(string);

        const ref = "r_" + this.refs.size;

        this.refs.set(string, ref);

        this.sequence.push({
            t: "refs",
            str: string,
            ref: ref
        });

        return ref;
    }

    push_closure(string: string) {


        const ref = "r_" + this.closure.length;

        string = string.replace("$$", ref);


        this.sequence.push({
            t: "closure",
            str: string,
            ref: ref
        });

        this.closure.push(string);

        return ref;
    }

    render_ts(closure: string = "", sequence: Inits["sequence"] = this.sequence) {
        let string = "";
        let i = 0;
        for (let { t, str, init, ref } of sequence) {
            i++;
            switch (t) {
                case "closure":
                    return `${string}\n ${str} { ${this.render_rust(closure, sequence.slice(i))} }`;
                case "refs":
                    string += `\n let ${ref} = ${str};`;
                    break;
                case "vals":
                    if (init)
                        string += `\n let ${ref}${typeof init == "string" ? ":" + init : ""} = ${str};`;
                    else
                        string += "\n" + str;
                    break;
            }
        }
        return string + "\n" + closure;
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

    render_rust(closure: string = "", sequence: Inits["sequence"] = this.sequence) {
        let string = "";
        let i = 0;
        for (let { t, str, init, ref } of sequence) {
            i++;
            switch (t) {
                case "closure":
                    return `${string}\n ${str} { ${this.render_rust(closure, sequence.slice(i))} }`;
                case "refs":
                    break;
                case "vals":
                    if (init)
                        string += `\n let mut ${ref}${typeof init == "string" ? ":" + init : ""} = ${str};`;
                    else
                        string += "\n" + str;
                    break;
            }
        }

        return string + "\n" + closure;
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

    get HAVE_CLOSURE() {
        return this.closure.length > 0;
    }
}
