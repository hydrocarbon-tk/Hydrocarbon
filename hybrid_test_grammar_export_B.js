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

const _0 = [8,256];



function $S(l, e){

    log(`▎${glp(l)} ->${l.tx} ▎LL-CALL ▎S=>• G`);

    if ( e.FAILED ) return ;

    const $1_= $G(l, e);

    return $1_;
}
function $G(l, e){

    log(
        `▎${glp(l)} ->${l.tx} ▎LL-ASSERT ▎G=>• mission impossible θnum`
    );

    _(l, e, e.eh, _0, "mission");

    log(
        `▎${glp(l)} ->${l.tx} ▎LL-ASSERT ▎G=>mission • impossible θnum`
    );

    _(l, e, e.eh, _0, "impossible");

    log(
        `▎${glp(l)} ->${l.tx} ▎LL-ASSERT ▎G=>mission impossible • θnum`
    );

    const $3_= _(l, e, e.eh, _0, 1);

    return $3_;
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
$G})
}