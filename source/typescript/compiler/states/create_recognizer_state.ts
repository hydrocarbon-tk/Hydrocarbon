import { RecognizerState, TRANSITION_TYPE } from "../../types/recognizer_state.js";
import { Symbol } from "../../types/symbol.js";
import { Item } from "../../utilities/item.js";

export function createRecognizerState(
    items: Item[],
    symbols: Symbol[],
    transition_type: TRANSITION_TYPE,
    offset: number = -1,
    peek_level: number = -1,
    UNRESOLVED_LEAF: boolean = false
): RecognizerState {
    return <RecognizerState>{
        UNRESOLVED_LEAF: UNRESOLVED_LEAF,
        PROCESSED: false,
        code: null,
        hash: "",
        symbols,
        transition_type,
        items,
        offset,
        peek_level,
        states: []
    };
}
