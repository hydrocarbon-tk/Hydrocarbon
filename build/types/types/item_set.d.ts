import { Item } from "../util/item.js";
export declare type ItemSet = {
    items: Array<Item>;
    state_id: {
        id: string;
        sym: string;
    };
    excludes: Array<string>;
};
