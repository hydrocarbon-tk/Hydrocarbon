use super::character_lookup_table::CHAR_LU_TABLE;

/////////////////////////////////////////////
// LEXER
/////////////////////////////////////////////

#[derive(Debug, Copy, Clone)]
pub struct Lexer {
    pub byte_offset: u32,
    pub token_offset: u32,
    pub token_length: u16,
    pub byte_length: u16,
    pub prev_byte_offset: u32,
    pub prev_token_offset: u32,
    pub line: u16,
    pub _type: i32,
    pub current_byte: u8,
    pub active_token_productions: u32,
    pub input: &'static [u8],
}

impl Lexer {
    pub fn new<'a>(input_buffer: *const u8, input_len_in: usize) -> Lexer {
        use std::slice;

        let u8_slice: &[u8] = unsafe { slice::from_raw_parts(input_buffer, input_len_in) };

        Lexer {
            byte_offset: 0,
            token_offset: 0,
            byte_length: 0,
            token_length: 0,
            prev_byte_offset: 0,
            prev_token_offset: 0,
            active_token_productions: 0,
            _type: 0,
            line: 0,
            current_byte: 0,
            input: u8_slice,
        }
    }

    pub fn setToken(&mut self, type_in: i32, byte_length_in: u32, token_length_in: u32) -> i32 {
        self._type = type_in;
        self.byte_length = byte_length_in as u16;
        self.token_length = token_length_in as u16;
        return type_in;
    }

    pub fn get_byte_at(&self, index: usize) -> u8 {
        self.input[index]
    }

    pub fn getType(&mut self, USE_UNICODE: bool) -> i32 {
        let mut _type: i32 = self._type;

        if self.END() {
            return 1;
        }

        if (_type) == 0 {
            if !USE_UNICODE || self.current_byte < 128 {
                _type = get_type_at(self.current_byte as u32);
            } else {
                {
                    let code_point: u32 =
                        get_utf8_code_point_at(self.byte_offset as usize, self.input);

                    self.byte_length = get_ut8_byte_length_from_code_point(code_point) as u16;

                    _type = get_type_at(code_point);
                }
            };
        }
        _type
    }

    pub fn isSym(&mut self, USE_UNICODE: bool) -> bool {
        if (self._type) == 0 && self.getType(USE_UNICODE) == 2 {
            self._type = 2;
        };
        return (self._type) == 2;
    }

    pub fn isNL(&mut self) -> bool {
        if (self._type) == 0 && (self.current_byte) == 10 || (self.current_byte) == 13 {
            self._type = 7;
        };
        return (self._type) == 7;
    }

    pub fn isSP(&mut self, USE_UNICODE: bool) -> bool {
        if (self._type) == 0 && (self.current_byte) == 32 {
            self._type = 8;
        };
        return (self._type) == 8;
    }

    pub fn isNum(&mut self) -> bool {
        if (self._type) == 0 {
            if self.getType(false) == 5 {
                let l: usize = self.input.len() as usize;

                let mut off: usize = self.byte_offset as usize;

                while off < l {
                    off += 1;
                    if (48 > self.input[off]) || (self.input[off] > 57) {
                        break;
                    };
                    self.byte_length += 1;
                    self.token_length += 1;
                }
                self._type = 5;
                return true;
            } else {
                return false;
            };
        } else {
            return (self._type) == 5;
        };
    }

    pub fn isUniID(&mut self) -> bool {
        if (self._type) == 0 {
            if self.getType(true) == 3 {
                let l: usize = self.input.len() as usize;

                let off: usize = self.byte_offset as usize;

                let mut prev_byte_len: usize = self.byte_length as usize;

                while (off + self.byte_length as usize) < l {
                    let code_point = get_utf8_code_point_at(
                        (self.byte_offset as u32 + self.byte_length as u32) as usize,
                        self.input,
                    );

                    if ((96) & CHAR_LU_TABLE[code_point as usize]) > 0 {
                        self.byte_length += get_ut8_byte_length_from_code_point(code_point) as u16;
                        prev_byte_len = self.byte_length as usize;
                        self.token_length += 1;
                    } else {
                        {
                            break;
                        }
                    };
                }
                self.byte_length = prev_byte_len as u16;
                self._type = 3;
                return true;
            } else {
                return false;
            };
        } else {
            return (self._type) == 3;
        }
    }

    pub fn copy_in_place(&self) -> Lexer {
        let mut destination: Lexer = Lexer::new(self.input.as_ptr(), self.input.len());
        destination.sync(self);
        return destination;
    }

    pub fn sync(&mut self, source: &Lexer) {
        self.byte_offset = source.byte_offset;
        self.byte_length = source.byte_length;
        self.token_length = source.token_length;
        self.token_offset = source.token_offset;
        self.prev_byte_offset = source.prev_byte_offset;
        self.prev_byte_offset = self.prev_token_offset;
        self.line = source.line;
        self._type = source._type;
        self.current_byte = source.current_byte;
        self.active_token_productions = self.active_token_productions;
    }
    pub fn set_token_span_to(&mut self, source: &Lexer) {
        self.byte_length = (source.prev_byte_offset - self.byte_offset) as u16;
        self.token_length = (source.prev_token_offset - self.token_offset) as u16;
        self._type = source._type;
    }

    pub fn next(&mut self) {
        self.byte_offset += self.byte_length as u32;
        self.token_offset += self.token_length as u32;
        if self.input.len() <= self.byte_offset as usize {
            self._type = 1;
            self.byte_length = 0;
            self.token_length = 0;
            self.current_byte = 0;
        } else {
            {
                self.current_byte = self.input[self.byte_offset as usize];
                if (self.current_byte) == 10 {
                    self.line += 1
                };
                self._type = 0;
                self.byte_length = 1;
                self.token_length = 1;
            }
        };
    }
    pub fn END(&mut self) -> bool {
        return self.byte_offset as usize >= self.input.len();
    }
}

/////////////////////////////////////////////
// OTHER FUNCTIONS
/////////////////////////////////////////////

fn get_ut8_byte_length_from_code_point(code_point: u32) -> u8 {
    if (code_point) == 0 {
        return 1;
    } else if (code_point & 0x7F) == code_point {
        return 1;
    } else if (code_point & 0x7FF) == code_point {
        return 2;
    } else if (code_point & 0xFFFF) == code_point {
        return 3;
    } else {
        return 4;
    }
}

fn get_utf8_code_point_at(index: usize, buffer: &[u8]) -> u32 {
    let a: u32 = buffer[(index + 0)] as u32;
    let mut b: u32 = buffer[(index + 1)] as u32;
    let mut c: u32 = buffer[(index + 2)] as u32;
    let mut d: u32 = buffer[(index + 3)] as u32;

    let flag: u32 = a << 24 | b << 16 | c << 8 | d;

    if flag & 0x80000000 > 0 {
        b &= 0x3F;

        if (flag & 0xE0C00000) == 0xC0800000 {
            return ((a & 0x1F) << 6) | b;
        }
        c &= 0x3F;

        if (flag & 0xF0C0C000) == 0xE0808000 {
            return ((a & 0xF) << 12) | (b << 6) | c;
        }
        d &= 0x3F;

        if (flag & 0xF8C0C0C0) == 0xF0808080 {
            return ((a & 0x7) << 18) | (b << 12) | (c << 6) | d;
        }
    } else {
        return a;
    };

    0
}

fn get_type_at(code_point: u32) -> i32 {
    (CHAR_LU_TABLE[code_point as usize] & 0x1F) as i32
}
