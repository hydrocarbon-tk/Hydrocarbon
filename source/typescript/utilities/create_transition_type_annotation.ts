/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { sk } from "../skribble/skribble.js";
import { SKExpression } from "../skribble/types/node.js";
import { RenderBodyOptions } from "../types/render_body_options";
import { TRANSITION_TYPE } from "../types/transition_node.js";
import { ttt } from "./transition_type_to_string.js";

export function createTransitionTypeAnnotation(options: RenderBodyOptions, transition_types: TRANSITION_TYPE[]): SKExpression {
    return <SKExpression>sk`"⤋⤋⤋  ${transition_types.map(ttt)} ⤋⤋⤋"`;
}
