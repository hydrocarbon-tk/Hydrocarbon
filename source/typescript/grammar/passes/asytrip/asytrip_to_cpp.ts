import { GrammarObject } from '../../../types/grammar_nodes';
import { ASYTRIPContext } from './types';

export function createCPPTypes(grammar: GrammarObject, context: ASYTRIPContext) {
    console.log("--------------- CPP ------------------");

    //Types
    const class_type_name = `GRAMMARCLASS`;
    const types_type_name = `GRAMMARTYPE`;
    const value_type = "unsigned int";
    const class_type = `enum class ${class_type_name} : ${value_type} {\n    ${[...context.class].map(([name, value]) => {
        return `${name} = ${value}`;
    }).join(",\n    ")},\n};`;

    const type_type = `enum class ${types_type_name} : ${value_type} {\n    ${[...context.type].map(([name, value]) => {
        return `${name}  = ${value}`;
    }).join(",\n    ")},\n};`;

    console.log(class_type);
    console.log(type_type);



    //Expression Functions

    //Dedup

    //pack
}