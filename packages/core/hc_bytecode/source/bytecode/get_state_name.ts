/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { ProductionImportSymbol, ProductionSymbol, Token } from '@hc/common';

export function getStateName(
    name_candidate: ProductionSymbol | ProductionImportSymbol | string
): string {
    if (!name_candidate)
        return "";

    if (typeof name_candidate == "string")
        return name_candidate;

    if (name_candidate instanceof Token || "IS_TOKEN" in name_candidate)
        return name_candidate + "";

    return name_candidate.name;
}
