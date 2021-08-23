
    import { 
        ParserFactoryGamma as ParserFactory, 
        fillByteBufferWithUTF8FromString,
        ParserCore
    } from "@candlelib/hydrocarbon";

    const recognizer_initializer = (()=>{
        
        const {
            add_reduce,
            add_skip,
            compare,
            token_production,
            is_output_enabled,
            consume,
            recognize,
            init_table,
            set_production,
            ParserStateIterator
        } = ParserCore;
    

        var token_lookup = new Uint32Array([40,4,0,8,1828610434,129,384,128,1073742210,129,131456,128,754729344,128,754728960,0,1828471170,129,1073742208,128,384,144,1410,192,4480,128,65920,128,896,128,1408,128,2432,128,8576,128,33152,128,416,128,16777600,128,33554816,128,268435840,128,2147484032,128,384,129,384,130,424,132,40,132,0,128,0,132,8,128,32,128,384,136,428,144,754712576,0,131456,160,384,160,384,192,4512,128,428,128,428,0,388,128,128,128,256,128,392,128]);;
        var token_sequence_lookup = new Uint8Array([91,93,40,41,115,121,109,98,111,108,115,58,95,47,42,47,44,69,78,68,95,79,70,95,80,82,79,68,85,67,84,73,79,78,116,104,101,110,111,110,112,114,111,100,99,111,110,115,117,109,101,97,115,115,101,114,116,103,111,116,111,114,101,100,117,99,101,102,111,114,107,117,110,116,105,108,101,120,112,101,99,116,101,100,115,107,105,112,112,101,100,112,101,101,107,102,97,105,108,115,116,97,116,101,115,99,97,110,115,101,116,112,111,112]);;
        function isTokenActive(token_id, row){
    var index  = ( row  * 2 ) + ( token_id  >> 5 );;
    var shift  = 1 << ( 31 & ( token_id ) );;
    return ( token_lookup[index] & shift ) != 0
};
        function scan_core(lexer, tk_row){
    switch(( lexer.get_byte_at( lexer.byte_offset ) & 127 )){
    case 40: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 40 ){
            if( isTokenActive( 16, tk_row ) ){
                lexer.setToken( 16, 1, 1 );
                return
            }
        }
    }
    break;
    case 41: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 41 ){
            if( isTokenActive( 17, tk_row ) ){
                lexer.setToken( 17, 1, 1 );
                return
            }
        }
    }
    break;
    case 42: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 42 ){
            if( isTokenActive( 36, tk_row ) && lexer.get_byte_at( lexer.byte_offset  + 1 ) == 47 ){
                lexer.setToken( 36, 2, 2 );
                return
            }
        }
    }
    break;
    case 44: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 44 ){
            if( isTokenActive( 37, tk_row ) ){
                lexer.setToken( 37, 1, 1 );
                return
            }
        }
    }
    break;
    case 47: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 47 ){
            if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 42 ){
                if( isTokenActive( 39, tk_row ) && token_production( lexer, hc_comment, 9, 39, 2 ) && lexer.byte_length  > 2 ){
                    return
                } else if( isTokenActive( 35, tk_row ) ){
                    lexer.setToken( 35, 2, 2 );
                    return
                }
            }
        }
    }
    break;
    case 91: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 91 ){
            if( isTokenActive( 10, tk_row ) ){
                lexer.setToken( 10, 1, 1 );
                return
            }
        }
    }
    break;
    case 93: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 93 ){
            if( isTokenActive( 12, tk_row ) ){
                lexer.setToken( 12, 1, 1 );
                return
            }
        }
    }
    break;
    case 95: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 95 ){
            if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 8, 11, 1 ) && lexer.byte_length  > 1 ){
                return
            } else if( isTokenActive( 34, tk_row ) ){
                lexer.setToken( 34, 1, 1 );
                return
            }
        }
    }
    break;
    case 97: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 97 ){
            if( 5 == compare( lexer, lexer.byte_offset  + 1, 52, 5, token_sequence_lookup ) ){
                if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 8, 11, 1 ) && lexer.byte_length  > 6 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 6 ){
                    return
                } else if( isTokenActive( 20, tk_row ) ){
                    lexer.setToken( 20, 6, 6 );
                    return
                }
            }
        }
    }
    break;
    case 99: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 99 ){
            if( 6 == compare( lexer, lexer.byte_offset  + 1, 45, 6, token_sequence_lookup ) ){
                if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 8, 11, 1 ) && lexer.byte_length  > 7 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 7 ){
                    return
                } else if( isTokenActive( 18, tk_row ) ){
                    lexer.setToken( 18, 7, 7 );
                    return
                }
            }
        }
    }
    break;
    case 101: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 101 ){
            if( 7 == compare( lexer, lexer.byte_offset  + 1, 77, 7, token_sequence_lookup ) ){
                if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 8, 11, 1 ) && lexer.byte_length  > 8 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 8 ){
                    return
                } else if( isTokenActive( 33, tk_row ) ){
                    lexer.setToken( 33, 8, 8 );
                    return
                }
            }
        }
    }
    break;
    case 102: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 102 ){
            if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 111 ){
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 69, 2, token_sequence_lookup ) ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 8, 11, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 26, tk_row ) ){
                        lexer.setToken( 26, 4, 4 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 97 ){
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 97, 2, token_sequence_lookup ) ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 8, 11, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 31, tk_row ) ){
                        lexer.setToken( 31, 4, 4 );
                        return
                    }
                }
            }
        }
    }
    break;
    case 103: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 103 ){
            if( 3 == compare( lexer, lexer.byte_offset  + 1, 58, 3, token_sequence_lookup ) ){
                if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 8, 11, 1 ) && lexer.byte_length  > 4 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                    return
                } else if( isTokenActive( 21, tk_row ) ){
                    lexer.setToken( 21, 4, 4 );
                    return
                }
            }
        }
    }
    break;
    case 111: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 111 ){
            if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 110 ){
                if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 8, 11, 1 ) && lexer.byte_length  > 2 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 2 ){
                    return
                } else if( isTokenActive( 14, tk_row ) ){
                    lexer.setToken( 14, 2, 2 );
                    return
                } else if( isTokenActive( 30, tk_row ) ){
                    lexer.setToken( 30, 2, 2 );
                    return
                }
            }
        }
    }
    break;
    case 112: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 112 ){
            if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 114 ){
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 42, 2, token_sequence_lookup ) ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 8, 11, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 15, tk_row ) ){
                        lexer.setToken( 15, 4, 4 );
                        return
                    } else if( isTokenActive( 24, tk_row ) ){
                        lexer.setToken( 24, 4, 4 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 101 ){
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 93, 2, token_sequence_lookup ) ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 8, 11, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 19, tk_row ) ){
                        lexer.setToken( 19, 4, 4 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 111 ){
                if( lexer.get_byte_at( lexer.byte_offset  + 2 ) == 112 ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 8, 11, 1 ) && lexer.byte_length  > 3 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 3 ){
                        return
                    } else if( isTokenActive( 29, tk_row ) ){
                        lexer.setToken( 29, 3, 3 );
                        return
                    }
                }
            }
        }
    }
    break;
    case 114: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 114 ){
            if( 5 == compare( lexer, lexer.byte_offset  + 1, 62, 5, token_sequence_lookup ) ){
                if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 8, 11, 1 ) && lexer.byte_length  > 6 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 6 ){
                    return
                } else if( isTokenActive( 22, tk_row ) ){
                    lexer.setToken( 22, 6, 6 );
                    return
                }
            }
        }
    }
    break;
    case 115: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 115 ){
            if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 121 ){
                if( 6 == compare( lexer, lexer.byte_offset  + 2, 6, 6, token_sequence_lookup ) ){
                    if( isTokenActive( 32, tk_row ) ){
                        lexer.setToken( 32, 8, 8 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 107 ){
                if( 5 == compare( lexer, lexer.byte_offset  + 2, 86, 5, token_sequence_lookup ) ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 8, 11, 1 ) && lexer.byte_length  > 7 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 7 ){
                        return
                    } else if( isTokenActive( 38, tk_row ) ){
                        lexer.setToken( 38, 7, 7 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 116 ){
                if( 3 == compare( lexer, lexer.byte_offset  + 2, 101, 3, token_sequence_lookup ) ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 8, 11, 1 ) && lexer.byte_length  > 5 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 5 ){
                        return
                    } else if( isTokenActive( 9, tk_row ) ){
                        lexer.setToken( 9, 5, 5 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 99 ){
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 106, 2, token_sequence_lookup ) ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 8, 11, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 27, tk_row ) ){
                        lexer.setToken( 27, 4, 4 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 101 ){
                if( lexer.get_byte_at( lexer.byte_offset  + 2 ) == 116 ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 8, 11, 1 ) && lexer.byte_length  > 3 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 3 ){
                        return
                    } else if( isTokenActive( 23, tk_row ) ){
                        lexer.setToken( 23, 3, 3 );
                        return
                    }
                }
            }
        }
    }
    break;
    case 116: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 116 ){
            if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 104 ){
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 36, 2, token_sequence_lookup ) ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 8, 11, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 13, tk_row ) ){
                        lexer.setToken( 13, 4, 4 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 111 ){
                if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 8, 11, 1 ) && lexer.byte_length  > 2 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 2 ){
                    return
                } else if( isTokenActive( 25, tk_row ) ){
                    lexer.setToken( 25, 2, 2 );
                    return
                }
            }
        }
    }
    break;
    case 117: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 117 ){
            if( 4 == compare( lexer, lexer.byte_offset  + 1, 72, 4, token_sequence_lookup ) ){
                if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 8, 11, 1 ) && lexer.byte_length  > 5 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 5 ){
                    return
                } else if( isTokenActive( 28, tk_row ) ){
                    lexer.setToken( 28, 5, 5 );
                    return
                }
            }
        }
    }
    break;
    default: 
    break
};
    if( isTokenActive( 11, tk_row ) && pre_scan( lexer, 0 ) && token_production( lexer, hc_state_hash_token, 8, 11, 1 ) ){
    return
} else if( isTokenActive( 39, tk_row ) && pre_scan( lexer, 1 ) && token_production( lexer, hc_comment, 9, 39, 2 ) ){
    return
} else if( isTokenActive( 8, tk_row ) && lexer.isSP( true ) ){
    return
} else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) ){
    return
} else if( isTokenActive( 2, tk_row ) && lexer.isSym( true ) ){
    return
} else if( isTokenActive( 7, tk_row ) && lexer.isNL(  ) ){
    return
} else if( isTokenActive( 5, tk_row ) && lexer.isNum(  ) ){
    return
}
}

