import { GrammarObject } from '../../../types/grammar_nodes';
import { ASYTRIPContext } from './types';

export function createRustTypes(grammar: GrammarObject, context: ASYTRIPContext) {
    console.log("--------------- RUST ------------------");

    //Types
    const class_type_name = `GRAMMARCLASS`;
    const types_type_name = `GRAMMARTYPE`;
    const value_type = "u32";
    const class_type = `enum ${class_type_name} {\n    ${[...context.class].map(([name, value]) => {
        return `${name}: ${value_type} = ${value}`;
    }).join(",\n    ")},\n}`;

    const type_type = `enum ${types_type_name} {\n    ${[...context.type].map(([name, value]) => {
        return `${name}: ${value_type}  = ${value}`;
    }).join(",\n    ")},\n}`;

    console.log(class_type);
    console.log(type_type);


    //Expression Functions

    //Dedup

    //pack
}