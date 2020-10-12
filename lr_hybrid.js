
function assertAndAdvance(lex, bool){
    const v = lex.tx;
    if(bool) lex.next();
    else lex.throw("Unexpected Token");
    return v;
}

;

return function(lexer){
    const states = [];
    return $S(lexer);

}