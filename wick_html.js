let fn = {}; const 
/************** Maps **************/

    /* Symbols To Inject into the Lexer */
    symbols = ["</","((","))",")(","\"","'"],

    /* Goto lookup maps */
    gt0 = [0,-1,1,2],
gt1 = [0,-10,4],
gt2 = [0,-4,6,7,8],
gt3 = [0,-5,14,8],
gt4 = [0,-2,19,18,-7,20,21,22],
gt5 = [0,-7,28,-6,32,34,33],
gt6 = [0,-2,40,-8,39,21,22],
gt7 = [0,-13,41],
gt8 = [0,-8,42,44,-4,43,34,33],
gt9 = [0,-8,48,44],
gt10 = [0,-17,49],
gt11 = [0,-10,56],
gt12 = [0,-9,58],
gt13 = [0,-17,63],
gt14 = [0,-17,65],

    // State action lookup maps
    sm0=[0,-4,0,-4,0,-4,1],
sm1=[0,2,-3,0,-4,0],
sm2=[0,3,-3,0,-4,0],
sm3=[0,-2,4,-1,0,-4,0],
sm4=[0,-2,5,-1,0,-4,0,-5,6,-1,6,-1,7,-1,8],
sm5=[0,-2,9,-1,0,-4,0,-5,9,-1,9,-1,9,-1,9],
sm6=[0,-2,5,-1,0,-4,0,-5,10,-1,11,-1,7,-1,8],
sm7=[0,-2,12,-1,0,-4,0,-5,12,-1,12,-1,12,-1,12],
sm8=[0,-2,13,-1,0,-4,0,-5,13,-1,13,14,13,-1,13],
sm9=[0,-2,15,-1,0,-4,0],
sm10=[0,-2,16,-1,0,-4,0],
sm11=[0,-2,17,-1,0,-4,0,-5,17,-1,17,17,17,-1,17],
sm12=[0,-2,18,-1,19,-4,20,-3,21,1,-1,22],
sm13=[0,-4,0,-4,0,-5,23],
sm14=[0,-2,24,-1,0,-4,0,-5,24,-1,24,-1,24,-1,24],
sm15=[0,-2,25,-1,0,-4,0,-9,26,-1,27,-3,28],
sm16=[0,-4,0,-4,0,-9,29],
sm17=[0,-4,0,-4,0,-11,30],
sm18=[0,-2,18,-1,19,-4,20,-3,21,1,-1,31],
sm19=[0,-2,32,-1,32,-4,32,-3,32,32,-1,32],
sm20=[0,-2,18,-1,19,-4,20,-3,21,33,-1,33],
sm21=[0,-2,34,-1,34,-4,34,-3,34,34,-1,34],
sm22=[0,-2,35,-1,35,-4,35,-3,35,35,-1,35],
sm23=[0,36,-1,36,-1,36,-4,36,-3,36,36,-1,36],
sm24=[0,-2,37,-1,0,-4,0,-5,37,-1,37,-1,37,-1,37],
sm25=[0,-2,38,-1,39,-4,0,-3,40,-11,28],
sm26=[0,-2,38,-1,39,-4,0,-3,40],
sm27=[0,-2,41,-1,0,-4,0,-5,41,-1,41,-1,41,-1,41],
sm28=[0,-2,42,-1,0,-4,0,-5,42,-1,42,-1,42,-1,42],
sm29=[0,-2,43,-1,44,-2,45,46,47,-3,48],
sm30=[0,-2,49,-1,0,-4,0,-5,49,-1,49,49,49,-1,49],
sm31=[0,-2,50,-1,50,-4,50,-3,50,50,-1,50],
sm32=[0,-2,51,-1,51,-4,51,-3,51,51,-1,51],
sm33=[0,-2,38,-1,39,-4,0,-3,40,-7,52],
sm34=[0,-4,0,-4,0,-11,53],
sm35=[0,-2,54,-1,54,-4,0,-3,54,-5,54,-1,54],
sm36=[0,-2,55,-1,55,-4,0,-3,55,-5,55,-1,55],
sm37=[0,-2,38,-1,39,-4,0,-3,40,-5,56],
sm38=[0,-2,43,-1,44,-2,45,46,47,-3,48,-12,57,58],
sm39=[0,-2,59,-1,59,-2,59,59,59,-3,59,-12,59,59],
sm40=[0,-4,0,-4,0,-5,60],
sm41=[0,-2,61,-1,0,-4,0,-5,61,-1,61,-1,61,-1,61],
sm42=[0,-2,62,-1,62,-4,0,-3,62,-5,62,-1,62],
sm43=[0,-2,63,-1,0,-4,0,-5,63,-1,63,-1,63,-1,63],
sm44=[0,-2,43,-1,44,-2,45,46,47,-3,48,-12,64,64],
sm45=[0,65,-1,65,-1,65,-4,65,-3,65,65,-1,65],
sm46=[0,-2,43,-1,44,-2,45,46,47,-3,48,-12,66],
sm47=[0,-2,67,-1,0,-4,0,-5,67,-1,67,-1,67,-1,67],

    // Symbol Lookup map
    lu = new Map([[1,1],[2,2],[4,3],[8,4],[16,5],[32,6],[64,7],[128,8],[256,9],[512,10],[3,11],[264,11],["any",13],["<",14],[">",15],["</",16],["/",17],["=",18],["'",19],[null,7],["\"",21],["((",25],["))",26],[")(",27]]),

    //Reverse Symbol Lookup map
    rlu = new Map([[1,1],[2,2],[3,4],[4,8],[5,16],[6,32],[7,64],[8,128],[9,256],[10,512],[11,3],[11,264],[13,"any"],[14,"<"],[15,">"],[16,"</"],[17,"/"],[18,"="],[19,"'"],[7,null],[21,"\""],[25,"(("],[26,"))"],[27,")("]]),

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
sm14,
sm15,
sm16,
sm17,
sm18,
sm19,
sm19,
sm20,
sm21,
sm22,
sm22,
sm22,
sm22,
sm23,
sm24,
sm25,
sm26,
sm27,
sm27,
sm28,
sm28,
sm29,
sm30,
sm30,
sm3,
sm31,
sm31,
sm32,
sm33,
sm34,
sm35,
sm36,
sm36,
sm36,
sm37,
sm38,
sm39,
sm39,
sm39,
sm39,
sm39,
sm39,
sm40,
sm41,
sm42,
sm41,
sm41,
sm29,
sm43,
sm44,
sm45,
sm46,
sm47],

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
e,
e],

    //Empty Function
    nf = ()=>-1, 

    //Environment Functions
    
