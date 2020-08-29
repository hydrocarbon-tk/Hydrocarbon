import { stmt, renderCompressed, JSNodeType, exp } from "@candlefw/js";
import { traverse } from "@candlefw/conflagrate";
import { getValueID } from "./script_object_generator.js";

/**
 *
 *
 * @param function_string A function string to convert into an arrow function expression.
 */
export function generateCompactFunction(function_string: string) {

    let fn = stmt(function_string);

    fn.nodes[0] = null;

    const
        [, parameters, body] = fn.nodes,
        { nodes: params } = parameters,
        short_names = "_$ABCDEFGHI",
        ids = new Map(params.map((e, i) => {
            const node = getValueID(e);

            const value = node.value;

            node.value = short_names[i];

            return [value, { b: false, s: node.value }];
        }));

    for (const { node: id, meta: { skip } } of traverse(body, "nodes")
        .makeSkippable()) {

        if (id.type == JSNodeType.ArrowFunction) {
            skip();
            continue;
        }

        if (id.type == JSNodeType.IdentifierReference
            || id.type == JSNodeType.IdentifierReferenceProperty) {
            if (ids.has(id.value)) {

                const i = ids.get(id.value);

                i.b = true;
                if (id.type == JSNodeType.IdentifierReference)
                    id.value = i.s;
                else
                    id.value = `${id.value}:${i.s}`;
            }

        }
    }

    const last_index = [...ids.values()].reduce((r, v, i) => v.b && i > r ? i : r, -1);

    fn.nodes[1].nodes = params.slice(0, last_index + 1);

    if (body && body.nodes[0].type == JSNodeType.ReturnStatement) {
        const arrow = exp("(a,a)=>(a)");
        // arrow->  paren-> expression_list->  nodes
        if (fn.nodes[1].nodes.length == 1)
            arrow.nodes[0] = params[0];
        else
            arrow.nodes[0] = parameters;

        arrow.nodes[1].nodes[0] = body.nodes[0].nodes[0];

        fn = arrow;
    }

    return renderCompressed(fn);

}
