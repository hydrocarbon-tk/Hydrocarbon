const e = (tk,r,o,l,s)=>{throw new SyntaxError(l.errorMessage(`unexpected token ${tk !== "$" ? tk[0] == "θ" || tk[0] == "τ" ? l.tx : tk : "EOF"} on input ${s} `))}, nf = ()=>-1, 
symbols = [],
goto = [(v,r = gt0[v]) => (r >= 0 ? r : -1),
nf,
nf,
(v,r = gt1[v]) => (r >= 0 ? r : -1),
(v,r = gt2[v]) => (r >= 0 ? r : -1),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf],
err = [(v)=>(["$"]).includes(v) ? 1 : 0,
(v)=>(["$"]).includes(v) ? 1 : 0,
(v)=>(["τd","$"]).includes(v) ? 1 : 0,
(v)=>(["τa","τd","τc"]).includes(v) ? 1 : 0,
(v)=>(["τa","τd","τc"]).includes(v) ? 1 : 0,
(v)=>0,
(v)=>0],
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
e,
e,
e,
e],
gt0 = [-1,1,2,3],
gt1 = [-1,-1,8],
gt2 = [-1,-1,-1,-1,11],

sf = [(t, e, o, l, s)=>18,
(t, e, o, l, s)=>22,
(t, e, o, l, s)=>26,
(t, e, o, l, s)=>5,
(t, e, o, l, s)=>30,
(t, e, o, l, s)=>38,
(t, e, o, l, s)=>42,
(t, e, o, l, s)=>3079,
(t, e, o, l, s)=>50,
(t, e, o, l, s)=>2055,
(t, e, o, l, s)=>1035,
(t, e, o, l, s)=>54,
(t, e, o, l, s)=>3083,
(t, e, o, l, s)=>2059,
(t, e, o, l, s)=>2063],
rec = [0,
0,
4,
4,
8,
8,
8,
4,
4,
8,
8,
12,
8,
8],
sm = [new Map([["τa",1],["τd",2],["τc",3],["θws",0xFFFFFFFF],[";",0xFFFFFFFF]]),
new Map([["$",4],["θws",0xFFFFFFFF],[";",0xFFFFFFFF]]),
new Map([["τd",5],["θws",0xFFFFFFFF],[";",0xFFFFFFFF]]),
new Map([["τa",6],["τd",2],["τc",3],["θws",0xFFFFFFFF],[";",0xFFFFFFFF]]),
new Map([["τb",7],["τa",8],["τd",8],["τc",8],["θws",0xFFFFFFFF],[";",0xFFFFFFFF]]),
new Map([["τd",9],["θws",0xFFFFFFFF],[";",0xFFFFFFFF]]),
new Map([["τd",10],["$",10],["θws",0xFFFFFFFF],[";",0xFFFFFFFF]]),
new Map([["$",11],["θws",0xFFFFFFFF],[";",0xFFFFFFFF]]),
new Map([["τb",7],["θws",0xFFFFFFFF],[";",0xFFFFFFFF]]),
new Map([["τd",12],["θws",0xFFFFFFFF],[";",0xFFFFFFFF]]),
new Map([["τa",13],["τd",13],["τc",13],["θws",0xFFFFFFFF],[";",0xFFFFFFFF]]),
new Map([["τd",14],["$",14],["θws",0xFFFFFFFF],[";",0xFFFFFFFF]]),
new Map([["τd",15],["$",15],["θws",0xFFFFFFFF],[";",0xFFFFFFFF]])],
state = [sm[0],
sm[1],
sm[2],
sm[3],
sm[4],
sm[5],
sm[6],
sm[7],
sm[7],
sm[8],
sm[9],
sm[10],
sm[11],
sm[12]],
re = new Set(["d","a","b","c"]),
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