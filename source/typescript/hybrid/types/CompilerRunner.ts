import { renderWithFormatting, JSNode, renderCompressed, JSNodeType, stmt } from "@candlefw/js";
import { traverse } from "@candlefw/conflagrate";
import { Lexer } from "@candlefw/wind";
import { LRState } from "./State.js";
import { Item } from "../../util/item.js";
import { Grammar } from "../../types/grammar.js";

export type ConstantValue = string;
export type ConstantName = string;
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
    constant_map: Map<ConstantValue, { name: ConstantName, type: string; }>;
    statements: Map<string, { name: string, val: string; }>;
    add_statement: (
        /**
         * 
         */
        hash: string, name: string, val: string) => string;
    /**
     * Facilitates dedup of constant values.
     * 
     * Add a global constant to the parser environment. 
     * Returns name to the constant. 
     */
    add_constant: (const_value: string, const_name?: string, type_annotation?: string) => string;
    render_constants: () => string;

    render_statements: () => string;

    join_constant_map: (const_map: Map<ConstantValue, { name: ConstantName, type: string; }>, dependent_string: string) => string;
}
export function constructCompilerRunner(ANNOTATED: boolean = false): CompilerRunner {
    let const_counter = 0, unique_const_set = new Set();
    const runner = <CompilerRunner>{
        INTEGRATE: new Set(),
        ANNOTATED,
        constant_map: new Map,
        statements: new Map,
        add_constant: (const_value: string, const_name: string = "const__", type_annotation: string = ""): string => {

            const id = const_value;

            let actual_name = const_name;

            if (!runner.constant_map.has(id)) {


                while (unique_const_set.has(actual_name))
                    actual_name = const_name + (const_counter++) + "_";

                unique_const_set.add(actual_name);

                runner.constant_map.set(id, { name: actual_name, type: type_annotation });

            } else {
                actual_name = runner.constant_map.get(id).name;
            }

            return actual_name;
        },
        join_constant_map(const_map: Map<ConstantValue, { name: ConstantName, type: string; }>, dependent_string: string): string {
            const intermediates = []; let intermediate_counter = 0;

            for (const [val, { name, type }] of const_map.entries()) {
                const int_name = `__${intermediate_counter++}__i`;

                if (runner.constant_map.has(val) && false) {
                    dependent_string = dependent_string.replace(RegExp(`${name}`, "g"), int_name);
                    intermediates.push([int_name, runner.constant_map.get(val).name]);

                    if (val == "[4/* nl */,1/* ws */]")
                        console.log({ actual_name: runner.constant_map.get(val).name, name, val, const_counter });
                } else {
                    let const_name = runner.add_constant(val, name, type);
                    if (name !== const_name) {
                        dependent_string = dependent_string.replace(RegExp(`${name}`, "g"), int_name);
                        intermediates.push([int_name, const_name]);
                    }
                }
            }
            for (const [int_name, real_name] of intermediates) {
                dependent_string = dependent_string.replace(RegExp(`${int_name}`, "g"), real_name);
            }

            return dependent_string;
        },
        add_statement: (hash, name, val) => {
            if (runner.statements.has(hash)) {
                return runner.statements.get(hash).name;
            } else {
                runner.statements.set(hash, { name, val });
            }
            return name;
        },
        render_constants: () => {
            const constants = [...runner.constant_map.entries()]
                .map(([val, { name, type }], i) => `${name}${type ? ":" + type : ""} = ${val}`);

            if (constants.length > 0)
                return `const ${constants.join(",\n")};`;
            return "";
        },
        render_statements: () => {
            const statements = [...runner.statements.values()]
                .map(({ name, val }, i) => `${val}`);

            if (statements.length > 0)
                return `${statements.join(";\n")};`;
            return "";
        },
    };

    return runner;
}
