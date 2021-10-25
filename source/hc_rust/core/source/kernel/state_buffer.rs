use super::state::KernelState;

// ///////////////////////////////////////////
// KERNEL STATE BUFFER
// ///////////////////////////////////////////
pub struct KernelStateBuffer {
    pub data: Vec<Box<KernelState>>,
}

impl KernelStateBuffer {
    pub fn new() -> KernelStateBuffer {
        KernelStateBuffer { data: Vec::new() }
    }

    pub fn len(&self) -> usize {
        self.data.len()
    }

    pub fn create_state(
        buffer: &mut KernelStateBuffer,
        instruction_buffer: *const u32,
        instruction_buffer_len: usize,
        input_buffer: *const u8,
        input_len_in: usize,
    ) -> &mut KernelState {
        let data: Box<KernelState> = Box::new(KernelState::new(
            instruction_buffer,
            instruction_buffer_len,
            input_buffer,
            input_len_in,
        ));

        let index = buffer.data.len();

        buffer.data.push(data);

        return buffer.data[index].as_mut();
    }

    pub fn remove_state_at_index(&mut self, index: usize) -> Box<KernelState> {
        return self.data.remove(index);
    }

    pub fn add_state_pointer(buffer: &mut KernelStateBuffer, data: Box<KernelState>) {
        buffer.data.push(data);
    }

    pub fn add_state_pointer_and_sort(
        buffer: &mut KernelStateBuffer,
        pointer: Box<KernelState>,
    ) -> u32 {
        let mut i: usize = buffer.data.len();

        let data = pointer.as_ref();

        for index in 0..buffer.data.len() {
            let exist_ref: &mut KernelState = &mut buffer.data[index];

            if data.VALID && (!exist_ref.VALID) {
                i = index;
                break;
            }

            if exist_ref.lexer.byte_offset < data.lexer.byte_offset {
                i = index;
                break;
            }
        }

        buffer.data.insert(i, pointer);

        return buffer.data.len() as u32;
    }

    pub fn have_valid(&self) -> bool {
        self.len() > 0 && self.data[0].as_ref().VALID
    }

    pub fn remove_valid_parser_state(&mut self) -> Option<Box<KernelState>> {
        if self.have_valid() {
            return Some(self.remove_state_at_index(0));
        }

        return None;
    }

    pub fn get_mut_state(buffer: &mut KernelStateBuffer, index: usize) -> Option<&mut KernelState> {
        if buffer.len() > index {
            return Some(buffer.data[index].as_mut());
        }

        return None;
    }

    pub fn get_ref_state(&self, index: usize) -> Option<&KernelState> {
        if self.len() > index {
            return Some(self.data[index].as_ref());
        }

        return None;
    }

    pub fn get_recycled_kernel_state(
        buffer: &mut KernelStateBuffer,
        state: &KernelState,
    ) -> Box<KernelState> {
        if buffer.len() > 0 {
            let mut i: usize = 0;

            while i < buffer.len() {
                let a = buffer.data[i].as_ref();
                if !a.VALID && a.refs < 1 {
                    let mut invalid_ptr = buffer.remove_state_at_index(i);
                    let mut invalid_state = invalid_ptr.as_mut();

                    invalid_state.reset();

                    return invalid_ptr;
                }
                i += 1;
            }
        }

        return Box::new(KernelState::new(
            state.instructions.as_ptr(),
            state.instructions.len(),
            state.lexer.input.as_ptr(),
            state.lexer.input.len(),
        ));
    }
}
