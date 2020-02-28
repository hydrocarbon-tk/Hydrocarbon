import { Production } from "../types/grammar.js";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment.js";
export default class implements Production {
    id: -1;
    type: "production";
    name: string;
    val: number;
    IMPORTED: boolean;
    RESOLVED: boolean;
    production: Production;
    resolveFunction: any;
    constructor(sym: Array<any>, env: GrammarParserEnvironment);
}
