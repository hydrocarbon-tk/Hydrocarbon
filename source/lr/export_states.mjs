function ExportStates(states){
	let output = "";

	states.forEach((s, i)=>{
		output += JSON.stringify({name:i,body:s.body,b:s.b, gt: [...s.goto.entries()], act: [...s.map.entries()]}) + "\n";
	})

	console.log(output)

}
