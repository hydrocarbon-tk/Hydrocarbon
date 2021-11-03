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
}

pub trait ASTNodeTraits<'a>
where
    Self: Sized,
{
    fn iterator(
        self: &'a mut Box<Self>,
        _yield: &'a mut impl FnMut(&mut NodeIteration<'a>, &mut NodeIteration<'a>) -> NodeIteration<'a>,
    ) {
        let mut closure = |a: &mut NodeIteration<'a>, b: &mut NodeIteration<'a>, c: i32, d: i32| {
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
                    _ => true,
                },
                _ => true,
            }
        };

        self.Iterate(&mut closure, &mut NodeIteration::NONE, 0, 0)
    }
    fn Replace(&mut self, node: ASTNode, i: i32, j: i32) -> Option<ASTNode> {
        None
    }
    fn Iterate(
        self: &'a mut Box<Self>,
        _yield: &mut impl FnMut(&mut NodeIteration<'a>, &mut NodeIteration<'a>, i32, i32) -> bool,
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

impl Drop for ROOT {
    fn drop(&mut self) {
        println!("DROPPED ROOT");
    }
}

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
        _yield: &mut impl FnMut(&mut NodeIteration<'a>, &mut NodeIteration<'a>, i32, i32) -> bool,
        parent: &mut NodeIteration<'a>,
        i: i32,
        j: i32,
    ) {
        let node = UnsafeCell::from(self);

        {
            let mut_me = unsafe { (*node.get()).as_mut() };

            if !_yield(&mut NodeIteration::ROOT(mut_me), parent, i, j) {
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
    /*
    fn Replace(&mut self, child: ASTNode, i: i32, j: i32) -> ASTNode{

        match i{
        0 => {
                        if let ASTNode::MIN(bx) = child {
                                let old = self.root;
                                    self.root = bx;
                                    return ASTNode::MIN(old);}
                    }
        }

        ASTNode::NONE
    }
    */

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

impl Drop for MIN {
    fn drop(&mut self) {
        println!("DROPPED MIN");
    }
}

impl MIN {
    fn new(tok: Token, _pickles: Vec<ASTNode>, _root: Option<Box<B>>) -> Box<Self> {
        Box::new(MIN {
            tok: tok,
            pickles: _pickles,
            root: _root,
        })
    }

    fn replace_pickles(&mut self, child: ASTNode) -> Option<ASTNode> {}

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
        _yield: &mut impl FnMut(&mut NodeIteration<'a>, &mut NodeIteration<'a>, i32, i32) -> bool,
        parent: &mut NodeIteration<'a>,
        i: i32,
        j: i32,
    ) {
        let node = UnsafeCell::from(self);

        {
            let mut_me = unsafe { (*node.get()).as_mut() };

            if !_yield(&mut NodeIteration::MIN(mut_me), parent, i, j) {
                return;
            };
        }

        {
            if let Some(child) = &mut (unsafe { (*node.get()).as_mut() }.root) {
                let mut_me_b = unsafe { (*node.get()).as_mut() };
                child.Iterate(_yield, &mut NodeIteration::MIN(mut_me_b), 1, 0);
            }
        }
    }
    /*
    fn Replace(&mut self, child: ASTNode, i: i32, j: i32) -> ASTNode{

        match i{
        0 => {
                        _array, ok := node.pickles(HCGObjNodeArray)
    if ok {
       //node.0[i] = child
    }
                    }
        1 => {
                        if let ASTNode::B(bx) = child {
                                let old = self.root;
                                    self.root = Some(bx);

                                    if let Some(old) = old {
                                        return ASTNode::B(old);
                                    }}
                    }
        }

        ASTNode::NONE
    }
    */

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
    pub vecs: Vec<HCO>,
}

impl Drop for B {
    fn drop(&mut self) {
        println!("DROPPED B");
    }
}

impl B {
    fn new(tok: Token, _root: HCO, _vecs: Vec<HCO>) -> Box<Self> {
        Box::new(B {
            tok: tok,
            root: _root,
            vecs: _vecs,
        })
    }
}

impl<'a> ASTNodeTraits<'a> for B
where
    Self: Sized,
{
    fn Iterate(
        self: &'a mut Box<Self>,
        _yield: &mut impl FnMut(&mut NodeIteration<'a>, &mut NodeIteration<'a>, i32, i32) -> bool,
        parent: &mut NodeIteration<'a>,
        i: i32,
        j: i32,
    ) {
        let node = UnsafeCell::from(self);

        {
            let mut_me = unsafe { (*node.get()).as_mut() };

            if !_yield(&mut NodeIteration::B(mut_me), parent, i, j) {
                return;
            };
        }
    }
    /*
    fn Replace(&mut self, child: ASTNode, i: i32, j: i32) -> ASTNode{

        match i{

        }

        ASTNode::NONE
    }
    */

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

fn _FN0_(args: &mut Vec<HCO>, tok: Token) -> HCO {
    let mut i = args.len() - 1;
    let mut v0 = args.remove(i - 0);
    if let HCO::NODE(r_0) = v0 {
        if let ASTNode::MIN(r_1) = r_0 {
            return HCO::NODE(ASTNode::ROOT(ROOT::new(tok, r_1, 2.0)));
        }
    };
    return HCO::NONE;
}
fn _FN1_(args: &mut Vec<HCO>, tok: Token) -> HCO {
    let mut i = args.len() - 1;
    let mut v2 = args.remove(i - 0);
    let mut v1 = args.remove(i - 1);
    let mut v0 = args.remove(i - 2);
    if let HCO::NODES(r_0) = v2 {
        return HCO::NODE(ASTNode::MIN(MIN::new(tok, r_0, None)));
    };
    return HCO::NONE;
}
fn _FN2_(args: &mut Vec<HCO>, tok: Token) -> HCO {
    let mut i = args.len() - 1;
    let mut v0 = args.remove(i - 0);
    if let HCO::NODE(r_0) = v0 {
        if let ASTNode::B(r_1) = r_0 {
            return HCO::NODE(ASTNode::MIN(MIN::new(tok, vec![], Some(r_1))));
        }
    };
    return HCO::NONE;
}
fn _FN3_(args: &mut Vec<HCO>, tok: Token) -> HCO {
    let mut i = args.len() - 1;
    let mut v1 = args.remove(i - 0);
    let mut v0 = args.remove(i - 1);
    if let HCO::NODES(r_0) = nil {
        return HCO::NODE(ASTNode::MIN(MIN::new(tok, r_0, None)));
    };
    return HCO::NONE;
}
fn _FN4_(args: &mut Vec<HCO>, tok: Token) -> HCO {
    let mut i = args.len() - 1;
    let mut v2 = args.remove(i - 0);
    let mut v1 = args.remove(i - 1);
    let mut v0 = args.remove(i - 2);
    return HCO::NODE(ASTNode::B(B::new(
        tok,
        HCO::STRING(
            String::from("(") + &v0.String() + &v1.String() + &v2.String() + &String::from(")"),
        ),
        vec![],
    )));
}
fn _FN5_(args: &mut Vec<HCO>, tok: Token) -> HCO {
    let mut i = args.len() - 1;
    let mut v2 = args.remove(i - 0);
    let mut v1 = args.remove(i - 1);
    let mut v0 = args.remove(i - 2);
    return HCO::NODE(ASTNode::B(B::new(
        tok,
        HCO::STRING(String::from("(") + &v1.String() + &String::from(")")),
        vec![],
    )));
}
fn _FN6_(args: &mut Vec<HCO>, tok: Token) -> HCO {
    let mut i = args.len() - 1;
    let mut v0 = args.remove(i - 0);
    let mut ref_0: Vec<HCO> = Vec::new();
    ref_0.push(HCO::DOUBLE(0.0));
    ref_0.push(HCO::STRING(String::from("two")));
    ref_0.push(HCO::STRING(String::from("three")));
    ref_0.push(v0);
    return HCO::NODE(ASTNode::B(B::new(tok, HCO::NONE, ref_0)));
}
fn _FN7_(args: &mut Vec<HCO>, tok: Token) -> HCO {
    let mut i = args.len() - 1;
    let mut v0 = args.remove(i - 0);

    let mut ref_0: Vec<ASTNode> = Vec::new();
    if let HCO::NODE(r_0) = v0 {
        ref_0.push(r_0);
    }
    HCO::NODES(ref_0)
}
fn _FN8_(args: &mut Vec<HCO>, tok: Token) -> HCO {
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

pub const FunctionMaps: [RF; 14] = [
    _FN0_, _FN1_, _FN2_, _FN1_, _FN3_, _FN3_, _FN4_, _FN5_, _FN6_, _FN4_, _FN6_, _FN6_, _FN7_,
    _FN8_,
];
