
import whind from "../../node_modules/@candlefw/whind/source/whind.mjs";

export function LLParser(input, table, grammer){
	
	let stack = ["$", grammer[0].name];
	let lex = whind(input); 
		
		let ip = 1;
	while(stack[ip] != "$"){
		let r = stack[ip];
		
		let {bool, terminal} = compare(lex, r);
		
		if(bool){
			lex.next();
			stack.pop();
			ip--;
		}else if(terminal){
			lex.throw("expecting terminal")
		}else if(!table.get(r).get(getVal(lex))){
			lex.throw("expecting non-terminal")
		}else {
			let body = table.get(r).get(getVal(lex));
			
			stack.pop();
			ip--;

			if(body[0] !== "ɛ"){


				for(let i = body.length; i > 0; i--){
					stack.push(body[i-1]);
				}

				ip += body.length;
			}
		}
	}
}