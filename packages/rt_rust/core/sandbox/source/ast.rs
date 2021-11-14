

use std::cell::UnsafeCell;

use candlelib_hydrocarbon::ast::{HCObj, HCObjTrait, ReduceFunction};

use candlelib_hydrocarbon::Token;

type RF = ReduceFunction<ASTNode>;

type HCO = HCObj<ASTNode>;


#[derive(Debug, Clone)]
pub enum ASTNode {NONE,Path(Box<Path>),
Ident(Box<Ident>) 
}
    
impl HCObjTrait for ASTNode {
    fn String(&self) -> String {
        use ASTNode::*;
        match self {
            
            Path(bx) => bx.tok.String(),

            Ident(bx) => bx.tok.String(),
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
    Path(&'a mut Path),
Ident(&'a mut Ident)
}

impl<'a> NodeIteration<'a> {
    pub fn name(&self) -> &str {
        use NodeIteration::*;
        match self {
            STOP => "stop",
            
                Path(_0) => {
                    "node-Path"
                },
                Ident(_0) => {
                    "node-Ident"
                }
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
        let mut closure = |a: &mut NodeIteration<'a>, b: &mut NodeIteration<'a>, ty:u32, c: i32, d: i32| {
            use NodeIteration::*;
            match _yield(a, b) {
                STOP => false,
                REPLACE(node) => match b {
                    
                    Path(par) => {
                        par.Replace(node, c, d);
                        true
                    },
                    Ident(par) => {
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
        _yield: &mut impl FnMut(&mut NodeIteration<'a>, &mut NodeIteration<'a>,u32, i32, i32) -> bool,
        parent: &mut NodeIteration<'a>,
        i: i32,
        j: i32,
    );
    fn Token(&self) -> Token;
    fn Type() -> u32;
    fn GetType(&self) -> u32;
}




#[derive(Debug, Clone)]
pub struct Path {
    pub tok:Token,
    pub idents:Vec<Box<Ident>>
}

impl Path {
fn new( tok: Token, _idents:Vec<Box<Ident>>) -> Box<Self> {
    Box::new(Path{
        tok: tok,
        idents : _idents,
    })
}


fn  replace_idents(&mut self, child: ASTNode,index: i32,) -> Option<ASTNode> {
    
    match &child {
        ASTNode::Ident(_) => {
            if index as usize >= self.idents.len() {
                self.idents.push(child);
                None
            }else {
                self.idents.push(child);
                let node = self.idents.swap_remove(index as usize);
                Some(node)
            }
        }
        ASTNode::NONE => {
            if (index as usize)< self.idents.len() {
                let node = self.idents.remove(index as usize);
                Some(node)
            }else {
                None
            }
        }
        _ => None
    }
}
}



impl<'a> ASTNodeTraits<'a> for Path
where
    Self: Sized,
{

fn Iterate(
    self: &'a mut Box<Self>,
    _yield: &mut impl FnMut(&mut NodeIteration<'a>, &mut NodeIteration<'a>,u32, i32, i32) -> bool,
    parent: &mut NodeIteration<'a>,
    i: i32,
    j: i32,
) {
    let node = UnsafeCell::from(self);

    {
        let mut_me = unsafe { (*node.get()).as_mut() };

        if !_yield(&mut NodeIteration::Path(mut_me), parent, 2, i, j) { return };
    }
        
    
        {

            let mut_me_a = unsafe { (*node.get()).as_mut() };
            for j in 0..mut_me_a.idents.len() {
                let mut_me_b = unsafe { (*node.get()).as_mut() };
                let child = &mut mut_me_b.idents[j];

                
                if let ASTNode::Ident(child) = child {
                    let mut_me = unsafe { (*node.get()).as_mut() };
                    child.Iterate( _yield, &mut NodeIteration::Path(mut_me), 0, j as i32);
                }
            }
        }
    
}

fn Replace(&mut self, child: ASTNode, i: i32, j: i32) -> ASTNode{

    match i{
    0 => {
                    
        if let Some(old) = self.replace_idents(child, j){ 
            return old;
        }else{
            return ASTNode::NONE;
        }
                }
        _ => {}
    };

    ASTNode::NONE
}


fn Token(&self) -> Token{
    return self.tok;
}

fn Type()-> u32{
    return 2;
}

fn GetType(&self) -> u32 {
    return 2;
}
}




#[derive(Debug, Clone)]
pub struct Ident {
    pub tok:Token,
    pub val:String
}

impl Ident {
fn new( tok: Token, _val:String) -> Box<Self> {
    Box::new(Ident{
        tok: tok,
        val : _val,
    })
}


}



impl<'a> ASTNodeTraits<'a> for Ident
where
    Self: Sized,
{

fn Iterate(
    self: &'a mut Box<Self>,
    _yield: &mut impl FnMut(&mut NodeIteration<'a>, &mut NodeIteration<'a>,u32, i32, i32) -> bool,
    parent: &mut NodeIteration<'a>,
    i: i32,
    j: i32,
) {
    let node = UnsafeCell::from(self);

    {
        let mut_me = unsafe { (*node.get()).as_mut() };

        if !_yield(&mut NodeIteration::Ident(mut_me), parent, 4, i, j) { return };
    }
        
    
    
}

fn Replace(&mut self, child: ASTNode, i: i32, j: i32) -> ASTNode{

    match i{
    
        _ => {}
    };

    ASTNode::NONE
}


fn Token(&self) -> Token{
    return self.tok;
}

fn Type()-> u32{
    return 4;
}

fn GetType(&self) -> u32 {
    return 4;
}
}



fn _fn0 (args:&mut Vec<HCO>, tok: Token){ 
                        let mut i = args.len()-1;
let mut v1 = args.remove(i-0);
let mut v0 = args.remove(i-1);
                                
 let mut ref_0:Vec<ASTNode> = Vec::new();
 if let HCO::NODE(r_0) = v0 { 
ref_0.push(r_0);
 if let HCO::NODES(r_1) = ref_0 { 
 let mut ref_2 = HCO::NODE(ASTNode::Path(Path::new(
        tok,
        r_1,
    ) 
));;

                                args.push(ref_2);  } }
                            }
fn _fn1 (args:&mut Vec<HCO>, tok: Token){ 
                        let mut i = args.len()-1;
let mut v0 = args.remove(i-0);
                                
 let mut ref_0 = HCO::NODE(ASTNode::Ident(Ident::new(
        tok,
        v0,
    ) 
));;

                                args.push(ref_0); 
                            }
fn _fn2 (args:&mut Vec<HCO>, tok: Token){ 
                                let mut i = args.len()-1;
let mut v1 = args.remove(i-0);
let mut v0 = args.remove(i-1);
                                
 let mut ref_0:Vec<ASTNode> = Vec::new();
 if let HCO::NODE(r_0) = v0 { 
ref_0.push(r_0);
 if let HCO::NODE(r_1) = v1 { 
ref_0.push(r_1);
 } }
                                args.push(HCO::NODES(ref_0)); } 
fn _fn3 (args:&mut Vec<HCO>, tok: Token){ 
                                let mut i = args.len()-1;
let mut v0 = args.remove(i-0);
                                
 let mut ref_0:Vec<ASTNode> = Vec::new();
 if let HCO::NODE(r_0) = v0 { 
ref_0.push(r_0);
 }
                                args.push(HCO::NODES(ref_0)); } 
fn _fn4 (args:&mut Vec<HCO>, tok: Token){ 
                        let mut i = args.len()-1;
let mut v2 = args.remove(i-0);
let mut v1 = args.remove(i-1);
let mut v0 = args.remove(i-2);
                                
 let r_0 = (v0).(Box<Path>);
 if let HCO::NODE(r_0) = v1 { 
r_0.idents.push(r_0);
r_0.idents

                                args.push(v0);  }
                            }
fn _fn5 (args:&mut Vec<HCO>, tok: Token){ let mut i = args.len()-1;
let mut v1 = args.remove(i-0);
let mut v0 = args.remove(i-1); 
 return HCO::STRING(v0 + &v1.String())}
fn _fn6 (args:&mut Vec<HCO>, tok: Token){ let mut i = args.len()-1;
let mut v0 = args.remove(i-0); 
 return HCO::STRING(v0.String())}
fn _fn7 (args:&mut Vec<HCO>, tok: Token){}



pub const FunctionMaps:[RF; 8]= [
    _fn2,_fn3,_fn7,_fn4,_fn0,_fn1,_fn5,_fn6,
];
