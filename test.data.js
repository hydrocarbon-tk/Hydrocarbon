const 

/* Maps */

gt0 = [-1,1,2],
gt1 = [-2,5],
gt2 = [-2,6],
sm0=[-4294967295,-13,1,2],
sm1=[-4294967295,3],
sm2=[-4294967295,-13,4,4,4],
sm3=[-4294967295,5],
sm4=[-4294967295,-13,5,5,5],
lu = new Map([[1,1],[2,2],[4,3],[8,4],[16,5],[32,6],[64,7],[128,8],[256,9],[512,10],[3,11],[264,11],["c",13],["d",14]]),
state = [sm0,
sm1,
sm0,
sm0,
sm2,
sm3,
sm4],

/* Functions */

e = (tk,r,o,l,s)=>{throw new SyntaxError(l.errorMessage(`unexpected token ${tk !== "$" ? tk[0] == "θ" || tk[0] == "τ" ? l.tx : tk : "EOF"} on input ${s} `))}, nf = ()=>-1, redv = (ret, funct, production_length, ln, t, e, o, l, s) => {        ln = max(o.length - production_length);        o[ln] = funct(o.slice(production_length), e, l, s);        o.length = ln + 1;        return ret    },
rednv = (ret, funct, production_length, ln, t, e, o, l, s) => {        ln = max(o.length - production_length);        o[ln] = new funct(o.slice(production_length), e, l, s);        o.length = ln + 1;        return ret    },
redn = (ret, t, e, o) => (o.push(null), ret),
shftf = (ret, funct, t, e, o, l, s) => (funct(o, e, l, s), ret),
lsm = (index, map) =>{    if (map[0] > 0xFFFFFFFF) return map[index];    for (let i = 1, ind = 0, l = map.length, n = 0; i < l && ind <= index; i++) {        if (ind !== index) {            if ((n = map[i]) > -1) ind++;            else ind += -n;        } else return map[i];    }    return -1;},
state_funct = [(...v)=>(14),
(...v)=>(18),
(...v)=>(5),
(...v)=>(7),
(...v)=>(11)],
eh = [],
goto = [v=>lsm(v,gt0),
nf,
v=>lsm(v,gt1),
v=>lsm(v,gt2),
nf,
nf,
nf]
;

function getToken(l, SYM_LU) {
    if (l.END) return 0; //"$"

    switch (l.ty) {
        case types.id:
            if (SYM_LU.has(l.tx)) return SYM_LU.get(l.tx);
            return 1; //"θid"
        case types.num:
            return 2; //"θnum"
        case types.string:
            return 3; //"θstr"
        case types.new_line:
            return 4; //"θnl"
        case types.ws:
            return 6; //"θws"
        case types.data_link:
            return 7; //"θdl"
        default:
            return SYM_LU.get(l.tx) || SYM_LU.get(l.ty);
    }
}

 function parser(l, e = {}){
    l.IWS = false;
    /*
    if(symbols.length > 0){
        symbols.forEach(s=> {l.addSymbol(s)});
        l.tl = 0;
        l.next();
    }
    */

    const o = [], ss = [0,0];
    
    let time = 1000000, RECOVERING = 1,
        tk = getToken(l, lu), p = l.copy(), sp = 1, len = 0, off= 0;
    
    outer:

    while(time-- > 0){
        let fn = lsm(tk, state[ss[sp]]) || 0, r, st = 0, gt = -1, c = 0;

        if(fn == 0xFFFFFFFF){
            //Ignore the token
            l.next();
            tk = getToken(l, lu);
            continue;
        }

        if(fn > 0){
            r = state_funct[fn-1](tk, e, o, l, ss[sp-1]);
        } else {

            if(tk !== undefined){
                tk = undefined;
                continue;
            }

            tk = getToken(l, lu);

            //Error Encountered 
            r = re[ss[sp]];
            
            const recovery_token = eh[ss[sp]](tk, e, o, l, p, ss[sp]);
            
            if(RECOVERING > 1 && typeof(recovery_token) == "string"){
                RECOVERING = 0; // To prevent infinite recursion
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
                tk = getToken(l, lu); 
                RECOVERING++;
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
    console.log(time)
    return o[0];
}
