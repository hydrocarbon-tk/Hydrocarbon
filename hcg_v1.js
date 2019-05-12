const 

/* Maps */

symbols = ["@SYMBOL","nl","@PREC","num","@IGNORE","@NAME","@EXT","--","→","│","((","EXC","))","ERR","IGN","any","$","ɛ","θ","τ","\\","sym","id","#",";","ws","↦","cstr","{","}","return","^"],

// Goto lookup maps
gt0 = [0,-1,1,2,3,4,6,7,5,8,9,-20,10],
gt1 = [0,-10,17,18],
gt2 = [0,-4,20,6,7,5,8,9,-20,10],
gt3 = [0,-18,21,22,-4,23,24],
gt4 = [0,-18,28,22,-4,23,24],
gt5 = [0,-20,29,-3,30,31,32],
gt6 = [0,-32,35,36],
gt7 = [0,-29,41],
gt8 = [0,-32,43,36],
gt9 = [0,-11,44,-18,45],
gt10 = [0,-28,46,47],
gt11 = [0,-19,49,-4,23,24],
gt12 = [0,-29,50],
gt13 = [0,-29,51],
gt14 = [0,-33,56],
gt15 = [0,-31,58,-1,56],
gt16 = [0,-12,64,65,66,67,71,-4,70,69,68,73,75,76,74,-1,78,-5,72],
gt17 = [0,-16,87,-4,88,85,-1,73,75,76,74,-1,78,-4,84,86],
gt18 = [0,-13,95,66,67,71,-4,70,69,68,73,75,76,74,-1,78,-5,72],
gt19 = [0,-34,96],
gt20 = [0,-17,100,-2,101,-3,30,31,32],
gt21 = [0,-17,102,-2,101,-3,30,31,32],
gt22 = [0,-17,103,-2,101,-3,30,31,32],
gt23 = [0,-32,104,36],
gt24 = [0,-29,105],
gt25 = [0,-20,110,-3,30,31,32],
gt26 = [0,-32,114,36],
gt27 = [0,-29,115],
gt28 = [0,-32,116,36],

