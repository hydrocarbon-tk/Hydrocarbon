
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


    var token_lookup = new Uint32Array([16392, 0, 0, 16424, 8388608, 0, 512, 0, 0, 384, 16777216, 2162688, 384, 0, 2097152, 134218112, 0, 2097152, 384, 0, 0, 256, 0, 0, 1264824710, 3153862, 0, 428, 0, 0, 128, 0, 0, 1208201220, 8134, 0, 536871296, 0, 0, 536871296, 0, 2097152, 1408, 0, 2097152, 396, 0, 0, 2147484032, 0, 2097152, 4016288174, 87085023, 65536, 4016279982, 87085023, 65536, 384, 32, 0, 33554816, 16777216, 2162688, 384, 16777216, 2097152, 384, 32768, 0, 570425728, 3036676096, 66441, 384, 0, 264192, 384, 0, 2099200, 33554816, 0, 2097152, 384, 0, 2228224, 384, 16384, 0, 384, 3170893824, 2161545, 570425728, 83886080, 67584, 33554816, 0, 2162688, 33554816, 0, 0, 2147484032, 0, 0, 1835250054, 3153862, 0, 384, 598016, 0, 8576, 0, 0, 1107296640, 0, 1114112, 384, 409600, 0, 384, 131072, 0, 384, 262144, 0, 1573248, 0, 0, 384, 3170893824, 2227081, 33554816, 3170893824, 2227081, 23333248, 3145728, 0, 896, 0, 2097152, 1452, 0, 0, 2361728, 0, 0, 2432, 0, 0, 233856, 0, 0, 4480, 0, 0, 0, 0, 0, 16776, 0, 0, 16424, 0, 0, 16384, 0, 0, 8, 0, 0, 32, 0, 0, 33152, 0, 0, 424, 0, 0, 386, 0, 0, 65920, 0, 0, 131456, 0, 0, 262528, 0, 0, 2097536, 0, 0, 20971904, 3145728, 0, 23069058, 3145728, 0, 20971904, 0, 0, 384, 1048576, 0, 384, 2097152, 0, 8397184, 0, 0, 1210298756, 8134, 0, 627048834, 3145728, 0, 23068674, 3145728, 0, 1208201604, 8134, 0, 1478734212, 8134, 0, 268435840, 0, 0, 1835250054, 3149766, 0, 627048450, 3145728, 0, 1208201220, 4038, 0, 1208201604, 4038, 0, 134459396, 70, 0, 0, 3968, 0, 134459780, 70, 0, 4016288166, 87035903, 65536, 3982733702, 3149791, 0, 536973696, 0, 0, 384, 1, 0, 384, 64, 0, 102784, 0, 0, 384, 3968, 0, 384, 4096, 0, 102830, 16448, 0, 102700, 64, 0, 102828, 49216, 0, 102828, 64, 0, 102702, 16448, 0, 384, 2097152, 2097152, 384, 4194304, 2097152, 16808, 8388608, 2097152, 16424, 8388608, 2097152, 0, 0, 2097152, 16384, 0, 2097152, 0, 8388608, 2097152, 32, 0, 2097152, 8, 0, 2097152, 0, 3154116608, 2953, 384, 33554432, 2097152, 1073742208, 0, 2097152, 8608, 0, 2097152, 384, 3154116608, 2100105, 0, 2952790016, 905, 384, 2952790016, 2098057, 416, 0, 2097152, 384, 33554432, 2097168, 384, 1073741824, 2097152, 8608, 0, 0, 384, 0, 2097248, 102816, 0, 0, 384, 0, 2097158, 384, 0, 2097156, 384, 0, 2098176, 8576, 4194304, 0, 102816, 0, 2097152, 384, 0, 2158592, 384, 0, 2097664, 384, 0, 2162688, 388, 0, 0, 392, 0, 0, 416, 0, 0, 430, 0, 0, 1573260, 0, 0, 3355685252, 4038, 0, 33554816, 16777216, 65536, 384, 16777216, 0, 33554816, 16777216, 126976, 384, 0, 61440, 2147492256, 0, 0, 570425728, 83886080, 65536, 384, 2952790016, 265097, 384, 67108864, 0, 384, 0, 262144, 384, 0, 1024, 536871296, 0, 524288, 384, 0, 524288, 2147586464, 0, 0, 384, 0, 1048576, 1073742208, 0, 0]);;
    var token_sequence_lookup = new Uint8Array([47, 42, 47, 64, 73, 71, 78, 79, 82, 69, 103, 111, 116, 111, 95, 116, 111, 107, 101, 110, 92, 35, 60, 62, 43, 62, 124, 40, 69, 88, 67, 41, 91, 93, 63, 61, 58, 58, 36, 101, 109, 112, 116, 121, 123, 125, 94, 61, 62, 102, 111, 114, 107, 45, 115, 121, 109, 98, 111, 108, 115, 58, 44, 69, 78, 68, 95, 79, 70, 95, 80, 82, 79, 68, 85, 67, 84, 73, 79, 78, 97, 115, 115, 101, 114, 116, 65, 83, 70, 79, 82, 75, 114, 101, 116, 117, 114, 110, 111, 110, 112, 114, 111, 100, 98, 97, 99, 107, 117, 110, 116, 105, 108, 101, 110, 103, 116, 104, 105, 100, 101, 120, 112, 101, 99, 116, 101, 100, 110, 111, 99, 111, 110, 115, 117, 109, 101, 64, 73, 77, 80, 79, 82, 84, 103, 58, 116, 104, 101, 110, 60, 61, 40, 69, 82, 82, 36, 101, 111, 102, 97, 105, 108, 115, 107, 105, 112, 112, 101, 100, 114, 101, 100, 117, 99, 101, 112, 97, 115, 115, 101, 110, 100, 116, 107, 58, 116, 58, 60, 91, 40, 73, 71, 78, 40, 82, 83, 84, 40, 82, 69, 68, 40, 42, 40, 43, 102, 58, 115, 116, 97, 116, 101, 115, 99, 97, 110, 115, 101, 116, 114, 101, 112, 101, 97, 116, 112, 101, 101, 107, 112, 111, 112]);;
    function isTokenActive(token_id, row) {
        var index = (row * 3) + (token_id >> 5);;
        var shift = 1 << (31 & (token_id));;
        return (token_lookup[index] & shift) != 0;
    };
    function scan_core(lexer, tk_row) {
        switch ((lexer.get_byte_at(lexer.byte_offset) & 127)) {
            case 35:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 35) {
                        if (isTokenActive(21, tk_row)) {
                            lexer.setToken(21, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 36:
                {
                    if (2 == compare(lexer, lexer.byte_offset, 38, 2, token_sequence_lookup)) {
                        if (lexer.get_byte_at(lexer.byte_offset + 2) == 109) {
                            if (isTokenActive(44, tk_row) && 3 == compare(lexer, lexer.byte_offset + 3, 41, 3, token_sequence_lookup)) {
                                lexer.setToken(44, 6, 6);
                                return;
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 2) == 111) {
                            if (isTokenActive(38, tk_row) && lexer.get_byte_at(lexer.byte_offset + 3) == 102) {
                                lexer.setToken(38, 4, 4);
                                return;
                            }
                        }
                    }
                }
                break;
            case 40:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 40) {
                        if (lexer.get_byte_at(lexer.byte_offset + 1) == 69) {
                            if (lexer.get_byte_at(lexer.byte_offset + 2) == 88) {
                                if (isTokenActive(39, tk_row) && lexer.get_byte_at(lexer.byte_offset + 3) == 67) {
                                    lexer.setToken(39, 4, 4);
                                    return;
                                }
                            } else if (lexer.get_byte_at(lexer.byte_offset + 2) == 82) {
                                if (isTokenActive(40, tk_row) && lexer.get_byte_at(lexer.byte_offset + 3) == 82) {
                                    lexer.setToken(40, 4, 4);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 73) {
                            if (isTokenActive(41, tk_row) && 2 == compare(lexer, lexer.byte_offset + 2, 192, 2, token_sequence_lookup)) {
                                lexer.setToken(41, 4, 4);
                                return;
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 82) {
                            if (lexer.get_byte_at(lexer.byte_offset + 2) == 83) {
                                if (isTokenActive(42, tk_row) && lexer.get_byte_at(lexer.byte_offset + 3) == 84) {
                                    lexer.setToken(42, 4, 4);
                                    return;
                                }
                            } else if (lexer.get_byte_at(lexer.byte_offset + 2) == 69) {
                                if (isTokenActive(43, tk_row) && lexer.get_byte_at(lexer.byte_offset + 3) == 68) {
                                    lexer.setToken(43, 4, 4);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 42) {
                            if (isTokenActive(35, tk_row)) {
                                lexer.setToken(35, 2, 2);
                                return;
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 43) {
                            if (isTokenActive(36, tk_row)) {
                                lexer.setToken(36, 2, 2);
                                return;
                            }
                        } else if (isTokenActive(27, tk_row)) {
                            lexer.setToken(27, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 41:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 41) {
                        if (isTokenActive(29, tk_row)) {
                            lexer.setToken(29, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 42:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 42) {
                        if (lexer.get_byte_at(lexer.byte_offset + 1) == 47) {
                            if (isTokenActive(10, tk_row)) {
                                lexer.setToken(10, 2, 2);
                                return;
                            }
                        } else if (isTokenActive(23, tk_row)) {
                            lexer.setToken(23, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 43:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 43) {
                        if (isTokenActive(24, tk_row) && lexer.get_byte_at(lexer.byte_offset + 1) == 62) {
                            lexer.setToken(24, 2, 2);
                            return;
                        }
                    }
                }
                break;
            case 44:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 44) {
                        if (isTokenActive(83, tk_row)) {
                            lexer.setToken(83, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 45:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 45) {
                        if (isTokenActive(54, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 43, 54, 2) && lexer.byte_length > 1) {
                            return;
                        } else if (isTokenActive(55, tk_row)) {
                            lexer.setToken(55, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 47:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 47) {
                        if (lexer.get_byte_at(lexer.byte_offset + 1) == 42) {
                            if (isTokenActive(85, tk_row) && token_production(lexer, hc_state_ir__comment, 2, 85, 4) && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(9, tk_row)) {
                                lexer.setToken(9, 2, 2);
                                return;
                            }
                        }
                    }
                }
                break;
            case 58:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 58) {
                        if (isTokenActive(37, tk_row) && lexer.get_byte_at(lexer.byte_offset + 1) == 58) {
                            lexer.setToken(37, 2, 2);
                            return;
                        }
                    }
                }
                break;
            case 60:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 60) {
                        if (lexer.get_byte_at(lexer.byte_offset + 1) == 62) {
                            if (isTokenActive(22, tk_row)) {
                                lexer.setToken(22, 2, 2);
                                return;
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 61) {
                            if (isTokenActive(33, tk_row)) {
                                lexer.setToken(33, 2, 2);
                                return;
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 91) {
                            if (isTokenActive(53, tk_row)) {
                                lexer.setToken(53, 2, 2);
                                return;
                            }
                        }
                    }
                }
                break;
            case 61:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 61) {
                        if (isTokenActive(50, tk_row) && lexer.get_byte_at(lexer.byte_offset + 1) == 62) {
                            lexer.setToken(50, 2, 2);
                            return;
                        }
                    }
                }
                break;
            case 62:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 62) {
                        if (isTokenActive(25, tk_row)) {
                            lexer.setToken(25, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 63:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 63) {
                        if (lexer.get_byte_at(lexer.byte_offset + 1) == 61) {
                            if (isTokenActive(34, tk_row)) {
                                lexer.setToken(34, 2, 2);
                                return;
                            }
                        } else if (isTokenActive(32, tk_row)) {
                            lexer.setToken(32, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 64:
                {
                    if (2 == compare(lexer, lexer.byte_offset, 3, 2, token_sequence_lookup)) {
                        if (lexer.get_byte_at(lexer.byte_offset + 2) == 71) {
                            if (isTokenActive(11, tk_row) && 4 == compare(lexer, lexer.byte_offset + 3, 6, 4, token_sequence_lookup)) {
                                lexer.setToken(11, 7, 7);
                                return;
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 2) == 77) {
                            if (isTokenActive(18, tk_row) && 4 == compare(lexer, lexer.byte_offset + 3, 140, 4, token_sequence_lookup)) {
                                lexer.setToken(18, 7, 7);
                                return;
                            }
                        }
                    }
                }
                break;
            case 65:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 65) {
                        if (lexer.get_byte_at(lexer.byte_offset + 1) == 83) {
                            if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(54, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 43, 54, 2) && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(20, tk_row)) {
                                lexer.setToken(20, 2, 2);
                                return;
                            }
                        }
                    }
                }
                break;
            case 70:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 70) {
                        if (3 == compare(lexer, lexer.byte_offset + 1, 89, 3, token_sequence_lookup)) {
                            if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 4) {
                                return;
                            } else if (isTokenActive(54, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 43, 54, 2) && lexer.byte_length > 4) {
                                return;
                            } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 4) {
                                return;
                            } else if (isTokenActive(28, tk_row)) {
                                lexer.setToken(28, 4, 4);
                                return;
                            }
                        }
                    }
                }
                break;
            case 91:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 91) {
                        if (isTokenActive(30, tk_row)) {
                            lexer.setToken(30, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 92:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 92) {
                        if (isTokenActive(16, tk_row)) {
                            lexer.setToken(16, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 93:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 93) {
                        if (isTokenActive(31, tk_row)) {
                            lexer.setToken(31, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 94:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 94) {
                        if (isTokenActive(49, tk_row)) {
                            lexer.setToken(49, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 95:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 95) {
                        if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 1) {
                            return;
                        } else if (isTokenActive(54, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 43, 54, 2) && lexer.byte_length > 1) {
                            return;
                        } else if (isTokenActive(14, tk_row)) {
                            lexer.setToken(14, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 97:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 97) {
                        if (lexer.get_byte_at(lexer.byte_offset + 1) == 115) {
                            if (lexer.get_byte_at(lexer.byte_offset + 2) == 115) {
                                if (3 == compare(lexer, lexer.byte_offset + 3, 83, 3, token_sequence_lookup)) {
                                    if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 6) {
                                        return;
                                    } else if (isTokenActive(54, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 43, 54, 2) && lexer.byte_length > 6) {
                                        return;
                                    } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 6) {
                                        return;
                                    } else if (isTokenActive(79, tk_row)) {
                                        lexer.setToken(79, 6, 6);
                                        return;
                                    }
                                }
                            } else if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(54, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 43, 54, 2) && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(19, tk_row)) {
                                lexer.setToken(19, 2, 2);
                                return;
                            }
                        }
                    }
                }
                break;
            case 98:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 98) {
                        if (3 == compare(lexer, lexer.byte_offset + 1, 105, 3, token_sequence_lookup)) {
                            if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 4) {
                                return;
                            } else if (isTokenActive(54, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 43, 54, 2) && lexer.byte_length > 4) {
                                return;
                            } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 4) {
                                return;
                            } else if (isTokenActive(65, tk_row)) {
                                lexer.setToken(65, 4, 4);
                                return;
                            }
                        }
                    }
                }
                break;
            case 99:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 99) {
                        if (6 == compare(lexer, lexer.byte_offset + 1, 131, 6, token_sequence_lookup)) {
                            if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 7) {
                                return;
                            } else if (isTokenActive(54, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 43, 54, 2) && lexer.byte_length > 7) {
                                return;
                            } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 7) {
                                return;
                            } else if (isTokenActive(77, tk_row)) {
                                lexer.setToken(77, 7, 7);
                                return;
                            }
                        }
                    }
                }
                break;
            case 101:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 101) {
                        if (lexer.get_byte_at(lexer.byte_offset + 1) == 120) {
                            if (6 == compare(lexer, lexer.byte_offset + 2, 122, 6, token_sequence_lookup)) {
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 8) {
                                    return;
                                } else if (isTokenActive(54, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 43, 54, 2) && lexer.byte_length > 8) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 8) {
                                    return;
                                } else if (isTokenActive(81, tk_row)) {
                                    lexer.setToken(81, 8, 8);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 110) {
                            if (lexer.get_byte_at(lexer.byte_offset + 2) == 100) {
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 3) {
                                    return;
                                } else if (isTokenActive(54, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 43, 54, 2) && lexer.byte_length > 3) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 3) {
                                    return;
                                } else if (isTokenActive(72, tk_row)) {
                                    lexer.setToken(72, 3, 3);
                                    return;
                                }
                            }
                        }
                    }
                }
                break;
            case 102:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 102) {
                        if (lexer.get_byte_at(lexer.byte_offset + 1) == 111) {
                            if (2 == compare(lexer, lexer.byte_offset + 2, 51, 2, token_sequence_lookup)) {
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(54, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 43, 54, 2) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(63, tk_row)) {
                                    lexer.setToken(63, 4, 4);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 97) {
                            if (2 == compare(lexer, lexer.byte_offset + 2, 161, 2, token_sequence_lookup)) {
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(54, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 43, 54, 2) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(73, tk_row)) {
                                    lexer.setToken(73, 4, 4);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 58) {
                            if (isTokenActive(52, tk_row)) {
                                lexer.setToken(52, 2, 2);
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
                            if (2 == compare(lexer, lexer.byte_offset + 2, 12, 2, token_sequence_lookup)) {
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(54, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 43, 54, 2) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(75, tk_row)) {
                                    lexer.setToken(75, 4, 4);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 58) {
                            if (isTokenActive(12, tk_row)) {
                                lexer.setToken(12, 2, 2);
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
                            if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(54, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 43, 54, 2) && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(70, tk_row)) {
                                lexer.setToken(70, 2, 2);
                                return;
                            }
                        }
                    }
                }
                break;
            case 108:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 108) {
                        if (5 == compare(lexer, lexer.byte_offset + 1, 113, 5, token_sequence_lookup)) {
                            if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 6) {
                                return;
                            } else if (isTokenActive(54, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 43, 54, 2) && lexer.byte_length > 6) {
                                return;
                            } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 6) {
                                return;
                            } else if (isTokenActive(69, tk_row)) {
                                lexer.setToken(69, 6, 6);
                                return;
                            }
                        }
                    }
                }
                break;
            case 110:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 110) {
                        if (8 == compare(lexer, lexer.byte_offset + 1, 129, 8, token_sequence_lookup)) {
                            if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 9) {
                                return;
                            } else if (isTokenActive(54, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 43, 54, 2) && lexer.byte_length > 9) {
                                return;
                            } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 9) {
                                return;
                            } else if (isTokenActive(76, tk_row)) {
                                lexer.setToken(76, 9, 9);
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
                            if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(54, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 43, 54, 2) && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(56, tk_row)) {
                                lexer.setToken(56, 2, 2);
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
                            if (2 == compare(lexer, lexer.byte_offset + 2, 102, 2, token_sequence_lookup)) {
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(54, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 43, 54, 2) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(57, tk_row)) {
                                    lexer.setToken(57, 4, 4);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 97) {
                            if (2 == compare(lexer, lexer.byte_offset + 2, 178, 2, token_sequence_lookup)) {
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(54, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 43, 54, 2) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(71, tk_row)) {
                                    lexer.setToken(71, 4, 4);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 101) {
                            if (2 == compare(lexer, lexer.byte_offset + 2, 228, 2, token_sequence_lookup)) {
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(54, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 43, 54, 2) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(78, tk_row)) {
                                    lexer.setToken(78, 4, 4);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 111) {
                            if (lexer.get_byte_at(lexer.byte_offset + 2) == 112) {
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 3) {
                                    return;
                                } else if (isTokenActive(54, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 43, 54, 2) && lexer.byte_length > 3) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 3) {
                                    return;
                                } else if (isTokenActive(67, tk_row)) {
                                    lexer.setToken(67, 3, 3);
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
                            if (lexer.get_byte_at(lexer.byte_offset + 2) == 116) {
                                if (3 == compare(lexer, lexer.byte_offset + 3, 95, 3, token_sequence_lookup)) {
                                    if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 6) {
                                        return;
                                    } else if (isTokenActive(54, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 43, 54, 2) && lexer.byte_length > 6) {
                                        return;
                                    } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 6) {
                                        return;
                                    } else if (isTokenActive(51, tk_row)) {
                                        lexer.setToken(51, 6, 6);
                                        return;
                                    }
                                }
                            } else if (lexer.get_byte_at(lexer.byte_offset + 2) == 100) {
                                if (3 == compare(lexer, lexer.byte_offset + 3, 173, 3, token_sequence_lookup)) {
                                    if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 6) {
                                        return;
                                    } else if (isTokenActive(54, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 43, 54, 2) && lexer.byte_length > 6) {
                                        return;
                                    } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 6) {
                                        return;
                                    } else if (isTokenActive(60, tk_row)) {
                                        lexer.setToken(60, 6, 6);
                                        return;
                                    }
                                }
                            } else if (lexer.get_byte_at(lexer.byte_offset + 2) == 112) {
                                if (3 == compare(lexer, lexer.byte_offset + 3, 223, 3, token_sequence_lookup)) {
                                    if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 6) {
                                        return;
                                    } else if (isTokenActive(54, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 43, 54, 2) && lexer.byte_length > 6) {
                                        return;
                                    } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 6) {
                                        return;
                                    } else if (isTokenActive(82, tk_row)) {
                                        lexer.setToken(82, 6, 6);
                                        return;
                                    }
                                }
                            }
                        } else if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 1) {
                            return;
                        } else if (isTokenActive(54, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 43, 54, 2) && lexer.byte_length > 1) {
                            return;
                        } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 1) {
                            return;
                        } else if (isTokenActive(45, tk_row)) {
                            lexer.setToken(45, 1, 1);
                            return;
                        } else if (isTokenActive(48, tk_row)) {
                            lexer.setToken(48, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 115:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 115) {
                        if (lexer.get_byte_at(lexer.byte_offset + 1) == 121) {
                            if (6 == compare(lexer, lexer.byte_offset + 2, 56, 6, token_sequence_lookup)) {
                                if (isTokenActive(80, tk_row)) {
                                    lexer.setToken(80, 8, 8);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 107) {
                            if (5 == compare(lexer, lexer.byte_offset + 2, 165, 5, token_sequence_lookup)) {
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 7) {
                                    return;
                                } else if (isTokenActive(54, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 43, 54, 2) && lexer.byte_length > 7) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 7) {
                                    return;
                                } else if (isTokenActive(84, tk_row)) {
                                    lexer.setToken(84, 7, 7);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 116) {
                            if (3 == compare(lexer, lexer.byte_offset + 2, 210, 3, token_sequence_lookup)) {
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 5) {
                                    return;
                                } else if (isTokenActive(54, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 43, 54, 2) && lexer.byte_length > 5) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 5) {
                                    return;
                                } else if (isTokenActive(74, tk_row)) {
                                    lexer.setToken(74, 5, 5);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 99) {
                            if (2 == compare(lexer, lexer.byte_offset + 2, 215, 2, token_sequence_lookup)) {
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(54, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 43, 54, 2) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(64, tk_row)) {
                                    lexer.setToken(64, 4, 4);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 101) {
                            if (lexer.get_byte_at(lexer.byte_offset + 2) == 116) {
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 3) {
                                    return;
                                } else if (isTokenActive(54, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 43, 54, 2) && lexer.byte_length > 3) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 3) {
                                    return;
                                } else if (isTokenActive(61, tk_row)) {
                                    lexer.setToken(61, 3, 3);
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
                                if (2 == compare(lexer, lexer.byte_offset + 3, 18, 2, token_sequence_lookup)) {
                                    if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 5) {
                                        return;
                                    } else if (isTokenActive(54, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 43, 54, 2) && lexer.byte_length > 5) {
                                        return;
                                    } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 5) {
                                        return;
                                    } else if (isTokenActive(68, tk_row)) {
                                        lexer.setToken(68, 5, 5);
                                        return;
                                    }
                                }
                            } else if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(54, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 43, 54, 2) && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(62, tk_row)) {
                                lexer.setToken(62, 2, 2);
                                return;
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 104) {
                            if (2 == compare(lexer, lexer.byte_offset + 2, 148, 2, token_sequence_lookup)) {
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(54, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 43, 54, 2) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(58, tk_row)) {
                                    lexer.setToken(58, 4, 4);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 107) {
                            if (lexer.get_byte_at(lexer.byte_offset + 2) == 58) {
                                if (isTokenActive(17, tk_row)) {
                                    lexer.setToken(17, 3, 3);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 58) {
                            if (isTokenActive(15, tk_row)) {
                                lexer.setToken(15, 2, 2);
                                return;
                            }
                        }
                    }
                }
                break;
            case 117:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 117) {
                        if (4 == compare(lexer, lexer.byte_offset + 1, 109, 4, token_sequence_lookup)) {
                            if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 5) {
                                return;
                            } else if (isTokenActive(54, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 43, 54, 2) && lexer.byte_length > 5) {
                                return;
                            } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 5) {
                                return;
                            } else if (isTokenActive(66, tk_row)) {
                                lexer.setToken(66, 5, 5);
                                return;
                            }
                        }
                    }
                }
                break;
            case 123:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 123) {
                        if (isTokenActive(46, tk_row)) {
                            lexer.setToken(46, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 124:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 124) {
                        if (isTokenActive(26, tk_row)) {
                            lexer.setToken(26, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 125:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 125) {
                        if (isTokenActive(47, tk_row)) {
                            lexer.setToken(47, 1, 1);
                            return;
                        }
                    }
                }
                break;
            default:
                break;
        };
        if (isTokenActive(13, tk_row) && pre_scan(lexer, 0) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1)) {
            return;
        } else if (isTokenActive(54, tk_row) && pre_scan(lexer, 1) && token_production(lexer, hc_state_ir__state_hash_token, 43, 54, 2)) {
            return;
        } else if (isTokenActive(85, tk_row) && pre_scan(lexer, 2) && token_production(lexer, hc_state_ir__comment, 2, 85, 4)) {
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

    function branch_02bfe59766d6b396(state, db, prod) {
        scan(state.lexer, 3, 4);
        if (state.lexer._type == 80) {
            state.push_fn(set_production /*55*/, 55);
            state.push_fn(branch_8ceaeba9586a303b, 55);
            return hc_state_ir__expected_symbols(state, db, 0);
        } else {
            add_reduce(state, 3, 86);
            return 55;
        };
        return - 1;
    }

    function branch_0343b27417d5a952(state, db, prod) {
        scan(state.lexer, 5, 4);
        if ((state.lexer._type == 27)) {
            consume(state);
            state.push_fn(branch_3eac4f2aababb191, 52);
            return hc_state_ir__instruction_sequence(state, db, 0);
        };
        return - 1;
    }

    function branch_0526046b5bcfc41e(state, db, prod) {
        scan(state.lexer, 6, 7);
        if ((state.lexer._type == 7)) {
            consume(state);
            add_reduce(state, 6, 10);
            return 15;
        };
        return - 1;
    }

    function branch_087458d2d7409900(state, db, prod) {
        state.push_fn(branch_c0640b2eb3fb2142, 48);
        return hc_symbols__imported_production_symbol(state, db, 0);
    }

    function branch_0940142aa77b09d7(state, db, prod) {
        scan(state.lexer, 6, 7);
        if ((state.lexer._type == 7)) {
            consume(state);
            add_reduce(state, 3, 3);
            return 5;
        };
        return - 1;
    }

    function branch_0a8da5cd5eb8ef7f(state, db, prod) {
        add_reduce(state, 4, 50);
        return 0;
    }

    function branch_0ea313d051fdb33e(state, db, prod) {
        add_reduce(state, 1, 1);
        return hc_state_ir__top_level_instructions_list_274_goto(state, db, 67);
    }

    function branch_0f0766dec6708635(state, db, prod) {
        scan(state.lexer, 8, 6);
        if (state.lexer._type == 21) {
            var pk = state.lexer.copy_in_place();;
            pk.next();
            scan(pk, 9, 10);
            if (pk._type == 2 || pk._type == 3 || pk._type == 5 || pk._type == 8) {
                state.lexer._type = 21;
                state.push_fn(set_production /*21*/, 21);
                state.push_fn(branch_13917f90bec6929b, 21);
                return hc_production_bodies__production_bodies(state, db, 0);
            }
        } else if (isTokenActive(state.lexer._type, 11)) {
            state.push_fn(set_production /*21*/, 21);
            state.push_fn(branch_13917f90bec6929b, 21);
            return hc_production_bodies__production_bodies(state, db, 0);
        } else {
            add_reduce(state, 4, 22);
            return 21;
        };
        return - 1;
    }

    function branch_0fc07dc5190000f5(state, db, prod) {
        add_reduce(state, 3, 85);
        return 0;
    }

    function branch_13917f90bec6929b(state, db, prod) {
        add_reduce(state, 5, 19);
        return 0;
    }

    function branch_152680e8cb3da748(state, db, prod) {
        add_reduce(state, 1, 14);
        return 0;
    }

    function branch_15422f020b54d119(state, db, prod) {
        add_reduce(state, 1, 91);
        return 65;
    }

    function branch_1da8bd40ab43d283(state, db, prod) {
        scan(state.lexer, 12, 6);
        if ((state.lexer._type == 29)) {
            consume(state);
            add_reduce(state, 3, 44);
            return 0;
        };
        return - 1;
    }

    function branch_1df29885fc317625(state, db, prod) {
        add_reduce(state, 4, 58);
        return 0;
    }

    function branch_1f79bb4d7b73bee7(state, db, prod) {
        add_reduce(state, 1, 30);
        return 0;
    }

    function branch_21fba8cfbfd80691(state, db, prod) {
        state.push_fn(branch_a5ea4d7730ea3b87, 13);
        return hc_symbols__sym_delimiter(state, db, 0);
    }

    function branch_2300da260527859a(state, db, prod) {
        add_reduce(state, 2, 34);
        return 0;
    }

    function branch_24a50a0a2fcd20e0(state, db, prod) {
        add_reduce(state, 3, 40);
        return 30;
    }

    function branch_28283839a02fa4df(state, db, prod) {
        scan(state.lexer, 13, 4);
        if ((state.lexer._type == 29)) {
            consume(state);
            add_reduce(state, 5, 76);
            return 0;
        };
        return - 1;
    }

    function branch_295a7de147955fe2(state, db, prod) {
        add_reduce(state, 2, 18);
        return 0;
    }

    function branch_2c96ceb1b4ce68b9(state, db, prod) {
        scan(state.lexer, 14, 4);
        if ((state.lexer._type == 10)) {
            consume(state);
            add_reduce(state, 3, 0);
            return 0;
        };
        return - 1;
    }

    function branch_2d0c7425918eb69d(state, db, prod) {
        add_reduce(state, 2, 33);
        return 0;
    }

    function branch_2e9618619a5aaf89(state, db, prod) {
        add_reduce(state, 1, 1);
        return hc_symbols__condition_symbol_list_goto(state, db, 34);
    }

    function branch_2ee62dc869fb9119(state, db, prod) {
        add_reduce(state, 2, 74);
        return 51;
    }

    function branch_304781a6134d6f78(state, db, prod) {
        add_reduce(state, 1, 90);
        return 63;
    }

    function branch_321cf8c8907be6d4(state, db, prod) {
        add_reduce(state, 2, 26);
        return 0;
    }

    function branch_33c2a840c49adaf5(state, db, prod) {
        scan(state.lexer, 15, 6);
        state.push_fn(branch_ea5b50d322c16f8b, 0);
        return hc_preambles__import_preamble_list_59(state, db, 0);
    }

    function branch_34533d2c3f3e24c8(state, db, prod) {
        state.push_fn(branch_c0640b2eb3fb2142, 48);
        return hc_symbols__production_symbol(state, db, 0);
    }

    function branch_393331f50c7809aa(state, db, prod) {
        add_reduce(state, 3, 40);
        return 0;
    }

    function branch_39c52208cb564705(state, db, prod) {
        state.push_fn(branch_70b173f01e791829, 17);
        return hc_comments__comment_delimiter(state, db, 0);
    }

    function branch_3dcdbd04fc8c06c9(state, db, prod) {
        add_reduce(state, 2, 8);
        return 14;
    }

    function branch_3eac4f2aababb191(state, db, prod) {
        scan(state.lexer, 13, 4);
        if ((state.lexer._type == 29)) {
            consume(state);
            add_reduce(state, 5, 75);
            return 0;
        };
        return - 1;
    }

    function branch_3ed4dd99a9465876(state, db, prod) {
        add_reduce(state, 1, 1);
        return hc_symbols__ignore_symbols_goto(state, db, 6);
    }

    function branch_3f89443451a23e6d(state, db, prod) {
        add_reduce(state, 3, 24);
        return 0;
    }

    function branch_40e4337463d2865c(state, db, prod) {
        add_reduce(state, 5, 25);
        return 0;
    }

    function branch_449740ceb8df7fb1(state, db, prod) {
        add_reduce(state, 2, 2);
        return 0;
    }

    function branch_48fab4c983fae22f(state, db, prod) {
        add_reduce(state, 3, 6);
        return 0;
    }

    function branch_4af99ea1a5d8d1f4(state, db, prod) {
        scan(state.lexer, 6, 10);
        state.push_fn(branch_d2e819c5a06147bd, 0);
        return hc_preambles__import_preamble_list_58(state, db, 0);
    }

    function branch_4e6cf3fc64a8e706(state, db, prod) {
        add_reduce(state, 5, 80);
        return 0;
    }

    function branch_4e73c85e3b71fd44(state, db, prod) {
        add_reduce(state, 2, 17);
        return 0;
    }

    function branch_4f05a3c8dd774d75(state, db, prod) {
        add_reduce(state, 1, 1);
        return hc_state_ir__instruction_sequence_list_285_goto(state, db, 69);
    }

    function branch_53c7b8a1453ec235(state, db, prod) {
        add_reduce(state, 1, 18);
        return 0;
    }

    function branch_53ebcacbd46edaaf(state, db, prod) {
        scan(state.lexer, 16, 4);
        if ((state.lexer._type == 31)) {
            consume(state);
            add_reduce(state, 3, 57);
            return 46;
        };
        return - 1;
    }

    function branch_54c6214b083ed3d4(state, db, prod) {
        add_reduce(state, 2, 16);
        return 0;
    }

    function branch_55317960f3c8e361(state, db, prod) {
        scan(state.lexer, 17, 0);
        if (state.lexer._type == 8 || state.lexer._type == 1 || state.lexer._type == 7) {
            var pk = state.lexer.copy_in_place();;
            pk.next();
            scan(pk, 18, 0);
            if (isTokenActive(pk._type, 18)) {
                state.lexer._type = 8;
                state.push_fn(set_production /*11*/, 11);
                state.push_fn(branch_48fab4c983fae22f, 11);
                return hc_symbols__sym_delimiter(state, db, 0);
            }
        } else {
            add_reduce(state, 2, 6);
            return 11;
        };
        return - 1;
    }

    function branch_55f88e86c67f5aa6(state, db, prod) {
        scan(state.lexer, 19, 6);
        if ((state.lexer._type == 37)) {
            consume(state);
            state.push_fn(branch_24a50a0a2fcd20e0, 30);
            return hc_symbols__identifier(state, db, 0);
        };
        return - 1;
    }

    function branch_5781a4da88baae5d(state, db, prod) {
        add_reduce(state, 4, 49);
        return 0;
    }

    function branch_5c7d02c44c5fb206(state, db, prod) {
        scan(state.lexer, 20, 4);
        if (state.lexer._type == 56) {
            scan(state.lexer, 21, 4);
            state.push_fn(branch_843c18443d760563, 0);
            return hc_state_ir__on_fail(state, db, 0);
        } else if (state.lexer._type == 80) {
            state.push_fn(set_production /*42*/, 42);
            state.push_fn(branch_670c51d59cd01486, 42);
            return hc_state_ir__expected_symbols(state, db, 0);
        } else if (state.lexer._type == 25) {
            state.push_fn(set_production /*42*/, 42);
            consume(state);
            add_reduce(state, 5, 55);
            return 0;
        };
        return - 1;
    }

    function branch_5cb267bf74038e65(state, db, prod) {
        add_reduce(state, 1, 1);
        return 0;
    }

    function branch_5fd3dd332586fd03(state, db, prod) {
        state.push_fn(branch_bf6fc030bbf1df47, 21);
        return hc_production_bodies__production_bodies(state, db, 0);
    }

    function branch_652613835caea075(state, db, prod) {
        scan(state.lexer, 22, 6);
        if ((state.lexer._type == 47)) {
            consume(state);
            add_reduce(state, 5, 54);
            return 41;
        };
        return - 1;
    }

    function branch_65cda27952837374(state, db, prod) {
        scan(state.lexer, 23, 6);
        if (state.lexer._type == 58) {
            var pk = state.lexer.copy_in_place();;
            pk.next();
            scan(pk, 24, 6);
            if (pk._type == 75) {
                consume(state);
                scan(state.lexer, 25, 4);
                state.push_fn(branch_ab9a4dca896983f2, 0);
                return hc_state_ir__instruction_sequence_list_288(state, db, 0);
            } else {
                state.lexer._type = 58;
                state.push_fn(set_production /*47*/, 47);
                state.push_fn(branch_c672daf1948e48fe, 47);
                return hc_state_ir__instruction_sequence_group_289_0_(state, db, 0);
            }
        } else {
            add_reduce(state, 1, 61);
            return 47;
        };
        return - 1;
    }

    function branch_670c51d59cd01486(state, db, prod) {
        scan(state.lexer, 26, 4);
        if ((state.lexer._type == 25)) {
            consume(state);
            add_reduce(state, 6, 55);
            return 0;
        };
        return - 1;
    }

    function branch_696b725e3519d874(state, db, prod) {
        scan(state.lexer, 6, 7);
        if ((state.lexer._type == 7)) {
            consume(state);
            add_reduce(state, 7, 9);
            return 15;
        };
        return - 1;
    }

    function branch_6aa92a607ea83a69(state, db, prod) {
        scan(state.lexer, 12, 6);
        if ((state.lexer._type == 29)) {
            consume(state);
            add_reduce(state, 3, 46);
            return 0;
        };
        return - 1;
    }

    function branch_6c2551b212f892e6(state, db, prod) {
        state.push_fn(branch_5fd3dd332586fd03, 21);
        return hc_productions__production_start_symbol(state, db, 0);
    }

    function branch_6c45df92a6be2941(state, db, prod) {
        add_reduce(state, 1, 13);
        return 0;
    }

    function branch_6d1edf43c2037af1(state, db, prod) {
        add_reduce(state, 4, 68);
        return 0;
    }

    function branch_6dca5481a1cc8332(state, db, prod) {
        add_reduce(state, 1, 1);
        return hc_state_ir__instruction_sequence_list_288_goto(state, db, 70);
    }

    function branch_6ddf665d02514ef7(state, db, prod) {
        scan(state.lexer, 12, 6);
        if ((state.lexer._type == 29)) {
            consume(state);
            add_reduce(state, 3, 45);
            return 0;
        };
        return - 1;
    }

    function branch_6eb9dfeee7481361(state, db, prod) {
        scan(state.lexer, 20, 4);
        if (state.lexer._type == 80) {
            var pk = state.lexer.copy_in_place();;
            pk.next();
            scan(pk, 27, 4);
            if (pk._type == 81) {
                state.lexer._type = 80;
                state.push_fn(set_production /*53*/, 53);
                state.push_fn(branch_ee62328d33dc5c53, 53);
                return hc_state_ir__expected_symbols(state, db, 0);
            }
        } else {
            add_reduce(state, 5, 81);
            return 53;
        };
        return - 1;
    }

    function branch_7023a6958ee3b3d8(state, db, prod) {
        scan(state.lexer, 28, 6);
        if ((state.lexer._type == 46)) {
            consume(state);
            state.push_fn(branch_652613835caea075, 41);
            return hc_functions__js_data(state, db, 0);
        };
        return - 1;
    }

    function branch_70b173f01e791829(state, db, prod) {
        add_reduce(state, 3, 11);
        return 17;
    }

    function branch_748b752b66a42bd8(state, db, prod) {
        state.push_fn(branch_c417a0113f98071e, 1);
        return hc_productions__productions(state, db, 0);
    }

    function branch_77895a800343abdf(state, db, prod) {
        add_reduce(state, 4, 21);
        return 0;
    }

    function branch_78561f70d9e4f31a(state, db, prod) {
        scan(state.lexer, 29, 4);
        state.push_fn(branch_d872054bb84237f8, 0);
        return hc_state_ir__top_level_instructions(state, db, 0);
    }

    function branch_7b625870b619653b(state, db, prod) {
        add_reduce(state, 3, 40);
        add_reduce(state, 1, 1);
        return 0;
    }

    function branch_7c01ef7b8c999e1d(state, db, prod) {
        scan(state.lexer, 12, 6);
        if ((state.lexer._type == 29)) {
            consume(state);
            add_reduce(state, 3, 42);
            return 0;
        };
        return - 1;
    }

    function branch_7ce9f13b7dadd87a(state, db, prod) {
        add_reduce(state, 1, 1);
        return hc_production_bodies__body_entry_list_131_goto(state, db, 64);
    }

    function branch_7ee351687b00ac20(state, db, prod) {
        scan(state.lexer, 5, 4);
        if ((state.lexer._type == 27)) {
            consume(state);
            state.push_fn(branch_80979b8e9006c537, 52);
            return hc_state_ir__instruction_sequence(state, db, 0);
        };
        return - 1;
    }

    function branch_7fee1fd836a4199f(state, db, prod) {
        scan(state.lexer, 30, 6);
        if (state.lexer._type == 58) {
            state.push_fn(set_production /*47*/, 47);
            state.push_fn(branch_c672daf1948e48fe, 47);
            return hc_state_ir__instruction_sequence_group_289_0_(state, db, 0);
        } else {
            add_reduce(state, 1, 61);
            return 47;
        };
        return - 1;
    }

    function branch_80979b8e9006c537(state, db, prod) {
        scan(state.lexer, 13, 4);
        if ((state.lexer._type == 29)) {
            consume(state);
            add_reduce(state, 5, 77);
            return 0;
        };
        return - 1;
    }

    function branch_817bdac52fba0e2d(state, db, prod) {
        state.push_fn(branch_c4f6028c85697bde, 49);
        return hc_symbols__imported_production_symbol(state, db, 0);
    }

    function branch_8288cbfd3f7ac238(state, db, prod) {
        add_reduce(state, 2, 29);
        return 0;
    }

    function branch_82b4f72cf1c0f657(state, db, prod) {
        add_reduce(state, 2, 4);
        return 8;
    }

    function branch_843c18443d760563(state, db, prod) {
        scan(state.lexer, 31, 4);
        if (state.lexer._type == 80) {
            state.push_fn(set_production /*42*/, 42);
            state.push_fn(branch_86688ca403db8cd9, 42);
            return hc_state_ir__expected_symbols(state, db, 0);
        } else if (state.lexer._type == 25) {
            state.push_fn(set_production /*42*/, 42);
            consume(state);
            add_reduce(state, 6, 55);
            return 0;
        };
        return - 1;
    }

    function branch_86688ca403db8cd9(state, db, prod) {
        scan(state.lexer, 26, 4);
        if ((state.lexer._type == 25)) {
            consume(state);
            add_reduce(state, 7, 55);
            return 0;
        };
        return - 1;
    }

    function branch_886622e797836e9c(state, db, prod) {
        scan(state.lexer, 32, 6);
        state.push_fn(branch_0f0766dec6708635, 0);
        return hc_productions__production_start_symbol(state, db, 0);
    }

    function branch_8ceaeba9586a303b(state, db, prod) {
        add_reduce(state, 4, 55);
        return 0;
    }

    function branch_8cf04bae4b087a61(state, db, prod) {
        scan(state.lexer, 5, 4);
        if ((state.lexer._type == 27)) {
            consume(state);
            state.push_fn(branch_90ebe0973bae6ee2, 45);
            return hc_state_ir__instruction_sequence(state, db, 0);
        };
        return - 1;
    }

    function branch_8e14cc5b254736d6(state, db, prod) {
        add_reduce(state, 3, 72);
        return 0;
    }

    function branch_909e21da22e2c6f9(state, db, prod) {
        add_reduce(state, 1, 89);
        return 62;
    }

    function branch_90ebe0973bae6ee2(state, db, prod) {
        scan(state.lexer, 13, 4);
        if ((state.lexer._type == 29)) {
            consume(state);
            add_reduce(state, 6, 56);
            return 45;
        };
        return - 1;
    }

    function branch_938fa336439bc975(state, db, prod) {
        add_reduce(state, 4, 65);
        return 0;
    }

    function branch_9401f31d8b204205(state, db, prod) {
        scan(state.lexer, 33, 6);
        if ((state.lexer._type == 31)) {
            consume(state);
            add_reduce(state, 3, 31);
            return 0;
        };
        return - 1;
    }

    function branch_940b188c26446a70(state, db, prod) {
        scan(state.lexer, 12, 6);
        if ((state.lexer._type == 29)) {
            consume(state);
            add_reduce(state, 3, 35);
            return 0;
        };
        return - 1;
    }

    function branch_99616e14773c051a(state, db, prod) {
        scan(state.lexer, 5, 4);
        if ((state.lexer._type == 27)) {
            consume(state);
            state.push_fn(branch_28283839a02fa4df, 52);
            return hc_state_ir__instruction_sequence(state, db, 0);
        };
        return - 1;
    }

    function branch_9b6c4dced8f2edfe(state, db, prod) {
        scan(state.lexer, 8, 6);
        if (state.lexer._type == 21) {
            var pk = state.lexer.copy_in_place();;
            pk.next();
            scan(pk, 9, 10);
            if (pk._type == 2 || pk._type == 3 || pk._type == 5 || pk._type == 8) {
                state.lexer._type = 21;
                state.push_fn(set_production /*21*/, 21);
                state.push_fn(branch_77895a800343abdf, 21);
                return hc_production_bodies__production_bodies(state, db, 0);
            }
        } else if (isTokenActive(state.lexer._type, 11)) {
            state.push_fn(set_production /*21*/, 21);
            state.push_fn(branch_77895a800343abdf, 21);
            return hc_production_bodies__production_bodies(state, db, 0);
        } else {
            add_reduce(state, 3, 23);
            return 21;
        };
        return - 1;
    }

    function branch_9c5f118cce267b77(state, db, prod) {
        scan(state.lexer, 16, 4);
        if ((state.lexer._type == 31)) {
            consume(state);
            add_reduce(state, 3, 57);
            return 50;
        };
        return - 1;
    }

    function branch_9f87ce540ab6fc2f(state, db, prod) {
        scan(state.lexer, 34, 6);
        if (state.lexer._type == 52) {
            var pk = state.lexer.copy_in_place();;
            pk.next();
            scan(pk, 35, 6);
            if (pk._type == 51 || pk._type == 45) {
                state.lexer._type = 52;
                state.push_fn(set_production /*25*/, 25);
                state.push_fn(branch_40e4337463d2865c, 25);
                return hc_functions__reduce_function(state, db, 0);
            }
        } else {
            add_reduce(state, 4, 27);
            return 25;
        };
        return - 1;
    }

    function branch_a2b25744ffdec2a6(state, db, prod) {
        scan(state.lexer, 36, 6);
        if ((state.lexer._type == 13)) {
            state.push_fn(branch_a4df0bdb7906c18c, 68);
            return hc_symbols__production_symbol(state, db, 0);
        };
        return - 1;
    }

    function branch_a3ee7c279a39400e(state, db, prod) {
        add_reduce(state, 4, 83);
        return 0;
    }

    function branch_a4df0bdb7906c18c(state, db, prod) {
        add_reduce(state, 2, 2);
        return hc_state_ir__production_id_list_list_283_goto(state, db, 68);
    }

    function branch_a54dcd17db5146af(state, db, prod) {
        add_reduce(state, 1, 88);
        return hc_comments__cm_list_74_goto(state, db, 61);
    }

    function branch_a5ea4d7730ea3b87(state, db, prod) {
        add_reduce(state, 3, 7);
        return 13;
    }

    function branch_a86c63114d80e399(state, db, prod) {
        scan(state.lexer, 13, 4);
        if ((state.lexer._type == 29)) {
            consume(state);
            add_reduce(state, 5, 64);
            return 0;
        };
        return - 1;
    }

    function branch_a8f40054ec0d4b3b(state, db, prod) {
        scan(state.lexer, 22, 6);
        if ((state.lexer._type == 47)) {
            consume(state);
            add_reduce(state, 5, 48);
            return 0;
        };
        return - 1;
    }

    function branch_a99f454ffce529bc(state, db, prod) {
        add_reduce(state, 2, 15);
        return 0;
    }

    function branch_ab9a4dca896983f2(state, db, prod) {
        scan(state.lexer, 30, 6);
        if (state.lexer._type == 58) {
            state.push_fn(set_production /*47*/, 47);
            state.push_fn(branch_1df29885fc317625, 47);
            return hc_state_ir__instruction_sequence_group_289_0_(state, db, 0);
        } else {
            add_reduce(state, 3, 60);
            return 47;
        };
        return - 1;
    }

    function branch_ac10ac41a23db645(state, db, prod) {
        add_reduce(state, 1, 1);
        return hc_preambles__preamble_goto(state, db, 3);
    }

    function branch_b054a590f9a0797a(state, db, prod) {
        scan(state.lexer, 34, 6);
        if (state.lexer._type == 52) {
            var pk = state.lexer.copy_in_place();;
            pk.next();
            scan(pk, 35, 6);
            if (pk._type == 51 || pk._type == 45) {
                state.lexer._type = 52;
                state.push_fn(set_production /*25*/, 25);
                state.push_fn(branch_321cf8c8907be6d4, 25);
                return hc_functions__reduce_function(state, db, 0);
            }
        } else {
            add_reduce(state, 1, 28);
            return 25;
        };
        return - 1;
    }

    function branch_b1149613280ecffe(state, db, prod) {
        add_reduce(state, 1, 12);
        return 0;
    }

    function branch_b3014a9a843e8839(state, db, prod) {
        scan(state.lexer, 12, 6);
        if ((state.lexer._type == 29)) {
            consume(state);
            add_reduce(state, 4, 36);
            return 0;
        };
        return - 1;
    }

    function branch_b32bd79666e47a64(state, db, prod) {
        add_reduce(state, 1, 39);
        return 29;
    }

    function branch_b6b2871a1bdd67be(state, db, prod) {
        scan(state.lexer, 29, 4);
        state.push_fn(branch_f66bf28493a4b421, 0);
        return hc_state_ir__top_level_instructions(state, db, 0);
    }

    function branch_b9e90b3efe5b799b(state, db, prod) {
        state.push_fn(branch_c4f6028c85697bde, 49);
        return hc_symbols__production_symbol(state, db, 0);
    }

    function branch_bd53cb3d83921fab(state, db, prod) {
        scan(state.lexer, 36, 6);
        if ((state.lexer._type == 13)) {
            state.push_fn(branch_a4df0bdb7906c18c, 68);
            return hc_symbols__imported_production_symbol(state, db, 0);
        };
        return - 1;
    }

    function branch_bec0454eae6de651(state, db, prod) {
        scan(state.lexer, 32, 6);
        state.push_fn(branch_9b6c4dced8f2edfe, 0);
        return hc_productions__production_start_symbol(state, db, 0);
    }

    function branch_bf6fc030bbf1df47(state, db, prod) {
        add_reduce(state, 4, 20);
        return 0;
    }

    function branch_c0640b2eb3fb2142(state, db, prod) {
        add_reduce(state, 4, 63);
        return 48;
    }

    function branch_c10a151c1c98b71b(state, db, prod) {
        scan(state.lexer, 12, 6);
        if ((state.lexer._type == 29)) {
            consume(state);
            add_reduce(state, 3, 43);
            return 0;
        };
        return - 1;
    }

    function branch_c3b394ed23efbde6(state, db, prod) {
        scan(state.lexer, 37, 6);
        if (state.lexer._type == 84) {
            state.push_fn(set_production /*54*/, 54);
            state.push_fn(branch_a3ee7c279a39400e, 54);
            return hc_state_ir__expected_symbols_group_392_0_(state, db, 0);
        } else {
            add_reduce(state, 3, 84);
            return 54;
        };
        return - 1;
    }

    function branch_c417a0113f98071e(state, db, prod) {
        add_reduce(state, 2, 0);
        return 0;
    }

    function branch_c43b53ea566121a3(state, db, prod) {
        add_reduce(state, 1, 1);
        return hc_state_ir__sequence_instruction_list_313_goto(state, db, 72);
    }

    function branch_c4f6028c85697bde(state, db, prod) {
        scan(state.lexer, 16, 4);
        if ((state.lexer._type == 31)) {
            consume(state);
            add_reduce(state, 4, 73);
            return 49;
        };
        return - 1;
    }

    function branch_c58138841976db30(state, db, prod) {
        scan(state.lexer, 22, 6);
        if ((state.lexer._type == 47)) {
            consume(state);
            add_reduce(state, 3, 53);
            return 40;
        };
        return - 1;
    }

    function branch_c672daf1948e48fe(state, db, prod) {
        add_reduce(state, 2, 59);
        return 0;
    }

    function branch_c70100ba3d2b54fa(state, db, prod) {
        state.push_fn(branch_7023a6958ee3b3d8, 41);
        return hc_symbols__identifier(state, db, 0);
    }

    function branch_d07c431f9c738df5(state, db, prod) {
        scan(state.lexer, 13, 4);
        if ((state.lexer._type == 29)) {
            consume(state);
            add_reduce(state, 5, 78);
            return 0;
        };
        return - 1;
    }

    function branch_d0f0ef763b0295ee(state, db, prod) {
        scan(state.lexer, 35, 6);
        if (state.lexer._type == 45) {
            var pk = state.lexer.copy_in_place();;
            pk.next();
            scan(pk, 38, 6);
            if (pk._type == 46) {
                state.lexer._type = 45;
                state.push_fn(set_production /*36*/, 36);
                consume(state);
                scan(state.lexer, 28, 6);
                if ((state.lexer._type == 46)) {
                    consume(state);
                    state.push_fn(branch_a8f40054ec0d4b3b, 36);
                    return hc_functions__js_data(state, db, 0);
                };
                return - 1;
            } else if (pk._type == 49) {
                state.lexer._type = 48;
                state.push_fn(set_production /*36*/, 36);
                consume(state);
                scan(state.lexer, 39, 6);
                if ((state.lexer._type == 49)) {
                    consume(state);
                    state.push_fn(branch_5781a4da88baae5d, 36);
                    return hc_symbols__identifier(state, db, 0);
                };
                return - 1;
            } else {
                state.lexer._type = 48;
                state.push_fn(set_production /*36*/, 36);
                consume(state);
                scan(state.lexer, 40, 6);
                if ((state.lexer._type == 50)) {
                    consume(state);
                    state.push_fn(branch_0a8da5cd5eb8ef7f, 36);
                    return hc_symbols__identifier(state, db, 0);
                };
                return - 1;
            }
        } else if (state.lexer._type == 51) {
            consume(state);
            scan(state.lexer, 38, 6);
            if (state.lexer._type == 46) {
                state.push_fn(set_production /*36*/, 36);
                consume(state);
                state.push_fn(branch_a8f40054ec0d4b3b, 36);
                return hc_functions__js_data(state, db, 0);
            } else if (state.lexer._type == 49) {
                state.push_fn(set_production /*36*/, 36);
                consume(state);
                state.push_fn(branch_5781a4da88baae5d, 36);
                return hc_symbols__identifier(state, db, 0);
            } else if (state.lexer._type == 50) {
                state.push_fn(set_production /*36*/, 36);
                consume(state);
                state.push_fn(branch_0a8da5cd5eb8ef7f, 36);
                return hc_symbols__identifier(state, db, 0);
            }
        };
        return - 1;
    }

    function branch_d2e819c5a06147bd(state, db, prod) {
        scan(state.lexer, 41, 6);
        if (state.lexer._type == 19 || state.lexer._type == 20) {
            consume(state);
            state.push_fn(branch_0526046b5bcfc41e, 15);
            return hc_symbols__identifier(state, db, 0);
        };
        return - 1;
    }

    function branch_d3400930c5643292(state, db, prod) {
        scan(state.lexer, 41, 6);
        if (state.lexer._type == 19 || state.lexer._type == 20) {
            consume(state);
            state.push_fn(branch_696b725e3519d874, 15);
            return hc_symbols__identifier(state, db, 0);
        };
        return - 1;
    }

    function branch_d872054bb84237f8(state, db, prod) {
        scan(state.lexer, 42, 4);
        if (state.lexer._type == 56) {
            scan(state.lexer, 21, 4);
            state.push_fn(branch_02bfe59766d6b396, 0);
            return hc_state_ir__on_fail(state, db, 0);
        } else if (state.lexer._type == 80) {
            state.push_fn(set_production /*55*/, 55);
            state.push_fn(branch_0fc07dc5190000f5, 55);
            return hc_state_ir__expected_symbols(state, db, 0);
        } else {
            add_reduce(state, 2, 87);
            return 55;
        };
        return - 1;
    }

    function branch_da861fb127c979a7(state, db, prod) {
        add_reduce(state, 2, 5);
        return 0;
    }

    function branch_dc98fe1b877ab7ad(state, db, prod) {
        add_reduce(state, 1, 1);
        return hc_state_ir__top_level_instructions_list_273_goto(state, db, 66);
    }

    function branch_df62a20ead16ba2a(state, db, prod) {
        add_reduce(state, 1, 52);
        return 0;
    }

    function branch_ea5b50d322c16f8b(state, db, prod) {
        scan(state.lexer, 6, 10);
        state.push_fn(branch_d3400930c5643292, 0);
        return hc_preambles__import_preamble_list_58(state, db, 0);
    }

    function branch_ee62328d33dc5c53(state, db, prod) {
        add_reduce(state, 6, 79);
        return 0;
    }

    function branch_f66bf28493a4b421(state, db, prod) {
        scan(state.lexer, 43, 4);
        if (state.lexer._type == 56) {
            scan(state.lexer, 21, 4);
            state.push_fn(branch_6eb9dfeee7481361, 0);
            return hc_state_ir__on_fail(state, db, 0);
        } else if (state.lexer._type == 80) {
            var pk = state.lexer.copy_in_place();;
            pk.next();
            scan(pk, 27, 4);
            if (pk._type == 81) {
                state.lexer._type = 80;
                state.push_fn(set_production /*53*/, 53);
                state.push_fn(branch_4e6cf3fc64a8e706, 53);
                return hc_state_ir__expected_symbols(state, db, 0);
            }
        } else {
            add_reduce(state, 4, 82);
            return 53;
        };
        return - 1;
    }

    function branch_f95bb695f66b5425(state, db, prod) {
        add_reduce(state, 2, 57);
        return 75;
    }

    function branch_fc223ef145b2fb03(state, db, prod) {
        scan(state.lexer, 5, 4);
        if ((state.lexer._type == 27)) {
            consume(state);
            state.push_fn(branch_d07c431f9c738df5, 52);
            return hc_state_ir__instruction_sequence(state, db, 0);
        };
        return - 1;
    }

    function hc_hydrocarbon(state, db, prod) {
        state.push_fn(set_production /*0*/, 0);
        return hc_head(state, db, 0);
    }

    function hc_head(state, db, prod) {
        scan(state.lexer, 44, 6);
        if (state.lexer._type == 22 || state.lexer._type == 24 || state.lexer._type == 53 || state.lexer._type == 52) {
            state.push_fn(set_production /*1*/, 1);
            state.push_fn(set_production /*0*/, 1);
            return hc_productions__productions(state, db, 0);
        } else {
            state.push_fn(set_production /*1*/, 1);
            state.push_fn(branch_748b752b66a42bd8, 1);
            return hc_preambles__preamble(state, db, 0);
        };
        return - 1;
    }

    function hc_state_ir__comment(state, db, prod) {
        scan(state.lexer, 45, 4);
        if (state.lexer._type == 9) {
            consume(state);
            scan(state.lexer, 46, 0);
            if (state.lexer._type == 10) {
                state.push_fn(set_production /*2*/, 2);
                consume(state);
                add_reduce(state, 2, 0);
                return 0;
            } else {
                state.push_fn(set_production /*2*/, 2);
                state.push_fn(branch_2c96ceb1b4ce68b9, 2);
                return hc_state_ir__comment_list_6(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_preambles__preamble(state, db, prod) {
        state.push_fn(branch_ac10ac41a23db645, 3);
        return hc_preambles__preamble_clause(state, db, 0);
    }

    function hc_preambles__preamble_goto(state, db, prod) {
        scan(state.lexer, 44, 6);
        if (state.lexer._type == 11 || state.lexer._type == 18 || state.lexer._type == 21) {
            state.push_fn(hc_preambles__preamble_goto /*hc_preambles__preamble_goto( state, db, 3 )*/, 3);
            scan(state.lexer, 47, 6);
            if ((state.lexer._type == 11 || state.lexer._type == 18 || state.lexer._type == 21)) {
                state.push_fn(branch_449740ceb8df7fb1, 3);
                return hc_preambles__preamble_clause(state, db, 0);
            };
            return - 1;
        };
        return (prod == 3) ? prod : - 1;
    }

    function hc_preambles__preamble_clause(state, db, prod) {
        scan(state.lexer, 47, 6);
        if (state.lexer._type == 11) {
            state.push_fn(set_production /*4*/, 4);
            state.push_fn(set_production /*0*/, 4);
            return hc_preambles__ignore_preamble(state, db, 0);
        } else if (state.lexer._type == 18) {
            state.push_fn(set_production /*4*/, 4);
            state.push_fn(set_production /*0*/, 4);
            return hc_preambles__import_preamble(state, db, 0);
        } else {
            state.push_fn(set_production /*4*/, 4);
            state.push_fn(set_production /*0*/, 4);
            return hc_comments__comment(state, db, 0);
        };
        return - 1;
    }

    function hc_preambles__ignore_preamble(state, db, prod) {
        scan(state.lexer, 48, 6);
        if (state.lexer._type == 11) {
            consume(state);
            scan(state.lexer, 49, 6);
            if ((state.lexer._type == 12 || state.lexer._type == 15 || state.lexer._type == 16 || state.lexer._type == 17)) {
                state.push_fn(branch_0940142aa77b09d7, 5);
                return hc_symbols__ignore_symbols(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_symbols__ignore_symbols(state, db, prod) {
        state.push_fn(branch_3ed4dd99a9465876, 6);
        return hc_symbols__ignore_symbol(state, db, 0);
    }

    function hc_symbols__ignore_symbols_goto(state, db, prod) {
        scan(state.lexer, 49, 7);
        if (state.lexer._type == 12 || state.lexer._type == 15 || state.lexer._type == 16 || state.lexer._type == 17) {
            state.push_fn(hc_symbols__ignore_symbols_goto /*hc_symbols__ignore_symbols_goto( state, db, 6 )*/, 6);
            scan(state.lexer, 49, 6);
            if ((state.lexer._type == 12 || state.lexer._type == 15 || state.lexer._type == 16 || state.lexer._type == 17)) {
                state.push_fn(branch_449740ceb8df7fb1, 6);
                return hc_symbols__ignore_symbol(state, db, 0);
            };
            return - 1;
        };
        return (prod == 6) ? prod : - 1;
    }

    function hc_symbols__ignore_symbol(state, db, prod) {
        scan(state.lexer, 49, 6);
        if (state.lexer._type == 12) {
            state.push_fn(set_production /*7*/, 7);
            state.push_fn(set_production /*0*/, 7);
            return hc_symbols__generated_symbol(state, db, 0);
        } else if (state.lexer._type == 15) {
            state.push_fn(set_production /*7*/, 7);
            state.push_fn(set_production /*0*/, 7);
            return hc_symbols__literal_symbol(state, db, 0);
        } else if (state.lexer._type == 16) {
            state.push_fn(set_production /*7*/, 7);
            state.push_fn(set_production /*0*/, 7);
            return hc_symbols__escaped_symbol(state, db, 0);
        } else {
            state.push_fn(set_production /*7*/, 7);
            state.push_fn(set_production /*0*/, 7);
            return hc_symbols__production_token_symbol(state, db, 0);
        };
        return - 1;
    }

    function hc_symbols__generated_symbol(state, db, prod) {
        scan(state.lexer, 50, 6);
        if (state.lexer._type == 12) {
            consume(state);
            scan(state.lexer, 36, 6);
            if ((state.lexer._type == 13)) {
                state.push_fn(branch_82b4f72cf1c0f657, 8);
                return hc_symbols__identifier(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_symbols__identifier(state, db, prod) {
        scan(state.lexer, 36, 6);
        if (state.lexer._type == 13) {
            consume(state);
            scan(state.lexer, 51, 0);
            return 9;
        };
        return - 1;
    }

    function hc_symbols__identifier_syms(state, db, prod) {
        scan(state.lexer, 52, 6);
        if (state.lexer._type == 14 || state.lexer._type == 3) {
            consume(state);
            return hc_symbols__identifier_syms_goto(state, db, 10);
        };
        return - 1;
    }

    function hc_symbols__identifier_syms_goto(state, db, prod) {
        scan(state.lexer, 53, 0);
        if (state.lexer._type == 14) {
            state.push_fn(hc_symbols__identifier_syms_goto /*hc_symbols__identifier_syms_goto( state, db, 10 )*/, 10);
            scan(state.lexer, 54, 0);
            consume(state);
            add_reduce(state, 2, 5);
            return 0;
        } else if (state.lexer._type == 3) {
            state.push_fn(hc_symbols__identifier_syms_goto /*hc_symbols__identifier_syms_goto( state, db, 10 )*/, 10);
            scan(state.lexer, 55, 0);
            consume(state);
            add_reduce(state, 2, 5);
            return 0;
        } else if (state.lexer._type == 5) {
            state.push_fn(hc_symbols__identifier_syms_goto /*hc_symbols__identifier_syms_goto( state, db, 10 )*/, 10);
            scan(state.lexer, 56, 0);
            consume(state);
            add_reduce(state, 2, 5);
            return 0;
        };
        return (prod == 10) ? prod : - 1;
    }

    function hc_symbols__literal_symbol(state, db, prod) {
        scan(state.lexer, 57, 6);
        if (state.lexer._type == 15) {
            consume(state);
            scan(state.lexer, 58, 6);
            state.push_fn(branch_55317960f3c8e361, 0);
            return hc_symbols__literal_symbol_list_47(state, db, 0);
        };
        return - 1;
    }

    function hc_symbols__sym_delimiter(state, db, prod) {
        scan(state.lexer, 59, 0);
        if (state.lexer._type == 8 || state.lexer._type == 1 || state.lexer._type == 7) {
            consume(state);
            return 12;
        };
        return - 1;
    }

    function hc_symbols__escaped_symbol(state, db, prod) {
        scan(state.lexer, 60, 6);
        if (state.lexer._type == 16) {
            consume(state);
            scan(state.lexer, 9, 6);
            if ((state.lexer._type == 5 || state.lexer._type == 3 || state.lexer._type == 2)) {
                state.push_fn(branch_21fba8cfbfd80691, 13);
                return hc_symbols__escaped_symbol_list_53(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_symbols__production_token_symbol(state, db, prod) {
        scan(state.lexer, 61, 6);
        if (state.lexer._type == 17) {
            consume(state);
            scan(state.lexer, 36, 6);
            if ((state.lexer._type == 13)) {
                state.push_fn(branch_3dcdbd04fc8c06c9, 14);
                return hc_symbols__identifier(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_preambles__import_preamble(state, db, prod) {
        scan(state.lexer, 62, 6);
        if (state.lexer._type == 18) {
            consume(state);
            scan(state.lexer, 15, 10);
            if (state.lexer._type == 8) {
                scan(state.lexer, 6, 10);
                state.push_fn(branch_33c2a840c49adaf5, 0);
                return hc_preambles__import_preamble_list_58(state, db, 0);
            } else {
                scan(state.lexer, 15, 6);
                state.push_fn(branch_4af99ea1a5d8d1f4, 0);
                return hc_preambles__import_preamble_list_59(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_comments__comment(state, db, prod) {
        state.push_fn(set_production /*16*/, 16);
        return hc_comments__cm(state, db, 0);
    }

    function hc_comments__cm(state, db, prod) {
        scan(state.lexer, 63, 6);
        if (state.lexer._type == 21) {
            consume(state);
            scan(state.lexer, 9, 10);
            if ((state.lexer._type == 2 || state.lexer._type == 3 || state.lexer._type == 5 || state.lexer._type == 8)) {
                state.push_fn(branch_39c52208cb564705, 17);
                return hc_comments__cm_list_74(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_comments__comment_primitive(state, db, prod) {
        scan(state.lexer, 9, 10);
        if (state.lexer._type == 2 || state.lexer._type == 3 || state.lexer._type == 5 || state.lexer._type == 8) {
            consume(state);
            return 18;
        };
        return - 1;
    }

    function hc_comments__comment_delimiter(state, db, prod) {
        scan(state.lexer, 6, 7);
        if (state.lexer._type == 7) {
            consume(state);
            scan(state.lexer, 6, 6);
            return 19;
        };
        return - 1;
    }

    function hc_productions__productions(state, db, prod) {
        scan(state.lexer, 64, 6);
        if (state.lexer._type == 22 || state.lexer._type == 24) {
            state.push_fn(hc_productions__productions_goto /*hc_productions__productions_goto( state, db, 20 )*/, 20);
            state.push_fn(branch_b1149613280ecffe, 20);
            return hc_productions__production(state, db, 0);
        } else if (state.lexer._type == 52) {
            state.push_fn(hc_productions__productions_goto /*hc_productions__productions_goto( state, db, 20 )*/, 20);
            state.push_fn(branch_6c45df92a6be2941, 20);
            return hc_functions__referenced_function(state, db, 0);
        } else {
            state.push_fn(hc_productions__productions_goto /*hc_productions__productions_goto( state, db, 20 )*/, 20);
            state.push_fn(branch_152680e8cb3da748, 20);
            return hc_state_ir__grammar_injection(state, db, 0);
        };
        return - 1;
    }

    function hc_productions__productions_goto(state, db, prod) {
        while (true) {
            switch (prod) {
                case 20:
                    {
                        scan(state.lexer, 65, 6);
                        if (state.lexer._type == 22 || state.lexer._type == 24) {
                            state.push_fn(hc_productions__productions_goto /*hc_productions__productions_goto( state, db, 20 )*/, 20);
                            scan(state.lexer, 66, 6);
                            if ((state.lexer._type == 22 || state.lexer._type == 24)) {
                                state.push_fn(branch_a99f454ffce529bc, 20);
                                return hc_productions__production(state, db, 0);
                            };
                            return - 1;
                        } else if (state.lexer._type == 52) {
                            state.push_fn(hc_productions__productions_goto /*hc_productions__productions_goto( state, db, 20 )*/, 20);
                            scan(state.lexer, 67, 6);
                            if ((state.lexer._type == 52)) {
                                state.push_fn(branch_54c6214b083ed3d4, 20);
                                return hc_functions__referenced_function(state, db, 0);
                            };
                            return - 1;
                        } else if (state.lexer._type == 53) {
                            state.push_fn(hc_productions__productions_goto /*hc_productions__productions_goto( state, db, 20 )*/, 20);
                            scan(state.lexer, 68, 6);
                            if ((state.lexer._type == 53)) {
                                state.push_fn(branch_4e73c85e3b71fd44, 20);
                                return hc_state_ir__grammar_injection(state, db, 0);
                            };
                            return - 1;
                        } else if (state.lexer._type == 21) {
                            state.push_fn(hc_productions__productions_goto /*hc_productions__productions_goto( state, db, 20 )*/, 20);
                            scan(state.lexer, 63, 6);
                            if ((state.lexer._type == 21)) {
                                state.push_fn(branch_295a7de147955fe2, 20);
                                return hc_comments__comment(state, db, 0);
                            };
                            return - 1;
                        } else {
                            return 20;
                        }
                    }
                    break;
                default:
                    break;
            };
            break;
        };
        return (prod == 20) ? prod : - 1;
    }

    function hc_productions__production(state, db, prod) {
        scan(state.lexer, 66, 6);
        if (state.lexer._type == 22) {
            consume(state);
            scan(state.lexer, 69, 6);
            if (state.lexer._type == 23) {
                consume(state);
                scan(state.lexer, 36, 6);
                state.push_fn(branch_886622e797836e9c, 0);
                return hc_productions__production_group_94_0_(state, db, 0);
            } else {
                scan(state.lexer, 36, 6);
                state.push_fn(branch_bec0454eae6de651, 0);
                return hc_productions__production_group_94_0_(state, db, 0);
            }
        } else if (state.lexer._type == 24) {
            state.push_fn(set_production /*21*/, 21);
            consume(state);
            state.push_fn(branch_6c2551b212f892e6, 21);
            return hc_productions__production_group_99_0_(state, db, 0);
        };
        return - 1;
    }

    function hc_symbols__production_id(state, db, prod) {
        state.push_fn(set_production /*22*/, 22);
        return hc_symbols__identifier(state, db, 0);
    }

    function hc_productions__production_start_symbol(state, db, prod) {
        scan(state.lexer, 32, 6);
        if (state.lexer._type == 25) {
            consume(state);
            scan(state.lexer, 6, 6);
            return 23;
        };
        return - 1;
    }

    function hc_production_bodies__production_bodies(state, db, prod) {
        scan(state.lexer, 70, 6);
        if (state.lexer._type == 21) {
            state.push_fn(hc_production_bodies__production_bodies_goto /*hc_production_bodies__production_bodies_goto( state, db, 24 )*/, 24);
            state.push_fn(branch_5cb267bf74038e65, 24);
            return hc_comments__comment(state, db, 0);
        } else {
            state.push_fn(hc_production_bodies__production_bodies_goto /*hc_production_bodies__production_bodies_goto( state, db, 24 )*/, 24);
            state.push_fn(branch_5cb267bf74038e65, 24);
            return hc_production_bodies__production_body(state, db, 0);
        };
        return - 1;
    }

    function hc_production_bodies__production_bodies_goto(state, db, prod) {
        while (true) {
            switch (prod) {
                case 24:
                    {
                        scan(state.lexer, 71, 6);
                        if (state.lexer._type == 26) {
                            consume(state);
                            scan(state.lexer, 70, 6);
                            if (state.lexer._type == 21) {
                                state.push_fn(hc_production_bodies__production_bodies_goto /*hc_production_bodies__production_bodies_goto( state, db, 24 )*/, 24);
                                state.push_fn(branch_3f89443451a23e6d, 24);
                                return hc_comments__comment(state, db, 0);
                            } else {
                                state.push_fn(hc_production_bodies__production_bodies_goto /*hc_production_bodies__production_bodies_goto( state, db, 24 )*/, 24);
                                state.push_fn(branch_3f89443451a23e6d, 24);
                                return hc_production_bodies__production_body(state, db, 0);
                            }
                        } else if (isTokenActive(state.lexer._type, 72)) {
                            return 24;
                        }
                    }
                    break;
                default:
                    break;
            };
            break;
        };
        return (prod == 24) ? prod : - 1;
    }

    function hc_production_bodies__production_body(state, db, prod) {
        scan(state.lexer, 73, 6);
        if (state.lexer._type == 27) {
            var pk = state.lexer.copy_in_place();;
            pk.next();
            scan(pk, 74, 6);
            if (pk._type == 28) {
                consume(state);
                scan(state.lexer, 75, 6);
                if (state.lexer._type == 28) {
                    consume(state);
                    scan(state.lexer, 12, 6);
                    if (state.lexer._type == 29) {
                        consume(state);
                        scan(state.lexer, 73, 6);
                        state.push_fn(branch_9f87ce540ab6fc2f, 0);
                        return hc_production_bodies__entries(state, db, 0);
                    }
                }
            } else {
                scan(state.lexer, 73, 6);
                state.push_fn(branch_b054a590f9a0797a, 0);
                return hc_production_bodies__entries(state, db, 0);
            }
        } else {
            scan(state.lexer, 73, 6);
            state.push_fn(branch_b054a590f9a0797a, 0);
            return hc_production_bodies__entries(state, db, 0);
        };
        return - 1;
    }

    function hc_production_bodies__entries(state, db, prod) {
        scan(state.lexer, 73, 6);
        if (state.lexer._type == 44) {
            state.push_fn(hc_production_bodies__entries_goto /*hc_production_bodies__entries_goto( state, db, 26 )*/, 26);
            state.push_fn(branch_1f79bb4d7b73bee7, 26);
            return hc_symbols__empty_symbol(state, db, 0);
        } else {
            state.push_fn(hc_production_bodies__entries_goto /*hc_production_bodies__entries_goto( state, db, 26 )*/, 26);
            state.push_fn(branch_53c7b8a1453ec235, 26);
            return hc_production_bodies__body_entry(state, db, 0);
        };
        return - 1;
    }

    function hc_production_bodies__entries_goto(state, db, prod) {
        while (true) {
            switch (prod) {
                case 26:
                    {
                        scan(state.lexer, 76, 6);
                        if (isTokenActive(state.lexer._type, 77)) {
                            return 26;
                        } else if (isTokenActive(state.lexer._type, 78)) {
                            state.push_fn(hc_production_bodies__entries_goto /*hc_production_bodies__entries_goto( state, db, 26 )*/, 26);
                            scan(state.lexer, 79, 6);
                            if ((isTokenActive(state.lexer._type, 78))) {
                                state.push_fn(branch_8288cbfd3f7ac238, 26);
                                return hc_production_bodies__body_entry(state, db, 0);
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
        return (prod == 26) ? prod : - 1;
    }

    function hc_production_bodies__body_entry(state, db, prod) {
        scan(state.lexer, 79, 6);
        if (isTokenActive(state.lexer._type, 80)) {
            state.push_fn(set_production /*27*/, 27);
            state.push_fn(branch_5cb267bf74038e65, 27);
            return hc_symbols__symbol(state, db, 0);
        } else if (isTokenActive(state.lexer._type, 81)) {
            state.push_fn(set_production /*27*/, 27);
            state.push_fn(branch_5cb267bf74038e65, 27);
            return hc_symbols__meta_symbol(state, db, 0);
        } else if (state.lexer._type == 30) {
            state.push_fn(set_production /*27*/, 27);
            consume(state);
            state.push_fn(branch_9401f31d8b204205, 27);
            return hc_production_bodies__body_entry_list_131(state, db, 0);
        };
        return - 1;
    }

    function hc_symbols__symbol(state, db, prod) {
        scan(state.lexer, 82, 6);
        if (state.lexer._type == 33) {
            state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 28 )*/, 28);
            consume(state);
            state.push_fn(branch_2d0c7425918eb69d, 28);
            return hc_symbols__symbol(state, db, 0);
        } else if (state.lexer._type == 34) {
            state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 28 )*/, 28);
            consume(state);
            state.push_fn(branch_2300da260527859a, 28);
            return hc_symbols__symbol(state, db, 0);
        } else if (state.lexer._type == 12) {
            state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 28 )*/, 28);
            state.push_fn(set_production /*0*/, 28);
            return hc_symbols__generated_symbol(state, db, 0);
        } else if (state.lexer._type == 17) {
            state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 28 )*/, 28);
            state.push_fn(set_production /*0*/, 28);
            return hc_symbols__production_token_symbol(state, db, 0);
        } else if (state.lexer._type == 15) {
            state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 28 )*/, 28);
            state.push_fn(set_production /*0*/, 28);
            return hc_symbols__literal_symbol(state, db, 0);
        } else if (state.lexer._type == 16) {
            state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 28 )*/, 28);
            state.push_fn(set_production /*0*/, 28);
            return hc_symbols__escaped_symbol(state, db, 0);
        } else if (state.lexer._type == 38) {
            state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 28 )*/, 28);
            state.push_fn(set_production /*0*/, 28);
            return hc_symbols__EOF_symbol(state, db, 0);
        } else if (state.lexer._type == 27) {
            state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 28 )*/, 28);
            consume(state);
            state.push_fn(branch_940b188c26446a70, 28);
            return hc_production_bodies__production_bodies(state, db, 0);
        } else if (state.lexer._type == 13) {
            state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 9 )*/, 9);
            state.push_fn(set_production /*0*/, 9);
            return hc_symbols__identifier(state, db, prod);
        } else if (state.lexer._type == 2) {
            state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 28 )*/, 28);
            consume(state);
            add_reduce(state, 1, 37);
            return 0;
        };
        return - 1;
    }

    function hc_symbols__symbol_goto(state, db, prod) {
        while (true) {
            switch (prod) {
                case 9:
                    {
                        scan(state.lexer, 83, 6);
                        if (state.lexer._type == 37) {
                            state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 28 )*/, 28);
                            scan(state.lexer, 19, 6);
                            consume(state);
                            state.push_fn(branch_393331f50c7809aa, 28);
                            return hc_symbols__identifier(state, db, 0);
                        } else {
                            scan(state.lexer, 6, 6);
                            add_reduce(state, 1, 39);
                            prod = 28;
                            continue;
                        };
                        break;
                    }
                    break;
                case 28:
                    {
                        scan(state.lexer, 84, 6);
                        if (state.lexer._type == 29) {
                            return 28;
                        } else if (state.lexer._type == 35 || state.lexer._type == 36) {
                            consume(state);
                            scan(state.lexer, 85, 6);
                            if (state.lexer._type == 12 || state.lexer._type == 15 || state.lexer._type == 16) {
                                state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 28 )*/, 28);
                                state.push_fn(branch_b3014a9a843e8839, 28);
                                return hc_symbols__terminal_symbol(state, db, 0);
                            } else if (state.lexer._type == 29) {
                                state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 28 )*/, 28);
                                consume(state);
                                add_reduce(state, 3, 38);
                                return 0;
                            }
                        } else if (state.lexer._type == 32) {
                            state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 28 )*/, 28);
                            scan(state.lexer, 86, 6);
                            consume(state);
                            add_reduce(state, 2, 32);
                            return 0;
                        };
                        break;
                    }
                    break;
                default:
                    break;
            };
            break;
        };
        return (prod == 28) ? prod : - 1;
    }

    function hc_symbols__production_symbol(state, db, prod) {
        state.push_fn(branch_b32bd79666e47a64, 29);
        return hc_symbols__identifier(state, db, 0);
    }

    function hc_symbols__imported_production_symbol(state, db, prod) {
        state.push_fn(branch_55f88e86c67f5aa6, 30);
        return hc_symbols__identifier(state, db, 0);
    }

    function hc_symbols__EOF_symbol(state, db, prod) {
        scan(state.lexer, 87, 6);
        if (state.lexer._type == 38) {
            consume(state);
            scan(state.lexer, 10, 10);
            add_reduce(state, 1, 41);
            return 31;
        };
        return - 1;
    }

    function hc_symbols__terminal_symbol(state, db, prod) {
        scan(state.lexer, 88, 6);
        if (state.lexer._type == 12) {
            state.push_fn(set_production /*32*/, 32);
            state.push_fn(set_production /*0*/, 32);
            return hc_symbols__generated_symbol(state, db, 0);
        } else if (state.lexer._type == 15) {
            state.push_fn(set_production /*32*/, 32);
            state.push_fn(set_production /*0*/, 32);
            return hc_symbols__literal_symbol(state, db, 0);
        } else {
            state.push_fn(set_production /*32*/, 32);
            state.push_fn(set_production /*0*/, 32);
            return hc_symbols__escaped_symbol(state, db, 0);
        };
        return - 1;
    }

    function hc_symbols__meta_symbol(state, db, prod) {
        scan(state.lexer, 89, 6);
        if (state.lexer._type == 39) {
            state.push_fn(set_production /*33*/, 33);
            consume(state);
            state.push_fn(branch_7c01ef7b8c999e1d, 33);
            return hc_symbols__condition_symbol_list(state, db, 0);
        } else if (state.lexer._type == 40) {
            state.push_fn(set_production /*33*/, 33);
            consume(state);
            state.push_fn(branch_c10a151c1c98b71b, 33);
            return hc_symbols__condition_symbol_list(state, db, 0);
        } else if (state.lexer._type == 41) {
            state.push_fn(set_production /*33*/, 33);
            consume(state);
            state.push_fn(branch_1da8bd40ab43d283, 33);
            return hc_symbols__condition_symbol_list(state, db, 0);
        } else if (state.lexer._type == 42) {
            state.push_fn(set_production /*33*/, 33);
            consume(state);
            state.push_fn(branch_6ddf665d02514ef7, 33);
            return hc_symbols__condition_symbol_list(state, db, 0);
        } else if (state.lexer._type == 43) {
            state.push_fn(set_production /*33*/, 33);
            consume(state);
            state.push_fn(branch_6aa92a607ea83a69, 33);
            return hc_symbols__symbol(state, db, 0);
        };
        return - 1;
    }

    function hc_symbols__condition_symbol_list(state, db, prod) {
        state.push_fn(branch_2e9618619a5aaf89, 34);
        return hc_symbols__terminal_symbol(state, db, 0);
    }

    function hc_symbols__condition_symbol_list_goto(state, db, prod) {
        scan(state.lexer, 85, 6);
        if (state.lexer._type == 12 || state.lexer._type == 15 || state.lexer._type == 16) {
            state.push_fn(hc_symbols__condition_symbol_list_goto /*hc_symbols__condition_symbol_list_goto( state, db, 34 )*/, 34);
            scan(state.lexer, 88, 6);
            if ((state.lexer._type == 12 || state.lexer._type == 15 || state.lexer._type == 16)) {
                state.push_fn(branch_449740ceb8df7fb1, 34);
                return hc_symbols__terminal_symbol(state, db, 0);
            };
            return - 1;
        } else if (state.lexer._type == 29) {
            return 34;
        };
        return (prod == 34) ? prod : - 1;
    }

    function hc_symbols__empty_symbol(state, db, prod) {
        scan(state.lexer, 90, 6);
        if (state.lexer._type == 44) {
            consume(state);
            scan(state.lexer, 6, 6);
            add_reduce(state, 1, 47);
            return 35;
        };
        return - 1;
    }

    function hc_functions__reduce_function(state, db, prod) {
        state.push_fn(branch_d0f0ef763b0295ee, 0);
        return hc_functions__js_function_start_symbol(state, db, 0);
    }

    function hc_functions__js_function_start_symbol(state, db, prod) {
        scan(state.lexer, 67, 6);
        if (state.lexer._type == 52) {
            consume(state);
            scan(state.lexer, 6, 6);
            add_reduce(state, 1, 51);
            return 37;
        };
        return - 1;
    }

    function hc_functions__js_data(state, db, prod) {
        scan(state.lexer, 91, 10);
        if (state.lexer._type == 46) {
            state.push_fn(hc_functions__js_data_goto /*hc_functions__js_data_goto( state, db, 38 )*/, 38);
            state.push_fn(set_production /*0*/, 38);
            return hc_functions__js_data_block(state, db, 0);
        } else if (isTokenActive(state.lexer._type, 92)) {
            state.push_fn(hc_functions__js_data_goto /*hc_functions__js_data_goto( state, db, 38 )*/, 38);
            state.push_fn(set_production /*0*/, 38);
            return hc_functions__js_primitive(state, db, 0);
        } else if (state.lexer._type == 1) {
            state.push_fn(hc_functions__js_data_goto /*hc_functions__js_data_goto( state, db, 38 )*/, 38);
            consume(state);
            return 0;
        };
        return - 1;
    }

    function hc_functions__js_data_goto(state, db, prod) {
        scan(state.lexer, 93, 10);
        if (state.lexer._type == 46) {
            state.push_fn(hc_functions__js_data_goto /*hc_functions__js_data_goto( state, db, 38 )*/, 38);
            scan(state.lexer, 28, 6);
            if ((state.lexer._type == 46)) {
                state.push_fn(branch_da861fb127c979a7, 38);
                return hc_functions__js_data_block(state, db, 0);
            };
            return - 1;
        } else if (state.lexer._type == 47) {
            return 38;
        } else if (isTokenActive(state.lexer._type, 92)) {
            state.push_fn(hc_functions__js_data_goto /*hc_functions__js_data_goto( state, db, 38 )*/, 38);
            scan(state.lexer, 94, 10);
            if ((isTokenActive(state.lexer._type, 92))) {
                state.push_fn(branch_da861fb127c979a7, 38);
                return hc_functions__js_primitive(state, db, 0);
            };
            return - 1;
        };
        return (prod == 38) ? prod : - 1;
    }

    function hc_functions__js_primitive(state, db, prod) {
        scan(state.lexer, 94, 10);
        if (state.lexer._type == 12) {
            state.push_fn(set_production /*39*/, 39);
            state.push_fn(set_production /*0*/, 39);
            return hc_symbols__generated_symbol(state, db, 0);
        } else if (state.lexer._type == 15) {
            state.push_fn(set_production /*39*/, 39);
            state.push_fn(set_production /*0*/, 39);
            return hc_symbols__literal_symbol(state, db, 0);
        } else if (state.lexer._type == 16) {
            state.push_fn(set_production /*39*/, 39);
            state.push_fn(set_production /*0*/, 39);
            return hc_symbols__escaped_symbol(state, db, 0);
        } else if (state.lexer._type == 38) {
            state.push_fn(set_production /*39*/, 39);
            state.push_fn(branch_df62a20ead16ba2a, 39);
            return hc_symbols__EOF_symbol(state, db, 0);
        } else if (state.lexer._type == 3 || state.lexer._type == 5 || state.lexer._type == 8 || state.lexer._type == 2) {
            consume(state);
            return 39;
        };
        return - 1;
    }

    function hc_functions__js_data_block(state, db, prod) {
        scan(state.lexer, 28, 6);
        if (state.lexer._type == 46) {
            consume(state);
            scan(state.lexer, 91, 10);
            if ((isTokenActive(state.lexer._type, 95))) {
                state.push_fn(branch_c58138841976db30, 40);
                return hc_functions__js_data(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_functions__referenced_function(state, db, prod) {
        state.push_fn(branch_c70100ba3d2b54fa, 41);
        return hc_functions__referenced_function_group_235_0_(state, db, 0);
    }

    function hc_state_ir__grammar_injection(state, db, prod) {
        scan(state.lexer, 96, 4);
        if (state.lexer._type == 53) {
            consume(state);
            scan(state.lexer, 97, 4);
            if (state.lexer._type == 54) {
                consume(state);
                scan(state.lexer, 16, 4);
                if (state.lexer._type == 31) {
                    consume(state);
                    scan(state.lexer, 29, 4);
                    state.push_fn(branch_5c7d02c44c5fb206, 0);
                    return hc_state_ir__top_level_instructions(state, db, 0);
                }
            }
        };
        return - 1;
    }

    function hc_state_ir__state_hash_token(state, db, prod) {
        scan(state.lexer, 98, 4);
        if (state.lexer._type == 3 || state.lexer._type == 5 || state.lexer._type == 14 || state.lexer._type == 55) {
            consume(state);
            return hc_state_ir__state_hash_token_goto(state, db, 43);
        };
        return - 1;
    }

    function hc_state_ir__state_hash_token_goto(state, db, prod) {
        scan(state.lexer, 99, 100);
        if (state.lexer._type == 14) {
            state.push_fn(hc_state_ir__state_hash_token_goto /*hc_state_ir__state_hash_token_goto( state, db, 43 )*/, 43);
            scan(state.lexer, 101, 100);
            consume(state);
            add_reduce(state, 2, 0);
            return 0;
        } else if (state.lexer._type == 55) {
            state.push_fn(hc_state_ir__state_hash_token_goto /*hc_state_ir__state_hash_token_goto( state, db, 43 )*/, 43);
            scan(state.lexer, 102, 100);
            consume(state);
            add_reduce(state, 2, 0);
            return 0;
        } else if (state.lexer._type == 5) {
            state.push_fn(hc_state_ir__state_hash_token_goto /*hc_state_ir__state_hash_token_goto( state, db, 43 )*/, 43);
            scan(state.lexer, 103, 100);
            consume(state);
            add_reduce(state, 2, 0);
            return 0;
        } else if (state.lexer._type == 3) {
            state.push_fn(hc_state_ir__state_hash_token_goto /*hc_state_ir__state_hash_token_goto( state, db, 43 )*/, 43);
            scan(state.lexer, 104, 100);
            consume(state);
            add_reduce(state, 2, 0);
            return 0;
        };
        return (prod == 43) ? prod : - 1;
    }

    function hc_state_ir__top_level_instructions(state, db, prod) {
        scan(state.lexer, 29, 4);
        if (isTokenActive(state.lexer._type, 105)) {
            state.push_fn(set_production /*44*/, 44);
            state.push_fn(set_production /*0*/, 44);
            return hc_state_ir__instruction_sequence(state, db, 0);
        } else if (state.lexer._type == 76 || state.lexer._type == 77 || state.lexer._type == 78 || state.lexer._type == 79) {
            state.push_fn(set_production /*44*/, 44);
            state.push_fn(set_production /*0*/, 44);
            return hc_state_ir__top_level_instructions_list_274(state, db, 0);
        } else if (state.lexer._type == 56) {
            state.push_fn(set_production /*44*/, 44);
            state.push_fn(set_production /*0*/, 44);
            return hc_state_ir__top_level_instructions_list_273(state, db, 0);
        };
        return - 1;
    }

    function hc_state_ir__prod_branch_instruction(state, db, prod) {
        scan(state.lexer, 21, 4);
        if (state.lexer._type == 56) {
            consume(state);
            scan(state.lexer, 106, 4);
            if ((state.lexer._type == 57)) {
                consume(state);
                state.push_fn(branch_8cf04bae4b087a61, 45);
                return hc_state_ir__production_id_list(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_state_ir__production_id_list(state, db, prod) {
        scan(state.lexer, 107, 4);
        if (state.lexer._type == 30) {
            consume(state);
            scan(state.lexer, 108, 4);
            if ((state.lexer._type == 5 || state.lexer._type == 13)) {
                state.push_fn(branch_53ebcacbd46edaaf, 46);
                return hc_state_ir__production_id_list_list_283(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_state_ir__instruction_sequence(state, db, prod) {
        scan(state.lexer, 109, 4);
        if (state.lexer._type == 59) {
            state.push_fn(set_production /*47*/, 47);
            state.lexer.setToken(2, 0, 0);
            consume(state);
            return 0;
        } else if (isTokenActive(state.lexer._type, 110)) {
            scan(state.lexer, 111, 4);
            state.push_fn(branch_65cda27952837374, 0);
            return hc_state_ir__instruction_sequence_list_285(state, db, 0);
        } else if (state.lexer._type == 75) {
            scan(state.lexer, 25, 4);
            state.push_fn(branch_7fee1fd836a4199f, 0);
            return hc_state_ir__instruction_sequence_list_288(state, db, 0);
        } else if (state.lexer._type == 58) {
            state.push_fn(set_production /*47*/, 47);
            state.push_fn(branch_5cb267bf74038e65, 47);
            return hc_state_ir__instruction_sequence_group_289_0_(state, db, 0);
        };
        state.lexer.setToken(2, 0, 0);
        consume(state);
        return 47;
    }

    function hc_state_ir__sequence_instruction(state, db, prod) {
        scan(state.lexer, 111, 4);
        if (state.lexer._type == 60) {
            state.push_fn(set_production /*48*/, 48);
            consume(state);
            scan(state.lexer, 112, 4);
            if ((state.lexer._type == 5)) {
                consume(state);
                scan(state.lexer, 112, 4);
                if ((state.lexer._type == 5)) {
                    consume(state);
                    add_reduce(state, 3, 62);
                    return 0;
                }
            };
            return - 1;
        } else if (state.lexer._type == 61) {
            consume(state);
            scan(state.lexer, 113, 4);
            if (state.lexer._type == 57) {
                consume(state);
                scan(state.lexer, 114, 4);
                if (state.lexer._type == 62) {
                    consume(state);
                    scan(state.lexer, 115, 6);
                    if (state.lexer._type == 13) {
                        var fk1 = state.fork(db);;
                        fk1.push_fn(branch_087458d2d7409900, 48);
                        state.push_fn(branch_34533d2c3f3e24c8, 48);
                        return 0;
                    } else if (state.lexer._type == 5) {
                        state.push_fn(set_production /*48*/, 48);
                        consume(state);
                        add_reduce(state, 4, 63);
                        return 0;
                    }
                }
            } else if (state.lexer._type == 68) {
                consume(state);
                scan(state.lexer, 116, 4);
                if (state.lexer._type == 69) {
                    state.push_fn(set_production /*48*/, 48);
                    consume(state);
                    scan(state.lexer, 112, 4);
                    if ((state.lexer._type == 5)) {
                        consume(state);
                        add_reduce(state, 4, 67);
                        return 0;
                    };
                    return - 1;
                } else if (state.lexer._type == 70) {
                    consume(state);
                    scan(state.lexer, 117, 6);
                    if (state.lexer._type == 12 || state.lexer._type == 15 || state.lexer._type == 16) {
                        state.push_fn(set_production /*48*/, 48);
                        state.push_fn(branch_6d1edf43c2037af1, 48);
                        return hc_symbols__terminal_symbol(state, db, 0);
                    } else {
                        state.push_fn(set_production /*48*/, 48);
                        state.push_fn(branch_6d1edf43c2037af1, 48);
                        return hc_state_ir__sequence_instruction_group_328_0_(state, db, 0);
                    }
                }
            }
        } else if (state.lexer._type == 63) {
            state.push_fn(set_production /*48*/, 48);
            consume(state);
            scan(state.lexer, 114, 4);
            if ((state.lexer._type == 62)) {
                consume(state);
                scan(state.lexer, 5, 4);
                if ((state.lexer._type == 27)) {
                    consume(state);
                    state.push_fn(branch_a86c63114d80e399, 48);
                    return hc_state_ir__sequence_instruction_list_313(state, db, 0);
                }
            };
            return - 1;
        } else if (state.lexer._type == 64) {
            consume(state);
            scan(state.lexer, 118, 4);
            if (state.lexer._type == 65) {
                state.push_fn(set_production /*48*/, 48);
                consume(state);
                scan(state.lexer, 119, 4);
                if ((state.lexer._type == 66)) {
                    consume(state);
                    state.push_fn(branch_938fa336439bc975, 48);
                    return hc_state_ir__token_id_list(state, db, 0);
                };
                return - 1;
            } else if (state.lexer._type == 66) {
                state.push_fn(set_production /*48*/, 48);
                consume(state);
                state.push_fn(branch_8e14cc5b254736d6, 48);
                return hc_state_ir__token_id_list(state, db, 0);
            }
        } else if (state.lexer._type == 67) {
            state.push_fn(set_production /*48*/, 48);
            consume(state);
            scan(state.lexer, 112, 4);
            if ((state.lexer._type == 5)) {
                consume(state);
                add_reduce(state, 2, 66);
                return 0;
            };
            return - 1;
        } else if (state.lexer._type == 71) {
            state.push_fn(set_production /*48*/, 48);
            consume(state);
            add_reduce(state, 1, 69);
            return 0;
        } else if (state.lexer._type == 72) {
            state.push_fn(set_production /*48*/, 48);
            consume(state);
            add_reduce(state, 1, 70);
            return 0;
        } else if (state.lexer._type == 73) {
            state.push_fn(set_production /*48*/, 48);
            consume(state);
            add_reduce(state, 1, 71);
            return 0;
        };
        return - 1;
    }

    function hc_state_ir__state_declaration(state, db, prod) {
        scan(state.lexer, 120, 4);
        if (state.lexer._type == 74) {
            consume(state);
            scan(state.lexer, 107, 4);
            if (state.lexer._type == 30) {
                consume(state);
                scan(state.lexer, 121, 6);
                if (state.lexer._type == 13) {
                    var fk1 = state.fork(db);;
                    fk1.push_fn(branch_817bdac52fba0e2d, 49);
                    state.push_fn(branch_b9e90b3efe5b799b, 49);
                    return 0;
                } else if (state.lexer._type == 54) {
                    state.push_fn(set_production /*49*/, 49);
                    consume(state);
                    scan(state.lexer, 16, 4);
                    if ((state.lexer._type == 31)) {
                        consume(state);
                        add_reduce(state, 4, 73);
                        return 0;
                    };
                    return - 1;
                }
            }
        };
        return - 1;
    }

    function hc_state_ir__token_id_list(state, db, prod) {
        scan(state.lexer, 107, 4);
        if (state.lexer._type == 30) {
            consume(state);
            scan(state.lexer, 122, 4);
            if ((state.lexer._type == 5 || state.lexer._type == 12 || state.lexer._type == 15 || state.lexer._type == 16)) {
                state.push_fn(branch_9c5f118cce267b77, 50);
                return hc_state_ir__token_id_list_list_359(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_state_ir__goto_instruction(state, db, prod) {
        scan(state.lexer, 25, 4);
        if (state.lexer._type == 75) {
            consume(state);
            scan(state.lexer, 120, 4);
            if ((state.lexer._type == 74)) {
                state.push_fn(branch_2ee62dc869fb9119, 51);
                return hc_state_ir__state_declaration(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_state_ir__token_branch_instruction(state, db, prod) {
        scan(state.lexer, 123, 4);
        if (state.lexer._type == 76) {
            state.push_fn(set_production /*52*/, 52);
            consume(state);
            state.push_fn(branch_0343b27417d5a952, 52);
            return hc_state_ir__token_id_list(state, db, 0);
        } else if (state.lexer._type == 77) {
            state.push_fn(set_production /*52*/, 52);
            consume(state);
            state.push_fn(branch_99616e14773c051a, 52);
            return hc_state_ir__token_id_list(state, db, 0);
        } else if (state.lexer._type == 78) {
            state.push_fn(set_production /*52*/, 52);
            consume(state);
            state.push_fn(branch_7ee351687b00ac20, 52);
            return hc_state_ir__token_id_list(state, db, 0);
        } else if (state.lexer._type == 79) {
            state.push_fn(set_production /*52*/, 52);
            consume(state);
            state.push_fn(branch_fc223ef145b2fb03, 52);
            return hc_state_ir__token_id_list(state, db, 0);
        };
        return - 1;
    }

    function hc_state_ir__on_fail(state, db, prod) {
        scan(state.lexer, 21, 4);
        if (state.lexer._type == 56) {
            consume(state);
            scan(state.lexer, 124, 4);
            if (state.lexer._type == 73) {
                consume(state);
                scan(state.lexer, 120, 4);
                state.push_fn(branch_b6b2871a1bdd67be, 0);
                return hc_state_ir__state_declaration(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_state_ir__expected_symbols(state, db, prod) {
        scan(state.lexer, 125, 4);
        if (state.lexer._type == 80) {
            consume(state);
            scan(state.lexer, 27, 4);
            if (state.lexer._type == 81) {
                consume(state);
                scan(state.lexer, 107, 4);
                state.push_fn(branch_c3b394ed23efbde6, 0);
                return hc_state_ir__token_id_list(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_state_ir__state_ir(state, db, prod) {
        state.push_fn(branch_78561f70d9e4f31a, 0);
        return hc_state_ir__state_declaration(state, db, 0);
    }

    function hc_state_ir__comment_list_6(state, db, prod) {
        scan(state.lexer, 9, 0);
        if (isTokenActive(state.lexer._type, 9)) {
            consume(state);
            add_reduce(state, 1, 1);
            return hc_state_ir__comment_list_6_goto(state, db, 56);
        };
        return - 1;
    }

    function hc_state_ir__comment_list_6_goto(state, db, prod) {
        scan(state.lexer, 46, 0);
        if (state.lexer._type == 2) {
            state.push_fn(hc_state_ir__comment_list_6_goto /*hc_state_ir__comment_list_6_goto( state, db, 56 )*/, 56);
            scan(state.lexer, 126, 6);
            consume(state);
            add_reduce(state, 2, 2);
            return 0;
        } else if (state.lexer._type == 8) {
            state.push_fn(hc_state_ir__comment_list_6_goto /*hc_state_ir__comment_list_6_goto( state, db, 56 )*/, 56);
            scan(state.lexer, 6, 10);
            consume(state);
            add_reduce(state, 2, 2);
            return 0;
        } else if (state.lexer._type == 7) {
            state.push_fn(hc_state_ir__comment_list_6_goto /*hc_state_ir__comment_list_6_goto( state, db, 56 )*/, 56);
            scan(state.lexer, 6, 7);
            consume(state);
            add_reduce(state, 2, 2);
            return 0;
        } else if (state.lexer._type == 3) {
            state.push_fn(hc_state_ir__comment_list_6_goto /*hc_state_ir__comment_list_6_goto( state, db, 56 )*/, 56);
            scan(state.lexer, 127, 6);
            consume(state);
            add_reduce(state, 2, 2);
            return 0;
        } else if (state.lexer._type == 5) {
            state.push_fn(hc_state_ir__comment_list_6_goto /*hc_state_ir__comment_list_6_goto( state, db, 56 )*/, 56);
            scan(state.lexer, 128, 6);
            consume(state);
            add_reduce(state, 2, 2);
            return 0;
        };
        return (prod == 56) ? prod : - 1;
    }

    function hc_symbols__literal_symbol_list_47(state, db, prod) {
        scan(state.lexer, 58, 6);
        if (state.lexer._type == 5 || state.lexer._type == 3) {
            consume(state);
            add_reduce(state, 1, 88);
            return hc_symbols__literal_symbol_list_47_goto(state, db, 57);
        };
        return - 1;
    }

    function hc_symbols__literal_symbol_list_47_goto(state, db, prod) {
        while (true) {
            switch (prod) {
                case 57:
                    {
                        scan(state.lexer, 17, 0);
                        if (state.lexer._type == 3 || state.lexer._type == 58369 || state.lexer._type == 58) {
                            var pk = state.lexer.copy_in_place();;
                            pk.next();
                            scan(pk, 18, 0);
                            if (isTokenActive(pk._type, 18)) {
                                state.lexer._type = 3;
                                state.push_fn(hc_symbols__literal_symbol_list_47_goto /*hc_symbols__literal_symbol_list_47_goto( state, db, 57 )*/, 57);
                                scan(state.lexer, 127, 6);
                                consume(state);
                                add_reduce(state, 2, 5);
                                return 0;
                            }
                        } else if (state.lexer._type == 5) {
                            var pk = state.lexer.copy_in_place();;
                            pk.next();
                            scan(pk, 18, 0);
                            if (isTokenActive(pk._type, 18)) {
                                state.lexer._type = 5;
                                state.push_fn(hc_symbols__literal_symbol_list_47_goto /*hc_symbols__literal_symbol_list_47_goto( state, db, 57 )*/, 57);
                                scan(state.lexer, 128, 6);
                                consume(state);
                                add_reduce(state, 2, 5);
                                return 0;
                            }
                        } else if (state.lexer._type == 8 || state.lexer._type == 1 || state.lexer._type == 7) {
                            return 57;
                        }
                    }
                    break;
                default:
                    break;
            };
            break;
        };
        return (prod == 57) ? prod : - 1;
    }

    function hc_symbols__escaped_symbol_list_53(state, db, prod) {
        scan(state.lexer, 9, 6);
        if (state.lexer._type == 5 || state.lexer._type == 3 || state.lexer._type == 2) {
            consume(state);
            add_reduce(state, 1, 88);
            return hc_symbols__escaped_symbol_list_53_goto(state, db, 58);
        };
        return - 1;
    }

    function hc_symbols__escaped_symbol_list_53_goto(state, db, prod) {
        scan(state.lexer, 129, 0);
        if (state.lexer._type == 5) {
            state.push_fn(hc_symbols__escaped_symbol_list_53_goto /*hc_symbols__escaped_symbol_list_53_goto( state, db, 58 )*/, 58);
            scan(state.lexer, 128, 6);
            consume(state);
            add_reduce(state, 2, 5);
            return 0;
        } else if (state.lexer._type == 3) {
            state.push_fn(hc_symbols__escaped_symbol_list_53_goto /*hc_symbols__escaped_symbol_list_53_goto( state, db, 58 )*/, 58);
            scan(state.lexer, 127, 6);
            consume(state);
            add_reduce(state, 2, 5);
            return 0;
        } else if (state.lexer._type == 2) {
            state.push_fn(hc_symbols__escaped_symbol_list_53_goto /*hc_symbols__escaped_symbol_list_53_goto( state, db, 58 )*/, 58);
            scan(state.lexer, 126, 6);
            consume(state);
            add_reduce(state, 2, 5);
            return 0;
        };
        return (prod == 58) ? prod : - 1;
    }

    function hc_preambles__import_preamble_list_58(state, db, prod) {
        scan(state.lexer, 6, 10);
        if (state.lexer._type == 8) {
            consume(state);
            scan(state.lexer, 10, 10);
            add_reduce(state, 1, 1);
            return hc_preambles__import_preamble_list_58_goto(state, db, 59);
        };
        return - 1;
    }

    function hc_preambles__import_preamble_list_58_goto(state, db, prod) {
        scan(state.lexer, 130, 10);
        if (state.lexer._type == 2 || state.lexer._type == 3 || state.lexer._type == 19 || state.lexer._type == 20) {
            return 59;
        } else if (state.lexer._type == 8) {
            state.push_fn(hc_preambles__import_preamble_list_58_goto /*hc_preambles__import_preamble_list_58_goto( state, db, 59 )*/, 59);
            scan(state.lexer, 6, 10);
            consume(state);
            add_reduce(state, 2, 2);
            return 0;
        };
        return (prod == 59) ? prod : - 1;
    }

    function hc_preambles__import_preamble_list_59(state, db, prod) {
        scan(state.lexer, 15, 6);
        if (state.lexer._type == 2 || state.lexer._type == 3) {
            consume(state);
            add_reduce(state, 1, 88);
            return hc_preambles__import_preamble_list_59_goto(state, db, 60);
        };
        return - 1;
    }

    function hc_preambles__import_preamble_list_59_goto(state, db, prod) {
        scan(state.lexer, 15, 10);
        if (state.lexer._type == 2) {
            state.push_fn(hc_preambles__import_preamble_list_59_goto /*hc_preambles__import_preamble_list_59_goto( state, db, 60 )*/, 60);
            scan(state.lexer, 126, 6);
            consume(state);
            add_reduce(state, 2, 5);
            return 0;
        } else if (state.lexer._type == 3) {
            state.push_fn(hc_preambles__import_preamble_list_59_goto /*hc_preambles__import_preamble_list_59_goto( state, db, 60 )*/, 60);
            scan(state.lexer, 127, 6);
            consume(state);
            add_reduce(state, 2, 5);
            return 0;
        } else if (state.lexer._type == 8) {
            return 60;
        };
        return (prod == 60) ? prod : - 1;
    }

    function hc_comments__cm_list_74(state, db, prod) {
        state.push_fn(branch_a54dcd17db5146af, 61);
        return hc_comments__comment_primitive(state, db, 0);
    }

    function hc_comments__cm_list_74_goto(state, db, prod) {
        scan(state.lexer, 9, 0);
        if (state.lexer._type == 2 || state.lexer._type == 3 || state.lexer._type == 5 || state.lexer._type == 8) {
            state.push_fn(hc_comments__cm_list_74_goto /*hc_comments__cm_list_74_goto( state, db, 61 )*/, 61);
            scan(state.lexer, 9, 10);
            if ((state.lexer._type == 2 || state.lexer._type == 3 || state.lexer._type == 5 || state.lexer._type == 8)) {
                state.push_fn(branch_da861fb127c979a7, 61);
                return hc_comments__comment_primitive(state, db, 0);
            };
            return - 1;
        };
        return (prod == 61) ? prod : - 1;
    }

    function hc_productions__production_group_94_0_(state, db, prod) {
        state.push_fn(branch_909e21da22e2c6f9, 62);
        return hc_symbols__production_id(state, db, 0);
    }

    function hc_productions__production_group_99_0_(state, db, prod) {
        state.push_fn(branch_304781a6134d6f78, 63);
        return hc_symbols__imported_production_symbol(state, db, 0);
    }

    function hc_production_bodies__body_entry_list_131(state, db, prod) {
        state.push_fn(branch_7ce9f13b7dadd87a, 64);
        return hc_production_bodies__body_entry(state, db, 0);
    }

    function hc_production_bodies__body_entry_list_131_goto(state, db, prod) {
        scan(state.lexer, 131, 6);
        if (isTokenActive(state.lexer._type, 78)) {
            state.push_fn(hc_production_bodies__body_entry_list_131_goto /*hc_production_bodies__body_entry_list_131_goto( state, db, 64 )*/, 64);
            scan(state.lexer, 79, 6);
            if ((isTokenActive(state.lexer._type, 78))) {
                state.push_fn(branch_449740ceb8df7fb1, 64);
                return hc_production_bodies__body_entry(state, db, 0);
            };
            return - 1;
        };
        return (prod == 64) ? prod : - 1;
    }

    function hc_functions__referenced_function_group_235_0_(state, db, prod) {
        state.push_fn(branch_15422f020b54d119, 65);
        return hc_functions__js_function_start_symbol(state, db, 0);
    }

    function hc_state_ir__top_level_instructions_list_273(state, db, prod) {
        state.push_fn(branch_dc98fe1b877ab7ad, 66);
        return hc_state_ir__prod_branch_instruction(state, db, 0);
    }

    function hc_state_ir__top_level_instructions_list_273_goto(state, db, prod) {
        while (true) {
            switch (prod) {
                case 66:
                    {
                        scan(state.lexer, 132, 6);
                        if (state.lexer._type == 56) {
                            var pk = state.lexer.copy_in_place();;
                            pk.next();
                            scan(pk, 106, 4);
                            if (pk._type == 57) {
                                state.lexer._type = 56;
                                state.push_fn(hc_state_ir__top_level_instructions_list_273_goto /*hc_state_ir__top_level_instructions_list_273_goto( state, db, 66 )*/, 66);
                                scan(state.lexer, 133, 6);
                                if ((state.lexer._type == 56)) {
                                    state.push_fn(branch_449740ceb8df7fb1, 66);
                                    return hc_state_ir__prod_branch_instruction(state, db, 0);
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
        return (prod == 66) ? prod : - 1;
    }

    function hc_state_ir__top_level_instructions_list_274(state, db, prod) {
        state.push_fn(branch_0ea313d051fdb33e, 67);
        return hc_state_ir__token_branch_instruction(state, db, 0);
    }

    function hc_state_ir__top_level_instructions_list_274_goto(state, db, prod) {
        while (true) {
            switch (prod) {
                case 67:
                    {
                        scan(state.lexer, 134, 6);
                        if (state.lexer._type == 76 || state.lexer._type == 77 || state.lexer._type == 78 || state.lexer._type == 79) {
                            state.push_fn(hc_state_ir__top_level_instructions_list_274_goto /*hc_state_ir__top_level_instructions_list_274_goto( state, db, 67 )*/, 67);
                            scan(state.lexer, 135, 6);
                            if ((state.lexer._type == 76 || state.lexer._type == 77 || state.lexer._type == 78 || state.lexer._type == 79)) {
                                state.push_fn(branch_449740ceb8df7fb1, 67);
                                return hc_state_ir__token_branch_instruction(state, db, 0);
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
        return (prod == 67) ? prod : - 1;
    }

    function hc_state_ir__production_id_list_list_283(state, db, prod) {
        scan(state.lexer, 115, 6);
        if (state.lexer._type == 13) {
            state.push_fn(hc_state_ir__production_id_list_list_283_goto /*hc_state_ir__production_id_list_list_283_goto( state, db, 9 )*/, 9);
            state.push_fn(set_production /*0*/, 9);
            return hc_symbols__identifier(state, db, prod);
        } else {
            state.push_fn(hc_state_ir__production_id_list_list_283_goto /*hc_state_ir__production_id_list_list_283_goto( state, db, 68 )*/, 68);
            state.push_fn(branch_5cb267bf74038e65, 68);
            return hc_state_ir__sequence_instruction_group_328_0_(state, db, 0);
        };
        return - 1;
    }

    function hc_state_ir__production_id_list_list_283_goto(state, db, prod) {
        while (true) {
            switch (prod) {
                case 9:
                    {
                        scan(state.lexer, 83, 6);
                        if (state.lexer._type == 37) {
                            state.push_fn(hc_state_ir__production_id_list_list_283_goto /*hc_state_ir__production_id_list_list_283_goto( state, db, 68 )*/, 68);
                            scan(state.lexer, 19, 6);
                            consume(state);
                            state.push_fn(branch_7b625870b619653b, 68);
                            return hc_symbols__identifier(state, db, 0);
                        } else {
                            scan(state.lexer, 6, 6);
                            add_reduce(state, 1, 39);
                            add_reduce(state, 1, 1);
                            prod = 68;
                            continue;
                        };
                        break;
                    }
                    break;
                case 68:
                    {
                        scan(state.lexer, 136, 6);
                        if (state.lexer._type == 13) {
                            var fk1 = state.fork(db);;
                            fk1.push_fn(branch_bd53cb3d83921fab, 68);
                            state.push_fn(branch_a2b25744ffdec2a6, 68);
                            return 0;
                        } else if (state.lexer._type == 5) {
                            state.push_fn(hc_state_ir__production_id_list_list_283_goto /*hc_state_ir__production_id_list_list_283_goto( state, db, 68 )*/, 68);
                            scan(state.lexer, 128, 6);
                            if ((state.lexer._type == 5)) {
                                state.push_fn(branch_449740ceb8df7fb1, 68);
                                return hc_state_ir__sequence_instruction_group_328_0_(state, db, 0);
                            };
                            return - 1;
                        };
                        break;
                    }
                    break;
                default:
                    break;
            };
            break;
        };
        return (prod == 68) ? prod : - 1;
    }

    function hc_state_ir__instruction_sequence_list_285(state, db, prod) {
        state.push_fn(branch_4f05a3c8dd774d75, 69);
        return hc_state_ir__sequence_instruction(state, db, 0);
    }

    function hc_state_ir__instruction_sequence_list_285_goto(state, db, prod) {
        while (true) {
            switch (prod) {
                case 69:
                    {
                        scan(state.lexer, 137, 6);
                        if (state.lexer._type == 58) {
                            var pk = state.lexer.copy_in_place();;
                            pk.next();
                            scan(pk, 138, 6);
                            if (isTokenActive(pk._type, 110)) {
                                state.lexer._type = 58;
                                state.push_fn(hc_state_ir__instruction_sequence_list_285_goto /*hc_state_ir__instruction_sequence_list_285_goto( state, db, 69 )*/, 69);
                                scan(state.lexer, 139, 6);
                                consume(state);
                                state.push_fn(branch_3f89443451a23e6d, 69);
                                return hc_state_ir__sequence_instruction(state, db, 0);
                            } else if (pk._type == 75) {
                                return 69;
                            }
                        }
                    }
                    break;
                default:
                    break;
            };
            break;
        };
        return (prod == 69) ? prod : - 1;
    }

    function hc_state_ir__instruction_sequence_list_288(state, db, prod) {
        state.push_fn(branch_6dca5481a1cc8332, 70);
        return hc_state_ir__goto_instruction(state, db, 0);
    }

    function hc_state_ir__instruction_sequence_list_288_goto(state, db, prod) {
        while (true) {
            switch (prod) {
                case 70:
                    {
                        scan(state.lexer, 137, 6);
                        if (state.lexer._type == 58) {
                            var pk = state.lexer.copy_in_place();;
                            pk.next();
                            scan(pk, 24, 6);
                            if (pk._type == 75) {
                                state.lexer._type = 58;
                                state.push_fn(hc_state_ir__instruction_sequence_list_288_goto /*hc_state_ir__instruction_sequence_list_288_goto( state, db, 70 )*/, 70);
                                scan(state.lexer, 139, 6);
                                consume(state);
                                state.push_fn(branch_3f89443451a23e6d, 70);
                                return hc_state_ir__goto_instruction(state, db, 0);
                            } else if (pk._type == 82) {
                                return 70;
                            }
                        } else {
                            return 70;
                        }
                    }
                    break;
                default:
                    break;
            };
            break;
        };
        return (prod == 70) ? prod : - 1;
    }

    function hc_state_ir__instruction_sequence_group_289_0_(state, db, prod) {
        scan(state.lexer, 139, 6);
        if (state.lexer._type == 58) {
            consume(state);
            scan(state.lexer, 140, 6);
            if ((state.lexer._type == 82)) {
                consume(state);
                scan(state.lexer, 141, 6);
                if ((state.lexer._type == 74)) {
                    consume(state);
                    add_reduce(state, 3, 92);
                    return 71;
                }
            }
        };
        return - 1;
    }

    function hc_state_ir__sequence_instruction_list_313(state, db, prod) {
        state.push_fn(branch_c43b53ea566121a3, 72);
        return hc_state_ir__state_declaration(state, db, 0);
    }

    function hc_state_ir__sequence_instruction_list_313_goto(state, db, prod) {
        scan(state.lexer, 142, 6);
        if (state.lexer._type == 83) {
            state.push_fn(hc_state_ir__sequence_instruction_list_313_goto /*hc_state_ir__sequence_instruction_list_313_goto( state, db, 72 )*/, 72);
            scan(state.lexer, 143, 6);
            consume(state);
            state.push_fn(branch_3f89443451a23e6d, 72);
            return hc_state_ir__state_declaration(state, db, 0);
        };
        return (prod == 72) ? prod : - 1;
    }

    function hc_state_ir__sequence_instruction_group_328_0_(state, db, prod) {
        scan(state.lexer, 128, 6);
        if (state.lexer._type == 5) {
            consume(state);
            scan(state.lexer, 6, 6);
            add_reduce(state, 1, 93);
            return 73;
        };
        return - 1;
    }

    function hc_state_ir__token_id_list_list_359(state, db, prod) {
        scan(state.lexer, 117, 6);
        if (state.lexer._type == 12 || state.lexer._type == 15 || state.lexer._type == 16) {
            state.push_fn(hc_state_ir__token_id_list_list_359_goto /*hc_state_ir__token_id_list_list_359_goto( state, db, 74 )*/, 74);
            state.push_fn(branch_5cb267bf74038e65, 74);
            return hc_symbols__terminal_symbol(state, db, 0);
        } else {
            state.push_fn(hc_state_ir__token_id_list_list_359_goto /*hc_state_ir__token_id_list_list_359_goto( state, db, 74 )*/, 74);
            state.push_fn(branch_5cb267bf74038e65, 74);
            return hc_state_ir__sequence_instruction_group_328_0_(state, db, 0);
        };
        return - 1;
    }

    function hc_state_ir__token_id_list_list_359_goto(state, db, prod) {
        scan(state.lexer, 144, 6);
        if (state.lexer._type == 12 || state.lexer._type == 15 || state.lexer._type == 16) {
            state.push_fn(hc_state_ir__token_id_list_list_359_goto /*hc_state_ir__token_id_list_list_359_goto( state, db, 74 )*/, 74);
            scan(state.lexer, 88, 6);
            if ((state.lexer._type == 12 || state.lexer._type == 15 || state.lexer._type == 16)) {
                state.push_fn(branch_449740ceb8df7fb1, 74);
                return hc_symbols__terminal_symbol(state, db, 0);
            };
            return - 1;
        } else if (state.lexer._type == 5) {
            state.push_fn(hc_state_ir__token_id_list_list_359_goto /*hc_state_ir__token_id_list_list_359_goto( state, db, 74 )*/, 74);
            scan(state.lexer, 128, 6);
            if ((state.lexer._type == 5)) {
                state.push_fn(branch_449740ceb8df7fb1, 74);
                return hc_state_ir__sequence_instruction_group_328_0_(state, db, 0);
            };
            return - 1;
        };
        return (prod == 74) ? prod : - 1;
    }

    function hc_state_ir__expected_symbols_group_392_0_(state, db, prod) {
        scan(state.lexer, 145, 6);
        if (state.lexer._type == 84) {
            consume(state);
            scan(state.lexer, 146, 6);
            if ((state.lexer._type == 30)) {
                state.push_fn(branch_f95bb695f66b5425, 75);
                return hc_state_ir__token_id_list(state, db, 0);
            }
        };
        return - 1;
    }

    function recognize_primary(string, production) {

        //create the input data buffer. 
        const temp_buffer = new Uint8Array(string.length * 4);

        const actual_length = fillByteBufferWithUTF8FromString(string, temp_buffer, temp_buffer.length);

        const resolved_buffer = new Uint8Array(temp_buffer.buffer, 0, actual_length);

        switch (production) {
            case 0: return recognize(resolved_buffer, actual_length, 0, hc_hydrocarbon);
            case 1: return recognize(resolved_buffer, actual_length, 55, hc_state_ir__state_ir);
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

const reduce_functions = [(_, s) => s[s.length - 1], (env, sym, pos) => ([sym[0]]) /*0*/,
(env, sym, pos) => ((sym[0].push(sym[1]), sym[0])) /*1*/,
(env, sym, pos) => ({ type: "ignore", symbols: sym[2] }) /*2*/,
(env, sym, pos) => ({ type: "generated", val: sym[1], pos: pos, meta: false }) /*3*/,
(env, sym, pos) => (sym[0] + sym[1]) /*4*/,
(env, sym, pos) => ({ type: "exclusive-literal", val: "" + sym[1], pos: pos, meta: false }) /*5*/,
(env, sym, pos) => ({ type: "literal", val: sym[1], pos: pos, meta: false }) /*6*/,
(env, sym, pos) => ({ type: "production_token", name: sym[1], production: null, val: -1, pos: pos, meta: false }) /*7*/,
(env, sym, pos) => ({ type: "import", uri: sym[3], reference: sym[6] }) /*8*/,
(env, sym, pos) => ({ type: "import", uri: sym[2], reference: sym[5] }) /*9*/,
(env, sym, pos) => ({ type: "comment", value: sym[1] }) /*10*/,
(env, sym, pos) => ({ type: "production-section", functions: [], productions: [sym[0]], ir: [] }) /*11*/,
(env, sym, pos) => ({ type: "production-section", functions: [], productions: [], ir: [sym[0]] }) /*12*/,
(env, sym, pos) => ({ type: "production-section", functions: [sym[0]], productions: [], ir: [] }) /*13*/,
(env, sym, pos) => (sym[0].productions.push(sym[1]), sym[0]) /*14*/,
(env, sym, pos) => (sym[0].functions.push(sym[1]), sym[0]) /*15*/,
(env, sym, pos) => (sym[0].ir.push(sym[1]), sym[0]) /*16*/,
(env, sym, pos) => (sym[0]) /*17*/,
(env, sym, pos) => ({ type: "production", name: sym[2], bodies: sym[4], id: -1, recovery_handler: sym[5], pos: pos, recursion: 0, ROOT_PRODUCTION: !!sym[1] }) /*18*/,
(env, sym, pos) => ({ type: "production-merged-import", name: sym[1], bodies: sym[3], id: -1, recovery_handler: sym[4], ROOT_PRODUCTION: false }) /*19*/,
(env, sym, pos) => ({ type: "production", name: sym[1], bodies: sym[3], id: -1, recovery_handler: sym[4], pos: pos, recursion: 0, ROOT_PRODUCTION: !!null }) /*20*/,
(env, sym, pos) => ({ type: "production", name: sym[2], bodies: null, id: -1, recovery_handler: sym[4], pos: pos, recursion: 0, ROOT_PRODUCTION: !!sym[1] }) /*21*/,
(env, sym, pos) => ({ type: "production", name: sym[1], bodies: null, id: -1, recovery_handler: sym[3], pos: pos, recursion: 0, ROOT_PRODUCTION: !!null }) /*22*/,
(env, sym, pos) => ((sym[0].push(sym[2]), sym[0])) /*23*/,
(env, sym, pos) => ({ type: "body", sym: sym[3], reduce_function: sym[4], FORCE_FORK: !!sym[2], id: -1, production: null }) /*24*/,
(env, sym, pos) => ({ type: "body", sym: sym[0], reduce_function: sym[1], FORCE_FORK: !!null, id: -1, production: null }) /*25*/,
(env, sym, pos) => ({ type: "body", sym: sym[3], reduce_function: null, FORCE_FORK: !!sym[2], id: -1, production: null }) /*26*/,
(env, sym, pos) => ({ type: "body", sym: sym[0], reduce_function: null, FORCE_FORK: !!null, id: -1, production: null }) /*27*/,
(env, sym, pos) => (sym[0].concat(sym[1])) /*28*/,
(env, sym, pos) => ([]) /*29*/,
(env, sym, pos) => (env.group_id++, sym[1].flat().map(e => (e.IS_OPTIONAL ? e.IS_OPTIONAL |= env.group_id << 8 : 0, e))) /*30*/,
(env, sym, pos) => (sym[0].IS_OPTIONAL = 1, sym[0]) /*31*/,
(env, sym, pos) => ({ type: "look-behind", val: sym[1].val, phased: sym[1] }) /*32*/,
(env, sym, pos) => (sym[1].IS_NON_CAPTURE = true, sym[1]) /*33*/,
(env, sym, pos) => ({ type: "group-production", val: sym[1], pos: pos, meta: false }) /*34*/,
(env, sym, pos) => ({ type: "list-production", terminal_symbol: sym[2], IS_OPTIONAL: +(sym[1] == "(*"), val: sym[0], pos: pos, meta: false }) /*35*/,
(env, sym, pos) => ({ type: "literal", val: sym[0], pos: pos, meta: false }) /*36*/,
(env, sym, pos) => ({ type: "list-production", terminal_symbol: null, IS_OPTIONAL: +(sym[1] == "(*"), val: sym[0], pos: pos, meta: false }) /*37*/,
(env, sym, pos) => ({ type: "sym-production", name: sym[0], production: null, val: -1, pos: pos, meta: false }) /*38*/,
(env, sym, pos) => ({ type: "sym-production-import", module: sym[0], production: sym[2], name: "", pos: pos, meta: false }) /*39*/,
(env, sym, pos) => ({ type: "eof", val: "END_OF_FILE", pos: pos, meta: false }) /*40*/,
(env, sym, pos) => ({ type: "meta-exclude", sym: sym[1], meta: true, index: -1 }) /*41*/,
(env, sym, pos) => ({ type: "meta-error", sym: sym[1], meta: true, index: -1 }) /*42*/,
(env, sym, pos) => ({ type: "meta-ignore", sym: sym[1], meta: true, index: -1 }) /*43*/,
(env, sym, pos) => ({ type: "meta-reset", sym: sym[1], meta: true, index: -1 }) /*44*/,
(env, sym, pos) => ({ type: "meta-reduce", sym: sym[1], meta: true, index: -1 }) /*45*/,
(env, sym, pos) => ({ type: "empty", val: "", pos: pos, meta: false }) /*46*/,
(env, sym, pos) => ({ type: "RETURNED", txt: sym[3], name: "", env: false, ref: "", IS_CONDITION: true }) /*47*/,
(env, sym, pos) => ({ type: "env-function-reference", ref: sym[3] }) /*48*/,
(env, sym, pos) => ({ type: "local-function-reference", ref: sym[3] }) /*49*/,
(env, sym, pos) => ("FN:F") /*50*/,
(env, sym, pos) => ("<--" + sym[0].type + "^^" + sym[0].val + "-->") /*51*/,
(env, sym, pos) => (sym[0] + sym[1] + sym[2]) /*52*/,
(env, sym, pos) => ({ type: "ref-function", id: sym[1], txt: sym[3] }) /*53*/,
(env, sym, pos) => ({ type: "state", id: sym[0], instructions: sym[1], fail: sym[2], symbol_meta: sym[3] }) /*54*/,
(env, sym, pos) => ({ type: "prod", ids: sym[2], instructions: sym[4] }) /*55*/,
(env, sym, pos) => (sym[1]) /*56*/,
(env, sym, pos) => ([...sym[0], ...sym[2], sym[3]]) /*57*/,
(env, sym, pos) => ([...sym[0], sym[1]]) /*58*/,
(env, sym, pos) => ([...sym[0], ...sym[2]]) /*59*/,
(env, sym, pos) => ([...sym[0]]) /*60*/,
(env, sym, pos) => ({ type: "reduce", len: parseInt(sym[1]), reduce_fn: parseInt(sym[2]) }) /*61*/,
(env, sym, pos) => ({ type: "set-prod", id: parseInt(sym[3]) }) /*62*/,
(env, sym, pos) => ({ type: "fork-to", states: sym[3] }) /*63*/,
(env, sym, pos) => ({ type: sym[1] ? "scan-back-until" : "scan-until", token_ids: sym[3] }) /*64*/,
(env, sym, pos) => ({ type: "pop", len: parseInt(sym[1]) }) /*65*/,
(env, sym, pos) => ({ type: "token-length", len: parseInt(sym[3]) }) /*66*/,
(env, sym, pos) => ({ type: "token-id", id: sym[3] }) /*67*/,
(env, sym, pos) => ({ type: "pass" }) /*68*/,
(env, sym, pos) => ({ type: "end" }) /*69*/,
(env, sym, pos) => ({ type: "fail" }) /*70*/,
(env, sym, pos) => ({ type: null ? "scan-back-until" : "scan-until", token_ids: sym[2] }) /*71*/,
(env, sym, pos) => (sym[2]) /*72*/,
(env, sym, pos) => ({ type: "goto", state: sym[1] }) /*73*/,
(env, sym, pos) => ({ type: "no-consume", ids: sym[1], instructions: sym[3] }) /*74*/,
(env, sym, pos) => ({ type: "consume", ids: sym[1], instructions: sym[3] }) /*75*/,
(env, sym, pos) => ({ type: "peek", ids: sym[1], instructions: sym[3] }) /*76*/,
(env, sym, pos) => ({ type: "assert", ids: sym[1], instructions: sym[3] }) /*77*/,
(env, sym, pos) => ({ type: "on-fail-state", id: sym[2], instructions: sym[3], symbol_meta: sym[5], fail: sym[4] }) /*78*/,
(env, sym, pos) => ({ type: "on-fail-state", id: sym[2], instructions: sym[3], symbol_meta: sym[4] }) /*79*/,
(env, sym, pos) => ({ type: "on-fail-state", id: sym[2], instructions: sym[3], fail: sym[4] }) /*80*/,
(env, sym, pos) => ({ type: "on-fail-state", id: sym[2], instructions: sym[3] }) /*81*/,
(env, sym, pos) => ({ type: "symbols", expected: sym[2], skipped: sym[3] || [] }) /*82*/,
(env, sym, pos) => ({ type: "symbols", expected: sym[2], skipped: null || [] }) /*83*/,
(env, sym, pos) => ({ type: "state", id: sym[0], instructions: sym[1], symbol_meta: sym[2] }) /*84*/,
(env, sym, pos) => ({ type: "state", id: sym[0], instructions: sym[1], fail: sym[2] }) /*85*/,
(env, sym, pos) => ({ type: "state", id: sym[0], instructions: sym[1] }) /*86*/,
(env, sym, pos) => (sym[0] + "") /*87*/,
(env, sym, pos) => (env.prod_name = sym[0]) /*88*/,
(env, sym, pos) => (env.prod_name = sym[0].val, sym[0]) /*89*/,
(env, sym, pos) => (sym[0] + "GG") /*90*/,
(env, sym, pos) => ({ type: "repeat-state" }) /*91*/,
(env, sym, pos) => (parseInt(sym[0])) /*92*/];

export default ParserFactory
    (reduce_functions, undefined, recognizer_initializer, { hydrocarbon: 0, state_ir__state_ir: 1 });