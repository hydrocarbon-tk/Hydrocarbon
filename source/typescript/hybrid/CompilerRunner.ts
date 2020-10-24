import { renderWithFormatting, JSNode, renderCompressed, JSNodeType, stmt } from "@candlefw/js";
import { traverse } from "@candlefw/conflagrate";
import { Lexer } from "@candlefw/wind";
import { State } from "./State.js";
import { Item } from "../util/item.js";
import { Grammar } from "../types/grammar.js";
export interface CompilerRunner {
    /** List of external grammar names to integrate into the parser.
     * Names must match the name following the `as` terminal in an `IMPORT` statement.
     * Any grammars with names not present in this set will be referenced as 
     * an external variable.
    */
    INTEGRATE: Set<string>;
    /**
     * If true item and state annotations
     * will be generated in the output.
     */
    ANNOTATED: boolean;
    function_map: Map<any, any>;
    constant_map: Map<any, any>;
    /**
     * Add a constant expression to list of constants
     * that may be mapped to variables
     */
    add_constant: (constant: JSNode) => JSNode;
    update_constants: () => void;
    render_constants: () => string;
    add_script: (body: JSNode[], fn: JSNode, call_append: string, state: State) => JSNode[];
    update_nodes: () => void;
    createAnnotationJSNode: (label: string, grammar: Grammar, ...items: Item[]) => string;
    render_functions: () => string;
}
export function constructCompilerRunner(ANNOTATED: boolean = false): CompilerRunner {
    const runner = <CompilerRunner>{
        INTEGRATE: new Set(),
        ANNOTATED,
        createAnnotationJSNode: function (label: string, grammar: Grammar, ...items: Item[]) {
            return `log(\`▎\${glp(l)} ->\${str.slice(l.off, l.off+l.tl)} ▎${label} ▎${items.setFilter(i => i.id).map(i => i.renderUnformattedWithProduction(grammar)).join(" | ")}\`, {l})`;
        },
        function_map: new Map,
        constant_map: new Map,
        add_constant: (constant: JSNode): JSNode => {

            const id = renderCompressed(constant);

            if (!runner.constant_map.has(id)) {
                runner.constant_map.set(id, {
                    data: id,
                    nodes: [constant]
                });
            } else {
                runner.constant_map.get(id).nodes.push(constant);
            }

            return constant;
        },
        update_constants: () => {
            let i = 0;
            for (const constant of runner.constant_map.values()) {
                if (constant.nodes.length > 1) {
                    const name = "_" + i++;
                    //convert each node to a call
                    for (const node of constant.nodes)
                        Object.assign(node, {
                            type: JSNodeType.Identifier,
                            value: name,
                            nodes: []
                        });
                }
            }
        },
        render_constants: () => {
            const constants = [...runner.constant_map.values()]
                .filter(e => e.nodes.length > 1)
                .map((e, i) => `_${i} = ${e.data}`);

            if (constants.length > 0)
                return `const ${constants.join(",")};`;
            return "";
        },
        add_script: (body: JSNode[], fn: JSNode, call_append: string = "", state: State): JSNode[] => {
            if (body.length == 0)
                return [];

            const
                node: JSNode = {
                    type: JSNodeType.Module,
                    nodes: body,
                    pos: null
                }, id = renderCompressed(node);


            if (!runner.function_map.has(id)) {
                fn.nodes[2].nodes.unshift(...body);

                const name = "$_" + runner.function_map.size,
                    arg_id = [...traverse(fn.nodes[1] || null, "nodes").filter("type", JSNodeType.IdentifierBinding)].map(s => s.node.value);

                fn.nodes[0] = {
                    type: JSNodeType.Identifier,
                    value: name,
                    nodes: null,
                    pos: null,
                };

                runner.function_map.set(id, {
                    name,
                    call_append,
                    arg_id,
                    fn,
                    body,
                    nodes: [node],
                    states: [state]
                });
            }
            else {
                runner.function_map.get(id).nodes.push(node);
                runner.function_map.get(id).states.push(state);
            }

            return [node];
        },
        update_nodes: () => {
            for (const fn of runner.function_map.values()) {
                if (fn.nodes.length > 1) {
                    // Move 
                    const call = stmt(`${fn.call_append}${fn.name}(${fn.arg_id.join(",")})`);
                    //convert each node to a call
                    for (const node of fn.nodes)
                        Object.assign(node, call);
                }
            }
        },
        render_functions: () => {
            return [...runner.function_map.values()]
                .filter(e => e.nodes.length > 1)
                .filter(e => e.states.length > 1)
                .filter(e => e.states.reduce((a, s) => s.REACHABLE || a, false))
                .map(e => renderWithFormatting(e.fn)).join("\n\n");
        },

    };

    return runner;
}
