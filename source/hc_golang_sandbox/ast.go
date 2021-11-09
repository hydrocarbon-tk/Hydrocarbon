package main


import (
    . "candlelib/hc_completer"
)


type QueryBody struct {
    tok Token
    container &ContainerClause
filter interface{}
sort interface{}
}
func newQueryBody( tok *Token, _container &ContainerClause, _filter interface{}, _sort interface{}) *QueryBody {
    return &QueryBody{
        tok: *tok,
        container : _container,
        filter : _filter,
        sort : _sort,
    }
}






func (node *QueryBody) Iterate( yield HCNodeIterator, parent HCNode, i int, j int,) {
    
    yield(node, parent, i, j);
        
    
    
}

func (node *QueryBody) Replace(child HCNode, i int, j int){

/*     match i{
    0 => {
                    
        if let Some(old) = self.replace_container(child){ 
                return old;
            }else{
                return ASTNode::NONE;
            }
                }
        _ => {}
    }; */
}


func (node *QueryBody) String() string{
    return node.tok.String()
}

func (node *QueryBody) F64() float64{ return 0 }
func (node *QueryBody) F32() float32{ return 0 }
func (node *QueryBody) I64() int64{ return 0 }
func (node *QueryBody) I32() int32{ return 0 }
func (node *QueryBody) I16() int16{ return 0 }
func (node *QueryBody) I8() int8{ return 0 }

func (node *QueryBody) BOOL() bool{ return false }


func (node *QueryBody) Token() *Token{
    return &node.tok
}
func (node *QueryBody) GetType() uint32{
    return 2
}
func (node *QueryBody) Type() uint32{
    return 2
}



type ContainerClause struct {
    tok Token
    path [] &undefined
container HCNode
}
func newContainerClause( tok *Token, _path [] &undefined, _container HCNode) *ContainerClause {
    return &ContainerClause{
        tok: *tok,
        path : _path,
        container : _container,
    }
}







func (node *ContainerClause) Iterate( yield HCNodeIterator, parent HCNode, i int, j int,) {
    
    yield(node, parent, i, j);
        
    
    
}

func (node *ContainerClause) Replace(child HCNode, i int, j int){

/*     match i{
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
    }; */
}


func (node *ContainerClause) String() string{
    return node.tok.String()
}

func (node *ContainerClause) F64() float64{ return 0 }
func (node *ContainerClause) F32() float32{ return 0 }
func (node *ContainerClause) I64() int64{ return 0 }
func (node *ContainerClause) I32() int32{ return 0 }
func (node *ContainerClause) I16() int16{ return 0 }
func (node *ContainerClause) I8() int8{ return 0 }

func (node *ContainerClause) BOOL() bool{ return false }


func (node *ContainerClause) Token() *Token{
    return &node.tok
}
func (node *ContainerClause) GetType() uint32{
    return 4
}
func (node *ContainerClause) Type() uint32{
    return 4
}



type IDENTIFIERS struct {
    tok Token
    ids Vec<Token>
}
func newIDENTIFIERS( tok *Token, _ids Vec<Token>) *IDENTIFIERS {
    return &IDENTIFIERS{
        tok: *tok,
        ids : _ids,
    }
}






func (node *IDENTIFIERS) Iterate( yield HCNodeIterator, parent HCNode, i int, j int,) {
    
    yield(node, parent, i, j);
        
    
    
}

func (node *IDENTIFIERS) Replace(child HCNode, i int, j int){

/*     match i{
    
        _ => {}
    }; */
}


func (node *IDENTIFIERS) String() string{
    return node.tok.String()
}

func (node *IDENTIFIERS) F64() float64{ return 0 }
func (node *IDENTIFIERS) F32() float32{ return 0 }
func (node *IDENTIFIERS) I64() int64{ return 0 }
func (node *IDENTIFIERS) I32() int32{ return 0 }
func (node *IDENTIFIERS) I16() int16{ return 0 }
func (node *IDENTIFIERS) I8() int8{ return 0 }

func (node *IDENTIFIERS) BOOL() bool{ return false }


func (node *IDENTIFIERS) Token() *Token{
    return &node.tok
}
func (node *IDENTIFIERS) GetType() uint32{
    return 6
}
func (node *IDENTIFIERS) Type() uint32{
    return 6
}



