
const
    action_array_offset = (191488 << 1),
    error_array_offset = action_array_offset + (1048576 << 2),
    TokenSpace: i32 = 1,
    TokenNumber: i32 = 2,
    TokenIdentifier: i32 = 3,
    TokenNewLine: i32 = 4,
    TokenSymbol: i32 = 5,
    TypeSymbol: i32 = 6,
    TokenKeyword: i32 = 7,
    id: u16 = 2,
    num: u16 = 4;

var
    mark_: u32 = 0,
    action_ptr: u32 = 0,
    error_ptr: u32 = 0,
    stack_ptr: u32 = 0,
    str: string = "",
    FAILED: boolean = false,
    prod: i32 = -1;


class Lexer {

    ty: i32;
    id: i32;
    tl: i32;
    off: i32;


    constructor() {
        this.ty = 0; //Default "non-value" for types is 1<<18;
        this.id = 0;
        this.tl = 0;
        this.off = 0;
    }

    copy(destination: Lexer = new Lexer()): Lexer {
        destination.off = this.off;
        destination.id = this.id;
        destination.ty = this.ty;
        destination.tl = this.tl;
        return destination;
    }

    sync(marker: Lexer): void { marker.copy(this); }

    peek(): Lexer {

        var peeking_marker: Lexer = new Lexer();

        peeking_marker.copy(peeking_marker);

        peeking_marker.next();

        return peeking_marker;
    }

    next(): Lexer {

        var l: i32 = str.length,
            length: i32 = 1,
            off: i32 = this.off + this.tl,
            type: i32 = 0,
            base: i32 = off;

        this.ty = 0;
        this.id = 0;

        if (off >= l) {
            this.off = l;
            this.tl = 0;
            return this;
        }

        const code: i32 = str.codePointAt(off);

        switch (load<u16>(0 + (code << 1)) & 255) {
            default:
            case 0: //SYMBOL
                this.id = type = TypeSymbol;
                break;
            case 1: //IDENTIFIER
                while (1) {
                    while (++off < l && (((id | num) & (load<u16>(0 + (str.codePointAt(off) << 1)) >> 8))));
                    this.id = type = TokenIdentifier;
                    length = off - base;
                    break;
                } break;
            case 2: //SPACE SET
                this.id = type = TokenSpace;
                break;
            case 3: //CARRIAGE RETURN
                length = 2;
            //intentional
            case 4: //LINEFEED
                this.id = type = TokenNewLine;
                break;
            case 5: //NUMBER
                this.id = type = TokenNumber;
                //Check for binary, hexadecimal, and octal representation
                while (++off < l && (num & (load<u16>(0 + (str.codePointAt(off) << 1)) >> 8)));
                length = off - base;
                break;
        }
        if (type == TokenIdentifier) {
            const val: u32 = str.charCodeAt(base + 0);
            if (val == 70) {
                if (length <= 1) { type = TokenKeyword; this.id = 73; length = 1; }
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 79) {
                    const val: u32 = str.charCodeAt(base + 2);
                    if (val == 82) {
                        const val: u32 = str.charCodeAt(base + 3);
                        if (val == 75) {
                            if (length <= 4) { type = TokenKeyword; this.id = 29; length = 4; }
                        }
                    }
                }
            }
            else if (val == 69) {
                if (length <= 1) { type = TokenKeyword; this.id = 72; length = 1; }
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 88) {
                    const val: u32 = str.charCodeAt(base + 2);
                    if (val == 67) {
                        if (length <= 3) { type = TokenKeyword; this.id = 31; length = 3; }
                    }
                    else if (val == 84) {
                        if (length <= 3) { type = TokenKeyword; this.id = 53; length = 3; }
                    }
                }
                else if (val == 82) {
                    const val: u32 = str.charCodeAt(base + 2);
                    if (val == 82) {
                        if (length <= 3) { type = TokenKeyword; this.id = 32; length = 3; }
                        const val: u32 = str.charCodeAt(base + 3);
                        if (val == 79) {
                            const val: u32 = str.charCodeAt(base + 4);
                            if (val == 82) {
                                if (length <= 5) { type = TokenKeyword; this.id = 51; length = 5; }
                            }
                        }
                    }
                }
            }
            else if (val == 73) {
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 71) {
                    const val: u32 = str.charCodeAt(base + 2);
                    if (val == 78) {
                        if (length <= 3) { type = TokenKeyword; this.id = 33; length = 3; }
                        const val: u32 = str.charCodeAt(base + 3);
                        if (val == 79) {
                            const val: u32 = str.charCodeAt(base + 4);
                            if (val == 82) {
                                const val: u32 = str.charCodeAt(base + 5);
                                if (val == 69) {
                                    if (length <= 6) { type = TokenKeyword; this.id = 50; length = 6; }
                                }
                            }
                        }
                    }
                }
                else if (val == 77) {
                    const val: u32 = str.charCodeAt(base + 2);
                    if (val == 80) {
                        const val: u32 = str.charCodeAt(base + 3);
                        if (val == 79) {
                            const val: u32 = str.charCodeAt(base + 4);
                            if (val == 82) {
                                const val: u32 = str.charCodeAt(base + 5);
                                if (val == 84) {
                                    if (length <= 6) { type = TokenKeyword; this.id = 56; length = 6; }
                                }
                            }
                        }
                    }
                }
            }
            else if (val == 82) {
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 83) {
                    const val: u32 = str.charCodeAt(base + 2);
                    if (val == 84) {
                        if (length <= 3) { type = TokenKeyword; this.id = 34; length = 3; }
                    }
                }
                else if (val == 69) {
                    const val: u32 = str.charCodeAt(base + 2);
                    if (val == 68) {
                        if (length <= 3) { type = TokenKeyword; this.id = 35; length = 3; }
                    }
                }
            }
            else if (val == 101) {
                if (length <= 1) { type = TokenKeyword; this.id = 67; length = 1; }
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 114) {
                    const val: u32 = str.charCodeAt(base + 2);
                    if (val == 104) {
                        if (length <= 3) { type = TokenKeyword; this.id = 39; length = 3; }
                    }
                }
            }
            else if (val == 99) {
                if (length <= 1) { type = TokenKeyword; this.id = 42; length = 1; }
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 115) {
                    const val: u32 = str.charCodeAt(base + 2);
                    if (val == 116) {
                        const val: u32 = str.charCodeAt(base + 3);
                        if (val == 114) {
                            if (length <= 4) { type = TokenKeyword; this.id = 41; length = 4; }
                        }
                    }
                }
            }
            else if (val == 114) {
                if (length <= 1) { type = TokenKeyword; this.id = 44; length = 1; }
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 101) {
                    const val: u32 = str.charCodeAt(base + 2);
                    if (val == 116) {
                        const val: u32 = str.charCodeAt(base + 3);
                        if (val == 117) {
                            const val: u32 = str.charCodeAt(base + 4);
                            if (val == 114) {
                                const val: u32 = str.charCodeAt(base + 5);
                                if (val == 110) {
                                    if (length <= 6) { type = TokenKeyword; this.id = 43; length = 6; }
                                }
                            }
                        }
                    }
                }
            }
            else if (val == 102) {
                if (length <= 1) { type = TokenKeyword; this.id = 46; length = 1; }
            }
            else if (val == 83) {
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 89) {
                    const val: u32 = str.charCodeAt(base + 2);
                    if (val == 77) {
                        const val: u32 = str.charCodeAt(base + 3);
                        if (val == 66) {
                            const val: u32 = str.charCodeAt(base + 4);
                            if (val == 79) {
                                const val: u32 = str.charCodeAt(base + 5);
                                if (val == 76) {
                                    if (length <= 6) { type = TokenKeyword; this.id = 48; length = 6; }
                                }
                            }
                        }
                    }
                }
            }
            else if (val == 80) {
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 82) {
                    const val: u32 = str.charCodeAt(base + 2);
                    if (val == 69) {
                        const val: u32 = str.charCodeAt(base + 3);
                        if (val == 67) {
                            if (length <= 4) { type = TokenKeyword; this.id = 49; length = 4; }
                        }
                    }
                }
            }
            else if (val == 78) {
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 65) {
                    const val: u32 = str.charCodeAt(base + 2);
                    if (val == 77) {
                        const val: u32 = str.charCodeAt(base + 3);
                        if (val == 69) {
                            if (length <= 4) { type = TokenKeyword; this.id = 52; length = 4; }
                        }
                    }
                }
            }
            else if (val == 65) {
                if (length <= 1) { type = TokenKeyword; this.id = 68; length = 1; }
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 83) {
                    if (length <= 2) { type = TokenKeyword; this.id = 54; length = 2; }
                }
            }
            else if (val == 97) {
                if (length <= 1) { type = TokenKeyword; this.id = 64; length = 1; }
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 115) {
                    if (length <= 2) { type = TokenKeyword; this.id = 55; length = 2; }
                    const val: u32 = str.charCodeAt(base + 2);
                    if (val == 115) {
                        const val: u32 = str.charCodeAt(base + 3);
                        if (val == 101) {
                            const val: u32 = str.charCodeAt(base + 4);
                            if (val == 114) {
                                const val: u32 = str.charCodeAt(base + 5);
                                if (val == 116) {
                                    if (length <= 6) { type = TokenKeyword; this.id = 59; length = 6; }
                                }
                            }
                        }
                    }
                }
            }
            else if (val == 115) {
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 104) {
                    const val: u32 = str.charCodeAt(base + 2);
                    if (val == 105) {
                        const val: u32 = str.charCodeAt(base + 3);
                        if (val == 102) {
                            const val: u32 = str.charCodeAt(base + 4);
                            if (val == 116) {
                                if (length <= 5) { type = TokenKeyword; this.id = 60; length = 5; }
                            }
                        }
                    }
                }
            }
            else if (val == 103) {
                if (length <= 1) { type = TokenKeyword; this.id = 61; length = 1; }
            }
            else if (val == 116) {
                if (length <= 1) { type = TokenKeyword; this.id = 62; length = 1; }
            }
            else if (val == 98) {
                if (length <= 1) { type = TokenKeyword; this.id = 65; length = 1; }
            }
            else if (val == 100) {
                if (length <= 1) { type = TokenKeyword; this.id = 66; length = 1; }
            }
            else if (val == 66) {
                if (length <= 1) { type = TokenKeyword; this.id = 69; length = 1; }
            }
            else if (val == 67) {
                if (length <= 1) { type = TokenKeyword; this.id = 70; length = 1; }
            }
            else if (val == 68) {
                if (length <= 1) { type = TokenKeyword; this.id = 71; length = 1; }
            }
        }
        if (type == TypeSymbol || type == TokenIdentifier) {
            const val: u32 = str.charCodeAt(base + 0);
            if (val == 40) {
                type = TokenSymbol; this.id = 28 /* ( */; length = 1;
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 40) {
                    type = TokenSymbol; this.id = 10 /* (( */; length = 2;
                }
                else if (val == 42) {
                    type = TokenSymbol; this.id = 15 /* (* */; length = 2;
                }
                else if (val == 43) {
                    type = TokenSymbol; this.id = 16 /* (+ */; length = 2;
                }
            }
            else if (val == 41) {
                type = TokenSymbol; this.id = 30 /* ) */; length = 1;
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 41) {
                    type = TokenSymbol; this.id = 11 /* )) */; length = 2;
                }
            }
            else if (val == 60) {
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 62) {
                    type = TokenSymbol; this.id = 12 /* <> */; length = 2;
                }
            }
            else if (val == 43) {
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 62) {
                    type = TokenSymbol; this.id = 13 /* +> */; length = 2;
                }
            }
            else if (val == 61) {
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 62) {
                    type = TokenSymbol; this.id = 14 /* => */; length = 2;
                }
            }
            else if (val == 58) {
                type = TokenSymbol; this.id = 40 /* : */; length = 1;
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 58) {
                    type = TokenSymbol; this.id = 17 /* :: */; length = 2;
                }
            }
            else if (val == 964) {
                type = TokenSymbol; this.id = 18 /* τ */; length = 1;
            }
            else if (val == 952) {
                type = TokenSymbol; this.id = 19 /* θ */; length = 1;
            }
            else if (val == 603) {
                type = TokenSymbol; this.id = 20 /* ɛ */; length = 1;
            }
            else if (val == 36) {
                type = TokenSymbol; this.id = 79 /* $ */; length = 1;
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 101) {
                    const val: u32 = str.charCodeAt(base + 2);
                    if (val == 111) {
                        const val: u32 = str.charCodeAt(base + 3);
                        if (val == 102) {
                            type = TokenSymbol; this.id = 21 /* $eof */; length = 4;
                        }
                    }
                }
            }
            else if (val == 9474) {
                type = TokenSymbol; this.id = 22 /* │ */; length = 1;
            }
            else if (val == 124) {
                type = TokenSymbol; this.id = 23 /* | */; length = 1;
            }
            else if (val == 8594) {
                type = TokenSymbol; this.id = 24 /* → */; length = 1;
            }
            else if (val == 62) {
                type = TokenSymbol; this.id = 25 /* > */; length = 1;
            }
            else if (val == 91) {
                type = TokenSymbol; this.id = 26 /* [ */; length = 1;
            }
            else if (val == 93) {
                type = TokenSymbol; this.id = 27 /* ] */; length = 1;
            }
            else if (val == 94) {
                type = TokenSymbol; this.id = 36 /* ^ */; length = 1;
            }
            else if (val == 123) {
                type = TokenSymbol; this.id = 37 /* { */; length = 1;
            }
            else if (val == 125) {
                type = TokenSymbol; this.id = 38 /* } */; length = 1;
            }
            else if (val == 8614) {
                type = TokenSymbol; this.id = 45 /* ↦ */; length = 1;
            }
            else if (val == 64) {
                type = TokenSymbol; this.id = 47 /* @ */; length = 1;
            }
            else if (val == 35) {
                type = TokenSymbol; this.id = 57 /* # */; length = 1;
            }
            else if (val == 63) {
                type = TokenSymbol; this.id = 58 /* ? */; length = 1;
            }
            else if (val == 92) {
                type = TokenSymbol; this.id = 63 /* \ */; length = 1;
            }
            else if (val == 34) {
                type = TokenSymbol; this.id = 74 /* " */; length = 1;
            }
            else if (val == 39) {
                type = TokenSymbol; this.id = 75 /* ' */; length = 1;
            }
            else if (val == 47) {
                type = TokenSymbol; this.id = 76 /* / */; length = 1;
            }
            else if (val == 45) {
                type = TokenSymbol; this.id = 77 /* - */; length = 1;
            }
            else if (val == 95) {
                type = TokenSymbol; this.id = 78 /* _ */; length = 1;
            }
        }

        this.ty = type;
        this.off = base;
        this.tl = length;

        return this;
    }
    get END(): boolean { return this.off >= str.length; }
}

function set_error(val: u32): void {
    store<u32>(((error_ptr++ & 0xFF) << 2) + error_array_offset, val);
}

function set_action(val: u32): void {
    store<u32>(((action_ptr++) << 2) + (action_array_offset), val);
}

function completeProduction(body: u32, len: u32, production: u32): void {
    add_reduce(len, body);
    prod = production;
}

@inline
function mark(): u32 {
    mark_ = action_ptr;
    return mark_;
}

@inline
function reset(mark: u32): void {
    action_ptr = mark;
}

@inline
function add_skip(char_len: u32): void {
    const ACTION: u32 = 3;
    const val: u32 = ACTION | (char_len << 2);
    set_action(val);
}

function add_shift(char_len: u32): void {
    //stack_ptr++;
    const ACTION: u32 = 2;
    const val: u32 = ACTION | (char_len << 2);
    set_action(val);
}

function completeProductionPlain(len: u32, production: u32): void {
    //stack_ptr -= len;
    prod = production;
}

function add_reduce(sym_len: u32, body: u32): void {
    //stack_ptr -= sym_len;
    const ACTION: u32 = 1;
    const val: u32 = ACTION | ((sym_len & 0x3FFF) << 2) | (body << 16);
    set_action(val);
}

@inline
function lm(lex: Lexer, syms: StaticArray<u32>): boolean {

    const l = syms.length;

    for (let i = 0; i < l; i++) {
        const sym = syms[i];
        if (lex.id == sym || lex.ty == sym) return true;
    }

    return false;
}

function fail(lex: Lexer): void {
    prod = -1;
    soft_fail(lex);
}

function soft_fail(lex: Lexer): void {
    FAILED = true;
    set_error(lex.off);
}

function setProduction(production: u32): void {
    prod = (-FAILED) + (-FAILED + 1) * production;
}

function _pk(lex: Lexer, /* eh, */ skips: StaticArray<u32>): Lexer {

    lex.next();

    if (skips) while (lm(lex, skips)) lex.next();

    return lex;
}

function _skip(lex: Lexer, skips: StaticArray<u32>): void {
    const off: u32 = lex.off;
    while (lm(lex, skips)) lex.next();
    const diff: i32 = lex.off - off;
    if (diff > 0) add_skip(diff);
}

function _no_check_with_skip(lex: Lexer, skips: StaticArray<u32>): void {
    add_shift(lex.tl);
    lex.next();
    _skip(lex, skips);
}

function _no_check(lex: Lexer): void {
    add_shift(lex.tl);
    lex.next();
}

function _with_skip(lex: Lexer, skips: StaticArray<u32>, sym: u32 = 0): void {

    if (FAILED) return;

    if (sym == 0 || lex.id == sym || lex.ty == sym) {
        _no_check_with_skip(lex, skips);
    } else {
        //TODO error recovery
        soft_fail(lex);
    }
}

function _(lex: Lexer, sym: u32 = 0): void {

    if (FAILED) return;

    if (sym == 0 || lex.id == sym || lex.ty == sym) {
        _no_check(lex);
    } else {
        //TODO error recovery
        soft_fail(lex);
    }
}

var prob_index = 0;
//For Debugging
function probe(l: Lexer, id: u32 = 1): void {
    set_error(0xF000000F + (id << 16) + (prob_index << 4));
    set_error(l.ty);
    set_error(l.id);
    set_error(l.tl);
    set_error(l.off);
    set_error(prod);
    set_error(stack_ptr);
    set_error(FAILED);
    set_error(0xF000000F + (id << 16) + ((prob_index++) << 4));
}


const const__ = StaticArray.fromArray<u32>([1/* ws */, 4/* nl */]),
    const_1_ = StaticArray.fromArray<u32>([4/* nl */]),
    const_2_ = StaticArray.fromArray<u32>([1/* ws */]),
    const_0_ = StaticArray.fromArray<u32>([18/* τ */, 19/* θ */, 26/* [ */, 28/* ( */, 45/* ↦ */, 46/* f */, 59/* assert */, 60/* shift */, 61/* g */, 62/* t */, 63/* \ */, 78/* _ */, 79/* $ */]),
    const_3_ = StaticArray.fromArray<u32>([17/* :: */, 18/* τ */, 19/* θ */, 20/* ɛ */, 21/* $eof */, 26/* [ */, 28/* ( */, 31/* EXC */, 32/* ERR */, 33/* IGN */, 34/* RST */, 35/* RED */, 37/* { */, 40/* : */, 45/* ↦ */, 46/* f */, 59/* assert */, 60/* shift */, 61/* g */, 62/* t */, 63/* \ */, 78/* _ */, 79/* $ */]),
    const_4_ = StaticArray.fromArray<u32>([18/* τ */, 19/* θ */, 20/* ɛ */, 21/* $eof */, 26/* [ */, 45/* ↦ */, 46/* f */, 59/* assert */, 60/* shift */, 61/* g */, 62/* t */, 63/* \ */, 78/* _ */, 79/* $ */]),
    _0id0 = (l: Lexer): void => {

        $prd$production(l); stack_ptr++;

    },
    _0id2 = (l: Lexer): void => {

        $fn$referenced_function(l); stack_ptr++;

    },
    _3id2 = (l: Lexer): void => {

        $cm$comment(l); stack_ptr++;

    },
    _399id0 = (l: Lexer): void => {

        _no_check(l);; stack_ptr++; State4(l);

    },
    _399id1 = (l: Lexer): void => {

        _no_check(l);; stack_ptr++; State5(l);

    },
    _292id0 = (l: Lexer): void => {

        $pb$production_bodies(l); stack_ptr++;

    },
    _352id0 = (l: Lexer): void => {

        $pb$production_bodies_group_04_100(l); stack_ptr++;

    },
    _367id0 = (l: Lexer): void => {
        let $mark = mark(), sp = stack_ptr, cp = l.copy();
        $prd$production_group_111_102(cp); stack_ptr++;
        if (FAILED) {
            reset($mark); FAILED = false; stack_ptr = sp;
            $pb$production_bodies_group_04_100(l); stack_ptr++;;
        } else l.sync(cp);

    },
    _313id0 = (l: Lexer): void => {

        completeProduction(8, 2, 12); stack_ptr -= 2;

    },
    _312id0 = (l: Lexer): void => {

        $pb$production_body(l); stack_ptr++;

    },
    _388id0 = (l: Lexer): void => {

        completeProduction(14, 3, 12); stack_ptr -= 3;

    },
    _255id0 = (l: Lexer): void => {

        completeProduction(13, 1, 12); stack_ptr -= 1;

    },
    _97id0 = (l: Lexer): void => {

        $fn$js_primitive(l); stack_ptr++;

    },
    _97id8 = (l: Lexer): void => {

        $fn$js_data_block(l); stack_ptr++;

    },
    _99id0 = (l: Lexer): void => {

        completeProduction(0, 1, 23); stack_ptr -= 1;

    },
    _248id0 = (l: Lexer): void => {

        completeProduction(38, 2, 23); stack_ptr -= 2;

    },
    _85id0 = (l: Lexer): void => {

        completeProduction(42, 1, 54); stack_ptr -= 1;

    },
    _232id0 = (l: Lexer): void => {

        completeProduction(41, 2, 54); stack_ptr -= 2;

    },
    _41id0 = (l: Lexer): void => {

        completeProduction(42, 1, 31); stack_ptr -= 1;

    },
    _216id0 = (l: Lexer): void => {

        completeProduction(41, 2, 31); stack_ptr -= 2;

    },
    _58ty0 = (l: Lexer): void => {

        completeProduction(8, 1, 47); stack_ptr -= 1;

    },
    _223ty0 = (l: Lexer): void => {

        completeProduction(38, 2, 47); stack_ptr -= 2;

    },
    _233id0 = (l: Lexer): void => {

        $sym$symbol(l); stack_ptr++;

    },
    _233id9 = (l: Lexer): void => {
        let $mark = mark(), sp = stack_ptr, cp = l.copy();
        $sym$symbol(cp); stack_ptr++;
        if (FAILED) {
            reset($mark); FAILED = false; stack_ptr = sp;
            $pb$condition_clause(l); stack_ptr++;;
        } else l.sync(cp);

    },
    _233id10 = (l: Lexer): void => {

        $fn$function_clause(l); stack_ptr++;

    },
    _233id12 = (l: Lexer): void => {

        _no_check(l);; stack_ptr++; State238(l);

    },
    _238id0 = (l: Lexer): void => {

        $pb$body_entries(l); stack_ptr++;

    },
    _234id0 = (l: Lexer): void => {

        $sym$symbol_group_032_105(l); stack_ptr++;

    },
    _234id2 = (l: Lexer): void => {

        _no_check(l);; stack_ptr++; State280(l);

    },
    const_5_ = (l: Lexer): void => {

        completeProduction(21, 1, 15); stack_ptr -= 1;

    },
    _237id2 = (l: Lexer): void => {
        let $mark = mark(), sp = stack_ptr, cp = l.copy();
        $pb$condition_clause(cp); stack_ptr++;
        if (FAILED) {
            reset($mark); FAILED = false; stack_ptr = sp;
            $sym$symbol(l); stack_ptr++;;
        } else l.sync(cp);

    },
    _322id12 = (l: Lexer): void => {

        _no_check(l);; stack_ptr++; State353(l);

    },
    _280id0 = (l: Lexer): void => {

        completeProduction(53, 2, 63); stack_ptr -= 2;

    },
    _281id0 = (l: Lexer): void => {

        $sym$terminal_symbol(l); stack_ptr++;

    },
    _281id7 = (l: Lexer): void => {

        _no_check(l);; stack_ptr++; State324(l);

    },
    const_6_ = StaticArray.fromArray<u32>([12/* <> */, 13/* +> */, 15/* (* */, 16/* (+ */, 22/* │ */, 23/* | */, 27/* ] */, 28/* ( */, 45/* ↦ */, 46/* f */, 57/* # */, 58/* ? */, 78/* _ */, 79/* $ */]),
    _311id0 = (l: Lexer): void => {

        completeProduction(22, 2, 15); stack_ptr -= 2;

    },
    _353id0 = (l: Lexer): void => {

        completeProduction(23, 3, 15); stack_ptr -= 3;

    },
    _324id0 = (l: Lexer): void => {

        completeProduction(50, 3, 63); stack_ptr -= 3;

    },
    _351id0 = (l: Lexer): void => {

        completeProduction(50, 4, 63); stack_ptr -= 4;

    },
    _243id0 = (l: Lexer): void => {

        _no_check(l);; stack_ptr++; State181(l);

    },
    _243id1 = (l: Lexer): void => {

        _no_check(l);; stack_ptr++; State182(l);

    },
    _243ty0 = (l: Lexer): void => {

        _no_check(l);; stack_ptr++; State183(l);

    },
    _243ty1 = (l: Lexer): void => {

        _no_check(l);; stack_ptr++; State160(l);

    },
    _181id0 = (l: Lexer): void => {

        completeProduction(0, 1, 100); stack_ptr -= 1;

    },
    _168id0 = (l: Lexer): void => {

        $sym$generated_symbol(l); stack_ptr++;

    },
    _168id2 = (l: Lexer): void => {
        let $mark = mark(), sp = stack_ptr, cp = l.copy();
        $sym$production_symbol(cp); stack_ptr++;
        if (FAILED) {
            reset($mark); FAILED = false; stack_ptr = sp;
            $sym$imported_production_symbol(l); stack_ptr++;;
        } else l.sync(cp);

    },
    _168id4 = (l: Lexer): void => {

        $sym$literal_symbol(l); stack_ptr++;

    },
    _168id6 = (l: Lexer): void => {

        $sym$escaped_symbol(l); stack_ptr++;

    },
    _168id7 = (l: Lexer): void => {

        $sym$assert_function_symbol(l); stack_ptr++;

    },
    _168id9 = (l: Lexer): void => {

        _no_check(l);; stack_ptr++; State175(l);

    },
    _168ty2 = (l: Lexer): void => {

        _no_check(l);; stack_ptr++; State177(l);

    },
    _168ty3 = (l: Lexer): void => {

        _no_check(l);; stack_ptr++; State178(l);

    },
    const_7_ = StaticArray.fromArray<u32>([12/* <> */, 13/* +> */, 18/* τ */, 19/* θ */, 22/* │ */, 23/* | */, 27/* ] */, 28/* ( */, 30/* ) */, 45/* ↦ */, 46/* f */, 57/* # */, 59/* assert */, 60/* shift */, 61/* g */, 62/* t */, 63/* \ */, 78/* _ */, 79/* $ */]),
    _177id0 = (l: Lexer): void => {

        completeProduction(52, 1, 63); stack_ptr -= 1;

    },
    _178id0 = (l: Lexer): void => {

        completeProduction(0, 1, 63); stack_ptr -= 1;

    },
    _260id0 = (l: Lexer): void => {
        let $mark = mark(), sp = stack_ptr, cp = l.copy();
        $fn$reduce_function(cp); stack_ptr++;
        if (FAILED) {
            reset($mark); FAILED = false; stack_ptr = sp;
            $fn$function_clause(l); stack_ptr++;;
        } else l.sync(cp);

    },
    const_8_ = (l: Lexer): void => {

        completeProduction(20, 1, 14); stack_ptr -= 1;

    },
    _258id0 = (l: Lexer): void => {

        completeProduction(16, 1, 13); stack_ptr -= 1;

    },
    _308id3 = (l: Lexer): void => {

        _no_check(l);; stack_ptr++; State343(l);

    },
    _334id0 = (l: Lexer): void => {

        completeProduction(17, 2, 14); stack_ptr -= 2;

    },
    _93id0 = (l: Lexer): void => {

        completeProduction(42, 1, 50); stack_ptr -= 1;

    },
    _242id0 = (l: Lexer): void => {

        completeProduction(41, 2, 50); stack_ptr -= 2;

    };
