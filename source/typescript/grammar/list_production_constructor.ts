import { Lexer } from "@candlefw/wind";
import { Production, Symbol, ProductionBodyReduceFunction } from "../types/grammar.js";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment.js";

export default class implements Production {

    id: -1;
    type: "production";
    name: string;
    val: number;
    subtype: string;
    IS_OPTIONAL: boolean;

    constructor(sym: Array<any>, env: GrammarParserEnvironment, lex: Lexer) {

        this.name = env.prod_name + "_HC_listbody" + (env.body_offset + 1) + "_" + Math.round(Math.random() * 10000);
        this.subtype = "list";
        this.type = "production";
        this.val = -1;
        this.IS_OPTIONAL = !!(sym[1] == "(*");

        const
            STRING = sym[2].val === "\"" || sym[2].val === "'",
            delimiter = (!STRING && sym.length > 3) ? sym[2] : null,
            listProduction = {
                subtype: "list",
                name: this.name,
                bodies: [
                    new env.functions.body([
                        {
                            body: [
                                { type: "production", name: this.name, val: -1 },
                                ...(delimiter ? [delimiter, sym[0]] : [sym[0]])
                            ],
                            reduce: <ProductionBodyReduceFunction>{
                                type: "RETURNED",
                                txt: STRING
                                    ? `$sym1 + $sym2`
                                    : `($sym1.push($sym${!!delimiter ? 3 : 2}), $sym1)`,
                                name: "",
                                env: false,
                                IS_CONDITION: true
                            }
                        }], env, lex),
                    new env.functions.body([
                        {
                            body: [sym[0]],
                            reduce: <ProductionBodyReduceFunction>{
                                type: "RETURNED",
                                txt: STRING ?
                                    `$sym1 + ""`
                                    : `[$sym1]`,
                                name: "",
                                env: false,
                                IS_CONDITION: true
                            }
                        }], env, lex)
                ],
                id: -1
            };

        listProduction.id = env.productions.length;
        env.productions.push(<Production>listProduction);
        env.functions.compileProduction(listProduction, env, lex);
    }
}