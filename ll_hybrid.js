

    function assertAndAdvance(lex, bool){
        const v = lex.tx;
        if(bool) lex.next();
        else lex.throw("Unexpected Token");
        return v;
    }

    'Left recursion found in S';
'Left recursion found in E';
'Left recursion found in P';
'Left recursion found in F';
'Left recursion found in L';
'Left recursion found in I';;

    return function(lexer){
        const states = [];
        return $S(lexer);

    }