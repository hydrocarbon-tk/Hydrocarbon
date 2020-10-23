export default (b)=>{
            const pos = null;
            
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
            
            function _s(s, lex, e, eh, skips, ...syms) {
                
                if(e.FAILED) return "";
                
                var val = lex.tx;
               
                if (syms.length == 0 || lm(lex, syms)) {
               
                    lex.next();
               
                    if (skips) while (lm(lex, skips)) lex.next();
               
                    e.sp++;
            
                    s.push(val);
                    
                } else {
               
                    //error recovery
                    const tx = eh(lex, e);
            
               
                    if(!tx){
                        if(e.FAILED) console.log("_______________________________a")
                        e.FAILED = true;
                        e.error.push(lex.copy());
                    }
                }
            
                return s;
            }
            
            
            function _(lex, e, eh, skips, ...syms) {

                if(e.FAILED) return "";
                
                var val = lex.tx;

                if(e.FAILED) console.log("_______________________________a")
               
                if (syms.length == 0 || lm(lex, syms)) {
               
                    lex.next();
               
                    if (skips) while (lm(lex, skips)) lex.next();
               
                    return val;
                } else {
               
                    //error recovery
                    const tx = eh(lex, e);
               
                    if(tx) return tx;
               
                    else {
                        if(e.FAILED) console.log("_______________________________b")
                        e.FAILED = true;
                        e.error.push(lex.copy());
                    }
                }
            }
            
            const skips = [8, 256];
            
            const _0 = [8,256],_1 = [","],_2 = [")",",",";",">"],_3 = [")","*","+",",",";",">"],_4 = [2];
            
            function $_3(l, e, s){

    if ( _2.includes(l.tx) ) {

        e.sp -= 1;

        return (e.p = 6, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $_8(l, e, s){

    if ( _4.includes(l.ty) ) {s.push($id(l, e));}

    return s;
}
            
            function $S(l, e){

    if ( e.FAILED ) return ;

    const $1_= $B(l, e);

    e.p = (e.FAILED)?-1:0;

    return $1_;
}
function $B(l, e){

    const tx = l.tx;

    if ( tx=="<" ) {

        _(l, e, e.eh, [8,256], "<");

        if ( e.FAILED ) return ;

        const $2_= $expression(l, e);

        _(l, e, e.eh, [8,256], ">");

        e.p = (e.FAILED)?-1:1;

        return ({ type:"BRACKET", val:$2_ });
    }

    if ( tx=="for" ) {

        if ( e.FAILED ) return ;

        const $1_= $for_stmt(l, e);

        e.p = (e.FAILED)?-1:1;

        return $1_;
    }

    e.FAILED = true;
}
function $for_stmt(l, e){

    _(l, e, e.eh, [8,256], "for");

    _(l, e, e.eh, [8,256], "(");

    if ( e.FAILED ) return ;

    const $3_= $const(l, e);

    if ( e.FAILED ) return ;

    const $4_= $expression(l, e);

    _(l, e, e.eh, [8,256], ";");

    if ( e.FAILED ) return ;

    const $6_= $expression(l, e);

    _(l, e, e.eh, [8,256], ")");

    if ( e.FAILED ) return ;

    const $8_= $expression(l, e);

    _(l, e, e.eh, [8,256], ";");

    e.p = (e.FAILED)?-1:2;

    return ({ 

        type:"FOR_CONST",

        init:$3_,

        bool:$4_,

        post:$6_,

        body:$8_
     });
}
function $const(l, e){

    _(l, e, e.eh, [8,256], "const");

    if ( e.FAILED ) return ;

    const $2_= $expression(l, e);

    _(l, e, e.eh, [8,256], ";");

    e.p = (e.FAILED)?-1:3;

    return ({ type:"CONST", val:$2_ });
}
;
;
;
function $add(l, e){

    if ( e.FAILED ) return ;

    const $1_= $mult(l, e);

    const tx = l.tx;

    if ( tx=="+" ) {

        _(l, e, e.eh, [8,256], "+");

        if ( e.FAILED ) return ;

        const $3_= $add(l, e);

        e.p = (e.FAILED)?-1:7;

        return ({ type:"ADD", l:$1_, r:$3_ });
    }

    e.p = (e.FAILED)?-1:7;

    return $1_;
}
function $mult(l, e){

    if ( e.FAILED ) return ;

    const $1_= $sym(l, e);

    const tx = l.tx;

    if ( tx=="*" ) {

        _(l, e, e.eh, [8,256], "*");

        if ( e.FAILED ) return ;

        const $3_= $mult(l, e);

        e.p = (e.FAILED)?-1:8;

        return ({ type:"MUL", l:$1_, r:$3_ });
    }

    e.p = (e.FAILED)?-1:8;

    return $1_;
}
function $sym(l, e){

    if ( e.FAILED ) return ;

    const $1_= $id(l, e);

    e.p = (e.FAILED)?-1:9;

    return $1_;
}
function $id(l, e){

    const $1_= _(l, e, e.eh, [8,256], 2);

    e.p = (e.FAILED)?-1:10;

    return $1_;
}
function $num(l, e){

    const $1_= _(l, e, e.eh, [8,256], 1);

    e.p = (e.FAILED)?-1:11;

    return $1_;
}
function $expression_list_HC_listbody3_100(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    
    switch(l.tx){

        case "*" : s = $14(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "+" : s = $15(l, e, _s(s, l, e, e.eh, _0)); break; 

        default : switch(l.ty){case 2 : s.push($id(l, e)); break;}
    }

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 10 : s = $7(l, e, s); break; 

            case 9 : 

                s = $4(l, e, s);

                if ( e.p<0 ) s = $5(l, e, s);

                break;
             

            case 8 : 

                s = $6(l, e, s);

                if ( e.p<0 ) s = $18(l, e, s);

                break;
             

            case 7 : 

                s = $3(l, e, s);

                if ( e.p<0 ) s = $19(l, e, s);

                break;
             

            case 6 : s = $2(l, e, s); break; 

            case 4 : s = $1(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![4].includes(a) ) fail(l, e);

    return s;
}
function $1(l, e, s= []){

    e.p = -1;

    
    if ( _1.includes(l.tx) ) {return $13(l, e, _s(s, l, e, e.eh, _0));}

    return s;
}
function $2(l, e, s= []){

    e.p = -1;

    
    if ( _1.includes(l.tx) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return (e.p = 4, s);
    }

    return s;
}
function $3(l, e, s= []){e.p = -1; s = $_3(l, e, s); return s;}
function $4(l, e, s= []){e.p = -1; s = $_3(l, e, s); return s;}
function $5(l, e, s= []){

    e.p = -1;

    
    switch(l.tx){

        case "*" : return $14(l, e, _s(s, l, e, e.eh, _0)); 

        case ")" :  

        case "+" :  

        case "," :  

        case ";" :  

        case ">" : 

            e.sp -= 1;

            return (e.p = 8, (s.splice(-1, 1, s[s.length-1]), s));
        
    }

    return s;
}
function $6(l, e, s= []){

    e.p = -1;

    
    switch(l.tx){

        case "+" : return $15(l, e, _s(s, l, e, e.eh, _0)); 

        case ")" :  

        case "," :  

        case ";" :  

        case ">" : 

            e.sp -= 1;

            return (e.p = 7, (s.splice(-1, 1, s[s.length-1]), s));
        
    }

    return s;
}
function $7(l, e, s= []){

    e.p = -1;

    
    if ( _3.includes(l.tx) ) {

        e.sp -= 1;

        return (e.p = 9, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}
function $expression_list(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_8(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 10 : s = $7(l, e, s); break; 

            case 9 : 

                s = $4(l, e, s);

                if ( e.p<0 ) s = $5(l, e, s);

                break;
             

            case 8 : s = $6(l, e, s); break; 

            case 7 : s = $3(l, e, s); break; 

            case 6 : s = $11(l, e, s); break; 

            case 5 : s = $10(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![5].includes(a) ) fail(l, e);

    return s;
}
function $10(l, e, s= []){

    e.p = -1;

    
    if ( _1.includes(l.tx) ) {return $16(l, e, _s(s, l, e, e.eh, _0));}

    return s;
}
function $11(l, e, s= []){

    e.p = -1;

    
    if ( _1.includes(l.tx) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return (e.p = 5, s);
    }

    return s;
}
function $expression(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_8(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 10 : s = $7(l, e, s); break; 

            case 9 : 

                s = $4(l, e, s);

                if ( e.p<0 ) s = $5(l, e, s);

                break;
             

            case 8 : s = $6(l, e, s); break; 

            case 7 : s = $3(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![6].includes(a) ) fail(l, e);

    return s;
}
function $13(l, e, s= []){s.push($expression(l, e, s)); e.sp++; return s;}
function $14(l, e, s= []){

    s.push($mult(l, e, s));

    e.sp++;

    s = $18(l, e, s);

    return s;
}
function $15(l, e, s= []){

    s.push($add(l, e, s));

    e.sp++;

    s = $19(l, e, s);

    return s;
}
function $16(l, e, s= []){s.push($expression(l, e, s)); e.sp++; return s;}
function $18(l, e, s= []){

    e.p = -1;

    
    if ( [")","+",",",";",">"].includes(l.tx) ) {

        e.sp -= 3;

        var sym= s.slice(-3);

        s.splice(-3, 3, { type:"MUL", l:sym[0], r:sym[2] });

        return (e.p = 8, s);
    }

    return s;
}
function $19(l, e, s= []){

    e.p = -1;

    
    if ( _2.includes(l.tx) ) {

        e.sp -= 3;

        var sym= s.slice(-3);

        s.splice(-3, 3, { type:"ADD", l:sym[0], r:sym[2] });

        return (e.p = 7, s);
    }

    return s;
}
            
            
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
                _(lexer, env, env.eh,skips)
                const result = $S(lexer, env);
                
                if (!lexer.END || (env.FAILED )) {
            
                        const error_lex = env.error.concat(lexer).sort((a,b)=>a.off-b.off).pop();
                        error_lex.throw(`Unexpected token [${error_lex.tx}]`);
                    
                }
                return result;
            }, {$S,
$B,
$for_stmt,
$const,
$add,
$mult,
$sym,
$id,
$num,
$expression_list_HC_listbody3_100,
$1,
$2,
$3,
$4,
$5,
$6,
$7,
$expression_list,
$10,
$11,
$expression,
$13,
$14,
$15,
$16,
$18,
$19})
            }