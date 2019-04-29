const e = (tk,r,o,l,s)=>{throw new SyntaxError(l.errorMessage(`unexpected token ${tk !== "$" ? tk[0] == "θ" || tk[0] == "τ" ? l.tx : tk : "EOF"} on production ${s} `))}, nf = ()=>-1, lex_declaration=function(v){this.id = v.id; this.expr = v.init},
var_declaration=function(v){this.id = v.id; this.expr = v.init},
S$0=function (sym,env,lex,state) {return sym[0];},
statement_list$0=function (sym,env,lex,state) {return [sym[0]]},
statement_list$1=function (sym,env,lex,state) {return (sym[0].push(sym[1]), sym[0])},
block$0=function (sym,env,lex,state) {return sym[1]},
empty_statement$0=function (sym,env,lex,state) {this.type = "empty"},
expression_statement$0=function (sym,env,lex,state) {return sym[0]},
if_statement$0=function (sym,env,lex,state) {return (new env.functions.if_stmt(sym[2], sym[4], sym[6]))},
if_statement$1=function (sym,env,lex,state) {return (new env.functions.if_stmt(sym[2], sym[4]))},
iteration_statement$0=function (sym,env,lex,state) {return (new env.functions.for_stmt(sym[2], sym[4], sym[6], sym[8]))},
iteration_statement$1=function (sym,env,lex,state) {return (new env.functions.for_stmt(null, sym[4], sym[6], sym[8]))},
iteration_statement$2=function (sym,env,lex,state) {return (new env.functions.for_stmt(null, null, sym[6], sym[8]))},
iteration_statement$3=function (sym,env,lex,state) {return (new env.functions.for_stmt(sym[2], null, sym[6], sym[8]))},
iteration_statement$4=function (sym,env,lex,state) {return (new env.functions.for_stmt(sym[2], sym[4], null, sym[8]))},
iteration_statement$5=function (sym,env,lex,state) {return (new env.functions.for_stmt(sym[2], null, null, sym[8]))},
iteration_statement$6=function (sym,env,lex,state) {return (new env.functions.for_stmt(null, null, null, sym[8]))},
iteration_statement$7=function (sym,env,lex,state) {return (new env.functions.for_stmt(sym[3], sym[5], sym[7], sym[9]))},
iteration_statement$8=function (sym,env,lex,state) {return (new env.functions.for_stmt(sym[3], sym[5], null, sym[9]))},
iteration_statement$9=function (sym,env,lex,state) {return (new env.functions.for_stmt(sym[3], null, sym[7], sym[9]))},
iteration_statement$10=function (sym,env,lex,state) {return (new env.functions.for_stmt(sym[3], null , null, sym[9]))},
iteration_statement$11=function (sym,env,lex,state) {return (new env.functions.for_in_stmt(sym[2], sym[4], sym[6]))},
iteration_statement$12=function (sym,env,lex,state) {return (new env.functions.for_in_stmt(sym[3], sym[5], sym[7]))},
iteration_statement$13=function (sym,env,lex,state) {return (new env.functions.for_of_stmt(sym[2], sym[4], sym[6]))},
iteration_statement$14=function (sym,env,lex,state) {return (new env.functions.for_of_stmt(sym[3], sym[5], sym[7], true))},
iteration_statement$15=function (sym,env,lex,state) {return (new env.functions.for_of_stmt(sym[4], sym[6], sym[8], true))},
continue_statement$0=function (sym,env,lex,state) {return (new env.functions.continue_stmt(sym[1]))},
break_statement$0=function (sym,env,lex,state) {return (new env.functions.break_stmt(sym[1]))},
return_statement$0=function (sym,env,lex,state) {return (new env.functions.return_stmt(sym[1]))},
case_block$0=function (sym,env,lex,state) {return []},
case_block$1=function (sym,env,lex,state) {return sym[1].concat(sym[2].concat(sym[3]))},
case_block$2=function (sym,env,lex,state) {return sym[1].concat(sym[2])},
case_clauses$0=function (sym,env,lex,state) {return [sym(0)]},
case_clauses$1=function (sym,env,lex,state) {return sym[0].concat(sym[1])},
case_clause$0=function (sym,env,lex,state) {return (new env.functions.case_stmt(sym[1], sym[3]))},
case_clause$1=function (sym,env,lex,state) {return (new env.functions.case_stmt(sym[1]))},
default_clause$0=function (sym,env,lex,state) {return (new env.functions.default_case_stmt(sym[2]))},
default_clause$1=function (sym,env,lex,state) {return (new env.functions.default_case_stmt())},
try_statement$0=function (sym,env,lex,state) {return (new env.functions.try_stmt(sym[1],sym[2]))},
try_statement$1=function (sym,env,lex,state) {return (new env.functions.try_stmt(sym[1],null ,sym[2]))},
try_statement$2=function (sym,env,lex,state) {return (new env.functions.try_stmt(sym[1], sym[2], sym[3]))},
variable_declaration_list$0=function (sym,env,lex,state) {return [new env.functions.var_declaration(sym[0], e)]},
variable_declaration_list$1=function (sym,env,lex,state) {return sym[0].push(new env.functions.var_declaration(sym[1], e))},
variable_declaration$0=function (sym,env,lex,state) {return {id:sym[0], init:sym[1]}},
variable_declaration$1=function (sym,env,lex,state) {return {id:sym[0], init:null}},
let_or_const$0=function (sym,env,lex,state) {return "let"},
let_or_const$1=function (sym,env,lex,state) {return "const"},
binding_list$0=function (sym,env,lex,state) {return [new env.functions.lex_declaration(sym[0], e)]},
binding_list$1=function (sym,env,lex,state) {return sym[0].push(new env.functions.lex_declaration(sym[1], e))},
class_tail$0=function (sym,env,lex,state) {return null},
class_element_list$0=function (sym,env,lex,state) {return (sym[0].push(sym[1]))},
class_element$0=function (sym,env,lex,state) {return (sym[1].static = true, sym[1])},
expression$0=function (sym,env,lex,state) {return (sym(0).push(sym(2)), sym[0])},
arguments$0=function (sym,env,lex,state) {return [];},
argument_list$0=function (sym,env,lex,state) {return (sym[0].push(sym[2]), sym[1])},
argument_list$1=function (sym,env,lex,state) {return (sym[0].push(new env.functions.spread_expr(env, sym.slice(2,4))), env[0])},
array_literal$0=function (sym,env,lex,state) {return [ ]},
element_list$0=function (sym,env,lex,state) {return [sym[1]]},
element_list$1=function (sym,env,lex,state) {return (sym[0].push(sym[2]),sym[0])},
cover_parenthesized_expression_and_arrow_parameter_list$0=function (sym,env,lex,state) {return [sym[0].push(new env.functions.spread_expr(env, sym.slice(1,3)))]},
symbols = ["{",
"}",
"(",
")",
"[",
"]",
".",
"...",
";",
",",
"<",
">",
"<=",
">=",
"==",
"!=",
"===",
"!==",
"+",
"-",
"*",
"%",
"/",
"**",
"++",
"--",
"<<",
">>",
">>>",
"&",
"|",
"^",
"!",
"~",
"&&",
"||",
"?",
":",
"+=",
"-=",
"*=",
"%=",
"/=",
"**=",
"<<=",
">>=",
">>>=",
"&=",
"|=",
"^=",
"=>"],
goto = [(v,r = gt0[v]) => (r >= 0 ? r : -1),
nf,
nf],
err = [(v)=>(["$"]).includes(v) ? 1 : 0,
(v)=>(["$"]).includes(v) ? 1 : 0,
(v)=>0,
(v)=>0,
(v)=>(["τimport","τexport","{","τvar",";","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τwhile","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst"]).includes(v) ? 1 : 0,
(v)=>(["τimport","τexport","{","τvar",";","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τwhile","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst"]).includes(v) ? 1 : 0,
(v)=>(["τimport","τexport","{","τvar",";","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τwhile","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst"]).includes(v) ? 1 : 0,
(v)=>(["τfrom"]).includes(v) ? 1 : 0,
(v)=>([",","τfrom"]).includes(v) ? 1 : 0,
(v)=>(["τfrom"]).includes(v) ? 1 : 0,
(v)=>(["τfrom"]).includes(v) ? 1 : 0,
(v)=>([";","τimport","τexport","{","τvar","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τwhile","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst"]).includes(v) ? 1 : 0,
(v)=>(["}",","]).includes(v) ? 1 : 0,
(v)=>(["}",","]).includes(v) ? 1 : 0,
(v)=>(["τimport","τexport","{","τvar",";","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τwhile","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst"]).includes(v) ? 1 : 0,
(v)=>([",","τfrom","}"]).includes(v) ? 1 : 0,
(v)=>(["τimport","τexport","{","τvar",";","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τwhile","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst"]).includes(v) ? 1 : 0,
(v)=>(["τfrom",";"]).includes(v) ? 1 : 0,
(v)=>(["}",","]).includes(v) ? 1 : 0,
(v)=>(["}",","]).includes(v) ? 1 : 0,
(v)=>(["$"]).includes(v) ? 1 : 0,
(v)=>0,
(v)=>(["{","τvar",";","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τwhile","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst","}","τdefault","τcase"]).includes(v) ? 1 : 0,
(v)=>(["τimport","τexport","{","τvar",";","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τwhile","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst","}"]).includes(v) ? 1 : 0,
(v)=>(["τelse","τwhile",";",")","τimport","τexport","{","τvar","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst","}"]).includes(v) ? 1 : 0,
(v)=>(["τimport","τexport","{","τvar",";","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τwhile","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst","}"]).includes(v) ? 1 : 0,
(v)=>(["τimport","τexport","{","τvar",";","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τwhile","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst"]).includes(v) ? 1 : 0,
(v)=>(["τelse","τwhile",";",")","τimport","τexport","{","τvar","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst","}"]).includes(v) ? 1 : 0,
(v)=>(["τelse","τwhile",";",")","τimport","τexport","{","τvar","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst","}"]).includes(v) ? 1 : 0,
(v)=>(["τcatch","τfinally","τelse","τwhile",";",")","τimport","τexport","{","τvar","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst","}"]).includes(v) ? 1 : 0,
(v)=>(["τelse","τwhile",";",")","τimport","τexport","{","τvar","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst","}"]).includes(v) ? 1 : 0,
(v)=>(["τelse","τwhile",";",")","τimport","τexport","{","τvar","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst","}"]).includes(v) ? 1 : 0,
(v)=>(["τelse","τwhile",";",")","τimport","τexport","{","τvar","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst","}"]).includes(v) ? 1 : 0,
(v)=>(["τelse","τwhile",";",")","τimport","τexport","{","τvar","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst","}"]).includes(v) ? 1 : 0,
(v)=>(["τin","τof"]).includes(v) ? 1 : 0,
(v)=>(["τin","τof"]).includes(v) ? 1 : 0,
(v)=>(["τelse","τwhile",";",")","τimport","τexport","{","τvar","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst","}"]).includes(v) ? 1 : 0,
(v)=>(["τelse","τwhile",";",")","τimport","τexport","{","τvar","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst","}"]).includes(v) ? 1 : 0,
(v)=>(["τelse","τwhile",";",")","τimport","τexport","{","τvar","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst","}"]).includes(v) ? 1 : 0,
(v)=>(["τelse","τwhile",";",")","τimport","τexport","{","τvar","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst","}"]).includes(v) ? 1 : 0,
(v)=>(["τelse","τwhile",";",")","τimport","τexport","{","τvar","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst","}"]).includes(v) ? 1 : 0,
(v)=>(["τelse","τwhile",";",")","τimport","τexport","{","τvar","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst","}"]).includes(v) ? 1 : 0,
(v)=>(["τdefault","}","τcase"]).includes(v) ? 1 : 0,
(v)=>(["}","τdefault","τcase"]).includes(v) ? 1 : 0,
(v)=>(["τcase","}"]).includes(v) ? 1 : 0,
(v)=>(["τelse","τwhile",";",")","τimport","τexport","{","τvar","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst","}"]).includes(v) ? 1 : 0,
(v)=>(["τelse","τwhile",";",")","τimport","τexport","{","τvar","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst","}"]).includes(v) ? 1 : 0,
(v)=>(["τelse","τwhile",";",")","τimport","τexport","{","τvar","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst","}"]).includes(v) ? 1 : 0,
(v)=>(["τelse","τwhile",";",")","τimport","τexport","{","τvar","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst","}"]).includes(v) ? 1 : 0,
(v)=>(["τfinally","τelse","τwhile",";",")","τimport","τexport","{","τvar","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst","}"]).includes(v) ? 1 : 0,
(v)=>(["τelse","τwhile",";",")","τimport","τexport","{","τvar","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst","}"]).includes(v) ? 1 : 0,
(v)=>([")"]).includes(v) ? 1 : 0,
(v)=>(["τelse","τwhile",";",")","τimport","τexport","{","τvar","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst","}"]).includes(v) ? 1 : 0,
(v)=>(["τimport","τexport","{","τvar",";","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τwhile","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst","τelse",")","}"]).includes(v) ? 1 : 0,
(v)=>([";",","]).includes(v) ? 1 : 0,
(v)=>([";",","]).includes(v) ? 1 : 0,
(v)=>([";","τimport","τexport","{","τvar","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τwhile","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst","}"]).includes(v) ? 1 : 0,
(v)=>(["θid","τyield","τawait","{","["]).includes(v) ? 1 : 0,
(v)=>([";",","]).includes(v) ? 1 : 0,
(v)=>([";",","]).includes(v) ? 1 : 0,
(v)=>(["τimport","τexport","{","τvar",";","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τwhile","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst","τelse",")","}"]).includes(v) ? 1 : 0,
(v)=>(["(","[",".","τin","τof","=","*=","/=","%=","+=","-=","<<=",">>=",">>>=","&=","^=","|=","**=","++","--","{"]).includes(v) ? 1 : 0,
(v)=>([")"]).includes(v) ? 1 : 0,
(v)=>([")"]).includes(v) ? 1 : 0,
(v)=>([",",")"]).includes(v) ? 1 : 0,
(v)=>([")"]).includes(v) ? 1 : 0,
(v)=>([",",")"]).includes(v) ? 1 : 0,
(v)=>(["}"]).includes(v) ? 1 : 0,
(v)=>(["}"]).includes(v) ? 1 : 0,
(v)=>([")","]",":","τimport","τexport","{","τvar",";","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τwhile","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst",",","}"]).includes(v) ? 1 : 0,
(v)=>(["=>"]).includes(v) ? 1 : 0,
(v)=>0,
(v)=>0,
(v)=>(["=>"]).includes(v) ? 1 : 0,
(v)=>0,
(v)=>(["=>"]).includes(v) ? 1 : 0,
(v)=>(["(","[",".","τin","τof","=","*=","/=","%=","+=","-=","<<=",">>=",">>>=","&=","^=","|=","**=","++","--","{"]).includes(v) ? 1 : 0,
(v)=>(["τimport","τexport","{","τvar",";","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τwhile","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst","}"]).includes(v) ? 1 : 0,
(v)=>(["τimport","τexport","{","τvar",";","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τwhile","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst","}"]).includes(v) ? 1 : 0,
(v)=>(["{"]).includes(v) ? 1 : 0,
(v)=>(["}"]).includes(v) ? 1 : 0,
(v)=>(["θid","τyield","τawait","θstr","θnum","[","τget","τset","τstatic",";","}"]).includes(v) ? 1 : 0,
(v)=>(["θid","τyield","τawait","θstr","θnum","[","τget","τset","τstatic",";","}"]).includes(v) ? 1 : 0,
(v)=>(["θid","τyield","τawait","θstr","θnum","[","τget","τset","τstatic",";","}",","]).includes(v) ? 1 : 0,
(v)=>([")"]).includes(v) ? 1 : 0,
(v)=>([";",")",":",",","]"]).includes(v) ? 1 : 0,
(v)=>(["τin","τof","=","*=","/=","%=","+=","-=","<<=",">>=",">>>=","&=","^=","|=","**=","++","--","{","**","*","/","%","+","-","<<",">>",">>>","<",">","<=",">=","τinstanceof","==","!=","===","!==","^","&","|","&&","?","||",")","]",":","τimport","τexport","τvar",";","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","τdelete","τvoid","τtypeof","~","!","τif","τdo","τwhile","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst",",","}"]).includes(v) ? 1 : 0,
(v)=>(["τin","τof","=","*=","/=","%=","+=","-=","<<=",">>=",">>>=","&=","^=","|=","**=","++","--","{"]).includes(v) ? 1 : 0,
(v)=>(["(","[",".","τin","τof","=","*=","/=","%=","+=","-=","<<=",">>=",">>>=","&=","^=","|=","**=","++","--","{"]).includes(v) ? 1 : 0,
(v)=>(["(","[",".","τin","τof","=","*=","/=","%=","+=","-=","<<=",">>=",">>>=","&=","^=","|=","**=","++","--","{"]).includes(v) ? 1 : 0,
(v)=>(["(","[",".","τin","τof","=","*=","/=","%=","+=","-=","<<=",">>=",">>>=","&=","^=","|=","**=","++","--","{"]).includes(v) ? 1 : 0,
(v)=>(["(","[",".","τin","τof","=","*=","/=","%=","+=","-=","<<=",">>=",">>>=","&=","^=","|=","**=","++","--","{"]).includes(v) ? 1 : 0,
(v)=>([".","(","[","τin","τof","=","*=","/=","%=","+=","-=","<<=",">>=",">>>=","&=","^=","|=","**=","++","--","{"]).includes(v) ? 1 : 0,
(v)=>([".","(","[","τin","τof","=","*=","/=","%=","+=","-=","<<=",">>=",">>>=","&=","^=","|=","**=","++","--","{"]).includes(v) ? 1 : 0,
(v)=>(["=>","(","[",".","τin","τof","=","*=","/=","%=","+=","-=","<<=",">>=",">>>=","&=","^=","|=","**=","++","--","{"]).includes(v) ? 1 : 0,
(v)=>([")",","]).includes(v) ? 1 : 0,
(v)=>(["(","[",".","τin","τof","=","*=","/=","%=","+=","-=","<<=",">>=",">>>=","&=","^=","|=","**=","++","--","{"]).includes(v) ? 1 : 0,
(v)=>(["(","[",".","τin","τof","=","*=","/=","%=","+=","-=","<<=",">>=",">>>=","&=","^=","|=","**=","++","--","{"]).includes(v) ? 1 : 0,
(v)=>(["}",","]).includes(v) ? 1 : 0,
(v)=>(["}",","]).includes(v) ? 1 : 0,
(v)=>(["(",":"]).includes(v) ? 1 : 0,
(v)=>(["(",":"]).includes(v) ? 1 : 0,
(v)=>(["(",":"]).includes(v) ? 1 : 0,
(v)=>(["}",","]).includes(v) ? 1 : 0,
(v)=>([";",",","}",")","]"]).includes(v) ? 1 : 0,
(v)=>(["(","[",".","τin","τof","=","*=","/=","%=","+=","-=","<<=",">>=",">>>=","&=","^=","|=","**=","++","--","{"]).includes(v) ? 1 : 0,
(v)=>(["]",","]).includes(v) ? 1 : 0,
(v)=>(["]","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","{","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","...",","]).includes(v) ? 1 : 0,
(v)=>(["]",","]).includes(v) ? 1 : 0,
(v)=>([")","]",":","τimport","τexport","{","τvar",";","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τwhile","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst",",","}"]).includes(v) ? 1 : 0,
(v)=>(["τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","{","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!"]).includes(v) ? 1 : 0,
(v)=>([")","]",":","τimport","τexport","{","τvar",";","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τwhile","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst",",","}"]).includes(v) ? 1 : 0,
(v)=>(["?","||",")","]",":","τimport","τexport","{","τvar",";","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τwhile","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst",",","}"]).includes(v) ? 1 : 0,
(v)=>(["&&","?","||",")","]",":","τimport","τexport","{","τvar",";","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τwhile","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst",",","}"]).includes(v) ? 1 : 0,
(v)=>(["|","&&","?","||",")","]",":","τimport","τexport","{","τvar",";","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τwhile","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst",",","}"]).includes(v) ? 1 : 0,
(v)=>(["|","&&","?","||",")","]",":","τimport","τexport","{","τvar",";","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τwhile","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst",",","}"]).includes(v) ? 1 : 0,
(v)=>(["^","&","|","&&","?","||",")","]",":","τimport","τexport","{","τvar",";","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τwhile","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst",",","}"]).includes(v) ? 1 : 0,
(v)=>(["==","!=","===","!==","^","&","|","&&","?","||",")","]",":","τimport","τexport","{","τvar",";","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τwhile","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst",",","}"]).includes(v) ? 1 : 0,
(v)=>(["<",">","<=",">=","τinstanceof","τin","==","!=","===","!==","^","&","|","&&","?","||",")","]",":","τimport","τexport","{","τvar",";","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τwhile","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst",",","}"]).includes(v) ? 1 : 0,
(v)=>(["<<",">>",">>>","<",">","<=",">=","τinstanceof","τin","==","!=","===","!==","^","&","|","&&","?","||",")","]",":","τimport","τexport","{","τvar",";","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τwhile","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst",",","}"]).includes(v) ? 1 : 0,
(v)=>(["+","-","<<",">>",">>>","<",">","<=",">=","τinstanceof","τin","==","!=","===","!==","^","&","|","&&","?","||",")","]",":","τimport","τexport","{","τvar",";","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","~","!","τif","τdo","τwhile","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst",",","}"]).includes(v) ? 1 : 0,
(v)=>(["*","/","%","+","-","<<",">>",">>>","<",">","<=",">=","τinstanceof","τin","==","!=","===","!==","^","&","|","&&","?","||",")","]",":","τimport","τexport","{","τvar",";","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","~","!","τif","τdo","τwhile","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst",",","}"]).includes(v) ? 1 : 0,
(v)=>(["*","/","%","+","-","<<",">>",">>>","<",">","<=",">=","τinstanceof","τin","==","!=","===","!==","^","&","|","&&","?","||",")","]",":","τimport","τexport","{","τvar",";","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","~","!","τif","τdo","τwhile","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst",",","}"]).includes(v) ? 1 : 0,
(v)=>(["*","/","%","+","-","<<",">>",">>>","<",">","<=",">=","τinstanceof","τin","==","!=","===","!==","^","&","|","&&","?","||",")","]",":","τimport","τexport","{","τvar",";","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","~","!","τif","τdo","τwhile","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst",",","}","**"]).includes(v) ? 1 : 0,
(v)=>(["**","*","/","%","+","-","<<",">>",">>>","<",">","<=",">=","τinstanceof","τin","==","!=","===","!==","^","&","|","&&","?","||",")","]",":","τimport","τexport","{","τvar",";","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","~","!","τif","τdo","τwhile","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst",",","}"]).includes(v) ? 1 : 0,
(v)=>(["*","/","%","+","-","<<",">>",">>>","<",">","<=",">=","τinstanceof","τin","==","!=","===","!==","^","&","|","&&","?","||",")","]",":","τimport","τexport","{","τvar",";","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","~","!","τif","τdo","τwhile","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst",",","}"]).includes(v) ? 1 : 0,
(v)=>(["=>","(","[",".","τin","τof","=","*=","/=","%=","+=","-=","<<=",">>=",">>>=","&=","^=","|=","**=","++","--","{"]).includes(v) ? 1 : 0,
(v)=>(["=",")",",","]","}"]).includes(v) ? 1 : 0,
(v)=>(["=",")"]).includes(v) ? 1 : 0,
(v)=>(["=",")"]).includes(v) ? 1 : 0,
(v)=>(["}"]).includes(v) ? 1 : 0,
(v)=>(["}",","]).includes(v) ? 1 : 0,
(v)=>(["]",","]).includes(v) ? 1 : 0,
(v)=>(["]",","]).includes(v) ? 1 : 0,
(v)=>(["}",","]).includes(v) ? 1 : 0,
(v)=>([",",")","]","}"]).includes(v) ? 1 : 0,
(v)=>(["}",",",")","]"]).includes(v) ? 1 : 0,
(v)=>(["]",")"]).includes(v) ? 1 : 0,
(v)=>(["(","[",".","τin","τof","=","*=","/=","%=","+=","-=","<<=",">>=",">>>=","&=","^=","|=","**=","++","--","{"]).includes(v) ? 1 : 0,
(v)=>(["τimport","τexport","{","τvar",";","τthis","θid","τyield","τawait","τtrue","τfalse","τnull","θstr","θnum","[","τfunction","τclass","(","τsuper","τnew","++","--","τdelete","τvoid","τtypeof","+","-","~","!","τif","τdo","τwhile","τfor","τswitch","τcontinue","τbreak","τreturn","τwith","τthrow","τtry","τdebugger","τlet","τconst",":",".","τin","τof","=","*=","/=","%=","+=","-=","<<=",">>=",">>>=","&=","^=","|=","**="]).includes(v) ? 1 : 0,
(v)=>(["(",":","[",".","τin","τof","=","*=","/=","%=","+=","-=","<<=",">>=",">>>=","&=","^=","|=","**=","++","--","{"]).includes(v) ? 1 : 0,
(v)=>(["(","[",".","τin","τof","=","*=","/=","%=","+=","-=","<<=",">>=",">>>=","&=","^=","|=","**=","++","--","{"]).includes(v) ? 1 : 0,
(v)=>(["(","[",".","τin","τof","=","*=","/=","%=","+=","-=","<<=",">>=",">>>=","&=","^=","|=","**=","++","--","{"]).includes(v) ? 1 : 0,
(v)=>(["τas",";",":","=","(","τextends","{",")",",","τfrom","}","τin","τof","=>","[",".","*=","/=","%=","+=","-=","<<=",">>=",">>>=","&=","^=","|=","**=","++","--","]"]).includes(v) ? 1 : 0],
eh = [e,
e,
e],
gt0 = [-1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2],

sf = [(t, e, o, l, s)=>{let ln = Math.max(o.length-1,0); o[ln]=( S$0(o.slice(-1),e,l,s));o.length=ln+1;; return 5},
(t, e, o, l, s)=>1031],
rec = [0,
0,
4],
sm = [new Map([]),
new Map([["$",1]]),
new Map([["$",2]])],
state = [sm[0],
sm[1],
sm[2]],
re = new Set(["import","as","from","export","default","if","else","do","while","for","var","in","of","await","continue","break","return","with","switch","case","default","throw","try","catch","finally","debugger","let","const","function","async","class","extends","static","get","set","new","super","target","this","instanceof","delete","void","typeof","null","true","false","yield","await"]),
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

        if(fn > 0){
            r = sf[fn-1](tk, e, o, l, ss[sp-1]);
        } else {
            //Error Encountered 
            r = re[ss[sp]];
            eh[ss[sp]](tk, e, o, l, ss[sp-1]);
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
}; const js_base = parser;