const idm0: Map<number, (L: Lexer) => void> = new Map();
idm0.set(12/* <> */, _0id0);
idm0.set(13/* +> */, _0id0);
idm0.set(45/* ↦ */, _0id2);
idm0.set(46/* f */, _0id2);
const idm3: Map<number, (L: Lexer) => void> = new Map();
idm3.set(12/* <> */, _0id0);
idm3.set(13/* +> */, _0id0);
idm3.set(57/* # */, _3id2);
idm3.set(45/* ↦ */, _0id2);
idm3.set(46/* f */, _0id2);
const idm399: Map<number, (L: Lexer) => void> = new Map();
idm399.set(12/* <> */, _399id0);
idm399.set(13/* +> */, _399id1);
const idm292: Map<number, (L: Lexer) => void> = new Map();
idm292.set(28/* ( */, _292id0);
idm292.set(19/* θ */, _292id0);
idm292.set(61/* g */, _292id0);
idm292.set(78/* _ */, _292id0);
idm292.set(79/* $ */, _292id0);
idm292.set(18/* τ */, _292id0);
idm292.set(62/* t */, _292id0);
idm292.set(63/* \ */, _292id0);
idm292.set(59/* assert */, _292id0);
idm292.set(60/* shift */, _292id0);
idm292.set(45/* ↦ */, _292id0);
idm292.set(46/* f */, _292id0);
idm292.set(26/* [ */, _292id0);
idm292.set(20/* ɛ */, _292id0);
idm292.set(21/* $eof */, _292id0);
const tym292: Map<number, (L: Lexer) => void> = new Map();
tym292.set(3/* id */, _292id0);
tym292.set(7/* key */, _292id0);
tym292.set(6/* sym */, _292id0);
tym292.set(5/* tok */, _292id0);
const idm352: Map<number, (L: Lexer) => void> = new Map();
idm352.set(22/* │ */, _352id0);
idm352.set(23/* | */, _352id0);
idm352.set(57/* # */, _3id2);
const idm367: Map<number, (L: Lexer) => void> = new Map();
idm367.set(22/* │ */, _367id0);
idm367.set(23/* | */, _367id0);
idm367.set(57/* # */, _3id2);
const idm313r: Map<number, (L: Lexer) => void> = new Map();
idm313r.set(22/* │ */, _313id0);
idm313r.set(23/* | */, _313id0);
idm313r.set(57/* # */, _313id0);
idm313r.set(30/* ) */, _313id0);
idm313r.set(12/* <> */, _313id0);
idm313r.set(13/* +> */, _313id0);
idm313r.set(45/* ↦ */, _313id0);
idm313r.set(46/* f */, _313id0);
const tym313r: Map<number, (L: Lexer) => void> = new Map();
tym313r.set(0/* EOF */, _313id0);
const idm312: Map<number, (L: Lexer) => void> = new Map();
idm312.set(28/* ( */, _312id0);
idm312.set(19/* θ */, _312id0);
idm312.set(61/* g */, _312id0);
idm312.set(78/* _ */, _312id0);
idm312.set(79/* $ */, _312id0);
idm312.set(18/* τ */, _312id0);
idm312.set(62/* t */, _312id0);
idm312.set(63/* \ */, _312id0);
idm312.set(59/* assert */, _312id0);
idm312.set(60/* shift */, _312id0);
idm312.set(45/* ↦ */, _312id0);
idm312.set(46/* f */, _312id0);
idm312.set(26/* [ */, _312id0);
idm312.set(20/* ɛ */, _312id0);
idm312.set(21/* $eof */, _312id0);
const tym312: Map<number, (L: Lexer) => void> = new Map();
tym312.set(3/* id */, _312id0);
tym312.set(7/* key */, _312id0);
tym312.set(6/* sym */, _312id0);
tym312.set(5/* tok */, _312id0);
const idm388r: Map<number, (L: Lexer) => void> = new Map();
idm388r.set(22/* │ */, _388id0);
idm388r.set(23/* | */, _388id0);
idm388r.set(57/* # */, _388id0);
idm388r.set(30/* ) */, _388id0);
idm388r.set(12/* <> */, _388id0);
idm388r.set(13/* +> */, _388id0);
idm388r.set(45/* ↦ */, _388id0);
idm388r.set(46/* f */, _388id0);
const tym388r: Map<number, (L: Lexer) => void> = new Map();
tym388r.set(0/* EOF */, _388id0);
const idm255r: Map<number, (L: Lexer) => void> = new Map();
idm255r.set(22/* │ */, _255id0);
idm255r.set(23/* | */, _255id0);
idm255r.set(57/* # */, _255id0);
idm255r.set(30/* ) */, _255id0);
idm255r.set(12/* <> */, _255id0);
idm255r.set(13/* +> */, _255id0);
idm255r.set(45/* ↦ */, _255id0);
idm255r.set(46/* f */, _255id0);
const tym255r: Map<number, (L: Lexer) => void> = new Map();
tym255r.set(0/* EOF */, _255id0);
const idm97: Map<number, (L: Lexer) => void> = new Map();
idm97.set(19/* θ */, _97id0);
idm97.set(61/* g */, _97id0);
idm97.set(18/* τ */, _97id0);
idm97.set(62/* t */, _97id0);
idm97.set(63/* \ */, _97id0);
idm97.set(59/* assert */, _97id0);
idm97.set(60/* shift */, _97id0);
idm97.set(21/* $eof */, _97id0);
idm97.set(37/* { */, _97id8);
const tym97: Map<number, (L: Lexer) => void> = new Map();
tym97.set(3/* id */, _97id0);
tym97.set(2/* num */, _97id0);
tym97.set(1/* ws */, _97id0);
tym97.set(6/* sym */, _97id0);
tym97.set(5/* tok */, _97id0);
tym97.set(7/* key */, _97id0);
const idm99r: Map<number, (L: Lexer) => void> = new Map();
idm99r.set(38/* } */, _99id0);
idm99r.set(19/* θ */, _99id0);
idm99r.set(61/* g */, _99id0);
idm99r.set(18/* τ */, _99id0);
idm99r.set(62/* t */, _99id0);
idm99r.set(63/* \ */, _99id0);
idm99r.set(59/* assert */, _99id0);
idm99r.set(60/* shift */, _99id0);
idm99r.set(37/* { */, _99id0);
const tym99r: Map<number, (L: Lexer) => void> = new Map();
tym99r.set(0/* EOF */, _99id0);
tym99r.set(3/* id */, _99id0);
tym99r.set(2/* num */, _99id0);
tym99r.set(1/* ws */, _99id0);
tym99r.set(6/* sym */, _99id0);
tym99r.set(5/* tok */, _99id0);
tym99r.set(7/* key */, _99id0);
tym99r.set(88, _99id0);
const idm248r: Map<number, (L: Lexer) => void> = new Map();
idm248r.set(38/* } */, _248id0);
idm248r.set(19/* θ */, _248id0);
idm248r.set(61/* g */, _248id0);
idm248r.set(18/* τ */, _248id0);
idm248r.set(62/* t */, _248id0);
idm248r.set(63/* \ */, _248id0);
idm248r.set(59/* assert */, _248id0);
idm248r.set(60/* shift */, _248id0);
idm248r.set(37/* { */, _248id0);
const tym248r: Map<number, (L: Lexer) => void> = new Map();
tym248r.set(0/* EOF */, _248id0);
tym248r.set(3/* id */, _248id0);
tym248r.set(2/* num */, _248id0);
tym248r.set(1/* ws */, _248id0);
tym248r.set(6/* sym */, _248id0);
tym248r.set(5/* tok */, _248id0);
tym248r.set(7/* key */, _248id0);
tym248r.set(88, _248id0);
const idm85r: Map<number, (L: Lexer) => void> = new Map();
idm85r.set(19/* θ */, _85id0);
idm85r.set(61/* g */, _85id0);
idm85r.set(18/* τ */, _85id0);
idm85r.set(62/* t */, _85id0);
idm85r.set(63/* \ */, _85id0);
const tym85r: Map<number, (L: Lexer) => void> = new Map();
tym85r.set(4/* nl */, _85id0);
tym85r.set(0/* EOF */, _85id0);
tym85r.set(88, _85id0);
const idm232r: Map<number, (L: Lexer) => void> = new Map();
idm232r.set(19/* θ */, _232id0);
idm232r.set(61/* g */, _232id0);
idm232r.set(18/* τ */, _232id0);
idm232r.set(62/* t */, _232id0);
idm232r.set(63/* \ */, _232id0);
const tym232r: Map<number, (L: Lexer) => void> = new Map();
tym232r.set(4/* nl */, _232id0);
tym232r.set(0/* EOF */, _232id0);
tym232r.set(88, _232id0);
const idm41r: Map<number, (L: Lexer) => void> = new Map();
idm41r.set(19/* θ */, _41id0);
idm41r.set(61/* g */, _41id0);
idm41r.set(18/* τ */, _41id0);
idm41r.set(62/* t */, _41id0);
idm41r.set(63/* \ */, _41id0);
const tym41r: Map<number, (L: Lexer) => void> = new Map();
tym41r.set(6/* sym */, _41id0);
tym41r.set(3/* id */, _41id0);
tym41r.set(88, _41id0);
tym41r.set(4/* nl */, _41id0);
tym41r.set(0/* EOF */, _41id0);
const idm216r: Map<number, (L: Lexer) => void> = new Map();
idm216r.set(19/* θ */, _216id0);
idm216r.set(61/* g */, _216id0);
idm216r.set(18/* τ */, _216id0);
idm216r.set(62/* t */, _216id0);
idm216r.set(63/* \ */, _216id0);
const tym216r: Map<number, (L: Lexer) => void> = new Map();
tym216r.set(6/* sym */, _216id0);
tym216r.set(3/* id */, _216id0);
tym216r.set(88, _216id0);
tym216r.set(4/* nl */, _216id0);
tym216r.set(0/* EOF */, _216id0);
const tym58r: Map<number, (L: Lexer) => void> = new Map();
tym58r.set(4/* nl */, _58ty0);
tym58r.set(0/* EOF */, _58ty0);
tym58r.set(6/* sym */, _58ty0);
tym58r.set(5/* tok */, _58ty0);
tym58r.set(3/* id */, _58ty0);
tym58r.set(2/* num */, _58ty0);
tym58r.set(1/* ws */, _58ty0);
tym58r.set(7/* key */, _58ty0);
const tym223r: Map<number, (L: Lexer) => void> = new Map();
tym223r.set(4/* nl */, _223ty0);
tym223r.set(0/* EOF */, _223ty0);
tym223r.set(6/* sym */, _223ty0);
tym223r.set(5/* tok */, _223ty0);
tym223r.set(3/* id */, _223ty0);
tym223r.set(2/* num */, _223ty0);
tym223r.set(1/* ws */, _223ty0);
tym223r.set(7/* key */, _223ty0);
const idm233: Map<number, (L: Lexer) => void> = new Map();
idm233.set(19/* θ */, _233id0);
idm233.set(61/* g */, _233id0);
idm233.set(78/* _ */, _233id0);
idm233.set(79/* $ */, _233id0);
idm233.set(18/* τ */, _233id0);
idm233.set(62/* t */, _233id0);
idm233.set(63/* \ */, _233id0);
idm233.set(59/* assert */, _233id0);
idm233.set(60/* shift */, _233id0);
idm233.set(28/* ( */, _233id9);
idm233.set(45/* ↦ */, _233id10);
idm233.set(46/* f */, _233id10);
idm233.set(26/* [ */, _233id12);
const tym233: Map<number, (L: Lexer) => void> = new Map();
tym233.set(3/* id */, _233id0);
tym233.set(7/* key */, _233id0);
tym233.set(6/* sym */, _233id0);
tym233.set(5/* tok */, _233id0);
const idm238: Map<number, (L: Lexer) => void> = new Map();
idm238.set(19/* θ */, _238id0);
idm238.set(61/* g */, _238id0);
idm238.set(78/* _ */, _238id0);
idm238.set(79/* $ */, _238id0);
idm238.set(18/* τ */, _238id0);
idm238.set(62/* t */, _238id0);
idm238.set(63/* \ */, _238id0);
idm238.set(59/* assert */, _238id0);
idm238.set(60/* shift */, _238id0);
idm238.set(28/* ( */, _238id0);
idm238.set(45/* ↦ */, _238id0);
idm238.set(46/* f */, _238id0);
idm238.set(26/* [ */, _238id0);
const tym238: Map<number, (L: Lexer) => void> = new Map();
tym238.set(3/* id */, _238id0);
tym238.set(7/* key */, _238id0);
tym238.set(6/* sym */, _238id0);
tym238.set(5/* tok */, _238id0);
const idm234: Map<number, (L: Lexer) => void> = new Map();
idm234.set(16/* (+ */, _234id0);
idm234.set(15/* (* */, _234id0);
idm234.set(58/* ? */, _234id2);
const idm234r: Map<number, (L: Lexer) => void> = new Map();
idm234r.set(30/* ) */, const_5_);
idm234r.set(45/* ↦ */, const_5_);
idm234r.set(46/* f */, const_5_);
idm234r.set(28/* ( */, const_5_);
idm234r.set(19/* θ */, const_5_);
idm234r.set(61/* g */, const_5_);
idm234r.set(78/* _ */, const_5_);
idm234r.set(79/* $ */, const_5_);
idm234r.set(18/* τ */, const_5_);
idm234r.set(62/* t */, const_5_);
idm234r.set(63/* \ */, const_5_);
idm234r.set(59/* assert */, const_5_);
idm234r.set(60/* shift */, const_5_);
idm234r.set(22/* │ */, const_5_);
idm234r.set(23/* | */, const_5_);
idm234r.set(57/* # */, const_5_);
idm234r.set(12/* <> */, const_5_);
idm234r.set(13/* +> */, const_5_);
idm234r.set(27/* ] */, const_5_);
const tym234r: Map<number, (L: Lexer) => void> = new Map();
tym234r.set(0/* EOF */, const_5_);
tym234r.set(3/* id */, const_5_);
tym234r.set(7/* key */, const_5_);
tym234r.set(6/* sym */, const_5_);
tym234r.set(5/* tok */, const_5_);
const idm237: Map<number, (L: Lexer) => void> = new Map();
idm237.set(45/* ↦ */, _233id10);
idm237.set(46/* f */, _233id10);
idm237.set(28/* ( */, _237id2);
idm237.set(19/* θ */, _233id0);
idm237.set(61/* g */, _233id0);
idm237.set(78/* _ */, _233id0);
idm237.set(79/* $ */, _233id0);
idm237.set(18/* τ */, _233id0);
idm237.set(62/* t */, _233id0);
idm237.set(63/* \ */, _233id0);
idm237.set(59/* assert */, _233id0);
idm237.set(60/* shift */, _233id0);
const idm322: Map<number, (L: Lexer) => void> = new Map();
idm322.set(45/* ↦ */, _233id10);
idm322.set(46/* f */, _233id10);
idm322.set(28/* ( */, _237id2);
idm322.set(19/* θ */, _233id0);
idm322.set(61/* g */, _233id0);
idm322.set(78/* _ */, _233id0);
idm322.set(79/* $ */, _233id0);
idm322.set(18/* τ */, _233id0);
idm322.set(62/* t */, _233id0);
idm322.set(63/* \ */, _233id0);
idm322.set(59/* assert */, _233id0);
idm322.set(60/* shift */, _233id0);
idm322.set(27/* ] */, _322id12);
const idm280r: Map<number, (L: Lexer) => void> = new Map();
idm280r.set(30/* ) */, _280id0);
idm280r.set(58/* ? */, _280id0);
idm280r.set(16/* (+ */, _280id0);
idm280r.set(15/* (* */, _280id0);
idm280r.set(45/* ↦ */, _280id0);
idm280r.set(46/* f */, _280id0);
idm280r.set(28/* ( */, _280id0);
idm280r.set(19/* θ */, _280id0);
idm280r.set(61/* g */, _280id0);
idm280r.set(78/* _ */, _280id0);
idm280r.set(79/* $ */, _280id0);
idm280r.set(18/* τ */, _280id0);
idm280r.set(62/* t */, _280id0);
idm280r.set(63/* \ */, _280id0);
idm280r.set(59/* assert */, _280id0);
idm280r.set(60/* shift */, _280id0);
idm280r.set(22/* │ */, _280id0);
idm280r.set(23/* | */, _280id0);
idm280r.set(57/* # */, _280id0);
idm280r.set(12/* <> */, _280id0);
idm280r.set(13/* +> */, _280id0);
idm280r.set(27/* ] */, _280id0);
const tym280r: Map<number, (L: Lexer) => void> = new Map();
tym280r.set(0/* EOF */, _280id0);
tym280r.set(3/* id */, _280id0);
tym280r.set(7/* key */, _280id0);
tym280r.set(6/* sym */, _280id0);
tym280r.set(5/* tok */, _280id0);
const idm281: Map<number, (L: Lexer) => void> = new Map();
idm281.set(19/* θ */, _281id0);
idm281.set(61/* g */, _281id0);
idm281.set(18/* τ */, _281id0);
idm281.set(62/* t */, _281id0);
idm281.set(63/* \ */, _281id0);
idm281.set(59/* assert */, _281id0);
idm281.set(60/* shift */, _281id0);
idm281.set(30/* ) */, _281id7);
const idm311r: Map<number, (L: Lexer) => void> = new Map();
idm311r.set(30/* ) */, _311id0);
idm311r.set(45/* ↦ */, _311id0);
idm311r.set(46/* f */, _311id0);
idm311r.set(28/* ( */, _311id0);
idm311r.set(19/* θ */, _311id0);
idm311r.set(61/* g */, _311id0);
idm311r.set(78/* _ */, _311id0);
idm311r.set(79/* $ */, _311id0);
idm311r.set(18/* τ */, _311id0);
idm311r.set(62/* t */, _311id0);
idm311r.set(63/* \ */, _311id0);
idm311r.set(59/* assert */, _311id0);
idm311r.set(60/* shift */, _311id0);
idm311r.set(22/* │ */, _311id0);
idm311r.set(23/* | */, _311id0);
idm311r.set(57/* # */, _311id0);
idm311r.set(12/* <> */, _311id0);
idm311r.set(13/* +> */, _311id0);
idm311r.set(27/* ] */, _311id0);
const tym311r: Map<number, (L: Lexer) => void> = new Map();
tym311r.set(0/* EOF */, _311id0);
tym311r.set(3/* id */, _311id0);
tym311r.set(7/* key */, _311id0);
tym311r.set(6/* sym */, _311id0);
tym311r.set(5/* tok */, _311id0);
const idm353r: Map<number, (L: Lexer) => void> = new Map();
idm353r.set(22/* │ */, _353id0);
idm353r.set(23/* | */, _353id0);
idm353r.set(57/* # */, _353id0);
idm353r.set(12/* <> */, _353id0);
idm353r.set(13/* +> */, _353id0);
idm353r.set(30/* ) */, _353id0);
idm353r.set(45/* ↦ */, _353id0);
idm353r.set(46/* f */, _353id0);
idm353r.set(28/* ( */, _353id0);
idm353r.set(19/* θ */, _353id0);
idm353r.set(61/* g */, _353id0);
idm353r.set(78/* _ */, _353id0);
idm353r.set(79/* $ */, _353id0);
idm353r.set(18/* τ */, _353id0);
idm353r.set(62/* t */, _353id0);
idm353r.set(63/* \ */, _353id0);
idm353r.set(59/* assert */, _353id0);
idm353r.set(60/* shift */, _353id0);
idm353r.set(27/* ] */, _353id0);
const tym353r: Map<number, (L: Lexer) => void> = new Map();
tym353r.set(0/* EOF */, _353id0);
tym353r.set(3/* id */, _353id0);
tym353r.set(7/* key */, _353id0);
tym353r.set(6/* sym */, _353id0);
tym353r.set(5/* tok */, _353id0);
const idm324r: Map<number, (L: Lexer) => void> = new Map();
idm324r.set(30/* ) */, _324id0);
idm324r.set(58/* ? */, _324id0);
idm324r.set(16/* (+ */, _324id0);
idm324r.set(15/* (* */, _324id0);
idm324r.set(45/* ↦ */, _324id0);
idm324r.set(46/* f */, _324id0);
idm324r.set(28/* ( */, _324id0);
idm324r.set(19/* θ */, _324id0);
idm324r.set(61/* g */, _324id0);
idm324r.set(78/* _ */, _324id0);
idm324r.set(79/* $ */, _324id0);
idm324r.set(18/* τ */, _324id0);
idm324r.set(62/* t */, _324id0);
idm324r.set(63/* \ */, _324id0);
idm324r.set(59/* assert */, _324id0);
idm324r.set(60/* shift */, _324id0);
idm324r.set(22/* │ */, _324id0);
idm324r.set(23/* | */, _324id0);
idm324r.set(57/* # */, _324id0);
idm324r.set(12/* <> */, _324id0);
idm324r.set(13/* +> */, _324id0);
idm324r.set(27/* ] */, _324id0);
const tym324r: Map<number, (L: Lexer) => void> = new Map();
tym324r.set(0/* EOF */, _324id0);
tym324r.set(3/* id */, _324id0);
tym324r.set(7/* key */, _324id0);
tym324r.set(6/* sym */, _324id0);
tym324r.set(5/* tok */, _324id0);
const idm351r: Map<number, (L: Lexer) => void> = new Map();
idm351r.set(30/* ) */, _351id0);
idm351r.set(58/* ? */, _351id0);
idm351r.set(16/* (+ */, _351id0);
idm351r.set(15/* (* */, _351id0);
idm351r.set(45/* ↦ */, _351id0);
idm351r.set(46/* f */, _351id0);
idm351r.set(28/* ( */, _351id0);
idm351r.set(19/* θ */, _351id0);
idm351r.set(61/* g */, _351id0);
idm351r.set(78/* _ */, _351id0);
idm351r.set(79/* $ */, _351id0);
idm351r.set(18/* τ */, _351id0);
idm351r.set(62/* t */, _351id0);
idm351r.set(63/* \ */, _351id0);
idm351r.set(59/* assert */, _351id0);
idm351r.set(60/* shift */, _351id0);
idm351r.set(22/* │ */, _351id0);
idm351r.set(23/* | */, _351id0);
idm351r.set(57/* # */, _351id0);
idm351r.set(12/* <> */, _351id0);
idm351r.set(13/* +> */, _351id0);
idm351r.set(27/* ] */, _351id0);
const tym351r: Map<number, (L: Lexer) => void> = new Map();
tym351r.set(0/* EOF */, _351id0);
tym351r.set(3/* id */, _351id0);
tym351r.set(7/* key */, _351id0);
tym351r.set(6/* sym */, _351id0);
tym351r.set(5/* tok */, _351id0);
const idm243: Map<number, (L: Lexer) => void> = new Map();
idm243.set(78/* _ */, _243id0);
idm243.set(79/* $ */, _243id1);
const tym243: Map<number, (L: Lexer) => void> = new Map();
tym243.set(3/* id */, _243ty0);
tym243.set(7/* key */, _243ty1);
const idm181r: Map<number, (L: Lexer) => void> = new Map();
idm181r.set(30/* ) */, _181id0);
idm181r.set(78/* _ */, _181id0);
idm181r.set(79/* $ */, _181id0);
idm181r.set(17/* :: */, _181id0);
idm181r.set(58/* ? */, _181id0);
idm181r.set(16/* (+ */, _181id0);
idm181r.set(15/* (* */, _181id0);
idm181r.set(36/* ^ */, _181id0);
idm181r.set(37/* { */, _181id0);
idm181r.set(24/* → */, _181id0);
idm181r.set(25/* > */, _181id0);
idm181r.set(19/* θ */, _181id0);
idm181r.set(61/* g */, _181id0);
idm181r.set(18/* τ */, _181id0);
idm181r.set(62/* t */, _181id0);
idm181r.set(63/* \ */, _181id0);
idm181r.set(59/* assert */, _181id0);
idm181r.set(60/* shift */, _181id0);
idm181r.set(45/* ↦ */, _181id0);
idm181r.set(46/* f */, _181id0);
idm181r.set(28/* ( */, _181id0);
idm181r.set(27/* ] */, _181id0);
idm181r.set(22/* │ */, _181id0);
idm181r.set(23/* | */, _181id0);
idm181r.set(57/* # */, _181id0);
idm181r.set(12/* <> */, _181id0);
idm181r.set(13/* +> */, _181id0);
idm181r.set(38/* } */, _181id0);
const tym181r: Map<number, (L: Lexer) => void> = new Map();
tym181r.set(3/* id */, _181id0);
tym181r.set(7/* key */, _181id0);
tym181r.set(2/* num */, _181id0);
tym181r.set(6/* hex */, _181id0);
tym181r.set(6/* bin */, _181id0);
tym181r.set(6/* oct */, _181id0);
tym181r.set(1/* ws */, _181id0);
tym181r.set(0/* EOF */, _181id0);
tym181r.set(6/* sym */, _181id0);
tym181r.set(88, _181id0);
tym181r.set(4/* nl */, _181id0);
tym181r.set(5/* tok */, _181id0);
tym181r.set(6/* sci */, _181id0);
tym181r.set(6/* flt */, _181id0);
const idm168: Map<number, (L: Lexer) => void> = new Map();
idm168.set(19/* θ */, _168id0);
idm168.set(61/* g */, _168id0);
idm168.set(78/* _ */, _168id2);
idm168.set(79/* $ */, _168id2);
idm168.set(18/* τ */, _168id4);
idm168.set(62/* t */, _168id4);
idm168.set(63/* \ */, _168id6);
idm168.set(59/* assert */, _168id7);
idm168.set(60/* shift */, _168id7);
idm168.set(28/* ( */, _168id9);
const tym168: Map<number, (L: Lexer) => void> = new Map();
tym168.set(3/* id */, _168id2);
tym168.set(7/* key */, _168id2);
tym168.set(6/* sym */, _168ty2);
tym168.set(5/* tok */, _168ty3);
const idm177r: Map<number, (L: Lexer) => void> = new Map();
idm177r.set(30/* ) */, _177id0);
idm177r.set(58/* ? */, _177id0);
idm177r.set(16/* (+ */, _177id0);
idm177r.set(15/* (* */, _177id0);
idm177r.set(45/* ↦ */, _177id0);
idm177r.set(46/* f */, _177id0);
idm177r.set(28/* ( */, _177id0);
idm177r.set(19/* θ */, _177id0);
idm177r.set(61/* g */, _177id0);
idm177r.set(78/* _ */, _177id0);
idm177r.set(79/* $ */, _177id0);
idm177r.set(18/* τ */, _177id0);
idm177r.set(62/* t */, _177id0);
idm177r.set(63/* \ */, _177id0);
idm177r.set(59/* assert */, _177id0);
idm177r.set(60/* shift */, _177id0);
idm177r.set(22/* │ */, _177id0);
idm177r.set(23/* | */, _177id0);
idm177r.set(57/* # */, _177id0);
idm177r.set(12/* <> */, _177id0);
idm177r.set(13/* +> */, _177id0);
idm177r.set(27/* ] */, _177id0);
const tym177r: Map<number, (L: Lexer) => void> = new Map();
tym177r.set(0/* EOF */, _177id0);
tym177r.set(3/* id */, _177id0);
tym177r.set(7/* key */, _177id0);
tym177r.set(6/* sym */, _177id0);
tym177r.set(5/* tok */, _177id0);
const idm178r: Map<number, (L: Lexer) => void> = new Map();
idm178r.set(30/* ) */, _178id0);
idm178r.set(58/* ? */, _178id0);
idm178r.set(16/* (+ */, _178id0);
idm178r.set(15/* (* */, _178id0);
idm178r.set(45/* ↦ */, _178id0);
idm178r.set(46/* f */, _178id0);
idm178r.set(28/* ( */, _178id0);
idm178r.set(19/* θ */, _178id0);
idm178r.set(61/* g */, _178id0);
idm178r.set(78/* _ */, _178id0);
idm178r.set(79/* $ */, _178id0);
idm178r.set(18/* τ */, _178id0);
idm178r.set(62/* t */, _178id0);
idm178r.set(63/* \ */, _178id0);
idm178r.set(59/* assert */, _178id0);
idm178r.set(60/* shift */, _178id0);
idm178r.set(22/* │ */, _178id0);
idm178r.set(23/* | */, _178id0);
idm178r.set(57/* # */, _178id0);
idm178r.set(12/* <> */, _178id0);
idm178r.set(13/* +> */, _178id0);
idm178r.set(27/* ] */, _178id0);
const tym178r: Map<number, (L: Lexer) => void> = new Map();
tym178r.set(0/* EOF */, _178id0);
tym178r.set(3/* id */, _178id0);
tym178r.set(7/* key */, _178id0);
tym178r.set(6/* sym */, _178id0);
tym178r.set(5/* tok */, _178id0);
const idm260: Map<number, (L: Lexer) => void> = new Map();
idm260.set(45/* ↦ */, _260id0);
idm260.set(46/* f */, _260id0);
idm260.set(28/* ( */, _237id2);
idm260.set(19/* θ */, _233id0);
idm260.set(61/* g */, _233id0);
idm260.set(78/* _ */, _233id0);
idm260.set(79/* $ */, _233id0);
idm260.set(18/* τ */, _233id0);
idm260.set(62/* t */, _233id0);
idm260.set(63/* \ */, _233id0);
idm260.set(59/* assert */, _233id0);
idm260.set(60/* shift */, _233id0);
const idm260r: Map<number, (L: Lexer) => void> = new Map();
idm260r.set(45/* ↦ */, const_8_);
idm260r.set(46/* f */, const_8_);
idm260r.set(22/* │ */, const_8_);
idm260r.set(23/* | */, const_8_);
idm260r.set(57/* # */, const_8_);
idm260r.set(30/* ) */, const_8_);
idm260r.set(12/* <> */, const_8_);
idm260r.set(13/* +> */, const_8_);
const tym260r: Map<number, (L: Lexer) => void> = new Map();
tym260r.set(0/* EOF */, const_8_);
const idm258r: Map<number, (L: Lexer) => void> = new Map();
idm258r.set(22/* │ */, _258id0);
idm258r.set(23/* | */, _258id0);
idm258r.set(57/* # */, _258id0);
idm258r.set(30/* ) */, _258id0);
idm258r.set(12/* <> */, _258id0);
idm258r.set(13/* +> */, _258id0);
idm258r.set(45/* ↦ */, _258id0);
idm258r.set(46/* f */, _258id0);
const tym258r: Map<number, (L: Lexer) => void> = new Map();
tym258r.set(0/* EOF */, _258id0);
const idm308: Map<number, (L: Lexer) => void> = new Map();
idm308.set(22/* │ */, _352id0);
idm308.set(23/* | */, _352id0);
idm308.set(57/* # */, _3id2);
idm308.set(30/* ) */, _308id3);
const idm334r: Map<number, (L: Lexer) => void> = new Map();
idm334r.set(22/* │ */, _334id0);
idm334r.set(23/* | */, _334id0);
idm334r.set(57/* # */, _334id0);
idm334r.set(30/* ) */, _334id0);
idm334r.set(12/* <> */, _334id0);
idm334r.set(13/* +> */, _334id0);
idm334r.set(45/* ↦ */, _334id0);
idm334r.set(46/* f */, _334id0);
const tym334r: Map<number, (L: Lexer) => void> = new Map();
tym334r.set(0/* EOF */, _334id0);
const idm93r: Map<number, (L: Lexer) => void> = new Map();
idm93r.set(30/* ) */, _93id0);
idm93r.set(19/* θ */, _93id0);
idm93r.set(61/* g */, _93id0);
idm93r.set(18/* τ */, _93id0);
idm93r.set(62/* t */, _93id0);
idm93r.set(63/* \ */, _93id0);
idm93r.set(59/* assert */, _93id0);
idm93r.set(60/* shift */, _93id0);
const tym93r: Map<number, (L: Lexer) => void> = new Map();
tym93r.set(88, _93id0);
tym93r.set(0/* EOF */, _93id0);
const idm242r: Map<number, (L: Lexer) => void> = new Map();
idm242r.set(30/* ) */, _242id0);
idm242r.set(19/* θ */, _242id0);
idm242r.set(61/* g */, _242id0);
idm242r.set(18/* τ */, _242id0);
idm242r.set(62/* t */, _242id0);
idm242r.set(63/* \ */, _242id0);
idm242r.set(59/* assert */, _242id0);
idm242r.set(60/* shift */, _242id0);
const tym242r: Map<number, (L: Lexer) => void> = new Map();
tym242r.set(88, _242id0);
tym242r.set(0/* EOF */, _242id0);
function $hydrocarbon(l: Lexer): void {//Production Start
    /*
    hydrocarbon=>• head
    head=>• pre$preamble prd$productions
    head=>• prd$productions
    pre$preamble=>• pre$preamble pre$preamble_clause
    pre$preamble=>• pre$preamble_clause
    pre$preamble_clause=>• pre$ignore_preamble
    pre$preamble_clause=>• pre$symbols_preamble
    pre$preamble_clause=>• pre$precedence_preamble
    pre$preamble_clause=>• pre$name_preamble
    pre$preamble_clause=>• pre$ext_preamble
    pre$preamble_clause=>• pre$error_preamble
    pre$preamble_clause=>• pre$import_preamble
    pre$preamble_clause=>• cm$comment
    pre$ignore_preamble=>• @ τIGNORE sym$ignore_symbols θnl
    pre$symbols_preamble=>• @ τSYMBOL pre$symbols_preamble_HC_listbody2_101 θnl
    pre$precedence_preamble=>• @ τPREC sym$terminal_symbol θnum θnl
    pre$name_preamble=>• @ τNAME sym$identifier θnl
    pre$ext_preamble=>• @ τEXT sym$identifier θnl
    pre$error_preamble=>• @ τERROR sym$ignore_symbols θnl
    pre$import_preamble=>• @ τIMPORT pre$import_preamble_HC_listbody2_102 pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
    pre$import_preamble=>• @ τIMPORT pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
    cm$comment=>• cm$cm
    cm$cm=>• # cm$comment_data cm$comment_delimiter
    prd$productions=>• prd$production
    prd$productions=>• fn$referenced_function
    prd$productions=>• prd$productions prd$production
    prd$productions=>• prd$productions cm$comment
    prd$productions=>• prd$productions fn$referenced_function
    prd$productions=>•
    prd$production=>• <> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies prd$production_group_111_102
    prd$production=>• <> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies
    prd$production=>• +> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies
    prd$production=>• <> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies
    fn$referenced_function=>• fn$js_function_start_symbol sym$identifier ^ sym$js_identifier
    fn$referenced_function=>• fn$js_function_start_symbol sym$identifier { fn$js_data }
    fn$js_function_start_symbol=>• ↦
    fn$js_function_start_symbol=>• τf :
    */
    _skip(l, const__);
    //considered syms: @,#,END_OF_ITEM,<>,+>,↦,f

    //Single Production Completion

    //peek 0

    //block 0

    //groups false
    /*
    hydrocarbon=>• head
    */
    $head(l);
    if (!FAILED) {
        setProduction(0);
        add_reduce(1, 1);
        return;
    }
    fail(l);
}
function $head(l: Lexer): void {//Production Start
    /*
    head=>• pre$preamble prd$productions
    head=>• prd$productions
    pre$preamble=>• pre$preamble pre$preamble_clause
    pre$preamble=>• pre$preamble_clause
    pre$preamble_clause=>• pre$ignore_preamble
    pre$preamble_clause=>• pre$symbols_preamble
    pre$preamble_clause=>• pre$precedence_preamble
    pre$preamble_clause=>• pre$name_preamble
    pre$preamble_clause=>• pre$ext_preamble
    pre$preamble_clause=>• pre$error_preamble
    pre$preamble_clause=>• pre$import_preamble
    pre$preamble_clause=>• cm$comment
    pre$ignore_preamble=>• @ τIGNORE sym$ignore_symbols θnl
    pre$symbols_preamble=>• @ τSYMBOL pre$symbols_preamble_HC_listbody2_101 θnl
    pre$precedence_preamble=>• @ τPREC sym$terminal_symbol θnum θnl
    pre$name_preamble=>• @ τNAME sym$identifier θnl
    pre$ext_preamble=>• @ τEXT sym$identifier θnl
    pre$error_preamble=>• @ τERROR sym$ignore_symbols θnl
    pre$import_preamble=>• @ τIMPORT pre$import_preamble_HC_listbody2_102 pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
    pre$import_preamble=>• @ τIMPORT pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
    cm$comment=>• cm$cm
    cm$cm=>• # cm$comment_data cm$comment_delimiter
    prd$productions=>• prd$production
    prd$productions=>• fn$referenced_function
    prd$productions=>• prd$productions prd$production
    prd$productions=>• prd$productions cm$comment
    prd$productions=>• prd$productions fn$referenced_function
    prd$productions=>•
    prd$production=>• <> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies prd$production_group_111_102
    prd$production=>• <> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies
    prd$production=>• +> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies
    prd$production=>• <> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies
    fn$referenced_function=>• fn$js_function_start_symbol sym$identifier ^ sym$js_identifier
    fn$referenced_function=>• fn$js_function_start_symbol sym$identifier { fn$js_data }
    fn$js_function_start_symbol=>• ↦
    fn$js_function_start_symbol=>• τf :
    */
    _skip(l, const__);
    if (l.id == 47/* @ */ || l.id == 57/* # */) {
        //considered syms: @,#

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        head=>• pre$preamble prd$productions
        */
        $pre$preamble(l);
        if (!FAILED) {
            $prd$productions(l);
            if (!FAILED) {
                setProduction(1);
                add_reduce(2, 2);
                return;
            }
        }
    } else if (l.id == 12/* <> */ || l.id == 13/* +> */ || l.id == 45/* ↦ */ || l.id == 46/* f */) {
        //considered syms: END_OF_ITEM,<>,+>,↦,f

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        head=>• prd$productions
        */
        $prd$productions(l);
        if (!FAILED) {
            setProduction(1);
            add_reduce(1, 3);
            return;
        }
    }
    fail(l);
}

