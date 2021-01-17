import { Production } from "../types/Production";
import { Symbol } from "../types/Symbol";
import { GrammarParserEnvironment, ImportedProductionList } from "../types/grammar_compiler_environment.js";

export default class implements Production {

    id: -1;
    type: "production";
    name: string;
    val: number;
    IMPORTED: boolean;
    RESOLVED: boolean;
    production: Production;
    resolveFunction: any;

    constructor(sym: Array<any>, env: GrammarParserEnvironment) {

        this.type = "production";
        this.name = sym[2];
        this.val = -1;
        this.IMPORTED = true;
        this.RESOLVED = false;
        this.production = null;
        this.resolveFunction = () => { };

        const
            grammar_id = env.imported_grammar_name_resolution_map.get(sym[0]),
            productions = env.meta_imported_productions.get(grammar_id);

        if (productions) {
            if (productions.SYMBOL_LIST) {
                productions.push(this);
            } else {
                try {
                    const production = productions.LU.get(<string>this.name);
                    this.name = <string>production.name;
                    this.production = production;
                    this.RESOLVED = true;
                } catch (e) {
                    throw Error(`Grammar ${grammar_id} does not have a production named ${this.name}.`);
                }
            }
        } else {

            const list = <ImportedProductionList>[<Production>this];

            list.SYMBOL_LIST = true;

            env.meta_imported_productions.set(grammar_id, list);
        }
    }
}