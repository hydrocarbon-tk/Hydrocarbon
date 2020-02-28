import { Production, Symbol } from "../types/grammar";
import { Lexer } from "@candlefw/whind";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment";

export default class implements Production {

    id:-1;
    type : "production";
    name : string;
    val : number;
    subtype : string;
    IS_OPTIONAL : boolean;

    constructor(sym : Array<any>, env:GrammarParserEnvironment, lex:Lexer) {

        this.name = env.prod_name + "_list_" + env.body_offset;
        this.subtype = "list";
        this.type = "production";
        this.val = -1;
        this.IS_OPTIONAL = !!(sym[1] == "(*");

        const
            STRING = sym[2].val === "\"" || sym[2].val === "'",
            delimeter = (!STRING && sym.length > 3) ? sym[2] : null,
            listProduction = {
                subtype: "list",
                name: this.name,
                bodies: [
                        new env.functions.body([
                        {
                            body: [{ type: "production", name: this.name, val: -1 },
                                ...(delimeter ? [delimeter, sym[0]] : [sym[0]]), {
                                    type: "INLINE",
                                    txt: STRING
                                        ? `const b =  sym.length - 1, a = b - 1; sym[a] = sym[a] + sym[b]; sym[b] = sym[a]`
                                        : `const b =  sym.length - 1, a = b - ${delimeter?2:1}; if(sym[b] !== null) sym[a].push(sym[b]); sym[b] = sym[a]`,
                                    name: "",
                                    env: false,
                                    IS_CONDITION: true
                            }]
                        }], env, lex),
                        new env.functions.body([
                        {
                            body: [sym[0], {
                                type: "INLINE",
                                txt: STRING ?
                                    `const b =  sym.length - 1; sym[b] = sym[b] + ""`
                                    : "const b =  sym.length - 1; sym[b] = ((sym[b] !== null) ? [sym[b]] : [])",
                                name: "",
                                env: false,
                                IS_CONDITION: true
                            }]
                        }], env, lex)
                    ],
                id: -1
            };

        listProduction.id = env.productions.length;
        env.productions.push(<Production>listProduction);
        env.functions.compileProduction(listProduction, env, lex);
    }
}