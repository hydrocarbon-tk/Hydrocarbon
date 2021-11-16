export * from './compile/compile';
export * from './compile/resource_grammar';
export { render_grammar } from './passes/common';
export { buildItemMaps } from './passes/item_map';
export { addRootScannerFunction, getSymbolProductionName } from './passes/scanner_production';
export { getProductionByName } from './nodes/common';

import loader from "./parser/hcg_parser_pending";

export const { parse: parser, entry_points } = await loader;
