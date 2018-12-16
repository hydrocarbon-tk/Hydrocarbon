/** Compiles a stand alone JS parser from a LR rules table and env object **/
import whind  from "/node_modules/@candlefw/whind/source/whind.mjs";
import { getToken, types, FOLLOW } from "../common.mjs";


export function LRParserCompiler(rule_table, env){
	let output = "";
	if(rule_table.type !== "lr") throw new Error("");

	const 	states = rule_table,
			grammar = rule_table.grammar,
			bodies = rule_table.bodies,
			state_functions = [],
			goto_functions = [];

	//Construct all non existing follows for use with error recovery.
    FOLLOW(grammar, 0);

    let errors = [];
    let error_handlers = [];

    for(let i = 0; i < grammar.length; i++){
    	let production = grammar[i];
    	let matches = [];

    	if(production.error){
			error_handlers.push(production.error.toString().replace(/(anonymous)?[\n\t]*/g,""));
			production.error.id = error_handlers.length - 1;
		}
		
    	production.follow.forEach((v)=>{
    		matches.push(`case "${v}":`);
    	});

    	errors.push(`(v)=>{switch(v){${matches.join("")} return 1;} return 0;}`);
    }

	for(let i = 0; i < states.length; i++){
		let state = states[i];
		let actions = [];
		let err = "";
		let production = grammar[bodies[state.body].production];

		if(production.error)
			err = `eh[${production.error.id}](o,e,l,s);`;

		
		state.action.forEach((v,k,i)=>{
			let str = `case "${k}":`;
			let length = v.size;
			let body = states.bodies[v.body];
			
			switch(v.name){
				case "REDUCE":
					if(body.node)
						str += `o[o.length-${length}]=(new ${body.node.name}(o.slice(${-length}),e,l,s));o.length-=${length-1};`;
					if(body.sr[v.len])
						str += `${body.sr[v.len].name}(o,e,l,s);`;
					str += `r= ${ 3 | (length << 2) | (v.production << 10)};break;`;
				break;
				case "SHIFT":
					if(body.sr[v.len]){
						let name = body.sr[v.len].name;
						if(body.sr[v.len].name == "anonymous"){
							name = `f${body.id}_${v.len}`;
							if(!env.functions[name])
								env.functions[name] = body.sr[v.len];
						}
						str += `${name}(o,e,l,s);`;
					}
					str += `r= ${ 2 | (v.state << 2)};break;`;
				break;
				case "ACCEPT":
					if(body.node)
						str += `o[o.length-${length-1}]=(new ${body.node.name}(o.slice(${length}),e,l));o.length-=${length};`;
					if(body.sr[v.len])
						str += `${body.sr[v.len].name}(o,e,l,s);`;
					str += `r= ${ 1 | (length << 2)};break;`;
				break;
			}

			actions.push(str);
		});

		let goto = [];

		state.goto.forEach((v,k)=>{
			goto.push(`case ${k}: return ${v};`);
		});

		goto_functions.push((goto.length > 0) ? `(v) => {switch(v){${goto.join("")}}; return -1;}` : `nf`);
		state_functions.push(`(t, e, o, l, s, r=0)=>{switch(t){${actions.join("")}default: r = ${state.body << 2}; ${err}} return r;}`);

	}

	let functions = [];
	
	if(env.functions){
		for(let n in env.functions){
			let funct = env.functions[n];
			functions.push(`${n}=${funct.toString().replace(/(anonymous)?[\n\t]*/g,"")}`);
		}
	}

	output +=`
	const nf = ()=>-1, ${functions.length > 0 ? functions.join(",\n") +",": "" }
	state	= [${state_functions.join(",\n")}],
	goto = [${goto_functions.join(",\n")}],
	err = [${errors.join(",\n")}],
	eh = [${error_handlers.join(",\n")}],
	re = new Set(${[...grammar.reserved]}),
	throw_ = ()=>{debugger},
	types = ${JSON.stringify(types)};
	${getToken.toString().replace(/[\n\t]/g,"")}
	 function parser(l, e = {}){
		let tk = getToken(l, re), sp = 1, len = 0, off= 0;
		const o = [], ss = [0,0];
		let time = 100;
		outer:
		while(time-- > 0){
			let r = state[ss[sp]](tk, e, o, l, ss[sp-1]);
			switch(r & 3){
				case 0:
				debugger
					let st = r >> 2;
					let gt = -1, c = 0;
					while(sp > -1){
						if((gt = goto[ss[sp]](st)) >= 0)
							break;
						sp-=2;
						c++;
					}

					if(gt >= 0){
						ss.length = sp+1;
						ss.push(off, gt);
						sp+=2;

						//o.length -= c;

						while(!err[st](tk) && !l.END)
							tk = getToken(l.next());

						break;
					}else
						l.throw("Unrecoverable error encountered")
					
				case 1:
					break outer;
				case 2:
					o.push((tk[0] == "θ") ? l.tx : tk); ss.push(off, r >> 2); sp+=2; l.next(); off = l.off; tk = getToken(l, re); break;
				case 3:
					len = (r & 0x3FC) >> 1;
					ss.length -= len;
					sp -= len; ss.push(off, goto[ss[sp]](r >> 10)); sp+=2; break;
			}	
		}

		return o[0];
	}`;

	return output//==.replace(/[\n\t]/g,"");
}