use super::core_parser::recognize;
use super::core_parser::ParserState;
use super::core_parser::ParserStateBuffer;
use super::core_parser::ParserStateIterator;
use super::core_parser::StackFunction;

///
/// Base string container.
///
/// Does not store string data
/// but rather holds the offset and length of a given
/// token or run of tokens. The programmer is
/// required to provide the original string to the
/// implementation methods in order to extract the
/// underlying representation of the data.
#[derive(Debug)]
pub struct ASTRefString {
    offset: usize,
    length: usize,
}

impl ASTRefString {
    pub fn slice<'a>(&self, source: &'a [u8]) -> &'a [u8] {
        return &source[self.offset..(self.offset + self.length)];
    }
    //To utf8 string
    //To floating point
    //To integer
    /// fn metrics()->u32{5}

    /// Get information on the line and character offset of the of
    /// the ASTRefString
    /// (lines proceeding offset: u32, character offset from line start: u32)
    /// *
    pub fn metrics<'a>(&self, source: &'a [u8]) -> (u32, u32) {
        (0, 0)
    }

    /// Return a user friendly string reporting the unexpected
    /// condition that has occurred while parsing an input.
    pub fn report<'a>(&self, source: &'a [u8]) -> String {
        // Get the start of the line from the source string
        let length = source.len();

        // Find the proceeding line break relative to the offset.
        let mut index = self.offset;

        while index > 0 && source[index] != 10 {
            index -= 1;
        }

        //Get the number of proceeding lines

        let mut line_count = 1;

        while index > 0 {
            if source[index] != 10 {
                line_count += 1
            }
            index -= 1;
        }

        let slice_start = index;

        // Find the following line break relative to the offset.
        let mut index = self.offset;

        while index < length as usize && source[index] != 10 {
            index += 1;
        }

        let slice_end = index;

        //TODO: Keep the slice under a certain character limit ?
        let slice_length = slice_end - slice_start;

        use std::str;

        //Create the error message
        if self.offset >= length {
            // EOF Error message
            let message = String::from("Unexpected end of input");
            let pointer_string = " ".repeat(self.offset - slice_start) + "^";

            if let Ok(utf8_string) = str::from_utf8(&Vec::from(&source[slice_start..slice_end])) {
                return message + "\n" + utf8_string + "\n" + &pointer_string;
            }
        } else {
            // Unexpected token error message
            if let Ok(token) = str::from_utf8(&Vec::from(
                &source[self.offset..(self.offset + self.length)],
            )) {
                let message = format!(
                    "Unexpected token [{}] encountered at {}:{}:",
                    token,
                    line_count,
                    self.offset - slice_start
                );
                let pointer_string =
                    " ".repeat(self.offset - slice_start) + &("^".repeat(self.length));
                let ref string = Vec::from(&source[slice_start..slice_end]);
                if let Ok(utf8_string) = str::from_utf8(string) {
                    return message + "\n" + utf8_string + "\n" + &pointer_string + "\n";
                }
            }
        }

        String::from("Unable to produce error message")
    }
}
#[derive(Debug)]
pub enum ASTRef<T> {
    FAILED_TOKEN(ASTRefString),
    VECTOR(Vec<BoxedASTRef<T>>),
    STRING(ASTRefString),
    NODE(T),
    NONE,
}

pub type BoxedASTRef<T> = Box<ASTRef<T>>;
pub type OptionedBoxedASTRef<T> = Option<BoxedASTRef<T>>;

pub type ReduceFunction<T: std::fmt::Debug> =
    fn(Vec<BoxedASTRef<T>>, body_len: u32) -> BoxedASTRef<T>;

pub fn parser_core<T: std::fmt::Debug>(
    utf_8_input: &[u8],
    expected_resolved_id: i32,
    entry_functions: StackFunction,
    reduce_functions: &[ReduceFunction<T>],
) -> OptionedBoxedASTRef<T> {
    let rules_max_len = (utf_8_input.len() * 3) as u32;

    let (success, failure) = recognize(
        utf_8_input,
        utf_8_input.len() as u32,
        rules_max_len,
        expected_resolved_id,
        entry_functions,
    );

    if success.len() > 0 {
        if let Some(longest_success) = success.get_ref_state(0) {
            return convert_fork_to_astref(longest_success, reduce_functions);
        }
    } else if failure.len() > 0 {
        if let Some(longest_failure) = failure.get_ref_state(0) {
            return Some(Box::new(ASTRef::FAILED_TOKEN(ASTRefString {
                offset: longest_failure.lexer.byte_offset as usize,
                length: longest_failure.lexer.byte_length as usize,
            })));
        }
    }

    None
}