function $prd$production_group_08_100(l: Lexer): void {//Production Start
    /*
    prd$production_group_08_100=>• sym$production_id
    sym$production_id=>• sym$identifier
    sym$identifier=>• def$js_identifier
    def$js_identifier=>• def$js_id_symbols
    def$js_id_symbols=>• def$js_id_symbols θid
    def$js_id_symbols=>• def$js_id_symbols θkey
    def$js_id_symbols=>• def$js_id_symbols _
    def$js_id_symbols=>• def$js_id_symbols $
    def$js_id_symbols=>• def$js_id_symbols θnum
    def$js_id_symbols=>• def$js_id_symbols θhex
    def$js_id_symbols=>• def$js_id_symbols θbin
    def$js_id_symbols=>• def$js_id_symbols θoct
    def$js_id_symbols=>• _
    def$js_id_symbols=>• $
    def$js_id_symbols=>• θid
    def$js_id_symbols=>• θkey
    */
    _skip(l, const__);
    //considered syms: _,$,id,key

    //Single Production Completion

    //peek 0

    //block 0

    //groups false
    /*
    prd$production_group_08_100=>• sym$production_id
    */
    $sym$production_id(l);
    if (!FAILED) {
        setProduction(4);
        add_reduce(1, 8);
        return;
    }
    fail(l);
}
function $prd$production_group_010_101(l: Lexer): void {//Production Start
    /*
    prd$production_group_010_101=>• │
    prd$production_group_010_101=>• |
    */
    _skip(l, const__);
    if (l.id == 22/* │ */) {
        //considered syms: │

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        prd$production_group_010_101=>• │
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(5);

            return;
        }
    } else if (l.id == 23/* | */) {
        //considered syms: |

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        prd$production_group_010_101=>• |
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(5);

            return;
        }
    }
    fail(l);
}
function $prd$production_group_111_102(l: Lexer): void {//Production Start
    /*
    prd$production_group_111_102=>• prd$production_group_010_101 fn$error_function
    prd$production_group_010_101=>• │
    prd$production_group_010_101=>• |
    */
    _skip(l, const__);
    //considered syms: │,|

    //Single Production Completion

    //peek 0

    //block 0

    //groups false
    /*
    prd$production_group_111_102=>• prd$production_group_010_101 fn$error_function
    */
    $prd$production_group_010_101(l);
    if (!FAILED) {
        $fn$error_function(l);
        if (!FAILED) {
            setProduction(6);
            add_reduce(2, 0);
            return;
        }
    }
    fail(l);
}
function $prd$production_group_013_103(l: Lexer): void {//Production Start
    /*
    prd$production_group_013_103=>• sym$imported_production_symbol
    sym$imported_production_symbol=>• sym$production_id :: sym$identifier
    sym$production_id=>• sym$identifier
    sym$identifier=>• def$js_identifier
    def$js_identifier=>• def$js_id_symbols
    def$js_id_symbols=>• def$js_id_symbols θid
    def$js_id_symbols=>• def$js_id_symbols θkey
    def$js_id_symbols=>• def$js_id_symbols _
    def$js_id_symbols=>• def$js_id_symbols $
    def$js_id_symbols=>• def$js_id_symbols θnum
    def$js_id_symbols=>• def$js_id_symbols θhex
    def$js_id_symbols=>• def$js_id_symbols θbin
    def$js_id_symbols=>• def$js_id_symbols θoct
    def$js_id_symbols=>• _
    def$js_id_symbols=>• $
    def$js_id_symbols=>• θid
    def$js_id_symbols=>• θkey
    */
    _skip(l, const__);
    //considered syms: _,$,id,key

    //Single Production Completion

    //peek 0

    //block 0

    //groups false
    /*
    prd$production_group_013_103=>• sym$imported_production_symbol
    */
    $sym$imported_production_symbol(l);
    if (!FAILED) {
        setProduction(7);
        add_reduce(1, 8);
        return;
    }
    fail(l);
}

function $prd$production_start_symbol(l: Lexer): void {//Production Start
    /*
    prd$production_start_symbol=>• →
    prd$production_start_symbol=>• >
    */
    _skip(l, const__);
    if (l.id == 24/* → */) {
        //considered syms: →

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        prd$production_start_symbol=>• →
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(9);

            return;
        }
    } else if (l.id == 25/* > */) {
        //considered syms: >

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        prd$production_start_symbol=>• >
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(9);

            return;
        }
    }
    fail(l);
}
function $pb$production_bodies_group_04_100(l: Lexer): void {//Production Start
    /*
    pb$production_bodies_group_04_100=>• │
    pb$production_bodies_group_04_100=>• |
    */
    _skip(l, const__);
    if (l.id == 22/* │ */) {
        //considered syms: │

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        pb$production_bodies_group_04_100=>• │
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(11);

            return;
        }
    } else if (l.id == 23/* | */) {
        //considered syms: |

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        pb$production_bodies_group_04_100=>• |
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(11);

            return;
        }
    }
    fail(l);
}