function scan(lexer, tk_row, pk_row){
    if( ( ( lexer._type ) <= 0 ) )scan_core( lexer, tk_row );;
    if( ( pk_row  > 0 && isTokenActive( lexer._type, pk_row ) ) ){
    while( ( isTokenActive( lexer._type, pk_row ) ) ) {
            lexer.next(  );
            scan_core( lexer, tk_row )
        }
}
}
        function pre_scan(lexer, tk_row){
    var tk_length = lexer.token_length;;
    var bt_length = lexer.byte_length;;
    var type_cache = lexer._type;;
    scan( lexer, tk_row, 0 );
    var type_out = lexer._type;;
    lexer._type  = type_cache;
    lexer.token_length  = tk_length;
    lexer.byte_length  = bt_length;
    return type_out  > 0
}

function branch_09fd4c587b3f4d77(state, db, prod){
    add_reduce( state, 3, 2 );
    return 0
}

function branch_1e3ac8120e7b258b(state, db, prod){
    add_reduce( state, 4, 1 );
    return 0
}

function branch_235fbc4dfe75738d(state, db, prod){
    add_reduce( state, 3, 9 );
    return 0
}

function branch_3972b97ee4a58f35(state, db, prod){
    scan( state.lexer, 2, 3 );
    if( state.lexer._type  == 13 ){
    state.push_fn( set_production /*2*/, 2 );
    consume( state );
    state.push_fn( branch_48fab4c983fae22f, 2 );
    return hc_instruction_sequence( state, db, 0 )
} else {
    add_reduce( state, 1, 7 );
    return 2
};
    return - 1
}

