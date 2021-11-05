/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */

/////////////////////////////////////////////
// Kernel State 
/////////////////////////////////////////////


export class KernelStack {
    pointer: number;
    state_stack: Uint32Array;
    meta_stack: Uint32Array;

    constructor() {

        this.state_stack = new Uint32Array(128);

        this.meta_stack = new Uint32Array(128);

        this.pointer = 0;
    }

    reset(state: number) {
        this.pointer = 0;
        this.state_stack[0] = 0;
        this.meta_stack[0] = -1;
        this.push_state(state);
    }

    push_state(kernel_state: number) {
        this.state_stack[++this.pointer] = kernel_state;
        this.meta_stack[this.pointer] = (this.meta_stack[this.pointer - 1] & 0xFFFF) | this.symbol_accumulator;
    }

    swap_state(kernel_state: number) {
        this.state_stack[this.pointer] = kernel_state;
    }

    pop_state(): number {
        return this.state_stack[this.pointer--];
    }

    read_state(): number {
        return this.state_stack[this.pointer];
    }

    copy_state_stack(dest: KernelStack) {
        for (let i = 0; i <= this.pointer; i++)
            dest.state_stack[i] = this.state_stack[i];
    }
}
