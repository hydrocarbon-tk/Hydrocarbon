
pub enum EntryPoints {
    test:67108956
}


import (
    . "candlelib/hc_completer"
)


const ( 
     
)

const ( 
     
)


func _FN0_ (args []HCObj, tok *Token) HCObj { 
    ref_0 := &HCGObjStringArray{Val: []string { (args[0]).String()}}
    return ref_0 
}
func _FN1_ (args []HCObj, tok *Token) HCObj { 
    args[0].(*HCGObjStringArray).Append((args[1]).String())
    return args[0] 
}
func _FN2_ (args []HCObj, tok *Token) HCObj { 
    
    return args[len(args)-1] 
}



var FunctionMaps = []ReduceFunction  {
    _FN2_,
    _FN2_,
    _FN2_,
    _FN2_,
    _FN2_,
    _FN0_,
    _FN1_,
    _FN0_,
    _FN1_,
}
