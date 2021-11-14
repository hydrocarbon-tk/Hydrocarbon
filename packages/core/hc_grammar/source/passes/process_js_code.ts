/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { traverse } from "@candlelib/conflagrate";
import { exp, JSNodeClass, JSNodeType, renderCompressed } from "@candlelib/js";
import { ir_reduce_numeric_len_id } from '../../utilities/magic_numbers.js';
import { ReferencedFunction, GrammarObject, ProductionFunction, HCG3Symbol } from "../../types/grammar_nodes";
import { InstructionType, IR_Instruction } from '../../types/ir_types';


export function createJSFunctionsFromExpressions(grammar: GrammarObject, error) {
    // Reset the reduce_functions lookup to prepare the grammar for output
    // to JavaScript/TypeScript format. 
    const reduce_functions = <Map<string, { id: number; data: any; }>>new Map();
    const body_maps = [];

    for (const production of grammar.productions) {

        if (production.type == "scanner-production")
            continue;

        for (const body of production.bodies) {


            const { fn, js } = processReduceFunction(body.reduce_function, body.sym);


            if (js) {
                body_maps[body.id] = addReduceFNStringToLUT(reduce_functions, js);
            } else {
                body_maps[body.id] = 0;
            }
        }
    }

    for (const ir_state of grammar.ir_states) {
        processIRReduce(ir_state.instructions, grammar);
        let fail_state = ir_state.fail;

        while (fail_state) {
            processIRReduce(fail_state.instructions, grammar);
            fail_state = fail_state.fail;
        }
    }

    return { reduce_functions, body_maps };

}

function processIRReduce(instructions: IR_Instruction[], grammar: GrammarObject) {
    for (const instruction of instructions) {
        switch (instruction.type) {
            case InstructionType.assert:
            case InstructionType.peek:
            case InstructionType.prod:
                processIRReduce(instruction.instructions, grammar);
                break;

            case InstructionType.reduce:

                if (typeof instruction.reduce_fn != "number") {

                    const { js } = processReduceFunction(instruction.reduce_fn);

                    if (!js)
                        instruction.reduce_fn = 0;

                    else
                        instruction.reduce_fn = addReduceFNStringToLUT(grammar, js) + 1;

                    instruction.len = ir_reduce_numeric_len_id >>> 0;
                }
                break;
        }
    }
}

function processReduceFunction(
    fn: ProductionFunction | ReferencedFunction | ReferencedFunction,
    syms: HCG3Symbol[] = []
) {

    let js = "";

    const sym_length = syms.length;

    if (fn) {


        if (fn.type == "env-function-reference") {
            //@ts-ignore
            js = fn.js = `(env, sym, tok)=> env.functions.${fn.ref} (env, sym, tok)`;
            //@ts-ignore
        } else if (!fn.txt) {
            fn = null;
        } else {
            const txt = `(${fn.txt.replace(/(\${1,2}\d+)/g, "$1_")})`;
            //@ts-ignore
            const expression = exp(txt);

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

                        if (
                            (parent.type &
                                (
                                    JSNodeClass.UNARY_EXPRESSION
                                    | JSNodeClass.TERNARY_EXPRESSION
                                )


                                || parent.type == JSNodeType.AssignmentExpression
                                || parent.type == JSNodeType.PropertyBinding
                                || parent.type == JSNodeType.VariableStatement
                                || parent.type == JSNodeType.BindingExpression
                                || parent.type == JSNodeType.MemberExpression
                                || parent.type == JSNodeType.SpreadExpression
                                || parent.type == JSNodeType.Parenthesized
                                || parent.type == JSNodeType.ExpressionStatement)
                        )
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

                    const val = IS_NULLIFY_SYM ?
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
                                    replace(exp(`(sym[${0}].push(sym[${sym_length - 1}]), sym[${0}])`));
                                    break;
                                case "string_create":
                                    replace(exp(`sym[${0}] + ""`));
                                    break;
                                case "string_join":
                                    replace(exp(`sym[${0}] + sym[${sym_length - 1}]`));
                                    break;

                                default: {
                                    for (let i = 0; i < sym_length; i++) {
                                        const sym = syms[i];

                                        if (sym.annotation && sym.annotation.val == val) {
                                            index = i;
                                            break;
                                        }
                                    }

                                    if (isNaN(index)) {
                                        if (IS_NULLIFY_SYM)
                                            replace(exp("null"));
                                        else
                                            replace(null, true);
                                    }
                                }
                            }
                        }

                        if (!isNaN(index)) {

                            if (index >= 100)
                                index = sym_length - 1;
                            replace(exp(`sym[${index}]`));
                        }
                    }
                }
            }

            const text = renderCompressed(receiver.ast);

            if (text)
                js = `(env, sym, tok)=> ${text} `;
            else js = "";
        }
    }

    return { fn, js };
}

export function addReduceFNStringToLUT(
    reduce_functions: Map<string, { id: number; data: any; }>,
    txt: string = null,
    data = null
): number {

    if (txt) {

        if (!reduce_functions.has(txt))
            reduce_functions.set(txt, { id: reduce_functions.size, data });

        return reduce_functions.get(txt).id;

    } else
        return -1;
}
