use std::fmt;

use crate::ByteReader;

#[derive(Clone, Copy)]
pub struct Token {
    length: u32,
    offset: u32,
    _line: u32,
    input: Option<&'static [u8]>,
}

impl fmt::Debug for Token {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let mut bug = f.debug_struct("Token");

        bug.field("length", &self.length)
            .field("offset", &self.offset)
            .field("line", &self._line);

        if let Some(_) = self.input {
            bug.field("value", &self.String());
        }

        bug.finish()
    }
}

impl Token {
    pub fn new(length: u32, offset: u32, line: u32) -> Token {
        Token {
            length,
            offset,
            _line: line,
            input: None,
        }
    }

    pub fn set_path() {}

    pub fn set_source<Reader: ByteReader>(&mut self, rdr: &Reader) {
        self.input = rdr.getSource();
    }

    pub fn token_from_range(start: Token, end: Token) -> Token {
        return Token {
            length: end.offset - start.offset + end.length,
            offset: start.offset,
            _line: start._line,
            input: start.input,
        };
    }

    fn get_slice_range(&self, mut start: i32, mut end: i32) -> (usize, usize) {
        use std::cmp::{max, min};

        if start < 0 {
            start = max(
                self.offset as i32,
                (self.offset + self.length) as i32 + start,
            )
        } else {
            start = min(
                self.offset as i32 + start,
                (self.offset + self.length) as i32,
            )
        }

        if end < 0 {
            end = max(self.offset as i32, (self.offset + self.length) as i32 + end)
        } else {
            end = min(self.offset as i32 + end, (self.offset + self.length) as i32)
        }

        if end < start {
            end = self.offset as i32;
            start = self.offset as i32;
        }

        (start as usize, end as usize)
    }

    fn get_range(&self, input: &[u8], start: i32, end: i32) -> (u32, u32, u32, u32) {
        let (adjusted_start, adjusted_end) = self.get_slice_range(start, end);

        let start_line = self._line;
        let mut start_col: u32 = 0;
        let mut end_line = self._line;

        for i in (1..=adjusted_start).rev() {
            start_col += 1;
            if input[i] == 10 {
                break;
            }
        }

        let mut end_col = start_col as u32;

        for i in adjusted_start..adjusted_end {
            if input[i] == 10 {
                end_line += 1;
                end_col = 0;
            }

            end_col += 1;
        }

        (start_line, start_col, end_line, end_col)
    }

    fn slice<'a>(&self, start: i32, end: i32) -> String {
        if let Some(input) = self.input {
            let (adjusted_start, adjusted_end) = self.get_slice_range(start, end);
            return unsafe {
                String::from_utf8_unchecked(Vec::from(&input[adjusted_start..adjusted_end]))
            };
        }
        return String::from("");
    }

    pub fn String<'a>(&self) -> String {
        if let Some(_) = self.input {
            let result = self.slice(0 as i32, (self.length) as i32);

            return result;
        }

        String::from("")
    }
}
