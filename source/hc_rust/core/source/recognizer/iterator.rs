use std::iter::Scan;

use crate::UTF8StringReader;

use super::reader::ByteReader;
use super::stack::KernelStack;

//Global Constants
const state_index_mask: u32 = (1 << 24) - 1;
const fail_state_mask: u32 = 1 << 27;
const normal_state_mask: u32 = 1 << 26;
const goto_state_mask: u32 = 1 << 25;
const alpha_increment_stack_pointer_mask: u32 = 1 << 0;
const alpha_have_default_action_mask: u32 = 1 << 1;
const production_scope_pop_pointer: u32 = 2;
const instruction_pointer_mask: u32 = 0xFFFFFF;

#[derive(Debug, Copy, Clone)]
pub struct KernelToken {
    typ: u16,
    byte_offset: u32,
    byte_length: u32,
    cp_offset: u32,
    cp_length: u32,
    line: u32,
}

impl KernelToken {
    fn new() -> KernelToken {
        KernelToken {
            typ: 0,
            byte_offset: 0,
            byte_length: 0,
            cp_offset: 0,
            cp_length: 0,
            line: 0,
        }
    }

    fn next(&self) -> KernelToken {
        return KernelToken {
            typ: 0,
            byte_length: 0,
            cp_length: 0,
            cp_offset: self.cp_offset + self.cp_length,
            byte_offset: self.byte_offset + self.byte_length,
            line: 0,
        };
    }
}

#[derive(Debug, Copy, Clone)]
pub enum ParseAction {
    NONE {},
    REDUCE {
        body: u32,
        production: u32,
        length: u32,
    },
    ACCEPT {},
    ERROR {
        production: u32,
    },
    SHIFT {
        length: u32,
        line: u32,
        token_type: u32,
    },
    SKIP {
        length: u32,
        line: u32,
        token_type: u32,
    },
    TOKEN {
        token: KernelToken,
    },
    FORK {},
}

/*
* This represents the core context in which a parser machine
* operators.
*
* It yields parse Actions and reduce information that can be consumed
* by completers to apply reduce actions on the token values
*/
pub struct StateIterator<T: ByteReader> {
    stack: KernelStack,

    bytecode: &'static [u32],

    reader: T,

    forks: [u32; 8],

    buffer: [ParseAction; 8],

    tokens: [KernelToken; 8],

    symbol_accumulator: u32,

    action_buffer_start: usize,

    action_buffer_end: usize,

    token_end: usize,

    production_id: u32,

    SCANNER: bool,
}

impl<T: ByteReader> StateIterator<T> {
    pub fn new(
        reader: T,
        bytecode: &'static [u32],
        entry_pointer: u32,
        IS_SCANNER: bool,
    ) -> StateIterator<T> {
        let mut iterator = StateIterator {
            stack: KernelStack::new(),
            reader: reader,
            bytecode: bytecode,
            forks: [0; 8],
            buffer: [ParseAction::NONE {}; 8],
            tokens: [KernelToken::new(); 8],
            symbol_accumulator: 0,
            action_buffer_start: 0,
            action_buffer_end: 0,
            production_id: 0,
            token_end: 1,
            SCANNER: IS_SCANNER,
        };

        iterator.stack.reset(entry_pointer);

        iterator
    }

    pub fn nextAction(&mut self) -> ParseAction {
        let mut fail_mode: u32 = 0;

        if self.action_buffer_start != self.action_buffer_end {
            let index = self.action_buffer_start;

            self.action_buffer_start = (index + 1) & 0x7;

            return self.buffer[index];
        }

        while self.action_buffer_start == self.action_buffer_end {
            for _ in 0..2 {
                let state = self.stack.pop_state();

                if state < 1 {
                    if self.SCANNER {
                        let mut token = self.tokens[0];
                        let tokenB = self.tokens[1];

                        token.byte_length = tokenB.byte_offset - token.byte_offset;
                        token.cp_length = tokenB.cp_offset - token.cp_offset;

                        return ParseAction::TOKEN { token };
                    }

                    if self.reader.END() {
                        return ParseAction::ACCEPT {};
                    } else {
                        return ParseAction::ERROR {
                            production: self.production_id,
                        };
                    }
                } else {
                    let mask_gate = normal_state_mask << fail_mode;

                    if (mask_gate & state) != 0 {
                        fail_mode = self.instruction_executor(state, fail_mode);
                        //coz::progress!();
                    }
                }
            }
        }

        self.nextAction()
    }

