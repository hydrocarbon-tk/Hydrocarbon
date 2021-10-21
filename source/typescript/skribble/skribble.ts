import { parser_factory } from "./parser/parser.js";
import { SKExpression, SKNode, SKStatement } from "./types/node.js";
import { skribble_mappings } from "./skribble_mappings.js";

const { parser: skribble_parser } = parser_factory;
export function parser(string) {

    const { result, FAILED, error_message } = skribble_parser(string);

    if (FAILED) {
        throw new SyntaxError(error_message);
    }

    return result[0];
}

function getType(strings, obj_nodes, node) {

    const type = typeof node;

    if (
        ["string", "number", "boolean", "BigInt"].includes(type)
    )
        strings.push(node.toString());
    else if (!node) { }
    else if (Array.isArray(node)) {
        for (const n of node)
            getType(strings, obj_nodes, n);
    } else {
        obj_nodes.push(node);
        strings.push("<<-- 2 -->>");
    }
}

export function sk(templates: TemplateStringsArray, ...node_stack): SKExpression | SKStatement | SKExpression[] {

    const strings = [templates[0]], obj_nodes = [];

    // Extract nodes that are objects and 
    // insert nodes that are strings or numbers
    for (let i = 0; i < node_stack.length; i++) {
        const node = node_stack[i];

        getType(strings, obj_nodes, node);

        strings.push(templates[i + 1]);
    }

    obj_nodes.reverse();

    const parse_string = strings.join("");
    const env = { node_stack: node_stack.reverse(), grabTemplateNode: () => obj_nodes.pop() };
    let result = null, FAILED = false, error_message = "";

    if (parse_string.match(/^[\s\n\t]*(\[[^\]]+\])?\s*fn ?/)?.length > 0) {
        //Function selection
        ({ result, FAILED, error_message } = skribble_parser(parse_string, env, 12));
        if (!FAILED) return result[0];
    } else if (parse_string.match(/^[\s\n\t]*(\[[^\]]+\])?\s*str /)?.length > 0) {
        //Struct selection
        ({ result, FAILED, error_message } = skribble_parser(parse_string, env, 11));
        if (!FAILED) return result[0];
    } else if (parse_string.match(/^[\s\n\t]*(\[[^\]]+\])?\s*cls /)?.length > 0) {
        //Class selection
        ({ result, FAILED, error_message } = skribble_parser(parse_string, env, 9));
        if (!FAILED) return result[0];
    } else if (parse_string.match(/^[\s\n\t]*ns ?/)?.length > 0) {
        //Namespace selection
        ({ result, FAILED, error_message } = skribble_parser(parse_string, env, 6));
        if (!FAILED) return result[0];
    } else {
        //Expression Statements
        ({ result, FAILED, error_message } = skribble_parser(parse_string, env, 18));

        if (!FAILED) {
            if (result[0].length < 1)
                return result[0];
            else
                return result[0][0];
        }
    }


    if (FAILED) {
        throw new SyntaxError(error_message);
    }

    return result;

}

import { experimentalConstructRenderers, experimentalRender } from "@candlelib/conflagrate";
import { NodeMappings } from "@candlelib/conflagrate/build/types/types/node_mappings";
import { ts_mappings } from "./ts_mappings.js";
import { js_mappings } from "./js_mappings.js";
import { cpp_mappings } from "./cpp_mappings.js";
import { cpp_declaration_mappings } from "./cpp_header_mappings.js";
import { cpp_definition_mappings } from "./cpp_source_mappings.js";
import { rust_mappings } from "./rust_mappings.js";

let renderers = null;
let ts_renderers = null;
let js_renderers = null;
let rust_renderers = null;
let cpp_renderers = null;
let cpp_decl_renderers = null;
let cpp_def_renderers = null;

export function skRenderAsSK(node: SKNode): string {
    if (!renderers)
        renderers = experimentalConstructRenderers(<NodeMappings<SKNode, "type">>skribble_mappings);
    return experimentalRender(node, <NodeMappings<SKNode, "type">>skribble_mappings, renderers).string;
}

export function skRenderAsTypeScript(node: SKNode): string {
    if (!ts_renderers)
        ts_renderers = experimentalConstructRenderers(<NodeMappings<SKNode, "type">>ts_mappings);
    return experimentalRender(node, <NodeMappings<SKNode, "type">>ts_mappings, ts_renderers).string;
}

export function skRenderAsJavaScript(node: SKNode): string {
    if (!js_renderers)
        js_renderers = experimentalConstructRenderers(<NodeMappings<SKNode, "type">>js_mappings);
    return experimentalRender(node, <NodeMappings<SKNode, "type">>js_mappings, js_renderers).string;
}

export function skRenderAsRust(node: SKNode): string {
    if (!rust_renderers)
        rust_renderers = experimentalConstructRenderers(<NodeMappings<SKNode, "type">>rust_mappings);
    return experimentalRender(node, <NodeMappings<SKNode, "type">>rust_mappings, rust_renderers).string;
}

export function skRenderAsCPP(node: SKNode): string {
    if (!cpp_renderers)
        cpp_renderers = experimentalConstructRenderers(<NodeMappings<SKNode, "type">>cpp_mappings);
    return experimentalRender(node, <NodeMappings<SKNode, "type">>cpp_mappings, cpp_renderers).string;
}

export function skRenderAsCPPDeclarations(node: SKNode): string {
    if (!cpp_decl_renderers)
        cpp_decl_renderers = experimentalConstructRenderers(<NodeMappings<SKNode, "type">>cpp_declaration_mappings);
    return experimentalRender(node, <NodeMappings<SKNode, "type">>cpp_declaration_mappings, cpp_decl_renderers).string;
}

export function skRenderAsCPPDefinitions(node: SKNode): string {
    if (!cpp_def_renderers)
        cpp_def_renderers = experimentalConstructRenderers(<NodeMappings<SKNode, "type">>cpp_definition_mappings);
    return experimentalRender(node, <NodeMappings<SKNode, "type">>cpp_definition_mappings, cpp_def_renderers).string;
}