// State action lookup maps
sm0=[-4294967295,1,-3,0,-4,0,-4,2,-1,3,-1,4,5,6,1,-15,7],
sm1=[-4294967295,8,-3,0,-4,0],
sm2=[-4294967295,9,-3,0,-4,0,-11,10,-15,9],
sm3=[-4294967295,11,-3,0,-4,0,-4,2,-1,3,-1,4,5,6,11,-15,7],
sm4=[-4294967295,12,-3,0,-4,0,-4,12,-1,12,-1,12,12,12,12,-15,12],
sm5=[-4294967295,13,-3,0,-4,0,-4,13,-1,13,-1,13,13,13,13,-15,13],
sm6=[-4294967295,14,0,-4,0,-22,15,16],
sm7=[-4294967295,17,0,-4,0,-22,15,16,18],
sm8=[-4294967295,-1,19,20,-1,0,21,0],
sm9=[-4294967295,-2,22,-1,0,-4,0],
sm10=[-4294967295,23,-3,0,-4,0,-11,10,-15,7],
sm11=[-4294967295,24,-3,0,-4,0,-11,24,-15,24],
sm12=[-4294967295,25,-3,0,-4,0,-4,25,-1,25,-1,25,25,25,25,-15,25],
sm13=[-4294967295,-9,0,14,0,-27,15,16],
sm14=[-4294967295,-9,0,-22,26,26,26,0],
sm15=[-4294967295,-9,0,-22,27,27,27,0],
sm16=[-4294967295,-1,28,-2,0,-4,0],
sm17=[-4294967295,-1,29,-24,29,-5,29,29,29,29,0,-4,0],
sm18=[-4294967295,-1,30,-24,30,-5,30,30,30,30,0,-4,0],
sm19=[-4294967295,-4,0,-3,31,0],
sm20=[-4294967295,-1,19,20,-1,0,-4,0,21],
sm21=[-4294967295,32,32,32,-1,0,-4,0,32,32,-4,32],
sm22=[-4294967295,33,33,33,-1,0,-4,0,33,33,-4,33],
sm23=[-4294967295,-4,0,-4,0],
sm24=[-4294967295,34,-1,34,-1,0,-4,0,-11,34,34,34,34,-1,34,-5,34,34,34,34,-32,34,-2,34,-2,34],
sm25=[-4294967295,35,19,20,-1,0,-4,0,-28,36,21],
sm26=[-4294967295,37,-3,0,-4,0,-11,37,-15,37],
sm27=[-4294967295,-4,0,-4,0,-12,38],
sm28=[-4294967295,-4,0,-4,0,-12,39],
sm29=[-4294967295,40,-3,0,-4,0,-4,40,-1,40,-1,40,40,40,40,-15,40],
sm30=[-4294967295,-9,0,-22,41,41,41,0],
sm31=[-4294967295,42,-1,42,-1,0,-4,0,-11,42,-1,42,42,-1,42,-5,42,42,42,42,-32,42,-2,42,-2,42],
sm32=[-4294967295,43,-1,43,-1,0,-4,0,-11,43,-1,43,43,-1,43,-5,43,43,43,43,-32,43,-2,43,-2,43],
sm33=[-4294967295,44,-3,0,-4,0,-4,44,-1,44,-1,44,44,44,44,-15,44],
sm34=[-4294967295,45,45,45,-1,0,-4,0,-11,45,-1,45,45,-1,45,-5,45,45,45,-5,45,45,45],
sm35=[-4294967295,46,-3,0,-4,0,-4,46,-1,46,-1,46,46,46,46,-15,46],
sm36=[-4294967295,47,47,47,-1,0,-4,0,47,47,-4,47],
sm37=[-4294967295,48,-3,0,-4,0,-4,48,-1,48,-1,48,48,48,48,-15,48],
sm38=[-4294967295,49,-3,0,-4,0,-4,49,-1,49,-1,49,49,49,49,-15,49],
sm39=[-4294967295,50,-3,0,-4,0,-4,50,-1,50,-1,50,50,50,50,-15,50],
sm40=[-4294967295,51,52,-1,22,-1,0,-4,0,-14,53,-6,54,15,16,18,-5,55],
sm41=[-4294967295,56,-3,0,-4,0,-4,56,-1,56,-1,56,56,56,56,-15,56],
sm42=[-4294967295,57,-3,0,-4,0,-11,57,-1,58,-13,57],
sm43=[-4294967295,59,-3,0,-4,0,-11,59,-1,59,-13,59],
sm44=[-4294967295,60,-3,0,-4,0,-11,60,-1,60,-13,60],
sm45=[-4294967295,52,-1,22,-1,0,-4,0,-11,61,-1,61,53,-7,15,16,18,-2,61,-2,62,51],
sm46=[-4294967295,61,-3,0,-4,0,-11,61,-1,61,-13,61],
sm47=[-4294967295,63,-1,63,-1,0,-4,0,-11,63,-1,63,63,-7,63,63,63,-2,63,-2,63,63],
sm48=[-4294967295,64,-1,64,-1,0,-4,0,-11,64,-1,64,64,-7,64,64,64,-2,64,-2,64,64],
sm49=[-4294967295,65,-1,65,-1,0,-4,0,-11,65,-1,65,65,-7,65,65,65,-2,65,-2,65,65],
sm50=[-4294967295,66,-1,66,-1,0,-4,0,-11,66,-1,66,66,-7,66,66,66,-2,66,-2,66,66],
sm51=[-4294967295,-4,0,-4,0,-15,67,-1,68,69],
sm52=[-4294967295,-4,0,-4,0,-32,70,-2,71],
sm53=[-4294967295,72,-3,0,-4,0,-11,72,-1,72,-13,72],
sm54=[-4294967295,73,-3,0,-4,0,-11,73,-1,73,-13,73,-2,73],
sm55=[-4294967295,74,-3,0,-4,0,-11,74,-1,74,-13,74],
sm56=[-4294967295,-4,0,-4,0,-30,75],
sm57=[-4294967295,76,-1,76,-1,0,-4,0,-11,76,-1,76,76,-7,76,76,76,-2,76,-2,76,76],
sm58=[-4294967295,-4,0,-4,0,-31,77,70,-1,78,71],
sm59=[-4294967295,79,-3,0,-4,0,-11,79,-1,79,-13,79],
sm60=[-4294967295,80,-3,0,-4,0,-11,80,-1,80,-13,80],
sm61=[-4294967295,-4,0,-4,0,-31,77,-2,78],
sm62=[-4294967295,-4,0,-4,0,-32,81,-2,82],
sm63=[-4294967295,-4,0,-4,0,-32,83],
sm64=[-4294967295,-26,84,17,0,-4,0,-22,15,16,18],
sm65=[-4294967295,-26,85,-5,85,85,85,85,0,-4,0],
sm66=[-4294967295,-26,86,17,0,-4,0,-22,15,16,18],
sm67=[-4294967295,-26,87,17,0,-4,0,-22,15,16,18],
sm68=[-4294967295,-1,19,20,-1,0,-38,88,21,0],
sm69=[-4294967295,89,-1,89,-1,0,-4,0,-11,89,-1,89,89,-7,89,89,89,-2,89,-2,89,89],
sm70=[-4294967295,90,-1,90,-1,0,-4,0,-11,90,-1,90,90,-7,90,90,90,-2,90,-2,90,90],
sm71=[-4294967295,-26,91,-5,91,91,91,91,0,-4,0],
sm72=[-4294967295,92,-1,92,-1,0,-4,0,-11,92,-1,92,92,-7,92,92,92,-2,92,-2,92,92],
sm73=[-4294967295,-1,19,20,-1,0,-38,93,21,0],
sm74=[-4294967295,94,-3,0,-4,0,-11,94,-1,94,-13,94],
sm75=[-4294967295,-1,19,20,-1,0,-38,95,21,0],
sm76=[-4294967295,96,-3,0,-4,0,-11,96,-1,96,-13,96],

