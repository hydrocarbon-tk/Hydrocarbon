
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
    

        var token_lookup = new Uint32Array([40,16,0,32,4480,512,384,512,771277186,519,33152,512,262528,512,33154,516,131456,512,763666818,519,4497794,516,1410,772,384,520,771277184,515,384,576,896,512,1408,512,2432,512,767574016,3,767574400,515,763363328,3,763363712,515,65920,512,3670400,512,4194688,512,416,512,1073807744,512,33554816,512,2147484032,512,268435840,512,384,514,384,516,424,528,40,528,0,512,0,528,8,512,32,512,384,544,428,576,3703170,516,303490,516,767861122,519,8576,512,262528,640,384,640,384,768,4512,512,428,512,428,0,388,512,128,512,256,512,392,512]);;
        var token_sequence_lookup = new Uint8Array([91,93,40,41,115,121,109,98,111,108,115,58,95,47,42,47,44,69,78,68,95,79,70,95,80,82,79,68,85,67,84,73,79,78,116,104,101,110,111,110,112,114,111,100,99,111,110,115,117,109,101,97,115,115,101,114,116,103,111,116,111,114,101,100,117,99,101,102,111,114,107,117,110,116,105,108,101,120,112,101,99,116,101,100,115,107,105,112,112,101,100,112,101,101,107,102,97,105,108,115,116,97,116,101,115,99,97,110,115,101,116,112,97,115,115,112,111,112]);;
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
            if( isTokenActive( 38, tk_row ) && lexer.get_byte_at( lexer.byte_offset  + 1 ) == 47 ){
                lexer.setToken( 38, 2, 2 );
                return
            }
        }
    }
    break;
    case 44: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 44 ){
            if( isTokenActive( 39, tk_row ) ){
                lexer.setToken( 39, 1, 1 );
                return
            }
        }
    }
    break;
    case 47: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 47 ){
            if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 42 ){
                if( isTokenActive( 41, tk_row ) && token_production( lexer, hc_comment, 12, 41, 2 ) && lexer.byte_length  > 2 ){
                    return
                } else if( isTokenActive( 37, tk_row ) ){
                    lexer.setToken( 37, 2, 2 );
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
            } else if( isTokenActive( 36, tk_row ) ){
                lexer.setToken( 36, 1, 1 );
                return
            }
        }
    }
    break;
    case 97: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 97 ){
            if( 5 == compare( lexer, lexer.byte_offset  + 1, 52, 5, token_sequence_lookup ) ){
                if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 6 ){
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
    case 99: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 99 ){
            if( 6 == compare( lexer, lexer.byte_offset  + 1, 45, 6, token_sequence_lookup ) ){
                if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 7 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 7 ){
                    return
                } else if( isTokenActive( 19, tk_row ) ){
                    lexer.setToken( 19, 7, 7 );
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
                if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 8 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 8 ){
                    return
                } else if( isTokenActive( 35, tk_row ) ){
                    lexer.setToken( 35, 8, 8 );
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
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 4 ){
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
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 33, tk_row ) ){
                        lexer.setToken( 33, 4, 4 );
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
                if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 4 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                    return
                } else if( isTokenActive( 22, tk_row ) ){
                    lexer.setToken( 22, 4, 4 );
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
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 93, 2, token_sequence_lookup ) ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 20, tk_row ) ){
                        lexer.setToken( 20, 4, 4 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 97 ){
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 113, 2, token_sequence_lookup ) ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 32, tk_row ) ){
                        lexer.setToken( 32, 4, 4 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 111 ){
                if( lexer.get_byte_at( lexer.byte_offset  + 2 ) == 112 ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 3 ){
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
                if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 6 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 6 ){
                    return
                } else if( isTokenActive( 23, tk_row ) ){
                    lexer.setToken( 23, 6, 6 );
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
                    if( isTokenActive( 34, tk_row ) ){
                        lexer.setToken( 34, 8, 8 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 107 ){
                if( 5 == compare( lexer, lexer.byte_offset  + 2, 86, 5, token_sequence_lookup ) ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 7 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 7 ){
                        return
                    } else if( isTokenActive( 40, tk_row ) ){
                        lexer.setToken( 40, 7, 7 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 116 ){
                if( 3 == compare( lexer, lexer.byte_offset  + 2, 101, 3, token_sequence_lookup ) ){
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
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 106, 2, token_sequence_lookup ) ){
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 4 ){
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
                    if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 3 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 3 ){
                        return
                    } else if( isTokenActive( 24, tk_row ) ){
                        lexer.setToken( 24, 3, 3 );
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
                if( isTokenActive( 11, tk_row ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) && lexer.byte_length  > 5 ){
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
    if( isTokenActive( 11, tk_row ) && pre_scan( lexer, 0 ) && token_production( lexer, hc_state_hash_token, 11, 11, 1 ) ){
    return
} else if( isTokenActive( 41, tk_row ) && pre_scan( lexer, 1 ) && token_production( lexer, hc_comment, 12, 41, 2 ) ){
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
} else if( isTokenActive( 30, tk_row ) && false ){
    return
} else if( isTokenActive( 31, tk_row ) && false ){
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

function branch_09241bec2304ff59(state, db, prod){
    scan( state.lexer, 2, 3 );
    if( ( state.lexer._type  == 12 ) ){
    consume( state );
    add_reduce( state, 3, 25 );
    return 10
};
    return - 1
}

function branch_09fd4c587b3f4d77(state, db, prod){
    add_reduce( state, 3, 2 );
    return 0
}

function branch_1e3ac8120e7b258b(state, db, prod){
    add_reduce( state, 4, 1 );
    return 0
}

function branch_1f1cd62546de8ef3(state, db, prod){
    scan( state.lexer, 4, 3 );
    if( state.lexer._type  == 15 ){
    scan( state.lexer, 5, 3 );
    state.push_fn( branch_3387e77891249833, 0 );
    return hc_on_fail( state, db, 0 )
} else if( state.lexer._type  == 34 ){
    state.push_fn( set_production /*0*/, 0 );
    state.push_fn( branch_09fd4c587b3f4d77, 0 );
    return hc_expected_symbols( state, db, 0 )
} else {
    add_reduce( state, 2, 4 );
    return 0
};
    return - 1
}

function branch_24688069b5ce18e0(state, db, prod){
    scan( state.lexer, 6, 3 );
    if( ( state.lexer._type  == 18 ) ){
    consume( state );
    add_reduce( state, 5, 10 );
    return 0
};
    return - 1
}

function branch_2a968cc2b40ebd70(state, db, prod){
    add_reduce( state, 1, 26 );
    return hc_top_level_instructions_list_8_goto( state, db, 13 )
}

function branch_2afaeb04edb3f602(state, db, prod){
    scan( state.lexer, 6, 3 );
    if( ( state.lexer._type  == 18 ) ){
    consume( state );
    add_reduce( state, 6, 8 );
    return 4
};
    return - 1
}

function branch_3387e77891249833(state, db, prod){
    scan( state.lexer, 7, 3 );
    if( state.lexer._type  == 34 ){
    state.push_fn( set_production /*0*/, 0 );
    state.push_fn( branch_1e3ac8120e7b258b, 0 );
    return hc_expected_symbols( state, db, 0 )
} else {
    add_reduce( state, 3, 3 );
    return 0
};
    return - 1
}

function branch_3f8182aea14b8c8e(state, db, prod){
    add_reduce( state, 1, 26 );
    return hc_top_level_instructions_list_9_goto( state, db, 14 )
}

function branch_48fab4c983fae22f(state, db, prod){
    add_reduce( state, 3, 6 );
    return 0
}

function branch_4ce9937f887078b2(state, db, prod){
    add_reduce( state, 4, 23 );
    return 0
}

function branch_4fc9661fb15b9050(state, db, prod){
    add_reduce( state, 5, 21 );
    return 0
}

function branch_534c23bb8d20e460(state, db, prod){
    add_reduce( state, 2, 12 );
    return 6
}

function branch_56ee49179a9036f8(state, db, prod){
    scan( state.lexer, 8, 3 );
    if( ( state.lexer._type  == 17 ) ){
    consume( state );
    state.push_fn( branch_5c579842384c7cc1, 5 );
    return hc_instruction_sequence( state, db, 0 )
};
    return - 1
}

function branch_5c579842384c7cc1(state, db, prod){
    scan( state.lexer, 6, 3 );
    if( ( state.lexer._type  == 18 ) ){
    consume( state );
    add_reduce( state, 5, 9 );
    return 0
};
    return - 1
}

function branch_5ec08e5ea3d8cbee(state, db, prod){
    add_reduce( state, 1, 26 );
    return hc_instruction_sequence_list_14_goto( state, db, 16 )
}

function branch_663bd9f01a6e95cc(state, db, prod){
    scan( state.lexer, 8, 3 );
    if( ( state.lexer._type  == 17 ) ){
    consume( state );
    state.push_fn( branch_24688069b5ce18e0, 5 );
    return hc_instruction_sequence( state, db, 0 )
};
    return - 1
}

function branch_70d9326e6c9dc217(state, db, prod){
    add_reduce( state, 3, 28 );
    return 0
}

function branch_70ff8ef04cf15b22(state, db, prod){
    scan( state.lexer, 8, 3 );
    if( ( state.lexer._type  == 17 ) ){
    consume( state );
    state.push_fn( branch_2afaeb04edb3f602, 4 );
    return hc_instruction_sequence( state, db, 0 )
};
    return - 1
}

function branch_72e3401669683f29(state, db, prod){
    add_reduce( state, 1, 26 );
    return hc_sequence_instruction_list_50_goto( state, db, 17 )
}

function branch_751100de770ef59a(state, db, prod){
    scan( state.lexer, 9, 3 );
    if( state.lexer._type  == 13 ){
    consume( state );
    scan( state.lexer, 10, 3 );
    if( state.lexer._type  == 22 ){
        state.push_fn( set_production /*3*/, 3 );
        state.push_fn( branch_48fab4c983fae22f, 3 );
        return hc_instruction_sequence_list_14( state, db, 0 )
    } else {
        add_reduce( state, 2, 7 );
        return 3
    }
} else {
    add_reduce( state, 1, 7 );
    return 3
};
    return - 1
}

function branch_85d78aedee54ffcc(state, db, prod){
    scan( state.lexer, 11, 3 );
    if( state.lexer._type  == 40 ){
    state.push_fn( set_production /*9*/, 9 );
    state.push_fn( branch_4ce9937f887078b2, 9 );
    return hc_expected_symbols_group_71_0_( state, db, 0 )
} else {
    add_reduce( state, 3, 24 );
    return 9
};
    return - 1
}

function branch_90027aac5df605d9(state, db, prod){
    scan( state.lexer, 4, 3 );
    if( state.lexer._type  == 34 ){
    var pk = state.lexer.copy_in_place(  );;
    pk.next(  );
    scan( pk, 12, 3 );
    if( pk._type  == 35 ){
        state.lexer._type  = 34;
        state.push_fn( set_production /*8*/, 8 );
        state.push_fn( branch_4fc9661fb15b9050, 8 );
        return hc_expected_symbols( state, db, 0 )
    }
} else {
    add_reduce( state, 4, 22 );
    return 8
};
    return - 1
}

function branch_a1b3417dff963a60(state, db, prod){
    scan( state.lexer, 8, 3 );
    if( ( state.lexer._type  == 17 ) ){
    consume( state );
    state.push_fn( branch_b46b69228a0b1a39, 5 );
    return hc_instruction_sequence( state, db, 0 )
};
    return - 1
}

function branch_a3528dd9db93cceb(state, db, prod){
    scan( state.lexer, 13, 3 );
    state.push_fn( branch_90027aac5df605d9, 0 );
    return hc_top_level_instructions( state, db, 0 )
}

function branch_aa55d57f5c992c3d(state, db, prod){
    add_reduce( state, 2, 27 );
    return 0
}

function branch_b46b69228a0b1a39(state, db, prod){
    scan( state.lexer, 6, 3 );
    if( ( state.lexer._type  == 18 ) ){
    consume( state );
    add_reduce( state, 5, 11 );
    return 0
};
    return - 1
}

function branch_b746cd81e4d68731(state, db, prod){
    add_reduce( state, 1, 26 );
    return hc_instruction_sequence_list_11_goto( state, db, 15 )
}

function branch_b8079507bd3d197d(state, db, prod){
    scan( state.lexer, 14, 3 );
    if( ( state.lexer._type  == 38 ) ){
    consume( state );
    add_reduce( state, 3, 0 );
    return 0
};
    return - 1
}

function branch_b979fc5217d0095d(state, db, prod){
    add_reduce( state, 3, 16 );
    return 0
}

function branch_c69edb7dd9b46753(state, db, prod){
    scan( state.lexer, 6, 3 );
    if( ( state.lexer._type  == 18 ) ){
    consume( state );
    add_reduce( state, 5, 15 );
    return 0
};
    return - 1
}

function branch_e3da75fb6b2c82f4(state, db, prod){
    scan( state.lexer, 13, 3 );
    state.push_fn( branch_1f1cd62546de8ef3, 0 );
    return hc_top_level_instructions( state, db, 0 )
}

function branch_ecd3e3ed87b1beee(state, db, prod){
    add_reduce( state, 2, 29 );
    return 18
}

function hc_start(state, db, prod){
    state.push_fn( branch_e3da75fb6b2c82f4, 0 );
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

function hc_top_level_instructions(state, db, prod){
    scan( state.lexer, 13, 3 );
    if( isTokenActive( state.lexer._type, 18 ) ){
    state.push_fn( set_production /*2*/, 2 );
    state.push_fn( set_production /*0*/, 2 );
    return hc_instruction_sequence( state, db, 0 )
} else if( state.lexer._type  == 19 || state.lexer._type  == 20 || state.lexer._type  == 21 ){
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
    scan( state.lexer, 19, 3 );
    if( state.lexer._type  == 14 ){
    state.push_fn( set_production /*3*/, 3 );
    state.lexer.setToken( 2, 0, 0 );
    consume( state );
    return 0
} else if( isTokenActive( state.lexer._type, 20 ) ){
    scan( state.lexer, 21, 3 );
    state.push_fn( branch_751100de770ef59a, 0 );
    return hc_instruction_sequence_list_11( state, db, 0 )
} else if( state.lexer._type  == 22 ){
    state.push_fn( set_production /*3*/, 3 );
    state.push_fn( set_production /*0*/, 3 );
    return hc_instruction_sequence_list_14( state, db, 0 )
};
    state.lexer.setToken( 2, 0, 0 );
    consume( state );
    return 3
}

function hc_prod_branch_instruction(state, db, prod){
    scan( state.lexer, 5, 3 );
    if( state.lexer._type  == 15 ){
    consume( state );
    scan( state.lexer, 22, 3 );
    if( ( state.lexer._type  == 16 ) ){
        consume( state );
        state.push_fn( branch_70ff8ef04cf15b22, 4 );
        return hc_id_list( state, db, 0 )
    }
};
    return - 1
}

function hc_token_branch_instruction(state, db, prod){
    scan( state.lexer, 23, 3 );
    if( state.lexer._type  == 19 ){
    state.push_fn( set_production /*5*/, 5 );
    consume( state );
    state.push_fn( branch_56ee49179a9036f8, 5 );
    return hc_id_list( state, db, 0 )
} else if( state.lexer._type  == 20 ){
    state.push_fn( set_production /*5*/, 5 );
    consume( state );
    state.push_fn( branch_663bd9f01a6e95cc, 5 );
    return hc_id_list( state, db, 0 )
} else if( state.lexer._type  == 21 ){
    state.push_fn( set_production /*5*/, 5 );
    consume( state );
    state.push_fn( branch_a1b3417dff963a60, 5 );
    return hc_id_list( state, db, 0 )
};
    return - 1
}

function hc_goto_instruction(state, db, prod){
    scan( state.lexer, 24, 3 );
    if( state.lexer._type  == 22 ){
    consume( state );
    scan( state.lexer, 15, 3 );
    if( ( state.lexer._type  == 9 ) ){
        state.push_fn( branch_534c23bb8d20e460, 6 );
        return hc_state_declaration( state, db, 0 )
    }
};
    return - 1
}

function hc_sequence_instruction(state, db, prod){
    scan( state.lexer, 21, 3 );
    if( state.lexer._type  == 23 ){
    state.push_fn( set_production /*7*/, 7 );
    consume( state );
    scan( state.lexer, 25, 3 );
    if( ( state.lexer._type  == 5 ) ){
        consume( state );
        scan( state.lexer, 25, 3 );
        if( ( state.lexer._type  == 5 ) ){
            consume( state );
            add_reduce( state, 3, 13 );
            return 0
        }
    };
    return - 1
} else if( state.lexer._type  == 24 ){
    consume( state );
    scan( state.lexer, 26, 3 );
    if( state.lexer._type  == 16 ){
        state.push_fn( set_production /*7*/, 7 );
        consume( state );
        scan( state.lexer, 27, 3 );
        if( ( state.lexer._type  == 25 ) ){
            consume( state );
            scan( state.lexer, 25, 3 );
            if( ( state.lexer._type  == 5 ) ){
                consume( state );
                add_reduce( state, 4, 14 );
                return 0
            }
        };
        return - 1
    } else if( state.lexer._type  == 30 ){
        state.push_fn( set_production /*7*/, 7 );
        consume( state );
        scan( state.lexer, 28, 3 );
        if( ( state.lexer._type  == 31 ) ){
            consume( state );
            scan( state.lexer, 25, 3 );
            if( ( state.lexer._type  == 5 ) ){
                consume( state );
                add_reduce( state, 4, 18 );
                return 0
            }
        };
        return - 1
    }
} else if( state.lexer._type  == 26 ){
    state.push_fn( set_production /*7*/, 7 );
    consume( state );
    scan( state.lexer, 27, 3 );
    if( ( state.lexer._type  == 25 ) ){
        consume( state );
        scan( state.lexer, 8, 3 );
        if( ( state.lexer._type  == 17 ) ){
            consume( state );
            state.push_fn( branch_c69edb7dd9b46753, 7 );
            return hc_sequence_instruction_list_50( state, db, 0 )
        }
    };
    return - 1
} else if( state.lexer._type  == 27 ){
    state.push_fn( set_production /*7*/, 7 );
    consume( state );
    scan( state.lexer, 29, 3 );
    if( ( state.lexer._type  == 28 ) ){
        consume( state );
        state.push_fn( branch_b979fc5217d0095d, 7 );
        return hc_id_list( state, db, 0 )
    };
    return - 1
} else if( state.lexer._type  == 29 ){
    state.push_fn( set_production /*7*/, 7 );
    consume( state );
    scan( state.lexer, 25, 3 );
    if( ( state.lexer._type  == 5 ) ){
        consume( state );
        add_reduce( state, 2, 17 );
        return 0
    };
    return - 1
} else if( state.lexer._type  == 32 ){
    state.push_fn( set_production /*7*/, 7 );
    consume( state );
    add_reduce( state, 1, 19 );
    return 0
} else if( state.lexer._type  == 33 ){
    state.push_fn( set_production /*7*/, 7 );
    consume( state );
    add_reduce( state, 1, 20 );
    return 0
};
    return - 1
}

function hc_on_fail(state, db, prod){
    scan( state.lexer, 5, 3 );
    if( state.lexer._type  == 15 ){
    consume( state );
    scan( state.lexer, 30, 3 );
    if( state.lexer._type  == 33 ){
        consume( state );
        scan( state.lexer, 15, 3 );
        state.push_fn( branch_a3528dd9db93cceb, 0 );
        return hc_state_declaration( state, db, 0 )
    }
};
    return - 1
}

function hc_expected_symbols(state, db, prod){
    scan( state.lexer, 31, 3 );
    if( state.lexer._type  == 34 ){
    consume( state );
    scan( state.lexer, 12, 3 );
    if( state.lexer._type  == 35 ){
        consume( state );
        scan( state.lexer, 16, 3 );
        state.push_fn( branch_85d78aedee54ffcc, 0 );
        return hc_id_list( state, db, 0 )
    }
};
    return - 1
}

function hc_id_list(state, db, prod){
    scan( state.lexer, 16, 3 );
    if( state.lexer._type  == 10 ){
    consume( state );
    scan( state.lexer, 25, 3 );
    if( ( state.lexer._type  == 5 ) ){
        state.push_fn( branch_09241bec2304ff59, 10 );
        return hc_id_list_list_77( state, db, 0 )
    }
};
    return - 1
}

function hc_state_hash_token(state, db, prod){
    scan( state.lexer, 32, 3 );
    if( state.lexer._type  == 3 || state.lexer._type  == 5 || state.lexer._type  == 36 ){
    consume( state );
    return hc_state_hash_token_goto( state, db, 11 )
};
    return - 1
}

function hc_state_hash_token_goto(state, db, prod){
    scan( state.lexer, 33, 34 );
    if( state.lexer._type  == 36 ){
    state.push_fn( hc_state_hash_token_goto /*hc_state_hash_token_goto( state, db, 11 )*/, 11 );
    scan( state.lexer, 35, 34 );
    consume( state );
    add_reduce( state, 2, 0 );
    return 0
} else if( state.lexer._type  == 3 ){
    state.push_fn( hc_state_hash_token_goto /*hc_state_hash_token_goto( state, db, 11 )*/, 11 );
    scan( state.lexer, 36, 34 );
    consume( state );
    add_reduce( state, 2, 0 );
    return 0
} else if( state.lexer._type  == 5 ){
    state.push_fn( hc_state_hash_token_goto /*hc_state_hash_token_goto( state, db, 11 )*/, 11 );
    scan( state.lexer, 37, 34 );
    consume( state );
    add_reduce( state, 2, 0 );
    return 0
};
    return ( prod  == 11 ) ? prod  : - 1
}

function hc_comment(state, db, prod){
    scan( state.lexer, 38, 3 );
    if( state.lexer._type  == 37 ){
    consume( state );
    scan( state.lexer, 39, 34 );
    if( state.lexer._type  == 38 ){
        state.push_fn( set_production /*12*/, 12 );
        consume( state );
        add_reduce( state, 2, 0 );
        return 0
    } else {
        state.push_fn( set_production /*12*/, 12 );
        state.push_fn( branch_b8079507bd3d197d, 12 );
        return hc_comment_list_98( state, db, 0 )
    }
};
    return - 1
}

function hc_top_level_instructions_list_8(state, db, prod){
    state.push_fn( branch_2a968cc2b40ebd70, 13 );
    return hc_prod_branch_instruction( state, db, 0 )
}

function hc_top_level_instructions_list_8_goto(state, db, prod){
    while( true ) {
        switch(prod){
            case 13: 
            {
                scan( state.lexer, 7, 3 );
                if( state.lexer._type  == 15 ){
                    var pk = state.lexer.copy_in_place(  );;
                    pk.next(  );
                    scan( pk, 22, 3 );
                    if( pk._type  == 16 ){
                        state.lexer._type  = 15;
                        state.push_fn( hc_top_level_instructions_list_8_goto /*hc_top_level_instructions_list_8_goto( state, db, 13 )*/, 13 );
                        scan( state.lexer, 5, 3 );
                        if( ( state.lexer._type  == 15 ) ){
                            state.push_fn( branch_aa55d57f5c992c3d, 13 );
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
    state.push_fn( branch_3f8182aea14b8c8e, 14 );
    return hc_token_branch_instruction( state, db, 0 )
}

function hc_top_level_instructions_list_9_goto(state, db, prod){
    while( true ) {
        switch(prod){
            case 14: 
            {
                scan( state.lexer, 40, 3 );
                if( state.lexer._type  == 19 || state.lexer._type  == 20 || state.lexer._type  == 21 ){
                    state.push_fn( hc_top_level_instructions_list_9_goto /*hc_top_level_instructions_list_9_goto( state, db, 14 )*/, 14 );
                    scan( state.lexer, 23, 3 );
                    if( ( state.lexer._type  == 19 || state.lexer._type  == 20 || state.lexer._type  == 21 ) ){
                        state.push_fn( branch_aa55d57f5c992c3d, 14 );
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
    state.push_fn( branch_b746cd81e4d68731, 15 );
    return hc_sequence_instruction( state, db, 0 )
}

function hc_instruction_sequence_list_11_goto(state, db, prod){
    while( true ) {
        switch(prod){
            case 15: 
            {
                scan( state.lexer, 41, 3 );
                if( state.lexer._type  == 13 ){
                    var pk = state.lexer.copy_in_place(  );;
                    pk.next(  );
                    scan( pk, 42, 3 );
                    if( isTokenActive( pk._type, 20 ) ){
                        state.lexer._type  = 23;
                        state.push_fn( hc_instruction_sequence_list_11_goto /*hc_instruction_sequence_list_11_goto( state, db, 15 )*/, 15 );
                        consume( state );
                        state.push_fn( branch_70d9326e6c9dc217, 15 );
                        return hc_sequence_instruction( state, db, 0 )
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
    state.push_fn( branch_5ec08e5ea3d8cbee, 16 );
    return hc_goto_instruction( state, db, 0 )
}

function hc_instruction_sequence_list_14_goto(state, db, prod){
    while( true ) {
        switch(prod){
            case 16: 
            {
                scan( state.lexer, 41, 3 );
                if( state.lexer._type  == 13 ){
                    state.push_fn( hc_instruction_sequence_list_14_goto /*hc_instruction_sequence_list_14_goto( state, db, 16 )*/, 16 );
                    scan( state.lexer, 43, 3 );
                    consume( state );
                    state.push_fn( branch_70d9326e6c9dc217, 16 );
                    return hc_goto_instruction( state, db, 0 )
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

function hc_sequence_instruction_list_50(state, db, prod){
    state.push_fn( branch_72e3401669683f29, 17 );
    return hc_state_declaration( state, db, 0 )
}

function hc_sequence_instruction_list_50_goto(state, db, prod){
    scan( state.lexer, 44, 3 );
    if( state.lexer._type  == 39 ){
    state.push_fn( hc_sequence_instruction_list_50_goto /*hc_sequence_instruction_list_50_goto( state, db, 17 )*/, 17 );
    scan( state.lexer, 45, 3 );
    consume( state );
    state.push_fn( branch_70d9326e6c9dc217, 17 );
    return hc_state_declaration( state, db, 0 )
};
    return ( prod  == 17 ) ? prod  : - 1
}

function hc_expected_symbols_group_71_0_(state, db, prod){
    scan( state.lexer, 46, 3 );
    if( state.lexer._type  == 40 ){
    consume( state );
    scan( state.lexer, 16, 3 );
    if( ( state.lexer._type  == 10 ) ){
        state.push_fn( branch_ecd3e3ed87b1beee, 18 );
        return hc_id_list( state, db, 0 )
    }
};
    return - 1
}

function hc_id_list_list_77(state, db, prod){
    scan( state.lexer, 25, 3 );
    if( state.lexer._type  == 5 ){
    consume( state );
    scan( state.lexer, 3, 3 );
    add_reduce( state, 1, 26 );
    return hc_id_list_list_77_goto( state, db, 19 )
};
    return - 1
}

function hc_id_list_list_77_goto(state, db, prod){
    scan( state.lexer, 47, 3 );
    if( state.lexer._type  == 5 ){
    state.push_fn( hc_id_list_list_77_goto /*hc_id_list_list_77_goto( state, db, 19 )*/, 19 );
    scan( state.lexer, 25, 3 );
    consume( state );
    add_reduce( state, 2, 27 );
    return 0
};
    return ( prod  == 19 ) ? prod  : - 1
}

function hc_comment_list_98(state, db, prod){
    scan( state.lexer, 48, 34 );
    if( isTokenActive( state.lexer._type, 49 ) ){
    consume( state );
    add_reduce( state, 1, 26 );
    return hc_comment_list_98_goto( state, db, 20 )
};
    return - 1
}

function hc_comment_list_98_goto(state, db, prod){
    scan( state.lexer, 39, 34 );
    if( state.lexer._type  == 2 ){
    state.push_fn( hc_comment_list_98_goto /*hc_comment_list_98_goto( state, db, 20 )*/, 20 );
    scan( state.lexer, 50, 3 );
    consume( state );
    add_reduce( state, 2, 27 );
    return 0
} else if( state.lexer._type  == 8 ){
    state.push_fn( hc_comment_list_98_goto /*hc_comment_list_98_goto( state, db, 20 )*/, 20 );
    scan( state.lexer, 3, 51 );
    consume( state );
    add_reduce( state, 2, 27 );
    return 0
} else if( state.lexer._type  == 7 ){
    state.push_fn( hc_comment_list_98_goto /*hc_comment_list_98_goto( state, db, 20 )*/, 20 );
    scan( state.lexer, 3, 52 );
    consume( state );
    add_reduce( state, 2, 27 );
    return 0
} else if( state.lexer._type  == 3 ){
    state.push_fn( hc_comment_list_98_goto /*hc_comment_list_98_goto( state, db, 20 )*/, 20 );
    scan( state.lexer, 53, 3 );
    consume( state );
    add_reduce( state, 2, 27 );
    return 0
} else if( state.lexer._type  == 5 ){
    state.push_fn( hc_comment_list_98_goto /*hc_comment_list_98_goto( state, db, 20 )*/, 20 );
    scan( state.lexer, 25, 3 );
    consume( state );
    add_reduce( state, 2, 27 );
    return 0
};
    return ( prod  == 20 ) ? prod  : - 1
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
(env, sym, pos)=> ([...sym[0],...sym[2]]) /*5*/,
(env, sym, pos)=> ([...sym[0]]) /*6*/,
(env, sym, pos)=> ({type:"prod",ids:sym[2],instructions:sym[4]}) /*7*/,
(env, sym, pos)=> ({type:"consume",ids:sym[1],instructions:sym[3]}) /*8*/,
(env, sym, pos)=> ({type:"peek",ids:sym[1],instructions:sym[3]}) /*9*/,
(env, sym, pos)=> ({type:"assert",ids:sym[1],instructions:sym[3]}) /*10*/,
(env, sym, pos)=> ({type:"goto",state:sym[1]}) /*11*/,
(env, sym, pos)=> ({type:"reduce",len:parseInt(sym[1]),reduce_fn:parseInt(sym[2])}) /*12*/,
(env, sym, pos)=> ({type:"set-prod",id:parseInt(sym[3])}) /*13*/,
(env, sym, pos)=> ({type:"fork-to",states:sym[3]}) /*14*/,
(env, sym, pos)=> ({type:"scan-until",token_ids:sym[2]}) /*15*/,
(env, sym, pos)=> ({type:"pop",len:parseInt(sym[1])}) /*16*/,
(env, sym, pos)=> ({type:"token-length",len:parseInt(sym[1])}) /*17*/,
(env, sym, pos)=> ({type:"pass"}) /*18*/,
(env, sym, pos)=> ({type:"fail"}) /*19*/,
(env, sym, pos)=> ({type:"on-fail-state",id:sym[2],instructions:sym[3],symbol_meta:sym[4]}) /*20*/,
(env, sym, pos)=> ({type:"on-fail-state",id:sym[2],instructions:sym[3]}) /*21*/,
(env, sym, pos)=> ({type:"symbols",expected:sym[2],skipped:sym[3]||[]}) /*22*/,
(env, sym, pos)=> ({type:"symbols",expected:sym[2],skipped:null||[]}) /*23*/,
(env, sym, pos)=> (sym[1].map(i=>parseInt(i))) /*24*/,
(env, sym, pos)=> ([sym[0]]) /*25*/,
(env, sym, pos)=> ((sym[0].push(sym[1]),sym[0])) /*26*/,
(env, sym, pos)=> ((sym[0].push(sym[2]),sym[0])) /*27*/,
(env, sym, pos)=> (sym[1]) /*28*/];

    export default ParserFactory
        (reduce_functions, undefined, recognizer_initializer, {start:0});