function $pb$production_body(l: Lexer): void {//Production Start
    /*
    pb$production_body=>• pb$force_fork pb$entries
    pb$production_body=>• pb$entries
    pb$force_fork=>• ( τFORK )
    pb$entries=>• pb$body_entries fn$reduce_function
    pb$entries=>• sym$empty_symbol
    pb$entries=>• sym$EOF_symbol
    pb$entries=>• pb$body_entries
    pb$body_entries=>• sym$symbol
    pb$body_entries=>• pb$condition_clause
    pb$body_entries=>• fn$function_clause
    pb$body_entries=>• pb$body_entries fn$function_clause
    pb$body_entries=>• pb$body_entries pb$condition_clause
    pb$body_entries=>• pb$body_entries sym$symbol
    pb$body_entries=>• [ pb$body_entries ]
    sym$symbol=>• sym$generated_symbol
    sym$symbol=>• sym$production_symbol
    sym$symbol=>• sym$imported_production_symbol
    sym$symbol=>• sym$literal_symbol
    sym$symbol=>• sym$escaped_symbol
    sym$symbol=>• sym$assert_function_symbol
    sym$symbol=>• ( pb$production_bodies )
    sym$symbol=>• sym$symbol ?
    sym$symbol=>• sym$symbol sym$symbol_group_032_105 sym$terminal_symbol )
    sym$symbol=>• θsym
    sym$symbol=>• θtok
    sym$symbol=>• sym$symbol sym$symbol_group_032_105 )
    sym$generated_symbol=>• sym$generated_symbol_group_141_106 sym$identifier
    sym$generated_symbol_group_141_106=>• θ
    sym$generated_symbol_group_141_106=>• τg :
    sym$production_symbol=>• sym$identifier
    sym$identifier=>• def$js_identifier
    def$js_identifier=>• def$js_id_symbols
    def$js_id_symbols=>• def$js_id_symbols θid
    def$js_id_symbols=>• def$js_id_symbols θkey
    def$js_id_symbols=>• def$js_id_symbols _
    def$js_id_symbols=>• def$js_id_symbols $
    def$js_id_symbols=>• def$js_id_symbols θnum
    def$js_id_symbols=>• def$js_id_symbols θhex
    def$js_id_symbols=>• def$js_id_symbols θbin
    def$js_id_symbols=>• def$js_id_symbols θoct
    def$js_id_symbols=>• _
    def$js_id_symbols=>• $
    def$js_id_symbols=>• θid
    def$js_id_symbols=>• θkey
    sym$imported_production_symbol=>• sym$production_id :: sym$identifier
    sym$production_id=>• sym$identifier
    sym$literal_symbol=>• sym$literal_symbol_group_144_107 sym$literal_symbol_group_046_108
    sym$literal_symbol_group_144_107=>• τ
    sym$literal_symbol_group_144_107=>• τt :
    sym$escaped_symbol=>• \ sym$escaped_symbol_group_050_109
    sym$assert_function_symbol=>• τassert : sym$identifier
    sym$assert_function_symbol=>• τshift : sym$identifier
    pb$condition_clause=>• ( τEXC sym$condition_symbol_list )
    pb$condition_clause=>• ( τERR sym$condition_symbol_list )
    pb$condition_clause=>• ( τIGN sym$condition_symbol_list )
    pb$condition_clause=>• ( τRST sym$condition_symbol_list )
    pb$condition_clause=>• ( τRED sym$symbol )
    fn$function_clause=>• fn$js_function_start_symbol { fn$js_data }
    fn$function_clause=>• fn$js_function_start_symbol ^ sym$js_identifier
    fn$js_function_start_symbol=>• ↦
    fn$js_function_start_symbol=>• τf :
    sym$empty_symbol=>• ɛ
    sym$EOF_symbol=>• $eof
    */
    _skip(l, const__);
    if (l.id == 28/* ( */) {
        //considered syms: (

        //Look Ahead Level 1
        /*
        pb$production_body=>• pb$force_fork pb$entries
        pb$production_body=>• pb$entries
        */
        const pk1: Lexer = _pk(l.copy(), /* e.eh, */const__);
        /*pb$production_body=>• pb$force_fork pb$entries peek 1 state: 
        pb$force_fork=>( • τFORK )*/

        /*pb$production_body=>• pb$entries peek 1 state: 
        sym$generated_symbol_group_141_106=>τg • :
        def$js_id_symbols=>• _
        def$js_id_symbols=>• $
        def$js_id_symbols=>• θid
        def$js_id_symbols=>• θkey
        sym$imported_production_symbol=>sym$production_id • :: sym$identifier
        sym$literal_symbol_group_144_107=>τt • :
        def$natural=>• θnum
        sym$escaped_symbol_group_050_109=>• θid
        sym$escaped_symbol_group_050_109=>• θtok
        sym$escaped_symbol_group_050_109=>• θsym
        sym$assert_function_symbol=>τassert • : sym$identifier
        sym$assert_function_symbol=>τshift • : sym$identifier
        pb$force_fork=>• ( τFORK )
        pb$body_entries=>• [ pb$body_entries ]
        sym$symbol=>• ( pb$production_bodies )
        sym$symbol=>• θsym
        sym$symbol=>• θtok
        sym$generated_symbol_group_141_106=>• θ
        sym$generated_symbol_group_141_106=>• τg :
        sym$literal_symbol_group_144_107=>• τ
        sym$literal_symbol_group_144_107=>• τt :
        sym$escaped_symbol=>• \ sym$escaped_symbol_group_050_109
        sym$assert_function_symbol=>• τassert : sym$identifier
        sym$assert_function_symbol=>• τshift : sym$identifier
        pb$condition_clause=>• ( τEXC sym$condition_symbol_list )
        pb$condition_clause=>• ( τERR sym$condition_symbol_list )
        pb$condition_clause=>• ( τIGN sym$condition_symbol_list )
        pb$condition_clause=>• ( τRST sym$condition_symbol_list )
        pb$condition_clause=>• ( τRED sym$symbol )
        fn$js_function_start_symbol=>• ↦
        fn$js_function_start_symbol=>• τf :
        sym$empty_symbol=>• ɛ
        sym$EOF_symbol=>• $eof
        pb$condition_clause=>( • τEXC sym$condition_symbol_list )
        pb$condition_clause=>( • τERR sym$condition_symbol_list )
        pb$condition_clause=>( • τIGN sym$condition_symbol_list )
        pb$condition_clause=>( • τRST sym$condition_symbol_list )
        pb$condition_clause=>( • τRED sym$symbol )
        fn$js_function_start_symbol=>τf • :
        fn$function_clause=>fn$js_function_start_symbol • { fn$js_data }*/

        /*pb$production_body=>• pb$entries peek 1 state: 
        pb$production_body=>• pb$entries
        pb$entries=>• pb$body_entries fn$reduce_function
        pb$entries=>• sym$empty_symbol
        pb$entries=>• sym$EOF_symbol
        pb$entries=>• pb$body_entries
        pb$body_entries=>• sym$symbol
        pb$body_entries=>• pb$condition_clause
        pb$body_entries=>• fn$function_clause
        pb$body_entries=>• pb$body_entries fn$function_clause
        pb$body_entries=>• pb$body_entries pb$condition_clause
        pb$body_entries=>• pb$body_entries sym$symbol
        pb$body_entries=>• [ pb$body_entries ]
        sym$symbol=>• sym$generated_symbol
        sym$symbol=>• sym$production_symbol
        sym$symbol=>• sym$imported_production_symbol
        sym$symbol=>• sym$literal_symbol
        sym$symbol=>• sym$escaped_symbol
        sym$symbol=>• sym$assert_function_symbol
        sym$symbol=>• ( pb$production_bodies )
        sym$symbol=>• sym$symbol ?
        sym$symbol=>• sym$symbol sym$symbol_group_032_105 sym$terminal_symbol )
        sym$symbol=>• θsym
        sym$symbol=>• θtok
        sym$symbol=>• sym$symbol sym$symbol_group_032_105 )
        sym$generated_symbol=>• sym$generated_symbol_group_141_106 sym$identifier
        sym$generated_symbol_group_141_106=>• θ
        sym$generated_symbol_group_141_106=>• τg :
        sym$production_symbol=>• sym$identifier
        sym$identifier=>• def$js_identifier
        def$js_identifier=>• def$js_id_symbols
        def$js_id_symbols=>• def$js_id_symbols θid
        def$js_id_symbols=>• def$js_id_symbols θkey
        def$js_id_symbols=>• def$js_id_symbols _
        def$js_id_symbols=>• def$js_id_symbols $
        def$js_id_symbols=>• def$js_id_symbols θnum
        def$js_id_symbols=>• def$js_id_symbols θhex
        def$js_id_symbols=>• def$js_id_symbols θbin
        def$js_id_symbols=>• def$js_id_symbols θoct
        def$js_id_symbols=>• _
        def$js_id_symbols=>• $
        def$js_id_symbols=>• θid
        def$js_id_symbols=>• θkey
        sym$imported_production_symbol=>• sym$production_id :: sym$identifier
        sym$production_id=>• sym$identifier
        sym$literal_symbol=>• sym$literal_symbol_group_144_107 sym$literal_symbol_group_046_108
        sym$literal_symbol_group_144_107=>• τ
        sym$literal_symbol_group_144_107=>• τt :
        sym$escaped_symbol=>• \ sym$escaped_symbol_group_050_109
        sym$assert_function_symbol=>• τassert : sym$identifier
        sym$assert_function_symbol=>• τshift : sym$identifier
        pb$condition_clause=>• ( τEXC sym$condition_symbol_list )
        pb$condition_clause=>• ( τERR sym$condition_symbol_list )
        pb$condition_clause=>• ( τIGN sym$condition_symbol_list )
        pb$condition_clause=>• ( τRST sym$condition_symbol_list )
        pb$condition_clause=>• ( τRED sym$symbol )
        fn$function_clause=>• fn$js_function_start_symbol { fn$js_data }
        fn$function_clause=>• fn$js_function_start_symbol ^ sym$js_identifier
        fn$js_function_start_symbol=>• ↦
        fn$js_function_start_symbol=>• τf :
        sym$empty_symbol=>• ɛ
        sym$EOF_symbol=>• $eof*/

        if (!FAILED && pk1.id == 29/* FORK */) {
            //considered syms: FORK

            //Single Production Completion

            //peek 1

            //block 3

            //groups true
            /*
            pb$production_body=>• pb$force_fork pb$entries
            */
            $pb$force_fork(l);
            if (!FAILED) {
                $pb$entries(l);
                if (!FAILED) {
                    setProduction(13);
                    add_reduce(2, 15);
                    return;
                }
            }
        } else if (!FAILED && const_3_.includes(pk1.id) || pk1.ty == 2/* num */ || pk1.ty == 3/* id */ || pk1.ty == 5/* tok */ || pk1.ty == 6/* sym */ || pk1.ty == 7/* key */) {
            //considered syms: :,_,$,id,key,::,num,tok,sym,(,[,θ,g,τ,t,\,assert,shift,↦,f,ɛ,$eof,EXC,ERR,IGN,RST,RED,{

            //Single Production Completion

            //peek 1

            //block 3

            //groups true
            /*
            pb$production_body=>• pb$entries
            */
            $pb$entries(l);
            if (!FAILED) {
                setProduction(13);
                add_reduce(1, 16);
                return;
            }
        }
    } else if (const_4_.includes(l.id) || l.ty == 3/* id */ || l.ty == 5/* tok */ || l.ty == 6/* sym */ || l.ty == 7/* key */) {
        //considered syms: [,sym,tok,θ,g,_,$,id,key,τ,t,\,assert,shift,↦,f,ɛ,$eof

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        pb$production_body=>• pb$entries
        */
        $pb$entries(l);
        if (!FAILED) {
            setProduction(13);
            add_reduce(1, 16);
            return;
        }
    }
    fail(l);
}
function $pb$entries(l: Lexer): void {//Production Start
    /*
    pb$entries=>• pb$body_entries fn$reduce_function
    pb$entries=>• sym$empty_symbol
    pb$entries=>• sym$EOF_symbol
    pb$entries=>• pb$body_entries
    pb$body_entries=>• sym$symbol
    pb$body_entries=>• pb$condition_clause
    pb$body_entries=>• fn$function_clause
    pb$body_entries=>• pb$body_entries fn$function_clause
    pb$body_entries=>• pb$body_entries pb$condition_clause
    pb$body_entries=>• pb$body_entries sym$symbol
    pb$body_entries=>• [ pb$body_entries ]
    sym$symbol=>• sym$generated_symbol
    sym$symbol=>• sym$production_symbol
    sym$symbol=>• sym$imported_production_symbol
    sym$symbol=>• sym$literal_symbol
    sym$symbol=>• sym$escaped_symbol
    sym$symbol=>• sym$assert_function_symbol
    sym$symbol=>• ( pb$production_bodies )
    sym$symbol=>• sym$symbol ?
    sym$symbol=>• sym$symbol sym$symbol_group_032_105 sym$terminal_symbol )
    sym$symbol=>• θsym
    sym$symbol=>• θtok
    sym$symbol=>• sym$symbol sym$symbol_group_032_105 )
    sym$generated_symbol=>• sym$generated_symbol_group_141_106 sym$identifier
    sym$generated_symbol_group_141_106=>• θ
    sym$generated_symbol_group_141_106=>• τg :
    sym$production_symbol=>• sym$identifier
    sym$identifier=>• def$js_identifier
    def$js_identifier=>• def$js_id_symbols
    def$js_id_symbols=>• def$js_id_symbols θid
    def$js_id_symbols=>• def$js_id_symbols θkey
    def$js_id_symbols=>• def$js_id_symbols _
    def$js_id_symbols=>• def$js_id_symbols $
    def$js_id_symbols=>• def$js_id_symbols θnum
    def$js_id_symbols=>• def$js_id_symbols θhex
    def$js_id_symbols=>• def$js_id_symbols θbin
    def$js_id_symbols=>• def$js_id_symbols θoct
    def$js_id_symbols=>• _
    def$js_id_symbols=>• $
    def$js_id_symbols=>• θid
    def$js_id_symbols=>• θkey
    sym$imported_production_symbol=>• sym$production_id :: sym$identifier
    sym$production_id=>• sym$identifier
    sym$literal_symbol=>• sym$literal_symbol_group_144_107 sym$literal_symbol_group_046_108
    sym$literal_symbol_group_144_107=>• τ
    sym$literal_symbol_group_144_107=>• τt :
    sym$escaped_symbol=>• \ sym$escaped_symbol_group_050_109
    sym$assert_function_symbol=>• τassert : sym$identifier
    sym$assert_function_symbol=>• τshift : sym$identifier
    pb$condition_clause=>• ( τEXC sym$condition_symbol_list )
    pb$condition_clause=>• ( τERR sym$condition_symbol_list )
    pb$condition_clause=>• ( τIGN sym$condition_symbol_list )
    pb$condition_clause=>• ( τRST sym$condition_symbol_list )
    pb$condition_clause=>• ( τRED sym$symbol )
    fn$function_clause=>• fn$js_function_start_symbol { fn$js_data }
    fn$function_clause=>• fn$js_function_start_symbol ^ sym$js_identifier
    fn$js_function_start_symbol=>• ↦
    fn$js_function_start_symbol=>• τf :
    sym$empty_symbol=>• ɛ
    sym$EOF_symbol=>• $eof
    */
    _skip(l, const__);
    if (const_0_.includes(l.id) || l.ty == 3/* id */ || l.ty == 5/* tok */ || l.ty == 6/* sym */ || l.ty == 7/* key */) {
        //considered syms: [,(,sym,tok,θ,g,_,$,id,key,τ,t,\,assert,shift,↦,f

        //Parallel Transition
        /*
        pb$entries=>• pb$body_entries fn$reduce_function
        pb$entries=>• pb$body_entries
        */
        $pb$body_entries(l);

        //Look Ahead Level 0
        /*
        pb$entries=>pb$body_entries • fn$reduce_function
        */
        _skip(l, const__);
        if (l.id == 45/* ↦ */ || l.id == 46/* f */) {
            //considered syms: ↦,f

            //Single Production Completion

            //peek 0

            //block 3

            //groups true
            /*
            pb$entries=>pb$body_entries • fn$reduce_function
            */
            $fn$reduce_function(l);
            if (!FAILED) {
                setProduction(14);
                add_reduce(2, 17);
                return;
            }
        } else {
            //considered syms: END_OF_ITEM

            //Single Production Completion

            //peek 0

            //block 3

            //groups true
            /*
            pb$entries=>pb$body_entries •
            */
            if (!FAILED) {
                setProduction(14);
                add_reduce(1, 20);
                return;
            }
        }
    } else if (l.id == 20/* ɛ */) {
        //considered syms: ɛ

        //Single Production Completion

        //peek -1

        //block 1

        //groups true
        /*
        pb$entries=>• sym$empty_symbol
        */
        $sym$empty_symbol(l);
        if (!FAILED) {
            setProduction(14);
            add_reduce(1, 18);
            return;
        }
    } else if (l.id == 21/* $eof */) {
        //considered syms: $eof

        //Single Production Completion

        //peek -1

        //block 1

        //groups true
        /*
        pb$entries=>• sym$EOF_symbol
        */
        $sym$EOF_symbol(l);
        if (!FAILED) {
            setProduction(14);
            add_reduce(1, 19);
            return;
        }
    }
    fail(l);
}

function $pb$force_fork(l: Lexer): void {//Production Start
    /*
    pb$force_fork=>• ( τFORK )
    */
    _skip(l, const__);
    //considered syms: (

    //Single Production Completion

    //peek 0

    //block 0

    //groups false
    /*
    pb$force_fork=>• ( τFORK )
    */
    _with_skip(l, const__, 28/* ( */);
    if (!FAILED) {
        _with_skip(l, const__, 29/* FORK */);
        if (!FAILED) {
            _with_skip(l, const__, 30/* ) */);
            if (!FAILED) {
                setProduction(16);
                add_reduce(3, 24);
                return;
            }
        }
    }
    fail(l);
}
function $pb$condition_clause(l: Lexer): void {//Production Start
    /*
    pb$condition_clause=>• ( τEXC sym$condition_symbol_list )
    pb$condition_clause=>• ( τERR sym$condition_symbol_list )
    pb$condition_clause=>• ( τIGN sym$condition_symbol_list )
    pb$condition_clause=>• ( τRST sym$condition_symbol_list )
    pb$condition_clause=>• ( τRED sym$symbol )
    */
    _skip(l, const__);
    //considered syms: (

    //Parallel Transition
    /*
    pb$condition_clause=>• ( τEXC sym$condition_symbol_list )
    pb$condition_clause=>• ( τERR sym$condition_symbol_list )
    pb$condition_clause=>• ( τIGN sym$condition_symbol_list )
    pb$condition_clause=>• ( τRST sym$condition_symbol_list )
    pb$condition_clause=>• ( τRED sym$symbol )
    */
    _no_check(l);

    //Look Ahead Level 0
    /*
    
    */
    _skip(l, const__);
    if (l.id == 31/* EXC */) {
        //considered syms: EXC

        //Single Production Completion

        //peek 0

        //block 2

        //groups true
        /*
        pb$condition_clause=>( • τEXC sym$condition_symbol_list )
        */
        _no_check(l);
        if (!FAILED) {
            $sym$condition_symbol_list(l);
            if (!FAILED) {
                _with_skip(l, const__, 30/* ) */);
                if (!FAILED) {
                    setProduction(17);
                    add_reduce(4, 25);
                    return;
                }
            }
        }
    } else if (l.id == 32/* ERR */) {
        //considered syms: ERR

        //Single Production Completion

        //peek 0

        //block 2

        //groups true
        /*
        pb$condition_clause=>( • τERR sym$condition_symbol_list )
        */
        _no_check(l);
        if (!FAILED) {
            $sym$condition_symbol_list(l);
            if (!FAILED) {
                _with_skip(l, const__, 30/* ) */);
                if (!FAILED) {
                    setProduction(17);
                    add_reduce(4, 26);
                    return;
                }
            }
        }
    } else if (l.id == 33/* IGN */) {
        //considered syms: IGN

        //Single Production Completion

        //peek 0

        //block 2

        //groups true
        /*
        pb$condition_clause=>( • τIGN sym$condition_symbol_list )
        */
        _no_check(l);
        if (!FAILED) {
            $sym$condition_symbol_list(l);
            if (!FAILED) {
                _with_skip(l, const__, 30/* ) */);
                if (!FAILED) {
                    setProduction(17);
                    add_reduce(4, 27);
                    return;
                }
            }
        }
    } else if (l.id == 34/* RST */) {
        //considered syms: RST

        //Single Production Completion

        //peek 0

        //block 2

        //groups true
        /*
        pb$condition_clause=>( • τRST sym$condition_symbol_list )
        */
        _no_check(l);
        if (!FAILED) {
            $sym$condition_symbol_list(l);
            if (!FAILED) {
                _with_skip(l, const__, 30/* ) */);
                if (!FAILED) {
                    setProduction(17);
                    add_reduce(4, 28);
                    return;
                }
            }
        }
    } else if (l.id == 35/* RED */) {
        //considered syms: RED

        //Single Production Completion

        //peek 0

        //block 2

        //groups true
        /*
        pb$condition_clause=>( • τRED sym$symbol )
        */
        _no_check(l);
        if (!FAILED) {
            $sym$symbol(l);
            if (!FAILED) {
                _with_skip(l, const__, 30/* ) */);
                if (!FAILED) {
                    setProduction(17);
                    add_reduce(4, 29);
                    return;
                }
            }
        }
    }
    fail(l);
}
function $fn$referenced_function(l: Lexer): void {//Production Start
    /*
    fn$referenced_function=>• fn$js_function_start_symbol sym$identifier ^ sym$js_identifier
    fn$referenced_function=>• fn$js_function_start_symbol sym$identifier { fn$js_data }
    fn$js_function_start_symbol=>• ↦
    fn$js_function_start_symbol=>• τf :
    */
    _skip(l, const__);
    //considered syms: ↦,f

    //Parallel Transition
    /*
    fn$referenced_function=>• fn$js_function_start_symbol sym$identifier ^ sym$js_identifier
    fn$referenced_function=>• fn$js_function_start_symbol sym$identifier { fn$js_data }
    */
    $fn$js_function_start_symbol(l);

    //Parallel Transition
    /*
    fn$referenced_function=>fn$js_function_start_symbol • sym$identifier ^ sym$js_identifier
    fn$referenced_function=>fn$js_function_start_symbol • sym$identifier { fn$js_data }
    */
    $sym$identifier(l);

    //Look Ahead Level 0
    /*
    
    */
    _skip(l, const__);
    if (l.id == 36/* ^ */) {
        //considered syms: ^

        //Single Production Completion

        //peek 0

        //block 2

        //groups true
        /*
        fn$referenced_function=>fn$js_function_start_symbol sym$identifier • ^ sym$js_identifier
        */
        _no_check(l);
        if (!FAILED) {
            $sym$js_identifier(l);
            if (!FAILED) {
                setProduction(18);
                add_reduce(4, 30);
                return;
            }
        }
    } else if (l.id == 37/* { */) {
        //considered syms: {

        //Single Production Completion

        //peek 0

        //block 2

        //groups true
        /*
        fn$referenced_function=>fn$js_function_start_symbol sym$identifier • { fn$js_data }
        */
        _no_check(l);
        if (!FAILED) {
            $fn$js_data(l);
            if (!FAILED) {
                _with_skip(l, const__, 38/* } */);
                if (!FAILED) {
                    setProduction(18);
                    add_reduce(5, 31);
                    return;
                }
            }
        }
    }
    fail(l);
}
function $fn$error_function(l: Lexer): void {//Production Start
    /*
    fn$error_function=>• τerh : { fn$js_data } { fn$js_data }
    */
    _skip(l, const__);
    //considered syms: erh

    //Single Production Completion

    //peek 0

    //block 0

    //groups false
    /*
    fn$error_function=>• τerh : { fn$js_data } { fn$js_data }
    */
    _with_skip(l, const__, 39/* erh */);
    if (!FAILED) {
        _with_skip(l, const__, 40/* : */);
        if (!FAILED) {
            _with_skip(l, const_1_, 37/* { */);
            if (!FAILED) {
                $fn$js_data(l);
                if (!FAILED) {
                    _with_skip(l, const__, 38/* } */);
                    if (!FAILED) {
                        _with_skip(l, const_1_, 37/* { */);
                        if (!FAILED) {
                            $fn$js_data(l);
                            if (!FAILED) {
                                _with_skip(l, const__, 38/* } */);
                                if (!FAILED) {
                                    setProduction(19);
                                    add_reduce(8, 32);
                                    return;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    fail(l);
}
function $fn$reduce_function_group_07_100(l: Lexer): void {//Production Start
    /*
    fn$reduce_function_group_07_100=>• τcstr
    fn$reduce_function_group_07_100=>• τc
    fn$reduce_function_group_07_100=>• τreturn
    fn$reduce_function_group_07_100=>• τr
    */
    _skip(l, const__);
    if (l.id == 41/* cstr */) {
        //considered syms: cstr

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        fn$reduce_function_group_07_100=>• τcstr
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(20);

            return;
        }
    } else if (l.id == 42/* c */) {
        //considered syms: c

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        fn$reduce_function_group_07_100=>• τc
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(20);

            return;
        }
    } else if (l.id == 43/* return */) {
        //considered syms: return

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        fn$reduce_function_group_07_100=>• τreturn
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(20);

            return;
        }
    } else if (l.id == 44/* r */) {
        //considered syms: r

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        fn$reduce_function_group_07_100=>• τr
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(20);

            return;
        }
    }
    fail(l);
}
function $fn$reduce_function(l: Lexer): void {//Production Start
    /*
    fn$reduce_function=>• fn$js_function_start_symbol fn$reduce_function_group_07_100 { fn$js_data }
    fn$reduce_function=>• fn$js_function_start_symbol fn$reduce_function_group_07_100 ^ sym$js_identifier
    fn$reduce_function=>• fn$js_function_start_symbol fn$reduce_function_group_07_100 => sym$js_identifier
    fn$js_function_start_symbol=>• ↦
    fn$js_function_start_symbol=>• τf :
    */
    _skip(l, const__);
    //considered syms: ↦,f

    //Parallel Transition
    /*
    fn$reduce_function=>• fn$js_function_start_symbol fn$reduce_function_group_07_100 { fn$js_data }
    fn$reduce_function=>• fn$js_function_start_symbol fn$reduce_function_group_07_100 ^ sym$js_identifier
    fn$reduce_function=>• fn$js_function_start_symbol fn$reduce_function_group_07_100 => sym$js_identifier
    */
    $fn$js_function_start_symbol(l);

    //Parallel Transition
    /*
    fn$reduce_function=>fn$js_function_start_symbol • fn$reduce_function_group_07_100 { fn$js_data }
    fn$reduce_function=>fn$js_function_start_symbol • fn$reduce_function_group_07_100 ^ sym$js_identifier
    fn$reduce_function=>fn$js_function_start_symbol • fn$reduce_function_group_07_100 => sym$js_identifier
    */
    $fn$reduce_function_group_07_100(l);

    //Look Ahead Level 0
    /*
    
    */
    _skip(l, const__);
    if (l.id == 37/* { */) {
        //considered syms: {

        //Single Production Completion

        //peek 0

        //block 2

        //groups true
        /*
        fn$reduce_function=>fn$js_function_start_symbol fn$reduce_function_group_07_100 • { fn$js_data }
        */
        _no_check(l);
        if (!FAILED) {
            $fn$js_data(l);
            if (!FAILED) {
                _with_skip(l, const__, 38/* } */);
                if (!FAILED) {
                    setProduction(21);
                    add_reduce(5, 33);
                    return;
                }
            }
        }
    } else if (l.id == 36/* ^ */) {
        //considered syms: ^

        //Single Production Completion

        //peek 0

        //block 2

        //groups true
        /*
        fn$reduce_function=>fn$js_function_start_symbol fn$reduce_function_group_07_100 • ^ sym$js_identifier
        */
        _no_check(l);
        if (!FAILED) {
            $sym$js_identifier(l);
            if (!FAILED) {
                setProduction(21);
                add_reduce(4, 34);
                return;
            }
        }
    } else if (l.id == 14/* => */) {
        //considered syms: =>

        //Single Production Completion

        //peek 0

        //block 2

        //groups true
        /*
        fn$reduce_function=>fn$js_function_start_symbol fn$reduce_function_group_07_100 • => sym$js_identifier
        */
        _no_check(l);
        if (!FAILED) {
            $sym$js_identifier(l);
            if (!FAILED) {
                setProduction(21);
                add_reduce(4, 35);
                return;
            }
        }
    }
    fail(l);
}
function $fn$function_clause(l: Lexer): void {//Production Start
    /*
    fn$function_clause=>• fn$js_function_start_symbol { fn$js_data }
    fn$function_clause=>• fn$js_function_start_symbol ^ sym$js_identifier
    fn$js_function_start_symbol=>• ↦
    fn$js_function_start_symbol=>• τf :
    */
    _skip(l, const__);
    //considered syms: ↦,f

    //Parallel Transition
    /*
    fn$function_clause=>• fn$js_function_start_symbol { fn$js_data }
    fn$function_clause=>• fn$js_function_start_symbol ^ sym$js_identifier
    */
    $fn$js_function_start_symbol(l);

    //Look Ahead Level 0
    /*
    
    */
    _skip(l, const__);
    if (l.id == 37/* { */) {
        //considered syms: {

        //Single Production Completion

        //peek 0

        //block 2

        //groups true
        /*
        fn$function_clause=>fn$js_function_start_symbol • { fn$js_data }
        */
        _no_check(l);
        if (!FAILED) {
            $fn$js_data(l);
            if (!FAILED) {
                _with_skip(l, const__, 38/* } */);
                if (!FAILED) {
                    setProduction(22);
                    add_reduce(4, 36);
                    return;
                }
            }
        }
    } else if (l.id == 36/* ^ */) {
        //considered syms: ^

        //Single Production Completion

        //peek 0

        //block 2

        //groups true
        /*
        fn$function_clause=>fn$js_function_start_symbol • ^ sym$js_identifier
        */
        _no_check(l);
        if (!FAILED) {
            $sym$js_identifier(l);
            if (!FAILED) {
                setProduction(22);
                add_reduce(3, 37);
                return;
            }
        }
    }
    fail(l);
}

function $fn$js_primitive_group_033_101(l: Lexer): void {//Production Start
    /*
    fn$js_primitive_group_033_101=>• sym$terminal_symbol
    fn$js_primitive_group_033_101=>• sym$EOF_symbol
    sym$terminal_symbol=>• sym$generated_symbol
    sym$terminal_symbol=>• sym$literal_symbol
    sym$terminal_symbol=>• sym$escaped_symbol
    sym$terminal_symbol=>• sym$assert_function_symbol
    sym$terminal_symbol=>• θany
    sym$generated_symbol=>• sym$generated_symbol_group_141_106 sym$identifier
    sym$generated_symbol_group_141_106=>• θ
    sym$generated_symbol_group_141_106=>• τg :
    sym$literal_symbol=>• sym$literal_symbol_group_144_107 sym$literal_symbol_group_046_108
    sym$literal_symbol_group_144_107=>• τ
    sym$literal_symbol_group_144_107=>• τt :
    sym$escaped_symbol=>• \ sym$escaped_symbol_group_050_109
    sym$assert_function_symbol=>• τassert : sym$identifier
    sym$assert_function_symbol=>• τshift : sym$identifier
    sym$EOF_symbol=>• $eof
    */
    _skip(l, const__);
    if (!(false)) {
        //considered syms: any,θ,g,τ,t,\,assert,shift

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        fn$js_primitive_group_033_101=>• sym$terminal_symbol
        */
        $sym$terminal_symbol(l);
        if (!FAILED) {
            setProduction(24);

            return;
        }
    } else if (l.id == 21/* $eof */) {
        //considered syms: $eof

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        fn$js_primitive_group_033_101=>• sym$EOF_symbol
        */
        $sym$EOF_symbol(l);
        if (!FAILED) {
            setProduction(24);

            return;
        }
    }
    fail(l);
}
function $fn$js_primitive(l: Lexer): void {//Production Start
    /*
    fn$js_primitive=>• θid
    fn$js_primitive=>• θnum
    fn$js_primitive=>• θws
    fn$js_primitive=>• θsym
    fn$js_primitive=>• θtok
    fn$js_primitive=>• θkey
    fn$js_primitive=>• fn$js_primitive_group_033_101
    fn$js_primitive_group_033_101=>• sym$terminal_symbol
    fn$js_primitive_group_033_101=>• sym$EOF_symbol
    sym$terminal_symbol=>• sym$generated_symbol
    sym$terminal_symbol=>• sym$literal_symbol
    sym$terminal_symbol=>• sym$escaped_symbol
    sym$terminal_symbol=>• sym$assert_function_symbol
    sym$terminal_symbol=>• θany
    sym$generated_symbol=>• sym$generated_symbol_group_141_106 sym$identifier
    sym$generated_symbol_group_141_106=>• θ
    sym$generated_symbol_group_141_106=>• τg :
    sym$literal_symbol=>• sym$literal_symbol_group_144_107 sym$literal_symbol_group_046_108
    sym$literal_symbol_group_144_107=>• τ
    sym$literal_symbol_group_144_107=>• τt :
    sym$escaped_symbol=>• \ sym$escaped_symbol_group_050_109
    sym$assert_function_symbol=>• τassert : sym$identifier
    sym$assert_function_symbol=>• τshift : sym$identifier
    sym$EOF_symbol=>• $eof
    */
    _skip(l, const_1_);
    if (l.ty == 3/* id */) {
        //considered syms: id

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        fn$js_primitive=>• θid
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(25);

            return;
        }
    } else if (l.ty == 2/* num */) {
        //considered syms: num

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        fn$js_primitive=>• θnum
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(25);

            return;
        }
    } else if (l.ty == 1/* ws */) {
        //considered syms: ws

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        fn$js_primitive=>• θws
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(25);

            return;
        }
    } else if (l.ty == 6/* sym */) {
        //considered syms: sym

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        fn$js_primitive=>• θsym
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(25);

            return;
        }
    } else if (l.ty == 5/* tok */) {
        //considered syms: tok

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        fn$js_primitive=>• θtok
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(25);

            return;
        }
    } else if (l.ty == 7/* key */) {
        //considered syms: key

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        fn$js_primitive=>• θkey
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(25);

            return;
        }
    } else if (!(false)) {
        //considered syms: any,θ,g,τ,t,\,assert,shift,$eof

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        fn$js_primitive=>• fn$js_primitive_group_033_101
        */
        $fn$js_primitive_group_033_101(l);
        if (!FAILED) {
            setProduction(25);
            add_reduce(1, 39);
            return;
        }
    }
    fail(l);
}
function $fn$js_data_block(l: Lexer): void {//Production Start
    /*
    fn$js_data_block=>• { fn$js_data }
    */
    _skip(l, const__);
    //considered syms: {

    //Single Production Completion

    //peek 0

    //block 0

    //groups false
    /*
    fn$js_data_block=>• { fn$js_data }
    */
    _with_skip(l, const_1_, 37/* { */);
    if (!FAILED) {
        $fn$js_data(l);
        if (!FAILED) {
            _with_skip(l, const_1_, 38/* } */);
            if (!FAILED) {
                setProduction(26);
                add_reduce(3, 40);
                return;
            }
        }
    }
    fail(l);
}
function $fn$js_function_start_symbol(l: Lexer): void {//Production Start
    /*
    fn$js_function_start_symbol=>• ↦
    fn$js_function_start_symbol=>• τf :
    */
    _skip(l, const__);
    if (l.id == 45/* ↦ */) {
        //considered syms: ↦

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        fn$js_function_start_symbol=>• ↦
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(27);

            return;
        }
    } else if (l.id == 46/* f */) {
        //considered syms: f

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        fn$js_function_start_symbol=>• τf :
        */
        _no_check(l);
        if (!FAILED) {
            _with_skip(l, const__, 40/* : */);
            if (!FAILED) {
                setProduction(27);
                add_reduce(2, 0);
                return;
            }
        }
    }
    fail(l);
}

