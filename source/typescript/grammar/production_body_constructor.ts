//@ts-ignore
import { JSNodeClass, exp, ext, stmt, JSNodeType, renderCompressed } from "@candlefw/js";

import { traverse, make_replaceable, bit_filter, extract } from "@candlefw/conflagrate";

import { Lexer } from "@candlefw/wind";

import { Symbol, ProductionBodyFunction, ProductionBodyReduceFunction, ProductionBody } from "../types/grammar.js";

import { GrammarParserEnvironment } from "../types/grammar_compiler_environment.js";

export default class implements ProductionBody {

    name: string;
    val: number;
    sym: Array<Symbol>;
    lex: Lexer;
    sym_map: Array<number>;
    length: number;
    functions: Array<ProductionBodyFunction>;
    reduce_function: ProductionBodyReduceFunction;
    grammar_stamp: number;
    form: number;
    excludes: Map<number, Symbol[]>;
    ignore: Map<number, Symbol[]>;
    error: Map<number, Symbol[]>;
    reset: Map<number, Symbol[]>;
    reduce: Map<number, Symbol>;
    BUILT: boolean;
    uid: string;
    precedence: number;

    FORK_ON_ENTRY: boolean;

    constructor(sym, env: GrammarParserEnvironment, lex: Lexer, form = (~(0xFFFFFFFFFFFFF << sym[0].body.length)) & 0xFFFFFF, force_fork = false) {

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
        this.FORK_ON_ENTRY = force_fork;

        //Used to identify the unique form of the body.
        this.uid = this.sym.map(e => e.type == "production" ? e.name : e.val).join(":");
    }

    build() {

        if (!this.BUILT && this.reduce_function && this.reduce_function.txt && !this.reduce_function.BUILT) {

            this.BUILT = true;

            const
                str =
                    (this.reduce_function.type == "RETURNED")
                        ? `function temp(temp){return ${this.reduce_function.txt}}`
                        : `function temp(temp){ ${this.reduce_function.txt}}`,
                ast = stmt(str), receiver = { ast: null };

            let alt = renderCompressed(ast);

            //*
            for (const { node, meta: { replace } } of traverse(ast, "nodes")
                .bitFilter("type", JSNodeClass.IDENTIFIER)
                .makeReplaceable((
                    parent,
                    child,
                    child_index,
                    children,
                    replaceParent
                ) => {
                    if (child == null) {
                        if (
                            (parent.type &
                                (
                                    JSNodeClass.UNARY_EXPRESSION
                                    | JSNodeClass.TERNARY_EXPRESSION
                                )
                            )
                            || parent.type == JSNodeType.AssignmentExpression
                            || parent.type == JSNodeType.PropertyBinding
                            || parent.type == JSNodeType.VariableStatement
                            || parent.type == JSNodeType.BindingExpression
                            || parent.type == JSNodeType.MemberExpression
                            || parent.type == JSNodeType.SpreadExpression
                            || parent.type == JSNodeType.Parenthesized
                            || parent.type == JSNodeType.ExpressionStatement
                        )
                            return null;

                        if (parent.type == JSNodeType.CallExpression
                            && child_index == 0)
                            return null;


                        if (parent.type == JSNodeType.ExpressionList
                            && child_index == 0
                            && children.length <= 1) {
                            return null;
                        }

                        if (parent.type & JSNodeClass.BINARY_EXPRESSION) {
                            replaceParent();
                            return children[1 - child_index];
                        }
                    }

                    return parent ? Object.assign({}, parent) : null;
                })
                .extract(receiver)
            ) {

                const
                    value = <string>node.value,
                    IS_REPLACE_SYM = value.slice(0, 4) == "$sym",
                    IS_NULLIFY_SYM = value.slice(0, 5) == "$$sym";

                if (IS_NULLIFY_SYM || IS_REPLACE_SYM) {

                    const index = parseInt(
                        IS_NULLIFY_SYM ?
                            value.slice(5) :
                            value.slice(4)
                    ) - 1;

                    let v = -1;

                    if ((v = this.sym_map.indexOf(index)) >= 0)
                        replace(exp(`sym[${v}]`));
                    else if (IS_NULLIFY_SYM)
                        replace(exp("null"));
                    else
                        replace(null);

                }
            }
            //*/
            const funct = ext(receiver.ast);

            this.reduce_function = Object.assign({}, this.reduce_function);

            try {
                this.reduce_function.txt = renderCompressed(funct.nodes[2]);
            } catch (e) {
                console.error(e);
                throw e;
            }

            this.reduce_function.BUILT = true;
        }


        //Removing build function ensures that this object can be serialized. 
        delete this.build;
    }
}