use super::lookup_table::CHAR_LU_TABLE;
use super::utf8::*;

/////////////////////////////////////////////
// LEXER
/////////////////////////////////////////////

#[derive(Debug, Copy, Clone)]
pub struct Lexer {
    pub byte_offset: u32,
    pub token_offset: u32,
    pub token_length: u32,
    pub byte_length: u32,
    pub prev_byte_offset: u32,
    pub prev_token_offset: u32,
    pub peek_byte_offset: u32,
    pub peek_token_offset: u32,
    pub token_type: i32,
    pub line: u32,
    pub input: &'static [u8],
}

impl Lexer {
    pub fn new(input_buffer: *const u8, input_len_in: usize) -> Lexer {
        use std::slice;

        let u8_slice: &[u8] = unsafe { slice::from_raw_parts(input_buffer, input_len_in) };

        Lexer {
            byte_offset: 0,
            token_offset: 0,
            byte_length: 1,
            token_length: 1,
            prev_byte_offset: 0,
            prev_token_offset: 0,
            peek_byte_offset: 0,
            peek_token_offset: 0,
            line: 0,
            token_type: 0,
            input: u8_slice,
        }
    }

    pub fn setToken(&mut self, type_in: i32, byte_length_in: u32, token_length_in: u32) -> i32 {
        self.token_type = type_in;
        self.byte_length = byte_length_in;
        self.token_length = token_length_in;
        return type_in;
    }

    pub fn get_byte_at(&self, index: usize) -> u8 {
        self.input[index]
    }

    pub fn codepoint(&mut self) -> u32 {
        let cp = get_utf8_code_point_at(self.byte_offset as usize, self.input);
        self.byte_length = get_utf8_byte_length_from_code_point(cp);
        self.token_length = get_token_length_from_code_point(cp);
        return cp;
    }

    pub fn class(&mut self) -> u32 {
        return getTypeAt(self.codepoint());
    }

    pub fn byte(&mut self) -> u32 {
        self.byte_length = 1;
        self.token_length = 1;
        return self.input[self.byte_offset as usize] as u32;
    }

    pub fn copy_in_place(&self) -> Lexer {
        let mut destination: Lexer = Lexer::new(self.input.as_ptr(), self.input.len());
        destination.peek_unroll_sync(self);
        return destination;
    }

    pub fn peek_unroll_sync(&mut self, source: &Lexer) {
        self.byte_offset = source.byte_offset;
        self.byte_length = source.byte_length;
        self.token_length = source.token_length;
        self.token_offset = source.token_offset;
        self.prev_byte_offset = source.prev_byte_offset;
        self.prev_token_offset = source.prev_token_offset;
        self.line = source.line;
        self.token_type = source.token_type;
    }

    pub fn scanner_sync(&mut self, source: &Lexer) {
        self.byte_offset = source.byte_offset;
        self.byte_length = source.byte_length;
        self.token_length = source.token_length;
        self.token_offset = source.token_offset;
        self.prev_byte_offset = self.byte_offset;
        self.prev_token_offset = self.byte_length;
        self.line = source.line;
        self.token_type = source.token_type;
    }

    pub fn sync_offsets(&mut self) {
        self.prev_byte_offset = self.byte_offset;
        self.prev_token_offset = self.token_offset;
    }

    pub fn set_token_span_to(&mut self, source: &Lexer) {
        if source.prev_byte_offset > self.byte_offset {
            self.byte_length = source.prev_byte_offset - self.byte_offset;
            self.token_length = source.prev_token_offset - self.token_offset;
        }
    }
    pub fn skip_delta(&mut self) -> u32 {
        return self.token_offset - self.prev_token_offset;
    }

    pub fn peek(&mut self) {
        self.byte_offset += self.byte_length as u32;
        self.token_offset += self.token_length as u32;
        if self.input.len() <= self.byte_offset as usize {
            self.token_type = 1;
            self.byte_length = 0;
            self.token_length = 0;
        } else {
            {
                if self.input[self.byte_offset as usize] == 10 {
                    self.line += 1
                };
                self.token_type = 0;
                self.byte_length = 1;
                self.token_length = 1;
            }
        };
    }

    pub fn next(&mut self) {
        self.peek();
        self.peek_byte_offset = self.byte_offset;
        self.peek_token_offset = self.token_offset;
    }

    pub fn consume(&mut self) {
        self.prev_byte_offset = self.byte_offset;
        self.prev_token_offset = self.token_offset;
    }

    pub fn reset(&mut self) {
        if self.byte_offset > self.peek_byte_offset {
            self.byte_offset = self.peek_byte_offset;
            self.token_offset = self.peek_token_offset;
            self.token_length = 1;
            self.byte_length = 1;
            self.token_type = 0;
        }
    }

    pub fn END(&mut self) -> bool {
        return self.byte_offset as usize >= self.input.len();
    }
}

fn getTypeAt(code_point: u32) -> u32 {
    (CHAR_LU_TABLE[code_point as usize] & 0x1F) as u32
}
