/** Compiles a stand alone JS parser from a LR rules table and env object **/
import { LRParser } from "./parser.mjs";

export function LRParserCompiler(rule_table, env){
	let output = "";
	if(rule_table.type !== "lr") throw new Error("");

	const 	states = rule_table,
			grammar = rule_table.grammar,
			bodies = rule_table.bodies,
			state_functions = [],
			goto_functions = [];

	for(let i = 0; i < states.length; i++){
		let state = states[i];
		let actions = [];
		

		state.action.forEach((v,k)=>{
			let str = `case "${k}":`;
			let length = v.size;
			let body = states.bodies[v.body];

					
			switch(v.name){
				case "REDUCE":
					if(body.node)
						str += `o[o.length-${length-1}](new ${body.node.name}(o.slice(${length}),e,l));o.length-=${length};`
					if(body.sr[v.len])
						str += `${body.sr[v.len].name}(o,e,l);`;
					str += `r= ${ 3 | (length << 2)};`
				break;
				case "SHIFT":
					if(body.sr[v.len])
						str += `${body.sr[v.len].name}(o,e,l);`;
					str += `r= ${ 2 | (k.state << 2)};`
				break;
				case "ACCEPT":
					if(body.node)
						str += `o[o.length-${length-1}](new ${body.node.name}(o.slice(${length}),e,l));o.length-=${length};`
					if(body.sr[v.len])
						str += `${body.sr[v.len].name}(o,e,l);`;
					str += `r= ${ 1 | (length << 2)};`
				break;
			}

			actions.push(str);
		})

		let goto = [];
		state.goto.forEach((v,k)=>{
			goto.push(`case ${k}: return ${v};`)
		})

		goto_functions.push((goto.length > 0) ? `function (id) {switch(v){${goto.join("")}}}` : `()=>{return -1}`);
		state_functions.push(`function (t, e, o, l, r=0){switch(t){${actions.join("")}default:this.throw();} return r;}`)

	}

	let functions = [];
	
	if(env.functions){
		for(let n in env.functions){
			let funct = env.functions[n];
			functions.push(`${n}=${funct.toString().replace(/[\n\t]/g,"")})`;
		}
	}

	for(let i = 0; i < bodies.length; i++){
		let body = bodies[i];
	}

	output +=`
	const ${functions.length > 0 ? functions.join(",\n") +",": "" }
	state	= [${state_functions.join(",\n")}],
	goto = [${goto_functions.join(",\n")}];
	export default function(input, data){
		let token = getToken(lex);
		outer:
		while(true){
			let r = state[ss[sp]](token, env, object_stack, lexer);
			switch(r & 3){
				case 0: // Error
					throw new Error("An Error Has occured");
				case 1: // Accept
					break outer;
				case 2: // SHIFT
					ss.push((r & 0x12) >> 2); sp++; lex.next(); token = getToken(lex);
				case 3: // REDUCE
					let len = (r & 0x3FC) >> 2;
					sp -= len; goto[ss[sp]](r >> 10); 
			}	
		}
	}
	`

	debugger
}