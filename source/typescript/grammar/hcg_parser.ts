
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


    var token_lookup = new Uint32Array([16392, 0, 0, 16424, 33554432, 0, 512, 0, 0, 134218112, 0, 17301504, 384, 0, 16777216, 8576, 0, 0, 384, 0, 0, 3179524526, 341942271, 524288, 3179516334, 341942271, 524288, 1573248, 0, 0, 134218112, 4093640704, 17813030, 384, 67108864, 16777216, 384, 0, 17825792, 2147484032, 0, 0, 134218112, 0, 0, 134218112, 67108864, 17301504, 134218112, 0, 16777216, 2147484032, 0, 16777216, 384, 4093640704, 17813030, 128, 0, 0, 384, 2, 16777216, 384, 4093640704, 17288742, 3045306758, 6307737, 0, 384, 1196032, 0, 2281701760, 3556769792, 527910, 384, 0, 2113536, 384, 0, 16793600, 384, 67108864, 17301504, 8576, 0, 16777216, 763605382, 6307737, 0, 428, 0, 0, 537112580, 16281, 0, 396, 0, 0, 2281701760, 335544320, 540672, 384, 32768, 0, 4194688, 0, 0, 384, 2, 0, 392, 0, 0, 256, 0, 0, 536871296, 0, 16777216, 384, 65536, 0, 134218112, 1, 8912896, 384, 819200, 0, 384, 262144, 0, 384, 524288, 0, 1408, 0, 16777216, 94636416, 6291456, 0, 896, 0, 16777216, 1452, 0, 0, 10750336, 0, 0, 2432, 0, 0, 233856, 0, 0, 4480, 0, 0, 0, 0, 0, 16776, 0, 0, 16424, 0, 0, 16384, 0, 0, 8, 0, 0, 32, 0, 0, 33152, 0, 0, 424, 0, 0, 386, 0, 0, 65920, 0, 0, 131456, 0, 0, 262528, 0, 0, 2097536, 0, 0, 8388992, 0, 0, 83886464, 6291456, 0, 92275074, 6291456, 0, 83886464, 0, 0, 384, 2097152, 0, 384, 4194304, 0, 33563008, 0, 0, 545501572, 16281, 0, 2508194178, 6291456, 0, 92274690, 6291456, 0, 537112964, 16281, 0, 1619243396, 16281, 0, 1073742208, 0, 0, 3045306758, 6299545, 0, 2508193794, 6291456, 0, 537112580, 8089, 0, 537112964, 8089, 0, 537112580, 152, 0, 0, 7936, 0, 537112964, 152, 0, 3183718822, 341843967, 524288, 3045306758, 6299647, 0, 2147586432, 0, 0, 384, 4, 0, 384, 128, 0, 102784, 0, 0, 384, 7936, 0, 384, 8192, 0, 102830, 32896, 0, 102700, 128, 0, 102828, 98432, 0, 102828, 128, 0, 102702, 32896, 0, 384, 4194304, 16777216, 384, 25165824, 16777216, 16808, 33554432, 16777216, 16424, 33554432, 16777216, 0, 0, 16777216, 16384, 0, 16777216, 0, 33554432, 16777216, 32, 0, 16777216, 8, 0, 16777216, 0, 4026531840, 20006, 384, 134217728, 16777216, 384, 1, 16777216, 8608, 0, 16777216, 384, 4026531840, 16797222, 0, 3221225472, 3622, 384, 3221225472, 16780838, 416, 2097152, 16777216, 416, 0, 16777216, 384, 134217728, 16777280, 384, 0, 16777217, 8608, 0, 0, 384, 0, 16777600, 102816, 0, 0, 384, 0, 16777240, 384, 0, 16777232, 384, 0, 16781312, 384, 16777216, 16785408, 102816, 0, 16777216, 384, 0, 17268736, 384, 0, 16779264, 384, 16777216, 16777216, 384, 0, 17301504, 388, 0, 0, 416, 0, 0, 430, 0, 0, 1581452, 0, 0, 537112964, 8091, 0, 134218112, 67108864, 524288, 384, 67108864, 0, 134218112, 67108864, 1015808, 384, 0, 491520, 8608, 2, 0, 2281701760, 335544320, 524288, 384, 3221225472, 2117158, 384, 268435456, 0, 384, 0, 2097152, 384, 0, 4096, 2147484032, 0, 4194304, 384, 0, 4194304, 102816, 2, 0, 384, 0, 8388608, 384, 1, 0]);;
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
                            if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 2) {
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
                            if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 4) {
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
                        if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 1) {
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
                                    if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 6) {
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
                            } else if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 2) {
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
                            if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 4) {
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
                            if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 7) {
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
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 8) {
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
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 3) {
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
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 4) {
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
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 4) {
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
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 4) {
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
                            if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 2) {
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
                            if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 6) {
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
                            if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 9) {
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
                            if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 2) {
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
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 4) {
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
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 4) {
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
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 4) {
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
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 3) {
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
                                    if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 7) {
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
                                    if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 6) {
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
                                    if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 6) {
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
                                    if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 6) {
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
                        } else if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 1) {
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
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 7) {
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
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 5) {
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
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 4) {
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
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 3) {
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
                                    if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 5) {
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
                            } else if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 2) {
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
                                if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 4) {
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
                            if (isTokenActive(13, tk_row) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1) && lexer.byte_length > 5) {
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
        if (isTokenActive(13, tk_row) && pre_scan(lexer, 0) && token_production(lexer, hc_symbols__identifier_syms, 10, 13, 1)) {
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

    function branch_0026404a9ebc4f7c(state, db, prod) {
        add_reduce(state, 1, 3);
        return hc_state_ir__instruction_sequence_list_338_goto(state, db, 72);
    }

    function branch_00c959ae7207361b(state, db, prod) {
        scan(state.lexer, 3, 4);
        if (state.lexer._type == 83) {
            state.push_fn(set_production /*43*/, 43);
            state.push_fn(branch_34f1a1efe6676756, 43);
            return hc_state_ir__expected_symbols(state, db, 0);
        } else if (state.lexer._type == 27) {
            state.push_fn(set_production /*43*/, 43);
            consume(state);
            add_reduce(state, 7, 62);
            return 0;
        };
        return - 1;
    }

    function branch_0587b78912f6b6dd(state, db, prod) {
        scan(state.lexer, 5, 6);
        state.push_fn(branch_c1d2310102a015d7, 0);
        return hc_symbols__production_symbol(state, db, 0);
    }

    function branch_0668f4b0c4a385bd(state, db, prod) {
        scan(state.lexer, 7, 0);
        if (state.lexer._type == 8 || state.lexer._type == 1 || state.lexer._type == 7) {
            var pk = state.lexer.copy_in_place();;
            pk.next();
            scan(pk, 8, 0);
            if (isTokenActive(pk._type, 8)) {
                state.lexer._type = 8;
                state.push_fn(set_production /*11*/, 11);
                state.push_fn(branch_9a2a194ba6000915, 11);
                return hc_symbols__sym_delimiter(state, db, 0);
            }
        } else {
            add_reduce(state, 2, 8);
            return 11;
        };
        return - 1;
    }

    function branch_08b0ded33d421dcd(state, db, prod) {
        add_reduce(state, 2, 6);
        return 8;
    }

    function branch_095a1edafb4b7bd9(state, db, prod) {
        scan(state.lexer, 9, 6);
        if (state.lexer._type == 19 || state.lexer._type == 20) {
            consume(state);
            state.push_fn(branch_f50bdf0d97d5d7d7, 15);
            return hc_symbols__identifier(state, db, 0);
        };
        return - 1;
    }

    function branch_0aa6a8bdf0f0a158(state, db, prod) {
        add_reduce(state, 1, 3);
        return hc_state_ir__sequence_instruction_list_366_goto(state, db, 76);
    }

    function branch_0bae00e14f8df62d(state, db, prod) {
        scan(state.lexer, 10, 4);
        if (state.lexer._type == 58) {
            scan(state.lexer, 11, 4);
            state.push_fn(branch_48c2754da966f58e, 0);
            return hc_state_ir__on_fail(state, db, 0);
        } else if (state.lexer._type == 83) {
            var pk = state.lexer.copy_in_place();;
            pk.next();
            scan(pk, 12, 4);
            if (pk._type == 84) {
                state.lexer._type = 83;
                state.push_fn(set_production /*54*/, 54);
                state.push_fn(branch_9086627f74e68621, 54);
                return hc_state_ir__expected_symbols(state, db, 0);
            }
        } else {
            add_reduce(state, 4, 94);
            return 54;
        };
        return - 1;
    }

    function branch_0deef36ccd225601(state, db, prod) {
        state.push_fn(branch_5a084cbc872fbd03, 50);
        return hc_symbols__imported_production_symbol(state, db, 0);
    }

    function branch_0f048625c3489a40(state, db, prod) {
        scan(state.lexer, 13, 6);
        if ((state.lexer._type == 31)) {
            consume(state);
            add_reduce(state, 4, 42);
            return 0;
        };
        return - 1;
    }

    function branch_137ef0085e910c83(state, db, prod) {
        scan(state.lexer, 14, 6);
        state.push_fn(branch_fd28a1b97a9a58de, 0);
        return hc_productions__production_start_symbol(state, db, 0);
    }

    function branch_15b827a36beefcbb(state, db, prod) {
        add_reduce(state, 4, 80);
        return 0;
    }

    function branch_15d9264919d8be98(state, db, prod) {
        scan(state.lexer, 15, 4);
        if (state.lexer._type == 58) {
            scan(state.lexer, 11, 4);
            state.push_fn(branch_00c959ae7207361b, 0);
            return hc_state_ir__on_fail(state, db, 0);
        } else if (state.lexer._type == 83) {
            state.push_fn(set_production /*43*/, 43);
            state.push_fn(branch_72c4f7c9e390a9e8, 43);
            return hc_state_ir__expected_symbols(state, db, 0);
        } else if (state.lexer._type == 27) {
            state.push_fn(set_production /*43*/, 43);
            consume(state);
            add_reduce(state, 6, 65);
            return 0;
        };
        return - 1;
    }

    function branch_168d564cb6977a29(state, db, prod) {
        state.push_fn(branch_6882e9152fa5da2c, 20);
        return hc_comments__comment_delimiter(state, db, 0);
    }

    function branch_16ee4e566cf0b8dd(state, db, prod) {
        scan(state.lexer, 16, 4);
        if ((state.lexer._type == 27)) {
            consume(state);
            add_reduce(state, 6, 63);
            return 0;
        };
        return - 1;
    }

    function branch_175d0eb6e13d9c56(state, db, prod) {
        scan(state.lexer, 17, 4);
        if ((state.lexer._type == 31)) {
            consume(state);
            add_reduce(state, 6, 67);
            return 46;
        };
        return - 1;
    }

    function branch_1875f0e1854eb7e6(state, db, prod) {
        scan(state.lexer, 18, 4);
        if (state.lexer._type == 58) {
            scan(state.lexer, 11, 4);
            state.push_fn(branch_2eb28c4a07e2a47d, 0);
            return hc_state_ir__on_fail(state, db, 0);
        } else if (state.lexer._type == 83) {
            state.push_fn(set_production /*57*/, 57);
            state.push_fn(branch_4ff3f958d58cee56, 57);
            return hc_state_ir__expected_symbols(state, db, 0);
        } else {
            add_reduce(state, 2, 100);
            return 57;
        };
        return - 1;
    }

    function branch_1ac4137dc88a80cf(state, db, prod) {
        add_reduce(state, 4, 27);
        return 0;
    }

    function branch_1b3a59829d8a964d(state, db, prod) {
        add_reduce(state, 2, 4);
        return hc_state_ir__production_id_list_list_333_goto(state, db, 70);
    }

    function branch_1c950dcbd44b358e(state, db, prod) {
        scan(state.lexer, 6, 19);
        state.push_fn(branch_7dcf20659894f269, 0);
        return hc_preambles__import_preamble_list_59(state, db, 0);
    }

    function branch_1cdf106b65187f0a(state, db, prod) {
        add_reduce(state, 2, 74);
        return 49;
    }

    function branch_1f24f8ee3cc31e5c(state, db, prod) {
        scan(state.lexer, 16, 4);
        if ((state.lexer._type == 27)) {
            consume(state);
            add_reduce(state, 7, 60);
            return 0;
        };
        return - 1;
    }

    function branch_1f6cf2d23ac3b586(state, db, prod) {
        scan(state.lexer, 17, 4);
        if ((state.lexer._type == 31)) {
            consume(state);
            add_reduce(state, 5, 89);
            return 0;
        };
        return - 1;
    }

    function branch_20430b61e2ba183d(state, db, prod) {
        add_reduce(state, 2, 70);
        return 0;
    }

    function branch_20b33064645a28fc(state, db, prod) {
        add_reduce(state, 2, 7);
        return 0;
    }

    function branch_216ecdf1d3e6112b(state, db, prod) {
        scan(state.lexer, 20, 4);
        if (state.lexer._type == 33) {
            consume(state);
            scan(state.lexer, 21, 4);
            state.push_fn(branch_15d9264919d8be98, 0);
            return hc_state_ir__top_level_instructions(state, db, 0);
        };
        return - 1;
    }

    function branch_22e74cc8c661e46a(state, db, prod) {
        add_reduce(state, 4, 26);
        return 0;
    }

    function branch_232f37efe656dae6(state, db, prod) {
        add_reduce(state, 1, 3);
        return 0;
    }

    function branch_24972784e7ba4f8a(state, db, prod) {
        scan(state.lexer, 22, 6);
        if (state.lexer._type == 53) {
            var pk = state.lexer.copy_in_place();;
            pk.next();
            scan(pk, 23, 6);
            if (pk._type == 52 || pk._type == 46) {
                state.lexer._type = 53;
                state.push_fn(set_production /*28*/, 28);
                state.push_fn(branch_41a079d538412316, 28);
                return hc_functions__reduce_function(state, db, 0);
            }
        } else {
            add_reduce(state, 1, 34);
            return 28;
        };
        return - 1;
    }

    function branch_25b8891a3f092370(state, db, prod) {
        add_reduce(state, 2, 10);
        return 14;
    }

    function branch_273f434273cf6daf(state, db, prod) {
        add_reduce(state, 1, 104);
        return 67;
    }

    function branch_28ab10e2751570b2(state, db, prod) {
        add_reduce(state, 2, 4);
        return 0;
    }

    function branch_2b6f1793d271c5f6(state, db, prod) {
        scan(state.lexer, 24, 6);
        if (state.lexer._type == 60) {
            var pk = state.lexer.copy_in_place();;
            pk.next();
            scan(pk, 25, 6);
            if (pk._type == 78) {
                consume(state);
                scan(state.lexer, 26, 4);
                state.push_fn(branch_630c78bd2e27249c, 0);
                return hc_state_ir__instruction_sequence_list_338(state, db, 0);
            } else {
                state.lexer._type = 60;
                state.push_fn(set_production /*48*/, 48);
                state.push_fn(branch_20430b61e2ba183d, 48);
                return hc_state_ir__instruction_sequence_group_339_0_(state, db, 0);
            }
        } else {
            add_reduce(state, 1, 72);
            return 48;
        };
        return - 1;
    }

    function branch_2eabc86f232c885a(state, db, prod) {
        add_reduce(state, 4, 69);
        return 0;
    }

    function branch_2eac35b977492180(state, db, prod) {
        scan(state.lexer, 21, 4);
        state.push_fn(branch_0bae00e14f8df62d, 0);
        return hc_state_ir__top_level_instructions(state, db, 0);
    }

    function branch_2eb28c4a07e2a47d(state, db, prod) {
        scan(state.lexer, 27, 4);
        if (state.lexer._type == 83) {
            state.push_fn(set_production /*57*/, 57);
            state.push_fn(branch_69d1035ae6242bbe, 57);
            return hc_state_ir__expected_symbols(state, db, 0);
        } else {
            add_reduce(state, 3, 99);
            return 57;
        };
        return - 1;
    }

    function branch_30faacf91156076a(state, db, prod) {
        scan(state.lexer, 28, 4);
        state.push_fn(branch_216ecdf1d3e6112b, 0);
        return hc_symbols__imported_production_symbol(state, db, 0);
    }

    function branch_312cacadccd66e8b(state, db, prod) {
        state.push_fn(branch_1cdf106b65187f0a, 49);
        return hc_functions__referenced_function(state, db, 0);
    }

    function branch_342e83f419f22e64(state, db, prod) {
        scan(state.lexer, 17, 4);
        if ((state.lexer._type == 31)) {
            consume(state);
            add_reduce(state, 5, 90);
            return 0;
        };
        return - 1;
    }

    function branch_34f1a1efe6676756(state, db, prod) {
        scan(state.lexer, 16, 4);
        if ((state.lexer._type == 27)) {
            consume(state);
            add_reduce(state, 8, 59);
            return 0;
        };
        return - 1;
    }

    function branch_369b943c675e5e2d(state, db, prod) {
        scan(state.lexer, 29, 6);
        if (state.lexer._type == 23) {
            var pk = state.lexer.copy_in_place();;
            pk.next();
            scan(pk, 30, 19);
            if (pk._type == 2 || pk._type == 3 || pk._type == 5 || pk._type == 8) {
                state.lexer._type = 23;
                state.push_fn(set_production /*24*/, 24);
                state.push_fn(branch_1ac4137dc88a80cf, 24);
                return hc_production_bodies__production_bodies(state, db, 0);
            }
        } else if (isTokenActive(state.lexer._type, 31)) {
            state.push_fn(set_production /*24*/, 24);
            state.push_fn(branch_1ac4137dc88a80cf, 24);
            return hc_production_bodies__production_bodies(state, db, 0);
        } else {
            add_reduce(state, 3, 29);
            return 24;
        };
        return - 1;
    }

    function branch_371144cbe5d68023(state, db, prod) {
        state.push_fn(branch_22e74cc8c661e46a, 24);
        return hc_production_bodies__production_bodies(state, db, 0);
    }

    function branch_38e9b80825474aa0(state, db, prod) {
        state.push_fn(branch_1cdf106b65187f0a, 49);
        return hc_functions__reduce_function(state, db, 0);
    }

    function branch_3ce05169be6fd8ef(state, db, prod) {
        add_reduce(state, 2, 35);
        return 0;
    }

    function branch_3ee7fb5cda813cb9(state, db, prod) {
        state.push_fn(branch_5a084cbc872fbd03, 50);
        return hc_symbols__production_symbol(state, db, 0);
    }

    function branch_40e4337463d2865c(state, db, prod) {
        add_reduce(state, 5, 25);
        return 0;
    }

    function branch_41a079d538412316(state, db, prod) {
        add_reduce(state, 2, 32);
        return 0;
    }

    function branch_423b72e2288cd644(state, db, prod) {
        scan(state.lexer, 20, 4);
        if ((state.lexer._type == 33)) {
            consume(state);
            add_reduce(state, 3, 68);
            return 51;
        };
        return - 1;
    }

    function branch_46892305452de530(state, db, prod) {
        scan(state.lexer, 5, 6);
        state.push_fn(branch_c1d2310102a015d7, 0);
        return hc_symbols__imported_production_symbol(state, db, 0);
    }

    function branch_48c2754da966f58e(state, db, prod) {
        scan(state.lexer, 15, 4);
        if (state.lexer._type == 83) {
            var pk = state.lexer.copy_in_place();;
            pk.next();
            scan(pk, 12, 4);
            if (pk._type == 84) {
                state.lexer._type = 83;
                state.push_fn(set_production /*54*/, 54);
                state.push_fn(branch_64dca13e4b13285c, 54);
                return hc_state_ir__expected_symbols(state, db, 0);
            }
        } else {
            add_reduce(state, 5, 93);
            return 54;
        };
        return - 1;
    }

    function branch_4941a40c1e051405(state, db, prod) {
        add_reduce(state, 3, 15);
        add_reduce(state, 1, 3);
        return 0;
    }

    function branch_49a8480279948c19(state, db, prod) {
        add_reduce(state, 3, 83);
        return 0;
    }

    function branch_4beaf85730ce1be4(state, db, prod) {
        scan(state.lexer, 22, 6);
        if (state.lexer._type == 53) {
            var pk = state.lexer.copy_in_place();;
            pk.next();
            scan(pk, 23, 6);
            if (pk._type == 52 || pk._type == 46) {
                state.lexer._type = 53;
                state.push_fn(set_production /*28*/, 28);
                state.push_fn(branch_4c8c7ed1661aa952, 28);
                return hc_functions__reduce_function(state, db, 0);
            }
        } else {
            add_reduce(state, 4, 33);
            return 28;
        };
        return - 1;
    }

    function branch_4c8c7ed1661aa952(state, db, prod) {
        add_reduce(state, 5, 31);
        return 0;
    }

    function branch_4d9ad2a909c7c47e(state, db, prod) {
        state.push_fn(branch_5cb30384bb6efc27, 1);
        return hc_productions__productions(state, db, 0);
    }

    function branch_4ff3f958d58cee56(state, db, prod) {
        add_reduce(state, 3, 98);
        return 0;
    }

    function branch_533a93a3faca2f72(state, db, prod) {
        add_reduce(state, 1, 101);
        return hc_comments__cm_list_110_goto(state, db, 63);
    }

    function branch_53c7b8a1453ec235(state, db, prod) {
        add_reduce(state, 1, 18);
        return 0;
    }

    function branch_582d2b466cda75d4(state, db, prod) {
        scan(state.lexer, 17, 4);
        if ((state.lexer._type == 31)) {
            consume(state);
            add_reduce(state, 5, 88);
            return 0;
        };
        return - 1;
    }

    function branch_58a70e7a743ce1a8(state, db, prod) {
        add_reduce(state, 2, 40);
        return 0;
    }

    function branch_59b5dec1e0b32356(state, db, prod) {
        scan(state.lexer, 13, 6);
        if ((state.lexer._type == 31)) {
            consume(state);
            add_reduce(state, 3, 41);
            return 0;
        };
        return - 1;
    }

    function branch_59e8433c52ab1f46(state, db, prod) {
        scan(state.lexer, 5, 6);
        state.push_fn(branch_1c950dcbd44b358e, 0);
        return hc_symbols__imported_production_symbol(state, db, 0);
    }

    function branch_5a084cbc872fbd03(state, db, prod) {
        scan(state.lexer, 20, 4);
        if ((state.lexer._type == 33)) {
            consume(state);
            add_reduce(state, 5, 84);
            return 50;
        };
        return - 1;
    }

    function branch_5cb30384bb6efc27(state, db, prod) {
        add_reduce(state, 2, 1);
        return 0;
    }

    function branch_5fd7ea4e229484ff(state, db, prod) {
        scan(state.lexer, 32, 6);
        state.push_fn(branch_a553633ec0894916, 0);
        return hc_preambles__import_preamble_list_60(state, db, 0);
    }

    function branch_6011efbc028b0d0f(state, db, prod) {
        scan(state.lexer, 5, 6);
        if ((state.lexer._type == 13)) {
            state.push_fn(branch_1b3a59829d8a964d, 70);
            return hc_symbols__production_symbol(state, db, 0);
        };
        return - 1;
    }

    function branch_630c78bd2e27249c(state, db, prod) {
        scan(state.lexer, 33, 6);
        if (state.lexer._type == 60) {
            state.push_fn(set_production /*48*/, 48);
            state.push_fn(branch_2eabc86f232c885a, 48);
            return hc_state_ir__instruction_sequence_group_339_0_(state, db, 0);
        } else {
            add_reduce(state, 3, 71);
            return 48;
        };
        return - 1;
    }

    function branch_64dca13e4b13285c(state, db, prod) {
        add_reduce(state, 6, 91);
        return 0;
    }

    function branch_6513e5778b4dcb4f(state, db, prod) {
        add_reduce(state, 4, 75);
        return 49;
    }

    function branch_66b9bad47c4bd243(state, db, prod) {
        add_reduce(state, 4, 75);
        return 0;
    }

    function branch_687f18730960b285(state, db, prod) {
        add_reduce(state, 2, 23);
        return 0;
    }

    function branch_6882e9152fa5da2c(state, db, prod) {
        add_reduce(state, 3, 17);
        return 20;
    }

    function branch_69d1035ae6242bbe(state, db, prod) {
        add_reduce(state, 4, 97);
        return 0;
    }

    function branch_6c48bde53443bbe2(state, db, prod) {
        scan(state.lexer, 34, 6);
        if ((state.lexer._type == 47)) {
            consume(state);
            state.push_fn(branch_897402d69f9a3493, 42);
            return hc_functions__js_data(state, db, 0);
        };
        return - 1;
    }

    function branch_6e96959f4d77795f(state, db, prod) {
        scan(state.lexer, 35, 6);
        if ((state.lexer._type == 22)) {
            consume(state);
            state.push_fn(branch_a7050425ebf78cb7, 17);
            return hc_symbols__identifier(state, db, 0);
        };
        return - 1;
    }

    function branch_71a788043652d3b3(state, db, prod) {
        scan(state.lexer, 13, 6);
        if ((state.lexer._type == 31)) {
            consume(state);
            add_reduce(state, 3, 48);
            return 0;
        };
        return - 1;
    }

    function branch_72c4f7c9e390a9e8(state, db, prod) {
        scan(state.lexer, 16, 4);
        if ((state.lexer._type == 27)) {
            consume(state);
            add_reduce(state, 7, 61);
            return 0;
        };
        return - 1;
    }

    function branch_7522edc2a9b0cba1(state, db, prod) {
        scan(state.lexer, 5, 6);
        if (state.lexer._type == 13) {
            var fk1 = state.fork(db);;
            fk1.push_fn(branch_b4abd0148ff62270, 16);
            state.push_fn(branch_59e8433c52ab1f46, 16);
            return 0;
        };
        return - 1;
    }

    function branch_75925eaf0d57aec7(state, db, prod) {
        add_reduce(state, 1, 3);
        return hc_symbols__condition_symbol_list_goto(state, db, 35);
    }

    function branch_7839a02c7751524a(state, db, prod) {
        scan(state.lexer, 36, 6);
        if ((state.lexer._type == 33)) {
            consume(state);
            add_reduce(state, 3, 37);
            return 0;
        };
        return - 1;
    }

    function branch_79d483fe047ab999(state, db, prod) {
        add_reduce(state, 4, 53);
        return 0;
    }

    function branch_7dcf20659894f269(state, db, prod) {
        scan(state.lexer, 9, 6);
        if (state.lexer._type == 19 || state.lexer._type == 20) {
            consume(state);
            scan(state.lexer, 37, 6);
            if ((state.lexer._type == 3)) {
                consume(state);
                scan(state.lexer, 6, 38);
                if ((state.lexer._type == 7)) {
                    consume(state);
                    add_reduce(state, 7, 13);
                    return 16;
                }
            }
        };
        return - 1;
    }

    function branch_7f6e9713cd758921(state, db, prod) {
        scan(state.lexer, 15, 4);
        if (state.lexer._type == 58) {
            scan(state.lexer, 11, 4);
            state.push_fn(branch_7ff7ccf1c1388d3d, 0);
            return hc_state_ir__on_fail(state, db, 0);
        } else if (state.lexer._type == 83) {
            state.push_fn(set_production /*43*/, 43);
            state.push_fn(branch_16ee4e566cf0b8dd, 43);
            return hc_state_ir__expected_symbols(state, db, 0);
        } else if (state.lexer._type == 27) {
            state.push_fn(set_production /*43*/, 43);
            consume(state);
            add_reduce(state, 5, 66);
            return 0;
        };
        return - 1;
    }

    function branch_7ff7ccf1c1388d3d(state, db, prod) {
        scan(state.lexer, 3, 4);
        if (state.lexer._type == 83) {
            state.push_fn(set_production /*43*/, 43);
            state.push_fn(branch_1f24f8ee3cc31e5c, 43);
            return hc_state_ir__expected_symbols(state, db, 0);
        } else if (state.lexer._type == 27) {
            state.push_fn(set_production /*43*/, 43);
            consume(state);
            add_reduce(state, 6, 64);
            return 0;
        };
        return - 1;
    }

    function branch_8118c1774fdfffd3(state, db, prod) {
        add_reduce(state, 3, 15);
        return 0;
    }

    function branch_82b126017e807534(state, db, prod) {
        scan(state.lexer, 39, 4);
        if ((state.lexer._type == 29)) {
            consume(state);
            state.push_fn(branch_175d0eb6e13d9c56, 46);
            return hc_state_ir__instruction_sequence(state, db, 0);
        };
        return - 1;
    }

    function branch_867d2b18947b7461(state, db, prod) {
        add_reduce(state, 1, 2);
        return 0;
    }

    function branch_897402d69f9a3493(state, db, prod) {
        scan(state.lexer, 40, 6);
        if ((state.lexer._type == 48)) {
            consume(state);
            add_reduce(state, 5, 58);
            return 42;
        };
        return - 1;
    }

    function branch_9086627f74e68621(state, db, prod) {
        add_reduce(state, 5, 92);
        return 0;
    }

    function branch_91cc41aa447c6f0b(state, db, prod) {
        add_reduce(state, 1, 3);
        return hc_symbols__ignore_symbols_goto(state, db, 6);
    }

    function branch_91f18f1bdbdd8d0d(state, db, prod) {
        add_reduce(state, 3, 9);
        return 13;
    }

    function branch_91f93516da7e8fc1(state, db, prod) {
        state.push_fn(branch_91f18f1bdbdd8d0d, 13);
        return hc_symbols__sym_delimiter(state, db, 0);
    }

    function branch_96d3d6971695bb5f(state, db, prod) {
        add_reduce(state, 2, 39);
        return 0;
    }

    function branch_96ee4499041b7d15(state, db, prod) {
        add_reduce(state, 1, 56);
        return 0;
    }

    function branch_97de5fed52fee6bc(state, db, prod) {
        add_reduce(state, 2, 86);
        return 52;
    }

    function branch_986cf2127efb70ad(state, db, prod) {
        add_reduce(state, 1, 3);
        return hc_state_ir__top_level_instructions_list_323_goto(state, db, 68);
    }

    function branch_9a2a194ba6000915(state, db, prod) {
        add_reduce(state, 3, 8);
        return 0;
    }

    function branch_9b48dba55e349e46(state, db, prod) {
        scan(state.lexer, 39, 4);
        if ((state.lexer._type == 29)) {
            consume(state);
            state.push_fn(branch_1f6cf2d23ac3b586, 53);
            return hc_state_ir__instruction_sequence(state, db, 0);
        };
        return - 1;
    }

    function branch_9c2cd21f3758c690(state, db, prod) {
        scan(state.lexer, 41, 6);
        if (state.lexer._type == 87) {
            state.push_fn(set_production /*56*/, 56);
            state.push_fn(branch_b7122f5cf71e2cc2, 56);
            return hc_state_ir__expected_symbols_group_454_0_(state, db, 0);
        } else {
            add_reduce(state, 3, 96);
            return 56;
        };
        return - 1;
    }

    function branch_9de304337147e1a0(state, db, prod) {
        add_reduce(state, 4, 77);
        return 0;
    }

    function branch_9e8b483fb07aa4f4(state, db, prod) {
        scan(state.lexer, 6, 38);
        if ((state.lexer._type == 7)) {
            consume(state);
            add_reduce(state, 3, 5);
            return 5;
        };
        return - 1;
    }

    function branch_a2a0e2ae0881f501(state, db, prod) {
        scan(state.lexer, 13, 6);
        if ((state.lexer._type == 31)) {
            consume(state);
            add_reduce(state, 3, 49);
            return 0;
        };
        return - 1;
    }

    function branch_a3a046d24e9182ed(state, db, prod) {
        scan(state.lexer, 13, 6);
        if ((state.lexer._type == 31)) {
            consume(state);
            add_reduce(state, 3, 47);
            return 0;
        };
        return - 1;
    }

    function branch_a553633ec0894916(state, db, prod) {
        scan(state.lexer, 6, 19);
        state.push_fn(branch_095a1edafb4b7bd9, 0);
        return hc_preambles__import_preamble_list_59(state, db, 0);
    }

    function branch_a556dc24f4a9db73(state, db, prod) {
        scan(state.lexer, 13, 6);
        if ((state.lexer._type == 31)) {
            consume(state);
            add_reduce(state, 3, 46);
            return 0;
        };
        return - 1;
    }

    function branch_a7050425ebf78cb7(state, db, prod) {
        add_reduce(state, 3, 15);
        return 17;
    }

    function branch_a88403631e0c628b(state, db, prod) {
        scan(state.lexer, 40, 6);
        if ((state.lexer._type == 48)) {
            consume(state);
            add_reduce(state, 3, 57);
            return 41;
        };
        return - 1;
    }

    function branch_a993a3de58015421(state, db, prod) {
        scan(state.lexer, 6, 19);
        state.push_fn(branch_c9dfaf277e088708, 0);
        return hc_preambles__import_preamble_list_59(state, db, 0);
    }

    function branch_ad5c187ba038713b(state, db, prod) {
        add_reduce(state, 2, 21);
        return 0;
    }

    function branch_b16d1ef9240490ef(state, db, prod) {
        add_reduce(state, 1, 103);
        return 65;
    }

    function branch_b4abd0148ff62270(state, db, prod) {
        scan(state.lexer, 5, 6);
        state.push_fn(branch_1c950dcbd44b358e, 0);
        return hc_symbols__production_symbol(state, db, 0);
    }

    function branch_b52492310c1ad8cd(state, db, prod) {
        scan(state.lexer, 20, 4);
        if ((state.lexer._type == 33)) {
            consume(state);
            add_reduce(state, 3, 68);
            return 47;
        };
        return - 1;
    }

    function branch_b56313c0e76236f1(state, db, prod) {
        state.push_fn(branch_6c48bde53443bbe2, 42);
        return hc_symbols__identifier(state, db, 0);
    }

    function branch_b7122f5cf71e2cc2(state, db, prod) {
        add_reduce(state, 4, 95);
        return 0;
    }

    function branch_b87e6cae9e69e3e0(state, db, prod) {
        scan(state.lexer, 6, 38);
        if ((state.lexer._type == 7)) {
            consume(state);
            add_reduce(state, 6, 12);
            return 15;
        };
        return - 1;
    }

    function branch_ba5f75631cc56b1f(state, db, prod) {
        scan(state.lexer, 39, 4);
        if ((state.lexer._type == 29)) {
            consume(state);
            state.push_fn(branch_582d2b466cda75d4, 53);
            return hc_state_ir__instruction_sequence(state, db, 0);
        };
        return - 1;
    }

    function branch_bc3c3efd94a44644(state, db, prod) {
        add_reduce(state, 1, 24);
        return 0;
    }

    function branch_bca28e1a52f2e561(state, db, prod) {
        scan(state.lexer, 21, 4);
        state.push_fn(branch_1875f0e1854eb7e6, 0);
        return hc_state_ir__top_level_instructions(state, db, 0);
    }

    function branch_be8412860dc4e514(state, db, prod) {
        scan(state.lexer, 33, 6);
        if (state.lexer._type == 60) {
            state.push_fn(set_production /*48*/, 48);
            state.push_fn(branch_20430b61e2ba183d, 48);
            return hc_state_ir__instruction_sequence_group_342_0_(state, db, 0);
        } else {
            add_reduce(state, 1, 72);
            return 48;
        };
        return - 1;
    }

    function branch_bf72bc5b39a9e5a7(state, db, prod) {
        scan(state.lexer, 17, 4);
        if ((state.lexer._type == 31)) {
            consume(state);
            add_reduce(state, 5, 76);
            return 0;
        };
        return - 1;
    }

    function branch_bfbf48847a946a6f(state, db, prod) {
        add_reduce(state, 1, 19);
        return 0;
    }

    function branch_c1d2310102a015d7(state, db, prod) {
        scan(state.lexer, 6, 19);
        state.push_fn(branch_d8b9d1a06e731916, 0);
        return hc_preambles__import_preamble_list_59(state, db, 0);
    }

    function branch_c42c47ca94ba63f7(state, db, prod) {
        state.push_fn(branch_371144cbe5d68023, 24);
        return hc_productions__production_start_symbol(state, db, 0);
    }

    function branch_c6869aa137a8ea23(state, db, prod) {
        scan(state.lexer, 17, 4);
        if ((state.lexer._type == 31)) {
            consume(state);
            add_reduce(state, 5, 87);
            return 0;
        };
        return - 1;
    }

    function branch_c9dfaf277e088708(state, db, prod) {
        scan(state.lexer, 9, 6);
        if (state.lexer._type == 19 || state.lexer._type == 20) {
            consume(state);
            state.push_fn(branch_b87e6cae9e69e3e0, 15);
            return hc_symbols__identifier(state, db, 0);
        };
        return - 1;
    }

    function branch_ce4d56919f991cf0(state, db, prod) {
        add_reduce(state, 4, 54);
        return 0;
    }

    function branch_cf24bfc02c133c76(state, db, prod) {
        state.push_fn(branch_6513e5778b4dcb4f, 49);
        return hc_symbols__production_symbol(state, db, 0);
    }

    function branch_d4351a488686b130(state, db, prod) {
        scan(state.lexer, 23, 6);
        if (state.lexer._type == 46) {
            var pk = state.lexer.copy_in_place();;
            pk.next();
            scan(pk, 42, 6);
            if (pk._type == 47) {
                state.lexer._type = 46;
                state.push_fn(set_production /*37*/, 37);
                consume(state);
                scan(state.lexer, 34, 6);
                if ((state.lexer._type == 47)) {
                    consume(state);
                    state.push_fn(branch_fe5a48fff62a6171, 37);
                    return hc_functions__js_data(state, db, 0);
                };
                return - 1;
            } else if (pk._type == 50) {
                state.lexer._type = 49;
                state.push_fn(set_production /*37*/, 37);
                consume(state);
                scan(state.lexer, 43, 6);
                if ((state.lexer._type == 50)) {
                    consume(state);
                    state.push_fn(branch_79d483fe047ab999, 37);
                    return hc_symbols__identifier(state, db, 0);
                };
                return - 1;
            } else {
                state.lexer._type = 49;
                state.push_fn(set_production /*37*/, 37);
                consume(state);
                scan(state.lexer, 44, 6);
                if ((state.lexer._type == 51)) {
                    consume(state);
                    state.push_fn(branch_ce4d56919f991cf0, 37);
                    return hc_symbols__identifier(state, db, 0);
                };
                return - 1;
            }
        } else if (state.lexer._type == 52) {
            consume(state);
            scan(state.lexer, 42, 6);
            if (state.lexer._type == 47) {
                state.push_fn(set_production /*37*/, 37);
                consume(state);
                state.push_fn(branch_fe5a48fff62a6171, 37);
                return hc_functions__js_data(state, db, 0);
            } else if (state.lexer._type == 50) {
                state.push_fn(set_production /*37*/, 37);
                consume(state);
                state.push_fn(branch_79d483fe047ab999, 37);
                return hc_symbols__identifier(state, db, 0);
            } else if (state.lexer._type == 51) {
                state.push_fn(set_production /*37*/, 37);
                consume(state);
                state.push_fn(branch_ce4d56919f991cf0, 37);
                return hc_symbols__identifier(state, db, 0);
            }
        };
        return - 1;
    }

    function branch_d5acfc15b8500afc(state, db, prod) {
        add_reduce(state, 1, 3);
        return hc_state_ir__top_level_instructions_list_324_goto(state, db, 69);
    }

    function branch_d63d3ec8bde71654(state, db, prod) {
        add_reduce(state, 1, 20);
        return 0;
    }

    function branch_d86f42b4b027bc9e(state, db, prod) {
        scan(state.lexer, 39, 4);
        if ((state.lexer._type == 29)) {
            consume(state);
            state.push_fn(branch_c6869aa137a8ea23, 53);
            return hc_state_ir__instruction_sequence(state, db, 0);
        };
        return - 1;
    }

    function branch_d8b9d1a06e731916(state, db, prod) {
        scan(state.lexer, 9, 6);
        if (state.lexer._type == 19 || state.lexer._type == 20) {
            consume(state);
            scan(state.lexer, 37, 6);
            if ((state.lexer._type == 3)) {
                consume(state);
                scan(state.lexer, 6, 38);
                if ((state.lexer._type == 7)) {
                    consume(state);
                    add_reduce(state, 6, 14);
                    return 16;
                }
            }
        };
        return - 1;
    }

    function branch_d8cc48062f36754d(state, db, prod) {
        scan(state.lexer, 13, 6);
        if ((state.lexer._type == 31)) {
            consume(state);
            add_reduce(state, 3, 50);
            return 0;
        };
        return - 1;
    }

    function branch_da7cbab25d1d071b(state, db, prod) {
        add_reduce(state, 1, 36);
        return 0;
    }

    function branch_dae19cc841547194(state, db, prod) {
        add_reduce(state, 2, 68);
        return 79;
    }

    function branch_dd0d4861991a0119(state, db, prod) {
        add_reduce(state, 2, 22);
        return 0;
    }

    function branch_e7c6cf474b7f2992(state, db, prod) {
        scan(state.lexer, 39, 4);
        if ((state.lexer._type == 29)) {
            consume(state);
            state.push_fn(branch_342e83f419f22e64, 53);
            return hc_state_ir__instruction_sequence(state, db, 0);
        };
        return - 1;
    }

    function branch_e814bd4316aa352c(state, db, prod) {
        scan(state.lexer, 14, 6);
        state.push_fn(branch_369b943c675e5e2d, 0);
        return hc_productions__production_start_symbol(state, db, 0);
    }

    function branch_e822cc50e69d2e45(state, db, prod) {
        scan(state.lexer, 45, 4);
        if ((state.lexer._type == 10)) {
            consume(state);
            add_reduce(state, 3, 0);
            return 0;
        };
        return - 1;
    }

    function branch_e8c7e86227b3f492(state, db, prod) {
        add_reduce(state, 1, 102);
        return 64;
    }

    function branch_e9105a4f292094df(state, db, prod) {
        add_reduce(state, 2, 24);
        return 0;
    }

    function branch_e966de403727b7f2(state, db, prod) {
        add_reduce(state, 1, 16);
        return 18;
    }

    function branch_ea87792c9e6ce63c(state, db, prod) {
        scan(state.lexer, 5, 6);
        if ((state.lexer._type == 13)) {
            state.push_fn(branch_1b3a59829d8a964d, 70);
            return hc_symbols__imported_production_symbol(state, db, 0);
        };
        return - 1;
    }

    function branch_ef0be4e730691d7b(state, db, prod) {
        scan(state.lexer, 28, 4);
        state.push_fn(branch_216ecdf1d3e6112b, 0);
        return hc_symbols__production_symbol(state, db, 0);
    }

    function branch_f2b61c64c3c02479(state, db, prod) {
        state.push_fn(branch_6513e5778b4dcb4f, 49);
        return hc_symbols__imported_production_symbol(state, db, 0);
    }

    function branch_f3f900cc4027675e(state, db, prod) {
        add_reduce(state, 1, 3);
        return hc_preambles__preamble_goto(state, db, 3);
    }

    function branch_f4d2203a1c29baf5(state, db, prod) {
        add_reduce(state, 1, 3);
        return hc_state_ir__instruction_sequence_list_335_goto(state, db, 71);
    }

    function branch_f50bdf0d97d5d7d7(state, db, prod) {
        scan(state.lexer, 6, 38);
        if ((state.lexer._type == 7)) {
            consume(state);
            add_reduce(state, 7, 11);
            return 15;
        };
        return - 1;
    }

    function branch_f7de3da658dea4ce(state, db, prod) {
        add_reduce(state, 3, 30);
        return 0;
    }

    function branch_fa6b77408f542112(state, db, prod) {
        add_reduce(state, 1, 3);
        return hc_production_bodies__body_entry_list_167_goto(state, db, 66);
    }

    function branch_fd28a1b97a9a58de(state, db, prod) {
        scan(state.lexer, 29, 6);
        if (state.lexer._type == 23) {
            var pk = state.lexer.copy_in_place();;
            pk.next();
            scan(pk, 30, 19);
            if (pk._type == 2 || pk._type == 3 || pk._type == 5 || pk._type == 8) {
                state.lexer._type = 23;
                state.push_fn(set_production /*24*/, 24);
                state.push_fn(branch_40e4337463d2865c, 24);
                return hc_production_bodies__production_bodies(state, db, 0);
            }
        } else if (isTokenActive(state.lexer._type, 31)) {
            state.push_fn(set_production /*24*/, 24);
            state.push_fn(branch_40e4337463d2865c, 24);
            return hc_production_bodies__production_bodies(state, db, 0);
        } else {
            add_reduce(state, 4, 28);
            return 24;
        };
        return - 1;
    }

    function branch_fe5a48fff62a6171(state, db, prod) {
        scan(state.lexer, 40, 6);
        if ((state.lexer._type == 48)) {
            consume(state);
            add_reduce(state, 5, 52);
            return 0;
        };
        return - 1;
    }

    function hc_hydrocarbon(state, db, prod) {
        state.push_fn(set_production /*0*/, 0);
        return hc_head(state, db, 0);
    }

    function hc_head(state, db, prod) {
        scan(state.lexer, 46, 6);
        if (state.lexer._type == 11 || state.lexer._type == 18 || state.lexer._type == 21 || state.lexer._type == 23) {
            state.push_fn(set_production /*1*/, 1);
            state.push_fn(branch_4d9ad2a909c7c47e, 1);
            return hc_preambles__preamble(state, db, 0);
        } else {
            state.push_fn(set_production /*1*/, 1);
            state.push_fn(branch_867d2b18947b7461, 1);
            return hc_productions__productions(state, db, 0);
        };
        return - 1;
    }

    function hc_state_ir__comment(state, db, prod) {
        scan(state.lexer, 47, 4);
        if (state.lexer._type == 9) {
            consume(state);
            scan(state.lexer, 48, 0);
            if (state.lexer._type == 10) {
                state.push_fn(set_production /*2*/, 2);
                consume(state);
                add_reduce(state, 2, 0);
                return 0;
            } else {
                state.push_fn(set_production /*2*/, 2);
                state.push_fn(branch_e822cc50e69d2e45, 2);
                return hc_state_ir__comment_list_6(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_preambles__preamble(state, db, prod) {
        state.push_fn(branch_f3f900cc4027675e, 3);
        return hc_preambles__preamble_clause(state, db, 0);
    }

    function hc_preambles__preamble_goto(state, db, prod) {
        scan(state.lexer, 46, 6);
        if (state.lexer._type == 11 || state.lexer._type == 18 || state.lexer._type == 21 || state.lexer._type == 23) {
            state.push_fn(hc_preambles__preamble_goto /*hc_preambles__preamble_goto( state, db, 3 )*/, 3);
            scan(state.lexer, 49, 6);
            if ((state.lexer._type == 11 || state.lexer._type == 18 || state.lexer._type == 21 || state.lexer._type == 23)) {
                state.push_fn(branch_28ab10e2751570b2, 3);
                return hc_preambles__preamble_clause(state, db, 0);
            };
            return - 1;
        };
        return (prod == 3) ? prod : - 1;
    }

    function hc_preambles__preamble_clause(state, db, prod) {
        scan(state.lexer, 49, 6);
        if (state.lexer._type == 11) {
            state.push_fn(set_production /*4*/, 4);
            state.push_fn(set_production /*0*/, 4);
            return hc_preambles__ignore_preamble(state, db, 0);
        } else if (state.lexer._type == 18) {
            state.push_fn(set_production /*4*/, 4);
            state.push_fn(set_production /*0*/, 4);
            return hc_preambles__import_preamble(state, db, 0);
        } else if (state.lexer._type == 21) {
            state.push_fn(set_production /*4*/, 4);
            state.push_fn(set_production /*0*/, 4);
            return hc_preambles__export_preamble(state, db, 0);
        } else {
            state.push_fn(set_production /*4*/, 4);
            state.push_fn(set_production /*0*/, 4);
            return hc_comments__comment(state, db, 0);
        };
        return - 1;
    }

    function hc_preambles__ignore_preamble(state, db, prod) {
        scan(state.lexer, 50, 6);
        if (state.lexer._type == 11) {
            consume(state);
            scan(state.lexer, 51, 6);
            if ((state.lexer._type == 12 || state.lexer._type == 15 || state.lexer._type == 16 || state.lexer._type == 17)) {
                state.push_fn(branch_9e8b483fb07aa4f4, 5);
                return hc_symbols__ignore_symbols(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_symbols__ignore_symbols(state, db, prod) {
        state.push_fn(branch_91cc41aa447c6f0b, 6);
        return hc_symbols__ignore_symbol(state, db, 0);
    }

    function hc_symbols__ignore_symbols_goto(state, db, prod) {
        scan(state.lexer, 51, 38);
        if (state.lexer._type == 12 || state.lexer._type == 15 || state.lexer._type == 16 || state.lexer._type == 17) {
            state.push_fn(hc_symbols__ignore_symbols_goto /*hc_symbols__ignore_symbols_goto( state, db, 6 )*/, 6);
            scan(state.lexer, 51, 6);
            if ((state.lexer._type == 12 || state.lexer._type == 15 || state.lexer._type == 16 || state.lexer._type == 17)) {
                state.push_fn(branch_28ab10e2751570b2, 6);
                return hc_symbols__ignore_symbol(state, db, 0);
            };
            return - 1;
        };
        return (prod == 6) ? prod : - 1;
    }

    function hc_symbols__ignore_symbol(state, db, prod) {
        scan(state.lexer, 51, 6);
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
        scan(state.lexer, 52, 6);
        if (state.lexer._type == 12) {
            consume(state);
            scan(state.lexer, 5, 6);
            if ((state.lexer._type == 13)) {
                state.push_fn(branch_08b0ded33d421dcd, 8);
                return hc_symbols__identifier(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_symbols__identifier(state, db, prod) {
        scan(state.lexer, 5, 6);
        if (state.lexer._type == 13) {
            consume(state);
            scan(state.lexer, 53, 0);
            return 9;
        };
        return - 1;
    }

    function hc_symbols__identifier_syms(state, db, prod) {
        scan(state.lexer, 54, 6);
        if (state.lexer._type == 14 || state.lexer._type == 3) {
            consume(state);
            return hc_symbols__identifier_syms_goto(state, db, 10);
        };
        return - 1;
    }

    function hc_symbols__identifier_syms_goto(state, db, prod) {
        scan(state.lexer, 55, 0);
        if (state.lexer._type == 14) {
            state.push_fn(hc_symbols__identifier_syms_goto /*hc_symbols__identifier_syms_goto( state, db, 10 )*/, 10);
            scan(state.lexer, 56, 0);
            consume(state);
            add_reduce(state, 2, 7);
            return 0;
        } else if (state.lexer._type == 3) {
            state.push_fn(hc_symbols__identifier_syms_goto /*hc_symbols__identifier_syms_goto( state, db, 10 )*/, 10);
            scan(state.lexer, 57, 0);
            consume(state);
            add_reduce(state, 2, 7);
            return 0;
        } else if (state.lexer._type == 5) {
            state.push_fn(hc_symbols__identifier_syms_goto /*hc_symbols__identifier_syms_goto( state, db, 10 )*/, 10);
            scan(state.lexer, 58, 0);
            consume(state);
            add_reduce(state, 2, 7);
            return 0;
        };
        return (prod == 10) ? prod : - 1;
    }

    function hc_symbols__literal_symbol(state, db, prod) {
        scan(state.lexer, 59, 6);
        if (state.lexer._type == 15) {
            consume(state);
            scan(state.lexer, 60, 6);
            state.push_fn(branch_0668f4b0c4a385bd, 0);
            return hc_symbols__literal_symbol_list_48(state, db, 0);
        };
        return - 1;
    }

    function hc_symbols__sym_delimiter(state, db, prod) {
        scan(state.lexer, 61, 0);
        if (state.lexer._type == 8 || state.lexer._type == 1 || state.lexer._type == 7) {
            consume(state);
            return 12;
        };
        return - 1;
    }

    function hc_symbols__escaped_symbol(state, db, prod) {
        scan(state.lexer, 62, 6);
        if (state.lexer._type == 16) {
            consume(state);
            scan(state.lexer, 30, 6);
            if ((state.lexer._type == 5 || state.lexer._type == 3 || state.lexer._type == 2)) {
                state.push_fn(branch_91f93516da7e8fc1, 13);
                return hc_symbols__escaped_symbol_list_54(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_symbols__production_token_symbol(state, db, prod) {
        scan(state.lexer, 63, 6);
        if (state.lexer._type == 17) {
            consume(state);
            scan(state.lexer, 5, 6);
            if ((state.lexer._type == 13)) {
                state.push_fn(branch_25b8891a3f092370, 14);
                return hc_symbols__identifier(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_preambles__import_preamble(state, db, prod) {
        scan(state.lexer, 64, 6);
        if (state.lexer._type == 18) {
            consume(state);
            scan(state.lexer, 32, 19);
            if (state.lexer._type == 8) {
                scan(state.lexer, 6, 19);
                state.push_fn(branch_5fd7ea4e229484ff, 0);
                return hc_preambles__import_preamble_list_59(state, db, 0);
            } else {
                scan(state.lexer, 32, 6);
                state.push_fn(branch_a993a3de58015421, 0);
                return hc_preambles__import_preamble_list_60(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_preambles__export_preamble(state, db, prod) {
        scan(state.lexer, 65, 6);
        if (state.lexer._type == 21) {
            consume(state);
            scan(state.lexer, 5, 19);
            if (state.lexer._type == 8) {
                scan(state.lexer, 6, 19);
                state.push_fn(branch_7522edc2a9b0cba1, 0);
                return hc_preambles__import_preamble_list_59(state, db, 0);
            } else {
                var fk1 = state.fork(db);;
                fk1.push_fn(branch_0587b78912f6b6dd, 16);
                state.push_fn(branch_46892305452de530, 16);
                return 0;
            }
        };
        return - 1;
    }

    function hc_symbols__imported_production_symbol(state, db, prod) {
        state.push_fn(branch_6e96959f4d77795f, 17);
        return hc_symbols__identifier(state, db, 0);
    }

    function hc_symbols__production_symbol(state, db, prod) {
        state.push_fn(branch_e966de403727b7f2, 18);
        return hc_symbols__identifier(state, db, 0);
    }

    function hc_comments__comment(state, db, prod) {
        state.push_fn(set_production /*19*/, 19);
        return hc_comments__cm(state, db, 0);
    }

    function hc_comments__cm(state, db, prod) {
        scan(state.lexer, 66, 6);
        if (state.lexer._type == 23) {
            consume(state);
            scan(state.lexer, 30, 19);
            if ((state.lexer._type == 2 || state.lexer._type == 3 || state.lexer._type == 5 || state.lexer._type == 8)) {
                state.push_fn(branch_168d564cb6977a29, 20);
                return hc_comments__cm_list_110(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_comments__comment_primitive(state, db, prod) {
        scan(state.lexer, 30, 19);
        if (state.lexer._type == 2 || state.lexer._type == 3 || state.lexer._type == 5 || state.lexer._type == 8) {
            consume(state);
            return 21;
        };
        return - 1;
    }

    function hc_comments__comment_delimiter(state, db, prod) {
        scan(state.lexer, 6, 38);
        if (state.lexer._type == 7) {
            consume(state);
            scan(state.lexer, 6, 6);
            return 22;
        };
        return - 1;
    }

    function hc_productions__productions(state, db, prod) {
        scan(state.lexer, 67, 6);
        if (state.lexer._type == 24 || state.lexer._type == 26) {
            state.push_fn(hc_productions__productions_goto /*hc_productions__productions_goto( state, db, 23 )*/, 23);
            state.push_fn(branch_53c7b8a1453ec235, 23);
            return hc_productions__production(state, db, 0);
        } else if (state.lexer._type == 53) {
            state.push_fn(hc_productions__productions_goto /*hc_productions__productions_goto( state, db, 23 )*/, 23);
            state.push_fn(branch_bfbf48847a946a6f, 23);
            return hc_functions__referenced_function(state, db, 0);
        } else {
            state.push_fn(hc_productions__productions_goto /*hc_productions__productions_goto( state, db, 23 )*/, 23);
            state.push_fn(branch_d63d3ec8bde71654, 23);
            return hc_state_ir__grammar_injection(state, db, 0);
        };
        return - 1;
    }

    function hc_productions__productions_goto(state, db, prod) {
        while (true) {
            switch (prod) {
                case 23:
                    {
                        scan(state.lexer, 68, 6);
                        if (state.lexer._type == 24 || state.lexer._type == 26) {
                            state.push_fn(hc_productions__productions_goto /*hc_productions__productions_goto( state, db, 23 )*/, 23);
                            scan(state.lexer, 69, 6);
                            if ((state.lexer._type == 24 || state.lexer._type == 26)) {
                                state.push_fn(branch_ad5c187ba038713b, 23);
                                return hc_productions__production(state, db, 0);
                            };
                            return - 1;
                        } else if (state.lexer._type == 53) {
                            state.push_fn(hc_productions__productions_goto /*hc_productions__productions_goto( state, db, 23 )*/, 23);
                            scan(state.lexer, 70, 6);
                            if ((state.lexer._type == 53)) {
                                state.push_fn(branch_dd0d4861991a0119, 23);
                                return hc_functions__referenced_function(state, db, 0);
                            };
                            return - 1;
                        } else if (state.lexer._type == 54) {
                            state.push_fn(hc_productions__productions_goto /*hc_productions__productions_goto( state, db, 23 )*/, 23);
                            scan(state.lexer, 71, 6);
                            if ((state.lexer._type == 54)) {
                                state.push_fn(branch_687f18730960b285, 23);
                                return hc_state_ir__grammar_injection(state, db, 0);
                            };
                            return - 1;
                        } else if (state.lexer._type == 23) {
                            state.push_fn(hc_productions__productions_goto /*hc_productions__productions_goto( state, db, 23 )*/, 23);
                            scan(state.lexer, 66, 6);
                            if ((state.lexer._type == 23)) {
                                state.push_fn(branch_e9105a4f292094df, 23);
                                return hc_comments__comment(state, db, 0);
                            };
                            return - 1;
                        } else {
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
        scan(state.lexer, 69, 6);
        if (state.lexer._type == 24) {
            consume(state);
            scan(state.lexer, 72, 6);
            if (state.lexer._type == 25) {
                consume(state);
                scan(state.lexer, 5, 6);
                state.push_fn(branch_137ef0085e910c83, 0);
                return hc_productions__production_group_130_0_(state, db, 0);
            } else {
                scan(state.lexer, 5, 6);
                state.push_fn(branch_e814bd4316aa352c, 0);
                return hc_productions__production_group_130_0_(state, db, 0);
            }
        } else if (state.lexer._type == 26) {
            state.push_fn(set_production /*24*/, 24);
            consume(state);
            state.push_fn(branch_c42c47ca94ba63f7, 24);
            return hc_productions__production_group_135_0_(state, db, 0);
        };
        return - 1;
    }

    function hc_symbols__production_id(state, db, prod) {
        state.push_fn(set_production /*25*/, 25);
        return hc_symbols__identifier(state, db, 0);
    }

    function hc_productions__production_start_symbol(state, db, prod) {
        scan(state.lexer, 14, 6);
        if (state.lexer._type == 27) {
            consume(state);
            scan(state.lexer, 6, 6);
            return 26;
        };
        return - 1;
    }

    function hc_production_bodies__production_bodies(state, db, prod) {
        scan(state.lexer, 73, 6);
        if (state.lexer._type == 23) {
            state.push_fn(hc_production_bodies__production_bodies_goto /*hc_production_bodies__production_bodies_goto( state, db, 27 )*/, 27);
            state.push_fn(branch_232f37efe656dae6, 27);
            return hc_comments__comment(state, db, 0);
        } else {
            state.push_fn(hc_production_bodies__production_bodies_goto /*hc_production_bodies__production_bodies_goto( state, db, 27 )*/, 27);
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
                        scan(state.lexer, 74, 6);
                        if (state.lexer._type == 28) {
                            consume(state);
                            scan(state.lexer, 73, 6);
                            if (state.lexer._type == 23) {
                                state.push_fn(hc_production_bodies__production_bodies_goto /*hc_production_bodies__production_bodies_goto( state, db, 27 )*/, 27);
                                state.push_fn(branch_f7de3da658dea4ce, 27);
                                return hc_comments__comment(state, db, 0);
                            } else {
                                state.push_fn(hc_production_bodies__production_bodies_goto /*hc_production_bodies__production_bodies_goto( state, db, 27 )*/, 27);
                                state.push_fn(branch_f7de3da658dea4ce, 27);
                                return hc_production_bodies__production_body(state, db, 0);
                            }
                        } else if (isTokenActive(state.lexer._type, 75)) {
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
        scan(state.lexer, 76, 6);
        if (state.lexer._type == 29) {
            var pk = state.lexer.copy_in_place();;
            pk.next();
            scan(pk, 77, 6);
            if (pk._type == 30) {
                consume(state);
                scan(state.lexer, 78, 6);
                if (state.lexer._type == 30) {
                    consume(state);
                    scan(state.lexer, 13, 6);
                    if (state.lexer._type == 31) {
                        consume(state);
                        scan(state.lexer, 76, 6);
                        state.push_fn(branch_4beaf85730ce1be4, 0);
                        return hc_production_bodies__entries(state, db, 0);
                    }
                }
            } else {
                scan(state.lexer, 76, 6);
                state.push_fn(branch_24972784e7ba4f8a, 0);
                return hc_production_bodies__entries(state, db, 0);
            }
        } else {
            scan(state.lexer, 76, 6);
            state.push_fn(branch_24972784e7ba4f8a, 0);
            return hc_production_bodies__entries(state, db, 0);
        };
        return - 1;
    }

    function hc_production_bodies__entries(state, db, prod) {
        scan(state.lexer, 76, 6);
        if (state.lexer._type == 45) {
            state.push_fn(hc_production_bodies__entries_goto /*hc_production_bodies__entries_goto( state, db, 29 )*/, 29);
            state.push_fn(branch_da7cbab25d1d071b, 29);
            return hc_symbols__empty_symbol(state, db, 0);
        } else {
            state.push_fn(hc_production_bodies__entries_goto /*hc_production_bodies__entries_goto( state, db, 29 )*/, 29);
            state.push_fn(branch_bc3c3efd94a44644, 29);
            return hc_production_bodies__body_entry(state, db, 0);
        };
        return - 1;
    }

    function hc_production_bodies__entries_goto(state, db, prod) {
        while (true) {
            switch (prod) {
                case 29:
                    {
                        scan(state.lexer, 79, 6);
                        if (isTokenActive(state.lexer._type, 80)) {
                            return 29;
                        } else if (isTokenActive(state.lexer._type, 81)) {
                            state.push_fn(hc_production_bodies__entries_goto /*hc_production_bodies__entries_goto( state, db, 29 )*/, 29);
                            scan(state.lexer, 82, 6);
                            if ((isTokenActive(state.lexer._type, 81))) {
                                state.push_fn(branch_3ce05169be6fd8ef, 29);
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
        scan(state.lexer, 82, 6);
        if (isTokenActive(state.lexer._type, 83)) {
            state.push_fn(set_production /*30*/, 30);
            state.push_fn(branch_232f37efe656dae6, 30);
            return hc_symbols__symbol(state, db, 0);
        } else if (isTokenActive(state.lexer._type, 84)) {
            state.push_fn(set_production /*30*/, 30);
            state.push_fn(branch_232f37efe656dae6, 30);
            return hc_symbols__meta_symbol(state, db, 0);
        } else if (state.lexer._type == 32) {
            state.push_fn(set_production /*30*/, 30);
            consume(state);
            state.push_fn(branch_7839a02c7751524a, 30);
            return hc_production_bodies__body_entry_list_167(state, db, 0);
        };
        return - 1;
    }

    function hc_symbols__symbol(state, db, prod) {
        scan(state.lexer, 85, 6);
        if (state.lexer._type == 35) {
            state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 31 )*/, 31);
            consume(state);
            state.push_fn(branch_96d3d6971695bb5f, 31);
            return hc_symbols__symbol(state, db, 0);
        } else if (state.lexer._type == 36) {
            state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 31 )*/, 31);
            consume(state);
            state.push_fn(branch_58a70e7a743ce1a8, 31);
            return hc_symbols__symbol(state, db, 0);
        } else if (state.lexer._type == 12) {
            state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 31 )*/, 31);
            state.push_fn(set_production /*0*/, 31);
            return hc_symbols__generated_symbol(state, db, 0);
        } else if (state.lexer._type == 17) {
            state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 31 )*/, 31);
            state.push_fn(set_production /*0*/, 31);
            return hc_symbols__production_token_symbol(state, db, 0);
        } else if (state.lexer._type == 15) {
            state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 31 )*/, 31);
            state.push_fn(set_production /*0*/, 31);
            return hc_symbols__literal_symbol(state, db, 0);
        } else if (state.lexer._type == 16) {
            state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 31 )*/, 31);
            state.push_fn(set_production /*0*/, 31);
            return hc_symbols__escaped_symbol(state, db, 0);
        } else if (state.lexer._type == 39) {
            state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 31 )*/, 31);
            state.push_fn(set_production /*0*/, 31);
            return hc_symbols__EOF_symbol(state, db, 0);
        } else if (state.lexer._type == 29) {
            state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 31 )*/, 31);
            consume(state);
            state.push_fn(branch_59b5dec1e0b32356, 31);
            return hc_production_bodies__production_bodies(state, db, 0);
        } else if (state.lexer._type == 13) {
            state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 9 )*/, 9);
            state.push_fn(set_production /*0*/, 9);
            return hc_symbols__identifier(state, db, prod);
        } else if (state.lexer._type == 2) {
            state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 31 )*/, 31);
            consume(state);
            add_reduce(state, 1, 43);
            return 0;
        };
        return - 1;
    }

    function hc_symbols__symbol_goto(state, db, prod) {
        while (true) {
            switch (prod) {
                case 9:
                    {
                        scan(state.lexer, 86, 19);
                        if (state.lexer._type == 22) {
                            state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 31 )*/, 31);
                            scan(state.lexer, 35, 6);
                            consume(state);
                            state.push_fn(branch_8118c1774fdfffd3, 31);
                            return hc_symbols__identifier(state, db, 0);
                        } else {
                            scan(state.lexer, 19, 19);
                            add_reduce(state, 1, 16);
                            prod = 31;
                            continue;
                        };
                        break;
                    }
                    break;
                case 31:
                    {
                        scan(state.lexer, 87, 6);
                        if (state.lexer._type == 31) {
                            return 31;
                        } else if (state.lexer._type == 37 || state.lexer._type == 38) {
                            consume(state);
                            scan(state.lexer, 88, 6);
                            if (state.lexer._type == 12 || state.lexer._type == 15 || state.lexer._type == 16) {
                                state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 31 )*/, 31);
                                state.push_fn(branch_0f048625c3489a40, 31);
                                return hc_symbols__terminal_symbol(state, db, 0);
                            } else if (state.lexer._type == 31) {
                                state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 31 )*/, 31);
                                consume(state);
                                add_reduce(state, 3, 44);
                                return 0;
                            }
                        } else if (state.lexer._type == 34) {
                            state.push_fn(hc_symbols__symbol_goto /*hc_symbols__symbol_goto( state, db, 31 )*/, 31);
                            scan(state.lexer, 89, 6);
                            consume(state);
                            add_reduce(state, 2, 38);
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
        return (prod == 31) ? prod : - 1;
    }

    function hc_symbols__EOF_symbol(state, db, prod) {
        scan(state.lexer, 90, 6);
        if (state.lexer._type == 39) {
            consume(state);
            scan(state.lexer, 19, 19);
            add_reduce(state, 1, 45);
            return 32;
        };
        return - 1;
    }

    function hc_symbols__terminal_symbol(state, db, prod) {
        scan(state.lexer, 91, 6);
        if (state.lexer._type == 12) {
            state.push_fn(set_production /*33*/, 33);
            state.push_fn(set_production /*0*/, 33);
            return hc_symbols__generated_symbol(state, db, 0);
        } else if (state.lexer._type == 15) {
            state.push_fn(set_production /*33*/, 33);
            state.push_fn(set_production /*0*/, 33);
            return hc_symbols__literal_symbol(state, db, 0);
        } else {
            state.push_fn(set_production /*33*/, 33);
            state.push_fn(set_production /*0*/, 33);
            return hc_symbols__escaped_symbol(state, db, 0);
        };
        return - 1;
    }

    function hc_symbols__meta_symbol(state, db, prod) {
        scan(state.lexer, 92, 6);
        if (state.lexer._type == 40) {
            state.push_fn(set_production /*34*/, 34);
            consume(state);
            state.push_fn(branch_a556dc24f4a9db73, 34);
            return hc_symbols__condition_symbol_list(state, db, 0);
        } else if (state.lexer._type == 41) {
            state.push_fn(set_production /*34*/, 34);
            consume(state);
            state.push_fn(branch_a3a046d24e9182ed, 34);
            return hc_symbols__condition_symbol_list(state, db, 0);
        } else if (state.lexer._type == 42) {
            state.push_fn(set_production /*34*/, 34);
            consume(state);
            state.push_fn(branch_71a788043652d3b3, 34);
            return hc_symbols__condition_symbol_list(state, db, 0);
        } else if (state.lexer._type == 43) {
            state.push_fn(set_production /*34*/, 34);
            consume(state);
            state.push_fn(branch_a2a0e2ae0881f501, 34);
            return hc_symbols__condition_symbol_list(state, db, 0);
        } else if (state.lexer._type == 44) {
            state.push_fn(set_production /*34*/, 34);
            consume(state);
            state.push_fn(branch_d8cc48062f36754d, 34);
            return hc_symbols__symbol(state, db, 0);
        };
        return - 1;
    }

    function hc_symbols__condition_symbol_list(state, db, prod) {
        state.push_fn(branch_75925eaf0d57aec7, 35);
        return hc_symbols__terminal_symbol(state, db, 0);
    }

    function hc_symbols__condition_symbol_list_goto(state, db, prod) {
        scan(state.lexer, 88, 6);
        if (state.lexer._type == 12 || state.lexer._type == 15 || state.lexer._type == 16) {
            state.push_fn(hc_symbols__condition_symbol_list_goto /*hc_symbols__condition_symbol_list_goto( state, db, 35 )*/, 35);
            scan(state.lexer, 91, 6);
            if ((state.lexer._type == 12 || state.lexer._type == 15 || state.lexer._type == 16)) {
                state.push_fn(branch_28ab10e2751570b2, 35);
                return hc_symbols__terminal_symbol(state, db, 0);
            };
            return - 1;
        } else if (state.lexer._type == 31) {
            return 35;
        };
        return (prod == 35) ? prod : - 1;
    }

    function hc_symbols__empty_symbol(state, db, prod) {
        scan(state.lexer, 93, 6);
        if (state.lexer._type == 45) {
            consume(state);
            scan(state.lexer, 6, 6);
            add_reduce(state, 1, 51);
            return 36;
        };
        return - 1;
    }

    function hc_functions__reduce_function(state, db, prod) {
        state.push_fn(branch_d4351a488686b130, 0);
        return hc_functions__js_function_start_symbol(state, db, 0);
    }

    function hc_functions__js_function_start_symbol(state, db, prod) {
        scan(state.lexer, 70, 6);
        if (state.lexer._type == 53) {
            consume(state);
            scan(state.lexer, 6, 6);
            add_reduce(state, 1, 55);
            return 38;
        };
        return - 1;
    }

    function hc_functions__js_data(state, db, prod) {
        scan(state.lexer, 94, 19);
        if (state.lexer._type == 47) {
            state.push_fn(hc_functions__js_data_goto /*hc_functions__js_data_goto( state, db, 39 )*/, 39);
            state.push_fn(set_production /*0*/, 39);
            return hc_functions__js_data_block(state, db, 0);
        } else if (isTokenActive(state.lexer._type, 95)) {
            state.push_fn(hc_functions__js_data_goto /*hc_functions__js_data_goto( state, db, 39 )*/, 39);
            state.push_fn(set_production /*0*/, 39);
            return hc_functions__js_primitive(state, db, 0);
        } else if (state.lexer._type == 1) {
            state.push_fn(hc_functions__js_data_goto /*hc_functions__js_data_goto( state, db, 39 )*/, 39);
            consume(state);
            return 0;
        };
        return - 1;
    }

    function hc_functions__js_data_goto(state, db, prod) {
        scan(state.lexer, 96, 19);
        if (state.lexer._type == 47) {
            state.push_fn(hc_functions__js_data_goto /*hc_functions__js_data_goto( state, db, 39 )*/, 39);
            scan(state.lexer, 34, 6);
            if ((state.lexer._type == 47)) {
                state.push_fn(branch_20b33064645a28fc, 39);
                return hc_functions__js_data_block(state, db, 0);
            };
            return - 1;
        } else if (state.lexer._type == 48) {
            return 39;
        } else if (isTokenActive(state.lexer._type, 95)) {
            state.push_fn(hc_functions__js_data_goto /*hc_functions__js_data_goto( state, db, 39 )*/, 39);
            scan(state.lexer, 97, 19);
            if ((isTokenActive(state.lexer._type, 95))) {
                state.push_fn(branch_20b33064645a28fc, 39);
                return hc_functions__js_primitive(state, db, 0);
            };
            return - 1;
        };
        return (prod == 39) ? prod : - 1;
    }

    function hc_functions__js_primitive(state, db, prod) {
        scan(state.lexer, 97, 19);
        if (state.lexer._type == 12) {
            state.push_fn(set_production /*40*/, 40);
            state.push_fn(set_production /*0*/, 40);
            return hc_symbols__generated_symbol(state, db, 0);
        } else if (state.lexer._type == 15) {
            state.push_fn(set_production /*40*/, 40);
            state.push_fn(set_production /*0*/, 40);
            return hc_symbols__literal_symbol(state, db, 0);
        } else if (state.lexer._type == 16) {
            state.push_fn(set_production /*40*/, 40);
            state.push_fn(set_production /*0*/, 40);
            return hc_symbols__escaped_symbol(state, db, 0);
        } else if (state.lexer._type == 39) {
            state.push_fn(set_production /*40*/, 40);
            state.push_fn(branch_96ee4499041b7d15, 40);
            return hc_symbols__EOF_symbol(state, db, 0);
        } else if (state.lexer._type == 3 || state.lexer._type == 5 || state.lexer._type == 8 || state.lexer._type == 2) {
            consume(state);
            return 40;
        };
        return - 1;
    }

    function hc_functions__js_data_block(state, db, prod) {
        scan(state.lexer, 34, 6);
        if (state.lexer._type == 47) {
            consume(state);
            scan(state.lexer, 94, 19);
            if ((isTokenActive(state.lexer._type, 98))) {
                state.push_fn(branch_a88403631e0c628b, 41);
                return hc_functions__js_data(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_functions__referenced_function(state, db, prod) {
        state.push_fn(branch_b56313c0e76236f1, 42);
        return hc_functions__referenced_function_group_267_0_(state, db, 0);
    }

    function hc_state_ir__grammar_injection(state, db, prod) {
        scan(state.lexer, 99, 4);
        if (state.lexer._type == 54) {
            consume(state);
            scan(state.lexer, 100, 4);
            if (state.lexer._type == 55) {
                consume(state);
                scan(state.lexer, 5, 6);
                if (state.lexer._type == 13) {
                    var fk1 = state.fork(db);;
                    fk1.push_fn(branch_30faacf91156076a, 43);
                    state.push_fn(branch_ef0be4e730691d7b, 43);
                    return 0;
                }
            } else if (state.lexer._type == 56) {
                consume(state);
                scan(state.lexer, 20, 4);
                if (state.lexer._type == 33) {
                    consume(state);
                    scan(state.lexer, 21, 4);
                    state.push_fn(branch_7f6e9713cd758921, 0);
                    return hc_state_ir__top_level_instructions(state, db, 0);
                }
            }
        };
        return - 1;
    }

    function hc_state_ir__state_hash_token(state, db, prod) {
        scan(state.lexer, 101, 4);
        if (state.lexer._type == 3 || state.lexer._type == 5 || state.lexer._type == 14 || state.lexer._type == 57) {
            consume(state);
            return hc_state_ir__state_hash_token_goto(state, db, 44);
        };
        return - 1;
    }

    function hc_state_ir__state_hash_token_goto(state, db, prod) {
        scan(state.lexer, 102, 103);
        if (state.lexer._type == 14) {
            state.push_fn(hc_state_ir__state_hash_token_goto /*hc_state_ir__state_hash_token_goto( state, db, 44 )*/, 44);
            scan(state.lexer, 104, 103);
            consume(state);
            add_reduce(state, 2, 0);
            return 0;
        } else if (state.lexer._type == 57) {
            state.push_fn(hc_state_ir__state_hash_token_goto /*hc_state_ir__state_hash_token_goto( state, db, 44 )*/, 44);
            scan(state.lexer, 105, 103);
            consume(state);
            add_reduce(state, 2, 0);
            return 0;
        } else if (state.lexer._type == 5) {
            state.push_fn(hc_state_ir__state_hash_token_goto /*hc_state_ir__state_hash_token_goto( state, db, 44 )*/, 44);
            scan(state.lexer, 106, 103);
            consume(state);
            add_reduce(state, 2, 0);
            return 0;
        } else if (state.lexer._type == 3) {
            state.push_fn(hc_state_ir__state_hash_token_goto /*hc_state_ir__state_hash_token_goto( state, db, 44 )*/, 44);
            scan(state.lexer, 107, 103);
            consume(state);
            add_reduce(state, 2, 0);
            return 0;
        };
        return (prod == 44) ? prod : - 1;
    }

    function hc_state_ir__top_level_instructions(state, db, prod) {
        scan(state.lexer, 21, 4);
        if (isTokenActive(state.lexer._type, 108)) {
            state.push_fn(set_production /*45*/, 45);
            state.push_fn(set_production /*0*/, 45);
            return hc_state_ir__instruction_sequence(state, db, 0);
        } else if (state.lexer._type == 79 || state.lexer._type == 80 || state.lexer._type == 81 || state.lexer._type == 82) {
            state.push_fn(set_production /*45*/, 45);
            state.push_fn(set_production /*0*/, 45);
            return hc_state_ir__top_level_instructions_list_324(state, db, 0);
        } else if (state.lexer._type == 58) {
            state.push_fn(set_production /*45*/, 45);
            state.push_fn(set_production /*0*/, 45);
            return hc_state_ir__top_level_instructions_list_323(state, db, 0);
        };
        return - 1;
    }

    function hc_state_ir__prod_branch_instruction(state, db, prod) {
        scan(state.lexer, 11, 4);
        if (state.lexer._type == 58) {
            consume(state);
            scan(state.lexer, 109, 4);
            if ((state.lexer._type == 59)) {
                consume(state);
                state.push_fn(branch_82b126017e807534, 46);
                return hc_state_ir__production_id_list(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_state_ir__production_id_list(state, db, prod) {
        scan(state.lexer, 110, 4);
        if (state.lexer._type == 32) {
            consume(state);
            scan(state.lexer, 111, 4);
            if ((state.lexer._type == 5 || state.lexer._type == 13)) {
                state.push_fn(branch_b52492310c1ad8cd, 47);
                return hc_state_ir__production_id_list_list_333(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_state_ir__instruction_sequence(state, db, prod) {
        scan(state.lexer, 112, 4);
        if (state.lexer._type == 61) {
            state.push_fn(set_production /*48*/, 48);
            state.lexer.setToken(2, 0, 0);
            consume(state);
            return 0;
        } else if (isTokenActive(state.lexer._type, 113)) {
            scan(state.lexer, 114, 4);
            state.push_fn(branch_2b6f1793d271c5f6, 0);
            return hc_state_ir__instruction_sequence_list_335(state, db, 0);
        } else if (state.lexer._type == 78) {
            scan(state.lexer, 26, 4);
            state.push_fn(branch_be8412860dc4e514, 0);
            return hc_state_ir__instruction_sequence_list_338(state, db, 0);
        } else if (state.lexer._type == 60) {
            state.push_fn(set_production /*48*/, 48);
            state.push_fn(branch_232f37efe656dae6, 48);
            return hc_state_ir__instruction_sequence_group_342_0_(state, db, 0);
        };
        state.lexer.setToken(2, 0, 0);
        consume(state);
        return 48;
    }

    function hc_state_ir__sequence_instruction(state, db, prod) {
        scan(state.lexer, 114, 4);
        if (state.lexer._type == 73 || state.lexer._type == 74) {
            consume(state);
            add_reduce(state, 1, 81);
            return 49;
        } else if (state.lexer._type == 62) {
            consume(state);
            scan(state.lexer, 115, 4);
            if (state.lexer._type == 53) {
                var fk1 = state.fork(db);;
                fk1.push_fn(branch_38e9b80825474aa0, 49);
                state.push_fn(branch_312cacadccd66e8b, 49);
                return 0;
            } else if (state.lexer._type == 5) {
                state.push_fn(set_production /*49*/, 49);
                consume(state);
                scan(state.lexer, 116, 4);
                if ((state.lexer._type == 5)) {
                    consume(state);
                    add_reduce(state, 3, 73);
                    return 0;
                };
                return - 1;
            }
        } else if (state.lexer._type == 63) {
            consume(state);
            scan(state.lexer, 117, 4);
            if (state.lexer._type == 59) {
                consume(state);
                scan(state.lexer, 118, 4);
                if (state.lexer._type == 64) {
                    consume(state);
                    scan(state.lexer, 119, 6);
                    if (state.lexer._type == 13) {
                        var fk1 = state.fork(db);;
                        fk1.push_fn(branch_f2b61c64c3c02479, 49);
                        state.push_fn(branch_cf24bfc02c133c76, 49);
                        return 0;
                    } else {
                        state.push_fn(set_production /*49*/, 49);
                        state.push_fn(branch_66b9bad47c4bd243, 49);
                        return hc_state_ir__sequence_instruction_group_361_0_(state, db, 0);
                    }
                }
            } else if (state.lexer._type == 70) {
                consume(state);
                scan(state.lexer, 120, 4);
                if (state.lexer._type == 71) {
                    state.push_fn(set_production /*49*/, 49);
                    consume(state);
                    scan(state.lexer, 116, 4);
                    if ((state.lexer._type == 5)) {
                        consume(state);
                        add_reduce(state, 4, 79);
                        return 0;
                    };
                    return - 1;
                } else if (state.lexer._type == 72) {
                    consume(state);
                    scan(state.lexer, 121, 6);
                    if (state.lexer._type == 12 || state.lexer._type == 15 || state.lexer._type == 16) {
                        state.push_fn(set_production /*49*/, 49);
                        state.push_fn(branch_15b827a36beefcbb, 49);
                        return hc_symbols__terminal_symbol(state, db, 0);
                    } else {
                        state.push_fn(set_production /*49*/, 49);
                        state.push_fn(branch_15b827a36beefcbb, 49);
                        return hc_state_ir__sequence_instruction_group_381_0_(state, db, 0);
                    }
                }
            }
        } else if (state.lexer._type == 65) {
            state.push_fn(set_production /*49*/, 49);
            consume(state);
            scan(state.lexer, 118, 4);
            if ((state.lexer._type == 64)) {
                consume(state);
                scan(state.lexer, 39, 4);
                if ((state.lexer._type == 29)) {
                    consume(state);
                    state.push_fn(branch_bf72bc5b39a9e5a7, 49);
                    return hc_state_ir__sequence_instruction_list_366(state, db, 0);
                }
            };
            return - 1;
        } else if (state.lexer._type == 66) {
            consume(state);
            scan(state.lexer, 122, 4);
            if (state.lexer._type == 67) {
                state.push_fn(set_production /*49*/, 49);
                consume(state);
                scan(state.lexer, 123, 4);
                if ((state.lexer._type == 68)) {
                    consume(state);
                    state.push_fn(branch_9de304337147e1a0, 49);
                    return hc_state_ir__token_id_list(state, db, 0);
                };
                return - 1;
            } else if (state.lexer._type == 68) {
                state.push_fn(set_production /*49*/, 49);
                consume(state);
                state.push_fn(branch_49a8480279948c19, 49);
                return hc_state_ir__token_id_list(state, db, 0);
            }
        } else if (state.lexer._type == 69) {
            state.push_fn(set_production /*49*/, 49);
            consume(state);
            scan(state.lexer, 116, 4);
            if ((state.lexer._type == 5)) {
                consume(state);
                add_reduce(state, 2, 78);
                return 0;
            };
            return - 1;
        } else if (state.lexer._type == 75) {
            state.push_fn(set_production /*49*/, 49);
            consume(state);
            add_reduce(state, 1, 82);
            return 0;
        };
        return - 1;
    }

    function hc_state_ir__state_reference(state, db, prod) {
        scan(state.lexer, 124, 4);
        if (state.lexer._type == 76) {
            consume(state);
            scan(state.lexer, 110, 4);
            if (state.lexer._type == 32) {
                consume(state);
                scan(state.lexer, 125, 4);
                if (state.lexer._type == 77) {
                    consume(state);
                    scan(state.lexer, 5, 6);
                    if (state.lexer._type == 13) {
                        var fk1 = state.fork(db);;
                        fk1.push_fn(branch_0deef36ccd225601, 50);
                        state.push_fn(branch_3ee7fb5cda813cb9, 50);
                        return 0;
                    }
                } else if (state.lexer._type == 56) {
                    state.push_fn(set_production /*50*/, 50);
                    consume(state);
                    scan(state.lexer, 20, 4);
                    if ((state.lexer._type == 33)) {
                        consume(state);
                        add_reduce(state, 4, 85);
                        return 0;
                    };
                    return - 1;
                }
            }
        };
        return - 1;
    }

    function hc_state_ir__token_id_list(state, db, prod) {
        scan(state.lexer, 110, 4);
        if (state.lexer._type == 32) {
            consume(state);
            scan(state.lexer, 126, 4);
            if ((state.lexer._type == 5 || state.lexer._type == 12 || state.lexer._type == 15 || state.lexer._type == 16)) {
                state.push_fn(branch_423b72e2288cd644, 51);
                return hc_state_ir__token_id_list_list_417(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_state_ir__goto_instruction(state, db, prod) {
        scan(state.lexer, 26, 4);
        if (state.lexer._type == 78) {
            consume(state);
            scan(state.lexer, 124, 4);
            if ((state.lexer._type == 76)) {
                state.push_fn(branch_97de5fed52fee6bc, 52);
                return hc_state_ir__state_reference(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_state_ir__token_branch_instruction(state, db, prod) {
        scan(state.lexer, 127, 4);
        if (state.lexer._type == 79) {
            state.push_fn(set_production /*53*/, 53);
            consume(state);
            state.push_fn(branch_d86f42b4b027bc9e, 53);
            return hc_state_ir__token_id_list(state, db, 0);
        } else if (state.lexer._type == 80) {
            state.push_fn(set_production /*53*/, 53);
            consume(state);
            state.push_fn(branch_ba5f75631cc56b1f, 53);
            return hc_state_ir__token_id_list(state, db, 0);
        } else if (state.lexer._type == 81) {
            state.push_fn(set_production /*53*/, 53);
            consume(state);
            state.push_fn(branch_9b48dba55e349e46, 53);
            return hc_state_ir__token_id_list(state, db, 0);
        } else if (state.lexer._type == 82) {
            state.push_fn(set_production /*53*/, 53);
            consume(state);
            state.push_fn(branch_e7c6cf474b7f2992, 53);
            return hc_state_ir__token_id_list(state, db, 0);
        };
        return - 1;
    }

    function hc_state_ir__on_fail(state, db, prod) {
        scan(state.lexer, 11, 4);
        if (state.lexer._type == 58) {
            consume(state);
            scan(state.lexer, 128, 4);
            if (state.lexer._type == 75) {
                consume(state);
                scan(state.lexer, 124, 4);
                state.push_fn(branch_2eac35b977492180, 0);
                return hc_state_ir__state_declaration(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_state_ir__state_declaration(state, db, prod) {
        scan(state.lexer, 124, 4);
        if (state.lexer._type == 76) {
            consume(state);
            scan(state.lexer, 110, 4);
            if ((state.lexer._type == 32)) {
                consume(state);
                scan(state.lexer, 129, 4);
                if ((state.lexer._type == 56)) {
                    consume(state);
                    scan(state.lexer, 20, 4);
                    if ((state.lexer._type == 33)) {
                        consume(state);
                        add_reduce(state, 4, 85);
                        return 55;
                    }
                }
            }
        };
        return - 1;
    }

    function hc_state_ir__expected_symbols(state, db, prod) {
        scan(state.lexer, 130, 4);
        if (state.lexer._type == 83) {
            consume(state);
            scan(state.lexer, 12, 4);
            if (state.lexer._type == 84) {
                consume(state);
                scan(state.lexer, 110, 4);
                state.push_fn(branch_9c2cd21f3758c690, 0);
                return hc_state_ir__token_id_list(state, db, 0);
            }
        };
        return - 1;
    }

    function hc_state_ir__state_ir(state, db, prod) {
        state.push_fn(branch_bca28e1a52f2e561, 0);
        return hc_state_ir__state_declaration(state, db, 0);
    }

    function hc_state_ir__comment_list_6(state, db, prod) {
        scan(state.lexer, 30, 0);
        if (isTokenActive(state.lexer._type, 30)) {
            consume(state);
            add_reduce(state, 1, 3);
            return hc_state_ir__comment_list_6_goto(state, db, 58);
        };
        return - 1;
    }

    function hc_state_ir__comment_list_6_goto(state, db, prod) {
        scan(state.lexer, 48, 0);
        if (state.lexer._type == 2) {
            state.push_fn(hc_state_ir__comment_list_6_goto /*hc_state_ir__comment_list_6_goto( state, db, 58 )*/, 58);
            scan(state.lexer, 131, 6);
            consume(state);
            add_reduce(state, 2, 4);
            return 0;
        } else if (state.lexer._type == 8) {
            state.push_fn(hc_state_ir__comment_list_6_goto /*hc_state_ir__comment_list_6_goto( state, db, 58 )*/, 58);
            scan(state.lexer, 6, 19);
            consume(state);
            add_reduce(state, 2, 4);
            return 0;
        } else if (state.lexer._type == 7) {
            state.push_fn(hc_state_ir__comment_list_6_goto /*hc_state_ir__comment_list_6_goto( state, db, 58 )*/, 58);
            scan(state.lexer, 6, 38);
            consume(state);
            add_reduce(state, 2, 4);
            return 0;
        } else if (state.lexer._type == 3) {
            state.push_fn(hc_state_ir__comment_list_6_goto /*hc_state_ir__comment_list_6_goto( state, db, 58 )*/, 58);
            scan(state.lexer, 37, 6);
            consume(state);
            add_reduce(state, 2, 4);
            return 0;
        } else if (state.lexer._type == 5) {
            state.push_fn(hc_state_ir__comment_list_6_goto /*hc_state_ir__comment_list_6_goto( state, db, 58 )*/, 58);
            scan(state.lexer, 132, 6);
            consume(state);
            add_reduce(state, 2, 4);
            return 0;
        };
        return (prod == 58) ? prod : - 1;
    }

    function hc_symbols__literal_symbol_list_48(state, db, prod) {
        scan(state.lexer, 60, 6);
        if (state.lexer._type == 5 || state.lexer._type == 3) {
            consume(state);
            add_reduce(state, 1, 101);
            return hc_symbols__literal_symbol_list_48_goto(state, db, 59);
        };
        return - 1;
    }

    function hc_symbols__literal_symbol_list_48_goto(state, db, prod) {
        while (true) {
            switch (prod) {
                case 59:
                    {
                        scan(state.lexer, 7, 0);
                        if (state.lexer._type == 3 || state.lexer._type == 64513 || state.lexer._type == 60) {
                            var pk = state.lexer.copy_in_place();;
                            pk.next();
                            scan(pk, 8, 0);
                            if (isTokenActive(pk._type, 8)) {
                                state.lexer._type = 3;
                                state.push_fn(hc_symbols__literal_symbol_list_48_goto /*hc_symbols__literal_symbol_list_48_goto( state, db, 59 )*/, 59);
                                scan(state.lexer, 37, 6);
                                consume(state);
                                add_reduce(state, 2, 7);
                                return 0;
                            }
                        } else if (state.lexer._type == 5) {
                            var pk = state.lexer.copy_in_place();;
                            pk.next();
                            scan(pk, 8, 0);
                            if (isTokenActive(pk._type, 8)) {
                                state.lexer._type = 5;
                                state.push_fn(hc_symbols__literal_symbol_list_48_goto /*hc_symbols__literal_symbol_list_48_goto( state, db, 59 )*/, 59);
                                scan(state.lexer, 132, 6);
                                consume(state);
                                add_reduce(state, 2, 7);
                                return 0;
                            }
                        } else if (state.lexer._type == 8 || state.lexer._type == 1 || state.lexer._type == 7) {
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

    function hc_symbols__escaped_symbol_list_54(state, db, prod) {
        scan(state.lexer, 30, 6);
        if (state.lexer._type == 5 || state.lexer._type == 3 || state.lexer._type == 2) {
            consume(state);
            add_reduce(state, 1, 101);
            return hc_symbols__escaped_symbol_list_54_goto(state, db, 60);
        };
        return - 1;
    }

    function hc_symbols__escaped_symbol_list_54_goto(state, db, prod) {
        scan(state.lexer, 133, 0);
        if (state.lexer._type == 5) {
            state.push_fn(hc_symbols__escaped_symbol_list_54_goto /*hc_symbols__escaped_symbol_list_54_goto( state, db, 60 )*/, 60);
            scan(state.lexer, 132, 6);
            consume(state);
            add_reduce(state, 2, 7);
            return 0;
        } else if (state.lexer._type == 3) {
            state.push_fn(hc_symbols__escaped_symbol_list_54_goto /*hc_symbols__escaped_symbol_list_54_goto( state, db, 60 )*/, 60);
            scan(state.lexer, 37, 6);
            consume(state);
            add_reduce(state, 2, 7);
            return 0;
        } else if (state.lexer._type == 2) {
            state.push_fn(hc_symbols__escaped_symbol_list_54_goto /*hc_symbols__escaped_symbol_list_54_goto( state, db, 60 )*/, 60);
            scan(state.lexer, 131, 6);
            consume(state);
            add_reduce(state, 2, 7);
            return 0;
        };
        return (prod == 60) ? prod : - 1;
    }

    function hc_preambles__import_preamble_list_59(state, db, prod) {
        scan(state.lexer, 6, 19);
        if (state.lexer._type == 8) {
            consume(state);
            scan(state.lexer, 19, 19);
            add_reduce(state, 1, 3);
            return hc_preambles__import_preamble_list_59_goto(state, db, 61);
        };
        return - 1;
    }

    function hc_preambles__import_preamble_list_59_goto(state, db, prod) {
        scan(state.lexer, 134, 19);
        if (state.lexer._type == 2 || state.lexer._type == 3 || state.lexer._type == 19 || state.lexer._type == 20) {
            return 61;
        } else if (state.lexer._type == 8) {
            state.push_fn(hc_preambles__import_preamble_list_59_goto /*hc_preambles__import_preamble_list_59_goto( state, db, 61 )*/, 61);
            scan(state.lexer, 6, 19);
            consume(state);
            add_reduce(state, 2, 4);
            return 0;
        } else if (state.lexer._type == 13) {
            var fk1 = state.fork(db);;
            fk1.push_fn(set_production /*61*/, 61);
            state.push_fn(set_production /*61*/, 61);
            return 0;
        };
        return (prod == 61) ? prod : - 1;
    }

    function hc_preambles__import_preamble_list_60(state, db, prod) {
        scan(state.lexer, 32, 6);
        if (state.lexer._type == 2 || state.lexer._type == 3) {
            consume(state);
            add_reduce(state, 1, 101);
            return hc_preambles__import_preamble_list_60_goto(state, db, 62);
        };
        return - 1;
    }

    function hc_preambles__import_preamble_list_60_goto(state, db, prod) {
        scan(state.lexer, 32, 19);
        if (state.lexer._type == 2) {
            state.push_fn(hc_preambles__import_preamble_list_60_goto /*hc_preambles__import_preamble_list_60_goto( state, db, 62 )*/, 62);
            scan(state.lexer, 131, 6);
            consume(state);
            add_reduce(state, 2, 7);
            return 0;
        } else if (state.lexer._type == 3) {
            state.push_fn(hc_preambles__import_preamble_list_60_goto /*hc_preambles__import_preamble_list_60_goto( state, db, 62 )*/, 62);
            scan(state.lexer, 37, 6);
            consume(state);
            add_reduce(state, 2, 7);
            return 0;
        } else if (state.lexer._type == 8) {
            return 62;
        };
        return (prod == 62) ? prod : - 1;
    }

    function hc_comments__cm_list_110(state, db, prod) {
        state.push_fn(branch_533a93a3faca2f72, 63);
        return hc_comments__comment_primitive(state, db, 0);
    }

    function hc_comments__cm_list_110_goto(state, db, prod) {
        scan(state.lexer, 30, 0);
        if (state.lexer._type == 2 || state.lexer._type == 3 || state.lexer._type == 5 || state.lexer._type == 8) {
            state.push_fn(hc_comments__cm_list_110_goto /*hc_comments__cm_list_110_goto( state, db, 63 )*/, 63);
            scan(state.lexer, 30, 19);
            if ((state.lexer._type == 2 || state.lexer._type == 3 || state.lexer._type == 5 || state.lexer._type == 8)) {
                state.push_fn(branch_20b33064645a28fc, 63);
                return hc_comments__comment_primitive(state, db, 0);
            };
            return - 1;
        };
        return (prod == 63) ? prod : - 1;
    }

    function hc_productions__production_group_130_0_(state, db, prod) {
        state.push_fn(branch_e8c7e86227b3f492, 64);
        return hc_symbols__production_id(state, db, 0);
    }

    function hc_productions__production_group_135_0_(state, db, prod) {
        state.push_fn(branch_b16d1ef9240490ef, 65);
        return hc_symbols__imported_production_symbol(state, db, 0);
    }

    function hc_production_bodies__body_entry_list_167(state, db, prod) {
        state.push_fn(branch_fa6b77408f542112, 66);
        return hc_production_bodies__body_entry(state, db, 0);
    }

    function hc_production_bodies__body_entry_list_167_goto(state, db, prod) {
        scan(state.lexer, 135, 6);
        if (isTokenActive(state.lexer._type, 81)) {
            state.push_fn(hc_production_bodies__body_entry_list_167_goto /*hc_production_bodies__body_entry_list_167_goto( state, db, 66 )*/, 66);
            scan(state.lexer, 82, 6);
            if ((isTokenActive(state.lexer._type, 81))) {
                state.push_fn(branch_28ab10e2751570b2, 66);
                return hc_production_bodies__body_entry(state, db, 0);
            };
            return - 1;
        };
        return (prod == 66) ? prod : - 1;
    }

    function hc_functions__referenced_function_group_267_0_(state, db, prod) {
        state.push_fn(branch_273f434273cf6daf, 67);
        return hc_functions__js_function_start_symbol(state, db, 0);
    }

    function hc_state_ir__top_level_instructions_list_323(state, db, prod) {
        state.push_fn(branch_986cf2127efb70ad, 68);
        return hc_state_ir__prod_branch_instruction(state, db, 0);
    }

    function hc_state_ir__top_level_instructions_list_323_goto(state, db, prod) {
        while (true) {
            switch (prod) {
                case 68:
                    {
                        scan(state.lexer, 136, 6);
                        if (state.lexer._type == 58) {
                            var pk = state.lexer.copy_in_place();;
                            pk.next();
                            scan(pk, 109, 4);
                            if (pk._type == 59) {
                                state.lexer._type = 58;
                                state.push_fn(hc_state_ir__top_level_instructions_list_323_goto /*hc_state_ir__top_level_instructions_list_323_goto( state, db, 68 )*/, 68);
                                scan(state.lexer, 137, 6);
                                if ((state.lexer._type == 58)) {
                                    state.push_fn(branch_28ab10e2751570b2, 68);
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
        return (prod == 68) ? prod : - 1;
    }

    function hc_state_ir__top_level_instructions_list_324(state, db, prod) {
        state.push_fn(branch_d5acfc15b8500afc, 69);
        return hc_state_ir__token_branch_instruction(state, db, 0);
    }

    function hc_state_ir__top_level_instructions_list_324_goto(state, db, prod) {
        while (true) {
            switch (prod) {
                case 69:
                    {
                        scan(state.lexer, 138, 6);
                        if (state.lexer._type == 79 || state.lexer._type == 80 || state.lexer._type == 81 || state.lexer._type == 82) {
                            state.push_fn(hc_state_ir__top_level_instructions_list_324_goto /*hc_state_ir__top_level_instructions_list_324_goto( state, db, 69 )*/, 69);
                            scan(state.lexer, 139, 6);
                            if ((state.lexer._type == 79 || state.lexer._type == 80 || state.lexer._type == 81 || state.lexer._type == 82)) {
                                state.push_fn(branch_28ab10e2751570b2, 69);
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
        return (prod == 69) ? prod : - 1;
    }

    function hc_state_ir__production_id_list_list_333(state, db, prod) {
        scan(state.lexer, 119, 6);
        if (state.lexer._type == 13) {
            state.push_fn(hc_state_ir__production_id_list_list_333_goto /*hc_state_ir__production_id_list_list_333_goto( state, db, 9 )*/, 9);
            state.push_fn(set_production /*0*/, 9);
            return hc_symbols__identifier(state, db, prod);
        } else {
            state.push_fn(hc_state_ir__production_id_list_list_333_goto /*hc_state_ir__production_id_list_list_333_goto( state, db, 70 )*/, 70);
            state.push_fn(branch_232f37efe656dae6, 70);
            return hc_state_ir__sequence_instruction_group_381_0_(state, db, 0);
        };
        return - 1;
    }

    function hc_state_ir__production_id_list_list_333_goto(state, db, prod) {
        while (true) {
            switch (prod) {
                case 9:
                    {
                        scan(state.lexer, 86, 19);
                        if (state.lexer._type == 22) {
                            state.push_fn(hc_state_ir__production_id_list_list_333_goto /*hc_state_ir__production_id_list_list_333_goto( state, db, 70 )*/, 70);
                            scan(state.lexer, 35, 6);
                            consume(state);
                            state.push_fn(branch_4941a40c1e051405, 70);
                            return hc_symbols__identifier(state, db, 0);
                        } else {
                            scan(state.lexer, 19, 19);
                            add_reduce(state, 1, 16);
                            add_reduce(state, 1, 3);
                            prod = 70;
                            continue;
                        };
                        break;
                    }
                    break;
                case 70:
                    {
                        scan(state.lexer, 140, 6);
                        if (state.lexer._type == 13) {
                            var fk1 = state.fork(db);;
                            fk1.push_fn(branch_ea87792c9e6ce63c, 70);
                            state.push_fn(branch_6011efbc028b0d0f, 70);
                            return 0;
                        } else if (state.lexer._type == 5) {
                            state.push_fn(hc_state_ir__production_id_list_list_333_goto /*hc_state_ir__production_id_list_list_333_goto( state, db, 70 )*/, 70);
                            scan(state.lexer, 132, 6);
                            if ((state.lexer._type == 5)) {
                                state.push_fn(branch_28ab10e2751570b2, 70);
                                return hc_state_ir__sequence_instruction_group_381_0_(state, db, 0);
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
        return (prod == 70) ? prod : - 1;
    }

    function hc_state_ir__instruction_sequence_list_335(state, db, prod) {
        state.push_fn(branch_f4d2203a1c29baf5, 71);
        return hc_state_ir__sequence_instruction(state, db, 0);
    }

    function hc_state_ir__instruction_sequence_list_335_goto(state, db, prod) {
        while (true) {
            switch (prod) {
                case 71:
                    {
                        scan(state.lexer, 141, 6);
                        if (state.lexer._type == 60) {
                            var pk = state.lexer.copy_in_place();;
                            pk.next();
                            scan(pk, 142, 6);
                            if (isTokenActive(pk._type, 113)) {
                                state.lexer._type = 60;
                                state.push_fn(hc_state_ir__instruction_sequence_list_335_goto /*hc_state_ir__instruction_sequence_list_335_goto( state, db, 71 )*/, 71);
                                scan(state.lexer, 143, 6);
                                consume(state);
                                state.push_fn(branch_f7de3da658dea4ce, 71);
                                return hc_state_ir__sequence_instruction(state, db, 0);
                            } else if (pk._type == 78) {
                                return 71;
                            }
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

    function hc_state_ir__instruction_sequence_list_338(state, db, prod) {
        state.push_fn(branch_0026404a9ebc4f7c, 72);
        return hc_state_ir__goto_instruction(state, db, 0);
    }

    function hc_state_ir__instruction_sequence_list_338_goto(state, db, prod) {
        while (true) {
            switch (prod) {
                case 72:
                    {
                        scan(state.lexer, 141, 6);
                        if (state.lexer._type == 60) {
                            var pk = state.lexer.copy_in_place();;
                            pk.next();
                            scan(pk, 25, 6);
                            if (pk._type == 78) {
                                state.lexer._type = 60;
                                state.push_fn(hc_state_ir__instruction_sequence_list_338_goto /*hc_state_ir__instruction_sequence_list_338_goto( state, db, 72 )*/, 72);
                                scan(state.lexer, 143, 6);
                                consume(state);
                                state.push_fn(branch_f7de3da658dea4ce, 72);
                                return hc_state_ir__goto_instruction(state, db, 0);
                            } else if (pk._type == 85) {
                                var fk1 = state.fork(db);;
                                fk1.push_fn(set_production /*72*/, 72);
                                state.push_fn(set_production /*72*/, 72);
                                return 0;
                            }
                        } else {
                            return 72;
                        }
                    }
                    break;
                default:
                    break;
            };
            break;
        };
        return (prod == 72) ? prod : - 1;
    }

    function hc_state_ir__instruction_sequence_group_339_0_(state, db, prod) {
        scan(state.lexer, 143, 6);
        if (state.lexer._type == 60) {
            consume(state);
            scan(state.lexer, 144, 6);
            if ((state.lexer._type == 85)) {
                consume(state);
                scan(state.lexer, 145, 6);
                if ((state.lexer._type == 76)) {
                    consume(state);
                    add_reduce(state, 3, 105);
                    return 73;
                }
            }
        };
        return - 1;
    }

    function hc_state_ir__instruction_sequence_group_342_0_(state, db, prod) {
        scan(state.lexer, 143, 6);
        if (state.lexer._type == 60) {
            consume(state);
            scan(state.lexer, 144, 6);
            if ((state.lexer._type == 85)) {
                consume(state);
                scan(state.lexer, 145, 6);
                if ((state.lexer._type == 76)) {
                    consume(state);
                    add_reduce(state, 3, 106);
                    return 74;
                }
            }
        };
        return - 1;
    }

    function hc_state_ir__sequence_instruction_group_361_0_(state, db, prod) {
        scan(state.lexer, 132, 6);
        if (state.lexer._type == 5) {
            consume(state);
            scan(state.lexer, 6, 6);
            add_reduce(state, 1, 107);
            return 75;
        };
        return - 1;
    }

    function hc_state_ir__sequence_instruction_list_366(state, db, prod) {
        state.push_fn(branch_0aa6a8bdf0f0a158, 76);
        return hc_state_ir__state_reference(state, db, 0);
    }

    function hc_state_ir__sequence_instruction_list_366_goto(state, db, prod) {
        scan(state.lexer, 146, 6);
        if (state.lexer._type == 86) {
            state.push_fn(hc_state_ir__sequence_instruction_list_366_goto /*hc_state_ir__sequence_instruction_list_366_goto( state, db, 76 )*/, 76);
            scan(state.lexer, 147, 6);
            consume(state);
            state.push_fn(branch_f7de3da658dea4ce, 76);
            return hc_state_ir__state_reference(state, db, 0);
        };
        return (prod == 76) ? prod : - 1;
    }

    function hc_state_ir__sequence_instruction_group_381_0_(state, db, prod) {
        scan(state.lexer, 132, 6);
        if (state.lexer._type == 5) {
            consume(state);
            scan(state.lexer, 6, 6);
            add_reduce(state, 1, 107);
            return 77;
        };
        return - 1;
    }

    function hc_state_ir__token_id_list_list_417(state, db, prod) {
        scan(state.lexer, 121, 6);
        if (state.lexer._type == 12 || state.lexer._type == 15 || state.lexer._type == 16) {
            state.push_fn(hc_state_ir__token_id_list_list_417_goto /*hc_state_ir__token_id_list_list_417_goto( state, db, 78 )*/, 78);
            state.push_fn(branch_232f37efe656dae6, 78);
            return hc_symbols__terminal_symbol(state, db, 0);
        } else {
            state.push_fn(hc_state_ir__token_id_list_list_417_goto /*hc_state_ir__token_id_list_list_417_goto( state, db, 78 )*/, 78);
            state.push_fn(branch_232f37efe656dae6, 78);
            return hc_state_ir__sequence_instruction_group_381_0_(state, db, 0);
        };
        return - 1;
    }

    function hc_state_ir__token_id_list_list_417_goto(state, db, prod) {
        scan(state.lexer, 148, 6);
        if (state.lexer._type == 12 || state.lexer._type == 15 || state.lexer._type == 16) {
            state.push_fn(hc_state_ir__token_id_list_list_417_goto /*hc_state_ir__token_id_list_list_417_goto( state, db, 78 )*/, 78);
            scan(state.lexer, 91, 6);
            if ((state.lexer._type == 12 || state.lexer._type == 15 || state.lexer._type == 16)) {
                state.push_fn(branch_28ab10e2751570b2, 78);
                return hc_symbols__terminal_symbol(state, db, 0);
            };
            return - 1;
        } else if (state.lexer._type == 5) {
            state.push_fn(hc_state_ir__token_id_list_list_417_goto /*hc_state_ir__token_id_list_list_417_goto( state, db, 78 )*/, 78);
            scan(state.lexer, 132, 6);
            if ((state.lexer._type == 5)) {
                state.push_fn(branch_28ab10e2751570b2, 78);
                return hc_state_ir__sequence_instruction_group_381_0_(state, db, 0);
            };
            return - 1;
        };
        return (prod == 78) ? prod : - 1;
    }

    function hc_state_ir__expected_symbols_group_454_0_(state, db, prod) {
        scan(state.lexer, 149, 6);
        if (state.lexer._type == 87) {
            consume(state);
            scan(state.lexer, 150, 6);
            if ((state.lexer._type == 32)) {
                state.push_fn(branch_dae19cc841547194, 79);
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
(env, sym, pos) => ({ type: "import", uri: sym[2], reference: sym[5] }) /*10*/,
(env, sym, pos) => ({ type: "import", uri: sym[1], reference: sym[4] }) /*11*/,
(env, sym, pos) => ({ type: "export", production: sym[2], reference: sym[5] }) /*12*/,
(env, sym, pos) => ({ type: "export", production: sym[1], reference: sym[4] }) /*13*/,
(env, sym, pos) => ({ type: "sym-production-import", module: sym[0], production: sym[2], name: "", pos: pos, meta: false }) /*14*/,
(env, sym, pos) => ({ type: "sym-production", name: sym[0], production: null, val: -1, pos: pos, meta: false }) /*15*/,
(env, sym, pos) => ({ type: "comment", value: sym[1] }) /*16*/,
(env, sym, pos) => ({ type: "production-section", functions: [], productions: [sym[0]], ir: [] }) /*17*/,
(env, sym, pos) => ({ type: "production-section", functions: [], productions: [], ir: [sym[0]] }) /*18*/,
(env, sym, pos) => ({ type: "production-section", functions: [sym[0]], productions: [], ir: [] }) /*19*/,
(env, sym, pos) => (sym[0].productions.push(sym[1]), sym[0]) /*20*/,
(env, sym, pos) => (sym[0].functions.push(sym[1]), sym[0]) /*21*/,
(env, sym, pos) => (sym[0].ir.push(sym[1]), sym[0]) /*22*/,
(env, sym, pos) => (sym[0]) /*23*/,
(env, sym, pos) => ({ type: "production", name: sym[2], bodies: sym[4], id: -1, recovery_handler: sym[5], pos: pos, recursion: 0, ROOT_PRODUCTION: !!sym[1] }) /*24*/,
(env, sym, pos) => ({ type: "production-merged-import", name: sym[1], bodies: sym[3], id: -1, recovery_handler: sym[4], ROOT_PRODUCTION: false }) /*25*/,
(env, sym, pos) => ({ type: "production", name: sym[1], bodies: sym[3], id: -1, recovery_handler: sym[4], pos: pos, recursion: 0, ROOT_PRODUCTION: !!null }) /*26*/,
(env, sym, pos) => ({ type: "production", name: sym[2], bodies: null, id: -1, recovery_handler: sym[4], pos: pos, recursion: 0, ROOT_PRODUCTION: !!sym[1] }) /*27*/,
(env, sym, pos) => ({ type: "production", name: sym[1], bodies: null, id: -1, recovery_handler: sym[3], pos: pos, recursion: 0, ROOT_PRODUCTION: !!null }) /*28*/,
(env, sym, pos) => ((sym[0].push(sym[2]), sym[0])) /*29*/,
(env, sym, pos) => ({ type: "body", sym: sym[3], reduce_function: sym[4], FORCE_FORK: !!sym[2], id: -1, production: null }) /*30*/,
(env, sym, pos) => ({ type: "body", sym: sym[0], reduce_function: sym[1], FORCE_FORK: !!null, id: -1, production: null }) /*31*/,
(env, sym, pos) => ({ type: "body", sym: sym[3], reduce_function: null, FORCE_FORK: !!sym[2], id: -1, production: null }) /*32*/,
(env, sym, pos) => ({ type: "body", sym: sym[0], reduce_function: null, FORCE_FORK: !!null, id: -1, production: null }) /*33*/,
(env, sym, pos) => (sym[0].concat(sym[1])) /*34*/,
(env, sym, pos) => ([]) /*35*/,
(env, sym, pos) => (env.group_id++, sym[1].flat().map(e => (e.IS_OPTIONAL ? e.IS_OPTIONAL |= env.group_id << 8 : 0, e))) /*36*/,
(env, sym, pos) => (sym[0].IS_OPTIONAL = 1, sym[0]) /*37*/,
(env, sym, pos) => ({ type: "look-behind", val: sym[1].val, phased: sym[1] }) /*38*/,
(env, sym, pos) => (sym[1].IS_NON_CAPTURE = true, sym[1]) /*39*/,
(env, sym, pos) => ({ type: "group-production", val: sym[1], pos: pos, meta: false }) /*40*/,
(env, sym, pos) => ({ type: "list-production", terminal_symbol: sym[2], IS_OPTIONAL: +(sym[1] == "(*"), val: sym[0], pos: pos, meta: false }) /*41*/,
(env, sym, pos) => ({ type: "literal", val: sym[0], pos: pos, meta: false }) /*42*/,
(env, sym, pos) => ({ type: "list-production", terminal_symbol: null, IS_OPTIONAL: +(sym[1] == "(*"), val: sym[0], pos: pos, meta: false }) /*43*/,
(env, sym, pos) => ({ type: "eof", val: "END_OF_FILE", pos: pos, meta: false }) /*44*/,
(env, sym, pos) => ({ type: "meta-exclude", sym: sym[1], meta: true, index: -1 }) /*45*/,
(env, sym, pos) => ({ type: "meta-error", sym: sym[1], meta: true, index: -1 }) /*46*/,
(env, sym, pos) => ({ type: "meta-ignore", sym: sym[1], meta: true, index: -1 }) /*47*/,
(env, sym, pos) => ({ type: "meta-reset", sym: sym[1], meta: true, index: -1 }) /*48*/,
(env, sym, pos) => ({ type: "meta-reduce", sym: sym[1], meta: true, index: -1 }) /*49*/,
(env, sym, pos) => ({ type: "empty", val: "", pos: pos, meta: false }) /*50*/,
(env, sym, pos) => ({ type: "RETURNED", txt: sym[3], name: "", env: false, ref: "", IS_CONDITION: true }) /*51*/,
(env, sym, pos) => ({ type: "env-function-reference", ref: sym[3] }) /*52*/,
(env, sym, pos) => ({ type: "local-function-reference", ref: sym[3] }) /*53*/,
(env, sym, pos) => ("FN:F") /*54*/,
(env, sym, pos) => ("<--" + sym[0].type + "^^" + sym[0].val + "-->") /*55*/,
(env, sym, pos) => (sym[0] + sym[1] + sym[2]) /*56*/,
(env, sym, pos) => ({ type: "ref-function", id: sym[1], txt: sym[3] }) /*57*/,
(env, sym, pos) => ({ type: "state", id: sym[2], instructions: sym[4], fail: sym[5], symbol_meta: sym[6], pos }) /*58*/,
(env, sym, pos) => ({ type: "state", id: sym[1], instructions: sym[3], fail: sym[4], symbol_meta: sym[5], pos }) /*59*/,
(env, sym, pos) => ({ type: "state", id: sym[2], instructions: sym[4], symbol_meta: sym[5], pos }) /*60*/,
(env, sym, pos) => ({ type: "state", id: sym[2], instructions: sym[4], fail: sym[5], pos }) /*61*/,
(env, sym, pos) => ({ type: "state", id: sym[1], instructions: sym[3], symbol_meta: sym[4], pos }) /*62*/,
(env, sym, pos) => ({ type: "state", id: sym[1], instructions: sym[3], fail: sym[4], pos }) /*63*/,
(env, sym, pos) => ({ type: "state", id: sym[2], instructions: sym[4], pos }) /*64*/,
(env, sym, pos) => ({ type: "state", id: sym[1], instructions: sym[3], pos }) /*65*/,
(env, sym, pos) => ({ type: "prod", ids: sym[2], instructions: sym[4], pos }) /*66*/,
(env, sym, pos) => (sym[1]) /*67*/,
(env, sym, pos) => ([...sym[0], ...sym[2], sym[3]]) /*68*/,
(env, sym, pos) => ([...sym[0], sym[1]]) /*69*/,
(env, sym, pos) => ([...sym[0], ...sym[2]]) /*70*/,
(env, sym, pos) => ([...sym[0]]) /*71*/,
(env, sym, pos) => ({ type: "reduce", len: parseInt(sym[1]), reduce_fn: parseInt(sym[2]), pos }) /*72*/,
(env, sym, pos) => ({ type: "reduce", len: -1, reduce_fn: sym[1], pos }) /*73*/,
(env, sym, pos) => ({ type: "set-prod", id: sym[3], pos }) /*74*/,
(env, sym, pos) => ({ type: "fork-to", states: sym[3], pos }) /*75*/,
(env, sym, pos) => ({ type: sym[1] ? "scan-back-until" : "scan-until", ids: sym[3], pos }) /*76*/,
(env, sym, pos) => ({ type: "pop", len: parseInt(sym[1]), pos }) /*77*/,
(env, sym, pos) => ({ type: "token-length", len: parseInt(sym[3]), pos }) /*78*/,
(env, sym, pos) => ({ type: "token-id", id: sym[3], pos }) /*79*/,
(env, sym, pos) => ({ type: "pass", pos }) /*80*/,
(env, sym, pos) => ({ type: "fail", pos }) /*81*/,
(env, sym, pos) => ({ type: null ? "scan-back-until" : "scan-until", ids: sym[2], pos }) /*82*/,
(env, sym, pos) => (sym[3]) /*83*/,
(env, sym, pos) => (sym[2]) /*84*/,
(env, sym, pos) => ({ type: "goto", state: sym[1], pos }) /*85*/,
(env, sym, pos) => ({ type: "no-consume", ids: sym[1], instructions: sym[3], pos }) /*86*/,
(env, sym, pos) => ({ type: "consume", ids: sym[1], instructions: sym[3], pos }) /*87*/,
(env, sym, pos) => ({ type: "peek", ids: sym[1], instructions: sym[3], pos }) /*88*/,
(env, sym, pos) => ({ type: "assert", ids: sym[1], instructions: sym[3], pos }) /*89*/,
(env, sym, pos) => ({ type: "on-fail-state", id: sym[2], instructions: sym[3], symbol_meta: sym[5], fail: sym[4], pos }) /*90*/,
(env, sym, pos) => ({ type: "on-fail-state", id: sym[2], instructions: sym[3], symbol_meta: sym[4], pos }) /*91*/,
(env, sym, pos) => ({ type: "on-fail-state", id: sym[2], instructions: sym[3], fail: sym[4], pos }) /*92*/,
(env, sym, pos) => ({ type: "on-fail-state", id: sym[2], instructions: sym[3], pos }) /*93*/,
(env, sym, pos) => ({ type: "symbols", expected: sym[2], skipped: sym[3] || [], pos }) /*94*/,
(env, sym, pos) => ({ type: "symbols", expected: sym[2], skipped: null || [], pos }) /*95*/,
(env, sym, pos) => ({ type: "state", id: sym[0], instructions: sym[1], fail: sym[2], symbol_meta: sym[3], pos }) /*96*/,
(env, sym, pos) => ({ type: "state", id: sym[0], instructions: sym[1], symbol_meta: sym[2], pos }) /*97*/,
(env, sym, pos) => ({ type: "state", id: sym[0], instructions: sym[1], fail: sym[2], pos }) /*98*/,
(env, sym, pos) => ({ type: "state", id: sym[0], instructions: sym[1], pos }) /*99*/,
(env, sym, pos) => (sym[0] + "") /*100*/,
(env, sym, pos) => (env.prod_name = sym[0]) /*101*/,
(env, sym, pos) => (env.prod_name = sym[0].val, sym[0]) /*102*/,
(env, sym, pos) => (sym[0] + "GG") /*103*/,
(env, sym, pos) => ({ type: "repeat-state" }) /*104*/,
(env, sym, pos) => ({ type: "repeat-state", pos }) /*105*/,
(env, sym, pos) => (parseInt(sym[0])) /*106*/];

export default ParserFactory
    (reduce_functions, undefined, recognizer_initializer, { hydrocarbon: 0, ir_state: 1 });