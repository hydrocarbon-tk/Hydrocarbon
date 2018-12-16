const nf = ()=>-1, final=class {constructor(items, lex, env){this.items = items;}},
f5_0=function (items,env,lex) {console.log("open")},
f5_2=function (items,env,lex) {console.log("close")},
	state	= [(t, e, o, l, r=0)=>{switch(t){case "(":f5_0(o,e,l);r= 2;case "θid":r= 2;default:throw();} return r;},
(t, e, o, l, r=0)=>{switch(t){case "$":o[o.length-0](new final(o.slice(1),e,l));o.length-=1;r= 5;case "+":r= 2;default:throw();} return r;},
(t, e, o, l, r=0)=>{switch(t){case "(":f5_0(o,e,l);r= 2;case "θid":r= 2;default:throw();} return r;},
(t, e, o, l, r=0)=>{switch(t){case "$":o[o.length-2](new final(o.slice(3),e,l));o.length-=3;r= 15;case "+":o[o.length-2](new final(o.slice(3),e,l));o.length-=3;r= 15;case "*":r= 2;case ")":o[o.length-2](new final(o.slice(3),e,l));o.length-=3;r= 15;default:throw();} return r;},
(t, e, o, l, r=0)=>{switch(t){case "(":f5_0(o,e,l);r= 2;case "θid":r= 2;default:throw();} return r;},
(t, e, o, l, r=0)=>{switch(t){case "$":o[o.length-2](new final(o.slice(3),e,l));o.length-=3;r= 15;case "*":o[o.length-2](new final(o.slice(3),e,l));o.length-=3;r= 15;case "+":o[o.length-2](new final(o.slice(3),e,l));o.length-=3;r= 15;case ")":o[o.length-2](new final(o.slice(3),e,l));o.length-=3;r= 15;default:throw();} return r;},
(t, e, o, l, r=0)=>{switch(t){case "(":f5_0(o,e,l);r= 2;case "θid":r= 2;default:throw();} return r;},
(t, e, o, l, r=0)=>{switch(t){case ")":f5_2(o,e,l);r= 2;case "+":r= 2;default:throw();} return r;},
(t, e, o, l, r=0)=>{switch(t){case "$":r= 15;case "*":r= 15;case "+":r= 15;case ")":r= 15;default:throw();} return r;},
(t, e, o, l, r=0)=>{switch(t){case ")":r= 7;case "+":r= 7;case "*":r= 2;case "$":r= 7;default:throw();} return r;},
(t, e, o, l, r=0)=>{switch(t){case "+":r= 7;case "*":r= 7;case ")":r= 7;case "$":r= 7;default:throw();} return r;},
(t, e, o, l, r=0)=>{switch(t){case "*":o[o.length-0](new final(o.slice(1),e,l));o.length-=1;r= 7;case "+":o[o.length-0](new final(o.slice(1),e,l));o.length-=1;r= 7;case ")":o[o.length-0](new final(o.slice(1),e,l));o.length-=1;r= 7;case "$":o[o.length-0](new final(o.slice(1),e,l));o.length-=1;r= 7;default:throw();} return r;}],
	goto = [(id) => {switch(v){case 1: return 1;case 2: return 9;case 3: return 10;}},
nf,
(id) => {switch(v){case 2: return 3;case 3: return 10;}},
nf,
(id) => {switch(v){case 3: return 5;}},
nf,
(id) => {switch(v){case 1: return 7;case 2: return 9;case 3: return 10;}},
nf,
nf,
nf,
nf,
nf],
	reserved = new Set(),
	throw = ()=>{debugger};

	function getToken(l, reserved){
switch(lex.ty){
case types.id:
let tx = lex.tx;
if(reserved.has(tx)) return tx;
return "θid";
case types.num:
return "θnum";
default:
return lex.tx;
}
}
	export default function(lex, env = {}){
		let token = getToken(lex);
		const os = [];
		outer:
		while(true){
			let r = state[ss[sp]](token, env, os, lexer);
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

		return os[0];
	}