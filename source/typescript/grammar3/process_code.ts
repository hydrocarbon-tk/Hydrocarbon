import { traverse } from "@candlelib/conflagrate";
import { exp, JSNodeClass, JSNodeType, renderCompressed } from "@candlelib/js";
import { HCG3Grammar } from "../types/grammar_nodes";



export function createJSFunctionsFromExpressions(grammar: HCG3Grammar, error) {
    for (const production of grammar.productions) {
        for (const body of production.bodies) {
            if (body.reduce_function) {
                const expression = exp(`(${body.reduce_function.txt.replace(/(\${1,2}\d+)/g, "$1_")})`);

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

                        let index = parseInt(
                            IS_NULLIFY_SYM ?
                                value.slice(2) :
                                value.slice(1)
                        ) - 1;

                        if (value == "$NULL" || value == "$$NULL") {

                            if (IS_NULLIFY_SYM)
                                replace(exp("null"));

                            else
                                replace(null, true);

                        } else {
                            if (index >= 100)
                                index = body.sym.length - 1;
                            replace(exp(`sym[${index}]`));
                        }
                    }
                }

                const js = renderCompressed(receiver.ast);

                if (!js) {
                    body.reduce_function = null;
                } else {

                    body.reduce_function.js = `(env, sym, pos)=>${js}`;
                }
            }
        }
    }
}
