use crate::Token;

pub type ReduceFunction<T> = fn(args: &mut Vec<HCObj<T>>, tok: Token);

#[derive(Debug, Clone)]
pub enum HCObj<T: 'static> {
    NONE,
    LAZY(Lazy),
    NODE(T),
    NODES(Vec<T>),
    STRING(String),
    STRINGS(Vec<String>),
    F64(f64),
    F32(f32),
    I64(i64),
    I32(i32),
    I16(i16),
    I8(i8),
    TOKEN(Token),
    TOKENS(Vec<Token>),
    BOOL(bool),
    OBJECTS(Vec<HCObj<T>>),
}

pub trait HCObjTrait {
    fn String(&self) -> String;
    fn to_f64(&self) -> f64 {
        0.0
    }
    fn to_f32(&self) -> f32 {
        0.0
    }
    fn to_i64(&self) -> i64 {
        0
    }
    fn to_i32(&self) -> i32 {
        0
    }
    fn to_i16(&self) -> i16 {
        0
    }
    fn to_i8(&self) -> i8 {
        0
    }
    fn to_bool(&self) -> bool {
        false
    }
    fn Token(&self) -> Token {
        Token::empty()
    }
}

impl<T: HCObjTrait> HCObjTrait for HCObj<T> {
    fn String(&self) -> String {
        match self {
            HCObj::NODE(node) => node.String(),
            &HCObj::BOOL(val) => {
                if val {
                    String::from("true")
                } else {
                    String::from("false")
                }
            }
            HCObj::STRING(string) => string.to_owned(),
            HCObj::TOKEN(val) => val.String(),
            _ => String::from(""),
        }
    }

    fn Token(&self) -> Token {
        match self {
            HCObj::TOKEN(val) => val.clone(),
            _ => Token::empty(),
        }
    }

    fn to_bool(&self) -> bool {
        match self {
            HCObj::TOKEN(tok) => match tok.String().parse::<f64>() {
                Err(_) => false,
                Ok(val) => val != 0.0,
            },
            HCObj::F64(val) => *val != 0.0,
            HCObj::F32(val) => *val != 0.0,
            HCObj::I64(val) => *val != 0,
            HCObj::I32(val) => *val != 0,
            HCObj::I16(val) => *val != 0,
            HCObj::I8(val) => *val != 0,
            HCObj::NODE(node) => node.to_bool(),
            &HCObj::BOOL(val) => val,
            _ => false,
        }
    }
    fn to_f64(&self) -> f64 {
        match self {
            HCObj::TOKEN(tok) => match tok.String().parse::<f64>() {
                Err(_) => f64::NAN,
                Ok(val) => val,
            },
            HCObj::STRING(str) => str.parse::<f64>().unwrap(),
            HCObj::F64(val) => *val,
            HCObj::F32(val) => *val as f64,
            HCObj::I64(val) => *val as f64,
            HCObj::I32(val) => *val as f64,
            HCObj::I16(val) => *val as f64,
            HCObj::I8(val) => *val as f64,
            HCObj::NODE(node) => node.to_f64(),
            &HCObj::BOOL(val) => (val as u64) as f64,
            _ => 0.0,
        }
    }
    fn to_f32(&self) -> f32 {
        match self {
            HCObj::STRING(str) => str.parse::<f32>().unwrap(),
            HCObj::TOKEN(tok) => match tok.String().parse::<f32>() {
                Err(_) => f32::NAN,
                Ok(val) => val,
            },
            HCObj::F64(val) => *val as f32,
            HCObj::F32(val) => *val,
            HCObj::I64(val) => *val as f32,
            HCObj::I32(val) => *val as f32,
            HCObj::I16(val) => *val as f32,
            HCObj::I8(val) => *val as f32,
            HCObj::NODE(node) => node.to_f32(),
            &HCObj::BOOL(val) => (val as u32) as f32,
            _ => 0.0,
        }
    }
    fn to_i64(&self) -> i64 {
        match self {
            HCObj::STRING(str) => str.parse::<i64>().unwrap(),
            HCObj::TOKEN(tok) => match tok.String().parse::<i64>() {
                Err(_) => 0,
                Ok(val) => val,
            },
            HCObj::F64(val) => *val as i64,
            HCObj::F32(val) => *val as i64,
            HCObj::I64(val) => *val,
            HCObj::I32(val) => *val as i64,
            HCObj::I16(val) => *val as i64,
            HCObj::I8(val) => *val as i64,
            HCObj::NODE(node) => node.to_i64(),
            &HCObj::BOOL(val) => (val as i64),
            _ => 0,
        }
    }

    fn to_i32(&self) -> i32 {
        match self {
            HCObj::STRING(str) => str.parse::<i32>().unwrap(),
            HCObj::TOKEN(tok) => match tok.String().parse::<i32>() {
                Err(_) => 0,
                Ok(val) => val,
            },
            HCObj::F64(val) => *val as i32,
            HCObj::F32(val) => *val as i32,
            HCObj::I64(val) => *val as i32,
            HCObj::I32(val) => *val,
            HCObj::I16(val) => *val as i32,
            HCObj::I8(val) => *val as i32,
            HCObj::NODE(node) => node.to_i32(),
            &HCObj::BOOL(val) => (val as i32),
            _ => 0,
        }
    }

    fn to_i16(&self) -> i16 {
        match self {
            HCObj::STRING(str) => str.parse::<i16>().unwrap(),
            HCObj::TOKEN(tok) => match tok.String().parse::<i16>() {
                Err(_) => 0,
                Ok(val) => val,
            },
            HCObj::F64(val) => *val as i16,
            HCObj::F32(val) => *val as i16,
            HCObj::I64(val) => *val as i16,
            HCObj::I32(val) => *val as i16,
            HCObj::I16(val) => *val,
            HCObj::I8(val) => *val as i16,
            HCObj::NODE(node) => node.to_i16(),
            &HCObj::BOOL(val) => (val as i16),
            _ => 0,
        }
    }

    fn to_i8(&self) -> i8 {
        match self {
            HCObj::STRING(str) => str.parse::<i8>().unwrap(),
            HCObj::TOKEN(tok) => match tok.String().parse::<i8>() {
                Err(_) => 0,
                Ok(val) => val,
            },
            HCObj::F64(val) => *val as i8,
            HCObj::F32(val) => *val as i8,
            HCObj::I64(val) => *val as i8,
            HCObj::I32(val) => *val as i8,
            HCObj::I16(val) => *val as i8,
            HCObj::I8(val) => *val,
            HCObj::NODE(node) => node.to_i8(),
            &HCObj::BOOL(val) => (val as i8),
            _ => 0,
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