// Symbol Lookup map
lu = new Map([[1,1],[2,2],[4,3],[8,4],[16,5],[32,6],[64,7],[128,8],[256,9],[512,10],[3,11],[264,11],[null,13],["@SYMBOL",14],["@PREC",16],["@IGNORE",18],["@NAME",19],["@EXT",20],["--",21],["→",22],["│",23],["((",24],["EXC",25],["))",26],["ERR",27],["IGN",28],["$",30],["ɛ",31],["θ",32],["τ",33],["\\",34],["#",37],[";",38],["↦",40],["cstr",41],["{",42],["}",43],["return",44],["^",45]]),

// States 
state = [sm0,
sm1,
sm2,
sm3,
sm4,
sm5,
sm5,
sm5,
sm5,
sm5,
sm5,
sm6,
sm6,
sm7,
sm8,
sm9,
sm8,
sm10,
sm11,
sm9,
sm12,
sm13,
sm14,
sm15,
sm15,
sm15,
sm9,
sm9,
sm13,
sm16,
sm17,
sm17,
sm17,
sm18,
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
sm26,
sm27,
sm28,
sm29,
sm30,
sm31,
sm32,
sm33,
sm23,
sm34,
sm35,
sm36,
sm37,
sm38,
sm39,
sm39,
sm39,
sm40,
sm41,
sm42,
sm43,
sm44,
sm45,
sm46,
sm46,
sm47,
sm47,
sm47,
sm48,
sm48,
sm48,
sm48,
sm49,
sm50,
sm51,
sm52,
sm53,
sm54,
sm40,
sm55,
sm56,
sm57,
sm57,
sm57,
sm58,
sm7,
sm7,
sm7,
sm8,
sm9,
sm59,
sm60,
sm61,
sm62,
sm63,
sm64,
sm65,
sm66,
sm67,
sm68,
sm69,
sm8,
sm9,
sm8,
sm70,
sm71,
sm70,
sm70,
sm72,
sm73,
sm74,
sm75,
sm76,
sm76],

/* Functions */

max = Math.max,

//Error Functions
e = (tk,r,o,l,s)=>{
        if(l.END)
            l.throw("Unexpected end of input");
        else
            l.throw(`unexpected token ${l.tx} on input ${s} `)
    }, 
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

