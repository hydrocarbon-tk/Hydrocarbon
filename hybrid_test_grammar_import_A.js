export default (b)=>{

    
function log(...str){
    console.log(...str);
}

function glp(lex, padding = 4){
    const token_length = lex.tl;
    const offset = lex.off;
    const string_length = lex.sl;
    const start = Math.max(0, offset - padding);
    const mid = offset;
    const end = Math.min(string_length, offset + token_length  + padding);
    return `${(start > 0 ?" ": "")+lex.str.slice(start, mid) + "•" + lex.str.slice(mid, end) + ((end == string_length) ? "$EOF" : " ")}`;
}

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

const _0 = [8,256,8,256];



function $S(l, e){

    log(`▎${glp(l)} ->${l.tx} ▎LL-CALL ▎S=>• E`);

    if ( e.FAILED ) return ;

    const $1_= $E(l, e);

    return $1_;
}
function $E(l, e){

    const tx = l.tx;

    log(
        `▎${glp(l)} ->${l.tx} ▎LL-PEEK:1 ▎E=>• b$G | E=>• ( X ) | E=>• { b$G } | E=>• [ E , E ]`
    );

    if ( tx=="mission" ) {

        log(`▎${glp(l)} ->${l.tx} ▎LL-CALL ▎E=>• b$G`);

        if ( e.FAILED ) return ;

        const $1_= $b$G(l, e);

        return $1_;
    }

    if ( tx=="(" ) {

        log(`▎${glp(l)} ->${l.tx} ▎LL-ASSERT ▎E=>• ( X )`);

        _(l, e, e.eh, _0, "(");

        log(`▎${glp(l)} ->${l.tx} ▎LL-CALL ▎E=>( • X )`);

        if ( e.FAILED ) return ;

        $X(l, e);

        log(`▎${glp(l)} ->${l.tx} ▎LL-ASSERT ▎E=>( X • )`);

        const $3_= _(l, e, e.eh, _0, ")");

        return $3_;
    }

    if ( tx=="{" ) {

        log(`▎${glp(l)} ->${l.tx} ▎LL-ASSERT ▎E=>• { b$G }`);

        _(l, e, e.eh, _0, "{");

        log(`▎${glp(l)} ->${l.tx} ▎LL-CALL ▎E=>{ • b$G }`);

        if ( e.FAILED ) return ;

        $b$G(l, e);

        log(`▎${glp(l)} ->${l.tx} ▎LL-ASSERT ▎E=>{ b$G • }`);

        const $3_= _(l, e, e.eh, _0, "}");

        return $3_;
    }

    if ( tx=="[" ) {

        log(`▎${glp(l)} ->${l.tx} ▎LL-ASSERT ▎E=>• [ E , E ]`);

        _(l, e, e.eh, _0, "[");

        log(`▎${glp(l)} ->${l.tx} ▎LL-CALL ▎E=>[ • E , E ]`);

        if ( e.FAILED ) return ;

        $E(l, e);

        log(`▎${glp(l)} ->${l.tx} ▎LL-ASSERT ▎E=>[ E • , E ]`);

        _(l, e, e.eh, _0, ",");

        log(`▎${glp(l)} ->${l.tx} ▎LL-CALL ▎E=>[ E , • E ]`);

        if ( e.FAILED ) return ;

        $E(l, e);

        log(`▎${glp(l)} ->${l.tx} ▎LL-ASSERT ▎E=>[ E , E • ]`);

        const $5_= _(l, e, e.eh, _0, "]");

        return $5_;
    }

    e.FAILED = true;
}
function $X(l, e){

    log(
        `▎${glp(l)} ->${l.tx} ▎LL-ASSERT ▎X=>• total recall θnum`
    );

    _(l, e, e.eh, _0, "total");

    log(
        `▎${glp(l)} ->${l.tx} ▎LL-ASSERT ▎X=>total • recall θnum`
    );

    _(l, e, e.eh, _0, "recall");

    log(
        `▎${glp(l)} ->${l.tx} ▎LL-ASSERT ▎X=>total recall • θnum`
    );

    const $3_= _(l, e, e.eh, _0, 1);

    return $3_;
}
function $b$S(l, e){return b.$S(l, e);}
function $b$G(l, e){return b.$G(l, e);}


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
$E,
$X,
$b$S,
$b$G})
}