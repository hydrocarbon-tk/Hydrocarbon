
function createPos(lex, off){
    const copy = lex.copy;
    copy.off = lex.next;
    copy.fence(lex);
    return copy;
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
    e.FAILED = true;
    e.error.push(lex.copy());
}


function lm_ty(lex, syms) {for (const sym of syms)  if (sym == 0xFF && lex.END) return true;  else if (lex.ty == sym) return true; return false;}

function lm_tx(lex, syms) {  for (const sym of syms) if (lex.tx == sym) return true; return false; }
    
function _(lex, e, eh, skips, ...syms) {
    if (syms.length == 0 || lm(lex, syms)) {
        const val = lex.tx;
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
        //else lex.throw(`Could not parse unexpected token ${lex.END ? "EOI" : lex.tx }`);
}
}

function $_0(lex, e, s, sp){

    switch(lex.tx){

        case "(" : 

            var cp= lex.copy(),_s= null;

            e.sp++;

            _s = s.slice();

            _s.push(_(cp, e, e.eh, [8,256]));

            _s = $5(cp, e, _s);

            if ( e.p!==3 ) {e.FAILED = false; e.sp = sp;}else {s = _s; lex.sync(cp); break;}

            e.sp++;

            s.push(_(lex, e, e.eh, [8,256]));

            s = $4(lex, e, s);

            break;
         

        default : 

            switch(lex.ty){

                case 2 : 

                    e.sp++;

                    s.push(_(lex, e, e.eh, [8,256]));

                    s = $6(lex, e, s);

                    break;
                
            }
        
    }

    return s;
}

function $_8(lex){

    $ = (lex.END||lex.tx==")"||lex.tx==","||lex.tx=="}");

    return $;
}

function $_14(lex){$ = (lex.tx==")"||lex.tx==","); return $;}


