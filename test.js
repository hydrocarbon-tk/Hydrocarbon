const e = (tk,r,o,l,s)=>{throw new SyntaxError(l.errorMessage(`unexpected token ${tk !== "$" ? tk[0] == "θ" || tk[0] == "τ" ? l.tx : tk : "EOF"} on production ${s} `))}, nf = ()=>-1, 
symbols = [],
goto = [(v,r = gt0[v]) => (r >= 0 ? r : -1),
nf,
(v,r = gt1[v]) => (r >= 0 ? r : -1),
nf,
(v,r = gt2[v]) => (r >= 0 ? r : -1),
nf,
nf,
nf,
nf,
nf,
nf],
err = [(v)=>(["$"]).includes(v) ? 1 : 0,
(v)=>(["$"]).includes(v) ? 1 : 0,
(v)=>(["$"]).includes(v) ? 1 : 0,
(v)=>(["τc","τd","$"]).includes(v) ? 1 : 0,
(v)=>(["$","τc","τd"]).includes(v) ? 1 : 0],
eh = [e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e],
gt0 = [-1,1,3,2,5],
gt1 = [-1,-1,-1,8,5],
gt2 = [-1,-1,-1,9,5],

sf = [(t, e, o, l, s)=>18,
(t, e, o, l, s)=>26,
(t, e, o, l, s)=>5,
(t, e, o, l, s)=>1031,
(t, e, o, l, s)=>3079,
(t, e, o, l, s)=>42,
(t, e, o, l, s)=>2055,
(t, e, o, l, s)=>1035,
(t, e, o, l, s)=>3083,
(t, e, o, l, s)=>4107],
rec = [0,
0,
4,
4,
12,
12,
16,
8,
4,
12,
16],
sm = [new Map([["τc",1],["τd",2],["θws",0xFFFFFFFF]]),
new Map([["$",3],["θws",0xFFFFFFFF]]),
new Map([["$",4],["θws",0xFFFFFFFF]]),
new Map([["τc",5],["τd",5],["$",5],["θws",0xFFFFFFFF]]),
new Map([["τb",6],["θws",0xFFFFFFFF]]),
new Map([["$",7],["θws",0xFFFFFFFF]]),
new Map([["$",8],["θws",0xFFFFFFFF]]),
new Map([["τc",9],["τd",9],["$",9],["θws",0xFFFFFFFF]]),
new Map([["τc",10],["τd",10],["$",10],["θws",0xFFFFFFFF]])],
state = [sm[0],
sm[1],
sm[0],
sm[2],
sm[0],
sm[3],
sm[4],
sm[5],
sm[6],
sm[7],
sm[8]],
re = new Set(["c","d","b"]),
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
    l.IWS = false;

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
}; const test = parser;