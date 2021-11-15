export * from './compile/compile';
export * from './compile/resource_grammar';

export { buildItemMaps } from './passes/item_map';

import loader from "./parser/hcg_parser_pending";

export { render_grammar } from './passes/common';

export const { parse: parser, entry_points } = await loader;