redv = (ret, fn, plen, ln, t, e, o, l, s) => {        ln = max(o.length - plen, 0);        o[ln] = fn(o.slice(-plen), e, l, s);        o.length = ln + 1;        return ret;    },
rednv = (ret, Fn, plen, ln, t, e, o, l, s) => {        ln = max(o.length - plen, 0);        o[ln] = new Fn(o.slice(-plen), e, l, s);        o.length = ln + 1;        return ret;    },
redn = (ret, t, e, o) => (o.push(null), ret),
shftf = (ret, fn, t, e, o, l, s) => (fn(o, e, l, s), ret),
C0_TAG=function (sym,env,lex,state) {this.tagname = sym[1];this.attr = sym[2];this.children = sym[4] || [];this.parent = null;this.children.forEach(e=>e.parent=this);},
C1_TAG=function (sym,env,lex,state) {this.tagname = sym[1];this.attr = sym[2];this.children = [];this.parent = null;},
R0_TAG_BODY=function (sym,env,lex,state) {return sym[0].push(sym[1]), sym[0]},
R1_TAG_BODY=function (sym,env,lex,state) {return [sym[0]]},
C0_ATTRIBUTE=function (sym,env,lex,state) {this.id = sym[0]; this.val = sym[2]},
C1_ATTRIBUTE=function (sym,env,lex,state) {this.id = sym[0]; this.val = true},
R0_ATTRIBUTE_HEAD=function (sym,env,lex,state) {return sym[1]},
R0_ATTRIBUTE_DATA=function (sym,env,lex,state) {return sym[0] + ""},
R1_ATTRIBUTE_DATA=function (sym,env,lex,state) {return sym[0] + sym[1]},
C0_TEXT_NODE=function (sym,env,lex,state) {this.val = sym[0];this.parent = null;},
C0_BASIC_BINDING=function (sym,env,lex,state) {this.lex = lex.copy(); this.lex.sl = lex.off-2; this.lex.off = env.start; console.log(this.lex.slice())},
I1_BASIC_BINDING=function (sym,env,lex,state) {env.start = lex.off+2},
C0_CALL_BINDING=function (sym,env,lex,state) {},
R0_BINDING_DATA=function (sym,env,lex,state) {return null},

    //Sparse Map Lookup
    lsm = (index, map) => {    if (map[0] == 0xFFFFFFFF) return map[index+1];    for (let i = 1, ind = 0, l = map.length, n = 0; i < l && ind <= index; i++) {        if (ind !== index) {            if ((n = map[i]) > -1) ind++;            else ind += -n;        } else return map[i];    }    return -1;},

    //State Action Functions
    state_funct = [()=>(14),
()=>(5),
()=>(1031),
()=>(22),
()=>(46),
(...v)=>((redn(4099,...v))),
()=>(38),
()=>(42),
()=>(10247),
()=>(50),
()=>(54),
(...v)=>(redv(4103,R1_TAG_BODY,1,0,...v)),
(...v)=>(rednv(5127,C1_ATTRIBUTE,1,0,...v)),
()=>(62),
()=>(66),
()=>(70),
()=>(6151),
()=>(94),
()=>(102),
()=>(106),
()=>(98),
(...v)=>((redn(3075,...v))),
()=>(110),
(...v)=>(redv(4107,R0_TAG_BODY,2,0,...v)),
()=>(126),
()=>(122),
()=>(118),
(...v)=>(shftf(142,I1_BASIC_BINDING,...v)),
()=>(146),
()=>(150),
()=>(154),
(...v)=>(redv(3079,R1_TAG_BODY,1,0,...v)),
(...v)=>(rednv(11271,C0_TEXT_NODE,1,0,...v)),
(...v)=>(redv(12295,R0_ATTRIBUTE_DATA,1,0,...v)),
()=>(13319),
(...v)=>(rednv(2071,C1_TAG,5,0,...v)),
(...v)=>(rednv(5135,C0_ATTRIBUTE,3,0,...v)),
()=>(182),
()=>(186),
()=>(190),
()=>(7175),
()=>(14343),
()=>(202),
()=>(206),
()=>(218),
()=>(214),
()=>(210),
()=>(222),
(...v)=>(redv(6159,R0_ATTRIBUTE_HEAD,3,0,...v)),
(...v)=>(redv(3083,R0_TAG_BODY,2,0,...v)),
(...v)=>(redv(12299,R1_ATTRIBUTE_DATA,2,0,...v)),
()=>(230),
()=>(238),
(...v)=>(redv(8199,R0_ATTRIBUTE_DATA,1,0,...v)),
()=>(9223),
()=>(242),
()=>(250),
()=>(246),
()=>(17415),
()=>(258),
(...v)=>(redv(7183,R0_ATTRIBUTE_HEAD,3,0,...v)),
(...v)=>(redv(8203,R1_ATTRIBUTE_DATA,2,0,...v)),
(...v)=>(rednv(15375,C0_BASIC_BINDING,3,0,...v)),
(...v)=>(redv(17419,R0_BINDING_DATA,2,0,...v)),
(...v)=>(rednv(2083,C0_TAG,8,0,...v)),
()=>(266),
(...v)=>(rednv(16407,C0_CALL_BINDING,5,0,...v))],

    //Goto Lookup Functions
    goto = [v=>lsm(v,gt0),
nf,
nf,
v=>lsm(v,gt1),
v=>lsm(v,gt2),
nf,
v=>lsm(v,gt3),
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt4),
nf,
nf,
v=>lsm(v,gt5),
nf,
nf,
v=>lsm(v,gt6),
nf,
nf,
v=>lsm(v,gt7),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt8),
v=>lsm(v,gt9),
nf,
nf,
nf,
nf,
v=>lsm(v,gt10),
nf,
nf,
v=>lsm(v,gt11),
nf,
nf,
nf,
v=>lsm(v,gt12),
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt12),
v=>lsm(v,gt13),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt14),
nf,
v=>lsm(v,gt13),
nf,
v=>lsm(v,gt13),
nf];

function getToken(l, SYM_LU) {
    if (l.END) return 0; /*7*/

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

                const recovery_token = eh[ss[sp]](tk, e, o, l, p, ss[sp]);

                if (RECOVERING > 0 && typeof(recovery_token) == "string") {
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
}; const wick_html = parser;