function branch_39f2af0413647aa3(state, db, prod){
    scan( state.lexer, 4, 3 );
    if( state.lexer._type  == 32 ){
    state.push_fn( set_production /*0*/, 0 );
    state.push_fn( branch_1e3ac8120e7b258b, 0 );
    return hc_expected_symbols( state, db, 0 )
} else {
    add_reduce( state, 3, 3 );
    return 0
};
    return - 1
}

function branch_459007ee37a2e5df(state, db, prod){
    add_reduce( state, 2, 14 );
    return 0
}

function branch_48fab4c983fae22f(state, db, prod){
    add_reduce( state, 3, 6 );
    return 0
}

function branch_52d31ea33c48b584(state, db, prod){
    add_reduce( state, 3, 18 );
    return 0
}

function branch_60d1f22634e1d8d8(state, db, prod){
    add_reduce( state, 2, 12 );
    return 0
}

function branch_69ca4ad0f6046c0f(state, db, prod){
    scan( state.lexer, 5, 3 );
    if( ( state.lexer._type  == 17 ) ){
    consume( state );
    add_reduce( state, 5, 17 );
    return 0
};
    return - 1
}

function branch_6cc896d4b951c283(state, db, prod){
    scan( state.lexer, 6, 3 );
    state.push_fn( branch_9c4bb851946d7c56, 0 );
    return hc_start_list_1( state, db, 0 )
}

