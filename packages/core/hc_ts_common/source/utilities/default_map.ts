/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import URI from "@candlelib/uri";

await URI.server();

export const default_map = {
    "default-productions": URI.resolveRelative("../../../source/grammars/misc/default-productions.hcg", URI.getEXEURL(import.meta))
};
