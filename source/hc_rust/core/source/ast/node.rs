use crate::{completer, Token, UTF8StringReader};

pub type ReduceFunction<T> = fn(args: &mut Vec<HCObj<T>>, tok: Token) -> HCObj<T>;

#[derive(Debug, Clone)]
pub enum HCObj<T: 'static> {
    NONE,
    LAZY(Lazy),
    NODE(T),
    NODES(Vec<T>),
    STRING(String),
    STRINGS(Vec<String>),
    DOUBLE(f64),
    TOKEN(Token),
    TOKENS(Vec<Token>),
    BOOL(bool),
    OBJECTS(Vec<HCObj<T>>),
}

pub trait HCObjTrait {
    fn String(&self) -> String;
    fn Double(&self) -> f64 {
        0.0
    }
    fn BOOL(&self) -> bool {
        false
    }
}

pub type HCNodeIterator<T> = Fn(T, T, i32, i32) -> bool;

pub trait ASTNodeTraits<T> {
    fn Iterate(self: &mut Box<Self>, _yield: HCNodeIterator<T>, parent: T, i: i32, j: i32);
    fn Replace(self: &mut Box<Self>, child: T, i: i32, j: i32) -> T;
    fn Token(&self) -> Token;
    fn Type() -> u32;
    fn GetType(&self) -> u32;
}

impl<T: HCObjTrait> HCObjTrait for HCObj<T> {
    fn String(&self) -> String {
        match self {
            HCObj::NODE(node) => node.String(),
            &HCObj::BOOL(val) => val.to_string(),
            &HCObj::TOKEN(val) => val.String(),
            _ => String::from(""),
        }
    }
    fn BOOL(&self) -> bool {
        match self {
            HCObj::NODE(node) => node.BOOL(),
            &HCObj::BOOL(val) => val,
            _ => false,
        }
    }
    fn Double(&self) -> f64 {
        match self {
            HCObj::NODE(node) => node.Double(),
            &HCObj::BOOL(val) => (val as u64) as f64,
            _ => 0.0,
        }
    }
}
#[derive(Debug, Clone)]
pub struct Lazy {
    tok: Token,
    entry_pointer: u32,
    bytecode: &'static [u32],
}
/* impl Lazy<_> {
    fn parse_scope(&self) {
        let string = "";
        let reader = UTF8StringReader::new(string.as_bytes());
        let result = completer(reader, self.bytecode, self.entry_pointer, self.functions);
    }
} */
