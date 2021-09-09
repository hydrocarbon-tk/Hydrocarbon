/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Sym_Is_A_Production_Token } from '../grammar/nodes/symbol.js';
import { GrammarObject, ProductionImportSymbol, ProductionSymbol } from '../types/grammar_nodes';
import { IRStateData, StateAttrib, StateMap } from '../types/ir_state_data';
import { InstructionType, IRGoto } from '../types/ir_types';

function getStateName(
    name_candidate: ProductionSymbol | ProductionImportSymbol | string
): string {
    if (!name_candidate) return "";

    if (typeof name_candidate == "string")
        return name_candidate;

    return name_candidate.name;
}


function optimizeState(state: IRStateData, states: StateMap) {

    let MODIFIED = false;

    const { attributes, ir_state_ast, } = state;

    const { id } = ir_state_ast;

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

                if (!(attributes & StateAttrib.MULTI_BRANCH)) {

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

                    const { ir_state_ast, attributes } = states.get(getStateName(goto.state));

                    if (!((attributes & StateAttrib.TOKEN_BRANCH) || (attributes & StateAttrib.PROD_BRANCH))) {

                        sub_instructions.splice(i, 1, ...ir_state_ast.instructions);

                        MODIFIED = true;
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

                if (!((attributes & StateAttrib.TOKEN_BRANCH) || (attributes & StateAttrib.PROD_BRANCH))) {

                    sub_instructions.splice(i, 1, ...ir_state_ast.instructions);

                    MODIFIED = true;
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
                /*
                sub_instructions.pop();

                sub_instructions.push({
                    type: InstructionType.repeat,
                    pos: gotos[0].pos
                });

                MODIFIED = true;
                */
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

                MODIFIED = true;
            }
        }
    }



    return MODIFIED;
}

export function optimize(StateMap: StateMap, grammar: GrammarObject) {

    let MODIFIED = false;

    for (const [, state] of StateMap)
        MODIFIED ||= optimizeState(state, StateMap);

    garbageCollect(StateMap, grammar);

    return MODIFIED;
}

export function garbageCollect(StateMap: StateMap, grammar: GrammarObject,) {

    const entry_names = [
        ...grammar.productions.filter(p => p.IS_ENTRY).map(i => i.name),
        ...[...grammar.meta.all_symbols.values()].filter(Sym_Is_A_Production_Token).map(i => i.name)
    ].setFilter();
    const marked_map = new Map([...StateMap].map(([name]) => [name, false]));

    const pending = entry_names.slice();

    for (const name of pending) {

        const state = StateMap.get(name);

        marked_map.set(name, true);

        const names: Set<string> = new Set();

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

        if (state.ir_state_ast.fail)
            names.add(state.ir_state_ast.fail.id);

        for (const name of names) {
            if (!marked_map.get(name))
                pending.push(name);
        }
    }

    for (const [name, marked] of marked_map) {
        if (!marked) {
            StateMap.delete(name);
        }
    }
}