function branch_705a566bcd70e862(state, db, prod){
    add_reduce( state, 2, 24 );
    return hc_start_list_1_goto( state, db, 10 )
}

function branch_768e153436cfbac5(state, db, prod){
    scan( state.lexer, 6, 3 );
    if( ( isTokenActive( state.lexer._type, 7 ) ) ){
    state.push_fn( branch_705a566bcd70e862, 10 );
    return hc_instructions( state, db, 0 )
};
    return - 1
}

function branch_77895a800343abdf(state, db, prod){
    add_reduce( state, 4, 21 );
    return 0
}

function branch_895aa123fa566ad1(state, db, prod){
    add_reduce( state, 2, 13 );
    return 0
}

function branch_8fe8831ed25331e2(state, db, prod){
    add_reduce( state, 2, 11 );
    return 0
}

function branch_97d972e3a6b0bbc5(state, db, prod){
    add_reduce( state, 1, 8 );
    return hc_start_list_1_goto( state, db, 10 )
}

function branch_9c4bb851946d7c56(state, db, prod){
    scan( state.lexer, 8, 3 );
    if( state.lexer._type  == 30 ){
    scan( state.lexer, 9, 3 );
    state.push_fn( branch_39f2af0413647aa3, 0 );
    return hc_on_fail( state, db, 0 )
} else if( state.lexer._type  == 32 ){
    state.push_fn( set_production /*0*/, 0 );
    state.push_fn( branch_09fd4c587b3f4d77, 0 );
    return hc_expected_symbols( state, db, 0 )
} else {
    add_reduce( state, 2, 4 );
    return 0
};
    return - 1
}

function branch_a83600598866d668(state, db, prod){
    add_reduce( state, 2, 25 );
    return 12
}

function branch_bff928657df1f20d(state, db, prod){
    add_reduce( state, 3, 20 );
    return 5
}

function branch_c3a15c203f068010(state, db, prod){
    scan( state.lexer, 10, 3 );
    if( ( state.lexer._type  == 36 ) ){
    consume( state );
    add_reduce( state, 3, 0 );
    return 0
};
    return - 1
}

function branch_ce56f6936b79527e(state, db, prod){
    scan( state.lexer, 11, 3 );
    if( state.lexer._type  == 38 ){
    state.push_fn( set_production /*6*/, 6 );
    state.push_fn( branch_77895a800343abdf, 6 );
    return hc_expected_symbols_group_55_0_( state, db, 0 )
} else {
    add_reduce( state, 3, 22 );
    return 6
};
    return - 1
}

function branch_d796cd383a3db3aa(state, db, prod){
    scan( state.lexer, 5, 3 );
    if( ( state.lexer._type  == 17 ) ){
    consume( state );
    add_reduce( state, 6, 10 );
    return 0
};
    return - 1
}

function branch_d813fa2bcf08846d(state, db, prod){
    scan( state.lexer, 12, 3 );
    if( ( state.lexer._type  == 12 ) ){
    consume( state );
    add_reduce( state, 3, 23 );
    return 7
};
    return - 1
}

function branch_db9c3b80ca83c085(state, db, prod){
    add_reduce( state, 1, 8 );
    return hc_instruction_list_42_goto( state, db, 11 )
}

function branch_e881e748d0da91c5(state, db, prod){
    add_reduce( state, 1, 8 );
    return hc_instruction_sequence_goto( state, db, 3 )
}

function branch_e9105a4f292094df(state, db, prod){
    add_reduce( state, 2, 24 );
    return 0
}

