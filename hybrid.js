
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

            _s = s.slice();

            _s.push($F(cp, e));

            e.p = (e.FAILED)?-1:3;

            if ( e.p!==3 ) {e.FAILED = false; e.sp = sp;}else {s = _s; lex.sync(cp); break;}

            s.push($P(lex, e));

            e.p = (e.FAILED)?-1:2;

            break;
         

        default : 

            switch(lex.ty){

                case 2 : 

                    s.push($I(lex, e));

                    e.p = (e.FAILED)?-1:5;

                    break;
                
            }
        
    }

    return s;
}

function $_4(lex){

    $ = (lex.END||lex.tx==")"||lex.tx==","||lex.tx=="}");

    return $;
}

function $_10(lex){$ = (lex.tx==")"||lex.tx==","); return $;}
const _0 = [8,256];

const skips = [8, 256];


    function $S(lex, e){

    const tx= lex.tx, ty= lex.ty;

    if ( tx=="("||ty==2 ) {

        const $1_= $E(lex, e);

        if ( e.FAILED ) return $1_;

        return $1_;
    }

    return sym[sym.length-1];
};
function $P(lex, e){

    const tx= lex.tx, ty= lex.ty;

    if ( tx=="(" ) {

        const $1_= _(lex, e, e.eh, _0, "(");

        const $2_= $E(lex, e);

        if ( e.FAILED ) return $2_;

        const $3_= _(lex, e, e.eh, _0, ")");

        return ({ o:("parenth"), d:$2_ });
    }

    return sym[sym.length-1];
};
function $F(lex, e){

    const tx= lex.tx, ty= lex.ty;

    if ( tx=="(" ) {

        const $1_= _(lex, e, e.eh, _0, "(");

        const $2_= $L(lex, e);

        if ( e.FAILED ) return $2_;

        const $3_= _(lex, e, e.eh, _0, ")");

        const $4_= _(lex, e, e.eh, _0, "=>");

        const $5_= _(lex, e, e.eh, _0, "{");

        const $6_= $E(lex, e);

        if ( e.FAILED ) return $6_;

        const $7_= _(lex, e, e.eh, _0, "}");

        return ({ o:"function", u:$2_, d:$6_ });
    }

    return sym[sym.length-1];
};
function $I(lex, e){

    const tx= lex.tx, ty= lex.ty;

    if ( ty==2 ) {const $1_= _(lex, e, e.eh, _0, 2); return $1_;}

    return sym[sym.length-1];
};
function $E(lex, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_0(lex, e, s, sp);

    
    let accept= -1;
    o:while(1){

        if ( sp>e.sp ) break;else e.sp++;

        switch(e.p){

            case 5 : s = $3(lex, e, s, 0); break; 

            case 3 : s = $2(lex, e, s, 0); break; 

            case 2 : s = $1(lex, e, s, 0); break; 

            default : break o;
        }

        if ( e.p>=0 ) accept = e.p;
    }
    if ( sp<=e.sp ) e.p = accept;
    if ( ![1,2,3,5].includes(accept) ) fail(lex, e);

    return s[s.length-1];
};
function $L(lex, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_0(lex, e, s, sp);

    
    let accept= -1;
    o:while(1){

        if ( sp>e.sp ) break;else e.sp++;

        switch(e.p){

            case 5 : s = $3(lex, e, s, 0); break; 

            case 4 : s = $9(lex, e, s, 0); break; 

            case 3 : s = $2(lex, e, s, 0); break; 

            case 2 : s = $1(lex, e, s, 0); break; 

            case 1 : s = $10(lex, e, s, 0); break; 

            default : break o;
        }

        if ( e.p>=0 ) accept = e.p;
    }
    if ( sp<=e.sp ) e.p = accept;
    if ( ![4,1,2,3,5].includes(accept) ) fail(lex, e);

    return s[s.length-1];
};
function $1(lex, e, s= []){

    e.p = -1;

    var $;

    $ = $_4(lex);

    if ( $ ) {

        e.sp -= 1;

        return (e.p = 1, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
};
function $2(lex, e, s= []){

    e.p = -1;

    var $;

    $ = $_4(lex);

    if ( $ ) {

        e.sp -= 1;

        return (e.p = 1, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
};
function $3(lex, e, s= []){

    e.p = -1;

    var $;

    $ = $_4(lex);

    if ( $ ) {

        e.sp -= 1;

        return (e.p = 1, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
};
function $9(lex, e, s= []){

    e.p = -1;

    
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

    var $;

    $ = $_10(lex);

    if ( $ ) {

        e.sp -= 1;

        const sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return (e.p = 4, s);
    }

    return s;
};
function $13(lex, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_0(lex, e, s, sp);

    
    let accept= -1;
    o:while(1){

        if ( sp>e.sp ) break;else e.sp++;

        switch(e.p){

            case 5 : s = $3(lex, e, s, 13); break; 

            case 3 : s = $2(lex, e, s, 13); break; 

            case 2 : s = $1(lex, e, s, 13); break; 

            case 1 : s = $15(lex, e, s, 13); break; 

            default : break o;
        }

        if ( e.p>=0 ) accept = e.p;
    }
    if ( sp<=e.sp ) e.p = accept;
    if ( ![4].includes(accept) ) fail(lex, e);

    return s;
};
function $15(lex, e, s= []){

    e.p = -1;

    var $;

    $ = $_10(lex);

    if ( $ ) {

        e.sp -= 3;

        const sym= s.slice(-3);

        s.splice(-3, 3, [...sym[0],sym[2]]);

        return (e.p = 4, s);
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
$P,
$F,
$I,
$E,
$L,
$1,
$2,
$3,
$9,
$10,
$13,
$15})

