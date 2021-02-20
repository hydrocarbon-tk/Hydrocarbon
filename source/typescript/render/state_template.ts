/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { rec_state } from "../utilities/global_names.js";
import { SC } from "../utilities/skribble.js";

const this_flags = SC.Member(SC.This(), "flags:unsigned int");

export const createStateCode = (): SC => {
    return (new SC).addStatement(
        /**
         *  function createState(ENABLE_STACK_OUTPUT) {
                const IS_STATE_VALID = 1;
                return IS_STATE_VALID | ENABLE_STACK_OUTPUT << 1;
            }
         */
        SC.Function(
            "createState:unsigned int",
            "ENABLE_STACK_OUTPUT:unsigned int"
        ).addStatement(
            SC.Declare(SC.Assignment(SC.Constant("IS_STATE_VALID:unsigned int"), 1)),
            SC.UnaryPre(SC.Return, SC.Binary("IS_STATE_VALID", "|", SC.Binary("ENABLE_STACK_OUTPUT", "<<", "1")))
        ),
        SC.Function(
            "hasStateFailed:boolean",
            rec_state
        ).addStatement(
            SC.Declare(SC.Assignment(SC.Constant("IS_STATE_VALID:unsigned int"), 1)),
            SC.UnaryPre(SC.Return, SC.Binary(0, "==", SC.Binary("state", "&", "IS_STATE_VALID")))
        ),
        SC.Function(
            "isOutputEnabled:boolean",
            rec_state
        ).addStatement(
            SC.UnaryPre(SC.Return, SC.Binary(0, "<", SC.Binary("state", "&", "0x2")))
        )
    );
};