function branch_f3334491ca3b0ba8(state, db, prod){
    scan( state.lexer, 13, 3 );
    if( ( state.lexer._type  == 16 ) ){
    consume( state );
    state.push_fn( branch_d796cd383a3db3aa, 4 );
    return hc_instructions( state, db, 0 )
};
    return - 1
}

function hc_start(state, db, prod){
    state.push_fn( branch_6cc896d4b951c283, 0 );
    return hc_state_declaration( state, db, 0 )
}

function hc_state_declaration(state, db, prod){
    scan( state.lexer, 14, 3 );
    if( state.lexer._type  == 9 ){
    consume( state );
    scan( state.lexer, 15, 3 );
    if( ( state.lexer._type  == 10 ) ){
        consume( state );
        scan( state.lexer, 16, 3 );
        if( ( state.lexer._type  == 11 ) ){
            consume( state );
            scan( state.lexer, 12, 3 );
            if( ( state.lexer._type  == 12 ) ){
                consume( state );
                add_reduce( state, 4, 5 );
                return 1
            }
        }
    }
};
    return - 1
}

function hc_instructions(state, db, prod){
    state.push_fn( branch_3972b97ee4a58f35, 0 );
    return hc_instruction( state, db, 0 )
}

function hc_instruction_sequence(state, db, prod){
    state.push_fn( branch_e881e748d0da91c5, 3 );
    return hc_instruction( state, db, 0 )
}

function hc_instruction_sequence_goto(state, db, prod){
    while( true ) {
        switch(prod){
            case 3: 
            {
                scan( state.lexer, 2, 3 );
                if( state.lexer._type  == 13 ){
                    state.push_fn( hc_instruction_sequence_goto /*hc_instruction_sequence_goto( state, db, 3 )*/, 3 );
                    scan( state.lexer, 17, 3 );
                    consume( state );
                    state.push_fn( branch_235fbc4dfe75738d, 3 );
                    return hc_instruction( state, db, 0 )
                }
            }
            break;
            default: 
            break
        };
        break
    };
    return ( prod  == 3 ) ? prod  : - 1
}

function hc_instruction(state, db, prod){
    scan( state.lexer, 6, 3 );
    if( state.lexer._type  == 14 ){
    state.push_fn( set_production /*4*/, 4 );
    consume( state );
    scan( state.lexer, 18, 3 );
    if( ( state.lexer._type  == 15 ) ){
        consume( state );
        state.push_fn( branch_f3334491ca3b0ba8, 4 );
        return hc_id_list( state, db, 0 )
    };
    return - 1
} else if( state.lexer._type  == 18 ){
    state.push_fn( set_production /*4*/, 4 );
    consume( state );
    state.push_fn( branch_8fe8831ed25331e2, 4 );
    return hc_id_list( state, db, 0 )
} else if( state.lexer._type  == 19 ){
    state.push_fn( set_production /*4*/, 4 );
    consume( state );
    state.push_fn( branch_60d1f22634e1d8d8, 4 );
    return hc_id_list( state, db, 0 )
} else if( state.lexer._type  == 20 ){
    state.push_fn( set_production /*4*/, 4 );
    consume( state );
    state.push_fn( branch_895aa123fa566ad1, 4 );
    return hc_id_list( state, db, 0 )
} else if( state.lexer._type  == 21 ){
    state.push_fn( set_production /*4*/, 4 );
    consume( state );
    state.push_fn( branch_459007ee37a2e5df, 4 );
    return hc_state_declaration( state, db, 0 )
} else if( state.lexer._type  == 22 ){
    state.push_fn( set_production /*4*/, 4 );
    consume( state );
    scan( state.lexer, 19, 3 );
    if( ( state.lexer._type  == 5 ) ){
        consume( state );
        scan( state.lexer, 19, 3 );
        if( ( state.lexer._type  == 5 ) ){
            consume( state );
            add_reduce( state, 3, 15 );
            return 0
        }
    };
    return - 1
} else if( state.lexer._type  == 23 ){
    state.push_fn( set_production /*4*/, 4 );
    consume( state );
    scan( state.lexer, 20, 3 );
    if( ( state.lexer._type  == 24 ) ){
        consume( state );
        scan( state.lexer, 21, 3 );
        if( ( state.lexer._type  == 25 ) ){
            consume( state );
            scan( state.lexer, 19, 3 );
            if( ( state.lexer._type  == 5 ) ){
                consume( state );
                add_reduce( state, 4, 16 );
                return 0
            }
        }
    };
    return - 1
} else if( state.lexer._type  == 26 ){
    state.push_fn( set_production /*4*/, 4 );
    consume( state );
    scan( state.lexer, 21, 3 );
    if( ( state.lexer._type  == 25 ) ){
        consume( state );
        scan( state.lexer, 13, 3 );
        if( ( state.lexer._type  == 16 ) ){
            consume( state );
            state.push_fn( branch_69ca4ad0f6046c0f, 4 );
            return hc_instruction_list_42( state, db, 0 )
        }
    };
    return - 1
} else if( state.lexer._type  == 27 ){
    state.push_fn( set_production /*4*/, 4 );
    consume( state );
    scan( state.lexer, 22, 3 );
    if( ( state.lexer._type  == 28 ) ){
        consume( state );
        state.push_fn( branch_52d31ea33c48b584, 4 );
        return hc_id_list( state, db, 0 )
    };
    return - 1
} else if( state.lexer._type  == 29 ){
    state.push_fn( set_production /*4*/, 4 );
    consume( state );
    scan( state.lexer, 19, 3 );
    if( ( state.lexer._type  == 5 ) ){
        consume( state );
        add_reduce( state, 2, 19 );
        return 0
    };
    return - 1
};
    return - 1
}