redv = (ret, fn, plen, ln, t, e, o, l, s) => {        ln = max(o.length - plen,0);        o[ln] = fn(o.slice(-plen), e, l, s);        o.length = ln + 1;        return ret;    },
rednv = (ret, fn, plen, ln, t, e, o, l, s) => {        console.log(plen, o);        ln = max(o.length - plen,0);        o[ln] = new fn(o.slice(-plen), e, l, s);        o.length = ln + 1;        return ret;    },
redn = (ret, t, e, o) => (o.push(null), ret),
shftf = (ret, fn, t, e, o, l, s) => (fn(o, e, l, s), ret),
SRETURNED0=function (sym,env,lex,state) {return sym[0]},
headCLASS0=function (sym,env,lex,state) {this.pre = sym[0]; this.productions = sym[1]},
preamble_clausesRETURNED0=function (sym,env,lex,state) {return [sym[0]]},
preamble_clausesRETURNED1=function (sym,env,lex,state) {return sym[0].push(sym[1]), sym[0]},
symbols_preambleCLASS0=function (sym,env,lex,state) {this.type='symbols'; this.symbols = sym[1]},
precedence_preambleCLASS0=function (sym,env,lex,state) {this.type='precedence'; this.terminal = sym[1]; this.val = parseInt(sym[2])},
ignore_preambleCLASS0=function (sym,env,lex,state) {this.type='ignore'; this.symbols = sym[1]},
name_preambleCLASS0=function (sym,env,lex,state) {this.type='name'; this.id = sym[1]},
ext_preambleCLASS0=function (sym,env,lex,state) {this.type='ext'; this.id = sym[1]},
productionCLASS0=function (sym,env,lex,state) {this.name = sym[0]; this.bodies = sym[2]; this.id = -1;},
production_bodiesRETURNED0=function (sym,env,lex,state) {return sym[0].push(sym[2]), sym[0]},
entriesCLASS0=function (sym,env,lex,state) {this.body = sym[0]; this.body_functs = null},
entriesCLASS1=function (sym,env,lex,state) {this.body = sym[0]; this.body_functs = sym[1]},
entriesCLASS2=function (sym,env,lex,state) {this.body = new Object(); this.body_functs = null; this.body.length = 0; this.body.sym = [sym[0]];},
body_entriesCLASS0=function (sym,env,lex,state) {this.sym = [sym[0]]; this.length = 1; this.conditions = []; this.functions = [];},
body_entriesCLASS1=function (sym,env,lex,state) {this.sym = []; this.length = 0; this.conditions = [sym[0]]; this.functions = []; sym[0].offset = this.length;},
body_entriesCLASS2=function (sym,env,lex,state) {this.sym = []; this.length = 0; this.conditions = []; this.functions = [sym[0]]; sym[0].offset = this.length;},
body_entriesRETURNED3=function (sym,env,lex,state) {return (sym[0].functions.push(sym[1]),  sym[1].offset = sym[0].length, sym[0])},
body_entriesRETURNED4=function (sym,env,lex,state) {return (sym[0].conditions.push(sym[1]),  sym[1].offset = sym[0].length, sym[0])},
body_entriesRETURNED5=function (sym,env,lex,state) {return (sym[0].sym.push(sym[1]), sym[0].length++, sym[0])},
condition_clauseCLASS0=function (sym,env,lex,state) {this.type = "exc"; this.id = sym[2]},
condition_clauseCLASS1=function (sym,env,lex,state) {this.type = "err"; this.id = sym[2]},
condition_clauseCLASS2=function (sym,env,lex,state) {this.type = "ign"; this.id = sym[2]},
terminal_symbolCLASS0=function (sym,env,lex,state) {this.type = "symbol"; this.id = sym[0]},
EOF_symbolCLASS0=function (sym,env,lex,state) {this.type = "eof";},
empty_symbolCLASS0=function (sym,env,lex,state) {this.type = "empty";},
generated_symbolCLASS0=function (sym,env,lex,state) {this.type = "generated"; this.id = sym[1]},
literal_symbolCLASS0=function (sym,env,lex,state) {this.type = "literal"; this.id = sym[1]},
escaped_symbolCLASS0=function (sym,env,lex,state) {this.type = "escaped"; this.id = sym[1]},
production_symbolCLASS0=function (sym,env,lex,state) {this.type = "production"; this.id = sym[0]; this.val = -1},
commentCLASS0=function (sym,env,lex,state) {this.val = sym[1]},
comment_dataRETURNED0=function (sym,env,lex,state) {return sym[0] + sym[1]},
reduce_functionCLASS0=function (sym,env,lex,state) {this.type = "CLASS"; this.txt = sym[3]; this.name = ""; this.env = false;},
reduce_functionCLASS1=function (sym,env,lex,state) {this.type = "RETURNED"; this.txt = sym[3]; this.name = ""; this.env = false;},
reduce_functionCLASS2=function (sym,env,lex,state) {this.type = "CLASS"; this.txt = "";    this.name = sym[3]; this.env = true;},
function_clauseCLASS0=function (sym,env,lex,state) {this.type = "INLINE"; this.txt = sym[2]; this.name = ""; this.env = false;},
function_clauseCLASS1=function (sym,env,lex,state) {this.type = "INLINE"; this.txt = sym[2]; this.name = sym[3]; this.env = true;},

