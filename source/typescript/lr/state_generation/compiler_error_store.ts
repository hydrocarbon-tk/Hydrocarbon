export class CompilerErrorStore {
    
    strings: Array<string>;
    
    constructor() { this.strings = []; }
    
    log(...vals: Array<any>): void {
        this.strings.push(`${vals.map(e => typeof e !== "string" ? JSON.stringify(e).replace(/"/g, "") : e).join(", ")}`);
    }
    
    get output(): string { return this.strings.join("\n"); }
}
