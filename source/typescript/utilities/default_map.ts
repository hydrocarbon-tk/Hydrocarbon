/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import URL from "@candlefw/url";

await URL.server();

export const default_map = {
    "default-productions": URL.resolveRelative("../../../../source/grammars/misc/default-productions.hcg", URL.getEXEURL(import.meta))
};
