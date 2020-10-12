
function createPos(lex, off){
    const copy = lex.copy;
    copy.off = lex.next;
    copy.fence(lex);
    return copy;
}

function lm(lex, syms) {
    for (const sym of syms) {
        if (typeof sym == "number") {
            if (sym == 0xFF && lex.END) return true;
            else if (lex.ty == sym) return true;
        } else if (lex.tx == sym) return true;
    }
    return false;
}
    
function aaa(lex, e, skips, ...syms) {
    if (syms.length == 0 || lm(lex, syms)) {
        const val = lex.tx;
        lex.next();
        if (skips) while (lm(lex, skips)) lex.next();
        return val;
    } else {
        //error recovery
        const tx = handleError();
    }
}

function $S(lex, e){

    const sym= [];

    sym.push($stmts(lex, e));

    return (sym.pop());
}

function $expr(lex, e){

    const sym= [];

    if ( lex.ty==1||lex.ty==2 ) {

        sym.push($B(lex, e));

        if ( lex.tx=="+" ) {

            if ( lex.pk.tx=="for"||lex.pk.ty==1||lex.pk.ty==2 ) {

                sym.push(aaa(lex, e, [8,256]));

                sym.push($expr(lex, e));

                return ({ sym:"+", a:sym[0], b:sym[2] });
            }

            if ( lex.pk.tx==")"||lex.pk.tx=="}"||lex.pk.tx==";"||lex.pk.END||lex.pk.tx=="+" ) {return (sym.pop());}
        }

        //insert asi
        //$expr
    }

    if ( lex.tx=="for" ) {

        sym.push(aaa(lex, e, [8,256]));

        sym.push(aaa(lex, e, [8,256]));

        sym.push($expr(lex, e));

        sym.push(aaa(lex, e, [8,256]));

        if ( lex.tx=="do" ) {

            sym.push(aaa(lex, e, [8,256]));

            sym.push($expr(lex, e));

            return ({ sym:"for do", a:sym[2], b:sym[5] });
        }

        if ( lex.tx=="{" ) {

            sym.push(aaa(lex, e, [8,256]));

            sym.push($expr(lex, e));

            sym.push(aaa(lex, e, [8,256]));

            return ({ sym:"for", a:sym[2], b:sym[5] });
        }
    }

    return (sym.pop());
}

function $B(lex, e){

    const sym= [];

    if ( lex.ty==1||lex.ty==2 ) {

        sym.push($R(lex, e));

        if ( lex.tx=="*" ) {

            sym.push(aaa(lex, e, [8,256]));

            sym.push($expr(lex, e));

            return ({ sym:"*", a:sym[0], b:sym[2] });
        }

        if ( lex.tx=="+"||lex.tx==")"||lex.tx=="}"||lex.tx==";"||lex.END ) {return (sym.pop());}
    }

    return (sym.pop());
}

function $R(lex, e){

    const sym= [];

    if ( lex.ty==1 ) {

        sym.push(aaa(lex, e, [8,256]));

        return (sym.pop());
    }

    if ( lex.ty==2 ) {

        sym.push(aaa(lex, e, [8,256]));

        return (sym.pop());
    }

    return (sym.pop());
}

function $stmts(lex, e, s= [], p= -1){

    if ( lex.tx=="for" ) {s.push($expr(lex, e)); p = 2;}

    if ( lex.ty==1 ) {s.push($expr(lex, e)); p = 2;}

    if ( lex.ty==2 ) {s.push($expr(lex, e)); p = 2;}

    while(1){

        let a= false;

        if ( p==2 ) {

            a = true;

            const {p:pval,v:val}= $1(lex, e, s);

            s = val, p = pval;

            continue ;
        }

        if ( p==1 ) {

            a = true;

            const {p:pval,v:val}= $21(lex, e, s);

            s = val, p = pval;

            continue ;
        }

        if ( lex.END||lex.tx=="+"||lex.tx=="*"||lex.tx==";" ) return s.pop();

        if ( !a ) break;
    }

    return s.pop();
}

function $1(lex, e, s= [], p= -1){

    if ( lex.END||lex.tx==";" ) {

        const sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return { p:1, v:s, type:"reduce" };
    }

    return { p:p, v:s };
}

function $7(lex, e, s= [], p= -1){

    if ( lex.tx=="for" ) {s.push($expr(lex, e)); p = 2;}

    if ( lex.ty==1 ) {s.push($expr(lex, e)); p = 2;}

    if ( lex.ty==2 ) {s.push($expr(lex, e)); p = 2;}

    while(1){

        let a= false;

        if ( p==2 ) {

            a = true;

            const {p:pval,v:val}= $11(lex, e, s);

            s = val, p = pval;

            continue ;
        }

        if ( lex.END||lex.tx==";" ) return { p, v:s };

        if ( !a ) break;
    }

    return { p:p, v:s };
}

function $11(lex, e, s= [], p= -1){

    if ( lex.END||lex.tx==";" ) {

        const sym= s.slice(-3);

        s.splice(-3, 3, sym[0].concat(sym[2]));

        return { p:1, v:s, type:"reduce" };
    }

    return { p:p, v:s };
}

function $21(lex, e, s= [], p= -1){

    if ( lex.tx==";" ) {

        s.push(aaa(lex, e, [8,256]));

        const {p:pval,v:val}= $7(lex, e, s);

        s = val, p = pval;

        return { p:p, v:s, type:"shift" };
    }

    return { p:p, v:s };
};

return function(lexer){
    const states = [];
    lexer.IWS = false;
    const result =  $S(lexer);
    if(!lexer.END) lexer.throw(`Unexpected token [${lexer.tx}]`);
    return result;
}