//Sparse Map Lookup
lsm = (index, map) => {    if (map[0] > 0xFFFFFFFF) return map[index];    for (let i = 1, ind = 0, l = map.length, n = 0; i < l && ind <= index; i++) {        if (ind !== index) {            if ((n = map[i]) > -1) ind++;            else ind += -n;        } else return map[i];    }    return -1;},

//State Action Functions
state_funct = [(...v)=>((redn(2051,...v))),
()=>(50),
()=>(54),
()=>(46),
()=>(58),
()=>(62),
()=>(66),
(...v)=>(redv(5,SRETURNED0,1,0,...v)),
(...v)=>((redn(10243,...v))),
()=>(78),
()=>(2055),
(...v)=>(redv(3079,preamble_clausesRETURNED0,1,0,...v)),
()=>(4103),
()=>(102),
()=>(106),
()=>(110),
()=>(134),
()=>(138),
()=>(154),
()=>(150),
()=>(162),
()=>(170),
(...v)=>(rednv(1035,headCLASS0,2,0,...v)),
(...v)=>(redv(10247,preamble_clausesRETURNED0,1,0,...v)),
(...v)=>(redv(3083,preamble_clausesRETURNED1,2,0,...v)),
(...v)=>(redv(18439,preamble_clausesRETURNED0,1,0,...v)),
()=>(19463),
()=>(214),
()=>(20487),
(...v)=>(rednv(20487,terminal_symbolCLASS0,1,0,...v)),
()=>(218),
(...v)=>(redv(32775,SRETURNED0,1,0,...v)),
()=>(33799),
()=>(29703),
()=>(242),
()=>(246),
(...v)=>(redv(10251,preamble_clausesRETURNED1,2,0,...v)),
()=>(250),
()=>(28679),
(...v)=>(rednv(7183,ignore_preambleCLASS0,3,0,...v)),
(...v)=>(redv(18443,preamble_clausesRETURNED1,2,0,...v)),
(...v)=>(rednv(24587,generated_symbolCLASS0,2,0,...v)),
(...v)=>(rednv(25611,literal_symbolCLASS0,2,0,...v)),
(...v)=>(rednv(5135,symbols_preambleCLASS0,3,0,...v)),
(...v)=>(rednv(26635,escaped_symbolCLASS0,2,0,...v)),
(...v)=>(rednv(8207,name_preambleCLASS0,3,0,...v)),
(...v)=>(redv(32779,comment_dataRETURNED0,2,0,...v)),
(...v)=>(rednv(9231,ext_preambleCLASS0,3,0,...v)),
(...v)=>(rednv(30735,commentCLASS0,3,0,...v)),
()=>(31751),
()=>(310),
()=>(330),
()=>(318),
()=>(326),
()=>(322),
(...v)=>(rednv(6163,precedence_preambleCLASS0,4,0,...v)),
(...v)=>(rednv(11283,productionCLASS0,4,0,...v)),
()=>(334),
(...v)=>(redv(12295,preamble_clausesRETURNED0,1,0,...v)),
()=>(13319),
(...v)=>(rednv(14343,entriesCLASS0,1,0,...v)),
()=>(358),
(...v)=>(rednv(15367,body_entriesCLASS0,1,0,...v)),
()=>(21511),
(...v)=>(rednv(21511,terminal_symbolCLASS0,1,0,...v)),
(...v)=>(rednv(27655,production_symbolCLASS0,1,0,...v)),
()=>(362),
()=>(366),
()=>(370),
()=>(374),
()=>(378),
(...v)=>(rednv(23559,empty_symbolCLASS0,1,0,...v)),
(...v)=>(rednv(22535,EOF_symbolCLASS0,1,0,...v)),
(...v)=>(rednv(14347,entriesCLASS1,2,0,...v)),
()=>(390),
(...v)=>(redv(15371,body_entriesRETURNED3,2,0,...v)),
()=>(394),
()=>(398),
(...v)=>(redv(12303,production_bodiesRETURNED0,3,0,...v)),
(...v)=>(rednv(14351,entriesCLASS1,3,0,...v)),
()=>(426),
()=>(430),
()=>(434),
()=>(438),
(...v)=>(redv(17415,preamble_clausesRETURNED0,1,0,...v)),
()=>(446),
()=>(450),
()=>(454),
(...v)=>(rednv(35855,function_clauseCLASS1,3,0,...v)),
(...v)=>(rednv(16403,condition_clauseCLASS0,4,0,...v)),
(...v)=>(redv(17419,preamble_clausesRETURNED1,2,0,...v)),
(...v)=>(rednv(35859,function_clauseCLASS0,4,0,...v)),
()=>(470),
(...v)=>(rednv(34835,reduce_functionCLASS2,4,0,...v)),
()=>(474),
(...v)=>(rednv(34839,reduce_functionCLASS0,5,0,...v))],

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
v=>lsm(v,gt4),
v=>lsm(v,gt5),
v=>lsm(v,gt6),
v=>lsm(v,gt7),
v=>lsm(v,gt8),
v=>lsm(v,gt9),
nf,
v=>lsm(v,gt10),
nf,
v=>lsm(v,gt11),
nf,
nf,
nf,
nf,
v=>lsm(v,gt12),
v=>lsm(v,gt13),
v=>lsm(v,gt11),
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt14),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt15),
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
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt16),
nf,
nf,
nf,
nf,
v=>lsm(v,gt17),
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
nf,
nf,
nf,
nf,
v=>lsm(v,gt18),
nf,
v=>lsm(v,gt19),
nf,
nf,
nf,
nf,
v=>lsm(v,gt20),
v=>lsm(v,gt21),
v=>lsm(v,gt22),
v=>lsm(v,gt23),
v=>lsm(v,gt24),
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt25),
nf,
v=>lsm(v,gt25),
v=>lsm(v,gt25),
v=>lsm(v,gt14),
nf,
v=>lsm(v,gt26),
v=>lsm(v,gt27),
v=>lsm(v,gt28),
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt14),
nf,
v=>lsm(v,gt14),
nf,
nf];

