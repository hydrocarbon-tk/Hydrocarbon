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
        this.meta_stack[0] = 0;
        this.push_state(state, 0);
    }

    push_state(kernel_state: number, accumulated_symbols: number) {
        this.state_stack[++this.pointer] = kernel_state;
        this.meta_stack[this.pointer] = /* (this.meta_stack[this.pointer - 1] & 0xFFFF) | */ accumulated_symbols;
    }

    swap_state(kernel_state: number) {
        this.state_stack[this.pointer] = kernel_state;
    }

    pop_state(): number {
        let state = this.read_state();
        this.pointer--;
        return state;
    }

    read_state(): number {
        return this.state_stack[this.pointer];
    }

    copy_state_stack(dest: KernelStack) {
        for (let i = 0; i <= this.pointer; i++)
            dest.state_stack[i] = this.state_stack[i];

        dest.pointer = this.pointer;
    }

    clone(): KernelStack {
        const new_stack = new KernelStack;

        this.copy_state_stack(new_stack);

        return new_stack;
    }

    debug_clone(): KernelStack {
        const new_stack = new KernelStack;

        new_stack.state_stack = new Uint32Array(this.pointer + 1);
        new_stack.meta_stack = new Uint32Array(this.pointer + 1);

        for (let i = 0; i <= this.pointer; i++)
            new_stack.state_stack[i] = this.state_stack[i];

        new_stack.pointer = this.pointer;

        return new_stack;
    }
}
