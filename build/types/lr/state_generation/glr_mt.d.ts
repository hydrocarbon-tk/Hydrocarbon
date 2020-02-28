import { LRState } from "../../types/LRState.js";
export default function (grammar: any, env: any, env_path: any): Generator<{
    errors: any;
    states: Map<string, LRState>;
    num_of_states: number;
    total_items: number;
    items_left: number;
    COMPLETE: boolean;
} | {
    errors: any;
    states: import("../../types/LRState.js").LRStates;
    num_of_states: number;
    total_items: number;
    items_left: number;
    COMPLETE: boolean;
} | {
    errors: {
        strings: any[];
    };
    states: {
        COMPILED: boolean;
    };
    num_of_states: number;
    total_items: number;
    items_left: number;
    COMPLETE: boolean;
}, any, unknown>;
