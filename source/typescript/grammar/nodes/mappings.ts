/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { NodeMapping, NodeMappings } from "@candlelib/conflagrate/build/types/types/node_mappings";
import { GrammarObject, ReferencedFunction, MetaExcludeSymbol } from "../../types/";

const hcg3_mappings: NodeMappings<ReferencedFunction, "type"> = <NodeMappings<ReferencedFunction, "type">>{
    typename: "type",
    type_lookup: () => 0,
    mappings: [
        { type: "null", template: "tempster @type" },

        <NodeMapping<GrammarObject>>{
            type: "hc-grammar-5",
            child_keys: ["preamble", "productions", "function"],
            template: "\\#Hydrocarbon m:s Grammar m:s Version m:s 5 m:n m:n @preamble...[o:n] o:n @productions...[m:n m:n]"
        },
        <NodeMapping<MetaExcludeSymbol>>{
            type: "meta-exclude", child_keys: ["sym"],
            template: "\\(EXC m:s @sym...[m:s] m:s \\)"
        },
        {
            type: "production-import", child_keys: ["bodies"],
            template: "production"
        },
        {
            type: "production", child_keys: ["bodies"],
            template: "\\<> { priority: \\! } m:s @name m:s \\> { bodies[1] : i:s m:n m:s m:s @bodies...[ m:n | m:s ] i:e or m:s @bodies...[m:s] }"
        },
        {
            type: "scanner-production", child_keys: ["bodies"],
            template: "\\<> m:s /* scanner */ { priority: \\! } m:s @name m:s \\> { bodies[1] : i:s m:n m:s m:s @bodies...[ m:n | m:s ] i:e or m:s @bodies...[m:s] }"
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
            type: "body", child_keys: ["sym"],
            template: "{ priority: \\! } @sym...[ m:s ] {reduce_function: @reduce_function}"
        },
        {
            type: "comment",
            template: "@txt"
        },
        {
            type: "import", child_keys: ["sym"],
            template: "import"
        },
        {
            type: "ignore", child_keys: ["sym"],
            template: "ignore"
        },
        {
            type: "symbol",
            template: "l: @val m:s"
        },
        {
            type: "eof",
            template: "\\$eof "
        },
        {
            type: "empty",
            template: "\\$empty "
        },
        {
            type: "generated",
            template: "\\g: @val"
        },
        {
            type: "literal",
            template: "\\l: @val m:s"
        },
        {
            type: "exclusive-literal",
            template: "\\t: @val m:s"
        },

        {
            type: "production-token",
            template: "\\tk: @val"
        },
        {
            type: "production_token",
            template: "\\tk: @name"
        },
        {
            type: "sym-production",
            template: "@name"
        },
        {
            type: "sym-production-import",
            template: "@module \\:: @name "
        },
        {
            type: "group-production",
            template: "\\( i:s o:n m:s  @val...[ o:n \\| m:s ] i:e o:n \\)"
        },
        {
            type: "list-production",
            template: "@val... \\(+  { terminal_symbol : @terminal_symbol }   \\)"
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