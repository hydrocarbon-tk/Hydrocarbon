
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
    

        var token_lookup = new Uint32Array([40,12288,0,8,4096,0,0,16384,0,1871577474,1378,2,384,0,2,524672,0,2,1871581570,1378,2,384,2048,2,384,262144,0,384,0,0,524674,1024,2,4480,0,2,38408578,1024,2,384,524288,0,128,0,0,4194688,0,2,2432,0,2,1833570690,1378,2,33554816,1073741824,2,33554816,0,2,2097536,0,2,384,32768,2,528768,1024,2,1871577472,354,2,384,65536,2,384,637534208,0,384,402915328,0,384,134217728,0,384,268435456,0,4480,1024,2,430,32243712,0,428,32243712,0,300,32243712,0,528770,1024,2,37250,1024,3,896,0,2,9600,0,2,384,65536,0,16768,0,2,33152,0,2,8576,0,2,74112,0,2,1845886976,354,0,33152,128,2,25694594,1024,2,25166208,0,2,1862271360,1073742178,2,1828716544,354,0,131456,0,2,1862664576,354,2,1828716928,354,2,1048960,0,2,416,1048576,2,416,0,2,1048960,4,2,268435840,0,2,384,24,2,2147484032,1,2,384,1,2,384,128,2,4854146,1536,2,384,64,2,384,1024,2,424,12288,2,40,12288,2,0,0,2,0,4096,2,0,8192,2,32,0,2,8,0,2,384,16384,2,428,32768,2,392,4096,0,40,4096,0,0,4096,0,8,0,0,32,0,0,384,131072,0,384,1048576,0,430,31719424,0,300,31457280,0,428,31457280,0,384,2097152,0,388,4194304,0,424,0,0,386,0,0,384,8388608,0,428,0,0,384,16777216,0,302,31719424,0,4854146,1024,2,384,1073741824,2,4194688,2147483648,2,384,2147483648,2,384,0,3,2464,0,2,428,0,2,388,0,2,128,0,2,256,0,2,392,0,2,424,0,2,430,0,0]);;
        var token_sequence_lookup = new Uint8Array([60,91,93,62,38,40,41,115,121,109,98,111,108,115,58,95,45,47,42,47,58,58,123,125,102,111,114,107,103,111,116,111,116,111,107,101,110,92,36,101,111,102,94,61,62,44,69,78,68,95,79,70,95,80,82,79,68,85,67,84,73,79,78,114,101,99,111,118,101,114,111,110,112,114,111,100,97,115,115,101,114,116,98,97,99,107,117,110,116,105,108,101,110,103,116,104,105,100,99,111,110,115,117,109,101,110,111,116,104,105,110,103,101,120,112,101,99,116,101,100,102,97,105,108,103,58,116,104,101,110,115,107,105,112,112,101,100,114,101,100,117,99,101,112,101,101,107,108,101,102,116,102,58,116,58,115,116,97,116,101,115,99,97,110,115,101,116,114,101,116,117,114,110,114,101,112,101,97,116,112,97,115,115,112,111,112]);;
        function isTokenActive(token_id, row){
    var index  = ( row  * 3 ) + ( token_id  >> 5 );;
    var shift  = 1 << ( 31 & ( token_id ) );;
    return ( token_lookup[index] & shift ) != 0
};
        function scan_core(lexer, tk_row){
    switch(( lexer.get_byte_at( lexer.byte_offset ) & 127 )){
    case 36: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 36 ){
            if( isTokenActive( 56, tk_row ) && 3 == compare( lexer, lexer.byte_offset  + 1, 39, 3, token_sequence_lookup ) ){
                lexer.setToken( 56, 4, 4 );
                return
            }
        }
    }
    break;
    case 38: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 38 ){
            if( isTokenActive( 16, tk_row ) ){
                lexer.setToken( 16, 1, 1 );
                return
            }
        }
    }
    break;
    case 40: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 40 ){
            if( isTokenActive( 21, tk_row ) ){
                lexer.setToken( 21, 1, 1 );
                return
            }
        }
    }
    break;
    case 41: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 41 ){
            if( isTokenActive( 22, tk_row ) ){
                lexer.setToken( 22, 1, 1 );
                return
            }
        }
    }
    break;
    case 42: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 42 ){
            if( isTokenActive( 47, tk_row ) && lexer.get_byte_at( lexer.byte_offset  + 1 ) == 47 ){
                lexer.setToken( 47, 2, 2 );
                return
            }
        }
    }
    break;
    case 44: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 44 ){
            if( isTokenActive( 63, tk_row ) ){
                lexer.setToken( 63, 1, 1 );
                return
            }
        }
    }
    break;
    case 45: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 45 ){
            if( isTokenActive( 13, tk_row ) && token_production( lexer, hc_state_hash_token, 14, 13, 1 ) && lexer.byte_length  > 1 ){
                return
            } else if( isTokenActive( 45, tk_row ) ){
                lexer.setToken( 45, 1, 1 );
                return
            }
        }
    }
    break;
    case 47: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 47 ){
            if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 42 ){
                if( isTokenActive( 65, tk_row ) && token_production( lexer, hc_comment, 15, 65, 4 ) && lexer.byte_length  > 2 ){
                    return
                } else if( isTokenActive( 46, tk_row ) ){
                    lexer.setToken( 46, 2, 2 );
                    return
                }
            }
        }
    }
    break;
    case 58: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 58 ){
            if( isTokenActive( 49, tk_row ) && lexer.get_byte_at( lexer.byte_offset  + 1 ) == 58 ){
                lexer.setToken( 49, 2, 2 );
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
    case 61: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 61 ){
            if( isTokenActive( 60, tk_row ) && lexer.get_byte_at( lexer.byte_offset  + 1 ) == 62 ){
                lexer.setToken( 60, 2, 2 );
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
            if( isTokenActive( 15, tk_row ) ){
                lexer.setToken( 15, 1, 1 );
                return
            }
        }
    }
    break;
    case 92: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 92 ){
            if( isTokenActive( 55, tk_row ) ){
                lexer.setToken( 55, 1, 1 );
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
    case 94: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 94 ){
            if( isTokenActive( 59, tk_row ) ){
                lexer.setToken( 59, 1, 1 );
                return
            }
        }
    }
    break;
    case 95: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 95 ){
            if( isTokenActive( 13, tk_row ) && token_production( lexer, hc_state_hash_token, 14, 13, 1 ) && lexer.byte_length  > 1 ){
                return
            } else if( isTokenActive( 48, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 17, 48, 2 ) && lexer.byte_length  > 1 ){
                return
            } else if( isTokenActive( 44, tk_row ) ){
                lexer.setToken( 44, 1, 1 );
                return
            }
        }
    }
    break;
    case 97: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 97 ){
            if( 5 == compare( lexer, lexer.byte_offset  + 1, 77, 5, token_sequence_lookup ) ){
                if( isTokenActive( 13, tk_row ) && token_production( lexer, hc_state_hash_token, 14, 13, 1 ) && lexer.byte_length  > 6 ){
                    return
                } else if( isTokenActive( 48, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 17, 48, 2 ) && lexer.byte_length  > 6 ){
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
    case 98: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 98 ){
            if( 3 == compare( lexer, lexer.byte_offset  + 1, 83, 3, token_sequence_lookup ) ){
                if( isTokenActive( 13, tk_row ) && token_production( lexer, hc_state_hash_token, 14, 13, 1 ) && lexer.byte_length  > 4 ){
                    return
                } else if( isTokenActive( 48, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 17, 48, 2 ) && lexer.byte_length  > 4 ){
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
    break;
    case 99: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 99 ){
            if( 6 == compare( lexer, lexer.byte_offset  + 1, 99, 6, token_sequence_lookup ) ){
                if( isTokenActive( 13, tk_row ) && token_production( lexer, hc_state_hash_token, 14, 13, 1 ) && lexer.byte_length  > 7 ){
                    return
                } else if( isTokenActive( 48, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 17, 48, 2 ) && lexer.byte_length  > 7 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 7 ){
                    return
                } else if( isTokenActive( 40, tk_row ) ){
                    lexer.setToken( 40, 7, 7 );
                    return
                }
            }
        }
    }
    break;
    case 101: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 101 ){
            if( 7 == compare( lexer, lexer.byte_offset  + 1, 113, 7, token_sequence_lookup ) ){
                if( isTokenActive( 13, tk_row ) && token_production( lexer, hc_state_hash_token, 14, 13, 1 ) && lexer.byte_length  > 8 ){
                    return
                } else if( isTokenActive( 48, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 17, 48, 2 ) && lexer.byte_length  > 8 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 8 ){
                    return
                } else if( isTokenActive( 43, tk_row ) ){
                    lexer.setToken( 43, 8, 8 );
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
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 26, 2, token_sequence_lookup ) ){
                    if( isTokenActive( 13, tk_row ) && token_production( lexer, hc_state_hash_token, 14, 13, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 48, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 17, 48, 2 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 29, tk_row ) ){
                        lexer.setToken( 29, 4, 4 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 97 ){
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 122, 2, token_sequence_lookup ) ){
                    if( isTokenActive( 13, tk_row ) && token_production( lexer, hc_state_hash_token, 14, 13, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 48, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 17, 48, 2 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 38, tk_row ) ){
                        lexer.setToken( 38, 4, 4 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 58 ){
                if( isTokenActive( 52, tk_row ) ){
                    lexer.setToken( 52, 2, 2 );
                    return
                }
            }
        }
    }
    break;
    case 103: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 103 ){
            if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 111 ){
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 30, 2, token_sequence_lookup ) ){
                    if( isTokenActive( 13, tk_row ) && token_production( lexer, hc_state_hash_token, 14, 13, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 48, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 17, 48, 2 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 25, tk_row ) ){
                        lexer.setToken( 25, 4, 4 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 58 ){
                if( isTokenActive( 53, tk_row ) ){
                    lexer.setToken( 53, 2, 2 );
                    return
                }
            }
        }
    }
    break;
    case 105: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 105 ){
            if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 100 ){
                if( isTokenActive( 13, tk_row ) && token_production( lexer, hc_state_hash_token, 14, 13, 1 ) && lexer.byte_length  > 2 ){
                    return
                } else if( isTokenActive( 48, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 17, 48, 2 ) && lexer.byte_length  > 2 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 2 ){
                    return
                } else if( isTokenActive( 36, tk_row ) ){
                    lexer.setToken( 36, 2, 2 );
                    return
                }
            }
        }
    }
    break;
    case 108: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 108 ){
            if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 101 ){
                if( lexer.get_byte_at( lexer.byte_offset  + 2 ) == 110 ){
                    if( 3 == compare( lexer, lexer.byte_offset  + 3, 93, 3, token_sequence_lookup ) ){
                        if( isTokenActive( 13, tk_row ) && token_production( lexer, hc_state_hash_token, 14, 13, 1 ) && lexer.byte_length  > 6 ){
                            return
                        } else if( isTokenActive( 48, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 17, 48, 2 ) && lexer.byte_length  > 6 ){
                            return
                        } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 6 ){
                            return
                        } else if( isTokenActive( 35, tk_row ) ){
                            lexer.setToken( 35, 6, 6 );
                            return
                        }
                    }
                } else if( lexer.get_byte_at( lexer.byte_offset  + 2 ) == 102 ){
                    if( lexer.get_byte_at( lexer.byte_offset  + 3 ) == 116 ){
                        if( isTokenActive( 13, tk_row ) && token_production( lexer, hc_state_hash_token, 14, 13, 1 ) && lexer.byte_length  > 4 ){
                            return
                        } else if( isTokenActive( 48, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 17, 48, 2 ) && lexer.byte_length  > 4 ){
                            return
                        } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                            return
                        } else if( isTokenActive( 39, tk_row ) ){
                            lexer.setToken( 39, 4, 4 );
                            return
                        }
                    }
                }
            }
        }
    }
    break;
    case 110: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 110 ){
            if( 6 == compare( lexer, lexer.byte_offset  + 1, 106, 6, token_sequence_lookup ) ){
                if( isTokenActive( 13, tk_row ) && token_production( lexer, hc_state_hash_token, 14, 13, 1 ) && lexer.byte_length  > 7 ){
                    return
                } else if( isTokenActive( 48, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 17, 48, 2 ) && lexer.byte_length  > 7 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 7 ){
                    return
                } else if( isTokenActive( 41, tk_row ) ){
                    lexer.setToken( 41, 7, 7 );
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
                if( isTokenActive( 13, tk_row ) && token_production( lexer, hc_state_hash_token, 14, 13, 1 ) && lexer.byte_length  > 2 ){
                    return
                } else if( isTokenActive( 48, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 17, 48, 2 ) && lexer.byte_length  > 2 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 2 ){
                    return
                } else if( isTokenActive( 19, tk_row ) ){
                    lexer.setToken( 19, 2, 2 );
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
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 74, 2, token_sequence_lookup ) ){
                    if( isTokenActive( 13, tk_row ) && token_production( lexer, hc_state_hash_token, 14, 13, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 48, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 17, 48, 2 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 20, tk_row ) ){
                        lexer.setToken( 20, 4, 4 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 101 ){
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 145, 2, token_sequence_lookup ) ){
                    if( isTokenActive( 13, tk_row ) && token_production( lexer, hc_state_hash_token, 14, 13, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 48, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 17, 48, 2 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 23, tk_row ) ){
                        lexer.setToken( 23, 4, 4 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 97 ){
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 181, 2, token_sequence_lookup ) ){
                    if( isTokenActive( 13, tk_row ) && token_production( lexer, hc_state_hash_token, 14, 13, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 48, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 17, 48, 2 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 37, tk_row ) ){
                        lexer.setToken( 37, 4, 4 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 111 ){
                if( lexer.get_byte_at( lexer.byte_offset  + 2 ) == 112 ){
                    if( isTokenActive( 13, tk_row ) && token_production( lexer, hc_state_hash_token, 14, 13, 1 ) && lexer.byte_length  > 3 ){
                        return
                    } else if( isTokenActive( 48, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 17, 48, 2 ) && lexer.byte_length  > 3 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 3 ){
                        return
                    } else if( isTokenActive( 33, tk_row ) ){
                        lexer.setToken( 33, 3, 3 );
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
                if( lexer.get_byte_at( lexer.byte_offset  + 2 ) == 99 ){
                    if( 4 == compare( lexer, lexer.byte_offset  + 3, 66, 4, token_sequence_lookup ) ){
                        if( isTokenActive( 13, tk_row ) && token_production( lexer, hc_state_hash_token, 14, 13, 1 ) && lexer.byte_length  > 7 ){
                            return
                        } else if( isTokenActive( 48, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 17, 48, 2 ) && lexer.byte_length  > 7 ){
                            return
                        } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 7 ){
                            return
                        } else if( isTokenActive( 10, tk_row ) ){
                            lexer.setToken( 10, 7, 7 );
                            return
                        }
                    }
                } else if( lexer.get_byte_at( lexer.byte_offset  + 2 ) == 100 ){
                    if( 3 == compare( lexer, lexer.byte_offset  + 3, 140, 3, token_sequence_lookup ) ){
                        if( isTokenActive( 13, tk_row ) && token_production( lexer, hc_state_hash_token, 14, 13, 1 ) && lexer.byte_length  > 6 ){
                            return
                        } else if( isTokenActive( 48, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 17, 48, 2 ) && lexer.byte_length  > 6 ){
                            return
                        } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 6 ){
                            return
                        } else if( isTokenActive( 26, tk_row ) ){
                            lexer.setToken( 26, 6, 6 );
                            return
                        }
                    }
                } else if( lexer.get_byte_at( lexer.byte_offset  + 2 ) == 116 ){
                    if( 3 == compare( lexer, lexer.byte_offset  + 3, 170, 3, token_sequence_lookup ) ){
                        if( isTokenActive( 13, tk_row ) && token_production( lexer, hc_state_hash_token, 14, 13, 1 ) && lexer.byte_length  > 6 ){
                            return
                        } else if( isTokenActive( 48, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 17, 48, 2 ) && lexer.byte_length  > 6 ){
                            return
                        } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 6 ){
                            return
                        } else if( isTokenActive( 61, tk_row ) ){
                            lexer.setToken( 61, 6, 6 );
                            return
                        }
                    }
                } else if( lexer.get_byte_at( lexer.byte_offset  + 2 ) == 112 ){
                    if( 3 == compare( lexer, lexer.byte_offset  + 3, 176, 3, token_sequence_lookup ) ){
                        if( isTokenActive( 13, tk_row ) && token_production( lexer, hc_state_hash_token, 14, 13, 1 ) && lexer.byte_length  > 6 ){
                            return
                        } else if( isTokenActive( 48, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 17, 48, 2 ) && lexer.byte_length  > 6 ){
                            return
                        } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 6 ){
                            return
                        } else if( isTokenActive( 62, tk_row ) ){
                            lexer.setToken( 62, 6, 6 );
                            return
                        }
                    }
                }
            } else if( isTokenActive( 13, tk_row ) && token_production( lexer, hc_state_hash_token, 14, 13, 1 ) && lexer.byte_length  > 1 ){
                return
            } else if( isTokenActive( 48, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 17, 48, 2 ) && lexer.byte_length  > 1 ){
                return
            } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 1 ){
                return
            } else if( isTokenActive( 57, tk_row ) ){
                lexer.setToken( 57, 1, 1 );
                return
            } else if( isTokenActive( 58, tk_row ) ){
                lexer.setToken( 58, 1, 1 );
                return
            }
        }
    }
    break;
    case 115: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 115 ){
            if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 121 ){
                if( 6 == compare( lexer, lexer.byte_offset  + 2, 9, 6, token_sequence_lookup ) ){
                    if( isTokenActive( 42, tk_row ) ){
                        lexer.setToken( 42, 8, 8 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 107 ){
                if( 5 == compare( lexer, lexer.byte_offset  + 2, 132, 5, token_sequence_lookup ) ){
                    if( isTokenActive( 13, tk_row ) && token_production( lexer, hc_state_hash_token, 14, 13, 1 ) && lexer.byte_length  > 7 ){
                        return
                    } else if( isTokenActive( 48, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 17, 48, 2 ) && lexer.byte_length  > 7 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 7 ){
                        return
                    } else if( isTokenActive( 64, tk_row ) ){
                        lexer.setToken( 64, 7, 7 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 116 ){
                if( 3 == compare( lexer, lexer.byte_offset  + 2, 157, 3, token_sequence_lookup ) ){
                    if( isTokenActive( 13, tk_row ) && token_production( lexer, hc_state_hash_token, 14, 13, 1 ) && lexer.byte_length  > 5 ){
                        return
                    } else if( isTokenActive( 48, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 17, 48, 2 ) && lexer.byte_length  > 5 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 5 ){
                        return
                    } else if( isTokenActive( 14, tk_row ) ){
                        lexer.setToken( 14, 5, 5 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 99 ){
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 162, 2, token_sequence_lookup ) ){
                    if( isTokenActive( 13, tk_row ) && token_production( lexer, hc_state_hash_token, 14, 13, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 48, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 17, 48, 2 ) && lexer.byte_length  > 4 ){
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
                    if( isTokenActive( 13, tk_row ) && token_production( lexer, hc_state_hash_token, 14, 13, 1 ) && lexer.byte_length  > 3 ){
                        return
                    } else if( isTokenActive( 48, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 17, 48, 2 ) && lexer.byte_length  > 3 ){
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
            if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 111 ){
                if( lexer.get_byte_at( lexer.byte_offset  + 2 ) == 107 ){
                    if( 2 == compare( lexer, lexer.byte_offset  + 3, 35, 2, token_sequence_lookup ) ){
                        if( isTokenActive( 13, tk_row ) && token_production( lexer, hc_state_hash_token, 14, 13, 1 ) && lexer.byte_length  > 5 ){
                            return
                        } else if( isTokenActive( 48, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 17, 48, 2 ) && lexer.byte_length  > 5 ){
                            return
                        } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 5 ){
                            return
                        } else if( isTokenActive( 34, tk_row ) ){
                            lexer.setToken( 34, 5, 5 );
                            return
                        }
                    }
                } else if( isTokenActive( 13, tk_row ) && token_production( lexer, hc_state_hash_token, 14, 13, 1 ) && lexer.byte_length  > 2 ){
                    return
                } else if( isTokenActive( 48, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 17, 48, 2 ) && lexer.byte_length  > 2 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 2 ){
                    return
                } else if( isTokenActive( 28, tk_row ) ){
                    lexer.setToken( 28, 2, 2 );
                    return
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 104 ){
                if( 2 == compare( lexer, lexer.byte_offset  + 2, 128, 2, token_sequence_lookup ) ){
                    if( isTokenActive( 13, tk_row ) && token_production( lexer, hc_state_hash_token, 14, 13, 1 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 48, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 17, 48, 2 ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 4 ){
                        return
                    } else if( isTokenActive( 17, tk_row ) ){
                        lexer.setToken( 17, 4, 4 );
                        return
                    }
                }
            } else if( lexer.get_byte_at( lexer.byte_offset  + 1 ) == 58 ){
                if( isTokenActive( 54, tk_row ) ){
                    lexer.setToken( 54, 2, 2 );
                    return
                }
            }
        }
    }
    break;
    case 117: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 117 ){
            if( 4 == compare( lexer, lexer.byte_offset  + 1, 87, 4, token_sequence_lookup ) ){
                if( isTokenActive( 13, tk_row ) && token_production( lexer, hc_state_hash_token, 14, 13, 1 ) && lexer.byte_length  > 5 ){
                    return
                } else if( isTokenActive( 48, tk_row ) && token_production( lexer, hc_symbols__identifier_syms, 17, 48, 2 ) && lexer.byte_length  > 5 ){
                    return
                } else if( isTokenActive( 3, tk_row ) && lexer.isUniID(  ) && lexer.byte_length  > 5 ){
                    return
                } else if( isTokenActive( 32, tk_row ) ){
                    lexer.setToken( 32, 5, 5 );
                    return
                }
            }
        }
    }
    break;
    case 123: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 123 ){
            if( isTokenActive( 50, tk_row ) ){
                lexer.setToken( 50, 1, 1 );
                return
            }
        }
    }
    break;
    case 125: 
    {
        if( lexer.get_byte_at( lexer.byte_offset  ) == 125 ){
            if( isTokenActive( 51, tk_row ) ){
                lexer.setToken( 51, 1, 1 );
                return
            }
        }
    }
    break;
    default: 
    break
};
    if( isTokenActive( 13, tk_row ) && pre_scan( lexer, 0 ) && token_production( lexer, hc_state_hash_token, 14, 13, 1 ) ){
    return
} else if( isTokenActive( 48, tk_row ) && pre_scan( lexer, 1 ) && token_production( lexer, hc_symbols__identifier_syms, 17, 48, 2 ) ){
    return
} else if( isTokenActive( 65, tk_row ) && pre_scan( lexer, 2 ) && token_production( lexer, hc_comment, 15, 65, 4 ) ){
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

function branch_00bd020c773b9cb7(state, db, prod){
    state.push_fn( branch_5fc615c6044c8f92, 3 );
    return hc_symbols__production_symbol( state, db, 0 )
}

function branch_0912092e7d3508ca(state, db, prod){
    add_reduce( state, 3, 53 );
    return 0
}

function branch_0918c9a5db47237b(state, db, prod){
    add_reduce( state, 1, 19 );
    return hc_sequence_instruction_list_101_goto( state, db, 38 )
}

function branch_09fd4c587b3f4d77(state, db, prod){
    add_reduce( state, 3, 2 );
    return 0
}

function branch_0ba42b5833d24aa7(state, db, prod){
    state.push_fn( branch_a87fe037d04e1e11, 27 );
    return hc_symbols__sym_delimiter( state, db, 0 )
}

function branch_0d44fbcd5a50462b(state, db, prod){
    scan( state.lexer, 3, 4 );
    if( state.lexer._type  == 19 ){
    scan( state.lexer, 5, 4 );
    state.push_fn( branch_2168a2e826e87017, 0 );
    return hc_on_fail( state, db, 0 )
} else if( state.lexer._type  == 42 ){
    state.push_fn( set_production /*0*/, 0 );
    state.push_fn( branch_09fd4c587b3f4d77, 0 );
    return hc_expected_symbols( state, db, 0 )
} else {
    add_reduce( state, 2, 4 );
    return 0
};
    return - 1
}

function branch_16017c1e108a3870(state, db, prod){
    state.push_fn( set_production /*23*/, 23 );
    return hc_symbols__literal_symbol( state, db, 0 )
}

function branch_197ae885dba78d11(state, db, prod){
    scan( state.lexer, 6, 4 );
    if( state.lexer._type  == 19 ){
    scan( state.lexer, 5, 4 );
    state.push_fn( branch_f64d570f1e5a7341, 0 );
    return hc_on_fail( state, db, 0 )
} else if( state.lexer._type  == 42 ){
    var pk = state.lexer.copy_in_place(  );;
    pk.next(  );
    scan( pk, 7, 4 );
    if( pk._type  == 43 ){
        state.lexer._type  = 42;
        state.push_fn( set_production /*10*/, 10 );
        state.push_fn( branch_8d86cf194d34c64d, 10 );
        return hc_expected_symbols( state, db, 0 )
    }
} else {
    add_reduce( state, 4, 42 );
    return 10
};
    return - 1
}

function branch_19f6f89366e776c9(state, db, prod){
    add_reduce( state, 3, 62 );
    return 0
}

function branch_1ac4137dc88a80cf(state, db, prod){
    add_reduce( state, 4, 27 );
    return 0
}

function branch_1b2b8353e2441d52(state, db, prod){
    scan( state.lexer, 8, 9 );
    if( ( state.lexer._type  == 50 ) ){
    consume( state );
    state.push_fn( branch_fc479d8d1b41e9d0, 19 );
    return hc_functions__js_data( state, db, 0 )
};
    return - 1
}

function branch_1e3ac8120e7b258b(state, db, prod){
    add_reduce( state, 4, 1 );
    return 0
}

function branch_2168a2e826e87017(state, db, prod){
    scan( state.lexer, 10, 4 );
    if( state.lexer._type  == 42 ){
    state.push_fn( set_production /*0*/, 0 );
    state.push_fn( branch_1e3ac8120e7b258b, 0 );
    return hc_expected_symbols( state, db, 0 )
} else {
    add_reduce( state, 3, 3 );
    return 0
};
    return - 1
}

function branch_22edfc01fea2e26d(state, db, prod){
    scan( state.lexer, 11, 4 );
    if( ( state.lexer._type  == 12 ) ){
    consume( state );
    add_reduce( state, 8, 5 );
    return 0
};
    return - 1
}

function branch_29e957ac74f3a46a(state, db, prod){
    add_reduce( state, 2, 24 );
    return 8
}

function branch_30e011de58421896(state, db, prod){
    scan( state.lexer, 12, 4 );
    if( state.lexer._type  == 17 ){
    state.push_fn( hc_top_level_instructions_goto /*hc_top_level_instructions_goto( state, db, 4 )*/, 4 );
    state.push_fn( branch_3fc45b8f4b0b9d68, 4 );
    return hc_instruction_sequence_group_56_0_( state, db, 0 )
} else {
    add_reduce( state, 3, 17 );
    return hc_top_level_instructions_goto( state, db, 4 )
};
    return - 1
}

function branch_3665b7f6699a1e7a(state, db, prod){
    add_reduce( state, 3, 37 );
    return 0
}

function branch_39faa76b84957c22(state, db, prod){
    add_reduce( state, 1, 51 );
    return 0
}

function branch_3a232c27427e23da(state, db, prod){
    scan( state.lexer, 13, 9 );
    if( ( state.lexer._type  == 51 ) ){
    consume( state );
    add_reduce( state, 5, 58 );
    return 0
};
    return - 1
}

function branch_3ef6c5cb45dcabc3(state, db, prod){
    add_reduce( state, 4, 29 );
    return 0
}

function branch_3fc45b8f4b0b9d68(state, db, prod){
    add_reduce( state, 4, 15 );
    return 0
}

function branch_541138437f11a365(state, db, prod){
    if( state.lexer._type  == 2 ){
    consume( state );
    scan( state.lexer, 14, 14 );
    return 23
};
    return - 1
}

function branch_54c6214b083ed3d4(state, db, prod){
    add_reduce( state, 2, 16 );
    return 0
}

function branch_57ed90dcf3964005(state, db, prod){
    state.push_fn( branch_728e1a79d82b9cf0, 9 );
    return hc_functions__reduce_function( state, db, 0 )
}

function branch_5bdea3c33762688e(state, db, prod){
    scan( state.lexer, 13, 9 );
    if( ( state.lexer._type  == 51 ) ){
    consume( state );
    add_reduce( state, 3, 57 );
    return 29
};
    return - 1
}

function branch_5c09798e875a8ad2(state, db, prod){
    scan( state.lexer, 15, 4 );
    if( ( state.lexer._type  == 22 ) ){
    consume( state );
    add_reduce( state, 5, 22 );
    return 0
};
    return - 1
}

function branch_5c6a3c1bfd4ff540(state, db, prod){
    add_reduce( state, 2, 47 );
    return 0
}

function branch_5fc615c6044c8f92(state, db, prod){
    scan( state.lexer, 16, 4 );
    if( ( state.lexer._type  == 11 ) ){
    consume( state );
    add_reduce( state, 5, 14 );
    return 3
};
    return - 1
}

function branch_609621b618d4f6c2(state, db, prod){
    add_reduce( state, 4, 60 );
    return 0
}

function branch_6182ee4ca013373b(state, db, prod){
    scan( state.lexer, 17, 4 );
    if( state.lexer._type  == 17 ){
    var pk = state.lexer.copy_in_place(  );;
    pk.next(  );
    scan( pk, 18, 4 );
    if( pk._type  == 25 ){
        consume( state );
        scan( state.lexer, 19, 4 );
        state.push_fn( branch_a67c5ce99de2f629, 0 );
        return hc_instruction_sequence_list_55( state, db, 0 )
    } else {
        state.lexer._type  = 17;
        state.push_fn( set_production /*5*/, 5 );
        state.push_fn( branch_54c6214b083ed3d4, 5 );
        return hc_instruction_sequence_group_56_0_( state, db, 0 )
    }
} else {
    add_reduce( state, 1, 18 );
    return 5
};
    return - 1
}

function branch_63f05831381f57bc(state, db, prod){
    add_reduce( state, 1, 19 );
    return hc_token_id_list_list_141_goto( state, db, 40 )
}

function branch_675f3230ecb5bf2b(state, db, prod){
    add_reduce( state, 1, 66 );
    return 42
}

function branch_695e234d1d253dca(state, db, prod){
    scan( state.lexer, 20, 4 );
    if( ( state.lexer._type  == 21 ) ){
    consume( state );
    state.push_fn( branch_7cc9803f5439a170, 32 );
    return hc_instruction_sequence( state, db, 0 )
};
    return - 1
}

function branch_69a216e1c5e8176c(state, db, prod){
    add_reduce( state, 1, 19 );
    return hc_top_level_instructions_list_50_goto( state, db, 32 )
}

function branch_6a36e12223af8ace(state, db, prod){
    state.push_fn( branch_728e1a79d82b9cf0, 9 );
    return hc_functions__referenced_function( state, db, 0 )
}

function branch_6ff5885ea3d1a206(state, db, prod){
    scan( state.lexer, 16, 4 );
    if( ( state.lexer._type  == 11 ) ){
    consume( state );
    add_reduce( state, 3, 45 );
    return 12
};
    return - 1
}

function branch_728e1a79d82b9cf0(state, db, prod){
    add_reduce( state, 2, 26 );
    return 9
}

function branch_75fbcc406d1001cb(state, db, prod){
    scan( state.lexer, 21, 4 );
    if( ( state.lexer._type  == 47 ) ){
    consume( state );
    add_reduce( state, 3, 0 );
    return 0
};
    return - 1
}

function branch_7cc9803f5439a170(state, db, prod){
    scan( state.lexer, 15, 4 );
    if( ( state.lexer._type  == 22 ) ){
    consume( state );
    add_reduce( state, 5, 23 );
    add_reduce( state, 1, 19 );
    return 0
};
    return - 1
}

function branch_840c2bd22fd82286(state, db, prod){
    scan( state.lexer, 22, 4 );
    if( state.lexer._type  == 19 ){
    scan( state.lexer, 5, 4 );
    state.push_fn( branch_c572f844768ea55c, 0 );
    return hc_on_fail( state, db, 0 )
} else if( state.lexer._type  == 42 ){
    state.push_fn( set_production /*1*/, 1 );
    state.push_fn( branch_ffd809c324fb3dd8, 1 );
    return hc_expected_symbols( state, db, 0 )
} else if( state.lexer._type  == 12 ){
    state.push_fn( set_production /*1*/, 1 );
    consume( state );
    add_reduce( state, 5, 12 );
    return 0
};
    return - 1
}

function branch_8541a4532772367d(state, db, prod){
    add_reduce( state, 6, 39 );
    return 0
}

function branch_8846ead88ba9c3bc(state, db, prod){
    scan( state.lexer, 11, 4 );
    if( ( state.lexer._type  == 12 ) ){
    consume( state );
    add_reduce( state, 7, 7 );
    return 0
};
    return - 1
}

function branch_8980d2e1cf9e93bb(state, db, prod){
    scan( state.lexer, 22, 4 );
    if( state.lexer._type  == 19 ){
    scan( state.lexer, 5, 4 );
    state.push_fn( branch_f5e2475058608615, 0 );
    return hc_on_fail( state, db, 0 )
} else if( state.lexer._type  == 42 ){
    state.push_fn( set_production /*1*/, 1 );
    state.push_fn( branch_8846ead88ba9c3bc, 1 );
    return hc_expected_symbols( state, db, 0 )
} else if( state.lexer._type  == 12 ){
    state.push_fn( set_production /*1*/, 1 );
    consume( state );
    add_reduce( state, 6, 11 );
    return 0
};
    return - 1
}

function branch_8d86cf194d34c64d(state, db, prod){
    add_reduce( state, 5, 40 );
    return 0
}

function branch_90926bb1bd92c6a5(state, db, prod){
    scan( state.lexer, 20, 4 );
    if( ( state.lexer._type  == 21 ) ){
    consume( state );
    state.push_fn( branch_5c09798e875a8ad2, 7 );
    return hc_instruction_sequence( state, db, 0 )
};
    return - 1
}

function branch_946f5566f9fe06f5(state, db, prod){
    scan( state.lexer, 23, 4 );
    state.push_fn( branch_197ae885dba78d11, 0 );
    return hc_top_level_instructions( state, db, 0 )
}

function branch_9f1c1dce43b91438(state, db, prod){
    scan( state.lexer, 24, 4 );
    state.push_fn( branch_cbbbee361458148f, 0 );
    return hc_symbols__imported_production_symbol( state, db, 0 )
}

function branch_9fc4951f629a2b5b(state, db, prod){
    add_reduce( state, 1, 19 );
    return hc_instruction_sequence_list_52_goto( state, db, 33 )
}

function branch_a01502e0c3cfa673(state, db, prod){
    scan( state.lexer, 20, 4 );
    if( ( state.lexer._type  == 21 ) ){
    consume( state );
    state.push_fn( branch_cac6aadeb64d8cce, 6 );
    return hc_instruction_sequence( state, db, 0 )
};
    return - 1
}

function branch_a67c5ce99de2f629(state, db, prod){
    scan( state.lexer, 12, 4 );
    if( state.lexer._type  == 17 ){
    state.push_fn( set_production /*5*/, 5 );
    state.push_fn( branch_3fc45b8f4b0b9d68, 5 );
    return hc_instruction_sequence_group_56_0_( state, db, 0 )
} else {
    add_reduce( state, 3, 17 );
    return 5
};
    return - 1
}

function branch_a7efc44a67bdffa8(state, db, prod){
    scan( state.lexer, 23, 4 );
    state.push_fn( branch_0d44fbcd5a50462b, 0 );
    return hc_top_level_instructions( state, db, 0 )
}

function branch_a87fe037d04e1e11(state, db, prod){
    add_reduce( state, 3, 55 );
    return 27
}

function branch_a8d6ab6ebc23eb1e(state, db, prod){
    add_reduce( state, 2, 61 );
    return 0
}

function branch_aaa2b4fc09b80482(state, db, prod){
    scan( state.lexer, 15, 4 );
    if( ( state.lexer._type  == 22 ) ){
    consume( state );
    add_reduce( state, 5, 23 );
    return 0
};
    return - 1
}

function branch_b173afe32fa81326(state, db, prod){
    state.push_fn( branch_1b2b8353e2441d52, 19 );
    return hc_symbols__identifier( state, db, 0 )
}

function branch_b2fb3c3e25823965(state, db, prod){
    state.push_fn( branch_5fc615c6044c8f92, 3 );
    return hc_symbols__imported_production_symbol( state, db, 0 )
}

function branch_b38a7b278d28538d(state, db, prod){
    scan( state.lexer, 25, 9 );
    if( state.lexer._type  == 57 ){
    var pk = state.lexer.copy_in_place(  );;
    pk.next(  );
    scan( pk, 26, 9 );
    if( pk._type  == 50 ){
        state.lexer._type  = 57;
        state.push_fn( set_production /*30*/, 30 );
        consume( state );
        scan( state.lexer, 8, 9 );
        if( ( state.lexer._type  == 50 ) ){
            consume( state );
            state.push_fn( branch_3a232c27427e23da, 30 );
            return hc_functions__js_data( state, db, 0 )
        };
        return - 1
    } else if( pk._type  == 59 ){
        state.lexer._type  = 58;
        state.push_fn( set_production /*30*/, 30 );
        consume( state );
        scan( state.lexer, 27, 9 );
        if( ( state.lexer._type  == 59 ) ){
            consume( state );
            state.push_fn( branch_d90f2b7bedf196e2, 30 );
            return hc_symbols__identifier( state, db, 0 )
        };
        return - 1
    } else {
        state.lexer._type  = 58;
        state.push_fn( set_production /*30*/, 30 );
        consume( state );
        scan( state.lexer, 28, 9 );
        if( ( state.lexer._type  == 60 ) ){
            consume( state );
            state.push_fn( branch_609621b618d4f6c2, 30 );
            return hc_symbols__identifier( state, db, 0 )
        };
        return - 1
    }
} else if( state.lexer._type  == 61 ){
    consume( state );
    scan( state.lexer, 26, 9 );
    if( state.lexer._type  == 50 ){
        state.push_fn( set_production /*30*/, 30 );
        consume( state );
        state.push_fn( branch_3a232c27427e23da, 30 );
        return hc_functions__js_data( state, db, 0 )
    } else if( state.lexer._type  == 59 ){
        state.push_fn( set_production /*30*/, 30 );
        consume( state );
        state.push_fn( branch_d90f2b7bedf196e2, 30 );
        return hc_symbols__identifier( state, db, 0 )
    } else if( state.lexer._type  == 60 ){
        state.push_fn( set_production /*30*/, 30 );
        consume( state );
        state.push_fn( branch_609621b618d4f6c2, 30 );
        return hc_symbols__identifier( state, db, 0 )
    }
};
    return - 1
}

function branch_be6dcc4e08394b03(state, db, prod){
    add_reduce( state, 4, 32 );
    return 0
}

function branch_bfbf48847a946a6f(state, db, prod){
    add_reduce( state, 1, 19 );
    return 0
}

function branch_c3117067296bad80(state, db, prod){
    add_reduce( state, 1, 19 );
    return hc_top_level_instructions_list_49_goto( state, db, 31 )
}

function branch_c4ca39c6ca78845d(state, db, prod){
    add_reduce( state, 2, 45 );
    return 39
}

function branch_c572f844768ea55c(state, db, prod){
    scan( state.lexer, 29, 4 );
    if( state.lexer._type  == 42 ){
    state.push_fn( set_production /*1*/, 1 );
    state.push_fn( branch_feb58919d2676bb8, 1 );
    return hc_expected_symbols( state, db, 0 )
} else if( state.lexer._type  == 12 ){
    state.push_fn( set_production /*1*/, 1 );
    consume( state );
    add_reduce( state, 6, 10 );
    return 0
};
    return - 1
}

function branch_c816d1b27bf1930a(state, db, prod){
    scan( state.lexer, 30, 0 );
    if( state.lexer._type  == 8 ){
    var pk = state.lexer.copy_in_place(  );;
    pk.next(  );
    scan( pk, 31, 14 );
    if( isTokenActive( pk._type, 32 ) ){
        state.lexer._type  = 8;
        state.push_fn( set_production /*25*/, 25 );
        state.push_fn( branch_0912092e7d3508ca, 25 );
        return hc_symbols__sym_delimiter( state, db, 0 )
    }
} else if( state.lexer._type  == 1 || state.lexer._type  == 7 ){
    state.push_fn( set_production /*25*/, 25 );
    state.push_fn( branch_0912092e7d3508ca, 25 );
    return hc_symbols__sym_delimiter( state, db, 0 )
} else {
    add_reduce( state, 2, 53 );
    return 25
};
    return - 1
}

function branch_cac6aadeb64d8cce(state, db, prod){
    scan( state.lexer, 15, 4 );
    if( ( state.lexer._type  == 22 ) ){
    consume( state );
    add_reduce( state, 6, 21 );
    return 6
};
    return - 1
}

function branch_cb583ef0dedc66ad(state, db, prod){
    add_reduce( state, 4, 43 );
    return 0
}

function branch_cbbbee361458148f(state, db, prod){
    scan( state.lexer, 16, 4 );
    if( state.lexer._type  == 11 ){
    consume( state );
    scan( state.lexer, 23, 4 );
    state.push_fn( branch_8980d2e1cf9e93bb, 0 );
    return hc_top_level_instructions( state, db, 0 )
};
    return - 1
}

function branch_ccc42ce225111f12(state, db, prod){
    add_reduce( state, 1, 19 );
    return hc_instruction_sequence_list_55_goto( state, db, 34 )
}

function branch_cd71f9ac7daab8bf(state, db, prod){
    scan( state.lexer, 15, 4 );
    if( ( state.lexer._type  == 22 ) ){
    consume( state );
    add_reduce( state, 5, 28 );
    return 0
};
    return - 1
}

function branch_d3f7307f8c00b80f(state, db, prod){
    scan( state.lexer, 12, 4 );
    if( state.lexer._type  == 17 ){
    state.push_fn( set_production /*5*/, 5 );
    state.push_fn( branch_54c6214b083ed3d4, 5 );
    return hc_instruction_sequence_group_59_0_( state, db, 0 )
} else {
    add_reduce( state, 1, 18 );
    return 5
};
    return - 1
}

function branch_d636f40b394c47a7(state, db, prod){
    scan( state.lexer, 20, 4 );
    if( ( state.lexer._type  == 21 ) ){
    consume( state );
    state.push_fn( branch_aaa2b4fc09b80482, 7 );
    return hc_instruction_sequence( state, db, 0 )
};
    return - 1
}

function branch_d90f2b7bedf196e2(state, db, prod){
    add_reduce( state, 4, 59 );
    return 0
}

function branch_d9e1f6038a5c684f(state, db, prod){
    scan( state.lexer, 24, 4 );
    state.push_fn( branch_cbbbee361458148f, 0 );
    return hc_symbols__production_symbol( state, db, 0 )
}

function branch_da6fc1eb42935bef(state, db, prod){
    scan( state.lexer, 16, 4 );
    if( ( state.lexer._type  == 11 ) ){
    consume( state );
    add_reduce( state, 3, 45 );
    return 13
};
    return - 1
}

function branch_f5e2475058608615(state, db, prod){
    scan( state.lexer, 29, 4 );
    if( state.lexer._type  == 42 ){
    state.push_fn( set_production /*1*/, 1 );
    state.push_fn( branch_22edfc01fea2e26d, 1 );
    return hc_expected_symbols( state, db, 0 )
} else if( state.lexer._type  == 12 ){
    state.push_fn( set_production /*1*/, 1 );
    consume( state );
    add_reduce( state, 7, 8 );
    return 0
};
    return - 1
}

function branch_f64d570f1e5a7341(state, db, prod){
    scan( state.lexer, 33, 4 );
    if( state.lexer._type  == 42 ){
    var pk = state.lexer.copy_in_place(  );;
    pk.next(  );
    scan( pk, 7, 4 );
    if( pk._type  == 43 ){
        state.lexer._type  = 42;
        state.push_fn( set_production /*10*/, 10 );
        state.push_fn( branch_8541a4532772367d, 10 );
        return hc_expected_symbols( state, db, 0 )
    }
} else {
    add_reduce( state, 5, 41 );
    return 10
};
    return - 1
}

function branch_fc479d8d1b41e9d0(state, db, prod){
    scan( state.lexer, 13, 9 );
    if( ( state.lexer._type  == 51 ) ){
    consume( state );
    add_reduce( state, 5, 49 );
    return 19
};
    return - 1
}

function branch_fe44ac138fb1f308(state, db, prod){
    scan( state.lexer, 34, 4 );
    if( state.lexer._type  == 64 ){
    state.push_fn( set_production /*11*/, 11 );
    state.push_fn( branch_cb583ef0dedc66ad, 11 );
    return hc_expected_symbols_group_135_0_( state, db, 0 )
} else {
    add_reduce( state, 3, 44 );
    return 11
};
    return - 1
}

function branch_feb58919d2676bb8(state, db, prod){
    scan( state.lexer, 11, 4 );
    if( ( state.lexer._type  == 12 ) ){
    consume( state );
    add_reduce( state, 7, 6 );
    return 0
};
    return - 1
}

function branch_ffd809c324fb3dd8(state, db, prod){
    scan( state.lexer, 11, 4 );
    if( ( state.lexer._type  == 12 ) ){
    consume( state );
    add_reduce( state, 6, 9 );
    return 0
};
    return - 1
}

function hc_state_ir(state, db, prod){
    state.push_fn( branch_a7efc44a67bdffa8, 0 );
    return hc_state_declaration( state, db, 0 )
}

function hc_grammar_injection(state, db, prod){
    scan( state.lexer, 35, 4 );
    if( state.lexer._type  == 9 ){
    consume( state );
    scan( state.lexer, 36, 4 );
    if( state.lexer._type  == 10 ){
        consume( state );
        scan( state.lexer, 37, 9 );
        if( state.lexer._type  == 48 ){
            var fk1 = state.fork( db );;
            fk1.push_fn( branch_9f1c1dce43b91438, 1 );
            state.push_fn( branch_d9e1f6038a5c684f, 1 );
            return 0
        }
    } else if( state.lexer._type  == 13 ){
        consume( state );
        scan( state.lexer, 16, 4 );
        if( state.lexer._type  == 11 ){
            consume( state );
            scan( state.lexer, 23, 4 );
            state.push_fn( branch_840c2bd22fd82286, 0 );
            return hc_top_level_instructions( state, db, 0 )
        }
    }
};
    return - 1
}

function hc_state_declaration(state, db, prod){
    scan( state.lexer, 38, 4 );
    if( state.lexer._type  == 14 ){
    consume( state );
    scan( state.lexer, 39, 4 );
    if( ( state.lexer._type  == 15 ) ){
        consume( state );
        scan( state.lexer, 40, 4 );
        if( ( state.lexer._type  == 13 ) ){
            consume( state );
            scan( state.lexer, 16, 4 );
            if( ( state.lexer._type  == 11 ) ){
                consume( state );
                add_reduce( state, 4, 13 );
                return 2
            }
        }
    }
};
    return - 1
}

function hc_state_reference(state, db, prod){
    scan( state.lexer, 38, 4 );
    if( state.lexer._type  == 14 ){
    consume( state );
    scan( state.lexer, 39, 4 );
    if( state.lexer._type  == 15 ){
        consume( state );
        scan( state.lexer, 41, 4 );
        if( state.lexer._type  == 16 ){
            consume( state );
            scan( state.lexer, 37, 9 );
            if( state.lexer._type  == 48 ){
                var fk1 = state.fork( db );;
                fk1.push_fn( branch_b2fb3c3e25823965, 3 );
                state.push_fn( branch_00bd020c773b9cb7, 3 );
                return 0
            }
        } else if( state.lexer._type  == 13 ){
            state.push_fn( set_production /*3*/, 3 );
            consume( state );
            scan( state.lexer, 16, 4 );
            if( ( state.lexer._type  == 11 ) ){
                consume( state );
                add_reduce( state, 4, 13 );
                return 0
            };
            return - 1
        }
    }
};
    return - 1
}

function hc_top_level_instructions(state, db, prod){
    scan( state.lexer, 23, 4 );
    if( isTokenActive( state.lexer._type, 42 ) ){
    state.push_fn( hc_top_level_instructions_goto /*hc_top_level_instructions_goto( state, db, 4 )*/, 4 );
    state.push_fn( set_production /*0*/, 4 );
    return hc_instruction_sequence( state, db, 0 )
} else if( state.lexer._type  == 19 ){
    state.push_fn( hc_top_level_instructions_goto /*hc_top_level_instructions_goto( state, db, 4 )*/, 4 );
    state.push_fn( set_production /*0*/, 4 );
    return hc_top_level_instructions_list_49( state, db, 0 )
} else if( state.lexer._type  == 23 ){
    state.push_fn( hc_top_level_instructions_goto /*hc_top_level_instructions_goto( state, db, 4 )*/, 4 );
    state.push_fn( set_production /*0*/, 4 );
    return hc_top_level_instructions_list_50( state, db, 0 )
} else if( state.lexer._type  == 24 ){
    consume( state );
    scan( state.lexer, 43, 4 );
    if( state.lexer._type  == 39 ){
        state.push_fn( hc_top_level_instructions_goto /*hc_top_level_instructions_goto( state, db, 33 )*/, 33 );
        consume( state );
        add_reduce( state, 2, 35 );
        add_reduce( state, 1, 19 );
        return 0
    } else {
        state.push_fn( hc_top_level_instructions_goto /*hc_top_level_instructions_goto( state, db, 32 )*/, 32 );
        state.push_fn( branch_695e234d1d253dca, 32 );
        return hc_token_id_list( state, db, 0 )
    }
};
    return - 1
}

function hc_top_level_instructions_goto(state, db, prod){
    while( true ) {
        switch(prod){
            case 32: 
            {
                scan( state.lexer, 44, 4 );
                if( state.lexer._type  == 23 || state.lexer._type  == 24 ){
                    state.push_fn( hc_top_level_instructions_goto /*hc_top_level_instructions_goto( state, db, 32 )*/, 32 );
                    scan( state.lexer, 45, 4 );
                    if( ( state.lexer._type  == 23 || state.lexer._type  == 24 ) ){
                        state.push_fn( branch_a8d6ab6ebc23eb1e, 32 );
                        return hc_token_branch_instruction( state, db, 0 )
                    };
                    return - 1
                } else {
                    scan( state.lexer, 4, 4 );
                    prod = 4;
                    continue
                };
                break
            }
            break;
            case 33: 
            {
                scan( state.lexer, 17, 4 );
                if( state.lexer._type  == 17 ){
                    var pk = state.lexer.copy_in_place(  );;
                    pk.next(  );
                    scan( pk, 46, 4 );
                    if( isTokenActive( pk._type, 47 ) ){
                        state.lexer._type  = 17;
                        state.push_fn( hc_top_level_instructions_goto /*hc_top_level_instructions_goto( state, db, 33 )*/, 33 );
                        scan( state.lexer, 48, 4 );
                        consume( state );
                        state.push_fn( branch_19f6f89366e776c9, 33 );
                        return hc_sequence_instruction( state, db, 0 )
                    } else if( pk._type  == 25 ){
                        consume( state );
                        scan( state.lexer, 19, 4 );
                        state.push_fn( branch_30e011de58421896, 0 );
                        return hc_instruction_sequence_list_55( state, db, 0 )
                    } else if( pk._type  == 62 ){
                        state.lexer._type  = 17;
                        state.push_fn( hc_top_level_instructions_goto /*hc_top_level_instructions_goto( state, db, 4 )*/, 4 );
                        scan( state.lexer, 48, 4 );
                        if( ( state.lexer._type  == 17 ) ){
                            state.push_fn( branch_54c6214b083ed3d4, 4 );
                            return hc_instruction_sequence_group_56_0_( state, db, 0 )
                        };
                        return - 1
                    }
                } else {
                    scan( state.lexer, 4, 4 );
                    add_reduce( state, 1, 18 );
                    prod = 4;
                    continue
                };
                break
            }
            break;
            default: 
            break
        };
        break
    };
    return ( prod  == 4 ) ? prod  : - 1
}

function hc_instruction_sequence(state, db, prod){
    scan( state.lexer, 49, 4 );
    if( state.lexer._type  == 18 ){
    state.push_fn( set_production /*5*/, 5 );
    state.lexer.setToken( 2, 0, 0 );
    consume( state );
    return 0
} else if( isTokenActive( state.lexer._type, 47 ) ){
    scan( state.lexer, 50, 4 );
    state.push_fn( branch_6182ee4ca013373b, 0 );
    return hc_instruction_sequence_list_52( state, db, 0 )
} else if( state.lexer._type  == 25 ){
    scan( state.lexer, 19, 4 );
    state.push_fn( branch_d3f7307f8c00b80f, 0 );
    return hc_instruction_sequence_list_55( state, db, 0 )
} else if( state.lexer._type  == 17 ){
    state.push_fn( set_production /*5*/, 5 );
    state.push_fn( branch_bfbf48847a946a6f, 5 );
    return hc_instruction_sequence_group_59_0_( state, db, 0 )
};
    state.lexer.setToken( 2, 0, 0 );
    consume( state );
    return 5
}

function hc_prod_branch_instruction(state, db, prod){
    scan( state.lexer, 5, 4 );
    if( state.lexer._type  == 19 ){
    consume( state );
    scan( state.lexer, 51, 4 );
    if( ( state.lexer._type  == 20 ) ){
        consume( state );
        state.push_fn( branch_a01502e0c3cfa673, 6 );
        return hc_production_id_list( state, db, 0 )
    }
};
    return - 1
}

function hc_token_branch_instruction(state, db, prod){
    scan( state.lexer, 45, 4 );
    if( state.lexer._type  == 23 ){
    state.push_fn( set_production /*7*/, 7 );
    consume( state );
    state.push_fn( branch_90926bb1bd92c6a5, 7 );
    return hc_token_id_list( state, db, 0 )
} else if( state.lexer._type  == 24 ){
    state.push_fn( set_production /*7*/, 7 );
    consume( state );
    state.push_fn( branch_d636f40b394c47a7, 7 );
    return hc_token_id_list( state, db, 0 )
};
    return - 1
}

function hc_goto_instruction(state, db, prod){
    scan( state.lexer, 19, 4 );
    if( state.lexer._type  == 25 ){
    consume( state );
    scan( state.lexer, 38, 4 );
    if( ( state.lexer._type  == 14 ) ){
        state.push_fn( branch_29e957ac74f3a46a, 8 );
        return hc_state_reference( state, db, 0 )
    }
};
    return - 1
}

function hc_sequence_instruction(state, db, prod){
    scan( state.lexer, 50, 4 );
    if( state.lexer._type  == 26 ){
    consume( state );
    scan( state.lexer, 52, 4 );
    if( state.lexer._type  == 52 ){
        var fk1 = state.fork( db );;
        fk1.push_fn( branch_57ed90dcf3964005, 9 );
        state.push_fn( branch_6a36e12223af8ace, 9 );
        return 0
    } else if( state.lexer._type  == 5 ){
        state.push_fn( set_production /*9*/, 9 );
        consume( state );
        scan( state.lexer, 53, 4 );
        if( ( state.lexer._type  == 5 ) ){
            consume( state );
            add_reduce( state, 3, 25 );
            return 0
        };
        return - 1
    }
} else if( state.lexer._type  == 27 ){
    consume( state );
    scan( state.lexer, 54, 4 );
    if( state.lexer._type  == 20 ){
        state.push_fn( set_production /*9*/, 9 );
        consume( state );
        scan( state.lexer, 55, 4 );
        if( ( state.lexer._type  == 28 ) ){
            consume( state );
            state.push_fn( branch_1ac4137dc88a80cf, 9 );
            return hc_sequence_instruction_group_96_0_( state, db, 0 )
        };
        return - 1
    } else if( state.lexer._type  == 34 ){
        consume( state );
        scan( state.lexer, 56, 4 );
        if( state.lexer._type  == 35 ){
            state.push_fn( set_production /*9*/, 9 );
            consume( state );
            scan( state.lexer, 53, 4 );
            if( ( state.lexer._type  == 5 ) ){
                consume( state );
                add_reduce( state, 4, 31 );
                return 0
            };
            return - 1
        } else if( state.lexer._type  == 36 ){
            state.push_fn( set_production /*9*/, 9 );
            consume( state );
            state.push_fn( branch_be6dcc4e08394b03, 9 );
            return hc_sequence_instruction_group_96_0_( state, db, 0 )
        }
    }
} else if( state.lexer._type  == 29 ){
    state.push_fn( set_production /*9*/, 9 );
    consume( state );
    scan( state.lexer, 55, 4 );
    if( ( state.lexer._type  == 28 ) ){
        consume( state );
        scan( state.lexer, 20, 4 );
        if( ( state.lexer._type  == 21 ) ){
            consume( state );
            state.push_fn( branch_cd71f9ac7daab8bf, 9 );
            return hc_sequence_instruction_list_101( state, db, 0 )
        }
    };
    return - 1
} else if( state.lexer._type  == 30 ){
    consume( state );
    scan( state.lexer, 57, 4 );
    if( state.lexer._type  == 31 ){
        state.push_fn( set_production /*9*/, 9 );
        consume( state );
        scan( state.lexer, 58, 4 );
        if( ( state.lexer._type  == 32 ) ){
            consume( state );
            state.push_fn( branch_3ef6c5cb45dcabc3, 9 );
            return hc_token_id_list( state, db, 0 )
        };
        return - 1
    } else if( state.lexer._type  == 32 ){
        state.push_fn( set_production /*9*/, 9 );
        consume( state );
        state.push_fn( branch_3665b7f6699a1e7a, 9 );
        return hc_token_id_list( state, db, 0 )
    }
} else if( state.lexer._type  == 33 ){
    state.push_fn( set_production /*9*/, 9 );
    consume( state );
    scan( state.lexer, 53, 4 );
    if( ( state.lexer._type  == 5 ) ){
        consume( state );
        add_reduce( state, 2, 30 );
        return 0
    };
    return - 1
} else if( state.lexer._type  == 37 ){
    state.push_fn( set_production /*9*/, 9 );
    consume( state );
    add_reduce( state, 1, 33 );
    return 0
} else if( state.lexer._type  == 38 ){
    state.push_fn( set_production /*9*/, 9 );
    consume( state );
    add_reduce( state, 1, 34 );
    return 0
} else if( state.lexer._type  == 24 ){
    state.push_fn( set_production /*9*/, 9 );
    consume( state );
    scan( state.lexer, 59, 4 );
    if( ( state.lexer._type  == 39 ) ){
        consume( state );
        add_reduce( state, 2, 35 );
        return 0
    };
    return - 1
} else if( state.lexer._type  == 40 ){
    consume( state );
    scan( state.lexer, 60, 4 );
    if( state.lexer._type  == 41 ){
        state.push_fn( set_production /*9*/, 9 );
        consume( state );
        add_reduce( state, 2, 36 );
        return 0
    } else {
        add_reduce( state, 1, 38 );
        return 9
    }
};
    return - 1
}

function hc_on_fail(state, db, prod){
    scan( state.lexer, 5, 4 );
    if( state.lexer._type  == 19 ){
    consume( state );
    scan( state.lexer, 61, 4 );
    if( state.lexer._type  == 38 ){
        consume( state );
        scan( state.lexer, 38, 4 );
        state.push_fn( branch_946f5566f9fe06f5, 0 );
        return hc_state_declaration( state, db, 0 )
    }
};
    return - 1
}

function hc_expected_symbols(state, db, prod){
    scan( state.lexer, 62, 4 );
    if( state.lexer._type  == 42 ){
    consume( state );
    scan( state.lexer, 7, 4 );
    if( state.lexer._type  == 43 ){
        consume( state );
        scan( state.lexer, 39, 4 );
        state.push_fn( branch_fe44ac138fb1f308, 0 );
        return hc_token_id_list( state, db, 0 )
    }
};
    return - 1
}

function hc_token_id_list(state, db, prod){
    scan( state.lexer, 39, 4 );
    if( state.lexer._type  == 15 ){
    consume( state );
    scan( state.lexer, 53, 4 );
    if( ( state.lexer._type  == 5 ) ){
        state.push_fn( branch_6ff5885ea3d1a206, 12 );
        return hc_token_id_list_list_141( state, db, 0 )
    }
};
    return - 1
}

function hc_production_id_list(state, db, prod){
    scan( state.lexer, 39, 4 );
    if( state.lexer._type  == 15 ){
    consume( state );
    scan( state.lexer, 53, 4 );
    if( ( state.lexer._type  == 5 ) ){
        state.push_fn( branch_da6fc1eb42935bef, 13 );
        return hc_token_id_list_list_141( state, db, 0 )
    }
};
    return - 1
}

function hc_state_hash_token(state, db, prod){
    scan( state.lexer, 63, 4 );
    if( state.lexer._type  == 3 || state.lexer._type  == 5 || state.lexer._type  == 44 || state.lexer._type  == 45 ){
    consume( state );
    return hc_state_hash_token_goto( state, db, 14 )
};
    return - 1
}

function hc_state_hash_token_goto(state, db, prod){
    scan( state.lexer, 64, 65 );
    if( state.lexer._type  == 44 ){
    state.push_fn( hc_state_hash_token_goto /*hc_state_hash_token_goto( state, db, 14 )*/, 14 );
    scan( state.lexer, 66, 65 );
    consume( state );
    add_reduce( state, 2, 0 );
    return 0
} else if( state.lexer._type  == 45 ){
    state.push_fn( hc_state_hash_token_goto /*hc_state_hash_token_goto( state, db, 14 )*/, 14 );
    scan( state.lexer, 67, 65 );
    consume( state );
    add_reduce( state, 2, 0 );
    return 0
} else if( state.lexer._type  == 5 ){
    state.push_fn( hc_state_hash_token_goto /*hc_state_hash_token_goto( state, db, 14 )*/, 14 );
    scan( state.lexer, 68, 65 );
    consume( state );
    add_reduce( state, 2, 0 );
    return 0
} else if( state.lexer._type  == 3 ){
    state.push_fn( hc_state_hash_token_goto /*hc_state_hash_token_goto( state, db, 14 )*/, 14 );
    scan( state.lexer, 69, 65 );
    consume( state );
    add_reduce( state, 2, 0 );
    return 0
};
    return ( prod  == 14 ) ? prod  : - 1
}

function hc_comment(state, db, prod){
    scan( state.lexer, 70, 4 );
    if( state.lexer._type  == 46 ){
    consume( state );
    scan( state.lexer, 71, 65 );
    if( state.lexer._type  == 47 ){
        state.push_fn( set_production /*15*/, 15 );
        consume( state );
        add_reduce( state, 2, 0 );
        return 0
    } else {
        state.push_fn( set_production /*15*/, 15 );
        state.push_fn( branch_75fbcc406d1001cb, 15 );
        return hc_comment_list_172( state, db, 0 )
    }
};
    return - 1
}

function hc_symbols__production_symbol(state, db, prod){
    scan( state.lexer, 37, 9 );
    if( state.lexer._type  == 48 ){
    consume( state );
    scan( state.lexer, 9, 9 );
    add_reduce( state, 1, 46 );
    return 16
};
    return - 1
}

function hc_symbols__identifier_syms(state, db, prod){
    scan( state.lexer, 72, 9 );
    if( state.lexer._type  == 44 || state.lexer._type  == 3 ){
    consume( state );
    return hc_symbols__identifier_syms_goto( state, db, 17 )
};
    return - 1
}

function hc_symbols__identifier_syms_goto(state, db, prod){
    scan( state.lexer, 73, 0 );
    if( state.lexer._type  == 44 ){
    state.push_fn( hc_symbols__identifier_syms_goto /*hc_symbols__identifier_syms_goto( state, db, 17 )*/, 17 );
    scan( state.lexer, 74, 0 );
    consume( state );
    add_reduce( state, 2, 47 );
    return 0
} else if( state.lexer._type  == 3 ){
    state.push_fn( hc_symbols__identifier_syms_goto /*hc_symbols__identifier_syms_goto( state, db, 17 )*/, 17 );
    scan( state.lexer, 75, 0 );
    consume( state );
    add_reduce( state, 2, 47 );
    return 0
} else if( state.lexer._type  == 5 ){
    state.push_fn( hc_symbols__identifier_syms_goto /*hc_symbols__identifier_syms_goto( state, db, 17 )*/, 17 );
    scan( state.lexer, 76, 0 );
    consume( state );
    add_reduce( state, 2, 47 );
    return 0
};
    return ( prod  == 17 ) ? prod  : - 1
}

function hc_symbols__imported_production_symbol(state, db, prod){
    scan( state.lexer, 37, 9 );
    if( state.lexer._type  == 48 ){
    consume( state );
    scan( state.lexer, 77, 9 );
    if( ( state.lexer._type  == 49 ) ){
        consume( state );
        scan( state.lexer, 37, 9 );
        if( ( state.lexer._type  == 48 ) ){
            consume( state );
            add_reduce( state, 3, 48 );
            return 18
        }
    }
};
    return - 1
}

function hc_functions__referenced_function(state, db, prod){
    state.push_fn( branch_b173afe32fa81326, 19 );
    return hc_functions__referenced_function_group_195_0_( state, db, 0 )
}

function hc_functions__js_function_start_symbol(state, db, prod){
    scan( state.lexer, 78, 9 );
    if( state.lexer._type  == 52 ){
    consume( state );
    scan( state.lexer, 9, 9 );
    add_reduce( state, 1, 50 );
    return 20
};
    return - 1
}

function hc_symbols__identifier(state, db, prod){
    scan( state.lexer, 37, 9 );
    if( state.lexer._type  == 48 ){
    consume( state );
    scan( state.lexer, 9, 9 );
    return 21
};
    return - 1
}

function hc_functions__js_data(state, db, prod){
    scan( state.lexer, 79, 14 );
    if( state.lexer._type  == 50 ){
    state.push_fn( hc_functions__js_data_goto /*hc_functions__js_data_goto( state, db, 22 )*/, 22 );
    state.push_fn( set_production /*0*/, 22 );
    return hc_functions__js_data_block( state, db, 0 )
} else if( isTokenActive( state.lexer._type, 80 ) ){
    state.push_fn( hc_functions__js_data_goto /*hc_functions__js_data_goto( state, db, 22 )*/, 22 );
    state.push_fn( set_production /*0*/, 22 );
    return hc_functions__js_primitive( state, db, 0 )
} else if( state.lexer._type  == 1 ){
    state.push_fn( hc_functions__js_data_goto /*hc_functions__js_data_goto( state, db, 22 )*/, 22 );
    consume( state );
    return 0
};
    return - 1
}

function hc_functions__js_data_goto(state, db, prod){
    scan( state.lexer, 31, 14 );
    if( state.lexer._type  == 50 ){
    state.push_fn( hc_functions__js_data_goto /*hc_functions__js_data_goto( state, db, 22 )*/, 22 );
    scan( state.lexer, 8, 9 );
    if( ( state.lexer._type  == 50 ) ){
        state.push_fn( branch_5c6a3c1bfd4ff540, 22 );
        return hc_functions__js_data_block( state, db, 0 )
    };
    return - 1
} else if( state.lexer._type  == 51 ){
    return 22
} else if( isTokenActive( state.lexer._type, 80 ) ){
    state.push_fn( hc_functions__js_data_goto /*hc_functions__js_data_goto( state, db, 22 )*/, 22 );
    scan( state.lexer, 81, 14 );
    if( ( isTokenActive( state.lexer._type, 80 ) ) ){
        state.push_fn( branch_5c6a3c1bfd4ff540, 22 );
        return hc_functions__js_primitive( state, db, 0 )
    };
    return - 1
};
    return ( prod  == 22 ) ? prod  : - 1
}

function hc_functions__js_primitive(state, db, prod){
    scan( state.lexer, 81, 14 );
    if( state.lexer._type  == 53 ){
    state.push_fn( set_production /*23*/, 23 );
    state.push_fn( set_production /*0*/, 23 );
    return hc_symbols__generated_symbol( state, db, 0 )
} else if( state.lexer._type  == 54 ){
    state.push_fn( set_production /*23*/, 23 );
    state.push_fn( set_production /*0*/, 23 );
    return hc_symbols__literal_symbol( state, db, 0 )
} else if( state.lexer._type  == 55 ){
    state.push_fn( set_production /*23*/, 23 );
    state.push_fn( set_production /*0*/, 23 );
    return hc_symbols__escaped_symbol( state, db, 0 )
} else if( state.lexer._type  == 56 ){
    state.push_fn( set_production /*23*/, 23 );
    state.push_fn( branch_39faa76b84957c22, 23 );
    return hc_symbols__EOF_symbol( state, db, 0 )
} else if( state.lexer._type  == 3 || state.lexer._type  == 5 || state.lexer._type  == 8 ){
    consume( state );
    return 23
} else if( state.lexer._type  == 2 ){
    var pk = state.lexer.copy_in_place(  );;
    pk.next(  );
    scan( pk, 31, 14 );
    if( isTokenActive( pk._type, 32 ) ){
        var fk1 = state.fork( db );;
        fk1.push_fn( branch_541138437f11a365, 23 );
        state.push_fn( branch_16017c1e108a3870, 23 );
        return 0
    }
};
    return - 1
}

function hc_symbols__generated_symbol(state, db, prod){
    scan( state.lexer, 82, 9 );
    if( state.lexer._type  == 53 ){
    consume( state );
    scan( state.lexer, 37, 9 );
    if( ( state.lexer._type  == 48 ) ){
        consume( state );
        add_reduce( state, 2, 52 );
        return 24
    }
};
    return - 1
}

function hc_symbols__literal_symbol(state, db, prod){
    scan( state.lexer, 83, 9 );
    if( state.lexer._type  == 54 ){
    consume( state );
    scan( state.lexer, 84, 9 );
    state.push_fn( branch_c816d1b27bf1930a, 0 );
    return hc_symbols__literal_symbol_list_221( state, db, 0 )
} else if( state.lexer._type  == 2 ){
    state.push_fn( set_production /*25*/, 25 );
    consume( state );
    add_reduce( state, 1, 54 );
    return 0
};
    return - 1
}

function hc_symbols__sym_delimiter(state, db, prod){
    scan( state.lexer, 85, 0 );
    if( state.lexer._type  == 8 || state.lexer._type  == 1 || state.lexer._type  == 7 ){
    consume( state );
    return 26
};
    return - 1
}

function hc_symbols__escaped_symbol(state, db, prod){
    scan( state.lexer, 86, 9 );
    if( state.lexer._type  == 55 ){
    consume( state );
    scan( state.lexer, 87, 9 );
    if( ( state.lexer._type  == 5 || state.lexer._type  == 3 || state.lexer._type  == 2 ) ){
        state.push_fn( branch_0ba42b5833d24aa7, 27 );
        return hc_symbols__escaped_symbol_list_228( state, db, 0 )
    }
};
    return - 1
}

function hc_symbols__EOF_symbol(state, db, prod){
    scan( state.lexer, 88, 9 );
    if( state.lexer._type  == 56 ){
    consume( state );
    scan( state.lexer, 14, 14 );
    add_reduce( state, 1, 56 );
    return 28
};
    return - 1
}

function hc_functions__js_data_block(state, db, prod){
    scan( state.lexer, 8, 9 );
    if( state.lexer._type  == 50 ){
    consume( state );
    scan( state.lexer, 79, 14 );
    if( ( isTokenActive( state.lexer._type, 89 ) ) ){
        state.push_fn( branch_5bdea3c33762688e, 29 );
        return hc_functions__js_data( state, db, 0 )
    }
};
    return - 1
}

function hc_functions__reduce_function(state, db, prod){
    state.push_fn( branch_b38a7b278d28538d, 0 );
    return hc_functions__js_function_start_symbol( state, db, 0 )
}

function hc_top_level_instructions_list_49(state, db, prod){
    state.push_fn( branch_c3117067296bad80, 31 );
    return hc_prod_branch_instruction( state, db, 0 )
}

function hc_top_level_instructions_list_49_goto(state, db, prod){
    while( true ) {
        switch(prod){
            case 31: 
            {
                scan( state.lexer, 33, 4 );
                if( state.lexer._type  == 19 ){
                    var pk = state.lexer.copy_in_place(  );;
                    pk.next(  );
                    scan( pk, 51, 4 );
                    if( pk._type  == 20 ){
                        state.lexer._type  = 19;
                        state.push_fn( hc_top_level_instructions_list_49_goto /*hc_top_level_instructions_list_49_goto( state, db, 31 )*/, 31 );
                        scan( state.lexer, 5, 4 );
                        if( ( state.lexer._type  == 19 ) ){
                            state.push_fn( branch_a8d6ab6ebc23eb1e, 31 );
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
    return ( prod  == 31 ) ? prod  : - 1
}

function hc_top_level_instructions_list_50(state, db, prod){
    state.push_fn( branch_69a216e1c5e8176c, 32 );
    return hc_token_branch_instruction( state, db, 0 )
}

function hc_top_level_instructions_list_50_goto(state, db, prod){
    while( true ) {
        switch(prod){
            case 32: 
            {
                scan( state.lexer, 44, 4 );
                if( state.lexer._type  == 23 || state.lexer._type  == 24 ){
                    state.push_fn( hc_top_level_instructions_list_50_goto /*hc_top_level_instructions_list_50_goto( state, db, 32 )*/, 32 );
                    scan( state.lexer, 45, 4 );
                    if( ( state.lexer._type  == 23 || state.lexer._type  == 24 ) ){
                        state.push_fn( branch_a8d6ab6ebc23eb1e, 32 );
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
    return ( prod  == 32 ) ? prod  : - 1
}

function hc_instruction_sequence_list_52(state, db, prod){
    state.push_fn( branch_9fc4951f629a2b5b, 33 );
    return hc_sequence_instruction( state, db, 0 )
}

function hc_instruction_sequence_list_52_goto(state, db, prod){
    while( true ) {
        switch(prod){
            case 33: 
            {
                scan( state.lexer, 90, 4 );
                if( state.lexer._type  == 17 ){
                    var pk = state.lexer.copy_in_place(  );;
                    pk.next(  );
                    scan( pk, 46, 4 );
                    if( isTokenActive( pk._type, 47 ) ){
                        state.lexer._type  = 17;
                        state.push_fn( hc_instruction_sequence_list_52_goto /*hc_instruction_sequence_list_52_goto( state, db, 33 )*/, 33 );
                        scan( state.lexer, 48, 4 );
                        consume( state );
                        state.push_fn( branch_19f6f89366e776c9, 33 );
                        return hc_sequence_instruction( state, db, 0 )
                    } else if( pk._type  == 25 ){
                        return 33
                    }
                }
            }
            break;
            default: 
            break
        };
        break
    };
    return ( prod  == 33 ) ? prod  : - 1
}

function hc_instruction_sequence_list_55(state, db, prod){
    state.push_fn( branch_ccc42ce225111f12, 34 );
    return hc_goto_instruction( state, db, 0 )
}

function hc_instruction_sequence_list_55_goto(state, db, prod){
    while( true ) {
        switch(prod){
            case 34: 
            {
                scan( state.lexer, 90, 4 );
                if( state.lexer._type  == 17 ){
                    var pk = state.lexer.copy_in_place(  );;
                    pk.next(  );
                    scan( pk, 18, 4 );
                    if( pk._type  == 25 ){
                        state.lexer._type  = 17;
                        state.push_fn( hc_instruction_sequence_list_55_goto /*hc_instruction_sequence_list_55_goto( state, db, 34 )*/, 34 );
                        scan( state.lexer, 48, 4 );
                        consume( state );
                        state.push_fn( branch_19f6f89366e776c9, 34 );
                        return hc_goto_instruction( state, db, 0 )
                    } else if( pk._type  == 62 ){
                        var fk1 = state.fork( db );;
                        fk1.push_fn( set_production /*34*/, 34 );
                        state.push_fn( set_production /*34*/, 34 );
                        return 0
                    }
                } else {
                    return 34
                }
            }
            break;
            default: 
            break
        };
        break
    };
    return ( prod  == 34 ) ? prod  : - 1
}

function hc_instruction_sequence_group_56_0_(state, db, prod){
    scan( state.lexer, 48, 4 );
    if( state.lexer._type  == 17 ){
    consume( state );
    scan( state.lexer, 91, 4 );
    if( ( state.lexer._type  == 62 ) ){
        consume( state );
        scan( state.lexer, 38, 4 );
        if( ( state.lexer._type  == 14 ) ){
            consume( state );
            add_reduce( state, 3, 63 );
            return 35
        }
    }
};
    return - 1
}

function hc_instruction_sequence_group_59_0_(state, db, prod){
    scan( state.lexer, 48, 4 );
    if( state.lexer._type  == 17 ){
    consume( state );
    scan( state.lexer, 91, 4 );
    if( ( state.lexer._type  == 62 ) ){
        consume( state );
        scan( state.lexer, 38, 4 );
        if( ( state.lexer._type  == 14 ) ){
            consume( state );
            add_reduce( state, 3, 64 );
            return 36
        }
    }
};
    return - 1
}

function hc_sequence_instruction_group_96_0_(state, db, prod){
    scan( state.lexer, 53, 4 );
    if( state.lexer._type  == 5 ){
    consume( state );
    scan( state.lexer, 4, 4 );
    add_reduce( state, 1, 65 );
    return 37
};
    return - 1
}

function hc_sequence_instruction_list_101(state, db, prod){
    state.push_fn( branch_0918c9a5db47237b, 38 );
    return hc_state_reference( state, db, 0 )
}

function hc_sequence_instruction_list_101_goto(state, db, prod){
    scan( state.lexer, 92, 4 );
    if( state.lexer._type  == 63 ){
    state.push_fn( hc_sequence_instruction_list_101_goto /*hc_sequence_instruction_list_101_goto( state, db, 38 )*/, 38 );
    scan( state.lexer, 93, 4 );
    consume( state );
    state.push_fn( branch_19f6f89366e776c9, 38 );
    return hc_state_reference( state, db, 0 )
};
    return ( prod  == 38 ) ? prod  : - 1
}

function hc_expected_symbols_group_135_0_(state, db, prod){
    scan( state.lexer, 94, 4 );
    if( state.lexer._type  == 64 ){
    consume( state );
    scan( state.lexer, 39, 4 );
    if( ( state.lexer._type  == 15 ) ){
        state.push_fn( branch_c4ca39c6ca78845d, 39 );
        return hc_token_id_list( state, db, 0 )
    }
};
    return - 1
}

function hc_token_id_list_list_141(state, db, prod){
    state.push_fn( branch_63f05831381f57bc, 40 );
    return hc_sequence_instruction_group_96_0_( state, db, 0 )
}

function hc_token_id_list_list_141_goto(state, db, prod){
    scan( state.lexer, 95, 4 );
    if( state.lexer._type  == 11 ){
    return 40
} else if( state.lexer._type  == 5 ){
    state.push_fn( hc_token_id_list_list_141_goto /*hc_token_id_list_list_141_goto( state, db, 40 )*/, 40 );
    scan( state.lexer, 53, 4 );
    if( ( state.lexer._type  == 5 ) ){
        state.push_fn( branch_a8d6ab6ebc23eb1e, 40 );
        return hc_sequence_instruction_group_96_0_( state, db, 0 )
    };
    return - 1
};
    return ( prod  == 40 ) ? prod  : - 1
}

function hc_comment_list_172(state, db, prod){
    scan( state.lexer, 96, 65 );
    if( isTokenActive( state.lexer._type, 87 ) ){
    consume( state );
    add_reduce( state, 1, 19 );
    return hc_comment_list_172_goto( state, db, 41 )
};
    return - 1
}

function hc_comment_list_172_goto(state, db, prod){
    scan( state.lexer, 71, 65 );
    if( state.lexer._type  == 2 ){
    state.push_fn( hc_comment_list_172_goto /*hc_comment_list_172_goto( state, db, 41 )*/, 41 );
    scan( state.lexer, 97, 4 );
    consume( state );
    add_reduce( state, 2, 61 );
    return 0
} else if( state.lexer._type  == 8 ){
    state.push_fn( hc_comment_list_172_goto /*hc_comment_list_172_goto( state, db, 41 )*/, 41 );
    scan( state.lexer, 4, 98 );
    consume( state );
    add_reduce( state, 2, 61 );
    return 0
} else if( state.lexer._type  == 7 ){
    state.push_fn( hc_comment_list_172_goto /*hc_comment_list_172_goto( state, db, 41 )*/, 41 );
    scan( state.lexer, 4, 99 );
    consume( state );
    add_reduce( state, 2, 61 );
    return 0
} else if( state.lexer._type  == 3 ){
    state.push_fn( hc_comment_list_172_goto /*hc_comment_list_172_goto( state, db, 41 )*/, 41 );
    scan( state.lexer, 100, 4 );
    consume( state );
    add_reduce( state, 2, 61 );
    return 0
} else if( state.lexer._type  == 5 ){
    state.push_fn( hc_comment_list_172_goto /*hc_comment_list_172_goto( state, db, 41 )*/, 41 );
    scan( state.lexer, 53, 4 );
    consume( state );
    add_reduce( state, 2, 61 );
    return 0
};
    return ( prod  == 41 ) ? prod  : - 1
}

function hc_functions__referenced_function_group_195_0_(state, db, prod){
    state.push_fn( branch_675f3230ecb5bf2b, 42 );
    return hc_functions__js_function_start_symbol( state, db, 0 )
}

function hc_symbols__literal_symbol_list_221(state, db, prod){
    scan( state.lexer, 101, 4 );
    if( state.lexer._type  == 5 || state.lexer._type  == 3 ){
    consume( state );
    add_reduce( state, 1, 67 );
    return hc_symbols__literal_symbol_list_221_goto( state, db, 43 )
};
    return - 1
}

function hc_symbols__literal_symbol_list_221_goto(state, db, prod){
    while( true ) {
        switch(prod){
            case 43: 
            {
                scan( state.lexer, 30, 0 );
                if( state.lexer._type  == 5 ){
                    var pk = state.lexer.copy_in_place(  );;
                    pk.next(  );
                    scan( pk, 30, 0 );
                    if( isTokenActive( pk._type, 30 ) ){
                        state.lexer._type  = 5;
                        state.push_fn( hc_symbols__literal_symbol_list_221_goto /*hc_symbols__literal_symbol_list_221_goto( state, db, 43 )*/, 43 );
                        scan( state.lexer, 53, 4 );
                        consume( state );
                        add_reduce( state, 2, 47 );
                        return 0
                    }
                } else if( state.lexer._type  == 3 ){
                    var pk = state.lexer.copy_in_place(  );;
                    pk.next(  );
                    scan( pk, 30, 0 );
                    if( isTokenActive( pk._type, 30 ) ){
                        state.lexer._type  = 3;
                        state.push_fn( hc_symbols__literal_symbol_list_221_goto /*hc_symbols__literal_symbol_list_221_goto( state, db, 43 )*/, 43 );
                        scan( state.lexer, 100, 4 );
                        consume( state );
                        add_reduce( state, 2, 47 );
                        return 0
                    }
                } else if( state.lexer._type  == 8 ){
                    return 43
                }
            }
            break;
            default: 
            break
        };
        break
    };
    return ( prod  == 43 ) ? prod  : - 1
}

function hc_symbols__escaped_symbol_list_228(state, db, prod){
    scan( state.lexer, 96, 4 );
    if( state.lexer._type  == 5 || state.lexer._type  == 3 || state.lexer._type  == 2 ){
    consume( state );
    add_reduce( state, 1, 67 );
    return hc_symbols__escaped_symbol_list_228_goto( state, db, 44 )
};
    return - 1
}

function hc_symbols__escaped_symbol_list_228_goto(state, db, prod){
    scan( state.lexer, 102, 0 );
    if( state.lexer._type  == 5 ){
    state.push_fn( hc_symbols__escaped_symbol_list_228_goto /*hc_symbols__escaped_symbol_list_228_goto( state, db, 44 )*/, 44 );
    scan( state.lexer, 53, 4 );
    consume( state );
    add_reduce( state, 2, 47 );
    return 0
} else if( state.lexer._type  == 3 ){
    state.push_fn( hc_symbols__escaped_symbol_list_228_goto /*hc_symbols__escaped_symbol_list_228_goto( state, db, 44 )*/, 44 );
    scan( state.lexer, 100, 4 );
    consume( state );
    add_reduce( state, 2, 47 );
    return 0
} else if( state.lexer._type  == 2 ){
    state.push_fn( hc_symbols__escaped_symbol_list_228_goto /*hc_symbols__escaped_symbol_list_228_goto( state, db, 44 )*/, 44 );
    scan( state.lexer, 97, 4 );
    consume( state );
    add_reduce( state, 2, 47 );
    return 0
};
    return ( prod  == 44 ) ? prod  : - 1
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

    const reduce_functions = [(_,s)=>s[s.length-1], (env, sym, pos)=> ({type:"state",id:sym[0],instructions:sym[1],fail:sym[2],symbol_meta:sym[3],pos}) /*0*/,
(env, sym, pos)=> ({type:"state",id:sym[0],instructions:sym[1],symbol_meta:sym[2],pos}) /*1*/,
(env, sym, pos)=> ({type:"state",id:sym[0],instructions:sym[1],fail:sym[2],pos}) /*2*/,
(env, sym, pos)=> ({type:"state",id:sym[0],instructions:sym[1],pos}) /*3*/,
(env, sym, pos)=> ({type:"state",id:sym[2],instructions:sym[4],fail:sym[5],symbol_meta:sym[6],pos}) /*4*/,
(env, sym, pos)=> ({type:"state",id:sym[1],instructions:sym[3],fail:sym[4],symbol_meta:sym[5],pos}) /*5*/,
(env, sym, pos)=> ({type:"state",id:sym[2],instructions:sym[4],symbol_meta:sym[5],pos}) /*6*/,
(env, sym, pos)=> ({type:"state",id:sym[2],instructions:sym[4],fail:sym[5],pos}) /*7*/,
(env, sym, pos)=> ({type:"state",id:sym[1],instructions:sym[3],symbol_meta:sym[4],pos}) /*8*/,
(env, sym, pos)=> ({type:"state",id:sym[1],instructions:sym[3],fail:sym[4],pos}) /*9*/,
(env, sym, pos)=> ({type:"state",id:sym[2],instructions:sym[4],pos}) /*10*/,
(env, sym, pos)=> ({type:"state",id:sym[1],instructions:sym[3],pos}) /*11*/,
(env, sym, pos)=> (sym[2]) /*12*/,
(env, sym, pos)=> (sym[3]) /*13*/,
(env, sym, pos)=> ([...sym[0],...sym[2],sym[3]]) /*14*/,
(env, sym, pos)=> ([...sym[0],sym[1]]) /*15*/,
(env, sym, pos)=> ([...sym[0],...sym[2]]) /*16*/,
(env, sym, pos)=> ([...sym[0]]) /*17*/,
(env, sym, pos)=> ([sym[0]]) /*18*/,
(env, sym, pos)=> ([]) /*19*/,
(env, sym, pos)=> ({type:"prod",ids:sym[2],instructions:sym[4],pos}) /*20*/,
(env, sym, pos)=> ({type:"peek",ids:sym[1],instructions:sym[3],pos}) /*21*/,
(env, sym, pos)=> ({type:"assert",ids:sym[1],instructions:sym[3],pos}) /*22*/,
(env, sym, pos)=> ({type:"goto",state:sym[1],pos}) /*23*/,
(env, sym, pos)=> ({type:"reduce",len:parseInt(sym[1]),reduce_fn:parseInt(sym[2]),pos}) /*24*/,
(env, sym, pos)=> ({type:"reduce",len:-1,reduce_fn:sym[1],pos}) /*25*/,
(env, sym, pos)=> ({type:"set-prod",id:sym[3],pos}) /*26*/,
(env, sym, pos)=> ({type:"fork-to",states:sym[3],pos}) /*27*/,
(env, sym, pos)=> ({type:sym[1]?"scan-back-until":"scan-until",ids:sym[3],pos}) /*28*/,
(env, sym, pos)=> ({type:"pop",len:parseInt(sym[1]),pos}) /*29*/,
(env, sym, pos)=> ({type:"token-length",len:parseInt(sym[3]),pos}) /*30*/,
(env, sym, pos)=> ({type:"token-id",id:sym[3],pos}) /*31*/,
(env, sym, pos)=> ({type:"pass",pos}) /*32*/,
(env, sym, pos)=> ({type:"fail",pos}) /*33*/,
(env, sym, pos)=> ({type:"assert-left",pos}) /*34*/,
(env, sym, pos)=> ({type:"consume",EMPTY:!!sym[1],pos}) /*35*/,
(env, sym, pos)=> ({type:null?"scan-back-until":"scan-until",ids:sym[2],pos}) /*36*/,
(env, sym, pos)=> ({type:"consume",pos}) /*37*/,
(env, sym, pos)=> ({type:"on-fail-state",id:sym[2],instructions:sym[3],symbol_meta:sym[5],fail:sym[4],pos}) /*38*/,
(env, sym, pos)=> ({type:"on-fail-state",id:sym[2],instructions:sym[3],symbol_meta:sym[4],pos}) /*39*/,
(env, sym, pos)=> ({type:"on-fail-state",id:sym[2],instructions:sym[3],fail:sym[4],pos}) /*40*/,
(env, sym, pos)=> ({type:"on-fail-state",id:sym[2],instructions:sym[3],pos}) /*41*/,
(env, sym, pos)=> ({type:"symbols",expected:sym[2],skipped:sym[3]||[],pos}) /*42*/,
(env, sym, pos)=> ({type:"symbols",expected:sym[2],skipped:null||[],pos}) /*43*/,
(env, sym, pos)=> (sym[1]) /*44*/,
(env, sym, pos)=> ({type:"sym-production",name:sym[0],production:null,val:-1,pos:pos,meta:false}) /*45*/,
(env, sym, pos)=> (sym[0]+sym[1]) /*46*/,
(env, sym, pos)=> ({type:"sym-production-import",module:sym[0],production:sym[2],name:"",pos:pos,meta:false}) /*47*/,
(env, sym, pos)=> ({type:"ref-function",id:sym[1],txt:sym[3]}) /*48*/,
(env, sym, pos)=> ("FN:F") /*49*/,
(env, sym, pos)=> ("<--"+sym[0].type+"^^"+sym[0].val+"-->") /*50*/,
(env, sym, pos)=> ({type:"generated",val:sym[1],pos:pos,meta:false}) /*51*/,
(env, sym, pos)=> ({type:"exclusive-literal",val:""+sym[1],pos:pos,meta:false}) /*52*/,
(env, sym, pos)=> ({type:"literal",val:sym[0],pos:pos,meta:false}) /*53*/,
(env, sym, pos)=> ({type:"literal",val:sym[1],pos:pos,meta:false}) /*54*/,
(env, sym, pos)=> ({type:"eof",val:"END_OF_FILE",pos:pos,meta:false}) /*55*/,
(env, sym, pos)=> (sym[0]+sym[1]+sym[2]) /*56*/,
(env, sym, pos)=> ({type:"RETURNED",txt:sym[3],name:"",env:false,ref:"",IS_CONDITION:true}) /*57*/,
(env, sym, pos)=> ({type:"env-function-reference",ref:sym[3]}) /*58*/,
(env, sym, pos)=> ({type:"local-function-reference",ref:sym[3]}) /*59*/,
(env, sym, pos)=> ((sym[0].push(sym[1]),sym[0])) /*60*/,
(env, sym, pos)=> ((sym[0].push(sym[2]),sym[0])) /*61*/,
(env, sym, pos)=> ({type:"repeat-state"}) /*62*/,
(env, sym, pos)=> ({type:"repeat-state",pos}) /*63*/,
(env, sym, pos)=> (parseInt(sym[0])) /*64*/,
(env, sym, pos)=> (sym[0]+"GG") /*65*/,
(env, sym, pos)=> (sym[0]+"") /*66*/];

    export default ParserFactory
        (reduce_functions, undefined, recognizer_initializer, {state_ir:0});