package main

import (
	. "candlelib/hc_completer"
)

const (
	ClassProduction uint32 = 2
	ClassFunction   uint32 = 4
)

const (
	Type_Productions uint32 = 8
	Type_Production  uint32 = 18
	Type_Function    uint32 = 28
)

type Productions struct {
	_type       uint32
	tok         Token
	functions   []*Function
	productions []*Production
}

func newProductions(tok *Token, _functions []*Function, _productions []*Production) *Productions {
	return &Productions{
		_type:       Type_Productions,
		tok:         *tok,
		functions:   _functions,
		productions: _productions,
	}
}

func (node *Productions) GetType() uint32 {
	return node._type
}

func (node *Productions) Iterate(yield HCNodeIterator, parent HCNode, i int, j int) {

	yield(node, parent, i, j)
	for i := 0; i < len(node.functions); i += 1 {
		node.functions[i].Iterate(yield, node, 0, i)
	}
	for i := 0; i < len(node.productions); i += 1 {
		node.productions[i].Iterate(yield, node, 1, i)
	}
}

func (node *Productions) Replace(child HCNode, i int, j int) {

	switch i {
	case 0:
		for i := 0; i < len(node.functions); i += 1 {
			//node.functions[i].Iterate(yield, child, 0, i);
		}

	case 1:
		for i := 0; i < len(node.productions); i += 1 {
			//node.productions[i].Iterate(yield, child, 1, i);
		}

	}
}

func (node *Productions) String() string {
	return node.tok.String()
}

func (node *Productions) Double() float64 {
	return 0
}

func (node *Productions) Token() *Token {
	return &node.tok
}

func (node *Productions) Type() uint32 {
	return node._type
}

type Production struct {
	_type uint32
	tok   Token
	name  string
	id    float64
}

func newProduction(tok *Token, _name string, _id float64) *Production {
	return &Production{
		_type: Type_Production,
		tok:   *tok,
		name:  _name,
		id:    _id,
	}
}

func (node *Production) GetType() uint32 {
	return node._type
}

func (node *Production) Iterate(yield HCNodeIterator, parent HCNode, i int, j int) {

	yield(node, parent, i, j)

}

func (node *Production) Replace(child HCNode, i int, j int) {

	switch i {

	}
}

func (node *Production) String() string {
	return node.tok.String()
}

func (node *Production) Double() float64 {
	return 0
}

func (node *Production) Token() *Token {
	return &node.tok
}

func (node *Production) Type() uint32 {
	return node._type
}

type Function struct {
	_type uint32
	tok   Token
	name  string
	id    float64
}

func newFunction(tok *Token, _name string, _id float64) *Function {
	return &Function{
		_type: Type_Function,
		tok:   *tok,
		name:  _name,
		id:    _id,
	}
}

func (node *Function) GetType() uint32 {
	return node._type
}

func (node *Function) Iterate(yield HCNodeIterator, parent HCNode, i int, j int) {

	yield(node, parent, i, j)

}

func (node *Function) Replace(child HCNode, i int, j int) {

	switch i {

	}
}

func (node *Function) String() string {
	return node.tok.String()
}

func (node *Function) Double() float64 {
	return 0
}

func (node *Function) Token() *Token {
	return &node.tok
}

func (node *Function) Type() uint32 {
	return node._type
}

func _FN0_(args []HCObj, tok *Token) HCObj {
	ref_0 := []*Function{}
	ref_1 := []*Production{(args[0]).(*Production)}
	return newProductions(
		tok,
		ref_0,
		ref_1,
	)
}
func _FN1_(args []HCObj, tok *Token) HCObj {
	ref_0 := []*Function{(args[0]).(*Function)}
	ref_1 := []*Production{}
	return newProductions(
		tok,
		ref_0,
		ref_1,
	)
}
func _FN2_(args []HCObj, tok *Token) HCObj {

	return newProduction(
		tok,
		(args[1]).String(),
		1,
	)
}
func _FN3_(args []HCObj, tok *Token) HCObj {

	return newFunction(
		tok,
		(args[1]).String(),
		1,
	)
}
func _FN4_(args []HCObj, tok *Token) HCObj {
	r_0 := (args[0]).(*Productions)
	r_0.productions = append(r_0.productions, (args[1]).(*Production))

	return args[0]
}
func _FN5_(args []HCObj, tok *Token) HCObj {
	r_0 := (args[0]).(*Productions)
	r_0.functions = append(r_0.functions, (args[1]).(*Function))

	return args[0]
}
func _FN6_(args []HCObj, tok *Token) HCObj {
	ref_0 := &HCGObjStringArray{Val: []string{(args[0]).String()}}
	return ref_0
}
func _FN7_(args []HCObj, tok *Token) HCObj {
	args[0].(*HCGObjStringArray).Append((args[1]).String())
	return args[0]
}
func _FN8_(args []HCObj, tok *Token) HCObj {

	return args[len(args)-1]
}

var FunctionMaps = []ReduceFunction{
	_FN0_,
	_FN1_,
	_FN4_,
	_FN5_,
	_FN2_,
	_FN3_,
	_FN8_,
	_FN8_,
	_FN6_,
	_FN7_,
	_FN6_,
	_FN6_,
	_FN6_,
	_FN7_,
	_FN7_,
	_FN7_,
}
