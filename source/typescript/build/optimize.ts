/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Logger } from '@candlelib/log';
import { Token } from '../runtime/token.js';
import { GrammarObject, ProductionImportSymbol, ProductionSymbol } from '../types/grammar_nodes';
import { IRStateData, StateAttrib, StateMap } from '../types/ir_state_data';
import { InstructionType, IRAssert, IRGoto, IRInlineAssert, IRPeek, IRSetProd, IRBranch, IR_Instruction, IR_State, Resolved_IR_State, IRProdAssert, BranchIRState } from '../types/ir_types';
import { renderIRNode } from './render_ir_state.js';

function getStateName(
    name_candidate: ProductionSymbol | ProductionImportSymbol | string
): string {
    if (!name_candidate) return "";

    if (name_candidate instanceof Token)
        return name_candidate + "";

    if (typeof name_candidate == "string")
        return name_candidate;

    return name_candidate.name;
}

const optimize_logger = Logger.get("MAIN").createLogger("OPTIMIZER");

type OptimizationFunction = (state: Resolved_IR_State, attribute: StateAttrib, data: IRStateData, states: StateMap) => boolean;

const optimizations: Optimization[] = [];


type Optimization = {
    name: string;
    processor: OptimizationFunction;
};

function addOptimization(
    fn: Optimization
) {
    optimizations.push(fn);
}

function runOptimizations(state: IRStateData, states: StateMap) {
    const { attributes, ir_state_ast, } = state;

    const { id } = ir_state_ast;

    const root_id = id;

    let MODIFIED = false;

    for (const optimization of optimizations)
        MODIFIED ||= optimization.processor(
            ir_state_ast, attributes, state, states
        );

    return MODIFIED;
}

addOptimization({
    name: "Goto Inline",
    processor: (
        state: Resolved_IR_State,
        attribute: StateAttrib,
        data: IRStateData,
        states: StateMap
    ): boolean => {
        let MODIFIED = false;
        /**
         * Goto Dereference:
         * 
         * Keynote: Goto instructions MUST be order AFTER instructions of other types.
         *      The order of a goto instruction implies the execution order of the goto 
         *      states, with the FIRST goto state execution immediately after the current
         *      state, and with SECOND executing after the completion of the FIRST, and
         *      so on and so forth.
         * 
         * A goto may be dereferenced if one several conditions are met.
         * 
         * - The GOTO to be dereferenced is the FIRST goto within a sequence goto instructions.
         * 
         * - The GOTO state to be merged is one of:
         *      - Plain
         *      - Single assert branch with branching types that:
         *            Matches the host branch type and ids
         *            or
         *            Have fewer than 3 asserts 
         *      
         *        
         */
        const progressions = [["Before ----\n", renderIRNode(state), "\n"]];

        if (stateIsBranch(state)) {

            for (const instruction of state.instructions) {

                if (IsPeekInstruction(instruction)) {
                    const instructions = instruction.instructions;
                    const instruction_length = instruction.instructions.length;
                    const IS_POST_CONSUME = ContainsConsume(instruction);
                    const first_goto = getFirstGoto(instructions);
                    if (first_goto) {
                        const { ir_state_ast: goto_state } = getGotState(first_goto, states);

                        if (!HasFailState(goto_state)) {

                        }
                    }
                } else if (IsAssertInstruction(instruction)) {

                    const instructions = instruction.instructions;
                    const instruction_length = instruction.instructions.length;
                    const IS_POST_CONSUME = ContainsConsume(instruction);
                    const first_goto = getFirstGoto(instructions);

                    if (first_goto) {

                        const { ir_state_ast: goto_state } = getGotState(first_goto, states);

                        if (!HasFailState(goto_state)) {
                            if (stateIsBranch(goto_state)) {
                                if (goto_state.instructions.length == 1) {
                                    const branch = goto_state.instructions[0];
                                    if (IsAssertInstruction(branch)) {
                                        if (!IS_POST_CONSUME && BranchSignaturesMatch(branch, instruction)) {
                                            progressions.push(["INLINED ----\n", renderIRNode(goto_state), "\n"]);
                                            replaceGoto(instructions, states, true);
                                            MODIFIED = true;
                                        } else {
                                            progressions.push(["INLINED ----\n", renderIRNode(goto_state), "\n"]);
                                            replaceGoto(instructions, states, false);
                                            MODIFIED = true;
                                        }
                                    }
                                }
                            } else {
                                replaceGoto(instructions, states, false);
                                MODIFIED = true;
                            }
                        }
                    }
                }
            }
        } else {

        }
        if (MODIFIED) {
            //for (const prog of progressions)
            //    console.log(...prog);
            //console.log("AFTER ----\n", renderIRNode(state), "\n");
        }

        return MODIFIED;
    }
});

