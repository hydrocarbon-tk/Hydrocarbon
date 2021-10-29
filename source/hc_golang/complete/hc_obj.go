package hc_recognizer

/*
A generic interface for use by AST trees generated
by the hc recognizer/completer
*/
type HCObj interface {
	GetType() uint32
	String() string
	Double() float64
}

type HCNode interface {
	GetType() uint32
	String() string
	Double() float64
	Token() *Token
	Type() uint32
	Iterate(yield HCNodeIterator, node HCNode, i int, j int)
}

type HCIterator func(node HCNode, par HCNode)

type HCNodeIterator func(node HCNode, par HCNode, i int, j int)

type ReduceFunction func(args []HCObj, tok *Token) HCObj

func IterateHCObj(obj HCNode, fn HCIterator) {
	obj.Iterate(func(node HCNode, par HCNode, i int, j int) {
		fn(node, par)
	}, NILHCObj{}, -1, -1)
}

type NILHCObj struct{}

func (obj NILHCObj) GetType() uint32 { return 0 }

func (obj NILHCObj) Iterate(HCNodeIterator, HCNode, int, int) {}

func (obj NILHCObj) Token() *Token { return newToken(nil, 0, 0, 0) }

func (obj NILHCObj) Type() uint32 { return 0 }

func (obj NILHCObj) String() string { return "" }

func (obj NILHCObj) Double() float64 { return 0 }

type HCGObjString struct {
	Val string
}

func (obj HCGObjString) GetType() uint32 { return 0 }

func (obj HCGObjString) String() string { return obj.Val }

func (obj HCGObjString) Double() float64 { return 0 }

type HCGObjDOUBLE struct {
	Val float64
}

func (obj HCGObjDOUBLE) GetType() uint32 { return 0 }

func (obj HCGObjDOUBLE) String() string { return "" }

func (obj HCGObjDOUBLE) Double() float64 { return obj.Val }

type HCGObjStringArray struct {
	Val []string
}

func (obj *HCGObjStringArray) GetType() uint32 { return 0 }

func (obj *HCGObjStringArray) String() string { return "[HCGObjStringArray]" }

func (obj *HCGObjStringArray) Double() float64 { return 0 }

func (obj *HCGObjStringArray) Append(args ...string) {
	obj.Val = append(obj.Val, args...)
}

type HCGObjDoubleArray struct {
	Val []float64
}

func (obj *HCGObjDoubleArray) GetType() uint32 { return 0 }

func (obj *HCGObjDoubleArray) String() string { return "[HCGObjDoubleArray]" }

func (obj *HCGObjDoubleArray) Double() float64 { return 0 }

func (obj *HCGObjDoubleArray) Append(args ...float64) {
	obj.Val = append(obj.Val, args...)
}

type HCGObjNodeArray struct {
	Val []HCNode
}

func (obj *HCGObjNodeArray) GetType() uint32 { return 0 }

func (obj *HCGObjNodeArray) Iterate(yield HCNodeIterator, par HCNode, i int, j int) {
	for i := 0; i < len(obj.Val); i++ {
		obj.Val[i].Iterate(yield, obj, 0, 1)
	}
}

func (obj *HCGObjNodeArray) Replace(child HCNode, i int, j int) {
	obj.Val[i] = child
}

func (obj *HCGObjNodeArray) Token() *Token { return newToken(nil, 0, 0, 0) }

func (obj *HCGObjNodeArray) String() string { return "[HCGObjNodeArray]" }

func (obj *HCGObjNodeArray) Type() uint32 { return 0 }

func (obj *HCGObjNodeArray) Double() float64 { return 0 }

func (obj *HCGObjNodeArray) Append(args ...HCNode) {
	obj.Val = append(obj.Val, args...)
}
