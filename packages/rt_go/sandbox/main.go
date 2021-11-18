package main

import (
	hc_completer "candlelib/hc_completer"
	hc_kernel "candlelib/hc_recognizer"
	hc_recognizer "candlelib/hc_recognizer"
	"log"
	"time"
)

func main() {

	input := []uint8("<> Dogs func Cats <> Mangos func Chess func Birds ")

	hc_kernel.Init()

	start := time.Now()
	for i := 0; i < 1; i++ {

		valid, invalid := hc_kernel.Run(&instructions, &input, 67109018)

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

				log.Println(node.String())
			})
		}
	}
	elapsed := time.Since(start)
	log.Printf("Parse took %s", elapsed)
}
