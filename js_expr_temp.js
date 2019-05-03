const e = (tk,r,o,l,s)=>{throw new SyntaxError(l.errorMessage(`unexpected token ${tk !== "$" ? tk[0] == "θ" || tk[0] == "τ" ? l.tx : tk : "EOF"} on production ${s} `))}, nf = ()=>-1, call_expr=function(sym){this.identifier = sym[0]; this.args = sym[1]},
member_expr=function(sym){this.identifier = sym[0]; this.expr = sym[2]},
class_stmt=function(sym){this.identifier = sym[1], this.tail= sym[2]},
class_tail=function(sym){this.heritage = sym[0]; this.body = sym[2]},
block_stmt=function(sym){this.stmts = sym[0]},
debugger_stmt=function(sym){this.DEBUGGER = true},
lex_stmt=function(sym){this.type = sym[0]; this.declarations = sym[1]},
var_stmt=function(sym){this.declarations = sym[1]},
lex_declaration=function(v){this.id = v.id; this.expr = v.init},
var_declaration=function(v){this.id = v.id; this.expr = v.init},
numeric_literal=function (sym){this.val = parseFloat(sym); this.type = "num"},
bool_literal=function(sym){this.val = sym[0].slice(1) == "true"},
string_literal=function(sym){this.val = sym[0]},
identifier=function (sym){this.val = sym[0]; this.type = "id"; env.table[this.val] = undefined},
add_expr=function (sym){this.left = sym[0]; this.right=sym[2]; this.type = "ADD"},
sub_expr=function (sym){this.left = sym[0]; this.right=sym[2]; this.type = "SUB"},
mult_expr=function (sym){this.left = sym[0]; this.right=sym[2]; this.type = "MUL"},
div_expr=function (sym){this.left = sym[0]; this.right=sym[2]; this.type = "DIV"},
mod_expr=function (sym){this.left = sym[0]; this.right=sym[2]; this.type = "MOD"},
pre_inc_expr=function (sym){this.expr = sym[1]; this.type = "PRE INCR"},
pre_dec_expr=function (sym){this.expr = sym[1]; this.type = "PRE DEC"},
post_inc_expr=function (sym){this.expr = sym[1]; this.type = "POST INCR"},
post_dec_expr=function (sym){this.expr = sym[1]; this.type = "POST DEC"},
condition_expr=function (sym){this.condition = sym[0]; this.left = sym[2]; this.right = sym[4]},
assignment_expr=function (sym){this.assignee = sym[0]; this.op = sym[1]; this.expr = sym[2]; console.log(env.table)},
symbols = ["<<",
">>>",
">>",
">>>=",
">>=",
"<<=",
"<=",
">=",
"!=",
"!==",
"|=",
"===",
"==",
"**",
"++",
"--",
"**=",
"...",
"||",
"&&",
"=>",
"**",
"++",
"--",
"**=",
"...",
"||",
"&&",
"+=",
"-=",
"/=",
"*=",
"%=",
"&="],
goto = [(v,r = gt0[v]) => (r >= 0 ? r : -1),
nf,
(v,r = gt1[v]) => (r >= 0 ? r : -1),
nf,
nf],
err = [(v)=>(["$"]).includes(v) ? 1 : 0,
(v)=>(["$"]).includes(v) ? 1 : 0,
(v)=>(["$"]).includes(v) ? 1 : 0],
eh = [e,
e,
e,
e,
e],
gt0 = [-1,1],
gt1 = [-1,-1,3],

sf = [(t, e, o, l, s)=>10,
(t, e, o, l, s)=>5,
(t, e, o, l, s)=>18,
(t, e, o, l, s)=>1035,
(t, e, o, l, s)=>2055],
rec = [0,
0,
4,
4,
8],
sm = [new Map([["τmovie",1],["θws",4294967295],["θnl",4294967295]]),
new Map([["$",2],["θws",4294967295],["θnl",4294967295]]),
new Map([["τdanger",3],["θws",4294967295],["θnl",4294967295]]),
new Map([["$",4],["θws",4294967295],["θnl",4294967295]]),
new Map([["$",5],["θws",4294967295],["θnl",4294967295]])],
state = [sm[0],
sm[1],
sm[2],
sm[3],
sm[4]],
re = new Set(["movie","danger"]),
throw_ = ()=>{debugger},
types = {"num":1,"number":1,"id":2,"identifier":2,"str":4,"string":4,"ws":8,"white_space":8,"ob":16,"open_bracket":16,"cb":32,"close_bracket":32,"op":64,"operator":64,"sym":128,"symbol":128,"nl":256,"new_line":256,"dl":512,"data_link":512,"alpha_numeric":3,"white_space_new_line":264};

function getToken(l, reserved) {
    if (l.END) return "$";

    switch (l.ty) {
        case types.id:
            if (reserved.has(l.tx)) return "τ" + l.tx;
            return "θid";
        case types.num:
            return "θnum";
        case types.string:
            return "θstr";
        case types.new_line:
            return "θnl";
        case types.ws:
            return "θws";
        case types.data_link:
            return "θdl";
        default:
            return l.tx;
    }
}

 function parser(l, e = {}){

    if(symbols.length > 0){
        symbols.forEach(s=> {l.addSymbol(s)});
        l.off = 0;
        l.tl = 0;
        l.next();
    }

    let tk = getToken(l, re), sp = 1, len = 0, off= 0;

    const o = [], ss = [0,0];
    let time = 10000;
    outer:
    while(time-- > 0){
        
        let fn = state[ss[sp]].get(tk) || 0, r, st = 0, gt = -1, c = 0;
        
        console.log(fn, tk)
        if(fn == 0xFFFFFFFF){
            //Ignore the token
            l.next();
            tk = getToken(l, re, state[ss[sp]]);
            console.log(tk, "IGNORING")
            //off = l.off;
            continue;
        }

        if(fn > 0){
            r = sf[fn-1](tk, e, o, l, ss[sp-1]);
            console.log("DDMS", r & 3)
        } else {
            //Error Encountered 
            r = re[ss[sp]];
            eh[ss[sp]](tk, e, o, l, ss[sp]);
        }

        st = r >> 2;

        switch(r & 3){
            case 0: // ERROR
                console.log(` Error on input ${tk} `)
                
                if(tk == "$")
                    l.throw("Unexpected EOF");
                
                //pull up error routine for this production
                const ALLOW_RECOVERY = (r>>2) & 0xFF;
                
                if(ALLOW_RECOVERY){
                    
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

                        while(!err[st](tk) && !l.END){
                            tk = getToken(l.next(), re);
                        }
                    }
                    break;
                }
                l.throw("Unrecoverable error encountered here"); 
                break;
            case 1: // ACCEPT
                break outer;
            case 2: //SHIFT
                o.push((tk[0] == "θ") ? l.tx : tk); ss.push(off, r >> 2); sp+=2; l.next(); off = l.off; tk = getToken(l, re, state[ss[sp]]); 
                break;
            case 3: // REDUCE

                len = (r & 0x3FC) >> 1;

                console.log(sp)
                console.log(ss[sp], len, r, tk)

                ss.length -= len;   
                sp -= len; 

                gt = goto[ss[sp]](r >> 10);

                if(gt < 0)
                    l.throw("Invalid state reached!");
                
                ss.push(off, gt); sp+=2; 
                
                break;
        }   
    }
    return o[0];
}; const js_expr_temp = parser;