const skips = [8, 256];


    function $S(lex, e, s= []){

    e.p = -1;

    e.p = -1;

    const sp= e.sp;

    s = $_0(lex, e, s, sp);

    
    let accept= -1;
    o:while(1){

        if ( sp>e.sp ) break;else e.sp++;

        switch(e.p){

            case 5 : 

                s = $3(lex, e, s, 0);

                if ( e.p>=0 ) accept = e.p;

                break;
             

            case 3 : 

                s = $2(lex, e, s, 0);

                if ( e.p>=0 ) accept = e.p;

                break;
             

            case 2 : 

                s = $1(lex, e, s, 0);

                if ( e.p>=0 ) accept = e.p;

                break;
             

            case 1 : 

                s = $0(lex, e, s, 0);

                if ( e.p>=0 ) accept = e.p;

                break;
             

            default : break o;
        }
    }
    if ( sp<=e.sp ) e.p = accept;
    if ( ![0,1,2,3,5].includes(accept) ) fail(lex, e);

    return s[s.length-1];
};
function $E(lex, e, s= []){

    e.p = -1;

    e.p = -1;

    const sp= e.sp;

    s = $_0(lex, e, s, sp);

    
    let accept= -1;
    o:while(1){

        if ( sp>e.sp ) break;else e.sp++;

        switch(e.p){

            case 5 : 

                s = $3(lex, e, s, 0);

                if ( e.p>=0 ) accept = e.p;

                break;
             

            case 3 : 

                s = $2(lex, e, s, 0);

                if ( e.p>=0 ) accept = e.p;

                break;
             

            case 2 : 

                s = $1(lex, e, s, 0);

                if ( e.p>=0 ) accept = e.p;

                break;
             

            default : break o;
        }
    }
    if ( sp<=e.sp ) e.p = accept;
    if ( ![1,2,3,5].includes(accept) ) fail(lex, e);

    return s[s.length-1];
};
function $P(lex, e, s= []){

    e.p = -1;

    e.p = -1;

    const sp= e.sp;

    
    switch(lex.tx){

        case "(" : 

            e.sp++;

            s.push(_(lex, e, e.eh, [8,256]));

            s = $4(lex, e, s);

            break;
        
    }

    return s[s.length-1];
};
function $F(lex, e, s= []){

    e.p = -1;

    e.p = -1;

    const sp= e.sp;

    
    switch(lex.tx){

        case "(" : 

            e.sp++;

            s.push(_(lex, e, e.eh, [8,256]));

            s = $5(lex, e, s);

            break;
        
    }

    return s[s.length-1];
};
function $L(lex, e, s= []){

    e.p = -1;

    e.p = -1;

    const sp= e.sp;

    s = $_0(lex, e, s, sp);

    
    let accept= -1;
    o:while(1){

        if ( sp>e.sp ) break;else e.sp++;

        switch(e.p){

            case 5 : 

                s = $3(lex, e, s, 0);

                if ( e.p>=0 ) accept = e.p;

                break;
             

            case 4 : 

                s = $9(lex, e, s, 0);

                if ( e.p>=0 ) accept = e.p;

                break;
             

            case 3 : 

                s = $2(lex, e, s, 0);

                if ( e.p>=0 ) accept = e.p;

                break;
             

            case 2 : 

                s = $1(lex, e, s, 0);

                if ( e.p>=0 ) accept = e.p;

                break;
             

            case 1 : 

                s = $10(lex, e, s, 0);

                if ( e.p>=0 ) accept = e.p;

                break;
             

            default : break o;
        }
    }
    if ( sp<=e.sp ) e.p = accept;
    if ( ![4,1,2,3,5].includes(accept) ) fail(lex, e);

    return s[s.length-1];
};
function $I(lex, e, s= []){

    e.p = -1;

    e.p = -1;

    const sp= e.sp;

    
    switch(lex.ty){

        case 2 : 

            e.sp++;

            s.push(_(lex, e, e.eh, [8,256]));

            s = $6(lex, e, s);

            break;
        
    }

    return s[s.length-1];
};
function $0(lex, e, s= []){

    e.p = -1;

    e.p = -1;

    const sp= e.sp;

    var $;

    $ = (lex.END);

    if ( $ ) {

        e.sp -= 1;

        return (e.p = 0, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
};
function $1(lex, e, s= []){

    e.p = -1;

    e.p = -1;

    const sp= e.sp;

    var $;

    $ = $_8(lex);

    if ( $ ) {

        e.sp -= 1;

        return (e.p = 1, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
};
function $2(lex, e, s= []){

    e.p = -1;

    e.p = -1;

    const sp= e.sp;

    var $;

    $ = $_8(lex);

    if ( $ ) {

        e.sp -= 1;

        return (e.p = 1, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
};
function $3(lex, e, s= []){

    e.p = -1;

    e.p = -1;

    const sp= e.sp;

    var $;

    $ = $_8(lex);

    if ( $ ) {

        e.sp -= 1;

        return (e.p = 1, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
};
function $4(lex, e, s= []){

    e.p = -1;

    e.p = -1;

    const sp= e.sp;

    s = $_0(lex, e, s, sp);

    
    let accept= -1;
    o:while(1){

        if ( sp>e.sp ) break;else e.sp++;

        switch(e.p){

            case 5 : 

                s = $3(lex, e, s, 4);

                if ( e.p>=0 ) accept = e.p;

                break;
             

            case 3 : 

                s = $2(lex, e, s, 4);

                if ( e.p>=0 ) accept = e.p;

                break;
             

            case 2 : 

                s = $1(lex, e, s, 4);

                if ( e.p>=0 ) accept = e.p;

                break;
             

            case 1 : 

                s = $7(lex, e, s, 4);

                if ( e.p>=0 ) accept = e.p;

                break;
             

            default : break o;
        }
    }
    if ( sp<=e.sp ) e.p = accept;
    if ( ![2].includes(accept) ) fail(lex, e);

    return s;
};
function $5(lex, e, s= []){

    e.p = -1;

    e.p = -1;

    const sp= e.sp;

    s = $_0(lex, e, s, sp);

    
    let accept= -1;
    o:while(1){

        if ( sp>e.sp ) break;else e.sp++;

        switch(e.p){

            case 5 : 

                s = $3(lex, e, s, 5);

                if ( e.p>=0 ) accept = e.p;

                break;
             

            case 4 : 

                s = $8(lex, e, s, 5);

                if ( e.p<0 ) s = $9(lex, e, s, 5);

                if ( e.p>=0 ) accept = e.p;

                break;
             

            case 3 : 

                s = $2(lex, e, s, 5);

                if ( e.p>=0 ) accept = e.p;

                break;
             

            case 2 : 

                s = $1(lex, e, s, 5);

                if ( e.p>=0 ) accept = e.p;

                break;
             

            case 1 : 

                s = $10(lex, e, s, 5);

                if ( e.p>=0 ) accept = e.p;

                break;
             

            default : break o;
        }
    }
    if ( sp<=e.sp ) e.p = accept;
    if ( ![3].includes(accept) ) fail(lex, e);

    return s;
};
function $6(lex, e, s= []){

    e.p = -1;

    e.p = -1;

    const sp= e.sp;

    var $;

    $ = $_8(lex);

    if ( $ ) {

        e.sp -= 1;

        return (e.p = 5, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
};
function $7(lex, e, s= []){

    e.p = -1;

    e.p = -1;

    const sp= e.sp;

    
    switch(lex.tx){

        case ")" : 

            e.sp++;

            s.push(_(lex, e, e.eh, [8,256]));

            s = $11(lex, e, s);

            break;
        
    }

    return s;
};
function $8(lex, e, s= []){

    e.p = -1;

    e.p = -1;

    const sp= e.sp;

    
    switch(lex.tx){

        case ")" : 

            e.sp++;

            s.push(_(lex, e, e.eh, [8,256]));

            s = $12(lex, e, s);

            break;
        
    }

    return s;
};
function $9(lex, e, s= []){

    e.p = -1;

    e.p = -1;

    const sp= e.sp;

    
    switch(lex.tx){

        case "," : 

            e.sp++;

            s.push(_(lex, e, e.eh, [8,256]));

            s = $13(lex, e, s);

            break;
        
    }

    return s;
};
function $10(lex, e, s= []){

    e.p = -1;

    e.p = -1;

    const sp= e.sp;

    var $;

    $ = $_14(lex);

    if ( $ ) {

        e.sp -= 1;

        const sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return (e.p = 4, s);
    }

    return s;
};
function $11(lex, e, s= []){

    e.p = -1;

    e.p = -1;

    const sp= e.sp;

    var $;

    $ = $_8(lex);

    if ( $ ) {

        e.sp -= 3;

        const sym= s.slice(-3);

        s.splice(-3, 3, { o:("parenth"), d:sym[1] });

        return (e.p = 2, s);
    }

    return s;
};
function $12(lex, e, s= []){

    e.p = -1;

    e.p = -1;

    const sp= e.sp;

    
    switch(lex.tx){

        case "=>" : 

            e.sp++;

            s.push(_(lex, e, e.eh, [8,256]));

            s = $14(lex, e, s);

            break;
        
    }

    return s;
};
function $13(lex, e, s= []){

    e.p = -1;

    e.p = -1;

    const sp= e.sp;

    s = $_0(lex, e, s, sp);

    
    let accept= -1;
    o:while(1){

        if ( sp>e.sp ) break;else e.sp++;

        switch(e.p){

            case 5 : 

                s = $3(lex, e, s, 13);

                if ( e.p>=0 ) accept = e.p;

                break;
             

            case 3 : 

                s = $2(lex, e, s, 13);

                if ( e.p>=0 ) accept = e.p;

                break;
             

            case 2 : 

                s = $1(lex, e, s, 13);

                if ( e.p>=0 ) accept = e.p;

                break;
             

            case 1 : 

                s = $15(lex, e, s, 13);

                if ( e.p>=0 ) accept = e.p;

                break;
             

            default : break o;
        }
    }
    if ( sp<=e.sp ) e.p = accept;
    if ( ![4].includes(accept) ) fail(lex, e);

    return s;
};
function $14(lex, e, s= []){

    e.p = -1;

    e.p = -1;

    const sp= e.sp;

    
    switch(lex.tx){

        case "{" : 

            e.sp++;

            s.push(_(lex, e, e.eh, [8,256]));

            s = $16(lex, e, s);

            break;
        
    }

    return s;
};
function $15(lex, e, s= []){

    e.p = -1;

    e.p = -1;

    const sp= e.sp;

    var $;

    $ = $_14(lex);

    if ( $ ) {

        e.sp -= 3;

        const sym= s.slice(-3);

        s.splice(-3, 3, [...sym[0],sym[2]]);

        return (e.p = 4, s);
    }

    return s;
};
function $16(lex, e, s= []){

    e.p = -1;

    e.p = -1;

    const sp= e.sp;

    s = $_0(lex, e, s, sp);

    
    let accept= -1;
    o:while(1){

        if ( sp>e.sp ) break;else e.sp++;

        switch(e.p){

            case 5 : 

                s = $3(lex, e, s, 16);

                if ( e.p>=0 ) accept = e.p;

                break;
             

            case 3 : 

                s = $2(lex, e, s, 16);

                if ( e.p>=0 ) accept = e.p;

                break;
             

            case 2 : 

                s = $1(lex, e, s, 16);

                if ( e.p>=0 ) accept = e.p;

                break;
             

            case 1 : 

                s = $17(lex, e, s, 16);

                if ( e.p>=0 ) accept = e.p;

                break;
             

            default : break o;
        }
    }
    if ( sp<=e.sp ) e.p = accept;
    if ( ![3].includes(accept) ) fail(lex, e);

    return s;
};
function $17(lex, e, s= []){

    e.p = -1;

    e.p = -1;

    const sp= e.sp;

    
    switch(lex.tx){

        case "}" : 

            e.sp++;

            s.push(_(lex, e, e.eh, [8,256]));

            s = $18(lex, e, s);

            break;
        
    }

    return s;
};
function $18(lex, e, s= []){

    e.p = -1;

    e.p = -1;

    const sp= e.sp;

    var $;

    $ = $_8(lex);

    if ( $ ) {

        e.sp -= 7;

        const sym= s.slice(-7);

        s.splice(-7, 7, { o:"function", u:sym[1], d:sym[5] });

        return (e.p = 3, s);
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
    lexer.addSymbols("=>","(",")","{","}")
    lexer.tl = 0;

    env.fn =  {
        ASI_PRE:(lex, env, eh, sym)=>{
            if(!env.FAILED){
                if(lex.tx != ";"){
                    const cp = lex.copy();
                    cp.IWS = false;
                    env.ASI_PRIMED = true;
                }
            }
        },
        ASI_POST:(lex, env, eh, sym)=>{
            if(env.ASI_PRIMED)
                env.FAILED =false;
            env.ASI_PRIMED = false;
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
$E,
$P,
$F,
$L,
$I,
$0,
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

