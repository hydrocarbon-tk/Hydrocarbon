
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
    

        var token_lookup = new Uint32Array([40,64,0,128,131456,4096,384,4096,1543037312,4110,262528,4096,4480,4096,1527030146,4126,8388992,4608,8388992,4096,1543037314,4126,33152,4096,384,4352,1410,6160,8692098,4112,33154,4112,384,4128,896,4096,1408,4096,2432,4096,1535139840,14,1535140224,4110,1526726656,14,1526727040,4110,65920,4096,7864704,4096,416,4096,2147549568,4096,67109248,4096,392,4097,536871296,4096,384,4104,384,4112,424,4160,40,4160,0,4096,0,4160,8,4096,32,4096,384,4224,428,4352,7897474,4112,303490,4112,1535115648,4622,8576,4096,384,4608,262528,5120,384,5120,384,6144,4512,4096,428,4096,428,0,388,4096,128,4096,256,4096,392,4096]);;
        var token_sequence_lookup = new Uint8Array([91,93,40,41,115,121,109,98,111,108,115,58,95,47,42,47,44,69,78,68,95,79,70,95,80,82,79,68,85,67,84,73,79,78,116,104,101,110,111,110,112,114,111,100,110,111,99,111,110,115,117,109,101,97,115,115,101,114,116,103,111,116,111,114,101,100,117,99,101,102,111,114,107,117,110,116,105,108,101,120,112,101,99,116,101,100,115,107,105,112,112,101,100,112,101,101,107,114,101,112,101,97,116,102,97,105,108,101,110,100,115,116,97,116,101,115,99,97,110,115,101,116,112,97,115,115,112,111,112]);;
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
            if( isTokenActive( 17, tk_row ) ){
                lexer.setToken( 17, 1, 1 );
                return
            }
        }
    }
    break;
    case 41: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 41 ){
            if( isTokenActive( 18, tk_row ) ){
                lexer.setToken( 18, 1, 1 );
                return
            }
        }
    }
    break;
    case 42: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 42 ){
            if( isTokenActive( 40, tk_row ) && lexer.get_byte_at( lexer.byte_offset  + 1 ) == 47 ){
                lexer.setToken( 40, 2, 2 );
                return
            }
        }
    }
    break;
    case 44: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 44 ){
            if( isTokenActive( 42, tk_row ) ){
                lexer.setToken( 42, 1, 1 );
                return
            }
        }
    }
    break;
    case 47: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 47 ){
            if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 42 ){
                if( isTokenActive( 44, tk_row ) && token_production( lexer, hc_comment, 12, 44, 2 ) && lexer.byte_length  > 2 ){
                    return
                } else if( isTokenActive( 39, tk_row ) ){
                    lexer.setToken( 39, 2, 2 );
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
            if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 1 ){
                return
            } else if( isTokenActive( 38, tk_row ) ){
                lexer.setToken( 38, 1, 1 );
                return
            }
        }
    }
    break;
    case 97: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 97 ){
            if( 5 == compare( lexer, lexer.byte_offset  + 1, 54, 5, token_sequence_lookup ) ){
                if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 6 ){
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
    case 99: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 99 ){
            if( 6 == compare( lexer, lexer.byte_offset  + 1, 47, 6, token_sequence_lookup ) ){
                if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 7 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 7 ){
                    return
                } else if( isTokenActive( 20, tk_row ) ){
                    lexer.setToken( 20, 7, 7 );
                    return
                }
            }
        }
    }
    break;
    case 101: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 101 ){
            if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 120 ){
                if( 6 == compare( lexer, lexer.byte_offset  + 2, 80, 6, token_sequence_lookup ) ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 8 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 8 ){
                        return
                    } else if( isTokenActive( 37, tk_row ) ){
                        lexer.setToken( 37, 8, 8 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 110 ){
                if( lexer.get_byte_at( lexer.byte_offset  + 2 ) == 100 ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 3 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 3 ){
                        return
                    } else if( isTokenActive( 34, tk_row ) ){
                        lexer.setToken( 34, 3, 3 );
                        return
                    }
                }
            }
        }
    }
    break;
    case 102: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 102 ){
            if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 111 ){
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 71, 2, token_sequence_lookup ) ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 27, tk_row ) ){
                        lexer.setToken( 27, 4, 4 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 97 ){
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 105, 2, token_sequence_lookup ) ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 35, tk_row ) ){
                        lexer.setToken( 35, 4, 4 );
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
            if( 3 == compare( lexer, lexer.byte_offset  + 1, 60, 3, token_sequence_lookup ) ){
                if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 4 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                    return
                } else if( isTokenActive( 23, tk_row ) ){
                    lexer.setToken( 23, 4, 4 );
                    return
                }
            }
        }
    }
    break;
    case 110: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 110 ){
            if( 8 == compare( lexer, lexer.byte_offset  + 1, 45, 8, token_sequence_lookup ) ){
                if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 9 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 9 ){
                    return
                } else if( isTokenActive( 19, tk_row ) ){
                    lexer.setToken( 19, 9, 9 );
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
                if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 2 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 2 ){
                    return
                } else if( isTokenActive( 15, tk_row ) ){
                    lexer.setToken( 15, 2, 2 );
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
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 16, tk_row ) ){
                        lexer.setToken( 16, 4, 4 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 101 ){
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 95, 2, token_sequence_lookup ) ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 21, tk_row ) ){
                        lexer.setToken( 21, 4, 4 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 97 ){
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 124, 2, token_sequence_lookup ) ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 33, tk_row ) ){
                        lexer.setToken( 33, 4, 4 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 111 ){
                if( lexer.get_byte_at( lexer.byte_offset  + 2 ) == 112 ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 3 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 3 ){
                        return
                    } else if( isTokenActive( 30, tk_row ) ){
                        lexer.setToken( 30, 3, 3 );
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
            if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 101 ){
                if( lexer.get_byte_at( lexer.byte_offset  + 2 ) == 100 ){
                    if( 3 == compare( lexer, lexer.byte_offset  + 3, 66, 3, token_sequence_lookup ) ){
                        if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 6 ){
                            return
                        } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 6 ){
                            return
                        } else if( isTokenActive( 24, tk_row ) ){
                            lexer.setToken( 24, 6, 6 );
                            return
                        }
                    }
                } else if( lexer.get_byte_at( lexer.byte_offset  + 2 ) == 112 ){
                    if( 3 == compare( lexer, lexer.byte_offset  + 3, 100, 3, token_sequence_lookup ) ){
                        if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 6 ){
                            return
                        } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 6 ){
                            return
                        } else if( isTokenActive( 41, tk_row ) ){
                            lexer.setToken( 41, 6, 6 );
                            return
                        }
                    }
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
                    if( isTokenActive( 36, tk_row ) ){
                        lexer.setToken( 36, 8, 8 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 107 ){
                if( 5 == compare( lexer, lexer.byte_offset  + 2, 88, 5, token_sequence_lookup ) ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 7 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 7 ){
                        return
                    } else if( isTokenActive( 43, tk_row ) ){
                        lexer.setToken( 43, 7, 7 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 116 ){
                if( 3 == compare( lexer, lexer.byte_offset  + 2, 112, 3, token_sequence_lookup ) ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 5 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 5 ){
                        return
                    } else if( isTokenActive( 9, tk_row ) ){
                        lexer.setToken( 9, 5, 5 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 99 ){
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 117, 2, token_sequence_lookup ) ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 28, tk_row ) ){
                        lexer.setToken( 28, 4, 4 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 101 ){
                if( lexer.get_byte_at( lexer.byte_offset  + 2 ) == 116 ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 3 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 3 ){
                        return
                    } else if( isTokenActive( 25, tk_row ) ){
                        lexer.setToken( 25, 3, 3 );
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
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 13, tk_row ) ){
                        lexer.setToken( 13, 4, 4 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 111 ){
                if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 2 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 2 ){
                    return
                } else if( isTokenActive( 26, tk_row ) ){
                    lexer.setToken( 26, 2, 2 );
                    return
                }
            }
        }
    }
    break;
    case 117: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 117 ){
            if( 4 == compare( lexer, lexer.byte_offset  + 1, 74, 4, token_sequence_lookup ) ){
                if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 5 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 5 ){
                    return
                } else if( isTokenActive( 29, tk_row ) ){
                    lexer.setToken( 29, 5, 5 );
                    return
                }
            }
        }
    }
    break;
    default: 
    break
};
    if( isTokenActive( 11, tk_row ) && pre_scan( lexer, 0 ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) ){
    return
} else if( isTokenActive( 44, tk_row ) && pre_scan( lexer, 1 ) && token_production( lexer, hc_comment, 12, 44, 2 ) ){
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
} else if( isTokenActive( 31, tk_row ) && false ){
    return
} else if( isTokenActive( 32, tk_row ) && false ){
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

function branch_023ad452e95fc4d4(state, db, prod){
    scan( state.lexer, 2, 3 );
    if( ( state.lexer._type  == 17 ) ){
    consume( state );
    state.push_fn( branch_984400a7b7eeeca0, 4 );
    return hc_instruction_sequence( state, db, 0 )
};
    return - 1
}

function branch_09fd4c587b3f4d77(state, db, prod){
    add_reduce( state, 3, 2 );
    return 0
}

function branch_10dd5711e10f6933(state, db, prod){
    add_reduce( state, 2, 36 );
    return 19
}

function branch_1e3ac8120e7b258b(state, db, prod){
    add_reduce( state, 4, 1 );
    return 0
}

function branch_20b33064645a28fc(state, db, prod){
    add_reduce( state, 2, 7 );
    return 0
}

function branch_2b54638e04cc6687(state, db, prod){
    add_reduce( state, 1, 10 );
    return 0
}

function branch_2d0c7425918eb69d(state, db, prod){
    add_reduce( state, 2, 33 );
    return 0
}

function branch_2f5fa2fd42fd13a2(state, db, prod){
    add_reduce( state, 4, 6 );
    return 0
}

function branch_3dca03383dc68a2c(state, db, prod){
    scan( state.lexer, 4, 3 );
    state.push_fn( branch_f7c38a23d984a82d, 0 );
    return hc_top_level_instructions( state, db, 0 )
}

function branch_43387d24ff133a9b(state, db, prod){
    scan( state.lexer, 2, 3 );
    if( ( state.lexer._type  == 17 ) ){
    consume( state );
    state.push_fn( branch_76a93eaf5ae46daa, 5 );
    return hc_instruction_sequence( state, db, 0 )
};
    return - 1
}

function branch_4b65d377f883fa51(state, db, prod){
    scan( state.lexer, 5, 3 );
    if( ( state.lexer._type  == 18 ) ){
    consume( state );
    add_reduce( state, 5, 14 );
    return 0
};
    return - 1
}

function branch_4c2bb1582c8a31b5(state, db, prod){
    scan( state.lexer, 4, 3 );
    state.push_fn( branch_9c265f5b6d1bf80b, 0 );
    return hc_top_level_instructions( state, db, 0 )
}

function branch_6349e72592720717(state, db, prod){
    scan( state.lexer, 6, 3 );
    if( ( state.lexer._type  == 12 ) ){
    consume( state );
    add_reduce( state, 3, 32 );
    return 10
};
    return - 1
}

function branch_654a486787e683b1(state, db, prod){
    scan( state.lexer, 7, 3 );
    if( state.lexer._type  == 13 ){
    var pk = state.lexer.copy_in_place(  );;
    pk.next(  );
    scan( pk, 8, 3 );
    if( pk._type  == 23 ){
        consume( state );
        scan( state.lexer, 9, 3 );
        state.push_fn( branch_dac26af36fb59a26, 0 );
        return hc_instruction_sequence_list_14( state, db, 0 )
    } else {
        state.lexer._type  = 13;
        state.push_fn( set_production /*3*/, 3 );
        state.push_fn( branch_20b33064645a28fc, 3 );
        return hc_instruction_sequence_group_15_0_( state, db, 0 )
    }
} else {
    add_reduce( state, 1, 9 );
    return 3
};
    return - 1
}

function branch_6bc163a4236dc980(state, db, prod){
    scan( state.lexer, 2, 3 );
    if( ( state.lexer._type  == 17 ) ){
    consume( state );
    state.push_fn( branch_da8ab27ce69e2c17, 5 );
    return hc_instruction_sequence( state, db, 0 )
};
    return - 1
}

function branch_6d7b70428bd2cd9e(state, db, prod){
    add_reduce( state, 3, 21 );
    return 0
}

function branch_6f8c977aeb2cb03e(state, db, prod){
    scan( state.lexer, 2, 3 );
    if( ( state.lexer._type  == 17 ) ){
    consume( state );
    state.push_fn( branch_4b65d377f883fa51, 5 );
    return hc_instruction_sequence( state, db, 0 )
};
    return - 1
}

function branch_76a93eaf5ae46daa(state, db, prod){
    scan( state.lexer, 5, 3 );
    if( ( state.lexer._type  == 18 ) ){
    consume( state );
    add_reduce( state, 5, 15 );
    return 0
};
    return - 1
}

function branch_772f748da0c90f38(state, db, prod){
    add_reduce( state, 5, 28 );
    return 0
}

function branch_7b8976b8db627626(state, db, prod){
    add_reduce( state, 1, 10 );
    return hc_instruction_sequence_list_11_goto( state, db, 15 )
}

function branch_8033fafe98ed0665(state, db, prod){
    scan( state.lexer, 2, 3 );
    if( ( state.lexer._type  == 17 ) ){
    consume( state );
    state.push_fn( branch_c3261c0cd1921d70, 5 );
    return hc_instruction_sequence( state, db, 0 )
};
    return - 1
}

function branch_8c51bd40b2fde36c(state, db, prod){
    scan( state.lexer, 5, 3 );
    if( ( state.lexer._type  == 18 ) ){
    consume( state );
    add_reduce( state, 5, 20 );
    return 0
};
    return - 1
}

function branch_9697680e19fd145b(state, db, prod){
    add_reduce( state, 1, 10 );
    return hc_instruction_sequence_list_14_goto( state, db, 16 )
}

function branch_984400a7b7eeeca0(state, db, prod){
    scan( state.lexer, 5, 3 );
    if( ( state.lexer._type  == 18 ) ){
    consume( state );
    add_reduce( state, 6, 12 );
    return 4
};
    return - 1
}

function branch_9c265f5b6d1bf80b(state, db, prod){
    scan( state.lexer, 10, 3 );
    if( state.lexer._type  == 15 ){
    scan( state.lexer, 11, 3 );
    state.push_fn( branch_f36773d3578c11c0, 0 );
    return hc_on_fail( state, db, 0 )
} else if( state.lexer._type  == 36 ){
    state.push_fn( set_production /*0*/, 0 );
    state.push_fn( branch_09fd4c587b3f4d77, 0 );
    return hc_expected_symbols( state, db, 0 )
} else {
    add_reduce( state, 2, 4 );
    return 0
};
    return - 1
}

function branch_b1a669e8ef0b29c5(state, db, prod){
    add_reduce( state, 2, 17 );
    return 6
}

function branch_b2d7fc958eb946f5(state, db, prod){
    scan( state.lexer, 12, 3 );
    if( ( state.lexer._type  == 40 ) ){
    consume( state );
    add_reduce( state, 3, 0 );
    return 0
};
    return - 1
}

function branch_b8118bd42c292bfd(state, db, prod){
    scan( state.lexer, 13, 3 );
    if( state.lexer._type  == 43 ){
    state.push_fn( set_production /*9*/, 9 );
    state.push_fn( branch_c0a236bacdca2c24, 9 );
    return hc_expected_symbols_group_92_0_( state, db, 0 )
} else {
    add_reduce( state, 3, 31 );
    return 9
};
    return - 1
}

function branch_c0a236bacdca2c24(state, db, prod){
    add_reduce( state, 4, 30 );
    return 0
}

function branch_c3261c0cd1921d70(state, db, prod){
    scan( state.lexer, 5, 3 );
    if( ( state.lexer._type  == 18 ) ){
    consume( state );
    add_reduce( state, 5, 16 );
    return 0
};
    return - 1
}

function branch_ce6cbbb6288e5d2c(state, db, prod){
    scan( state.lexer, 14, 3 );
    if( state.lexer._type  == 13 ){
    state.push_fn( set_production /*3*/, 3 );
    state.push_fn( branch_20b33064645a28fc, 3 );
    return hc_instruction_sequence_group_15_0_( state, db, 0 )
} else {
    add_reduce( state, 1, 9 );
    return 3
};
    return - 1
}

function branch_d80f5a99d04f32d0(state, db, prod){
    add_reduce( state, 1, 10 );
    return hc_sequence_instruction_list_66_goto( state, db, 18 )
}

function branch_da8ab27ce69e2c17(state, db, prod){
    scan( state.lexer, 5, 3 );
    if( ( state.lexer._type  == 18 ) ){
    consume( state );
    add_reduce( state, 5, 13 );
    return 0
};
    return - 1
}

function branch_dab0f4545fd99b27(state, db, prod){
    add_reduce( state, 1, 10 );
    return hc_top_level_instructions_list_9_goto( state, db, 14 )
}

function branch_dac26af36fb59a26(state, db, prod){
    scan( state.lexer, 14, 3 );
    if( state.lexer._type  == 13 ){
    state.push_fn( set_production /*3*/, 3 );
    state.push_fn( branch_2f5fa2fd42fd13a2, 3 );
    return hc_instruction_sequence_group_15_0_( state, db, 0 )
} else {
    add_reduce( state, 3, 8 );
    return 3
};
    return - 1
}

function branch_e89fa69f88bd30ec(state, db, prod){
    add_reduce( state, 3, 34 );
    return 0
}

function branch_f36773d3578c11c0(state, db, prod){
    scan( state.lexer, 15, 3 );
    if( state.lexer._type  == 36 ){
    state.push_fn( set_production /*0*/, 0 );
    state.push_fn( branch_1e3ac8120e7b258b, 0 );
    return hc_expected_symbols( state, db, 0 )
} else {
    add_reduce( state, 3, 3 );
    return 0
};
    return - 1
}

function branch_f7c38a23d984a82d(state, db, prod){
    scan( state.lexer, 10, 3 );
    if( state.lexer._type  == 36 ){
    var pk = state.lexer.copy_in_place(  );;
    pk.next(  );
    scan( pk, 16, 3 );
    if( pk._type  == 37 ){
        state.lexer._type  = 36;
        state.push_fn( set_production /*8*/, 8 );
        state.push_fn( branch_772f748da0c90f38, 8 );
        return hc_expected_symbols( state, db, 0 )
    }
} else {
    add_reduce( state, 4, 29 );
    return 8
};
    return - 1
}

function branch_f9f1f14d284617c9(state, db, prod){
    add_reduce( state, 1, 10 );
    return hc_top_level_instructions_list_8_goto( state, db, 13 )
}

function hc_start(state, db, prod){
    state.push_fn( branch_4c2bb1582c8a31b5, 0 );
    return hc_state_declaration( state, db, 0 )
}

function hc_state_declaration(state, db, prod){
    scan( state.lexer, 17, 3 );
    if( state.lexer._type  == 9 ){
    consume( state );
    scan( state.lexer, 18, 3 );
    if( ( state.lexer._type  == 10 ) ){
        consume( state );
        scan( state.lexer, 19, 3 );
        if( ( state.lexer._type  == 11 ) ){
            consume( state );
            scan( state.lexer, 6, 3 );
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

function hc_top_level_instructions(state, db, prod){
    scan( state.lexer, 4, 3 );
    if( isTokenActive( state.lexer._type, 20 ) ){
    state.push_fn( set_production /*2*/, 2 );
    state.push_fn( set_production /*0*/, 2 );
    return hc_instruction_sequence( state, db, 0 )
} else if( state.lexer._type  == 19 || state.lexer._type  == 20 || state.lexer._type  == 21 || state.lexer._type  == 22 ){
    state.push_fn( set_production /*2*/, 2 );
    state.push_fn( set_production /*0*/, 2 );
    return hc_top_level_instructions_list_9( state, db, 0 )
} else if( state.lexer._type  == 15 ){
    state.push_fn( set_production /*2*/, 2 );
    state.push_fn( set_production /*0*/, 2 );
    return hc_top_level_instructions_list_8( state, db, 0 )
};
    return - 1
}

function hc_instruction_sequence(state, db, prod){
    scan( state.lexer, 21, 3 );
    if( state.lexer._type  == 14 ){
    state.push_fn( set_production /*3*/, 3 );
    state.lexer.setToken( 2, 0, 0 );
    consume( state );
    return 0
} else if( isTokenActive( state.lexer._type, 22 ) ){
    scan( state.lexer, 23, 3 );
    state.push_fn( branch_654a486787e683b1, 0 );
    return hc_instruction_sequence_list_11( state, db, 0 )
} else if( state.lexer._type  == 23 ){
    scan( state.lexer, 9, 3 );
    state.push_fn( branch_ce6cbbb6288e5d2c, 0 );
    return hc_instruction_sequence_list_14( state, db, 0 )
} else if( state.lexer._type  == 13 ){
    state.push_fn( set_production /*3*/, 3 );
    state.push_fn( branch_2b54638e04cc6687, 3 );
    return hc_instruction_sequence_group_15_0_( state, db, 0 )
};
    state.lexer.setToken( 2, 0, 0 );
    consume( state );
    return 3
}

function hc_prod_branch_instruction(state, db, prod){
    scan( state.lexer, 11, 3 );
    if( state.lexer._type  == 15 ){
    consume( state );
    scan( state.lexer, 24, 3 );
    if( ( state.lexer._type  == 16 ) ){
        consume( state );
        state.push_fn( branch_023ad452e95fc4d4, 4 );
        return hc_id_list( state, db, 0 )
    }
};
    return - 1
}

function hc_token_branch_instruction(state, db, prod){
    scan( state.lexer, 25, 3 );
    if( state.lexer._type  == 19 ){
    state.push_fn( set_production /*5*/, 5 );
    consume( state );
    state.push_fn( branch_6bc163a4236dc980, 5 );
    return hc_id_list( state, db, 0 )
} else if( state.lexer._type  == 20 ){
    state.push_fn( set_production /*5*/, 5 );
    consume( state );
    state.push_fn( branch_6f8c977aeb2cb03e, 5 );
    return hc_id_list( state, db, 0 )
} else if( state.lexer._type  == 21 ){
    state.push_fn( set_production /*5*/, 5 );
    consume( state );
    state.push_fn( branch_43387d24ff133a9b, 5 );
    return hc_id_list( state, db, 0 )
} else if( state.lexer._type  == 22 ){
    state.push_fn( set_production /*5*/, 5 );
    consume( state );
    state.push_fn( branch_8033fafe98ed0665, 5 );
    return hc_id_list( state, db, 0 )
};
    return - 1
}

function hc_goto_instruction(state, db, prod){
    scan( state.lexer, 9, 3 );
    if( state.lexer._type  == 23 ){
    consume( state );
    scan( state.lexer, 17, 3 );
    if( ( state.lexer._type  == 9 ) ){
        state.push_fn( branch_b1a669e8ef0b29c5, 6 );
        return hc_state_declaration( state, db, 0 )
    }
};
    return - 1
}

function hc_sequence_instruction(state, db, prod){
    scan( state.lexer, 23, 3 );
    if( state.lexer._type  == 24 ){
    state.push_fn( set_production /*7*/, 7 );
    consume( state );
    scan( state.lexer, 26, 3 );
    if( ( state.lexer._type  == 5 ) ){
        consume( state );
        scan( state.lexer, 26, 3 );
        if( ( state.lexer._type  == 5 ) ){
            consume( state );
            add_reduce( state, 3, 18 );
            return 0
        }
    };
    return - 1
} else if( state.lexer._type  == 25 ){
    consume( state );
    scan( state.lexer, 27, 3 );
    if( state.lexer._type  == 16 ){
        state.push_fn( set_production /*7*/, 7 );
        consume( state );
        scan( state.lexer, 28, 3 );
        if( ( state.lexer._type  == 26 ) ){
            consume( state );
            scan( state.lexer, 26, 3 );
            if( ( state.lexer._type  == 5 ) ){
                consume( state );
                add_reduce( state, 4, 19 );
                return 0
            }
        };
        return - 1
    } else if( state.lexer._type  == 31 ){
        consume( state );
        scan( state.lexer, 29, 3 );
        if( state.lexer._type  == 32 ){
            state.push_fn( set_production /*7*/, 7 );
            consume( state );
            scan( state.lexer, 26, 3 );
            if( ( state.lexer._type  == 5 ) ){
                consume( state );
                add_reduce( state, 4, 23 );
                return 0
            };
            return - 1
        } else if( state.lexer._type  == 3 ){
            state.push_fn( set_production /*7*/, 7 );
            consume( state );
            scan( state.lexer, 26, 3 );
            if( ( state.lexer._type  == 5 ) ){
                consume( state );
                add_reduce( state, 4, 24 );
                return 0
            };
            return - 1
        }
    }
} else if( state.lexer._type  == 27 ){
    state.push_fn( set_production /*7*/, 7 );
    consume( state );
    scan( state.lexer, 28, 3 );
    if( ( state.lexer._type  == 26 ) ){
        consume( state );
        scan( state.lexer, 2, 3 );
        if( ( state.lexer._type  == 17 ) ){
            consume( state );
            state.push_fn( branch_8c51bd40b2fde36c, 7 );
            return hc_sequence_instruction_list_66( state, db, 0 )
        }
    };
    return - 1
} else if( state.lexer._type  == 28 ){
    state.push_fn( set_production /*7*/, 7 );
    consume( state );
    scan( state.lexer, 30, 3 );
    if( ( state.lexer._type  == 29 ) ){
        consume( state );
        state.push_fn( branch_6d7b70428bd2cd9e, 7 );
        return hc_id_list( state, db, 0 )
    };
    return - 1
} else if( state.lexer._type  == 30 ){
    state.push_fn( set_production /*7*/, 7 );
    consume( state );
    scan( state.lexer, 26, 3 );
    if( ( state.lexer._type  == 5 ) ){
        consume( state );
        add_reduce( state, 2, 22 );
        return 0
    };
    return - 1
} else if( state.lexer._type  == 33 ){
    state.push_fn( set_production /*7*/, 7 );
    consume( state );
    add_reduce( state, 1, 25 );
    return 0
} else if( state.lexer._type  == 34 ){
    state.push_fn( set_production /*7*/, 7 );
    consume( state );
    add_reduce( state, 1, 26 );
    return 0
} else if( state.lexer._type  == 35 ){
    state.push_fn( set_production /*7*/, 7 );
    consume( state );
    add_reduce( state, 1, 27 );
    return 0
};
    return - 1
}

function hc_on_fail(state, db, prod){
    scan( state.lexer, 11, 3 );
    if( state.lexer._type  == 15 ){
    consume( state );
    scan( state.lexer, 31, 3 );
    if( state.lexer._type  == 35 ){
        consume( state );
        scan( state.lexer, 17, 3 );
        state.push_fn( branch_3dca03383dc68a2c, 0 );
        return hc_state_declaration( state, db, 0 )
    }
};
    return - 1
}

function hc_expected_symbols(state, db, prod){
    scan( state.lexer, 32, 3 );
    if( state.lexer._type  == 36 ){
    consume( state );
    scan( state.lexer, 16, 3 );
    if( state.lexer._type  == 37 ){
        consume( state );
        scan( state.lexer, 18, 3 );
        state.push_fn( branch_b8118bd42c292bfd, 0 );
        return hc_id_list( state, db, 0 )
    }
};
    return - 1
}

function hc_id_list(state, db, prod){
    scan( state.lexer, 18, 3 );
    if( state.lexer._type  == 10 ){
    consume( state );
    scan( state.lexer, 26, 3 );
    if( ( state.lexer._type  == 5 ) ){
        state.push_fn( branch_6349e72592720717, 10 );
        return hc_id_list_list_98( state, db, 0 )
    }
};
    return - 1
}

function hc_state_hash_token(state, db, prod){
    scan( state.lexer, 33, 3 );
    if( state.lexer._type  == 3 || state.lexer._type  == 5 || state.lexer._type  == 38 ){
    consume( state );
    return hc_state_hash_token_goto( state, db, 11 )
};
    return - 1
}

function hc_state_hash_token_goto(state, db, prod){
    scan( state.lexer, 34, 35 );
    if( state.lexer._type  == 38 ){
    state.push_fn( hc_state_hash_token_goto /*hc_state_hash_token_goto( state, db, 11 )*/, 11 );
    scan( state.lexer, 36, 35 );
    consume( state );
    add_reduce( state, 2, 0 );
    return 0
} else if( state.lexer._type  == 3 ){
    state.push_fn( hc_state_hash_token_goto /*hc_state_hash_token_goto( state, db, 11 )*/, 11 );
    scan( state.lexer, 37, 35 );
    consume( state );
    add_reduce( state, 2, 0 );
    return 0
} else if( state.lexer._type  == 5 ){
    state.push_fn( hc_state_hash_token_goto /*hc_state_hash_token_goto( state, db, 11 )*/, 11 );
    scan( state.lexer, 38, 35 );
    consume( state );
    add_reduce( state, 2, 0 );
    return 0
};
    return ( prod  == 11 ) ? prod  : - 1
}

function hc_comment(state, db, prod){
    scan( state.lexer, 39, 3 );
    if( state.lexer._type  == 39 ){
    consume( state );
    scan( state.lexer, 40, 35 );
    if( state.lexer._type  == 40 ){
        state.push_fn( set_production /*12*/, 12 );
        consume( state );
        add_reduce( state, 2, 0 );
        return 0
    } else {
        state.push_fn( set_production /*12*/, 12 );
        state.push_fn( branch_b2d7fc958eb946f5, 12 );
        return hc_comment_list_119( state, db, 0 )
    }
};
    return - 1
}

function hc_top_level_instructions_list_8(state, db, prod){
    state.push_fn( branch_f9f1f14d284617c9, 13 );
    return hc_prod_branch_instruction( state, db, 0 )
}

function hc_top_level_instructions_list_8_goto(state, db, prod){
    while( true ) {
        switch(prod){
            case 13: 
            {
                scan( state.lexer, 15, 3 );
                if( state.lexer._type  == 15 ){
                    var pk = state.lexer.copy_in_place(  );;
                    pk.next(  );
                    scan( pk, 24, 3 );
                    if( pk._type  == 16 ){
                        state.lexer._type  = 15;
                        state.push_fn( hc_top_level_instructions_list_8_goto /*hc_top_level_instructions_list_8_goto( state, db, 13 )*/, 13 );
                        scan( state.lexer, 11, 3 );
                        if( ( state.lexer._type  == 15 ) ){
                            state.push_fn( branch_2d0c7425918eb69d, 13 );
                            return hc_prod_branch_instruction( state, db, 0 )
                        };
                        return - 1
                    }
                }
            }
            break;
            default: 
            break
        };
        break
    };
    return ( prod  == 13 ) ? prod  : - 1
}

function hc_top_level_instructions_list_9(state, db, prod){
    state.push_fn( branch_dab0f4545fd99b27, 14 );
    return hc_token_branch_instruction( state, db, 0 )
}

function hc_top_level_instructions_list_9_goto(state, db, prod){
    while( true ) {
        switch(prod){
            case 14: 
            {
                scan( state.lexer, 41, 3 );
                if( state.lexer._type  == 19 || state.lexer._type  == 20 || state.lexer._type  == 21 || state.lexer._type  == 22 ){
                    state.push_fn( hc_top_level_instructions_list_9_goto /*hc_top_level_instructions_list_9_goto( state, db, 14 )*/, 14 );
                    scan( state.lexer, 25, 3 );
                    if( ( state.lexer._type  == 19 || state.lexer._type  == 20 || state.lexer._type  == 21 || state.lexer._type  == 22 ) ){
                        state.push_fn( branch_2d0c7425918eb69d, 14 );
                        return hc_token_branch_instruction( state, db, 0 )
                    };
                    return - 1
                }
            }
            break;
            default: 
            break
        };
        break
    };
    return ( prod  == 14 ) ? prod  : - 1
}

function hc_instruction_sequence_list_11(state, db, prod){
    state.push_fn( branch_7b8976b8db627626, 15 );
    return hc_sequence_instruction( state, db, 0 )
}

function hc_instruction_sequence_list_11_goto(state, db, prod){
    while( true ) {
        switch(prod){
            case 15: 
            {
                scan( state.lexer, 42, 3 );
                if( state.lexer._type  == 13 ){
                    var pk = state.lexer.copy_in_place(  );;
                    pk.next(  );
                    scan( pk, 43, 3 );
                    if( isTokenActive( pk._type, 22 ) ){
                        state.lexer._type  = 13;
                        state.push_fn( hc_instruction_sequence_list_11_goto /*hc_instruction_sequence_list_11_goto( state, db, 15 )*/, 15 );
                        scan( state.lexer, 44, 3 );
                        consume( state );
                        state.push_fn( branch_e89fa69f88bd30ec, 15 );
                        return hc_sequence_instruction( state, db, 0 )
                    } else if( pk._type  == 23 ){
                        return 15
                    }
                }
            }
            break;
            default: 
            break
        };
        break
    };
    return ( prod  == 15 ) ? prod  : - 1
}

function hc_instruction_sequence_list_14(state, db, prod){
    state.push_fn( branch_9697680e19fd145b, 16 );
    return hc_goto_instruction( state, db, 0 )
}

function hc_instruction_sequence_list_14_goto(state, db, prod){
    while( true ) {
        switch(prod){
            case 16: 
            {
                scan( state.lexer, 42, 3 );
                if( state.lexer._type  == 13 ){
                    var pk = state.lexer.copy_in_place(  );;
                    pk.next(  );
                    scan( pk, 8, 3 );
                    if( pk._type  == 23 ){
                        state.lexer._type  = 13;
                        state.push_fn( hc_instruction_sequence_list_14_goto /*hc_instruction_sequence_list_14_goto( state, db, 16 )*/, 16 );
                        scan( state.lexer, 44, 3 );
                        consume( state );
                        state.push_fn( branch_e89fa69f88bd30ec, 16 );
                        return hc_goto_instruction( state, db, 0 )
                    } else if( pk._type  == 41 ){
                        return 16
                    }
                } else {
                    return 16
                }
            }
            break;
            default: 
            break
        };
        break
    };
    return ( prod  == 16 ) ? prod  : - 1
}

function hc_instruction_sequence_group_15_0_(state, db, prod){
    scan( state.lexer, 44, 3 );
    if( state.lexer._type  == 13 ){
    consume( state );
    scan( state.lexer, 45, 3 );
    if( ( state.lexer._type  == 41 ) ){
        consume( state );
        scan( state.lexer, 17, 3 );
        if( ( state.lexer._type  == 9 ) ){
            consume( state );
            add_reduce( state, 3, 35 );
            return 17
        }
    }
};
    return - 1
}

function hc_sequence_instruction_list_66(state, db, prod){
    state.push_fn( branch_d80f5a99d04f32d0, 18 );
    return hc_state_declaration( state, db, 0 )
}

function hc_sequence_instruction_list_66_goto(state, db, prod){
    scan( state.lexer, 46, 3 );
    if( state.lexer._type  == 42 ){
    state.push_fn( hc_sequence_instruction_list_66_goto /*hc_sequence_instruction_list_66_goto( state, db, 18 )*/, 18 );
    scan( state.lexer, 47, 3 );
    consume( state );
    state.push_fn( branch_e89fa69f88bd30ec, 18 );
    return hc_state_declaration( state, db, 0 )
};
    return ( prod  == 18 ) ? prod  : - 1
}

function hc_expected_symbols_group_92_0_(state, db, prod){
    scan( state.lexer, 48, 3 );
    if( state.lexer._type  == 43 ){
    consume( state );
    scan( state.lexer, 18, 3 );
    if( ( state.lexer._type  == 10 ) ){
        state.push_fn( branch_10dd5711e10f6933, 19 );
        return hc_id_list( state, db, 0 )
    }
};
    return - 1
}

function hc_id_list_list_98(state, db, prod){
    scan( state.lexer, 26, 3 );
    if( state.lexer._type  == 5 ){
    consume( state );
    scan( state.lexer, 3, 3 );
    add_reduce( state, 1, 10 );
    return hc_id_list_list_98_goto( state, db, 20 )
};
    return - 1
}

function hc_id_list_list_98_goto(state, db, prod){
    scan( state.lexer, 49, 3 );
    if( state.lexer._type  == 5 ){
    state.push_fn( hc_id_list_list_98_goto /*hc_id_list_list_98_goto( state, db, 20 )*/, 20 );
    scan( state.lexer, 26, 3 );
    consume( state );
    add_reduce( state, 2, 33 );
    return 0
};
    return ( prod  == 20 ) ? prod  : - 1
}

function hc_comment_list_119(state, db, prod){
    scan( state.lexer, 50, 35 );
    if( isTokenActive( state.lexer._type, 51 ) ){
    consume( state );
    add_reduce( state, 1, 10 );
    return hc_comment_list_119_goto( state, db, 21 )
};
    return - 1
}

function hc_comment_list_119_goto(state, db, prod){
    scan( state.lexer, 40, 35 );
    if( state.lexer._type  == 2 ){
    state.push_fn( hc_comment_list_119_goto /*hc_comment_list_119_goto( state, db, 21 )*/, 21 );
    scan( state.lexer, 52, 3 );
    consume( state );
    add_reduce( state, 2, 33 );
    return 0
} else if( state.lexer._type  == 8 ){
    state.push_fn( hc_comment_list_119_goto /*hc_comment_list_119_goto( state, db, 21 )*/, 21 );
    scan( state.lexer, 3, 53 );
    consume( state );
    add_reduce( state, 2, 33 );
    return 0
} else if( state.lexer._type  == 7 ){
    state.push_fn( hc_comment_list_119_goto /*hc_comment_list_119_goto( state, db, 21 )*/, 21 );
    scan( state.lexer, 3, 54 );
    consume( state );
    add_reduce( state, 2, 33 );
    return 0
} else if( state.lexer._type  == 3 ){
    state.push_fn( hc_comment_list_119_goto /*hc_comment_list_119_goto( state, db, 21 )*/, 21 );
    scan( state.lexer, 55, 3 );
    consume( state );
    add_reduce( state, 2, 33 );
    return 0
} else if( state.lexer._type  == 5 ){
    state.push_fn( hc_comment_list_119_goto /*hc_comment_list_119_goto( state, db, 21 )*/, 21 );
    scan( state.lexer, 26, 3 );
    consume( state );
    add_reduce( state, 2, 33 );
    return 0
};
    return ( prod  == 21 ) ? prod  : - 1
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
(env, sym, pos)=> ([...sym[0],...sym[2],sym[3]]) /*5*/,
(env, sym, pos)=> ([...sym[0],sym[1]]) /*6*/,
(env, sym, pos)=> ([...sym[0],...sym[2]]) /*7*/,
(env, sym, pos)=> ([...sym[0]]) /*8*/,
(env, sym, pos)=> ([sym[0]]) /*9*/,
(env, sym, pos)=> ([]) /*10*/,
(env, sym, pos)=> ({type:"prod",ids:sym[2],instructions:sym[4]}) /*11*/,
(env, sym, pos)=> ({type:"no-consume",ids:sym[1],instructions:sym[3]}) /*12*/,
(env, sym, pos)=> ({type:"consume",ids:sym[1],instructions:sym[3]}) /*13*/,
(env, sym, pos)=> ({type:"peek",ids:sym[1],instructions:sym[3]}) /*14*/,
(env, sym, pos)=> ({type:"assert",ids:sym[1],instructions:sym[3]}) /*15*/,
(env, sym, pos)=> ({type:"goto",state:sym[1]}) /*16*/,
(env, sym, pos)=> ({type:"reduce",len:parseInt(sym[1]),reduce_fn:parseInt(sym[2])}) /*17*/,
(env, sym, pos)=> ({type:"set-prod",id:parseInt(sym[3])}) /*18*/,
(env, sym, pos)=> ({type:"fork-to",states:sym[3]}) /*19*/,
(env, sym, pos)=> ({type:"scan-until",token_ids:sym[2]}) /*20*/,
(env, sym, pos)=> ({type:"pop",len:parseInt(sym[1])}) /*21*/,
(env, sym, pos)=> ({type:"token-length",len:parseInt(sym[3])}) /*22*/,
(env, sym, pos)=> ({type:"token-id",id:parseInt(sym[3])}) /*23*/,
(env, sym, pos)=> ({type:"pass"}) /*24*/,
(env, sym, pos)=> ({type:"end"}) /*25*/,
(env, sym, pos)=> ({type:"fail"}) /*26*/,
(env, sym, pos)=> ({type:"on-fail-state",id:sym[2],instructions:sym[3],symbol_meta:sym[4]}) /*27*/,
(env, sym, pos)=> ({type:"on-fail-state",id:sym[2],instructions:sym[3]}) /*28*/,
(env, sym, pos)=> ({type:"symbols",expected:sym[2],skipped:sym[3]||[]}) /*29*/,
(env, sym, pos)=> ({type:"symbols",expected:sym[2],skipped:null||[]}) /*30*/,
(env, sym, pos)=> (sym[1].map(i=>parseInt(i))) /*31*/,
(env, sym, pos)=> ((sym[0].push(sym[1]),sym[0])) /*32*/,
(env, sym, pos)=> ((sym[0].push(sym[2]),sym[0])) /*33*/,
(env, sym, pos)=> ({type:"repeat-state"}) /*34*/,
(env, sym, pos)=> (sym[1]) /*35*/];

    export default ParserFactory
        (reduce_functions, undefined, recognizer_initializer, {start:0});