    //*
    fn instruction_executor(&mut self, state_pointer: u32, fail_mode: u32) -> u32 {
        let mut index = (state_pointer & state_index_mask) as usize;

        let recover_data = 0; //self.stack.meta_stack[(self.stack.stack_pointer as usize) + 1];

        loop {
            let instruction = self.bytecode[index];

            index += 1;

            match ((instruction >> 28) & 0xF) as u8 {
                1 => {
                    index = self.consume(index, instruction, fail_mode);
                }

                2 => {
                    index = self.goto(index, instruction, fail_mode);
                }

                3 => {
                    index = self.set_production(index, instruction, fail_mode);
                }

                4 => {
                    index = self.reduce(index, instruction, fail_mode);
                }

                5 => {
                    index = self.set_token(index, instruction, fail_mode);
                }

                6 => {
                    index = self.fork(index, instruction, fail_mode);
                }

                7 => {
                    index = self.scan_to(index, instruction, fail_mode);
                }

                8 => {
                    index = self.noop(index, instruction, fail_mode);
                }

                9 => {
                    index = self.index_jump(index, instruction, fail_mode);
                }

                10 => {
                    index = self.hash_jump(index, instruction, fail_mode);
                }

                11 => {
                    self.push_fail_state(index, instruction, fail_mode);
                }

                12 => {
                    index = self.repeat(index, instruction, fail_mode);
                }

                13 => {
                    index = self.noop(index, instruction, fail_mode);
                }

                14 => {
                    index = self.noop(index, instruction, fail_mode);
                }

                15 => {
                    index = self.advanced_return(index, instruction, fail_mode);
                }
                0 | _ => {
                    index = self.pass(index, instruction, fail_mode);
                }
            }

            //coz::progress!();

            if index < 2 {
                return index as u32;
            }
        }
    } //*/
    fn pushAction(&mut self, action: ParseAction) {
        let index = self.action_buffer_end;

        self.action_buffer_end = (index + 1) & 0x7;

        self.buffer[index] = action;
    }

    fn emitShift(&mut self) {
        let token = self.tokens[1];

        let prev_token = self.tokens[0];

        if prev_token.byte_offset + prev_token.byte_length != token.byte_offset {
            self.pushAction(ParseAction::SKIP {
                length: token.cp_offset - (prev_token.cp_length + prev_token.cp_offset),
                line: prev_token.line,
                token_type: 0,
            });
        }

        self.pushAction(ParseAction::SHIFT {
            length: token.cp_length,
            line: prev_token.line,
            token_type: token.typ as u32,
        });
    }

    fn emitReduce(&mut self, symbol_length: u32, body_id: u32) {
        self.pushAction(ParseAction::REDUCE {
            body: body_id,
            length: symbol_length,
            production: self.production_id,
        });
    }

    const INSTR: [fn(&mut StateIterator<T>, usize, u32, u32) -> usize; 16] = [
        StateIterator::pass,
        StateIterator::consume,
        StateIterator::goto,
        StateIterator::set_production,
        StateIterator::reduce,
        StateIterator::set_token,
        StateIterator::fork,
        StateIterator::scan_to,
        StateIterator::noop,
        StateIterator::index_jump,
        StateIterator::hash_jump,
        StateIterator::push_fail_state,
        StateIterator::repeat,
        StateIterator::noop,
        StateIterator::noop,
        StateIterator::advanced_return,
    ];

