/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { ConstSC, ExprSC, JS, SC, VarSC } from "../utilities/skribble.js";

/**
 * A generated name that is unique to a specific sequence of code
 * and that is consistently and independently derived in any given 
 * worker thread.
 */
export type GlobalName = string;
export type ConstantName = string;
export type ConstantObj = { original_name: VarSC | ConstSC, name: VarSC | ConstSC, code_node: SC; };
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

    add_constant(const_name: VarSC | ConstSC, const_value: SC): VarSC | ConstSC {

        let global_name = const_name.type.value;

        let actual_name: VarSC | ConstSC = null;

        let value = const_name.type.val_type;

        if (!this.constant_map.has(global_name)) {

            this.unique_const_set.add(global_name);

            actual_name = SC[const_name.type.type == "constant" ? "Constant" : "Variable"](`${global_name}:${value}`);

            this.constant_map.set(global_name, { original_name: const_name, name: const_name, code_node: const_value, });

        } else {
            actual_name = this.constant_map.get(global_name).name;
        }

        return actual_name;
    }

    join_constant_map(const_map: Map<GlobalName, ConstantObj>) {

        for (const [global_name, { original_name, name, code_node }] of const_map.entries()) {
            if (!this.constant_map.has(global_name)) {
                this.add_constant(<any>SC.Bind(<any>original_name), SC.Bind(code_node));
            }
        }
    }
    render_constants(): { const: SC[], fn: SC[]; } {

        const code_fn_node = [], const_ty_node = [];

        for (const { name, code_node: node } of [...this.constant_map.values()].sort((a, b) => {
            return a.name.value < b.name.value ? -1 : b.name.value < a.name.value ? 1 : 0;
        })) {

            const bound_node = SC.Bind(node);

            if (bound_node.type.type == "function") {

                bound_node.expressions[0] = name;

                code_fn_node.push(bound_node);
            } else {

                const_ty_node.push(SC.Declare(SC.Assignment(name, <ExprSC>bound_node)));
            }
        }

        return { const: const_ty_node, fn: code_fn_node };
    }
}
export function constructCompilerRunner(ANNOTATED: boolean = false, DEBUG: boolean = false): Helper {
    return new Helper(ANNOTATED, DEBUG);
};
