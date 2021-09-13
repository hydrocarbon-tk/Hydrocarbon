
import {
    ParserFactoryGamma as ParserFactory,
    fillByteBufferWithUTF8FromString,
    ParserCore
} from "@candlelib/hydrocarbon";

const recognizer_initializer = (() => {

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


    var token_lookup = new Uint32Array([40, 6144, 8, 2048, 0, 8192, 467894656, 536871054, 384, 536870912, 426, 0, 1048960, 536870912, 9605506, 536871424, 131458, 536871424, 454201730, 536871566, 8388992, 603979776, 8388992, 536870912, 384, 65536, 384, 0, 467898754, 536871566, 131456, 536870912, 384, 536871936, 384, 536887296, 2432, 536870912, 135554, 536871424, 384, 4718592, 384, 3178496, 20866, 805306880, 135552, 536871424, 524672, 536870912, 4480, 536870912, 467894658, 536871566, 4480, 536871424, 416, 536870912, 384, 32768, 896, 536870912, 1408, 536870912, 8576, 536870912, 16768, 536870912, 461471744, 142, 461472128, 536871054, 452984832, 142, 452985216, 536871054, 262528, 536870912, 6291840, 536870912, 416, 537001984, 2147746176, 536870976, 67109248, 536870912, 384, 536870913, 420, 58720256, 1610613120, 536870912, 1073742208, 536870912, 384, 536870928, 384, 536870944, 1216898, 536871680, 384, 536870916, 384, 536871424, 424, 536877056, 40, 536877056, 0, 536870912, 0, 536872960, 0, 536875008, 32, 536870912, 8, 536870912, 384, 536879104, 428, 536887296, 384, 131072, 384, 262144, 392, 2048, 40, 2048, 0, 2048, 8, 0, 32, 0, 430, 32768, 128, 0, 428, 98304, 428, 0, 302, 32768, 388, 58720256, 384, 8388608, 388, 16777216, 424, 0, 386, 0, 384, 33554432, 6427010, 536871424, 1216898, 536871424, 461373824, 603979918, 33152, 536870912, 384, 603979776, 1048960, 671088640, 384, 671088640, 2464, 536870912, 384, 805306368, 428, 536870912, 388, 536870912, 128, 536870912, 256, 536870912, 392, 536870912, 424, 536870912, 430, 0]);;
    var token_sequence_lookup = new Uint8Array([60, 91, 93, 62, 40, 41, 115, 121, 109, 98, 111, 108, 115, 58, 95, 45, 47, 42, 47, 123, 125, 102, 111, 114, 107, 94, 61, 62, 103, 111, 116, 111, 116, 111, 107, 101, 110, 92, 44, 69, 78, 68, 95, 79, 70, 95, 80, 82, 79, 68, 85, 67, 84, 73, 79, 78, 111, 110, 112, 114, 111, 100, 97, 115, 115, 101, 114, 116, 114, 101, 100, 117, 99, 101, 98, 97, 99, 107, 117, 110, 116, 105, 108, 105, 100, 110, 111, 116, 104, 105, 110, 103, 119, 105, 116, 104, 105, 110, 99, 111, 110, 115, 117, 109, 101, 120, 112, 101, 99, 116, 101, 100, 102, 97, 105, 108, 103, 58, 116, 104, 101, 110, 115, 107, 105, 112, 112, 101, 100, 112, 101, 101, 107, 114, 101, 116, 117, 114, 110, 102, 58, 116, 58, 115, 99, 111, 112, 101, 115, 116, 97, 116, 101, 115, 99, 97, 110, 115, 101, 116, 112, 97, 115, 115, 114, 101, 112, 101, 97, 116]);;
    function isTokenActive(token_id, row) {
        var index = (row * 2) + (token_id >> 5);;
        var shift = 1 << (31 & (token_id));;
        return (token_lookup[index] & shift) != 0;
    };
    function scan_core(lexer, tk_row) {
        switch ((lexer.get_byte_at(lexer.byte_offset) & 127)) {
            case 40:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 40) {
                        if (isTokenActive(19, tk_row)) {
                            lexer.setToken(19, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 41:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 41) {
                        if (isTokenActive(20, tk_row)) {
                            lexer.setToken(20, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 42:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 42) {
                        if (isTokenActive(46, tk_row) && lexer.get_byte_at(lexer.byte_offset + 1) == 47) {
                            lexer.setToken(46, 2, 2);
                            return;
                        }
                    }
                }
                break;
            case 44:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 44) {
                        if (isTokenActive(59, tk_row)) {
                            lexer.setToken(59, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 45:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 45) {
                        if (isTokenActive(10, tk_row) && token_production(lexer, hc_state_hash_token, 14, 10, 1) && lexer.byte_length > 1) {
                            return;
                        } else if (isTokenActive(44, tk_row)) {
                            lexer.setToken(44, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 47:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 47) {
                        if (lexer.get_byte_at(lexer.byte_offset + 1) == 42) {
                            if (isTokenActive(61, tk_row) && token_production(lexer, hc_comment, 15, 61, 4) && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(45, tk_row)) {
                                lexer.setToken(45, 2, 2);
                                return;
                            }
                        }
                    }
                }
                break;
            case 60:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 60) {
                        if (isTokenActive(9, tk_row) && lexer.get_byte_at(lexer.byte_offset + 1) == 91) {
                            lexer.setToken(9, 2, 2);
                            return;
                        }
                    }
                }
                break;
            case 61:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 61) {
                        if (isTokenActive(53, tk_row) && lexer.get_byte_at(lexer.byte_offset + 1) == 62) {
                            lexer.setToken(53, 2, 2);
                            return;
                        }
                    }
                }
                break;
            case 62:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 62) {
                        if (isTokenActive(12, tk_row)) {
                            lexer.setToken(12, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 91:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 91) {
                        if (isTokenActive(14, tk_row)) {
                            lexer.setToken(14, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 92:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 92) {
                        if (isTokenActive(57, tk_row)) {
                            lexer.setToken(57, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 93:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 93) {
                        if (isTokenActive(11, tk_row)) {
                            lexer.setToken(11, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 94:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 94) {
                        if (isTokenActive(52, tk_row)) {
                            lexer.setToken(52, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 95:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 95) {
                        if (isTokenActive(10, tk_row) && token_production(lexer, hc_state_hash_token, 14, 10, 1) && lexer.byte_length > 1) {
                            return;
                        } else if (isTokenActive(50, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 19, 50, 2) && lexer.byte_length > 1) {
                            return;
                        } else if (isTokenActive(43, tk_row)) {
                            lexer.setToken(43, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 97:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 97) {
                        if (5 == compare(lexer, lexer.byte_offset + 1, 63, 5, token_sequence_lookup)) {
                            if (isTokenActive(10, tk_row) && token_production(lexer, hc_state_hash_token, 14, 10, 1) && lexer.byte_length > 6) {
                                return;
                            } else if (isTokenActive(50, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 19, 50, 2) && lexer.byte_length > 6) {
                                return;
                            } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 6) {
                                return;
                            } else if (isTokenActive(22, tk_row)) {
                                lexer.setToken(22, 6, 6);
                                return;
                            }
                        }
                    }
                }
                break;
            case 98:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 98) {
                        if (3 == compare(lexer, lexer.byte_offset + 1, 75, 3, token_sequence_lookup)) {
                            if (isTokenActive(10, tk_row) && token_production(lexer, hc_state_hash_token, 14, 10, 1) && lexer.byte_length > 4) {
                                return;
                            } else if (isTokenActive(50, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 19, 50, 2) && lexer.byte_length > 4) {
                                return;
                            } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 4) {
                                return;
                            } else if (isTokenActive(29, tk_row)) {
                                lexer.setToken(29, 4, 4);
                                return;
                            }
                        }
                    }
                }
                break;
            case 99:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 99) {
                        if (6 == compare(lexer, lexer.byte_offset + 1, 99, 6, token_sequence_lookup)) {
                            if (isTokenActive(10, tk_row) && token_production(lexer, hc_state_hash_token, 14, 10, 1) && lexer.byte_length > 7) {
                                return;
                            } else if (isTokenActive(50, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 19, 50, 2) && lexer.byte_length > 7) {
                                return;
                            } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 7) {
                                return;
                            } else if (isTokenActive(39, tk_row)) {
                                lexer.setToken(39, 7, 7);
                                return;
                            }
                        }
                    }
                }
                break;
            case 101:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 101) {
                        if (7 == compare(lexer, lexer.byte_offset + 1, 105, 7, token_sequence_lookup)) {
                            if (isTokenActive(10, tk_row) && token_production(lexer, hc_state_hash_token, 14, 10, 1) && lexer.byte_length > 8) {
                                return;
                            } else if (isTokenActive(50, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 19, 50, 2) && lexer.byte_length > 8) {
                                return;
                            } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 8) {
                                return;
                            } else if (isTokenActive(42, tk_row)) {
                                lexer.setToken(42, 8, 8);
                                return;
                            }
                        }
                    }
                }
                break;
            case 102:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 102) {
                        if (lexer.get_byte_at(lexer.byte_offset + 1) == 111) {
                            if (2 == compare(lexer, lexer.byte_offset + 2, 23, 2, token_sequence_lookup)) {
                                if (isTokenActive(10, tk_row) && token_production(lexer, hc_state_hash_token, 14, 10, 1) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(50, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 19, 50, 2) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(27, tk_row)) {
                                    lexer.setToken(27, 4, 4);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 97) {
                            if (2 == compare(lexer, lexer.byte_offset + 2, 114, 2, token_sequence_lookup)) {
                                if (isTokenActive(10, tk_row) && token_production(lexer, hc_state_hash_token, 14, 10, 1) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(50, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 19, 50, 2) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(34, tk_row)) {
                                    lexer.setToken(34, 4, 4);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 58) {
                            if (isTokenActive(49, tk_row)) {
                                lexer.setToken(49, 2, 2);
                                return;
                            }
                        }
                    }
                }
                break;
            case 103:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 103) {
                        if (lexer.get_byte_at(lexer.byte_offset + 1) == 111) {
                            if (2 == compare(lexer, lexer.byte_offset + 2, 30, 2, token_sequence_lookup)) {
                                if (isTokenActive(10, tk_row) && token_production(lexer, hc_state_hash_token, 14, 10, 1) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(50, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 19, 50, 2) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(23, tk_row)) {
                                    lexer.setToken(23, 4, 4);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 58) {
                            if (isTokenActive(55, tk_row)) {
                                lexer.setToken(55, 2, 2);
                                return;
                            }
                        }
                    }
                }
                break;
            case 105:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 105) {
                        if (lexer.get_byte_at(lexer.byte_offset + 1) == 100) {
                            if (isTokenActive(10, tk_row) && token_production(lexer, hc_state_hash_token, 14, 10, 1) && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(50, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 19, 50, 2) && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(32, tk_row)) {
                                lexer.setToken(32, 2, 2);
                                return;
                            }
                        }
                    }
                }
                break;
            case 110:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 110) {
                        if (2 == compare(lexer, lexer.byte_offset + 1, 86, 2, token_sequence_lookup)) {
                            if (lexer.get_byte_at(lexer.byte_offset + 3) == 104) {
                                if (3 == compare(lexer, lexer.byte_offset + 4, 89, 3, token_sequence_lookup)) {
                                    if (isTokenActive(10, tk_row) && token_production(lexer, hc_state_hash_token, 14, 10, 1) && lexer.byte_length > 7) {
                                        return;
                                    } else if (isTokenActive(50, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 19, 50, 2) && lexer.byte_length > 7) {
                                        return;
                                    } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 7) {
                                        return;
                                    } else if (isTokenActive(40, tk_row)) {
                                        lexer.setToken(40, 7, 7);
                                        return;
                                    }
                                }
                            } else if (isTokenActive(10, tk_row) && token_production(lexer, hc_state_hash_token, 14, 10, 1) && lexer.byte_length > 3) {
                                return;
                            } else if (isTokenActive(50, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 19, 50, 2) && lexer.byte_length > 3) {
                                return;
                            } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 3) {
                                return;
                            } else if (isTokenActive(35, tk_row)) {
                                lexer.setToken(35, 3, 3);
                                return;
                            }
                        }
                    }
                }
                break;
            case 111:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 111) {
                        if (lexer.get_byte_at(lexer.byte_offset + 1) == 110) {
                            if (isTokenActive(10, tk_row) && token_production(lexer, hc_state_hash_token, 14, 10, 1) && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(50, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 19, 50, 2) && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(17, tk_row)) {
                                lexer.setToken(17, 2, 2);
                                return;
                            }
                        }
                    }
                }
                break;
            case 112:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 112) {
                        if (lexer.get_byte_at(lexer.byte_offset + 1) == 114) {
                            if (2 == compare(lexer, lexer.byte_offset + 2, 60, 2, token_sequence_lookup)) {
                                if (isTokenActive(10, tk_row) && token_production(lexer, hc_state_hash_token, 14, 10, 1) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(50, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 19, 50, 2) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(18, tk_row)) {
                                    lexer.setToken(18, 4, 4);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 101) {
                            if (2 == compare(lexer, lexer.byte_offset + 2, 131, 2, token_sequence_lookup)) {
                                if (isTokenActive(10, tk_row) && token_production(lexer, hc_state_hash_token, 14, 10, 1) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(50, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 19, 50, 2) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(21, tk_row)) {
                                    lexer.setToken(21, 4, 4);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 97) {
                            if (2 == compare(lexer, lexer.byte_offset + 2, 162, 2, token_sequence_lookup)) {
                                if (isTokenActive(10, tk_row) && token_production(lexer, hc_state_hash_token, 14, 10, 1) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(50, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 19, 50, 2) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(33, tk_row)) {
                                    lexer.setToken(33, 4, 4);
                                    return;
                                }
                            }
                        }
                    }
                }
                break;
            case 114:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 114) {
                        if (lexer.get_byte_at(lexer.byte_offset + 1) == 101) {
                            if (lexer.get_byte_at(lexer.byte_offset + 2) == 100) {
                                if (3 == compare(lexer, lexer.byte_offset + 3, 71, 3, token_sequence_lookup)) {
                                    if (isTokenActive(10, tk_row) && token_production(lexer, hc_state_hash_token, 14, 10, 1) && lexer.byte_length > 6) {
                                        return;
                                    } else if (isTokenActive(50, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 19, 50, 2) && lexer.byte_length > 6) {
                                        return;
                                    } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 6) {
                                        return;
                                    } else if (isTokenActive(24, tk_row)) {
                                        lexer.setToken(24, 6, 6);
                                        return;
                                    }
                                }
                            } else if (lexer.get_byte_at(lexer.byte_offset + 2) == 116) {
                                if (3 == compare(lexer, lexer.byte_offset + 3, 136, 3, token_sequence_lookup)) {
                                    if (isTokenActive(10, tk_row) && token_production(lexer, hc_state_hash_token, 14, 10, 1) && lexer.byte_length > 6) {
                                        return;
                                    } else if (isTokenActive(50, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 19, 50, 2) && lexer.byte_length > 6) {
                                        return;
                                    } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 6) {
                                        return;
                                    } else if (isTokenActive(54, tk_row)) {
                                        lexer.setToken(54, 6, 6);
                                        return;
                                    }
                                }
                            } else if (lexer.get_byte_at(lexer.byte_offset + 2) == 112) {
                                if (3 == compare(lexer, lexer.byte_offset + 3, 167, 3, token_sequence_lookup)) {
                                    if (isTokenActive(10, tk_row) && token_production(lexer, hc_state_hash_token, 14, 10, 1) && lexer.byte_length > 6) {
                                        return;
                                    } else if (isTokenActive(50, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 19, 50, 2) && lexer.byte_length > 6) {
                                        return;
                                    } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 6) {
                                        return;
                                    } else if (isTokenActive(58, tk_row)) {
                                        lexer.setToken(58, 6, 6);
                                        return;
                                    }
                                }
                            }
                        } else if (isTokenActive(10, tk_row) && token_production(lexer, hc_state_hash_token, 14, 10, 1) && lexer.byte_length > 1) {
                            return;
                        } else if (isTokenActive(50, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 19, 50, 2) && lexer.byte_length > 1) {
                            return;
                        } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 1) {
                            return;
                        } else if (isTokenActive(51, tk_row)) {
                            lexer.setToken(51, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 115:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 115) {
                        if (lexer.get_byte_at(lexer.byte_offset + 1) == 121) {
                            if (6 == compare(lexer, lexer.byte_offset + 2, 8, 6, token_sequence_lookup)) {
                                if (isTokenActive(41, tk_row)) {
                                    lexer.setToken(41, 8, 8);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 107) {
                            if (5 == compare(lexer, lexer.byte_offset + 2, 124, 5, token_sequence_lookup)) {
                                if (isTokenActive(10, tk_row) && token_production(lexer, hc_state_hash_token, 14, 10, 1) && lexer.byte_length > 7) {
                                    return;
                                } else if (isTokenActive(50, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 19, 50, 2) && lexer.byte_length > 7) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 7) {
                                    return;
                                } else if (isTokenActive(60, tk_row)) {
                                    lexer.setToken(60, 7, 7);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 99) {
                            if (lexer.get_byte_at(lexer.byte_offset + 2) == 111) {
                                if (2 == compare(lexer, lexer.byte_offset + 3, 146, 2, token_sequence_lookup)) {
                                    if (lexer.get_byte_at(lexer.byte_offset + 5) == 115) {
                                        if (isTokenActive(10, tk_row) && token_production(lexer, hc_state_hash_token, 14, 10, 1) && lexer.byte_length > 6) {
                                            return;
                                        } else if (isTokenActive(50, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 19, 50, 2) && lexer.byte_length > 6) {
                                            return;
                                        } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 6) {
                                            return;
                                        } else if (isTokenActive(37, tk_row)) {
                                            lexer.setToken(37, 6, 6);
                                            return;
                                        }
                                    } else if (isTokenActive(10, tk_row) && token_production(lexer, hc_state_hash_token, 14, 10, 1) && lexer.byte_length > 5) {
                                        return;
                                    } else if (isTokenActive(50, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 19, 50, 2) && lexer.byte_length > 5) {
                                        return;
                                    } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 5) {
                                        return;
                                    } else if (isTokenActive(38, tk_row)) {
                                        lexer.setToken(38, 5, 5);
                                        return;
                                    }
                                }
                            } else if (lexer.get_byte_at(lexer.byte_offset + 2) == 97) {
                                if (lexer.get_byte_at(lexer.byte_offset + 3) == 110) {
                                    if (isTokenActive(10, tk_row) && token_production(lexer, hc_state_hash_token, 14, 10, 1) && lexer.byte_length > 4) {
                                        return;
                                    } else if (isTokenActive(50, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 19, 50, 2) && lexer.byte_length > 4) {
                                        return;
                                    } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 4) {
                                        return;
                                    } else if (isTokenActive(28, tk_row)) {
                                        lexer.setToken(28, 4, 4);
                                        return;
                                    }
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 116) {
                            if (3 == compare(lexer, lexer.byte_offset + 2, 150, 3, token_sequence_lookup)) {
                                if (isTokenActive(10, tk_row) && token_production(lexer, hc_state_hash_token, 14, 10, 1) && lexer.byte_length > 5) {
                                    return;
                                } else if (isTokenActive(50, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 19, 50, 2) && lexer.byte_length > 5) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 5) {
                                    return;
                                } else if (isTokenActive(13, tk_row)) {
                                    lexer.setToken(13, 5, 5);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 101) {
                            if (lexer.get_byte_at(lexer.byte_offset + 2) == 116) {
                                if (isTokenActive(10, tk_row) && token_production(lexer, hc_state_hash_token, 14, 10, 1) && lexer.byte_length > 3) {
                                    return;
                                } else if (isTokenActive(50, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 19, 50, 2) && lexer.byte_length > 3) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 3) {
                                    return;
                                } else if (isTokenActive(25, tk_row)) {
                                    lexer.setToken(25, 3, 3);
                                    return;
                                }
                            }
                        }
                    }
                }
                break;
            case 116:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 116) {
                        if (lexer.get_byte_at(lexer.byte_offset + 1) == 111) {
                            if (lexer.get_byte_at(lexer.byte_offset + 2) == 107) {
                                if (2 == compare(lexer, lexer.byte_offset + 3, 35, 2, token_sequence_lookup)) {
                                    if (isTokenActive(10, tk_row) && token_production(lexer, hc_state_hash_token, 14, 10, 1) && lexer.byte_length > 5) {
                                        return;
                                    } else if (isTokenActive(50, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 19, 50, 2) && lexer.byte_length > 5) {
                                        return;
                                    } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 5) {
                                        return;
                                    } else if (isTokenActive(31, tk_row)) {
                                        lexer.setToken(31, 5, 5);
                                        return;
                                    }
                                }
                            } else if (isTokenActive(10, tk_row) && token_production(lexer, hc_state_hash_token, 14, 10, 1) && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(50, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 19, 50, 2) && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(26, tk_row)) {
                                lexer.setToken(26, 2, 2);
                                return;
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 104) {
                            if (2 == compare(lexer, lexer.byte_offset + 2, 120, 2, token_sequence_lookup)) {
                                if (isTokenActive(10, tk_row) && token_production(lexer, hc_state_hash_token, 14, 10, 1) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(50, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 19, 50, 2) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(15, tk_row)) {
                                    lexer.setToken(15, 4, 4);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 58) {
                            if (isTokenActive(56, tk_row)) {
                                lexer.setToken(56, 2, 2);
                                return;
                            }
                        }
                    }
                }
                break;
            case 117:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 117) {
                        if (4 == compare(lexer, lexer.byte_offset + 1, 79, 4, token_sequence_lookup)) {
                            if (isTokenActive(10, tk_row) && token_production(lexer, hc_state_hash_token, 14, 10, 1) && lexer.byte_length > 5) {
                                return;
                            } else if (isTokenActive(50, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 19, 50, 2) && lexer.byte_length > 5) {
                                return;
                            } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 5) {
                                return;
                            } else if (isTokenActive(30, tk_row)) {
                                lexer.setToken(30, 5, 5);
                                return;
                            }
                        }
                    }
                }
                break;
            case 119:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 119) {
                        if (5 == compare(lexer, lexer.byte_offset + 1, 93, 5, token_sequence_lookup)) {
                            if (isTokenActive(10, tk_row) && token_production(lexer, hc_state_hash_token, 14, 10, 1) && lexer.byte_length > 6) {
                                return;
                            } else if (isTokenActive(50, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 19, 50, 2) && lexer.byte_length > 6) {
                                return;
                            } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 6) {
                                return;
                            } else if (isTokenActive(36, tk_row)) {
                                lexer.setToken(36, 6, 6);
                                return;
                            }
                        }
                    }
                }
                break;
            case 123:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 123) {
                        if (isTokenActive(47, tk_row)) {
                            lexer.setToken(47, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 125:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 125) {
                        if (isTokenActive(48, tk_row)) {
                            lexer.setToken(48, 1, 1);
                            return;
                        }
                    }
                }
                break;
            default:
                break;
        };
        if (isTokenActive(10, tk_row) && pre_scan(lexer, 0) && token_production(lexer, hc_state_hash_token, 14, 10, 1)) {
            return;
        } else if (isTokenActive(50, tk_row) && pre_scan(lexer, 1) && token_production(lexer, hc_symbols__identifier_syms, 19, 50, 2)) {
            return;
        } else if (isTokenActive(61, tk_row) && pre_scan(lexer, 2) && token_production(lexer, hc_comment, 15, 61, 4)) {
            return;
        } else if (isTokenActive(8, tk_row) && lexer.isSP(true)) {
            return;
        } else if (isTokenActive(3, tk_row) && lexer.isUniID()) {
            return;
        } else if (isTokenActive(2, tk_row) && lexer.isSym(true)) {
            return;
        } else if (isTokenActive(7, tk_row) && lexer.isNL()) {
            return;
        } else if (isTokenActive(5, tk_row) && lexer.isNum()) {
            return;
        }
    }

    function scan(lexer, tk_row, pk_row) {
        if (((lexer._type) <= 0)) scan_core(lexer, tk_row);;
        if ((pk_row > 0 && isTokenActive(lexer._type, pk_row))) {
            while ((isTokenActive(lexer._type, pk_row))) {
                lexer.next();
                scan_core(lexer, tk_row);
            }
        }
    }
    function pre_scan(lexer, tk_row) {
        var tk_length = lexer.token_length;;
        var bt_length = lexer.byte_length;;
        var type_cache = lexer._type;;
        scan(lexer, tk_row, 0);
        var type_out = lexer._type;;
        lexer._type = type_cache;
        lexer.token_length = tk_length;
        lexer.byte_length = bt_length;
        return type_out > 0;
    }

    function branch_002a173c4c322c1b(state, db, prod) {
        add_reduce(state, 4, 22);
        return 0;
    }

    function branch_09fd4c587b3f4d77(state, db, prod) {
        add_reduce(state, 3, 2);
        return 0;
    }

    function branch_0afa361db3e9ca4a(state, db, prod) {
        state.push_fn(branch_aa0a72e4b33f61ab, 28);
        return hc_symbols__sym_delimiter(state, db, 0);
    }

    function branch_1380b38c2a39bbdf(state, db, prod) {
        add_reduce(state, 1, 14);
        return hc_top_level_instructions_list_21_goto(state, db, 29);
    }

    function branch_152680e8cb3da748(state, db, prod) {
        add_reduce(state, 1, 14);
        return 0;
    }

    function branch_1e3ac8120e7b258b(state, db, prod) {
        add_reduce(state, 4, 1);
        return 0;
    }

    function branch_233b893dd136257c(state, db, prod) {
        add_reduce(state, 2, 39);
        return 38;
    }

    function branch_24e04851352465e5(state, db, prod) {
        add_reduce(state, 4, 24);
        return 0;
    }

    function branch_26c55aefc304134b(state, db, prod) {
        scan(state.lexer, 3, 4);
        state.push_fn(branch_5a19e50ad3f84066, 0);
        return hc_top_level_instructions(state, db, 0);
    }

    function branch_29232f92c66f352e(state, db, prod) {
        add_reduce(state, 1, 56);
        return 40;
    }

    function branch_29dee3633574eff9(state, db, prod) {
        add_reduce(state, 2, 42);
        return 0;
    }

    function branch_30c796aa0657deec(state, db, prod) {
        scan(state.lexer, 5, 0);
        if (state.lexer._type == 8 || state.lexer._type == 1 || state.lexer._type == 7) {
            state.push_fn(set_production /*26*/, 26);
            state.push_fn(branch_af876582b15f21c6, 26);
            return hc_symbols__sym_delimiter(state, db, 0);
        } else {
            add_reduce(state, 2, 48);
            return 26;
        };
        return - 1;
    }

    function branch_321709d00f9ab56b(state, db, prod) {
        add_reduce(state, 3, 52);
        return 0;
    }

    function branch_3ef6c5cb45dcabc3(state, db, prod) {
        add_reduce(state, 4, 29);
        return 0;
    }

    function branch_409eb42360f0cea3(state, db, prod) {
        scan(state.lexer, 6, 4);
        if ((state.lexer._type == 20)) {
            consume(state);
            add_reduce(state, 6, 16);
            return 6;
        };
        return - 1;
    }

    function branch_40d65067ea101f93(state, db, prod) {
        scan(state.lexer, 7, 4);
        if (state.lexer._type == 15) {
            state.push_fn(set_production /*5*/, 5);
            state.push_fn(branch_9bd709e922fe1256, 5);
            return hc_instruction_sequence_group_28_0_(state, db, 0);
        } else {
            add_reduce(state, 3, 12);
            return 5;
        };
        return - 1;
    }

    function branch_4172360473d0bb6e(state, db, prod) {
        scan(state.lexer, 8, 4);
        if (state.lexer._type == 41) {
            state.push_fn(set_production /*0*/, 0);
            state.push_fn(branch_1e3ac8120e7b258b, 0);
            return hc_expected_symbols(state, db, 0);
        } else {
            add_reduce(state, 3, 3);
            return 0;
        };
        return - 1;
    }

    function branch_4cb1f127d88c504f(state, db, prod) {
        scan(state.lexer, 9, 4);
        if (state.lexer._type == 15) {
            var pk = state.lexer.copy_in_place();;
            pk.next();
            scan(pk, 10, 4);
            if (pk._type == 23) {
                consume(state);
                scan(state.lexer, 11, 4);
                state.push_fn(branch_40d65067ea101f93, 0);
                return hc_instruction_sequence_list_27(state, db, 0);
            } else {
                state.lexer._type = 15;
                state.push_fn(set_production /*5*/, 5);
                state.push_fn(branch_8fe8831ed25331e2, 5);
                return hc_instruction_sequence_group_28_0_(state, db, 0);
            }
        } else {
            add_reduce(state, 1, 13);
            return 5;
        };
        return - 1;
    }

    function branch_4d843213a3f18bd0(state, db, prod) {
        scan(state.lexer, 12, 13);
        if ((state.lexer._type == 48)) {
            consume(state);
            add_reduce(state, 5, 40);
            return 16;
        };
        return - 1;
    }

    function branch_5328772db9c5c2f2(state, db, prod) {
        scan(state.lexer, 12, 13);
        if ((state.lexer._type == 48)) {
            consume(state);
            add_reduce(state, 5, 44);
            return 0;
        };
        return - 1;
    }

    function branch_5a19e50ad3f84066(state, db, prod) {
        scan(state.lexer, 14, 4);
        if (state.lexer._type == 17) {
            scan(state.lexer, 15, 4);
            state.push_fn(branch_81aed47b4a373440, 0);
            return hc_on_fail(state, db, 0);
        } else if (state.lexer._type == 41) {
            var pk = state.lexer.copy_in_place();;
            pk.next();
            scan(pk, 16, 4);
            if (pk._type == 42) {
                state.lexer._type = 41;
                state.push_fn(set_production /*10*/, 10);
                state.push_fn(branch_5e8995f2a0a787c8, 10);
                return hc_expected_symbols(state, db, 0);
            }
        } else {
            add_reduce(state, 4, 36);
            return 10;
        };
        return - 1;
    }

    function branch_5c4dbda0ba57e3a0(state, db, prod) {
        scan(state.lexer, 17, 4);
        if ((state.lexer._type == 46)) {
            consume(state);
            add_reduce(state, 3, 0);
            return 0;
        };
        return - 1;
    }

    function branch_5e8995f2a0a787c8(state, db, prod) {
        add_reduce(state, 5, 34);
        return 0;
    }

    function branch_68f3199b87b7d690(state, db, prod) {
        state.push_fn(branch_7cb165ef0460fafe, 9);
        return hc_functions__reduce_function(state, db, 0);
    }

    function branch_6ac43545d2ba4a5b(state, db, prod) {
        add_reduce(state, 1, 14);
        return hc_sequence_instruction_list_91_goto(state, db, 37);
    }

    function branch_6ae7cc6e1cdfcdd1(state, db, prod) {
        scan(state.lexer, 18, 4);
        if ((state.lexer._type == 11)) {
            consume(state);
            add_reduce(state, 3, 39);
            return 13;
        };
        return - 1;
    }

    function branch_775e08dc071ac747(state, db, prod) {
        add_reduce(state, 3, 31);
        return 0;
    }

    function branch_7aad9f8a5b50fb40(state, db, prod) {
        add_reduce(state, 4, 45);
        return 0;
    }

    function branch_7cb165ef0460fafe(state, db, prod) {
        add_reduce(state, 2, 21);
        return 9;
    }

    function branch_81aed47b4a373440(state, db, prod) {
        scan(state.lexer, 19, 4);
        if (state.lexer._type == 41) {
            var pk = state.lexer.copy_in_place();;
            pk.next();
            scan(pk, 16, 4);
            if (pk._type == 42) {
                state.lexer._type = 41;
                state.push_fn(set_production /*10*/, 10);
                state.push_fn(branch_9db5c8a92a2cd727, 10);
                return hc_expected_symbols(state, db, 0);
            }
        } else {
            add_reduce(state, 5, 35);
            return 10;
        };
        return - 1;
    }

    function branch_82d096fda2d8d4f2(state, db, prod) {
        scan(state.lexer, 12, 13);
        if ((state.lexer._type == 48)) {
            consume(state);
            add_reduce(state, 3, 43);
            return 22;
        };
        return - 1;
    }

    function branch_897ae5f267a67306(state, db, prod) {
        scan(state.lexer, 20, 13);
        if (state.lexer._type == 51 || state.lexer._type == 54) {
            consume(state);
            scan(state.lexer, 21, 13);
            if (state.lexer._type == 47) {
                state.push_fn(set_production /*23*/, 23);
                consume(state);
                state.push_fn(branch_5328772db9c5c2f2, 23);
                return hc_functions__js_data(state, db, 0);
            } else if (state.lexer._type == 52) {
                state.push_fn(set_production /*23*/, 23);
                consume(state);
                state.push_fn(branch_7aad9f8a5b50fb40, 23);
                return hc_symbols__identifier(state, db, 0);
            } else if (state.lexer._type == 53) {
                state.push_fn(set_production /*23*/, 23);
                consume(state);
                state.push_fn(branch_e5f4e4578f6df634, 23);
                return hc_symbols__identifier(state, db, 0);
            }
        };
        return - 1;
    }

    function branch_8accc67b5186dda5(state, db, prod) {
        scan(state.lexer, 7, 4);
        if (state.lexer._type == 15) {
            state.push_fn(set_production /*5*/, 5);
            state.push_fn(branch_8fe8831ed25331e2, 5);
            return hc_instruction_sequence_group_31_0_(state, db, 0);
        } else {
            add_reduce(state, 1, 13);
            return 5;
        };
        return - 1;
    }

    function branch_8af7e93e9c9cd66e(state, db, prod) {
        scan(state.lexer, 6, 4);
        if ((state.lexer._type == 20)) {
            consume(state);
            add_reduce(state, 5, 17);
            return 0;
        };
        return - 1;
    }

    function branch_8c2d2335fd7adbcb(state, db, prod) {
        scan(state.lexer, 22, 4);
        if (state.lexer._type == 60) {
            state.push_fn(set_production /*11*/, 11);
            state.push_fn(branch_e58a4fe772513b10, 11);
            return hc_expected_symbols_group_116_0_(state, db, 0);
        } else {
            add_reduce(state, 3, 38);
            return 11;
        };
        return - 1;
    }

    function branch_8e36a1adf6fc8ae1(state, db, prod) {
        scan(state.lexer, 23, 4);
        if (state.lexer._type == 17) {
            scan(state.lexer, 15, 4);
            state.push_fn(branch_e294af4fdd931820, 0);
            return hc_on_fail(state, db, 0);
        } else if (state.lexer._type == 41) {
            state.push_fn(set_production /*1*/, 1);
            state.push_fn(branch_f4888514ef6927f0, 1);
            return hc_expected_symbols(state, db, 0);
        } else if (state.lexer._type == 12) {
            state.push_fn(set_production /*1*/, 1);
            consume(state);
            add_reduce(state, 5, 8);
            return 0;
        };
        return - 1;
    }

    function branch_8fe8831ed25331e2(state, db, prod) {
        add_reduce(state, 2, 11);
        return 0;
    }

    function branch_9bd709e922fe1256(state, db, prod) {
        add_reduce(state, 4, 10);
        return 0;
    }

    function branch_9db5c8a92a2cd727(state, db, prod) {
        add_reduce(state, 6, 33);
        return 0;
    }

    function branch_a2b4fffff6f3c9f7(state, db, prod) {
        state.push_fn(branch_7cb165ef0460fafe, 9);
        return hc_functions__referenced_function(state, db, 0);
    }

    function branch_a314ad4b9e39ff88(state, db, prod) {
        add_reduce(state, 1, 14);
        return hc_sequence_instruction_list_73_goto(state, db, 36);
    }

    function branch_a66324fa996726b7(state, db, prod) {
        scan(state.lexer, 18, 4);
        if ((state.lexer._type == 11)) {
            consume(state);
            add_reduce(state, 6, 28);
            return 0;
        };
        return - 1;
    }

    function branch_a89d6a9cb6db8bfe(state, db, prod) {
        add_reduce(state, 2, 19);
        return 8;
    }

    function branch_aa0a72e4b33f61ab(state, db, prod) {
        add_reduce(state, 3, 50);
        return 28;
    }

    function branch_af876582b15f21c6(state, db, prod) {
        add_reduce(state, 3, 48);
        return 0;
    }

    function branch_b430cc4582f68425(state, db, prod) {
        scan(state.lexer, 24, 4);
        if ((state.lexer._type == 19)) {
            consume(state);
            state.push_fn(branch_8af7e93e9c9cd66e, 7);
            return hc_instruction_sequence(state, db, 0);
        };
        return - 1;
    }

    function branch_b97ab1cbead9a57b(state, db, prod) {
        scan(state.lexer, 6, 4);
        if ((state.lexer._type == 20)) {
            consume(state);
            add_reduce(state, 5, 18);
            return 0;
        };
        return - 1;
    }

    function branch_c6bc94376c86c6f2(state, db, prod) {
        scan(state.lexer, 24, 4);
        if ((state.lexer._type == 19)) {
            consume(state);
            state.push_fn(branch_409eb42360f0cea3, 6);
            return hc_instruction_sequence(state, db, 0);
        };
        return - 1;
    }

    function branch_c87f5769163dea40(state, db, prod) {
        scan(state.lexer, 25, 4);
        if ((state.lexer._type == 12)) {
            consume(state);
            add_reduce(state, 7, 5);
            return 0;
        };
        return - 1;
    }

    function branch_cacd07307dac6e56(state, db, prod) {
        scan(state.lexer, 26, 4);
        if (state.lexer._type == 17) {
            scan(state.lexer, 15, 4);
            state.push_fn(branch_4172360473d0bb6e, 0);
            return hc_on_fail(state, db, 0);
        } else if (state.lexer._type == 41) {
            state.push_fn(set_production /*0*/, 0);
            state.push_fn(branch_09fd4c587b3f4d77, 0);
            return hc_expected_symbols(state, db, 0);
        } else {
            add_reduce(state, 2, 4);
            return 0;
        };
        return - 1;
    }

    function branch_cbbba0015a04a66f(state, db, prod) {
        scan(state.lexer, 6, 4);
        if ((state.lexer._type == 20)) {
            consume(state);
            add_reduce(state, 5, 23);
            return 0;
        };
        return - 1;
    }

    function branch_d566f16d612348fd(state, db, prod) {
        add_reduce(state, 1, 14);
        return hc_instruction_sequence_list_24_goto(state, db, 31);
    }

    function branch_d6479977bec3ed58(state, db, prod) {
        scan(state.lexer, 18, 4);
        if ((state.lexer._type == 11)) {
            consume(state);
            add_reduce(state, 3, 39);
            return 12;
        };
        return - 1;
    }

    function branch_da0bf47e0ea33042(state, db, prod) {
        add_reduce(state, 1, 14);
        return hc_top_level_instructions_list_22_goto(state, db, 30);
    }

    function branch_e294af4fdd931820(state, db, prod) {
        scan(state.lexer, 27, 4);
        if (state.lexer._type == 41) {
            state.push_fn(set_production /*1*/, 1);
            state.push_fn(branch_c87f5769163dea40, 1);
            return hc_expected_symbols(state, db, 0);
        } else if (state.lexer._type == 12) {
            state.push_fn(set_production /*1*/, 1);
            consume(state);
            add_reduce(state, 6, 7);
            return 0;
        };
        return - 1;
    }

    function branch_e58a4fe772513b10(state, db, prod) {
        add_reduce(state, 4, 37);
        return 0;
    }

    function branch_e5f4e4578f6df634(state, db, prod) {
        add_reduce(state, 4, 46);
        return 0;
    }

    function branch_ece841c4bcca1523(state, db, prod) {
        state.push_fn(branch_f4f328e865054932, 16);
        return hc_symbols__identifier(state, db, 0);
    }

    function branch_f15159c408cf0587(state, db, prod) {
        scan(state.lexer, 28, 4);
        if ((state.lexer._type == 5)) {
            consume(state);
            add_reduce(state, 5, 25);
            return 0;
        };
        return - 1;
    }

    function branch_f4718c6fcad739d3(state, db, prod) {
        scan(state.lexer, 3, 4);
        state.push_fn(branch_cacd07307dac6e56, 0);
        return hc_top_level_instructions(state, db, 0);
    }

    function branch_f4888514ef6927f0(state, db, prod) {
        scan(state.lexer, 25, 4);
        if ((state.lexer._type == 12)) {
            consume(state);
            add_reduce(state, 6, 6);
            return 0;
        };
        return - 1;
    }

    function branch_f4f328e865054932(state, db, prod) {
        scan(state.lexer, 29, 13);
        if ((state.lexer._type == 47)) {
            consume(state);
            state.push_fn(branch_4d843213a3f18bd0, 16);
            return hc_functions__js_data(state, db, 0);
        };
        return - 1;
    }

    function branch_f6494f915032a017(state, db, prod) {
        scan(state.lexer, 24, 4);
        if ((state.lexer._type == 19)) {
            consume(state);
            state.push_fn(branch_b97ab1cbead9a57b, 7);
            return hc_instruction_sequence(state, db, 0);
        };
        return - 1;
    }

    function branch_fd213bbdfe6a98cb(state, db, prod) {
        add_reduce(state, 2, 51);
        return 0;
    }

    function branch_fe47fbceb2597240(state, db, prod) {
        add_reduce(state, 1, 14);
        return hc_instruction_sequence_list_27_goto(state, db, 32);
    }

    function hc_state_ir(state, db, prod) {
        state.push_fn(branch_f4718c6fcad739d3, 0);
        return hc_state_declaration(state, db, 0);
    }

    function hc_grammar_injection(state, db, prod) {
        scan(state.lexer, 30, 4);
        if (state.lexer._type == 9) {
            consume(state);
            scan(state.lexer, 31, 4);
            if (state.lexer._type == 10) {
                consume(state);
                scan(state.lexer, 18, 4);
                if (state.lexer._type == 11) {
                    consume(state);
                    scan(state.lexer, 3, 4);
                    state.push_fn(branch_8e36a1adf6fc8ae1, 0);
                    return hc_top_level_instructions(state, db, 0);
                }
            }
        };
        return - 1;
    }

    function hc_state_declaration(state, db, prod) {
        scan(state.lexer, 32, 4);
        if (state.lexer._type == 13) {
            consume(state);
            scan(state.lexer, 33, 4);
            if ((state.lexer._type == 14)) {
                consume(state);
                scan(state.lexer, 31, 4);
                if ((state.lexer._type == 10)) {
                    consume(state);
                    scan(state.lexer, 18, 4);
                    if ((state.lexer._type == 11)) {
                        consume(state);
                        add_reduce(state, 4, 9);
                        return 2;
                    }
                }
            }
        };
        return - 1;
    }

    function hc_state_reference(state, db, prod) {
        scan(state.lexer, 32, 4);
        if (state.lexer._type == 13) {
            consume(state);
            scan(state.lexer, 33, 4);
            if ((state.lexer._type == 14)) {
                consume(state);
                scan(state.lexer, 31, 4);
                if ((state.lexer._type == 10)) {
                    consume(state);
                    scan(state.lexer, 18, 4);
                    if ((state.lexer._type == 11)) {
                        consume(state);
                        add_reduce(state, 4, 9);
                        return 3;
                    }
                }
            }
        };
        return - 1;
    }

    function hc_top_level_instructions(state, db, prod) {
        scan(state.lexer, 3, 4);
        if (isTokenActive(state.lexer._type, 34)) {
            state.push_fn(set_production /*4*/, 4);
            state.push_fn(set_production /*0*/, 4);
            return hc_instruction_sequence(state, db, 0);
        } else if (state.lexer._type == 21 || state.lexer._type == 22) {
            state.push_fn(set_production /*4*/, 4);
            state.push_fn(set_production /*0*/, 4);
            return hc_top_level_instructions_list_22(state, db, 0);
        } else if (state.lexer._type == 17) {
            state.push_fn(set_production /*4*/, 4);
            state.push_fn(set_production /*0*/, 4);
            return hc_top_level_instructions_list_21(state, db, 0);
        };
        return - 1;
    }

    function hc_instruction_sequence(state, db, prod) {
        scan(state.lexer, 35, 4);
        if (state.lexer._type == 16) {
            state.push_fn(set_production /*5*/, 5);
            state.lexer.setToken(2, 0, 0);
            consume(state);
            return 0;
        } else if (isTokenActive(state.lexer._type, 36)) {
            scan(state.lexer, 37, 4);
            state.push_fn(branch_4cb1f127d88c504f, 0);
            return hc_instruction_sequence_list_24(state, db, 0);
        } else if (state.lexer._type == 23) {
            scan(state.lexer, 11, 4);
            state.push_fn(branch_8accc67b5186dda5, 0);
            return hc_instruction_sequence_list_27(state, db, 0);
        } else if (state.lexer._type == 15) {
            state.push_fn(set_production /*5*/, 5);
            state.push_fn(branch_152680e8cb3da748, 5);
            return hc_instruction_sequence_group_31_0_(state, db, 0);
        };
        state.lexer.setToken(2, 0, 0);
        consume(state);
        return 5;
    }

    function hc_prod_branch_instruction(state, db, prod) {
        scan(state.lexer, 15, 4);
        if (state.lexer._type == 17) {
            consume(state);
            scan(state.lexer, 38, 4);
            if ((state.lexer._type == 18)) {
                consume(state);
                state.push_fn(branch_c6bc94376c86c6f2, 6);
                return hc_production_id_list(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_token_branch_instruction(state, db, prod) {
        scan(state.lexer, 39, 4);
        if (state.lexer._type == 21) {
            state.push_fn(set_production /*7*/, 7);
            consume(state);
            state.push_fn(branch_b430cc4582f68425, 7);
            return hc_token_id_list(state, db, 0);
        } else if (state.lexer._type == 22) {
            state.push_fn(set_production /*7*/, 7);
            consume(state);
            state.push_fn(branch_f6494f915032a017, 7);
            return hc_token_id_list(state, db, 0);
        };
        return - 1;
    }

    function hc_goto_instruction(state, db, prod) {
        scan(state.lexer, 11, 4);
        if (state.lexer._type == 23) {
            consume(state);
            scan(state.lexer, 32, 4);
            if ((state.lexer._type == 13)) {
                state.push_fn(branch_a89d6a9cb6db8bfe, 8);
                return hc_state_reference(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_sequence_instruction(state, db, prod) {
        scan(state.lexer, 37, 4);
        if (state.lexer._type == 24) {
            consume(state);
            scan(state.lexer, 40, 4);
            if (state.lexer._type == 49) {
                var fk1 = state.fork(db);;
                fk1.push_fn(branch_68f3199b87b7d690, 9);
                state.push_fn(branch_a2b4fffff6f3c9f7, 9);
                return 0;
            } else if (state.lexer._type == 5) {
                state.push_fn(set_production /*9*/, 9);
                consume(state);
                scan(state.lexer, 28, 4);
                if ((state.lexer._type == 5)) {
                    consume(state);
                    add_reduce(state, 3, 20);
                    return 0;
                };
                return - 1;
            }
        } else if (state.lexer._type == 25) {
            consume(state);
            scan(state.lexer, 41, 4);
            if (state.lexer._type == 18) {
                state.push_fn(set_production /*9*/, 9);
                consume(state);
                scan(state.lexer, 42, 4);
                if ((state.lexer._type == 26)) {
                    consume(state);
                    state.push_fn(branch_002a173c4c322c1b, 9);
                    return hc_sequence_instruction_group_68_0_(state, db, 0);
                };
                return - 1;
            } else if (state.lexer._type == 31) {
                consume(state);
                scan(state.lexer, 43, 4);
                if (state.lexer._type == 32) {
                    consume(state);
                    scan(state.lexer, 44, 13);
                    if (state.lexer._type == 55 || state.lexer._type == 56 || state.lexer._type == 2 || state.lexer._type == 57) {
                        state.push_fn(set_production /*9*/, 9);
                        state.push_fn(branch_f15159c408cf0587, 9);
                        return hc_symbols__terminal_symbol(state, db, 0);
                    } else {
                        state.push_fn(set_production /*9*/, 9);
                        state.push_fn(branch_f15159c408cf0587, 9);
                        return hc_sequence_instruction_group_68_0_(state, db, 0);
                    }
                }
            } else if (state.lexer._type == 38) {
                state.push_fn(set_production /*9*/, 9);
                consume(state);
                scan(state.lexer, 42, 4);
                if ((state.lexer._type == 26)) {
                    consume(state);
                    state.push_fn(branch_3ef6c5cb45dcabc3, 9);
                    return hc_sequence_instruction_group_68_0_(state, db, 0);
                };
                return - 1;
            }
        } else if (state.lexer._type == 27) {
            state.push_fn(set_production /*9*/, 9);
            consume(state);
            scan(state.lexer, 42, 4);
            if ((state.lexer._type == 26)) {
                consume(state);
                scan(state.lexer, 24, 4);
                if ((state.lexer._type == 19)) {
                    consume(state);
                    state.push_fn(branch_cbbba0015a04a66f, 9);
                    return hc_sequence_instruction_list_73(state, db, 0);
                }
            };
            return - 1;
        } else if (state.lexer._type == 28) {
            consume(state);
            scan(state.lexer, 45, 4);
            if (state.lexer._type == 29) {
                state.push_fn(set_production /*9*/, 9);
                consume(state);
                scan(state.lexer, 46, 4);
                if ((state.lexer._type == 30)) {
                    consume(state);
                    state.push_fn(branch_24e04851352465e5, 9);
                    return hc_token_id_list(state, db, 0);
                };
                return - 1;
            } else if (state.lexer._type == 30) {
                state.push_fn(set_production /*9*/, 9);
                consume(state);
                state.push_fn(branch_775e08dc071ac747, 9);
                return hc_token_id_list(state, db, 0);
            }
        } else if (state.lexer._type == 33) {
            state.push_fn(set_production /*9*/, 9);
            consume(state);
            add_reduce(state, 1, 26);
            return 0;
        } else if (state.lexer._type == 34) {
            state.push_fn(set_production /*9*/, 9);
            consume(state);
            add_reduce(state, 1, 27);
            return 0;
        } else if (state.lexer._type == 35) {
            state.push_fn(set_production /*9*/, 9);
            consume(state);
            scan(state.lexer, 47, 4);
            if ((state.lexer._type == 36)) {
                consume(state);
                scan(state.lexer, 48, 4);
                if ((state.lexer._type == 37)) {
                    consume(state);
                    scan(state.lexer, 33, 4);
                    if ((state.lexer._type == 14)) {
                        consume(state);
                        state.push_fn(branch_a66324fa996726b7, 9);
                        return hc_sequence_instruction_list_91(state, db, 0);
                    }
                }
            };
            return - 1;
        } else if (state.lexer._type == 39) {
            consume(state);
            scan(state.lexer, 49, 4);
            if (state.lexer._type == 40) {
                state.push_fn(set_production /*9*/, 9);
                consume(state);
                add_reduce(state, 2, 30);
                return 0;
            } else {
                add_reduce(state, 1, 32);
                return 9;
            }
        };
        return - 1;
    }

    function hc_on_fail(state, db, prod) {
        scan(state.lexer, 15, 4);
        if (state.lexer._type == 17) {
            consume(state);
            scan(state.lexer, 50, 4);
            if (state.lexer._type == 34) {
                consume(state);
                scan(state.lexer, 32, 4);
                state.push_fn(branch_26c55aefc304134b, 0);
                return hc_state_declaration(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_expected_symbols(state, db, prod) {
        scan(state.lexer, 51, 4);
        if (state.lexer._type == 41) {
            consume(state);
            scan(state.lexer, 16, 4);
            if (state.lexer._type == 42) {
                consume(state);
                scan(state.lexer, 33, 4);
                state.push_fn(branch_8c2d2335fd7adbcb, 0);
                return hc_token_id_list(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_token_id_list(state, db, prod) {
        scan(state.lexer, 33, 4);
        if (state.lexer._type == 14) {
            consume(state);
            scan(state.lexer, 28, 4);
            if ((state.lexer._type == 5)) {
                state.push_fn(branch_d6479977bec3ed58, 12);
                return hc_sequence_instruction_list_91(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_production_id_list(state, db, prod) {
        scan(state.lexer, 33, 4);
        if (state.lexer._type == 14) {
            consume(state);
            scan(state.lexer, 28, 4);
            if ((state.lexer._type == 5)) {
                state.push_fn(branch_6ae7cc6e1cdfcdd1, 13);
                return hc_sequence_instruction_list_91(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_state_hash_token(state, db, prod) {
        scan(state.lexer, 52, 4);
        if (state.lexer._type == 3 || state.lexer._type == 5 || state.lexer._type == 43 || state.lexer._type == 44) {
            consume(state);
            return hc_state_hash_token_goto(state, db, 14);
        };
        return - 1;
    }

    function hc_state_hash_token_goto(state, db, prod) {
        scan(state.lexer, 53, 54);
        if (state.lexer._type == 43) {
            state.push_fn(hc_state_hash_token_goto /*hc_state_hash_token_goto( state, db, 14 )*/, 14);
            scan(state.lexer, 55, 54);
            consume(state);
            add_reduce(state, 2, 0);
            return 0;
        } else if (state.lexer._type == 44) {
            state.push_fn(hc_state_hash_token_goto /*hc_state_hash_token_goto( state, db, 14 )*/, 14);
            scan(state.lexer, 56, 54);
            consume(state);
            add_reduce(state, 2, 0);
            return 0;
        } else if (state.lexer._type == 5) {
            state.push_fn(hc_state_hash_token_goto /*hc_state_hash_token_goto( state, db, 14 )*/, 14);
            scan(state.lexer, 57, 54);
            consume(state);
            add_reduce(state, 2, 0);
            return 0;
        } else if (state.lexer._type == 3) {
            state.push_fn(hc_state_hash_token_goto /*hc_state_hash_token_goto( state, db, 14 )*/, 14);
            scan(state.lexer, 58, 54);
            consume(state);
            add_reduce(state, 2, 0);
            return 0;
        };
        return (prod == 14) ? prod : - 1;
    }

    function hc_comment(state, db, prod) {
        scan(state.lexer, 59, 4);
        if (state.lexer._type == 45) {
            consume(state);
            scan(state.lexer, 60, 54);
            if (state.lexer._type == 46) {
                state.push_fn(set_production /*15*/, 15);
                consume(state);
                add_reduce(state, 2, 0);
                return 0;
            } else {
                state.push_fn(set_production /*15*/, 15);
                state.push_fn(branch_5c4dbda0ba57e3a0, 15);
                return hc_comment_list_153(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_functions__referenced_function(state, db, prod) {
        state.push_fn(branch_ece841c4bcca1523, 16);
        return hc_functions__referenced_function_group_155_0_(state, db, 0);
    }

    function hc_functions__js_function_start_symbol(state, db, prod) {
        scan(state.lexer, 61, 13);
        if (state.lexer._type == 49) {
            consume(state);
            scan(state.lexer, 13, 13);
            add_reduce(state, 1, 41);
            return 17;
        };
        return - 1;
    }

    function hc_symbols__identifier(state, db, prod) {
        scan(state.lexer, 62, 13);
        if (state.lexer._type == 50) {
            consume(state);
            scan(state.lexer, 13, 13);
            return 18;
        };
        return - 1;
    }

    function hc_symbols__identifier_syms(state, db, prod) {
        scan(state.lexer, 63, 13);
        if (state.lexer._type == 43 || state.lexer._type == 3) {
            consume(state);
            return hc_symbols__identifier_syms_goto(state, db, 19);
        };
        return - 1;
    }

    function hc_symbols__identifier_syms_goto(state, db, prod) {
        scan(state.lexer, 64, 0);
        if (state.lexer._type == 43) {
            state.push_fn(hc_symbols__identifier_syms_goto /*hc_symbols__identifier_syms_goto( state, db, 19 )*/, 19);
            scan(state.lexer, 65, 0);
            consume(state);
            add_reduce(state, 2, 42);
            return 0;
        } else if (state.lexer._type == 3) {
            state.push_fn(hc_symbols__identifier_syms_goto /*hc_symbols__identifier_syms_goto( state, db, 19 )*/, 19);
            scan(state.lexer, 66, 0);
            consume(state);
            add_reduce(state, 2, 42);
            return 0;
        } else if (state.lexer._type == 5) {
            state.push_fn(hc_symbols__identifier_syms_goto /*hc_symbols__identifier_syms_goto( state, db, 19 )*/, 19);
            scan(state.lexer, 67, 0);
            consume(state);
            add_reduce(state, 2, 42);
            return 0;
        };
        return (prod == 19) ? prod : - 1;
    }

    function hc_functions__js_data(state, db, prod) {
        scan(state.lexer, 68, 69);
        if (state.lexer._type == 47) {
            state.push_fn(hc_functions__js_data_goto /*hc_functions__js_data_goto( state, db, 20 )*/, 20);
            state.push_fn(set_production /*0*/, 20);
            return hc_functions__js_data_block(state, db, 0);
        } else if (state.lexer._type == 3 || state.lexer._type == 5 || state.lexer._type == 8 || state.lexer._type == 2) {
            state.push_fn(hc_functions__js_data_goto /*hc_functions__js_data_goto( state, db, 20 )*/, 20);
            state.push_fn(set_production /*0*/, 20);
            return hc_functions__js_primitive(state, db, 0);
        } else if (state.lexer._type == 1) {
            state.push_fn(hc_functions__js_data_goto /*hc_functions__js_data_goto( state, db, 20 )*/, 20);
            consume(state);
            return 0;
        };
        return - 1;
    }

    function hc_functions__js_data_goto(state, db, prod) {
        scan(state.lexer, 70, 69);
        if (state.lexer._type == 47) {
            state.push_fn(hc_functions__js_data_goto /*hc_functions__js_data_goto( state, db, 20 )*/, 20);
            scan(state.lexer, 29, 13);
            if ((state.lexer._type == 47)) {
                state.push_fn(branch_29dee3633574eff9, 20);
                return hc_functions__js_data_block(state, db, 0);
            };
            return - 1;
        } else if (state.lexer._type == 48) {
            return 20;
        } else if (state.lexer._type == 3 || state.lexer._type == 5 || state.lexer._type == 8 || state.lexer._type == 2) {
            state.push_fn(hc_functions__js_data_goto /*hc_functions__js_data_goto( state, db, 20 )*/, 20);
            scan(state.lexer, 71, 69);
            if ((state.lexer._type == 3 || state.lexer._type == 5 || state.lexer._type == 8 || state.lexer._type == 2)) {
                state.push_fn(branch_29dee3633574eff9, 20);
                return hc_functions__js_primitive(state, db, 0);
            };
            return - 1;
        };
        return (prod == 20) ? prod : - 1;
    }

    function hc_functions__js_primitive(state, db, prod) {
        scan(state.lexer, 71, 69);
        if (state.lexer._type == 3 || state.lexer._type == 5 || state.lexer._type == 8 || state.lexer._type == 2) {
            consume(state);
            return 21;
        };
        return - 1;
    }

    function hc_functions__js_data_block(state, db, prod) {
        scan(state.lexer, 29, 13);
        if (state.lexer._type == 47) {
            consume(state);
            scan(state.lexer, 68, 69);
            if ((isTokenActive(state.lexer._type, 72))) {
                state.push_fn(branch_82d096fda2d8d4f2, 22);
                return hc_functions__js_data(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_functions__reduce_function(state, db, prod) {
        state.push_fn(branch_897ae5f267a67306, 0);
        return hc_functions__js_function_start_symbol(state, db, 0);
    }

    function hc_symbols__terminal_symbol(state, db, prod) {
        scan(state.lexer, 73, 13);
        if (state.lexer._type == 55) {
            state.push_fn(set_production /*24*/, 24);
            state.push_fn(set_production /*0*/, 24);
            return hc_symbols__generated_symbol(state, db, 0);
        } else if (state.lexer._type == 57) {
            state.push_fn(set_production /*24*/, 24);
            state.push_fn(set_production /*0*/, 24);
            return hc_symbols__escaped_symbol(state, db, 0);
        } else {
            state.push_fn(set_production /*24*/, 24);
            state.push_fn(set_production /*0*/, 24);
            return hc_symbols__literal_symbol(state, db, 0);
        };
        return - 1;
    }

    function hc_symbols__generated_symbol(state, db, prod) {
        scan(state.lexer, 74, 13);
        if (state.lexer._type == 55) {
            consume(state);
            scan(state.lexer, 62, 13);
            if ((state.lexer._type == 50)) {
                consume(state);
                add_reduce(state, 2, 47);
                return 25;
            }
        };
        return - 1;
    }

    function hc_symbols__literal_symbol(state, db, prod) {
        scan(state.lexer, 75, 13);
        if (state.lexer._type == 56) {
            consume(state);
            scan(state.lexer, 76, 13);
            state.push_fn(branch_30c796aa0657deec, 0);
            return hc_symbols__literal_symbol_list_229(state, db, 0);
        } else if (state.lexer._type == 2) {
            state.push_fn(set_production /*26*/, 26);
            consume(state);
            add_reduce(state, 1, 49);
            return 0;
        };
        return - 1;
    }

    function hc_symbols__sym_delimiter(state, db, prod) {
        scan(state.lexer, 77, 0);
        if (state.lexer._type == 8 || state.lexer._type == 1 || state.lexer._type == 7) {
            consume(state);
            return 27;
        };
        return - 1;
    }

    function hc_symbols__escaped_symbol(state, db, prod) {
        scan(state.lexer, 78, 13);
        if (state.lexer._type == 57) {
            consume(state);
            scan(state.lexer, 71, 13);
            if ((state.lexer._type == 5 || state.lexer._type == 3 || state.lexer._type == 2)) {
                state.push_fn(branch_0afa361db3e9ca4a, 28);
                return hc_symbols__escaped_symbol_list_236(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_top_level_instructions_list_21(state, db, prod) {
        state.push_fn(branch_1380b38c2a39bbdf, 29);
        return hc_prod_branch_instruction(state, db, 0);
    }

    function hc_top_level_instructions_list_21_goto(state, db, prod) {
        while (true) {
            switch (prod) {
                case 29:
                    {
                        scan(state.lexer, 19, 4);
                        if (state.lexer._type == 17) {
                            var pk = state.lexer.copy_in_place();;
                            pk.next();
                            scan(pk, 38, 4);
                            if (pk._type == 18) {
                                state.lexer._type = 17;
                                state.push_fn(hc_top_level_instructions_list_21_goto /*hc_top_level_instructions_list_21_goto( state, db, 29 )*/, 29);
                                scan(state.lexer, 15, 4);
                                if ((state.lexer._type == 17)) {
                                    state.push_fn(branch_fd213bbdfe6a98cb, 29);
                                    return hc_prod_branch_instruction(state, db, 0);
                                };
                                return - 1;
                            }
                        }
                    }
                    break;
                default:
                    break;
            };
            break;
        };
        return (prod == 29) ? prod : - 1;
    }

    function hc_top_level_instructions_list_22(state, db, prod) {
        state.push_fn(branch_da0bf47e0ea33042, 30);
        return hc_token_branch_instruction(state, db, 0);
    }

    function hc_top_level_instructions_list_22_goto(state, db, prod) {
        while (true) {
            switch (prod) {
                case 30:
                    {
                        scan(state.lexer, 79, 4);
                        if (state.lexer._type == 21 || state.lexer._type == 22) {
                            state.push_fn(hc_top_level_instructions_list_22_goto /*hc_top_level_instructions_list_22_goto( state, db, 30 )*/, 30);
                            scan(state.lexer, 39, 4);
                            if ((state.lexer._type == 21 || state.lexer._type == 22)) {
                                state.push_fn(branch_fd213bbdfe6a98cb, 30);
                                return hc_token_branch_instruction(state, db, 0);
                            };
                            return - 1;
                        }
                    }
                    break;
                default:
                    break;
            };
            break;
        };
        return (prod == 30) ? prod : - 1;
    }

    function hc_instruction_sequence_list_24(state, db, prod) {
        state.push_fn(branch_d566f16d612348fd, 31);
        return hc_sequence_instruction(state, db, 0);
    }

    function hc_instruction_sequence_list_24_goto(state, db, prod) {
        while (true) {
            switch (prod) {
                case 31:
                    {
                        scan(state.lexer, 80, 4);
                        if (state.lexer._type == 15) {
                            var pk = state.lexer.copy_in_place();;
                            pk.next();
                            scan(pk, 81, 4);
                            if (isTokenActive(pk._type, 36)) {
                                state.lexer._type = 15;
                                state.push_fn(hc_instruction_sequence_list_24_goto /*hc_instruction_sequence_list_24_goto( state, db, 31 )*/, 31);
                                scan(state.lexer, 82, 4);
                                consume(state);
                                state.push_fn(branch_321709d00f9ab56b, 31);
                                return hc_sequence_instruction(state, db, 0);
                            } else if (pk._type == 23) {
                                return 31;
                            }
                        }
                    }
                    break;
                default:
                    break;
            };
            break;
        };
        return (prod == 31) ? prod : - 1;
    }

    function hc_instruction_sequence_list_27(state, db, prod) {
        state.push_fn(branch_fe47fbceb2597240, 32);
        return hc_goto_instruction(state, db, 0);
    }

    function hc_instruction_sequence_list_27_goto(state, db, prod) {
        while (true) {
            switch (prod) {
                case 32:
                    {
                        scan(state.lexer, 80, 4);
                        if (state.lexer._type == 15) {
                            var pk = state.lexer.copy_in_place();;
                            pk.next();
                            scan(pk, 10, 4);
                            if (pk._type == 23) {
                                state.lexer._type = 15;
                                state.push_fn(hc_instruction_sequence_list_27_goto /*hc_instruction_sequence_list_27_goto( state, db, 32 )*/, 32);
                                scan(state.lexer, 82, 4);
                                consume(state);
                                state.push_fn(branch_321709d00f9ab56b, 32);
                                return hc_goto_instruction(state, db, 0);
                            } else if (pk._type == 58) {
                                var fk1 = state.fork(db);;
                                fk1.push_fn(set_production /*32*/, 32);
                                state.push_fn(set_production /*32*/, 32);
                                return 0;
                            }
                        } else {
                            return 32;
                        }
                    }
                    break;
                default:
                    break;
            };
            break;
        };
        return (prod == 32) ? prod : - 1;
    }

    function hc_instruction_sequence_group_28_0_(state, db, prod) {
        scan(state.lexer, 82, 4);
        if (state.lexer._type == 15) {
            consume(state);
            scan(state.lexer, 83, 4);
            if ((state.lexer._type == 58)) {
                consume(state);
                scan(state.lexer, 32, 4);
                if ((state.lexer._type == 13)) {
                    consume(state);
                    add_reduce(state, 3, 53);
                    return 33;
                }
            }
        };
        return - 1;
    }

    function hc_instruction_sequence_group_31_0_(state, db, prod) {
        scan(state.lexer, 82, 4);
        if (state.lexer._type == 15) {
            consume(state);
            scan(state.lexer, 83, 4);
            if ((state.lexer._type == 58)) {
                consume(state);
                scan(state.lexer, 32, 4);
                if ((state.lexer._type == 13)) {
                    consume(state);
                    add_reduce(state, 3, 54);
                    return 34;
                }
            }
        };
        return - 1;
    }

    function hc_sequence_instruction_group_68_0_(state, db, prod) {
        scan(state.lexer, 28, 4);
        if (state.lexer._type == 5) {
            consume(state);
            scan(state.lexer, 4, 4);
            add_reduce(state, 1, 55);
            return 35;
        };
        return - 1;
    }

    function hc_sequence_instruction_list_73(state, db, prod) {
        state.push_fn(branch_a314ad4b9e39ff88, 36);
        return hc_state_reference(state, db, 0);
    }

    function hc_sequence_instruction_list_73_goto(state, db, prod) {
        scan(state.lexer, 84, 4);
        if (state.lexer._type == 59) {
            state.push_fn(hc_sequence_instruction_list_73_goto /*hc_sequence_instruction_list_73_goto( state, db, 36 )*/, 36);
            scan(state.lexer, 85, 4);
            consume(state);
            state.push_fn(branch_321709d00f9ab56b, 36);
            return hc_state_reference(state, db, 0);
        };
        return (prod == 36) ? prod : - 1;
    }

    function hc_sequence_instruction_list_91(state, db, prod) {
        state.push_fn(branch_6ac43545d2ba4a5b, 37);
        return hc_sequence_instruction_group_68_0_(state, db, 0);
    }

    function hc_sequence_instruction_list_91_goto(state, db, prod) {
        scan(state.lexer, 86, 4);
        if (state.lexer._type == 11) {
            return 37;
        } else if (state.lexer._type == 5) {
            state.push_fn(hc_sequence_instruction_list_91_goto /*hc_sequence_instruction_list_91_goto( state, db, 37 )*/, 37);
            scan(state.lexer, 28, 4);
            if ((state.lexer._type == 5)) {
                state.push_fn(branch_fd213bbdfe6a98cb, 37);
                return hc_sequence_instruction_group_68_0_(state, db, 0);
            };
            return - 1;
        };
        return (prod == 37) ? prod : - 1;
    }

    function hc_expected_symbols_group_116_0_(state, db, prod) {
        scan(state.lexer, 87, 4);
        if (state.lexer._type == 60) {
            consume(state);
            scan(state.lexer, 33, 4);
            if ((state.lexer._type == 14)) {
                state.push_fn(branch_233b893dd136257c, 38);
                return hc_token_id_list(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_comment_list_153(state, db, prod) {
        scan(state.lexer, 88, 54);
        if (isTokenActive(state.lexer._type, 71)) {
            consume(state);
            add_reduce(state, 1, 14);
            return hc_comment_list_153_goto(state, db, 39);
        };
        return - 1;
    }

    function hc_comment_list_153_goto(state, db, prod) {
        scan(state.lexer, 60, 54);
        if (state.lexer._type == 2) {
            state.push_fn(hc_comment_list_153_goto /*hc_comment_list_153_goto( state, db, 39 )*/, 39);
            scan(state.lexer, 89, 4);
            consume(state);
            add_reduce(state, 2, 51);
            return 0;
        } else if (state.lexer._type == 8) {
            state.push_fn(hc_comment_list_153_goto /*hc_comment_list_153_goto( state, db, 39 )*/, 39);
            scan(state.lexer, 4, 90);
            consume(state);
            add_reduce(state, 2, 51);
            return 0;
        } else if (state.lexer._type == 7) {
            state.push_fn(hc_comment_list_153_goto /*hc_comment_list_153_goto( state, db, 39 )*/, 39);
            scan(state.lexer, 4, 91);
            consume(state);
            add_reduce(state, 2, 51);
            return 0;
        } else if (state.lexer._type == 3) {
            state.push_fn(hc_comment_list_153_goto /*hc_comment_list_153_goto( state, db, 39 )*/, 39);
            scan(state.lexer, 92, 4);
            consume(state);
            add_reduce(state, 2, 51);
            return 0;
        } else if (state.lexer._type == 5) {
            state.push_fn(hc_comment_list_153_goto /*hc_comment_list_153_goto( state, db, 39 )*/, 39);
            scan(state.lexer, 28, 4);
            consume(state);
            add_reduce(state, 2, 51);
            return 0;
        };
        return (prod == 39) ? prod : - 1;
    }

    function hc_functions__referenced_function_group_155_0_(state, db, prod) {
        state.push_fn(branch_29232f92c66f352e, 40);
        return hc_functions__js_function_start_symbol(state, db, 0);
    }

    function hc_symbols__literal_symbol_list_229(state, db, prod) {
        scan(state.lexer, 93, 4);
        if (state.lexer._type == 5 || state.lexer._type == 3) {
            consume(state);
            add_reduce(state, 1, 57);
            return hc_symbols__literal_symbol_list_229_goto(state, db, 41);
        };
        return - 1;
    }

    function hc_symbols__literal_symbol_list_229_goto(state, db, prod) {
        while (true) {
            switch (prod) {
                case 41:
                    {
                        scan(state.lexer, 5, 0);
                        if (state.lexer._type == 5) {
                            var pk = state.lexer.copy_in_place();;
                            pk.next();
                            scan(pk, 5, 0);
                            if (isTokenActive(pk._type, 5)) {
                                state.lexer._type = 5;
                                state.push_fn(hc_symbols__literal_symbol_list_229_goto /*hc_symbols__literal_symbol_list_229_goto( state, db, 41 )*/, 41);
                                scan(state.lexer, 28, 4);
                                consume(state);
                                add_reduce(state, 2, 42);
                                return 0;
                            }
                        } else if (state.lexer._type == 3) {
                            state.push_fn(hc_symbols__literal_symbol_list_229_goto /*hc_symbols__literal_symbol_list_229_goto( state, db, 41 )*/, 41);
                            scan(state.lexer, 92, 4);
                            consume(state);
                            add_reduce(state, 2, 42);
                            return 0;
                        }
                    }
                    break;
                default:
                    break;
            };
            break;
        };
        return (prod == 41) ? prod : - 1;
    }

    function hc_symbols__escaped_symbol_list_236(state, db, prod) {
        scan(state.lexer, 88, 4);
        if (state.lexer._type == 5 || state.lexer._type == 3 || state.lexer._type == 2) {
            consume(state);
            add_reduce(state, 1, 57);
            return hc_symbols__escaped_symbol_list_236_goto(state, db, 42);
        };
        return - 1;
    }

    function hc_symbols__escaped_symbol_list_236_goto(state, db, prod) {
        scan(state.lexer, 94, 0);
        if (state.lexer._type == 5) {
            state.push_fn(hc_symbols__escaped_symbol_list_236_goto /*hc_symbols__escaped_symbol_list_236_goto( state, db, 42 )*/, 42);
            scan(state.lexer, 28, 4);
            consume(state);
            add_reduce(state, 2, 42);
            return 0;
        } else if (state.lexer._type == 3) {
            state.push_fn(hc_symbols__escaped_symbol_list_236_goto /*hc_symbols__escaped_symbol_list_236_goto( state, db, 42 )*/, 42);
            scan(state.lexer, 92, 4);
            consume(state);
            add_reduce(state, 2, 42);
            return 0;
        } else if (state.lexer._type == 2) {
            state.push_fn(hc_symbols__escaped_symbol_list_236_goto /*hc_symbols__escaped_symbol_list_236_goto( state, db, 42 )*/, 42);
            scan(state.lexer, 89, 4);
            consume(state);
            add_reduce(state, 2, 42);
            return 0;
        };
        return (prod == 42) ? prod : - 1;
    }

    function recognize_primary(string, production) {

        //create the input data buffer. 
        const temp_buffer = new Uint8Array(string.length * 4);

        const actual_length = fillByteBufferWithUTF8FromString(string, temp_buffer, temp_buffer.length);

        const resolved_buffer = new Uint8Array(temp_buffer.buffer, 0, actual_length);

        switch (production) {
            case 0: return recognize(resolved_buffer, actual_length, 0, hc_state_ir);
        }

        return { invalid: {}, valid: {} };
    }

    return {
        init_table: () => {
            const table = new Uint8Array(382976);
            init_table(table);
            return table;
        },
        recognize: recognize_primary,
        create_iterator: data => new ParserStateIterator(data)
    };
});

const reduce_functions = [(_, s) => s[s.length - 1], (env, sym, pos) => ({ type: "state", id: sym[0], instructions: sym[1], fail: sym[2], symbol_meta: sym[3], pos }) /*0*/,
(env, sym, pos) => ({ type: "state", id: sym[0], instructions: sym[1], symbol_meta: sym[2], pos }) /*1*/,
(env, sym, pos) => ({ type: "state", id: sym[0], instructions: sym[1], fail: sym[2], pos }) /*2*/,
(env, sym, pos) => ({ type: "state", id: sym[0], instructions: sym[1], pos }) /*3*/,
(env, sym, pos) => ({ type: "state", id: sym[1], instructions: sym[3], fail: sym[4], symbol_meta: sym[5], pos }) /*4*/,
(env, sym, pos) => ({ type: "state", id: sym[1], instructions: sym[3], symbol_meta: sym[4], pos }) /*5*/,
(env, sym, pos) => ({ type: "state", id: sym[1], instructions: sym[3], fail: sym[4], pos }) /*6*/,
(env, sym, pos) => ({ type: "state", id: sym[1], instructions: sym[3], pos }) /*7*/,
(env, sym, pos) => (sym[2]) /*8*/,
(env, sym, pos) => ([...sym[0], ...sym[2], sym[3]]) /*9*/,
(env, sym, pos) => ([...sym[0], sym[1]]) /*10*/,
(env, sym, pos) => ([...sym[0], ...sym[2]]) /*11*/,
(env, sym, pos) => ([...sym[0]]) /*12*/,
(env, sym, pos) => ([sym[0]]) /*13*/,
(env, sym, pos) => ([]) /*14*/,
(env, sym, pos) => ({ type: "prod", ids: sym[2], instructions: sym[4], pos }) /*15*/,
(env, sym, pos) => ({ type: "peek", ids: sym[1], instructions: sym[3], pos }) /*16*/,
(env, sym, pos) => ({ type: "assert", ids: sym[1], instructions: sym[3], pos }) /*17*/,
(env, sym, pos) => ({ type: "goto", state: sym[1], pos }) /*18*/,
(env, sym, pos) => ({ type: "reduce", len: parseInt(sym[1]), reduce_fn: parseInt(sym[2]), pos }) /*19*/,
(env, sym, pos) => ({ type: "reduce", len: -1, reduce_fn: sym[1], pos }) /*20*/,
(env, sym, pos) => ({ type: "set-prod", id: sym[3], pos }) /*21*/,
(env, sym, pos) => ({ type: "fork-to", states: sym[3], pos }) /*22*/,
(env, sym, pos) => ({ type: sym[1] ? "scan-back-until" : "scan-until", ids: sym[3], pos }) /*23*/,
(env, sym, pos) => ({ type: "token-id", id: sym[3], pos }) /*24*/,
(env, sym, pos) => ({ type: "pass", pos }) /*25*/,
(env, sym, pos) => ({ type: "fail", pos }) /*26*/,
(env, sym, pos) => ({ type: "not-in-scopes", ids: sym[4], pos }) /*27*/,
(env, sym, pos) => ({ type: "set-scope", scope: sym[3], pos }) /*28*/,
(env, sym, pos) => ({ type: "consume", EMPTY: !!sym[1], pos }) /*29*/,
(env, sym, pos) => ({ type: null ? "scan-back-until" : "scan-until", ids: sym[2], pos }) /*30*/,
(env, sym, pos) => ({ type: "consume", pos }) /*31*/,
(env, sym, pos) => ({ type: "on-fail-state", id: sym[2], instructions: sym[3], symbol_meta: sym[5], fail: sym[4], pos }) /*32*/,
(env, sym, pos) => ({ type: "on-fail-state", id: sym[2], instructions: sym[3], symbol_meta: sym[4], pos }) /*33*/,
(env, sym, pos) => ({ type: "on-fail-state", id: sym[2], instructions: sym[3], fail: sym[4], pos }) /*34*/,
(env, sym, pos) => ({ type: "on-fail-state", id: sym[2], instructions: sym[3], pos }) /*35*/,
(env, sym, pos) => ({ type: "symbols", expected: sym[2], skipped: sym[3] || [], pos }) /*36*/,
(env, sym, pos) => ({ type: "symbols", expected: sym[2], skipped: null || [], pos }) /*37*/,
(env, sym, pos) => (sym[1]) /*38*/,
(env, sym, pos) => ({ type: "ref-function", id: sym[1], txt: sym[3] }) /*39*/,
(env, sym, pos) => ("FN:F") /*40*/,
(env, sym, pos) => (sym[0] + sym[1]) /*41*/,
(env, sym, pos) => (sym[0] + sym[1] + sym[2]) /*42*/,
(env, sym, pos) => ({ type: "RETURNED", txt: sym[3], name: "", env: false, ref: "", IS_CONDITION: true }) /*43*/,
(env, sym, pos) => ({ type: "env-function-reference", ref: sym[3] }) /*44*/,
(env, sym, pos) => ({ type: "local-function-reference", ref: sym[3] }) /*45*/,
(env, sym, pos) => ({ type: "generated", val: sym[1], pos: pos, meta: false }) /*46*/,
(env, sym, pos) => ({ type: "exclusive-literal", val: "" + sym[1], pos: pos, meta: false }) /*47*/,
(env, sym, pos) => ({ type: "literal", val: sym[0], pos: pos, meta: false }) /*48*/,
(env, sym, pos) => ({ type: "literal", val: sym[1], pos: pos, meta: false }) /*49*/,
(env, sym, pos) => ((sym[0].push(sym[1]), sym[0])) /*50*/,
(env, sym, pos) => ((sym[0].push(sym[2]), sym[0])) /*51*/,
(env, sym, pos) => ({ type: "repeat-state" }) /*52*/,
(env, sym, pos) => ({ type: "repeat-state", pos }) /*53*/,
(env, sym, pos) => (parseInt(sym[0])) /*54*/,
(env, sym, pos) => (sym[0] + "GG") /*55*/,
(env, sym, pos) => (sym[0] + "") /*56*/];

export default ParserFactory
    (reduce_functions, undefined, recognizer_initializer, { state_ir: 0 });