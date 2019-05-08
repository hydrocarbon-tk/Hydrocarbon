export function ExportStates(states){
	let out=  states.slice().map((s, i)=> JSON.stringify({name:i,body:s.body,b:s.b, gt: [...s.goto.entries()], act: [...s.action.entries()]}) ).join("\n");
	return out;
}

export function ImportStates(states_string){
	const states = (states_string.split(/\n/g).map(JSON.parse).map(e=>{ 
		return {
			id:e.name,
			body:e.body,
			b:e.b,
			goto:new Map(e.gt),
			action:new Map(e.act)
		}
	}))

	states.type ="lr";
	return states
}
