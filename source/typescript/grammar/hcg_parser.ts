
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


    var token_lookup = new Uint32Array([16392, 0, 0, 16424, 33554432, 0, 512, 0, 0, 384, 65536, 0, 384, 0, 0, 134218112, 0, 16777216, 384, 0, 16777216, 384, 2, 0, 8576, 0, 0, 384, 2, 16777216, 384, 4093640704, 17288742, 384, 4093640704, 17813030, 384, 67108864, 16777216, 763605382, 6307737, 0, 428, 0, 0, 128, 0, 0, 537112580, 16281, 0, 2147484032, 0, 0, 2147484032, 0, 16777216, 536871296, 0, 16777216, 134218112, 67108864, 17301504, 1573248, 0, 0, 392, 0, 0, 2281701760, 3556769792, 527910, 384, 0, 2113536, 384, 0, 16793600, 134218112, 0, 17301504, 134218112, 4093640704, 17813030, 384, 0, 17825792, 134218112, 0, 0, 384, 32768, 0, 3045306758, 6307737, 0, 384, 1196032, 0, 134218112, 1, 8912896, 256, 0, 0, 3179524526, 341942271, 524288, 3179516334, 341942271, 524288, 2281701760, 335544320, 540672, 1408, 0, 16777216, 384, 819200, 0, 384, 262144, 0, 384, 524288, 0, 8576, 0, 16777216, 384, 67108864, 17301504, 94636416, 6291456, 0, 896, 0, 16777216, 1452, 0, 0, 10750336, 0, 0, 2432, 0, 0, 233856, 0, 0, 4480, 0, 0, 16776, 0, 0, 16424, 0, 0, 16384, 0, 0, 8, 0, 0, 32, 0, 0, 33152, 0, 0, 424, 0, 0, 386, 0, 0, 65920, 0, 0, 131456, 0, 0, 262528, 0, 0, 396, 0, 0, 2097536, 0, 0, 4194688, 0, 0, 8388992, 0, 0, 83886464, 6291456, 0, 92275074, 6291456, 0, 83886464, 0, 0, 384, 2097152, 0, 384, 4194304, 0, 33563008, 0, 0, 545501572, 16281, 0, 2508194178, 6291456, 0, 92274690, 6291456, 0, 537112964, 16281, 0, 1619243396, 16281, 0, 1073742208, 0, 0, 3045306758, 6299545, 0, 2508193794, 6291456, 0, 537112580, 8089, 0, 537112964, 8089, 0, 537112580, 152, 0, 0, 7936, 0, 537112964, 152, 0, 3185291686, 341843967, 524288, 3045306758, 6299647, 0, 384, 4, 0, 2147586432, 0, 0, 384, 128, 0, 102784, 0, 0, 384, 7936, 0, 384, 8192, 0, 102830, 32896, 0, 102700, 128, 0, 102828, 98432, 0, 102828, 128, 0, 102702, 32896, 0, 384, 4194304, 16777216, 384, 25165824, 16777216, 16808, 33554432, 16777216, 16424, 33554432, 16777216, 0, 0, 16777216, 16384, 0, 16777216, 0, 33554432, 16777216, 32, 0, 16777216, 8, 0, 16777216, 0, 4026531840, 20006, 384, 134217728, 16777216, 384, 1, 16777216, 8608, 0, 16777216, 384, 4026531840, 16797222, 0, 3221225472, 3622, 384, 3221225472, 16780838, 416, 2097152, 16777216, 416, 0, 16777216, 384, 134217728, 16777280, 384, 0, 16777217, 8608, 0, 0, 384, 0, 16777600, 102816, 0, 0, 384, 0, 16777240, 384, 0, 16777232, 384, 0, 16781312, 384, 16777216, 16785408, 102816, 0, 16777216, 384, 0, 17268736, 384, 0, 16779264, 384, 16777216, 16777216, 384, 0, 17301504, 388, 0, 0, 416, 0, 0, 430, 0, 0, 1573260, 0, 0, 537112964, 8091, 0, 134218112, 67108864, 524288, 384, 67108864, 0, 134218112, 67108864, 1015808, 384, 0, 491520, 8608, 2, 0, 2281701760, 335544320, 524288, 384, 3221225472, 2117158, 384, 268435456, 0, 384, 0, 2097152, 384, 0, 4096, 2147484032, 0, 4194304, 384, 0, 4194304, 102816, 2, 0, 384, 0, 8388608, 384, 1, 0]);;
    var token_sequence_lookup = new Uint8Array([47, 42, 47, 64, 73, 71, 78, 79, 82, 69, 103, 111, 116, 111, 95, 116, 111, 107, 101, 110, 92, 58, 58, 35, 60, 62, 43, 62, 124, 40, 69, 88, 67, 41, 91, 93, 63, 61, 36, 101, 109, 112, 116, 121, 123, 125, 94, 61, 62, 102, 111, 114, 107, 45, 38, 115, 121, 109, 98, 111, 108, 115, 58, 44, 69, 78, 68, 95, 79, 70, 95, 80, 82, 79, 68, 85, 67, 84, 73, 79, 78, 97, 115, 115, 101, 114, 116, 65, 83, 70, 79, 82, 75, 114, 101, 99, 111, 118, 101, 114, 111, 110, 112, 114, 111, 100, 98, 97, 99, 107, 117, 110, 116, 105, 108, 101, 110, 103, 116, 104, 105, 100, 101, 120, 112, 101, 99, 116, 101, 100, 110, 111, 99, 111, 110, 115, 117, 109, 101, 64, 73, 77, 80, 79, 82, 84, 103, 58, 116, 104, 101, 110, 60, 61, 40, 69, 82, 82, 36, 101, 111, 102, 97, 105, 108, 115, 107, 105, 112, 112, 101, 100, 114, 101, 116, 117, 114, 110, 112, 97, 115, 115, 101, 110, 100, 64, 69, 88, 80, 79, 82, 84, 116, 107, 58, 116, 58, 60, 91, 40, 73, 71, 78, 40, 82, 83, 84, 40, 82, 69, 68, 40, 42, 40, 43, 102, 58, 115, 116, 97, 116, 101, 115, 99, 97, 110, 115, 101, 116, 114, 101, 100, 117, 99, 101, 114, 101, 112, 101, 97, 116, 112, 101, 101, 107, 112, 111, 112]);;
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
                        if (isTokenActive(23, tk_row)) {
                            lexer.setToken(23, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 36:
                {
                    if (2 == compare(lexer, lexer.byte_offset, 38, 2, token_sequence_lookup)) {
                        if (lexer.get_byte_at(lexer.byte_offset + 2) == 109) {
                            if (isTokenActive(45, tk_row) && 3 == compare(lexer, lexer.byte_offset + 3, 41, 3, token_sequence_lookup)) {
                                lexer.setToken(45, 6, 6);
                                return;
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 2) == 111) {
                            if (isTokenActive(39, tk_row) && lexer.get_byte_at(lexer.byte_offset + 3) == 102) {
                                lexer.setToken(39, 4, 4);
                                return;
                            }
                        }
                    }
                }
                break;
            case 38:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 38) {
                        if (isTokenActive(77, tk_row)) {
                            lexer.setToken(77, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 40:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 40) {
                        if (lexer.get_byte_at(lexer.byte_offset + 1) == 69) {
                            if (lexer.get_byte_at(lexer.byte_offset + 2) == 88) {
                                if (isTokenActive(40, tk_row) && lexer.get_byte_at(lexer.byte_offset + 3) == 67) {
                                    lexer.setToken(40, 4, 4);
                                    return;
                                }
                            } else if (lexer.get_byte_at(lexer.byte_offset + 2) == 82) {
                                if (isTokenActive(41, tk_row) && lexer.get_byte_at(lexer.byte_offset + 3) == 82) {
                                    lexer.setToken(41, 4, 4);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 73) {
                            if (isTokenActive(42, tk_row) && 2 == compare(lexer, lexer.byte_offset + 2, 201, 2, token_sequence_lookup)) {
                                lexer.setToken(42, 4, 4);
                                return;
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 82) {
                            if (lexer.get_byte_at(lexer.byte_offset + 2) == 83) {
                                if (isTokenActive(43, tk_row) && lexer.get_byte_at(lexer.byte_offset + 3) == 84) {
                                    lexer.setToken(43, 4, 4);
                                    return;
                                }
                            } else if (lexer.get_byte_at(lexer.byte_offset + 2) == 69) {
                                if (isTokenActive(44, tk_row) && lexer.get_byte_at(lexer.byte_offset + 3) == 68) {
                                    lexer.setToken(44, 4, 4);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 42) {
                            if (isTokenActive(37, tk_row)) {
                                lexer.setToken(37, 2, 2);
                                return;
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 43) {
                            if (isTokenActive(38, tk_row)) {
                                lexer.setToken(38, 2, 2);
                                return;
                            }
                        } else if (isTokenActive(29, tk_row)) {
                            lexer.setToken(29, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 41:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 41) {
                        if (isTokenActive(31, tk_row)) {
                            lexer.setToken(31, 1, 1);
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
                        } else if (isTokenActive(25, tk_row)) {
                            lexer.setToken(25, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 43:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 43) {
                        if (isTokenActive(26, tk_row) && lexer.get_byte_at(lexer.byte_offset + 1) == 62) {
                            lexer.setToken(26, 2, 2);
                            return;
                        }
                    }
                }
                break;
            case 44:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 44) {
                        if (isTokenActive(86, tk_row)) {
                            lexer.setToken(86, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 45:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 45) {
                        if (isTokenActive(56, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2) && lexer.byte_length > 1) {
                            return;
                        } else if (isTokenActive(57, tk_row)) {
                            lexer.setToken(57, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 47:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 47) {
                        if (lexer.get_byte_at(lexer.byte_offset + 1) == 42) {
                            if (isTokenActive(88, tk_row) && token_production(lexer, hc_state_ir__comment, 2, 88, 4) && lexer.byte_length > 2) {
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
                        if (isTokenActive(22, tk_row) && lexer.get_byte_at(lexer.byte_offset + 1) == 58) {
                            lexer.setToken(22, 2, 2);
                            return;
                        }
                    }
                }
                break;
            case 60:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 60) {
                        if (lexer.get_byte_at(lexer.byte_offset + 1) == 62) {
                            if (isTokenActive(24, tk_row)) {
                                lexer.setToken(24, 2, 2);
                                return;
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 61) {
                            if (isTokenActive(35, tk_row)) {
                                lexer.setToken(35, 2, 2);
                                return;
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 91) {
                            if (isTokenActive(54, tk_row)) {
                                lexer.setToken(54, 2, 2);
                                return;
                            }
                        }
                    }
                }
                break;
            case 61:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 61) {
                        if (isTokenActive(51, tk_row) && lexer.get_byte_at(lexer.byte_offset + 1) == 62) {
                            lexer.setToken(51, 2, 2);
                            return;
                        }
                    }
                }
                break;
            case 62:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 62) {
                        if (isTokenActive(27, tk_row)) {
                            lexer.setToken(27, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 63:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 63) {
                        if (lexer.get_byte_at(lexer.byte_offset + 1) == 61) {
                            if (isTokenActive(36, tk_row)) {
                                lexer.setToken(36, 2, 2);
                                return;
                            }
                        } else if (isTokenActive(34, tk_row)) {
                            lexer.setToken(34, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 64:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 64) {
                        if (lexer.get_byte_at(lexer.byte_offset + 1) == 73) {
                            if (lexer.get_byte_at(lexer.byte_offset + 2) == 71) {
                                if (isTokenActive(11, tk_row) && 4 == compare(lexer, lexer.byte_offset + 3, 6, 4, token_sequence_lookup)) {
                                    lexer.setToken(11, 7, 7);
                                    return;
                                }
                            } else if (lexer.get_byte_at(lexer.byte_offset + 2) == 77) {
                                if (isTokenActive(18, tk_row) && 4 == compare(lexer, lexer.byte_offset + 3, 142, 4, token_sequence_lookup)) {
                                    lexer.setToken(18, 7, 7);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 69) {
                            if (isTokenActive(21, tk_row) && 5 == compare(lexer, lexer.byte_offset + 2, 187, 5, token_sequence_lookup)) {
                                lexer.setToken(21, 7, 7);
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
                            if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 9, 13, 1) && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(56, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2) && lexer.byte_length > 2) {
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
                        if (3 == compare(lexer, lexer.byte_offset + 1, 90, 3, token_sequence_lookup)) {
                            if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 9, 13, 1) && lexer.byte_length > 4) {
                                return;
                            } else if (isTokenActive(56, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2) && lexer.byte_length > 4) {
                                return;
                            } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 4) {
                                return;
                            } else if (isTokenActive(30, tk_row)) {
                                lexer.setToken(30, 4, 4);
                                return;
                            }
                        }
                    }
                }
                break;
            case 91:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 91) {
                        if (isTokenActive(32, tk_row)) {
                            lexer.setToken(32, 1, 1);
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
                        if (isTokenActive(33, tk_row)) {
                            lexer.setToken(33, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 94:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 94) {
                        if (isTokenActive(50, tk_row)) {
                            lexer.setToken(50, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 95:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 95) {
                        if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 9, 13, 1) && lexer.byte_length > 1) {
                            return;
                        } else if (isTokenActive(56, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2) && lexer.byte_length > 1) {
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
                                if (3 == compare(lexer, lexer.byte_offset + 3, 84, 3, token_sequence_lookup)) {
                                    if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 9, 13, 1) && lexer.byte_length > 6) {
                                        return;
                                    } else if (isTokenActive(56, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2) && lexer.byte_length > 6) {
                                        return;
                                    } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 6) {
                                        return;
                                    } else if (isTokenActive(82, tk_row)) {
                                        lexer.setToken(82, 6, 6);
                                        return;
                                    }
                                }
                            } else if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 9, 13, 1) && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(56, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2) && lexer.byte_length > 2) {
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
                        if (3 == compare(lexer, lexer.byte_offset + 1, 107, 3, token_sequence_lookup)) {
                            if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 9, 13, 1) && lexer.byte_length > 4) {
                                return;
                            } else if (isTokenActive(56, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2) && lexer.byte_length > 4) {
                                return;
                            } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 4) {
                                return;
                            } else if (isTokenActive(67, tk_row)) {
                                lexer.setToken(67, 4, 4);
                                return;
                            }
                        }
                    }
                }
                break;
            case 99:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 99) {
                        if (6 == compare(lexer, lexer.byte_offset + 1, 133, 6, token_sequence_lookup)) {
                            if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 9, 13, 1) && lexer.byte_length > 7) {
                                return;
                            } else if (isTokenActive(56, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2) && lexer.byte_length > 7) {
                                return;
                            } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 7) {
                                return;
                            } else if (isTokenActive(80, tk_row)) {
                                lexer.setToken(80, 7, 7);
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
                            if (6 == compare(lexer, lexer.byte_offset + 2, 124, 6, token_sequence_lookup)) {
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 9, 13, 1) && lexer.byte_length > 8) {
                                    return;
                                } else if (isTokenActive(56, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2) && lexer.byte_length > 8) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 8) {
                                    return;
                                } else if (isTokenActive(84, tk_row)) {
                                    lexer.setToken(84, 8, 8);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 110) {
                            if (lexer.get_byte_at(lexer.byte_offset + 2) == 100) {
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 9, 13, 1) && lexer.byte_length > 3) {
                                    return;
                                } else if (isTokenActive(56, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2) && lexer.byte_length > 3) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 3) {
                                    return;
                                } else if (isTokenActive(74, tk_row)) {
                                    lexer.setToken(74, 3, 3);
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
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 9, 13, 1) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(56, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(65, tk_row)) {
                                    lexer.setToken(65, 4, 4);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 97) {
                            if (2 == compare(lexer, lexer.byte_offset + 2, 163, 2, token_sequence_lookup)) {
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 9, 13, 1) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(56, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(75, tk_row)) {
                                    lexer.setToken(75, 4, 4);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 58) {
                            if (isTokenActive(53, tk_row)) {
                                lexer.setToken(53, 2, 2);
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
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 9, 13, 1) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(56, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(78, tk_row)) {
                                    lexer.setToken(78, 4, 4);
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
                            if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 9, 13, 1) && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(56, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2) && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(72, tk_row)) {
                                lexer.setToken(72, 2, 2);
                                return;
                            }
                        }
                    }
                }
                break;
            case 108:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 108) {
                        if (5 == compare(lexer, lexer.byte_offset + 1, 115, 5, token_sequence_lookup)) {
                            if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 9, 13, 1) && lexer.byte_length > 6) {
                                return;
                            } else if (isTokenActive(56, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2) && lexer.byte_length > 6) {
                                return;
                            } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 6) {
                                return;
                            } else if (isTokenActive(71, tk_row)) {
                                lexer.setToken(71, 6, 6);
                                return;
                            }
                        }
                    }
                }
                break;
            case 110:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 110) {
                        if (8 == compare(lexer, lexer.byte_offset + 1, 131, 8, token_sequence_lookup)) {
                            if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 9, 13, 1) && lexer.byte_length > 9) {
                                return;
                            } else if (isTokenActive(56, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2) && lexer.byte_length > 9) {
                                return;
                            } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 9) {
                                return;
                            } else if (isTokenActive(79, tk_row)) {
                                lexer.setToken(79, 9, 9);
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
                            if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 9, 13, 1) && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(56, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2) && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(58, tk_row)) {
                                lexer.setToken(58, 2, 2);
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
                            if (2 == compare(lexer, lexer.byte_offset + 2, 104, 2, token_sequence_lookup)) {
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 9, 13, 1) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(56, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(59, tk_row)) {
                                    lexer.setToken(59, 4, 4);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 97) {
                            if (2 == compare(lexer, lexer.byte_offset + 2, 180, 2, token_sequence_lookup)) {
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 9, 13, 1) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(56, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(73, tk_row)) {
                                    lexer.setToken(73, 4, 4);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 101) {
                            if (2 == compare(lexer, lexer.byte_offset + 2, 243, 2, token_sequence_lookup)) {
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 9, 13, 1) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(56, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(81, tk_row)) {
                                    lexer.setToken(81, 4, 4);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 111) {
                            if (lexer.get_byte_at(lexer.byte_offset + 2) == 112) {
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 9, 13, 1) && lexer.byte_length > 3) {
                                    return;
                                } else if (isTokenActive(56, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2) && lexer.byte_length > 3) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 3) {
                                    return;
                                } else if (isTokenActive(69, tk_row)) {
                                    lexer.setToken(69, 3, 3);
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
                            if (lexer.get_byte_at(lexer.byte_offset + 2) == 99) {
                                if (4 == compare(lexer, lexer.byte_offset + 3, 96, 4, token_sequence_lookup)) {
                                    if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 9, 13, 1) && lexer.byte_length > 7) {
                                        return;
                                    } else if (isTokenActive(56, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2) && lexer.byte_length > 7) {
                                        return;
                                    } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 7) {
                                        return;
                                    } else if (isTokenActive(55, tk_row)) {
                                        lexer.setToken(55, 7, 7);
                                        return;
                                    }
                                }
                            } else if (lexer.get_byte_at(lexer.byte_offset + 2) == 116) {
                                if (3 == compare(lexer, lexer.byte_offset + 3, 175, 3, token_sequence_lookup)) {
                                    if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 9, 13, 1) && lexer.byte_length > 6) {
                                        return;
                                    } else if (isTokenActive(56, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2) && lexer.byte_length > 6) {
                                        return;
                                    } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 6) {
                                        return;
                                    } else if (isTokenActive(52, tk_row)) {
                                        lexer.setToken(52, 6, 6);
                                        return;
                                    }
                                }
                            } else if (lexer.get_byte_at(lexer.byte_offset + 2) == 100) {
                                if (3 == compare(lexer, lexer.byte_offset + 3, 232, 3, token_sequence_lookup)) {
                                    if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 9, 13, 1) && lexer.byte_length > 6) {
                                        return;
                                    } else if (isTokenActive(56, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2) && lexer.byte_length > 6) {
                                        return;
                                    } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 6) {
                                        return;
                                    } else if (isTokenActive(62, tk_row)) {
                                        lexer.setToken(62, 6, 6);
                                        return;
                                    }
                                }
                            } else if (lexer.get_byte_at(lexer.byte_offset + 2) == 112) {
                                if (3 == compare(lexer, lexer.byte_offset + 3, 238, 3, token_sequence_lookup)) {
                                    if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 9, 13, 1) && lexer.byte_length > 6) {
                                        return;
                                    } else if (isTokenActive(56, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2) && lexer.byte_length > 6) {
                                        return;
                                    } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 6) {
                                        return;
                                    } else if (isTokenActive(85, tk_row)) {
                                        lexer.setToken(85, 6, 6);
                                        return;
                                    }
                                }
                            }
                        } else if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 9, 13, 1) && lexer.byte_length > 1) {
                            return;
                        } else if (isTokenActive(56, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2) && lexer.byte_length > 1) {
                            return;
                        } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 1) {
                            return;
                        } else if (isTokenActive(46, tk_row)) {
                            lexer.setToken(46, 1, 1);
                            return;
                        } else if (isTokenActive(49, tk_row)) {
                            lexer.setToken(49, 1, 1);
                            return;
                        }
                    }
                }
                break;
            case 115:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 115) {
                        if (lexer.get_byte_at(lexer.byte_offset + 1) == 121) {
                            if (6 == compare(lexer, lexer.byte_offset + 2, 57, 6, token_sequence_lookup)) {
                                if (isTokenActive(83, tk_row)) {
                                    lexer.setToken(83, 8, 8);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 107) {
                            if (5 == compare(lexer, lexer.byte_offset + 2, 167, 5, token_sequence_lookup)) {
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 9, 13, 1) && lexer.byte_length > 7) {
                                    return;
                                } else if (isTokenActive(56, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2) && lexer.byte_length > 7) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 7) {
                                    return;
                                } else if (isTokenActive(87, tk_row)) {
                                    lexer.setToken(87, 7, 7);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 116) {
                            if (3 == compare(lexer, lexer.byte_offset + 2, 219, 3, token_sequence_lookup)) {
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 9, 13, 1) && lexer.byte_length > 5) {
                                    return;
                                } else if (isTokenActive(56, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2) && lexer.byte_length > 5) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 5) {
                                    return;
                                } else if (isTokenActive(76, tk_row)) {
                                    lexer.setToken(76, 5, 5);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 99) {
                            if (2 == compare(lexer, lexer.byte_offset + 2, 224, 2, token_sequence_lookup)) {
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 9, 13, 1) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(56, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(66, tk_row)) {
                                    lexer.setToken(66, 4, 4);
                                    return;
                                }
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 101) {
                            if (lexer.get_byte_at(lexer.byte_offset + 2) == 116) {
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 9, 13, 1) && lexer.byte_length > 3) {
                                    return;
                                } else if (isTokenActive(56, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2) && lexer.byte_length > 3) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 3) {
                                    return;
                                } else if (isTokenActive(63, tk_row)) {
                                    lexer.setToken(63, 3, 3);
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
                                    if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 9, 13, 1) && lexer.byte_length > 5) {
                                        return;
                                    } else if (isTokenActive(56, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2) && lexer.byte_length > 5) {
                                        return;
                                    } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 5) {
                                        return;
                                    } else if (isTokenActive(70, tk_row)) {
                                        lexer.setToken(70, 5, 5);
                                        return;
                                    }
                                }
                            } else if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 9, 13, 1) && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(56, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2) && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 2) {
                                return;
                            } else if (isTokenActive(64, tk_row)) {
                                lexer.setToken(64, 2, 2);
                                return;
                            }
                        } else if (lexer.get_byte_at(lexer.byte_offset + 1) == 104) {
                            if (2 == compare(lexer, lexer.byte_offset + 2, 150, 2, token_sequence_lookup)) {
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 9, 13, 1) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(56, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2) && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 4) {
                                    return;
                                } else if (isTokenActive(60, tk_row)) {
                                    lexer.setToken(60, 4, 4);
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
                        if (4 == compare(lexer, lexer.byte_offset + 1, 111, 4, token_sequence_lookup)) {
                            if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 9, 13, 1) && lexer.byte_length > 5) {
                                return;
                            } else if (isTokenActive(56, tk_row) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2) && lexer.byte_length > 5) {
                                return;
                            } else if (isTokenActive(3, tk_row) && lexer.isUniID() && lexer.byte_length > 5) {
                                return;
                            } else if (isTokenActive(68, tk_row)) {
                                lexer.setToken(68, 5, 5);
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
            case 124:
                {
                    if (lexer.get_byte_at(lexer.byte_offset) == 124) {
                        if (isTokenActive(28, tk_row)) {
                            lexer.setToken(28, 1, 1);
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
        if (isTokenActive(13, tk_row) && pre_scan(lexer, 0) && token_production(lexer, hc_symbols__identifier_syms, 9, 13, 1)) {
            return;
        } else if (isTokenActive(56, tk_row) && pre_scan(lexer, 1) && token_production(lexer, hc_state_ir__state_hash_token, 44, 56, 2)) {
            return;
        } else if (isTokenActive(88, tk_row) && pre_scan(lexer, 2) && token_production(lexer, hc_state_ir__comment, 2, 88, 4)) {
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

    function branch_00d3d458193febbd(state, db, prod) {
        '"--LEAF--"';
        '"--leafy--"';
        return 71;
    }

    function branch_03f4a59e150407e1(state, db, prod) {
        scan(state.lexer, 3, 4);
        if ((state.lexer._type == 48)) {
            consume(state);
            add_reduce(state, 5, 50);
            return 0;
        };
        return - 1;
    }

    function branch_05d9f04113827af1(state, db, prod) {
        scan(state.lexer, 5, 6);
        if ((state.lexer._type == 27)) {
            consume(state);
            add_reduce(state, 6, 61);
            return 0;
        };
        return - 1;
    }

    function branch_05de5fcfd2b912d3(state, db, prod) {
        add_reduce(state, 1, 102);
        return 66;
    }

    function branch_06856d78c724971e(state, db, prod) {
        add_reduce(state, 1, 54);
        return 0;
    }

    function branch_0b9e6f0d3579dc7c(state, db, prod) {
        add_reduce(state, 3, 81);
        return 0;
    }

    function branch_0e10591698fa0947(state, db, prod) {
        '"--LEAF--"';
        '49:171 state_ir__sequence_instruction=>τset τprod τto • symbols__production_symbol';
        state.push_fn(branch_c1e79ca47ba10983, 49);
        return hc_symbols__production_symbol(state, db, 0);
    }

    function branch_147abbca2905b552(state, db, prod) {
        add_reduce(state, 2, 38);
        return 0;
    }

    function branch_14932521bfb2c747(state, db, prod) {
        scan(state.lexer, 7, 4);
        if ((state.lexer._type == 33)) {
            consume(state);
            add_reduce(state, 3, 35);
            return 0;
        };
        return - 1;
    }

    function branch_1eb5d19e86842d0e(state, db, prod) {
        add_reduce(state, 2, 19);
        return 0;
    }

    function branch_1f45de351d4e007f(state, db, prod) {
        '"--LEAF--"';
        '69:234 state_ir__production_id_list_list_315=>state_ir__production_id_list_list_315 • symbols__production_symbol';
        scan(state.lexer, 8, 4);
        if ((state.lexer._type == 13)) {
            state.push_fn(branch_eef2f6509049a4bc, 69);
            return hc_symbols__production_symbol(state, db, 0);
        };
        return - 1;
    }

    function branch_20b33064645a28fc(state, db, prod) {
        add_reduce(state, 2, 7);
        return 0;
    }

    function branch_232f37efe656dae6(state, db, prod) {
        add_reduce(state, 1, 3);
        return 0;
    }

    function branch_23c6fb6fe255fce8(state, db, prod) {
        'offset 5 peek_level-1 [  ]  ]';
        '43:125 state_ir__grammar_injection=>τ<[ τrecover symbols__imported_production_symbol • τ] state_ir__top_level_instructions state_ir__on_fail state_ir__expected_symbols τ>';
        '43:128 state_ir__grammar_injection=>τ<[ τrecover symbols__imported_production_symbol • τ] state_ir__top_level_instructions state_ir__expected_symbols τ>';
        '43:129 state_ir__grammar_injection=>τ<[ τrecover symbols__imported_production_symbol • τ] state_ir__top_level_instructions state_ir__on_fail τ>';
        '43:134 state_ir__grammar_injection=>τ<[ τrecover symbols__imported_production_symbol • τ] state_ir__top_level_instructions τ>';
        scan(state.lexer, 9, 6);
        if (state.lexer._type == 33) {
            'Assert Consume [  ]  ]';
            consume(state);
            'offset 6 peek_level-1 [  45  ]';
            '43:125 state_ir__grammar_injection=>τ<[ τrecover symbols__imported_production_symbol τ] • state_ir__top_level_instructions state_ir__on_fail state_ir__expected_symbols τ>';
            '43:128 state_ir__grammar_injection=>τ<[ τrecover symbols__imported_production_symbol τ] • state_ir__top_level_instructions state_ir__expected_symbols τ>';
            '43:129 state_ir__grammar_injection=>τ<[ τrecover symbols__imported_production_symbol τ] • state_ir__top_level_instructions state_ir__on_fail τ>';
            '43:134 state_ir__grammar_injection=>τ<[ τrecover symbols__imported_production_symbol τ] • state_ir__top_level_instructions τ>';
            scan(state.lexer, 10, 6);
            state.push_fn(branch_47f214a1ca65ddc0, 0);
            return hc_state_ir__top_level_instructions(state, db, 0);
        };
        return - 1;
    }

    function branch_24e04851352465e5(state, db, prod) {
        add_reduce(state, 4, 24);
        return 0;
    }

    function branch_28546680a4e0d80c(state, db, prod) {
        add_reduce(state, 4, 25);
        return 0;
    }

    function branch_2876d6b8135bad32(state, db, prod) {
        add_reduce(state, 4, 51);
        return 0;
    }

    function branch_28ab10e2751570b2(state, db, prod) {
        add_reduce(state, 2, 4);
        return 0;
    }

    function branch_2c02a651f27a325d(state, db, prod) {
        'offset 2 peek_level0 [  on symbols: END_OF_PRODUCTION  ]';
        '57:190 state_ir__state_ir=>state_ir__state_declaration state_ir__top_level_instructions • state_ir__on_fail state_ir__expected_symbols';
        '57:192 state_ir__state_ir=>state_ir__state_declaration state_ir__top_level_instructions • state_ir__on_fail';
        '57:191 state_ir__state_ir=>state_ir__state_declaration state_ir__top_level_instructions • state_ir__expected_symbols';
        '57:193 state_ir__state_ir=>state_ir__state_declaration state_ir__top_level_instructions •';
        scan(state.lexer, 11, 6);
        if (state.lexer._type == 58) {
            'Asserts [  on  ]';
            'offset 4 peek_level-1 [  54  ]';
            '57:190 state_ir__state_ir=>state_ir__state_declaration state_ir__top_level_instructions • state_ir__on_fail state_ir__expected_symbols';
            '57:192 state_ir__state_ir=>state_ir__state_declaration state_ir__top_level_instructions • state_ir__on_fail';
            scan(state.lexer, 12, 6);
            state.push_fn(branch_f3f85506f81a8a02, 0);
            return hc_state_ir__on_fail(state, db, 0);
        } else if (state.lexer._type == 83) {
            'Asserts [  symbols:  ]';
            state.push_fn(set_production /*57*/, 57);
            '"--LEAF--"';
            '57:191 state_ir__state_ir=>state_ir__state_declaration state_ir__top_level_instructions • state_ir__expected_symbols';
            state.push_fn(branch_ebe5fcdd5a08edb8, 57);
            return hc_state_ir__expected_symbols(state, db, 0);
        } else {
            '"--LEAF--"';
            '57:193 state_ir__state_ir=>state_ir__state_declaration state_ir__top_level_instructions •';
            add_reduce(state, 2, 98);
            return 57;
        };
        return - 1;
    }

    function branch_2d0c7425918eb69d(state, db, prod) {
        add_reduce(state, 2, 33);
        return 0;
    }

    function branch_2fad1f6b9df0c489(state, db, prod) {
        'offset 7 peek_level0 [  # ( [ $empty <= ?= sym (EXC (ERR (IGN (RST (RED g: 9 tk: t: f:s $eof <> +> f: <[ END_OF_PRODUCTION END_OF_FILE  ]';
        '24:56 productions__production=>τ<> productions__production_group_112_0_ productions__production_start_symbol • production_bodies__production_bodies';
        '24:58 productions__production=>τ<> productions__production_group_112_0_ productions__production_start_symbol •';
        scan(state.lexer, 13, 4);
        if (state.lexer._type == 23) {
            'Asserts [  #  ]';
            'offset 7 peek_level1 [  sym id num sp  ]';
            '24:56 productions__production=>τ<> productions__production_group_112_0_ productions__production_start_symbol • production_bodies__production_bodies';
            var pk = state.lexer.copy_in_place();;
            pk.next();
            scan(pk, 14, 15);
            if (pk._type == 2 || pk._type == 3 || pk._type == 5 || pk._type == 8) {
                'Asserts [  sym id num sp  ]';
                state.lexer._type = 23;
                state.push_fn(set_production /*24*/, 24);
                '"--LEAF--"';
                '24:56 productions__production=>τ<> productions__production_group_112_0_ productions__production_start_symbol • production_bodies__production_bodies';
                state.push_fn(branch_28546680a4e0d80c, 24);
                return hc_production_bodies__production_bodies(state, db, 0);
            }
        } else if (isTokenActive(state.lexer._type, 16)) {
            'Asserts [  ( [ $empty <= ?= sym (EXC (ERR (IGN (RST (RED g: 9 tk: t: f:s $eof  ]';
            state.push_fn(set_production /*24*/, 24);
            '"--LEAF--"';
            '24:56 productions__production=>τ<> productions__production_group_112_0_ productions__production_start_symbol • production_bodies__production_bodies';
            state.push_fn(branch_28546680a4e0d80c, 24);
            return hc_production_bodies__production_bodies(state, db, 0);
        } else {
            '"--LEAF--"';
            '24:58 productions__production=>τ<> productions__production_group_112_0_ productions__production_start_symbol •';
            add_reduce(state, 3, 27);
            return 24;
        };
        return - 1;
    }

    function branch_2ffc50bf1e9012c6(state, db, prod) {
        scan(state.lexer, 17, 4);
        if ((state.lexer._type == 31)) {
            consume(state);
            add_reduce(state, 4, 40);
            return 0;
        };
        return - 1;
    }

    function branch_343da8e856bef04d(state, db, prod) {
        add_reduce(state, 3, 9);
        return 12;
    }

    function branch_36b3ff7f91854d41(state, db, prod) {
        state.push_fn(branch_fcebf5fbb50990ed, 24);
        return hc_productions__production_start_symbol(state, db, 0);
    }

    function branch_396d55253fa604cf(state, db, prod) {
        scan(state.lexer, 18, 6);
        if ((state.lexer._type == 31)) {
            consume(state);
            add_reduce(state, 6, 65);
            return 46;
        };
        return - 1;
    }

    function branch_401b738c9e1d5522(state, db, prod) {
        scan(state.lexer, 19, 6);
        if ((state.lexer._type == 29)) {
            consume(state);
            state.push_fn(branch_f6184ff0ddf1f77e, 53);
            return hc_state_ir__instruction_sequence(state, db, 0);
        };
        return - 1;
    }

    function branch_40e34a0fede9faea(state, db, prod) {
        scan(state.lexer, 3, 4);
        if ((state.lexer._type == 48)) {
            consume(state);
            add_reduce(state, 3, 55);
            return 41;
        };
        return - 1;
    }

    function branch_47b4499f6c6cf649(state, db, prod) {
        add_reduce(state, 1, 101);
        return 64;
    }

    function branch_47bfa97ed9d72856(state, db, prod) {
        add_reduce(state, 4, 52);
        return 0;
    }

    function branch_47f214a1ca65ddc0(state, db, prod) {
        'offset 7 peek_level0 [  on symbols: >  ]';
        '43:125 state_ir__grammar_injection=>τ<[ τrecover symbols__imported_production_symbol τ] state_ir__top_level_instructions • state_ir__on_fail state_ir__expected_symbols τ>';
        '43:129 state_ir__grammar_injection=>τ<[ τrecover symbols__imported_production_symbol τ] state_ir__top_level_instructions • state_ir__on_fail τ>';
        '43:128 state_ir__grammar_injection=>τ<[ τrecover symbols__imported_production_symbol τ] state_ir__top_level_instructions • state_ir__expected_symbols τ>';
        '43:134 state_ir__grammar_injection=>τ<[ τrecover symbols__imported_production_symbol τ] state_ir__top_level_instructions • τ>';
        scan(state.lexer, 20, 6);
        if (state.lexer._type == 58) {
            'Asserts [  on  ]';
            'offset 9 peek_level-1 [  54  ]';
            '43:125 state_ir__grammar_injection=>τ<[ τrecover symbols__imported_production_symbol τ] state_ir__top_level_instructions • state_ir__on_fail state_ir__expected_symbols τ>';
            '43:129 state_ir__grammar_injection=>τ<[ τrecover symbols__imported_production_symbol τ] state_ir__top_level_instructions • state_ir__on_fail τ>';
            scan(state.lexer, 12, 6);
            state.push_fn(branch_7a81c403ac65aa4d, 0);
            return hc_state_ir__on_fail(state, db, 0);
        } else if (state.lexer._type == 83) {
            'Asserts [  symbols:  ]';
            state.push_fn(set_production /*43*/, 43);
            '"--LEAF--"';
            '43:128 state_ir__grammar_injection=>τ<[ τrecover symbols__imported_production_symbol τ] state_ir__top_level_instructions • state_ir__expected_symbols τ>';
            state.push_fn(branch_95746883370de56d, 43);
            return hc_state_ir__expected_symbols(state, db, 0);
        } else if (state.lexer._type == 27) {
            'Asserts [  >  ]';
            state.push_fn(set_production /*43*/, 43);
            '"--LEAF--"';
            '43:134 state_ir__grammar_injection=>τ<[ τrecover symbols__imported_production_symbol τ] state_ir__top_level_instructions • τ>';
            consume(state);
            add_reduce(state, 6, 63);
            return 0;
        };
        return - 1;
    }

    function branch_4b6d69c8225ee36a(state, db, prod) {
        add_reduce(state, 2, 72);
        return 49;
    }

    function branch_4d0bd102fb74a356(state, db, prod) {
        add_reduce(state, 1, 100);
        return 63;
    }

    function branch_4d9ad2a909c7c47e(state, db, prod) {
        state.push_fn(branch_5cb30384bb6efc27, 1);
        return hc_productions__productions(state, db, 0);
    }

    function branch_4e622020a638bfea(state, db, prod) {
        scan(state.lexer, 5, 6);
        if ((state.lexer._type == 27)) {
            consume(state);
            add_reduce(state, 8, 57);
            return 0;
        };
        return - 1;
    }

    function branch_4ec1eeda7a142271(state, db, prod) {
        add_reduce(state, 1, 22);
        return 0;
    }

    function branch_52a170401d149850(state, db, prod) {
        add_reduce(state, 1, 17);
        return 0;
    }

    function branch_53c7b8a1453ec235(state, db, prod) {
        add_reduce(state, 1, 18);
        return 0;
    }

    function branch_582d2b466cda75d4(state, db, prod) {
        scan(state.lexer, 18, 6);
        if ((state.lexer._type == 31)) {
            consume(state);
            add_reduce(state, 5, 88);
            return 0;
        };
        return - 1;
    }

    function branch_5ab1bd758821cde5(state, db, prod) {
        scan(state.lexer, 9, 6);
        if ((state.lexer._type == 33)) {
            consume(state);
            add_reduce(state, 3, 66);
            return 47;
        };
        return - 1;
    }

    function branch_5b29213b1ea63153(state, db, prod) {
        add_reduce(state, 5, 90);
        return 0;
    }

    function branch_5b75cb4e03ce8e90(state, db, prod) {
        'offset 2 peek_level-1 [  as AS  ]';
        '16:34 preambles__export_preamble=>τ@EXPORT symbols__production_symbol • τas θid';
        '16:36 preambles__export_preamble=>τ@EXPORT symbols__production_symbol • τAS θid';
        scan(state.lexer, 21, 4);
        if (state.lexer._type == 19) {
            'Asserts [  as  ]';
            state.push_fn(set_production /*16*/, 16);
            '"--LEAF--"';
            '16:34 preambles__export_preamble=>τ@EXPORT symbols__production_symbol • τas θid';
            consume(state);
            scan(state.lexer, 22, 4);
            if ((state.lexer._type == 3)) {
                consume(state);
                add_reduce(state, 4, 12);
                return 0;
            };
            return - 1;
        } else if (state.lexer._type == 20) {
            'Asserts [  AS  ]';
            state.push_fn(set_production /*16*/, 16);
            '"--LEAF--"';
            '16:36 preambles__export_preamble=>τ@EXPORT symbols__production_symbol • τAS θid';
            consume(state);
            scan(state.lexer, 22, 4);
            if ((state.lexer._type == 3)) {
                consume(state);
                add_reduce(state, 4, 12);
                return 0;
            };
            return - 1;
        };
        return - 1;
    }

    function branch_5cb30384bb6efc27(state, db, prod) {
        add_reduce(state, 2, 1);
        return 0;
    }

    function branch_5f4700f502204408(state, db, prod) {
        scan(state.lexer, 17, 4);
        if ((state.lexer._type == 31)) {
            consume(state);
            add_reduce(state, 3, 45);
            return 0;
        };
        return - 1;
    }

    function branch_62998d73bbd7944d(state, db, prod) {
        '"--LEAF--"';
        '49:169 state_ir__sequence_instruction=>τreduce • functions__referenced_function';
        state.push_fn(branch_4b6d69c8225ee36a, 49);
        return hc_functions__referenced_function(state, db, 0);
    }

    function branch_650f8111b7368fb9(state, db, prod) {
        scan(state.lexer, 17, 4);
        if ((state.lexer._type == 31)) {
            consume(state);
            add_reduce(state, 3, 44);
            return 0;
        };
        return - 1;
    }

    function branch_66b9bad47c4bd243(state, db, prod) {
        add_reduce(state, 4, 75);
        return 0;
    }

    function branch_6b52755d3040a722(state, db, prod) {
        'offset 3 peek_level0 [  then ) on symbols: > END_OF_PRODUCTION  ]';
        '48:150 state_ir__instruction_sequence=>state_ir__instruction_sequence_list_317 • τthen state_ir__instruction_sequence_list_320 state_ir__instruction_sequence_group_321_0_';
        '48:152 state_ir__instruction_sequence=>state_ir__instruction_sequence_list_317 • state_ir__instruction_sequence_group_321_0_';
        '48:153 state_ir__instruction_sequence=>state_ir__instruction_sequence_list_317 • τthen state_ir__instruction_sequence_list_320';
        '48:155 state_ir__instruction_sequence=>state_ir__instruction_sequence_list_317 •';
        scan(state.lexer, 23, 4);
        if (state.lexer._type == 60) {
            'Asserts [  then  ]';
            'offset 3 peek_level1 [  goto repeat  ]';
            '48:150 state_ir__instruction_sequence=>state_ir__instruction_sequence_list_317 • τthen state_ir__instruction_sequence_list_320 state_ir__instruction_sequence_group_321_0_';
            '48:153 state_ir__instruction_sequence=>state_ir__instruction_sequence_list_317 • τthen state_ir__instruction_sequence_list_320';
            '48:152 state_ir__instruction_sequence=>state_ir__instruction_sequence_list_317 • state_ir__instruction_sequence_group_321_0_';
            var pk = state.lexer.copy_in_place();;
            pk.next();
            scan(pk, 24, 4);
            if (pk._type == 78) {
                'Asserts [  goto  ]';
                consume(state);
                '"⤋⤋⤋  post-peek-consume ⤋⤋⤋"';
                'offset 5 peek_level-1 [  then  ]';
                '48:150 state_ir__instruction_sequence=>state_ir__instruction_sequence_list_317 • τthen state_ir__instruction_sequence_list_320 state_ir__instruction_sequence_group_321_0_';
                '48:153 state_ir__instruction_sequence=>state_ir__instruction_sequence_list_317 • τthen state_ir__instruction_sequence_list_320';
                'offset 6 peek_level-1 [  71  ]';
                '48:150 state_ir__instruction_sequence=>state_ir__instruction_sequence_list_317 τthen • state_ir__instruction_sequence_list_320 state_ir__instruction_sequence_group_321_0_';
                '48:153 state_ir__instruction_sequence=>state_ir__instruction_sequence_list_317 τthen • state_ir__instruction_sequence_list_320';
                scan(state.lexer, 25, 6);
                state.push_fn(branch_e06ba6ca7274906b, 0);
                return hc_state_ir__instruction_sequence_list_320(state, db, 0);
            } else {
                state.lexer._type = 60;
                state.push_fn(set_production /*48*/, 48);
                '"--LEAF--"';
                '48:152 state_ir__instruction_sequence=>state_ir__instruction_sequence_list_317 • state_ir__instruction_sequence_group_321_0_';
                state.push_fn(branch_8401eaa890b43daa, 48);
                return hc_state_ir__instruction_sequence_group_321_0_(state, db, 0);
            }
        } else {
            '"--LEAF--"';
            '48:155 state_ir__instruction_sequence=>state_ir__instruction_sequence_list_317 •';
            add_reduce(state, 1, 70);
            return 48;
        };
        return - 1;
    }

    function branch_6c45f4ceb0c835c7(state, db, prod) {
        'offset 2 peek_level-1 [  as AS  ]';
        '16:35 preambles__export_preamble=>τ@EXPORT symbols__imported_production_symbol • τas θid';
        '16:37 preambles__export_preamble=>τ@EXPORT symbols__imported_production_symbol • τAS θid';
        scan(state.lexer, 21, 4);
        if (state.lexer._type == 19) {
            'Asserts [  as  ]';
            state.push_fn(set_production /*16*/, 16);
            '"--LEAF--"';
            '16:35 preambles__export_preamble=>τ@EXPORT symbols__imported_production_symbol • τas θid';
            consume(state);
            scan(state.lexer, 22, 4);
            if ((state.lexer._type == 3)) {
                consume(state);
                add_reduce(state, 4, 12);
                return 0;
            };
            return - 1;
        } else if (state.lexer._type == 20) {
            'Asserts [  AS  ]';
            state.push_fn(set_production /*16*/, 16);
            '"--LEAF--"';
            '16:37 preambles__export_preamble=>τ@EXPORT symbols__imported_production_symbol • τAS θid';
            consume(state);
            scan(state.lexer, 22, 4);
            if ((state.lexer._type == 3)) {
                consume(state);
                add_reduce(state, 4, 12);
                return 0;
            };
            return - 1;
        };
        return - 1;
    }

    function branch_6dfdfde90119238c(state, db, prod) {
        add_reduce(state, 5, 29);
        return 0;
    }

    function branch_70d9326e6c9dc217(state, db, prod) {
        add_reduce(state, 3, 28);
        return 0;
    }

    function branch_71a788043652d3b3(state, db, prod) {
        scan(state.lexer, 17, 4);
        if ((state.lexer._type == 31)) {
            consume(state);
            add_reduce(state, 3, 48);
            return 0;
        };
        return - 1;
    }

    function branch_722c93e5bf14b063(state, db, prod) {
        '"--LEAF--"';
        '49:160 state_ir__sequence_instruction=>τset τprod τto • symbols__imported_production_symbol';
        state.push_fn(branch_c1e79ca47ba10983, 49);
        return hc_symbols__imported_production_symbol(state, db, 0);
    }

    function branch_7458876708a01950(state, db, prod) {
        'offset 10 peek_level0 [  symbols: >  ]';
        '43:127 state_ir__grammar_injection=>τ<[ τrecover symbols__production_symbol τ] state_ir__top_level_instructions state_ir__on_fail • state_ir__expected_symbols τ>';
        '43:133 state_ir__grammar_injection=>τ<[ τrecover symbols__production_symbol τ] state_ir__top_level_instructions state_ir__on_fail • τ>';
        scan(state.lexer, 26, 6);
        if (state.lexer._type == 83) {
            'Asserts [  symbols:  ]';
            state.push_fn(set_production /*43*/, 43);
            '"--LEAF--"';
            '43:127 state_ir__grammar_injection=>τ<[ τrecover symbols__production_symbol τ] state_ir__top_level_instructions state_ir__on_fail • state_ir__expected_symbols τ>';
            state.push_fn(branch_4e622020a638bfea, 43);
            return hc_state_ir__expected_symbols(state, db, 0);
        } else if (state.lexer._type == 27) {
            'Asserts [  >  ]';
            state.push_fn(set_production /*43*/, 43);
            '"--LEAF--"';
            '43:133 state_ir__grammar_injection=>τ<[ τrecover symbols__production_symbol τ] state_ir__top_level_instructions state_ir__on_fail • τ>';
            consume(state);
            add_reduce(state, 7, 60);
            return 0;
        };
        return - 1;
    }

    function branch_75925eaf0d57aec7(state, db, prod) {
        add_reduce(state, 1, 3);
        return hc_symbols__condition_symbol_list_goto(state, db, 35);
    }

    function branch_777f63e027dfc93e(state, db, prod) {
        add_reduce(state, 2, 20);
        return 0;
    }

    function branch_7a04ac1fc1d7cf2c(state, db, prod) {
        'offset 4 peek_level0 [  on symbols: > END_OF_PRODUCTION  ]';
        '54:183 state_ir__on_fail=>τon τfail state_ir__state_declaration state_ir__top_level_instructions • state_ir__on_fail state_ir__expected_symbols';
        '54:185 state_ir__on_fail=>τon τfail state_ir__state_declaration state_ir__top_level_instructions • state_ir__on_fail';
        '54:184 state_ir__on_fail=>τon τfail state_ir__state_declaration state_ir__top_level_instructions • state_ir__expected_symbols';
        '54:186 state_ir__on_fail=>τon τfail state_ir__state_declaration state_ir__top_level_instructions •';
        scan(state.lexer, 27, 6);
        if (state.lexer._type == 58) {
            'Asserts [  on  ]';
            'offset 6 peek_level-1 [  54  ]';
            '54:183 state_ir__on_fail=>τon τfail state_ir__state_declaration state_ir__top_level_instructions • state_ir__on_fail state_ir__expected_symbols';
            '54:185 state_ir__on_fail=>τon τfail state_ir__state_declaration state_ir__top_level_instructions • state_ir__on_fail';
            scan(state.lexer, 12, 6);
            state.push_fn(branch_d064eaa27338181a, 0);
            return hc_state_ir__on_fail(state, db, 0);
        } else if (state.lexer._type == 83) {
            'Asserts [  symbols:  ]';
            'offset 4 peek_level1 [  expected  ]';
            '54:184 state_ir__on_fail=>τon τfail state_ir__state_declaration state_ir__top_level_instructions • state_ir__expected_symbols';
            var pk = state.lexer.copy_in_place();;
            pk.next();
            scan(pk, 28, 6);
            if (pk._type == 84) {
                'Asserts [  expected  ]';
                state.lexer._type = 83;
                state.push_fn(set_production /*54*/, 54);
                '"--LEAF--"';
                '54:184 state_ir__on_fail=>τon τfail state_ir__state_declaration state_ir__top_level_instructions • state_ir__expected_symbols';
                state.push_fn(branch_5b29213b1ea63153, 54);
                return hc_state_ir__expected_symbols(state, db, 0);
            }
        } else {
            '"--LEAF--"';
            '54:186 state_ir__on_fail=>τon τfail state_ir__state_declaration state_ir__top_level_instructions •';
            add_reduce(state, 4, 92);
            return 54;
        };
        return - 1;
    }

    function branch_7a81c403ac65aa4d(state, db, prod) {
        'offset 10 peek_level0 [  symbols: >  ]';
        '43:125 state_ir__grammar_injection=>τ<[ τrecover symbols__imported_production_symbol τ] state_ir__top_level_instructions state_ir__on_fail • state_ir__expected_symbols τ>';
        '43:129 state_ir__grammar_injection=>τ<[ τrecover symbols__imported_production_symbol τ] state_ir__top_level_instructions state_ir__on_fail • τ>';
        scan(state.lexer, 26, 6);
        if (state.lexer._type == 83) {
            'Asserts [  symbols:  ]';
            state.push_fn(set_production /*43*/, 43);
            '"--LEAF--"';
            '43:125 state_ir__grammar_injection=>τ<[ τrecover symbols__imported_production_symbol τ] state_ir__top_level_instructions state_ir__on_fail • state_ir__expected_symbols τ>';
            state.push_fn(branch_4e622020a638bfea, 43);
            return hc_state_ir__expected_symbols(state, db, 0);
        } else if (state.lexer._type == 27) {
            'Asserts [  >  ]';
            state.push_fn(set_production /*43*/, 43);
            '"--LEAF--"';
            '43:129 state_ir__grammar_injection=>τ<[ τrecover symbols__imported_production_symbol τ] state_ir__top_level_instructions state_ir__on_fail • τ>';
            consume(state);
            add_reduce(state, 7, 60);
            return 0;
        };
        return - 1;
    }

    function branch_7a9a8c52c44448e3(state, db, prod) {
        add_reduce(state, 1, 3);
        return hc_state_ir__instruction_sequence_list_317_goto(state, db, 70);
    }

    function branch_7fb47fd068703d17(state, db, prod) {
        'offset 6 peek_level-1 [  26  ]';
        '24:56 productions__production=>τ<> productions__production_group_112_0_ • productions__production_start_symbol production_bodies__production_bodies';
        '24:58 productions__production=>τ<> productions__production_group_112_0_ • productions__production_start_symbol';
        scan(state.lexer, 29, 4);
        state.push_fn(branch_2fad1f6b9df0c489, 0);
        return hc_productions__production_start_symbol(state, db, 0);
    }

    function branch_8401eaa890b43daa(state, db, prod) {
        add_reduce(state, 2, 68);
        return 0;
    }

    function branch_867d2b18947b7461(state, db, prod) {
        add_reduce(state, 1, 2);
        return 0;
    }

    function branch_87b6101eb7db095c(state, db, prod) {
        scan(state.lexer, 18, 6);
        if ((state.lexer._type == 31)) {
            consume(state);
            add_reduce(state, 5, 85);
            return 0;
        };
        return - 1;
    }

    function branch_8b40bd175543d16f(state, db, prod) {
        add_reduce(state, 6, 89);
        return 0;
    }

    function branch_8ce31c0473368907(state, db, prod) {
        scan(state.lexer, 30, 4);
        if ((state.lexer._type == 47)) {
            consume(state);
            state.push_fn(branch_f8e81fbaa5945d91, 42);
            return hc_functions__js_data(state, db, 0);
        };
        return - 1;
    }

    function branch_8ff4bf833a84b2ba(state, db, prod) {
        add_reduce(state, 2, 84);
        return 52;
    }

    function branch_9040c5faf0a30838(state, db, prod) {
        add_reduce(state, 5, 23);
        return 0;
    }

    function branch_90a9cc6da64ccc5d(state, db, prod) {
        'offset 3 peek_level0 [  f: | ) <> +> <[ # END_OF_PRODUCTION END_OF_FILE  ]';
        '28:66 production_bodies__production_body=>production_bodies__entries • functions__reduce_function';
        '28:68 production_bodies__production_body=>production_bodies__entries •';
        scan(state.lexer, 31, 4);
        if (state.lexer._type == 53) {
            'Asserts [  f:  ]';
            'offset 3 peek_level1 [  return r  ]';
            '28:66 production_bodies__production_body=>production_bodies__entries • functions__reduce_function';
            var pk = state.lexer.copy_in_place();;
            pk.next();
            scan(pk, 32, 4);
            if (pk._type == 52 || pk._type == 46) {
                'Asserts [  return r  ]';
                state.lexer._type = 53;
                state.push_fn(set_production /*28*/, 28);
                '"--LEAF--"';
                '28:66 production_bodies__production_body=>production_bodies__entries • functions__reduce_function';
                state.push_fn(branch_e156818b9199fc42, 28);
                return hc_functions__reduce_function(state, db, 0);
            }
        } else {
            '"--LEAF--"';
            '28:68 production_bodies__production_body=>production_bodies__entries •';
            add_reduce(state, 1, 32);
            return 28;
        };
        return - 1;
    }

    function branch_91cc41aa447c6f0b(state, db, prod) {
        add_reduce(state, 1, 3);
        return hc_symbols__ignore_symbols_goto(state, db, 6);
    }

    function branch_95746883370de56d(state, db, prod) {
        scan(state.lexer, 5, 6);
        if ((state.lexer._type == 27)) {
            consume(state);
            add_reduce(state, 7, 59);
            return 0;
        };
        return - 1;
    }

    function branch_95bfe6112c5b65ef(state, db, prod) {
        'offset 1 peek_level-1 [  45  ]';
        '57:190 state_ir__state_ir=>state_ir__state_declaration • state_ir__top_level_instructions state_ir__on_fail state_ir__expected_symbols';
        '57:191 state_ir__state_ir=>state_ir__state_declaration • state_ir__top_level_instructions state_ir__expected_symbols';
        '57:192 state_ir__state_ir=>state_ir__state_declaration • state_ir__top_level_instructions state_ir__on_fail';
        '57:193 state_ir__state_ir=>state_ir__state_declaration • state_ir__top_level_instructions';
        scan(state.lexer, 10, 6);
        state.push_fn(branch_2c02a651f27a325d, 0);
        return hc_state_ir__top_level_instructions(state, db, 0);
    }

    function branch_9a2a194ba6000915(state, db, prod) {
        add_reduce(state, 3, 8);
        return 0;
    }

    function branch_9a892c98f97ea129(state, db, prod) {
        add_reduce(state, 4, 67);
        return 0;
    }

    function branch_9c37f19f0739448e(state, db, prod) {
        'offset 3 peek_level0 [  skipped > symbols: END_OF_PRODUCTION  ]';
        '56:188 state_ir__expected_symbols=>τsymbols: τexpected state_ir__token_id_list • state_ir__expected_symbols_group_436_0_';
        '56:189 state_ir__expected_symbols=>τsymbols: τexpected state_ir__token_id_list •';
        scan(state.lexer, 33, 4);
        if (state.lexer._type == 87) {
            'Asserts [  skipped  ]';
            state.push_fn(set_production /*56*/, 56);
            '"--LEAF--"';
            '56:188 state_ir__expected_symbols=>τsymbols: τexpected state_ir__token_id_list • state_ir__expected_symbols_group_436_0_';
            state.push_fn(branch_c5d75521bd931a0c, 56);
            return hc_state_ir__expected_symbols_group_436_0_(state, db, 0);
        } else {
            '"--LEAF--"';
            '56:189 state_ir__expected_symbols=>τsymbols: τexpected state_ir__token_id_list •';
            add_reduce(state, 3, 94);
            return 56;
        };
        return - 1;
    }

    function branch_9e8b483fb07aa4f4(state, db, prod) {
        scan(state.lexer, 4, 34);
        if ((state.lexer._type == 7)) {
            consume(state);
            add_reduce(state, 3, 5);
            return 5;
        };
        return - 1;
    }

    function branch_a3a046d24e9182ed(state, db, prod) {
        scan(state.lexer, 17, 4);
        if ((state.lexer._type == 31)) {
            consume(state);
            add_reduce(state, 3, 47);
            return 0;
        };
        return - 1;
    }

    function branch_a488e9b02a9b1910(state, db, prod) {
        '"--LEAF--"';
        '50:174 state_ir__state_reference=>τstate τ[ τ& • symbols__imported_production_symbol τ]';
        state.push_fn(branch_b70f5fb0127f5160, 50);
        return hc_symbols__imported_production_symbol(state, db, 0);
    }

    function branch_a556dc24f4a9db73(state, db, prod) {
        scan(state.lexer, 17, 4);
        if ((state.lexer._type == 31)) {
            consume(state);
            add_reduce(state, 3, 46);
            return 0;
        };
        return - 1;
    }

    function branch_a819b8ad42e11bf0(state, db, prod) {
        add_reduce(state, 2, 66);
        return 78;
    }

    function branch_a9fc09dafb3fa9e1(state, db, prod) {
        scan(state.lexer, 9, 6);
        if ((state.lexer._type == 33)) {
            consume(state);
            add_reduce(state, 3, 66);
            return 51;
        };
        return - 1;
    }

    function branch_ac1450679407f627(state, db, prod) {
        add_reduce(state, 1, 3);
        return hc_state_ir__sequence_instruction_list_348_goto(state, db, 75);
    }

    function branch_ad5c187ba038713b(state, db, prod) {
        add_reduce(state, 2, 21);
        return 0;
    }

    function branch_b25ed08297926a1e(state, db, prod) {
        '"--LEAF--"';
        '50:176 state_ir__state_reference=>τstate τ[ τ& • symbols__production_symbol τ]';
        state.push_fn(branch_b70f5fb0127f5160, 50);
        return hc_symbols__production_symbol(state, db, 0);
    }

    function branch_b4248ad77c355d8a(state, db, prod) {
        add_reduce(state, 3, 15);
        return 20;
    }

    function branch_b70f5fb0127f5160(state, db, prod) {
        scan(state.lexer, 9, 6);
        if ((state.lexer._type == 33)) {
            consume(state);
            add_reduce(state, 5, 82);
            return 50;
        };
        return - 1;
    }

    function branch_b7122f5cf71e2cc2(state, db, prod) {
        add_reduce(state, 4, 95);
        return 0;
    }

    function branch_ba5f75631cc56b1f(state, db, prod) {
        scan(state.lexer, 19, 6);
        if ((state.lexer._type == 29)) {
            consume(state);
            state.push_fn(branch_582d2b466cda75d4, 53);
            return hc_state_ir__instruction_sequence(state, db, 0);
        };
        return - 1;
    }

    function branch_bc38f2fd5802e1c5(state, db, prod) {
        'offset 6 peek_level0 [  f: | ) <> +> <[ # END_OF_PRODUCTION END_OF_FILE  ]';
        '28:65 production_bodies__production_body=>τ( τFORK τ) production_bodies__entries • functions__reduce_function';
        '28:67 production_bodies__production_body=>τ( τFORK τ) production_bodies__entries •';
        scan(state.lexer, 31, 4);
        if (state.lexer._type == 53) {
            'Asserts [  f:  ]';
            'offset 6 peek_level1 [  return r  ]';
            '28:65 production_bodies__production_body=>τ( τFORK τ) production_bodies__entries • functions__reduce_function';
            var pk = state.lexer.copy_in_place();;
            pk.next();
            scan(pk, 32, 4);
            if (pk._type == 52 || pk._type == 46) {
                'Asserts [  return r  ]';
                state.lexer._type = 53;
                state.push_fn(set_production /*28*/, 28);
                '"--LEAF--"';
                '28:65 production_bodies__production_body=>τ( τFORK τ) production_bodies__entries • functions__reduce_function';
                state.push_fn(branch_6dfdfde90119238c, 28);
                return hc_functions__reduce_function(state, db, 0);
            }
        } else {
            '"--LEAF--"';
            '28:67 production_bodies__production_body=>τ( τFORK τ) production_bodies__entries •';
            add_reduce(state, 4, 31);
            return 28;
        };
        return - 1;
    }

    function branch_bd45a08d51d903d4(state, db, prod) {
        state.push_fn(branch_8ce31c0473368907, 42);
        return hc_symbols__identifier(state, db, 0);
    }

    function branch_bd8db0890a0e30bb(state, db, prod) {
        add_reduce(state, 1, 3);
        return hc_state_ir__top_level_instructions_list_306_goto(state, db, 68);
    }

    function branch_bea5d54f7e3b24d4(state, db, prod) {
        add_reduce(state, 1, 99);
        return hc_comments__cm_list_92_goto(state, db, 62);
    }

    function branch_c0908b9fb99ae6f8(state, db, prod) {
        'offset 7 peek_level0 [  on symbols: >  ]';
        '43:127 state_ir__grammar_injection=>τ<[ τrecover symbols__production_symbol τ] state_ir__top_level_instructions • state_ir__on_fail state_ir__expected_symbols τ>';
        '43:133 state_ir__grammar_injection=>τ<[ τrecover symbols__production_symbol τ] state_ir__top_level_instructions • state_ir__on_fail τ>';
        '43:132 state_ir__grammar_injection=>τ<[ τrecover symbols__production_symbol τ] state_ir__top_level_instructions • state_ir__expected_symbols τ>';
        '43:136 state_ir__grammar_injection=>τ<[ τrecover symbols__production_symbol τ] state_ir__top_level_instructions • τ>';
        scan(state.lexer, 20, 6);
        if (state.lexer._type == 58) {
            'Asserts [  on  ]';
            'offset 9 peek_level-1 [  54  ]';
            '43:127 state_ir__grammar_injection=>τ<[ τrecover symbols__production_symbol τ] state_ir__top_level_instructions • state_ir__on_fail state_ir__expected_symbols τ>';
            '43:133 state_ir__grammar_injection=>τ<[ τrecover symbols__production_symbol τ] state_ir__top_level_instructions • state_ir__on_fail τ>';
            scan(state.lexer, 12, 6);
            state.push_fn(branch_7458876708a01950, 0);
            return hc_state_ir__on_fail(state, db, 0);
        } else if (state.lexer._type == 83) {
            'Asserts [  symbols:  ]';
            state.push_fn(set_production /*43*/, 43);
            '"--LEAF--"';
            '43:132 state_ir__grammar_injection=>τ<[ τrecover symbols__production_symbol τ] state_ir__top_level_instructions • state_ir__expected_symbols τ>';
            state.push_fn(branch_95746883370de56d, 43);
            return hc_state_ir__expected_symbols(state, db, 0);
        } else if (state.lexer._type == 27) {
            'Asserts [  >  ]';
            state.push_fn(set_production /*43*/, 43);
            '"--LEAF--"';
            '43:136 state_ir__grammar_injection=>τ<[ τrecover symbols__production_symbol τ] state_ir__top_level_instructions • τ>';
            consume(state);
            add_reduce(state, 6, 63);
            return 0;
        };
        return - 1;
    }

    function branch_c14a9e71a86dbbda(state, db, prod) {
        'offset 3 peek_level-1 [  45  ]';
        '54:183 state_ir__on_fail=>τon τfail state_ir__state_declaration • state_ir__top_level_instructions state_ir__on_fail state_ir__expected_symbols';
        '54:184 state_ir__on_fail=>τon τfail state_ir__state_declaration • state_ir__top_level_instructions state_ir__expected_symbols';
        '54:185 state_ir__on_fail=>τon τfail state_ir__state_declaration • state_ir__top_level_instructions state_ir__on_fail';
        '54:186 state_ir__on_fail=>τon τfail state_ir__state_declaration • state_ir__top_level_instructions';
        scan(state.lexer, 10, 6);
        state.push_fn(branch_7a04ac1fc1d7cf2c, 0);
        return hc_state_ir__top_level_instructions(state, db, 0);
    }

    function branch_c1e79ca47ba10983(state, db, prod) {
        add_reduce(state, 4, 73);
        return 49;
    }

    function branch_c553d9e13b0a2bd7(state, db, prod) {
        scan(state.lexer, 5, 6);
        if ((state.lexer._type == 27)) {
            consume(state);
            add_reduce(state, 7, 58);
            return 0;
        };
        return - 1;
    }

    function branch_c5d75521bd931a0c(state, db, prod) {
        add_reduce(state, 4, 93);
        return 0;
    }

    function branch_c67687afe06a4425(state, db, prod) {
        'offset 9 peek_level0 [  symbols: >  ]';
        '43:126 state_ir__grammar_injection=>τ<[ tk:state_ir__state_hash_token τ] state_ir__top_level_instructions state_ir__on_fail • state_ir__expected_symbols τ>';
        '43:131 state_ir__grammar_injection=>τ<[ tk:state_ir__state_hash_token τ] state_ir__top_level_instructions state_ir__on_fail • τ>';
        scan(state.lexer, 26, 6);
        if (state.lexer._type == 83) {
            'Asserts [  symbols:  ]';
            state.push_fn(set_production /*43*/, 43);
            '"--LEAF--"';
            '43:126 state_ir__grammar_injection=>τ<[ tk:state_ir__state_hash_token τ] state_ir__top_level_instructions state_ir__on_fail • state_ir__expected_symbols τ>';
            state.push_fn(branch_c553d9e13b0a2bd7, 43);
            return hc_state_ir__expected_symbols(state, db, 0);
        } else if (state.lexer._type == 27) {
            'Asserts [  >  ]';
            state.push_fn(set_production /*43*/, 43);
            '"--LEAF--"';
            '43:131 state_ir__grammar_injection=>τ<[ tk:state_ir__state_hash_token τ] state_ir__top_level_instructions state_ir__on_fail • τ>';
            consume(state);
            add_reduce(state, 6, 62);
            return 0;
        };
        return - 1;
    }

    function branch_c6869aa137a8ea23(state, db, prod) {
        scan(state.lexer, 18, 6);
        if ((state.lexer._type == 31)) {
            consume(state);
            add_reduce(state, 5, 87);
            return 0;
        };
        return - 1;
    }

    function branch_c72859839843f4ac(state, db, prod) {
        'offset 1 peek_level-1 [  17  ]';
        '16:35 preambles__export_preamble=>τ@EXPORT • symbols__imported_production_symbol τas θid';
        '16:37 preambles__export_preamble=>τ@EXPORT • symbols__imported_production_symbol τAS θid';
        scan(state.lexer, 8, 4);
        state.push_fn(branch_6c45f4ceb0c835c7, 0);
        return hc_symbols__imported_production_symbol(state, db, 0);
    }

    function branch_c7a75ef4d623c6f3(state, db, prod) {
        scan(state.lexer, 19, 6);
        if ((state.lexer._type == 29)) {
            consume(state);
            state.push_fn(branch_396d55253fa604cf, 46);
            return hc_state_ir__instruction_sequence(state, db, 0);
        };
        return - 1;
    }

    function branch_c7bd0ae1f0c85449(state, db, prod) {
        add_reduce(state, 1, 3);
        return hc_production_bodies__body_entry_list_149_goto(state, db, 65);
    }

    function branch_c7be46f624c6a8da(state, db, prod) {
        'offset 8 peek_level0 [  # ( [ $empty <= ?= sym (EXC (ERR (IGN (RST (RED g: 9 tk: t: f:s $eof <> +> f: <[ END_OF_PRODUCTION END_OF_FILE  ]';
        '24:54 productions__production=>τ<> τ* productions__production_group_112_0_ productions__production_start_symbol • production_bodies__production_bodies';
        '24:57 productions__production=>τ<> τ* productions__production_group_112_0_ productions__production_start_symbol •';
        scan(state.lexer, 13, 4);
        if (state.lexer._type == 23) {
            'Asserts [  #  ]';
            'offset 8 peek_level1 [  sym id num sp  ]';
            '24:54 productions__production=>τ<> τ* productions__production_group_112_0_ productions__production_start_symbol • production_bodies__production_bodies';
            var pk = state.lexer.copy_in_place();;
            pk.next();
            scan(pk, 14, 15);
            if (pk._type == 2 || pk._type == 3 || pk._type == 5 || pk._type == 8) {
                'Asserts [  sym id num sp  ]';
                state.lexer._type = 23;
                state.push_fn(set_production /*24*/, 24);
                '"--LEAF--"';
                '24:54 productions__production=>τ<> τ* productions__production_group_112_0_ productions__production_start_symbol • production_bodies__production_bodies';
                state.push_fn(branch_9040c5faf0a30838, 24);
                return hc_production_bodies__production_bodies(state, db, 0);
            }
        } else if (isTokenActive(state.lexer._type, 16)) {
            'Asserts [  ( [ $empty <= ?= sym (EXC (ERR (IGN (RST (RED g: 9 tk: t: f:s $eof  ]';
            state.push_fn(set_production /*24*/, 24);
            '"--LEAF--"';
            '24:54 productions__production=>τ<> τ* productions__production_group_112_0_ productions__production_start_symbol • production_bodies__production_bodies';
            state.push_fn(branch_9040c5faf0a30838, 24);
            return hc_production_bodies__production_bodies(state, db, 0);
        } else {
            '"--LEAF--"';
            '24:57 productions__production=>τ<> τ* productions__production_group_112_0_ productions__production_start_symbol •';
            add_reduce(state, 4, 26);
            return 24;
        };
        return - 1;
    }

    function branch_c9ab92f5f4d4d46e(state, db, prod) {
        add_reduce(state, 1, 3);
        return hc_state_ir__top_level_instructions_list_305_goto(state, db, 67);
    }

    function branch_cb256704af305c98(state, db, prod) {
        'offset 2 peek_level0 [  sp END_OF_FILE nl } { id num sym g: t: f:s $eof ) hybrid-64513[[then]literal  [id]generated] on symbols: > ] (+ (* ? [ <= ?= ( (EXC (ERR (IGN (RST (RED tk: f: | # <[ <> +> END_OF_PRODUCTION 9 then  ]';
        '10:24 symbols__literal_symbol=>τt: symbols__literal_symbol_list_47 • symbols__sym_delimiter';
        '10:25 symbols__literal_symbol=>τt: symbols__literal_symbol_list_47 •';
        scan(state.lexer, 35, 0);
        if (state.lexer._type == 8 || state.lexer._type == 1 || state.lexer._type == 7) {
            'Asserts [  sp END_OF_FILE nl  ]';
            'offset 2 peek_level1 [  } { id num sp sym g: t: f:s $eof ) hybrid-64513[[then]literal  [id]generated] on symbols: > ] (+ (* ? [ <= ?= ( (EXC (ERR (IGN (RST (RED tk: f: | # <[ <> +> nl END_OF_PRODUCTION END_OF_FILE  ]';
            '10:24 symbols__literal_symbol=>τt: symbols__literal_symbol_list_47 • symbols__sym_delimiter';
            var pk = state.lexer.copy_in_place();;
            pk.next();
            scan(pk, 36, 0);
            if (isTokenActive(pk._type, 36)) {
                'Asserts [  } { id num sp sym g: t: f:s $eof ) hybrid-64513[[then]literal  [id]generated] on symbols: > ] (+ (* ? [ <= ?= ( (EXC (ERR (IGN (RST (RED tk: f: | # <[ <> +> nl END_OF_PRODUCTION END_OF_FILE  ]';
                state.lexer._type = 8;
                state.push_fn(set_production /*10*/, 10);
                '"--LEAF--"';
                '10:24 symbols__literal_symbol=>τt: symbols__literal_symbol_list_47 • symbols__sym_delimiter';
                state.push_fn(branch_9a2a194ba6000915, 10);
                return hc_symbols__sym_delimiter(state, db, 0);
            }
        } else {
            '"--LEAF--"';
            '10:25 symbols__literal_symbol=>τt: symbols__literal_symbol_list_47 •';
            add_reduce(state, 2, 8);
            return 10;
        };
        return - 1;
    }

    function branch_d064eaa27338181a(state, db, prod) {
        'offset 7 peek_level0 [  symbols: > END_OF_PRODUCTION  ]';
        '54:183 state_ir__on_fail=>τon τfail state_ir__state_declaration state_ir__top_level_instructions state_ir__on_fail • state_ir__expected_symbols';
        '54:185 state_ir__on_fail=>τon τfail state_ir__state_declaration state_ir__top_level_instructions state_ir__on_fail •';
        scan(state.lexer, 20, 6);
        if (state.lexer._type == 83) {
            'Asserts [  symbols:  ]';
            'offset 7 peek_level1 [  expected  ]';
            '54:183 state_ir__on_fail=>τon τfail state_ir__state_declaration state_ir__top_level_instructions state_ir__on_fail • state_ir__expected_symbols';
            var pk = state.lexer.copy_in_place();;
            pk.next();
            scan(pk, 28, 6);
            if (pk._type == 84) {
                'Asserts [  expected  ]';
                state.lexer._type = 83;
                state.push_fn(set_production /*54*/, 54);
                '"--LEAF--"';
                '54:183 state_ir__on_fail=>τon τfail state_ir__state_declaration state_ir__top_level_instructions state_ir__on_fail • state_ir__expected_symbols';
                state.push_fn(branch_8b40bd175543d16f, 54);
                return hc_state_ir__expected_symbols(state, db, 0);
            }
        } else {
            '"--LEAF--"';
            '54:185 state_ir__on_fail=>τon τfail state_ir__state_declaration state_ir__top_level_instructions state_ir__on_fail •';
            add_reduce(state, 5, 91);
            return 54;
        };
        return - 1;
    }

    function branch_d5734ccc71d316e4(state, db, prod) {
        add_reduce(state, 4, 78);
        return 0;
    }

    function branch_d78a4d16a14bf341(state, db, prod) {
        add_reduce(state, 4, 73);
        return 0;
    }

    function branch_d86f42b4b027bc9e(state, db, prod) {
        scan(state.lexer, 19, 6);
        if ((state.lexer._type == 29)) {
            consume(state);
            state.push_fn(branch_c6869aa137a8ea23, 53);
            return hc_state_ir__instruction_sequence(state, db, 0);
        };
        return - 1;
    }

    function branch_d9dbacc0bcbb1520(state, db, prod) {
        'offset 3 peek_level0 [  then ) on symbols: > END_OF_PRODUCTION  ]';
        '48:151 state_ir__instruction_sequence=>state_ir__instruction_sequence_list_320 • state_ir__instruction_sequence_group_324_0_';
        '48:154 state_ir__instruction_sequence=>state_ir__instruction_sequence_list_320 •';
        scan(state.lexer, 37, 4);
        if (state.lexer._type == 60) {
            'Asserts [  then  ]';
            state.push_fn(set_production /*48*/, 48);
            '"--LEAF--"';
            '48:151 state_ir__instruction_sequence=>state_ir__instruction_sequence_list_320 • state_ir__instruction_sequence_group_324_0_';
            state.push_fn(branch_8401eaa890b43daa, 48);
            return hc_state_ir__instruction_sequence_group_324_0_(state, db, 0);
        } else {
            '"--LEAF--"';
            '48:154 state_ir__instruction_sequence=>state_ir__instruction_sequence_list_320 •';
            add_reduce(state, 1, 70);
            return 48;
        };
        return - 1;
    }

    function branch_d9f7a3fc0252e1a1(state, db, prod) {
        'offset 6 peek_level0 [  on symbols: >  ]';
        '43:126 state_ir__grammar_injection=>τ<[ tk:state_ir__state_hash_token τ] state_ir__top_level_instructions • state_ir__on_fail state_ir__expected_symbols τ>';
        '43:131 state_ir__grammar_injection=>τ<[ tk:state_ir__state_hash_token τ] state_ir__top_level_instructions • state_ir__on_fail τ>';
        '43:130 state_ir__grammar_injection=>τ<[ tk:state_ir__state_hash_token τ] state_ir__top_level_instructions • state_ir__expected_symbols τ>';
        '43:135 state_ir__grammar_injection=>τ<[ tk:state_ir__state_hash_token τ] state_ir__top_level_instructions • τ>';
        scan(state.lexer, 20, 6);
        if (state.lexer._type == 58) {
            'Asserts [  on  ]';
            'offset 8 peek_level-1 [  54  ]';
            '43:126 state_ir__grammar_injection=>τ<[ tk:state_ir__state_hash_token τ] state_ir__top_level_instructions • state_ir__on_fail state_ir__expected_symbols τ>';
            '43:131 state_ir__grammar_injection=>τ<[ tk:state_ir__state_hash_token τ] state_ir__top_level_instructions • state_ir__on_fail τ>';
            scan(state.lexer, 12, 6);
            state.push_fn(branch_c67687afe06a4425, 0);
            return hc_state_ir__on_fail(state, db, 0);
        } else if (state.lexer._type == 83) {
            'Asserts [  symbols:  ]';
            state.push_fn(set_production /*43*/, 43);
            '"--LEAF--"';
            '43:130 state_ir__grammar_injection=>τ<[ tk:state_ir__state_hash_token τ] state_ir__top_level_instructions • state_ir__expected_symbols τ>';
            state.push_fn(branch_05d9f04113827af1, 43);
            return hc_state_ir__expected_symbols(state, db, 0);
        } else if (state.lexer._type == 27) {
            'Asserts [  >  ]';
            state.push_fn(set_production /*43*/, 43);
            '"--LEAF--"';
            '43:135 state_ir__grammar_injection=>τ<[ tk:state_ir__state_hash_token τ] state_ir__top_level_instructions • τ>';
            consume(state);
            add_reduce(state, 5, 64);
            return 0;
        };
        return - 1;
    }

    function branch_db55cd3993e0c4f4(state, db, prod) {
        '"--LEAF--"';
        '49:159 state_ir__sequence_instruction=>τreduce • functions__reduce_function';
        state.push_fn(branch_4b6d69c8225ee36a, 49);
        return hc_functions__reduce_function(state, db, 0);
    }

    function branch_dcee46cfb3f5fb06(state, db, prod) {
        add_reduce(state, 1, 16);
        return 0;
    }

    function branch_dd0d4861991a0119(state, db, prod) {
        add_reduce(state, 2, 22);
        return 0;
    }

    function branch_dd22dbb555230aa1(state, db, prod) {
        '"--LEAF--"';
        '69:230 state_ir__production_id_list_list_315=>state_ir__production_id_list_list_315 • symbols__imported_production_symbol';
        scan(state.lexer, 8, 4);
        if ((state.lexer._type == 13)) {
            state.push_fn(branch_eef2f6509049a4bc, 69);
            return hc_symbols__imported_production_symbol(state, db, 0);
        };
        return - 1;
    }

    function branch_dff7f7d3de3cf6ed(state, db, prod) {
        add_reduce(state, 1, 34);
        return 0;
    }

    function branch_e06ba6ca7274906b(state, db, prod) {
        'offset 7 peek_level0 [  then ) on symbols: > END_OF_PRODUCTION  ]';
        '48:150 state_ir__instruction_sequence=>state_ir__instruction_sequence_list_317 τthen state_ir__instruction_sequence_list_320 • state_ir__instruction_sequence_group_321_0_';
        '48:153 state_ir__instruction_sequence=>state_ir__instruction_sequence_list_317 τthen state_ir__instruction_sequence_list_320 •';
        scan(state.lexer, 37, 4);
        if (state.lexer._type == 60) {
            'Asserts [  then  ]';
            state.push_fn(set_production /*48*/, 48);
            '"--LEAF--"';
            '48:150 state_ir__instruction_sequence=>state_ir__instruction_sequence_list_317 τthen state_ir__instruction_sequence_list_320 • state_ir__instruction_sequence_group_321_0_';
            state.push_fn(branch_9a892c98f97ea129, 48);
            return hc_state_ir__instruction_sequence_group_321_0_(state, db, 0);
        } else {
            '"--LEAF--"';
            '48:153 state_ir__instruction_sequence=>state_ir__instruction_sequence_list_317 τthen state_ir__instruction_sequence_list_320 •';
            add_reduce(state, 3, 69);
            return 48;
        };
        return - 1;
    }

    function branch_e156818b9199fc42(state, db, prod) {
        add_reduce(state, 2, 30);
        return 0;
    }

    function branch_e354b2d77ad7a406(state, db, prod) {
        state.push_fn(branch_b4248ad77c355d8a, 20);
        return hc_comments__comment_delimiter(state, db, 0);
    }

    function branch_e4417757855b485b(state, db, prod) {
        'offset 2 peek_level-1 [  as AS  ]';
        '14:31 preambles__import_preamble=>τ@IMPORT preambles__import_preamble_list_58 • τas symbols__identifier';
        '14:32 preambles__import_preamble=>τ@IMPORT preambles__import_preamble_list_58 • τAS symbols__identifier';
        scan(state.lexer, 21, 4);
        if (state.lexer._type == 19) {
            'Asserts [  as  ]';
            state.push_fn(set_production /*14*/, 14);
            '"--LEAF--"';
            '14:31 preambles__import_preamble=>τ@IMPORT preambles__import_preamble_list_58 • τas symbols__identifier';
            consume(state);
            state.push_fn(branch_f4deb65b967f2c66, 14);
            return hc_symbols__identifier(state, db, 0);
        } else if (state.lexer._type == 20) {
            'Asserts [  AS  ]';
            state.push_fn(set_production /*14*/, 14);
            '"--LEAF--"';
            '14:32 preambles__import_preamble=>τ@IMPORT preambles__import_preamble_list_58 • τAS symbols__identifier';
            consume(state);
            state.push_fn(branch_f4deb65b967f2c66, 14);
            return hc_symbols__identifier(state, db, 0);
        };
        return - 1;
    }

    function branch_e717f2bc6ce57880(state, db, prod) {
        'offset 5 peek_level-1 [  ]  ]';
        '43:127 state_ir__grammar_injection=>τ<[ τrecover symbols__production_symbol • τ] state_ir__top_level_instructions state_ir__on_fail state_ir__expected_symbols τ>';
        '43:132 state_ir__grammar_injection=>τ<[ τrecover symbols__production_symbol • τ] state_ir__top_level_instructions state_ir__expected_symbols τ>';
        '43:133 state_ir__grammar_injection=>τ<[ τrecover symbols__production_symbol • τ] state_ir__top_level_instructions state_ir__on_fail τ>';
        '43:136 state_ir__grammar_injection=>τ<[ τrecover symbols__production_symbol • τ] state_ir__top_level_instructions τ>';
        scan(state.lexer, 9, 6);
        if (state.lexer._type == 33) {
            'Assert Consume [  ]  ]';
            consume(state);
            'offset 6 peek_level-1 [  45  ]';
            '43:127 state_ir__grammar_injection=>τ<[ τrecover symbols__production_symbol τ] • state_ir__top_level_instructions state_ir__on_fail state_ir__expected_symbols τ>';
            '43:132 state_ir__grammar_injection=>τ<[ τrecover symbols__production_symbol τ] • state_ir__top_level_instructions state_ir__expected_symbols τ>';
            '43:133 state_ir__grammar_injection=>τ<[ τrecover symbols__production_symbol τ] • state_ir__top_level_instructions state_ir__on_fail τ>';
            '43:136 state_ir__grammar_injection=>τ<[ τrecover symbols__production_symbol τ] • state_ir__top_level_instructions τ>';
            scan(state.lexer, 10, 6);
            state.push_fn(branch_c0908b9fb99ae6f8, 0);
            return hc_state_ir__top_level_instructions(state, db, 0);
        };
        return - 1;
    }

    function branch_e822cc50e69d2e45(state, db, prod) {
        scan(state.lexer, 38, 6);
        if ((state.lexer._type == 10)) {
            consume(state);
            add_reduce(state, 3, 0);
            return 0;
        };
        return - 1;
    }

    function branch_ea4fe5a031805a2e(state, db, prod) {
        add_reduce(state, 1, 3);
        return hc_state_ir__instruction_sequence_list_320_goto(state, db, 71);
    }

    function branch_ebc85f32336ac76a(state, db, prod) {
        'offset 1 peek_level0 [  r return  ]';
        '37:103 functions__reduce_function=>functions__js_function_start_symbol • τr τ{ functions__js_data τ}';
        '37:104 functions__reduce_function=>functions__js_function_start_symbol • τr τ^ symbols__identifier';
        '37:105 functions__reduce_function=>functions__js_function_start_symbol • τr τ=> symbols__identifier';
        '37:106 functions__reduce_function=>functions__js_function_start_symbol • τreturn τ{ functions__js_data τ}';
        '37:107 functions__reduce_function=>functions__js_function_start_symbol • τreturn τ^ symbols__identifier';
        '37:108 functions__reduce_function=>functions__js_function_start_symbol • τreturn τ=> symbols__identifier';
        scan(state.lexer, 32, 4);
        if (state.lexer._type == 46) {
            'Asserts [  r  ]';
            'offset 1 peek_level1 [  { ^ =>  ]';
            '37:103 functions__reduce_function=>functions__js_function_start_symbol • τr τ{ functions__js_data τ}';
            '37:104 functions__reduce_function=>functions__js_function_start_symbol • τr τ^ symbols__identifier';
            '37:105 functions__reduce_function=>functions__js_function_start_symbol • τr τ=> symbols__identifier';
            var pk = state.lexer.copy_in_place();;
            pk.next();
            scan(pk, 39, 4);
            if (pk._type == 47) {
                'Asserts [  {  ]';
                state.lexer._type = 46;
                state.push_fn(set_production /*37*/, 37);
                '"--LEAF--"';
                '37:103 functions__reduce_function=>functions__js_function_start_symbol • τr τ{ functions__js_data τ}';
                consume(state);
                scan(state.lexer, 30, 4);
                if ((state.lexer._type == 47)) {
                    consume(state);
                    state.push_fn(branch_03f4a59e150407e1, 37);
                    return hc_functions__js_data(state, db, 0);
                };
                return - 1;
            } else if (pk._type == 50) {
                'Asserts [  ^  ]';
                state.lexer._type = 49;
                state.push_fn(set_production /*37*/, 37);
                '"--LEAF--"';
                '37:104 functions__reduce_function=>functions__js_function_start_symbol • τr τ^ symbols__identifier';
                consume(state);
                scan(state.lexer, 40, 4);
                if ((state.lexer._type == 50)) {
                    consume(state);
                    state.push_fn(branch_2876d6b8135bad32, 37);
                    return hc_symbols__identifier(state, db, 0);
                };
                return - 1;
            } else {
                state.lexer._type = 49;
                state.push_fn(set_production /*37*/, 37);
                '"--LEAF--"';
                '37:105 functions__reduce_function=>functions__js_function_start_symbol • τr τ=> symbols__identifier';
                consume(state);
                scan(state.lexer, 41, 4);
                if ((state.lexer._type == 51)) {
                    consume(state);
                    state.push_fn(branch_47bfa97ed9d72856, 37);
                    return hc_symbols__identifier(state, db, 0);
                };
                return - 1;
            }
        } else if (state.lexer._type == 52) {
            'Asserts [  return  ]';
            consume(state);
            '"⤋⤋⤋  post-peek-consume ⤋⤋⤋"';
            'offset 3 peek_level-1 [  return  ]';
            '37:106 functions__reduce_function=>functions__js_function_start_symbol • τreturn τ{ functions__js_data τ}';
            '37:107 functions__reduce_function=>functions__js_function_start_symbol • τreturn τ^ symbols__identifier';
            '37:108 functions__reduce_function=>functions__js_function_start_symbol • τreturn τ=> symbols__identifier';
            'offset 4 peek_level-1 [  { ^ =>  ]';
            '37:106 functions__reduce_function=>functions__js_function_start_symbol τreturn • τ{ functions__js_data τ}';
            '37:107 functions__reduce_function=>functions__js_function_start_symbol τreturn • τ^ symbols__identifier';
            '37:108 functions__reduce_function=>functions__js_function_start_symbol τreturn • τ=> symbols__identifier';
            scan(state.lexer, 39, 4);
            if (state.lexer._type == 47) {
                'Asserts [  {  ]';
                state.push_fn(set_production /*37*/, 37);
                '"--LEAF--"';
                '37:106 functions__reduce_function=>functions__js_function_start_symbol τreturn • τ{ functions__js_data τ}';
                consume(state);
                state.push_fn(branch_03f4a59e150407e1, 37);
                return hc_functions__js_data(state, db, 0);
            } else if (state.lexer._type == 50) {
                'Asserts [  ^  ]';
                state.push_fn(set_production /*37*/, 37);
                '"--LEAF--"';
                '37:107 functions__reduce_function=>functions__js_function_start_symbol τreturn • τ^ symbols__identifier';
                consume(state);
                state.push_fn(branch_2876d6b8135bad32, 37);
                return hc_symbols__identifier(state, db, 0);
            } else if (state.lexer._type == 51) {
                'Asserts [  =>  ]';
                state.push_fn(set_production /*37*/, 37);
                '"--LEAF--"';
                '37:108 functions__reduce_function=>functions__js_function_start_symbol τreturn • τ=> symbols__identifier';
                consume(state);
                state.push_fn(branch_47bfa97ed9d72856, 37);
                return hc_symbols__identifier(state, db, 0);
            }
        };
        return - 1;
    }

    function branch_ebe5fcdd5a08edb8(state, db, prod) {
        add_reduce(state, 3, 96);
        return 0;
    }

    function branch_ee807c5db31c9cae(state, db, prod) {
        scan(state.lexer, 19, 6);
        if ((state.lexer._type == 29)) {
            consume(state);
            state.push_fn(branch_87b6101eb7db095c, 53);
            return hc_state_ir__instruction_sequence(state, db, 0);
        };
        return - 1;
    }

    function branch_eef2f6509049a4bc(state, db, prod) {
        add_reduce(state, 2, 4);
        return hc_state_ir__production_id_list_list_315_goto(state, db, 69);
    }

    function branch_ef65e47554fb2735(state, db, prod) {
        scan(state.lexer, 18, 6);
        if ((state.lexer._type == 31)) {
            consume(state);
            add_reduce(state, 5, 74);
            return 0;
        };
        return - 1;
    }

    function branch_f2237a785504100b(state, db, prod) {
        'offset 4 peek_level-1 [  18  ]';
        '43:127 state_ir__grammar_injection=>τ<[ τrecover • symbols__production_symbol τ] state_ir__top_level_instructions state_ir__on_fail state_ir__expected_symbols τ>';
        '43:132 state_ir__grammar_injection=>τ<[ τrecover • symbols__production_symbol τ] state_ir__top_level_instructions state_ir__expected_symbols τ>';
        '43:133 state_ir__grammar_injection=>τ<[ τrecover • symbols__production_symbol τ] state_ir__top_level_instructions state_ir__on_fail τ>';
        '43:136 state_ir__grammar_injection=>τ<[ τrecover • symbols__production_symbol τ] state_ir__top_level_instructions τ>';
        scan(state.lexer, 42, 6);
        state.push_fn(branch_e717f2bc6ce57880, 0);
        return hc_symbols__production_symbol(state, db, 0);
    }

    function branch_f3f85506f81a8a02(state, db, prod) {
        'offset 5 peek_level0 [  symbols: END_OF_PRODUCTION  ]';
        '57:190 state_ir__state_ir=>state_ir__state_declaration state_ir__top_level_instructions state_ir__on_fail • state_ir__expected_symbols';
        '57:192 state_ir__state_ir=>state_ir__state_declaration state_ir__top_level_instructions state_ir__on_fail •';
        scan(state.lexer, 43, 6);
        if (state.lexer._type == 83) {
            'Asserts [  symbols:  ]';
            state.push_fn(set_production /*57*/, 57);
            '"--LEAF--"';
            '57:190 state_ir__state_ir=>state_ir__state_declaration state_ir__top_level_instructions state_ir__on_fail • state_ir__expected_symbols';
            state.push_fn(branch_b7122f5cf71e2cc2, 57);
            return hc_state_ir__expected_symbols(state, db, 0);
        } else {
            '"--LEAF--"';
            '57:192 state_ir__state_ir=>state_ir__state_declaration state_ir__top_level_instructions state_ir__on_fail •';
            add_reduce(state, 3, 97);
            return 57;
        };
        return - 1;
    }

    function branch_f3f900cc4027675e(state, db, prod) {
        add_reduce(state, 1, 3);
        return hc_preambles__preamble_goto(state, db, 3);
    }

    function branch_f4deb65b967f2c66(state, db, prod) {
        add_reduce(state, 4, 11);
        return 0;
    }

    function branch_f5105dfaad6e7c19(state, db, prod) {
        'offset 1 peek_level-1 [  18  ]';
        '16:34 preambles__export_preamble=>τ@EXPORT • symbols__production_symbol τas θid';
        '16:36 preambles__export_preamble=>τ@EXPORT • symbols__production_symbol τAS θid';
        scan(state.lexer, 8, 4);
        state.push_fn(branch_5b75cb4e03ce8e90, 0);
        return hc_symbols__production_symbol(state, db, 0);
    }

    function branch_f6184ff0ddf1f77e(state, db, prod) {
        scan(state.lexer, 18, 6);
        if ((state.lexer._type == 31)) {
            consume(state);
            add_reduce(state, 5, 86);
            return 0;
        };
        return - 1;
    }

    function branch_f623f9f0211d66a4(state, db, prod) {
        'offset 4 peek_level-1 [  17  ]';
        '43:125 state_ir__grammar_injection=>τ<[ τrecover • symbols__imported_production_symbol τ] state_ir__top_level_instructions state_ir__on_fail state_ir__expected_symbols τ>';
        '43:128 state_ir__grammar_injection=>τ<[ τrecover • symbols__imported_production_symbol τ] state_ir__top_level_instructions state_ir__expected_symbols τ>';
        '43:129 state_ir__grammar_injection=>τ<[ τrecover • symbols__imported_production_symbol τ] state_ir__top_level_instructions state_ir__on_fail τ>';
        '43:134 state_ir__grammar_injection=>τ<[ τrecover • symbols__imported_production_symbol τ] state_ir__top_level_instructions τ>';
        scan(state.lexer, 42, 6);
        state.push_fn(branch_23c6fb6fe255fce8, 0);
        return hc_symbols__imported_production_symbol(state, db, 0);
    }

    function branch_f6ed614f7f77349f(state, db, prod) {
        add_reduce(state, 2, 37);
        return 0;
    }

    function branch_f8e81fbaa5945d91(state, db, prod) {
        scan(state.lexer, 3, 4);
        if ((state.lexer._type == 48)) {
            consume(state);
            add_reduce(state, 5, 56);
            return 42;
        };
        return - 1;
    }

    function branch_f9e1a29fb634c790(state, db, prod) {
        'offset 7 peek_level-1 [  26  ]';
        '24:54 productions__production=>τ<> τ* productions__production_group_112_0_ • productions__production_start_symbol production_bodies__production_bodies';
        '24:57 productions__production=>τ<> τ* productions__production_group_112_0_ • productions__production_start_symbol';
        scan(state.lexer, 29, 4);
        state.push_fn(branch_c7be46f624c6a8da, 0);
        return hc_productions__production_start_symbol(state, db, 0);
    }

    function branch_fbe4e92e75cab6e4(state, db, prod) {
        scan(state.lexer, 17, 4);
        if ((state.lexer._type == 31)) {
            consume(state);
            add_reduce(state, 3, 39);
            return 0;
        };
        return - 1;
    }

    function branch_fcde92d94c542cab(state, db, prod) {
        state.push_fn(branch_343da8e856bef04d, 12);
        return hc_symbols__sym_delimiter(state, db, 0);
    }

    function branch_fcebf5fbb50990ed(state, db, prod) {
        state.push_fn(branch_24e04851352465e5, 24);
        return hc_production_bodies__production_bodies(state, db, 0);
    }

    function hc_hydrocarbon(state, db, prod) {
        '"--LEAF--"';
        '0:0 hydrocarbon=>• head';
        state.push_fn(set_production /*0*/, 0);
        return hc_head(state, db, 0);
    }

    function hc_head(state, db, prod) {
        scan(state.lexer, 44, 4);
        'offset 0 peek_level0 [  @IGNORE @IMPORT @EXPORT # <> +> <[ f:  ]';
        '1:1 head=>• preambles__preamble productions__productions';
        '1:2 head=>• productions__productions';
        if (state.lexer._type == 11 || state.lexer._type == 18 || state.lexer._type == 21 || state.lexer._type == 23) {
            'Asserts [  @IGNORE @IMPORT @EXPORT #  ]';
            state.push_fn(set_production /*1*/, 1);
            '"--LEAF--"';
            '1:1 head=>• preambles__preamble productions__productions';
            state.push_fn(branch_4d9ad2a909c7c47e, 1);
            return hc_preambles__preamble(state, db, 0);
        } else {
            state.push_fn(set_production /*1*/, 1);
            '"--LEAF--"';
            '1:2 head=>• productions__productions';
            state.push_fn(branch_867d2b18947b7461, 1);
            return hc_productions__productions(state, db, 0);
        };
        return - 1;
    }

    function hc_state_ir__comment(state, db, prod) {
        scan(state.lexer, 45, 6);
        'offset 0 peek_level-1 [  /*  ]';
        '2:3 state_ir__comment=>• τ/* state_ir__comment_list_6 τ*/';
        '2:4 state_ir__comment=>• τ/* τ*/';
        if (state.lexer._type == 9) {
            'Assert Consume [  /*  ]';
            consume(state);
            'offset 1 peek_level0 [  */ sym sp nl id num  ]';
            '2:3 state_ir__comment=>τ/* • state_ir__comment_list_6 τ*/';
            '2:4 state_ir__comment=>τ/* • τ*/';
            scan(state.lexer, 46, 0);
            if (state.lexer._type == 10) {
                'Asserts [  */  ]';
                state.push_fn(set_production /*2*/, 2);
                '"--LEAF--"';
                '2:4 state_ir__comment=>τ/* • τ*/';
                consume(state);
                add_reduce(state, 2, 0);
                return 0;
            } else {
                state.push_fn(set_production /*2*/, 2);
                '"--LEAF--"';
                '2:3 state_ir__comment=>τ/* • state_ir__comment_list_6 τ*/';
                state.push_fn(branch_e822cc50e69d2e45, 2);
                return hc_state_ir__comment_list_6(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_preambles__preamble(state, db, prod) {
        '"--LEAF--"';
        '3:5 preambles__preamble=>• preambles__preamble_clause';
        state.push_fn(branch_f3f900cc4027675e, 3);
        return hc_preambles__preamble_clause(state, db, 0);
    }

    function hc_preambles__preamble_goto(state, db, prod) {
        'offset 1 peek_level0 [  @IGNORE @IMPORT @EXPORT # <> +> <[ f:  ]';
        '3:6 preambles__preamble=>preambles__preamble • preambles__preamble_clause';
        '1:1 head=>preambles__preamble • productions__productions';
        scan(state.lexer, 44, 4);
        if (state.lexer._type == 11 || state.lexer._type == 18 || state.lexer._type == 21 || state.lexer._type == 23) {
            'Asserts [  @IGNORE @IMPORT @EXPORT #  ]';
            state.push_fn(hc_preambles__preamble_goto /*hc_preambles__preamble_goto( state, db, 3 )*/, 3);
            '"--LEAF--"';
            '3:6 preambles__preamble=>preambles__preamble • preambles__preamble_clause';
            scan(state.lexer, 47, 4);
            if ((state.lexer._type == 11 || state.lexer._type == 18 || state.lexer._type == 21 || state.lexer._type == 23)) {
                state.push_fn(branch_28ab10e2751570b2, 3);
                return hc_preambles__preamble_clause(state, db, 0);
            };
            return - 1;
        };
        return (prod == 3) ? prod : - 1;
    }

    function hc_preambles__preamble_clause(state, db, prod) {
        scan(state.lexer, 47, 4);
        'offset 0 peek_level0 [  @IGNORE @IMPORT @EXPORT #  ]';
        '4:7 preambles__preamble_clause=>• preambles__ignore_preamble';
        '4:8 preambles__preamble_clause=>• preambles__import_preamble';
        '4:9 preambles__preamble_clause=>• preambles__export_preamble';
        '4:10 preambles__preamble_clause=>• comments__comment';
        if (state.lexer._type == 11) {
            'Asserts [  @IGNORE  ]';
            state.push_fn(set_production /*4*/, 4);
            '"--LEAF--"';
            '4:7 preambles__preamble_clause=>• preambles__ignore_preamble';
            state.push_fn(set_production /*0*/, 4);
            return hc_preambles__ignore_preamble(state, db, 0);
        } else if (state.lexer._type == 18) {
            'Asserts [  @IMPORT  ]';
            state.push_fn(set_production /*4*/, 4);
            '"--LEAF--"';
            '4:8 preambles__preamble_clause=>• preambles__import_preamble';
            state.push_fn(set_production /*0*/, 4);
            return hc_preambles__import_preamble(state, db, 0);
        } else if (state.lexer._type == 21) {
            'Asserts [  @EXPORT  ]';
            state.push_fn(set_production /*4*/, 4);
            '"--LEAF--"';
            '4:9 preambles__preamble_clause=>• preambles__export_preamble';
            state.push_fn(set_production /*0*/, 4);
            return hc_preambles__export_preamble(state, db, 0);
        } else {
            state.push_fn(set_production /*4*/, 4);
            '"--LEAF--"';
            '4:10 preambles__preamble_clause=>• comments__comment';
            state.push_fn(set_production /*0*/, 4);
            return hc_comments__comment(state, db, 0);
        };
        return - 1;
    }

    function hc_preambles__ignore_preamble(state, db, prod) {
        scan(state.lexer, 48, 4);
        'offset 0 peek_level-1 [  @IGNORE  ]';
        '5:11 preambles__ignore_preamble=>• τ@IGNORE symbols__ignore_symbols θnl';
        if (state.lexer._type == 11) {
            'Assert Consume [  @IGNORE  ]';
            consume(state);
            '"--LEAF--"';
            '5:11 preambles__ignore_preamble=>τ@IGNORE • symbols__ignore_symbols θnl';
            scan(state.lexer, 49, 4);
            if ((state.lexer._type == 12 || state.lexer._type == 15 || state.lexer._type == 16 || state.lexer._type == 17)) {
                state.push_fn(branch_9e8b483fb07aa4f4, 5);
                return hc_symbols__ignore_symbols(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_symbols__ignore_symbols(state, db, prod) {
        '"--LEAF--"';
        '6:12 symbols__ignore_symbols=>• symbols__ignore_symbol';
        state.push_fn(branch_91cc41aa447c6f0b, 6);
        return hc_symbols__ignore_symbol(state, db, 0);
    }

    function hc_symbols__ignore_symbols_goto(state, db, prod) {
        'offset 1 peek_level0 [  g: t: f:s tk: nl  ]';
        '6:13 symbols__ignore_symbols=>symbols__ignore_symbols • symbols__ignore_symbol';
        '5:11 preambles__ignore_preamble=>τ@IGNORE symbols__ignore_symbols • θnl';
        scan(state.lexer, 49, 34);
        if (state.lexer._type == 12 || state.lexer._type == 15 || state.lexer._type == 16 || state.lexer._type == 17) {
            'Asserts [  g: t: f:s tk:  ]';
            state.push_fn(hc_symbols__ignore_symbols_goto /*hc_symbols__ignore_symbols_goto( state, db, 6 )*/, 6);
            '"--LEAF--"';
            '6:13 symbols__ignore_symbols=>symbols__ignore_symbols • symbols__ignore_symbol';
            scan(state.lexer, 49, 4);
            if ((state.lexer._type == 12 || state.lexer._type == 15 || state.lexer._type == 16 || state.lexer._type == 17)) {
                state.push_fn(branch_28ab10e2751570b2, 6);
                return hc_symbols__ignore_symbol(state, db, 0);
            };
            return - 1;
        };
        return (prod == 6) ? prod : - 1;
    }

    function hc_symbols__ignore_symbol(state, db, prod) {
        scan(state.lexer, 49, 4);
        'offset 0 peek_level0 [  g: t: f:s tk:  ]';
        '7:14 symbols__ignore_symbol=>• symbols__generated_symbol';
        '7:15 symbols__ignore_symbol=>• symbols__literal_symbol';
        '7:16 symbols__ignore_symbol=>• symbols__escaped_symbol';
        '7:17 symbols__ignore_symbol=>• symbols__production_token_symbol';
        if (state.lexer._type == 12) {
            'Asserts [  g:  ]';
            state.push_fn(set_production /*7*/, 7);
            '"--LEAF--"';
            '7:14 symbols__ignore_symbol=>• symbols__generated_symbol';
            state.push_fn(set_production /*0*/, 7);
            return hc_symbols__generated_symbol(state, db, 0);
        } else if (state.lexer._type == 15) {
            'Asserts [  t:  ]';
            state.push_fn(set_production /*7*/, 7);
            '"--LEAF--"';
            '7:15 symbols__ignore_symbol=>• symbols__literal_symbol';
            state.push_fn(set_production /*0*/, 7);
            return hc_symbols__literal_symbol(state, db, 0);
        } else if (state.lexer._type == 16) {
            'Asserts [  f:s  ]';
            state.push_fn(set_production /*7*/, 7);
            '"--LEAF--"';
            '7:16 symbols__ignore_symbol=>• symbols__escaped_symbol';
            state.push_fn(set_production /*0*/, 7);
            return hc_symbols__escaped_symbol(state, db, 0);
        } else {
            state.push_fn(set_production /*7*/, 7);
            '"--LEAF--"';
            '7:17 symbols__ignore_symbol=>• symbols__production_token_symbol';
            state.push_fn(set_production /*0*/, 7);
            return hc_symbols__production_token_symbol(state, db, 0);
        };
        return - 1;
    }

    function hc_symbols__generated_symbol(state, db, prod) {
        scan(state.lexer, 50, 4);
        'offset 0 peek_level-1 [  g:  ]';
        '8:18 symbols__generated_symbol=>• τg: tk:symbols__identifier_syms';
        if (state.lexer._type == 12) {
            'Assert Consume [  g:  ]';
            consume(state);
            '"--LEAF--"';
            '8:18 symbols__generated_symbol=>τg: • tk:symbols__identifier_syms';
            scan(state.lexer, 8, 4);
            if ((state.lexer._type == 13)) {
                consume(state);
                add_reduce(state, 2, 6);
                return 8;
            }
        };
        return - 1;
    }

    function hc_symbols__identifier_syms(state, db, prod) {
        scan(state.lexer, 51, 4);
        'offset 0 peek_level-1 [  _ id  ]';
        '9:22 symbols__identifier_syms=>• τ_';
        '9:23 symbols__identifier_syms=>• θid';
        if (state.lexer._type == 14) {
            'Asserts [  _  ]';
            state.push_fn(hc_symbols__identifier_syms_goto /*hc_symbols__identifier_syms_goto( state, db, 9 )*/, 9);
            '"--LEAF--"';
            '9:22 symbols__identifier_syms=>• τ_';
            consume(state);
            return 0;
        } else if (state.lexer._type == 3) {
            'Asserts [  id  ]';
            state.push_fn(hc_symbols__identifier_syms_goto /*hc_symbols__identifier_syms_goto( state, db, 9 )*/, 9);
            '"--LEAF--"';
            '9:23 symbols__identifier_syms=>• θid';
            consume(state);
            return 0;
        };
        return - 1;
    }

    function hc_symbols__identifier_syms_goto(state, db, prod) {
        'offset 1 peek_level-1 [  _ id num  ]';
        '9:19 symbols__identifier_syms=>symbols__identifier_syms • θid';
        '9:20 symbols__identifier_syms=>symbols__identifier_syms • τ_';
        '9:21 symbols__identifier_syms=>symbols__identifier_syms • θnum';
        scan(state.lexer, 52, 0);
        if (state.lexer._type == 14) {
            'Asserts [  _  ]';
            state.push_fn(hc_symbols__identifier_syms_goto /*hc_symbols__identifier_syms_goto( state, db, 9 )*/, 9);
            '"--LEAF--"';
            '9:20 symbols__identifier_syms=>symbols__identifier_syms • τ_';
            scan(state.lexer, 53, 0);
            consume(state);
            add_reduce(state, 2, 7);
            return 0;
        } else if (state.lexer._type == 3) {
            'Asserts [  id  ]';
            state.push_fn(hc_symbols__identifier_syms_goto /*hc_symbols__identifier_syms_goto( state, db, 9 )*/, 9);
            '"--LEAF--"';
            '9:19 symbols__identifier_syms=>symbols__identifier_syms • θid';
            scan(state.lexer, 54, 0);
            consume(state);
            add_reduce(state, 2, 7);
            return 0;
        } else if (state.lexer._type == 5) {
            'Asserts [  num  ]';
            state.push_fn(hc_symbols__identifier_syms_goto /*hc_symbols__identifier_syms_goto( state, db, 9 )*/, 9);
            '"--LEAF--"';
            '9:21 symbols__identifier_syms=>symbols__identifier_syms • θnum';
            scan(state.lexer, 55, 0);
            consume(state);
            add_reduce(state, 2, 7);
            return 0;
        };
        return (prod == 9) ? prod : - 1;
    }

    function hc_symbols__literal_symbol(state, db, prod) {
        scan(state.lexer, 56, 4);
        'offset 0 peek_level-1 [  t:  ]';
        '10:24 symbols__literal_symbol=>• τt: symbols__literal_symbol_list_47 symbols__sym_delimiter';
        '10:25 symbols__literal_symbol=>• τt: symbols__literal_symbol_list_47';
        if (state.lexer._type == 15) {
            'Assert Consume [  t:  ]';
            consume(state);
            'offset 1 peek_level-1 [  59  ]';
            '10:24 symbols__literal_symbol=>τt: • symbols__literal_symbol_list_47 symbols__sym_delimiter';
            '10:25 symbols__literal_symbol=>τt: • symbols__literal_symbol_list_47';
            scan(state.lexer, 57, 4);
            state.push_fn(branch_cb256704af305c98, 0);
            return hc_symbols__literal_symbol_list_47(state, db, 0);
        };
        return - 1;
    }

    function hc_symbols__sym_delimiter(state, db, prod) {
        scan(state.lexer, 58, 0);
        'offset 0 peek_level-1 [  sp END_OF_FILE nl  ]';
        '11:26 symbols__sym_delimiter=>• θsp';
        '11:27 symbols__sym_delimiter=>• END_OF_FILE';
        '11:28 symbols__sym_delimiter=>• θnl';
        if (state.lexer._type == 8) {
            'Asserts [  sp  ]';
            state.push_fn(set_production /*11*/, 11);
            '"--LEAF--"';
            '11:26 symbols__sym_delimiter=>• θsp';
            consume(state);
            return 0;
        } else if (state.lexer._type == 1) {
            'Asserts [  END_OF_FILE  ]';
            state.push_fn(set_production /*11*/, 11);
            '"--LEAF--"';
            '11:27 symbols__sym_delimiter=>• END_OF_FILE';
            consume(state);
            return 0;
        } else if (state.lexer._type == 7) {
            'Asserts [  nl  ]';
            state.push_fn(set_production /*11*/, 11);
            '"--LEAF--"';
            '11:28 symbols__sym_delimiter=>• θnl';
            consume(state);
            return 0;
        };
        return - 1;
    }

    function hc_symbols__escaped_symbol(state, db, prod) {
        scan(state.lexer, 59, 4);
        'offset 0 peek_level-1 [  f:s  ]';
        '12:29 symbols__escaped_symbol=>• τf:s symbols__escaped_symbol_list_53 symbols__sym_delimiter';
        if (state.lexer._type == 16) {
            'Assert Consume [  f:s  ]';
            consume(state);
            '"--LEAF--"';
            '12:29 symbols__escaped_symbol=>τf:s • symbols__escaped_symbol_list_53 symbols__sym_delimiter';
            scan(state.lexer, 14, 4);
            if ((state.lexer._type == 5 || state.lexer._type == 3 || state.lexer._type == 2)) {
                state.push_fn(branch_fcde92d94c542cab, 12);
                return hc_symbols__escaped_symbol_list_53(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_symbols__production_token_symbol(state, db, prod) {
        scan(state.lexer, 60, 4);
        'offset 0 peek_level-1 [  tk:  ]';
        '13:30 symbols__production_token_symbol=>• τtk: tk:symbols__identifier_syms';
        if (state.lexer._type == 17) {
            'Assert Consume [  tk:  ]';
            consume(state);
            '"--LEAF--"';
            '13:30 symbols__production_token_symbol=>τtk: • tk:symbols__identifier_syms';
            scan(state.lexer, 8, 4);
            if ((state.lexer._type == 13)) {
                consume(state);
                add_reduce(state, 2, 10);
                return 13;
            }
        };
        return - 1;
    }

    function hc_preambles__import_preamble(state, db, prod) {
        scan(state.lexer, 61, 4);
        'offset 0 peek_level-1 [  @IMPORT  ]';
        '14:31 preambles__import_preamble=>• τ@IMPORT preambles__import_preamble_list_58 τas symbols__identifier';
        '14:32 preambles__import_preamble=>• τ@IMPORT preambles__import_preamble_list_58 τAS symbols__identifier';
        if (state.lexer._type == 18) {
            'Assert Consume [  @IMPORT  ]';
            consume(state);
            'offset 1 peek_level-1 [  61  ]';
            '14:31 preambles__import_preamble=>τ@IMPORT • preambles__import_preamble_list_58 τas symbols__identifier';
            '14:32 preambles__import_preamble=>τ@IMPORT • preambles__import_preamble_list_58 τAS symbols__identifier';
            scan(state.lexer, 62, 4);
            state.push_fn(branch_e4417757855b485b, 0);
            return hc_preambles__import_preamble_list_58(state, db, 0);
        };
        return - 1;
    }

    function hc_symbols__identifier(state, db, prod) {
        scan(state.lexer, 8, 4);
        'offset 0 peek_level-1 [  9  ]';
        '15:33 symbols__identifier=>• tk:symbols__identifier_syms';
        if (state.lexer._type == 13) {
            'Assert Consume [  9  ]';
            consume(state);
            '"--LEAF--"';
            '15:33 symbols__identifier=>tk:symbols__identifier_syms •';
            scan(state.lexer, 4, 4);
            return 15;
        };
        return - 1;
    }

    function hc_preambles__export_preamble(state, db, prod) {
        scan(state.lexer, 63, 4);
        'offset 0 peek_level-1 [  @EXPORT  ]';
        '16:34 preambles__export_preamble=>• τ@EXPORT symbols__production_symbol τas θid';
        '16:35 preambles__export_preamble=>• τ@EXPORT symbols__imported_production_symbol τas θid';
        '16:36 preambles__export_preamble=>• τ@EXPORT symbols__production_symbol τAS θid';
        '16:37 preambles__export_preamble=>• τ@EXPORT symbols__imported_production_symbol τAS θid';
        if (state.lexer._type == 21) {
            'Assert Consume [  @EXPORT  ]';
            consume(state);
            'offset 1 peek_level0 [  9  ]';
            '16:34 preambles__export_preamble=>τ@EXPORT • symbols__production_symbol τas θid';
            '16:35 preambles__export_preamble=>τ@EXPORT • symbols__imported_production_symbol τas θid';
            '16:36 preambles__export_preamble=>τ@EXPORT • symbols__production_symbol τAS θid';
            '16:37 preambles__export_preamble=>τ@EXPORT • symbols__imported_production_symbol τAS θid';
            scan(state.lexer, 8, 4);
            if (state.lexer._type == 13) {
                'Asserts [  9  ]';
                var fk1 = state.fork(db);;
                fk1.push_fn(branch_f5105dfaad6e7c19, 16);
                state.push_fn(branch_c72859839843f4ac, 16);
                return 0;
            }
        };
        return - 1;
    }

    function hc_symbols__imported_production_symbol(state, db, prod) {
        scan(state.lexer, 8, 4);
        'offset 0 peek_level-1 [  9  ]';
        '17:38 symbols__imported_production_symbol=>• tk:symbols__identifier_syms τ:: tk:symbols__identifier_syms';
        if (state.lexer._type == 13) {
            'Assert Consume [  9  ]';
            consume(state);
            '"--LEAF--"';
            '17:38 symbols__imported_production_symbol=>tk:symbols__identifier_syms • τ:: tk:symbols__identifier_syms';
            scan(state.lexer, 64, 4);
            if ((state.lexer._type == 22)) {
                consume(state);
                scan(state.lexer, 8, 4);
                if ((state.lexer._type == 13)) {
                    consume(state);
                    add_reduce(state, 3, 13);
                    return 17;
                }
            }
        };
        return - 1;
    }

    function hc_symbols__production_symbol(state, db, prod) {
        scan(state.lexer, 8, 4);
        'offset 0 peek_level-1 [  9  ]';
        '18:39 symbols__production_symbol=>• tk:symbols__identifier_syms';
        if (state.lexer._type == 13) {
            'Assert Consume [  9  ]';
            consume(state);
            '"--LEAF--"';
            '18:39 symbols__production_symbol=>tk:symbols__identifier_syms •';
            scan(state.lexer, 4, 4);
            add_reduce(state, 1, 14);
            return 18;
        };
        return - 1;
    }

    function hc_comments__comment(state, db, prod) {
        '"--LEAF--"';
        '19:40 comments__comment=>• comments__cm';
        state.push_fn(set_production /*19*/, 19);
        return hc_comments__cm(state, db, 0);
    }

    function hc_comments__cm(state, db, prod) {
        scan(state.lexer, 65, 4);
        'offset 0 peek_level-1 [  #  ]';
        '20:41 comments__cm=>• τ# comments__cm_list_92 comments__comment_delimiter';
        if (state.lexer._type == 23) {
            'Assert Consume [  #  ]';
            consume(state);
            '"--LEAF--"';
            '20:41 comments__cm=>τ# • comments__cm_list_92 comments__comment_delimiter';
            scan(state.lexer, 14, 15);
            if ((state.lexer._type == 2 || state.lexer._type == 3 || state.lexer._type == 5 || state.lexer._type == 8)) {
                state.push_fn(branch_e354b2d77ad7a406, 20);
                return hc_comments__cm_list_92(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_comments__comment_primitive(state, db, prod) {
        scan(state.lexer, 14, 15);
        'offset 0 peek_level-1 [  sym id num sp  ]';
        '21:42 comments__comment_primitive=>• θsym';
        '21:43 comments__comment_primitive=>• θid';
        '21:44 comments__comment_primitive=>• θnum';
        '21:45 comments__comment_primitive=>• θsp';
        if (state.lexer._type == 2) {
            'Asserts [  sym  ]';
            state.push_fn(set_production /*21*/, 21);
            '"--LEAF--"';
            '21:42 comments__comment_primitive=>• θsym';
            consume(state);
            return 0;
        } else if (state.lexer._type == 3) {
            'Asserts [  id  ]';
            state.push_fn(set_production /*21*/, 21);
            '"--LEAF--"';
            '21:43 comments__comment_primitive=>• θid';
            consume(state);
            return 0;
        } else if (state.lexer._type == 5) {
            'Asserts [  num  ]';
            state.push_fn(set_production /*21*/, 21);
            '"--LEAF--"';
            '21:44 comments__comment_primitive=>• θnum';
            consume(state);
            return 0;
        } else if (state.lexer._type == 8) {
            'Asserts [  sp  ]';
            state.push_fn(set_production /*21*/, 21);
            '"--LEAF--"';
            '21:45 comments__comment_primitive=>• θsp';
            consume(state);
            return 0;
        };
        return - 1;
    }

    function hc_comments__comment_delimiter(state, db, prod) {
        scan(state.lexer, 4, 34);
        'offset 0 peek_level-1 [  nl  ]';
        '22:46 comments__comment_delimiter=>• θnl';
        if (state.lexer._type == 7) {
            'Assert Consume [  nl  ]';
            consume(state);
            '"--LEAF--"';
            '22:46 comments__comment_delimiter=>θnl •';
            scan(state.lexer, 4, 4);
            return 22;
        };
        return - 1;
    }

    function hc_productions__productions(state, db, prod) {
        scan(state.lexer, 66, 4);
        'offset 0 peek_level0 [  <> +> f: <[  ]';
        '23:47 productions__productions=>• productions__production';
        '23:48 productions__productions=>• functions__referenced_function';
        '23:49 productions__productions=>• state_ir__grammar_injection';
        if (state.lexer._type == 24 || state.lexer._type == 26) {
            'Asserts [  <> +>  ]';
            state.push_fn(hc_productions__productions_goto /*hc_productions__productions_goto( state, db, 23 )*/, 23);
            '"--LEAF--"';
            '23:47 productions__productions=>• productions__production';
            state.push_fn(branch_dcee46cfb3f5fb06, 23);
            return hc_productions__production(state, db, 0);
        } else if (state.lexer._type == 53) {
            'Asserts [  f:  ]';
            state.push_fn(hc_productions__productions_goto /*hc_productions__productions_goto( state, db, 23 )*/, 23);
            '"--LEAF--"';
            '23:48 productions__productions=>• functions__referenced_function';
            state.push_fn(branch_52a170401d149850, 23);
            return hc_functions__referenced_function(state, db, 0);
        } else {
            state.push_fn(hc_productions__productions_goto /*hc_productions__productions_goto( state, db, 23 )*/, 23);
            '"--LEAF--"';
            '23:49 productions__productions=>• state_ir__grammar_injection';
            state.push_fn(branch_53c7b8a1453ec235, 23);
            return hc_state_ir__grammar_injection(state, db, 0);
        };
        return - 1;
    }

    function hc_productions__productions_goto(state, db, prod) {
        while (true) {
            switch (prod) {
                case 23:
                    {
                        'offset 1 peek_level0 [  <> +> f: <[ # END_OF_PRODUCTION END_OF_FILE  ]';
                        '23:50 productions__productions=>productions__productions • productions__production';
                        '23:51 productions__productions=>productions__productions • functions__referenced_function';
                        '23:52 productions__productions=>productions__productions • state_ir__grammar_injection';
                        '23:53 productions__productions=>productions__productions • comments__comment';
                        '1:1 head=>preambles__preamble productions__productions •';
                        '1:2 head=>productions__productions •';
                        scan(state.lexer, 67, 4);
                        if (state.lexer._type == 24 || state.lexer._type == 26) {
                            'Asserts [  <> +>  ]';
                            state.push_fn(hc_productions__productions_goto /*hc_productions__productions_goto( state, db, 23 )*/, 23);
                            '"--LEAF--"';
                            '23:50 productions__productions=>productions__productions • productions__production';
                            scan(state.lexer, 68, 4);
                            if ((state.lexer._type == 24 || state.lexer._type == 26)) {
                                state.push_fn(branch_1eb5d19e86842d0e, 23);
                                return hc_productions__production(state, db, 0);
                            };
                            return - 1;
                        } else if (state.lexer._type == 53) {
                            'Asserts [  f:  ]';
                            state.push_fn(hc_productions__productions_goto /*hc_productions__productions_goto( state, db, 23 )*/, 23);
                            '"--LEAF--"';
                            '23:51 productions__productions=>productions__productions • functions__referenced_function';
                            scan(state.lexer, 69, 4);
                            if ((state.lexer._type == 53)) {
                                state.push_fn(branch_777f63e027dfc93e, 23);
                                return hc_functions__referenced_function(state, db, 0);
                            };
                            return - 1;
                        } else if (state.lexer._type == 54) {
                            'Asserts [  <[  ]';
                            state.push_fn(hc_productions__productions_goto /*hc_productions__productions_goto( state, db, 23 )*/, 23);
                            '"--LEAF--"';
                            '23:52 productions__productions=>productions__productions • state_ir__grammar_injection';
                            scan(state.lexer, 70, 4);
                            if ((state.lexer._type == 54)) {
                                state.push_fn(branch_ad5c187ba038713b, 23);
                                return hc_state_ir__grammar_injection(state, db, 0);
                            };
                            return - 1;
                        } else if (state.lexer._type == 23) {
                            'Asserts [  #  ]';
                            state.push_fn(hc_productions__productions_goto /*hc_productions__productions_goto( state, db, 23 )*/, 23);
                            '"--LEAF--"';
                            '23:53 productions__productions=>productions__productions • comments__comment';
                            scan(state.lexer, 65, 4);
                            if ((state.lexer._type == 23)) {
                                state.push_fn(branch_dd0d4861991a0119, 23);
                                return hc_comments__comment(state, db, 0);
                            };
                            return - 1;
                        } else {
                            '"--LEAF--"';
                            '"--leafy--"';
                            return 23;
                        }
                    }
                    break;
                default:
                    break;
            };
            break;
        };
        return (prod == 23) ? prod : - 1;
    }

    function hc_productions__production(state, db, prod) {
        scan(state.lexer, 68, 4);
        'offset 0 peek_level0 [  <> +>  ]';
        '24:54 productions__production=>• τ<> τ* productions__production_group_112_0_ productions__production_start_symbol production_bodies__production_bodies';
        '24:56 productions__production=>• τ<> productions__production_group_112_0_ productions__production_start_symbol production_bodies__production_bodies';
        '24:57 productions__production=>• τ<> τ* productions__production_group_112_0_ productions__production_start_symbol';
        '24:58 productions__production=>• τ<> productions__production_group_112_0_ productions__production_start_symbol';
        '24:55 productions__production=>• τ+> productions__production_group_117_0_ productions__production_start_symbol production_bodies__production_bodies';
        if (state.lexer._type == 24) {
            'Asserts [  <>  ]';
            consume(state);
            '"⤋⤋⤋  post-peek-consume ⤋⤋⤋"';
            'offset 2 peek_level-1 [  <>  ]';
            '24:54 productions__production=>• τ<> τ* productions__production_group_112_0_ productions__production_start_symbol production_bodies__production_bodies';
            '24:56 productions__production=>• τ<> productions__production_group_112_0_ productions__production_start_symbol production_bodies__production_bodies';
            '24:57 productions__production=>• τ<> τ* productions__production_group_112_0_ productions__production_start_symbol';
            '24:58 productions__production=>• τ<> productions__production_group_112_0_ productions__production_start_symbol';
            'offset 3 peek_level0 [  * 9  ]';
            '24:54 productions__production=>τ<> • τ* productions__production_group_112_0_ productions__production_start_symbol production_bodies__production_bodies';
            '24:57 productions__production=>τ<> • τ* productions__production_group_112_0_ productions__production_start_symbol';
            '24:56 productions__production=>τ<> • productions__production_group_112_0_ productions__production_start_symbol production_bodies__production_bodies';
            '24:58 productions__production=>τ<> • productions__production_group_112_0_ productions__production_start_symbol';
            scan(state.lexer, 71, 4);
            if (state.lexer._type == 25) {
                'Asserts [  *  ]';
                consume(state);
                '"⤋⤋⤋  post-peek-consume ⤋⤋⤋"';
                'offset 5 peek_level-1 [  *  ]';
                '24:54 productions__production=>τ<> • τ* productions__production_group_112_0_ productions__production_start_symbol production_bodies__production_bodies';
                '24:57 productions__production=>τ<> • τ* productions__production_group_112_0_ productions__production_start_symbol';
                'offset 6 peek_level-1 [  63  ]';
                '24:54 productions__production=>τ<> τ* • productions__production_group_112_0_ productions__production_start_symbol production_bodies__production_bodies';
                '24:57 productions__production=>τ<> τ* • productions__production_group_112_0_ productions__production_start_symbol';
                scan(state.lexer, 8, 4);
                state.push_fn(branch_f9e1a29fb634c790, 0);
                return hc_productions__production_group_112_0_(state, db, 0);
            } else {
                'offset 5 peek_level-1 [  63  ]';
                '24:56 productions__production=>τ<> • productions__production_group_112_0_ productions__production_start_symbol production_bodies__production_bodies';
                '24:58 productions__production=>τ<> • productions__production_group_112_0_ productions__production_start_symbol';
                scan(state.lexer, 8, 4);
                state.push_fn(branch_7fb47fd068703d17, 0);
                return hc_productions__production_group_112_0_(state, db, 0);
            }
        } else if (state.lexer._type == 26) {
            'Asserts [  +>  ]';
            state.push_fn(set_production /*24*/, 24);
            '"--LEAF--"';
            '24:55 productions__production=>• τ+> productions__production_group_117_0_ productions__production_start_symbol production_bodies__production_bodies';
            consume(state);
            state.push_fn(branch_36b3ff7f91854d41, 24);
            return hc_productions__production_group_117_0_(state, db, 0);
        };
        return - 1;
    }

    function hc_symbols__production_id(state, db, prod) {
        scan(state.lexer, 8, 4);
        'offset 0 peek_level-1 [  9  ]';
        '25:59 symbols__production_id=>• tk:symbols__identifier_syms';
        if (state.lexer._type == 13) {
            'Assert Consume [  9  ]';
            consume(state);
            '"--LEAF--"';
            '25:59 symbols__production_id=>tk:symbols__identifier_syms •';
            scan(state.lexer, 4, 4);
            return 25;
        };
        return - 1;
    }

    function hc_productions__production_start_symbol(state, db, prod) {
        scan(state.lexer, 29, 4);
        'offset 0 peek_level-1 [  >  ]';
        '26:60 productions__production_start_symbol=>• τ>';
        if (state.lexer._type == 27) {
            'Assert Consume [  >  ]';
            consume(state);
            '"--LEAF--"';
            '26:60 productions__production_start_symbol=>τ> •';
            scan(state.lexer, 4, 4);
            return 26;
        };
        return - 1;
    }

    function hc_production_bodies__production_bodies(state, db, prod) {
        scan(state.lexer, 72, 4);
        'offset 0 peek_level0 [  # ( [ $empty <= ?= sym (EXC (ERR (IGN (RST (RED g: 9 tk: t: f:s $eof  ]';
        '27:61 production_bodies__production_bodies=>• comments__comment';
        '27:63 production_bodies__production_bodies=>• production_bodies__production_body';
        if (state.lexer._type == 23) {
            'Asserts [  #  ]';
            state.push_fn(hc_production_bodies__production_bodies_goto /*hc_production_bodies__production_bodies_goto( state, db, 27 )*/, 27);
            '"--LEAF--"';
            '27:61 production_bodies__production_bodies=>• comments__comment';
            state.push_fn(branch_232f37efe656dae6, 27);
            return hc_comments__comment(state, db, 0);
        } else {
            state.push_fn(hc_production_bodies__production_bodies_goto /*hc_production_bodies__production_bodies_goto( state, db, 27 )*/, 27);
            '"--LEAF--"';
            '27:63 production_bodies__production_bodies=>• production_bodies__production_body';
            state.push_fn(branch_232f37efe656dae6, 27);
            return hc_production_bodies__production_body(state, db, 0);
        };
        return - 1;
    }

    function hc_production_bodies__production_bodies_goto(state, db, prod) {
        while (true) {
            switch (prod) {
                case 27:
                    {
                        'offset 1 peek_level0 [  | ) <> +> f: <[ # END_OF_PRODUCTION END_OF_FILE  ]';
                        '27:62 production_bodies__production_bodies=>production_bodies__production_bodies • τ| comments__comment';
                        '27:64 production_bodies__production_bodies=>production_bodies__production_bodies • τ| production_bodies__production_body';
                        '24:54 productions__production=>τ<> τ* productions__production_group_112_0_ productions__production_start_symbol production_bodies__production_bodies •';
                        '24:55 productions__production=>τ+> productions__production_group_117_0_ productions__production_start_symbol production_bodies__production_bodies •';
                        '24:56 productions__production=>τ<> productions__production_group_112_0_ productions__production_start_symbol production_bodies__production_bodies •';
                        '31:85 symbols__symbol=>τ( production_bodies__production_bodies • τ)';
                        scan(state.lexer, 73, 4);
                        if (state.lexer._type == 28) {
                            'Asserts [  |  ]';
                            consume(state);
                            '"⤋⤋⤋  post-peek-consume ⤋⤋⤋"';
                            'offset 3 peek_level-1 [  |  ]';
                            '27:62 production_bodies__production_bodies=>production_bodies__production_bodies • τ| comments__comment';
                            '27:64 production_bodies__production_bodies=>production_bodies__production_bodies • τ| production_bodies__production_body';
                            'offset 4 peek_level0 [  # ( [ $empty <= ?= sym (EXC (ERR (IGN (RST (RED g: 9 tk: t: f:s $eof  ]';
                            '27:62 production_bodies__production_bodies=>production_bodies__production_bodies τ| • comments__comment';
                            '27:64 production_bodies__production_bodies=>production_bodies__production_bodies τ| • production_bodies__production_body';
                            scan(state.lexer, 72, 4);
                            if (state.lexer._type == 23) {
                                'Asserts [  #  ]';
                                state.push_fn(hc_production_bodies__production_bodies_goto /*hc_production_bodies__production_bodies_goto( state, db, 27 )*/, 27);
                                '"--LEAF--"';
                                '27:62 production_bodies__production_bodies=>production_bodies__production_bodies τ| • comments__comment';
                                state.push_fn(branch_70d9326e6c9dc217, 27);
                                return hc_comments__comment(state, db, 0);
                            } else {
                                state.push_fn(hc_production_bodies__production_bodies_goto /*hc_production_bodies__production_bodies_goto( state, db, 27 )*/, 27);
                                '"--LEAF--"';
                                '27:64 production_bodies__production_bodies=>production_bodies__production_bodies τ| • production_bodies__production_body';
                                state.push_fn(branch_70d9326e6c9dc217, 27);
                                return hc_production_bodies__production_body(state, db, 0);
                            }
                        } else if (isTokenActive(state.lexer._type, 74)) {
                            'Assert End [  <> +> f: <[ # END_OF_PRODUCTION END_OF_FILE  ]';
                            '"--LEAF--"';
                            '"--leafy--"';
                            return 27;
                        }
                    }
                    break;
                default:
                    break;
            };
            break;
        };
        return (prod == 27) ? prod : - 1;
    }

    function hc_production_bodies__production_body(state, db, prod) {
        scan(state.lexer, 75, 4);
        'offset 0 peek_level0 [  ( [ $empty <= ?= sym (EXC (ERR (IGN (RST (RED g: 9 tk: t: f:s $eof  ]';
        '28:65 production_bodies__production_body=>• τ( τFORK τ) production_bodies__entries functions__reduce_function';
        '28:66 production_bodies__production_body=>• production_bodies__entries functions__reduce_function';
        '28:67 production_bodies__production_body=>• τ( τFORK τ) production_bodies__entries';
        '28:68 production_bodies__production_body=>• production_bodies__entries';
        if (state.lexer._type == 29) {
            'Asserts [  (  ]';
            'offset 0 peek_level1 [  FORK ( # [ $empty <= ?= sym (EXC (ERR (IGN (RST (RED g: 9 tk: t: f:s $eof  ]';
            '28:65 production_bodies__production_body=>• τ( τFORK τ) production_bodies__entries functions__reduce_function';
            '28:67 production_bodies__production_body=>• τ( τFORK τ) production_bodies__entries';
            '28:66 production_bodies__production_body=>• production_bodies__entries functions__reduce_function';
            '28:68 production_bodies__production_body=>• production_bodies__entries';
            var pk = state.lexer.copy_in_place();;
            pk.next();
            scan(pk, 76, 4);
            if (pk._type == 30) {
                'Asserts [  FORK  ]';
                consume(state);
                '"⤋⤋⤋  post-peek-consume ⤋⤋⤋"';
                'offset 2 peek_level-1 [  (  ]';
                '28:65 production_bodies__production_body=>• τ( τFORK τ) production_bodies__entries functions__reduce_function';
                '28:67 production_bodies__production_body=>• τ( τFORK τ) production_bodies__entries';
                'offset 3 peek_level-1 [  FORK  ]';
                '28:65 production_bodies__production_body=>τ( • τFORK τ) production_bodies__entries functions__reduce_function';
                '28:67 production_bodies__production_body=>τ( • τFORK τ) production_bodies__entries';
                scan(state.lexer, 77, 4);
                if (state.lexer._type == 30) {
                    'Assert Consume [  FORK  ]';
                    consume(state);
                    'offset 4 peek_level-1 [  )  ]';
                    '28:65 production_bodies__production_body=>τ( τFORK • τ) production_bodies__entries functions__reduce_function';
                    '28:67 production_bodies__production_body=>τ( τFORK • τ) production_bodies__entries';
                    scan(state.lexer, 17, 4);
                    if (state.lexer._type == 31) {
                        'Assert Consume [  )  ]';
                        consume(state);
                        'offset 5 peek_level-1 [  29  ]';
                        '28:65 production_bodies__production_body=>τ( τFORK τ) • production_bodies__entries functions__reduce_function';
                        '28:67 production_bodies__production_body=>τ( τFORK τ) • production_bodies__entries';
                        scan(state.lexer, 75, 4);
                        state.push_fn(branch_bc38f2fd5802e1c5, 0);
                        return hc_production_bodies__entries(state, db, 0);
                    }
                }
            } else {
                'offset 2 peek_level-1 [  29  ]';
                '28:66 production_bodies__production_body=>• production_bodies__entries functions__reduce_function';
                '28:68 production_bodies__production_body=>• production_bodies__entries';
                scan(state.lexer, 75, 4);
                state.push_fn(branch_90a9cc6da64ccc5d, 0);
                return hc_production_bodies__entries(state, db, 0);
            }
        } else {
            'offset 2 peek_level-1 [  29  ]';
            '28:66 production_bodies__production_body=>• production_bodies__entries functions__reduce_function';
            '28:68 production_bodies__production_body=>• production_bodies__entries';
            scan(state.lexer, 75, 4);
            state.push_fn(branch_90a9cc6da64ccc5d, 0);
            return hc_production_bodies__entries(state, db, 0);
        };
        return - 1;
    }

    function hc_production_bodies__entries(state, db, prod) {
        scan(state.lexer, 75, 4);
        'offset 0 peek_level0 [  $empty [ <= ?= ( sym (EXC (ERR (IGN (RST (RED g: 9 tk: t: f:s $eof  ]';
        '29:70 production_bodies__entries=>• production_bodies__body_entry';
        '29:71 production_bodies__entries=>• symbols__empty_symbol';
        if (state.lexer._type == 45) {
            'Asserts [  $empty  ]';
            state.push_fn(hc_production_bodies__entries_goto /*hc_production_bodies__entries_goto( state, db, 29 )*/, 29);
            '"--LEAF--"';
            '29:71 production_bodies__entries=>• symbols__empty_symbol';
            state.push_fn(branch_dff7f7d3de3cf6ed, 29);
            return hc_symbols__empty_symbol(state, db, 0);
        } else {
            state.push_fn(hc_production_bodies__entries_goto /*hc_production_bodies__entries_goto( state, db, 29 )*/, 29);
            '"--LEAF--"';
            '29:70 production_bodies__entries=>• production_bodies__body_entry';
            state.push_fn(branch_4ec1eeda7a142271, 29);
            return hc_production_bodies__body_entry(state, db, 0);
        };
        return - 1;
    }

    function hc_production_bodies__entries_goto(state, db, prod) {
        while (true) {
            switch (prod) {
                case 29:
                    {
                        'offset 1 peek_level0 [  f: | ) <> +> <[ # END_OF_PRODUCTION END_OF_FILE [ <= ?= ( sym (EXC (ERR (IGN (RST (RED g: 9 tk: t: f:s $eof  ]';
                        '29:69 production_bodies__entries=>production_bodies__entries • production_bodies__body_entry';
                        '28:65 production_bodies__production_body=>τ( τFORK τ) production_bodies__entries • functions__reduce_function';
                        '28:66 production_bodies__production_body=>production_bodies__entries • functions__reduce_function';
                        '28:67 production_bodies__production_body=>τ( τFORK τ) production_bodies__entries •';
                        '28:68 production_bodies__production_body=>production_bodies__entries •';
                        scan(state.lexer, 78, 4);
                        if (isTokenActive(state.lexer._type, 79)) {
                            'Asserts [  f: | ) <> +> <[ # END_OF_PRODUCTION END_OF_FILE  ]';
                            '"--LEAF--"';
                            '"--leafy--"';
                            return 29;
                        } else if (isTokenActive(state.lexer._type, 80)) {
                            'Asserts [  [ <= ?= ( sym (EXC (ERR (IGN (RST (RED g: 9 tk: t: f:s $eof  ]';
                            state.push_fn(hc_production_bodies__entries_goto /*hc_production_bodies__entries_goto( state, db, 29 )*/, 29);
                            '"--LEAF--"';
                            '29:69 production_bodies__entries=>production_bodies__entries • production_bodies__body_entry';
                            scan(state.lexer, 81, 4);
                            if ((isTokenActive(state.lexer._type, 80))) {
                                state.push_fn(branch_2d0c7425918eb69d, 29);
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
        return (prod == 29) ? prod : - 1;
    }

    function hc_production_bodies__body_entry(state, db, prod) {
        scan(state.lexer, 81, 4);
        'offset 0 peek_level0 [  <= ?= ( sym g: 9 tk: t: f:s $eof (EXC (ERR (IGN (RST (RED [  ]';
        '30:72 production_bodies__body_entry=>• symbols__symbol';
        '30:73 production_bodies__body_entry=>• symbols__meta_symbol';
        '30:74 production_bodies__body_entry=>• τ[ production_bodies__body_entry_list_149 τ]';
        if (isTokenActive(state.lexer._type, 82)) {
            'Asserts [  <= ?= ( sym g: 9 tk: t: f:s $eof  ]';
            state.push_fn(set_production /*30*/, 30);
            '"--LEAF--"';
            '30:72 production_bodies__body_entry=>• symbols__symbol';
            state.push_fn(branch_232f37efe656dae6, 30);
            return hc_symbols__symbol(state, db, 0);
        } else if (isTokenActive(state.lexer._type, 83)) {
            'Asserts [  (EXC (ERR (IGN (RST (RED  ]';
            state.push_fn(set_production /*30*/, 30);
            '"--LEAF--"';
            '30:73 production_bodies__body_entry=>• symbols__meta_symbol';
            state.push_fn(branch_232f37efe656dae6, 30);
            return hc_symbols__meta_symbol(state, db, 0);
        } else if (state.lexer._type == 32) {
            'Asserts [  [  ]';
            state.push_fn(set_production /*30*/, 30);
            '"--LEAF--"';
            '30:74 production_bodies__body_entry=>• τ[ production_bodies__body_entry_list_149 τ]';
            consume(state);
            state.push_fn(branch_14932521bfb2c747, 30);
            return hc_production_bodies__body_entry_list_149(state, db, 0);
        };
        return - 1;
    }

    function hc_symbols__symbol(state, db, prod) {
        scan(state.lexer, 84, 4);
        'offset 0 peek_level-1 [  <= ?= g: tk: t: f:s $eof ( 9 sym  ]';
        '31:76 symbols__symbol=>• τ<= symbols__symbol';
        '31:77 symbols__symbol=>• τ?= symbols__symbol';
        '31:78 symbols__symbol=>• symbols__generated_symbol';
        '31:79 symbols__symbol=>• symbols__production_symbol';
        '31:81 symbols__symbol=>• symbols__imported_production_symbol';
        '31:80 symbols__symbol=>• symbols__production_token_symbol';
        '31:82 symbols__symbol=>• symbols__literal_symbol';
        '31:83 symbols__symbol=>• symbols__escaped_symbol';
        '31:84 symbols__symbol=>• symbols__EOF_symbol';
        '31:85 symbols__symbol=>• τ( production_bodies__production_bodies τ)';
        '31:87 symbols__symbol=>• θsym';
        if (state.lexer._type == 35) {
            'Asserts [  <=  ]';
            state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 31 )*/, 31);
            '"--LEAF--"';
            '31:76 symbols__symbol=>• τ<= symbols__symbol';
            consume(state);
            state.push_fn(branch_f6ed614f7f77349f, 31);
            return hc_symbols__symbol(state, db, 0);
        } else if (state.lexer._type == 36) {
            'Asserts [  ?=  ]';
            state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 31 )*/, 31);
            '"--LEAF--"';
            '31:77 symbols__symbol=>• τ?= symbols__symbol';
            consume(state);
            state.push_fn(branch_147abbca2905b552, 31);
            return hc_symbols__symbol(state, db, 0);
        } else if (state.lexer._type == 12) {
            'Asserts [  g:  ]';
            state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 31 )*/, 31);
            '"--LEAF--"';
            '31:78 symbols__symbol=>• symbols__generated_symbol';
            state.push_fn(set_production /*0*/, 31);
            return hc_symbols__generated_symbol(state, db, 0);
        } else if (state.lexer._type == 17) {
            'Asserts [  tk:  ]';
            state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 31 )*/, 31);
            '"--LEAF--"';
            '31:80 symbols__symbol=>• symbols__production_token_symbol';
            state.push_fn(set_production /*0*/, 31);
            return hc_symbols__production_token_symbol(state, db, 0);
        } else if (state.lexer._type == 15) {
            'Asserts [  t:  ]';
            state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 31 )*/, 31);
            '"--LEAF--"';
            '31:82 symbols__symbol=>• symbols__literal_symbol';
            state.push_fn(set_production /*0*/, 31);
            return hc_symbols__literal_symbol(state, db, 0);
        } else if (state.lexer._type == 16) {
            'Asserts [  f:s  ]';
            state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 31 )*/, 31);
            '"--LEAF--"';
            '31:83 symbols__symbol=>• symbols__escaped_symbol';
            state.push_fn(set_production /*0*/, 31);
            return hc_symbols__escaped_symbol(state, db, 0);
        } else if (state.lexer._type == 39) {
            'Asserts [  $eof  ]';
            state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 31 )*/, 31);
            '"--LEAF--"';
            '31:84 symbols__symbol=>• symbols__EOF_symbol';
            state.push_fn(set_production /*0*/, 31);
            return hc_symbols__EOF_symbol(state, db, 0);
        } else if (state.lexer._type == 29) {
            'Asserts [  (  ]';
            state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 31 )*/, 31);
            '"--LEAF--"';
            '31:85 symbols__symbol=>• τ( production_bodies__production_bodies τ)';
            consume(state);
            state.push_fn(branch_fbe4e92e75cab6e4, 31);
            return hc_production_bodies__production_bodies(state, db, 0);
        } else if (state.lexer._type == 13) {
            'Asserts [  9  ]';
            consume(state);
            '"⤋⤋⤋  post-peek-consume ⤋⤋⤋"';
            'offset 2 peek_level-1 [  9  ]';
            '18:39 symbols__production_symbol=>• tk:symbols__identifier_syms';
            '17:38 symbols__imported_production_symbol=>• tk:symbols__identifier_syms τ:: tk:symbols__identifier_syms';
            'offset 3 peek_level0 [  :: ] AS as num then ) on symbols: > END_OF_PRODUCTION ? (* (+ END_OF_FILE f:s tk: 9 <= ?= ( sym $eof (EXC (ERR (IGN (RST (RED [ t: f: | g: <> +> <[ #  ]';
            '18:39 symbols__production_symbol=>tk:symbols__identifier_syms •';
            '17:38 symbols__imported_production_symbol=>tk:symbols__identifier_syms • τ:: tk:symbols__identifier_syms';
            scan(state.lexer, 85, 4);
            if (state.lexer._type == 22) {
                'Asserts [  ::  ]';
                state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 31 )*/, 31);
                '"--LEAF--"';
                '17:38 symbols__imported_production_symbol=>tk:symbols__identifier_syms • τ:: tk:symbols__identifier_syms';
                consume(state);
                scan(state.lexer, 8, 4);
                if ((state.lexer._type == 13)) {
                    consume(state);
                    add_reduce(state, 3, 13);
                    return 0;
                };
                return - 1;
            } else {
                '"--LEAF--"';
                '18:39 symbols__production_symbol=>tk:symbols__identifier_syms •';
                add_reduce(state, 1, 14);
                return hc_symbols__symbol_goto(state, db, 31);
            }
        } else if (state.lexer._type == 2) {
            'Asserts [  sym  ]';
            state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 31 )*/, 31);
            '"--LEAF--"';
            '31:87 symbols__symbol=>• θsym';
            consume(state);
            add_reduce(state, 1, 41);
            return 0;
        };
        return - 1;
    }

    function hc_symbols__symbol_goto(state, db, prod) {
        while (true) {
            switch (prod) {
                case 31:
                    {
                        'offset 1 peek_level-1 [  ? ] [ <= ?= ( sym (EXC (ERR (IGN (RST (RED g: tk: t: f:s $eof f: | # <[ <> +> END_OF_PRODUCTION END_OF_FILE ) 9 (* (+  ]';
                        '31:75 symbols__symbol=>symbols__symbol • τ?';
                        '31:86 symbols__symbol=>symbols__symbol • τ(* symbols__terminal_symbol τ)';
                        '31:89 symbols__symbol=>symbols__symbol • τ(* τ)';
                        '31:88 symbols__symbol=>symbols__symbol • τ(+ symbols__terminal_symbol τ)';
                        '31:90 symbols__symbol=>symbols__symbol • τ(+ τ)';
                        '30:72 production_bodies__body_entry=>symbols__symbol •';
                        '34:99 symbols__meta_symbol=>τ(RED symbols__symbol • τ)';
                        scan(state.lexer, 86, 4);
                        if (state.lexer._type == 34) {
                            'Asserts [  ?  ]';
                            state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 31 )*/, 31);
                            '"--LEAF--"';
                            '31:75 symbols__symbol=>symbols__symbol • τ?';
                            scan(state.lexer, 87, 4);
                            consume(state);
                            add_reduce(state, 2, 36);
                            return 0;
                        } else if (state.lexer._type == 37) {
                            'Asserts [  (*  ]';
                            consume(state);
                            '"⤋⤋⤋  post-peek-consume ⤋⤋⤋"';
                            'offset 3 peek_level-1 [  (*  ]';
                            '31:86 symbols__symbol=>symbols__symbol • τ(* symbols__terminal_symbol τ)';
                            '31:89 symbols__symbol=>symbols__symbol • τ(* τ)';
                            'offset 4 peek_level0 [  g: t: f:s )  ]';
                            '31:86 symbols__symbol=>symbols__symbol τ(* • symbols__terminal_symbol τ)';
                            '31:89 symbols__symbol=>symbols__symbol τ(* • τ)';
                            scan(state.lexer, 88, 4);
                            if (state.lexer._type == 12 || state.lexer._type == 15 || state.lexer._type == 16) {
                                'Asserts [  g: t: f:s  ]';
                                state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 31 )*/, 31);
                                '"--LEAF--"';
                                '31:86 symbols__symbol=>symbols__symbol τ(* • symbols__terminal_symbol τ)';
                                state.push_fn(branch_2ffc50bf1e9012c6, 31);
                                return hc_symbols__terminal_symbol(state, db, 0);
                            } else if (state.lexer._type == 31) {
                                'Asserts [  )  ]';
                                state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 31 )*/, 31);
                                '"--LEAF--"';
                                '31:89 symbols__symbol=>symbols__symbol τ(* • τ)';
                                consume(state);
                                add_reduce(state, 3, 42);
                                return 0;
                            }
                        } else if (state.lexer._type == 38) {
                            'Asserts [  (+  ]';
                            consume(state);
                            '"⤋⤋⤋  post-peek-consume ⤋⤋⤋"';
                            'offset 3 peek_level-1 [  (+  ]';
                            '31:88 symbols__symbol=>symbols__symbol • τ(+ symbols__terminal_symbol τ)';
                            '31:90 symbols__symbol=>symbols__symbol • τ(+ τ)';
                            'offset 4 peek_level0 [  g: t: f:s )  ]';
                            '31:88 symbols__symbol=>symbols__symbol τ(+ • symbols__terminal_symbol τ)';
                            '31:90 symbols__symbol=>symbols__symbol τ(+ • τ)';
                            scan(state.lexer, 88, 4);
                            if (state.lexer._type == 12 || state.lexer._type == 15 || state.lexer._type == 16) {
                                'Asserts [  g: t: f:s  ]';
                                state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 31 )*/, 31);
                                '"--LEAF--"';
                                '31:88 symbols__symbol=>symbols__symbol τ(+ • symbols__terminal_symbol τ)';
                                state.push_fn(branch_2ffc50bf1e9012c6, 31);
                                return hc_symbols__terminal_symbol(state, db, 0);
                            } else if (state.lexer._type == 31) {
                                'Asserts [  )  ]';
                                state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 31 )*/, 31);
                                '"--LEAF--"';
                                '31:90 symbols__symbol=>symbols__symbol τ(+ • τ)';
                                consume(state);
                                add_reduce(state, 3, 42);
                                return 0;
                            }
                        } else if (state.lexer._type == 31) {
                            'Asserts [  )  ]';
                            '"--LEAF--"';
                            '"--leafy--"';
                            return 31;
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

    function hc_symbols__EOF_symbol(state, db, prod) {
        scan(state.lexer, 89, 4);
        'offset 0 peek_level-1 [  $eof  ]';
        '32:91 symbols__EOF_symbol=>• τ$eof';
        if (state.lexer._type == 39) {
            'Assert Consume [  $eof  ]';
            consume(state);
            '"--LEAF--"';
            '32:91 symbols__EOF_symbol=>τ$eof •';
            scan(state.lexer, 15, 15);
            add_reduce(state, 1, 43);
            return 32;
        };
        return - 1;
    }

    function hc_symbols__terminal_symbol(state, db, prod) {
        scan(state.lexer, 90, 4);
        'offset 0 peek_level0 [  g: t: f:s  ]';
        '33:92 symbols__terminal_symbol=>• symbols__generated_symbol';
        '33:93 symbols__terminal_symbol=>• symbols__literal_symbol';
        '33:94 symbols__terminal_symbol=>• symbols__escaped_symbol';
        if (state.lexer._type == 12) {
            'Asserts [  g:  ]';
            state.push_fn(set_production /*33*/, 33);
            '"--LEAF--"';
            '33:92 symbols__terminal_symbol=>• symbols__generated_symbol';
            state.push_fn(set_production /*0*/, 33);
            return hc_symbols__generated_symbol(state, db, 0);
        } else if (state.lexer._type == 15) {
            'Asserts [  t:  ]';
            state.push_fn(set_production /*33*/, 33);
            '"--LEAF--"';
            '33:93 symbols__terminal_symbol=>• symbols__literal_symbol';
            state.push_fn(set_production /*0*/, 33);
            return hc_symbols__literal_symbol(state, db, 0);
        } else {
            state.push_fn(set_production /*33*/, 33);
            '"--LEAF--"';
            '33:94 symbols__terminal_symbol=>• symbols__escaped_symbol';
            state.push_fn(set_production /*0*/, 33);
            return hc_symbols__escaped_symbol(state, db, 0);
        };
        return - 1;
    }

    function hc_symbols__meta_symbol(state, db, prod) {
        scan(state.lexer, 91, 4);
        'offset 0 peek_level-1 [  (EXC (ERR (IGN (RST (RED  ]';
        '34:95 symbols__meta_symbol=>• τ(EXC symbols__condition_symbol_list τ)';
        '34:96 symbols__meta_symbol=>• τ(ERR symbols__condition_symbol_list τ)';
        '34:97 symbols__meta_symbol=>• τ(IGN symbols__condition_symbol_list τ)';
        '34:98 symbols__meta_symbol=>• τ(RST symbols__condition_symbol_list τ)';
        '34:99 symbols__meta_symbol=>• τ(RED symbols__symbol τ)';
        if (state.lexer._type == 40) {
            'Asserts [  (EXC  ]';
            state.push_fn(set_production /*34*/, 34);
            '"--LEAF--"';
            '34:95 symbols__meta_symbol=>• τ(EXC symbols__condition_symbol_list τ)';
            consume(state);
            state.push_fn(branch_650f8111b7368fb9, 34);
            return hc_symbols__condition_symbol_list(state, db, 0);
        } else if (state.lexer._type == 41) {
            'Asserts [  (ERR  ]';
            state.push_fn(set_production /*34*/, 34);
            '"--LEAF--"';
            '34:96 symbols__meta_symbol=>• τ(ERR symbols__condition_symbol_list τ)';
            consume(state);
            state.push_fn(branch_5f4700f502204408, 34);
            return hc_symbols__condition_symbol_list(state, db, 0);
        } else if (state.lexer._type == 42) {
            'Asserts [  (IGN  ]';
            state.push_fn(set_production /*34*/, 34);
            '"--LEAF--"';
            '34:97 symbols__meta_symbol=>• τ(IGN symbols__condition_symbol_list τ)';
            consume(state);
            state.push_fn(branch_a556dc24f4a9db73, 34);
            return hc_symbols__condition_symbol_list(state, db, 0);
        } else if (state.lexer._type == 43) {
            'Asserts [  (RST  ]';
            state.push_fn(set_production /*34*/, 34);
            '"--LEAF--"';
            '34:98 symbols__meta_symbol=>• τ(RST symbols__condition_symbol_list τ)';
            consume(state);
            state.push_fn(branch_a3a046d24e9182ed, 34);
            return hc_symbols__condition_symbol_list(state, db, 0);
        } else if (state.lexer._type == 44) {
            'Asserts [  (RED  ]';
            state.push_fn(set_production /*34*/, 34);
            '"--LEAF--"';
            '34:99 symbols__meta_symbol=>• τ(RED symbols__symbol τ)';
            consume(state);
            state.push_fn(branch_71a788043652d3b3, 34);
            return hc_symbols__symbol(state, db, 0);
        };
        return - 1;
    }

    function hc_symbols__condition_symbol_list(state, db, prod) {
        '"--LEAF--"';
        '35:100 symbols__condition_symbol_list=>• symbols__terminal_symbol';
        state.push_fn(branch_75925eaf0d57aec7, 35);
        return hc_symbols__terminal_symbol(state, db, 0);
    }

    function hc_symbols__condition_symbol_list_goto(state, db, prod) {
        'offset 1 peek_level0 [  g: t: f:s )  ]';
        '35:101 symbols__condition_symbol_list=>symbols__condition_symbol_list • symbols__terminal_symbol';
        '34:95 symbols__meta_symbol=>τ(EXC symbols__condition_symbol_list • τ)';
        '34:96 symbols__meta_symbol=>τ(ERR symbols__condition_symbol_list • τ)';
        '34:97 symbols__meta_symbol=>τ(IGN symbols__condition_symbol_list • τ)';
        '34:98 symbols__meta_symbol=>τ(RST symbols__condition_symbol_list • τ)';
        scan(state.lexer, 88, 4);
        if (state.lexer._type == 12 || state.lexer._type == 15 || state.lexer._type == 16) {
            'Asserts [  g: t: f:s  ]';
            state.push_fn(hc_symbols__condition_symbol_list_goto /*hc_symbols__condition_symbol_list_goto( state, db, 35 )*/, 35);
            '"--LEAF--"';
            '35:101 symbols__condition_symbol_list=>symbols__condition_symbol_list • symbols__terminal_symbol';
            scan(state.lexer, 90, 4);
            if ((state.lexer._type == 12 || state.lexer._type == 15 || state.lexer._type == 16)) {
                state.push_fn(branch_28ab10e2751570b2, 35);
                return hc_symbols__terminal_symbol(state, db, 0);
            };
            return - 1;
        } else if (state.lexer._type == 31) {
            'Asserts [  )  ]';
            '"--LEAF--"';
            '"--leafy--"';
            return 35;
        };
        return (prod == 35) ? prod : - 1;
    }

    function hc_symbols__empty_symbol(state, db, prod) {
        scan(state.lexer, 92, 4);
        'offset 0 peek_level-1 [  $empty  ]';
        '36:102 symbols__empty_symbol=>• τ$empty';
        if (state.lexer._type == 45) {
            'Assert Consume [  $empty  ]';
            consume(state);
            '"--LEAF--"';
            '36:102 symbols__empty_symbol=>τ$empty •';
            scan(state.lexer, 4, 4);
            add_reduce(state, 1, 49);
            return 36;
        };
        return - 1;
    }

    function hc_functions__reduce_function(state, db, prod) {
        'offset 0 peek_level-1 [  38  ]';
        '37:103 functions__reduce_function=>• functions__js_function_start_symbol τr τ{ functions__js_data τ}';
        '37:104 functions__reduce_function=>• functions__js_function_start_symbol τr τ^ symbols__identifier';
        '37:105 functions__reduce_function=>• functions__js_function_start_symbol τr τ=> symbols__identifier';
        '37:106 functions__reduce_function=>• functions__js_function_start_symbol τreturn τ{ functions__js_data τ}';
        '37:107 functions__reduce_function=>• functions__js_function_start_symbol τreturn τ^ symbols__identifier';
        '37:108 functions__reduce_function=>• functions__js_function_start_symbol τreturn τ=> symbols__identifier';
        state.push_fn(branch_ebc85f32336ac76a, 0);
        return hc_functions__js_function_start_symbol(state, db, 0);
    }

    function hc_functions__js_function_start_symbol(state, db, prod) {
        scan(state.lexer, 69, 4);
        'offset 0 peek_level-1 [  f:  ]';
        '38:109 functions__js_function_start_symbol=>• τf:';
        if (state.lexer._type == 53) {
            'Assert Consume [  f:  ]';
            consume(state);
            '"--LEAF--"';
            '38:109 functions__js_function_start_symbol=>τf: •';
            scan(state.lexer, 4, 4);
            add_reduce(state, 1, 53);
            return 38;
        };
        return - 1;
    }

    function hc_functions__js_data(state, db, prod) {
        scan(state.lexer, 93, 15);
        'offset 0 peek_level0 [  { id num sp sym g: t: f:s $eof END_OF_FILE  ]';
        '39:110 functions__js_data=>• functions__js_primitive';
        '39:111 functions__js_data=>• functions__js_data_block';
        '39:114 functions__js_data=>• END_OF_FILE';
        if (state.lexer._type == 47) {
            'Asserts [  {  ]';
            state.push_fn(hc_functions__js_data_goto /*hc_functions__js_data_goto( state, db, 39 )*/, 39);
            '"--LEAF--"';
            '39:111 functions__js_data=>• functions__js_data_block';
            state.push_fn(set_production /*0*/, 39);
            return hc_functions__js_data_block(state, db, 0);
        } else if (isTokenActive(state.lexer._type, 94)) {
            'Asserts [  id num sp sym g: t: f:s $eof  ]';
            state.push_fn(hc_functions__js_data_goto /*hc_functions__js_data_goto( state, db, 39 )*/, 39);
            '"--LEAF--"';
            '39:110 functions__js_data=>• functions__js_primitive';
            state.push_fn(set_production /*0*/, 39);
            return hc_functions__js_primitive(state, db, 0);
        } else if (state.lexer._type == 1) {
            'Asserts [  END_OF_FILE  ]';
            state.push_fn(hc_functions__js_data_goto /*hc_functions__js_data_goto( state, db, 39 )*/, 39);
            '"--LEAF--"';
            '39:114 functions__js_data=>• END_OF_FILE';
            consume(state);
            return 0;
        };
        return - 1;
    }

    function hc_functions__js_data_goto(state, db, prod) {
        'offset 1 peek_level0 [  { } id num sp sym g: t: f:s $eof  ]';
        '39:112 functions__js_data=>functions__js_data • functions__js_primitive';
        '39:113 functions__js_data=>functions__js_data • functions__js_data_block';
        '37:103 functions__reduce_function=>functions__js_function_start_symbol τr τ{ functions__js_data • τ}';
        '37:106 functions__reduce_function=>functions__js_function_start_symbol τreturn τ{ functions__js_data • τ}';
        '41:123 functions__js_data_block=>τ{ functions__js_data • τ}';
        '42:124 functions__referenced_function=>functions__referenced_function_group_249_0_ symbols__identifier τ{ functions__js_data • τ}';
        scan(state.lexer, 95, 15);
        if (state.lexer._type == 47) {
            'Asserts [  {  ]';
            state.push_fn(hc_functions__js_data_goto /*hc_functions__js_data_goto( state, db, 39 )*/, 39);
            '"--LEAF--"';
            '39:113 functions__js_data=>functions__js_data • functions__js_data_block';
            scan(state.lexer, 30, 4);
            if ((state.lexer._type == 47)) {
                state.push_fn(branch_20b33064645a28fc, 39);
                return hc_functions__js_data_block(state, db, 0);
            };
            return - 1;
        } else if (state.lexer._type == 48) {
            'Asserts [  }  ]';
            '"--LEAF--"';
            '"--leafy--"';
            return 39;
        } else if (isTokenActive(state.lexer._type, 94)) {
            'Asserts [  id num sp sym g: t: f:s $eof  ]';
            state.push_fn(hc_functions__js_data_goto /*hc_functions__js_data_goto( state, db, 39 )*/, 39);
            '"--LEAF--"';
            '39:112 functions__js_data=>functions__js_data • functions__js_primitive';
            scan(state.lexer, 96, 15);
            if ((isTokenActive(state.lexer._type, 94))) {
                state.push_fn(branch_20b33064645a28fc, 39);
                return hc_functions__js_primitive(state, db, 0);
            };
            return - 1;
        };
        return (prod == 39) ? prod : - 1;
    }

    function hc_functions__js_primitive(state, db, prod) {
        scan(state.lexer, 96, 15);
        'offset 0 peek_level-1 [  g: t: f:s $eof id num sp sym  ]';
        '40:115 functions__js_primitive=>• θid';
        '40:116 functions__js_primitive=>• θnum';
        '40:117 functions__js_primitive=>• θsp';
        '40:118 functions__js_primitive=>• θsym';
        '40:119 functions__js_primitive=>• symbols__generated_symbol';
        '40:120 functions__js_primitive=>• symbols__literal_symbol';
        '40:121 functions__js_primitive=>• symbols__escaped_symbol';
        '40:122 functions__js_primitive=>• symbols__EOF_symbol';
        if (state.lexer._type == 12) {
            'Asserts [  g:  ]';
            state.push_fn(set_production /*40*/, 40);
            '"--LEAF--"';
            '40:119 functions__js_primitive=>• symbols__generated_symbol';
            state.push_fn(set_production /*0*/, 40);
            return hc_symbols__generated_symbol(state, db, 0);
        } else if (state.lexer._type == 15) {
            'Asserts [  t:  ]';
            state.push_fn(set_production /*40*/, 40);
            '"--LEAF--"';
            '40:120 functions__js_primitive=>• symbols__literal_symbol';
            state.push_fn(set_production /*0*/, 40);
            return hc_symbols__literal_symbol(state, db, 0);
        } else if (state.lexer._type == 16) {
            'Asserts [  f:s  ]';
            state.push_fn(set_production /*40*/, 40);
            '"--LEAF--"';
            '40:121 functions__js_primitive=>• symbols__escaped_symbol';
            state.push_fn(set_production /*0*/, 40);
            return hc_symbols__escaped_symbol(state, db, 0);
        } else if (state.lexer._type == 39) {
            'Asserts [  $eof  ]';
            state.push_fn(set_production /*40*/, 40);
            '"--LEAF--"';
            '40:122 functions__js_primitive=>• symbols__EOF_symbol';
            state.push_fn(branch_06856d78c724971e, 40);
            return hc_symbols__EOF_symbol(state, db, 0);
        } else if (state.lexer._type == 3) {
            'Asserts [  id  ]';
            state.push_fn(set_production /*40*/, 40);
            '"--LEAF--"';
            '40:115 functions__js_primitive=>• θid';
            consume(state);
            return 0;
        } else if (state.lexer._type == 5) {
            'Asserts [  num  ]';
            state.push_fn(set_production /*40*/, 40);
            '"--LEAF--"';
            '40:116 functions__js_primitive=>• θnum';
            consume(state);
            return 0;
        } else if (state.lexer._type == 8) {
            'Asserts [  sp  ]';
            state.push_fn(set_production /*40*/, 40);
            '"--LEAF--"';
            '40:117 functions__js_primitive=>• θsp';
            consume(state);
            return 0;
        } else if (state.lexer._type == 2) {
            'Asserts [  sym  ]';
            state.push_fn(set_production /*40*/, 40);
            '"--LEAF--"';
            '40:118 functions__js_primitive=>• θsym';
            consume(state);
            return 0;
        };
        return - 1;
    }

    function hc_functions__js_data_block(state, db, prod) {
        scan(state.lexer, 30, 4);
        'offset 0 peek_level-1 [  {  ]';
        '41:123 functions__js_data_block=>• τ{ functions__js_data τ}';
        if (state.lexer._type == 47) {
            'Assert Consume [  {  ]';
            consume(state);
            '"--LEAF--"';
            '41:123 functions__js_data_block=>τ{ • functions__js_data τ}';
            scan(state.lexer, 93, 15);
            if ((isTokenActive(state.lexer._type, 97))) {
                state.push_fn(branch_40e34a0fede9faea, 41);
                return hc_functions__js_data(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_functions__referenced_function(state, db, prod) {
        '"--LEAF--"';
        '42:124 functions__referenced_function=>• functions__referenced_function_group_249_0_ symbols__identifier τ{ functions__js_data τ}';
        state.push_fn(branch_bd45a08d51d903d4, 42);
        return hc_functions__referenced_function_group_249_0_(state, db, 0);
    }

    function hc_state_ir__grammar_injection(state, db, prod) {
        scan(state.lexer, 98, 6);
        'offset 0 peek_level-1 [  <[  ]';
        '43:125 state_ir__grammar_injection=>• τ<[ τrecover symbols__imported_production_symbol τ] state_ir__top_level_instructions state_ir__on_fail state_ir__expected_symbols τ>';
        '43:126 state_ir__grammar_injection=>• τ<[ tk:state_ir__state_hash_token τ] state_ir__top_level_instructions state_ir__on_fail state_ir__expected_symbols τ>';
        '43:127 state_ir__grammar_injection=>• τ<[ τrecover symbols__production_symbol τ] state_ir__top_level_instructions state_ir__on_fail state_ir__expected_symbols τ>';
        '43:128 state_ir__grammar_injection=>• τ<[ τrecover symbols__imported_production_symbol τ] state_ir__top_level_instructions state_ir__expected_symbols τ>';
        '43:129 state_ir__grammar_injection=>• τ<[ τrecover symbols__imported_production_symbol τ] state_ir__top_level_instructions state_ir__on_fail τ>';
        '43:130 state_ir__grammar_injection=>• τ<[ tk:state_ir__state_hash_token τ] state_ir__top_level_instructions state_ir__expected_symbols τ>';
        '43:131 state_ir__grammar_injection=>• τ<[ tk:state_ir__state_hash_token τ] state_ir__top_level_instructions state_ir__on_fail τ>';
        '43:132 state_ir__grammar_injection=>• τ<[ τrecover symbols__production_symbol τ] state_ir__top_level_instructions state_ir__expected_symbols τ>';
        '43:133 state_ir__grammar_injection=>• τ<[ τrecover symbols__production_symbol τ] state_ir__top_level_instructions state_ir__on_fail τ>';
        '43:134 state_ir__grammar_injection=>• τ<[ τrecover symbols__imported_production_symbol τ] state_ir__top_level_instructions τ>';
        '43:135 state_ir__grammar_injection=>• τ<[ tk:state_ir__state_hash_token τ] state_ir__top_level_instructions τ>';
        '43:136 state_ir__grammar_injection=>• τ<[ τrecover symbols__production_symbol τ] state_ir__top_level_instructions τ>';
        if (state.lexer._type == 54) {
            'Assert Consume [  <[  ]';
            consume(state);
            'offset 1 peek_level0 [  recover 44  ]';
            '43:125 state_ir__grammar_injection=>τ<[ • τrecover symbols__imported_production_symbol τ] state_ir__top_level_instructions state_ir__on_fail state_ir__expected_symbols τ>';
            '43:127 state_ir__grammar_injection=>τ<[ • τrecover symbols__production_symbol τ] state_ir__top_level_instructions state_ir__on_fail state_ir__expected_symbols τ>';
            '43:128 state_ir__grammar_injection=>τ<[ • τrecover symbols__imported_production_symbol τ] state_ir__top_level_instructions state_ir__expected_symbols τ>';
            '43:129 state_ir__grammar_injection=>τ<[ • τrecover symbols__imported_production_symbol τ] state_ir__top_level_instructions state_ir__on_fail τ>';
            '43:132 state_ir__grammar_injection=>τ<[ • τrecover symbols__production_symbol τ] state_ir__top_level_instructions state_ir__expected_symbols τ>';
            '43:133 state_ir__grammar_injection=>τ<[ • τrecover symbols__production_symbol τ] state_ir__top_level_instructions state_ir__on_fail τ>';
            '43:134 state_ir__grammar_injection=>τ<[ • τrecover symbols__imported_production_symbol τ] state_ir__top_level_instructions τ>';
            '43:136 state_ir__grammar_injection=>τ<[ • τrecover symbols__production_symbol τ] state_ir__top_level_instructions τ>';
            '43:126 state_ir__grammar_injection=>τ<[ • tk:state_ir__state_hash_token τ] state_ir__top_level_instructions state_ir__on_fail state_ir__expected_symbols τ>';
            '43:130 state_ir__grammar_injection=>τ<[ • tk:state_ir__state_hash_token τ] state_ir__top_level_instructions state_ir__expected_symbols τ>';
            '43:131 state_ir__grammar_injection=>τ<[ • tk:state_ir__state_hash_token τ] state_ir__top_level_instructions state_ir__on_fail τ>';
            '43:135 state_ir__grammar_injection=>τ<[ • tk:state_ir__state_hash_token τ] state_ir__top_level_instructions τ>';
            scan(state.lexer, 99, 6);
            if (state.lexer._type == 55) {
                'Asserts [  recover  ]';
                consume(state);
                '"⤋⤋⤋  post-peek-consume ⤋⤋⤋"';
                'offset 3 peek_level-1 [  recover  ]';
                '43:125 state_ir__grammar_injection=>τ<[ • τrecover symbols__imported_production_symbol τ] state_ir__top_level_instructions state_ir__on_fail state_ir__expected_symbols τ>';
                '43:127 state_ir__grammar_injection=>τ<[ • τrecover symbols__production_symbol τ] state_ir__top_level_instructions state_ir__on_fail state_ir__expected_symbols τ>';
                '43:128 state_ir__grammar_injection=>τ<[ • τrecover symbols__imported_production_symbol τ] state_ir__top_level_instructions state_ir__expected_symbols τ>';
                '43:129 state_ir__grammar_injection=>τ<[ • τrecover symbols__imported_production_symbol τ] state_ir__top_level_instructions state_ir__on_fail τ>';
                '43:132 state_ir__grammar_injection=>τ<[ • τrecover symbols__production_symbol τ] state_ir__top_level_instructions state_ir__expected_symbols τ>';
                '43:133 state_ir__grammar_injection=>τ<[ • τrecover symbols__production_symbol τ] state_ir__top_level_instructions state_ir__on_fail τ>';
                '43:134 state_ir__grammar_injection=>τ<[ • τrecover symbols__imported_production_symbol τ] state_ir__top_level_instructions τ>';
                '43:136 state_ir__grammar_injection=>τ<[ • τrecover symbols__production_symbol τ] state_ir__top_level_instructions τ>';
                'offset 4 peek_level0 [  9  ]';
                '43:125 state_ir__grammar_injection=>τ<[ τrecover • symbols__imported_production_symbol τ] state_ir__top_level_instructions state_ir__on_fail state_ir__expected_symbols τ>';
                '43:127 state_ir__grammar_injection=>τ<[ τrecover • symbols__production_symbol τ] state_ir__top_level_instructions state_ir__on_fail state_ir__expected_symbols τ>';
                '43:128 state_ir__grammar_injection=>τ<[ τrecover • symbols__imported_production_symbol τ] state_ir__top_level_instructions state_ir__expected_symbols τ>';
                '43:129 state_ir__grammar_injection=>τ<[ τrecover • symbols__imported_production_symbol τ] state_ir__top_level_instructions state_ir__on_fail τ>';
                '43:132 state_ir__grammar_injection=>τ<[ τrecover • symbols__production_symbol τ] state_ir__top_level_instructions state_ir__expected_symbols τ>';
                '43:133 state_ir__grammar_injection=>τ<[ τrecover • symbols__production_symbol τ] state_ir__top_level_instructions state_ir__on_fail τ>';
                '43:134 state_ir__grammar_injection=>τ<[ τrecover • symbols__imported_production_symbol τ] state_ir__top_level_instructions τ>';
                '43:136 state_ir__grammar_injection=>τ<[ τrecover • symbols__production_symbol τ] state_ir__top_level_instructions τ>';
                scan(state.lexer, 8, 4);
                if (state.lexer._type == 13) {
                    'Asserts [  9  ]';
                    var fk1 = state.fork(db);;
                    fk1.push_fn(branch_f623f9f0211d66a4, 43);
                    state.push_fn(branch_f2237a785504100b, 43);
                    return 0;
                }
            } else if (state.lexer._type == 56) {
                'Asserts [  44  ]';
                consume(state);
                '"⤋⤋⤋  post-peek-consume ⤋⤋⤋"';
                'offset 3 peek_level-1 [  44  ]';
                '43:126 state_ir__grammar_injection=>τ<[ • tk:state_ir__state_hash_token τ] state_ir__top_level_instructions state_ir__on_fail state_ir__expected_symbols τ>';
                '43:130 state_ir__grammar_injection=>τ<[ • tk:state_ir__state_hash_token τ] state_ir__top_level_instructions state_ir__expected_symbols τ>';
                '43:131 state_ir__grammar_injection=>τ<[ • tk:state_ir__state_hash_token τ] state_ir__top_level_instructions state_ir__on_fail τ>';
                '43:135 state_ir__grammar_injection=>τ<[ • tk:state_ir__state_hash_token τ] state_ir__top_level_instructions τ>';
                'offset 4 peek_level-1 [  ]  ]';
                '43:126 state_ir__grammar_injection=>τ<[ tk:state_ir__state_hash_token • τ] state_ir__top_level_instructions state_ir__on_fail state_ir__expected_symbols τ>';
                '43:130 state_ir__grammar_injection=>τ<[ tk:state_ir__state_hash_token • τ] state_ir__top_level_instructions state_ir__expected_symbols τ>';
                '43:131 state_ir__grammar_injection=>τ<[ tk:state_ir__state_hash_token • τ] state_ir__top_level_instructions state_ir__on_fail τ>';
                '43:135 state_ir__grammar_injection=>τ<[ tk:state_ir__state_hash_token • τ] state_ir__top_level_instructions τ>';
                scan(state.lexer, 9, 6);
                if (state.lexer._type == 33) {
                    'Assert Consume [  ]  ]';
                    consume(state);
                    'offset 5 peek_level-1 [  45  ]';
                    '43:126 state_ir__grammar_injection=>τ<[ tk:state_ir__state_hash_token τ] • state_ir__top_level_instructions state_ir__on_fail state_ir__expected_symbols τ>';
                    '43:130 state_ir__grammar_injection=>τ<[ tk:state_ir__state_hash_token τ] • state_ir__top_level_instructions state_ir__expected_symbols τ>';
                    '43:131 state_ir__grammar_injection=>τ<[ tk:state_ir__state_hash_token τ] • state_ir__top_level_instructions state_ir__on_fail τ>';
                    '43:135 state_ir__grammar_injection=>τ<[ tk:state_ir__state_hash_token τ] • state_ir__top_level_instructions τ>';
                    scan(state.lexer, 10, 6);
                    state.push_fn(branch_d9f7a3fc0252e1a1, 0);
                    return hc_state_ir__top_level_instructions(state, db, 0);
                }
            }
        };
        return - 1;
    }

    function hc_state_ir__state_hash_token(state, db, prod) {
        scan(state.lexer, 100, 6);
        'offset 0 peek_level-1 [  _ - id num  ]';
        '44:138 state_ir__state_hash_token=>• θid';
        '44:139 state_ir__state_hash_token=>• θnum';
        '44:140 state_ir__state_hash_token=>• τ_';
        '44:141 state_ir__state_hash_token=>• τ-';
        if (state.lexer._type == 14) {
            'Asserts [  _  ]';
            state.push_fn(hc_state_ir__state_hash_token_goto /*hc_state_ir__state_hash_token_goto( state, db, 44 )*/, 44);
            '"--LEAF--"';
            '44:140 state_ir__state_hash_token=>• τ_';
            consume(state);
            return 0;
        } else if (state.lexer._type == 57) {
            'Asserts [  -  ]';
            state.push_fn(hc_state_ir__state_hash_token_goto /*hc_state_ir__state_hash_token_goto( state, db, 44 )*/, 44);
            '"--LEAF--"';
            '44:141 state_ir__state_hash_token=>• τ-';
            consume(state);
            return 0;
        } else if (state.lexer._type == 3) {
            'Asserts [  id  ]';
            state.push_fn(hc_state_ir__state_hash_token_goto /*hc_state_ir__state_hash_token_goto( state, db, 44 )*/, 44);
            '"--LEAF--"';
            '44:138 state_ir__state_hash_token=>• θid';
            consume(state);
            return 0;
        } else if (state.lexer._type == 5) {
            'Asserts [  num  ]';
            state.push_fn(hc_state_ir__state_hash_token_goto /*hc_state_ir__state_hash_token_goto( state, db, 44 )*/, 44);
            '"--LEAF--"';
            '44:139 state_ir__state_hash_token=>• θnum';
            consume(state);
            return 0;
        };
        return - 1;
    }

    function hc_state_ir__state_hash_token_goto(state, db, prod) {
        'offset 1 peek_level-1 [  _ - num id  ]';
        '44:137 state_ir__state_hash_token=>state_ir__state_hash_token • θnum';
        '44:142 state_ir__state_hash_token=>state_ir__state_hash_token • τ_';
        '44:143 state_ir__state_hash_token=>state_ir__state_hash_token • τ-';
        '44:144 state_ir__state_hash_token=>state_ir__state_hash_token • θid';
        scan(state.lexer, 101, 102);
        if (state.lexer._type == 14) {
            'Asserts [  _  ]';
            state.push_fn(hc_state_ir__state_hash_token_goto /*hc_state_ir__state_hash_token_goto( state, db, 44 )*/, 44);
            '"--LEAF--"';
            '44:142 state_ir__state_hash_token=>state_ir__state_hash_token • τ_';
            scan(state.lexer, 103, 102);
            consume(state);
            add_reduce(state, 2, 0);
            return 0;
        } else if (state.lexer._type == 57) {
            'Asserts [  -  ]';
            state.push_fn(hc_state_ir__state_hash_token_goto /*hc_state_ir__state_hash_token_goto( state, db, 44 )*/, 44);
            '"--LEAF--"';
            '44:143 state_ir__state_hash_token=>state_ir__state_hash_token • τ-';
            scan(state.lexer, 104, 102);
            consume(state);
            add_reduce(state, 2, 0);
            return 0;
        } else if (state.lexer._type == 5) {
            'Asserts [  num  ]';
            state.push_fn(hc_state_ir__state_hash_token_goto /*hc_state_ir__state_hash_token_goto( state, db, 44 )*/, 44);
            '"--LEAF--"';
            '44:137 state_ir__state_hash_token=>state_ir__state_hash_token • θnum';
            scan(state.lexer, 105, 102);
            consume(state);
            add_reduce(state, 2, 0);
            return 0;
        } else if (state.lexer._type == 3) {
            'Asserts [  id  ]';
            state.push_fn(hc_state_ir__state_hash_token_goto /*hc_state_ir__state_hash_token_goto( state, db, 44 )*/, 44);
            '"--LEAF--"';
            '44:144 state_ir__state_hash_token=>state_ir__state_hash_token • θid';
            scan(state.lexer, 106, 102);
            consume(state);
            add_reduce(state, 2, 0);
            return 0;
        };
        return (prod == 44) ? prod : - 1;
    }

    function hc_state_ir__top_level_instructions(state, db, prod) {
        scan(state.lexer, 10, 6);
        'offset 0 peek_level0 [   then reduce set fork scan pop pass end fail goto noconsume consume peek assert on  ]';
        '45:145 state_ir__top_level_instructions=>• state_ir__top_level_instructions_list_305';
        '45:146 state_ir__top_level_instructions=>• state_ir__top_level_instructions_list_306';
        '45:147 state_ir__top_level_instructions=>• state_ir__instruction_sequence';
        if (isTokenActive(state.lexer._type, 107)) {
            'Asserts [   then reduce set fork scan pop pass end fail goto  ]';
            state.push_fn(set_production /*45*/, 45);
            '"--LEAF--"';
            '45:147 state_ir__top_level_instructions=>• state_ir__instruction_sequence';
            state.push_fn(set_production /*0*/, 45);
            return hc_state_ir__instruction_sequence(state, db, 0);
        } else if (state.lexer._type == 79 || state.lexer._type == 80 || state.lexer._type == 81 || state.lexer._type == 82) {
            'Asserts [  noconsume consume peek assert  ]';
            state.push_fn(set_production /*45*/, 45);
            '"--LEAF--"';
            '45:146 state_ir__top_level_instructions=>• state_ir__top_level_instructions_list_306';
            state.push_fn(set_production /*0*/, 45);
            return hc_state_ir__top_level_instructions_list_306(state, db, 0);
        } else if (state.lexer._type == 58) {
            'Asserts [  on  ]';
            state.push_fn(set_production /*45*/, 45);
            '"--LEAF--"';
            '45:145 state_ir__top_level_instructions=>• state_ir__top_level_instructions_list_305';
            state.push_fn(set_production /*0*/, 45);
            return hc_state_ir__top_level_instructions_list_305(state, db, 0);
        };
        return - 1;
    }

    function hc_state_ir__prod_branch_instruction(state, db, prod) {
        scan(state.lexer, 12, 6);
        'offset 0 peek_level-1 [  on  ]';
        '46:148 state_ir__prod_branch_instruction=>• τon τprod state_ir__production_id_list τ( state_ir__instruction_sequence τ)';
        if (state.lexer._type == 58) {
            'Assert Consume [  on  ]';
            consume(state);
            '"--LEAF--"';
            '46:148 state_ir__prod_branch_instruction=>τon • τprod state_ir__production_id_list τ( state_ir__instruction_sequence τ)';
            scan(state.lexer, 108, 6);
            if ((state.lexer._type == 59)) {
                consume(state);
                state.push_fn(branch_c7a75ef4d623c6f3, 46);
                return hc_state_ir__production_id_list(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_state_ir__production_id_list(state, db, prod) {
        scan(state.lexer, 109, 6);
        'offset 0 peek_level-1 [  [  ]';
        '47:149 state_ir__production_id_list=>• τ[ state_ir__production_id_list_list_315 τ]';
        if (state.lexer._type == 32) {
            'Assert Consume [  [  ]';
            consume(state);
            '"--LEAF--"';
            '47:149 state_ir__production_id_list=>τ[ • state_ir__production_id_list_list_315 τ]';
            scan(state.lexer, 110, 6);
            if ((state.lexer._type == 13 || state.lexer._type == 5)) {
                state.push_fn(branch_5ab1bd758821cde5, 47);
                return hc_state_ir__production_id_list_list_315(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_state_ir__instruction_sequence(state, db, prod) {
        scan(state.lexer, 111, 6);
        'offset 0 peek_level0 [   reduce set fork scan pop pass end fail goto then  ]';
        '48:150 state_ir__instruction_sequence=>• state_ir__instruction_sequence_list_317 τthen state_ir__instruction_sequence_list_320 state_ir__instruction_sequence_group_321_0_';
        '48:152 state_ir__instruction_sequence=>• state_ir__instruction_sequence_list_317 state_ir__instruction_sequence_group_321_0_';
        '48:153 state_ir__instruction_sequence=>• state_ir__instruction_sequence_list_317 τthen state_ir__instruction_sequence_list_320';
        '48:155 state_ir__instruction_sequence=>• state_ir__instruction_sequence_list_317';
        '48:151 state_ir__instruction_sequence=>• state_ir__instruction_sequence_list_320 state_ir__instruction_sequence_group_324_0_';
        '48:154 state_ir__instruction_sequence=>• state_ir__instruction_sequence_list_320';
        '48:156 state_ir__instruction_sequence=>• state_ir__instruction_sequence_group_324_0_';
        '48:157 state_ir__instruction_sequence=>• ɛ';
        if (state.lexer._type == 61) {
            'Asserts [    ]';
            state.push_fn(set_production /*48*/, 48);
            '"--LEAF--"';
            '48:157 state_ir__instruction_sequence=>• ɛ';
            state.lexer.setToken(2, 0, 0);
            consume(state);
            return 0;
        } else if (isTokenActive(state.lexer._type, 112)) {
            'Asserts [  reduce set fork scan pop pass end fail  ]';
            'offset 2 peek_level-1 [  70  ]';
            '48:150 state_ir__instruction_sequence=>• state_ir__instruction_sequence_list_317 τthen state_ir__instruction_sequence_list_320 state_ir__instruction_sequence_group_321_0_';
            '48:152 state_ir__instruction_sequence=>• state_ir__instruction_sequence_list_317 state_ir__instruction_sequence_group_321_0_';
            '48:153 state_ir__instruction_sequence=>• state_ir__instruction_sequence_list_317 τthen state_ir__instruction_sequence_list_320';
            '48:155 state_ir__instruction_sequence=>• state_ir__instruction_sequence_list_317';
            scan(state.lexer, 113, 6);
            state.push_fn(branch_6b52755d3040a722, 0);
            return hc_state_ir__instruction_sequence_list_317(state, db, 0);
        } else if (state.lexer._type == 78) {
            'Asserts [  goto  ]';
            'offset 2 peek_level-1 [  71  ]';
            '48:151 state_ir__instruction_sequence=>• state_ir__instruction_sequence_list_320 state_ir__instruction_sequence_group_324_0_';
            '48:154 state_ir__instruction_sequence=>• state_ir__instruction_sequence_list_320';
            scan(state.lexer, 25, 6);
            state.push_fn(branch_d9dbacc0bcbb1520, 0);
            return hc_state_ir__instruction_sequence_list_320(state, db, 0);
        } else if (state.lexer._type == 60) {
            'Asserts [  then  ]';
            state.push_fn(set_production /*48*/, 48);
            '"--LEAF--"';
            '48:156 state_ir__instruction_sequence=>• state_ir__instruction_sequence_group_324_0_';
            state.push_fn(branch_232f37efe656dae6, 48);
            return hc_state_ir__instruction_sequence_group_324_0_(state, db, 0);
        };
        state.lexer.setToken(2, 0, 0);
        consume(state);
        return 48;
    }

    function hc_state_ir__sequence_instruction(state, db, prod) {
        scan(state.lexer, 113, 6);
        'offset 0 peek_level0 [  reduce set fork scan pop pass end fail  ]';
        '49:158 state_ir__sequence_instruction=>• τreduce θnum θnum';
        '49:159 state_ir__sequence_instruction=>• τreduce functions__reduce_function';
        '49:169 state_ir__sequence_instruction=>• τreduce functions__referenced_function';
        '49:160 state_ir__sequence_instruction=>• τset τprod τto symbols__imported_production_symbol';
        '49:164 state_ir__sequence_instruction=>• τset τtoken τlength θnum';
        '49:165 state_ir__sequence_instruction=>• τset τtoken τid symbols__terminal_symbol';
        '49:170 state_ir__sequence_instruction=>• τset τprod τto state_ir__sequence_instruction_group_343_0_';
        '49:171 state_ir__sequence_instruction=>• τset τprod τto symbols__production_symbol';
        '49:172 state_ir__sequence_instruction=>• τset τtoken τid state_ir__sequence_instruction_group_363_0_';
        '49:161 state_ir__sequence_instruction=>• τfork τto τ( state_ir__sequence_instruction_list_348 τ)';
        '49:162 state_ir__sequence_instruction=>• τscan τback τuntil state_ir__token_id_list';
        '49:173 state_ir__sequence_instruction=>• τscan τuntil state_ir__token_id_list';
        '49:163 state_ir__sequence_instruction=>• τpop θnum';
        '49:166 state_ir__sequence_instruction=>• τpass';
        '49:167 state_ir__sequence_instruction=>• τend';
        '49:168 state_ir__sequence_instruction=>• τfail';
        if (state.lexer._type == 62) {
            'Asserts [  reduce  ]';
            consume(state);
            '"⤋⤋⤋  post-peek-consume ⤋⤋⤋"';
            'offset 2 peek_level-1 [  reduce  ]';
            '49:158 state_ir__sequence_instruction=>• τreduce θnum θnum';
            '49:159 state_ir__sequence_instruction=>• τreduce functions__reduce_function';
            '49:169 state_ir__sequence_instruction=>• τreduce functions__referenced_function';
            'offset 3 peek_level-1 [  f: num  ]';
            '49:158 state_ir__sequence_instruction=>τreduce • θnum θnum';
            '49:159 state_ir__sequence_instruction=>τreduce • functions__reduce_function';
            '49:169 state_ir__sequence_instruction=>τreduce • functions__referenced_function';
            scan(state.lexer, 114, 6);
            if (state.lexer._type == 53) {
                'Asserts [  f:  ]';
                var fk1 = state.fork(db);;
                fk1.push_fn(branch_db55cd3993e0c4f4, 49);
                state.push_fn(branch_62998d73bbd7944d, 49);
                return 0;
            } else if (state.lexer._type == 5) {
                'Asserts [  num  ]';
                state.push_fn(set_production /*49*/, 49);
                '"--LEAF--"';
                '49:158 state_ir__sequence_instruction=>τreduce • θnum θnum';
                consume(state);
                scan(state.lexer, 115, 6);
                if ((state.lexer._type == 5)) {
                    consume(state);
                    add_reduce(state, 3, 71);
                    return 0;
                };
                return - 1;
            }
        } else if (state.lexer._type == 63) {
            'Asserts [  set  ]';
            consume(state);
            '"⤋⤋⤋  post-peek-consume ⤋⤋⤋"';
            'offset 2 peek_level-1 [  set  ]';
            '49:160 state_ir__sequence_instruction=>• τset τprod τto symbols__imported_production_symbol';
            '49:164 state_ir__sequence_instruction=>• τset τtoken τlength θnum';
            '49:165 state_ir__sequence_instruction=>• τset τtoken τid symbols__terminal_symbol';
            '49:170 state_ir__sequence_instruction=>• τset τprod τto state_ir__sequence_instruction_group_343_0_';
            '49:171 state_ir__sequence_instruction=>• τset τprod τto symbols__production_symbol';
            '49:172 state_ir__sequence_instruction=>• τset τtoken τid state_ir__sequence_instruction_group_363_0_';
            'offset 3 peek_level0 [  prod token  ]';
            '49:160 state_ir__sequence_instruction=>τset • τprod τto symbols__imported_production_symbol';
            '49:170 state_ir__sequence_instruction=>τset • τprod τto state_ir__sequence_instruction_group_343_0_';
            '49:171 state_ir__sequence_instruction=>τset • τprod τto symbols__production_symbol';
            '49:164 state_ir__sequence_instruction=>τset • τtoken τlength θnum';
            '49:165 state_ir__sequence_instruction=>τset • τtoken τid symbols__terminal_symbol';
            '49:172 state_ir__sequence_instruction=>τset • τtoken τid state_ir__sequence_instruction_group_363_0_';
            scan(state.lexer, 116, 6);
            if (state.lexer._type == 59) {
                'Asserts [  prod  ]';
                consume(state);
                '"⤋⤋⤋  post-peek-consume ⤋⤋⤋"';
                'offset 5 peek_level-1 [  prod  ]';
                '49:160 state_ir__sequence_instruction=>τset • τprod τto symbols__imported_production_symbol';
                '49:170 state_ir__sequence_instruction=>τset • τprod τto state_ir__sequence_instruction_group_343_0_';
                '49:171 state_ir__sequence_instruction=>τset • τprod τto symbols__production_symbol';
                'offset 6 peek_level-1 [  to  ]';
                '49:160 state_ir__sequence_instruction=>τset τprod • τto symbols__imported_production_symbol';
                '49:170 state_ir__sequence_instruction=>τset τprod • τto state_ir__sequence_instruction_group_343_0_';
                '49:171 state_ir__sequence_instruction=>τset τprod • τto symbols__production_symbol';
                scan(state.lexer, 117, 6);
                if (state.lexer._type == 64) {
                    'Assert Consume [  to  ]';
                    consume(state);
                    'offset 7 peek_level0 [  9 num  ]';
                    '49:160 state_ir__sequence_instruction=>τset τprod τto • symbols__imported_production_symbol';
                    '49:171 state_ir__sequence_instruction=>τset τprod τto • symbols__production_symbol';
                    '49:170 state_ir__sequence_instruction=>τset τprod τto • state_ir__sequence_instruction_group_343_0_';
                    scan(state.lexer, 118, 4);
                    if (state.lexer._type == 13) {
                        'Asserts [  9  ]';
                        var fk1 = state.fork(db);;
                        fk1.push_fn(branch_722c93e5bf14b063, 49);
                        state.push_fn(branch_0e10591698fa0947, 49);
                        return 0;
                    } else {
                        state.push_fn(set_production /*49*/, 49);
                        '"--LEAF--"';
                        '49:170 state_ir__sequence_instruction=>τset τprod τto • state_ir__sequence_instruction_group_343_0_';
                        state.push_fn(branch_d78a4d16a14bf341, 49);
                        return hc_state_ir__sequence_instruction_group_343_0_(state, db, 0);
                    }
                }
            } else if (state.lexer._type == 70) {
                'Asserts [  token  ]';
                consume(state);
                '"⤋⤋⤋  post-peek-consume ⤋⤋⤋"';
                'offset 5 peek_level-1 [  token  ]';
                '49:164 state_ir__sequence_instruction=>τset • τtoken τlength θnum';
                '49:165 state_ir__sequence_instruction=>τset • τtoken τid symbols__terminal_symbol';
                '49:172 state_ir__sequence_instruction=>τset • τtoken τid state_ir__sequence_instruction_group_363_0_';
                'offset 6 peek_level-1 [  length id  ]';
                '49:164 state_ir__sequence_instruction=>τset τtoken • τlength θnum';
                '49:165 state_ir__sequence_instruction=>τset τtoken • τid symbols__terminal_symbol';
                '49:172 state_ir__sequence_instruction=>τset τtoken • τid state_ir__sequence_instruction_group_363_0_';
                scan(state.lexer, 119, 6);
                if (state.lexer._type == 71) {
                    'Asserts [  length  ]';
                    state.push_fn(set_production /*49*/, 49);
                    '"--LEAF--"';
                    '49:164 state_ir__sequence_instruction=>τset τtoken • τlength θnum';
                    consume(state);
                    scan(state.lexer, 115, 6);
                    if ((state.lexer._type == 5)) {
                        consume(state);
                        add_reduce(state, 4, 77);
                        return 0;
                    };
                    return - 1;
                } else if (state.lexer._type == 72) {
                    'Asserts [  id  ]';
                    consume(state);
                    '"⤋⤋⤋  post-peek-consume ⤋⤋⤋"';
                    'offset 8 peek_level-1 [  id  ]';
                    '49:165 state_ir__sequence_instruction=>τset τtoken • τid symbols__terminal_symbol';
                    '49:172 state_ir__sequence_instruction=>τset τtoken • τid state_ir__sequence_instruction_group_363_0_';
                    'offset 9 peek_level0 [  g: t: f:s num  ]';
                    '49:165 state_ir__sequence_instruction=>τset τtoken τid • symbols__terminal_symbol';
                    '49:172 state_ir__sequence_instruction=>τset τtoken τid • state_ir__sequence_instruction_group_363_0_';
                    scan(state.lexer, 120, 4);
                    if (state.lexer._type == 12 || state.lexer._type == 15 || state.lexer._type == 16) {
                        'Asserts [  g: t: f:s  ]';
                        state.push_fn(set_production /*49*/, 49);
                        '"--LEAF--"';
                        '49:165 state_ir__sequence_instruction=>τset τtoken τid • symbols__terminal_symbol';
                        state.push_fn(branch_d5734ccc71d316e4, 49);
                        return hc_symbols__terminal_symbol(state, db, 0);
                    } else {
                        state.push_fn(set_production /*49*/, 49);
                        '"--LEAF--"';
                        '49:172 state_ir__sequence_instruction=>τset τtoken τid • state_ir__sequence_instruction_group_363_0_';
                        state.push_fn(branch_d5734ccc71d316e4, 49);
                        return hc_state_ir__sequence_instruction_group_363_0_(state, db, 0);
                    }
                }
            }
        } else if (state.lexer._type == 65) {
            'Asserts [  fork  ]';
            state.push_fn(set_production /*49*/, 49);
            '"--LEAF--"';
            '49:161 state_ir__sequence_instruction=>• τfork τto τ( state_ir__sequence_instruction_list_348 τ)';
            consume(state);
            scan(state.lexer, 117, 6);
            if ((state.lexer._type == 64)) {
                consume(state);
                scan(state.lexer, 19, 6);
                if ((state.lexer._type == 29)) {
                    consume(state);
                    state.push_fn(branch_ef65e47554fb2735, 49);
                    return hc_state_ir__sequence_instruction_list_348(state, db, 0);
                }
            };
            return - 1;
        } else if (state.lexer._type == 66) {
            'Asserts [  scan  ]';
            consume(state);
            '"⤋⤋⤋  post-peek-consume ⤋⤋⤋"';
            'offset 2 peek_level-1 [  scan  ]';
            '49:162 state_ir__sequence_instruction=>• τscan τback τuntil state_ir__token_id_list';
            '49:173 state_ir__sequence_instruction=>• τscan τuntil state_ir__token_id_list';
            'offset 3 peek_level-1 [  back until  ]';
            '49:162 state_ir__sequence_instruction=>τscan • τback τuntil state_ir__token_id_list';
            '49:173 state_ir__sequence_instruction=>τscan • τuntil state_ir__token_id_list';
            scan(state.lexer, 121, 6);
            if (state.lexer._type == 67) {
                'Asserts [  back  ]';
                state.push_fn(set_production /*49*/, 49);
                '"--LEAF--"';
                '49:162 state_ir__sequence_instruction=>τscan • τback τuntil state_ir__token_id_list';
                consume(state);
                scan(state.lexer, 122, 6);
                if ((state.lexer._type == 68)) {
                    consume(state);
                    state.push_fn(branch_66b9bad47c4bd243, 49);
                    return hc_state_ir__token_id_list(state, db, 0);
                };
                return - 1;
            } else if (state.lexer._type == 68) {
                'Asserts [  until  ]';
                state.push_fn(set_production /*49*/, 49);
                '"--LEAF--"';
                '49:173 state_ir__sequence_instruction=>τscan • τuntil state_ir__token_id_list';
                consume(state);
                state.push_fn(branch_0b9e6f0d3579dc7c, 49);
                return hc_state_ir__token_id_list(state, db, 0);
            }
        } else if (state.lexer._type == 69) {
            'Asserts [  pop  ]';
            state.push_fn(set_production /*49*/, 49);
            '"--LEAF--"';
            '49:163 state_ir__sequence_instruction=>• τpop θnum';
            consume(state);
            scan(state.lexer, 115, 6);
            if ((state.lexer._type == 5)) {
                consume(state);
                add_reduce(state, 2, 76);
                return 0;
            };
            return - 1;
        } else if (state.lexer._type == 73) {
            'Asserts [  pass  ]';
            state.push_fn(set_production /*49*/, 49);
            '"--LEAF--"';
            '49:166 state_ir__sequence_instruction=>• τpass';
            consume(state);
            add_reduce(state, 1, 79);
            return 0;
        } else if (state.lexer._type == 74) {
            'Asserts [  end  ]';
            state.push_fn(set_production /*49*/, 49);
            '"--LEAF--"';
            '49:167 state_ir__sequence_instruction=>• τend';
            consume(state);
            add_reduce(state, 1, 79);
            return 0;
        } else if (state.lexer._type == 75) {
            'Asserts [  fail  ]';
            state.push_fn(set_production /*49*/, 49);
            '"--LEAF--"';
            '49:168 state_ir__sequence_instruction=>• τfail';
            consume(state);
            add_reduce(state, 1, 80);
            return 0;
        };
        return - 1;
    }

    function hc_state_ir__state_reference(state, db, prod) {
        scan(state.lexer, 123, 6);
        'offset 0 peek_level-1 [  state  ]';
        '50:174 state_ir__state_reference=>• τstate τ[ τ& symbols__imported_production_symbol τ]';
        '50:175 state_ir__state_reference=>• τstate τ[ tk:state_ir__state_hash_token τ]';
        '50:176 state_ir__state_reference=>• τstate τ[ τ& symbols__production_symbol τ]';
        if (state.lexer._type == 76) {
            'Assert Consume [  state  ]';
            consume(state);
            'offset 1 peek_level-1 [  [  ]';
            '50:174 state_ir__state_reference=>τstate • τ[ τ& symbols__imported_production_symbol τ]';
            '50:175 state_ir__state_reference=>τstate • τ[ tk:state_ir__state_hash_token τ]';
            '50:176 state_ir__state_reference=>τstate • τ[ τ& symbols__production_symbol τ]';
            scan(state.lexer, 109, 6);
            if (state.lexer._type == 32) {
                'Assert Consume [  [  ]';
                consume(state);
                'offset 2 peek_level0 [  & 44  ]';
                '50:174 state_ir__state_reference=>τstate τ[ • τ& symbols__imported_production_symbol τ]';
                '50:176 state_ir__state_reference=>τstate τ[ • τ& symbols__production_symbol τ]';
                '50:175 state_ir__state_reference=>τstate τ[ • tk:state_ir__state_hash_token τ]';
                scan(state.lexer, 124, 6);
                if (state.lexer._type == 77) {
                    'Asserts [  &  ]';
                    consume(state);
                    '"⤋⤋⤋  post-peek-consume ⤋⤋⤋"';
                    'offset 4 peek_level-1 [  &  ]';
                    '50:174 state_ir__state_reference=>τstate τ[ • τ& symbols__imported_production_symbol τ]';
                    '50:176 state_ir__state_reference=>τstate τ[ • τ& symbols__production_symbol τ]';
                    'offset 5 peek_level0 [  9  ]';
                    '50:174 state_ir__state_reference=>τstate τ[ τ& • symbols__imported_production_symbol τ]';
                    '50:176 state_ir__state_reference=>τstate τ[ τ& • symbols__production_symbol τ]';
                    scan(state.lexer, 8, 4);
                    if (state.lexer._type == 13) {
                        'Asserts [  9  ]';
                        var fk1 = state.fork(db);;
                        fk1.push_fn(branch_a488e9b02a9b1910, 50);
                        state.push_fn(branch_b25ed08297926a1e, 50);
                        return 0;
                    }
                } else if (state.lexer._type == 56) {
                    'Asserts [  44  ]';
                    state.push_fn(set_production /*50*/, 50);
                    '"--LEAF--"';
                    '50:175 state_ir__state_reference=>τstate τ[ • tk:state_ir__state_hash_token τ]';
                    consume(state);
                    scan(state.lexer, 9, 6);
                    if ((state.lexer._type == 33)) {
                        consume(state);
                        add_reduce(state, 4, 83);
                        return 0;
                    };
                    return - 1;
                }
            }
        };
        return - 1;
    }

    function hc_state_ir__token_id_list(state, db, prod) {
        scan(state.lexer, 109, 6);
        'offset 0 peek_level-1 [  [  ]';
        '51:177 state_ir__token_id_list=>• τ[ state_ir__token_id_list_list_399 τ]';
        if (state.lexer._type == 32) {
            'Assert Consume [  [  ]';
            consume(state);
            '"--LEAF--"';
            '51:177 state_ir__token_id_list=>τ[ • state_ir__token_id_list_list_399 τ]';
            scan(state.lexer, 125, 6);
            if ((state.lexer._type == 5 || state.lexer._type == 12 || state.lexer._type == 15 || state.lexer._type == 16)) {
                state.push_fn(branch_a9fc09dafb3fa9e1, 51);
                return hc_state_ir__token_id_list_list_399(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_state_ir__goto_instruction(state, db, prod) {
        scan(state.lexer, 25, 6);
        'offset 0 peek_level-1 [  goto  ]';
        '52:178 state_ir__goto_instruction=>• τgoto state_ir__state_reference';
        if (state.lexer._type == 78) {
            'Assert Consume [  goto  ]';
            consume(state);
            '"--LEAF--"';
            '52:178 state_ir__goto_instruction=>τgoto • state_ir__state_reference';
            scan(state.lexer, 123, 6);
            if ((state.lexer._type == 76)) {
                state.push_fn(branch_8ff4bf833a84b2ba, 52);
                return hc_state_ir__state_reference(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_state_ir__token_branch_instruction(state, db, prod) {
        scan(state.lexer, 126, 6);
        'offset 0 peek_level-1 [  noconsume consume peek assert  ]';
        '53:179 state_ir__token_branch_instruction=>• τnoconsume state_ir__token_id_list τ( state_ir__instruction_sequence τ)';
        '53:180 state_ir__token_branch_instruction=>• τconsume state_ir__token_id_list τ( state_ir__instruction_sequence τ)';
        '53:181 state_ir__token_branch_instruction=>• τpeek state_ir__token_id_list τ( state_ir__instruction_sequence τ)';
        '53:182 state_ir__token_branch_instruction=>• τassert state_ir__token_id_list τ( state_ir__instruction_sequence τ)';
        if (state.lexer._type == 79) {
            'Asserts [  noconsume  ]';
            state.push_fn(set_production /*53*/, 53);
            '"--LEAF--"';
            '53:179 state_ir__token_branch_instruction=>• τnoconsume state_ir__token_id_list τ( state_ir__instruction_sequence τ)';
            consume(state);
            state.push_fn(branch_ee807c5db31c9cae, 53);
            return hc_state_ir__token_id_list(state, db, 0);
        } else if (state.lexer._type == 80) {
            'Asserts [  consume  ]';
            state.push_fn(set_production /*53*/, 53);
            '"--LEAF--"';
            '53:180 state_ir__token_branch_instruction=>• τconsume state_ir__token_id_list τ( state_ir__instruction_sequence τ)';
            consume(state);
            state.push_fn(branch_401b738c9e1d5522, 53);
            return hc_state_ir__token_id_list(state, db, 0);
        } else if (state.lexer._type == 81) {
            'Asserts [  peek  ]';
            state.push_fn(set_production /*53*/, 53);
            '"--LEAF--"';
            '53:181 state_ir__token_branch_instruction=>• τpeek state_ir__token_id_list τ( state_ir__instruction_sequence τ)';
            consume(state);
            state.push_fn(branch_d86f42b4b027bc9e, 53);
            return hc_state_ir__token_id_list(state, db, 0);
        } else if (state.lexer._type == 82) {
            'Asserts [  assert  ]';
            state.push_fn(set_production /*53*/, 53);
            '"--LEAF--"';
            '53:182 state_ir__token_branch_instruction=>• τassert state_ir__token_id_list τ( state_ir__instruction_sequence τ)';
            consume(state);
            state.push_fn(branch_ba5f75631cc56b1f, 53);
            return hc_state_ir__token_id_list(state, db, 0);
        };
        return - 1;
    }

    function hc_state_ir__on_fail(state, db, prod) {
        scan(state.lexer, 12, 6);
        'offset 0 peek_level-1 [  on  ]';
        '54:183 state_ir__on_fail=>• τon τfail state_ir__state_declaration state_ir__top_level_instructions state_ir__on_fail state_ir__expected_symbols';
        '54:184 state_ir__on_fail=>• τon τfail state_ir__state_declaration state_ir__top_level_instructions state_ir__expected_symbols';
        '54:185 state_ir__on_fail=>• τon τfail state_ir__state_declaration state_ir__top_level_instructions state_ir__on_fail';
        '54:186 state_ir__on_fail=>• τon τfail state_ir__state_declaration state_ir__top_level_instructions';
        if (state.lexer._type == 58) {
            'Assert Consume [  on  ]';
            consume(state);
            'offset 1 peek_level-1 [  fail  ]';
            '54:183 state_ir__on_fail=>τon • τfail state_ir__state_declaration state_ir__top_level_instructions state_ir__on_fail state_ir__expected_symbols';
            '54:184 state_ir__on_fail=>τon • τfail state_ir__state_declaration state_ir__top_level_instructions state_ir__expected_symbols';
            '54:185 state_ir__on_fail=>τon • τfail state_ir__state_declaration state_ir__top_level_instructions state_ir__on_fail';
            '54:186 state_ir__on_fail=>τon • τfail state_ir__state_declaration state_ir__top_level_instructions';
            scan(state.lexer, 127, 6);
            if (state.lexer._type == 75) {
                'Assert Consume [  fail  ]';
                consume(state);
                'offset 2 peek_level-1 [  55  ]';
                '54:183 state_ir__on_fail=>τon τfail • state_ir__state_declaration state_ir__top_level_instructions state_ir__on_fail state_ir__expected_symbols';
                '54:184 state_ir__on_fail=>τon τfail • state_ir__state_declaration state_ir__top_level_instructions state_ir__expected_symbols';
                '54:185 state_ir__on_fail=>τon τfail • state_ir__state_declaration state_ir__top_level_instructions state_ir__on_fail';
                '54:186 state_ir__on_fail=>τon τfail • state_ir__state_declaration state_ir__top_level_instructions';
                scan(state.lexer, 123, 6);
                state.push_fn(branch_c14a9e71a86dbbda, 0);
                return hc_state_ir__state_declaration(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_state_ir__state_declaration(state, db, prod) {
        scan(state.lexer, 123, 6);
        'offset 0 peek_level-1 [  state  ]';
        '55:187 state_ir__state_declaration=>• τstate τ[ tk:state_ir__state_hash_token τ]';
        if (state.lexer._type == 76) {
            'Assert Consume [  state  ]';
            consume(state);
            '"--LEAF--"';
            '55:187 state_ir__state_declaration=>τstate • τ[ tk:state_ir__state_hash_token τ]';
            scan(state.lexer, 109, 6);
            if ((state.lexer._type == 32)) {
                consume(state);
                scan(state.lexer, 128, 6);
                if ((state.lexer._type == 56)) {
                    consume(state);
                    scan(state.lexer, 9, 6);
                    if ((state.lexer._type == 33)) {
                        consume(state);
                        add_reduce(state, 4, 83);
                        return 55;
                    }
                }
            }
        };
        return - 1;
    }

    function hc_state_ir__expected_symbols(state, db, prod) {
        scan(state.lexer, 129, 6);
        'offset 0 peek_level-1 [  symbols:  ]';
        '56:188 state_ir__expected_symbols=>• τsymbols: τexpected state_ir__token_id_list state_ir__expected_symbols_group_436_0_';
        '56:189 state_ir__expected_symbols=>• τsymbols: τexpected state_ir__token_id_list';
        if (state.lexer._type == 83) {
            'Assert Consume [  symbols:  ]';
            consume(state);
            'offset 1 peek_level-1 [  expected  ]';
            '56:188 state_ir__expected_symbols=>τsymbols: • τexpected state_ir__token_id_list state_ir__expected_symbols_group_436_0_';
            '56:189 state_ir__expected_symbols=>τsymbols: • τexpected state_ir__token_id_list';
            scan(state.lexer, 28, 6);
            if (state.lexer._type == 84) {
                'Assert Consume [  expected  ]';
                consume(state);
                'offset 2 peek_level-1 [  51  ]';
                '56:188 state_ir__expected_symbols=>τsymbols: τexpected • state_ir__token_id_list state_ir__expected_symbols_group_436_0_';
                '56:189 state_ir__expected_symbols=>τsymbols: τexpected • state_ir__token_id_list';
                scan(state.lexer, 109, 6);
                state.push_fn(branch_9c37f19f0739448e, 0);
                return hc_state_ir__token_id_list(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_state_ir__state_ir(state, db, prod) {
        'offset 0 peek_level-1 [  55  ]';
        '57:190 state_ir__state_ir=>• state_ir__state_declaration state_ir__top_level_instructions state_ir__on_fail state_ir__expected_symbols';
        '57:191 state_ir__state_ir=>• state_ir__state_declaration state_ir__top_level_instructions state_ir__expected_symbols';
        '57:192 state_ir__state_ir=>• state_ir__state_declaration state_ir__top_level_instructions state_ir__on_fail';
        '57:193 state_ir__state_ir=>• state_ir__state_declaration state_ir__top_level_instructions';
        state.push_fn(branch_95bfe6112c5b65ef, 0);
        return hc_state_ir__state_declaration(state, db, 0);
    }

    function hc_state_ir__comment_list_6(state, db, prod) {
        scan(state.lexer, 14, 0);
        'offset 0 peek_level-1 [  sym sp nl id num  ]';
        '58:194 state_ir__comment_list_6=>• θsym';
        '58:196 state_ir__comment_list_6=>• θsp';
        '58:197 state_ir__comment_list_6=>• θnl';
        '58:198 state_ir__comment_list_6=>• θid';
        '58:199 state_ir__comment_list_6=>• θnum';
        if (state.lexer._type == 2) {
            'Asserts [  sym  ]';
            state.push_fn(hc_state_ir__comment_list_6_goto /*hc_state_ir__comment_list_6_goto( state, db, 58 )*/, 58);
            '"--LEAF--"';
            '58:194 state_ir__comment_list_6=>• θsym';
            consume(state);
            add_reduce(state, 1, 3);
            return 0;
        } else if (state.lexer._type == 8) {
            'Asserts [  sp  ]';
            state.push_fn(hc_state_ir__comment_list_6_goto /*hc_state_ir__comment_list_6_goto( state, db, 58 )*/, 58);
            '"--LEAF--"';
            '58:196 state_ir__comment_list_6=>• θsp';
            consume(state);
            add_reduce(state, 1, 3);
            return 0;
        } else if (state.lexer._type == 7) {
            'Asserts [  nl  ]';
            state.push_fn(hc_state_ir__comment_list_6_goto /*hc_state_ir__comment_list_6_goto( state, db, 58 )*/, 58);
            '"--LEAF--"';
            '58:197 state_ir__comment_list_6=>• θnl';
            consume(state);
            add_reduce(state, 1, 3);
            return 0;
        } else if (state.lexer._type == 3) {
            'Asserts [  id  ]';
            state.push_fn(hc_state_ir__comment_list_6_goto /*hc_state_ir__comment_list_6_goto( state, db, 58 )*/, 58);
            '"--LEAF--"';
            '58:198 state_ir__comment_list_6=>• θid';
            consume(state);
            add_reduce(state, 1, 3);
            return 0;
        } else if (state.lexer._type == 5) {
            'Asserts [  num  ]';
            state.push_fn(hc_state_ir__comment_list_6_goto /*hc_state_ir__comment_list_6_goto( state, db, 58 )*/, 58);
            '"--LEAF--"';
            '58:199 state_ir__comment_list_6=>• θnum';
            consume(state);
            add_reduce(state, 1, 3);
            return 0;
        };
        return - 1;
    }

    function hc_state_ir__comment_list_6_goto(state, db, prod) {
        'offset 1 peek_level-1 [  */ sym sp nl id num  ]';
        '58:195 state_ir__comment_list_6=>state_ir__comment_list_6 • θsym';
        '58:200 state_ir__comment_list_6=>state_ir__comment_list_6 • θsp';
        '58:201 state_ir__comment_list_6=>state_ir__comment_list_6 • θnl';
        '58:202 state_ir__comment_list_6=>state_ir__comment_list_6 • θid';
        '58:203 state_ir__comment_list_6=>state_ir__comment_list_6 • θnum';
        '2:3 state_ir__comment=>τ/* state_ir__comment_list_6 • τ*/';
        scan(state.lexer, 46, 0);
        if (state.lexer._type == 2) {
            'Asserts [  sym  ]';
            state.push_fn(hc_state_ir__comment_list_6_goto /*hc_state_ir__comment_list_6_goto( state, db, 58 )*/, 58);
            '"--LEAF--"';
            '58:195 state_ir__comment_list_6=>state_ir__comment_list_6 • θsym';
            scan(state.lexer, 130, 4);
            consume(state);
            add_reduce(state, 2, 4);
            return 0;
        } else if (state.lexer._type == 8) {
            'Asserts [  sp  ]';
            state.push_fn(hc_state_ir__comment_list_6_goto /*hc_state_ir__comment_list_6_goto( state, db, 58 )*/, 58);
            '"--LEAF--"';
            '58:200 state_ir__comment_list_6=>state_ir__comment_list_6 • θsp';
            scan(state.lexer, 4, 15);
            consume(state);
            add_reduce(state, 2, 4);
            return 0;
        } else if (state.lexer._type == 7) {
            'Asserts [  nl  ]';
            state.push_fn(hc_state_ir__comment_list_6_goto /*hc_state_ir__comment_list_6_goto( state, db, 58 )*/, 58);
            '"--LEAF--"';
            '58:201 state_ir__comment_list_6=>state_ir__comment_list_6 • θnl';
            scan(state.lexer, 4, 34);
            consume(state);
            add_reduce(state, 2, 4);
            return 0;
        } else if (state.lexer._type == 3) {
            'Asserts [  id  ]';
            state.push_fn(hc_state_ir__comment_list_6_goto /*hc_state_ir__comment_list_6_goto( state, db, 58 )*/, 58);
            '"--LEAF--"';
            '58:202 state_ir__comment_list_6=>state_ir__comment_list_6 • θid';
            scan(state.lexer, 22, 4);
            consume(state);
            add_reduce(state, 2, 4);
            return 0;
        } else if (state.lexer._type == 5) {
            'Asserts [  num  ]';
            state.push_fn(hc_state_ir__comment_list_6_goto /*hc_state_ir__comment_list_6_goto( state, db, 58 )*/, 58);
            '"--LEAF--"';
            '58:203 state_ir__comment_list_6=>state_ir__comment_list_6 • θnum';
            scan(state.lexer, 131, 4);
            consume(state);
            add_reduce(state, 2, 4);
            return 0;
        };
        return (prod == 58) ? prod : - 1;
    }

    function hc_symbols__literal_symbol_list_47(state, db, prod) {
        scan(state.lexer, 57, 4);
        'offset 0 peek_level-1 [  num id  ]';
        '59:204 symbols__literal_symbol_list_47=>• θnum';
        '59:206 symbols__literal_symbol_list_47=>• θid';
        if (state.lexer._type == 5) {
            'Asserts [  num  ]';
            state.push_fn(hc_symbols__literal_symbol_list_47_goto /*hc_symbols__literal_symbol_list_47_goto( state, db, 59 )*/, 59);
            '"--LEAF--"';
            '59:204 symbols__literal_symbol_list_47=>• θnum';
            consume(state);
            add_reduce(state, 1, 99);
            return 0;
        } else if (state.lexer._type == 3) {
            'Asserts [  id  ]';
            state.push_fn(hc_symbols__literal_symbol_list_47_goto /*hc_symbols__literal_symbol_list_47_goto( state, db, 59 )*/, 59);
            '"--LEAF--"';
            '59:206 symbols__literal_symbol_list_47=>• θid';
            consume(state);
            add_reduce(state, 1, 99);
            return 0;
        };
        return - 1;
    }

    function hc_symbols__literal_symbol_list_47_goto(state, db, prod) {
        while (true) {
            switch (prod) {
                case 59:
                    {
                        'offset 1 peek_level0 [  id hybrid-64513[[then]literal  [id]generated] num sp END_OF_FILE nl } { sym g: t: f:s $eof ) on symbols: > ] (+ (* ? [ <= ?= ( (EXC (ERR (IGN (RST (RED tk: f: | # <[ <> +> END_OF_PRODUCTION 9 then  ]';
                        '59:205 symbols__literal_symbol_list_47=>symbols__literal_symbol_list_47 • θnum';
                        '10:25 symbols__literal_symbol=>τt: symbols__literal_symbol_list_47 •';
                        '59:207 symbols__literal_symbol_list_47=>symbols__literal_symbol_list_47 • θid';
                        '10:24 symbols__literal_symbol=>τt: symbols__literal_symbol_list_47 • symbols__sym_delimiter';
                        scan(state.lexer, 35, 0);
                        if (state.lexer._type == 3 || state.lexer._type == 64513 || state.lexer._type == 60) {
                            'Asserts [  id hybrid-64513[[then]literal  [id]generated]  ]';
                            'offset 1 peek_level1 [  sp END_OF_FILE nl g: t: f:s tk: ) (+ (* ? [ <= ?= ( sym (EXC (ERR (IGN (RST (RED $eof f: | # <[ <> +> ] num hybrid-64513[[then]literal  [id]generated] on symbols: > } { id END_OF_PRODUCTION  ]';
                            '59:207 symbols__literal_symbol_list_47=>symbols__literal_symbol_list_47 • θid';
                            var pk = state.lexer.copy_in_place();;
                            pk.next();
                            scan(pk, 36, 0);
                            if (isTokenActive(pk._type, 36)) {
                                'Asserts [  sp END_OF_FILE nl g: t: f:s tk: ) (+ (* ? [ <= ?= ( sym (EXC (ERR (IGN (RST (RED $eof f: | # <[ <> +> ] num hybrid-64513[[then]literal  [id]generated] on symbols: > } { id END_OF_PRODUCTION  ]';
                                state.lexer._type = 3;
                                state.push_fn(hc_symbols__literal_symbol_list_47_goto /*hc_symbols__literal_symbol_list_47_goto( state, db, 59 )*/, 59);
                                '"--LEAF--"';
                                '59:207 symbols__literal_symbol_list_47=>symbols__literal_symbol_list_47 • θid';
                                scan(state.lexer, 22, 4);
                                consume(state);
                                add_reduce(state, 2, 7);
                                return 0;
                            }
                        } else if (state.lexer._type == 5) {
                            'Asserts [  num  ]';
                            'offset 1 peek_level1 [  sp END_OF_FILE nl g: t: f:s tk: ) (+ (* ? [ <= ?= ( sym (EXC (ERR (IGN (RST (RED $eof f: | # <[ <> +> ] num hybrid-64513[[then]literal  [id]generated] on symbols: > } { id END_OF_PRODUCTION  ]';
                            '59:205 symbols__literal_symbol_list_47=>symbols__literal_symbol_list_47 • θnum';
                            var pk = state.lexer.copy_in_place();;
                            pk.next();
                            scan(pk, 36, 0);
                            if (isTokenActive(pk._type, 36)) {
                                'Asserts [  sp END_OF_FILE nl g: t: f:s tk: ) (+ (* ? [ <= ?= ( sym (EXC (ERR (IGN (RST (RED $eof f: | # <[ <> +> ] num hybrid-64513[[then]literal  [id]generated] on symbols: > } { id END_OF_PRODUCTION  ]';
                                state.lexer._type = 5;
                                state.push_fn(hc_symbols__literal_symbol_list_47_goto /*hc_symbols__literal_symbol_list_47_goto( state, db, 59 )*/, 59);
                                '"--LEAF--"';
                                '59:205 symbols__literal_symbol_list_47=>symbols__literal_symbol_list_47 • θnum';
                                scan(state.lexer, 131, 4);
                                consume(state);
                                add_reduce(state, 2, 7);
                                return 0;
                            }
                        } else if (state.lexer._type == 8 || state.lexer._type == 1 || state.lexer._type == 7) {
                            'Asserts [  sp END_OF_FILE nl  ]';
                            '"--LEAF--"';
                            '"--leafy--"';
                            return 59;
                        }
                    }
                    break;
                default:
                    break;
            };
            break;
        };
        return (prod == 59) ? prod : - 1;
    }

    function hc_symbols__escaped_symbol_list_53(state, db, prod) {
        scan(state.lexer, 14, 4);
        'offset 0 peek_level-1 [  num id sym  ]';
        '60:208 symbols__escaped_symbol_list_53=>• θnum';
        '60:210 symbols__escaped_symbol_list_53=>• θid';
        '60:211 symbols__escaped_symbol_list_53=>• θsym';
        if (state.lexer._type == 5) {
            'Asserts [  num  ]';
            state.push_fn(hc_symbols__escaped_symbol_list_53_goto /*hc_symbols__escaped_symbol_list_53_goto( state, db, 60 )*/, 60);
            '"--LEAF--"';
            '60:208 symbols__escaped_symbol_list_53=>• θnum';
            consume(state);
            add_reduce(state, 1, 99);
            return 0;
        } else if (state.lexer._type == 3) {
            'Asserts [  id  ]';
            state.push_fn(hc_symbols__escaped_symbol_list_53_goto /*hc_symbols__escaped_symbol_list_53_goto( state, db, 60 )*/, 60);
            '"--LEAF--"';
            '60:210 symbols__escaped_symbol_list_53=>• θid';
            consume(state);
            add_reduce(state, 1, 99);
            return 0;
        } else if (state.lexer._type == 2) {
            'Asserts [  sym  ]';
            state.push_fn(hc_symbols__escaped_symbol_list_53_goto /*hc_symbols__escaped_symbol_list_53_goto( state, db, 60 )*/, 60);
            '"--LEAF--"';
            '60:211 symbols__escaped_symbol_list_53=>• θsym';
            consume(state);
            add_reduce(state, 1, 99);
            return 0;
        };
        return - 1;
    }

    function hc_symbols__escaped_symbol_list_53_goto(state, db, prod) {
        'offset 1 peek_level-1 [  num id sym sp END_OF_FILE nl  ]';
        '60:209 symbols__escaped_symbol_list_53=>symbols__escaped_symbol_list_53 • θnum';
        '60:212 symbols__escaped_symbol_list_53=>symbols__escaped_symbol_list_53 • θid';
        '60:213 symbols__escaped_symbol_list_53=>symbols__escaped_symbol_list_53 • θsym';
        '12:29 symbols__escaped_symbol=>τf:s symbols__escaped_symbol_list_53 • symbols__sym_delimiter';
        scan(state.lexer, 132, 0);
        if (state.lexer._type == 5) {
            'Asserts [  num  ]';
            state.push_fn(hc_symbols__escaped_symbol_list_53_goto /*hc_symbols__escaped_symbol_list_53_goto( state, db, 60 )*/, 60);
            '"--LEAF--"';
            '60:209 symbols__escaped_symbol_list_53=>symbols__escaped_symbol_list_53 • θnum';
            scan(state.lexer, 131, 4);
            consume(state);
            add_reduce(state, 2, 7);
            return 0;
        } else if (state.lexer._type == 3) {
            'Asserts [  id  ]';
            state.push_fn(hc_symbols__escaped_symbol_list_53_goto /*hc_symbols__escaped_symbol_list_53_goto( state, db, 60 )*/, 60);
            '"--LEAF--"';
            '60:212 symbols__escaped_symbol_list_53=>symbols__escaped_symbol_list_53 • θid';
            scan(state.lexer, 22, 4);
            consume(state);
            add_reduce(state, 2, 7);
            return 0;
        } else if (state.lexer._type == 2) {
            'Asserts [  sym  ]';
            state.push_fn(hc_symbols__escaped_symbol_list_53_goto /*hc_symbols__escaped_symbol_list_53_goto( state, db, 60 )*/, 60);
            '"--LEAF--"';
            '60:213 symbols__escaped_symbol_list_53=>symbols__escaped_symbol_list_53 • θsym';
            scan(state.lexer, 130, 4);
            consume(state);
            add_reduce(state, 2, 7);
            return 0;
        };
        return (prod == 60) ? prod : - 1;
    }

    function hc_preambles__import_preamble_list_58(state, db, prod) {
        scan(state.lexer, 62, 4);
        'offset 0 peek_level-1 [  sym id  ]';
        '61:214 preambles__import_preamble_list_58=>• θsym';
        '61:216 preambles__import_preamble_list_58=>• θid';
        if (state.lexer._type == 2) {
            'Asserts [  sym  ]';
            state.push_fn(hc_preambles__import_preamble_list_58_goto /*hc_preambles__import_preamble_list_58_goto( state, db, 61 )*/, 61);
            '"--LEAF--"';
            '61:214 preambles__import_preamble_list_58=>• θsym';
            consume(state);
            add_reduce(state, 1, 99);
            return 0;
        } else if (state.lexer._type == 3) {
            'Asserts [  id  ]';
            state.push_fn(hc_preambles__import_preamble_list_58_goto /*hc_preambles__import_preamble_list_58_goto( state, db, 61 )*/, 61);
            '"--LEAF--"';
            '61:216 preambles__import_preamble_list_58=>• θid';
            consume(state);
            add_reduce(state, 1, 99);
            return 0;
        };
        return - 1;
    }

    function hc_preambles__import_preamble_list_58_goto(state, db, prod) {
        'offset 1 peek_level-1 [  as AS sym id  ]';
        '61:215 preambles__import_preamble_list_58=>preambles__import_preamble_list_58 • θsym';
        '61:217 preambles__import_preamble_list_58=>preambles__import_preamble_list_58 • θid';
        '14:31 preambles__import_preamble=>τ@IMPORT preambles__import_preamble_list_58 • τas symbols__identifier';
        '14:32 preambles__import_preamble=>τ@IMPORT preambles__import_preamble_list_58 • τAS symbols__identifier';
        scan(state.lexer, 133, 4);
        if (state.lexer._type == 2) {
            'Asserts [  sym  ]';
            state.push_fn(hc_preambles__import_preamble_list_58_goto /*hc_preambles__import_preamble_list_58_goto( state, db, 61 )*/, 61);
            '"--LEAF--"';
            '61:215 preambles__import_preamble_list_58=>preambles__import_preamble_list_58 • θsym';
            scan(state.lexer, 130, 4);
            consume(state);
            add_reduce(state, 2, 7);
            return 0;
        } else if (state.lexer._type == 3) {
            'Asserts [  id  ]';
            state.push_fn(hc_preambles__import_preamble_list_58_goto /*hc_preambles__import_preamble_list_58_goto( state, db, 61 )*/, 61);
            '"--LEAF--"';
            '61:217 preambles__import_preamble_list_58=>preambles__import_preamble_list_58 • θid';
            scan(state.lexer, 22, 4);
            consume(state);
            add_reduce(state, 2, 7);
            return 0;
        };
        return (prod == 61) ? prod : - 1;
    }

    function hc_comments__cm_list_92(state, db, prod) {
        '"--LEAF--"';
        '62:218 comments__cm_list_92=>• comments__comment_primitive';
        state.push_fn(branch_bea5d54f7e3b24d4, 62);
        return hc_comments__comment_primitive(state, db, 0);
    }

    function hc_comments__cm_list_92_goto(state, db, prod) {
        'offset 1 peek_level0 [  sym id num sp nl  ]';
        '62:219 comments__cm_list_92=>comments__cm_list_92 • comments__comment_primitive';
        '20:41 comments__cm=>τ# comments__cm_list_92 • comments__comment_delimiter';
        scan(state.lexer, 14, 0);
        if (state.lexer._type == 2 || state.lexer._type == 3 || state.lexer._type == 5 || state.lexer._type == 8) {
            'Asserts [  sym id num sp  ]';
            state.push_fn(hc_comments__cm_list_92_goto /*hc_comments__cm_list_92_goto( state, db, 62 )*/, 62);
            '"--LEAF--"';
            '62:219 comments__cm_list_92=>comments__cm_list_92 • comments__comment_primitive';
            scan(state.lexer, 14, 15);
            if ((state.lexer._type == 2 || state.lexer._type == 3 || state.lexer._type == 5 || state.lexer._type == 8)) {
                state.push_fn(branch_20b33064645a28fc, 62);
                return hc_comments__comment_primitive(state, db, 0);
            };
            return - 1;
        };
        return (prod == 62) ? prod : - 1;
    }

    function hc_productions__production_group_112_0_(state, db, prod) {
        '"--LEAF--"';
        '63:220 productions__production_group_112_0_=>• symbols__production_id';
        state.push_fn(branch_4d0bd102fb74a356, 63);
        return hc_symbols__production_id(state, db, 0);
    }

    function hc_productions__production_group_117_0_(state, db, prod) {
        '"--LEAF--"';
        '64:221 productions__production_group_117_0_=>• symbols__imported_production_symbol';
        state.push_fn(branch_47b4499f6c6cf649, 64);
        return hc_symbols__imported_production_symbol(state, db, 0);
    }

    function hc_production_bodies__body_entry_list_149(state, db, prod) {
        '"--LEAF--"';
        '65:222 production_bodies__body_entry_list_149=>• production_bodies__body_entry';
        state.push_fn(branch_c7bd0ae1f0c85449, 65);
        return hc_production_bodies__body_entry(state, db, 0);
    }

    function hc_production_bodies__body_entry_list_149_goto(state, db, prod) {
        'offset 1 peek_level0 [  ] [ <= ?= ( sym (EXC (ERR (IGN (RST (RED g: 9 tk: t: f:s $eof  ]';
        '65:223 production_bodies__body_entry_list_149=>production_bodies__body_entry_list_149 • production_bodies__body_entry';
        '30:74 production_bodies__body_entry=>τ[ production_bodies__body_entry_list_149 • τ]';
        scan(state.lexer, 134, 4);
        if (isTokenActive(state.lexer._type, 80)) {
            'Asserts [  [ <= ?= ( sym (EXC (ERR (IGN (RST (RED g: 9 tk: t: f:s $eof  ]';
            state.push_fn(hc_production_bodies__body_entry_list_149_goto /*hc_production_bodies__body_entry_list_149_goto( state, db, 65 )*/, 65);
            '"--LEAF--"';
            '65:223 production_bodies__body_entry_list_149=>production_bodies__body_entry_list_149 • production_bodies__body_entry';
            scan(state.lexer, 81, 4);
            if ((isTokenActive(state.lexer._type, 80))) {
                state.push_fn(branch_28ab10e2751570b2, 65);
                return hc_production_bodies__body_entry(state, db, 0);
            };
            return - 1;
        };
        return (prod == 65) ? prod : - 1;
    }

    function hc_functions__referenced_function_group_249_0_(state, db, prod) {
        '"--LEAF--"';
        '66:224 functions__referenced_function_group_249_0_=>• functions__js_function_start_symbol';
        state.push_fn(branch_05de5fcfd2b912d3, 66);
        return hc_functions__js_function_start_symbol(state, db, 0);
    }

    function hc_state_ir__top_level_instructions_list_305(state, db, prod) {
        '"--LEAF--"';
        '67:225 state_ir__top_level_instructions_list_305=>• state_ir__prod_branch_instruction';
        state.push_fn(branch_c9ab92f5f4d4d46e, 67);
        return hc_state_ir__prod_branch_instruction(state, db, 0);
    }

    function hc_state_ir__top_level_instructions_list_305_goto(state, db, prod) {
        while (true) {
            switch (prod) {
                case 67:
                    {
                        'offset 1 peek_level0 [  on symbols: > END_OF_PRODUCTION  ]';
                        '67:226 state_ir__top_level_instructions_list_305=>state_ir__top_level_instructions_list_305 • state_ir__prod_branch_instruction';
                        '45:145 state_ir__top_level_instructions=>state_ir__top_level_instructions_list_305 •';
                        scan(state.lexer, 135, 4);
                        if (state.lexer._type == 58) {
                            'Asserts [  on  ]';
                            'offset 1 peek_level1 [  prod  ]';
                            '67:226 state_ir__top_level_instructions_list_305=>state_ir__top_level_instructions_list_305 • state_ir__prod_branch_instruction';
                            var pk = state.lexer.copy_in_place();;
                            pk.next();
                            scan(pk, 108, 6);
                            if (pk._type == 59) {
                                'Asserts [  prod  ]';
                                state.lexer._type = 58;
                                state.push_fn(hc_state_ir__top_level_instructions_list_305_goto /*hc_state_ir__top_level_instructions_list_305_goto( state, db, 67 )*/, 67);
                                '"--LEAF--"';
                                '67:226 state_ir__top_level_instructions_list_305=>state_ir__top_level_instructions_list_305 • state_ir__prod_branch_instruction';
                                scan(state.lexer, 136, 4);
                                if ((state.lexer._type == 58)) {
                                    state.push_fn(branch_28ab10e2751570b2, 67);
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
        return (prod == 67) ? prod : - 1;
    }

    function hc_state_ir__top_level_instructions_list_306(state, db, prod) {
        '"--LEAF--"';
        '68:227 state_ir__top_level_instructions_list_306=>• state_ir__token_branch_instruction';
        state.push_fn(branch_bd8db0890a0e30bb, 68);
        return hc_state_ir__token_branch_instruction(state, db, 0);
    }

    function hc_state_ir__top_level_instructions_list_306_goto(state, db, prod) {
        while (true) {
            switch (prod) {
                case 68:
                    {
                        'offset 1 peek_level0 [  noconsume consume peek assert on symbols: > END_OF_PRODUCTION  ]';
                        '68:228 state_ir__top_level_instructions_list_306=>state_ir__top_level_instructions_list_306 • state_ir__token_branch_instruction';
                        '45:146 state_ir__top_level_instructions=>state_ir__top_level_instructions_list_306 •';
                        scan(state.lexer, 137, 4);
                        if (state.lexer._type == 79 || state.lexer._type == 80 || state.lexer._type == 81 || state.lexer._type == 82) {
                            'Asserts [  noconsume consume peek assert  ]';
                            state.push_fn(hc_state_ir__top_level_instructions_list_306_goto /*hc_state_ir__top_level_instructions_list_306_goto( state, db, 68 )*/, 68);
                            '"--LEAF--"';
                            '68:228 state_ir__top_level_instructions_list_306=>state_ir__top_level_instructions_list_306 • state_ir__token_branch_instruction';
                            scan(state.lexer, 138, 4);
                            if ((state.lexer._type == 79 || state.lexer._type == 80 || state.lexer._type == 81 || state.lexer._type == 82)) {
                                state.push_fn(branch_28ab10e2751570b2, 68);
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
        return (prod == 68) ? prod : - 1;
    }

    function hc_state_ir__production_id_list_list_315(state, db, prod) {
        scan(state.lexer, 118, 4);
        'offset 0 peek_level0 [  9 num  ]';
        '69:229 state_ir__production_id_list_list_315=>• symbols__imported_production_symbol';
        '69:232 state_ir__production_id_list_list_315=>• symbols__production_symbol';
        '69:231 state_ir__production_id_list_list_315=>• state_ir__sequence_instruction_group_363_0_';
        if (state.lexer._type == 13) {
            'Asserts [  9  ]';
            consume(state);
            '"⤋⤋⤋  post-peek-consume ⤋⤋⤋"';
            'offset 2 peek_level-1 [  9  ]';
            '17:38 symbols__imported_production_symbol=>• tk:symbols__identifier_syms τ:: tk:symbols__identifier_syms';
            '18:39 symbols__production_symbol=>• tk:symbols__identifier_syms';
            'offset 3 peek_level-1 [  :: ] AS as hybrid-50177[[then]literal  [9]production_token] ) on symbols: > (+ (* ? [ <= ?= ( sym (EXC (ERR (IGN (RST (RED g: tk: t: f:s $eof f: | # <[ <> +> END_OF_PRODUCTION 9 num END_OF_FILE then  ]';
            '17:38 symbols__imported_production_symbol=>tk:symbols__identifier_syms • τ:: tk:symbols__identifier_syms';
            '18:39 symbols__production_symbol=>tk:symbols__identifier_syms •';
            scan(state.lexer, 85, 4);
            if (state.lexer._type == 22) {
                'Asserts [  ::  ]';
                state.push_fn(hc_state_ir__production_id_list_list_315_goto /*hc_state_ir__production_id_list_list_315_goto( state, db, 69 )*/, 69);
                '"--LEAF--"';
                '17:38 symbols__imported_production_symbol=>tk:symbols__identifier_syms • τ:: tk:symbols__identifier_syms';
                consume(state);
                scan(state.lexer, 8, 4);
                if ((state.lexer._type == 13)) {
                    consume(state);
                    add_reduce(state, 3, 13);
                    add_reduce(state, 1, 3);
                    return 0;
                };
                return - 1;
            } else {
                '"--LEAF--"';
                '18:39 symbols__production_symbol=>tk:symbols__identifier_syms •';
                add_reduce(state, 1, 14);
                add_reduce(state, 1, 3);
                return hc_state_ir__production_id_list_list_315_goto(state, db, 69);
            }
        } else {
            state.push_fn(hc_state_ir__production_id_list_list_315_goto /*hc_state_ir__production_id_list_list_315_goto( state, db, 69 )*/, 69);
            '"--LEAF--"';
            '69:231 state_ir__production_id_list_list_315=>• state_ir__sequence_instruction_group_363_0_';
            state.push_fn(branch_232f37efe656dae6, 69);
            return hc_state_ir__sequence_instruction_group_363_0_(state, db, 0);
        };
        return - 1;
    }

    function hc_state_ir__production_id_list_list_315_goto(state, db, prod) {
        'offset 1 peek_level0 [  ] 9 num  ]';
        '69:230 state_ir__production_id_list_list_315=>state_ir__production_id_list_list_315 • symbols__imported_production_symbol';
        '69:234 state_ir__production_id_list_list_315=>state_ir__production_id_list_list_315 • symbols__production_symbol';
        '69:233 state_ir__production_id_list_list_315=>state_ir__production_id_list_list_315 • state_ir__sequence_instruction_group_363_0_';
        '47:149 state_ir__production_id_list=>τ[ state_ir__production_id_list_list_315 • τ]';
        scan(state.lexer, 139, 4);
        if (state.lexer._type == 13) {
            'Asserts [  9  ]';
            var fk1 = state.fork(db);;
            fk1.push_fn(branch_dd22dbb555230aa1, 69);
            state.push_fn(branch_1f45de351d4e007f, 69);
            return 0;
        } else if (state.lexer._type == 5) {
            'Asserts [  num  ]';
            state.push_fn(hc_state_ir__production_id_list_list_315_goto /*hc_state_ir__production_id_list_list_315_goto( state, db, 69 )*/, 69);
            '"--LEAF--"';
            '69:233 state_ir__production_id_list_list_315=>state_ir__production_id_list_list_315 • state_ir__sequence_instruction_group_363_0_';
            scan(state.lexer, 131, 4);
            if ((state.lexer._type == 5)) {
                state.push_fn(branch_28ab10e2751570b2, 69);
                return hc_state_ir__sequence_instruction_group_363_0_(state, db, 0);
            };
            return - 1;
        };
        return (prod == 69) ? prod : - 1;
    }

    function hc_state_ir__instruction_sequence_list_317(state, db, prod) {
        '"--LEAF--"';
        '70:235 state_ir__instruction_sequence_list_317=>• state_ir__sequence_instruction';
        state.push_fn(branch_7a9a8c52c44448e3, 70);
        return hc_state_ir__sequence_instruction(state, db, 0);
    }

    function hc_state_ir__instruction_sequence_list_317_goto(state, db, prod) {
        while (true) {
            switch (prod) {
                case 70:
                    {
                        'offset 1 peek_level0 [  then ) on symbols: > END_OF_PRODUCTION  ]';
                        '70:236 state_ir__instruction_sequence_list_317=>state_ir__instruction_sequence_list_317 • τthen state_ir__sequence_instruction';
                        '48:150 state_ir__instruction_sequence=>state_ir__instruction_sequence_list_317 • τthen state_ir__instruction_sequence_list_320 state_ir__instruction_sequence_group_321_0_';
                        '48:152 state_ir__instruction_sequence=>state_ir__instruction_sequence_list_317 • state_ir__instruction_sequence_group_321_0_';
                        '48:153 state_ir__instruction_sequence=>state_ir__instruction_sequence_list_317 • τthen state_ir__instruction_sequence_list_320';
                        '48:155 state_ir__instruction_sequence=>state_ir__instruction_sequence_list_317 •';
                        scan(state.lexer, 140, 4);
                        if (state.lexer._type == 60) {
                            'Asserts [  then  ]';
                            'offset 1 peek_level1 [  reduce set fork scan pop pass end fail goto repeat  ]';
                            '70:236 state_ir__instruction_sequence_list_317=>state_ir__instruction_sequence_list_317 • τthen state_ir__sequence_instruction';
                            '48:150 state_ir__instruction_sequence=>state_ir__instruction_sequence_list_317 • τthen state_ir__instruction_sequence_list_320 state_ir__instruction_sequence_group_321_0_';
                            '48:153 state_ir__instruction_sequence=>state_ir__instruction_sequence_list_317 • τthen state_ir__instruction_sequence_list_320';
                            '48:152 state_ir__instruction_sequence=>state_ir__instruction_sequence_list_317 • state_ir__instruction_sequence_group_321_0_';
                            var pk = state.lexer.copy_in_place();;
                            pk.next();
                            scan(pk, 141, 4);
                            if (isTokenActive(pk._type, 112)) {
                                'Asserts [  reduce set fork scan pop pass end fail  ]';
                                state.lexer._type = 60;
                                state.push_fn(hc_state_ir__instruction_sequence_list_317_goto /*hc_state_ir__instruction_sequence_list_317_goto( state, db, 70 )*/, 70);
                                '"--LEAF--"';
                                '70:236 state_ir__instruction_sequence_list_317=>state_ir__instruction_sequence_list_317 • τthen state_ir__sequence_instruction';
                                scan(state.lexer, 142, 4);
                                consume(state);
                                state.push_fn(branch_70d9326e6c9dc217, 70);
                                return hc_state_ir__sequence_instruction(state, db, 0);
                            } else if (pk._type == 78) {
                                'Asserts [  goto  ]';
                                '"--LEAF--"';
                                '"--leafy--"';
                                return 70;
                            }
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

    function hc_state_ir__instruction_sequence_list_320(state, db, prod) {
        '"--LEAF--"';
        '71:237 state_ir__instruction_sequence_list_320=>• state_ir__goto_instruction';
        state.push_fn(branch_ea4fe5a031805a2e, 71);
        return hc_state_ir__goto_instruction(state, db, 0);
    }

    function hc_state_ir__instruction_sequence_list_320_goto(state, db, prod) {
        while (true) {
            switch (prod) {
                case 71:
                    {
                        'offset 1 peek_level0 [  then ) on symbols: > END_OF_PRODUCTION  ]';
                        '71:238 state_ir__instruction_sequence_list_320=>state_ir__instruction_sequence_list_320 • τthen state_ir__goto_instruction';
                        '48:150 state_ir__instruction_sequence=>state_ir__instruction_sequence_list_317 τthen state_ir__instruction_sequence_list_320 • state_ir__instruction_sequence_group_321_0_';
                        '48:151 state_ir__instruction_sequence=>state_ir__instruction_sequence_list_320 • state_ir__instruction_sequence_group_324_0_';
                        '48:153 state_ir__instruction_sequence=>state_ir__instruction_sequence_list_317 τthen state_ir__instruction_sequence_list_320 •';
                        '48:154 state_ir__instruction_sequence=>state_ir__instruction_sequence_list_320 •';
                        scan(state.lexer, 140, 4);
                        if (state.lexer._type == 60) {
                            'Asserts [  then  ]';
                            'offset 1 peek_level1 [  goto repeat  ]';
                            '71:238 state_ir__instruction_sequence_list_320=>state_ir__instruction_sequence_list_320 • τthen state_ir__goto_instruction';
                            '48:150 state_ir__instruction_sequence=>state_ir__instruction_sequence_list_317 τthen state_ir__instruction_sequence_list_320 • state_ir__instruction_sequence_group_321_0_';
                            '48:151 state_ir__instruction_sequence=>state_ir__instruction_sequence_list_320 • state_ir__instruction_sequence_group_324_0_';
                            var pk = state.lexer.copy_in_place();;
                            pk.next();
                            scan(pk, 24, 4);
                            if (pk._type == 78) {
                                'Asserts [  goto  ]';
                                state.lexer._type = 60;
                                state.push_fn(hc_state_ir__instruction_sequence_list_320_goto /*hc_state_ir__instruction_sequence_list_320_goto( state, db, 71 )*/, 71);
                                '"--LEAF--"';
                                '71:238 state_ir__instruction_sequence_list_320=>state_ir__instruction_sequence_list_320 • τthen state_ir__goto_instruction';
                                scan(state.lexer, 142, 4);
                                consume(state);
                                state.push_fn(branch_70d9326e6c9dc217, 71);
                                return hc_state_ir__goto_instruction(state, db, 0);
                            } else if (pk._type == 85) {
                                'Asserts [  repeat  ]';
                                var fk1 = state.fork(db);;
                                fk1.push_fn(branch_00d3d458193febbd, 71);
                                state.push_fn(branch_00d3d458193febbd, 71);
                                return 0;
                            }
                        } else {
                            '"--LEAF--"';
                            '"--leafy--"';
                            return 71;
                        }
                    }
                    break;
                default:
                    break;
            };
            break;
        };
        return (prod == 71) ? prod : - 1;
    }

    function hc_state_ir__instruction_sequence_group_321_0_(state, db, prod) {
        scan(state.lexer, 142, 4);
        'offset 0 peek_level-1 [  then  ]';
        '72:239 state_ir__instruction_sequence_group_321_0_=>• τthen τrepeat τstate';
        if (state.lexer._type == 60) {
            'Assert Consume [  then  ]';
            consume(state);
            '"--LEAF--"';
            '72:239 state_ir__instruction_sequence_group_321_0_=>τthen • τrepeat τstate';
            scan(state.lexer, 143, 4);
            if ((state.lexer._type == 85)) {
                consume(state);
                scan(state.lexer, 144, 4);
                if ((state.lexer._type == 76)) {
                    consume(state);
                    add_reduce(state, 3, 103);
                    return 72;
                }
            }
        };
        return - 1;
    }

    function hc_state_ir__instruction_sequence_group_324_0_(state, db, prod) {
        scan(state.lexer, 142, 4);
        'offset 0 peek_level-1 [  then  ]';
        '73:240 state_ir__instruction_sequence_group_324_0_=>• τthen τrepeat τstate';
        if (state.lexer._type == 60) {
            'Assert Consume [  then  ]';
            consume(state);
            '"--LEAF--"';
            '73:240 state_ir__instruction_sequence_group_324_0_=>τthen • τrepeat τstate';
            scan(state.lexer, 143, 4);
            if ((state.lexer._type == 85)) {
                consume(state);
                scan(state.lexer, 144, 4);
                if ((state.lexer._type == 76)) {
                    consume(state);
                    add_reduce(state, 3, 104);
                    return 73;
                }
            }
        };
        return - 1;
    }

    function hc_state_ir__sequence_instruction_group_343_0_(state, db, prod) {
        scan(state.lexer, 131, 4);
        'offset 0 peek_level-1 [  num  ]';
        '74:241 state_ir__sequence_instruction_group_343_0_=>• θnum';
        if (state.lexer._type == 5) {
            'Assert Consume [  num  ]';
            consume(state);
            '"--LEAF--"';
            '74:241 state_ir__sequence_instruction_group_343_0_=>θnum •';
            scan(state.lexer, 4, 4);
            add_reduce(state, 1, 105);
            return 74;
        };
        return - 1;
    }

    function hc_state_ir__sequence_instruction_list_348(state, db, prod) {
        '"--LEAF--"';
        '75:242 state_ir__sequence_instruction_list_348=>• state_ir__state_reference';
        state.push_fn(branch_ac1450679407f627, 75);
        return hc_state_ir__state_reference(state, db, 0);
    }

    function hc_state_ir__sequence_instruction_list_348_goto(state, db, prod) {
        'offset 1 peek_level-1 [  , )  ]';
        '75:243 state_ir__sequence_instruction_list_348=>state_ir__sequence_instruction_list_348 • τ, state_ir__state_reference';
        '49:161 state_ir__sequence_instruction=>τfork τto τ( state_ir__sequence_instruction_list_348 • τ)';
        scan(state.lexer, 145, 4);
        if (state.lexer._type == 86) {
            'Asserts [  ,  ]';
            state.push_fn(hc_state_ir__sequence_instruction_list_348_goto /*hc_state_ir__sequence_instruction_list_348_goto( state, db, 75 )*/, 75);
            '"--LEAF--"';
            '75:243 state_ir__sequence_instruction_list_348=>state_ir__sequence_instruction_list_348 • τ, state_ir__state_reference';
            scan(state.lexer, 146, 4);
            consume(state);
            state.push_fn(branch_70d9326e6c9dc217, 75);
            return hc_state_ir__state_reference(state, db, 0);
        };
        return (prod == 75) ? prod : - 1;
    }

    function hc_state_ir__sequence_instruction_group_363_0_(state, db, prod) {
        scan(state.lexer, 131, 4);
        'offset 0 peek_level-1 [  num  ]';
        '76:244 state_ir__sequence_instruction_group_363_0_=>• θnum';
        if (state.lexer._type == 5) {
            'Assert Consume [  num  ]';
            consume(state);
            '"--LEAF--"';
            '76:244 state_ir__sequence_instruction_group_363_0_=>θnum •';
            scan(state.lexer, 4, 4);
            add_reduce(state, 1, 105);
            return 76;
        };
        return - 1;
    }

    function hc_state_ir__token_id_list_list_399(state, db, prod) {
        scan(state.lexer, 120, 4);
        'offset 0 peek_level0 [  g: t: f:s num  ]';
        '77:245 state_ir__token_id_list_list_399=>• symbols__terminal_symbol';
        '77:247 state_ir__token_id_list_list_399=>• state_ir__sequence_instruction_group_363_0_';
        if (state.lexer._type == 12 || state.lexer._type == 15 || state.lexer._type == 16) {
            'Asserts [  g: t: f:s  ]';
            state.push_fn(hc_state_ir__token_id_list_list_399_goto /*hc_state_ir__token_id_list_list_399_goto( state, db, 77 )*/, 77);
            '"--LEAF--"';
            '77:245 state_ir__token_id_list_list_399=>• symbols__terminal_symbol';
            state.push_fn(branch_232f37efe656dae6, 77);
            return hc_symbols__terminal_symbol(state, db, 0);
        } else {
            state.push_fn(hc_state_ir__token_id_list_list_399_goto /*hc_state_ir__token_id_list_list_399_goto( state, db, 77 )*/, 77);
            '"--LEAF--"';
            '77:247 state_ir__token_id_list_list_399=>• state_ir__sequence_instruction_group_363_0_';
            state.push_fn(branch_232f37efe656dae6, 77);
            return hc_state_ir__sequence_instruction_group_363_0_(state, db, 0);
        };
        return - 1;
    }

    function hc_state_ir__token_id_list_list_399_goto(state, db, prod) {
        'offset 1 peek_level0 [  g: t: f:s ] num  ]';
        '77:246 state_ir__token_id_list_list_399=>state_ir__token_id_list_list_399 • symbols__terminal_symbol';
        '77:248 state_ir__token_id_list_list_399=>state_ir__token_id_list_list_399 • state_ir__sequence_instruction_group_363_0_';
        '51:177 state_ir__token_id_list=>τ[ state_ir__token_id_list_list_399 • τ]';
        scan(state.lexer, 147, 4);
        if (state.lexer._type == 12 || state.lexer._type == 15 || state.lexer._type == 16) {
            'Asserts [  g: t: f:s  ]';
            state.push_fn(hc_state_ir__token_id_list_list_399_goto /*hc_state_ir__token_id_list_list_399_goto( state, db, 77 )*/, 77);
            '"--LEAF--"';
            '77:246 state_ir__token_id_list_list_399=>state_ir__token_id_list_list_399 • symbols__terminal_symbol';
            scan(state.lexer, 90, 4);
            if ((state.lexer._type == 12 || state.lexer._type == 15 || state.lexer._type == 16)) {
                state.push_fn(branch_28ab10e2751570b2, 77);
                return hc_symbols__terminal_symbol(state, db, 0);
            };
            return - 1;
        } else if (state.lexer._type == 5) {
            'Asserts [  num  ]';
            state.push_fn(hc_state_ir__token_id_list_list_399_goto /*hc_state_ir__token_id_list_list_399_goto( state, db, 77 )*/, 77);
            '"--LEAF--"';
            '77:248 state_ir__token_id_list_list_399=>state_ir__token_id_list_list_399 • state_ir__sequence_instruction_group_363_0_';
            scan(state.lexer, 131, 4);
            if ((state.lexer._type == 5)) {
                state.push_fn(branch_28ab10e2751570b2, 77);
                return hc_state_ir__sequence_instruction_group_363_0_(state, db, 0);
            };
            return - 1;
        };
        return (prod == 77) ? prod : - 1;
    }

    function hc_state_ir__expected_symbols_group_436_0_(state, db, prod) {
        scan(state.lexer, 148, 4);
        'offset 0 peek_level-1 [  skipped  ]';
        '78:249 state_ir__expected_symbols_group_436_0_=>• τskipped state_ir__token_id_list';
        if (state.lexer._type == 87) {
            'Assert Consume [  skipped  ]';
            consume(state);
            '"--LEAF--"';
            '78:249 state_ir__expected_symbols_group_436_0_=>τskipped • state_ir__token_id_list';
            scan(state.lexer, 149, 4);
            if ((state.lexer._type == 32)) {
                state.push_fn(branch_a819b8ad42e11bf0, 78);
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
            case 1: return recognize(resolved_buffer, actual_length, 57, hc_state_ir__state_ir);
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

const reduce_functions = [(_, s) => s[s.length - 1], (env, sym, pos) => ({ type: "hc-grammar-4", preamble: sym[0] || [], ir_states: sym[1].ir || [], productions: sym[1].productions, functions: sym[1].functions || [], imported_grammars: [], meta: null, ignore: [], all_symbols: [], bodies: [] }) /*0*/,
(env, sym, pos) => ({ type: "hc-grammar-4", preamble: null || [], ir_states: sym[0].ir || [], productions: sym[0].productions, functions: sym[0].functions || [], imported_grammars: [], meta: null, ignore: [], all_symbols: [], bodies: [] }) /*1*/,
(env, sym, pos) => ([sym[0]]) /*2*/,
(env, sym, pos) => ((sym[0].push(sym[1]), sym[0])) /*3*/,
(env, sym, pos) => ({ type: "ignore", symbols: sym[1] }) /*4*/,
(env, sym, pos) => ({ type: "generated", val: sym[1], pos: pos, meta: false }) /*5*/,
(env, sym, pos) => (sym[0] + sym[1]) /*6*/,
(env, sym, pos) => ({ type: "exclusive-literal", val: "" + sym[1], pos: pos, meta: false }) /*7*/,
(env, sym, pos) => ({ type: "literal", val: sym[1], pos: pos, meta: false }) /*8*/,
(env, sym, pos) => ({ type: "production_token", name: sym[1], production: null, val: -1, pos: pos, meta: false }) /*9*/,
(env, sym, pos) => ({ type: "import", uri: sym[1], reference: sym[3] }) /*10*/,
(env, sym, pos) => ({ type: "export", production: sym[1], reference: sym[3] }) /*11*/,
(env, sym, pos) => ({ type: "sym-production-import", module: sym[0], production: sym[2], name: "", pos: pos, meta: false }) /*12*/,
(env, sym, pos) => ({ type: "sym-production", name: sym[0], production: null, val: -1, pos: pos, meta: false }) /*13*/,
(env, sym, pos) => ({ type: "comment", value: sym[1] }) /*14*/,
(env, sym, pos) => ({ type: "production-section", functions: [], productions: [sym[0]], ir: [] }) /*15*/,
(env, sym, pos) => ({ type: "production-section", functions: [sym[0]], productions: [], ir: [] }) /*16*/,
(env, sym, pos) => ({ type: "production-section", functions: [], productions: [], ir: [sym[0]] }) /*17*/,
(env, sym, pos) => (sym[0].productions.push(sym[1]), sym[0]) /*18*/,
(env, sym, pos) => (sym[0].functions.push(sym[1]), sym[0]) /*19*/,
(env, sym, pos) => (sym[0].ir.push(sym[1]), sym[0]) /*20*/,
(env, sym, pos) => (sym[0]) /*21*/,
(env, sym, pos) => ({ type: "production", name: sym[2], bodies: sym[4], id: -1, recovery_handler: sym[5], pos: pos, recursion: 0, ROOT_PRODUCTION: !!sym[1] }) /*22*/,
(env, sym, pos) => ({ type: "production-merged-import", name: sym[1], bodies: sym[3], id: -1, recovery_handler: sym[4], ROOT_PRODUCTION: false }) /*23*/,
(env, sym, pos) => ({ type: "production", name: sym[1], bodies: sym[3], id: -1, recovery_handler: sym[4], pos: pos, recursion: 0, ROOT_PRODUCTION: !!null }) /*24*/,
(env, sym, pos) => ({ type: "production", name: sym[2], bodies: null, id: -1, recovery_handler: sym[4], pos: pos, recursion: 0, ROOT_PRODUCTION: !!sym[1] }) /*25*/,
(env, sym, pos) => ({ type: "production", name: sym[1], bodies: null, id: -1, recovery_handler: sym[3], pos: pos, recursion: 0, ROOT_PRODUCTION: !!null }) /*26*/,
(env, sym, pos) => ((sym[0].push(sym[2]), sym[0])) /*27*/,
(env, sym, pos) => ({ type: "body", sym: sym[3], reduce_function: sym[4], FORCE_FORK: !!sym[2], id: -1, production: null }) /*28*/,
(env, sym, pos) => ({ type: "body", sym: sym[0], reduce_function: sym[1], FORCE_FORK: !!null, id: -1, production: null }) /*29*/,
(env, sym, pos) => ({ type: "body", sym: sym[3], reduce_function: null, FORCE_FORK: !!sym[2], id: -1, production: null }) /*30*/,
(env, sym, pos) => ({ type: "body", sym: sym[0], reduce_function: null, FORCE_FORK: !!null, id: -1, production: null }) /*31*/,
(env, sym, pos) => (sym[0].concat(sym[1])) /*32*/,
(env, sym, pos) => ([]) /*33*/,
(env, sym, pos) => (env.group_id++, sym[1].flat().map(e => (e.IS_OPTIONAL ? e.IS_OPTIONAL |= env.group_id << 8 : 0, e))) /*34*/,
(env, sym, pos) => (sym[0].IS_OPTIONAL = 1, sym[0]) /*35*/,
(env, sym, pos) => ({ type: "look-behind", val: sym[1].val, phased: sym[1] }) /*36*/,
(env, sym, pos) => (sym[1].IS_NON_CAPTURE = true, sym[1]) /*37*/,
(env, sym, pos) => ({ type: "group-production", val: sym[1], pos: pos, meta: false }) /*38*/,
(env, sym, pos) => ({ type: "list-production", terminal_symbol: sym[2], IS_OPTIONAL: +(sym[1] == "(*"), val: sym[0], pos: pos, meta: false }) /*39*/,
(env, sym, pos) => ({ type: "literal", val: sym[0], pos: pos, meta: false }) /*40*/,
(env, sym, pos) => ({ type: "list-production", terminal_symbol: null, IS_OPTIONAL: +(sym[1] == "(*"), val: sym[0], pos: pos, meta: false }) /*41*/,
(env, sym, pos) => ({ type: "eof", val: "END_OF_FILE", pos: pos, meta: false }) /*42*/,
(env, sym, pos) => ({ type: "meta-exclude", sym: sym[1], meta: true, index: -1 }) /*43*/,
(env, sym, pos) => ({ type: "meta-error", sym: sym[1], meta: true, index: -1 }) /*44*/,
(env, sym, pos) => ({ type: "meta-ignore", sym: sym[1], meta: true, index: -1 }) /*45*/,
(env, sym, pos) => ({ type: "meta-reset", sym: sym[1], meta: true, index: -1 }) /*46*/,
(env, sym, pos) => ({ type: "meta-reduce", sym: sym[1], meta: true, index: -1 }) /*47*/,
(env, sym, pos) => ({ type: "empty", val: "", pos: pos, meta: false }) /*48*/,
(env, sym, pos) => ({ type: "RETURNED", txt: sym[3], name: "", env: false, ref: "", IS_CONDITION: true }) /*49*/,
(env, sym, pos) => ({ type: "env-function-reference", ref: sym[3] }) /*50*/,
(env, sym, pos) => ({ type: "local-function-reference", ref: sym[3] }) /*51*/,
(env, sym, pos) => ("FN:F") /*52*/,
(env, sym, pos) => ("<--" + sym[0].type + "^^" + sym[0].val + "-->") /*53*/,
(env, sym, pos) => (sym[0] + sym[1] + sym[2]) /*54*/,
(env, sym, pos) => ({ type: "ref-function", id: sym[1], txt: sym[3] }) /*55*/,
(env, sym, pos) => ({ type: "state", id: sym[2], instructions: sym[4], fail: sym[5], symbol_meta: sym[6], pos }) /*56*/,
(env, sym, pos) => ({ type: "state", id: sym[1], instructions: sym[3], fail: sym[4], symbol_meta: sym[5], pos }) /*57*/,
(env, sym, pos) => ({ type: "state", id: sym[2], instructions: sym[4], symbol_meta: sym[5], pos }) /*58*/,
(env, sym, pos) => ({ type: "state", id: sym[2], instructions: sym[4], fail: sym[5], pos }) /*59*/,
(env, sym, pos) => ({ type: "state", id: sym[1], instructions: sym[3], symbol_meta: sym[4], pos }) /*60*/,
(env, sym, pos) => ({ type: "state", id: sym[1], instructions: sym[3], fail: sym[4], pos }) /*61*/,
(env, sym, pos) => ({ type: "state", id: sym[2], instructions: sym[4], pos }) /*62*/,
(env, sym, pos) => ({ type: "state", id: sym[1], instructions: sym[3], pos }) /*63*/,
(env, sym, pos) => ({ type: "prod", ids: sym[2], instructions: sym[4], pos }) /*64*/,
(env, sym, pos) => (sym[1]) /*65*/,
(env, sym, pos) => ([...sym[0], ...sym[2], sym[3]]) /*66*/,
(env, sym, pos) => ([...sym[0], sym[1]]) /*67*/,
(env, sym, pos) => ([...sym[0], ...sym[2]]) /*68*/,
(env, sym, pos) => ([...sym[0]]) /*69*/,
(env, sym, pos) => ({ type: "reduce", len: parseInt(sym[1]), reduce_fn: parseInt(sym[2]), pos }) /*70*/,
(env, sym, pos) => ({ type: "reduce", len: -1, reduce_fn: sym[1], pos }) /*71*/,
(env, sym, pos) => ({ type: "set-prod", id: sym[3], pos }) /*72*/,
(env, sym, pos) => ({ type: "fork-to", states: sym[3], pos }) /*73*/,
(env, sym, pos) => ({ type: sym[1] ? "scan-back-until" : "scan-until", ids: sym[3], pos }) /*74*/,
(env, sym, pos) => ({ type: "pop", len: parseInt(sym[1]), pos }) /*75*/,
(env, sym, pos) => ({ type: "token-length", len: parseInt(sym[3]), pos }) /*76*/,
(env, sym, pos) => ({ type: "token-id", id: sym[3], pos }) /*77*/,
(env, sym, pos) => ({ type: "pass", pos }) /*78*/,
(env, sym, pos) => ({ type: "fail", pos }) /*79*/,
(env, sym, pos) => ({ type: null ? "scan-back-until" : "scan-until", ids: sym[2], pos }) /*80*/,
(env, sym, pos) => (sym[3]) /*81*/,
(env, sym, pos) => (sym[2]) /*82*/,
(env, sym, pos) => ({ type: "goto", state: sym[1], pos }) /*83*/,
(env, sym, pos) => ({ type: "no-consume", ids: sym[1], instructions: sym[3], pos }) /*84*/,
(env, sym, pos) => ({ type: "consume", ids: sym[1], instructions: sym[3], pos }) /*85*/,
(env, sym, pos) => ({ type: "peek", ids: sym[1], instructions: sym[3], pos }) /*86*/,
(env, sym, pos) => ({ type: "assert", ids: sym[1], instructions: sym[3], pos }) /*87*/,
(env, sym, pos) => ({ type: "on-fail-state", id: sym[2], instructions: sym[3], symbol_meta: sym[5], fail: sym[4], pos }) /*88*/,
(env, sym, pos) => ({ type: "on-fail-state", id: sym[2], instructions: sym[3], symbol_meta: sym[4], pos }) /*89*/,
(env, sym, pos) => ({ type: "on-fail-state", id: sym[2], instructions: sym[3], fail: sym[4], pos }) /*90*/,
(env, sym, pos) => ({ type: "on-fail-state", id: sym[2], instructions: sym[3], pos }) /*91*/,
(env, sym, pos) => ({ type: "symbols", expected: sym[2], skipped: sym[3] || [], pos }) /*92*/,
(env, sym, pos) => ({ type: "symbols", expected: sym[2], skipped: null || [], pos }) /*93*/,
(env, sym, pos) => ({ type: "state", id: sym[0], instructions: sym[1], fail: sym[2], symbol_meta: sym[3], pos }) /*94*/,
(env, sym, pos) => ({ type: "state", id: sym[0], instructions: sym[1], symbol_meta: sym[2], pos }) /*95*/,
(env, sym, pos) => ({ type: "state", id: sym[0], instructions: sym[1], fail: sym[2], pos }) /*96*/,
(env, sym, pos) => ({ type: "state", id: sym[0], instructions: sym[1], pos }) /*97*/,
(env, sym, pos) => (sym[0] + "") /*98*/,
(env, sym, pos) => (env.prod_name = sym[0]) /*99*/,
(env, sym, pos) => (env.prod_name = sym[0].val, sym[0]) /*100*/,
(env, sym, pos) => (sym[0] + "GG") /*101*/,
(env, sym, pos) => ({ type: "repeat-state" }) /*102*/,
(env, sym, pos) => ({ type: "repeat-state", pos }) /*103*/,
(env, sym, pos) => (parseInt(sym[0])) /*104*/];

export default ParserFactory
    (reduce_functions, undefined, recognizer_initializer, { hydrocarbon: 0, ir_state: 1 });