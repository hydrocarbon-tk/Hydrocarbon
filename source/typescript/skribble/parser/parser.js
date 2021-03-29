import { ParserFactory } from "@candlefw/hydrocarbon";

const data = (() => {

    const lookup_table = new Uint8Array(382976);
    const sequence_lookup = [59, 123, 125, 58, 40, 41, 44, 61, 61, 46, 91, 93, 95, 36, 92, 34, 39, 47, 42, 47, 60, 60, 45, 45, 45, 62, 62, 48, 120, 105, 109, 112, 111, 114, 116, 110, 117, 108, 108, 99, 111, 110, 116, 105, 110, 117, 101, 115, 116, 114, 105, 110, 103, 102, 97, 108, 115, 101, 120, 112, 111, 114, 116, 108, 111, 111, 112, 109, 97, 116, 99, 104, 98, 114, 101, 97, 107, 114, 101, 116, 117, 114, 110, 117, 105, 110, 116, 56, 49, 50, 56, 51, 50, 54, 52, 116, 114, 117, 101, 112, 114, 105, 118, 100, 65, 66, 67, 68, 69, 70, 53, 55, 47, 47, 48, 98, 105, 109, 117, 116, 110, 115, 99, 108, 115, 102, 108, 116, 101, 108, 115, 101, 49, 54, 112, 117, 98, 48, 111, 48, 79, 105, 115, 105, 102, 110];
    const TokenSpace = 1;
    const TokenNewLine = 2;
    const TokenSymbol = 4;
    const TokenNumber = 8;
    const TokenIdentifier = 16;
    const TokenIdentifierUnicode = (1 << 8) | TokenIdentifier;
    const TokenFullNumber = (2 << 8) | TokenNumber;
    const UNICODE_ID_START = 16;
    const UNICODE_ID_CONTINUE = 32;
    //[javascript_only]
    function print(l, s) {
        //console.log([...s.input.slice(l.byte_offset, l.byte_offset+5)].map(i=>String.fromCharCode(i)).join(""))
    }

    function compare(data, data_offset, sequence_offset, length) {
        let i = data_offset;
        let j = sequence_offset;
        let len = j + length;

        for (; j < len; i++, j++)
            if (data.input[i] != sequence_lookup[j]) return j - sequence_offset;

        return length;
    }

    function cmpr_set(l, data, sequence_offset, length, tk_len) {
        if (length == compare(data, l.byte_offset, sequence_offset, length)) {
            l.byte_length = length;
            l.token_length = tk_len;
            return true;
        }
        return false;
    }

    function getUTF8ByteLengthFromCodePoint(code_point) {

        if (code_point == 0) {
            return 1;
        } else if ((code_point & 0x7F) == code_point) {
            return 1;
        } else if ((code_point & 0x7FF) == code_point) {
            return 2;
        } else if ((code_point & 0xFFFF) == code_point) {
            return 3;
        } else {
            return 4;
        }
    }



    function utf8ToCodePoint(offset, data) {

        let buffer = data.input;

        let index = offset;

        const a = buffer[index];

        let flag = 0xE;

        if (a & 0x80) {

            flag = a & 0xF0;

            const b = buffer[index + 1];

            if (flag & 0xE0) {

                flag = a & 0xF8;

                const c = buffer[index + 2];

                if (flag == 0xF0) {
                    return ((a & 0x7) << 18) | ((b & 0x3F) << 12) | ((c & 0x3F) << 6) | (buffer[index + 3] & 0x3F);
                }

                else if (flag == 0xE0) {
                    return ((a & 0xF) << 12) | ((b & 0x3F) << 6) | (c & 0x3F);
                }

            } else if (flag == 0xC) {
                return ((a & 0x1F) << 6) | b & 0x3F;
            }

        } else return a;

        return 0;
    }

    function getTypeAt(code_point) {
        switch (lookup_table[code_point] & 0xF) {
            case 0:
                return TokenSymbol;
            case 1:
                return TokenIdentifier;
            case 2:
                return TokenSpace;
            case 3:
            case 4:
                return TokenNewLine;
            case 5:
                return TokenNumber;
        }
        return TokenSymbol;
    }

    class Lexer {

        constructor() {
            this.byte_offset = 0;      //32
            this.byte_length = 0;      //16

            this.token_length = 0;      //16
            this.token_offset = 0;      //16
            this.prev_token_offset = 0; //32

            this.type = 0;             //16
            this.current_byte = 0;     //16
        }

        // Returns false if the symbol following
        // the byte length is assert_class type
        isDiscrete(data, assert_class, offset = 0, USE_UNICODE = false) {

            let type = 0;

            offset += this.byte_offset;

            if (offset >= data.input_len) return true;

            let current_byte = data.input[offset];

            if (!USE_UNICODE || current_byte < 128) {
                type = getTypeAt(current_byte);
            } else {
                type = getTypeAt(utf8ToCodePoint(offset, data));
            }

            return (type & assert_class) == 0;
        }

        setToken(type, byte_length, token_length) {
            this.type = type;
            this.byte_length = byte_length;
            this.token_length = token_length;
        }

        getType(USE_UNICODE, data) {

            if (this.END(data)) return 0;

            if (this.type == 0) {
                if (!USE_UNICODE || this.current_byte < 128) {
                    this.type = getTypeAt(this.current_byte);
                } else {
                    const code_point = utf8ToCodePoint(this.byte_offset, data);
                    this.byte_length += getUTF8ByteLengthFromCodePoint(code_point) - 1;
                    this.type = getTypeAt(code_point);
                }
            }
            return this.type;
        }


        isSym(USE_UNICODE, data) {
            return !this.END(data) && this.getType(USE_UNICODE, data) == TokenSymbol;
        }

        isNL() {
            return this.current_byte == 10 || this.current_byte == 13;
        }

        isSP(USE_UNICODE, data) {
            return this.current_byte == 32 || USE_UNICODE && TokenSpace == this.getType(USE_UNICODE, data);
        }

        isNum(data) {
            if (this.type == 0 || this.type == TokenNumber) {
                if (this.getType(false, data) == TokenNumber) {
                    const l = data.input_len;
                    let off = this.byte_offset;
                    while ((++off < l) && 47 < data.input[off] && data.input[off] < 58) {
                        this.byte_length++;
                        this.token_length++;
                    }
                    this.type = TokenFullNumber;
                    return true;
                }
                else
                    return false;
            }
            else
                return this.type == TokenFullNumber;
        }

        isUniID(data) {
            if (this.type == 0 || this.type == TokenIdentifier) {
                if (this.getType(true, data) == TokenIdentifier) {
                    const l = data.input_len;
                    let off = this.byte_offset + this.byte_length;
                    let code_point = utf8ToCodePoint(off, data);
                    while (
                        (off < l)
                        && ((UNICODE_ID_START | UNICODE_ID_CONTINUE) & lookup_table[code_point]) > 0
                    ) {
                        off += getUTF8ByteLengthFromCodePoint(code_point);
                        code_point = utf8ToCodePoint(off, data);
                        this.token_length++;
                    }
                    this.byte_length = off - this.byte_offset;
                    this.type = TokenIdentifierUnicode;
                    return true;
                } else
                    return false;
            } else return this.type == TokenIdentifierUnicode;
        }

        copy() {
            const destination = new Lexer();
            destination.byte_offset = this.byte_offset;
            destination.byte_length = this.byte_length;

            destination.token_length = this.token_length;
            destination.token_offset = this.token_offset;
            destination.prev_token_offset = this.prev_token_offset;

            destination.type = this.type;
            destination.current_byte = this.current_byte;
            return destination;
        }

        slice(source) {
            this.byte_length = this.byte_offset - source.byte_offset;
            this.token_length = this.token_offset - source.token_offset;
            this.byte_offset = source.byte_offset;
            this.token_offset = source.token_offset;
            return this;
        }

        sync(source) {
            this.byte_offset = source.byte_offset;
            this.byte_length = source.byte_length;

            this.token_length = source.token_length;
            this.token_offset = source.token_offset;
            this.prev_token_offset = source.prev_token_offset;

            this.type = source.type;
            this.current_byte = source.current_byte;
            return this;
        }

        next(data) {

            this.byte_offset += this.byte_length;
            this.token_offset += this.token_length;

            if (data.input_len < this.byte_offset) {
                this.type = 0;
                this.byte_length = 0;
                this.token_length = 0;
            } else {
                this.current_byte = data.input[this.byte_offset];
                this.type = 0;
                this.byte_length = 1;
                this.token_length = 1;
            }

            return this;
        }

        END(data) {
            return this.byte_offset >= data.input_len;
        }

    }

    function assert_ascii(l, a, b, c, d) {
        const ascii = l.current_byte;
        if (ascii < 32) {
            return (a & (1 << ascii)) != 0;
        } else if (ascii < 64) {
            return (b & (1 << (ascii - 32))) != 0;
        } else if (ascii < 96) {
            return (c & (1 << (ascii - 64))) != 0;
        } else if (ascii < 128) {
            return (d & (1 << (ascii - 96))) != 0;
        }
        return false;
    }



    function fork(data) {

        let
            rules = new Uint32Array(data.rules_len),
            error = new Uint8Array(data.error_len - data.error_ptr),
            debug = new Uint16Array(data.debug_len - data.debug_ptr);

        const fork = {
            lexer: data.lexer.copy(),
            state: data.state,
            prop: data.prop,
            stack_ptr: data.stack_ptr,
            input_ptr: data.input_ptr,
            rules_ptr: 0,
            error_ptr: 0,
            debug_ptr: 0,
            input_len: data.input_len,
            rules_len: data.rules_len,
            error_len: data.error_len,
            debug_len: data.debug_len,
            input: data.input,
            rules: rules,
            error: error,
            debug: debug,
            stash: data.stash.slice(),
            stack: data.stack.slice(),
            origin_fork: data.rules_ptr + data.origin_fork,
            origin: data,
            alternate: null
        };

        while (data.alternate) {
            data = data.alternate;
        }

        data.alternate = fork;

        return fork;
    }

    function init_data(input_len, rules_len, error_len, debug_len) {

        let
            input = new Uint8Array(input_len),
            rules = new Uint16Array(rules_len),
            error = new Uint8Array(error_len),
            debug = new Uint16Array(debug_len),
            stack = [],
            stash = [];

        return {
            valid: false,
            lexer: new Lexer,
            state: createState(true),
            prop: 0,
            stack_ptr: 0,
            input_ptr: 0,
            rules_ptr: 0,
            input_len: input_len,
            rules_len: rules_len,
            input: input,
            rules: rules,
            stash: stash,
            stack: stack,
            origin_fork: 0,
            origin: null,
            alternate: null
        };
    }


    function block64Consume(data, block, offset, block_offset, limit) {
        //Find offset block

        let containing_data = data,
            end = containing_data.origin_fork + data.rules_ptr;

        //Find closest root
        while (containing_data.origin_fork > offset) {
            end = containing_data.origin_fork;
            containing_data = containing_data.origin;
        }

        let start = containing_data.origin_fork;

        offset -= start;
        end -= start;

        //Fill block with new data
        let ptr = offset;

        if (ptr >= end) return limit - block_offset;

        while (block_offset < limit) {
            block[block_offset++] = containing_data.rules[ptr++];
            if (ptr >= end)
                return block64Consume(data, block, ptr + start, block_offset, limit);
        }
        return 0;
    }

    /**
     *  Rules payload
     * 
     *  Assuming Little Endian
     * 
     *  Reduce
     *  0 . . . | . . . 7 . . . | . . . 16
     *  ||__||_||________________________|   
     *   |    |____________       \___________________ 
     *   |                 \                         \
     *   Byte Identifier:   Overflow Bit:               Payload: 
     *   0 Reduce           If set then body id is set    No Overflow: 5 bits for reduce size and 8 bits for body index
     *                      on next 16 byte segment       Overflow: 13 bits for reduce size and next 16bits for body index
     * 
     *  Shift
     *  0 . . . | . . . 7 . . . | . . . 16
     *  ||__||_||________________________|   
     *   |    |____________       \___________________ 
     *   |                 \                         \
     *   Byte Identifier:   Overflow Bit:               Payload: 
     *   1 Shift            If set then add payload     No Overflow: shift length = 13 bits
     *                      to next 16 bits             Overflow: shift length = < 13bits> << 16 | <next 16 bits>
     * 
     * 
     *  Skip
     *  0 . . . | . . . 7 . . . | . . . 16
     *  ||__||_||________________________|   
     *   |    |____________       \___________________ 
     *   |                 \                         \
     *   Byte Identifier:   Overflow Bit:               Payload: 
     *   2 Skip             If set then add payload     No Overflow: skip length = 13 bits
     *                      to next 16 bits             Overflow: skip length = < 13bits> << 16 | <next 16 bits>
     * 
     */

    function add_reduce(state, data, sym_len, body, DNP = false) {
        if (isOutputEnabled(state)) {

            let total = body + sym_len;

            if (total == 0) return;

            if (body > 0xFF || sym_len > 0x1F) {
                const low = (1 << 2) | (body & 0xFFF8);
                const high = sym_len;
                set_action(low, data);
                set_action(high, data);
            } else {
                const low = ((sym_len & 0x1F) << 3) | ((body & 0xFF) << 8);
                set_action(low, data);
            }
        }
    }

    function add_shift(l, data, tok_len) {

        if (tok_len < 1) return;

        if (tok_len > 0x1FFF) {
            const low = 1 | (1 << 2) | ((tok_len >> 13) & 0xFFF8);
            const high = (tok_len & 0xFFFF);
            set_action(low, data);
            set_action(high, data);
        } else {
            const low = 1 | ((tok_len << 3) & 0xFFF8);
            set_action(low, data);
        }
    }

    function add_skip(l, data, skip_delta) {

        if (skip_delta < 1) return;

        if (skip_delta > 0x1FFF) {
            const low = 2 | (1 << 2) | ((skip_delta >> 13) & 0xFFF8);
            const high = (skip_delta & 0xFFFF);
            set_action(low, data);
            set_action(high, data);
        } else {
            const low = 2 | ((skip_delta << 3) & 0xFFF8);
            set_action(low, data);
        }
    }

    function set_error(val, data) {
        if (data.error_ptr > data.error_len) return;
        data.error[data.error_ptr++] = val;
    }

    function mark() {
        return action_ptr;
    }

    function set_action(val, data) {
        if (data.rules_ptr > data.rules_len) return;
        data.rules[data.rules_ptr++] = val;
    }

    function createState(ENABLE_STACK_OUTPUT) {
        const IS_STATE_VALID = 1;
        return IS_STATE_VALID | (ENABLE_STACK_OUTPUT << 1);
    }

    function hasStateFailed(state) {
        const IS_STATE_VALID = 1;
        return 0 == (state & IS_STATE_VALID);
    }

    function isOutputEnabled(state) {
        return 0 < (state & 0x2);
    }

    function reset(mark, origin, advanced, state) {
        action_ptr = mark;
        advanced.sync(origin);
        return state;
    }

    function consume(l, data, state) {
        if (isOutputEnabled(state))
            add_shift(l, data, l.token_length);
        l.next(data);
        return true;
    }

    function assertSuccess(l, state, condition) {
        if (!condition || hasStateFailed(state))
            return fail(l, state);
        return state;
    }

    function debug_add_header(data, number_of_items, delta_char_offset, peek_start, peek_end, fork_start, fork_end) {

        if (data.debug_ptr + 1 >= data.debug_len)
            return;

        const local_pointer = data.debug_ptr;

        if (delta_char_offset > 62) {

            data.debug[local_pointer + 1] = delta_char_offset;

            delta_char_offset = 63;

            data.debug_ptr++;
        }

        data.debug[local_pointer] = ((number_of_items && 0x3F)
            | (delta_char_offset << 6)
            | ((peek_start & 0x1) << 12)
            | ((peek_end & 0x1) << 13)
            | ((fork_start & 0x1) << 14)
            | ((fork_end & 0x1) << 15));

        data.debug_ptr++;
    }

    function debug_add_item(data, item_index) { data.debug[data.debug_ptr++] = item_index; }

    ;
    function branch_006279d139f628f8(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*13:38 function=>modifier_list fn identifier : type ( ) { • expression_statements }*/
        puid |= 512;
        pushFN(data, branch_c9c9b8c9d97648c5);
        pushFN(data, $expression_statements);
        return puid;
        return -1;
        /*006279d139f628f81185450f37e40894*/
    }
    function branch_0259dde7fea94460(l, data, state, prod, puid) {
        /*110:330 virtual-138:3:1|--lvl:0=>• identifier_token_HC_listbody1_118 identifier_token_group_080_119
        111:331 virtual-140:2:1|--lvl:0=>• identifier_token_HC_listbody1_118*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if ((l.current_byte == 95/*[_]*/) || (l.current_byte == 36/*[$]*/)) {
            /*110:330 virtual-138:3:1|--lvl:0=>• identifier_token_HC_listbody1_118 identifier_token_group_080_119
            111:331 virtual-140:2:1|--lvl:0=>• identifier_token_HC_listbody1_118*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_6ea1ba4d26b7ad0c);
            pushFN(data, $identifier_token_HC_listbody1_118);
            puid |= 7;
            return puid;
        }
        return -1;
        /*0259dde7fea94460ca0fab248839f0d0*/
    }
    function branch_027233e33062fb58(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*57:171 string_group_0112_125=>• θnl*/
        puid |= 2;
        consume(l, data, state);
        return prod;
        return -1;
        /*027233e33062fb58e2e0062250284aac*/
    }
    function branch_0372dbd01ff9f446(l, data, state, prod, puid) {
        return 43;
        /*0372dbd01ff9f44628548cae2fe7e1e6*/
    }
    function branch_03774a7bfcb7410e(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*31:101 loop_expression=>loop ( parameters ; expression ; • ) expression*/
        puid |= 128;
        consume(l, data, state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 4;
        pushFN(data, branch_19f86e070915dd2a);
        pushFN(data, $expression);
        return puid;
        return -1;
        /*03774a7bfcb7410e96e0fb88f5a44ae4*/
    }
    function branch_038b1722715d8efb(l, data, state, prod, puid) {
        pushFN(data, $expression_goto);
        return 21;
        /*038b1722715d8efb9ed568e83d0a0a33*/
    }
    function branch_04f2c540745f0502(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 512;
        if (/*[in]*/cmpr_set(l, data, 43, 2, 2) && consume(l, data, state)) {
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            puid |= 4;
            pushFN(data, branch_d3d9a23f32e5e8ad);
            pushFN(data, $expression);
            return puid;
        }
        return -1;
        /*04f2c540745f0502495ca4eec2f7b3df*/
    }
    function branch_062cf06014c92bd4(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 88);
        pushFN(data, $string_HC_listbody1_126_goto);
        return 58;
        /*062cf06014c92bd433ba0be6e6fe6477*/
    }
    function branch_063c26611b6f5f75(l, data, state, prod, puid) {
        return 12;
        /*063c26611b6f5f7518549285ff2a363e*/
    }
    function branch_06450e4f8c41ea8c(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*87:264 def$hex_token_group_044_104=>• A*/
        puid |= 128;
        consume(l, data, state);
        return prod;
        return -1;
        /*06450e4f8c41ea8c215742dd13dbe1aa*/
    }
    function branch_06e278ea7237a7d2(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*35:111 call_expression_HC_listbody2_114=>call_expression_HC_listbody2_114 • , expression*/
        puid |= 2;
        consume(l, data, state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 4;
        pushFN(data, branch_a128b75b77459fe9);
        pushFN(data, $expression);
        return puid;
        return -1;
        /*06e278ea7237a7d2c63583fe38fde9a1*/
    }
    function branch_07c4b2a266e81cdd(l, data, state, prod, puid) {
        pushFN(data, $unary_value_goto);
        return 27;
        /*07c4b2a266e81cdd4fa52870e019ca27*/
    }
    function branch_08f87e10bf69e81b(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*94:283 def$octal_token_group_058_109=>• 3*/
        puid |= 8;
        consume(l, data, state);
        return prod;
        return -1;
        /*08f87e10bf69e81b9e906add80a7b41c*/
    }
    function branch_0931b6d0551fc8f5(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*101:302 def$string_value_group_172_113=>• θnum*/
        puid |= 1;
        consume(l, data, state);
        return prod;
        return -1;
        /*0931b6d0551fc8f54f8549e63e3f709c*/
    }
    function branch_0a5b9c282ee399c8(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, $statements_goto);
        return 4;
        /*0a5b9c282ee399c85eb4968a34ce9e70*/
    }
    function branch_0b16c54a0c373e13(l, data, state, prod, puid) {
        add_reduce(state, data, 3, 47);
        /*-------------INDIRECT-------------------*/
        pushFN(data, branch_40a7ef9e3eb88045);
        return 21;
        /*0b16c54a0c373e13094e7875e6246a2e*/
    }
    function branch_0bc8a26871c656c0(l, data, state, prod, puid) {
        /*109:329 virtual-127:4:1|--lvl:0=>: type • primitive_declaration_group_170_116
        110:330 virtual-129:3:1|--lvl:0=>: type •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 61/*[=]*/) {
            pushFN(data, branch_cfb0dc5e733691d0);
            return branch_97974f8251f51cf8(l, data, state, prod, 8);
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*110:330 virtual-129:3:1|--lvl:0=>: type •*/
            add_reduce(state, data, 3, 77);
            pushFN(data, $expression_statements_group_023_108_goto);
            return 18;
        }
        return -1;
        /*0bc8a26871c656c002bb6151795da3d6*/
    }
    function branch_0d17eba9587f77ed(l, data, state, prod, puid) {
        /*108:328 virtual-127:4:1|--lvl:0=>: type • primitive_declaration_group_170_116
        109:329 virtual-129:3:1|--lvl:0=>: type •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 61/*[=]*/) {
            pushFN(data, branch_cfb0dc5e733691d0);
            return branch_6c8b4325e7c8b0b4(l, data, state, prod, 8);
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*109:329 virtual-129:3:1|--lvl:0=>: type •*/
            add_reduce(state, data, 3, 77);
            add_reduce(state, data, 1, 3);
            pushFN(data, $expression_statements_goto);
            return 20;
        }
        return -1;
        /*0d17eba9587f77edcea4ba6ed3e1d667*/
    }
    function branch_0d730d4ec7819a95(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 4;
        if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
            add_reduce(state, data, 3, 37);
            return prod;
        }
        return -1;
        /*0d730d4ec7819a95773a9fc197646a3c*/
    }
    function branch_0dacddd2ccbd8698(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*27:88 unary_value=>• value*/
        puid |= 8;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $value);
        return puid;
        return -1;
        /*0dacddd2ccbd86983a6895af7457d55a*/
    }
    function branch_0dbe41188020fafb(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*101:303 def$string_value_group_172_113=>• θid*/
        puid |= 2;
        consume(l, data, state);
        return prod;
        return -1;
        /*0dbe41188020fafb2e5f7b1a452a1c5b*/
    }
    function branch_0e73753c97335149(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*107:327 def$identifier_symbols=>• θid*/
        puid |= 2;
        consume(l, data, state);
        return prod;
        return -1;
        /*0e73753c97335149d0d7f4f78d42267f*/
    }
    function branch_0e7dcc88b1ca792b(l, data, state, prod, puid) {
        /*31:97 loop_expression=>loop ( parameters • ; expression ; loop_expression_HC_listbody6_112 ) expression
        31:100 loop_expression=>loop ( parameters • ; ; loop_expression_HC_listbody6_112 ) expression
        31:101 loop_expression=>loop ( parameters • ; expression ; ) expression
        31:104 loop_expression=>loop ( parameters • ; ; ) expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 59/*[;]*/) {
            consume(l, data, state);
            puid |= 32;
            /*31:97 loop_expression=>loop ( parameters ; • expression ; loop_expression_HC_listbody6_112 ) expression
            31:101 loop_expression=>loop ( parameters ; • expression ; ) expression
            31:100 loop_expression=>loop ( parameters ; • ; loop_expression_HC_listbody6_112 ) expression
            31:104 loop_expression=>loop ( parameters ; • ; ) expression*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (l.current_byte == 59/*[;]*/) {
                /*31:100 loop_expression=>loop ( parameters ; • ; loop_expression_HC_listbody6_112 ) expression
                31:104 loop_expression=>loop ( parameters ; • ; ) expression*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l, data, state);
                puid |= 32;
                /*31:100 loop_expression=>loop ( parameters ; ; • loop_expression_HC_listbody6_112 ) expression
                31:104 loop_expression=>loop ( parameters ; ; • ) expression*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if (l.current_byte == 41/*[)]*/) {
                    pushFN(data, branch_3205c0ded576131e);
                    return branch_41ddfa96615c0efb(l, data, state, prod, 32);
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if (((((((((((((((/*[if]*/cmpr_set(l, data, 143, 2, 2) ||/*[match]*/cmpr_set(l, data, 67, 5, 5)) ||/*[break]*/cmpr_set(l, data, 72, 5, 5)) ||/*[return]*/cmpr_set(l, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(l, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(l, data, 63, 4, 4)) ||/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) ||/*[==]*/cmpr_set(l, data, 7, 2, 2)) || dt_bcea2102060eab13(l, data)) ||/*[true]*/cmpr_set(l, data, 95, 4, 4)) ||/*[null]*/cmpr_set(l, data, 35, 4, 4)) || dt_6ae31dd85a62ef5c(l, data)) || assert_ascii(l, 0x0, 0x194, 0x88000000, 0x8000000)) || l.isUniID(data)) || l.isNum(data)) || l.isSym(true, data)) {
                    pushFN(data, branch_3205c0ded576131e);
                    return branch_cad99286d05112aa(l, data, state, prod, 32);
                }
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if (((((((((((((((/*[<<--]*/cmpr_set(l, data, 20, 4, 4) ||/*[if]*/cmpr_set(l, data, 143, 2, 2)) ||/*[match]*/cmpr_set(l, data, 67, 5, 5)) ||/*[==]*/cmpr_set(l, data, 7, 2, 2)) || dt_bcea2102060eab13(l, data)) || dt_6ae31dd85a62ef5c(l, data)) ||/*[true]*/cmpr_set(l, data, 95, 4, 4)) ||/*[null]*/cmpr_set(l, data, 35, 4, 4)) ||/*[break]*/cmpr_set(l, data, 72, 5, 5)) ||/*[return]*/cmpr_set(l, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(l, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(l, data, 63, 4, 4)) || assert_ascii(l, 0x0, 0x194, 0x88000000, 0x8000000)) || l.isUniID(data)) || l.isNum(data)) || l.isSym(true, data)) {
                /*31:97 loop_expression=>loop ( parameters ; • expression ; loop_expression_HC_listbody6_112 ) expression
                31:101 loop_expression=>loop ( parameters ; • expression ; ) expression*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                pushFN(data, branch_c244af9399a4b393);
                pushFN(data, $expression);
                puid |= 4;
                return puid;
            }
        }
        return -1;
        /*0e7dcc88b1ca792bccaeac0490bc68ac*/
    }
    function branch_0fdc5c5b577f7e48(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 1);
        return 0;
        /*0fdc5c5b577f7e481c47b8e3e546f5f3*/
    }
    function branch_104d5a190a45ad94(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, $expression_statements_group_023_108_goto);
        return 18;
        /*104d5a190a45ad9453e0fbad80387357*/
    }
    function branch_105597e1c2057714(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, $string_HC_listbody1_126_goto);
        return 58;
        /*105597e1c20577140410bb17afb41add*/
    }
    function branch_10c4f9da49df61d8(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*100:299 def$string_value_group_071_112=>• θsym*/
        puid |= 4;
        consume(l, data, state);
        return prod;
        return -1;
        /*10c4f9da49df61d83cadb0a8747e54b1*/
    }
    function branch_11d890e1265c30e7(l, data, state, prod, puid) {
        pushFN(data, $expression_statements_group_023_108_goto);
        return 44;
        /*11d890e1265c30e7b243cc2af04fe35b*/
    }
    function branch_1202bfb712d31996(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, $unary_value_goto);
        return 27;
        /*1202bfb712d31996ec80d4368861e54a*/
    }
    function branch_124a960811fb5e08(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*31:102 loop_expression=>loop ( ; ; • loop_expression_HC_listbody6_112 ) expression*/
        puid |= 64;
        pushFN(data, branch_8544af15563f5778);
        pushFN(data, $loop_expression_HC_listbody6_112);
        return puid;
        return -1;
        /*124a960811fb5e086d3040519ea33e9c*/
    }
    function branch_1316bf4736ec7708(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 64;
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 5, 12);
            return prod;
        }
        return -1;
        /*1316bf4736ec7708518b3058f25f3dd9*/
    }
    function branch_13560957ad4d6872(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*83:250 def$scientific_token_group_228_102=>def$scientific_token_group_027_101 • - θnum*/
        puid |= 2;
        consume(l, data, state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 4;
        if (l.isNum(data) && consume(l, data, state)) {
            add_reduce(state, data, 3, 0);
            return prod;
        }
        return -1;
        /*13560957ad4d68729bb03bdef02fd36a*/
    }
    function branch_13f6c10119d024c3(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $comment_HC_listbody1_132_goto);
        return 69;
        /*13f6c10119d024c3feaafa524bb10e22*/
    }
    function branch_14996c9b2b6ecdfb(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 128;
        if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            puid |= 4;
            pushFN(data, branch_5923ba76c150d90d);
            pushFN(data, $expression);
            return puid;
        }
        return -1;
        /*14996c9b2b6ecdfbd33c5ac1543ef10f*/
    }
    function branch_14c65235b826abf4(l, data, state, prod, puid) {
        /*109:329 virtual-97:9:1|--lvl:0=>( parameters • ; expression ; loop_expression_HC_listbody6_112 ) expression
        110:330 virtual-100:8:1|--lvl:0=>( parameters • ; ; loop_expression_HC_listbody6_112 ) expression
        111:331 virtual-101:8:1|--lvl:0=>( parameters • ; expression ; ) expression
        112:332 virtual-104:7:1|--lvl:0=>( parameters • ; ; ) expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 59/*[;]*/) {
            consume(l, data, state);
            puid |= 32;
            /*109:329 virtual-97:9:1|--lvl:0=>( parameters ; • expression ; loop_expression_HC_listbody6_112 ) expression
            111:331 virtual-101:8:1|--lvl:0=>( parameters ; • expression ; ) expression
            110:330 virtual-100:8:1|--lvl:0=>( parameters ; • ; loop_expression_HC_listbody6_112 ) expression
            112:332 virtual-104:7:1|--lvl:0=>( parameters ; • ; ) expression*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (l.current_byte == 59/*[;]*/) {
                /*110:330 virtual-100:8:1|--lvl:0=>( parameters ; • ; loop_expression_HC_listbody6_112 ) expression
                112:332 virtual-104:7:1|--lvl:0=>( parameters ; • ; ) expression*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l, data, state);
                puid |= 32;
                /*110:330 virtual-100:8:1|--lvl:0=>( parameters ; ; • loop_expression_HC_listbody6_112 ) expression
                112:332 virtual-104:7:1|--lvl:0=>( parameters ; ; • ) expression*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if (l.current_byte == 41/*[)]*/) {
                    pushFN(data, branch_3205c0ded576131e);
                    return branch_dd386c06d23e1b10(l, data, state, prod, 32);
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if (((((((((((((((/*[if]*/cmpr_set(l, data, 143, 2, 2) ||/*[match]*/cmpr_set(l, data, 67, 5, 5)) ||/*[break]*/cmpr_set(l, data, 72, 5, 5)) ||/*[return]*/cmpr_set(l, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(l, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(l, data, 63, 4, 4)) ||/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) ||/*[==]*/cmpr_set(l, data, 7, 2, 2)) || dt_bcea2102060eab13(l, data)) ||/*[true]*/cmpr_set(l, data, 95, 4, 4)) ||/*[null]*/cmpr_set(l, data, 35, 4, 4)) || dt_6ae31dd85a62ef5c(l, data)) || assert_ascii(l, 0x0, 0x194, 0x88000000, 0x8000000)) || l.isUniID(data)) || l.isNum(data)) || l.isSym(true, data)) {
                    pushFN(data, branch_3205c0ded576131e);
                    return branch_fe55487282b0b10d(l, data, state, prod, 32);
                }
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if (((((((((((((((/*[<<--]*/cmpr_set(l, data, 20, 4, 4) ||/*[if]*/cmpr_set(l, data, 143, 2, 2)) ||/*[match]*/cmpr_set(l, data, 67, 5, 5)) ||/*[==]*/cmpr_set(l, data, 7, 2, 2)) || dt_bcea2102060eab13(l, data)) || dt_6ae31dd85a62ef5c(l, data)) ||/*[true]*/cmpr_set(l, data, 95, 4, 4)) ||/*[null]*/cmpr_set(l, data, 35, 4, 4)) ||/*[break]*/cmpr_set(l, data, 72, 5, 5)) ||/*[return]*/cmpr_set(l, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(l, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(l, data, 63, 4, 4)) || assert_ascii(l, 0x0, 0x194, 0x88000000, 0x8000000)) || l.isUniID(data)) || l.isNum(data)) || l.isSym(true, data)) {
                /*109:329 virtual-97:9:1|--lvl:0=>( parameters ; • expression ; loop_expression_HC_listbody6_112 ) expression
                111:331 virtual-101:8:1|--lvl:0=>( parameters ; • expression ; ) expression*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                pushFN(data, branch_58f730f6c0629550);
                pushFN(data, $expression);
                puid |= 4;
                return puid;
            }
        }
        return -1;
        /*14c65235b826abf45bfd11f63aa2c5d7*/
    }
    function branch_1537086d834283de(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*13:42 function=>modifier_list fn identifier : type ( ) { • }*/
        puid |= 1024;
        consume(l, data, state);
        add_reduce(state, data, 9, 26);
        return prod;
        return -1;
        /*1537086d834283de9d41e0e6a7795760*/
    }
    function branch_1622bb2c5deb4fec(l, data, state, prod, puid) {
        /*12:33 struct=>str identifier • { parameters }
        12:35 struct=>str identifier • { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 123/*[{]*/) {
            consume(l, data, state);
            puid |= 8;
            /*12:33 struct=>str identifier { • parameters }
            12:35 struct=>str identifier { • }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if (l.current_byte == 125/*[}]*/) {
                pushFN(data, branch_063c26611b6f5f75);
                return branch_90eee6febcdc2fe0(l, data, state, prod, 8);
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if (assert_ascii(l, 0x0, 0x10, 0x88000000, 0x0) || l.isUniID(data)) {
                pushFN(data, branch_063c26611b6f5f75);
                return branch_f8d48abe3e51a3c4(l, data, state, prod, 8);
            }
        }
        return -1;
        /*1622bb2c5deb4fec7cbc70f547518417*/
    }
    function branch_1704c826ae889739(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*93:278 def$octal_token_group_050_108=>• 0o*/
        puid |= 1;
        consume(l, data, state);
        return prod;
        return -1;
        /*1704c826ae8897391938be36a3bec96c*/
    }
    function branch_17b826865a71f383(l, data, state, prod, puid) {
        add_reduce(state, data, 2, 87);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $def$string_value_HC_listbody2_114_goto);
        return 102;
        /*17b826865a71f383addb2ffeca58d7a5*/
    }
    function branch_17c2854be0b8782d(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*100:301 def$string_value_group_071_112=>• θnl*/
        puid |= 16;
        consume(l, data, state);
        return prod;
        return -1;
        /*17c2854be0b8782d26e5e82ee75f217c*/
    }
    function branch_18ddf6ec17b31727(l, data, state, prod, puid) {
        /*108:328 virtual-96:3:1|--lvl:0=>loop_expression_group_254_111 • expression*/
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*108:328 virtual-96:3:1|--lvl:0=>loop_expression_group_254_111 • expression*/
        puid |= 4;
        pushFN(data, branch_9de7f9ab877f82ab);
        pushFN(data, $expression);
        return puid;
        /*18ddf6ec17b31727536773f711357080*/
    }
    function branch_18f06d37a9397717(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*67:208 comment_group_0139_130=>• θnum*/
        puid |= 4;
        consume(l, data, state);
        return prod;
        return -1;
        /*18f06d37a9397717a6f5b796798b6ed3*/
    }
    function branch_19614154b7eb775b(l, data, state, prod, puid) {
        add_reduce(state, data, 3, 65);
        return prod;
        /*19614154b7eb775be3eafd0c6654471e*/
    }
    function branch_19af09a22d36fdd3(l, data, state, prod, puid) {
        /*115:335 virtual-329:8:1|--lvl:1=>parameters ; expression • ; loop_expression_HC_listbody6_112 ) expression
        117:337 virtual-331:7:1|--lvl:1=>parameters ; expression • ; ) expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 59/*[;]*/) {
            consume(l, data, state);
            puid |= 32;
            /*115:335 virtual-329:8:1|--lvl:1=>parameters ; expression ; • loop_expression_HC_listbody6_112 ) expression
            117:337 virtual-331:7:1|--lvl:1=>parameters ; expression ; • ) expression*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if (l.current_byte == 41/*[)]*/) {
                pushFN(data, branch_4a236324dddf6f01);
                return branch_2dd9eee70b052901(l, data, state, prod, 32);
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if (((((((((((((((/*[if]*/cmpr_set(l, data, 143, 2, 2) ||/*[match]*/cmpr_set(l, data, 67, 5, 5)) ||/*[break]*/cmpr_set(l, data, 72, 5, 5)) ||/*[return]*/cmpr_set(l, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(l, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(l, data, 63, 4, 4)) ||/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) ||/*[==]*/cmpr_set(l, data, 7, 2, 2)) || dt_bcea2102060eab13(l, data)) ||/*[true]*/cmpr_set(l, data, 95, 4, 4)) ||/*[null]*/cmpr_set(l, data, 35, 4, 4)) || dt_6ae31dd85a62ef5c(l, data)) || assert_ascii(l, 0x0, 0x194, 0x88000000, 0x8000000)) || l.isUniID(data)) || l.isNum(data)) || l.isSym(true, data)) {
                pushFN(data, branch_4a236324dddf6f01);
                return branch_b230b428597b277e(l, data, state, prod, 32);
            }
        }
        return -1;
        /*19af09a22d36fdd3d8a4b39eab99d4a9*/
    }
    function branch_19f86e070915dd2a(l, data, state, prod, puid) {
        add_reduce(state, data, 8, 55);
        return prod;
        /*19f86e070915dd2a5d63616ee943fbf8*/
    }
    function branch_1a1ef827e5ad57cd(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 4;
        pushFN(data, branch_7b936f2d34f41c85);
        pushFN(data, $expression);
        return puid;
        return -1;
        /*1a1ef827e5ad57cd525c45ec09c3746d*/
    }
    function branch_1a42d7243a9cc7d3(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*44:130 identifier=>• tk:identifier_token*/
        puid |= 1;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $identifier);
        return puid;
        return -1;
        /*1a42d7243a9cc7d33658d6d6750071ba*/
    }
    function branch_1a9b92d8e81556d6(l, data, state, prod, puid) {
        return 72;
        /*1a9b92d8e81556d673610a8dbda1fcf5*/
    }
    function branch_1b3c041470654f02(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*11:29 class=>cls identifier class_group_113_103 { • }*/
        puid |= 64;
        consume(l, data, state);
        add_reduce(state, data, 5, 13);
        return prod;
        return -1;
        /*1b3c041470654f02dc1757abdbd18a60*/
    }
    function branch_1b52ccce527a3b39(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*105:313 def$js_id_symbols=>def$js_id_symbols • _*/
        puid |= 4;
        consume(l, data, state);
        add_reduce(state, data, 2, 87);
        return prod;
        return -1;
        /*1b52ccce527a3b39da502895c0197e87*/
    }
    function branch_1bd87767095cf0fd(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*97:291 def$string=>• " def$string_token "*/
        puid |= 1;
        consume(l, data, state);
        skip_a294e41529bc9275(l/*[ nl ][ 71 ]*/, data, state);
        puid |= 2;
        pushFN(data, branch_ccde39d462a0ec4d);
        pushFN(data, $def$string_token);
        return puid;
        return -1;
        /*1bd87767095cf0fd8718a28a136e0d4d*/
    }
    function branch_1c3acec66e63a26a(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*4:10 statements=>• function*/
        puid |= 32;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $function);
        return puid;
        return -1;
        /*1c3acec66e63a26af9f4ff4173440b92*/
    }
    function branch_1d63aa65114dd0e6(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*56:166 value=>• true*/
        puid |= 4;
        consume(l, data, state);
        add_reduce(state, data, 1, 84);
        return prod;
        return -1;
        /*1d63aa65114dd0e664c7c92de682a80c*/
    }
    function branch_1ee3186a3cd3e97b(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*87:257 def$hex_token_group_044_104=>• θnum*/
        puid |= 1;
        consume(l, data, state);
        return prod;
        return -1;
        /*1ee3186a3cd3e97b556cce6cb8493808*/
    }
    function branch_1f0e8a0854632fda(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $parameters_goto);
        return 16;
        /*1f0e8a0854632fdab5aca1813b55c705*/
    }
    function branch_1f9ddf3c27180aa0(l, data, state, prod, puid) {
        return prod;
        /*1f9ddf3c27180aa0dff88bc66c940765*/
    }
    function branch_200e004ce92f80ce(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 4;
        if ((l.current_byte == 93/*[]]*/) && consume(l, data, state)) {
            add_reduce(state, data, 3, 37);
            return 50;
        }
        return -1;
        /*200e004ce92f80cee5d5e6575f580309*/
    }
    function branch_2021bb8956171841(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*13:36 function=>modifier_list fn identifier : type ( parameters ) { • expression_statements }*/
        puid |= 512;
        pushFN(data, branch_530b15e41ef1340a);
        pushFN(data, $expression_statements);
        return puid;
        return -1;
        /*2021bb8956171841160a5455f7c1ba2b*/
    }
    function branch_20c4644763e1b1fc(l, data, state, prod, puid) {
        add_reduce(state, data, 4, 75);
        return prod;
        /*20c4644763e1b1fc85f0faa8403c0783*/
    }
    function branch_219b628b1680056a(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 16;
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 5, 6);
            return prod;
        }
        return -1;
        /*219b628b1680056ac338b4057ab6f160*/
    }
    function branch_22c9bbc2e06b56ba(l, data, state, prod, puid) {
        /*12:32 struct=>modifier_list • str identifier { parameters }
        12:34 struct=>modifier_list • str identifier { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (/*[str]*/cmpr_set(l, data, 47, 3, 3)) {
            consume(l, data, state);
            puid |= 2;
            /*12:32 struct=>modifier_list str • identifier { parameters }
            12:34 struct=>modifier_list str • identifier { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_5024871207a62363);
            pushFN(data, $identifier);
            puid |= 4;
            return puid;
        }
        return -1;
        /*22c9bbc2e06b56bacbe5ab1752e6c164*/
    }
    function branch_23416216ce94034d(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*52:153 type_group_092_122=>• 128*/
        puid |= 16;
        consume(l, data, state);
        return prod;
        return -1;
        /*23416216ce94034d5bcc462d5117187a*/
    }
    function branch_23682326cb240dce(l, data, state, prod, puid) {
        return 100;
        /*23682326cb240dce38a8bf2dbb1ba6ba*/
    }
    function branch_239da823ebc1627a(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*67:207 comment_group_0139_130=>• θsym*/
        puid |= 2;
        consume(l, data, state);
        return prod;
        return -1;
        /*239da823ebc1627a43574a0a9f952705*/
    }
    function branch_24f0ac92b86c2129(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 68);
        return prod;
        /*24f0ac92b86c2129601f66e1a9025a56*/
    }
    function branch_2551979fa53fe897(l, data, state, prod, puid) {
        /*14:44 function_expression=>modifier_list fn : type ( parameters • ) { expression_statements }
        14:47 function_expression=>modifier_list fn : type ( parameters • ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 41/*[)]*/) {
            consume(l, data, state);
            puid |= 64;
            /*14:44 function_expression=>modifier_list fn : type ( parameters ) • { expression_statements }
            14:47 function_expression=>modifier_list fn : type ( parameters ) • { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if (l.current_byte == 123/*[{]*/) {
                consume(l, data, state);
                puid |= 128;
                /*14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }
                14:47 function_expression=>modifier_list fn : type ( parameters ) { • }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if (l.current_byte == 125/*[}]*/) {
                    pushFN(data, branch_a1186298bc0087ac);
                    return branch_ef1e47c03eb4046e(l, data, state, prod, 128);
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if (((((((((((((((/*[if]*/cmpr_set(l, data, 143, 2, 2) ||/*[match]*/cmpr_set(l, data, 67, 5, 5)) ||/*[break]*/cmpr_set(l, data, 72, 5, 5)) ||/*[return]*/cmpr_set(l, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(l, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(l, data, 63, 4, 4)) ||/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) ||/*[==]*/cmpr_set(l, data, 7, 2, 2)) || dt_bcea2102060eab13(l, data)) ||/*[true]*/cmpr_set(l, data, 95, 4, 4)) ||/*[null]*/cmpr_set(l, data, 35, 4, 4)) || dt_6ae31dd85a62ef5c(l, data)) || assert_ascii(l, 0x0, 0x194, 0x88000000, 0x8000000)) || l.isUniID(data)) || l.isNum(data)) || l.isSym(true, data)) {
                    pushFN(data, branch_a1186298bc0087ac);
                    return branch_d7697e76ac6bb46e(l, data, state, prod, 128);
                }
            }
        }
        return -1;
        /*2551979fa53fe897423efed320e3bb62*/
    }
    function branch_256d8d5c6f72d0ad(l, data, state, prod, puid) {
        /*31:99 loop_expression=>loop ( ; expression • ; loop_expression_HC_listbody6_112 ) expression
        31:103 loop_expression=>loop ( ; expression • ; ) expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 59/*[;]*/) {
            consume(l, data, state);
            puid |= 32;
            /*31:99 loop_expression=>loop ( ; expression ; • loop_expression_HC_listbody6_112 ) expression
            31:103 loop_expression=>loop ( ; expression ; • ) expression*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if (l.current_byte == 41/*[)]*/) {
                pushFN(data, branch_5814d05b2ded1273);
                return branch_f13c855d3a1bc46c(l, data, state, prod, 32);
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if (((((((((((((((/*[if]*/cmpr_set(l, data, 143, 2, 2) ||/*[match]*/cmpr_set(l, data, 67, 5, 5)) ||/*[break]*/cmpr_set(l, data, 72, 5, 5)) ||/*[return]*/cmpr_set(l, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(l, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(l, data, 63, 4, 4)) ||/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) ||/*[==]*/cmpr_set(l, data, 7, 2, 2)) || dt_bcea2102060eab13(l, data)) ||/*[true]*/cmpr_set(l, data, 95, 4, 4)) ||/*[null]*/cmpr_set(l, data, 35, 4, 4)) || dt_6ae31dd85a62ef5c(l, data)) || assert_ascii(l, 0x0, 0x194, 0x88000000, 0x8000000)) || l.isUniID(data)) || l.isNum(data)) || l.isSym(true, data)) {
                pushFN(data, branch_5814d05b2ded1273);
                return branch_d6c675e44628aeae(l, data, state, prod, 32);
            }
        }
        return -1;
        /*256d8d5c6f72d0adffb15ef3d0edb65a*/
    }
    function branch_25c768d9c9093ad1(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        /*36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )*/
        puid |= 2;
        consume(l, data, state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 4;
        pushFN(data, branch_cfbe1d2c5b310407);
        pushFN(data, $call_expression_HC_listbody2_114);
        return puid;
        return -1;
        /*25c768d9c9093ad1dd54a3599c403d1c*/
    }
    function branch_2723d54886e8ee23(l, data, state, prod, puid) {
        pushFN(data, $def$js_id_symbols_goto);
        return 105;
        /*2723d54886e8ee235f797a651a055287*/
    }
    function branch_284b0dc10521fad3(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*21:75 expression=>{ • }*/
        puid |= 1024;
        consume(l, data, state);
        add_reduce(state, data, 2, 42);
        return prod;
        return -1;
        /*284b0dc10521fad331b3bc0effa6d1e0*/
    }
    function branch_28c5dc3955a9ede3(l, data, state, prod, puid) {
        pushFN(data, $statements_goto);
        return 50;
        /*28c5dc3955a9ede301c5ab8f3b51de91*/
    }
    function branch_28ed74bf96b1a974(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        add_reduce(state, data, 1, 3);
        pushFN(data, $expression_statements_goto);
        return 20;
        /*28ed74bf96b1a97473e32cb4767531db*/
    }
    function branch_2959660f57d39533(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, $def$string_value_goto);
        return 103;
        /*2959660f57d39533f0f994813e644e32*/
    }
    function branch_299f739d1bf05ee6(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*76:227 def$defaultproduction=>• def$binary*/
        puid |= 4;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $def$binary);
        return puid;
        return -1;
        /*299f739d1bf05ee610343a2cf5213fe5*/
    }
    function branch_29bbdc70dcef3ee4(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, $operator_HC_listbody1_129_goto);
        return 64;
        /*29bbdc70dcef3ee49cc0234380000d7b*/
    }
    function branch_29bbdf58183bc8d7(l, data, state, prod, puid) {
        pushFN(data, $statements_goto);
        return 4;
        /*29bbdf58183bc8d7e7031e798ef6fa26*/
    }
    function branch_2a33947dd011020b(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, $identifier_token_HC_listbody1_118_goto);
        return 46;
        /*2a33947dd011020b9c52725d27fab463*/
    }
    function branch_2ad16a693ec3cb19(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
        /*103:309 def$string_value=>def$string_value • def$string_value_group_172_113*/
        puid |= 2;
        pushFN(data, branch_c16dcb383e53221e);
        pushFN(data, $def$string_value_group_172_113);
        return puid;
        return -1;
        /*2ad16a693ec3cb19c1df07de7bdb7c4b*/
    }
    function branch_2b9dda3e180285a6(l, data, state, prod, puid) {
        /*13:36 function=>modifier_list fn identifier : type • ( parameters ) { expression_statements }
        13:38 function=>modifier_list fn identifier : type • ( ) { expression_statements }
        13:39 function=>modifier_list fn identifier : type • ( parameters ) { }
        13:42 function=>modifier_list fn identifier : type • ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 40/*[(]*/) {
            consume(l, data, state);
            puid |= 32;
            /*13:36 function=>modifier_list fn identifier : type ( • parameters ) { expression_statements }
            13:39 function=>modifier_list fn identifier : type ( • parameters ) { }
            13:38 function=>modifier_list fn identifier : type ( • ) { expression_statements }
            13:42 function=>modifier_list fn identifier : type ( • ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (l.current_byte == 41/*[)]*/) {
                /*13:38 function=>modifier_list fn identifier : type ( • ) { expression_statements }
                13:42 function=>modifier_list fn identifier : type ( • ) { }*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l, data, state);
                puid |= 128;
                /*13:38 function=>modifier_list fn identifier : type ( ) • { expression_statements }
                13:42 function=>modifier_list fn identifier : type ( ) • { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                if (l.current_byte == 123/*[{]*/) {
                    consume(l, data, state);
                    puid |= 256;
                    /*13:38 function=>modifier_list fn identifier : type ( ) { • expression_statements }
                    13:42 function=>modifier_list fn identifier : type ( ) { • }*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    if (l.current_byte == 125/*[}]*/) {
                        pushFN(data, branch_cbc044c8c9b81bf7);
                        return branch_1537086d834283de(l, data, state, prod, 256);
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    } else if (((((((((((((((/*[if]*/cmpr_set(l, data, 143, 2, 2) ||/*[match]*/cmpr_set(l, data, 67, 5, 5)) ||/*[break]*/cmpr_set(l, data, 72, 5, 5)) ||/*[return]*/cmpr_set(l, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(l, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(l, data, 63, 4, 4)) ||/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) ||/*[==]*/cmpr_set(l, data, 7, 2, 2)) || dt_bcea2102060eab13(l, data)) ||/*[true]*/cmpr_set(l, data, 95, 4, 4)) ||/*[null]*/cmpr_set(l, data, 35, 4, 4)) || dt_6ae31dd85a62ef5c(l, data)) || assert_ascii(l, 0x0, 0x194, 0x88000000, 0x8000000)) || l.isUniID(data)) || l.isNum(data)) || l.isSym(true, data)) {
                        pushFN(data, branch_cbc044c8c9b81bf7);
                        return branch_006279d139f628f8(l, data, state, prod, 256);
                    }
                }
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if (assert_ascii(l, 0x0, 0x10, 0x88000000, 0x0) || l.isUniID(data)) {
                /*13:36 function=>modifier_list fn identifier : type ( • parameters ) { expression_statements }
                13:39 function=>modifier_list fn identifier : type ( • parameters ) { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                pushFN(data, branch_a36b80ecc9b33e07);
                pushFN(data, $parameters);
                puid |= 64;
                return puid;
            }
        }
        return -1;
        /*2b9dda3e180285a66016f13440d1b7d2*/
    }
    function branch_2c4360c5e05e1da8(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*66:205 modifier=>• θid*/
        puid |= 32;
        consume(l, data, state);
        return prod;
        return -1;
        /*2c4360c5e05e1da8b8eab91e879bf9d5*/
    }
    function branch_2c5d2c55e3716278(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*76:226 def$defaultproduction=>• def$hex*/
        puid |= 2;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $def$hex);
        return puid;
        return -1;
        /*2c5d2c55e371627811bb5477eec5df77*/
    }
    function branch_2c86f0d728192ccd(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*56:167 value=>• false*/
        puid |= 8;
        consume(l, data, state);
        add_reduce(state, data, 1, 85);
        return prod;
        return -1;
        /*2c86f0d728192ccd2ebccf16c5517c77*/
    }
    function branch_2d28f14224cb4074(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 88);
        pushFN(data, $def$string_value_HC_listbody2_114_goto);
        return 102;
        /*2d28f14224cb4074693e12102a54ec6a*/
    }
    function branch_2d3347d5954b49a1(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*36:113 call_expression=>member_expression ( • call_expression_HC_listbody2_114 )*/
        puid |= 4;
        pushFN(data, branch_cfbe1d2c5b310407);
        pushFN(data, $call_expression_HC_listbody2_114);
        return puid;
        return -1;
        /*2d3347d5954b49a1aab8d6d9ad6732eb*/
    }
    function branch_2d70052e1cc76d5c(l, data, state, prod, puid) {
        return 13;
        /*2d70052e1cc76d5ca68f75375edd7e05*/
    }
    function branch_2d9e766cbeea47a1(l, data, state, prod, puid) {
        return 73;
        /*2d9e766cbeea47a1d3540bfd6ed6c1af*/
    }
    function branch_2dd9eee70b052901(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*117:337 virtual-331:7:1|--lvl:1=>parameters ; expression ; • ) expression*/
        puid |= 128;
        consume(l, data, state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 4;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $expression);
        return puid;
        return -1;
        /*2dd9eee70b052901ef8df79327a632de*/
    }
    function branch_2e5f0d29e134b2c8(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 67);
        return prod;
        /*2e5f0d29e134b2c8ae864579c7a0f49d*/
    }
    function branch_2f25bd1b27cd3f52(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*76:225 def$defaultproduction=>• def$number*/
        puid |= 1;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $def$number);
        return puid;
        return -1;
        /*2f25bd1b27cd3f521419604fda6cc871*/
    }
    function branch_2f4a9b0567013e9e(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 88);
        pushFN(data, $def$string_value_goto);
        return 103;
        /*2f4a9b0567013e9e80ba784115d10f9f*/
    }
    function branch_2fc8e06271cc27a3(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*16:54 parameters=>parameters • , primitive_declaration*/
        puid |= 2;
        consume(l, data, state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 4;
        pushFN(data, branch_a128b75b77459fe9);
        pushFN(data, $primitive_declaration);
        return puid;
        return -1;
        /*2fc8e06271cc27a3d2d34df58e3e84a5*/
    }
    function branch_30222513f08e2b8d(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 512;
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 9, 30);
            return prod;
        }
        return -1;
        /*30222513f08e2b8dae5c209d52fe28d5*/
    }
    function branch_3038f572d4c8110b(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*76:230 def$defaultproduction=>• def$string*/
        puid |= 32;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $def$string);
        return puid;
        return -1;
        /*3038f572d4c8110b8cd8fa744a01d68d*/
    }
    function branch_308bdd9a72b6d6bd(l, data, state, prod, puid) {
        return 45;
        /*308bdd9a72b6d6bdae6b49b62a281501*/
    }
    function branch_30cb792dd1844814(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*101:304 def$string_value_group_172_113=>• θsym*/
        puid |= 4;
        consume(l, data, state);
        return prod;
        return -1;
        /*30cb792dd1844814644abc0d6db5b2fe*/
    }
    function branch_31ea5f7bcc42c06b(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 32;
        if ((l.current_byte == 93/*[]]*/) && consume(l, data, state)) {
            add_reduce(state, data, 4, 66);
            /*-------------INDIRECT-------------------*/
            pushFN(data, $expression_goto);
            return 37;
        }
        return -1;
        /*31ea5f7bcc42c06bccddfb3cc087c94b*/
    }
    function branch_3205c0ded576131e(l, data, state, prod, puid) {
        /*3205c0ded576131ea255ad2bd38b0fb2*/
    }
    function branch_32ad73b65dc14f67(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 32;
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 5, 17);
            return prod;
        }
        return -1;
        /*32ad73b65dc14f67995e1f5757258c5c*/
    }
    function branch_3346b8aed5444375(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*14:51 function_expression=>fn : type ( ) { • }*/
        puid |= 512;
        consume(l, data, state);
        add_reduce(state, data, 7, 35);
        return prod;
        return -1;
        /*3346b8aed544437582fa2305a28191cf*/
    }
    function branch_33bfe86295475b96(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*105:315 def$js_id_symbols=>def$js_id_symbols • θnum*/
        puid |= 16;
        consume(l, data, state);
        add_reduce(state, data, 2, 87);
        return prod;
        return -1;
        /*33bfe86295475b963dcb4a3eb3787ed0*/
    }
    function branch_3407808ab5fd5271(l, data, state, prod, puid) {
        add_reduce(state, data, 2, 69);
        return 39;
        /*3407808ab5fd527176dcc0056263fd0f*/
    }
    function branch_343a4cb7df76e00a(l, data, state, prod, puid) {
        /*36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
        36:114 call_expression=>member_expression • ( )*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 40/*[(]*/) {
            consume(l, data, state);
            puid |= 2;
            /*36:113 call_expression=>member_expression ( • call_expression_HC_listbody2_114 )
            36:114 call_expression=>member_expression ( • )*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if (l.current_byte == 41/*[)]*/) {
                pushFN(data, branch_556d6adae510d753);
                return branch_f6003567d4aab0a3(l, data, state, prod, 2);
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if (((((((((((((((/*[if]*/cmpr_set(l, data, 143, 2, 2) ||/*[match]*/cmpr_set(l, data, 67, 5, 5)) ||/*[break]*/cmpr_set(l, data, 72, 5, 5)) ||/*[return]*/cmpr_set(l, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(l, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(l, data, 63, 4, 4)) ||/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) ||/*[==]*/cmpr_set(l, data, 7, 2, 2)) || dt_bcea2102060eab13(l, data)) ||/*[true]*/cmpr_set(l, data, 95, 4, 4)) ||/*[null]*/cmpr_set(l, data, 35, 4, 4)) || dt_6ae31dd85a62ef5c(l, data)) || assert_ascii(l, 0x0, 0x194, 0x88000000, 0x8000000)) || l.isUniID(data)) || l.isNum(data)) || l.isSym(true, data)) {
                pushFN(data, branch_556d6adae510d753);
                return branch_2d3347d5954b49a1(l, data, state, prod, 2);
            }
        }
        return -1;
        /*343a4cb7df76e00af3c825d44165c280*/
    }
    function branch_345b32d9d4006ef9(l, data, state, prod, puid) {
        /*19:60 expression_statements_group_124_109=>expression_statements_HC_listbody1_107 • expression_statements_group_023_108
        19:61 expression_statements_group_124_109=>expression_statements_HC_listbody1_107 •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        if (sym_map_c6b39aab330540a5(l, data) == 1) {
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*19:61 expression_statements_group_124_109=>expression_statements_HC_listbody1_107 •*/
            add_reduce(state, data, 1, 38);
            return 19;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (((((((((((((((/*[<<--]*/cmpr_set(l, data, 20, 4, 4) ||/*[if]*/cmpr_set(l, data, 143, 2, 2)) ||/*[match]*/cmpr_set(l, data, 67, 5, 5)) ||/*[==]*/cmpr_set(l, data, 7, 2, 2)) || dt_bcea2102060eab13(l, data)) || dt_6ae31dd85a62ef5c(l, data)) ||/*[true]*/cmpr_set(l, data, 95, 4, 4)) ||/*[null]*/cmpr_set(l, data, 35, 4, 4)) ||/*[break]*/cmpr_set(l, data, 72, 5, 5)) ||/*[return]*/cmpr_set(l, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(l, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(l, data, 63, 4, 4)) || assert_ascii(l, 0x0, 0x194, 0x88000000, 0x8000000)) || l.isUniID(data)) || l.isNum(data)) || l.isSym(true, data)) {
            pushFN(data, branch_7fe3eae917c31513);
            return branch_5916dde053a4650d(l, data, state, prod, 1);
        }
        return -1;
        /*345b32d9d4006ef9e70ba096d1c8feab*/
    }
    function branch_3542cba400bdc4b9(l, data, state, prod, puid) {
        return 67;
        /*3542cba400bdc4b9ce1e16224c015816*/
    }
    function branch_367228fef7264279(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*48:138 identifier_token=>identifier_token_group_075_117 identifier_token_HC_listbody1_118 • identifier_token_group_080_119*/
        puid |= 4;
        pushFN(data, branch_41ff52b1bc0fd96e);
        pushFN(data, $identifier_token_group_080_119);
        return puid;
        return -1;
        /*367228fef7264279e201318026dacf5e*/
    }
    function branch_368b43eb9546f896(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*69:211 comment_HC_listbody1_132=>comment_HC_listbody1_132 • comment_group_0139_130*/
        puid |= 2;
        pushFN(data, branch_cfb3fe9c738c88e2);
        pushFN(data, $comment_group_0139_130);
        return puid;
        return -1;
        /*368b43eb9546f896d5a98ea071190690*/
    }
    function branch_382842d2b736c8bb(l, data, state, prod, puid) {
        add_reduce(state, data, 2, 80);
        return 55;
        /*382842d2b736c8bb869e76e094b8ba17*/
    }
    function branch_390cc8615466c00e(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*99:295 def$string_token=>def$string_token • def$string_value*/
        puid |= 2;
        pushFN(data, branch_cfb3fe9c738c88e2);
        pushFN(data, $def$string_value);
        return puid;
        return -1;
        /*390cc8615466c00ec5279154c8aff89f*/
    }
    function branch_398d9230ecf58463(l, data, state, prod, puid) {
        add_reduce(state, data, 3, 0);
        return 48;
        /*398d9230ecf58463cef6787e4958c074*/
    }
    function branch_39bdeca216a17699(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 4;
        if (/*[asterisk/]*/cmpr_set(l, data, 18, 2, 2) && consume(l, data, state)) {
            add_reduce(state, data, 3, 0);
            return prod;
        }
        return -1;
        /*39bdeca216a17699b1ff0e60a65ff74f*/
    }
    function branch_3a985b31481fef67(l, data, state, prod, puid) {
        return 97;
        /*3a985b31481fef67dda8ad342da78931*/
    }
    function branch_3aab1ebf3294da29(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*66:202 modifier=>• export*/
        puid |= 4;
        consume(l, data, state);
        return prod;
        return -1;
        /*3aab1ebf3294da293c3419bc6454b78d*/
    }
    function branch_3b0ef60671ff3b91(l, data, state, prod, puid) {
        /*108:328 virtual-127:4:1|--lvl:0=>• : type primitive_declaration_group_170_116
        109:329 virtual-129:3:1|--lvl:0=>• : type
        110:330 virtual-118:1:1|--lvl:0=>•*/
        switch (sym_map_9fff07fe93fb5f87(l, data)) {
            case 0:
                /*108:328 virtual-127:4:1|--lvl:0=>• : type primitive_declaration_group_170_116
                109:329 virtual-129:3:1|--lvl:0=>• : type*/
                var pk = l.copy();
                skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, 0);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if (((((/*[uint]*/cmpr_set(pk, data, 83, 4, 4) ||/*[int]*/cmpr_set(pk, data, 84, 3, 3)) ||/*[flt]*/cmpr_set(pk, data, 125, 3, 3)) || dt_1e3f2d5b696b270e(pk, data)) || assert_ascii(pk, 0x0, 0x10, 0x80000000, 0x200240)) || pk.isUniID(data)) {
                    /*108:328 virtual-127:4:1|--lvl:0=>• : type primitive_declaration_group_170_116
                    109:329 virtual-129:3:1|--lvl:0=>• : type*/
                    /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                    consume(l, data, state);
                    puid |= 4;
                    /*108:328 virtual-127:4:1|--lvl:0=>: • type primitive_declaration_group_170_116
                    109:329 virtual-129:3:1|--lvl:0=>: • type*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    pushFN(data, branch_0d17eba9587f77ed);
                    pushFN(data, $type);
                    puid |= 8;
                    return puid;
                }
            default:
            case 1:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                /*110:330 virtual-118:1:1|--lvl:0=>•*/
                add_reduce(state, data, 1, 68);
                pushFN(data, $expression_statements_goto);
                return 37;
        }
        return -1;
        /*3b0ef60671ff3b91944179f062198534*/
    }
    function branch_3b4899584dc324a2(l, data, state, prod, puid) {
        /*13:36 function=>modifier_list fn identifier : type • ( parameters ) { expression_statements }
        13:38 function=>modifier_list fn identifier : type • ( ) { expression_statements }
        13:39 function=>modifier_list fn identifier : type • ( parameters ) { }
        13:42 function=>modifier_list fn identifier : type • ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 40/*[(]*/) {
            consume(l, data, state);
            puid |= 32;
            /*13:36 function=>modifier_list fn identifier : type ( • parameters ) { expression_statements }
            13:39 function=>modifier_list fn identifier : type ( • parameters ) { }
            13:38 function=>modifier_list fn identifier : type ( • ) { expression_statements }
            13:42 function=>modifier_list fn identifier : type ( • ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (l.current_byte == 41/*[)]*/) {
                /*13:38 function=>modifier_list fn identifier : type ( • ) { expression_statements }
                13:42 function=>modifier_list fn identifier : type ( • ) { }*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l, data, state);
                puid |= 128;
                /*13:38 function=>modifier_list fn identifier : type ( ) • { expression_statements }
                13:42 function=>modifier_list fn identifier : type ( ) • { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                if (l.current_byte == 123/*[{]*/) {
                    consume(l, data, state);
                    puid |= 256;
                    /*13:38 function=>modifier_list fn identifier : type ( ) { • expression_statements }
                    13:42 function=>modifier_list fn identifier : type ( ) { • }*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    if (l.current_byte == 125/*[}]*/) {
                        pushFN(data, branch_2d70052e1cc76d5c);
                        return branch_1537086d834283de(l, data, state, prod, 256);
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    } else if (((((((((((((((/*[if]*/cmpr_set(l, data, 143, 2, 2) ||/*[match]*/cmpr_set(l, data, 67, 5, 5)) ||/*[break]*/cmpr_set(l, data, 72, 5, 5)) ||/*[return]*/cmpr_set(l, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(l, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(l, data, 63, 4, 4)) ||/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) ||/*[==]*/cmpr_set(l, data, 7, 2, 2)) || dt_bcea2102060eab13(l, data)) ||/*[true]*/cmpr_set(l, data, 95, 4, 4)) ||/*[null]*/cmpr_set(l, data, 35, 4, 4)) || dt_6ae31dd85a62ef5c(l, data)) || assert_ascii(l, 0x0, 0x194, 0x88000000, 0x8000000)) || l.isUniID(data)) || l.isNum(data)) || l.isSym(true, data)) {
                        pushFN(data, branch_2d70052e1cc76d5c);
                        return branch_006279d139f628f8(l, data, state, prod, 256);
                    }
                }
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if (assert_ascii(l, 0x0, 0x10, 0x88000000, 0x0) || l.isUniID(data)) {
                /*13:36 function=>modifier_list fn identifier : type ( • parameters ) { expression_statements }
                13:39 function=>modifier_list fn identifier : type ( • parameters ) { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                pushFN(data, branch_69f07bd182d24266);
                pushFN(data, $parameters);
                puid |= 64;
                return puid;
            }
        }
        return -1;
        /*3b4899584dc324a23830e9c24cff9733*/
    }
    function branch_3b5f59d84e4a737c(l, data, state, prod, puid) {
        /*11:25 class=>cls identifier • class_group_113_103 { class_HC_listbody1_105 }
        11:29 class=>cls identifier • class_group_113_103 { }
        11:28 class=>cls identifier • { class_HC_listbody1_105 }
        11:31 class=>cls identifier • { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if (l.current_byte == 123/*[{]*/) {
            /*11:28 class=>cls identifier • { class_HC_listbody1_105 }
            11:31 class=>cls identifier • { }*/
            var pk = l.copy();
            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, 0);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (pk.current_byte == 125/*[}]*/) {
                pushFN(data, branch_7dcd4e56969f4413);
                return branch_f600e24803492312(l, data, state, prod, 4);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            } else if (((/*[str]*/cmpr_set(pk, data, 47, 3, 3) ||/*[fn]*/cmpr_set(pk, data, 144, 2, 2)) || assert_ascii(pk, 0x0, 0x10, 0x88000000, 0x0)) || pk.isUniID(data)) {
                pushFN(data, branch_7dcd4e56969f4413);
                return branch_3e5e1376b553fd48(l, data, state, prod, 4);
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (/*[is]*/cmpr_set(l, data, 141, 2, 2)) {
            /*11:25 class=>cls identifier • class_group_113_103 { class_HC_listbody1_105 }
            11:29 class=>cls identifier • class_group_113_103 { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_5be6fbf647afebb1);
            pushFN(data, $class_group_113_103);
            puid |= 8;
            return puid;
        }
        return -1;
        /*3b5f59d84e4a737ceb53d7274152f36b*/
    }
    function branch_3b892915cdeddc1e(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        /*71:215 comment=>• // comment_HC_listbody1_132 comment_group_0144_133*/
        puid |= 8;
        consume(l, data, state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 16;
        pushFN(data, branch_8365807fe294cb4b);
        pushFN(data, $comment_HC_listbody1_132);
        return puid;
        return -1;
        /*3b892915cdeddc1e4c8a336ef76228e2*/
    }
    function branch_3bd98293758415a9(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        /*60:180 string=>• ' string_HC_listbody1_127 '*/
        puid |= 4;
        consume(l, data, state);
        skip_db1786a8af54d666(l/*[ 71 ]*/, data, state);
        puid |= 8;
        pushFN(data, branch_bf4d628fd683f267);
        pushFN(data, $string_HC_listbody1_127);
        return puid;
        return -1;
        /*3bd98293758415a92ab713bbf502d8c5*/
    }
    function branch_3deeecd660467dae(l, data, state, prod, puid) {
        /*13:36 function=>modifier_list fn identifier • : type ( parameters ) { expression_statements }
        13:38 function=>modifier_list fn identifier • : type ( ) { expression_statements }
        13:39 function=>modifier_list fn identifier • : type ( parameters ) { }
        13:42 function=>modifier_list fn identifier • : type ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 58/*[:]*/) {
            consume(l, data, state);
            puid |= 8;
            /*13:36 function=>modifier_list fn identifier : • type ( parameters ) { expression_statements }
            13:38 function=>modifier_list fn identifier : • type ( ) { expression_statements }
            13:39 function=>modifier_list fn identifier : • type ( parameters ) { }
            13:42 function=>modifier_list fn identifier : • type ( ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_84e0e203f7da8a50);
            pushFN(data, $type);
            puid |= 16;
            return puid;
        }
        return -1;
        /*3deeecd660467dae6e4f4ebfacdb2bd7*/
    }
    function branch_3e0c941c38400c15(l, data, state, prod, puid) {
        pushFN(data, $unary_value_goto);
        return 72;
        /*3e0c941c38400c157cd9c4e298710949*/
    }
    function branch_3e5e1376b553fd48(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        /*11:28 class=>cls identifier • { class_HC_listbody1_105 }*/
        puid |= 16;
        consume(l, data, state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 32;
        pushFN(data, branch_1316bf4736ec7708);
        pushFN(data, $class_HC_listbody1_105);
        return puid;
        return -1;
        /*3e5e1376b553fd48455aef0851bb3139*/
    }
    function branch_3e6ee8775062329c(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $def$defaultproductions_HC_listbody1_100_goto);
        return 74;
        /*3e6ee8775062329c28be70c9457025bc*/
    }
    function branch_3e7b23ce1500191b(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*72:219 template=><<-- • -->>*/
        puid |= 4;
        consume(l, data, state);
        add_reduce(state, data, 2, 0);
        return prod;
        return -1;
        /*3e7b23ce1500191beecd9b5558cd43f9*/
    }
    function branch_3edd60951d2b3437(l, data, state, prod, puid) {
        add_reduce(state, data, 5, 74);
        return prod;
        /*3edd60951d2b3437cb1575c602968d63*/
    }
    function branch_40a7ef9e3eb88045(l, data, state, prod, puid) {
        while (1) {
            switch (prod) {
                case 16:
                    /*115:335 virtual-329:8:1|--lvl:1=>parameters • ; expression ; loop_expression_HC_listbody6_112 ) expression
                    16:54 parameters=>parameters • , primitive_declaration
                    116:336 virtual-330:7:1|--lvl:1=>parameters • ; ; loop_expression_HC_listbody6_112 ) expression
                    117:337 virtual-331:7:1|--lvl:1=>parameters • ; expression ; ) expression
                    118:338 virtual-332:6:1|--lvl:1=>parameters • ; ; ) expression*/
                    /*115:335 virtual-329:8:1|--lvl:1=>parameters • ; expression ; loop_expression_HC_listbody6_112 ) expression
                    116:336 virtual-330:7:1|--lvl:1=>parameters • ; ; loop_expression_HC_listbody6_112 ) expression
                    117:337 virtual-331:7:1|--lvl:1=>parameters • ; expression ; ) expression
                    118:338 virtual-332:6:1|--lvl:1=>parameters • ; ; ) expression
                    16:54 parameters=>parameters • , primitive_declaration*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    if (l.current_byte == 59/*[;]*/) {
                        /*115:335 virtual-329:8:1|--lvl:1=>parameters • ; expression ; loop_expression_HC_listbody6_112 ) expression
                        117:337 virtual-331:7:1|--lvl:1=>parameters • ; expression ; ) expression
                        116:336 virtual-330:7:1|--lvl:1=>parameters • ; ; loop_expression_HC_listbody6_112 ) expression
                        118:338 virtual-332:6:1|--lvl:1=>parameters • ; ; ) expression*/
                        var pk = l.copy();
                        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, 0);
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        if (pk.current_byte == 59/*[;]*/) {
                            /*116:336 virtual-330:7:1|--lvl:1=>parameters • ; ; loop_expression_HC_listbody6_112 ) expression
                            118:338 virtual-332:6:1|--lvl:1=>parameters • ; ; ) expression*/
                            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                            consume(l, data, state);
                            puid |= 32;
                            /*116:336 virtual-330:7:1|--lvl:1=>parameters ; • ; loop_expression_HC_listbody6_112 ) expression
                            118:338 virtual-332:6:1|--lvl:1=>parameters ; • ; ) expression*/
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                            if (l.current_byte == 59/*[;]*/) {
                                consume(l, data, state);
                                puid |= 32;
                                /*116:336 virtual-330:7:1|--lvl:1=>parameters ; ; • loop_expression_HC_listbody6_112 ) expression
                                118:338 virtual-332:6:1|--lvl:1=>parameters ; ; • ) expression*/
                                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                                /*⤋⤋⤋ assert ⤋⤋⤋*/
                                if (l.current_byte == 41/*[)]*/) {
                                    pushFN(data, branch_4a236324dddf6f01);
                                    return branch_48b44191a1f5c9a2(l, data, state, prod, 32);
                                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                                } else if (((((((((((((((/*[if]*/cmpr_set(l, data, 143, 2, 2) ||/*[match]*/cmpr_set(l, data, 67, 5, 5)) ||/*[break]*/cmpr_set(l, data, 72, 5, 5)) ||/*[return]*/cmpr_set(l, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(l, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(l, data, 63, 4, 4)) ||/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) ||/*[==]*/cmpr_set(l, data, 7, 2, 2)) || dt_bcea2102060eab13(l, data)) ||/*[true]*/cmpr_set(l, data, 95, 4, 4)) ||/*[null]*/cmpr_set(l, data, 35, 4, 4)) || dt_6ae31dd85a62ef5c(l, data)) || assert_ascii(l, 0x0, 0x194, 0x88000000, 0x8000000)) || l.isUniID(data)) || l.isNum(data)) || l.isSym(true, data)) {
                                    pushFN(data, branch_4a236324dddf6f01);
                                    return branch_c39b0850baca60a1(l, data, state, prod, 32);
                                }
                            }
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        } else if (((((((((((((((/*[<<--]*/cmpr_set(pk, data, 20, 4, 4) ||/*[if]*/cmpr_set(pk, data, 143, 2, 2)) ||/*[match]*/cmpr_set(pk, data, 67, 5, 5)) ||/*[==]*/cmpr_set(pk, data, 7, 2, 2)) || dt_bcea2102060eab13(pk, data)) || dt_6ae31dd85a62ef5c(pk, data)) ||/*[true]*/cmpr_set(pk, data, 95, 4, 4)) ||/*[null]*/cmpr_set(pk, data, 35, 4, 4)) ||/*[break]*/cmpr_set(pk, data, 72, 5, 5)) ||/*[return]*/cmpr_set(pk, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(pk, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(pk, data, 63, 4, 4)) || assert_ascii(pk, 0x0, 0x194, 0x88000000, 0x8000000)) || pk.isUniID(data)) || pk.isNum(data)) || pk.isSym(true, data)) {
                            /*115:335 virtual-329:8:1|--lvl:1=>parameters • ; expression ; loop_expression_HC_listbody6_112 ) expression
                            117:337 virtual-331:7:1|--lvl:1=>parameters • ; expression ; ) expression*/
                            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                            consume(l, data, state);
                            puid |= 32;
                            /*115:335 virtual-329:8:1|--lvl:1=>parameters ; • expression ; loop_expression_HC_listbody6_112 ) expression
                            117:337 virtual-331:7:1|--lvl:1=>parameters ; • expression ; ) expression*/
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                            pushFN(data, branch_19af09a22d36fdd3);
                            pushFN(data, $expression);
                            puid |= 4;
                            return puid;
                        }
                        /*⤋⤋⤋ assert ⤋⤋⤋*/
                    } else if (l.current_byte == 44/*[,]*/) {
                        pushFN(data, branch_725f3e21be9721d4);
                        return branch_2fc8e06271cc27a3(l, data, state, prod, 1);
                    }
                    break;
                case 21:
                    /*114:334 virtual-92:3:1|--lvl:1=>expression • )*/
                    /*114:334 virtual-92:3:1|--lvl:1=>expression • )*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                    if (l.current_byte == 41/*[)]*/) {
                        consume(l, data, state);
                        puid |= 4;
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                        /*114:334 virtual-92:3:1|--lvl:1=>expression ) •*/
                        pushFN(data, branch_18ddf6ec17b31727);
                        return 29;
                    }
                    break;
                case 26:
                    /*25:80 binary_expression=>unary_expression • operator
                    25:81 binary_expression=>unary_expression • operator expression
                    25:82 binary_expression=>unary_expression •*/
                    /*25:80 binary_expression=>unary_expression • operator
                    25:81 binary_expression=>unary_expression • operator expression
                    25:82 binary_expression=>unary_expression •*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    if (sym_map_e58af9c6fd146069(l, data) == 1) {
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*25:82 binary_expression=>unary_expression •*/
                        prod = 21;
                        continue;;
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    } else if (/*[==]*/cmpr_set(l, data, 7, 2, 2) || l.isSym(true, data)) {
                        /*25:80 binary_expression=>unary_expression • operator
                        25:81 binary_expression=>unary_expression • operator expression*/
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                        pushFN(data, branch_e10166b57a188545);
                        pushFN(data, $operator);
                        puid |= 2;
                        return puid;
                    }
                    break;
                case 28:
                    /*22:76 assignment_expression=>left_hand_expression • = expression
                    27:85 unary_value=>left_hand_expression •*/
                    /*22:76 assignment_expression=>left_hand_expression • = expression
                    27:85 unary_value=>left_hand_expression •*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    switch (sym_map_00f57473245d5924(l, data)) {
                        case 0:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert ⤋⤋⤋*/
                            /*22:76 assignment_expression=>left_hand_expression • = expression*/
                            puid |= 2;
                            consume(l, data, state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                            puid |= 4;
                            pushFN(data, branch_b5bbf56a3254f13b);
                            pushFN(data, $expression);
                            return puid;
                        default:
                        case 1:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                            /*27:85 unary_value=>left_hand_expression •*/
                            prod = 26;
                            continue;;
                    }
                    break;
                case 37:
                    /*28:91 left_hand_expression=>member_expression •
                    37:115 member_expression=>member_expression • . identifier
                    37:116 member_expression=>member_expression • [ expression ]
                    36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                    36:114 call_expression=>member_expression • ( )*/
                    /*28:91 left_hand_expression=>member_expression •
                    37:116 member_expression=>member_expression • [ expression ]
                    37:115 member_expression=>member_expression • . identifier
                    36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                    36:114 call_expression=>member_expression • ( )*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    switch (sym_map_c82afb129e509311(l, data)) {
                        case 0:
                            /*28:91 left_hand_expression=>member_expression •
                            37:116 member_expression=>member_expression • [ expression ]*/
                            var pk = l.copy();
                            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, 0);
                            switch (sym_map_7b992290c905e3fc(pk, data)) {
                                case 0:
                                    /*--LEAF--*/
                                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                                    /*37:116 member_expression=>member_expression • [ expression ]*/
                                    puid |= 8;
                                    consume(l, data, state);
                                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                                    puid |= 16;
                                    pushFN(data, branch_c19991e72069e891);
                                    pushFN(data, $expression);
                                    return puid;
                                default:
                                case 1:
                                    /*--LEAF--*/
                                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                                    /*28:91 left_hand_expression=>member_expression •*/
                                    prod = 28;
                                    continue;;
                                case 2:
                                    /*--LEAF--*/
                                    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                                    /*37:116 member_expression=>member_expression • [ expression ]*/
                                    puid |= 8;
                                    consume(l, data, state);
                                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                                    puid |= 16;
                                    pushFN(data, branch_c19991e72069e891);
                                    pushFN(data, $expression);
                                    return puid;
                            }
                        case 1:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert ⤋⤋⤋*/
                            /*37:115 member_expression=>member_expression • . identifier*/
                            puid |= 2;
                            consume(l, data, state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                            puid |= 4;
                            pushFN(data, branch_828d52dd7a7ed1f8);
                            pushFN(data, $identifier);
                            return puid;
                        case 2:
                            /*36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                            36:114 call_expression=>member_expression • ( )*/
                            var pk = l.copy();
                            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, 0);
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                            if (pk.current_byte == 41/*[)]*/) {
                                pushFN(data, branch_a1186298bc0087ac);
                                return branch_f29ead3e741f692c(l, data, state, prod, 1);
                                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                            } else if (((((((((((((((/*[if]*/cmpr_set(pk, data, 143, 2, 2) ||/*[match]*/cmpr_set(pk, data, 67, 5, 5)) ||/*[break]*/cmpr_set(pk, data, 72, 5, 5)) ||/*[return]*/cmpr_set(pk, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(pk, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(pk, data, 63, 4, 4)) ||/*[<<--]*/cmpr_set(pk, data, 20, 4, 4)) ||/*[==]*/cmpr_set(pk, data, 7, 2, 2)) || dt_bcea2102060eab13(pk, data)) ||/*[true]*/cmpr_set(pk, data, 95, 4, 4)) ||/*[null]*/cmpr_set(pk, data, 35, 4, 4)) || dt_6ae31dd85a62ef5c(pk, data)) || assert_ascii(pk, 0x0, 0x194, 0x88000000, 0x8000000)) || pk.isUniID(data)) || pk.isNum(data)) || pk.isSym(true, data)) {
                                pushFN(data, branch_a1186298bc0087ac);
                                return branch_25c768d9c9093ad1(l, data, state, prod, 1);
                            }
                        default:
                        case 3:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                            /*28:91 left_hand_expression=>member_expression •*/
                            prod = 28;
                            continue;;
                    }
                    break;
                case 43:
                    /*16:55 parameters=>primitive_declaration •
                    119:339 virtual-333:6:1|--lvl:1=>primitive_declaration • in expression ) expression*/
                    /*16:55 parameters=>primitive_declaration •
                    119:339 virtual-333:6:1|--lvl:1=>primitive_declaration • in expression ) expression*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    if (/*[in]*/cmpr_set(l, data, 43, 2, 2)) {
                        pushFN(data, branch_4a236324dddf6f01);
                        return branch_61e4e40e216cb862(l, data, state, prod, 256);
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    } else {
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*16:55 parameters=>primitive_declaration •*/
                        add_reduce(state, data, 1, 3);
                        prod = 16;
                        continue;;
                    }
                    break;
                case 44:
                    /*37:118 member_expression=>identifier •
                    43:127 primitive_declaration=>identifier • : type primitive_declaration_group_170_116
                    43:129 primitive_declaration=>identifier • : type*/
                    /*37:118 member_expression=>identifier •
                    43:127 primitive_declaration=>identifier • : type primitive_declaration_group_170_116
                    43:129 primitive_declaration=>identifier • : type*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    switch (sym_map_9fff07fe93fb5f87(l, data)) {
                        case 0:
                            /*37:118 member_expression=>identifier •
                            43:127 primitive_declaration=>identifier • : type primitive_declaration_group_170_116
                            43:129 primitive_declaration=>identifier • : type*/
                            var pk = l.copy();
                            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, 0);
                            switch (sym_map_28592a8cdba54a6c(pk, data)) {
                                case 0:
                                    /*43:127 primitive_declaration=>identifier • : type primitive_declaration_group_170_116
                                    43:129 primitive_declaration=>identifier • : type*/
                                    /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                                    consume(l, data, state);
                                    puid |= 4;
                                    /*43:127 primitive_declaration=>identifier : • type primitive_declaration_group_170_116
                                    43:129 primitive_declaration=>identifier : • type*/
                                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                                    pushFN(data, branch_9cfdbe8e2848ebd3);
                                    pushFN(data, $type);
                                    puid |= 8;
                                    return puid;
                                default:
                                case 1:
                                    /*--LEAF--*/
                                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                                    /*37:118 member_expression=>identifier •*/
                                    add_reduce(state, data, 1, 68);
                                    prod = 37;
                                    continue;;
                                case 2:
                                    /*-------------VPROD-------------------------*/
                                    /*37:118 member_expression=>identifier •
                                    43:127 primitive_declaration=>identifier • : type primitive_declaration_group_170_116
                                    43:129 primitive_declaration=>identifier • : type*/
                                    pushFN(data, branch_b0d9563b6096167b);
                                    return 0;
                            }
                        default:
                        case 1:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                            /*37:118 member_expression=>identifier •*/
                            add_reduce(state, data, 1, 68);
                            prod = 37;
                            continue;;
                    }
                    break;
                case 50:
                    /*14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
                    14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
                    14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
                    14:50 function_expression=>modifier_list • fn : type ( ) { }
                    43:126 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_170_116
                    43:128 primitive_declaration=>modifier_list • identifier : type*/
                    /*14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
                    14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
                    14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
                    14:50 function_expression=>modifier_list • fn : type ( ) { }
                    43:126 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_170_116
                    43:128 primitive_declaration=>modifier_list • identifier : type*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    if (/*[fn]*/cmpr_set(l, data, 144, 2, 2)) {
                        /*14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
                        14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
                        14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
                        14:50 function_expression=>modifier_list • fn : type ( ) { }*/
                        /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                        consume(l, data, state);
                        puid |= 2;
                        /*14:44 function_expression=>modifier_list fn • : type ( parameters ) { expression_statements }
                        14:46 function_expression=>modifier_list fn • : type ( ) { expression_statements }
                        14:47 function_expression=>modifier_list fn • : type ( parameters ) { }
                        14:50 function_expression=>modifier_list fn • : type ( ) { }*/
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                        if (l.current_byte == 58/*[:]*/) {
                            consume(l, data, state);
                            puid |= 4;
                            /*14:44 function_expression=>modifier_list fn : • type ( parameters ) { expression_statements }
                            14:46 function_expression=>modifier_list fn : • type ( ) { expression_statements }
                            14:47 function_expression=>modifier_list fn : • type ( parameters ) { }
                            14:50 function_expression=>modifier_list fn : • type ( ) { }*/
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                            pushFN(data, branch_aa931ce591aec83c);
                            pushFN(data, $type);
                            puid |= 8;
                            return puid;
                        }
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    } else if (((l.current_byte == 95/*[_]*/) || (l.current_byte == 36/*[$]*/)) || l.isUniID(data)) {
                        /*43:126 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_170_116
                        43:128 primitive_declaration=>modifier_list • identifier : type*/
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                        pushFN(data, branch_e7e3b3f97d323f23);
                        pushFN(data, $identifier);
                        puid |= 2;
                        return puid;
                    }
                    break;
            }
            break;
        }
        /*40a7ef9e3eb880455e0c33483d2d81bb*/
    }
    function branch_40c7e0ff14e39a95(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*121:341 virtual-127:4:1|--lvl:2=>: type • primitive_declaration_group_170_116*/
        puid |= 16;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $primitive_declaration_group_170_116);
        return puid;
        return -1;
        /*40c7e0ff14e39a95a5a5848d2f42c93f*/
    }
    function branch_410eeb6368911ba4(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*9:21 class_group_016_104=>• function*/
        puid |= 4;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $function);
        return puid;
        return -1;
        /*410eeb6368911ba48b74ad321c24a730*/
    }
    function branch_41ddfa96615c0efb(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*31:104 loop_expression=>loop ( parameters ; ; • ) expression*/
        puid |= 128;
        consume(l, data, state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 4;
        pushFN(data, branch_f1978b468656cbf1);
        pushFN(data, $expression);
        return puid;
        return -1;
        /*41ddfa96615c0efb5f2e94b1c6b60443*/
    }
    function branch_41e887c73114fb6a(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*56:165 value=>• tk:string*/
        puid |= 2;
        if (tk_c36d1187450f8760(l, data) && consume(l, data, state)) {
            add_reduce(state, data, 1, 83);
            return prod;
        }
        return -1;
        /*41e887c73114fb6aa4dd4cf620e228a8*/
    }
    function branch_41ff52b1bc0fd96e(l, data, state, prod, puid) {
        add_reduce(state, data, 3, 0);
        return prod;
        /*41ff52b1bc0fd96eb7dd8c252a6f7e4b*/
    }
    function branch_424b2ca54b6272ce(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 32;
        if ((l.current_byte == 93/*[]]*/) && consume(l, data, state)) {
            add_reduce(state, data, 4, 66);
            /*-------------INDIRECT-------------------*/
            pushFN(data, $unary_value_goto);
            return 37;
        }
        return -1;
        /*424b2ca54b6272ce6f057ab62c53203d*/
    }
    function branch_425efa1cfc8ffc16(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, $def$binary_token_HC_listbody1_107_goto);
        return 91;
        /*425efa1cfc8ffc16fc6203a3c9b369a1*/
    }
    function branch_426a18e31d408115(l, data, state, prod, puid) {
        /*25:80 binary_expression=>unary_expression operator •
        25:81 binary_expression=>unary_expression operator • expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        switch (sym_map_b5b0535fb6bbe10a(l, data)) {
            default:
            case 0:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                /*25:80 binary_expression=>unary_expression operator •*/
                add_reduce(state, data, 2, 46);
                return 25;
            case 1:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*25:81 binary_expression=>unary_expression operator • expression*/
                puid |= 4;
                pushFN(data, branch_5294e131c0c29de5);
                pushFN(data, $expression);
                return puid;
            case 2:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                /*25:81 binary_expression=>unary_expression operator • expression*/
                puid |= 4;
                pushFN(data, branch_5294e131c0c29de5);
                pushFN(data, $expression);
                return puid;
        }
        return -1;
        /*426a18e31d408115fc9e6f2f11fcfe99*/
    }
    function branch_4362b80f6cbd9c89(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, $call_expression_HC_listbody2_114_goto);
        return 35;
        /*4362b80f6cbd9c89e35b4472ffd19cab*/
    }
    function branch_43bb0d1e77b298fe(l, data, state, prod, puid) {
        /*43:126 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_170_116
        43:128 primitive_declaration=>modifier_list identifier : type •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 61/*[=]*/) {
            pushFN(data, branch_0372dbd01ff9f446);
            return branch_8648628ea28d7554(l, data, state, prod, 8);
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*43:128 primitive_declaration=>modifier_list identifier : type •*/
            add_reduce(state, data, 4, 76);
            return 43;
        }
        return -1;
        /*43bb0d1e77b298fe549be5e67d2d5c04*/
    }
    function branch_43bfdac24213de5e(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*52:150 type_group_092_122=>• 16*/
        puid |= 2;
        consume(l, data, state);
        return prod;
        return -1;
        /*43bfdac24213de5e2d27989afbbd3b03*/
    }
    function branch_467592e64b88958b(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 1024;
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 10, 21);
            return prod;
        }
        return -1;
        /*467592e64b88958bcc02e3639292fc50*/
    }
    function branch_469c46d3e6b96575(l, data, state, prod, puid) {
        add_reduce(state, data, 3, 36);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $parameters_HC_listbody10_106_goto);
        return 15;
        /*469c46d3e6b96575e902de2433410ed3*/
    }
    function branch_471848cd89af1da5(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*97:292 def$string=>• ' def$string_token '*/
        puid |= 4;
        consume(l, data, state);
        skip_a294e41529bc9275(l/*[ nl ][ 71 ]*/, data, state);
        puid |= 2;
        pushFN(data, branch_f023ab1475a73fda);
        pushFN(data, $def$string_token);
        return puid;
        return -1;
        /*471848cd89af1da5d3dff12f386713c3*/
    }
    function branch_47406f0158ff4614(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*66:200 modifier=>• pub*/
        puid |= 1;
        consume(l, data, state);
        return prod;
        return -1;
        /*47406f0158ff4614b9af0848e18ff443*/
    }
    function branch_485e7848dc9e7e5b(l, data, state, prod, puid) {
        return 57;
        /*485e7848dc9e7e5b8cd6ca1ebdc37e42*/
    }
    function branch_48867132be82452f(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*13:43 function=>fn identifier : type ( ) { • }*/
        puid |= 1024;
        consume(l, data, state);
        add_reduce(state, data, 8, 27);
        return prod;
        return -1;
        /*48867132be82452f666128c5de8e9836*/
    }
    function branch_48b44191a1f5c9a2(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*118:338 virtual-332:6:1|--lvl:1=>parameters ; ; • ) expression*/
        puid |= 128;
        consume(l, data, state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 4;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $expression);
        return puid;
        return -1;
        /*48b44191a1f5c9a28e41ea3b0e9d97d5*/
    }
    function branch_48e3d2ad1adfc4ee(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*12:34 struct=>modifier_list str identifier { • }*/
        puid |= 32;
        consume(l, data, state);
        add_reduce(state, data, 5, 18);
        return prod;
        return -1;
        /*48e3d2ad1adfc4eee819e1a7d2720246*/
    }
    function branch_4a236324dddf6f01(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        add_reduce(state, data, 7, 52);
        return 31;
        /*4a236324dddf6f01ce53814836f27067*/
    }
    function branch_4a34f977929a3738(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, $def$js_id_symbols_goto);
        return 105;
        /*4a34f977929a3738cccdac0e2185e15e*/
    }
    function branch_4b9599a58ed8e9b7(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*77:239 def$hex_digit=>• τB*/
        puid |= 256;
        consume(l, data, state);
        return prod;
        return -1;
        /*4b9599a58ed8e9b759196a5550a0a1f4*/
    }
    function branch_4bdf7a450c230f77(l, data, state, prod, puid) {
        return 90;
        /*4bdf7a450c230f77f2251e98093845ad*/
    }
    function branch_4db389afdb5f8499(l, data, state, prod, puid) {
        add_reduce(state, data, 2, 0);
        return 92;
        /*4db389afdb5f8499a2d9ca0c66579d61*/
    }
    function branch_4dcc18167384c0b1(l, data, state, prod, puid) {
        return 86;
        /*4dcc18167384c0b1063e9dea329edb6b*/
    }
    function branch_4e0b85dc6e5ddc9d(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*100:298 def$string_value_group_071_112=>• θid*/
        puid |= 2;
        consume(l, data, state);
        return prod;
        return -1;
        /*4e0b85dc6e5ddc9d29fe52add27144ee*/
    }
    function branch_4e10e2b6d2141ce9(l, data, state, prod, puid) {
        add_reduce(state, data, 3, 47);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $expression_statements_group_023_108_goto);
        return 18;
        /*4e10e2b6d2141ce9b5bf2471b397370e*/
    }
    function branch_4e1b33a7601b1313(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*108:328 virtual-192:3:1|--lvl:0=>operator_HC_listbody1_128 • identifier_token_group_080_119*/
        puid |= 4;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $identifier_token_group_080_119);
        return puid;
        return -1;
        /*4e1b33a7601b1313d036b8a9a44c7b32*/
    }
    function branch_4e2e169b2574575f(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*88:270 def$hex_token_HC_listbody1_105=>def$hex_token_HC_listbody1_105 • def$hex_token_group_044_104*/
        puid |= 2;
        pushFN(data, branch_cfb3fe9c738c88e2);
        pushFN(data, $def$hex_token_group_044_104);
        return puid;
        return -1;
        /*4e2e169b2574575f3c3053b597be279b*/
    }
    function branch_4e5d3c818eb95719(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        /*60:181 string=>• " "*/
        puid |= 1;
        consume(l, data, state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 1;
        if ((l.current_byte == 34/*["]*/) && consume(l, data, state)) {
            add_reduce(state, data, 2, 90);
            return prod;
        }
        return -1;
        /*4e5d3c818eb95719a8182cbf467d8c0e*/
    }
    function branch_4ec36f9dc7352267(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*4:9 statements=>• struct*/
        puid |= 16;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $struct);
        return puid;
        return -1;
        /*4ec36f9dc73522676d68d1cb1a436396*/
    }
    function branch_4f89c2bc65fa3722(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*111:331 virtual-101:8:1|--lvl:0=>( parameters ; expression ; • ) expression*/
        puid |= 128;
        consume(l, data, state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 4;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $expression);
        return puid;
        return -1;
        /*4f89c2bc65fa372255086d1e78ad529c*/
    }
    function branch_5024871207a62363(l, data, state, prod, puid) {
        /*12:32 struct=>modifier_list str identifier • { parameters }
        12:34 struct=>modifier_list str identifier • { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 123/*[{]*/) {
            consume(l, data, state);
            puid |= 8;
            /*12:32 struct=>modifier_list str identifier { • parameters }
            12:34 struct=>modifier_list str identifier { • }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if (l.current_byte == 125/*[}]*/) {
                pushFN(data, branch_063c26611b6f5f75);
                return branch_48e3d2ad1adfc4ee(l, data, state, prod, 8);
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if (assert_ascii(l, 0x0, 0x10, 0x88000000, 0x0) || l.isUniID(data)) {
                pushFN(data, branch_063c26611b6f5f75);
                return branch_5e571d27ef8a89c6(l, data, state, prod, 8);
            }
        }
        return -1;
        /*5024871207a6236377ee8ecc2c880bcf*/
    }
    function branch_51676bb01a9fcef8(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*105:318 def$js_id_symbols=>• θid*/
        puid |= 2;
        consume(l, data, state);
        return prod;
        return -1;
        /*51676bb01a9fcef8f8fa25614f88c71f*/
    }
    function branch_521f65aff0d7939b(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, $expression_statements_goto);
        return 26;
        /*521f65aff0d7939bee7202ac130582d4*/
    }
    function branch_52629b1407015494(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*30:94 loop_expression_HC_listbody6_112=>loop_expression_HC_listbody6_112 • , expression*/
        puid |= 2;
        consume(l, data, state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 4;
        pushFN(data, branch_a128b75b77459fe9);
        pushFN(data, $expression);
        return puid;
        return -1;
        /*52629b14070154946d81c41ba747a978*/
    }
    function branch_5294e131c0c29de5(l, data, state, prod, puid) {
        add_reduce(state, data, 3, 47);
        return 25;
        /*5294e131c0c29de596fdcef9e49b3d51*/
    }
    function branch_530b15e41ef1340a(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 1024;
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 11, 20);
            return prod;
        }
        return -1;
        /*530b15e41ef1340a31195a8b888109f1*/
    }
    function branch_5452df09d887d49e(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*76:229 def$defaultproduction=>• def$identifier*/
        puid |= 16;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $def$identifier);
        return puid;
        return -1;
        /*5452df09d887d49e9a723478211db815*/
    }
    function branch_54a2284eebb4a6fc(l, data, state, prod, puid) {
        add_reduce(state, data, 2, 0);
        return 42;
        /*54a2284eebb4a6fc8019193b670397e6*/
    }
    function branch_54cbce3bf6eb0973(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*87:269 def$hex_token_group_044_104=>• F*/
        puid |= 4096;
        consume(l, data, state);
        return prod;
        return -1;
        /*54cbce3bf6eb0973b4ca0700e60edd40*/
    }
    function branch_54f1ce87e9b53810(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*87:261 def$hex_token_group_044_104=>• d*/
        puid |= 16;
        consume(l, data, state);
        return prod;
        return -1;
        /*54f1ce87e9b53810ba74f37424845ce0*/
    }
    function branch_556d6adae510d753(l, data, state, prod, puid) {
        return 36;
        /*556d6adae510d753b58dac1ab147cd5b*/
    }
    function branch_55ffb425a3ff65dc(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*68:209 comment_HC_listbody1_131=>comment_HC_listbody1_131 • comment_group_0139_130*/
        puid |= 2;
        pushFN(data, branch_cfb3fe9c738c88e2);
        pushFN(data, $comment_group_0139_130);
        return puid;
        return -1;
        /*55ffb425a3ff65dc85b530bf3547fa08*/
    }
    function branch_56315e6f44ebe50f(l, data, state, prod, puid) {
        /*43:126 primitive_declaration=>modifier_list identifier • : type primitive_declaration_group_170_116
        43:128 primitive_declaration=>modifier_list identifier • : type*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 58/*[:]*/) {
            consume(l, data, state);
            puid |= 4;
            /*43:126 primitive_declaration=>modifier_list identifier : • type primitive_declaration_group_170_116
            43:128 primitive_declaration=>modifier_list identifier : • type*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_8aacc0bf5ef96cc9);
            pushFN(data, $type);
            puid |= 8;
            return puid;
        }
        return -1;
        /*56315e6f44ebe50f0b447edbf27ade20*/
    }
    function branch_56c11cecc2c16501(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*90:273 def$binary_token_group_047_106=>• 0*/
        puid |= 1;
        consume(l, data, state);
        return prod;
        return -1;
        /*56c11cecc2c16501dece4d0feff39101*/
    }
    function branch_56ce9147737e2637(l, data, state, prod, puid) {
        /*108:328 virtual-118:1:1|--lvl:0=>•
        109:329 virtual-127:4:1|--lvl:0=>• : type primitive_declaration_group_170_116
        110:330 virtual-129:3:1|--lvl:0=>• : type*/
        switch (sym_map_9fff07fe93fb5f87(l, data)) {
            case 0:
                /*109:329 virtual-127:4:1|--lvl:0=>• : type primitive_declaration_group_170_116
                110:330 virtual-129:3:1|--lvl:0=>• : type*/
                var pk = l.copy();
                skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, 0);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if (((((/*[uint]*/cmpr_set(pk, data, 83, 4, 4) ||/*[int]*/cmpr_set(pk, data, 84, 3, 3)) ||/*[flt]*/cmpr_set(pk, data, 125, 3, 3)) || dt_1e3f2d5b696b270e(pk, data)) || assert_ascii(pk, 0x0, 0x10, 0x80000000, 0x200240)) || pk.isUniID(data)) {
                    /*109:329 virtual-127:4:1|--lvl:0=>• : type primitive_declaration_group_170_116
                    110:330 virtual-129:3:1|--lvl:0=>• : type*/
                    /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                    consume(l, data, state);
                    puid |= 4;
                    /*109:329 virtual-127:4:1|--lvl:0=>: • type primitive_declaration_group_170_116
                    110:330 virtual-129:3:1|--lvl:0=>: • type*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    pushFN(data, branch_0bc8a26871c656c0);
                    pushFN(data, $type);
                    puid |= 8;
                    return puid;
                }
            default:
            case 1:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                /*108:328 virtual-118:1:1|--lvl:0=>•*/
                add_reduce(state, data, 1, 68);
                pushFN(data, $expression_statements_group_023_108_goto);
                return 37;
        }
        return -1;
        /*56ce9147737e26379091c9f8213eddeb*/
    }
    function branch_5725d6225969df91(l, data, state, prod, puid) {
        return 87;
        /*5725d6225969df91176abe45c76aaeda*/
    }
    function branch_573b9c6e3d1449ba(l, data, state, prod, puid) {
        /*11:24 class=>modifier_list cls identifier class_group_113_103 • { class_HC_listbody1_105 }
        11:27 class=>modifier_list cls identifier class_group_113_103 • { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 123/*[{]*/) {
            consume(l, data, state);
            puid |= 16;
            /*11:24 class=>modifier_list cls identifier class_group_113_103 { • class_HC_listbody1_105 }
            11:27 class=>modifier_list cls identifier class_group_113_103 { • }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if (l.current_byte == 125/*[}]*/) {
                pushFN(data, branch_7dcd4e56969f4413);
                return branch_dc4ac9cf8150dd1a(l, data, state, prod, 16);
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if (((/*[str]*/cmpr_set(l, data, 47, 3, 3) ||/*[fn]*/cmpr_set(l, data, 144, 2, 2)) || assert_ascii(l, 0x0, 0x10, 0x88000000, 0x0)) || l.isUniID(data)) {
                pushFN(data, branch_7dcd4e56969f4413);
                return branch_f13eafcddbdd43be(l, data, state, prod, 16);
            }
        }
        return -1;
        /*573b9c6e3d1449ba30e19529e650b485*/
    }
    function branch_57b67f757a8b369b(l, data, state, prod, puid) {
        return 83;
        /*57b67f757a8b369b0611733f7ff5598d*/
    }
    function branch_5814d05b2ded1273(l, data, state, prod, puid) {
        return 31;
        /*5814d05b2ded1273c41ef132ab8abc90*/
    }
    function branch_583e211f0ea538e1(l, data, state, prod, puid) {
        /*11:24 class=>modifier_list cls identifier • class_group_113_103 { class_HC_listbody1_105 }
        11:27 class=>modifier_list cls identifier • class_group_113_103 { }
        11:26 class=>modifier_list cls identifier • { class_HC_listbody1_105 }
        11:30 class=>modifier_list cls identifier • { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if (l.current_byte == 123/*[{]*/) {
            /*11:26 class=>modifier_list cls identifier • { class_HC_listbody1_105 }
            11:30 class=>modifier_list cls identifier • { }*/
            var pk = l.copy();
            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, 0);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (pk.current_byte == 125/*[}]*/) {
                pushFN(data, branch_0a5b9c282ee399c8);
                return branch_ba114ad1e502bbb5(l, data, state, prod, 4);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            } else if (((/*[str]*/cmpr_set(pk, data, 47, 3, 3) ||/*[fn]*/cmpr_set(pk, data, 144, 2, 2)) || assert_ascii(pk, 0x0, 0x10, 0x88000000, 0x0)) || pk.isUniID(data)) {
                pushFN(data, branch_0a5b9c282ee399c8);
                return branch_8c6606bd8966675f(l, data, state, prod, 4);
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (/*[is]*/cmpr_set(l, data, 141, 2, 2)) {
            /*11:24 class=>modifier_list cls identifier • class_group_113_103 { class_HC_listbody1_105 }
            11:27 class=>modifier_list cls identifier • class_group_113_103 { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_a141374823a663ee);
            pushFN(data, $class_group_113_103);
            puid |= 8;
            return puid;
        }
        return -1;
        /*583e211f0ea538e14b80d958869d33a9*/
    }
    function branch_584051a55d809a1f(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, $loop_expression_HC_listbody6_112_goto);
        return 30;
        /*584051a55d809a1f9d2c8b33ad391f10*/
    }
    function branch_586655cede959332(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, $def$octal_token_HC_listbody1_110_goto);
        return 95;
        /*586655cede9593322e25e11d28a8e248*/
    }
    function branch_58bb5d092a2b7f3f(l, data, state, prod, puid) {
        add_reduce(state, data, 2, 92);
        return prod;
        /*58bb5d092a2b7f3fd229ae2c021cc769*/
    }
    function branch_58f730f6c0629550(l, data, state, prod, puid) {
        /*109:329 virtual-97:9:1|--lvl:0=>( parameters ; expression • ; loop_expression_HC_listbody6_112 ) expression
        111:331 virtual-101:8:1|--lvl:0=>( parameters ; expression • ; ) expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 59/*[;]*/) {
            consume(l, data, state);
            puid |= 32;
            /*109:329 virtual-97:9:1|--lvl:0=>( parameters ; expression ; • loop_expression_HC_listbody6_112 ) expression
            111:331 virtual-101:8:1|--lvl:0=>( parameters ; expression ; • ) expression*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if (l.current_byte == 41/*[)]*/) {
                pushFN(data, branch_3205c0ded576131e);
                return branch_4f89c2bc65fa3722(l, data, state, prod, 32);
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if (((((((((((((((/*[if]*/cmpr_set(l, data, 143, 2, 2) ||/*[match]*/cmpr_set(l, data, 67, 5, 5)) ||/*[break]*/cmpr_set(l, data, 72, 5, 5)) ||/*[return]*/cmpr_set(l, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(l, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(l, data, 63, 4, 4)) ||/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) ||/*[==]*/cmpr_set(l, data, 7, 2, 2)) || dt_bcea2102060eab13(l, data)) ||/*[true]*/cmpr_set(l, data, 95, 4, 4)) ||/*[null]*/cmpr_set(l, data, 35, 4, 4)) || dt_6ae31dd85a62ef5c(l, data)) || assert_ascii(l, 0x0, 0x194, 0x88000000, 0x8000000)) || l.isUniID(data)) || l.isNum(data)) || l.isSym(true, data)) {
                pushFN(data, branch_3205c0ded576131e);
                return branch_f12f0fa85b21f76a(l, data, state, prod, 32);
            }
        }
        return -1;
        /*58f730f6c0629550d05c2fb5ded471c5*/
    }
    function branch_5916dde053a4650d(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*19:60 expression_statements_group_124_109=>expression_statements_HC_listbody1_107 • expression_statements_group_023_108*/
        puid |= 2;
        pushFN(data, branch_b78196333db742fd);
        pushFN(data, $expression_statements_group_023_108);
        return puid;
        return -1;
        /*5916dde053a4650d030dfda24a07aab6*/
    }
    function branch_5923ba76c150d90d(l, data, state, prod, puid) {
        add_reduce(state, data, 9, 51);
        return prod;
        /*5923ba76c150d90d5645606acac88681*/
    }
    function branch_5956da63f9d14ba8(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 82);
        return prod;
        /*5956da63f9d14ba844a6b0376c6d36c4*/
    }
    function branch_5a1c8176956f6fff(l, data, state, prod, puid) {
        /*13:37 function=>fn identifier : type ( parameters • ) { expression_statements }
        13:41 function=>fn identifier : type ( parameters • ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 41/*[)]*/) {
            consume(l, data, state);
            puid |= 128;
            /*13:37 function=>fn identifier : type ( parameters ) • { expression_statements }
            13:41 function=>fn identifier : type ( parameters ) • { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if (l.current_byte == 123/*[{]*/) {
                consume(l, data, state);
                puid |= 256;
                /*13:37 function=>fn identifier : type ( parameters ) { • expression_statements }
                13:41 function=>fn identifier : type ( parameters ) { • }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if (l.current_byte == 125/*[}]*/) {
                    pushFN(data, branch_2d70052e1cc76d5c);
                    return branch_974fae918d9e824f(l, data, state, prod, 256);
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if (((((((((((((((/*[if]*/cmpr_set(l, data, 143, 2, 2) ||/*[match]*/cmpr_set(l, data, 67, 5, 5)) ||/*[break]*/cmpr_set(l, data, 72, 5, 5)) ||/*[return]*/cmpr_set(l, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(l, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(l, data, 63, 4, 4)) ||/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) ||/*[==]*/cmpr_set(l, data, 7, 2, 2)) || dt_bcea2102060eab13(l, data)) ||/*[true]*/cmpr_set(l, data, 95, 4, 4)) ||/*[null]*/cmpr_set(l, data, 35, 4, 4)) || dt_6ae31dd85a62ef5c(l, data)) || assert_ascii(l, 0x0, 0x194, 0x88000000, 0x8000000)) || l.isUniID(data)) || l.isNum(data)) || l.isSym(true, data)) {
                    pushFN(data, branch_2d70052e1cc76d5c);
                    return branch_df52e5549c4b62d0(l, data, state, prod, 256);
                }
            }
        }
        return -1;
        /*5a1c8176956f6fffa046b80848bcd910*/
    }
    function branch_5b36d44741cc27a1(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*105:312 def$js_id_symbols=>def$js_id_symbols • θid*/
        puid |= 2;
        consume(l, data, state);
        add_reduce(state, data, 2, 87);
        return prod;
        return -1;
        /*5b36d44741cc27a1015d520a7cea2ba7*/
    }
    function branch_5b948ba3b39c4e7d(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*50:144 modifier_list=>• [ modifier_list_HC_listbody1_120 ]*/
        puid |= 1;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $modifier_list);
        return puid;
        return -1;
        /*5b948ba3b39c4e7d7c64114a1b501c8b*/
    }
    function branch_5ba3cb59e15b58fe(l, data, state, prod, puid) {
        return 66;
        /*5ba3cb59e15b58fed5a19252ee4ed357*/
    }
    function branch_5bb9bbf04a1ff003(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*76:228 def$defaultproduction=>• def$octal*/
        puid |= 8;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $def$octal);
        return puid;
        return -1;
        /*5bb9bbf04a1ff00307eb19dd7b34516d*/
    }
    function branch_5be6fbf647afebb1(l, data, state, prod, puid) {
        /*11:25 class=>cls identifier class_group_113_103 • { class_HC_listbody1_105 }
        11:29 class=>cls identifier class_group_113_103 • { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 123/*[{]*/) {
            consume(l, data, state);
            puid |= 16;
            /*11:25 class=>cls identifier class_group_113_103 { • class_HC_listbody1_105 }
            11:29 class=>cls identifier class_group_113_103 { • }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if (l.current_byte == 125/*[}]*/) {
                pushFN(data, branch_7dcd4e56969f4413);
                return branch_1b3c041470654f02(l, data, state, prod, 16);
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if (((/*[str]*/cmpr_set(l, data, 47, 3, 3) ||/*[fn]*/cmpr_set(l, data, 144, 2, 2)) || assert_ascii(l, 0x0, 0x10, 0x88000000, 0x0)) || l.isUniID(data)) {
                pushFN(data, branch_7dcd4e56969f4413);
                return branch_c24bced632756001(l, data, state, prod, 16);
            }
        }
        return -1;
        /*5be6fbf647afebb10e324ed3f9e666bf*/
    }
    function branch_5d2be5b77c2fdb8e(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*66:204 modifier=>• imut*/
        puid |= 16;
        consume(l, data, state);
        return prod;
        return -1;
        /*5d2be5b77c2fdb8e34a7cfe2ba3ef8a8*/
    }
    function branch_5d9666f292d0af22(l, data, state, prod, puid) {
        add_reduce(state, data, 7, 56);
        return prod;
        /*5d9666f292d0af22c0e0b81e0388ad06*/
    }
    function branch_5e571d27ef8a89c6(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*12:32 struct=>modifier_list str identifier { • parameters }*/
        puid |= 16;
        pushFN(data, branch_cd112f466afb1119);
        pushFN(data, $parameters);
        return puid;
        return -1;
        /*5e571d27ef8a89c6deaf55d13d0bfc37*/
    }
    function branch_5f6f836f5915db22(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        /*37:116 member_expression=>member_expression • [ expression ]*/
        puid |= 8;
        consume(l, data, state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 16;
        pushFN(data, branch_d27adec3f521a53f);
        pushFN(data, $expression);
        return puid;
        return -1;
        /*5f6f836f5915db222b5bf68cc02fe7a5*/
    }
    function branch_5fc020a8d52b7391(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*57:173 string_group_0112_125=>• θsym*/
        puid |= 8;
        consume(l, data, state);
        return prod;
        return -1;
        /*5fc020a8d52b7391139064608aee28c9*/
    }
    function branch_5ff5f8118dfc8fe7(l, data, state, prod, puid) {
        /*108:328 virtual-138:3:1|--lvl:0=>identifier_token_HC_listbody1_118 • identifier_token_group_080_119
        109:329 virtual-140:2:1|--lvl:0=>identifier_token_HC_listbody1_118 •*/
        skip_db1786a8af54d666(l/*[ 71 ]*/, data, state);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/) {
            pushFN(data, branch_398d9230ecf58463);
            return branch_ebeed5ccb9c84aab(l, data, state, prod, 2);
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*109:329 virtual-140:2:1|--lvl:0=>identifier_token_HC_listbody1_118 •*/
            add_reduce(state, data, 2, 0);
            return 48;
        }
        return -1;
        /*5ff5f8118dfc8fe70bf0a93822c88aae*/
    }
    function branch_603d19d840e04474(l, data, state, prod, puid) {
        return 28;
        /*603d19d840e044740538584f7ede8eeb*/
    }
    function branch_6070646d2b8eb37d(l, data, state, prod, puid) {
        return 101;
        /*6070646d2b8eb37d941a653ba1011346*/
    }
    function branch_607fc33f425e8f70(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*4:12 statements=>• template*/
        puid |= 128;
        pushFN(data, branch_6c0f9d6ab747b9d4);
        pushFN(data, $template);
        return puid;
        return -1;
        /*607fc33f425e8f70ee7ee4c5d148d916*/
    }
    function branch_60a520e52790b7b2(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*31:97 loop_expression=>loop ( parameters ; expression ; • loop_expression_HC_listbody6_112 ) expression*/
        puid |= 64;
        pushFN(data, branch_14996c9b2b6ecdfb);
        pushFN(data, $loop_expression_HC_listbody6_112);
        return puid;
        return -1;
        /*60a520e52790b7b25c8434e04eb7d315*/
    }
    function branch_61589024bd5dcbdd(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*77:234 def$hex_digit=>• τc*/
        puid |= 8;
        consume(l, data, state);
        return prod;
        return -1;
        /*61589024bd5dcbdddc9ffab154e349ed*/
    }
    function branch_61e4e40e216cb862(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*119:339 virtual-333:6:1|--lvl:1=>primitive_declaration • in expression ) expression*/
        puid |= 512;
        consume(l, data, state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 4;
        pushFN(data, branch_a0ce7c0c0be8d7d8);
        pushFN(data, $expression);
        return puid;
        return -1;
        /*61e4e40e216cb862fd7527ad454d1d5f*/
    }
    function branch_62cb94c6cb8e4306(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*54:157 type_group_098_124=>• 64*/
        puid |= 2;
        consume(l, data, state);
        return prod;
        return -1;
        /*62cb94c6cb8e43060f376d1b947025fc*/
    }
    function branch_63162b921874b292(l, data, state, prod, puid) {
        /*43:127 primitive_declaration=>identifier : type • primitive_declaration_group_170_116
        43:129 primitive_declaration=>identifier : type •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 61/*[=]*/) {
            pushFN(data, branch_28ed74bf96b1a974);
            return branch_9560ededec206e5d(l, data, state, prod, 8);
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*43:129 primitive_declaration=>identifier : type •*/
            add_reduce(state, data, 3, 77);
            /*-------------INDIRECT-------------------*/
            add_reduce(state, data, 1, 3);
            pushFN(data, $expression_statements_goto);
            return 20;
        }
        return -1;
        /*63162b921874b2927d20988b91f5e347*/
    }
    function branch_6326574de2821296(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*87:260 def$hex_token_group_044_104=>• c*/
        puid |= 8;
        consume(l, data, state);
        return prod;
        return -1;
        /*6326574de28212964303b659d89cd945*/
    }
    function branch_6356265d9720e789(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, $def$identifier_symbols_goto);
        return 107;
        /*6356265d9720e789e036fcf0316914d5*/
    }
    function branch_636c8bed8603efd5(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*87:258 def$hex_token_group_044_104=>• a*/
        puid |= 2;
        consume(l, data, state);
        return prod;
        return -1;
        /*636c8bed8603efd59d2a1d1a11ea1a72*/
    }
    function branch_639c99feb0a972f9(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*3:4 module=>module • module_group_02_100*/
        puid |= 2;
        pushFN(data, branch_cfb3fe9c738c88e2);
        pushFN(data, $statements);
        return puid;
        return -1;
        /*639c99feb0a972f9f457c4ffa05787a1*/
    }
    function branch_63ee326759140366(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*52:152 type_group_092_122=>• 64*/
        puid |= 8;
        consume(l, data, state);
        return prod;
        return -1;
        /*63ee3267591403663719ff3917d01bed*/
    }
    function branch_649ce18028c262c7(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*101:305 def$string_value_group_172_113=>• θws*/
        puid |= 8;
        consume(l, data, state);
        return prod;
        return -1;
        /*649ce18028c262c7b02eb20a19bc8d08*/
    }
    function branch_64e7346c01b28573(l, data, state, prod, puid) {
        /*83:250 def$scientific_token_group_228_102=>def$scientific_token_group_027_101 • - θnum
        83:251 def$scientific_token_group_228_102=>def$scientific_token_group_027_101 • θnum*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if (l.isNum(data)) {
            pushFN(data, branch_57b67f757a8b369b);
            return branch_e414505bb9eeb857(l, data, state, prod, 1);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.current_byte == 45/*[-]*/) {
            pushFN(data, branch_57b67f757a8b369b);
            return branch_13560957ad4d6872(l, data, state, prod, 1);
        }
        return -1;
        /*64e7346c01b28573703386f4dc5658f4*/
    }
    function branch_6515f1f4dabce4b3(l, data, state, prod, puid) {
        add_reduce(state, data, 5, 44);
        return 24;
        /*6515f1f4dabce4b36f11660cac0229ce*/
    }
    function branch_6609a8a1a30397b0(l, data, state, prod, puid) {
        /*14:44 function_expression=>modifier_list fn : type • ( parameters ) { expression_statements }
        14:46 function_expression=>modifier_list fn : type • ( ) { expression_statements }
        14:47 function_expression=>modifier_list fn : type • ( parameters ) { }
        14:50 function_expression=>modifier_list fn : type • ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 40/*[(]*/) {
            consume(l, data, state);
            puid |= 16;
            /*14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
            14:47 function_expression=>modifier_list fn : type ( • parameters ) { }
            14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
            14:50 function_expression=>modifier_list fn : type ( • ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (l.current_byte == 41/*[)]*/) {
                /*14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
                14:50 function_expression=>modifier_list fn : type ( • ) { }*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l, data, state);
                puid |= 64;
                /*14:46 function_expression=>modifier_list fn : type ( ) • { expression_statements }
                14:50 function_expression=>modifier_list fn : type ( ) • { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                if (l.current_byte == 123/*[{]*/) {
                    consume(l, data, state);
                    puid |= 128;
                    /*14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }
                    14:50 function_expression=>modifier_list fn : type ( ) { • }*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    if (l.current_byte == 125/*[}]*/) {
                        pushFN(data, branch_521f65aff0d7939b);
                        return branch_c8952b549cb04b31(l, data, state, prod, 128);
                    }
                }
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if (assert_ascii(l, 0x0, 0x10, 0x88000000, 0x0) || l.isUniID(data)) {
                /*14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
                14:47 function_expression=>modifier_list fn : type ( • parameters ) { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                pushFN(data, branch_eb93b27850808bc7);
                pushFN(data, $parameters);
                puid |= 32;
                return puid;
            }
        }
        return -1;
        /*6609a8a1a30397b045560b226bed471b*/
    }
    function branch_66307d4298bd3f07(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
        /*17:56 expression_statements_HC_listbody1_107=>expression_statements_HC_listbody1_107 • ;*/
        puid |= 2;
        consume(l, data, state);
        add_reduce(state, data, 2, 2);
        return prod;
        return -1;
        /*66307d4298bd3f07a02a3fc1c8e8a907*/
    }
    function branch_670662111815c6bc(l, data, state, prod, puid) {
        /*7:16 namespace=>ns identifier • { namespace_HC_listbody3_102 }
        7:17 namespace=>ns identifier • { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 123/*[{]*/) {
            consume(l, data, state);
            puid |= 4;
            /*7:16 namespace=>ns identifier { • namespace_HC_listbody3_102 }
            7:17 namespace=>ns identifier { • }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if (l.current_byte == 125/*[}]*/) {
                pushFN(data, branch_d239b9dc91064a7d);
                return branch_bd7adc45205f8521(l, data, state, prod, 4);
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if (((((((/*[import]*/cmpr_set(l, data, 29, 6, 6) ||/*[cls]*/cmpr_set(l, data, 122, 3, 3)) ||/*[str]*/cmpr_set(l, data, 47, 3, 3)) ||/*[fn]*/cmpr_set(l, data, 144, 2, 2)) ||/*[ns]*/cmpr_set(l, data, 120, 2, 2)) ||/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) || assert_ascii(l, 0x0, 0x10, 0x88000000, 0x0)) || l.isUniID(data)) {
                pushFN(data, branch_d239b9dc91064a7d);
                return branch_ae787e3866c9a5e4(l, data, state, prod, 4);
            }
        }
        return -1;
        /*670662111815c6bc64e00338828139b3*/
    }
    function branch_6802295a984aae0d(l, data, state, prod, puid) {
        /*13:36 function=>modifier_list • fn identifier : type ( parameters ) { expression_statements }
        13:38 function=>modifier_list • fn identifier : type ( ) { expression_statements }
        13:39 function=>modifier_list • fn identifier : type ( parameters ) { }
        13:42 function=>modifier_list • fn identifier : type ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (/*[fn]*/cmpr_set(l, data, 144, 2, 2)) {
            consume(l, data, state);
            puid |= 2;
            /*13:36 function=>modifier_list fn • identifier : type ( parameters ) { expression_statements }
            13:38 function=>modifier_list fn • identifier : type ( ) { expression_statements }
            13:39 function=>modifier_list fn • identifier : type ( parameters ) { }
            13:42 function=>modifier_list fn • identifier : type ( ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_e33080be3e8ab8cc);
            pushFN(data, $identifier);
            puid |= 4;
            return puid;
        }
        return -1;
        /*6802295a984aae0db350cc01830bf824*/
    }
    function branch_687a19cd793e6c48(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*107:323 def$identifier_symbols=>def$identifier_symbols • $*/
        puid |= 16;
        consume(l, data, state);
        add_reduce(state, data, 2, 87);
        return prod;
        return -1;
        /*687a19cd793e6c4827c6004a30a4a0c9*/
    }
    function branch_68ec484543f8f45a(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*56:169 value=>• template*/
        puid |= 32;
        pushFN(data, branch_2e5f0d29e134b2c8);
        pushFN(data, $template);
        return puid;
        return -1;
        /*68ec484543f8f45a90add60f75459f15*/
    }
    function branch_69cb1d4883ac2b9b(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*26:83 unary_expression=>• operator unary_value*/
        puid |= 1;
        pushFN(data, branch_896953706e4cc83d);
        pushFN(data, $operator);
        return puid;
        return -1;
        /*69cb1d4883ac2b9be2ab98e6e8d17ae7*/
    }
    function branch_69da744e43e07c30(l, data, state, prod, puid) {
        add_reduce(state, data, 3, 62);
        return 34;
        /*69da744e43e07c305b2e940659971c0b*/
    }
    function branch_69f07bd182d24266(l, data, state, prod, puid) {
        /*13:36 function=>modifier_list fn identifier : type ( parameters • ) { expression_statements }
        13:39 function=>modifier_list fn identifier : type ( parameters • ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 41/*[)]*/) {
            consume(l, data, state);
            puid |= 128;
            /*13:36 function=>modifier_list fn identifier : type ( parameters ) • { expression_statements }
            13:39 function=>modifier_list fn identifier : type ( parameters ) • { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if (l.current_byte == 123/*[{]*/) {
                consume(l, data, state);
                puid |= 256;
                /*13:36 function=>modifier_list fn identifier : type ( parameters ) { • expression_statements }
                13:39 function=>modifier_list fn identifier : type ( parameters ) { • }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if (l.current_byte == 125/*[}]*/) {
                    pushFN(data, branch_2d70052e1cc76d5c);
                    return branch_c9ed7295adaf6608(l, data, state, prod, 256);
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if (((((((((((((((/*[if]*/cmpr_set(l, data, 143, 2, 2) ||/*[match]*/cmpr_set(l, data, 67, 5, 5)) ||/*[break]*/cmpr_set(l, data, 72, 5, 5)) ||/*[return]*/cmpr_set(l, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(l, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(l, data, 63, 4, 4)) ||/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) ||/*[==]*/cmpr_set(l, data, 7, 2, 2)) || dt_bcea2102060eab13(l, data)) ||/*[true]*/cmpr_set(l, data, 95, 4, 4)) ||/*[null]*/cmpr_set(l, data, 35, 4, 4)) || dt_6ae31dd85a62ef5c(l, data)) || assert_ascii(l, 0x0, 0x194, 0x88000000, 0x8000000)) || l.isUniID(data)) || l.isNum(data)) || l.isSym(true, data)) {
                    pushFN(data, branch_2d70052e1cc76d5c);
                    return branch_2021bb8956171841(l, data, state, prod, 256);
                }
            }
        }
        return -1;
        /*69f07bd182d242663b9c9a4fc8c55ec4*/
    }
    function branch_6a9db12bab3062d9(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $def$string_token_HC_listbody3_111_goto);
        return 98;
        /*6a9db12bab3062d979ce648500daaa02*/
    }
    function branch_6aa1652dcbe2d668(l, data, state, prod, puid) {
        /*24:78 if_expression=>if expression : expression • if_expression_group_139_110
        24:79 if_expression=>if expression : expression •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        switch (sym_map_eeb5218ed312146c(l, data)) {
            case 0:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                /*24:78 if_expression=>if expression : expression • if_expression_group_139_110*/
                puid |= 8;
                pushFN(data, branch_6515f1f4dabce4b3);
                pushFN(data, $if_expression_group_139_110);
                return puid;
            default:
            case 1:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                /*24:79 if_expression=>if expression : expression •*/
                add_reduce(state, data, 4, 45);
                return 24;
        }
        return -1;
        /*6aa1652dcbe2d668ac9f38ebf6d5b134*/
    }
    function branch_6aa2aeb2bf248672(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*65:192 operator=>θsym operator_HC_listbody1_128 • identifier_token_group_080_119*/
        puid |= 4;
        pushFN(data, branch_d596098ff435f05e);
        pushFN(data, $identifier_token_group_080_119);
        return puid;
        return -1;
        /*6aa2aeb2bf24867204b9a56801cd6d95*/
    }
    function branch_6b51261485f4be10(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*45:133 identifier_token_group_075_117=>• $*/
        puid |= 4;
        consume(l, data, state);
        return prod;
        return -1;
        /*6b51261485f4be10cbab5ceacd9a8b52*/
    }
    function branch_6ba75ab8a6c134f6(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        /*65:198 operator=>• θsym*/
        puid |= 1;
        consume(l, data, state);
        add_reduce(state, data, 1, 92);
        return prod;
        return -1;
        /*6ba75ab8a6c134f68c35b7827f3f2178*/
    }
    function branch_6c0f9d6ab747b9d4(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 5);
        return prod;
        /*6c0f9d6ab747b9d484f2bb20ce53b33a*/
    }
    function branch_6c4902f94ddf90b1(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*56:164 value=>• num*/
        puid |= 1;
        pushFN(data, branch_5956da63f9d14ba8);
        pushFN(data, $num);
        return puid;
        return -1;
        /*6c4902f94ddf90b1ca6da34c269a015a*/
    }
    function branch_6c8b4325e7c8b0b4(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*108:328 virtual-127:4:1|--lvl:0=>: type • primitive_declaration_group_170_116*/
        puid |= 16;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $primitive_declaration_group_170_116);
        return puid;
        return -1;
        /*6c8b4325e7c8b0b48073dfcc84d67bc3*/
    }
    function branch_6daab6971c75715b(l, data, state, prod, puid) {
        pushFN(data, $expression_statements_group_023_108_goto);
        return 50;
        /*6daab6971c75715ba440511f225a2e62*/
    }
    function branch_6e82d8e1e1b1ad66(l, data, state, prod, puid) {
        pushFN(data, $member_expression_goto);
        return 37;
        /*6e82d8e1e1b1ad6677add3e993dfc06a*/
    }
    function branch_6ea1ba4d26b7ad0c(l, data, state, prod, puid) {
        /*110:330 virtual-138:3:1|--lvl:0=>identifier_token_HC_listbody1_118 • identifier_token_group_080_119
        111:331 virtual-140:2:1|--lvl:0=>identifier_token_HC_listbody1_118 •*/
        skip_db1786a8af54d666(l/*[ 71 ]*/, data, state);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/) {
            pushFN(data, branch_398d9230ecf58463);
            return branch_af6a16892ca41954(l, data, state, prod, 7);
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*111:331 virtual-140:2:1|--lvl:0=>identifier_token_HC_listbody1_118 •*/
            add_reduce(state, data, 2, 0);
            return 48;
        }
        return -1;
        /*6ea1ba4d26b7ad0cf7c672f44fb70985*/
    }
    function branch_6f28120c8e84c586(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 4;
        pushFN(data, branch_994b63b121480b5a);
        pushFN(data, $expression);
        return puid;
        return -1;
        /*6f28120c8e84c58603c1df3269165aef*/
    }
    function branch_6f565c744f3d9137(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*72:218 template=><<-- • θnum -->>*/
        puid |= 2;
        consume(l, data, state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 4;
        if (/*[-->>]*/cmpr_set(l, data, 23, 4, 4) && consume(l, data, state)) {
            add_reduce(state, data, 3, 0);
            return prod;
        }
        return -1;
        /*6f565c744f3d9137390d677fc62dac24*/
    }
    function branch_71a8ac72433443cb(l, data, state, prod, puid) {
        add_reduce(state, data, 3, 36);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $def$defaultproductions_HC_listbody1_100_goto);
        return 74;
        /*71a8ac72433443cb426c93d764f60699*/
    }
    function branch_71bf66c5cde5f28c(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*105:314 def$js_id_symbols=>def$js_id_symbols • $*/
        puid |= 8;
        consume(l, data, state);
        add_reduce(state, data, 2, 87);
        return prod;
        return -1;
        /*71bf66c5cde5f28c08f19ae8408a7389*/
    }
    function branch_725f3e21be9721d4(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, branch_40a7ef9e3eb88045);
        return 16;
        /*725f3e21be9721d43ca8529dc0f2ee9f*/
    }
    function branch_72886a4693855303(l, data, state, prod, puid) {
        pushFN(data, branch_40a7ef9e3eb88045);
        return 50;
        /*72886a4693855303fc045bc5a2165de4*/
    }
    function branch_72ba0bf2baa7d429(l, data, state, prod, puid) {
        /*43:126 primitive_declaration=>modifier_list identifier • : type primitive_declaration_group_170_116
        43:128 primitive_declaration=>modifier_list identifier • : type*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 58/*[:]*/) {
            consume(l, data, state);
            puid |= 4;
            /*43:126 primitive_declaration=>modifier_list identifier : • type primitive_declaration_group_170_116
            43:128 primitive_declaration=>modifier_list identifier : • type*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_ac5da3abe5ddef99);
            pushFN(data, $type);
            puid |= 8;
            return puid;
        }
        return -1;
        /*72ba0bf2baa7d429d2df93eedb50a9ee*/
    }
    function branch_72c8c742bbfa704f(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*94:287 def$octal_token_group_058_109=>• 7*/
        puid |= 128;
        consume(l, data, state);
        return prod;
        return -1;
        /*72c8c742bbfa704ffe6feb1d8d3795e2*/
    }
    function branch_72ca5293d8fd6bed(l, data, state, prod, puid) {
        /*48:138 identifier_token=>identifier_token_group_075_117 • identifier_token_HC_listbody1_118 identifier_token_group_080_119
        48:140 identifier_token=>identifier_token_group_075_117 • identifier_token_HC_listbody1_118
        48:141 identifier_token=>identifier_token_group_075_117 •
        48:139 identifier_token=>identifier_token_group_075_117 • identifier_token_group_080_119*/
        skip_db1786a8af54d666(l/*[ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if (l.isUniID(data)) {
            /*48:138 identifier_token=>identifier_token_group_075_117 • identifier_token_HC_listbody1_118 identifier_token_group_080_119
            48:140 identifier_token=>identifier_token_group_075_117 • identifier_token_HC_listbody1_118
            48:141 identifier_token=>identifier_token_group_075_117 •*/
            var pk = l.copy();
            skip_db1786a8af54d666(pk.next(data)/*[ 71 ]*/, data, 0);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            if (nocap_b2eb52235ee30b8a(pk)/*[ws] [nl]*/) {
                /*48:138 identifier_token=>identifier_token_group_075_117 • identifier_token_HC_listbody1_118 identifier_token_group_080_119
                48:140 identifier_token=>identifier_token_group_075_117 • identifier_token_HC_listbody1_118*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                pushFN(data, branch_d55f14568bc39cad);
                pushFN(data, $identifier_token_HC_listbody1_118);
                puid |= 2;
                return puid;
                /*⤋⤋⤋ peek-unresolved ⤋⤋⤋*/
            } else if (((((((dt_dc6530084293e429(pk, data) ||/*[str]*/cmpr_set(pk, data, 47, 3, 3)) ||/*[fn]*/cmpr_set(pk, data, 144, 2, 2)) ||/*[==]*/cmpr_set(pk, data, 7, 2, 2)) ||/*[else]*/cmpr_set(pk, data, 128, 4, 4)) || assert_ascii(pk, 0x0, 0x2c005310, 0xa8000000, 0x28000000)) || pk.isUniID(data)) || pk.isSym(true, data)) {
                /*-------------VPROD-------------------------*/
                /*48:138 identifier_token=>identifier_token_group_075_117 • identifier_token_HC_listbody1_118 identifier_token_group_080_119
                48:140 identifier_token=>identifier_token_group_075_117 • identifier_token_HC_listbody1_118*/
                pushFN(data, branch_feb1ea4d7c76681b);
                return 0;
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/) {
            pushFN(data, branch_73df4fa2a9e9bee1);
            return branch_8cb2770eb9e703da(l, data, state, prod, 1);
            /*⤋⤋⤋ peek-unresolved ⤋⤋⤋*/
        } else if ((l.current_byte == 95/*[_]*/) || (l.current_byte == 36/*[$]*/)) {
            /*-------------VPROD-------------------------*/
            /*48:138 identifier_token=>identifier_token_group_075_117 • identifier_token_HC_listbody1_118 identifier_token_group_080_119
            48:140 identifier_token=>identifier_token_group_075_117 • identifier_token_HC_listbody1_118*/
            pushFN(data, branch_0259dde7fea94460);
            return 0;
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*48:141 identifier_token=>identifier_token_group_075_117 •*/
            return 48;
        }
        return -1;
        /*72ca5293d8fd6bedd60df76ef5ce01a6*/
    }
    function branch_72e2b3814fd075f3(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*94:286 def$octal_token_group_058_109=>• 6*/
        puid |= 64;
        consume(l, data, state);
        return prod;
        return -1;
        /*72e2b3814fd075f3f941efb072078898*/
    }
    function branch_7376db16b93f2384(l, data, state, prod, puid) {
        /*43:126 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_170_116
        43:128 primitive_declaration=>modifier_list identifier : type •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 61/*[=]*/) {
            pushFN(data, branch_760d44f847ea15ad);
            return branch_8648628ea28d7554(l, data, state, prod, 8);
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*43:128 primitive_declaration=>modifier_list identifier : type •*/
            add_reduce(state, data, 4, 76);
            /*-------------INDIRECT-------------------*/
            pushFN(data, branch_40a7ef9e3eb88045);
            return 43;
        }
        return -1;
        /*7376db16b93f2384a5a2f0ee9b402631*/
    }
    function branch_73836dabb810b0e0(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $comment_HC_listbody1_131_goto);
        return 68;
        /*73836dabb810b0e0b1fdb471deb17be2*/
    }
    function branch_73ba19c3911ee2c3(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*77:231 def$hex_digit=>• θnum*/
        puid |= 1;
        consume(l, data, state);
        return prod;
        return -1;
        /*73ba19c3911ee2c30f132cb93efde436*/
    }
    function branch_73bacf9dd4cbfee8(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*50:144 modifier_list=>• [ modifier_list_HC_listbody1_120 ]*/
        puid |= 1;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $modifier_list);
        return puid;
        return -1;
        /*73bacf9dd4cbfee8c8a00dd1266eb893*/
    }
    function branch_73df4fa2a9e9bee1(l, data, state, prod, puid) {
        return 48;
        /*73df4fa2a9e9bee1744f8587dac49594*/
    }
    function branch_747666e752112bf3(l, data, state, prod, puid) {
        add_reduce(state, data, 3, 65);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $expression_statements_goto);
        return 37;
        /*747666e752112bf3390391e8bf5ea7b4*/
    }
    function branch_74b8baa73ce2ca9a(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 1;
        if ((l.current_byte == 34/*["]*/) && consume(l, data, state)) {
            add_reduce(state, data, 3, 89);
            return prod;
        }
        return -1;
        /*74b8baa73ce2ca9aa6e003a5bce4f6d1*/
    }
    function branch_74c8218421c7bef8(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, $expression_statements_group_023_108_goto);
        return 26;
        /*74c8218421c7bef80493a1e1dd58d02d*/
    }
    function branch_75dcdaa282cbb6b8(l, data, state, prod, puid) {
        add_reduce(state, data, 2, 92);
        return 65;
        /*75dcdaa282cbb6b883538a38ae2decaa*/
    }
    function branch_760d44f847ea15ad(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, branch_40a7ef9e3eb88045);
        return 43;
        /*760d44f847ea15add7381145e52c0eff*/
    }
    function branch_78a4cabe62176c9b(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*77:232 def$hex_digit=>• τa*/
        puid |= 2;
        consume(l, data, state);
        return prod;
        return -1;
        /*78a4cabe62176c9bb5be750231a078e1*/
    }
    function branch_78aa7468cfc4789b(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $match_expression_HC_listbody3_113_goto);
        return 32;
        /*78aa7468cfc4789b495e29c5a67a12f7*/
    }
    function branch_7914d4122bd6b502(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*105:316 def$js_id_symbols=>• _*/
        puid |= 4;
        consume(l, data, state);
        return prod;
        return -1;
        /*7914d4122bd6b5026b4e1a124137cc45*/
    }
    function branch_795ff0072c3abc15(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*87:266 def$hex_token_group_044_104=>• C*/
        puid |= 512;
        consume(l, data, state);
        return prod;
        return -1;
        /*795ff0072c3abc156e9aadcdfd22ce97*/
    }
    function branch_79c615b855a22f68(l, data, state, prod, puid) {
        /*43:126 primitive_declaration=>modifier_list identifier • : type primitive_declaration_group_170_116
        43:128 primitive_declaration=>modifier_list identifier • : type*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 58/*[:]*/) {
            consume(l, data, state);
            puid |= 4;
            /*43:126 primitive_declaration=>modifier_list identifier : • type primitive_declaration_group_170_116
            43:128 primitive_declaration=>modifier_list identifier : • type*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_cd09c06cb6b8840e);
            pushFN(data, $type);
            puid |= 8;
            return puid;
        }
        return -1;
        /*79c615b855a22f6892e5c71a0bfdee17*/
    }
    function branch_79fc893000608c8d(l, data, state, prod, puid) {
        return 93;
        /*79fc893000608c8da613679846f07cca*/
    }
    function branch_7a8be2c54a4d26e4(l, data, state, prod, puid) {
        pushFN(data, $class_group_016_104_goto);
        return 50;
        /*7a8be2c54a4d26e4693c3a0a89e60743*/
    }
    function branch_7aec22af26f85298(l, data, state, prod, puid) {
        add_reduce(state, data, 4, 60);
        return 33;
        /*7aec22af26f852982cb8c10588097bb6*/
    }
    function branch_7b936f2d34f41c85(l, data, state, prod, puid) {
        add_reduce(state, data, 3, 50);
        return 31;
        /*7b936f2d34f41c8579bf7b3326fcb0c5*/
    }
    function branch_7bd41de4c3b97b3a(l, data, state, prod, puid) {
        return 62;
        /*7bd41de4c3b97b3a1e5aaf8dd0db1c0b*/
    }
    function branch_7d2089edeff9eb59(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*86:255 def$float_token=>θnum • def$float_token_group_130_103*/
        puid |= 2;
        pushFN(data, branch_f3c5df3271892b40);
        pushFN(data, $def$float_token_group_130_103);
        return puid;
        return -1;
        /*7d2089edeff9eb596e960e9990030da9*/
    }
    function branch_7daa731d7c257794(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*87:268 def$hex_token_group_044_104=>• E*/
        puid |= 2048;
        consume(l, data, state);
        return prod;
        return -1;
        /*7daa731d7c257794b00dcb0e4e9532f4*/
    }
    function branch_7dac51016cbca423(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 64;
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 6, 10);
            return prod;
        }
        return -1;
        /*7dac51016cbca423ffbe4c908b3191db*/
    }
    function branch_7dcd4e56969f4413(l, data, state, prod, puid) {
        return 11;
        /*7dcd4e56969f44130342b866c7e73e16*/
    }
    function branch_7e5b06e2e73c7ad3(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $class_HC_listbody1_105_goto);
        return 10;
        /*7e5b06e2e73c7ad3bb8d1f5d414026c0*/
    }
    function branch_7f0a7c317efe91d9(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $module_HC_listbody1_101_goto);
        return 2;
        /*7f0a7c317efe91d93f70ee062c75a1c0*/
    }
    function branch_7fd00de6646c356a(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*66:201 modifier=>• priv*/
        puid |= 2;
        consume(l, data, state);
        return prod;
        return -1;
        /*7fd00de6646c356a2d24727d15c362c5*/
    }
    function branch_7fe2059f09133bde(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, $operator_HC_listbody1_128_goto);
        return 63;
        /*7fe2059f09133bdeaee44d0182f6596d*/
    }
    function branch_7fe3eae917c31513(l, data, state, prod, puid) {
        return 19;
        /*7fe3eae917c31513a9ca9681abae581a*/
    }
    function branch_801378cf4381603d(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*107:320 def$identifier_symbols=>def$identifier_symbols • θid*/
        puid |= 2;
        consume(l, data, state);
        add_reduce(state, data, 2, 87);
        return prod;
        return -1;
        /*801378cf4381603db47c6f327c61c873*/
    }
    function branch_8195fc9287d375a4(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 64;
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 6, 9);
            return prod;
        }
        return -1;
        /*8195fc9287d375a40c662e35349d5c2d*/
    }
    function branch_819e4e3596f30d3b(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*45:132 identifier_token_group_075_117=>• _*/
        puid |= 2;
        consume(l, data, state);
        return prod;
        return -1;
        /*819e4e3596f30d3b8ccb26344a910532*/
    }
    function branch_81f78cc7f828c364(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*72:218 template=>• <<-- θnum -->>*/
        puid |= 1;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $template);
        return puid;
        return -1;
        /*81f78cc7f828c364e09cab9a64ccf83c*/
    }
    function branch_821f9907522c4e7f(l, data, state, prod, puid) {
        /*65:193 operator=>== operator_HC_listbody1_129 • identifier_token_group_080_119
        65:197 operator=>== operator_HC_listbody1_129 •*/
        skip_db1786a8af54d666(l/*[ 71 ]*/, data, state);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/) {
            pushFN(data, branch_3205c0ded576131e);
            return branch_9d0f7e4eaff28437(l, data, state, prod, 16);
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*65:197 operator=>== operator_HC_listbody1_129 •*/
            add_reduce(state, data, 2, 91);
        }
        return -1;
        /*821f9907522c4e7f31049eb0fd311ed4*/
    }
    function branch_828d52dd7a7ed1f8(l, data, state, prod, puid) {
        add_reduce(state, data, 3, 65);
        /*-------------INDIRECT-------------------*/
        pushFN(data, branch_40a7ef9e3eb88045);
        return 37;
        /*828d52dd7a7ed1f8771a01c6b0ac53fb*/
    }
    function branch_82f51a7392dec211(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 128;
        if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            puid |= 4;
            pushFN(data, branch_d907a8fec93bbb96);
            pushFN(data, $expression);
            return puid;
        }
        return -1;
        /*82f51a7392dec211b7505c16257847be*/
    }
    function branch_8365807fe294cb4b(l, data, state, prod, puid) {
        skip_6c02533b5dc0d802(l/*[ ws ][ 71 ]*/, data, state);
        puid |= 32;
        pushFN(data, branch_41ff52b1bc0fd96e);
        pushFN(data, $comment_group_0144_133);
        return puid;
        return -1;
        /*8365807fe294cb4b20c7be6581a33fb7*/
    }
    function branch_83ab997c0cd4a925(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*62:185 num_tok=>• def$hex*/
        puid |= 2;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $def$hex);
        return puid;
        return -1;
        /*83ab997c0cd4a925053893aed1b3c05b*/
    }
    function branch_840435ebd93e9601(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*6:14 namespace_HC_listbody3_102=>namespace_HC_listbody3_102 • statements*/
        puid |= 2;
        pushFN(data, branch_cfb3fe9c738c88e2);
        pushFN(data, $statements);
        return puid;
        return -1;
        /*840435ebd93e96010244f856e3f35086*/
    }
    function branch_844dc852f21c4995(l, data, state, prod, puid) {
        add_reduce(state, data, 3, 65);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $expression_statements_group_023_108_goto);
        return 37;
        /*844dc852f21c499565cacaf8c40c0b19*/
    }
    function branch_846e03ab90be30c1(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        /*60:179 string=>• " string_HC_listbody1_126 "*/
        puid |= 1;
        consume(l, data, state);
        skip_db1786a8af54d666(l/*[ 71 ]*/, data, state);
        puid |= 2;
        pushFN(data, branch_74b8baa73ce2ca9a);
        pushFN(data, $string_HC_listbody1_126);
        return puid;
        return -1;
        /*846e03ab90be30c11a1d5d0fa4e2aae2*/
    }
    function branch_84e0e203f7da8a50(l, data, state, prod, puid) {
        /*13:36 function=>modifier_list fn identifier : type • ( parameters ) { expression_statements }
        13:38 function=>modifier_list fn identifier : type • ( ) { expression_statements }
        13:39 function=>modifier_list fn identifier : type • ( parameters ) { }
        13:42 function=>modifier_list fn identifier : type • ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 40/*[(]*/) {
            consume(l, data, state);
            puid |= 32;
            /*13:36 function=>modifier_list fn identifier : type ( • parameters ) { expression_statements }
            13:39 function=>modifier_list fn identifier : type ( • parameters ) { }
            13:38 function=>modifier_list fn identifier : type ( • ) { expression_statements }
            13:42 function=>modifier_list fn identifier : type ( • ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (l.current_byte == 41/*[)]*/) {
                /*13:38 function=>modifier_list fn identifier : type ( • ) { expression_statements }
                13:42 function=>modifier_list fn identifier : type ( • ) { }*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l, data, state);
                puid |= 128;
                /*13:38 function=>modifier_list fn identifier : type ( ) • { expression_statements }
                13:42 function=>modifier_list fn identifier : type ( ) • { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                if (l.current_byte == 123/*[{]*/) {
                    consume(l, data, state);
                    puid |= 256;
                    /*13:38 function=>modifier_list fn identifier : type ( ) { • expression_statements }
                    13:42 function=>modifier_list fn identifier : type ( ) { • }*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    if (l.current_byte == 125/*[}]*/) {
                        pushFN(data, branch_0a5b9c282ee399c8);
                        return branch_1537086d834283de(l, data, state, prod, 256);
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    } else if (((((((((((((((/*[if]*/cmpr_set(l, data, 143, 2, 2) ||/*[match]*/cmpr_set(l, data, 67, 5, 5)) ||/*[break]*/cmpr_set(l, data, 72, 5, 5)) ||/*[return]*/cmpr_set(l, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(l, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(l, data, 63, 4, 4)) ||/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) ||/*[==]*/cmpr_set(l, data, 7, 2, 2)) || dt_bcea2102060eab13(l, data)) ||/*[true]*/cmpr_set(l, data, 95, 4, 4)) ||/*[null]*/cmpr_set(l, data, 35, 4, 4)) || dt_6ae31dd85a62ef5c(l, data)) || assert_ascii(l, 0x0, 0x194, 0x88000000, 0x8000000)) || l.isUniID(data)) || l.isNum(data)) || l.isSym(true, data)) {
                        pushFN(data, branch_0a5b9c282ee399c8);
                        return branch_006279d139f628f8(l, data, state, prod, 256);
                    }
                }
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if (assert_ascii(l, 0x0, 0x10, 0x88000000, 0x0) || l.isUniID(data)) {
                /*13:36 function=>modifier_list fn identifier : type ( • parameters ) { expression_statements }
                13:39 function=>modifier_list fn identifier : type ( • parameters ) { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                pushFN(data, branch_fc882760efd204c1);
                pushFN(data, $parameters);
                puid |= 64;
                return puid;
            }
        }
        return -1;
        /*84e0e203f7da8a5081db7b2f5b5b7591*/
    }
    function branch_853d951eb16a42b6(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*87:259 def$hex_token_group_044_104=>• b*/
        puid |= 4;
        consume(l, data, state);
        return prod;
        return -1;
        /*853d951eb16a42b6b604535cd4c98dd5*/
    }
    function branch_853f654efa9e40a3(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*77:240 def$hex_digit=>• τC*/
        puid |= 512;
        consume(l, data, state);
        return prod;
        return -1;
        /*853f654efa9e40a336c0319ac024f849*/
    }
    function branch_8544af15563f5778(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 128;
        if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            puid |= 4;
            pushFN(data, branch_5d9666f292d0af22);
            pushFN(data, $expression);
            return puid;
        }
        return -1;
        /*8544af15563f5778fb7de069d092f16b*/
    }
    function branch_859963e4ad0e1080(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 512;
        if (/*[in]*/cmpr_set(l, data, 43, 2, 2) && consume(l, data, state)) {
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            puid |= 4;
            pushFN(data, branch_d7ce8b3393a64a3b);
            pushFN(data, $expression);
            return puid;
        }
        return -1;
        /*859963e4ad0e1080d6cebba6cdd48f37*/
    }
    function branch_85a84a1981e139b6(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*9:19 class_group_016_104=>• struct*/
        puid |= 1;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $struct);
        return puid;
        return -1;
        /*85a84a1981e139b6effd9a185ea109b2*/
    }
    function branch_8648628ea28d7554(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*43:126 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_170_116*/
        puid |= 16;
        pushFN(data, branch_3edd60951d2b3437);
        pushFN(data, $primitive_declaration_group_170_116);
        return puid;
        return -1;
        /*8648628ea28d7554eb2111ccbb8590f1*/
    }
    function branch_86533789e50f27ee(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*75:223 def$defaultproductions=>def$defaultproductions • θws def$defaultproduction*/
        puid |= 2;
        consume(l, data, state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 4;
        pushFN(data, branch_a128b75b77459fe9);
        pushFN(data, $def$defaultproduction);
        return puid;
        return -1;
        /*86533789e50f27ee0d013b25e4c4c5c2*/
    }
    function branch_86e570eff6659ab4(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*4:7 statements=>• class*/
        puid |= 2;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $class);
        return puid;
        return -1;
        /*86e570eff6659ab434cd0e2bf63b7abb*/
    }
    function branch_871c2100d5a6193b(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*67:206 comment_group_0139_130=>• θid*/
        puid |= 1;
        consume(l, data, state);
        return prod;
        return -1;
        /*871c2100d5a6193b7e7e5d2f6b99497d*/
    }
    function branch_878e80267e6da0fa(l, data, state, prod, puid) {
        skip_a294e41529bc9275(l/*[ nl ][ 71 ]*/, data, state);
        puid |= 2;
        pushFN(data, branch_a2ade393e0ff2119);
        pushFN(data, $def$octal_token_HC_listbody1_110);
        return puid;
        return -1;
        /*878e80267e6da0facdae3798e0e77778*/
    }
    function branch_87972e55ce92234c(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*52:149 type_group_092_122=>• 8*/
        puid |= 1;
        consume(l, data, state);
        return prod;
        return -1;
        /*87972e55ce92234cbbdd2752da93dee0*/
    }
    function branch_87a5123a1866ad6e(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        /*71:216 comment=>• /* * /*/
        puid |= 1;
        consume(l, data, state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 4;
        if (/*[asterisk/]*/cmpr_set(l, data, 18, 2, 2) && consume(l, data, state)) {
            add_reduce(state, data, 2, 0);
            return prod;
        }
        return -1;
        /*87a5123a1866ad6e934aba615f69f6f9*/
    }
    function branch_87c0759301f4690e(l, data, state, prod, puid) {
        /*14:44 function_expression=>modifier_list fn : type ( parameters • ) { expression_statements }
        14:47 function_expression=>modifier_list fn : type ( parameters • ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 41/*[)]*/) {
            consume(l, data, state);
            puid |= 64;
            /*14:44 function_expression=>modifier_list fn : type ( parameters ) • { expression_statements }
            14:47 function_expression=>modifier_list fn : type ( parameters ) • { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if (l.current_byte == 123/*[{]*/) {
                consume(l, data, state);
                puid |= 128;
                /*14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }
                14:47 function_expression=>modifier_list fn : type ( parameters ) { • }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if (l.current_byte == 125/*[}]*/) {
                    pushFN(data, branch_c3b494f09f364853);
                    return branch_ef1e47c03eb4046e(l, data, state, prod, 128);
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if (((((((((((((((/*[if]*/cmpr_set(l, data, 143, 2, 2) ||/*[match]*/cmpr_set(l, data, 67, 5, 5)) ||/*[break]*/cmpr_set(l, data, 72, 5, 5)) ||/*[return]*/cmpr_set(l, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(l, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(l, data, 63, 4, 4)) ||/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) ||/*[==]*/cmpr_set(l, data, 7, 2, 2)) || dt_bcea2102060eab13(l, data)) ||/*[true]*/cmpr_set(l, data, 95, 4, 4)) ||/*[null]*/cmpr_set(l, data, 35, 4, 4)) || dt_6ae31dd85a62ef5c(l, data)) || assert_ascii(l, 0x0, 0x194, 0x88000000, 0x8000000)) || l.isUniID(data)) || l.isNum(data)) || l.isSym(true, data)) {
                    pushFN(data, branch_c3b494f09f364853);
                    return branch_d7697e76ac6bb46e(l, data, state, prod, 128);
                }
            }
        }
        return -1;
        /*87c0759301f4690ef808319721329c6f*/
    }
    function branch_87fec5f26998ca66(l, data, state, prod, puid) {
        add_reduce(state, data, 3, 47);
        /*-------------INDIRECT-------------------*/
        add_reduce(state, data, 1, 3);
        pushFN(data, $expression_statements_goto);
        return 20;
        /*87fec5f26998ca66e87ea24d8ae36b6f*/
    }
    function branch_880e8907a42a5555(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*77:233 def$hex_digit=>• τb*/
        puid |= 4;
        consume(l, data, state);
        return prod;
        return -1;
        /*880e8907a42a55553dec9b31dbe3b802*/
    }
    function branch_8848f35aa06928ef(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 512;
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 8, 32);
            return prod;
        }
        return -1;
        /*8848f35aa06928ef125c50965f6ca8cb*/
    }
    function branch_896953706e4cc83d(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 2;
        pushFN(data, branch_948756a817d09a5a);
        pushFN(data, $unary_value);
        return puid;
        return -1;
        /*896953706e4cc83dd2703367e2b4e0a2*/
    }
    function branch_897a2e87e72e7b8c(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*54:156 type_group_098_124=>• 32*/
        puid |= 1;
        consume(l, data, state);
        return prod;
        return -1;
        /*897a2e87e72e7b8c867ea137fe4cc945*/
    }
    function branch_89a957c903d5a80d(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 4;
        if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
            add_reduce(state, data, 3, 37);
        }
        return -1;
        /*89a957c903d5a80dc865b5a708ed0654*/
    }
    function branch_89d9ca66aef7ab46(l, data, state, prod, puid) {
        /*108:328 virtual-96:3:1|--lvl:0=>• loop_expression_group_254_111 expression
        109:329 virtual-97:9:1|--lvl:0=>• ( parameters ; expression ; loop_expression_HC_listbody6_112 ) expression
        110:330 virtual-100:8:1|--lvl:0=>• ( parameters ; ; loop_expression_HC_listbody6_112 ) expression
        111:331 virtual-101:8:1|--lvl:0=>• ( parameters ; expression ; ) expression
        112:332 virtual-104:7:1|--lvl:0=>• ( parameters ; ; ) expression
        113:333 virtual-98:7:1|--lvl:0=>• ( primitive_declaration in expression ) expression*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if (l.current_byte == 40/*[(]*/) {
            /*108:328 virtual-96:3:1|--lvl:0=>• loop_expression_group_254_111 expression
            109:329 virtual-97:9:1|--lvl:0=>• ( parameters ; expression ; loop_expression_HC_listbody6_112 ) expression
            110:330 virtual-100:8:1|--lvl:0=>• ( parameters ; ; loop_expression_HC_listbody6_112 ) expression
            111:331 virtual-101:8:1|--lvl:0=>• ( parameters ; expression ; ) expression
            112:332 virtual-104:7:1|--lvl:0=>• ( parameters ; ; ) expression
            113:333 virtual-98:7:1|--lvl:0=>• ( primitive_declaration in expression ) expression*/
            var pk = l.copy();
            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, 0);
            switch (sym_map_1255f361852eac20(pk, data)) {
                case 0:
                    /*--LEAF--*/
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    /*108:328 virtual-96:3:1|--lvl:0=>• loop_expression_group_254_111 expression*/
                    puid |= 2;
                    pushFN(data, branch_6f28120c8e84c586);
                    pushFN(data, $loop_expression_group_254_111);
                    return puid;
                case 1:
                    /*29:92 loop_expression_group_254_111=>• ( expression )
                    109:329 virtual-97:9:1|--lvl:0=>• ( parameters ; expression ; loop_expression_HC_listbody6_112 ) expression
                    110:330 virtual-100:8:1|--lvl:0=>• ( parameters ; ; loop_expression_HC_listbody6_112 ) expression
                    111:331 virtual-101:8:1|--lvl:0=>• ( parameters ; expression ; ) expression
                    112:332 virtual-104:7:1|--lvl:0=>• ( parameters ; ; ) expression
                    113:333 virtual-98:7:1|--lvl:0=>• ( primitive_declaration in expression ) expression*/
                    /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                    consume(l, data, state);
                    puid |= 1;
                    /*29:92 loop_expression_group_254_111=>( • expression )
                    109:329 virtual-97:9:1|--lvl:0=>( • parameters ; expression ; loop_expression_HC_listbody6_112 ) expression
                    110:330 virtual-100:8:1|--lvl:0=>( • parameters ; ; loop_expression_HC_listbody6_112 ) expression
                    111:331 virtual-101:8:1|--lvl:0=>( • parameters ; expression ; ) expression
                    112:332 virtual-104:7:1|--lvl:0=>( • parameters ; ; ) expression
                    113:333 virtual-98:7:1|--lvl:0=>( • primitive_declaration in expression ) expression*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    switch (sym_map_5fb5a91443e6e4f1(l, data)) {
                        case 0:
                            /*--LEAF--*/
                            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                            /*29:92 loop_expression_group_254_111=>( • expression )*/
                            puid |= 2;
                            pushFN(data, branch_f99da89f8249a0d8);
                            pushFN(data, $expression);
                            return puid;
                        case 1:
                            /*-------------VPROD-------------------------*/
                            /*29:92 loop_expression_group_254_111=>( • expression )
                            109:329 virtual-97:9:1|--lvl:0=>( • parameters ; expression ; loop_expression_HC_listbody6_112 ) expression
                            110:330 virtual-100:8:1|--lvl:0=>( • parameters ; ; loop_expression_HC_listbody6_112 ) expression
                            111:331 virtual-101:8:1|--lvl:0=>( • parameters ; expression ; ) expression
                            112:332 virtual-104:7:1|--lvl:0=>( • parameters ; ; ) expression
                            113:333 virtual-98:7:1|--lvl:0=>( • primitive_declaration in expression ) expression*/
                            pushFN(data, branch_ba4816ae8d31501f);
                            return 0;
                        default:
                            break;
                    }
                default:
                    break;
            }
        }
        return -1;
        /*89d9ca66aef7ab46c88f40efb90b01a9*/
    }
    function branch_89e29c5798d3072a(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 512;
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 10, 28);
            return prod;
        }
        return -1;
        /*89e29c5798d3072a790edc960e110722*/
    }
    function branch_8a277c3c8789f796(l, data, state, prod, puid) {
        /*14:45 function_expression=>fn : type • ( parameters ) { expression_statements }
        14:48 function_expression=>fn : type • ( ) { expression_statements }
        14:49 function_expression=>fn : type • ( parameters ) { }
        14:51 function_expression=>fn : type • ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 40/*[(]*/) {
            consume(l, data, state);
            puid |= 16;
            /*14:45 function_expression=>fn : type ( • parameters ) { expression_statements }
            14:49 function_expression=>fn : type ( • parameters ) { }
            14:48 function_expression=>fn : type ( • ) { expression_statements }
            14:51 function_expression=>fn : type ( • ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (l.current_byte == 41/*[)]*/) {
                /*14:48 function_expression=>fn : type ( • ) { expression_statements }
                14:51 function_expression=>fn : type ( • ) { }*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l, data, state);
                puid |= 64;
                /*14:48 function_expression=>fn : type ( ) • { expression_statements }
                14:51 function_expression=>fn : type ( ) • { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                if (l.current_byte == 123/*[{]*/) {
                    consume(l, data, state);
                    puid |= 128;
                    /*14:48 function_expression=>fn : type ( ) { • expression_statements }
                    14:51 function_expression=>fn : type ( ) { • }*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    if (l.current_byte == 125/*[}]*/) {
                        pushFN(data, branch_c3b494f09f364853);
                        return branch_3346b8aed5444375(l, data, state, prod, 128);
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    } else if (((((((((((((((/*[if]*/cmpr_set(l, data, 143, 2, 2) ||/*[match]*/cmpr_set(l, data, 67, 5, 5)) ||/*[break]*/cmpr_set(l, data, 72, 5, 5)) ||/*[return]*/cmpr_set(l, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(l, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(l, data, 63, 4, 4)) ||/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) ||/*[==]*/cmpr_set(l, data, 7, 2, 2)) || dt_bcea2102060eab13(l, data)) ||/*[true]*/cmpr_set(l, data, 95, 4, 4)) ||/*[null]*/cmpr_set(l, data, 35, 4, 4)) || dt_6ae31dd85a62ef5c(l, data)) || assert_ascii(l, 0x0, 0x194, 0x88000000, 0x8000000)) || l.isUniID(data)) || l.isNum(data)) || l.isSym(true, data)) {
                        pushFN(data, branch_c3b494f09f364853);
                        return branch_96333edad814d00e(l, data, state, prod, 128);
                    }
                }
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if (assert_ascii(l, 0x0, 0x10, 0x88000000, 0x0) || l.isUniID(data)) {
                /*14:45 function_expression=>fn : type ( • parameters ) { expression_statements }
                14:49 function_expression=>fn : type ( • parameters ) { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                pushFN(data, branch_c3b51dbb10659234);
                pushFN(data, $parameters);
                puid |= 32;
                return puid;
            }
        }
        return -1;
        /*8a277c3c8789f796d21bfb85fb109313*/
    }
    function branch_8a6256cbbd63092a(l, data, state, prod, puid) {
        /*25:80 binary_expression=>unary_expression operator •
        25:81 binary_expression=>unary_expression operator • expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        switch (sym_map_b5b0535fb6bbe10a(l, data)) {
            default:
            case 0:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                /*25:80 binary_expression=>unary_expression operator •*/
                add_reduce(state, data, 2, 46);
                /*-------------INDIRECT-------------------*/
                add_reduce(state, data, 1, 3);
                pushFN(data, $expression_statements_goto);
                return 20;
            case 1:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*25:81 binary_expression=>unary_expression operator • expression*/
                puid |= 4;
                pushFN(data, branch_87fec5f26998ca66);
                pushFN(data, $expression);
                return puid;
            case 2:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                /*25:81 binary_expression=>unary_expression operator • expression*/
                puid |= 4;
                pushFN(data, branch_87fec5f26998ca66);
                pushFN(data, $expression);
                return puid;
        }
        return -1;
        /*8a6256cbbd63092aa2d174f1065287fd*/
    }
    function branch_8a9db598cbaf1708(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*21:73 expression=>{ • expression_statements }*/
        puid |= 512;
        pushFN(data, branch_c54894ab95e5de2b);
        pushFN(data, $expression_statements);
        return puid;
        return -1;
        /*8a9db598cbaf17087e16311bd43613ae*/
    }
    function branch_8aacc0bf5ef96cc9(l, data, state, prod, puid) {
        /*43:126 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_170_116
        43:128 primitive_declaration=>modifier_list identifier : type •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 61/*[=]*/) {
            pushFN(data, branch_cbc044c8c9b81bf7);
            return branch_8648628ea28d7554(l, data, state, prod, 8);
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*43:128 primitive_declaration=>modifier_list identifier : type •*/
            add_reduce(state, data, 4, 76);
            /*-------------INDIRECT-------------------*/
            return 9;
        }
        return -1;
        /*8aacc0bf5ef96cc96c13543a66fb9b8a*/
    }
    function branch_8afa2195b5a87a2a(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*77:243 def$hex_digit=>• τF*/
        puid |= 4096;
        consume(l, data, state);
        return prod;
        return -1;
        /*8afa2195b5a87a2a55ef738133276e0e*/
    }
    function branch_8b3b56fff2880b29(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*49:142 modifier_list_HC_listbody1_120=>modifier_list_HC_listbody1_120 • modifier*/
        puid |= 2;
        pushFN(data, branch_cfb3fe9c738c88e2);
        pushFN(data, $modifier);
        return puid;
        return -1;
        /*8b3b56fff2880b290a6adba16d6b02e6*/
    }
    function branch_8bf56374f58dd79b(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*91:275 def$binary_token_HC_listbody1_107=>def$binary_token_HC_listbody1_107 • def$binary_token_group_047_106*/
        puid |= 2;
        pushFN(data, branch_cfb3fe9c738c88e2);
        pushFN(data, $def$binary_token_group_047_106);
        return puid;
        return -1;
        /*8bf56374f58dd79b1c85cbcd58aa8ee6*/
    }
    function branch_8bf7f3e4c05b5cac(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $def$defaultproductions_goto);
        return 75;
        /*8bf7f3e4c05b5cac0b06c5055d7fd92e*/
    }
    function branch_8c4605c70c72ddec(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*27:89 unary_value=>( • expression_statements_group_023_108 )*/
        puid |= 32;
        pushFN(data, branch_e570b4eb4eafcb66);
        pushFN(data, $expression_statements_group_023_108);
        return puid;
        return -1;
        /*8c4605c70c72ddec0ae57795b957755f*/
    }
    function branch_8c6606bd8966675f(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        /*11:26 class=>modifier_list cls identifier • { class_HC_listbody1_105 }*/
        puid |= 16;
        consume(l, data, state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 32;
        pushFN(data, branch_7dac51016cbca423);
        pushFN(data, $class_HC_listbody1_105);
        return puid;
        return -1;
        /*8c6606bd8966675f4aee2579c60f76e9*/
    }
    function branch_8cb2770eb9e703da(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*48:139 identifier_token=>identifier_token_group_075_117 • identifier_token_group_080_119*/
        puid |= 4;
        pushFN(data, branch_f3c5df3271892b40);
        pushFN(data, $identifier_token_group_080_119);
        return puid;
        return -1;
        /*8cb2770eb9e703da50ab78799666ce69*/
    }
    function branch_8d18e8476d3015f9(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*57:170 string_group_0112_125=>• θws*/
        puid |= 1;
        consume(l, data, state);
        return prod;
        return -1;
        /*8d18e8476d3015f9c88b9e74e9b63601*/
    }
    function branch_8de46b48db2ae3fb(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, $module_goto);
        return 3;
        /*8de46b48db2ae3fbaa99caa2a9860fab*/
    }
    function branch_8f37025c10045eb0(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*47:137 identifier_token_group_080_119=>• θnl*/
        puid |= 2;
        consume(l, data, state);
        return prod;
        return -1;
        /*8f37025c10045eb0ef284de714cbe514*/
    }
    function branch_8f440e68935ae836(l, data, state, prod, puid) {
        add_reduce(state, data, 2, 39);
        return prod;
        /*8f440e68935ae836cde5eeab92b36a6e*/
    }
    function branch_8fde9a40ce864be3(l, data, state, prod, puid) {
        pushFN(data, $def$identifier_symbols_goto);
        return 107;
        /*8fde9a40ce864be3bb2a2c38489c0e61*/
    }
    function branch_90eee6febcdc2fe0(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*12:35 struct=>str identifier { • }*/
        puid |= 32;
        consume(l, data, state);
        add_reduce(state, data, 4, 19);
        return prod;
        return -1;
        /*90eee6febcdc2fe054aec6e56d4decb3*/
    }
    function branch_91bd6de142fc31b3(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 88);
        pushFN(data, $string_HC_listbody1_127_goto);
        return 59;
        /*91bd6de142fc31b389ffad694c2371ba*/
    }
    function branch_921199f2ed2c1598(l, data, state, prod, puid) {
        /*14:44 function_expression=>modifier_list fn : type • ( parameters ) { expression_statements }
        14:46 function_expression=>modifier_list fn : type • ( ) { expression_statements }
        14:47 function_expression=>modifier_list fn : type • ( parameters ) { }
        14:50 function_expression=>modifier_list fn : type • ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 40/*[(]*/) {
            consume(l, data, state);
            puid |= 16;
            /*14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
            14:47 function_expression=>modifier_list fn : type ( • parameters ) { }
            14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
            14:50 function_expression=>modifier_list fn : type ( • ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (l.current_byte == 41/*[)]*/) {
                /*14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
                14:50 function_expression=>modifier_list fn : type ( • ) { }*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l, data, state);
                puid |= 64;
                /*14:46 function_expression=>modifier_list fn : type ( ) • { expression_statements }
                14:50 function_expression=>modifier_list fn : type ( ) • { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                if (l.current_byte == 123/*[{]*/) {
                    consume(l, data, state);
                    puid |= 128;
                    /*14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }
                    14:50 function_expression=>modifier_list fn : type ( ) { • }*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    if (l.current_byte == 125/*[}]*/) {
                        pushFN(data, branch_74c8218421c7bef8);
                        return branch_c8952b549cb04b31(l, data, state, prod, 128);
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    } else if (((((((((((((((/*[if]*/cmpr_set(l, data, 143, 2, 2) ||/*[match]*/cmpr_set(l, data, 67, 5, 5)) ||/*[break]*/cmpr_set(l, data, 72, 5, 5)) ||/*[return]*/cmpr_set(l, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(l, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(l, data, 63, 4, 4)) ||/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) ||/*[==]*/cmpr_set(l, data, 7, 2, 2)) || dt_bcea2102060eab13(l, data)) ||/*[true]*/cmpr_set(l, data, 95, 4, 4)) ||/*[null]*/cmpr_set(l, data, 35, 4, 4)) || dt_6ae31dd85a62ef5c(l, data)) || assert_ascii(l, 0x0, 0x194, 0x88000000, 0x8000000)) || l.isUniID(data)) || l.isNum(data)) || l.isSym(true, data)) {
                        pushFN(data, branch_74c8218421c7bef8);
                        return branch_b429028eaec66fb9(l, data, state, prod, 128);
                    }
                }
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if (assert_ascii(l, 0x0, 0x10, 0x88000000, 0x0) || l.isUniID(data)) {
                /*14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
                14:47 function_expression=>modifier_list fn : type ( • parameters ) { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                pushFN(data, branch_baddcf71a394dd32);
                pushFN(data, $parameters);
                puid |= 32;
                return puid;
            }
        }
        return -1;
        /*921199f2ed2c15984e960877eb01ba94*/
    }
    function branch_92f89ad1b8179e19(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 512;
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 9, 29);
            return prod;
        }
        return -1;
        /*92f89ad1b8179e19765f2a37e941c1ba*/
    }
    function branch_938e0f3e4f054932(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*100:300 def$string_value_group_071_112=>• θws*/
        puid |= 8;
        consume(l, data, state);
        return prod;
        return -1;
        /*938e0f3e4f0549328c4583ad37e8ddc4*/
    }
    function branch_93e110ed574c987e(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, $def$hex_token_HC_listbody1_105_goto);
        return 88;
        /*93e110ed574c987ecf9ef13507524cab*/
    }
    function branch_948756a817d09a5a(l, data, state, prod, puid) {
        add_reduce(state, data, 2, 46);
        return prod;
        /*948756a817d09a5a741a41cc45593cf4*/
    }
    function branch_94944ab6198b398b(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*107:324 def$identifier_symbols=>def$identifier_symbols • θnum*/
        puid |= 32;
        consume(l, data, state);
        add_reduce(state, data, 2, 87);
        return prod;
        return -1;
        /*94944ab6198b398b7581de7724e1ab99*/
    }
    function branch_94c7d1724080d2cb(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*4:8 statements=>• primitive_declaration ;*/
        puid |= 4;
        pushFN(data, branch_f8f570a28683ce97);
        pushFN(data, $primitive_declaration);
        return puid;
        return -1;
        /*94c7d1724080d2cb42be395abfd834ce*/
    }
    function branch_94fd660a5f5694c4(l, data, state, prod, puid) {
        return 56;
        /*94fd660a5f5694c48043661f5e87a341*/
    }
    function branch_953325efa0d36ff1(l, data, state, prod, puid) {
        return 65;
        /*953325efa0d36ff1cf52b091a40d0fde*/
    }
    function branch_9560ededec206e5d(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*43:127 primitive_declaration=>identifier : type • primitive_declaration_group_170_116*/
        puid |= 16;
        pushFN(data, branch_20c4644763e1b1fc);
        pushFN(data, $primitive_declaration_group_170_116);
        return puid;
        return -1;
        /*9560ededec206e5d1dbd3cd7e8551d82*/
    }
    function branch_960245c9aee1dcc7(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*110:330 virtual-193:3:1|--lvl:0=>operator_HC_listbody1_129 • identifier_token_group_080_119*/
        puid |= 4;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $identifier_token_group_080_119);
        return puid;
        return -1;
        /*960245c9aee1dcc77aac7c701d4c0280*/
    }
    function branch_96333edad814d00e(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*14:48 function_expression=>fn : type ( ) { • expression_statements }*/
        puid |= 256;
        pushFN(data, branch_8848f35aa06928ef);
        pushFN(data, $expression_statements);
        return puid;
        return -1;
        /*96333edad814d00e30df737e5dfc4279*/
    }
    function branch_972ff6b6783b90ac(l, data, state, prod, puid) {
        add_reduce(state, data, 3, 43);
        return 22;
        /*972ff6b6783b90ac75430f9d9b076111*/
    }
    function branch_974fae918d9e824f(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*13:41 function=>fn identifier : type ( parameters ) { • }*/
        puid |= 1024;
        consume(l, data, state);
        add_reduce(state, data, 9, 25);
        return prod;
        return -1;
        /*974fae918d9e824f55a4c17e4d75bda5*/
    }
    function branch_97595c541a25c591(l, data, state, prod, puid) {
        return 54;
        /*97595c541a25c591101437e76a669f2d*/
    }
    function branch_97946dd38e34dd15(l, data, state, prod, puid) {
        pushFN(data, $expression_statements_goto);
        return 44;
        /*97946dd38e34dd15fca388ad27f0753f*/
    }
    function branch_97974f8251f51cf8(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*109:329 virtual-127:4:1|--lvl:0=>: type • primitive_declaration_group_170_116*/
        puid |= 16;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $primitive_declaration_group_170_116);
        return puid;
        return -1;
        /*97974f8251f51cf8aa3decfadd9b7714*/
    }
    function branch_97dd74ec15c2488b(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*14:45 function_expression=>fn : type ( parameters ) { • expression_statements }*/
        puid |= 256;
        pushFN(data, branch_92f89ad1b8179e19);
        pushFN(data, $expression_statements);
        return puid;
        return -1;
        /*97dd74ec15c2488b5d8e0acc46c4c472*/
    }
    function branch_994b63b121480b5a(l, data, state, prod, puid) {
        add_reduce(state, data, 3, 50);
        return 31;
        /*994b63b121480b5aa0b04d6be9971342*/
    }
    function branch_995577f63a2dac51(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, $namespace_HC_listbody3_102_goto);
        return 6;
        /*995577f63a2dac51758fd4f85acbc5bc*/
    }
    function branch_9aa210af00cc99e6(l, data, state, prod, puid) {
        /*84:252 def$scientific_token=>def$float_token • def$scientific_token_group_228_102
        84:253 def$scientific_token=>def$float_token •*/
        skip_a294e41529bc9275(l/*[ nl ][ 71 ]*/, data, state);
        switch (sym_map_937c28530cf66b31(l, data)) {
            case 0:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*84:252 def$scientific_token=>def$float_token • def$scientific_token_group_228_102*/
                puid |= 2;
                pushFN(data, branch_e187025a283f9525);
                pushFN(data, $def$scientific_token_group_228_102);
                return puid;
            default:
            case 1:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                /*84:253 def$scientific_token=>def$float_token •*/
                return 84;
        }
        return -1;
        /*9aa210af00cc99e6d7bb6c8e52e88214*/
    }
    function branch_9aabcc4d9e8ae40d(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*77:241 def$hex_digit=>• τD*/
        puid |= 1024;
        consume(l, data, state);
        return prod;
        return -1;
        /*9aabcc4d9e8ae40d990c7459b89254ff*/
    }
    function branch_9b2c12ad34f1d87e(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*90:274 def$binary_token_group_047_106=>• 1*/
        puid |= 2;
        consume(l, data, state);
        return prod;
        return -1;
        /*9b2c12ad34f1d87e6f031ee94fa1881c*/
    }
    function branch_9cfdbe8e2848ebd3(l, data, state, prod, puid) {
        /*43:127 primitive_declaration=>identifier : type • primitive_declaration_group_170_116
        43:129 primitive_declaration=>identifier : type •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 61/*[=]*/) {
            pushFN(data, branch_760d44f847ea15ad);
            return branch_9560ededec206e5d(l, data, state, prod, 8);
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*43:129 primitive_declaration=>identifier : type •*/
            add_reduce(state, data, 3, 77);
            /*-------------INDIRECT-------------------*/
            pushFN(data, branch_40a7ef9e3eb88045);
            return 43;
        }
        return -1;
        /*9cfdbe8e2848ebd3cfe5ae52b7c5db3b*/
    }
    function branch_9d0f7e4eaff28437(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*65:193 operator=>== operator_HC_listbody1_129 • identifier_token_group_080_119*/
        puid |= 4;
        pushFN(data, branch_d596098ff435f05e);
        pushFN(data, $identifier_token_group_080_119);
        return puid;
        return -1;
        /*9d0f7e4eaff284377916509e20764713*/
    }
    function branch_9d5f1a5b501971c8(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*77:237 def$hex_digit=>• τf*/
        puid |= 64;
        consume(l, data, state);
        return prod;
        return -1;
        /*9d5f1a5b501971c8c2ccf03fc8dfa96e*/
    }
    function branch_9d83023b18564469(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*107:322 def$identifier_symbols=>def$identifier_symbols • -*/
        puid |= 8;
        consume(l, data, state);
        add_reduce(state, data, 2, 87);
        return prod;
        return -1;
        /*9d83023b18564469f055cf1d26033783*/
    }
    function branch_9de7f9ab877f82ab(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        add_reduce(state, data, 3, 50);
        return 31;
        /*9de7f9ab877f82ab27101227dafc22c9*/
    }
    function branch_9e58a71bfd7b2495(l, data, state, prod, puid) {
        pushFN(data, branch_40a7ef9e3eb88045);
        return 44;
        /*9e58a71bfd7b24953b98eec20c32a5d8*/
    }
    function branch_9ebb71d35930ad53(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
        /*37:116 member_expression=>member_expression • [ expression ]*/
        puid |= 8;
        consume(l, data, state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 16;
        pushFN(data, branch_d27adec3f521a53f);
        pushFN(data, $expression);
        return puid;
        return -1;
        /*9ebb71d35930ad533a5af2611fc3b9b6*/
    }
    function branch_9ebcaffd71102f54(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, $match_expression_HC_listbody3_113_goto);
        return 32;
        /*9ebcaffd71102f54f17757ddc0c53252*/
    }
    function branch_9f0a04323a32a77b(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, $parameters_goto);
        return 16;
        /*9f0a04323a32a77b22c0c86d4982d704*/
    }
    function branch_9f3bd435e65d98b7(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*66:203 modifier=>• mut*/
        puid |= 8;
        consume(l, data, state);
        return prod;
        return -1;
        /*9f3bd435e65d98b7ee76fde0f9d10ff5*/
    }
    function branch_a096c4c7ffee9637(l, data, state, prod, puid) {
        add_reduce(state, data, 2, 71);
        return 40;
        /*a096c4c7ffee9637e1c722bb83931c52*/
    }
    function branch_a0ce7c0c0be8d7d8(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 128;
        if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            puid |= 4;
            pushFN(data, branch_1f9ddf3c27180aa0);
            pushFN(data, $expression);
            return puid;
        }
        return -1;
        /*a0ce7c0c0be8d7d81cc5ec6abbc4432a*/
    }
    function branch_a1186298bc0087ac(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, branch_40a7ef9e3eb88045);
        return 26;
        /*a1186298bc0087ac1909602961f0c224*/
    }
    function branch_a128b75b77459fe9(l, data, state, prod, puid) {
        add_reduce(state, data, 3, 36);
        return prod;
        /*a128b75b77459fe9494fd219712ed31d*/
    }
    function branch_a141374823a663ee(l, data, state, prod, puid) {
        /*11:24 class=>modifier_list cls identifier class_group_113_103 • { class_HC_listbody1_105 }
        11:27 class=>modifier_list cls identifier class_group_113_103 • { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 123/*[{]*/) {
            consume(l, data, state);
            puid |= 16;
            /*11:24 class=>modifier_list cls identifier class_group_113_103 { • class_HC_listbody1_105 }
            11:27 class=>modifier_list cls identifier class_group_113_103 { • }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if (l.current_byte == 125/*[}]*/) {
                pushFN(data, branch_0a5b9c282ee399c8);
                return branch_dc4ac9cf8150dd1a(l, data, state, prod, 16);
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if (((/*[str]*/cmpr_set(l, data, 47, 3, 3) ||/*[fn]*/cmpr_set(l, data, 144, 2, 2)) || assert_ascii(l, 0x0, 0x10, 0x88000000, 0x0)) || l.isUniID(data)) {
                pushFN(data, branch_0a5b9c282ee399c8);
                return branch_f13eafcddbdd43be(l, data, state, prod, 16);
            }
        }
        return -1;
        /*a141374823a663ee46e97af93479c18d*/
    }
    function branch_a159faaa8b4d52a5(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, $string_HC_listbody1_127_goto);
        return 59;
        /*a159faaa8b4d52a5478f896a87ee8035*/
    }
    function branch_a280998f5fd578b8(l, data, state, prod, puid) {
        add_reduce(state, data, 2, 0);
        return 38;
        /*a280998f5fd578b8f6d7f5e060c281db*/
    }
    function branch_a289e06c7ea8acb0(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*95:288 def$octal_token_HC_listbody1_110=>def$octal_token_HC_listbody1_110 • def$octal_token_group_058_109*/
        puid |= 2;
        pushFN(data, branch_cfb3fe9c738c88e2);
        pushFN(data, $def$octal_token_group_058_109);
        return puid;
        return -1;
        /*a289e06c7ea8acb0ed21cdf7030c0432*/
    }
    function branch_a2ade393e0ff2119(l, data, state, prod, puid) {
        add_reduce(state, data, 2, 0);
        return 96;
        /*a2ade393e0ff2119b3fa1b310e414095*/
    }
    function branch_a323db6daec375bc(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*57:172 string_group_0112_125=>• θid*/
        puid |= 4;
        consume(l, data, state);
        return prod;
        return -1;
        /*a323db6daec375bc9abd8fd0d6159b24*/
    }
    function branch_a324eb80845832bc(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        /*71:217 comment=>• // comment_group_0144_133*/
        puid |= 8;
        consume(l, data, state);
        skip_6c02533b5dc0d802(l/*[ ws ][ 71 ]*/, data, state);
        puid |= 32;
        pushFN(data, branch_f3c5df3271892b40);
        pushFN(data, $comment_group_0144_133);
        return puid;
        return -1;
        /*a324eb80845832bca69c24fce34c2c52*/
    }
    function branch_a36b80ecc9b33e07(l, data, state, prod, puid) {
        /*13:36 function=>modifier_list fn identifier : type ( parameters • ) { expression_statements }
        13:39 function=>modifier_list fn identifier : type ( parameters • ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 41/*[)]*/) {
            consume(l, data, state);
            puid |= 128;
            /*13:36 function=>modifier_list fn identifier : type ( parameters ) • { expression_statements }
            13:39 function=>modifier_list fn identifier : type ( parameters ) • { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if (l.current_byte == 123/*[{]*/) {
                consume(l, data, state);
                puid |= 256;
                /*13:36 function=>modifier_list fn identifier : type ( parameters ) { • expression_statements }
                13:39 function=>modifier_list fn identifier : type ( parameters ) { • }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if (l.current_byte == 125/*[}]*/) {
                    pushFN(data, branch_cbc044c8c9b81bf7);
                    return branch_c9ed7295adaf6608(l, data, state, prod, 256);
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if (((((((((((((((/*[if]*/cmpr_set(l, data, 143, 2, 2) ||/*[match]*/cmpr_set(l, data, 67, 5, 5)) ||/*[break]*/cmpr_set(l, data, 72, 5, 5)) ||/*[return]*/cmpr_set(l, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(l, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(l, data, 63, 4, 4)) ||/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) ||/*[==]*/cmpr_set(l, data, 7, 2, 2)) || dt_bcea2102060eab13(l, data)) ||/*[true]*/cmpr_set(l, data, 95, 4, 4)) ||/*[null]*/cmpr_set(l, data, 35, 4, 4)) || dt_6ae31dd85a62ef5c(l, data)) || assert_ascii(l, 0x0, 0x194, 0x88000000, 0x8000000)) || l.isUniID(data)) || l.isNum(data)) || l.isSym(true, data)) {
                    pushFN(data, branch_cbc044c8c9b81bf7);
                    return branch_2021bb8956171841(l, data, state, prod, 256);
                }
            }
        }
        return -1;
        /*a36b80ecc9b33e072914ec8ba9f5bc3f*/
    }
    function branch_a54dd2b31946efcd(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 2;
        if ((l.current_byte == 58/*[:]*/) && consume(l, data, state)) {
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            puid |= 1;
            pushFN(data, branch_69da744e43e07c30);
            pushFN(data, $expression);
            return puid;
        }
        return -1;
        /*a54dd2b31946efcd042a817e444a0043*/
    }
    function branch_a5562234cf1d4d6b(l, data, state, prod, puid) {
        /*43:126 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_170_116
        43:128 primitive_declaration=>modifier_list identifier : type •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 61/*[=]*/) {
            pushFN(data, branch_104d5a190a45ad94);
            return branch_8648628ea28d7554(l, data, state, prod, 8);
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*43:128 primitive_declaration=>modifier_list identifier : type •*/
            add_reduce(state, data, 4, 76);
            /*-------------INDIRECT-------------------*/
            return 18;
        }
        return -1;
        /*a5562234cf1d4d6b87fae6cd4f493c75*/
    }
    function branch_a5787174b8f077f4(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*94:282 def$octal_token_group_058_109=>• 2*/
        puid |= 4;
        consume(l, data, state);
        return prod;
        return -1;
        /*a5787174b8f077f46078538df4cfaa6d*/
    }
    function branch_a6ab45631474dbf9(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 1024;
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 9, 24);
            return prod;
        }
        return -1;
        /*a6ab45631474dbf9d380b8cb19da6471*/
    }
    function branch_a6b376ed0bf34743(l, data, state, prod, puid) {
        add_reduce(state, data, 2, 0);
        return 89;
        /*a6b376ed0bf34743cfdd9c0272c37bee*/
    }
    function branch_a78884de3ae3aaaf(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*101:306 def$string_value_group_172_113=>• \ def$string_value_group_071_112*/
        puid |= 16;
        consume(l, data, state);
        skip_db1786a8af54d666(l/*[ 71 ]*/, data, state);
        puid |= 32;
        pushFN(data, branch_f3c5df3271892b40);
        pushFN(data, $def$string_value_group_071_112);
        return puid;
        return -1;
        /*a78884de3ae3aaaf33b2f0cb2a3528fb*/
    }
    function branch_a793674caf298021(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*14:49 function_expression=>fn : type ( parameters ) { • }*/
        puid |= 512;
        consume(l, data, state);
        add_reduce(state, data, 8, 33);
        return prod;
        return -1;
        /*a793674caf298021d2f03369a4ef15be*/
    }
    function branch_a8af9f953e2f614c(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*62:187 num_tok=>• def$octal*/
        puid |= 8;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $def$octal);
        return puid;
        return -1;
        /*a8af9f953e2f614cf729b80e4ccb935e*/
    }
    function branch_a92c5655c1c0d7d5(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*56:168 value=>• null*/
        puid |= 16;
        consume(l, data, state);
        add_reduce(state, data, 1, 86);
        return prod;
        return -1;
        /*a92c5655c1c0d7d5159c74856b2270c0*/
    }
    function branch_aa2d67a74744fb41(l, data, state, prod, puid) {
        add_reduce(state, data, 3, 47);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $expression_goto);
        return 21;
        /*aa2d67a74744fb41027f8c0d70cb6ba5*/
    }
    function branch_aa931ce591aec83c(l, data, state, prod, puid) {
        /*14:44 function_expression=>modifier_list fn : type • ( parameters ) { expression_statements }
        14:46 function_expression=>modifier_list fn : type • ( ) { expression_statements }
        14:47 function_expression=>modifier_list fn : type • ( parameters ) { }
        14:50 function_expression=>modifier_list fn : type • ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 40/*[(]*/) {
            consume(l, data, state);
            puid |= 16;
            /*14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
            14:47 function_expression=>modifier_list fn : type ( • parameters ) { }
            14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
            14:50 function_expression=>modifier_list fn : type ( • ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (l.current_byte == 41/*[)]*/) {
                /*14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
                14:50 function_expression=>modifier_list fn : type ( • ) { }*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l, data, state);
                puid |= 64;
                /*14:46 function_expression=>modifier_list fn : type ( ) • { expression_statements }
                14:50 function_expression=>modifier_list fn : type ( ) • { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                if (l.current_byte == 123/*[{]*/) {
                    consume(l, data, state);
                    puid |= 128;
                    /*14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }
                    14:50 function_expression=>modifier_list fn : type ( ) { • }*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    if (l.current_byte == 125/*[}]*/) {
                        pushFN(data, branch_a1186298bc0087ac);
                        return branch_c8952b549cb04b31(l, data, state, prod, 128);
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    } else if (((((((((((((((/*[if]*/cmpr_set(l, data, 143, 2, 2) ||/*[match]*/cmpr_set(l, data, 67, 5, 5)) ||/*[break]*/cmpr_set(l, data, 72, 5, 5)) ||/*[return]*/cmpr_set(l, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(l, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(l, data, 63, 4, 4)) ||/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) ||/*[==]*/cmpr_set(l, data, 7, 2, 2)) || dt_bcea2102060eab13(l, data)) ||/*[true]*/cmpr_set(l, data, 95, 4, 4)) ||/*[null]*/cmpr_set(l, data, 35, 4, 4)) || dt_6ae31dd85a62ef5c(l, data)) || assert_ascii(l, 0x0, 0x194, 0x88000000, 0x8000000)) || l.isUniID(data)) || l.isNum(data)) || l.isSym(true, data)) {
                        pushFN(data, branch_a1186298bc0087ac);
                        return branch_b429028eaec66fb9(l, data, state, prod, 128);
                    }
                }
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if (assert_ascii(l, 0x0, 0x10, 0x88000000, 0x0) || l.isUniID(data)) {
                /*14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
                14:47 function_expression=>modifier_list fn : type ( • parameters ) { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                pushFN(data, branch_2551979fa53fe897);
                pushFN(data, $parameters);
                puid |= 32;
                return puid;
            }
        }
        return -1;
        /*aa931ce591aec83c97f85346d0b058df*/
    }
    function branch_aabd2b73b3cb3db4(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*27:87 unary_value=>• function_expression*/
        puid |= 4;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $function_expression);
        return puid;
        return -1;
        /*aabd2b73b3cb3db45e83a427a9104be3*/
    }
    function branch_ab0e49b083d1503b(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*82:248 def$scientific_token_group_027_101=>• e*/
        puid |= 1;
        consume(l, data, state);
        return prod;
        return -1;
        /*ab0e49b083d1503b7b1a735c8d2a8d76*/
    }
    function branch_abbab37a8b5c11c0(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
        /*32:106 match_expression_HC_listbody3_113=>match_expression_HC_listbody3_113 • , match_clause*/
        puid |= 2;
        consume(l, data, state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 4;
        pushFN(data, branch_a128b75b77459fe9);
        pushFN(data, $match_clause);
        return puid;
        return -1;
        /*abbab37a8b5c11c0587cef3539f79553*/
    }
    function branch_abdc49b7a2c7142e(l, data, state, prod, puid) {
        /*108:328 virtual-192:3:1|--lvl:0=>• operator_HC_listbody1_128 identifier_token_group_080_119
        109:329 virtual-195:2:1|--lvl:0=>• operator_HC_listbody1_128*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.isSym(true, data)) {
            /*108:328 virtual-192:3:1|--lvl:0=>• operator_HC_listbody1_128 identifier_token_group_080_119
            109:329 virtual-195:2:1|--lvl:0=>• operator_HC_listbody1_128*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_cfc012902f66b777);
            pushFN(data, $operator_HC_listbody1_128);
            puid |= 2;
            return puid;
        }
        return -1;
        /*abdc49b7a2c7142e14c4130d5f01c91d*/
    }
    function branch_ac5da3abe5ddef99(l, data, state, prod, puid) {
        /*43:126 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_170_116
        43:128 primitive_declaration=>modifier_list identifier : type •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 61/*[=]*/) {
            pushFN(data, branch_eca1b2fa9939e9a9);
            return branch_8648628ea28d7554(l, data, state, prod, 8);
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*43:128 primitive_declaration=>modifier_list identifier : type •*/
            add_reduce(state, data, 4, 76);
            /*-------------INDIRECT-------------------*/
            pushFN(data, $statements_goto);
            return 43;
        }
        return -1;
        /*ac5da3abe5ddef99a68ab57e41ffe97d*/
    }
    function branch_acdb9cfb265391cc(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*44:130 identifier=>• tk:identifier_token*/
        puid |= 1;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $identifier);
        return puid;
        return -1;
        /*acdb9cfb265391cc2424c4f5f8a779a8*/
    }
    function branch_ad42e5b692f898b7(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
        /*64:190 operator_HC_listbody1_129=>operator_HC_listbody1_129 • θsym*/
        puid |= 2;
        consume(l, data, state);
        add_reduce(state, data, 2, 87);
        return prod;
        return -1;
        /*ad42e5b692f898b7eee5fe3d2eafe7b6*/
    }
    function branch_ae32c9a5462cacda(l, data, state, prod, puid) {
        /*14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
        14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
        14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
        14:50 function_expression=>modifier_list • fn : type ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (/*[fn]*/cmpr_set(l, data, 144, 2, 2)) {
            consume(l, data, state);
            puid |= 2;
            /*14:44 function_expression=>modifier_list fn • : type ( parameters ) { expression_statements }
            14:46 function_expression=>modifier_list fn • : type ( ) { expression_statements }
            14:47 function_expression=>modifier_list fn • : type ( parameters ) { }
            14:50 function_expression=>modifier_list fn • : type ( ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if (l.current_byte == 58/*[:]*/) {
                consume(l, data, state);
                puid |= 4;
                /*14:44 function_expression=>modifier_list fn : • type ( parameters ) { expression_statements }
                14:46 function_expression=>modifier_list fn : • type ( ) { expression_statements }
                14:47 function_expression=>modifier_list fn : • type ( parameters ) { }
                14:50 function_expression=>modifier_list fn : • type ( ) { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                pushFN(data, branch_c904e9774080f86f);
                pushFN(data, $type);
                puid |= 8;
                return puid;
            }
        }
        return -1;
        /*ae32c9a5462cacda43ea8e8af30c4295*/
    }
    function branch_ae787e3866c9a5e4(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*7:16 namespace=>ns identifier { • namespace_HC_listbody3_102 }*/
        puid |= 8;
        pushFN(data, branch_219b628b1680056a);
        pushFN(data, $namespace_HC_listbody3_102);
        return puid;
        return -1;
        /*ae787e3866c9a5e4bd21720487c8e57f*/
    }
    function branch_aec4596816df37e4(l, data, state, prod, puid) {
        /*13:37 function=>fn identifier • : type ( parameters ) { expression_statements }
        13:40 function=>fn identifier • : type ( ) { expression_statements }
        13:41 function=>fn identifier • : type ( parameters ) { }
        13:43 function=>fn identifier • : type ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 58/*[:]*/) {
            consume(l, data, state);
            puid |= 8;
            /*13:37 function=>fn identifier : • type ( parameters ) { expression_statements }
            13:40 function=>fn identifier : • type ( ) { expression_statements }
            13:41 function=>fn identifier : • type ( parameters ) { }
            13:43 function=>fn identifier : • type ( ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_b5938eff80f94e50);
            pushFN(data, $type);
            puid |= 16;
            return puid;
        }
        return -1;
        /*aec4596816df37e4c39db160439b7347*/
    }
    function branch_af5de54fdfe292b2(l, data, state, prod, puid) {
        /*65:192 operator=>θsym operator_HC_listbody1_128 • identifier_token_group_080_119
        65:195 operator=>θsym operator_HC_listbody1_128 •*/
        skip_db1786a8af54d666(l/*[ 71 ]*/, data, state);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/) {
            pushFN(data, branch_3205c0ded576131e);
            return branch_6aa2aeb2bf248672(l, data, state, prod, 2);
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*65:195 operator=>θsym operator_HC_listbody1_128 •*/
            add_reduce(state, data, 2, 91);
        }
        return -1;
        /*af5de54fdfe292b2560bdb3de0259add*/
    }
    function branch_af6a16892ca41954(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*110:330 virtual-138:3:1|--lvl:0=>identifier_token_HC_listbody1_118 • identifier_token_group_080_119*/
        puid |= undefined;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $identifier_token_group_080_119);
        return puid;
        return -1;
        /*af6a16892ca419547c24e0260aa641c3*/
    }
    function branch_aff2e945f74821f8(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*94:284 def$octal_token_group_058_109=>• 4*/
        puid |= 16;
        consume(l, data, state);
        return prod;
        return -1;
        /*aff2e945f74821f8ab2815ad51058f0f*/
    }
    function branch_b0016a63eef6ed7f(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, $comment_HC_listbody1_131_goto);
        return 68;
        /*b0016a63eef6ed7f2b8efc43788d7b10*/
    }
    function branch_b0b72ac3ae560402(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, $member_expression_goto);
        return 37;
        /*b0b72ac3ae56040272f440b961e4c86a*/
    }
    function branch_b0d452ef4b96c9b3(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*100:297 def$string_value_group_071_112=>• θnum*/
        puid |= 1;
        consume(l, data, state);
        return prod;
        return -1;
        /*b0d452ef4b96c9b3a91a46f7808273d6*/
    }
    function branch_b0d9563b6096167b(l, data, state, prod, puid) {
        /*120:340 virtual-118:1:1|--lvl:2=>•
        121:341 virtual-127:4:1|--lvl:2=>• : type primitive_declaration_group_170_116
        122:342 virtual-129:3:1|--lvl:2=>• : type*/
        switch (sym_map_9fff07fe93fb5f87(l, data)) {
            case 0:
                /*121:341 virtual-127:4:1|--lvl:2=>• : type primitive_declaration_group_170_116
                122:342 virtual-129:3:1|--lvl:2=>• : type*/
                var pk = l.copy();
                skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, 0);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if (((((/*[uint]*/cmpr_set(pk, data, 83, 4, 4) ||/*[int]*/cmpr_set(pk, data, 84, 3, 3)) ||/*[flt]*/cmpr_set(pk, data, 125, 3, 3)) || dt_1e3f2d5b696b270e(pk, data)) || assert_ascii(pk, 0x0, 0x10, 0x80000000, 0x200240)) || pk.isUniID(data)) {
                    /*121:341 virtual-127:4:1|--lvl:2=>• : type primitive_declaration_group_170_116
                    122:342 virtual-129:3:1|--lvl:2=>• : type*/
                    /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                    consume(l, data, state);
                    puid |= 4;
                    /*121:341 virtual-127:4:1|--lvl:2=>: • type primitive_declaration_group_170_116
                    122:342 virtual-129:3:1|--lvl:2=>: • type*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    pushFN(data, branch_ee7180ff4f8b15ee);
                    pushFN(data, $type);
                    puid |= 8;
                    return puid;
                }
            default:
            case 1:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                /*120:340 virtual-118:1:1|--lvl:2=>•*/
                pushFN(data, branch_40a7ef9e3eb88045);
                return 37;
        }
        return -1;
        /*b0d9563b6096167bfa280625d03573f2*/
    }
    function branch_b128cfb0b2a9d7fd(l, data, state, prod, puid) {
        /*13:36 function=>modifier_list fn identifier • : type ( parameters ) { expression_statements }
        13:38 function=>modifier_list fn identifier • : type ( ) { expression_statements }
        13:39 function=>modifier_list fn identifier • : type ( parameters ) { }
        13:42 function=>modifier_list fn identifier • : type ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 58/*[:]*/) {
            consume(l, data, state);
            puid |= 8;
            /*13:36 function=>modifier_list fn identifier : • type ( parameters ) { expression_statements }
            13:38 function=>modifier_list fn identifier : • type ( ) { expression_statements }
            13:39 function=>modifier_list fn identifier : • type ( parameters ) { }
            13:42 function=>modifier_list fn identifier : • type ( ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_2b9dda3e180285a6);
            pushFN(data, $type);
            puid |= 16;
            return puid;
        }
        return -1;
        /*b128cfb0b2a9d7fd66fb699a6af59a76*/
    }
    function branch_b16cf9c30a727aea(l, data, state, prod, puid) {
        /*12:32 struct=>modifier_list str identifier • { parameters }
        12:34 struct=>modifier_list str identifier • { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 123/*[{]*/) {
            consume(l, data, state);
            puid |= 8;
            /*12:32 struct=>modifier_list str identifier { • parameters }
            12:34 struct=>modifier_list str identifier { • }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if (l.current_byte == 125/*[}]*/) {
                pushFN(data, branch_cbc044c8c9b81bf7);
                return branch_48e3d2ad1adfc4ee(l, data, state, prod, 8);
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if (assert_ascii(l, 0x0, 0x10, 0x88000000, 0x0) || l.isUniID(data)) {
                pushFN(data, branch_cbc044c8c9b81bf7);
                return branch_5e571d27ef8a89c6(l, data, state, prod, 8);
            }
        }
        return -1;
        /*b16cf9c30a727aea4ffa1d5be12919cb*/
    }
    function branch_b1efb0d4c36296fa(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*62:184 num_tok=>• def$number*/
        puid |= 1;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $def$number);
        return puid;
        return -1;
        /*b1efb0d4c36296fa7eaa2640ebdf1f2b*/
    }
    function branch_b230b428597b277e(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*115:335 virtual-329:8:1|--lvl:1=>parameters ; expression ; • loop_expression_HC_listbody6_112 ) expression*/
        puid |= 64;
        pushFN(data, branch_a0ce7c0c0be8d7d8);
        pushFN(data, $loop_expression_HC_listbody6_112);
        return puid;
        return -1;
        /*b230b428597b277e97a29e9e7aff73e6*/
    }
    function branch_b2f559c3c6504962(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*77:235 def$hex_digit=>• τd*/
        puid |= 16;
        consume(l, data, state);
        return prod;
        return -1;
        /*b2f559c3c6504962bc4de1a7e2fbaf80*/
    }
    function branch_b429028eaec66fb9(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }*/
        puid |= 256;
        pushFN(data, branch_30222513f08e2b8d);
        pushFN(data, $expression_statements);
        return puid;
        return -1;
        /*b429028eaec66fb9204812b5733ba880*/
    }
    function branch_b5938eff80f94e50(l, data, state, prod, puid) {
        /*13:37 function=>fn identifier : type • ( parameters ) { expression_statements }
        13:40 function=>fn identifier : type • ( ) { expression_statements }
        13:41 function=>fn identifier : type • ( parameters ) { }
        13:43 function=>fn identifier : type • ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 40/*[(]*/) {
            consume(l, data, state);
            puid |= 32;
            /*13:37 function=>fn identifier : type ( • parameters ) { expression_statements }
            13:41 function=>fn identifier : type ( • parameters ) { }
            13:40 function=>fn identifier : type ( • ) { expression_statements }
            13:43 function=>fn identifier : type ( • ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (l.current_byte == 41/*[)]*/) {
                /*13:40 function=>fn identifier : type ( • ) { expression_statements }
                13:43 function=>fn identifier : type ( • ) { }*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l, data, state);
                puid |= 128;
                /*13:40 function=>fn identifier : type ( ) • { expression_statements }
                13:43 function=>fn identifier : type ( ) • { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                if (l.current_byte == 123/*[{]*/) {
                    consume(l, data, state);
                    puid |= 256;
                    /*13:40 function=>fn identifier : type ( ) { • expression_statements }
                    13:43 function=>fn identifier : type ( ) { • }*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    if (l.current_byte == 125/*[}]*/) {
                        pushFN(data, branch_2d70052e1cc76d5c);
                        return branch_48867132be82452f(l, data, state, prod, 256);
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    } else if (((((((((((((((/*[if]*/cmpr_set(l, data, 143, 2, 2) ||/*[match]*/cmpr_set(l, data, 67, 5, 5)) ||/*[break]*/cmpr_set(l, data, 72, 5, 5)) ||/*[return]*/cmpr_set(l, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(l, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(l, data, 63, 4, 4)) ||/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) ||/*[==]*/cmpr_set(l, data, 7, 2, 2)) || dt_bcea2102060eab13(l, data)) ||/*[true]*/cmpr_set(l, data, 95, 4, 4)) ||/*[null]*/cmpr_set(l, data, 35, 4, 4)) || dt_6ae31dd85a62ef5c(l, data)) || assert_ascii(l, 0x0, 0x194, 0x88000000, 0x8000000)) || l.isUniID(data)) || l.isNum(data)) || l.isSym(true, data)) {
                        pushFN(data, branch_2d70052e1cc76d5c);
                        return branch_df75e1e82f931842(l, data, state, prod, 256);
                    }
                }
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if (assert_ascii(l, 0x0, 0x10, 0x88000000, 0x0) || l.isUniID(data)) {
                /*13:37 function=>fn identifier : type ( • parameters ) { expression_statements }
                13:41 function=>fn identifier : type ( • parameters ) { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                pushFN(data, branch_5a1c8176956f6fff);
                pushFN(data, $parameters);
                puid |= 64;
                return puid;
            }
        }
        return -1;
        /*b5938eff80f94e50600a8d0f2df010ea*/
    }
    function branch_b5bbf56a3254f13b(l, data, state, prod, puid) {
        add_reduce(state, data, 3, 43);
        /*-------------INDIRECT-------------------*/
        pushFN(data, branch_40a7ef9e3eb88045);
        return 21;
        /*b5bbf56a3254f13b3aa8b8d2c9499ce1*/
    }
    function branch_b5ffa44e72d80037(l, data, state, prod, puid) {
        /*43:126 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_170_116
        43:128 primitive_declaration=>modifier_list • identifier : type*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        pushFN(data, branch_f4915894d220d780);
        pushFN(data, $identifier);
        puid |= 2;
        return puid;
        return -1;
        /*b5ffa44e72d800374e4e477ef8957b1c*/
    }
    function branch_b6429eb3c6827a44(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, $expression_goto);
        return 26;
        /*b6429eb3c6827a44d544b6cad0001781*/
    }
    function branch_b644d96f3c18b08f(l, data, state, prod, puid) {
        add_reduce(state, data, 3, 43);
        /*-------------INDIRECT-------------------*/
        add_reduce(state, data, 1, 3);
        pushFN(data, $expression_statements_goto);
        return 20;
        /*b644d96f3c18b08fcda2d4a36d5c3f8f*/
    }
    function branch_b655bc0613f13001(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 32;
        if ((l.current_byte == 93/*[]]*/) && consume(l, data, state)) {
            add_reduce(state, data, 4, 66);
            /*-------------INDIRECT-------------------*/
            pushFN(data, $expression_statements_goto);
            return 37;
        }
        return -1;
        /*b655bc0613f130010fbb1ab4f4b3582a*/
    }
    function branch_b753086db13038aa(l, data, state, prod, puid) {
        add_reduce(state, data, 3, 43);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $expression_statements_group_023_108_goto);
        return 18;
        /*b753086db13038aa5e480d6a79b7c18b*/
    }
    function branch_b78196333db742fd(l, data, state, prod, puid) {
        add_reduce(state, data, 2, 37);
        return prod;
        /*b78196333db742fd38f7a4e33da094ca*/
    }
    function branch_b7a3d3bea5c9ee8d(l, data, state, prod, puid) {
        add_reduce(state, data, 8, 54);
        return prod;
        /*b7a3d3bea5c9ee8dc8d2c9ae48600859*/
    }
    function branch_b87893d74c1116af(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*58:175 string_HC_listbody1_126=>string_HC_listbody1_126 • string_group_0112_125*/
        puid |= 2;
        pushFN(data, branch_c16dcb383e53221e);
        pushFN(data, $string_group_0112_125);
        return puid;
        return -1;
        /*b87893d74c1116aff0d48b2f3fa4df84*/
    }
    function branch_b8f5b623ecd5d4eb(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*37:117 member_expression=>• template*/
        puid |= 64;
        pushFN(data, branch_2e5f0d29e134b2c8);
        pushFN(data, $template);
        return puid;
        return -1;
        /*b8f5b623ecd5d4eb9f383fcd7a71c41e*/
    }
    function branch_b9f8e5d82f7d9108(l, data, state, prod, puid) {
        return 52;
        /*b9f8e5d82f7d9108743dcfc464a19dfe*/
    }
    function branch_ba114ad1e502bbb5(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        /*11:30 class=>modifier_list cls identifier • { }*/
        puid |= 16;
        consume(l, data, state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 64;
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 5, 14);
            return prod;
        }
        return -1;
        /*ba114ad1e502bbb5358b7cdec29722e3*/
    }
    function branch_ba4816ae8d31501f(l, data, state, prod, puid) {
        /*114:334 virtual-92:3:1|--lvl:1=>• expression )
        115:335 virtual-329:8:1|--lvl:1=>• parameters ; expression ; loop_expression_HC_listbody6_112 ) expression
        116:336 virtual-330:7:1|--lvl:1=>• parameters ; ; loop_expression_HC_listbody6_112 ) expression
        117:337 virtual-331:7:1|--lvl:1=>• parameters ; expression ; ) expression
        118:338 virtual-332:6:1|--lvl:1=>• parameters ; ; ) expression
        119:339 virtual-333:6:1|--lvl:1=>• primitive_declaration in expression ) expression*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if (assert_ascii(l, 0x0, 0x10, 0x88000000, 0x0) || l.isUniID(data)) {
            /*44:130 identifier=>• tk:identifier_token
            50:144 modifier_list=>• [ modifier_list_HC_listbody1_120 ]*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if (l.current_byte == 91/*[[]*/) {
                pushFN(data, branch_72886a4693855303);
                return branch_5b948ba3b39c4e7d(l, data, state, prod, 1);
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if (((l.current_byte == 95/*[_]*/) || (l.current_byte == 36/*[$]*/)) || l.isUniID(data)) {
                pushFN(data, branch_9e58a71bfd7b2495);
                return branch_acdb9cfb265391cc(l, data, state, prod, 1);
            }
        }
        return -1;
        /*ba4816ae8d31501f75d062902bf48d1f*/
    }
    function branch_baddcf71a394dd32(l, data, state, prod, puid) {
        /*14:44 function_expression=>modifier_list fn : type ( parameters • ) { expression_statements }
        14:47 function_expression=>modifier_list fn : type ( parameters • ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 41/*[)]*/) {
            consume(l, data, state);
            puid |= 64;
            /*14:44 function_expression=>modifier_list fn : type ( parameters ) • { expression_statements }
            14:47 function_expression=>modifier_list fn : type ( parameters ) • { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if (l.current_byte == 123/*[{]*/) {
                consume(l, data, state);
                puid |= 128;
                /*14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }
                14:47 function_expression=>modifier_list fn : type ( parameters ) { • }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if (l.current_byte == 125/*[}]*/) {
                    pushFN(data, branch_74c8218421c7bef8);
                    return branch_ef1e47c03eb4046e(l, data, state, prod, 128);
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if (((((((((((((((/*[if]*/cmpr_set(l, data, 143, 2, 2) ||/*[match]*/cmpr_set(l, data, 67, 5, 5)) ||/*[break]*/cmpr_set(l, data, 72, 5, 5)) ||/*[return]*/cmpr_set(l, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(l, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(l, data, 63, 4, 4)) ||/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) ||/*[==]*/cmpr_set(l, data, 7, 2, 2)) || dt_bcea2102060eab13(l, data)) ||/*[true]*/cmpr_set(l, data, 95, 4, 4)) ||/*[null]*/cmpr_set(l, data, 35, 4, 4)) || dt_6ae31dd85a62ef5c(l, data)) || assert_ascii(l, 0x0, 0x194, 0x88000000, 0x8000000)) || l.isUniID(data)) || l.isNum(data)) || l.isSym(true, data)) {
                    pushFN(data, branch_74c8218421c7bef8);
                    return branch_d7697e76ac6bb46e(l, data, state, prod, 128);
                }
            }
        }
        return -1;
        /*baddcf71a394dd32b5eddf103b0495f0*/
    }
    function branch_baf429511ae90366(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 64;
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 7, 8);
            return prod;
        }
        return -1;
        /*baf429511ae90366a2b1ec6615dee854*/
    }
    function branch_bb4a0fd4c800480d(l, data, state, prod, puid) {
        add_reduce(state, data, 3, 65);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $expression_goto);
        return 37;
        /*bb4a0fd4c800480d31dcad2e11400547*/
    }
    function branch_bb738692e2bb354d(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 2;
        if ((l.current_byte == 61/*[=]*/) && consume(l, data, state)) {
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            puid |= 4;
            pushFN(data, branch_972ff6b6783b90ac);
            pushFN(data, $expression);
            return puid;
        }
        return -1;
        /*bb738692e2bb354d0635f1de34bc48d4*/
    }
    function branch_bbaaf5e2ac261f99(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $module_goto);
        return 3;
        /*bbaaf5e2ac261f999f1a18fd29356b5a*/
    }
    function branch_bc26cf20258b3f8d(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        /*65:194 operator=>• θsym identifier_token_group_080_119*/
        puid |= 1;
        consume(l, data, state);
        skip_db1786a8af54d666(l/*[ 71 ]*/, data, state);
        puid |= 4;
        pushFN(data, branch_58bb5d092a2b7f3f);
        pushFN(data, $identifier_token_group_080_119);
        return puid;
        return -1;
        /*bc26cf20258b3f8d81e2bb0d19bd5f96*/
    }
    function branch_bd41394530f64266(l, data, state, prod, puid) {
        pushFN(data, $expression_statements_group_023_108_goto);
        return 18;
        /*bd41394530f6426639e277142ef64a8d*/
    }
    function branch_bd7adc45205f8521(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*7:17 namespace=>ns identifier { • }*/
        puid |= 16;
        consume(l, data, state);
        add_reduce(state, data, 4, 7);
        return prod;
        return -1;
        /*bd7adc45205f85218357ef4f9f8baf58*/
    }
    function branch_bddcedc35aea4210(l, data, state, prod, puid) {
        add_reduce(state, data, 7, 57);
        return prod;
        /*bddcedc35aea4210af83dbe68bed8dc3*/
    }
    function branch_be0eb48b27d687bc(l, data, state, prod, puid) {
        return 82;
        /*be0eb48b27d687bc1407309f6e524f70*/
    }
    function branch_be1c1cbae6d00146(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 16;
        pushFN(data, branch_382842d2b736c8bb);
        pushFN(data, $type_group_098_124);
        return puid;
        return -1;
        /*be1c1cbae6d001466598c97a4abba53a*/
    }
    function branch_bef9724b0881b69e(l, data, state, prod, puid) {
        add_reduce(state, data, 7, 52);
        /*bef9724b0881b69ed6fe8ab237ec8c60*/
    }
    function branch_bf312da1e8e7a614(l, data, state, prod, puid) {
        return 26;
        /*bf312da1e8e7a61405660afe1d95f62f*/
    }
    function branch_bf4d628fd683f267(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 4;
        if ((l.current_byte == 39/*[']*/) && consume(l, data, state)) {
            add_reduce(state, data, 3, 89);
            return prod;
        }
        return -1;
        /*bf4d628fd683f2677764d8842554d945*/
    }
    function branch_bf60c80149b74072(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, $expression_statements_HC_listbody1_107_goto);
        return 17;
        /*bf60c80149b7407217fba9f602366bd6*/
    }
    function branch_bf8b5367261e330a(l, data, state, prod, puid) {
        /*11:24 class=>modifier_list cls identifier • class_group_113_103 { class_HC_listbody1_105 }
        11:27 class=>modifier_list cls identifier • class_group_113_103 { }
        11:26 class=>modifier_list cls identifier • { class_HC_listbody1_105 }
        11:30 class=>modifier_list cls identifier • { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if (l.current_byte == 123/*[{]*/) {
            /*11:26 class=>modifier_list cls identifier • { class_HC_listbody1_105 }
            11:30 class=>modifier_list cls identifier • { }*/
            var pk = l.copy();
            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, 0);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (pk.current_byte == 125/*[}]*/) {
                pushFN(data, branch_7dcd4e56969f4413);
                return branch_ba114ad1e502bbb5(l, data, state, prod, 4);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            } else if (((/*[str]*/cmpr_set(pk, data, 47, 3, 3) ||/*[fn]*/cmpr_set(pk, data, 144, 2, 2)) || assert_ascii(pk, 0x0, 0x10, 0x88000000, 0x0)) || pk.isUniID(data)) {
                pushFN(data, branch_7dcd4e56969f4413);
                return branch_8c6606bd8966675f(l, data, state, prod, 4);
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (/*[is]*/cmpr_set(l, data, 141, 2, 2)) {
            /*11:24 class=>modifier_list cls identifier • class_group_113_103 { class_HC_listbody1_105 }
            11:27 class=>modifier_list cls identifier • class_group_113_103 { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_573b9c6e3d1449ba);
            pushFN(data, $class_group_113_103);
            puid |= 8;
            return puid;
        }
        return -1;
        /*bf8b5367261e330ad9a5c6b0e8514296*/
    }
    function branch_bf8e71a01f2eba15(l, data, state, prod, puid) {
        return 29;
        /*bf8e71a01f2eba156e77e0fc11bb971f*/
    }
    function branch_bfb17e535f287a90(l, data, state, prod, puid) {
        return 94;
        /*bfb17e535f287a903a5093e34dfe201a*/
    }
    function branch_c065289f9bc15f46(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $def$string_token_goto);
        return 99;
        /*c065289f9bc15f4631010d12b3fff3b5*/
    }
    function branch_c0e3727d9ff912b9(l, data, state, prod, puid) {
        pushFN(data, $expression_statements_goto);
        return 50;
        /*c0e3727d9ff912b905b2aed2c2721065*/
    }
    function branch_c16dcb383e53221e(l, data, state, prod, puid) {
        add_reduce(state, data, 2, 87);
        return prod;
        /*c16dcb383e53221e099ead71aed86d29*/
    }
    function branch_c17969f5ec90c498(l, data, state, prod, puid) {
        return 77;
        /*c17969f5ec90c498f9afe2141fffce6c*/
    }
    function branch_c19991e72069e891(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 32;
        if ((l.current_byte == 93/*[]]*/) && consume(l, data, state)) {
            add_reduce(state, data, 4, 66);
            /*-------------INDIRECT-------------------*/
            pushFN(data, branch_40a7ef9e3eb88045);
            return 37;
        }
        return -1;
        /*c19991e72069e891ee9bc1dd535cf142*/
    }
    function branch_c1d1bde8a1ade4c6(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $def$hex_token_HC_listbody1_105_goto);
        return 88;
        /*c1d1bde8a1ade4c6c059841de06484c1*/
    }
    function branch_c234a226ef934bf3(l, data, state, prod, puid) {
        /*43:127 primitive_declaration=>identifier : type • primitive_declaration_group_170_116
        43:129 primitive_declaration=>identifier : type •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 61/*[=]*/) {
            pushFN(data, branch_0372dbd01ff9f446);
            return branch_9560ededec206e5d(l, data, state, prod, 8);
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*43:129 primitive_declaration=>identifier : type •*/
            add_reduce(state, data, 3, 77);
            return 43;
        }
        return -1;
        /*c234a226ef934bf37e091ec1b97184d4*/
    }
    function branch_c244af9399a4b393(l, data, state, prod, puid) {
        /*31:97 loop_expression=>loop ( parameters ; expression • ; loop_expression_HC_listbody6_112 ) expression
        31:101 loop_expression=>loop ( parameters ; expression • ; ) expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 59/*[;]*/) {
            consume(l, data, state);
            puid |= 32;
            /*31:97 loop_expression=>loop ( parameters ; expression ; • loop_expression_HC_listbody6_112 ) expression
            31:101 loop_expression=>loop ( parameters ; expression ; • ) expression*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if (l.current_byte == 41/*[)]*/) {
                pushFN(data, branch_3205c0ded576131e);
                return branch_03774a7bfcb7410e(l, data, state, prod, 32);
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if (((((((((((((((/*[if]*/cmpr_set(l, data, 143, 2, 2) ||/*[match]*/cmpr_set(l, data, 67, 5, 5)) ||/*[break]*/cmpr_set(l, data, 72, 5, 5)) ||/*[return]*/cmpr_set(l, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(l, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(l, data, 63, 4, 4)) ||/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) ||/*[==]*/cmpr_set(l, data, 7, 2, 2)) || dt_bcea2102060eab13(l, data)) ||/*[true]*/cmpr_set(l, data, 95, 4, 4)) ||/*[null]*/cmpr_set(l, data, 35, 4, 4)) || dt_6ae31dd85a62ef5c(l, data)) || assert_ascii(l, 0x0, 0x194, 0x88000000, 0x8000000)) || l.isUniID(data)) || l.isNum(data)) || l.isSym(true, data)) {
                pushFN(data, branch_3205c0ded576131e);
                return branch_60a520e52790b7b2(l, data, state, prod, 32);
            }
        }
        return -1;
        /*c244af9399a4b39301d7904dc60e967d*/
    }
    function branch_c24bced632756001(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*11:25 class=>cls identifier class_group_113_103 { • class_HC_listbody1_105 }*/
        puid |= 32;
        pushFN(data, branch_8195fc9287d375a4);
        pushFN(data, $class_HC_listbody1_105);
        return puid;
        return -1;
        /*c24bced6327560014b25cc306103ee97*/
    }
    function branch_c340f7fdd0562810(l, data, state, prod, puid) {
        /*43:127 primitive_declaration=>identifier : type • primitive_declaration_group_170_116
        43:129 primitive_declaration=>identifier : type •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 61/*[=]*/) {
            pushFN(data, branch_104d5a190a45ad94);
            return branch_9560ededec206e5d(l, data, state, prod, 8);
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*43:129 primitive_declaration=>identifier : type •*/
            add_reduce(state, data, 3, 77);
            /*-------------INDIRECT-------------------*/
            return 18;
        }
        return -1;
        /*c340f7fdd056281007cb57fed9a3c446*/
    }
    function branch_c354136a0f6bca6b(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, $def$string_token_goto);
        return 99;
        /*c354136a0f6bca6bb5656c76ed267f4c*/
    }
    function branch_c39b0850baca60a1(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*116:336 virtual-330:7:1|--lvl:1=>parameters ; ; • loop_expression_HC_listbody6_112 ) expression*/
        puid |= 64;
        pushFN(data, branch_a0ce7c0c0be8d7d8);
        pushFN(data, $loop_expression_HC_listbody6_112);
        return puid;
        return -1;
        /*c39b0850baca60a1af3fcdf3654f22c9*/
    }
    function branch_c3b494f09f364853(l, data, state, prod, puid) {
        return 14;
        /*c3b494f09f36485336df3d705d5e35e4*/
    }
    function branch_c3b51dbb10659234(l, data, state, prod, puid) {
        /*14:45 function_expression=>fn : type ( parameters • ) { expression_statements }
        14:49 function_expression=>fn : type ( parameters • ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 41/*[)]*/) {
            consume(l, data, state);
            puid |= 64;
            /*14:45 function_expression=>fn : type ( parameters ) • { expression_statements }
            14:49 function_expression=>fn : type ( parameters ) • { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if (l.current_byte == 123/*[{]*/) {
                consume(l, data, state);
                puid |= 128;
                /*14:45 function_expression=>fn : type ( parameters ) { • expression_statements }
                14:49 function_expression=>fn : type ( parameters ) { • }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if (l.current_byte == 125/*[}]*/) {
                    pushFN(data, branch_c3b494f09f364853);
                    return branch_a793674caf298021(l, data, state, prod, 128);
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if (((((((((((((((/*[if]*/cmpr_set(l, data, 143, 2, 2) ||/*[match]*/cmpr_set(l, data, 67, 5, 5)) ||/*[break]*/cmpr_set(l, data, 72, 5, 5)) ||/*[return]*/cmpr_set(l, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(l, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(l, data, 63, 4, 4)) ||/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) ||/*[==]*/cmpr_set(l, data, 7, 2, 2)) || dt_bcea2102060eab13(l, data)) ||/*[true]*/cmpr_set(l, data, 95, 4, 4)) ||/*[null]*/cmpr_set(l, data, 35, 4, 4)) || dt_6ae31dd85a62ef5c(l, data)) || assert_ascii(l, 0x0, 0x194, 0x88000000, 0x8000000)) || l.isUniID(data)) || l.isNum(data)) || l.isSym(true, data)) {
                    pushFN(data, branch_c3b494f09f364853);
                    return branch_97dd74ec15c2488b(l, data, state, prod, 128);
                }
            }
        }
        return -1;
        /*c3b51dbb10659234afccf8f1e84dabdb*/
    }
    function branch_c3f61dfaabade9a9(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*54:158 type_group_098_124=>• 128*/
        puid |= 4;
        consume(l, data, state);
        return prod;
        return -1;
        /*c3f61dfaabade9a9c57e841a36a2fe16*/
    }
    function branch_c462cd268e3d3174(l, data, state, prod, puid) {
        /*110:330 virtual-193:3:1|--lvl:0=>• operator_HC_listbody1_129 identifier_token_group_080_119
        111:331 virtual-197:2:1|--lvl:0=>• operator_HC_listbody1_129*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.isSym(true, data)) {
            /*110:330 virtual-193:3:1|--lvl:0=>• operator_HC_listbody1_129 identifier_token_group_080_119
            111:331 virtual-197:2:1|--lvl:0=>• operator_HC_listbody1_129*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_c6ffcb05105a681c);
            pushFN(data, $operator_HC_listbody1_129);
            puid |= 16;
            return puid;
        }
        return -1;
        /*c462cd268e3d317442d79e2321b5bfa4*/
    }
    function branch_c49c86b59c9e60b3(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*94:280 def$octal_token_group_058_109=>• 0*/
        puid |= 1;
        consume(l, data, state);
        return prod;
        return -1;
        /*c49c86b59c9e60b385839294197a62a1*/
    }
    function branch_c4e96e31cd7635e8(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*87:262 def$hex_token_group_044_104=>• e*/
        puid |= 32;
        consume(l, data, state);
        return prod;
        return -1;
        /*c4e96e31cd7635e80f95ad2be8ee2d13*/
    }
    function branch_c54894ab95e5de2b(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 1024;
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 3, 40);
            return prod;
        }
        return -1;
        /*c54894ab95e5de2b34ac4bdd18418f3c*/
    }
    function branch_c595dca81d549584(l, data, state, prod, puid) {
        add_reduce(state, data, 2, 2);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $module_HC_listbody1_101_goto);
        return 2;
        /*c595dca81d5495849012ff3620ac747b*/
    }
    function branch_c5bfbfbcef9d932d(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*26:84 unary_expression=>• unary_value*/
        puid |= 2;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $unary_value);
        return puid;
        return -1;
        /*c5bfbfbcef9d932d1811ac8b418f9955*/
    }
    function branch_c68c0a8454fbe44c(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*4:6 statements=>• import*/
        puid |= 1;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $import);
        return puid;
        return -1;
        /*c68c0a8454fbe44c22154b215dd103b9*/
    }
    function branch_c6ffcb05105a681c(l, data, state, prod, puid) {
        /*110:330 virtual-193:3:1|--lvl:0=>operator_HC_listbody1_129 • identifier_token_group_080_119
        111:331 virtual-197:2:1|--lvl:0=>operator_HC_listbody1_129 •*/
        skip_db1786a8af54d666(l/*[ 71 ]*/, data, state);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/) {
            pushFN(data, branch_e2bf1a2fbc8c4ac7);
            return branch_960245c9aee1dcc7(l, data, state, prod, 16);
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*111:331 virtual-197:2:1|--lvl:0=>operator_HC_listbody1_129 •*/
            add_reduce(state, data, 2, 91);
            return 65;
        }
        return -1;
        /*c6ffcb05105a681cf869d88653f0bf3b*/
    }
    function branch_c7782fe38088e5d9(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $def$octal_token_HC_listbody1_110_goto);
        return 95;
        /*c7782fe38088e5d9a3974c09963645ae*/
    }
    function branch_c7b759beb1f3603a(l, data, state, prod, puid) {
        add_reduce(state, data, 3, 65);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $unary_value_goto);
        return 37;
        /*c7b759beb1f3603a92f670ed2f3ac5ad*/
    }
    function branch_c7d6c0b0a737d7c8(l, data, state, prod, puid) {
        add_reduce(state, data, 2, 2);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $def$string_token_HC_listbody3_111_goto);
        return 98;
        /*c7d6c0b0a737d7c8134ad20b69a1507f*/
    }
    function branch_c8952b549cb04b31(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*14:50 function_expression=>modifier_list fn : type ( ) { • }*/
        puid |= 512;
        consume(l, data, state);
        add_reduce(state, data, 8, 34);
        return prod;
        return -1;
        /*c8952b549cb04b314501d772383cf0ca*/
    }
    function branch_c89781d34428030d(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*107:321 def$identifier_symbols=>def$identifier_symbols • _*/
        puid |= 4;
        consume(l, data, state);
        add_reduce(state, data, 2, 87);
        return prod;
        return -1;
        /*c89781d34428030d4167932d25520202*/
    }
    function branch_c904e9774080f86f(l, data, state, prod, puid) {
        /*14:44 function_expression=>modifier_list fn : type • ( parameters ) { expression_statements }
        14:46 function_expression=>modifier_list fn : type • ( ) { expression_statements }
        14:47 function_expression=>modifier_list fn : type • ( parameters ) { }
        14:50 function_expression=>modifier_list fn : type • ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 40/*[(]*/) {
            consume(l, data, state);
            puid |= 16;
            /*14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
            14:47 function_expression=>modifier_list fn : type ( • parameters ) { }
            14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
            14:50 function_expression=>modifier_list fn : type ( • ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (l.current_byte == 41/*[)]*/) {
                /*14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
                14:50 function_expression=>modifier_list fn : type ( • ) { }*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l, data, state);
                puid |= 64;
                /*14:46 function_expression=>modifier_list fn : type ( ) • { expression_statements }
                14:50 function_expression=>modifier_list fn : type ( ) • { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                if (l.current_byte == 123/*[{]*/) {
                    consume(l, data, state);
                    puid |= 128;
                    /*14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }
                    14:50 function_expression=>modifier_list fn : type ( ) { • }*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    if (l.current_byte == 125/*[}]*/) {
                        pushFN(data, branch_c3b494f09f364853);
                        return branch_c8952b549cb04b31(l, data, state, prod, 128);
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    } else if (((((((((((((((/*[if]*/cmpr_set(l, data, 143, 2, 2) ||/*[match]*/cmpr_set(l, data, 67, 5, 5)) ||/*[break]*/cmpr_set(l, data, 72, 5, 5)) ||/*[return]*/cmpr_set(l, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(l, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(l, data, 63, 4, 4)) ||/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) ||/*[==]*/cmpr_set(l, data, 7, 2, 2)) || dt_bcea2102060eab13(l, data)) ||/*[true]*/cmpr_set(l, data, 95, 4, 4)) ||/*[null]*/cmpr_set(l, data, 35, 4, 4)) || dt_6ae31dd85a62ef5c(l, data)) || assert_ascii(l, 0x0, 0x194, 0x88000000, 0x8000000)) || l.isUniID(data)) || l.isNum(data)) || l.isSym(true, data)) {
                        pushFN(data, branch_c3b494f09f364853);
                        return branch_b429028eaec66fb9(l, data, state, prod, 128);
                    }
                }
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if (assert_ascii(l, 0x0, 0x10, 0x88000000, 0x0) || l.isUniID(data)) {
                /*14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
                14:47 function_expression=>modifier_list fn : type ( • parameters ) { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                pushFN(data, branch_87c0759301f4690e);
                pushFN(data, $parameters);
                puid |= 32;
                return puid;
            }
        }
        return -1;
        /*c904e9774080f86f7d05809ae8e33d0b*/
    }
    function branch_c9c9b8c9d97648c5(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 1024;
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 10, 22);
            return prod;
        }
        return -1;
        /*c9c9b8c9d97648c5f5cf92db861a46ba*/
    }
    function branch_c9ed7295adaf6608(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*13:39 function=>modifier_list fn identifier : type ( parameters ) { • }*/
        puid |= 1024;
        consume(l, data, state);
        add_reduce(state, data, 10, 23);
        return prod;
        return -1;
        /*c9ed7295adaf660811de90637e33b256*/
    }
    function branch_ca1bc5869cc8cf57(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*105:317 def$js_id_symbols=>• $*/
        puid |= 8;
        consume(l, data, state);
        return prod;
        return -1;
        /*ca1bc5869cc8cf5735472daf007dc6a6*/
    }
    function branch_ca3751a67903a802(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*37:118 member_expression=>• identifier*/
        puid |= 4;
        pushFN(data, branch_24f0ac92b86c2129);
        pushFN(data, $identifier);
        return puid;
        return -1;
        /*ca3751a67903a8021bb1a33548e0abe9*/
    }
    function branch_cabfca63de10cd14(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $parameters_HC_listbody10_106_goto);
        return 15;
        /*cabfca63de10cd142417053dfa4a00f1*/
    }
    function branch_cad3222afff33c8d(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $call_expression_HC_listbody2_114_goto);
        return 35;
        /*cad3222afff33c8da03c45714c17f596*/
    }
    function branch_cad99286d05112aa(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*31:100 loop_expression=>loop ( parameters ; ; • loop_expression_HC_listbody6_112 ) expression*/
        puid |= 64;
        pushFN(data, branch_cdd636a46482e856);
        pushFN(data, $loop_expression_HC_listbody6_112);
        return puid;
        return -1;
        /*cad99286d05112aa61d3257a057e283a*/
    }
    function branch_cbc044c8c9b81bf7(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, $class_group_016_104_goto);
        return 9;
        /*cbc044c8c9b81bf7be723a9cb9fc2e11*/
    }
    function branch_cbd95ed6c98c2884(l, data, state, prod, puid) {
        return 71;
        /*cbd95ed6c98c28845606ab4be3ed231e*/
    }
    function branch_cbf1e60b49bba616(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, $comment_HC_listbody1_132_goto);
        return 69;
        /*cbf1e60b49bba616dc5193b806c2168a*/
    }
    function branch_cc3439f4db3f3190(l, data, state, prod, puid) {
        return 76;
        /*cc3439f4db3f3190bf2ef7bd336cf9b7*/
    }
    function branch_cc4b612b6b7ec408(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, $def$defaultproductions_goto);
        return 75;
        /*cc4b612b6b7ec408d6ec9ecfb574ea25*/
    }
    function branch_cc9e8eab54dacbec(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $namespace_HC_listbody3_102_goto);
        return 6;
        /*cc9e8eab54dacbec6317f4e9e1dffb6f*/
    }
    function branch_ccde39d462a0ec4d(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 1;
        if ((l.current_byte == 34/*["]*/) && consume(l, data, state)) {
            add_reduce(state, data, 3, 37);
            return prod;
        }
        return -1;
        /*ccde39d462a0ec4d36a3c0584da7900b*/
    }
    function branch_cd09c06cb6b8840e(l, data, state, prod, puid) {
        /*43:126 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_170_116
        43:128 primitive_declaration=>modifier_list identifier : type •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 61/*[=]*/) {
            pushFN(data, branch_28ed74bf96b1a974);
            return branch_8648628ea28d7554(l, data, state, prod, 8);
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*43:128 primitive_declaration=>modifier_list identifier : type •*/
            add_reduce(state, data, 4, 76);
            /*-------------INDIRECT-------------------*/
            add_reduce(state, data, 1, 3);
            pushFN(data, $expression_statements_goto);
            return 20;
        }
        return -1;
        /*cd09c06cb6b8840e786b2eaddf57e1ec*/
    }
    function branch_cd112f466afb1119(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 32;
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 6, 16);
            return prod;
        }
        return -1;
        /*cd112f466afb11191693e17ab9fb63e9*/
    }
    function branch_cd61bf1e7d5fea3e(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*29:92 loop_expression_group_254_111=>( • expression )*/
        puid |= 2;
        pushFN(data, branch_0d730d4ec7819a95);
        pushFN(data, $expression);
        return puid;
        return -1;
        /*cd61bf1e7d5fea3e008e7e401f6283ac*/
    }
    function branch_cdd636a46482e856(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 128;
        if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            puid |= 4;
            pushFN(data, branch_b7a3d3bea5c9ee8d);
            pushFN(data, $expression);
            return puid;
        }
        return -1;
        /*cdd636a46482e856ed45bfd8e2570c5e*/
    }
    function branch_ce83789161f829c7(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*31:105 loop_expression=>loop ( ; ; • ) expression*/
        puid |= 128;
        consume(l, data, state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 4;
        pushFN(data, branch_d5340835ac1c3384);
        pushFN(data, $expression);
        return puid;
        return -1;
        /*ce83789161f829c7f10b34d839a021dd*/
    }
    function branch_cf353658237874c1(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*87:263 def$hex_token_group_044_104=>• f*/
        puid |= 64;
        consume(l, data, state);
        return prod;
        return -1;
        /*cf353658237874c1ee49c897b514c85e*/
    }
    function branch_cf55708a1ea8e41d(l, data, state, prod, puid) {
        /*43:127 primitive_declaration=>identifier : type • primitive_declaration_group_170_116
        43:129 primitive_declaration=>identifier : type •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 61/*[=]*/) {
            pushFN(data, branch_3205c0ded576131e);
            return branch_9560ededec206e5d(l, data, state, prod, 8);
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*43:129 primitive_declaration=>identifier : type •*/
            add_reduce(state, data, 3, 77);
        }
        return -1;
        /*cf55708a1ea8e41d77eac12fb537aed5*/
    }
    function branch_cfb0dc5e733691d0(l, data, state, prod, puid) {
        add_reduce(state, data, 4, 75);
        pushFN(data, $expression_statements_group_023_108_goto);
        return 18;
        /*cfb0dc5e733691d07a1f62eb8961e556*/
    }
    function branch_cfb3fe9c738c88e2(l, data, state, prod, puid) {
        add_reduce(state, data, 2, 2);
        return prod;
        /*cfb3fe9c738c88e299f792ef38b99672*/
    }
    function branch_cfbe1d2c5b310407(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 8;
        if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
            add_reduce(state, data, 4, 63);
            return prod;
        }
        return -1;
        /*cfbe1d2c5b310407a2f990f2552ac3f4*/
    }
    function branch_cfc012902f66b777(l, data, state, prod, puid) {
        /*108:328 virtual-192:3:1|--lvl:0=>operator_HC_listbody1_128 • identifier_token_group_080_119
        109:329 virtual-195:2:1|--lvl:0=>operator_HC_listbody1_128 •*/
        skip_db1786a8af54d666(l/*[ 71 ]*/, data, state);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/) {
            pushFN(data, branch_e2bf1a2fbc8c4ac7);
            return branch_4e1b33a7601b1313(l, data, state, prod, 2);
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*109:329 virtual-195:2:1|--lvl:0=>operator_HC_listbody1_128 •*/
            add_reduce(state, data, 2, 91);
            return 65;
        }
        return -1;
        /*cfc012902f66b77702624fa2087cc04b*/
    }
    function branch_d0f01970c18665af(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*46:134 identifier_token_HC_listbody1_118=>identifier_token_HC_listbody1_118 • identifier_token_group_075_117*/
        puid |= 2;
        pushFN(data, branch_cfb3fe9c738c88e2);
        pushFN(data, $identifier_token_group_075_117);
        return puid;
        return -1;
        /*d0f01970c18665af08db10b08d7f2bb5*/
    }
    function branch_d1cfa7d2150e033a(l, data, state, prod, puid) {
        pushFN(data, $unary_value_goto);
        return 37;
        /*d1cfa7d2150e033a37407c86f24f818a*/
    }
    function branch_d2071249e28cf8aa(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*107:325 def$identifier_symbols=>• _*/
        puid |= 4;
        consume(l, data, state);
        return prod;
        return -1;
        /*d2071249e28cf8aa4501c0c40bcd0f2c*/
    }
    function branch_d239b9dc91064a7d(l, data, state, prod, puid) {
        return 7;
        /*d239b9dc91064a7db8927a46bc6965d0*/
    }
    function branch_d27adec3f521a53f(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 32;
        if ((l.current_byte == 93/*[]]*/) && consume(l, data, state)) {
            add_reduce(state, data, 4, 66);
            return prod;
        }
        return -1;
        /*d27adec3f521a53fd6dc34d1c8c737b0*/
    }
    function branch_d2bd478d3a4a66be(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, $expression_statements_goto);
        return 20;
        /*d2bd478d3a4a66be38097051785fc558*/
    }
    function branch_d3d9a23f32e5e8ad(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 128;
        if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            puid |= 4;
            pushFN(data, branch_3205c0ded576131e);
            pushFN(data, $expression);
            return puid;
        }
        return -1;
        /*d3d9a23f32e5e8adaa1666ab4c4c4255*/
    }
    function branch_d44c796848a6a534(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*94:285 def$octal_token_group_058_109=>• 5*/
        puid |= 32;
        consume(l, data, state);
        return prod;
        return -1;
        /*d44c796848a6a534aec186ce72b32007*/
    }
    function branch_d4cc569f0db333a9(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*37:115 member_expression=>member_expression • . identifier*/
        puid |= 2;
        consume(l, data, state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 4;
        pushFN(data, branch_19614154b7eb775b);
        pushFN(data, $identifier);
        return puid;
        return -1;
        /*d4cc569f0db333a92141212781829e67*/
    }
    function branch_d5340835ac1c3384(l, data, state, prod, puid) {
        add_reduce(state, data, 6, 59);
        return prod;
        /*d5340835ac1c33844542a76cef885982*/
    }
    function branch_d55f14568bc39cad(l, data, state, prod, puid) {
        /*48:138 identifier_token=>identifier_token_group_075_117 identifier_token_HC_listbody1_118 • identifier_token_group_080_119
        48:140 identifier_token=>identifier_token_group_075_117 identifier_token_HC_listbody1_118 •*/
        skip_db1786a8af54d666(l/*[ 71 ]*/, data, state);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/) {
            pushFN(data, branch_73df4fa2a9e9bee1);
            return branch_367228fef7264279(l, data, state, prod, 2);
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*48:140 identifier_token=>identifier_token_group_075_117 identifier_token_HC_listbody1_118 •*/
            add_reduce(state, data, 2, 0);
            return 48;
        }
        return -1;
        /*d55f14568bc39cad5d44012daa571932*/
    }
    function branch_d596098ff435f05e(l, data, state, prod, puid) {
        add_reduce(state, data, 3, 91);
        return prod;
        /*d596098ff435f05eb458f0f2fdba2b77*/
    }
    function branch_d666284a25b50b6e(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*87:265 def$hex_token_group_044_104=>• B*/
        puid |= 256;
        consume(l, data, state);
        return prod;
        return -1;
        /*d666284a25b50b6e740b013570f3d5e7*/
    }
    function branch_d6adce891265bf33(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $identifier_token_HC_listbody1_118_goto);
        return 46;
        /*d6adce891265bf3355c131f97fff2a99*/
    }
    function branch_d6c675e44628aeae(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*31:99 loop_expression=>loop ( ; expression ; • loop_expression_HC_listbody6_112 ) expression*/
        puid |= 64;
        pushFN(data, branch_82f51a7392dec211);
        pushFN(data, $loop_expression_HC_listbody6_112);
        return puid;
        return -1;
        /*d6c675e44628aeae32072c1e25fb42b5*/
    }
    function branch_d7697e76ac6bb46e(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }*/
        puid |= 256;
        pushFN(data, branch_89e29c5798d3072a);
        pushFN(data, $expression_statements);
        return puid;
        return -1;
        /*d7697e76ac6bb46e0ac4f146acf3167f*/
    }
    function branch_d7bf2b5a6d0bef79(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*4:11 statements=>• namespace*/
        puid |= 64;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $namespace);
        return puid;
        return -1;
        /*d7bf2b5a6d0bef79d7093745ebdfba19*/
    }
    function branch_d7ca8a131ce07eaf(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*10:22 class_HC_listbody1_105=>class_HC_listbody1_105 • class_group_016_104*/
        puid |= 2;
        pushFN(data, branch_cfb3fe9c738c88e2);
        pushFN(data, $class_group_016_104);
        return puid;
        return -1;
        /*d7ca8a131ce07eaf9cdb31eeb0cb4c0b*/
    }
    function branch_d7ce8b3393a64a3b(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 128;
        if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            puid |= 4;
            pushFN(data, branch_bef9724b0881b69e);
            pushFN(data, $expression);
            return puid;
        }
        return -1;
        /*d7ce8b3393a64a3ba98720da53685cc5*/
    }
    function branch_d896d30b01780566(l, data, state, prod, puid) {
        return 60;
        /*d896d30b017805665ee927a8bba0f6b5*/
    }
    function branch_d907a8fec93bbb96(l, data, state, prod, puid) {
        add_reduce(state, data, 8, 53);
        return prod;
        /*d907a8fec93bbb96d148dd2caf0e58a2*/
    }
    function branch_da4737880b1bd090(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $def$binary_token_HC_listbody1_107_goto);
        return 91;
        /*da4737880b1bd090a143da7229a7c174*/
    }
    function branch_dc03b569a85a4acb(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*93:279 def$octal_token_group_050_108=>• 0O*/
        puid |= 2;
        consume(l, data, state);
        return prod;
        return -1;
        /*dc03b569a85a4acb3546a0c9e1f7bc3b*/
    }
    function branch_dc4ac9cf8150dd1a(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*11:27 class=>modifier_list cls identifier class_group_113_103 { • }*/
        puid |= 64;
        consume(l, data, state);
        add_reduce(state, data, 6, 11);
        return prod;
        return -1;
        /*dc4ac9cf8150dd1a214411fb5398a385*/
    }
    function branch_dc7a8b1c8c1ed5c9(l, data, state, prod, puid) {
        /*25:80 binary_expression=>unary_expression operator •
        25:81 binary_expression=>unary_expression operator • expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        switch (sym_map_b5b0535fb6bbe10a(l, data)) {
            default:
            case 0:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                /*25:80 binary_expression=>unary_expression operator •*/
                add_reduce(state, data, 2, 46);
                /*-------------INDIRECT-------------------*/
                return 21;
            case 1:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*25:81 binary_expression=>unary_expression operator • expression*/
                puid |= 4;
                pushFN(data, branch_aa2d67a74744fb41);
                pushFN(data, $expression);
                return puid;
            case 2:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                /*25:81 binary_expression=>unary_expression operator • expression*/
                puid |= 4;
                pushFN(data, branch_aa2d67a74744fb41);
                pushFN(data, $expression);
                return puid;
        }
        return -1;
        /*dc7a8b1c8c1ed5c9df2ebd9fcb668920*/
    }
    function branch_dc83f428871b16c3(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $modifier_list_HC_listbody1_120_goto);
        return 49;
        /*dc83f428871b16c3ca4861f792af39bd*/
    }
    function branch_dd386c06d23e1b10(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*112:332 virtual-104:7:1|--lvl:0=>( parameters ; ; • ) expression*/
        puid |= 128;
        consume(l, data, state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 4;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $expression);
        return puid;
        return -1;
        /*dd386c06d23e1b10442c743a0636fda5*/
    }
    function branch_dd54f6894102006d(l, data, state, prod, puid) {
        /*12:32 struct=>modifier_list str identifier • { parameters }
        12:34 struct=>modifier_list str identifier • { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 123/*[{]*/) {
            consume(l, data, state);
            puid |= 8;
            /*12:32 struct=>modifier_list str identifier { • parameters }
            12:34 struct=>modifier_list str identifier { • }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if (l.current_byte == 125/*[}]*/) {
                pushFN(data, branch_0a5b9c282ee399c8);
                return branch_48e3d2ad1adfc4ee(l, data, state, prod, 8);
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if (assert_ascii(l, 0x0, 0x10, 0x88000000, 0x0) || l.isUniID(data)) {
                pushFN(data, branch_0a5b9c282ee399c8);
                return branch_5e571d27ef8a89c6(l, data, state, prod, 8);
            }
        }
        return -1;
        /*dd54f6894102006dcd1aea78571eec3d*/
    }
    function branch_dd5c1e4a566fe3e5(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $expression_statements_goto);
        return 20;
        /*dd5c1e4a566fe3e5592b2f39aeb7de67*/
    }
    function branch_ddbc14d69834cb82(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 4;
        pushFN(data, branch_382842d2b736c8bb);
        pushFN(data, $type_group_092_122);
        return puid;
        return -1;
        /*ddbc14d69834cb82ea57a2be73ceb463*/
    }
    function branch_de1580607d916084(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*77:236 def$hex_digit=>• τe*/
        puid |= 32;
        consume(l, data, state);
        return prod;
        return -1;
        /*de1580607d916084e2cdae70d5aeb40c*/
    }
    function branch_dea289e2d40c0a42(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*29:93 loop_expression_group_254_111=>( • )*/
        puid |= 4;
        consume(l, data, state);
        add_reduce(state, data, 2, 38);
        return prod;
        return -1;
        /*dea289e2d40c0a421b78267a52907ea9*/
    }
    function branch_dec7210022a48f17(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*47:136 identifier_token_group_080_119=>• θws*/
        puid |= 1;
        consume(l, data, state);
        return prod;
        return -1;
        /*dec7210022a48f17cfd8efc701e0795c*/
    }
    function branch_df52e5549c4b62d0(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*13:37 function=>fn identifier : type ( parameters ) { • expression_statements }*/
        puid |= 512;
        pushFN(data, branch_467592e64b88958b);
        pushFN(data, $expression_statements);
        return puid;
        return -1;
        /*df52e5549c4b62d0597cb0e08925c014*/
    }
    function branch_df75e1e82f931842(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*13:40 function=>fn identifier : type ( ) { • expression_statements }*/
        puid |= 512;
        pushFN(data, branch_a6ab45631474dbf9);
        pushFN(data, $expression_statements);
        return puid;
        return -1;
        /*df75e1e82f931842ccf339532d309fe4*/
    }
    function branch_df9f6863c7454e16(l, data, state, prod, puid) {
        pushFN(data, $expression_goto);
        return 37;
        /*df9f6863c7454e16d8e0360436e045f0*/
    }
    function branch_dfee164add9936bd(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*20:62 expression_statements=>expression_statements • expression_statements_group_124_109*/
        puid |= 2;
        pushFN(data, branch_8f440e68935ae836);
        pushFN(data, $expression_statements_group_124_109);
        return puid;
        return -1;
        /*dfee164add9936bd41a74e10288464ba*/
    }
    function branch_e065d9119934ceb8(l, data, state, prod, puid) {
        add_reduce(state, data, 2, 0);
        return 23;
        /*e065d9119934ceb8f451e9563fdee717*/
    }
    function branch_e10166b57a188545(l, data, state, prod, puid) {
        /*25:80 binary_expression=>unary_expression operator •
        25:81 binary_expression=>unary_expression operator • expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        switch (sym_map_23b13148ee7a35d0(l, data)) {
            default:
            case 0:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                /*25:80 binary_expression=>unary_expression operator •*/
                add_reduce(state, data, 2, 46);
                /*-------------INDIRECT-------------------*/
                pushFN(data, branch_40a7ef9e3eb88045);
                return 21;
            case 1:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*25:81 binary_expression=>unary_expression operator • expression*/
                puid |= 4;
                pushFN(data, branch_0b16c54a0c373e13);
                pushFN(data, $expression);
                return puid;
            case 2:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                /*25:81 binary_expression=>unary_expression operator • expression*/
                puid |= 4;
                pushFN(data, branch_0b16c54a0c373e13);
                pushFN(data, $expression);
                return puid;
        }
        return -1;
        /*e10166b57a1885457124785f50b77984*/
    }
    function branch_e187025a283f9525(l, data, state, prod, puid) {
        add_reduce(state, data, 2, 0);
        return 84;
        /*e187025a283f95257620ce1cfca131a1*/
    }
    function branch_e2593d86c28e29b0(l, data, state, prod, puid) {
        /*11:24 class=>modifier_list • cls identifier class_group_113_103 { class_HC_listbody1_105 }
        11:26 class=>modifier_list • cls identifier { class_HC_listbody1_105 }
        11:27 class=>modifier_list • cls identifier class_group_113_103 { }
        11:30 class=>modifier_list • cls identifier { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (/*[cls]*/cmpr_set(l, data, 122, 3, 3)) {
            consume(l, data, state);
            puid |= 2;
            /*11:24 class=>modifier_list cls • identifier class_group_113_103 { class_HC_listbody1_105 }
            11:26 class=>modifier_list cls • identifier { class_HC_listbody1_105 }
            11:27 class=>modifier_list cls • identifier class_group_113_103 { }
            11:30 class=>modifier_list cls • identifier { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_bf8b5367261e330a);
            pushFN(data, $identifier);
            puid |= 4;
            return puid;
        }
        return -1;
        /*e2593d86c28e29b0a4dbf6349be79cf1*/
    }
    function branch_e2bf1a2fbc8c4ac7(l, data, state, prod, puid) {
        add_reduce(state, data, 3, 91);
        return 65;
        /*e2bf1a2fbc8c4ac77454db4c06824a87*/
    }
    function branch_e33080be3e8ab8cc(l, data, state, prod, puid) {
        /*13:36 function=>modifier_list fn identifier • : type ( parameters ) { expression_statements }
        13:38 function=>modifier_list fn identifier • : type ( ) { expression_statements }
        13:39 function=>modifier_list fn identifier • : type ( parameters ) { }
        13:42 function=>modifier_list fn identifier • : type ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 58/*[:]*/) {
            consume(l, data, state);
            puid |= 8;
            /*13:36 function=>modifier_list fn identifier : • type ( parameters ) { expression_statements }
            13:38 function=>modifier_list fn identifier : • type ( ) { expression_statements }
            13:39 function=>modifier_list fn identifier : • type ( parameters ) { }
            13:42 function=>modifier_list fn identifier : • type ( ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_3b4899584dc324a2);
            pushFN(data, $type);
            puid |= 16;
            return puid;
        }
        return -1;
        /*e33080be3e8ab8cc69b755e2c0c63d98*/
    }
    function branch_e386181493559bbb(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*52:151 type_group_092_122=>• 32*/
        puid |= 4;
        consume(l, data, state);
        return prod;
        return -1;
        /*e386181493559bbb928aa065e1a95352*/
    }
    function branch_e414505bb9eeb857(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*83:251 def$scientific_token_group_228_102=>def$scientific_token_group_027_101 • θnum*/
        puid |= 4;
        consume(l, data, state);
        add_reduce(state, data, 2, 0);
        return prod;
        return -1;
        /*e414505bb9eeb857a4c5cc810f80d3b9*/
    }
    function branch_e47281d445af26d6(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*59:177 string_HC_listbody1_127=>string_HC_listbody1_127 • string_group_0112_125*/
        puid |= 2;
        pushFN(data, branch_c16dcb383e53221e);
        pushFN(data, $string_group_0112_125);
        return puid;
        return -1;
        /*e47281d445af26d66c5fae935acb2466*/
    }
    function branch_e56bbc7571cdf1e6(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $loop_expression_HC_listbody6_112_goto);
        return 30;
        /*e56bbc7571cdf1e6a198a438a58ece8a*/
    }
    function branch_e570b4eb4eafcb66(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 64;
        if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
            add_reduce(state, data, 3, 48);
            return prod;
        }
        return -1;
        /*e570b4eb4eafcb66b1b223128ee99ee9*/
    }
    function branch_e5b14fb1a24c1230(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*57:174 string_group_0112_125=>• \"*/
        puid |= 16;
        consume(l, data, state);
        return prod;
        return -1;
        /*e5b14fb1a24c123002cdaa9b34464449*/
    }
    function branch_e6262d2fc73c8fb2(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, $modifier_list_HC_listbody1_120_goto);
        return 49;
        /*e6262d2fc73c8fb2e87db7a99e517735*/
    }
    function branch_e65b69b5a96d5210(l, data, state, prod, puid) {
        /*43:127 primitive_declaration=>identifier • : type primitive_declaration_group_170_116
        43:129 primitive_declaration=>identifier • : type*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 58/*[:]*/) {
            consume(l, data, state);
            puid |= 4;
            /*43:127 primitive_declaration=>identifier : • type primitive_declaration_group_170_116
            43:129 primitive_declaration=>identifier : • type*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_c234a226ef934bf3);
            pushFN(data, $type);
            puid |= 8;
            return puid;
        }
        return -1;
        /*e65b69b5a96d5210ec0419cbd318d36c*/
    }
    function branch_e6ca468c39009342(l, data, state, prod, puid) {
        return 1;
        /*e6ca468c39009342aa556361b9a54b1c*/
    }
    function branch_e7e3b3f97d323f23(l, data, state, prod, puid) {
        /*43:126 primitive_declaration=>modifier_list identifier • : type primitive_declaration_group_170_116
        43:128 primitive_declaration=>modifier_list identifier • : type*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 58/*[:]*/) {
            consume(l, data, state);
            puid |= 4;
            /*43:126 primitive_declaration=>modifier_list identifier : • type primitive_declaration_group_170_116
            43:128 primitive_declaration=>modifier_list identifier : • type*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_7376db16b93f2384);
            pushFN(data, $type);
            puid |= 8;
            return puid;
        }
        return -1;
        /*e7e3b3f97d323f23202964a9a6c74731*/
    }
    function branch_e8a2d6c8a5f01d53(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*94:281 def$octal_token_group_058_109=>• 1*/
        puid |= 2;
        consume(l, data, state);
        return prod;
        return -1;
        /*e8a2d6c8a5f01d535fb1973fdff4ed74*/
    }
    function branch_e952b63f018b6b02(l, data, state, prod, puid) {
        /*24:78 if_expression=>if expression • : expression if_expression_group_139_110
        24:79 if_expression=>if expression • : expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 58/*[:]*/) {
            consume(l, data, state);
            puid |= 4;
            /*24:78 if_expression=>if expression : • expression if_expression_group_139_110
            24:79 if_expression=>if expression : • expression*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_6aa1652dcbe2d668);
            pushFN(data, $expression);
            puid |= 2;
            return puid;
        }
        return -1;
        /*e952b63f018b6b027d98913038b48156*/
    }
    function branch_e9ed1a366e98482e(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*45:131 identifier_token_group_075_117=>• θid*/
        puid |= 1;
        consume(l, data, state);
        return prod;
        return -1;
        /*e9ed1a366e98482eebf92577f3281183*/
    }
    function branch_eaa47c6f09c0abfd(l, data, state, prod, puid) {
        /*48:138 identifier_token=>identifier_token_group_075_117 identifier_token_HC_listbody1_118 • identifier_token_group_080_119
        48:140 identifier_token=>identifier_token_group_075_117 identifier_token_HC_listbody1_118 •*/
        skip_db1786a8af54d666(l/*[ 71 ]*/, data, state);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/) {
            pushFN(data, branch_3205c0ded576131e);
            return branch_367228fef7264279(l, data, state, prod, 2);
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*48:140 identifier_token=>identifier_token_group_075_117 identifier_token_HC_listbody1_118 •*/
            add_reduce(state, data, 2, 0);
        }
        return -1;
        /*eaa47c6f09c0abfdf4580a598abfbd5c*/
    }
    function branch_eac4a45e8083cd27(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*107:326 def$identifier_symbols=>• $*/
        puid |= 16;
        consume(l, data, state);
        return prod;
        return -1;
        /*eac4a45e8083cd2784d8a4b6ca5d61f8*/
    }
    function branch_eb93b27850808bc7(l, data, state, prod, puid) {
        /*14:44 function_expression=>modifier_list fn : type ( parameters • ) { expression_statements }
        14:47 function_expression=>modifier_list fn : type ( parameters • ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 41/*[)]*/) {
            consume(l, data, state);
            puid |= 64;
            /*14:44 function_expression=>modifier_list fn : type ( parameters ) • { expression_statements }
            14:47 function_expression=>modifier_list fn : type ( parameters ) • { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if (l.current_byte == 123/*[{]*/) {
                consume(l, data, state);
                puid |= 128;
                /*14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }
                14:47 function_expression=>modifier_list fn : type ( parameters ) { • }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if (l.current_byte == 125/*[}]*/) {
                    pushFN(data, branch_521f65aff0d7939b);
                    return branch_ef1e47c03eb4046e(l, data, state, prod, 128);
                }
            }
        }
        return -1;
        /*eb93b27850808bc7decd0570510958ee*/
    }
    function branch_ebeed5ccb9c84aab(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*108:328 virtual-138:3:1|--lvl:0=>identifier_token_HC_listbody1_118 • identifier_token_group_080_119*/
        puid |= 4;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $identifier_token_group_080_119);
        return puid;
        return -1;
        /*ebeed5ccb9c84aaba55637375bd9e835*/
    }
    function branch_ec4a59e6de71f1ab(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        /*60:182 string=>• ' '*/
        puid |= 4;
        consume(l, data, state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 4;
        if ((l.current_byte == 39/*[']*/) && consume(l, data, state)) {
            add_reduce(state, data, 2, 90);
            return prod;
        }
        return -1;
        /*ec4a59e6de71f1ab005e33d489327f8a*/
    }
    function branch_eca1b2fa9939e9a9(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, $statements_goto);
        return 43;
        /*eca1b2fa9939e9a954e1572f236f688a*/
    }
    function branch_ecb95c5d04401b2e(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 79);
        return 55;
        /*ecb95c5d04401b2edc217fa3fc6a2db2*/
    }
    function branch_ee7180ff4f8b15ee(l, data, state, prod, puid) {
        /*121:341 virtual-127:4:1|--lvl:2=>: type • primitive_declaration_group_170_116
        122:342 virtual-129:3:1|--lvl:2=>: type •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 61/*[=]*/) {
            pushFN(data, branch_3205c0ded576131e);
            return branch_40c7e0ff14e39a95(l, data, state, prod, 8);
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*122:342 virtual-129:3:1|--lvl:2=>: type •*/
            pushFN(data, branch_40a7ef9e3eb88045);
            return 43;
        }
        return -1;
        /*ee7180ff4f8b15ee1d5e5bd81c0e51c9*/
    }
    function branch_ef1e47c03eb4046e(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*14:47 function_expression=>modifier_list fn : type ( parameters ) { • }*/
        puid |= 512;
        consume(l, data, state);
        add_reduce(state, data, 9, 31);
        return prod;
        return -1;
        /*ef1e47c03eb4046ec884b9489f97bfb9*/
    }
    function branch_ef2dc6f8b6dc9a12(l, data, state, prod, puid) {
        pushFN(data, $expression_goto);
        return 72;
        /*ef2dc6f8b6dc9a12a0d2e861dcf58334*/
    }
    function branch_ef9ee89b43b3b8ba(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*9:20 class_group_016_104=>• primitive_declaration*/
        puid |= 2;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $primitive_declaration);
        return puid;
        return -1;
        /*ef9ee89b43b3b8ba28e8c85fad35c31a*/
    }
    function branch_efdcf998a53003ce(l, data, state, prod, puid) {
        /*43:126 primitive_declaration=>modifier_list identifier • : type primitive_declaration_group_170_116
        43:128 primitive_declaration=>modifier_list identifier • : type*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 58/*[:]*/) {
            consume(l, data, state);
            puid |= 4;
            /*43:126 primitive_declaration=>modifier_list identifier : • type primitive_declaration_group_170_116
            43:128 primitive_declaration=>modifier_list identifier : • type*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_a5562234cf1d4d6b);
            pushFN(data, $type);
            puid |= 8;
            return puid;
        }
        return -1;
        /*efdcf998a53003ce142d045e8d21e0b1*/
    }
    function branch_f023ab1475a73fda(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 4;
        if ((l.current_byte == 39/*[']*/) && consume(l, data, state)) {
            add_reduce(state, data, 3, 37);
            return prod;
        }
        return -1;
        /*f023ab1475a73fda5479d980b5455fb6*/
    }
    function branch_f068cad16e805a7e(l, data, state, prod, puid) {
        /*-------------INDIRECT-------------------*/
        pushFN(data, $class_HC_listbody1_105_goto);
        return 10;
        /*f068cad16e805a7ee11939b83d3f2c58*/
    }
    function branch_f12f0fa85b21f76a(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*109:329 virtual-97:9:1|--lvl:0=>( parameters ; expression ; • loop_expression_HC_listbody6_112 ) expression*/
        puid |= 64;
        pushFN(data, branch_a0ce7c0c0be8d7d8);
        pushFN(data, $loop_expression_HC_listbody6_112);
        return puid;
        return -1;
        /*f12f0fa85b21f76a5afa51afc1460eb3*/
    }
    function branch_f13c855d3a1bc46c(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*31:103 loop_expression=>loop ( ; expression ; • ) expression*/
        puid |= 128;
        consume(l, data, state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 4;
        pushFN(data, branch_bddcedc35aea4210);
        pushFN(data, $expression);
        return puid;
        return -1;
        /*f13c855d3a1bc46c3864e48d6815d288*/
    }
    function branch_f13eafcddbdd43be(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*11:24 class=>modifier_list cls identifier class_group_113_103 { • class_HC_listbody1_105 }*/
        puid |= 32;
        pushFN(data, branch_baf429511ae90366);
        pushFN(data, $class_HC_listbody1_105);
        return puid;
        return -1;
        /*f13eafcddbdd43beb0470577091065cb*/
    }
    function branch_f1978b468656cbf1(l, data, state, prod, puid) {
        add_reduce(state, data, 7, 58);
        return prod;
        /*f1978b468656cbf1389e14a99b241265*/
    }
    function branch_f19b89862f600e5f(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 32;
        if ((l.current_byte == 93/*[]]*/) && consume(l, data, state)) {
            add_reduce(state, data, 4, 66);
            /*-------------INDIRECT-------------------*/
            pushFN(data, $expression_statements_group_023_108_goto);
            return 37;
        }
        return -1;
        /*f19b89862f600e5f7540b8619dd1b5c5*/
    }
    function branch_f2068067406e255c(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        /*71:214 comment=>• /* comment_HC_listbody1_131 * /*/
        puid |= 1;
        consume(l, data, state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 2;
        pushFN(data, branch_39bdeca216a17699);
        pushFN(data, $comment_HC_listbody1_131);
        return puid;
        return -1;
        /*f2068067406e255c381313e7d0a834e4*/
    }
    function branch_f29ead3e741f692c(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        /*36:114 call_expression=>member_expression • ( )*/
        puid |= 2;
        consume(l, data, state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 8;
        if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
            add_reduce(state, data, 3, 64);
            return prod;
        }
        return -1;
        /*f29ead3e741f692c1052a936c17bf854*/
    }
    function branch_f2b7e53ce7449f3a(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*82:249 def$scientific_token_group_027_101=>• E*/
        puid |= 2;
        consume(l, data, state);
        return prod;
        return -1;
        /*f2b7e53ce7449f3a7a5fde501a57d46e*/
    }
    function branch_f3c5df3271892b40(l, data, state, prod, puid) {
        add_reduce(state, data, 2, 0);
        return prod;
        /*f3c5df3271892b40c21bd3a22c3cb7f7*/
    }
    function branch_f403406c2d2f0b6e(l, data, state, prod, puid) {
        add_reduce(state, data, 3, 43);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $expression_goto);
        return 21;
        /*f403406c2d2f0b6e65b8b84f6931f3dc*/
    }
    function branch_f43d144a15ffcf8b(l, data, state, prod, puid) {
        /*33:108 match_expression=>match expression • : match_expression_HC_listbody3_113
        33:109 match_expression=>match expression • :*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 58/*[:]*/) {
            consume(l, data, state);
            puid |= 4;
            /*33:108 match_expression=>match expression : • match_expression_HC_listbody3_113
            33:109 match_expression=>match expression : •*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            switch (sym_map_1015cbb2bf16c5e8(l, data)) {
                case 0:
                    /*33:108 match_expression=>match expression : • match_expression_HC_listbody3_113
                    33:109 match_expression=>match expression : •*/
                    var pk = l.copy();
                    skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, 0);
                    switch (sym_map_9fff07fe93fb5f87(pk, data)) {
                        case 0:
                            /*--LEAF--*/
                            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                            /*33:108 match_expression=>match expression : • match_expression_HC_listbody3_113*/
                            puid |= 8;
                            pushFN(data, branch_7aec22af26f85298);
                            pushFN(data, $match_expression_HC_listbody3_113);
                            return puid;
                        default:
                        case 1:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                            /*33:109 match_expression=>match expression : •*/
                            add_reduce(state, data, 3, 61);
                            return 33;
                    }
                default:
                case 1:
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    /*33:109 match_expression=>match expression : •*/
                    add_reduce(state, data, 3, 61);
                    return 33;
                case 2:
                    /*--LEAF--*/
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    /*33:108 match_expression=>match expression : • match_expression_HC_listbody3_113*/
                    puid |= 8;
                    pushFN(data, branch_7aec22af26f85298);
                    pushFN(data, $match_expression_HC_listbody3_113);
                    return puid;
                case 3:
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                    /*33:108 match_expression=>match expression : • match_expression_HC_listbody3_113*/
                    puid |= 8;
                    pushFN(data, branch_7aec22af26f85298);
                    pushFN(data, $match_expression_HC_listbody3_113);
                    return puid;
            }
        }
        return -1;
        /*f43d144a15ffcf8b615d6e2ef0735e32*/
    }
    function branch_f4915894d220d780(l, data, state, prod, puid) {
        /*43:126 primitive_declaration=>modifier_list identifier • : type primitive_declaration_group_170_116
        43:128 primitive_declaration=>modifier_list identifier • : type*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 58/*[:]*/) {
            consume(l, data, state);
            puid |= 4;
            /*43:126 primitive_declaration=>modifier_list identifier : • type primitive_declaration_group_170_116
            43:128 primitive_declaration=>modifier_list identifier : • type*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_43bb0d1e77b298fe);
            pushFN(data, $type);
            puid |= 8;
            return puid;
        }
        return -1;
        /*f4915894d220d7804b24808fb424832f*/
    }
    function branch_f53e7228acdd15da(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*62:186 num_tok=>• def$binary*/
        puid |= 4;
        pushFN(data, branch_1f9ddf3c27180aa0);
        pushFN(data, $def$binary);
        return puid;
        return -1;
        /*f53e7228acdd15da4eecfe2b4f8867dc*/
    }
    function branch_f5f2356c9bc9b5b7(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
        /*46:134 identifier_token_HC_listbody1_118=>identifier_token_HC_listbody1_118 • identifier_token_group_075_117*/
        puid |= 2;
        pushFN(data, branch_cfb3fe9c738c88e2);
        pushFN(data, $identifier_token_group_075_117);
        return puid;
        return -1;
        /*f5f2356c9bc9b5b7311f49f05ffb1a4c*/
    }
    function branch_f6003567d4aab0a3(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*36:114 call_expression=>member_expression ( • )*/
        puid |= 8;
        consume(l, data, state);
        add_reduce(state, data, 3, 64);
        return prod;
        return -1;
        /*f6003567d4aab0a39126d66aa687dd29*/
    }
    function branch_f600e24803492312(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        /*11:31 class=>cls identifier • { }*/
        puid |= 16;
        consume(l, data, state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 64;
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 4, 15);
            return prod;
        }
        return -1;
        /*f600e2480349231284d6f986dc3d61fb*/
    }
    function branch_f74c3bed1eecf572(l, data, state, prod, puid) {
        return 47;
        /*f74c3bed1eecf572eea36f92e58e88d8*/
    }
    function branch_f75a8dfe594b3a95(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
        /*63:188 operator_HC_listbody1_128=>operator_HC_listbody1_128 • θsym*/
        puid |= 2;
        consume(l, data, state);
        add_reduce(state, data, 2, 87);
        return prod;
        return -1;
        /*f75a8dfe594b3a95fda322d2d445b979*/
    }
    function branch_f8d48abe3e51a3c4(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*12:33 struct=>str identifier { • parameters }*/
        puid |= 16;
        pushFN(data, branch_32ad73b65dc14f67);
        pushFN(data, $parameters);
        return puid;
        return -1;
        /*f8d48abe3e51a3c47f149af8540803af*/
    }
    function branch_f8f570a28683ce97(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 8;
        if ((l.current_byte == 59/*[;]*/) && consume(l, data, state)) {
            add_reduce(state, data, 2, 4);
            return prod;
        }
        return -1;
        /*f8f570a28683ce97ae45d1126c24795d*/
    }
    function branch_f99da89f8249a0d8(l, data, state, prod, puid) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        puid |= 4;
        if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
            add_reduce(state, data, 3, 37);
            pushFN(data, branch_18ddf6ec17b31727);
            return 29;
        }
        return -1;
        /*f99da89f8249a0d85a300e0b262dc129*/
    }
    function branch_f9ff5e049230d02f(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*87:267 def$hex_token_group_044_104=>• D*/
        puid |= 1024;
        consume(l, data, state);
        return prod;
        return -1;
        /*f9ff5e049230d02f0bda1c40899f33b8*/
    }
    function branch_fa39f64b2e53753c(l, data, state, prod, puid) {
        /*25:80 binary_expression=>unary_expression • operator
        25:81 binary_expression=>unary_expression • operator expression
        25:82 binary_expression=>unary_expression •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        if (sym_map_e58af9c6fd146069(l, data) == 1) {
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*25:82 binary_expression=>unary_expression •*/
            return 25;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (/*[==]*/cmpr_set(l, data, 7, 2, 2) || l.isSym(true, data)) {
            /*25:80 binary_expression=>unary_expression • operator
            25:81 binary_expression=>unary_expression • operator expression*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_426a18e31d408115);
            pushFN(data, $operator);
            puid |= 2;
            return puid;
        }
        return -1;
        /*fa39f64b2e53753c668589c3839df176*/
    }
    function branch_fa505a045455139c(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*77:242 def$hex_digit=>• τE*/
        puid |= 2048;
        consume(l, data, state);
        return prod;
        return -1;
        /*fa505a045455139c3963e0a1ea1d2838*/
    }
    function branch_fa55fa3a8510aadd(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*27:90 unary_value=>( • )*/
        puid |= 64;
        consume(l, data, state);
        add_reduce(state, data, 2, 49);
        return prod;
        return -1;
        /*fa55fa3a8510aadd9e8df05ce11da0f3*/
    }
    function branch_fc3089e8ba238415(l, data, state, prod, puid) {
        pushFN(data, $class_group_016_104_goto);
        return 9;
        /*fc3089e8ba238415307d1c965288ff81*/
    }
    function branch_fc701c1f623bdd1d(l, data, state, prod, puid) {
        /*25:80 binary_expression=>unary_expression operator •
        25:81 binary_expression=>unary_expression operator • expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        switch (sym_map_23b13148ee7a35d0(l, data)) {
            default:
            case 0:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                /*25:80 binary_expression=>unary_expression operator •*/
                add_reduce(state, data, 2, 46);
                /*-------------INDIRECT-------------------*/
                return 18;
            case 1:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*25:81 binary_expression=>unary_expression operator • expression*/
                puid |= 4;
                pushFN(data, branch_4e10e2b6d2141ce9);
                pushFN(data, $expression);
                return puid;
            case 2:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                /*25:81 binary_expression=>unary_expression operator • expression*/
                puid |= 4;
                pushFN(data, branch_4e10e2b6d2141ce9);
                pushFN(data, $expression);
                return puid;
        }
        return -1;
        /*fc701c1f623bdd1dc3c60fd1d71e50e3*/
    }
    function branch_fc882760efd204c1(l, data, state, prod, puid) {
        /*13:36 function=>modifier_list fn identifier : type ( parameters • ) { expression_statements }
        13:39 function=>modifier_list fn identifier : type ( parameters • ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 41/*[)]*/) {
            consume(l, data, state);
            puid |= 128;
            /*13:36 function=>modifier_list fn identifier : type ( parameters ) • { expression_statements }
            13:39 function=>modifier_list fn identifier : type ( parameters ) • { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if (l.current_byte == 123/*[{]*/) {
                consume(l, data, state);
                puid |= 256;
                /*13:36 function=>modifier_list fn identifier : type ( parameters ) { • expression_statements }
                13:39 function=>modifier_list fn identifier : type ( parameters ) { • }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if (l.current_byte == 125/*[}]*/) {
                    pushFN(data, branch_0a5b9c282ee399c8);
                    return branch_c9ed7295adaf6608(l, data, state, prod, 256);
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if (((((((((((((((/*[if]*/cmpr_set(l, data, 143, 2, 2) ||/*[match]*/cmpr_set(l, data, 67, 5, 5)) ||/*[break]*/cmpr_set(l, data, 72, 5, 5)) ||/*[return]*/cmpr_set(l, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(l, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(l, data, 63, 4, 4)) ||/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) ||/*[==]*/cmpr_set(l, data, 7, 2, 2)) || dt_bcea2102060eab13(l, data)) ||/*[true]*/cmpr_set(l, data, 95, 4, 4)) ||/*[null]*/cmpr_set(l, data, 35, 4, 4)) || dt_6ae31dd85a62ef5c(l, data)) || assert_ascii(l, 0x0, 0x194, 0x88000000, 0x8000000)) || l.isUniID(data)) || l.isNum(data)) || l.isSym(true, data)) {
                    pushFN(data, branch_0a5b9c282ee399c8);
                    return branch_2021bb8956171841(l, data, state, prod, 256);
                }
            }
        }
        return -1;
        /*fc882760efd204c1bd9474a5b6057d21*/
    }
    function branch_fd8ee373d7641a51(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        /*77:238 def$hex_digit=>• τA*/
        puid |= 128;
        consume(l, data, state);
        return prod;
        return -1;
        /*fd8ee373d7641a5100865a1eb0083594*/
    }
    function branch_fe55487282b0b10d(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        /*110:330 virtual-100:8:1|--lvl:0=>( parameters ; ; • loop_expression_HC_listbody6_112 ) expression*/
        puid |= 64;
        pushFN(data, branch_a0ce7c0c0be8d7d8);
        pushFN(data, $loop_expression_HC_listbody6_112);
        return puid;
        return -1;
        /*fe55487282b0b10d2e896e48d212c509*/
    }
    function branch_feb1ea4d7c76681b(l, data, state, prod, puid) {
        /*108:328 virtual-138:3:1|--lvl:0=>• identifier_token_HC_listbody1_118 identifier_token_group_080_119
        109:329 virtual-140:2:1|--lvl:0=>• identifier_token_HC_listbody1_118*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (((l.current_byte == 95/*[_]*/) || (l.current_byte == 36/*[$]*/)) || l.isUniID(data)) {
            /*108:328 virtual-138:3:1|--lvl:0=>• identifier_token_HC_listbody1_118 identifier_token_group_080_119
            109:329 virtual-140:2:1|--lvl:0=>• identifier_token_HC_listbody1_118*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_5ff5f8118dfc8fe7);
            pushFN(data, $identifier_token_HC_listbody1_118);
            puid |= 2;
            return puid;
        }
        return -1;
        /*feb1ea4d7c76681b3cdcf3e884e136ab*/
    }
    function dt_1e3f2d5b696b270e(l, data) {
        if (3 == compare(data, l.byte_offset + 0, 47, 3)) {
            if (3 == compare(data, l.byte_offset + 3, 50, 3)) {
                /*string*/
                l.setToken(TokenSymbol, 6, 6);
                return true;
            }
            /*str*/
            l.setToken(TokenSymbol, 3, 3);
            return true;
        }
        return false;
    }
    function dt_1f145d506cf02379(l, data) {
        if (2 == compare(data, l.byte_offset + 0, 17, 2)) {
            /*/**/
            l.setToken(TokenSymbol, 2, 2);
            return true;
        } else if (2 == compare(data, l.byte_offset + 0, 112, 2)) {
            /*//*/
            l.setToken(TokenSymbol, 2, 2);
            return true;
        }
        return false;
    }
    function dt_6ae31dd85a62ef5c(l, data) {
        if (2 == compare(data, l.byte_offset + 0, 27, 2)) {
            /*0x*/
            l.setToken(TokenSymbol, 2, 2);
            return true;
        } else if (2 == compare(data, l.byte_offset + 0, 114, 2)) {
            /*0b*/
            l.setToken(TokenSymbol, 2, 2);
            return true;
        } else if (2 == compare(data, l.byte_offset + 0, 137, 2)) {
            /*0o*/
            l.setToken(TokenSymbol, 2, 2);
            return true;
        } else if (2 == compare(data, l.byte_offset + 0, 139, 2)) {
            /*0O*/
            l.setToken(TokenSymbol, 2, 2);
            return true;
        }
        return false;
    }
    function dt_8411d8c5b1c2ec8c(l, data) {
        if (2 == compare(data, l.byte_offset + 0, 143, 2)) {
            /*if*/
            l.setToken(TokenSymbol, 2, 2);
            return true;
        } else if (2 == compare(data, l.byte_offset + 0, 43, 2)) {
            /*in*/
            l.setToken(TokenSymbol, 2, 2);
            return true;
        }
        return false;
    }
    function dt_a0570d6d5c8952c6(l, data) {
        if (3 == compare(data, l.byte_offset + 0, 134, 3)) {
            /*pub*/
            l.setToken(TokenSymbol, 3, 3);
            return true;
        } else if (4 == compare(data, l.byte_offset + 0, 99, 4)) {
            /*priv*/
            l.setToken(TokenSymbol, 4, 4);
            return true;
        }
        return false;
    }
    function dt_bc3480b75045e0d0(l, data) {
        if (2 == compare(data, l.byte_offset + 0, 137, 2)) {
            /*0o*/
            l.setToken(TokenSymbol, 2, 2);
            return true;
        } else if (2 == compare(data, l.byte_offset + 0, 139, 2)) {
            /*0O*/
            l.setToken(TokenSymbol, 2, 2);
            return true;
        }
        return false;
    }
    function dt_bcea2102060eab13(l, data) {
        if (2 == compare(data, l.byte_offset + 0, 144, 2)) {
            /*fn*/
            l.setToken(TokenSymbol, 2, 2);
            return true;
        } else if (5 == compare(data, l.byte_offset + 0, 53, 5)) {
            /*false*/
            l.setToken(TokenSymbol, 5, 5);
            return true;
        }
        return false;
    }
    function dt_dc6530084293e429(l, data) {
        if (2 == compare(data, l.byte_offset + 0, 141, 2)) {
            /*is*/
            l.setToken(TokenSymbol, 2, 2);
            return true;
        } else if (2 == compare(data, l.byte_offset + 0, 43, 2)) {
            /*in*/
            l.setToken(TokenSymbol, 2, 2);
            return true;
        }
        return false;
    }
    function nocap_108e16629a73e761(l) {
        var a = l.token_length;
        var b = l.byte_length;
        if (l.isSP(true, data)) {
            l.token_length = a;
            l.byte_length = b;
            return true;
        }
        return false;
    }
    function nocap_9b1ef04606bbaa09(l) {
        var a = l.token_length;
        var b = l.byte_length;
        if (l.isNL()) {
            l.token_length = a;
            l.byte_length = b;
            return true;
        }
        return false;
    }
    function nocap_b2eb52235ee30b8a(l) {
        var a = l.token_length;
        var b = l.byte_length;
        if (l.isNL() || l.isSP(true, data)) {
            l.token_length = a;
            l.byte_length = b;
            return true;
        }
        return false;
    }
    function skip_6c02533b5dc0d802(l, data, state) {
        const off = l.token_offset;
        while (1) {
            if (!(tk_d5febc993465556c(l, data) || l.isSP(true, data))) {
                break;
            }
            l.next(data);
        }
        if (isOutputEnabled(state)) {
            add_skip(l, data, l.token_offset - off);
        }
    }
    function skip_9184d3c96b70653a(l, data, state) {
        const off = l.token_offset;
        while (1) {
            if (!((tk_d5febc993465556c(l, data) || l.isNL()) || l.isSP(true, data))) {
                break;
            }
            l.next(data);
        }
        if (isOutputEnabled(state)) {
            add_skip(l, data, l.token_offset - off);
        }
    }
    function skip_a294e41529bc9275(l, data, state) {
        const off = l.token_offset;
        while (1) {
            if (!(tk_d5febc993465556c(l, data) || l.isNL())) {
                break;
            }
            l.next(data);
        }
        if (isOutputEnabled(state)) {
            add_skip(l, data, l.token_offset - off);
        }
    }
    function skip_db1786a8af54d666(l, data, state) {
        const off = l.token_offset;
        while (1) {
            if (!(tk_d5febc993465556c(l, data))) {
                break;
            }
            l.next(data);
        }
        if (isOutputEnabled(state)) {
            add_skip(l, data, l.token_offset - off);
        }
    }
    function sym_map_00f57473245d5924(l, data) {
        /*=*/
        if (data.input[l.byte_offset + 0] == 61) {
            /*=*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        }
        return -1;
    }
    function sym_map_0cbf9b70d80ceff9(l, data) {
        /*sym == ( [ . =*/
        if (data.input[l.byte_offset + 0] == 61) {
            if (data.input[l.byte_offset + 1] == 61) {
                /*==*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
            /*=*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 40) {
            /*(*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 46) {
            /*.*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        }
        if (l.isSym(true, data)) {
            return 1;
        }
        return 1;
    }
    function sym_map_1015cbb2bf16c5e8(l, data) {
        /*fn : else ) ; ] } , in str [ fn { if match break return continue loop <<-- sym == ( " ' true false null num 0x 0b 0o 0O id _ $ [*/
        if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*fn*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 1;
                    /*fn*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 1;
                }
            } else if (data.input[l.byte_offset + 1] == 97) {
                if (3 == compare(data, l.byte_offset + 2, 55, 3)) {
                    if (l.isDiscrete(data, TokenIdentifier, 5)) {
                        /*false*/
                        l.setToken(TokenSymbol, 5, 5);
                        return 2;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 58) {
            /*:*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 101) {
            if (3 == compare(data, l.byte_offset + 1, 129, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*else*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 41) {
            /*)*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 59) {
            /*;*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 93) {
            /*]*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 125) {
            /*}*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 44) {
            /*,*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 105) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*in*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 1;
                }
            } else if (data.input[l.byte_offset + 1] == 102) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*if*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 2;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 115) {
            if (2 == compare(data, l.byte_offset + 1, 48, 2)) {
                if (l.isDiscrete(data, TokenIdentifier, 3)) {
                    /*str*/
                    l.setToken(TokenSymbol, 3, 3);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 3;
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 3;
        } else if (data.input[l.byte_offset + 0] == 123) {
            /*{*/
            l.setToken(TokenSymbol, 1, 1);
            return 2;
        } else if (data.input[l.byte_offset + 0] == 109) {
            if (4 == compare(data, l.byte_offset + 1, 68, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*match*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 2;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 98) {
            if (4 == compare(data, l.byte_offset + 1, 73, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*break*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 2;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 114) {
            if (5 == compare(data, l.byte_offset + 1, 78, 5)) {
                if (l.isDiscrete(data, TokenIdentifier, 6)) {
                    /*return*/
                    l.setToken(TokenSymbol, 6, 6);
                    return 2;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 99) {
            if (7 == compare(data, l.byte_offset + 1, 40, 7)) {
                if (l.isDiscrete(data, TokenIdentifier, 8)) {
                    /*continue*/
                    l.setToken(TokenSymbol, 8, 8);
                    return 2;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 108) {
            if (3 == compare(data, l.byte_offset + 1, 64, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*loop*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 2;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 60) {
            if (3 == compare(data, l.byte_offset + 1, 21, 3)) {
                /*<<--*/
                l.setToken(TokenSymbol, 4, 4);
                return 2;
            }
        } else if (data.input[l.byte_offset + 0] == 61) {
            if (data.input[l.byte_offset + 1] == 61) {
                /*==*/
                l.setToken(TokenSymbol, 2, 2);
                return 2;
            }
        } else if (data.input[l.byte_offset + 0] == 40) {
            /*(*/
            l.setToken(TokenSymbol, 1, 1);
            return 2;
        } else if (data.input[l.byte_offset + 0] == 34) {
            /*"*/
            l.setToken(TokenSymbol, 1, 1);
            return 2;
        } else if (data.input[l.byte_offset + 0] == 39) {
            /*'*/
            l.setToken(TokenSymbol, 1, 1);
            return 2;
        } else if (data.input[l.byte_offset + 0] == 116) {
            if (3 == compare(data, l.byte_offset + 1, 96, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*true*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 2;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 110) {
            if (3 == compare(data, l.byte_offset + 1, 36, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*null*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 2;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 48) {
            if (data.input[l.byte_offset + 1] == 120) {
                /*0x*/
                l.setToken(TokenSymbol, 2, 2);
                return 2;
            } else if (data.input[l.byte_offset + 1] == 98) {
                /*0b*/
                l.setToken(TokenSymbol, 2, 2);
                return 2;
            } else if (data.input[l.byte_offset + 1] == 111) {
                /*0o*/
                l.setToken(TokenSymbol, 2, 2);
                return 2;
            } else if (data.input[l.byte_offset + 1] == 79) {
                /*0O*/
                l.setToken(TokenSymbol, 2, 2);
                return 2;
            }
        } else if (data.input[l.byte_offset + 0] == 95) {
            /*_*/
            l.setToken(TokenSymbol, 1, 1);
            return 3;
        } else if (data.input[l.byte_offset + 0] == 36) {
            /*$*/
            l.setToken(TokenSymbol, 1, 1);
            return 3;
        }
        if (l.isSym(true, data)) {
            return 2;
        } else if (l.isNum(data)) {
            return 2;
        } else if (l.isUniID(data)) {
            return 3;
        }
        return -1;
    }
    function sym_map_1255f361852eac20(l, data) {
        /*<<-- if match sym == fn num 0x 0b 0o 0O " ' true false null ( break return continue loop { ) id _ $ [*/
        if (data.input[l.byte_offset + 0] == 60) {
            if (3 == compare(data, l.byte_offset + 1, 21, 3)) {
                /*<<--*/
                l.setToken(TokenSymbol, 4, 4);
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 105) {
            if (data.input[l.byte_offset + 1] == 102) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*if*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 109) {
            if (4 == compare(data, l.byte_offset + 1, 68, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*match*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 61) {
            if (data.input[l.byte_offset + 1] == 61) {
                /*==*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*fn*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 0;
                }
            } else if (data.input[l.byte_offset + 1] == 97) {
                if (3 == compare(data, l.byte_offset + 2, 55, 3)) {
                    if (l.isDiscrete(data, TokenIdentifier, 5)) {
                        /*false*/
                        l.setToken(TokenSymbol, 5, 5);
                        return 0;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 48) {
            if (data.input[l.byte_offset + 1] == 120) {
                /*0x*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            } else if (data.input[l.byte_offset + 1] == 98) {
                /*0b*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            } else if (data.input[l.byte_offset + 1] == 111) {
                /*0o*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            } else if (data.input[l.byte_offset + 1] == 79) {
                /*0O*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 34) {
            /*"*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 39) {
            /*'*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 116) {
            if (3 == compare(data, l.byte_offset + 1, 96, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*true*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 110) {
            if (3 == compare(data, l.byte_offset + 1, 36, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*null*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 40) {
            /*(*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 98) {
            if (4 == compare(data, l.byte_offset + 1, 73, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*break*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 114) {
            if (5 == compare(data, l.byte_offset + 1, 78, 5)) {
                if (l.isDiscrete(data, TokenIdentifier, 6)) {
                    /*return*/
                    l.setToken(TokenSymbol, 6, 6);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 99) {
            if (7 == compare(data, l.byte_offset + 1, 40, 7)) {
                if (l.isDiscrete(data, TokenIdentifier, 8)) {
                    /*continue*/
                    l.setToken(TokenSymbol, 8, 8);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 108) {
            if (3 == compare(data, l.byte_offset + 1, 64, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*loop*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 123) {
            /*{*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 41) {
            /*)*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 95) {
            /*_*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 36) {
            /*$*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        }
        if (l.isSym(true, data)) {
            return 0;
        } else if (l.isNum(data)) {
            return 0;
        } else if (l.isUniID(data)) {
            return 1;
        }
        return -1;
    }
    function sym_map_1a453afd76b3985a(l, data) {
        /*f flt*/
        if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 108) {
                if (data.input[l.byte_offset + 2] == 116) {
                    /*flt*/
                    l.setToken(TokenSymbol, 3, 3);
                    return 1;
                }
            }
            /*f*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        }
        return -1;
    }
    function sym_map_23b13148ee7a35d0(l, data) {
        /*: else ) ; ] } , in str [ fn <<-- if match sym == num 0x 0b 0o 0O " ' true false null ( break return continue loop { [ id _ $ fn*/
        if (data.input[l.byte_offset + 0] == 58) {
            /*:*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 101) {
            if (3 == compare(data, l.byte_offset + 1, 129, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*else*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 41) {
            /*)*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 59) {
            /*;*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 93) {
            /*]*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 125) {
            /*}*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 44) {
            /*,*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
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
            }
        } else if (data.input[l.byte_offset + 0] == 115) {
            if (2 == compare(data, l.byte_offset + 1, 48, 2)) {
                if (l.isDiscrete(data, TokenIdentifier, 3)) {
                    /*str*/
                    l.setToken(TokenSymbol, 3, 3);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 2;
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 2;
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*fn*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 2;
                    /*fn*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 2;
                }
            } else if (data.input[l.byte_offset + 1] == 97) {
                if (3 == compare(data, l.byte_offset + 2, 55, 3)) {
                    if (l.isDiscrete(data, TokenIdentifier, 5)) {
                        /*false*/
                        l.setToken(TokenSymbol, 5, 5);
                        return 1;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 60) {
            if (3 == compare(data, l.byte_offset + 1, 21, 3)) {
                /*<<--*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 109) {
            if (4 == compare(data, l.byte_offset + 1, 68, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*match*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 61) {
            if (data.input[l.byte_offset + 1] == 61) {
                /*==*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
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
            if (3 == compare(data, l.byte_offset + 1, 96, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*true*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 110) {
            if (3 == compare(data, l.byte_offset + 1, 36, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*null*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 40) {
            /*(*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 98) {
            if (4 == compare(data, l.byte_offset + 1, 73, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*break*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 114) {
            if (5 == compare(data, l.byte_offset + 1, 78, 5)) {
                if (l.isDiscrete(data, TokenIdentifier, 6)) {
                    /*return*/
                    l.setToken(TokenSymbol, 6, 6);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 99) {
            if (7 == compare(data, l.byte_offset + 1, 40, 7)) {
                if (l.isDiscrete(data, TokenIdentifier, 8)) {
                    /*continue*/
                    l.setToken(TokenSymbol, 8, 8);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 108) {
            if (3 == compare(data, l.byte_offset + 1, 64, 3)) {
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
        } else if (data.input[l.byte_offset + 0] == 95) {
            /*_*/
            l.setToken(TokenSymbol, 1, 1);
            return 2;
        } else if (data.input[l.byte_offset + 0] == 36) {
            /*$*/
            l.setToken(TokenSymbol, 1, 1);
            return 2;
        }
        if (l.isSym(true, data)) {
            return 1;
        } else if (l.isNum(data)) {
            return 1;
        } else if (l.isUniID(data)) {
            return 2;
        }
        return -1;
    }
    function sym_map_28592a8cdba54a6c(l, data) {
        /*u i uint int f flt string if match fn true false null break return continue loop else in str id _ $ str*/
        if (data.input[l.byte_offset + 0] == 117) {
            if (l.isDiscrete(data, TokenIdentifier, 1)) {
                if (data.input[l.byte_offset + 1] == 105) {
                    if (2 == compare(data, l.byte_offset + 2, 85, 2)) {
                        if (l.isDiscrete(data, TokenIdentifier, 4)) {
                            /*uint*/
                            l.setToken(TokenSymbol, 4, 4);
                            return 0;
                        }
                    }
                }
                /*u*/
                l.setToken(TokenSymbol, 1, 1);
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 105) {
            if (l.isDiscrete(data, TokenIdentifier, 1)) {
                if (data.input[l.byte_offset + 1] == 102) {
                    if (l.isDiscrete(data, TokenIdentifier, 2)) {
                        /*if*/
                        l.setToken(TokenSymbol, 2, 2);
                        return 1;
                    }
                } else if (data.input[l.byte_offset + 1] == 110) {
                    if (l.isDiscrete(data, TokenIdentifier, 2)) {
                        if (data.input[l.byte_offset + 2] == 116) {
                            if (l.isDiscrete(data, TokenIdentifier, 3)) {
                                /*int*/
                                l.setToken(TokenSymbol, 3, 3);
                                return 0;
                            }
                        }
                        /*in*/
                        l.setToken(TokenSymbol, 2, 2);
                        return 1;
                    }
                }
                /*i*/
                l.setToken(TokenSymbol, 1, 1);
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (l.isDiscrete(data, TokenIdentifier, 1)) {
                if (data.input[l.byte_offset + 1] == 110) {
                    if (l.isDiscrete(data, TokenIdentifier, 2)) {
                        /*fn*/
                        l.setToken(TokenSymbol, 2, 2);
                        return 1;
                    }
                } else if (data.input[l.byte_offset + 1] == 108) {
                    if (data.input[l.byte_offset + 2] == 116) {
                        if (l.isDiscrete(data, TokenIdentifier, 3)) {
                            /*flt*/
                            l.setToken(TokenSymbol, 3, 3);
                            return 0;
                        }
                    }
                } else if (data.input[l.byte_offset + 1] == 97) {
                    if (3 == compare(data, l.byte_offset + 2, 55, 3)) {
                        if (l.isDiscrete(data, TokenIdentifier, 5)) {
                            /*false*/
                            l.setToken(TokenSymbol, 5, 5);
                            return 1;
                        }
                    }
                }
                /*f*/
                l.setToken(TokenSymbol, 1, 1);
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 115) {
            if (data.input[l.byte_offset + 1] == 116) {
                if (data.input[l.byte_offset + 2] == 114) {
                    if (l.isDiscrete(data, TokenIdentifier, 3)) {
                        if (data.input[l.byte_offset + 3] == 105) {
                            if (2 == compare(data, l.byte_offset + 4, 51, 2)) {
                                if (l.isDiscrete(data, TokenIdentifier, 6)) {
                                    /*string*/
                                    l.setToken(TokenSymbol, 6, 6);
                                    return 0;
                                }
                            }
                        }
                        /*str*/
                        l.setToken(TokenSymbol, 3, 3);
                        return 2;
                        /*str*/
                        l.setToken(TokenSymbol, 3, 3);
                        return 2;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 109) {
            if (4 == compare(data, l.byte_offset + 1, 68, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*match*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 116) {
            if (3 == compare(data, l.byte_offset + 1, 96, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*true*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 110) {
            if (3 == compare(data, l.byte_offset + 1, 36, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*null*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 98) {
            if (4 == compare(data, l.byte_offset + 1, 73, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*break*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 114) {
            if (5 == compare(data, l.byte_offset + 1, 78, 5)) {
                if (l.isDiscrete(data, TokenIdentifier, 6)) {
                    /*return*/
                    l.setToken(TokenSymbol, 6, 6);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 99) {
            if (7 == compare(data, l.byte_offset + 1, 40, 7)) {
                if (l.isDiscrete(data, TokenIdentifier, 8)) {
                    /*continue*/
                    l.setToken(TokenSymbol, 8, 8);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 108) {
            if (3 == compare(data, l.byte_offset + 1, 64, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*loop*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 101) {
            if (3 == compare(data, l.byte_offset + 1, 129, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*else*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 95) {
            /*_*/
            l.setToken(TokenSymbol, 1, 1);
            return 2;
        } else if (data.input[l.byte_offset + 0] == 36) {
            /*$*/
            l.setToken(TokenSymbol, 1, 1);
            return 2;
        }
        if (l.isUniID(data)) {
            return 2;
        }
        return -1;
    }
    function sym_map_4184c2e3affe1a6d(l, data) {
        /*in ; } , ) ] else : str fn END_OF_FILE sym == ( [ . =*/
        if (data.input[l.byte_offset + 0] == 105) {
            if (data.input[l.byte_offset + 1] == 110) {
                /*in*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 59) {
            /*;*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 125) {
            /*}*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 44) {
            /*,*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 41) {
            /*)*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 93) {
            /*]*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 101) {
            if (3 == compare(data, l.byte_offset + 1, 129, 3)) {
                /*else*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 58) {
            /*:*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 115) {
            if (2 == compare(data, l.byte_offset + 1, 48, 2)) {
                /*str*/
                l.setToken(TokenSymbol, 3, 3);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                /*fn*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 61) {
            if (data.input[l.byte_offset + 1] == 61) {
                /*==*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            }
            /*=*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 40) {
            /*(*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 46) {
            /*.*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        }
        if (l.END(data)) {
            return 1;
        } else if (l.isSym(true, data)) {
            return 0;
        }
        return 1;
    }
    function sym_map_452608436dcadf92(l, data) {
        /*u i uint int*/
        if (data.input[l.byte_offset + 0] == 117) {
            if (data.input[l.byte_offset + 1] == 105) {
                if (2 == compare(data, l.byte_offset + 2, 85, 2)) {
                    /*uint*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 2;
                }
            }
            /*u*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 105) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (data.input[l.byte_offset + 2] == 116) {
                    /*int*/
                    l.setToken(TokenSymbol, 3, 3);
                    return 3;
                }
            }
            /*i*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        }
        return -1;
    }
    function sym_map_4854a1a997047714(l, data) {
        /*END_OF_FILE is { : = . [ sym == ( ; in ) } , ] else str fn*/
        if (data.input[l.byte_offset + 0] == 105) {
            if (data.input[l.byte_offset + 1] == 115) {
                /*is*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            } else if (data.input[l.byte_offset + 1] == 110) {
                /*in*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 123) {
            /*{*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 58) {
            /*:*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 61) {
            if (data.input[l.byte_offset + 1] == 61) {
                /*==*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
            /*=*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 46) {
            /*.*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 40) {
            /*(*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 59) {
            /*;*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 41) {
            /*)*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 125) {
            /*}*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 44) {
            /*,*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 93) {
            /*]*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 101) {
            if (3 == compare(data, l.byte_offset + 1, 129, 3)) {
                /*else*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 115) {
            if (2 == compare(data, l.byte_offset + 1, 48, 2)) {
                /*str*/
                l.setToken(TokenSymbol, 3, 3);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                /*fn*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        }
        if (l.END(data)) {
            return 1;
        } else if (l.isSym(true, data)) {
            return 1;
        }
        return 1;
    }
    function sym_map_48bb833610b884c3(l, data) {
        /*. [ sym == ( in ; } , ) ] else : = str fn END_OF_FILE*/
        if (data.input[l.byte_offset + 0] == 46) {
            /*.*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 61) {
            if (data.input[l.byte_offset + 1] == 61) {
                /*==*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
            /*=*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 40) {
            /*(*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 105) {
            if (data.input[l.byte_offset + 1] == 110) {
                /*in*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 59) {
            /*;*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 125) {
            /*}*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 44) {
            /*,*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 41) {
            /*)*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 93) {
            /*]*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 101) {
            if (3 == compare(data, l.byte_offset + 1, 129, 3)) {
                /*else*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 58) {
            /*:*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 115) {
            if (2 == compare(data, l.byte_offset + 1, 48, 2)) {
                /*str*/
                l.setToken(TokenSymbol, 3, 3);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                /*fn*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        }
        if (l.isSym(true, data)) {
            return 1;
        } else if (l.END(data)) {
            return 1;
        }
        return 1;
    }
    function sym_map_4d813588970288e9(l, data) {
        /*. ( in ; } , == ) sym ] else : [ str fn END_OF_FILE*/
        if (data.input[l.byte_offset + 0] == 46) {
            /*.*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 40) {
            /*(*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 105) {
            if (data.input[l.byte_offset + 1] == 110) {
                /*in*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 59) {
            /*;*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 125) {
            /*}*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 44) {
            /*,*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 61) {
            if (data.input[l.byte_offset + 1] == 61) {
                /*==*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 41) {
            /*)*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 93) {
            /*]*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 101) {
            if (3 == compare(data, l.byte_offset + 1, 129, 3)) {
                /*else*/
                l.setToken(TokenSymbol, 4, 4);
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 58) {
            /*:*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 115) {
            if (2 == compare(data, l.byte_offset + 1, 48, 2)) {
                /*str*/
                l.setToken(TokenSymbol, 3, 3);
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                /*fn*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            }
        }
        if (l.isSym(true, data)) {
            return 0;
        } else if (l.END(data)) {
            return 0;
        }
        return 1;
    }
    function sym_map_54aaa701c2f06829(l, data) {
        /*END_OF_FILE <<-- [ fn true false null ( , if match sym == break return continue loop { } ; in ) ] else : str*/
        if (data.input[l.byte_offset + 0] == 60) {
            if (3 == compare(data, l.byte_offset + 1, 21, 3)) {
                /*<<--*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                /*fn*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            } else if (data.input[l.byte_offset + 1] == 97) {
                if (3 == compare(data, l.byte_offset + 2, 55, 3)) {
                    /*false*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 116) {
            if (3 == compare(data, l.byte_offset + 1, 96, 3)) {
                /*true*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 110) {
            if (3 == compare(data, l.byte_offset + 1, 36, 3)) {
                /*null*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 40) {
            /*(*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 44) {
            /*,*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 105) {
            if (data.input[l.byte_offset + 1] == 102) {
                /*if*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            } else if (data.input[l.byte_offset + 1] == 110) {
                /*in*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 109) {
            if (4 == compare(data, l.byte_offset + 1, 68, 4)) {
                /*match*/
                l.setToken(TokenSymbol, 5, 5);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 61) {
            if (data.input[l.byte_offset + 1] == 61) {
                /*==*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 98) {
            if (4 == compare(data, l.byte_offset + 1, 73, 4)) {
                /*break*/
                l.setToken(TokenSymbol, 5, 5);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 114) {
            if (5 == compare(data, l.byte_offset + 1, 78, 5)) {
                /*return*/
                l.setToken(TokenSymbol, 6, 6);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 99) {
            if (7 == compare(data, l.byte_offset + 1, 40, 7)) {
                /*continue*/
                l.setToken(TokenSymbol, 8, 8);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 108) {
            if (3 == compare(data, l.byte_offset + 1, 64, 3)) {
                /*loop*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 123) {
            /*{*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 125) {
            /*}*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 59) {
            /*;*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 41) {
            /*)*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 93) {
            /*]*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 101) {
            if (3 == compare(data, l.byte_offset + 1, 129, 3)) {
                /*else*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 58) {
            /*:*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 115) {
            if (2 == compare(data, l.byte_offset + 1, 48, 2)) {
                /*str*/
                l.setToken(TokenSymbol, 3, 3);
                return 1;
            }
        }
        if (l.END(data)) {
            return 1;
        } else if (l.isSym(true, data)) {
            return 1;
        }
        return 1;
    }
    function sym_map_5fb5a91443e6e4f1(l, data) {
        /*<<-- if match sym == fn num 0x 0b 0o 0O " ' true false null ( break return continue loop { id _ $ [*/
        if (data.input[l.byte_offset + 0] == 60) {
            if (3 == compare(data, l.byte_offset + 1, 21, 3)) {
                /*<<--*/
                l.setToken(TokenSymbol, 4, 4);
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 105) {
            if (data.input[l.byte_offset + 1] == 102) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*if*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 109) {
            if (4 == compare(data, l.byte_offset + 1, 68, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*match*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 61) {
            if (data.input[l.byte_offset + 1] == 61) {
                /*==*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*fn*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 0;
                }
            } else if (data.input[l.byte_offset + 1] == 97) {
                if (3 == compare(data, l.byte_offset + 2, 55, 3)) {
                    if (l.isDiscrete(data, TokenIdentifier, 5)) {
                        /*false*/
                        l.setToken(TokenSymbol, 5, 5);
                        return 0;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 48) {
            if (data.input[l.byte_offset + 1] == 120) {
                /*0x*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            } else if (data.input[l.byte_offset + 1] == 98) {
                /*0b*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            } else if (data.input[l.byte_offset + 1] == 111) {
                /*0o*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            } else if (data.input[l.byte_offset + 1] == 79) {
                /*0O*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 34) {
            /*"*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 39) {
            /*'*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 116) {
            if (3 == compare(data, l.byte_offset + 1, 96, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*true*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 110) {
            if (3 == compare(data, l.byte_offset + 1, 36, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*null*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 40) {
            /*(*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 98) {
            if (4 == compare(data, l.byte_offset + 1, 73, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*break*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 114) {
            if (5 == compare(data, l.byte_offset + 1, 78, 5)) {
                if (l.isDiscrete(data, TokenIdentifier, 6)) {
                    /*return*/
                    l.setToken(TokenSymbol, 6, 6);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 99) {
            if (7 == compare(data, l.byte_offset + 1, 40, 7)) {
                if (l.isDiscrete(data, TokenIdentifier, 8)) {
                    /*continue*/
                    l.setToken(TokenSymbol, 8, 8);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 108) {
            if (3 == compare(data, l.byte_offset + 1, 64, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*loop*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 123) {
            /*{*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 95) {
            /*_*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 36) {
            /*$*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        }
        if (l.isSym(true, data)) {
            return 0;
        } else if (l.isNum(data)) {
            return 0;
        } else if (l.isUniID(data)) {
            return 1;
        }
        return -1;
    }
    function sym_map_67674cb228ad79e2(l, data) {
        /*; <<-- if match sym == fn num 0x 0b 0o 0O " ' true false null ( break return continue loop { ) id _ $ [*/
        if (data.input[l.byte_offset + 0] == 59) {
            /*;*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 60) {
            if (3 == compare(data, l.byte_offset + 1, 21, 3)) {
                /*<<--*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 105) {
            if (data.input[l.byte_offset + 1] == 102) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*if*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 109) {
            if (4 == compare(data, l.byte_offset + 1, 68, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*match*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 61) {
            if (data.input[l.byte_offset + 1] == 61) {
                /*==*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*fn*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 1;
                }
            } else if (data.input[l.byte_offset + 1] == 97) {
                if (3 == compare(data, l.byte_offset + 2, 55, 3)) {
                    if (l.isDiscrete(data, TokenIdentifier, 5)) {
                        /*false*/
                        l.setToken(TokenSymbol, 5, 5);
                        return 1;
                    }
                }
            }
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
            if (3 == compare(data, l.byte_offset + 1, 96, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*true*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 110) {
            if (3 == compare(data, l.byte_offset + 1, 36, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*null*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 40) {
            /*(*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 98) {
            if (4 == compare(data, l.byte_offset + 1, 73, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*break*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 114) {
            if (5 == compare(data, l.byte_offset + 1, 78, 5)) {
                if (l.isDiscrete(data, TokenIdentifier, 6)) {
                    /*return*/
                    l.setToken(TokenSymbol, 6, 6);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 99) {
            if (7 == compare(data, l.byte_offset + 1, 40, 7)) {
                if (l.isDiscrete(data, TokenIdentifier, 8)) {
                    /*continue*/
                    l.setToken(TokenSymbol, 8, 8);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 108) {
            if (3 == compare(data, l.byte_offset + 1, 64, 3)) {
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
        } else if (data.input[l.byte_offset + 0] == 41) {
            /*)*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 95) {
            /*_*/
            l.setToken(TokenSymbol, 1, 1);
            return 2;
        } else if (data.input[l.byte_offset + 0] == 36) {
            /*$*/
            l.setToken(TokenSymbol, 1, 1);
            return 2;
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 2;
        }
        if (l.isSym(true, data)) {
            return 1;
        } else if (l.isNum(data)) {
            return 1;
        } else if (l.isUniID(data)) {
            return 2;
        }
        return -1;
    }
    function sym_map_6c16c7754ec41e3b(l, data) {
        /*END_OF_FILE ; in ) } , [ str fn*/
        if (data.input[l.byte_offset + 0] == 59) {
            /*;*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 105) {
            if (data.input[l.byte_offset + 1] == 110) {
                /*in*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 41) {
            /*)*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 125) {
            /*}*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 44) {
            /*,*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 115) {
            if (2 == compare(data, l.byte_offset + 1, 48, 2)) {
                /*str*/
                l.setToken(TokenSymbol, 3, 3);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                /*fn*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        }
        if (l.END(data)) {
            return 1;
        }
        return 1;
    }
    function sym_map_78d5b6d9f4631c4b(l, data) {
        /*] : ; ) else in } , str [ fn <<-- id _ $ if match sym == [ fn num 0x 0b 0o 0O " ' true false null ( break return continue loop {*/
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
            if (3 == compare(data, l.byte_offset + 1, 129, 3)) {
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
            if (2 == compare(data, l.byte_offset + 1, 48, 2)) {
                if (l.isDiscrete(data, TokenIdentifier, 3)) {
                    /*str*/
                    l.setToken(TokenSymbol, 3, 3);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*fn*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 1;
                    /*fn*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 1;
                }
            } else if (data.input[l.byte_offset + 1] == 97) {
                if (3 == compare(data, l.byte_offset + 2, 55, 3)) {
                    if (l.isDiscrete(data, TokenIdentifier, 5)) {
                        /*false*/
                        l.setToken(TokenSymbol, 5, 5);
                        return 1;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 60) {
            if (3 == compare(data, l.byte_offset + 1, 21, 3)) {
                /*<<--*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 95) {
            /*_*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 36) {
            /*$*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 109) {
            if (4 == compare(data, l.byte_offset + 1, 68, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*match*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 61) {
            if (data.input[l.byte_offset + 1] == 61) {
                /*==*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
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
            if (3 == compare(data, l.byte_offset + 1, 96, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*true*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 110) {
            if (3 == compare(data, l.byte_offset + 1, 36, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*null*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 40) {
            /*(*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 98) {
            if (4 == compare(data, l.byte_offset + 1, 73, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*break*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 114) {
            if (5 == compare(data, l.byte_offset + 1, 78, 5)) {
                if (l.isDiscrete(data, TokenIdentifier, 6)) {
                    /*return*/
                    l.setToken(TokenSymbol, 6, 6);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 99) {
            if (7 == compare(data, l.byte_offset + 1, 40, 7)) {
                if (l.isDiscrete(data, TokenIdentifier, 8)) {
                    /*continue*/
                    l.setToken(TokenSymbol, 8, 8);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 108) {
            if (3 == compare(data, l.byte_offset + 1, 64, 3)) {
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
        }
        if (l.isUniID(data)) {
            return 1;
        } else if (l.isSym(true, data)) {
            return 1;
        } else if (l.isNum(data)) {
            return 1;
        }
        return -1;
    }
    function sym_map_7b992290c905e3fc(l, data) {
        /*<<-- _ $ if match sym == [ fn num 0x 0b 0o 0O " ' true false null ( break return continue loop { pub priv export mut imut = in ; } , ) ] == else : [ str fn id*/
        if (data.input[l.byte_offset + 0] == 60) {
            if (3 == compare(data, l.byte_offset + 1, 21, 3)) {
                /*<<--*/
                l.setToken(TokenSymbol, 4, 4);
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 95) {
            /*_*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 36) {
            /*$*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 105) {
            if (data.input[l.byte_offset + 1] == 102) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*if*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 0;
                }
            } else if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*in*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 1;
                }
            } else if (data.input[l.byte_offset + 1] == 109) {
                if (2 == compare(data, l.byte_offset + 2, 118, 2)) {
                    if (l.isDiscrete(data, TokenIdentifier, 4)) {
                        /*imut*/
                        l.setToken(TokenSymbol, 4, 4);
                        return 1;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 109) {
            if (data.input[l.byte_offset + 1] == 117) {
                if (data.input[l.byte_offset + 2] == 116) {
                    if (l.isDiscrete(data, TokenIdentifier, 3)) {
                        /*mut*/
                        l.setToken(TokenSymbol, 3, 3);
                        return 1;
                    }
                }
            } else if (data.input[l.byte_offset + 1] == 97) {
                if (3 == compare(data, l.byte_offset + 2, 69, 3)) {
                    if (l.isDiscrete(data, TokenIdentifier, 5)) {
                        /*match*/
                        l.setToken(TokenSymbol, 5, 5);
                        return 0;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 61) {
            if (data.input[l.byte_offset + 1] == 61) {
                /*==*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
                /*==*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
            /*=*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*fn*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 1;
                    /*fn*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 1;
                }
            } else if (data.input[l.byte_offset + 1] == 97) {
                if (3 == compare(data, l.byte_offset + 2, 55, 3)) {
                    if (l.isDiscrete(data, TokenIdentifier, 5)) {
                        /*false*/
                        l.setToken(TokenSymbol, 5, 5);
                        return 0;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 48) {
            if (data.input[l.byte_offset + 1] == 120) {
                /*0x*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            } else if (data.input[l.byte_offset + 1] == 98) {
                /*0b*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            } else if (data.input[l.byte_offset + 1] == 111) {
                /*0o*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            } else if (data.input[l.byte_offset + 1] == 79) {
                /*0O*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 34) {
            /*"*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 39) {
            /*'*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 116) {
            if (3 == compare(data, l.byte_offset + 1, 96, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*true*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 110) {
            if (3 == compare(data, l.byte_offset + 1, 36, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*null*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 40) {
            /*(*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 98) {
            if (4 == compare(data, l.byte_offset + 1, 73, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*break*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 114) {
            if (5 == compare(data, l.byte_offset + 1, 78, 5)) {
                if (l.isDiscrete(data, TokenIdentifier, 6)) {
                    /*return*/
                    l.setToken(TokenSymbol, 6, 6);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 99) {
            if (7 == compare(data, l.byte_offset + 1, 40, 7)) {
                if (l.isDiscrete(data, TokenIdentifier, 8)) {
                    /*continue*/
                    l.setToken(TokenSymbol, 8, 8);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 108) {
            if (3 == compare(data, l.byte_offset + 1, 64, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*loop*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 123) {
            /*{*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 112) {
            if (data.input[l.byte_offset + 1] == 117) {
                if (data.input[l.byte_offset + 2] == 98) {
                    if (l.isDiscrete(data, TokenIdentifier, 3)) {
                        /*pub*/
                        l.setToken(TokenSymbol, 3, 3);
                        return 1;
                    }
                }
            } else if (data.input[l.byte_offset + 1] == 114) {
                if (2 == compare(data, l.byte_offset + 2, 101, 2)) {
                    if (l.isDiscrete(data, TokenIdentifier, 4)) {
                        /*priv*/
                        l.setToken(TokenSymbol, 4, 4);
                        return 1;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 101) {
            if (data.input[l.byte_offset + 1] == 108) {
                if (2 == compare(data, l.byte_offset + 2, 130, 2)) {
                    if (l.isDiscrete(data, TokenIdentifier, 4)) {
                        /*else*/
                        l.setToken(TokenSymbol, 4, 4);
                        return 1;
                    }
                }
            } else if (data.input[l.byte_offset + 1] == 120) {
                if (4 == compare(data, l.byte_offset + 2, 59, 4)) {
                    if (l.isDiscrete(data, TokenIdentifier, 6)) {
                        /*export*/
                        l.setToken(TokenSymbol, 6, 6);
                        return 1;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 59) {
            /*;*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 125) {
            /*}*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 44) {
            /*,*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 41) {
            /*)*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 93) {
            /*]*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 58) {
            /*:*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 115) {
            if (2 == compare(data, l.byte_offset + 1, 48, 2)) {
                if (l.isDiscrete(data, TokenIdentifier, 3)) {
                    /*str*/
                    l.setToken(TokenSymbol, 3, 3);
                    return 1;
                }
            }
        }
        if (l.isSym(true, data)) {
            return 0;
        } else if (l.isNum(data)) {
            return 0;
        } else if (l.isUniID(data)) {
            return 2;
        }
        return -1;
    }
    function sym_map_913e141603679c43(l, data) {
        /*: { is ( = in ; } ) , [ str id _ $ fn . sym == else ] END_OF_FILE*/
        if (data.input[l.byte_offset + 0] == 58) {
            /*:*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 123) {
            /*{*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 105) {
            if (data.input[l.byte_offset + 1] == 115) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*is*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 1;
                }
            } else if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*in*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 40) {
            /*(*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 61) {
            if (data.input[l.byte_offset + 1] == 61) {
                /*==*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
            /*=*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 59) {
            /*;*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 125) {
            /*}*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 41) {
            /*)*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 44) {
            /*,*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 115) {
            if (2 == compare(data, l.byte_offset + 1, 48, 2)) {
                if (l.isDiscrete(data, TokenIdentifier, 3)) {
                    /*str*/
                    l.setToken(TokenSymbol, 3, 3);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 95) {
            /*_*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 36) {
            /*$*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*fn*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 46) {
            /*.*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 101) {
            if (3 == compare(data, l.byte_offset + 1, 129, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*else*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 93) {
            /*]*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        }
        if (l.isUniID(data)) {
            return 1;
        } else if (l.isSym(true, data)) {
            return 1;
        } else if (l.END(data)) {
            return 1;
        }
        return 1;
    }
    function sym_map_937c28530cf66b31(l, data) {
        /*e E*/
        if (data.input[l.byte_offset + 0] == 101) {
            /*e*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 69) {
            /*E*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        }
        return -1;
    }
    function sym_map_957fe013814af5bc(l, data) {
        /*str string f flt u i uint int id _ $*/
        if (data.input[l.byte_offset + 0] == 115) {
            if (data.input[l.byte_offset + 1] == 116) {
                if (data.input[l.byte_offset + 2] == 114) {
                    if (l.isDiscrete(data, TokenIdentifier, 3)) {
                        if (data.input[l.byte_offset + 3] == 105) {
                            if (2 == compare(data, l.byte_offset + 4, 51, 2)) {
                                if (l.isDiscrete(data, TokenIdentifier, 6)) {
                                    /*string*/
                                    l.setToken(TokenSymbol, 6, 6);
                                    return 1;
                                }
                            }
                        }
                        /*str*/
                        l.setToken(TokenSymbol, 3, 3);
                        return 0;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (l.isDiscrete(data, TokenIdentifier, 1)) {
                if (data.input[l.byte_offset + 1] == 108) {
                    if (data.input[l.byte_offset + 2] == 116) {
                        if (l.isDiscrete(data, TokenIdentifier, 3)) {
                            /*flt*/
                            l.setToken(TokenSymbol, 3, 3);
                            return 2;
                        }
                    }
                }
                /*f*/
                l.setToken(TokenSymbol, 1, 1);
                return 2;
            }
        } else if (data.input[l.byte_offset + 0] == 117) {
            if (l.isDiscrete(data, TokenIdentifier, 1)) {
                if (data.input[l.byte_offset + 1] == 105) {
                    if (2 == compare(data, l.byte_offset + 2, 85, 2)) {
                        if (l.isDiscrete(data, TokenIdentifier, 4)) {
                            /*uint*/
                            l.setToken(TokenSymbol, 4, 4);
                            return 3;
                        }
                    }
                }
                /*u*/
                l.setToken(TokenSymbol, 1, 1);
                return 3;
            }
        } else if (data.input[l.byte_offset + 0] == 105) {
            if (l.isDiscrete(data, TokenIdentifier, 1)) {
                if (data.input[l.byte_offset + 1] == 110) {
                    if (data.input[l.byte_offset + 2] == 116) {
                        if (l.isDiscrete(data, TokenIdentifier, 3)) {
                            /*int*/
                            l.setToken(TokenSymbol, 3, 3);
                            return 3;
                        }
                    }
                }
                /*i*/
                l.setToken(TokenSymbol, 1, 1);
                return 3;
            }
        } else if (data.input[l.byte_offset + 0] == 95) {
            /*_*/
            l.setToken(TokenSymbol, 1, 1);
            return 4;
        } else if (data.input[l.byte_offset + 0] == 36) {
            /*$*/
            l.setToken(TokenSymbol, 1, 1);
            return 4;
        }
        if (l.isUniID(data)) {
            return 4;
        }
        return -1;
    }
    function sym_map_9fff07fe93fb5f87(l, data) {
        /*:*/
        if (data.input[l.byte_offset + 0] == 58) {
            /*:*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        }
        return -1;
    }
    function sym_map_a6e19c42d2a4699a(l, data) {
        /*] : ; ) else in } , [ str id _ $ fn END_OF_FILE sym ==*/
        if (data.input[l.byte_offset + 0] == 93) {
            /*]*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 58) {
            /*:*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 59) {
            /*;*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 41) {
            /*)*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 101) {
            if (3 == compare(data, l.byte_offset + 1, 129, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*else*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 105) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*in*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 125) {
            /*}*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 44) {
            /*,*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 115) {
            if (2 == compare(data, l.byte_offset + 1, 48, 2)) {
                if (l.isDiscrete(data, TokenIdentifier, 3)) {
                    /*str*/
                    l.setToken(TokenSymbol, 3, 3);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 95) {
            /*_*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 36) {
            /*$*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*fn*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 61) {
            if (data.input[l.byte_offset + 1] == 61) {
                /*==*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            }
        }
        if (l.isUniID(data)) {
            return 1;
        } else if (l.END(data)) {
            return 1;
        } else if (l.isSym(true, data)) {
            return 0;
        }
        return 1;
    }
    function sym_map_ac795389c7ab64e7(l, data) {
        /*<<-- id _ $ if match sym == [ fn num 0x 0b 0o 0O " ' true false null ( break return continue loop { : else ) ; ] } , in str END_OF_FILE*/
        if (data.input[l.byte_offset + 0] == 60) {
            if (3 == compare(data, l.byte_offset + 1, 21, 3)) {
                /*<<--*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 95) {
            /*_*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 36) {
            /*$*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 105) {
            if (data.input[l.byte_offset + 1] == 102) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*if*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 1;
                }
            } else if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*in*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 109) {
            if (4 == compare(data, l.byte_offset + 1, 68, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*match*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 61) {
            if (data.input[l.byte_offset + 1] == 61) {
                /*==*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*fn*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 1;
                }
            } else if (data.input[l.byte_offset + 1] == 97) {
                if (3 == compare(data, l.byte_offset + 2, 55, 3)) {
                    if (l.isDiscrete(data, TokenIdentifier, 5)) {
                        /*false*/
                        l.setToken(TokenSymbol, 5, 5);
                        return 1;
                    }
                }
            }
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
            if (3 == compare(data, l.byte_offset + 1, 96, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*true*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 110) {
            if (3 == compare(data, l.byte_offset + 1, 36, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*null*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 40) {
            /*(*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 98) {
            if (4 == compare(data, l.byte_offset + 1, 73, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*break*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 114) {
            if (5 == compare(data, l.byte_offset + 1, 78, 5)) {
                if (l.isDiscrete(data, TokenIdentifier, 6)) {
                    /*return*/
                    l.setToken(TokenSymbol, 6, 6);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 99) {
            if (7 == compare(data, l.byte_offset + 1, 40, 7)) {
                if (l.isDiscrete(data, TokenIdentifier, 8)) {
                    /*continue*/
                    l.setToken(TokenSymbol, 8, 8);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 108) {
            if (3 == compare(data, l.byte_offset + 1, 64, 3)) {
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
        } else if (data.input[l.byte_offset + 0] == 58) {
            /*:*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 101) {
            if (3 == compare(data, l.byte_offset + 1, 129, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*else*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 41) {
            /*)*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 59) {
            /*;*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 93) {
            /*]*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 125) {
            /*}*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 44) {
            /*,*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 115) {
            if (2 == compare(data, l.byte_offset + 1, 48, 2)) {
                if (l.isDiscrete(data, TokenIdentifier, 3)) {
                    /*str*/
                    l.setToken(TokenSymbol, 3, 3);
                    return 1;
                }
            }
        }
        if (l.isUniID(data)) {
            return 1;
        } else if (l.isSym(true, data)) {
            return 1;
        } else if (l.isNum(data)) {
            return 1;
        } else if (l.END(data)) {
            return 1;
        }
        return 1;
    }
    function sym_map_b405ff5da734a5dd(l, data) {
        /*e E ws sym == : else ) ; ] } , in [ str id _ $ fn END_OF_FILE*/
        if (data.input[l.byte_offset + 0] == 101) {
            if (l.isDiscrete(data, TokenIdentifier, 1)) {
                if (data.input[l.byte_offset + 1] == 108) {
                    if (2 == compare(data, l.byte_offset + 2, 130, 2)) {
                        if (l.isDiscrete(data, TokenIdentifier, 4)) {
                            /*else*/
                            l.setToken(TokenSymbol, 4, 4);
                            return 1;
                        }
                    }
                }
                /*e*/
                l.setToken(TokenSymbol, 1, 1);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 69) {
            if (l.isDiscrete(data, TokenIdentifier, 1)) {
                /*E*/
                l.setToken(TokenSymbol, 1, 1);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 61) {
            if (data.input[l.byte_offset + 1] == 61) {
                /*==*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 58) {
            /*:*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 41) {
            /*)*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 59) {
            /*;*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 93) {
            /*]*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 125) {
            /*}*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 44) {
            /*,*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 105) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*in*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 115) {
            if (2 == compare(data, l.byte_offset + 1, 48, 2)) {
                if (l.isDiscrete(data, TokenIdentifier, 3)) {
                    /*str*/
                    l.setToken(TokenSymbol, 3, 3);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 95) {
            /*_*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 36) {
            /*$*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*fn*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 1;
                }
            }
        }
        if (l.isSP(true, data)) {
            return 1;
        } else if (l.isSym(true, data)) {
            return 1;
        } else if (l.isUniID(data)) {
            return 1;
        } else if (l.END(data)) {
            return 1;
        }
        return 1;
    }
    function sym_map_b5b0535fb6bbe10a(l, data) {
        /*] : ; ) else in } , str [ fn <<-- if match sym == num 0x 0b 0o 0O " ' true false null ( break return continue loop { [ id _ $ fn*/
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
            if (3 == compare(data, l.byte_offset + 1, 129, 3)) {
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
            if (2 == compare(data, l.byte_offset + 1, 48, 2)) {
                if (l.isDiscrete(data, TokenIdentifier, 3)) {
                    /*str*/
                    l.setToken(TokenSymbol, 3, 3);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 2;
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 2;
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*fn*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 2;
                    /*fn*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 2;
                }
            } else if (data.input[l.byte_offset + 1] == 97) {
                if (3 == compare(data, l.byte_offset + 2, 55, 3)) {
                    if (l.isDiscrete(data, TokenIdentifier, 5)) {
                        /*false*/
                        l.setToken(TokenSymbol, 5, 5);
                        return 1;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 60) {
            if (3 == compare(data, l.byte_offset + 1, 21, 3)) {
                /*<<--*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 109) {
            if (4 == compare(data, l.byte_offset + 1, 68, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*match*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 61) {
            if (data.input[l.byte_offset + 1] == 61) {
                /*==*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
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
            if (3 == compare(data, l.byte_offset + 1, 96, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*true*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 110) {
            if (3 == compare(data, l.byte_offset + 1, 36, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*null*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 40) {
            /*(*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 98) {
            if (4 == compare(data, l.byte_offset + 1, 73, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*break*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 114) {
            if (5 == compare(data, l.byte_offset + 1, 78, 5)) {
                if (l.isDiscrete(data, TokenIdentifier, 6)) {
                    /*return*/
                    l.setToken(TokenSymbol, 6, 6);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 99) {
            if (7 == compare(data, l.byte_offset + 1, 40, 7)) {
                if (l.isDiscrete(data, TokenIdentifier, 8)) {
                    /*continue*/
                    l.setToken(TokenSymbol, 8, 8);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 108) {
            if (3 == compare(data, l.byte_offset + 1, 64, 3)) {
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
        } else if (data.input[l.byte_offset + 0] == 95) {
            /*_*/
            l.setToken(TokenSymbol, 1, 1);
            return 2;
        } else if (data.input[l.byte_offset + 0] == 36) {
            /*$*/
            l.setToken(TokenSymbol, 1, 1);
            return 2;
        }
        if (l.isSym(true, data)) {
            return 1;
        } else if (l.isNum(data)) {
            return 1;
        } else if (l.isUniID(data)) {
            return 2;
        }
        return -1;
    }
    function sym_map_c4b3dccaa10a8245(l, data) {
        /*<<-- { if match break return continue loop id _ $ sym == [ fn num 0x 0b 0o 0O " ' true false null (*/
        if (data.input[l.byte_offset + 0] == 60) {
            if (3 == compare(data, l.byte_offset + 1, 21, 3)) {
                /*<<--*/
                l.setToken(TokenSymbol, 4, 4);
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 123) {
            /*{*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 105) {
            if (data.input[l.byte_offset + 1] == 102) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*if*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 2;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 109) {
            if (4 == compare(data, l.byte_offset + 1, 68, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*match*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 3;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 98) {
            if (4 == compare(data, l.byte_offset + 1, 73, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*break*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 4;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 114) {
            if (5 == compare(data, l.byte_offset + 1, 78, 5)) {
                if (l.isDiscrete(data, TokenIdentifier, 6)) {
                    /*return*/
                    l.setToken(TokenSymbol, 6, 6);
                    return 5;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 99) {
            if (7 == compare(data, l.byte_offset + 1, 40, 7)) {
                if (l.isDiscrete(data, TokenIdentifier, 8)) {
                    /*continue*/
                    l.setToken(TokenSymbol, 8, 8);
                    return 6;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 108) {
            if (3 == compare(data, l.byte_offset + 1, 64, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*loop*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 7;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 95) {
            /*_*/
            l.setToken(TokenSymbol, 1, 1);
            return 8;
        } else if (data.input[l.byte_offset + 0] == 36) {
            /*$*/
            l.setToken(TokenSymbol, 1, 1);
            return 8;
        } else if (data.input[l.byte_offset + 0] == 61) {
            if (data.input[l.byte_offset + 1] == 61) {
                /*==*/
                l.setToken(TokenSymbol, 2, 2);
                return 9;
            }
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 9;
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*fn*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 9;
                }
            } else if (data.input[l.byte_offset + 1] == 97) {
                if (3 == compare(data, l.byte_offset + 2, 55, 3)) {
                    if (l.isDiscrete(data, TokenIdentifier, 5)) {
                        /*false*/
                        l.setToken(TokenSymbol, 5, 5);
                        return 9;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 48) {
            if (data.input[l.byte_offset + 1] == 120) {
                /*0x*/
                l.setToken(TokenSymbol, 2, 2);
                return 9;
            } else if (data.input[l.byte_offset + 1] == 98) {
                /*0b*/
                l.setToken(TokenSymbol, 2, 2);
                return 9;
            } else if (data.input[l.byte_offset + 1] == 111) {
                /*0o*/
                l.setToken(TokenSymbol, 2, 2);
                return 9;
            } else if (data.input[l.byte_offset + 1] == 79) {
                /*0O*/
                l.setToken(TokenSymbol, 2, 2);
                return 9;
            }
        } else if (data.input[l.byte_offset + 0] == 34) {
            /*"*/
            l.setToken(TokenSymbol, 1, 1);
            return 9;
        } else if (data.input[l.byte_offset + 0] == 39) {
            /*'*/
            l.setToken(TokenSymbol, 1, 1);
            return 9;
        } else if (data.input[l.byte_offset + 0] == 116) {
            if (3 == compare(data, l.byte_offset + 1, 96, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*true*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 9;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 110) {
            if (3 == compare(data, l.byte_offset + 1, 36, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*null*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 9;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 40) {
            /*(*/
            l.setToken(TokenSymbol, 1, 1);
            return 9;
        }
        if (l.isUniID(data)) {
            return 8;
        } else if (l.isSym(true, data)) {
            return 9;
        } else if (l.isNum(data)) {
            return 9;
        }
        return -1;
    }
    function sym_map_c6b39aab330540a5(l, data) {
        /*} ; END_OF_FILE <<-- id _ $ if match sym == [ fn num 0x 0b 0o 0O " ' true false null ( break return continue loop {*/
        if (data.input[l.byte_offset + 0] == 125) {
            /*}*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 59) {
            /*;*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 60) {
            if (3 == compare(data, l.byte_offset + 1, 21, 3)) {
                /*<<--*/
                l.setToken(TokenSymbol, 4, 4);
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 95) {
            /*_*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 36) {
            /*$*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 105) {
            if (data.input[l.byte_offset + 1] == 102) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*if*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 109) {
            if (4 == compare(data, l.byte_offset + 1, 68, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*match*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 61) {
            if (data.input[l.byte_offset + 1] == 61) {
                /*==*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*fn*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 0;
                }
            } else if (data.input[l.byte_offset + 1] == 97) {
                if (3 == compare(data, l.byte_offset + 2, 55, 3)) {
                    if (l.isDiscrete(data, TokenIdentifier, 5)) {
                        /*false*/
                        l.setToken(TokenSymbol, 5, 5);
                        return 0;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 48) {
            if (data.input[l.byte_offset + 1] == 120) {
                /*0x*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            } else if (data.input[l.byte_offset + 1] == 98) {
                /*0b*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            } else if (data.input[l.byte_offset + 1] == 111) {
                /*0o*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            } else if (data.input[l.byte_offset + 1] == 79) {
                /*0O*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 34) {
            /*"*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 39) {
            /*'*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 116) {
            if (3 == compare(data, l.byte_offset + 1, 96, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*true*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 110) {
            if (3 == compare(data, l.byte_offset + 1, 36, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*null*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 40) {
            /*(*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 98) {
            if (4 == compare(data, l.byte_offset + 1, 73, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*break*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 114) {
            if (5 == compare(data, l.byte_offset + 1, 78, 5)) {
                if (l.isDiscrete(data, TokenIdentifier, 6)) {
                    /*return*/
                    l.setToken(TokenSymbol, 6, 6);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 99) {
            if (7 == compare(data, l.byte_offset + 1, 40, 7)) {
                if (l.isDiscrete(data, TokenIdentifier, 8)) {
                    /*continue*/
                    l.setToken(TokenSymbol, 8, 8);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 108) {
            if (3 == compare(data, l.byte_offset + 1, 64, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*loop*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 123) {
            /*{*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        }
        if (l.END(data)) {
            return 1;
        } else if (l.isUniID(data)) {
            return 0;
        } else if (l.isSym(true, data)) {
            return 0;
        } else if (l.isNum(data)) {
            return 0;
        }
        return 1;
    }
    function sym_map_c82afb129e509311(l, data) {
        /*[ . (*/
        if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 46) {
            /*.*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 40) {
            /*(*/
            l.setToken(TokenSymbol, 1, 1);
            return 2;
        }
        return -1;
    }
    function sym_map_cc1c813b4210953a(l, data) {
        /*} ) , ; END_OF_FILE*/
        if (data.input[l.byte_offset + 0] == 125) {
            /*}*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 41) {
            /*)*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 44) {
            /*,*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 59) {
            /*;*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        }
        if (l.END(data)) {
            return 1;
        }
        return 1;
    }
    function sym_map_d72dd77395238df5(l, data) {
        /*<<-- _ $ [ 0x 0b 0o 0O " ' ( == { ] : ; ) } , sym*/
        if (data.input[l.byte_offset + 0] == 60) {
            if (3 == compare(data, l.byte_offset + 1, 21, 3)) {
                /*<<--*/
                l.setToken(TokenSymbol, 4, 4);
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 95) {
            /*_*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 36) {
            /*$*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 48) {
            if (data.input[l.byte_offset + 1] == 120) {
                /*0x*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            } else if (data.input[l.byte_offset + 1] == 98) {
                /*0b*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            } else if (data.input[l.byte_offset + 1] == 111) {
                /*0o*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            } else if (data.input[l.byte_offset + 1] == 79) {
                /*0O*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 34) {
            /*"*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 39) {
            /*'*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 40) {
            /*(*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 61) {
            if (data.input[l.byte_offset + 1] == 61) {
                /*==*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 123) {
            /*{*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 93) {
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
        } else if (data.input[l.byte_offset + 0] == 125) {
            /*}*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 44) {
            /*,*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        }
        if (l.isSym(true, data)) {
            return 1;
        }
        return -1;
    }
    function sym_map_e58af9c6fd146069(l, data) {
        /*: else ) ; ] } , in [ str id _ $ fn END_OF_FILE sym ==*/
        if (data.input[l.byte_offset + 0] == 58) {
            /*:*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 101) {
            if (3 == compare(data, l.byte_offset + 1, 129, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*else*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 41) {
            /*)*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 59) {
            /*;*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 93) {
            /*]*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 125) {
            /*}*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 44) {
            /*,*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 105) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*in*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 115) {
            if (2 == compare(data, l.byte_offset + 1, 48, 2)) {
                if (l.isDiscrete(data, TokenIdentifier, 3)) {
                    /*str*/
                    l.setToken(TokenSymbol, 3, 3);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 95) {
            /*_*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 36) {
            /*$*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*fn*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 61) {
            if (data.input[l.byte_offset + 1] == 61) {
                /*==*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            }
        }
        if (l.isUniID(data)) {
            return 1;
        } else if (l.END(data)) {
            return 1;
        } else if (l.isSym(true, data)) {
            return 0;
        }
        return 1;
    }
    function sym_map_e72378e7190a6ec0(l, data) {
        /*sym ws nl <<-- _ $ == [ 0x 0b 0o 0O " ' ( { : ) ; ] } ,*/
        if (data.input[l.byte_offset + 0] == 60) {
            if (3 == compare(data, l.byte_offset + 1, 21, 3)) {
                /*<<--*/
                l.setToken(TokenSymbol, 4, 4);
                return 2;
            }
        } else if (data.input[l.byte_offset + 0] == 95) {
            /*_*/
            l.setToken(TokenSymbol, 1, 1);
            return 2;
        } else if (data.input[l.byte_offset + 0] == 36) {
            /*$*/
            l.setToken(TokenSymbol, 1, 1);
            return 2;
        } else if (data.input[l.byte_offset + 0] == 61) {
            if (data.input[l.byte_offset + 1] == 61) {
                /*==*/
                l.setToken(TokenSymbol, 2, 2);
                return 2;
            }
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 2;
        } else if (data.input[l.byte_offset + 0] == 48) {
            if (data.input[l.byte_offset + 1] == 120) {
                /*0x*/
                l.setToken(TokenSymbol, 2, 2);
                return 2;
            } else if (data.input[l.byte_offset + 1] == 98) {
                /*0b*/
                l.setToken(TokenSymbol, 2, 2);
                return 2;
            } else if (data.input[l.byte_offset + 1] == 111) {
                /*0o*/
                l.setToken(TokenSymbol, 2, 2);
                return 2;
            } else if (data.input[l.byte_offset + 1] == 79) {
                /*0O*/
                l.setToken(TokenSymbol, 2, 2);
                return 2;
            }
        } else if (data.input[l.byte_offset + 0] == 34) {
            /*"*/
            l.setToken(TokenSymbol, 1, 1);
            return 2;
        } else if (data.input[l.byte_offset + 0] == 39) {
            /*'*/
            l.setToken(TokenSymbol, 1, 1);
            return 2;
        } else if (data.input[l.byte_offset + 0] == 40) {
            /*(*/
            l.setToken(TokenSymbol, 1, 1);
            return 2;
        } else if (data.input[l.byte_offset + 0] == 123) {
            /*{*/
            l.setToken(TokenSymbol, 1, 1);
            return 2;
        } else if (data.input[l.byte_offset + 0] == 58) {
            /*:*/
            l.setToken(TokenSymbol, 1, 1);
            return 2;
        } else if (data.input[l.byte_offset + 0] == 41) {
            /*)*/
            l.setToken(TokenSymbol, 1, 1);
            return 2;
        } else if (data.input[l.byte_offset + 0] == 59) {
            /*;*/
            l.setToken(TokenSymbol, 1, 1);
            return 2;
        } else if (data.input[l.byte_offset + 0] == 93) {
            /*]*/
            l.setToken(TokenSymbol, 1, 1);
            return 2;
        } else if (data.input[l.byte_offset + 0] == 125) {
            /*}*/
            l.setToken(TokenSymbol, 1, 1);
            return 2;
        } else if (data.input[l.byte_offset + 0] == 44) {
            /*,*/
            l.setToken(TokenSymbol, 1, 1);
            return 2;
        }
        if (l.isSym(true, data)) {
            return 0;
        } else if (nocap_108e16629a73e761(l)/*[ws]*/) {
            return 1;
        } else if (nocap_9b1ef04606bbaa09(l)/*[nl]*/) {
            return 1;
        }
        return -1;
    }
    function sym_map_eeb5218ed312146c(l, data) {
        /*else*/
        if (data.input[l.byte_offset + 0] == 101) {
            if (3 == compare(data, l.byte_offset + 1, 129, 3)) {
                /*else*/
                l.setToken(TokenSymbol, 4, 4);
                return 0;
            }
        }
        return -1;
    }
    function sym_map_f1b7f378696f9453(l, data) {
        /*; in [ str id _ $ fn } , ) END_OF_FILE*/
        if (data.input[l.byte_offset + 0] == 59) {
            /*;*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 105) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*in*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 115) {
            if (2 == compare(data, l.byte_offset + 1, 48, 2)) {
                if (l.isDiscrete(data, TokenIdentifier, 3)) {
                    /*str*/
                    l.setToken(TokenSymbol, 3, 3);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 95) {
            /*_*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 36) {
            /*$*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*fn*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 125) {
            /*}*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 44) {
            /*,*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 41) {
            /*)*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        }
        if (l.isUniID(data)) {
            return 1;
        } else if (l.END(data)) {
            return 1;
        }
        return 1;
    }
    function sym_map_f52063216c04ca2c(l, data) {
        /*in ; } , == ) sym ] else : [ str fn END_OF_FILE ( . =*/
        if (data.input[l.byte_offset + 0] == 105) {
            if (data.input[l.byte_offset + 1] == 110) {
                /*in*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 59) {
            /*;*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 125) {
            /*}*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 44) {
            /*,*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 61) {
            if (data.input[l.byte_offset + 1] == 61) {
                /*==*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            }
            /*=*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 41) {
            /*)*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 93) {
            /*]*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 101) {
            if (3 == compare(data, l.byte_offset + 1, 129, 3)) {
                /*else*/
                l.setToken(TokenSymbol, 4, 4);
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 58) {
            /*:*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 115) {
            if (2 == compare(data, l.byte_offset + 1, 48, 2)) {
                /*str*/
                l.setToken(TokenSymbol, 3, 3);
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                /*fn*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 40) {
            /*(*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 46) {
            /*.*/
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        }
        if (l.isSym(true, data)) {
            return 0;
        } else if (l.END(data)) {
            return 0;
        }
        return 1;
    }
    function sym_map_f58418e3a6868944(l, data) {
        /*in ; } ) , [ str id _ $ fn END_OF_FILE*/
        if (data.input[l.byte_offset + 0] == 105) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*in*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 59) {
            /*;*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 125) {
            /*}*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 41) {
            /*)*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 44) {
            /*,*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 115) {
            if (2 == compare(data, l.byte_offset + 1, 48, 2)) {
                if (l.isDiscrete(data, TokenIdentifier, 3)) {
                    /*str*/
                    l.setToken(TokenSymbol, 3, 3);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 95) {
            /*_*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 36) {
            /*$*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*fn*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 1;
                }
            }
        }
        if (l.isUniID(data)) {
            return 1;
        } else if (l.END(data)) {
            return 1;
        }
        return 1;
    }
    function sym_map_f7132f7e7856eabb(l, data) {
        /*{ is : [ . ( = sym == else ) ; ] } , in str fn END_OF_FILE*/
        if (data.input[l.byte_offset + 0] == 123) {
            /*{*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 105) {
            if (data.input[l.byte_offset + 1] == 115) {
                /*is*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            } else if (data.input[l.byte_offset + 1] == 110) {
                /*in*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 58) {
            /*:*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 46) {
            /*.*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 40) {
            /*(*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 61) {
            if (data.input[l.byte_offset + 1] == 61) {
                /*==*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
            /*=*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 101) {
            if (3 == compare(data, l.byte_offset + 1, 129, 3)) {
                /*else*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 41) {
            /*)*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 59) {
            /*;*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 93) {
            /*]*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 125) {
            /*}*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 44) {
            /*,*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 115) {
            if (2 == compare(data, l.byte_offset + 1, 48, 2)) {
                /*str*/
                l.setToken(TokenSymbol, 3, 3);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                /*fn*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        }
        if (l.isSym(true, data)) {
            return 1;
        } else if (l.END(data)) {
            return 1;
        }
        return 1;
    }
    function sym_map_f73cca45da5bbfaa(l, data) {
        /*<<-- id _ $ [ fn num 0x 0b 0o 0O " ' true false null ( if match sym == break return continue loop { ] : ; ) else in } , str END_OF_FILE*/
        if (data.input[l.byte_offset + 0] == 60) {
            if (3 == compare(data, l.byte_offset + 1, 21, 3)) {
                /*<<--*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 95) {
            /*_*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 36) {
            /*$*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*fn*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 1;
                }
            } else if (data.input[l.byte_offset + 1] == 97) {
                if (3 == compare(data, l.byte_offset + 2, 55, 3)) {
                    if (l.isDiscrete(data, TokenIdentifier, 5)) {
                        /*false*/
                        l.setToken(TokenSymbol, 5, 5);
                        return 1;
                    }
                }
            }
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
            if (3 == compare(data, l.byte_offset + 1, 96, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*true*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 110) {
            if (3 == compare(data, l.byte_offset + 1, 36, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*null*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 40) {
            /*(*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 105) {
            if (data.input[l.byte_offset + 1] == 102) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*if*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 1;
                }
            } else if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*in*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 109) {
            if (4 == compare(data, l.byte_offset + 1, 68, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*match*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 61) {
            if (data.input[l.byte_offset + 1] == 61) {
                /*==*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 98) {
            if (4 == compare(data, l.byte_offset + 1, 73, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*break*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 114) {
            if (5 == compare(data, l.byte_offset + 1, 78, 5)) {
                if (l.isDiscrete(data, TokenIdentifier, 6)) {
                    /*return*/
                    l.setToken(TokenSymbol, 6, 6);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 99) {
            if (7 == compare(data, l.byte_offset + 1, 40, 7)) {
                if (l.isDiscrete(data, TokenIdentifier, 8)) {
                    /*continue*/
                    l.setToken(TokenSymbol, 8, 8);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 108) {
            if (3 == compare(data, l.byte_offset + 1, 64, 3)) {
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
        } else if (data.input[l.byte_offset + 0] == 93) {
            /*]*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 58) {
            /*:*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 59) {
            /*;*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 41) {
            /*)*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 101) {
            if (3 == compare(data, l.byte_offset + 1, 129, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*else*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 125) {
            /*}*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 44) {
            /*,*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 115) {
            if (2 == compare(data, l.byte_offset + 1, 48, 2)) {
                if (l.isDiscrete(data, TokenIdentifier, 3)) {
                    /*str*/
                    l.setToken(TokenSymbol, 3, 3);
                    return 1;
                }
            }
        }
        if (l.isUniID(data)) {
            return 1;
        } else if (l.isNum(data)) {
            return 1;
        } else if (l.isSym(true, data)) {
            return 1;
        } else if (l.END(data)) {
            return 1;
        }
        return 1;
    }
    function sym_map_fb13671295552b43(l, data) {
        /*in ; } , == ) sym ] else : [ str fn END_OF_FILE*/
        if (data.input[l.byte_offset + 0] == 105) {
            if (data.input[l.byte_offset + 1] == 110) {
                /*in*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 59) {
            /*;*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 125) {
            /*}*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 44) {
            /*,*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 61) {
            if (data.input[l.byte_offset + 1] == 61) {
                /*==*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 41) {
            /*)*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 93) {
            /*]*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 101) {
            if (3 == compare(data, l.byte_offset + 1, 129, 3)) {
                /*else*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 58) {
            /*:*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 115) {
            if (2 == compare(data, l.byte_offset + 1, 48, 2)) {
                /*str*/
                l.setToken(TokenSymbol, 3, 3);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                /*fn*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        }
        if (l.isSym(true, data)) {
            return 1;
        } else if (l.END(data)) {
            return 1;
        }
        return 1;
    }
    function tk_2c97aec756dbfad0(l, data) {
        if (/*[0b]*/cmpr_set(l, data, 114, 2, 2)) {

            //This assumes the token production does not fork

            // preserve the current state of the data
            const stack_ptr = data.stack_ptr;
            const input_ptr = data.input_ptr;
            const state = data.state;
            const copy = l.copy();

            pushFN(data, $def$binary_token);
            data.state = 0;

            let ACTIVE = true;

            while (ACTIVE) {
                ACTIVE = false;
                ACTIVE = stepKernel(data, stack_ptr + 1);
            }

            data.state = state;

            if (data.prod == 92) {
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
    function tk_57ef2c884ceea1ad(l, data) {
        if (dt_bc3480b75045e0d0(l, data)) {

            //This assumes the token production does not fork

            // preserve the current state of the data
            const stack_ptr = data.stack_ptr;
            const input_ptr = data.input_ptr;
            const state = data.state;
            const copy = l.copy();

            pushFN(data, $def$octal_token);
            data.state = 0;

            let ACTIVE = true;

            while (ACTIVE) {
                ACTIVE = false;
                ACTIVE = stepKernel(data, stack_ptr + 1);
            }

            data.state = state;

            if (data.prod == 96) {
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
    function tk_6e20a89e0ac3d8c3(l, data) {
        if (((l.current_byte == 95/*[_]*/) || (l.current_byte == 36/*[$]*/)) || l.isUniID(data)) {

            //This assumes the token production does not fork

            // preserve the current state of the data
            const stack_ptr = data.stack_ptr;
            const input_ptr = data.input_ptr;
            const state = data.state;
            const copy = l.copy();

            pushFN(data, $def$identifier_symbols);
            data.state = 0;

            let ACTIVE = true;

            while (ACTIVE) {
                ACTIVE = false;
                ACTIVE = stepKernel(data, stack_ptr + 1);
            }

            data.state = state;

            if (data.prod == 107) {
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
    function tk_8a282674634e41f8(l, data) {
        if (dt_6ae31dd85a62ef5c(l, data) || l.isNum(data)) {

            //This assumes the token production does not fork

            // preserve the current state of the data
            const stack_ptr = data.stack_ptr;
            const input_ptr = data.input_ptr;
            const state = data.state;
            const copy = l.copy();

            pushFN(data, $num_tok);
            data.state = 0;

            let ACTIVE = true;

            while (ACTIVE) {
                ACTIVE = false;
                ACTIVE = stepKernel(data, stack_ptr + 1);
            }

            data.state = state;

            if (data.prod == 62) {
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
    function tk_9b328de7de7e3e1d(l, data) {
        if (((l.current_byte == 95/*[_]*/) || (l.current_byte == 36/*[$]*/)) || l.isUniID(data)) {

            //This assumes the token production does not fork

            // preserve the current state of the data
            const stack_ptr = data.stack_ptr;
            const input_ptr = data.input_ptr;
            const state = data.state;
            const copy = l.copy();

            pushFN(data, $identifier_token);
            data.state = 0;

            let ACTIVE = true;

            while (ACTIVE) {
                ACTIVE = false;
                ACTIVE = stepKernel(data, stack_ptr + 1);
            }

            data.state = state;

            if (data.prod == 48) {
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
    function tk_bc911c1d17be48bc(l, data) {
        if (/*[0x]*/cmpr_set(l, data, 27, 2, 2)) {

            //This assumes the token production does not fork

            // preserve the current state of the data
            const stack_ptr = data.stack_ptr;
            const input_ptr = data.input_ptr;
            const state = data.state;
            const copy = l.copy();

            pushFN(data, $def$hex_token);
            data.state = 0;

            let ACTIVE = true;

            while (ACTIVE) {
                ACTIVE = false;
                ACTIVE = stepKernel(data, stack_ptr + 1);
            }

            data.state = state;

            if (data.prod == 89) {
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
    function tk_c36d1187450f8760(l, data) {
        if ((l.current_byte == 34/*["]*/) || (l.current_byte == 39/*[']*/)) {

            //This assumes the token production does not fork

            // preserve the current state of the data
            const stack_ptr = data.stack_ptr;
            const input_ptr = data.input_ptr;
            const state = data.state;
            const copy = l.copy();

            pushFN(data, $string);
            data.state = 0;

            let ACTIVE = true;

            while (ACTIVE) {
                ACTIVE = false;
                ACTIVE = stepKernel(data, stack_ptr + 1);
            }

            data.state = state;

            if (data.prod == 60) {
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
    function tk_d5febc993465556c(l, data) {
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
    function tk_eee45d92b1f1c08f(l, data) {
        if (l.isNum(data)) {

            //This assumes the token production does not fork

            // preserve the current state of the data
            const stack_ptr = data.stack_ptr;
            const input_ptr = data.input_ptr;
            const state = data.state;
            const copy = l.copy();

            pushFN(data, $def$scientific_token);
            data.state = 0;

            let ACTIVE = true;

            while (ACTIVE) {
                ACTIVE = false;
                ACTIVE = stepKernel(data, stack_ptr + 1);
            }

            data.state = state;

            if (data.prod == 84) {
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
    function tk_f410c95e1b769980(l, data) {
        if (((l.current_byte == 95/*[_]*/) || (l.current_byte == 36/*[$]*/)) || l.isUniID(data)) {

            //This assumes the token production does not fork

            // preserve the current state of the data
            const stack_ptr = data.stack_ptr;
            const input_ptr = data.input_ptr;
            const state = data.state;
            const copy = l.copy();

            pushFN(data, $def$js_id_symbols);
            data.state = 0;

            let ACTIVE = true;

            while (ACTIVE) {
                ACTIVE = false;
                ACTIVE = stepKernel(data, stack_ptr + 1);
            }

            data.state = state;

            if (data.prod == 105) {
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
/*production name: skribble
            grammar index: 0
            bodies:
	0:0 skribble=>• module - 
            compile time: 16.035ms*/;
    function $skribble(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*0:0 skribble=>• module*/
        puid |= 1;
        pushFN(data, branch_0fdc5c5b577f7e48);
        pushFN(data, $module);
        return puid;
        return -1;
    }
    function $skribble_reducer(l, data, state, prod, puid) {
        if (1 == puid) {
            /*0:0 skribble=>module •*/
            add_reduce(state, data, 1, 1);
        }
        return 0;
    }
/*production name: module_group_02_100
            grammar index: 1
            bodies:
	1:1 module_group_02_100=>• statements - 
            compile time: 11.969ms*/;
    function $module_group_02_100(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*1:1 module_group_02_100=>• statements*/
        puid |= 1;
        pushFN(data, branch_e6ca468c39009342);
        pushFN(data, $statements);
        return puid;
        return -1;
    }
    function $module_group_02_100_reducer(l, data, state, prod, puid) {
        return 1;
    }
/*production name: module
            grammar index: 3
            bodies:
	3:4 module=>• module module_group_02_100 - 
		3:5 module=>• module_group_02_100 - 
            compile time: 26.775ms*/;
    function $module(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*3:5 module=>• module_group_02_100*/
        puid |= 2;
        pushFN(data, branch_bbaaf5e2ac261f99);
        pushFN(data, $statements);
        return puid;
        return -1;
    }
    function $module_goto(l, data, state, prod, puid) {
        while (1) {
            /*3:4 module=>module • module_group_02_100
            0:0 skribble=>module •*/
            /*3:4 module=>module • module_group_02_100
            0:0 skribble=>module •*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            if (((((((/*[import]*/cmpr_set(l, data, 29, 6, 6) ||/*[cls]*/cmpr_set(l, data, 122, 3, 3)) ||/*[str]*/cmpr_set(l, data, 47, 3, 3)) ||/*[fn]*/cmpr_set(l, data, 144, 2, 2)) ||/*[ns]*/cmpr_set(l, data, 120, 2, 2)) ||/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) || assert_ascii(l, 0x0, 0x10, 0x88000000, 0x0)) || l.isUniID(data)) {
                pushFN(data, branch_8de46b48db2ae3fb);
                return branch_639c99feb0a972f9(l, data, state, prod, 1);
            }
            break;
        }
        return prod == 3 ? prod : -1;
    }
    function $module_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            /*3:4 module=>module module_group_02_100 •*/
            add_reduce(state, data, 2, 2);
        } else if (2 == puid) {
            /*3:5 module=>module_group_02_100 •*/
            add_reduce(state, data, 1, 3);
        }
        return 3;
    }
/*production name: statements
            grammar index: 4
            bodies:
	4:6 statements=>• import - 
		4:7 statements=>• class - 
		4:8 statements=>• primitive_declaration ; - 
		4:9 statements=>• struct - 
		4:10 statements=>• function - 
		4:11 statements=>• namespace - 
		4:12 statements=>• template - 
            compile time: 839.63ms*/;
    function $statements(l, data, state, prod, puid) {
        /*4:6 statements=>• import
        50:144 modifier_list=>• [ modifier_list_HC_listbody1_120 ]
        4:7 statements=>• class
        4:8 statements=>• primitive_declaration ;
        4:9 statements=>• struct
        4:10 statements=>• function
        4:11 statements=>• namespace
        4:12 statements=>• template*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 91/*[[]*/) {
            pushFN(data, branch_28c5dc3955a9ede3);
            return branch_73bacf9dd4cbfee8(l, data, state, prod, 1);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) {
            pushFN(data, branch_29bbdf58183bc8d7);
            return branch_607fc33f425e8f70(l, data, state, prod, 128);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (/*[import]*/cmpr_set(l, data, 29, 6, 6)) {
            pushFN(data, branch_29bbdf58183bc8d7);
            return branch_c68c0a8454fbe44c(l, data, state, prod, 1);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (/*[cls]*/cmpr_set(l, data, 122, 3, 3)) {
            pushFN(data, branch_29bbdf58183bc8d7);
            return branch_86e570eff6659ab4(l, data, state, prod, 2);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (/*[str]*/cmpr_set(l, data, 47, 3, 3)) {
            pushFN(data, branch_29bbdf58183bc8d7);
            return branch_4ec36f9dc7352267(l, data, state, prod, 16);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (/*[fn]*/cmpr_set(l, data, 144, 2, 2)) {
            pushFN(data, branch_29bbdf58183bc8d7);
            return branch_1c3acec66e63a26a(l, data, state, prod, 32);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (/*[ns]*/cmpr_set(l, data, 120, 2, 2)) {
            pushFN(data, branch_29bbdf58183bc8d7);
            return branch_d7bf2b5a6d0bef79(l, data, state, prod, 64);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (((l.current_byte == 95/*[_]*/) || (l.current_byte == 36/*[$]*/)) || l.isUniID(data)) {
            pushFN(data, branch_29bbdf58183bc8d7);
            return branch_94c7d1724080d2cb(l, data, state, prod, 4);
        }
        return -1;
    }
    function $statements_goto(l, data, state, prod, puid) {
        switch (prod) {
            case 43:
                /*4:8 statements=>primitive_declaration • ;*/
                /*4:8 statements=>primitive_declaration • ;*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                if (l.current_byte == 59/*[;]*/) {
                    consume(l, data, state);
                    puid |= 8;
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                    /*4:8 statements=>primitive_declaration ; •*/
                    add_reduce(state, data, 2, 4);
                    pushFN(data, $statements_goto);
                    return 4;
                }
                break;
            case 50:
                /*11:24 class=>modifier_list • cls identifier class_group_113_103 { class_HC_listbody1_105 }
                11:26 class=>modifier_list • cls identifier { class_HC_listbody1_105 }
                11:27 class=>modifier_list • cls identifier class_group_113_103 { }
                11:30 class=>modifier_list • cls identifier { }
                43:126 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_170_116
                43:128 primitive_declaration=>modifier_list • identifier : type
                12:32 struct=>modifier_list • str identifier { parameters }
                12:34 struct=>modifier_list • str identifier { }
                13:36 function=>modifier_list • fn identifier : type ( parameters ) { expression_statements }
                13:38 function=>modifier_list • fn identifier : type ( ) { expression_statements }
                13:39 function=>modifier_list • fn identifier : type ( parameters ) { }
                13:42 function=>modifier_list • fn identifier : type ( ) { }*/
                /*11:24 class=>modifier_list • cls identifier class_group_113_103 { class_HC_listbody1_105 }
                11:26 class=>modifier_list • cls identifier { class_HC_listbody1_105 }
                11:27 class=>modifier_list • cls identifier class_group_113_103 { }
                11:30 class=>modifier_list • cls identifier { }
                43:126 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_170_116
                43:128 primitive_declaration=>modifier_list • identifier : type
                12:32 struct=>modifier_list • str identifier { parameters }
                12:34 struct=>modifier_list • str identifier { }
                13:36 function=>modifier_list • fn identifier : type ( parameters ) { expression_statements }
                13:38 function=>modifier_list • fn identifier : type ( ) { expression_statements }
                13:39 function=>modifier_list • fn identifier : type ( parameters ) { }
                13:42 function=>modifier_list • fn identifier : type ( ) { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if (/*[cls]*/cmpr_set(l, data, 122, 3, 3)) {
                    /*11:24 class=>modifier_list • cls identifier class_group_113_103 { class_HC_listbody1_105 }
                    11:26 class=>modifier_list • cls identifier { class_HC_listbody1_105 }
                    11:27 class=>modifier_list • cls identifier class_group_113_103 { }
                    11:30 class=>modifier_list • cls identifier { }*/
                    /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                    consume(l, data, state);
                    puid |= 2;
                    /*11:24 class=>modifier_list cls • identifier class_group_113_103 { class_HC_listbody1_105 }
                    11:26 class=>modifier_list cls • identifier { class_HC_listbody1_105 }
                    11:27 class=>modifier_list cls • identifier class_group_113_103 { }
                    11:30 class=>modifier_list cls • identifier { }*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    pushFN(data, branch_583e211f0ea538e1);
                    pushFN(data, $identifier);
                    puid |= 4;
                    return puid;
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                } else if (/*[str]*/cmpr_set(l, data, 47, 3, 3)) {
                    /*12:32 struct=>modifier_list • str identifier { parameters }
                    12:34 struct=>modifier_list • str identifier { }*/
                    /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                    consume(l, data, state);
                    puid |= 2;
                    /*12:32 struct=>modifier_list str • identifier { parameters }
                    12:34 struct=>modifier_list str • identifier { }*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    pushFN(data, branch_dd54f6894102006d);
                    pushFN(data, $identifier);
                    puid |= 4;
                    return puid;
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                } else if (/*[fn]*/cmpr_set(l, data, 144, 2, 2)) {
                    /*13:36 function=>modifier_list • fn identifier : type ( parameters ) { expression_statements }
                    13:38 function=>modifier_list • fn identifier : type ( ) { expression_statements }
                    13:39 function=>modifier_list • fn identifier : type ( parameters ) { }
                    13:42 function=>modifier_list • fn identifier : type ( ) { }*/
                    /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                    consume(l, data, state);
                    puid |= 2;
                    /*13:36 function=>modifier_list fn • identifier : type ( parameters ) { expression_statements }
                    13:38 function=>modifier_list fn • identifier : type ( ) { expression_statements }
                    13:39 function=>modifier_list fn • identifier : type ( parameters ) { }
                    13:42 function=>modifier_list fn • identifier : type ( ) { }*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    pushFN(data, branch_3deeecd660467dae);
                    pushFN(data, $identifier);
                    puid |= 4;
                    return puid;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if (((l.current_byte == 95/*[_]*/) || (l.current_byte == 36/*[$]*/)) || l.isUniID(data)) {
                    /*43:126 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_170_116
                    43:128 primitive_declaration=>modifier_list • identifier : type*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    pushFN(data, branch_72ba0bf2baa7d429);
                    pushFN(data, $identifier);
                    puid |= 2;
                    return puid;
                }
                break;
            default:
                break;
        }
        return prod == 4 ? prod : -1;
    }
    function $statements_reducer(l, data, state, prod, puid) {
        if (12 == puid) {
            /*4:8 statements=>primitive_declaration ; •*/
            add_reduce(state, data, 2, 4);
        } else if (128 == puid) {
            /*4:12 statements=>template •*/
            add_reduce(state, data, 1, 5);
        }
        return 4;
    }
/*production name: import
            grammar index: 5
            bodies:
	5:13 import=>• import tk:string - 
            compile time: 16.435ms*/;
    function $import(l, data, state, prod, puid) {
        /*5:13 import=>• import tk:string*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (/*[import]*/cmpr_set(l, data, 29, 6, 6)) {
            consume(l, data, state);
            puid |= 1;
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*5:13 import=>import • tk:string*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            puid |= 2;
            if (tk_c36d1187450f8760(l, data) && consume(l, data, state)) {
                add_reduce(state, data, 2, 0);
                return 5;
            }
        }
        return -1;
    }
    function $import_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            /*5:13 import=>import tk:string •*/
            add_reduce(state, data, 2, 0);
        }
        return 5;
    }
/*production name: namespace_HC_listbody3_102
            grammar index: 6
            bodies:
	6:14 namespace_HC_listbody3_102=>• namespace_HC_listbody3_102 statements - 
		6:15 namespace_HC_listbody3_102=>• statements - 
            compile time: 29.465ms*/;
    function $namespace_HC_listbody3_102(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*6:15 namespace_HC_listbody3_102=>• statements*/
        puid |= 2;
        pushFN(data, branch_cc9e8eab54dacbec);
        pushFN(data, $statements);
        return puid;
        return -1;
    }
    function $namespace_HC_listbody3_102_goto(l, data, state, prod, puid) {
        /*6:14 namespace_HC_listbody3_102=>namespace_HC_listbody3_102 • statements*/
        /*6:14 namespace_HC_listbody3_102=>namespace_HC_listbody3_102 • statements
        7:16 namespace=>ns identifier { namespace_HC_listbody3_102 • }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (((((((/*[import]*/cmpr_set(l, data, 29, 6, 6) ||/*[cls]*/cmpr_set(l, data, 122, 3, 3)) ||/*[str]*/cmpr_set(l, data, 47, 3, 3)) ||/*[fn]*/cmpr_set(l, data, 144, 2, 2)) ||/*[ns]*/cmpr_set(l, data, 120, 2, 2)) ||/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) || assert_ascii(l, 0x0, 0x10, 0x88000000, 0x0)) || l.isUniID(data)) {
            pushFN(data, branch_995577f63a2dac51);
            return branch_840435ebd93e9601(l, data, state, prod, 1);
        }
        return prod == 6 ? prod : -1;
    }
    function $namespace_HC_listbody3_102_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            /*6:14 namespace_HC_listbody3_102=>namespace_HC_listbody3_102 statements •*/
            add_reduce(state, data, 2, 2);
        } else if (2 == puid) {
            /*6:15 namespace_HC_listbody3_102=>statements •*/
            add_reduce(state, data, 1, 3);
        }
        return 6;
    }
/*production name: namespace
            grammar index: 7
            bodies:
	7:16 namespace=>• ns identifier { namespace_HC_listbody3_102 } - 
		7:17 namespace=>• ns identifier { } - 
            compile time: 39.445ms*/;
    function $namespace(l, data, state, prod, puid) {
        /*7:16 namespace=>• ns identifier { namespace_HC_listbody3_102 }
        7:17 namespace=>• ns identifier { }*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (/*[ns]*/cmpr_set(l, data, 120, 2, 2)) {
            consume(l, data, state);
            puid |= 1;
            /*7:16 namespace=>ns • identifier { namespace_HC_listbody3_102 }
            7:17 namespace=>ns • identifier { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_670662111815c6bc);
            pushFN(data, $identifier);
            puid |= 2;
            return puid;
        }
        return -1;
    }
    function $namespace_reducer(l, data, state, prod, puid) {
        if (31 == puid) {
            /*7:16 namespace=>ns identifier { namespace_HC_listbody3_102 } •*/
            add_reduce(state, data, 5, 6);
        } else if (23 == puid) {
            /*7:17 namespace=>ns identifier { } •*/
            add_reduce(state, data, 4, 7);
        }
        return 7;
    }
/*production name: class_group_113_103
            grammar index: 8
            bodies:
	8:18 class_group_113_103=>• is θid - 
            compile time: 16.672ms*/;
    function $class_group_113_103(l, data, state, prod, puid) {
        /*8:18 class_group_113_103=>• is θid*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (/*[is]*/cmpr_set(l, data, 141, 2, 2)) {
            consume(l, data, state);
            puid |= 1;
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*8:18 class_group_113_103=>is • θid*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            puid |= 2;
            if (l.isUniID(data) && consume(l, data, state)) {
                add_reduce(state, data, 2, 0);
                return 8;
            }
        }
        return -1;
    }
    function $class_group_113_103_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            /*8:18 class_group_113_103=>is θid •*/
            add_reduce(state, data, 2, 0);
        }
        return 8;
    }
/*production name: class_group_016_104
            grammar index: 9
            bodies:
	9:19 class_group_016_104=>• struct - 
		9:20 class_group_016_104=>• primitive_declaration - 
		9:21 class_group_016_104=>• function - 
            compile time: 657.36ms*/;
    function $class_group_016_104(l, data, state, prod, puid) {
        /*50:144 modifier_list=>• [ modifier_list_HC_listbody1_120 ]
        9:19 class_group_016_104=>• struct
        9:20 class_group_016_104=>• primitive_declaration
        9:21 class_group_016_104=>• function*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 91/*[[]*/) {
            pushFN(data, branch_7a8be2c54a4d26e4);
            return branch_73bacf9dd4cbfee8(l, data, state, prod, 1);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (/*[str]*/cmpr_set(l, data, 47, 3, 3)) {
            pushFN(data, branch_fc3089e8ba238415);
            return branch_85a84a1981e139b6(l, data, state, prod, 1);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (/*[fn]*/cmpr_set(l, data, 144, 2, 2)) {
            pushFN(data, branch_fc3089e8ba238415);
            return branch_410eeb6368911ba4(l, data, state, prod, 4);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (((l.current_byte == 95/*[_]*/) || (l.current_byte == 36/*[$]*/)) || l.isUniID(data)) {
            pushFN(data, branch_fc3089e8ba238415);
            return branch_ef9ee89b43b3b8ba(l, data, state, prod, 2);
        }
        return -1;
    }
    function $class_group_016_104_goto(l, data, state, prod, puid) {
        /*12:32 struct=>modifier_list • str identifier { parameters }
        12:34 struct=>modifier_list • str identifier { }
        43:126 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_170_116
        43:128 primitive_declaration=>modifier_list • identifier : type
        13:36 function=>modifier_list • fn identifier : type ( parameters ) { expression_statements }
        13:38 function=>modifier_list • fn identifier : type ( ) { expression_statements }
        13:39 function=>modifier_list • fn identifier : type ( parameters ) { }
        13:42 function=>modifier_list • fn identifier : type ( ) { }*/
        /*12:32 struct=>modifier_list • str identifier { parameters }
        12:34 struct=>modifier_list • str identifier { }
        43:126 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_170_116
        43:128 primitive_declaration=>modifier_list • identifier : type
        13:36 function=>modifier_list • fn identifier : type ( parameters ) { expression_statements }
        13:38 function=>modifier_list • fn identifier : type ( ) { expression_statements }
        13:39 function=>modifier_list • fn identifier : type ( parameters ) { }
        13:42 function=>modifier_list • fn identifier : type ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if (/*[str]*/cmpr_set(l, data, 47, 3, 3)) {
            /*12:32 struct=>modifier_list • str identifier { parameters }
            12:34 struct=>modifier_list • str identifier { }*/
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l, data, state);
            puid |= 2;
            /*12:32 struct=>modifier_list str • identifier { parameters }
            12:34 struct=>modifier_list str • identifier { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_b16cf9c30a727aea);
            pushFN(data, $identifier);
            puid |= 4;
            return puid;
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else if (/*[fn]*/cmpr_set(l, data, 144, 2, 2)) {
            /*13:36 function=>modifier_list • fn identifier : type ( parameters ) { expression_statements }
            13:38 function=>modifier_list • fn identifier : type ( ) { expression_statements }
            13:39 function=>modifier_list • fn identifier : type ( parameters ) { }
            13:42 function=>modifier_list • fn identifier : type ( ) { }*/
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l, data, state);
            puid |= 2;
            /*13:36 function=>modifier_list fn • identifier : type ( parameters ) { expression_statements }
            13:38 function=>modifier_list fn • identifier : type ( ) { expression_statements }
            13:39 function=>modifier_list fn • identifier : type ( parameters ) { }
            13:42 function=>modifier_list fn • identifier : type ( ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_b128cfb0b2a9d7fd);
            pushFN(data, $identifier);
            puid |= 4;
            return puid;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (((l.current_byte == 95/*[_]*/) || (l.current_byte == 36/*[$]*/)) || l.isUniID(data)) {
            /*43:126 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_170_116
            43:128 primitive_declaration=>modifier_list • identifier : type*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_56315e6f44ebe50f);
            pushFN(data, $identifier);
            puid |= 2;
            return puid;
        }
        return prod == 9 ? prod : -1;
    }
    function $class_group_016_104_reducer(l, data, state, prod, puid) {
        return 9;
    }
/*production name: class_HC_listbody1_105
            grammar index: 10
            bodies:
	10:22 class_HC_listbody1_105=>• class_HC_listbody1_105 class_group_016_104 - 
		10:23 class_HC_listbody1_105=>• class_group_016_104 - 
            compile time: 280.097ms*/;
    function $class_HC_listbody1_105(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*10:23 class_HC_listbody1_105=>• class_group_016_104*/
        puid |= 2;
        pushFN(data, branch_7e5b06e2e73c7ad3);
        pushFN(data, $class_group_016_104);
        return puid;
        return -1;
    }
    function $class_HC_listbody1_105_goto(l, data, state, prod, puid) {
        /*10:22 class_HC_listbody1_105=>class_HC_listbody1_105 • class_group_016_104*/
        /*10:22 class_HC_listbody1_105=>class_HC_listbody1_105 • class_group_016_104
        11:24 class=>modifier_list cls identifier class_group_113_103 { class_HC_listbody1_105 • }
        11:25 class=>cls identifier class_group_113_103 { class_HC_listbody1_105 • }
        11:26 class=>modifier_list cls identifier { class_HC_listbody1_105 • }
        11:28 class=>cls identifier { class_HC_listbody1_105 • }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (((/*[str]*/cmpr_set(l, data, 47, 3, 3) ||/*[fn]*/cmpr_set(l, data, 144, 2, 2)) || assert_ascii(l, 0x0, 0x10, 0x88000000, 0x0)) || l.isUniID(data)) {
            pushFN(data, branch_f068cad16e805a7e);
            return branch_d7ca8a131ce07eaf(l, data, state, prod, 1);
        }
        return prod == 10 ? prod : -1;
    }
    function $class_HC_listbody1_105_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            /*10:22 class_HC_listbody1_105=>class_HC_listbody1_105 class_group_016_104 •*/
            add_reduce(state, data, 2, 2);
        } else if (2 == puid) {
            /*10:23 class_HC_listbody1_105=>class_group_016_104 •*/
            add_reduce(state, data, 1, 3);
        }
        return 10;
    }
/*production name: class
            grammar index: 11
            bodies:
	11:24 class=>• modifier_list cls identifier class_group_113_103 { class_HC_listbody1_105 } - 
		11:25 class=>• cls identifier class_group_113_103 { class_HC_listbody1_105 } - 
		11:26 class=>• modifier_list cls identifier { class_HC_listbody1_105 } - 
		11:27 class=>• modifier_list cls identifier class_group_113_103 { } - 
		11:28 class=>• cls identifier { class_HC_listbody1_105 } - 
		11:29 class=>• cls identifier class_group_113_103 { } - 
		11:30 class=>• modifier_list cls identifier { } - 
		11:31 class=>• cls identifier { } - 
            compile time: 239.958ms*/;
    function $class(l, data, state, prod, puid) {
        /*11:24 class=>• modifier_list cls identifier class_group_113_103 { class_HC_listbody1_105 }
        11:26 class=>• modifier_list cls identifier { class_HC_listbody1_105 }
        11:27 class=>• modifier_list cls identifier class_group_113_103 { }
        11:30 class=>• modifier_list cls identifier { }
        11:25 class=>• cls identifier class_group_113_103 { class_HC_listbody1_105 }
        11:28 class=>• cls identifier { class_HC_listbody1_105 }
        11:29 class=>• cls identifier class_group_113_103 { }
        11:31 class=>• cls identifier { }*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 91/*[[]*/) {
            /*11:24 class=>• modifier_list cls identifier class_group_113_103 { class_HC_listbody1_105 }
            11:26 class=>• modifier_list cls identifier { class_HC_listbody1_105 }
            11:27 class=>• modifier_list cls identifier class_group_113_103 { }
            11:30 class=>• modifier_list cls identifier { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_e2593d86c28e29b0);
            pushFN(data, $modifier_list);
            puid |= 1;
            return puid;
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else if (/*[cls]*/cmpr_set(l, data, 122, 3, 3)) {
            /*11:25 class=>• cls identifier class_group_113_103 { class_HC_listbody1_105 }
            11:28 class=>• cls identifier { class_HC_listbody1_105 }
            11:29 class=>• cls identifier class_group_113_103 { }
            11:31 class=>• cls identifier { }*/
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l, data, state);
            puid |= 2;
            /*11:25 class=>cls • identifier class_group_113_103 { class_HC_listbody1_105 }
            11:28 class=>cls • identifier { class_HC_listbody1_105 }
            11:29 class=>cls • identifier class_group_113_103 { }
            11:31 class=>cls • identifier { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_3b5f59d84e4a737c);
            pushFN(data, $identifier);
            puid |= 4;
            return puid;
        }
        return -1;
    }
    function $class_reducer(l, data, state, prod, puid) {
        if (127 == puid) {
            /*11:24 class=>modifier_list cls identifier class_group_113_103 { class_HC_listbody1_105 } •*/
            add_reduce(state, data, 7, 8);
        } else if (126 == puid) {
            /*11:25 class=>cls identifier class_group_113_103 { class_HC_listbody1_105 } •*/
            add_reduce(state, data, 6, 9);
        } else if (119 == puid) {
            /*11:26 class=>modifier_list cls identifier { class_HC_listbody1_105 } •*/
            add_reduce(state, data, 6, 10);
        } else if (95 == puid) {
            /*11:27 class=>modifier_list cls identifier class_group_113_103 { } •*/
            add_reduce(state, data, 6, 11);
        } else if (118 == puid) {
            /*11:28 class=>cls identifier { class_HC_listbody1_105 } •*/
            add_reduce(state, data, 5, 12);
        } else if (94 == puid) {
            /*11:29 class=>cls identifier class_group_113_103 { } •*/
            add_reduce(state, data, 5, 13);
        } else if (87 == puid) {
            /*11:30 class=>modifier_list cls identifier { } •*/
            add_reduce(state, data, 5, 14);
        } else if (86 == puid) {
            /*11:31 class=>cls identifier { } •*/
            add_reduce(state, data, 4, 15);
        }
        return 11;
    }
/*production name: struct
            grammar index: 12
            bodies:
	12:32 struct=>• modifier_list str identifier { parameters } - 
		12:33 struct=>• str identifier { parameters } - 
		12:34 struct=>• modifier_list str identifier { } - 
		12:35 struct=>• str identifier { } - 
            compile time: 227.559ms*/;
    function $struct(l, data, state, prod, puid) {
        /*12:32 struct=>• modifier_list str identifier { parameters }
        12:34 struct=>• modifier_list str identifier { }
        12:33 struct=>• str identifier { parameters }
        12:35 struct=>• str identifier { }*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 91/*[[]*/) {
            /*12:32 struct=>• modifier_list str identifier { parameters }
            12:34 struct=>• modifier_list str identifier { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_22c9bbc2e06b56ba);
            pushFN(data, $modifier_list);
            puid |= 1;
            return puid;
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else if (/*[str]*/cmpr_set(l, data, 47, 3, 3)) {
            /*12:33 struct=>• str identifier { parameters }
            12:35 struct=>• str identifier { }*/
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l, data, state);
            puid |= 2;
            /*12:33 struct=>str • identifier { parameters }
            12:35 struct=>str • identifier { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_1622bb2c5deb4fec);
            pushFN(data, $identifier);
            puid |= 4;
            return puid;
        }
        return -1;
    }
    function $struct_reducer(l, data, state, prod, puid) {
        if (63 == puid) {
            /*12:32 struct=>modifier_list str identifier { parameters } •*/
            add_reduce(state, data, 6, 16);
        } else if (62 == puid) {
            /*12:33 struct=>str identifier { parameters } •*/
            add_reduce(state, data, 5, 17);
        } else if (47 == puid) {
            /*12:34 struct=>modifier_list str identifier { } •*/
            add_reduce(state, data, 5, 18);
        } else if (46 == puid) {
            /*12:35 struct=>str identifier { } •*/
            add_reduce(state, data, 4, 19);
        }
        return 12;
    }
/*production name: function
            grammar index: 13
            bodies:
	13:36 function=>• modifier_list fn identifier : type ( parameters ) { expression_statements } - 
		13:37 function=>• fn identifier : type ( parameters ) { expression_statements } - 
		13:38 function=>• modifier_list fn identifier : type ( ) { expression_statements } - 
		13:39 function=>• modifier_list fn identifier : type ( parameters ) { } - 
		13:40 function=>• fn identifier : type ( ) { expression_statements } - 
		13:41 function=>• fn identifier : type ( parameters ) { } - 
		13:42 function=>• modifier_list fn identifier : type ( ) { } - 
		13:43 function=>• fn identifier : type ( ) { } - 
            compile time: 831.369ms*/;
    function $function(l, data, state, prod, puid) {
        /*13:36 function=>• modifier_list fn identifier : type ( parameters ) { expression_statements }
        13:38 function=>• modifier_list fn identifier : type ( ) { expression_statements }
        13:39 function=>• modifier_list fn identifier : type ( parameters ) { }
        13:42 function=>• modifier_list fn identifier : type ( ) { }
        13:37 function=>• fn identifier : type ( parameters ) { expression_statements }
        13:40 function=>• fn identifier : type ( ) { expression_statements }
        13:41 function=>• fn identifier : type ( parameters ) { }
        13:43 function=>• fn identifier : type ( ) { }*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 91/*[[]*/) {
            /*13:36 function=>• modifier_list fn identifier : type ( parameters ) { expression_statements }
            13:38 function=>• modifier_list fn identifier : type ( ) { expression_statements }
            13:39 function=>• modifier_list fn identifier : type ( parameters ) { }
            13:42 function=>• modifier_list fn identifier : type ( ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_6802295a984aae0d);
            pushFN(data, $modifier_list);
            puid |= 1;
            return puid;
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else if (/*[fn]*/cmpr_set(l, data, 144, 2, 2)) {
            /*13:37 function=>• fn identifier : type ( parameters ) { expression_statements }
            13:40 function=>• fn identifier : type ( ) { expression_statements }
            13:41 function=>• fn identifier : type ( parameters ) { }
            13:43 function=>• fn identifier : type ( ) { }*/
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l, data, state);
            puid |= 2;
            /*13:37 function=>fn • identifier : type ( parameters ) { expression_statements }
            13:40 function=>fn • identifier : type ( ) { expression_statements }
            13:41 function=>fn • identifier : type ( parameters ) { }
            13:43 function=>fn • identifier : type ( ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_aec4596816df37e4);
            pushFN(data, $identifier);
            puid |= 4;
            return puid;
        }
        return -1;
    }
    function $function_reducer(l, data, state, prod, puid) {
        if (2047 == puid) {
            /*13:36 function=>modifier_list fn identifier : type ( parameters ) { expression_statements } •*/
            add_reduce(state, data, 11, 20);
        } else if (2046 == puid) {
            /*13:37 function=>fn identifier : type ( parameters ) { expression_statements } •*/
            add_reduce(state, data, 10, 21);
        } else if (1983 == puid) {
            /*13:38 function=>modifier_list fn identifier : type ( ) { expression_statements } •*/
            add_reduce(state, data, 10, 22);
        } else if (1535 == puid) {
            /*13:39 function=>modifier_list fn identifier : type ( parameters ) { } •*/
            add_reduce(state, data, 10, 23);
        } else if (1982 == puid) {
            /*13:40 function=>fn identifier : type ( ) { expression_statements } •*/
            add_reduce(state, data, 9, 24);
        } else if (1534 == puid) {
            /*13:41 function=>fn identifier : type ( parameters ) { } •*/
            add_reduce(state, data, 9, 25);
        } else if (1471 == puid) {
            /*13:42 function=>modifier_list fn identifier : type ( ) { } •*/
            add_reduce(state, data, 9, 26);
        } else if (1470 == puid) {
            /*13:43 function=>fn identifier : type ( ) { } •*/
            add_reduce(state, data, 8, 27);
        }
        return 13;
    }
/*production name: function_expression
            grammar index: 14
            bodies:
	14:44 function_expression=>• modifier_list fn : type ( parameters ) { expression_statements } - 
		14:45 function_expression=>• fn : type ( parameters ) { expression_statements } - 
		14:46 function_expression=>• modifier_list fn : type ( ) { expression_statements } - 
		14:47 function_expression=>• modifier_list fn : type ( parameters ) { } - 
		14:48 function_expression=>• fn : type ( ) { expression_statements } - 
		14:49 function_expression=>• fn : type ( parameters ) { } - 
		14:50 function_expression=>• modifier_list fn : type ( ) { } - 
		14:51 function_expression=>• fn : type ( ) { } - 
            compile time: 947.756ms*/;
    function $function_expression(l, data, state, prod, puid) {
        /*14:44 function_expression=>• modifier_list fn : type ( parameters ) { expression_statements }
        14:46 function_expression=>• modifier_list fn : type ( ) { expression_statements }
        14:47 function_expression=>• modifier_list fn : type ( parameters ) { }
        14:50 function_expression=>• modifier_list fn : type ( ) { }
        14:45 function_expression=>• fn : type ( parameters ) { expression_statements }
        14:48 function_expression=>• fn : type ( ) { expression_statements }
        14:49 function_expression=>• fn : type ( parameters ) { }
        14:51 function_expression=>• fn : type ( ) { }*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 91/*[[]*/) {
            /*14:44 function_expression=>• modifier_list fn : type ( parameters ) { expression_statements }
            14:46 function_expression=>• modifier_list fn : type ( ) { expression_statements }
            14:47 function_expression=>• modifier_list fn : type ( parameters ) { }
            14:50 function_expression=>• modifier_list fn : type ( ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_ae32c9a5462cacda);
            pushFN(data, $modifier_list);
            puid |= 1;
            return puid;
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else if (/*[fn]*/cmpr_set(l, data, 144, 2, 2)) {
            /*14:45 function_expression=>• fn : type ( parameters ) { expression_statements }
            14:48 function_expression=>• fn : type ( ) { expression_statements }
            14:49 function_expression=>• fn : type ( parameters ) { }
            14:51 function_expression=>• fn : type ( ) { }*/
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l, data, state);
            puid |= 2;
            /*14:45 function_expression=>fn • : type ( parameters ) { expression_statements }
            14:48 function_expression=>fn • : type ( ) { expression_statements }
            14:49 function_expression=>fn • : type ( parameters ) { }
            14:51 function_expression=>fn • : type ( ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if (l.current_byte == 58/*[:]*/) {
                consume(l, data, state);
                puid |= 4;
                /*14:45 function_expression=>fn : • type ( parameters ) { expression_statements }
                14:48 function_expression=>fn : • type ( ) { expression_statements }
                14:49 function_expression=>fn : • type ( parameters ) { }
                14:51 function_expression=>fn : • type ( ) { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                pushFN(data, branch_8a277c3c8789f796);
                pushFN(data, $type);
                puid |= 8;
                return puid;
            }
        }
        return -1;
    }
    function $function_expression_reducer(l, data, state, prod, puid) {
        if (1023 == puid) {
            /*14:44 function_expression=>modifier_list fn : type ( parameters ) { expression_statements } •*/
            add_reduce(state, data, 10, 28);
        } else if (1022 == puid) {
            /*14:45 function_expression=>fn : type ( parameters ) { expression_statements } •*/
            add_reduce(state, data, 9, 29);
        } else if (991 == puid) {
            /*14:46 function_expression=>modifier_list fn : type ( ) { expression_statements } •*/
            add_reduce(state, data, 9, 30);
        } else if (767 == puid) {
            /*14:47 function_expression=>modifier_list fn : type ( parameters ) { } •*/
            add_reduce(state, data, 9, 31);
        } else if (990 == puid) {
            /*14:48 function_expression=>fn : type ( ) { expression_statements } •*/
            add_reduce(state, data, 8, 32);
        } else if (766 == puid) {
            /*14:49 function_expression=>fn : type ( parameters ) { } •*/
            add_reduce(state, data, 8, 33);
        } else if (735 == puid) {
            /*14:50 function_expression=>modifier_list fn : type ( ) { } •*/
            add_reduce(state, data, 8, 34);
        } else if (734 == puid) {
            /*14:51 function_expression=>fn : type ( ) { } •*/
            add_reduce(state, data, 7, 35);
        }
        return 14;
    }
/*production name: parameters
            grammar index: 16
            bodies:
	16:54 parameters=>• parameters , primitive_declaration - 
		16:55 parameters=>• primitive_declaration - 
            compile time: 658.741ms*/;
    function $parameters(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*16:55 parameters=>• primitive_declaration*/
        puid |= 4;
        pushFN(data, branch_1f0e8a0854632fda);
        pushFN(data, $primitive_declaration);
        return puid;
        return -1;
    }
    function $parameters_goto(l, data, state, prod, puid) {
        /*16:54 parameters=>parameters • , primitive_declaration*/
        /*16:54 parameters=>parameters • , primitive_declaration
        12:32 struct=>modifier_list str identifier { parameters • }
        12:33 struct=>str identifier { parameters • }
        13:36 function=>modifier_list fn identifier : type ( parameters • ) { expression_statements }
        13:37 function=>fn identifier : type ( parameters • ) { expression_statements }
        13:39 function=>modifier_list fn identifier : type ( parameters • ) { }
        13:41 function=>fn identifier : type ( parameters • ) { }
        14:44 function_expression=>modifier_list fn : type ( parameters • ) { expression_statements }
        14:45 function_expression=>fn : type ( parameters • ) { expression_statements }
        14:47 function_expression=>modifier_list fn : type ( parameters • ) { }
        14:49 function_expression=>fn : type ( parameters • ) { }
        31:97 loop_expression=>loop ( parameters • ; expression ; loop_expression_HC_listbody6_112 ) expression
        31:100 loop_expression=>loop ( parameters • ; ; loop_expression_HC_listbody6_112 ) expression
        31:101 loop_expression=>loop ( parameters • ; expression ; ) expression
        31:104 loop_expression=>loop ( parameters • ; ; ) expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if (l.current_byte == 44/*[,]*/) {
            pushFN(data, branch_9f0a04323a32a77b);
            return branch_2fc8e06271cc27a3(l, data, state, prod, 1);
        }
        return prod == 16 ? prod : -1;
    }
    function $parameters_reducer(l, data, state, prod, puid) {
        if (7 == puid) {
            /*16:54 parameters=>parameters , primitive_declaration •*/
            add_reduce(state, data, 3, 36);
        } else if (4 == puid) {
            /*16:55 parameters=>primitive_declaration •*/
            add_reduce(state, data, 1, 3);
        }
        return 16;
    }
/*production name: expression_statements_HC_listbody1_107
            grammar index: 17
            bodies:
	17:56 expression_statements_HC_listbody1_107=>• expression_statements_HC_listbody1_107 ; - 
		17:57 expression_statements_HC_listbody1_107=>• ; - 
            compile time: 269.235ms*/;
    function $expression_statements_HC_listbody1_107(l, data, state, prod, puid) {
        /*17:57 expression_statements_HC_listbody1_107=>• ;*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 59/*[;]*/) {
            consume(l, data, state);
            puid |= 2;
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*17:57 expression_statements_HC_listbody1_107=>; •*/
            add_reduce(state, data, 1, 3);
            pushFN(data, $expression_statements_HC_listbody1_107_goto);
            return 17;
        }
        return -1;
    }
    function $expression_statements_HC_listbody1_107_goto(l, data, state, prod, puid) {
        while (1) {
            /*17:56 expression_statements_HC_listbody1_107=>expression_statements_HC_listbody1_107 • ;
            19:60 expression_statements_group_124_109=>expression_statements_HC_listbody1_107 • expression_statements_group_023_108
            19:61 expression_statements_group_124_109=>expression_statements_HC_listbody1_107 •*/
            if (l.current_byte == 125/*[}]*/) {
                return 17;
            }
            /*17:56 expression_statements_HC_listbody1_107=>expression_statements_HC_listbody1_107 • ;
            19:60 expression_statements_group_124_109=>expression_statements_HC_listbody1_107 • expression_statements_group_023_108
            19:61 expression_statements_group_124_109=>expression_statements_HC_listbody1_107 •*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
            if (l.current_byte == 59/*[;]*/) {
                pushFN(data, branch_bf60c80149b74072);
                return branch_66307d4298bd3f07(l, data, state, prod, 1);
            }
            break;
        }
        return prod == 17 ? prod : -1;
    }
    function $expression_statements_HC_listbody1_107_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            /*17:56 expression_statements_HC_listbody1_107=>expression_statements_HC_listbody1_107 ; •*/
            add_reduce(state, data, 2, 2);
        } else if (2 == puid) {
            /*17:57 expression_statements_HC_listbody1_107=>; •*/
            add_reduce(state, data, 1, 3);
        }
        return 17;
    }
/*production name: expression_statements_group_023_108
            grammar index: 18
            bodies:
	18:58 expression_statements_group_023_108=>• expression - 
		18:59 expression_statements_group_023_108=>• primitive_declaration - 
            compile time: 2372.23ms*/;
    function $expression_statements_group_023_108(l, data, state, prod, puid) {
        /*18:58 expression_statements_group_023_108=>• expression
        18:59 expression_statements_group_023_108=>• primitive_declaration*/
        switch (sym_map_5fb5a91443e6e4f1(l, data)) {
            case 0:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*18:58 expression_statements_group_023_108=>• expression*/
                puid |= 1;
                pushFN(data, branch_bd41394530f64266);
                pushFN(data, $expression);
                return puid;
            case 1:
                /*44:130 identifier=>• tk:identifier_token
                50:144 modifier_list=>• [ modifier_list_HC_listbody1_120 ]*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if (l.current_byte == 91/*[[]*/) {
                    pushFN(data, branch_6daab6971c75715b);
                    return branch_5b948ba3b39c4e7d(l, data, state, prod, 1);
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if (((l.current_byte == 95/*[_]*/) || (l.current_byte == 36/*[$]*/)) || l.isUniID(data)) {
                    pushFN(data, branch_11d890e1265c30e7);
                    return branch_acdb9cfb265391cc(l, data, state, prod, 1);
                }
            default:
                break;
        }
        return -1;
    }
    function $expression_statements_group_023_108_goto(l, data, state, prod, puid) {
        while (1) {
            switch (prod) {
                case 26:
                    /*25:80 binary_expression=>unary_expression • operator
                    25:81 binary_expression=>unary_expression • operator expression
                    25:82 binary_expression=>unary_expression •*/
                    /*25:80 binary_expression=>unary_expression • operator
                    25:81 binary_expression=>unary_expression • operator expression
                    25:82 binary_expression=>unary_expression •*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    if (sym_map_a6e19c42d2a4699a(l, data) == 1) {
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*25:82 binary_expression=>unary_expression •*/
                        return 18;
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    } else if (/*[==]*/cmpr_set(l, data, 7, 2, 2) || l.isSym(true, data)) {
                        /*25:80 binary_expression=>unary_expression • operator
                        25:81 binary_expression=>unary_expression • operator expression*/
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                        pushFN(data, branch_fc701c1f623bdd1d);
                        pushFN(data, $operator);
                        puid |= 2;
                        return puid;
                    }
                    break;
                case 28:
                    /*22:76 assignment_expression=>left_hand_expression • = expression
                    27:85 unary_value=>left_hand_expression •*/
                    /*22:76 assignment_expression=>left_hand_expression • = expression
                    27:85 unary_value=>left_hand_expression •*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    switch (sym_map_00f57473245d5924(l, data)) {
                        case 0:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert ⤋⤋⤋*/
                            /*22:76 assignment_expression=>left_hand_expression • = expression*/
                            puid |= 2;
                            consume(l, data, state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                            puid |= 4;
                            pushFN(data, branch_b753086db13038aa);
                            pushFN(data, $expression);
                            return puid;
                        default:
                        case 1:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                            /*27:85 unary_value=>left_hand_expression •*/
                            prod = 26;
                            continue;;
                    }
                    break;
                case 37:
                    /*28:91 left_hand_expression=>member_expression •
                    37:115 member_expression=>member_expression • . identifier
                    37:116 member_expression=>member_expression • [ expression ]
                    36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                    36:114 call_expression=>member_expression • ( )*/
                    /*28:91 left_hand_expression=>member_expression •
                    37:116 member_expression=>member_expression • [ expression ]
                    37:115 member_expression=>member_expression • . identifier
                    36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                    36:114 call_expression=>member_expression • ( )*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    switch (sym_map_c82afb129e509311(l, data)) {
                        case 0:
                            /*28:91 left_hand_expression=>member_expression •
                            37:116 member_expression=>member_expression • [ expression ]*/
                            var pk = l.copy();
                            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, 0);
                            switch (sym_map_7b992290c905e3fc(pk, data)) {
                                case 0:
                                    /*--LEAF--*/
                                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                                    /*37:116 member_expression=>member_expression • [ expression ]*/
                                    puid |= 8;
                                    consume(l, data, state);
                                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                                    puid |= 16;
                                    pushFN(data, branch_f19b89862f600e5f);
                                    pushFN(data, $expression);
                                    return puid;
                                default:
                                case 1:
                                    /*--LEAF--*/
                                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                                    /*28:91 left_hand_expression=>member_expression •*/
                                    prod = 28;
                                    continue;;
                                case 2:
                                    /*--LEAF--*/
                                    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                                    /*37:116 member_expression=>member_expression • [ expression ]*/
                                    puid |= 8;
                                    consume(l, data, state);
                                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                                    puid |= 16;
                                    pushFN(data, branch_f19b89862f600e5f);
                                    pushFN(data, $expression);
                                    return puid;
                            }
                        case 1:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert ⤋⤋⤋*/
                            /*37:115 member_expression=>member_expression • . identifier*/
                            puid |= 2;
                            consume(l, data, state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                            puid |= 4;
                            pushFN(data, branch_844dc852f21c4995);
                            pushFN(data, $identifier);
                            return puid;
                        case 2:
                            /*36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                            36:114 call_expression=>member_expression • ( )*/
                            var pk = l.copy();
                            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, 0);
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                            if (pk.current_byte == 41/*[)]*/) {
                                pushFN(data, branch_74c8218421c7bef8);
                                return branch_f29ead3e741f692c(l, data, state, prod, 1);
                                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                            } else if (((((((((((((((/*[if]*/cmpr_set(pk, data, 143, 2, 2) ||/*[match]*/cmpr_set(pk, data, 67, 5, 5)) ||/*[break]*/cmpr_set(pk, data, 72, 5, 5)) ||/*[return]*/cmpr_set(pk, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(pk, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(pk, data, 63, 4, 4)) ||/*[<<--]*/cmpr_set(pk, data, 20, 4, 4)) ||/*[==]*/cmpr_set(pk, data, 7, 2, 2)) || dt_bcea2102060eab13(pk, data)) ||/*[true]*/cmpr_set(pk, data, 95, 4, 4)) ||/*[null]*/cmpr_set(pk, data, 35, 4, 4)) || dt_6ae31dd85a62ef5c(pk, data)) || assert_ascii(pk, 0x0, 0x194, 0x88000000, 0x8000000)) || pk.isUniID(data)) || pk.isNum(data)) || pk.isSym(true, data)) {
                                pushFN(data, branch_74c8218421c7bef8);
                                return branch_25c768d9c9093ad1(l, data, state, prod, 1);
                            }
                        default:
                        case 3:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                            /*28:91 left_hand_expression=>member_expression •*/
                            prod = 28;
                            continue;;
                    }
                    break;
                case 44:
                    /*37:118 member_expression=>identifier •
                    43:127 primitive_declaration=>identifier • : type primitive_declaration_group_170_116
                    43:129 primitive_declaration=>identifier • : type*/
                    /*37:118 member_expression=>identifier •
                    43:127 primitive_declaration=>identifier • : type primitive_declaration_group_170_116
                    43:129 primitive_declaration=>identifier • : type*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    switch (sym_map_9fff07fe93fb5f87(l, data)) {
                        case 0:
                            /*37:118 member_expression=>identifier •
                            43:127 primitive_declaration=>identifier • : type primitive_declaration_group_170_116
                            43:129 primitive_declaration=>identifier • : type*/
                            var pk = l.copy();
                            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, 0);
                            switch (sym_map_28592a8cdba54a6c(pk, data)) {
                                case 0:
                                    /*43:127 primitive_declaration=>identifier • : type primitive_declaration_group_170_116
                                    43:129 primitive_declaration=>identifier • : type*/
                                    /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                                    consume(l, data, state);
                                    puid |= 4;
                                    /*43:127 primitive_declaration=>identifier : • type primitive_declaration_group_170_116
                                    43:129 primitive_declaration=>identifier : • type*/
                                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                                    pushFN(data, branch_c340f7fdd0562810);
                                    pushFN(data, $type);
                                    puid |= 8;
                                    return puid;
                                default:
                                case 1:
                                    /*--LEAF--*/
                                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                                    /*37:118 member_expression=>identifier •*/
                                    add_reduce(state, data, 1, 68);
                                    prod = 37;
                                    continue;;
                                case 2:
                                    /*-------------VPROD-------------------------*/
                                    /*37:118 member_expression=>identifier •
                                    43:127 primitive_declaration=>identifier • : type primitive_declaration_group_170_116
                                    43:129 primitive_declaration=>identifier • : type*/
                                    pushFN(data, branch_56ce9147737e2637);
                                    return 0;
                            }
                        default:
                        case 1:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                            /*37:118 member_expression=>identifier •*/
                            add_reduce(state, data, 1, 68);
                            prod = 37;
                            continue;;
                    }
                    break;
                case 50:
                    /*14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
                    14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
                    14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
                    14:50 function_expression=>modifier_list • fn : type ( ) { }
                    43:126 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_170_116
                    43:128 primitive_declaration=>modifier_list • identifier : type*/
                    /*14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
                    14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
                    14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
                    14:50 function_expression=>modifier_list • fn : type ( ) { }
                    43:126 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_170_116
                    43:128 primitive_declaration=>modifier_list • identifier : type*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    if (/*[fn]*/cmpr_set(l, data, 144, 2, 2)) {
                        /*14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
                        14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
                        14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
                        14:50 function_expression=>modifier_list • fn : type ( ) { }*/
                        /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                        consume(l, data, state);
                        puid |= 2;
                        /*14:44 function_expression=>modifier_list fn • : type ( parameters ) { expression_statements }
                        14:46 function_expression=>modifier_list fn • : type ( ) { expression_statements }
                        14:47 function_expression=>modifier_list fn • : type ( parameters ) { }
                        14:50 function_expression=>modifier_list fn • : type ( ) { }*/
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                        if (l.current_byte == 58/*[:]*/) {
                            consume(l, data, state);
                            puid |= 4;
                            /*14:44 function_expression=>modifier_list fn : • type ( parameters ) { expression_statements }
                            14:46 function_expression=>modifier_list fn : • type ( ) { expression_statements }
                            14:47 function_expression=>modifier_list fn : • type ( parameters ) { }
                            14:50 function_expression=>modifier_list fn : • type ( ) { }*/
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                            pushFN(data, branch_921199f2ed2c1598);
                            pushFN(data, $type);
                            puid |= 8;
                            return puid;
                        }
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    } else if (((l.current_byte == 95/*[_]*/) || (l.current_byte == 36/*[$]*/)) || l.isUniID(data)) {
                        /*43:126 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_170_116
                        43:128 primitive_declaration=>modifier_list • identifier : type*/
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                        pushFN(data, branch_efdcf998a53003ce);
                        pushFN(data, $identifier);
                        puid |= 2;
                        return puid;
                    }
                    break;
            }
            break;
        }
        return prod == 18 ? prod : -1;
    }
    function $expression_statements_group_023_108_reducer(l, data, state, prod, puid) {
        return 18;
    }
/*production name: expression_statements_group_124_109
            grammar index: 19
            bodies:
	19:60 expression_statements_group_124_109=>• expression_statements_HC_listbody1_107 expression_statements_group_023_108 - 
		19:61 expression_statements_group_124_109=>• expression_statements_HC_listbody1_107 - 
            compile time: 14.645ms*/;
    function $expression_statements_group_124_109(l, data, state, prod, puid) {
        /*19:60 expression_statements_group_124_109=>• expression_statements_HC_listbody1_107 expression_statements_group_023_108
        19:61 expression_statements_group_124_109=>• expression_statements_HC_listbody1_107*/
        pushFN(data, branch_345b32d9d4006ef9);
        pushFN(data, $expression_statements_HC_listbody1_107);
        puid |= 1;
        return puid;
        return -1;
    }
    function $expression_statements_group_124_109_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            /*19:60 expression_statements_group_124_109=>expression_statements_HC_listbody1_107 expression_statements_group_023_108 •*/
            add_reduce(state, data, 2, 37);
        } else if (1 == puid) {
            /*19:61 expression_statements_group_124_109=>expression_statements_HC_listbody1_107 •*/
            add_reduce(state, data, 1, 38);
        }
        return 19;
    }
/*production name: expression_statements
            grammar index: 20
            bodies:
	20:62 expression_statements=>• expression_statements expression_statements_group_124_109 - 
		20:63 expression_statements=>• expression - 
		20:64 expression_statements=>• primitive_declaration - 
            compile time: 3554.263ms*/;
    function $expression_statements(l, data, state, prod, puid) {
        /*20:63 expression_statements=>• expression
        20:64 expression_statements=>• primitive_declaration*/
        switch (sym_map_5fb5a91443e6e4f1(l, data)) {
            case 0:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*20:63 expression_statements=>• expression*/
                puid |= 4;
                pushFN(data, branch_dd5c1e4a566fe3e5);
                pushFN(data, $expression);
                return puid;
            case 1:
                /*44:130 identifier=>• tk:identifier_token
                50:144 modifier_list=>• [ modifier_list_HC_listbody1_120 ]*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if (l.current_byte == 91/*[[]*/) {
                    pushFN(data, branch_c0e3727d9ff912b9);
                    return branch_5b948ba3b39c4e7d(l, data, state, prod, 1);
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if (((l.current_byte == 95/*[_]*/) || (l.current_byte == 36/*[$]*/)) || l.isUniID(data)) {
                    pushFN(data, branch_97946dd38e34dd15);
                    return branch_acdb9cfb265391cc(l, data, state, prod, 1);
                }
            default:
                break;
        }
        return -1;
    }
    function $expression_statements_goto(l, data, state, prod, puid) {
        while (1) {
            switch (prod) {
                case 20:
                    /*20:62 expression_statements=>expression_statements • expression_statements_group_124_109*/
                    /*20:62 expression_statements=>expression_statements • expression_statements_group_124_109
                    13:36 function=>modifier_list fn identifier : type ( parameters ) { expression_statements • }
                    13:37 function=>fn identifier : type ( parameters ) { expression_statements • }
                    13:38 function=>modifier_list fn identifier : type ( ) { expression_statements • }
                    13:40 function=>fn identifier : type ( ) { expression_statements • }
                    14:44 function_expression=>modifier_list fn : type ( parameters ) { expression_statements • }
                    14:45 function_expression=>fn : type ( parameters ) { expression_statements • }
                    14:46 function_expression=>modifier_list fn : type ( ) { expression_statements • }
                    14:48 function_expression=>fn : type ( ) { expression_statements • }
                    21:73 expression=>{ expression_statements • }*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    if (l.current_byte == 59/*[;]*/) {
                        pushFN(data, branch_d2bd478d3a4a66be);
                        return branch_dfee164add9936bd(l, data, state, prod, 1);
                    }
                    break;
                case 26:
                    /*25:80 binary_expression=>unary_expression • operator
                    25:81 binary_expression=>unary_expression • operator expression
                    25:82 binary_expression=>unary_expression •*/
                    /*25:80 binary_expression=>unary_expression • operator
                    25:81 binary_expression=>unary_expression • operator expression
                    25:82 binary_expression=>unary_expression •*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    if (sym_map_e58af9c6fd146069(l, data) == 1) {
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*25:82 binary_expression=>unary_expression •*/
                        add_reduce(state, data, 1, 3);
                        pushFN(data, $expression_statements_goto);
                        return 20;
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    } else if (/*[==]*/cmpr_set(l, data, 7, 2, 2) || l.isSym(true, data)) {
                        /*25:80 binary_expression=>unary_expression • operator
                        25:81 binary_expression=>unary_expression • operator expression*/
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                        pushFN(data, branch_8a6256cbbd63092a);
                        pushFN(data, $operator);
                        puid |= 2;
                        return puid;
                    }
                    break;
                case 28:
                    /*22:76 assignment_expression=>left_hand_expression • = expression
                    27:85 unary_value=>left_hand_expression •*/
                    /*22:76 assignment_expression=>left_hand_expression • = expression
                    27:85 unary_value=>left_hand_expression •*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    switch (sym_map_00f57473245d5924(l, data)) {
                        case 0:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert ⤋⤋⤋*/
                            /*22:76 assignment_expression=>left_hand_expression • = expression*/
                            puid |= 2;
                            consume(l, data, state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                            puid |= 4;
                            pushFN(data, branch_b644d96f3c18b08f);
                            pushFN(data, $expression);
                            return puid;
                        default:
                        case 1:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                            /*27:85 unary_value=>left_hand_expression •*/
                            prod = 26;
                            continue;;
                    }
                    break;
                case 37:
                    /*28:91 left_hand_expression=>member_expression •
                    37:115 member_expression=>member_expression • . identifier
                    37:116 member_expression=>member_expression • [ expression ]
                    36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                    36:114 call_expression=>member_expression • ( )*/
                    /*28:91 left_hand_expression=>member_expression •
                    37:116 member_expression=>member_expression • [ expression ]
                    37:115 member_expression=>member_expression • . identifier
                    36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                    36:114 call_expression=>member_expression • ( )*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    switch (sym_map_c82afb129e509311(l, data)) {
                        case 0:
                            /*28:91 left_hand_expression=>member_expression •
                            37:116 member_expression=>member_expression • [ expression ]*/
                            var pk = l.copy();
                            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, 0);
                            switch (sym_map_7b992290c905e3fc(pk, data)) {
                                case 0:
                                    /*--LEAF--*/
                                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                                    /*37:116 member_expression=>member_expression • [ expression ]*/
                                    puid |= 8;
                                    consume(l, data, state);
                                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                                    puid |= 16;
                                    pushFN(data, branch_b655bc0613f13001);
                                    pushFN(data, $expression);
                                    return puid;
                                default:
                                case 1:
                                    /*--LEAF--*/
                                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                                    /*28:91 left_hand_expression=>member_expression •*/
                                    prod = 28;
                                    continue;;
                                case 2:
                                    /*--LEAF--*/
                                    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                                    /*37:116 member_expression=>member_expression • [ expression ]*/
                                    puid |= 8;
                                    consume(l, data, state);
                                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                                    puid |= 16;
                                    pushFN(data, branch_b655bc0613f13001);
                                    pushFN(data, $expression);
                                    return puid;
                            }
                        case 1:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert ⤋⤋⤋*/
                            /*37:115 member_expression=>member_expression • . identifier*/
                            puid |= 2;
                            consume(l, data, state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                            puid |= 4;
                            pushFN(data, branch_747666e752112bf3);
                            pushFN(data, $identifier);
                            return puid;
                        case 2:
                            /*36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                            36:114 call_expression=>member_expression • ( )*/
                            var pk = l.copy();
                            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, 0);
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                            if (pk.current_byte == 41/*[)]*/) {
                                pushFN(data, branch_521f65aff0d7939b);
                                return branch_f29ead3e741f692c(l, data, state, prod, 1);
                                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                            } else if (((((((((((((((/*[if]*/cmpr_set(pk, data, 143, 2, 2) ||/*[match]*/cmpr_set(pk, data, 67, 5, 5)) ||/*[break]*/cmpr_set(pk, data, 72, 5, 5)) ||/*[return]*/cmpr_set(pk, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(pk, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(pk, data, 63, 4, 4)) ||/*[<<--]*/cmpr_set(pk, data, 20, 4, 4)) ||/*[==]*/cmpr_set(pk, data, 7, 2, 2)) || dt_bcea2102060eab13(pk, data)) ||/*[true]*/cmpr_set(pk, data, 95, 4, 4)) ||/*[null]*/cmpr_set(pk, data, 35, 4, 4)) || dt_6ae31dd85a62ef5c(pk, data)) || assert_ascii(pk, 0x0, 0x194, 0x88000000, 0x8000000)) || pk.isUniID(data)) || pk.isNum(data)) || pk.isSym(true, data)) {
                                pushFN(data, branch_521f65aff0d7939b);
                                return branch_25c768d9c9093ad1(l, data, state, prod, 1);
                            }
                        default:
                        case 3:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                            /*28:91 left_hand_expression=>member_expression •*/
                            prod = 28;
                            continue;;
                    }
                    break;
                case 44:
                    /*43:127 primitive_declaration=>identifier • : type primitive_declaration_group_170_116
                    43:129 primitive_declaration=>identifier • : type
                    37:118 member_expression=>identifier •*/
                    /*43:127 primitive_declaration=>identifier • : type primitive_declaration_group_170_116
                    43:129 primitive_declaration=>identifier • : type
                    37:118 member_expression=>identifier •*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    switch (sym_map_9fff07fe93fb5f87(l, data)) {
                        case 0:
                            /*43:127 primitive_declaration=>identifier • : type primitive_declaration_group_170_116
                            43:129 primitive_declaration=>identifier • : type
                            37:118 member_expression=>identifier •*/
                            var pk = l.copy();
                            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, 0);
                            switch (sym_map_28592a8cdba54a6c(pk, data)) {
                                case 0:
                                    /*43:127 primitive_declaration=>identifier • : type primitive_declaration_group_170_116
                                    43:129 primitive_declaration=>identifier • : type*/
                                    /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                                    consume(l, data, state);
                                    puid |= 4;
                                    /*43:127 primitive_declaration=>identifier : • type primitive_declaration_group_170_116
                                    43:129 primitive_declaration=>identifier : • type*/
                                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                                    pushFN(data, branch_63162b921874b292);
                                    pushFN(data, $type);
                                    puid |= 8;
                                    return puid;
                                default:
                                case 1:
                                    /*--LEAF--*/
                                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                                    /*37:118 member_expression=>identifier •*/
                                    add_reduce(state, data, 1, 68);
                                    prod = 37;
                                    continue;;
                                case 2:
                                    /*-------------VPROD-------------------------*/
                                    /*43:127 primitive_declaration=>identifier • : type primitive_declaration_group_170_116
                                    43:129 primitive_declaration=>identifier • : type
                                    37:118 member_expression=>identifier •*/
                                    pushFN(data, branch_3b0ef60671ff3b91);
                                    return 0;
                            }
                        default:
                        case 1:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                            /*37:118 member_expression=>identifier •*/
                            add_reduce(state, data, 1, 68);
                            prod = 37;
                            continue;;
                    }
                    break;
                case 50:
                    /*43:126 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_170_116
                    43:128 primitive_declaration=>modifier_list • identifier : type
                    14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
                    14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
                    14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
                    14:50 function_expression=>modifier_list • fn : type ( ) { }*/
                    /*43:126 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_170_116
                    43:128 primitive_declaration=>modifier_list • identifier : type
                    14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
                    14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
                    14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
                    14:50 function_expression=>modifier_list • fn : type ( ) { }*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    if (/*[fn]*/cmpr_set(l, data, 144, 2, 2)) {
                        /*14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
                        14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
                        14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
                        14:50 function_expression=>modifier_list • fn : type ( ) { }*/
                        /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                        consume(l, data, state);
                        puid |= 2;
                        /*14:44 function_expression=>modifier_list fn • : type ( parameters ) { expression_statements }
                        14:46 function_expression=>modifier_list fn • : type ( ) { expression_statements }
                        14:47 function_expression=>modifier_list fn • : type ( parameters ) { }
                        14:50 function_expression=>modifier_list fn • : type ( ) { }*/
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                        if (l.current_byte == 58/*[:]*/) {
                            consume(l, data, state);
                            puid |= 4;
                            /*14:44 function_expression=>modifier_list fn : • type ( parameters ) { expression_statements }
                            14:46 function_expression=>modifier_list fn : • type ( ) { expression_statements }
                            14:47 function_expression=>modifier_list fn : • type ( parameters ) { }
                            14:50 function_expression=>modifier_list fn : • type ( ) { }*/
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                            pushFN(data, branch_6609a8a1a30397b0);
                            pushFN(data, $type);
                            puid |= 8;
                            return puid;
                        }
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    } else if (((l.current_byte == 95/*[_]*/) || (l.current_byte == 36/*[$]*/)) || l.isUniID(data)) {
                        /*43:126 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_170_116
                        43:128 primitive_declaration=>modifier_list • identifier : type*/
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                        pushFN(data, branch_79c615b855a22f68);
                        pushFN(data, $identifier);
                        puid |= 2;
                        return puid;
                    }
                    break;
            }
            break;
        }
        return prod == 20 ? prod : -1;
    }
    function $expression_statements_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            /*20:62 expression_statements=>expression_statements expression_statements_group_124_109 •*/
            add_reduce(state, data, 2, 39);
        } else if (4 == puid) {
            /*20:63 expression_statements=>expression •*/
            add_reduce(state, data, 1, 3);
        } else if (8 == puid) {
            /*20:64 expression_statements=>primitive_declaration •*/
            add_reduce(state, data, 1, 3);
        }
        return 20;
    }
/*production name: expression
            grammar index: 21
            bodies:
	21:65 expression=>• assignment_expression - 
		21:66 expression=>• if_expression - 
		21:67 expression=>• match_expression - 
		21:68 expression=>• binary_expression - 
		21:69 expression=>• break_expression - 
		21:70 expression=>• return_expression - 
		21:71 expression=>• continue_expression - 
		21:72 expression=>• loop_expression - 
		21:73 expression=>• { expression_statements } - 
		21:74 expression=>• template - 
		21:75 expression=>• { } - 
            compile time: 1155.921ms*/;
    function $expression(l, data, state, prod, puid) {
        /*72:218 template=>• <<-- θnum -->>
        44:130 identifier=>• tk:identifier_token
        21:66 expression=>• if_expression
        21:67 expression=>• match_expression
        21:68 expression=>• binary_expression
        21:69 expression=>• break_expression
        21:70 expression=>• return_expression
        21:71 expression=>• continue_expression
        21:72 expression=>• loop_expression
        21:73 expression=>• { expression_statements }
        21:75 expression=>• { }*/
        switch (sym_map_c4b3dccaa10a8245(l, data)) {
            case 0:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                /*72:218 template=>• <<-- θnum -->>*/
                puid |= 1;
                pushFN(data, branch_ef2dc6f8b6dc9a12);
                pushFN(data, $template);
                return puid;
            case 1:
                /*21:73 expression=>• { expression_statements }
                21:75 expression=>• { }*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l, data, state);
                puid |= 256;
                /*21:73 expression=>{ • expression_statements }
                21:75 expression=>{ • }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if (l.current_byte == 125/*[}]*/) {
                    pushFN(data, branch_038b1722715d8efb);
                    return branch_284b0dc10521fad3(l, data, state, prod, 256);
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if (((((((((((((((/*[if]*/cmpr_set(l, data, 143, 2, 2) ||/*[match]*/cmpr_set(l, data, 67, 5, 5)) ||/*[break]*/cmpr_set(l, data, 72, 5, 5)) ||/*[return]*/cmpr_set(l, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(l, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(l, data, 63, 4, 4)) ||/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) ||/*[==]*/cmpr_set(l, data, 7, 2, 2)) || dt_bcea2102060eab13(l, data)) ||/*[true]*/cmpr_set(l, data, 95, 4, 4)) ||/*[null]*/cmpr_set(l, data, 35, 4, 4)) || dt_6ae31dd85a62ef5c(l, data)) || assert_ascii(l, 0x0, 0x194, 0x88000000, 0x8000000)) || l.isUniID(data)) || l.isNum(data)) || l.isSym(true, data)) {
                    pushFN(data, branch_038b1722715d8efb);
                    return branch_8a9db598cbaf1708(l, data, state, prod, 256);
                }
            case 2:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*21:66 expression=>• if_expression*/
                puid |= 2;
                pushFN(data, branch_038b1722715d8efb);
                pushFN(data, $if_expression);
                return puid;
            case 3:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*21:67 expression=>• match_expression*/
                puid |= 4;
                pushFN(data, branch_038b1722715d8efb);
                pushFN(data, $match_expression);
                return puid;
            case 4:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*21:69 expression=>• break_expression*/
                puid |= 16;
                pushFN(data, branch_038b1722715d8efb);
                pushFN(data, $break_expression);
                return puid;
            case 5:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*21:70 expression=>• return_expression*/
                puid |= 32;
                pushFN(data, branch_038b1722715d8efb);
                pushFN(data, $return_expression);
                return puid;
            case 6:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*21:71 expression=>• continue_expression*/
                puid |= 64;
                pushFN(data, branch_038b1722715d8efb);
                pushFN(data, $continue_expression);
                return puid;
            case 7:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*21:72 expression=>• loop_expression*/
                puid |= 128;
                pushFN(data, branch_038b1722715d8efb);
                pushFN(data, $loop_expression);
                return puid;
            case 8:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                /*44:130 identifier=>• tk:identifier_token*/
                puid |= 1;
                pushFN(data, branch_df9f6863c7454e16);
                pushFN(data, $identifier);
                return puid;
            case 9:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*21:68 expression=>• binary_expression*/
                puid |= 8;
                pushFN(data, branch_038b1722715d8efb);
                pushFN(data, $binary_expression);
                return puid;
            default:
                break;
        }
        return -1;
    }
    function $expression_goto(l, data, state, prod, puid) {
        while (1) {
            switch (prod) {
                case 26:
                    /*25:80 binary_expression=>unary_expression • operator
                    25:81 binary_expression=>unary_expression • operator expression
                    25:82 binary_expression=>unary_expression •*/
                    /*25:80 binary_expression=>unary_expression • operator
                    25:81 binary_expression=>unary_expression • operator expression
                    25:82 binary_expression=>unary_expression •*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    if (sym_map_e58af9c6fd146069(l, data) == 1) {
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*25:82 binary_expression=>unary_expression •*/
                        return 21;
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    } else if (/*[==]*/cmpr_set(l, data, 7, 2, 2) || l.isSym(true, data)) {
                        /*25:80 binary_expression=>unary_expression • operator
                        25:81 binary_expression=>unary_expression • operator expression*/
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                        pushFN(data, branch_dc7a8b1c8c1ed5c9);
                        pushFN(data, $operator);
                        puid |= 2;
                        return puid;
                    }
                    break;
                case 28:
                    /*22:76 assignment_expression=>left_hand_expression • = expression
                    27:85 unary_value=>left_hand_expression •*/
                    /*22:76 assignment_expression=>left_hand_expression • = expression
                    27:85 unary_value=>left_hand_expression •*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    switch (sym_map_00f57473245d5924(l, data)) {
                        case 0:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert ⤋⤋⤋*/
                            /*22:76 assignment_expression=>left_hand_expression • = expression*/
                            puid |= 2;
                            consume(l, data, state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                            puid |= 4;
                            pushFN(data, branch_f403406c2d2f0b6e);
                            pushFN(data, $expression);
                            return puid;
                        default:
                        case 1:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                            /*27:85 unary_value=>left_hand_expression •*/
                            prod = 26;
                            continue;;
                    }
                    break;
                case 37:
                    /*28:91 left_hand_expression=>member_expression •
                    37:115 member_expression=>member_expression • . identifier
                    37:116 member_expression=>member_expression • [ expression ]
                    36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                    36:114 call_expression=>member_expression • ( )*/
                    /*28:91 left_hand_expression=>member_expression •
                    37:116 member_expression=>member_expression • [ expression ]
                    37:115 member_expression=>member_expression • . identifier
                    36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                    36:114 call_expression=>member_expression • ( )*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    switch (sym_map_c82afb129e509311(l, data)) {
                        case 0:
                            /*28:91 left_hand_expression=>member_expression •
                            37:116 member_expression=>member_expression • [ expression ]*/
                            var pk = l.copy();
                            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, 0);
                            switch (sym_map_7b992290c905e3fc(pk, data)) {
                                case 0:
                                    /*--LEAF--*/
                                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                                    /*37:116 member_expression=>member_expression • [ expression ]*/
                                    puid |= 8;
                                    consume(l, data, state);
                                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                                    puid |= 16;
                                    pushFN(data, branch_31ea5f7bcc42c06b);
                                    pushFN(data, $expression);
                                    return puid;
                                default:
                                case 1:
                                    /*--LEAF--*/
                                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                                    /*28:91 left_hand_expression=>member_expression •*/
                                    prod = 28;
                                    continue;;
                                case 2:
                                    /*--LEAF--*/
                                    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                                    /*37:116 member_expression=>member_expression • [ expression ]*/
                                    puid |= 8;
                                    consume(l, data, state);
                                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                                    puid |= 16;
                                    pushFN(data, branch_31ea5f7bcc42c06b);
                                    pushFN(data, $expression);
                                    return puid;
                            }
                        case 1:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert ⤋⤋⤋*/
                            /*37:115 member_expression=>member_expression • . identifier*/
                            puid |= 2;
                            consume(l, data, state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                            puid |= 4;
                            pushFN(data, branch_bb4a0fd4c800480d);
                            pushFN(data, $identifier);
                            return puid;
                        case 2:
                            /*36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                            36:114 call_expression=>member_expression • ( )*/
                            var pk = l.copy();
                            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, 0);
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                            if (pk.current_byte == 41/*[)]*/) {
                                pushFN(data, branch_b6429eb3c6827a44);
                                return branch_f29ead3e741f692c(l, data, state, prod, 1);
                                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                            } else if (((((((((((((((/*[if]*/cmpr_set(pk, data, 143, 2, 2) ||/*[match]*/cmpr_set(pk, data, 67, 5, 5)) ||/*[break]*/cmpr_set(pk, data, 72, 5, 5)) ||/*[return]*/cmpr_set(pk, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(pk, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(pk, data, 63, 4, 4)) ||/*[<<--]*/cmpr_set(pk, data, 20, 4, 4)) ||/*[==]*/cmpr_set(pk, data, 7, 2, 2)) || dt_bcea2102060eab13(pk, data)) ||/*[true]*/cmpr_set(pk, data, 95, 4, 4)) ||/*[null]*/cmpr_set(pk, data, 35, 4, 4)) || dt_6ae31dd85a62ef5c(pk, data)) || assert_ascii(pk, 0x0, 0x194, 0x88000000, 0x8000000)) || pk.isUniID(data)) || pk.isNum(data)) || pk.isSym(true, data)) {
                                pushFN(data, branch_b6429eb3c6827a44);
                                return branch_25c768d9c9093ad1(l, data, state, prod, 1);
                            }
                        default:
                        case 3:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                            /*28:91 left_hand_expression=>member_expression •*/
                            prod = 28;
                            continue;;
                    }
                    break;
                case 72:
                    /*37:117 member_expression=>template •
                    56:169 value=>template •
                    21:74 expression=>template •*/
                    /*37:117 member_expression=>template •
                    56:169 value=>template •
                    21:74 expression=>template •*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    if (sym_map_f52063216c04ca2c(l, data) == 1) {
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*21:74 expression=>template •*/
                        add_reduce(state, data, 1, 41);
                        return 21;
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    } else if (sym_map_4184c2e3affe1a6d(l, data) == 1) {
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*56:169 value=>template •*/
                        add_reduce(state, data, 1, 67);
                        prod = 26;
                        continue;;
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    } else {
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*37:117 member_expression=>template •*/
                        add_reduce(state, data, 1, 67);
                        prod = 37;
                        continue;;
                    }
                    break;
            }
            break;
        }
        return prod == 21 ? prod : -1;
    }
    function $expression_reducer(l, data, state, prod, puid) {
        if (1792 == puid) {
            /*21:73 expression=>{ expression_statements } •*/
            add_reduce(state, data, 3, 40);
        } else if (2048 == puid) {
            /*21:74 expression=>template •*/
            add_reduce(state, data, 1, 41);
        } else if (1280 == puid) {
            /*21:75 expression=>{ } •*/
            add_reduce(state, data, 2, 42);
        }
        return 21;
    }
/*production name: if_expression_group_139_110
            grammar index: 23
            bodies:
	23:77 if_expression_group_139_110=>• else expression - 
            compile time: 2.771ms*/;
    function $if_expression_group_139_110(l, data, state, prod, puid) {
        /*23:77 if_expression_group_139_110=>• else expression*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (/*[else]*/cmpr_set(l, data, 128, 4, 4)) {
            consume(l, data, state);
            puid |= 1;
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*23:77 if_expression_group_139_110=>else • expression*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            puid |= 2;
            pushFN(data, branch_e065d9119934ceb8);
            pushFN(data, $expression);
            return puid;
        }
        return -1;
    }
    function $if_expression_group_139_110_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            /*23:77 if_expression_group_139_110=>else expression •*/
            add_reduce(state, data, 2, 0);
        }
        return 23;
    }
/*production name: if_expression
            grammar index: 24
            bodies:
	24:78 if_expression=>• if expression : expression if_expression_group_139_110 - 
		24:79 if_expression=>• if expression : expression - 
            compile time: 235.756ms*/;
    function $if_expression(l, data, state, prod, puid) {
        /*24:78 if_expression=>• if expression : expression if_expression_group_139_110
        24:79 if_expression=>• if expression : expression*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (/*[if]*/cmpr_set(l, data, 143, 2, 2)) {
            consume(l, data, state);
            puid |= 1;
            /*24:78 if_expression=>if • expression : expression if_expression_group_139_110
            24:79 if_expression=>if • expression : expression*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_e952b63f018b6b02);
            pushFN(data, $expression);
            puid |= 2;
            return puid;
        }
        return -1;
    }
    function $if_expression_reducer(l, data, state, prod, puid) {
        if (15 == puid) {
            /*24:78 if_expression=>if expression : expression if_expression_group_139_110 •*/
            add_reduce(state, data, 5, 44);
        } else if (7 == puid) {
            /*24:79 if_expression=>if expression : expression •*/
            add_reduce(state, data, 4, 45);
        }
        return 24;
    }
/*production name: binary_expression
            grammar index: 25
            bodies:
	25:80 binary_expression=>• unary_expression operator - 
		25:81 binary_expression=>• unary_expression operator expression - 
		25:82 binary_expression=>• unary_expression - 
            compile time: 553.382ms*/;
    function $binary_expression(l, data, state, prod, puid) {
        /*25:80 binary_expression=>• unary_expression operator
        25:81 binary_expression=>• unary_expression operator expression
        25:82 binary_expression=>• unary_expression*/
        pushFN(data, branch_fa39f64b2e53753c);
        pushFN(data, $unary_expression);
        puid |= 1;
        return puid;
        return -1;
    }
    function $binary_expression_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            /*25:80 binary_expression=>unary_expression operator •*/
            add_reduce(state, data, 2, 46);
        } else if (7 == puid) {
            /*25:81 binary_expression=>unary_expression operator expression •*/
            add_reduce(state, data, 3, 47);
        }
        return 25;
    }
/*production name: unary_expression
            grammar index: 26
            bodies:
	26:83 unary_expression=>• operator unary_value - 
		26:84 unary_expression=>• unary_value - 
            compile time: 11.555ms*/;
    function $unary_expression(l, data, state, prod, puid) {
        /*26:83 unary_expression=>• operator unary_value
        26:84 unary_expression=>• unary_value*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (((((((/*[<<--]*/cmpr_set(l, data, 20, 4, 4) || dt_bcea2102060eab13(l, data)) || dt_6ae31dd85a62ef5c(l, data)) ||/*[true]*/cmpr_set(l, data, 95, 4, 4)) ||/*[null]*/cmpr_set(l, data, 35, 4, 4)) || assert_ascii(l, 0x0, 0x194, 0x88000000, 0x0)) || l.isUniID(data)) || l.isNum(data)) {
            pushFN(data, branch_bf312da1e8e7a614);
            return branch_c5bfbfbcef9d932d(l, data, state, prod, 2);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (/*[==]*/cmpr_set(l, data, 7, 2, 2) || l.isSym(true, data)) {
            pushFN(data, branch_bf312da1e8e7a614);
            return branch_69cb1d4883ac2b9b(l, data, state, prod, 1);
        }
        return -1;
    }
    function $unary_expression_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            /*26:83 unary_expression=>operator unary_value •*/
            add_reduce(state, data, 2, 46);
        }
        return 26;
    }
/*production name: unary_value
            grammar index: 27
            bodies:
	27:85 unary_value=>• left_hand_expression - 
		27:86 unary_value=>• call_expression - 
		27:87 unary_value=>• function_expression - 
		27:88 unary_value=>• value - 
		27:89 unary_value=>• ( expression_statements_group_023_108 ) - 
		27:90 unary_value=>• ( ) - 
            compile time: 280.245ms*/;
    function $unary_value(l, data, state, prod, puid) {
        /*72:218 template=>• <<-- θnum -->>
        44:130 identifier=>• tk:identifier_token
        27:87 unary_value=>• function_expression
        27:88 unary_value=>• value
        27:89 unary_value=>• ( expression_statements_group_023_108 )
        27:90 unary_value=>• ( )*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        if (/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) {
            pushFN(data, branch_3e0c941c38400c15);
            return branch_81f78cc7f828c364(l, data, state, prod, 1);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else if (l.current_byte == 40/*[(]*/) {
            /*27:89 unary_value=>• ( expression_statements_group_023_108 )
            27:90 unary_value=>• ( )*/
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l, data, state);
            puid |= 16;
            /*27:89 unary_value=>( • expression_statements_group_023_108 )
            27:90 unary_value=>( • )*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if (l.current_byte == 41/*[)]*/) {
                pushFN(data, branch_07c4b2a266e81cdd);
                return branch_fa55fa3a8510aadd(l, data, state, prod, 16);
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if (((((((((((((((/*[<<--]*/cmpr_set(l, data, 20, 4, 4) ||/*[if]*/cmpr_set(l, data, 143, 2, 2)) ||/*[match]*/cmpr_set(l, data, 67, 5, 5)) ||/*[==]*/cmpr_set(l, data, 7, 2, 2)) || dt_bcea2102060eab13(l, data)) || dt_6ae31dd85a62ef5c(l, data)) ||/*[true]*/cmpr_set(l, data, 95, 4, 4)) ||/*[null]*/cmpr_set(l, data, 35, 4, 4)) ||/*[break]*/cmpr_set(l, data, 72, 5, 5)) ||/*[return]*/cmpr_set(l, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(l, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(l, data, 63, 4, 4)) || assert_ascii(l, 0x0, 0x194, 0x88000000, 0x8000000)) || l.isUniID(data)) || l.isNum(data)) || l.isSym(true, data)) {
                pushFN(data, branch_07c4b2a266e81cdd);
                return branch_8c4605c70c72ddec(l, data, state, prod, 16);
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (/*[fn]*/cmpr_set(l, data, 144, 2, 2) || (l.current_byte == 91/*[[]*/)) {
            pushFN(data, branch_07c4b2a266e81cdd);
            return branch_aabd2b73b3cb3db4(l, data, state, prod, 4);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if ((((((dt_6ae31dd85a62ef5c(l, data) ||/*[true]*/cmpr_set(l, data, 95, 4, 4)) ||/*[false]*/cmpr_set(l, data, 53, 5, 5)) ||/*[null]*/cmpr_set(l, data, 35, 4, 4)) || (l.current_byte == 34/*["]*/)) || (l.current_byte == 39/*[']*/)) || l.isNum(data)) {
            pushFN(data, branch_07c4b2a266e81cdd);
            return branch_0dacddd2ccbd8698(l, data, state, prod, 8);
            /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        } else if (((l.current_byte == 95/*[_]*/) || (l.current_byte == 36/*[$]*/)) || l.isUniID(data)) {
            pushFN(data, branch_d1cfa7d2150e033a);
            return branch_1a42d7243a9cc7d3(l, data, state, prod, 1);
        }
        return -1;
    }
    function $unary_value_goto(l, data, state, prod, puid) {
        while (1) {
            switch (prod) {
                case 37:
                    /*28:91 left_hand_expression=>member_expression •
                    37:115 member_expression=>member_expression • . identifier
                    37:116 member_expression=>member_expression • [ expression ]
                    36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                    36:114 call_expression=>member_expression • ( )*/
                    /*28:91 left_hand_expression=>member_expression •
                    37:116 member_expression=>member_expression • [ expression ]
                    37:115 member_expression=>member_expression • . identifier
                    36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                    36:114 call_expression=>member_expression • ( )*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                    switch (sym_map_c82afb129e509311(l, data)) {
                        case 0:
                            /*28:91 left_hand_expression=>member_expression •
                            37:116 member_expression=>member_expression • [ expression ]*/
                            var pk = l.copy();
                            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, 0);
                            switch (sym_map_7b992290c905e3fc(pk, data)) {
                                case 0:
                                    /*--LEAF--*/
                                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                                    /*37:116 member_expression=>member_expression • [ expression ]*/
                                    puid |= 8;
                                    consume(l, data, state);
                                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                                    puid |= 16;
                                    pushFN(data, branch_424b2ca54b6272ce);
                                    pushFN(data, $expression);
                                    return puid;
                                default:
                                case 1:
                                    /*--LEAF--*/
                                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                                    /*28:91 left_hand_expression=>member_expression •*/
                                    return 27;
                                case 2:
                                    /*--LEAF--*/
                                    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                                    /*37:116 member_expression=>member_expression • [ expression ]*/
                                    puid |= 8;
                                    consume(l, data, state);
                                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                                    puid |= 16;
                                    pushFN(data, branch_424b2ca54b6272ce);
                                    pushFN(data, $expression);
                                    return puid;
                            }
                        case 1:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert ⤋⤋⤋*/
                            /*37:115 member_expression=>member_expression • . identifier*/
                            puid |= 2;
                            consume(l, data, state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                            puid |= 4;
                            pushFN(data, branch_c7b759beb1f3603a);
                            pushFN(data, $identifier);
                            return puid;
                        case 2:
                            /*36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                            36:114 call_expression=>member_expression • ( )*/
                            var pk = l.copy();
                            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, 0);
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                            if (pk.current_byte == 41/*[)]*/) {
                                pushFN(data, branch_1202bfb712d31996);
                                return branch_f29ead3e741f692c(l, data, state, prod, 1);
                                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                            } else if (((((((((((((((/*[if]*/cmpr_set(pk, data, 143, 2, 2) ||/*[match]*/cmpr_set(pk, data, 67, 5, 5)) ||/*[break]*/cmpr_set(pk, data, 72, 5, 5)) ||/*[return]*/cmpr_set(pk, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(pk, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(pk, data, 63, 4, 4)) ||/*[<<--]*/cmpr_set(pk, data, 20, 4, 4)) ||/*[==]*/cmpr_set(pk, data, 7, 2, 2)) || dt_bcea2102060eab13(pk, data)) ||/*[true]*/cmpr_set(pk, data, 95, 4, 4)) ||/*[null]*/cmpr_set(pk, data, 35, 4, 4)) || dt_6ae31dd85a62ef5c(pk, data)) || assert_ascii(pk, 0x0, 0x194, 0x88000000, 0x8000000)) || pk.isUniID(data)) || pk.isNum(data)) || pk.isSym(true, data)) {
                                pushFN(data, branch_1202bfb712d31996);
                                return branch_25c768d9c9093ad1(l, data, state, prod, 1);
                            }
                        default:
                        case 3:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                            /*28:91 left_hand_expression=>member_expression •*/
                            return 27;
                    }
                    break;
                case 72:
                    /*37:117 member_expression=>template •
                    56:169 value=>template •*/
                    /*37:117 member_expression=>template •
                    56:169 value=>template •*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    if (sym_map_4d813588970288e9(l, data) == 1) {
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*37:117 member_expression=>template •*/
                        add_reduce(state, data, 1, 67);
                        prod = 37;
                        continue;;
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    } else {
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*56:169 value=>template •*/
                        add_reduce(state, data, 1, 67);
                        return 27;
                    }
                    break;
            }
            break;
        }
        return prod == 27 ? prod : -1;
    }
    function $unary_value_reducer(l, data, state, prod, puid) {
        if (112 == puid) {
            /*27:89 unary_value=>( expression_statements_group_023_108 ) •*/
            add_reduce(state, data, 3, 48);
        } else if (80 == puid) {
            /*27:90 unary_value=>( ) •*/
            add_reduce(state, data, 2, 49);
        }
        return 27;
    }
/*production name: loop_expression_group_254_111
            grammar index: 29
            bodies:
	29:92 loop_expression_group_254_111=>• ( expression ) - 
		29:93 loop_expression_group_254_111=>• ( ) - 
            compile time: 11.424ms*/;
    function $loop_expression_group_254_111(l, data, state, prod, puid) {
        /*29:92 loop_expression_group_254_111=>• ( expression )
        29:93 loop_expression_group_254_111=>• ( )*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 40/*[(]*/) {
            consume(l, data, state);
            puid |= 1;
            /*29:92 loop_expression_group_254_111=>( • expression )
            29:93 loop_expression_group_254_111=>( • )*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if (l.current_byte == 41/*[)]*/) {
                pushFN(data, branch_bf8e71a01f2eba15);
                return branch_dea289e2d40c0a42(l, data, state, prod, 1);
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if (((((((((((((((/*[<<--]*/cmpr_set(l, data, 20, 4, 4) ||/*[if]*/cmpr_set(l, data, 143, 2, 2)) ||/*[match]*/cmpr_set(l, data, 67, 5, 5)) ||/*[==]*/cmpr_set(l, data, 7, 2, 2)) || dt_bcea2102060eab13(l, data)) || dt_6ae31dd85a62ef5c(l, data)) ||/*[true]*/cmpr_set(l, data, 95, 4, 4)) ||/*[null]*/cmpr_set(l, data, 35, 4, 4)) ||/*[break]*/cmpr_set(l, data, 72, 5, 5)) ||/*[return]*/cmpr_set(l, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(l, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(l, data, 63, 4, 4)) || assert_ascii(l, 0x0, 0x194, 0x88000000, 0x8000000)) || l.isUniID(data)) || l.isNum(data)) || l.isSym(true, data)) {
                pushFN(data, branch_bf8e71a01f2eba15);
                return branch_cd61bf1e7d5fea3e(l, data, state, prod, 1);
            }
        }
        return -1;
    }
    function $loop_expression_group_254_111_reducer(l, data, state, prod, puid) {
        if (7 == puid) {
            /*29:92 loop_expression_group_254_111=>( expression ) •*/
            add_reduce(state, data, 3, 37);
        } else if (5 == puid) {
            /*29:93 loop_expression_group_254_111=>( ) •*/
            add_reduce(state, data, 2, 38);
        }
        return 29;
    }
/*production name: loop_expression_HC_listbody6_112
            grammar index: 30
            bodies:
	30:94 loop_expression_HC_listbody6_112=>• loop_expression_HC_listbody6_112 , expression - 
		30:95 loop_expression_HC_listbody6_112=>• expression - 
            compile time: 305.272ms*/;
    function $loop_expression_HC_listbody6_112(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*30:95 loop_expression_HC_listbody6_112=>• expression*/
        puid |= 4;
        pushFN(data, branch_e56bbc7571cdf1e6);
        pushFN(data, $expression);
        return puid;
        return -1;
    }
    function $loop_expression_HC_listbody6_112_goto(l, data, state, prod, puid) {
        /*30:94 loop_expression_HC_listbody6_112=>loop_expression_HC_listbody6_112 • , expression*/
        /*30:94 loop_expression_HC_listbody6_112=>loop_expression_HC_listbody6_112 • , expression
        31:97 loop_expression=>loop ( parameters ; expression ; loop_expression_HC_listbody6_112 • ) expression
        31:99 loop_expression=>loop ( ; expression ; loop_expression_HC_listbody6_112 • ) expression
        31:100 loop_expression=>loop ( parameters ; ; loop_expression_HC_listbody6_112 • ) expression
        31:102 loop_expression=>loop ( ; ; loop_expression_HC_listbody6_112 • ) expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if (l.current_byte == 44/*[,]*/) {
            pushFN(data, branch_584051a55d809a1f);
            return branch_52629b1407015494(l, data, state, prod, 1);
        }
        return prod == 30 ? prod : -1;
    }
    function $loop_expression_HC_listbody6_112_reducer(l, data, state, prod, puid) {
        if (7 == puid) {
            /*30:94 loop_expression_HC_listbody6_112=>loop_expression_HC_listbody6_112 , expression •*/
            add_reduce(state, data, 3, 36);
        } else if (4 == puid) {
            /*30:95 loop_expression_HC_listbody6_112=>expression •*/
            add_reduce(state, data, 1, 3);
        }
        return 30;
    }
/*production name: loop_expression
            grammar index: 31
            bodies:
	31:96 loop_expression=>• loop loop_expression_group_254_111 expression - 
		31:97 loop_expression=>• loop ( parameters ; expression ; loop_expression_HC_listbody6_112 ) expression - 
		31:98 loop_expression=>• loop ( primitive_declaration in expression ) expression - 
		31:99 loop_expression=>• loop ( ; expression ; loop_expression_HC_listbody6_112 ) expression - 
		31:100 loop_expression=>• loop ( parameters ; ; loop_expression_HC_listbody6_112 ) expression - 
		31:101 loop_expression=>• loop ( parameters ; expression ; ) expression - 
		31:102 loop_expression=>• loop ( ; ; loop_expression_HC_listbody6_112 ) expression - 
		31:103 loop_expression=>• loop ( ; expression ; ) expression - 
		31:104 loop_expression=>• loop ( parameters ; ; ) expression - 
		31:105 loop_expression=>• loop ( ; ; ) expression - 
            compile time: 5868.74ms*/;
    function $loop_expression(l, data, state, prod, puid) {
        /*31:96 loop_expression=>• loop loop_expression_group_254_111 expression
        31:97 loop_expression=>• loop ( parameters ; expression ; loop_expression_HC_listbody6_112 ) expression
        31:98 loop_expression=>• loop ( primitive_declaration in expression ) expression
        31:99 loop_expression=>• loop ( ; expression ; loop_expression_HC_listbody6_112 ) expression
        31:100 loop_expression=>• loop ( parameters ; ; loop_expression_HC_listbody6_112 ) expression
        31:101 loop_expression=>• loop ( parameters ; expression ; ) expression
        31:102 loop_expression=>• loop ( ; ; loop_expression_HC_listbody6_112 ) expression
        31:103 loop_expression=>• loop ( ; expression ; ) expression
        31:104 loop_expression=>• loop ( parameters ; ; ) expression
        31:105 loop_expression=>• loop ( ; ; ) expression*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (/*[loop]*/cmpr_set(l, data, 63, 4, 4)) {
            consume(l, data, state);
            puid |= 1;
            /*31:96 loop_expression=>loop • loop_expression_group_254_111 expression
            31:97 loop_expression=>loop • ( parameters ; expression ; loop_expression_HC_listbody6_112 ) expression
            31:98 loop_expression=>loop • ( primitive_declaration in expression ) expression
            31:99 loop_expression=>loop • ( ; expression ; loop_expression_HC_listbody6_112 ) expression
            31:100 loop_expression=>loop • ( parameters ; ; loop_expression_HC_listbody6_112 ) expression
            31:101 loop_expression=>loop • ( parameters ; expression ; ) expression
            31:102 loop_expression=>loop • ( ; ; loop_expression_HC_listbody6_112 ) expression
            31:103 loop_expression=>loop • ( ; expression ; ) expression
            31:104 loop_expression=>loop • ( parameters ; ; ) expression
            31:105 loop_expression=>loop • ( ; ; ) expression*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (l.current_byte == 40/*[(]*/) {
                /*31:96 loop_expression=>loop • loop_expression_group_254_111 expression
                31:97 loop_expression=>loop • ( parameters ; expression ; loop_expression_HC_listbody6_112 ) expression
                31:98 loop_expression=>loop • ( primitive_declaration in expression ) expression
                31:100 loop_expression=>loop • ( parameters ; ; loop_expression_HC_listbody6_112 ) expression
                31:101 loop_expression=>loop • ( parameters ; expression ; ) expression
                31:104 loop_expression=>loop • ( parameters ; ; ) expression
                31:99 loop_expression=>loop • ( ; expression ; loop_expression_HC_listbody6_112 ) expression
                31:102 loop_expression=>loop • ( ; ; loop_expression_HC_listbody6_112 ) expression
                31:103 loop_expression=>loop • ( ; expression ; ) expression
                31:105 loop_expression=>loop • ( ; ; ) expression*/
                var pk = l.copy();
                skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, 0);
                switch (sym_map_67674cb228ad79e2(pk, data)) {
                    case 0:
                        /*31:99 loop_expression=>loop • ( ; expression ; loop_expression_HC_listbody6_112 ) expression
                        31:102 loop_expression=>loop • ( ; ; loop_expression_HC_listbody6_112 ) expression
                        31:103 loop_expression=>loop • ( ; expression ; ) expression
                        31:105 loop_expression=>loop • ( ; ; ) expression*/
                        /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                        consume(l, data, state);
                        puid |= 8;
                        /*31:99 loop_expression=>loop ( • ; expression ; loop_expression_HC_listbody6_112 ) expression
                        31:102 loop_expression=>loop ( • ; ; loop_expression_HC_listbody6_112 ) expression
                        31:103 loop_expression=>loop ( • ; expression ; ) expression
                        31:105 loop_expression=>loop ( • ; ; ) expression*/
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                        if (l.current_byte == 59/*[;]*/) {
                            consume(l, data, state);
                            puid |= 32;
                            /*31:99 loop_expression=>loop ( ; • expression ; loop_expression_HC_listbody6_112 ) expression
                            31:103 loop_expression=>loop ( ; • expression ; ) expression
                            31:102 loop_expression=>loop ( ; • ; loop_expression_HC_listbody6_112 ) expression
                            31:105 loop_expression=>loop ( ; • ; ) expression*/
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                            if (l.current_byte == 59/*[;]*/) {
                                /*31:102 loop_expression=>loop ( ; • ; loop_expression_HC_listbody6_112 ) expression
                                31:105 loop_expression=>loop ( ; • ; ) expression*/
                                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                                consume(l, data, state);
                                puid |= 32;
                                /*31:102 loop_expression=>loop ( ; ; • loop_expression_HC_listbody6_112 ) expression
                                31:105 loop_expression=>loop ( ; ; • ) expression*/
                                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                                /*⤋⤋⤋ assert ⤋⤋⤋*/
                                if (l.current_byte == 41/*[)]*/) {
                                    pushFN(data, branch_5814d05b2ded1273);
                                    return branch_ce83789161f829c7(l, data, state, prod, 32);
                                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                                } else if (((((((((((((((/*[if]*/cmpr_set(l, data, 143, 2, 2) ||/*[match]*/cmpr_set(l, data, 67, 5, 5)) ||/*[break]*/cmpr_set(l, data, 72, 5, 5)) ||/*[return]*/cmpr_set(l, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(l, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(l, data, 63, 4, 4)) ||/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) ||/*[==]*/cmpr_set(l, data, 7, 2, 2)) || dt_bcea2102060eab13(l, data)) ||/*[true]*/cmpr_set(l, data, 95, 4, 4)) ||/*[null]*/cmpr_set(l, data, 35, 4, 4)) || dt_6ae31dd85a62ef5c(l, data)) || assert_ascii(l, 0x0, 0x194, 0x88000000, 0x8000000)) || l.isUniID(data)) || l.isNum(data)) || l.isSym(true, data)) {
                                    pushFN(data, branch_5814d05b2ded1273);
                                    return branch_124a960811fb5e08(l, data, state, prod, 32);
                                }
                                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                            } else if (((((((((((((((/*[<<--]*/cmpr_set(l, data, 20, 4, 4) ||/*[if]*/cmpr_set(l, data, 143, 2, 2)) ||/*[match]*/cmpr_set(l, data, 67, 5, 5)) ||/*[==]*/cmpr_set(l, data, 7, 2, 2)) || dt_bcea2102060eab13(l, data)) || dt_6ae31dd85a62ef5c(l, data)) ||/*[true]*/cmpr_set(l, data, 95, 4, 4)) ||/*[null]*/cmpr_set(l, data, 35, 4, 4)) ||/*[break]*/cmpr_set(l, data, 72, 5, 5)) ||/*[return]*/cmpr_set(l, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(l, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(l, data, 63, 4, 4)) || assert_ascii(l, 0x0, 0x194, 0x88000000, 0x8000000)) || l.isUniID(data)) || l.isNum(data)) || l.isSym(true, data)) {
                                /*31:99 loop_expression=>loop ( ; • expression ; loop_expression_HC_listbody6_112 ) expression
                                31:103 loop_expression=>loop ( ; • expression ; ) expression*/
                                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                                pushFN(data, branch_256d8d5c6f72d0ad);
                                pushFN(data, $expression);
                                puid |= 4;
                                return puid;
                            }
                        }
                    case 1:
                        /*--LEAF--*/
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                        /*31:96 loop_expression=>loop • loop_expression_group_254_111 expression*/
                        puid |= 2;
                        pushFN(data, branch_1a1ef827e5ad57cd);
                        pushFN(data, $loop_expression_group_254_111);
                        return puid;
                    case 2:
                        /*-------------VPROD-------------------------*/
                        /*31:96 loop_expression=>loop • loop_expression_group_254_111 expression
                        31:97 loop_expression=>loop • ( parameters ; expression ; loop_expression_HC_listbody6_112 ) expression
                        31:100 loop_expression=>loop • ( parameters ; ; loop_expression_HC_listbody6_112 ) expression
                        31:101 loop_expression=>loop • ( parameters ; expression ; ) expression
                        31:104 loop_expression=>loop • ( parameters ; ; ) expression
                        31:98 loop_expression=>loop • ( primitive_declaration in expression ) expression*/
                        pushFN(data, branch_89d9ca66aef7ab46);
                        return 0;
                    default:
                        break;
                }
            }
        }
        return -1;
    }
    function $loop_expression_reducer(l, data, state, prod, puid) {
        if (7 == puid) {
            /*31:96 loop_expression=>loop loop_expression_group_254_111 expression •*/
            add_reduce(state, data, 3, 50);
        } else if (253 == puid) {
            /*31:97 loop_expression=>loop ( parameters ; expression ; loop_expression_HC_listbody6_112 ) expression •*/
            add_reduce(state, data, 9, 51);
        } else if (909 == puid) {
            /*31:98 loop_expression=>loop ( primitive_declaration in expression ) expression •*/
            add_reduce(state, data, 7, 52);
        } else if (237 == puid) {
            /*31:99 loop_expression=>loop ( ; expression ; loop_expression_HC_listbody6_112 ) expression •*/
            add_reduce(state, data, 8, 53);
        } else if (253 == puid) {
            /*31:100 loop_expression=>loop ( parameters ; ; loop_expression_HC_listbody6_112 ) expression •*/
            add_reduce(state, data, 8, 54);
        } else if (189 == puid) {
            /*31:101 loop_expression=>loop ( parameters ; expression ; ) expression •*/
            add_reduce(state, data, 8, 55);
        } else if (237 == puid) {
            /*31:102 loop_expression=>loop ( ; ; loop_expression_HC_listbody6_112 ) expression •*/
            add_reduce(state, data, 7, 56);
        } else if (173 == puid) {
            /*31:103 loop_expression=>loop ( ; expression ; ) expression •*/
            add_reduce(state, data, 7, 57);
        } else if (189 == puid) {
            /*31:104 loop_expression=>loop ( parameters ; ; ) expression •*/
            add_reduce(state, data, 7, 58);
        } else if (173 == puid) {
            /*31:105 loop_expression=>loop ( ; ; ) expression •*/
            add_reduce(state, data, 6, 59);
        }
        return 31;
    }
/*production name: match_expression_HC_listbody3_113
            grammar index: 32
            bodies:
	32:106 match_expression_HC_listbody3_113=>• match_expression_HC_listbody3_113 , match_clause - 
		32:107 match_expression_HC_listbody3_113=>• match_clause - 
            compile time: 215.542ms*/;
    function $match_expression_HC_listbody3_113(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*32:107 match_expression_HC_listbody3_113=>• match_clause*/
        puid |= 4;
        pushFN(data, branch_78aa7468cfc4789b);
        pushFN(data, $match_clause);
        return puid;
        return -1;
    }
    function $match_expression_HC_listbody3_113_goto(l, data, state, prod, puid) {
        /*32:106 match_expression_HC_listbody3_113=>match_expression_HC_listbody3_113 • , match_clause*/
        /*32:106 match_expression_HC_listbody3_113=>match_expression_HC_listbody3_113 • , match_clause
        33:108 match_expression=>match expression : match_expression_HC_listbody3_113 •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
        if (l.current_byte == 44/*[,]*/) {
            pushFN(data, branch_9ebcaffd71102f54);
            return branch_abbab37a8b5c11c0(l, data, state, prod, 1);
        }
        return prod == 32 ? prod : -1;
    }
    function $match_expression_HC_listbody3_113_reducer(l, data, state, prod, puid) {
        if (7 == puid) {
            /*32:106 match_expression_HC_listbody3_113=>match_expression_HC_listbody3_113 , match_clause •*/
            add_reduce(state, data, 3, 36);
        } else if (4 == puid) {
            /*32:107 match_expression_HC_listbody3_113=>match_clause •*/
            add_reduce(state, data, 1, 3);
        }
        return 32;
    }
/*production name: match_expression
            grammar index: 33
            bodies:
	33:108 match_expression=>• match expression : match_expression_HC_listbody3_113 - 
		33:109 match_expression=>• match expression : - 
            compile time: 224.736ms*/;
    function $match_expression(l, data, state, prod, puid) {
        /*33:108 match_expression=>• match expression : match_expression_HC_listbody3_113
        33:109 match_expression=>• match expression :*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (/*[match]*/cmpr_set(l, data, 67, 5, 5)) {
            consume(l, data, state);
            puid |= 1;
            /*33:108 match_expression=>match • expression : match_expression_HC_listbody3_113
            33:109 match_expression=>match • expression :*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_f43d144a15ffcf8b);
            pushFN(data, $expression);
            puid |= 2;
            return puid;
        }
        return -1;
    }
    function $match_expression_reducer(l, data, state, prod, puid) {
        if (15 == puid) {
            /*33:108 match_expression=>match expression : match_expression_HC_listbody3_113 •*/
            add_reduce(state, data, 4, 60);
        } else if (7 == puid) {
            /*33:109 match_expression=>match expression : •*/
            add_reduce(state, data, 3, 61);
        }
        return 33;
    }
/*production name: match_clause
            grammar index: 34
            bodies:
	34:110 match_clause=>• expression : expression - 
            compile time: 3.719ms*/;
    function $match_clause(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*34:110 match_clause=>• expression : expression*/
        puid |= 1;
        pushFN(data, branch_a54dd2b31946efcd);
        pushFN(data, $expression);
        return puid;
        return -1;
    }
    function $match_clause_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            /*34:110 match_clause=>expression : expression •*/
            add_reduce(state, data, 3, 62);
        }
        return 34;
    }
/*production name: call_expression_HC_listbody2_114
            grammar index: 35
            bodies:
	35:111 call_expression_HC_listbody2_114=>• call_expression_HC_listbody2_114 , expression - 
		35:112 call_expression_HC_listbody2_114=>• expression - 
            compile time: 11.128ms*/;
    function $call_expression_HC_listbody2_114(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*35:112 call_expression_HC_listbody2_114=>• expression*/
        puid |= 4;
        pushFN(data, branch_cad3222afff33c8d);
        pushFN(data, $expression);
        return puid;
        return -1;
    }
    function $call_expression_HC_listbody2_114_goto(l, data, state, prod, puid) {
        /*35:111 call_expression_HC_listbody2_114=>call_expression_HC_listbody2_114 • , expression*/
        /*35:111 call_expression_HC_listbody2_114=>call_expression_HC_listbody2_114 • , expression
        36:113 call_expression=>member_expression ( call_expression_HC_listbody2_114 • )*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if (l.current_byte == 44/*[,]*/) {
            pushFN(data, branch_4362b80f6cbd9c89);
            return branch_06e278ea7237a7d2(l, data, state, prod, 1);
        }
        return prod == 35 ? prod : -1;
    }
    function $call_expression_HC_listbody2_114_reducer(l, data, state, prod, puid) {
        if (7 == puid) {
            /*35:111 call_expression_HC_listbody2_114=>call_expression_HC_listbody2_114 , expression •*/
            add_reduce(state, data, 3, 36);
        } else if (4 == puid) {
            /*35:112 call_expression_HC_listbody2_114=>expression •*/
            add_reduce(state, data, 1, 3);
        }
        return 35;
    }
/*production name: break_expression_group_165_115
            grammar index: 38
            bodies:
	38:119 break_expression_group_165_115=>• : expression - 
            compile time: 3.259ms*/;
    function $break_expression_group_165_115(l, data, state, prod, puid) {
        /*38:119 break_expression_group_165_115=>• : expression*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 58/*[:]*/) {
            consume(l, data, state);
            puid |= 1;
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*38:119 break_expression_group_165_115=>: • expression*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            puid |= 2;
            pushFN(data, branch_a280998f5fd578b8);
            pushFN(data, $expression);
            return puid;
        }
        return -1;
    }
    function $break_expression_group_165_115_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            /*38:119 break_expression_group_165_115=>: expression •*/
            add_reduce(state, data, 2, 0);
        }
        return 38;
    }
/*production name: break_expression
            grammar index: 39
            bodies:
	39:120 break_expression=>• break break_expression_group_165_115 - 
		39:121 break_expression=>• break - 
            compile time: 223.754ms*/;
    function $break_expression(l, data, state, prod, puid) {
        /*39:120 break_expression=>• break break_expression_group_165_115
        39:121 break_expression=>• break*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (/*[break]*/cmpr_set(l, data, 72, 5, 5)) {
            consume(l, data, state);
            puid |= 1;
            /*39:120 break_expression=>break • break_expression_group_165_115
            39:121 break_expression=>break •*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            switch (sym_map_9fff07fe93fb5f87(l, data)) {
                case 0:
                    /*39:120 break_expression=>break • break_expression_group_165_115
                    39:121 break_expression=>break •*/
                    var pk = l.copy();
                    skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, 0);
                    switch (sym_map_78d5b6d9f4631c4b(pk, data)) {
                        default:
                        case 0:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                            /*39:121 break_expression=>break •*/
                            add_reduce(state, data, 1, 70);
                            return 39;
                        case 1:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                            /*39:120 break_expression=>break • break_expression_group_165_115*/
                            puid |= 2;
                            pushFN(data, branch_3407808ab5fd5271);
                            pushFN(data, $break_expression_group_165_115);
                            return puid;
                    }
                default:
                case 1:
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    /*39:121 break_expression=>break •*/
                    add_reduce(state, data, 1, 70);
                    return 39;
            }
        }
        return -1;
    }
    function $break_expression_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            /*39:120 break_expression=>break break_expression_group_165_115 •*/
            add_reduce(state, data, 2, 69);
        } else if (1 == puid) {
            /*39:121 break_expression=>break •*/
            add_reduce(state, data, 1, 70);
        }
        return 39;
    }
/*production name: return_expression
            grammar index: 40
            bodies:
	40:122 return_expression=>• return break_expression_group_165_115 - 
		40:123 return_expression=>• return - 
            compile time: 237.067ms*/;
    function $return_expression(l, data, state, prod, puid) {
        /*40:122 return_expression=>• return break_expression_group_165_115
        40:123 return_expression=>• return*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (/*[return]*/cmpr_set(l, data, 77, 6, 6)) {
            consume(l, data, state);
            puid |= 1;
            /*40:122 return_expression=>return • break_expression_group_165_115
            40:123 return_expression=>return •*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            switch (sym_map_9fff07fe93fb5f87(l, data)) {
                case 0:
                    /*40:122 return_expression=>return • break_expression_group_165_115
                    40:123 return_expression=>return •*/
                    var pk = l.copy();
                    skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, 0);
                    switch (sym_map_78d5b6d9f4631c4b(pk, data)) {
                        default:
                        case 0:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                            /*40:123 return_expression=>return •*/
                            add_reduce(state, data, 1, 72);
                            return 40;
                        case 1:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                            /*40:122 return_expression=>return • break_expression_group_165_115*/
                            puid |= 2;
                            pushFN(data, branch_a096c4c7ffee9637);
                            pushFN(data, $break_expression_group_165_115);
                            return puid;
                    }
                default:
                case 1:
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    /*40:123 return_expression=>return •*/
                    add_reduce(state, data, 1, 72);
                    return 40;
            }
        }
        return -1;
    }
    function $return_expression_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            /*40:122 return_expression=>return break_expression_group_165_115 •*/
            add_reduce(state, data, 2, 71);
        } else if (1 == puid) {
            /*40:123 return_expression=>return •*/
            add_reduce(state, data, 1, 72);
        }
        return 40;
    }
/*production name: continue_expression
            grammar index: 41
            bodies:
	41:124 continue_expression=>• continue - 
            compile time: 1.556ms*/;
    function $continue_expression(l, data, state, prod, puid) {
        /*41:124 continue_expression=>• continue*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (/*[continue]*/cmpr_set(l, data, 39, 8, 8)) {
            consume(l, data, state);
            puid |= 1;
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*41:124 continue_expression=>continue •*/
            add_reduce(state, data, 1, 73);
            return 41;
        }
        return -1;
    }
    function $continue_expression_reducer(l, data, state, prod, puid) {
        if (1 == puid) {
            /*41:124 continue_expression=>continue •*/
            add_reduce(state, data, 1, 73);
        }
        return 41;
    }
/*production name: primitive_declaration_group_170_116
            grammar index: 42
            bodies:
	42:125 primitive_declaration_group_170_116=>• = expression - 
            compile time: 2.166ms*/;
    function $primitive_declaration_group_170_116(l, data, state, prod, puid) {
        /*42:125 primitive_declaration_group_170_116=>• = expression*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 61/*[=]*/) {
            consume(l, data, state);
            puid |= 1;
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*42:125 primitive_declaration_group_170_116=>= • expression*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            puid |= 2;
            pushFN(data, branch_54a2284eebb4a6fc);
            pushFN(data, $expression);
            return puid;
        }
        return -1;
    }
    function $primitive_declaration_group_170_116_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            /*42:125 primitive_declaration_group_170_116=>= expression •*/
            add_reduce(state, data, 2, 0);
        }
        return 42;
    }
/*production name: primitive_declaration
            grammar index: 43
            bodies:
	43:126 primitive_declaration=>• modifier_list identifier : type primitive_declaration_group_170_116 - 
		43:127 primitive_declaration=>• identifier : type primitive_declaration_group_170_116 - 
		43:128 primitive_declaration=>• modifier_list identifier : type - 
		43:129 primitive_declaration=>• identifier : type - 
            compile time: 230.924ms*/;
    function $primitive_declaration(l, data, state, prod, puid) {
        /*43:126 primitive_declaration=>• modifier_list identifier : type primitive_declaration_group_170_116
        43:128 primitive_declaration=>• modifier_list identifier : type
        43:127 primitive_declaration=>• identifier : type primitive_declaration_group_170_116
        43:129 primitive_declaration=>• identifier : type*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 91/*[[]*/) {
            /*43:126 primitive_declaration=>• modifier_list identifier : type primitive_declaration_group_170_116
            43:128 primitive_declaration=>• modifier_list identifier : type*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_b5ffa44e72d80037);
            pushFN(data, $modifier_list);
            puid |= 1;
            return puid;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (((l.current_byte == 95/*[_]*/) || (l.current_byte == 36/*[$]*/)) || l.isUniID(data)) {
            /*43:127 primitive_declaration=>• identifier : type primitive_declaration_group_170_116
            43:129 primitive_declaration=>• identifier : type*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            pushFN(data, branch_e65b69b5a96d5210);
            pushFN(data, $identifier);
            puid |= 2;
            return puid;
        }
        return -1;
    }
    function $primitive_declaration_reducer(l, data, state, prod, puid) {
        if (31 == puid) {
            /*43:126 primitive_declaration=>modifier_list identifier : type primitive_declaration_group_170_116 •*/
            add_reduce(state, data, 5, 74);
        } else if (30 == puid) {
            /*43:127 primitive_declaration=>identifier : type primitive_declaration_group_170_116 •*/
            add_reduce(state, data, 4, 75);
        } else if (15 == puid) {
            /*43:128 primitive_declaration=>modifier_list identifier : type •*/
            add_reduce(state, data, 4, 76);
        } else if (14 == puid) {
            /*43:129 primitive_declaration=>identifier : type •*/
            add_reduce(state, data, 3, 77);
        }
        return 43;
    }
/*production name: identifier
            grammar index: 44
            bodies:
	44:130 identifier=>• tk:identifier_token - 
            compile time: 1.383ms*/;
    function $identifier(l, data, state, prod, puid) {
        /*44:130 identifier=>• tk:identifier_token*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (tk_9b328de7de7e3e1d(l, data)) {
            consume(l, data, state);
            puid |= 1;
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*44:130 identifier=>tk:identifier_token •*/
            add_reduce(state, data, 1, 78);
            return 44;
        }
        return -1;
    }
    function $identifier_reducer(l, data, state, prod, puid) {
        if (1 == puid) {
            /*44:130 identifier=>tk:identifier_token •*/
            add_reduce(state, data, 1, 78);
        }
        return 44;
    }
/*production name: identifier_token_group_075_117
            grammar index: 45
            bodies:
	45:131 identifier_token_group_075_117=>• θid - 
		45:132 identifier_token_group_075_117=>• _ - 
		45:133 identifier_token_group_075_117=>• $ - 
            compile time: 3.027ms*/;
    function $identifier_token_group_075_117(l, data, state, prod, puid) {
        /*45:131 identifier_token_group_075_117=>• θid
        45:132 identifier_token_group_075_117=>• _
        45:133 identifier_token_group_075_117=>• $*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if (l.isUniID(data)) {
            pushFN(data, branch_308bdd9a72b6d6bd);
            return branch_e9ed1a366e98482e(l, data, state, prod, 1);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.current_byte == 95/*[_]*/) {
            pushFN(data, branch_308bdd9a72b6d6bd);
            return branch_819e4e3596f30d3b(l, data, state, prod, 2);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.current_byte == 36/*[$]*/) {
            pushFN(data, branch_308bdd9a72b6d6bd);
            return branch_6b51261485f4be10(l, data, state, prod, 4);
        }
        return -1;
    }
    function $identifier_token_group_075_117_reducer(l, data, state, prod, puid) {
        return 45;
    }
/*production name: identifier_token_HC_listbody1_118
            grammar index: 46
            bodies:
	46:134 identifier_token_HC_listbody1_118=>• identifier_token_HC_listbody1_118 identifier_token_group_075_117 - 
		46:135 identifier_token_HC_listbody1_118=>• identifier_token_group_075_117 - 
            compile time: 251.808ms*/;
    function $identifier_token_HC_listbody1_118(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*46:135 identifier_token_HC_listbody1_118=>• identifier_token_group_075_117*/
        puid |= 2;
        pushFN(data, branch_d6adce891265bf33);
        pushFN(data, $identifier_token_group_075_117);
        return puid;
        return -1;
    }
    function $identifier_token_HC_listbody1_118_goto(l, data, state, prod, puid) {
        /*46:134 identifier_token_HC_listbody1_118=>identifier_token_HC_listbody1_118 • identifier_token_group_075_117*/
        if (nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/) {
            return 46;
        }
        /*46:134 identifier_token_HC_listbody1_118=>identifier_token_HC_listbody1_118 • identifier_token_group_075_117
        48:140 identifier_token=>identifier_token_group_075_117 identifier_token_HC_listbody1_118 •
        48:138 identifier_token=>identifier_token_group_075_117 identifier_token_HC_listbody1_118 • identifier_token_group_080_119*/
        skip_db1786a8af54d666(l/*[ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if (l.isUniID(data)) {
            /*46:134 identifier_token_HC_listbody1_118=>identifier_token_HC_listbody1_118 • identifier_token_group_075_117*/
            var pk = l.copy();
            skip_db1786a8af54d666(pk.next(data)/*[ 71 ]*/, data, 0);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            if (nocap_b2eb52235ee30b8a(pk)/*[ws] [nl]*/) {
                pushFN(data, branch_2a33947dd011020b);
                return branch_d0f01970c18665af(l, data, state, prod, 1);
                /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
            } else if (((((((dt_dc6530084293e429(pk, data) ||/*[str]*/cmpr_set(pk, data, 47, 3, 3)) ||/*[fn]*/cmpr_set(pk, data, 144, 2, 2)) ||/*[==]*/cmpr_set(pk, data, 7, 2, 2)) ||/*[else]*/cmpr_set(pk, data, 128, 4, 4)) || assert_ascii(pk, 0x0, 0x2c005310, 0xa8000000, 0x28000000)) || pk.isUniID(data)) || pk.isSym(true, data)) {
                pushFN(data, branch_2a33947dd011020b);
                return branch_f5f2356c9bc9b5b7(l, data, state, prod, 1);
            }
            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
        } else if ((l.current_byte == 95/*[_]*/) || (l.current_byte == 36/*[$]*/)) {
            pushFN(data, branch_2a33947dd011020b);
            return branch_f5f2356c9bc9b5b7(l, data, state, prod, 1);
        }
        return prod == 46 ? prod : -1;
    }
    function $identifier_token_HC_listbody1_118_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            /*46:134 identifier_token_HC_listbody1_118=>identifier_token_HC_listbody1_118 identifier_token_group_075_117 •*/
            add_reduce(state, data, 2, 2);
        } else if (2 == puid) {
            /*46:135 identifier_token_HC_listbody1_118=>identifier_token_group_075_117 •*/
            add_reduce(state, data, 1, 3);
        }
        return 46;
    }
/*production name: identifier_token_group_080_119
            grammar index: 47
            bodies:
	47:136 identifier_token_group_080_119=>• θws - 
		47:137 identifier_token_group_080_119=>• θnl - 
            compile time: 2.879ms*/;
    function $identifier_token_group_080_119(l, data, state, prod, puid) {
        /*47:136 identifier_token_group_080_119=>• θws
        47:137 identifier_token_group_080_119=>• θnl*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if (nocap_108e16629a73e761(l)/*[ws]*/) {
            pushFN(data, branch_f74c3bed1eecf572);
            return branch_dec7210022a48f17(l, data, state, prod, 1);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (nocap_9b1ef04606bbaa09(l)/*[nl]*/) {
            pushFN(data, branch_f74c3bed1eecf572);
            return branch_8f37025c10045eb0(l, data, state, prod, 2);
        }
        return -1;
    }
    function $identifier_token_group_080_119_reducer(l, data, state, prod, puid) {
        return 47;
    }
/*production name: identifier_token
            grammar index: 48
            bodies:
	48:138 identifier_token=>• identifier_token_group_075_117 identifier_token_HC_listbody1_118 identifier_token_group_080_119 - 
		48:139 identifier_token=>• identifier_token_group_075_117 identifier_token_group_080_119 - 
		48:140 identifier_token=>• identifier_token_group_075_117 identifier_token_HC_listbody1_118 - 
		48:141 identifier_token=>• identifier_token_group_075_117 - 
            compile time: 768.194ms*/;
    function $identifier_token(l, data, state, prod, puid) {
        /*48:138 identifier_token=>• identifier_token_group_075_117 identifier_token_HC_listbody1_118 identifier_token_group_080_119
        48:139 identifier_token=>• identifier_token_group_075_117 identifier_token_group_080_119
        48:140 identifier_token=>• identifier_token_group_075_117 identifier_token_HC_listbody1_118
        48:141 identifier_token=>• identifier_token_group_075_117*/
        pushFN(data, branch_72ca5293d8fd6bed);
        pushFN(data, $identifier_token_group_075_117);
        puid |= 1;
        return puid;
        return -1;
    }
    function $identifier_token_reducer(l, data, state, prod, puid) {
        if (7 == puid) {
            /*48:138 identifier_token=>identifier_token_group_075_117 identifier_token_HC_listbody1_118 identifier_token_group_080_119 •*/
            add_reduce(state, data, 3, 0);
        } else if (5 == puid) {
            /*48:139 identifier_token=>identifier_token_group_075_117 identifier_token_group_080_119 •*/
            add_reduce(state, data, 2, 0);
        } else if (3 == puid) {
            /*48:140 identifier_token=>identifier_token_group_075_117 identifier_token_HC_listbody1_118 •*/
            add_reduce(state, data, 2, 0);
        }
        return 48;
    }
/*production name: modifier_list_HC_listbody1_120
            grammar index: 49
            bodies:
	49:142 modifier_list_HC_listbody1_120=>• modifier_list_HC_listbody1_120 modifier - 
		49:143 modifier_list_HC_listbody1_120=>• modifier - 
            compile time: 4.969ms*/;
    function $modifier_list_HC_listbody1_120(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*49:143 modifier_list_HC_listbody1_120=>• modifier*/
        puid |= 2;
        pushFN(data, branch_dc83f428871b16c3);
        pushFN(data, $modifier);
        return puid;
        return -1;
    }
    function $modifier_list_HC_listbody1_120_goto(l, data, state, prod, puid) {
        /*49:142 modifier_list_HC_listbody1_120=>modifier_list_HC_listbody1_120 • modifier*/
        /*49:142 modifier_list_HC_listbody1_120=>modifier_list_HC_listbody1_120 • modifier
        50:144 modifier_list=>[ modifier_list_HC_listbody1_120 • ]*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if ((((dt_a0570d6d5c8952c6(l, data) ||/*[export]*/cmpr_set(l, data, 57, 6, 6)) ||/*[mut]*/cmpr_set(l, data, 117, 3, 3)) ||/*[imut]*/cmpr_set(l, data, 116, 4, 4)) || l.isUniID(data)) {
            pushFN(data, branch_e6262d2fc73c8fb2);
            return branch_8b3b56fff2880b29(l, data, state, prod, 1);
        }
        return prod == 49 ? prod : -1;
    }
    function $modifier_list_HC_listbody1_120_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            /*49:142 modifier_list_HC_listbody1_120=>modifier_list_HC_listbody1_120 modifier •*/
            add_reduce(state, data, 2, 2);
        } else if (2 == puid) {
            /*49:143 modifier_list_HC_listbody1_120=>modifier •*/
            add_reduce(state, data, 1, 3);
        }
        return 49;
    }
/*production name: modifier_list
            grammar index: 50
            bodies:
	50:144 modifier_list=>• [ modifier_list_HC_listbody1_120 ] - 
            compile time: 2.401ms*/;
    function $modifier_list(l, data, state, prod, puid) {
        /*50:144 modifier_list=>• [ modifier_list_HC_listbody1_120 ]*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 91/*[[]*/) {
            consume(l, data, state);
            puid |= 1;
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*50:144 modifier_list=>[ • modifier_list_HC_listbody1_120 ]*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            puid |= 2;
            pushFN(data, branch_200e004ce92f80ce);
            pushFN(data, $modifier_list_HC_listbody1_120);
            return puid;
        }
        return -1;
    }
    function $modifier_list_reducer(l, data, state, prod, puid) {
        if (7 == puid) {
            /*50:144 modifier_list=>[ modifier_list_HC_listbody1_120 ] •*/
            add_reduce(state, data, 3, 37);
        }
        return 50;
    }
/*production name: type_group_087_121
            grammar index: 51
            bodies:
	51:145 type_group_087_121=>• u - 
		51:146 type_group_087_121=>• i - 
		51:147 type_group_087_121=>• uint - 
		51:148 type_group_087_121=>• int - 
            compile time: 2.78ms*/;
    function $type_group_087_121(l, data, state, prod, puid) {
        /*51:145 type_group_087_121=>• u
        51:146 type_group_087_121=>• i
        51:147 type_group_087_121=>• uint
        51:148 type_group_087_121=>• int*/
        switch (sym_map_452608436dcadf92(l, data)) {
            case 0:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*51:145 type_group_087_121=>• u*/
                puid |= 1;
                consume(l, data, state);
                return 51;
            case 1:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*51:146 type_group_087_121=>• i*/
                puid |= 2;
                consume(l, data, state);
                return 51;
            case 2:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*51:147 type_group_087_121=>• uint*/
                puid |= 4;
                consume(l, data, state);
                return 51;
            case 3:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*51:148 type_group_087_121=>• int*/
                puid |= 8;
                consume(l, data, state);
                return 51;
            default:
                break;
        }
        return -1;
    }
    function $type_group_087_121_reducer(l, data, state, prod, puid) {
        return 51;
    }
/*production name: type_group_092_122
            grammar index: 52
            bodies:
	52:149 type_group_092_122=>• 8 - 
		52:150 type_group_092_122=>• 16 - 
		52:151 type_group_092_122=>• 32 - 
		52:152 type_group_092_122=>• 64 - 
		52:153 type_group_092_122=>• 128 - 
            compile time: 7.252ms*/;
    function $type_group_092_122(l, data, state, prod, puid) {
        /*52:149 type_group_092_122=>• 8
        52:150 type_group_092_122=>• 16
        52:151 type_group_092_122=>• 32
        52:152 type_group_092_122=>• 64
        52:153 type_group_092_122=>• 128*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if (l.current_byte == 56/*[8]*/) {
            pushFN(data, branch_b9f8e5d82f7d9108);
            return branch_87972e55ce92234c(l, data, state, prod, 1);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (/*[16]*/cmpr_set(l, data, 132, 2, 2)) {
            pushFN(data, branch_b9f8e5d82f7d9108);
            return branch_43bfdac24213de5e(l, data, state, prod, 2);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (/*[32]*/cmpr_set(l, data, 91, 2, 2)) {
            pushFN(data, branch_b9f8e5d82f7d9108);
            return branch_e386181493559bbb(l, data, state, prod, 4);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (/*[64]*/cmpr_set(l, data, 93, 2, 2)) {
            pushFN(data, branch_b9f8e5d82f7d9108);
            return branch_63ee326759140366(l, data, state, prod, 8);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (/*[128]*/cmpr_set(l, data, 88, 3, 3)) {
            pushFN(data, branch_b9f8e5d82f7d9108);
            return branch_23416216ce94034d(l, data, state, prod, 16);
        }
        return -1;
    }
    function $type_group_092_122_reducer(l, data, state, prod, puid) {
        return 52;
    }
/*production name: type_group_095_123
            grammar index: 53
            bodies:
	53:154 type_group_095_123=>• f - 
		53:155 type_group_095_123=>• flt - 
            compile time: 1.564ms*/;
    function $type_group_095_123(l, data, state, prod, puid) {
        /*53:154 type_group_095_123=>• f
        53:155 type_group_095_123=>• flt*/
        switch (sym_map_1a453afd76b3985a(l, data)) {
            case 0:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*53:154 type_group_095_123=>• f*/
                puid |= 1;
                consume(l, data, state);
                return 53;
            case 1:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*53:155 type_group_095_123=>• flt*/
                puid |= 2;
                consume(l, data, state);
                return 53;
            default:
                break;
        }
        return -1;
    }
    function $type_group_095_123_reducer(l, data, state, prod, puid) {
        return 53;
    }
/*production name: type_group_098_124
            grammar index: 54
            bodies:
	54:156 type_group_098_124=>• 32 - 
		54:157 type_group_098_124=>• 64 - 
		54:158 type_group_098_124=>• 128 - 
            compile time: 2.135ms*/;
    function $type_group_098_124(l, data, state, prod, puid) {
        /*54:156 type_group_098_124=>• 32
        54:157 type_group_098_124=>• 64
        54:158 type_group_098_124=>• 128*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if (/*[32]*/cmpr_set(l, data, 91, 2, 2)) {
            pushFN(data, branch_97595c541a25c591);
            return branch_897a2e87e72e7b8c(l, data, state, prod, 1);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (/*[64]*/cmpr_set(l, data, 93, 2, 2)) {
            pushFN(data, branch_97595c541a25c591);
            return branch_62cb94c6cb8e4306(l, data, state, prod, 2);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (/*[128]*/cmpr_set(l, data, 88, 3, 3)) {
            pushFN(data, branch_97595c541a25c591);
            return branch_c3f61dfaabade9a9(l, data, state, prod, 4);
        }
        return -1;
    }
    function $type_group_098_124_reducer(l, data, state, prod, puid) {
        return 54;
    }
/*production name: type
            grammar index: 55
            bodies:
	55:159 type=>• identifier - 
		55:160 type=>• type_group_087_121 type_group_092_122 - 
		55:161 type=>• type_group_095_123 type_group_098_124 - 
		55:162 type=>• string - 
		55:163 type=>• str - 
            compile time: 5.307ms*/;
    function $type(l, data, state, prod, puid) {
        /*55:159 type=>• identifier
        55:160 type=>• type_group_087_121 type_group_092_122
        55:161 type=>• type_group_095_123 type_group_098_124
        55:162 type=>• string
        55:163 type=>• str*/
        switch (sym_map_957fe013814af5bc(l, data)) {
            case 0:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*55:163 type=>• str*/
                puid |= 64;
                consume(l, data, state);
                add_reduce(state, data, 1, 81);
                return 55;
            case 1:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*55:162 type=>• string*/
                puid |= 32;
                consume(l, data, state);
                add_reduce(state, data, 1, 81);
                return 55;
            case 2:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*55:161 type=>• type_group_095_123 type_group_098_124*/
                puid |= 8;
                pushFN(data, branch_be1c1cbae6d00146);
                pushFN(data, $type_group_095_123);
                return puid;
            case 3:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*55:160 type=>• type_group_087_121 type_group_092_122*/
                puid |= 2;
                pushFN(data, branch_ddbc14d69834cb82);
                pushFN(data, $type_group_087_121);
                return puid;
            case 4:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*55:159 type=>• identifier*/
                puid |= 1;
                pushFN(data, branch_ecb95c5d04401b2e);
                pushFN(data, $identifier);
                return puid;
            default:
                break;
        }
        return -1;
    }
    function $type_reducer(l, data, state, prod, puid) {
        if (1 == puid) {
            /*55:159 type=>identifier •*/
            add_reduce(state, data, 1, 79);
        } else if (6 == puid) {
            /*55:160 type=>type_group_087_121 type_group_092_122 •*/
            add_reduce(state, data, 2, 80);
        } else if (24 == puid) {
            /*55:161 type=>type_group_095_123 type_group_098_124 •*/
            add_reduce(state, data, 2, 80);
        } else if (32 == puid) {
            /*55:162 type=>string •*/
            add_reduce(state, data, 1, 81);
        } else if (64 == puid) {
            /*55:163 type=>str •*/
            add_reduce(state, data, 1, 81);
        }
        return 55;
    }
/*production name: value
            grammar index: 56
            bodies:
	56:164 value=>• num - 
		56:165 value=>• tk:string - 
		56:166 value=>• true - 
		56:167 value=>• false - 
		56:168 value=>• null - 
		56:169 value=>• template - 
            compile time: 6.947ms*/;
    function $value(l, data, state, prod, puid) {
        /*56:164 value=>• num
        56:165 value=>• tk:string
        56:166 value=>• true
        56:167 value=>• false
        56:168 value=>• null
        56:169 value=>• template*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) {
            pushFN(data, branch_94fd660a5f5694c4);
            return branch_68ec484543f8f45a(l, data, state, prod, 32);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if ((l.current_byte == 34/*["]*/) || (l.current_byte == 39/*[']*/)) {
            pushFN(data, branch_94fd660a5f5694c4);
            return branch_41e887c73114fb6a(l, data, state, prod, 2);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (dt_6ae31dd85a62ef5c(l, data) || l.isNum(data)) {
            pushFN(data, branch_94fd660a5f5694c4);
            return branch_6c4902f94ddf90b1(l, data, state, prod, 1);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (/*[true]*/cmpr_set(l, data, 95, 4, 4)) {
            pushFN(data, branch_94fd660a5f5694c4);
            return branch_1d63aa65114dd0e6(l, data, state, prod, 4);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (/*[false]*/cmpr_set(l, data, 53, 5, 5)) {
            pushFN(data, branch_94fd660a5f5694c4);
            return branch_2c86f0d728192ccd(l, data, state, prod, 8);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (/*[null]*/cmpr_set(l, data, 35, 4, 4)) {
            pushFN(data, branch_94fd660a5f5694c4);
            return branch_a92c5655c1c0d7d5(l, data, state, prod, 16);
        }
        return -1;
    }
    function $value_reducer(l, data, state, prod, puid) {
        if (1 == puid) {
            /*56:164 value=>num •*/
            add_reduce(state, data, 1, 82);
        } else if (2 == puid) {
            /*56:165 value=>tk:string •*/
            add_reduce(state, data, 1, 83);
        } else if (4 == puid) {
            /*56:166 value=>true •*/
            add_reduce(state, data, 1, 84);
        } else if (8 == puid) {
            /*56:167 value=>false •*/
            add_reduce(state, data, 1, 85);
        } else if (16 == puid) {
            /*56:168 value=>null •*/
            add_reduce(state, data, 1, 86);
        } else if (32 == puid) {
            /*56:169 value=>template •*/
            add_reduce(state, data, 1, 67);
        }
        return 56;
    }
/*production name: string_group_0112_125
            grammar index: 57
            bodies:
	57:170 string_group_0112_125=>• θws - 
		57:171 string_group_0112_125=>• θnl - 
		57:172 string_group_0112_125=>• θid - 
		57:173 string_group_0112_125=>• θsym - 
		57:174 string_group_0112_125=>• \" - 
            compile time: 3.339ms*/;
    function $string_group_0112_125(l, data, state, prod, puid) {
        /*57:170 string_group_0112_125=>• θws
        57:171 string_group_0112_125=>• θnl
        57:172 string_group_0112_125=>• θid
        57:173 string_group_0112_125=>• θsym
        57:174 string_group_0112_125=>• \"*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if (l.isSP(true, data)) {
            pushFN(data, branch_485e7848dc9e7e5b);
            return branch_8d18e8476d3015f9(l, data, state, prod, 1);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.isNL()) {
            pushFN(data, branch_485e7848dc9e7e5b);
            return branch_027233e33062fb58(l, data, state, prod, 2);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.isUniID(data)) {
            pushFN(data, branch_485e7848dc9e7e5b);
            return branch_a323db6daec375bc(l, data, state, prod, 4);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (/*[\"]*/cmpr_set(l, data, 14, 2, 2)) {
            pushFN(data, branch_485e7848dc9e7e5b);
            return branch_e5b14fb1a24c1230(l, data, state, prod, 16);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.isSym(true, data)) {
            pushFN(data, branch_485e7848dc9e7e5b);
            return branch_5fc020a8d52b7391(l, data, state, prod, 8);
        }
        return -1;
    }
    function $string_group_0112_125_reducer(l, data, state, prod, puid) {
        return 57;
    }
/*production name: string_HC_listbody1_126
            grammar index: 58
            bodies:
	58:175 string_HC_listbody1_126=>• string_HC_listbody1_126 string_group_0112_125 - 
		58:176 string_HC_listbody1_126=>• string_group_0112_125 - 
            compile time: 4.498ms*/;
    function $string_HC_listbody1_126(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*58:176 string_HC_listbody1_126=>• string_group_0112_125*/
        puid |= 2;
        pushFN(data, branch_062cf06014c92bd4);
        pushFN(data, $string_group_0112_125);
        return puid;
        return -1;
    }
    function $string_HC_listbody1_126_goto(l, data, state, prod, puid) {
        /*58:175 string_HC_listbody1_126=>string_HC_listbody1_126 • string_group_0112_125*/
        if (l.current_byte == 34/*["]*/) {
            return 58;
        }
        /*58:175 string_HC_listbody1_126=>string_HC_listbody1_126 • string_group_0112_125
        60:179 string=>" string_HC_listbody1_126 • "*/
        skip_db1786a8af54d666(l/*[ 71 ]*/, data, state);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if ((((/*[\"]*/cmpr_set(l, data, 14, 2, 2) || l.isUniID(data)) || l.isNL()) || l.isSym(true, data)) || l.isSP(true, data)) {
            pushFN(data, branch_105597e1c2057714);
            return branch_b87893d74c1116af(l, data, state, prod, 1);
        }
        return prod == 58 ? prod : -1;
    }
    function $string_HC_listbody1_126_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            /*58:175 string_HC_listbody1_126=>string_HC_listbody1_126 string_group_0112_125 •*/
            add_reduce(state, data, 2, 87);
        } else if (2 == puid) {
            /*58:176 string_HC_listbody1_126=>string_group_0112_125 •*/
            add_reduce(state, data, 1, 88);
        }
        return 58;
    }
/*production name: string_HC_listbody1_127
            grammar index: 59
            bodies:
	59:177 string_HC_listbody1_127=>• string_HC_listbody1_127 string_group_0112_125 - 
		59:178 string_HC_listbody1_127=>• string_group_0112_125 - 
            compile time: 5.372ms*/;
    function $string_HC_listbody1_127(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*59:178 string_HC_listbody1_127=>• string_group_0112_125*/
        puid |= 2;
        pushFN(data, branch_91bd6de142fc31b3);
        pushFN(data, $string_group_0112_125);
        return puid;
        return -1;
    }
    function $string_HC_listbody1_127_goto(l, data, state, prod, puid) {
        /*59:177 string_HC_listbody1_127=>string_HC_listbody1_127 • string_group_0112_125*/
        if (l.current_byte == 39/*[']*/) {
            return 59;
        }
        /*59:177 string_HC_listbody1_127=>string_HC_listbody1_127 • string_group_0112_125
        60:180 string=>' string_HC_listbody1_127 • '*/
        skip_db1786a8af54d666(l/*[ 71 ]*/, data, state);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if ((((/*[\"]*/cmpr_set(l, data, 14, 2, 2) || l.isUniID(data)) || l.isNL()) || l.isSym(true, data)) || l.isSP(true, data)) {
            pushFN(data, branch_a159faaa8b4d52a5);
            return branch_e47281d445af26d6(l, data, state, prod, 1);
        }
        return prod == 59 ? prod : -1;
    }
    function $string_HC_listbody1_127_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            /*59:177 string_HC_listbody1_127=>string_HC_listbody1_127 string_group_0112_125 •*/
            add_reduce(state, data, 2, 87);
        } else if (2 == puid) {
            /*59:178 string_HC_listbody1_127=>string_group_0112_125 •*/
            add_reduce(state, data, 1, 88);
        }
        return 59;
    }
/*production name: string
            grammar index: 60
            bodies:
	60:179 string=>• " string_HC_listbody1_126 " - 
		60:180 string=>• ' string_HC_listbody1_127 ' - 
		60:181 string=>• " " - 
		60:182 string=>• ' ' - 
            compile time: 7.595ms*/;
    function $string(l, data, state, prod, puid) {
        /*60:179 string=>• " string_HC_listbody1_126 "
        60:181 string=>• " "
        60:180 string=>• ' string_HC_listbody1_127 '
        60:182 string=>• ' '*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if (l.current_byte == 34/*["]*/) {
            /*60:179 string=>• " string_HC_listbody1_126 "
            60:181 string=>• " "*/
            var pk = l.copy();
            skip_db1786a8af54d666(pk.next(data)/*[ 71 ]*/, data, 0);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (pk.current_byte == 34/*["]*/) {
                pushFN(data, branch_d896d30b01780566);
                return branch_4e5d3c818eb95719(l, data, state, prod, 1);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            } else if ((((/*[\"]*/cmpr_set(pk, data, 14, 2, 2) || pk.isUniID(data)) || pk.isNL()) || pk.isSym(true, data)) || pk.isSP(true, data)) {
                pushFN(data, branch_d896d30b01780566);
                return branch_846e03ab90be30c1(l, data, state, prod, 1);
            }
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else if (l.current_byte == 39/*[']*/) {
            /*60:180 string=>• ' string_HC_listbody1_127 '
            60:182 string=>• ' '*/
            var pk = l.copy();
            skip_db1786a8af54d666(pk.next(data)/*[ 71 ]*/, data, 0);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (pk.current_byte == 39/*[']*/) {
                pushFN(data, branch_d896d30b01780566);
                return branch_ec4a59e6de71f1ab(l, data, state, prod, 4);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            } else if ((((/*[\"]*/cmpr_set(pk, data, 14, 2, 2) || pk.isUniID(data)) || pk.isNL()) || pk.isSym(true, data)) || pk.isSP(true, data)) {
                pushFN(data, branch_d896d30b01780566);
                return branch_3bd98293758415a9(l, data, state, prod, 4);
            }
        }
        return -1;
    }
    function $string_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            /*60:179 string=>" string_HC_listbody1_126 " •*/
            add_reduce(state, data, 3, 89);
        } else if (12 == puid) {
            /*60:180 string=>' string_HC_listbody1_127 ' •*/
            add_reduce(state, data, 3, 89);
        } else if (1 == puid) {
            /*60:181 string=>" " •*/
            add_reduce(state, data, 2, 90);
        } else if (4 == puid) {
            /*60:182 string=>' ' •*/
            add_reduce(state, data, 2, 90);
        }
        return 60;
    }
/*production name: num
            grammar index: 61
            bodies:
	61:183 num=>• tk:num_tok - 
            compile time: 1.85ms*/;
    function $num(l, data, state, prod, puid) {
        /*61:183 num=>• tk:num_tok*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (tk_8a282674634e41f8(l, data)) {
            consume(l, data, state);
            puid |= 1;
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*61:183 num=>tk:num_tok •*/
            return 61;
        }
        return -1;
    }
    function $num_reducer(l, data, state, prod, puid) {
        return 61;
    }
/*production name: num_tok
            grammar index: 62
            bodies:
	62:184 num_tok=>• def$number - 
		62:185 num_tok=>• def$hex - 
		62:186 num_tok=>• def$binary - 
		62:187 num_tok=>• def$octal - 
            compile time: 7.037ms*/;
    function $num_tok(l, data, state, prod, puid) {
        /*62:184 num_tok=>• def$number
        62:185 num_tok=>• def$hex
        62:186 num_tok=>• def$binary
        62:187 num_tok=>• def$octal*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.isNum(data)) {
            pushFN(data, branch_7bd41de4c3b97b3a);
            return branch_b1efb0d4c36296fa(l, data, state, prod, 1);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (/*[0x]*/cmpr_set(l, data, 27, 2, 2)) {
            pushFN(data, branch_7bd41de4c3b97b3a);
            return branch_83ab997c0cd4a925(l, data, state, prod, 2);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (/*[0b]*/cmpr_set(l, data, 114, 2, 2)) {
            pushFN(data, branch_7bd41de4c3b97b3a);
            return branch_f53e7228acdd15da(l, data, state, prod, 4);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (dt_bc3480b75045e0d0(l, data)) {
            pushFN(data, branch_7bd41de4c3b97b3a);
            return branch_a8af9f953e2f614c(l, data, state, prod, 8);
        }
        return -1;
    }
    function $num_tok_reducer(l, data, state, prod, puid) {
        return 62;
    }
/*production name: operator_HC_listbody1_128
            grammar index: 63
            bodies:
	63:188 operator_HC_listbody1_128=>• operator_HC_listbody1_128 θsym - 
		63:189 operator_HC_listbody1_128=>• θsym - 
            compile time: 219.203ms*/;
    function $operator_HC_listbody1_128(l, data, state, prod, puid) {
        /*63:189 operator_HC_listbody1_128=>• θsym*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.isSym(true, data)) {
            consume(l, data, state);
            puid |= 2;
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*63:189 operator_HC_listbody1_128=>θsym •*/
            add_reduce(state, data, 1, 88);
            pushFN(data, $operator_HC_listbody1_128_goto);
            return 63;
        }
        return -1;
    }
    function $operator_HC_listbody1_128_goto(l, data, state, prod, puid) {
        /*63:188 operator_HC_listbody1_128=>operator_HC_listbody1_128 • θsym*/
        if (((nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/ ||/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) ||/*[==]*/cmpr_set(l, data, 7, 2, 2)) || assert_ascii(l, 0x0, 0xc001300, 0x28000000, 0x28000000)) {
            return 63;
        }
        /*63:188 operator_HC_listbody1_128=>operator_HC_listbody1_128 • θsym
        65:192 operator=>θsym operator_HC_listbody1_128 • identifier_token_group_080_119
        65:195 operator=>θsym operator_HC_listbody1_128 •*/
        skip_db1786a8af54d666(l/*[ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
        if (l.isSym(true, data)) {
            pushFN(data, branch_7fe2059f09133bde);
            return branch_f75a8dfe594b3a95(l, data, state, prod, 1);
        }
        return prod == 63 ? prod : -1;
    }
    function $operator_HC_listbody1_128_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            /*63:188 operator_HC_listbody1_128=>operator_HC_listbody1_128 θsym •*/
            add_reduce(state, data, 2, 87);
        } else if (2 == puid) {
            /*63:189 operator_HC_listbody1_128=>θsym •*/
            add_reduce(state, data, 1, 88);
        }
        return 63;
    }
/*production name: operator_HC_listbody1_129
            grammar index: 64
            bodies:
	64:190 operator_HC_listbody1_129=>• operator_HC_listbody1_129 θsym - 
		64:191 operator_HC_listbody1_129=>• θsym - 
            compile time: 209.108ms*/;
    function $operator_HC_listbody1_129(l, data, state, prod, puid) {
        /*64:191 operator_HC_listbody1_129=>• θsym*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.isSym(true, data)) {
            consume(l, data, state);
            puid |= 2;
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*64:191 operator_HC_listbody1_129=>θsym •*/
            add_reduce(state, data, 1, 88);
            pushFN(data, $operator_HC_listbody1_129_goto);
            return 64;
        }
        return -1;
    }
    function $operator_HC_listbody1_129_goto(l, data, state, prod, puid) {
        /*64:190 operator_HC_listbody1_129=>operator_HC_listbody1_129 • θsym*/
        if (((nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/ ||/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) ||/*[==]*/cmpr_set(l, data, 7, 2, 2)) || assert_ascii(l, 0x0, 0xc001300, 0x28000000, 0x28000000)) {
            return 64;
        }
        /*64:190 operator_HC_listbody1_129=>operator_HC_listbody1_129 • θsym
        65:193 operator=>== operator_HC_listbody1_129 • identifier_token_group_080_119
        65:197 operator=>== operator_HC_listbody1_129 •*/
        skip_db1786a8af54d666(l/*[ 71 ]*/, data, state);
        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
        if (l.isSym(true, data)) {
            pushFN(data, branch_29bbdc70dcef3ee4);
            return branch_ad42e5b692f898b7(l, data, state, prod, 1);
        }
        return prod == 64 ? prod : -1;
    }
    function $operator_HC_listbody1_129_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            /*64:190 operator_HC_listbody1_129=>operator_HC_listbody1_129 θsym •*/
            add_reduce(state, data, 2, 87);
        } else if (2 == puid) {
            /*64:191 operator_HC_listbody1_129=>θsym •*/
            add_reduce(state, data, 1, 88);
        }
        return 64;
    }
/*production name: operator
            grammar index: 65
            bodies:
	65:192 operator=>• θsym operator_HC_listbody1_128 identifier_token_group_080_119 - 
		65:193 operator=>• == operator_HC_listbody1_129 identifier_token_group_080_119 - 
		65:194 operator=>• θsym identifier_token_group_080_119 - 
		65:195 operator=>• θsym operator_HC_listbody1_128 - 
		65:196 operator=>• == identifier_token_group_080_119 - 
		65:197 operator=>• == operator_HC_listbody1_129 - 
		65:198 operator=>• θsym - 
		65:199 operator=>• == - 
            compile time: 1089.655ms*/;
    function $operator(l, data, state, prod, puid) {
        /*65:192 operator=>• θsym operator_HC_listbody1_128 identifier_token_group_080_119
        65:194 operator=>• θsym identifier_token_group_080_119
        65:195 operator=>• θsym operator_HC_listbody1_128
        65:198 operator=>• θsym
        65:193 operator=>• == operator_HC_listbody1_129 identifier_token_group_080_119
        65:196 operator=>• == identifier_token_group_080_119
        65:197 operator=>• == operator_HC_listbody1_129
        65:199 operator=>• ==*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if (/*[==]*/cmpr_set(l, data, 7, 2, 2)) {
            /*65:193 operator=>• == operator_HC_listbody1_129 identifier_token_group_080_119
            65:196 operator=>• == identifier_token_group_080_119
            65:197 operator=>• == operator_HC_listbody1_129
            65:199 operator=>• ==*/
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l, data, state);
            puid |= 8;
            /*65:193 operator=>== • operator_HC_listbody1_129 identifier_token_group_080_119
            65:197 operator=>== • operator_HC_listbody1_129
            65:199 operator=>== •
            65:196 operator=>== • identifier_token_group_080_119*/
            skip_db1786a8af54d666(l/*[ 71 ]*/, data, state);
            switch (sym_map_e72378e7190a6ec0(l, data)) {
                case 0:
                    /*-------------VPROD-------------------------*/
                    /*65:193 operator=>== • operator_HC_listbody1_129 identifier_token_group_080_119
                    65:197 operator=>== • operator_HC_listbody1_129*/
                    pushFN(data, branch_c462cd268e3d3174);
                    return 0;
                case 1:
                    /*--LEAF--*/
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    /*65:196 operator=>== • identifier_token_group_080_119*/
                    puid |= 4;
                    pushFN(data, branch_75dcdaa282cbb6b8);
                    pushFN(data, $identifier_token_group_080_119);
                    return puid;
                default:
                case 2:
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    /*65:199 operator=>== •*/
                    add_reduce(state, data, 1, 92);
                    return 65;
            }
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else if (l.isSym(true, data)) {
            /*65:192 operator=>• θsym operator_HC_listbody1_128 identifier_token_group_080_119
            65:195 operator=>• θsym operator_HC_listbody1_128
            65:198 operator=>• θsym
            65:194 operator=>• θsym identifier_token_group_080_119*/
            var pk = l.copy();
            skip_db1786a8af54d666(pk.next(data)/*[ 71 ]*/, data, 0);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (pk.isSym(true, data)) {
                /*65:192 operator=>• θsym operator_HC_listbody1_128 identifier_token_group_080_119
                65:195 operator=>• θsym operator_HC_listbody1_128
                65:198 operator=>• θsym*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l, data, state);
                puid |= 1;
                /*65:192 operator=>θsym • operator_HC_listbody1_128 identifier_token_group_080_119
                65:195 operator=>θsym • operator_HC_listbody1_128
                65:198 operator=>θsym •*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
                switch (sym_map_d72dd77395238df5(l, data)) {
                    default:
                    case 0:
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*65:198 operator=>θsym •*/
                        add_reduce(state, data, 1, 92);
                        return 65;
                    case 1:
                        /*-------------VPROD-------------------------*/
                        /*65:192 operator=>θsym • operator_HC_listbody1_128 identifier_token_group_080_119
                        65:195 operator=>θsym • operator_HC_listbody1_128*/
                        pushFN(data, branch_abdc49b7a2c7142e);
                        return 0;
                }
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            } else if (nocap_b2eb52235ee30b8a(pk)/*[ws] [nl]*/) {
                pushFN(data, branch_953325efa0d36ff1);
                return branch_bc26cf20258b3f8d(l, data, state, prod, 1);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            } else if ((((((((((((((((/*[<<--]*/cmpr_set(pk, data, 20, 4, 4) || dt_bcea2102060eab13(pk, data)) || dt_6ae31dd85a62ef5c(pk, data)) ||/*[true]*/cmpr_set(pk, data, 95, 4, 4)) ||/*[null]*/cmpr_set(pk, data, 35, 4, 4)) || dt_8411d8c5b1c2ec8c(pk, data)) ||/*[match]*/cmpr_set(pk, data, 67, 5, 5)) ||/*[==]*/cmpr_set(pk, data, 7, 2, 2)) ||/*[break]*/cmpr_set(pk, data, 72, 5, 5)) ||/*[return]*/cmpr_set(pk, data, 77, 6, 6)) ||/*[continue]*/cmpr_set(pk, data, 39, 8, 8)) ||/*[loop]*/cmpr_set(pk, data, 63, 4, 4)) ||/*[else]*/cmpr_set(pk, data, 128, 4, 4)) ||/*[str]*/cmpr_set(pk, data, 47, 3, 3)) || assert_ascii(pk, 0x0, 0xc001394, 0xa8000000, 0x28000000)) || pk.isUniID(data)) || pk.isNum(data)) {
                pushFN(data, branch_953325efa0d36ff1);
                return branch_6ba75ab8a6c134f6(l, data, state, prod, 1);
            }
        }
        return -1;
    }
    function $operator_reducer(l, data, state, prod, puid) {
        if (7 == puid) {
            /*65:192 operator=>θsym operator_HC_listbody1_128 identifier_token_group_080_119 •*/
            add_reduce(state, data, 3, 91);
        } else if (28 == puid) {
            /*65:193 operator=>== operator_HC_listbody1_129 identifier_token_group_080_119 •*/
            add_reduce(state, data, 3, 91);
        } else if (5 == puid) {
            /*65:194 operator=>θsym identifier_token_group_080_119 •*/
            add_reduce(state, data, 2, 92);
        } else if (3 == puid) {
            /*65:195 operator=>θsym operator_HC_listbody1_128 •*/
            add_reduce(state, data, 2, 91);
        } else if (12 == puid) {
            /*65:196 operator=>== identifier_token_group_080_119 •*/
            add_reduce(state, data, 2, 92);
        } else if (24 == puid) {
            /*65:197 operator=>== operator_HC_listbody1_129 •*/
            add_reduce(state, data, 2, 91);
        } else if (1 == puid) {
            /*65:198 operator=>θsym •*/
            add_reduce(state, data, 1, 92);
        } else if (8 == puid) {
            /*65:199 operator=>== •*/
            add_reduce(state, data, 1, 92);
        }
        return 65;
    }
/*production name: modifier
            grammar index: 66
            bodies:
	66:200 modifier=>• pub - 
		66:201 modifier=>• priv - 
		66:202 modifier=>• export - 
		66:203 modifier=>• mut - 
		66:204 modifier=>• imut - 
		66:205 modifier=>• θid - 
            compile time: 4.357ms*/;
    function $modifier(l, data, state, prod, puid) {
        /*66:200 modifier=>• pub
        66:201 modifier=>• priv
        66:202 modifier=>• export
        66:203 modifier=>• mut
        66:204 modifier=>• imut
        66:205 modifier=>• θid*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if (/*[pub]*/cmpr_set(l, data, 134, 3, 3)) {
            pushFN(data, branch_5ba3cb59e15b58fe);
            return branch_47406f0158ff4614(l, data, state, prod, 1);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (/*[priv]*/cmpr_set(l, data, 99, 4, 4)) {
            pushFN(data, branch_5ba3cb59e15b58fe);
            return branch_7fd00de6646c356a(l, data, state, prod, 2);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (/*[export]*/cmpr_set(l, data, 57, 6, 6)) {
            pushFN(data, branch_5ba3cb59e15b58fe);
            return branch_3aab1ebf3294da29(l, data, state, prod, 4);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (/*[mut]*/cmpr_set(l, data, 117, 3, 3)) {
            pushFN(data, branch_5ba3cb59e15b58fe);
            return branch_9f3bd435e65d98b7(l, data, state, prod, 8);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (/*[imut]*/cmpr_set(l, data, 116, 4, 4)) {
            pushFN(data, branch_5ba3cb59e15b58fe);
            return branch_5d2be5b77c2fdb8e(l, data, state, prod, 16);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.isUniID(data)) {
            pushFN(data, branch_5ba3cb59e15b58fe);
            return branch_2c4360c5e05e1da8(l, data, state, prod, 32);
        }
        return -1;
    }
    function $modifier_reducer(l, data, state, prod, puid) {
        return 66;
    }
/*production name: comment_group_0139_130
            grammar index: 67
            bodies:
	67:206 comment_group_0139_130=>• θid - 
		67:207 comment_group_0139_130=>• θsym - 
		67:208 comment_group_0139_130=>• θnum - 
            compile time: 3.079ms*/;
    function $comment_group_0139_130(l, data, state, prod, puid) {
        /*67:206 comment_group_0139_130=>• θid
        67:207 comment_group_0139_130=>• θsym
        67:208 comment_group_0139_130=>• θnum*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if (l.isUniID(data)) {
            pushFN(data, branch_3542cba400bdc4b9);
            return branch_871c2100d5a6193b(l, data, state, prod, 1);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.isSym(true, data)) {
            pushFN(data, branch_3542cba400bdc4b9);
            return branch_239da823ebc1627a(l, data, state, prod, 2);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.isNum(data)) {
            pushFN(data, branch_3542cba400bdc4b9);
            return branch_18f06d37a9397717(l, data, state, prod, 4);
        }
        return -1;
    }
    function $comment_group_0139_130_reducer(l, data, state, prod, puid) {
        return 67;
    }
/*production name: comment_HC_listbody1_131
            grammar index: 68
            bodies:
	68:209 comment_HC_listbody1_131=>• comment_HC_listbody1_131 comment_group_0139_130 - 
		68:210 comment_HC_listbody1_131=>• comment_group_0139_130 - 
            compile time: 4.325ms*/;
    function $comment_HC_listbody1_131(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*68:210 comment_HC_listbody1_131=>• comment_group_0139_130*/
        puid |= 2;
        pushFN(data, branch_73836dabb810b0e0);
        pushFN(data, $comment_group_0139_130);
        return puid;
        return -1;
    }
    function $comment_HC_listbody1_131_goto(l, data, state, prod, puid) {
        /*68:209 comment_HC_listbody1_131=>comment_HC_listbody1_131 • comment_group_0139_130*/
        if (/*[asterisk/]*/cmpr_set(l, data, 18, 2, 2)) {
            return 68;
        }
        /*68:209 comment_HC_listbody1_131=>comment_HC_listbody1_131 • comment_group_0139_130
        71:214 comment=>/* comment_HC_listbody1_131 • * /*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if ((l.isUniID(data) || l.isNum(data)) || l.isSym(true, data)) {
            pushFN(data, branch_b0016a63eef6ed7f);
            return branch_55ffb425a3ff65dc(l, data, state, prod, 1);
        }
        return prod == 68 ? prod : -1;
    }
    function $comment_HC_listbody1_131_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            /*68:209 comment_HC_listbody1_131=>comment_HC_listbody1_131 comment_group_0139_130 •*/
            add_reduce(state, data, 2, 2);
        } else if (2 == puid) {
            /*68:210 comment_HC_listbody1_131=>comment_group_0139_130 •*/
            add_reduce(state, data, 1, 3);
        }
        return 68;
    }
/*production name: comment_HC_listbody1_132
            grammar index: 69
            bodies:
	69:211 comment_HC_listbody1_132=>• comment_HC_listbody1_132 comment_group_0139_130 - 
		69:212 comment_HC_listbody1_132=>• comment_group_0139_130 - 
            compile time: 3.231ms*/;
    function $comment_HC_listbody1_132(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*69:212 comment_HC_listbody1_132=>• comment_group_0139_130*/
        puid |= 2;
        pushFN(data, branch_13f6c10119d024c3);
        pushFN(data, $comment_group_0139_130);
        return puid;
        return -1;
    }
    function $comment_HC_listbody1_132_goto(l, data, state, prod, puid) {
        /*69:211 comment_HC_listbody1_132=>comment_HC_listbody1_132 • comment_group_0139_130*/
        if (nocap_9b1ef04606bbaa09(l)/*[nl]*/) {
            return 69;
        }
        /*69:211 comment_HC_listbody1_132=>comment_HC_listbody1_132 • comment_group_0139_130
        71:215 comment=>// comment_HC_listbody1_132 • comment_group_0144_133*/
        skip_6c02533b5dc0d802(l/*[ ws ][ 71 ]*/, data, state);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if ((l.isUniID(data) || l.isNum(data)) || l.isSym(true, data)) {
            pushFN(data, branch_cbf1e60b49bba616);
            return branch_368b43eb9546f896(l, data, state, prod, 1);
        }
        return prod == 69 ? prod : -1;
    }
    function $comment_HC_listbody1_132_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            /*69:211 comment_HC_listbody1_132=>comment_HC_listbody1_132 comment_group_0139_130 •*/
            add_reduce(state, data, 2, 2);
        } else if (2 == puid) {
            /*69:212 comment_HC_listbody1_132=>comment_group_0139_130 •*/
            add_reduce(state, data, 1, 3);
        }
        return 69;
    }
/*production name: comment_group_0144_133
            grammar index: 70
            bodies:
	70:213 comment_group_0144_133=>• θnl - 
            compile time: 0.796ms*/;
    function $comment_group_0144_133(l, data, state, prod, puid) {
        /*70:213 comment_group_0144_133=>• θnl*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (nocap_9b1ef04606bbaa09(l)/*[nl]*/) {
            consume(l, data, state);
            puid |= 1;
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*70:213 comment_group_0144_133=>θnl •*/
            return 70;
        }
        return -1;
    }
    function $comment_group_0144_133_reducer(l, data, state, prod, puid) {
        return 70;
    }
/*production name: comment
            grammar index: 71
            bodies:
	71:214 comment=>• /* comment_HC_listbody1_131 * / - 
		71:215 comment=>• // comment_HC_listbody1_132 comment_group_0144_133 - 
		71:216 comment=>• /* * / - 
		71:217 comment=>• // comment_group_0144_133 - 
            compile time: 10.248ms*/;
    function $comment(l, data, state, prod, puid) {
        /*71:214 comment=>• /* comment_HC_listbody1_131 * /
        71:216 comment=>• /* * /
        71:215 comment=>• // comment_HC_listbody1_132 comment_group_0144_133
        71:217 comment=>• // comment_group_0144_133*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if (/*[/asterisk]*/cmpr_set(l, data, 17, 2, 2)) {
            /*71:214 comment=>• /* comment_HC_listbody1_131 * /
            71:216 comment=>• /* * /*/
            var pk = l.copy();
            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, 0);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (/*[asterisk/]*/cmpr_set(pk, data, 18, 2, 2)) {
                pushFN(data, branch_cbd95ed6c98c2884);
                return branch_87a5123a1866ad6e(l, data, state, prod, 1);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            } else if ((pk.isUniID(data) || pk.isNum(data)) || pk.isSym(true, data)) {
                pushFN(data, branch_cbd95ed6c98c2884);
                return branch_f2068067406e255c(l, data, state, prod, 1);
            }
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else if (/*[//]*/cmpr_set(l, data, 112, 2, 2)) {
            /*71:215 comment=>• // comment_HC_listbody1_132 comment_group_0144_133
            71:217 comment=>• // comment_group_0144_133*/
            var pk = l.copy();
            skip_6c02533b5dc0d802(pk.next(data)/*[ ws ][ 71 ]*/, data, 0);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if ((pk.isUniID(data) || pk.isNum(data)) || pk.isSym(true, data)) {
                pushFN(data, branch_cbd95ed6c98c2884);
                return branch_3b892915cdeddc1e(l, data, state, prod, 8);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            } else if (nocap_9b1ef04606bbaa09(pk)/*[nl]*/) {
                pushFN(data, branch_cbd95ed6c98c2884);
                return branch_a324eb80845832bc(l, data, state, prod, 8);
            }
        }
        return -1;
    }
    function $comment_reducer(l, data, state, prod, puid) {
        if (7 == puid) {
            /*71:214 comment=>/* comment_HC_listbody1_131 * / •*/
            add_reduce(state, data, 3, 0);
        } else if (56 == puid) {
            /*71:215 comment=>// comment_HC_listbody1_132 comment_group_0144_133 •*/
            add_reduce(state, data, 3, 0);
        } else if (5 == puid) {
            /*71:216 comment=>/* * / •*/
            add_reduce(state, data, 2, 0);
        } else if (40 == puid) {
            /*71:217 comment=>// comment_group_0144_133 •*/
            add_reduce(state, data, 2, 0);
        }
        return 71;
    }
/*production name: template
            grammar index: 72
            bodies:
	72:218 template=>• <<-- θnum -->> - 
		72:219 template=>• <<-- -->> - 
            compile time: 5.707ms*/;
    function $template(l, data, state, prod, puid) {
        /*72:218 template=>• <<-- θnum -->>
        72:219 template=>• <<-- -->>*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (/*[<<--]*/cmpr_set(l, data, 20, 4, 4)) {
            consume(l, data, state);
            puid |= 1;
            /*72:218 template=><<-- • θnum -->>
            72:219 template=><<-- • -->>*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if (l.isNum(data)) {
                pushFN(data, branch_1a9b92d8e81556d6);
                return branch_6f565c744f3d9137(l, data, state, prod, 1);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
            } else if (/*[-->>]*/cmpr_set(l, data, 23, 4, 4)) {
                pushFN(data, branch_1a9b92d8e81556d6);
                return branch_3e7b23ce1500191b(l, data, state, prod, 1);
            }
        }
        return -1;
    }
    function $template_reducer(l, data, state, prod, puid) {
        if (7 == puid) {
            /*72:218 template=><<-- θnum -->> •*/
            add_reduce(state, data, 3, 0);
        } else if (5 == puid) {
            /*72:219 template=><<-- -->> •*/
            add_reduce(state, data, 2, 0);
        }
        return 72;
    }
/*production name: def$hex
            grammar index: 78
            bodies:
	78:244 def$hex=>• tk:def$hex_token - 
            compile time: 2.144ms*/;
    function $def$hex(l, data, state, prod, puid) {
        /*78:244 def$hex=>• tk:def$hex_token*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (tk_bc911c1d17be48bc(l, data)) {
            consume(l, data, state);
            puid |= 1;
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*78:244 def$hex=>tk:def$hex_token •*/
            return 78;
        }
        return -1;
    }
    function $def$hex_reducer(l, data, state, prod, puid) {
        return 78;
    }
/*production name: def$binary
            grammar index: 79
            bodies:
	79:245 def$binary=>• tk:def$binary_token - 
            compile time: 1.419ms*/;
    function $def$binary(l, data, state, prod, puid) {
        /*79:245 def$binary=>• tk:def$binary_token*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (tk_2c97aec756dbfad0(l, data)) {
            consume(l, data, state);
            puid |= 1;
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*79:245 def$binary=>tk:def$binary_token •*/
            return 79;
        }
        return -1;
    }
    function $def$binary_reducer(l, data, state, prod, puid) {
        return 79;
    }
/*production name: def$octal
            grammar index: 80
            bodies:
	80:246 def$octal=>• tk:def$octal_token - 
            compile time: 2.319ms*/;
    function $def$octal(l, data, state, prod, puid) {
        /*80:246 def$octal=>• tk:def$octal_token*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (tk_57ef2c884ceea1ad(l, data)) {
            consume(l, data, state);
            puid |= 1;
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*80:246 def$octal=>tk:def$octal_token •*/
            return 80;
        }
        return -1;
    }
    function $def$octal_reducer(l, data, state, prod, puid) {
        return 80;
    }
/*production name: def$number
            grammar index: 81
            bodies:
	81:247 def$number=>• tk:def$scientific_token - 
            compile time: 5.523ms*/;
    function $def$number(l, data, state, prod, puid) {
        /*81:247 def$number=>• tk:def$scientific_token*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (tk_eee45d92b1f1c08f(l, data)) {
            consume(l, data, state);
            puid |= 1;
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*81:247 def$number=>tk:def$scientific_token •*/
            return 81;
        }
        return -1;
    }
    function $def$number_reducer(l, data, state, prod, puid) {
        return 81;
    }
/*production name: def$scientific_token_group_027_101
            grammar index: 82
            bodies:
	82:248 def$scientific_token_group_027_101=>• e - 
		82:249 def$scientific_token_group_027_101=>• E - 
            compile time: 2.239ms*/;
    function $def$scientific_token_group_027_101(l, data, state, prod, puid) {
        /*82:248 def$scientific_token_group_027_101=>• e
        82:249 def$scientific_token_group_027_101=>• E*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if (l.current_byte == 101/*[e]*/) {
            pushFN(data, branch_be0eb48b27d687bc);
            return branch_ab0e49b083d1503b(l, data, state, prod, 1);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.current_byte == 69/*[E]*/) {
            pushFN(data, branch_be0eb48b27d687bc);
            return branch_f2b7e53ce7449f3a(l, data, state, prod, 2);
        }
        return -1;
    }
    function $def$scientific_token_group_027_101_reducer(l, data, state, prod, puid) {
        return 82;
    }
/*production name: def$scientific_token_group_228_102
            grammar index: 83
            bodies:
	83:250 def$scientific_token_group_228_102=>• def$scientific_token_group_027_101 - θnum - 
		83:251 def$scientific_token_group_228_102=>• def$scientific_token_group_027_101 θnum - 
            compile time: 6.051ms*/;
    function $def$scientific_token_group_228_102(l, data, state, prod, puid) {
        /*83:250 def$scientific_token_group_228_102=>• def$scientific_token_group_027_101 - θnum
        83:251 def$scientific_token_group_228_102=>• def$scientific_token_group_027_101 θnum*/
        pushFN(data, branch_64e7346c01b28573);
        pushFN(data, $def$scientific_token_group_027_101);
        puid |= 1;
        return puid;
        return -1;
    }
    function $def$scientific_token_group_228_102_reducer(l, data, state, prod, puid) {
        if (7 == puid) {
            /*83:250 def$scientific_token_group_228_102=>def$scientific_token_group_027_101 - θnum •*/
            add_reduce(state, data, 3, 0);
        } else if (5 == puid) {
            /*83:251 def$scientific_token_group_228_102=>def$scientific_token_group_027_101 θnum •*/
            add_reduce(state, data, 2, 0);
        }
        return 83;
    }
/*production name: def$scientific_token
            grammar index: 84
            bodies:
	84:252 def$scientific_token=>• def$float_token def$scientific_token_group_228_102 - 
		84:253 def$scientific_token=>• def$float_token - 
            compile time: 7.434ms*/;
    function $def$scientific_token(l, data, state, prod, puid) {
        /*84:252 def$scientific_token=>• def$float_token def$scientific_token_group_228_102
        84:253 def$scientific_token=>• def$float_token*/
        pushFN(data, branch_9aa210af00cc99e6);
        pushFN(data, $def$float_token);
        puid |= 1;
        return puid;
        return -1;
    }
    function $def$scientific_token_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            /*84:252 def$scientific_token=>def$float_token def$scientific_token_group_228_102 •*/
            add_reduce(state, data, 2, 0);
        }
        return 84;
    }
/*production name: def$float_token_group_130_103
            grammar index: 85
            bodies:
	85:254 def$float_token_group_130_103=>• . θnum - 
            compile time: 2.564ms*/;
    function $def$float_token_group_130_103(l, data, state, prod, puid) {
        /*85:254 def$float_token_group_130_103=>• . θnum*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 46/*[.]*/) {
            consume(l, data, state);
            puid |= 1;
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*85:254 def$float_token_group_130_103=>. • θnum*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, state);
            puid |= 2;
            if (l.isNum(data) && consume(l, data, state)) {
                add_reduce(state, data, 2, 0);
                return 85;
            }
        }
        return -1;
    }
    function $def$float_token_group_130_103_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            /*85:254 def$float_token_group_130_103=>. θnum •*/
            add_reduce(state, data, 2, 0);
        }
        return 85;
    }
/*production name: def$float_token
            grammar index: 86
            bodies:
	86:255 def$float_token=>• θnum def$float_token_group_130_103 - 
		86:256 def$float_token=>• θnum - 
            compile time: 9.005ms*/;
    function $def$float_token(l, data, state, prod, puid) {
        /*86:255 def$float_token=>• θnum def$float_token_group_130_103
        86:256 def$float_token=>• θnum*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.isNum(data)) {
            consume(l, data, state);
            puid |= 1;
            /*86:255 def$float_token=>θnum • def$float_token_group_130_103
            86:256 def$float_token=>θnum •*/
            skip_db1786a8af54d666(l/*[ 71 ]*/, data, state);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            if (l.current_byte == 46/*[.]*/) {
                pushFN(data, branch_4dcc18167384c0b1);
                return branch_7d2089edeff9eb59(l, data, state, prod, 1);
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            } else {
                /*--LEAF--*/
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                /*86:256 def$float_token=>θnum •*/
                return 86;
            }
        }
        return -1;
    }
    function $def$float_token_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            /*86:255 def$float_token=>θnum def$float_token_group_130_103 •*/
            add_reduce(state, data, 2, 0);
        }
        return 86;
    }
/*production name: def$hex_token_group_044_104
            grammar index: 87
            bodies:
	87:257 def$hex_token_group_044_104=>• θnum - 
		87:258 def$hex_token_group_044_104=>• a - 
		87:259 def$hex_token_group_044_104=>• b - 
		87:260 def$hex_token_group_044_104=>• c - 
		87:261 def$hex_token_group_044_104=>• d - 
		87:262 def$hex_token_group_044_104=>• e - 
		87:263 def$hex_token_group_044_104=>• f - 
		87:264 def$hex_token_group_044_104=>• A - 
		87:265 def$hex_token_group_044_104=>• B - 
		87:266 def$hex_token_group_044_104=>• C - 
		87:267 def$hex_token_group_044_104=>• D - 
		87:268 def$hex_token_group_044_104=>• E - 
		87:269 def$hex_token_group_044_104=>• F - 
            compile time: 6.232ms*/;
    function $def$hex_token_group_044_104(l, data, state, prod, puid) {
        /*87:257 def$hex_token_group_044_104=>• θnum
        87:258 def$hex_token_group_044_104=>• a
        87:259 def$hex_token_group_044_104=>• b
        87:260 def$hex_token_group_044_104=>• c
        87:261 def$hex_token_group_044_104=>• d
        87:262 def$hex_token_group_044_104=>• e
        87:263 def$hex_token_group_044_104=>• f
        87:264 def$hex_token_group_044_104=>• A
        87:265 def$hex_token_group_044_104=>• B
        87:266 def$hex_token_group_044_104=>• C
        87:267 def$hex_token_group_044_104=>• D
        87:268 def$hex_token_group_044_104=>• E
        87:269 def$hex_token_group_044_104=>• F*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if (l.isNum(data)) {
            pushFN(data, branch_5725d6225969df91);
            return branch_1ee3186a3cd3e97b(l, data, state, prod, 1);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.current_byte == 97/*[a]*/) {
            pushFN(data, branch_5725d6225969df91);
            return branch_636c8bed8603efd5(l, data, state, prod, 2);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.current_byte == 98/*[b]*/) {
            pushFN(data, branch_5725d6225969df91);
            return branch_853d951eb16a42b6(l, data, state, prod, 4);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.current_byte == 99/*[c]*/) {
            pushFN(data, branch_5725d6225969df91);
            return branch_6326574de2821296(l, data, state, prod, 8);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.current_byte == 100/*[d]*/) {
            pushFN(data, branch_5725d6225969df91);
            return branch_54f1ce87e9b53810(l, data, state, prod, 16);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.current_byte == 101/*[e]*/) {
            pushFN(data, branch_5725d6225969df91);
            return branch_c4e96e31cd7635e8(l, data, state, prod, 32);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.current_byte == 102/*[f]*/) {
            pushFN(data, branch_5725d6225969df91);
            return branch_cf353658237874c1(l, data, state, prod, 64);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.current_byte == 65/*[A]*/) {
            pushFN(data, branch_5725d6225969df91);
            return branch_06450e4f8c41ea8c(l, data, state, prod, 128);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.current_byte == 66/*[B]*/) {
            pushFN(data, branch_5725d6225969df91);
            return branch_d666284a25b50b6e(l, data, state, prod, 256);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.current_byte == 67/*[C]*/) {
            pushFN(data, branch_5725d6225969df91);
            return branch_795ff0072c3abc15(l, data, state, prod, 512);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.current_byte == 68/*[D]*/) {
            pushFN(data, branch_5725d6225969df91);
            return branch_f9ff5e049230d02f(l, data, state, prod, 1024);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.current_byte == 69/*[E]*/) {
            pushFN(data, branch_5725d6225969df91);
            return branch_7daa731d7c257794(l, data, state, prod, 2048);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.current_byte == 70/*[F]*/) {
            pushFN(data, branch_5725d6225969df91);
            return branch_54cbce3bf6eb0973(l, data, state, prod, 4096);
        }
        return -1;
    }
    function $def$hex_token_group_044_104_reducer(l, data, state, prod, puid) {
        return 87;
    }
/*production name: def$hex_token_HC_listbody1_105
            grammar index: 88
            bodies:
	88:270 def$hex_token_HC_listbody1_105=>• def$hex_token_HC_listbody1_105 def$hex_token_group_044_104 - 
		88:271 def$hex_token_HC_listbody1_105=>• def$hex_token_group_044_104 - 
            compile time: 10.742ms*/;
    function $def$hex_token_HC_listbody1_105(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*88:271 def$hex_token_HC_listbody1_105=>• def$hex_token_group_044_104*/
        puid |= 2;
        pushFN(data, branch_c1d1bde8a1ade4c6);
        pushFN(data, $def$hex_token_group_044_104);
        return puid;
        return -1;
    }
    function $def$hex_token_HC_listbody1_105_goto(l, data, state, prod, puid) {
        /*88:270 def$hex_token_HC_listbody1_105=>def$hex_token_HC_listbody1_105 • def$hex_token_group_044_104*/
        if (l.isSP(true, data)) {
            return 88;
        }
        /*88:270 def$hex_token_HC_listbody1_105=>def$hex_token_HC_listbody1_105 • def$hex_token_group_044_104
        89:272 def$hex_token=>0x def$hex_token_HC_listbody1_105 •*/
        skip_a294e41529bc9275(l/*[ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (assert_ascii(l, 0x0, 0x0, 0x7e, 0x7e) || l.isNum(data)) {
            pushFN(data, branch_93e110ed574c987e);
            return branch_4e2e169b2574575f(l, data, state, prod, 1);
        }
        return prod == 88 ? prod : -1;
    }
    function $def$hex_token_HC_listbody1_105_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            /*88:270 def$hex_token_HC_listbody1_105=>def$hex_token_HC_listbody1_105 def$hex_token_group_044_104 •*/
            add_reduce(state, data, 2, 2);
        } else if (2 == puid) {
            /*88:271 def$hex_token_HC_listbody1_105=>def$hex_token_group_044_104 •*/
            add_reduce(state, data, 1, 3);
        }
        return 88;
    }
/*production name: def$hex_token
            grammar index: 89
            bodies:
	89:272 def$hex_token=>• 0x def$hex_token_HC_listbody1_105 - 
            compile time: 1.318ms*/;
    function $def$hex_token(l, data, state, prod, puid) {
        /*89:272 def$hex_token=>• 0x def$hex_token_HC_listbody1_105*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (/*[0x]*/cmpr_set(l, data, 27, 2, 2)) {
            consume(l, data, state);
            puid |= 1;
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*89:272 def$hex_token=>0x • def$hex_token_HC_listbody1_105*/
            skip_a294e41529bc9275(l/*[ nl ][ 71 ]*/, data, state);
            puid |= 2;
            pushFN(data, branch_a6b376ed0bf34743);
            pushFN(data, $def$hex_token_HC_listbody1_105);
            return puid;
        }
        return -1;
    }
    function $def$hex_token_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            /*89:272 def$hex_token=>0x def$hex_token_HC_listbody1_105 •*/
            add_reduce(state, data, 2, 0);
        }
        return 89;
    }
/*production name: def$binary_token_group_047_106
            grammar index: 90
            bodies:
	90:273 def$binary_token_group_047_106=>• 0 - 
		90:274 def$binary_token_group_047_106=>• 1 - 
            compile time: 2.816ms*/;
    function $def$binary_token_group_047_106(l, data, state, prod, puid) {
        /*90:273 def$binary_token_group_047_106=>• 0
        90:274 def$binary_token_group_047_106=>• 1*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if (l.current_byte == 48/*[0]*/) {
            pushFN(data, branch_4bdf7a450c230f77);
            return branch_56c11cecc2c16501(l, data, state, prod, 1);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.current_byte == 49/*[1]*/) {
            pushFN(data, branch_4bdf7a450c230f77);
            return branch_9b2c12ad34f1d87e(l, data, state, prod, 2);
        }
        return -1;
    }
    function $def$binary_token_group_047_106_reducer(l, data, state, prod, puid) {
        return 90;
    }
/*production name: def$binary_token_HC_listbody1_107
            grammar index: 91
            bodies:
	91:275 def$binary_token_HC_listbody1_107=>• def$binary_token_HC_listbody1_107 def$binary_token_group_047_106 - 
		91:276 def$binary_token_HC_listbody1_107=>• def$binary_token_group_047_106 - 
            compile time: 8.662ms*/;
    function $def$binary_token_HC_listbody1_107(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*91:276 def$binary_token_HC_listbody1_107=>• def$binary_token_group_047_106*/
        puid |= 2;
        pushFN(data, branch_da4737880b1bd090);
        pushFN(data, $def$binary_token_group_047_106);
        return puid;
        return -1;
    }
    function $def$binary_token_HC_listbody1_107_goto(l, data, state, prod, puid) {
        /*91:275 def$binary_token_HC_listbody1_107=>def$binary_token_HC_listbody1_107 • def$binary_token_group_047_106*/
        if (l.isSP(true, data)) {
            return 91;
        }
        /*91:275 def$binary_token_HC_listbody1_107=>def$binary_token_HC_listbody1_107 • def$binary_token_group_047_106
        92:277 def$binary_token=>0b def$binary_token_HC_listbody1_107 •*/
        skip_a294e41529bc9275(l/*[ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if ((l.current_byte == 48/*[0]*/) || (l.current_byte == 49/*[1]*/)) {
            pushFN(data, branch_425efa1cfc8ffc16);
            return branch_8bf56374f58dd79b(l, data, state, prod, 1);
        }
        return prod == 91 ? prod : -1;
    }
    function $def$binary_token_HC_listbody1_107_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            /*91:275 def$binary_token_HC_listbody1_107=>def$binary_token_HC_listbody1_107 def$binary_token_group_047_106 •*/
            add_reduce(state, data, 2, 2);
        } else if (2 == puid) {
            /*91:276 def$binary_token_HC_listbody1_107=>def$binary_token_group_047_106 •*/
            add_reduce(state, data, 1, 3);
        }
        return 91;
    }
/*production name: def$binary_token
            grammar index: 92
            bodies:
	92:277 def$binary_token=>• 0b def$binary_token_HC_listbody1_107 - 
            compile time: 3.156ms*/;
    function $def$binary_token(l, data, state, prod, puid) {
        /*92:277 def$binary_token=>• 0b def$binary_token_HC_listbody1_107*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (/*[0b]*/cmpr_set(l, data, 114, 2, 2)) {
            consume(l, data, state);
            puid |= 1;
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*92:277 def$binary_token=>0b • def$binary_token_HC_listbody1_107*/
            skip_a294e41529bc9275(l/*[ nl ][ 71 ]*/, data, state);
            puid |= 2;
            pushFN(data, branch_4db389afdb5f8499);
            pushFN(data, $def$binary_token_HC_listbody1_107);
            return puid;
        }
        return -1;
    }
    function $def$binary_token_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            /*92:277 def$binary_token=>0b def$binary_token_HC_listbody1_107 •*/
            add_reduce(state, data, 2, 0);
        }
        return 92;
    }
/*production name: def$octal_token_group_050_108
            grammar index: 93
            bodies:
	93:278 def$octal_token_group_050_108=>• 0o - 
		93:279 def$octal_token_group_050_108=>• 0O - 
            compile time: 3.362ms*/;
    function $def$octal_token_group_050_108(l, data, state, prod, puid) {
        /*93:278 def$octal_token_group_050_108=>• 0o
        93:279 def$octal_token_group_050_108=>• 0O*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if (/*[0o]*/cmpr_set(l, data, 137, 2, 2)) {
            pushFN(data, branch_79fc893000608c8d);
            return branch_1704c826ae889739(l, data, state, prod, 1);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (/*[0O]*/cmpr_set(l, data, 139, 2, 2)) {
            pushFN(data, branch_79fc893000608c8d);
            return branch_dc03b569a85a4acb(l, data, state, prod, 2);
        }
        return -1;
    }
    function $def$octal_token_group_050_108_reducer(l, data, state, prod, puid) {
        return 93;
    }
/*production name: def$octal_token_group_058_109
            grammar index: 94
            bodies:
	94:280 def$octal_token_group_058_109=>• 0 - 
		94:281 def$octal_token_group_058_109=>• 1 - 
		94:282 def$octal_token_group_058_109=>• 2 - 
		94:283 def$octal_token_group_058_109=>• 3 - 
		94:284 def$octal_token_group_058_109=>• 4 - 
		94:285 def$octal_token_group_058_109=>• 5 - 
		94:286 def$octal_token_group_058_109=>• 6 - 
		94:287 def$octal_token_group_058_109=>• 7 - 
            compile time: 6.801ms*/;
    function $def$octal_token_group_058_109(l, data, state, prod, puid) {
        /*94:280 def$octal_token_group_058_109=>• 0
        94:281 def$octal_token_group_058_109=>• 1
        94:282 def$octal_token_group_058_109=>• 2
        94:283 def$octal_token_group_058_109=>• 3
        94:284 def$octal_token_group_058_109=>• 4
        94:285 def$octal_token_group_058_109=>• 5
        94:286 def$octal_token_group_058_109=>• 6
        94:287 def$octal_token_group_058_109=>• 7*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if (l.current_byte == 48/*[0]*/) {
            pushFN(data, branch_bfb17e535f287a90);
            return branch_c49c86b59c9e60b3(l, data, state, prod, 1);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.current_byte == 49/*[1]*/) {
            pushFN(data, branch_bfb17e535f287a90);
            return branch_e8a2d6c8a5f01d53(l, data, state, prod, 2);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.current_byte == 50/*[2]*/) {
            pushFN(data, branch_bfb17e535f287a90);
            return branch_a5787174b8f077f4(l, data, state, prod, 4);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.current_byte == 51/*[3]*/) {
            pushFN(data, branch_bfb17e535f287a90);
            return branch_08f87e10bf69e81b(l, data, state, prod, 8);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.current_byte == 52/*[4]*/) {
            pushFN(data, branch_bfb17e535f287a90);
            return branch_aff2e945f74821f8(l, data, state, prod, 16);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.current_byte == 53/*[5]*/) {
            pushFN(data, branch_bfb17e535f287a90);
            return branch_d44c796848a6a534(l, data, state, prod, 32);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.current_byte == 54/*[6]*/) {
            pushFN(data, branch_bfb17e535f287a90);
            return branch_72e2b3814fd075f3(l, data, state, prod, 64);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.current_byte == 55/*[7]*/) {
            pushFN(data, branch_bfb17e535f287a90);
            return branch_72c8c742bbfa704f(l, data, state, prod, 128);
        }
        return -1;
    }
    function $def$octal_token_group_058_109_reducer(l, data, state, prod, puid) {
        return 94;
    }
/*production name: def$octal_token_HC_listbody1_110
            grammar index: 95
            bodies:
	95:288 def$octal_token_HC_listbody1_110=>• def$octal_token_HC_listbody1_110 def$octal_token_group_058_109 - 
		95:289 def$octal_token_HC_listbody1_110=>• def$octal_token_group_058_109 - 
            compile time: 10.944ms*/;
    function $def$octal_token_HC_listbody1_110(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*95:289 def$octal_token_HC_listbody1_110=>• def$octal_token_group_058_109*/
        puid |= 2;
        pushFN(data, branch_c7782fe38088e5d9);
        pushFN(data, $def$octal_token_group_058_109);
        return puid;
        return -1;
    }
    function $def$octal_token_HC_listbody1_110_goto(l, data, state, prod, puid) {
        /*95:288 def$octal_token_HC_listbody1_110=>def$octal_token_HC_listbody1_110 • def$octal_token_group_058_109*/
        if (l.isSP(true, data)) {
            return 95;
        }
        /*95:288 def$octal_token_HC_listbody1_110=>def$octal_token_HC_listbody1_110 • def$octal_token_group_058_109
        96:290 def$octal_token=>def$octal_token_group_050_108 def$octal_token_HC_listbody1_110 •*/
        skip_a294e41529bc9275(l/*[ nl ][ 71 ]*/, data, state);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (assert_ascii(l, 0x0, 0xff0000, 0x0, 0x0)) {
            pushFN(data, branch_586655cede959332);
            return branch_a289e06c7ea8acb0(l, data, state, prod, 1);
        }
        return prod == 95 ? prod : -1;
    }
    function $def$octal_token_HC_listbody1_110_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            /*95:288 def$octal_token_HC_listbody1_110=>def$octal_token_HC_listbody1_110 def$octal_token_group_058_109 •*/
            add_reduce(state, data, 2, 2);
        } else if (2 == puid) {
            /*95:289 def$octal_token_HC_listbody1_110=>def$octal_token_group_058_109 •*/
            add_reduce(state, data, 1, 3);
        }
        return 95;
    }
/*production name: def$octal_token
            grammar index: 96
            bodies:
	96:290 def$octal_token=>• def$octal_token_group_050_108 def$octal_token_HC_listbody1_110 - 
            compile time: 2.071ms*/;
    function $def$octal_token(l, data, state, prod, puid) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*96:290 def$octal_token=>• def$octal_token_group_050_108 def$octal_token_HC_listbody1_110*/
        puid |= 1;
        pushFN(data, branch_878e80267e6da0fa);
        pushFN(data, $def$octal_token_group_050_108);
        return puid;
        return -1;
    }
    function $def$octal_token_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            /*96:290 def$octal_token=>def$octal_token_group_050_108 def$octal_token_HC_listbody1_110 •*/
            add_reduce(state, data, 2, 0);
        }
        return 96;
    }
    function recognizer(data, input_byte_length, production) {
        data.input_len = input_byte_length;
        data.lexer.next(data);
        skip_9184d3c96b70653a(data.lexer/*[ ws ][ nl ][ 71 ]*/, data, 16777215);
        dispatch(data, production);
        run(data);
    }

    const data_stack = [];
    function run(data) {
        data_stack.length = 0;
        data_stack.push(data);
        let ACTIVE = true;
        while (ACTIVE) {
            for (const data of data_stack)
                ACTIVE = stepKernel(data, 0);
        }
    }

    function stepKernel(data, stack_base) {

        let ptr = data.stack_ptr;

        const fn = data.stack[ptr];
        const stash = data.stash[ptr];
        data.stack_ptr--;
        print(data.lexer, data);

        const result = fn(data.lexer, data, data.state, data.prod, stash);
        data.stash[ptr] = result;
        data.prod = result;

        if (result < 0 || data.stack_ptr < stack_base)
            return false;

        return true;
    }

    function get_fork_information() {
        let i = 0;
        const fork_data = [];
        for (const fork of data_stack) {
            fork_data.push({
                ptr: i++,
                valid: fork.valid || true,
                depth: fork.origin_fork + fork.rules_ptr,
                command_offset: 0,
                command_block: new Uint16Array(64),
            });
        }
        return fork_data;
    }

    function get_next_command_block(fork) {

        const remainder = block64Consume(data_stack[fork.ptr], fork.command_block, fork.command_offset, 0, 64);

        fork.command_offset += 64 - remainder;

        if (remainder > 0)
            fork.command_block[64 - remainder] = 0;

        return fork.command_block;
    }

    function pushFN(data, fn_ref) { data.stack[++data.stack_ptr] = fn_ref; }

    function init_table() { return lookup_table; }


    function dispatch(data, production_index) {
        switch (production_index) {
            case 0: data.stack[0] = $skribble; data.stash[0] = 0; return;
            case 1: data.stack[0] = $module_group_02_100; data.stash[0] = 0; return;
            case 2: data.stack[0] = $module; data.stash[0] = 0; return;
            case 3: data.stack[0] = $statements; data.stash[0] = 0; return;
            case 4: data.stack[0] = $import; data.stash[0] = 0; return;
            case 5: data.stack[0] = $namespace_HC_listbody3_102; data.stash[0] = 0; return;
            case 6: data.stack[0] = $namespace; data.stash[0] = 0; return;
            case 7: data.stack[0] = $class_group_113_103; data.stash[0] = 0; return;
            case 8: data.stack[0] = $class_group_016_104; data.stash[0] = 0; return;
            case 9: data.stack[0] = $class_HC_listbody1_105; data.stash[0] = 0; return;
            case 10: data.stack[0] = $class; data.stash[0] = 0; return;
            case 11: data.stack[0] = $struct; data.stash[0] = 0; return;
            case 12: data.stack[0] = $function; data.stash[0] = 0; return;
            case 13: data.stack[0] = $function_expression; data.stash[0] = 0; return;
            case 14: data.stack[0] = $parameters; data.stash[0] = 0; return;
            case 15: data.stack[0] = $expression_statements_HC_listbody1_107; data.stash[0] = 0; return;
            case 16: data.stack[0] = $expression_statements_group_023_108; data.stash[0] = 0; return;
            case 17: data.stack[0] = $expression_statements_group_124_109; data.stash[0] = 0; return;
            case 18: data.stack[0] = $expression_statements; data.stash[0] = 0; return;
            case 19: data.stack[0] = $expression; data.stash[0] = 0; return;
            case 20: data.stack[0] = $if_expression_group_139_110; data.stash[0] = 0; return;
            case 21: data.stack[0] = $if_expression; data.stash[0] = 0; return;
            case 22: data.stack[0] = $binary_expression; data.stash[0] = 0; return;
            case 23: data.stack[0] = $unary_expression; data.stash[0] = 0; return;
            case 24: data.stack[0] = $unary_value; data.stash[0] = 0; return;
            case 25: data.stack[0] = $loop_expression_group_254_111; data.stash[0] = 0; return;
            case 26: data.stack[0] = $loop_expression_HC_listbody6_112; data.stash[0] = 0; return;
            case 27: data.stack[0] = $loop_expression; data.stash[0] = 0; return;
            case 28: data.stack[0] = $match_expression_HC_listbody3_113; data.stash[0] = 0; return;
            case 29: data.stack[0] = $match_expression; data.stash[0] = 0; return;
            case 30: data.stack[0] = $match_clause; data.stash[0] = 0; return;
            case 31: data.stack[0] = $call_expression_HC_listbody2_114; data.stash[0] = 0; return;
            case 32: data.stack[0] = $break_expression_group_165_115; data.stash[0] = 0; return;
            case 33: data.stack[0] = $break_expression; data.stash[0] = 0; return;
            case 34: data.stack[0] = $return_expression; data.stash[0] = 0; return;
            case 35: data.stack[0] = $continue_expression; data.stash[0] = 0; return;
            case 36: data.stack[0] = $primitive_declaration_group_170_116; data.stash[0] = 0; return;
            case 37: data.stack[0] = $primitive_declaration; data.stash[0] = 0; return;
            case 38: data.stack[0] = $identifier; data.stash[0] = 0; return;
            case 39: data.stack[0] = $identifier_token_group_075_117; data.stash[0] = 0; return;
            case 40: data.stack[0] = $identifier_token_HC_listbody1_118; data.stash[0] = 0; return;
            case 41: data.stack[0] = $identifier_token_group_080_119; data.stash[0] = 0; return;
            case 42: data.stack[0] = $identifier_token; data.stash[0] = 0; return;
            case 43: data.stack[0] = $modifier_list_HC_listbody1_120; data.stash[0] = 0; return;
            case 44: data.stack[0] = $modifier_list; data.stash[0] = 0; return;
            case 45: data.stack[0] = $type_group_087_121; data.stash[0] = 0; return;
            case 46: data.stack[0] = $type_group_092_122; data.stash[0] = 0; return;
            case 47: data.stack[0] = $type_group_095_123; data.stash[0] = 0; return;
            case 48: data.stack[0] = $type_group_098_124; data.stash[0] = 0; return;
            case 49: data.stack[0] = $type; data.stash[0] = 0; return;
            case 50: data.stack[0] = $value; data.stash[0] = 0; return;
            case 51: data.stack[0] = $string_group_0112_125; data.stash[0] = 0; return;
            case 52: data.stack[0] = $string_HC_listbody1_126; data.stash[0] = 0; return;
            case 53: data.stack[0] = $string_HC_listbody1_127; data.stash[0] = 0; return;
            case 54: data.stack[0] = $string; data.stash[0] = 0; return;
            case 55: data.stack[0] = $num; data.stash[0] = 0; return;
            case 56: data.stack[0] = $num_tok; data.stash[0] = 0; return;
            case 57: data.stack[0] = $operator_HC_listbody1_128; data.stash[0] = 0; return;
            case 58: data.stack[0] = $operator_HC_listbody1_129; data.stash[0] = 0; return;
            case 59: data.stack[0] = $operator; data.stash[0] = 0; return;
            case 60: data.stack[0] = $modifier; data.stash[0] = 0; return;
            case 61: data.stack[0] = $comment_group_0139_130; data.stash[0] = 0; return;
            case 62: data.stack[0] = $comment_HC_listbody1_131; data.stash[0] = 0; return;
            case 63: data.stack[0] = $comment_HC_listbody1_132; data.stash[0] = 0; return;
            case 64: data.stack[0] = $comment_group_0144_133; data.stash[0] = 0; return;
            case 65: data.stack[0] = $comment; data.stash[0] = 0; return;
            case 66: data.stack[0] = $template; data.stash[0] = 0; return;
            case 67: data.stack[0] = $def$hex; data.stash[0] = 0; return;
            case 68: data.stack[0] = $def$binary; data.stash[0] = 0; return;
            case 69: data.stack[0] = $def$octal; data.stash[0] = 0; return;
            case 70: data.stack[0] = $def$number; data.stash[0] = 0; return;
            case 71: data.stack[0] = $def$scientific_token_group_027_101; data.stash[0] = 0; return;
            case 72: data.stack[0] = $def$scientific_token_group_228_102; data.stash[0] = 0; return;
            case 73: data.stack[0] = $def$scientific_token; data.stash[0] = 0; return;
            case 74: data.stack[0] = $def$float_token_group_130_103; data.stash[0] = 0; return;
            case 75: data.stack[0] = $def$float_token; data.stash[0] = 0; return;
            case 76: data.stack[0] = $def$hex_token_group_044_104; data.stash[0] = 0; return;
            case 77: data.stack[0] = $def$hex_token_HC_listbody1_105; data.stash[0] = 0; return;
            case 78: data.stack[0] = $def$hex_token; data.stash[0] = 0; return;
            case 79: data.stack[0] = $def$binary_token_group_047_106; data.stash[0] = 0; return;
            case 80: data.stack[0] = $def$binary_token_HC_listbody1_107; data.stash[0] = 0; return;
            case 81: data.stack[0] = $def$binary_token; data.stash[0] = 0; return;
            case 82: data.stack[0] = $def$octal_token_group_050_108; data.stash[0] = 0; return;
            case 83: data.stack[0] = $def$octal_token_group_058_109; data.stash[0] = 0; return;
            case 84: data.stack[0] = $def$octal_token_HC_listbody1_110; data.stash[0] = 0; return;
            case 85: data.stack[0] = $def$octal_token; data.stash[0] = 0; return;
        }
    }



    function delete_data() { };
    ;
    return {
        recognizer,
        init_data,
        init_table,
        delete_data,
        get_fork_information,
        get_next_command_block
    };
});

const fns = [(e, sym) => sym[sym.length - 1],
(env, sym, pos) => ({ type: "module", statements: sym[0] })/*0*/
    , (env, sym, pos) => ((sym[0].push(sym[1]), sym[0]))/*1*/
    , (env, sym, pos) => ([sym[0]])/*2*/
    , (env, sym, pos) => (sym[0])/*3*/
    , (env, sym, pos) => (env.grabTemplateNode("template-statement"))/*4*/
    , (env, sym, pos) => ({ type: "namespace", name: sym[1], statements: sym[3] })/*5*/
    , (env, sym, pos) => ({ type: "namespace", name: sym[1] })/*6*/
    , (env, sym, pos) => ({ type: "class", name: sym[2], inherits: sym[3], modifiers: sym[0] || [], members: sym[5] || [] })/*7*/
    , (env, sym, pos) => ({ type: "class", name: sym[1], inherits: sym[2], modifiers: [], members: sym[4] || [] })/*8*/
    , (env, sym, pos) => ({ type: "class", name: sym[2], inherits: null, modifiers: sym[0] || [], members: sym[4] || [] })/*9*/
    , (env, sym, pos) => ({ type: "class", name: sym[2], inherits: sym[3], modifiers: sym[0] || [], members: [] })/*10*/
    , (env, sym, pos) => ({ type: "class", name: sym[1], inherits: null, modifiers: [], members: sym[3] || [] })/*11*/
    , (env, sym, pos) => ({ type: "class", name: sym[1], inherits: sym[2], modifiers: [], members: [] })/*12*/
    , (env, sym, pos) => ({ type: "class", name: sym[2], inherits: null, modifiers: sym[0] || [], members: [] })/*13*/
    , (env, sym, pos) => ({ type: "class", name: sym[1], inherits: null, modifiers: [], members: [] })/*14*/
    , (env, sym, pos) => ({ type: "structure", name: sym[2], modifiers: sym[0] || [], properties: sym[4] || [] })/*15*/
    , (env, sym, pos) => ({ type: "structure", name: sym[1], modifiers: [], properties: sym[3] || [] })/*16*/
    , (env, sym, pos) => ({ type: "structure", name: sym[2], modifiers: sym[0] || [], properties: [] })/*17*/
    , (env, sym, pos) => ({ type: "structure", name: sym[1], modifiers: [], properties: [] })/*18*/
    , (env, sym, pos) => ({ type: "function", return_type: sym[4], name: sym[2], modifiers: sym[0] || [], parameters: sym[6] || [], expressions: sym[9] || [] })/*19*/
    , (env, sym, pos) => ({ type: "function", return_type: sym[3], name: sym[1], modifiers: [], parameters: sym[5] || [], expressions: sym[8] || [] })/*20*/
    , (env, sym, pos) => ({ type: "function", return_type: sym[4], name: sym[2], modifiers: sym[0] || [], parameters: [], expressions: sym[8] || [] })/*21*/
    , (env, sym, pos) => ({ type: "function", return_type: sym[4], name: sym[2], modifiers: sym[0] || [], parameters: sym[6] || [], expressions: [] })/*22*/
    , (env, sym, pos) => ({ type: "function", return_type: sym[3], name: sym[1], modifiers: [], parameters: [], expressions: sym[7] || [] })/*23*/
    , (env, sym, pos) => ({ type: "function", return_type: sym[3], name: sym[1], modifiers: [], parameters: sym[5] || [], expressions: [] })/*24*/
    , (env, sym, pos) => ({ type: "function", return_type: sym[4], name: sym[2], modifiers: sym[0] || [], parameters: [], expressions: [] })/*25*/
    , (env, sym, pos) => ({ type: "function", return_type: sym[3], name: sym[1], modifiers: [], parameters: [], expressions: [] })/*26*/
    , (env, sym, pos) => ({ type: "lambda", return_type: sym[3], modifiers: sym[0] || [], parameters: sym[5] || [], expressions: sym[8] || [] })/*27*/
    , (env, sym, pos) => ({ type: "lambda", return_type: sym[2], modifiers: [], parameters: sym[4] || [], expressions: sym[7] || [] })/*28*/
    , (env, sym, pos) => ({ type: "lambda", return_type: sym[3], modifiers: sym[0] || [], parameters: [], expressions: sym[7] || [] })/*29*/
    , (env, sym, pos) => ({ type: "lambda", return_type: sym[3], modifiers: sym[0] || [], parameters: sym[5] || [], expressions: [] })/*30*/
    , (env, sym, pos) => ({ type: "lambda", return_type: sym[2], modifiers: [], parameters: [], expressions: sym[6] || [] })/*31*/
    , (env, sym, pos) => ({ type: "lambda", return_type: sym[2], modifiers: [], parameters: sym[4] || [], expressions: [] })/*32*/
    , (env, sym, pos) => ({ type: "lambda", return_type: sym[3], modifiers: sym[0] || [], parameters: [], expressions: [] })/*33*/
    , (env, sym, pos) => ({ type: "lambda", return_type: sym[2], modifiers: [], parameters: [], expressions: [] })/*34*/
    , (env, sym, pos) => ((sym[0].push(sym[2]), sym[0]))/*35*/
    , (env, sym, pos) => (sym[1])/*36*/
    , (env, sym, pos) => (null)/*37*/
    , (env, sym, pos) => (sym[1] ? (sym[0].push(sym[1]), sym[0]) : sym[0])/*38*/
    , (env, sym, pos) => ({ type: "block", expressions: sym[1] || [] })/*39*/
    , (env, sym, pos) => (env.grabTemplateNode("template-expression"))/*40*/
    , (env, sym, pos) => ({ type: "block", expressions: [] })/*41*/
    , (env, sym, pos) => ({ type: "assignment", target: (sym[0]), expression: sym[2] })/*42*/
    , (env, sym, pos) => ({ type: "if", assertion: sym[1], expression: sym[3], else: sym[4] })/*43*/
    , (env, sym, pos) => ({ type: "if", assertion: sym[1], expression: sym[3], else: null })/*44*/
    , (env, sym, pos) => ({ type: "operator-expression", list: [sym[0], sym[1]] })/*45*/
    , (env, sym, pos) => (sym[0].list ? (sym[0].list.push(sym[1], sym[2]), sym[0]) : { type: "operator-expression", list: [sym[0], sym[1], ...(sym[2].type == "operator-expression" ? sym[2].list : [sym[2]])] })/*46*/
    , (env, sym, pos) => ({ type: "parenthesis", expression: sym[1] })/*47*/
    , (env, sym, pos) => ({ type: "parenthesis" })/*48*/
    , (env, sym, pos) => ({ type: "loop", assertion: sym[1], expression: sym[2] })/*49*/
    , (env, sym, pos) => ({ type: "for-loop", initializers: sym[2], assertion: sym[4], post_iteration: sym[6], expression: sym[8] })/*50*/
    , (env, sym, pos) => ({ type: "in-loop", initializer: sym[2], target: sym[4], expression: sym[6] })/*51*/
    , (env, sym, pos) => ({ type: "for-loop", assertion: sym[3], post_iteration: sym[5], expression: sym[7] })/*52*/
    , (env, sym, pos) => ({ type: "for-loop", initializers: sym[2], assertion: null, post_iteration: sym[5], expression: sym[7] })/*53*/
    , (env, sym, pos) => ({ type: "for-loop", initializers: sym[2], assertion: sym[4], post_iteration: null, expression: sym[7] })/*54*/
    , (env, sym, pos) => ({ type: "for-loop", assertion: null, post_iteration: sym[4], expression: sym[6] })/*55*/
    , (env, sym, pos) => ({ type: "for-loop", assertion: sym[3], post_iteration: null, expression: sym[6] })/*56*/
    , (env, sym, pos) => ({ type: "for-loop", initializers: sym[2], assertion: null, post_iteration: null, expression: sym[6] })/*57*/
    , (env, sym, pos) => ({ type: "for-loop", assertion: null, post_iteration: null, expression: sym[5] })/*58*/
    , (env, sym, pos) => ({ type: "match", match_expression: sym[1], matches: sym[3] })/*59*/
    , (env, sym, pos) => ({ type: "match", match_expression: sym[1], matches: null })/*60*/
    , (env, sym, pos) => ({ type: "match-clause", match: sym[0], expression: sym[2] })/*61*/
    , (env, sym, pos) => ({ type: "call", reference: sym[0], parameters: sym[2] })/*62*/
    , (env, sym, pos) => ({ type: "call", reference: sym[0], parameters: null })/*63*/
    , (env, sym, pos) => ({ type: "member-reference", reference: sym[0], property: sym[2] })/*64*/
    , (env, sym, pos) => ({ type: "member-expression", reference: sym[0], expression: sym[2] })/*65*/
    , (env, sym, pos) => (env.grabTemplateNode("template-value"))/*66*/
    , (env, sym, pos) => ((sym[0].type = "reference", sym[0]))/*67*/
    , (env, sym, pos) => ({ type: "break", expression: sym[1] })/*68*/
    , (env, sym, pos) => ({ type: "break", expression: null })/*69*/
    , (env, sym, pos) => ({ type: "return", expression: sym[1] })/*70*/
    , (env, sym, pos) => ({ type: "return", expression: null })/*71*/
    , (env, sym, pos) => ({ type: "continue" })/*72*/
    , (env, sym, pos) => ({ type: "declaration", name: (sym[1]), primitive_type: sym[3], modifiers: sym[0] || [], initialization: sym[4] })/*73*/
    , (env, sym, pos) => ({ type: "declaration", name: (sym[0]), primitive_type: sym[2], modifiers: [], initialization: sym[3] })/*74*/
    , (env, sym, pos) => ({ type: "declaration", name: (sym[1]), primitive_type: sym[3], modifiers: sym[0] || [] })/*75*/
    , (env, sym, pos) => ({ type: "declaration", name: (sym[0]), primitive_type: sym[2], modifiers: [] })/*76*/
    , (env, sym, pos) => ({ type: "identifier", value: sym[0] })/*77*/
    , (env, sym, pos) => ((sym[0].type = "type-reference", sym[0]))/*78*/
    , (env, sym, pos) => ({ type: "type-" + sym[0][0] + sym[1] })/*79*/
    , (env, sym, pos) => ({ type: "type-string" })/*80*/
    , (env, sym, pos) => ({ type: "number", value: sym[0] })/*81*/
    , (env, sym, pos) => ({ type: "string", value: sym[0] })/*82*/
    , (env, sym, pos) => ({ type: "boolean", value: true })/*83*/
    , (env, sym, pos) => ({ type: "boolean", value: false })/*84*/
    , (env, sym, pos) => ({ type: "null" })/*85*/
    , (env, sym, pos) => (sym[0] + sym[1])/*86*/
    , (env, sym, pos) => (sym[0] + "")/*87*/
    , (env, sym, pos) => ({ type: "string", value: sym[1] })/*88*/
    , (env, sym, pos) => ({ type: "string", value: null })/*89*/
    , (env, sym, pos) => ({ type: "operator", val: sym[0] + sym[1], precedence: 0 })/*90*/
    , (env, sym, pos) => ({ type: "operator", val: sym[0], precedence: 0 })/*91*/];

const parser_factory = ParserFactory(fns, undefined, data);

export { fns as parser_functions, data as parser_data, parser_factory };