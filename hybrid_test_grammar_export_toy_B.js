export default (b)=>{
            const pos = null;
            function log(...str) {
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
            
            const _0 = [8,256],_1 = [","],_2 = ["*"],_3 = ["+"],_4 = [2];
            
            
            
            function $S(l, e){

    log(
        `▎${glp(l)} ->${l.tx} ▎LL-CALL ▎S=>• expression_list`
    );

    if ( e.FAILED ) return ;

    const $1_= $expression_list(l, e);

    return $1_;
}
;
;
;
function $add(l, e){

    log(
        `▎${glp(l)} ->${l.tx} ▎LL-CALL ▎add=>• mult + add`
    );

    if ( e.FAILED ) return ;

    const $1_= $mult(l, e);

    log(
        `▎${glp(l)} ->${l.tx} ▎LL-ASSERT ▎add=>mult • + add`
    );

    _(l, e, e.eh, [8,256], "+");

    log(
        `▎${glp(l)} ->${l.tx} ▎LL-CALL ▎add=>mult + • add`
    );

    if ( e.FAILED ) return ;

    const $3_= $add(l, e);

    return ({ type:"ADD", l:$1_, r:$3_ });

    return $2_;
}
function $mult(l, e){

    log(
        `▎${glp(l)} ->${l.tx} ▎LL-CALL ▎mult=>• sym * mult`
    );

    if ( e.FAILED ) return ;

    const $1_= $sym(l, e);

    log(
        `▎${glp(l)} ->${l.tx} ▎LL-ASSERT ▎mult=>sym • * mult`
    );

    _(l, e, e.eh, [8,256], "*");

    log(
        `▎${glp(l)} ->${l.tx} ▎LL-CALL ▎mult=>sym * • mult`
    );

    if ( e.FAILED ) return ;

    const $3_= $mult(l, e);

    return ({ type:"MUL", l:$1_, r:$3_ });

    return $2_;
}
function $sym(l, e){

    log(`▎${glp(l)} ->${l.tx} ▎LL-CALL ▎sym=>• id`);

    if ( e.FAILED ) return ;

    const $1_= $id(l, e);

    return $1_;
}
function $id(l, e){

    log(`▎${glp(l)} ->${l.tx} ▎LL-ASSERT ▎id=>• θid`);

    const $1_= _(l, e, e.eh, [8,256], 2);

    return $1_;
}
function $num(l, e){

    log(`▎${glp(l)} ->${l.tx} ▎LL-ASSERT ▎num=>• θnum`);

    const $1_= _(l, e, e.eh, [8,256], 1);

    return $1_;
}
function $expression_list_HC_listbody1_100(l, e, s= [], st){

    `expression_list_HC_listbody1_100=>• expression_list_HC_listbody1_100 , expression : expression_list_HC_listbody1_100=>• expression`;

    const sp= e.sp;

    e.p = -1;

    
    switch(l.tx){

        case "*" : 

            log(
                `▎${glp(l)} ->${l.tx} ▎LR[0]-SHIFT:${e.sp} ▎mult=>sym • * mult`
            );

            s = $14(l, e, _s(s, l, e, e.eh, _0));

            break;
         

        case "+" : 

            log(
                `▎${glp(l)} ->${l.tx} ▎LR[0]-SHIFT:${e.sp} ▎add=>mult • + add`
            );

            s = $15(l, e, _s(s, l, e, e.eh, _0));

            break;
         

        default : 

            switch(l.ty){

                case 2 : 

                    log(
                        `▎${glp(l)} ->${l.tx} ▎LR[0]-SHIFT:${e.sp} ▎id=>• θid`
                    );

                    s = $8(l, e, _s(s, l, e, e.eh, _0));

                    break;
                
            }
        
    }

    let a= e.p;

    o:while(1){

        log(
            `Loop State $expression_list_HC_listbody1_100 start sp:${sp} curr sp:${e.sp}  curr p:${e.p} `
        );

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 7 : s = $7(l, e, s); break; 

            case 6 : 

                s = $4(l, e, s);

                if ( e.p<0 ) s = $5(l, e, s);

                break;
             

            case 5 : 

                s = $6(l, e, s);

                if ( e.p<0 ) s = $18(l, e, s);

                break;
             

            case 4 : 

                s = $3(l, e, s);

                if ( e.p<0 ) s = $19(l, e, s);

                break;
             

            case 3 : s = $2(l, e, s); break; 

            case 1 : s = $1(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![1].includes(a) ) fail(l, e);

    log(
        `Loop State $expression_list_HC_listbody1_100 pass:${e.FAILED} ep:${e.p} a:${a} `
    );

    return s;
}
function $1(l, e, s= [], st){

    `expression_list_HC_listbody1_100=>expression_list_HC_listbody1_100 • , expression`;

    e.p = -1;

    
    if ( _1.includes(l.tx) ) {

        log(
            `▎${glp(l)} ->${l.tx} ▎LR[1]-SHIFT:${e.sp} ▎expression_list_HC_listbody1_100=>expression_list_HC_listbody1_100 • , expression`
        );

        return $13(l, e, _s(s, l, e, e.eh, _0));
    }

    return s;
}
function $2(l, e, s= [], st){

    `expression_list_HC_listbody1_100=>expression •`;

    e.p = -1;

    
    if ( _1.includes(l.tx) ) {

        log(
            `▎${glp(l)} ->${l.tx} ▎LR[2]-REDUCE_TO:1 sp:${e.sp} ▎expression_list_HC_listbody1_100=>expression •`
        );

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return (e.p = 1, s);
    }

    return s;
}
function $3(l, e, s= [], st){

    `expression=>add •`;

    e.p = -1;

    
    if ( _1.includes(l.tx) ) {

        log(
            `▎${glp(l)} ->${l.tx} ▎LR[3]-REDUCE_TO:3 sp:${e.sp} ▎expression=>add •`
        );

        e.sp -= 1;

        return (e.p = 3, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}
function $4(l, e, s= [], st){

    `expression=>sym •`;

    e.p = -1;

    
    if ( _1.includes(l.tx) ) {

        log(
            `▎${glp(l)} ->${l.tx} ▎LR[4]-REDUCE_TO:3 sp:${e.sp} ▎expression=>sym •`
        );

        e.sp -= 1;

        return (e.p = 3, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}
function $5(l, e, s= [], st){

    `mult=>sym • * mult : mult=>sym •`;

    e.p = -1;

    
    if ( _2.includes(l.tx) ) {

        log(
            `▎${glp(l)} ->${l.tx} ▎LR[5]-SHIFT:${e.sp} ▎mult=>sym • * mult`
        );

        return $14(l, e, _s(s, l, e, e.eh, _0));
    }

    return s;
}
function $6(l, e, s= [], st){

    `add=>mult • + add : add=>mult •`;

    e.p = -1;

    
    if ( _3.includes(l.tx) ) {

        log(
            `▎${glp(l)} ->${l.tx} ▎LR[6]-SHIFT:${e.sp} ▎add=>mult • + add`
        );

        return $15(l, e, _s(s, l, e, e.eh, _0));
    }

    return s;
}
function $7(l, e, s= [], st){

    `sym=>id •`;

    e.p = -1;

    
    if ( _2.includes(l.tx) ) {

        log(
            `▎${glp(l)} ->${l.tx} ▎LR[7]-REDUCE_TO:6 sp:${e.sp} ▎sym=>id •`
        );

        e.sp -= 1;

        return (e.p = 6, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}
function $8(l, e, s= [], st){

    `id=>θid •`;

    e.p = -1;

    
    if ( _2.includes(l.tx) ) {

        log(
            `▎${glp(l)} ->${l.tx} ▎LR[8]-REDUCE_TO:7 sp:${e.sp} ▎id=>θid •`
        );

        e.sp -= 1;

        return (e.p = 7, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}
function $expression_list(l, e, s= [], st){

    `expression_list=>• expression_list , expression : expression_list=>• expression`;

    const sp= e.sp;

    e.p = -1;

    
    if ( _4.includes(l.ty) ) {

        log(
            `▎${glp(l)} ->${l.tx} ▎LR[9]-SHIFT:${e.sp} ▎id=>• θid`
        );

        s = $8(l, e, _s(s, l, e, e.eh, _0));
    }

    let a= e.p;

    o:while(1){

        log(
            `Loop State $expression_list start sp:${sp} curr sp:${e.sp}  curr p:${e.p} `
        );

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 7 : s = $7(l, e, s); break; 

            case 6 : 

                s = $4(l, e, s);

                if ( e.p<0 ) s = $5(l, e, s);

                break;
             

            case 5 : s = $6(l, e, s); break; 

            case 4 : s = $3(l, e, s); break; 

            case 3 : s = $11(l, e, s); break; 

            case 2 : s = $10(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![2].includes(a) ) fail(l, e);

    log(
        `Loop State $expression_list pass:${e.FAILED} ep:${e.p} a:${a} `
    );

    return s;
}
function $10(l, e, s= [], st){

    `expression_list=>expression_list • , expression`;

    e.p = -1;

    
    if ( _1.includes(l.tx) ) {

        log(
            `▎${glp(l)} ->${l.tx} ▎LR[10]-SHIFT:${e.sp} ▎expression_list=>expression_list • , expression`
        );

        return $16(l, e, _s(s, l, e, e.eh, _0));
    }

    return s;
}
function $11(l, e, s= [], st){

    `expression_list=>expression •`;

    e.p = -1;

    
    if ( _1.includes(l.tx) ) {

        log(
            `▎${glp(l)} ->${l.tx} ▎LR[11]-REDUCE_TO:2 sp:${e.sp} ▎expression_list=>expression •`
        );

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return (e.p = 2, s);
    }

    return s;
}
function $expression(l, e, s= [], st){

    `expression=>• add : expression=>• sym`;

    const sp= e.sp;

    e.p = -1;

    
    if ( _4.includes(l.ty) ) {

        log(
            `▎${glp(l)} ->${l.tx} ▎LR[12]-SHIFT:${e.sp} ▎id=>• θid`
        );

        s = $8(l, e, _s(s, l, e, e.eh, _0));
    }

    let a= e.p;

    o:while(1){

        log(
            `Loop State $expression start sp:${sp} curr sp:${e.sp}  curr p:${e.p} `
        );

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 7 : s = $7(l, e, s); break; 

            case 6 : 

                s = $4(l, e, s);

                if ( e.p<0 ) s = $5(l, e, s);

                break;
             

            case 5 : s = $6(l, e, s); break; 

            case 4 : s = $3(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![3].includes(a) ) fail(l, e);

    log(
        `Loop State $expression pass:${e.FAILED} ep:${e.p} a:${a} `
    );

    return s;
}
function $13(l, e, s= [], st){

    `expression_list_HC_listbody1_100=>expression_list_HC_listbody1_100 , • expression`;

    const sp= e.sp;

    e.p = -1;

    
    if ( _4.includes(l.ty) ) {

        log(
            `▎${glp(l)} ->${l.tx} ▎LR[13]-SHIFT:${e.sp} ▎id=>• θid`
        );

        s = $8(l, e, _s(s, l, e, e.eh, _0));
    }

    let a= e.p;

    o:while(1){

        log(
            `Loop State 13 start sp:${sp} curr sp:${e.sp}  curr p:${e.p} `
        );

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 7 : s = $7(l, e, s); break; 

            case 6 : 

                s = $4(l, e, s);

                if ( e.p<0 ) s = $5(l, e, s);

                break;
             

            case 5 : s = $6(l, e, s); break; 

            case 4 : s = $3(l, e, s); break; 

            case 3 : s = $17(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![1].includes(a) ) fail(l, e);

    log(
        `Loop State 13 pass:${e.FAILED} ep:${e.p} a:${a} `
    );

    return s;
}
function $14(l, e, s= [], st){

    `mult=>sym * • mult`;

    const sp= e.sp;

    e.p = -1;

    
    if ( _4.includes(l.ty) ) {

        log(
            `▎${glp(l)} ->${l.tx} ▎LR[14]-SHIFT:${e.sp} ▎id=>• θid`
        );

        s = $8(l, e, _s(s, l, e, e.eh, _0));
    }

    let a= e.p;

    o:while(1){

        log(
            `Loop State 14 start sp:${sp} curr sp:${e.sp}  curr p:${e.p} `
        );

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 7 : s = $7(l, e, s); break; 

            case 6 : s = $5(l, e, s); break; 

            case 5 : s = $18(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![5].includes(a) ) fail(l, e);

    log(
        `Loop State 14 pass:${e.FAILED} ep:${e.p} a:${a} `
    );

    return s;
}
function $15(l, e, s= [], st){

    `add=>mult + • add`;

    const sp= e.sp;

    e.p = -1;

    
    if ( _4.includes(l.ty) ) {

        log(
            `▎${glp(l)} ->${l.tx} ▎LR[15]-SHIFT:${e.sp} ▎id=>• θid`
        );

        s = $8(l, e, _s(s, l, e, e.eh, _0));
    }

    let a= e.p;

    o:while(1){

        log(
            `Loop State 15 start sp:${sp} curr sp:${e.sp}  curr p:${e.p} `
        );

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 7 : s = $7(l, e, s); break; 

            case 6 : s = $5(l, e, s); break; 

            case 5 : s = $6(l, e, s); break; 

            case 4 : s = $19(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![4].includes(a) ) fail(l, e);

    log(
        `Loop State 15 pass:${e.FAILED} ep:${e.p} a:${a} `
    );

    return s;
}
function $16(l, e, s= [], st){

    `expression_list=>expression_list , • expression`;

    const sp= e.sp;

    e.p = -1;

    
    if ( _4.includes(l.ty) ) {

        log(
            `▎${glp(l)} ->${l.tx} ▎LR[16]-SHIFT:${e.sp} ▎id=>• θid`
        );

        s = $8(l, e, _s(s, l, e, e.eh, _0));
    }

    let a= e.p;

    o:while(1){

        log(
            `Loop State 16 start sp:${sp} curr sp:${e.sp}  curr p:${e.p} `
        );

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 7 : s = $7(l, e, s); break; 

            case 6 : 

                s = $4(l, e, s);

                if ( e.p<0 ) s = $5(l, e, s);

                break;
             

            case 5 : s = $6(l, e, s); break; 

            case 4 : s = $3(l, e, s); break; 

            case 3 : s = $20(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![2].includes(a) ) fail(l, e);

    log(
        `Loop State 16 pass:${e.FAILED} ep:${e.p} a:${a} `
    );

    return s;
}
function $17(l, e, s= [], st){

    `expression_list_HC_listbody1_100=>expression_list_HC_listbody1_100 , expression •`;

    e.p = -1;

    
    if ( _1.includes(l.tx) ) {

        log(
            `▎${glp(l)} ->${l.tx} ▎LR[17]-REDUCE_TO:1 sp:${e.sp} ▎expression_list_HC_listbody1_100=>expression_list_HC_listbody1_100 , expression •`
        );

        e.sp -= 3;

        var sym= s.slice(-3);

        s.splice(-3, 3, ([...sym[0],sym[2]]));

        return (e.p = 1, s);
    }

    return s;
}
function $18(l, e, s= [], st){

    `mult=>sym * mult •`;

    e.p = -1;

    
    if ( _3.includes(l.tx) ) {

        log(
            `▎${glp(l)} ->${l.tx} ▎LR[18]-REDUCE_TO:5 sp:${e.sp} ▎mult=>sym * mult •`
        );

        e.sp -= 3;

        var sym= s.slice(-3);

        s.splice(-3, 3, { type:"MUL", l:sym[0], r:sym[2] });

        return (e.p = 5, s);
    }

    return s;
}
function $19(l, e, s= [], st){

    `add=>mult + add •`;

    e.p = -1;

    
    if ( _1.includes(l.tx) ) {

        log(
            `▎${glp(l)} ->${l.tx} ▎LR[19]-REDUCE_TO:4 sp:${e.sp} ▎add=>mult + add •`
        );

        e.sp -= 3;

        var sym= s.slice(-3);

        s.splice(-3, 3, { type:"ADD", l:sym[0], r:sym[2] });

        return (e.p = 4, s);
    }

    return s;
}
function $20(l, e, s= [], st){

    `expression_list=>expression_list , expression •`;

    e.p = -1;

    
    if ( _1.includes(l.tx) ) {

        log(
            `▎${glp(l)} ->${l.tx} ▎LR[20]-REDUCE_TO:2 sp:${e.sp} ▎expression_list=>expression_list , expression •`
        );

        e.sp -= 3;

        var sym= s.slice(-3);

        s.splice(-3, 3, ([...sym[0],sym[2]]));

        return (e.p = 2, s);
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
$1,
$2,
$3,
$4,
$5,
$6,
$7,
$8,
$expression_list,
$10,
$11,
$expression,
$13,
$14,
$15,
$16,
$17,
$18,
$19,
$20})
            }