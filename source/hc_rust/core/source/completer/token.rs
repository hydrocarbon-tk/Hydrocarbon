#[derive(Debug, Copy, Clone)]
pub struct Token {
    length: usize,
    offset: usize,
    _line: usize,
}

impl Token {
    pub fn new(length: usize, offset: usize, line: usize) -> Token {
        Token {
            length,
            offset,
            _line: line,
        }
    }

    pub fn set_path() {}

    pub fn setSource() {}

    pub fn token_from_range(start: Token, end: Token) -> Token {
        return Token {
            length: end.offset - start.offset + end.length,
            offset: start.offset,
            _line: start._line,
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
            end = min(
                self.offset as i32 + start,
                (self.offset + self.length) as i32,
            )
        }

        if end < start {
            end = self.offset as i32;
            start = self.offset as i32;
        }

        (start as usize, end as usize)
    }

    fn get_range(&self, input: &[u8], start: i32, end: i32) -> (usize, usize, usize, usize) {
        let (adjusted_start, adjusted_end) = self.get_slice_range(start, end);

        let start_line = self._line;
        let mut start_col: usize = 0;
        let mut end_line = self._line;

        for i in (1..=adjusted_start).rev() {
            start_col += 1;
            if input[i] == 10 {
                break;
            }
        }

        let mut end_col = start_col;

        for i in adjusted_start..adjusted_end {
            if input[i] == 10 {
                end_line += 1;
                end_col = 0;
            }

            end_col += 1;
        }

        (start_line, start_col, end_line, end_col)
    }

    fn slice<'a>(&self, input: &'a [u8], start: i32, end: i32) -> &'a [u8] {
        let (adjusted_start, adjusted_end) = self.get_slice_range(start, end);

        return &input[adjusted_start..adjusted_end];
    }

    fn string<'a>(&self, input: &'a [u8]) -> &'a str {
        use std::str;

        let result = str::from_utf8(self.slice(
            input,
            self.offset as i32,
            (self.offset + self.length) as i32,
        ));

        if let Ok(string) = result {
            string
        } else {
            ""
        }
    }
}
