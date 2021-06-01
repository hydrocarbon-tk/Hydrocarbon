/*production name: unary_value
            grammar index: 27
            bodies:
	27:85 unary_value=>• left_hand_expression - 
		27:86 unary_value=>• call_expression - 
		27:87 unary_value=>• function_expression - 
		27:88 unary_value=>• value - 
		27:89 unary_value=>• ( expression_statements_group_023_108 ) - 
		27:90 unary_value=>• ( ) - 
            compile time: 297.489ms*/;
function $unary_value(l:Lexer,data:ParserData,state:u32,prod:i32,puid:i32):u32{
    /*44:129 identifier=>• tk:identifier_token
    27:87 unary_value=>• function_expression
    27:88 unary_value=>• value
    27:89 unary_value=>• ( expression_statements_group_023_108 )
    27:90 unary_value=>• ( )*/
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(l.current_byte==40/*[(]*/){
        /*27:89 unary_value=>• ( expression_statements_group_023_108 )
        27:90 unary_value=>• ( )*/
        /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
        consume(l,data,state);
        puid |=16;
        /*27:89 unary_value=>( • expression_statements_group_023_108 )
        27:90 unary_value=>( • )*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.current_byte==41/*[)]*/){
            pushFN(data,branch_07c4b2a266e81cdd);
            return branch_fa55fa3a8510aadd(l,data,state,prod,16);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if(((((((((((((((/*[if]*/cmpr_set(l,data,143,2,2)||/*[match]*/cmpr_set(l,data,67,5,5))||/*[==]*/cmpr_set(l,data,7,2,2))||dt_bcea2102060eab13(l,data))||dt_6ae31dd85a62ef5c(l,data))||/*[true]*/cmpr_set(l,data,95,4,4))||/*[null]*/cmpr_set(l,data,35,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[break]*/cmpr_set(l,data,72,5,5))||/*[return]*/cmpr_set(l,data,77,6,6))||/*[continue]*/cmpr_set(l,data,39,8,8))||/*[loop]*/cmpr_set(l,data,63,4,4))||assert_ascii(l,0x0,0x194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
            pushFN(data,branch_07c4b2a266e81cdd);
            return branch_8c4605c70c72ddec(l,data,state,prod,16);
        }
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(/*[fn]*/cmpr_set(l,data,144,2,2)||(l.current_byte==91/*[[]*/)){
        pushFN(data,branch_07c4b2a266e81cdd);
        return branch_aabd2b73b3cb3db4(l,data,state,prod,4);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(((((((dt_6ae31dd85a62ef5c(l,data)||/*[true]*/cmpr_set(l,data,95,4,4))||/*[false]*/cmpr_set(l,data,53,5,5))||/*[null]*/cmpr_set(l,data,35,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||(l.current_byte==34/*["]*/))||(l.current_byte==39/*[']*/))||l.isNum(data)){
        pushFN(data,branch_07c4b2a266e81cdd);
        return branch_0dacddd2ccbd8698(l,data,state,prod,8);
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    } else if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
        pushFN(data,branch_d1cfa7d2150e033a);
        return branch_cb6f2beb6b754054(l,data,state,prod,1);
    }
    return -1;
}
function $unary_value_goto(l:Lexer,data:ParserData,state:u32,prod:i32,puid:i32):u32{
    while(1){
        /*28:91 left_hand_expression=>member_expression •
        37:115 member_expression=>member_expression • . identifier
        37:116 member_expression=>member_expression • [ expression ]
        36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
        36:114 call_expression=>member_expression • ( )*/
        /*28:91 left_hand_expression=>member_expression •
        37:116 member_expression=>member_expression • [ expression ]
        37:115 member_expression=>member_expression • . identifier
        36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
        36:114 call_expression=>member_expression • ( )*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        switch(sym_map_c82afb129e509311(l,data)){
            case 0:
                /*28:91 left_hand_expression=>member_expression •
                37:116 member_expression=>member_expression • [ expression ]*/
                var pk:Lexer = l.copy();
                skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,0);
                switch(sym_map_5f25d3b4480e3a7f(pk,data)){
                    case 0:
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        /*37:116 member_expression=>member_expression • [ expression ]*/
                        puid |=8;
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                        puid |=16;
                        pushFN(data,branch_424b2ca54b6272ce);
                        pushFN(data,$expression);
                        return puid;
                    default:
                    case 1:
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*28:91 left_hand_expression=>member_expression •*/
                        return 27;
                    case 2:
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                        /*37:116 member_expression=>member_expression • [ expression ]*/
                        puid |=8;
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                        puid |=16;
                        pushFN(data,branch_424b2ca54b6272ce);
                        pushFN(data,$expression);
                        return puid;
                }
            case 1:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*37:115 member_expression=>member_expression • . identifier*/
                puid |=2;
                consume(l,data,state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                puid |=4;
                pushFN(data,branch_c7b759beb1f3603a);
                pushFN(data,$identifier);
                return puid;
            case 2:
                /*36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                36:114 call_expression=>member_expression • ( )*/
                var pk:Lexer = l.copy();
                skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,0);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(pk.current_byte==41/*[)]*/){
                    pushFN(data,branch_1202bfb712d31996);
                    return branch_f29ead3e741f692c(l,data,state,prod,1);
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                } else if(((((((((((((((/*[if]*/cmpr_set(pk,data,143,2,2)||/*[match]*/cmpr_set(pk,data,67,5,5))||/*[break]*/cmpr_set(pk,data,72,5,5))||/*[return]*/cmpr_set(pk,data,77,6,6))||/*[continue]*/cmpr_set(pk,data,39,8,8))||/*[loop]*/cmpr_set(pk,data,63,4,4))||/*[<<--]*/cmpr_set(pk,data,20,4,4))||/*[==]*/cmpr_set(pk,data,7,2,2))||dt_bcea2102060eab13(pk,data))||/*[true]*/cmpr_set(pk,data,95,4,4))||/*[null]*/cmpr_set(pk,data,35,4,4))||dt_6ae31dd85a62ef5c(pk,data))||assert_ascii(pk,0x0,0x194,0x88000000,0x8000000))||pk.isUniID(data))||pk.isNum(data))||pk.isSym(true,data)){
                    pushFN(data,branch_1202bfb712d31996);
                    return branch_25c768d9c9093ad1(l,data,state,prod,1);
                }
            default:
            case 3:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                /*28:91 left_hand_expression=>member_expression •*/
                return 27;
        }
        break;
    }
    return prod == 27 ? prod : -1;
}
function $unary_value_reducer(l:Lexer,data:ParserData,state:u32,prod:u32,puid:u32):u32{
    if(112 == puid){
        /*27:89 unary_value=>( expression_statements_group_023_108 ) •*/
        add_reduce(state,data,3,48);
    } else if(80 == puid){
        /*27:90 unary_value=>( ) •*/
        add_reduce(state,data,2,49);
    }
    return 27;
}
function branch_07c4b2a266e81cdd(l:Lexer,data:ParserData,state:u32,prod:u32,puid:u32):i32{
    pushFN(data,$unary_value_goto);
    return 27;
    /*07c4b2a266e81cdd4fa52870e019ca27*/
}
function branch_0dacddd2ccbd8698(l:Lexer,data:ParserData,state:u32,prod:u32,puid:u32):i32{
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*27:88 unary_value=>• value*/
    puid |=8;
    pushFN(data,branch_1f9ddf3c27180aa0);
    pushFN(data,$value);
    return puid;
    return -1;
    /*0dacddd2ccbd86983a6895af7457d55a*/
}
function branch_1202bfb712d31996(l:Lexer,data:ParserData,state:u32,prod:u32,puid:u32):i32{
    /*-------------INDIRECT-------------------*/
    pushFN(data,$unary_value_goto);
    return 27;
    /*1202bfb712d31996ec80d4368861e54a*/
}
function branch_1f9ddf3c27180aa0(l:Lexer,data:ParserData,state:u32,prod:u32,puid:u32):i32{
    return prod;
    /*1f9ddf3c27180aa0dff88bc66c940765*/
}
function branch_25c768d9c9093ad1(l:Lexer,data:ParserData,state:u32,prod:u32,puid:u32):i32{
    /*--LEAF--*/
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    /*36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )*/
    puid |=2;
    consume(l,data,state);
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=4;
    pushFN(data,branch_cfbe1d2c5b310407);
    pushFN(data,$call_expression_HC_listbody2_114);
    return puid;
    return -1;
    /*25c768d9c9093ad1dd54a3599c403d1c*/
}
function branch_424b2ca54b6272ce(l:Lexer,data:ParserData,state:u32,prod:u32,puid:u32):i32{
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=32;
    if((l.current_byte==93/*[]]*/)&&consume(l,data,state)){
        add_reduce(state,data,4,66);
        /*-------------INDIRECT-------------------*/
        pushFN(data,$unary_value_goto);
        return 37;
    }
    return -1;
    /*424b2ca54b6272ce6f057ab62c53203d*/
}
function branch_8c4605c70c72ddec(l:Lexer,data:ParserData,state:u32,prod:u32,puid:u32):i32{
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*27:89 unary_value=>( • expression_statements_group_023_108 )*/
    puid |=32;
    pushFN(data,branch_e570b4eb4eafcb66);
    pushFN(data,$expression_statements_group_023_108);
    return puid;
    return -1;
    /*8c4605c70c72ddec0ae57795b957755f*/
}
function branch_aabd2b73b3cb3db4(l:Lexer,data:ParserData,state:u32,prod:u32,puid:u32):i32{
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*27:87 unary_value=>• function_expression*/
    puid |=4;
    pushFN(data,branch_1f9ddf3c27180aa0);
    pushFN(data,$function_expression);
    return puid;
    return -1;
    /*aabd2b73b3cb3db45e83a427a9104be3*/
}
function branch_c7b759beb1f3603a(l:Lexer,data:ParserData,state:u32,prod:u32,puid:u32):i32{
    add_reduce(state,data,3,65);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$unary_value_goto);
    return 37;
    /*c7b759beb1f3603a92f670ed2f3ac5ad*/
}
function branch_cb6f2beb6b754054(l:Lexer,data:ParserData,state:u32,prod:u32,puid:u32):i32{
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*44:129 identifier=>• tk:identifier_token*/
    puid |=1;
    pushFN(data,branch_1f9ddf3c27180aa0);
    pushFN(data,$identifier);
    return puid;
    return -1;
    /*cb6f2beb6b7540541b6ba7d6f6f9a8dc*/
}
function branch_cfbe1d2c5b310407(l:Lexer,data:ParserData,state:u32,prod:u32,puid:u32):i32{
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=8;
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        add_reduce(state,data,4,63);
        return prod;
    }
    return -1;
    /*cfbe1d2c5b310407a2f990f2552ac3f4*/
}
function branch_d1cfa7d2150e033a(l:Lexer,data:ParserData,state:u32,prod:u32,puid:u32):i32{
    pushFN(data,$unary_value_goto);
    return 37;
    /*d1cfa7d2150e033a37407c86f24f818a*/
}
function branch_e570b4eb4eafcb66(l:Lexer,data:ParserData,state:u32,prod:u32,puid:u32):i32{
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=64;
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        add_reduce(state,data,3,48);
        return prod;
    }
    return -1;
    /*e570b4eb4eafcb66b1b223128ee99ee9*/
}
function branch_f29ead3e741f692c(l:Lexer,data:ParserData,state:u32,prod:u32,puid:u32):i32{
    /*--LEAF--*/
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    /*36:114 call_expression=>member_expression • ( )*/
    puid |=2;
    consume(l,data,state);
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=8;
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        add_reduce(state,data,3,64);
        return prod;
    }
    return -1;
    /*f29ead3e741f692c1052a936c17bf854*/
}
function branch_fa55fa3a8510aadd(l:Lexer,data:ParserData,state:u32,prod:u32,puid:u32):i32{
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*27:90 unary_value=>( • )*/
    puid |=64;
    consume(l,data,state);
    add_reduce(state,data,2,49);
    return prod;
    return -1;
    /*fa55fa3a8510aadd9e8df05ce11da0f3*/
}
function dt_1f145d506cf02379(l:Lexer,data:ParserData):boolean{
    if(2==compare(data,l.byte_offset +0,17,2)){
        /*/**/
        l.setToken(TokenSymbol, 2, 2);
        return true;
    } else if(2==compare(data,l.byte_offset +0,112,2)){
        /*//*/
        l.setToken(TokenSymbol, 2, 2);
        return true;
    }
    return false;
}
function dt_6ae31dd85a62ef5c(l:Lexer,data:ParserData):boolean{
    if(2==compare(data,l.byte_offset +0,27,2)){
        /*0x*/
        l.setToken(TokenSymbol, 2, 2);
        return true;
    } else if(2==compare(data,l.byte_offset +0,114,2)){
        /*0b*/
        l.setToken(TokenSymbol, 2, 2);
        return true;
    } else if(2==compare(data,l.byte_offset +0,137,2)){
        /*0o*/
        l.setToken(TokenSymbol, 2, 2);
        return true;
    } else if(2==compare(data,l.byte_offset +0,139,2)){
        /*0O*/
        l.setToken(TokenSymbol, 2, 2);
        return true;
    }
    return false;
}
function dt_bcea2102060eab13(l:Lexer,data:ParserData):boolean{
    if(2==compare(data,l.byte_offset +0,144,2)){
        /*fn*/
        l.setToken(TokenSymbol, 2, 2);
        return true;
    } else if(5==compare(data,l.byte_offset +0,53,5)){
        /*false*/
        l.setToken(TokenSymbol, 5, 5);
        return true;
    }
    return false;
}
function skip_9184d3c96b70653a(l:Lexer,data:ParserData,state:i32):Lexer{
    const off = l.token_offset;
    while(1){
        if(!((tk_b495469acbac99fd(l,data)||l.isNL())||l.isSP(true,data))){
            break;
        }
        l.next(data);
    }
    if(isOutputEnabled(state)){
        add_skip(l,data,l.token_offset - off);
    }
}
function sym_map_5f25d3b4480e3a7f(l:Lexer,data:ParserData):i32{
    /*_ $ if match sym == [ fn num 0x 0b 0o 0O " ' true false null <<-- ( break return continue loop { pub priv export mut imut = in ; } , ) ] == else : [ str fn id*/
    if(data.input[l.byte_offset + 0] == 95){
        /*_*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 36){
        /*$*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 102){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*if*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            }
        } else if(data.input[l.byte_offset + 1] == 110){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*in*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if(data.input[l.byte_offset + 1] == 109){
            if(2==compare(data,l.byte_offset +2,118,2)){
                if(l.isDiscrete(data, TokenIdentifier,4)){
                    /*imut*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 1;
                }
            }
        }
    } else if(data.input[l.byte_offset + 0] == 109){
        if(data.input[l.byte_offset + 1] == 117){
            if(data.input[l.byte_offset + 2] == 116){
                if(l.isDiscrete(data, TokenIdentifier,3)){
                    /*mut*/
                    l.setToken(TokenSymbol, 3, 3);
                    return 1;
                }
            }
        } else if(data.input[l.byte_offset + 1] == 97){
            if(3==compare(data,l.byte_offset +2,69,3)){
                if(l.isDiscrete(data, TokenIdentifier,5)){
                    /*match*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 0;
                }
            }
        }
    } else if(data.input[l.byte_offset + 0] == 61){
        if(data.input[l.byte_offset + 1] == 61){
            /*==*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
            /*==*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        }
        /*=*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 91){
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*fn*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
                /*fn*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if(data.input[l.byte_offset + 1] == 97){
            if(3==compare(data,l.byte_offset +2,55,3)){
                if(l.isDiscrete(data, TokenIdentifier,5)){
                    /*false*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 0;
                }
            }
        }
    } else if(data.input[l.byte_offset + 0] == 48){
        if(data.input[l.byte_offset + 1] == 120){
            /*0x*/
            l.setToken(TokenSymbol, 2, 2);
            return 0;
        } else if(data.input[l.byte_offset + 1] == 98){
            /*0b*/
            l.setToken(TokenSymbol, 2, 2);
            return 0;
        } else if(data.input[l.byte_offset + 1] == 111){
            /*0o*/
            l.setToken(TokenSymbol, 2, 2);
            return 0;
        } else if(data.input[l.byte_offset + 1] == 79){
            /*0O*/
            l.setToken(TokenSymbol, 2, 2);
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 34){
        /*"*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 39){
        /*'*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 116){
        if(3==compare(data,l.byte_offset +1,96,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*true*/
                l.setToken(TokenSymbol, 4, 4);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 110){
        if(3==compare(data,l.byte_offset +1,36,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*null*/
                l.setToken(TokenSymbol, 4, 4);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 60){
        if(3==compare(data,l.byte_offset +1,21,3)){
            /*<<--*/
            l.setToken(TokenSymbol, 4, 4);
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 40){
        /*(*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 98){
        if(4==compare(data,l.byte_offset +1,73,4)){
            if(l.isDiscrete(data, TokenIdentifier,5)){
                /*break*/
                l.setToken(TokenSymbol, 5, 5);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 114){
        if(5==compare(data,l.byte_offset +1,78,5)){
            if(l.isDiscrete(data, TokenIdentifier,6)){
                /*return*/
                l.setToken(TokenSymbol, 6, 6);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 99){
        if(7==compare(data,l.byte_offset +1,40,7)){
            if(l.isDiscrete(data, TokenIdentifier,8)){
                /*continue*/
                l.setToken(TokenSymbol, 8, 8);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 108){
        if(3==compare(data,l.byte_offset +1,64,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*loop*/
                l.setToken(TokenSymbol, 4, 4);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 123){
        /*{*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 112){
        if(data.input[l.byte_offset + 1] == 117){
            if(data.input[l.byte_offset + 2] == 98){
                if(l.isDiscrete(data, TokenIdentifier,3)){
                    /*pub*/
                    l.setToken(TokenSymbol, 3, 3);
                    return 1;
                }
            }
        } else if(data.input[l.byte_offset + 1] == 114){
            if(2==compare(data,l.byte_offset +2,101,2)){
                if(l.isDiscrete(data, TokenIdentifier,4)){
                    /*priv*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 1;
                }
            }
        }
    } else if(data.input[l.byte_offset + 0] == 101){
        if(data.input[l.byte_offset + 1] == 108){
            if(2==compare(data,l.byte_offset +2,130,2)){
                if(l.isDiscrete(data, TokenIdentifier,4)){
                    /*else*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 1;
                }
            }
        } else if(data.input[l.byte_offset + 1] == 120){
            if(4==compare(data,l.byte_offset +2,59,4)){
                if(l.isDiscrete(data, TokenIdentifier,6)){
                    /*export*/
                    l.setToken(TokenSymbol, 6, 6);
                    return 1;
                }
            }
        }
    } else if(data.input[l.byte_offset + 0] == 59){
        /*;*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 125){
        /*}*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 44){
        /*,*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 41){
        /*)*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 93){
        /*]*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 58){
        /*:*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 115){
        if(2==compare(data,l.byte_offset +1,48,2)){
            if(l.isDiscrete(data, TokenIdentifier,3)){
                /*str*/
                l.setToken(TokenSymbol, 3, 3);
                return 1;
            }
        }
    }
    if(l.isSym(true,data)){
        return 0;
    } else if(l.isNum(data)){
        return 0;
    } else if(l.isUniID(data)){
        return 2;
    }
    return -1;
}
function sym_map_c82afb129e509311(l:Lexer,data:ParserData):i32{
    /*[ . (*/
    if(data.input[l.byte_offset + 0] == 91){
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 46){
        /*.*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 40){
        /*(*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
    }
    return -1;
}
function tk_b495469acbac99fd(l:Lexer,data:ParserData):boolean{
    if(dt_1f145d506cf02379(l,data)){
                        
        //This assumes the token production does not fork

        // preserve the current state of the data
        const stack_ptr = data.stack_ptr;
        const input_ptr = data.input_ptr;
        const state = data.state;
        const copy = l.copy();

        pushFN(data, $comment);
        data.state = 0;

        let ACTIVE = true;

        while (ACTIVE) {
            ACTIVE = false;
            ACTIVE = stepKernel(data, stack_ptr + 1);
        }
        
        data.state = state;

        if (data.prod == 71) {
            data.stack_ptr = stack_ptr;
            data.input_ptr = input_ptr;
            l.slice(copy);
            return true;
        } else {
            l.sync(copy);
            data.stack_ptr = stack_ptr;
            data.input_ptr = input_ptr;
            return false;
        };
    }
    return false;
}