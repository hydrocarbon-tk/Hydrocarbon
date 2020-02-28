export class CompilerErrorStore {
    constructor() { this.strings = []; }
    log(...vals) {
        this.strings.push(`${vals.map(e => typeof e !== "string" ? JSON.stringify(e).replace(/"/g, "") : e).join(", ")}`);
    }
    get output() { return this.strings.join("\n"); }
}