fn convert_fork_to_astref<T: std::fmt::Debug>(
    parser_data: &ParserState,
    reduce_functions: &[ReduceFunction<T>],
) -> OptionedBoxedASTRef<T> {
    let mut iter = ParserStateIterator::new(parser_data);
    let mut stack: Vec<BoxedASTRef<T>> = Vec::with_capacity(128);
    let mut stack_pointer: usize = 0;
    let mut token_offset: usize = 0;
    while let Some(instr) = iter.next() {
        let rule = instr & 3;

        match rule {
            0 => {
                let mut body = ((instr >> 8) & 0xFF) as usize;
                let mut len = ((instr >> 3) & 0x1F) as usize;

                if instr & 4 > 0 {
                    body = ((body >> 8) | len) as usize;
                    len = if let Some(high_instr) = iter.next() {
                        high_instr as usize
                    } else {
                        0
                    };
                }

                let range = stack
                    .drain((stack_pointer - len)..(stack_pointer))
                    .collect();

                stack.push(reduce_functions[body](range, len as u32));

                stack_pointer = stack_pointer - len + 1;
            }
            1 => {
                let mut len = ((instr >> 3) & 0x1FFF) as usize;

                if instr & 4 > 0 {
                    let high: usize = if let Some(high_instr) = iter.next() {
                        high_instr as usize
                    } else {
                        0
                    };

                    len = ((len << 16) | high) as usize;
                }

                stack.push(Box::new(ASTRef::STRING(ASTRefString {
                    offset: token_offset,
                    length: len,
                })));

                token_offset += len;

                stack_pointer += 1;
            }
            2 => {
                let mut len = ((instr >> 3) & 0x1FFF) as usize;

                if instr & 4 > 0 {
                    let high: usize = if let Some(high_instr) = iter.next() {
                        high_instr as usize
                    } else {
                        0
                    };
                    len = ((len << 16) | high) as usize;
                }

                token_offset += len;
            }
            _ => break,
        }
    }

    Some(stack.remove(0))
}

//*/
#[cfg(test)]
mod completer_test {

    use super::super::core_parser::add_reduce;
    use super::super::core_parser::consume;
    use super::*;

    type NodeRef = ASTRef<Test>;
    type BoxedNodeRef = Box<NodeRef>;

    #[derive(Debug)]
    struct Number {
        tempo: u32,
    }

    #[derive(Debug)]
    struct VALUE {
        tempo: BoxedNodeRef,
    }

    #[derive(Debug)]
    enum Test {
        NUMBER(VALUE),
    }

    fn testFNForked(
        data: &mut ParserState,
        buffer: &mut ParserStateBuffer,
        prop: i32,
        cache: i32,
    ) -> i32 {
        if data.lexer.current_byte == 41 {
            data.lexer.setToken(65, 3, 3);
            consume(data);
            add_reduce(data, 1, 0);
            return 0;
        }
        -1
    }

    static D: [ReduceFunction<Test>; 1] = [
        |mut data: Vec<BoxedNodeRef>, body_len: u32| -> BoxedNodeRef {
            let tempo = data.remove(0);
            Box::new(ASTRef::NODE(Test::NUMBER(VALUE { tempo })))
        },
    ];

    #[test]
    fn it_should_complete_a_parse_run1() {
        let string: [u8; 3] = [41, 42, 43];
        let z = &string;

        let result = parser_core(z, 0, testFNForked, &D);

        if let Some(ref node) = result {
            if let ASTRef::NODE(ref a) = node.as_ref() {
                let Test::NUMBER(ref val) = a;
                if let ASTRef::STRING(ref _string) = val.tempo.as_ref() {
                    println!("{:?}", std::str::from_utf8(_string.slice(&string)));
                    assert_eq!(std::str::from_utf8(_string.slice(&string)), Ok(")*+"))
                }
            }
        }
    }
}