function hc_on_fail(state, db, prod){
    scan( state.lexer, 9, 3 );
    if( state.lexer._type  == 30 ){
    consume( state );
    scan( state.lexer, 23, 3 );
    if( ( state.lexer._type  == 31 ) ){
        consume( state );
        state.push_fn( branch_bff928657df1f20d, 5 );
        return hc_instructions( state, db, 0 )
    }
};
    return - 1
}

function hc_expected_symbols(state, db, prod){
    scan( state.lexer, 24, 3 );
    if( state.lexer._type  == 32 ){
    consume( state );
    scan( state.lexer, 25, 3 );
    if( state.lexer._type  == 33 ){
        consume( state );
        scan( state.lexer, 15, 3 );
        state.push_fn( branch_ce56f6936b79527e, 0 );
        return hc_id_list( state, db, 0 )
    }
};
    return - 1
}

function hc_id_list(state, db, prod){
    scan( state.lexer, 15, 3 );
    if( state.lexer._type  == 10 ){
    consume( state );
    scan( state.lexer, 19, 3 );
    if( ( state.lexer._type  == 5 ) ){
        state.push_fn( branch_d813fa2bcf08846d, 7 );
        return hc_id_list_list_61( state, db, 0 )
    }
};
    return - 1
}

function hc_state_hash_token(state, db, prod){
    scan( state.lexer, 26, 3 );
    if( state.lexer._type  == 3 || state.lexer._type  == 5 || state.lexer._type  == 34 ){
    consume( state );
    return hc_state_hash_token_goto( state, db, 8 )
};
    return - 1
}

function hc_state_hash_token_goto(state, db, prod){
    scan( state.lexer, 27, 28 );
    if( state.lexer._type  == 34 ){
    state.push_fn( hc_state_hash_token_goto /*hc_state_hash_token_goto( state, db, 8 )*/, 8 );
    scan( state.lexer, 29, 28 );
    consume( state );
    add_reduce( state, 2, 0 );
    return 0
} else if( state.lexer._type  == 3 ){
    state.push_fn( hc_state_hash_token_goto /*hc_state_hash_token_goto( state, db, 8 )*/, 8 );
    scan( state.lexer, 30, 28 );
    consume( state );
    add_reduce( state, 2, 0 );
    return 0
} else if( state.lexer._type  == 5 ){
    state.push_fn( hc_state_hash_token_goto /*hc_state_hash_token_goto( state, db, 8 )*/, 8 );
    scan( state.lexer, 31, 28 );
    consume( state );
    add_reduce( state, 2, 0 );
    return 0
};
    return ( prod  == 8 ) ? prod  : - 1
}

function hc_comment(state, db, prod){
    scan( state.lexer, 32, 3 );
    if( state.lexer._type  == 35 ){
    consume( state );
    scan( state.lexer, 33, 28 );
    if( state.lexer._type  == 36 ){
        state.push_fn( set_production /*9*/, 9 );
        consume( state );
        add_reduce( state, 2, 0 );
        return 0
    } else {
        state.push_fn( set_production /*9*/, 9 );
        state.push_fn( branch_c3a15c203f068010, 9 );
        return hc_comment_list_82( state, db, 0 )
    }
};
    return - 1
}

