
pub trait ASTValue {
    get_type(&self) -> u32;
    get_string(&self) -> str;
    get_double(&self) -> f64;
    get_token(&self) -> u32;
}

pub trait ASTNode {
    iterate(&self);
}

enum ASTValue {
    NONE,
    NODE(Box<ASTNode>),
    TOKEN(Token),
    STRING()
}