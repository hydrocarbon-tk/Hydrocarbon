const e = (tk,r,o,l,s)=>{throw new SyntaxError(l.errorMessage(`unexpected token ${tk !== "$" ? tk[0] == "θ" || tk[0] == "τ" ? l.tx : tk : "EOF"} on production ${s} `))}, nf = ()=>-1, 
symbols = [],
goto = [(v,r = gt0[v]) => (r >= 0 ? r : -1),
nf,
nf,
nf,
(v,r = gt1[v]) => (r >= 0 ? r : -1),
nf,
(v,r = gt2[v]) => (r >= 0 ? r : -1),
nf,
nf,
nf],
err = [(v)=>(["$"]).includes(v) ? 1 : 0,
(v)=>(["$"]).includes(v) ? 1 : 0,
(v)=>(["=","$"]).includes(v) ? 1 : 0,
(v)=>(["$","="]).includes(v) ? 1 : 0],
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
gt0 = [-1,1,2,3],
gt1 = [-1,-1,8,7],
gt2 = [-1,-1,8,9],

sf = [(t, e, o, l, s)=>18,
(t, e, o, l, s)=>22,
(t, e, o, l, s)=>7,
(t, e, o, l, s)=>26,
(t, e, o, l, s)=>3079,
(t, e, o, l, s)=>1031,
(t, e, o, l, s)=>2055,
(t, e, o, l, s)=>2059,
(t, e, o, l, s)=>1039],
rec = [0,
0,
4,
4,
8,
8,
4,
8,
12,
4],
sm = [new Map([["*",1],["τid",2]]),
new Map([["$",3]]),
new Map([["=",4],["$",5]]),
new Map([["$",6]]),
new Map([["=",7],["$",7]]),
new Map([["=",8],["$",8]]),
new Map([["=",5],["$",5]]),
new Map([["$",9]])],
state = [sm[0],
sm[1],
sm[2],
sm[3],
sm[0],
sm[4],
sm[0],
sm[5],
sm[6],
sm[7]],
re = new Set(["id"]),
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
        case types.space:
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

        console.log(state[ss[sp]], tk, ss[sp], ss)

        if(fn > 0){
            r = sf[fn-1](tk, e, o, l, ss[sp-1]);
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
                o.push((tk[0] == "θ") ? l.tx : tk); ss.push(off, r >> 2); sp+=2; l.next(); off = l.off; tk = getToken(l, re); 
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
    }
    return o[0];
}; const test2 = parser;