function hc_start_list_1(state, db, prod){
    state.push_fn( branch_97d972e3a6b0bbc5, 10 );
    return hc_instructions( state, db, 0 )
}

function hc_start_list_1_goto(state, db, prod){
    while( true ) {
        switch(prod){
            case 10: 
            {
                scan( state.lexer, 8, 3 );
                if( isTokenActive( state.lexer._type, 34 ) ){
                    state.push_fn( hc_start_list_1_goto /*hc_start_list_1_goto( state, db, 10 )*/, 10 );
                    scan( state.lexer, 6, 3 );
                    if( ( isTokenActive( state.lexer._type, 7 ) ) ){
                        state.push_fn( branch_e9105a4f292094df, 10 );
                        return hc_instructions( state, db, 0 )
                    };
                    return - 1
                } else if( state.lexer._type  == 14 ){
                    var fk1 = state.fork( db );;
                    fk1.push_fn( set_production /*10*/, 10 );
                    state.push_fn( branch_768e153436cfbac5, 10 );
                    return 0
                }
            }
            break;
            default: 
            break
        };
        break
    };
    return ( prod  == 10 ) ? prod  : - 1
}

function hc_instruction_list_42(state, db, prod){
    state.push_fn( branch_db9c3b80ca83c085, 11 );
    return hc_state_declaration( state, db, 0 )
}

function hc_instruction_list_42_goto(state, db, prod){
    scan( state.lexer, 35, 3 );
    if( state.lexer._type  == 37 ){
    state.push_fn( hc_instruction_list_42_goto /*hc_instruction_list_42_goto( state, db, 11 )*/, 11 );
    scan( state.lexer, 36, 3 );
    consume( state );
    state.push_fn( branch_235fbc4dfe75738d, 11 );
    return hc_state_declaration( state, db, 0 )
};
    return ( prod  == 11 ) ? prod  : - 1
}

function hc_expected_symbols_group_55_0_(state, db, prod){
    scan( state.lexer, 37, 3 );
    if( state.lexer._type  == 38 ){
    consume( state );
    scan( state.lexer, 15, 3 );
    if( ( state.lexer._type  == 10 ) ){
        state.push_fn( branch_a83600598866d668, 12 );
        return hc_id_list( state, db, 0 )
    }
};
    return - 1
}

function hc_id_list_list_61(state, db, prod){
    scan( state.lexer, 19, 3 );
    if( state.lexer._type  == 5 ){
    consume( state );
    scan( state.lexer, 3, 3 );
    add_reduce( state, 1, 8 );
    return hc_id_list_list_61_goto( state, db, 13 )
};
    return - 1
}

function hc_id_list_list_61_goto(state, db, prod){
    scan( state.lexer, 38, 3 );
    if( state.lexer._type  == 5 ){
    state.push_fn( hc_id_list_list_61_goto /*hc_id_list_list_61_goto( state, db, 13 )*/, 13 );
    scan( state.lexer, 19, 3 );
    consume( state );
    add_reduce( state, 2, 24 );
    return 0
};
    return ( prod  == 13 ) ? prod  : - 1
}

function hc_comment_list_82(state, db, prod){
    scan( state.lexer, 39, 28 );
    if( isTokenActive( state.lexer._type, 40 ) ){
    consume( state );
    add_reduce( state, 1, 8 );
    return hc_comment_list_82_goto( state, db, 14 )
};
    return - 1
}

