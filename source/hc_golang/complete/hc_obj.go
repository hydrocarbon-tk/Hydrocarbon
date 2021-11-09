package hc_recognizer

/*
A generic interface for use by AST trees generated
by the hc recognizer/completer
*/
type HCObj interface {
	GetType() uint32
	String() string
	F64() float64
	F32() float32
	I64() int64
	I32() int32
	I16() int16
	I8() int8
	BOOL() bool
}

type HCNode interface {
	GetType() uint32
	String() string
	F64() float64
	F32() float32
	I64() int64
	I32() int32
	I16() int16
	I8() int8
	BOOL() bool
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

func (obj NILHCObj) F64() float64 { return 0 }

func (obj NILHCObj) F32() float32 { return 0 }

func (obj NILHCObj) I64() int64 { return 0 }

func (obj NILHCObj) I32() int32 { return 0 }

func (obj NILHCObj) I16() int16 { return 0 }

func (obj NILHCObj) I8() int8 { return 0 }

type HCGObjString struct {
	Val string
}

func (obj HCGObjString) GetType() uint32 { return 0 }

func (obj HCGObjString) String() string { return obj.Val }

func (obj HCGObjString) F64() float64 { return 0 }

func (obj HCGObjString) F32() float32 { return 0 }

func (obj HCGObjString) I64() int64 { return 0 }

func (obj HCGObjString) I32() int32 { return 0 }

func (obj HCGObjString) I16() int16 { return 0 }

func (obj HCGObjString) I8() int8 { return 0 }

type HCGObjF64 struct {
	Val float64
}

func (obj HCGObjF64) GetType() uint32 { return 0 }

func (obj HCGObjF64) String() string { return "" }

func (obj HCGObjF64) F64() float64 { return obj.Val }

func (obj HCGObjF64) F32() float32 { return float32(obj.Val) }

func (obj HCGObjF64) I64() int64 { return int64(obj.Val) }

func (obj HCGObjF64) I32() int32 { return int32(obj.Val) }

func (obj HCGObjF64) I16() int16 { return int16(obj.Val) }

func (obj HCGObjF64) I8() int8 { return int8(obj.Val) }

type HCGObjF32 struct {
	Val float32
}

func (obj HCGObjF32) GetType() uint32 { return 0 }

func (obj HCGObjF32) String() string { return "" }

func (obj HCGObjF32) F64() float64 { return float64(obj.Val) }

func (obj HCGObjF32) F32() float32 { return float32(obj.Val) }

func (obj HCGObjF32) I64() int64 { return int64(obj.Val) }

func (obj HCGObjF32) I32() int32 { return int32(obj.Val) }

func (obj HCGObjF32) I16() int16 { return int16(obj.Val) }

func (obj HCGObjF32) I8() int8 { return int8(obj.Val) }

type HCGObjI64 struct {
	Val int64
}

func (obj HCGObjI64) GetType() uint32 { return 0 }

func (obj HCGObjI64) String() string { return "" }

func (obj HCGObjI64) F64() float64 { return float64(obj.Val) }

func (obj HCGObjI64) F32() float32 { return float32(obj.Val) }

func (obj HCGObjI64) I64() int64 { return int64(obj.Val) }

func (obj HCGObjI64) I32() int32 { return int32(obj.Val) }

func (obj HCGObjI64) I16() int16 { return int16(obj.Val) }

func (obj HCGObjI64) I8() int8 { return int8(obj.Val) }

type HCGObjI32 struct {
	Val int32
}

func (obj HCGObjI32) GetType() uint32 { return 0 }

func (obj HCGObjI32) String() string { return "" }

func (obj HCGObjI32) F64() float64 { return float64(obj.Val) }

func (obj HCGObjI32) F32() float32 { return float32(obj.Val) }

func (obj HCGObjI32) I64() int64 { return int64(obj.Val) }

func (obj HCGObjI32) I32() int32 { return int32(obj.Val) }

func (obj HCGObjI32) I16() int16 { return int16(obj.Val) }

func (obj HCGObjI32) I8() int8 { return int8(obj.Val) }

type HCGObjI16 struct {
	Val int16
}

func (obj HCGObjI16) GetType() uint32 { return 0 }

func (obj HCGObjI16) String() string { return "" }

func (obj HCGObjI16) F64() float64 { return float64(obj.Val) }

func (obj HCGObjI16) F32() float32 { return float32(obj.Val) }

func (obj HCGObjI16) I64() int64 { return int64(obj.Val) }

func (obj HCGObjI16) I32() int32 { return int32(obj.Val) }

func (obj HCGObjI16) I16() int16 { return int16(obj.Val) }

func (obj HCGObjI16) I8() int8 { return int8(obj.Val) }

type HCGObjI8 struct {
	Val int8
}

func (obj HCGObjI8) GetType() uint32 { return 0 }

func (obj HCGObjI8) String() string { return "" }

func (obj HCGObjI8) F64() float64 { return float64(obj.Val) }

func (obj HCGObjI8) F32() float32 { return float32(obj.Val) }

func (obj HCGObjI8) I64() int64 { return int64(obj.Val) }

func (obj HCGObjI8) I32() int32 { return int32(obj.Val) }

func (obj HCGObjI8) I16() int16 { return int16(obj.Val) }

func (obj HCGObjI8) I8() int8 { return int8(obj.Val) }

type HCGObjStringArray struct {
	Val []string
}

func (obj *HCGObjStringArray) GetType() uint32 { return 0 }

func (obj *HCGObjStringArray) String() string { return "[HCGObjStringArray]" }

func (obj *HCGObjStringArray) F64() float64 { return 0 }

func (obj *HCGObjStringArray) Append(args ...string) {
	obj.Val = append(obj.Val, args...)
}

type HCGObjDoubleArray struct {
	Val []float64
}

func (obj *HCGObjDoubleArray) GetType() uint32 { return 0 }

func (obj *HCGObjDoubleArray) String() string { return "[HCGObjDoubleArray]" }

func (obj *HCGObjDoubleArray) F64() float64 { return 0 }

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

func (obj *HCGObjNodeArray) BOOL() bool { return false }

func (obj *HCGObjNodeArray) Type() uint32 { return 0 }

func (obj *HCGObjNodeArray) F64() float64 { return 0 }

func (obj *HCGObjNodeArray) F32() float32 { return 0 }

func (obj *HCGObjNodeArray) I64() int64 { return 0 }

func (obj *HCGObjNodeArray) I32() int32 { return 0 }

func (obj *HCGObjNodeArray) I16() int16 { return 0 }

func (obj *HCGObjNodeArray) I8() int8 { return 0 }

func (obj *HCGObjNodeArray) Append(args ...HCNode) {
	obj.Val = append(obj.Val, args...)
}
