
function assertAndAdvance(lex, bool){
    const v = lex.tx;
    if(bool) lex.next();
    else lex.throw("Unexpected Token");
    return v;
}

function $start(lex, e, s= []){

    e.p = -1;

    if ( lex.tx=="import" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $6(lex, e, s);

        return s;
    }

    if ( lex.tx=="{" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $14(lex, e, s);

        return s;
    }

    if ( lex.tx=="delete" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $32(lex, e, s);

        return s;
    }

    if ( lex.tx=="void" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $33(lex, e, s);

        return s;
    }

    if ( lex.tx=="typeof" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $34(lex, e, s);

        return s;
    }

    if ( lex.tx=="+" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $35(lex, e, s);

        return s;
    }

    if ( lex.tx=="-" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $36(lex, e, s);

        return s;
    }

    if ( lex.tx=="~" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $37(lex, e, s);

        return s;
    }

    if ( lex.tx=="!" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $38(lex, e, s);

        return s;
    }

    if ( lex.tx=="++" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $39(lex, e, s);

        return s;
    }

    if ( lex.tx=="--" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $40(lex, e, s);

        return s;
    }

    if ( lex.tx=="this" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $43(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.ty==2 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $51(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="$" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $52(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="_" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $53(lex, e, s);

        return s;
    }

    if ( lex.tx=="async" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $54(lex, e, s);

        return s;
    }

    if ( lex.tx=="get" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $55(lex, e, s);

        return s;
    }

    if ( lex.tx=="set" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $56(lex, e, s);

        return s;
    }

    if ( lex.tx=="target" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $57(lex, e, s);

        return s;
    }

    if ( lex.tx=="as" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $58(lex, e, s);

        return s;
    }

    if ( lex.tx=="from" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $59(lex, e, s);

        return s;
    }

    if ( lex.tx=="true" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $64(lex, e, s);

        return s;
    }

    if ( lex.tx=="false" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $65(lex, e, s);

        return s;
    }

    if ( lex.tx=="null" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $66(lex, e, s);

        return s;
    }

    e.fn.parseString(lex, e, e.eh, sym);

    if ( lex.tx=='"' ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $67(lex, e, s);

        return s;
    }

    e.fn.parseString(lex, e, e.eh, sym);

    if ( lex.tx=="'" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $68(lex, e, s);

        return s;
    }

    if ( lex.ty==1 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $69(lex, e, s);

        return s;
    }

    if ( lex.tx=="[" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $70(lex, e, s);

        return s;
    }

    if ( lex.tx=="(" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $71(lex, e, s);

        return s;
    }

    if ( lex.tx=="var" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $72(lex, e, s);

        return s;
    }

    if ( lex.tx==";" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $73(lex, e, s);

        return s;
    }

    if ( lex.tx=="if" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $74(lex, e, s);

        return s;
    }

    while(1){

        let a= false;

        if ( e.p==63 ) {a = true; s = $49(lex, e, s); continue ;}

        if ( e.p==60 ) {a = true; s = $50(lex, e, s); continue ;}

        if ( e.p==54 ) {a = true; s = $60(lex, e, s); continue ;}

        if ( e.p==53 ) {a = true; s = $61(lex, e, s); continue ;}

        if ( e.p==51 ) {a = true; s = $63(lex, e, s); continue ;}

        if ( e.p==46 ) {a = true; s = $46(lex, e, s); continue ;}

        if ( e.p==45 ) {a = true; s = $42(lex, e, s); continue ;}

        if ( e.p==42 ) {a = true; s = $62(lex, e, s); continue ;}

        if ( e.p==41 ) {a = true; s = $47(lex, e, s); continue ;}

        if ( e.p==40 ) {a = true; s = $31(lex, e, s); continue ;}

        if ( e.p==39 ) {a = true; s = $30(lex, e, s); continue ;}

        if ( e.p==38 ) {a = true; s = $29(lex, e, s); continue ;}

        if ( e.p==23 ) {a = true; s = $12(lex, e, s); continue ;}

        if ( e.p==20 ) {a = true; s = $11(lex, e, s); continue ;}

        if ( e.p==15 ) {a = true; s = $10(lex, e, s); continue ;}

        if ( e.p==13 ) {a = true; s = $13(lex, e, s); continue ;}

        if ( true||lex.END||lex.tx=="import"||lex.tx=="{"||lex.tx=="this"||lex.ty==2||lex.tx=="$"||lex.tx=="_"||lex.tx=="async"||lex.tx=="get"||lex.tx=="set"||lex.tx=="target"||lex.tx=="as"||lex.tx=="from"||lex.tx=="true"||lex.tx=="false"||lex.tx=="null"||lex.tx=='"'||lex.tx=="'"||lex.tx=="-"||lex.ty==1||lex.tx=="["||lex.tx=="("||lex.tx=="++"||lex.tx=="--"||lex.tx=="delete"||lex.tx=="void"||lex.tx=="typeof"||lex.tx=="+"||lex.tx=="~"||lex.tx=="!"||lex.tx=="var"||lex.tx==";"||lex.tx=="if"||lex.tx==","||lex.tx=="."||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx=="="||lex.tx=="*="||lex.tx=="/="||lex.tx=="%="||lex.tx=="+="||lex.tx=="-="||lex.tx=="<<="||lex.tx==">>="||lex.tx==">>>="||lex.tx=="&="||lex.tx=="^="||lex.tx=="|="||lex.tx=="**=" ) return s;

        if ( !a ) break;
    }

    return s;
}

function $6(lex, e, s= []){

    e.p = -1;

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.ty==2 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $51(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="$" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $52(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="_" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $53(lex, e, s);

        return s;
    }

    if ( lex.tx=="async" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $54(lex, e, s);

        return s;
    }

    if ( lex.tx=="get" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $55(lex, e, s);

        return s;
    }

    if ( lex.tx=="set" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $56(lex, e, s);

        return s;
    }

    if ( lex.tx=="target" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $57(lex, e, s);

        return s;
    }

    if ( lex.tx=="as" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $58(lex, e, s);

        return s;
    }

    if ( lex.tx=="from" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $59(lex, e, s);

        return s;
    }

    while(1){

        let a= false;

        if ( true||lex.tx=="import"||lex.tx=="{"||lex.tx=="this"||lex.ty==2||lex.tx=="$"||lex.tx=="_"||lex.tx=="async"||lex.tx=="get"||lex.tx=="set"||lex.tx=="target"||lex.tx=="as"||lex.tx=="from"||lex.tx=="true"||lex.tx=="false"||lex.tx=="null"||lex.tx=='"'||lex.tx=="'"||lex.tx=="-"||lex.ty==1||lex.tx=="["||lex.tx=="("||lex.tx=="++"||lex.tx=="--"||lex.tx=="delete"||lex.tx=="void"||lex.tx=="typeof"||lex.tx=="+"||lex.tx=="~"||lex.tx=="!"||lex.tx=="var"||lex.tx==";"||lex.tx=="if"||lex.END ) return s;

        if ( !a ) break;
    }

    return s;
}

function $10(lex, e, s= []){

    e.p = -1;

    if ( lex.tx=="import"||lex.tx=="{"||lex.tx=="this"||lex.ty==2||lex.tx=="$"||lex.tx=="_"||lex.tx=="async"||lex.tx=="get"||lex.tx=="set"||lex.tx=="target"||lex.tx=="as"||lex.tx=="from"||lex.tx=="true"||lex.tx=="false"||lex.tx=="null"||lex.tx=='"'||lex.tx=="'"||lex.tx=="-"||lex.ty==1||lex.tx=="["||lex.tx=="("||lex.tx=="++"||lex.tx=="--"||lex.tx=="delete"||lex.tx=="void"||lex.tx=="typeof"||lex.tx=="+"||lex.tx=="~"||lex.tx=="!"||lex.tx=="var"||lex.tx==";"||lex.tx=="if"||lex.END||lex.tx=="}"||lex.tx=="else" ) {

        return (e.p = 11, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $11(lex, e, s= []){

    e.p = -1;

    if ( lex.tx=="import"||lex.tx=="{"||lex.tx=="this"||lex.ty==2||lex.tx=="$"||lex.tx=="_"||lex.tx=="async"||lex.tx=="get"||lex.tx=="set"||lex.tx=="target"||lex.tx=="as"||lex.tx=="from"||lex.tx=="true"||lex.tx=="false"||lex.tx=="null"||lex.tx=='"'||lex.tx=="'"||lex.tx=="-"||lex.ty==1||lex.tx=="["||lex.tx=="("||lex.tx=="++"||lex.tx=="--"||lex.tx=="delete"||lex.tx=="void"||lex.tx=="typeof"||lex.tx=="+"||lex.tx=="~"||lex.tx=="!"||lex.tx=="var"||lex.tx==";"||lex.tx=="if"||lex.END||lex.tx=="}"||lex.tx=="else" ) {

        return (e.p = 11, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $12(lex, e, s= []){

    e.p = -1;

    if ( lex.tx=="import"||lex.tx=="{"||lex.tx=="this"||lex.ty==2||lex.tx=="$"||lex.tx=="_"||lex.tx=="async"||lex.tx=="get"||lex.tx=="set"||lex.tx=="target"||lex.tx=="as"||lex.tx=="from"||lex.tx=="true"||lex.tx=="false"||lex.tx=="null"||lex.tx=='"'||lex.tx=="'"||lex.tx=="-"||lex.ty==1||lex.tx=="["||lex.tx=="("||lex.tx=="++"||lex.tx=="--"||lex.tx=="delete"||lex.tx=="void"||lex.tx=="typeof"||lex.tx=="+"||lex.tx=="~"||lex.tx=="!"||lex.tx=="var"||lex.tx==";"||lex.tx=="if"||lex.END||lex.tx=="}"||lex.tx=="else" ) {

        return (e.p = 11, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $13(lex, e, s= []){

    e.p = -1;

    if ( lex.tx=="import"||lex.tx=="{"||lex.tx=="this"||lex.ty==2||lex.tx=="$"||lex.tx=="_"||lex.tx=="async"||lex.tx=="get"||lex.tx=="set"||lex.tx=="target"||lex.tx=="as"||lex.tx=="from"||lex.tx=="true"||lex.tx=="false"||lex.tx=="null"||lex.tx=='"'||lex.tx=="'"||lex.tx=="-"||lex.ty==1||lex.tx=="["||lex.tx=="("||lex.tx=="++"||lex.tx=="--"||lex.tx=="delete"||lex.tx=="void"||lex.tx=="typeof"||lex.tx=="+"||lex.tx=="~"||lex.tx=="!"||lex.tx=="var"||lex.tx==";"||lex.tx=="if"||lex.END||lex.tx=="}"||lex.tx=="else" ) {

        return (e.p = 12, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $14(lex, e, s= []){

    e.p = -1;

    if ( lex.tx=="}" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $79(lex, e, s);

        return s;
    }

    if ( lex.tx=="{" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $14(lex, e, s);

        return s;
    }

    if ( lex.tx=="delete" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $32(lex, e, s);

        return s;
    }

    if ( lex.tx=="void" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $33(lex, e, s);

        return s;
    }

    if ( lex.tx=="typeof" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $34(lex, e, s);

        return s;
    }

    if ( lex.tx=="+" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $35(lex, e, s);

        return s;
    }

    if ( lex.tx=="-" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $36(lex, e, s);

        return s;
    }

    if ( lex.tx=="~" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $37(lex, e, s);

        return s;
    }

    if ( lex.tx=="!" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $38(lex, e, s);

        return s;
    }

    if ( lex.tx=="++" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $39(lex, e, s);

        return s;
    }

    if ( lex.tx=="--" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $40(lex, e, s);

        return s;
    }

    if ( lex.tx=="this" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $43(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.ty==2 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $51(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="$" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $52(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="_" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $53(lex, e, s);

        return s;
    }

    if ( lex.tx=="async" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $54(lex, e, s);

        return s;
    }

    if ( lex.tx=="get" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $55(lex, e, s);

        return s;
    }

    if ( lex.tx=="set" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $56(lex, e, s);

        return s;
    }

    if ( lex.tx=="target" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $57(lex, e, s);

        return s;
    }

    if ( lex.tx=="as" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $58(lex, e, s);

        return s;
    }

    if ( lex.tx=="from" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $59(lex, e, s);

        return s;
    }

    if ( lex.tx=="true" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $64(lex, e, s);

        return s;
    }

    if ( lex.tx=="false" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $65(lex, e, s);

        return s;
    }

    if ( lex.tx=="null" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $66(lex, e, s);

        return s;
    }

    e.fn.parseString(lex, e, e.eh, sym);

    if ( lex.tx=='"' ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $67(lex, e, s);

        return s;
    }

    e.fn.parseString(lex, e, e.eh, sym);

    if ( lex.tx=="'" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $68(lex, e, s);

        return s;
    }

    if ( lex.ty==1 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $69(lex, e, s);

        return s;
    }

    if ( lex.tx=="[" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $70(lex, e, s);

        return s;
    }

    if ( lex.tx=="(" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $71(lex, e, s);

        return s;
    }

    if ( lex.tx=="var" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $72(lex, e, s);

        return s;
    }

    if ( lex.tx==";" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $73(lex, e, s);

        return s;
    }

    if ( lex.tx=="if" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $74(lex, e, s);

        return s;
    }

    while(1){

        let a= false;

        if ( e.p==63 ) {a = true; s = $49(lex, e, s); continue ;}

        if ( e.p==60 ) {a = true; s = $50(lex, e, s); continue ;}

        if ( e.p==54 ) {a = true; s = $60(lex, e, s); continue ;}

        if ( e.p==53 ) {a = true; s = $61(lex, e, s); continue ;}

        if ( e.p==51 ) {a = true; s = $63(lex, e, s); continue ;}

        if ( e.p==46 ) {a = true; s = $46(lex, e, s); continue ;}

        if ( e.p==45 ) {a = true; s = $42(lex, e, s); continue ;}

        if ( e.p==42 ) {a = true; s = $62(lex, e, s); continue ;}

        if ( e.p==41 ) {a = true; s = $47(lex, e, s); continue ;}

        if ( e.p==40 ) {a = true; s = $31(lex, e, s); continue ;}

        if ( e.p==39 ) {a = true; s = $30(lex, e, s); continue ;}

        if ( e.p==38 ) {a = true; s = $29(lex, e, s); continue ;}

        if ( e.p==23 ) {a = true; s = $12(lex, e, s); continue ;}

        if ( e.p==20 ) {a = true; s = $11(lex, e, s); continue ;}

        if ( e.p==15 ) {a = true; s = $10(lex, e, s); continue ;}

        if ( e.p==13 ) {a = true; s = $13(lex, e, s); continue ;}

        if ( true||lex.tx=="import"||lex.tx=="{"||lex.tx=="this"||lex.ty==2||lex.tx=="$"||lex.tx=="_"||lex.tx=="async"||lex.tx=="get"||lex.tx=="set"||lex.tx=="target"||lex.tx=="as"||lex.tx=="from"||lex.tx=="true"||lex.tx=="false"||lex.tx=="null"||lex.tx=='"'||lex.tx=="'"||lex.tx=="-"||lex.ty==1||lex.tx=="["||lex.tx=="("||lex.tx=="++"||lex.tx=="--"||lex.tx=="delete"||lex.tx=="void"||lex.tx=="typeof"||lex.tx=="+"||lex.tx=="~"||lex.tx=="!"||lex.tx=="var"||lex.tx==";"||lex.tx=="if"||lex.END||lex.tx=="}"||lex.tx=="else" ) return s;

        if ( !a ) break;
    }

    return s;
}

function $29(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx==";"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        return (e.p = 37, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $30(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx==";"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        return (e.p = 38, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $31(lex, e, s= []){

    e.p = -1;

    if ( lex.tx=="**" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $123(lex, e, s);

        return s;
    }

    if ( lex.tx==","||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx==";"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        return (e.p = 39, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $32(lex, e, s= []){

    e.p = -1;

    if ( lex.tx=="delete" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $32(lex, e, s);

        return s;
    }

    if ( lex.tx=="void" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $33(lex, e, s);

        return s;
    }

    if ( lex.tx=="typeof" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $34(lex, e, s);

        return s;
    }

    if ( lex.tx=="+" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $35(lex, e, s);

        return s;
    }

    if ( lex.tx=="-" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $36(lex, e, s);

        return s;
    }

    if ( lex.tx=="~" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $37(lex, e, s);

        return s;
    }

    if ( lex.tx=="!" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $38(lex, e, s);

        return s;
    }

    if ( lex.tx=="++" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $39(lex, e, s);

        return s;
    }

    if ( lex.tx=="--" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $40(lex, e, s);

        return s;
    }

    if ( lex.tx=="this" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $43(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.ty==2 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $51(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="$" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $52(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="_" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $53(lex, e, s);

        return s;
    }

    if ( lex.tx=="async" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $54(lex, e, s);

        return s;
    }

    if ( lex.tx=="get" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $55(lex, e, s);

        return s;
    }

    if ( lex.tx=="set" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $56(lex, e, s);

        return s;
    }

    if ( lex.tx=="target" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $57(lex, e, s);

        return s;
    }

    if ( lex.tx=="as" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $58(lex, e, s);

        return s;
    }

    if ( lex.tx=="from" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $59(lex, e, s);

        return s;
    }

    if ( lex.tx=="true" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $64(lex, e, s);

        return s;
    }

    if ( lex.tx=="false" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $65(lex, e, s);

        return s;
    }

    if ( lex.tx=="null" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $66(lex, e, s);

        return s;
    }

    e.fn.parseString(lex, e, e.eh, sym);

    if ( lex.tx=='"' ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $67(lex, e, s);

        return s;
    }

    e.fn.parseString(lex, e, e.eh, sym);

    if ( lex.tx=="'" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $68(lex, e, s);

        return s;
    }

    if ( lex.ty==1 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $69(lex, e, s);

        return s;
    }

    if ( lex.tx=="[" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $70(lex, e, s);

        return s;
    }

    if ( lex.tx=="(" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $71(lex, e, s);

        return s;
    }

    while(1){

        let a= false;

        if ( e.p==63 ) {a = true; s = $49(lex, e, s); continue ;}

        if ( e.p==60 ) {a = true; s = $50(lex, e, s); continue ;}

        if ( e.p==54 ) {a = true; s = $60(lex, e, s); continue ;}

        if ( e.p==53 ) {a = true; s = $61(lex, e, s); continue ;}

        if ( e.p==51 ) {a = true; s = $63(lex, e, s); continue ;}

        if ( e.p==46 ) {a = true; s = $46(lex, e, s); continue ;}

        if ( e.p==45 ) {a = true; s = $42(lex, e, s); continue ;}

        if ( e.p==42 ) {a = true; s = $62(lex, e, s); continue ;}

        if ( e.p==41 ) {a = true; s = $47(lex, e, s); continue ;}

        if ( e.p==40 ) {a = true; s = $125(lex, e, s); continue ;}

        if ( e.p==39 ) {a = true; s = $124(lex, e, s); continue ;}

        if ( true||lex.tx==","||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx==";"||lex.tx=="**"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) return s;

        if ( !a ) break;
    }

    return s;
}

function $33(lex, e, s= []){

    e.p = -1;

    if ( lex.tx=="delete" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $32(lex, e, s);

        return s;
    }

    if ( lex.tx=="void" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $33(lex, e, s);

        return s;
    }

    if ( lex.tx=="typeof" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $34(lex, e, s);

        return s;
    }

    if ( lex.tx=="+" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $35(lex, e, s);

        return s;
    }

    if ( lex.tx=="-" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $36(lex, e, s);

        return s;
    }

    if ( lex.tx=="~" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $37(lex, e, s);

        return s;
    }

    if ( lex.tx=="!" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $38(lex, e, s);

        return s;
    }

    if ( lex.tx=="++" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $39(lex, e, s);

        return s;
    }

    if ( lex.tx=="--" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $40(lex, e, s);

        return s;
    }

    if ( lex.tx=="this" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $43(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.ty==2 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $51(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="$" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $52(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="_" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $53(lex, e, s);

        return s;
    }

    if ( lex.tx=="async" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $54(lex, e, s);

        return s;
    }

    if ( lex.tx=="get" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $55(lex, e, s);

        return s;
    }

    if ( lex.tx=="set" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $56(lex, e, s);

        return s;
    }

    if ( lex.tx=="target" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $57(lex, e, s);

        return s;
    }

    if ( lex.tx=="as" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $58(lex, e, s);

        return s;
    }

    if ( lex.tx=="from" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $59(lex, e, s);

        return s;
    }

    if ( lex.tx=="true" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $64(lex, e, s);

        return s;
    }

    if ( lex.tx=="false" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $65(lex, e, s);

        return s;
    }

    if ( lex.tx=="null" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $66(lex, e, s);

        return s;
    }

    e.fn.parseString(lex, e, e.eh, sym);

    if ( lex.tx=='"' ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $67(lex, e, s);

        return s;
    }

    e.fn.parseString(lex, e, e.eh, sym);

    if ( lex.tx=="'" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $68(lex, e, s);

        return s;
    }

    if ( lex.ty==1 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $69(lex, e, s);

        return s;
    }

    if ( lex.tx=="[" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $70(lex, e, s);

        return s;
    }

    if ( lex.tx=="(" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $71(lex, e, s);

        return s;
    }

    while(1){

        let a= false;

        if ( e.p==63 ) {a = true; s = $49(lex, e, s); continue ;}

        if ( e.p==60 ) {a = true; s = $50(lex, e, s); continue ;}

        if ( e.p==54 ) {a = true; s = $60(lex, e, s); continue ;}

        if ( e.p==53 ) {a = true; s = $61(lex, e, s); continue ;}

        if ( e.p==51 ) {a = true; s = $63(lex, e, s); continue ;}

        if ( e.p==46 ) {a = true; s = $46(lex, e, s); continue ;}

        if ( e.p==45 ) {a = true; s = $42(lex, e, s); continue ;}

        if ( e.p==42 ) {a = true; s = $62(lex, e, s); continue ;}

        if ( e.p==41 ) {a = true; s = $47(lex, e, s); continue ;}

        if ( e.p==40 ) {a = true; s = $125(lex, e, s); continue ;}

        if ( e.p==39 ) {a = true; s = $127(lex, e, s); continue ;}

        if ( true||lex.tx==","||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx==";"||lex.tx=="**"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) return s;

        if ( !a ) break;
    }

    return s;
}

function $34(lex, e, s= []){

    e.p = -1;

    if ( lex.tx=="delete" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $32(lex, e, s);

        return s;
    }

    if ( lex.tx=="void" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $33(lex, e, s);

        return s;
    }

    if ( lex.tx=="typeof" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $34(lex, e, s);

        return s;
    }

    if ( lex.tx=="+" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $35(lex, e, s);

        return s;
    }

    if ( lex.tx=="-" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $36(lex, e, s);

        return s;
    }

    if ( lex.tx=="~" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $37(lex, e, s);

        return s;
    }

    if ( lex.tx=="!" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $38(lex, e, s);

        return s;
    }

    if ( lex.tx=="++" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $39(lex, e, s);

        return s;
    }

    if ( lex.tx=="--" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $40(lex, e, s);

        return s;
    }

    if ( lex.tx=="this" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $43(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.ty==2 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $51(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="$" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $52(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="_" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $53(lex, e, s);

        return s;
    }

    if ( lex.tx=="async" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $54(lex, e, s);

        return s;
    }

    if ( lex.tx=="get" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $55(lex, e, s);

        return s;
    }

    if ( lex.tx=="set" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $56(lex, e, s);

        return s;
    }

    if ( lex.tx=="target" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $57(lex, e, s);

        return s;
    }

    if ( lex.tx=="as" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $58(lex, e, s);

        return s;
    }

    if ( lex.tx=="from" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $59(lex, e, s);

        return s;
    }

    if ( lex.tx=="true" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $64(lex, e, s);

        return s;
    }

    if ( lex.tx=="false" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $65(lex, e, s);

        return s;
    }

    if ( lex.tx=="null" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $66(lex, e, s);

        return s;
    }

    e.fn.parseString(lex, e, e.eh, sym);

    if ( lex.tx=='"' ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $67(lex, e, s);

        return s;
    }

    e.fn.parseString(lex, e, e.eh, sym);

    if ( lex.tx=="'" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $68(lex, e, s);

        return s;
    }

    if ( lex.ty==1 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $69(lex, e, s);

        return s;
    }

    if ( lex.tx=="[" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $70(lex, e, s);

        return s;
    }

    if ( lex.tx=="(" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $71(lex, e, s);

        return s;
    }

    while(1){

        let a= false;

        if ( e.p==63 ) {a = true; s = $49(lex, e, s); continue ;}

        if ( e.p==60 ) {a = true; s = $50(lex, e, s); continue ;}

        if ( e.p==54 ) {a = true; s = $60(lex, e, s); continue ;}

        if ( e.p==53 ) {a = true; s = $61(lex, e, s); continue ;}

        if ( e.p==51 ) {a = true; s = $63(lex, e, s); continue ;}

        if ( e.p==46 ) {a = true; s = $46(lex, e, s); continue ;}

        if ( e.p==45 ) {a = true; s = $42(lex, e, s); continue ;}

        if ( e.p==42 ) {a = true; s = $62(lex, e, s); continue ;}

        if ( e.p==41 ) {a = true; s = $47(lex, e, s); continue ;}

        if ( e.p==40 ) {a = true; s = $125(lex, e, s); continue ;}

        if ( e.p==39 ) {a = true; s = $128(lex, e, s); continue ;}

        if ( true||lex.tx==","||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx==";"||lex.tx=="**"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) return s;

        if ( !a ) break;
    }

    return s;
}

function $35(lex, e, s= []){

    e.p = -1;

    if ( lex.tx=="delete" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $32(lex, e, s);

        return s;
    }

    if ( lex.tx=="void" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $33(lex, e, s);

        return s;
    }

    if ( lex.tx=="typeof" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $34(lex, e, s);

        return s;
    }

    if ( lex.tx=="+" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $35(lex, e, s);

        return s;
    }

    if ( lex.tx=="-" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $36(lex, e, s);

        return s;
    }

    if ( lex.tx=="~" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $37(lex, e, s);

        return s;
    }

    if ( lex.tx=="!" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $38(lex, e, s);

        return s;
    }

    if ( lex.tx=="++" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $39(lex, e, s);

        return s;
    }

    if ( lex.tx=="--" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $40(lex, e, s);

        return s;
    }

    if ( lex.tx=="this" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $43(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.ty==2 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $51(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="$" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $52(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="_" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $53(lex, e, s);

        return s;
    }

    if ( lex.tx=="async" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $54(lex, e, s);

        return s;
    }

    if ( lex.tx=="get" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $55(lex, e, s);

        return s;
    }

    if ( lex.tx=="set" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $56(lex, e, s);

        return s;
    }

    if ( lex.tx=="target" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $57(lex, e, s);

        return s;
    }

    if ( lex.tx=="as" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $58(lex, e, s);

        return s;
    }

    if ( lex.tx=="from" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $59(lex, e, s);

        return s;
    }

    if ( lex.tx=="true" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $64(lex, e, s);

        return s;
    }

    if ( lex.tx=="false" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $65(lex, e, s);

        return s;
    }

    if ( lex.tx=="null" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $66(lex, e, s);

        return s;
    }

    e.fn.parseString(lex, e, e.eh, sym);

    if ( lex.tx=='"' ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $67(lex, e, s);

        return s;
    }

    e.fn.parseString(lex, e, e.eh, sym);

    if ( lex.tx=="'" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $68(lex, e, s);

        return s;
    }

    if ( lex.ty==1 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $69(lex, e, s);

        return s;
    }

    if ( lex.tx=="[" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $70(lex, e, s);

        return s;
    }

    if ( lex.tx=="(" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $71(lex, e, s);

        return s;
    }

    while(1){

        let a= false;

        if ( e.p==63 ) {a = true; s = $49(lex, e, s); continue ;}

        if ( e.p==60 ) {a = true; s = $50(lex, e, s); continue ;}

        if ( e.p==54 ) {a = true; s = $60(lex, e, s); continue ;}

        if ( e.p==53 ) {a = true; s = $61(lex, e, s); continue ;}

        if ( e.p==51 ) {a = true; s = $63(lex, e, s); continue ;}

        if ( e.p==46 ) {a = true; s = $46(lex, e, s); continue ;}

        if ( e.p==45 ) {a = true; s = $42(lex, e, s); continue ;}

        if ( e.p==42 ) {a = true; s = $62(lex, e, s); continue ;}

        if ( e.p==41 ) {a = true; s = $47(lex, e, s); continue ;}

        if ( e.p==40 ) {a = true; s = $125(lex, e, s); continue ;}

        if ( e.p==39 ) {a = true; s = $129(lex, e, s); continue ;}

        if ( true||lex.tx==","||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx==";"||lex.tx=="**"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) return s;

        if ( !a ) break;
    }

    return s;
}

function $36(lex, e, s= []){

    e.p = -1;

    if ( lex.ty==1 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $131(lex, e, s);

        return s;
    }

    if ( lex.tx=="delete" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $32(lex, e, s);

        return s;
    }

    if ( lex.tx=="void" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $33(lex, e, s);

        return s;
    }

    if ( lex.tx=="typeof" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $34(lex, e, s);

        return s;
    }

    if ( lex.tx=="+" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $35(lex, e, s);

        return s;
    }

    if ( lex.tx=="-" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $36(lex, e, s);

        return s;
    }

    if ( lex.tx=="~" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $37(lex, e, s);

        return s;
    }

    if ( lex.tx=="!" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $38(lex, e, s);

        return s;
    }

    if ( lex.tx=="++" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $39(lex, e, s);

        return s;
    }

    if ( lex.tx=="--" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $40(lex, e, s);

        return s;
    }

    if ( lex.tx=="this" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $43(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.ty==2 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $51(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="$" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $52(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="_" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $53(lex, e, s);

        return s;
    }

    if ( lex.tx=="async" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $54(lex, e, s);

        return s;
    }

    if ( lex.tx=="get" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $55(lex, e, s);

        return s;
    }

    if ( lex.tx=="set" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $56(lex, e, s);

        return s;
    }

    if ( lex.tx=="target" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $57(lex, e, s);

        return s;
    }

    if ( lex.tx=="as" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $58(lex, e, s);

        return s;
    }

    if ( lex.tx=="from" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $59(lex, e, s);

        return s;
    }

    if ( lex.tx=="true" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $64(lex, e, s);

        return s;
    }

    if ( lex.tx=="false" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $65(lex, e, s);

        return s;
    }

    if ( lex.tx=="null" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $66(lex, e, s);

        return s;
    }

    e.fn.parseString(lex, e, e.eh, sym);

    if ( lex.tx=='"' ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $67(lex, e, s);

        return s;
    }

    e.fn.parseString(lex, e, e.eh, sym);

    if ( lex.tx=="'" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $68(lex, e, s);

        return s;
    }

    if ( lex.tx=="[" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $70(lex, e, s);

        return s;
    }

    if ( lex.tx=="(" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $71(lex, e, s);

        return s;
    }

    while(1){

        let a= false;

        if ( e.p==63 ) {a = true; s = $49(lex, e, s); continue ;}

        if ( e.p==60 ) {a = true; s = $50(lex, e, s); continue ;}

        if ( e.p==54 ) {a = true; s = $60(lex, e, s); continue ;}

        if ( e.p==53 ) {a = true; s = $61(lex, e, s); continue ;}

        if ( e.p==51 ) {a = true; s = $63(lex, e, s); continue ;}

        if ( e.p==46 ) {a = true; s = $46(lex, e, s); continue ;}

        if ( e.p==45 ) {a = true; s = $42(lex, e, s); continue ;}

        if ( e.p==42 ) {a = true; s = $62(lex, e, s); continue ;}

        if ( e.p==41 ) {a = true; s = $47(lex, e, s); continue ;}

        if ( e.p==40 ) {a = true; s = $125(lex, e, s); continue ;}

        if ( e.p==39 ) {a = true; s = $130(lex, e, s); continue ;}

        if ( true||lex.tx==","||lex.tx=="["||lex.tx=="."||lex.tx=="++"||lex.tx=="--"||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx=="="||lex.tx=="*="||lex.tx=="/="||lex.tx=="%="||lex.tx=="+="||lex.tx=="-="||lex.tx=="<<="||lex.tx==">>="||lex.tx==">>>="||lex.tx=="&="||lex.tx=="^="||lex.tx=="|="||lex.tx=="**="||lex.tx==";"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) return s;

        if ( !a ) break;
    }

    return s;
}

function $37(lex, e, s= []){

    e.p = -1;

    if ( lex.tx=="delete" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $32(lex, e, s);

        return s;
    }

    if ( lex.tx=="void" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $33(lex, e, s);

        return s;
    }

    if ( lex.tx=="typeof" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $34(lex, e, s);

        return s;
    }

    if ( lex.tx=="+" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $35(lex, e, s);

        return s;
    }

    if ( lex.tx=="-" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $36(lex, e, s);

        return s;
    }

    if ( lex.tx=="~" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $37(lex, e, s);

        return s;
    }

    if ( lex.tx=="!" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $38(lex, e, s);

        return s;
    }

    if ( lex.tx=="++" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $39(lex, e, s);

        return s;
    }

    if ( lex.tx=="--" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $40(lex, e, s);

        return s;
    }

    if ( lex.tx=="this" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $43(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.ty==2 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $51(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="$" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $52(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="_" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $53(lex, e, s);

        return s;
    }

    if ( lex.tx=="async" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $54(lex, e, s);

        return s;
    }

    if ( lex.tx=="get" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $55(lex, e, s);

        return s;
    }

    if ( lex.tx=="set" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $56(lex, e, s);

        return s;
    }

    if ( lex.tx=="target" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $57(lex, e, s);

        return s;
    }

    if ( lex.tx=="as" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $58(lex, e, s);

        return s;
    }

    if ( lex.tx=="from" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $59(lex, e, s);

        return s;
    }

    if ( lex.tx=="true" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $64(lex, e, s);

        return s;
    }

    if ( lex.tx=="false" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $65(lex, e, s);

        return s;
    }

    if ( lex.tx=="null" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $66(lex, e, s);

        return s;
    }

    e.fn.parseString(lex, e, e.eh, sym);

    if ( lex.tx=='"' ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $67(lex, e, s);

        return s;
    }

    e.fn.parseString(lex, e, e.eh, sym);

    if ( lex.tx=="'" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $68(lex, e, s);

        return s;
    }

    if ( lex.ty==1 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $69(lex, e, s);

        return s;
    }

    if ( lex.tx=="[" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $70(lex, e, s);

        return s;
    }

    if ( lex.tx=="(" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $71(lex, e, s);

        return s;
    }

    while(1){

        let a= false;

        if ( e.p==63 ) {a = true; s = $49(lex, e, s); continue ;}

        if ( e.p==60 ) {a = true; s = $50(lex, e, s); continue ;}

        if ( e.p==54 ) {a = true; s = $60(lex, e, s); continue ;}

        if ( e.p==53 ) {a = true; s = $61(lex, e, s); continue ;}

        if ( e.p==51 ) {a = true; s = $63(lex, e, s); continue ;}

        if ( e.p==46 ) {a = true; s = $46(lex, e, s); continue ;}

        if ( e.p==45 ) {a = true; s = $42(lex, e, s); continue ;}

        if ( e.p==42 ) {a = true; s = $62(lex, e, s); continue ;}

        if ( e.p==41 ) {a = true; s = $47(lex, e, s); continue ;}

        if ( e.p==40 ) {a = true; s = $125(lex, e, s); continue ;}

        if ( e.p==39 ) {a = true; s = $132(lex, e, s); continue ;}

        if ( true||lex.tx==","||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx==";"||lex.tx=="**"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) return s;

        if ( !a ) break;
    }

    return s;
}

function $38(lex, e, s= []){

    e.p = -1;

    if ( lex.tx=="delete" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $32(lex, e, s);

        return s;
    }

    if ( lex.tx=="void" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $33(lex, e, s);

        return s;
    }

    if ( lex.tx=="typeof" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $34(lex, e, s);

        return s;
    }

    if ( lex.tx=="+" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $35(lex, e, s);

        return s;
    }

    if ( lex.tx=="-" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $36(lex, e, s);

        return s;
    }

    if ( lex.tx=="~" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $37(lex, e, s);

        return s;
    }

    if ( lex.tx=="!" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $38(lex, e, s);

        return s;
    }

    if ( lex.tx=="++" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $39(lex, e, s);

        return s;
    }

    if ( lex.tx=="--" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $40(lex, e, s);

        return s;
    }

    if ( lex.tx=="this" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $43(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.ty==2 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $51(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="$" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $52(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="_" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $53(lex, e, s);

        return s;
    }

    if ( lex.tx=="async" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $54(lex, e, s);

        return s;
    }

    if ( lex.tx=="get" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $55(lex, e, s);

        return s;
    }

    if ( lex.tx=="set" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $56(lex, e, s);

        return s;
    }

    if ( lex.tx=="target" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $57(lex, e, s);

        return s;
    }

    if ( lex.tx=="as" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $58(lex, e, s);

        return s;
    }

    if ( lex.tx=="from" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $59(lex, e, s);

        return s;
    }

    if ( lex.tx=="true" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $64(lex, e, s);

        return s;
    }

    if ( lex.tx=="false" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $65(lex, e, s);

        return s;
    }

    if ( lex.tx=="null" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $66(lex, e, s);

        return s;
    }

    e.fn.parseString(lex, e, e.eh, sym);

    if ( lex.tx=='"' ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $67(lex, e, s);

        return s;
    }

    e.fn.parseString(lex, e, e.eh, sym);

    if ( lex.tx=="'" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $68(lex, e, s);

        return s;
    }

    if ( lex.ty==1 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $69(lex, e, s);

        return s;
    }

    if ( lex.tx=="[" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $70(lex, e, s);

        return s;
    }

    if ( lex.tx=="(" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $71(lex, e, s);

        return s;
    }

    while(1){

        let a= false;

        if ( e.p==63 ) {a = true; s = $49(lex, e, s); continue ;}

        if ( e.p==60 ) {a = true; s = $50(lex, e, s); continue ;}

        if ( e.p==54 ) {a = true; s = $60(lex, e, s); continue ;}

        if ( e.p==53 ) {a = true; s = $61(lex, e, s); continue ;}

        if ( e.p==51 ) {a = true; s = $63(lex, e, s); continue ;}

        if ( e.p==46 ) {a = true; s = $46(lex, e, s); continue ;}

        if ( e.p==45 ) {a = true; s = $42(lex, e, s); continue ;}

        if ( e.p==42 ) {a = true; s = $62(lex, e, s); continue ;}

        if ( e.p==41 ) {a = true; s = $47(lex, e, s); continue ;}

        if ( e.p==40 ) {a = true; s = $125(lex, e, s); continue ;}

        if ( e.p==39 ) {a = true; s = $133(lex, e, s); continue ;}

        if ( true||lex.tx==","||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx==";"||lex.tx=="**"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) return s;

        if ( !a ) break;
    }

    return s;
}

function $39(lex, e, s= []){

    e.p = -1;

    if ( lex.tx=="delete" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $32(lex, e, s);

        return s;
    }

    if ( lex.tx=="void" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $33(lex, e, s);

        return s;
    }

    if ( lex.tx=="typeof" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $34(lex, e, s);

        return s;
    }

    if ( lex.tx=="+" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $35(lex, e, s);

        return s;
    }

    if ( lex.tx=="-" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $36(lex, e, s);

        return s;
    }

    if ( lex.tx=="~" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $37(lex, e, s);

        return s;
    }

    if ( lex.tx=="!" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $38(lex, e, s);

        return s;
    }

    if ( lex.tx=="++" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $39(lex, e, s);

        return s;
    }

    if ( lex.tx=="--" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $40(lex, e, s);

        return s;
    }

    if ( lex.tx=="this" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $43(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.ty==2 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $51(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="$" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $52(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="_" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $53(lex, e, s);

        return s;
    }

    if ( lex.tx=="async" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $54(lex, e, s);

        return s;
    }

    if ( lex.tx=="get" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $55(lex, e, s);

        return s;
    }

    if ( lex.tx=="set" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $56(lex, e, s);

        return s;
    }

    if ( lex.tx=="target" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $57(lex, e, s);

        return s;
    }

    if ( lex.tx=="as" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $58(lex, e, s);

        return s;
    }

    if ( lex.tx=="from" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $59(lex, e, s);

        return s;
    }

    if ( lex.tx=="true" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $64(lex, e, s);

        return s;
    }

    if ( lex.tx=="false" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $65(lex, e, s);

        return s;
    }

    if ( lex.tx=="null" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $66(lex, e, s);

        return s;
    }

    e.fn.parseString(lex, e, e.eh, sym);

    if ( lex.tx=='"' ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $67(lex, e, s);

        return s;
    }

    e.fn.parseString(lex, e, e.eh, sym);

    if ( lex.tx=="'" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $68(lex, e, s);

        return s;
    }

    if ( lex.ty==1 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $69(lex, e, s);

        return s;
    }

    if ( lex.tx=="[" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $70(lex, e, s);

        return s;
    }

    if ( lex.tx=="(" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $71(lex, e, s);

        return s;
    }

    while(1){

        let a= false;

        if ( e.p==63 ) {a = true; s = $49(lex, e, s); continue ;}

        if ( e.p==60 ) {a = true; s = $50(lex, e, s); continue ;}

        if ( e.p==54 ) {a = true; s = $60(lex, e, s); continue ;}

        if ( e.p==53 ) {a = true; s = $61(lex, e, s); continue ;}

        if ( e.p==51 ) {a = true; s = $63(lex, e, s); continue ;}

        if ( e.p==46 ) {a = true; s = $46(lex, e, s); continue ;}

        if ( e.p==45 ) {a = true; s = $42(lex, e, s); continue ;}

        if ( e.p==42 ) {a = true; s = $62(lex, e, s); continue ;}

        if ( e.p==41 ) {a = true; s = $47(lex, e, s); continue ;}

        if ( e.p==40 ) {a = true; s = $125(lex, e, s); continue ;}

        if ( e.p==39 ) {a = true; s = $134(lex, e, s); continue ;}

        if ( true||lex.tx==","||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx==";"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) return s;

        if ( !a ) break;
    }

    return s;
}

function $40(lex, e, s= []){

    e.p = -1;

    if ( lex.tx=="delete" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $32(lex, e, s);

        return s;
    }

    if ( lex.tx=="void" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $33(lex, e, s);

        return s;
    }

    if ( lex.tx=="typeof" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $34(lex, e, s);

        return s;
    }

    if ( lex.tx=="+" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $35(lex, e, s);

        return s;
    }

    if ( lex.tx=="-" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $36(lex, e, s);

        return s;
    }

    if ( lex.tx=="~" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $37(lex, e, s);

        return s;
    }

    if ( lex.tx=="!" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $38(lex, e, s);

        return s;
    }

    if ( lex.tx=="++" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $39(lex, e, s);

        return s;
    }

    if ( lex.tx=="--" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $40(lex, e, s);

        return s;
    }

    if ( lex.tx=="this" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $43(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.ty==2 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $51(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="$" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $52(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="_" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $53(lex, e, s);

        return s;
    }

    if ( lex.tx=="async" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $54(lex, e, s);

        return s;
    }

    if ( lex.tx=="get" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $55(lex, e, s);

        return s;
    }

    if ( lex.tx=="set" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $56(lex, e, s);

        return s;
    }

    if ( lex.tx=="target" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $57(lex, e, s);

        return s;
    }

    if ( lex.tx=="as" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $58(lex, e, s);

        return s;
    }

    if ( lex.tx=="from" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $59(lex, e, s);

        return s;
    }

    if ( lex.tx=="true" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $64(lex, e, s);

        return s;
    }

    if ( lex.tx=="false" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $65(lex, e, s);

        return s;
    }

    if ( lex.tx=="null" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $66(lex, e, s);

        return s;
    }

    e.fn.parseString(lex, e, e.eh, sym);

    if ( lex.tx=='"' ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $67(lex, e, s);

        return s;
    }

    e.fn.parseString(lex, e, e.eh, sym);

    if ( lex.tx=="'" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $68(lex, e, s);

        return s;
    }

    if ( lex.ty==1 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $69(lex, e, s);

        return s;
    }

    if ( lex.tx=="[" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $70(lex, e, s);

        return s;
    }

    if ( lex.tx=="(" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $71(lex, e, s);

        return s;
    }

    while(1){

        let a= false;

        if ( e.p==63 ) {a = true; s = $49(lex, e, s); continue ;}

        if ( e.p==60 ) {a = true; s = $50(lex, e, s); continue ;}

        if ( e.p==54 ) {a = true; s = $60(lex, e, s); continue ;}

        if ( e.p==53 ) {a = true; s = $61(lex, e, s); continue ;}

        if ( e.p==51 ) {a = true; s = $63(lex, e, s); continue ;}

        if ( e.p==46 ) {a = true; s = $46(lex, e, s); continue ;}

        if ( e.p==45 ) {a = true; s = $42(lex, e, s); continue ;}

        if ( e.p==42 ) {a = true; s = $62(lex, e, s); continue ;}

        if ( e.p==41 ) {a = true; s = $47(lex, e, s); continue ;}

        if ( e.p==40 ) {a = true; s = $125(lex, e, s); continue ;}

        if ( e.p==39 ) {a = true; s = $135(lex, e, s); continue ;}

        if ( true||lex.tx==","||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx==";"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) return s;

        if ( !a ) break;
    }

    return s;
}

function $42(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="["||lex.tx=="."||lex.tx=="++"||lex.tx=="--"||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx=="="||lex.tx=="*="||lex.tx=="/="||lex.tx=="%="||lex.tx=="+="||lex.tx=="-="||lex.tx=="<<="||lex.tx==">>="||lex.tx==">>>="||lex.tx=="&="||lex.tx=="^="||lex.tx=="|="||lex.tx=="**="||lex.tx==";"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        return (e.p = 44, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $43(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="["||lex.tx=="."||lex.tx=="++"||lex.tx=="--"||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx=="="||lex.tx=="*="||lex.tx=="/="||lex.tx=="%="||lex.tx=="+="||lex.tx=="-="||lex.tx=="<<="||lex.tx==">>="||lex.tx==">>>="||lex.tx=="&="||lex.tx=="^="||lex.tx=="|="||lex.tx=="**="||lex.tx==";"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        const sym= s.slice(-1);

        s.splice(-1, 1, { type:"ThisLiteral", pos });

        return (e.p = 45, s);
    }

    return s;
}

function $46(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="["||lex.tx=="."||lex.tx=="++"||lex.tx=="--"||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx=="="||lex.tx=="*="||lex.tx=="/="||lex.tx=="%="||lex.tx=="+="||lex.tx=="-="||lex.tx=="<<="||lex.tx==">>="||lex.tx==">>>="||lex.tx=="&="||lex.tx=="^="||lex.tx=="|="||lex.tx=="**="||lex.tx==";"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        return (e.p = 45, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $47(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="["||lex.tx=="."||lex.tx=="++"||lex.tx=="--"||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx=="="||lex.tx=="*="||lex.tx=="/="||lex.tx=="%="||lex.tx=="+="||lex.tx=="-="||lex.tx=="<<="||lex.tx==">>="||lex.tx==">>>="||lex.tx=="&="||lex.tx=="^="||lex.tx=="|="||lex.tx=="**="||lex.tx==";"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        return (e.p = 45, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $49(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="["||lex.tx=="."||lex.tx=="++"||lex.tx=="--"||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx=="="||lex.tx=="*="||lex.tx=="/="||lex.tx=="%="||lex.tx=="+="||lex.tx=="-="||lex.tx=="<<="||lex.tx==">>="||lex.tx==">>>="||lex.tx=="&="||lex.tx=="^="||lex.tx=="|="||lex.tx=="**="||lex.tx==";"||lex.tx=="from"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        const sym= s.slice(-1);

        s.splice(-1, 1, { type:"Identifier", value:sym[0], pos });

        return (e.p = 58, s);
    }

    return s;
}

function $50(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="["||lex.tx=="."||lex.tx=="++"||lex.tx=="--"||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx=="="||lex.tx=="*="||lex.tx=="/="||lex.tx=="%="||lex.tx=="+="||lex.tx=="-="||lex.tx=="<<="||lex.tx==">>="||lex.tx==">>>="||lex.tx=="&="||lex.tx=="^="||lex.tx=="|="||lex.tx=="**="||lex.tx==";"||lex.tx=="from"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        const sym= s.slice(-1);

        s.splice(-1, 1, { type:"Identifier", value:sym[0], pos });

        return (e.p = 58, s);
    }

    return s;
}

function $51(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="["||lex.tx=="."||lex.tx=="++"||lex.tx=="--"||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx=="="||lex.tx=="*="||lex.tx=="/="||lex.tx=="%="||lex.tx=="+="||lex.tx=="-="||lex.tx=="<<="||lex.tx==">>="||lex.tx==">>>="||lex.tx=="&="||lex.tx=="^="||lex.tx=="|="||lex.tx=="**="||lex.tx==";"||lex.tx=="from"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        return (e.p = 63, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $52(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="["||lex.tx=="."||lex.tx=="++"||lex.tx=="--"||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx=="="||lex.tx=="*="||lex.tx=="/="||lex.tx=="%="||lex.tx=="+="||lex.tx=="-="||lex.tx=="<<="||lex.tx==">>="||lex.tx==">>>="||lex.tx=="&="||lex.tx=="^="||lex.tx=="|="||lex.tx=="**="||lex.tx==";"||lex.tx=="from"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        return (e.p = 63, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $53(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="["||lex.tx=="."||lex.tx=="++"||lex.tx=="--"||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx=="="||lex.tx=="*="||lex.tx=="/="||lex.tx=="%="||lex.tx=="+="||lex.tx=="-="||lex.tx=="<<="||lex.tx==">>="||lex.tx==">>>="||lex.tx=="&="||lex.tx=="^="||lex.tx=="|="||lex.tx=="**="||lex.tx==";"||lex.tx=="from"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        return (e.p = 63, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $54(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="["||lex.tx=="."||lex.tx=="++"||lex.tx=="--"||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx=="="||lex.tx=="*="||lex.tx=="/="||lex.tx=="%="||lex.tx=="+="||lex.tx=="-="||lex.tx=="<<="||lex.tx==">>="||lex.tx==">>>="||lex.tx=="&="||lex.tx=="^="||lex.tx=="|="||lex.tx=="**="||lex.tx==";"||lex.tx=="from"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        return (e.p = 60, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $55(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="["||lex.tx=="."||lex.tx=="++"||lex.tx=="--"||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx=="="||lex.tx=="*="||lex.tx=="/="||lex.tx=="%="||lex.tx=="+="||lex.tx=="-="||lex.tx=="<<="||lex.tx==">>="||lex.tx==">>>="||lex.tx=="&="||lex.tx=="^="||lex.tx=="|="||lex.tx=="**="||lex.tx==";"||lex.tx=="from"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        return (e.p = 60, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $56(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="["||lex.tx=="."||lex.tx=="++"||lex.tx=="--"||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx=="="||lex.tx=="*="||lex.tx=="/="||lex.tx=="%="||lex.tx=="+="||lex.tx=="-="||lex.tx=="<<="||lex.tx==">>="||lex.tx==">>>="||lex.tx=="&="||lex.tx=="^="||lex.tx=="|="||lex.tx=="**="||lex.tx==";"||lex.tx=="from"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        return (e.p = 60, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $57(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="["||lex.tx=="."||lex.tx=="++"||lex.tx=="--"||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx=="="||lex.tx=="*="||lex.tx=="/="||lex.tx=="%="||lex.tx=="+="||lex.tx=="-="||lex.tx=="<<="||lex.tx==">>="||lex.tx==">>>="||lex.tx=="&="||lex.tx=="^="||lex.tx=="|="||lex.tx=="**="||lex.tx==";"||lex.tx=="from"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        return (e.p = 60, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $58(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="["||lex.tx=="."||lex.tx=="++"||lex.tx=="--"||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx=="="||lex.tx=="*="||lex.tx=="/="||lex.tx=="%="||lex.tx=="+="||lex.tx=="-="||lex.tx=="<<="||lex.tx==">>="||lex.tx==">>>="||lex.tx=="&="||lex.tx=="^="||lex.tx=="|="||lex.tx=="**="||lex.tx==";"||lex.tx=="from"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        return (e.p = 60, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $59(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="["||lex.tx=="."||lex.tx=="++"||lex.tx=="--"||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx=="="||lex.tx=="*="||lex.tx=="/="||lex.tx=="%="||lex.tx=="+="||lex.tx=="-="||lex.tx=="<<="||lex.tx==">>="||lex.tx==">>>="||lex.tx=="&="||lex.tx=="^="||lex.tx=="|="||lex.tx=="**="||lex.tx==";"||lex.tx=="from"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        return (e.p = 60, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $60(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="["||lex.tx=="."||lex.tx=="++"||lex.tx=="--"||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx=="="||lex.tx=="*="||lex.tx=="/="||lex.tx=="%="||lex.tx=="+="||lex.tx=="-="||lex.tx=="<<="||lex.tx==">>="||lex.tx==">>>="||lex.tx=="&="||lex.tx=="^="||lex.tx=="|="||lex.tx=="**="||lex.tx==";"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        return (e.p = 50, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $61(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="["||lex.tx=="."||lex.tx=="++"||lex.tx=="--"||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx=="="||lex.tx=="*="||lex.tx=="/="||lex.tx=="%="||lex.tx=="+="||lex.tx=="-="||lex.tx=="<<="||lex.tx==">>="||lex.tx==">>>="||lex.tx=="&="||lex.tx=="^="||lex.tx=="|="||lex.tx=="**="||lex.tx==";"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        return (e.p = 50, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $62(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="["||lex.tx=="."||lex.tx=="++"||lex.tx=="--"||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx=="="||lex.tx=="*="||lex.tx=="/="||lex.tx=="%="||lex.tx=="+="||lex.tx=="-="||lex.tx=="<<="||lex.tx==">>="||lex.tx==">>>="||lex.tx=="&="||lex.tx=="^="||lex.tx=="|="||lex.tx=="**="||lex.tx==";"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        return (e.p = 50, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $63(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="["||lex.tx=="."||lex.tx=="++"||lex.tx=="--"||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx=="="||lex.tx=="*="||lex.tx=="/="||lex.tx=="%="||lex.tx=="+="||lex.tx=="-="||lex.tx=="<<="||lex.tx==">>="||lex.tx==">>>="||lex.tx=="&="||lex.tx=="^="||lex.tx=="|="||lex.tx=="**="||lex.tx==";"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        return (e.p = 50, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $64(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="["||lex.tx=="."||lex.tx=="++"||lex.tx=="--"||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx=="="||lex.tx=="*="||lex.tx=="/="||lex.tx=="%="||lex.tx=="+="||lex.tx=="-="||lex.tx=="<<="||lex.tx==">>="||lex.tx==">>>="||lex.tx=="&="||lex.tx=="^="||lex.tx=="|="||lex.tx=="**="||lex.tx==";"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        const sym= s.slice(-1);

        s.splice(-1, 1, { type:"BooleanLiteral", value:sym[0], pos });

        return (e.p = 54, s);
    }

    return s;
}

function $65(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="["||lex.tx=="."||lex.tx=="++"||lex.tx=="--"||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx=="="||lex.tx=="*="||lex.tx=="/="||lex.tx=="%="||lex.tx=="+="||lex.tx=="-="||lex.tx=="<<="||lex.tx==">>="||lex.tx==">>>="||lex.tx=="&="||lex.tx=="^="||lex.tx=="|="||lex.tx=="**="||lex.tx==";"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        const sym= s.slice(-1);

        s.splice(-1, 1, { type:"BooleanLiteral", value:sym[0], pos });

        return (e.p = 54, s);
    }

    return s;
}

function $66(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="["||lex.tx=="."||lex.tx=="++"||lex.tx=="--"||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx=="="||lex.tx=="*="||lex.tx=="/="||lex.tx=="%="||lex.tx=="+="||lex.tx=="-="||lex.tx=="<<="||lex.tx==">>="||lex.tx==">>>="||lex.tx=="&="||lex.tx=="^="||lex.tx=="|="||lex.tx=="**="||lex.tx==";"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        const sym= s.slice(-1);

        s.splice(-1, 1, { type:"NullLiteral", pos });

        return (e.p = 53, s);
    }

    return s;
}

function $67(lex, e, s= []){

    e.p = -1;

    if ( lex.tx=='"' ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $138(lex, e, s);

        return s;
    }

    return s;
}

function $68(lex, e, s= []){

    e.p = -1;

    if ( lex.tx=="'" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $139(lex, e, s);

        return s;
    }

    return s;
}

function $69(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="["||lex.tx=="."||lex.tx=="++"||lex.tx=="--"||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx=="="||lex.tx=="*="||lex.tx=="/="||lex.tx=="%="||lex.tx=="+="||lex.tx=="-="||lex.tx=="<<="||lex.tx==">>="||lex.tx==">>>="||lex.tx=="&="||lex.tx=="^="||lex.tx=="|="||lex.tx=="**="||lex.tx==";"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        const sym= s.slice(-1);

        s.splice(
            -1,
            1,
            { 

                type:"NumericLiteral",

                computed_value:parseFloat(),

                pos,

                NEGATIVE:!!null
             }
        );

        return (e.p = 51, s);
    }

    return s;
}

function $70(lex, e, s= []){

    e.p = -1;

    if ( lex.tx=="]" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $142(lex, e, s);

        return s;
    }

    if ( lex.tx=="," ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $143(lex, e, s);

        return s;
    }

    if ( lex.tx=="delete" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $32(lex, e, s);

        return s;
    }

    if ( lex.tx=="void" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $33(lex, e, s);

        return s;
    }

    if ( lex.tx=="typeof" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $34(lex, e, s);

        return s;
    }

    if ( lex.tx=="+" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $35(lex, e, s);

        return s;
    }

    if ( lex.tx=="-" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $36(lex, e, s);

        return s;
    }

    if ( lex.tx=="~" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $37(lex, e, s);

        return s;
    }

    if ( lex.tx=="!" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $38(lex, e, s);

        return s;
    }

    if ( lex.tx=="++" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $39(lex, e, s);

        return s;
    }

    if ( lex.tx=="--" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $40(lex, e, s);

        return s;
    }

    if ( lex.tx=="this" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $43(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.ty==2 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $51(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="$" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $52(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="_" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $53(lex, e, s);

        return s;
    }

    if ( lex.tx=="async" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $54(lex, e, s);

        return s;
    }

    if ( lex.tx=="get" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $55(lex, e, s);

        return s;
    }

    if ( lex.tx=="set" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $56(lex, e, s);

        return s;
    }

    if ( lex.tx=="target" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $57(lex, e, s);

        return s;
    }

    if ( lex.tx=="as" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $58(lex, e, s);

        return s;
    }

    if ( lex.tx=="from" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $59(lex, e, s);

        return s;
    }

    if ( lex.tx=="true" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $64(lex, e, s);

        return s;
    }

    if ( lex.tx=="false" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $65(lex, e, s);

        return s;
    }

    if ( lex.tx=="null" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $66(lex, e, s);

        return s;
    }

    e.fn.parseString(lex, e, e.eh, sym);

    if ( lex.tx=='"' ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $67(lex, e, s);

        return s;
    }

    e.fn.parseString(lex, e, e.eh, sym);

    if ( lex.tx=="'" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $68(lex, e, s);

        return s;
    }

    if ( lex.ty==1 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $69(lex, e, s);

        return s;
    }

    if ( lex.tx=="[" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $70(lex, e, s);

        return s;
    }

    if ( lex.tx=="(" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $71(lex, e, s);

        return s;
    }

    if ( lex.tx=="..." ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $146(lex, e, s);

        return s;
    }

    while(1){

        let a= false;

        if ( e.p==63 ) {a = true; s = $49(lex, e, s); continue ;}

        if ( e.p==60 ) {a = true; s = $50(lex, e, s); continue ;}

        if ( e.p==54 ) {a = true; s = $60(lex, e, s); continue ;}

        if ( e.p==53 ) {a = true; s = $61(lex, e, s); continue ;}

        if ( e.p==51 ) {a = true; s = $63(lex, e, s); continue ;}

        if ( e.p==49 ) {a = true; s = $145(lex, e, s); continue ;}

        if ( e.p==48 ) {a = true; s = $140(lex, e, s); continue ;}

        if ( e.p==46 ) {a = true; s = $46(lex, e, s); continue ;}

        if ( e.p==45 ) {a = true; s = $42(lex, e, s); continue ;}

        if ( e.p==42 ) {a = true; s = $62(lex, e, s); continue ;}

        if ( e.p==41 ) {a = true; s = $47(lex, e, s); continue ;}

        if ( e.p==40 ) {a = true; s = $31(lex, e, s); continue ;}

        if ( e.p==39 ) {a = true; s = $30(lex, e, s); continue ;}

        if ( e.p==38 ) {a = true; s = $29(lex, e, s); continue ;}

        if ( true||lex.tx==","||lex.tx=="["||lex.tx=="."||lex.tx=="++"||lex.tx=="--"||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx=="="||lex.tx=="*="||lex.tx=="/="||lex.tx=="%="||lex.tx=="+="||lex.tx=="-="||lex.tx=="<<="||lex.tx==">>="||lex.tx==">>>="||lex.tx=="&="||lex.tx=="^="||lex.tx=="|="||lex.tx=="**="||lex.tx==";"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) return s;

        if ( !a ) break;
    }

    return s;
}

function $71(lex, e, s= []){

    e.p = -1;

    if ( lex.tx=="delete" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $32(lex, e, s);

        return s;
    }

    if ( lex.tx=="void" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $33(lex, e, s);

        return s;
    }

    if ( lex.tx=="typeof" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $34(lex, e, s);

        return s;
    }

    if ( lex.tx=="+" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $35(lex, e, s);

        return s;
    }

    if ( lex.tx=="-" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $36(lex, e, s);

        return s;
    }

    if ( lex.tx=="~" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $37(lex, e, s);

        return s;
    }

    if ( lex.tx=="!" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $38(lex, e, s);

        return s;
    }

    if ( lex.tx=="++" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $39(lex, e, s);

        return s;
    }

    if ( lex.tx=="--" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $40(lex, e, s);

        return s;
    }

    if ( lex.tx=="this" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $43(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.ty==2 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $51(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="$" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $52(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="_" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $53(lex, e, s);

        return s;
    }

    if ( lex.tx=="async" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $54(lex, e, s);

        return s;
    }

    if ( lex.tx=="get" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $55(lex, e, s);

        return s;
    }

    if ( lex.tx=="set" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $56(lex, e, s);

        return s;
    }

    if ( lex.tx=="target" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $57(lex, e, s);

        return s;
    }

    if ( lex.tx=="as" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $58(lex, e, s);

        return s;
    }

    if ( lex.tx=="from" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $59(lex, e, s);

        return s;
    }

    if ( lex.tx=="true" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $64(lex, e, s);

        return s;
    }

    if ( lex.tx=="false" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $65(lex, e, s);

        return s;
    }

    if ( lex.tx=="null" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $66(lex, e, s);

        return s;
    }

    e.fn.parseString(lex, e, e.eh, sym);

    if ( lex.tx=='"' ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $67(lex, e, s);

        return s;
    }

    e.fn.parseString(lex, e, e.eh, sym);

    if ( lex.tx=="'" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $68(lex, e, s);

        return s;
    }

    if ( lex.ty==1 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $69(lex, e, s);

        return s;
    }

    if ( lex.tx=="[" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $70(lex, e, s);

        return s;
    }

    if ( lex.tx=="(" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $71(lex, e, s);

        return s;
    }

    while(1){

        let a= false;

        if ( e.p==63 ) {a = true; s = $49(lex, e, s); continue ;}

        if ( e.p==60 ) {a = true; s = $50(lex, e, s); continue ;}

        if ( e.p==54 ) {a = true; s = $60(lex, e, s); continue ;}

        if ( e.p==53 ) {a = true; s = $61(lex, e, s); continue ;}

        if ( e.p==51 ) {a = true; s = $63(lex, e, s); continue ;}

        if ( e.p==46 ) {a = true; s = $46(lex, e, s); continue ;}

        if ( e.p==45 ) {a = true; s = $42(lex, e, s); continue ;}

        if ( e.p==42 ) {a = true; s = $62(lex, e, s); continue ;}

        if ( e.p==41 ) {a = true; s = $47(lex, e, s); continue ;}

        if ( e.p==40 ) {a = true; s = $31(lex, e, s); continue ;}

        if ( e.p==39 ) {a = true; s = $30(lex, e, s); continue ;}

        if ( e.p==38 ) {a = true; s = $29(lex, e, s); continue ;}

        if ( true||lex.tx==","||lex.tx=="["||lex.tx=="."||lex.tx=="++"||lex.tx=="--"||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx=="="||lex.tx=="*="||lex.tx=="/="||lex.tx=="%="||lex.tx=="+="||lex.tx=="-="||lex.tx=="<<="||lex.tx==">>="||lex.tx==">>>="||lex.tx=="&="||lex.tx=="^="||lex.tx=="|="||lex.tx=="**="||lex.tx==";"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) return s;

        if ( !a ) break;
    }

    return s;
}

function $72(lex, e, s= []){

    e.p = -1;

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.ty==2 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $51(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="$" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $52(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="_" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $53(lex, e, s);

        return s;
    }

    if ( lex.tx=="async" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $54(lex, e, s);

        return s;
    }

    if ( lex.tx=="get" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $55(lex, e, s);

        return s;
    }

    if ( lex.tx=="set" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $56(lex, e, s);

        return s;
    }

    if ( lex.tx=="target" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $57(lex, e, s);

        return s;
    }

    if ( lex.tx=="as" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $58(lex, e, s);

        return s;
    }

    if ( lex.tx=="from" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $59(lex, e, s);

        return s;
    }

    while(1){

        let a= false;

        if ( true||lex.tx=="import"||lex.tx=="{"||lex.tx=="this"||lex.ty==2||lex.tx=="$"||lex.tx=="_"||lex.tx=="async"||lex.tx=="get"||lex.tx=="set"||lex.tx=="target"||lex.tx=="as"||lex.tx=="from"||lex.tx=="true"||lex.tx=="false"||lex.tx=="null"||lex.tx=='"'||lex.tx=="'"||lex.tx=="-"||lex.ty==1||lex.tx=="["||lex.tx=="("||lex.tx=="++"||lex.tx=="--"||lex.tx=="delete"||lex.tx=="void"||lex.tx=="typeof"||lex.tx=="+"||lex.tx=="~"||lex.tx=="!"||lex.tx=="var"||lex.tx==";"||lex.tx=="if"||lex.END||lex.tx=="}"||lex.tx=="else" ) return s;

        if ( !a ) break;
    }

    return s;
}

function $73(lex, e, s= []){

    e.p = -1;

    if ( lex.tx=="import"||lex.tx=="{"||lex.tx=="this"||lex.ty==2||lex.tx=="$"||lex.tx=="_"||lex.tx=="async"||lex.tx=="get"||lex.tx=="set"||lex.tx=="target"||lex.tx=="as"||lex.tx=="from"||lex.tx=="true"||lex.tx=="false"||lex.tx=="null"||lex.tx=='"'||lex.tx=="'"||lex.tx=="-"||lex.ty==1||lex.tx=="["||lex.tx=="("||lex.tx=="++"||lex.tx=="--"||lex.tx=="delete"||lex.tx=="void"||lex.tx=="typeof"||lex.tx=="+"||lex.tx=="~"||lex.tx=="!"||lex.tx=="var"||lex.tx==";"||lex.tx=="if"||lex.END||lex.tx=="}"||lex.tx=="else" ) {

        const sym= s.slice(-1);

        s.splice(-1, 1, { type:"EmptyStatement", pos });

        return (e.p = 20, s);
    }

    return s;
}

function $74(lex, e, s= []){

    e.p = -1;

    if ( lex.tx=="(" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $152(lex, e, s);

        return s;
    }

    return s;
}

function $79(lex, e, s= []){

    e.p = -1;

    if ( lex.tx=="import"||lex.tx=="{"||lex.tx=="this"||lex.ty==2||lex.tx=="$"||lex.tx=="_"||lex.tx=="async"||lex.tx=="get"||lex.tx=="set"||lex.tx=="target"||lex.tx=="as"||lex.tx=="from"||lex.tx=="true"||lex.tx=="false"||lex.tx=="null"||lex.tx=='"'||lex.tx=="'"||lex.tx=="-"||lex.ty==1||lex.tx=="["||lex.tx=="("||lex.tx=="++"||lex.tx=="--"||lex.tx=="delete"||lex.tx=="void"||lex.tx=="typeof"||lex.tx=="+"||lex.tx=="~"||lex.tx=="!"||lex.tx=="var"||lex.tx==";"||lex.tx=="if"||lex.END||lex.tx=="}"||lex.tx=="else" ) {

        const sym= s.slice(-2);

        s.splice(
            -2,
            2,
            { type:"BlockStatement", nodes:null||[], pos }
        );

        return (e.p = 13, s);
    }

    return s;
}

function $123(lex, e, s= []){

    e.p = -1;

    if ( lex.tx=="delete" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $32(lex, e, s);

        return s;
    }

    if ( lex.tx=="void" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $33(lex, e, s);

        return s;
    }

    if ( lex.tx=="typeof" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $34(lex, e, s);

        return s;
    }

    if ( lex.tx=="+" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $35(lex, e, s);

        return s;
    }

    if ( lex.tx=="-" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $36(lex, e, s);

        return s;
    }

    if ( lex.tx=="~" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $37(lex, e, s);

        return s;
    }

    if ( lex.tx=="!" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $38(lex, e, s);

        return s;
    }

    if ( lex.tx=="++" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $39(lex, e, s);

        return s;
    }

    if ( lex.tx=="--" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $40(lex, e, s);

        return s;
    }

    if ( lex.tx=="this" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $43(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.ty==2 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $51(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="$" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $52(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="_" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $53(lex, e, s);

        return s;
    }

    if ( lex.tx=="async" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $54(lex, e, s);

        return s;
    }

    if ( lex.tx=="get" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $55(lex, e, s);

        return s;
    }

    if ( lex.tx=="set" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $56(lex, e, s);

        return s;
    }

    if ( lex.tx=="target" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $57(lex, e, s);

        return s;
    }

    if ( lex.tx=="as" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $58(lex, e, s);

        return s;
    }

    if ( lex.tx=="from" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $59(lex, e, s);

        return s;
    }

    if ( lex.tx=="true" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $64(lex, e, s);

        return s;
    }

    if ( lex.tx=="false" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $65(lex, e, s);

        return s;
    }

    if ( lex.tx=="null" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $66(lex, e, s);

        return s;
    }

    e.fn.parseString(lex, e, e.eh, sym);

    if ( lex.tx=='"' ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $67(lex, e, s);

        return s;
    }

    e.fn.parseString(lex, e, e.eh, sym);

    if ( lex.tx=="'" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $68(lex, e, s);

        return s;
    }

    if ( lex.ty==1 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $69(lex, e, s);

        return s;
    }

    if ( lex.tx=="[" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $70(lex, e, s);

        return s;
    }

    if ( lex.tx=="(" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $71(lex, e, s);

        return s;
    }

    while(1){

        let a= false;

        if ( e.p==63 ) {a = true; s = $49(lex, e, s); continue ;}

        if ( e.p==60 ) {a = true; s = $50(lex, e, s); continue ;}

        if ( e.p==54 ) {a = true; s = $60(lex, e, s); continue ;}

        if ( e.p==53 ) {a = true; s = $61(lex, e, s); continue ;}

        if ( e.p==51 ) {a = true; s = $63(lex, e, s); continue ;}

        if ( e.p==46 ) {a = true; s = $46(lex, e, s); continue ;}

        if ( e.p==45 ) {a = true; s = $42(lex, e, s); continue ;}

        if ( e.p==42 ) {a = true; s = $62(lex, e, s); continue ;}

        if ( e.p==41 ) {a = true; s = $47(lex, e, s); continue ;}

        if ( e.p==40 ) {a = true; s = $31(lex, e, s); continue ;}

        if ( e.p==39 ) {a = true; s = $30(lex, e, s); continue ;}

        if ( e.p==38 ) {a = true; s = $184(lex, e, s); continue ;}

        if ( true||lex.tx==","||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx==";"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) return s;

        if ( !a ) break;
    }

    return s;
}

function $124(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx==";"||lex.tx=="**"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        const sym= s.slice(-2);

        s.splice(
            -2,
            2,
            { type:"DeleteExpression", nodes:[sym[1]], pos }
        );

        return (e.p = 39, s);
    }

    return s;
}

function $125(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx==";"||lex.tx=="**"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        return (e.p = 39, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $127(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx==";"||lex.tx=="**"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        const sym= s.slice(-2);

        s.splice(
            -2,
            2,
            { type:"VoidExpression", nodes:[sym[1]], pos }
        );

        return (e.p = 39, s);
    }

    return s;
}

function $128(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx==";"||lex.tx=="**"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        const sym= s.slice(-2);

        s.splice(
            -2,
            2,
            { type:"TypeofExpression", nodes:[sym[1]], pos }
        );

        return (e.p = 39, s);
    }

    return s;
}

function $129(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx==";"||lex.tx=="**"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        const sym= s.slice(-2);

        s.splice(
            -2,
            2,
            { 

                type:"UnaryExpression",

                symbol:sym[0],

                nodes:[sym[1]],

                pos
             }
        );

        return (e.p = 39, s);
    }

    return s;
}

function $130(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx==";"||lex.tx=="**"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        const sym= s.slice(-2);

        s.splice(
            -2,
            2,
            { 

                type:"UnaryExpression",

                symbol:sym[0],

                nodes:[sym[1]],

                pos
             }
        );

        return (e.p = 39, s);
    }

    return s;
}

function $131(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="["||lex.tx=="."||lex.tx=="++"||lex.tx=="--"||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx=="="||lex.tx=="*="||lex.tx=="/="||lex.tx=="%="||lex.tx=="+="||lex.tx=="-="||lex.tx=="<<="||lex.tx==">>="||lex.tx==">>>="||lex.tx=="&="||lex.tx=="^="||lex.tx=="|="||lex.tx=="**="||lex.tx==";"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        const sym= s.slice(-2);

        s.splice(
            -2,
            2,
            { 

                type:"NumericLiteral",

                value:sym[0],

                computed_value:parseFloat(sym[0]),

                value_data:sym[0],

                pos,

                NEGATIVE:!!sym[0]
             }
        );

        return (e.p = 51, s);
    }

    if ( lex.tx==","||lex.tx=="["||lex.tx=="."||lex.tx=="++"||lex.tx=="--"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx==";"||lex.tx=="**"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        const sym= s.slice(-1);

        s.splice(
            -1,
            1,
            { 

                type:"NumericLiteral",

                computed_value:parseFloat(),

                pos,

                NEGATIVE:!!null
             }
        );

        return (e.p = 51, s);
    }

    return s;
}

function $132(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx==";"||lex.tx=="**"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        const sym= s.slice(-2);

        s.splice(
            -2,
            2,
            { 

                type:"UnaryExpression",

                symbol:sym[0],

                nodes:[sym[1]],

                pos
             }
        );

        return (e.p = 39, s);
    }

    return s;
}

function $133(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx==";"||lex.tx=="**"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        const sym= s.slice(-2);

        s.splice(
            -2,
            2,
            { 

                type:"UnaryExpression",

                symbol:sym[0],

                nodes:[sym[1]],

                pos
             }
        );

        return (e.p = 39, s);
    }

    return s;
}

function $134(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx==";"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        const sym= s.slice(-2);

        s.splice(
            -2,
            2,
            { 

                type:"PreExpression",

                symbol:sym[0],

                nodes:[sym[1]],

                pos
             }
        );

        return (e.p = 40, s);
    }

    return s;
}

function $135(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx==";"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        const sym= s.slice(-2);

        s.splice(
            -2,
            2,
            { 

                type:"PreExpression",

                symbol:sym[0],

                nodes:[sym[1]],

                pos
             }
        );

        return (e.p = 40, s);
    }

    return s;
}

function $138(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="["||lex.tx=="."||lex.tx=="++"||lex.tx=="--"||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx=="="||lex.tx=="*="||lex.tx=="/="||lex.tx=="%="||lex.tx=="+="||lex.tx=="-="||lex.tx=="<<="||lex.tx==">>="||lex.tx==">>>="||lex.tx=="&="||lex.tx=="^="||lex.tx=="|="||lex.tx=="**="||lex.tx==";"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        const sym= s.slice(-2);

        s.splice(
            -2,
            2,
            { 

                quote_type:sym[1],

                type:env.typ.StringLiteral,

                value:sym[0]||"",

                pos
             }
        );

        return (e.p = 42, s);
    }

    return s;
}

function $139(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="["||lex.tx=="."||lex.tx=="++"||lex.tx=="--"||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx=="="||lex.tx=="*="||lex.tx=="/="||lex.tx=="%="||lex.tx=="+="||lex.tx=="-="||lex.tx=="<<="||lex.tx==">>="||lex.tx==">>>="||lex.tx=="&="||lex.tx=="^="||lex.tx=="|="||lex.tx=="**="||lex.tx==";"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        const sym= s.slice(-2);

        s.splice(
            -2,
            2,
            { 

                quote_type:sym[1],

                type:env.typ.StringLiteral,

                value:sym[0]||"",

                pos
             }
        );

        return (e.p = 42, s);
    }

    return s;
}

function $140(lex, e, s= []){

    e.p = -1;

    if ( lex.tx=="]" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $235(lex, e, s);

        return s;
    }

    if ( lex.tx=="," ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $236(lex, e, s);

        return s;
    }

    if ( lex.tx=="delete" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $32(lex, e, s);

        return s;
    }

    if ( lex.tx=="void" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $33(lex, e, s);

        return s;
    }

    if ( lex.tx=="typeof" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $34(lex, e, s);

        return s;
    }

    if ( lex.tx=="+" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $35(lex, e, s);

        return s;
    }

    if ( lex.tx=="-" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $36(lex, e, s);

        return s;
    }

    if ( lex.tx=="~" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $37(lex, e, s);

        return s;
    }

    if ( lex.tx=="!" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $38(lex, e, s);

        return s;
    }

    if ( lex.tx=="++" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $39(lex, e, s);

        return s;
    }

    if ( lex.tx=="--" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $40(lex, e, s);

        return s;
    }

    if ( lex.tx=="this" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $43(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.ty==2 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $51(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="$" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $52(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="_" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $53(lex, e, s);

        return s;
    }

    if ( lex.tx=="async" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $54(lex, e, s);

        return s;
    }

    if ( lex.tx=="get" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $55(lex, e, s);

        return s;
    }

    if ( lex.tx=="set" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $56(lex, e, s);

        return s;
    }

    if ( lex.tx=="target" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $57(lex, e, s);

        return s;
    }

    if ( lex.tx=="as" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $58(lex, e, s);

        return s;
    }

    if ( lex.tx=="from" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $59(lex, e, s);

        return s;
    }

    if ( lex.tx=="true" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $64(lex, e, s);

        return s;
    }

    if ( lex.tx=="false" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $65(lex, e, s);

        return s;
    }

    if ( lex.tx=="null" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $66(lex, e, s);

        return s;
    }

    e.fn.parseString(lex, e, e.eh, sym);

    if ( lex.tx=='"' ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $67(lex, e, s);

        return s;
    }

    e.fn.parseString(lex, e, e.eh, sym);

    if ( lex.tx=="'" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $68(lex, e, s);

        return s;
    }

    if ( lex.ty==1 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $69(lex, e, s);

        return s;
    }

    if ( lex.tx=="[" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $70(lex, e, s);

        return s;
    }

    if ( lex.tx=="(" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $71(lex, e, s);

        return s;
    }

    if ( lex.tx=="..." ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $146(lex, e, s);

        return s;
    }

    while(1){

        let a= false;

        if ( e.p==63 ) {a = true; s = $49(lex, e, s); continue ;}

        if ( e.p==60 ) {a = true; s = $50(lex, e, s); continue ;}

        if ( e.p==54 ) {a = true; s = $60(lex, e, s); continue ;}

        if ( e.p==53 ) {a = true; s = $61(lex, e, s); continue ;}

        if ( e.p==51 ) {a = true; s = $63(lex, e, s); continue ;}

        if ( e.p==49 ) {a = true; s = $238(lex, e, s); continue ;}

        if ( e.p==46 ) {a = true; s = $46(lex, e, s); continue ;}

        if ( e.p==45 ) {a = true; s = $42(lex, e, s); continue ;}

        if ( e.p==42 ) {a = true; s = $62(lex, e, s); continue ;}

        if ( e.p==41 ) {a = true; s = $47(lex, e, s); continue ;}

        if ( e.p==40 ) {a = true; s = $31(lex, e, s); continue ;}

        if ( e.p==39 ) {a = true; s = $30(lex, e, s); continue ;}

        if ( e.p==38 ) {a = true; s = $29(lex, e, s); continue ;}

        if ( true||lex.tx==","||lex.tx=="["||lex.tx=="."||lex.tx=="++"||lex.tx=="--"||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx=="="||lex.tx=="*="||lex.tx=="/="||lex.tx=="%="||lex.tx=="+="||lex.tx=="-="||lex.tx=="<<="||lex.tx==">>="||lex.tx==">>>="||lex.tx=="&="||lex.tx=="^="||lex.tx=="|="||lex.tx=="**="||lex.tx==";"||lex.tx=="]"||lex.tx=="this"||lex.ty==2||lex.tx=="$"||lex.tx=="_"||lex.tx=="async"||lex.tx=="get"||lex.tx=="set"||lex.tx=="target"||lex.tx=="as"||lex.tx=="from"||lex.tx=="true"||lex.tx=="false"||lex.tx=="null"||lex.tx=='"'||lex.tx=="'"||lex.ty==1||lex.tx=="("||lex.tx=="delete"||lex.tx=="void"||lex.tx=="typeof"||lex.tx=="~"||lex.tx=="!"||lex.tx=="..."||lex.tx==")"||lex.tx==":" ) return s;

        if ( !a ) break;
    }

    return s;
}

function $142(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="["||lex.tx=="."||lex.tx=="++"||lex.tx=="--"||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx=="="||lex.tx=="*="||lex.tx=="/="||lex.tx=="%="||lex.tx=="+="||lex.tx=="-="||lex.tx=="<<="||lex.tx==">>="||lex.tx==">>>="||lex.tx=="&="||lex.tx=="^="||lex.tx=="|="||lex.tx=="**="||lex.tx==";"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        const sym= s.slice(-2);

        s.splice(-2, 2, { type:"ArrayLiteral", nodes:[], pos });

        return (e.p = 46, s);
    }

    return s;
}

function $143(lex, e, s= []){

    e.p = -1;

    if ( lex.tx=="]"||lex.tx==","||lex.tx=="this"||lex.ty==2||lex.tx=="$"||lex.tx=="_"||lex.tx=="async"||lex.tx=="get"||lex.tx=="set"||lex.tx=="target"||lex.tx=="as"||lex.tx=="from"||lex.tx=="true"||lex.tx=="false"||lex.tx=="null"||lex.tx=='"'||lex.tx=="'"||lex.tx=="-"||lex.ty==1||lex.tx=="["||lex.tx=="("||lex.tx=="++"||lex.tx=="--"||lex.tx=="delete"||lex.tx=="void"||lex.tx=="typeof"||lex.tx=="+"||lex.tx=="~"||lex.tx=="!"||lex.tx=="..." ) {

        const sym= s.slice(-1);

        s.splice(-1, 1, { type:"Elision", count:0, pos });

        return (e.p = 48, s);
    }

    return s;
}

function $145(lex, e, s= []){

    e.p = -1;

    if ( lex.tx=="]"||lex.tx=="," ) {

        const sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return (e.p = 47, s);
    }

    return s;
}

function $146(lex, e, s= []){

    e.p = -1;

    if ( lex.tx=="delete" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $32(lex, e, s);

        return s;
    }

    if ( lex.tx=="void" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $33(lex, e, s);

        return s;
    }

    if ( lex.tx=="typeof" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $34(lex, e, s);

        return s;
    }

    if ( lex.tx=="+" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $35(lex, e, s);

        return s;
    }

    if ( lex.tx=="-" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $36(lex, e, s);

        return s;
    }

    if ( lex.tx=="~" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $37(lex, e, s);

        return s;
    }

    if ( lex.tx=="!" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $38(lex, e, s);

        return s;
    }

    if ( lex.tx=="++" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $39(lex, e, s);

        return s;
    }

    if ( lex.tx=="--" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $40(lex, e, s);

        return s;
    }

    if ( lex.tx=="this" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $43(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.ty==2 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $51(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="$" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $52(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="_" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $53(lex, e, s);

        return s;
    }

    if ( lex.tx=="async" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $54(lex, e, s);

        return s;
    }

    if ( lex.tx=="get" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $55(lex, e, s);

        return s;
    }

    if ( lex.tx=="set" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $56(lex, e, s);

        return s;
    }

    if ( lex.tx=="target" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $57(lex, e, s);

        return s;
    }

    if ( lex.tx=="as" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $58(lex, e, s);

        return s;
    }

    if ( lex.tx=="from" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $59(lex, e, s);

        return s;
    }

    if ( lex.tx=="true" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $64(lex, e, s);

        return s;
    }

    if ( lex.tx=="false" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $65(lex, e, s);

        return s;
    }

    if ( lex.tx=="null" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $66(lex, e, s);

        return s;
    }

    e.fn.parseString(lex, e, e.eh, sym);

    if ( lex.tx=='"' ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $67(lex, e, s);

        return s;
    }

    e.fn.parseString(lex, e, e.eh, sym);

    if ( lex.tx=="'" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $68(lex, e, s);

        return s;
    }

    if ( lex.ty==1 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $69(lex, e, s);

        return s;
    }

    if ( lex.tx=="[" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $70(lex, e, s);

        return s;
    }

    if ( lex.tx=="(" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $71(lex, e, s);

        return s;
    }

    while(1){

        let a= false;

        if ( e.p==63 ) {a = true; s = $49(lex, e, s); continue ;}

        if ( e.p==60 ) {a = true; s = $50(lex, e, s); continue ;}

        if ( e.p==54 ) {a = true; s = $60(lex, e, s); continue ;}

        if ( e.p==53 ) {a = true; s = $61(lex, e, s); continue ;}

        if ( e.p==51 ) {a = true; s = $63(lex, e, s); continue ;}

        if ( e.p==46 ) {a = true; s = $46(lex, e, s); continue ;}

        if ( e.p==45 ) {a = true; s = $42(lex, e, s); continue ;}

        if ( e.p==42 ) {a = true; s = $62(lex, e, s); continue ;}

        if ( e.p==41 ) {a = true; s = $47(lex, e, s); continue ;}

        if ( e.p==40 ) {a = true; s = $31(lex, e, s); continue ;}

        if ( e.p==39 ) {a = true; s = $30(lex, e, s); continue ;}

        if ( e.p==38 ) {a = true; s = $29(lex, e, s); continue ;}

        if ( true||lex.tx==","||lex.tx=="]" ) return s;

        if ( !a ) break;
    }

    return s;
}

function $152(lex, e, s= []){

    e.p = -1;

    if ( lex.tx=="delete" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $32(lex, e, s);

        return s;
    }

    if ( lex.tx=="void" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $33(lex, e, s);

        return s;
    }

    if ( lex.tx=="typeof" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $34(lex, e, s);

        return s;
    }

    if ( lex.tx=="+" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $35(lex, e, s);

        return s;
    }

    if ( lex.tx=="-" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $36(lex, e, s);

        return s;
    }

    if ( lex.tx=="~" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $37(lex, e, s);

        return s;
    }

    if ( lex.tx=="!" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $38(lex, e, s);

        return s;
    }

    if ( lex.tx=="++" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $39(lex, e, s);

        return s;
    }

    if ( lex.tx=="--" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $40(lex, e, s);

        return s;
    }

    if ( lex.tx=="this" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $43(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.ty==2 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $51(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="$" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $52(lex, e, s);

        return s;
    }

    e.fn.parseIdentifier(lex, e, e.eh, sym);

    if ( lex.tx=="_" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $53(lex, e, s);

        return s;
    }

    if ( lex.tx=="async" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $54(lex, e, s);

        return s;
    }

    if ( lex.tx=="get" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $55(lex, e, s);

        return s;
    }

    if ( lex.tx=="set" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $56(lex, e, s);

        return s;
    }

    if ( lex.tx=="target" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $57(lex, e, s);

        return s;
    }

    if ( lex.tx=="as" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $58(lex, e, s);

        return s;
    }

    if ( lex.tx=="from" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $59(lex, e, s);

        return s;
    }

    if ( lex.tx=="true" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $64(lex, e, s);

        return s;
    }

    if ( lex.tx=="false" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $65(lex, e, s);

        return s;
    }

    if ( lex.tx=="null" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $66(lex, e, s);

        return s;
    }

    e.fn.parseString(lex, e, e.eh, sym);

    if ( lex.tx=='"' ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $67(lex, e, s);

        return s;
    }

    e.fn.parseString(lex, e, e.eh, sym);

    if ( lex.tx=="'" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $68(lex, e, s);

        return s;
    }

    if ( lex.ty==1 ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $69(lex, e, s);

        return s;
    }

    if ( lex.tx=="[" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $70(lex, e, s);

        return s;
    }

    if ( lex.tx=="(" ) {

        s.push(aaa(lex, e, e.eh, [8,256]));

        s = $71(lex, e, s);

        return s;
    }

    while(1){

        let a= false;

        if ( e.p==63 ) {a = true; s = $49(lex, e, s); continue ;}

        if ( e.p==60 ) {a = true; s = $50(lex, e, s); continue ;}

        if ( e.p==54 ) {a = true; s = $60(lex, e, s); continue ;}

        if ( e.p==53 ) {a = true; s = $61(lex, e, s); continue ;}

        if ( e.p==51 ) {a = true; s = $63(lex, e, s); continue ;}

        if ( e.p==46 ) {a = true; s = $46(lex, e, s); continue ;}

        if ( e.p==45 ) {a = true; s = $42(lex, e, s); continue ;}

        if ( e.p==42 ) {a = true; s = $62(lex, e, s); continue ;}

        if ( e.p==41 ) {a = true; s = $47(lex, e, s); continue ;}

        if ( e.p==40 ) {a = true; s = $31(lex, e, s); continue ;}

        if ( e.p==39 ) {a = true; s = $30(lex, e, s); continue ;}

        if ( e.p==38 ) {a = true; s = $29(lex, e, s); continue ;}

        if ( true||lex.tx=="import"||lex.tx=="{"||lex.tx=="this"||lex.ty==2||lex.tx=="$"||lex.tx=="_"||lex.tx=="async"||lex.tx=="get"||lex.tx=="set"||lex.tx=="target"||lex.tx=="as"||lex.tx=="from"||lex.tx=="true"||lex.tx=="false"||lex.tx=="null"||lex.tx=='"'||lex.tx=="'"||lex.tx=="-"||lex.ty==1||lex.tx=="["||lex.tx=="("||lex.tx=="++"||lex.tx=="--"||lex.tx=="delete"||lex.tx=="void"||lex.tx=="typeof"||lex.tx=="+"||lex.tx=="~"||lex.tx=="!"||lex.tx=="var"||lex.tx==";"||lex.tx=="if"||lex.END||lex.tx=="}"||lex.tx=="else" ) return s;

        if ( !a ) break;
    }

    return s;
}

function $184(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx==";"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        const sym= s.slice(-3);

        s.splice(
            -3,
            3,
            { 

                type:"ExponentiationExpression",

                nodes:[sym[0],sym[2]],

                pos
             }
        );

        return (e.p = 38, s);
    }

    return s;
}

function $235(lex, e, s= []){

    e.p = -1;

    if ( lex.tx==","||lex.tx=="["||lex.tx=="."||lex.tx=="++"||lex.tx=="--"||lex.tx=="**"||lex.tx=="*"||lex.tx=="/"||lex.tx=="%"||lex.tx=="+"||lex.tx=="-"||lex.tx=="<<"||lex.tx==">>"||lex.tx==">>>"||lex.tx=="<"||lex.tx==">"||lex.tx=="<="||lex.tx==">="||lex.tx=="instanceof"||lex.tx=="in"||lex.tx=="=="||lex.tx=="!="||lex.tx=="==="||lex.tx=="!=="||lex.tx=="&"||lex.tx=="^"||lex.tx=="|"||lex.tx=="&&"||lex.tx=="||"||lex.tx=="?"||lex.tx=="="||lex.tx=="*="||lex.tx=="/="||lex.tx=="%="||lex.tx=="+="||lex.tx=="-="||lex.tx=="<<="||lex.tx==">>="||lex.tx==">>>="||lex.tx=="&="||lex.tx=="^="||lex.tx=="|="||lex.tx=="**="||lex.tx==";"||lex.tx=="]"||lex.tx==")"||lex.tx==":" ) {

        const sym= s.slice(-3);

        s.splice(-3, 3, { type:"ArrayLiteral", nodes:[sym[1]], pos });

        return (e.p = 46, s);
    }

    return s;
}

function $236(lex, e, s= []){

    e.p = -1;

    if ( lex.tx=="]"||lex.tx==","||lex.tx=="this"||lex.ty==2||lex.tx=="$"||lex.tx=="_"||lex.tx=="async"||lex.tx=="get"||lex.tx=="set"||lex.tx=="target"||lex.tx=="as"||lex.tx=="from"||lex.tx=="true"||lex.tx=="false"||lex.tx=="null"||lex.tx=='"'||lex.tx=="'"||lex.tx=="-"||lex.ty==1||lex.tx=="["||lex.tx=="("||lex.tx=="++"||lex.tx=="--"||lex.tx=="delete"||lex.tx=="void"||lex.tx=="typeof"||lex.tx=="+"||lex.tx=="~"||lex.tx=="!"||lex.tx=="..." ) {

        const sym= s.slice(-2);

        s.splice(
            -2,
            2,
            { type:"Elision", count:sym[0].count+1, pos }
        );

        return (e.p = 48, s);
    }

    return s;
}

function $238(lex, e, s= []){

    e.p = -1;

    if ( lex.tx=="]"||lex.tx=="," ) {

        const sym= s.slice(-2);

        s.splice(-2, 2, [sym[0],sym[1]]);

        return (e.p = 47, s);
    }

    return s;
};

return function(lexer, env = {
    eh: (lex, e)=>{},
    asi: (lex, env, s) => {}
}){
    const states = [];
    lexer.IWS = false;
    const result =  $start(lexer, env);
    if(!lexer.END) lexer.throw(`Unexpected token [${lexer.tx}]`);
    return result;
}