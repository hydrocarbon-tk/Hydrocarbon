/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Logger } from '@candlelib/log';
import {
    default_case_indicator,
    GrammarObject,
    InstructionType,
    InternalStateData,
    IRAssert,
    IRBranch,
    IRGoto,
    IRInlineAssert,
    IRPeek,
    IRProdAssert,
    IRSetProd,
    IR_Instruction,
    IR_State,
    ProductionImportSymbol,
    ProductionSymbol,
    Resolved_IR_State,
    StateAttrib,
    StateMap,
    Token
} from '@hctoolkit/common';
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

type OptimizationFunction = (
    state: Resolved_IR_State, attribute: StateAttrib, data: InternalStateData, states: StateMap) => boolean;

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

function runOptimizations(state: InternalStateData, states: StateMap, exclude_optimization: Set<string>) {

    const { attributes, ir_state_ast, } = state;

    const { id } = ir_state_ast;

    const root_id = id;

    let MODIFIED = false;

    for (const optimization of optimizations) {
        if (exclude_optimization.has(optimization.name))
            continue;
        MODIFIED ||= optimization.processor(
            ir_state_ast, attributes, state, states
        );

    }
    return MODIFIED;
}

addOptimization({
    name: "Fold In Scanner Branch States",
    processor: (
        state: Resolved_IR_State,
        attribute: StateAttrib,
        data: InternalStateData,
        states: StateMap
    ): boolean => {

        let MODIFIED = false;

        const pending_branch = state.instructions[0];

        if (stateIsBranch(state) && IsAssertInstruction(pending_branch) && IsScannerMode(pending_branch)) {

            for (let i = 0; i < state.instructions.length; i++) {
                const branch = state.instructions[i];

                if (IsAssertInstruction(branch) && branch.ids.length == 1) {

                    const first = branch.instructions[0];
                    const id = branch.ids[0];

                    if (first.type == InstructionType.goto) {
                        const { ir_state_ast: goto_state } = getGotoState(first, states);

                        if (stateIsBranch(goto_state)) {

                            const match = goto_state.instructions.filter(i => i.ids.length == 1 && i.ids[0] == id)[0];

                            if (match && match.mode == branch.mode) {
                                const instructions = [match].map(i => {
                                    const new_branch = Object.assign({}, i, { instructions: i.instructions.slice() });

                                    new_branch.instructions.push(...branch.instructions.slice(1));
                                    return new_branch;
                                })[0];

                                state.instructions[i] = instructions;
                                MODIFIED = true;
                                i--;
                            }
                        }
                    }
                }
            }
        }
        return MODIFIED;
    }
});

