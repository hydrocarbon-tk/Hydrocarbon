import URL from "@candlefw/url";

await URL.server();

export const default_map = {
    "default-productions": URL.resolveRelative("../../../../source/grammars/misc/default-productions.hcg", URL.getEXEURL(import.meta))
};