function $pre$preamble_clause(l: Lexer): void {//Production Start
    /*
    pre$preamble_clause=>• pre$ignore_preamble
    pre$preamble_clause=>• pre$symbols_preamble
    pre$preamble_clause=>• pre$precedence_preamble
    pre$preamble_clause=>• pre$name_preamble
    pre$preamble_clause=>• pre$ext_preamble
    pre$preamble_clause=>• pre$error_preamble
    pre$preamble_clause=>• pre$import_preamble
    pre$preamble_clause=>• cm$comment
    pre$ignore_preamble=>• @ τIGNORE sym$ignore_symbols θnl
    pre$symbols_preamble=>• @ τSYMBOL pre$symbols_preamble_HC_listbody2_101 θnl
    pre$precedence_preamble=>• @ τPREC sym$terminal_symbol θnum θnl
    pre$name_preamble=>• @ τNAME sym$identifier θnl
    pre$ext_preamble=>• @ τEXT sym$identifier θnl
    pre$error_preamble=>• @ τERROR sym$ignore_symbols θnl
    pre$import_preamble=>• @ τIMPORT pre$import_preamble_HC_listbody2_102 pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
    pre$import_preamble=>• @ τIMPORT pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
    cm$comment=>• cm$cm
    cm$cm=>• # cm$comment_data cm$comment_delimiter
    */
    _skip(l, const__);
    if (l.id == 47/* @ */) {
        //considered syms: @

        //Look Ahead Level 1
        /*
        pre$preamble_clause=>• pre$ignore_preamble
        pre$preamble_clause=>• pre$symbols_preamble
        pre$preamble_clause=>• pre$precedence_preamble
        pre$preamble_clause=>• pre$name_preamble
        pre$preamble_clause=>• pre$ext_preamble
        pre$preamble_clause=>• pre$error_preamble
        pre$preamble_clause=>• pre$import_preamble
        */
        const pk1: Lexer = _pk(l.copy(), /* e.eh, */const__);
        /*pre$preamble_clause=>• pre$ignore_preamble peek 1 state: 
        pre$ignore_preamble=>@ • τIGNORE sym$ignore_symbols θnl*/

        /*pre$preamble_clause=>• pre$symbols_preamble peek 1 state: 
        pre$symbols_preamble=>@ • τSYMBOL pre$symbols_preamble_HC_listbody2_101 θnl*/

        /*pre$preamble_clause=>• pre$precedence_preamble peek 1 state: 
        pre$precedence_preamble=>@ • τPREC sym$terminal_symbol θnum θnl*/

        /*pre$preamble_clause=>• pre$name_preamble peek 1 state: 
        pre$name_preamble=>@ • τNAME sym$identifier θnl*/

        /*pre$preamble_clause=>• pre$ext_preamble peek 1 state: 
        pre$ext_preamble=>@ • τEXT sym$identifier θnl*/

        /*pre$preamble_clause=>• pre$error_preamble peek 1 state: 
        pre$error_preamble=>@ • τERROR sym$ignore_symbols θnl*/

        /*pre$preamble_clause=>• pre$import_preamble peek 1 state: 
        pre$import_preamble=>@ • τIMPORT pre$import_preamble_HC_listbody2_102 pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
        pre$import_preamble=>@ • τIMPORT pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl*/

        if (!FAILED && pk1.id == 50/* IGNORE */) {
            //considered syms: IGNORE

            //Single Production Completion

            //peek 1

            //block 3

            //groups true
            /*
            pre$preamble_clause=>• pre$ignore_preamble
            */
            $pre$ignore_preamble(l);
            if (!FAILED) {
                setProduction(30);

                return;
            }
        } else if (!FAILED && pk1.id == 48/* SYMBOL */) {
            //considered syms: SYMBOL

            //Single Production Completion

            //peek 1

            //block 3

            //groups true
            /*
            pre$preamble_clause=>• pre$symbols_preamble
            */
            $pre$symbols_preamble(l);
            if (!FAILED) {
                setProduction(30);

                return;
            }
        } else if (!FAILED && pk1.id == 49/* PREC */) {
            //considered syms: PREC

            //Single Production Completion

            //peek 1

            //block 3

            //groups true
            /*
            pre$preamble_clause=>• pre$precedence_preamble
            */
            $pre$precedence_preamble(l);
            if (!FAILED) {
                setProduction(30);

                return;
            }
        } else if (!FAILED && pk1.id == 52/* NAME */) {
            //considered syms: NAME

            //Single Production Completion

            //peek 1

            //block 3

            //groups true
            /*
            pre$preamble_clause=>• pre$name_preamble
            */
            $pre$name_preamble(l);
            if (!FAILED) {
                setProduction(30);

                return;
            }
        } else if (!FAILED && pk1.id == 53/* EXT */) {
            //considered syms: EXT

            //Single Production Completion

            //peek 1

            //block 3

            //groups true
            /*
            pre$preamble_clause=>• pre$ext_preamble
            */
            $pre$ext_preamble(l);
            if (!FAILED) {
                setProduction(30);

                return;
            }
        } else if (!FAILED && pk1.id == 51/* ERROR */) {
            //considered syms: ERROR

            //Single Production Completion

            //peek 1

            //block 3

            //groups true
            /*
            pre$preamble_clause=>• pre$error_preamble
            */
            $pre$error_preamble(l);
            if (!FAILED) {
                setProduction(30);

                return;
            }
        } else if (!FAILED && pk1.id == 56/* IMPORT */) {
            //considered syms: IMPORT

            //Single Production Completion

            //peek 1

            //block 3

            //groups true
            /*
            pre$preamble_clause=>• pre$import_preamble
            */
            $pre$import_preamble(l);
            if (!FAILED) {
                setProduction(30);

                return;
            }
        }
    } else if (l.id == 57/* # */) {
        //considered syms: #

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        pre$preamble_clause=>• cm$comment
        */
        $cm$comment(l);
        if (!FAILED) {
            setProduction(30);

            return;
        }
    }
    fail(l);
}

function $pre$symbols_preamble(l: Lexer): void {//Production Start
    /*
    pre$symbols_preamble=>• @ τSYMBOL pre$symbols_preamble_HC_listbody2_101 θnl
    */
    _skip(l, const__);
    //considered syms: @

    //Single Production Completion

    //peek 0

    //block 0

    //groups false
    /*
    pre$symbols_preamble=>• @ τSYMBOL pre$symbols_preamble_HC_listbody2_101 θnl
    */
    _with_skip(l, const__, 47/* @ */);
    if (!FAILED) {
        _with_skip(l, const__, 48/* SYMBOL */);
        if (!FAILED) {
            $pre$symbols_preamble_HC_listbody2_101(l);
            if (!FAILED) {
                _with_skip(l, const__, 4/* nl */);
                if (!FAILED) {
                    setProduction(32);
                    add_reduce(4, 43);
                    return;
                }
            }
        }
    }
    fail(l);
}
function $pre$precedence_preamble(l: Lexer): void {//Production Start
    /*
    pre$precedence_preamble=>• @ τPREC sym$terminal_symbol θnum θnl
    */
    _skip(l, const__);
    //considered syms: @

    //Single Production Completion

    //peek 0

    //block 0

    //groups false
    /*
    pre$precedence_preamble=>• @ τPREC sym$terminal_symbol θnum θnl
    */
    _with_skip(l, const__, 47/* @ */);
    if (!FAILED) {
        _with_skip(l, const__, 49/* PREC */);
        if (!FAILED) {
            $sym$terminal_symbol(l);
            if (!FAILED) {
                _with_skip(l, const_2_, 2/* num */);
                if (!FAILED) {
                    _with_skip(l, const__, 4/* nl */);
                    if (!FAILED) {
                        setProduction(33);
                        add_reduce(5, 44);
                        return;
                    }
                }
            }
        }
    }
    fail(l);
}
function $pre$ignore_preamble(l: Lexer): void {//Production Start
    /*
    pre$ignore_preamble=>• @ τIGNORE sym$ignore_symbols θnl
    */
    _skip(l, const__);
    //considered syms: @

    //Single Production Completion

    //peek 0

    //block 0

    //groups false
    /*
    pre$ignore_preamble=>• @ τIGNORE sym$ignore_symbols θnl
    */
    _with_skip(l, const__, 47/* @ */);
    if (!FAILED) {
        _with_skip(l, const__, 50/* IGNORE */);
        if (!FAILED) {
            $sym$ignore_symbols(l);
            if (!FAILED) {
                _with_skip(l, const__, 4/* nl */);
                if (!FAILED) {
                    setProduction(34);
                    add_reduce(4, 45);
                    return;
                }
            }
        }
    }
    fail(l);
}
function $pre$error_preamble(l: Lexer): void {//Production Start
    /*
    pre$error_preamble=>• @ τERROR sym$ignore_symbols θnl
    */
    _skip(l, const__);
    //considered syms: @

    //Single Production Completion

    //peek 0

    //block 0

    //groups false
    /*
    pre$error_preamble=>• @ τERROR sym$ignore_symbols θnl
    */
    _with_skip(l, const__, 47/* @ */);
    if (!FAILED) {
        _with_skip(l, const__, 51/* ERROR */);
        if (!FAILED) {
            $sym$ignore_symbols(l);
            if (!FAILED) {
                _with_skip(l, const__, 4/* nl */);
                if (!FAILED) {
                    setProduction(35);
                    add_reduce(4, 46);
                    return;
                }
            }
        }
    }
    fail(l);
}
function $pre$name_preamble(l: Lexer): void {//Production Start
    /*
    pre$name_preamble=>• @ τNAME sym$identifier θnl
    */
    _skip(l, const__);
    //considered syms: @

    //Single Production Completion

    //peek 0

    //block 0

    //groups false
    /*
    pre$name_preamble=>• @ τNAME sym$identifier θnl
    */
    _with_skip(l, const__, 47/* @ */);
    if (!FAILED) {
        _with_skip(l, const__, 52/* NAME */);
        if (!FAILED) {
            $sym$identifier(l);
            if (!FAILED) {
                _with_skip(l, const__, 4/* nl */);
                if (!FAILED) {
                    setProduction(36);
                    add_reduce(4, 47);
                    return;
                }
            }
        }
    }
    fail(l);
}
function $pre$ext_preamble(l: Lexer): void {//Production Start
    /*
    pre$ext_preamble=>• @ τEXT sym$identifier θnl
    */
    _skip(l, const__);
    //considered syms: @

    //Single Production Completion

    //peek 0

    //block 0

    //groups false
    /*
    pre$ext_preamble=>• @ τEXT sym$identifier θnl
    */
    _with_skip(l, const__, 47/* @ */);
    if (!FAILED) {
        _with_skip(l, const__, 53/* EXT */);
        if (!FAILED) {
            $sym$identifier(l);
            if (!FAILED) {
                _with_skip(l, const__, 4/* nl */);
                if (!FAILED) {
                    setProduction(37);
                    add_reduce(4, 48);
                    return;
                }
            }
        }
    }
    fail(l);
}

function $pre$import_preamble_group_019_103(l: Lexer): void {//Production Start
    /*
    pre$import_preamble_group_019_103=>• θid
    pre$import_preamble_group_019_103=>• θkey
    pre$import_preamble_group_019_103=>• θsym
    pre$import_preamble_group_019_103=>• θtok
    */
    _skip(l, const__);
    if (l.ty == 3/* id */) {
        //considered syms: id

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        pre$import_preamble_group_019_103=>• θid
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(39);

            return;
        }
    } else if (l.ty == 7/* key */) {
        //considered syms: key

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        pre$import_preamble_group_019_103=>• θkey
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(39);

            return;
        }
    } else if (l.ty == 6/* sym */) {
        //considered syms: sym

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        pre$import_preamble_group_019_103=>• θsym
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(39);

            return;
        }
    } else if (l.ty == 5/* tok */) {
        //considered syms: tok

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        pre$import_preamble_group_019_103=>• θtok
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(39);

            return;
        }
    }
    fail(l);
}


function $pre$import_preamble_group_021_106(l: Lexer): void {//Production Start
    /*
    pre$import_preamble_group_021_106=>• τAS
    pre$import_preamble_group_021_106=>• τas
    */
    _skip(l, const__);
    if (l.id == 54/* AS */) {
        //considered syms: AS

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        pre$import_preamble_group_021_106=>• τAS
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(42);

            return;
        }
    } else if (l.id == 55/* as */) {
        //considered syms: as

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        pre$import_preamble_group_021_106=>• τas
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(42);

            return;
        }
    }
    fail(l);
}
function $pre$import_preamble(l: Lexer): void {//Production Start
    /*
    pre$import_preamble=>• @ τIMPORT pre$import_preamble_HC_listbody2_102 pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
    pre$import_preamble=>• @ τIMPORT pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
    */
    _skip(l, const__);
    //considered syms: @

    //Parallel Transition
    /*
    pre$import_preamble=>• @ τIMPORT pre$import_preamble_HC_listbody2_102 pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
    pre$import_preamble=>• @ τIMPORT pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
    */
    _no_check(l);

    //Parallel Transition
    /*
    pre$import_preamble=>@ • τIMPORT pre$import_preamble_HC_listbody2_102 pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
    pre$import_preamble=>@ • τIMPORT pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
    */
    _with_skip(l, const_1_, 56/* IMPORT */);

    //Look Ahead Level 0
    /*
    pre$import_preamble=>@ τIMPORT • pre$import_preamble_HC_listbody2_102 pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
    pre$import_preamble=>@ τIMPORT • pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
    */
    _skip(l, const_1_);
    if (l.ty == 1/* ws */) {
        //considered syms: ws

        //Single Production Completion

        //peek 0

        //block 2

        //groups true
        /*
        pre$import_preamble=>@ τIMPORT • pre$import_preamble_HC_listbody2_102 pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
        */
        $pre$import_preamble_HC_listbody2_102(l);
        if (!FAILED) {
            $pre$import_preamble_HC_listbody1_104(l);
            if (!FAILED) {
                $pre$import_preamble_HC_listbody4_105(l);
                if (!FAILED) {
                    $pre$import_preamble_group_021_106(l);
                    if (!FAILED) {
                        $sym$identifier(l);
                        if (!FAILED) {
                            _with_skip(l, const__, 4/* nl */);
                            if (!FAILED) {
                                setProduction(43);
                                add_reduce(8, 50);
                                return;
                            }
                        }
                    }
                }
            }
        }
    } else if (l.ty == 3/* id */ || l.ty == 5/* tok */ || l.ty == 6/* sym */ || l.ty == 7/* key */) {
        //considered syms: id,key,sym,tok

        //Single Production Completion

        //peek 0

        //block 2

        //groups true
        /*
        pre$import_preamble=>@ τIMPORT • pre$import_preamble_HC_listbody1_104 pre$import_preamble_HC_listbody4_105 pre$import_preamble_group_021_106 sym$identifier θnl
        */
        $pre$import_preamble_HC_listbody1_104(l);
        if (!FAILED) {
            $pre$import_preamble_HC_listbody4_105(l);
            if (!FAILED) {
                $pre$import_preamble_group_021_106(l);
                if (!FAILED) {
                    $sym$identifier(l);
                    if (!FAILED) {
                        _with_skip(l, const__, 4/* nl */);
                        if (!FAILED) {
                            setProduction(43);
                            add_reduce(7, 50);
                            return;
                        }
                    }
                }
            }
        }
    }
    fail(l);
}
function $cm$comment(l: Lexer): void {//Production Start
    /*
    cm$comment=>• cm$cm
    cm$cm=>• # cm$comment_data cm$comment_delimiter
    */
    _skip(l, const__);
    //considered syms: #

    //Single Production Completion

    //peek 0

    //block 0

    //groups false
    /*
    cm$comment=>• cm$cm
    */
    $cm$cm(l);
    if (!FAILED) {
        setProduction(44);

        return;
    }
    fail(l);
}
function $cm$cm(l: Lexer): void {//Production Start
    /*
    cm$cm=>• # cm$comment_data cm$comment_delimiter
    */
    _skip(l, const__);
    //considered syms: #

    //Single Production Completion

    //peek 0

    //block 0

    //groups false
    /*
    cm$cm=>• # cm$comment_data cm$comment_delimiter
    */
    _with_skip(l, const_1_, 57/* # */);
    if (!FAILED) {
        $cm$comment_data(l);
        if (!FAILED) {
            $cm$comment_delimiter(l);
            if (!FAILED) {
                setProduction(45);
                add_reduce(3, 51);
                return;
            }
        }
    }
    fail(l);
}
function $cm$comment_delimiter(l: Lexer): void {//Production Start
    /*
    cm$comment_delimiter=>• θnl
    */
    _skip(l, const_2_);
    //considered syms: nl

    //Single Production Completion

    //peek 0

    //block 0

    //groups false
    /*
    cm$comment_delimiter=>• θnl
    */
    _with_skip(l, const__, 4/* nl */);
    if (!FAILED) {
        setProduction(46);

        return;
    }
    fail(l);
}

function $cm$comment_primitive(l: Lexer): void {//Production Start
    /*
    cm$comment_primitive=>• θsym
    cm$comment_primitive=>• θtok
    cm$comment_primitive=>• θid
    cm$comment_primitive=>• θnum
    cm$comment_primitive=>• θws
    cm$comment_primitive=>• θkey
    */
    _skip(l, const_1_);
    if (l.ty == 6/* sym */) {
        //considered syms: sym

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        cm$comment_primitive=>• θsym
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(48);

            return;
        }
    } else if (l.ty == 5/* tok */) {
        //considered syms: tok

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        cm$comment_primitive=>• θtok
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(48);

            return;
        }
    } else if (l.ty == 3/* id */) {
        //considered syms: id

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        cm$comment_primitive=>• θid
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(48);

            return;
        }
    } else if (l.ty == 2/* num */) {
        //considered syms: num

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        cm$comment_primitive=>• θnum
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(48);

            return;
        }
    } else if (l.ty == 1/* ws */) {
        //considered syms: ws

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        cm$comment_primitive=>• θws
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(48);

            return;
        }
    } else if (l.ty == 7/* key */) {
        //considered syms: key

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        cm$comment_primitive=>• θkey
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(48);

            return;
        }
    }
    fail(l);
}


function $sym$lexer_symbol(l: Lexer): void {//Production Start
    /*
    sym$lexer_symbol=>• sym$generated_symbol
    sym$lexer_symbol=>• sym$literal_symbol
    sym$lexer_symbol=>• sym$escaped_symbol
    sym$lexer_symbol=>• sym$grouped_symbol sym$grouped_delimiter
    sym$generated_symbol=>• sym$generated_symbol_group_141_106 sym$identifier
    sym$generated_symbol_group_141_106=>• θ
    sym$generated_symbol_group_141_106=>• τg :
    sym$literal_symbol=>• sym$literal_symbol_group_144_107 sym$literal_symbol_group_046_108
    sym$literal_symbol_group_144_107=>• τ
    sym$literal_symbol_group_144_107=>• τt :
    sym$escaped_symbol=>• \ sym$escaped_symbol_group_050_109
    sym$grouped_symbol=>• sym$grouped_symbol sym$grouped_symbol_group_012_103
    sym$grouped_symbol=>• sym$grouped_symbol_group_012_103
    sym$grouped_symbol_group_012_103=>• θsym
    sym$grouped_symbol_group_012_103=>• θid
    sym$grouped_symbol_group_012_103=>• θany
    */
    _skip(l, const__);
    if (l.id == 19/* θ */ || l.id == 61/* g */) {
        //considered syms: θ,g

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        sym$lexer_symbol=>• sym$generated_symbol
        */
        $sym$generated_symbol(l);
        if (!FAILED) {
            setProduction(55);

            return;
        }
    } else if (l.id == 18/* τ */ || l.id == 62/* t */) {
        //considered syms: τ,t

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        sym$lexer_symbol=>• sym$literal_symbol
        */
        $sym$literal_symbol(l);
        if (!FAILED) {
            setProduction(55);

            return;
        }
    } else if (l.id == 63/* \ */) {
        //considered syms: \

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        sym$lexer_symbol=>• sym$escaped_symbol
        */
        $sym$escaped_symbol(l);
        if (!FAILED) {
            setProduction(55);

            return;
        }
    } else if (!(false)) {
        //considered syms: sym,id,any

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        sym$lexer_symbol=>• sym$grouped_symbol sym$grouped_delimiter
        */
        $sym$grouped_symbol(l);
        if (!FAILED) {
            $sym$grouped_delimiter(l);
            if (!FAILED) {
                setProduction(55);
                add_reduce(2, 52);
                return;
            }
        }
    }
    fail(l);
}
function $sym$grouped_delimiter(l: Lexer): void {//Production Start
    /*
    sym$grouped_delimiter=>• θnl
    sym$grouped_delimiter=>• θws
    */

    if (l.ty == 4/* nl */) {
        //considered syms: nl

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        sym$grouped_delimiter=>• θnl
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(56);

            return;
        }
    } else if (l.ty == 1/* ws */) {
        //considered syms: ws

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        sym$grouped_delimiter=>• θws
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(56);

            return;
        }
    }
    fail(l);
}
function $sym$grouped_symbol_group_012_103(l: Lexer): void {//Production Start
    /*
    sym$grouped_symbol_group_012_103=>• θsym
    sym$grouped_symbol_group_012_103=>• θid
    sym$grouped_symbol_group_012_103=>• θany
    */
    _skip(l, const__);
    if (l.ty == 6/* sym */) {
        //considered syms: sym

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        sym$grouped_symbol_group_012_103=>• θsym
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(57);

            return;
        }
    } else if (l.ty == 3/* id */) {
        //considered syms: id

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        sym$grouped_symbol_group_012_103=>• θid
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(57);

            return;
        }
    } else if (!(false)) {
        //considered syms: any

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        sym$grouped_symbol_group_012_103=>• θany
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(57);

            return;
        }
    }
    fail(l);
}