function hc_comment_list_82_goto(state, db, prod){
    scan( state.lexer, 33, 28 );
    if( state.lexer._type  == 2 ){
    state.push_fn( hc_comment_list_82_goto /*hc_comment_list_82_goto( state, db, 14 )*/, 14 );
    scan( state.lexer, 41, 3 );
    consume( state );
    add_reduce( state, 2, 24 );
    return 0
} else if( state.lexer._type  == 8 ){
    state.push_fn( hc_comment_list_82_goto /*hc_comment_list_82_goto( state, db, 14 )*/, 14 );
    scan( state.lexer, 3, 42 );
    consume( state );
    add_reduce( state, 2, 24 );
    return 0
} else if( state.lexer._type  == 7 ){
    state.push_fn( hc_comment_list_82_goto /*hc_comment_list_82_goto( state, db, 14 )*/, 14 );
    scan( state.lexer, 3, 43 );
    consume( state );
    add_reduce( state, 2, 24 );
    return 0
} else if( state.lexer._type  == 3 ){
    state.push_fn( hc_comment_list_82_goto /*hc_comment_list_82_goto( state, db, 14 )*/, 14 );
    scan( state.lexer, 44, 3 );
    consume( state );
    add_reduce( state, 2, 24 );
    return 0
} else if( state.lexer._type  == 5 ){
    state.push_fn( hc_comment_list_82_goto /*hc_comment_list_82_goto( state, db, 14 )*/, 14 );
    scan( state.lexer, 19, 3 );
    consume( state );
    add_reduce( state, 2, 24 );
    return 0
};
    return ( prod  == 14 ) ? prod  : - 1
} 

        function recognize_primary( string, production){

            //create the input data buffer. 
            const temp_buffer = new Uint8Array(string.length * 4);
            
            const actual_length = fillByteBufferWithUTF8FromString(string, temp_buffer, temp_buffer.length);

            const resolved_buffer = new Uint8Array(temp_buffer.buffer, 0, actual_length);

            switch(production){
                case 0 : return recognize(resolved_buffer, actual_length, 0, hc_start);
            }
    
            return {invalid: {}, valid:{}};
        }

        return {
            init_table: ()=> {
                const table = new Uint8Array(382976);
                init_table(table);
                return table;
            },
            recognize: recognize_primary,
            create_iterator: data => new ParserStateIterator(data)
        };
    });

    const reduce_functions = [(_,s)=>s[s.length-1], (env, sym, pos)=> ({type:"state",id:sym[0],instructions:sym[1],fail:sym[2],symbol_meta:sym[3]}) /*0*/,
(env, sym, pos)=> ({type:"state",id:sym[0],instructions:sym[1],symbol_meta:sym[2]}) /*1*/,
(env, sym, pos)=> ({type:"state",id:sym[0],instructions:sym[1],fail:sym[2]}) /*2*/,
(env, sym, pos)=> ({type:"state",id:sym[0],instructions:sym[1]}) /*3*/,
(env, sym, pos)=> (sym[2]) /*4*/,
(env, sym, pos)=> ((sym[0].then=sym[2],sym[0])) /*5*/,
(env, sym, pos)=> ((sym[0])) /*6*/,
(env, sym, pos)=> ([sym[0]]) /*7*/,
(env, sym, pos)=> ((sym[0].push(sym[2]),sym[0])) /*8*/,
(env, sym, pos)=> ({type:"prod",production_ids:sym[2],instructions:sym[4]}) /*9*/,
(env, sym, pos)=> ({type:"consume",token_ids:sym[1]}) /*10*/,
(env, sym, pos)=> ({type:"peek",token_ids:sym[1]}) /*11*/,
(env, sym, pos)=> ({type:"assert",token_ids:sym[1]}) /*12*/,
(env, sym, pos)=> ({type:"goto",state:sym[1]}) /*13*/,
(env, sym, pos)=> ({type:"goto",len:parseInt(sym[1]),reduce_fn:parseInt(sym[2])}) /*14*/,
(env, sym, pos)=> ({type:"set-prod",id:parseInt(sym[3])}) /*15*/,
(env, sym, pos)=> ({type:"fork-to",states:sym[3]}) /*16*/,
(env, sym, pos)=> ({type:"scan-until",token_ids:sym[2]}) /*17*/,
(env, sym, pos)=> ({type:"pop",len:parseInt(sym[1])}) /*18*/,
(env, sym, pos)=> ({type:"on-fail",instruction:sym[2]}) /*19*/,
(env, sym, pos)=> ({type:"symbols",expected:sym[2],skipped:sym[3]||[]}) /*20*/,
(env, sym, pos)=> ({type:"symbols",expected:sym[2],skipped:null||[]}) /*21*/,
(env, sym, pos)=> (sym[1].map(i=>parseInt(i))) /*22*/,
(env, sym, pos)=> ((sym[0].push(sym[1]),sym[0])) /*23*/,
(env, sym, pos)=> (sym[1]) /*24*/];

    export default ParserFactory
        (reduce_functions, undefined, recognizer_initializer, {start:0});