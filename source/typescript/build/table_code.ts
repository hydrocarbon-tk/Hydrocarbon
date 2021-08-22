
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
    

        var token_lookup = new Uint32Array([40,4,0,8,4480,128,384,128,131456,128,779895168,128,779894784,0,1073742210,129,8576,128,524672,128,4482,192,65920,128,1853636994,129,1073742208,128,384,144,896,128,1408,128,2432,128,779878400,0,139648,128,33152,128,416,128,8388992,128,16777600,128,268435840,128,2147484032,128,384,129,384,130,424,132,40,132,0,128,0,132,8,128,32,128,384,136,428,144,131456,160,384,160,4512,128,384,192,428,128,428,0,388,128,128,128,256,128,392,128]);;
        var token_sequence_lookup = new Uint8Array([91,93,40,41,115,121,109,98,111,108,115,58,95,47,42,47,44,69,78,68,95,79,70,95,80,82,79,68,85,67,84,73,79,78,116,104,101,110,111,110,112,114,111,100,103,111,116,111,114,101,100,117,99,101,102,111,114,107,97,98,111,114,116,117,110,116,105,108,101,120,112,101,99,116,101,100,115,107,105,112,112,101,100,112,101,101,107,102,97,105,108,115,116,97,116,101,115,104,105,102,116,115,99,97,110,115,101,116,112,111,112]);;
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
            if( 4 == compare( lexer, lexer.byte_offset  + 1, 59, 4, token_sequence_lookup ) ){
                if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 8, 11, 1 ) && lexer.byte_length  > 5 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 5 ){
                    return
                } else if( isTokenActive( 26, tk_row ) ){
                    lexer.setToken( 26, 5, 5 );
                    return
                }
            }
        }
    }
    break;
    case 101: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 101 ){
            if( 7 == compare( lexer, lexer.byte_offset  + 1, 69, 7, token_sequence_lookup ) ){
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
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 56, 2, token_sequence_lookup ) ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 8, 11, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 25, tk_row ) ){
                        lexer.setToken( 25, 4, 4 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 97 ){
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 89, 2, token_sequence_lookup ) ){
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
            if( 3 == compare( lexer, lexer.byte_offset  + 1, 45, 3, token_sequence_lookup ) ){
                if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 8, 11, 1 ) && lexer.byte_length  > 4 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                    return
                } else if( isTokenActive( 19, tk_row ) ){
                    lexer.setToken( 19, 4, 4 );
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
                    } else if( isTokenActive( 23, tk_row ) ){
                        lexer.setToken( 23, 4, 4 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 101 ){
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 85, 2, token_sequence_lookup ) ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 8, 11, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 20, tk_row ) ){
                        lexer.setToken( 20, 4, 4 );
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
            if( 5 == compare( lexer, lexer.byte_offset  + 1, 49, 5, token_sequence_lookup ) ){
                if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 8, 11, 1 ) && lexer.byte_length  > 6 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 6 ){
                    return
                } else if( isTokenActive( 21, tk_row ) ){
                    lexer.setToken( 21, 6, 6 );
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
                if( 5 == compare( lexer, lexer.byte_offset  + 2, 78, 5, token_sequence_lookup ) ){
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
                if( 3 == compare( lexer, lexer.byte_offset  + 2, 93, 3, token_sequence_lookup ) ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 8, 11, 1 ) && lexer.byte_length  > 5 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 5 ){
                        return
                    } else if( isTokenActive( 9, tk_row ) ){
                        lexer.setToken( 9, 5, 5 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 104 ){
                if( 3 == compare( lexer, lexer.byte_offset  + 2, 98, 3, token_sequence_lookup ) ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 8, 11, 1 ) && lexer.byte_length  > 5 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 5 ){
                        return
                    } else if( isTokenActive( 18, tk_row ) ){
                        lexer.setToken( 18, 5, 5 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 99 ){
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 103, 2, token_sequence_lookup ) ){
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
                    } else if( isTokenActive( 22, tk_row ) ){
                        lexer.setToken( 22, 3, 3 );
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
                } else if( isTokenActive( 24, tk_row ) ){
                    lexer.setToken( 24, 2, 2 );
                    return
                }
            }
        }
    }
    break;
    case 117: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 117 ){
            if( 4 == compare( lexer, lexer.byte_offset  + 1, 64, 4, token_sequence_lookup ) ){
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

function branch_02b6598c22f20b77(state, db, prod){
    scan( state.lexer, 2, 3 );
    if( ( state.lexer._type  == 12 ) ){
    consume( state );
    add_reduce( state, 4, 5 );
    return 12
};
    return - 1
}

function branch_04d691b673770834(state, db, prod){
    add_reduce( state, 1, 6 );
    return hc_instructions_goto( state, db, 2 )
}

function branch_09fd4c587b3f4d77(state, db, prod){
    add_reduce( state, 3, 2 );
    return 0
}

function branch_0ec80ad115fad29d(state, db, prod){
    add_reduce( state, 3, 17 );
    return 0
}

function branch_1e3ac8120e7b258b(state, db, prod){
    add_reduce( state, 4, 1 );
    return 0
}

function branch_20b33064645a28fc(state, db, prod){
    add_reduce( state, 2, 7 );
    return 0
}

function branch_30141b311824c909(state, db, prod){
    scan( state.lexer, 4, 3 );
    if( ( state.lexer._type  == 17 ) ){
    consume( state );
    add_reduce( state, 5, 19 );
    return 5
};
    return - 1
}

function branch_353619393189bd56(state, db, prod){
    scan( state.lexer, 5, 3 );
    if( ( isTokenActive( state.lexer._type, 6 ) ) ){
    state.push_fn( branch_68e75b7363fe619e, 2 );
    return hc_instruction( state, db, 0 )
};
    return - 1
}

function branch_39f2af0413647aa3(state, db, prod){
    scan( state.lexer, 7, 3 );
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

function branch_411aaa2717a2a759(state, db, prod){
    scan( state.lexer, 5, 3 );
    state.push_fn( branch_c26ee14233e9d71f, 0 );
    return hc_instructions( state, db, 0 )
}

function branch_432c68451b88ec22(state, db, prod){
    scan( state.lexer, 8, 3 );
    if( ( state.lexer._type  == 13 ) ){
    consume( state );
    scan( state.lexer, 9, 3 );
    if( ( state.lexer._type  == 19 ) ){
        consume( state );
        state.push_fn( branch_7cb97bd432e267ed, 4 );
        return hc_state_declaration( state, db, 0 )
    }
};
    return - 1
}

function branch_49aa1731e911c41b(state, db, prod){
    scan( state.lexer, 4, 3 );
    if( ( state.lexer._type  == 17 ) ){
    consume( state );
    add_reduce( state, 6, 9 );
    return 0
};
    return - 1
}

function branch_4b58c2337192c880(state, db, prod){
    scan( state.lexer, 8, 3 );
    if( ( state.lexer._type  == 13 ) ){
    consume( state );
    scan( state.lexer, 9, 3 );
    if( ( state.lexer._type  == 19 ) ){
        consume( state );
        state.push_fn( branch_865c8ae50a6dc2af, 4 );
        return hc_state_declaration( state, db, 0 )
    }
};
    return - 1
}

function branch_51fa599ddbbd4b19(state, db, prod){
    scan( state.lexer, 2, 3 );
    if( ( state.lexer._type  == 12 ) ){
    consume( state );
    add_reduce( state, 3, 22 );
    return 7
};
    return - 1
}

function branch_582436bab49434fa(state, db, prod){
    scan( state.lexer, 2, 3 );
    if( state.lexer._type  == 12 ){
    consume( state );
    scan( state.lexer, 10, 3 );
    if( state.lexer._type  == 38 ){
        state.push_fn( set_production /*6*/, 6 );
        state.push_fn( branch_d7d49b01282c115e, 6 );
        return hc_expected_symbols_group_63_0_( state, db, 0 )
    } else {
        add_reduce( state, 5, 21 );
        return 6
    }
};
    return - 1
}

function branch_590c1fd69da5024b(state, db, prod){
    scan( state.lexer, 11, 3 );
    if( ( state.lexer._type  == 16 ) ){
    consume( state );
    state.push_fn( branch_49aa1731e911c41b, 4 );
    return hc_instruction_sequence( state, db, 0 )
};
    return - 1
}

function branch_60d1f22634e1d8d8(state, db, prod){
    add_reduce( state, 2, 12 );
    return 0
}

function branch_68cee78761f381d2(state, db, prod){
    add_reduce( state, 1, 6 );
    return hc_instruction_list_45_goto( state, db, 10 )
}

function branch_68e75b7363fe619e(state, db, prod){
    add_reduce( state, 2, 7 );
    return hc_instructions_goto( state, db, 2 )
}

function branch_7cb97bd432e267ed(state, db, prod){
    add_reduce( state, 5, 11 );
    return 0
}

function branch_865c8ae50a6dc2af(state, db, prod){
    add_reduce( state, 5, 10 );
    return 0
}

function branch_9a2a194ba6000915(state, db, prod){
    add_reduce( state, 3, 8 );
    return 0
}

function branch_c26ee14233e9d71f(state, db, prod){
    scan( state.lexer, 12, 3 );
    if( state.lexer._type  == 30 ){
    scan( state.lexer, 13, 3 );
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

function branch_c3a15c203f068010(state, db, prod){
    scan( state.lexer, 14, 3 );
    if( ( state.lexer._type  == 36 ) ){
    consume( state );
    add_reduce( state, 3, 0 );
    return 0
};
    return - 1
}

function branch_cb865dacf7f61a0f(state, db, prod){
    scan( state.lexer, 4, 3 );
    if( ( state.lexer._type  == 17 ) ){
    consume( state );
    add_reduce( state, 5, 15 );
    return 0
};
    return - 1
}

function branch_d7d49b01282c115e(state, db, prod){
    add_reduce( state, 6, 20 );
    return 0
}

function branch_f1028247acf9ad95(state, db, prod){
    add_reduce( state, 1, 6 );
    return hc_instruction_sequence_goto( state, db, 3 )
}

function hc_start(state, db, prod){
    state.push_fn( branch_411aaa2717a2a759, 0 );
    return hc_state_declaration( state, db, 0 )
}

function hc_state_declaration(state, db, prod){
    scan( state.lexer, 15, 3 );
    if( state.lexer._type  == 9 ){
    consume( state );
    scan( state.lexer, 16, 3 );
    if( ( state.lexer._type  == 10 ) ){
        consume( state );
        scan( state.lexer, 17, 3 );
        if( ( state.lexer._type  == 11 ) ){
            consume( state );
            scan( state.lexer, 2, 3 );
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
    state.push_fn( branch_04d691b673770834, 2 );
    return hc_instruction( state, db, 0 )
}

function hc_instructions_goto(state, db, prod){
    while( true ) {
        switch(prod){
            case 2: 
            {
                scan( state.lexer, 12, 3 );
                if( isTokenActive( state.lexer._type, 18 ) ){
                    state.push_fn( hc_instructions_goto /*hc_instructions_goto( state, db, 2 )*/, 2 );
                    scan( state.lexer, 5, 3 );
                    if( ( isTokenActive( state.lexer._type, 6 ) ) ){
                        state.push_fn( branch_20b33064645a28fc, 2 );
                        return hc_instruction( state, db, 0 )
                    };
                    return - 1
                } else if( state.lexer._type  == 14 ){
                    var fk1 = state.fork( db );;
                    fk1.push_fn( set_production /*2*/, 2 );
                    state.push_fn( branch_353619393189bd56, 2 );
                    return 0
                }
            }
            break;
            default: 
            break
        };
        break
    };
    return ( prod  == 2 ) ? prod  : - 1
}

function hc_instruction_sequence(state, db, prod){
    state.push_fn( branch_f1028247acf9ad95, 3 );
    return hc_instruction( state, db, 0 )
}

function hc_instruction_sequence_goto(state, db, prod){
    scan( state.lexer, 19, 3 );
    if( state.lexer._type  == 13 ){
    state.push_fn( hc_instruction_sequence_goto /*hc_instruction_sequence_goto( state, db, 3 )*/, 3 );
    scan( state.lexer, 8, 3 );
    consume( state );
    state.push_fn( branch_9a2a194ba6000915, 3 );
    return hc_instruction( state, db, 0 )
} else if( state.lexer._type  == 17 ){
    return 3
};
    return ( prod  == 3 ) ? prod  : - 1
}

function hc_instruction(state, db, prod){
    scan( state.lexer, 5, 3 );
    if( state.lexer._type  == 14 ){
    state.push_fn( set_production /*4*/, 4 );
    consume( state );
    scan( state.lexer, 20, 3 );
    if( ( state.lexer._type  == 15 ) ){
        consume( state );
        state.push_fn( branch_590c1fd69da5024b, 4 );
        return hc_id_list( state, db, 0 )
    };
    return - 1
} else if( state.lexer._type  == 18 ){
    state.push_fn( set_production /*4*/, 4 );
    consume( state );
    state.push_fn( branch_4b58c2337192c880, 4 );
    return hc_id_list( state, db, 0 )
} else if( state.lexer._type  == 20 ){
    state.push_fn( set_production /*4*/, 4 );
    consume( state );
    state.push_fn( branch_432c68451b88ec22, 4 );
    return hc_id_list( state, db, 0 )
} else if( state.lexer._type  == 19 ){
    state.push_fn( set_production /*4*/, 4 );
    consume( state );
    state.push_fn( branch_60d1f22634e1d8d8, 4 );
    return hc_state_declaration( state, db, 0 )
} else if( state.lexer._type  == 21 ){
    state.push_fn( set_production /*4*/, 4 );
    consume( state );
    scan( state.lexer, 21, 3 );
    if( ( state.lexer._type  == 5 ) ){
        consume( state );
        scan( state.lexer, 21, 3 );
        if( ( state.lexer._type  == 5 ) ){
            consume( state );
            add_reduce( state, 3, 13 );
            return 0
        }
    };
    return - 1
} else if( state.lexer._type  == 22 ){
    state.push_fn( set_production /*4*/, 4 );
    consume( state );
    scan( state.lexer, 22, 3 );
    if( ( state.lexer._type  == 23 ) ){
        consume( state );
        scan( state.lexer, 23, 3 );
        if( ( state.lexer._type  == 24 ) ){
            consume( state );
            scan( state.lexer, 21, 3 );
            if( ( state.lexer._type  == 5 ) ){
                consume( state );
                add_reduce( state, 4, 14 );
                return 0
            }
        }
    };
    return - 1
} else if( state.lexer._type  == 25 ){
    state.push_fn( set_production /*4*/, 4 );
    consume( state );
    scan( state.lexer, 23, 3 );
    if( ( state.lexer._type  == 24 ) ){
        consume( state );
        scan( state.lexer, 11, 3 );
        if( ( state.lexer._type  == 16 ) ){
            consume( state );
            state.push_fn( branch_cb865dacf7f61a0f, 4 );
            return hc_instruction_list_45( state, db, 0 )
        }
    };
    return - 1
} else if( state.lexer._type  == 26 ){
    state.push_fn( set_production /*4*/, 4 );
    consume( state );
    add_reduce( state, 1, 16 );
    return 0
} else if( state.lexer._type  == 27 ){
    state.push_fn( set_production /*4*/, 4 );
    consume( state );
    scan( state.lexer, 24, 3 );
    if( ( state.lexer._type  == 28 ) ){
        consume( state );
        state.push_fn( branch_0ec80ad115fad29d, 4 );
        return hc_id_list( state, db, 0 )
    };
    return - 1
} else if( state.lexer._type  == 29 ){
    state.push_fn( set_production /*4*/, 4 );
    consume( state );
    scan( state.lexer, 21, 3 );
    if( ( state.lexer._type  == 5 ) ){
        consume( state );
        add_reduce( state, 2, 18 );
        return 0
    };
    return - 1
};
    return - 1
}

function hc_on_fail(state, db, prod){
    scan( state.lexer, 13, 3 );
    if( state.lexer._type  == 30 ){
    consume( state );
    scan( state.lexer, 25, 3 );
    if( ( state.lexer._type  == 31 ) ){
        consume( state );
        scan( state.lexer, 11, 3 );
        if( ( state.lexer._type  == 16 ) ){
            consume( state );
            state.push_fn( branch_30141b311824c909, 5 );
            return hc_instruction_sequence( state, db, 0 )
        }
    }
};
    return - 1
}

function hc_expected_symbols(state, db, prod){
    scan( state.lexer, 26, 3 );
    if( state.lexer._type  == 32 ){
    consume( state );
    scan( state.lexer, 27, 3 );
    if( state.lexer._type  == 33 ){
        consume( state );
        scan( state.lexer, 16, 3 );
        if( state.lexer._type  == 10 ){
            consume( state );
            scan( state.lexer, 21, 3 );
            state.push_fn( branch_582436bab49434fa, 0 );
            return hc_expected_symbols_list_61( state, db, 0 )
        }
    }
};
    return - 1
}

function hc_id_list(state, db, prod){
    scan( state.lexer, 16, 3 );
    if( state.lexer._type  == 10 ){
    consume( state );
    scan( state.lexer, 21, 3 );
    if( ( state.lexer._type  == 5 ) ){
        state.push_fn( branch_51fa599ddbbd4b19, 7 );
        return hc_expected_symbols_list_61( state, db, 0 )
    }
};
    return - 1
}

function hc_state_hash_token(state, db, prod){
    scan( state.lexer, 28, 3 );
    if( state.lexer._type  == 3 || state.lexer._type  == 5 || state.lexer._type  == 34 ){
    consume( state );
    return hc_state_hash_token_goto( state, db, 8 )
};
    return - 1
}

function hc_state_hash_token_goto(state, db, prod){
    scan( state.lexer, 29, 30 );
    if( state.lexer._type  == 34 ){
    state.push_fn( hc_state_hash_token_goto /*hc_state_hash_token_goto( state, db, 8 )*/, 8 );
    scan( state.lexer, 31, 30 );
    consume( state );
    add_reduce( state, 2, 0 );
    return 0
} else if( state.lexer._type  == 3 ){
    state.push_fn( hc_state_hash_token_goto /*hc_state_hash_token_goto( state, db, 8 )*/, 8 );
    scan( state.lexer, 32, 30 );
    consume( state );
    add_reduce( state, 2, 0 );
    return 0
} else if( state.lexer._type  == 5 ){
    state.push_fn( hc_state_hash_token_goto /*hc_state_hash_token_goto( state, db, 8 )*/, 8 );
    scan( state.lexer, 33, 30 );
    consume( state );
    add_reduce( state, 2, 0 );
    return 0
};
    return ( prod  == 8 ) ? prod  : - 1
}

function hc_comment(state, db, prod){
    scan( state.lexer, 34, 3 );
    if( state.lexer._type  == 35 ){
    consume( state );
    scan( state.lexer, 35, 30 );
    if( state.lexer._type  == 36 ){
        state.push_fn( set_production /*9*/, 9 );
        consume( state );
        add_reduce( state, 2, 0 );
        return 0
    } else {
        state.push_fn( set_production /*9*/, 9 );
        state.push_fn( branch_c3a15c203f068010, 9 );
        return hc_comment_list_92( state, db, 0 )
    }
};
    return - 1
}

function hc_instruction_list_45(state, db, prod){
    state.push_fn( branch_68cee78761f381d2, 10 );
    return hc_state_declaration( state, db, 0 )
}

function hc_instruction_list_45_goto(state, db, prod){
    scan( state.lexer, 36, 3 );
    if( state.lexer._type  == 37 ){
    state.push_fn( hc_instruction_list_45_goto /*hc_instruction_list_45_goto( state, db, 10 )*/, 10 );
    scan( state.lexer, 37, 3 );
    consume( state );
    state.push_fn( branch_9a2a194ba6000915, 10 );
    return hc_state_declaration( state, db, 0 )
};
    return ( prod  == 10 ) ? prod  : - 1
}

function hc_expected_symbols_list_61(state, db, prod){
    scan( state.lexer, 21, 3 );
    if( state.lexer._type  == 5 ){
    consume( state );
    scan( state.lexer, 3, 3 );
    add_reduce( state, 1, 6 );
    return hc_expected_symbols_list_61_goto( state, db, 11 )
};
    return - 1
}

function hc_expected_symbols_list_61_goto(state, db, prod){
    scan( state.lexer, 38, 3 );
    if( state.lexer._type  == 12 ){
    return 11
} else if( state.lexer._type  == 5 ){
    state.push_fn( hc_expected_symbols_list_61_goto /*hc_expected_symbols_list_61_goto( state, db, 11 )*/, 11 );
    scan( state.lexer, 21, 3 );
    consume( state );
    add_reduce( state, 2, 7 );
    return 0
};
    return ( prod  == 11 ) ? prod  : - 1
}

function hc_expected_symbols_group_63_0_(state, db, prod){
    scan( state.lexer, 39, 3 );
    if( state.lexer._type  == 38 ){
    consume( state );
    scan( state.lexer, 16, 3 );
    if( ( state.lexer._type  == 10 ) ){
        consume( state );
        state.push_fn( branch_02b6598c22f20b77, 12 );
        return hc_expected_symbols_list_61( state, db, 0 )
    }
};
    return - 1
}

function hc_comment_list_92(state, db, prod){
    scan( state.lexer, 40, 30 );
    if( isTokenActive( state.lexer._type, 41 ) ){
    consume( state );
    add_reduce( state, 1, 6 );
    return hc_comment_list_92_goto( state, db, 13 )
};
    return - 1
}

function hc_comment_list_92_goto(state, db, prod){
    scan( state.lexer, 35, 30 );
    if( state.lexer._type  == 2 ){
    state.push_fn( hc_comment_list_92_goto /*hc_comment_list_92_goto( state, db, 13 )*/, 13 );
    scan( state.lexer, 42, 3 );
    consume( state );
    add_reduce( state, 2, 7 );
    return 0
} else if( state.lexer._type  == 8 ){
    state.push_fn( hc_comment_list_92_goto /*hc_comment_list_92_goto( state, db, 13 )*/, 13 );
    scan( state.lexer, 3, 43 );
    consume( state );
    add_reduce( state, 2, 7 );
    return 0
} else if( state.lexer._type  == 7 ){
    state.push_fn( hc_comment_list_92_goto /*hc_comment_list_92_goto( state, db, 13 )*/, 13 );
    scan( state.lexer, 3, 44 );
    consume( state );
    add_reduce( state, 2, 7 );
    return 0
} else if( state.lexer._type  == 3 ){
    state.push_fn( hc_comment_list_92_goto /*hc_comment_list_92_goto( state, db, 13 )*/, 13 );
    scan( state.lexer, 45, 3 );
    consume( state );
    add_reduce( state, 2, 7 );
    return 0
} else if( state.lexer._type  == 5 ){
    state.push_fn( hc_comment_list_92_goto /*hc_comment_list_92_goto( state, db, 13 )*/, 13 );
    scan( state.lexer, 21, 3 );
    consume( state );
    add_reduce( state, 2, 7 );
    return 0
};
    return ( prod  == 13 ) ? prod  : - 1
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
(env, sym, pos)=> ({type:"state",id:sym[0],instructions:sym[1],fail:sym[2],symbol_meta:null}) /*2*/,
(env, sym, pos)=> ({type:"state",id:sym[0],instructions:sym[1],symbol_meta:null}) /*3*/,
(env, sym, pos)=> (sym[2]) /*4*/,
(env, sym, pos)=> ([sym[0]]) /*5*/,
(env, sym, pos)=> ((sym[0].push(sym[1]),sym[0])) /*6*/,
(env, sym, pos)=> ((sym[0].push(sym[2]),sym[0])) /*7*/,
(env, sym, pos)=> ({type:"prod",ids:sym[2],instructions:sym[4]}) /*8*/,
(env, sym, pos)=> ({type:"shift",ids:sym[1],goto_state:sym[3]}) /*9*/,
(env, sym, pos)=> ({type:"peek",ids:sym[1],goto_state:sym[3]}) /*10*/,
(env, sym, pos)=> ({type:"goto",state:sym[1]}) /*11*/,
(env, sym, pos)=> ({type:"goto",len:sym[1],reduce_fn:sym[2]}) /*12*/,
(env, sym, pos)=> ({type:"set-prod",id:sym[3]}) /*13*/,
(env, sym, pos)=> ({type:"fork-to",states:sym[3]}) /*14*/,
(env, sym, pos)=> ({type:"abort",states:sym[3]}) /*15*/,
(env, sym, pos)=> ({type:"scan-until",ids:sym[2]}) /*16*/,
(env, sym, pos)=> ({type:"pop",len:sym[1]}) /*17*/,
(env, sym, pos)=> ({type:"on-fail",instructions:sym[3]}) /*18*/,
(env, sym, pos)=> ({type:"symbols",expected:sym[3],skipped:sym[5]||[]}) /*19*/,
(env, sym, pos)=> ({type:"symbols",expected:sym[3],skipped:null||[]}) /*20*/,
(env, sym, pos)=> ({type:"id-list",ids:sym[1]}) /*21*/];

    export default ParserFactory
        (reduce_functions, undefined, recognizer_initializer, {start:0});