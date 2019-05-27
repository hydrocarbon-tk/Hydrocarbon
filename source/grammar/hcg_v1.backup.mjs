let fn = {}; const 
/************** Maps **************/

    /* Symbols To Inject into the Lexer */
    symbols = [],

    /* Goto lookup maps */
    gt0 = [0,-3,1],
gt1 = [0,-1,4,3,-1,5],
gt2 = [0,-1,10,-2,5],
gt3 = [0,-4,15],

    // State action lookup maps
    sm0=[0,-2,1,-1,0,-4,0],
sm1=[0,2,-3,0,-4,0],
sm2=[0,-2,3,-1,0,-4,0,-5,4,-1,5],
sm3=[0,6,-1,3,-1,0,-4,0,-5,4,-1,7],
sm4=[0,8,-1,8,-1,0,-4,0,-5,8,-1,8],
sm5=[0,-4,0,-4,0,-4,9],
sm6=[0,10,-1,10,-1,0,-4,0,-4,11,10,-1,10],
sm7=[0,11,-1,11,-1,0,-3,12,0,-4,11,-2,13],
sm8=[0,11,-1,11,-1,0,-3,14,0,-4,11,-2,11],
sm9=[0,15,-3,0,-3,14,0,-4,11],
sm10=[0,16,-1,16,-1,0,-4,0,-5,16,-1,16],
sm11=[0,-2,3,-1,0,-3,17,0,-7,5],
sm12=[0,18,-1,18,-1,0,-3,19,0,-4,18,-2,18],
sm13=[0,18,-1,18,-1,0,-4,0,-4,18,18,-1,18],
sm14=[0,20,-1,20,-1,0,-4,0,-5,20,-1,20],
sm15=[0,11,-1,11,-1,0,-4,0,-5,11,-1,11],
sm16=[0,21,-1,21,-1,0,-4,0,-4,21,21,-1,21],

    // Symbol Lookup map
    lu = new Map([[1,1],[2,2],[4,3],[8,4],[16,5],[32,6],[64,7],[128,8],[256,9],[512,10],[3,11],[264,11],["any",13],["=",14],["sym",15],[null,8],["did",17]]),

    //Reverse Symbol Lookup map
    rlu = new Map([[1,1],[2,2],[3,4],[4,8],[5,16],[6,32],[7,64],[8,128],[9,256],[10,512],[11,3],[11,264],[13,"any"],[14,"="],[15,"sym"],[8,null],[17,"did"]]),

    // States 
    state = [sm0,
sm1,
sm2,
sm3,
sm4,
sm5,
sm6,
sm7,
sm8,
sm9,
sm10,
sm11,
sm12,
sm13,
sm13,
sm14,
sm15,
sm16],

/************ Functions *************/

    max = Math.max,

    //Error Functions
    e = (tk,r,o,l,p)=>{if(l.END)l.throw("Unexpected end of input");else if(l.ty & (264)) l.throw(`Unexpected space character within input "${1}" `) ; else l.throw(`Unexpected token ${l.tx} within input "${111}" `)}, 
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
e,
e,
e,
e,
e],

    //Empty Function
    nf = ()=>-1, 

    //Environment Functions
    
redv = (ret, fn, plen, ln, t, e, o, l, s) => {        ln = max(o.length - plen, 0);        o[ln] = fn(o.slice(-plen), e, l, s, o);        o.length = ln + 1;        return ret;    },
rednv = (ret, Fn, plen, ln, t, e, o, l, s) => {        ln = max(o.length - plen, 0);        o[ln] = new Fn(o.slice(-plen), e, l, s, o);        o.length = ln + 1;        return ret;    },
redn = (ret, t, e, o) => (o.push(null), ret),
shftf = (ret, fn, t, e, o, l, s) => (fn(o, e, l, s), ret),
R0_s0_list=function (sym,env,lex,state) {return sym[0].push(sym[2]),sym[0]},
R1_s0_list=function (sym,env,lex,state) {return [sym[0]]},
C0_s=function (sym,env,lex,state) {this.syms = sym[1]},
R0_R=function (sym,env,lex,state) {return sym},

    //Sparse Map Lookup
    lsm = (index, map) => {    if (map[0] == 0xFFFFFFFF) return map[index+1];    for (let i = 1, ind = 0, l = map.length, n = 0; i < l && ind <= index; i++) {        if (ind !== index) {            if ((n = map[i]) > -1) ind++;            else ind += -n;        } else return map[i];    }    return -1;},

    //State Action Functions
    state_funct = [()=>(10),
()=>(5),
()=>(30),
()=>(26),
()=>(34),
(...v)=>(rednv(3083,C0_s,2,0,...v)),
()=>(38),
(...v)=>(redv(2055,R1_s0_list,1,0,...v)),
()=>(46),
(...v)=>(rednv(1031,fn.,1,0,...v)),
(...v)=>(redv(4103,R0_R,1,0,...v)),
()=>(54),
()=>(50),
()=>(58),
(...v)=>(rednv(3087,C0_s,3,0,...v)),
(...v)=>(redv(2059,R0_s0_list,2,0,...v)),
()=>(66),
(...v)=>(redv(4107,R0_R,2,0,...v)),
()=>(70),
(...v)=>(rednv(1039,fn.,3,0,...v)),
(...v)=>(redv(4111,R0_R,3,0,...v))],

    //Goto Lookup Functions
    goto = [v=>lsm(v,gt0),
nf,
v=>lsm(v,gt1),
v=>lsm(v,gt2),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt3),
nf,
nf,
nf,
nf,
nf,
nf];

