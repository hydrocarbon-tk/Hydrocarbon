package main

import (
	"candlelib/hc_kernel"
	"candlelib/hc_recognizer"
	"log"
	"time"
)

func main() {

	input := []uint8("( two + three )")

	hc_kernel.Init()

	start := time.Now()
	valid, invalid := hc_kernel.Run(&instructions, &input, 67109096)

	root, _ := hc_recognizer.Complete(
		&input,
		valid,
		invalid,
		FunctionMaps,
	)

	elapsed := time.Since(start)

	log.Println(root)

	log.Printf("Parse took %s", elapsed)

	hc_kernel.Clear(valid, invalid)
}
