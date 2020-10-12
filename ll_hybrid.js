

    function assertAndAdvance(lex, bool){
        const v = lex.tx;
        if(bool) lex.next();
        else lex.throw("Unexpected Token");
        return v;
    }

    function $S(lex, e){

    const sym= [];

    sym.push($stmts(lex, e));

    return (sym.pop());
}
'Left recursion found in stmts';
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
};

    return function(lexer){
        const states = [];
        return $S(lexer);

    }