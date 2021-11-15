import { GrammarObject } from '@hctoolkit/common';
export declare function createJSFunctionsFromExpressions(grammar: GrammarObject, error: any): {
    reduce_functions: Map<string, {
        id: number;
        data: any;
    }>;
    body_maps: number[];
};
export declare function addReduceFNStringToLUT(reduce_functions: Map<string, {
    id: number;
    data: any;
}>, txt?: string, data?: null): number;
