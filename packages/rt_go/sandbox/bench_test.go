package main

import (
	hc_completer "candlelib/hc_completer"
	hc_recognizer "candlelib/hc_recognizer"
	"testing"
)

func BenchmarkIterator(o *testing.B) {

	input := []uint8("<> Dogs func Cats <> Mangos func Chess func Birds ")

	for i := 0; i < o.N; i++ {

		hc_recognizer.Init()

		valid, invalid := hc_recognizer.Run(&instructions, &input, 67109018)

		root, _ := hc_completer.Complete(
			&input,
			valid,
			invalid,
			FunctionMaps,
		)

		hc_recognizer.Clear(valid, invalid)

		r, ok := root.(hc_completer.HCNode)

		if ok {
			hc_completer.IterateHCObj(r, func(node hc_completer.HCNode, par hc_completer.HCNode) {

				//fmt.Println(node.String())
			})
		}

	}
}
