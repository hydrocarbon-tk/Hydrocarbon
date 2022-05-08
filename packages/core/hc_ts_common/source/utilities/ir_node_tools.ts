import { Token } from '../objects/token.js';
import { ProductionImportSymbol, ProductionSymbol } from '../types/grammar.js';
import { InstructionType, IRAssert, IRBranch, IRGoto, IRPeek, IRProdAssert, IRSetProd, IR_Instruction, IR_State, Resolved_IR_State } from '../types/ir_types.js';
import { StateMap, InternalStateData } from '../types/ir_state_data';


export function getStateName(
    name_candidate: ProductionSymbol | ProductionImportSymbol | string
): string {
    if (!name_candidate)
        return "";

    if (name_candidate instanceof Token)
        return name_candidate + "";

    if (typeof name_candidate == "string")
        return name_candidate;

    return name_candidate.name;
}


export function IsScannerMode(branch: IRProdAssert | IRAssert) {
    return branch.mode == "CLASS" || branch.mode == "BYTE" || branch.mode == "CODEPOINT";
}

export function IsProductionAssignment(instr: IR_Instruction): instr is IRSetProd {
    return <any>instr.type == InstructionType.set_prod;
}

export function IsProductionBranch(s): s is IRProdAssert {
    return IsAssertInstruction(s) && s.mode == "PRODUCTION";
}
export function IsProductionBranchState(goto_state: Resolved_IR_State) {
    return stateIsBranch(goto_state) && goto_state.instructions.every(IsProductionBranch);
}

export function getNumberOfGotos(block: IR_Instruction[]) {
    return block.filter(g => g.type == InstructionType.goto).length;
}

export function BranchSignaturesMatch(A: IRAssert | IRPeek, B: IRAssert | IRPeek) {
    return A.type == B.type && A.mode == B.mode && A.ids.every(i => B.ids.includes(i)) && A.ids.length == 1 && B.ids.length == 1;
}

export function stateIsBranch(state: IR_State): boolean {
    return state.instructions.every(
        s => s.type == InstructionType.assert
            ||
            s.type == InstructionType.peek
    );
}

export function getGotoState(goto: IRGoto, ir_states: StateMap): InternalStateData {
    return <InternalStateData>ir_states.get(getStateName(goto.state));
}

export function firstGotoIndex(instructions: IR_Instruction[]): number {
    return instructions.findIndex(d => d.type == InstructionType.goto);
}

export function getFirstGoto(instructions: IR_Instruction[]): IRGoto {
    return <any>instructions.filter(i => i.type == InstructionType.goto)[0];
}

export function firstConsumeIndex(instruction: IRBranch) {
    return instruction.instructions.findIndex(d => d.type == InstructionType.consume);
}

export function ContainsConsume(instruction: IRBranch) {
    return instruction.instructions.some(d => d.type == InstructionType.consume);
}

export function IsPeekInstruction(instruction: IR_Instruction): instruction is IRPeek {
    return instruction.type == InstructionType.peek;
}

export function IsAssertInstruction(instruction: IR_Instruction): instruction is IRAssert {
    return instruction.type == InstructionType.assert;
}

export function HasFailState(state: IR_State): boolean {
    return !!state.fail;
}
