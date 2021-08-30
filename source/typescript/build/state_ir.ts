
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
    

        var token_lookup = new Uint32Array([40,768,8,256,0,1024,4480,1048576,384,1048576,1048960,1048576,135552,1048640,131456,1048576,1877180800,1048633,34771330,1048640,524672,1048576,384,8192,384,0,1813156226,1048697,33554816,1179648,33554816,1048576,1877180802,1048697,2432,1048576,384,1052672,384,1050624,20866,1572928,2474,118784,131458,1048640,1877184898,1048697,384,1048704,4480,1048640,896,1048576,1408,1048576,8576,1048576,16768,1048576,1408,4096,1845592064,57,1845592448,1048633,1811939328,57,1811939712,1048633,262528,1048576,31457664,1048576,416,1048576,262528,1048578,268435840,1048576,392,1048580,2147484032,1048576,384,1048608,384,1048640,416,1167360,32,118784,424,1049344,40,1049344,0,1048576,0,1048832,0,1049088,32,1048576,8,1048576,384,1049600,428,1050624,384,4096,392,256,40,256,0,256,8,0,32,0,384,114688,384,16384,384,32768,424,0,386,0,384,65536,428,0,135554,1048640,31592834,1048640,1216898,1048640,1845494144,1179705,33152,1048576,384,1179648,1048960,1310720,384,1310720,384,1572864,2464,126976,2464,118784,384,1163264,428,1048576,388,1048576,128,1048576,256,1048576,392,1048576,424,1048576,2474,114688,430,0]);;
        var token_sequence_lookup = new Uint8Array([60,91,93,62,40,41,115,121,109,98,111,108,115,58,95,45,47,42,47,58,58,103,111,116,111,116,104,101,110,92,44,69,78,68,95,79,70,95,80,82,79,68,85,67,84,73,79,78,111,110,112,114,111,100,110,111,99,111,110,115,117,109,101,97,115,115,101,114,116,114,101,100,117,99,101,102,111,114,107,117,110,116,105,108,101,120,112,101,99,116,101,100,103,58,116,58,115,107,105,112,112,101,100,112,101,101,107,114,101,112,101,97,116,102,97,105,108,101,110,100,115,116,97,116,101,115,99,97,110,115,101,116,112,97,115,115,112,111,112]);;
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
            if( isTokenActive( 19, tk_row ) ){
                lexer.setToken( 19, 1, 1 );
                return
            }
        }
    }
    break;
    case 41: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 41 ){
            if( isTokenActive( 20, tk_row ) ){
                lexer.setToken( 20, 1, 1 );
                return
            }
        }
    }
    break;
    case 42: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 42 ){
            if( isTokenActive( 43, tk_row ) && lexer.get_byte_at( lexer.byte_offset  + 1 ) == 47 ){
                lexer.setToken( 43, 2, 2 );
                return
            }
        }
    }
    break;
    case 44: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 44 ){
            if( isTokenActive( 50, tk_row ) ){
                lexer.setToken( 50, 1, 1 );
                return
            }
        }
    }
    break;
    case 45: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 45 ){
            if( isTokenActive( 10, tk_row ) && token_production( lexer, hc_state_hash_token, 12, 10, 1 ) && lexer.byte_length  > 1 ){
                return
            } else if( isTokenActive( 41, tk_row ) ){
                lexer.setToken( 41, 1, 1 );
                return
            }
        }
    }
    break;
    case 47: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 47 ){
            if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 42 ){
                if( isTokenActive( 52, tk_row ) && token_production( lexer, hc_comment, 13, 52, 4 ) && lexer.byte_length  > 2 ){
                    return
                } else if( isTokenActive( 42, tk_row ) ){
                    lexer.setToken( 42, 2, 2 );
                    return
                }
            }
        }
    }
    break;
    case 58: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 58 ){
            if( isTokenActive( 45, tk_row ) && lexer.get_byte_at( lexer.byte_offset  + 1 ) == 58 ){
                lexer.setToken( 45, 2, 2 );
                return
            }
        }
    }
    break;
    case 60: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 60 ){
            if( isTokenActive( 9, tk_row ) && lexer.get_byte_at( lexer.byte_offset  + 1 ) == 91 ){
                lexer.setToken( 9, 2, 2 );
                return
            }
        }
    }
    break;
    case 62: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 62 ){
            if( isTokenActive( 12, tk_row ) ){
                lexer.setToken( 12, 1, 1 );
                return
            }
        }
    }
    break;
    case 91: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 91 ){
            if( isTokenActive( 14, tk_row ) ){
                lexer.setToken( 14, 1, 1 );
                return
            }
        }
    }
    break;
    case 92: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 92 ){
            if( isTokenActive( 48, tk_row ) ){
                lexer.setToken( 48, 1, 1 );
                return
            }
        }
    }
    break;
    case 93: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 93 ){
            if( isTokenActive( 11, tk_row ) ){
                lexer.setToken( 11, 1, 1 );
                return
            }
        }
    }
    break;
    case 95: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 95 ){
            if( isTokenActive( 10, tk_row ) && token_production( lexer, hc_state_hash_token, 12, 10, 1 ) && lexer.byte_length  > 1 ){
                return
            } else if( isTokenActive( 44, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 16, 44, 2 ) && lexer.byte_length  > 1 ){
                return
            } else if( isTokenActive( 40, tk_row ) ){
                lexer.setToken( 40, 1, 1 );
                return
            }
        }
    }
    break;
    case 97: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 97 ){
            if( 5 == compare( lexer, lexer.byte_offset  + 1, 64, 5, token_sequence_lookup ) ){
                if( isTokenActive( 10, tk_row ) && token_production( lexer, hc_state_hash_token, 12, 10, 1 ) && lexer.byte_length  > 6 ){
                    return
                } else if( isTokenActive( 44, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 16, 44, 2 ) && lexer.byte_length  > 6 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 6 ){
                    return
                } else if( isTokenActive( 24, tk_row ) ){
                    lexer.setToken( 24, 6, 6 );
                    return
                }
            }
        }
    }
    break;
    case 99: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 99 ){
            if( 6 == compare( lexer, lexer.byte_offset  + 1, 57, 6, token_sequence_lookup ) ){
                if( isTokenActive( 10, tk_row ) && token_production( lexer, hc_state_hash_token, 12, 10, 1 ) && lexer.byte_length  > 7 ){
                    return
                } else if( isTokenActive( 44, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 16, 44, 2 ) && lexer.byte_length  > 7 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 7 ){
                    return
                } else if( isTokenActive( 22, tk_row ) ){
                    lexer.setToken( 22, 7, 7 );
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
                if( 6 == compare( lexer, lexer.byte_offset  + 2, 86, 6, token_sequence_lookup ) ){
                    if( isTokenActive( 10, tk_row ) && token_production( lexer, hc_state_hash_token, 12, 10, 1 ) && lexer.byte_length  > 8 ){
                        return
                    } else if( isTokenActive( 44, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 16, 44, 2 ) && lexer.byte_length  > 8 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 8 ){
                        return
                    } else if( isTokenActive( 39, tk_row ) ){
                        lexer.setToken( 39, 8, 8 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 110 ){
                if( lexer.get_byte_at( lexer.byte_offset  + 2 ) == 100 ){
                    if( isTokenActive( 10, tk_row ) && token_production( lexer, hc_state_hash_token, 12, 10, 1 ) && lexer.byte_length  > 3 ){
                        return
                    } else if( isTokenActive( 44, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 16, 44, 2 ) && lexer.byte_length  > 3 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 3 ){
                        return
                    } else if( isTokenActive( 36, tk_row ) ){
                        lexer.setToken( 36, 3, 3 );
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
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 77, 2, token_sequence_lookup ) ){
                    if( isTokenActive( 10, tk_row ) && token_production( lexer, hc_state_hash_token, 12, 10, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 44, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 16, 44, 2 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 29, tk_row ) ){
                        lexer.setToken( 29, 4, 4 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 97 ){
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 115, 2, token_sequence_lookup ) ){
                    if( isTokenActive( 10, tk_row ) && token_production( lexer, hc_state_hash_token, 12, 10, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 44, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 16, 44, 2 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 37, tk_row ) ){
                        lexer.setToken( 37, 4, 4 );
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
            if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 111 ){
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 23, 2, token_sequence_lookup ) ){
                    if( isTokenActive( 10, tk_row ) && token_production( lexer, hc_state_hash_token, 12, 10, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 44, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 16, 44, 2 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 25, tk_row ) ){
                        lexer.setToken( 25, 4, 4 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 58 ){
                if( isTokenActive( 46, tk_row ) ){
                    lexer.setToken( 46, 2, 2 );
                    return
                }
            }
        }
    }
    break;
    case 110: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 110 ){
            if( 8 == compare( lexer, lexer.byte_offset  + 1, 55, 8, token_sequence_lookup ) ){
                if( isTokenActive( 10, tk_row ) && token_production( lexer, hc_state_hash_token, 12, 10, 1 ) && lexer.byte_length  > 9 ){
                    return
                } else if( isTokenActive( 44, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 16, 44, 2 ) && lexer.byte_length  > 9 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 9 ){
                    return
                } else if( isTokenActive( 21, tk_row ) ){
                    lexer.setToken( 21, 9, 9 );
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
                if( isTokenActive( 10, tk_row ) && token_production( lexer, hc_state_hash_token, 12, 10, 1 ) && lexer.byte_length  > 2 ){
                    return
                } else if( isTokenActive( 44, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 16, 44, 2 ) && lexer.byte_length  > 2 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 2 ){
                    return
                } else if( isTokenActive( 17, tk_row ) ){
                    lexer.setToken( 17, 2, 2 );
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
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 52, 2, token_sequence_lookup ) ){
                    if( isTokenActive( 10, tk_row ) && token_production( lexer, hc_state_hash_token, 12, 10, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 44, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 16, 44, 2 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 18, tk_row ) ){
                        lexer.setToken( 18, 4, 4 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 101 ){
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 105, 2, token_sequence_lookup ) ){
                    if( isTokenActive( 10, tk_row ) && token_production( lexer, hc_state_hash_token, 12, 10, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 44, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 16, 44, 2 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 23, tk_row ) ){
                        lexer.setToken( 23, 4, 4 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 97 ){
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 134, 2, token_sequence_lookup ) ){
                    if( isTokenActive( 10, tk_row ) && token_production( lexer, hc_state_hash_token, 12, 10, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 44, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 16, 44, 2 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 35, tk_row ) ){
                        lexer.setToken( 35, 4, 4 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 111 ){
                if( lexer.get_byte_at( lexer.byte_offset  + 2 ) == 112 ){
                    if( isTokenActive( 10, tk_row ) && token_production( lexer, hc_state_hash_token, 12, 10, 1 ) && lexer.byte_length  > 3 ){
                        return
                    } else if( isTokenActive( 44, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 16, 44, 2 ) && lexer.byte_length  > 3 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 3 ){
                        return
                    } else if( isTokenActive( 32, tk_row ) ){
                        lexer.setToken( 32, 3, 3 );
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
                    if( 3 == compare( lexer, lexer.byte_offset  + 3, 72, 3, token_sequence_lookup ) ){
                        if( isTokenActive( 10, tk_row ) && token_production( lexer, hc_state_hash_token, 12, 10, 1 ) && lexer.byte_length  > 6 ){
                            return
                        } else if( isTokenActive( 44, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 16, 44, 2 ) && lexer.byte_length  > 6 ){
                            return
                        } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 6 ){
                            return
                        } else if( isTokenActive( 26, tk_row ) ){
                            lexer.setToken( 26, 6, 6 );
                            return
                        }
                    }
                } else if( lexer.get_byte_at( lexer.byte_offset  + 2 ) == 112 ){
                    if( 3 == compare( lexer, lexer.byte_offset  + 3, 110, 3, token_sequence_lookup ) ){
                        if( isTokenActive( 10, tk_row ) && token_production( lexer, hc_state_hash_token, 12, 10, 1 ) && lexer.byte_length  > 6 ){
                            return
                        } else if( isTokenActive( 44, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 16, 44, 2 ) && lexer.byte_length  > 6 ){
                            return
                        } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 6 ){
                            return
                        } else if( isTokenActive( 49, tk_row ) ){
                            lexer.setToken( 49, 6, 6 );
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
                if( 6 == compare( lexer, lexer.byte_offset  + 2, 8, 6, token_sequence_lookup ) ){
                    if( isTokenActive( 38, tk_row ) ){
                        lexer.setToken( 38, 8, 8 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 107 ){
                if( 5 == compare( lexer, lexer.byte_offset  + 2, 98, 5, token_sequence_lookup ) ){
                    if( isTokenActive( 10, tk_row ) && token_production( lexer, hc_state_hash_token, 12, 10, 1 ) && lexer.byte_length  > 7 ){
                        return
                    } else if( isTokenActive( 44, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 16, 44, 2 ) && lexer.byte_length  > 7 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 7 ){
                        return
                    } else if( isTokenActive( 51, tk_row ) ){
                        lexer.setToken( 51, 7, 7 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 116 ){
                if( 3 == compare( lexer, lexer.byte_offset  + 2, 122, 3, token_sequence_lookup ) ){
                    if( isTokenActive( 10, tk_row ) && token_production( lexer, hc_state_hash_token, 12, 10, 1 ) && lexer.byte_length  > 5 ){
                        return
                    } else if( isTokenActive( 44, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 16, 44, 2 ) && lexer.byte_length  > 5 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 5 ){
                        return
                    } else if( isTokenActive( 13, tk_row ) ){
                        lexer.setToken( 13, 5, 5 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 99 ){
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 127, 2, token_sequence_lookup ) ){
                    if( isTokenActive( 10, tk_row ) && token_production( lexer, hc_state_hash_token, 12, 10, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 44, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 16, 44, 2 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 30, tk_row ) ){
                        lexer.setToken( 30, 4, 4 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 101 ){
                if( lexer.get_byte_at( lexer.byte_offset  + 2 ) == 116 ){
                    if( isTokenActive( 10, tk_row ) && token_production( lexer, hc_state_hash_token, 12, 10, 1 ) && lexer.byte_length  > 3 ){
                        return
                    } else if( isTokenActive( 44, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 16, 44, 2 ) && lexer.byte_length  > 3 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 3 ){
                        return
                    } else if( isTokenActive( 27, tk_row ) ){
                        lexer.setToken( 27, 3, 3 );
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
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 27, 2, token_sequence_lookup ) ){
                    if( isTokenActive( 10, tk_row ) && token_production( lexer, hc_state_hash_token, 12, 10, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 44, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 16, 44, 2 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 15, tk_row ) ){
                        lexer.setToken( 15, 4, 4 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 111 ){
                if( isTokenActive( 10, tk_row ) && token_production( lexer, hc_state_hash_token, 12, 10, 1 ) && lexer.byte_length  > 2 ){
                    return
                } else if( isTokenActive( 44, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 16, 44, 2 ) && lexer.byte_length  > 2 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 2 ){
                    return
                } else if( isTokenActive( 28, tk_row ) ){
                    lexer.setToken( 28, 2, 2 );
                    return
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 58 ){
                if( isTokenActive( 47, tk_row ) ){
                    lexer.setToken( 47, 2, 2 );
                    return
                }
            }
        }
    }
    break;
    case 117: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 117 ){
            if( 4 == compare( lexer, lexer.byte_offset  + 1, 80, 4, token_sequence_lookup ) ){
                if( isTokenActive( 10, tk_row ) && token_production( lexer, hc_state_hash_token, 12, 10, 1 ) && lexer.byte_length  > 5 ){
                    return
                } else if( isTokenActive( 44, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 16, 44, 2 ) && lexer.byte_length  > 5 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 5 ){
                    return
                } else if( isTokenActive( 31, tk_row ) ){
                    lexer.setToken( 31, 5, 5 );
                    return
                }
            }
        }
    }
    break;
    default: 
    break
};
    if( isTokenActive( 10, tk_row ) && pre_scan( lexer, 0 ) && token_production( lexer, hc_state_hash_token, 12, 10, 1 ) ){
    return
} else if( isTokenActive( 44, tk_row ) && pre_scan( lexer, 1 ) && token_production( lexer, hc_symbols__identifier_syms, 16, 44, 2 ) ){
    return
} else if( isTokenActive( 52, tk_row ) && pre_scan( lexer, 2 ) && token_production( lexer, hc_comment, 13, 52, 4 ) ){
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
} else if( isTokenActive( 33, tk_row ) && false ){
    return
} else if( isTokenActive( 34, tk_row ) && false ){
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

function branch_01f9a7bb2134a906(state, db, prod){
    add_reduce( state, 1, 33 );
    return 14
}

function branch_03db4623ec192470(state, db, prod){
    scan( state.lexer, 3, 4 );
    if( ( state.lexer._type  == 12 ) ){
    consume( state );
    add_reduce( state, 7, 1 );
    return 0
};
    return - 1
}

function branch_057fbc31d9dad65a(state, db, prod){
    add_reduce( state, 1, 10 );
    return hc_top_level_instructions_list_24_goto( state, db, 23 )
}

function branch_09fd4c587b3f4d77(state, db, prod){
    add_reduce( state, 3, 2 );
    return 0
}

function branch_10dd5711e10f6933(state, db, prod){
    add_reduce( state, 2, 36 );
    return 19
}

function branch_125785f7061437b3(state, db, prod){
    scan( state.lexer, 5, 4 );
    if( ( state.lexer._type  == 20 ) ){
    consume( state );
    add_reduce( state, 5, 20 );
    return 0
};
    return - 1
}

function branch_1386727e915f34a2(state, db, prod){
    scan( state.lexer, 6, 4 );
    if( state.lexer._type  == 17 ){
    scan( state.lexer, 7, 4 );
    state.push_fn( branch_f0ca643ef5cfa59f, 0 );
    return hc_on_fail( state, db, 0 )
} else if( state.lexer._type  == 38 ){
    state.push_fn( set_production /*1*/, 1 );
    state.push_fn( branch_20728878dfbc3c48, 1 );
    return hc_expected_symbols( state, db, 0 )
} else if( state.lexer._type  == 12 ){
    state.push_fn( set_production /*1*/, 1 );
    consume( state );
    add_reduce( state, 5, 1 );
    return 0
};
    return - 1
}

function branch_148b7e1786554996(state, db, prod){
    scan( state.lexer, 8, 4 );
    state.push_fn( branch_d89f0fc99149b9de, 0 );
    return hc_top_level_instructions( state, db, 0 )
}

function branch_1cba5299b3fd872c(state, db, prod){
    scan( state.lexer, 9, 4 );
    if( state.lexer._type  == 15 ){
    state.push_fn( set_production /*4*/, 4 );
    state.push_fn( branch_20b33064645a28fc, 4 );
    return hc_instruction_sequence_group_31_0_( state, db, 0 )
} else {
    add_reduce( state, 1, 9 );
    return 4
};
    return - 1
}

function branch_1e3ac8120e7b258b(state, db, prod){
    add_reduce( state, 4, 1 );
    return 0
}

function branch_1f61e727d637ceff(state, db, prod){
    add_reduce( state, 2, 17 );
    return 7
}

function branch_20728878dfbc3c48(state, db, prod){
    scan( state.lexer, 3, 4 );
    if( ( state.lexer._type  == 12 ) ){
    consume( state );
    add_reduce( state, 6, 1 );
    return 0
};
    return - 1
}

function branch_20b33064645a28fc(state, db, prod){
    add_reduce( state, 2, 7 );
    return 0
}

function branch_264b8b1d8721cab9(state, db, prod){
    add_reduce( state, 1, 10 );
    return hc_instruction_sequence_list_30_goto( state, db, 26 )
}

function branch_2a0e65d609c9d94b(state, db, prod){
    add_reduce( state, 2, 39 );
    return hc_id_list_list_114_goto( state, db, 30 )
}

function branch_2a34034e73927f6e(state, db, prod){
    scan( state.lexer, 10, 4 );
    if( ( state.lexer._type  == 19 ) ){
    consume( state );
    state.push_fn( branch_b656e3c5c2ad1226, 6 );
    return hc_instruction_sequence( state, db, 0 )
};
    return - 1
}

function branch_2b54638e04cc6687(state, db, prod){
    add_reduce( state, 1, 10 );
    return 0
}

function branch_2f5fa2fd42fd13a2(state, db, prod){
    add_reduce( state, 4, 6 );
    return 0
}

function branch_319109821ce0b517(state, db, prod){
    add_reduce( state, 3, 35 );
    add_reduce( state, 1, 10 );
    return 0
}

function branch_33762815104a44fb(state, db, prod){
    scan( state.lexer, 11, 12 );
    if( ( state.lexer._type  == 45 ) ){
    consume( state );
    state.push_fn( branch_8f3ee3da2883f860, 17 );
    return hc_symbols__identifier( state, db, 0 )
};
    return - 1
}

function branch_3665b7f6699a1e7a(state, db, prod){
    add_reduce( state, 3, 37 );
    return 0
}

function branch_393331f50c7809aa(state, db, prod){
    add_reduce( state, 3, 40 );
    return 0
}

function branch_399af883278788d8(state, db, prod){
    scan( state.lexer, 13, 4 );
    if( state.lexer._type  == 15 ){
    var pk = state.lexer.copy_in_place(  );;
    pk.next(  );
    scan( pk, 14, 4 );
    if( pk._type  == 25 ){
        consume( state );
        scan( state.lexer, 15, 4 );
        state.push_fn( branch_471a6f59d1d931fe, 0 );
        return hc_instruction_sequence_list_30( state, db, 0 )
    } else {
        state.lexer._type  = 15;
        state.push_fn( set_production /*4*/, 4 );
        state.push_fn( branch_20b33064645a28fc, 4 );
        return hc_instruction_sequence_group_31_0_( state, db, 0 )
    }
} else {
    add_reduce( state, 1, 9 );
    return 4
};
    return - 1
}

function branch_3d4a13e597f91a05(state, db, prod){
    scan( state.lexer, 10, 4 );
    if( ( state.lexer._type  == 19 ) ){
    consume( state );
    state.push_fn( branch_6e5d2da87d9ad636, 6 );
    return hc_instruction_sequence( state, db, 0 )
};
    return - 1
}

function branch_40fee615a323f48a(state, db, prod){
    add_reduce( state, 1, 10 );
    return hc_instruction_sequence_list_27_goto( state, db, 25 )
}

function branch_471a6f59d1d931fe(state, db, prod){
    scan( state.lexer, 9, 4 );
    if( state.lexer._type  == 15 ){
    state.push_fn( set_production /*4*/, 4 );
    state.push_fn( branch_2f5fa2fd42fd13a2, 4 );
    return hc_instruction_sequence_group_31_0_( state, db, 0 )
} else {
    add_reduce( state, 3, 8 );
    return 4
};
    return - 1
}

function branch_48151edd2f0bee2e(state, db, prod){
    scan( state.lexer, 5, 4 );
    if( ( state.lexer._type  == 20 ) ){
    consume( state );
    add_reduce( state, 5, 13 );
    return 0
};
    return - 1
}

function branch_5ac54df2212a3527(state, db, prod){
    scan( state.lexer, 10, 4 );
    if( ( state.lexer._type  == 19 ) ){
    consume( state );
    state.push_fn( branch_bdee12b6e04ac09d, 6 );
    return hc_instruction_sequence( state, db, 0 )
};
    return - 1
}

function branch_5b60856d490a39e9(state, db, prod){
    state.push_fn( branch_d938206aa7d41b57, 22 );
    return hc_symbols__sym_delimiter( state, db, 0 )
}

function branch_5f5f03f30d8517ff(state, db, prod){
    state.push_fn( branch_7470b0cf1895d41a, 2 );
    return hc_symbols__production_symbol( state, db, 0 )
}

function branch_67e3cc7809e23d96(state, db, prod){
    scan( state.lexer, 16, 4 );
    if( state.lexer._type  == 17 ){
    scan( state.lexer, 7, 4 );
    state.push_fn( branch_b2b6a1f84d3ae918, 0 );
    return hc_on_fail( state, db, 0 )
} else if( state.lexer._type  == 38 ){
    state.push_fn( set_production /*0*/, 0 );
    state.push_fn( branch_09fd4c587b3f4d77, 0 );
    return hc_expected_symbols( state, db, 0 )
} else {
    add_reduce( state, 2, 4 );
    return 0
};
    return - 1
}

function branch_6d7b70428bd2cd9e(state, db, prod){
    add_reduce( state, 3, 21 );
    return 0
}

function branch_6e5d2da87d9ad636(state, db, prod){
    scan( state.lexer, 5, 4 );
    if( ( state.lexer._type  == 20 ) ){
    consume( state );
    add_reduce( state, 5, 15 );
    return 0
};
    return - 1
}

function branch_7470b0cf1895d41a(state, db, prod){
    scan( state.lexer, 17, 4 );
    if( ( state.lexer._type  == 11 ) ){
    consume( state );
    add_reduce( state, 4, 5 );
    return 2
};
    return - 1
}

function branch_75f2649f97e7b0a9(state, db, prod){
    add_reduce( state, 1, 10 );
    return hc_sequence_instruction_list_82_goto( state, db, 28 )
}

function branch_772f748da0c90f38(state, db, prod){
    add_reduce( state, 5, 28 );
    return 0
}

function branch_808eb4ab62bd9e0d(state, db, prod){
    scan( state.lexer, 18, 4 );
    if( ( state.lexer._type  == 44 ) ){
    state.push_fn( branch_2a0e65d609c9d94b, 30 );
    return hc_symbols__imported_production_symbol( state, db, 0 )
};
    return - 1
}

function branch_89151655ce0a7228(state, db, prod){
    scan( state.lexer, 5, 4 );
    if( ( state.lexer._type  == 20 ) ){
    consume( state );
    add_reduce( state, 6, 12 );
    return 5
};
    return - 1
}

function branch_8c91e3c5ad879968(state, db, prod){
    scan( state.lexer, 19, 4 );
    if( ( state.lexer._type  == 43 ) ){
    consume( state );
    add_reduce( state, 3, 0 );
    return 0
};
    return - 1
}

function branch_8f3ee3da2883f860(state, db, prod){
    add_reduce( state, 3, 35 );
    return 17
}

function branch_90738f1e798a4eff(state, db, prod){
    state.push_fn( branch_7470b0cf1895d41a, 2 );
    return hc_symbols__imported_production_symbol( state, db, 0 )
}

function branch_945789260ea0c05a(state, db, prod){
    add_reduce( state, 1, 10 );
    return hc_top_level_instructions_list_25_goto( state, db, 24 )
}

function branch_96d3d6971695bb5f(state, db, prod){
    add_reduce( state, 2, 39 );
    return 0
}

function branch_99d9cd4ce0402d9b(state, db, prod){
    scan( state.lexer, 20, 4 );
    if( state.lexer._type  == 51 ){
    state.push_fn( set_production /*10*/, 10 );
    state.push_fn( branch_c0a236bacdca2c24, 10 );
    return hc_expected_symbols_group_108_0_( state, db, 0 )
} else {
    add_reduce( state, 3, 31 );
    return 10
};
    return - 1
}

function branch_a688cc58bf1f69e4(state, db, prod){
    scan( state.lexer, 21, 0 );
    if( state.lexer._type  == 8 || state.lexer._type  == 1 || state.lexer._type  == 7 ){
    state.push_fn( set_production /*20*/, 20 );
    state.push_fn( branch_3665b7f6699a1e7a, 20 );
    return hc_symbols__sym_delimiter( state, db, 0 )
} else {
    add_reduce( state, 2, 37 );
    return 20
};
    return - 1
}

function branch_ac5f271970a3bf15(state, db, prod){
    add_reduce( state, 2, 32 );
    return 29
}

function branch_b2b6a1f84d3ae918(state, db, prod){
    scan( state.lexer, 22, 4 );
    if( state.lexer._type  == 38 ){
    state.push_fn( set_production /*0*/, 0 );
    state.push_fn( branch_1e3ac8120e7b258b, 0 );
    return hc_expected_symbols( state, db, 0 )
} else {
    add_reduce( state, 3, 3 );
    return 0
};
    return - 1
}

function branch_b656e3c5c2ad1226(state, db, prod){
    scan( state.lexer, 5, 4 );
    if( ( state.lexer._type  == 20 ) ){
    consume( state );
    add_reduce( state, 5, 14 );
    return 0
};
    return - 1
}

function branch_bdee12b6e04ac09d(state, db, prod){
    scan( state.lexer, 5, 4 );
    if( ( state.lexer._type  == 20 ) ){
    consume( state );
    add_reduce( state, 5, 16 );
    return 0
};
    return - 1
}

function branch_c0a236bacdca2c24(state, db, prod){
    add_reduce( state, 4, 30 );
    return 0
}

function branch_c585b9009450d8e0(state, db, prod){
    scan( state.lexer, 8, 4 );
    state.push_fn( branch_67e3cc7809e23d96, 0 );
    return hc_top_level_instructions( state, db, 0 )
}

function branch_d14dd703b62d9f24(state, db, prod){
    scan( state.lexer, 17, 4 );
    if( ( state.lexer._type  == 11 ) ){
    consume( state );
    add_reduce( state, 3, 32 );
    return 11
};
    return - 1
}

function branch_d2488d3394a05f1f(state, db, prod){
    scan( state.lexer, 10, 4 );
    if( ( state.lexer._type  == 19 ) ){
    consume( state );
    state.push_fn( branch_48151edd2f0bee2e, 6 );
    return hc_instruction_sequence( state, db, 0 )
};
    return - 1
}

function branch_d5c6c10a55b60c7f(state, db, prod){
    scan( state.lexer, 10, 4 );
    if( ( state.lexer._type  == 19 ) ){
    consume( state );
    state.push_fn( branch_89151655ce0a7228, 5 );
    return hc_instruction_sequence( state, db, 0 )
};
    return - 1
}

function branch_d89f0fc99149b9de(state, db, prod){
    scan( state.lexer, 23, 4 );
    if( state.lexer._type  == 38 ){
    var pk = state.lexer.copy_in_place(  );;
    pk.next(  );
    scan( pk, 24, 4 );
    if( pk._type  == 39 ){
        state.lexer._type  = 38;
        state.push_fn( set_production /*9*/, 9 );
        state.push_fn( branch_772f748da0c90f38, 9 );
        return hc_expected_symbols( state, db, 0 )
    }
} else {
    add_reduce( state, 4, 29 );
    return 9
};
    return - 1
}

function branch_d938206aa7d41b57(state, db, prod){
    add_reduce( state, 3, 38 );
    return 22
}

function branch_dd820f0b8d2a730d(state, db, prod){
    scan( state.lexer, 18, 4 );
    if( ( state.lexer._type  == 44 ) ){
    state.push_fn( branch_2a0e65d609c9d94b, 30 );
    return hc_symbols__production_symbol( state, db, 0 )
};
    return - 1
}

function branch_f0ca643ef5cfa59f(state, db, prod){
    scan( state.lexer, 25, 4 );
    if( state.lexer._type  == 38 ){
    state.push_fn( set_production /*1*/, 1 );
    state.push_fn( branch_03db4623ec192470, 1 );
    return hc_expected_symbols( state, db, 0 )
} else if( state.lexer._type  == 12 ){
    state.push_fn( set_production /*1*/, 1 );
    consume( state );
    add_reduce( state, 6, 1 );
    return 0
};
    return - 1
}

function hc_state_ir(state, db, prod){
    state.push_fn( branch_c585b9009450d8e0, 0 );
    return hc_state_declaration( state, db, 0 )
}

function hc_grammar_injection(state, db, prod){
    scan( state.lexer, 26, 4 );
    if( state.lexer._type  == 9 ){
    consume( state );
    scan( state.lexer, 27, 4 );
    if( state.lexer._type  == 10 ){
        consume( state );
        scan( state.lexer, 17, 4 );
        if( state.lexer._type  == 11 ){
            consume( state );
            scan( state.lexer, 8, 4 );
            state.push_fn( branch_1386727e915f34a2, 0 );
            return hc_top_level_instructions( state, db, 0 )
        }
    }
};
    return - 1
}

function hc_state_declaration(state, db, prod){
    scan( state.lexer, 28, 4 );
    if( state.lexer._type  == 13 ){
    consume( state );
    scan( state.lexer, 29, 4 );
    if( state.lexer._type  == 14 ){
        consume( state );
        scan( state.lexer, 30, 12 );
        if( state.lexer._type  == 44 ){
            var fk1 = state.fork( db );;
            fk1.push_fn( branch_90738f1e798a4eff, 2 );
            state.push_fn( branch_5f5f03f30d8517ff, 2 );
            return 0
        } else if( state.lexer._type  == 10 ){
            state.push_fn( set_production /*2*/, 2 );
            consume( state );
            scan( state.lexer, 17, 4 );
            if( ( state.lexer._type  == 11 ) ){
                consume( state );
                add_reduce( state, 4, 5 );
                return 0
            };
            return - 1
        }
    }
};
    return - 1
}

function hc_top_level_instructions(state, db, prod){
    scan( state.lexer, 8, 4 );
    if( isTokenActive( state.lexer._type, 31 ) ){
    state.push_fn( set_production /*3*/, 3 );
    state.push_fn( set_production /*0*/, 3 );
    return hc_instruction_sequence( state, db, 0 )
} else if( state.lexer._type  == 21 || state.lexer._type  == 22 || state.lexer._type  == 23 || state.lexer._type  == 24 ){
    state.push_fn( set_production /*3*/, 3 );
    state.push_fn( set_production /*0*/, 3 );
    return hc_top_level_instructions_list_25( state, db, 0 )
} else if( state.lexer._type  == 17 ){
    state.push_fn( set_production /*3*/, 3 );
    state.push_fn( set_production /*0*/, 3 );
    return hc_top_level_instructions_list_24( state, db, 0 )
};
    return - 1
}

function hc_instruction_sequence(state, db, prod){
    scan( state.lexer, 32, 4 );
    if( state.lexer._type  == 16 ){
    state.push_fn( set_production /*4*/, 4 );
    state.lexer.setToken( 2, 0, 0 );
    consume( state );
    return 0
} else if( isTokenActive( state.lexer._type, 33 ) ){
    scan( state.lexer, 34, 4 );
    state.push_fn( branch_399af883278788d8, 0 );
    return hc_instruction_sequence_list_27( state, db, 0 )
} else if( state.lexer._type  == 25 ){
    scan( state.lexer, 15, 4 );
    state.push_fn( branch_1cba5299b3fd872c, 0 );
    return hc_instruction_sequence_list_30( state, db, 0 )
} else if( state.lexer._type  == 15 ){
    state.push_fn( set_production /*4*/, 4 );
    state.push_fn( branch_2b54638e04cc6687, 4 );
    return hc_instruction_sequence_group_31_0_( state, db, 0 )
};
    state.lexer.setToken( 2, 0, 0 );
    consume( state );
    return 4
}

function hc_prod_branch_instruction(state, db, prod){
    scan( state.lexer, 7, 4 );
    if( state.lexer._type  == 17 ){
    consume( state );
    scan( state.lexer, 35, 4 );
    if( ( state.lexer._type  == 18 ) ){
        consume( state );
        state.push_fn( branch_d5c6c10a55b60c7f, 5 );
        return hc_id_list( state, db, 0 )
    }
};
    return - 1
}

function hc_token_branch_instruction(state, db, prod){
    scan( state.lexer, 36, 4 );
    if( state.lexer._type  == 21 ){
    state.push_fn( set_production /*6*/, 6 );
    consume( state );
    state.push_fn( branch_d2488d3394a05f1f, 6 );
    return hc_id_list( state, db, 0 )
} else if( state.lexer._type  == 22 ){
    state.push_fn( set_production /*6*/, 6 );
    consume( state );
    state.push_fn( branch_2a34034e73927f6e, 6 );
    return hc_id_list( state, db, 0 )
} else if( state.lexer._type  == 23 ){
    state.push_fn( set_production /*6*/, 6 );
    consume( state );
    state.push_fn( branch_3d4a13e597f91a05, 6 );
    return hc_id_list( state, db, 0 )
} else if( state.lexer._type  == 24 ){
    state.push_fn( set_production /*6*/, 6 );
    consume( state );
    state.push_fn( branch_5ac54df2212a3527, 6 );
    return hc_id_list( state, db, 0 )
};
    return - 1
}

function hc_goto_instruction(state, db, prod){
    scan( state.lexer, 15, 4 );
    if( state.lexer._type  == 25 ){
    consume( state );
    scan( state.lexer, 28, 4 );
    if( ( state.lexer._type  == 13 ) ){
        state.push_fn( branch_1f61e727d637ceff, 7 );
        return hc_state_declaration( state, db, 0 )
    }
};
    return - 1
}

function hc_sequence_instruction(state, db, prod){
    scan( state.lexer, 34, 4 );
    if( state.lexer._type  == 26 ){
    state.push_fn( set_production /*8*/, 8 );
    consume( state );
    scan( state.lexer, 37, 4 );
    if( ( state.lexer._type  == 5 ) ){
        consume( state );
        scan( state.lexer, 37, 4 );
        if( ( state.lexer._type  == 5 ) ){
            consume( state );
            add_reduce( state, 3, 18 );
            return 0
        }
    };
    return - 1
} else if( state.lexer._type  == 27 ){
    consume( state );
    scan( state.lexer, 38, 4 );
    if( state.lexer._type  == 18 ){
        state.push_fn( set_production /*8*/, 8 );
        consume( state );
        scan( state.lexer, 39, 4 );
        if( ( state.lexer._type  == 28 ) ){
            consume( state );
            scan( state.lexer, 37, 4 );
            if( ( state.lexer._type  == 5 ) ){
                consume( state );
                add_reduce( state, 4, 19 );
                return 0
            }
        };
        return - 1
    } else if( state.lexer._type  == 33 ){
        consume( state );
        scan( state.lexer, 40, 4 );
        if( state.lexer._type  == 34 ){
            state.push_fn( set_production /*8*/, 8 );
            consume( state );
            scan( state.lexer, 37, 4 );
            if( ( state.lexer._type  == 5 ) ){
                consume( state );
                add_reduce( state, 4, 23 );
                return 0
            };
            return - 1
        } else if( state.lexer._type  == 3 ){
            state.push_fn( set_production /*8*/, 8 );
            consume( state );
            scan( state.lexer, 37, 4 );
            if( ( state.lexer._type  == 5 ) ){
                consume( state );
                add_reduce( state, 4, 24 );
                return 0
            };
            return - 1
        }
    }
} else if( state.lexer._type  == 29 ){
    state.push_fn( set_production /*8*/, 8 );
    consume( state );
    scan( state.lexer, 39, 4 );
    if( ( state.lexer._type  == 28 ) ){
        consume( state );
        scan( state.lexer, 10, 4 );
        if( ( state.lexer._type  == 19 ) ){
            consume( state );
            state.push_fn( branch_125785f7061437b3, 8 );
            return hc_sequence_instruction_list_82( state, db, 0 )
        }
    };
    return - 1
} else if( state.lexer._type  == 30 ){
    state.push_fn( set_production /*8*/, 8 );
    consume( state );
    scan( state.lexer, 41, 4 );
    if( ( state.lexer._type  == 31 ) ){
        consume( state );
        state.push_fn( branch_6d7b70428bd2cd9e, 8 );
        return hc_id_list( state, db, 0 )
    };
    return - 1
} else if( state.lexer._type  == 32 ){
    state.push_fn( set_production /*8*/, 8 );
    consume( state );
    scan( state.lexer, 37, 4 );
    if( ( state.lexer._type  == 5 ) ){
        consume( state );
        add_reduce( state, 2, 22 );
        return 0
    };
    return - 1
} else if( state.lexer._type  == 35 ){
    state.push_fn( set_production /*8*/, 8 );
    consume( state );
    add_reduce( state, 1, 25 );
    return 0
} else if( state.lexer._type  == 36 ){
    state.push_fn( set_production /*8*/, 8 );
    consume( state );
    add_reduce( state, 1, 26 );
    return 0
} else if( state.lexer._type  == 37 ){
    state.push_fn( set_production /*8*/, 8 );
    consume( state );
    add_reduce( state, 1, 27 );
    return 0
};
    return - 1
}

function hc_on_fail(state, db, prod){
    scan( state.lexer, 7, 4 );
    if( state.lexer._type  == 17 ){
    consume( state );
    scan( state.lexer, 42, 4 );
    if( state.lexer._type  == 37 ){
        consume( state );
        scan( state.lexer, 28, 4 );
        state.push_fn( branch_148b7e1786554996, 0 );
        return hc_state_declaration( state, db, 0 )
    }
};
    return - 1
}

function hc_expected_symbols(state, db, prod){
    scan( state.lexer, 43, 4 );
    if( state.lexer._type  == 38 ){
    consume( state );
    scan( state.lexer, 24, 4 );
    if( state.lexer._type  == 39 ){
        consume( state );
        scan( state.lexer, 29, 4 );
        state.push_fn( branch_99d9cd4ce0402d9b, 0 );
        return hc_id_list( state, db, 0 )
    }
};
    return - 1
}

function hc_id_list(state, db, prod){
    scan( state.lexer, 29, 4 );
    if( state.lexer._type  == 14 ){
    consume( state );
    scan( state.lexer, 44, 4 );
    if( ( isTokenActive( state.lexer._type, 45 ) ) ){
        state.push_fn( branch_d14dd703b62d9f24, 11 );
        return hc_id_list_list_114( state, db, 0 )
    }
};
    return - 1
}

function hc_state_hash_token(state, db, prod){
    scan( state.lexer, 46, 4 );
    if( state.lexer._type  == 3 || state.lexer._type  == 5 || state.lexer._type  == 40 || state.lexer._type  == 41 ){
    consume( state );
    return hc_state_hash_token_goto( state, db, 12 )
};
    return - 1
}

function hc_state_hash_token_goto(state, db, prod){
    scan( state.lexer, 47, 48 );
    if( state.lexer._type  == 40 ){
    state.push_fn( hc_state_hash_token_goto /*hc_state_hash_token_goto( state, db, 12 )*/, 12 );
    scan( state.lexer, 49, 48 );
    consume( state );
    add_reduce( state, 2, 0 );
    return 0
} else if( state.lexer._type  == 41 ){
    state.push_fn( hc_state_hash_token_goto /*hc_state_hash_token_goto( state, db, 12 )*/, 12 );
    scan( state.lexer, 50, 48 );
    consume( state );
    add_reduce( state, 2, 0 );
    return 0
} else if( state.lexer._type  == 5 ){
    state.push_fn( hc_state_hash_token_goto /*hc_state_hash_token_goto( state, db, 12 )*/, 12 );
    scan( state.lexer, 51, 48 );
    consume( state );
    add_reduce( state, 2, 0 );
    return 0
} else if( state.lexer._type  == 3 ){
    state.push_fn( hc_state_hash_token_goto /*hc_state_hash_token_goto( state, db, 12 )*/, 12 );
    scan( state.lexer, 52, 48 );
    consume( state );
    add_reduce( state, 2, 0 );
    return 0
};
    return ( prod  == 12 ) ? prod  : - 1
}

function hc_comment(state, db, prod){
    scan( state.lexer, 53, 4 );
    if( state.lexer._type  == 42 ){
    consume( state );
    scan( state.lexer, 54, 48 );
    if( state.lexer._type  == 43 ){
        state.push_fn( set_production /*13*/, 13 );
        consume( state );
        add_reduce( state, 2, 0 );
        return 0
    } else {
        state.push_fn( set_production /*13*/, 13 );
        state.push_fn( branch_8c91e3c5ad879968, 13 );
        return hc_comment_list_142( state, db, 0 )
    }
};
    return - 1
}

function hc_symbols__production_symbol(state, db, prod){
    state.push_fn( branch_01f9a7bb2134a906, 14 );
    return hc_symbols__identifier( state, db, 0 )
}

function hc_symbols__identifier(state, db, prod){
    scan( state.lexer, 55, 12 );
    if( state.lexer._type  == 44 ){
    consume( state );
    scan( state.lexer, 12, 12 );
    return 15
};
    return - 1
}

function hc_symbols__identifier_syms(state, db, prod){
    scan( state.lexer, 56, 12 );
    if( state.lexer._type  == 40 || state.lexer._type  == 3 ){
    consume( state );
    return hc_symbols__identifier_syms_goto( state, db, 16 )
};
    return - 1
}

function hc_symbols__identifier_syms_goto(state, db, prod){
    scan( state.lexer, 57, 0 );
    if( state.lexer._type  == 40 ){
    state.push_fn( hc_symbols__identifier_syms_goto /*hc_symbols__identifier_syms_goto( state, db, 16 )*/, 16 );
    scan( state.lexer, 58, 0 );
    consume( state );
    add_reduce( state, 2, 34 );
    return 0
} else if( state.lexer._type  == 3 ){
    state.push_fn( hc_symbols__identifier_syms_goto /*hc_symbols__identifier_syms_goto( state, db, 16 )*/, 16 );
    scan( state.lexer, 59, 0 );
    consume( state );
    add_reduce( state, 2, 34 );
    return 0
} else if( state.lexer._type  == 5 ){
    state.push_fn( hc_symbols__identifier_syms_goto /*hc_symbols__identifier_syms_goto( state, db, 16 )*/, 16 );
    scan( state.lexer, 60, 0 );
    consume( state );
    add_reduce( state, 2, 34 );
    return 0
};
    return ( prod  == 16 ) ? prod  : - 1
}

function hc_symbols__imported_production_symbol(state, db, prod){
    state.push_fn( branch_33762815104a44fb, 17 );
    return hc_symbols__identifier( state, db, 0 )
}

function hc_symbols__terminal_symbol(state, db, prod){
    scan( state.lexer, 61, 12 );
    if( state.lexer._type  == 46 ){
    state.push_fn( set_production /*18*/, 18 );
    state.push_fn( set_production /*0*/, 18 );
    return hc_symbols__generated_symbol( state, db, 0 )
} else if( state.lexer._type  == 47 ){
    state.push_fn( set_production /*18*/, 18 );
    state.push_fn( set_production /*0*/, 18 );
    return hc_symbols__literal_symbol( state, db, 0 )
} else {
    state.push_fn( set_production /*18*/, 18 );
    state.push_fn( set_production /*0*/, 18 );
    return hc_symbols__escaped_symbol( state, db, 0 )
};
    return - 1
}

function hc_symbols__generated_symbol(state, db, prod){
    scan( state.lexer, 62, 12 );
    if( state.lexer._type  == 46 ){
    consume( state );
    scan( state.lexer, 55, 12 );
    if( ( state.lexer._type  == 44 ) ){
        state.push_fn( branch_10dd5711e10f6933, 19 );
        return hc_symbols__identifier( state, db, 0 )
    }
};
    return - 1
}

function hc_symbols__literal_symbol(state, db, prod){
    scan( state.lexer, 63, 12 );
    if( state.lexer._type  == 47 ){
    consume( state );
    scan( state.lexer, 64, 12 );
    state.push_fn( branch_a688cc58bf1f69e4, 0 );
    return hc_symbols__literal_symbol_list_172( state, db, 0 )
};
    return - 1
}

function hc_symbols__sym_delimiter(state, db, prod){
    scan( state.lexer, 65, 0 );
    if( state.lexer._type  == 8 || state.lexer._type  == 1 || state.lexer._type  == 7 ){
    consume( state );
    return 21
};
    return - 1
}

function hc_symbols__escaped_symbol(state, db, prod){
    scan( state.lexer, 66, 12 );
    if( state.lexer._type  == 48 ){
    consume( state );
    scan( state.lexer, 67, 12 );
    if( ( state.lexer._type  == 5 || state.lexer._type  == 3 || state.lexer._type  == 2 ) ){
        state.push_fn( branch_5b60856d490a39e9, 22 );
        return hc_symbols__escaped_symbol_list_178( state, db, 0 )
    }
};
    return - 1
}

function hc_top_level_instructions_list_24(state, db, prod){
    state.push_fn( branch_057fbc31d9dad65a, 23 );
    return hc_prod_branch_instruction( state, db, 0 )
}

function hc_top_level_instructions_list_24_goto(state, db, prod){
    while( true ) {
        switch(prod){
            case 23: 
            {
                scan( state.lexer, 68, 4 );
                if( state.lexer._type  == 17 ){
                    var pk = state.lexer.copy_in_place(  );;
                    pk.next(  );
                    scan( pk, 35, 4 );
                    if( pk._type  == 18 ){
                        state.lexer._type  = 17;
                        state.push_fn( hc_top_level_instructions_list_24_goto /*hc_top_level_instructions_list_24_goto( state, db, 23 )*/, 23 );
                        scan( state.lexer, 7, 4 );
                        if( ( state.lexer._type  == 17 ) ){
                            state.push_fn( branch_96d3d6971695bb5f, 23 );
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
    return ( prod  == 23 ) ? prod  : - 1
}

function hc_top_level_instructions_list_25(state, db, prod){
    state.push_fn( branch_945789260ea0c05a, 24 );
    return hc_token_branch_instruction( state, db, 0 )
}

function hc_top_level_instructions_list_25_goto(state, db, prod){
    while( true ) {
        switch(prod){
            case 24: 
            {
                scan( state.lexer, 69, 4 );
                if( state.lexer._type  == 21 || state.lexer._type  == 22 || state.lexer._type  == 23 || state.lexer._type  == 24 ){
                    state.push_fn( hc_top_level_instructions_list_25_goto /*hc_top_level_instructions_list_25_goto( state, db, 24 )*/, 24 );
                    scan( state.lexer, 36, 4 );
                    if( ( state.lexer._type  == 21 || state.lexer._type  == 22 || state.lexer._type  == 23 || state.lexer._type  == 24 ) ){
                        state.push_fn( branch_96d3d6971695bb5f, 24 );
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
    return ( prod  == 24 ) ? prod  : - 1
}

function hc_instruction_sequence_list_27(state, db, prod){
    state.push_fn( branch_40fee615a323f48a, 25 );
    return hc_sequence_instruction( state, db, 0 )
}

function hc_instruction_sequence_list_27_goto(state, db, prod){
    while( true ) {
        switch(prod){
            case 25: 
            {
                scan( state.lexer, 70, 4 );
                if( state.lexer._type  == 15 ){
                    var pk = state.lexer.copy_in_place(  );;
                    pk.next(  );
                    scan( pk, 71, 4 );
                    if( isTokenActive( pk._type, 33 ) ){
                        state.lexer._type  = 15;
                        state.push_fn( hc_instruction_sequence_list_27_goto /*hc_instruction_sequence_list_27_goto( state, db, 25 )*/, 25 );
                        scan( state.lexer, 72, 4 );
                        consume( state );
                        state.push_fn( branch_393331f50c7809aa, 25 );
                        return hc_sequence_instruction( state, db, 0 )
                    } else if( pk._type  == 25 ){
                        return 25
                    }
                }
            }
            break;
            default: 
            break
        };
        break
    };
    return ( prod  == 25 ) ? prod  : - 1
}

function hc_instruction_sequence_list_30(state, db, prod){
    state.push_fn( branch_264b8b1d8721cab9, 26 );
    return hc_goto_instruction( state, db, 0 )
}

function hc_instruction_sequence_list_30_goto(state, db, prod){
    while( true ) {
        switch(prod){
            case 26: 
            {
                scan( state.lexer, 70, 4 );
                if( state.lexer._type  == 15 ){
                    var pk = state.lexer.copy_in_place(  );;
                    pk.next(  );
                    scan( pk, 14, 4 );
                    if( pk._type  == 25 ){
                        state.lexer._type  = 15;
                        state.push_fn( hc_instruction_sequence_list_30_goto /*hc_instruction_sequence_list_30_goto( state, db, 26 )*/, 26 );
                        scan( state.lexer, 72, 4 );
                        consume( state );
                        state.push_fn( branch_393331f50c7809aa, 26 );
                        return hc_goto_instruction( state, db, 0 )
                    } else if( pk._type  == 49 ){
                        return 26
                    }
                } else {
                    return 26
                }
            }
            break;
            default: 
            break
        };
        break
    };
    return ( prod  == 26 ) ? prod  : - 1
}

function hc_instruction_sequence_group_31_0_(state, db, prod){
    scan( state.lexer, 72, 4 );
    if( state.lexer._type  == 15 ){
    consume( state );
    scan( state.lexer, 73, 4 );
    if( ( state.lexer._type  == 49 ) ){
        consume( state );
        scan( state.lexer, 28, 4 );
        if( ( state.lexer._type  == 13 ) ){
            consume( state );
            add_reduce( state, 3, 41 );
            return 27
        }
    }
};
    return - 1
}

function hc_sequence_instruction_list_82(state, db, prod){
    state.push_fn( branch_75f2649f97e7b0a9, 28 );
    return hc_state_declaration( state, db, 0 )
}

function hc_sequence_instruction_list_82_goto(state, db, prod){
    scan( state.lexer, 74, 4 );
    if( state.lexer._type  == 50 ){
    state.push_fn( hc_sequence_instruction_list_82_goto /*hc_sequence_instruction_list_82_goto( state, db, 28 )*/, 28 );
    scan( state.lexer, 75, 4 );
    consume( state );
    state.push_fn( branch_393331f50c7809aa, 28 );
    return hc_state_declaration( state, db, 0 )
};
    return ( prod  == 28 ) ? prod  : - 1
}

function hc_expected_symbols_group_108_0_(state, db, prod){
    scan( state.lexer, 76, 4 );
    if( state.lexer._type  == 51 ){
    consume( state );
    scan( state.lexer, 29, 4 );
    if( ( state.lexer._type  == 14 ) ){
        state.push_fn( branch_ac5f271970a3bf15, 29 );
        return hc_id_list( state, db, 0 )
    }
};
    return - 1
}

function hc_id_list_list_114(state, db, prod){
    scan( state.lexer, 44, 4 );
    if( state.lexer._type  == 46 || state.lexer._type  == 47 || state.lexer._type  == 48 ){
    state.push_fn( hc_id_list_list_114_goto /*hc_id_list_list_114_goto( state, db, 30 )*/, 30 );
    state.push_fn( branch_2b54638e04cc6687, 30 );
    return hc_symbols__terminal_symbol( state, db, 0 )
} else if( state.lexer._type  == 44 ){
    state.push_fn( hc_id_list_list_114_goto /*hc_id_list_list_114_goto( state, db, 15 )*/, 15 );
    state.push_fn( set_production /*0*/, 15 );
    return hc_symbols__identifier( state, db, prod )
} else {
    state.push_fn( hc_id_list_list_114_goto /*hc_id_list_list_114_goto( state, db, 30 )*/, 30 );
    state.push_fn( branch_2b54638e04cc6687, 30 );
    return hc_id_list_list_114_group_209_0_( state, db, 0 )
};
    return - 1
}

function hc_id_list_list_114_goto(state, db, prod){
    while( true ) {
        switch(prod){
            case 15: 
            {
                scan( state.lexer, 77, 12 );
                if( state.lexer._type  == 45 ){
                    state.push_fn( hc_id_list_list_114_goto /*hc_id_list_list_114_goto( state, db, 30 )*/, 30 );
                    scan( state.lexer, 11, 12 );
                    consume( state );
                    state.push_fn( branch_319109821ce0b517, 30 );
                    return hc_symbols__identifier( state, db, 0 )
                } else {
                    scan( state.lexer, 12, 12 );
                    add_reduce( state, 1, 33 );
                    add_reduce( state, 1, 10 );
                    prod = 30;
                    continue
                };
                break
            }
            break;
            case 30: 
            {
                scan( state.lexer, 78, 12 );
                if( state.lexer._type  == 46 || state.lexer._type  == 47 || state.lexer._type  == 48 ){
                    state.push_fn( hc_id_list_list_114_goto /*hc_id_list_list_114_goto( state, db, 30 )*/, 30 );
                    scan( state.lexer, 79, 4 );
                    if( ( state.lexer._type  == 46 || state.lexer._type  == 47 || state.lexer._type  == 48 ) ){
                        state.push_fn( branch_96d3d6971695bb5f, 30 );
                        return hc_symbols__terminal_symbol( state, db, 0 )
                    };
                    return - 1
                } else if( state.lexer._type  == 44 ){
                    var fk1 = state.fork( db );;
                    fk1.push_fn( branch_808eb4ab62bd9e0d, 30 );
                    state.push_fn( branch_dd820f0b8d2a730d, 30 );
                    return 0
                } else if( state.lexer._type  == 5 ){
                    state.push_fn( hc_id_list_list_114_goto /*hc_id_list_list_114_goto( state, db, 30 )*/, 30 );
                    scan( state.lexer, 37, 4 );
                    if( ( state.lexer._type  == 5 ) ){
                        state.push_fn( branch_96d3d6971695bb5f, 30 );
                        return hc_id_list_list_114_group_209_0_( state, db, 0 )
                    };
                    return - 1
                };
                break
            }
            break;
            default: 
            break
        };
        break
    };
    return ( prod  == 30 ) ? prod  : - 1
}

function hc_comment_list_142(state, db, prod){
    scan( state.lexer, 80, 48 );
    if( isTokenActive( state.lexer._type, 67 ) ){
    consume( state );
    add_reduce( state, 1, 10 );
    return hc_comment_list_142_goto( state, db, 31 )
};
    return - 1
}

function hc_comment_list_142_goto(state, db, prod){
    scan( state.lexer, 54, 48 );
    if( state.lexer._type  == 2 ){
    state.push_fn( hc_comment_list_142_goto /*hc_comment_list_142_goto( state, db, 31 )*/, 31 );
    scan( state.lexer, 81, 4 );
    consume( state );
    add_reduce( state, 2, 39 );
    return 0
} else if( state.lexer._type  == 8 ){
    state.push_fn( hc_comment_list_142_goto /*hc_comment_list_142_goto( state, db, 31 )*/, 31 );
    scan( state.lexer, 4, 82 );
    consume( state );
    add_reduce( state, 2, 39 );
    return 0
} else if( state.lexer._type  == 7 ){
    state.push_fn( hc_comment_list_142_goto /*hc_comment_list_142_goto( state, db, 31 )*/, 31 );
    scan( state.lexer, 4, 83 );
    consume( state );
    add_reduce( state, 2, 39 );
    return 0
} else if( state.lexer._type  == 3 ){
    state.push_fn( hc_comment_list_142_goto /*hc_comment_list_142_goto( state, db, 31 )*/, 31 );
    scan( state.lexer, 84, 4 );
    consume( state );
    add_reduce( state, 2, 39 );
    return 0
} else if( state.lexer._type  == 5 ){
    state.push_fn( hc_comment_list_142_goto /*hc_comment_list_142_goto( state, db, 31 )*/, 31 );
    scan( state.lexer, 37, 4 );
    consume( state );
    add_reduce( state, 2, 39 );
    return 0
};
    return ( prod  == 31 ) ? prod  : - 1
}

function hc_symbols__literal_symbol_list_172(state, db, prod){
    scan( state.lexer, 85, 4 );
    if( state.lexer._type  == 5 || state.lexer._type  == 3 ){
    consume( state );
    add_reduce( state, 1, 42 );
    return hc_symbols__literal_symbol_list_172_goto( state, db, 32 )
};
    return - 1
}

function hc_symbols__literal_symbol_list_172_goto(state, db, prod){
    while( true ) {
        switch(prod){
            case 32: 
            {
                scan( state.lexer, 21, 0 );
                if( state.lexer._type  == 5 ){
                    var pk = state.lexer.copy_in_place(  );;
                    pk.next(  );
                    scan( pk, 86, 0 );
                    if( isTokenActive( pk._type, 86 ) ){
                        state.lexer._type  = 5;
                        state.push_fn( hc_symbols__literal_symbol_list_172_goto /*hc_symbols__literal_symbol_list_172_goto( state, db, 32 )*/, 32 );
                        scan( state.lexer, 37, 4 );
                        consume( state );
                        add_reduce( state, 2, 34 );
                        return 0
                    }
                } else if( state.lexer._type  == 3 ){
                    state.push_fn( hc_symbols__literal_symbol_list_172_goto /*hc_symbols__literal_symbol_list_172_goto( state, db, 32 )*/, 32 );
                    scan( state.lexer, 84, 4 );
                    consume( state );
                    add_reduce( state, 2, 34 );
                    return 0
                }
            }
            break;
            default: 
            break
        };
        break
    };
    return ( prod  == 32 ) ? prod  : - 1
}

function hc_symbols__escaped_symbol_list_178(state, db, prod){
    scan( state.lexer, 80, 4 );
    if( state.lexer._type  == 5 || state.lexer._type  == 3 || state.lexer._type  == 2 ){
    consume( state );
    add_reduce( state, 1, 42 );
    return hc_symbols__escaped_symbol_list_178_goto( state, db, 33 )
};
    return - 1
}

function hc_symbols__escaped_symbol_list_178_goto(state, db, prod){
    scan( state.lexer, 87, 0 );
    if( state.lexer._type  == 5 ){
    state.push_fn( hc_symbols__escaped_symbol_list_178_goto /*hc_symbols__escaped_symbol_list_178_goto( state, db, 33 )*/, 33 );
    scan( state.lexer, 37, 4 );
    consume( state );
    add_reduce( state, 2, 34 );
    return 0
} else if( state.lexer._type  == 3 ){
    state.push_fn( hc_symbols__escaped_symbol_list_178_goto /*hc_symbols__escaped_symbol_list_178_goto( state, db, 33 )*/, 33 );
    scan( state.lexer, 84, 4 );
    consume( state );
    add_reduce( state, 2, 34 );
    return 0
} else if( state.lexer._type  == 2 ){
    state.push_fn( hc_symbols__escaped_symbol_list_178_goto /*hc_symbols__escaped_symbol_list_178_goto( state, db, 33 )*/, 33 );
    scan( state.lexer, 81, 4 );
    consume( state );
    add_reduce( state, 2, 34 );
    return 0
};
    return ( prod  == 33 ) ? prod  : - 1
}

function hc_id_list_list_114_group_209_0_(state, db, prod){
    scan( state.lexer, 37, 4 );
    if( state.lexer._type  == 5 ){
    consume( state );
    scan( state.lexer, 4, 4 );
    add_reduce( state, 1, 43 );
    return 34
};
    return - 1
} 

        function recognize_primary( string, production){

            //create the input data buffer. 
            const temp_buffer = new Uint8Array(string.length * 4);
            
            const actual_length = fillByteBufferWithUTF8FromString(string, temp_buffer, temp_buffer.length);

            const resolved_buffer = new Uint8Array(temp_buffer.buffer, 0, actual_length);

            switch(production){
                case 0 : return recognize(resolved_buffer, actual_length, 0, hc_state_ir);
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
(env, sym, pos)=> (sym[1]) /*31*/,
(env, sym, pos)=> ({type:"sym-production",name:sym[0],production:null,val:-1,pos:pos,meta:false}) /*32*/,
(env, sym, pos)=> (sym[0]+sym[1]) /*33*/,
(env, sym, pos)=> ({type:"sym-production-import",module:sym[0],production:sym[2],name:"",pos:pos,meta:false}) /*34*/,
(env, sym, pos)=> ({type:"generated",val:sym[1],pos:pos,meta:false}) /*35*/,
(env, sym, pos)=> ({type:"exclusive-literal",val:""+sym[1],pos:pos,meta:false}) /*36*/,
(env, sym, pos)=> ({type:"literal",val:sym[1],pos:pos,meta:false}) /*37*/,
(env, sym, pos)=> ((sym[0].push(sym[1]),sym[0])) /*38*/,
(env, sym, pos)=> ((sym[0].push(sym[2]),sym[0])) /*39*/,
(env, sym, pos)=> ({type:"repeat-state"}) /*40*/,
(env, sym, pos)=> (sym[0]+"") /*41*/,
(env, sym, pos)=> (parseInt(sym[0])) /*42*/];

    export default ParserFactory
        (reduce_functions, undefined, recognizer_initializer, {state_ir:0});