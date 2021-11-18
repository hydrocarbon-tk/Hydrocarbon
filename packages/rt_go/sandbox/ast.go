package main


import (
    . "candlelib/hc_completer"
)


type Path struct {
    tok Token
    idents [] &undefined
}
func newPath( tok *Token, _idents [] &undefined) *Path {
    return &Path{
        tok: *tok,
        idents : _idents,
    }
}






func (node *Path) Iterate( yield HCNodeIterator, parent HCNode, i int, j int,) {
    
    yield(node, parent, i, j);
        
    
    
}

func (node *Path) Replace(child HCNode, i int, j int){

/*     match i{
    0 => {
                    
        if let Some(old) = self.replace_idents(child, j){ 
            return old;
        }else{
            return ASTNode::NONE;
        }
                }
        _ => {}
    }; */
}


func (node *Path) String() string{
    return node.tok.String()
}

func (node *Path) F64() float64{ return 0 }
func (node *Path) F32() float32{ return 0 }
func (node *Path) I64() int64{ return 0 }
func (node *Path) I32() int32{ return 0 }
func (node *Path) I16() int16{ return 0 }
func (node *Path) I8() int8{ return 0 }

func (node *Path) BOOL() bool{ return false }


func (node *Path) Token() *Token{
    return &node.tok
}
func (node *Path) GetType() uint32{
    return 2
}
func (node *Path) Type() uint32{
    return 2
}



type Ident struct {
    tok Token
    val string
}
func newIdent( tok *Token, _val string) *Ident {
    return &Ident{
        tok: *tok,
        val : _val,
    }
}






func (node *Ident) Iterate( yield HCNodeIterator, parent HCNode, i int, j int,) {
    
    yield(node, parent, i, j);
        
    
    
}

func (node *Ident) Replace(child HCNode, i int, j int){

/*     match i{
    
        _ => {}
    }; */
}


func (node *Ident) String() string{
    return node.tok.String()
}

func (node *Ident) F64() float64{ return 0 }
func (node *Ident) F32() float32{ return 0 }
func (node *Ident) I64() int64{ return 0 }
func (node *Ident) I32() int32{ return 0 }
func (node *Ident) I16() int16{ return 0 }
func (node *Ident) I8() int8{ return 0 }

func (node *Ident) BOOL() bool{ return false }


func (node *Ident) Token() *Token{
    return &node.tok
}
func (node *Ident) GetType() uint32{
    return 4
}
func (node *Ident) Type() uint32{
    return 4
}



func _FN0_ (args []HCObj, tok *Token) []HCObj { 
    i := len(args)-1
v1 := args[i]
args = append(args[:i], args[i+1:]...)
i--
v0 := args[i]
args = append(args[:i], args[i+1:]...)
i--
    
ref_0 := Vec<ASTNode>{ (v0).(Box<Ident>)}
ref_1 := newPath(
        tok,
        ref_0,
    ) 


    return append(args, ref_1)
    
}
func _FN1_ (args []HCObj, tok *Token) []HCObj { 
    i := len(args)-1
v0 := args[i]
args = append(args[:i], args[i+1:]...)
i--
    
ref_0 := newIdent(
        tok,
        v0,
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
    
ref_0 := &HCGObjNodeArray{Val: []HCNode { v0, v1}}

    return append(args, ref_0)
    
}
func _FN3_ (args []HCObj, tok *Token) []HCObj { 
    i := len(args)-1
v0 := args[i]
args = append(args[:i], args[i+1:]...)
i--
    
ref_0 := Vec<ASTNode>{ (v0).(Box<Path>)}

    return append(args, ref_0)
    
}
func _FN4_ (args []HCObj, tok *Token) []HCObj { 
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
    
r_0 := (v0).(Box<Path>)
ref_0 := v1
r_0.idents.push(ref_0);
r_0.idents

    return append(args, v0)
    
}
func _FN5_ (args []HCObj, tok *Token) []HCObj { 
    i := len(args)-1
v1 := args[i]
args = append(args[:i], args[i+1:]...)
i--
v0 := args[i]
args = append(args[:i], args[i+1:]...)
i--
    

    val := v0 + &v1.String()
    return append(args, HCGObjString{Val:val})
    
}
func _FN6_ (args []HCObj, tok *Token) []HCObj { 
    i := len(args)-1
v0 := args[i]
args = append(args[:i], args[i+1:]...)
i--
    

    val := v0.String()
    return append(args, HCGObjString{Val:val})
    
}
func _FN7_ (args []HCObj, tok *Token) []HCObj { return args }



var FunctionMaps = []ReduceFunction  {
    _FN2_,
    _FN3_,
    _FN7_,
    _FN4_,
    _FN0_,
    _FN1_,
    _FN5_,
    _FN6_,
}
