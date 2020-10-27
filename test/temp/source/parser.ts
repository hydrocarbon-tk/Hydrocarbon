

var str: string = "", FAILED: boolean = false, prod: i32 = -1, stack_ptr: u32 = 0;


const TokenSpace: i32 = 1,
    TokenNumber: i32 = 2,
    TokenIdentifier: i32 = 3,
    TokenNewLine: i32 = 4,
    TokenSymbol: i32 = 5;

const jump_table: Uint16Array = new Uint16Array(191488);

export { jump_table };

const id: u16 = 2, num: u16 = 4, hex: u16 = 16, oct: u16 = 32, bin: u16 = 64;

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
            length: i32 = this.tl,
            off: i32 = this.off + length,
            type: i32 = 0,
            base: i32 = off;

        this.ty = 0;
        this.id = 0;

        if (off >= str.length) {
            this.off = l;
            this.tl = 0;
            return this;
        }

        const code: i32 = str.codePointAt(off);

        switch (unchecked(jump_table[code]) & 255) {
            default:
            case 0: //SYMBOL
                type = TokenSymbol;
                break;
            case 1: //IDENTIFIER
                while (1) {
                    while (++off < l && (((id | num) & (unchecked(jump_table[str.codePointAt(off)]) >> 8))));
                    type = TokenIdentifier;
                    length = off - base;
                    break;
                } break;
            case 2: //SPACE SET
                ++off;
                type = TokenSpace;
                length = off - base;
                break;
            case 3: //CARRIAGE RETURN
                length = 2;
            //intentional
            case 4: //LINEFEED
                type = TokenNewLine;
                base = off;
                off += length;
                break;
            case 5: //NUMBER
                type = TokenNumber;
                //Check for binary, hexadecimal, and octal representation
                while (++off < l && (num & (unchecked(jump_table[str.codePointAt(off)]) >> 8)));
                length = off - base;
                break;
        }
        if (type == TokenIdentifier) {
            const val: u32 = str.charCodeAt(base + 0);
            if (val == 115) {
                if (length <= 1) { this.id = 55; length = 1; }
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 117) {
                    const val: u32 = str.charCodeAt(base + 2);
                    if (val == 112) {
                        const val: u32 = str.charCodeAt(base + 3);
                        if (val == 112) {
                            const val: u32 = str.charCodeAt(base + 4);
                            if (val == 111) {
                                const val: u32 = str.charCodeAt(base + 5);
                                if (val == 114) {
                                    const val: u32 = str.charCodeAt(base + 6);
                                    if (val == 116) {
                                        const val: u32 = str.charCodeAt(base + 7);
                                        if (val == 115) {
                                            if (length <= 8) { this.id = 14; length = 8; }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                else if (val == 101) {
                    const val: u32 = str.charCodeAt(base + 2);
                    if (val == 108) {
                        const val: u32 = str.charCodeAt(base + 3);
                        if (val == 101) {
                            const val: u32 = str.charCodeAt(base + 4);
                            if (val == 99) {
                                const val: u32 = str.charCodeAt(base + 5);
                                if (val == 116) {
                                    const val: u32 = str.charCodeAt(base + 6);
                                    if (val == 111) {
                                        const val: u32 = str.charCodeAt(base + 7);
                                        if (val == 114) {
                                            if (length <= 8) { this.id = 25; length = 8; }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            else if (val == 105) {
                if (length <= 1) { this.id = 54; length = 1; }
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 109) {
                    const val: u32 = str.charCodeAt(base + 2);
                    if (val == 112) {
                        const val: u32 = str.charCodeAt(base + 3);
                        if (val == 111) {
                            const val: u32 = str.charCodeAt(base + 4);
                            if (val == 114) {
                                const val: u32 = str.charCodeAt(base + 5);
                                if (val == 116) {
                                    if (length <= 6) { this.id = 18; length = 6; }
                                    const val: u32 = str.charCodeAt(base + 6);
                                    if (val == 97) {
                                        const val: u32 = str.charCodeAt(base + 7);
                                        if (val == 110) {
                                            const val: u32 = str.charCodeAt(base + 8);
                                            if (val == 116) {
                                                if (length <= 9) { this.id = 57; length = 9; }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            else if (val == 107) {
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 101) {
                    const val: u32 = str.charCodeAt(base + 2);
                    if (val == 121) {
                        const val: u32 = str.charCodeAt(base + 3);
                        if (val == 102) {
                            const val: u32 = str.charCodeAt(base + 4);
                            if (val == 114) {
                                const val: u32 = str.charCodeAt(base + 5);
                                if (val == 97) {
                                    const val: u32 = str.charCodeAt(base + 6);
                                    if (val == 109) {
                                        const val: u32 = str.charCodeAt(base + 7);
                                        if (val == 101) {
                                            const val: u32 = str.charCodeAt(base + 8);
                                            if (val == 115) {
                                                if (length <= 9) { this.id = 19; length = 9; }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            else if (val == 102) {
                if (length <= 1) { this.id = 66; length = 1; }
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 114) {
                    const val: u32 = str.charCodeAt(base + 2);
                    if (val == 111) {
                        const val: u32 = str.charCodeAt(base + 3);
                        if (val == 109) {
                            if (length <= 4) { this.id = 20; length = 4; }
                        }
                    }
                }
                else if (val == 97) {
                    const val: u32 = str.charCodeAt(base + 2);
                    if (val == 108) {
                        const val: u32 = str.charCodeAt(base + 3);
                        if (val == 115) {
                            const val: u32 = str.charCodeAt(base + 4);
                            if (val == 101) {
                                if (length <= 5) { this.id = 35; length = 5; }
                            }
                        }
                    }
                }
            }
            else if (val == 116) {
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 111) {
                    if (length <= 2) { this.id = 21; length = 2; }
                }
                else if (val == 114) {
                    const val: u32 = str.charCodeAt(base + 2);
                    if (val == 117) {
                        const val: u32 = str.charCodeAt(base + 3);
                        if (val == 101) {
                            if (length <= 4) { this.id = 34; length = 4; }
                        }
                    }
                }
            }
            else if (val == 97) {
                if (length <= 1) { this.id = 61; length = 1; }
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 110) {
                    const val: u32 = str.charCodeAt(base + 2);
                    if (val == 100) {
                        if (length <= 3) { this.id = 22; length = 3; }
                    }
                }
            }
            else if (val == 111) {
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 114) {
                    if (length <= 2) { this.id = 23; length = 2; }
                }
                else if (val == 110) {
                    const val: u32 = str.charCodeAt(base + 2);
                    if (val == 108) {
                        const val: u32 = str.charCodeAt(base + 3);
                        if (val == 121) {
                            if (length <= 4) { this.id = 27; length = 4; }
                        }
                    }
                }
            }
            else if (val == 110) {
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 111) {
                    const val: u32 = str.charCodeAt(base + 2);
                    if (val == 116) {
                        if (length <= 3) { this.id = 24; length = 3; }
                    }
                }
            }
            else if (val == 109) {
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 101) {
                    const val: u32 = str.charCodeAt(base + 2);
                    if (val == 100) {
                        const val: u32 = str.charCodeAt(base + 3);
                        if (val == 105) {
                            const val: u32 = str.charCodeAt(base + 4);
                            if (val == 97) {
                                if (length <= 5) { this.id = 26; length = 5; }
                            }
                        }
                    }
                }
            }
            else if (val == 117) {
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 114) {
                    const val: u32 = str.charCodeAt(base + 2);
                    if (val == 108) {
                        if (length <= 3) { this.id = 38; length = 3; }
                    }
                }
            }
            else if (val == 98) {
                if (length <= 1) { this.id = 62; length = 1; }
            }
            else if (val == 99) {
                if (length <= 1) { this.id = 63; length = 1; }
            }
            else if (val == 100) {
                if (length <= 1) { this.id = 64; length = 1; }
            }
            else if (val == 101) {
                if (length <= 1) { this.id = 65; length = 1; }
            }
            else if (val == 65) {
                if (length <= 1) { this.id = 67; length = 1; }
            }
            else if (val == 66) {
                if (length <= 1) { this.id = 68; length = 1; }
            }
            else if (val == 67) {
                if (length <= 1) { this.id = 69; length = 1; }
            }
            else if (val == 68) {
                if (length <= 1) { this.id = 70; length = 1; }
            }
            else if (val == 69) {
                if (length <= 1) { this.id = 71; length = 1; }
            }
            else if (val == 70) {
                if (length <= 1) { this.id = 72; length = 1; }
            }
        }
        if (type == TokenSymbol) {
            const val: u32 = str.charCodeAt(base + 0);
            if (val == 44) {
                this.id = 10; length = 1;
            }
            else if (val == 123) {
                this.id = 11; length = 1;
            }
            else if (val == 59) {
                this.id = 12; length = 1;
            }
            else if (val == 125) {
                this.id = 13; length = 1;
            }
            else if (val == 40) {
                this.id = 15; length = 1;
            }
            else if (val == 41) {
                this.id = 16; length = 1;
            }
            else if (val == 64) {
                this.id = 17; length = 1;
            }
            else if (val == 58) {
                this.id = 28; length = 1;
            }
            else if (val == 60) {
                this.id = 29; length = 1;
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 61) {
                    this.id = 30; length = 2;
                }
            }
            else if (val == 62) {
                this.id = 40; length = 1;
                this.id = 31; length = 1;
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 61) {
                    this.id = 32; length = 2;
                }
            }
            else if (val == 61) {
                this.id = 33; length = 1;
            }
            else if (val == 47) {
                this.id = 74; length = 1;
                this.id = 36; length = 1;
            }
            else if (val == 37) {
                this.id = 37; length = 1;
            }
            else if (val == 34) {
                this.id = 39; length = 1;
            }
            else if (val == 43) {
                this.id = 41; length = 1;
            }
            else if (val == 126) {
                this.id = 50; length = 1;
                this.id = 42; length = 1;
            }
            else if (val == 124) {
                this.id = 45; length = 1;
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 124) {
                    this.id = 43; length = 2;
                }
            }
            else if (val == 42) {
                this.id = 44; length = 1;
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 61) {
                    this.id = 53; length = 2;
                }
            }
            else if (val == 35) {
                this.id = 46; length = 1;
            }
            else if (val == 46) {
                this.id = 47; length = 1;
            }
            else if (val == 91) {
                this.id = 48; length = 1;
            }
            else if (val == 93) {
                this.id = 49; length = 1;
            }
            else if (val == 94) {
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 61) {
                    this.id = 51; length = 2;
                }
            }
            else if (val == 36) {
                this.id = 60; length = 1;
                const val: u32 = str.charCodeAt(base + 1);
                if (val == 61) {
                    this.id = 52; length = 2;
                }
            }
            else if (val == 33) {
                this.id = 56; length = 1;
            }
            else if (val == 95) {
                this.id = 58; length = 1;
            }
            else if (val == 45) {
                this.id = 59; length = 1;
            }
            else if (val == 39) {
                this.id = 73; length = 1;
            }
            else if (val == 92) {
                this.id = 75; length = 1;
            }
        }

        this.ty = type;
        this.off = base;
        this.tl = length;

        return this;
    }
    get pk(): Lexer { return this.peek(); }
    get n(): Lexer { return this.next(); }
    get END(): boolean { return this.off >= str.length; }
}

var

    action_array: Uint32Array = new Uint32Array(1048576),
    error_array: Uint32Array = new Uint32Array(512),
    mark_: u32 = 0,
    pointer: u32 = 0,
    error_ptr: u32 = 0;

@inline
function mark(): u32 {
    mark_ = pointer;
    return mark_;
}

@inline
function reset(mark: u32): void {
    pointer = mark;
}

@inline
function add_skip(char_len: u32): void {
    const ACTION: u32 = 3;
    const val: u32 = ACTION | (char_len << 2);
    unchecked(action_array[pointer++] = val);
}

@inline
function add_shift(char_len: u32): void {
    if (char_len < 1) return;
    const ACTION: u32 = 2;
    const val: u32 = ACTION | (char_len << 2);
    unchecked(action_array[pointer++] = val);
}

@inline
function add_reduce(sym_len: u32, body: u32): void {
    const ACTION: u32 = 1;
    const val: u32 = ACTION | ((sym_len & 0x3FFF) << 2) | (body << 16);
    unchecked(action_array[pointer++] = val);
}


@inline
function lm(lex: Lexer, syms: u32[]): boolean {

    const l = syms.length;

    for (let i = 0; i < l; i++) {
        const sym = syms[i];
        if (lex.id == sym || lex.ty == sym) return true;
    }

    return false;
}

@inline
function fail(lex: Lexer): void {
    FAILED = true;
    error_array[error_ptr++] = lex.off;
}


function _(lex: Lexer, /* eh, */ skips: u32[], sym: u32 = 0): void {

    if (FAILED) return;

    if (sym == 0 || lex.id == sym || lex.ty == sym) {

        add_shift(lex.tl);

        lex.next();

        const off: u32 = lex.off;

        if (skips) while (lm(lex, skips)) lex.next();

        const diff: i32 = lex.off - off;

        if (diff > 0) add_skip(diff);
    } else {

        //TODO error recovery

        FAILED = true;
        error_array[error_ptr++] = lex.off;
    }
}


function $CSS(l: Lexer): void {

    if (FAILED) return;
    $STYLE_SHEET(l);
    prod = (FAILED) ? -1 : 0;

    return;
    FAILED = true;
}

function $STYLE_SHEET_group_03_101(l: Lexer): void {
    const id: u32 = l.id, ty: u32 = l.ty;
    if (id == 17/* @ */) {

        if (FAILED) return;
        $AT_RULE(l);
        prod = (FAILED) ? -1 : 2;

        return;
    }
    if (id == 44/* * */ || id == 45/* | */ || id == 60/* $ */ || ty == 3/* id */ || id == 59/* - */ || id == 46/* # */ || id == 47/* . */ || id == 48/* [ */ || id == 28/* : */) {

        if (FAILED) return;
        $STYLE_RULE(l);
        prod = (FAILED) ? -1 : 2;

        return;
    }
    FAILED = true;
}







function $import_group_012_105(l: Lexer): void {
    const id: u32 = l.id;
    if (id == 39/* " */) {

        if (FAILED) return;
        $string(l);
        prod = (FAILED) ? -1 : 10;

        return;
    }
    if (id == 38/* url */) {

        if (FAILED) return;
        $url(l);
        prod = (FAILED) ? -1 : 10;

        return;
    }
    FAILED = true;
}

function $import_group_315_107(l: Lexer): void {

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 14/* supports */);

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 15/* ( */);

    if (FAILED) return;
    $import_group_014_106(l);

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 16/* ) */);
    prod = (FAILED) ? -1 : 12;

    add_reduce(4, 33);
    return;
    FAILED = true;
}

function $import(l: Lexer): void {

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 17/* @ */);

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 18/* import */);

    if (FAILED) return;
    $import_group_012_105(l);
    const id: u32 = l.id, ty: u32 = l.ty;
    if (id == 14/* supports */) {

        if (FAILED) return;
        $import_group_315_107(l);
        const id: u32 = l.id, ty: u32 = l.ty;
        if (id == 24/* not */ || id == 15/* ( */ || id == 60/* $ */ || ty == 3/* id */ || id == 59/* - */ || id == 27/* only */) {

            if (FAILED) return;
            $import_HC_listbody5_108(l);
            prod = (FAILED) ? -1 : 14;

            add_reduce(5, 36);
            return;
        }
        prod = (FAILED) ? -1 : 14;

        add_reduce(4, 38);
        return;
    }
    if (id == 24/* not */ || id == 15/* ( */ || id == 60/* $ */ || ty == 3/* id */ || id == 59/* - */ || id == 27/* only */) {

        if (FAILED) return;
        $import_HC_listbody5_108(l);
        prod = (FAILED) ? -1 : 14;

        add_reduce(4, 37);
        return;
    }
    prod = (FAILED) ? -1 : 14;

    add_reduce(3, 39);
    return;
    FAILED = true;
}
function $import_declaration(l: Lexer): void {

    if (FAILED) return;
    $declaration(l);
    prod = (FAILED) ? -1 : 15;

    return;
    FAILED = true;
}

function $keyframes(l: Lexer): void {

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 17/* @ */);

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 19/* keyframes */);

    if (FAILED) return;
    $keyframes_name(l);

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 11/* { */);

    if (FAILED) return;
    $keyframes_HC_listbody5_109(l);

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 13/* } */);
    prod = (FAILED) ? -1 : 17;

    add_reduce(6, 43);
    return;
    FAILED = true;
}
function $keyframes_name(l: Lexer): void {
    const id: u32 = l.id, ty: u32 = l.ty;
    if (ty == 3/* id */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 3/* id */);
        prod = (FAILED) ? -1 : 18;

        return;
    }
    if (id == 39/* " */) {

        if (FAILED) return;
        $string(l);
        prod = (FAILED) ? -1 : 18;

        return;
    }
    FAILED = true;
}

function $keyframes_blocks(l: Lexer): void {

    if (FAILED) return;
    $keyframes_blocks_HC_listbody1_110(l);

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 11/* { */);

    if (FAILED) return;
    $declaration_list(l);
    const id: u32 = l.id;
    if (id == 12/* ; */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 12/* ; */);

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 13/* } */);
        prod = (FAILED) ? -1 : 20;

        add_reduce(5, 48);
        return;
    }
    if (id == 13/* } */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 13/* } */);
        prod = (FAILED) ? -1 : 20;

        add_reduce(4, 49);
        return;
    }
    FAILED = true;
}
function $keyframe_selector(l: Lexer): void {
    const id: u32 = l.id, ty: u32 = l.ty;
    if (id == 20/* from */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 20/* from */);
        prod = (FAILED) ? -1 : 21;

        add_reduce(1, 50);
        return;
    }
    if (id == 21/* to */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 21/* to */);
        prod = (FAILED) ? -1 : 21;

        add_reduce(1, 51);
        return;
    }
    if (ty == 2/* num */) {

        if (FAILED) return;
        $percentage(l);
        prod = (FAILED) ? -1 : 21;

        add_reduce(1, 52);
        return;
    }
    FAILED = true;
}
function $supports_group_025_111(l: Lexer): void {

    if (FAILED) return;
    $supports_condition(l);
    prod = (FAILED) ? -1 : 22;

    add_reduce(1, 53);
    return;
    FAILED = true;
}
function $supports(l: Lexer): void {

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 17/* @ */);

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 14/* supports */);

    if (FAILED) return;
    $supports_group_025_111(l);

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 11/* { */);
    const id: u32 = l.id, ty: u32 = l.ty;
    if (id == 13/* } */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 13/* } */);
        prod = (FAILED) ? -1 : 23;

        add_reduce(5, 55);
        return;
    }
    if (id == 44/* * */ || id == 45/* | */ || id == 60/* $ */ || ty == 3/* id */ || id == 59/* - */ || id == 46/* # */ || id == 47/* . */ || id == 48/* [ */ || id == 28/* : */) {

        if (FAILED) return;
        $GROUP_RULE_BODY(l);

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 13/* } */);
        prod = (FAILED) ? -1 : 23;

        add_reduce(6, 54);
        return;
    }
    FAILED = true;
}
function $supports_condition_group_129_112(l: Lexer): void {
    const id: u32 = l.id;
    if (id == 22/* and */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 22/* and */);

        if (FAILED) return;
        $supports_in_parens(l);
        prod = (FAILED) ? -1 : 24;

        add_reduce(2, 56);
        return;
    }
    if (id == 23/* or */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 23/* or */);

        if (FAILED) return;
        $supports_in_parens(l);
        prod = (FAILED) ? -1 : 24;

        add_reduce(2, 57);
        return;
    }
    FAILED = true;
}

function $supports_condition(l: Lexer): void {
    const id: u32 = l.id, ty: u32 = l.ty;
    if (id == 24/* not */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 24/* not */);

        if (FAILED) return;
        $supports_in_parens(l);
        prod = (FAILED) ? -1 : 26;

        add_reduce(2, 60);
        return;
    }
    if (id == 15/* ( */ || id == 25/* selector */ || id == 60/* $ */ || ty == 3/* id */ || id == 59/* - */) {

        if (FAILED) return;
        $supports_in_parens(l);
        const id: u32 = l.id;
        if (id == 22/* and */ || id == 23/* or */) {

            if (FAILED) return;
            $supports_condition_HC_listbody2_113(l);
            prod = (FAILED) ? -1 : 26;

            add_reduce(2, 61);
            return;
        }
        prod = (FAILED) ? -1 : 26;

        add_reduce(1, 62);
        return;
    }
    FAILED = true;
}

function $supports_feature(l: Lexer): void {
    const id: u32 = l.id;
    if (id == 25/* selector */) {

        if (FAILED) return;
        $supports_feature_fn(l);
        prod = (FAILED) ? -1 : 28;

        return;
    }
    if (id == 15/* ( */) {

        if (FAILED) return;
        $supports_decl(l);
        prod = (FAILED) ? -1 : 28;

        return;
    }
    FAILED = true;
}
function $supports_decl(l: Lexer): void {

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 15/* ( */);

    if (FAILED) return;
    $declaration(l);

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 16/* ) */);
    prod = (FAILED) ? -1 : 29;

    add_reduce(3, 68);
    return;
    FAILED = true;
}
function $supports_feature_fn(l: Lexer): void {

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 25/* selector */);

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 15/* ( */);

    if (FAILED) return;
    $COMPLEX_SELECTOR(l);

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 16/* ) */);
    prod = (FAILED) ? -1 : 30;

    add_reduce(4, 69);
    return;
    FAILED = true;
}
function $media(l: Lexer): void {

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 17/* @ */);

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 26/* media */);

    if (FAILED) return;
    $media_queries(l);

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 11/* { */);
    const id: u32 = l.id, ty: u32 = l.ty;
    if (id == 13/* } */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 13/* } */);
        prod = (FAILED) ? -1 : 31;

        add_reduce(5, 71);
        return;
    }
    if (id == 44/* * */ || id == 45/* | */ || id == 60/* $ */ || ty == 3/* id */ || id == 59/* - */ || id == 46/* # */ || id == 47/* . */ || id == 48/* [ */ || id == 28/* : */) {

        if (FAILED) return;
        $GROUP_RULE_BODY(l);

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 13/* } */);
        prod = (FAILED) ? -1 : 31;

        add_reduce(6, 70);
        return;
    }
    FAILED = true;
}


function $media_queries(l: Lexer): void {

    if (FAILED) return;
    $media_queries_group_039_115(l);
    prod = (FAILED) ? -1 : 34;

    add_reduce(1, 76);
    return;
    FAILED = true;
}
function $media_query_group_043_116(l: Lexer): void {
    const id: u32 = l.id;
    if (id == 24/* not */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 24/* not */);
        prod = (FAILED) ? -1 : 35;

        return;
    }
    if (id == 27/* only */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 27/* only */);
        prod = (FAILED) ? -1 : 35;

        return;
    }
    FAILED = true;
}
function $media_query_group_144_117(l: Lexer): void {

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 22/* and */);

    if (FAILED) return;
    $media_condition_without_or(l);
    prod = (FAILED) ? -1 : 36;

    add_reduce(2, 79);
    return;
    FAILED = true;
}



function $media_not(l: Lexer): void {

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 24/* not */);

    if (FAILED) return;
    $media_in_parenths(l);
    prod = (FAILED) ? -1 : 40;

    add_reduce(2, 90);
    return;
    FAILED = true;
}
function $media_and_group_152_118(l: Lexer): void {

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 22/* and */);

    if (FAILED) return;
    $media_in_parenths(l);
    prod = (FAILED) ? -1 : 41;

    add_reduce(2, 91);
    return;
    FAILED = true;
}

function $media_and(l: Lexer): void {

    if (FAILED) return;
    $media_in_parenths(l);

    if (FAILED) return;
    $media_and_HC_listbody2_119(l);
    prod = (FAILED) ? -1 : 43;

    add_reduce(2, 94);
    return;
    FAILED = true;
}
function $media_or_group_154_120(l: Lexer): void {

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 23/* or */);

    if (FAILED) return;
    $media_in_parenths(l);
    prod = (FAILED) ? -1 : 44;

    add_reduce(2, 95);
    return;
    FAILED = true;
}

function $media_or(l: Lexer): void {

    if (FAILED) return;
    $media_in_parenths(l);

    if (FAILED) return;
    $media_or_HC_listbody2_121(l);
    prod = (FAILED) ? -1 : 46;

    add_reduce(2, 98);
    return;
    FAILED = true;
}


function $media_feature(l: Lexer): void {

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 15/* ( */);

    if (FAILED) return;
    $media_feature_group_061_122(l);

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 16/* ) */);
    prod = (FAILED) ? -1 : 49;

    add_reduce(3, 105);
    return;
    FAILED = true;
}
function $general_enclosed_group_064_123(l: Lexer): void {
    const ty: u32 = l.ty;
    if (ty == 3/* id */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 3/* id */);
        prod = (FAILED) ? -1 : 50;

        return;
    }
    if (ty == 1/* ws */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 1/* ws */);
        prod = (FAILED) ? -1 : 50;

        return;
    }
    FAILED = true;
}

function $general_enclosed(l: Lexer): void {

    if (FAILED) return;
    $identifier(l);

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 15/* ( */);
    const id: u32 = l.id, ty: u32 = l.ty;
    if (id == 16/* ) */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 16/* ) */);
        prod = (FAILED) ? -1 : 52;

        add_reduce(3, 111);
        return;
    }
    if (ty == 3/* id */ || ty == 1/* ws */) {

        if (FAILED) return;
        $general_enclosed_HC_listbody1_124(l);

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 16/* ) */);
        prod = (FAILED) ? -1 : 52;

        add_reduce(4, 110);
        return;
    }
    FAILED = true;
}
function $mf_plain(l: Lexer): void {

    if (FAILED) return;
    $mf_name(l);

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 28/* : */);

    if (FAILED) return;
    $mf_value(l);
    prod = (FAILED) ? -1 : 53;

    add_reduce(3, 112);
    return;
    FAILED = true;
}
function $mf_range_group_071_125(l: Lexer): void {
    const id: u32 = l.id;
    if (id == 29/* < */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 29/* < */);
        prod = (FAILED) ? -1 : 54;

        return;
    }
    if (id == 30/* <= */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 30/* <= */);
        prod = (FAILED) ? -1 : 54;

        return;
    }
    if (id == 31/* > */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 31/* > */);
        prod = (FAILED) ? -1 : 54;

        return;
    }
    if (id == 32/* >= */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 32/* >= */);
        prod = (FAILED) ? -1 : 54;

        return;
    }
    if (id == 33/* = */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 33/* = */);
        prod = (FAILED) ? -1 : 54;

        return;
    }
    FAILED = true;
}
function $mf_range_group_080_126(l: Lexer): void {
    const id: u32 = l.id;
    if (id == 31/* > */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 31/* > */);
        prod = (FAILED) ? -1 : 55;

        return;
    }
    if (id == 32/* >= */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 32/* >= */);
        prod = (FAILED) ? -1 : 55;

        return;
    }
    FAILED = true;
}
function $mf_range_group_085_127(l: Lexer): void {
    const id: u32 = l.id;
    if (id == 29/* < */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 29/* < */);
        prod = (FAILED) ? -1 : 56;

        return;
    }
    if (id == 30/* <= */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 30/* <= */);
        prod = (FAILED) ? -1 : 56;

        return;
    }
    FAILED = true;
}


function $mf_boolean(l: Lexer): void {
    const id: u32 = l.id;
    if (id == 34/* true */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 34/* true */);
        prod = (FAILED) ? -1 : 59;

        add_reduce(1, 130);
        return;
    }
    if (id == 35/* false */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 35/* false */);
        prod = (FAILED) ? -1 : 59;

        add_reduce(1, 131);
        return;
    }
    FAILED = true;
}
function $mf_name(l: Lexer): void {

    if (FAILED) return;
    $identifier(l);
    prod = (FAILED) ? -1 : 60;

    return;
    FAILED = true;
}
function $media_type(l: Lexer): void {

    if (FAILED) return;
    $identifier(l);
    prod = (FAILED) ? -1 : 61;

    add_reduce(1, 133);
    return;
    FAILED = true;
}
function $ratio(l: Lexer): void {

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 2/* num */);

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 36/* / */);

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 2/* num */);
    prod = (FAILED) ? -1 : 62;

    add_reduce(3, 134);
    return;
    FAILED = true;
}
function $percentage(l: Lexer): void {

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 2/* num */);

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 37/* % */);
    prod = (FAILED) ? -1 : 63;

    add_reduce(2, 135);
    return;
    FAILED = true;
}
function $dimension(l: Lexer): void {

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 2/* num */);

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 3/* id */);
    prod = (FAILED) ? -1 : 64;

    add_reduce(2, 136);
    return;
    FAILED = true;
}
function $url(l: Lexer): void {

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 38/* url */);

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 15/* ( */);

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 16/* ) */);
    prod = (FAILED) ? -1 : 65;

    add_reduce(3, 137);
    return;
    FAILED = true;
}
function $string(l: Lexer): void {

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 39/* " */);

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 39/* " */);
    prod = (FAILED) ? -1 : 66;

    add_reduce(2, 138);
    return;
    FAILED = true;
}
function $COMPLEX_SELECTOR_group_0102_128(l: Lexer): void {

    if (FAILED) return;
    $COMBINATOR(l);
    prod = (FAILED) ? -1 : 67;

    add_reduce(1, 139);
    return;
    FAILED = true;
}
function $COMPLEX_SELECTOR_group_1103_129(l: Lexer): void {
    const id: u32 = l.id, ty: u32 = l.ty;
    if (id == 40/* > */ || id == 41/* + */ || id == 42/* ~ */ || id == 43/* || */) {

        if (FAILED) return;
        $COMPLEX_SELECTOR_group_0102_128(l);

        if (FAILED) return;
        $COMPOUND_SELECTOR(l);
        prod = (FAILED) ? -1 : 68;

        add_reduce(2, 140);
        return;
    }
    if (id == 44/* * */ || id == 45/* | */ || id == 60/* $ */ || ty == 3/* id */ || id == 59/* - */ || id == 46/* # */ || id == 47/* . */ || id == 48/* [ */ || id == 28/* : */) {

        if (FAILED) return;
        $COMPOUND_SELECTOR(l);
        prod = (FAILED) ? -1 : 68;

        add_reduce(1, 141);
        return;
    }
    FAILED = true;
}

function $COMPLEX_SELECTOR(l: Lexer): void {

    if (FAILED) return;
    $COMPOUND_SELECTOR(l);
    const id: u32 = l.id, ty: u32 = l.ty;
    if (id == 40/* > */ || id == 41/* + */ || id == 42/* ~ */ || id == 43/* || */ || id == 44/* * */ || id == 45/* | */ || id == 60/* $ */ || ty == 3/* id */ || id == 59/* - */ || id == 46/* # */ || id == 47/* . */ || id == 48/* [ */ || id == 28/* : */) {

        if (FAILED) return;
        $COMPLEX_SELECTOR_HC_listbody2_130(l);
        prod = (FAILED) ? -1 : 70;

        add_reduce(2, 144);
        return;
    }
    prod = (FAILED) ? -1 : 70;

    add_reduce(1, 145);
    return;
    FAILED = true;
}


function $COMPOUND_SELECTOR_group_1105_133(l: Lexer): void {

    if (FAILED) return;
    $PSEUDO_ELEMENT_SELECTOR(l);
    const id: u32 = l.id;
    if (id == 28/* : */) {

        if (FAILED) return;
        $COMPOUND_SELECTOR_HC_listbody1_132(l);
        prod = (FAILED) ? -1 : 73;

        add_reduce(2, 150);
        return;
    }
    prod = (FAILED) ? -1 : 73;

    add_reduce(1, 151);
    return;
    FAILED = true;
}


function $COMBINATOR(l: Lexer): void {
    const id: u32 = l.id;
    if (id == 40/* > */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 40/* > */);
        prod = (FAILED) ? -1 : 76;

        return;
    }
    if (id == 41/* + */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 41/* + */);
        prod = (FAILED) ? -1 : 76;

        return;
    }
    if (id == 42/* ~ */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 42/* ~ */);
        prod = (FAILED) ? -1 : 76;

        return;
    }
    if (id == 43/* || */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 43/* || */);
        prod = (FAILED) ? -1 : 76;

        return;
    }
    FAILED = true;
}
function $NS_PREFIX_group_0112_135(l: Lexer): void {
    const id: u32 = l.id, ty: u32 = l.ty;
    if (id == 44/* * */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 44/* * */);
        prod = (FAILED) ? -1 : 77;

        return;
    }
    if (id == 60/* $ */ || ty == 3/* id */ || id == 59/* - */) {

        if (FAILED) return;
        $identifier(l);
        prod = (FAILED) ? -1 : 77;

        return;
    }
    FAILED = true;
}
function $NS_PREFIX(l: Lexer): void {
    const id: u32 = l.id, ty: u32 = l.ty;
    if (id == 45/* | */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 45/* | */);
        prod = (FAILED) ? -1 : 78;

        add_reduce(1, 168);
        return;
    }
    if (id == 44/* * */ || id == 60/* $ */ || ty == 3/* id */ || id == 59/* - */) {

        if (FAILED) return;
        $NS_PREFIX_group_0112_135(l);

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 45/* | */);
        prod = (FAILED) ? -1 : 78;

        add_reduce(2, 167);
        return;
    }
    FAILED = true;
}

function $SUBCLASS_SELECTOR(l: Lexer): void {
    const id: u32 = l.id;
    if (id == 46/* # */) {

        if (FAILED) return;
        $ID_SELECTOR(l);
        prod = (FAILED) ? -1 : 80;

        return;
    }
    if (id == 47/* . */) {

        if (FAILED) return;
        $CLASS_SELECTOR(l);
        prod = (FAILED) ? -1 : 80;

        return;
    }
    if (id == 48/* [ */) {

        if (FAILED) return;
        $ATTRIBUTE_SELECTOR(l);
        prod = (FAILED) ? -1 : 80;

        return;
    }
    if (id == 28/* : */) {

        if (FAILED) return;
        $PSEUDO_CLASS_SELECTOR(l);
        prod = (FAILED) ? -1 : 80;

        return;
    }
    FAILED = true;
}
function $ID_SELECTOR(l: Lexer): void {

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 46/* # */);

    if (FAILED) return;
    $identifier(l);
    prod = (FAILED) ? -1 : 81;

    add_reduce(2, 175);
    return;
    FAILED = true;
}
function $CLASS_SELECTOR(l: Lexer): void {

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 47/* . */);

    if (FAILED) return;
    $identifier(l);
    prod = (FAILED) ? -1 : 82;

    add_reduce(2, 176);
    return;
    FAILED = true;
}
function $PSEUDO_CLASS_SELECTOR_group_2121_136(l: Lexer): void {

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 15/* ( */);

    if (FAILED) return;
    $string(l);

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 16/* ) */);
    prod = (FAILED) ? -1 : 83;

    add_reduce(3, 177);
    return;
    FAILED = true;
}
function $PSEUDO_CLASS_SELECTOR(l: Lexer): void {

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 28/* : */);

    if (FAILED) return;
    $identifier(l);
    const id: u32 = l.id;
    if (id == 15/* ( */) {

        if (FAILED) return;
        $PSEUDO_CLASS_SELECTOR_group_2121_136(l);
        prod = (FAILED) ? -1 : 84;

        add_reduce(3, 178);
        return;
    }
    prod = (FAILED) ? -1 : 84;

    add_reduce(2, 179);
    return;
    FAILED = true;
}
function $ATTRIBUTE_SELECTOR_group_2125_137(l: Lexer): void {
    const id: u32 = l.id, ty: u32 = l.ty;
    if (id == 39/* " */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 39/* " */);

        if (FAILED) return;
        $string(l);

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 39/* " */);
        prod = (FAILED) ? -1 : 85;

        add_reduce(3, 181);
        return;
    }
    if (id == 60/* $ */ || ty == 3/* id */ || id == 59/* - */) {

        if (FAILED) return;
        $identifier(l);
        prod = (FAILED) ? -1 : 85;

        return;
    }
    FAILED = true;
}
function $ATTRIBUTE_SELECTOR(l: Lexer): void {

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 48/* [ */);

    if (FAILED) return;
    $WQ_NAME(l);
    const id: u32 = l.id;
    if (id == 49/* ] */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 49/* ] */);
        prod = (FAILED) ? -1 : 86;

        add_reduce(3, 182);
        return;
    }
    if (id == 50/* ~ */ || id == 51/* ^= */ || id == 52/* $= */ || id == 53/* *= */ || id == 33/* = */) {

        if (FAILED) return;
        $ATTR_MATCHER(l);

        if (FAILED) return;
        $ATTRIBUTE_SELECTOR_group_2125_137(l);
        const id: u32 = l.id;
        if (id == 49/* ] */) {

            _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 49/* ] */);
            prod = (FAILED) ? -1 : 86;

            add_reduce(5, 184);
            return;
        }
        if (id == 54/* i */ || id == 55/* s */) {

            if (FAILED) return;
            $ATTR_MODIFIER(l);

            _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 49/* ] */);
            prod = (FAILED) ? -1 : 86;

            add_reduce(6, 183);
            return;
        }
    }
    FAILED = true;
}
function $ATTR_MATCHER(l: Lexer): void {
    const id: u32 = l.id;
    if (id == 50/* ~ */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 50/* ~ */);

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 33/* = */);
        prod = (FAILED) ? -1 : 87;

        add_reduce(2, 185);
        return;
    }
    if (id == 51/* ^= */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 51/* ^= */);
        prod = (FAILED) ? -1 : 87;

        return;
    }
    if (id == 52/* $= */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 52/* $= */);
        prod = (FAILED) ? -1 : 87;

        return;
    }
    if (id == 53/* *= */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 53/* *= */);
        prod = (FAILED) ? -1 : 87;

        return;
    }
    if (id == 33/* = */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 33/* = */);
        prod = (FAILED) ? -1 : 87;

        return;
    }
    FAILED = true;
}
function $ATTR_MODIFIER(l: Lexer): void {
    const id: u32 = l.id;
    if (id == 54/* i */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 54/* i */);
        prod = (FAILED) ? -1 : 88;

        return;
    }
    if (id == 55/* s */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 55/* s */);
        prod = (FAILED) ? -1 : 88;

        return;
    }
    FAILED = true;
}

function $PSEUDO_ELEMENT_SELECTOR(l: Lexer): void {

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 28/* : */);

    if (FAILED) return;
    $PSEUDO_CLASS_SELECTOR(l);
    prod = (FAILED) ? -1 : 90;

    add_reduce(2, 195);
    return;
    FAILED = true;
}

function $declaration_list_group_1137_139(l: Lexer): void {
    const id: u32 = l.id, ty: u32 = l.ty;
    if (id == 12/* ; */) {

        if (FAILED) return;
        $declaration_list_HC_listbody3_138(l);

        if (FAILED) return;
        $rule_declaration(l);
        prod = (FAILED) ? -1 : 92;

        add_reduce(2, 198);
        return;
    }
    if (id == 60/* $ */ || ty == 3/* id */ || id == 59/* - */) {

        if (FAILED) return;
        $rule_declaration(l);
        prod = (FAILED) ? -1 : 92;

        return;
    }
    FAILED = true;
}


function $declaration_list(l: Lexer): void {

    if (FAILED) return;
    $declaration_list_HC_listbody2_140(l);
    const id: u32 = l.id;
    if (id == 12/* ; */) {

        if (FAILED) return;
        $declaration_list_HC_listbody1_141(l);
        prod = (FAILED) ? -1 : 95;

        add_reduce(2, 204);
        return;
    }
    prod = (FAILED) ? -1 : 95;

    add_reduce(1, 205);
    return;
    FAILED = true;
}
function $rule_declaration(l: Lexer): void {

    if (FAILED) return;
    $declaration(l);
    prod = (FAILED) ? -1 : 96;

    return;
    FAILED = true;
}
function $declaration_group_1140_142(l: Lexer): void {

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 56/* ! */);

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 57/* important */);
    prod = (FAILED) ? -1 : 97;

    add_reduce(2, 207);
    return;
    FAILED = true;
}
function $declaration(l: Lexer): void {

    if (FAILED) return;
    $declaration_id(l);

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 28/* : */);

    if (FAILED) return;
    $declaration_values(l);
    const id: u32 = l.id;
    if (id == 56/* ! */) {

        if (FAILED) return;
        $declaration_group_1140_142(l);
        prod = (FAILED) ? -1 : 98;

        add_reduce(4, 208);
        return;
    }
    prod = (FAILED) ? -1 : 98;

    add_reduce(3, 209);
    return;
}
function $declaration_values_group_0144_143(l: Lexer): void {
    const ty: u32 = l.ty;
    if (ty == 1/* ws */) {
        const pk: Lexer = l.pk, ty: u32 = pk.ty;
        if (ty == 1/* ws */) {

            _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 1/* ws */);
            prod = (FAILED) ? -1 : 99;

            return;
        }
        prod = (FAILED) ? -1 : 99;

        add_reduce(0, 212);
        return;
    }
    if (ty == 1/* ws */) {
        const pk: Lexer = l.pk, ty: u32 = pk.ty;
        if (ty == 1/* ws */) {

            _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 1/* ws */);
            prod = (FAILED) ? -1 : 99;

            return;
        }
        prod = (FAILED) ? -1 : 99;

        add_reduce(0, 212);
        return;
        prod = (FAILED) ? -1 : 99;

        add_reduce(0, 212);
        return;
    }
    if (ty == 1/* ws */) {
        const pk: Lexer = l.pk, id: u32 = pk.id, ty: u32 = pk.ty;
        if (ty == 1/* ws */) {

            _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 1/* ws */);
            prod = (FAILED) ? -1 : 99;

            return;
        }
        if (id == 59/* - */ || id == 58/* _ */ || ty == 2/* num */ || ty == 3/* id */ || ty == 5/* sym */) {

            if (FAILED) return;
            $declaration_values(l);
            prod = (FAILED) ? -1 : 99;

            return;
        }
        prod = (FAILED) ? -1 : 99;

        add_reduce(0, 212);
        return;
        prod = (FAILED) ? -1 : 99;

        add_reduce(0, 212);
        return;
        prod = (FAILED) ? -1 : 99;

        add_reduce(0, 212);
        return;
    }
    FAILED = true;
}


function $identifier(l: Lexer): void {

    if (FAILED) return;
    $css_id_symbols(l);
    prod = (FAILED) ? -1 : 102;

    return;
    FAILED = true;
}

function $declaration_id(l: Lexer): void {

    if (FAILED) return;
    $css_id_symbols(l);
    prod = (FAILED) ? -1 : 104;

    return;
    FAILED = true;
}
function $string_value_group_0162_145(l: Lexer): void {
    const id: u32 = l.id, ty: u32 = l.ty;
    if (id == 59/* - */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 59/* - */);
        prod = (FAILED) ? -1 : 105;

        return;
    }
    if (id == 58/* _ */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 58/* _ */);
        prod = (FAILED) ? -1 : 105;

        return;
    }
    if (ty == 2/* num */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 2/* num */);
        prod = (FAILED) ? -1 : 105;

        return;
    }
    if (ty == 3/* id */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 3/* id */);
        prod = (FAILED) ? -1 : 105;

        return;
    }
    if (ty == 5/* sym */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 5/* sym */);
        prod = (FAILED) ? -1 : 105;

        return;
    }
    FAILED = true;
}


function $def$start(l: Lexer): void {

    if (FAILED) return;
    $def$defaultproductions(l);
    prod = (FAILED) ? -1 : 108;

    return;
    FAILED = true;
}



function $def$hex_digit(l: Lexer): void {
    const id: u32 = l.id, ty: u32 = l.ty;
    if (ty == 5/* int */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 5/* int */);
        prod = (FAILED) ? -1 : 112;

        return;
    }
    if (id == 61/* a */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 61/* a */);
        prod = (FAILED) ? -1 : 112;

        return;
    }
    if (id == 62/* b */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 62/* b */);
        prod = (FAILED) ? -1 : 112;

        return;
    }
    if (id == 63/* c */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 63/* c */);
        prod = (FAILED) ? -1 : 112;

        return;
    }
    if (id == 64/* d */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 64/* d */);
        prod = (FAILED) ? -1 : 112;

        return;
    }
    if (id == 65/* e */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 65/* e */);
        prod = (FAILED) ? -1 : 112;

        return;
    }
    if (id == 66/* f */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 66/* f */);
        prod = (FAILED) ? -1 : 112;

        return;
    }
    if (id == 67/* A */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 67/* A */);
        prod = (FAILED) ? -1 : 112;

        return;
    }
    if (id == 68/* B */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 68/* B */);
        prod = (FAILED) ? -1 : 112;

        return;
    }
    if (id == 69/* C */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 69/* C */);
        prod = (FAILED) ? -1 : 112;

        return;
    }
    if (id == 70/* D */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 70/* D */);
        prod = (FAILED) ? -1 : 112;

        return;
    }
    if (id == 71/* E */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 71/* E */);
        prod = (FAILED) ? -1 : 112;

        return;
    }
    if (id == 72/* F */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 72/* F */);
        prod = (FAILED) ? -1 : 112;

        return;
    }
    FAILED = true;
}
function $def$hex(l: Lexer): void {

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 5/* hex */);
    prod = (FAILED) ? -1 : 113;

    add_reduce(1, 263);
    return;
    FAILED = true;
}
function $def$binary(l: Lexer): void {

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 5/* bin */);
    prod = (FAILED) ? -1 : 114;

    add_reduce(1, 264);
    return;
    FAILED = true;
}
function $def$octal(l: Lexer): void {

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 5/* oct */);
    prod = (FAILED) ? -1 : 115;

    add_reduce(1, 265);
    return;
    FAILED = true;
}
function $def$scientific(l: Lexer): void {
    const ty: u32 = l.ty;
    if (ty == 5/* sci */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 5/* sci */);
        prod = (FAILED) ? -1 : 116;

        add_reduce(1, 266);
        return;
    }
    if (ty == 5/* flt */ || ty == 2/* num */) {

        if (FAILED) return;
        $def$float(l);
        prod = (FAILED) ? -1 : 116;

        return;
    }
    FAILED = true;
}
function $def$float(l: Lexer): void {
    const ty: u32 = l.ty;
    if (ty == 5/* flt */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 5/* flt */);
        prod = (FAILED) ? -1 : 117;

        add_reduce(1, 268);
        return;
    }
    if (ty == 2/* num */) {

        if (FAILED) return;
        $def$integer(l);
        prod = (FAILED) ? -1 : 117;

        return;
    }
    FAILED = true;
}
function $def$integer(l: Lexer): void {

    if (FAILED) return;
    $def$natural(l);
    prod = (FAILED) ? -1 : 118;

    add_reduce(1, 270);
    return;
    FAILED = true;
}
function $def$natural(l: Lexer): void {

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 2/* num */);
    prod = (FAILED) ? -1 : 119;

    return;
    FAILED = true;
}
function $def$id(l: Lexer): void {

    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 3/* id */);
    prod = (FAILED) ? -1 : 120;

    return;
    FAILED = true;
}
function $def$string_group_034_101(l: Lexer): void {
    const id: u32 = l.id, ty: u32 = l.ty;
    if (ty == 1/* ws */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 1/* ws */);
        prod = (FAILED) ? -1 : 121;

        return;
    }
    if (id == 74/* / */ || id == 75/* \ */ || id == 59/* - */ || id == 58/* _ */ || true || ty == 5/* ob */ || ty == 5/* cb */ || ty == 2/* num */ || ty == 3/* id */ || ty == 5/* sym */) {

        if (FAILED) return;
        $def$string_value(l);
        prod = (FAILED) ? -1 : 121;

        return;
    }
    FAILED = true;
}


function $def$string(l: Lexer): void {
    const id: u32 = l.id;
    if (id == 39/* " */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 39/* " */);

        if (FAILED) return;
        $def$string_HC_listbody1_102(l);

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 39/* " */);
        prod = (FAILED) ? -1 : 124;

        add_reduce(3, 279);
        return;
    }
    if (id == 73/* ' */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 73/* ' */);

        if (FAILED) return;
        $def$string_HC_listbody1_103(l);

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 73/* ' */);
        prod = (FAILED) ? -1 : 124;

        add_reduce(3, 280);
        return;
    }
    FAILED = true;
}
function $def$string_value_group_149_104(l: Lexer): void {
    const id: u32 = l.id, ty: u32 = l.ty;
    if (id == 74/* / */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 74/* / */);
        prod = (FAILED) ? -1 : 125;

        return;
    }
    if (id == 75/* \ */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 75/* \ */);
        const ty: u32 = l.ty;
        if (true) {

            _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 88);
            prod = (FAILED) ? -1 : 125;

            add_reduce(2, 291);
            return;
        }
        prod = (FAILED) ? -1 : 125;

        return;
    }
    if (id == 59/* - */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 59/* - */);
        prod = (FAILED) ? -1 : 125;

        return;
    }
    if (id == 58/* _ */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 58/* _ */);
        prod = (FAILED) ? -1 : 125;

        return;
    }
    if (true) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 88);
        prod = (FAILED) ? -1 : 125;

        return;
    }
    if (ty == 5/* ob */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 5/* ob */);
        prod = (FAILED) ? -1 : 125;

        return;
    }
    if (ty == 5/* cb */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 5/* cb */);
        prod = (FAILED) ? -1 : 125;

        return;
    }
    if (ty == 2/* num */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 2/* num */);
        prod = (FAILED) ? -1 : 125;

        return;
    }
    if (ty == 3/* id */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 3/* id */);
        prod = (FAILED) ? -1 : 125;

        return;
    }
    if (ty == 5/* sym */) {

        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */], 5/* sym */);
        prod = (FAILED) ? -1 : 125;

        return;
    }
    FAILED = true;
}

function $def$string_value(l: Lexer): void {

    if (FAILED) return;
    $def$string_value_HC_listbody2_105(l);
    prod = (FAILED) ? -1 : 127;

    return;
    FAILED = true;
}
function $def$js_identifier(l: Lexer): void {

    if (FAILED) return;
    $def$js_id_symbols(l);
    prod = (FAILED) ? -1 : 128;

    return;
    FAILED = true;
}

function $def$identifier(l: Lexer): void {

    if (FAILED) return;
    $def$identifier_symbols(l);
    prod = (FAILED) ? -1 : 130;

    return;
    FAILED = true;
}

const idm0: Map<number, (L: Lexer) => void> = new Map();
const _0id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State445(l);
    //
};
idm0.set(56/* ! */, _0id0);
const _0id1 = (l: Lexer): void => {
    var $mark = mark(), sp = stack_ptr;
    var cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State365(cp);
    if (prod !== 66) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State431(cp);
    if (prod !== 66) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State462(l);
    //
};
idm0.set(39/* " */, _0id1);
const _0id2 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State95(l);
    //
};
idm0.set(46/* # */, _0id2);
const _0id3 = (l: Lexer): void => {
    var $mark = mark(), sp = stack_ptr;
    var cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State242(cp);
    if (prod !== 103) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State27(l);
    //
};
idm0.set(60/* $ */, _0id3);
const _0id4 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State418(l);
    //
};
idm0.set(52/* $= */, _0id4);
const _0id5 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State280(l);
    //
};
idm0.set(37/* % */, _0id5);
const _0id6 = (l: Lexer): void => {
    var $mark = mark(), sp = stack_ptr;
    var cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State22(cp);
    if (prod !== 47) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State237(cp);
    if (prod !== 52) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State249(cp);
    if (prod !== 30) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State348(cp);
    if (prod !== 101) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State36(cp);
    if (prod !== 27) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State410(cp);
    if (prod !== 83) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State432(cp);
    if (prod !== 65) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State465(l);
    //
};
idm0.set(15/* ( */, _0id6);
const _0id7 = (l: Lexer): void => {
    var $mark = mark(), sp = stack_ptr;
    var cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State376(cp);
    if (prod !== 52) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State377(cp);
    if (prod !== 47) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State378(cp);
    if (prod !== 27) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State379(cp);
    if (prod !== 29) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State380(cp);
    if (prod !== 49) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State439(cp);
    if (prod !== 52) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State446(cp);
    if (prod !== 30) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State463(cp);
    if (prod !== 101) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State464(cp);
    if (prod !== 65) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State469(cp);
    if (prod !== 83) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State483(l);
    //
};
idm0.set(16/* ) */, _0id7);
const _0id8 = (l: Lexer): void => {
    var $mark = mark(), sp = stack_ptr;
    var cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State186(cp);
    if (prod !== 77) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State303(cp);
    if (prod !== 89) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State86(l);
    //
};
idm0.set(44/* * */, _0id8);
const _0id9 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State419(l);
    //
};
idm0.set(53/* *= */, _0id9);
const _0id10 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State194(l);
    //
};
idm0.set(41/* + */, _0id10);
const _0id11 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State229(l);
    //
};
idm0.set(10/* , */, _0id11);
const _0id12 = (l: Lexer): void => {
    var $mark = mark(), sp = stack_ptr;
    var cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State166(cp);
    if (prod !== 105) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State203(cp);
    if (prod !== 125) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State241(cp);
    if (prod !== 103) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State29(l);
    //
};
idm0.set(59/* - */, _0id12);
const _0id13 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State96(l);
    //
};
idm0.set(47/* . */, _0id13);
const _0id14 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State201(l);
    //
};
idm0.set(74/* / */, _0id14);
const _0id15 = (l: Lexer): void => {
    var $mark = mark(), sp = stack_ptr;
    var cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State127(cp);
    if (prod !== 84) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State138(cp);
    if (prod !== 90) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State252(cp);
    if (prod !== 98) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State98(l);
    //
};
idm0.set(28/* : */, _0id15);
const _0id16 = (l: Lexer): void => {
    var $mark = mark(), sp = stack_ptr;
    var cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State222(cp);
    if (prod !== 9) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State223(cp);
    if (prod !== 9) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State224(cp);
    if (prod !== 9) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State225(cp);
    if (prod !== 9) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State412(cp);
    if (prod !== 6) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State450(l);
    //
};
idm0.set(12/* ; */, _0id16);
const _0id17 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State420(l);
    //
};
idm0.set(33/* = */, _0id17);
const _0id18 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State193(l);
    //
};
idm0.set(40/* > */, _0id18);
const _0id19 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State3(l);
    //
};
idm0.set(17/* @ */, _0id19);
const _0id20 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State97(l);
    //
};
idm0.set(48/* [ */, _0id20);
const _0id21 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State202(l);
    //
};
idm0.set(75/* \ */, _0id21);
const _0id22 = (l: Lexer): void => {
    var $mark = mark(), sp = stack_ptr;
    var cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State414(cp);
    if (prod !== 86) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State476(cp);
    if (prod !== 86) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State482(l);
    //
};
idm0.set(49/* ] */, _0id22);
const _0id23 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State417(l);
    //
};
idm0.set(51/* ^= */, _0id23);
const _0id24 = (l: Lexer): void => {
    var $mark = mark(), sp = stack_ptr;
    var cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State167(cp);
    if (prod !== 105) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State204(cp);
    if (prod !== 125) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State240(l);
    //
};
idm0.set(58/* _ */, _0id24);
const _0id25 = (l: Lexer): void => {
    var $mark = mark(), sp = stack_ptr;
    var cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State231(cp);
    if (prod !== 36) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State60(cp);
    if (prod !== 24) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State76(l);
    //
};
idm0.set(22/* and */, _0id25);
const _0id26 = (l: Lexer): void => {
    var $mark = mark(), sp = stack_ptr;
    var cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State205(cp);
    if (prod !== 125) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State357(l);
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State150(l);
    //
};
idm0.set(34/* true */, _0id26);
const _0id27 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State151(l);
    //
};
idm0.set(35/* false */, _0id27);
const _0id28 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State51(l);
    //
};
idm0.set(20/* from */, _0id28);
const _0id29 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State477(l);
    //
};
idm0.set(54/* i */, _0id29);
const _0id30 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State221(l);
    //
};
idm0.set(18/* import */, _0id30);
const _0id31 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State470(l);
    //
};
idm0.set(57/* important */, _0id31);
const _0id32 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State227(l);
    //
};
idm0.set(19/* keyframes */, _0id32);
const _0id33 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State226(l);
    //
};
idm0.set(26/* media */, _0id33);
const _0id34 = (l: Lexer): void => {
    var $mark = mark(), sp = stack_ptr;
    var cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State21(cp);
    if (prod !== 40) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State34(cp);
    if (prod !== 26) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State72(l);
    //
};
idm0.set(24/* not */, _0id34);
const _0id35 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State30(l);
    //
};
idm0.set(27/* only */, _0id35);
const _0id36 = (l: Lexer): void => {
    var $mark = mark(), sp = stack_ptr;
    var cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State108(cp);
    if (prod !== 44) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State61(l);
    //
};
idm0.set(23/* or */, _0id36);
const _0id37 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State478(l);
    //
};
idm0.set(55/* s */, _0id37);
const _0id38 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State41(l);
    //
};
idm0.set(25/* selector */, _0id38);
const _0id39 = (l: Lexer): void => {
    var $mark = mark(), sp = stack_ptr;
    var cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State228(cp);
    if (prod !== 23) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State436(l);
    //
};
idm0.set(14/* supports */, _0id39);
const _0id40 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State52(l);
    //
};
idm0.set(21/* to */, _0id40);
const _0id41 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State366(l);
    //
};
idm0.set(38/* url */, _0id41);
const _0id42 = (l: Lexer): void => {
    var $mark = mark(), sp = stack_ptr;
    var cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State309(cp);
    if (prod !== 6) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State433(cp);
    if (prod !== 17) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State437(cp);
    if (prod !== 23) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State438(l);
    //
};
idm0.set(11/* { */, _0id42);
const _0id43 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State89(l);
    //
};
idm0.set(45/* | */, _0id43);
const _0id44 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State196(l);
    //
};
idm0.set(43/* || */, _0id44);
const _0id45 = (l: Lexer): void => {
    var $mark = mark(), sp = stack_ptr;
    var cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State413(cp);
    if (prod !== 6) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State448(cp);
    if (prod !== 6) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State451(cp);
    if (prod !== 6) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State471(cp);
    if (prod !== 6) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State479(cp);
    if (prod !== 17) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State485(cp);
    if (prod !== 23) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State487(cp);
    if (prod !== 31) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State488(cp);
    if (prod !== 23) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State489(l);
    //
};
idm0.set(13/* } */, _0id45);
const _0id46 = (l: Lexer): void => {
    var $mark = mark(), sp = stack_ptr;
    var cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State195(cp);
    if (prod !== 76) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State416(l);
    //
};
idm0.set(50/* ~ */, _0id46);
const tym0: Map<number, (L: Lexer) => void> = new Map();
tym0.set(88, _0id26/* compressed */);
const _0ty1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State207(l);
    //
};
tym0.set(5/* cb */, _0ty1);
const _0ty2 = (l: Lexer): void => {
    var $mark = mark(), sp = stack_ptr;
    var cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State113(cp);
    if (prod !== 50) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State169(cp);
    if (prod !== 105) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State209(cp);
    if (prod !== 125) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State239(cp);
    if (prod !== 103) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State28(cp);
    if (prod !== 103) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State368(l);
    //
};
tym0.set(3/* id */, _0ty2);
const _0ty3 = (l: Lexer): void => {
    var $mark = mark(), sp = stack_ptr;
    var cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State117(cp);
    if (prod !== 58) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State168(cp);
    if (prod !== 105) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State208(cp);
    if (prod !== 125) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State243(cp);
    if (prod !== 103) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State54(l);
    //
};
tym0.set(2/* num */, _0ty3);
const _0ty4 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State206(l);
    //
};
tym0.set(5/* ob */, _0ty4);
const _0ty5 = (l: Lexer): void => {
    var $mark = mark(), sp = stack_ptr;
    var cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State170(cp);
    if (prod !== 105) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State210(l);
    //
};
tym0.set(5/* sym */, _0ty5);
const _0ty6 = (l: Lexer): void => {
    var $mark = mark(), sp = stack_ptr;
    var cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State114(cp);
    if (prod !== 50) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    cp = l.copy();
    _(cp, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State174(cp);
    if (prod !== 99) {
        reset($mark);
        FAILED = false;
        stack_ptr = sp;
    } else {
        l.sync(cp);
        return;
    }
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State350(l);
    //
};
tym0.set(1/* ws */, _0ty6);
function $STYLE_SHEET_HC_listbody1_100(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm0.has(l.id)) idm0.get(l.id)(l);
    else if (tym0.has(l.ty)) tym0.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 125:
                State356(l);
                continue;
            case 107:
                State163(l);
                if (prod < 0)
                    State349(l);
                else continue;
                continue;
            case 105:
                State165(l);
                if (prod < 0)
                    State347(l);
                else continue;
                continue;
            case 104:
                State45(l);
                continue;
            case 103:
                State43(l);
                if (prod < 0)
                    State26(l);
                else continue;
                if (prod < 0)
                    State161(l);
                else continue;
                continue;
            case 102:
                State42(l);
                if (prod < 0)
                    State234(l);
                else continue;
                if (prod < 0)
                    State248(l);
                else continue;
                if (prod < 0)
                    State308(l);
                else continue;
                if (prod < 0)
                    State305(l);
                else continue;
                if (prod < 0)
                    State87(l);
                else continue;
                if (prod < 0)
                    State304(l);
                else continue;
                if (prod < 0)
                    State311(l);
                else continue;
                if (prod < 0)
                    State25(l);
                else continue;
                if (prod < 0)
                    State461(l);
                else continue;
                continue;
            case 101:
                State383(l);
                if (prod < 0)
                    State175(l);
                else continue;
                continue;
            case 100:
                State430(l);
                continue;
            case 99:
                State173(l);
                continue;
            case 98:
                State251(l);
                if (prod < 0)
                    State160(l);
                else continue;
                if (prod < 0)
                    State44(l);
                else continue;
                continue;
            case 97:
                State444(l);
                continue;
            case 96:
                State159(l);
                continue;
            case 95:
                State411(l);
                continue;
            case 93:
                State385(l);
                continue;
            case 92:
                State157(l);
                continue;
            case 91:
                State158(l);
                continue;
            case 90:
                State100(l);
                continue;
            case 89:
                State81(l);
                continue;
            case 88:
                State475(l);
                continue;
            case 87:
                State415(l);
                continue;
            case 86:
                State93(l);
                continue;
            case 85:
                State460(l);
                continue;
            case 84:
                State141(l);
                if (prod < 0)
                    State94(l);
                else continue;
                if (prod < 0)
                    State312(l);
                else continue;
                if (prod < 0)
                    State338(l);
                else continue;
                continue;
            case 83:
                State409(l);
                continue;
            case 82:
                State92(l);
                continue;
            case 81:
                State91(l);
                continue;
            case 80:
                State90(l);
                if (prod < 0)
                    State299(l);
                else continue;
                continue;
            case 79:
                State313(l);
                if (prod < 0)
                    State84(l);
                else continue;
                continue;
            case 78:
                State185(l);
                if (prod < 0)
                    State85(l);
                else continue;
                continue;
            case 77:
                State88(l);
                continue;
            case 76:
                State192(l);
                continue;
            case 75:
                State80(l);
                if (prod < 0)
                    State191(l);
                else continue;
                continue;
            case 74:
                State301(l);
                if (prod < 0)
                    State298(l);
                else continue;
                if (prod < 0)
                    State83(l);
                else continue;
                if (prod < 0)
                    State408(l);
                else continue;
                continue;
            case 73:
                State99(l);
                if (prod < 0)
                    State297(l);
                else continue;
                continue;
            case 72:
                State306(l);
                continue;
            case 71:
                State300(l);
                if (prod < 0)
                    State82(l);
                else continue;
                continue;
            case 70:
                State406(l);
                if (prod < 0)
                    State79(l);
                else continue;
                continue;
            case 69:
                State307(l);
                continue;
            case 68:
                State189(l);
                if (prod < 0)
                    State358(l);
                else continue;
                continue;
            case 67:
                State190(l);
                continue;
            case 66:
                State363(l);
                if (prod < 0)
                    State369(l);
                else continue;
                if (prod < 0)
                    State447(l);
                else continue;
                continue;
            case 65:
                State364(l);
                continue;
            case 64:
                State118(l);
                continue;
            case 63:
                State53(l);
                continue;
            case 62:
                State120(l);
                continue;
            case 61:
                State233(l);
                if (prod < 0)
                    State15(l);
                else continue;
                continue;
            case 60:
                State149(l);
                continue;
            case 59:
                State147(l);
                continue;
            case 58:
                State130(l);
                continue;
            case 57:
                State148(l);
                continue;
            case 53:
                State146(l);
                continue;
            case 52:
                State38(l);
                if (prod < 0)
                    State24(l);
                else continue;
                continue;
            case 51:
                State375(l);
                continue;
            case 50:
                State112(l);
                continue;
            case 49:
                State23(l);
                continue;
            case 48:
                State247(l);
                continue;
            case 47:
                State20(l);
                if (prod < 0)
                    State238(l);
                else continue;
                if (prod < 0)
                    State315(l);
                else continue;
                if (prod < 0)
                    State296(l);
                else continue;
                if (prod < 0)
                    State71(l);
                else continue;
                continue;
            case 46:
                State17(l);
                continue;
            case 45:
                State236(l);
                continue;
            case 44:
                State107(l);
                if (prod < 0)
                    State310(l);
                else continue;
                continue;
            case 43:
                State19(l);
                continue;
            case 42:
                State235(l);
                continue;
            case 41:
                State75(l);
                if (prod < 0)
                    State294(l);
                else continue;
                continue;
            case 40:
                State18(l);
                continue;
            case 39:
                State16(l);
                if (prod < 0)
                    State381(l);
                else continue;
                continue;
            case 38:
                State246(l);
                if (prod < 0)
                    State13(l);
                else continue;
                continue;
            case 37:
                State68(l);
                if (prod < 0)
                    State12(l);
                else continue;
                continue;
            case 36:
                State230(l);
                if (prod < 0)
                    State370(l);
                else continue;
                continue;
            case 35:
                State14(l);
                continue;
            case 34:
                State373(l);
                continue;
            case 33:
                State374(l);
                continue;
            case 30:
                State39(l);
                continue;
            case 29:
                State40(l);
                continue;
            case 28:
                State37(l);
                continue;
            case 27:
                State35(l);
                if (prod < 0)
                    State245(l);
                else continue;
                continue;
            case 26:
                State250(l);
                if (prod < 0)
                    State372(l);
                else continue;
                if (prod < 0)
                    State32(l);
                else continue;
                continue;
            case 25:
                State244(l);
                continue;
            case 24:
                State59(l);
                if (prod < 0)
                    State281(l);
                else continue;
                continue;
            case 22:
                State371(l);
                continue;
            case 21:
                State382(l);
                if (prod < 0)
                    State50(l);
                else continue;
                continue;
            case 20:
                State48(l);
                continue;
            case 19:
                State49(l);
                continue;
            case 18:
                State367(l);
                continue;
            case 16:
                State466(l);
                continue;
            case 15:
                State33(l);
                continue;
            case 14:
                State2(l);
                continue;
            case 13:
                State435(l);
                if (prod < 0)
                    State467(l);
                else continue;
                continue;
            case 12:
                State434(l);
                continue;
            case 11:
                State480(l);
                continue;
            case 10:
                State362(l);
                continue;
            case 8:
                State484(l);
                if (prod < 0)
                    State486(l);
                else continue;
                continue;
            case 6:
                State124(l);
                continue;
            case 5:
                State104(l);
                continue;
            case 1:
                State1(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![1].includes(a)) fail(l);
}
function State1(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if ([17/* @ */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State3(l);
        //

    }
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 14:
                State220(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![1].includes(a)) fail(l);
}
function State2(l: Lexer): void {
    prod = -1;
    if ([17/* @ */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //STYLE_SHEET_HC_listbody1_100=>import •

        add_reduce(1, 2);
        stack_ptr -= 1;
        prod = 1;
        return;
    }
}
function State3(l: Lexer): void {
    prod = -1;
    if ([18/* import */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State221(l); return;
        //

    }
}
function $AT_RULE(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if ([17/* @ */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State9(l);
        //

    }
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 31:
                State5(l);
                continue;
            case 23:
                State8(l);
                continue;
            case 17:
                State7(l);
                continue;
            case 14:
                State6(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![9].includes(a)) fail(l);
}
const idm5: Map<number, (L: Lexer) => void> = new Map();
const _5id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State222(l); return;
    //
};
idm5.set(12/* ; */, _5id0);
const _5id1 = (l: Lexer): void => {//AT_RULE=>media •

    stack_ptr -= 1;
    prod = 9;
    return;
};
idm5.set(46/* # */, _5id1);
idm5.set(60/* $ */, _5id1);
idm5.set(44/* * */, _5id1);
idm5.set(59/* - */, _5id1);
idm5.set(47/* . */, _5id1);
idm5.set(28/* : */, _5id1);
idm5.set(17/* @ */, _5id1);
idm5.set(48/* [ */, _5id1);
idm5.set(45/* | */, _5id1);
const tym5: Map<number, (L: Lexer) => void> = new Map();
tym5.set(0, _5id1/* compressed */);
tym5.set(3/* id */, _5id1/* compressed */);
function State5(l: Lexer): void {
    prod = -1;
    if (idm5.has(l.id)) idm5.get(l.id)(l);
    else if (tym5.has(l.ty)) tym5.get(l.ty)(l);
}
const idm6: Map<number, (L: Lexer) => void> = new Map();
const _6id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State223(l); return;
    //
};
idm6.set(12/* ; */, _6id0);
const _6id1 = (l: Lexer): void => {//AT_RULE=>import •

    stack_ptr -= 1;
    prod = 9;
    return;
};
idm6.set(46/* # */, _6id1);
idm6.set(60/* $ */, _6id1);
idm6.set(44/* * */, _6id1);
idm6.set(59/* - */, _6id1);
idm6.set(47/* . */, _6id1);
idm6.set(28/* : */, _6id1);
idm6.set(17/* @ */, _6id1);
idm6.set(48/* [ */, _6id1);
idm6.set(45/* | */, _6id1);
const tym6: Map<number, (L: Lexer) => void> = new Map();
tym6.set(0, _6id1/* compressed */);
tym6.set(3/* id */, _6id1/* compressed */);
function State6(l: Lexer): void {
    prod = -1;
    if (idm6.has(l.id)) idm6.get(l.id)(l);
    else if (tym6.has(l.ty)) tym6.get(l.ty)(l);
}
const idm7: Map<number, (L: Lexer) => void> = new Map();
const _7id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State224(l); return;
    //
};
idm7.set(12/* ; */, _7id0);
const _7id1 = (l: Lexer): void => {//AT_RULE=>keyframes •

    stack_ptr -= 1;
    prod = 9;
    return;
};
idm7.set(46/* # */, _7id1);
idm7.set(60/* $ */, _7id1);
idm7.set(44/* * */, _7id1);
idm7.set(59/* - */, _7id1);
idm7.set(47/* . */, _7id1);
idm7.set(28/* : */, _7id1);
idm7.set(17/* @ */, _7id1);
idm7.set(48/* [ */, _7id1);
idm7.set(45/* | */, _7id1);
const tym7: Map<number, (L: Lexer) => void> = new Map();
tym7.set(0, _7id1/* compressed */);
tym7.set(3/* id */, _7id1/* compressed */);
function State7(l: Lexer): void {
    prod = -1;
    if (idm7.has(l.id)) idm7.get(l.id)(l);
    else if (tym7.has(l.ty)) tym7.get(l.ty)(l);
}
const idm8: Map<number, (L: Lexer) => void> = new Map();
const _8id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State225(l); return;
    //
};
idm8.set(12/* ; */, _8id0);
const _8id1 = (l: Lexer): void => {//AT_RULE=>supports •

    stack_ptr -= 1;
    prod = 9;
    return;
};
idm8.set(46/* # */, _8id1);
idm8.set(60/* $ */, _8id1);
idm8.set(44/* * */, _8id1);
idm8.set(59/* - */, _8id1);
idm8.set(47/* . */, _8id1);
idm8.set(28/* : */, _8id1);
idm8.set(17/* @ */, _8id1);
idm8.set(48/* [ */, _8id1);
idm8.set(45/* | */, _8id1);
const tym8: Map<number, (L: Lexer) => void> = new Map();
tym8.set(0, _8id1/* compressed */);
tym8.set(3/* id */, _8id1/* compressed */);
function State8(l: Lexer): void {
    prod = -1;
    if (idm8.has(l.id)) idm8.get(l.id)(l);
    else if (tym8.has(l.ty)) tym8.get(l.ty)(l);
}
const idm9: Map<number, (L: Lexer) => void> = new Map();
const _9id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State221(l); return;
    //
};
idm9.set(18/* import */, _9id0);
const _9id1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State227(l); return;
    //
};
idm9.set(19/* keyframes */, _9id1);
const _9id2 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State226(l); return;
    //
};
idm9.set(26/* media */, _9id2);
const _9id3 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State228(l); return;
    //
};
idm9.set(14/* supports */, _9id3);
function State9(l: Lexer): void {
    prod = -1;
    if (idm9.has(l.id)) idm9.get(l.id)(l);
}
const idm10: Map<number, (L: Lexer) => void> = new Map();
const _10id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State27(l);
    //
};
idm10.set(60/* $ */, _10id0);
const _10id1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State22(l);
    //
};
idm10.set(15/* ( */, _10id1);
const _10id2 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State29(l);
    //
};
idm10.set(59/* - */, _10id2);
const _10id3 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State21(l);
    //
};
idm10.set(24/* not */, _10id3);
idm10.set(27/* only */, _0id35/* compressed */);
const tym10: Map<number, (L: Lexer) => void> = new Map();
const _10ty0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State28(l);
    //
};
tym10.set(3/* id */, _10ty0);
function $import_HC_listbody5_108(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm10.has(l.id)) idm10.get(l.id)(l);
    else if (tym10.has(l.ty)) tym10.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State25(l);
                continue;
            case 61:
                State15(l);
                continue;
            case 52:
                State24(l);
                continue;
            case 49:
                State23(l);
                continue;
            case 47:
                State20(l);
                continue;
            case 46:
                State17(l);
                continue;
            case 43:
                State19(l);
                continue;
            case 40:
                State18(l);
                continue;
            case 39:
                State16(l);
                continue;
            case 38:
                State13(l);
                continue;
            case 37:
                State12(l);
                continue;
            case 35:
                State14(l);
                continue;
            case 13:
                State11(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![13].includes(a)) fail(l);
}
function State11(l: Lexer): void {
    prod = -1;
    if ([10/* , */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State229(l); return;
        //

    }
}
function State12(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 12/* ; */, 17/* @ */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //import_HC_listbody5_108=>media_query •

        add_reduce(1, 35);
        stack_ptr -= 1;
        prod = 13;
        return;
    }
}
function State13(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 12/* ; */, 17/* @ */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //media_query=>media_condition •

        add_reduce(1, 80);
        stack_ptr -= 1;
        prod = 37;
        return;
    }
}
const idm14: Map<number, (L: Lexer) => void> = new Map();
idm14.set(60/* $ */, _10id0/* compressed */);
idm14.set(59/* - */, _10id2/* compressed */);
const tym14: Map<number, (L: Lexer) => void> = new Map();
tym14.set(3/* id */, _10ty0/* compressed */);
function State14(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm14.has(l.id)) idm14.get(l.id)(l);
    else if (tym14.has(l.ty)) tym14.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State234(l);
                continue;
            case 61:
                State233(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![37].includes(a)) fail(l);
}
const idm15: Map<number, (L: Lexer) => void> = new Map();
const _15id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State231(l);
    //
};
idm15.set(22/* and */, _15id0);
const _15id1 = (l: Lexer): void => {//media_query=>media_type •

    add_reduce(1, 84);
    stack_ptr -= 1;
    prod = 37;
    return;
};
idm15.set(46/* # */, _15id1);
idm15.set(60/* $ */, _15id1);
idm15.set(44/* * */, _15id1);
idm15.set(10/* , */, _15id1);
idm15.set(59/* - */, _15id1);
idm15.set(47/* . */, _15id1);
idm15.set(28/* : */, _15id1);
idm15.set(12/* ; */, _15id1);
idm15.set(17/* @ */, _15id1);
idm15.set(48/* [ */, _15id1);
idm15.set(11/* { */, _15id1);
idm15.set(45/* | */, _15id1);
const tym15: Map<number, (L: Lexer) => void> = new Map();
tym15.set(0, _15id1/* compressed */);
tym15.set(3/* id */, _15id1/* compressed */);
function State15(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm15.has(l.id)) idm15.get(l.id)(l);
    else if (tym15.has(l.ty)) tym15.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 36:
                State230(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![37].includes(a)) fail(l);
}
function State16(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 12/* ; */, 16/* ) */, 17/* @ */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //media_condition=>media_condition_without_or •

        stack_ptr -= 1;
        prod = 38;
        return;
    }
}
function State17(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 12/* ; */, 16/* ) */, 17/* @ */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //media_condition=>media_or •

        stack_ptr -= 1;
        prod = 38;
        return;
    }
}
function State18(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 12/* ; */, 16/* ) */, 17/* @ */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //media_condition_without_or=>media_not •

        stack_ptr -= 1;
        prod = 39;
        return;
    }
}
function State19(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 12/* ; */, 16/* ) */, 17/* @ */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //media_condition_without_or=>media_and •

        stack_ptr -= 1;
        prod = 39;
        return;
    }
}
const idm20: Map<number, (L: Lexer) => void> = new Map();
const _20id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State76(l);
    //
};
idm20.set(22/* and */, _20id0);
const _20id1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State108(l);
    //
};
idm20.set(23/* or */, _20id1);
const _20id2 = (l: Lexer): void => {//media_condition_without_or=>media_in_parenths •

    stack_ptr -= 1;
    prod = 39;
    return;
};
idm20.set(46/* # */, _20id2);
idm20.set(60/* $ */, _20id2);
idm20.set(16/* ) */, _20id2);
idm20.set(44/* * */, _20id2);
idm20.set(10/* , */, _20id2);
idm20.set(59/* - */, _20id2);
idm20.set(47/* . */, _20id2);
idm20.set(28/* : */, _20id2);
idm20.set(12/* ; */, _20id2);
idm20.set(17/* @ */, _20id2);
idm20.set(48/* [ */, _20id2);
idm20.set(11/* { */, _20id2);
idm20.set(45/* | */, _20id2);
const tym20: Map<number, (L: Lexer) => void> = new Map();
tym20.set(0, _20id2/* compressed */);
tym20.set(3/* id */, _20id2/* compressed */);
function State20(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm20.has(l.id)) idm20.get(l.id)(l);
    else if (tym20.has(l.ty)) tym20.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 45:
                State236(l);
                continue;
            case 44:
                State107(l);
                continue;
            case 42:
                State235(l);
                continue;
            case 41:
                State75(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![39, 43, 46].includes(a)) fail(l);
}
const idm21: Map<number, (L: Lexer) => void> = new Map();
const _21id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State27(l);
    if (prod >= 0) return; else FAILED = false;
    //media_query_group_043_116=>not •

    stack_ptr -= 1;
    prod = 35;
    return;
};
idm21.set(60/* $ */, _21id0);
idm21.set(15/* ( */, _10id1/* compressed */);
const _21id2 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State29(l);
    if (prod >= 0) return; else FAILED = false;
    //media_query_group_043_116=>not •

    stack_ptr -= 1;
    prod = 35;
    return;
};
idm21.set(59/* - */, _21id2);
const tym21: Map<number, (L: Lexer) => void> = new Map();
const _21ty0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State28(l);
    if (prod >= 0) return; else FAILED = false;
    //media_query_group_043_116=>not •

    stack_ptr -= 1;
    prod = 35;
    return;
};
tym21.set(3/* id */, _21ty0);
function State21(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm21.has(l.id)) idm21.get(l.id)(l);
    else if (tym21.has(l.ty)) tym21.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State42(l);
                continue;
            case 52:
                State24(l);
                continue;
            case 49:
                State23(l);
                continue;
            case 47:
                State238(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![40, 35].includes(a)) fail(l);
}
const idm22: Map<number, (L: Lexer) => void> = new Map();
idm22.set(60/* $ */, _10id0/* compressed */);
idm22.set(15/* ( */, _10id1/* compressed */);
idm22.set(59/* - */, _10id2/* compressed */);
idm22.set(35/* false */, _0id27/* compressed */);
const _22id4 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State72(l);
    //
};
idm22.set(24/* not */, _22id4);
const _22id5 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State150(l);
    //
};
idm22.set(34/* true */, _22id5);
const tym22: Map<number, (L: Lexer) => void> = new Map();
tym22.set(3/* id */, _10ty0/* compressed */);
const _22ty1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State117(l);
    //
};
tym22.set(2/* num */, _22ty1);
function State22(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm22.has(l.id)) idm22.get(l.id)(l);
    else if (tym22.has(l.ty)) tym22.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State248(l);
                continue;
            case 64:
                State118(l);
                continue;
            case 62:
                State120(l);
                continue;
            case 60:
                State149(l);
                continue;
            case 59:
                State147(l);
                continue;
            case 58:
                State130(l);
                continue;
            case 57:
                State148(l);
                continue;
            case 53:
                State146(l);
                continue;
            case 52:
                State24(l);
                continue;
            case 49:
                State23(l);
                continue;
            case 48:
                State247(l);
                continue;
            case 47:
                State20(l);
                continue;
            case 46:
                State17(l);
                continue;
            case 43:
                State19(l);
                continue;
            case 40:
                State18(l);
                continue;
            case 39:
                State16(l);
                continue;
            case 38:
                State246(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![47, 49].includes(a)) fail(l);
}
function State23(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 12/* ; */, 16/* ) */, 17/* @ */, 22/* and */, 23/* or */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //media_in_parenths=>media_feature •

        stack_ptr -= 1;
        prod = 47;
        return;
    }
}
function State24(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 12/* ; */, 16/* ) */, 17/* @ */, 22/* and */, 23/* or */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //media_in_parenths=>general_enclosed •

        stack_ptr -= 1;
        prod = 47;
        return;
    }
}
const idm25: Map<number, (L: Lexer) => void> = new Map();
const _25id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State237(l); return;
    //
};
idm25.set(15/* ( */, _25id0);
const _25id1 = (l: Lexer): void => {//media_type=>identifier •

    add_reduce(1, 133);
    stack_ptr -= 1;
    prod = 61;
    return;
};
idm25.set(46/* # */, _25id1);
idm25.set(60/* $ */, _25id1);
idm25.set(44/* * */, _25id1);
idm25.set(10/* , */, _25id1);
idm25.set(59/* - */, _25id1);
idm25.set(47/* . */, _25id1);
idm25.set(28/* : */, _25id1);
idm25.set(12/* ; */, _25id1);
idm25.set(17/* @ */, _25id1);
idm25.set(48/* [ */, _25id1);
idm25.set(22/* and */, _25id1);
idm25.set(11/* { */, _25id1);
idm25.set(45/* | */, _25id1);
const tym25: Map<number, (L: Lexer) => void> = new Map();
tym25.set(0, _25id1/* compressed */);
tym25.set(3/* id */, _25id1/* compressed */);
function State25(l: Lexer): void {
    prod = -1;
    if (idm25.has(l.id)) idm25.get(l.id)(l);
    else if (tym25.has(l.ty)) tym25.get(l.ty)(l);
}
const idm26: Map<number, (L: Lexer) => void> = new Map();
const _26id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State242(l); return;
    if (prod >= 0) return; else FAILED = false;
    //identifier=>css_id_symbols •

    stack_ptr -= 1;
    prod = 102;
    return;
};
idm26.set(60/* $ */, _26id0);
const _26id1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State241(l); return;
    if (prod >= 0) return; else FAILED = false;
    //identifier=>css_id_symbols •

    stack_ptr -= 1;
    prod = 102;
    return;
};
idm26.set(59/* - */, _26id1);
const _26id2 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State240(l); return;
    //
};
idm26.set(58/* _ */, _26id2);
const _26id3 = (l: Lexer): void => {//identifier=>css_id_symbols •

    stack_ptr -= 1;
    prod = 102;
    return;
};
idm26.set(46/* # */, _26id3);
idm26.set(52/* $= */, _26id3);
idm26.set(15/* ( */, _26id3);
idm26.set(16/* ) */, _26id3);
idm26.set(44/* * */, _26id3);
idm26.set(53/* *= */, _26id3);
idm26.set(41/* + */, _26id3);
idm26.set(10/* , */, _26id3);
idm26.set(47/* . */, _26id3);
idm26.set(28/* : */, _26id3);
idm26.set(12/* ; */, _26id3);
idm26.set(29/* < */, _26id3);
idm26.set(30/* <= */, _26id3);
idm26.set(33/* = */, _26id3);
idm26.set(40/* > */, _26id3);
idm26.set(32/* >= */, _26id3);
idm26.set(17/* @ */, _26id3);
idm26.set(48/* [ */, _26id3);
idm26.set(49/* ] */, _26id3);
idm26.set(51/* ^= */, _26id3);
idm26.set(22/* and */, _26id3);
idm26.set(54/* i */, _26id3);
idm26.set(55/* s */, _26id3);
idm26.set(11/* { */, _26id3);
idm26.set(45/* | */, _26id3);
idm26.set(43/* || */, _26id3);
idm26.set(42/* ~ */, _26id3);
const tym26: Map<number, (L: Lexer) => void> = new Map();
const _26ty0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State239(l); return;
    if (prod >= 0) return; else FAILED = false;
    //identifier=>css_id_symbols •

    stack_ptr -= 1;
    prod = 102;
    return;
};
tym26.set(3/* id */, _26ty0);
const _26ty1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State243(l); return;
    //
};
tym26.set(2/* num */, _26ty1);
tym26.set(0, _26id3/* compressed */);
tym26.set(1/* ws */, _26id3/* compressed */);
function State26(l: Lexer): void {
    prod = -1;
    if (idm26.has(l.id)) idm26.get(l.id)(l);
    else if (tym26.has(l.ty)) tym26.get(l.ty)(l);
}
function State27(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 12/* ; */, 15/* ( */, 16/* ) */, 17/* @ */, 22/* and */, 28/* : */, 29/* < */, 30/* <= */, 32/* >= */, 33/* = */, 40/* > */, 41/* + */, 42/* ~ */, 43/* || */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 49/* ] */, 51/* ^= */, 52/* $= */, 53/* *= */, 54/* i */, 55/* s */, 58/* _ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */].includes(l.ty)) {
        //css_id_symbols=>$ •

        stack_ptr -= 1;
        prod = 103;
        return;
    }
}
function State28(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 12/* ; */, 15/* ( */, 16/* ) */, 17/* @ */, 22/* and */, 28/* : */, 29/* < */, 30/* <= */, 32/* >= */, 33/* = */, 40/* > */, 41/* + */, 42/* ~ */, 43/* || */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 49/* ] */, 51/* ^= */, 52/* $= */, 53/* *= */, 54/* i */, 55/* s */, 58/* _ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */].includes(l.ty)) {
        //css_id_symbols=>θid •

        stack_ptr -= 1;
        prod = 103;
        return;
    }
}
function State29(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 12/* ; */, 15/* ( */, 16/* ) */, 17/* @ */, 22/* and */, 28/* : */, 29/* < */, 30/* <= */, 32/* >= */, 33/* = */, 40/* > */, 41/* + */, 42/* ~ */, 43/* || */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 49/* ] */, 51/* ^= */, 52/* $= */, 53/* *= */, 54/* i */, 55/* s */, 58/* _ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */].includes(l.ty)) {
        //css_id_symbols=>- •

        stack_ptr -= 1;
        prod = 103;
        return;
    }
}
function State30(l: Lexer): void {
    prod = -1;
    if ([59/* - */, 60/* $ */].includes(l.id) || [3/* id */].includes(l.ty)) {
        //media_query_group_043_116=>only •

        stack_ptr -= 1;
        prod = 35;
        return;
    }
}
const idm31: Map<number, (L: Lexer) => void> = new Map();
idm31.set(60/* $ */, _10id0/* compressed */);
const _31id1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State36(l);
    //
};
idm31.set(15/* ( */, _31id1);
idm31.set(59/* - */, _10id2/* compressed */);
const _31id3 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State34(l);
    //
};
idm31.set(24/* not */, _31id3);
idm31.set(25/* selector */, _0id38/* compressed */);
const tym31: Map<number, (L: Lexer) => void> = new Map();
tym31.set(3/* id */, _10ty0/* compressed */);
function $import_group_014_106(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm31.has(l.id)) idm31.get(l.id)(l);
    else if (tym31.has(l.ty)) tym31.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 104:
                State45(l);
                continue;
            case 103:
                State43(l);
                continue;
            case 102:
                State42(l);
                continue;
            case 98:
                State44(l);
                continue;
            case 52:
                State38(l);
                continue;
            case 30:
                State39(l);
                continue;
            case 29:
                State40(l);
                continue;
            case 28:
                State37(l);
                continue;
            case 27:
                State35(l);
                continue;
            case 26:
                State32(l);
                continue;
            case 15:
                State33(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![11].includes(a)) fail(l);
}
function State32(l: Lexer): void {
    prod = -1;
    if ([16/* ) */].includes(l.id) || [0].includes(l.ty)) {
        //import_group_014_106=>supports_condition •

        stack_ptr -= 1;
        prod = 11;
        return;
    }
}
function State33(l: Lexer): void {
    prod = -1;
    if ([16/* ) */].includes(l.id) || [0].includes(l.ty)) {
        //import_group_014_106=>import_declaration •

        stack_ptr -= 1;
        prod = 11;
        return;
    }
}
const idm34: Map<number, (L: Lexer) => void> = new Map();
idm34.set(60/* $ */, _10id0/* compressed */);
idm34.set(15/* ( */, _31id1/* compressed */);
idm34.set(59/* - */, _10id2/* compressed */);
idm34.set(25/* selector */, _0id38/* compressed */);
const tym34: Map<number, (L: Lexer) => void> = new Map();
tym34.set(3/* id */, _10ty0/* compressed */);
function State34(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm34.has(l.id)) idm34.get(l.id)(l);
    else if (tym34.has(l.ty)) tym34.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State42(l);
                continue;
            case 52:
                State38(l);
                continue;
            case 30:
                State39(l);
                continue;
            case 29:
                State40(l);
                continue;
            case 28:
                State37(l);
                continue;
            case 27:
                State245(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![26].includes(a)) fail(l);
}
const idm35: Map<number, (L: Lexer) => void> = new Map();
const _35id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State60(l);
    //
};
idm35.set(22/* and */, _35id0);
const _35id1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State61(l);
    //
};
idm35.set(23/* or */, _35id1);
const _35id2 = (l: Lexer): void => {//supports_condition=>supports_in_parens •

    add_reduce(1, 62);
    stack_ptr -= 1;
    prod = 26;
    return;
};
idm35.set(16/* ) */, _35id2);
idm35.set(11/* { */, _35id2);
const tym35: Map<number, (L: Lexer) => void> = new Map();
tym35.set(0, _35id2/* compressed */);
function State35(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm35.has(l.id)) idm35.get(l.id)(l);
    else if (tym35.has(l.ty)) tym35.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 25:
                State244(l);
                continue;
            case 24:
                State59(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![26].includes(a)) fail(l);
}
const idm36: Map<number, (L: Lexer) => void> = new Map();
idm36.set(60/* $ */, _10id0/* compressed */);
idm36.set(15/* ( */, _31id1/* compressed */);
idm36.set(59/* - */, _10id2/* compressed */);
idm36.set(24/* not */, _31id3/* compressed */);
idm36.set(25/* selector */, _0id38/* compressed */);
const tym36: Map<number, (L: Lexer) => void> = new Map();
tym36.set(3/* id */, _10ty0/* compressed */);
function State36(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm36.has(l.id)) idm36.get(l.id)(l);
    else if (tym36.has(l.ty)) tym36.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 104:
                State45(l);
                continue;
            case 103:
                State43(l);
                continue;
            case 102:
                State42(l);
                continue;
            case 98:
                State251(l);
                continue;
            case 52:
                State38(l);
                continue;
            case 30:
                State39(l);
                continue;
            case 29:
                State40(l);
                continue;
            case 28:
                State37(l);
                continue;
            case 27:
                State35(l);
                continue;
            case 26:
                State250(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![27, 29].includes(a)) fail(l);
}
function State37(l: Lexer): void {
    prod = -1;
    if ([11/* { */, 16/* ) */, 22/* and */, 23/* or */].includes(l.id) || [0].includes(l.ty)) {
        //supports_in_parens=>supports_feature •

        stack_ptr -= 1;
        prod = 27;
        return;
    }
}
function State38(l: Lexer): void {
    prod = -1;
    if ([11/* { */, 16/* ) */, 22/* and */, 23/* or */].includes(l.id) || [0].includes(l.ty)) {
        //supports_in_parens=>general_enclosed •

        stack_ptr -= 1;
        prod = 27;
        return;
    }
}
function State39(l: Lexer): void {
    prod = -1;
    if ([11/* { */, 16/* ) */, 22/* and */, 23/* or */].includes(l.id) || [0].includes(l.ty)) {
        //supports_feature=>supports_feature_fn •

        stack_ptr -= 1;
        prod = 28;
        return;
    }
}
function State40(l: Lexer): void {
    prod = -1;
    if ([11/* { */, 16/* ) */, 22/* and */, 23/* or */].includes(l.id) || [0].includes(l.ty)) {
        //supports_feature=>supports_decl •

        stack_ptr -= 1;
        prod = 28;
        return;
    }
}
function State41(l: Lexer): void {
    prod = -1;
    if ([15/* ( */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State249(l); return;
        //

    }
}
function State42(l: Lexer): void {
    prod = -1;
    if ([15/* ( */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State237(l); return;
        //

    }
}
const idm43: Map<number, (L: Lexer) => void> = new Map();
const _43id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State242(l); return;
    //
};
idm43.set(60/* $ */, _43id0);
const _43id1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State241(l); return;
    //
};
idm43.set(59/* - */, _43id1);
idm43.set(58/* _ */, _26id2/* compressed */);
idm43.set(15/* ( */, _26id3/* compressed */);
const _43id4 = (l: Lexer): void => {//declaration_id=>css_id_symbols •

    stack_ptr -= 1;
    prod = 104;
    return;
};
idm43.set(28/* : */, _43id4);
const tym43: Map<number, (L: Lexer) => void> = new Map();
const _43ty0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State239(l); return;
    //
};
tym43.set(3/* id */, _43ty0);
tym43.set(2/* num */, _26ty1/* compressed */);
tym43.set(1/* ws */, _26id3/* compressed */);
function State43(l: Lexer): void {
    prod = -1;
    if (idm43.has(l.id)) idm43.get(l.id)(l);
    else if (tym43.has(l.ty)) tym43.get(l.ty)(l);
}
function State44(l: Lexer): void {
    prod = -1;
    if ([16/* ) */].includes(l.id) || [0].includes(l.ty)) {
        //import_declaration=>declaration •

        stack_ptr -= 1;
        prod = 15;
        return;
    }
}
function State45(l: Lexer): void {
    prod = -1;
    if ([28/* : */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State252(l); return;
        //

    }
}
const idm46: Map<number, (L: Lexer) => void> = new Map();
idm46.set(20/* from */, _0id28/* compressed */);
idm46.set(21/* to */, _0id40/* compressed */);
const tym46: Map<number, (L: Lexer) => void> = new Map();
const _46ty0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State54(l);
    //
};
tym46.set(2/* num */, _46ty0);
function $keyframes_HC_listbody5_109(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm46.has(l.id)) idm46.get(l.id)(l);
    else if (tym46.has(l.ty)) tym46.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 63:
                State53(l);
                continue;
            case 21:
                State50(l);
                continue;
            case 20:
                State48(l);
                continue;
            case 19:
                State49(l);
                continue;
            case 16:
                State47(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![16].includes(a)) fail(l);
}
const idm47: Map<number, (L: Lexer) => void> = new Map();
idm47.set(20/* from */, _0id28/* compressed */);
idm47.set(21/* to */, _0id40/* compressed */);
const tym47: Map<number, (L: Lexer) => void> = new Map();
tym47.set(2/* num */, _46ty0/* compressed */);
function State47(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm47.has(l.id)) idm47.get(l.id)(l);
    else if (tym47.has(l.ty)) tym47.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 63:
                State53(l);
                continue;
            case 21:
                State50(l);
                continue;
            case 20:
                State255(l);
                continue;
            case 19:
                State49(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![16].includes(a)) fail(l);
}
function State48(l: Lexer): void {
    prod = -1;
    if ([13/* } */, 20/* from */, 21/* to */].includes(l.id) || [0, 2/* num */].includes(l.ty)) {
        //keyframes_HC_listbody5_109=>keyframes_blocks •

        add_reduce(1, 42);
        stack_ptr -= 1;
        prod = 16;
        return;
    }
}
const idm49: Map<number, (L: Lexer) => void> = new Map();
const _49id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State254(l); return;
    //
};
idm49.set(10/* , */, _49id0);
const _49id1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State253(l); return;
    //
};
idm49.set(11/* { */, _49id1);
function State49(l: Lexer): void {
    prod = -1;
    if (idm49.has(l.id)) idm49.get(l.id)(l);
}
function State50(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */].includes(l.id) || [0].includes(l.ty)) {
        //keyframes_blocks_HC_listbody1_110=>keyframe_selector •

        add_reduce(1, 47);
        stack_ptr -= 1;
        prod = 19;
        return;
    }
}
function State51(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */].includes(l.id) || [0].includes(l.ty)) {
        //keyframe_selector=>from •

        add_reduce(1, 50);
        stack_ptr -= 1;
        prod = 21;
        return;
    }
}
function State52(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */].includes(l.id) || [0].includes(l.ty)) {
        //keyframe_selector=>to •

        add_reduce(1, 51);
        stack_ptr -= 1;
        prod = 21;
        return;
    }
}
function State53(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */].includes(l.id) || [0].includes(l.ty)) {
        //keyframe_selector=>percentage •

        add_reduce(1, 52);
        stack_ptr -= 1;
        prod = 21;
        return;
    }
}
function State54(l: Lexer): void {
    prod = -1;
    if ([37/* % */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State280(l); return;
        //

    }
}
const idm55: Map<number, (L: Lexer) => void> = new Map();
idm55.set(20/* from */, _0id28/* compressed */);
idm55.set(21/* to */, _0id40/* compressed */);
const tym55: Map<number, (L: Lexer) => void> = new Map();
tym55.set(2/* num */, _46ty0/* compressed */);
function $keyframes_blocks_HC_listbody1_110(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm55.has(l.id)) idm55.get(l.id)(l);
    else if (tym55.has(l.ty)) tym55.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 63:
                State53(l);
                continue;
            case 21:
                State50(l);
                continue;
            case 19:
                State56(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![19].includes(a)) fail(l);
}
function State56(l: Lexer): void {
    prod = -1;
    if ([10/* , */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State254(l); return;
        //

    }
}
const idm57: Map<number, (L: Lexer) => void> = new Map();
idm57.set(22/* and */, _35id0/* compressed */);
idm57.set(23/* or */, _35id1/* compressed */);
function $supports_condition_HC_listbody2_113(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm57.has(l.id)) idm57.get(l.id)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 25:
                State58(l);
                continue;
            case 24:
                State59(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![25].includes(a)) fail(l);
}
const idm58: Map<number, (L: Lexer) => void> = new Map();
idm58.set(22/* and */, _35id0/* compressed */);
idm58.set(23/* or */, _35id1/* compressed */);
function State58(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm58.has(l.id)) idm58.get(l.id)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 24:
                State281(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![25].includes(a)) fail(l);
}
function State59(l: Lexer): void {
    prod = -1;
    if ([11/* { */, 16/* ) */, 22/* and */, 23/* or */].includes(l.id) || [0].includes(l.ty)) {
        //supports_condition_HC_listbody2_113=>supports_condition_group_129_112 •

        add_reduce(1, 59);
        stack_ptr -= 1;
        prod = 25;
        return;
    }
}
const idm60: Map<number, (L: Lexer) => void> = new Map();
idm60.set(60/* $ */, _10id0/* compressed */);
idm60.set(15/* ( */, _31id1/* compressed */);
idm60.set(59/* - */, _10id2/* compressed */);
idm60.set(25/* selector */, _0id38/* compressed */);
const tym60: Map<number, (L: Lexer) => void> = new Map();
tym60.set(3/* id */, _10ty0/* compressed */);
function State60(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm60.has(l.id)) idm60.get(l.id)(l);
    else if (tym60.has(l.ty)) tym60.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State42(l);
                continue;
            case 52:
                State38(l);
                continue;
            case 30:
                State39(l);
                continue;
            case 29:
                State40(l);
                continue;
            case 28:
                State37(l);
                continue;
            case 27:
                State282(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![24].includes(a)) fail(l);
}
const idm61: Map<number, (L: Lexer) => void> = new Map();
idm61.set(60/* $ */, _10id0/* compressed */);
idm61.set(15/* ( */, _31id1/* compressed */);
idm61.set(59/* - */, _10id2/* compressed */);
idm61.set(25/* selector */, _0id38/* compressed */);
const tym61: Map<number, (L: Lexer) => void> = new Map();
tym61.set(3/* id */, _10ty0/* compressed */);
function State61(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm61.has(l.id)) idm61.get(l.id)(l);
    else if (tym61.has(l.ty)) tym61.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State42(l);
                continue;
            case 52:
                State38(l);
                continue;
            case 30:
                State39(l);
                continue;
            case 29:
                State40(l);
                continue;
            case 28:
                State37(l);
                continue;
            case 27:
                State283(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![24].includes(a)) fail(l);
}
const idm62: Map<number, (L: Lexer) => void> = new Map();
idm62.set(60/* $ */, _10id0/* compressed */);
idm62.set(15/* ( */, _31id1/* compressed */);
idm62.set(59/* - */, _10id2/* compressed */);
idm62.set(25/* selector */, _0id38/* compressed */);
const tym62: Map<number, (L: Lexer) => void> = new Map();
tym62.set(3/* id */, _10ty0/* compressed */);
function $supports_in_parens(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm62.has(l.id)) idm62.get(l.id)(l);
    else if (tym62.has(l.ty)) tym62.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State42(l);
                continue;
            case 52:
                State38(l);
                continue;
            case 30:
                State39(l);
                continue;
            case 29:
                State40(l);
                continue;
            case 28:
                State37(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![27].includes(a)) fail(l);
}
const idm63: Map<number, (L: Lexer) => void> = new Map();
idm63.set(60/* $ */, _10id0/* compressed */);
idm63.set(15/* ( */, _10id1/* compressed */);
idm63.set(59/* - */, _10id2/* compressed */);
idm63.set(24/* not */, _10id3/* compressed */);
idm63.set(27/* only */, _0id35/* compressed */);
const tym63: Map<number, (L: Lexer) => void> = new Map();
tym63.set(3/* id */, _10ty0/* compressed */);
function $media_queries_HC_listbody7_114(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm63.has(l.id)) idm63.get(l.id)(l);
    else if (tym63.has(l.ty)) tym63.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State25(l);
                continue;
            case 61:
                State15(l);
                continue;
            case 52:
                State24(l);
                continue;
            case 49:
                State23(l);
                continue;
            case 47:
                State20(l);
                continue;
            case 46:
                State17(l);
                continue;
            case 43:
                State19(l);
                continue;
            case 40:
                State18(l);
                continue;
            case 39:
                State16(l);
                continue;
            case 38:
                State13(l);
                continue;
            case 37:
                State65(l);
                continue;
            case 35:
                State14(l);
                continue;
            case 32:
                State64(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![32].includes(a)) fail(l);
}
function State64(l: Lexer): void {
    prod = -1;
    if ([10/* , */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State289(l); return;
        //

    }
}
function State65(l: Lexer): void {
    prod = -1;
    if ([10/* , */].includes(l.id) || [0].includes(l.ty)) {
        //media_queries_HC_listbody7_114=>media_query •

        add_reduce(1, 73);
        stack_ptr -= 1;
        prod = 32;
        return;
    }
}
const idm66: Map<number, (L: Lexer) => void> = new Map();
idm66.set(60/* $ */, _10id0/* compressed */);
idm66.set(15/* ( */, _10id1/* compressed */);
idm66.set(59/* - */, _10id2/* compressed */);
idm66.set(24/* not */, _10id3/* compressed */);
idm66.set(27/* only */, _0id35/* compressed */);
const tym66: Map<number, (L: Lexer) => void> = new Map();
tym66.set(3/* id */, _10ty0/* compressed */);
function $media_queries_group_039_115(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm66.has(l.id)) idm66.get(l.id)(l);
    else if (tym66.has(l.ty)) tym66.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State25(l);
                continue;
            case 61:
                State15(l);
                continue;
            case 52:
                State24(l);
                continue;
            case 49:
                State23(l);
                continue;
            case 47:
                State20(l);
                continue;
            case 46:
                State17(l);
                continue;
            case 43:
                State19(l);
                continue;
            case 40:
                State18(l);
                continue;
            case 39:
                State16(l);
                continue;
            case 38:
                State13(l);
                continue;
            case 37:
                State68(l);
                continue;
            case 35:
                State14(l);
                continue;
            case 33:
                State67(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![33].includes(a)) fail(l);
}
function State67(l: Lexer): void {
    prod = -1;
    if ([10/* , */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State290(l); return;
        //

    }
}
function State68(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */].includes(l.id) || [0].includes(l.ty)) {
        //media_queries_group_039_115=>media_query •

        add_reduce(1, 75);
        stack_ptr -= 1;
        prod = 33;
        return;
    }
}
const idm69: Map<number, (L: Lexer) => void> = new Map();
idm69.set(60/* $ */, _10id0/* compressed */);
idm69.set(15/* ( */, _10id1/* compressed */);
idm69.set(59/* - */, _10id2/* compressed */);
idm69.set(24/* not */, _10id3/* compressed */);
idm69.set(27/* only */, _0id35/* compressed */);
const tym69: Map<number, (L: Lexer) => void> = new Map();
tym69.set(3/* id */, _10ty0/* compressed */);
function $media_query(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm69.has(l.id)) idm69.get(l.id)(l);
    else if (tym69.has(l.ty)) tym69.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State25(l);
                continue;
            case 61:
                State15(l);
                continue;
            case 52:
                State24(l);
                continue;
            case 49:
                State23(l);
                continue;
            case 47:
                State20(l);
                continue;
            case 46:
                State17(l);
                continue;
            case 43:
                State19(l);
                continue;
            case 40:
                State18(l);
                continue;
            case 39:
                State16(l);
                continue;
            case 38:
                State13(l);
                continue;
            case 35:
                State14(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![37].includes(a)) fail(l);
}
const idm70: Map<number, (L: Lexer) => void> = new Map();
idm70.set(60/* $ */, _10id0/* compressed */);
idm70.set(15/* ( */, _10id1/* compressed */);
idm70.set(59/* - */, _10id2/* compressed */);
idm70.set(24/* not */, _22id4/* compressed */);
const tym70: Map<number, (L: Lexer) => void> = new Map();
tym70.set(3/* id */, _10ty0/* compressed */);
function $media_condition_without_or(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm70.has(l.id)) idm70.get(l.id)(l);
    else if (tym70.has(l.ty)) tym70.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State42(l);
                continue;
            case 52:
                State24(l);
                continue;
            case 49:
                State23(l);
                continue;
            case 47:
                State71(l);
                continue;
            case 43:
                State19(l);
                continue;
            case 40:
                State18(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![39].includes(a)) fail(l);
}
const idm71: Map<number, (L: Lexer) => void> = new Map();
idm71.set(22/* and */, _20id0/* compressed */);
idm71.set(46/* # */, _20id2/* compressed */);
idm71.set(60/* $ */, _20id2/* compressed */);
idm71.set(16/* ) */, _20id2/* compressed */);
idm71.set(44/* * */, _20id2/* compressed */);
idm71.set(10/* , */, _20id2/* compressed */);
idm71.set(59/* - */, _20id2/* compressed */);
idm71.set(47/* . */, _20id2/* compressed */);
idm71.set(28/* : */, _20id2/* compressed */);
idm71.set(12/* ; */, _20id2/* compressed */);
idm71.set(17/* @ */, _20id2/* compressed */);
idm71.set(48/* [ */, _20id2/* compressed */);
idm71.set(11/* { */, _20id2/* compressed */);
idm71.set(45/* | */, _20id2/* compressed */);
const tym71: Map<number, (L: Lexer) => void> = new Map();
tym71.set(0, _20id2/* compressed */);
tym71.set(3/* id */, _20id2/* compressed */);
function State71(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm71.has(l.id)) idm71.get(l.id)(l);
    else if (tym71.has(l.ty)) tym71.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 42:
                State235(l);
                continue;
            case 41:
                State75(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![39, 43].includes(a)) fail(l);
}
const idm72: Map<number, (L: Lexer) => void> = new Map();
idm72.set(60/* $ */, _10id0/* compressed */);
idm72.set(15/* ( */, _10id1/* compressed */);
idm72.set(59/* - */, _10id2/* compressed */);
const tym72: Map<number, (L: Lexer) => void> = new Map();
tym72.set(3/* id */, _10ty0/* compressed */);
function State72(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm72.has(l.id)) idm72.get(l.id)(l);
    else if (tym72.has(l.ty)) tym72.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State42(l);
                continue;
            case 52:
                State24(l);
                continue;
            case 49:
                State23(l);
                continue;
            case 47:
                State238(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![40].includes(a)) fail(l);
}
function $media_and_HC_listbody2_119(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if ([22/* and */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State76(l);
        //

    }
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 42:
                State74(l);
                continue;
            case 41:
                State75(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![42].includes(a)) fail(l);
}
function State74(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if ([22/* and */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State76(l);
        //

    }
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 41:
                State294(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![42].includes(a)) fail(l);
}
function State75(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 12/* ; */, 16/* ) */, 17/* @ */, 22/* and */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //media_and_HC_listbody2_119=>media_and_group_152_118 •

        add_reduce(1, 93);
        stack_ptr -= 1;
        prod = 42;
        return;
    }
}
const idm76: Map<number, (L: Lexer) => void> = new Map();
idm76.set(60/* $ */, _10id0/* compressed */);
idm76.set(15/* ( */, _10id1/* compressed */);
idm76.set(59/* - */, _10id2/* compressed */);
const tym76: Map<number, (L: Lexer) => void> = new Map();
tym76.set(3/* id */, _10ty0/* compressed */);
function State76(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm76.has(l.id)) idm76.get(l.id)(l);
    else if (tym76.has(l.ty)) tym76.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State42(l);
                continue;
            case 52:
                State24(l);
                continue;
            case 49:
                State23(l);
                continue;
            case 47:
                State296(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![41].includes(a)) fail(l);
}
const idm77: Map<number, (L: Lexer) => void> = new Map();
idm77.set(46/* # */, _0id2/* compressed */);
idm77.set(60/* $ */, _10id0/* compressed */);
const _77id2 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State86(l);
    //
};
idm77.set(44/* * */, _77id2);
idm77.set(59/* - */, _10id2/* compressed */);
idm77.set(47/* . */, _0id13/* compressed */);
const _77id5 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State98(l);
    //
};
idm77.set(28/* : */, _77id5);
idm77.set(48/* [ */, _0id20/* compressed */);
idm77.set(45/* | */, _0id43/* compressed */);
const tym77: Map<number, (L: Lexer) => void> = new Map();
tym77.set(3/* id */, _10ty0/* compressed */);
function $STYLE_RULE_HC_listbody2_103(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm77.has(l.id)) idm77.get(l.id)(l);
    else if (tym77.has(l.ty)) tym77.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State87(l);
                continue;
            case 90:
                State100(l);
                continue;
            case 89:
                State81(l);
                continue;
            case 86:
                State93(l);
                continue;
            case 84:
                State94(l);
                continue;
            case 82:
                State92(l);
                continue;
            case 81:
                State91(l);
                continue;
            case 80:
                State90(l);
                continue;
            case 79:
                State84(l);
                continue;
            case 78:
                State85(l);
                continue;
            case 77:
                State88(l);
                continue;
            case 75:
                State80(l);
                continue;
            case 74:
                State83(l);
                continue;
            case 73:
                State99(l);
                continue;
            case 71:
                State82(l);
                continue;
            case 70:
                State79(l);
                continue;
            case 5:
                State78(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![5].includes(a)) fail(l);
}
function State78(l: Lexer): void {
    prod = -1;
    if ([10/* , */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State295(l); return;
        //

    }
}
function State79(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */].includes(l.id) || [0].includes(l.ty)) {
        //STYLE_RULE_HC_listbody2_103=>COMPLEX_SELECTOR •

        add_reduce(1, 12);
        stack_ptr -= 1;
        prod = 5;
        return;
    }
}
const idm80: Map<number, (L: Lexer) => void> = new Map();
idm80.set(46/* # */, _0id2/* compressed */);
idm80.set(60/* $ */, _10id0/* compressed */);
idm80.set(44/* * */, _77id2/* compressed */);
idm80.set(41/* + */, _0id10/* compressed */);
idm80.set(59/* - */, _10id2/* compressed */);
idm80.set(47/* . */, _0id13/* compressed */);
idm80.set(28/* : */, _77id5/* compressed */);
idm80.set(40/* > */, _0id18/* compressed */);
idm80.set(48/* [ */, _0id20/* compressed */);
idm80.set(45/* | */, _0id43/* compressed */);
idm80.set(43/* || */, _0id44/* compressed */);
const _80id11 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State195(l);
    //
};
idm80.set(42/* ~ */, _80id11);
const _80id12 = (l: Lexer): void => {//COMPLEX_SELECTOR=>COMPOUND_SELECTOR •

    add_reduce(1, 145);
    stack_ptr -= 1;
    prod = 70;
    return;
};
idm80.set(16/* ) */, _80id12);
idm80.set(10/* , */, _80id12);
idm80.set(11/* { */, _80id12);
const tym80: Map<number, (L: Lexer) => void> = new Map();
tym80.set(3/* id */, _10ty0/* compressed */);
tym80.set(0, _80id12/* compressed */);
function State80(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm80.has(l.id)) idm80.get(l.id)(l);
    else if (tym80.has(l.ty)) tym80.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State87(l);
                continue;
            case 90:
                State100(l);
                continue;
            case 89:
                State81(l);
                continue;
            case 86:
                State93(l);
                continue;
            case 84:
                State94(l);
                continue;
            case 82:
                State92(l);
                continue;
            case 81:
                State91(l);
                continue;
            case 80:
                State90(l);
                continue;
            case 79:
                State84(l);
                continue;
            case 78:
                State85(l);
                continue;
            case 77:
                State88(l);
                continue;
            case 76:
                State192(l);
                continue;
            case 75:
                State191(l);
                continue;
            case 74:
                State83(l);
                continue;
            case 73:
                State99(l);
                continue;
            case 71:
                State82(l);
                continue;
            case 69:
                State307(l);
                continue;
            case 68:
                State189(l);
                continue;
            case 67:
                State190(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![70].includes(a)) fail(l);
}
const idm81: Map<number, (L: Lexer) => void> = new Map();
const _81id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State95(l);
    if (prod >= 0) return; else FAILED = false;
    //COMPOUND_SELECTOR=>TYPE_SELECTOR •

    add_reduce(1, 160);
    stack_ptr -= 1;
    prod = 75;
    return;
};
idm81.set(46/* # */, _81id0);
const _81id1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State96(l);
    if (prod >= 0) return; else FAILED = false;
    //COMPOUND_SELECTOR=>TYPE_SELECTOR •

    add_reduce(1, 160);
    stack_ptr -= 1;
    prod = 75;
    return;
};
idm81.set(47/* . */, _81id1);
const _81id2 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State98(l);
    if (prod >= 0) return; else FAILED = false;
    //COMPOUND_SELECTOR=>TYPE_SELECTOR •

    add_reduce(1, 160);
    stack_ptr -= 1;
    prod = 75;
    return;
};
idm81.set(28/* : */, _81id2);
const _81id3 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State97(l);
    if (prod >= 0) return; else FAILED = false;
    //COMPOUND_SELECTOR=>TYPE_SELECTOR •

    add_reduce(1, 160);
    stack_ptr -= 1;
    prod = 75;
    return;
};
idm81.set(48/* [ */, _81id3);
const _81id4 = (l: Lexer): void => {//COMPOUND_SELECTOR=>TYPE_SELECTOR •

    add_reduce(1, 160);
    stack_ptr -= 1;
    prod = 75;
    return;
};
idm81.set(60/* $ */, _81id4);
idm81.set(16/* ) */, _81id4);
idm81.set(44/* * */, _81id4);
idm81.set(41/* + */, _81id4);
idm81.set(10/* , */, _81id4);
idm81.set(59/* - */, _81id4);
idm81.set(40/* > */, _81id4);
idm81.set(11/* { */, _81id4);
idm81.set(45/* | */, _81id4);
idm81.set(43/* || */, _81id4);
idm81.set(42/* ~ */, _81id4);
const tym81: Map<number, (L: Lexer) => void> = new Map();
tym81.set(0, _81id4/* compressed */);
tym81.set(3/* id */, _81id4/* compressed */);
function State81(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm81.has(l.id)) idm81.get(l.id)(l);
    else if (tym81.has(l.ty)) tym81.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 90:
                State100(l);
                continue;
            case 86:
                State93(l);
                continue;
            case 84:
                State94(l);
                continue;
            case 82:
                State92(l);
                continue;
            case 81:
                State91(l);
                continue;
            case 80:
                State90(l);
                continue;
            case 74:
                State301(l);
                continue;
            case 73:
                State99(l);
                continue;
            case 71:
                State300(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![75].includes(a)) fail(l);
}
const idm82: Map<number, (L: Lexer) => void> = new Map();
const _82id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State95(l);
    if (prod >= 0) return; else FAILED = false;
    //COMPOUND_SELECTOR=>COMPOUND_SELECTOR_HC_listbody1_131 •

    add_reduce(1, 159);
    stack_ptr -= 1;
    prod = 75;
    return;
};
idm82.set(46/* # */, _82id0);
const _82id1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State96(l);
    if (prod >= 0) return; else FAILED = false;
    //COMPOUND_SELECTOR=>COMPOUND_SELECTOR_HC_listbody1_131 •

    add_reduce(1, 159);
    stack_ptr -= 1;
    prod = 75;
    return;
};
idm82.set(47/* . */, _82id1);
const _82id2 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State98(l);
    if (prod >= 0) return; else FAILED = false;
    //COMPOUND_SELECTOR=>COMPOUND_SELECTOR_HC_listbody1_131 •

    add_reduce(1, 159);
    stack_ptr -= 1;
    prod = 75;
    return;
};
idm82.set(28/* : */, _82id2);
const _82id3 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State97(l);
    if (prod >= 0) return; else FAILED = false;
    //COMPOUND_SELECTOR=>COMPOUND_SELECTOR_HC_listbody1_131 •

    add_reduce(1, 159);
    stack_ptr -= 1;
    prod = 75;
    return;
};
idm82.set(48/* [ */, _82id3);
const _82id4 = (l: Lexer): void => {//COMPOUND_SELECTOR=>COMPOUND_SELECTOR_HC_listbody1_131 •

    add_reduce(1, 159);
    stack_ptr -= 1;
    prod = 75;
    return;
};
idm82.set(60/* $ */, _82id4);
idm82.set(16/* ) */, _82id4);
idm82.set(44/* * */, _82id4);
idm82.set(41/* + */, _82id4);
idm82.set(10/* , */, _82id4);
idm82.set(59/* - */, _82id4);
idm82.set(40/* > */, _82id4);
idm82.set(11/* { */, _82id4);
idm82.set(45/* | */, _82id4);
idm82.set(43/* || */, _82id4);
idm82.set(42/* ~ */, _82id4);
const tym82: Map<number, (L: Lexer) => void> = new Map();
tym82.set(0, _82id4/* compressed */);
tym82.set(3/* id */, _82id4/* compressed */);
function State82(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm82.has(l.id)) idm82.get(l.id)(l);
    else if (tym82.has(l.ty)) tym82.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 90:
                State100(l);
                continue;
            case 86:
                State93(l);
                continue;
            case 84:
                State94(l);
                continue;
            case 82:
                State92(l);
                continue;
            case 81:
                State91(l);
                continue;
            case 80:
                State299(l);
                continue;
            case 74:
                State298(l);
                continue;
            case 73:
                State99(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![75, 71].includes(a)) fail(l);
}
const idm83: Map<number, (L: Lexer) => void> = new Map();
const _83id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State138(l);
    if (prod >= 0) return; else FAILED = false;
    //COMPOUND_SELECTOR=>COMPOUND_SELECTOR_HC_listbody2_134 •

    add_reduce(1, 158);
    stack_ptr -= 1;
    prod = 75;
    return;
};
idm83.set(28/* : */, _83id0);
const _83id1 = (l: Lexer): void => {//COMPOUND_SELECTOR=>COMPOUND_SELECTOR_HC_listbody2_134 •

    add_reduce(1, 158);
    stack_ptr -= 1;
    prod = 75;
    return;
};
idm83.set(46/* # */, _83id1);
idm83.set(60/* $ */, _83id1);
idm83.set(16/* ) */, _83id1);
idm83.set(44/* * */, _83id1);
idm83.set(41/* + */, _83id1);
idm83.set(10/* , */, _83id1);
idm83.set(59/* - */, _83id1);
idm83.set(47/* . */, _83id1);
idm83.set(40/* > */, _83id1);
idm83.set(48/* [ */, _83id1);
idm83.set(11/* { */, _83id1);
idm83.set(45/* | */, _83id1);
idm83.set(43/* || */, _83id1);
idm83.set(42/* ~ */, _83id1);
const tym83: Map<number, (L: Lexer) => void> = new Map();
tym83.set(0, _83id1/* compressed */);
tym83.set(3/* id */, _83id1/* compressed */);
function State83(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm83.has(l.id)) idm83.get(l.id)(l);
    else if (tym83.has(l.ty)) tym83.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 90:
                State100(l);
                continue;
            case 73:
                State297(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![75, 74].includes(a)) fail(l);
}
function State84(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 16/* ) */, 28/* : */, 40/* > */, 41/* + */, 42/* ~ */, 43/* || */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //TYPE_SELECTOR=>WQ_NAME •

        add_reduce(1, 192);
        stack_ptr -= 1;
        prod = 89;
        return;
    }
}
const idm85: Map<number, (L: Lexer) => void> = new Map();
idm85.set(60/* $ */, _10id0/* compressed */);
const _85id1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State303(l);
    //
};
idm85.set(44/* * */, _85id1);
idm85.set(59/* - */, _10id2/* compressed */);
const tym85: Map<number, (L: Lexer) => void> = new Map();
tym85.set(3/* id */, _10ty0/* compressed */);
function State85(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm85.has(l.id)) idm85.get(l.id)(l);
    else if (tym85.has(l.ty)) tym85.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State304(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![89, 79].includes(a)) fail(l);
}
const idm86: Map<number, (L: Lexer) => void> = new Map();
const _86id0 = (l: Lexer): void => {//TYPE_SELECTOR=>* •

    add_reduce(1, 194);
    stack_ptr -= 1;
    prod = 89;
    return;
};
idm86.set(46/* # */, _86id0);
idm86.set(60/* $ */, _86id0);
idm86.set(16/* ) */, _86id0);
idm86.set(44/* * */, _86id0);
idm86.set(41/* + */, _86id0);
idm86.set(10/* , */, _86id0);
idm86.set(59/* - */, _86id0);
idm86.set(47/* . */, _86id0);
idm86.set(28/* : */, _86id0);
idm86.set(40/* > */, _86id0);
idm86.set(48/* [ */, _86id0);
idm86.set(11/* { */, _86id0);
idm86.set(43/* || */, _86id0);
idm86.set(42/* ~ */, _86id0);
const _86id1 = (l: Lexer): void => {//NS_PREFIX_group_0112_135=>* •  :  TYPE_SELECTOR=>* •

    stack_ptr -= 1;
    prod = 77;
    return;
    add_reduce(1, 194);
    stack_ptr -= 1;
    prod = 89;
    return;
};
idm86.set(45/* | */, _86id1);
const tym86: Map<number, (L: Lexer) => void> = new Map();
tym86.set(0, _86id0/* compressed */);
tym86.set(3/* id */, _86id0/* compressed */);
function State86(l: Lexer): void {
    prod = -1;
    if (idm86.has(l.id)) idm86.get(l.id)(l);
    else if (tym86.has(l.ty)) tym86.get(l.ty)(l);
}
const idm87: Map<number, (L: Lexer) => void> = new Map();
const _87id0 = (l: Lexer): void => {//WQ_NAME=>identifier •

    add_reduce(1, 170);
    stack_ptr -= 1;
    prod = 79;
    return;
};
idm87.set(46/* # */, _87id0);
idm87.set(60/* $ */, _87id0);
idm87.set(52/* $= */, _87id0);
idm87.set(16/* ) */, _87id0);
idm87.set(44/* * */, _87id0);
idm87.set(53/* *= */, _87id0);
idm87.set(41/* + */, _87id0);
idm87.set(10/* , */, _87id0);
idm87.set(59/* - */, _87id0);
idm87.set(47/* . */, _87id0);
idm87.set(28/* : */, _87id0);
idm87.set(33/* = */, _87id0);
idm87.set(40/* > */, _87id0);
idm87.set(48/* [ */, _87id0);
idm87.set(49/* ] */, _87id0);
idm87.set(51/* ^= */, _87id0);
idm87.set(11/* { */, _87id0);
idm87.set(43/* || */, _87id0);
idm87.set(42/* ~ */, _87id0);
const _87id1 = (l: Lexer): void => {//NS_PREFIX_group_0112_135=>identifier •  :  WQ_NAME=>identifier •

    stack_ptr -= 1;
    prod = 77;
    return;
    add_reduce(1, 170);
    stack_ptr -= 1;
    prod = 79;
    return;
};
idm87.set(45/* | */, _87id1);
const tym87: Map<number, (L: Lexer) => void> = new Map();
tym87.set(0, _87id0/* compressed */);
tym87.set(3/* id */, _87id0/* compressed */);
function State87(l: Lexer): void {
    prod = -1;
    if (idm87.has(l.id)) idm87.get(l.id)(l);
    else if (tym87.has(l.ty)) tym87.get(l.ty)(l);
}
function State88(l: Lexer): void {
    prod = -1;
    if ([45/* | */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State302(l); return;
        //

    }
}
function State89(l: Lexer): void {
    prod = -1;
    if ([44/* * */, 59/* - */, 60/* $ */].includes(l.id) || [3/* id */].includes(l.ty)) {
        //NS_PREFIX=>| •

        add_reduce(1, 168);
        stack_ptr -= 1;
        prod = 78;
        return;
    }
}
function State90(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 16/* ) */, 28/* : */, 40/* > */, 41/* + */, 42/* ~ */, 43/* || */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //COMPOUND_SELECTOR_HC_listbody1_131=>SUBCLASS_SELECTOR •

        add_reduce(1, 147);
        stack_ptr -= 1;
        prod = 71;
        return;
    }
}
function State91(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 16/* ) */, 28/* : */, 40/* > */, 41/* + */, 42/* ~ */, 43/* || */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //SUBCLASS_SELECTOR=>ID_SELECTOR •

        stack_ptr -= 1;
        prod = 80;
        return;
    }
}
function State92(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 16/* ) */, 28/* : */, 40/* > */, 41/* + */, 42/* ~ */, 43/* || */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //SUBCLASS_SELECTOR=>CLASS_SELECTOR •

        stack_ptr -= 1;
        prod = 80;
        return;
    }
}
function State93(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 16/* ) */, 28/* : */, 40/* > */, 41/* + */, 42/* ~ */, 43/* || */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //SUBCLASS_SELECTOR=>ATTRIBUTE_SELECTOR •

        stack_ptr -= 1;
        prod = 80;
        return;
    }
}
function State94(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 16/* ) */, 28/* : */, 40/* > */, 41/* + */, 42/* ~ */, 43/* || */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //SUBCLASS_SELECTOR=>PSEUDO_CLASS_SELECTOR •

        stack_ptr -= 1;
        prod = 80;
        return;
    }
}
const idm95: Map<number, (L: Lexer) => void> = new Map();
idm95.set(60/* $ */, _10id0/* compressed */);
idm95.set(59/* - */, _10id2/* compressed */);
const tym95: Map<number, (L: Lexer) => void> = new Map();
tym95.set(3/* id */, _10ty0/* compressed */);
function State95(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm95.has(l.id)) idm95.get(l.id)(l);
    else if (tym95.has(l.ty)) tym95.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State308(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![81].includes(a)) fail(l);
}
const idm96: Map<number, (L: Lexer) => void> = new Map();
idm96.set(60/* $ */, _10id0/* compressed */);
idm96.set(59/* - */, _10id2/* compressed */);
const tym96: Map<number, (L: Lexer) => void> = new Map();
tym96.set(3/* id */, _10ty0/* compressed */);
function State96(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm96.has(l.id)) idm96.get(l.id)(l);
    else if (tym96.has(l.ty)) tym96.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State305(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![82].includes(a)) fail(l);
}
const idm97: Map<number, (L: Lexer) => void> = new Map();
idm97.set(60/* $ */, _10id0/* compressed */);
const _97id1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State186(l);
    //
};
idm97.set(44/* * */, _97id1);
idm97.set(59/* - */, _10id2/* compressed */);
idm97.set(45/* | */, _0id43/* compressed */);
const tym97: Map<number, (L: Lexer) => void> = new Map();
tym97.set(3/* id */, _10ty0/* compressed */);
function State97(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm97.has(l.id)) idm97.get(l.id)(l);
    else if (tym97.has(l.ty)) tym97.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State87(l);
                continue;
            case 79:
                State313(l);
                continue;
            case 78:
                State185(l);
                continue;
            case 77:
                State88(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![86].includes(a)) fail(l);
}
const idm98: Map<number, (L: Lexer) => void> = new Map();
idm98.set(60/* $ */, _10id0/* compressed */);
idm98.set(59/* - */, _10id2/* compressed */);
const _98id2 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State127(l);
    //
};
idm98.set(28/* : */, _98id2);
const tym98: Map<number, (L: Lexer) => void> = new Map();
tym98.set(3/* id */, _10ty0/* compressed */);
function State98(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm98.has(l.id)) idm98.get(l.id)(l);
    else if (tym98.has(l.ty)) tym98.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State311(l);
                continue;
            case 84:
                State312(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![84, 90].includes(a)) fail(l);
}
function State99(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 16/* ) */, 28/* : */, 40/* > */, 41/* + */, 42/* ~ */, 43/* || */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //COMPOUND_SELECTOR_HC_listbody2_134=>COMPOUND_SELECTOR_group_1105_133 •

        add_reduce(1, 153);
        stack_ptr -= 1;
        prod = 74;
        return;
    }
}
const idm100: Map<number, (L: Lexer) => void> = new Map();
const _100id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State127(l);
    if (prod >= 0) return; else FAILED = false;
    //COMPOUND_SELECTOR_group_1105_133=>PSEUDO_ELEMENT_SELECTOR •

    add_reduce(1, 151);
    stack_ptr -= 1;
    prod = 73;
    return;
};
idm100.set(28/* : */, _100id0);
const _100id1 = (l: Lexer): void => {//COMPOUND_SELECTOR_group_1105_133=>PSEUDO_ELEMENT_SELECTOR •

    add_reduce(1, 151);
    stack_ptr -= 1;
    prod = 73;
    return;
};
idm100.set(46/* # */, _100id1);
idm100.set(60/* $ */, _100id1);
idm100.set(16/* ) */, _100id1);
idm100.set(44/* * */, _100id1);
idm100.set(41/* + */, _100id1);
idm100.set(10/* , */, _100id1);
idm100.set(59/* - */, _100id1);
idm100.set(47/* . */, _100id1);
idm100.set(40/* > */, _100id1);
idm100.set(48/* [ */, _100id1);
idm100.set(11/* { */, _100id1);
idm100.set(45/* | */, _100id1);
idm100.set(43/* || */, _100id1);
idm100.set(42/* ~ */, _100id1);
const tym100: Map<number, (L: Lexer) => void> = new Map();
tym100.set(0, _100id1/* compressed */);
tym100.set(3/* id */, _100id1/* compressed */);
function State100(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm100.has(l.id)) idm100.get(l.id)(l);
    else if (tym100.has(l.ty)) tym100.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 84:
                State141(l);
                continue;
            case 72:
                State306(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![73].includes(a)) fail(l);
}
const idm101: Map<number, (L: Lexer) => void> = new Map();
idm101.set(46/* # */, _0id2/* compressed */);
idm101.set(60/* $ */, _10id0/* compressed */);
idm101.set(44/* * */, _77id2/* compressed */);
idm101.set(59/* - */, _10id2/* compressed */);
idm101.set(47/* . */, _0id13/* compressed */);
idm101.set(28/* : */, _77id5/* compressed */);
idm101.set(48/* [ */, _0id20/* compressed */);
idm101.set(45/* | */, _0id43/* compressed */);
const tym101: Map<number, (L: Lexer) => void> = new Map();
tym101.set(3/* id */, _10ty0/* compressed */);
function $GROUP_RULE_BODY_HC_listbody5_104(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm101.has(l.id)) idm101.get(l.id)(l);
    else if (tym101.has(l.ty)) tym101.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State87(l);
                continue;
            case 90:
                State100(l);
                continue;
            case 89:
                State81(l);
                continue;
            case 86:
                State93(l);
                continue;
            case 84:
                State94(l);
                continue;
            case 82:
                State92(l);
                continue;
            case 81:
                State91(l);
                continue;
            case 80:
                State90(l);
                continue;
            case 79:
                State84(l);
                continue;
            case 78:
                State85(l);
                continue;
            case 77:
                State88(l);
                continue;
            case 75:
                State80(l);
                continue;
            case 74:
                State83(l);
                continue;
            case 73:
                State99(l);
                continue;
            case 71:
                State82(l);
                continue;
            case 70:
                State79(l);
                continue;
            case 7:
                State102(l);
                continue;
            case 6:
                State103(l);
                continue;
            case 5:
                State104(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![7].includes(a)) fail(l);
}
const idm102: Map<number, (L: Lexer) => void> = new Map();
idm102.set(46/* # */, _0id2/* compressed */);
idm102.set(60/* $ */, _10id0/* compressed */);
idm102.set(44/* * */, _77id2/* compressed */);
idm102.set(59/* - */, _10id2/* compressed */);
idm102.set(47/* . */, _0id13/* compressed */);
idm102.set(28/* : */, _77id5/* compressed */);
idm102.set(48/* [ */, _0id20/* compressed */);
idm102.set(45/* | */, _0id43/* compressed */);
const tym102: Map<number, (L: Lexer) => void> = new Map();
tym102.set(3/* id */, _10ty0/* compressed */);
function State102(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm102.has(l.id)) idm102.get(l.id)(l);
    else if (tym102.has(l.ty)) tym102.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State87(l);
                continue;
            case 90:
                State100(l);
                continue;
            case 89:
                State81(l);
                continue;
            case 86:
                State93(l);
                continue;
            case 84:
                State94(l);
                continue;
            case 82:
                State92(l);
                continue;
            case 81:
                State91(l);
                continue;
            case 80:
                State90(l);
                continue;
            case 79:
                State84(l);
                continue;
            case 78:
                State85(l);
                continue;
            case 77:
                State88(l);
                continue;
            case 75:
                State80(l);
                continue;
            case 74:
                State83(l);
                continue;
            case 73:
                State99(l);
                continue;
            case 71:
                State82(l);
                continue;
            case 70:
                State79(l);
                continue;
            case 6:
                State336(l);
                continue;
            case 5:
                State104(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![7].includes(a)) fail(l);
}
function State103(l: Lexer): void {
    prod = -1;
    if ([28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //GROUP_RULE_BODY_HC_listbody5_104=>STYLE_RULE •

        add_reduce(1, 18);
        stack_ptr -= 1;
        prod = 7;
        return;
    }
}
const idm104: Map<number, (L: Lexer) => void> = new Map();
const _104id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State295(l); return;
    //
};
idm104.set(10/* , */, _104id0);
const _104id1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State309(l); return;
    //
};
idm104.set(11/* { */, _104id1);
function State104(l: Lexer): void {
    prod = -1;
    if (idm104.has(l.id)) idm104.get(l.id)(l);
}
function $media_or_HC_listbody2_121(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if ([23/* or */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State108(l);
        //

    }
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 45:
                State106(l);
                continue;
            case 44:
                State107(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![45].includes(a)) fail(l);
}
function State106(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if ([23/* or */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State108(l);
        //

    }
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 44:
                State310(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![45].includes(a)) fail(l);
}
function State107(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 12/* ; */, 16/* ) */, 17/* @ */, 23/* or */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //media_or_HC_listbody2_121=>media_or_group_154_120 •

        add_reduce(1, 97);
        stack_ptr -= 1;
        prod = 45;
        return;
    }
}
const idm108: Map<number, (L: Lexer) => void> = new Map();
idm108.set(60/* $ */, _10id0/* compressed */);
idm108.set(15/* ( */, _10id1/* compressed */);
idm108.set(59/* - */, _10id2/* compressed */);
const tym108: Map<number, (L: Lexer) => void> = new Map();
tym108.set(3/* id */, _10ty0/* compressed */);
function State108(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm108.has(l.id)) idm108.get(l.id)(l);
    else if (tym108.has(l.ty)) tym108.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State42(l);
                continue;
            case 52:
                State24(l);
                continue;
            case 49:
                State23(l);
                continue;
            case 47:
                State315(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![44].includes(a)) fail(l);
}
const idm109: Map<number, (L: Lexer) => void> = new Map();
idm109.set(60/* $ */, _10id0/* compressed */);
idm109.set(15/* ( */, _10id1/* compressed */);
idm109.set(59/* - */, _10id2/* compressed */);
idm109.set(24/* not */, _22id4/* compressed */);
const tym109: Map<number, (L: Lexer) => void> = new Map();
tym109.set(3/* id */, _10ty0/* compressed */);
function $media_condition(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm109.has(l.id)) idm109.get(l.id)(l);
    else if (tym109.has(l.ty)) tym109.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State42(l);
                continue;
            case 52:
                State24(l);
                continue;
            case 49:
                State23(l);
                continue;
            case 47:
                State20(l);
                continue;
            case 46:
                State17(l);
                continue;
            case 43:
                State19(l);
                continue;
            case 40:
                State18(l);
                continue;
            case 39:
                State16(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![38].includes(a)) fail(l);
}
const tym110: Map<number, (L: Lexer) => void> = new Map();
const _110ty0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State113(l);
    //
};
tym110.set(3/* id */, _110ty0);
const _110ty1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State114(l);
    //
};
tym110.set(1/* ws */, _110ty1);
function $general_enclosed_HC_listbody1_124(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (tym110.has(l.ty)) tym110.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 51:
                State111(l);
                continue;
            case 50:
                State112(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![51].includes(a)) fail(l);
}
const tym111: Map<number, (L: Lexer) => void> = new Map();
tym111.set(3/* id */, _110ty0/* compressed */);
tym111.set(1/* ws */, _110ty1/* compressed */);
function State111(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (tym111.has(l.ty)) tym111.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 50:
                State314(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![51].includes(a)) fail(l);
}
function State112(l: Lexer): void {
    prod = -1;
    if ([16/* ) */].includes(l.id) || [0, 1/* ws */, 3/* id */].includes(l.ty)) {
        //general_enclosed_HC_listbody1_124=>general_enclosed_group_064_123 •

        add_reduce(1, 109);
        stack_ptr -= 1;
        prod = 51;
        return;
    }
}
function State113(l: Lexer): void {
    prod = -1;
    if ([16/* ) */].includes(l.id) || [0, 1/* ws */, 3/* id */].includes(l.ty)) {
        //general_enclosed_group_064_123=>θid •

        stack_ptr -= 1;
        prod = 50;
        return;
    }
}
function State114(l: Lexer): void {
    prod = -1;
    if ([16/* ) */].includes(l.id) || [0, 1/* ws */, 3/* id */].includes(l.ty)) {
        //general_enclosed_group_064_123=>θws •

        stack_ptr -= 1;
        prod = 50;
        return;
    }
}
const idm115: Map<number, (L: Lexer) => void> = new Map();
idm115.set(60/* $ */, _10id0/* compressed */);
idm115.set(15/* ( */, _10id1/* compressed */);
idm115.set(59/* - */, _10id2/* compressed */);
const tym115: Map<number, (L: Lexer) => void> = new Map();
tym115.set(3/* id */, _10ty0/* compressed */);
function $media_in_parenths(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm115.has(l.id)) idm115.get(l.id)(l);
    else if (tym115.has(l.ty)) tym115.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State42(l);
                continue;
            case 52:
                State24(l);
                continue;
            case 49:
                State23(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![47].includes(a)) fail(l);
}
const idm116: Map<number, (L: Lexer) => void> = new Map();
idm116.set(60/* $ */, _10id0/* compressed */);
idm116.set(59/* - */, _10id2/* compressed */);
const tym116: Map<number, (L: Lexer) => void> = new Map();
tym116.set(3/* id */, _10ty0/* compressed */);
tym116.set(2/* num */, _22ty1/* compressed */);
function $mf_value(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm116.has(l.id)) idm116.get(l.id)(l);
    else if (tym116.has(l.ty)) tym116.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State121(l);
                continue;
            case 64:
                State118(l);
                continue;
            case 62:
                State120(l);
                continue;
            case 60:
                State119(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![58].includes(a)) fail(l);
}
const idm117: Map<number, (L: Lexer) => void> = new Map();
const _117id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State317(l); return;
    //
};
idm117.set(36/* / */, _117id0);
const _117id1 = (l: Lexer): void => {//mf_value=>θnum •

    stack_ptr -= 1;
    prod = 58;
    return;
};
idm117.set(16/* ) */, _117id1);
idm117.set(29/* < */, _117id1);
idm117.set(30/* <= */, _117id1);
idm117.set(33/* = */, _117id1);
idm117.set(31/* > */, _117id1);
idm117.set(32/* >= */, _117id1);
const tym117: Map<number, (L: Lexer) => void> = new Map();
const _117ty0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State316(l); return;
    //
};
tym117.set(3/* id */, _117ty0);
tym117.set(0, _117id1/* compressed */);
function State117(l: Lexer): void {
    prod = -1;
    if (idm117.has(l.id)) idm117.get(l.id)(l);
    else if (tym117.has(l.ty)) tym117.get(l.ty)(l);
}
function State118(l: Lexer): void {
    prod = -1;
    if ([16/* ) */, 29/* < */, 30/* <= */, 31/* > */, 32/* >= */, 33/* = */].includes(l.id) || [0].includes(l.ty)) {
        //mf_value=>dimension •

        stack_ptr -= 1;
        prod = 58;
        return;
    }
}
function State119(l: Lexer): void {
    prod = -1;
    if ([16/* ) */, 29/* < */, 30/* <= */, 31/* > */, 32/* >= */, 33/* = */].includes(l.id) || [0].includes(l.ty)) {
        //mf_value=>mf_name •

        stack_ptr -= 1;
        prod = 58;
        return;
    }
}
function State120(l: Lexer): void {
    prod = -1;
    if ([16/* ) */, 29/* < */, 30/* <= */, 31/* > */, 32/* >= */, 33/* = */].includes(l.id) || [0].includes(l.ty)) {
        //mf_value=>ratio •

        stack_ptr -= 1;
        prod = 58;
        return;
    }
}
function State121(l: Lexer): void {
    prod = -1;
    if ([16/* ) */, 28/* : */, 29/* < */, 30/* <= */, 31/* > */, 32/* >= */, 33/* = */].includes(l.id) || [0].includes(l.ty)) {
        //mf_name=>identifier •

        stack_ptr -= 1;
        prod = 60;
        return;
    }
}
const idm122: Map<number, (L: Lexer) => void> = new Map();
idm122.set(46/* # */, _0id2/* compressed */);
idm122.set(60/* $ */, _10id0/* compressed */);
idm122.set(44/* * */, _77id2/* compressed */);
idm122.set(59/* - */, _10id2/* compressed */);
idm122.set(47/* . */, _0id13/* compressed */);
idm122.set(28/* : */, _77id5/* compressed */);
idm122.set(48/* [ */, _0id20/* compressed */);
idm122.set(45/* | */, _0id43/* compressed */);
const tym122: Map<number, (L: Lexer) => void> = new Map();
tym122.set(3/* id */, _10ty0/* compressed */);
function $GROUP_RULE_BODY(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm122.has(l.id)) idm122.get(l.id)(l);
    else if (tym122.has(l.ty)) tym122.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State87(l);
                continue;
            case 90:
                State100(l);
                continue;
            case 89:
                State81(l);
                continue;
            case 86:
                State93(l);
                continue;
            case 84:
                State94(l);
                continue;
            case 82:
                State92(l);
                continue;
            case 81:
                State91(l);
                continue;
            case 80:
                State90(l);
                continue;
            case 79:
                State84(l);
                continue;
            case 78:
                State85(l);
                continue;
            case 77:
                State88(l);
                continue;
            case 75:
                State80(l);
                continue;
            case 74:
                State83(l);
                continue;
            case 73:
                State99(l);
                continue;
            case 71:
                State82(l);
                continue;
            case 70:
                State79(l);
                continue;
            case 8:
                State123(l);
                continue;
            case 6:
                State124(l);
                continue;
            case 5:
                State104(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![8].includes(a)) fail(l);
}
const idm123: Map<number, (L: Lexer) => void> = new Map();
idm123.set(46/* # */, _0id2/* compressed */);
idm123.set(60/* $ */, _10id0/* compressed */);
idm123.set(44/* * */, _77id2/* compressed */);
idm123.set(59/* - */, _10id2/* compressed */);
idm123.set(47/* . */, _0id13/* compressed */);
idm123.set(28/* : */, _77id5/* compressed */);
idm123.set(48/* [ */, _0id20/* compressed */);
idm123.set(45/* | */, _0id43/* compressed */);
const tym123: Map<number, (L: Lexer) => void> = new Map();
tym123.set(3/* id */, _10ty0/* compressed */);
function State123(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm123.has(l.id)) idm123.get(l.id)(l);
    else if (tym123.has(l.ty)) tym123.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State87(l);
                continue;
            case 90:
                State100(l);
                continue;
            case 89:
                State81(l);
                continue;
            case 86:
                State93(l);
                continue;
            case 84:
                State94(l);
                continue;
            case 82:
                State92(l);
                continue;
            case 81:
                State91(l);
                continue;
            case 80:
                State90(l);
                continue;
            case 79:
                State84(l);
                continue;
            case 78:
                State85(l);
                continue;
            case 77:
                State88(l);
                continue;
            case 75:
                State80(l);
                continue;
            case 74:
                State83(l);
                continue;
            case 73:
                State99(l);
                continue;
            case 71:
                State82(l);
                continue;
            case 70:
                State79(l);
                continue;
            case 6:
                State355(l);
                continue;
            case 5:
                State104(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![8].includes(a)) fail(l);
}
function State124(l: Lexer): void {
    prod = -1;
    if ([13/* } */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //GROUP_RULE_BODY=>STYLE_RULE •

        add_reduce(1, 20);
        stack_ptr -= 1;
        prod = 8;
        return;
    }
}
const idm125: Map<number, (L: Lexer) => void> = new Map();
idm125.set(46/* # */, _0id2/* compressed */);
idm125.set(47/* . */, _0id13/* compressed */);
idm125.set(28/* : */, _98id2/* compressed */);
idm125.set(48/* [ */, _0id20/* compressed */);
function $COMPOUND_SELECTOR_HC_listbody1_131(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm125.has(l.id)) idm125.get(l.id)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 86:
                State93(l);
                continue;
            case 84:
                State94(l);
                continue;
            case 82:
                State92(l);
                continue;
            case 81:
                State91(l);
                continue;
            case 80:
                State90(l);
                continue;
            case 71:
                State126(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![71].includes(a)) fail(l);
}
const idm126: Map<number, (L: Lexer) => void> = new Map();
idm126.set(46/* # */, _0id2/* compressed */);
idm126.set(47/* . */, _0id13/* compressed */);
idm126.set(28/* : */, _98id2/* compressed */);
idm126.set(48/* [ */, _0id20/* compressed */);
function State126(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm126.has(l.id)) idm126.get(l.id)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 86:
                State93(l);
                continue;
            case 84:
                State94(l);
                continue;
            case 82:
                State92(l);
                continue;
            case 81:
                State91(l);
                continue;
            case 80:
                State299(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![71].includes(a)) fail(l);
}
const idm127: Map<number, (L: Lexer) => void> = new Map();
idm127.set(60/* $ */, _10id0/* compressed */);
idm127.set(59/* - */, _10id2/* compressed */);
const tym127: Map<number, (L: Lexer) => void> = new Map();
tym127.set(3/* id */, _10ty0/* compressed */);
function State127(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm127.has(l.id)) idm127.get(l.id)(l);
    else if (tym127.has(l.ty)) tym127.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State311(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![84].includes(a)) fail(l);
}
const idm128: Map<number, (L: Lexer) => void> = new Map();
idm128.set(60/* $ */, _10id0/* compressed */);
idm128.set(59/* - */, _10id2/* compressed */);
const tym128: Map<number, (L: Lexer) => void> = new Map();
tym128.set(3/* id */, _10ty0/* compressed */);
tym128.set(2/* num */, _22ty1/* compressed */);
function $mf_range(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm128.has(l.id)) idm128.get(l.id)(l);
    else if (tym128.has(l.ty)) tym128.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State121(l);
                continue;
            case 64:
                State118(l);
                continue;
            case 62:
                State120(l);
                continue;
            case 60:
                State129(l);
                continue;
            case 58:
                State130(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![57].includes(a)) fail(l);
}
const idm129: Map<number, (L: Lexer) => void> = new Map();
const _129id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State324(l);
    if (prod >= 0) return; else FAILED = false;
    //mf_value=>mf_name •

    stack_ptr -= 1;
    prod = 58;
    return;
};
idm129.set(29/* < */, _129id0);
const _129id1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State325(l);
    if (prod >= 0) return; else FAILED = false;
    //mf_value=>mf_name •

    stack_ptr -= 1;
    prod = 58;
    return;
};
idm129.set(30/* <= */, _129id1);
const _129id2 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State328(l);
    if (prod >= 0) return; else FAILED = false;
    //mf_value=>mf_name •

    stack_ptr -= 1;
    prod = 58;
    return;
};
idm129.set(33/* = */, _129id2);
const _129id3 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State326(l);
    if (prod >= 0) return; else FAILED = false;
    //mf_value=>mf_name •

    stack_ptr -= 1;
    prod = 58;
    return;
};
idm129.set(31/* > */, _129id3);
const _129id4 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State327(l);
    if (prod >= 0) return; else FAILED = false;
    //mf_value=>mf_name •

    stack_ptr -= 1;
    prod = 58;
    return;
};
idm129.set(32/* >= */, _129id4);
function State129(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm129.has(l.id)) idm129.get(l.id)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 54:
                State323(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![57, 58].includes(a)) fail(l);
}
const idm130: Map<number, (L: Lexer) => void> = new Map();
const _130id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State332(l);
    //
};
idm130.set(29/* < */, _130id0);
const _130id1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State333(l);
    //
};
idm130.set(30/* <= */, _130id1);
const _130id2 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State328(l);
    //
};
idm130.set(33/* = */, _130id2);
const _130id3 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State334(l);
    //
};
idm130.set(31/* > */, _130id3);
const _130id4 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State335(l);
    //
};
idm130.set(32/* >= */, _130id4);
function State130(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm130.has(l.id)) idm130.get(l.id)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 56:
                State331(l);
                continue;
            case 55:
                State330(l);
                continue;
            case 54:
                State329(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![57].includes(a)) fail(l);
}
const idm131: Map<number, (L: Lexer) => void> = new Map();
idm131.set(46/* # */, _0id2/* compressed */);
idm131.set(60/* $ */, _10id0/* compressed */);
idm131.set(44/* * */, _77id2/* compressed */);
idm131.set(59/* - */, _10id2/* compressed */);
idm131.set(47/* . */, _0id13/* compressed */);
idm131.set(28/* : */, _77id5/* compressed */);
const _131id6 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State9(l);
    //
};
idm131.set(17/* @ */, _131id6);
idm131.set(48/* [ */, _0id20/* compressed */);
idm131.set(45/* | */, _0id43/* compressed */);
const tym131: Map<number, (L: Lexer) => void> = new Map();
tym131.set(3/* id */, _10ty0/* compressed */);
function $STYLE_SHEET_HC_listbody1_102(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm131.has(l.id)) idm131.get(l.id)(l);
    else if (tym131.has(l.ty)) tym131.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State87(l);
                continue;
            case 90:
                State100(l);
                continue;
            case 89:
                State81(l);
                continue;
            case 86:
                State93(l);
                continue;
            case 84:
                State94(l);
                continue;
            case 82:
                State92(l);
                continue;
            case 81:
                State91(l);
                continue;
            case 80:
                State90(l);
                continue;
            case 79:
                State84(l);
                continue;
            case 78:
                State85(l);
                continue;
            case 77:
                State88(l);
                continue;
            case 75:
                State80(l);
                continue;
            case 74:
                State83(l);
                continue;
            case 73:
                State99(l);
                continue;
            case 71:
                State82(l);
                continue;
            case 70:
                State79(l);
                continue;
            case 31:
                State5(l);
                continue;
            case 23:
                State8(l);
                continue;
            case 17:
                State7(l);
                continue;
            case 14:
                State6(l);
                continue;
            case 9:
                State135(l);
                continue;
            case 6:
                State134(l);
                continue;
            case 5:
                State104(l);
                continue;
            case 3:
                State132(l);
                continue;
            case 2:
                State133(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![3].includes(a)) fail(l);
}
const idm132: Map<number, (L: Lexer) => void> = new Map();
idm132.set(46/* # */, _0id2/* compressed */);
idm132.set(60/* $ */, _10id0/* compressed */);
idm132.set(44/* * */, _77id2/* compressed */);
idm132.set(59/* - */, _10id2/* compressed */);
idm132.set(47/* . */, _0id13/* compressed */);
idm132.set(28/* : */, _77id5/* compressed */);
idm132.set(17/* @ */, _131id6/* compressed */);
idm132.set(48/* [ */, _0id20/* compressed */);
idm132.set(45/* | */, _0id43/* compressed */);
const tym132: Map<number, (L: Lexer) => void> = new Map();
tym132.set(3/* id */, _10ty0/* compressed */);
function State132(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm132.has(l.id)) idm132.get(l.id)(l);
    else if (tym132.has(l.ty)) tym132.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State87(l);
                continue;
            case 90:
                State100(l);
                continue;
            case 89:
                State81(l);
                continue;
            case 86:
                State93(l);
                continue;
            case 84:
                State94(l);
                continue;
            case 82:
                State92(l);
                continue;
            case 81:
                State91(l);
                continue;
            case 80:
                State90(l);
                continue;
            case 79:
                State84(l);
                continue;
            case 78:
                State85(l);
                continue;
            case 77:
                State88(l);
                continue;
            case 75:
                State80(l);
                continue;
            case 74:
                State83(l);
                continue;
            case 73:
                State99(l);
                continue;
            case 71:
                State82(l);
                continue;
            case 70:
                State79(l);
                continue;
            case 31:
                State5(l);
                continue;
            case 23:
                State8(l);
                continue;
            case 17:
                State7(l);
                continue;
            case 14:
                State6(l);
                continue;
            case 9:
                State135(l);
                continue;
            case 6:
                State134(l);
                continue;
            case 5:
                State104(l);
                continue;
            case 2:
                State354(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![3].includes(a)) fail(l);
}
function State133(l: Lexer): void {
    prod = -1;
    if ([17/* @ */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //STYLE_SHEET_HC_listbody1_102=>STYLE_SHEET_group_03_101 •

        add_reduce(1, 6);
        stack_ptr -= 1;
        prod = 3;
        return;
    }
}
function State134(l: Lexer): void {
    prod = -1;
    if ([17/* @ */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //STYLE_SHEET_group_03_101=>STYLE_RULE •

        stack_ptr -= 1;
        prod = 2;
        return;
    }
}
function State135(l: Lexer): void {
    prod = -1;
    if ([17/* @ */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //STYLE_SHEET_group_03_101=>AT_RULE •

        stack_ptr -= 1;
        prod = 2;
        return;
    }
}
function $COMPOUND_SELECTOR_HC_listbody2_134(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if ([28/* : */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State138(l);
        //

    }
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 90:
                State100(l);
                continue;
            case 74:
                State137(l);
                continue;
            case 73:
                State99(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![74].includes(a)) fail(l);
}
function State137(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if ([28/* : */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State138(l);
        //

    }
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 90:
                State100(l);
                continue;
            case 73:
                State297(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![74].includes(a)) fail(l);
}
function State138(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if ([28/* : */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State127(l);
        //

    }
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 84:
                State312(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![90].includes(a)) fail(l);
}
function $COMPOUND_SELECTOR_HC_listbody1_132(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if ([28/* : */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State127(l);
        //

    }
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 84:
                State141(l);
                continue;
            case 72:
                State140(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![72].includes(a)) fail(l);
}
function State140(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if ([28/* : */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State127(l);
        //

    }
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 84:
                State338(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![72].includes(a)) fail(l);
}
function State141(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 16/* ) */, 28/* : */, 40/* > */, 41/* + */, 42/* ~ */, 43/* || */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //COMPOUND_SELECTOR_HC_listbody1_132=>PSEUDO_CLASS_SELECTOR •

        add_reduce(1, 149);
        stack_ptr -= 1;
        prod = 72;
        return;
    }
}
function $declaration_list_HC_listbody3_138(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if ([12/* ; */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State144(l);
        //

    }
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 91:
                State143(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![91].includes(a)) fail(l);
}
function State143(l: Lexer): void {
    prod = -1;
    if ([12/* ; */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State339(l); return;
        //

    }
}
function State144(l: Lexer): void {
    prod = -1;
    if ([12/* ; */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //declaration_list_HC_listbody3_138=>; •

        add_reduce(1, 197);
        stack_ptr -= 1;
        prod = 91;
        return;
    }
}
const idm145: Map<number, (L: Lexer) => void> = new Map();
idm145.set(60/* $ */, _10id0/* compressed */);
idm145.set(59/* - */, _10id2/* compressed */);
idm145.set(35/* false */, _0id27/* compressed */);
idm145.set(34/* true */, _22id5/* compressed */);
const tym145: Map<number, (L: Lexer) => void> = new Map();
tym145.set(3/* id */, _10ty0/* compressed */);
tym145.set(2/* num */, _22ty1/* compressed */);
function $media_feature_group_061_122(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm145.has(l.id)) idm145.get(l.id)(l);
    else if (tym145.has(l.ty)) tym145.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State121(l);
                continue;
            case 64:
                State118(l);
                continue;
            case 62:
                State120(l);
                continue;
            case 60:
                State149(l);
                continue;
            case 59:
                State147(l);
                continue;
            case 58:
                State130(l);
                continue;
            case 57:
                State148(l);
                continue;
            case 53:
                State146(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![48].includes(a)) fail(l);
}
function State146(l: Lexer): void {
    prod = -1;
    if ([16/* ) */].includes(l.id) || [0].includes(l.ty)) {
        //media_feature_group_061_122=>mf_plain •

        stack_ptr -= 1;
        prod = 48;
        return;
    }
}
function State147(l: Lexer): void {
    prod = -1;
    if ([16/* ) */].includes(l.id) || [0].includes(l.ty)) {
        //media_feature_group_061_122=>mf_boolean •

        stack_ptr -= 1;
        prod = 48;
        return;
    }
}
function State148(l: Lexer): void {
    prod = -1;
    if ([16/* ) */].includes(l.id) || [0].includes(l.ty)) {
        //media_feature_group_061_122=>mf_range •

        stack_ptr -= 1;
        prod = 48;
        return;
    }
}
const idm149: Map<number, (L: Lexer) => void> = new Map();
const _149id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State344(l);
    //
};
idm149.set(28/* : */, _149id0);
idm149.set(29/* < */, _129id0/* compressed */);
idm149.set(30/* <= */, _129id1/* compressed */);
idm149.set(33/* = */, _129id2/* compressed */);
idm149.set(31/* > */, _129id3/* compressed */);
idm149.set(32/* >= */, _129id4/* compressed */);
function State149(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm149.has(l.id)) idm149.get(l.id)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 54:
                State323(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![53, 57, 58].includes(a)) fail(l);
}
function State150(l: Lexer): void {
    prod = -1;
    if ([16/* ) */].includes(l.id) || [0].includes(l.ty)) {
        //mf_boolean=>true •

        add_reduce(1, 130);
        stack_ptr -= 1;
        prod = 59;
        return;
    }
}
function State151(l: Lexer): void {
    prod = -1;
    if ([16/* ) */].includes(l.id) || [0].includes(l.ty)) {
        //mf_boolean=>false •

        add_reduce(1, 131);
        stack_ptr -= 1;
        prod = 59;
        return;
    }
}
function $declaration_list_HC_listbody1_141(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if ([12/* ; */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State154(l);
        //

    }
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 94:
                State153(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![94].includes(a)) fail(l);
}
function State153(l: Lexer): void {
    prod = -1;
    if ([12/* ; */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State345(l); return;
        //

    }
}
function State154(l: Lexer): void {
    prod = -1;
    if ([12/* ; */, 13/* } */].includes(l.id) || [0].includes(l.ty)) {
        //declaration_list_HC_listbody1_141=>; •

        add_reduce(1, 203);
        stack_ptr -= 1;
        prod = 94;
        return;
    }
}
const idm155: Map<number, (L: Lexer) => void> = new Map();
idm155.set(60/* $ */, _10id0/* compressed */);
idm155.set(59/* - */, _10id2/* compressed */);
const _155id2 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State144(l);
    //
};
idm155.set(12/* ; */, _155id2);
const tym155: Map<number, (L: Lexer) => void> = new Map();
tym155.set(3/* id */, _10ty0/* compressed */);
function $declaration_list_HC_listbody2_140(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm155.has(l.id)) idm155.get(l.id)(l);
    else if (tym155.has(l.ty)) tym155.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 104:
                State45(l);
                continue;
            case 103:
                State161(l);
                continue;
            case 98:
                State160(l);
                continue;
            case 96:
                State159(l);
                continue;
            case 93:
                State156(l);
                continue;
            case 92:
                State157(l);
                continue;
            case 91:
                State158(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![93].includes(a)) fail(l);
}
function State156(l: Lexer): void {
    prod = -1;
    if ([12/* ; */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State346(l); return;
        //

    }
}
function State157(l: Lexer): void {
    prod = -1;
    if ([12/* ; */, 13/* } */].includes(l.id) || [0].includes(l.ty)) {
        //declaration_list_HC_listbody2_140=>declaration_list_group_1137_139 •

        add_reduce(1, 201);
        stack_ptr -= 1;
        prod = 93;
        return;
    }
}
const idm158: Map<number, (L: Lexer) => void> = new Map();
idm158.set(60/* $ */, _10id0/* compressed */);
idm158.set(59/* - */, _10id2/* compressed */);
const _158id2 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State339(l);
    //
};
idm158.set(12/* ; */, _158id2);
const tym158: Map<number, (L: Lexer) => void> = new Map();
tym158.set(3/* id */, _10ty0/* compressed */);
function State158(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm158.has(l.id)) idm158.get(l.id)(l);
    else if (tym158.has(l.ty)) tym158.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 104:
                State45(l);
                continue;
            case 103:
                State161(l);
                continue;
            case 98:
                State160(l);
                continue;
            case 96:
                State351(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![92, 91].includes(a)) fail(l);
}
function State159(l: Lexer): void {
    prod = -1;
    if ([12/* ; */, 13/* } */].includes(l.id) || [0].includes(l.ty)) {
        //declaration_list_group_1137_139=>rule_declaration •

        stack_ptr -= 1;
        prod = 92;
        return;
    }
}
function State160(l: Lexer): void {
    prod = -1;
    if ([12/* ; */, 13/* } */].includes(l.id) || [0].includes(l.ty)) {
        //rule_declaration=>declaration •

        stack_ptr -= 1;
        prod = 96;
        return;
    }
}
const idm161: Map<number, (L: Lexer) => void> = new Map();
idm161.set(60/* $ */, _43id0/* compressed */);
idm161.set(59/* - */, _43id1/* compressed */);
idm161.set(58/* _ */, _26id2/* compressed */);
idm161.set(28/* : */, _43id4/* compressed */);
const tym161: Map<number, (L: Lexer) => void> = new Map();
tym161.set(3/* id */, _43ty0/* compressed */);
tym161.set(2/* num */, _26ty1/* compressed */);
function State161(l: Lexer): void {
    prod = -1;
    if (idm161.has(l.id)) idm161.get(l.id)(l);
    else if (tym161.has(l.ty)) tym161.get(l.ty)(l);
}
const idm162: Map<number, (L: Lexer) => void> = new Map();
const _162id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State166(l);
    //
};
idm162.set(59/* - */, _162id0);
const _162id1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State167(l);
    //
};
idm162.set(58/* _ */, _162id1);
const tym162: Map<number, (L: Lexer) => void> = new Map();
const _162ty0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State169(l);
    //
};
tym162.set(3/* id */, _162ty0);
const _162ty1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State168(l);
    //
};
tym162.set(2/* num */, _162ty1);
const _162ty2 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State170(l);
    //
};
tym162.set(5/* sym */, _162ty2);
function $declaration_values(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm162.has(l.id)) idm162.get(l.id)(l);
    else if (tym162.has(l.ty)) tym162.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 107:
                State163(l);
                continue;
            case 105:
                State165(l);
                continue;
            case 101:
                State164(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![101].includes(a)) fail(l);
}
const idm163: Map<number, (L: Lexer) => void> = new Map();
const _163id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State166(l);
    if (prod >= 0) return; else FAILED = false;
    //declaration_values=>string_value •

    stack_ptr -= 1;
    prod = 101;
    return;
};
idm163.set(59/* - */, _163id0);
const _163id1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State167(l);
    if (prod >= 0) return; else FAILED = false;
    //declaration_values=>string_value •

    stack_ptr -= 1;
    prod = 101;
    return;
};
idm163.set(58/* _ */, _163id1);
const _163id2 = (l: Lexer): void => {//declaration_values=>string_value •

    stack_ptr -= 1;
    prod = 101;
    return;
};
idm163.set(56/* ! */, _163id2);
idm163.set(15/* ( */, _163id2);
idm163.set(16/* ) */, _163id2);
idm163.set(12/* ; */, _163id2);
idm163.set(13/* } */, _163id2);
const tym163: Map<number, (L: Lexer) => void> = new Map();
const _163ty0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State169(l);
    if (prod >= 0) return; else FAILED = false;
    //declaration_values=>string_value •

    stack_ptr -= 1;
    prod = 101;
    return;
};
tym163.set(3/* id */, _163ty0);
const _163ty1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State168(l);
    if (prod >= 0) return; else FAILED = false;
    //declaration_values=>string_value •

    stack_ptr -= 1;
    prod = 101;
    return;
};
tym163.set(2/* num */, _163ty1);
const _163ty2 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State170(l);
    if (prod >= 0) return; else FAILED = false;
    //declaration_values=>string_value •

    stack_ptr -= 1;
    prod = 101;
    return;
};
tym163.set(5/* sym */, _163ty2);
tym163.set(0, _163id2/* compressed */);
tym163.set(1/* ws */, _163id2/* compressed */);
function State163(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm163.has(l.id)) idm163.get(l.id)(l);
    else if (tym163.has(l.ty)) tym163.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 105:
                State347(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![101, 107].includes(a)) fail(l);
}
const idm164: Map<number, (L: Lexer) => void> = new Map();
const _164id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State348(l);
    //
};
idm164.set(15/* ( */, _164id0);
idm164.set(59/* - */, _162id0/* compressed */);
idm164.set(58/* _ */, _162id1/* compressed */);
const tym164: Map<number, (L: Lexer) => void> = new Map();
tym164.set(3/* id */, _162ty0/* compressed */);
tym164.set(2/* num */, _162ty1/* compressed */);
tym164.set(5/* sym */, _162ty2/* compressed */);
const _164ty3 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State350(l);
    //
};
tym164.set(1/* ws */, _164ty3);
function State164(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm164.has(l.id)) idm164.get(l.id)(l);
    else if (tym164.has(l.ty)) tym164.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 107:
                State349(l);
                continue;
            case 105:
                State165(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![101].includes(a)) fail(l);
}
function State165(l: Lexer): void {
    prod = -1;
    if ([12/* ; */, 13/* } */, 15/* ( */, 16/* ) */, 56/* ! */, 58/* _ */, 59/* - */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* sym */].includes(l.ty)) {
        //string_value=>string_value_group_0162_145 •

        add_reduce(1, 237);
        stack_ptr -= 1;
        prod = 107;
        return;
    }
}
function State166(l: Lexer): void {
    prod = -1;
    if ([12/* ; */, 13/* } */, 15/* ( */, 16/* ) */, 56/* ! */, 58/* _ */, 59/* - */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* sym */].includes(l.ty)) {
        //string_value_group_0162_145=>- •

        stack_ptr -= 1;
        prod = 105;
        return;
    }
}
function State167(l: Lexer): void {
    prod = -1;
    if ([12/* ; */, 13/* } */, 15/* ( */, 16/* ) */, 56/* ! */, 58/* _ */, 59/* - */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* sym */].includes(l.ty)) {
        //string_value_group_0162_145=>_ •

        stack_ptr -= 1;
        prod = 105;
        return;
    }
}
function State168(l: Lexer): void {
    prod = -1;
    if ([12/* ; */, 13/* } */, 15/* ( */, 16/* ) */, 56/* ! */, 58/* _ */, 59/* - */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* sym */].includes(l.ty)) {
        //string_value_group_0162_145=>θnum •

        stack_ptr -= 1;
        prod = 105;
        return;
    }
}
function State169(l: Lexer): void {
    prod = -1;
    if ([12/* ; */, 13/* } */, 15/* ( */, 16/* ) */, 56/* ! */, 58/* _ */, 59/* - */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* sym */].includes(l.ty)) {
        //string_value_group_0162_145=>θid •

        stack_ptr -= 1;
        prod = 105;
        return;
    }
}
function State170(l: Lexer): void {
    prod = -1;
    if ([12/* ; */, 13/* } */, 15/* ( */, 16/* ) */, 56/* ! */, 58/* _ */, 59/* - */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* sym */].includes(l.ty)) {
        //string_value_group_0162_145=>θsym •

        stack_ptr -= 1;
        prod = 105;
        return;
    }
}
const idm171: Map<number, (L: Lexer) => void> = new Map();
idm171.set(59/* - */, _162id0/* compressed */);
idm171.set(58/* _ */, _162id1/* compressed */);
const tym171: Map<number, (L: Lexer) => void> = new Map();
tym171.set(3/* id */, _162ty0/* compressed */);
tym171.set(2/* num */, _162ty1/* compressed */);
tym171.set(5/* sym */, _162ty2/* compressed */);
const _171ty3 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State174(l);
    //
};
tym171.set(1/* ws */, _171ty3);
function $declaration_values_HC_listbody1_144(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm171.has(l.id)) idm171.get(l.id)(l);
    else if (tym171.has(l.ty)) tym171.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 107:
                State163(l);
                continue;
            case 105:
                State165(l);
                continue;
            case 101:
                State175(l);
                continue;
            case 100:
                State172(l);
                continue;
            case 99:
                State173(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![100].includes(a)) fail(l);
}
const idm172: Map<number, (L: Lexer) => void> = new Map();
idm172.set(59/* - */, _162id0/* compressed */);
idm172.set(58/* _ */, _162id1/* compressed */);
const tym172: Map<number, (L: Lexer) => void> = new Map();
tym172.set(3/* id */, _162ty0/* compressed */);
tym172.set(2/* num */, _162ty1/* compressed */);
tym172.set(5/* sym */, _162ty2/* compressed */);
tym172.set(1/* ws */, _171ty3/* compressed */);
function State172(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm172.has(l.id)) idm172.get(l.id)(l);
    else if (tym172.has(l.ty)) tym172.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 107:
                State163(l);
                continue;
            case 105:
                State165(l);
                continue;
            case 101:
                State175(l);
                continue;
            case 99:
                State352(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![100].includes(a)) fail(l);
}
function State173(l: Lexer): void {
    prod = -1;
    if ([16/* ) */, 58/* _ */, 59/* - */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* sym */].includes(l.ty)) {
        //declaration_values_HC_listbody1_144=>declaration_values_group_0144_143 •

        add_reduce(1, 214);
        stack_ptr -= 1;
        prod = 100;
        return;
    }
}
function State174(l: Lexer): void {
    prod = -1;
    if ([16/* ) */, 58/* _ */, 59/* - */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* sym */].includes(l.ty)) {
        //declaration_values_group_0144_143=>θws •

        stack_ptr -= 1;
        prod = 99;
        return;
    }
}
const idm175: Map<number, (L: Lexer) => void> = new Map();
idm175.set(15/* ( */, _164id0/* compressed */);
const _175id1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State166(l);
    if (prod >= 0) return; else FAILED = false;
    //declaration_values_group_0144_143=>declaration_values •

    stack_ptr -= 1;
    prod = 99;
    return;
};
idm175.set(59/* - */, _175id1);
const _175id2 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State167(l);
    if (prod >= 0) return; else FAILED = false;
    //declaration_values_group_0144_143=>declaration_values •

    stack_ptr -= 1;
    prod = 99;
    return;
};
idm175.set(58/* _ */, _175id2);
const _175id3 = (l: Lexer): void => {//declaration_values_group_0144_143=>declaration_values •

    stack_ptr -= 1;
    prod = 99;
    return;
};
idm175.set(16/* ) */, _175id3);
const tym175: Map<number, (L: Lexer) => void> = new Map();
const _175ty0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State169(l);
    if (prod >= 0) return; else FAILED = false;
    //declaration_values_group_0144_143=>declaration_values •

    stack_ptr -= 1;
    prod = 99;
    return;
};
tym175.set(3/* id */, _175ty0);
const _175ty1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State168(l);
    if (prod >= 0) return; else FAILED = false;
    //declaration_values_group_0144_143=>declaration_values •

    stack_ptr -= 1;
    prod = 99;
    return;
};
tym175.set(2/* num */, _175ty1);
const _175ty2 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State170(l);
    if (prod >= 0) return; else FAILED = false;
    //declaration_values_group_0144_143=>declaration_values •

    stack_ptr -= 1;
    prod = 99;
    return;
};
tym175.set(5/* sym */, _175ty2);
const _175ty3 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State350(l);
    if (prod >= 0) return; else FAILED = false;
    //declaration_values_group_0144_143=>declaration_values •

    stack_ptr -= 1;
    prod = 99;
    return;
};
tym175.set(1/* ws */, _175ty3);
tym175.set(0, _175id3/* compressed */);
function State175(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm175.has(l.id)) idm175.get(l.id)(l);
    else if (tym175.has(l.ty)) tym175.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 107:
                State349(l);
                continue;
            case 105:
                State165(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![99, 101].includes(a)) fail(l);
}
const idm176: Map<number, (L: Lexer) => void> = new Map();
idm176.set(59/* - */, _162id0/* compressed */);
idm176.set(58/* _ */, _162id1/* compressed */);
const tym176: Map<number, (L: Lexer) => void> = new Map();
tym176.set(3/* id */, _162ty0/* compressed */);
tym176.set(2/* num */, _162ty1/* compressed */);
tym176.set(5/* sym */, _162ty2/* compressed */);
function $string_value_HC_listbody1_146(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm176.has(l.id)) idm176.get(l.id)(l);
    else if (tym176.has(l.ty)) tym176.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 106:
                State177(l);
                continue;
            case 105:
                State178(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![106].includes(a)) fail(l);
}
const idm177: Map<number, (L: Lexer) => void> = new Map();
idm177.set(59/* - */, _162id0/* compressed */);
idm177.set(58/* _ */, _162id1/* compressed */);
const tym177: Map<number, (L: Lexer) => void> = new Map();
tym177.set(3/* id */, _162ty0/* compressed */);
tym177.set(2/* num */, _162ty1/* compressed */);
tym177.set(5/* sym */, _162ty2/* compressed */);
function State177(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm177.has(l.id)) idm177.get(l.id)(l);
    else if (tym177.has(l.ty)) tym177.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 105:
                State353(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![106].includes(a)) fail(l);
}
function State178(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 59/* - */].includes(l.id) || [0, 2/* num */, 3/* id */, 5/* sym */].includes(l.ty)) {
        //string_value_HC_listbody1_146=>string_value_group_0162_145 •

        add_reduce(1, 235);
        stack_ptr -= 1;
        prod = 106;
        return;
    }
}
const idm179: Map<number, (L: Lexer) => void> = new Map();
idm179.set(59/* - */, _162id0/* compressed */);
idm179.set(58/* _ */, _162id1/* compressed */);
const tym179: Map<number, (L: Lexer) => void> = new Map();
tym179.set(3/* id */, _162ty0/* compressed */);
tym179.set(2/* num */, _162ty1/* compressed */);
tym179.set(5/* sym */, _162ty2/* compressed */);
function $string_value(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm179.has(l.id)) idm179.get(l.id)(l);
    else if (tym179.has(l.ty)) tym179.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 107:
                State180(l);
                continue;
            case 105:
                State165(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![107].includes(a)) fail(l);
}
const idm180: Map<number, (L: Lexer) => void> = new Map();
idm180.set(59/* - */, _162id0/* compressed */);
idm180.set(58/* _ */, _162id1/* compressed */);
const tym180: Map<number, (L: Lexer) => void> = new Map();
tym180.set(3/* id */, _162ty0/* compressed */);
tym180.set(2/* num */, _162ty1/* compressed */);
tym180.set(5/* sym */, _162ty2/* compressed */);
function State180(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm180.has(l.id)) idm180.get(l.id)(l);
    else if (tym180.has(l.ty)) tym180.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 105:
                State347(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![107].includes(a)) fail(l);
}
const idm181: Map<number, (L: Lexer) => void> = new Map();
idm181.set(60/* $ */, _10id0/* compressed */);
idm181.set(59/* - */, _10id2/* compressed */);
const tym181: Map<number, (L: Lexer) => void> = new Map();
tym181.set(3/* id */, _10ty0/* compressed */);
function $css_id_symbols(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm181.has(l.id)) idm181.get(l.id)(l);
    else if (tym181.has(l.ty)) tym181.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State182(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![103].includes(a)) fail(l);
}
const idm182: Map<number, (L: Lexer) => void> = new Map();
idm182.set(60/* $ */, _43id0/* compressed */);
idm182.set(59/* - */, _43id1/* compressed */);
idm182.set(58/* _ */, _26id2/* compressed */);
const tym182: Map<number, (L: Lexer) => void> = new Map();
tym182.set(3/* id */, _43ty0/* compressed */);
tym182.set(2/* num */, _26ty1/* compressed */);
function State182(l: Lexer): void {
    prod = -1;
    if (idm182.has(l.id)) idm182.get(l.id)(l);
    else if (tym182.has(l.ty)) tym182.get(l.ty)(l);
}
const idm183: Map<number, (L: Lexer) => void> = new Map();
idm183.set(60/* $ */, _10id0/* compressed */);
idm183.set(44/* * */, _77id2/* compressed */);
idm183.set(59/* - */, _10id2/* compressed */);
idm183.set(45/* | */, _0id43/* compressed */);
const tym183: Map<number, (L: Lexer) => void> = new Map();
tym183.set(3/* id */, _10ty0/* compressed */);
function $TYPE_SELECTOR(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm183.has(l.id)) idm183.get(l.id)(l);
    else if (tym183.has(l.ty)) tym183.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State87(l);
                continue;
            case 79:
                State84(l);
                continue;
            case 78:
                State85(l);
                continue;
            case 77:
                State88(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![89].includes(a)) fail(l);
}
const idm184: Map<number, (L: Lexer) => void> = new Map();
idm184.set(60/* $ */, _10id0/* compressed */);
idm184.set(44/* * */, _97id1/* compressed */);
idm184.set(59/* - */, _10id2/* compressed */);
idm184.set(45/* | */, _0id43/* compressed */);
const tym184: Map<number, (L: Lexer) => void> = new Map();
tym184.set(3/* id */, _10ty0/* compressed */);
function $WQ_NAME(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm184.has(l.id)) idm184.get(l.id)(l);
    else if (tym184.has(l.ty)) tym184.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State87(l);
                continue;
            case 78:
                State185(l);
                continue;
            case 77:
                State88(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![79].includes(a)) fail(l);
}
const idm185: Map<number, (L: Lexer) => void> = new Map();
idm185.set(60/* $ */, _10id0/* compressed */);
idm185.set(59/* - */, _10id2/* compressed */);
const tym185: Map<number, (L: Lexer) => void> = new Map();
tym185.set(3/* id */, _10ty0/* compressed */);
function State185(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm185.has(l.id)) idm185.get(l.id)(l);
    else if (tym185.has(l.ty)) tym185.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State304(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![79].includes(a)) fail(l);
}
function State186(l: Lexer): void {
    prod = -1;
    if ([45/* | */].includes(l.id)) {
        //NS_PREFIX_group_0112_135=>* •

        stack_ptr -= 1;
        prod = 77;
        return;
    }
}
const idm187: Map<number, (L: Lexer) => void> = new Map();
idm187.set(46/* # */, _0id2/* compressed */);
idm187.set(60/* $ */, _10id0/* compressed */);
idm187.set(44/* * */, _77id2/* compressed */);
idm187.set(41/* + */, _0id10/* compressed */);
idm187.set(59/* - */, _10id2/* compressed */);
idm187.set(47/* . */, _0id13/* compressed */);
idm187.set(28/* : */, _77id5/* compressed */);
idm187.set(40/* > */, _0id18/* compressed */);
idm187.set(48/* [ */, _0id20/* compressed */);
idm187.set(45/* | */, _0id43/* compressed */);
idm187.set(43/* || */, _0id44/* compressed */);
idm187.set(42/* ~ */, _80id11/* compressed */);
const tym187: Map<number, (L: Lexer) => void> = new Map();
tym187.set(3/* id */, _10ty0/* compressed */);
function $COMPLEX_SELECTOR_HC_listbody2_130(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm187.has(l.id)) idm187.get(l.id)(l);
    else if (tym187.has(l.ty)) tym187.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State87(l);
                continue;
            case 90:
                State100(l);
                continue;
            case 89:
                State81(l);
                continue;
            case 86:
                State93(l);
                continue;
            case 84:
                State94(l);
                continue;
            case 82:
                State92(l);
                continue;
            case 81:
                State91(l);
                continue;
            case 80:
                State90(l);
                continue;
            case 79:
                State84(l);
                continue;
            case 78:
                State85(l);
                continue;
            case 77:
                State88(l);
                continue;
            case 76:
                State192(l);
                continue;
            case 75:
                State191(l);
                continue;
            case 74:
                State83(l);
                continue;
            case 73:
                State99(l);
                continue;
            case 71:
                State82(l);
                continue;
            case 69:
                State188(l);
                continue;
            case 68:
                State189(l);
                continue;
            case 67:
                State190(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![69].includes(a)) fail(l);
}
const idm188: Map<number, (L: Lexer) => void> = new Map();
idm188.set(46/* # */, _0id2/* compressed */);
idm188.set(60/* $ */, _10id0/* compressed */);
idm188.set(44/* * */, _77id2/* compressed */);
idm188.set(41/* + */, _0id10/* compressed */);
idm188.set(59/* - */, _10id2/* compressed */);
idm188.set(47/* . */, _0id13/* compressed */);
idm188.set(28/* : */, _77id5/* compressed */);
idm188.set(40/* > */, _0id18/* compressed */);
idm188.set(48/* [ */, _0id20/* compressed */);
idm188.set(45/* | */, _0id43/* compressed */);
idm188.set(43/* || */, _0id44/* compressed */);
idm188.set(42/* ~ */, _80id11/* compressed */);
const tym188: Map<number, (L: Lexer) => void> = new Map();
tym188.set(3/* id */, _10ty0/* compressed */);
function State188(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm188.has(l.id)) idm188.get(l.id)(l);
    else if (tym188.has(l.ty)) tym188.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State87(l);
                continue;
            case 90:
                State100(l);
                continue;
            case 89:
                State81(l);
                continue;
            case 86:
                State93(l);
                continue;
            case 84:
                State94(l);
                continue;
            case 82:
                State92(l);
                continue;
            case 81:
                State91(l);
                continue;
            case 80:
                State90(l);
                continue;
            case 79:
                State84(l);
                continue;
            case 78:
                State85(l);
                continue;
            case 77:
                State88(l);
                continue;
            case 76:
                State192(l);
                continue;
            case 75:
                State191(l);
                continue;
            case 74:
                State83(l);
                continue;
            case 73:
                State99(l);
                continue;
            case 71:
                State82(l);
                continue;
            case 68:
                State358(l);
                continue;
            case 67:
                State190(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![69].includes(a)) fail(l);
}
function State189(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 16/* ) */, 28/* : */, 40/* > */, 41/* + */, 42/* ~ */, 43/* || */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //COMPLEX_SELECTOR_HC_listbody2_130=>COMPLEX_SELECTOR_group_1103_129 •

        add_reduce(1, 143);
        stack_ptr -= 1;
        prod = 69;
        return;
    }
}
const idm190: Map<number, (L: Lexer) => void> = new Map();
idm190.set(46/* # */, _0id2/* compressed */);
idm190.set(60/* $ */, _10id0/* compressed */);
idm190.set(44/* * */, _77id2/* compressed */);
idm190.set(59/* - */, _10id2/* compressed */);
idm190.set(47/* . */, _0id13/* compressed */);
idm190.set(28/* : */, _77id5/* compressed */);
idm190.set(48/* [ */, _0id20/* compressed */);
idm190.set(45/* | */, _0id43/* compressed */);
const tym190: Map<number, (L: Lexer) => void> = new Map();
tym190.set(3/* id */, _10ty0/* compressed */);
function State190(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm190.has(l.id)) idm190.get(l.id)(l);
    else if (tym190.has(l.ty)) tym190.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State87(l);
                continue;
            case 90:
                State100(l);
                continue;
            case 89:
                State81(l);
                continue;
            case 86:
                State93(l);
                continue;
            case 84:
                State94(l);
                continue;
            case 82:
                State92(l);
                continue;
            case 81:
                State91(l);
                continue;
            case 80:
                State90(l);
                continue;
            case 79:
                State84(l);
                continue;
            case 78:
                State85(l);
                continue;
            case 77:
                State88(l);
                continue;
            case 75:
                State361(l);
                continue;
            case 74:
                State83(l);
                continue;
            case 73:
                State99(l);
                continue;
            case 71:
                State82(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![68].includes(a)) fail(l);
}
function State191(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 16/* ) */, 28/* : */, 40/* > */, 41/* + */, 42/* ~ */, 43/* || */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //COMPLEX_SELECTOR_group_1103_129=>COMPOUND_SELECTOR •

        add_reduce(1, 141);
        stack_ptr -= 1;
        prod = 68;
        return;
    }
}
function State192(l: Lexer): void {
    prod = -1;
    if ([28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [3/* id */].includes(l.ty)) {
        //COMPLEX_SELECTOR_group_0102_128=>COMBINATOR •

        add_reduce(1, 139);
        stack_ptr -= 1;
        prod = 67;
        return;
    }
}
function State193(l: Lexer): void {
    prod = -1;
    if ([28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [3/* id */].includes(l.ty)) {
        //COMBINATOR=>> •

        stack_ptr -= 1;
        prod = 76;
        return;
    }
}
function State194(l: Lexer): void {
    prod = -1;
    if ([28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [3/* id */].includes(l.ty)) {
        //COMBINATOR=>+ •

        stack_ptr -= 1;
        prod = 76;
        return;
    }
}
function State195(l: Lexer): void {
    prod = -1;
    if ([28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [3/* id */].includes(l.ty)) {
        //COMBINATOR=>~ •

        stack_ptr -= 1;
        prod = 76;
        return;
    }
}
function State196(l: Lexer): void {
    prod = -1;
    if ([28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [3/* id */].includes(l.ty)) {
        //COMBINATOR=>|| •

        stack_ptr -= 1;
        prod = 76;
        return;
    }
}
const idm197: Map<number, (L: Lexer) => void> = new Map();
idm197.set(46/* # */, _0id2/* compressed */);
idm197.set(60/* $ */, _10id0/* compressed */);
idm197.set(44/* * */, _77id2/* compressed */);
idm197.set(59/* - */, _10id2/* compressed */);
idm197.set(47/* . */, _0id13/* compressed */);
idm197.set(28/* : */, _77id5/* compressed */);
idm197.set(48/* [ */, _0id20/* compressed */);
idm197.set(45/* | */, _0id43/* compressed */);
const tym197: Map<number, (L: Lexer) => void> = new Map();
tym197.set(3/* id */, _10ty0/* compressed */);
function $STYLE_RULE(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm197.has(l.id)) idm197.get(l.id)(l);
    else if (tym197.has(l.ty)) tym197.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State87(l);
                continue;
            case 90:
                State100(l);
                continue;
            case 89:
                State81(l);
                continue;
            case 86:
                State93(l);
                continue;
            case 84:
                State94(l);
                continue;
            case 82:
                State92(l);
                continue;
            case 81:
                State91(l);
                continue;
            case 80:
                State90(l);
                continue;
            case 79:
                State84(l);
                continue;
            case 78:
                State85(l);
                continue;
            case 77:
                State88(l);
                continue;
            case 75:
                State80(l);
                continue;
            case 74:
                State83(l);
                continue;
            case 73:
                State99(l);
                continue;
            case 71:
                State82(l);
                continue;
            case 70:
                State79(l);
                continue;
            case 5:
                State104(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![6].includes(a)) fail(l);
}
const idm198: Map<number, (L: Lexer) => void> = new Map();
const _198id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State203(l);
    //
};
idm198.set(59/* - */, _198id0);
idm198.set(74/* / */, _0id14/* compressed */);
idm198.set(75/* \ */, _0id21/* compressed */);
const _198id3 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State204(l);
    //
};
idm198.set(58/* _ */, _198id3);
const tym198: Map<number, (L: Lexer) => void> = new Map();
const _198ty0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State205(l);
    //
};
tym198.set(88, _198ty0);
tym198.set(5/* cb */, _0ty1/* compressed */);
const _198ty2 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State209(l);
    //
};
tym198.set(3/* id */, _198ty2);
const _198ty3 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State208(l);
    //
};
tym198.set(2/* num */, _198ty3);
tym198.set(5/* ob */, _0ty4/* compressed */);
const _198ty5 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State210(l);
    //
};
tym198.set(5/* sym */, _198ty5);
function $def$string_value_HC_listbody2_105(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm198.has(l.id)) idm198.get(l.id)(l);
    else if (tym198.has(l.ty)) tym198.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 126:
                State199(l);
                continue;
            case 125:
                State200(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![126].includes(a)) fail(l);
}
const idm199: Map<number, (L: Lexer) => void> = new Map();
idm199.set(59/* - */, _198id0/* compressed */);
idm199.set(74/* / */, _0id14/* compressed */);
idm199.set(75/* \ */, _0id21/* compressed */);
idm199.set(58/* _ */, _198id3/* compressed */);
const tym199: Map<number, (L: Lexer) => void> = new Map();
tym199.set(88, _198ty0/* compressed */);
tym199.set(5/* cb */, _0ty1/* compressed */);
tym199.set(3/* id */, _198ty2/* compressed */);
tym199.set(2/* num */, _198ty3/* compressed */);
tym199.set(5/* ob */, _0ty4/* compressed */);
tym199.set(5/* sym */, _198ty5/* compressed */);
function State199(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm199.has(l.id)) idm199.get(l.id)(l);
    else if (tym199.has(l.ty)) tym199.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 125:
                State356(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![126].includes(a)) fail(l);
}
function State200(l: Lexer): void {
    prod = -1;
    if ([39/* " */, 58/* _ */, 59/* - */, 73/* ' */, 74/* / */, 75/* \ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* cb */, 5/* ob */, 5/* sym */, 88].includes(l.ty)) {
        //def$string_value_HC_listbody2_105=>def$string_value_group_149_104 •

        add_reduce(1, 293);
        stack_ptr -= 1;
        prod = 126;
        return;
    }
}
function State201(l: Lexer): void {
    prod = -1;
    if ([39/* " */, 58/* _ */, 59/* - */, 73/* ' */, 74/* / */, 75/* \ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* cb */, 5/* ob */, 5/* sym */, 88].includes(l.ty)) {
        //def$string_value_group_149_104=>/ •

        stack_ptr -= 1;
        prod = 125;
        return;
    }
}
const idm202: Map<number, (L: Lexer) => void> = new Map();
const _202id0 = (l: Lexer): void => {//def$string_value_group_149_104=>\ •

    stack_ptr -= 1;
    prod = 125;
    return;
};
idm202.set(39/* " */, _202id0);
idm202.set(73/* ' */, _202id0);
idm202.set(59/* - */, _202id0);
idm202.set(74/* / */, _202id0);
idm202.set(75/* \ */, _202id0);
idm202.set(58/* _ */, _202id0);
const tym202: Map<number, (L: Lexer) => void> = new Map();
const _202ty0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State357(l); return;
    if (prod >= 0) return; else FAILED = false;
    //def$string_value_group_149_104=>\ •

    stack_ptr -= 1;
    prod = 125;
    return;
};
tym202.set(88, _202ty0);
tym202.set(0, _202id0/* compressed */);
tym202.set(5/* cb */, _202id0/* compressed */);
tym202.set(3/* id */, _202id0/* compressed */);
tym202.set(2/* num */, _202id0/* compressed */);
tym202.set(5/* ob */, _202id0/* compressed */);
tym202.set(5/* sym */, _202id0/* compressed */);
tym202.set(1/* ws */, _202id0/* compressed */);
function State202(l: Lexer): void {
    prod = -1;
    if (idm202.has(l.id)) idm202.get(l.id)(l);
    else if (tym202.has(l.ty)) tym202.get(l.ty)(l);
}
function State203(l: Lexer): void {
    prod = -1;
    if ([39/* " */, 58/* _ */, 59/* - */, 73/* ' */, 74/* / */, 75/* \ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* cb */, 5/* ob */, 5/* sym */, 88].includes(l.ty)) {
        //def$string_value_group_149_104=>- •

        stack_ptr -= 1;
        prod = 125;
        return;
    }
}
function State204(l: Lexer): void {
    prod = -1;
    if ([39/* " */, 58/* _ */, 59/* - */, 73/* ' */, 74/* / */, 75/* \ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* cb */, 5/* ob */, 5/* sym */, 88].includes(l.ty)) {
        //def$string_value_group_149_104=>_ •

        stack_ptr -= 1;
        prod = 125;
        return;
    }
}
function State205(l: Lexer): void {
    prod = -1;
    if ([39/* " */, 58/* _ */, 59/* - */, 73/* ' */, 74/* / */, 75/* \ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* cb */, 5/* ob */, 5/* sym */, 88].includes(l.ty)) {
        //def$string_value_group_149_104=>θany •

        stack_ptr -= 1;
        prod = 125;
        return;
    }
}
function State206(l: Lexer): void {
    prod = -1;
    if ([39/* " */, 58/* _ */, 59/* - */, 73/* ' */, 74/* / */, 75/* \ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* cb */, 5/* ob */, 5/* sym */, 88].includes(l.ty)) {
        //def$string_value_group_149_104=>θob •

        stack_ptr -= 1;
        prod = 125;
        return;
    }
}
function State207(l: Lexer): void {
    prod = -1;
    if ([39/* " */, 58/* _ */, 59/* - */, 73/* ' */, 74/* / */, 75/* \ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* cb */, 5/* ob */, 5/* sym */, 88].includes(l.ty)) {
        //def$string_value_group_149_104=>θcb •

        stack_ptr -= 1;
        prod = 125;
        return;
    }
}
function State208(l: Lexer): void {
    prod = -1;
    if ([39/* " */, 58/* _ */, 59/* - */, 73/* ' */, 74/* / */, 75/* \ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* cb */, 5/* ob */, 5/* sym */, 88].includes(l.ty)) {
        //def$string_value_group_149_104=>θnum •

        stack_ptr -= 1;
        prod = 125;
        return;
    }
}
function State209(l: Lexer): void {
    prod = -1;
    if ([39/* " */, 58/* _ */, 59/* - */, 73/* ' */, 74/* / */, 75/* \ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* cb */, 5/* ob */, 5/* sym */, 88].includes(l.ty)) {
        //def$string_value_group_149_104=>θid •

        stack_ptr -= 1;
        prod = 125;
        return;
    }
}
function State210(l: Lexer): void {
    prod = -1;
    if ([39/* " */, 58/* _ */, 59/* - */, 73/* ' */, 74/* / */, 75/* \ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* cb */, 5/* ob */, 5/* sym */, 88].includes(l.ty)) {
        //def$string_value_group_149_104=>θsym •

        stack_ptr -= 1;
        prod = 125;
        return;
    }
}
const idm211: Map<number, (L: Lexer) => void> = new Map();
idm211.set(59/* - */, _198id0/* compressed */);
idm211.set(74/* / */, _0id14/* compressed */);
idm211.set(75/* \ */, _0id21/* compressed */);
idm211.set(58/* _ */, _198id3/* compressed */);
const tym211: Map<number, (L: Lexer) => void> = new Map();
tym211.set(88, _198ty0/* compressed */);
tym211.set(5/* cb */, _0ty1/* compressed */);
tym211.set(3/* id */, _198ty2/* compressed */);
tym211.set(2/* num */, _198ty3/* compressed */);
tym211.set(5/* ob */, _0ty4/* compressed */);
tym211.set(5/* sym */, _198ty5/* compressed */);
const _211ty6 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State215(l);
    //
};
tym211.set(1/* ws */, _211ty6);
function $def$string_HC_listbody1_103(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm211.has(l.id)) idm211.get(l.id)(l);
    else if (tym211.has(l.ty)) tym211.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 127:
                State214(l);
                continue;
            case 126:
                State216(l);
                continue;
            case 125:
                State200(l);
                continue;
            case 123:
                State212(l);
                continue;
            case 121:
                State213(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![123].includes(a)) fail(l);
}
const idm212: Map<number, (L: Lexer) => void> = new Map();
idm212.set(59/* - */, _198id0/* compressed */);
idm212.set(74/* / */, _0id14/* compressed */);
idm212.set(75/* \ */, _0id21/* compressed */);
idm212.set(58/* _ */, _198id3/* compressed */);
const tym212: Map<number, (L: Lexer) => void> = new Map();
tym212.set(88, _198ty0/* compressed */);
tym212.set(5/* cb */, _0ty1/* compressed */);
tym212.set(3/* id */, _198ty2/* compressed */);
tym212.set(2/* num */, _198ty3/* compressed */);
tym212.set(5/* ob */, _0ty4/* compressed */);
tym212.set(5/* sym */, _198ty5/* compressed */);
tym212.set(1/* ws */, _211ty6/* compressed */);
function State212(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm212.has(l.id)) idm212.get(l.id)(l);
    else if (tym212.has(l.ty)) tym212.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 127:
                State214(l);
                continue;
            case 126:
                State216(l);
                continue;
            case 125:
                State200(l);
                continue;
            case 121:
                State359(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![123].includes(a)) fail(l);
}
function State213(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 59/* - */, 73/* ' */, 74/* / */, 75/* \ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* cb */, 5/* ob */, 5/* sym */, 88].includes(l.ty)) {
        //def$string_HC_listbody1_103=>def$string_group_034_101 •

        add_reduce(1, 278);
        stack_ptr -= 1;
        prod = 123;
        return;
    }
}
function State214(l: Lexer): void {
    prod = -1;
    if ([39/* " */, 58/* _ */, 59/* - */, 73/* ' */, 74/* / */, 75/* \ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* cb */, 5/* ob */, 5/* sym */, 88].includes(l.ty)) {
        //def$string_group_034_101=>def$string_value •

        stack_ptr -= 1;
        prod = 121;
        return;
    }
}
function State215(l: Lexer): void {
    prod = -1;
    if ([39/* " */, 58/* _ */, 59/* - */, 73/* ' */, 74/* / */, 75/* \ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* cb */, 5/* ob */, 5/* sym */, 88].includes(l.ty)) {
        //def$string_group_034_101=>θws •

        stack_ptr -= 1;
        prod = 121;
        return;
    }
}
const idm216: Map<number, (L: Lexer) => void> = new Map();
const _216id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State203(l);
    if (prod >= 0) return; else FAILED = false;
    //def$string_value=>def$string_value_HC_listbody2_105 •

    stack_ptr -= 1;
    prod = 127;
    return;
};
idm216.set(59/* - */, _216id0);
const _216id1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State201(l);
    if (prod >= 0) return; else FAILED = false;
    //def$string_value=>def$string_value_HC_listbody2_105 •

    stack_ptr -= 1;
    prod = 127;
    return;
};
idm216.set(74/* / */, _216id1);
const _216id2 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State202(l);
    if (prod >= 0) return; else FAILED = false;
    //def$string_value=>def$string_value_HC_listbody2_105 •

    stack_ptr -= 1;
    prod = 127;
    return;
};
idm216.set(75/* \ */, _216id2);
const _216id3 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State204(l);
    if (prod >= 0) return; else FAILED = false;
    //def$string_value=>def$string_value_HC_listbody2_105 •

    stack_ptr -= 1;
    prod = 127;
    return;
};
idm216.set(58/* _ */, _216id3);
const _216id4 = (l: Lexer): void => {//def$string_value=>def$string_value_HC_listbody2_105 •

    stack_ptr -= 1;
    prod = 127;
    return;
};
idm216.set(39/* " */, _216id4);
idm216.set(73/* ' */, _216id4);
const tym216: Map<number, (L: Lexer) => void> = new Map();
const _216ty0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State205(l);
    if (prod >= 0) return; else FAILED = false;
    //def$string_value=>def$string_value_HC_listbody2_105 •

    stack_ptr -= 1;
    prod = 127;
    return;
};
tym216.set(88, _216ty0);
const _216ty1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State207(l);
    if (prod >= 0) return; else FAILED = false;
    //def$string_value=>def$string_value_HC_listbody2_105 •

    stack_ptr -= 1;
    prod = 127;
    return;
};
tym216.set(5/* cb */, _216ty1);
const _216ty2 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State209(l);
    if (prod >= 0) return; else FAILED = false;
    //def$string_value=>def$string_value_HC_listbody2_105 •

    stack_ptr -= 1;
    prod = 127;
    return;
};
tym216.set(3/* id */, _216ty2);
const _216ty3 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State208(l);
    if (prod >= 0) return; else FAILED = false;
    //def$string_value=>def$string_value_HC_listbody2_105 •

    stack_ptr -= 1;
    prod = 127;
    return;
};
tym216.set(2/* num */, _216ty3);
const _216ty4 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State206(l);
    if (prod >= 0) return; else FAILED = false;
    //def$string_value=>def$string_value_HC_listbody2_105 •

    stack_ptr -= 1;
    prod = 127;
    return;
};
tym216.set(5/* ob */, _216ty4);
const _216ty5 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State210(l);
    if (prod >= 0) return; else FAILED = false;
    //def$string_value=>def$string_value_HC_listbody2_105 •

    stack_ptr -= 1;
    prod = 127;
    return;
};
tym216.set(5/* sym */, _216ty5);
tym216.set(0, _216id4/* compressed */);
tym216.set(1/* ws */, _216id4/* compressed */);
function State216(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm216.has(l.id)) idm216.get(l.id)(l);
    else if (tym216.has(l.ty)) tym216.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 125:
                State356(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![127, 126].includes(a)) fail(l);
}
const idm217: Map<number, (L: Lexer) => void> = new Map();
idm217.set(59/* - */, _198id0/* compressed */);
idm217.set(74/* / */, _0id14/* compressed */);
idm217.set(75/* \ */, _0id21/* compressed */);
idm217.set(58/* _ */, _198id3/* compressed */);
const tym217: Map<number, (L: Lexer) => void> = new Map();
tym217.set(88, _198ty0/* compressed */);
tym217.set(5/* cb */, _0ty1/* compressed */);
tym217.set(3/* id */, _198ty2/* compressed */);
tym217.set(2/* num */, _198ty3/* compressed */);
tym217.set(5/* ob */, _0ty4/* compressed */);
tym217.set(5/* sym */, _198ty5/* compressed */);
tym217.set(1/* ws */, _211ty6/* compressed */);
function $def$string_HC_listbody1_102(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm217.has(l.id)) idm217.get(l.id)(l);
    else if (tym217.has(l.ty)) tym217.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 127:
                State214(l);
                continue;
            case 126:
                State216(l);
                continue;
            case 125:
                State200(l);
                continue;
            case 122:
                State218(l);
                continue;
            case 121:
                State219(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![122].includes(a)) fail(l);
}
const idm218: Map<number, (L: Lexer) => void> = new Map();
idm218.set(59/* - */, _198id0/* compressed */);
idm218.set(74/* / */, _0id14/* compressed */);
idm218.set(75/* \ */, _0id21/* compressed */);
idm218.set(58/* _ */, _198id3/* compressed */);
const tym218: Map<number, (L: Lexer) => void> = new Map();
tym218.set(88, _198ty0/* compressed */);
tym218.set(5/* cb */, _0ty1/* compressed */);
tym218.set(3/* id */, _198ty2/* compressed */);
tym218.set(2/* num */, _198ty3/* compressed */);
tym218.set(5/* ob */, _0ty4/* compressed */);
tym218.set(5/* sym */, _198ty5/* compressed */);
tym218.set(1/* ws */, _211ty6/* compressed */);
function State218(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm218.has(l.id)) idm218.get(l.id)(l);
    else if (tym218.has(l.ty)) tym218.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 127:
                State214(l);
                continue;
            case 126:
                State216(l);
                continue;
            case 125:
                State200(l);
                continue;
            case 121:
                State360(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![122].includes(a)) fail(l);
}
function State219(l: Lexer): void {
    prod = -1;
    if ([39/* " */, 58/* _ */, 59/* - */, 74/* / */, 75/* \ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* cb */, 5/* ob */, 5/* sym */, 88].includes(l.ty)) {
        //def$string_HC_listbody1_102=>def$string_group_034_101 •

        add_reduce(1, 276);
        stack_ptr -= 1;
        prod = 122;
        return;
    }
}
function State220(l: Lexer): void {
    prod = -1;
    if ([17/* @ */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //STYLE_SHEET_HC_listbody1_100=>STYLE_SHEET_HC_listbody1_100 import •

        add_reduce(2, 1);
        stack_ptr -= 2;
        prod = 1;
        return;
    }
}
const idm221: Map<number, (L: Lexer) => void> = new Map();
const _221id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State365(l);
    //
};
idm221.set(39/* " */, _221id0);
idm221.set(38/* url */, _0id41/* compressed */);
function State221(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm221.has(l.id)) idm221.get(l.id)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 66:
                State363(l);
                continue;
            case 65:
                State364(l);
                continue;
            case 10:
                State362(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![14].includes(a)) fail(l);
}
function State222(l: Lexer): void {
    prod = -1;
    if ([17/* @ */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //AT_RULE=>media ; •

        add_reduce(2, 21);
        stack_ptr -= 2;
        prod = 9;
        return;
    }
}
function State223(l: Lexer): void {
    prod = -1;
    if ([17/* @ */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //AT_RULE=>import ; •

        add_reduce(2, 22);
        stack_ptr -= 2;
        prod = 9;
        return;
    }
}
function State224(l: Lexer): void {
    prod = -1;
    if ([17/* @ */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //AT_RULE=>keyframes ; •

        add_reduce(2, 23);
        stack_ptr -= 2;
        prod = 9;
        return;
    }
}
function State225(l: Lexer): void {
    prod = -1;
    if ([17/* @ */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //AT_RULE=>supports ; •

        add_reduce(2, 24);
        stack_ptr -= 2;
        prod = 9;
        return;
    }
}
const idm226: Map<number, (L: Lexer) => void> = new Map();
idm226.set(60/* $ */, _10id0/* compressed */);
idm226.set(15/* ( */, _10id1/* compressed */);
idm226.set(59/* - */, _10id2/* compressed */);
idm226.set(24/* not */, _10id3/* compressed */);
idm226.set(27/* only */, _0id35/* compressed */);
const tym226: Map<number, (L: Lexer) => void> = new Map();
tym226.set(3/* id */, _10ty0/* compressed */);
function State226(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm226.has(l.id)) idm226.get(l.id)(l);
    else if (tym226.has(l.ty)) tym226.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State25(l);
                continue;
            case 61:
                State15(l);
                continue;
            case 52:
                State24(l);
                continue;
            case 49:
                State23(l);
                continue;
            case 47:
                State20(l);
                continue;
            case 46:
                State17(l);
                continue;
            case 43:
                State19(l);
                continue;
            case 40:
                State18(l);
                continue;
            case 39:
                State16(l);
                continue;
            case 38:
                State13(l);
                continue;
            case 37:
                State68(l);
                continue;
            case 35:
                State14(l);
                continue;
            case 34:
                State373(l);
                continue;
            case 33:
                State374(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![31].includes(a)) fail(l);
}
const idm227: Map<number, (L: Lexer) => void> = new Map();
idm227.set(39/* " */, _221id0/* compressed */);
const tym227: Map<number, (L: Lexer) => void> = new Map();
const _227ty0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State368(l);
    //
};
tym227.set(3/* id */, _227ty0);
function State227(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm227.has(l.id)) idm227.get(l.id)(l);
    else if (tym227.has(l.ty)) tym227.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 66:
                State369(l);
                continue;
            case 18:
                State367(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![17].includes(a)) fail(l);
}
const idm228: Map<number, (L: Lexer) => void> = new Map();
idm228.set(60/* $ */, _10id0/* compressed */);
idm228.set(15/* ( */, _31id1/* compressed */);
idm228.set(59/* - */, _10id2/* compressed */);
idm228.set(24/* not */, _31id3/* compressed */);
idm228.set(25/* selector */, _0id38/* compressed */);
const tym228: Map<number, (L: Lexer) => void> = new Map();
tym228.set(3/* id */, _10ty0/* compressed */);
function State228(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm228.has(l.id)) idm228.get(l.id)(l);
    else if (tym228.has(l.ty)) tym228.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State42(l);
                continue;
            case 52:
                State38(l);
                continue;
            case 30:
                State39(l);
                continue;
            case 29:
                State40(l);
                continue;
            case 28:
                State37(l);
                continue;
            case 27:
                State35(l);
                continue;
            case 26:
                State372(l);
                continue;
            case 22:
                State371(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![23].includes(a)) fail(l);
}
const idm229: Map<number, (L: Lexer) => void> = new Map();
idm229.set(60/* $ */, _10id0/* compressed */);
idm229.set(15/* ( */, _10id1/* compressed */);
idm229.set(59/* - */, _10id2/* compressed */);
idm229.set(24/* not */, _10id3/* compressed */);
idm229.set(27/* only */, _0id35/* compressed */);
const tym229: Map<number, (L: Lexer) => void> = new Map();
tym229.set(3/* id */, _10ty0/* compressed */);
function State229(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm229.has(l.id)) idm229.get(l.id)(l);
    else if (tym229.has(l.ty)) tym229.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State25(l);
                continue;
            case 61:
                State15(l);
                continue;
            case 52:
                State24(l);
                continue;
            case 49:
                State23(l);
                continue;
            case 47:
                State20(l);
                continue;
            case 46:
                State17(l);
                continue;
            case 43:
                State19(l);
                continue;
            case 40:
                State18(l);
                continue;
            case 39:
                State16(l);
                continue;
            case 38:
                State13(l);
                continue;
            case 37:
                State394(l);
                continue;
            case 35:
                State14(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![13].includes(a)) fail(l);
}
function State230(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 12/* ; */, 17/* @ */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //media_query=>media_type media_query_group_144_117 •

        add_reduce(2, 82);
        stack_ptr -= 2;
        prod = 37;
        return;
    }
}
const idm231: Map<number, (L: Lexer) => void> = new Map();
idm231.set(60/* $ */, _10id0/* compressed */);
idm231.set(15/* ( */, _10id1/* compressed */);
idm231.set(59/* - */, _10id2/* compressed */);
idm231.set(24/* not */, _22id4/* compressed */);
const tym231: Map<number, (L: Lexer) => void> = new Map();
tym231.set(3/* id */, _10ty0/* compressed */);
function State231(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm231.has(l.id)) idm231.get(l.id)(l);
    else if (tym231.has(l.ty)) tym231.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State42(l);
                continue;
            case 52:
                State24(l);
                continue;
            case 49:
                State23(l);
                continue;
            case 47:
                State71(l);
                continue;
            case 43:
                State19(l);
                continue;
            case 40:
                State18(l);
                continue;
            case 39:
                State381(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![36].includes(a)) fail(l);
}
const idm232: Map<number, (L: Lexer) => void> = new Map();
idm232.set(46/* # */, _0id2/* compressed */);
idm232.set(60/* $ */, _10id0/* compressed */);
idm232.set(44/* * */, _77id2/* compressed */);
idm232.set(59/* - */, _10id2/* compressed */);
idm232.set(47/* . */, _0id13/* compressed */);
idm232.set(28/* : */, _77id5/* compressed */);
idm232.set(48/* [ */, _0id20/* compressed */);
idm232.set(45/* | */, _0id43/* compressed */);
const tym232: Map<number, (L: Lexer) => void> = new Map();
tym232.set(3/* id */, _10ty0/* compressed */);
function $COMPOUND_SELECTOR(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm232.has(l.id)) idm232.get(l.id)(l);
    else if (tym232.has(l.ty)) tym232.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State87(l);
                continue;
            case 90:
                State100(l);
                continue;
            case 89:
                State81(l);
                continue;
            case 86:
                State93(l);
                continue;
            case 84:
                State94(l);
                continue;
            case 82:
                State92(l);
                continue;
            case 81:
                State91(l);
                continue;
            case 80:
                State90(l);
                continue;
            case 79:
                State84(l);
                continue;
            case 78:
                State85(l);
                continue;
            case 77:
                State88(l);
                continue;
            case 74:
                State83(l);
                continue;
            case 73:
                State99(l);
                continue;
            case 71:
                State82(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![75].includes(a)) fail(l);
}
const idm233: Map<number, (L: Lexer) => void> = new Map();
idm233.set(22/* and */, _15id0/* compressed */);
const _233id1 = (l: Lexer): void => {//media_query=>media_query_group_043_116 media_type •

    add_reduce(2, 83);
    stack_ptr -= 2;
    prod = 37;
    return;
};
idm233.set(46/* # */, _233id1);
idm233.set(60/* $ */, _233id1);
idm233.set(44/* * */, _233id1);
idm233.set(10/* , */, _233id1);
idm233.set(59/* - */, _233id1);
idm233.set(47/* . */, _233id1);
idm233.set(28/* : */, _233id1);
idm233.set(12/* ; */, _233id1);
idm233.set(17/* @ */, _233id1);
idm233.set(48/* [ */, _233id1);
idm233.set(11/* { */, _233id1);
idm233.set(45/* | */, _233id1);
const tym233: Map<number, (L: Lexer) => void> = new Map();
tym233.set(0, _233id1/* compressed */);
tym233.set(3/* id */, _233id1/* compressed */);
function State233(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm233.has(l.id)) idm233.get(l.id)(l);
    else if (tym233.has(l.ty)) tym233.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 36:
                State370(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![37].includes(a)) fail(l);
}
function State234(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 12/* ; */, 17/* @ */, 22/* and */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //media_type=>identifier •

        add_reduce(1, 133);
        stack_ptr -= 1;
        prod = 61;
        return;
    }
}
const idm235: Map<number, (L: Lexer) => void> = new Map();
idm235.set(22/* and */, _20id0/* compressed */);
const _235id1 = (l: Lexer): void => {//media_and=>media_in_parenths media_and_HC_listbody2_119 •

    add_reduce(2, 94);
    stack_ptr -= 2;
    prod = 43;
    return;
};
idm235.set(46/* # */, _235id1);
idm235.set(60/* $ */, _235id1);
idm235.set(16/* ) */, _235id1);
idm235.set(44/* * */, _235id1);
idm235.set(10/* , */, _235id1);
idm235.set(59/* - */, _235id1);
idm235.set(47/* . */, _235id1);
idm235.set(28/* : */, _235id1);
idm235.set(12/* ; */, _235id1);
idm235.set(17/* @ */, _235id1);
idm235.set(48/* [ */, _235id1);
idm235.set(11/* { */, _235id1);
idm235.set(45/* | */, _235id1);
const tym235: Map<number, (L: Lexer) => void> = new Map();
tym235.set(0, _235id1/* compressed */);
tym235.set(3/* id */, _235id1/* compressed */);
function State235(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm235.has(l.id)) idm235.get(l.id)(l);
    else if (tym235.has(l.ty)) tym235.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 41:
                State294(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![43, 42].includes(a)) fail(l);
}
const idm236: Map<number, (L: Lexer) => void> = new Map();
idm236.set(23/* or */, _20id1/* compressed */);
const _236id1 = (l: Lexer): void => {//media_or=>media_in_parenths media_or_HC_listbody2_121 •

    add_reduce(2, 98);
    stack_ptr -= 2;
    prod = 46;
    return;
};
idm236.set(46/* # */, _236id1);
idm236.set(60/* $ */, _236id1);
idm236.set(16/* ) */, _236id1);
idm236.set(44/* * */, _236id1);
idm236.set(10/* , */, _236id1);
idm236.set(59/* - */, _236id1);
idm236.set(47/* . */, _236id1);
idm236.set(28/* : */, _236id1);
idm236.set(12/* ; */, _236id1);
idm236.set(17/* @ */, _236id1);
idm236.set(48/* [ */, _236id1);
idm236.set(11/* { */, _236id1);
idm236.set(45/* | */, _236id1);
const tym236: Map<number, (L: Lexer) => void> = new Map();
tym236.set(0, _236id1/* compressed */);
tym236.set(3/* id */, _236id1/* compressed */);
function State236(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm236.has(l.id)) idm236.get(l.id)(l);
    else if (tym236.has(l.ty)) tym236.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 44:
                State310(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![46, 45].includes(a)) fail(l);
}
const idm237: Map<number, (L: Lexer) => void> = new Map();
const _237id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State376(l);
    //
};
idm237.set(16/* ) */, _237id0);
const tym237: Map<number, (L: Lexer) => void> = new Map();
tym237.set(3/* id */, _110ty0/* compressed */);
tym237.set(1/* ws */, _110ty1/* compressed */);
function State237(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm237.has(l.id)) idm237.get(l.id)(l);
    else if (tym237.has(l.ty)) tym237.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 51:
                State375(l);
                continue;
            case 50:
                State112(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![52].includes(a)) fail(l);
}
function State238(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 12/* ; */, 16/* ) */, 17/* @ */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //media_not=>not media_in_parenths •

        add_reduce(2, 90);
        stack_ptr -= 2;
        prod = 40;
        return;
    }
}
function State239(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 12/* ; */, 15/* ( */, 16/* ) */, 17/* @ */, 22/* and */, 28/* : */, 29/* < */, 30/* <= */, 32/* >= */, 33/* = */, 40/* > */, 41/* + */, 42/* ~ */, 43/* || */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 49/* ] */, 51/* ^= */, 52/* $= */, 53/* *= */, 54/* i */, 55/* s */, 58/* _ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */].includes(l.ty)) {
        //css_id_symbols=>css_id_symbols θid •

        add_reduce(2, 220);
        stack_ptr -= 2;
        prod = 103;
        return;
    }
}
function State240(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 12/* ; */, 15/* ( */, 16/* ) */, 17/* @ */, 22/* and */, 28/* : */, 29/* < */, 30/* <= */, 32/* >= */, 33/* = */, 40/* > */, 41/* + */, 42/* ~ */, 43/* || */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 49/* ] */, 51/* ^= */, 52/* $= */, 53/* *= */, 54/* i */, 55/* s */, 58/* _ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */].includes(l.ty)) {
        //css_id_symbols=>css_id_symbols _ •

        add_reduce(2, 221);
        stack_ptr -= 2;
        prod = 103;
        return;
    }
}
function State241(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 12/* ; */, 15/* ( */, 16/* ) */, 17/* @ */, 22/* and */, 28/* : */, 29/* < */, 30/* <= */, 32/* >= */, 33/* = */, 40/* > */, 41/* + */, 42/* ~ */, 43/* || */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 49/* ] */, 51/* ^= */, 52/* $= */, 53/* *= */, 54/* i */, 55/* s */, 58/* _ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */].includes(l.ty)) {
        //css_id_symbols=>css_id_symbols - •

        add_reduce(2, 222);
        stack_ptr -= 2;
        prod = 103;
        return;
    }
}
function State242(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 12/* ; */, 15/* ( */, 16/* ) */, 17/* @ */, 22/* and */, 28/* : */, 29/* < */, 30/* <= */, 32/* >= */, 33/* = */, 40/* > */, 41/* + */, 42/* ~ */, 43/* || */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 49/* ] */, 51/* ^= */, 52/* $= */, 53/* *= */, 54/* i */, 55/* s */, 58/* _ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */].includes(l.ty)) {
        //css_id_symbols=>css_id_symbols $ •

        add_reduce(2, 223);
        stack_ptr -= 2;
        prod = 103;
        return;
    }
}
function State243(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 12/* ; */, 15/* ( */, 16/* ) */, 17/* @ */, 22/* and */, 28/* : */, 29/* < */, 30/* <= */, 32/* >= */, 33/* = */, 40/* > */, 41/* + */, 42/* ~ */, 43/* || */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 49/* ] */, 51/* ^= */, 52/* $= */, 53/* *= */, 54/* i */, 55/* s */, 58/* _ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */].includes(l.ty)) {
        //css_id_symbols=>css_id_symbols θnum •

        add_reduce(2, 224);
        stack_ptr -= 2;
        prod = 103;
        return;
    }
}
const idm244: Map<number, (L: Lexer) => void> = new Map();
idm244.set(22/* and */, _35id0/* compressed */);
idm244.set(23/* or */, _35id1/* compressed */);
const _244id2 = (l: Lexer): void => {//supports_condition=>supports_in_parens supports_condition_HC_listbody2_113 •

    add_reduce(2, 61);
    stack_ptr -= 2;
    prod = 26;
    return;
};
idm244.set(16/* ) */, _244id2);
idm244.set(11/* { */, _244id2);
const tym244: Map<number, (L: Lexer) => void> = new Map();
tym244.set(0, _244id2/* compressed */);
function State244(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm244.has(l.id)) idm244.get(l.id)(l);
    else if (tym244.has(l.ty)) tym244.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 24:
                State281(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![26, 25].includes(a)) fail(l);
}
function State245(l: Lexer): void {
    prod = -1;
    if ([11/* { */, 16/* ) */].includes(l.id) || [0].includes(l.ty)) {
        //supports_condition=>not supports_in_parens •

        add_reduce(2, 60);
        stack_ptr -= 2;
        prod = 26;
        return;
    }
}
function State246(l: Lexer): void {
    prod = -1;
    if ([16/* ) */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State377(l); return;
        //

    }
}
function State247(l: Lexer): void {
    prod = -1;
    if ([16/* ) */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State380(l); return;
        //

    }
}
const idm248: Map<number, (L: Lexer) => void> = new Map();
idm248.set(15/* ( */, _25id0/* compressed */);
const _248id1 = (l: Lexer): void => {//mf_name=>identifier •

    stack_ptr -= 1;
    prod = 60;
    return;
};
idm248.set(28/* : */, _248id1);
idm248.set(29/* < */, _248id1);
idm248.set(30/* <= */, _248id1);
idm248.set(33/* = */, _248id1);
idm248.set(31/* > */, _248id1);
idm248.set(32/* >= */, _248id1);
function State248(l: Lexer): void {
    prod = -1;
    if (idm248.has(l.id)) idm248.get(l.id)(l);
}
const idm249: Map<number, (L: Lexer) => void> = new Map();
idm249.set(46/* # */, _0id2/* compressed */);
idm249.set(60/* $ */, _10id0/* compressed */);
idm249.set(44/* * */, _77id2/* compressed */);
idm249.set(59/* - */, _10id2/* compressed */);
idm249.set(47/* . */, _0id13/* compressed */);
idm249.set(28/* : */, _77id5/* compressed */);
idm249.set(48/* [ */, _0id20/* compressed */);
idm249.set(45/* | */, _0id43/* compressed */);
const tym249: Map<number, (L: Lexer) => void> = new Map();
tym249.set(3/* id */, _10ty0/* compressed */);
function State249(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm249.has(l.id)) idm249.get(l.id)(l);
    else if (tym249.has(l.ty)) tym249.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State87(l);
                continue;
            case 90:
                State100(l);
                continue;
            case 89:
                State81(l);
                continue;
            case 86:
                State93(l);
                continue;
            case 84:
                State94(l);
                continue;
            case 82:
                State92(l);
                continue;
            case 81:
                State91(l);
                continue;
            case 80:
                State90(l);
                continue;
            case 79:
                State84(l);
                continue;
            case 78:
                State85(l);
                continue;
            case 77:
                State88(l);
                continue;
            case 75:
                State80(l);
                continue;
            case 74:
                State83(l);
                continue;
            case 73:
                State99(l);
                continue;
            case 71:
                State82(l);
                continue;
            case 70:
                State406(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![30].includes(a)) fail(l);
}
function State250(l: Lexer): void {
    prod = -1;
    if ([16/* ) */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State378(l); return;
        //

    }
}
function State251(l: Lexer): void {
    prod = -1;
    if ([16/* ) */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State379(l); return;
        //

    }
}
const idm252: Map<number, (L: Lexer) => void> = new Map();
idm252.set(59/* - */, _162id0/* compressed */);
idm252.set(58/* _ */, _162id1/* compressed */);
const tym252: Map<number, (L: Lexer) => void> = new Map();
tym252.set(3/* id */, _162ty0/* compressed */);
tym252.set(2/* num */, _162ty1/* compressed */);
tym252.set(5/* sym */, _162ty2/* compressed */);
function State252(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm252.has(l.id)) idm252.get(l.id)(l);
    else if (tym252.has(l.ty)) tym252.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 107:
                State163(l);
                continue;
            case 105:
                State165(l);
                continue;
            case 101:
                State383(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![98].includes(a)) fail(l);
}
const idm253: Map<number, (L: Lexer) => void> = new Map();
idm253.set(60/* $ */, _10id0/* compressed */);
idm253.set(59/* - */, _10id2/* compressed */);
idm253.set(12/* ; */, _155id2/* compressed */);
const tym253: Map<number, (L: Lexer) => void> = new Map();
tym253.set(3/* id */, _10ty0/* compressed */);
function State253(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm253.has(l.id)) idm253.get(l.id)(l);
    else if (tym253.has(l.ty)) tym253.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 104:
                State45(l);
                continue;
            case 103:
                State161(l);
                continue;
            case 98:
                State160(l);
                continue;
            case 96:
                State159(l);
                continue;
            case 95:
                State384(l);
                continue;
            case 93:
                State385(l);
                continue;
            case 92:
                State157(l);
                continue;
            case 91:
                State158(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![20].includes(a)) fail(l);
}
const idm254: Map<number, (L: Lexer) => void> = new Map();
idm254.set(20/* from */, _0id28/* compressed */);
idm254.set(21/* to */, _0id40/* compressed */);
const tym254: Map<number, (L: Lexer) => void> = new Map();
tym254.set(2/* num */, _46ty0/* compressed */);
function State254(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm254.has(l.id)) idm254.get(l.id)(l);
    else if (tym254.has(l.ty)) tym254.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 63:
                State53(l);
                continue;
            case 21:
                State382(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![19].includes(a)) fail(l);
}
function State255(l: Lexer): void {
    prod = -1;
    if ([13/* } */, 20/* from */, 21/* to */].includes(l.id) || [0, 2/* num */].includes(l.ty)) {
        //keyframes_HC_listbody5_109=>keyframes_HC_listbody5_109 keyframes_blocks •

        add_reduce(2, 41);
        stack_ptr -= 2;
        prod = 16;
        return;
    }
}
const idm256: Map<number, (L: Lexer) => void> = new Map();
const _256id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State278(l);
    //
};
idm256.set(60/* $ */, _256id0);
const _256id1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State277(l);
    //
};
idm256.set(58/* _ */, _256id1);
const tym256: Map<number, (L: Lexer) => void> = new Map();
const _256ty0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State268(l);
    //
};
tym256.set(5/* bin */, _256ty0);
const _256ty1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State272(l);
    //
};
tym256.set(5/* flt */, _256ty1);
const _256ty2 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State267(l);
    //
};
tym256.set(5/* hex */, _256ty2);
const _256ty3 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State266(l);
    //
};
tym256.set(3/* id */, _256ty3);
const _256ty4 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State275(l);
    //
};
tym256.set(2/* num */, _256ty4);
const _256ty5 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State269(l);
    //
};
tym256.set(5/* oct */, _256ty5);
const _256ty6 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State270(l);
    //
};
tym256.set(5/* sci */, _256ty6);
function $def$defaultproductions_HC_listbody1_100(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm256.has(l.id)) idm256.get(l.id)(l);
    else if (tym256.has(l.ty)) tym256.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 131:
                State279(l);
                continue;
            case 130:
                State265(l);
                continue;
            case 129:
                State276(l);
                continue;
            case 128:
                State264(l);
                continue;
            case 120:
                State259(l);
                continue;
            case 119:
                State274(l);
                continue;
            case 118:
                State273(l);
                continue;
            case 117:
                State271(l);
                continue;
            case 116:
                State263(l);
                continue;
            case 115:
                State262(l);
                continue;
            case 114:
                State261(l);
                continue;
            case 113:
                State260(l);
                continue;
            case 111:
                State258(l);
                continue;
            case 109:
                State257(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![109].includes(a)) fail(l);
}
const idm257: Map<number, (L: Lexer) => void> = new Map();
idm257.set(60/* $ */, _256id0/* compressed */);
idm257.set(58/* _ */, _256id1/* compressed */);
const tym257: Map<number, (L: Lexer) => void> = new Map();
tym257.set(5/* bin */, _256ty0/* compressed */);
tym257.set(5/* flt */, _256ty1/* compressed */);
tym257.set(5/* hex */, _256ty2/* compressed */);
tym257.set(3/* id */, _256ty3/* compressed */);
tym257.set(2/* num */, _256ty4/* compressed */);
tym257.set(5/* oct */, _256ty5/* compressed */);
tym257.set(5/* sci */, _256ty6/* compressed */);
function State257(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm257.has(l.id)) idm257.get(l.id)(l);
    else if (tym257.has(l.ty)) tym257.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 131:
                State279(l);
                continue;
            case 130:
                State265(l);
                continue;
            case 129:
                State276(l);
                continue;
            case 128:
                State264(l);
                continue;
            case 120:
                State259(l);
                continue;
            case 119:
                State274(l);
                continue;
            case 118:
                State273(l);
                continue;
            case 117:
                State271(l);
                continue;
            case 116:
                State263(l);
                continue;
            case 115:
                State262(l);
                continue;
            case 114:
                State261(l);
                continue;
            case 113:
                State260(l);
                continue;
            case 111:
                State407(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![109].includes(a)) fail(l);
}
function State258(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 60/* $ */].includes(l.id) || [0, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$defaultproductions_HC_listbody1_100=>def$defaultproduction •

        add_reduce(1, 240);
        stack_ptr -= 1;
        prod = 109;
        return;
    }
}
function State259(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 60/* $ */].includes(l.id) || [0, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$defaultproduction=>def$id •

        stack_ptr -= 1;
        prod = 111;
        return;
    }
}
function State260(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 60/* $ */].includes(l.id) || [0, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$defaultproduction=>def$hex •

        stack_ptr -= 1;
        prod = 111;
        return;
    }
}
function State261(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 60/* $ */].includes(l.id) || [0, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$defaultproduction=>def$binary •

        stack_ptr -= 1;
        prod = 111;
        return;
    }
}
function State262(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 60/* $ */].includes(l.id) || [0, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$defaultproduction=>def$octal •

        stack_ptr -= 1;
        prod = 111;
        return;
    }
}
function State263(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 60/* $ */].includes(l.id) || [0, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$defaultproduction=>def$scientific •

        stack_ptr -= 1;
        prod = 111;
        return;
    }
}
function State264(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 60/* $ */].includes(l.id) || [0, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$defaultproduction=>def$js_identifier •

        stack_ptr -= 1;
        prod = 111;
        return;
    }
}
function State265(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 60/* $ */].includes(l.id) || [0, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$defaultproduction=>def$identifier •

        stack_ptr -= 1;
        prod = 111;
        return;
    }
}
const idm266: Map<number, (L: Lexer) => void> = new Map();
const _266id0 = (l: Lexer): void => {//def$js_id_symbols=>θid •  :  def$identifier_symbols=>θid •  :  def$id=>θid •

    stack_ptr -= 1;
    prod = 129;
    return;
    stack_ptr -= 1;
    prod = 131;
    return;
    stack_ptr -= 1;
    prod = 120;
    return;
};
idm266.set(60/* $ */, _266id0);
idm266.set(58/* _ */, _266id0);
const _266id1 = (l: Lexer): void => {//def$identifier_symbols=>θid •

    stack_ptr -= 1;
    prod = 131;
    return;
};
idm266.set(59/* - */, _266id1);
const tym266: Map<number, (L: Lexer) => void> = new Map();
tym266.set(0, _266id0/* compressed */);
tym266.set(5/* bin */, _266id0/* compressed */);
tym266.set(5/* flt */, _266id0/* compressed */);
tym266.set(5/* hex */, _266id0/* compressed */);
tym266.set(3/* id */, _266id0/* compressed */);
tym266.set(2/* num */, _266id0/* compressed */);
tym266.set(5/* oct */, _266id0/* compressed */);
tym266.set(5/* sci */, _266id0/* compressed */);
const _266ty1 = (l: Lexer): void => {//def$js_id_symbols=>θid •  :  def$identifier_symbols=>θid •

    stack_ptr -= 1;
    prod = 129;
    return;
    stack_ptr -= 1;
    prod = 131;
    return;
};
tym266.set(5/* keyword */, _266ty1);
tym266.set(1/* ws */, _266ty1);
function State266(l: Lexer): void {
    prod = -1;
    if (idm266.has(l.id)) idm266.get(l.id)(l);
    else if (tym266.has(l.ty)) tym266.get(l.ty)(l);
}
function State267(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 60/* $ */].includes(l.id) || [0, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$hex=>θhex •

        add_reduce(1, 263);
        stack_ptr -= 1;
        prod = 113;
        return;
    }
}
function State268(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 60/* $ */].includes(l.id) || [0, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$binary=>θbin •

        add_reduce(1, 264);
        stack_ptr -= 1;
        prod = 114;
        return;
    }
}
function State269(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 60/* $ */].includes(l.id) || [0, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$octal=>θoct •

        add_reduce(1, 265);
        stack_ptr -= 1;
        prod = 115;
        return;
    }
}
function State270(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 60/* $ */].includes(l.id) || [0, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$scientific=>θsci •

        add_reduce(1, 266);
        stack_ptr -= 1;
        prod = 116;
        return;
    }
}
function State271(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 60/* $ */].includes(l.id) || [0, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$scientific=>def$float •

        stack_ptr -= 1;
        prod = 116;
        return;
    }
}
function State272(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 60/* $ */].includes(l.id) || [0, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$float=>θflt •

        add_reduce(1, 268);
        stack_ptr -= 1;
        prod = 117;
        return;
    }
}
function State273(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 60/* $ */].includes(l.id) || [0, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$float=>def$integer •

        stack_ptr -= 1;
        prod = 117;
        return;
    }
}
function State274(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 60/* $ */].includes(l.id) || [0, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$integer=>def$natural •

        add_reduce(1, 270);
        stack_ptr -= 1;
        prod = 118;
        return;
    }
}
function State275(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 60/* $ */].includes(l.id) || [0, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$natural=>θnum •

        stack_ptr -= 1;
        prod = 119;
        return;
    }
}
const idm276: Map<number, (L: Lexer) => void> = new Map();
const _276id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State389(l); return;
    if (prod >= 0) return; else FAILED = false;
    //def$js_identifier=>def$js_id_symbols •

    stack_ptr -= 1;
    prod = 128;
    return;
};
idm276.set(60/* $ */, _276id0);
const _276id1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State388(l); return;
    if (prod >= 0) return; else FAILED = false;
    //def$js_identifier=>def$js_id_symbols •

    stack_ptr -= 1;
    prod = 128;
    return;
};
idm276.set(58/* _ */, _276id1);
const tym276: Map<number, (L: Lexer) => void> = new Map();
const _276ty0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State392(l); return;
    if (prod >= 0) return; else FAILED = false;
    //def$js_identifier=>def$js_id_symbols •

    stack_ptr -= 1;
    prod = 128;
    return;
};
tym276.set(5/* bin */, _276ty0);
const _276ty1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State391(l); return;
    if (prod >= 0) return; else FAILED = false;
    //def$js_identifier=>def$js_id_symbols •

    stack_ptr -= 1;
    prod = 128;
    return;
};
tym276.set(5/* hex */, _276ty1);
const _276ty2 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State386(l); return;
    if (prod >= 0) return; else FAILED = false;
    //def$js_identifier=>def$js_id_symbols •

    stack_ptr -= 1;
    prod = 128;
    return;
};
tym276.set(3/* id */, _276ty2);
const _276ty3 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State387(l); return;
    //
};
tym276.set(5/* keyword */, _276ty3);
const _276ty4 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State390(l); return;
    if (prod >= 0) return; else FAILED = false;
    //def$js_identifier=>def$js_id_symbols •

    stack_ptr -= 1;
    prod = 128;
    return;
};
tym276.set(2/* num */, _276ty4);
const _276ty5 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State393(l); return;
    if (prod >= 0) return; else FAILED = false;
    //def$js_identifier=>def$js_id_symbols •

    stack_ptr -= 1;
    prod = 128;
    return;
};
tym276.set(5/* oct */, _276ty5);
const _276ty6 = (l: Lexer): void => {//def$js_identifier=>def$js_id_symbols •

    stack_ptr -= 1;
    prod = 128;
    return;
};
tym276.set(0, _276ty6);
tym276.set(5/* flt */, _276ty6);
tym276.set(5/* sci */, _276ty6);
tym276.set(1/* ws */, _276ty6);
function State276(l: Lexer): void {
    prod = -1;
    if (idm276.has(l.id)) idm276.get(l.id)(l);
    else if (tym276.has(l.ty)) tym276.get(l.ty)(l);
}
const idm277: Map<number, (L: Lexer) => void> = new Map();
const _277id0 = (l: Lexer): void => {//def$js_id_symbols=>_ •  :  def$identifier_symbols=>_ •

    stack_ptr -= 1;
    prod = 129;
    return;
    stack_ptr -= 1;
    prod = 131;
    return;
};
idm277.set(60/* $ */, _277id0);
idm277.set(58/* _ */, _277id0);
const _277id1 = (l: Lexer): void => {//def$identifier_symbols=>_ •

    stack_ptr -= 1;
    prod = 131;
    return;
};
idm277.set(59/* - */, _277id1);
const tym277: Map<number, (L: Lexer) => void> = new Map();
tym277.set(0, _277id0/* compressed */);
tym277.set(5/* bin */, _277id0/* compressed */);
tym277.set(5/* flt */, _277id0/* compressed */);
tym277.set(5/* hex */, _277id0/* compressed */);
tym277.set(3/* id */, _277id0/* compressed */);
tym277.set(5/* keyword */, _277id0/* compressed */);
tym277.set(2/* num */, _277id0/* compressed */);
tym277.set(5/* oct */, _277id0/* compressed */);
tym277.set(5/* sci */, _277id0/* compressed */);
tym277.set(1/* ws */, _277id0/* compressed */);
function State277(l: Lexer): void {
    prod = -1;
    if (idm277.has(l.id)) idm277.get(l.id)(l);
    else if (tym277.has(l.ty)) tym277.get(l.ty)(l);
}
const idm278: Map<number, (L: Lexer) => void> = new Map();
const _278id0 = (l: Lexer): void => {//def$js_id_symbols=>$ •  :  def$identifier_symbols=>$ •

    stack_ptr -= 1;
    prod = 129;
    return;
    stack_ptr -= 1;
    prod = 131;
    return;
};
idm278.set(60/* $ */, _278id0);
idm278.set(58/* _ */, _278id0);
const _278id1 = (l: Lexer): void => {//def$identifier_symbols=>$ •

    stack_ptr -= 1;
    prod = 131;
    return;
};
idm278.set(59/* - */, _278id1);
const tym278: Map<number, (L: Lexer) => void> = new Map();
tym278.set(0, _278id0/* compressed */);
tym278.set(5/* bin */, _278id0/* compressed */);
tym278.set(5/* flt */, _278id0/* compressed */);
tym278.set(5/* hex */, _278id0/* compressed */);
tym278.set(3/* id */, _278id0/* compressed */);
tym278.set(5/* keyword */, _278id0/* compressed */);
tym278.set(2/* num */, _278id0/* compressed */);
tym278.set(5/* oct */, _278id0/* compressed */);
tym278.set(5/* sci */, _278id0/* compressed */);
tym278.set(1/* ws */, _278id0/* compressed */);
function State278(l: Lexer): void {
    prod = -1;
    if (idm278.has(l.id)) idm278.get(l.id)(l);
    else if (tym278.has(l.ty)) tym278.get(l.ty)(l);
}
const idm279: Map<number, (L: Lexer) => void> = new Map();
const _279id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State399(l); return;
    if (prod >= 0) return; else FAILED = false;
    //def$identifier=>def$identifier_symbols •

    stack_ptr -= 1;
    prod = 130;
    return;
};
idm279.set(60/* $ */, _279id0);
const _279id1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State398(l); return;
    //
};
idm279.set(59/* - */, _279id1);
const _279id2 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State397(l); return;
    if (prod >= 0) return; else FAILED = false;
    //def$identifier=>def$identifier_symbols •

    stack_ptr -= 1;
    prod = 130;
    return;
};
idm279.set(58/* _ */, _279id2);
const tym279: Map<number, (L: Lexer) => void> = new Map();
const _279ty0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State402(l); return;
    if (prod >= 0) return; else FAILED = false;
    //def$identifier=>def$identifier_symbols •

    stack_ptr -= 1;
    prod = 130;
    return;
};
tym279.set(5/* bin */, _279ty0);
const _279ty1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State401(l); return;
    if (prod >= 0) return; else FAILED = false;
    //def$identifier=>def$identifier_symbols •

    stack_ptr -= 1;
    prod = 130;
    return;
};
tym279.set(5/* hex */, _279ty1);
const _279ty2 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State395(l); return;
    if (prod >= 0) return; else FAILED = false;
    //def$identifier=>def$identifier_symbols •

    stack_ptr -= 1;
    prod = 130;
    return;
};
tym279.set(3/* id */, _279ty2);
const _279ty3 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State396(l); return;
    //
};
tym279.set(5/* keyword */, _279ty3);
const _279ty4 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State400(l); return;
    if (prod >= 0) return; else FAILED = false;
    //def$identifier=>def$identifier_symbols •

    stack_ptr -= 1;
    prod = 130;
    return;
};
tym279.set(2/* num */, _279ty4);
const _279ty5 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State403(l); return;
    if (prod >= 0) return; else FAILED = false;
    //def$identifier=>def$identifier_symbols •

    stack_ptr -= 1;
    prod = 130;
    return;
};
tym279.set(5/* oct */, _279ty5);
const _279ty6 = (l: Lexer): void => {//def$identifier=>def$identifier_symbols •

    stack_ptr -= 1;
    prod = 130;
    return;
};
tym279.set(0, _279ty6);
tym279.set(5/* flt */, _279ty6);
tym279.set(5/* sci */, _279ty6);
tym279.set(1/* ws */, _279ty6);
function State279(l: Lexer): void {
    prod = -1;
    if (idm279.has(l.id)) idm279.get(l.id)(l);
    else if (tym279.has(l.ty)) tym279.get(l.ty)(l);
}
function State280(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */].includes(l.id) || [0].includes(l.ty)) {
        //percentage=>θnum % •

        add_reduce(2, 135);
        stack_ptr -= 2;
        prod = 63;
        return;
    }
}
function State281(l: Lexer): void {
    prod = -1;
    if ([11/* { */, 16/* ) */, 22/* and */, 23/* or */].includes(l.id) || [0].includes(l.ty)) {
        //supports_condition_HC_listbody2_113=>supports_condition_HC_listbody2_113 supports_condition_group_129_112 •

        add_reduce(2, 58);
        stack_ptr -= 2;
        prod = 25;
        return;
    }
}
function State282(l: Lexer): void {
    prod = -1;
    if ([11/* { */, 16/* ) */, 22/* and */, 23/* or */].includes(l.id) || [0].includes(l.ty)) {
        //supports_condition_group_129_112=>and supports_in_parens •

        add_reduce(2, 56);
        stack_ptr -= 2;
        prod = 24;
        return;
    }
}
function State283(l: Lexer): void {
    prod = -1;
    if ([11/* { */, 16/* ) */, 22/* and */, 23/* or */].includes(l.id) || [0].includes(l.ty)) {
        //supports_condition_group_129_112=>or supports_in_parens •

        add_reduce(2, 57);
        stack_ptr -= 2;
        prod = 24;
        return;
    }
}
const idm284: Map<number, (L: Lexer) => void> = new Map();
const _284id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State287(l);
    //
};
idm284.set(60/* $ */, _284id0);
const _284id1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State286(l);
    //
};
idm284.set(58/* _ */, _284id1);
const tym284: Map<number, (L: Lexer) => void> = new Map();
const _284ty0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State288(l);
    //
};
tym284.set(3/* id */, _284ty0);
function $def$js_id_symbols(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm284.has(l.id)) idm284.get(l.id)(l);
    else if (tym284.has(l.ty)) tym284.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 129:
                State285(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![129].includes(a)) fail(l);
}
const idm285: Map<number, (L: Lexer) => void> = new Map();
const _285id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State389(l); return;
    //
};
idm285.set(60/* $ */, _285id0);
const _285id1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State388(l); return;
    //
};
idm285.set(58/* _ */, _285id1);
const tym285: Map<number, (L: Lexer) => void> = new Map();
const _285ty0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State392(l); return;
    //
};
tym285.set(5/* bin */, _285ty0);
const _285ty1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State391(l); return;
    //
};
tym285.set(5/* hex */, _285ty1);
const _285ty2 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State386(l); return;
    //
};
tym285.set(3/* id */, _285ty2);
tym285.set(5/* keyword */, _276ty3/* compressed */);
const _285ty4 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State390(l); return;
    //
};
tym285.set(2/* num */, _285ty4);
const _285ty5 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State393(l); return;
    //
};
tym285.set(5/* oct */, _285ty5);
function State285(l: Lexer): void {
    prod = -1;
    if (idm285.has(l.id)) idm285.get(l.id)(l);
    else if (tym285.has(l.ty)) tym285.get(l.ty)(l);
}
function State286(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 60/* $ */].includes(l.id) || [0, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* keyword */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$js_id_symbols=>_ •

        stack_ptr -= 1;
        prod = 129;
        return;
    }
}
function State287(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 60/* $ */].includes(l.id) || [0, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* keyword */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$js_id_symbols=>$ •

        stack_ptr -= 1;
        prod = 129;
        return;
    }
}
function State288(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 60/* $ */].includes(l.id) || [0, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* keyword */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$js_id_symbols=>θid •

        stack_ptr -= 1;
        prod = 129;
        return;
    }
}
const idm289: Map<number, (L: Lexer) => void> = new Map();
idm289.set(60/* $ */, _10id0/* compressed */);
idm289.set(15/* ( */, _10id1/* compressed */);
idm289.set(59/* - */, _10id2/* compressed */);
idm289.set(24/* not */, _10id3/* compressed */);
idm289.set(27/* only */, _0id35/* compressed */);
const tym289: Map<number, (L: Lexer) => void> = new Map();
tym289.set(3/* id */, _10ty0/* compressed */);
function State289(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm289.has(l.id)) idm289.get(l.id)(l);
    else if (tym289.has(l.ty)) tym289.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State25(l);
                continue;
            case 61:
                State15(l);
                continue;
            case 52:
                State24(l);
                continue;
            case 49:
                State23(l);
                continue;
            case 47:
                State20(l);
                continue;
            case 46:
                State17(l);
                continue;
            case 43:
                State19(l);
                continue;
            case 40:
                State18(l);
                continue;
            case 39:
                State16(l);
                continue;
            case 38:
                State13(l);
                continue;
            case 37:
                State404(l);
                continue;
            case 35:
                State14(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![32].includes(a)) fail(l);
}
const idm290: Map<number, (L: Lexer) => void> = new Map();
idm290.set(60/* $ */, _10id0/* compressed */);
idm290.set(15/* ( */, _10id1/* compressed */);
idm290.set(59/* - */, _10id2/* compressed */);
idm290.set(24/* not */, _10id3/* compressed */);
idm290.set(27/* only */, _0id35/* compressed */);
const tym290: Map<number, (L: Lexer) => void> = new Map();
tym290.set(3/* id */, _10ty0/* compressed */);
function State290(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm290.has(l.id)) idm290.get(l.id)(l);
    else if (tym290.has(l.ty)) tym290.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State25(l);
                continue;
            case 61:
                State15(l);
                continue;
            case 52:
                State24(l);
                continue;
            case 49:
                State23(l);
                continue;
            case 47:
                State20(l);
                continue;
            case 46:
                State17(l);
                continue;
            case 43:
                State19(l);
                continue;
            case 40:
                State18(l);
                continue;
            case 39:
                State16(l);
                continue;
            case 38:
                State13(l);
                continue;
            case 37:
                State405(l);
                continue;
            case 35:
                State14(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![33].includes(a)) fail(l);
}
const idm291: Map<number, (L: Lexer) => void> = new Map();
idm291.set(60/* $ */, _256id0/* compressed */);
idm291.set(58/* _ */, _256id1/* compressed */);
const tym291: Map<number, (L: Lexer) => void> = new Map();
tym291.set(5/* bin */, _256ty0/* compressed */);
tym291.set(5/* flt */, _256ty1/* compressed */);
tym291.set(5/* hex */, _256ty2/* compressed */);
tym291.set(3/* id */, _256ty3/* compressed */);
tym291.set(2/* num */, _256ty4/* compressed */);
tym291.set(5/* oct */, _256ty5/* compressed */);
tym291.set(5/* sci */, _256ty6/* compressed */);
function $def$defaultproductions(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm291.has(l.id)) idm291.get(l.id)(l);
    else if (tym291.has(l.ty)) tym291.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 131:
                State279(l);
                continue;
            case 130:
                State265(l);
                continue;
            case 129:
                State276(l);
                continue;
            case 128:
                State264(l);
                continue;
            case 120:
                State259(l);
                continue;
            case 119:
                State274(l);
                continue;
            case 118:
                State273(l);
                continue;
            case 117:
                State271(l);
                continue;
            case 116:
                State263(l);
                continue;
            case 115:
                State262(l);
                continue;
            case 114:
                State261(l);
                continue;
            case 113:
                State260(l);
                continue;
            case 111:
                State293(l);
                continue;
            case 110:
                State292(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![110].includes(a)) fail(l);
}
const idm292: Map<number, (L: Lexer) => void> = new Map();
idm292.set(60/* $ */, _256id0/* compressed */);
idm292.set(58/* _ */, _256id1/* compressed */);
const tym292: Map<number, (L: Lexer) => void> = new Map();
tym292.set(5/* bin */, _256ty0/* compressed */);
tym292.set(5/* flt */, _256ty1/* compressed */);
tym292.set(5/* hex */, _256ty2/* compressed */);
tym292.set(3/* id */, _256ty3/* compressed */);
tym292.set(2/* num */, _256ty4/* compressed */);
tym292.set(5/* oct */, _256ty5/* compressed */);
tym292.set(5/* sci */, _256ty6/* compressed */);
function State292(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm292.has(l.id)) idm292.get(l.id)(l);
    else if (tym292.has(l.ty)) tym292.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 131:
                State279(l);
                continue;
            case 130:
                State265(l);
                continue;
            case 129:
                State276(l);
                continue;
            case 128:
                State264(l);
                continue;
            case 120:
                State259(l);
                continue;
            case 119:
                State274(l);
                continue;
            case 118:
                State273(l);
                continue;
            case 117:
                State271(l);
                continue;
            case 116:
                State263(l);
                continue;
            case 115:
                State262(l);
                continue;
            case 114:
                State261(l);
                continue;
            case 113:
                State260(l);
                continue;
            case 111:
                State422(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![110].includes(a)) fail(l);
}
function State293(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 60/* $ */].includes(l.id) || [0, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$defaultproductions=>def$defaultproduction •

        add_reduce(1, 242);
        stack_ptr -= 1;
        prod = 110;
        return;
    }
}
function State294(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 12/* ; */, 16/* ) */, 17/* @ */, 22/* and */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //media_and_HC_listbody2_119=>media_and_HC_listbody2_119 media_and_group_152_118 •

        add_reduce(2, 92);
        stack_ptr -= 2;
        prod = 42;
        return;
    }
}
const idm295: Map<number, (L: Lexer) => void> = new Map();
idm295.set(46/* # */, _0id2/* compressed */);
idm295.set(60/* $ */, _10id0/* compressed */);
idm295.set(44/* * */, _77id2/* compressed */);
idm295.set(59/* - */, _10id2/* compressed */);
idm295.set(47/* . */, _0id13/* compressed */);
idm295.set(28/* : */, _77id5/* compressed */);
idm295.set(48/* [ */, _0id20/* compressed */);
idm295.set(45/* | */, _0id43/* compressed */);
const tym295: Map<number, (L: Lexer) => void> = new Map();
tym295.set(3/* id */, _10ty0/* compressed */);
function State295(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm295.has(l.id)) idm295.get(l.id)(l);
    else if (tym295.has(l.ty)) tym295.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State87(l);
                continue;
            case 90:
                State100(l);
                continue;
            case 89:
                State81(l);
                continue;
            case 86:
                State93(l);
                continue;
            case 84:
                State94(l);
                continue;
            case 82:
                State92(l);
                continue;
            case 81:
                State91(l);
                continue;
            case 80:
                State90(l);
                continue;
            case 79:
                State84(l);
                continue;
            case 78:
                State85(l);
                continue;
            case 77:
                State88(l);
                continue;
            case 75:
                State80(l);
                continue;
            case 74:
                State83(l);
                continue;
            case 73:
                State99(l);
                continue;
            case 71:
                State82(l);
                continue;
            case 70:
                State427(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![5].includes(a)) fail(l);
}
function State296(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 12/* ; */, 16/* ) */, 17/* @ */, 22/* and */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //media_and_group_152_118=>and media_in_parenths •

        add_reduce(2, 91);
        stack_ptr -= 2;
        prod = 41;
        return;
    }
}
function State297(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 16/* ) */, 28/* : */, 40/* > */, 41/* + */, 42/* ~ */, 43/* || */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //COMPOUND_SELECTOR_HC_listbody2_134=>COMPOUND_SELECTOR_HC_listbody2_134 COMPOUND_SELECTOR_group_1105_133 •

        add_reduce(2, 152);
        stack_ptr -= 2;
        prod = 74;
        return;
    }
}
const idm298: Map<number, (L: Lexer) => void> = new Map();
const _298id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State138(l);
    if (prod >= 0) return; else FAILED = false;
    //COMPOUND_SELECTOR=>COMPOUND_SELECTOR_HC_listbody1_131 COMPOUND_SELECTOR_HC_listbody2_134 •

    add_reduce(2, 155);
    stack_ptr -= 2;
    prod = 75;
    return;
};
idm298.set(28/* : */, _298id0);
const _298id1 = (l: Lexer): void => {//COMPOUND_SELECTOR=>COMPOUND_SELECTOR_HC_listbody1_131 COMPOUND_SELECTOR_HC_listbody2_134 •

    add_reduce(2, 155);
    stack_ptr -= 2;
    prod = 75;
    return;
};
idm298.set(46/* # */, _298id1);
idm298.set(60/* $ */, _298id1);
idm298.set(16/* ) */, _298id1);
idm298.set(44/* * */, _298id1);
idm298.set(41/* + */, _298id1);
idm298.set(10/* , */, _298id1);
idm298.set(59/* - */, _298id1);
idm298.set(47/* . */, _298id1);
idm298.set(40/* > */, _298id1);
idm298.set(48/* [ */, _298id1);
idm298.set(11/* { */, _298id1);
idm298.set(45/* | */, _298id1);
idm298.set(43/* || */, _298id1);
idm298.set(42/* ~ */, _298id1);
const tym298: Map<number, (L: Lexer) => void> = new Map();
tym298.set(0, _298id1/* compressed */);
tym298.set(3/* id */, _298id1/* compressed */);
function State298(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm298.has(l.id)) idm298.get(l.id)(l);
    else if (tym298.has(l.ty)) tym298.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 90:
                State100(l);
                continue;
            case 73:
                State297(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![75, 74].includes(a)) fail(l);
}
function State299(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 16/* ) */, 28/* : */, 40/* > */, 41/* + */, 42/* ~ */, 43/* || */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //COMPOUND_SELECTOR_HC_listbody1_131=>COMPOUND_SELECTOR_HC_listbody1_131 SUBCLASS_SELECTOR •

        add_reduce(2, 146);
        stack_ptr -= 2;
        prod = 71;
        return;
    }
}
const idm300: Map<number, (L: Lexer) => void> = new Map();
const _300id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State95(l);
    if (prod >= 0) return; else FAILED = false;
    //COMPOUND_SELECTOR=>TYPE_SELECTOR COMPOUND_SELECTOR_HC_listbody1_131 •

    add_reduce(2, 157);
    stack_ptr -= 2;
    prod = 75;
    return;
};
idm300.set(46/* # */, _300id0);
const _300id1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State96(l);
    if (prod >= 0) return; else FAILED = false;
    //COMPOUND_SELECTOR=>TYPE_SELECTOR COMPOUND_SELECTOR_HC_listbody1_131 •

    add_reduce(2, 157);
    stack_ptr -= 2;
    prod = 75;
    return;
};
idm300.set(47/* . */, _300id1);
const _300id2 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State98(l);
    if (prod >= 0) return; else FAILED = false;
    //COMPOUND_SELECTOR=>TYPE_SELECTOR COMPOUND_SELECTOR_HC_listbody1_131 •

    add_reduce(2, 157);
    stack_ptr -= 2;
    prod = 75;
    return;
};
idm300.set(28/* : */, _300id2);
const _300id3 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State97(l);
    if (prod >= 0) return; else FAILED = false;
    //COMPOUND_SELECTOR=>TYPE_SELECTOR COMPOUND_SELECTOR_HC_listbody1_131 •

    add_reduce(2, 157);
    stack_ptr -= 2;
    prod = 75;
    return;
};
idm300.set(48/* [ */, _300id3);
const _300id4 = (l: Lexer): void => {//COMPOUND_SELECTOR=>TYPE_SELECTOR COMPOUND_SELECTOR_HC_listbody1_131 •

    add_reduce(2, 157);
    stack_ptr -= 2;
    prod = 75;
    return;
};
idm300.set(60/* $ */, _300id4);
idm300.set(16/* ) */, _300id4);
idm300.set(44/* * */, _300id4);
idm300.set(41/* + */, _300id4);
idm300.set(10/* , */, _300id4);
idm300.set(59/* - */, _300id4);
idm300.set(40/* > */, _300id4);
idm300.set(11/* { */, _300id4);
idm300.set(45/* | */, _300id4);
idm300.set(43/* || */, _300id4);
idm300.set(42/* ~ */, _300id4);
const tym300: Map<number, (L: Lexer) => void> = new Map();
tym300.set(0, _300id4/* compressed */);
tym300.set(3/* id */, _300id4/* compressed */);
function State300(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm300.has(l.id)) idm300.get(l.id)(l);
    else if (tym300.has(l.ty)) tym300.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 90:
                State100(l);
                continue;
            case 86:
                State93(l);
                continue;
            case 84:
                State94(l);
                continue;
            case 82:
                State92(l);
                continue;
            case 81:
                State91(l);
                continue;
            case 80:
                State299(l);
                continue;
            case 74:
                State408(l);
                continue;
            case 73:
                State99(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![75, 71].includes(a)) fail(l);
}
const idm301: Map<number, (L: Lexer) => void> = new Map();
const _301id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State138(l);
    if (prod >= 0) return; else FAILED = false;
    //COMPOUND_SELECTOR=>TYPE_SELECTOR COMPOUND_SELECTOR_HC_listbody2_134 •

    add_reduce(2, 156);
    stack_ptr -= 2;
    prod = 75;
    return;
};
idm301.set(28/* : */, _301id0);
const _301id1 = (l: Lexer): void => {//COMPOUND_SELECTOR=>TYPE_SELECTOR COMPOUND_SELECTOR_HC_listbody2_134 •

    add_reduce(2, 156);
    stack_ptr -= 2;
    prod = 75;
    return;
};
idm301.set(46/* # */, _301id1);
idm301.set(60/* $ */, _301id1);
idm301.set(16/* ) */, _301id1);
idm301.set(44/* * */, _301id1);
idm301.set(41/* + */, _301id1);
idm301.set(10/* , */, _301id1);
idm301.set(59/* - */, _301id1);
idm301.set(47/* . */, _301id1);
idm301.set(40/* > */, _301id1);
idm301.set(48/* [ */, _301id1);
idm301.set(11/* { */, _301id1);
idm301.set(45/* | */, _301id1);
idm301.set(43/* || */, _301id1);
idm301.set(42/* ~ */, _301id1);
const tym301: Map<number, (L: Lexer) => void> = new Map();
tym301.set(0, _301id1/* compressed */);
tym301.set(3/* id */, _301id1/* compressed */);
function State301(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm301.has(l.id)) idm301.get(l.id)(l);
    else if (tym301.has(l.ty)) tym301.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 90:
                State100(l);
                continue;
            case 73:
                State297(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![75, 74].includes(a)) fail(l);
}
function State302(l: Lexer): void {
    prod = -1;
    if ([44/* * */, 59/* - */, 60/* $ */].includes(l.id) || [3/* id */].includes(l.ty)) {
        //NS_PREFIX=>NS_PREFIX_group_0112_135 | •

        add_reduce(2, 167);
        stack_ptr -= 2;
        prod = 78;
        return;
    }
}
function State303(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 16/* ) */, 28/* : */, 40/* > */, 41/* + */, 42/* ~ */, 43/* || */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //TYPE_SELECTOR=>NS_PREFIX * •

        add_reduce(2, 193);
        stack_ptr -= 2;
        prod = 89;
        return;
    }
}
function State304(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 16/* ) */, 28/* : */, 33/* = */, 40/* > */, 41/* + */, 42/* ~ */, 43/* || */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 49/* ] */, 51/* ^= */, 52/* $= */, 53/* *= */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //WQ_NAME=>NS_PREFIX identifier •

        add_reduce(2, 169);
        stack_ptr -= 2;
        prod = 79;
        return;
    }
}
function State305(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 16/* ) */, 28/* : */, 40/* > */, 41/* + */, 42/* ~ */, 43/* || */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //CLASS_SELECTOR=>. identifier •

        add_reduce(2, 176);
        stack_ptr -= 2;
        prod = 82;
        return;
    }
}
const idm306: Map<number, (L: Lexer) => void> = new Map();
const _306id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State127(l);
    if (prod >= 0) return; else FAILED = false;
    //COMPOUND_SELECTOR_group_1105_133=>PSEUDO_ELEMENT_SELECTOR COMPOUND_SELECTOR_HC_listbody1_132 •

    add_reduce(2, 150);
    stack_ptr -= 2;
    prod = 73;
    return;
};
idm306.set(28/* : */, _306id0);
const _306id1 = (l: Lexer): void => {//COMPOUND_SELECTOR_group_1105_133=>PSEUDO_ELEMENT_SELECTOR COMPOUND_SELECTOR_HC_listbody1_132 •

    add_reduce(2, 150);
    stack_ptr -= 2;
    prod = 73;
    return;
};
idm306.set(46/* # */, _306id1);
idm306.set(60/* $ */, _306id1);
idm306.set(16/* ) */, _306id1);
idm306.set(44/* * */, _306id1);
idm306.set(41/* + */, _306id1);
idm306.set(10/* , */, _306id1);
idm306.set(59/* - */, _306id1);
idm306.set(47/* . */, _306id1);
idm306.set(40/* > */, _306id1);
idm306.set(48/* [ */, _306id1);
idm306.set(11/* { */, _306id1);
idm306.set(45/* | */, _306id1);
idm306.set(43/* || */, _306id1);
idm306.set(42/* ~ */, _306id1);
const tym306: Map<number, (L: Lexer) => void> = new Map();
tym306.set(0, _306id1/* compressed */);
tym306.set(3/* id */, _306id1/* compressed */);
function State306(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm306.has(l.id)) idm306.get(l.id)(l);
    else if (tym306.has(l.ty)) tym306.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 84:
                State338(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![73, 72].includes(a)) fail(l);
}
const idm307: Map<number, (L: Lexer) => void> = new Map();
idm307.set(46/* # */, _0id2/* compressed */);
idm307.set(60/* $ */, _10id0/* compressed */);
idm307.set(44/* * */, _77id2/* compressed */);
idm307.set(41/* + */, _0id10/* compressed */);
idm307.set(59/* - */, _10id2/* compressed */);
idm307.set(47/* . */, _0id13/* compressed */);
idm307.set(28/* : */, _77id5/* compressed */);
idm307.set(40/* > */, _0id18/* compressed */);
idm307.set(48/* [ */, _0id20/* compressed */);
idm307.set(45/* | */, _0id43/* compressed */);
idm307.set(43/* || */, _0id44/* compressed */);
idm307.set(42/* ~ */, _80id11/* compressed */);
const _307id12 = (l: Lexer): void => {//COMPLEX_SELECTOR=>COMPOUND_SELECTOR COMPLEX_SELECTOR_HC_listbody2_130 •

    add_reduce(2, 144);
    stack_ptr -= 2;
    prod = 70;
    return;
};
idm307.set(16/* ) */, _307id12);
idm307.set(10/* , */, _307id12);
idm307.set(11/* { */, _307id12);
const tym307: Map<number, (L: Lexer) => void> = new Map();
tym307.set(3/* id */, _10ty0/* compressed */);
tym307.set(0, _307id12/* compressed */);
function State307(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm307.has(l.id)) idm307.get(l.id)(l);
    else if (tym307.has(l.ty)) tym307.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State87(l);
                continue;
            case 90:
                State100(l);
                continue;
            case 89:
                State81(l);
                continue;
            case 86:
                State93(l);
                continue;
            case 84:
                State94(l);
                continue;
            case 82:
                State92(l);
                continue;
            case 81:
                State91(l);
                continue;
            case 80:
                State90(l);
                continue;
            case 79:
                State84(l);
                continue;
            case 78:
                State85(l);
                continue;
            case 77:
                State88(l);
                continue;
            case 76:
                State192(l);
                continue;
            case 75:
                State191(l);
                continue;
            case 74:
                State83(l);
                continue;
            case 73:
                State99(l);
                continue;
            case 71:
                State82(l);
                continue;
            case 68:
                State358(l);
                continue;
            case 67:
                State190(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![70, 69].includes(a)) fail(l);
}
function State308(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 16/* ) */, 28/* : */, 40/* > */, 41/* + */, 42/* ~ */, 43/* || */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //ID_SELECTOR=># identifier •

        add_reduce(2, 175);
        stack_ptr -= 2;
        prod = 81;
        return;
    }
}
const idm309: Map<number, (L: Lexer) => void> = new Map();
idm309.set(60/* $ */, _10id0/* compressed */);
idm309.set(59/* - */, _10id2/* compressed */);
const _309id2 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State412(l);
    //
};
idm309.set(12/* ; */, _309id2);
const _309id3 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State413(l);
    //
};
idm309.set(13/* } */, _309id3);
const tym309: Map<number, (L: Lexer) => void> = new Map();
tym309.set(3/* id */, _10ty0/* compressed */);
function State309(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm309.has(l.id)) idm309.get(l.id)(l);
    else if (tym309.has(l.ty)) tym309.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 104:
                State45(l);
                continue;
            case 103:
                State161(l);
                continue;
            case 98:
                State160(l);
                continue;
            case 96:
                State159(l);
                continue;
            case 95:
                State411(l);
                continue;
            case 93:
                State385(l);
                continue;
            case 92:
                State157(l);
                continue;
            case 91:
                State158(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![6].includes(a)) fail(l);
}
function State310(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 12/* ; */, 16/* ) */, 17/* @ */, 23/* or */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //media_or_HC_listbody2_121=>media_or_HC_listbody2_121 media_or_group_154_120 •

        add_reduce(2, 96);
        stack_ptr -= 2;
        prod = 45;
        return;
    }
}
const idm311: Map<number, (L: Lexer) => void> = new Map();
const _311id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State410(l);
    //
};
idm311.set(15/* ( */, _311id0);
const _311id1 = (l: Lexer): void => {//PSEUDO_CLASS_SELECTOR=>: identifier •

    add_reduce(2, 179);
    stack_ptr -= 2;
    prod = 84;
    return;
};
idm311.set(46/* # */, _311id1);
idm311.set(60/* $ */, _311id1);
idm311.set(16/* ) */, _311id1);
idm311.set(44/* * */, _311id1);
idm311.set(41/* + */, _311id1);
idm311.set(10/* , */, _311id1);
idm311.set(59/* - */, _311id1);
idm311.set(47/* . */, _311id1);
idm311.set(28/* : */, _311id1);
idm311.set(40/* > */, _311id1);
idm311.set(48/* [ */, _311id1);
idm311.set(11/* { */, _311id1);
idm311.set(45/* | */, _311id1);
idm311.set(43/* || */, _311id1);
idm311.set(42/* ~ */, _311id1);
const tym311: Map<number, (L: Lexer) => void> = new Map();
tym311.set(0, _311id1/* compressed */);
tym311.set(3/* id */, _311id1/* compressed */);
function State311(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm311.has(l.id)) idm311.get(l.id)(l);
    else if (tym311.has(l.ty)) tym311.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 83:
                State409(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![84].includes(a)) fail(l);
}
function State312(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 16/* ) */, 28/* : */, 40/* > */, 41/* + */, 42/* ~ */, 43/* || */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //PSEUDO_ELEMENT_SELECTOR=>: PSEUDO_CLASS_SELECTOR •

        add_reduce(2, 195);
        stack_ptr -= 2;
        prod = 90;
        return;
    }
}
const idm313: Map<number, (L: Lexer) => void> = new Map();
idm313.set(52/* $= */, _0id4/* compressed */);
idm313.set(53/* *= */, _0id9/* compressed */);
idm313.set(33/* = */, _0id17/* compressed */);
const _313id3 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State414(l);
    //
};
idm313.set(49/* ] */, _313id3);
idm313.set(51/* ^= */, _0id23/* compressed */);
const _313id5 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State416(l);
    //
};
idm313.set(50/* ~ */, _313id5);
function State313(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm313.has(l.id)) idm313.get(l.id)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 87:
                State415(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![86].includes(a)) fail(l);
}
function State314(l: Lexer): void {
    prod = -1;
    if ([16/* ) */].includes(l.id) || [0, 1/* ws */, 3/* id */].includes(l.ty)) {
        //general_enclosed_HC_listbody1_124=>general_enclosed_HC_listbody1_124 general_enclosed_group_064_123 •

        add_reduce(2, 108);
        stack_ptr -= 2;
        prod = 51;
        return;
    }
}
function State315(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 12/* ; */, 16/* ) */, 17/* @ */, 23/* or */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //media_or_group_154_120=>or media_in_parenths •

        add_reduce(2, 95);
        stack_ptr -= 2;
        prod = 44;
        return;
    }
}
function State316(l: Lexer): void {
    prod = -1;
    if ([16/* ) */, 29/* < */, 30/* <= */, 31/* > */, 32/* >= */, 33/* = */].includes(l.id) || [0].includes(l.ty)) {
        //dimension=>θnum θid •

        add_reduce(2, 136);
        stack_ptr -= 2;
        prod = 64;
        return;
    }
}
function State317(l: Lexer): void {
    prod = -1;
    if ([2/* num */].includes(l.ty)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State421(l); return;
        //

    }
}
const idm318: Map<number, (L: Lexer) => void> = new Map();
const _318id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State321(l);
    //
};
idm318.set(60/* $ */, _318id0);
const _318id1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State320(l);
    //
};
idm318.set(58/* _ */, _318id1);
const tym318: Map<number, (L: Lexer) => void> = new Map();
const _318ty0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State322(l);
    //
};
tym318.set(3/* id */, _318ty0);
function $def$identifier_symbols(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm318.has(l.id)) idm318.get(l.id)(l);
    else if (tym318.has(l.ty)) tym318.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 131:
                State319(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![131].includes(a)) fail(l);
}
const idm319: Map<number, (L: Lexer) => void> = new Map();
const _319id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State399(l); return;
    //
};
idm319.set(60/* $ */, _319id0);
idm319.set(59/* - */, _279id1/* compressed */);
const _319id2 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State397(l); return;
    //
};
idm319.set(58/* _ */, _319id2);
const tym319: Map<number, (L: Lexer) => void> = new Map();
const _319ty0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State402(l); return;
    //
};
tym319.set(5/* bin */, _319ty0);
const _319ty1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State401(l); return;
    //
};
tym319.set(5/* hex */, _319ty1);
const _319ty2 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State395(l); return;
    //
};
tym319.set(3/* id */, _319ty2);
tym319.set(5/* keyword */, _279ty3/* compressed */);
const _319ty4 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State400(l); return;
    //
};
tym319.set(2/* num */, _319ty4);
const _319ty5 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State403(l); return;
    //
};
tym319.set(5/* oct */, _319ty5);
function State319(l: Lexer): void {
    prod = -1;
    if (idm319.has(l.id)) idm319.get(l.id)(l);
    else if (tym319.has(l.ty)) tym319.get(l.ty)(l);
}
function State320(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* keyword */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$identifier_symbols=>_ •

        stack_ptr -= 1;
        prod = 131;
        return;
    }
}
function State321(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* keyword */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$identifier_symbols=>$ •

        stack_ptr -= 1;
        prod = 131;
        return;
    }
}
function State322(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* keyword */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$identifier_symbols=>θid •

        stack_ptr -= 1;
        prod = 131;
        return;
    }
}
const idm323: Map<number, (L: Lexer) => void> = new Map();
idm323.set(60/* $ */, _10id0/* compressed */);
idm323.set(59/* - */, _10id2/* compressed */);
const tym323: Map<number, (L: Lexer) => void> = new Map();
tym323.set(3/* id */, _10ty0/* compressed */);
tym323.set(2/* num */, _22ty1/* compressed */);
function State323(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm323.has(l.id)) idm323.get(l.id)(l);
    else if (tym323.has(l.ty)) tym323.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State121(l);
                continue;
            case 64:
                State118(l);
                continue;
            case 62:
                State120(l);
                continue;
            case 60:
                State119(l);
                continue;
            case 58:
                State423(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![57].includes(a)) fail(l);
}
function State324(l: Lexer): void {
    prod = -1;
    if ([59/* - */, 60/* $ */].includes(l.id) || [2/* num */, 3/* id */].includes(l.ty)) {
        //mf_range_group_071_125=>< •

        stack_ptr -= 1;
        prod = 54;
        return;
    }
}
function State325(l: Lexer): void {
    prod = -1;
    if ([59/* - */, 60/* $ */].includes(l.id) || [2/* num */, 3/* id */].includes(l.ty)) {
        //mf_range_group_071_125=><= •

        stack_ptr -= 1;
        prod = 54;
        return;
    }
}
function State326(l: Lexer): void {
    prod = -1;
    if ([59/* - */, 60/* $ */].includes(l.id) || [2/* num */, 3/* id */].includes(l.ty)) {
        //mf_range_group_071_125=>> •

        stack_ptr -= 1;
        prod = 54;
        return;
    }
}
function State327(l: Lexer): void {
    prod = -1;
    if ([59/* - */, 60/* $ */].includes(l.id) || [2/* num */, 3/* id */].includes(l.ty)) {
        //mf_range_group_071_125=>>= •

        stack_ptr -= 1;
        prod = 54;
        return;
    }
}
function State328(l: Lexer): void {
    prod = -1;
    if ([59/* - */, 60/* $ */].includes(l.id) || [2/* num */, 3/* id */].includes(l.ty)) {
        //mf_range_group_071_125=>= •

        stack_ptr -= 1;
        prod = 54;
        return;
    }
}
const idm329: Map<number, (L: Lexer) => void> = new Map();
idm329.set(60/* $ */, _10id0/* compressed */);
idm329.set(59/* - */, _10id2/* compressed */);
const tym329: Map<number, (L: Lexer) => void> = new Map();
tym329.set(3/* id */, _10ty0/* compressed */);
function State329(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm329.has(l.id)) idm329.get(l.id)(l);
    else if (tym329.has(l.ty)) tym329.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State121(l);
                continue;
            case 60:
                State426(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![57].includes(a)) fail(l);
}
const idm330: Map<number, (L: Lexer) => void> = new Map();
idm330.set(60/* $ */, _10id0/* compressed */);
idm330.set(59/* - */, _10id2/* compressed */);
const tym330: Map<number, (L: Lexer) => void> = new Map();
tym330.set(3/* id */, _10ty0/* compressed */);
function State330(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm330.has(l.id)) idm330.get(l.id)(l);
    else if (tym330.has(l.ty)) tym330.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State424(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![57].includes(a)) fail(l);
}
const idm331: Map<number, (L: Lexer) => void> = new Map();
idm331.set(60/* $ */, _10id0/* compressed */);
idm331.set(59/* - */, _10id2/* compressed */);
const tym331: Map<number, (L: Lexer) => void> = new Map();
tym331.set(3/* id */, _10ty0/* compressed */);
function State331(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm331.has(l.id)) idm331.get(l.id)(l);
    else if (tym331.has(l.ty)) tym331.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State425(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![57].includes(a)) fail(l);
}
function State332(l: Lexer): void {
    prod = -1;
    if ([59/* - */, 60/* $ */].includes(l.id) || [3/* id */].includes(l.ty)) {
        //mf_range_group_071_125=>< •  :  mf_range_group_085_127=>< •

        stack_ptr -= 1;
        prod = 54;
        return;
        stack_ptr -= 1;
        prod = 56;
        return;
    }
}
function State333(l: Lexer): void {
    prod = -1;
    if ([59/* - */, 60/* $ */].includes(l.id) || [3/* id */].includes(l.ty)) {
        //mf_range_group_071_125=><= •  :  mf_range_group_085_127=><= •

        stack_ptr -= 1;
        prod = 54;
        return;
        stack_ptr -= 1;
        prod = 56;
        return;
    }
}
function State334(l: Lexer): void {
    prod = -1;
    if ([59/* - */, 60/* $ */].includes(l.id) || [3/* id */].includes(l.ty)) {
        //mf_range_group_071_125=>> •  :  mf_range_group_080_126=>> •

        stack_ptr -= 1;
        prod = 54;
        return;
        stack_ptr -= 1;
        prod = 55;
        return;
    }
}
function State335(l: Lexer): void {
    prod = -1;
    if ([59/* - */, 60/* $ */].includes(l.id) || [3/* id */].includes(l.ty)) {
        //mf_range_group_071_125=>>= •  :  mf_range_group_080_126=>>= •

        stack_ptr -= 1;
        prod = 54;
        return;
        stack_ptr -= 1;
        prod = 55;
        return;
    }
}
function State336(l: Lexer): void {
    prod = -1;
    if ([28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //GROUP_RULE_BODY_HC_listbody5_104=>GROUP_RULE_BODY_HC_listbody5_104 STYLE_RULE •

        add_reduce(2, 17);
        stack_ptr -= 2;
        prod = 7;
        return;
    }
}
const idm337: Map<number, (L: Lexer) => void> = new Map();
idm337.set(60/* $ */, _256id0/* compressed */);
idm337.set(58/* _ */, _256id1/* compressed */);
const tym337: Map<number, (L: Lexer) => void> = new Map();
tym337.set(5/* bin */, _256ty0/* compressed */);
tym337.set(5/* flt */, _256ty1/* compressed */);
tym337.set(5/* hex */, _256ty2/* compressed */);
tym337.set(3/* id */, _256ty3/* compressed */);
tym337.set(2/* num */, _256ty4/* compressed */);
tym337.set(5/* oct */, _256ty5/* compressed */);
tym337.set(5/* sci */, _256ty6/* compressed */);
function $def$defaultproduction(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm337.has(l.id)) idm337.get(l.id)(l);
    else if (tym337.has(l.ty)) tym337.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 131:
                State279(l);
                continue;
            case 130:
                State265(l);
                continue;
            case 129:
                State276(l);
                continue;
            case 128:
                State264(l);
                continue;
            case 120:
                State259(l);
                continue;
            case 119:
                State274(l);
                continue;
            case 118:
                State273(l);
                continue;
            case 117:
                State271(l);
                continue;
            case 116:
                State263(l);
                continue;
            case 115:
                State262(l);
                continue;
            case 114:
                State261(l);
                continue;
            case 113:
                State260(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![111].includes(a)) fail(l);
}
function State338(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 16/* ) */, 28/* : */, 40/* > */, 41/* + */, 42/* ~ */, 43/* || */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //COMPOUND_SELECTOR_HC_listbody1_132=>COMPOUND_SELECTOR_HC_listbody1_132 PSEUDO_CLASS_SELECTOR •

        add_reduce(2, 148);
        stack_ptr -= 2;
        prod = 72;
        return;
    }
}
function State339(l: Lexer): void {
    prod = -1;
    if ([12/* ; */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //declaration_list_HC_listbody3_138=>declaration_list_HC_listbody3_138 ; •

        add_reduce(2, 196);
        stack_ptr -= 2;
        prod = 91;
        return;
    }
}
const idm340: Map<number, (L: Lexer) => void> = new Map();
idm340.set(46/* # */, _0id2/* compressed */);
idm340.set(60/* $ */, _10id0/* compressed */);
idm340.set(44/* * */, _77id2/* compressed */);
idm340.set(59/* - */, _10id2/* compressed */);
idm340.set(47/* . */, _0id13/* compressed */);
idm340.set(28/* : */, _77id5/* compressed */);
idm340.set(17/* @ */, _131id6/* compressed */);
idm340.set(48/* [ */, _0id20/* compressed */);
idm340.set(45/* | */, _0id43/* compressed */);
const tym340: Map<number, (L: Lexer) => void> = new Map();
tym340.set(3/* id */, _10ty0/* compressed */);
const _340ty1 = (l: Lexer): void => {//STYLE_SHEET=>•

    add_reduce(0, 10);
    stack_ptr -= 0;
    prod = 4;
    return;
};
tym340.set(0, _340ty1);
function $STYLE_SHEET(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm340.has(l.id)) idm340.get(l.id)(l);
    else if (tym340.has(l.ty)) tym340.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State87(l);
                continue;
            case 90:
                State100(l);
                continue;
            case 89:
                State81(l);
                continue;
            case 86:
                State93(l);
                continue;
            case 84:
                State94(l);
                continue;
            case 82:
                State92(l);
                continue;
            case 81:
                State91(l);
                continue;
            case 80:
                State90(l);
                continue;
            case 79:
                State84(l);
                continue;
            case 78:
                State85(l);
                continue;
            case 77:
                State88(l);
                continue;
            case 75:
                State80(l);
                continue;
            case 74:
                State83(l);
                continue;
            case 73:
                State99(l);
                continue;
            case 71:
                State82(l);
                continue;
            case 70:
                State79(l);
                continue;
            case 31:
                State5(l);
                continue;
            case 23:
                State8(l);
                continue;
            case 17:
                State7(l);
                continue;
            case 14:
                State343(l);
                continue;
            case 9:
                State135(l);
                continue;
            case 6:
                State134(l);
                continue;
            case 5:
                State104(l);
                continue;
            case 3:
                State342(l);
                continue;
            case 2:
                State133(l);
                continue;
            case 1:
                State341(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![4].includes(a)) fail(l);
}
const idm341: Map<number, (L: Lexer) => void> = new Map();
idm341.set(46/* # */, _0id2/* compressed */);
idm341.set(60/* $ */, _10id0/* compressed */);
idm341.set(44/* * */, _77id2/* compressed */);
idm341.set(59/* - */, _10id2/* compressed */);
idm341.set(47/* . */, _0id13/* compressed */);
idm341.set(28/* : */, _77id5/* compressed */);
idm341.set(17/* @ */, _131id6/* compressed */);
idm341.set(48/* [ */, _0id20/* compressed */);
idm341.set(45/* | */, _0id43/* compressed */);
const tym341: Map<number, (L: Lexer) => void> = new Map();
tym341.set(3/* id */, _10ty0/* compressed */);
const _341ty1 = (l: Lexer): void => {//STYLE_SHEET=>STYLE_SHEET_HC_listbody1_100 •

    add_reduce(1, 9);
    stack_ptr -= 1;
    prod = 4;
    return;
};
tym341.set(0, _341ty1);
function State341(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm341.has(l.id)) idm341.get(l.id)(l);
    else if (tym341.has(l.ty)) tym341.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State87(l);
                continue;
            case 90:
                State100(l);
                continue;
            case 89:
                State81(l);
                continue;
            case 86:
                State93(l);
                continue;
            case 84:
                State94(l);
                continue;
            case 82:
                State92(l);
                continue;
            case 81:
                State91(l);
                continue;
            case 80:
                State90(l);
                continue;
            case 79:
                State84(l);
                continue;
            case 78:
                State85(l);
                continue;
            case 77:
                State88(l);
                continue;
            case 75:
                State80(l);
                continue;
            case 74:
                State83(l);
                continue;
            case 73:
                State99(l);
                continue;
            case 71:
                State82(l);
                continue;
            case 70:
                State79(l);
                continue;
            case 31:
                State5(l);
                continue;
            case 23:
                State8(l);
                continue;
            case 17:
                State7(l);
                continue;
            case 14:
                State459(l);
                continue;
            case 9:
                State135(l);
                continue;
            case 6:
                State134(l);
                continue;
            case 5:
                State104(l);
                continue;
            case 3:
                State458(l);
                continue;
            case 2:
                State133(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![4, 1].includes(a)) fail(l);
}
const idm342: Map<number, (L: Lexer) => void> = new Map();
idm342.set(46/* # */, _0id2/* compressed */);
idm342.set(60/* $ */, _10id0/* compressed */);
idm342.set(44/* * */, _77id2/* compressed */);
idm342.set(59/* - */, _10id2/* compressed */);
idm342.set(47/* . */, _0id13/* compressed */);
idm342.set(28/* : */, _77id5/* compressed */);
idm342.set(17/* @ */, _131id6/* compressed */);
idm342.set(48/* [ */, _0id20/* compressed */);
idm342.set(45/* | */, _0id43/* compressed */);
const tym342: Map<number, (L: Lexer) => void> = new Map();
tym342.set(3/* id */, _10ty0/* compressed */);
const _342ty1 = (l: Lexer): void => {//STYLE_SHEET=>STYLE_SHEET_HC_listbody1_102 •

    add_reduce(1, 8);
    stack_ptr -= 1;
    prod = 4;
    return;
};
tym342.set(0, _342ty1);
function State342(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm342.has(l.id)) idm342.get(l.id)(l);
    else if (tym342.has(l.ty)) tym342.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State87(l);
                continue;
            case 90:
                State100(l);
                continue;
            case 89:
                State81(l);
                continue;
            case 86:
                State93(l);
                continue;
            case 84:
                State94(l);
                continue;
            case 82:
                State92(l);
                continue;
            case 81:
                State91(l);
                continue;
            case 80:
                State90(l);
                continue;
            case 79:
                State84(l);
                continue;
            case 78:
                State85(l);
                continue;
            case 77:
                State88(l);
                continue;
            case 75:
                State80(l);
                continue;
            case 74:
                State83(l);
                continue;
            case 73:
                State99(l);
                continue;
            case 71:
                State82(l);
                continue;
            case 70:
                State79(l);
                continue;
            case 31:
                State5(l);
                continue;
            case 23:
                State8(l);
                continue;
            case 17:
                State7(l);
                continue;
            case 14:
                State6(l);
                continue;
            case 9:
                State135(l);
                continue;
            case 6:
                State134(l);
                continue;
            case 5:
                State104(l);
                continue;
            case 2:
                State354(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![4, 3].includes(a)) fail(l);
}
const idm343: Map<number, (L: Lexer) => void> = new Map();
idm343.set(12/* ; */, _6id0/* compressed */);
const _343id1 = (l: Lexer): void => {//STYLE_SHEET_HC_listbody1_100=>import •  :  AT_RULE=>import •

    add_reduce(1, 2);
    stack_ptr -= 1;
    prod = 1;
    return;
    stack_ptr -= 1;
    prod = 9;
    return;
};
idm343.set(46/* # */, _343id1);
idm343.set(60/* $ */, _343id1);
idm343.set(44/* * */, _343id1);
idm343.set(59/* - */, _343id1);
idm343.set(47/* . */, _343id1);
idm343.set(28/* : */, _343id1);
idm343.set(17/* @ */, _343id1);
idm343.set(48/* [ */, _343id1);
idm343.set(45/* | */, _343id1);
const tym343: Map<number, (L: Lexer) => void> = new Map();
tym343.set(0, _343id1/* compressed */);
tym343.set(3/* id */, _343id1/* compressed */);
function State343(l: Lexer): void {
    prod = -1;
    if (idm343.has(l.id)) idm343.get(l.id)(l);
    else if (tym343.has(l.ty)) tym343.get(l.ty)(l);
}
const idm344: Map<number, (L: Lexer) => void> = new Map();
idm344.set(60/* $ */, _10id0/* compressed */);
idm344.set(59/* - */, _10id2/* compressed */);
const tym344: Map<number, (L: Lexer) => void> = new Map();
tym344.set(3/* id */, _10ty0/* compressed */);
tym344.set(2/* num */, _22ty1/* compressed */);
function State344(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm344.has(l.id)) idm344.get(l.id)(l);
    else if (tym344.has(l.ty)) tym344.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State121(l);
                continue;
            case 64:
                State118(l);
                continue;
            case 62:
                State120(l);
                continue;
            case 60:
                State119(l);
                continue;
            case 58:
                State428(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![53].includes(a)) fail(l);
}
function State345(l: Lexer): void {
    prod = -1;
    if ([12/* ; */, 13/* } */].includes(l.id) || [0].includes(l.ty)) {
        //declaration_list_HC_listbody1_141=>declaration_list_HC_listbody1_141 ; •

        add_reduce(2, 202);
        stack_ptr -= 2;
        prod = 94;
        return;
    }
}
const idm346: Map<number, (L: Lexer) => void> = new Map();
idm346.set(60/* $ */, _10id0/* compressed */);
idm346.set(59/* - */, _10id2/* compressed */);
idm346.set(12/* ; */, _155id2/* compressed */);
const tym346: Map<number, (L: Lexer) => void> = new Map();
tym346.set(3/* id */, _10ty0/* compressed */);
function State346(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm346.has(l.id)) idm346.get(l.id)(l);
    else if (tym346.has(l.ty)) tym346.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 104:
                State45(l);
                continue;
            case 103:
                State161(l);
                continue;
            case 98:
                State160(l);
                continue;
            case 96:
                State159(l);
                continue;
            case 92:
                State429(l);
                continue;
            case 91:
                State158(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![93].includes(a)) fail(l);
}
function State347(l: Lexer): void {
    prod = -1;
    if ([12/* ; */, 13/* } */, 15/* ( */, 16/* ) */, 56/* ! */, 58/* _ */, 59/* - */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* sym */].includes(l.ty)) {
        //string_value=>string_value string_value_group_0162_145 •

        add_reduce(2, 236);
        stack_ptr -= 2;
        prod = 107;
        return;
    }
}
const idm348: Map<number, (L: Lexer) => void> = new Map();
idm348.set(59/* - */, _162id0/* compressed */);
idm348.set(58/* _ */, _162id1/* compressed */);
const tym348: Map<number, (L: Lexer) => void> = new Map();
tym348.set(3/* id */, _162ty0/* compressed */);
tym348.set(2/* num */, _162ty1/* compressed */);
tym348.set(5/* sym */, _162ty2/* compressed */);
tym348.set(1/* ws */, _171ty3/* compressed */);
function State348(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm348.has(l.id)) idm348.get(l.id)(l);
    else if (tym348.has(l.ty)) tym348.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 107:
                State163(l);
                continue;
            case 105:
                State165(l);
                continue;
            case 101:
                State175(l);
                continue;
            case 100:
                State430(l);
                continue;
            case 99:
                State173(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![101].includes(a)) fail(l);
}
const idm349: Map<number, (L: Lexer) => void> = new Map();
const _349id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State166(l);
    if (prod >= 0) return; else FAILED = false;
    //declaration_values=>declaration_values string_value •

    add_reduce(2, 217);
    stack_ptr -= 2;
    prod = 101;
    return;
};
idm349.set(59/* - */, _349id0);
const _349id1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State167(l);
    if (prod >= 0) return; else FAILED = false;
    //declaration_values=>declaration_values string_value •

    add_reduce(2, 217);
    stack_ptr -= 2;
    prod = 101;
    return;
};
idm349.set(58/* _ */, _349id1);
const _349id2 = (l: Lexer): void => {//declaration_values=>declaration_values string_value •

    add_reduce(2, 217);
    stack_ptr -= 2;
    prod = 101;
    return;
};
idm349.set(56/* ! */, _349id2);
idm349.set(15/* ( */, _349id2);
idm349.set(16/* ) */, _349id2);
idm349.set(12/* ; */, _349id2);
idm349.set(13/* } */, _349id2);
const tym349: Map<number, (L: Lexer) => void> = new Map();
const _349ty0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State169(l);
    if (prod >= 0) return; else FAILED = false;
    //declaration_values=>declaration_values string_value •

    add_reduce(2, 217);
    stack_ptr -= 2;
    prod = 101;
    return;
};
tym349.set(3/* id */, _349ty0);
const _349ty1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State168(l);
    if (prod >= 0) return; else FAILED = false;
    //declaration_values=>declaration_values string_value •

    add_reduce(2, 217);
    stack_ptr -= 2;
    prod = 101;
    return;
};
tym349.set(2/* num */, _349ty1);
const _349ty2 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State170(l);
    if (prod >= 0) return; else FAILED = false;
    //declaration_values=>declaration_values string_value •

    add_reduce(2, 217);
    stack_ptr -= 2;
    prod = 101;
    return;
};
tym349.set(5/* sym */, _349ty2);
tym349.set(0, _349id2/* compressed */);
tym349.set(1/* ws */, _349id2/* compressed */);
function State349(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm349.has(l.id)) idm349.get(l.id)(l);
    else if (tym349.has(l.ty)) tym349.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 105:
                State347(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![101, 107].includes(a)) fail(l);
}
function State350(l: Lexer): void {
    prod = -1;
    if ([12/* ; */, 13/* } */, 15/* ( */, 16/* ) */, 56/* ! */, 58/* _ */, 59/* - */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* sym */].includes(l.ty)) {
        //declaration_values=>declaration_values θws •

        add_reduce(2, 218);
        stack_ptr -= 2;
        prod = 101;
        return;
    }
}
function State351(l: Lexer): void {
    prod = -1;
    if ([12/* ; */, 13/* } */].includes(l.id) || [0].includes(l.ty)) {
        //declaration_list_group_1137_139=>declaration_list_HC_listbody3_138 rule_declaration •

        add_reduce(2, 198);
        stack_ptr -= 2;
        prod = 92;
        return;
    }
}
function State352(l: Lexer): void {
    prod = -1;
    if ([16/* ) */, 58/* _ */, 59/* - */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* sym */].includes(l.ty)) {
        //declaration_values_HC_listbody1_144=>declaration_values_HC_listbody1_144 declaration_values_group_0144_143 •

        add_reduce(2, 213);
        stack_ptr -= 2;
        prod = 100;
        return;
    }
}
function State353(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 59/* - */].includes(l.id) || [0, 2/* num */, 3/* id */, 5/* sym */].includes(l.ty)) {
        //string_value_HC_listbody1_146=>string_value_HC_listbody1_146 string_value_group_0162_145 •

        add_reduce(2, 234);
        stack_ptr -= 2;
        prod = 106;
        return;
    }
}
function State354(l: Lexer): void {
    prod = -1;
    if ([17/* @ */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //STYLE_SHEET_HC_listbody1_102=>STYLE_SHEET_HC_listbody1_102 STYLE_SHEET_group_03_101 •

        add_reduce(2, 5);
        stack_ptr -= 2;
        prod = 3;
        return;
    }
}
function State355(l: Lexer): void {
    prod = -1;
    if ([13/* } */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //GROUP_RULE_BODY=>GROUP_RULE_BODY STYLE_RULE •

        add_reduce(2, 19);
        stack_ptr -= 2;
        prod = 8;
        return;
    }
}
function State356(l: Lexer): void {
    prod = -1;
    if ([39/* " */, 58/* _ */, 59/* - */, 73/* ' */, 74/* / */, 75/* \ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* cb */, 5/* ob */, 5/* sym */, 88].includes(l.ty)) {
        //def$string_value_HC_listbody2_105=>def$string_value_HC_listbody2_105 def$string_value_group_149_104 •

        add_reduce(2, 292);
        stack_ptr -= 2;
        prod = 126;
        return;
    }
}
function State357(l: Lexer): void {
    prod = -1;
    if ([39/* " */, 58/* _ */, 59/* - */, 73/* ' */, 74/* / */, 75/* \ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* cb */, 5/* ob */, 5/* sym */, 88].includes(l.ty)) {
        //def$string_value_group_149_104=>\ θany •

        add_reduce(2, 291);
        stack_ptr -= 2;
        prod = 125;
        return;
    }
}
function State358(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 16/* ) */, 28/* : */, 40/* > */, 41/* + */, 42/* ~ */, 43/* || */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //COMPLEX_SELECTOR_HC_listbody2_130=>COMPLEX_SELECTOR_HC_listbody2_130 COMPLEX_SELECTOR_group_1103_129 •

        add_reduce(2, 142);
        stack_ptr -= 2;
        prod = 69;
        return;
    }
}
function State359(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 59/* - */, 73/* ' */, 74/* / */, 75/* \ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* cb */, 5/* ob */, 5/* sym */, 88].includes(l.ty)) {
        //def$string_HC_listbody1_103=>def$string_HC_listbody1_103 def$string_group_034_101 •

        add_reduce(2, 277);
        stack_ptr -= 2;
        prod = 123;
        return;
    }
}
function State360(l: Lexer): void {
    prod = -1;
    if ([39/* " */, 58/* _ */, 59/* - */, 74/* / */, 75/* \ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* cb */, 5/* ob */, 5/* sym */, 88].includes(l.ty)) {
        //def$string_HC_listbody1_102=>def$string_HC_listbody1_102 def$string_group_034_101 •

        add_reduce(2, 275);
        stack_ptr -= 2;
        prod = 122;
        return;
    }
}
function State361(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 16/* ) */, 28/* : */, 40/* > */, 41/* + */, 42/* ~ */, 43/* || */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //COMPLEX_SELECTOR_group_1103_129=>COMPLEX_SELECTOR_group_0102_128 COMPOUND_SELECTOR •

        add_reduce(2, 140);
        stack_ptr -= 2;
        prod = 68;
        return;
    }
}
const idm362: Map<number, (L: Lexer) => void> = new Map();
const _362id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State27(l);
    if (prod >= 0) return; else FAILED = false;
    //import=>@ import import_group_012_105 •

    add_reduce(3, 39);
    stack_ptr -= 3;
    prod = 14;
    return;
};
idm362.set(60/* $ */, _362id0);
idm362.set(15/* ( */, _10id1/* compressed */);
const _362id2 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State29(l);
    if (prod >= 0) return; else FAILED = false;
    //import=>@ import import_group_012_105 •

    add_reduce(3, 39);
    stack_ptr -= 3;
    prod = 14;
    return;
};
idm362.set(59/* - */, _362id2);
idm362.set(24/* not */, _10id3/* compressed */);
idm362.set(27/* only */, _0id35/* compressed */);
const _362id5 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State436(l);
    //
};
idm362.set(14/* supports */, _362id5);
const _362id6 = (l: Lexer): void => {//import=>@ import import_group_012_105 •

    add_reduce(3, 39);
    stack_ptr -= 3;
    prod = 14;
    return;
};
idm362.set(46/* # */, _362id6);
idm362.set(44/* * */, _362id6);
idm362.set(47/* . */, _362id6);
idm362.set(28/* : */, _362id6);
idm362.set(12/* ; */, _362id6);
idm362.set(17/* @ */, _362id6);
idm362.set(48/* [ */, _362id6);
idm362.set(45/* | */, _362id6);
const tym362: Map<number, (L: Lexer) => void> = new Map();
const _362ty0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State28(l);
    if (prod >= 0) return; else FAILED = false;
    //import=>@ import import_group_012_105 •

    add_reduce(3, 39);
    stack_ptr -= 3;
    prod = 14;
    return;
};
tym362.set(3/* id */, _362ty0);
tym362.set(0, _362id6/* compressed */);
function State362(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm362.has(l.id)) idm362.get(l.id)(l);
    else if (tym362.has(l.ty)) tym362.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State25(l);
                continue;
            case 61:
                State15(l);
                continue;
            case 52:
                State24(l);
                continue;
            case 49:
                State23(l);
                continue;
            case 47:
                State20(l);
                continue;
            case 46:
                State17(l);
                continue;
            case 43:
                State19(l);
                continue;
            case 40:
                State18(l);
                continue;
            case 39:
                State16(l);
                continue;
            case 38:
                State13(l);
                continue;
            case 37:
                State12(l);
                continue;
            case 35:
                State14(l);
                continue;
            case 13:
                State435(l);
                continue;
            case 12:
                State434(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![14].includes(a)) fail(l);
}
function State363(l: Lexer): void {
    prod = -1;
    if ([12/* ; */, 14/* supports */, 15/* ( */, 17/* @ */, 24/* not */, 27/* only */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //import_group_012_105=>string •

        stack_ptr -= 1;
        prod = 10;
        return;
    }
}
function State364(l: Lexer): void {
    prod = -1;
    if ([12/* ; */, 14/* supports */, 15/* ( */, 17/* @ */, 24/* not */, 27/* only */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //import_group_012_105=>url •

        stack_ptr -= 1;
        prod = 10;
        return;
    }
}
function State365(l: Lexer): void {
    prod = -1;
    if ([39/* " */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State431(l); return;
        //

    }
}
function State366(l: Lexer): void {
    prod = -1;
    if ([15/* ( */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State432(l); return;
        //

    }
}
function State367(l: Lexer): void {
    prod = -1;
    if ([11/* { */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State433(l); return;
        //

    }
}
function State368(l: Lexer): void {
    prod = -1;
    if ([11/* { */].includes(l.id)) {
        //keyframes_name=>θid •

        stack_ptr -= 1;
        prod = 18;
        return;
    }
}
function State369(l: Lexer): void {
    prod = -1;
    if ([11/* { */].includes(l.id)) {
        //keyframes_name=>string •

        stack_ptr -= 1;
        prod = 18;
        return;
    }
}
function State370(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 12/* ; */, 17/* @ */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //media_query=>media_query_group_043_116 media_type media_query_group_144_117 •

        add_reduce(3, 81);
        stack_ptr -= 3;
        prod = 37;
        return;
    }
}
function State371(l: Lexer): void {
    prod = -1;
    if ([11/* { */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State437(l); return;
        //

    }
}
function State372(l: Lexer): void {
    prod = -1;
    if ([11/* { */].includes(l.id)) {
        //supports_group_025_111=>supports_condition •

        add_reduce(1, 53);
        stack_ptr -= 1;
        prod = 22;
        return;
    }
}
function State373(l: Lexer): void {
    prod = -1;
    if ([11/* { */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State438(l); return;
        //

    }
}
const idm374: Map<number, (L: Lexer) => void> = new Map();
const _374id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State290(l); return;
    //
};
idm374.set(10/* , */, _374id0);
const _374id1 = (l: Lexer): void => {//media_queries=>media_queries_group_039_115 •

    add_reduce(1, 76);
    stack_ptr -= 1;
    prod = 34;
    return;
};
idm374.set(11/* { */, _374id1);
function State374(l: Lexer): void {
    prod = -1;
    if (idm374.has(l.id)) idm374.get(l.id)(l);
}
const idm375: Map<number, (L: Lexer) => void> = new Map();
const _375id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State439(l);
    //
};
idm375.set(16/* ) */, _375id0);
const tym375: Map<number, (L: Lexer) => void> = new Map();
tym375.set(3/* id */, _110ty0/* compressed */);
tym375.set(1/* ws */, _110ty1/* compressed */);
function State375(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm375.has(l.id)) idm375.get(l.id)(l);
    else if (tym375.has(l.ty)) tym375.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 50:
                State314(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![52, 51].includes(a)) fail(l);
}
function State376(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 12/* ; */, 16/* ) */, 17/* @ */, 22/* and */, 23/* or */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //general_enclosed=>identifier ( ) •

        add_reduce(3, 111);
        stack_ptr -= 3;
        prod = 52;
        return;
    }
}
function State377(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 12/* ; */, 16/* ) */, 17/* @ */, 22/* and */, 23/* or */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //media_in_parenths=>( media_condition ) •

        add_reduce(3, 99);
        stack_ptr -= 3;
        prod = 47;
        return;
    }
}
function State378(l: Lexer): void {
    prod = -1;
    if ([11/* { */, 16/* ) */, 22/* and */, 23/* or */].includes(l.id) || [0].includes(l.ty)) {
        //supports_in_parens=>( supports_condition ) •

        add_reduce(3, 63);
        stack_ptr -= 3;
        prod = 27;
        return;
    }
}
function State379(l: Lexer): void {
    prod = -1;
    if ([11/* { */, 16/* ) */, 22/* and */, 23/* or */].includes(l.id) || [0].includes(l.ty)) {
        //supports_decl=>( declaration ) •

        add_reduce(3, 68);
        stack_ptr -= 3;
        prod = 29;
        return;
    }
}
function State380(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 12/* ; */, 16/* ) */, 17/* @ */, 22/* and */, 23/* or */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //media_feature=>( media_feature_group_061_122 ) •

        add_reduce(3, 105);
        stack_ptr -= 3;
        prod = 49;
        return;
    }
}
function State381(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 12/* ; */, 17/* @ */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //media_query_group_144_117=>and media_condition_without_or •

        add_reduce(2, 79);
        stack_ptr -= 2;
        prod = 36;
        return;
    }
}
function State382(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */].includes(l.id) || [0].includes(l.ty)) {
        //keyframes_blocks_HC_listbody1_110=>keyframes_blocks_HC_listbody1_110 , keyframe_selector •

        add_reduce(3, 46);
        stack_ptr -= 3;
        prod = 19;
        return;
    }
}
const idm383: Map<number, (L: Lexer) => void> = new Map();
idm383.set(56/* ! */, _0id0/* compressed */);
idm383.set(15/* ( */, _164id0/* compressed */);
idm383.set(59/* - */, _162id0/* compressed */);
idm383.set(58/* _ */, _162id1/* compressed */);
const _383id4 = (l: Lexer): void => {//declaration=>declaration_id : declaration_values •

    add_reduce(3, 209);
    stack_ptr -= 3;
    prod = 98;
    return;
};
idm383.set(16/* ) */, _383id4);
idm383.set(12/* ; */, _383id4);
idm383.set(13/* } */, _383id4);
const tym383: Map<number, (L: Lexer) => void> = new Map();
tym383.set(3/* id */, _162ty0/* compressed */);
tym383.set(2/* num */, _162ty1/* compressed */);
tym383.set(5/* sym */, _162ty2/* compressed */);
tym383.set(1/* ws */, _164ty3/* compressed */);
tym383.set(0, _383id4/* compressed */);
function State383(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm383.has(l.id)) idm383.get(l.id)(l);
    else if (tym383.has(l.ty)) tym383.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 107:
                State349(l);
                continue;
            case 105:
                State165(l);
                continue;
            case 97:
                State444(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![98, 101].includes(a)) fail(l);
}
const idm384: Map<number, (L: Lexer) => void> = new Map();
const _384id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State440(l); return;
    //
};
idm384.set(12/* ; */, _384id0);
const _384id1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State441(l); return;
    //
};
idm384.set(13/* } */, _384id1);
function State384(l: Lexer): void {
    prod = -1;
    if (idm384.has(l.id)) idm384.get(l.id)(l);
}
const idm385: Map<number, (L: Lexer) => void> = new Map();
const _385id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State443(l);
    if (prod >= 0) return; else FAILED = false;
    //declaration_list=>declaration_list_HC_listbody2_140 •

    add_reduce(1, 205);
    stack_ptr -= 1;
    prod = 95;
    return;
};
idm385.set(12/* ; */, _385id0);
const _385id1 = (l: Lexer): void => {//declaration_list=>declaration_list_HC_listbody2_140 •

    add_reduce(1, 205);
    stack_ptr -= 1;
    prod = 95;
    return;
};
idm385.set(13/* } */, _385id1);
function State385(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm385.has(l.id)) idm385.get(l.id)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 94:
                State442(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![95, 93].includes(a)) fail(l);
}
function State386(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 60/* $ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* keyword */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$js_id_symbols=>def$js_id_symbols θid •

        add_reduce(2, 296);
        stack_ptr -= 2;
        prod = 129;
        return;
    }
}
function State387(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 60/* $ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* keyword */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$js_id_symbols=>def$js_id_symbols θkeyword •

        add_reduce(2, 297);
        stack_ptr -= 2;
        prod = 129;
        return;
    }
}
function State388(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 60/* $ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* keyword */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$js_id_symbols=>def$js_id_symbols _ •

        add_reduce(2, 298);
        stack_ptr -= 2;
        prod = 129;
        return;
    }
}
function State389(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 60/* $ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* keyword */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$js_id_symbols=>def$js_id_symbols $ •

        add_reduce(2, 299);
        stack_ptr -= 2;
        prod = 129;
        return;
    }
}
function State390(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 60/* $ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* keyword */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$js_id_symbols=>def$js_id_symbols θnum •

        add_reduce(2, 300);
        stack_ptr -= 2;
        prod = 129;
        return;
    }
}
function State391(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 60/* $ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* keyword */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$js_id_symbols=>def$js_id_symbols θhex •

        add_reduce(2, 301);
        stack_ptr -= 2;
        prod = 129;
        return;
    }
}
function State392(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 60/* $ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* keyword */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$js_id_symbols=>def$js_id_symbols θbin •

        add_reduce(2, 302);
        stack_ptr -= 2;
        prod = 129;
        return;
    }
}
function State393(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 60/* $ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* keyword */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$js_id_symbols=>def$js_id_symbols θoct •

        add_reduce(2, 303);
        stack_ptr -= 2;
        prod = 129;
        return;
    }
}
function State394(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 12/* ; */, 17/* @ */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //import_HC_listbody5_108=>import_HC_listbody5_108 , media_query •

        add_reduce(3, 34);
        stack_ptr -= 3;
        prod = 13;
        return;
    }
}
function State395(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* keyword */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$identifier_symbols=>def$identifier_symbols θid •

        add_reduce(2, 308);
        stack_ptr -= 2;
        prod = 131;
        return;
    }
}
function State396(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* keyword */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$identifier_symbols=>def$identifier_symbols θkeyword •

        add_reduce(2, 309);
        stack_ptr -= 2;
        prod = 131;
        return;
    }
}
function State397(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* keyword */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$identifier_symbols=>def$identifier_symbols _ •

        add_reduce(2, 310);
        stack_ptr -= 2;
        prod = 131;
        return;
    }
}
function State398(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* keyword */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$identifier_symbols=>def$identifier_symbols - •

        add_reduce(2, 311);
        stack_ptr -= 2;
        prod = 131;
        return;
    }
}
function State399(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* keyword */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$identifier_symbols=>def$identifier_symbols $ •

        add_reduce(2, 312);
        stack_ptr -= 2;
        prod = 131;
        return;
    }
}
function State400(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* keyword */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$identifier_symbols=>def$identifier_symbols θnum •

        add_reduce(2, 313);
        stack_ptr -= 2;
        prod = 131;
        return;
    }
}
function State401(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* keyword */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$identifier_symbols=>def$identifier_symbols θhex •

        add_reduce(2, 314);
        stack_ptr -= 2;
        prod = 131;
        return;
    }
}
function State402(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* keyword */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$identifier_symbols=>def$identifier_symbols θbin •

        add_reduce(2, 315);
        stack_ptr -= 2;
        prod = 131;
        return;
    }
}
function State403(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* keyword */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$identifier_symbols=>def$identifier_symbols θoct •

        add_reduce(2, 316);
        stack_ptr -= 2;
        prod = 131;
        return;
    }
}
function State404(l: Lexer): void {
    prod = -1;
    if ([10/* , */].includes(l.id) || [0].includes(l.ty)) {
        //media_queries_HC_listbody7_114=>media_queries_HC_listbody7_114 , media_query •

        add_reduce(3, 72);
        stack_ptr -= 3;
        prod = 32;
        return;
    }
}
function State405(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */].includes(l.id) || [0].includes(l.ty)) {
        //media_queries_group_039_115=>media_queries_group_039_115 , media_query •

        add_reduce(3, 74);
        stack_ptr -= 3;
        prod = 33;
        return;
    }
}
function State406(l: Lexer): void {
    prod = -1;
    if ([16/* ) */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State446(l); return;
        //

    }
}
function State407(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 60/* $ */].includes(l.id) || [0, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$defaultproductions_HC_listbody1_100=>def$defaultproductions_HC_listbody1_100 def$defaultproduction •

        add_reduce(2, 239);
        stack_ptr -= 2;
        prod = 109;
        return;
    }
}
const idm408: Map<number, (L: Lexer) => void> = new Map();
const _408id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State138(l);
    if (prod >= 0) return; else FAILED = false;
    //COMPOUND_SELECTOR=>TYPE_SELECTOR COMPOUND_SELECTOR_HC_listbody1_131 COMPOUND_SELECTOR_HC_listbody2_134 •

    add_reduce(3, 154);
    stack_ptr -= 3;
    prod = 75;
    return;
};
idm408.set(28/* : */, _408id0);
const _408id1 = (l: Lexer): void => {//COMPOUND_SELECTOR=>TYPE_SELECTOR COMPOUND_SELECTOR_HC_listbody1_131 COMPOUND_SELECTOR_HC_listbody2_134 •

    add_reduce(3, 154);
    stack_ptr -= 3;
    prod = 75;
    return;
};
idm408.set(46/* # */, _408id1);
idm408.set(60/* $ */, _408id1);
idm408.set(16/* ) */, _408id1);
idm408.set(44/* * */, _408id1);
idm408.set(41/* + */, _408id1);
idm408.set(10/* , */, _408id1);
idm408.set(59/* - */, _408id1);
idm408.set(47/* . */, _408id1);
idm408.set(40/* > */, _408id1);
idm408.set(48/* [ */, _408id1);
idm408.set(11/* { */, _408id1);
idm408.set(45/* | */, _408id1);
idm408.set(43/* || */, _408id1);
idm408.set(42/* ~ */, _408id1);
const tym408: Map<number, (L: Lexer) => void> = new Map();
tym408.set(0, _408id1/* compressed */);
tym408.set(3/* id */, _408id1/* compressed */);
function State408(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm408.has(l.id)) idm408.get(l.id)(l);
    else if (tym408.has(l.ty)) tym408.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 90:
                State100(l);
                continue;
            case 73:
                State297(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![75, 74].includes(a)) fail(l);
}
function State409(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 16/* ) */, 28/* : */, 40/* > */, 41/* + */, 42/* ~ */, 43/* || */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //PSEUDO_CLASS_SELECTOR=>: identifier PSEUDO_CLASS_SELECTOR_group_2121_136 •

        add_reduce(3, 178);
        stack_ptr -= 3;
        prod = 84;
        return;
    }
}
function State410(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if ([39/* " */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State365(l);
        //

    }
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 66:
                State447(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![83].includes(a)) fail(l);
}
const idm411: Map<number, (L: Lexer) => void> = new Map();
const _411id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State450(l); return;
    //
};
idm411.set(12/* ; */, _411id0);
const _411id1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State451(l); return;
    //
};
idm411.set(13/* } */, _411id1);
function State411(l: Lexer): void {
    prod = -1;
    if (idm411.has(l.id)) idm411.get(l.id)(l);
}
const idm412: Map<number, (L: Lexer) => void> = new Map();
const _412id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State448(l); return;
    //
};
idm412.set(13/* } */, _412id0);
const _412id1 = (l: Lexer): void => {//declaration_list_HC_listbody3_138=>; •

    add_reduce(1, 197);
    stack_ptr -= 1;
    prod = 91;
    return;
};
idm412.set(60/* $ */, _412id1);
idm412.set(59/* - */, _412id1);
idm412.set(12/* ; */, _412id1);
const tym412: Map<number, (L: Lexer) => void> = new Map();
tym412.set(3/* id */, _412id1/* compressed */);
function State412(l: Lexer): void {
    prod = -1;
    if (idm412.has(l.id)) idm412.get(l.id)(l);
    else if (tym412.has(l.ty)) tym412.get(l.ty)(l);
}
function State413(l: Lexer): void {
    prod = -1;
    if ([13/* } */, 17/* @ */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //STYLE_RULE=>STYLE_RULE_HC_listbody2_103 { } •

        add_reduce(3, 16);
        stack_ptr -= 3;
        prod = 6;
        return;
    }
}
function State414(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 16/* ) */, 28/* : */, 40/* > */, 41/* + */, 42/* ~ */, 43/* || */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //ATTRIBUTE_SELECTOR=>[ WQ_NAME ] •

        add_reduce(3, 182);
        stack_ptr -= 3;
        prod = 86;
        return;
    }
}
const idm415: Map<number, (L: Lexer) => void> = new Map();
const _415id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State462(l);
    //
};
idm415.set(39/* " */, _415id0);
idm415.set(60/* $ */, _10id0/* compressed */);
idm415.set(59/* - */, _10id2/* compressed */);
const tym415: Map<number, (L: Lexer) => void> = new Map();
tym415.set(3/* id */, _10ty0/* compressed */);
function State415(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm415.has(l.id)) idm415.get(l.id)(l);
    else if (tym415.has(l.ty)) tym415.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State461(l);
                continue;
            case 85:
                State460(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![86].includes(a)) fail(l);
}
function State416(l: Lexer): void {
    prod = -1;
    if ([33/* = */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State449(l); return;
        //

    }
}
function State417(l: Lexer): void {
    prod = -1;
    if ([39/* " */, 59/* - */, 60/* $ */].includes(l.id) || [3/* id */].includes(l.ty)) {
        //ATTR_MATCHER=>^= •

        stack_ptr -= 1;
        prod = 87;
        return;
    }
}
function State418(l: Lexer): void {
    prod = -1;
    if ([39/* " */, 59/* - */, 60/* $ */].includes(l.id) || [3/* id */].includes(l.ty)) {
        //ATTR_MATCHER=>$= •

        stack_ptr -= 1;
        prod = 87;
        return;
    }
}
function State419(l: Lexer): void {
    prod = -1;
    if ([39/* " */, 59/* - */, 60/* $ */].includes(l.id) || [3/* id */].includes(l.ty)) {
        //ATTR_MATCHER=>*= •

        stack_ptr -= 1;
        prod = 87;
        return;
    }
}
function State420(l: Lexer): void {
    prod = -1;
    if ([39/* " */, 59/* - */, 60/* $ */].includes(l.id) || [3/* id */].includes(l.ty)) {
        //ATTR_MATCHER=>= •

        stack_ptr -= 1;
        prod = 87;
        return;
    }
}
function State421(l: Lexer): void {
    prod = -1;
    if ([16/* ) */, 29/* < */, 30/* <= */, 31/* > */, 32/* >= */, 33/* = */].includes(l.id) || [0].includes(l.ty)) {
        //ratio=>θnum / θnum •

        add_reduce(3, 134);
        stack_ptr -= 3;
        prod = 62;
        return;
    }
}
function State422(l: Lexer): void {
    prod = -1;
    if ([58/* _ */, 60/* $ */].includes(l.id) || [0, 2/* num */, 3/* id */, 5/* bin */, 5/* flt */, 5/* hex */, 5/* oct */, 5/* sci */].includes(l.ty)) {
        //def$defaultproductions=>def$defaultproductions def$defaultproduction •

        add_reduce(2, 241);
        stack_ptr -= 2;
        prod = 110;
        return;
    }
}
function State423(l: Lexer): void {
    prod = -1;
    if ([16/* ) */].includes(l.id) || [0].includes(l.ty)) {
        //mf_range=>mf_name mf_range_group_071_125 mf_value •

        add_reduce(3, 122);
        stack_ptr -= 3;
        prod = 57;
        return;
    }
}
const idm424: Map<number, (L: Lexer) => void> = new Map();
const _424id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State456(l);
    //
};
idm424.set(31/* > */, _424id0);
const _424id1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State457(l);
    //
};
idm424.set(32/* >= */, _424id1);
function State424(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm424.has(l.id)) idm424.get(l.id)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 55:
                State455(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![57].includes(a)) fail(l);
}
const idm425: Map<number, (L: Lexer) => void> = new Map();
const _425id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State453(l);
    //
};
idm425.set(29/* < */, _425id0);
const _425id1 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State454(l);
    //
};
idm425.set(30/* <= */, _425id1);
function State425(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm425.has(l.id)) idm425.get(l.id)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 56:
                State452(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![57].includes(a)) fail(l);
}
function State426(l: Lexer): void {
    prod = -1;
    if ([16/* ) */].includes(l.id) || [0].includes(l.ty)) {
        //mf_range=>mf_value mf_range_group_071_125 mf_name •

        add_reduce(3, 123);
        stack_ptr -= 3;
        prod = 57;
        return;
    }
}
function State427(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */].includes(l.id) || [0].includes(l.ty)) {
        //STYLE_RULE_HC_listbody2_103=>STYLE_RULE_HC_listbody2_103 , COMPLEX_SELECTOR •

        add_reduce(3, 11);
        stack_ptr -= 3;
        prod = 5;
        return;
    }
}
function State428(l: Lexer): void {
    prod = -1;
    if ([16/* ) */].includes(l.id) || [0].includes(l.ty)) {
        //mf_plain=>mf_name : mf_value •

        add_reduce(3, 112);
        stack_ptr -= 3;
        prod = 53;
        return;
    }
}
function State429(l: Lexer): void {
    prod = -1;
    if ([12/* ; */, 13/* } */].includes(l.id) || [0].includes(l.ty)) {
        //declaration_list_HC_listbody2_140=>declaration_list_HC_listbody2_140 ; declaration_list_group_1137_139 •

        add_reduce(3, 200);
        stack_ptr -= 3;
        prod = 93;
        return;
    }
}
const idm430: Map<number, (L: Lexer) => void> = new Map();
const _430id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State463(l);
    //
};
idm430.set(16/* ) */, _430id0);
idm430.set(59/* - */, _162id0/* compressed */);
idm430.set(58/* _ */, _162id1/* compressed */);
const tym430: Map<number, (L: Lexer) => void> = new Map();
tym430.set(3/* id */, _162ty0/* compressed */);
tym430.set(2/* num */, _162ty1/* compressed */);
tym430.set(5/* sym */, _162ty2/* compressed */);
tym430.set(1/* ws */, _171ty3/* compressed */);
function State430(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm430.has(l.id)) idm430.get(l.id)(l);
    else if (tym430.has(l.ty)) tym430.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 107:
                State163(l);
                continue;
            case 105:
                State165(l);
                continue;
            case 101:
                State175(l);
                continue;
            case 99:
                State352(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![101, 100].includes(a)) fail(l);
}
function State431(l: Lexer): void {
    prod = -1;
    if ([11/* { */, 12/* ; */, 14/* supports */, 15/* ( */, 16/* ) */, 17/* @ */, 24/* not */, 27/* only */, 28/* : */, 39/* " */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //string=>" " •

        add_reduce(2, 138);
        stack_ptr -= 2;
        prod = 66;
        return;
    }
}
function State432(l: Lexer): void {
    prod = -1;
    if ([16/* ) */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State464(l); return;
        //

    }
}
const idm433: Map<number, (L: Lexer) => void> = new Map();
idm433.set(20/* from */, _0id28/* compressed */);
idm433.set(21/* to */, _0id40/* compressed */);
const tym433: Map<number, (L: Lexer) => void> = new Map();
tym433.set(2/* num */, _46ty0/* compressed */);
function State433(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm433.has(l.id)) idm433.get(l.id)(l);
    else if (tym433.has(l.ty)) tym433.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 63:
                State53(l);
                continue;
            case 21:
                State50(l);
                continue;
            case 20:
                State48(l);
                continue;
            case 19:
                State49(l);
                continue;
            case 16:
                State466(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![17].includes(a)) fail(l);
}
const idm434: Map<number, (L: Lexer) => void> = new Map();
const _434id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State27(l);
    if (prod >= 0) return; else FAILED = false;
    //import=>@ import import_group_012_105 import_group_315_107 •

    add_reduce(4, 38);
    stack_ptr -= 4;
    prod = 14;
    return;
};
idm434.set(60/* $ */, _434id0);
idm434.set(15/* ( */, _10id1/* compressed */);
const _434id2 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State29(l);
    if (prod >= 0) return; else FAILED = false;
    //import=>@ import import_group_012_105 import_group_315_107 •

    add_reduce(4, 38);
    stack_ptr -= 4;
    prod = 14;
    return;
};
idm434.set(59/* - */, _434id2);
idm434.set(24/* not */, _10id3/* compressed */);
idm434.set(27/* only */, _0id35/* compressed */);
const _434id5 = (l: Lexer): void => {//import=>@ import import_group_012_105 import_group_315_107 •

    add_reduce(4, 38);
    stack_ptr -= 4;
    prod = 14;
    return;
};
idm434.set(46/* # */, _434id5);
idm434.set(44/* * */, _434id5);
idm434.set(47/* . */, _434id5);
idm434.set(28/* : */, _434id5);
idm434.set(12/* ; */, _434id5);
idm434.set(17/* @ */, _434id5);
idm434.set(48/* [ */, _434id5);
idm434.set(45/* | */, _434id5);
const tym434: Map<number, (L: Lexer) => void> = new Map();
const _434ty0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State28(l);
    if (prod >= 0) return; else FAILED = false;
    //import=>@ import import_group_012_105 import_group_315_107 •

    add_reduce(4, 38);
    stack_ptr -= 4;
    prod = 14;
    return;
};
tym434.set(3/* id */, _434ty0);
tym434.set(0, _434id5/* compressed */);
function State434(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm434.has(l.id)) idm434.get(l.id)(l);
    else if (tym434.has(l.ty)) tym434.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State25(l);
                continue;
            case 61:
                State15(l);
                continue;
            case 52:
                State24(l);
                continue;
            case 49:
                State23(l);
                continue;
            case 47:
                State20(l);
                continue;
            case 46:
                State17(l);
                continue;
            case 43:
                State19(l);
                continue;
            case 40:
                State18(l);
                continue;
            case 39:
                State16(l);
                continue;
            case 38:
                State13(l);
                continue;
            case 37:
                State12(l);
                continue;
            case 35:
                State14(l);
                continue;
            case 13:
                State467(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![14].includes(a)) fail(l);
}
const idm435: Map<number, (L: Lexer) => void> = new Map();
const _435id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State229(l); return;
    //
};
idm435.set(10/* , */, _435id0);
const _435id1 = (l: Lexer): void => {//import=>@ import import_group_012_105 import_HC_listbody5_108 •

    add_reduce(4, 37);
    stack_ptr -= 4;
    prod = 14;
    return;
};
idm435.set(46/* # */, _435id1);
idm435.set(60/* $ */, _435id1);
idm435.set(44/* * */, _435id1);
idm435.set(59/* - */, _435id1);
idm435.set(47/* . */, _435id1);
idm435.set(28/* : */, _435id1);
idm435.set(12/* ; */, _435id1);
idm435.set(17/* @ */, _435id1);
idm435.set(48/* [ */, _435id1);
idm435.set(45/* | */, _435id1);
const tym435: Map<number, (L: Lexer) => void> = new Map();
tym435.set(0, _435id1/* compressed */);
tym435.set(3/* id */, _435id1/* compressed */);
function State435(l: Lexer): void {
    prod = -1;
    if (idm435.has(l.id)) idm435.get(l.id)(l);
    else if (tym435.has(l.ty)) tym435.get(l.ty)(l);
}
function State436(l: Lexer): void {
    prod = -1;
    if ([15/* ( */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State465(l); return;
        //

    }
}
const idm437: Map<number, (L: Lexer) => void> = new Map();
idm437.set(46/* # */, _0id2/* compressed */);
idm437.set(60/* $ */, _10id0/* compressed */);
idm437.set(44/* * */, _77id2/* compressed */);
idm437.set(59/* - */, _10id2/* compressed */);
idm437.set(47/* . */, _0id13/* compressed */);
idm437.set(28/* : */, _77id5/* compressed */);
idm437.set(48/* [ */, _0id20/* compressed */);
idm437.set(45/* | */, _0id43/* compressed */);
const _437id8 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State485(l);
    //
};
idm437.set(13/* } */, _437id8);
const tym437: Map<number, (L: Lexer) => void> = new Map();
tym437.set(3/* id */, _10ty0/* compressed */);
function State437(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm437.has(l.id)) idm437.get(l.id)(l);
    else if (tym437.has(l.ty)) tym437.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State87(l);
                continue;
            case 90:
                State100(l);
                continue;
            case 89:
                State81(l);
                continue;
            case 86:
                State93(l);
                continue;
            case 84:
                State94(l);
                continue;
            case 82:
                State92(l);
                continue;
            case 81:
                State91(l);
                continue;
            case 80:
                State90(l);
                continue;
            case 79:
                State84(l);
                continue;
            case 78:
                State85(l);
                continue;
            case 77:
                State88(l);
                continue;
            case 75:
                State80(l);
                continue;
            case 74:
                State83(l);
                continue;
            case 73:
                State99(l);
                continue;
            case 71:
                State82(l);
                continue;
            case 70:
                State79(l);
                continue;
            case 8:
                State484(l);
                continue;
            case 6:
                State124(l);
                continue;
            case 5:
                State104(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![23].includes(a)) fail(l);
}
const idm438: Map<number, (L: Lexer) => void> = new Map();
idm438.set(46/* # */, _0id2/* compressed */);
idm438.set(60/* $ */, _10id0/* compressed */);
idm438.set(44/* * */, _77id2/* compressed */);
idm438.set(59/* - */, _10id2/* compressed */);
idm438.set(47/* . */, _0id13/* compressed */);
idm438.set(28/* : */, _77id5/* compressed */);
idm438.set(48/* [ */, _0id20/* compressed */);
idm438.set(45/* | */, _0id43/* compressed */);
const _438id8 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State487(l);
    //
};
idm438.set(13/* } */, _438id8);
const tym438: Map<number, (L: Lexer) => void> = new Map();
tym438.set(3/* id */, _10ty0/* compressed */);
function State438(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm438.has(l.id)) idm438.get(l.id)(l);
    else if (tym438.has(l.ty)) tym438.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State87(l);
                continue;
            case 90:
                State100(l);
                continue;
            case 89:
                State81(l);
                continue;
            case 86:
                State93(l);
                continue;
            case 84:
                State94(l);
                continue;
            case 82:
                State92(l);
                continue;
            case 81:
                State91(l);
                continue;
            case 80:
                State90(l);
                continue;
            case 79:
                State84(l);
                continue;
            case 78:
                State85(l);
                continue;
            case 77:
                State88(l);
                continue;
            case 75:
                State80(l);
                continue;
            case 74:
                State83(l);
                continue;
            case 73:
                State99(l);
                continue;
            case 71:
                State82(l);
                continue;
            case 70:
                State79(l);
                continue;
            case 8:
                State486(l);
                continue;
            case 6:
                State124(l);
                continue;
            case 5:
                State104(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![31].includes(a)) fail(l);
}
function State439(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 12/* ; */, 16/* ) */, 17/* @ */, 22/* and */, 23/* or */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //general_enclosed=>identifier ( general_enclosed_HC_listbody1_124 ) •

        add_reduce(4, 110);
        stack_ptr -= 4;
        prod = 52;
        return;
    }
}
function State440(l: Lexer): void {
    prod = -1;
    if ([13/* } */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State468(l); return;
        //

    }
}
function State441(l: Lexer): void {
    prod = -1;
    if ([13/* } */, 20/* from */, 21/* to */].includes(l.id) || [0, 2/* num */].includes(l.ty)) {
        //keyframes_blocks=>keyframes_blocks_HC_listbody1_110 { declaration_list } •

        add_reduce(4, 49);
        stack_ptr -= 4;
        prod = 20;
        return;
    }
}
const idm442: Map<number, (L: Lexer) => void> = new Map();
const _442id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State345(l); return;
    if (prod >= 0) return; else FAILED = false;
    //declaration_list=>declaration_list_HC_listbody2_140 declaration_list_HC_listbody1_141 •

    add_reduce(2, 204);
    stack_ptr -= 2;
    prod = 95;
    return;
};
idm442.set(12/* ; */, _442id0);
const _442id1 = (l: Lexer): void => {//declaration_list=>declaration_list_HC_listbody2_140 declaration_list_HC_listbody1_141 •

    add_reduce(2, 204);
    stack_ptr -= 2;
    prod = 95;
    return;
};
idm442.set(13/* } */, _442id1);
function State442(l: Lexer): void {
    prod = -1;
    if (idm442.has(l.id)) idm442.get(l.id)(l);
}
const idm443: Map<number, (L: Lexer) => void> = new Map();
idm443.set(60/* $ */, _10id0/* compressed */);
idm443.set(59/* - */, _10id2/* compressed */);
const _443id2 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State144(l);
    if (prod >= 0) return; else FAILED = false;
    //declaration_list_HC_listbody1_141=>; •

    add_reduce(1, 203);
    stack_ptr -= 1;
    prod = 94;
    return;
};
idm443.set(12/* ; */, _443id2);
const _443id3 = (l: Lexer): void => {//declaration_list_HC_listbody1_141=>; •

    add_reduce(1, 203);
    stack_ptr -= 1;
    prod = 94;
    return;
};
idm443.set(13/* } */, _443id3);
const tym443: Map<number, (L: Lexer) => void> = new Map();
tym443.set(3/* id */, _10ty0/* compressed */);
function State443(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm443.has(l.id)) idm443.get(l.id)(l);
    else if (tym443.has(l.ty)) tym443.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 104:
                State45(l);
                continue;
            case 103:
                State161(l);
                continue;
            case 98:
                State160(l);
                continue;
            case 96:
                State159(l);
                continue;
            case 92:
                State429(l);
                continue;
            case 91:
                State158(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![93, 94].includes(a)) fail(l);
}
function State444(l: Lexer): void {
    prod = -1;
    if ([12/* ; */, 13/* } */, 16/* ) */].includes(l.id) || [0].includes(l.ty)) {
        //declaration=>declaration_id : declaration_values declaration_group_1140_142 •

        add_reduce(4, 208);
        stack_ptr -= 4;
        prod = 98;
        return;
    }
}
function State445(l: Lexer): void {
    prod = -1;
    if ([57/* important */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State470(l); return;
        //

    }
}
function State446(l: Lexer): void {
    prod = -1;
    if ([11/* { */, 16/* ) */, 22/* and */, 23/* or */].includes(l.id) || [0].includes(l.ty)) {
        //supports_feature_fn=>selector ( COMPLEX_SELECTOR ) •

        add_reduce(4, 69);
        stack_ptr -= 4;
        prod = 30;
        return;
    }
}
function State447(l: Lexer): void {
    prod = -1;
    if ([16/* ) */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State469(l); return;
        //

    }
}
function State448(l: Lexer): void {
    prod = -1;
    if ([13/* } */, 17/* @ */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //STYLE_RULE=>STYLE_RULE_HC_listbody2_103 { ; } •

        add_reduce(4, 14);
        stack_ptr -= 4;
        prod = 6;
        return;
    }
}
function State449(l: Lexer): void {
    prod = -1;
    if ([39/* " */, 59/* - */, 60/* $ */].includes(l.id) || [3/* id */].includes(l.ty)) {
        //ATTR_MATCHER=>~ = •

        add_reduce(2, 185);
        stack_ptr -= 2;
        prod = 87;
        return;
    }
}
function State450(l: Lexer): void {
    prod = -1;
    if ([13/* } */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State471(l); return;
        //

    }
}
function State451(l: Lexer): void {
    prod = -1;
    if ([13/* } */, 17/* @ */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //STYLE_RULE=>STYLE_RULE_HC_listbody2_103 { declaration_list } •

        add_reduce(4, 15);
        stack_ptr -= 4;
        prod = 6;
        return;
    }
}
const idm452: Map<number, (L: Lexer) => void> = new Map();
idm452.set(60/* $ */, _10id0/* compressed */);
idm452.set(59/* - */, _10id2/* compressed */);
const tym452: Map<number, (L: Lexer) => void> = new Map();
tym452.set(3/* id */, _10ty0/* compressed */);
tym452.set(2/* num */, _22ty1/* compressed */);
function State452(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm452.has(l.id)) idm452.get(l.id)(l);
    else if (tym452.has(l.ty)) tym452.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State121(l);
                continue;
            case 64:
                State118(l);
                continue;
            case 62:
                State120(l);
                continue;
            case 60:
                State119(l);
                continue;
            case 58:
                State473(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![57].includes(a)) fail(l);
}
function State453(l: Lexer): void {
    prod = -1;
    if ([59/* - */, 60/* $ */].includes(l.id) || [2/* num */, 3/* id */].includes(l.ty)) {
        //mf_range_group_085_127=>< •

        stack_ptr -= 1;
        prod = 56;
        return;
    }
}
function State454(l: Lexer): void {
    prod = -1;
    if ([59/* - */, 60/* $ */].includes(l.id) || [2/* num */, 3/* id */].includes(l.ty)) {
        //mf_range_group_085_127=><= •

        stack_ptr -= 1;
        prod = 56;
        return;
    }
}
const idm455: Map<number, (L: Lexer) => void> = new Map();
idm455.set(60/* $ */, _10id0/* compressed */);
idm455.set(59/* - */, _10id2/* compressed */);
const tym455: Map<number, (L: Lexer) => void> = new Map();
tym455.set(3/* id */, _10ty0/* compressed */);
tym455.set(2/* num */, _22ty1/* compressed */);
function State455(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm455.has(l.id)) idm455.get(l.id)(l);
    else if (tym455.has(l.ty)) tym455.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State121(l);
                continue;
            case 64:
                State118(l);
                continue;
            case 62:
                State120(l);
                continue;
            case 60:
                State119(l);
                continue;
            case 58:
                State472(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![57].includes(a)) fail(l);
}
function State456(l: Lexer): void {
    prod = -1;
    if ([59/* - */, 60/* $ */].includes(l.id) || [2/* num */, 3/* id */].includes(l.ty)) {
        //mf_range_group_080_126=>> •

        stack_ptr -= 1;
        prod = 55;
        return;
    }
}
function State457(l: Lexer): void {
    prod = -1;
    if ([59/* - */, 60/* $ */].includes(l.id) || [2/* num */, 3/* id */].includes(l.ty)) {
        //mf_range_group_080_126=>>= •

        stack_ptr -= 1;
        prod = 55;
        return;
    }
}
const idm458: Map<number, (L: Lexer) => void> = new Map();
idm458.set(46/* # */, _0id2/* compressed */);
idm458.set(60/* $ */, _10id0/* compressed */);
idm458.set(44/* * */, _77id2/* compressed */);
idm458.set(59/* - */, _10id2/* compressed */);
idm458.set(47/* . */, _0id13/* compressed */);
idm458.set(28/* : */, _77id5/* compressed */);
idm458.set(17/* @ */, _131id6/* compressed */);
idm458.set(48/* [ */, _0id20/* compressed */);
idm458.set(45/* | */, _0id43/* compressed */);
const tym458: Map<number, (L: Lexer) => void> = new Map();
tym458.set(3/* id */, _10ty0/* compressed */);
const _458ty1 = (l: Lexer): void => {//STYLE_SHEET=>STYLE_SHEET_HC_listbody1_100 STYLE_SHEET_HC_listbody1_102 •

    add_reduce(2, 7);
    stack_ptr -= 2;
    prod = 4;
    return;
};
tym458.set(0, _458ty1);
function State458(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm458.has(l.id)) idm458.get(l.id)(l);
    else if (tym458.has(l.ty)) tym458.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State87(l);
                continue;
            case 90:
                State100(l);
                continue;
            case 89:
                State81(l);
                continue;
            case 86:
                State93(l);
                continue;
            case 84:
                State94(l);
                continue;
            case 82:
                State92(l);
                continue;
            case 81:
                State91(l);
                continue;
            case 80:
                State90(l);
                continue;
            case 79:
                State84(l);
                continue;
            case 78:
                State85(l);
                continue;
            case 77:
                State88(l);
                continue;
            case 75:
                State80(l);
                continue;
            case 74:
                State83(l);
                continue;
            case 73:
                State99(l);
                continue;
            case 71:
                State82(l);
                continue;
            case 70:
                State79(l);
                continue;
            case 31:
                State5(l);
                continue;
            case 23:
                State8(l);
                continue;
            case 17:
                State7(l);
                continue;
            case 14:
                State6(l);
                continue;
            case 9:
                State135(l);
                continue;
            case 6:
                State134(l);
                continue;
            case 5:
                State104(l);
                continue;
            case 2:
                State354(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![4, 3].includes(a)) fail(l);
}
const idm459: Map<number, (L: Lexer) => void> = new Map();
idm459.set(12/* ; */, _6id0/* compressed */);
const _459id1 = (l: Lexer): void => {//STYLE_SHEET_HC_listbody1_100=>STYLE_SHEET_HC_listbody1_100 import •  :  AT_RULE=>import •

    add_reduce(2, 1);
    stack_ptr -= 2;
    prod = 1;
    return;
    stack_ptr -= 1;
    prod = 9;
    return;
};
idm459.set(46/* # */, _459id1);
idm459.set(60/* $ */, _459id1);
idm459.set(44/* * */, _459id1);
idm459.set(59/* - */, _459id1);
idm459.set(47/* . */, _459id1);
idm459.set(28/* : */, _459id1);
idm459.set(17/* @ */, _459id1);
idm459.set(48/* [ */, _459id1);
idm459.set(45/* | */, _459id1);
const tym459: Map<number, (L: Lexer) => void> = new Map();
tym459.set(0, _459id1/* compressed */);
tym459.set(3/* id */, _459id1/* compressed */);
function State459(l: Lexer): void {
    prod = -1;
    if (idm459.has(l.id)) idm459.get(l.id)(l);
    else if (tym459.has(l.ty)) tym459.get(l.ty)(l);
}
const idm460: Map<number, (L: Lexer) => void> = new Map();
const _460id0 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State476(l);
    //
};
idm460.set(49/* ] */, _460id0);
idm460.set(54/* i */, _0id29/* compressed */);
idm460.set(55/* s */, _0id37/* compressed */);
function State460(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm460.has(l.id)) idm460.get(l.id)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 88:
                State475(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![86].includes(a)) fail(l);
}
function State461(l: Lexer): void {
    prod = -1;
    if ([49/* ] */, 54/* i */, 55/* s */].includes(l.id)) {
        //ATTRIBUTE_SELECTOR_group_2125_137=>identifier •

        stack_ptr -= 1;
        prod = 85;
        return;
    }
}
function State462(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if ([39/* " */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State365(l);
        //

    }
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 66:
                State474(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![85].includes(a)) fail(l);
}
function State463(l: Lexer): void {
    prod = -1;
    if ([12/* ; */, 13/* } */, 15/* ( */, 16/* ) */, 56/* ! */, 58/* _ */, 59/* - */].includes(l.id) || [0, 1/* ws */, 2/* num */, 3/* id */, 5/* sym */].includes(l.ty)) {
        //declaration_values=>declaration_values ( declaration_values_HC_listbody1_144 ) •

        add_reduce(4, 216);
        stack_ptr -= 4;
        prod = 101;
        return;
    }
}
function State464(l: Lexer): void {
    prod = -1;
    if ([12/* ; */, 14/* supports */, 15/* ( */, 17/* @ */, 24/* not */, 27/* only */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //url=>url ( ) •

        add_reduce(3, 137);
        stack_ptr -= 3;
        prod = 65;
        return;
    }
}
const idm465: Map<number, (L: Lexer) => void> = new Map();
idm465.set(60/* $ */, _10id0/* compressed */);
idm465.set(15/* ( */, _31id1/* compressed */);
idm465.set(59/* - */, _10id2/* compressed */);
idm465.set(24/* not */, _31id3/* compressed */);
idm465.set(25/* selector */, _0id38/* compressed */);
const tym465: Map<number, (L: Lexer) => void> = new Map();
tym465.set(3/* id */, _10ty0/* compressed */);
function State465(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm465.has(l.id)) idm465.get(l.id)(l);
    else if (tym465.has(l.ty)) tym465.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 104:
                State45(l);
                continue;
            case 103:
                State43(l);
                continue;
            case 102:
                State42(l);
                continue;
            case 98:
                State44(l);
                continue;
            case 52:
                State38(l);
                continue;
            case 30:
                State39(l);
                continue;
            case 29:
                State40(l);
                continue;
            case 28:
                State37(l);
                continue;
            case 27:
                State35(l);
                continue;
            case 26:
                State32(l);
                continue;
            case 15:
                State33(l);
                continue;
            case 11:
                State480(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![12].includes(a)) fail(l);
}
const idm466: Map<number, (L: Lexer) => void> = new Map();
idm466.set(20/* from */, _0id28/* compressed */);
idm466.set(21/* to */, _0id40/* compressed */);
const _466id2 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State479(l);
    //
};
idm466.set(13/* } */, _466id2);
const tym466: Map<number, (L: Lexer) => void> = new Map();
tym466.set(2/* num */, _46ty0/* compressed */);
function State466(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm466.has(l.id)) idm466.get(l.id)(l);
    else if (tym466.has(l.ty)) tym466.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 63:
                State53(l);
                continue;
            case 21:
                State50(l);
                continue;
            case 20:
                State255(l);
                continue;
            case 19:
                State49(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![17, 16].includes(a)) fail(l);
}
const idm467: Map<number, (L: Lexer) => void> = new Map();
idm467.set(10/* , */, _435id0/* compressed */);
const _467id1 = (l: Lexer): void => {//import=>@ import import_group_012_105 import_group_315_107 import_HC_listbody5_108 •

    add_reduce(5, 36);
    stack_ptr -= 5;
    prod = 14;
    return;
};
idm467.set(46/* # */, _467id1);
idm467.set(60/* $ */, _467id1);
idm467.set(44/* * */, _467id1);
idm467.set(59/* - */, _467id1);
idm467.set(47/* . */, _467id1);
idm467.set(28/* : */, _467id1);
idm467.set(12/* ; */, _467id1);
idm467.set(17/* @ */, _467id1);
idm467.set(48/* [ */, _467id1);
idm467.set(45/* | */, _467id1);
const tym467: Map<number, (L: Lexer) => void> = new Map();
tym467.set(0, _467id1/* compressed */);
tym467.set(3/* id */, _467id1/* compressed */);
function State467(l: Lexer): void {
    prod = -1;
    if (idm467.has(l.id)) idm467.get(l.id)(l);
    else if (tym467.has(l.ty)) tym467.get(l.ty)(l);
}
function State468(l: Lexer): void {
    prod = -1;
    if ([13/* } */, 20/* from */, 21/* to */].includes(l.id) || [0, 2/* num */].includes(l.ty)) {
        //keyframes_blocks=>keyframes_blocks_HC_listbody1_110 { declaration_list ; } •

        add_reduce(5, 48);
        stack_ptr -= 5;
        prod = 20;
        return;
    }
}
function State469(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 16/* ) */, 28/* : */, 40/* > */, 41/* + */, 42/* ~ */, 43/* || */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //PSEUDO_CLASS_SELECTOR_group_2121_136=>( string ) •

        add_reduce(3, 177);
        stack_ptr -= 3;
        prod = 83;
        return;
    }
}
function State470(l: Lexer): void {
    prod = -1;
    if ([12/* ; */, 13/* } */, 16/* ) */].includes(l.id) || [0].includes(l.ty)) {
        //declaration_group_1140_142=>! important •

        add_reduce(2, 207);
        stack_ptr -= 2;
        prod = 97;
        return;
    }
}
function State471(l: Lexer): void {
    prod = -1;
    if ([13/* } */, 17/* @ */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //STYLE_RULE=>STYLE_RULE_HC_listbody2_103 { declaration_list ; } •

        add_reduce(5, 13);
        stack_ptr -= 5;
        prod = 6;
        return;
    }
}
function State472(l: Lexer): void {
    prod = -1;
    if ([16/* ) */].includes(l.id) || [0].includes(l.ty)) {
        //mf_range=>mf_value mf_range_group_080_126 identifier mf_range_group_080_126 mf_value •

        add_reduce(5, 124);
        stack_ptr -= 5;
        prod = 57;
        return;
    }
}
function State473(l: Lexer): void {
    prod = -1;
    if ([16/* ) */].includes(l.id) || [0].includes(l.ty)) {
        //mf_range=>mf_value mf_range_group_085_127 identifier mf_range_group_085_127 mf_value •

        add_reduce(5, 125);
        stack_ptr -= 5;
        prod = 57;
        return;
    }
}
function State474(l: Lexer): void {
    prod = -1;
    if ([39/* " */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State481(l); return;
        //

    }
}
function State475(l: Lexer): void {
    prod = -1;
    if ([49/* ] */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State482(l); return;
        //

    }
}
function State476(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 16/* ) */, 28/* : */, 40/* > */, 41/* + */, 42/* ~ */, 43/* || */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //ATTRIBUTE_SELECTOR=>[ WQ_NAME ATTR_MATCHER ATTRIBUTE_SELECTOR_group_2125_137 ] •

        add_reduce(5, 184);
        stack_ptr -= 5;
        prod = 86;
        return;
    }
}
function State477(l: Lexer): void {
    prod = -1;
    if ([49/* ] */].includes(l.id)) {
        //ATTR_MODIFIER=>i •

        stack_ptr -= 1;
        prod = 88;
        return;
    }
}
function State478(l: Lexer): void {
    prod = -1;
    if ([49/* ] */].includes(l.id)) {
        //ATTR_MODIFIER=>s •

        stack_ptr -= 1;
        prod = 88;
        return;
    }
}
function State479(l: Lexer): void {
    prod = -1;
    if ([12/* ; */, 17/* @ */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //keyframes=>@ keyframes keyframes_name { keyframes_HC_listbody5_109 } •

        add_reduce(6, 43);
        stack_ptr -= 6;
        prod = 17;
        return;
    }
}
function State480(l: Lexer): void {
    prod = -1;
    if ([16/* ) */].includes(l.id)) {
        _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
        State483(l); return;
        //

    }
}
function State481(l: Lexer): void {
    prod = -1;
    if ([49/* ] */, 54/* i */, 55/* s */].includes(l.id)) {
        //ATTRIBUTE_SELECTOR_group_2125_137=>" string " •

        add_reduce(3, 181);
        stack_ptr -= 3;
        prod = 85;
        return;
    }
}
function State482(l: Lexer): void {
    prod = -1;
    if ([10/* , */, 11/* { */, 16/* ) */, 28/* : */, 40/* > */, 41/* + */, 42/* ~ */, 43/* || */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //ATTRIBUTE_SELECTOR=>[ WQ_NAME ATTR_MATCHER ATTRIBUTE_SELECTOR_group_2125_137 ATTR_MODIFIER ] •

        add_reduce(6, 183);
        stack_ptr -= 6;
        prod = 86;
        return;
    }
}
function State483(l: Lexer): void {
    prod = -1;
    if ([12/* ; */, 15/* ( */, 17/* @ */, 24/* not */, 27/* only */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //import_group_315_107=>supports ( import_group_014_106 ) •

        add_reduce(4, 33);
        stack_ptr -= 4;
        prod = 12;
        return;
    }
}
const idm484: Map<number, (L: Lexer) => void> = new Map();
idm484.set(46/* # */, _0id2/* compressed */);
idm484.set(60/* $ */, _10id0/* compressed */);
idm484.set(44/* * */, _77id2/* compressed */);
idm484.set(59/* - */, _10id2/* compressed */);
idm484.set(47/* . */, _0id13/* compressed */);
idm484.set(28/* : */, _77id5/* compressed */);
idm484.set(48/* [ */, _0id20/* compressed */);
idm484.set(45/* | */, _0id43/* compressed */);
const _484id8 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State488(l);
    //
};
idm484.set(13/* } */, _484id8);
const tym484: Map<number, (L: Lexer) => void> = new Map();
tym484.set(3/* id */, _10ty0/* compressed */);
function State484(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm484.has(l.id)) idm484.get(l.id)(l);
    else if (tym484.has(l.ty)) tym484.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State87(l);
                continue;
            case 90:
                State100(l);
                continue;
            case 89:
                State81(l);
                continue;
            case 86:
                State93(l);
                continue;
            case 84:
                State94(l);
                continue;
            case 82:
                State92(l);
                continue;
            case 81:
                State91(l);
                continue;
            case 80:
                State90(l);
                continue;
            case 79:
                State84(l);
                continue;
            case 78:
                State85(l);
                continue;
            case 77:
                State88(l);
                continue;
            case 75:
                State80(l);
                continue;
            case 74:
                State83(l);
                continue;
            case 73:
                State99(l);
                continue;
            case 71:
                State82(l);
                continue;
            case 70:
                State79(l);
                continue;
            case 6:
                State355(l);
                continue;
            case 5:
                State104(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![23, 8].includes(a)) fail(l);
}
function State485(l: Lexer): void {
    prod = -1;
    if ([12/* ; */, 17/* @ */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //supports=>@ supports supports_group_025_111 { } •

        add_reduce(5, 55);
        stack_ptr -= 5;
        prod = 23;
        return;
    }
}
const idm486: Map<number, (L: Lexer) => void> = new Map();
idm486.set(46/* # */, _0id2/* compressed */);
idm486.set(60/* $ */, _10id0/* compressed */);
idm486.set(44/* * */, _77id2/* compressed */);
idm486.set(59/* - */, _10id2/* compressed */);
idm486.set(47/* . */, _0id13/* compressed */);
idm486.set(28/* : */, _77id5/* compressed */);
idm486.set(48/* [ */, _0id20/* compressed */);
idm486.set(45/* | */, _0id43/* compressed */);
const _486id8 = (l: Lexer): void => {
    _(l, /* e.eh, */[4/* nl */, 1/* ws */, 1/* ws */, 4/* nl */]); stack_ptr++;
    State489(l);
    //
};
idm486.set(13/* } */, _486id8);
const tym486: Map<number, (L: Lexer) => void> = new Map();
tym486.set(3/* id */, _10ty0/* compressed */);
function State486(l: Lexer): void {
    const sp: u32 = stack_ptr;
    prod = -1;
    if (idm486.has(l.id)) idm486.get(l.id)(l);
    else if (tym486.has(l.ty)) tym486.get(l.ty)(l);
    var a: i32 = prod;
    while (1) {
        if (prod >= 0) a = prod;
        if (sp > stack_ptr) break; else stack_ptr += 1;
        prod = -1;
        switch (a) {
            case 103:
                State26(l);
                continue;
            case 102:
                State87(l);
                continue;
            case 90:
                State100(l);
                continue;
            case 89:
                State81(l);
                continue;
            case 86:
                State93(l);
                continue;
            case 84:
                State94(l);
                continue;
            case 82:
                State92(l);
                continue;
            case 81:
                State91(l);
                continue;
            case 80:
                State90(l);
                continue;
            case 79:
                State84(l);
                continue;
            case 78:
                State85(l);
                continue;
            case 77:
                State88(l);
                continue;
            case 75:
                State80(l);
                continue;
            case 74:
                State83(l);
                continue;
            case 73:
                State99(l);
                continue;
            case 71:
                State82(l);
                continue;
            case 70:
                State79(l);
                continue;
            case 6:
                State355(l);
                continue;
            case 5:
                State104(l);
                continue;
        }
        break;
    }
    if (sp <= stack_ptr) prod = a;
    if (![31, 8].includes(a)) fail(l);
}
function State487(l: Lexer): void {
    prod = -1;
    if ([12/* ; */, 17/* @ */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //media=>@ media media_queries { } •

        add_reduce(5, 71);
        stack_ptr -= 5;
        prod = 31;
        return;
    }
}
function State488(l: Lexer): void {
    prod = -1;
    if ([12/* ; */, 17/* @ */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //supports=>@ supports supports_group_025_111 { GROUP_RULE_BODY } •

        add_reduce(6, 54);
        stack_ptr -= 6;
        prod = 23;
        return;
    }
}
function State489(l: Lexer): void {
    prod = -1;
    if ([12/* ; */, 17/* @ */, 28/* : */, 44/* * */, 45/* | */, 46/* # */, 47/* . */, 48/* [ */, 59/* - */, 60/* $ */].includes(l.id) || [0, 3/* id */].includes(l.ty)) {
        //media=>@ media media_queries { GROUP_RULE_BODY } •

        add_reduce(6, 70);
        stack_ptr -= 6;
        prod = 31;
        return;
    }
}

export class Export {

    FAILED: boolean;

    er: Uint32Array;

    aa: Uint32Array;

    constructor(f: boolean, er: Uint32Array, aa: Uint32Array) {
        this.FAILED = f;
        this.er = er;
        this.aa = aa;
    }

    getFailed(): boolean { return this.FAILED; }

    getActionList(): Uint32Array { return this.aa; }

    getErrorOffsets(): Uint32Array { return this.er; }
}

export default function main(input_string: string): Export {

    str = input_string;

    const lex = new Lexer();

    lex.next();

    prod = -1;

    stack_ptr = 0;

    error_ptr = 0;

    pointer = 0;

    FAILED = false;

    $CSS(lex);

    action_array[pointer++] = 0;

    return new Export(
        FAILED || !lex.END,
        error_array.subarray(0, error_ptr),
        action_array.subarray(0, pointer)
    );
}