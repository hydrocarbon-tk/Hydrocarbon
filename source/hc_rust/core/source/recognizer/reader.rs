use crate::{
    getTypeAt, get_token_length_from_code_point, get_utf8_byte_length_from_code_point,
    get_utf8_code_point_from,
};

pub trait ByteReader {
    /**
     * Returns true if the cursor has reached the end of
     * the input stream.
     */
    fn END(&self) -> bool;

    fn offsetAtEND(&self, offset: u32) -> bool {
        self.length() <= offset
    }

    /**
     * Advances the cursor up-to 4-bytes forward and
     * returns a Word (4byte) covering the next 4 bytes at
     * the new cursor position.
     *
     * If the cursor has reached the end of the input stream
     * then the previous byte value is returned.
     */
    fn next(&mut self, amount: u32);

    /**
     * Returns the word at the current cursor position, little
     * Endian
     */
    fn word(&self) -> u32;

    /**
     * Returns the byte at the current cursor position.
     */
    fn byte(&self) -> u8;

    /**
     * Returns the byte at the current cursor position.
     */
    fn length(&self) -> u32;

    /**
     * Resets the cursor back to the value of the `offset`
     * argument. Should the offset value exceed the limits
     * of the underlying implementation, `false` is returned
     * , indicating a parse failure as the input stream can
     * no longer satisfy the requirements of the parser.
     */
    fn setTo(&mut self, offset: u32) -> bool;

    /**
     * Return a new instance of byte reader with the same
     * state as the source reader. Implementation should provide
     * adequate shared buffers or other resources used to cache the input
     * stream data, as multiple ByteReaders may be required read
     * data at different cursor positions.
     */
    fn clone(&self) -> Self;
    /**
     * Returns UTF8 codepoint information at the current cursor position.
     */
    fn codepoint(&self) -> u32 {
        return get_utf8_code_point_from(self.codepoint());
    }

    fn codepoint_byte_length(&self) -> u32 {
        return get_utf8_byte_length_from_code_point(self.codepoint());
    }

    fn codepoint_length(&self) -> u32 {
        return get_token_length_from_code_point(self.codepoint());
    }

    fn class(&self) -> u32 {
        return getTypeAt(self.codepoint());
    }
}

pub struct UTF8StringReader {
    length: usize,
    cursor: usize,
    string: &'static [u8],
    word: u32,
    codepoint: u32,
}

impl UTF8StringReader {
    pub fn new(string: &'static [u8]) -> UTF8StringReader {
        let mut reader = UTF8StringReader {
            length: string.len(),
            string: string,
            cursor: 0,
            word: 0,
            codepoint: 0,
        };
        reader.next(0);
        reader
    }
}

impl ByteReader for UTF8StringReader {
    fn END(&self) -> bool {
        self.cursor >= self.length
    }

    fn setTo(&mut self, offset: u32) -> bool {
        self.cursor = offset as usize;
        true
    }

    fn clone(&self) -> Self {
        UTF8StringReader {
            length: self.length,
            string: self.string,
            cursor: self.cursor,
            word: self.word,
            codepoint: self.codepoint,
        }
    }

    fn length(&self) -> u32 {
        self.length as u32
    }

    fn byte(&self) -> u8 {
        self.string[self.cursor]
    }

    fn word(&self) -> u32 {
        self.word
    }

    fn codepoint(&self) -> u32 {
        self.codepoint
    }

    fn next(&mut self, amount: u32) {
        self.cursor += amount as usize;

        self.codepoint = 0;

        if self.END() {
            return;
        }

        if amount == 1 {
            self.word = (self.word >> 8) | ((self.byte() as u32) << 24);
        } else {
            let diff =
                std::cmp::max(std::cmp::min(4, (self.length - self.cursor) as i32), 0) as u32;

            let start = self.cursor as u32;

            let end = self.cursor as u32 + (diff as u32);

            let mut word = 0 as u32;

            let mut offset = 32 as u32;

            for i in start..end {
                offset -= 8;
                word |= (self.string[i as usize] as u32) << offset;
            }

            self.word = word;
        }

        self.codepoint = get_utf8_code_point_from(self.word);
    }
}
