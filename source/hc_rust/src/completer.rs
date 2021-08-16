use super::core_parser::recognize;
use super::core_parser::ParserState;
use super::core_parser::ParserStateBuffer;
use super::core_parser::ParserStateIterator;
use super::core_parser::StackFunction;

#[derive(Debug)]
pub struct ASTRefString {
    offset: usize,
    length: usize,
}

impl ASTRefString {
    pub fn slice<'a>(&self, source: &'a [u8]) -> &'a [u8] {
        return &source[self.offset..(self.offset + self.length)];
    }
}

#[derive(Debug)]
pub enum ASTRef<T> {
    FAILED_TOKEN(ASTRefString),
    STRING(ASTRefString),
    NODE(T),
    NONE,
}

type BoxedASTRef<T> = Box<ASTRef<T>>;
type OptionedBoxedASTRef<T> = Option<BoxedASTRef<T>>;

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
        if let Some(longest_success) = success.get_data_as_ref(0) {
            return convert_fork_to_astref(longest_success, reduce_functions);
        }
    } else if failure.len() > 0 {
        if let Some(longest_failure) = failure.get_data_as_ref(0) {
            return Some(Box::new(ASTRef::NONE));
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

    #[derive(Debug)]
    struct Number {
        tempo: u32,
    }

    #[derive(Debug)]
    struct VALUE {
        tempo: Box<ASTRef<Test>>,
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

    fn testNodeBuilder(mut data: Vec<Box<ASTRef<Test>>>, body_len: u32) -> Box<ASTRef<Test>> {
        let tempo = data.remove(0);
        Box::new(ASTRef::NODE(Test::NUMBER(VALUE { tempo })))
    }

    static D: [ReduceFunction<Test>; 1] = [testNodeBuilder];

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
                }
            }
        }

        println!("{:?}", result);
        //drop(result);

        println!("{:?}", string);
    }
}