function $sym$ignore_symbol(l: Lexer): void {//Production Start
    /*
    sym$ignore_symbol=>• sym$generated_symbol
    sym$ignore_symbol=>• sym$literal_symbol
    sym$ignore_symbol=>• sym$escaped_symbol
    sym$ignore_symbol=>• θany
    sym$generated_symbol=>• sym$generated_symbol_group_141_106 sym$identifier
    sym$generated_symbol_group_141_106=>• θ
    sym$generated_symbol_group_141_106=>• τg :
    sym$literal_symbol=>• sym$literal_symbol_group_144_107 sym$literal_symbol_group_046_108
    sym$literal_symbol_group_144_107=>• τ
    sym$literal_symbol_group_144_107=>• τt :
    sym$escaped_symbol=>• \ sym$escaped_symbol_group_050_109
    */
    _skip(l, const__);
    if (l.id == 19/* θ */ || l.id == 61/* g */) {
        //considered syms: θ,g

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        sym$ignore_symbol=>• sym$generated_symbol
        */
        $sym$generated_symbol(l);
        if (!FAILED) {
            setProduction(60);

            return;
        }
    } else if (l.id == 18/* τ */ || l.id == 62/* t */) {
        //considered syms: τ,t

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        sym$ignore_symbol=>• sym$literal_symbol
        */
        $sym$literal_symbol(l);
        if (!FAILED) {
            setProduction(60);

            return;
        }
    } else if (l.id == 63/* \ */) {
        //considered syms: \

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        sym$ignore_symbol=>• sym$escaped_symbol
        */
        $sym$escaped_symbol(l);
        if (!FAILED) {
            setProduction(60);

            return;
        }
    } else if (!(false)) {
        //considered syms: any

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        sym$ignore_symbol=>• θany
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(60);
            add_reduce(1, 52);
            return;
        }
    }
    fail(l);
}
function $sym$terminal_symbol(l: Lexer): void {//Production Start
    /*
    sym$terminal_symbol=>• sym$generated_symbol
    sym$terminal_symbol=>• sym$literal_symbol
    sym$terminal_symbol=>• sym$escaped_symbol
    sym$terminal_symbol=>• sym$assert_function_symbol
    sym$terminal_symbol=>• θany
    sym$generated_symbol=>• sym$generated_symbol_group_141_106 sym$identifier
    sym$generated_symbol_group_141_106=>• θ
    sym$generated_symbol_group_141_106=>• τg :
    sym$literal_symbol=>• sym$literal_symbol_group_144_107 sym$literal_symbol_group_046_108
    sym$literal_symbol_group_144_107=>• τ
    sym$literal_symbol_group_144_107=>• τt :
    sym$escaped_symbol=>• \ sym$escaped_symbol_group_050_109
    sym$assert_function_symbol=>• τassert : sym$identifier
    sym$assert_function_symbol=>• τshift : sym$identifier
    */
    _skip(l, const__);
    if (l.id == 19/* θ */ || l.id == 61/* g */) {
        //considered syms: θ,g

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        sym$terminal_symbol=>• sym$generated_symbol
        */
        $sym$generated_symbol(l);
        if (!FAILED) {
            setProduction(61);

            return;
        }
    } else if (l.id == 18/* τ */ || l.id == 62/* t */) {
        //considered syms: τ,t

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        sym$terminal_symbol=>• sym$literal_symbol
        */
        $sym$literal_symbol(l);
        if (!FAILED) {
            setProduction(61);

            return;
        }
    } else if (l.id == 63/* \ */) {
        //considered syms: \

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        sym$terminal_symbol=>• sym$escaped_symbol
        */
        $sym$escaped_symbol(l);
        if (!FAILED) {
            setProduction(61);

            return;
        }
    } else if (l.id == 59/* assert */ || l.id == 60/* shift */) {
        //considered syms: assert,shift

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        sym$terminal_symbol=>• sym$assert_function_symbol
        */
        $sym$assert_function_symbol(l);
        if (!FAILED) {
            setProduction(61);

            return;
        }
    } else if (!(false)) {
        //considered syms: any

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        sym$terminal_symbol=>• θany
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(61);
            add_reduce(1, 52);
            return;
        }
    }
    fail(l);
}
function $sym$symbol_group_032_105(l: Lexer): void {//Production Start
    /*
    sym$symbol_group_032_105=>• (+
    sym$symbol_group_032_105=>• (*
    */
    _skip(l, const__);
    if (l.id == 16/* (+ */) {
        //considered syms: (+

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        sym$symbol_group_032_105=>• (+
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(62);

            return;
        }
    } else if (l.id == 15/* (* */) {
        //considered syms: (*

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        sym$symbol_group_032_105=>• (*
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(62);

            return;
        }
    }
    fail(l);
}

function $sym$EOF_symbol(l: Lexer): void {//Production Start
    /*
    sym$EOF_symbol=>• $eof
    */
    _skip(l, const__);
    //considered syms: $eof

    //Single Production Completion

    //peek 0

    //block 0

    //groups false
    /*
    sym$EOF_symbol=>• $eof
    */
    _with_skip(l, const__, 0/* EOF */);
    if (!FAILED) {
        setProduction(64);
        add_reduce(1, 54);
        return;
    }
    fail(l);
}
function $sym$empty_symbol(l: Lexer): void {//Production Start
    /*
    sym$empty_symbol=>• ɛ
    */
    _skip(l, const__);
    //considered syms: ɛ

    //Single Production Completion

    //peek 0

    //block 0

    //groups false
    /*
    sym$empty_symbol=>• ɛ
    */
    _with_skip(l, const__, 20/* ɛ */);
    if (!FAILED) {
        setProduction(65);
        add_reduce(1, 55);
        return;
    }
    fail(l);
}
function $sym$assert_function_symbol(l: Lexer): void {//Production Start
    /*
    sym$assert_function_symbol=>• τassert : sym$identifier
    sym$assert_function_symbol=>• τshift : sym$identifier
    */
    _skip(l, const__);
    if (l.id == 59/* assert */) {
        //considered syms: assert

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        sym$assert_function_symbol=>• τassert : sym$identifier
        */
        _no_check(l);
        if (!FAILED) {
            _with_skip(l, const__, 40/* : */);
            if (!FAILED) {
                $sym$identifier(l);
                if (!FAILED) {
                    setProduction(66);
                    add_reduce(3, 56);
                    return;
                }
            }
        }
    } else if (l.id == 60/* shift */) {
        //considered syms: shift

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        sym$assert_function_symbol=>• τshift : sym$identifier
        */
        _no_check(l);
        if (!FAILED) {
            _with_skip(l, const__, 40/* : */);
            if (!FAILED) {
                $sym$identifier(l);
                if (!FAILED) {
                    setProduction(66);
                    add_reduce(3, 57);
                    return;
                }
            }
        }
    }
    fail(l);
}
function $sym$generated_symbol_group_141_106(l: Lexer): void {//Production Start
    /*
    sym$generated_symbol_group_141_106=>• θ
    sym$generated_symbol_group_141_106=>• τg :
    */
    _skip(l, const__);
    if (l.id == 19/* θ */) {
        //considered syms: θ

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        sym$generated_symbol_group_141_106=>• θ
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(67);

            return;
        }
    } else if (l.id == 61/* g */) {
        //considered syms: g

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        sym$generated_symbol_group_141_106=>• τg :
        */
        _no_check(l);
        if (!FAILED) {
            _with_skip(l, const__, 40/* : */);
            if (!FAILED) {
                setProduction(67);
                add_reduce(2, 0);
                return;
            }
        }
    }
    fail(l);
}
function $sym$generated_symbol(l: Lexer): void {//Production Start
    /*
    sym$generated_symbol=>• sym$generated_symbol_group_141_106 sym$identifier
    sym$generated_symbol_group_141_106=>• θ
    sym$generated_symbol_group_141_106=>• τg :
    */
    _skip(l, const__);
    //considered syms: θ,g

    //Single Production Completion

    //peek 0

    //block 0

    //groups false
    /*
    sym$generated_symbol=>• sym$generated_symbol_group_141_106 sym$identifier
    */
    $sym$generated_symbol_group_141_106(l);
    if (!FAILED) {
        $sym$identifier(l);
        if (!FAILED) {
            setProduction(68);
            add_reduce(2, 58);
            return;
        }
    }
    fail(l);
}
function $sym$literal_symbol_group_144_107(l: Lexer): void {//Production Start
    /*
    sym$literal_symbol_group_144_107=>• τ
    sym$literal_symbol_group_144_107=>• τt :
    */
    _skip(l, const__);
    if (l.id == 18/* τ */) {
        //considered syms: τ

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        sym$literal_symbol_group_144_107=>• τ
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(69);

            return;
        }
    } else if (l.id == 62/* t */) {
        //considered syms: t

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        sym$literal_symbol_group_144_107=>• τt :
        */
        _no_check(l);
        if (!FAILED) {
            _with_skip(l, const__, 40/* : */);
            if (!FAILED) {
                setProduction(69);
                add_reduce(2, 0);
                return;
            }
        }
    }
    fail(l);
}
function $sym$literal_symbol_group_046_108(l: Lexer): void {//Production Start
    /*
    sym$literal_symbol_group_046_108=>• sym$identifier
    sym$literal_symbol_group_046_108=>• def$natural
    sym$identifier=>• def$js_identifier
    def$js_identifier=>• def$js_id_symbols
    def$js_id_symbols=>• def$js_id_symbols θid
    def$js_id_symbols=>• def$js_id_symbols θkey
    def$js_id_symbols=>• def$js_id_symbols _
    def$js_id_symbols=>• def$js_id_symbols $
    def$js_id_symbols=>• def$js_id_symbols θnum
    def$js_id_symbols=>• def$js_id_symbols θhex
    def$js_id_symbols=>• def$js_id_symbols θbin
    def$js_id_symbols=>• def$js_id_symbols θoct
    def$js_id_symbols=>• _
    def$js_id_symbols=>• $
    def$js_id_symbols=>• θid
    def$js_id_symbols=>• θkey
    def$natural=>• θnum
    */
    _skip(l, const__);
    if (l.id == 78/* _ */ || l.id == 79/* $ */ || l.ty == 3/* id */ || l.ty == 7/* key */) {
        //considered syms: _,$,id,key

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        sym$literal_symbol_group_046_108=>• sym$identifier
        */
        $sym$identifier(l);
        if (!FAILED) {
            setProduction(70);

            return;
        }
    } else if (l.ty == 2/* num */) {
        //considered syms: num

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        sym$literal_symbol_group_046_108=>• def$natural
        */
        $def$natural(l);
        if (!FAILED) {
            setProduction(70);

            return;
        }
    }
    fail(l);
}
function $sym$literal_symbol(l: Lexer): void {//Production Start
    /*
    sym$literal_symbol=>• sym$literal_symbol_group_144_107 sym$literal_symbol_group_046_108
    sym$literal_symbol_group_144_107=>• τ
    sym$literal_symbol_group_144_107=>• τt :
    */
    _skip(l, const__);
    //considered syms: τ,t

    //Single Production Completion

    //peek 0

    //block 0

    //groups false
    /*
    sym$literal_symbol=>• sym$literal_symbol_group_144_107 sym$literal_symbol_group_046_108
    */
    $sym$literal_symbol_group_144_107(l);
    if (!FAILED) {
        $sym$literal_symbol_group_046_108(l);
        if (!FAILED) {
            setProduction(71);
            add_reduce(2, 59);
            return;
        }
    }
    fail(l);
}
function $sym$escaped_symbol_group_050_109(l: Lexer): void {//Production Start
    /*
    sym$escaped_symbol_group_050_109=>• θid
    sym$escaped_symbol_group_050_109=>• θtok
    sym$escaped_symbol_group_050_109=>• θsym
    */
    _skip(l, const__);
    if (l.ty == 3/* id */) {
        //considered syms: id

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        sym$escaped_symbol_group_050_109=>• θid
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(72);

            return;
        }
    } else if (l.ty == 5/* tok */) {
        //considered syms: tok

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        sym$escaped_symbol_group_050_109=>• θtok
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(72);

            return;
        }
    } else if (l.ty == 6/* sym */) {
        //considered syms: sym

        //Single Production Completion

        //peek 0

        //block 1

        //groups true
        /*
        sym$escaped_symbol_group_050_109=>• θsym
        */
        _no_check(l);
        if (!FAILED) {
            setProduction(72);

            return;
        }
    }
    fail(l);
}
function $sym$escaped_symbol(l: Lexer): void {//Production Start
    /*
    sym$escaped_symbol=>• \ sym$escaped_symbol_group_050_109
    */
    _skip(l, const__);
    //considered syms: \

    //Single Production Completion

    //peek 0

    //block 0

    //groups false
    /*
    sym$escaped_symbol=>• \ sym$escaped_symbol_group_050_109
    */
    _with_skip(l, const__, 63/* \ */);
    if (!FAILED) {
        $sym$escaped_symbol_group_050_109(l);
        if (!FAILED) {
            setProduction(73);
            add_reduce(2, 60);
            return;
        }
    }
    fail(l);
}
function $sym$production_symbol(l: Lexer): void {//Production Start
    /*
    sym$production_symbol=>• sym$identifier
    sym$identifier=>• def$js_identifier
    def$js_identifier=>• def$js_id_symbols
    def$js_id_symbols=>• def$js_id_symbols θid
    def$js_id_symbols=>• def$js_id_symbols θkey
    def$js_id_symbols=>• def$js_id_symbols _
    def$js_id_symbols=>• def$js_id_symbols $
    def$js_id_symbols=>• def$js_id_symbols θnum
    def$js_id_symbols=>• def$js_id_symbols θhex
    def$js_id_symbols=>• def$js_id_symbols θbin
    def$js_id_symbols=>• def$js_id_symbols θoct
    def$js_id_symbols=>• _
    def$js_id_symbols=>• $
    def$js_id_symbols=>• θid
    def$js_id_symbols=>• θkey
    */
    _skip(l, const__);
    //considered syms: _,$,id,key

    //Single Production Completion

    //peek 0

    //block 0

    //groups false
    /*
    sym$production_symbol=>• sym$identifier
    */
    $sym$identifier(l);
    if (!FAILED) {
        setProduction(74);
        add_reduce(1, 61);
        return;
    }
    fail(l);
}
function $sym$imported_production_symbol(l: Lexer): void {//Production Start
    /*
    sym$imported_production_symbol=>• sym$production_id :: sym$identifier
    sym$production_id=>• sym$identifier
    sym$identifier=>• def$js_identifier
    def$js_identifier=>• def$js_id_symbols
    def$js_id_symbols=>• def$js_id_symbols θid
    def$js_id_symbols=>• def$js_id_symbols θkey
    def$js_id_symbols=>• def$js_id_symbols _
    def$js_id_symbols=>• def$js_id_symbols $
    def$js_id_symbols=>• def$js_id_symbols θnum
    def$js_id_symbols=>• def$js_id_symbols θhex
    def$js_id_symbols=>• def$js_id_symbols θbin
    def$js_id_symbols=>• def$js_id_symbols θoct
    def$js_id_symbols=>• _
    def$js_id_symbols=>• $
    def$js_id_symbols=>• θid
    def$js_id_symbols=>• θkey
    */
    _skip(l, const__);
    //considered syms: _,$,id,key

    //Single Production Completion

    //peek 0

    //block 0

    //groups false
    /*
    sym$imported_production_symbol=>• sym$production_id :: sym$identifier
    */
    $sym$production_id(l);
    if (!FAILED) {
        _with_skip(l, const__, 17/* :: */);
        if (!FAILED) {
            $sym$identifier(l);
            if (!FAILED) {
                setProduction(75);
                add_reduce(3, 50);
                return;
            }
        }
    }
    fail(l);
}
function $sym$production_id(l: Lexer): void {//Production Start
    /*
    sym$production_id=>• sym$identifier
    sym$identifier=>• def$js_identifier
    def$js_identifier=>• def$js_id_symbols
    def$js_id_symbols=>• def$js_id_symbols θid
    def$js_id_symbols=>• def$js_id_symbols θkey
    def$js_id_symbols=>• def$js_id_symbols _
    def$js_id_symbols=>• def$js_id_symbols $
    def$js_id_symbols=>• def$js_id_symbols θnum
    def$js_id_symbols=>• def$js_id_symbols θhex
    def$js_id_symbols=>• def$js_id_symbols θbin
    def$js_id_symbols=>• def$js_id_symbols θoct
    def$js_id_symbols=>• _
    def$js_id_symbols=>• $
    def$js_id_symbols=>• θid
    def$js_id_symbols=>• θkey
    */
    _skip(l, const__);
    //considered syms: _,$,id,key

    //Single Production Completion

    //peek 0

    //block 0

    //groups false
    /*
    sym$production_id=>• sym$identifier
    */
    $sym$identifier(l);
    if (!FAILED) {
        setProduction(76);

        return;
    }
    fail(l);
}
function $sym$identifier(l: Lexer): void {//Production Start
    /*
    sym$identifier=>• def$js_identifier
    def$js_identifier=>• def$js_id_symbols
    def$js_id_symbols=>• def$js_id_symbols θid
    def$js_id_symbols=>• def$js_id_symbols θkey
    def$js_id_symbols=>• def$js_id_symbols _
    def$js_id_symbols=>• def$js_id_symbols $
    def$js_id_symbols=>• def$js_id_symbols θnum
    def$js_id_symbols=>• def$js_id_symbols θhex
    def$js_id_symbols=>• def$js_id_symbols θbin
    def$js_id_symbols=>• def$js_id_symbols θoct
    def$js_id_symbols=>• _
    def$js_id_symbols=>• $
    def$js_id_symbols=>• θid
    def$js_id_symbols=>• θkey
    */
    _skip(l, const__);
    //considered syms: _,$,id,key

    //Single Production Completion

    //peek 0

    //block 0

    //groups false
    /*
    sym$identifier=>• def$js_identifier
    */
    $def$js_identifier(l);
    if (!FAILED) {
        setProduction(77);

        return;
    }
    fail(l);
}
function $sym$js_identifier(l: Lexer): void {//Production Start
    /*
    sym$js_identifier=>• def$id
    def$id=>• θid
    */
    _skip(l, const__);
    //considered syms: id

    //Single Production Completion

    //peek 0

    //block 0

    //groups false
    /*
    sym$js_identifier=>• def$id
    */
    $def$id(l);
    if (!FAILED) {
        setProduction(78);

        return;
    }
    fail(l);
}
function $def$natural(l: Lexer): void {//Production Start
    /*
    def$natural=>• θnum
    */
    _skip(l, const__);
    //considered syms: num

    //Single Production Completion

    //peek 0

    //block 0

    //groups false
    /*
    def$natural=>• θnum
    */
    _with_skip(l, const__, 2/* num */);
    if (!FAILED) {
        setProduction(90);

        return;
    }
    fail(l);
}
function $def$id(l: Lexer): void {//Production Start
    /*
    def$id=>• θid
    */
    _skip(l, const__);
    //considered syms: id

    //Single Production Completion

    //peek 0

    //block 0

    //groups false
    /*
    def$id=>• θid
    */
    _with_skip(l, const__, 3/* id */);
    if (!FAILED) {
        setProduction(91);

        return;
    }
    fail(l);
}
function $def$js_identifier(l: Lexer): void {//Production Start
    /*
    def$js_identifier=>• def$js_id_symbols
    def$js_id_symbols=>• def$js_id_symbols θid
    def$js_id_symbols=>• def$js_id_symbols θkey
    def$js_id_symbols=>• def$js_id_symbols _
    def$js_id_symbols=>• def$js_id_symbols $
    def$js_id_symbols=>• def$js_id_symbols θnum
    def$js_id_symbols=>• def$js_id_symbols θhex
    def$js_id_symbols=>• def$js_id_symbols θbin
    def$js_id_symbols=>• def$js_id_symbols θoct
    def$js_id_symbols=>• _
    def$js_id_symbols=>• $
    def$js_id_symbols=>• θid
    def$js_id_symbols=>• θkey
    */
    _skip(l, const__);
    //considered syms: _,$,id,key

    //Single Production Completion

    //peek 0

    //block 0

    //groups false
    /*
    def$js_identifier=>• def$js_id_symbols
    */
    $def$js_id_symbols(l);
    if (!FAILED) {
        setProduction(99);

        return;
    }
    fail(l);
}