    fn instruction_executor2(&mut self, state_pointer: u32, fail_mode: u32) -> u32 {
        let mut index = (state_pointer & state_index_mask) as usize;

        loop {
            let instruction = self.bytecode[index];

            index += 1;

            let val = (instruction >> 28) as usize;

            index = StateIterator::INSTR[val](self, index, instruction, fail_mode);

            //coz::progress!();

            if index < 2 {
                return index as u32;
            }
        }
    }

    pub fn scanner(
        &mut self,
        mut current_token: KernelToken,
        scanner_start_pointer: u32,
    ) -> KernelToken {
        if current_token.typ == 0 {
            let mut reader = self.reader.clone();
            let mut scanner =
                StateIterator::new(reader, self.bytecode, scanner_start_pointer, true);

            scanner.tokens[1] = current_token;
            scanner.tokens[0] = current_token;

            loop {
                let result = scanner.nextAction();

                match result {
                    ParseAction::ACCEPT {} => {
                        break;
                    }
                    ParseAction::TOKEN { token } => {
                        if token.typ == 9999 {
                            scanner.stack.reset(scanner_start_pointer);

                            scanner.tokens[0] = scanner.tokens[1];

                            continue;
                        }

                        return token;
                    }
                    ParseAction::FORK {} => {
                        self.pushAction(ParseAction::ERROR {
                            production: self.production_id,
                        });
                    }
                    _ => {
                        self.pushAction(ParseAction::ERROR {
                            production: self.production_id,
                        });
                        break;
                    }
                }
            }
        }

        current_token
    }

    fn noop(&mut self, mut index: usize, ___: u32, _: u32) -> usize {
        return index;
    }

    fn pass(&mut self, mut __: usize, ___: u32, _: u32) -> usize {
        return 0;
    }

    fn goto(&mut self, mut index: usize, instruction: u32, _: u32) -> usize {
        self.stack.push_state(instruction);

        index
    }

    fn consume(&mut self, mut index: usize, instruction: u32, _: u32) -> usize {
        let mut token = self.tokens[1];
        let prev = self.tokens[0];

        if (instruction & 1) != 0 {
            token.cp_length = 0;
            token.byte_length = 0;
        }

        if self.SCANNER {
            self.reader.next(token.byte_length);

            token.cp_offset += token.cp_length;

            token.byte_offset += token.byte_length;

            token.cp_length = 0;

            token.byte_length = 0;

            token.typ = 0;
        } else {
            self.emitShift();

            self.reader
                .next(token.byte_offset - prev.byte_offset + token.byte_length);

            token.cp_offset += token.cp_length;

            token.byte_offset += token.byte_length;

            token.cp_length = 0;

            token.byte_length = 0;

            token.typ = 0;

            self.tokens[0] = token;
        }

        self.tokens[1] = token;

        index
    }

    fn reduce(&mut self, mut index: usize, instruction: u32, recover_data: u32) -> usize {
        let body_id = (instruction) & 0xFFFF;
        let length = (instruction >> 16) & 0xFFF;

        if (body_id & 0xFFFF) == 0xFFFF {
            let accumulated_symbols = self.symbol_accumulator - (recover_data & 0xFFFF0000);

            let len = accumulated_symbols >> 16;

            let fn_id = (instruction >> 16) & 0x0FFF;

            //Extract accumulated symbols inform
            self.emitReduce(len, fn_id);
        } else {
            self.emitReduce(length, body_id);
        }

        index
    }

    fn set_production(&mut self, mut index: usize, instruction: u32, _: u32) -> usize {
        self.production_id = instruction & 0xFFFFFFF;

        index
    }

    fn repeat(&mut self, mut index: usize, instruction: u32, _: u32) -> usize {
        let origin_offset = 0xFFFFFFF & instruction;

        index -= origin_offset as usize;

        index
    }

