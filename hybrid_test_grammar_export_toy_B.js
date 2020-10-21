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

        s = $8(l, e, s);
    }

    return s;
}

function $_7(l, e, s){

    if ( l.END||l.tx=="," ) {

        e.sp -= 1;

        return (e.p = 3, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $S(l, e){

    if ( e.FAILED ) return ;

    const $1_= $expression_list(l, e);

    return $1_;
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
function $expression_list_HC_listbody1_100(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_1(l, e, s);

    
    let a= -1;
    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 7 : s = $7(l, e, s, 0); break; 

            case 6 : 

                s = $4(l, e, s, 0);

                if ( e.p<0 ) s = $5(l, e, s, 0);

                break;
             

            case 5 : s = $6(l, e, s, 0); break; 

            case 4 : s = $3(l, e, s, 0); break; 

            case 3 : s = $16(l, e, s, 0); break; 

            case 1 : s = $15(l, e, s, 0); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }
    if ( sp<=e.sp ) e.p = a;
    if ( ![1,3,4,5,6,7].includes(a) ) fail(l, e);

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

            case 7 : s = $7(l, e, s, 0); break; 

            case 6 : 

                s = $4(l, e, s, 0);

                if ( e.p<0 ) s = $5(l, e, s, 0);

                break;
             

            case 5 : s = $6(l, e, s, 0); break; 

            case 4 : s = $3(l, e, s, 0); break; 

            case 3 : s = $2(l, e, s, 0); break; 

            case 2 : s = $1(l, e, s, 0); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }
    if ( sp<=e.sp ) e.p = a;
    if ( ![2,3,4,5,6,7].includes(a) ) fail(l, e);

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

            case 7 : s = $7(l, e, s, 0); break; 

            case 6 : 

                s = $4(l, e, s, 0);

                if ( e.p<0 ) s = $5(l, e, s, 0);

                break;
             

            case 5 : s = $6(l, e, s, 0); break; 

            case 4 : s = $3(l, e, s, 0); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }
    if ( sp<=e.sp ) e.p = a;
    if ( ![3,4,5,6,7].includes(a) ) fail(l, e);

    return s[s.length-1];
}
function $1(l, e, s= []){

    e.p = -1;

    
    if ( l.tx=="," ) {

        e.sp++;

        s.push(_(l, e, e.eh, [8,256]));

        s = $9(l, e, s);
    }

    return s;
}
function $2(l, e, s= []){

    e.p = -1;

    
    if ( l.END||l.tx=="," ) {

        e.sp -= 1;

        const sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return (e.p = 2, s);
    }

    return s;
}
function $3(l, e, s= []){e.p = -1; s = $_7(l, e, s); return s;}
function $4(l, e, s= []){e.p = -1; s = $_7(l, e, s); return s;}
function $5(l, e, s= []){

    e.p = -1;

    
    if ( l.END ) {

        e.sp -= 1;

        return (e.p = 5, (s.splice(-1, 1, s[s.length-1]), s));

        switch(l.tx){

            case "*" : 

                e.sp++;

                s.push(_(l, e, e.eh, [8,256]));

                s = $10(l, e, s);

                break;
             

            case "+" :  

            case "," : 

                e.sp -= 1;

                return (e.p = 5, (s.splice(-1, 1, s[s.length-1]), s));
            
        }
    }
    {

        e.sp -= 1;

        return (e.p = 5, (s.splice(-1, 1, s[s.length-1]), s));

        switch(l.tx){

            case "*" : 

                e.sp++;

                s.push(_(l, e, e.eh, [8,256]));

                s = $10(l, e, s);

                break;
             

            case "+" :  

            case "," : 

                e.sp -= 1;

                return (e.p = 5, (s.splice(-1, 1, s[s.length-1]), s));
            
        }
    }

    return s;
}
function $6(l, e, s= []){

    e.p = -1;

    
    if ( l.END ) {

        e.sp -= 1;

        return (e.p = 4, (s.splice(-1, 1, s[s.length-1]), s));

        switch(l.tx){

            case "+" : 

                e.sp++;

                s.push(_(l, e, e.eh, [8,256]));

                s = $11(l, e, s);

                break;
             

            case "," : 

                e.sp -= 1;

                return (e.p = 4, (s.splice(-1, 1, s[s.length-1]), s));
            
        }
    }
    {

        e.sp -= 1;

        return (e.p = 4, (s.splice(-1, 1, s[s.length-1]), s));

        switch(l.tx){

            case "+" : 

                e.sp++;

                s.push(_(l, e, e.eh, [8,256]));

                s = $11(l, e, s);

                break;
             

            case "," : 

                e.sp -= 1;

                return (e.p = 4, (s.splice(-1, 1, s[s.length-1]), s));
            
        }
    }

    return s;
}
function $7(l, e, s= []){

    e.p = -1;

    
    if ( l.END||l.tx=="*"||l.tx=="+"||l.tx=="," ) {

        e.sp -= 1;

        return (e.p = 6, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}
function $8(l, e, s= []){

    e.p = -1;

    
    if ( l.END||l.tx=="*"||l.tx=="+"||l.tx=="," ) {

        e.sp -= 1;

        return (e.p = 7, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}
function $9(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_1(l, e, s);

    
    let a= -1;
    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 7 : s = $7(l, e, s, 9); break; 

            case 6 : 

                s = $4(l, e, s, 9);

                if ( e.p<0 ) s = $5(l, e, s, 9);

                break;
             

            case 5 : s = $6(l, e, s, 9); break; 

            case 4 : s = $3(l, e, s, 9); break; 

            case 3 : s = $12(l, e, s, 9); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }
    if ( sp<=e.sp ) e.p = a;
    if ( ![2].includes(a) ) fail(l, e);

    return s;
}
function $10(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_1(l, e, s);

    
    let a= -1;
    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 7 : s = $7(l, e, s, 10); break; 

            case 6 : s = $5(l, e, s, 10); break; 

            case 5 : s = $13(l, e, s, 10); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }
    if ( sp<=e.sp ) e.p = a;
    if ( ![5].includes(a) ) fail(l, e);

    return s;
}
function $11(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_1(l, e, s);

    
    let a= -1;
    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 7 : s = $7(l, e, s, 11); break; 

            case 6 : s = $5(l, e, s, 11); break; 

            case 5 : s = $6(l, e, s, 11); break; 

            case 4 : s = $14(l, e, s, 11); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }
    if ( sp<=e.sp ) e.p = a;
    if ( ![4].includes(a) ) fail(l, e);

    return s;
}
function $12(l, e, s= []){

    e.p = -1;

    
    if ( l.END||l.tx=="," ) {

        e.sp -= 3;

        const sym= s.slice(-3);

        s.splice(-3, 3, ([...sym[0],sym[2]]));

        return (e.p = 2, s);
    }

    return s;
}
function $13(l, e, s= []){

    e.p = -1;

    
    if ( l.END||l.tx=="+"||l.tx=="," ) {

        e.sp -= 3;

        const sym= s.slice(-3);

        s.splice(-3, 3, { type:"MUL", l:sym[0], r:sym[2] });

        return (e.p = 5, s);
    }

    return s;
}
function $14(l, e, s= []){

    e.p = -1;

    
    if ( l.END||l.tx=="," ) {

        e.sp -= 3;

        const sym= s.slice(-3);

        s.splice(-3, 3, { type:"ADD", l:sym[0], r:sym[2] });

        return (e.p = 4, s);
    }

    return s;
}
function $15(l, e, s= []){

    e.p = -1;

    
    if ( l.tx=="," ) {

        e.sp++;

        s.push(_(l, e, e.eh, [8,256]));

        s = $17(l, e, s);
    }

    return s;
}
function $16(l, e, s= []){

    e.p = -1;

    
    if ( l.tx=="," ) {

        e.sp -= 1;

        const sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return (e.p = 1, s);
    }

    return s;
}
function $17(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_1(l, e, s);

    
    let a= -1;
    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 7 : s = $7(l, e, s, 17); break; 

            case 6 : 

                s = $4(l, e, s, 17);

                if ( e.p<0 ) s = $5(l, e, s, 17);

                break;
             

            case 5 : s = $6(l, e, s, 17); break; 

            case 4 : s = $3(l, e, s, 17); break; 

            case 3 : s = $18(l, e, s, 17); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }
    if ( sp<=e.sp ) e.p = a;
    if ( ![1].includes(a) ) fail(l, e);

    return s;
}
function $18(l, e, s= []){

    e.p = -1;

    
    if ( l.tx=="," ) {

        e.sp -= 3;

        const sym= s.slice(-3);

        s.splice(-3, 3, ([...sym[0],sym[2]]));

        return (e.p = 1, s);
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
$add,
$mult,
$sym,
$id,
$num,
$expression_list_HC_listbody1_100,
$expression_list,
$expression,
$1,
$2,
$3,
$4,
$5,
$6,
$7,
$8,
$9,
$10,
$11,
$12,
$13,
$14,
$15,
$16,
$17,
$18})
}