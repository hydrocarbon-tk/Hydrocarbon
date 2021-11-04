const stack_size: usize = 64;

// ///////////////////////////////////////////
// KERNEL STATE
// ///////////////////////////////////////////

pub struct KernelStack {
    pub state_stack: [u64; stack_size],
    pub stack_pointer: i32,
}

impl KernelStack {
    pub fn new() -> KernelStack {
        KernelStack {
            state_stack: [0; stack_size],
            stack_pointer: 0,
        }
    }
    pub fn reset(&mut self, kernel_state: u32) {
        self.stack_pointer = 0;

        self.state_stack[0] = 0;

        self.push_state(kernel_state)
    }

    pub fn push_state(&mut self, kernel_state: u32) {
        self.stack_pointer += 1;
        let sp = self.stack_pointer as usize;

        self.state_stack[sp] = (kernel_state as u64);

        // self.meta_stack[sp] = (self.meta_stack[sp - 1] & 0xFFFF) | (0 as u32);
    }

    pub fn swap_state(&mut self, kernel_state: u32) {
        self.state_stack[self.stack_pointer as usize] = kernel_state as u64;
    }

    pub fn pop_state(&mut self) -> u32 {
        let state = self.read_state();
        self.stack_pointer -= 1;
        return state;
    }

    pub fn read_state(&self) -> u32 {
        (self.state_stack[self.stack_pointer as usize] & 0xFFFF_FFFF) as u32
    }

    pub fn copy_state_stack(&self, dest: &mut KernelStack) {
        for i in 0..=self.stack_pointer {
            dest.state_stack[i as usize] = self.state_stack[i as usize];
        }
    }
}