function $prd$productions(l: Lexer): void {
    /*
prd$productions=>• prd$production|$eof: 3;
prd$productions=>• fn$referenced_function|$eof: 3;
prd$productions=>• prd$productions prd$production|$eof: 3;
prd$productions=>• prd$productions cm$comment|$eof: 3;
prd$productions=>• prd$productions fn$referenced_function|$eof: 3;
prd$productions=>•|$eof
*/
    _skip(l, const__);
    if (idm0.has(l.id)) { idm0.get(l.id)(l); } else if (l.ty == 0/* EOF */) {

        completeProduction(0, 0, 3); stack_ptr -= 0;

        ; return;
    }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 18: //fn$referenced_function
                State2(l);
                break;
            case 8: //prd$production
                State1(l);
                break;
            case 3: //prd$productions
                _skip(l, const__);
                if (l.ty == 0/* EOF */) { return; }
                {
                    const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                    State3(cp);
                    if (FAILED) {
                        prod = p;
                        FAILED = false;
                        stack_ptr = s;
                        reset(m);
                        return;
                    } else l.sync(cp);
                }
                break;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State1(l: Lexer): void {
    /*
prd$productions=>prd$production •|$eof
*/
    _skip(l, const__);
    if (l.id == 12/* <> */ || l.id == 13/* +> */ || l.id == 45/* ↦ */ || l.id == 46/* f */ || l.id == 57/* # */ || l.ty == 0/* EOF */) {

        completeProduction(4, 1, 3); stack_ptr -= 1;

        ; return;
    }
    else fail(l);
}
function State2(l: Lexer): void {
    /*
prd$productions=>fn$referenced_function •|$eof
*/
    _skip(l, const__);
    if (l.id == 12/* <> */ || l.id == 13/* +> */ || l.id == 45/* ↦ */ || l.id == 46/* f */ || l.id == 57/* # */ || l.ty == 0/* EOF */) {

        completeProduction(5, 1, 3); stack_ptr -= 1;

        ; return;
    }
    else fail(l);
}
function State3(l: Lexer): void {
    /*
prd$productions=>prd$productions • prd$production|$eof: 3;
prd$productions=>prd$productions • cm$comment|$eof: 3;
prd$productions=>prd$productions • fn$referenced_function|$eof: 3
*/
    _skip(l, const__);
    if (idm3.has(l.id)) { idm3.get(l.id)(l); }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 44: //cm$comment
                State166(l);
                break;
            case 18: //fn$referenced_function
                State167(l);
                break;
            case 8: //prd$production
                State165(l);
                break;
            case 3/*prd$productions*/: return;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State4(l: Lexer): void {
    /*
prd$production=><> • prd$production_group_08_100 prd$production_start_symbol pb$production_bodies prd$production_group_111_102|$eof: 8;
prd$production=><> • prd$production_group_013_103 prd$production_start_symbol pb$production_bodies|$eof: 8;
prd$production=><> • prd$production_group_08_100 prd$production_start_symbol pb$production_bodies|$eof: 8
*/
    _skip(l, const__);
    if (l.id == 78/* _ */ || l.id == 79/* $ */ || l.ty == 3/* id */ || l.ty == 7/* key */) {
        let $mark = mark(), sp = stack_ptr, cp = l.copy();
        $prd$production_group_08_100(cp); stack_ptr++;
        if (FAILED) {
            reset($mark); FAILED = false; stack_ptr = sp;
            $prd$production_group_013_103(l); stack_ptr++;;
        } else l.sync(cp);

    }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 7: //prd$production_group_013_103
                State192(l);
                break;
            case 4: //prd$production_group_08_100
                State191(l);
                break;
            case 8/*prd$production*/: return;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State5(l: Lexer): void {
    /*
prd$production=>+> • prd$production_group_013_103 prd$production_start_symbol pb$production_bodies|$eof: 8
*/
    _skip(l, const__);
    if (l.id == 78/* _ */ || l.id == 79/* $ */ || l.ty == 3/* id */ || l.ty == 7/* key */) {

        $prd$production_group_013_103(l); stack_ptr++;

    }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 7: //prd$production_group_013_103
                State187(l);
                break;
            case 8/*prd$production*/: return;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function $pre$preamble(l: Lexer): void {
    /*
pre$preamble=>• pre$preamble pre$preamble_clause|<>: 29;
pre$preamble=>• pre$preamble_clause|<>: 29
*/
    _skip(l, const__);
    if (l.id == 47/* @ */ || l.id == 57/* # */) {

        $pre$preamble_clause(l); stack_ptr++;

    }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 30: //pre$preamble_clause
                State25(l);
                break;
            case 29: //pre$preamble
                _skip(l, const__);
                if (l.id == 12/* <> */ || l.id == 13/* +> */ || l.id == 45/* ↦ */ || l.id == 46/* f */ || l.ty == 0/* EOF */) { return; }
                {
                    const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                    State24(cp);
                    if (FAILED) {
                        prod = p;
                        FAILED = false;
                        stack_ptr = s;
                        reset(m);
                        return;
                    } else l.sync(cp);
                }
                break;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State24(l: Lexer): void {
    /*
pre$preamble=>pre$preamble • pre$preamble_clause|<>: 29
*/
    _skip(l, const__);
    if (l.id == 47/* @ */ || l.id == 57/* # */) {

        $pre$preamble_clause(l); stack_ptr++;

    }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 30: //pre$preamble_clause
                State202(l);
                break;
            case 29/*pre$preamble*/: return;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State25(l: Lexer): void {
    /*
pre$preamble=>pre$preamble_clause •|<>
*/
    _skip(l, const__);
    if (l.id == 12/* <> */ || l.id == 13/* +> */ || l.id == 45/* ↦ */ || l.id == 46/* f */ || l.id == 47/* @ */ || l.id == 57/* # */ || l.ty == 0/* EOF */) {

        completeProduction(42, 1, 29); stack_ptr -= 1;

        ; return;
    }
    else fail(l);
}
function $pre$import_preamble_HC_listbody2_102(l: Lexer): void {
    /*
pre$import_preamble_HC_listbody2_102=>• pre$import_preamble_HC_listbody2_102 θws|id: 38;
pre$import_preamble_HC_listbody2_102=>• θws|id
*/
    _skip(l, const_1_);
    if (l.ty == 1/* ws */) {

        _no_check(l);; stack_ptr++; State28(l);

    }
    else fail(l);
}
function State28(l: Lexer): void {
    /*
pre$import_preamble_HC_listbody2_102=>θws •|id
*/
    _skip(l, const_1_);
    if (l.ty == 0/* EOF */ || l.ty == 1/* ws */ || l.ty == 3/* id */ || l.ty == 5/* tok */ || l.ty == 6/* sym */ || l.ty == 7/* key */) {

        completeProduction(42, 1, 38); stack_ptr -= 1;

        ; return;
    }
    else fail(l);
}
function $pre$import_preamble_HC_listbody1_104(l: Lexer): void {
    /*
pre$import_preamble_HC_listbody1_104=>• pre$import_preamble_HC_listbody1_104 pre$import_preamble_group_019_103|ws: 40;
pre$import_preamble_HC_listbody1_104=>• pre$import_preamble_group_019_103|ws: 40
*/
    _skip(l, const_1_);
    if (l.ty == 3/* id */ || l.ty == 5/* tok */ || l.ty == 6/* sym */ || l.ty == 7/* key */) {

        $pre$import_preamble_group_019_103(l); stack_ptr++;

    }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 40: //pre$import_preamble_HC_listbody1_104
                _skip(l, const_1_);
                if (l.ty == 0/* EOF */ || l.ty == 1/* ws */) { return; }
                {
                    const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                    State30(cp);
                    if (FAILED) {
                        prod = p;
                        FAILED = false;
                        stack_ptr = s;
                        reset(m);
                        return;
                    } else l.sync(cp);
                }
                break;
            case 39: //pre$import_preamble_group_019_103
                State31(l);
                break;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State30(l: Lexer): void {
    /*
pre$import_preamble_HC_listbody1_104=>pre$import_preamble_HC_listbody1_104 • pre$import_preamble_group_019_103|ws: 40
*/
    _skip(l, const_1_);
    if (l.ty == 3/* id */ || l.ty == 5/* tok */ || l.ty == 6/* sym */ || l.ty == 7/* key */) {

        $pre$import_preamble_group_019_103(l); stack_ptr++;

    }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 39: //pre$import_preamble_group_019_103
                State209(l);
                break;
            case 40/*pre$import_preamble_HC_listbody1_104*/: return;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State31(l: Lexer): void {
    /*
pre$import_preamble_HC_listbody1_104=>pre$import_preamble_group_019_103 •|ws
*/
    _skip(l, const_1_);
    if (l.ty == 0/* EOF */ || l.ty == 1/* ws */ || l.ty == 3/* id */ || l.ty == 5/* tok */ || l.ty == 6/* sym */ || l.ty == 7/* key */) {

        completeProduction(49, 1, 40); stack_ptr -= 1;

        ; return;
    }
    else fail(l);
}
function $pre$import_preamble_HC_listbody4_105(l: Lexer): void {
    /*
pre$import_preamble_HC_listbody4_105=>• pre$import_preamble_HC_listbody4_105 θws|AS: 41;
pre$import_preamble_HC_listbody4_105=>• θws|AS
*/
    _skip(l, const_1_);
    if (l.ty == 1/* ws */) {

        _no_check(l);; stack_ptr++; State38(l);

    }
    else fail(l);
}
function State38(l: Lexer): void {
    /*
pre$import_preamble_HC_listbody4_105=>θws •|AS
*/
    _skip(l, const_1_);
    if (l.id == 54/* AS */ || l.id == 55/* as */ || l.ty == 0/* EOF */ || l.ty == 1/* ws */) {

        completeProduction(42, 1, 41); stack_ptr -= 1;

        ; return;
    }
    else fail(l);
}
function $pre$symbols_preamble_HC_listbody2_101(l: Lexer): void {
    /*
pre$symbols_preamble_HC_listbody2_101=>• pre$symbols_preamble_HC_listbody2_101 sym$lexer_symbol|θ: 31;
pre$symbols_preamble_HC_listbody2_101=>• sym$lexer_symbol|θ: 31
*/
    _skip(l, const_2_);
    if (l.id == 18/* τ */ || l.id == 19/* θ */ || l.id == 61/* g */ || l.id == 62/* t */ || l.id == 63/* \ */ || l.ty == 3/* id */ || l.ty == 6/* sym */) {

        $sym$lexer_symbol(l); stack_ptr++;

    } else if (!(l.ty == 0/* EOF */ || l.ty == 4/* nl */)) {

        $sym$lexer_symbol(l); stack_ptr++;

    }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 55: //sym$lexer_symbol
                State41(l);
                break;
            case 31: //pre$symbols_preamble_HC_listbody2_101
                _skip(l, const_2_);
                if (l.ty == 0/* EOF */ || l.ty == 4/* nl */) { return; }
                {
                    const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                    State40(cp);
                    if (FAILED) {
                        prod = p;
                        FAILED = false;
                        stack_ptr = s;
                        reset(m);
                        return;
                    } else l.sync(cp);
                }
                break;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State40(l: Lexer): void {
    /*
pre$symbols_preamble_HC_listbody2_101=>pre$symbols_preamble_HC_listbody2_101 • sym$lexer_symbol|θ: 31
*/
    _skip(l, const_2_);
    if (l.id == 18/* τ */ || l.id == 19/* θ */ || l.id == 61/* g */ || l.id == 62/* t */ || l.id == 63/* \ */ || l.ty == 3/* id */ || l.ty == 6/* sym */) {

        $sym$lexer_symbol(l); stack_ptr++;

    } else if (!(l.ty == 0/* EOF */ || l.ty == 4/* nl */)) {

        $sym$lexer_symbol(l); stack_ptr++;

    }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 55: //sym$lexer_symbol
                State216(l);
                break;
            case 31/*pre$symbols_preamble_HC_listbody2_101*/: return;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State41(l: Lexer): void {
    /*
pre$symbols_preamble_HC_listbody2_101=>sym$lexer_symbol •|θ
*/
    _skip(l, const_2_);
    if (idm41r.has(l.id)) { idm41r.get(l.id)(l); return; } else if (tym41r.has(l.ty)) { tym41r.get(l.ty)(l); return; }
    else fail(l);
}
function State53(l: Lexer): void {
    /*
sym$grouped_symbol=>sym$grouped_symbol_group_012_103 •|nl
*/
    if (!(!(false))) {

        completeProduction(49, 1, 59); stack_ptr -= 1;

        ; return;
    }
    else fail(l);
}
function $cm$comment_data(l: Lexer): void {
    /*
cm$comment_data=>• cm$comment_primitive|nl: 47;
cm$comment_data=>• cm$comment_data cm$comment_primitive|nl: 47
*/
    if (l.ty == 1/* ws */ || l.ty == 2/* num */ || l.ty == 3/* id */ || l.ty == 5/* tok */ || l.ty == 6/* sym */ || l.ty == 7/* key */) {

        $cm$comment_primitive(l); stack_ptr++;

    }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 48: //cm$comment_primitive
                State58(l);
                break;
            case 47: //cm$comment_data
                if (l.ty == 0/* EOF */ || l.ty == 4/* nl */) { return; }
                {
                    const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                    State59(cp);
                    if (FAILED) {
                        prod = p;
                        FAILED = false;
                        stack_ptr = s;
                        reset(m);
                        return;
                    } else l.sync(cp);
                }
                break;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State58(l: Lexer): void {
    /*
cm$comment_data=>cm$comment_primitive •|nl
*/
    if (tym58r.has(l.ty)) { tym58r.get(l.ty)(l); return; }
    else fail(l);
}
function State59(l: Lexer): void {
    /*
cm$comment_data=>cm$comment_data • cm$comment_primitive|nl: 47
*/
    if (l.ty == 1/* ws */ || l.ty == 2/* num */ || l.ty == 3/* id */ || l.ty == 5/* tok */ || l.ty == 6/* sym */ || l.ty == 7/* key */) {

        $cm$comment_primitive(l); stack_ptr++;

    }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 48: //cm$comment_primitive
                State223(l);
                break;
            case 47/*cm$comment_data*/: return;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function $sym$ignore_symbols(l: Lexer): void {
    /*
sym$ignore_symbols=>• sym$ignore_symbols sym$ignore_symbol|nl: 54;
sym$ignore_symbols=>• sym$ignore_symbol|nl: 54
*/
    _skip(l, const_2_);
    if (l.id == 18/* τ */ || l.id == 19/* θ */ || l.id == 61/* g */ || l.id == 62/* t */ || l.id == 63/* \ */) {

        $sym$ignore_symbol(l); stack_ptr++;

    } else if (!(l.ty == 0/* EOF */ || l.ty == 4/* nl */)) {

        $sym$ignore_symbol(l); stack_ptr++;

    }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 60: //sym$ignore_symbol
                State85(l);
                break;
            case 54: //sym$ignore_symbols
                _skip(l, const_2_);
                if (l.ty == 0/* EOF */ || l.ty == 4/* nl */) { return; }
                {
                    const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                    State84(cp);
                    if (FAILED) {
                        prod = p;
                        FAILED = false;
                        stack_ptr = s;
                        reset(m);
                        return;
                    } else l.sync(cp);
                }
                break;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State84(l: Lexer): void {
    /*
sym$ignore_symbols=>sym$ignore_symbols • sym$ignore_symbol|nl: 54
*/
    _skip(l, const_2_);
    if (l.id == 18/* τ */ || l.id == 19/* θ */ || l.id == 61/* g */ || l.id == 62/* t */ || l.id == 63/* \ */) {

        $sym$ignore_symbol(l); stack_ptr++;

    } else if (!(l.ty == 0/* EOF */ || l.ty == 4/* nl */)) {

        $sym$ignore_symbol(l); stack_ptr++;

    }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 60: //sym$ignore_symbol
                State232(l);
                break;
            case 54/*sym$ignore_symbols*/: return;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State85(l: Lexer): void {
    /*
sym$ignore_symbols=>sym$ignore_symbol •|nl
*/
    _skip(l, const_2_);
    if (idm85r.has(l.id)) { idm85r.get(l.id)(l); return; } else if (tym85r.has(l.ty)) { tym85r.get(l.ty)(l); return; }
    else fail(l);
}
function $sym$grouped_symbol(l: Lexer): void {
    /*
sym$grouped_symbol=>• sym$grouped_symbol sym$grouped_symbol_group_012_103|nl: 59;
sym$grouped_symbol=>• sym$grouped_symbol_group_012_103|nl: 59
*/
    if (l.ty == 3/* id */ || l.ty == 6/* sym */) {

        $sym$grouped_symbol_group_012_103(l); stack_ptr++;

    } else if (!(l.ty == 0/* EOF */ || l.ty == 1/* ws */ || l.ty == 4/* nl */)) {

        $sym$grouped_symbol_group_012_103(l); stack_ptr++;

    }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 59: //sym$grouped_symbol
                if (l.ty == 0/* EOF */ || l.ty == 1/* ws */ || l.ty == 4/* nl */) { return; }
                {
                    const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                    State87(cp);
                    if (FAILED) {
                        prod = p;
                        FAILED = false;
                        stack_ptr = s;
                        reset(m);
                        return;
                    } else l.sync(cp);
                }
                break;
            case 57: //sym$grouped_symbol_group_012_103
                State53(l);
                break;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State87(l: Lexer): void {
    /*
sym$grouped_symbol=>sym$grouped_symbol • sym$grouped_symbol_group_012_103|nl: 59
*/
    if (l.ty == 3/* id */ || l.ty == 6/* sym */) {

        $sym$grouped_symbol_group_012_103(l); stack_ptr++;

    } else if (!(l.ty == 0/* EOF */ || l.ty == 1/* ws */ || l.ty == 4/* nl */)) {

        $sym$grouped_symbol_group_012_103(l); stack_ptr++;

    }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 57: //sym$grouped_symbol_group_012_103
                State212(l);
                break;
            case 59/*sym$grouped_symbol*/: return;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function $sym$condition_symbol_list(l: Lexer): void {
    /*
sym$condition_symbol_list=>• sym$condition_symbol_list sym$terminal_symbol|): 50;
sym$condition_symbol_list=>• sym$terminal_symbol|): 50
*/
    _skip(l, const__);
    if (l.id == 18/* τ */ || l.id == 19/* θ */ || l.id == 59/* assert */ || l.id == 60/* shift */ || l.id == 61/* g */ || l.id == 62/* t */ || l.id == 63/* \ */) {

        $sym$terminal_symbol(l); stack_ptr++;

    } else if (!(l.id == 30/* ) */ || l.ty == 0/* EOF */)) {

        $sym$terminal_symbol(l); stack_ptr++;

    }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 61: //sym$terminal_symbol
                State93(l);
                break;
            case 50: //sym$condition_symbol_list
                _skip(l, const__);
                if (l.id == 30/* ) */ || l.ty == 0/* EOF */) { return; }
                {
                    const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                    State92(cp);
                    if (FAILED) {
                        prod = p;
                        FAILED = false;
                        stack_ptr = s;
                        reset(m);
                        return;
                    } else l.sync(cp);
                }
                break;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State92(l: Lexer): void {
    /*
sym$condition_symbol_list=>sym$condition_symbol_list • sym$terminal_symbol|): 50
*/
    _skip(l, const__);
    if (l.id == 18/* τ */ || l.id == 19/* θ */ || l.id == 59/* assert */ || l.id == 60/* shift */ || l.id == 61/* g */ || l.id == 62/* t */ || l.id == 63/* \ */) {

        $sym$terminal_symbol(l); stack_ptr++;

    } else if (!(l.id == 30/* ) */ || l.ty == 0/* EOF */)) {

        $sym$terminal_symbol(l); stack_ptr++;

    }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 61: //sym$terminal_symbol
                State242(l);
                break;
            case 50/*sym$condition_symbol_list*/: return;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State93(l: Lexer): void {
    /*
sym$condition_symbol_list=>sym$terminal_symbol •|)
*/
    _skip(l, const__);
    if (idm93r.has(l.id)) { idm93r.get(l.id)(l); return; } else if (tym93r.has(l.ty)) { tym93r.get(l.ty)(l); return; }
    else fail(l);
}
function $fn$js_data(l: Lexer): void {
    /*
fn$js_data=>• fn$js_primitive|}: 23;
fn$js_data=>• fn$js_data_block|}: 23;
fn$js_data=>• fn$js_data fn$js_primitive|}: 23;
fn$js_data=>• fn$js_data fn$js_data_block|}: 23;
fn$js_data=>•|}
*/
    _skip(l, const_1_);
    if (idm97.has(l.id)) { idm97.get(l.id)(l); } else if (tym97.has(l.ty)) { tym97.get(l.ty)(l); } else if (!(l.id == 38/* } */ || l.ty == 0/* EOF */)) {

        $fn$js_primitive(l); stack_ptr++;

    } else if (l.id == 21/* $eof */ || l.id == 38/* } */) {

        completeProduction(0, 0, 23); stack_ptr -= 0;

        ; return;
    }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 26: //fn$js_data_block
                State99(l);
                break;
            case 25: //fn$js_primitive
                State98(l);
                break;
            case 23: //fn$js_data
                _skip(l, const_1_);
                if (l.id == 38/* } */ || l.ty == 0/* EOF */) { return; }
                {
                    const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                    State100(cp);
                    if (FAILED) {
                        prod = p;
                        FAILED = false;
                        stack_ptr = s;
                        reset(m);
                        return;
                    } else l.sync(cp);
                }
                break;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State98(l: Lexer): void {
    /*
fn$js_data=>fn$js_primitive •|}
*/
    _skip(l, const_1_);
    if (idm99r.has(l.id)) { idm99r.get(l.id)(l); return; } else if (tym99r.has(l.ty)) { tym99r.get(l.ty)(l); return; }
    else fail(l);
}
function State99(l: Lexer): void {
    /*
fn$js_data=>fn$js_data_block •|}
*/
    _skip(l, const_1_);
    if (idm99r.has(l.id)) { idm99r.get(l.id)(l); return; } else if (tym99r.has(l.ty)) { tym99r.get(l.ty)(l); return; }
    else fail(l);
}
function State100(l: Lexer): void {
    /*
fn$js_data=>fn$js_data • fn$js_primitive|}: 23;
fn$js_data=>fn$js_data • fn$js_data_block|}: 23
*/
    _skip(l, const_1_);
    if (idm97.has(l.id)) { idm97.get(l.id)(l); } else if (tym97.has(l.ty)) { tym97.get(l.ty)(l); } else if (!(l.id == 38/* } */ || l.ty == 0/* EOF */)) {

        $fn$js_primitive(l); stack_ptr++;

    }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 26: //fn$js_data_block
                State248(l);
                break;
            case 25: //fn$js_primitive
                State247(l);
                break;
            case 23/*fn$js_data*/: return;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State160(l: Lexer): void {
    /*
def$js_id_symbols=>θkey •|id
*/
    if (idm181r.has(l.id)) { idm181r.get(l.id)(l); return; } else if (tym181r.has(l.ty)) { tym181r.get(l.ty)(l); return; }
    else fail(l);
}
function State165(l: Lexer): void {
    /*
prd$productions=>prd$productions prd$production •|$eof
*/
    _skip(l, const__);
    if (l.id == 12/* <> */ || l.id == 13/* +> */ || l.id == 45/* ↦ */ || l.id == 46/* f */ || l.id == 57/* # */ || l.ty == 0/* EOF */) {

        completeProduction(6, 2, 3); stack_ptr -= 2;

        ; return;
    }
    else fail(l);
}
function State166(l: Lexer): void {
    /*
prd$productions=>prd$productions cm$comment •|$eof
*/
    _skip(l, const__);
    if (l.id == 12/* <> */ || l.id == 13/* +> */ || l.id == 45/* ↦ */ || l.id == 46/* f */ || l.id == 57/* # */ || l.ty == 0/* EOF */) {

        completeProduction(1, 2, 3); stack_ptr -= 2;

        ; return;
    }
    else fail(l);
}
function State167(l: Lexer): void {
    /*
prd$productions=>prd$productions fn$referenced_function •|$eof
*/
    _skip(l, const__);
    if (l.id == 12/* <> */ || l.id == 13/* +> */ || l.id == 45/* ↦ */ || l.id == 46/* f */ || l.id == 57/* # */ || l.ty == 0/* EOF */) {

        completeProduction(7, 2, 3); stack_ptr -= 2;

        ; return;
    }
    else fail(l);
}
function $sym$symbol(l: Lexer): void {
    /*
sym$symbol=>• sym$generated_symbol|): 63;
sym$symbol=>• sym$production_symbol|): 63;
sym$symbol=>• sym$imported_production_symbol|): 63;
sym$symbol=>• sym$literal_symbol|): 63;
sym$symbol=>• sym$escaped_symbol|): 63;
sym$symbol=>• sym$assert_function_symbol|): 63;
sym$symbol=>• ( pb$production_bodies )|);
sym$symbol=>• sym$symbol ?|): 63;
sym$symbol=>• sym$symbol sym$symbol_group_032_105 sym$terminal_symbol )|): 63;
sym$symbol=>• θsym|);
sym$symbol=>• θtok|);
sym$symbol=>• sym$symbol sym$symbol_group_032_105 )|): 63
*/
    _skip(l, const__);
    if (idm168.has(l.id)) { idm168.get(l.id)(l); } else if (tym168.has(l.ty)) { tym168.get(l.ty)(l); }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 75: //sym$imported_production_symbol
                State171(l);
                break;
            case 74: //sym$production_symbol
                State170(l);
                break;
            case 73: //sym$escaped_symbol
                State173(l);
                break;
            case 71: //sym$literal_symbol
                State172(l);
                break;
            case 68: //sym$generated_symbol
                State169(l);
                break;
            case 66: //sym$assert_function_symbol
                State174(l);
                break;
            case 63: //sym$symbol
                _skip(l, const__);
                if (l.id == 30/* ) */ || l.ty == 0/* EOF */) { return; }
                {
                    const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                    State176(cp);
                    if (FAILED) {
                        prod = p;
                        FAILED = false;
                        stack_ptr = s;
                        reset(m);
                        return;
                    } else l.sync(cp);
                }
                break;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State169(l: Lexer): void {
    /*
sym$symbol=>sym$generated_symbol •|)
*/
    _skip(l, const__);
    if (idm178r.has(l.id)) { idm178r.get(l.id)(l); return; } else if (tym178r.has(l.ty)) { tym178r.get(l.ty)(l); return; }
    else fail(l);
}
function State170(l: Lexer): void {
    /*
sym$symbol=>sym$production_symbol •|)
*/
    _skip(l, const__);
    if (idm178r.has(l.id)) { idm178r.get(l.id)(l); return; } else if (tym178r.has(l.ty)) { tym178r.get(l.ty)(l); return; }
    else fail(l);
}
function State171(l: Lexer): void {
    /*
sym$symbol=>sym$imported_production_symbol •|)
*/
    _skip(l, const__);
    if (idm178r.has(l.id)) { idm178r.get(l.id)(l); return; } else if (tym178r.has(l.ty)) { tym178r.get(l.ty)(l); return; }
    else fail(l);
}
function State172(l: Lexer): void {
    /*
sym$symbol=>sym$literal_symbol •|)
*/
    _skip(l, const__);
    if (idm178r.has(l.id)) { idm178r.get(l.id)(l); return; } else if (tym178r.has(l.ty)) { tym178r.get(l.ty)(l); return; }
    else fail(l);
}
function State173(l: Lexer): void {
    /*
sym$symbol=>sym$escaped_symbol •|)
*/
    _skip(l, const__);
    if (idm178r.has(l.id)) { idm178r.get(l.id)(l); return; } else if (tym178r.has(l.ty)) { tym178r.get(l.ty)(l); return; }
    else fail(l);
}
function State174(l: Lexer): void {
    /*
sym$symbol=>sym$assert_function_symbol •|)
*/
    _skip(l, const__);
    if (idm178r.has(l.id)) { idm178r.get(l.id)(l); return; } else if (tym178r.has(l.ty)) { tym178r.get(l.ty)(l); return; }
    else fail(l);
}
function State175(l: Lexer): void {
    /*
sym$symbol=>( • pb$production_bodies )|): 63
*/
    _skip(l, const__);
    if (idm292.has(l.id)) { idm292.get(l.id)(l); } else if (tym292.has(l.ty)) { tym292.get(l.ty)(l); }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 63: //sym$symbol
                _skip(l, const__);
                if (const_7_.includes(l.id) || l.ty == 0/* EOF */ || l.ty == 3/* id */ || l.ty == 5/* tok */ || l.ty == 6/* sym */ || l.ty == 7/* key */) { return; }
                State234(l);
                break;
            case 15: //pb$body_entries
                State260(l);
                break;
            case 14: //pb$entries
                State258(l);
                break;
            case 13: //pb$production_body
                State255(l);
                break;
            case 12: //pb$production_bodies
                State308(l);
                break;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State176(l: Lexer): void {
    /*
sym$symbol=>sym$symbol • ?|);
sym$symbol=>sym$symbol • sym$symbol_group_032_105 sym$terminal_symbol )|): 63;
sym$symbol=>sym$symbol • sym$symbol_group_032_105 )|): 63
*/
    _skip(l, const__);
    if (idm234.has(l.id)) { idm234.get(l.id)(l); }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 62: //sym$symbol_group_032_105
                State281(l);
                break;
            case 63/*sym$symbol*/: return;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State177(l: Lexer): void {
    /*
sym$symbol=>θsym •|)
*/
    _skip(l, const__);
    if (idm177r.has(l.id)) { idm177r.get(l.id)(l); return; } else if (tym177r.has(l.ty)) { tym177r.get(l.ty)(l); return; }
    else fail(l);
}
function State178(l: Lexer): void {
    /*
sym$symbol=>θtok •|)
*/
    _skip(l, const__);
    if (idm178r.has(l.id)) { idm178r.get(l.id)(l); return; } else if (tym178r.has(l.ty)) { tym178r.get(l.ty)(l); return; }
    else fail(l);
}
function State181(l: Lexer): void {
    /*
def$js_id_symbols=>_ •|)
*/
    if (idm181r.has(l.id)) { idm181r.get(l.id)(l); return; } else if (tym181r.has(l.ty)) { tym181r.get(l.ty)(l); return; }
    else fail(l);
}
function State182(l: Lexer): void {
    /*
def$js_id_symbols=>$ •|)
*/
    if (idm181r.has(l.id)) { idm181r.get(l.id)(l); return; } else if (tym181r.has(l.ty)) { tym181r.get(l.ty)(l); return; }
    else fail(l);
}
function State183(l: Lexer): void {
    /*
def$js_id_symbols=>θid •|)
*/
    if (idm181r.has(l.id)) { idm181r.get(l.id)(l); return; } else if (tym181r.has(l.ty)) { tym181r.get(l.ty)(l); return; }
    else fail(l);
}
function State187(l: Lexer): void {
    /*
prd$production=>+> prd$production_group_013_103 • prd$production_start_symbol pb$production_bodies|$eof: 8
*/
    _skip(l, const__);
    if (l.id == 24/* → */ || l.id == 25/* > */) {

        $prd$production_start_symbol(l); stack_ptr++;

    }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 9: //prd$production_start_symbol
                State286(l);
                break;
            case 8/*prd$production*/: return;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State191(l: Lexer): void {
    /*
prd$production=><> prd$production_group_08_100 • prd$production_start_symbol pb$production_bodies prd$production_group_111_102|$eof: 8;
prd$production=><> prd$production_group_08_100 • prd$production_start_symbol pb$production_bodies|$eof: 8
*/
    _skip(l, const__);
    if (l.id == 24/* → */ || l.id == 25/* > */) {

        $prd$production_start_symbol(l); stack_ptr++;

    }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 9: //prd$production_start_symbol
                State291(l);
                break;
            case 8/*prd$production*/: return;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State192(l: Lexer): void {
    /*
prd$production=><> prd$production_group_013_103 • prd$production_start_symbol pb$production_bodies|$eof: 8
*/
    _skip(l, const__);
    if (l.id == 24/* → */ || l.id == 25/* > */) {

        $prd$production_start_symbol(l); stack_ptr++;

    }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 9: //prd$production_start_symbol
                State292(l);
                break;
            case 8/*prd$production*/: return;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State202(l: Lexer): void {
    /*
pre$preamble=>pre$preamble pre$preamble_clause •|<>
*/
    _skip(l, const__);
    if (l.id == 12/* <> */ || l.id == 13/* +> */ || l.id == 45/* ↦ */ || l.id == 46/* f */ || l.id == 47/* @ */ || l.id == 57/* # */ || l.ty == 0/* EOF */) {

        completeProduction(41, 2, 29); stack_ptr -= 2;

        ; return;
    }
    else fail(l);
}
function State209(l: Lexer): void {
    /*
pre$import_preamble_HC_listbody1_104=>pre$import_preamble_HC_listbody1_104 pre$import_preamble_group_019_103 •|ws
*/
    _skip(l, const_1_);
    if (l.ty == 0/* EOF */ || l.ty == 1/* ws */ || l.ty == 3/* id */ || l.ty == 5/* tok */ || l.ty == 6/* sym */ || l.ty == 7/* key */) {

        completeProduction(38, 2, 40); stack_ptr -= 2;

        ; return;
    }
    else fail(l);
}
function State212(l: Lexer): void {
    /*
sym$grouped_symbol=>sym$grouped_symbol sym$grouped_symbol_group_012_103 •|nl
*/
    if (!(!(false))) {

        completeProduction(38, 2, 59); stack_ptr -= 2;

        ; return;
    }
    else fail(l);
}
function State216(l: Lexer): void {
    /*
pre$symbols_preamble_HC_listbody2_101=>pre$symbols_preamble_HC_listbody2_101 sym$lexer_symbol •|θ
*/
    _skip(l, const_2_);
    if (idm216r.has(l.id)) { idm216r.get(l.id)(l); return; } else if (tym216r.has(l.ty)) { tym216r.get(l.ty)(l); return; }
    else fail(l);
}
function State223(l: Lexer): void {
    /*
cm$comment_data=>cm$comment_data cm$comment_primitive •|nl
*/
    if (tym223r.has(l.ty)) { tym223r.get(l.ty)(l); return; }
    else fail(l);
}
function State232(l: Lexer): void {
    /*
sym$ignore_symbols=>sym$ignore_symbols sym$ignore_symbol •|nl
*/
    _skip(l, const_2_);
    if (idm232r.has(l.id)) { idm232r.get(l.id)(l); return; } else if (tym232r.has(l.ty)) { tym232r.get(l.ty)(l); return; }
    else fail(l);
}
function $pb$body_entries(l: Lexer): void {
    /*
pb$body_entries=>• sym$symbol|): 15;
pb$body_entries=>• pb$condition_clause|): 15;
pb$body_entries=>• fn$function_clause|): 15;
pb$body_entries=>• pb$body_entries fn$function_clause|): 15;
pb$body_entries=>• pb$body_entries pb$condition_clause|): 15;
pb$body_entries=>• pb$body_entries sym$symbol|): 15;
pb$body_entries=>• [ pb$body_entries ]|)
*/
    _skip(l, const__);
    if (idm233.has(l.id)) { idm233.get(l.id)(l); } else if (tym233.has(l.ty)) { tym233.get(l.ty)(l); }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 63: //sym$symbol
                State234(l);
                break;
            case 22: //fn$function_clause
                State236(l);
                break;
            case 17: //pb$condition_clause
                State235(l);
                break;
            case 15: //pb$body_entries
                _skip(l, const__);
                if (l.id == 30/* ) */ || l.ty == 0/* EOF */) { return; }
                {
                    const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                    State237(cp);
                    if (FAILED) {
                        prod = p;
                        FAILED = false;
                        stack_ptr = s;
                        reset(m);
                        return;
                    } else l.sync(cp);
                }
                break;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State234(l: Lexer): void {
    /*
pb$body_entries=>sym$symbol •|);
sym$symbol=>sym$symbol • ?|);
sym$symbol=>sym$symbol • sym$symbol_group_032_105 sym$terminal_symbol )|): 63;
sym$symbol=>sym$symbol • sym$symbol_group_032_105 )|): 63
*/
    _skip(l, const__);
    if (idm234.has(l.id)) { idm234.get(l.id)(l); } else if (idm234r.has(l.id)) { idm234r.get(l.id)(l); return; } else if (tym234r.has(l.ty)) { tym234r.get(l.ty)(l); return; }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 62: //sym$symbol_group_032_105
                State281(l);
                break;
            case 15/*pb$body_entries*/:
            case 63/*sym$symbol*/: return;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State235(l: Lexer): void {
    /*
pb$body_entries=>pb$condition_clause •|)
*/
    _skip(l, const__);
    if (idm234r.has(l.id)) { idm234r.get(l.id)(l); return; } else if (tym234r.has(l.ty)) { tym234r.get(l.ty)(l); return; }
    else fail(l);
}
function State236(l: Lexer): void {
    /*
pb$body_entries=>fn$function_clause •|)
*/
    _skip(l, const__);
    if (idm234r.has(l.id)) { idm234r.get(l.id)(l); return; } else if (tym234r.has(l.ty)) { tym234r.get(l.ty)(l); return; }
    else fail(l);
}
function State237(l: Lexer): void {
    /*
pb$body_entries=>pb$body_entries • fn$function_clause|): 15;
pb$body_entries=>pb$body_entries • pb$condition_clause|): 15;
pb$body_entries=>pb$body_entries • sym$symbol|): 15
*/
    _skip(l, const__);
    if (idm237.has(l.id)) { idm237.get(l.id)(l); } else if (tym233.has(l.ty)) { tym233.get(l.ty)(l); }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 63: //sym$symbol
                State311(l);
                break;
            case 22: //fn$function_clause
                State309(l);
                break;
            case 17: //pb$condition_clause
                State310(l);
                break;
            case 15/*pb$body_entries*/: return;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State238(l: Lexer): void {
    /*
pb$body_entries=>[ • pb$body_entries ]|): 15
*/
    _skip(l, const__);
    if (idm238.has(l.id)) { idm238.get(l.id)(l); } else if (tym238.has(l.ty)) { tym238.get(l.ty)(l); }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 15: //pb$body_entries
                _skip(l, const__);
                if (l.id == 12/* <> */ || l.id == 13/* +> */ || l.id == 22/* │ */ || l.id == 23/* | */ || l.id == 30/* ) */ || l.id == 57/* # */ || l.ty == 0/* EOF */) { return; }
                State322(l);
                break;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State242(l: Lexer): void {
    /*
sym$condition_symbol_list=>sym$condition_symbol_list sym$terminal_symbol •|)
*/
    _skip(l, const__);
    if (idm242r.has(l.id)) { idm242r.get(l.id)(l); return; } else if (tym242r.has(l.ty)) { tym242r.get(l.ty)(l); return; }
    else fail(l);
}
function $def$js_id_symbols(l: Lexer): void {
    /*
def$js_id_symbols=>• def$js_id_symbols θid|id: 100;
def$js_id_symbols=>• def$js_id_symbols θkey|id: 100;
def$js_id_symbols=>• def$js_id_symbols _|id: 100;
def$js_id_symbols=>• def$js_id_symbols $|id: 100;
def$js_id_symbols=>• def$js_id_symbols θnum|id: 100;
def$js_id_symbols=>• def$js_id_symbols θhex|id: 100;
def$js_id_symbols=>• def$js_id_symbols θbin|id: 100;
def$js_id_symbols=>• def$js_id_symbols θoct|id: 100;
def$js_id_symbols=>• _|id;
def$js_id_symbols=>• $|id;
def$js_id_symbols=>• θid|id;
def$js_id_symbols=>• θkey|id
*/
    _skip(l, const_2_);
    if (idm243.has(l.id)) { idm243.get(l.id)(l); } else if (tym243.has(l.ty)) { tym243.get(l.ty)(l); }
    else fail(l);
}
function State247(l: Lexer): void {
    /*
fn$js_data=>fn$js_data fn$js_primitive •|}
*/
    _skip(l, const_1_);
    if (idm248r.has(l.id)) { idm248r.get(l.id)(l); return; } else if (tym248r.has(l.ty)) { tym248r.get(l.ty)(l); return; }
    else fail(l);
}
function State248(l: Lexer): void {
    /*
fn$js_data=>fn$js_data fn$js_data_block •|}
*/
    _skip(l, const_1_);
    if (idm248r.has(l.id)) { idm248r.get(l.id)(l); return; } else if (tym248r.has(l.ty)) { tym248r.get(l.ty)(l); return; }
    else fail(l);
}
function $pb$production_bodies(l: Lexer): void {
    /*
pb$production_bodies=>• pb$production_body|│: 12;
pb$production_bodies=>• pb$production_bodies pb$production_bodies_group_04_100 pb$production_body|│: 12;
pb$production_bodies=>• pb$production_bodies cm$comment|│: 12
*/
    _skip(l, const__);
    if (idm312.has(l.id)) { idm312.get(l.id)(l); } else if (tym312.has(l.ty)) { tym312.get(l.ty)(l); }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 13: //pb$production_body
                State255(l);
                break;
            case 12: //pb$production_bodies
                _skip(l, const__);
                if (l.id == 12/* <> */ || l.id == 13/* +> */ || l.id == 30/* ) */ || l.id == 45/* ↦ */ || l.id == 46/* f */ || l.ty == 0/* EOF */) { return; }
                {
                    const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                    State256(cp);
                    if (FAILED) {
                        prod = p;
                        FAILED = false;
                        stack_ptr = s;
                        reset(m);
                        return;
                    } else l.sync(cp);
                }
                break;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State255(l: Lexer): void {
    /*
pb$production_bodies=>pb$production_body •|│
*/
    _skip(l, const__);
    if (idm255r.has(l.id)) { idm255r.get(l.id)(l); return; } else if (tym255r.has(l.ty)) { tym255r.get(l.ty)(l); return; }
    else fail(l);
}
function State256(l: Lexer): void {
    /*
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|│: 12;
pb$production_bodies=>pb$production_bodies • cm$comment|│: 12
*/
    _skip(l, const__);
    if (idm352.has(l.id)) { idm352.get(l.id)(l); }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 44: //cm$comment
                State313(l);
                break;
            case 11: //pb$production_bodies_group_04_100
                State312(l);
                break;
            case 12/*pb$production_bodies*/: return;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State258(l: Lexer): void {
    /*
pb$production_body=>pb$entries •|│
*/
    _skip(l, const__);
    if (idm258r.has(l.id)) { idm258r.get(l.id)(l); return; } else if (tym258r.has(l.ty)) { tym258r.get(l.ty)(l); return; }
    else fail(l);
}
function State260(l: Lexer): void {
    /*
pb$entries=>pb$body_entries • fn$reduce_function|│: 14;
pb$entries=>pb$body_entries •|│;
pb$body_entries=>pb$body_entries • fn$function_clause|↦: 15;
pb$body_entries=>pb$body_entries • pb$condition_clause|↦: 15;
pb$body_entries=>pb$body_entries • sym$symbol|↦: 15
*/
    _skip(l, const__);
    if (idm260.has(l.id)) { idm260.get(l.id)(l); } else if (tym233.has(l.ty)) { tym233.get(l.ty)(l); } else if (idm260r.has(l.id)) { idm260r.get(l.id)(l); return; } else if (tym260r.has(l.ty)) { tym260r.get(l.ty)(l); return; }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 63: //sym$symbol
                State311(l);
                break;
            case 22: //fn$function_clause
                State309(l);
                break;
            case 21: //fn$reduce_function
                State334(l);
                break;
            case 17: //pb$condition_clause
                State310(l);
                break;
            case 14/*pb$entries*/:
            case 15/*pb$body_entries*/: return;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State280(l: Lexer): void {
    /*
sym$symbol=>sym$symbol ? •|)
*/
    _skip(l, const__);
    if (idm280r.has(l.id)) { idm280r.get(l.id)(l); return; } else if (tym280r.has(l.ty)) { tym280r.get(l.ty)(l); return; }
    else fail(l);
}
function State281(l: Lexer): void {
    /*
sym$symbol=>sym$symbol sym$symbol_group_032_105 • sym$terminal_symbol )|): 63;
sym$symbol=>sym$symbol sym$symbol_group_032_105 • )|)
*/
    _skip(l, const__);
    if (idm281.has(l.id)) { idm281.get(l.id)(l); } else if (!(const_6_.includes(l.id) || l.ty == 0/* EOF */ || l.ty == 3/* id */ || l.ty == 5/* tok */ || l.ty == 6/* sym */ || l.ty == 7/* key */)) {

        $sym$terminal_symbol(l); stack_ptr++;

    }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 61: //sym$terminal_symbol
                State323(l);
                break;
            case 63/*sym$symbol*/: return;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State286(l: Lexer): void {
    /*
prd$production=>+> prd$production_group_013_103 prd$production_start_symbol • pb$production_bodies|$eof: 8
*/
    _skip(l, const__);
    if (idm292.has(l.id)) { idm292.get(l.id)(l); } else if (tym292.has(l.ty)) { tym292.get(l.ty)(l); }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 12: //pb$production_bodies
                State350(l);
                break;
            case 8/*prd$production*/: return;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State291(l: Lexer): void {
    /*
prd$production=><> prd$production_group_08_100 prd$production_start_symbol • pb$production_bodies prd$production_group_111_102|$eof: 8;
prd$production=><> prd$production_group_08_100 prd$production_start_symbol • pb$production_bodies|$eof: 8
*/
    _skip(l, const__);
    if (idm292.has(l.id)) { idm292.get(l.id)(l); } else if (tym292.has(l.ty)) { tym292.get(l.ty)(l); }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 12: //pb$production_bodies
                State367(l);
                break;
            case 8/*prd$production*/: return;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State292(l: Lexer): void {
    /*
prd$production=><> prd$production_group_013_103 prd$production_start_symbol • pb$production_bodies|$eof: 8
*/
    _skip(l, const__);
    if (idm292.has(l.id)) { idm292.get(l.id)(l); } else if (tym292.has(l.ty)) { tym292.get(l.ty)(l); }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 12: //pb$production_bodies
                State352(l);
                break;
            case 8/*prd$production*/: return;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State308(l: Lexer): void {
    /*
sym$symbol=>( pb$production_bodies • )|);
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|): 12;
pb$production_bodies=>pb$production_bodies • cm$comment|): 12
*/
    _skip(l, const__);
    if (idm308.has(l.id)) { idm308.get(l.id)(l); }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 44: //cm$comment
                State313(l);
                break;
            case 11: //pb$production_bodies_group_04_100
                State312(l);
                break;
            case 63/*sym$symbol*/:
            case 12/*pb$production_bodies*/: return;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State309(l: Lexer): void {
    /*
pb$body_entries=>pb$body_entries fn$function_clause •|)
*/
    _skip(l, const__);
    if (idm311r.has(l.id)) { idm311r.get(l.id)(l); return; } else if (tym311r.has(l.ty)) { tym311r.get(l.ty)(l); return; }
    else fail(l);
}
function State310(l: Lexer): void {
    /*
pb$body_entries=>pb$body_entries pb$condition_clause •|)
*/
    _skip(l, const__);
    if (idm311r.has(l.id)) { idm311r.get(l.id)(l); return; } else if (tym311r.has(l.ty)) { tym311r.get(l.ty)(l); return; }
    else fail(l);
}
function State311(l: Lexer): void {
    /*
pb$body_entries=>pb$body_entries sym$symbol •|);
sym$symbol=>sym$symbol • ?|);
sym$symbol=>sym$symbol • sym$symbol_group_032_105 sym$terminal_symbol )|): 63;
sym$symbol=>sym$symbol • sym$symbol_group_032_105 )|): 63
*/
    _skip(l, const__);
    if (idm234.has(l.id)) { idm234.get(l.id)(l); } else if (idm311r.has(l.id)) { idm311r.get(l.id)(l); return; } else if (tym311r.has(l.ty)) { tym311r.get(l.ty)(l); return; }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 62: //sym$symbol_group_032_105
                State281(l);
                break;
            case 15/*pb$body_entries*/:
            case 63/*sym$symbol*/: return;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State312(l: Lexer): void {
    /*
pb$production_bodies=>pb$production_bodies pb$production_bodies_group_04_100 • pb$production_body|│: 12
*/
    _skip(l, const__);
    if (idm312.has(l.id)) { idm312.get(l.id)(l); } else if (tym312.has(l.ty)) { tym312.get(l.ty)(l); }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 13: //pb$production_body
                State388(l);
                break;
            case 12/*pb$production_bodies*/: return;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State313(l: Lexer): void {
    /*
pb$production_bodies=>pb$production_bodies cm$comment •|│
*/
    _skip(l, const__);
    if (idm313r.has(l.id)) { idm313r.get(l.id)(l); return; } else if (tym313r.has(l.ty)) { tym313r.get(l.ty)(l); return; }
    else fail(l);
}
function State322(l: Lexer): void {
    /*
pb$body_entries=>[ pb$body_entries • ]|);
pb$body_entries=>pb$body_entries • fn$function_clause|]: 15;
pb$body_entries=>pb$body_entries • pb$condition_clause|]: 15;
pb$body_entries=>pb$body_entries • sym$symbol|]: 15
*/
    _skip(l, const__);
    if (idm322.has(l.id)) { idm322.get(l.id)(l); } else if (tym233.has(l.ty)) { tym233.get(l.ty)(l); }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 63: //sym$symbol
                State311(l);
                break;
            case 22: //fn$function_clause
                State309(l);
                break;
            case 17: //pb$condition_clause
                State310(l);
                break;
            case 15/*pb$body_entries*/: return;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State323(l: Lexer): void {
    /*
sym$symbol=>sym$symbol sym$symbol_group_032_105 sym$terminal_symbol • )|)
*/
    _skip(l, const__);
    if (l.id == 30/* ) */) {

        _no_check(l);; stack_ptr++; State351(l);

    }
    else fail(l);
}
function State324(l: Lexer): void {
    /*
sym$symbol=>sym$symbol sym$symbol_group_032_105 ) •|)
*/
    _skip(l, const__);
    if (idm324r.has(l.id)) { idm324r.get(l.id)(l); return; } else if (tym324r.has(l.ty)) { tym324r.get(l.ty)(l); return; }
    else fail(l);
}
function State334(l: Lexer): void {
    /*
pb$entries=>pb$body_entries fn$reduce_function •|│
*/
    _skip(l, const__);
    if (idm334r.has(l.id)) { idm334r.get(l.id)(l); return; } else if (tym334r.has(l.ty)) { tym334r.get(l.ty)(l); return; }
    else fail(l);
}
function State343(l: Lexer): void {
    /*
sym$symbol=>( pb$production_bodies ) •|)
*/
    _skip(l, const__);
    if (idm324r.has(l.id)) { idm324r.get(l.id)(l); return; } else if (tym324r.has(l.ty)) { tym324r.get(l.ty)(l); return; }
    else fail(l);
}
function State350(l: Lexer): void {
    /*
prd$production=>+> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies •|$eof;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|$eof: 12;
pb$production_bodies=>pb$production_bodies • cm$comment|$eof: 12
*/
    _skip(l, const__);
    if (idm352.has(l.id)) { idm352.get(l.id)(l); } else if (l.id == 12/* <> */ || l.id == 13/* +> */ || l.id == 45/* ↦ */ || l.id == 46/* f */ || l.id == 57/* # */ || l.ty == 0/* EOF */) {

        completeProduction(11, 4, 8); stack_ptr -= 4;

        ; return;
    }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 44: //cm$comment
                State313(l);
                break;
            case 11: //pb$production_bodies_group_04_100
                State312(l);
                break;
            case 8/*prd$production*/:
            case 12/*pb$production_bodies*/: return;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State351(l: Lexer): void {
    /*
sym$symbol=>sym$symbol sym$symbol_group_032_105 sym$terminal_symbol ) •|)
*/
    _skip(l, const__);
    if (idm351r.has(l.id)) { idm351r.get(l.id)(l); return; } else if (tym351r.has(l.ty)) { tym351r.get(l.ty)(l); return; }
    else fail(l);
}
function State352(l: Lexer): void {
    /*
prd$production=><> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies •|$eof;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|$eof: 12;
pb$production_bodies=>pb$production_bodies • cm$comment|$eof: 12
*/
    _skip(l, const__);
    if (idm352.has(l.id)) { idm352.get(l.id)(l); } else if (l.id == 12/* <> */ || l.id == 13/* +> */ || l.id == 45/* ↦ */ || l.id == 46/* f */ || l.id == 57/* # */ || l.ty == 0/* EOF */) {

        completeProduction(10, 4, 8); stack_ptr -= 4;

        ; return;
    }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 44: //cm$comment
                State313(l);
                break;
            case 11: //pb$production_bodies_group_04_100
                State312(l);
                break;
            case 8/*prd$production*/:
            case 12/*pb$production_bodies*/: return;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State353(l: Lexer): void {
    /*
pb$body_entries=>[ pb$body_entries ] •|│
*/
    _skip(l, const__);
    if (idm353r.has(l.id)) { idm353r.get(l.id)(l); return; } else if (tym353r.has(l.ty)) { tym353r.get(l.ty)(l); return; }
    else fail(l);
}
function State367(l: Lexer): void {
    /*
prd$production=><> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies • prd$production_group_111_102|$eof: 8;
prd$production=><> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies •|$eof;
pb$production_bodies=>pb$production_bodies • pb$production_bodies_group_04_100 pb$production_body|│: 12;
pb$production_bodies=>pb$production_bodies • cm$comment|│: 12
*/
    _skip(l, const__);
    if (idm367.has(l.id)) { idm367.get(l.id)(l); } else if (l.id == 12/* <> */ || l.id == 13/* +> */ || l.id == 45/* ↦ */ || l.id == 46/* f */ || l.id == 57/* # */ || l.ty == 0/* EOF */) {

        completeProduction(12, 4, 8); stack_ptr -= 4;

        ; return;
    }
    else fail(l);
    const sp: u32 = stack_ptr;
    while (sp <= stack_ptr) {
        switch (prod) {
            case 44: //cm$comment
                State313(l);
                break;
            case 11: //pb$production_bodies_group_04_100
                State312(l);
                break;
            case 6: //prd$production_group_111_102
                State378(l);
                break;
            case 8/*prd$production*/:
            case 12/*pb$production_bodies*/: return;
            default: fail(l); return;
        }
        if (prod >= 0) stack_ptr++;
    }
}
function State378(l: Lexer): void {
    /*
prd$production=><> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies prd$production_group_111_102 •|$eof
*/
    _skip(l, const__);
    if (l.id == 12/* <> */ || l.id == 13/* +> */ || l.id == 45/* ↦ */ || l.id == 46/* f */ || l.id == 57/* # */ || l.ty == 0/* EOF */) {

        completeProduction(9, 5, 8); stack_ptr -= 5;

        ; return;
    }
    else fail(l);
}
function State388(l: Lexer): void {
    /*
pb$production_bodies=>pb$production_bodies pb$production_bodies_group_04_100 pb$production_body •|│
*/
    _skip(l, const__);
    if (idm388r.has(l.id)) { idm388r.get(l.id)(l); return; } else if (tym388r.has(l.ty)) { tym388r.get(l.ty)(l); return; }
    else fail(l);
}
function $prd$production(l: Lexer): void {
    /*
prd$production=>• <> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies prd$production_group_111_102|$eof;
prd$production=>• <> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies|$eof;
prd$production=>• +> prd$production_group_013_103 prd$production_start_symbol pb$production_bodies|$eof;
prd$production=>• <> prd$production_group_08_100 prd$production_start_symbol pb$production_bodies|$eof
*/
    _skip(l, const__);
    if (idm399.has(l.id)) { idm399.get(l.id)(l); }
    else fail(l);
}

function reset_pointers(): void {
    prod = -1;

    stack_ptr = 0;

    error_ptr = 0;

    action_ptr = 0;
}

export default function main(input_string: string): boolean {

    str = input_string;

    const lex = new Lexer();

    lex.next();

    reset_pointers();

    FAILED = false;

    $hydrocarbon(lex);

    set_action(0);

    set_error(0);

    return FAILED || !lex.END;
}