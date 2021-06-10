/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { debug } from "console";
import { SKExpression, SKFunction, SKNode, SKPrimitiveDeclaration, SKReference } from "../skribble/types/node.js";
const SC = null;
/**
 * A generated name that is unique to a specific sequence of code
 * and that is consistently and independently derived in any given 
 * worker thread.
 */
export type GlobalName = string;
export type ConstantName = string;
export type ConstantObj = { original_name: SKPrimitiveDeclaration, name: SKReference, code_node: SKNode; };
export class Helper {

    /**
    * Item and state comments will be added to the output.
    */
    ANNOTATED: boolean;

    /**
     * Add debug tracing code to output.
     */
    DEBUG: boolean;
    constant_map: Map<GlobalName, ConstantObj>;


    /**
     * The ids of all production functions that are called.
     */
    referenced_production_ids: Set<number>;

    const_counter: number;

    unique_const_set: Set<string>;

    constructor(ANNOTATED: boolean = false, DEBUG: boolean = false) {
        this.ANNOTATED = ANNOTATED;
        this.DEBUG = DEBUG;
        this.constant_map = new Map;
        this.referenced_production_ids = new Set;
        this.const_counter = 0;
        this.unique_const_set = new Set();
    }

    add_constant(const_name: SKPrimitiveDeclaration, const_value: SKNode): SKReference {

        let global_name = const_name.name;

        let actual_name: SKReference = null;

        let value = const_name.primitive_type;

        if (!this.constant_map.has(global_name.value)) {

            this.unique_const_set.add(global_name.value);

            actual_name = <SKReference>Object.assign({}, global_name, { type: "reference" });

            this.constant_map.set(global_name.value, { original_name: const_name, name: actual_name, code_node: const_value, });

        } else {
            actual_name = this.constant_map.get(global_name.value).name;
        }

        return actual_name;
    }

    join_constant_map(const_map: Map<GlobalName, ConstantObj>) {

        for (const [global_name, { original_name, name, code_node }] of const_map.entries()) {
            if (!this.constant_map.has(global_name)) {
                this.add_constant(original_name, code_node);
            }
        }
    }
    render_constants(): { const: SKPrimitiveDeclaration[], fn: SKFunction[]; } {

        const code_fn_node = [], const_ty_node = [];

        for (const { name, code_node: node, original_name } of [...this.constant_map.values()].sort((a, b) => {
            return a.name.value < b.name.value ? -1 : b.name.value < a.name.value ? 1 : 0;
        })) {

            if (node.type == "function") {

                node.name.value = name;

                code_fn_node.push(node);
            } else {

                const declaration: SKPrimitiveDeclaration = Object.assign({}, original_name);

                declaration.init = <SKExpression>node;

                const_ty_node.push(declaration);
            }
        }

        return { const: const_ty_node, fn: code_fn_node };
    }
}
export function constructCompilerRunner(ANNOTATED: boolean = false, DEBUG: boolean = false): Helper {
    return new Helper(ANNOTATED, DEBUG);
};
