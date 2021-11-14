export * from './compile';

export { buildItemMaps } from './passes/item_map';

import loader from "./hcg_parser_pending";

export const { parse: parser, entry_points } = await loader;
