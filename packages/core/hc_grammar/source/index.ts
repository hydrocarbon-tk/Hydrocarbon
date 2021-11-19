export * from './compile/compile.js';
export * from './compile/resource_grammar.js';
export { render_grammar } from './passes/common.js';
export { buildItemMaps } from './passes/item_map.js';
export { addRootScannerFunction, getSymbolProductionName } from './passes/scanner_production.js';
export { getProductionByName } from './nodes/common.js';

import loader from "./parser/hcg_parser_pending.js";

export const { parse: parser, entry_points } = await loader;