    fn push_fail_state(&mut self, mut index: usize, instruction: u32, _: u32) -> usize {
        let fail_state_pointer = instruction;

        let current_state = self.stack.read_state() & instruction_pointer_mask;
        //Only need to set new failure state if the previous state
        //Is not identical to the pending fail state.
        if current_state != ((fail_state_pointer) & instruction_pointer_mask) {
            self.stack.push_state(fail_state_pointer);
        } else {
            self.stack.swap_state(fail_state_pointer);
        }

        index
    }

    fn set_token(&mut self, mut index: usize, instruction: u32, _: u32) -> usize {
        let length = instruction & 0xFFFFFF;

        let token = &mut self.tokens[1];

        if (instruction & 0x08000000) != 0 {
            let data = self.bytecode;

            self.tokens[0].typ = data[index] as u16;

            index += 1;
        } else {
            token.cp_length = length;

            token.byte_length = length;
        }

        index
    }

    fn advanced_return(&mut self, mut index: usize, instruction: u32, fail_mode: u32) -> usize {
        if (instruction & 1) != 0 {
            return fail_mode as usize;
        }

        if !self.reader.END() {
            //self.state.lexer._type = 0;
            //self.state.lexer.token_length = 1;
            //self.state.lexer.byte_length = 1;
        }

        1 /* true */
    }

    fn fork(&mut self, mut index: usize, instruction: u32, _: u32) -> usize {
        index
    }

    fn scan_to(&mut self, mut index: usize, instruction: u32, _: u32) -> usize {
        /* let length = instruction & 0xFFFF;

        let scanner_start_pointer = self.bytecode[index];

        index += 1;

        let scan_back = (instruction & 0x00100000) > 0;

        let lexer = &mut self.state.lexer;

        let start_byte_offset = lexer.prev_byte_offset;

        let start_token_offset = lexer.prev_token_offset;

        lexer.byte_length = 1;

        let mut RUN = true;

        let start = index;

        let end = index + length as usize;

        let mut end_offset = lexer.input.len() as u32;

        index += length as usize;

        let mut temp_lexer = lexer.copy_in_place();

        if scan_back {
            // scan "backwards" towards the previously accepted token.
            // really we just set the scan start position to
            // lexer.previous_byte and end to the current position of
            // the lexer and rescan forward.
            end_offset = temp_lexer.byte_offset;
            temp_lexer.byte_offset = temp_lexer.prev_byte_offset;
            temp_lexer.token_offset = temp_lexer.prev_token_offset;
            temp_lexer.byte_length = 0;
            temp_lexer.token_length = 0;
            temp_lexer.next();
        }

        while RUN {
            {
                scanner(
                    self.state,
                    &mut { *(&self.state.lexer) },
                    scanner_start_pointer,
                );
            };
            for i in start..end {
                if temp_lexer.token_type == self.bytecode[i] as i32 {
                    RUN = false;
                    break;
                }
            }

            if !RUN {
                break;
            }

            if temp_lexer.byte_offset >= end_offset {
                return 1;
            }

            temp_lexer.next();
        }

        if !scan_back {
            //Reset peek stack;
            self.state.lexer.peek_unroll_sync(&mut temp_lexer);
            self.state.lexer.prev_byte_offset = start_byte_offset;
            self.state.lexer.prev_token_offset = start_token_offset;
        } */

        index
    }

    fn hash_jump(&mut self, mut index: usize, instruction: u32, _: u32) -> usize {
        let input_type = (instruction >> 22) & 0x7;

        let token_transition = (instruction >> 26) & 0x3;

        let scanner_start_pointer = self.bytecode[index];

        let table_data = self.bytecode[index + 1];

        index += 2;

        let modulus = (1 << ((table_data >> 16) & 0xFFFF)) - 1;

        let table_size = (table_data) & 0xFFFF;

        let hash_table_start = index as u32;

        let instruction_field_start = hash_table_start + table_size;

        let instruction_field_size = instruction & 0xFFFF;

        let input_value =
            self.get_input_value(input_type, token_transition, scanner_start_pointer) as u32;

        let mut hash_index = input_value & modulus;

        loop {
            let cell = self.bytecode[(hash_table_start + hash_index) as usize];

            let value = cell & 0x7FF;

            let next = ((cell >> 22) & 0x3FF) as i32 - 512;

            if value == input_value {
                let instruction_start = (cell >> 11) & 0x7FF;

                return (instruction_field_start + instruction_start) as usize;
            }

            if next == 0 {
                //Failure
                return (instruction_field_size + instruction_field_start) as usize;
            }

            hash_index = (hash_index as i32 + next) as u32;
        }
    }

