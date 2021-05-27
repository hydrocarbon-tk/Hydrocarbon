import { NodeMappings } from "@candlelib/conflagrate/build/types/types/node_mappings";
import { HCG3GrammarNode } from "../types/grammar_nodes";

const hcg3_mappings: NodeMappings<HCG3GrammarNode, "type"> = <NodeMappings<HCG3GrammarNode, "type">>{
    typename: "type",
    type_lookup: () => 0,
    mappings: [
        { type: "null", template: "tempster" },
        {
            type: "hc-grammar-3", child_keys: ["preamble", "productions", "function"],
            template: "\\#HCG3 o:n @preamble...[o:n] o:n @productions"
        },
        {
            type: "production-import", child_keys: ["bodies"],
            template: "production"
        },
        {
            type: "production", child_keys: ["bodies"],
            template: "production"
        },
        {
            type: "production-merge", child_keys: ["bodies"],
            template: "production"
        },
        {
            type: "production-merge-import", child_keys: ["bodies"],
            template: "production"
        },
        {
            type: "body", child_keys: ["symbols"],
            template: "@symbols... [m:s] {reduce: @reduce}"
        },
        {
            type: "comment",
            template: "comment"
        },
        {
            type: "import", child_keys: ["symbols"],
            template: "import"
        },
        {
            type: "ignore", child_keys: ["symbols"],
            template: "ignore"
        },
        {
            type: "symbol",
            template: "\\\\ @value m:s"
        },
        {
            type: "eof",
            template: "\\$eof "
        },
        {
            type: "empty",
            template: "\\$empty"
        },
        {
            type: "generated",
            template: "\\g: @value"
        },
        {
            type: "literal",
            template: "\\t: @value"
        },
        {
            type: "production-token",
            template: "\\tk: @value"
        },
        {
            type: "sym-production",
            template: "@value"
        },
        {
            type: "sym-production-import",
            template: "$module \\:: $production"
        },
        {
            type: "group-production",
            template: "\\( i:s o:n m:s  @value...[ o:n \\| m:s ] i:e o:n \\)"
        },
        {
            type: "list-production",
            template: "@value... \\(+  { terminal_symbol : @terminal_symbol }   \\)"
        },

        {
            type: "RETURNED",
            template: "m:s \\f:\\r\\{ o:s i:s o:n @txt o:s i:e o:n \\} "
        }
    ]
};

const lu_table = new Map(hcg3_mappings.mappings.map((i, j) => [i.type, j]));

hcg3_mappings.type_lookup = (node, name) => (lu_table.get(name) || -1);

export { hcg3_mappings };