function getToken(l, SYM_LU) {
    if (l.END) return 0; //13

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

 function parser(l, e = {}){
    l.IWS = false;
    //*
    if(symbols.length > 0){
        symbols.forEach(s=> {l.addSymbol(s)});
        l.tl = 0;
        l.next();
    }
    //*/

    const o = [], ss = [0,0];
    
    let time = 1000000, RECOVERING = 1,
        tk = getToken(l, lu), p = l.copy(), sp = 1, len = 0, off= 0;
    
    outer:

    while(time-- > 0){

        let fn = lsm(tk, state[ss[sp]]) || 0, r, st = 0, gt = -1, c = 0;

        if(fn == 0){
            //Ignore the token
            l.next();
            tk = getToken(l, lu);
            continue;
        }

        console.log(o)

        if(fn > 0){
            r = state_funct[fn-1](tk, e, o, l, ss[sp-1]);
        } else {

            if(RECOVERING > 1){
                if(tk !== lu.get(l.ty)){
                    RECOVERING = 0;
                    tk = l.ty;
                    continue;
                }

                if(tk !== undefined){
                    tk = undefined;
                    RECOVERING = 1;
                    continue;
                }

            }

            tk = getToken(l, lu);

            //Error Encountered 
            //r = re[ss[sp]];
            const recovery_token = eh[ss[sp]](tk, e, o, l, p, ss[sp]);
            
            if(RECOVERING > 0 && typeof(recovery_token) == "string"){
                RECOVERING = -1; // To prevent infinite recursion
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
                o.push(l.tx); 
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
}; const hcg_v1 = parser;