    fn index_jump(&mut self, mut index: usize, instruction: u32, _: u32) -> usize {
        let scanner_start_pointer = self.bytecode[index];

        let table_data = self.bytecode[index + 1];

        index += 2;

        let basis__ = instruction & 0xFFFF;

        let input_type = (instruction >> 22) & 0x7;

        let token_transition = (instruction >> 26) & 0x3;

        let input_value =
            (self.get_input_value(input_type, token_transition, scanner_start_pointer)
                - (basis__ as i32)) as u32;

        let number_of_rows = table_data >> 16;

        let row_size = table_data & 0xFFFF;

        if input_value < number_of_rows {
            index + (input_value * row_size + row_size) as usize
        } else {
            // Use default behavior found at the beginning of the
            // jump table
            index
        }
    }

    fn get_input_value(
        &mut self,
        input_type: u32,
        token_transition: u32,
        scanner_start_pointer: u32,
    ) -> i32 {
        if input_type > 0 {
            // Lexer token id input

            if self.reader.END() {
                return 0;
            }

            if token_transition != 1 {
                /* set primary lexer */

                if self.token_end > 1 {
                    self.token_end = 1;

                    self.tokens[1].typ = 0;

                    if !self.reader.setTo(self.tokens[1].byte_offset) {
                        //self.error();
                        return 0;
                    };
                }

                match input_type {
                    1 => {
                        self.tokens[1] = self.scanner(self.tokens[1], scanner_start_pointer);
                        self.tokens[1].typ as i32
                    }

                    2 => {
                        let token = &mut self.tokens[self.token_end];
                        token.byte_length = self.reader.codepoint_byte_length();
                        token.cp_length = self.reader.codepoint_length();
                        self.reader.class() as i32
                    }
                    3 => {
                        let token = &mut self.tokens[self.token_end];
                        token.byte_length = self.reader.codepoint_byte_length();
                        token.cp_length = self.reader.codepoint_length();
                        self.reader.codepoint() as i32
                    }
                    4 => {
                        let token = &mut self.tokens[self.token_end];
                        token.byte_length = 1;
                        token.cp_length = 1;
                        self.reader.byte() as i32
                    }
                    _ => 0,
                }
            } else {
                /* set next peek lexer */

                let prev_token = self.tokens[self.token_end];

                self.token_end += 1;

                self.reader.next(prev_token.byte_length);

                self.tokens[self.token_end] = prev_token.next();

                match input_type {
                    1 => {
                        let token = self.tokens[self.token_end];

                        self.tokens[self.token_end] = self.scanner(token, scanner_start_pointer);

                        return self.tokens[self.token_end].typ as i32;
                    }

                    2 => {
                        let token = &mut self.tokens[self.token_end];
                        token.byte_length = self.reader.codepoint_byte_length();
                        token.cp_length = self.reader.codepoint_length();
                        return self.reader.class() as i32;
                    }
                    3 => {
                        let token = &mut self.tokens[self.token_end];
                        token.byte_length = self.reader.codepoint_byte_length();
                        token.cp_length = self.reader.codepoint_length();
                        return self.reader.codepoint() as i32;
                    }
                    4 => {
                        let token = &mut self.tokens[self.token_end];
                        token.byte_length = 1;
                        token.cp_length = 1;
                        return self.reader.byte() as i32;
                    }
                    _ => 0,
                }
            }
        } else {
            // Production id input
            self.production_id as i32
        }
    }
}
