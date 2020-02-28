import { Production } from "../types/grammar";
import { GrammarParserEnvironment } from "./grammar_compiler_environment";
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