func _FN0_ (args []HCObj, tok *Token) []HCObj { 
    i := len(args)-1
v0 := args[i]
args = append(args[:i], args[i+1:]...)
i--
    
ref_0 := newQueryBody(
        tok,
        (v0).(*ContainerClause),
        nil,
        nil,
    ) 


    return append(args, ref_0)
    
}
func _FN1_ (args []HCObj, tok *Token) []HCObj { 
    i := len(args)-1
v2 := args[i]
args = append(args[:i], args[i+1:]...)
i--
v1 := args[i]
args = append(args[:i], args[i+1:]...)
i--
v0 := args[i]
args = append(args[:i], args[i+1:]...)
i--
    
ref_0 := newContainerClause(
        tok,
        v1,
        (v2).(*IDENTIFIERS),
    ) 


    return append(args, ref_0)
    
}
func _FN2_ (args []HCObj, tok *Token) []HCObj { 
    i := len(args)-1
v1 := args[i]
args = append(args[:i], args[i+1:]...)
i--
v0 := args[i]
args = append(args[:i], args[i+1:]...)
i--
    
ref_0 := newContainerClause(
        tok,
        v0,
        (v1).(*IDENTIFIERS),
    ) 


    return append(args, ref_0)
    
}
func _FN3_ (args []HCObj, tok *Token) []HCObj { 
    i := len(args)-1
v1 := args[i]
args = append(args[:i], args[i+1:]...)
i--
v0 := args[i]
args = append(args[:i], args[i+1:]...)
i--
    
ref_0 := newContainerClause(
        tok,
        nil,
        (v1).(*IDENTIFIERS),
    ) 


    return append(args, ref_0)
    
}
func _FN4_ (args []HCObj, tok *Token) []HCObj { 
    i := len(args)-1
v1 := args[i]
args = append(args[:i], args[i+1:]...)
i--
v0 := args[i]
args = append(args[:i], args[i+1:]...)
i--
    
ref_0 := newContainerClause(
        tok,
        v1,
        nil,
    ) 


    return append(args, ref_0)
    
}
func _FN5_ (args []HCObj, tok *Token) []HCObj { 
    i := len(args)-1
v0 := args[i]
args = append(args[:i], args[i+1:]...)
i--
    
ref_0 := newContainerClause(
        tok,
        nil,
        (v0).(*IDENTIFIERS),
    ) 


    return append(args, ref_0)
    
}
func _FN6_ (args []HCObj, tok *Token) []HCObj { 
    i := len(args)-1
v0 := args[i]
args = append(args[:i], args[i+1:]...)
i--
    
ref_0 := newContainerClause(
        tok,
        v0,
        nil,
    ) 


    return append(args, ref_0)
    
}
func _FN7_ (args []HCObj, tok *Token) []HCObj { 
    i := len(args)-1
v0 := args[i]
args = append(args[:i], args[i+1:]...)
i--
    
ref_0 := newIDENTIFIERS(
        tok,
        v0,
    ) 


    return append(args, ref_0)
    
}
func _FN8_ (args []HCObj, tok *Token) []HCObj { 
    i := len(args)-1
v1 := args[i]
args = append(args[:i], args[i+1:]...)
i--
v0 := args[i]
args = append(args[:i], args[i+1:]...)
i--
    

    return append(args, v0)
    
}
func _FN9_ (args []HCObj, tok *Token) []HCObj { 
    i := len(args)-1
v2 := args[i]
args = append(args[:i], args[i+1:]...)
i--
v1 := args[i]
args = append(args[:i], args[i+1:]...)
i--
v0 := args[i]
args = append(args[:i], args[i+1:]...)
i--
    

    val := (v1).String()
    return append(args, HCGObjString{Val:val})
    
}
func _FN10_ (args []HCObj, tok *Token) []HCObj { 
    i := len(args)-1
v0 := args[i]
args = append(args[:i], args[i+1:]...)
i--
    
ref_0 := Vec<ASTNode>{ (v0).(Box<IDENTIFIERS>)}

    return append(args, ref_0)
    
}
func _FN11_ (args []HCObj, tok *Token) []HCObj { 
    i := len(args)-1
v1 := args[i]
args = append(args[:i], args[i+1:]...)
i--
v0 := args[i]
args = append(args[:i], args[i+1:]...)
i--
    
ref_0 := v0.(*[]interface{})
ref_1 := v1
ref_0.push(ref_1);

    return append(args, v0)
    
}
func _FN12_ (args []HCObj, tok *Token) []HCObj { 
    i := len(args)-1
v0 := args[i]
args = append(args[:i], args[i+1:]...)
i--
    
ref_0 := &HCGObjStringArray{Val: []string { &(v0).String()}}

    return append(args, ref_0)
    
}
func _FN13_ (args []HCObj, tok *Token) []HCObj { 
    i := len(args)-1
v1 := args[i]
args = append(args[:i], args[i+1:]...)
i--
v0 := args[i]
args = append(args[:i], args[i+1:]...)
i--
    
v0.(*HCGObjStringArray).Append(&(v1).String())

    return append(args, v0)
    
}
func _FN14_ (args []HCObj, tok *Token) []HCObj { return args }
func _FN15_ (args []HCObj, tok *Token) []HCObj {  i := len(args)-1
v1 := args[i]
args = append(args[:i], args[i+1:]...)
i--
v0 := args[i]
args = append(args[:i], args[i+1:]...)
i--
 return append(args, v1); }



var FunctionMaps = []ReduceFunction  {
    _FN14_,
    _FN0_,
    _FN1_,
    _FN2_,
    _FN3_,
    _FN4_,
    _FN5_,
    _FN6_,
    _FN8_,
    _FN7_,
    _FN14_,
    _FN14_,
    _FN9_,
    _FN9_,
    _FN15_,
    _FN14_,
    _FN14_,
    _FN14_,
    _FN14_,
    _FN14_,
    _FN15_,
    _FN14_,
    _FN14_,
    _FN10_,
    _FN11_,
    _FN12_,
    _FN13_,
    _FN12_,
    _FN13_,
}
