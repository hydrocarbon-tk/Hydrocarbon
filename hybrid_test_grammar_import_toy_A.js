export default (b)=>{
            let action_array = [], mark_= 0;

            //Inline
            function mark (){
               mark_ = action_array.length;
               return mark_;
            }

            //Inline
            function reset(mark){
                action_array.length = mark;
            }
            
            //Inline
            function add_skip(char_len){
                const ACTION = 2;
                const val = ACTION | (char_len << 2);
                action_array.push(val);
            }

            //Inline
            function add_shift(char_len){
                if(char_len < 1) return;
                const ACTION = 1;
                const val = ACTION | (char_len << 2);
                action_array.push(val);
            }

            //Inline
            function add_reduce(sym_len, body){
                const ACTION = 0;
                const val = ACTION | ((sym_len & 0x3FFF )<< 2) | (body << 16);
                action_array.push(val);
            }
            
            
            function lm(lex, syms) { 
                for (const sym of syms) 
                    switch (typeof sym) {
                        case "number":
                            if (sym == 0xFF && lex.END) return true;  
                            if (lex.ty == sym) return true; 
                            break;
                        case "string":
                            if (lex.tx == sym) return true
                            break;
                    }
                return false;
            }
            
            function fail(lex, e) { 


                if(e.FAILED) console.log("_______________________________")
                e.FAILED = true;
                e.error.push(lex.copy());
            }
            
            function _(lex, e, eh, skips, ...syms) {

                if(e.FAILED) return "";
                
                var val = lex.tx;
               
                if (syms.length == 0 || lm(lex, syms)) {
                    
                    add_shift(val.length);

                    lex.next();
               
                    const off = lex.off;
               
                    if (skips) while (lm(lex, skips)) lex.next();

                    const diff = lex.off-off;

                    if(diff > 0) add_skip(diff);
               
                    return val;
                } else {
               
                    //error recovery
                    const tx = eh(lex, e);
               
                    if(tx) return tx;
               
                    else {
                        e.FAILED = true;
                        e.error.push(lex.copy());
                    }
                }
            }
            
    
            function $S(l, e){

if(e.FAILED) return;
$B(l, e)
e.p = (e.FAILED) ? -1 : 0

add_reduce(1,0);
return;
e.FAILED = true
}
function $B(l, e){
const tx = l.tx ;
if(tx == "<"){

_(l, e, e.eh, [8,256], "<");

if(e.FAILED) return;
$expression(l, e)

_(l, e, e.eh, [8,256], ">");
e.p = (e.FAILED) ? -1 : 1

add_reduce(3,1);
return;
}
if(tx == "for"){

if(e.FAILED) return;
$for_stmt(l, e)
e.p = (e.FAILED) ? -1 : 1

add_reduce(1,2);
return;
}
e.FAILED = true
}
function $for_stmt(l, e){

_(l, e, e.eh, [8,256], "for");

_(l, e, e.eh, [8,256], "(");

if(e.FAILED) return;
$const(l, e)

if(e.FAILED) return;
$expression(l, e)

_(l, e, e.eh, [8,256], ";");

if(e.FAILED) return;
$expression(l, e)

_(l, e, e.eh, [8,256], ")");

if(e.FAILED) return;
$expression(l, e)

_(l, e, e.eh, [8,256], ";");
e.p = (e.FAILED) ? -1 : 2

add_reduce(9,3);
return;
e.FAILED = true
}
function $const(l, e){

_(l, e, e.eh, [8,256], "const");

if(e.FAILED) return;
$expression(l, e)

_(l, e, e.eh, [8,256], ";");
e.p = (e.FAILED) ? -1 : 3

add_reduce(3,4);
return;
e.FAILED = true
}
"LR USE FOR expression_list_HC_listbody3_100,expression_list_HC_listbody3_100"
"LR USE FOR expression_list,expression_list"
"LR USE FOR expression,expression"
function $add(l, e){

if(e.FAILED) return;
$mult(l, e)
const tx = l.tx ;
if(tx == "+"){

_(l, e, e.eh, [8,256], "+");

if(e.FAILED) return;
$add(l, e)
e.p = (e.FAILED) ? -1 : 7

add_reduce(3,11);
return;
}
e.p = (e.FAILED) ? -1 : 7

add_reduce(1,12);
return;
e.FAILED = true
}
function $mult(l, e){

if(e.FAILED) return;
$sym(l, e)
const tx = l.tx ;
if(tx == "*"){

_(l, e, e.eh, [8,256], "*");

if(e.FAILED) return;
$mult(l, e)
e.p = (e.FAILED) ? -1 : 8

add_reduce(3,13);
return;
}
e.p = (e.FAILED) ? -1 : 8

add_reduce(1,14);
return;
e.FAILED = true
}
function $sym(l, e){

if(e.FAILED) return;
$id(l, e)
e.p = (e.FAILED) ? -1 : 9

add_reduce(1,15);
return;
e.FAILED = true
}
function $id(l, e){

_(l, e, e.eh, [8,256], 2);
e.p = (e.FAILED) ? -1 : 10

add_reduce(1,16);
return;
e.FAILED = true
}
function $num(l, e){

_(l, e, e.eh, [8,256], 1);
e.p = (e.FAILED) ? -1 : 11

add_reduce(1,17);
return;
e.FAILED = true
}
function $expression_list_HC_listbody3_100(l, e){
const sp = e.sp;
e.p = -1;
switch(l.tx){
case "*": 
_(l, e, e.eh, [8,256]); e.sp++;
State14(l, e)
break;
case "+": 
_(l, e, e.eh, [8,256]); e.sp++;
State15(l, e)
 default : 
switch(l.ty){
case 2: 
_(l, e, e.eh, [8,256]); e.sp++;
State8(l, e)
break;
}
break;
}
let a = e.p;
o: while(1){  
if(sp > e.sp) break; else e.sp += 1;
e.p = -1;
switch(a) { 
case 10:
State7(l, e)
 break;
case 9:
State4(l, e)
if(e.p < 0)
State5(l, e)
else break;
 break;
case 8:
State6(l, e)
if(e.p < 0)
State18(l, e)
else break;
 break;
case 7:
State3(l, e)
if(e.p < 0)
State19(l, e)
else break;
 break;
case 6:
State2(l, e)
 break;
case 4:
State1(l, e)
 break;
default: break o;
}
if(e.p >= 0) a = e.p;
}
if(sp <= e.sp) e.p = a;
if(![4].includes(a))fail(l,e);
}
function State1(l, e){
e.p = -1;
if([","].includes(l.tx)){
_(l, e, e.eh, [8,256]); e.sp++;
return State13(l, e)
}
}
function State2(l, e){
e.p = -1;
if([","].includes(l.tx)){
e.sp -= 1 
add_reduce(1,6);
e.p = 4
return;
}
}
function State3(l, e){
e.p = -1;
if([")",",",";",">"].includes(l.tx)){
e.sp -= 1 
add_reduce(1,9);
e.p = 6
return;
}
}
function State4(l, e){
e.p = -1;
if([")",",",";",">"].includes(l.tx)){
e.sp -= 1 
add_reduce(1,10);
e.p = 6
return;
}
}
function State5(l, e){
e.p = -1;
switch(l.tx){
case "*": 
_(l, e, e.eh, [8,256]); e.sp++;
return State14(l, e)
case ")": 
case "+": 
case ",": 
case ";": 
case ">": 
e.sp -= 1 
add_reduce(1,14);
e.p = 8
return;
}
}
function State6(l, e){
e.p = -1;
switch(l.tx){
case "+": 
_(l, e, e.eh, [8,256]); e.sp++;
return State15(l, e)
case ")": 
case ",": 
case ";": 
case ">": 
e.sp -= 1 
add_reduce(1,12);
e.p = 7
return;
}
}
function State7(l, e){
e.p = -1;
if([")","*","+",",",";",">"].includes(l.tx)){
e.sp -= 1 
add_reduce(1,15);
e.p = 9
return;
}
}
function State8(l, e){
e.p = -1;
if([")","*","+",",",";",">"].includes(l.tx)){
e.sp -= 1 
add_reduce(1,16);
e.p = 10
return;
}
}
function $expression_list(l, e){
const sp = e.sp;
e.p = -1;
if([2].includes(l.ty)){
_(l, e, e.eh, [8,256]); e.sp++;
State8(l, e)
}
let a = e.p;
o: while(1){  
if(sp > e.sp) break; else e.sp += 1;
e.p = -1;
switch(a) { 
case 10:
State7(l, e)
 break;
case 9:
State4(l, e)
if(e.p < 0)
State5(l, e)
else break;
 break;
case 8:
State6(l, e)
 break;
case 7:
State3(l, e)
 break;
case 6:
State11(l, e)
 break;
case 5:
State10(l, e)
 break;
default: break o;
}
if(e.p >= 0) a = e.p;
}
if(sp <= e.sp) e.p = a;
if(![5].includes(a))fail(l,e);
}
function State10(l, e){
e.p = -1;
if([","].includes(l.tx)){
_(l, e, e.eh, [8,256]); e.sp++;
return State16(l, e)
}
}
function State11(l, e){
e.p = -1;
if([","].includes(l.tx)){
e.sp -= 1 
add_reduce(1,8);
e.p = 5
return;
}
}
function $expression(l, e){
const sp = e.sp;
e.p = -1;
if([2].includes(l.ty)){
_(l, e, e.eh, [8,256]); e.sp++;
State8(l, e)
}
let a = e.p;
o: while(1){  
if(sp > e.sp) break; else e.sp += 1;
e.p = -1;
switch(a) { 
case 10:
State7(l, e)
 break;
case 9:
State4(l, e)
if(e.p < 0)
State5(l, e)
else break;
 break;
case 8:
State6(l, e)
 break;
case 7:
State3(l, e)
 break;
default: break o;
}
if(e.p >= 0) a = e.p;
}
if(sp <= e.sp) e.p = a;
if(![6].includes(a))fail(l,e);
}
function State13(l, e){
const sp = e.sp;
e.p = -1;
if([2].includes(l.ty)){
_(l, e, e.eh, [8,256]); e.sp++;
State8(l, e)
}
let a = e.p;
o: while(1){  
if(sp > e.sp) break; else e.sp += 1;
e.p = -1;
switch(a) { 
case 10:
State7(l, e)
 break;
case 9:
State4(l, e)
if(e.p < 0)
State5(l, e)
else break;
 break;
case 8:
State6(l, e)
 break;
case 7:
State3(l, e)
 break;
case 6:
State17(l, e)
 break;
default: break o;
}
if(e.p >= 0) a = e.p;
}
if(sp <= e.sp) e.p = a;
if(![4].includes(a))fail(l,e);
}
function State14(l, e){
$mult(l, e)
e.sp++
State18(l,e);
}
function State15(l, e){
$add(l, e)
e.sp++
State19(l,e);
}
function State16(l, e){
const sp = e.sp;
e.p = -1;
if([2].includes(l.ty)){
_(l, e, e.eh, [8,256]); e.sp++;
State8(l, e)
}
let a = e.p;
o: while(1){  
if(sp > e.sp) break; else e.sp += 1;
e.p = -1;
switch(a) { 
case 10:
State7(l, e)
 break;
case 9:
State4(l, e)
if(e.p < 0)
State5(l, e)
else break;
 break;
case 8:
State6(l, e)
 break;
case 7:
State3(l, e)
 break;
case 6:
State20(l, e)
 break;
default: break o;
}
if(e.p >= 0) a = e.p;
}
if(sp <= e.sp) e.p = a;
if(![5].includes(a))fail(l,e);
}
function State17(l, e){
e.p = -1;
if([","].includes(l.tx)){
e.sp -= 3 
add_reduce(3,5);
e.p = 4
return;
}
}
function State18(l, e){
e.p = -1;
if([")","+",",",";",">"].includes(l.tx)){
e.sp -= 3 
add_reduce(3,13);
e.p = 8
return;
}
}
function State19(l, e){
e.p = -1;
if([")",",",";",">"].includes(l.tx)){
e.sp -= 3 
add_reduce(3,11);
e.p = 7
return;
}
}
function State20(l, e){
e.p = -1;
if([","].includes(l.tx)){
e.sp -= 3 
add_reduce(3,7);
e.p = 5
return;
}
}

            const fns = [
,sym=>( {type:"BRACKET",val:sym[1]})
,
,sym=>( {type:"FOR_CONST",init:sym[2],bool:sym[3],post:sym[5],body:sym[7]})
,sym=>( {type:"CONST",val:sym[1]})
,sym=>( ([...sym[0],sym[2]]))
,sym=>( [sym[0]])
,sym=>( ([...sym[0],sym[2]]))
,sym=>( [sym[0]])
,
,
,sym=>( {type:"ADD",l:sym[0],r:sym[2]})
,
,sym=>( {type:"MUL",l:sym[0],r:sym[2]})
,
,
,
,];
            
            return Object.assign( function (lexer, env = {
                error: [],
                eh: (lex, e) => { },
                sp:0,
                asi: (lex, env, s) => { }
            }) {
                
                env.FAILED = false;
                const states = [];
                lexer.IWS = false;
                lexer.PARSE_STRING = true;
                
                lexer.tl = 0;
            
                env.fn =  {
                    parseString(lex, env, symbols, LR){
                        const copy = lex.copy();
                        while(lex.tx != '"' && !lex.END){
                            if(lex.tx == "\\") lex.next();
                            lex.next();
                        } 
                        symbols[LR ? symbols.length-1 : 0] = lex.slice(copy)
                    }
                }
                _(lexer, env, env.eh,[])
                const result = $S(lexer, env);
                
                if (!lexer.END || (env.FAILED )) {
            
                        const error_lex = env.error.concat(lexer).sort((a,b)=>a.off-b.off).pop();
                        error_lex.throw(`Unexpected token [${error_lex.tx}]`);
                    
                }else{
                    //Build out the productions
                  
            const stack = [], str = lexer.str;
            let offset = 0;
            for(const action of action_array){
                switch(action&3){
                    case 0: //REDUCE;
                        var body = action>>16;

                        var len = ((action&0xFFFF) >> 2);

                        const fn = fns[body];

                        if(fn)
                            stack[stack.length-len] = fn(stack.slice(-len));
                        else if(len > 1)
                            stack[stack.length-len] = stack[stack.length-1];
                        
                        stack.length = stack.length-len+1;

                        break;
                    case 1: //SHIFT;
                        var len = action >> 2;
                        stack.push(str.slice(offset, offset+len));
                        offset+=len;
                        break;
                    case 2: //SKIP;
                        var len = action >> 2;
                        offset+=len;
                        break;
                }
            }
            return stack[0];

            console.log(stack)


                    console.log(action_array.map(i=>{
                        const action = ["REDUCE", "SHIFT", "SKIP"][i&3];
                        const body = (action == "REDUCE") ? ":"+(i>>16) : "";
                        const len = (action == "SHIFT" || action == "SKIP")  ? i >> 2 : ((i&0xFFFF) >> 2)
                        return `${ action }:${len}${body}`
                    }))
                }
                return result;
            })
            }