//@ts-ignore
import { null_literal, member_expression, numeric_literal, identifier, parse as ecmascript_parse } from "@candlefw/js";
import { Lexer } from "@candlefw/wind";

import { Production, Symbol,ProductionBodyFunction,ProductionBodyReduceFunction, ProductionBody } from "../types/grammar.js";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment.js";

export default class implements ProductionBody {
    
    name : string;
    val : number;
    sym: Array<Symbol>
    lex:Lexer;
    sym_map:Array<number>;
    length :number;
    functions: Array<ProductionBodyFunction>;
    reduce_function: ProductionBodyReduceFunction;
    grammar_stamp : number;
    form:number;
    excludes: Map<number, Symbol[]>
    ignore: Map<number, Symbol[]>
    error: Map<number, Symbol[]>
    reset: Map<number, Symbol[]>
    reduce: Map<number, Symbol>
    BUILT:boolean;
    uid:string;
    precedence:number;

    constructor(sym, env:GrammarParserEnvironment, lex:Lexer, form = (~(0xFFFFFFFFFFFFF << sym[0].body.length)) & 0xFFFFFF) {

        const s = sym[0];
        let bc = 0;

        this.lex = lex;
        this.sym = s.body || [];
        this.sym_map = this.sym.map(e => (e.IS_CONDITION ? -1 : bc++));
        this.length = 0;
        this.functions = [];
        this.reduce_function = s.reduce || null;
        this.grammar_stamp = env.stamp;
        this.form = form;

        this.excludes = new Map();
        this.ignore = new Map();
        this.error = new Map();
        this.reset = new Map();
        this.reduce = new Map();

        this.precedence = 0;

        this.BUILT = false;

        //Used to identifiy the unique form of the body.
        this.uid = this.sym.map(e => e.type == "production" ? e.name : e.val).join(":");
    }

    build() {

        if (!this.BUILT && this.reduce_function && this.reduce_function.txt) {

            this.BUILT = true;

            const str = (this.reduce_function.type == "RETURNED") ?
                `function temp(temp){return ${this.reduce_function.txt}}` :
                `function temp(temp){ ${this.reduce_function.txt}}`;

            let fn = ecmascript_parse(str);

            fn = fn.statements;

            const iter = fn.traverseDepthFirst();

            for (const node of iter) {

                //If encountering an identifier with a value of the form "$sym*" where * is an integer.
                if (node instanceof identifier && (node.val.slice(0, 4) == "$sym" || node.val.slice(0, 5) == "$$sym")) {

                    // Retrieve the symbol index
                    const index = parseInt(
                        node.val.slice(0, 5) == "$$sym" ?
                            node.val.slice(5) :
                            node.val.slice(4)
                    ) - 1;

                    let n = null,
                        v = -1;
                    // Replace node with either null or "sym[*]"" depending on the presence of nonterms
                    // within the body.  

                    if ((v = this.sym_map.indexOf(index)) >= 0) {
                        n = new member_expression(new identifier(["sym"]), new numeric_literal([v]), true);
                    } else if (node.val.slice(0, 5) == "$$sym") {
                        n = new null_literal();
                    }

                    node.replace(n);
                }
            }

            // Replace the reduce_function with a new object (that contains the modified
            // functions string)?
            this.reduce_function = Object.assign({}, this.reduce_function);
            this.reduce_function.txt = (this.reduce_function.type == "RETURNED") ?
                fn.body.expr.render() :
                fn.body.render();
        }

        //Removing build function ensures that this object can be serialized. 
        delete this.build;
    }
}