
    
    use candlelib_hydrocarbon::completer::*;
    use super::spec_parser::*;

    type NodeRef = Box<ASTRef<TypeEnum>>;

    #[derive(Debug)]
pub struct QueryBody  { 
            container:NodeRef,
            filter:NodeRef,
            sort:NodeRef
        }

#[derive(Debug)]
pub struct ContainerClause  { 
            path:NodeRef,
            container:NodeRef
        }

#[derive(Debug)]
pub struct AND  { 
            left:NodeRef,
            right:NodeRef
        }

#[derive(Debug)]
pub struct OR  { 
            left:NodeRef,
            right:NodeRef
        }

#[derive(Debug)]
pub struct NOT  { 
            left:NodeRef
        }

#[derive(Debug)]
pub struct MATCH  { 
            value:NodeRef
        }

#[derive(Debug)]
pub struct CREATED  { 
            val:NodeRef,
            order:NodeRef
        }

#[derive(Debug)]
pub struct MODIFIED  { 
            val:NodeRef,
            order:NodeRef
        }

#[derive(Debug)]
pub struct SIZE  { 
            val:NodeRef,
            order:NodeRef
        }

#[derive(Debug)]
pub struct TAG  { 
            id:NodeRef,
            val:NodeRef,
            order:NodeRef
        }

#[derive(Debug)]
pub struct EQUALS_QUANTITATIVE  { 
            val:NodeRef
        }

#[derive(Debug)]
pub struct EQUALS_QUALITATIVE  { 
            val:NodeRef
        }

#[derive(Debug)]
pub struct GREATERTHAN  { 
            val:NodeRef
        }

#[derive(Debug)]
pub struct LESSTHAN  { 
            val:NodeRef
        }

#[derive(Debug)]
pub struct RANGE  { 
            left:NodeRef,
            right:NodeRef
        }

#[derive(Debug)]
pub struct DATE  { 
            from:NodeRef,
            to:NodeRef
        }

#[derive(Debug)]
pub struct ORDER  { 
            val:f64
        }