function getToken(l, SYM_LU) {
    if (l.END) return 0; /*8*/

    switch (l.ty) {
        case 2:
            if (SYM_LU.has(l.tx)) return SYM_LU.get(l.tx);
            return 2;
        case 1:
            return 1;
        case 4:
            return 3;
        case 256:
            return 9;
        case 8:
            return 4;
        case 512:
            return 10;
        default:
            return SYM_LU.get(l.tx) || SYM_LU.get(l.ty);
    }
}

/************ Parser *************/

function parser(l, e = {}) {
    
    fn = e.functions;

    l.IWS = false;
    l.PARSE_STRING = true;

    if (symbols.length > 0) {
        symbols.forEach(s => { l.addSymbol(s) });
        l.tl = 0;
        l.next();
    }

    const o = [],
        ss = [0, 0];

    let time = 1000000,
        RECOVERING = 100,
        tk = getToken(l, lu),
        p = l.copy(),
        sp = 1,
        len = 0,
        off = 0;

    outer:

        while (time-- > 0) {

            const fn = lsm(tk, state[ss[sp]]) || 0;

            /*@*/// console.log({end:l.END, state:ss[sp], tx:l.tx, ty:l.ty, tk:tk, rev:rlu.get(tk), s_map:state[ss[sp]], res:lsm(tk, state[ss[sp]])});

            let r,
                gt = -1;

            if (fn == 0) {
                /*Ignore the token*/
                l.next();
                tk = getToken(l, lu);
                continue;
            }

            if (fn > 0) {
                r = state_funct[fn - 1](tk, e, o, l, ss[sp - 1]);
            } else {

                if (RECOVERING > 1 && !l.END) {
                    if (tk !== lu.get(l.ty)) {
                        //console.log("ABLE", rlu.get(tk), l.tx, tk )
                        tk = lu.get(l.ty);
                        continue;
                    }

                    if (tk !== 13) {
                        //console.log("MABLE")
                        tk = 13;
                        RECOVERING = 1;
                        continue;
                    }
                }

                tk = getToken(l, lu);

                const recovery_token = eh[ss[sp]](tk, e, o, l, p, ss[sp], lu);

                if (RECOVERING > 0 && recovery_token) {
                    RECOVERING = -1; /* To prevent infinite recursion */
                    tk = recovery_token;
                    l.tl = 0; /*reset current token */
                    continue;
                }
            }

            switch (r & 3) {
                case 0:
                    /* ERROR */

                    if (tk == "$")
                        l.throw("Unexpected end of input");
                    l.throw(`Unexpected token [${RECOVERING ? l.next().tx : l.tx}]`);
                    return [null];

                case 1:
                    /* ACCEPT */
                    break outer;

                case 2:
                    /*SHIFT */
                    o.push(l.tx);
                    ss.push(off, r >> 2);
                    sp += 2;
                    p.sync(l);
                    l.next();
                    off = l.off;
                    tk = getToken(l, lu);
                    RECOVERING++;
                    break;

                case 3:
                    /* REDUCE */

                    len = (r & 0x3FC) >> 1;

                    ss.length -= len;
                    sp -= len;
                    gt = goto[ss[sp]](r >> 10);

                    if (gt < 0)
                        l.throw("Invalid state reached!");

                    ss.push(off, gt);
                    sp += 2;
                    break;
            }
        }
    console.log(time);
    return o[0];
}; const test2 = parser;
