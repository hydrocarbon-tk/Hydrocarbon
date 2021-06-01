/*production name: binary_expression
            grammar index: 25
            bodies:
	25:80 binary_expression=>• unary_expression operator - 
		25:81 binary_expression=>• unary_expression operator expression - 
		25:82 binary_expression=>• unary_expression - 
            compile time: 464.449ms*/;
function $binary_expression(l: Lexer, data: ParserData, state: u32): u32 {
    /*25:80 binary_expression=>• unary_expression operator
    25:81 binary_expression=>• unary_expression operator expression
    25:82 binary_expression=>• unary_expression*/
    pushFN(data, branch_403912a9d69342d6);
    pushFN(data, $unary_expression);
    puid |= 1;
    return puid;
    return -1;
}
function $binary_expression_reducer(l: Lexer, data: ParserData, state: u32, prod: u32, stash: u32): u32 {
    if (3 == stash) {
        /*25:80 binary_expression=>unary_expression operator •*/
        add_reduce(state, data, 2, 45);
    } else if (7 == stash) {
        /*25:81 binary_expression=>unary_expression operator expression •*/
        add_reduce(state, data, 3, 46);
    }
    return 25;
}
function branch_07d689499cbffb03(l: Lexer, data: ParserData, state: u32, prod: u32, puid: u32): boolean {
    $binary_expression_reducer(l, data, state, prod, puid);
    return 25;
    /*07d689499cbffb034c9f7adde44be15a*/
}
function branch_403912a9d69342d6(l: Lexer, data: ParserData, state: u32, prod: u32, puid: u32): boolean {
    /*25:80 binary_expression=>unary_expression • operator
    25:81 binary_expression=>unary_expression • operator expression
    25:82 binary_expression=>unary_expression •*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    if (!((l.current_byte == 61/*[=]*/) || l.isSym(true, data)) || (/*[<<--]*/cmpr_set(l, data, 19, 4, 4) || assert_ascii(l, 0x0, 0xc001210, 0xa8000000, 0x20000000))) {
        /*--LEAF--*/
        /*PUIDABLE=true*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*25:82 binary_expression=>unary_expression •*/
        $binary_expression_reducer(l, data, state, prod, puid);
        return 25;
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else {
        /*25:80 binary_expression=>unary_expression • operator
        25:81 binary_expression=>unary_expression • operator expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        pushFN(data, branch_5c231718b2b7fa27);
        pushFN(data, $operator);
        puid |= 2;
        return puid;
    }
    /*403912a9d69342d6a6d9a10de96046f7*/
}
function branch_5c231718b2b7fa27(l: Lexer, data: ParserData, state: u32, prod: u32, puid: u32): boolean {
    /*25:80 binary_expression=>unary_expression operator •
    25:81 binary_expression=>unary_expression operator • expression*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
    switch (sym_map_cfef2d32a496e75b(l, data)) {
        default:
        case 0:
            /*--LEAF--*/
            /*PUIDABLE=true*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*25:80 binary_expression=>unary_expression operator •*/
            $binary_expression_reducer(l, data, state, prod, puid);
            return 25;
        case 1:
            /*--LEAF--*/
            /*PUIDABLE=true*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*25:81 binary_expression=>unary_expression operator • expression*/
            puid |= 4;
            pushFN(data, branch_07d689499cbffb03);
            pushFN(data, $expression);
            return puid;
        case 2:
            /*--LEAF--*/
            /*PUIDABLE=true*/
            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
            /*25:81 binary_expression=>unary_expression operator • expression*/
            puid |= 4;
            pushFN(data, branch_07d689499cbffb03);
            pushFN(data, $expression);
            return puid;
    }
    /*5c231718b2b7fa2748bf9b8f01371f37*/
}
function dt_1f145d506cf02379(l: Lexer, data: ParserData): boolean {
    if (2 == compare(data, l.byte_offset + 0, 16, 2)) {
        /*/**/
        l.setToken(TokenSymbol, 2, 2);
        return true;
    } else if (2 == compare(data, l.byte_offset + 0, 111, 2)) {
        /*//*/
        l.setToken(TokenSymbol, 2, 2);
        return true;
    }
    return false;
}
function skip_9184d3c96b70653a(l: Lexer, data: ParserData, APPLY: boolean): Lexer {
    const off = l.token_offset;
    while (1) {
        if (!((tk_e216f7e76b2d5e60(l, data) || l.isNL()) || l.isSP(true, data))) {
            break;
        }
        l.next(data);
    }
    if (APPLY) {
        add_skip(l, data, l.token_offset - off);
    }
}
function sym_map_cfef2d32a496e75b(l: Lexer, data: ParserData): i32 {
    /*] : ; ) else in } , str import cls ns if match sym = num 0x 0b 0o 0O " ' true false null ( break return continue loop { [ id _ $ fn <<--*/
    if (data.input[l.byte_offset + 0] == 93) {
        /*]*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if (data.input[l.byte_offset + 0] == 58) {
        /*:*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if (data.input[l.byte_offset + 0] == 59) {
        /*;*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if (data.input[l.byte_offset + 0] == 41) {
        /*)*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if (data.input[l.byte_offset + 0] == 101) {
        if (3 == compare(data, l.byte_offset + 1, 128, 3)) {
            if (l.isDiscrete(data, TokenIdentifier, 4)) {
                /*else*/
                l.setToken(TokenSymbol, 4, 4);
                return 0;
            }
        }
    } else if (data.input[l.byte_offset + 0] == 105) {
        if (data.input[l.byte_offset + 1] == 110) {
            if (l.isDiscrete(data, TokenIdentifier, 2)) {
                /*in*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            }
        } else if (data.input[l.byte_offset + 1] == 102) {
            if (l.isDiscrete(data, TokenIdentifier, 2)) {
                /*if*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if (data.input[l.byte_offset + 1] == 109) {
            if (4 == compare(data, l.byte_offset + 2, 30, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 6)) {
                    /*import*/
                    l.setToken(TokenSymbol, 6, 6);
                    return 0;
                }
            }
        }
    } else if (data.input[l.byte_offset + 0] == 125) {
        /*}*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if (data.input[l.byte_offset + 0] == 44) {
        /*,*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if (data.input[l.byte_offset + 0] == 115) {
        if (2 == compare(data, l.byte_offset + 1, 47, 2)) {
            if (l.isDiscrete(data, TokenIdentifier, 3)) {
                /*str*/
                l.setToken(TokenSymbol, 3, 3);
                return 0;
            }
        }
    } else if (data.input[l.byte_offset + 0] == 99) {
        if (data.input[l.byte_offset + 1] == 108) {
            if (data.input[l.byte_offset + 2] == 115) {
                if (l.isDiscrete(data, TokenIdentifier, 3)) {
                    /*cls*/
                    l.setToken(TokenSymbol, 3, 3);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 1] == 111) {
            if (6 == compare(data, l.byte_offset + 2, 40, 6)) {
                if (l.isDiscrete(data, TokenIdentifier, 8)) {
                    /*continue*/
                    l.setToken(TokenSymbol, 8, 8);
                    return 1;
                }
            }
        }
    } else if (data.input[l.byte_offset + 0] == 110) {
        if (data.input[l.byte_offset + 1] == 115) {
            if (l.isDiscrete(data, TokenIdentifier, 2)) {
                /*ns*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            }
        } else if (data.input[l.byte_offset + 1] == 117) {
            if (2 == compare(data, l.byte_offset + 2, 36, 2)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*null*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 1;
                }
            }
        }
    } else if (data.input[l.byte_offset + 0] == 109) {
        if (4 == compare(data, l.byte_offset + 1, 67, 4)) {
            if (l.isDiscrete(data, TokenIdentifier, 5)) {
                /*match*/
                l.setToken(TokenSymbol, 5, 5);
                return 1;
            }
        }
    } else if (data.input[l.byte_offset + 0] == 61) {
        /*=*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if (data.input[l.byte_offset + 0] == 48) {
        if (data.input[l.byte_offset + 1] == 120) {
            /*0x*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        } else if (data.input[l.byte_offset + 1] == 98) {
            /*0b*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        } else if (data.input[l.byte_offset + 1] == 111) {
            /*0o*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        } else if (data.input[l.byte_offset + 1] == 79) {
            /*0O*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        }
    } else if (data.input[l.byte_offset + 0] == 34) {
        /*"*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if (data.input[l.byte_offset + 0] == 39) {
        /*'*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if (data.input[l.byte_offset + 0] == 116) {
        if (3 == compare(data, l.byte_offset + 1, 95, 3)) {
            if (l.isDiscrete(data, TokenIdentifier, 4)) {
                /*true*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        }
    } else if (data.input[l.byte_offset + 0] == 102) {
        if (data.input[l.byte_offset + 1] == 110) {
            if (l.isDiscrete(data, TokenIdentifier, 2)) {
                /*fn*/
                l.setToken(TokenSymbol, 2, 2);
                return 2;
            }
        } else if (data.input[l.byte_offset + 1] == 97) {
            if (3 == compare(data, l.byte_offset + 2, 54, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*false*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 1;
                }
            }
        }
    } else if (data.input[l.byte_offset + 0] == 40) {
        /*(*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if (data.input[l.byte_offset + 0] == 98) {
        if (4 == compare(data, l.byte_offset + 1, 72, 4)) {
            if (l.isDiscrete(data, TokenIdentifier, 5)) {
                /*break*/
                l.setToken(TokenSymbol, 5, 5);
                return 1;
            }
        }
    } else if (data.input[l.byte_offset + 0] == 114) {
        if (5 == compare(data, l.byte_offset + 1, 77, 5)) {
            if (l.isDiscrete(data, TokenIdentifier, 6)) {
                /*return*/
                l.setToken(TokenSymbol, 6, 6);
                return 1;
            }
        }
    } else if (data.input[l.byte_offset + 0] == 108) {
        if (3 == compare(data, l.byte_offset + 1, 63, 3)) {
            if (l.isDiscrete(data, TokenIdentifier, 4)) {
                /*loop*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        }
    } else if (data.input[l.byte_offset + 0] == 123) {
        /*{*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if (data.input[l.byte_offset + 0] == 91) {
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
    } else if (data.input[l.byte_offset + 0] == 95) {
        /*_*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
    } else if (data.input[l.byte_offset + 0] == 36) {
        /*$*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
    } else if (data.input[l.byte_offset + 0] == 60) {
        if (3 == compare(data, l.byte_offset + 1, 20, 3)) {
            /*<<--*/
            l.setToken(TokenSymbol, 4, 4);
            return 2;
        }
    }
    if (l.isSym(true, data)) {
        return 1;
    } else if (l.isNum(data)) {
        return 1;
    } else if (l.isUniID(data)) {
        return 2;
    }
}
function tk_e216f7e76b2d5e60(l: Lexer, data: ParserData): boolean {
    if (dt_1f145d506cf02379(l, data)) {

        //This assumes the token production does not fork

        // preserve the current state of the data
        const stack_ptr = data.stack_ptr;
        const input_ptr = data.input_ptr;
        const state = data.state;
        const copy = l.copy();

        pushFN(data, $comment);
        data.state = 0;

        let ACTIVE = true;

        while (ACTIVE) {
            ACTIVE = false;
            ACTIVE = stepKernel(data, stack_ptr + 1);
        }

        data.state = state;

        if (data.prod == 71) {
            data.stack_ptr = stack_ptr;
            data.input_ptr = input_ptr;
            l.slice(copy);
            return true;
        } else {
            l.sync(copy);
            data.stack_ptr = stack_ptr;
            data.input_ptr = input_ptr;
            return false;
        };
    }
    return false;
}