addOptimization({
    name: "Production Unroll",
    processor: (
        state: Resolved_IR_State,
        attribute: StateAttrib,
        data: IRStateData,
        states: StateMap
    ): boolean => {
        let MODIFIED = false;
        /**
         * Production Unroll
         * 
         * If a sequence of instructions is in state where the last and only goto 
         * instruction points to a state that has production assertions, and 
         * the penultimate instruction is a production assignment there may be 
         * an opportunity to merge the appropriate production branch state into 
         * the existing production.
         */
        const progressions = [["Before ----\n", renderIRNode(state), "\n"]];


        if (IsProductionBranchState(state)) {
            for (const instruction of <IRProdAssert[]>state.instructions) {

                const block = instruction.instructions;

                if (getNumberOfGotos(block) == 1) {

                    const first_goto_index = firstGotoIndex(block);

                    if (first_goto_index > 0) {

                        const penultimate = block[first_goto_index - 1];

                        if (IsProductionAssignment(penultimate)) {

                            const prod = <number>penultimate.id;

                            const first_goto = getFirstGoto(block);

                            const goto_state = getGotState(first_goto, states).ir_state_ast;

                            if (IsProductionBranchState(goto_state)) {
                                for (const branch of <IRProdAssert[]>goto_state.instructions) {
                                    if (branch.ids.includes(prod)) {
                                        if (branch == instruction) {
                                            progressions.push(["REPEATED ----\n", renderIRNode(goto_state), "\n"]);
                                            //Replace goto with repeat
                                            block.splice(first_goto_index, 1, {
                                                type: InstructionType.repeat,
                                                tok: first_goto.tok
                                            });
                                            MODIFIED = true;
                                        } else {
                                            progressions.push(["INLINED ----\n", renderIRNode(goto_state), "\n"]);
                                            //Remove goto AND prod set as this is now redudant
                                            block.splice(first_goto_index, 1,
                                                ...mapInlinedInstructions(
                                                    branch.instructions, goto_state
                                                )
                                            );
                                            MODIFIED = true;
                                        }

                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }

        } else {

            const instruction_blocks: IR_Instruction[][] = [];

            if (stateIsBranch(state)) {
                for (const instruction of state.instructions) {
                    if (IsPeekInstruction(instruction) || IsAssertInstruction(instruction))
                        instruction_blocks.push(instruction.instructions);
                }
            } else {
                instruction_blocks.push(state.instructions);
            }

            for (const block of instruction_blocks) {

                if (getNumberOfGotos(block) == 1) {

                    const first_goto_index = firstGotoIndex(block);

                    if (first_goto_index > 0) {

                        const penultimate = block[first_goto_index - 1];

                        if (IsProductionAssignment(penultimate)) {

                            const prod = <number>penultimate.id;

                            const first_goto = getFirstGoto(block);

                            const goto_state = getGotState(first_goto, states).ir_state_ast;

                            if (IsProductionBranchState(goto_state) && !HasFailState(goto_state)) {
                                for (const branch of <IRProdAssert[]>goto_state.instructions) {
                                    if (branch.ids.includes(prod)) {

                                        progressions.push(["INLINED ----\n", renderIRNode(goto_state), "\n"]);
                                        //Remove goto AND prod set as this is now redudant
                                        block.splice(first_goto_index, 1,
                                            ...mapInlinedInstructions(
                                                branch.instructions, goto_state
                                            )
                                        );
                                        MODIFIED = true;

                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        if (MODIFIED) {
            //for (const prog of progressions)
            //    console.log(...prog);
            //console.log("AFTER ----\n", renderIRNode(state), "\n");
            ////debugger;
        }

        return MODIFIED;
    }
});




addOptimization({
    name: "Remove Redundant Instructions",
    processor: (
        state: Resolved_IR_State,
        attribute: StateAttrib,
        data: IRStateData,
        states: StateMap
    ): boolean => {

        let MODIFIED = false;

        const progressions = [["Before ----\n", renderIRNode(state), "\n"]];

        const instruction_blocks: IR_Instruction[][] = [];

        if (stateIsBranch(state)) {
            for (const instruction of state.instructions) {
                if (IsPeekInstruction(instruction) || IsAssertInstruction(instruction))
                    instruction_blocks.push(instruction.instructions);
            }
        } else {
            instruction_blocks.push(state.instructions);
        }

        for (const block of instruction_blocks) {
            let prod_assignments = block.filter(IsProductionAssignment).length;
            if (prod_assignments > 1) {
                for (let i = 0, j = 0; i < block.length, j < (prod_assignments - 1); i++) {
                    if (IsProductionAssignment(block[i])) {
                        j++;
                        block.splice(i--, 1);
                    }
                }
                MODIFIED = true;
            }
        }


        if (MODIFIED) {
            // for (const prog of progressions)
            //     console.log(...prog);
            // console.log("AFTER ----\n", renderIRNode(state), "\n");
            // debugger;
        }

        return MODIFIED;
    }
});

addOptimization({
    name: "Remove redundant assert",
    processor: (
        state: Resolved_IR_State,
        attribute: StateAttrib,
        data: IRStateData,
        states: StateMap
    ): boolean => {

        let MODIFIED = false;

        const progressions = [["Before ----\n", renderIRNode(state), "\n"]];

        if (stateIsBranch(state)) {
            const instr = state.instructions[0];
            if (state.instructions.length == 1 && IsAssertInstruction(instr)) {

                const mode = instr.mode;

                const ids = instr.ids;

                if (instr.instructions[0].type == InstructionType.goto) {

                    const goto_state = getGotState(getFirstGoto(instr.instructions), states).ir_state_ast;
                    const goto_instructions: IRBranch[] = <any>goto_state.instructions;

                    if (
                        stateIsBranch(goto_state)
                        &&
                        goto_instructions.every(i => i.mode == mode)
                        &&
                        goto_instructions.flatMap(i => i.ids).every(i => ids.includes(i))

                    ) {
                        //Remove redundant assertions
                        state.instructions = instr.instructions;
                        MODIFIED = true;
                    }

                }
            }
        }

        if (MODIFIED) {
            //for (const prog of progressions)
            //    console.log(...prog);
            //console.log("AFTER ----\n", renderIRNode(state), "\n");
            //debugger;
        }

        return MODIFIED;
    }
});

addOptimization({
    name: "Remove pure fail branch states",
    processor: (
        state: Resolved_IR_State,
        attribute: StateAttrib,
        data: IRStateData,
        states: StateMap
    ): boolean => {

        let MODIFIED = false;

        const progressions = [["Before ----\n", renderIRNode(state), "\n"]];

        if (stateIsBranch(state)) {


            state.instructions = state.instructions.filter((s: IRBranch) => {
                if (s.instructions.length == 1
                    &&
                    s.instructions[0].type == InstructionType.fail) {
                    MODIFIED = true;
                    return false;
                }
                return true;
            });
        }


        if (MODIFIED) {
            // for (const prog of progressions)
            //     console.log(...prog);
            // console.log("AFTER ----\n", renderIRNode(state), "\n");
            // debugger;
        }

        return MODIFIED;
    }
});

addOptimization({
    name: "Merge Branch States",
    processor: (
        state: Resolved_IR_State,
        attribute: StateAttrib,
        data: IRStateData,
        states: StateMap
    ): boolean => {

        let MODIFIED = false;

        const progressions = [["Before ----\n", renderIRNode(state), "\n"]];

        const instruction_blocks: IR_Instruction[][] = [];

        if (stateIsBranch(state)) {

            const length = state.instructions.length;

            const groups = (<IRBranch[]>state.instructions).group(i => {
                return i.type + i.mode + i.instructions.map(renderIRNode).join("");
            });

            if (groups.length != length) {

                state.instructions = groups.map(g => {
                    const first = g[0];

                    first.ids = g.flatMap(i => i.ids).setFilter().sort();

                    return first;
                });

                MODIFIED = true;

            }
        }


        if (MODIFIED) {
            //for (const prog of progressions)
            //    console.log(...prog);
            //console.log("AFTER ----\n", renderIRNode(state), "\n");
            //debugger;
        }

        return MODIFIED;
    }
});
function IsProductionAssignment(instr: IR_Instruction): instr is IRSetProd {
    return <any>instr.type == InstructionType.set_prod;
}

function IsProductionBranch(s): s is IRProdAssert {
    return IsAssertInstruction(s) && s.mode == "PRODUCTION";
}
function IsProductionBranchState(goto_state: Resolved_IR_State) {
    return stateIsBranch(goto_state) && goto_state.instructions.every(IsProductionBranch);
}

function getNumberOfGotos(block: IR_Instruction[]) {
    return block.filter(g => g.type == InstructionType.goto).length;
}

function BranchSignaturesMatch(A: IRAssert | IRPeek, B: IRAssert | IRPeek) {
    return A.type == B.type && A.mode == B.mode && A.ids.every(i => B.ids.includes(i)) && A.ids.length == 1 && B.ids.length == 1;
}

/**
 * Indiscriminantly merges the instructions found at the first goto state
 * into the current instructions array at the index of the goto instruction.
 * 
 * The exception is if there are any branch instructions, these are converted 
 * into inline branch instructions.
 * 
 * Returns `true` if the FIRST goto state has been replaced, `false` otherwise
 * 
 * WARNING: Use of this function may lead to invalid states.
 * @param instructions 
 * @returns 
 */
function replaceGoto(
    instructions: IR_Instruction[],
    ir_states: StateMap,
    /**
     * Replace assert instructions with 
     * the contents of the assert instruction
     * `instructions` property. Otherwise,
     * convert the assert instruction into an
     * inline-assert instruction.
     * 
     * This DOES NOT effect peek instructions.
     */
    FLATTEN_ASSERT: boolean
): boolean {

    const first_goto_index = firstGotoIndex(instructions);

    if (first_goto_index >= 0) {

        const goto = getFirstGoto(instructions);

        const state = getGotState(goto, ir_states);

        const ast = state.ir_state_ast;

        instructions.splice(first_goto_index, 1, ...mapInlinedInstructions(ast.instructions, ast, FLATTEN_ASSERT));

        return true;
    }

    return false;
}

function mapInlinedInstructions(
    instructions: IR_Instruction[], state: IR_State, FLATTEN_ASSERT: boolean = false) {
    return instructions.flatMap(b => {
        // Remove inline pass instructions as these will create
        // dead code.
        if (b.type == InstructionType.pass)
            return [];

        if (IsAssertInstruction(b)) {


            if (FLATTEN_ASSERT) {
                return b.instructions;
            } else {

                const { symbol_meta } = state;

                if (b.ids.includes(1) || b.ids.includes(9999))
                    return b.instructions;

                const inline_assert: IRInlineAssert = {
                    type: InstructionType.inline_assert,
                    ids: <number[]>b.ids,
                    skipped_ids: <number[]>(symbol_meta?.skipped ?? []),
                    token_ids: <number[]>(symbol_meta?.expected ?? []),
                    mode: b.mode,
                    tok: b.tok
                };

                return [inline_assert, ...b.instructions];
            }
        }
        return b;
    });
}


function stateIsBranch(state: IR_State): boolean {
    return state.instructions.every(
        s => s.type == InstructionType.assert
            ||
            s.type == InstructionType.peek
    );
}

function getGotState(goto: IRGoto, ir_states: StateMap): IRStateData {
    return ir_states.get(getStateName(goto.state));
}

function firstGotoIndex(instructions: IR_Instruction[]): number {
    return instructions.findIndex(d => d.type == InstructionType.goto);
}

function getFirstGoto(instructions: IR_Instruction[]): IRGoto {
    return <any>instructions.filter(i => i.type == InstructionType.goto)[0];
}

function firstConsumeIndex(instruction: IRBranch) {
    return instruction.instructions.findIndex(d => d.type == InstructionType.consume);
}

function ContainsConsume(instruction: IRBranch) {
    return instruction.instructions.some(d => d.type == InstructionType.consume);
}

export function IsPeekInstruction(instruction: IR_Instruction): instruction is IRPeek {
    return instruction.type == InstructionType.peek;
}

export function IsAssertInstruction(instruction: IR_Instruction): instruction is IRAssert {
    return instruction.type == InstructionType.assert;
}

function HasFailState(state: IR_State): boolean {
    return !!state.fail;
}

function* yieldInstructionSequences(ir_state_ast: Resolved_IR_State): Generator<IR_Instruction[]> {

    if (ir_state_ast.instructions.every(
        i => i.type == InstructionType.prod ||
            i.type == InstructionType.peek ||
            i.type == InstructionType.assert
    ))
        for (const instruction of <[IRBranch]>ir_state_ast.instructions)
            yield instruction.instructions;
    else
        yield ir_state_ast.instructions;

}

function removeRedundantProdSet(candidate: IR_State | IRPeek | IRAssert, state: IR_State) {
    const instructions = candidate.instructions;
    const prod_instr = instructions.filter(i => i.type == InstructionType.set_prod);
    if (prod_instr.length > 1) {
        const regular_instructions = instructions.filter(i => i.type != InstructionType.set_prod
            &&
            i.type != InstructionType.goto
        );
        const goto_instructions = instructions.filter(i =>
            i.type == InstructionType.goto
        );

        instructions.length = 0;

        instructions.push(...regular_instructions, prod_instr.pop(), ...goto_instructions);

        optimize_logger.debug(`${prod_instr.length} redundant production${prod_instr.length > 1 ? "s" : ""} assignment removed in ${state.id}`);
    }
}

export function optimize(StateMap: StateMap, grammar: GrammarObject, entry_names: string[]) {

    optimize_logger.debug(`---------------- Processing States ----------------`);

    let MODIFIED = false;

    for (const [, state] of StateMap) {

        const result = runOptimizations(state, StateMap);

        MODIFIED ||= result;
    }

    garbageCollect(StateMap, grammar, entry_names);

    if (!MODIFIED)
        optimize_logger.debug(`---------------- Processing Completed ----------------`);

    return MODIFIED;
}

export function garbageCollect(
    StateMap: StateMap,
    grammar: GrammarObject,
    entry_names: string[] = [
        ...grammar.productions.filter(p => p.IS_ENTRY).map(i => i.name + "")
    ].setFilter()) {


    const marked_map = new Map([...StateMap].map(([name]) => [name + "", false]));

    const pending = entry_names.slice();

    for (const name of pending) {

        const state = StateMap.get(name);

        marked_map.set(name, true);

        const names: Set<string> = new Set();

        try {

            const instructions = state.ir_state_ast.instructions.slice();

            let seen = new WeakSet;

            while (instructions.length > 0) {

                const instruction = instructions.shift();

                if (seen.has(instruction))
                    continue;

                seen.add(instruction);

                switch (instruction.type) {

                    case InstructionType.goto: {

                        names.add(getStateName(instruction.state));

                    } break;

                    case InstructionType.fork_to: {
                        for (const state of instruction.states) {
                            names.add(getStateName(state));
                        }
                    } break;

                    case InstructionType.peek:
                    case InstructionType.assert:
                        {
                            try {

                                instructions.push(...instruction.instructions);
                            } catch (e) {
                                debugger;
                                throw e;
                            }
                        } break;
                }
            }

        } catch (e) {
            console.log(name);
            console.error(e);
            console.log(state.string);
            throw e;
        }

        if (state.ir_state_ast.fail)
            names.add(state.ir_state_ast.fail.id + "");

        for (const name of names) {
            if (!marked_map.get(name))
                pending.push(name);
        }
    }


    optimize_logger.debug(`---------------- Removing unreferenced states ----------------`);
    for (const [name, marked] of marked_map) {
        if (!marked) {
            optimize_logger.debug(`Removing state ${name}`);
            StateMap.delete(name);
        }
    }
}

function mergeDuplicateBodies(ir_state_ast: IR_State, attributes: StateAttrib) {

    if (attributes & StateAttrib.MULTI_BRANCH) {

        const groups = (<(IRPeek | IRAssert)[]>ir_state_ast.instructions)
            .group(i => i.instructions.map(i => renderIRNode(i)).join(""));

        const original_length = ir_state_ast.instructions.length;


        if (groups.length < original_length) {
            ir_state_ast.instructions.length = 0;

            optimize_logger.debug(`Removed duplicate branches in ${ir_state_ast.id}`);

            for (const group of groups) {

                ir_state_ast.instructions.push(group[0]);

                group[0].ids = group.flatMap(g => <number[]>g.ids).setFilter().sort((a, b) => a - b);
            }


        }
    }
}