addOptimization({
    name: "Advanced State Analysis",
    processor: (
        state: Resolved_IR_State,
        attribute: StateAttrib,
        data: InternalStateData,
        states: StateMap
    ): boolean => {
        let MODIFIED = false;

        /**
         * Scanner states may be able to complete without assigning a production value.
         * 
         * This is the case on entry scanner states if the last instruction is a set prod       
         */

        if (stateIsBranch(state)) {

            for (const instruction of state.instructions) {

                if (IsAssertInstruction(instruction) || IsPeekInstruction(instruction)) {

                    const instructions = instruction.instructions;
                    const last = instructions.slice(-1)[0];
                    if (last.type == InstructionType.goto && getStateName(last.state).slice(-4) == "goto") {
                        const penultimate = instructions.slice(-2)[0];
                        const third = instructions.slice(-3)[0];

                        if (
                            third
                            &&
                            third.type != InstructionType.goto
                            &&
                            penultimate.type == InstructionType.goto
                        ) {
                            const target_state = getStateName(penultimate.state);
                            const { ir_state_ast: ref_state, refs } = getGotoState(penultimate, states);
                            if ([...refs].every(r => r.slice(-4) != "goto")) {
                                //get all gotos that would affect this ref state
                                const host_branches: IRBranch[] = [...refs].map(s => (<InternalStateData>states.get(s)).ir_state_ast)
                                    .flatMap(s => {
                                        let out = [];
                                        if (stateIsBranch(s)) {
                                            return s.instructions;
                                        } else {
                                            out.push(s);
                                        }
                                        return out;
                                    }).filter(s => {
                                        const penultimate = s.instructions.slice(-2)[0];
                                        if (penultimate.type == InstructionType.goto && getStateName(penultimate.state) == target_state)
                                            return true;
                                        return false;
                                    });

                                if (host_branches.length != refs.size || host_branches.some(b => {
                                    let last = b.instructions.slice(-1)[0]; return last.type != InstructionType.goto || getStateName(last.state).slice(-4) != "goto";
                                }))
                                    continue;

                                let ref_branches: IRBranch[] = <any[]>[ref_state];

                                if (stateIsBranch(ref_state))
                                    ref_branches = <any>ref_state.instructions;

                                let combines = [];

                                for (const branch of ref_branches) {
                                    const id = branch.instructions.filter(i => i.type == InstructionType.set_prod).map(i => i.id).pop();

                                    if (id) {
                                        const gotos: IRBranch[] = <any[]>host_branches
                                            .map(b => getGotoState(<IRGoto>b.instructions.slice(-1)[0], states))
                                            .flatMap(({ ir_state_ast }) => {
                                                if (stateIsBranch(ir_state_ast)) {
                                                    return ir_state_ast.instructions.filter(i => i.ids.includes(id));
                                                }
                                            });

                                        const sigs = gotos.map(i => renderIRNode(i)).setFilter();

                                        if (refs.size > 1 && sigs.length == 1) {

                                            const instructions = gotos[0].instructions;

                                            combines.push([branch, instructions]);
                                        }
                                    }
                                }

                                if (combines.length == ref_branches.length) {
                                    for (const [branch, from] of combines) {
                                        branch.instructions = branch.instructions.filter(i => i.type != InstructionType.set_prod).concat(...from);

                                    }

                                    for (const host of host_branches) {
                                        host.instructions.pop();
                                    }
                                    MODIFIED = true;
                                }
                            }
                        }
                    }
                }
            }
        }

        return MODIFIED;
    }
});
addOptimization({
    name: "Remove unnecessary production assigns",
    processor: (
        state: Resolved_IR_State,
        attribute: StateAttrib,
        data: InternalStateData,
        states: StateMap
    ): boolean => {
        let MODIFIED = false;
        /**
         * Scanner states may be able to complete without assigning a production value.
         * 
         * This is the case on entry scanner states if the last instruction is a set prod       
         */

        if (stateIsBranch(state) && (<string>state.id).slice(0, 9) == "__SCANNER") {

            for (const instruction of state.instructions) {

                if (IsAssertInstruction(instruction)) {

                    const instructions = instruction.instructions;
                    const last = instructions.slice(-1)[0];
                    if (
                        last.type != InstructionType.goto &&
                        last.type != InstructionType.repeat &&
                        instructions.some(i => i.type == InstructionType.set_prod)
                    ) {
                        instruction.instructions = instructions.filter(s => s.type != InstructionType.set_prod);
                        if (instruction.instructions.length != instructions.length)
                            MODIFIED = true;
                    }
                }
            }
        } else {

        }

        return MODIFIED;
    }
});
addOptimization({
    name: "Goto Inline",
    processor: (
        state: Resolved_IR_State,
        attribute: StateAttrib,
        data: InternalStateData,
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

        if (stateIsBranch(state)) {

            for (const instruction of state.instructions) {

                if (IsPeekInstruction(instruction)) {
                    const instructions = instruction.instructions;
                    const instruction_length = instruction.instructions.length;
                    const IS_POST_CONSUME = ContainsConsume(instruction);
                    const first_goto = getFirstGoto(instructions);
                    if (first_goto) {
                        const { ir_state_ast: goto_state } = getGotoState(first_goto, states);

                        if (!HasFailState(goto_state)) {

                        }
                    }
                } else if (IsAssertInstruction(instruction)) {

                    const instructions = instruction.instructions;
                    const instruction_length = instruction.instructions.length;
                    const IS_POST_CONSUME = ContainsConsume(instruction);
                    const first_goto = getFirstGoto(instructions);

                    if (first_goto) {

                        const { ir_state_ast: goto_state } = getGotoState(first_goto, states);

                        if (!HasFailState(goto_state)) {
                            if (stateIsBranch(goto_state)) {
                                if (goto_state.instructions.length == 1) {
                                    const branch = goto_state.instructions[0];
                                    if (IsAssertInstruction(branch)) {
                                        if (!IS_POST_CONSUME && BranchSignaturesMatch(branch, instruction)) {
                                            replaceGoto(instructions, states, true);
                                            MODIFIED = true;
                                        } else {
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

        return MODIFIED;
    }
});

addOptimization({
    name: "Production Unroll",
    processor: (
        state: Resolved_IR_State,
        attribute: StateAttrib,
        data: InternalStateData,
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

                            const goto_state = getGotoState(first_goto, states).ir_state_ast;

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

                            const goto_state = getGotoState(first_goto, states).ir_state_ast;

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
        return MODIFIED;
    }
});




addOptimization({
    name: "Remove Redundant Instructions",
    processor: (
        state: Resolved_IR_State,
        attribute: StateAttrib,
        data: InternalStateData,
        states: StateMap
    ): boolean => {

        let MODIFIED = false;

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

        return MODIFIED;
    }
});

addOptimization({
    name: "Remove redundant assert",
    processor: (
        state: Resolved_IR_State,
        attribute: StateAttrib,
        data: InternalStateData,
        states: StateMap
    ): boolean => {

        let MODIFIED = false;

        if (stateIsBranch(state)) {
            const instr = state.instructions[0];
            if (state.instructions.length == 1 && IsAssertInstruction(instr)) {

                const mode = instr.mode;

                const ids = instr.ids;

                if (instr.instructions[0].type == InstructionType.goto) {

                    const goto_state = getGotoState(getFirstGoto(instr.instructions), states).ir_state_ast;
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

        return MODIFIED;
    }
});

addOptimization({
    name: "Remove redundant inline-assert",
    processor: (
        state: Resolved_IR_State,
        attribute: StateAttrib,
        data: InternalStateData,
        states: StateMap
    ): boolean => {

        let MODIFIED = false;

        if (stateIsBranch(state)) {

            for (const branch of state.instructions) {
                if (IsAssertInstruction(branch)) {
                    const instr = branch.instructions[0];
                    if (instr.type == InstructionType.inline_assert) {
                        if (instr.mode == branch.mode && instr.ids.every(i => branch.ids.includes(i))) {
                            branch.instructions.splice(0, 1);
                            MODIFIED = true;
                        }
                    }
                }
            }
        }
        const branches: IRBranch[] = <any[]>(stateIsBranch(state) ? state.instructions : [state]);


        for (const branch of branches) {
            for (let i = 0; i < branch.instructions.length; i++) {
                if (i < branch.instructions.length - 1) {
                    let instr = branch.instructions[i];
                    let instr2 = branch.instructions[i + 1];
                    if (instr2.type == InstructionType.inline_assert && instr.type == InstructionType.inline_assert) {
                        if (instr2.mode == instr.mode && instr2.ids.every(i => (<any>instr).ids.includes(i))) {
                            branch.instructions.splice(i + 1, 1);
                            i--;
                            MODIFIED = true;
                        }
                    }
                }
            }
        }

        return MODIFIED;
    }
});


addOptimization({
    name: "Remove redundant token|set-prod and token|token pairs",
    processor: (
        state: Resolved_IR_State,
        attribute: StateAttrib,
        data: InternalStateData,
        states: StateMap
    ): boolean => {

        let MODIFIED = false;

        const branches: IRBranch[] = <any[]>(stateIsBranch(state) ? state.instructions : [state]);

        for (const branch of branches) {
            for (let i = 0; i < branch.instructions.length; i++) {
                if (i < branch.instructions.length - 1) {
                    let instr = branch.instructions[i];
                    let instr2 = branch.instructions[i + 1];
                    if (instr.type == InstructionType.token_assign && instr2.type == InstructionType.set_prod) {
                        if (instr.ids[0] == instr2.id) {
                            branch.instructions.splice(i + 1, 1);
                            i--;
                            MODIFIED = true;
                        }
                    } else if (instr.type == InstructionType.token_assign && instr2.type == InstructionType.token_assign) {
                        branch.instructions.splice(i, 1);
                        i--;
                        MODIFIED = true;
                    }
                }
            }
        }

        return MODIFIED;
    }
});

addOptimization({
    name: "Remove redundant token assigns",
    processor: (
        state: Resolved_IR_State,
        attribute: StateAttrib,
        data: InternalStateData,
        states: StateMap
    ): boolean => {

        let MODIFIED = false;

        const instructions = stateIsBranch(state) ? state.instructions : [state];

        for (const branch of instructions) {
            let token_set = new Set();
            branch.instructions = branch.instructions.filter(i => {
                if (i.type == InstructionType.token_assign) {
                    if (!token_set.has(i.ids[0])) {
                        token_set.add(i.ids[0]);
                        return true;
                    }
                    MODIFIED = true;
                    return false;
                }

                return true;
            });
        }

        return MODIFIED;
    }
});

addOptimization({
    name: "Remove pure fail branch states in non-scanner states",
    processor: (
        state: Resolved_IR_State,
        attribute: StateAttrib,
        data: InternalStateData,
        states: StateMap
    ): boolean => {

        let MODIFIED = false;

        if (stateIsBranch(state)) {

            const new_instructions = state.instructions.filter((s: IRBranch) => {

                if (
                    (s.mode == "PRODUCTION" || s.mode == "TOKEN")
                    &&
                    s.instructions.length == 1
                    &&
                    s.instructions[0].type == InstructionType.fail) {

                    return false;
                }
                return true;
            });

            if (new_instructions.length > 0 &&
                new_instructions.length
                !=
                state.instructions.length
            ) {
                state.instructions = new_instructions;
                MODIFIED = true;
            }
        }

        return MODIFIED;
    }
});



addOptimization({
    name: "Merge Branch States",
    processor: (
        state: Resolved_IR_State,
        attribute: StateAttrib,
        data: InternalStateData,
        states: StateMap
    ): boolean => {

        let MODIFIED = false;

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

        return MODIFIED;
    }
});
function IsScannerMode(branch: IRProdAssert | IRAssert) {
    return branch.mode == "CLASS" || branch.mode == "BYTE" || branch.mode == "CODEPOINT";
}

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

        const state = getGotoState(goto, ir_states);

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

                if (b.ids.includes(1) || b.ids.includes(default_case_indicator))
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

function getGotoState(goto: IRGoto, ir_states: StateMap): InternalStateData {
    return <InternalStateData>ir_states.get(getStateName(goto.state));
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

export function optimize(
    StateMap: StateMap,
    grammar: GrammarObject,
    entry_names: string[],
    exclude_optimization: Set<string> = new Set()
) {

    optimize_logger.debug(`---------------- Processing States ----------------`);

    let MODIFIED = false;

    for (const [, state] of StateMap) {

        const result = runOptimizations(state, StateMap, exclude_optimization);

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
        ...grammar.productions.filter(p => p.IS_ENTRY).map(i => (i.entry_name + "_open"))
    ].setFilter()
) {
    const temp_map = new Map(StateMap);

    StateMap.clear();

    for (
        const { state, name, refs } of iterateStateGraph(temp_map, entry_names)
    ) {

        StateMap.set(name, state);

        state.refs = refs;
    }
}
/**
 * Iterates over the state graph, yielding all states that are
 * reachable from a set of root states. 
 * 
 * Root states are identified by an array of state name strings.
 */
export function* iterateStateGraph(
    StateMap: StateMap,
    root_names: string[]
): Generator<{
    name: string,
    state: InternalStateData,
    refs: Set<string>;
}> {

    const marked_map: Map<string, null | Set<string>>
        = new Map([...StateMap].map(([name]) => [name + "", null]));

    const pending = root_names.slice();

    for (const name of pending) {

        const state = <InternalStateData>StateMap.get(name);

        if (marked_map.get(name) == null)
            marked_map.set(name, new Set);

        const names: Set<string> = new Set();


        try {

            const instructions = state.ir_state_ast.instructions.slice();

            let seen = new WeakSet;

            while (instructions.length > 0) {

                const instruction = <IR_Instruction>instructions.shift();

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
            console.error(root_names);
            console.error({ name });
            console.error(e);
            console.error(state.string);
            throw e;
        }

        if (state.ir_state_ast.fail)
            names.add(state.ir_state_ast.fail.id + "");

        for (const n of names) {
            if (!n) debugger;
            if (marked_map.get(n) == null) {
                pending.push(n);
                marked_map.set(n, new Set);
            }

            (<Set<string>>marked_map.get(n)).add(name);
        }
    }


    optimize_logger.debug(`---------------- Removing unreferenced states ----------------`);
    for (const [name, refs] of marked_map) {
        if (refs == null) continue;
        yield {
            name: name,
            state: <InternalStateData>StateMap.get(name),
            refs: refs
        };
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