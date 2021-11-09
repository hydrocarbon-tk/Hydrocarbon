

use std::cell::UnsafeCell;

use candlelib_hydrocarbon::ast::{HCObj, HCObjTrait, ReduceFunction};

use candlelib_hydrocarbon::Token;

type RF = ReduceFunction<ASTNode>;

type HCO = HCObj<ASTNode>;


#[derive(Debug, Clone)]
pub enum ASTNode {NONE,QueryBody(Box<QueryBody>),
ContainerClause(Box<ContainerClause>),
IDENTIFIERS(Box<IDENTIFIERS>) 
}
    
impl HCObjTrait for ASTNode {
    fn String(&self) -> String {
        use ASTNode::*;
        match self {
            
            QueryBody(bx) => bx.tok.String(),

            ContainerClause(bx) => bx.tok.String(),

            IDENTIFIERS(bx) => bx.tok.String(),
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
    QueryBody(&'a mut QueryBody),
ContainerClause(&'a mut ContainerClause),
IDENTIFIERS(&'a mut IDENTIFIERS)
}

impl<'a> NodeIteration<'a> {
    pub fn name(&self) -> &str {
        use NodeIteration::*;
        match self {
            STOP => "stop",
            
                QueryBody(_0) => {
                    "node-QueryBody"
                },
                ContainerClause(_0) => {
                    "node-ContainerClause"
                },
                IDENTIFIERS(_0) => {
                    "node-IDENTIFIERS"
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
                    
                    QueryBody(par) => {
                        par.Replace(node, c, d);
                        true
                    },
                    ContainerClause(par) => {
                        par.Replace(node, c, d);
                        true
                    },
                    IDENTIFIERS(par) => {
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
pub struct QueryBody {
    pub tok:Token,
    pub container:Box<ContainerClause>,
pub filter:HCO,
pub sort:HCO
}

impl QueryBody {
fn new( tok: Token, _container:Box<ContainerClause>, _filter:HCO, _sort:HCO) -> Box<Self> {
    Box::new(QueryBody{
        tok: tok,
        container : _container,
        filter : _filter,
        sort : _sort,
    })
}


fn  replace_container(&mut self, child: ASTNode,) -> Option<ASTNode> {
    
    if let ASTNode::ContainerClause(child) = child {
        return Some(ASTNode::ContainerClause(std::mem::replace(&mut self.container, child)))
    }else {
        return None
    }
    
}
}



impl<'a> ASTNodeTraits<'a> for QueryBody
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

        if !_yield(&mut NodeIteration::QueryBody(mut_me), parent, 2, i, j) { return };
    }
        
    
        {
            let mut_me_b = unsafe { (*node.get()).as_mut() };
            (unsafe { (*node.get()).as_mut() }.container).Iterate( _yield, &mut NodeIteration::QueryBody(mut_me_b), 0, 0);
            
        }
    
}

fn Replace(&mut self, child: ASTNode, i: i32, j: i32) -> ASTNode{

    match i{
    0 => {
                    
        if let Some(old) = self.replace_container(child){ 
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
pub struct ContainerClause {
    pub tok:Token,
    pub path:Vec<Box<IDENTIFIERS>>,
pub container:ASTNode
}

impl ContainerClause {
fn new( tok: Token, _path:Vec<Box<IDENTIFIERS>>, _container:ASTNode) -> Box<Self> {
    Box::new(ContainerClause{
        tok: tok,
        path : _path,
        container : _container,
    })
}


fn  replace_path(&mut self, child: ASTNode,index: i32,) -> Option<ASTNode> {
    
    match &child {
        ASTNode::IDENTIFIERS(_) => {
            if index as usize >= self.path.len() {
                self.path.push(child);
                None
            }else {
                self.path.push(child);
                let node = self.path.swap_remove(index as usize);
                Some(node)
            }
        }
        ASTNode::NONE => {
            if (index as usize)< self.path.len() {
                let node = self.path.remove(index as usize);
                Some(node)
            }else {
                None
            }
        }
        _ => None
    }
}

fn  replace_container(&mut self, child: ASTNode,) -> Option<ASTNode> {
    
    match &child {
        ASTNode::NONE => {
            let old = std::mem::replace(&mut self.container, ASTNode::NONE);
            return Some(old);
        }
        
        ASTNode::IDENTIFIERS(_) => { 
            return Some(std::mem::replace(&mut self.container, child));
        },

        ASTNode::IDENTIFIERS(_) => { 
            return Some(std::mem::replace(&mut self.container, child));
        },

        ASTNode::IDENTIFIERS(_) => { 
            return Some(std::mem::replace(&mut self.container, child));
        }
        _ => None
        
    }
}
}



impl<'a> ASTNodeTraits<'a> for ContainerClause
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

        if !_yield(&mut NodeIteration::ContainerClause(mut_me), parent, 4, i, j) { return };
    }
        
    
        {

            let mut_me_a = unsafe { (*node.get()).as_mut() };
            for j in 0..mut_me_a.path.len() {
                let mut_me_b = unsafe { (*node.get()).as_mut() };
                let child = &mut mut_me_b.path[j];

                
                if let ASTNode::IDENTIFIERS(child) = child {
                    let mut_me = unsafe { (*node.get()).as_mut() };
                    child.Iterate( _yield, &mut NodeIteration::ContainerClause(mut_me), 0, j as i32);
                }
            }
        }
    
        {
            if let Some(child) = &mut (unsafe { (*node.get()).as_mut() }.container) {
                let mut_me_b = unsafe { (*node.get()).as_mut() };
                child.Iterate(_yield, &mut NodeIteration::ContainerClause(mut_me_b), 1, 0);
            }
        }
    
}

fn Replace(&mut self, child: ASTNode, i: i32, j: i32) -> ASTNode{

    match i{
    0 => {
                    
        if let Some(old) = self.replace_path(child, j){ 
            return old;
        }else{
            return ASTNode::NONE;
        }
                }
    1 => {
                    
        if let Some(old) = self.replace_container(child){ 
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
    return 4;
}

fn GetType(&self) -> u32 {
    return 4;
}
}




#[derive(Debug, Clone)]
pub struct IDENTIFIERS {
    pub tok:Token,
    pub ids:Vec<Token>
}

impl IDENTIFIERS {
fn new( tok: Token, _ids:Vec<Token>) -> Box<Self> {
    Box::new(IDENTIFIERS{
        tok: tok,
        ids : _ids,
    })
}


}



impl<'a> ASTNodeTraits<'a> for IDENTIFIERS
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

        if !_yield(&mut NodeIteration::IDENTIFIERS(mut_me), parent, 6, i, j) { return };
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
    return 6;
}

fn GetType(&self) -> u32 {
    return 6;
}
}



fn _fn0 (args:&mut Vec<HCO>, tok: Token){ 
                        let mut i = args.len()-1;
let mut v0 = args.remove(i-0);
                                
 if let HCO::NODE(r_0) = v0 { 
 if let ASTNode::ContainerClause(r_1) = r_0 { 
 let mut ref_0 = HCO::NODE(ASTNode::QueryBody(QueryBody::new(
        tok,
        r_1,
        Vec::new(),
        Vec::new(),
    ) 
));;

                                args.push(ref_0);  } }
                            }
fn _fn1 (args:&mut Vec<HCO>, tok: Token){ 
                        let mut i = args.len()-1;
let mut v2 = args.remove(i-0);
let mut v1 = args.remove(i-1);
let mut v0 = args.remove(i-2);
                                
 if let HCO::NODES(r_0) = v1 { 
 if let HCO::NODE(r_1) = v2 { 
 let mut ref_0 = HCO::NODE(ASTNode::ContainerClause(ContainerClause::new(
        tok,
        r_0,
        r_1,
    ) 
));;

                                args.push(ref_0);  } }
                            }
fn _fn2 (args:&mut Vec<HCO>, tok: Token){ 
                        let mut i = args.len()-1;
let mut v1 = args.remove(i-0);
let mut v0 = args.remove(i-1);
                                
 if let HCO::NODES(r_0) = v0 { 
 if let HCO::NODE(r_1) = v1 { 
 let mut ref_0 = HCO::NODE(ASTNode::ContainerClause(ContainerClause::new(
        tok,
        r_0,
        r_1,
    ) 
));;

                                args.push(ref_0);  } }
                            }
fn _fn3 (args:&mut Vec<HCO>, tok: Token){ 
                        let mut i = args.len()-1;
let mut v1 = args.remove(i-0);
let mut v0 = args.remove(i-1);
                                
 if let HCO::NODE(r_0) = v1 { 
 let mut ref_0 = HCO::NODE(ASTNode::ContainerClause(ContainerClause::new(
        tok,
        Vec::new(),
        r_0,
    ) 
));;

                                args.push(ref_0);  }
                            }
fn _fn4 (args:&mut Vec<HCO>, tok: Token){ 
                        let mut i = args.len()-1;
let mut v1 = args.remove(i-0);
let mut v0 = args.remove(i-1);
                                
 if let HCO::NODES(r_0) = v1 { 
 let mut ref_0 = HCO::NODE(ASTNode::ContainerClause(ContainerClause::new(
        tok,
        r_0,
        Vec::new(),
    ) 
));;

                                args.push(ref_0);  }
                            }
fn _fn5 (args:&mut Vec<HCO>, tok: Token){ 
                        let mut i = args.len()-1;
let mut v0 = args.remove(i-0);
                                
 if let HCO::NODE(r_0) = v0 { 
 let mut ref_0 = HCO::NODE(ASTNode::ContainerClause(ContainerClause::new(
        tok,
        Vec::new(),
        r_0,
    ) 
));;

                                args.push(ref_0);  }
                            }
fn _fn6 (args:&mut Vec<HCO>, tok: Token){ 
                        let mut i = args.len()-1;
let mut v0 = args.remove(i-0);
                                
 if let HCO::NODES(r_0) = v0 { 
 let mut ref_0 = HCO::NODE(ASTNode::ContainerClause(ContainerClause::new(
        tok,
        r_0,
        Vec::new(),
    ) 
));;

                                args.push(ref_0);  }
                            }
fn _fn7 (args:&mut Vec<HCO>, tok: Token){ 
                        let mut i = args.len()-1;
let mut v0 = args.remove(i-0);
                                
 let mut ref_0 = HCO::NODE(ASTNode::IDENTIFIERS(IDENTIFIERS::new(
        tok,
        v0,
    ) 
));;

                                args.push(ref_0); 
                            }
fn _fn8 (args:&mut Vec<HCO>, tok: Token){ 
                        let mut i = args.len()-1;
let mut v1 = args.remove(i-0);
let mut v0 = args.remove(i-1);
                                

                                args.push(v0); 
                            }
fn _fn9 (args:&mut Vec<HCO>, tok: Token){ let mut i = args.len()-1;
let mut v2 = args.remove(i-0);
let mut v1 = args.remove(i-1);
let mut v0 = args.remove(i-2); 
 return HCO::STRING((v1).String())}
fn _fn10 (args:&mut Vec<HCO>, tok: Token){ 
                                let mut i = args.len()-1;
let mut v0 = args.remove(i-0);
                                
 let mut ref_0:Vec<ASTNode> = Vec::new();
 if let HCO::NODE(r_0) = v0 { 
ref_0.push(r_0);
 }
                                args.push(HCO::NODES(ref_0)); } 
fn _fn11 (args:&mut Vec<HCO>, tok: Token){ 
                                let mut i = args.len()-1;
let mut v1 = args.remove(i-0);
let mut v0 = args.remove(i-1);
                                
 if let HCO::NODES(r_0) = &mut v0 { 
 if let HCO::NODE(r_1) = v1 { 
r_0.push(r_1);
  } }
                                args.push(v0) } 
fn _fn12 (args:&mut Vec<HCO>, tok: Token){
                            let mut i = args.len()-1;
let mut v0 = args.remove(i-0); 
                                
 let mut ref_0 = &HCGObjStringArray{Val: [String] { &(v0).String()}};

                                args.push(ref_0); 
                            }
fn _fn13 (args:&mut Vec<HCO>, tok: Token){
                            let mut i = args.len()-1;
let mut v1 = args.remove(i-0);
let mut v0 = args.remove(i-1); 
                                
v0.(*HCGObjStringArray).Append(&(v1).String())

                                args.push(v0); 
                            }
fn _fn14 (args:&mut Vec<HCO>, tok: Token){}
fn _fn15 (args:&mut Vec<HCO>, tok: Token){  let mut i = args.len()-1;
let mut v1 = args.remove(i-0);
let mut v0 = args.remove(i-1);
 args.push(v1); }



pub const FunctionMaps:[RF; 29]= [
    _fn14,_fn0,_fn1,_fn2,_fn3,_fn4,_fn5,_fn6,_fn8,_fn7,_fn14,_fn14,_fn9,_fn9,_fn15,_fn14,_fn14,_fn14,_fn14,_fn14,_fn15,_fn14,_fn14,_fn10,_fn11,_fn12,_fn13,_fn12,_fn13,
];
