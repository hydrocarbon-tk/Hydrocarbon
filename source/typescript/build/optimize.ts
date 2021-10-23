/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Logger } from '@candlelib/log';
import { Token } from '../runtime/token.js';
import { GrammarObject, ProductionImportSymbol, ProductionSymbol } from '../types/grammar_nodes';
import { IRStateData, StateAttrib, StateMap } from '../types/ir_state_data';
import { InstructionType, IRAssert, IRGoto, IRInlineAssert, IRPeek, IRProductionBranch, IRSetProd, IRBranch, IR_Instruction, IR_State, Resolved_IR_State } from '../types/ir_types';
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

function optimizeState(state: IRStateData, states: StateMap) {

    let MODIFIED = false;

    const { attributes, ir_state_ast, } = state;

    const { id } = ir_state_ast;

    const root_id = id;


    /**
     * Replace
     *
     *      <multi|single> (prod|assert) [A] => goto(X) ... goto(A*) ;
     *
     *      with
     *
     *      (X) <single> (prod|assert) [B] => instr(*) ... goto(*) ... goto(A*) ;
     *
     *      if 
     *          prod [B] == prod [A] || assert [B] == assert [A] || no (prod|assert) [B]
     * 
     *      and not 
     *          prod [B] == assert [A] || assert [B] == prod [A]
     *      and not
     *          
     *          (X) => fail
     */
    for (const instruction of ir_state_ast.instructions) {
        if (
            instruction.type == InstructionType.assert
            ||
            instruction.type == InstructionType.prod
        ) {
            const sub_instructions = instruction.instructions;
            const ids = instruction.ids.sort((a, b) => a - b).join("-");

            if (sub_instructions.every(i => i.type == InstructionType.goto)) {

                const goto = <IRGoto>sub_instructions[0];

                const { ir_state_ast, attributes } = states.get(getStateName(goto.state));

                if (!(attributes & StateAttrib.MULTI_BRANCH) && !ir_state_ast.fail) {

                    if ((!((attributes & StateAttrib.TOKEN_BRANCH) || (attributes & StateAttrib.PROD_BRANCH)))) {

                        const cache = sub_instructions.slice(1);

                        sub_instructions.length = 0;

                        sub_instructions.push(...ir_state_ast.instructions, ...cache);

                        MODIFIED = true;
                    } else if (
                        ir_state_ast.instructions[0].type == instruction.type
                        &&
                        ids == ir_state_ast.instructions[0].ids.sort((a, b) => a - b).join("-")
                    ) {
                        const cache = sub_instructions.slice(1);

                        sub_instructions.length = 0;

                        sub_instructions.push(...ir_state_ast.instructions[0].instructions, ...cache);

                        optimize_logger.debug(`[1] ${goto.state} inlined into ${root_id}`);

                        MODIFIED = true;
                    }
                }
            }
        }
    }


    /**
     * Replace
     *
     *      <multi|single> (prod|assert) [*] => instr(*) goto(X) ... goto(*) ;
     *
     *      with
     *
     *     <multi|single> (prod|assert) [*] => instr(*) (X ... ) ... goto(*) ;
     * 
     *     for some state X that is 
     * 
     *      (X) <single> => instr(*) ... goto(*)
     */
    for (const instruction of ir_state_ast.instructions) {
        if (
            instruction.type == InstructionType.assert
            ||
            instruction.type == InstructionType.prod
        ) {
            const sub_instructions = instruction.instructions;

            let i = 0;

            for (const instruction of sub_instructions) {

                if (instruction.type == InstructionType.goto) {

                    const goto = instruction;

                    const { ir_state_ast: import_ir_state, attributes } = states.get(getStateName(goto.state));

                    const { fail } = import_ir_state;

                    if (
                        !((attributes & StateAttrib.TOKEN_BRANCH) || (attributes & StateAttrib.PROD_BRANCH))
                        &&
                        (!fail && !ir_state_ast.fail)
                    ) {

                        sub_instructions.splice(i, 1, ...import_ir_state.instructions);

                        MODIFIED = true;

                        optimize_logger.debug(`[2] ${goto.state} inlined into ${root_id}`);

                        if (!ir_state_ast.fail)
                            ir_state_ast.fail = fail;
                    }

                    break;
                }

                i++;
            }
        }
    }

    /**
     * Replace
     *
     *      <multi|single> (prod) [*] => goto(X) ... goto(*) ;
     *
     *      with
     *
     *     <multi|single> (prod) [*] => instr(*) < inline-assert(T) X ... > ... goto(*) ;
     * 
     *     for some state X that is 
     * 
     *     (X) <single> (assert) [T] => instr(*) ... goto(*)
     * 
     *      where T is a single token identifier and X does not have a fail state
     */
    for (const instruction of ir_state_ast.instructions) {
        if (
            instruction.type == InstructionType.prod
        ) {
            const sub_instructions = instruction.instructions;

            let i = 0;

            for (const instruction of sub_instructions) {

                if (instruction.type == InstructionType.goto) {

                    const goto = instruction;

                    const { ir_state_ast, attributes } = states.get(getStateName(goto.state));

                    const { instructions, symbol_meta } = ir_state_ast;

                    if (
                        instructions.length == 1
                        &&
                        instructions[0].type == InstructionType.assert
                        &&
                        instructions[0].ids.length == 1
                        &&
                        !ir_state_ast.fail
                    ) {
                        const assert = instructions[0];

                        const inline_assert: IRInlineAssert = {
                            type: InstructionType.inline_assert,
                            id: <number>assert.ids[0],
                            skipped_ids: <number[]>(symbol_meta?.skipped ?? []),
                            token_ids: <number[]>(symbol_meta?.expected ?? []),
                            tok: null
                        };

                        sub_instructions.splice(i, 1, inline_assert, ...assert.instructions);

                        optimize_logger.debug(`[3] State ${goto.state} replaced with inline assertion in ${root_id}`);

                        MODIFIED = true;
                    }

                    //Break no matter the outcome
                    break;
                }

                i++;
            }

        }
    }

    /**
     * Replace
     *
     *      <single> => instr(*) goto(X) ... goto(*) ;
     *
     *      with
     *
     *     <single> => instr(*) (X ... ) ... goto(*) ;
     * 
     *     for some state X that is 
     * 
     *      (X) <single> => instr(*) ... goto(*)
     */
    if (!((attributes & StateAttrib.TOKEN_BRANCH) || (attributes & StateAttrib.PROD_BRANCH))) {

        const sub_instructions = ir_state_ast.instructions;

        let i = 0;

        for (const instruction of sub_instructions) {

            if (instruction.type == InstructionType.goto) {

                const goto = instruction;

                const { ir_state_ast, attributes } = states.get(getStateName(goto.state));

                if (!((attributes & StateAttrib.TOKEN_BRANCH) || (attributes & StateAttrib.PROD_BRANCH)) && !ir_state_ast.fail) {

                    sub_instructions.splice(i, 1, ...ir_state_ast.instructions);

                    MODIFIED = true;

                    optimize_logger.debug(`[4] ${goto.state} inlined into ${root_id}`);
                }

                break;
            }

            i++;
        }
    }

    /**
     * Replace
     *
     *      (A) <multi|single> (prod|assert|peek) [*] => instr(0) ... instr(N) goto(A) ;
     *
     *      with
     *
     *      (A) <multi|single> (prod|assert|peek) [*] => instr(0) ... instr(N) repeat ;
     */
    for (const instruction of ir_state_ast.instructions) {

        if (
            instruction.type == InstructionType.assert
            ||
            instruction.type == InstructionType.prod
        ) {
            const sub_instructions = instruction.instructions;

            const gotos = <IRGoto[]>sub_instructions.filter(i => i.type == InstructionType.goto);

            if (gotos.length == 1 && gotos[0].state == id) {
                sub_instructions.pop();

                sub_instructions.push({
                    type: InstructionType.repeat,
                    tok: gotos[0].tok
                });

                optimize_logger.debug(`[5] Goto ${gotos[0].state} replaced with repeat in ${root_id}`);

                MODIFIED = true;
            }
        }
    }

    /**
    * Remove redundant production assignments
    *
    *      (A) (*) => instr(*) ... set-prod(0) ... instr(*) ... set-prod(n) ... ;
    *
    *      with
    *
    *      (A) (*) => instr(*) ...  instr(*) ... set-prod(n) ... ;
    */
    if (attributes & StateAttrib.TOKEN_BRANCH || attributes & StateAttrib.PROD_BRANCH) {
        for (const instruction of ir_state_ast.instructions) {
            const candidate = <IRProductionBranch | IRPeek | IRAssert>instruction;
            removeRedundantProdSet(candidate, ir_state_ast);
        }
    } else {
        removeRedundantProdSet(ir_state_ast, ir_state_ast);
    }

    /**
     * Remove Fail States
     * 
     *  Fail States represent implicit actions and do not need to be actually represented
     *  in outputted code.
     * 
     *  (A) (prod|assert) => instr(fail) ;
     */
    let i = 0;
    if (ir_state_ast.instructions.length > 1)
        for (const instruction of ir_state_ast.instructions) {
            if (
                instruction.type == InstructionType.assert
                ||
                instruction.type == InstructionType.prod
            ) {
                const sub_instructions = instruction.instructions;

                if (sub_instructions.length == 1 && sub_instructions[0].type == InstructionType.fail) {

                    ir_state_ast.instructions.splice(i, 1);

                    optimize_logger.debug(`[7] Redundant fail branch removed in ${root_id}`);

                    MODIFIED = true;
                }
            }
            i++;
        }

    /**
     * Remove Redundant Production Sets
     * 
     *  
     *  (prod)[X] => instr... set-prod(X) ... ;
     *  
     *  to
     * 
     *  (prod)[X] => instr...;
     * 
     *  if set-prod(X) is the only instruction of its type 
     * 
     *  and (prod)[X] has no goto instructions
     */
    for (const instruction of ir_state_ast.instructions) {

        if (
            instruction.type == InstructionType.prod
            &&
            instruction.ids.length == 1
        ) {
            const sub_instructions = instruction.instructions;

            const prods = sub_instructions.map((i, j) => <[IRSetProd, number]>[i, j])
                .filter(([i]) => i.type == InstructionType.set_prod);

            if (prods.length == 1 && instruction.ids.includes(<number>prods[0][0].id)
                &&
                sub_instructions.filter(i => i.type == InstructionType.goto).length == 0
            ) {
                const index = prods[0][1];

                sub_instructions.splice(index, 1);

                optimize_logger.debug(`[8] 1 redundant production assignment removed in ${root_id}`);

                MODIFIED = true;
            }
        }
    }

    /**
     * Remove gotos that lead to pass states. These are absolutely 
     * unnecessary.
     */

    for (const instruction_sequence of yieldInstructionSequences(ir_state_ast)) {

        if (instruction_sequence.length > 1)

            for (let i = 0; i < instruction_sequence.length; i++) {

                const instruction = instruction_sequence[i];

                if (instruction.type == InstructionType.goto) {

                    const { ir_state_ast } = states.get(getStateName(instruction.state));

                    if (ir_state_ast.instructions.length == 1 && ir_state_ast.instructions[0].type == InstructionType.pass) {
                        instruction_sequence.splice(i, 1);
                        i--;
                        MODIFIED = true;
                    }
                }
            }
    }


    /**
     * Remove Inline pass instruction_sections
     * 
     * Pass instructions that have been inline MUST be removed
     * to prevent premature exit from a sequence of instructions
     * 
     *  () => instr... pass ... ;
     *  
     *  to
     * 
     *  () => instr...;
     */

    for (const instruction_sequence of yieldInstructionSequences(ir_state_ast)) {

        if (instruction_sequence.length > 1)
            for (let i = 0; i < instruction_sequence.length; i++) {
                const instruction = instruction_sequence[i];

                if (instruction.type == InstructionType.pass) {
                    instruction_sequence.splice(i, 1);
                    i--;
                    MODIFIED = true;
                }
            }
    }

    /**
     * Remove sequential inline asserts
     */

    for (const instruction_sequence of yieldInstructionSequences(ir_state_ast)) {

        if (instruction_sequence.length > 1) {

            let prev = instruction_sequence[0];

            for (let i = 1; i < instruction_sequence.length; i++) {

                const instruction = instruction_sequence[i];

                if (
                    prev.type == InstructionType.inline_assert
                    &&
                    instruction.type == InstructionType.inline_assert
                ) {
                    instruction_sequence.splice(i, 1);
                    i--;
                    MODIFIED = true;
                } else {
                    prev = instruction;
                }
            }
        }
    }

    /**
     * Upgrade State Optimization
     *
     *      (A) <single> => goto(X) ... goto(A*) ;
     *
     *      with
     *
     *      (A) <single> => ( (X) <single> (assert|prod) => ... instr(X*) ... goto(X*) ... goto(A*) ; ) ; 
     * 
     *      only if fork not in (... instr(X*)) and X does not have fail 
     */
    if (!((attributes & StateAttrib.TOKEN_BRANCH) || (attributes & StateAttrib.PROD_BRANCH))) {

        const sub_instructions = ir_state_ast.instructions;

        if (sub_instructions.every(i => i.type == InstructionType.goto)) {

            const first_goto: IRGoto = <IRGoto>sub_instructions[0];

            const { ir_state_ast: { fail, type, instructions: foreign_instructions, symbol_meta }, attributes } = states.get(getStateName(first_goto.state));

            if (
                !(attributes & StateAttrib.MULTI_BRANCH)
                &&
                (foreign_instructions[0].type == InstructionType.prod
                    ||
                    foreign_instructions[0].type == InstructionType.assert)
                &&
                !foreign_instructions[0].instructions.some(i => i.type == InstructionType.fork_to)
                &&
                !fail

            ) {
                const own_instructions = sub_instructions.slice(1);

                ir_state_ast.instructions = [Object.assign({}, foreign_instructions[0], {
                    instructions: foreign_instructions[0].instructions.concat(own_instructions)
                })];

                if (!ir_state_ast.symbol_meta)
                    ir_state_ast.symbol_meta = symbol_meta;
                else {
                    ir_state_ast.symbol_meta.skipped.push(...symbol_meta.skipped);
                    ir_state_ast.symbol_meta.skipped = ir_state_ast.symbol_meta.skipped.setFilter();
                    ir_state_ast.symbol_meta.expected.push(...symbol_meta.expected);
                    ir_state_ast.symbol_meta.expected = ir_state_ast.symbol_meta.expected.setFilter();
                }

                state.attributes |= attributes;

                optimize_logger.debug(`[9] ${root_id} upgraded to branch state from ${first_goto.state}`);

                MODIFIED = true;
            }
        }
    }

    mergeDuplicateBodies(ir_state_ast, attributes);

    return MODIFIED;
}

function* yieldInstructionSequences(ir_state_ast: Resolved_IR_State): Generator<IR_Instruction[]> {

    if (ir_state_ast.instructions.every(
        i => i.type == InstructionType.prod ||
            i.type == InstructionType.peek ||
            i.type == InstructionType.assert
    ))
        for (const instruction of <[IRProductionBranch | IRBranch]>ir_state_ast.instructions)
            yield instruction.instructions;
    else
        yield ir_state_ast.instructions;

}

function removeRedundantProdSet(candidate: IR_State | IRProductionBranch | IRPeek | IRAssert, state: IR_State) {
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

        const result = optimizeState(state, StateMap);

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

            for (const instruction of instructions) {

                switch (instruction.type) {

                    case InstructionType.goto: {

                        names.add(getStateName(instruction.state));

                    } break;

                    case InstructionType.fork_to: {
                        for (const state of instruction.states) {
                            names.add(getStateName(state));
                        }
                    } break;

                    case InstructionType.prod:
                    case InstructionType.peek:
                    case InstructionType.assert:
                        {
                            instructions.push(...instruction.instructions);
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

        const groups = (<(IRProductionBranch | IRPeek | IRAssert)[]>ir_state_ast.instructions)
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