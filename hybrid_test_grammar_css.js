export default (b)=>{
const pos = null;

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
            e.FAILED = true;
            e.error.push(lex.copy());
        }
    }

    return s;
}


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

const _0 = [256,8,8,256,512],_1 = ["@"],_2 = ["and"],_3 = ["or"],_4 = ["true"],_5 = [":"],_6 = [";"],_7 = ["#","$","*","+","-",".",":",">","@","[","|","||","~"],_8 = [2,255],_9 = ["{"],_10 = [","],_11 = [",","{"],_12 = ["#","$",")","*","+",",","-",".",":",">","[","{","|","||","~"],_13 = [2,8],_14 = ["|"],_15 = ["#","$","$=",")","*","*=","+",",","-",".",":","=",">","[","]","^=","{","|","||","~"],_16 = ["$","*","-"],_17 = [2],_18 = ["#","$","$=","(",")","*","*=","+",",","-",".",":",";","<","<=","=",">",">=","@","[","]","^=","_","and","i","s","{","|","||","~"],_19 = [1,1025,2,2049,255,4097,8],_20 = ["#","$","(","*","+","-",".",":",";",">","@","[","not","only","supports","|","||","~"],_21 = ["("],_22 = ["#","$","*","+",",","-",".",":",";",">","@","[","{","|","||","~"],_23 = ["#","$",")","*","+",",","-",".",":",";",">","@","[","{","|","||","~"],_24 = ["$","-"],_25 = ["#","$",")","*","+",",","-",".",":",";",">","@","[","and","or","{","|","||","~"],_26 = [")","and","or","{"],_27 = ["}"],_28 = ["$","-",";"],_29 = ["#","$","*","+","-",".",":",">","@","[","|","||","}","~"],_30 = [";","}"],_31 = ["$","-","\""],_32 = ["#","$","*","+","-",".",":",";",">","@","[","|","||","~"],_33 = ["#","$","*","+",",","-",".",":",";",">","@","[","|","||","~"],_34 = ["\""],_35 = ["\"","true"],_36 = ["'","true"],_37 = ["#","$",")","*","+",",","-",".",":",";",">","@","[","and","{","|","||","~"],_38 = ["#","$",")","*","+",",","-",".",":",";",">","@","[","or","{","|","||","~"],_39 = [")"],_40 = [")","<","<=","=",">",">="],_41 = [")","{"],_42 = ["]","i","s"],_43 = ["'","'\'",")","-","/","\"","_","true"],_44 = [1,128,16,2,32,8],_45 = ["#","$","(",")","*","+","-",".",":",";",">","@","[","not","only","supports","{","|","||","~"],_46 = ["#","$","*","+","-",".",":",">","[","|","||","}","~"],_47 = [1,2],_48 = [1],_49 = [")","true"],_50 = [8],_51 = ["from","to","}"],_52 = ["!","'\'","(",")","-",";","_","true","}"],_53 = [1,128,16,2,32,64,8],_54 = ["]"],_55 = [")",";","}"],_56 = ["'\'",")","-","_","true"],_57 = ["#","$","*","+","-",".",":",">","[","|","||","~"],_58 = ["'\'","-","_","true"],_59 = [1,128,16,2,32,64],_60 = ["$","_"],_61 = [1,1025,16385,2,2049,32769,4097],_62 = ["$","_","keyword"],_63 = [1,1025,16385,2,2049,32769,4097,8],_64 = ["$","-","_","keyword"],_65 = ["'","'\'","-","/","\"","_","true"],_66 = ["'\'","-","/","\"","_","true"],_67 = ["'","'\'","-","/","_","true"];

function $_0(l, e, s){

    if ( _1.includes(l.tx) ) {s.push($import(l, e)); e.p = (e.FAILED)?-1:14;}

    return s;
}

