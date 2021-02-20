/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { TRANSITION_TYPE } from "../types/transition_node.js";
import { RenderBodyOptions } from "../types/render_body_options";
import { SC } from "./skribble.js";
import { ttt } from "./transition_type_to_string.js";

export function createTransitionTypeAnnotation(options: RenderBodyOptions, transition_types: TRANSITION_TYPE[]): any {
    return options.helper.ANNOTATED
        ? SC.Comment("⤋⤋⤋ " + transition_types.map(ttt) + " ⤋⤋⤋")
        : undefined;
}
