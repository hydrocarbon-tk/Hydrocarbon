use std::cell::UnsafeCell;

use candlelib_hydrocarbon::ast::{HCObj, HCObjTrait, ReduceFunction};

use candlelib_hydrocarbon::Token;

type RF = ReduceFunction<ASTNode>;

type HCO = HCObj<ASTNode>;

enum MAIN {
    ROOT(Box<ROOT>),
    MIN(Box<MIN>),
    B(Box<B>),
}

#[derive(Debug, Clone)]
pub enum ASTNode {
    NONE,
    ROOT(Box<ROOT>),
    MIN(Box<MIN>),
    B(Box<B>),
    num_literal(Box<num_literal>),
}

impl HCObjTrait for ASTNode {
    fn String(&self) -> String {
        use ASTNode::*;
        match self {
            ROOT(bx) => bx.tok.String(),
            MIN(bx) => bx.tok.String(),

            _ => String::from(""),
        }
    }
}

#[derive(Debug)]
pub enum NodeIteration<'a> {
    NONE,
    STOP,
    CONTINUE,
    REPLACE(ASTNode),
    ROOT(&'a mut ROOT),
    MIN(&'a mut MIN),
    B(&'a mut B),
    num_literal(&'a mut num_literal),
}

impl<'a> NodeIteration<'a> {
    pub fn name(&self) -> &str {
        use NodeIteration::*;
        match self {
            STOP => "stop",

            ROOT(_0) => "node-ROOT",
            MIN(_0) => "node-MIN",
            B(_0) => "node-B",
            num_literal(_0) => "node-num_literal",
            REPLACE(node) => "replace",
            _ => "unknown",
        }
    }
}

pub trait ASTNodeTraits<'a>
where
    Self: Sized,
{
    fn iterate(
        self: &'a mut Box<Self>,
        _yield: &'a mut impl FnMut(&mut NodeIteration<'a>, &mut NodeIteration<'a>) -> NodeIteration<'a>,
    ) {
        let mut closure =
            |a: &mut NodeIteration<'a>, b: &mut NodeIteration<'a>, ty: u32, c: i32, d: i32| {
                use NodeIteration::*;
                match _yield(a, b) {
                    STOP => false,
                    REPLACE(node) => match b {
                        ROOT(par) => {
                            par.Replace(node, c, d);
                            true
                        }
                        MIN(par) => {
                            par.Replace(node, c, d);
                            true
                        }
                        B(par) => {
                            par.Replace(node, c, d);
                            true
                        }
                        num_literal(par) => {
                            par.Replace(node, c, d);
                            true
                        }
                        _ => true,
                    },
                    _ => true,
                }
            };

        self.Iterate(&mut closure, &mut NodeIteration::NONE, 0, 0)
    }
    fn Replace(&mut self, node: ASTNode, i: i32, j: i32) -> ASTNode {
        ASTNode::NONE
    }
    fn Iterate(
        self: &'a mut Box<Self>,
        _yield: &mut impl FnMut(&mut NodeIteration<'a>, &mut NodeIteration<'a>, u32, i32, i32) -> bool,
        parent: &mut NodeIteration<'a>,
        i: i32,
        j: i32,
    );
    fn Token(&self) -> Token;
    fn Type() -> u32;
    fn GetType(&self) -> u32;
}

#[derive(Debug, Clone)]
pub struct ROOT {
    pub tok: Token,
    pub root: Box<MIN>,
    pub scoop: f64,
}

/* impl Drop for ROOT {
    fn drop(&mut self) {
        println!("DROPPED ROOT");
    }
}
 */
impl ROOT {
    fn new(tok: Token, _root: Box<MIN>, _scoop: f64) -> Box<Self> {
        Box::new(ROOT {
            tok: tok,
            root: _root,
            scoop: _scoop,
        })
    }

    fn replace_root(&mut self, child: ASTNode) -> Option<ASTNode> {
        if let ASTNode::MIN(child) = child {
            return Some(ASTNode::MIN(std::mem::replace(&mut self.root, child)));
        } else {
            return None;
        }
    }
}

impl<'a> ASTNodeTraits<'a> for ROOT
where
    Self: Sized,
{
    fn Iterate(
        self: &'a mut Box<Self>,
        _yield: &mut impl FnMut(&mut NodeIteration<'a>, &mut NodeIteration<'a>, u32, i32, i32) -> bool,
        parent: &mut NodeIteration<'a>,
        i: i32,
        j: i32,
    ) {
        let node = UnsafeCell::from(self);

        {
            let mut_me = unsafe { (*node.get()).as_mut() };

            if !_yield(&mut NodeIteration::ROOT(mut_me), parent, 6, i, j) {
                return;
            };
        }

        {
            let mut_me_b = unsafe { (*node.get()).as_mut() };
            (unsafe { (*node.get()).as_mut() }.root).Iterate(
                _yield,
                &mut NodeIteration::ROOT(mut_me_b),
                0,
                0,
            );
        }
    }

    fn Replace(&mut self, child: ASTNode, i: i32, j: i32) -> ASTNode {
        match i {
            0 => {
                if let Some(old) = self.replace_root(child) {
                    return old;
                } else {
                    return ASTNode::NONE;
                }
            }
            _ => {}
        };

        ASTNode::NONE
    }

    fn Token(&self) -> Token {
        return self.tok;
    }

    fn Type() -> u32 {
        return 6;
    }

    fn GetType(&self) -> u32 {
        return 6;
    }
}

#[derive(Debug, Clone)]
pub struct MIN {
    pub tok: Token,
    pub pickles: Vec<ASTNode>,
    pub root: Option<Box<B>>,
}

/* impl Drop for MIN {
    fn drop(&mut self) {
        println!("DROPPED MIN");
    }
}
 */
impl MIN {
    fn new(tok: Token, _pickles: Vec<ASTNode>, _root: Option<Box<B>>) -> Box<Self> {
        Box::new(MIN {
            tok: tok,
            pickles: _pickles,
            root: _root,
        })
    }

    fn replace_pickles(&mut self, child: ASTNode, index: i32) -> Option<ASTNode> {
        match &child {
            ASTNode::B(_0) => {
                if index as usize >= self.pickles.len() {
                    self.pickles.push(child);
                    None
                } else {
                    self.pickles.push(child);
                    let node = self.pickles.swap_remove(index as usize);
                    Some(node)
                }
            }
            ASTNode::NONE => {
                if (index as usize) < self.pickles.len() {
                    let node = self.pickles.remove(index as usize);
                    Some(node)
                } else {
                    None
                }
            }
            _ => None,
        }
    }

    fn replace_root(&mut self, child: ASTNode) -> Option<ASTNode> {
        match child {
            ASTNode::NONE => {
                if self.root.is_some() {
                    let old = std::mem::replace(&mut self.root, None);
                    if let Some(old_node) = old {
                        return Some(ASTNode::B(old_node));
                    }
                }
            }

            ASTNode::B(child) => {
                if self.root.is_none() {
                    self.root = Some(child);
                } else {
                    let old = std::mem::replace(&mut self.root, Some(child));

                    if let Some(old_node) = old {
                        return Some(ASTNode::B(old_node));
                    }
                }
            }
            _ => {}
        }
        None
    }
}

impl<'a> ASTNodeTraits<'a> for MIN
where
    Self: Sized,
{
    fn Iterate(
        self: &'a mut Box<Self>,
        _yield: &mut impl FnMut(&mut NodeIteration<'a>, &mut NodeIteration<'a>, u32, i32, i32) -> bool,
        parent: &mut NodeIteration<'a>,
        i: i32,
        j: i32,
    ) {
        let node = UnsafeCell::from(self);

        {
            let mut_me = unsafe { (*node.get()).as_mut() };

            if !_yield(&mut NodeIteration::MIN(mut_me), parent, 10, i, j) {
                return;
            };
        }

        {
            let mut_me_a = unsafe { (*node.get()).as_mut() };
            for j in 0..mut_me_a.pickles.len() {
                let mut_me_b = unsafe { (*node.get()).as_mut() };
                let child = &mut mut_me_b.pickles[j];

                if let ASTNode::B(child) = child {
                    let mut_me = unsafe { (*node.get()).as_mut() };
                    child.Iterate(_yield, &mut NodeIteration::MIN(mut_me), 0, j as i32);
                }
            }
        }

        {
            if let Some(child) = &mut (unsafe { (*node.get()).as_mut() }.root) {
                let mut_me_b = unsafe { (*node.get()).as_mut() };
                child.Iterate(_yield, &mut NodeIteration::MIN(mut_me_b), 1, 0);
            }
        }
    }

    fn Replace(&mut self, child: ASTNode, i: i32, j: i32) -> ASTNode {
        match i {
            0 => {
                if let Some(old) = self.replace_pickles(child, j) {
                    return old;
                } else {
                    return ASTNode::NONE;
                }
            }
            1 => {
                if let Some(old) = self.replace_root(child) {
                    return old;
                } else {
                    return ASTNode::NONE;
                }
            }
            _ => {}
        };

        ASTNode::NONE
    }

    fn Token(&self) -> Token {
        return self.tok;
    }

    fn Type() -> u32 {
        return 10;
    }

    fn GetType(&self) -> u32 {
        return 10;
    }
}

#[derive(Debug, Clone)]
pub struct B {
    pub tok: Token,
    pub root: HCO,
    pub vecs: ASTNode,
}

/* impl Drop for B {
    fn drop(&mut self) {
        println!("DROPPED B");
    }
}
 */
impl B {
    fn new(tok: Token, _root: HCO, _vecs: ASTNode) -> Box<Self> {
        Box::new(B {
            tok: tok,
            root: _root,
            vecs: _vecs,
        })
    }

    fn replace_vecs(&mut self, child: ASTNode) -> Option<ASTNode> {
        match &child {
            ASTNode::NONE => {
                let old = std::mem::replace(&mut self.vecs, ASTNode::NONE);
                return Some(old);
            }

            ASTNode::num_literal(_child) => {
                return Some(std::mem::replace(&mut self.vecs, child));
            }

            ASTNode::num_literal(_child) => {
                return Some(std::mem::replace(&mut self.vecs, child));
            }

            ASTNode::num_literal(_child) => {
                return Some(std::mem::replace(&mut self.vecs, child));
            }
            _ => None,
        }
    }
}

impl<'a> ASTNodeTraits<'a> for B
where
    Self: Sized,
{
    fn Iterate(
        self: &'a mut Box<Self>,
        _yield: &mut impl FnMut(&mut NodeIteration<'a>, &mut NodeIteration<'a>, u32, i32, i32) -> bool,
        parent: &mut NodeIteration<'a>,
        i: i32,
        j: i32,
    ) {
        let node = UnsafeCell::from(self);

        {
            let mut_me = unsafe { (*node.get()).as_mut() };

            if !_yield(&mut NodeIteration::B(mut_me), parent, 14, i, j) {
                return;
            };
        }

        match &mut (unsafe { (*node.get()).as_mut() }.vecs) {
            ASTNode::num_literal(child) => {
                let mut_me_b = unsafe { (*node.get()).as_mut() };
                child.Iterate(_yield, &mut NodeIteration::B(mut_me_b), 1, 0);
            }

            ASTNode::num_literal(child) => {
                let mut_me_b = unsafe { (*node.get()).as_mut() };
                child.Iterate(_yield, &mut NodeIteration::B(mut_me_b), 1, 0);
            }

            ASTNode::num_literal(child) => {
                let mut_me_b = unsafe { (*node.get()).as_mut() };
                child.Iterate(_yield, &mut NodeIteration::B(mut_me_b), 1, 0);
            }
            _ => {}
        }
    }

    fn Replace(&mut self, child: ASTNode, i: i32, j: i32) -> ASTNode {
        match i {
            0 => {
                if let Some(old) = self.replace_vecs(child) {
                    return old;
                } else {
                    return ASTNode::NONE;
                }
            }
            _ => {}
        };

        ASTNode::NONE
    }

    fn Token(&self) -> Token {
        return self.tok;
    }

    fn Type() -> u32 {
        return 14;
    }

    fn GetType(&self) -> u32 {
        return 14;
    }
}

#[derive(Debug, Clone)]
pub struct num_literal {
    pub tok: Token,
    pub v: String,
}

/* impl Drop for num_literal {
    fn drop(&mut self) {
        println!("DROPPED num_literal");
    }
}
 */
impl num_literal {
    fn new(tok: Token, _v: String) -> Box<Self> {
        Box::new(num_literal { tok: tok, v: _v })
    }
}

impl<'a> ASTNodeTraits<'a> for num_literal
where
    Self: Sized,
{
    fn Iterate(
        self: &'a mut Box<Self>,
        _yield: &mut impl FnMut(&mut NodeIteration<'a>, &mut NodeIteration<'a>, u32, i32, i32) -> bool,
        parent: &mut NodeIteration<'a>,
        i: i32,
        j: i32,
    ) {
        let node = UnsafeCell::from(self);

        {
            let mut_me = unsafe { (*node.get()).as_mut() };

            if !_yield(&mut NodeIteration::num_literal(mut_me), parent, 16, i, j) {
                return;
            };
        }
    }

    fn Replace(&mut self, child: ASTNode, i: i32, j: i32) -> ASTNode {
        match i {
            _ => {}
        };

        ASTNode::NONE
    }

    fn Token(&self) -> Token {
        return self.tok;
    }

    fn Type() -> u32 {
        return 16;
    }

    fn GetType(&self) -> u32 {
        return 16;
    }
}

fn _fn0(args: &mut Vec<HCO>, tok: Token) -> HCO {
    let mut i = args.len() - 1;
    let mut v0 = args.remove(i - 0);
    if let HCO::NODE(r_0) = v0 {
        if let ASTNode::MIN(r_1) = r_0 {
            return HCO::NODE(ASTNode::ROOT(ROOT::new(tok, r_1, 2.0)));
        }
    };
    return HCO::NONE;
}
fn _fn1(args: &mut Vec<HCO>, tok: Token) -> HCO {
    let mut i = args.len() - 1;
    let mut v2 = args.remove(i - 0);
    let mut v1 = args.remove(i - 1);
    let mut v0 = args.remove(i - 2);
    if let HCO::NODES(r_0) = v2 {
        return HCO::NODE(ASTNode::MIN(MIN::new(tok, r_0, None)));
    };
    return HCO::NONE;
}
fn _fn2(args: &mut Vec<HCO>, tok: Token) -> HCO {
    let mut i = args.len() - 1;
    let mut v0 = args.remove(i - 0);
    if let HCO::NODE(r_0) = v0 {
        if let ASTNode::B(r_1) = r_0 {
            return HCO::NODE(ASTNode::MIN(MIN::new(tok, Vec::new(), Some(r_1))));
        }
    };
    return HCO::NONE;
}
fn _fn3(args: &mut Vec<HCO>, tok: Token) -> HCO {
    let mut i = args.len() - 1;
    let mut v1 = args.remove(i - 0);
    let mut v0 = args.remove(i - 1);
    return HCO::NODE(ASTNode::MIN(MIN::new(tok, Vec::new(), None)));
}
fn _fn4(args: &mut Vec<HCO>, tok: Token) -> HCO {
    let mut i = args.len() - 1;
    let mut v2 = args.remove(i - 0);
    let mut v1 = args.remove(i - 1);
    let mut v0 = args.remove(i - 2);
    return HCO::NODE(ASTNode::B(B::new(
        tok,
        HCO::STRING(
            String::from("(") + &v0.String() + &v1.String() + &v2.String() + &String::from(")"),
        ),
        ASTNode::NONE,
    )));
}
fn _fn5(args: &mut Vec<HCO>, tok: Token) -> HCO {
    let mut i = args.len() - 1;
    let mut v2 = args.remove(i - 0);
    let mut v1 = args.remove(i - 1);
    let mut v0 = args.remove(i - 2);
    return HCO::NODE(ASTNode::B(B::new(
        tok,
        HCO::STRING(String::from("(") + &v1.String() + &String::from(")")),
        ASTNode::NONE,
    )));
}
fn _fn6(args: &mut Vec<HCO>, tok: Token) -> HCO {
    let mut i = args.len() - 1;
    let mut v0 = args.remove(i - 0);
    if let HCO::NODE(r_0) = v0 {
        return HCO::NODE(ASTNode::B(B::new(tok, HCO::NONE, r_0)));
    };
    return HCO::NONE;
}
fn _fn7(args: &mut Vec<HCO>, tok: Token) -> HCO {
    let mut i = args.len() - 1;
    let mut v0 = args.remove(i - 0);
    return HCO::NODE(ASTNode::num_literal(num_literal::new(
        tok,
        tok.String() + "",
    )));
}
fn _fn8(args: &mut Vec<HCO>, tok: Token) -> HCO {
    let mut i = args.len() - 1;
    let mut v0 = args.remove(i - 0);

    let mut ref_0: Vec<ASTNode> = Vec::new();
    if let HCO::NODE(r_0) = v0 {
        ref_0.push(r_0);
    }
    HCO::NODES(ref_0)
}
fn _fn9(args: &mut Vec<HCO>, tok: Token) -> HCO {
    let mut i = args.len() - 1;
    let mut v1 = args.remove(i - 0);
    let mut v0 = args.remove(i - 1);

    if let HCO::NODES(r_0) = &mut v0 {
        if let HCO::NODE(r_1) = v1 {
            r_0.push(r_1);
        }
    }
    v0
}

pub const FunctionMaps: [RF; 17] = [
    _fn0, _fn1, _fn2, _fn1, _fn3, _fn3, _fn4, _fn5, _fn6, _fn4, _fn6, _fn6, _fn8, _fn9, _fn7, _fn7,
    _fn7,
];
