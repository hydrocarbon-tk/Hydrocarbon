import { Grammar } from "../types/grammar.js";

export function CONSTRUCT_LL1_PARSETABLE(grammer:Grammar){
	
	let first = CONSTRUCT_FIRST(grammer);

	let follow = CONSTRUCT_FOLLOW(grammer, first);

	let table = new Map();
	table.type = "ll";

	for(let i = 0; i < grammer.length; i++){
		let production = grammer[i];

		let t_map = new Map();

		table.set(production.name, t_map);

		let f = first.get(production);
		let fol = follow.get(production);

		f.forEach((v,k)=>{
			if(k !== "ɛ")
				t_map.set(k, production.bodies[v]);
		});

		if(f.has("ɛ")){
			fol.forEach((v,k)=>{
				if(k !== "ɛ")
					t_map.set(k, production.bodies[v]);
			});

			if(fol.has("$")){
				t_map.set("$", production.bodies[production.bodies.length-1]);
			}
		}
	}

	return table;
}