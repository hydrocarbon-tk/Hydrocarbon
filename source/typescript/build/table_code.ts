
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
    

        var token_lookup = new Uint32Array([268435496,0,536870912,0,131456,2,384,2,8576,2,524672,2,41697664,2,108806530,2,1073742208,2,4480,2,4482,3,65920,2,896,2,1408,2,2432,2,67248514,2,33152,2,416,2,8388992,2,16777600,2,67109248,2,134218112,2,268435880,2,268435496,2,0,2,268435456,2,8,2,32,2,536871296,2,1073742252,2,2147615104,2,2147484032,2,4512,2,384,3,428,2,428,0,388,2,128,2,256,2,392,2]);;
        var token_sequence_lookup = new Uint8Array([91,93,40,41,115,121,109,98,111,108,115,58,95,47,42,47,44,69,78,68,95,79,70,95,80,82,79,68,85,67,84,73,79,78,116,104,101,110,111,110,112,114,111,100,103,111,116,111,114,101,100,117,99,101,102,111,114,107,101,120,112,101,99,116,101,100,115,107,105,112,112,101,100,112,101,101,107,115,116,97,116,101,115,104,105,102,116,115,101,116]);;
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
            if( isTokenActive( 30, tk_row ) && lexer.get_byte_at( lexer.byte_offset  + 1 ) == 47 ){
                lexer.setToken( 30, 2, 2 );
                return
            }
        }
    }
    break;
    case 44: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 44 ){
            if( isTokenActive( 31, tk_row ) ){
                lexer.setToken( 31, 1, 1 );
                return
            }
        }
    }
    break;
    case 47: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 47 ){
            if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 42 ){
                if( isTokenActive( 33, tk_row ) && token_production( lexer, hc_comment, 7, 33, 2 ) && lexer.byte_length  > 2 ){
                    return
                } else if( isTokenActive( 29, tk_row ) ){
                    lexer.setToken( 29, 2, 2 );
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
            if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 6, 11, 1 ) && lexer.byte_length  > 1 ){
                return
            } else if( isTokenActive( 28, tk_row ) ){
                lexer.setToken( 28, 1, 1 );
                return
            }
        }
    }
    break;
    case 101: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 101 ){
            if( 7 == compare( lexer, lexer.byte_offset  + 1, 59, 7, token_sequence_lookup ) ){
                if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 6, 11, 1 ) && lexer.byte_length  > 8 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 8 ){
                    return
                } else if( isTokenActive( 27, tk_row ) ){
                    lexer.setToken( 27, 8, 8 );
                    return
                }
            }
        }
    }
    break;
    case 102: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 102 ){
            if( 3 == compare( lexer, lexer.byte_offset  + 1, 55, 3, token_sequence_lookup ) ){
                if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 6, 11, 1 ) && lexer.byte_length  > 4 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                    return
                } else if( isTokenActive( 25, tk_row ) ){
                    lexer.setToken( 25, 4, 4 );
                    return
                }
            }
        }
    }
    break;
    case 103: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 103 ){
            if( 3 == compare( lexer, lexer.byte_offset  + 1, 45, 3, token_sequence_lookup ) ){
                if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 6, 11, 1 ) && lexer.byte_length  > 4 ){
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
                if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 6, 11, 1 ) && lexer.byte_length  > 2 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 2 ){
                    return
                } else if( isTokenActive( 14, tk_row ) ){
                    lexer.setToken( 14, 2, 2 );
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
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 6, 11, 1 ) && lexer.byte_length  > 4 ){
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
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 75, 2, token_sequence_lookup ) ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 6, 11, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 20, tk_row ) ){
                        lexer.setToken( 20, 4, 4 );
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
                if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 6, 11, 1 ) && lexer.byte_length  > 6 ){
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
                    if( isTokenActive( 26, tk_row ) ){
                        lexer.setToken( 26, 8, 8 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 107 ){
                if( 5 == compare( lexer, lexer.byte_offset  + 2, 68, 5, token_sequence_lookup ) ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 6, 11, 1 ) && lexer.byte_length  > 7 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 7 ){
                        return
                    } else if( isTokenActive( 32, tk_row ) ){
                        lexer.setToken( 32, 7, 7 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 116 ){
                if( 3 == compare( lexer, lexer.byte_offset  + 2, 79, 3, token_sequence_lookup ) ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 6, 11, 1 ) && lexer.byte_length  > 5 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 5 ){
                        return
                    } else if( isTokenActive( 9, tk_row ) ){
                        lexer.setToken( 9, 5, 5 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 104 ){
                if( 3 == compare( lexer, lexer.byte_offset  + 2, 84, 3, token_sequence_lookup ) ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 6, 11, 1 ) && lexer.byte_length  > 5 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 5 ){
                        return
                    } else if( isTokenActive( 18, tk_row ) ){
                        lexer.setToken( 18, 5, 5 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 101 ){
                if( lexer.get_byte_at( lexer.byte_offset  + 2 ) == 116 ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 6, 11, 1 ) && lexer.byte_length  > 3 ){
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
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 6, 11, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 13, tk_row ) ){
                        lexer.setToken( 13, 4, 4 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 111 ){
                if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 6, 11, 1 ) && lexer.byte_length  > 2 ){
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
    default: 
    break
};
    if( isTokenActive( 11, tk_row ) && pre_scan( lexer, 0 ) && token_production( lexer, hc_state_hash_token, 6, 11, 1 ) ){
    return
} else if( isTokenActive( 33, tk_row ) && pre_scan( lexer, 1 ) && token_production( lexer, hc_comment, 7, 33, 2 ) ){
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

function branch_0e5bc6a1a5f56f1f(state, db, prod){
    scan( state.lexer, 2, 3 );
    if( ( state.lexer._type  == 17 ) ){
    consume( state );
    add_reduce( state, 5, 12 );
    return 0
};
    return - 1
}

function branch_1313be63a7d4233d(state, db, prod){
    add_reduce( state, 3, 5 );
    return 0
}

function branch_15a31eb87eff325b(state, db, prod){
    scan( state.lexer, 4, 3 );
    if( ( state.lexer._type  == 13 ) ){
    consume( state );
    scan( state.lexer, 5, 3 );
    if( ( state.lexer._type  == 19 ) ){
        consume( state );
        state.push_fn( branch_81729d66945b4d83, 3 );
        return hc_state_declaration( state, db, 0 )
    }
};
    return - 1
}

function branch_1d68e09e4cd53d25(state, db, prod){
    scan( state.lexer, 6, 3 );
    state.push_fn( branch_342d303a14c974ca, 0 );
    return hc_instructions( state, db, 0 )
}

function branch_1ec04d52c211377a(state, db, prod){
    add_reduce( state, 1, 4 );
    return hc_instructions_goto( state, db, 2 )
}

function branch_2d79f09c6a0fafc9(state, db, prod){
    add_reduce( state, 1, 4 );
    return hc_instruction_list_40_goto( state, db, 8 )
}

function branch_342d303a14c974ca(state, db, prod){
    scan( state.lexer, 7, 3 );
    if( state.lexer._type  == 26 ){
    state.push_fn( set_production /*0*/, 0 );
    state.push_fn( branch_eb984fa773e98404, 0 );
    return hc_expected_symbols( state, db, 0 )
} else {
    add_reduce( state, 2, 2 );
    return 0
};
    return - 1
}

function branch_37f3e3be6ebc2964(state, db, prod){
    scan( state.lexer, 8, 3 );
    if( ( state.lexer._type  == 30 ) ){
    consume( state );
    add_reduce( state, 3, 0 );
    return 0
};
    return - 1
}

function branch_43989a1c25ddf2e5(state, db, prod){
    scan( state.lexer, 9, 3 );
    if( ( state.lexer._type  == 12 ) ){
    consume( state );
    add_reduce( state, 3, 15 );
    return 5
};
    return - 1
}

function branch_5c79e6131d713c8e(state, db, prod){
    scan( state.lexer, 2, 3 );
    if( ( state.lexer._type  == 17 ) ){
    consume( state );
    add_reduce( state, 6, 6 );
    return 0
};
    return - 1
}

function branch_7a1e689bf30224b1(state, db, prod){
    add_reduce( state, 6, 13 );
    return 0
}

function branch_81729d66945b4d83(state, db, prod){
    add_reduce( state, 5, 7 );
    return 0
}

function branch_8af9710054ad251f(state, db, prod){
    add_reduce( state, 5, 8 );
    return 0
}

function branch_9039af80c923b458(state, db, prod){
    scan( state.lexer, 9, 3 );
    if( state.lexer._type  == 12 ){
    consume( state );
    scan( state.lexer, 10, 3 );
    if( state.lexer._type  == 32 ){
        state.push_fn( set_production /*4*/, 4 );
        state.push_fn( branch_7a1e689bf30224b1, 4 );
        return hc_expected_symbols_group_47_0_( state, db, 0 )
    } else {
        add_reduce( state, 5, 14 );
        return 4
    }
};
    return - 1
}

function branch_a8bedddddda3d2c8(state, db, prod){
    scan( state.lexer, 9, 3 );
    if( ( state.lexer._type  == 12 ) ){
    consume( state );
    add_reduce( state, 4, 3 );
    return 10
};
    return - 1
}

function branch_aedfd84c7a6eeac5(state, db, prod){
    scan( state.lexer, 11, 3 );
    if( ( state.lexer._type  == 16 ) ){
    consume( state );
    state.push_fn( branch_5c79e6131d713c8e, 3 );
    return hc_instructions( state, db, 0 )
};
    return - 1
}

function branch_d9f8e81271eb9ff1(state, db, prod){
    scan( state.lexer, 4, 3 );
    if( ( state.lexer._type  == 13 ) ){
    consume( state );
    scan( state.lexer, 5, 3 );
    if( ( state.lexer._type  == 19 ) ){
        consume( state );
        state.push_fn( branch_8af9710054ad251f, 3 );
        return hc_state_declaration( state, db, 0 )
    }
};
    return - 1
}

function branch_e11257bfce8f6e41(state, db, prod){
    add_reduce( state, 2, 9 );
    return 0
}

function branch_eb984fa773e98404(state, db, prod){
    add_reduce( state, 3, 1 );
    return 0
}

function hc_start(state, db, prod){
    state.push_fn( branch_1d68e09e4cd53d25, 0 );
    return hc_state_declaration( state, db, 0 )
}

function hc_state_declaration(state, db, prod){
    scan( state.lexer, 12, 3 );
    if( state.lexer._type  == 9 ){
    consume( state );
    scan( state.lexer, 13, 3 );
    if( ( state.lexer._type  == 10 ) ){
        consume( state );
        scan( state.lexer, 14, 3 );
        if( ( state.lexer._type  == 11 ) ){
            consume( state );
            scan( state.lexer, 9, 3 );
            if( ( state.lexer._type  == 12 ) ){
                consume( state );
                add_reduce( state, 4, 3 );
                return 1
            }
        }
    }
};
    return - 1
}

function hc_instructions(state, db, prod){
    state.push_fn( branch_1ec04d52c211377a, 2 );
    return hc_instruction( state, db, 0 )
}

function hc_instructions_goto(state, db, prod){
    while( true ) {
        switch(prod){
            case 2: 
            {
                scan( state.lexer, 15, 3 );
                if( state.lexer._type  == 13 ){
                    state.push_fn( hc_instructions_goto /*hc_instructions_goto( state, db, 2 )*/, 2 );
                    scan( state.lexer, 4, 3 );
                    consume( state );
                    state.push_fn( branch_1313be63a7d4233d, 2 );
                    return hc_instruction( state, db, 0 )
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

function hc_instruction(state, db, prod){
    scan( state.lexer, 6, 3 );
    if( state.lexer._type  == 14 ){
    state.push_fn( set_production /*3*/, 3 );
    consume( state );
    scan( state.lexer, 16, 3 );
    if( ( state.lexer._type  == 15 ) ){
        consume( state );
        state.push_fn( branch_aedfd84c7a6eeac5, 3 );
        return hc_id_list( state, db, 0 )
    };
    return - 1
} else if( state.lexer._type  == 18 ){
    state.push_fn( set_production /*3*/, 3 );
    consume( state );
    state.push_fn( branch_15a31eb87eff325b, 3 );
    return hc_id_list( state, db, 0 )
} else if( state.lexer._type  == 20 ){
    state.push_fn( set_production /*3*/, 3 );
    consume( state );
    state.push_fn( branch_d9f8e81271eb9ff1, 3 );
    return hc_id_list( state, db, 0 )
} else if( state.lexer._type  == 19 ){
    state.push_fn( set_production /*3*/, 3 );
    consume( state );
    state.push_fn( branch_e11257bfce8f6e41, 3 );
    return hc_state_declaration( state, db, 0 )
} else if( state.lexer._type  == 21 ){
    state.push_fn( set_production /*3*/, 3 );
    consume( state );
    scan( state.lexer, 17, 3 );
    if( ( state.lexer._type  == 5 ) ){
        consume( state );
        scan( state.lexer, 17, 3 );
        if( ( state.lexer._type  == 5 ) ){
            consume( state );
            add_reduce( state, 3, 10 );
            return 0
        }
    };
    return - 1
} else if( state.lexer._type  == 22 ){
    state.push_fn( set_production /*3*/, 3 );
    consume( state );
    scan( state.lexer, 18, 3 );
    if( ( state.lexer._type  == 23 ) ){
        consume( state );
        scan( state.lexer, 19, 3 );
        if( ( state.lexer._type  == 24 ) ){
            consume( state );
            scan( state.lexer, 17, 3 );
            if( ( state.lexer._type  == 5 ) ){
                consume( state );
                add_reduce( state, 4, 11 );
                return 0
            }
        }
    };
    return - 1
} else if( state.lexer._type  == 25 ){
    state.push_fn( set_production /*3*/, 3 );
    consume( state );
    scan( state.lexer, 19, 3 );
    if( ( state.lexer._type  == 24 ) ){
        consume( state );
        scan( state.lexer, 11, 3 );
        if( ( state.lexer._type  == 16 ) ){
            consume( state );
            state.push_fn( branch_0e5bc6a1a5f56f1f, 3 );
            return hc_instruction_list_40( state, db, 0 )
        }
    };
    return - 1
};
    return - 1
}

function hc_expected_symbols(state, db, prod){
    scan( state.lexer, 20, 3 );
    if( state.lexer._type  == 26 ){
    consume( state );
    scan( state.lexer, 21, 3 );
    if( state.lexer._type  == 27 ){
        consume( state );
        scan( state.lexer, 13, 3 );
        if( state.lexer._type  == 10 ){
            consume( state );
            scan( state.lexer, 17, 3 );
            state.push_fn( branch_9039af80c923b458, 0 );
            return hc_expected_symbols_list_45( state, db, 0 )
        }
    }
};
    return - 1
}

function hc_id_list(state, db, prod){
    scan( state.lexer, 13, 3 );
    if( state.lexer._type  == 10 ){
    consume( state );
    scan( state.lexer, 17, 3 );
    if( ( state.lexer._type  == 5 ) ){
        state.push_fn( branch_43989a1c25ddf2e5, 5 );
        return hc_expected_symbols_list_45( state, db, 0 )
    }
};
    return - 1
}

function hc_state_hash_token(state, db, prod){
    scan( state.lexer, 22, 3 );
    if( state.lexer._type  == 3 || state.lexer._type  == 5 || state.lexer._type  == 28 ){
    consume( state );
    return hc_state_hash_token_goto( state, db, 6 )
};
    return - 1
}

function hc_state_hash_token_goto(state, db, prod){
    scan( state.lexer, 23, 24 );
    if( state.lexer._type  == 28 ){
    state.push_fn( hc_state_hash_token_goto /*hc_state_hash_token_goto( state, db, 6 )*/, 6 );
    scan( state.lexer, 25, 24 );
    consume( state );
    add_reduce( state, 2, 0 );
    return 0
} else if( state.lexer._type  == 3 ){
    state.push_fn( hc_state_hash_token_goto /*hc_state_hash_token_goto( state, db, 6 )*/, 6 );
    scan( state.lexer, 26, 24 );
    consume( state );
    add_reduce( state, 2, 0 );
    return 0
} else if( state.lexer._type  == 5 ){
    state.push_fn( hc_state_hash_token_goto /*hc_state_hash_token_goto( state, db, 6 )*/, 6 );
    scan( state.lexer, 27, 24 );
    consume( state );
    add_reduce( state, 2, 0 );
    return 0
};
    return ( prod  == 6 ) ? prod  : - 1
}

function hc_comment(state, db, prod){
    scan( state.lexer, 28, 3 );
    if( state.lexer._type  == 29 ){
    consume( state );
    scan( state.lexer, 29, 24 );
    if( state.lexer._type  == 30 ){
        state.push_fn( set_production /*7*/, 7 );
        consume( state );
        add_reduce( state, 2, 0 );
        return 0
    } else {
        state.push_fn( set_production /*7*/, 7 );
        state.push_fn( branch_37f3e3be6ebc2964, 7 );
        return hc_comment_list_76( state, db, 0 )
    }
};
    return - 1
}

function hc_instruction_list_40(state, db, prod){
    state.push_fn( branch_2d79f09c6a0fafc9, 8 );
    return hc_state_declaration( state, db, 0 )
}

function hc_instruction_list_40_goto(state, db, prod){
    scan( state.lexer, 30, 3 );
    if( state.lexer._type  == 31 ){
    state.push_fn( hc_instruction_list_40_goto /*hc_instruction_list_40_goto( state, db, 8 )*/, 8 );
    scan( state.lexer, 31, 3 );
    consume( state );
    state.push_fn( branch_1313be63a7d4233d, 8 );
    return hc_state_declaration( state, db, 0 )
};
    return ( prod  == 8 ) ? prod  : - 1
}

function hc_expected_symbols_list_45(state, db, prod){
    scan( state.lexer, 17, 3 );
    if( state.lexer._type  == 5 ){
    consume( state );
    scan( state.lexer, 3, 3 );
    add_reduce( state, 1, 4 );
    return hc_expected_symbols_list_45_goto( state, db, 9 )
};
    return - 1
}

function hc_expected_symbols_list_45_goto(state, db, prod){
    scan( state.lexer, 32, 3 );
    if( state.lexer._type  == 12 ){
    return 9
} else if( state.lexer._type  == 5 ){
    state.push_fn( hc_expected_symbols_list_45_goto /*hc_expected_symbols_list_45_goto( state, db, 9 )*/, 9 );
    scan( state.lexer, 17, 3 );
    consume( state );
    add_reduce( state, 2, 16 );
    return 0
};
    return ( prod  == 9 ) ? prod  : - 1
}

function hc_expected_symbols_group_47_0_(state, db, prod){
    scan( state.lexer, 33, 3 );
    if( state.lexer._type  == 32 ){
    consume( state );
    scan( state.lexer, 13, 3 );
    if( ( state.lexer._type  == 10 ) ){
        consume( state );
        state.push_fn( branch_a8bedddddda3d2c8, 10 );
        return hc_expected_symbols_list_45( state, db, 0 )
    }
};
    return - 1
}

function hc_comment_list_76(state, db, prod){
    scan( state.lexer, 34, 24 );
    if( isTokenActive( state.lexer._type, 35 ) ){
    consume( state );
    add_reduce( state, 1, 4 );
    return hc_comment_list_76_goto( state, db, 11 )
};
    return - 1
}

function hc_comment_list_76_goto(state, db, prod){
    scan( state.lexer, 29, 24 );
    if( state.lexer._type  == 2 ){
    state.push_fn( hc_comment_list_76_goto /*hc_comment_list_76_goto( state, db, 11 )*/, 11 );
    scan( state.lexer, 36, 3 );
    consume( state );
    add_reduce( state, 2, 16 );
    return 0
} else if( state.lexer._type  == 8 ){
    state.push_fn( hc_comment_list_76_goto /*hc_comment_list_76_goto( state, db, 11 )*/, 11 );
    scan( state.lexer, 3, 37 );
    consume( state );
    add_reduce( state, 2, 16 );
    return 0
} else if( state.lexer._type  == 7 ){
    state.push_fn( hc_comment_list_76_goto /*hc_comment_list_76_goto( state, db, 11 )*/, 11 );
    scan( state.lexer, 3, 38 );
    consume( state );
    add_reduce( state, 2, 16 );
    return 0
} else if( state.lexer._type  == 3 ){
    state.push_fn( hc_comment_list_76_goto /*hc_comment_list_76_goto( state, db, 11 )*/, 11 );
    scan( state.lexer, 39, 3 );
    consume( state );
    add_reduce( state, 2, 16 );
    return 0
} else if( state.lexer._type  == 5 ){
    state.push_fn( hc_comment_list_76_goto /*hc_comment_list_76_goto( state, db, 11 )*/, 11 );
    scan( state.lexer, 17, 3 );
    consume( state );
    add_reduce( state, 2, 16 );
    return 0
};
    return ( prod  == 11 ) ? prod  : - 1
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

    const reduce_functions = [(_,s)=>s[s.length-1], (env, sym, pos)=> ({type:"state",id:sym[0],instructions:sym[1],symbol_meta:sym[2]}) /*0*/,
(env, sym, pos)=> ({type:"state",id:sym[0],instructions:sym[1],symbol_meta:null}) /*1*/,
(env, sym, pos)=> (sym[2]) /*2*/,
(env, sym, pos)=> ([sym[0]]) /*3*/,
(env, sym, pos)=> ((sym[0].push(sym[2]),sym[0])) /*4*/,
(env, sym, pos)=> ({type:"prod",ids:sym[2],instructions:sym[4]}) /*5*/,
(env, sym, pos)=> ({type:"shift",ids:sym[1],goto_state:sym[3]}) /*6*/,
(env, sym, pos)=> ({type:"goto",ids:sym[1],goto_state:sym[3]}) /*7*/,
(env, sym, pos)=> ({type:"goto",state:sym[1]}) /*8*/,
(env, sym, pos)=> ({type:"goto",len:sym[1],reduce_fn:sym[2]}) /*9*/,
(env, sym, pos)=> ({type:"set-prod",id:sym[3]}) /*10*/,
(env, sym, pos)=> ({type:"fork-to",states:sym[3]}) /*11*/,
(env, sym, pos)=> ({type:"symbols",expected:sym[3],skipped:sym[5]||[]}) /*12*/,
(env, sym, pos)=> ({type:"symbols",expected:sym[3],skipped:null||[]}) /*13*/,
(env, sym, pos)=> ({type:"id-list",ids:sym[1]}) /*14*/,
(env, sym, pos)=> ((sym[0].push(sym[1]),sym[0])) /*15*/];

    export default ParserFactory
        (reduce_functions, undefined, recognizer_initializer, {start:0});