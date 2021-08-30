import { traverse } from "@candlelib/conflagrate";
import { exp, JSNodeClass, JSNodeType, renderCompressed } from "@candlelib/js";
import { HCG3Grammar, HCG3ProductionBody } from "../../types/grammar_nodes";


export function createJSFunctionsFromExpressions(grammar: HCG3Grammar, error) {
    // Reset the reduce_functions lookup to prepare the grammar for output
    // to JavaScript/TypeScript format. 
    grammar.reduce_functions = <Map<string, number>>new Map();

    for (const production of grammar.productions) {

        for (const body of production.bodies) {

            if (body.reduce_function) {

                const fn = body.reduce_function;


                if (fn.type == "env-function-reference") {
                    fn.js = `(env, sym, pos)=> env.functions.${fn.ref} (env, sym, pos)`;
                    addReduceFNStringToLUT(body, grammar, fn.js);
                    continue;
                } else if (!fn.txt) {
                    addReduceFNStringToLUT(body, grammar);
                    body.reduce_function = null;
                    continue;
                }

                const expression = exp(`(${fn.txt.replace(/(\${1,2}\d+)/g, "$1_")})`);

                const receiver = { ast: null };

                for (const { node, meta: { replace } } of traverse(expression, "nodes")
                    .bitFilter("type", JSNodeClass.IDENTIFIER)
                    .makeReplaceable((
                        parent,
                        child,
                        child_index,
                        children,
                        replaceParent
                    ) => {
                        if (child == null) {
                            if ((parent.type &
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
                                || parent.type == JSNodeType.ExpressionStatement)
                                return null;

                            if (parent.type == JSNodeType.Arguments && children.length <= 1) {
                                replaceParent();
                                return null;
                            }

                            if (parent.type == JSNodeType.CallExpression) {
                                return null;
                            }

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
                    .extract(receiver)) {


                    const
                        value = <string>node.value,
                        IS_REPLACE_SYM = value.slice(0, 1) == "$",
                        IS_NULLIFY_SYM = value.slice(0, 2) == "$$";


                    if (IS_NULLIFY_SYM || IS_REPLACE_SYM) {

                        const val =
                            IS_NULLIFY_SYM ?
                                value.slice(2) :
                                value.slice(1);

                        let index = parseInt(val) - 1;

                        if (value == "$NULL" || value == "$$NULL") {

                            if (IS_NULLIFY_SYM)
                                replace(exp("null"));

                            else
                                replace(null, true);

                        } else {

                            if (isNaN(index)) {

                                switch (val) {
                                    case "vec_create":
                                        replace(exp(`[sym[${0}]]`));
                                        break;
                                    case "vec_join":
                                        replace(exp(`(sym[${0}].push(sym[${body.sym.length - 1}]), sym[${0}])`));
                                        break;
                                    case "string_create":
                                        replace(exp(`sym[${0}] + ""`));
                                        break;
                                    case "string_join":
                                        replace(exp(`sym[${0}] + sym[${body.sym.length - 1}]`));
                                        break;
                                    default:
                                        throw new Error(`Unexpected non integer value from ${val} ${index} ${node.value}`);

                                }
                            } else {

                                if (index >= 100)
                                    index = body.sym.length - 1;
                                replace(exp(`sym[${index}]`));
                            }
                        }
                    }
                }

                const js = renderCompressed(receiver.ast);

                if (!js) {
                    addReduceFNStringToLUT(body, grammar);
                    body.reduce_function = null;
                } else {
                    addReduceFNStringToLUT(body, grammar, `(env, sym, pos)=> ${js} `);
                }
            }
        }
    }
}

export function addReduceFNStringToLUT(body: HCG3ProductionBody, grammar: HCG3Grammar, txt: string = null, data = null) {
    if (txt) {

        if (!grammar.reduce_functions.has(txt))
            grammar.reduce_functions.set(txt, { id: grammar.reduce_functions.size, data });

        body.reduce_id = grammar.reduce_functions.get(txt).id;

    }
    else
        body.reduce_id = -1;
}