#[derive(Debug)]
pub struct IDENTIFIERS  { 
            ids:NodeRef
        }

    #[derive(Debug)]
    pub enum TypeEnum { QueryBody(QueryBody),
ContainerClause(ContainerClause),
AND(AND),
OR(OR),
NOT(NOT),
MATCH(MATCH),
CREATED(CREATED),
MODIFIED(MODIFIED),
SIZE(SIZE),
TAG(TAG),
EQUALS_QUANTITATIVE(EQUALS_QUANTITATIVE),
EQUALS_QUALITATIVE(EQUALS_QUALITATIVE),
GREATERTHAN(GREATERTHAN),
LESSTHAN(LESSTHAN),
RANGE(RANGE),
DATE(DATE),
ORDER(ORDER),
IDENTIFIERS(IDENTIFIERS) }
    
    static reduce_functions : [ReduceFunction<TypeEnum>; 54] = [
|mut data: Vec<NodeRef>, body_len: u32| -> NodeRef { data.remove(data.len() - 1) },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let container = stack.remove(0);
    let filter = stack.remove(0);
    let sort = stack.remove(0); 
    Box::new(ASTRef::NODE(TypeEnum::QueryBody(QueryBody{container,filter,sort})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let container = Box::new(ASTRef::NONE);
    let filter = stack.remove(0);
    let sort = stack.remove(0); 
    Box::new(ASTRef::NODE(TypeEnum::QueryBody(QueryBody{container,filter,sort})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let container = stack.remove(0);
    let filter = Box::new(ASTRef::NONE);
    let sort = stack.remove(0); 
    Box::new(ASTRef::NODE(TypeEnum::QueryBody(QueryBody{container,filter,sort})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let container = stack.remove(0);
    let filter = stack.remove(0);
    let sort = Box::new(ASTRef::NONE); 
    Box::new(ASTRef::NODE(TypeEnum::QueryBody(QueryBody{container,filter,sort})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let container = Box::new(ASTRef::NONE);
    let filter = Box::new(ASTRef::NONE);
    let sort = stack.remove(0); 
    Box::new(ASTRef::NODE(TypeEnum::QueryBody(QueryBody{container,filter,sort})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let container = Box::new(ASTRef::NONE);
    let filter = stack.remove(0);
    let sort = Box::new(ASTRef::NONE); 
    Box::new(ASTRef::NODE(TypeEnum::QueryBody(QueryBody{container,filter,sort})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let container = stack.remove(0);
    let filter = Box::new(ASTRef::NONE);
    let sort = Box::new(ASTRef::NONE); 
    Box::new(ASTRef::NODE(TypeEnum::QueryBody(QueryBody{container,filter,sort})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let path = stack.remove(0);
    let container = stack.remove(0); 
    Box::new(ASTRef::NODE(TypeEnum::ContainerClause(ContainerClause{path,container})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let path = stack.remove(0);
    let container = stack.remove(0); 
    Box::new(ASTRef::NODE(TypeEnum::ContainerClause(ContainerClause{path,container})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let path = Box::new(ASTRef::NONE);
    let container = stack.remove(0); 
    Box::new(ASTRef::NODE(TypeEnum::ContainerClause(ContainerClause{path,container})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let path = stack.remove(0);
    let container = Box::new(ASTRef::NONE); 
    Box::new(ASTRef::NODE(TypeEnum::ContainerClause(ContainerClause{path,container})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let path = Box::new(ASTRef::NONE);
    let container = stack.remove(0); 
    Box::new(ASTRef::NODE(TypeEnum::ContainerClause(ContainerClause{path,container})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let path = stack.remove(0);
    let container = Box::new(ASTRef::NONE); 
    Box::new(ASTRef::NODE(TypeEnum::ContainerClause(ContainerClause{path,container})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ stack.remove(0) },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ stack.remove(2) },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ stack.remove(1) },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let left = stack.remove(0);
    let right = stack.remove(0); 
    Box::new(ASTRef::NODE(TypeEnum::AND(AND{left,right})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let left = stack.remove(0);
    let right = stack.remove(0); 
    Box::new(ASTRef::NODE(TypeEnum::OR(OR{left,right})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let left = stack.remove(0); 
    Box::new(ASTRef::NODE(TypeEnum::NOT(NOT{left})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let value = stack.remove(0); 
    Box::new(ASTRef::NODE(TypeEnum::MATCH(MATCH{value})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let val = stack.remove(0);
    let order = stack.remove(0); 
    Box::new(ASTRef::NODE(TypeEnum::CREATED(CREATED{val,order})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let val = Box::new(ASTRef::NONE);
    let order = stack.remove(0); 
    Box::new(ASTRef::NODE(TypeEnum::CREATED(CREATED{val,order})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let val = stack.remove(0);
    let order = Box::new(ASTRef::NONE); 
    Box::new(ASTRef::NODE(TypeEnum::CREATED(CREATED{val,order})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let val = Box::new(ASTRef::NONE);
    let order = Box::new(ASTRef::NONE); 
    Box::new(ASTRef::NODE(TypeEnum::CREATED(CREATED{val,order})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let val = stack.remove(0);
    let order = stack.remove(0); 
    Box::new(ASTRef::NODE(TypeEnum::MODIFIED(MODIFIED{val,order})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let val = Box::new(ASTRef::NONE);
    let order = stack.remove(0); 
    Box::new(ASTRef::NODE(TypeEnum::MODIFIED(MODIFIED{val,order})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let val = stack.remove(0);
    let order = Box::new(ASTRef::NONE); 
    Box::new(ASTRef::NODE(TypeEnum::MODIFIED(MODIFIED{val,order})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let val = Box::new(ASTRef::NONE);
    let order = Box::new(ASTRef::NONE); 
    Box::new(ASTRef::NODE(TypeEnum::MODIFIED(MODIFIED{val,order})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let val = stack.remove(0);
    let order = stack.remove(0); 
    Box::new(ASTRef::NODE(TypeEnum::SIZE(SIZE{val,order})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let val = stack.remove(0);
    let order = Box::new(ASTRef::NONE); 
    Box::new(ASTRef::NODE(TypeEnum::SIZE(SIZE{val,order})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let id = stack.remove(0);
    let val = stack.remove(0);
    let order = stack.remove(0); 
    Box::new(ASTRef::NODE(TypeEnum::TAG(TAG{id,val,order})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let id = stack.remove(0);
    let val = Box::new(ASTRef::NONE);
    let order = stack.remove(0); 
    Box::new(ASTRef::NODE(TypeEnum::TAG(TAG{id,val,order})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let id = stack.remove(0);
    let val = stack.remove(0);
    let order = Box::new(ASTRef::NONE); 
    Box::new(ASTRef::NODE(TypeEnum::TAG(TAG{id,val,order})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let id = stack.remove(0);
    let val = Box::new(ASTRef::NONE);
    let order = Box::new(ASTRef::NONE); 
    Box::new(ASTRef::NODE(TypeEnum::TAG(TAG{id,val,order})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let val = stack.remove(0); 
    Box::new(ASTRef::NODE(TypeEnum::EQUALS_QUANTITATIVE(EQUALS_QUANTITATIVE{val})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let val = stack.remove(0); 
    Box::new(ASTRef::NODE(TypeEnum::EQUALS_QUALITATIVE(EQUALS_QUALITATIVE{val})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let val = stack.remove(0); 
    Box::new(ASTRef::NODE(TypeEnum::GREATERTHAN(GREATERTHAN{val})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let val = stack.remove(0); 
    Box::new(ASTRef::NODE(TypeEnum::LESSTHAN(LESSTHAN{val})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let val = stack.remove(0); 
    Box::new(ASTRef::NODE(TypeEnum::EQUALS_QUANTITATIVE(EQUALS_QUANTITATIVE{val})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let val = stack.remove(0); 
    Box::new(ASTRef::NODE(TypeEnum::EQUALS_QUALITATIVE(EQUALS_QUALITATIVE{val})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let val = stack.remove(0); 
    Box::new(ASTRef::NODE(TypeEnum::GREATERTHAN(GREATERTHAN{val})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let val = stack.remove(0); 
    Box::new(ASTRef::NODE(TypeEnum::LESSTHAN(LESSTHAN{val})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let val = stack.remove(0); 
    Box::new(ASTRef::NODE(TypeEnum::GREATERTHAN(GREATERTHAN{val})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let val = stack.remove(0); 
    Box::new(ASTRef::NODE(TypeEnum::LESSTHAN(LESSTHAN{val})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let left = stack.remove(0);
    let right = stack.remove(0); 
    Box::new(ASTRef::NODE(TypeEnum::RANGE(RANGE{left,right})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let from = stack.remove(0);
    let to = stack.remove(0); 
    Box::new(ASTRef::NODE(TypeEnum::DATE(DATE{from,to})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let from = stack.remove(0);
    let to = Box::new(ASTRef::NONE); 
    Box::new(ASTRef::NODE(TypeEnum::DATE(DATE{from,to})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let val: f64 = -1 as f64; 
    Box::new(ASTRef::NODE(TypeEnum::ORDER(ORDER{val})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let val: f64 = 1 as f64; 
    Box::new(ASTRef::NODE(TypeEnum::ORDER(ORDER{val})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
    let ids = stack.remove(0); 
    Box::new(ASTRef::NODE(TypeEnum::IDENTIFIERS(IDENTIFIERS{ids})))
     },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ Box::new(ASTRef::VECTOR(vec![stack.remove(0)])) },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
                let node = stack.remove(1);
                let mut vec = stack.remove(0);

                if let ASTRef::VECTOR(ref mut vector) = vec.as_mut() {
                    vector.push(node);
                }

                vec
             },
|mut stack: Vec<NodeRef>, body_len: u32| -> NodeRef{ 
                let node = stack.remove(2);
                let mut vec = stack.remove(0);

                if let ASTRef::VECTOR(ref mut vector) = vec.as_mut() {
                    vector.push(node);
                }

                vec
             }];


    pub fn parse(string_data: &[u8]) -> OptionedBoxedASTRef<TypeEnum> {
        parser_core(string_data, 0, hc_RNQL, &reduce_functions)
    }
