import { parser_factory } from "./parser/parser.js";

const { parser: skribble_parser } = parser_factory;
export function parser(string) {

    const { result, FAILED, error_message } = skribble_parser(string);

    if (FAILED) {
        throw new SyntaxError(error_message);
    }

    console.log(result);

    return result[0];
}

export function sk(templates: TemplateStringsArray, ...node_stack) {

    const nodes = node_stack;//.reverse();

    const env = { node_stack: node_stack.reverse(), grabTemplateNode: () => nodes.pop() };

    const str = templates.join("<<-- 2 -->>");

    const { result, FAILED, error_message } = skribble_parser(str, env);

    if (FAILED) {
        throw new SyntaxError(error_message);
    }


    console.log(result);

    return result[0];

}