function $_3(l, e, s){

    switch(l.tx){

        case "#" : 

            s.push($ID_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:83;

            break;
         

        case "$" : s = $34(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "*" : 

            var cp= l.copy(),_sym= null;

            _sym = $26(cp, e, _s(s.slice(), cp, e, e.eh, _0));

            if ( e.p!==91 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s = $27(l, e, _s(s, l, e, e.eh, _0));

            break;
         

        case "-" : s = $36(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "." : 

            s.push($CLASS_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:84;

            break;
         

        case ":" : 

            var cp= l.copy(),_sym= null;

            _sym = s.slice();

            _sym.push($PSEUDO_CLASS_SELECTOR(cp, e));

            e.p = (e.FAILED)?-1:86;

            if ( e.p!==86 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s.push($PSEUDO_ELEMENT_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:92;

            break;
         

        case "[" : 

            s.push($ATTRIBUTE_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:88;

            break;
         

        case "|" : s = $31(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "+" :  

        case "," :  

        case ">" :  

        case "{" :  

        case "||" :  

        case "~" : 

            e.sp -= 0;

            var sym= s.slice(-0);

            s.splice(
                -0,
                0,
                (null&&!(null||null))?null:(null&&null.length==1&&!(null||null))?null[0]:{ type:"CompoundSelector", nodes:[], pos }
            );

            return (e.p = 77, s);
         

        default : 

            switch(l.ty){

                case 2 : s = $35(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 8 : 

                    e.sp -= 0;

                    var sym= s.slice(-0);

                    s.splice(
                        -0,
                        0,
                        (null&&!(null||null))?null:(null&&null.length==1&&!(null||null))?null[0]:{ type:"CompoundSelector", nodes:[], pos }
                    );

                    return (e.p = 77, s);
                
            }
        
    }

    return s;
}

function $_4(l, e, s){

    switch(l.tx){

        case "$" : s = $34(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "(" : 

            var cp= l.copy(),_sym= null;

            _sym = $135(cp, e, _s(s.slice(), cp, e, e.eh, _0));

            if ( e.p!==27 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s.push($supports_decl(l, e));

            e.p = (e.FAILED)?-1:29;

            break;
         

        case "-" : s = $36(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "not" : 

            s.push($supports_condition(l, e));

            e.p = (e.FAILED)?-1:26;

            break;
         

        case "selector" : 

            s.push($supports_feature_fn(l, e));

            e.p = (e.FAILED)?-1:30;

            break;
         

        default : 

            switch(l.ty){

                case 2 : s = $35(l, e, _s(s, l, e, e.eh, _0)); break;
            }
        
    }

    return s;
}

function $_5(l, e, s){

    switch(l.tx){

        case "$" : s = $34(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "(" : 

            var cp= l.copy(),_sym= null;

            _sym = $121(cp, e, _s(s.slice(), cp, e, e.eh, _0));

            if ( e.p!==47 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s.push($media_feature(l, e));

            e.p = (e.FAILED)?-1:49;

            break;
         

        case "-" : s = $36(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "not" : 

            var cp= l.copy(),_sym= null;

            _sym = s.slice();

            _sym.push($media_not(cp, e));

            e.p = (e.FAILED)?-1:40;

            if ( e.p!==40 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s = $120(l, e, _s(s, l, e, e.eh, _0));

            break;
         

        case "only" : s = $127(l, e, _s(s, l, e, e.eh, _0)); break; 

        default : 

            switch(l.ty){

                case 2 : s = $35(l, e, _s(s, l, e, e.eh, _0)); break;
            }
        
    }

    return s;
}

function $_6(l, e, s){

    switch(l.tx){

        case "from" : s = $301(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "to" : s = $302(l, e, _s(s, l, e, e.eh, _0)); break; 

        default : 

            switch(l.ty){

                case 1 : 

                    s.push($percentage(l, e));

                    e.p = (e.FAILED)?-1:63;

                    break;
                
            }
        
    }

    return s;
}

function $_7(l, e, s){

    switch(l.tx){

        case "and" : 

            s.push($supports_condition_group_129_112(l, e));

            e.p = (e.FAILED)?-1:24;

            break;
         

        case "or" : 

            s.push($supports_condition_group_129_112(l, e));

            e.p = (e.FAILED)?-1:24;

            break;
        
    }

    return s;
}

function $_8(l, e, s){

    switch(l.tx){

        case "$" : s = $34(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "(" : 

            var cp= l.copy(),_sym= null;

            _sym = $135(cp, e, _s(s.slice(), cp, e, e.eh, _0));

            if ( e.p!==27 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s.push($supports_decl(l, e));

            e.p = (e.FAILED)?-1:29;

            break;
         

        case "-" : s = $36(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "selector" : 

            s.push($supports_feature_fn(l, e));

            e.p = (e.FAILED)?-1:30;

            break;
         

        default : 

            switch(l.ty){

                case 2 : s = $35(l, e, _s(s, l, e, e.eh, _0)); break;
            }
        
    }

    return s;
}

function $_9(l, e, s){

    switch(l.tx){

        case "$" : s = $34(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "(" : 

            var cp= l.copy(),_sym= null;

            _sym = $121(cp, e, _s(s.slice(), cp, e, e.eh, _0));

            if ( e.p!==47 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s.push($media_feature(l, e));

            e.p = (e.FAILED)?-1:49;

            break;
         

        case "-" : s = $36(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "not" : 

            s.push($media_not(l, e));

            e.p = (e.FAILED)?-1:40;

            break;
         

        default : 

            switch(l.ty){

                case 2 : s = $35(l, e, _s(s, l, e, e.eh, _0)); break;
            }
        
    }

    return s;
}

function $_10(l, e, s){

    if ( _2.includes(l.tx) ) {

        s.push($media_and_group_152_118(l, e));

        e.p = (e.FAILED)?-1:41;
    }

    return s;
}

function $_11(l, e, s){

    if ( _3.includes(l.tx) ) {

        s.push($media_or_group_154_120(l, e));

        e.p = (e.FAILED)?-1:44;
    }

    return s;
}

function $_12(l, e, s){

    switch(l.tx){

        case "$" : s = $34(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "(" : 

            var cp= l.copy(),_sym= null;

            _sym = $121(cp, e, _s(s.slice(), cp, e, e.eh, _0));

            if ( e.p!==47 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s.push($media_feature(l, e));

            e.p = (e.FAILED)?-1:49;

            break;
         

        case "-" : s = $36(l, e, _s(s, l, e, e.eh, _0)); break; 

        default : 

            switch(l.ty){

                case 2 : s = $35(l, e, _s(s, l, e, e.eh, _0)); break;
            }
        
    }

    return s;
}

function $_13(l, e, s){

    switch(l.tx){

        case "$" : s = $34(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "-" : s = $36(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "false" : s = $205(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "true" : s = $204(l, e, _s(s, l, e, e.eh, _0)); break; 

        default : 

            switch(l.ty){

                case 2 : s = $35(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 1 : 

                    var cp= l.copy(),_sym= null;

                    _sym = $207(cp, e, _s(s.slice(), cp, e, e.eh, _0));

                    if ( e.p!==58 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

                    cp = l.copy();

                    _sym = s.slice();

                    _sym.push($dimension(cp, e));

                    e.p = (e.FAILED)?-1:64;

                    if ( e.p!==64 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

                    s.push($ratio(l, e));

                    e.p = (e.FAILED)?-1:62;

                    break;
                
            }
        
    }

    return s;
}

function $_14(l, e, s){

    switch(l.tx){

        case "true" : s = $293(l, e, _s(s, l, e, e.eh, _0)); break; 

        default : 

            switch(l.ty){

                case 8 : s = $294(l, e, _s(s, l, e, e.eh, _0)); break;
            }
        
    }

    return s;
}

function $_15(l, e, s){

    switch(l.tx){

        case "$" : s = $34(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "-" : s = $36(l, e, _s(s, l, e, e.eh, _0)); break; 

        default : 

            switch(l.ty){

                case 2 : s = $35(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 1 : 

                    var cp= l.copy(),_sym= null;

                    _sym = $207(cp, e, _s(s.slice(), cp, e, e.eh, _0));

                    if ( e.p!==58 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

                    cp = l.copy();

                    _sym = s.slice();

                    _sym.push($dimension(cp, e));

                    e.p = (e.FAILED)?-1:64;

                    if ( e.p!==64 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

                    s.push($ratio(l, e));

                    e.p = (e.FAILED)?-1:62;

                    break;
                
            }
        
    }

    return s;
}

function $_16(l, e, s){

    if ( _4.includes(l.tx) ) {s = $176(l, e, _s(s, l, e, e.eh, _0));}

    return s;
}

function $_17(l, e, s){

    if ( _4.includes(l.tx) ) {s = $179(l, e, _s(s, l, e, e.eh, _0));}

    return s;
}

function $_19(l, e, s){

    switch(l.tx){

        case "#" : 

            s.push($ID_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:83;

            break;
         

        case "." : 

            s.push($CLASS_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:84;

            break;
         

        case ":" : 

            s.push($PSEUDO_CLASS_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:86;

            break;
         

        case "[" : 

            s.push($ATTRIBUTE_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:88;

            break;
        
    }

    return s;
}

function $_20(l, e, s){

    if ( _5.includes(l.tx) ) {

        s.push($PSEUDO_CLASS_SELECTOR(l, e));

        e.p = (e.FAILED)?-1:86;
    }

    return s;
}

function $_21(l, e, s){

    if ( _5.includes(l.tx) ) {

        s.push($PSEUDO_ELEMENT_SELECTOR(l, e));

        e.p = (e.FAILED)?-1:92;
    }

    return s;
}

function $_23(l, e, s){

    switch(l.tx){

        case "$" : s = $34(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "*" : s = $27(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "-" : s = $36(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "|" : s = $31(l, e, _s(s, l, e, e.eh, _0)); break; 

        default : 

            switch(l.ty){

                case 2 : s = $35(l, e, _s(s, l, e, e.eh, _0)); break;
            }
        
    }

    return s;
}

function $_26(l, e, s){

    switch(l.tx){

        case "$" : s = $34(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "-" : s = $36(l, e, _s(s, l, e, e.eh, _0)); break; 

        case ";" : s = $144(l, e, _s(s, l, e, e.eh, _0)); break; 

        default : 

            switch(l.ty){

                case 2 : s = $35(l, e, _s(s, l, e, e.eh, _0)); break;
            }
        
    }

    return s;
}

function $_28(l, e, s){

    switch(l.tx){

        case "-" : s = $321(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "'\'" : s = $330(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "_" : s = $322(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "true" : s = $323(l, e, _s(s, l, e, e.eh, _0)); break; 

        case ")" : 

            e.sp -= 0;

            return (e.p = 101, (s.splice(-0, 0, s[s.length-1]), s));
         

        default : 

            switch(l.ty){

                case 32 : s = $328(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 2 : s = $325(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 1 : s = $324(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 16 : s = $327(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 64 : s = $329(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 128 : s = $326(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 8 : s = $380(l, e, _s(s, l, e, e.eh, _0)); break;
            }
        
    }

    return s;
}

function $_29(l, e, s){

    switch(l.tx){

        case "-" : s = $321(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "'\'" : s = $330(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "_" : s = $322(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "true" : s = $323(l, e, _s(s, l, e, e.eh, _0)); break; 

        default : 

            switch(l.ty){

                case 32 : s = $328(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 2 : s = $325(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 1 : s = $324(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 16 : s = $327(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 64 : s = $329(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 128 : s = $326(l, e, _s(s, l, e, e.eh, _0)); break;
            }
        
    }

    return s;
}

function $_30(l, e, s){

    switch(l.tx){

        case "$" : s = $34(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "-" : s = $36(l, e, _s(s, l, e, e.eh, _0)); break; 

        default : 

            switch(l.ty){

                case 2 : s = $35(l, e, _s(s, l, e, e.eh, _0)); break;
            }
        
    }

    return s;
}

function $_32(l, e, s){

    switch(l.tx){

        case "$" : 

            var cp= l.copy(),_sym= null;

            _sym = $424(cp, e, _s(s.slice(), cp, e, e.eh, _0));

            if ( e.p!==131 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s = $425(l, e, _s(s, l, e, e.eh, _0));

            break;
         

        case "_" : 

            var cp= l.copy(),_sym= null;

            _sym = $422(cp, e, _s(s.slice(), cp, e, e.eh, _0));

            if ( e.p!==131 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s = $423(l, e, _s(s, l, e, e.eh, _0));

            break;
         

        default : 

            switch(l.ty){

                case 1025 : s = $412(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 32769 : s = $416(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 4097 : s = $411(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 2 : 

                    var cp= l.copy(),_sym= null;

                    _sym = $408(cp, e, _s(s.slice(), cp, e, e.eh, _0));

                    if ( e.p!==122 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

                    cp = l.copy();

                    _sym = $409(cp, e, _s(s.slice(), cp, e, e.eh, _0));

                    if ( e.p!==131 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

                    s = $410(l, e, _s(s, l, e, e.eh, _0));

                    break;
                 

                case 1 : s = $419(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 2049 : s = $413(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 16385 : s = $414(l, e, _s(s, l, e, e.eh, _0)); break;
            }
        
    }

    return s;
}

function $_33(l, e, s){

    switch(l.tx){

        case "-" : s = $244(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "/" : s = $242(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "'\'" : s = $243(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "_" : s = $245(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "true" : s = $246(l, e, _s(s, l, e, e.eh, _0)); break; 

        default : 

            switch(l.ty){

                case 32 : s = $248(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 2 : s = $250(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 1 : s = $249(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 16 : s = $247(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 128 : s = $251(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 8 : s = $450(l, e, _s(s, l, e, e.eh, _0)); break;
            }
        
    }

    return s;
}

function $_35(l, e, s){

    switch(l.tx){

        case "-" : s = $244(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "/" : s = $242(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "'\'" : s = $243(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "_" : s = $245(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "true" : s = $246(l, e, _s(s, l, e, e.eh, _0)); break; 

        default : 

            switch(l.ty){

                case 32 : s = $248(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 2 : s = $250(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 1 : s = $249(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 16 : s = $247(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 128 : s = $251(l, e, _s(s, l, e, e.eh, _0)); break;
            }
        
    }

    return s;
}

function $_49(l, e, s){

    if ( l.END||_7.includes(l.tx)||_8.includes(l.ty) ) {

        e.sp -= 1;

        return (e.p = 2, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $_60(l, e, s){

    if ( _14.includes(l.tx) ) {

        e.sp -= 1;

        return (e.p = 79, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $_66(l, e, s){

    if ( l.END||_18.includes(l.tx)||_19.includes(l.ty) ) {

        e.sp -= 1;

        return (e.p = 105, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $_68(l, e, s){

    if ( _12.includes(l.tx)||_13.includes(l.ty) ) {

        e.sp -= 1;

        return (e.p = 82, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $_77(l, e, s){

    if ( l.END||_7.includes(l.tx)||_8.includes(l.ty) ) {

        e.sp -= 2;

        return (e.p = 9, (s.splice(-2, 2, s[s.length-1]), s));
    }

    return s;
}

function $_81(l, e, s){

    switch(l.tx){

        case "#" : 

            s.push($ID_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:83;

            break;
         

        case "$" : s = $34(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "*" : 

            var cp= l.copy(),_sym= null;

            _sym = $26(cp, e, _s(s.slice(), cp, e, e.eh, _0));

            if ( e.p!==91 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s = $27(l, e, _s(s, l, e, e.eh, _0));

            break;
         

        case "-" : s = $36(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "." : 

            s.push($CLASS_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:84;

            break;
         

        case ":" : 

            var cp= l.copy(),_sym= null;

            _sym = s.slice();

            _sym.push($PSEUDO_CLASS_SELECTOR(cp, e));

            e.p = (e.FAILED)?-1:86;

            if ( e.p!==86 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s.push($PSEUDO_ELEMENT_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:92;

            break;
         

        case "[" : 

            s.push($ATTRIBUTE_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:88;

            break;
         

        case "|" : s = $31(l, e, _s(s, l, e, e.eh, _0)); break; 

        default : 

            switch(l.ty){

                case 2 : s = $35(l, e, _s(s, l, e, e.eh, _0)); break;
            }
        
    }

    return s;
}

function $_87(l, e, s){

    if ( _12.includes(l.tx)||_17.includes(l.ty) ) {

        e.sp -= 1;

        return (e.p = 78, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $_96(l, e, s){

    if ( l.END||_18.includes(l.tx)||_19.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, sym[0]+sym[1]);

        return (e.p = 105, s);
    }

    return s;
}

function $_113(l, e, s){

    if ( l.END||_23.includes(l.tx)||_8.includes(l.ty) ) {

        e.sp -= 1;

        return (e.p = 38, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $_114(l, e, s){

    if ( l.END||_23.includes(l.tx)||_8.includes(l.ty) ) {

        e.sp -= 1;

        return (e.p = 39, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $_115(l, e, s){

    if ( _24.includes(l.tx)||_17.includes(l.ty) ) {

        e.sp -= 1;

        return (e.p = 35, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $_116(l, e, s){

    if ( l.END||_25.includes(l.tx)||_8.includes(l.ty) ) {

        e.sp -= 1;

        return (e.p = 47, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $_124(l, e, s){

    if ( _26.includes(l.tx) ) {

        e.sp -= 1;

        return (e.p = 27, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $_125(l, e, s){

    if ( _26.includes(l.tx) ) {

        e.sp -= 1;

        return (e.p = 28, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $_171(l, e, s){

    if ( _39.includes(l.tx) ) {

        e.sp -= 1;

        return (e.p = 48, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $_174(l, e, s){

    if ( _40.includes(l.tx) ) {

        e.sp -= 1;

        return (e.p = 58, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $_202(l, e, s){

    if ( _43.includes(l.tx)||_44.includes(l.ty) ) {

        e.sp -= 1;

        return (e.p = 127, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $_222(l, e, s){

    if ( _24.includes(l.tx)||_47.includes(l.ty) ) {

        e.sp -= 1;

        return (e.p = 54, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $_223(l, e, s){

    if ( _24.includes(l.tx)||_47.includes(l.ty) ) {

        e.sp -= 1;

        return (e.p = 56, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $_224(l, e, s){

    if ( _24.includes(l.tx)||_47.includes(l.ty) ) {

        e.sp -= 1;

        return (e.p = 55, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $_230(l, e, s){

    if ( _49.includes(l.tx)||_50.includes(l.ty) ) {

        e.sp -= 1;

        return (e.p = 50, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $_236(l, e, s){

    if ( _11.includes(l.tx) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, { type:"KeyframeSelector", val:sym[0], pos });

        return (e.p = 21, s);
    }

    return s;
}

function $_253(l, e, s){

    if ( _52.includes(l.tx)||_53.includes(l.ty) ) {

        e.sp -= 1;

        return (e.p = 107, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $_264(l, e, s){

    if ( _39.includes(l.tx) ) {

        e.sp -= 1;

        return (e.p = 11, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $_270(l, e, s){

    if ( _39.includes(l.tx) ) {

        e.sp -= 3;

        var sym= s.slice(-3);

        s.splice(
            -3,
            3,
            { 

                type:"MediaEquality",

                sym:sym[1],

                left:sym[0],

                right:sym[2],

                pos
             }
        );

        return (e.p = 57, s);
    }

    return s;
}

function $_283(l, e, s){

    switch(l.tx){

        case "-" : s = $321(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "'\'" : s = $330(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "_" : s = $322(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "true" : s = $323(l, e, _s(s, l, e, e.eh, _0)); break; 

        default : 

            switch(l.ty){

                case 32 : s = $328(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 2 : s = $325(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 1 : s = $324(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 16 : s = $327(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 64 : s = $329(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 128 : s = $326(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 8 : s = $380(l, e, _s(s, l, e, e.eh, _0)); break;
            }
        
    }

    return s;
}

function $_284(l, e, s){

    if ( _52.includes(l.tx)||_53.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, sym[0]+sym[1]);

        return (e.p = 103, s);
    }

    return s;
}

function $_295(l, e, s){

    if ( _56.includes(l.tx)||_53.includes(l.ty) ) {

        e.sp -= 1;

        return (e.p = 101, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $_311(l, e, s){

    if ( _60.includes(l.tx)||_61.includes(l.ty) ) {

        e.sp -= 1;

        return (e.p = 113, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $_313(l, e, s){

    if ( _62.includes(l.tx)||_63.includes(l.ty) ) {

        e.sp -= 1;

        return (e.p = 131, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $_314(l, e, s){

    if ( _64.includes(l.tx)||_63.includes(l.ty) ) {

        e.sp -= 1;

        return (e.p = 133, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $_329(l, e, s){

    if ( _62.includes(l.tx)||_63.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, sym[0]+sym[1]);

        return (e.p = 131, s);
    }

    return s;
}

function $_330(l, e, s){

    if ( _64.includes(l.tx)||_63.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, sym[0]+sym[1]);

        return (e.p = 133, s);
    }

    return s;
}

function $_333(l, e, s){

    if ( _65.includes(l.tx)||_44.includes(l.ty) ) {

        e.sp -= 1;

        return (e.p = 123, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}

function $CSS(l, e){

    if ( e.FAILED ) return ;

    const $1_= $STYLE_SHEET(l, e);

    return $1_;
}
function $STYLE_SHEET_group_03_101(l, e){

    const tx = l.tx, ty = l.ty;

    if ( tx=="@" ) {

        if ( e.FAILED ) return ;

        const $1_= $AT_RULE(l, e);

        return $1_;
    }

    if ( tx=="*"||tx=="|"||tx=="$"||ty==2||tx=="-"||tx=="#"||tx=="."||tx=="["||tx==":" ) {

        if ( e.FAILED ) return ;

        const $1_= $STYLE_RULE(l, e);

        return $1_;
    }

    e.FAILED = true;
}
function $import_group_012_105(l, e){

    const tx = l.tx;

    if ( tx=="url" ) {

        if ( e.FAILED ) return ;

        const $1_= $url(l, e);

        return $1_;
    }

    if ( tx=='"'||tx=="'" ) {

        if ( e.FAILED ) return ;

        const $1_= $string(l, e);

        return $1_;
    }

    e.FAILED = true;
}
function $import_group_315_107(l, e){

    _(l, e, e.eh, _0, "supports");

    _(l, e, e.eh, _0, "(");

    if ( e.FAILED ) return ;

    $import_group_014_106(l, e);

    const $4_= _(l, e, e.eh, _0, ")");

    return $4_;
}
function $import(l, e){

    _(l, e, e.eh, _0, "@");

    _(l, e, e.eh, _0, "import");

    if ( e.FAILED ) return ;

    const $3_= $import_group_012_105(l, e);

    const tx = l.tx, ty = l.ty;

    if ( tx=="supports" ) {

        if ( e.FAILED ) return ;

        const $4_= $import_group_315_107(l, e);

        if ( e.FAILED ) return ;

        const $5_= $import_HC_listbody5_108(l, e);

        return ({ 

            import:"@import",

            type:"Import",

            nodes:[$3_,$4_,...$5_],

            pos
         });

        return ({ 

            import:"@import",

            type:"Import",

            nodes:[$3_,$4_,...null],

            pos
         });
    }

    if ( tx=="not"||tx=="("||tx=="$"||ty==2||tx=="-"||tx=="only" ) {

        if ( e.FAILED ) return ;

        const $4_= $import_HC_listbody5_108(l, e);

        return ({ 

            import:"@import",

            type:"Import",

            nodes:[$3_,null,...$4_],

            pos
         });
    }

    return ({ 

        import:"@import",

        type:"Import",

        nodes:[$3_,null,...null],

        pos
     });
}
function $import_declaration(l, e){

    if ( e.FAILED ) return ;

    const $1_= $declaration(l, e);

    return $1_;
}
function $keyframes(l, e){

    _(l, e, e.eh, _0, "@");

    _(l, e, e.eh, _0, "keyframes");

    if ( e.FAILED ) return ;

    const $3_= $keyframes_name(l, e);

    _(l, e, e.eh, _0, "{");

    if ( e.FAILED ) return ;

    const $5_= $keyframes_HC_listbody5_109(l, e);

    _(l, e, e.eh, _0, "}");

    return ({ 

        keyframes:"@keyframes",

        type:"Keyframes",

        name:$3_,

        nodes:[$5_],

        pos
     });
}
function $keyframes_name(l, e){

    const tx = l.tx, ty = l.ty;

    if ( ty==2 ) {const $1_= _(l, e, e.eh, _0, 2); return $1_;}

    if ( tx=='"'||tx=="'" ) {

        if ( e.FAILED ) return ;

        const $1_= $string(l, e);

        return $1_;
    }

    e.FAILED = true;
}
function $keyframes_blocks(l, e){

    if ( e.FAILED ) return ;

    const $1_= $keyframes_blocks_HC_listbody1_110(l, e);

    _(l, e, e.eh, _0, "{");

    if ( e.FAILED ) return ;

    const $3_= $declaration_list(l, e);

    const tx = l.tx;

    if ( tx==";" ) {

        _(l, e, e.eh, _0, ";");

        _(l, e, e.eh, _0, "}");

        return ({ 

            type:"KeyframeBlock",

            nodes:[{ type:"KeyframeSelectors", nodes:$1_, pos },$3_],

            pos
         });
    }

    if ( tx=="}" ) {

        _(l, e, e.eh, _0, "}");

        return ({ 

            type:"KeyframeBlock",

            nodes:[{ type:"KeyframeSelectors", nodes:$1_, pos },$3_],

            pos
         });
    }

    e.FAILED = true;
}
function $keyframe_selector(l, e){

    const tx = l.tx, ty = l.ty;

    if ( tx=="from" ) {

        const $1_= _(l, e, e.eh, _0, "from");

        return ({ type:"KeyframeSelector", val:$1_, pos });
    }

    if ( tx=="to" ) {

        const $1_= _(l, e, e.eh, _0, "to");

        return ({ type:"KeyframeSelector", val:$1_, pos });
    }

    if ( ty==1 ) {

        if ( e.FAILED ) return ;

        const $1_= $percentage(l, e);

        return ({ type:"KeyframeSelector", val:$1_, pos });
    }

    e.FAILED = true;
}
function $supports_group_025_111(l, e){

    if ( e.FAILED ) return ;

    const $1_= $supports_condition(l, e);

    return ({ type:"SupportConditions", nodes:$1_, pos });
}
function $supports(l, e){

    const $1_= _(l, e, e.eh, _0, "@");

    _(l, e, e.eh, _0, "supports");

    if ( e.FAILED ) return ;

    const $3_= $supports_group_025_111(l, e);

    _(l, e, e.eh, _0, "{");

    const tx = l.tx, ty = l.ty;

    if ( tx=="}" ) {

        _(l, e, e.eh, _0, "}");

        return ({ type:"Supports", nodes:[$1_,$3_], pos });
    }

    if ( tx=="*"||tx=="|"||tx=="$"||ty==2||tx=="-"||tx=="#"||tx=="."||tx=="["||tx==":" ) {

        if ( e.FAILED ) return ;

        $GROUP_RULE_BODY(l, e);

        _(l, e, e.eh, _0, "}");

        return ({ type:"Supports", nodes:[$1_,$3_], pos });
    }

    e.FAILED = true;
}
function $supports_condition_group_129_112(l, e){

    const tx = l.tx;

    if ( tx=="and" ) {

        _(l, e, e.eh, _0, "and");

        if ( e.FAILED ) return ;

        const $2_= $supports_in_parens(l, e);

        return ({ type:"And", nodes:[$2_], pos });
    }

    if ( tx=="or" ) {

        _(l, e, e.eh, _0, "or");

        if ( e.FAILED ) return ;

        const $2_= $supports_in_parens(l, e);

        return ({ type:"Or", nodes:[$2_], pos });
    }

    e.FAILED = true;
}
function $supports_condition(l, e){

    const tx = l.tx, ty = l.ty;

    if ( tx=="not" ) {

        _(l, e, e.eh, _0, "not");

        if ( e.FAILED ) return ;

        const $2_= $supports_in_parens(l, e);

        return ([{ type:"Not", nodes:[$2_], pos }]);
    }

    if ( tx=="("||tx=="selector"||tx=="$"||ty==2||tx=="-" ) {

        if ( e.FAILED ) return ;

        const $1_= $supports_in_parens(l, e);

        if ( e.FAILED ) return ;

        const $2_= $supports_condition_HC_listbody2_113(l, e);

        return ([$1_,...$2_]);

        return ([$1_]);
    }

    e.FAILED = true;
}
function $supports_feature(l, e){

    const tx = l.tx;

    if ( tx=="selector" ) {

        if ( e.FAILED ) return ;

        const $1_= $supports_feature_fn(l, e);

        return $1_;
    }

    if ( tx=="(" ) {

        if ( e.FAILED ) return ;

        const $1_= $supports_decl(l, e);

        return $1_;
    }

    e.FAILED = true;
}
function $supports_decl(l, e){

    _(l, e, e.eh, _0, "(");

    if ( e.FAILED ) return ;

    $declaration(l, e);

    const $3_= _(l, e, e.eh, _0, ")");

    return $3_;
}
function $supports_feature_fn(l, e){

    const $1_= _(l, e, e.eh, _0, "selector");

    _(l, e, e.eh, _0, "(");

    if ( e.FAILED ) return ;

    $COMPLEX_SELECTOR(l, e);

    _(l, e, e.eh, _0, ")");

    return ({ type:"Function", nodes:[$1_], pos });
}
function $media(l, e){

    _(l, e, e.eh, _0, "@");

    _(l, e, e.eh, _0, "media");

    if ( e.FAILED ) return ;

    const $3_= $media_queries(l, e);

    _(l, e, e.eh, _0, "{");

    const tx = l.tx, ty = l.ty;

    if ( tx=="}" ) {

        _(l, e, e.eh, _0, "}");

        return ({ media:"@media", type:"Media", nodes:[$3_], pos });
    }

    if ( tx=="*"||tx=="|"||tx=="$"||ty==2||tx=="-"||tx=="#"||tx=="."||tx=="["||tx==":" ) {

        if ( e.FAILED ) return ;

        const $5_= $GROUP_RULE_BODY(l, e);

        _(l, e, e.eh, _0, "}");

        return ({ 

            media:"@media",

            type:"Media",

            nodes:[$3_,...$5_],

            pos
         });
    }

    e.FAILED = true;
}
function $media_queries(l, e){

    if ( e.FAILED ) return ;

    const $1_= $media_queries_group_039_115(l, e);

    return ({ queries:true, type:"MediaQueries", nodes:$1_, pos });
}
function $media_query_group_043_116(l, e){

    const tx = l.tx;

    if ( tx=="not" ) {const $1_= _(l, e, e.eh, _0, "not"); return $1_;}

    if ( tx=="only" ) {const $1_= _(l, e, e.eh, _0, "only"); return $1_;}

    e.FAILED = true;
}
function $media_query_group_144_117(l, e){

    _(l, e, e.eh, _0, "and");

    if ( e.FAILED ) return ;

    const $2_= $media_condition_without_or(l, e);

    return ({ type:"And", nodes:[$2_], pos });
}
function $media_not(l, e){

    _(l, e, e.eh, _0, "not");

    if ( e.FAILED ) return ;

    const $2_= $media_in_parenths(l, e);

    return ({ type:"Not", nodes:[$2_], pos });
}
function $media_and_group_152_118(l, e){

    _(l, e, e.eh, _0, "and");

    if ( e.FAILED ) return ;

    const $2_= $media_in_parenths(l, e);

    return ({ type:"And", nodes:[$2_], pos });
}
function $media_and(l, e){

    if ( e.FAILED ) return ;

    const $1_= $media_in_parenths(l, e);

    if ( e.FAILED ) return ;

    const $2_= $media_and_HC_listbody2_119(l, e);

    return ([$1_,...$2_]);
}
function $media_or_group_154_120(l, e){

    _(l, e, e.eh, _0, "or");

    if ( e.FAILED ) return ;

    const $2_= $media_in_parenths(l, e);

    return ({ type:"And", nodes:[$2_], pos });
}
function $media_or(l, e){

    if ( e.FAILED ) return ;

    const $1_= $media_in_parenths(l, e);

    if ( e.FAILED ) return ;

    const $2_= $media_or_HC_listbody2_121(l, e);

    return ([$1_,...$2_]);
}
function $media_feature(l, e){

    _(l, e, e.eh, _0, "(");

    if ( e.FAILED ) return ;

    const $2_= $media_feature_group_061_122(l, e);

    _(l, e, e.eh, _0, ")");

    return ({ type:"MediaFeature", nodes:[$2_], pos });
}
function $general_enclosed_group_064_123(l, e){

    const ty = l.ty;

    if ( true ) {const $1_= _(l, e, e.eh, _0, true); return $1_;}

    if ( ty==8 ) {const $1_= _(l, e, e.eh, _0, 8); return $1_;}

    e.FAILED = true;
}
function $general_enclosed(l, e){

    if ( e.FAILED ) return ;

    $identifier(l, e);

    _(l, e, e.eh, _0, "(");

    const tx = l.tx, ty = l.ty;

    if ( tx==")" ) {const $3_= _(l, e, e.eh, _0, ")"); return $3_;}

    if ( true||ty==8 ) {

        if ( e.FAILED ) return ;

        $general_enclosed_HC_listbody1_124(l, e);

        const $4_= _(l, e, e.eh, _0, ")");

        return $4_;
    }

    e.FAILED = true;
}
function $mf_plain(l, e){

    if ( e.FAILED ) return ;

    const $1_= $mf_name(l, e);

    _(l, e, e.eh, _0, ":");

    if ( e.FAILED ) return ;

    const $3_= $mf_value(l, e);

    return ({ type:"MediaValue", key:$1_, val:$3_, pos });
}
function $mf_range_group_071_125(l, e){

    const tx = l.tx;

    if ( tx=="<" ) {const $1_= _(l, e, e.eh, _0, "<"); return $1_;}

    if ( tx=="<=" ) {const $1_= _(l, e, e.eh, _0, "<="); return $1_;}

    if ( tx==">" ) {const $1_= _(l, e, e.eh, _0, ">"); return $1_;}

    if ( tx==">=" ) {const $1_= _(l, e, e.eh, _0, ">="); return $1_;}

    if ( tx=="=" ) {const $1_= _(l, e, e.eh, _0, "="); return $1_;}

    e.FAILED = true;
}
function $mf_range_group_080_126(l, e){

    const tx = l.tx;

    if ( tx==">" ) {const $1_= _(l, e, e.eh, _0, ">"); return $1_;}

    if ( tx==">=" ) {const $1_= _(l, e, e.eh, _0, ">="); return $1_;}

    e.FAILED = true;
}
function $mf_range_group_085_127(l, e){

    const tx = l.tx;

    if ( tx=="<" ) {const $1_= _(l, e, e.eh, _0, "<"); return $1_;}

    if ( tx=="<=" ) {const $1_= _(l, e, e.eh, _0, "<="); return $1_;}

    e.FAILED = true;
}
function $mf_boolean(l, e){

    const tx = l.tx;

    if ( tx=="true" ) {

        _(l, e, e.eh, _0, "true");

        return ({ type:"Boolean", val:true, pos });
    }

    if ( tx=="false" ) {

        _(l, e, e.eh, _0, "false");

        return ({ type:"Boolean", val:false, pos });
    }

    e.FAILED = true;
}
function $mf_name(l, e){

    if ( e.FAILED ) return ;

    const $1_= $identifier(l, e);

    return $1_;
}
function $media_type(l, e){

    if ( e.FAILED ) return ;

    const $1_= $identifier(l, e);

    return ({ type:"MediaType", val:$1_, pos });
}
function $ratio(l, e){

    const $1_= _(l, e, e.eh, _0, 1);

    _(l, e, e.eh, _0, "/");

    const $3_= _(l, e, e.eh, _0, 1);

    return ({ type:"ratio", num:$1_, den:$3_ });
}
function $percentage(l, e){

    const $1_= _(l, e, e.eh, _0, 1);

    _(l, e, e.eh, _0, "%");

    return (new parseFloat($1_));
}
function $dimension(l, e){

    const $1_= _(l, e, e.eh, _0, 1);

    _(l, e, e.eh, _0, 2);

    return (new parseFloat($1_));
}
function $url(l, e){

    _(l, e, e.eh, _0, "url");

    _(l, e, e.eh, _0, "(");

    if ( e.FAILED ) return ;

    const $3_= $string(l, e);

    _(l, e, e.eh, _0, ")");

    return (new String($3_));
}
function $string(l, e){

    const tx = l.tx;

    if ( tx=='"' ) {

        _(l, e, e.eh, _0, '"');

        if ( e.FAILED ) return ;

        $string_HC_listbody1_128(l, e);

        const $3_= _(l, e, e.eh, _0, '"');

        return $3_;
    }

    if ( tx=="'" ) {

        _(l, e, e.eh, _0, "'");

        if ( e.FAILED ) return ;

        const $2_= $string_HC_listbody1_129(l, e);

        _(l, e, e.eh, _0, "'");

        return ($2_);
    }

    e.FAILED = true;
}
function $COMPLEX_SELECTOR_group_0103_130(l, e){

    if ( e.FAILED ) return ;

    const $1_= $COMBINATOR(l, e);

    return ({ type:"Combinator", val:$1_ });
}
function $COMPLEX_SELECTOR_group_1104_131(l, e){

    const tx = l.tx, ty = l.ty;

    if ( tx==">"||tx=="+"||tx=="~"||tx=="||" ) {

        if ( e.FAILED ) return ;

        const $1_= $COMPLEX_SELECTOR_group_0103_130(l, e);

        if ( e.FAILED ) return ;

        const $2_= $COMPOUND_SELECTOR(l, e);

        return ([$1_,$2_]);
    }

    if ( tx=="*"||tx=="|"||tx=="$"||ty==2||tx=="-"||tx=="#"||tx=="."||tx=="["||tx==":" ) {

        if ( e.FAILED ) return ;

        const $1_= $COMPOUND_SELECTOR(l, e);

        return ([$1_]);
    }

    e.FAILED = true;
}
function $COMPLEX_SELECTOR(l, e){

    if ( e.FAILED ) return ;

    const $1_= $COMPOUND_SELECTOR(l, e);

    if ( e.FAILED ) return ;

    const $2_= $COMPLEX_SELECTOR_HC_listbody2_132(l, e);

    return (($1_&&$2_)?{ 

        type:"ComplexSelector",

        nodes:[$1_,...(($2_).flat(2))],

        pos
     }:$1_);

    return (($1_&&null)?{ type:"ComplexSelector", nodes:[$1_], pos }:$1_);
}
function $COMPOUND_SELECTOR_group_1106_135(l, e){

    if ( e.FAILED ) return ;

    const $1_= $PSEUDO_ELEMENT_SELECTOR(l, e);

    if ( e.FAILED ) return ;

    const $2_= $COMPOUND_SELECTOR_HC_listbody1_134(l, e);

    return ({ type:"PseudoSelector", nodes:[$1_,...$2_], pos });

    return ({ type:"PseudoSelector", nodes:[$1_], pos });
}
function $COMBINATOR(l, e){

    const tx = l.tx;

    if ( tx==">" ) {const $1_= _(l, e, e.eh, _0, ">"); return $1_;}

    if ( tx=="+" ) {const $1_= _(l, e, e.eh, _0, "+"); return $1_;}

    if ( tx=="~" ) {const $1_= _(l, e, e.eh, _0, "~"); return $1_;}

    if ( tx=="||" ) {const $1_= _(l, e, e.eh, _0, "||"); return $1_;}

    e.FAILED = true;
}
function $NS_PREFIX_group_0113_137(l, e){

    const tx = l.tx, ty = l.ty;

    if ( tx=="*" ) {const $1_= _(l, e, e.eh, _0, "*"); return $1_;}

    if ( tx=="$"||ty==2||tx=="-" ) {

        if ( e.FAILED ) return ;

        const $1_= $identifier(l, e);

        return $1_;
    }

    e.FAILED = true;
}
function $NS_PREFIX(l, e){

    const tx = l.tx, ty = l.ty;

    if ( tx=="|" ) {_(l, e, e.eh, _0, "|"); return (null);}

    if ( tx=="*"||tx=="$"||ty==2||tx=="-" ) {

        if ( e.FAILED ) return ;

        const $1_= $NS_PREFIX_group_0113_137(l, e);

        _(l, e, e.eh, _0, "|");

        return ($1_);
    }

    e.FAILED = true;
}
function $SUBCLASS_SELECTOR(l, e){

    const tx = l.tx;

    if ( tx=="#" ) {

        if ( e.FAILED ) return ;

        const $1_= $ID_SELECTOR(l, e);

        return $1_;
    }

    if ( tx=="." ) {

        if ( e.FAILED ) return ;

        const $1_= $CLASS_SELECTOR(l, e);

        return $1_;
    }

    if ( tx=="[" ) {

        if ( e.FAILED ) return ;

        const $1_= $ATTRIBUTE_SELECTOR(l, e);

        return $1_;
    }

    if ( tx==":" ) {

        if ( e.FAILED ) return ;

        const $1_= $PSEUDO_CLASS_SELECTOR(l, e);

        return $1_;
    }

    e.FAILED = true;
}
function $ID_SELECTOR(l, e){

    _(l, e, e.eh, _0, "#");

    if ( e.FAILED ) return ;

    const $2_= $identifier(l, e);

    return ({ 

        type:"IdSelector",

        val:$2_,

        pos,

        precedence:"B_SPECIFIER"
     });
}
function $CLASS_SELECTOR(l, e){

    _(l, e, e.eh, _0, ".");

    if ( e.FAILED ) return ;

    const $2_= $identifier(l, e);

    return ({ 

        type:"ClassSelector",

        val:$2_,

        pos,

        precedence:"C_SPECIFIER"
     });
}
function $PSEUDO_CLASS_SELECTOR_group_2122_138(l, e){

    _(l, e, e.eh, _0, "(");

    if ( e.FAILED ) return ;

    const $2_= $def$string_value(l, e);

    _(l, e, e.eh, _0, ")");

    return ($2_);
}
function $PSEUDO_CLASS_SELECTOR(l, e){

    _(l, e, e.eh, _0, ":");

    if ( e.FAILED ) return ;

    const $2_= $identifier(l, e);

    if ( e.FAILED ) return ;

    const $3_= $PSEUDO_CLASS_SELECTOR_group_2122_138(l, e);

    return ({ 

        type:"PseudoClassSelector",

        id:$2_,

        val:$3_,

        pos,

        precedence:"C_SPECIFIER"
     });

    return ({ 

        type:"PseudoClassSelector",

        id:$2_,

        pos,

        precedence:"C_SPECIFIER"
     });
}
function $ATTRIBUTE_SELECTOR_group_2126_139(l, e){

    const tx = l.tx, ty = l.ty;

    if ( tx=='"' ) {

        _(l, e, e.eh, _0, '"');

        if ( e.FAILED ) return ;

        const $2_= $def$string_value(l, e);

        _(l, e, e.eh, _0, '"');

        return ("\""+$2_+"\"");
    }

    if ( tx=="$"||ty==2||tx=="-" ) {

        if ( e.FAILED ) return ;

        const $1_= $identifier(l, e);

        return $1_;
    }

    e.FAILED = true;
}
function $ATTRIBUTE_SELECTOR(l, e){

    _(l, e, e.eh, _0, "[");

    if ( e.FAILED ) return ;

    const $2_= $WQ_NAME(l, e);

    const tx = l.tx;

    if ( tx=="]" ) {

        _(l, e, e.eh, _0, "]");

        return ({ 

            type:"AttributeSelector",

            nodes:[$2_],

            pos,

            precedence:"C_SPECIFIER"
         });
    }

    if ( tx=="~"||tx=="^="||tx=="$="||tx=="*="||tx=="=" ) {

        if ( e.FAILED ) return ;

        const $3_= $ATTR_MATCHER(l, e);

        if ( e.FAILED ) return ;

        const $4_= $ATTRIBUTE_SELECTOR_group_2126_139(l, e);

        const tx = l.tx;

        if ( tx=="]" ) {

            _(l, e, e.eh, _0, "]");

            return ({ 

                type:"AttributeSelector",

                nodes:[$2_],

                match_type:$3_,

                match_val:$4_,

                pos,

                precedence:"C_SPECIFIER"
             });
        }

        if ( tx=="i"||tx=="s" ) {

            if ( e.FAILED ) return ;

            const $5_= $ATTR_MODIFIER(l, e);

            _(l, e, e.eh, _0, "]");

            return ({ 

                type:"AttributeSelector",

                nodes:[$2_],

                match_type:$3_,

                match_val:$4_,

                mod:$5_,

                pos,

                precedence:"C_SPECIFIER"
             });
        }
    }

    e.FAILED = true;
}
function $ATTR_MATCHER(l, e){

    const tx = l.tx;

    if ( tx=="~" ) {

        _(l, e, e.eh, _0, "~");

        const $2_= _(l, e, e.eh, _0, "=");

        return $2_;
    }

    if ( tx=="^=" ) {const $1_= _(l, e, e.eh, _0, "^="); return $1_;}

    if ( tx=="$=" ) {const $1_= _(l, e, e.eh, _0, "$="); return $1_;}

    if ( tx=="*=" ) {const $1_= _(l, e, e.eh, _0, "*="); return $1_;}

    if ( tx=="=" ) {const $1_= _(l, e, e.eh, _0, "="); return $1_;}

    e.FAILED = true;
}
function $ATTR_MODIFIER(l, e){

    const tx = l.tx;

    if ( tx=="i" ) {const $1_= _(l, e, e.eh, _0, "i"); return $1_;}

    if ( tx=="s" ) {const $1_= _(l, e, e.eh, _0, "s"); return $1_;}

    e.FAILED = true;
}
function $PSEUDO_ELEMENT_SELECTOR(l, e){

    _(l, e, e.eh, _0, ":");

    if ( e.FAILED ) return ;

    const $2_= $PSEUDO_CLASS_SELECTOR(l, e);

    return ($2_.type = "PseudoElementSelector", $2_.precedence = "D_SPECIFIER", $2_);
}
function $declaration_list_group_1138_141(l, e){

    const tx = l.tx, ty = l.ty;

    if ( tx==";" ) {

        if ( e.FAILED ) return ;

        $declaration_list_HC_listbody3_140(l, e);

        if ( e.FAILED ) return ;

        const $2_= $rule_declaration(l, e);

        return $2_;
    }

    if ( tx=="$"||ty==2||tx=="-" ) {

        if ( e.FAILED ) return ;

        const $1_= $rule_declaration(l, e);

        return $1_;
    }

    e.FAILED = true;
}
function $declaration_list(l, e){

    if ( e.FAILED ) return ;

    const $1_= $declaration_list_HC_listbody2_142(l, e);

    if ( e.FAILED ) return ;

    $declaration_list_HC_listbody1_143(l, e);

    return ($1_);

    return ($1_);
}
function $rule_declaration(l, e){

    if ( e.FAILED ) return ;

    const $1_= $declaration(l, e);

    return $1_;
}
function $declaration_group_1141_144(l, e){

    _(l, e, e.eh, _0, "!");

    const $2_= _(l, e, e.eh, _0, "important");

    return $2_;
}
function $declaration(l, e){

    if ( e.FAILED ) return ;

    const $1_= $declaration_id(l, e);

    _(l, e, e.eh, _0, ":");

    if ( e.FAILED ) return ;

    const $3_= $declaration_values(l, e);

    if ( e.FAILED ) return ;

    const $4_= $declaration_group_1141_144(l, e);

    return ({ 

        type:"Declaration",

        name:$1_,

        val:$3_,

        IMPORTANT:!!$4_
     });

    return ({ type:"Declaration", name:$1_, val:$3_ });
}
function $identifier(l, e){

    if ( e.FAILED ) return ;

    const $1_= $css_id_symbols(l, e);

    return $1_;
}
function $declaration_id(l, e){

    if ( e.FAILED ) return ;

    const $1_= $css_id_symbols(l, e);

    return $1_;
}
function $def$start(l, e){

    if ( e.FAILED ) return ;

    const $1_= $def$defaultproductions(l, e);

    return $1_;
}
function $def$hex_digit(l, e){

    const tx = l.tx, ty = l.ty;

    if ( ty==8193 ) {const $1_= _(l, e, e.eh, _0, 8193); return $1_;}

    if ( tx=="a" ) {const $1_= _(l, e, e.eh, _0, "a"); return $1_;}

    if ( tx=="b" ) {const $1_= _(l, e, e.eh, _0, "b"); return $1_;}

    if ( tx=="c" ) {const $1_= _(l, e, e.eh, _0, "c"); return $1_;}

    if ( tx=="d" ) {const $1_= _(l, e, e.eh, _0, "d"); return $1_;}

    if ( tx=="e" ) {const $1_= _(l, e, e.eh, _0, "e"); return $1_;}

    if ( tx=="f" ) {const $1_= _(l, e, e.eh, _0, "f"); return $1_;}

    if ( tx=="A" ) {const $1_= _(l, e, e.eh, _0, "A"); return $1_;}

    if ( tx=="B" ) {const $1_= _(l, e, e.eh, _0, "B"); return $1_;}

    if ( tx=="C" ) {const $1_= _(l, e, e.eh, _0, "C"); return $1_;}

    if ( tx=="D" ) {const $1_= _(l, e, e.eh, _0, "D"); return $1_;}

    if ( tx=="E" ) {const $1_= _(l, e, e.eh, _0, "E"); return $1_;}

    if ( tx=="F" ) {const $1_= _(l, e, e.eh, _0, "F"); return $1_;}

    e.FAILED = true;
}
function $def$hex(l, e){

    const $1_= _(l, e, e.eh, _0, 4097);

    return ({ val:parseFloat($1_), type:"hex", original_val:$1_ });
}
function $def$binary(l, e){

    const $1_= _(l, e, e.eh, _0, 1025);

    return ({ val:parseFloat($1_), type:"bin", original_val:$1_ });
}
function $def$octal(l, e){

    const $1_= _(l, e, e.eh, _0, 2049);

    return ({ val:parseFloat($1_), type:"oct", original_val:$1_ });
}
function $def$scientific(l, e){

    const ty = l.ty;

    if ( ty==16385 ) {

        const $1_= _(l, e, e.eh, _0, 16385);

        return ({ val:parseFloat($1_), type:"sci", original_val:$1_ });
    }

    if ( ty==32769||ty==1 ) {

        if ( e.FAILED ) return ;

        const $1_= $def$float(l, e);

        return $1_;
    }

    e.FAILED = true;
}
function $def$float(l, e){

    const ty = l.ty;

    if ( ty==32769 ) {

        const $1_= _(l, e, e.eh, _0, 32769);

        return ({ val:parseFloat($1_), type:"flt", original_val:$1_ });
    }

    if ( ty==1 ) {

        if ( e.FAILED ) return ;

        const $1_= $def$integer(l, e);

        return $1_;
    }

    e.FAILED = true;
}
function $def$integer(l, e){

    if ( e.FAILED ) return ;

    const $1_= $def$natural(l, e);

    return ({ val:parseFloat($1_), type:"int", original_val:$1_ });
}
function $def$natural(l, e){const $1_= _(l, e, e.eh, _0, 1); return $1_;}
function $def$id(l, e){const $1_= _(l, e, e.eh, _0, 2); return $1_;}
function $def$string(l, e){

    const tx = l.tx;

    if ( tx=='"' ) {

        _(l, e, e.eh, _0, '"');

        if ( e.FAILED ) return ;

        const $2_= $def$string_HC_listbody1_102(l, e);

        _(l, e, e.eh, _0, '"');

        return ($2_);
    }

    if ( tx=="'" ) {

        _(l, e, e.eh, _0, "'");

        if ( e.FAILED ) return ;

        const $2_= $def$string_HC_listbody1_103(l, e);

        _(l, e, e.eh, _0, "'");

        return ($2_);
    }

    e.FAILED = true;
}
function $def$js_identifier(l, e){

    if ( e.FAILED ) return ;

    const $1_= $def$js_id_symbols(l, e);

    return $1_;
}
function $def$identifier(l, e){

    if ( e.FAILED ) return ;

    const $1_= $def$identifier_symbols(l, e);

    return $1_;
}
function $STYLE_SHEET_HC_listbody1_100(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_0(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 14 : s = $5(l, e, s); break; 

            case 1 : s = $2(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![1,14].includes(a) ) fail(l, e);else e.p = 1;

    return s[s.length-1];
}
function $STYLE_SHEET_HC_listbody1_102(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    
    switch(l.tx){

        case "#" : 

            s.push($ID_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:83;

            break;
         

        case "$" : s = $34(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "*" : 

            var cp= l.copy(),_sym= null;

            _sym = $26(cp, e, _s(s.slice(), cp, e, e.eh, _0));

            if ( e.p!==91 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s = $27(l, e, _s(s, l, e, e.eh, _0));

            break;
         

        case "-" : s = $36(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "." : 

            s.push($CLASS_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:84;

            break;
         

        case ":" : 

            var cp= l.copy(),_sym= null;

            _sym = s.slice();

            _sym.push($PSEUDO_CLASS_SELECTOR(cp, e));

            e.p = (e.FAILED)?-1:86;

            if ( e.p!==86 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s.push($PSEUDO_ELEMENT_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:92;

            break;
         

        case "@" : 

            var cp= l.copy(),_sym= null;

            _sym = s.slice();

            _sym.push($supports(cp, e));

            e.p = (e.FAILED)?-1:23;

            if ( e.p!==23 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            cp = l.copy();

            _sym = s.slice();

            _sym.push($import(cp, e));

            e.p = (e.FAILED)?-1:14;

            if ( e.p!==14 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            cp = l.copy();

            _sym = s.slice();

            _sym.push($media(cp, e));

            e.p = (e.FAILED)?-1:31;

            if ( e.p!==31 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s.push($keyframes(l, e));

            e.p = (e.FAILED)?-1:17;

            break;
         

        case "[" : 

            s.push($ATTRIBUTE_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:88;

            break;
         

        case "|" : s = $31(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "+" :  

        case "," :  

        case ">" :  

        case "{" :  

        case "||" :  

        case "~" : 

            e.sp -= 0;

            var sym= s.slice(-0);

            s.splice(
                -0,
                0,
                (null&&!(null||null))?null:(null&&null.length==1&&!(null||null))?null[0]:{ type:"CompoundSelector", nodes:[], pos }
            );

            return (e.p = 77, s);
         

        default : 

            switch(l.ty){

                case 2 : s = $35(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 8 : 

                    e.sp -= 0;

                    var sym= s.slice(-0);

                    s.splice(
                        -0,
                        0,
                        (null&&!(null||null))?null:(null&&null.length==1&&!(null||null))?null[0]:{ type:"CompoundSelector", nodes:[], pos }
                    );

                    return (e.p = 77, s);
                
            }
        
    }

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : 

                s = $28(l, e, s);

                if ( e.p<0 ) s = $29(l, e, s);

                break;
             

            case 92 : s = $48(l, e, s); break; 

            case 91 : s = $18(l, e, s); break; 

            case 88 : s = $40(l, e, s); break; 

            case 86 : s = $41(l, e, s); break; 

            case 84 : s = $39(l, e, s); break; 

            case 83 : s = $38(l, e, s); break; 

            case 82 : s = $37(l, e, s); break; 

            case 81 : s = $23(l, e, s); break; 

            case 80 : 

                s = $24(l, e, s);

                if ( e.p<0 ) s = $25(l, e, s);

                break;
             

            case 79 : s = $30(l, e, s); break; 

            case 77 : s = $17(l, e, s); break; 

            case 76 : 

                s = $21(l, e, s);

                if ( e.p<0 ) s = $22(l, e, s);

                break;
             

            case 75 : s = $47(l, e, s); break; 

            case 73 : 

                s = $19(l, e, s);

                if ( e.p<0 ) s = $20(l, e, s);

                break;
             

            case 72 : s = $16(l, e, s); break; 

            case 31 : s = $49(l, e, s); break; 

            case 23 : s = $51(l, e, s); break; 

            case 17 : s = $50(l, e, s); break; 

            case 14 : s = $6(l, e, s); break; 

            case 9 : s = $13(l, e, s); break; 

            case 6 : s = $12(l, e, s); break; 

            case 5 : 

                s = $14(l, e, s);

                if ( e.p<0 ) s = $15(l, e, s);

                break;
             

            case 3 : s = $4(l, e, s); break; 

            case 2 : s = $11(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![3,2,6,5,72,77,91,81,80,79,104,105,73,82,83,84,88,86,76,75,92,9,31,14,17,23].includes(a) ) fail(l, e);else e.p = 3;

    return s[s.length-1];
}
function $STYLE_SHEET(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    
    if ( l.END ) {

        e.sp -= 0;

        var sym= s.slice(-0);

        s.splice(
            -0,
            0,
            { type:"Stylesheet", imports:null, nodes:null, pos }
        );

        return (e.p = 4, s);
    }else switch(l.tx){

        case "#" : 

            s.push($ID_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:83;

            break;
         

        case "$" : s = $34(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "*" : 

            var cp= l.copy(),_sym= null;

            _sym = $26(cp, e, _s(s.slice(), cp, e, e.eh, _0));

            if ( e.p!==91 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s = $27(l, e, _s(s, l, e, e.eh, _0));

            break;
         

        case "-" : s = $36(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "." : 

            s.push($CLASS_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:84;

            break;
         

        case ":" : 

            var cp= l.copy(),_sym= null;

            _sym = s.slice();

            _sym.push($PSEUDO_CLASS_SELECTOR(cp, e));

            e.p = (e.FAILED)?-1:86;

            if ( e.p!==86 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s.push($PSEUDO_ELEMENT_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:92;

            break;
         

        case "@" : 

            var cp= l.copy(),_sym= null;

            _sym = s.slice();

            _sym.push($supports(cp, e));

            e.p = (e.FAILED)?-1:23;

            if ( e.p!==23 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            cp = l.copy();

            _sym = s.slice();

            _sym.push($import(cp, e));

            e.p = (e.FAILED)?-1:14;

            if ( e.p!==14 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            cp = l.copy();

            _sym = s.slice();

            _sym.push($media(cp, e));

            e.p = (e.FAILED)?-1:31;

            if ( e.p!==31 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s.push($keyframes(l, e));

            e.p = (e.FAILED)?-1:17;

            break;
         

        case "[" : 

            s.push($ATTRIBUTE_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:88;

            break;
         

        case "|" : s = $31(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "+" :  

        case "," :  

        case ">" :  

        case "{" :  

        case "||" :  

        case "~" : 

            e.sp -= 0;

            var sym= s.slice(-0);

            s.splice(
                -0,
                0,
                (null&&!(null||null))?null:(null&&null.length==1&&!(null||null))?null[0]:{ type:"CompoundSelector", nodes:[], pos }
            );

            return (e.p = 77, s);
         

        default : 

            switch(l.ty){

                case 2 : s = $35(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 8 : 

                    e.sp -= 0;

                    var sym= s.slice(-0);

                    s.splice(
                        -0,
                        0,
                        (null&&!(null||null))?null:(null&&null.length==1&&!(null||null))?null[0]:{ type:"CompoundSelector", nodes:[], pos }
                    );

                    return (e.p = 77, s);
                
            }
        
    }

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : 

                s = $28(l, e, s);

                if ( e.p<0 ) s = $29(l, e, s);

                break;
             

            case 92 : s = $48(l, e, s); break; 

            case 91 : s = $18(l, e, s); break; 

            case 88 : s = $40(l, e, s); break; 

            case 86 : s = $41(l, e, s); break; 

            case 84 : s = $39(l, e, s); break; 

            case 83 : s = $38(l, e, s); break; 

            case 82 : s = $37(l, e, s); break; 

            case 81 : s = $23(l, e, s); break; 

            case 80 : 

                s = $24(l, e, s);

                if ( e.p<0 ) s = $25(l, e, s);

                break;
             

            case 79 : s = $30(l, e, s); break; 

            case 77 : s = $17(l, e, s); break; 

            case 76 : 

                s = $21(l, e, s);

                if ( e.p<0 ) s = $22(l, e, s);

                break;
             

            case 75 : s = $47(l, e, s); break; 

            case 73 : 

                s = $19(l, e, s);

                if ( e.p<0 ) s = $20(l, e, s);

                break;
             

            case 72 : s = $16(l, e, s); break; 

            case 31 : s = $49(l, e, s); break; 

            case 23 : s = $51(l, e, s); break; 

            case 17 : s = $50(l, e, s); break; 

            case 14 : 

                s = $5(l, e, s);

                if ( e.p<0 ) s = $6(l, e, s);

                break;
             

            case 9 : s = $13(l, e, s); break; 

            case 6 : s = $12(l, e, s); break; 

            case 5 : 

                s = $14(l, e, s);

                if ( e.p<0 ) s = $15(l, e, s);

                break;
             

            case 3 : 

                s = $3(l, e, s);

                if ( e.p<0 ) s = $4(l, e, s);

                break;
             

            case 2 : s = $11(l, e, s); break; 

            case 1 : 

                s = $1(l, e, s);

                if ( e.p<0 ) s = $2(l, e, s);

                break;
             

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![4,1,14,3,2,6,5,72,77,91,81,80,79,104,105,73,82,83,84,88,86,76,75,92,9,31,17,23].includes(a) ) fail(l, e);else e.p = 4;

    return s[s.length-1];
}
function $STYLE_RULE_HC_listbody2_103(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_3(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : 

                s = $28(l, e, s);

                if ( e.p<0 ) s = $29(l, e, s);

                break;
             

            case 92 : s = $48(l, e, s); break; 

            case 91 : s = $18(l, e, s); break; 

            case 88 : s = $40(l, e, s); break; 

            case 86 : s = $41(l, e, s); break; 

            case 84 : s = $39(l, e, s); break; 

            case 83 : s = $38(l, e, s); break; 

            case 82 : s = $37(l, e, s); break; 

            case 81 : s = $23(l, e, s); break; 

            case 80 : 

                s = $24(l, e, s);

                if ( e.p<0 ) s = $25(l, e, s);

                break;
             

            case 79 : s = $30(l, e, s); break; 

            case 77 : s = $17(l, e, s); break; 

            case 76 : 

                s = $21(l, e, s);

                if ( e.p<0 ) s = $22(l, e, s);

                break;
             

            case 75 : s = $47(l, e, s); break; 

            case 73 : 

                s = $19(l, e, s);

                if ( e.p<0 ) s = $20(l, e, s);

                break;
             

            case 72 : s = $16(l, e, s); break; 

            case 5 : s = $15(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![5,72,77,91,81,80,79,104,105,73,82,83,84,88,86,76,75,92].includes(a) ) fail(l, e);else e.p = 5;

    return s[s.length-1];
}
function $STYLE_RULE(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_3(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : 

                s = $28(l, e, s);

                if ( e.p<0 ) s = $29(l, e, s);

                break;
             

            case 92 : s = $48(l, e, s); break; 

            case 91 : s = $18(l, e, s); break; 

            case 88 : s = $40(l, e, s); break; 

            case 86 : s = $41(l, e, s); break; 

            case 84 : s = $39(l, e, s); break; 

            case 83 : s = $38(l, e, s); break; 

            case 82 : s = $37(l, e, s); break; 

            case 81 : s = $23(l, e, s); break; 

            case 80 : 

                s = $24(l, e, s);

                if ( e.p<0 ) s = $25(l, e, s);

                break;
             

            case 79 : s = $30(l, e, s); break; 

            case 77 : s = $17(l, e, s); break; 

            case 76 : 

                s = $21(l, e, s);

                if ( e.p<0 ) s = $22(l, e, s);

                break;
             

            case 75 : s = $47(l, e, s); break; 

            case 73 : 

                s = $19(l, e, s);

                if ( e.p<0 ) s = $20(l, e, s);

                break;
             

            case 72 : s = $16(l, e, s); break; 

            case 5 : 

                s = $14(l, e, s);

                if ( e.p<0 ) s = $15(l, e, s);

                break;
             

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![6,5,72,77,91,81,80,79,104,105,73,82,83,84,88,86,76,75,92].includes(a) ) fail(l, e);else e.p = 6;

    return s[s.length-1];
}
function $GROUP_RULE_BODY_HC_listbody5_104(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_3(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : 

                s = $28(l, e, s);

                if ( e.p<0 ) s = $29(l, e, s);

                break;
             

            case 92 : s = $48(l, e, s); break; 

            case 91 : s = $18(l, e, s); break; 

            case 88 : s = $40(l, e, s); break; 

            case 86 : s = $41(l, e, s); break; 

            case 84 : s = $39(l, e, s); break; 

            case 83 : s = $38(l, e, s); break; 

            case 82 : s = $37(l, e, s); break; 

            case 81 : s = $23(l, e, s); break; 

            case 80 : 

                s = $24(l, e, s);

                if ( e.p<0 ) s = $25(l, e, s);

                break;
             

            case 79 : s = $30(l, e, s); break; 

            case 77 : s = $17(l, e, s); break; 

            case 76 : 

                s = $21(l, e, s);

                if ( e.p<0 ) s = $22(l, e, s);

                break;
             

            case 75 : s = $47(l, e, s); break; 

            case 73 : 

                s = $19(l, e, s);

                if ( e.p<0 ) s = $20(l, e, s);

                break;
             

            case 72 : s = $16(l, e, s); break; 

            case 7 : s = $389(l, e, s); break; 

            case 6 : s = $390(l, e, s); break; 

            case 5 : 

                s = $14(l, e, s);

                if ( e.p<0 ) s = $15(l, e, s);

                break;
             

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![7,6,5,72,77,91,81,80,79,104,105,73,82,83,84,88,86,76,75,92].includes(a) ) fail(l, e);else e.p = 7;

    return s[s.length-1];
}
function $GROUP_RULE_BODY(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_3(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : 

                s = $28(l, e, s);

                if ( e.p<0 ) s = $29(l, e, s);

                break;
             

            case 92 : s = $48(l, e, s); break; 

            case 91 : s = $18(l, e, s); break; 

            case 88 : s = $40(l, e, s); break; 

            case 86 : s = $41(l, e, s); break; 

            case 84 : s = $39(l, e, s); break; 

            case 83 : s = $38(l, e, s); break; 

            case 82 : s = $37(l, e, s); break; 

            case 81 : s = $23(l, e, s); break; 

            case 80 : 

                s = $24(l, e, s);

                if ( e.p<0 ) s = $25(l, e, s);

                break;
             

            case 79 : s = $30(l, e, s); break; 

            case 77 : s = $17(l, e, s); break; 

            case 76 : 

                s = $21(l, e, s);

                if ( e.p<0 ) s = $22(l, e, s);

                break;
             

            case 75 : s = $47(l, e, s); break; 

            case 73 : 

                s = $19(l, e, s);

                if ( e.p<0 ) s = $20(l, e, s);

                break;
             

            case 72 : s = $16(l, e, s); break; 

            case 8 : s = $261(l, e, s); break; 

            case 6 : s = $263(l, e, s); break; 

            case 5 : 

                s = $14(l, e, s);

                if ( e.p<0 ) s = $15(l, e, s);

                break;
             

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![8,6,5,72,77,91,81,80,79,104,105,73,82,83,84,88,86,76,75,92].includes(a) ) fail(l, e);else e.p = 8;

    return s[s.length-1];
}
function $AT_RULE(l, e, s= []){e.p = -1; return s[s.length-1];}
function $import_group_014_106(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_4(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 106 : s = $153(l, e, s); break; 

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                if ( e.p<0 ) s = $154(l, e, s);

                break;
             

            case 104 : s = $125(l, e, s); break; 

            case 100 : s = $343(l, e, s); break; 

            case 52 : s = $138(l, e, s); break; 

            case 30 : s = $139(l, e, s); break; 

            case 29 : s = $140(l, e, s); break; 

            case 28 : s = $137(l, e, s); break; 

            case 27 : s = $134(l, e, s); break; 

            case 26 : s = $341(l, e, s); break; 

            case 15 : s = $342(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![11,26,27,28,30,29,52,104,105,15,100,106].includes(a) ) fail(l, e);else e.p = 11;

    return s[s.length-1];
}
function $import_HC_listbody5_108(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_5(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : 

                s = $125(l, e, s);

                if ( e.p<0 ) s = $126(l, e, s);

                break;
             

            case 61 : s = $111(l, e, s); break; 

            case 52 : s = $124(l, e, s); break; 

            case 49 : s = $123(l, e, s); break; 

            case 47 : 

                s = $116(l, e, s);

                if ( e.p<0 ) s = $117(l, e, s);

                if ( e.p<0 ) s = $118(l, e, s);

                break;
             

            case 46 : s = $113(l, e, s); break; 

            case 43 : s = $115(l, e, s); break; 

            case 40 : s = $114(l, e, s); break; 

            case 39 : s = $112(l, e, s); break; 

            case 38 : s = $109(l, e, s); break; 

            case 37 : s = $173(l, e, s); break; 

            case 35 : s = $110(l, e, s); break; 

            case 13 : s = $171(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![13,37,38,39,40,43,47,49,52,104,105,46,35,61].includes(a) ) fail(l, e);else e.p = 13;

    return s[s.length-1];
}
function $keyframes_HC_listbody5_109(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_6(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 63 : s = $303(l, e, s); break; 

            case 21 : s = $300(l, e, s); break; 

            case 20 : s = $297(l, e, s); break; 

            case 19 : 

                s = $298(l, e, s);

                if ( e.p<0 ) s = $299(l, e, s);

                break;
             

            case 16 : s = $296(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![16,20,19,21,63].includes(a) ) fail(l, e);else e.p = 16;

    return s[s.length-1];
}
function $keyframes_blocks_HC_listbody1_110(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_6(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 63 : s = $303(l, e, s); break; 

            case 21 : s = $300(l, e, s); break; 

            case 19 : s = $299(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![19,21,63].includes(a) ) fail(l, e);else e.p = 19;

    return s[s.length-1];
}
function $supports_condition_HC_listbody2_113(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_7(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 25 : s = $217(l, e, s); break; 

            case 24 : s = $218(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![25,24].includes(a) ) fail(l, e);else e.p = 25;

    return s[s.length-1];
}
function $supports_in_parens(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_8(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : s = $125(l, e, s); break; 

            case 52 : s = $138(l, e, s); break; 

            case 30 : s = $139(l, e, s); break; 

            case 29 : s = $140(l, e, s); break; 

            case 28 : s = $137(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![27,28,30,29,52,104,105].includes(a) ) fail(l, e);else e.p = 27;

    return s[s.length-1];
}
function $media_queries_HC_listbody7_114(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_5(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : 

                s = $125(l, e, s);

                if ( e.p<0 ) s = $126(l, e, s);

                break;
             

            case 61 : s = $111(l, e, s); break; 

            case 52 : s = $124(l, e, s); break; 

            case 49 : s = $123(l, e, s); break; 

            case 47 : 

                s = $116(l, e, s);

                if ( e.p<0 ) s = $117(l, e, s);

                if ( e.p<0 ) s = $118(l, e, s);

                break;
             

            case 46 : s = $113(l, e, s); break; 

            case 43 : s = $115(l, e, s); break; 

            case 40 : s = $114(l, e, s); break; 

            case 39 : s = $112(l, e, s); break; 

            case 38 : s = $109(l, e, s); break; 

            case 37 : s = $393(l, e, s); break; 

            case 35 : s = $110(l, e, s); break; 

            case 32 : s = $392(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![32,37,38,39,40,43,47,49,52,104,105,46,35,61].includes(a) ) fail(l, e);else e.p = 32;

    return s[s.length-1];
}
function $media_queries_group_039_115(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_5(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : 

                s = $125(l, e, s);

                if ( e.p<0 ) s = $126(l, e, s);

                break;
             

            case 61 : s = $111(l, e, s); break; 

            case 52 : s = $124(l, e, s); break; 

            case 49 : s = $123(l, e, s); break; 

            case 47 : 

                s = $116(l, e, s);

                if ( e.p<0 ) s = $117(l, e, s);

                if ( e.p<0 ) s = $118(l, e, s);

                break;
             

            case 46 : s = $113(l, e, s); break; 

            case 43 : s = $115(l, e, s); break; 

            case 40 : s = $114(l, e, s); break; 

            case 39 : s = $112(l, e, s); break; 

            case 38 : s = $109(l, e, s); break; 

            case 37 : s = $108(l, e, s); break; 

            case 35 : s = $110(l, e, s); break; 

            case 33 : s = $107(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![33,37,38,39,40,43,47,49,52,104,105,46,35,61].includes(a) ) fail(l, e);else e.p = 33;

    return s[s.length-1];
}
function $media_query(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_5(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : 

                s = $125(l, e, s);

                if ( e.p<0 ) s = $126(l, e, s);

                break;
             

            case 61 : s = $111(l, e, s); break; 

            case 52 : s = $124(l, e, s); break; 

            case 49 : s = $123(l, e, s); break; 

            case 47 : 

                s = $116(l, e, s);

                if ( e.p<0 ) s = $117(l, e, s);

                if ( e.p<0 ) s = $118(l, e, s);

                break;
             

            case 46 : s = $113(l, e, s); break; 

            case 43 : s = $115(l, e, s); break; 

            case 40 : s = $114(l, e, s); break; 

            case 39 : s = $112(l, e, s); break; 

            case 38 : s = $109(l, e, s); break; 

            case 35 : s = $110(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![37,38,39,40,43,47,49,52,104,105,46,35,61].includes(a) ) fail(l, e);else e.p = 37;

    return s[s.length-1];
}
function $media_condition(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_9(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : s = $125(l, e, s); break; 

            case 52 : s = $124(l, e, s); break; 

            case 49 : s = $123(l, e, s); break; 

            case 47 : 

                s = $116(l, e, s);

                if ( e.p<0 ) s = $117(l, e, s);

                if ( e.p<0 ) s = $118(l, e, s);

                break;
             

            case 46 : s = $113(l, e, s); break; 

            case 43 : s = $115(l, e, s); break; 

            case 40 : s = $114(l, e, s); break; 

            case 39 : s = $112(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![38,39,40,43,47,49,52,104,105,46].includes(a) ) fail(l, e);else e.p = 38;

    return s[s.length-1];
}
function $media_condition_without_or(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_9(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : s = $125(l, e, s); break; 

            case 52 : s = $124(l, e, s); break; 

            case 49 : s = $123(l, e, s); break; 

            case 47 : 

                s = $116(l, e, s);

                if ( e.p<0 ) s = $117(l, e, s);

                break;
             

            case 43 : s = $115(l, e, s); break; 

            case 40 : s = $114(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![39,40,43,47,49,52,104,105].includes(a) ) fail(l, e);else e.p = 39;

    return s[s.length-1];
}
function $media_and_HC_listbody2_119(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_10(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 42 : s = $187(l, e, s); break; 

            case 41 : s = $188(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![42,41].includes(a) ) fail(l, e);else e.p = 42;

    return s[s.length-1];
}
function $media_or_HC_listbody2_121(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_11(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 45 : s = $191(l, e, s); break; 

            case 44 : s = $192(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![45,44].includes(a) ) fail(l, e);else e.p = 45;

    return s[s.length-1];
}
function $media_in_parenths(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_12(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : s = $125(l, e, s); break; 

            case 52 : s = $124(l, e, s); break; 

            case 49 : s = $123(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![47,49,52,104,105].includes(a) ) fail(l, e);else e.p = 47;

    return s[s.length-1];
}
function $media_feature_group_061_122(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_13(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : s = $203(l, e, s); break; 

            case 64 : s = $210(l, e, s); break; 

            case 62 : s = $211(l, e, s); break; 

            case 60 : 

                s = $200(l, e, s);

                if ( e.p<0 ) s = $201(l, e, s);

                if ( e.p<0 ) s = $202(l, e, s);

                break;
             

            case 59 : s = $198(l, e, s); break; 

            case 58 : s = $206(l, e, s); break; 

            case 57 : s = $199(l, e, s); break; 

            case 53 : s = $197(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![48,53,60,104,105,59,57,58,64,62].includes(a) ) fail(l, e);else e.p = 48;

    return s[s.length-1];
}
function $general_enclosed_HC_listbody1_124(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_14(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 51 : s = $290(l, e, s); break; 

            case 50 : s = $292(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![51,50].includes(a) ) fail(l, e);else e.p = 51;

    return s[s.length-1];
}
function $mf_range(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_15(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : s = $203(l, e, s); break; 

            case 64 : s = $210(l, e, s); break; 

            case 62 : s = $211(l, e, s); break; 

            case 60 : 

                s = $201(l, e, s);

                if ( e.p<0 ) s = $202(l, e, s);

                break;
             

            case 58 : s = $206(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![57,60,104,105,58,64,62].includes(a) ) fail(l, e);else e.p = 57;

    return s[s.length-1];
}
function $mf_value(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_15(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : s = $203(l, e, s); break; 

            case 64 : s = $210(l, e, s); break; 

            case 62 : s = $211(l, e, s); break; 

            case 60 : s = $202(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![58,64,60,104,105,62].includes(a) ) fail(l, e);else e.p = 58;

    return s[s.length-1];
}
function $string_HC_listbody1_128(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_16(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 66 : s = $175(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![66].includes(a) ) fail(l, e);else e.p = 66;

    return s[s.length-1];
}
function $string_HC_listbody1_129(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_17(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 67 : s = $178(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![67].includes(a) ) fail(l, e);else e.p = 67;

    return s[s.length-1];
}
function $COMPLEX_SELECTOR_HC_listbody2_132(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    
    switch(l.tx){

        case "#" : 

            s.push($ID_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:83;

            break;
         

        case "$" : s = $34(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "*" : 

            var cp= l.copy(),_sym= null;

            _sym = $26(cp, e, _s(s.slice(), cp, e, e.eh, _0));

            if ( e.p!==91 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s = $27(l, e, _s(s, l, e, e.eh, _0));

            break;
         

        case "+" : s = $69(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "-" : s = $36(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "." : 

            s.push($CLASS_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:84;

            break;
         

        case ":" : 

            var cp= l.copy(),_sym= null;

            _sym = s.slice();

            _sym.push($PSEUDO_CLASS_SELECTOR(cp, e));

            e.p = (e.FAILED)?-1:86;

            if ( e.p!==86 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s.push($PSEUDO_ELEMENT_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:92;

            break;
         

        case ">" : s = $68(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "[" : 

            s.push($ATTRIBUTE_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:88;

            break;
         

        case "|" : s = $31(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "||" : s = $71(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "~" : s = $70(l, e, _s(s, l, e, e.eh, _0)); break; 

        case ")" :  

        case "," :  

        case "{" : 

            e.sp -= 0;

            var sym= s.slice(-0);

            s.splice(
                -0,
                0,
                (null&&!(null||null))?null:(null&&null.length==1&&!(null||null))?null[0]:{ type:"CompoundSelector", nodes:[], pos }
            );

            return (e.p = 77, s);
         

        default : 

            switch(l.ty){

                case 2 : s = $35(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 8 : 

                    e.sp -= 0;

                    var sym= s.slice(-0);

                    s.splice(
                        -0,
                        0,
                        (null&&!(null||null))?null:(null&&null.length==1&&!(null||null))?null[0]:{ type:"CompoundSelector", nodes:[], pos }
                    );

                    return (e.p = 77, s);
                
            }
        
    }

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : 

                s = $28(l, e, s);

                if ( e.p<0 ) s = $29(l, e, s);

                break;
             

            case 92 : s = $48(l, e, s); break; 

            case 91 : s = $18(l, e, s); break; 

            case 88 : s = $40(l, e, s); break; 

            case 86 : s = $41(l, e, s); break; 

            case 84 : s = $39(l, e, s); break; 

            case 83 : s = $38(l, e, s); break; 

            case 82 : s = $37(l, e, s); break; 

            case 81 : s = $23(l, e, s); break; 

            case 80 : 

                s = $24(l, e, s);

                if ( e.p<0 ) s = $25(l, e, s);

                break;
             

            case 79 : s = $30(l, e, s); break; 

            case 78 : s = $67(l, e, s); break; 

            case 77 : s = $66(l, e, s); break; 

            case 76 : 

                s = $21(l, e, s);

                if ( e.p<0 ) s = $22(l, e, s);

                break;
             

            case 75 : s = $47(l, e, s); break; 

            case 73 : 

                s = $19(l, e, s);

                if ( e.p<0 ) s = $20(l, e, s);

                break;
             

            case 71 : s = $63(l, e, s); break; 

            case 70 : s = $64(l, e, s); break; 

            case 69 : s = $65(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![71,70,69,78,77,91,81,80,79,104,105,73,82,83,84,88,86,76,75,92].includes(a) ) fail(l, e);else e.p = 71;

    return s[s.length-1];
}
function $COMPOUND_SELECTOR_HC_listbody2_133(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_19(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 88 : s = $40(l, e, s); break; 

            case 86 : s = $41(l, e, s); break; 

            case 84 : s = $39(l, e, s); break; 

            case 83 : s = $38(l, e, s); break; 

            case 82 : s = $37(l, e, s); break; 

            case 73 : s = $20(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![73,82,83,84,88,86].includes(a) ) fail(l, e);else e.p = 73;

    return s[s.length-1];
}
function $COMPOUND_SELECTOR_HC_listbody1_134(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_20(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 86 : s = $95(l, e, s); break; 

            case 74 : s = $94(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![74,86].includes(a) ) fail(l, e);else e.p = 74;

    return s[s.length-1];
}
function $COMPOUND_SELECTOR_HC_listbody2_136(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_21(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 92 : s = $48(l, e, s); break; 

            case 76 : s = $22(l, e, s); break; 

            case 75 : s = $47(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![76,75,92].includes(a) ) fail(l, e);else e.p = 76;

    return s[s.length-1];
}
function $COMPOUND_SELECTOR(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    
    switch(l.tx){

        case "#" : 

            s.push($ID_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:83;

            break;
         

        case "$" : s = $34(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "*" : 

            var cp= l.copy(),_sym= null;

            _sym = $26(cp, e, _s(s.slice(), cp, e, e.eh, _0));

            if ( e.p!==91 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s = $27(l, e, _s(s, l, e, e.eh, _0));

            break;
         

        case "-" : s = $36(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "." : 

            s.push($CLASS_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:84;

            break;
         

        case ":" : 

            var cp= l.copy(),_sym= null;

            _sym = s.slice();

            _sym.push($PSEUDO_CLASS_SELECTOR(cp, e));

            e.p = (e.FAILED)?-1:86;

            if ( e.p!==86 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s.push($PSEUDO_ELEMENT_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:92;

            break;
         

        case "[" : 

            s.push($ATTRIBUTE_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:88;

            break;
         

        case "|" : s = $31(l, e, _s(s, l, e, e.eh, _0)); break; 

        case ")" :  

        case "+" :  

        case "," :  

        case ">" :  

        case "{" :  

        case "||" :  

        case "~" : 

            e.sp -= 0;

            var sym= s.slice(-0);

            s.splice(
                -0,
                0,
                (null&&!(null||null))?null:(null&&null.length==1&&!(null||null))?null[0]:{ type:"CompoundSelector", nodes:[], pos }
            );

            return (e.p = 77, s);
         

        default : 

            switch(l.ty){

                case 2 : s = $35(l, e, _s(s, l, e, e.eh, _0)); break;
            }
        
    }

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : 

                s = $28(l, e, s);

                if ( e.p<0 ) s = $29(l, e, s);

                break;
             

            case 92 : s = $48(l, e, s); break; 

            case 91 : s = $18(l, e, s); break; 

            case 88 : s = $40(l, e, s); break; 

            case 86 : s = $41(l, e, s); break; 

            case 84 : s = $39(l, e, s); break; 

            case 83 : s = $38(l, e, s); break; 

            case 82 : s = $37(l, e, s); break; 

            case 81 : s = $23(l, e, s); break; 

            case 80 : 

                s = $24(l, e, s);

                if ( e.p<0 ) s = $25(l, e, s);

                break;
             

            case 79 : s = $30(l, e, s); break; 

            case 76 : 

                s = $21(l, e, s);

                if ( e.p<0 ) s = $22(l, e, s);

                break;
             

            case 75 : s = $47(l, e, s); break; 

            case 73 : 

                s = $19(l, e, s);

                if ( e.p<0 ) s = $20(l, e, s);

                break;
             

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![77,91,81,80,79,104,105,73,82,83,84,88,86,76,75,92].includes(a) ) fail(l, e);else e.p = 77;

    return s[s.length-1];
}
function $WQ_NAME(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_23(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : 

                s = $28(l, e, s);

                if ( e.p<0 ) s = $29(l, e, s);

                break;
             

            case 80 : s = $25(l, e, s); break; 

            case 79 : s = $30(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![81,80,79,104,105].includes(a) ) fail(l, e);else e.p = 81;

    return s[s.length-1];
}
function $TYPE_SELECTOR(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    
    switch(l.tx){

        case "$" : s = $34(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "*" : 

            var cp= l.copy(),_sym= null;

            _sym = $26(cp, e, _s(s.slice(), cp, e, e.eh, _0));

            if ( e.p!==91 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s = $27(l, e, _s(s, l, e, e.eh, _0));

            break;
         

        case "-" : s = $36(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "|" : s = $31(l, e, _s(s, l, e, e.eh, _0)); break; 

        default : 

            switch(l.ty){

                case 2 : s = $35(l, e, _s(s, l, e, e.eh, _0)); break;
            }
        
    }

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : 

                s = $28(l, e, s);

                if ( e.p<0 ) s = $29(l, e, s);

                break;
             

            case 81 : s = $23(l, e, s); break; 

            case 80 : 

                s = $24(l, e, s);

                if ( e.p<0 ) s = $25(l, e, s);

                break;
             

            case 79 : s = $30(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![91,81,80,79,104,105].includes(a) ) fail(l, e);else e.p = 91;

    return s[s.length-1];
}
function $declaration_list_HC_listbody3_140(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    
    if ( _6.includes(l.tx) ) {s = $144(l, e, _s(s, l, e, e.eh, _0));}

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 93 : s = $150(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![93].includes(a) ) fail(l, e);else e.p = 93;

    return s[s.length-1];
}
function $declaration_list_HC_listbody2_142(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_26(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 106 : s = $153(l, e, s); break; 

            case 105 : 

                s = $154(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 100 : s = $152(l, e, s); break; 

            case 98 : s = $151(l, e, s); break; 

            case 95 : s = $147(l, e, s); break; 

            case 94 : s = $148(l, e, s); break; 

            case 93 : 

                s = $149(l, e, s);

                if ( e.p<0 ) s = $150(l, e, s);

                break;
             

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![95,94,93,98,100,106,105].includes(a) ) fail(l, e);else e.p = 95;

    return s[s.length-1];
}
function $declaration_list_HC_listbody1_143(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    
    if ( _6.includes(l.tx) ) {s = $229(l, e, _s(s, l, e, e.eh, _0));}

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 96 : s = $228(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![96].includes(a) ) fail(l, e);else e.p = 96;

    return s[s.length-1];
}
function $declaration_values_group_0145_145(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_28(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 109 : 

                s = $318(l, e, s);

                if ( e.p<0 ) s = $319(l, e, s);

                break;
             

            case 107 : s = $320(l, e, s); break; 

            case 103 : 

                s = $381(l, e, s);

                if ( e.p<0 ) s = $317(l, e, s);

                break;
             

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![101,103,109,107].includes(a) ) fail(l, e);else e.p = 101;

    return s[s.length-1];
}
function $declaration_values_HC_listbody1_146(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_28(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 109 : 

                s = $318(l, e, s);

                if ( e.p<0 ) s = $319(l, e, s);

                break;
             

            case 107 : s = $320(l, e, s); break; 

            case 103 : 

                s = $381(l, e, s);

                if ( e.p<0 ) s = $317(l, e, s);

                break;
             

            case 102 : s = $378(l, e, s); break; 

            case 101 : s = $379(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![102,101,103,109,107].includes(a) ) fail(l, e);else e.p = 102;

    return s[s.length-1];
}
function $declaration_values(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_29(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 109 : 

                s = $318(l, e, s);

                if ( e.p<0 ) s = $319(l, e, s);

                break;
             

            case 107 : s = $320(l, e, s); break; 

            case 103 : s = $317(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![103,109,107].includes(a) ) fail(l, e);else e.p = 103;

    return s[s.length-1];
}
function $css_id_symbols(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_30(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : s = $33(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![105].includes(a) ) fail(l, e);else e.p = 105;

    return s[s.length-1];
}
function $string_value_group_1171_147(l, e, s= []){

    e.p = -1;

    
    switch(l.tx){

        case "-" : return $321(l, e, _s(s, l, e, e.eh, _0)); 

        case "'\'" : return $330(l, e, _s(s, l, e, e.eh, _0)); 

        case "_" : return $322(l, e, _s(s, l, e, e.eh, _0)); 

        case "true" : return $323(l, e, _s(s, l, e, e.eh, _0)); 

        default : 

            switch(l.ty){

                case 32 : return $328(l, e, _s(s, l, e, e.eh, _0)); 

                case 2 : return $325(l, e, _s(s, l, e, e.eh, _0)); 

                case 1 : return $324(l, e, _s(s, l, e, e.eh, _0)); 

                case 16 : return $327(l, e, _s(s, l, e, e.eh, _0)); 

                case 64 : return $329(l, e, _s(s, l, e, e.eh, _0)); 

                case 128 : return $326(l, e, _s(s, l, e, e.eh, _0));
            }
        
    }

    return s[s.length-1];
}
function $string_value_HC_listbody2_148(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_29(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 108 : s = $396(l, e, s); break; 

            case 107 : s = $397(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![108,107].includes(a) ) fail(l, e);else e.p = 108;

    return s[s.length-1];
}
function $string_value(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_29(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 109 : s = $319(l, e, s); break; 

            case 107 : s = $320(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![109,107].includes(a) ) fail(l, e);else e.p = 109;

    return s[s.length-1];
}
function $def$defaultproductions_HC_listbody1_100(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_32(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 133 : 

                s = $426(l, e, s);

                if ( e.p<0 ) s = $427(l, e, s);

                break;
             

            case 132 : s = $407(l, e, s); break; 

            case 131 : 

                s = $420(l, e, s);

                if ( e.p<0 ) s = $421(l, e, s);

                break;
             

            case 130 : s = $406(l, e, s); break; 

            case 122 : s = $401(l, e, s); break; 

            case 121 : s = $418(l, e, s); break; 

            case 120 : s = $417(l, e, s); break; 

            case 119 : s = $415(l, e, s); break; 

            case 118 : s = $405(l, e, s); break; 

            case 117 : s = $404(l, e, s); break; 

            case 116 : s = $403(l, e, s); break; 

            case 115 : s = $402(l, e, s); break; 

            case 113 : s = $400(l, e, s); break; 

            case 111 : s = $399(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![111,113,122,115,116,117,118,119,120,121,130,131,132,133].includes(a) ) fail(l, e);else e.p = 111;

    return s[s.length-1];
}
function $def$defaultproductions(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_32(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 133 : 

                s = $426(l, e, s);

                if ( e.p<0 ) s = $427(l, e, s);

                break;
             

            case 132 : s = $407(l, e, s); break; 

            case 131 : 

                s = $420(l, e, s);

                if ( e.p<0 ) s = $421(l, e, s);

                break;
             

            case 130 : s = $406(l, e, s); break; 

            case 122 : s = $401(l, e, s); break; 

            case 121 : s = $418(l, e, s); break; 

            case 120 : s = $417(l, e, s); break; 

            case 119 : s = $415(l, e, s); break; 

            case 118 : s = $405(l, e, s); break; 

            case 117 : s = $404(l, e, s); break; 

            case 116 : s = $403(l, e, s); break; 

            case 115 : s = $402(l, e, s); break; 

            case 113 : s = $447(l, e, s); break; 

            case 112 : s = $446(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![112,113,122,115,116,117,118,119,120,121,130,131,132,133].includes(a) ) fail(l, e);else e.p = 112;

    return s[s.length-1];
}
function $def$defaultproduction(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_32(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 133 : 

                s = $426(l, e, s);

                if ( e.p<0 ) s = $427(l, e, s);

                break;
             

            case 132 : s = $407(l, e, s); break; 

            case 131 : 

                s = $420(l, e, s);

                if ( e.p<0 ) s = $421(l, e, s);

                break;
             

            case 130 : s = $406(l, e, s); break; 

            case 122 : s = $401(l, e, s); break; 

            case 121 : s = $418(l, e, s); break; 

            case 120 : s = $417(l, e, s); break; 

            case 119 : s = $415(l, e, s); break; 

            case 118 : s = $405(l, e, s); break; 

            case 117 : s = $404(l, e, s); break; 

            case 116 : s = $403(l, e, s); break; 

            case 115 : s = $402(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![113,122,115,116,117,118,119,120,121,130,131,132,133].includes(a) ) fail(l, e);else e.p = 113;

    return s[s.length-1];
}
function $def$string_group_034_101(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_33(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 129 : s = $449(l, e, s); break; 

            case 128 : 

                s = $239(l, e, s);

                if ( e.p<0 ) s = $240(l, e, s);

                break;
             

            case 127 : s = $241(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![123,129,128,127].includes(a) ) fail(l, e);else e.p = 123;

    return s[s.length-1];
}
function $def$string_HC_listbody1_102(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_33(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 129 : s = $449(l, e, s); break; 

            case 128 : 

                s = $239(l, e, s);

                if ( e.p<0 ) s = $240(l, e, s);

                break;
             

            case 127 : s = $241(l, e, s); break; 

            case 124 : s = $451(l, e, s); break; 

            case 123 : s = $452(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![124,123,129,128,127].includes(a) ) fail(l, e);else e.p = 124;

    return s[s.length-1];
}
function $def$string_HC_listbody1_103(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_33(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 129 : s = $449(l, e, s); break; 

            case 128 : 

                s = $239(l, e, s);

                if ( e.p<0 ) s = $240(l, e, s);

                break;
             

            case 127 : s = $241(l, e, s); break; 

            case 125 : s = $454(l, e, s); break; 

            case 123 : s = $455(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![125,123,129,128,127].includes(a) ) fail(l, e);else e.p = 125;

    return s[s.length-1];
}
function $def$string_value_group_149_104(l, e, s= []){

    e.p = -1;

    
    switch(l.tx){

        case "-" : return $244(l, e, _s(s, l, e, e.eh, _0)); 

        case "/" : return $242(l, e, _s(s, l, e, e.eh, _0)); 

        case "'\'" : return $243(l, e, _s(s, l, e, e.eh, _0)); 

        case "_" : return $245(l, e, _s(s, l, e, e.eh, _0)); 

        case "true" : return $246(l, e, _s(s, l, e, e.eh, _0)); 

        default : 

            switch(l.ty){

                case 32 : return $248(l, e, _s(s, l, e, e.eh, _0)); 

                case 2 : return $250(l, e, _s(s, l, e, e.eh, _0)); 

                case 1 : return $249(l, e, _s(s, l, e, e.eh, _0)); 

                case 16 : return $247(l, e, _s(s, l, e, e.eh, _0)); 

                case 128 : return $251(l, e, _s(s, l, e, e.eh, _0));
            }
        
    }

    return s[s.length-1];
}
function $def$string_value_HC_listbody2_105(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_35(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 128 : s = $240(l, e, s); break; 

            case 127 : s = $241(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![128,127].includes(a) ) fail(l, e);else e.p = 128;

    return s[s.length-1];
}
function $def$string_value(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_35(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 128 : 

                s = $239(l, e, s);

                if ( e.p<0 ) s = $240(l, e, s);

                break;
             

            case 127 : s = $241(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![129,128,127].includes(a) ) fail(l, e);else e.p = 129;

    return s[s.length-1];
}
function $def$js_id_symbols(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    
    switch(l.tx){

        case "$" : s = $424(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "_" : s = $422(l, e, _s(s, l, e, e.eh, _0)); break; 

        default : 

            switch(l.ty){

                case 2 : s = $409(l, e, _s(s, l, e, e.eh, _0)); break;
            }
        
    }

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 131 : s = $421(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![131].includes(a) ) fail(l, e);else e.p = 131;

    return s[s.length-1];
}
function $def$identifier_symbols(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    
    switch(l.tx){

        case "$" : s = $425(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "_" : s = $423(l, e, _s(s, l, e, e.eh, _0)); break; 

        default : 

            switch(l.ty){

                case 2 : s = $410(l, e, _s(s, l, e, e.eh, _0)); break;
            }
        
    }

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 133 : s = $427(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![133].includes(a) ) fail(l, e);else e.p = 133;

    return s[s.length-1];
}
function $1(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    
    if ( l.END ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(
            -1,
            1,
            { type:"Stylesheet", imports:sym[0], nodes:null, pos }
        );

        return (e.p = 4, s);
    }else switch(l.tx){

        case "#" : 

            s.push($ID_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:83;

            break;
         

        case "$" : s = $34(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "*" : 

            var cp= l.copy(),_sym= null;

            _sym = $26(cp, e, _s(s.slice(), cp, e, e.eh, _0));

            if ( e.p!==91 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s = $27(l, e, _s(s, l, e, e.eh, _0));

            break;
         

        case "-" : s = $36(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "." : 

            s.push($CLASS_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:84;

            break;
         

        case ":" : 

            var cp= l.copy(),_sym= null;

            _sym = s.slice();

            _sym.push($PSEUDO_CLASS_SELECTOR(cp, e));

            e.p = (e.FAILED)?-1:86;

            if ( e.p!==86 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s.push($PSEUDO_ELEMENT_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:92;

            break;
         

        case "@" : 

            var cp= l.copy(),_sym= null;

            _sym = s.slice();

            _sym.push($supports(cp, e));

            e.p = (e.FAILED)?-1:23;

            if ( e.p!==23 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            cp = l.copy();

            _sym = s.slice();

            _sym.push($import(cp, e));

            e.p = (e.FAILED)?-1:14;

            if ( e.p!==14 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            cp = l.copy();

            _sym = s.slice();

            _sym.push($media(cp, e));

            e.p = (e.FAILED)?-1:31;

            if ( e.p!==31 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s.push($keyframes(l, e));

            e.p = (e.FAILED)?-1:17;

            break;
         

        case "[" : 

            s.push($ATTRIBUTE_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:88;

            break;
         

        case "|" : s = $31(l, e, _s(s, l, e, e.eh, _0)); break; 

        default : 

            switch(l.ty){

                case 2 : s = $35(l, e, _s(s, l, e, e.eh, _0)); break;
            }
        
    }

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : 

                s = $28(l, e, s);

                if ( e.p<0 ) s = $29(l, e, s);

                break;
             

            case 92 : s = $48(l, e, s); break; 

            case 91 : s = $18(l, e, s); break; 

            case 88 : s = $40(l, e, s); break; 

            case 86 : s = $41(l, e, s); break; 

            case 84 : s = $39(l, e, s); break; 

            case 83 : s = $38(l, e, s); break; 

            case 82 : s = $37(l, e, s); break; 

            case 81 : s = $23(l, e, s); break; 

            case 80 : 

                s = $24(l, e, s);

                if ( e.p<0 ) s = $25(l, e, s);

                break;
             

            case 79 : s = $30(l, e, s); break; 

            case 77 : s = $17(l, e, s); break; 

            case 76 : 

                s = $21(l, e, s);

                if ( e.p<0 ) s = $22(l, e, s);

                break;
             

            case 75 : s = $47(l, e, s); break; 

            case 73 : 

                s = $19(l, e, s);

                if ( e.p<0 ) s = $20(l, e, s);

                break;
             

            case 72 : s = $16(l, e, s); break; 

            case 31 : s = $49(l, e, s); break; 

            case 23 : s = $51(l, e, s); break; 

            case 17 : s = $50(l, e, s); break; 

            case 14 : s = $6(l, e, s); break; 

            case 9 : s = $13(l, e, s); break; 

            case 6 : s = $12(l, e, s); break; 

            case 5 : 

                s = $14(l, e, s);

                if ( e.p<0 ) s = $15(l, e, s);

                break;
             

            case 3 : 

                s = $52(l, e, s);

                if ( e.p<0 ) s = $4(l, e, s);

                break;
             

            case 2 : s = $11(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![4].includes(a) ) fail(l, e);

    return s;
}
function $2(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_0(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 14 : s = $53(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![1].includes(a) ) fail(l, e);

    return s;
}
function $3(l, e, s= []){

    e.p = -1;

    
    if ( l.END ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(
            -1,
            1,
            { type:"Stylesheet", imports:null, nodes:sym[0], pos }
        );

        return (e.p = 4, s);
    }

    return s;
}
function $4(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    
    switch(l.tx){

        case "#" : 

            s.push($ID_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:83;

            break;
         

        case "$" : s = $34(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "*" : 

            var cp= l.copy(),_sym= null;

            _sym = $26(cp, e, _s(s.slice(), cp, e, e.eh, _0));

            if ( e.p!==91 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s = $27(l, e, _s(s, l, e, e.eh, _0));

            break;
         

        case "-" : s = $36(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "." : 

            s.push($CLASS_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:84;

            break;
         

        case ":" : 

            var cp= l.copy(),_sym= null;

            _sym = s.slice();

            _sym.push($PSEUDO_CLASS_SELECTOR(cp, e));

            e.p = (e.FAILED)?-1:86;

            if ( e.p!==86 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s.push($PSEUDO_ELEMENT_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:92;

            break;
         

        case "@" : 

            var cp= l.copy(),_sym= null;

            _sym = s.slice();

            _sym.push($supports(cp, e));

            e.p = (e.FAILED)?-1:23;

            if ( e.p!==23 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            cp = l.copy();

            _sym = s.slice();

            _sym.push($import(cp, e));

            e.p = (e.FAILED)?-1:14;

            if ( e.p!==14 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            cp = l.copy();

            _sym = s.slice();

            _sym.push($media(cp, e));

            e.p = (e.FAILED)?-1:31;

            if ( e.p!==31 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s.push($keyframes(l, e));

            e.p = (e.FAILED)?-1:17;

            break;
         

        case "[" : 

            s.push($ATTRIBUTE_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:88;

            break;
         

        case "|" : s = $31(l, e, _s(s, l, e, e.eh, _0)); break; 

        default : 

            switch(l.ty){

                case 2 : s = $35(l, e, _s(s, l, e, e.eh, _0)); break;
            }
        
    }

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : 

                s = $28(l, e, s);

                if ( e.p<0 ) s = $29(l, e, s);

                break;
             

            case 92 : s = $48(l, e, s); break; 

            case 91 : s = $18(l, e, s); break; 

            case 88 : s = $40(l, e, s); break; 

            case 86 : s = $41(l, e, s); break; 

            case 84 : s = $39(l, e, s); break; 

            case 83 : s = $38(l, e, s); break; 

            case 82 : s = $37(l, e, s); break; 

            case 81 : s = $23(l, e, s); break; 

            case 80 : 

                s = $24(l, e, s);

                if ( e.p<0 ) s = $25(l, e, s);

                break;
             

            case 79 : s = $30(l, e, s); break; 

            case 77 : s = $17(l, e, s); break; 

            case 76 : 

                s = $21(l, e, s);

                if ( e.p<0 ) s = $22(l, e, s);

                break;
             

            case 75 : s = $47(l, e, s); break; 

            case 73 : 

                s = $19(l, e, s);

                if ( e.p<0 ) s = $20(l, e, s);

                break;
             

            case 72 : s = $16(l, e, s); break; 

            case 31 : s = $49(l, e, s); break; 

            case 23 : s = $51(l, e, s); break; 

            case 17 : s = $50(l, e, s); break; 

            case 14 : s = $6(l, e, s); break; 

            case 9 : s = $13(l, e, s); break; 

            case 6 : s = $12(l, e, s); break; 

            case 5 : 

                s = $14(l, e, s);

                if ( e.p<0 ) s = $15(l, e, s);

                break;
             

            case 2 : s = $54(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![3].includes(a) ) fail(l, e);

    return s;
}
function $5(l, e, s= []){

    e.p = -1;

    
    if ( l.END||_7.includes(l.tx)||_8.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return (e.p = 1, s);
    }

    return s;
}
function $6(l, e, s= []){

    e.p = -1;

    
    if ( l.END ) {

        e.sp -= 1;

        return (e.p = 9, (s.splice(-1, 1, s[s.length-1]), s));
    }else switch(l.tx){

        case ";" : return $55(l, e, _s(s, l, e, e.eh, _0)); 

        case "#" :  

        case "$" :  

        case "*" :  

        case "+" :  

        case "-" :  

        case "." :  

        case ":" :  

        case ">" :  

        case "@" :  

        case "[" :  

        case "|" :  

        case "||" :  

        case "~" : 

            e.sp -= 1;

            return (e.p = 9, (s.splice(-1, 1, s[s.length-1]), s));
         

        default : 

            switch(l.ty){

                case 255 :  

                case 2 : 

                    e.sp -= 1;

                    return (e.p = 9, (s.splice(-1, 1, s[s.length-1]), s));
                
            }
        
    }

    return s;
}
function $11(l, e, s= []){

    e.p = -1;

    
    if ( l.END||_7.includes(l.tx)||_8.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return (e.p = 3, s);
    }

    return s;
}
function $12(l, e, s= []){e.p = -1; s = $_49(l, e, s); return s;}
function $13(l, e, s= []){e.p = -1; s = $_49(l, e, s); return s;}
function $14(l, e, s= []){

    e.p = -1;

    
    if ( _9.includes(l.tx) ) {return $60(l, e, _s(s, l, e, e.eh, _0));}

    return s;
}
function $15(l, e, s= []){

    e.p = -1;

    
    if ( _10.includes(l.tx) ) {return $61(l, e, _s(s, l, e, e.eh, _0));}

    return s;
}
function $16(l, e, s= []){

    e.p = -1;

    
    if ( _11.includes(l.tx) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return (e.p = 5, s);
    }

    return s;
}
function $17(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    
    switch(l.tx){

        case "#" : 

            s.push($ID_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:83;

            break;
         

        case "$" : s = $34(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "*" : 

            var cp= l.copy(),_sym= null;

            _sym = $26(cp, e, _s(s.slice(), cp, e, e.eh, _0));

            if ( e.p!==91 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s = $27(l, e, _s(s, l, e, e.eh, _0));

            break;
         

        case "+" : s = $69(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "-" : s = $36(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "." : 

            s.push($CLASS_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:84;

            break;
         

        case ":" : 

            var cp= l.copy(),_sym= null;

            _sym = s.slice();

            _sym.push($PSEUDO_CLASS_SELECTOR(cp, e));

            e.p = (e.FAILED)?-1:86;

            if ( e.p!==86 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s.push($PSEUDO_ELEMENT_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:92;

            break;
         

        case ">" : s = $68(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "[" : 

            s.push($ATTRIBUTE_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:88;

            break;
         

        case "|" : s = $31(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "||" : s = $71(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "~" : s = $70(l, e, _s(s, l, e, e.eh, _0)); break; 

        case ")" :  

        case "," :  

        case "{" : 

            e.sp -= 1;

            var sym= s.slice(-1);

            s.splice(
                -1,
                1,
                (sym[0]&&null)?{ type:"ComplexSelector", nodes:[sym[0]], pos }:sym[0]
            );

            return (e.p = 72, s);
         

        default : 

            switch(l.ty){

                case 2 : s = $35(l, e, _s(s, l, e, e.eh, _0)); break;
            }
        
    }

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : 

                s = $28(l, e, s);

                if ( e.p<0 ) s = $29(l, e, s);

                break;
             

            case 92 : s = $48(l, e, s); break; 

            case 91 : s = $18(l, e, s); break; 

            case 88 : s = $40(l, e, s); break; 

            case 86 : s = $41(l, e, s); break; 

            case 84 : s = $39(l, e, s); break; 

            case 83 : s = $38(l, e, s); break; 

            case 82 : s = $37(l, e, s); break; 

            case 81 : s = $23(l, e, s); break; 

            case 80 : 

                s = $24(l, e, s);

                if ( e.p<0 ) s = $25(l, e, s);

                break;
             

            case 79 : s = $30(l, e, s); break; 

            case 78 : s = $67(l, e, s); break; 

            case 77 : s = $66(l, e, s); break; 

            case 76 : 

                s = $21(l, e, s);

                if ( e.p<0 ) s = $22(l, e, s);

                break;
             

            case 75 : s = $47(l, e, s); break; 

            case 73 : 

                s = $19(l, e, s);

                if ( e.p<0 ) s = $20(l, e, s);

                break;
             

            case 71 : 

                s = $62(l, e, s);

                if ( e.p<0 ) s = $63(l, e, s);

                break;
             

            case 70 : s = $64(l, e, s); break; 

            case 69 : s = $65(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![72].includes(a) ) fail(l, e);

    return s;
}
function $18(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    
    switch(l.tx){

        case "#" : 

            s.push($ID_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:83;

            break;
         

        case "." : 

            s.push($CLASS_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:84;

            break;
         

        case ":" : 

            var cp= l.copy(),_sym= null;

            _sym = s.slice();

            _sym.push($PSEUDO_CLASS_SELECTOR(cp, e));

            e.p = (e.FAILED)?-1:86;

            if ( e.p!==86 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s.push($PSEUDO_ELEMENT_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:92;

            break;
         

        case "[" : 

            s.push($ATTRIBUTE_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:88;

            break;
         

        case "$" :  

        case ")" :  

        case "*" :  

        case "+" :  

        case "," :  

        case "-" :  

        case ">" :  

        case "{" :  

        case "|" :  

        case "||" :  

        case "~" : 

            e.sp -= 1;

            var sym= s.slice(-1);

            s.splice(
                -1,
                1,
                (sym[0]&&!(null||null))?sym[0]:(null&&null.length==1&&!(sym[0]||null))?null[0]:{ type:"CompoundSelector", nodes:[sym[0]], pos }
            );

            return (e.p = 77, s);
         

        default : 

            switch(l.ty){

                case 2 :  

                case 8 : 

                    e.sp -= 1;

                    var sym= s.slice(-1);

                    s.splice(
                        -1,
                        1,
                        (sym[0]&&!(null||null))?sym[0]:(null&&null.length==1&&!(sym[0]||null))?null[0]:{ type:"CompoundSelector", nodes:[sym[0]], pos }
                    );

                    return (e.p = 77, s);
                
            }
        
    }

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 92 : s = $48(l, e, s); break; 

            case 88 : s = $40(l, e, s); break; 

            case 86 : s = $41(l, e, s); break; 

            case 84 : s = $39(l, e, s); break; 

            case 83 : s = $38(l, e, s); break; 

            case 82 : s = $37(l, e, s); break; 

            case 76 : 

                s = $73(l, e, s);

                if ( e.p<0 ) s = $22(l, e, s);

                break;
             

            case 75 : s = $47(l, e, s); break; 

            case 73 : 

                s = $72(l, e, s);

                if ( e.p<0 ) s = $20(l, e, s);

                break;
             

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![77].includes(a) ) fail(l, e);

    return s;
}
function $19(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    
    switch(l.tx){

        case ":" : 

            s.push($PSEUDO_ELEMENT_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:92;

            break;
         

        case "#" :  

        case "$" :  

        case ")" :  

        case "*" :  

        case "+" :  

        case "," :  

        case "-" :  

        case "." :  

        case ">" :  

        case "[" :  

        case "{" :  

        case "|" :  

        case "||" :  

        case "~" : 

            e.sp -= 1;

            var sym= s.slice(-1);

            s.splice(
                -1,
                1,
                (null&&!(sym[0]||null))?null:(sym[0]&&sym[0].length==1&&!(null||null))?sym[0][0]:{ type:"CompoundSelector", nodes:[...sym[0]], pos }
            );

            return (e.p = 77, s);
         

        default : 

            switch(l.ty){

                case 2 :  

                case 8 : 

                    e.sp -= 1;

                    var sym= s.slice(-1);

                    s.splice(
                        -1,
                        1,
                        (null&&!(sym[0]||null))?null:(sym[0]&&sym[0].length==1&&!(null||null))?sym[0][0]:{ type:"CompoundSelector", nodes:[...sym[0]], pos }
                    );

                    return (e.p = 77, s);
                
            }
        
    }

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 92 : s = $48(l, e, s); break; 

            case 76 : 

                s = $74(l, e, s);

                if ( e.p<0 ) s = $22(l, e, s);

                break;
             

            case 75 : s = $47(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![77].includes(a) ) fail(l, e);

    return s;
}
function $20(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_19(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 88 : s = $40(l, e, s); break; 

            case 86 : s = $41(l, e, s); break; 

            case 84 : s = $39(l, e, s); break; 

            case 83 : s = $38(l, e, s); break; 

            case 82 : s = $75(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![73].includes(a) ) fail(l, e);

    return s;
}
function $21(l, e, s= []){

    e.p = -1;

    
    if ( _12.includes(l.tx)||_13.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(
            -1,
            1,
            (null&&!(null||sym[0]))?null:(null&&null.length==1&&!(null||sym[0]))?null[0]:{ type:"CompoundSelector", nodes:[...sym[0]], pos }
        );

        return (e.p = 77, s);
    }

    return s;
}
function $22(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_21(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 92 : s = $48(l, e, s); break; 

            case 75 : s = $76(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![76].includes(a) ) fail(l, e);

    return s;
}
function $23(l, e, s= []){

    e.p = -1;

    
    if ( _12.includes(l.tx)||_13.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(
            -1,
            1,
            { 

                type:"TypeSelector",

                nodes:[sym[0]],

                pos,

                precedence:"D_SPECIFIER"
             }
        );

        return (e.p = 91, s);
    }

    return s;
}
function $24(l, e, s= []){

    e.p = -1;

    
    if ( ["*"].includes(l.tx) ) {return $77(l, e, _s(s, l, e, e.eh, _0));}

    return s;
}
function $25(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_30(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : s = $78(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![81].includes(a) ) fail(l, e);

    return s;
}
function $26(l, e, s= []){

    e.p = -1;

    
    if ( _12.includes(l.tx)||_13.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(
            -1,
            1,
            { 

                type:"TypeSelector",

                nodes:[{ 

                    type:"QualifiedName",

                    ns:"",

                    val:"*",

                    pos,

                    precedence:0
                 }],

                pos
             }
        );

        return (e.p = 91, s);
    }

    return s;
}
function $27(l, e, s= []){e.p = -1; s = $_60(l, e, s); return s;}
function $28(l, e, s= []){

    e.p = -1;

    
    if ( _15.includes(l.tx)||_13.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(
            -1,
            1,
            { type:"QualifiedName", ns:"", val:sym[0], pos }
        );

        return (e.p = 81, s);
    }

    return s;
}
function $29(l, e, s= []){e.p = -1; s = $_60(l, e, s); return s;}
function $30(l, e, s= []){

    e.p = -1;

    
    if ( _14.includes(l.tx) ) {return $79(l, e, _s(s, l, e, e.eh, _0));}

    return s;
}
function $31(l, e, s= []){

    e.p = -1;

    
    if ( _16.includes(l.tx)||_17.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, null);

        return (e.p = 80, s);
    }

    return s;
}
function $32(l, e, s= []){

    e.p = -1;

    
    if ( l.END||["#","$","$=","(",")","*","*=","+",",","-",".",":",";","<","<=","=",">",">=","@","[","]","^=","and","i","s","{","|","||","~"].includes(l.tx)||[2,255,8].includes(l.ty) ) {

        e.sp -= 1;

        return (e.p = 104, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}
function $33(l, e, s= []){

    e.p = -1;

    
    switch(l.tx){

        case "$" : return $83(l, e, _s(s, l, e, e.eh, _0)); 

        case "-" : return $82(l, e, _s(s, l, e, e.eh, _0)); 

        case "_" : return $81(l, e, _s(s, l, e, e.eh, _0)); 

        default : 

            switch(l.ty){

                case 1025 : return $86(l, e, _s(s, l, e, e.eh, _0)); 

                case 4097 : return $85(l, e, _s(s, l, e, e.eh, _0)); 

                case 2 : return $80(l, e, _s(s, l, e, e.eh, _0)); 

                case 1 : return $84(l, e, _s(s, l, e, e.eh, _0)); 

                case 2049 : return $87(l, e, _s(s, l, e, e.eh, _0));
            }
        
    }

    return s;
}
function $34(l, e, s= []){e.p = -1; s = $_66(l, e, s); return s;}
function $35(l, e, s= []){e.p = -1; s = $_66(l, e, s); return s;}
function $36(l, e, s= []){e.p = -1; s = $_66(l, e, s); return s;}
function $37(l, e, s= []){

    e.p = -1;

    
    if ( _12.includes(l.tx)||_13.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return (e.p = 73, s);
    }

    return s;
}
function $38(l, e, s= []){e.p = -1; s = $_68(l, e, s); return s;}
function $39(l, e, s= []){e.p = -1; s = $_68(l, e, s); return s;}
function $40(l, e, s= []){e.p = -1; s = $_68(l, e, s); return s;}
function $41(l, e, s= []){e.p = -1; s = $_68(l, e, s); return s;}
function $47(l, e, s= []){

    e.p = -1;

    
    if ( _12.includes(l.tx)||_13.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return (e.p = 76, s);
    }

    return s;
}
function $48(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    
    switch(l.tx){

        case ":" : 

            s.push($PSEUDO_CLASS_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:86;

            break;
         

        case "#" :  

        case "$" :  

        case ")" :  

        case "*" :  

        case "+" :  

        case "," :  

        case "-" :  

        case "." :  

        case ">" :  

        case "[" :  

        case "{" :  

        case "|" :  

        case "||" :  

        case "~" : 

            e.sp -= 1;

            var sym= s.slice(-1);

            s.splice(
                -1,
                1,
                { type:"PseudoSelector", nodes:[sym[0]], pos }
            );

            return (e.p = 75, s);
         

        default : 

            switch(l.ty){

                case 2 :  

                case 8 : 

                    e.sp -= 1;

                    var sym= s.slice(-1);

                    s.splice(
                        -1,
                        1,
                        { type:"PseudoSelector", nodes:[sym[0]], pos }
                    );

                    return (e.p = 75, s);
                
            }
        
    }

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 86 : s = $95(l, e, s); break; 

            case 74 : 

                s = $93(l, e, s);

                if ( e.p<0 ) s = $94(l, e, s);

                break;
             

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![75].includes(a) ) fail(l, e);

    return s;
}
function $49(l, e, s= []){

    e.p = -1;

    
    if ( l.END ) {

        e.sp -= 1;

        return (e.p = 9, (s.splice(-1, 1, s[s.length-1]), s));
    }else switch(l.tx){

        case ";" : return $96(l, e, _s(s, l, e, e.eh, _0)); 

        case "#" :  

        case "$" :  

        case "*" :  

        case "+" :  

        case "-" :  

        case "." :  

        case ":" :  

        case ">" :  

        case "@" :  

        case "[" :  

        case "|" :  

        case "||" :  

        case "~" : 

            e.sp -= 1;

            return (e.p = 9, (s.splice(-1, 1, s[s.length-1]), s));
         

        default : 

            switch(l.ty){

                case 255 :  

                case 2 : 

                    e.sp -= 1;

                    return (e.p = 9, (s.splice(-1, 1, s[s.length-1]), s));
                
            }
        
    }

    return s;
}
function $50(l, e, s= []){

    e.p = -1;

    
    if ( l.END ) {

        e.sp -= 1;

        return (e.p = 9, (s.splice(-1, 1, s[s.length-1]), s));
    }else switch(l.tx){

        case ";" : return $97(l, e, _s(s, l, e, e.eh, _0)); 

        case "#" :  

        case "$" :  

        case "*" :  

        case "+" :  

        case "-" :  

        case "." :  

        case ":" :  

        case ">" :  

        case "@" :  

        case "[" :  

        case "|" :  

        case "||" :  

        case "~" : 

            e.sp -= 1;

            return (e.p = 9, (s.splice(-1, 1, s[s.length-1]), s));
         

        default : 

            switch(l.ty){

                case 255 :  

                case 2 : 

                    e.sp -= 1;

                    return (e.p = 9, (s.splice(-1, 1, s[s.length-1]), s));
                
            }
        
    }

    return s;
}
function $51(l, e, s= []){

    e.p = -1;

    
    if ( l.END ) {

        e.sp -= 1;

        return (e.p = 9, (s.splice(-1, 1, s[s.length-1]), s));
    }else switch(l.tx){

        case ";" : return $98(l, e, _s(s, l, e, e.eh, _0)); 

        case "#" :  

        case "$" :  

        case "*" :  

        case "+" :  

        case "-" :  

        case "." :  

        case ":" :  

        case ">" :  

        case "@" :  

        case "[" :  

        case "|" :  

        case "||" :  

        case "~" : 

            e.sp -= 1;

            return (e.p = 9, (s.splice(-1, 1, s[s.length-1]), s));
         

        default : 

            switch(l.ty){

                case 255 :  

                case 2 : 

                    e.sp -= 1;

                    return (e.p = 9, (s.splice(-1, 1, s[s.length-1]), s));
                
            }
        
    }

    return s;
}
function $52(l, e, s= []){

    e.p = -1;

    
    if ( l.END ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(
            -2,
            2,
            { type:"Stylesheet", imports:sym[0], nodes:sym[1], pos }
        );

        return (e.p = 4, s);
    }

    return s;
}
function $53(l, e, s= []){

    e.p = -1;

    
    if ( l.END||_7.includes(l.tx)||_8.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, ([...sym[0],sym[1]]));

        return (e.p = 1, s);
    }

    return s;
}
function $54(l, e, s= []){

    e.p = -1;

    
    if ( l.END||_7.includes(l.tx)||_8.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, ([...sym[0],sym[1]]));

        return (e.p = 3, s);
    }

    return s;
}
function $55(l, e, s= []){e.p = -1; s = $_77(l, e, s); return s;}
function $60(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    
    switch(l.tx){

        case "$" : s = $34(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "-" : s = $36(l, e, _s(s, l, e, e.eh, _0)); break; 

        case ";" : 

            var cp= l.copy(),_sym= null;

            _sym = $143(cp, e, _s(s.slice(), cp, e, e.eh, _0));

            if ( e.p!==6 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s = $144(l, e, _s(s, l, e, e.eh, _0));

            break;
         

        case "}" : s = $145(l, e, _s(s, l, e, e.eh, _0)); break; 

        default : 

            switch(l.ty){

                case 2 : s = $35(l, e, _s(s, l, e, e.eh, _0)); break;
            }
        
    }

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 106 : s = $153(l, e, s); break; 

            case 105 : 

                s = $154(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 100 : s = $152(l, e, s); break; 

            case 98 : s = $151(l, e, s); break; 

            case 97 : s = $142(l, e, s); break; 

            case 95 : 

                s = $146(l, e, s);

                if ( e.p<0 ) s = $147(l, e, s);

                break;
             

            case 94 : s = $148(l, e, s); break; 

            case 93 : 

                s = $149(l, e, s);

                if ( e.p<0 ) s = $150(l, e, s);

                break;
             

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![6].includes(a) ) fail(l, e);

    return s;
}
function $61(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_81(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : 

                s = $28(l, e, s);

                if ( e.p<0 ) s = $29(l, e, s);

                break;
             

            case 92 : s = $48(l, e, s); break; 

            case 91 : s = $18(l, e, s); break; 

            case 88 : s = $40(l, e, s); break; 

            case 86 : s = $41(l, e, s); break; 

            case 84 : s = $39(l, e, s); break; 

            case 83 : s = $38(l, e, s); break; 

            case 82 : s = $37(l, e, s); break; 

            case 81 : s = $23(l, e, s); break; 

            case 80 : 

                s = $24(l, e, s);

                if ( e.p<0 ) s = $25(l, e, s);

                break;
             

            case 79 : s = $30(l, e, s); break; 

            case 77 : s = $17(l, e, s); break; 

            case 76 : 

                s = $21(l, e, s);

                if ( e.p<0 ) s = $22(l, e, s);

                break;
             

            case 75 : s = $47(l, e, s); break; 

            case 73 : 

                s = $19(l, e, s);

                if ( e.p<0 ) s = $20(l, e, s);

                break;
             

            case 72 : s = $155(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![5].includes(a) ) fail(l, e);

    return s;
}
function $62(l, e, s= []){

    e.p = -1;

    
    if ( [")",",","{"].includes(l.tx) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(
            -2,
            2,
            (sym[0]&&sym[1])?{ 

                type:"ComplexSelector",

                nodes:[sym[0],...((sym[1]).flat(2))],

                pos
             }:sym[0]
        );

        return (e.p = 72, s);
    }

    return s;
}
function $63(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    
    switch(l.tx){

        case "#" : 

            s.push($ID_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:83;

            break;
         

        case "$" : s = $34(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "*" : 

            var cp= l.copy(),_sym= null;

            _sym = $26(cp, e, _s(s.slice(), cp, e, e.eh, _0));

            if ( e.p!==91 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s = $27(l, e, _s(s, l, e, e.eh, _0));

            break;
         

        case "+" : s = $69(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "-" : s = $36(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "." : 

            s.push($CLASS_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:84;

            break;
         

        case ":" : 

            var cp= l.copy(),_sym= null;

            _sym = s.slice();

            _sym.push($PSEUDO_CLASS_SELECTOR(cp, e));

            e.p = (e.FAILED)?-1:86;

            if ( e.p!==86 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s.push($PSEUDO_ELEMENT_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:92;

            break;
         

        case ">" : s = $68(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "[" : 

            s.push($ATTRIBUTE_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:88;

            break;
         

        case "|" : s = $31(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "||" : s = $71(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "~" : s = $70(l, e, _s(s, l, e, e.eh, _0)); break; 

        default : 

            switch(l.ty){

                case 2 : s = $35(l, e, _s(s, l, e, e.eh, _0)); break;
            }
        
    }

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : 

                s = $28(l, e, s);

                if ( e.p<0 ) s = $29(l, e, s);

                break;
             

            case 92 : s = $48(l, e, s); break; 

            case 91 : s = $18(l, e, s); break; 

            case 88 : s = $40(l, e, s); break; 

            case 86 : s = $41(l, e, s); break; 

            case 84 : s = $39(l, e, s); break; 

            case 83 : s = $38(l, e, s); break; 

            case 82 : s = $37(l, e, s); break; 

            case 81 : s = $23(l, e, s); break; 

            case 80 : 

                s = $24(l, e, s);

                if ( e.p<0 ) s = $25(l, e, s);

                break;
             

            case 79 : s = $30(l, e, s); break; 

            case 78 : s = $67(l, e, s); break; 

            case 77 : s = $66(l, e, s); break; 

            case 76 : 

                s = $21(l, e, s);

                if ( e.p<0 ) s = $22(l, e, s);

                break;
             

            case 75 : s = $47(l, e, s); break; 

            case 73 : 

                s = $19(l, e, s);

                if ( e.p<0 ) s = $20(l, e, s);

                break;
             

            case 70 : s = $156(l, e, s); break; 

            case 69 : s = $65(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![71].includes(a) ) fail(l, e);

    return s;
}
function $64(l, e, s= []){

    e.p = -1;

    
    if ( _12.includes(l.tx)||_17.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return (e.p = 71, s);
    }

    return s;
}
function $65(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_81(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : 

                s = $28(l, e, s);

                if ( e.p<0 ) s = $29(l, e, s);

                break;
             

            case 92 : s = $48(l, e, s); break; 

            case 91 : s = $18(l, e, s); break; 

            case 88 : s = $40(l, e, s); break; 

            case 86 : s = $41(l, e, s); break; 

            case 84 : s = $39(l, e, s); break; 

            case 83 : s = $38(l, e, s); break; 

            case 82 : s = $37(l, e, s); break; 

            case 81 : s = $23(l, e, s); break; 

            case 80 : 

                s = $24(l, e, s);

                if ( e.p<0 ) s = $25(l, e, s);

                break;
             

            case 79 : s = $30(l, e, s); break; 

            case 77 : s = $157(l, e, s); break; 

            case 76 : 

                s = $21(l, e, s);

                if ( e.p<0 ) s = $22(l, e, s);

                break;
             

            case 75 : s = $47(l, e, s); break; 

            case 73 : 

                s = $19(l, e, s);

                if ( e.p<0 ) s = $20(l, e, s);

                break;
             

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![70].includes(a) ) fail(l, e);

    return s;
}
function $66(l, e, s= []){

    e.p = -1;

    
    if ( _12.includes(l.tx)||_17.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return (e.p = 70, s);
    }

    return s;
}
function $67(l, e, s= []){

    e.p = -1;

    
    if ( _12.includes(l.tx)||_17.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, { type:"Combinator", val:sym[0] });

        return (e.p = 69, s);
    }

    return s;
}
function $68(l, e, s= []){e.p = -1; s = $_87(l, e, s); return s;}
function $69(l, e, s= []){e.p = -1; s = $_87(l, e, s); return s;}
function $70(l, e, s= []){e.p = -1; s = $_87(l, e, s); return s;}
function $71(l, e, s= []){e.p = -1; s = $_87(l, e, s); return s;}
function $72(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    
    switch(l.tx){

        case ":" : 

            s.push($PSEUDO_ELEMENT_SELECTOR(l, e));

            e.p = (e.FAILED)?-1:92;

            break;
         

        case "#" :  

        case "$" :  

        case ")" :  

        case "*" :  

        case "+" :  

        case "," :  

        case "-" :  

        case "." :  

        case ">" :  

        case "[" :  

        case "{" :  

        case "|" :  

        case "||" :  

        case "~" : 

            e.sp -= 2;

            var sym= s.slice(-2);

            s.splice(
                -2,
                2,
                (sym[0]&&!(sym[1]||null))?sym[0]:(sym[1]&&sym[1].length==1&&!(sym[0]||null))?sym[1][0]:{ 

                    type:"CompoundSelector",

                    nodes:[sym[0],...sym[1]],

                    pos
                 }
            );

            return (e.p = 77, s);
         

        default : 

            switch(l.ty){

                case 2 :  

                case 8 : 

                    e.sp -= 2;

                    var sym= s.slice(-2);

                    s.splice(
                        -2,
                        2,
                        (sym[0]&&!(sym[1]||null))?sym[0]:(sym[1]&&sym[1].length==1&&!(sym[0]||null))?sym[1][0]:{ 

                            type:"CompoundSelector",

                            nodes:[sym[0],...sym[1]],

                            pos
                         }
                    );

                    return (e.p = 77, s);
                
            }
        
    }

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 92 : s = $48(l, e, s); break; 

            case 76 : 

                s = $158(l, e, s);

                if ( e.p<0 ) s = $22(l, e, s);

                break;
             

            case 75 : s = $47(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![77].includes(a) ) fail(l, e);

    return s;
}
function $73(l, e, s= []){

    e.p = -1;

    
    if ( _12.includes(l.tx)||_13.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(
            -2,
            2,
            (sym[0]&&!(null||sym[1]))?sym[0]:(null&&null.length==1&&!(sym[0]||sym[1]))?null[0]:{ 

                type:"CompoundSelector",

                nodes:[sym[0],...sym[1]],

                pos
             }
        );

        return (e.p = 77, s);
    }

    return s;
}
function $74(l, e, s= []){

    e.p = -1;

    
    if ( _12.includes(l.tx)||_13.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(
            -2,
            2,
            (null&&!(sym[0]||sym[1]))?null:(sym[0]&&sym[0].length==1&&!(null||sym[1]))?sym[0][0]:{ 

                type:"CompoundSelector",

                nodes:[...sym[0],...sym[1]],

                pos
             }
        );

        return (e.p = 77, s);
    }

    return s;
}
function $75(l, e, s= []){

    e.p = -1;

    
    if ( _12.includes(l.tx)||_13.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, ([...sym[0],sym[1]]));

        return (e.p = 73, s);
    }

    return s;
}
function $76(l, e, s= []){

    e.p = -1;

    
    if ( _12.includes(l.tx)||_13.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, ([...sym[0],sym[1]]));

        return (e.p = 76, s);
    }

    return s;
}
function $77(l, e, s= []){

    e.p = -1;

    
    if ( _12.includes(l.tx)||_13.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(
            -2,
            2,
            { 

                type:"TypeSelector",

                nodes:[{ 

                    type:"QualifiedName",

                    ns:sym[0]||"",

                    val:"*",

                    pos,

                    precedence:0
                 }],

                pos
             }
        );

        return (e.p = 91, s);
    }

    return s;
}
function $78(l, e, s= []){

    e.p = -1;

    
    if ( _15.includes(l.tx)||_13.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(
            -2,
            2,
            { type:"QualifiedName", ns:sym[0]||"", val:sym[1], pos }
        );

        return (e.p = 81, s);
    }

    return s;
}
function $79(l, e, s= []){

    e.p = -1;

    
    if ( _16.includes(l.tx)||_17.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, sym[0]);

        return (e.p = 80, s);
    }

    return s;
}
function $80(l, e, s= []){e.p = -1; s = $_96(l, e, s); return s;}
function $81(l, e, s= []){e.p = -1; s = $_96(l, e, s); return s;}
function $82(l, e, s= []){e.p = -1; s = $_96(l, e, s); return s;}
function $83(l, e, s= []){e.p = -1; s = $_96(l, e, s); return s;}
function $84(l, e, s= []){e.p = -1; s = $_96(l, e, s); return s;}
function $85(l, e, s= []){e.p = -1; s = $_96(l, e, s); return s;}
function $86(l, e, s= []){e.p = -1; s = $_96(l, e, s); return s;}
function $87(l, e, s= []){e.p = -1; s = $_96(l, e, s); return s;}
function $93(l, e, s= []){

    e.p = -1;

    
    if ( _12.includes(l.tx)||_13.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(
            -2,
            2,
            { 

                type:"PseudoSelector",

                nodes:[sym[0],...sym[1]],

                pos
             }
        );

        return (e.p = 75, s);
    }

    return s;
}
function $94(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_20(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 86 : s = $168(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![74].includes(a) ) fail(l, e);

    return s;
}
function $95(l, e, s= []){

    e.p = -1;

    
    if ( _12.includes(l.tx)||_13.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return (e.p = 74, s);
    }

    return s;
}
function $96(l, e, s= []){e.p = -1; s = $_77(l, e, s); return s;}
function $97(l, e, s= []){e.p = -1; s = $_77(l, e, s); return s;}
function $98(l, e, s= []){e.p = -1; s = $_77(l, e, s); return s;}
function $107(l, e, s= []){

    e.p = -1;

    
    if ( _10.includes(l.tx) ) {return $182(l, e, _s(s, l, e, e.eh, _0));}

    return s;
}
function $108(l, e, s= []){

    e.p = -1;

    
    if ( _11.includes(l.tx) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return (e.p = 33, s);
    }

    return s;
}
function $109(l, e, s= []){

    e.p = -1;

    
    if ( l.END||_22.includes(l.tx)||_8.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, { type:"Query", nodes:[sym[0]], pos });

        return (e.p = 37, s);
    }

    return s;
}
function $110(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_30(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : s = $126(l, e, s); break; 

            case 61 : s = $183(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![37].includes(a) ) fail(l, e);

    return s;
}
function $111(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    
    if ( l.END ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, { type:"Query", nodes:[sym[0]], pos });

        return (e.p = 37, s);
    }else switch(l.tx){

        case "and" : 

            s.push($media_query_group_144_117(l, e));

            e.p = (e.FAILED)?-1:36;

            break;
         

        case "#" :  

        case "$" :  

        case "*" :  

        case "+" :  

        case "," :  

        case "-" :  

        case "." :  

        case ":" :  

        case ";" :  

        case ">" :  

        case "@" :  

        case "[" :  

        case "{" :  

        case "|" :  

        case "||" :  

        case "~" : 

            e.sp -= 1;

            var sym= s.slice(-1);

            s.splice(-1, 1, { type:"Query", nodes:[sym[0]], pos });

            return (e.p = 37, s);
         

        default : 

            switch(l.ty){

                case 255 :  

                case 2 : 

                    e.sp -= 1;

                    var sym= s.slice(-1);

                    s.splice(-1, 1, { type:"Query", nodes:[sym[0]], pos });

                    return (e.p = 37, s);
                
            }
        
    }

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 36 : s = $184(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![37].includes(a) ) fail(l, e);

    return s;
}
function $112(l, e, s= []){e.p = -1; s = $_113(l, e, s); return s;}
function $113(l, e, s= []){e.p = -1; s = $_113(l, e, s); return s;}
function $114(l, e, s= []){e.p = -1; s = $_114(l, e, s); return s;}
function $115(l, e, s= []){e.p = -1; s = $_114(l, e, s); return s;}
function $116(l, e, s= []){e.p = -1; s = $_114(l, e, s); return s;}
function $117(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_10(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 42 : 

                s = $186(l, e, s);

                if ( e.p<0 ) s = $187(l, e, s);

                break;
             

            case 41 : s = $188(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![43].includes(a) ) fail(l, e);

    return s;
}
function $118(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_11(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 45 : 

                s = $190(l, e, s);

                if ( e.p<0 ) s = $191(l, e, s);

                break;
             

            case 44 : s = $192(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![46].includes(a) ) fail(l, e);

    return s;
}
function $120(l, e, s= []){e.p = -1; s = $_115(l, e, s); return s;}
function $121(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_9(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : s = $125(l, e, s); break; 

            case 52 : s = $124(l, e, s); break; 

            case 49 : s = $123(l, e, s); break; 

            case 47 : 

                s = $116(l, e, s);

                if ( e.p<0 ) s = $117(l, e, s);

                if ( e.p<0 ) s = $118(l, e, s);

                break;
             

            case 46 : s = $113(l, e, s); break; 

            case 43 : s = $115(l, e, s); break; 

            case 40 : s = $114(l, e, s); break; 

            case 39 : s = $112(l, e, s); break; 

            case 38 : s = $195(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![47].includes(a) ) fail(l, e);

    return s;
}
function $123(l, e, s= []){e.p = -1; s = $_116(l, e, s); return s;}
function $124(l, e, s= []){e.p = -1; s = $_116(l, e, s); return s;}
function $125(l, e, s= []){

    e.p = -1;

    
    if ( _21.includes(l.tx) ) {return $212(l, e, _s(s, l, e, e.eh, _0));}

    return s;
}
function $126(l, e, s= []){

    e.p = -1;

    
    if ( l.END||["#","$","*","+",",","-",".",":",";",">","@","[","and","{","|","||","~"].includes(l.tx)||_8.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, { type:"MediaType", val:sym[0], pos });

        return (e.p = 61, s);
    }

    return s;
}
function $127(l, e, s= []){e.p = -1; s = $_115(l, e, s); return s;}
function $134(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    
    switch(l.tx){

        case "and" : 

            s.push($supports_condition_group_129_112(l, e));

            e.p = (e.FAILED)?-1:24;

            break;
         

        case "or" : 

            s.push($supports_condition_group_129_112(l, e));

            e.p = (e.FAILED)?-1:24;

            break;
         

        case ")" :  

        case "{" : 

            e.sp -= 1;

            var sym= s.slice(-1);

            s.splice(-1, 1, [sym[0]]);

            return (e.p = 26, s);
        
    }

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 25 : 

                s = $216(l, e, s);

                if ( e.p<0 ) s = $217(l, e, s);

                break;
             

            case 24 : s = $218(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![26].includes(a) ) fail(l, e);

    return s;
}
function $135(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_4(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : s = $125(l, e, s); break; 

            case 52 : s = $138(l, e, s); break; 

            case 30 : s = $139(l, e, s); break; 

            case 29 : s = $140(l, e, s); break; 

            case 28 : s = $137(l, e, s); break; 

            case 27 : s = $134(l, e, s); break; 

            case 26 : s = $221(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![27].includes(a) ) fail(l, e);

    return s;
}
function $137(l, e, s= []){e.p = -1; s = $_124(l, e, s); return s;}
function $138(l, e, s= []){e.p = -1; s = $_124(l, e, s); return s;}
function $139(l, e, s= []){e.p = -1; s = $_125(l, e, s); return s;}
function $140(l, e, s= []){e.p = -1; s = $_125(l, e, s); return s;}
function $142(l, e, s= []){

    e.p = -1;

    
    switch(l.tx){

        case ";" : return $224(l, e, _s(s, l, e, e.eh, _0)); 

        case "}" : return $225(l, e, _s(s, l, e, e.eh, _0));
    }

    return s;
}
function $143(l, e, s= []){

    e.p = -1;

    
    if ( _27.includes(l.tx) ) {return $226(l, e, _s(s, l, e, e.eh, _0));}

    return s;
}
function $144(l, e, s= []){

    e.p = -1;

    
    if ( _28.includes(l.tx)||_17.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return (e.p = 93, s);
    }

    return s;
}
function $145(l, e, s= []){

    e.p = -1;

    
    if ( l.END||_29.includes(l.tx)||_8.includes(l.ty) ) {

        e.sp -= 3;

        var sym= s.slice(-3);

        s.splice(
            -3,
            3,
            { 

                type:"Rule",

                selectors:sym[0],

                props:new Map((null||[]).map(s=>[s.name,s])),

                pos,

                precedence:0
             }
        );

        return (e.p = 6, s);
    }

    return s;
}
function $146(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    
    switch(l.tx){

        case ";" : s = $229(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "}" : 

            e.sp -= 1;

            var sym= s.slice(-1);

            s.splice(-1, 1, sym[0]);

            return (e.p = 97, s);
        
    }

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 96 : 

                s = $227(l, e, s);

                if ( e.p<0 ) s = $228(l, e, s);

                break;
             

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![97].includes(a) ) fail(l, e);

    return s;
}
function $147(l, e, s= []){

    e.p = -1;

    
    if ( _6.includes(l.tx) ) {return $230(l, e, _s(s, l, e, e.eh, _0));}

    return s;
}
function $148(l, e, s= []){

    e.p = -1;

    
    if ( _30.includes(l.tx) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return (e.p = 95, s);
    }

    return s;
}
function $149(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_30(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 106 : s = $153(l, e, s); break; 

            case 105 : 

                s = $154(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 100 : s = $152(l, e, s); break; 

            case 98 : s = $231(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![94].includes(a) ) fail(l, e);

    return s;
}
function $150(l, e, s= []){

    e.p = -1;

    
    if ( _6.includes(l.tx) ) {return $232(l, e, _s(s, l, e, e.eh, _0));}

    return s;
}
function $151(l, e, s= []){

    e.p = -1;

    
    if ( _30.includes(l.tx) ) {

        e.sp -= 1;

        return (e.p = 94, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}
function $152(l, e, s= []){

    e.p = -1;

    
    if ( _30.includes(l.tx) ) {

        e.sp -= 1;

        return (e.p = 98, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}
function $153(l, e, s= []){

    e.p = -1;

    
    if ( _5.includes(l.tx) ) {return $233(l, e, _s(s, l, e, e.eh, _0));}

    return s;
}
function $154(l, e, s= []){

    e.p = -1;

    
    if ( _5.includes(l.tx) ) {

        e.sp -= 1;

        return (e.p = 106, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}
function $155(l, e, s= []){

    e.p = -1;

    
    if ( _11.includes(l.tx) ) {

        e.sp -= 3;

        var sym= s.slice(-3);

        s.splice(-3, 3, ([...sym[0],sym[2]]));

        return (e.p = 5, s);
    }

    return s;
}
function $156(l, e, s= []){

    e.p = -1;

    
    if ( _12.includes(l.tx)||_17.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, ([...sym[0],sym[1]]));

        return (e.p = 71, s);
    }

    return s;
}
function $157(l, e, s= []){

    e.p = -1;

    
    if ( _12.includes(l.tx)||_17.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, [sym[0],sym[1]]);

        return (e.p = 70, s);
    }

    return s;
}
function $158(l, e, s= []){

    e.p = -1;

    
    if ( _12.includes(l.tx)||_13.includes(l.ty) ) {

        e.sp -= 3;

        var sym= s.slice(-3);

        s.splice(
            -3,
            3,
            (sym[0]&&!(sym[1]||sym[2]))?sym[0]:(sym[1]&&sym[1].length==1&&!(sym[0]||sym[2]))?sym[1][0]:{ 

                type:"CompoundSelector",

                nodes:[sym[0],...sym[1],...sym[2]],

                pos
             }
        );

        return (e.p = 77, s);
    }

    return s;
}
function $168(l, e, s= []){

    e.p = -1;

    
    if ( _12.includes(l.tx)||_13.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, ([...sym[0],sym[1]]));

        return (e.p = 74, s);
    }

    return s;
}
function $171(l, e, s= []){

    e.p = -1;

    
    if ( _10.includes(l.tx) ) {return $253(l, e, _s(s, l, e, e.eh, _0));}

    return s;
}
function $173(l, e, s= []){

    e.p = -1;

    
    if ( l.END||_33.includes(l.tx)||_8.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return (e.p = 13, s);
    }

    return s;
}
function $175(l, e, s= []){

    e.p = -1;

    
    if ( _4.includes(l.tx) ) {return $256(l, e, _s(s, l, e, e.eh, _0));}

    return s;
}
function $176(l, e, s= []){

    e.p = -1;

    
    if ( _35.includes(l.tx) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, sym[0]+"");

        return (e.p = 66, s);
    }

    return s;
}
function $178(l, e, s= []){

    e.p = -1;

    
    if ( _4.includes(l.tx) ) {return $258(l, e, _s(s, l, e, e.eh, _0));}

    return s;
}
function $179(l, e, s= []){

    e.p = -1;

    
    if ( _36.includes(l.tx) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, sym[0]+"");

        return (e.p = 67, s);
    }

    return s;
}
function $182(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_5(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : 

                s = $125(l, e, s);

                if ( e.p<0 ) s = $126(l, e, s);

                break;
             

            case 61 : s = $111(l, e, s); break; 

            case 52 : s = $124(l, e, s); break; 

            case 49 : s = $123(l, e, s); break; 

            case 47 : 

                s = $116(l, e, s);

                if ( e.p<0 ) s = $117(l, e, s);

                if ( e.p<0 ) s = $118(l, e, s);

                break;
             

            case 46 : s = $113(l, e, s); break; 

            case 43 : s = $115(l, e, s); break; 

            case 40 : s = $114(l, e, s); break; 

            case 39 : s = $112(l, e, s); break; 

            case 38 : s = $109(l, e, s); break; 

            case 37 : s = $264(l, e, s); break; 

            case 35 : s = $110(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![33].includes(a) ) fail(l, e);

    return s;
}
function $183(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    
    if ( l.END ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(
            -2,
            2,
            { type:"Query", condition:sym[0], nodes:[sym[1]], pos }
        );

        return (e.p = 37, s);
    }else switch(l.tx){

        case "and" : 

            s.push($media_query_group_144_117(l, e));

            e.p = (e.FAILED)?-1:36;

            break;
         

        case "#" :  

        case "$" :  

        case "*" :  

        case "+" :  

        case "," :  

        case "-" :  

        case "." :  

        case ":" :  

        case ";" :  

        case ">" :  

        case "@" :  

        case "[" :  

        case "{" :  

        case "|" :  

        case "||" :  

        case "~" : 

            e.sp -= 2;

            var sym= s.slice(-2);

            s.splice(
                -2,
                2,
                { type:"Query", condition:sym[0], nodes:[sym[1]], pos }
            );

            return (e.p = 37, s);
         

        default : 

            switch(l.ty){

                case 255 :  

                case 2 : 

                    e.sp -= 2;

                    var sym= s.slice(-2);

                    s.splice(
                        -2,
                        2,
                        { type:"Query", condition:sym[0], nodes:[sym[1]], pos }
                    );

                    return (e.p = 37, s);
                
            }
        
    }

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 36 : s = $265(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![37].includes(a) ) fail(l, e);

    return s;
}
function $184(l, e, s= []){

    e.p = -1;

    
    if ( l.END||_22.includes(l.tx)||_8.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, { type:"Query", nodes:[sym[0],sym[1]], pos });

        return (e.p = 37, s);
    }

    return s;
}
function $186(l, e, s= []){

    e.p = -1;

    
    if ( l.END||_23.includes(l.tx)||_8.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, [sym[0],...sym[1]]);

        return (e.p = 43, s);
    }

    return s;
}
function $187(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_10(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 41 : s = $267(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![42].includes(a) ) fail(l, e);

    return s;
}
function $188(l, e, s= []){

    e.p = -1;

    
    if ( l.END||_37.includes(l.tx)||_8.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return (e.p = 42, s);
    }

    return s;
}
function $190(l, e, s= []){

    e.p = -1;

    
    if ( l.END||_23.includes(l.tx)||_8.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, [sym[0],...sym[1]]);

        return (e.p = 46, s);
    }

    return s;
}
function $191(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_11(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 44 : s = $269(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![45].includes(a) ) fail(l, e);

    return s;
}
function $192(l, e, s= []){

    e.p = -1;

    
    if ( l.END||_38.includes(l.tx)||_8.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return (e.p = 45, s);
    }

    return s;
}
function $195(l, e, s= []){

    e.p = -1;

    
    if ( _39.includes(l.tx) ) {return $271(l, e, _s(s, l, e, e.eh, _0));}

    return s;
}
function $197(l, e, s= []){e.p = -1; s = $_171(l, e, s); return s;}
function $198(l, e, s= []){e.p = -1; s = $_171(l, e, s); return s;}
function $199(l, e, s= []){e.p = -1; s = $_171(l, e, s); return s;}
function $200(l, e, s= []){

    e.p = -1;

    
    if ( _5.includes(l.tx) ) {return $273(l, e, _s(s, l, e, e.eh, _0));}

    return s;
}
function $201(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    
    switch(l.tx){

        case "<" : s = $275(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "<=" : s = $276(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "=" : s = $279(l, e, _s(s, l, e, e.eh, _0)); break; 

        case ">" : s = $277(l, e, _s(s, l, e, e.eh, _0)); break; 

        case ">=" : s = $278(l, e, _s(s, l, e, e.eh, _0)); break;
    }

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 54 : s = $274(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![57].includes(a) ) fail(l, e);

    return s;
}
function $202(l, e, s= []){e.p = -1; s = $_174(l, e, s); return s;}
function $203(l, e, s= []){

    e.p = -1;

    
    if ( [")",":","<","<=","=",">",">="].includes(l.tx) ) {

        e.sp -= 1;

        return (e.p = 60, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}
function $204(l, e, s= []){

    e.p = -1;

    
    if ( _39.includes(l.tx) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, { type:"Boolean", val:true, pos });

        return (e.p = 59, s);
    }

    return s;
}
function $205(l, e, s= []){

    e.p = -1;

    
    if ( _39.includes(l.tx) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, { type:"Boolean", val:false, pos });

        return (e.p = 59, s);
    }

    return s;
}
function $206(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    
    switch(l.tx){

        case "<" : 

            var cp= l.copy(),_sym= null;

            _sym = $275(cp, e, _s(s.slice(), cp, e, e.eh, _0));

            if ( e.p!==54 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s = $283(l, e, _s(s, l, e, e.eh, _0));

            break;
         

        case "<=" : 

            var cp= l.copy(),_sym= null;

            _sym = $276(cp, e, _s(s.slice(), cp, e, e.eh, _0));

            if ( e.p!==54 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s = $284(l, e, _s(s, l, e, e.eh, _0));

            break;
         

        case "=" : s = $279(l, e, _s(s, l, e, e.eh, _0)); break; 

        case ">" : 

            var cp= l.copy(),_sym= null;

            _sym = $277(cp, e, _s(s.slice(), cp, e, e.eh, _0));

            if ( e.p!==54 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s = $285(l, e, _s(s, l, e, e.eh, _0));

            break;
         

        case ">=" : 

            var cp= l.copy(),_sym= null;

            _sym = $278(cp, e, _s(s.slice(), cp, e, e.eh, _0));

            if ( e.p!==54 ) {e.FAILED = false; e.sp = sp;}else {s = _sym; l.sync(cp); break;}

            s = $286(l, e, _s(s, l, e, e.eh, _0));

            break;
        
    }

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 56 : s = $282(l, e, s); break; 

            case 55 : s = $281(l, e, s); break; 

            case 54 : s = $280(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![57].includes(a) ) fail(l, e);

    return s;
}
function $207(l, e, s= []){e.p = -1; s = $_174(l, e, s); return s;}
function $210(l, e, s= []){e.p = -1; s = $_174(l, e, s); return s;}
function $211(l, e, s= []){e.p = -1; s = $_174(l, e, s); return s;}
function $212(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    
    switch(l.tx){

        case ")" : s = $291(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "true" : s = $293(l, e, _s(s, l, e, e.eh, _0)); break; 

        default : 

            switch(l.ty){

                case 8 : s = $294(l, e, _s(s, l, e, e.eh, _0)); break;
            }
        
    }

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 51 : 

                s = $289(l, e, s);

                if ( e.p<0 ) s = $290(l, e, s);

                break;
             

            case 50 : s = $292(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![52].includes(a) ) fail(l, e);

    return s;
}
function $216(l, e, s= []){

    e.p = -1;

    
    if ( _41.includes(l.tx) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, [sym[0],...sym[1]]);

        return (e.p = 26, s);
    }

    return s;
}
function $217(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_7(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 24 : s = $307(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![25].includes(a) ) fail(l, e);

    return s;
}
function $218(l, e, s= []){

    e.p = -1;

    
    if ( _26.includes(l.tx) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return (e.p = 25, s);
    }

    return s;
}
function $221(l, e, s= []){

    e.p = -1;

    
    if ( _39.includes(l.tx) ) {return $310(l, e, _s(s, l, e, e.eh, _0));}

    return s;
}
function $224(l, e, s= []){

    e.p = -1;

    
    if ( _27.includes(l.tx) ) {return $313(l, e, _s(s, l, e, e.eh, _0));}

    return s;
}
function $225(l, e, s= []){

    e.p = -1;

    
    if ( l.END||_29.includes(l.tx)||_8.includes(l.ty) ) {

        e.sp -= 4;

        var sym= s.slice(-4);

        s.splice(
            -4,
            4,
            { 

                type:"Rule",

                selectors:sym[0],

                props:new Map((sym[2]||[]).map(s=>[s.name,s])),

                pos,

                precedence:0
             }
        );

        return (e.p = 6, s);
    }

    return s;
}
function $226(l, e, s= []){

    e.p = -1;

    
    if ( l.END||_29.includes(l.tx)||_8.includes(l.ty) ) {

        e.sp -= 4;

        var sym= s.slice(-4);

        s.splice(
            -4,
            4,
            { 

                type:"Rule",

                selectors:sym[0],

                props:new Map((null||[]).map(s=>[s.name,s])),

                pos,

                precedence:0
             }
        );

        return (e.p = 6, s);
    }

    return s;
}
function $227(l, e, s= []){

    e.p = -1;

    
    if ( _30.includes(l.tx) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, sym[0]);

        return (e.p = 97, s);
    }

    return s;
}
function $228(l, e, s= []){

    e.p = -1;

    
    if ( _6.includes(l.tx) ) {return $314(l, e, _s(s, l, e, e.eh, _0));}

    return s;
}
function $229(l, e, s= []){

    e.p = -1;

    
    if ( _30.includes(l.tx) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return (e.p = 96, s);
    }

    return s;
}
function $230(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_26(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 106 : s = $153(l, e, s); break; 

            case 105 : 

                s = $154(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 100 : s = $152(l, e, s); break; 

            case 98 : s = $151(l, e, s); break; 

            case 94 : s = $315(l, e, s); break; 

            case 93 : 

                s = $149(l, e, s);

                if ( e.p<0 ) s = $150(l, e, s);

                break;
             

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![95].includes(a) ) fail(l, e);

    return s;
}
function $231(l, e, s= []){

    e.p = -1;

    
    if ( _30.includes(l.tx) ) {

        e.sp -= 2;

        return (e.p = 94, (s.splice(-2, 2, s[s.length-1]), s));
    }

    return s;
}
function $232(l, e, s= []){

    e.p = -1;

    
    if ( _28.includes(l.tx)||_17.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, ([...sym[0],sym[1]]));

        return (e.p = 93, s);
    }

    return s;
}
function $233(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_29(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 109 : 

                s = $318(l, e, s);

                if ( e.p<0 ) s = $319(l, e, s);

                break;
             

            case 107 : s = $320(l, e, s); break; 

            case 103 : 

                s = $316(l, e, s);

                if ( e.p<0 ) s = $317(l, e, s);

                break;
             

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![100].includes(a) ) fail(l, e);

    return s;
}
function $239(l, e, s= []){

    e.p = -1;

    
    if ( _43.includes(l.tx)||_44.includes(l.ty) ) {

        e.sp -= 1;

        return (e.p = 129, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}
function $240(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_35(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 127 : s = $337(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![128].includes(a) ) fail(l, e);

    return s;
}
function $241(l, e, s= []){

    e.p = -1;

    
    if ( _43.includes(l.tx)||_44.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, sym[0]+"");

        return (e.p = 128, s);
    }

    return s;
}
function $242(l, e, s= []){e.p = -1; s = $_202(l, e, s); return s;}
function $243(l, e, s= []){

    e.p = -1;

    
    switch(l.tx){

        case "true" : return $338(l, e, _s(s, l, e, e.eh, _0)); 

        case "\"" :  

        case "'" :  

        case ")" :  

        case "-" :  

        case "/" :  

        case "'\'" :  

        case "_" : 

            e.sp -= 1;

            return (e.p = 127, (s.splice(-1, 1, s[s.length-1]), s));
         

        default : 

            switch(l.ty){

                case 32 :  

                case 2 :  

                case 1 :  

                case 16 :  

                case 128 :  

                case 8 : 

                    e.sp -= 1;

                    return (e.p = 127, (s.splice(-1, 1, s[s.length-1]), s));
                
            }
        
    }

    return s;
}
function $244(l, e, s= []){e.p = -1; s = $_202(l, e, s); return s;}
function $245(l, e, s= []){e.p = -1; s = $_202(l, e, s); return s;}
function $246(l, e, s= []){e.p = -1; s = $_202(l, e, s); return s;}
function $247(l, e, s= []){e.p = -1; s = $_202(l, e, s); return s;}
function $248(l, e, s= []){e.p = -1; s = $_202(l, e, s); return s;}
function $249(l, e, s= []){e.p = -1; s = $_202(l, e, s); return s;}
function $250(l, e, s= []){e.p = -1; s = $_202(l, e, s); return s;}
function $251(l, e, s= []){e.p = -1; s = $_202(l, e, s); return s;}
function $253(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_5(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : 

                s = $125(l, e, s);

                if ( e.p<0 ) s = $126(l, e, s);

                break;
             

            case 61 : s = $111(l, e, s); break; 

            case 52 : s = $124(l, e, s); break; 

            case 49 : s = $123(l, e, s); break; 

            case 47 : 

                s = $116(l, e, s);

                if ( e.p<0 ) s = $117(l, e, s);

                if ( e.p<0 ) s = $118(l, e, s);

                break;
             

            case 46 : s = $113(l, e, s); break; 

            case 43 : s = $115(l, e, s); break; 

            case 40 : s = $114(l, e, s); break; 

            case 39 : s = $112(l, e, s); break; 

            case 38 : s = $109(l, e, s); break; 

            case 37 : s = $339(l, e, s); break; 

            case 35 : s = $110(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![13].includes(a) ) fail(l, e);

    return s;
}
function $256(l, e, s= []){

    e.p = -1;

    
    if ( _35.includes(l.tx) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, sym[0]+sym[1]);

        return (e.p = 66, s);
    }

    return s;
}
function $258(l, e, s= []){

    e.p = -1;

    
    if ( _36.includes(l.tx) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, sym[0]+sym[1]);

        return (e.p = 67, s);
    }

    return s;
}
function $261(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_81(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : 

                s = $28(l, e, s);

                if ( e.p<0 ) s = $29(l, e, s);

                break;
             

            case 92 : s = $48(l, e, s); break; 

            case 91 : s = $18(l, e, s); break; 

            case 88 : s = $40(l, e, s); break; 

            case 86 : s = $41(l, e, s); break; 

            case 84 : s = $39(l, e, s); break; 

            case 83 : s = $38(l, e, s); break; 

            case 82 : s = $37(l, e, s); break; 

            case 81 : s = $23(l, e, s); break; 

            case 80 : 

                s = $24(l, e, s);

                if ( e.p<0 ) s = $25(l, e, s);

                break;
             

            case 79 : s = $30(l, e, s); break; 

            case 77 : s = $17(l, e, s); break; 

            case 76 : 

                s = $21(l, e, s);

                if ( e.p<0 ) s = $22(l, e, s);

                break;
             

            case 75 : s = $47(l, e, s); break; 

            case 73 : 

                s = $19(l, e, s);

                if ( e.p<0 ) s = $20(l, e, s);

                break;
             

            case 72 : s = $16(l, e, s); break; 

            case 6 : s = $346(l, e, s); break; 

            case 5 : 

                s = $14(l, e, s);

                if ( e.p<0 ) s = $15(l, e, s);

                break;
             

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![8].includes(a) ) fail(l, e);

    return s;
}
function $263(l, e, s= []){

    e.p = -1;

    
    if ( _46.includes(l.tx)||_17.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return (e.p = 8, s);
    }

    return s;
}
function $264(l, e, s= []){

    e.p = -1;

    
    if ( _11.includes(l.tx) ) {

        e.sp -= 3;

        var sym= s.slice(-3);

        s.splice(-3, 3, ([...sym[0],sym[2]]));

        return (e.p = 33, s);
    }

    return s;
}
function $265(l, e, s= []){

    e.p = -1;

    
    if ( l.END||_22.includes(l.tx)||_8.includes(l.ty) ) {

        e.sp -= 3;

        var sym= s.slice(-3);

        s.splice(
            -3,
            3,
            { 

                type:"Query",

                condition:sym[0],

                nodes:[sym[1],sym[2]],

                pos
             }
        );

        return (e.p = 37, s);
    }

    return s;
}
function $267(l, e, s= []){

    e.p = -1;

    
    if ( l.END||_37.includes(l.tx)||_8.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, ([...sym[0],sym[1]]));

        return (e.p = 42, s);
    }

    return s;
}
function $269(l, e, s= []){

    e.p = -1;

    
    if ( l.END||_38.includes(l.tx)||_8.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, ([...sym[0],sym[1]]));

        return (e.p = 45, s);
    }

    return s;
}
function $271(l, e, s= []){

    e.p = -1;

    
    if ( l.END||_25.includes(l.tx)||_8.includes(l.ty) ) {

        e.sp -= 3;

        var sym= s.slice(-3);

        s.splice(-3, 3, { type:"Parenthesis", nodes:[sym[1]], pos });

        return (e.p = 47, s);
    }

    return s;
}
function $273(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_15(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : s = $203(l, e, s); break; 

            case 64 : s = $210(l, e, s); break; 

            case 62 : s = $211(l, e, s); break; 

            case 60 : s = $202(l, e, s); break; 

            case 58 : s = $347(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![53].includes(a) ) fail(l, e);

    return s;
}
function $274(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_15(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : s = $203(l, e, s); break; 

            case 64 : s = $210(l, e, s); break; 

            case 62 : s = $211(l, e, s); break; 

            case 60 : s = $202(l, e, s); break; 

            case 58 : s = $348(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![57].includes(a) ) fail(l, e);

    return s;
}
function $275(l, e, s= []){e.p = -1; s = $_222(l, e, s); return s;}
function $276(l, e, s= []){e.p = -1; s = $_222(l, e, s); return s;}
function $277(l, e, s= []){e.p = -1; s = $_222(l, e, s); return s;}
function $278(l, e, s= []){e.p = -1; s = $_222(l, e, s); return s;}
function $279(l, e, s= []){e.p = -1; s = $_222(l, e, s); return s;}
function $280(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_30(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : s = $203(l, e, s); break; 

            case 60 : s = $349(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![57].includes(a) ) fail(l, e);

    return s;
}
function $281(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_30(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : s = $350(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![57].includes(a) ) fail(l, e);

    return s;
}
function $282(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_30(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : s = $351(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![57].includes(a) ) fail(l, e);

    return s;
}
function $283(l, e, s= []){e.p = -1; s = $_223(l, e, s); return s;}
function $284(l, e, s= []){e.p = -1; s = $_223(l, e, s); return s;}
function $285(l, e, s= []){e.p = -1; s = $_224(l, e, s); return s;}
function $286(l, e, s= []){e.p = -1; s = $_224(l, e, s); return s;}
function $289(l, e, s= []){

    e.p = -1;

    
    if ( _39.includes(l.tx) ) {return $353(l, e, _s(s, l, e, e.eh, _0));}

    return s;
}
function $290(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_14(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 50 : s = $354(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![51].includes(a) ) fail(l, e);

    return s;
}
function $291(l, e, s= []){

    e.p = -1;

    
    if ( l.END||_25.includes(l.tx)||_8.includes(l.ty) ) {

        e.sp -= 3;

        return (e.p = 52, (s.splice(-3, 3, s[s.length-1]), s));
    }

    return s;
}
function $292(l, e, s= []){

    e.p = -1;

    
    if ( _49.includes(l.tx)||_50.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, sym[0]+"");

        return (e.p = 51, s);
    }

    return s;
}
function $293(l, e, s= []){e.p = -1; s = $_230(l, e, s); return s;}
function $294(l, e, s= []){e.p = -1; s = $_230(l, e, s); return s;}
function $296(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_6(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 63 : s = $303(l, e, s); break; 

            case 21 : s = $300(l, e, s); break; 

            case 20 : s = $356(l, e, s); break; 

            case 19 : 

                s = $298(l, e, s);

                if ( e.p<0 ) s = $299(l, e, s);

                break;
             

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![16].includes(a) ) fail(l, e);

    return s;
}
function $297(l, e, s= []){

    e.p = -1;

    
    if ( _51.includes(l.tx)||_48.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return (e.p = 16, s);
    }

    return s;
}
function $298(l, e, s= []){

    e.p = -1;

    
    if ( _9.includes(l.tx) ) {return $357(l, e, _s(s, l, e, e.eh, _0));}

    return s;
}
function $299(l, e, s= []){

    e.p = -1;

    
    if ( _10.includes(l.tx) ) {return $358(l, e, _s(s, l, e, e.eh, _0));}

    return s;
}
function $300(l, e, s= []){

    e.p = -1;

    
    if ( _11.includes(l.tx) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return (e.p = 19, s);
    }

    return s;
}
function $301(l, e, s= []){e.p = -1; s = $_236(l, e, s); return s;}
function $302(l, e, s= []){e.p = -1; s = $_236(l, e, s); return s;}
function $303(l, e, s= []){e.p = -1; s = $_236(l, e, s); return s;}
function $307(l, e, s= []){

    e.p = -1;

    
    if ( _26.includes(l.tx) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, ([...sym[0],sym[1]]));

        return (e.p = 25, s);
    }

    return s;
}
function $310(l, e, s= []){

    e.p = -1;

    
    if ( _26.includes(l.tx) ) {

        e.sp -= 3;

        var sym= s.slice(-3);

        s.splice(-3, 3, { type:"Parenthesis", nodes:[sym[1]], pos });

        return (e.p = 27, s);
    }

    return s;
}
function $313(l, e, s= []){

    e.p = -1;

    
    if ( l.END||_29.includes(l.tx)||_8.includes(l.ty) ) {

        e.sp -= 5;

        var sym= s.slice(-5);

        s.splice(
            -5,
            5,
            { 

                type:"Rule",

                selectors:sym[0],

                props:new Map((sym[2]||[]).map(s=>[s.name,s])),

                pos,

                precedence:0
             }
        );

        return (e.p = 6, s);
    }

    return s;
}
function $314(l, e, s= []){

    e.p = -1;

    
    if ( _30.includes(l.tx) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, ([...sym[0],sym[1]]));

        return (e.p = 96, s);
    }

    return s;
}
function $315(l, e, s= []){

    e.p = -1;

    
    if ( _30.includes(l.tx) ) {

        e.sp -= 3;

        var sym= s.slice(-3);

        s.splice(-3, 3, ([...sym[0],sym[2]]));

        return (e.p = 95, s);
    }

    return s;
}
function $316(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    
    switch(l.tx){

        case "!" : 

            s.push($declaration_group_1141_144(l, e));

            e.p = (e.FAILED)?-1:99;

            break;
         

        case ")" :  

        case ";" :  

        case "}" : 

            e.sp -= 3;

            var sym= s.slice(-3);

            s.splice(
                -3,
                3,
                { type:"Declaration", name:sym[0], val:sym[2] }
            );

            return (e.p = 100, s);
        
    }

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 99 : s = $362(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![100].includes(a) ) fail(l, e);

    return s;
}
function $317(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    
    switch(l.tx){

        case "(" : s = $364(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "-" : s = $321(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "'\'" : s = $330(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "_" : s = $322(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "true" : s = $323(l, e, _s(s, l, e, e.eh, _0)); break; 

        default : 

            switch(l.ty){

                case 32 : s = $328(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 2 : s = $325(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 1 : s = $324(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 16 : s = $327(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 64 : s = $329(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 128 : s = $326(l, e, _s(s, l, e, e.eh, _0)); break; 

                case 8 : s = $366(l, e, _s(s, l, e, e.eh, _0)); break;
            }
        
    }

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 109 : 

                s = $365(l, e, s);

                if ( e.p<0 ) s = $319(l, e, s);

                break;
             

            case 107 : s = $320(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![103].includes(a) ) fail(l, e);

    return s;
}
function $318(l, e, s= []){

    e.p = -1;

    
    if ( _52.includes(l.tx)||_53.includes(l.ty) ) {

        e.sp -= 1;

        return (e.p = 103, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}
function $319(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_29(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 107 : s = $367(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![109].includes(a) ) fail(l, e);

    return s;
}
function $320(l, e, s= []){

    e.p = -1;

    
    if ( _52.includes(l.tx)||_53.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, sym[0]+"");

        return (e.p = 109, s);
    }

    return s;
}
function $321(l, e, s= []){e.p = -1; s = $_253(l, e, s); return s;}
function $322(l, e, s= []){e.p = -1; s = $_253(l, e, s); return s;}
function $323(l, e, s= []){e.p = -1; s = $_253(l, e, s); return s;}
function $324(l, e, s= []){e.p = -1; s = $_253(l, e, s); return s;}
function $325(l, e, s= []){e.p = -1; s = $_253(l, e, s); return s;}
function $326(l, e, s= []){e.p = -1; s = $_253(l, e, s); return s;}
function $327(l, e, s= []){e.p = -1; s = $_253(l, e, s); return s;}
function $328(l, e, s= []){e.p = -1; s = $_253(l, e, s); return s;}
function $329(l, e, s= []){e.p = -1; s = $_253(l, e, s); return s;}
function $330(l, e, s= []){

    e.p = -1;

    
    if ( _4.includes(l.tx) ) {return $368(l, e, _s(s, l, e, e.eh, _0));}

    return s;
}
function $337(l, e, s= []){

    e.p = -1;

    
    if ( _43.includes(l.tx)||_44.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, sym[0]+sym[1]);

        return (e.p = 128, s);
    }

    return s;
}
function $338(l, e, s= []){

    e.p = -1;

    
    if ( _43.includes(l.tx)||_44.includes(l.ty) ) {

        e.sp -= 2;

        return (e.p = 127, (s.splice(-2, 2, s[s.length-1]), s));
    }

    return s;
}
function $339(l, e, s= []){

    e.p = -1;

    
    if ( l.END||_33.includes(l.tx)||_8.includes(l.ty) ) {

        e.sp -= 3;

        var sym= s.slice(-3);

        s.splice(-3, 3, ([...sym[0],sym[2]]));

        return (e.p = 13, s);
    }

    return s;
}
function $341(l, e, s= []){e.p = -1; s = $_264(l, e, s); return s;}
function $342(l, e, s= []){e.p = -1; s = $_264(l, e, s); return s;}
function $343(l, e, s= []){

    e.p = -1;

    
    if ( _39.includes(l.tx) ) {

        e.sp -= 1;

        return (e.p = 15, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}
function $346(l, e, s= []){

    e.p = -1;

    
    if ( _46.includes(l.tx)||_17.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, ([...sym[0],sym[1]]));

        return (e.p = 8, s);
    }

    return s;
}
function $347(l, e, s= []){

    e.p = -1;

    
    if ( _39.includes(l.tx) ) {

        e.sp -= 3;

        var sym= s.slice(-3);

        s.splice(
            -3,
            3,
            { type:"MediaValue", key:sym[0], val:sym[2], pos }
        );

        return (e.p = 53, s);
    }

    return s;
}
function $348(l, e, s= []){e.p = -1; s = $_270(l, e, s); return s;}
function $349(l, e, s= []){e.p = -1; s = $_270(l, e, s); return s;}
function $350(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    
    switch(l.tx){

        case ">" : s = $285(l, e, _s(s, l, e, e.eh, _0)); break; 

        case ">=" : s = $286(l, e, _s(s, l, e, e.eh, _0)); break;
    }

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 55 : s = $372(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![57].includes(a) ) fail(l, e);

    return s;
}
function $351(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    
    switch(l.tx){

        case "<" : s = $283(l, e, _s(s, l, e, e.eh, _0)); break; 

        case "<=" : s = $284(l, e, _s(s, l, e, e.eh, _0)); break;
    }

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 56 : s = $373(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![57].includes(a) ) fail(l, e);

    return s;
}
function $353(l, e, s= []){

    e.p = -1;

    
    if ( l.END||_25.includes(l.tx)||_8.includes(l.ty) ) {

        e.sp -= 4;

        return (e.p = 52, (s.splice(-4, 4, s[s.length-1]), s));
    }

    return s;
}
function $354(l, e, s= []){

    e.p = -1;

    
    if ( _49.includes(l.tx)||_50.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, sym[0]+sym[1]);

        return (e.p = 51, s);
    }

    return s;
}
function $356(l, e, s= []){

    e.p = -1;

    
    if ( _51.includes(l.tx)||_48.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, ([...sym[0],sym[1]]));

        return (e.p = 16, s);
    }

    return s;
}
function $357(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_26(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 106 : s = $153(l, e, s); break; 

            case 105 : 

                s = $154(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 100 : s = $152(l, e, s); break; 

            case 98 : s = $151(l, e, s); break; 

            case 97 : s = $374(l, e, s); break; 

            case 95 : 

                s = $146(l, e, s);

                if ( e.p<0 ) s = $147(l, e, s);

                break;
             

            case 94 : s = $148(l, e, s); break; 

            case 93 : 

                s = $149(l, e, s);

                if ( e.p<0 ) s = $150(l, e, s);

                break;
             

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![20].includes(a) ) fail(l, e);

    return s;
}
function $358(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_6(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 63 : s = $303(l, e, s); break; 

            case 21 : s = $375(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![19].includes(a) ) fail(l, e);

    return s;
}
function $362(l, e, s= []){

    e.p = -1;

    
    if ( _55.includes(l.tx) ) {

        e.sp -= 4;

        var sym= s.slice(-4);

        s.splice(
            -4,
            4,
            { 

                type:"Declaration",

                name:sym[0],

                val:sym[2],

                IMPORTANT:!!sym[3]
             }
        );

        return (e.p = 100, s);
    }

    return s;
}
function $364(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_283(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 109 : 

                s = $318(l, e, s);

                if ( e.p<0 ) s = $319(l, e, s);

                break;
             

            case 107 : s = $320(l, e, s); break; 

            case 103 : 

                s = $381(l, e, s);

                if ( e.p<0 ) s = $317(l, e, s);

                break;
             

            case 102 : 

                s = $377(l, e, s);

                if ( e.p<0 ) s = $378(l, e, s);

                break;
             

            case 101 : s = $379(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![103].includes(a) ) fail(l, e);

    return s;
}
function $365(l, e, s= []){e.p = -1; s = $_284(l, e, s); return s;}
function $366(l, e, s= []){e.p = -1; s = $_284(l, e, s); return s;}
function $367(l, e, s= []){

    e.p = -1;

    
    if ( _52.includes(l.tx)||_53.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, sym[0]+sym[1]);

        return (e.p = 109, s);
    }

    return s;
}
function $368(l, e, s= []){

    e.p = -1;

    
    if ( _52.includes(l.tx)||_53.includes(l.ty) ) {

        e.sp -= 2;

        return (e.p = 107, (s.splice(-2, 2, s[s.length-1]), s));
    }

    return s;
}
function $372(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_15(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : s = $203(l, e, s); break; 

            case 64 : s = $210(l, e, s); break; 

            case 62 : s = $211(l, e, s); break; 

            case 60 : s = $202(l, e, s); break; 

            case 58 : s = $382(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![57].includes(a) ) fail(l, e);

    return s;
}
function $373(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_15(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : s = $203(l, e, s); break; 

            case 64 : s = $210(l, e, s); break; 

            case 62 : s = $211(l, e, s); break; 

            case 60 : s = $202(l, e, s); break; 

            case 58 : s = $383(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![57].includes(a) ) fail(l, e);

    return s;
}
function $374(l, e, s= []){

    e.p = -1;

    
    switch(l.tx){

        case ";" : return $384(l, e, _s(s, l, e, e.eh, _0)); 

        case "}" : return $385(l, e, _s(s, l, e, e.eh, _0));
    }

    return s;
}
function $375(l, e, s= []){

    e.p = -1;

    
    if ( _11.includes(l.tx) ) {

        e.sp -= 3;

        var sym= s.slice(-3);

        s.splice(-3, 3, ([...sym[0],sym[2]]));

        return (e.p = 19, s);
    }

    return s;
}
function $377(l, e, s= []){

    e.p = -1;

    
    if ( _39.includes(l.tx) ) {return $386(l, e, _s(s, l, e, e.eh, _0));}

    return s;
}
function $378(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_283(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 109 : 

                s = $318(l, e, s);

                if ( e.p<0 ) s = $319(l, e, s);

                break;
             

            case 107 : s = $320(l, e, s); break; 

            case 103 : 

                s = $381(l, e, s);

                if ( e.p<0 ) s = $317(l, e, s);

                break;
             

            case 101 : s = $387(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![102].includes(a) ) fail(l, e);

    return s;
}
function $379(l, e, s= []){

    e.p = -1;

    
    if ( _56.includes(l.tx)||_53.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, sym[0]+"");

        return (e.p = 102, s);
    }

    return s;
}
function $380(l, e, s= []){e.p = -1; s = $_295(l, e, s); return s;}
function $381(l, e, s= []){e.p = -1; s = $_295(l, e, s); return s;}
function $382(l, e, s= []){

    e.p = -1;

    
    if ( _39.includes(l.tx) ) {

        e.sp -= 5;

        var sym= s.slice(-5);

        s.splice(
            -5,
            5,
            { 

                type:"MediaRangeDescending",

                sym:sym[1],

                max:sym[0],

                id:sym[2],

                min:sym[4],

                pos
             }
        );

        return (e.p = 57, s);
    }

    return s;
}
function $383(l, e, s= []){

    e.p = -1;

    
    if ( _39.includes(l.tx) ) {

        e.sp -= 5;

        var sym= s.slice(-5);

        s.splice(
            -5,
            5,
            { 

                type:"MediaRangeAscending",

                sym:sym[1],

                min:sym[0],

                id:sym[2],

                max:sym[4],

                pos
             }
        );

        return (e.p = 57, s);
    }

    return s;
}
function $384(l, e, s= []){

    e.p = -1;

    
    if ( _27.includes(l.tx) ) {return $388(l, e, _s(s, l, e, e.eh, _0));}

    return s;
}
function $385(l, e, s= []){

    e.p = -1;

    
    if ( _51.includes(l.tx)||_48.includes(l.ty) ) {

        e.sp -= 4;

        var sym= s.slice(-4);

        s.splice(
            -4,
            4,
            { 

                type:"KeyframeBlock",

                nodes:[{ type:"KeyframeSelectors", nodes:sym[0], pos },sym[2]],

                pos
             }
        );

        return (e.p = 20, s);
    }

    return s;
}
function $386(l, e, s= []){

    e.p = -1;

    
    if ( _52.includes(l.tx)||_53.includes(l.ty) ) {

        e.sp -= 4;

        var sym= s.slice(-4);

        s.splice(-4, 4, sym[0]+sym[1]+sym[2]+sym[3]);

        return (e.p = 103, s);
    }

    return s;
}
function $387(l, e, s= []){

    e.p = -1;

    
    if ( _56.includes(l.tx)||_53.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, sym[0]+sym[1]);

        return (e.p = 102, s);
    }

    return s;
}
function $388(l, e, s= []){

    e.p = -1;

    
    if ( _51.includes(l.tx)||_48.includes(l.ty) ) {

        e.sp -= 5;

        var sym= s.slice(-5);

        s.splice(
            -5,
            5,
            { 

                type:"KeyframeBlock",

                nodes:[{ type:"KeyframeSelectors", nodes:sym[0], pos },sym[2]],

                pos
             }
        );

        return (e.p = 20, s);
    }

    return s;
}
function $389(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_81(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : 

                s = $28(l, e, s);

                if ( e.p<0 ) s = $29(l, e, s);

                break;
             

            case 92 : s = $48(l, e, s); break; 

            case 91 : s = $18(l, e, s); break; 

            case 88 : s = $40(l, e, s); break; 

            case 86 : s = $41(l, e, s); break; 

            case 84 : s = $39(l, e, s); break; 

            case 83 : s = $38(l, e, s); break; 

            case 82 : s = $37(l, e, s); break; 

            case 81 : s = $23(l, e, s); break; 

            case 80 : 

                s = $24(l, e, s);

                if ( e.p<0 ) s = $25(l, e, s);

                break;
             

            case 79 : s = $30(l, e, s); break; 

            case 77 : s = $17(l, e, s); break; 

            case 76 : 

                s = $21(l, e, s);

                if ( e.p<0 ) s = $22(l, e, s);

                break;
             

            case 75 : s = $47(l, e, s); break; 

            case 73 : 

                s = $19(l, e, s);

                if ( e.p<0 ) s = $20(l, e, s);

                break;
             

            case 72 : s = $16(l, e, s); break; 

            case 6 : s = $391(l, e, s); break; 

            case 5 : 

                s = $14(l, e, s);

                if ( e.p<0 ) s = $15(l, e, s);

                break;
             

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![7].includes(a) ) fail(l, e);

    return s;
}
function $390(l, e, s= []){

    e.p = -1;

    
    if ( _57.includes(l.tx)||_17.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return (e.p = 7, s);
    }

    return s;
}
function $391(l, e, s= []){

    e.p = -1;

    
    if ( _57.includes(l.tx)||_17.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, ([...sym[0],sym[1]]));

        return (e.p = 7, s);
    }

    return s;
}
function $392(l, e, s= []){

    e.p = -1;

    
    if ( _10.includes(l.tx) ) {return $394(l, e, _s(s, l, e, e.eh, _0));}

    return s;
}
function $393(l, e, s= []){

    e.p = -1;

    
    if ( _10.includes(l.tx) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return (e.p = 32, s);
    }

    return s;
}
function $394(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_5(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 105 : 

                s = $32(l, e, s);

                if ( e.p<0 ) s = $33(l, e, s);

                break;
             

            case 104 : 

                s = $125(l, e, s);

                if ( e.p<0 ) s = $126(l, e, s);

                break;
             

            case 61 : s = $111(l, e, s); break; 

            case 52 : s = $124(l, e, s); break; 

            case 49 : s = $123(l, e, s); break; 

            case 47 : 

                s = $116(l, e, s);

                if ( e.p<0 ) s = $117(l, e, s);

                if ( e.p<0 ) s = $118(l, e, s);

                break;
             

            case 46 : s = $113(l, e, s); break; 

            case 43 : s = $115(l, e, s); break; 

            case 40 : s = $114(l, e, s); break; 

            case 39 : s = $112(l, e, s); break; 

            case 38 : s = $109(l, e, s); break; 

            case 37 : s = $395(l, e, s); break; 

            case 35 : s = $110(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![32].includes(a) ) fail(l, e);

    return s;
}
function $395(l, e, s= []){

    e.p = -1;

    
    if ( _10.includes(l.tx) ) {

        e.sp -= 3;

        var sym= s.slice(-3);

        s.splice(-3, 3, ([...sym[0],sym[2]]));

        return (e.p = 32, s);
    }

    return s;
}
function $396(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_29(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 107 : s = $398(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![108].includes(a) ) fail(l, e);

    return s;
}
function $397(l, e, s= []){

    e.p = -1;

    
    if ( _58.includes(l.tx)||_59.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, sym[0]+"");

        return (e.p = 108, s);
    }

    return s;
}
function $398(l, e, s= []){

    e.p = -1;

    
    if ( _58.includes(l.tx)||_59.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, sym[0]+sym[1]);

        return (e.p = 108, s);
    }

    return s;
}
function $399(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_32(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 133 : 

                s = $426(l, e, s);

                if ( e.p<0 ) s = $427(l, e, s);

                break;
             

            case 132 : s = $407(l, e, s); break; 

            case 131 : 

                s = $420(l, e, s);

                if ( e.p<0 ) s = $421(l, e, s);

                break;
             

            case 130 : s = $406(l, e, s); break; 

            case 122 : s = $401(l, e, s); break; 

            case 121 : s = $418(l, e, s); break; 

            case 120 : s = $417(l, e, s); break; 

            case 119 : s = $415(l, e, s); break; 

            case 118 : s = $405(l, e, s); break; 

            case 117 : s = $404(l, e, s); break; 

            case 116 : s = $403(l, e, s); break; 

            case 115 : s = $402(l, e, s); break; 

            case 113 : s = $428(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![111].includes(a) ) fail(l, e);

    return s;
}
function $400(l, e, s= []){

    e.p = -1;

    
    if ( _60.includes(l.tx)||_61.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return (e.p = 111, s);
    }

    return s;
}
function $401(l, e, s= []){e.p = -1; s = $_311(l, e, s); return s;}
function $402(l, e, s= []){e.p = -1; s = $_311(l, e, s); return s;}
function $403(l, e, s= []){e.p = -1; s = $_311(l, e, s); return s;}
function $404(l, e, s= []){e.p = -1; s = $_311(l, e, s); return s;}
function $405(l, e, s= []){e.p = -1; s = $_311(l, e, s); return s;}
function $406(l, e, s= []){e.p = -1; s = $_311(l, e, s); return s;}
function $407(l, e, s= []){e.p = -1; s = $_311(l, e, s); return s;}
function $408(l, e, s= []){

    e.p = -1;

    
    if ( _60.includes(l.tx)||_61.includes(l.ty) ) {

        e.sp -= 1;

        return (e.p = 122, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}
function $409(l, e, s= []){e.p = -1; s = $_313(l, e, s); return s;}
function $410(l, e, s= []){e.p = -1; s = $_314(l, e, s); return s;}
function $411(l, e, s= []){

    e.p = -1;

    
    if ( _60.includes(l.tx)||_61.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(
            -1,
            1,
            { 

                val:parseFloat(sym[0]),

                type:"hex",

                original_val:sym[0]
             }
        );

        return (e.p = 115, s);
    }

    return s;
}
function $412(l, e, s= []){

    e.p = -1;

    
    if ( _60.includes(l.tx)||_61.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(
            -1,
            1,
            { 

                val:parseFloat(sym[0]),

                type:"bin",

                original_val:sym[0]
             }
        );

        return (e.p = 116, s);
    }

    return s;
}
function $413(l, e, s= []){

    e.p = -1;

    
    if ( _60.includes(l.tx)||_61.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(
            -1,
            1,
            { 

                val:parseFloat(sym[0]),

                type:"oct",

                original_val:sym[0]
             }
        );

        return (e.p = 117, s);
    }

    return s;
}
function $414(l, e, s= []){

    e.p = -1;

    
    if ( _60.includes(l.tx)||_61.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(
            -1,
            1,
            { 

                val:parseFloat(sym[0]),

                type:"sci",

                original_val:sym[0]
             }
        );

        return (e.p = 118, s);
    }

    return s;
}
function $415(l, e, s= []){

    e.p = -1;

    
    if ( _60.includes(l.tx)||_61.includes(l.ty) ) {

        e.sp -= 1;

        return (e.p = 118, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}
function $416(l, e, s= []){

    e.p = -1;

    
    if ( _60.includes(l.tx)||_61.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(
            -1,
            1,
            { 

                val:parseFloat(sym[0]),

                type:"flt",

                original_val:sym[0]
             }
        );

        return (e.p = 119, s);
    }

    return s;
}
function $417(l, e, s= []){

    e.p = -1;

    
    if ( _60.includes(l.tx)||_61.includes(l.ty) ) {

        e.sp -= 1;

        return (e.p = 119, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}
function $418(l, e, s= []){

    e.p = -1;

    
    if ( _60.includes(l.tx)||_61.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(
            -1,
            1,
            { 

                val:parseFloat(sym[0]),

                type:"int",

                original_val:sym[0]
             }
        );

        return (e.p = 120, s);
    }

    return s;
}
function $419(l, e, s= []){

    e.p = -1;

    
    if ( _60.includes(l.tx)||_61.includes(l.ty) ) {

        e.sp -= 1;

        return (e.p = 121, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}
function $420(l, e, s= []){

    e.p = -1;

    
    if ( _60.includes(l.tx)||_63.includes(l.ty) ) {

        e.sp -= 1;

        return (e.p = 130, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}
function $421(l, e, s= []){

    e.p = -1;

    
    switch(l.tx){

        case "$" : return $432(l, e, _s(s, l, e, e.eh, _0)); 

        case "_" : return $431(l, e, _s(s, l, e, e.eh, _0)); 

        case "keyword" : return $430(l, e, _s(s, l, e, e.eh, _0)); 

        default : 

            switch(l.ty){

                case 1025 : return $435(l, e, _s(s, l, e, e.eh, _0)); 

                case 4097 : return $434(l, e, _s(s, l, e, e.eh, _0)); 

                case 2 : return $429(l, e, _s(s, l, e, e.eh, _0)); 

                case 1 : return $433(l, e, _s(s, l, e, e.eh, _0)); 

                case 2049 : return $436(l, e, _s(s, l, e, e.eh, _0));
            }
        
    }

    return s;
}
function $422(l, e, s= []){e.p = -1; s = $_313(l, e, s); return s;}
function $423(l, e, s= []){e.p = -1; s = $_314(l, e, s); return s;}
function $424(l, e, s= []){e.p = -1; s = $_313(l, e, s); return s;}
function $425(l, e, s= []){e.p = -1; s = $_314(l, e, s); return s;}
function $426(l, e, s= []){

    e.p = -1;

    
    if ( _60.includes(l.tx)||_63.includes(l.ty) ) {

        e.sp -= 1;

        return (e.p = 132, (s.splice(-1, 1, s[s.length-1]), s));
    }

    return s;
}
function $427(l, e, s= []){

    e.p = -1;

    
    switch(l.tx){

        case "$" : return $441(l, e, _s(s, l, e, e.eh, _0)); 

        case "-" : return $440(l, e, _s(s, l, e, e.eh, _0)); 

        case "_" : return $439(l, e, _s(s, l, e, e.eh, _0)); 

        case "keyword" : return $438(l, e, _s(s, l, e, e.eh, _0)); 

        default : 

            switch(l.ty){

                case 1025 : return $444(l, e, _s(s, l, e, e.eh, _0)); 

                case 4097 : return $443(l, e, _s(s, l, e, e.eh, _0)); 

                case 2 : return $437(l, e, _s(s, l, e, e.eh, _0)); 

                case 1 : return $442(l, e, _s(s, l, e, e.eh, _0)); 

                case 2049 : return $445(l, e, _s(s, l, e, e.eh, _0));
            }
        
    }

    return s;
}
function $428(l, e, s= []){

    e.p = -1;

    
    if ( _60.includes(l.tx)||_61.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, ([...sym[0],sym[1]]));

        return (e.p = 111, s);
    }

    return s;
}
function $429(l, e, s= []){e.p = -1; s = $_329(l, e, s); return s;}
function $430(l, e, s= []){e.p = -1; s = $_329(l, e, s); return s;}
function $431(l, e, s= []){e.p = -1; s = $_329(l, e, s); return s;}
function $432(l, e, s= []){e.p = -1; s = $_329(l, e, s); return s;}
function $433(l, e, s= []){e.p = -1; s = $_329(l, e, s); return s;}
function $434(l, e, s= []){e.p = -1; s = $_329(l, e, s); return s;}
function $435(l, e, s= []){e.p = -1; s = $_329(l, e, s); return s;}
function $436(l, e, s= []){e.p = -1; s = $_329(l, e, s); return s;}
function $437(l, e, s= []){e.p = -1; s = $_330(l, e, s); return s;}
function $438(l, e, s= []){e.p = -1; s = $_330(l, e, s); return s;}
function $439(l, e, s= []){e.p = -1; s = $_330(l, e, s); return s;}
function $440(l, e, s= []){e.p = -1; s = $_330(l, e, s); return s;}
function $441(l, e, s= []){e.p = -1; s = $_330(l, e, s); return s;}
function $442(l, e, s= []){e.p = -1; s = $_330(l, e, s); return s;}
function $443(l, e, s= []){e.p = -1; s = $_330(l, e, s); return s;}
function $444(l, e, s= []){e.p = -1; s = $_330(l, e, s); return s;}
function $445(l, e, s= []){e.p = -1; s = $_330(l, e, s); return s;}
function $446(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_32(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 133 : 

                s = $426(l, e, s);

                if ( e.p<0 ) s = $427(l, e, s);

                break;
             

            case 132 : s = $407(l, e, s); break; 

            case 131 : 

                s = $420(l, e, s);

                if ( e.p<0 ) s = $421(l, e, s);

                break;
             

            case 130 : s = $406(l, e, s); break; 

            case 122 : s = $401(l, e, s); break; 

            case 121 : s = $418(l, e, s); break; 

            case 120 : s = $417(l, e, s); break; 

            case 119 : s = $415(l, e, s); break; 

            case 118 : s = $405(l, e, s); break; 

            case 117 : s = $404(l, e, s); break; 

            case 116 : s = $403(l, e, s); break; 

            case 115 : s = $402(l, e, s); break; 

            case 113 : s = $448(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![112].includes(a) ) fail(l, e);

    return s;
}
function $447(l, e, s= []){

    e.p = -1;

    
    if ( _60.includes(l.tx)||_61.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, [sym[0]]);

        return (e.p = 112, s);
    }

    return s;
}
function $448(l, e, s= []){

    e.p = -1;

    
    if ( _60.includes(l.tx)||_61.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, ([...sym[0],sym[1]]));

        return (e.p = 112, s);
    }

    return s;
}
function $449(l, e, s= []){e.p = -1; s = $_333(l, e, s); return s;}
function $450(l, e, s= []){e.p = -1; s = $_333(l, e, s); return s;}
function $451(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_33(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 129 : s = $449(l, e, s); break; 

            case 128 : 

                s = $239(l, e, s);

                if ( e.p<0 ) s = $240(l, e, s);

                break;
             

            case 127 : s = $241(l, e, s); break; 

            case 123 : s = $453(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![124].includes(a) ) fail(l, e);

    return s;
}
function $452(l, e, s= []){

    e.p = -1;

    
    if ( _66.includes(l.tx)||_44.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, sym[0]+"");

        return (e.p = 124, s);
    }

    return s;
}
function $453(l, e, s= []){

    e.p = -1;

    
    if ( _66.includes(l.tx)||_44.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, sym[0]+sym[1]);

        return (e.p = 124, s);
    }

    return s;
}
function $454(l, e, s= []){

    const sp= e.sp;

    e.p = -1;

    s = $_33(l, e, s);

    let a= e.p;

    o:while(1){

        if ( sp>e.sp ) break;else e.sp += 1;

        switch(e.p){

            case 129 : s = $449(l, e, s); break; 

            case 128 : 

                s = $239(l, e, s);

                if ( e.p<0 ) s = $240(l, e, s);

                break;
             

            case 127 : s = $241(l, e, s); break; 

            case 123 : s = $456(l, e, s); break; 

            default : break o;
        }

        if ( e.p>=0 ) a = e.p;
    }

    if ( sp<=e.sp ) e.p = a;

    if ( ![125].includes(a) ) fail(l, e);

    return s;
}
function $455(l, e, s= []){

    e.p = -1;

    
    if ( _67.includes(l.tx)||_44.includes(l.ty) ) {

        e.sp -= 1;

        var sym= s.slice(-1);

        s.splice(-1, 1, sym[0]+"");

        return (e.p = 125, s);
    }

    return s;
}
function $456(l, e, s= []){

    e.p = -1;

    
    if ( _67.includes(l.tx)||_44.includes(l.ty) ) {

        e.sp -= 2;

        var sym= s.slice(-2);

        s.splice(-2, 2, sym[0]+sym[1]);

        return (e.p = 125, s);
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
    lexer.addSymbols("||","^=","$=","*=","<=",">=");
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
    const result = $CSS(lexer, env);
    
    if (!lexer.END || (env.FAILED )) {

            const error_lex = env.error.concat(lexer).sort((a,b)=>a.off-b.off).pop();
            error_lex.throw(`Unexpected token [${error_lex.tx}]`);
        
    }
    return result;
}, {$CSS,
$STYLE_SHEET_group_03_101,
$import_group_012_105,
$import_group_315_107,
$import,
$import_declaration,
$keyframes,
$keyframes_name,
$keyframes_blocks,
$keyframe_selector,
$supports_group_025_111,
$supports,
$supports_condition_group_129_112,
$supports_condition,
$supports_feature,
$supports_decl,
$supports_feature_fn,
$media,
$media_queries,
$media_query_group_043_116,
$media_query_group_144_117,
$media_not,
$media_and_group_152_118,
$media_and,
$media_or_group_154_120,
$media_or,
$media_feature,
$general_enclosed_group_064_123,
$general_enclosed,
$mf_plain,
$mf_range_group_071_125,
$mf_range_group_080_126,
$mf_range_group_085_127,
$mf_boolean,
$mf_name,
$media_type,
$ratio,
$percentage,
$dimension,
$url,
$string,
$COMPLEX_SELECTOR_group_0103_130,
$COMPLEX_SELECTOR_group_1104_131,
$COMPLEX_SELECTOR,
$COMPOUND_SELECTOR_group_1106_135,
$COMBINATOR,
$NS_PREFIX_group_0113_137,
$NS_PREFIX,
$SUBCLASS_SELECTOR,
$ID_SELECTOR,
$CLASS_SELECTOR,
$PSEUDO_CLASS_SELECTOR_group_2122_138,
$PSEUDO_CLASS_SELECTOR,
$ATTRIBUTE_SELECTOR_group_2126_139,
$ATTRIBUTE_SELECTOR,
$ATTR_MATCHER,
$ATTR_MODIFIER,
$PSEUDO_ELEMENT_SELECTOR,
$declaration_list_group_1138_141,
$declaration_list,
$rule_declaration,
$declaration_group_1141_144,
$declaration,
$identifier,
$declaration_id,
$def$start,
$def$hex_digit,
$def$hex,
$def$binary,
$def$octal,
$def$scientific,
$def$float,
$def$integer,
$def$natural,
$def$id,
$def$string,
$def$js_identifier,
$def$identifier,
$STYLE_SHEET_HC_listbody1_100,
$STYLE_SHEET_HC_listbody1_102,
$STYLE_SHEET,
$STYLE_RULE_HC_listbody2_103,
$STYLE_RULE,
$GROUP_RULE_BODY_HC_listbody5_104,
$GROUP_RULE_BODY,
$AT_RULE,
$import_group_014_106,
$import_HC_listbody5_108,
$keyframes_HC_listbody5_109,
$keyframes_blocks_HC_listbody1_110,
$supports_condition_HC_listbody2_113,
$supports_in_parens,
$media_queries_HC_listbody7_114,
$media_queries_group_039_115,
$media_query,
$media_condition,
$media_condition_without_or,
$media_and_HC_listbody2_119,
$media_or_HC_listbody2_121,
$media_in_parenths,
$media_feature_group_061_122,
$general_enclosed_HC_listbody1_124,
$mf_range,
$mf_value,
$string_HC_listbody1_128,
$string_HC_listbody1_129,
$COMPLEX_SELECTOR_HC_listbody2_132,
$COMPOUND_SELECTOR_HC_listbody2_133,
$COMPOUND_SELECTOR_HC_listbody1_134,
$COMPOUND_SELECTOR_HC_listbody2_136,
$COMPOUND_SELECTOR,
$WQ_NAME,
$TYPE_SELECTOR,
$declaration_list_HC_listbody3_140,
$declaration_list_HC_listbody2_142,
$declaration_list_HC_listbody1_143,
$declaration_values_group_0145_145,
$declaration_values_HC_listbody1_146,
$declaration_values,
$css_id_symbols,
$string_value_group_1171_147,
$string_value_HC_listbody2_148,
$string_value,
$def$defaultproductions_HC_listbody1_100,
$def$defaultproductions,
$def$defaultproduction,
$def$string_group_034_101,
$def$string_HC_listbody1_102,
$def$string_HC_listbody1_103,
$def$string_value_group_149_104,
$def$string_value_HC_listbody2_105,
$def$string_value,
$def$js_id_symbols,
$def$identifier_symbols,
$1,
$2,
$3,
$4,
$5,
$6,
$11,
$12,
$13,
$14,
$15,
$16,
$17,
$18,
$19,
$20,
$21,
$22,
$23,
$24,
$25,
$26,
$27,
$28,
$29,
$30,
$31,
$32,
$33,
$34,
$35,
$36,
$37,
$38,
$39,
$40,
$41,
$47,
$48,
$49,
$50,
$51,
$52,
$53,
$54,
$55,
$60,
$61,
$62,
$63,
$64,
$65,
$66,
$67,
$68,
$69,
$70,
$71,
$72,
$73,
$74,
$75,
$76,
$77,
$78,
$79,
$80,
$81,
$82,
$83,
$84,
$85,
$86,
$87,
$93,
$94,
$95,
$96,
$97,
$98,
$107,
$108,
$109,
$110,
$111,
$112,
$113,
$114,
$115,
$116,
$117,
$118,
$120,
$121,
$123,
$124,
$125,
$126,
$127,
$134,
$135,
$137,
$138,
$139,
$140,
$142,
$143,
$144,
$145,
$146,
$147,
$148,
$149,
$150,
$151,
$152,
$153,
$154,
$155,
$156,
$157,
$158,
$168,
$171,
$173,
$175,
$176,
$178,
$179,
$182,
$183,
$184,
$186,
$187,
$188,
$190,
$191,
$192,
$195,
$197,
$198,
$199,
$200,
$201,
$202,
$203,
$204,
$205,
$206,
$207,
$210,
$211,
$212,
$216,
$217,
$218,
$221,
$224,
$225,
$226,
$227,
$228,
$229,
$230,
$231,
$232,
$233,
$239,
$240,
$241,
$242,
$243,
$244,
$245,
$246,
$247,
$248,
$249,
$250,
$251,
$253,
$256,
$258,
$261,
$263,
$264,
$265,
$267,
$269,
$271,
$273,
$274,
$275,
$276,
$277,
$278,
$279,
$280,
$281,
$282,
$283,
$284,
$285,
$286,
$289,
$290,
$291,
$292,
$293,
$294,
$296,
$297,
$298,
$299,
$300,
$301,
$302,
$303,
$307,
$310,
$313,
$314,
$315,
$316,
$317,
$318,
$319,
$320,
$321,
$322,
$323,
$324,
$325,
$326,
$327,
$328,
$329,
$330,
$337,
$338,
$339,
$341,
$342,
$343,
$346,
$347,
$348,
$349,
$350,
$351,
$353,
$354,
$356,
$357,
$358,
$362,
$364,
$365,
$366,
$367,
$368,
$372,
$373,
$374,
$375,
$377,
$378,
$379,
$380,
$381,
$382,
$383,
$384,
$385,
$386,
$387,
$388,
$389,
$390,
$391,
$392,
$393,
$394,
$395,
$396,
$397,
$398,
$399,
$400,
$401,
$402,
$403,
$404,
$405,
$406,
$407,
$408,
$409,
$410,
$411,
$412,
$413,
$414,
$415,
$416,
$417,
$418,
$419,
$420,
$421,
$422,
$423,
$424,
$425,
$426,
$427,
$428,
$429,
$430,
$431,
$432,
$433,
$434,
$435,
$436,
$437,
$438,
$439,
$440,
$441,
$442,
$443,
$444,
$445,
$446,
$447,
$448,
$449,
$450,
$451,
$452,
$453,
$454,
$455,
$456})
}