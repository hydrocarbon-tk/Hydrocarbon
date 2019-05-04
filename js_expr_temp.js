const e = (tk, env, output, lex, prv_lex) => {            /*USED for ASI*/            if (env.ASI) {                let ENCOUNTERED_NL = false;                while (!prv_lex.END && prv_lex.off < lex.off) {                    prv_lex.next();                    if (prv_lex.ty == prv_lex.types.ws)                        ENCOUNTERED_NL = true;                }            if (ENCOUNTERED_NL)                return ";";            }            return null;        }, nf = ()=>-1, call_expr=function(sym) { this.name = sym[0];            this.args = sym[1] },
member_expr=function(sym) { this.name = sym[0];            this.expr = sym[2] },
class_stmt=function(sym) { this.name = sym[1], this.tail = sym[2] },
class_tail=function(sym) { this.heritage = sym[0];            this.body = sym[2] },
block_stmt=function(sym) { this.stmts = sym[0] },
debugger_stmt=function(sym) { this.DEBUGGER = true },
lex_stmt=function(sym) { this.type = sym[0];            this.declarations = sym[1] },
var_stmt=function(sym) { this.declarations = sym[1] },
lex_declaration=function(v) { this.id = v.id;            this.expr = v.init },
var_declaration=function(v) { this.id = v.id;            this.expr = v.init },
numeric_literal=function(sym) { this.val = parseFloat(sym);            this.type = "num" },
bool_literal=function(sym) { this.val = sym[0].slice(1) == "true" },
string_literal=function(sym) { this.val = sym[0] },
identifier=function(sym) { this.val = sym[0];            this.type = "id";            env.table[this.val] = undefined },
add_expr=function(sym) { this.left = sym[0];            this.right = sym[2];            this.type = "ADD" },
sub_expr=function(sym) { this.left = sym[0];            this.right = sym[2];            this.type = "SUB" },
mult_expr=function(sym) { this.left = sym[0];            this.right = sym[2];            this.type = "MUL" },
div_expr=function(sym) { this.left = sym[0];            this.right = sym[2];            this.type = "DIV" },
mod_expr=function(sym) { this.left = sym[0];            this.right = sym[2];            this.type = "MOD" },
pre_inc_expr=function(sym) { this.expr = sym[1];            this.type = "PRE INCR" },
pre_dec_expr=function(sym) { this.expr = sym[1];            this.type = "PRE DEC" },
post_inc_expr=function(sym) { this.expr = sym[1];            this.type = "POST INCR" },
post_dec_expr=function(sym) { this.expr = sym[1];            this.type = "POST DEC" },
condition_expr=function(sym) { this.condition = sym[0];            this.left = sym[2];            this.right = sym[4] },
assignment_expr=function(sym) { this.assignee = sym[0];            this.op = sym[1];            this.expr = sym[2];            console.log(env.table) },
defaultError=(tk, env, output, lex, prv_lex) => {            /*USED for ASI*/            if (env.ASI) {                let ENCOUNTERED_NL = false;                while (!prv_lex.END && prv_lex.off < lex.off) {                    prv_lex.next();                    if (prv_lex.ty == prv_lex.types.ws)                        ENCOUNTERED_NL = true;                }            if (ENCOUNTERED_NL)                return ";";            }            return null;        },
f2_1=function (sym,env,lex,state) {env.ASI = false;},
f2_4=function (sym,env,lex,state) {env.ASI = true;},
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
"&=",
"|="],
goto = [(v,r = gt0[v]) => (r >= 0 ? r : -1),
nf,
(v,r = gt1[v]) => (r >= 0 ? r : -1),
nf,
nf,
nf,
nf,
nf,
nf,
nf],
err = [(v)=>(["$"]).includes(v) ? 1 : 0,
(v)=>(["$"]).includes(v) ? 1 : 0,
(v)=>(["τt"]).includes(v) ? 1 : 0],
eh = [e,
e,
e,
e,
e,
e,
e,
e,
e,
e],
gt0 = [-1,1],
gt1 = [-1,-1,3],

sf = [(t, e, o, l, s)=>10,
(t, e, o, l, s)=>5,
(t, e, o, l, s)=>{f2_1(o,e,l,s); return 18},
(t, e, o, l, s)=>22,
(t, e, o, l, s)=>26,
(t, e, o, l, s)=>30,
(t, e, o, l, s)=>34,
(t, e, o, l, s)=>1043,
(t, e, o, l, s)=>{f2_4(o,e,l,s); return 38},
(t, e, o, l, s)=>2067],
rec = [0,
0,
4,
4,
8,
4,
8,
4,
8,
8],
sm = [new Map([["τm",1],["θws",0xFFFFFFFF],["θnl",0xFFFFFFFF]]),
new Map([["$",2],["θws",0xFFFFFFFF],["θnl",0xFFFFFFFF]]),
new Map([["(",3],["θws",0xFFFFFFFF],["θnl",0xFFFFFFFF]]),
new Map([["τt",4],["θws",0xFFFFFFFF],["θnl",0xFFFFFFFF]]),
new Map([[";",5],["θws",0xFFFFFFFF],["θnl",0xFFFFFFFF]]),
new Map([[";",6],["θws",0xFFFFFFFF],["θnl",0xFFFFFFFF]]),
new Map([[";",7],["θws",0xFFFFFFFF],["θnl",0xFFFFFFFF]]),
new Map([["$",8],["θws",0xFFFFFFFF],["θnl",0xFFFFFFFF]]),
new Map([[")",9],["θws",0xFFFFFFFF],["θnl",0xFFFFFFFF]]),
new Map([["τt",10],["θws",0xFFFFFFFF],["θnl",0xFFFFFFFF]])],
state = [sm[0],
sm[1],
sm[2],
sm[3],
sm[4],
sm[5],
sm[6],
sm[7],
sm[8],
sm[9]],
re = new Set(["m","t"]),
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

    const o = [], ss = [0,0];
    
    let time = 10000, RECOVERING = false,
        tk = getToken(l, re), p = l.copy(), sp = 1, len = 0, off= 0;
    
    outer:

    while(time-- > 0){
        
        let fn = state[ss[sp]].get(tk) || 0, r, st = 0, gt = -1, c = 0;

        if(fn == 0xFFFFFFFF){
            //Ignore the token
            l.next();
            tk = getToken(l, re, state[ss[sp]]);
            continue;
        }

        if(fn > 0){
            r = sf[fn-1](tk, e, o, l, ss[sp-1]);
        } else {
            //Error Encountered 
            r = re[ss[sp]];
            
            const recovery_token = eh[ss[sp]](tk, e, o, l, p, ss[sp]);
            
            if(!RECOVERING && typeof(recovery_token) == "string"){
                RECOVERING = true; // To prevent infinite recursion
                tk = recovery_token;
                //reset current token
                l.tl = 0;
                continue;
            }
        }

        st = r >> 2;

        switch(r & 3){
            case 0: // ERROR
                
                if(tk == "$")
                    l.throw("Unexpected end of input");

                l.throw(`Unexpected token [${RECOVERING ? l.next().tx : l.tx}]`); 

                return [null];

            case 1: // ACCEPT
                break outer;

            case 2: //SHIFT
                o.push((tk[0] == "θ") ? l.tx : tk); 
                ss.push(off, r >> 2); 
                sp+=2; 
                p.sync(l);
                l.next(); 
                off = l.off; 
                tk = getToken(l, re, state[ss[sp]]); 
                
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

        RECOVERING = false;
    }
    return o[0];
}; const js_expr_temp = parser;