export default (b)=>{

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
    e.FAILED = true;
    e.error.push(lex.copy());
}

function _(lex, e, eh, skips, ...syms) {
    
    if(e.FAILED) return "";
    
    var val = lex.tx;
   
    if (syms.length == 0 || lm(lex, syms)) {
   
        lex.next();
   
        if (skips) while (lm(lex, skips)) lex.next();
   
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

const skips = [8, 256];

const _0 = [8,256];

function $_1(l, e, s){

    if ( l.ty==2 ) {

        e.sp++;

        s.push(_(l, e, e.eh, [8,256]));

        s = $10(l, e, s);
    }

    return s;
}

function $_9(l, e, s){

    if ( l.tx==")"||l.tx==","||l.tx==";"||l.tx==">" ) {

        e.sp -= 1;

        return (e.p = 6, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $S(l, e){

    if ( e.FAILED ) return ;

    const $1_= $B(l, e);

    return $1_;
}
function $B(l, e){

    const tx = l.tx;

    if ( tx=="<" ) {

        _(l, e, e.eh, _0, "<");

        if ( e.FAILED ) return ;

        const $2_= $expression(l, e);

        _(l, e, e.eh, _0, ">");

        return ({ type:"BRACKET", val:$2_ });
    }

    if ( tx=="for" ) {

        if ( e.FAILED ) return ;

        const $1_= $for_stmt(l, e);

        return $1_;
    }

    e.FAILED = true;
}
function $for_stmt(l, e){

    _(l, e, e.eh, _0, "for");

    _(l, e, e.eh, _0, "(");

    if ( e.FAILED ) return ;

    const $3_= $const(l, e);

    if ( e.FAILED ) return ;

    const $4_= $expression(l, e);

    _(l, e, e.eh, _0, ";");

    if ( e.FAILED ) return ;

    const $6_= $expression(l, e);

    _(l, e, e.eh, _0, ")");

    if ( e.FAILED ) return ;

    const $8_= $expression(l, e);

    _(l, e, e.eh, _0, ";");

    return ({ 

        type:"FOR_CONST",

        init:$3_,

        bool:$4_,

        post:$6_,

        body:$8_
     });
}
function $const(l, e){

    _(l, e, e.eh, _0, "const");

    if ( e.FAILED ) return ;

    const $2_= $expression(l, e);

    _(l, e, e.eh, _0, ";");

    return ({ type:"CONST", val:$2_ });
}
function $add(l, e){

    if ( e.FAILED ) return ;

    const $1_= $mult(l, e);

    _(l, e, e.eh, _0, "+");

    if ( e.FAILED ) return ;

    const $3_= $add(l, e);

    return ({ type:"ADD", l:$1_, r:$3_ });

    return $2_;
}
function $mult(l, e){

    if ( e.FAILED ) return ;

    const $1_= $sym(l, e);

    _(l, e, e.eh, _0, "*");

    if ( e.FAILED ) return ;

    const $3_= $mult(l, e);

    return ({ type:"MUL", l:$1_, r:$3_ });

    return $2_;
}
function $sym(l, e){

    if ( e.FAILED ) return ;

    const $1_= $id(l, e);

    return $1_;
}
function $id(l, e){const $1_= _(l, e, e.eh, _0, 2); return $1_;}
function $num(l, e){const $1_= _(l, e, e.eh, _0, 1); return $1_;}
function $expression_list_HC_listbody3_100(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_1(l, e, s);

    
    let a= -1;
    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 10 : s = $9(l, e, s, 0); break; 

            case 9 : 

                s = $6(l, e, s, 0);

                if ( e.p<0 ) s = $7(l, e, s, 0);

                break;
             

            case 8 : s = $8(l, e, s, 0); break; 

            case 7 : s = $5(l, e, s, 0); break; 

            case 6 : s = $28(l, e, s, 0); break; 

            case 4 : s = $27(l, e, s, 0); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }
    if ( sp<=e.sp ) e.p = a;
    if ( ![4,6,7,8,9,10].includes(a) ) fail(l, e);

    return s[s.length-1];
}
function $expression_list(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_1(l, e, s);

    
    let a= -1;
    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 10 : s = $9(l, e, s, 0); break; 

            case 9 : 

                s = $6(l, e, s, 0);

                if ( e.p<0 ) s = $7(l, e, s, 0);

                break;
             

            case 8 : s = $8(l, e, s, 0); break; 

            case 7 : s = $5(l, e, s, 0); break; 

            case 6 : s = $32(l, e, s, 0); break; 

            case 5 : s = $31(l, e, s, 0); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }
    if ( sp<=e.sp ) e.p = a;
    if ( ![5,6,7,8,9,10].includes(a) ) fail(l, e);

    return s[s.length-1];
}
function $expression(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_1(l, e, s);

    
    let a= -1;
    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 10 : s = $9(l, e, s, 0); break; 

            case 9 : 

                s = $6(l, e, s, 0);

                if ( e.p<0 ) s = $7(l, e, s, 0);

                break;
             

            case 8 : s = $8(l, e, s, 0); break; 

            case 7 : s = $5(l, e, s, 0); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }
    if ( sp<=e.sp ) e.p = a;
    if ( ![6,7,8,9,10].includes(a) ) fail(l, e);

    return s[s.length-1];
}
function $5(l, e, s= []){e.p = -1; s = $_9(l, e, s); return s;}
function $6(l, e, s= []){e.p = -1; s = $_9(l, e, s); return s;}
function $7(l, e, s= []){

    e.p = -1;

    
    switch(l.tx){

        case "*" : 

            e.sp++;

            s.push(_(l, e, e.eh, [8,256]));

            s = $13(l, e, s);

            break;
         

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
function $8(l, e, s= []){

    e.p = -1;

    
    switch(l.tx){

        case "+" : 

            e.sp++;

            s.push(_(l, e, e.eh, [8,256]));

            s = $14(l, e, s);

            break;
         

        case ")" :  

        case "," :  

        case ";" :  

        case ">" : 

            e.sp -= 1;

            return (e.p = 7, (s.splice(-1, 1, s[s.length-1]), s));
        
    }

    return s;
}
function $9(l, e, s= []){

    e.p = -1;

    
    if ( l.tx==")"||l.tx=="*"||l.tx=="+"||l.tx==","||l.tx==";"||l.tx==">" ) {

        e.sp -= 1;

        return (e.p = 9, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}
function $10(l, e, s= []){

    e.p = -1;

    
    if ( l.tx==")"||l.tx=="*"||l.tx=="+"||l.tx==","||l.tx==";"||l.tx==">" ) {

        e.sp -= 1;

        return (e.p = 10, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}
function $13(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_1(l, e, s);

    
    let a= -1;
    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 10 : s = $9(l, e, s, 13); break; 

            case 9 : s = $7(l, e, s, 13); break; 

            case 8 : s = $17(l, e, s, 13); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }
    if ( sp<=e.sp ) e.p = a;
    if ( ![8].includes(a) ) fail(l, e);

    return s;
}
function $14(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_1(l, e, s);

    
    let a= -1;
    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 10 : s = $9(l, e, s, 14); break; 

            case 9 : s = $7(l, e, s, 14); break; 

            case 8 : s = $8(l, e, s, 14); break; 

            case 7 : s = $18(l, e, s, 14); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }
    if ( sp<=e.sp ) e.p = a;
    if ( ![7].includes(a) ) fail(l, e);

    return s;
}
function $17(l, e, s= []){

    e.p = -1;

    
    if ( l.tx==")"||l.tx=="+"||l.tx==","||l.tx==";"||l.tx==">" ) {

        e.sp -= 3;

        const sym= s.slice(-3);

        s.splice(-3, 3, { type:"MUL", l:sym[0], r:sym[2] });

        return (e.p = 8, s);
    }

    return s;
}
function $18(l, e, s= []){

    e.p = -1;

    
    if ( l.tx==")"||l.tx==","||l.tx==";"||l.tx==">" ) {

        e.sp -= 3;

        const sym= s.slice(-3);

        s.splice(-3, 3, { type:"ADD", l:sym[0], r:sym[2] });

        return (e.p = 7, s);
    }

    return s;
}
function $27(l, e, s= []){

    e.p = -1;

    
    if ( l.tx=="," ) {

        e.sp++;

        s.push(_(l, e, e.eh, [8,256]));

        s = $29(l, e, s);
    }

    return s;
}
function $28(l, e, s= []){

    e.p = -1;

    
    if ( l.tx=="," ) {

        e.sp -= 1;

        const sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return (e.p = 4, s);
    }

    return s;
}
function $29(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_1(l, e, s);

    
    let a= -1;
    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 10 : s = $9(l, e, s, 29); break; 

            case 9 : 

                s = $6(l, e, s, 29);

                if ( e.p<0 ) s = $7(l, e, s, 29);

                break;
             

            case 8 : s = $8(l, e, s, 29); break; 

            case 7 : s = $5(l, e, s, 29); break; 

            case 6 : s = $30(l, e, s, 29); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }
    if ( sp<=e.sp ) e.p = a;
    if ( ![4].includes(a) ) fail(l, e);

    return s;
}
function $30(l, e, s= []){

    e.p = -1;

    
    if ( l.tx=="," ) {

        e.sp -= 3;

        const sym= s.slice(-3);

        s.splice(-3, 3, ([...sym[0],sym[2]]));

        return (e.p = 4, s);
    }

    return s;
}
function $31(l, e, s= []){

    e.p = -1;

    
    if ( l.tx=="," ) {

        e.sp++;

        s.push(_(l, e, e.eh, [8,256]));

        s = $33(l, e, s);
    }

    return s;
}
function $32(l, e, s= []){

    e.p = -1;

    
    if ( l.tx=="," ) {

        e.sp -= 1;

        const sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return (e.p = 5, s);
    }

    return s;
}
function $33(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_1(l, e, s);

    
    let a= -1;
    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 10 : s = $9(l, e, s, 33); break; 

            case 9 : 

                s = $6(l, e, s, 33);

                if ( e.p<0 ) s = $7(l, e, s, 33);

                break;
             

            case 8 : s = $8(l, e, s, 33); break; 

            case 7 : s = $5(l, e, s, 33); break; 

            case 6 : s = $34(l, e, s, 33); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }
    if ( sp<=e.sp ) e.p = a;
    if ( ![5].includes(a) ) fail(l, e);

    return s;
}
function $34(l, e, s= []){

    e.p = -1;

    
    if ( l.tx=="," ) {

        e.sp -= 3;

        const sym= s.slice(-3);

        s.splice(-3, 3, ([...sym[0],sym[2]]));

        return (e.p = 5, s);
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
$expression_list,
$expression,
$5,
$6,
$7,
$8,
$9,
$10,
$13,
$14,
$17,
$18,
$27,
$28,
$29,
$30,
$31,
$32,
$33,
$34})
}