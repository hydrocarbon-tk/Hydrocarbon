import { ParserFactory } from "@candlefw/hydrocarbon";

const data = (() => {

    const lookup_table = new Uint8Array(382976);
    const sequence_lookup = [123, 125, 58, 40, 41, 44, 59, 61, 46, 91, 93, 95, 36, 92, 34, 39, 47, 42, 47, 60, 60, 45, 45, 45, 62, 62, 48, 120, 105, 109, 112, 111, 114, 116, 110, 117, 108, 108, 99, 111, 110, 116, 105, 110, 117, 101, 115, 116, 114, 105, 110, 103, 102, 97, 108, 115, 101, 120, 112, 111, 114, 116, 108, 111, 111, 112, 109, 97, 116, 99, 104, 98, 114, 101, 97, 107, 114, 101, 116, 117, 114, 110, 117, 105, 110, 116, 56, 49, 50, 56, 51, 50, 54, 52, 116, 114, 117, 101, 112, 114, 105, 118, 100, 65, 66, 67, 68, 69, 70, 53, 55, 47, 47, 48, 98, 105, 109, 117, 116, 110, 115, 99, 108, 115, 102, 108, 116, 101, 108, 115, 101, 49, 54, 112, 117, 98, 48, 111, 48, 79, 105, 115, 105, 102, 110];
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
        console.log([...s.input.slice(l.byte_offset, l.byte_offset + 5)].map(i => String.fromCharCode(i)).join(""));
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
        // the byte length is of the passed in type
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
            stack = [];

        return {
            valid: false,
            lexer: new Lexer,
            state: createState(true),
            prop: 0,
            stack_ptr: -1,
            input_ptr: 0,
            rules_ptr: 0,
            error_ptr: 0,
            debug_ptr: 0,
            input_len: input_len,
            rules_len: rules_len,
            error_len: error_len,
            debug_len: debug_len,
            input: input,
            rules: rules,
            error: error,
            debug: debug,
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
    function branch_023c3d6d895fa0b5(l, data, state, prod) {
        /*11:24 class=>modifier_list cls identifier class_group_113_103 • { class_HC_listbody1_105 }
        11:27 class=>modifier_list cls identifier class_group_113_103 • { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 123/*[{]*/) {
            /*
               11:24 class=>modifier_list cls identifier class_group_113_103 { • class_HC_listbody1_105 }
               11:27 class=>modifier_list cls identifier class_group_113_103 { • }
            */
            consume(l, data, state);
            /*11:24 class=>modifier_list cls identifier class_group_113_103 { • class_HC_listbody1_105 }
            11:27 class=>modifier_list cls identifier class_group_113_103 { • }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if (l.current_byte == 125/*[}]*/) {
                /*
                   11:27 class=>modifier_list cls identifier class_group_113_103 { • }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*11:27 class=>modifier_list cls identifier class_group_113_103 { • }*/
                consume(l, data, state);
                add_reduce(state, data, 6, 10);
                return 11;
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   11:24 class=>modifier_list cls identifier class_group_113_103 { • class_HC_listbody1_105 }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*11:24 class=>modifier_list cls identifier class_group_113_103 { • class_HC_listbody1_105 }*/
                pushFN(data, branch_210f970a58cb09ad);
                pushFN(data, $class_HC_listbody1_105);
                return 0;
            }
        }
        /*023c3d6d895fa0b504753c726011e241*/
    }
    function branch_038b1722715d8efb(l, data, state, prod) {
        pushFN(data, $expression_goto);
        return 21;
        /*038b1722715d8efb9ed568e83d0a0a33*/
    }
    function branch_03d55556b8274032(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 10, 20);
            return 13;
        }
        /*03d55556b827403254ce4bdc58098fe5*/
    }
    function branch_0635284bed9fda5f(l, data, state, prod) {
        /*13:36 function=>modifier_list fn identifier : type • ( parameters ) { expression_statements }
        13:38 function=>modifier_list fn identifier : type • ( ) { expression_statements }
        13:39 function=>modifier_list fn identifier : type • ( parameters ) { }
        13:42 function=>modifier_list fn identifier : type • ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 40/*[(]*/) {
            /*
               13:36 function=>modifier_list fn identifier : type ( • parameters ) { expression_statements }
               13:38 function=>modifier_list fn identifier : type ( • ) { expression_statements }
               13:39 function=>modifier_list fn identifier : type ( • parameters ) { }
               13:42 function=>modifier_list fn identifier : type ( • ) { }
            */
            consume(l, data, state);
            /*13:36 function=>modifier_list fn identifier : type ( • parameters ) { expression_statements }
            13:39 function=>modifier_list fn identifier : type ( • parameters ) { }
            13:38 function=>modifier_list fn identifier : type ( • ) { expression_statements }
            13:42 function=>modifier_list fn identifier : type ( • ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (l.current_byte == 41/*[)]*/) {
                /*
                   13:38 function=>modifier_list fn identifier : type ( • ) { expression_statements }
                   13:42 function=>modifier_list fn identifier : type ( • ) { }
                */
                /*13:38 function=>modifier_list fn identifier : type ( • ) { expression_statements }
                13:42 function=>modifier_list fn identifier : type ( • ) { }*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l, data, state);
                /*13:38 function=>modifier_list fn identifier : type ( ) • { expression_statements }
                13:42 function=>modifier_list fn identifier : type ( ) • { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                if (l.current_byte == 123/*[{]*/) {
                    /*
                       13:38 function=>modifier_list fn identifier : type ( ) { • expression_statements }
                       13:42 function=>modifier_list fn identifier : type ( ) { • }
                    */
                    consume(l, data, state);
                    /*13:38 function=>modifier_list fn identifier : type ( ) { • expression_statements }
                    13:42 function=>modifier_list fn identifier : type ( ) { • }*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    if (l.current_byte == 125/*[}]*/) {
                        /*
                           13:42 function=>modifier_list fn identifier : type ( ) { • }
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert ⤋⤋⤋*/
                        /*13:42 function=>modifier_list fn identifier : type ( ) { • }*/
                        consume(l, data, state);
                        add_reduce(state, data, 9, 25);
                        return 13;
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    } else {
                        /*
                           13:38 function=>modifier_list fn identifier : type ( ) { • expression_statements }
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                        /*13:38 function=>modifier_list fn identifier : type ( ) { • expression_statements }*/
                        pushFN(data, branch_a367c2885e5a992a);
                        pushFN(data, $expression_statements);
                        return 0;
                    }
                }
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   13:36 function=>modifier_list fn identifier : type ( • parameters ) { expression_statements }
                   13:39 function=>modifier_list fn identifier : type ( • parameters ) { }
                */
                /*13:36 function=>modifier_list fn identifier : type ( • parameters ) { expression_statements }
                13:39 function=>modifier_list fn identifier : type ( • parameters ) { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                pushFN(data, branch_816dccba9447c3cd);
                pushFN(data, $parameters);
                return 0;
            }
        }
        /*0635284bed9fda5f76a64dcf0f59f7ff*/
    }
    function branch_0672f32c0002f802(l, data, state, prod) {
        /*43:125 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_169_116
        43:127 primitive_declaration=>modifier_list identifier : type •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 61/*[=]*/) {
            /*
               43:125 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_169_116
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*43:125 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_169_116*/
            pushFN(data, branch_bc642d2c3a78962a);
            pushFN(data, $primitive_declaration_group_169_116);
            return 0;
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*
               43:127 primitive_declaration=>modifier_list identifier : type •
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*43:127 primitive_declaration=>modifier_list identifier : type •*/
            add_reduce(state, data, 4, 74);
            /*-------------INDIRECT-------------------*/
            return 4;
        }
        /*0672f32c0002f802871145f8a9c4f721*/
    }
    function branch_07626bd16c9eede0(l, data, state, prod) {
        add_reduce(state, data, 3, 46);
        return 25;
        /*07626bd16c9eede00d6a99ce4b3d3b8d*/
    }
    function branch_07c4b2a266e81cdd(l, data, state, prod) {
        pushFN(data, $unary_value_goto);
        return 27;
        /*07c4b2a266e81cdd4fa52870e019ca27*/
    }
    function branch_0887d0c4ca0085d1(l, data, state, prod) {
        add_reduce(state, data, 3, 42);
        add_reduce(state, data, 1, 3);
        pushFN(data, $expression_statements_goto);
        return 20;
        /*0887d0c4ca0085d1ea37c430aaefbd25*/
    }
    function branch_09e6facc48babb83(l, data, state, prod) {
        /*111:328 virtual-76:3:1|--lvl:0=>• = expression
        112:329 virtual-85:1:1|--lvl:0=>•*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if (l.current_byte == 61/*[=]*/) {
            /*
               111:328 virtual-76:3:1|--lvl:0=>• = expression
               112:329 virtual-85:1:1|--lvl:0=>•
            */
            /*111:328 virtual-76:3:1|--lvl:0=>• = expression*/
            let pk = l.copy();
            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, false);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if ((((((((((((((/*[if]*/cmpr_set(pk, data, 142, 2, 2) ||/*[match]*/cmpr_set(pk, data, 66, 5, 5)) || dt_bcea2102060eab13(pk, data)) || dt_6ae31dd85a62ef5c(pk, data)) ||/*[true]*/cmpr_set(pk, data, 94, 4, 4)) ||/*[null]*/cmpr_set(pk, data, 34, 4, 4)) ||/*[<<--]*/cmpr_set(pk, data, 19, 4, 4)) ||/*[break]*/cmpr_set(pk, data, 71, 5, 5)) ||/*[return]*/cmpr_set(pk, data, 76, 6, 6)) ||/*[continue]*/cmpr_set(pk, data, 38, 8, 8)) ||/*[loop]*/cmpr_set(pk, data, 62, 4, 4)) || assert_ascii(pk, 0x0, 0x20000194, 0x88000000, 0x8000000)) || pk.isUniID(data)) || pk.isNum(data)) || pk.isSym(true, data)) {
                /*
                   111:328 virtual-76:3:1|--lvl:0=>• = expression
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                /*111:328 virtual-76:3:1|--lvl:0=>• = expression*/
                consume(l, data, state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                pushFN(data, branch_0887d0c4ca0085d1);
                pushFN(data, $expression);
                return 0;
            }
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*
               112:329 virtual-85:1:1|--lvl:0=>•
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*112:329 virtual-85:1:1|--lvl:0=>•*/
            pushFN(data, $expression_statements_goto);
            return 26;
        }
        return -1;
        /*09e6facc48babb8326f3eb5be0c3bee1*/
    }
    function branch_0a63f05ef1aa2163(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        pushFN(data, branch_e9132cf2af900310);
        pushFN(data, $expression);
        return 0;
        /*0a63f05ef1aa2163dd1ac9a7df0e8110*/
    }
    function branch_0a729fd49cbaf9d2(l, data, state, prod) {
        /*14:44 function_expression=>modifier_list fn : type ( parameters • ) { expression_statements }
        14:47 function_expression=>modifier_list fn : type ( parameters • ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 41/*[)]*/) {
            /*
               14:44 function_expression=>modifier_list fn : type ( parameters ) • { expression_statements }
               14:47 function_expression=>modifier_list fn : type ( parameters ) • { }
            */
            consume(l, data, state);
            /*14:44 function_expression=>modifier_list fn : type ( parameters ) • { expression_statements }
            14:47 function_expression=>modifier_list fn : type ( parameters ) • { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if (l.current_byte == 123/*[{]*/) {
                /*
                   14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }
                   14:47 function_expression=>modifier_list fn : type ( parameters ) { • }
                */
                consume(l, data, state);
                /*14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }
                14:47 function_expression=>modifier_list fn : type ( parameters ) { • }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if (l.current_byte == 125/*[}]*/) {
                    /*
                       14:47 function_expression=>modifier_list fn : type ( parameters ) { • }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    /*14:47 function_expression=>modifier_list fn : type ( parameters ) { • }*/
                    consume(l, data, state);
                    add_reduce(state, data, 9, 30);
                    /*-------------INDIRECT-------------------*/
                    pushFN(data, $expression_statements_goto);
                    return 26;
                }
            }
        }
        /*0a729fd49cbaf9d2d406160f25c17d93*/
    }
    function branch_0ac4de478f2a0502(l, data, state, prod) {
        add_reduce(state, data, 4, 59);
        return 33;
        /*0ac4de478f2a0502076e74623a2fe9d9*/
    }
    function branch_0bbbbac616724bc0(l, data, state, prod) {
        /*43:125 primitive_declaration=>modifier_list identifier • : type primitive_declaration_group_169_116
        43:127 primitive_declaration=>modifier_list identifier • : type*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 58/*[:]*/) {
            /*
               43:125 primitive_declaration=>modifier_list identifier : • type primitive_declaration_group_169_116
               43:127 primitive_declaration=>modifier_list identifier : • type
            */
            consume(l, data, state);
            /*43:125 primitive_declaration=>modifier_list identifier : • type primitive_declaration_group_169_116
            43:127 primitive_declaration=>modifier_list identifier : • type*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_9eeb00e35cd81d29);
            pushFN(data, $type);
            return 0;
        }
        /*0bbbbac616724bc07b2a0f5bf77dc3a0*/
    }
    function branch_0c7e6ede7c6bf26a(l, data, state, prod) {
        /*13:36 function=>modifier_list • fn identifier : type ( parameters ) { expression_statements }
        13:38 function=>modifier_list • fn identifier : type ( ) { expression_statements }
        13:39 function=>modifier_list • fn identifier : type ( parameters ) { }
        13:42 function=>modifier_list • fn identifier : type ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (/*[fn]*/cmpr_set(l, data, 143, 2, 2)) {
            /*
               13:36 function=>modifier_list fn • identifier : type ( parameters ) { expression_statements }
               13:38 function=>modifier_list fn • identifier : type ( ) { expression_statements }
               13:39 function=>modifier_list fn • identifier : type ( parameters ) { }
               13:42 function=>modifier_list fn • identifier : type ( ) { }
            */
            consume(l, data, state);
            /*13:36 function=>modifier_list fn • identifier : type ( parameters ) { expression_statements }
            13:38 function=>modifier_list fn • identifier : type ( ) { expression_statements }
            13:39 function=>modifier_list fn • identifier : type ( parameters ) { }
            13:42 function=>modifier_list fn • identifier : type ( ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_8c24c0c94360cb7f);
            pushFN(data, $identifier);
            return 0;
        }
        /*0c7e6ede7c6bf26a57f25646a678ea20*/
    }
    function branch_0c8895f298aab50d(l, data, state, prod) {
        /*31:97 loop_expression=>loop ( parameters ; expression • ; loop_expression_HC_listbody6_112 ) expression
        31:101 loop_expression=>loop ( parameters ; expression • ; ) expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 59/*[;]*/) {
            /*
               31:97 loop_expression=>loop ( parameters ; expression ; • loop_expression_HC_listbody6_112 ) expression
               31:101 loop_expression=>loop ( parameters ; expression ; • ) expression
            */
            consume(l, data, state);
            /*31:97 loop_expression=>loop ( parameters ; expression ; • loop_expression_HC_listbody6_112 ) expression
            31:101 loop_expression=>loop ( parameters ; expression ; • ) expression*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if (l.current_byte == 41/*[)]*/) {
                /*
                   31:101 loop_expression=>loop ( parameters ; expression ; • ) expression
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*31:101 loop_expression=>loop ( parameters ; expression ; • ) expression*/
                consume(l, data, state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                pushFN(data, branch_f91ebab657293c51);
                pushFN(data, $expression);
                return 0;
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   31:97 loop_expression=>loop ( parameters ; expression ; • loop_expression_HC_listbody6_112 ) expression
                */
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*31:97 loop_expression=>loop ( parameters ; expression ; • loop_expression_HC_listbody6_112 ) expression*/
                pushFN(data, branch_b09b16aad1bdc0ca);
                pushFN(data, $loop_expression_HC_listbody6_112);
                return 0;
            }
        }
        /*0c8895f298aab50dc54b4794291fc869*/
    }
    function branch_0e5b0f99e02052c7(l, data, state, prod) {
        /*31:97 loop_expression=>loop ( parameters • ; expression ; loop_expression_HC_listbody6_112 ) expression
        31:100 loop_expression=>loop ( parameters • ; ; loop_expression_HC_listbody6_112 ) expression
        31:101 loop_expression=>loop ( parameters • ; expression ; ) expression
        31:104 loop_expression=>loop ( parameters • ; ; ) expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 59/*[;]*/) {
            /*
               31:97 loop_expression=>loop ( parameters ; • expression ; loop_expression_HC_listbody6_112 ) expression
               31:100 loop_expression=>loop ( parameters ; • ; loop_expression_HC_listbody6_112 ) expression
               31:101 loop_expression=>loop ( parameters ; • expression ; ) expression
               31:104 loop_expression=>loop ( parameters ; • ; ) expression
            */
            consume(l, data, state);
            /*31:97 loop_expression=>loop ( parameters ; • expression ; loop_expression_HC_listbody6_112 ) expression
            31:101 loop_expression=>loop ( parameters ; • expression ; ) expression
            31:100 loop_expression=>loop ( parameters ; • ; loop_expression_HC_listbody6_112 ) expression
            31:104 loop_expression=>loop ( parameters ; • ; ) expression*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (l.current_byte == 59/*[;]*/) {
                /*
                   31:100 loop_expression=>loop ( parameters ; • ; loop_expression_HC_listbody6_112 ) expression
                   31:104 loop_expression=>loop ( parameters ; • ; ) expression
                */
                /*31:100 loop_expression=>loop ( parameters ; • ; loop_expression_HC_listbody6_112 ) expression
                31:104 loop_expression=>loop ( parameters ; • ; ) expression*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l, data, state);
                /*31:100 loop_expression=>loop ( parameters ; ; • loop_expression_HC_listbody6_112 ) expression
                31:104 loop_expression=>loop ( parameters ; ; • ) expression*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if (l.current_byte == 41/*[)]*/) {
                    /*
                       31:104 loop_expression=>loop ( parameters ; ; • ) expression
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    /*31:104 loop_expression=>loop ( parameters ; ; • ) expression*/
                    consume(l, data, state);
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    pushFN(data, branch_5f3464810796e1f8);
                    pushFN(data, $expression);
                    return 0;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else {
                    /*
                       31:100 loop_expression=>loop ( parameters ; ; • loop_expression_HC_listbody6_112 ) expression
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    /*31:100 loop_expression=>loop ( parameters ; ; • loop_expression_HC_listbody6_112 ) expression*/
                    pushFN(data, branch_28805875a00d8651);
                    pushFN(data, $loop_expression_HC_listbody6_112);
                    return 0;
                }
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   31:97 loop_expression=>loop ( parameters ; • expression ; loop_expression_HC_listbody6_112 ) expression
                   31:101 loop_expression=>loop ( parameters ; • expression ; ) expression
                */
                /*31:97 loop_expression=>loop ( parameters ; • expression ; loop_expression_HC_listbody6_112 ) expression
                31:101 loop_expression=>loop ( parameters ; • expression ; ) expression*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                pushFN(data, branch_0c8895f298aab50d);
                pushFN(data, $expression);
                return 0;
            }
        }
        /*0e5b0f99e02052c76a9f919f68efe14d*/
    }
    function branch_0f7b03818ed6fa30(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 10, 27);
            return 14;
        }
        /*0f7b03818ed6fa30c3155d343a804d63*/
    }
    function branch_0fdc5c5b577f7e48(l, data, state, prod) {
        add_reduce(state, data, 1, 1);
        return 0;
        /*0fdc5c5b577f7e481c47b8e3e546f5f3*/
    }
    function branch_1003a49dd535a3e0(l, data, state, prod) {
        /*48:137 identifier_token=>identifier_token_group_074_117 identifier_token_HC_listbody1_118 • identifier_token_group_079_119
        48:139 identifier_token=>identifier_token_group_074_117 identifier_token_HC_listbody1_118 •*/
        skip_db1786a8af54d666(l/*[ 71 ]*/, data, true);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/) {
            /*
               48:137 identifier_token=>identifier_token_group_074_117 identifier_token_HC_listbody1_118 • identifier_token_group_079_119
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*48:137 identifier_token=>identifier_token_group_074_117 identifier_token_HC_listbody1_118 • identifier_token_group_079_119*/
            pushFN(data, branch_52c337927313e58e);
            pushFN(data, $identifier_token_group_079_119);
            return 0;
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*
               48:139 identifier_token=>identifier_token_group_074_117 identifier_token_HC_listbody1_118 •
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*48:139 identifier_token=>identifier_token_group_074_117 identifier_token_HC_listbody1_118 •*/
            add_reduce(state, data, 2, 0);
            return 48;
        }
        /*1003a49dd535a3e01df379bcc7fd74a4*/
    }
    function branch_1120e25a74dade0c(l, data, state, prod) {
        add_reduce(state, data, 2, 86);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $string_HC_listbody1_126_goto);
        return 58;
        /*1120e25a74dade0ceb67cdd78aece1bc*/
    }
    function branch_11d890e1265c30e7(l, data, state, prod) {
        pushFN(data, $expression_statements_group_023_108_goto);
        return 44;
        /*11d890e1265c30e7b243cc2af04fe35b*/
    }
    function branch_12d4d051e95c361b(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_602f1906c5ebdd6c);
            pushFN(data, $expression);
            return 0;
        }
        /*12d4d051e95c361b87b6fd2a29edfc25*/
    }
    function branch_13452c6b0d137070(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 6, 9);
            return 11;
        }
        /*13452c6b0d13707044524434228b6a1c*/
    }
    function branch_13f6c10119d024c3(l, data, state, prod) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $comment_HC_listbody1_132_goto);
        return 69;
        /*13f6c10119d024c3feaafa524bb10e22*/
    }
    function branch_1564fea44ed58d5a(l, data, state, prod) {
        /*25:80 binary_expression=>unary_expression operator •
        25:81 binary_expression=>unary_expression operator • expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        switch (sym_map_d91b3248f12ee50f(l, data)) {
            default:
            case 0:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                /*25:80 binary_expression=>unary_expression operator •*/
                add_reduce(state, data, 2, 45);
                return 25;
            case 1:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*25:81 binary_expression=>unary_expression operator • expression*/
                pushFN(data, branch_07626bd16c9eede0);
                pushFN(data, $expression);
                return 0;
            case 2:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                /*25:81 binary_expression=>unary_expression operator • expression*/
                pushFN(data, branch_07626bd16c9eede0);
                pushFN(data, $expression);
                return 0;
        }
        /*1564fea44ed58d5a370b900f18c727a1*/
    }
    function branch_165bdecb6736c7db(l, data, state, prod) {
        /*11:24 class=>modifier_list cls identifier • class_group_113_103 { class_HC_listbody1_105 }
        11:27 class=>modifier_list cls identifier • class_group_113_103 { }
        11:26 class=>modifier_list cls identifier • { class_HC_listbody1_105 }
        11:30 class=>modifier_list cls identifier • { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if (l.current_byte == 123/*[{]*/) {
            /*
               11:26 class=>modifier_list cls identifier • { class_HC_listbody1_105 }
               11:30 class=>modifier_list cls identifier • { }
            */
            /*11:26 class=>modifier_list cls identifier • { class_HC_listbody1_105 }
            11:30 class=>modifier_list cls identifier • { }*/
            let pk = l.copy();
            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, false);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (pk.current_byte == 125/*[}]*/) {
                /*
                   11:30 class=>modifier_list cls identifier • { }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                /*11:30 class=>modifier_list cls identifier • { }*/
                consume(l, data, state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
                    add_reduce(state, data, 5, 13);
                    return 11;
                }
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            } else {
                /*
                   11:26 class=>modifier_list cls identifier • { class_HC_listbody1_105 }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                /*11:26 class=>modifier_list cls identifier • { class_HC_listbody1_105 }*/
                consume(l, data, state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                pushFN(data, branch_13452c6b0d137070);
                pushFN(data, $class_HC_listbody1_105);
                return 0;
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               11:24 class=>modifier_list cls identifier • class_group_113_103 { class_HC_listbody1_105 }
               11:27 class=>modifier_list cls identifier • class_group_113_103 { }
            */
            /*11:24 class=>modifier_list cls identifier • class_group_113_103 { class_HC_listbody1_105 }
            11:27 class=>modifier_list cls identifier • class_group_113_103 { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_023c3d6d895fa0b5);
            pushFN(data, $class_group_113_103);
            return 0;
        }
        /*165bdecb6736c7db507c19a0fea2f2c4*/
    }
    function branch_1709b75fc70b68e5(l, data, state, prod) {
        /*43:126 primitive_declaration=>identifier : type • primitive_declaration_group_169_116
        43:128 primitive_declaration=>identifier : type •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 61/*[=]*/) {
            /*
               43:126 primitive_declaration=>identifier : type • primitive_declaration_group_169_116
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*43:126 primitive_declaration=>identifier : type • primitive_declaration_group_169_116*/
            pushFN(data, branch_38c5fdfd910fbb12);
            pushFN(data, $primitive_declaration_group_169_116);
            return 0;
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*
               43:128 primitive_declaration=>identifier : type •
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*43:128 primitive_declaration=>identifier : type •*/
            add_reduce(state, data, 3, 75);
            return 43;
        }
        /*1709b75fc70b68e5909df2c1c39366ee*/
    }
    function branch_184068955d11f054(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_907da7cc882c4c7b);
            pushFN(data, $expression);
            return 0;
        }
        /*184068955d11f054f3d2af337928a02c*/
    }
    function branch_19c074d3aef73be7(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 9, 29);
            return 14;
        }
        /*19c074d3aef73be7f92f54f23f4c1325*/
    }
    function branch_1b02061e2d759869(l, data, state, prod) {
        add_reduce(state, data, 3, 42);
        add_reduce(state, data, 1, 3);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $expression_statements_goto);
        return 20;
        /*1b02061e2d759869ba7382d25bb36ddd*/
    }
    function branch_1b4a3e6a54087dcc(l, data, state, prod) {
        /*108:325 virtual-76:3:1|--lvl:0=>• = expression
        109:326 virtual-85:1:1|--lvl:0=>•*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if (l.current_byte == 61/*[=]*/) {
            /*
               108:325 virtual-76:3:1|--lvl:0=>• = expression
               109:326 virtual-85:1:1|--lvl:0=>•
            */
            /*108:325 virtual-76:3:1|--lvl:0=>• = expression*/
            let pk = l.copy();
            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, false);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if ((((((((((((((/*[if]*/cmpr_set(pk, data, 142, 2, 2) ||/*[match]*/cmpr_set(pk, data, 66, 5, 5)) || dt_bcea2102060eab13(pk, data)) || dt_6ae31dd85a62ef5c(pk, data)) ||/*[true]*/cmpr_set(pk, data, 94, 4, 4)) ||/*[null]*/cmpr_set(pk, data, 34, 4, 4)) ||/*[<<--]*/cmpr_set(pk, data, 19, 4, 4)) ||/*[break]*/cmpr_set(pk, data, 71, 5, 5)) ||/*[return]*/cmpr_set(pk, data, 76, 6, 6)) ||/*[continue]*/cmpr_set(pk, data, 38, 8, 8)) ||/*[loop]*/cmpr_set(pk, data, 62, 4, 4)) || assert_ascii(pk, 0x0, 0x20000194, 0x88000000, 0x8000000)) || pk.isUniID(data)) || pk.isNum(data)) || pk.isSym(true, data)) {
                /*
                   108:325 virtual-76:3:1|--lvl:0=>• = expression
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                /*108:325 virtual-76:3:1|--lvl:0=>• = expression*/
                consume(l, data, state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                pushFN(data, branch_aa3116d56547b12e);
                pushFN(data, $expression);
                return 0;
            }
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*
               109:326 virtual-85:1:1|--lvl:0=>•
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*109:326 virtual-85:1:1|--lvl:0=>•*/
            pushFN(data, $expression_goto);
            return 26;
        }
        return -1;
        /*1b4a3e6a54087dcc69e4278cc5aa520b*/
    }
    function branch_1c1e5087c2744b35(l, data, state, prod) {
        /*43:125 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_169_116
        43:127 primitive_declaration=>modifier_list identifier : type •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 61/*[=]*/) {
            /*
               43:125 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_169_116
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*43:125 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_169_116*/
            pushFN(data, branch_2922daf0f8d517c7);
            pushFN(data, $primitive_declaration_group_169_116);
            return 0;
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*
               43:127 primitive_declaration=>modifier_list identifier : type •
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*43:127 primitive_declaration=>modifier_list identifier : type •*/
            add_reduce(state, data, 4, 74);
            /*-------------INDIRECT-------------------*/
            return 18;
        }
        /*1c1e5087c2744b357871d11a17f7633e*/
    }
    function branch_1c227c92dd77aed8(l, data, state, prod) {
        /*65:192 operator=>= operator_HC_listbody1_129 • identifier_token_group_079_119
        65:195 operator=>= operator_HC_listbody1_129 •*/
        skip_db1786a8af54d666(l/*[ 71 ]*/, data, true);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/) {
            /*
               65:192 operator=>= operator_HC_listbody1_129 • identifier_token_group_079_119
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*65:192 operator=>= operator_HC_listbody1_129 • identifier_token_group_079_119*/
            pushFN(data, branch_adbd08e4801cc051);
            pushFN(data, $identifier_token_group_079_119);
            return 0;
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*
               65:195 operator=>= operator_HC_listbody1_129 •
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*65:195 operator=>= operator_HC_listbody1_129 •*/
            add_reduce(state, data, 2, 90);
            return 65;
        }
        /*1c227c92dd77aed82e9cd2f2bf8f676e*/
    }
    function branch_1f0e8a0854632fda(l, data, state, prod) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $parameters_goto);
        return 16;
        /*1f0e8a0854632fdab5aca1813b55c705*/
    }
    function branch_1f5d1034e12cbb67(l, data, state, prod) {
        add_reduce(state, data, 1, 87);
        pushFN(data, $def$string_value_goto);
        return 103;
        /*1f5d1034e12cbb67115a78410659010f*/
    }
    function branch_2016706f46c983fa(l, data, state, prod) {
        /*108:325 virtual-126:4:1|--lvl:0=>: type • primitive_declaration_group_169_116
        109:326 virtual-128:3:1|--lvl:0=>: type •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        if (!(l.current_byte == 61/*[=]*/) || l.END(data)) {
            /*
               109:326 virtual-128:3:1|--lvl:0=>: type •
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*109:326 virtual-128:3:1|--lvl:0=>: type •*/
            add_reduce(state, data, 3, 75);
            add_reduce(state, data, 1, 3);
            pushFN(data, $expression_statements_goto);
            return 20;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               108:325 virtual-126:4:1|--lvl:0=>: type • primitive_declaration_group_169_116
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*108:325 virtual-126:4:1|--lvl:0=>: type • primitive_declaration_group_169_116*/
            pushFN(data, branch_88a0b5c0814835ce);
            pushFN(data, $primitive_declaration_group_169_116);
            return 0;
        }
        /*2016706f46c983fa859d8ef78dbda6b9*/
    }
    function branch_209d29fe94151c58(l, data, state, prod) {
        add_reduce(state, data, 5, 72);
        add_reduce(state, data, 1, 3);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $expression_statements_goto);
        return 20;
        /*209d29fe94151c580e8aa68c261b516f*/
    }
    function branch_210f970a58cb09ad(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 7, 7);
            return 11;
        }
        /*210f970a58cb09ad34f5b47f81c87348*/
    }
    function branch_21d011590bad51a3(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_3205c0ded576131e);
            pushFN(data, $expression);
            return 0;
        }
        /*21d011590bad51a32273a62f36f86065*/
    }
    function branch_227c616e124e1e0b(l, data, state, prod) {
        add_reduce(state, data, 1, 87);
        pushFN(data, $string_HC_listbody1_126_goto);
        return 58;
        /*227c616e124e1e0bc19abf586fc826d0*/
    }
    function branch_2408e2022b83f3d6(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if (/*[asterisk/]*/cmpr_set(l, data, 17, 2, 2) && consume(l, data, state)) {
            add_reduce(state, data, 3, 0);
            return 71;
        }
        /*2408e2022b83f3d63ae14cf070d15e7f*/
    }
    function branch_242856005a2da596(l, data, state, prod) {
        add_reduce(state, data, 2, 2);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $namespace_HC_listbody3_102_goto);
        return 6;
        /*242856005a2da596104c599c86c6db4d*/
    }
    function branch_244d69143320cb4d(l, data, state, prod) {
        /*108:325 virtual-137:3:1|--lvl:0=>• identifier_token_HC_listbody1_118 identifier_token_group_079_119
        109:326 virtual-139:2:1|--lvl:0=>• identifier_token_HC_listbody1_118*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (((l.current_byte == 95/*[_]*/) || (l.current_byte == 36/*[$]*/)) || l.isUniID(data)) {
            /*
               108:325 virtual-137:3:1|--lvl:0=>• identifier_token_HC_listbody1_118 identifier_token_group_079_119
               109:326 virtual-139:2:1|--lvl:0=>• identifier_token_HC_listbody1_118
            */
            /*108:325 virtual-137:3:1|--lvl:0=>• identifier_token_HC_listbody1_118 identifier_token_group_079_119
            109:326 virtual-139:2:1|--lvl:0=>• identifier_token_HC_listbody1_118*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_638895d2bbd14b91);
            pushFN(data, $identifier_token_HC_listbody1_118);
            return 0;
        }
        return -1;
        /*244d69143320cb4d724f6a35e2a8a806*/
    }
    function branch_25c8b278264d80f2(l, data, state, prod) {
        pushFN(data, branch_f557979c122cc8c0);
        return 44;
        /*25c8b278264d80f2ba5d7dd4578c3e00*/
    }
    function branch_26d65826c7f31d39(l, data, state, prod) {
        /*25:80 binary_expression=>unary_expression operator •
        25:81 binary_expression=>unary_expression operator • expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        switch (sym_map_d91b3248f12ee50f(l, data)) {
            default:
            case 0:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                /*25:80 binary_expression=>unary_expression operator •*/
                add_reduce(state, data, 2, 45);
                /*-------------INDIRECT-------------------*/
                return 18;
            case 1:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*25:81 binary_expression=>unary_expression operator • expression*/
                pushFN(data, branch_40c5ff801836a1f7);
                pushFN(data, $expression);
                return 0;
            case 2:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                /*25:81 binary_expression=>unary_expression operator • expression*/
                pushFN(data, branch_40c5ff801836a1f7);
                pushFN(data, $expression);
                return 0;
        }
        /*26d65826c7f31d3937646cf3f2da759f*/
    }
    function branch_278919c62116ea81(l, data, state, prod) {
        /*14:44 function_expression=>modifier_list fn : type ( parameters • ) { expression_statements }
        14:47 function_expression=>modifier_list fn : type ( parameters • ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 41/*[)]*/) {
            /*
               14:44 function_expression=>modifier_list fn : type ( parameters ) • { expression_statements }
               14:47 function_expression=>modifier_list fn : type ( parameters ) • { }
            */
            consume(l, data, state);
            /*14:44 function_expression=>modifier_list fn : type ( parameters ) • { expression_statements }
            14:47 function_expression=>modifier_list fn : type ( parameters ) • { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if (l.current_byte == 123/*[{]*/) {
                /*
                   14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }
                   14:47 function_expression=>modifier_list fn : type ( parameters ) { • }
                */
                consume(l, data, state);
                /*14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }
                14:47 function_expression=>modifier_list fn : type ( parameters ) { • }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if (l.current_byte == 125/*[}]*/) {
                    /*
                       14:47 function_expression=>modifier_list fn : type ( parameters ) { • }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    /*14:47 function_expression=>modifier_list fn : type ( parameters ) { • }*/
                    consume(l, data, state);
                    add_reduce(state, data, 9, 30);
                    /*-------------INDIRECT-------------------*/
                    pushFN(data, $expression_statements_group_023_108_goto);
                    return 26;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else {
                    /*
                       14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    /*14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }*/
                    pushFN(data, branch_8c57d1885b959d2a);
                    pushFN(data, $expression_statements);
                    return 0;
                }
            }
        }
        /*278919c62116ea81bc6f67f09e40a03d*/
    }
    function branch_28805875a00d8651(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_c8c377fde95c32f5);
            pushFN(data, $expression);
            return 0;
        }
        /*28805875a00d86513e897d45626455c5*/
    }
    function branch_28c5dc3955a9ede3(l, data, state, prod) {
        pushFN(data, $statements_goto);
        return 50;
        /*28c5dc3955a9ede301c5ab8f3b51de91*/
    }
    function branch_2922daf0f8d517c7(l, data, state, prod) {
        add_reduce(state, data, 5, 72);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $expression_statements_group_023_108_goto);
        return 18;
        /*2922daf0f8d517c7e45188334195e9e6*/
    }
    function branch_298174b4face442a(l, data, state, prod) {
        add_reduce(state, data, 2, 0);
        return 71;
        /*298174b4face442a2af2412e6606570e*/
    }
    function branch_29bbdf58183bc8d7(l, data, state, prod) {
        pushFN(data, $statements_goto);
        return 4;
        /*29bbdf58183bc8d7e7031e798ef6fa26*/
    }
    function branch_2cf4b2ac4601be86(l, data, state, prod) {
        /*43:126 primitive_declaration=>identifier : type • primitive_declaration_group_169_116
        43:128 primitive_declaration=>identifier : type •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 61/*[=]*/) {
            /*
               43:126 primitive_declaration=>identifier : type • primitive_declaration_group_169_116
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*43:126 primitive_declaration=>identifier : type • primitive_declaration_group_169_116*/
            pushFN(data, branch_7fc4c7ff3183bbc8);
            pushFN(data, $primitive_declaration_group_169_116);
            return 0;
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*
               43:128 primitive_declaration=>identifier : type •
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*43:128 primitive_declaration=>identifier : type •*/
            add_reduce(state, data, 3, 75);
            /*-------------INDIRECT-------------------*/
            return 18;
        }
        /*2cf4b2ac4601be862992a34cc35fe40d*/
    }
    function branch_2d9e766cbeea47a1(l, data, state, prod) {
        return 73;
        /*2d9e766cbeea47a1d3540bfd6ed6c1af*/
    }
    function branch_2e223495b08c92ba(l, data, state, prod) {
        add_reduce(state, data, 2, 2);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $identifier_token_HC_listbody1_118_goto);
        return 46;
        /*2e223495b08c92ba968c7f2e2b62ee0e*/
    }
    function branch_2e5412a0cf7f9dc2(l, data, state, prod) {
        /*19:60 expression_statements_group_124_109=>expression_statements_HC_listbody1_107 • expression_statements_group_023_108
        19:61 expression_statements_group_124_109=>expression_statements_HC_listbody1_107 •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        if (!((((((((((((((/*[if]*/cmpr_set(l, data, 142, 2, 2) ||/*[match]*/cmpr_set(l, data, 66, 5, 5)) || dt_bcea2102060eab13(l, data)) || dt_6ae31dd85a62ef5c(l, data)) ||/*[true]*/cmpr_set(l, data, 94, 4, 4)) ||/*[null]*/cmpr_set(l, data, 34, 4, 4)) ||/*[<<--]*/cmpr_set(l, data, 19, 4, 4)) ||/*[break]*/cmpr_set(l, data, 71, 5, 5)) ||/*[return]*/cmpr_set(l, data, 76, 6, 6)) ||/*[continue]*/cmpr_set(l, data, 38, 8, 8)) ||/*[loop]*/cmpr_set(l, data, 62, 4, 4)) || assert_ascii(l, 0x0, 0x20000194, 0x88000000, 0x8000000)) || l.isUniID(data)) || l.isNum(data)) || l.isSym(true, data)) || ((l.current_byte == 125/*[}]*/) || (l.current_byte == 59/*[;]*/))) {
            /*
               19:61 expression_statements_group_124_109=>expression_statements_HC_listbody1_107 •
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*19:61 expression_statements_group_124_109=>expression_statements_HC_listbody1_107 •*/
            add_reduce(state, data, 1, 37);
            return 19;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               19:60 expression_statements_group_124_109=>expression_statements_HC_listbody1_107 • expression_statements_group_023_108
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*19:60 expression_statements_group_124_109=>expression_statements_HC_listbody1_107 • expression_statements_group_023_108*/
            pushFN(data, branch_2e7fb3c467cc3310);
            pushFN(data, $expression_statements_group_023_108);
            return 0;
        }
        /*2e5412a0cf7f9dc2625e6665483865ea*/
    }
    function branch_2e70fd316ce2baa3(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 6, 15);
            /*-------------INDIRECT-------------------*/
            pushFN(data, $statements_goto);
            return 4;
        }
        /*2e70fd316ce2baa3566ef4ee19a3c699*/
    }
    function branch_2e7fb3c467cc3310(l, data, state, prod) {
        add_reduce(state, data, 2, 36);
        return 19;
        /*2e7fb3c467cc3310b8664b7514dbc7e2*/
    }
    function branch_2ee20e42b6f5801d(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 11, 19);
            /*-------------INDIRECT-------------------*/
            pushFN(data, $class_group_016_104_goto);
            return 9;
        }
        /*2ee20e42b6f5801d2bdfa913bedcae30*/
    }
    function branch_2fa9779782f73a91(l, data, state, prod) {
        add_reduce(state, data, 3, 49);
        return 31;
        /*2fa9779782f73a911d1e7bf70ccf1ac6*/
    }
    function branch_3006927599d5524c(l, data, state, prod) {
        add_reduce(state, data, 5, 43);
        return 24;
        /*3006927599d5524ce0102d99962b248e*/
    }
    function branch_3205c0ded576131e(l, data, state, prod) {
        /*3205c0ded576131ea255ad2bd38b0fb2*/
    }
    function branch_36356984c95e7c2c(l, data, state, prod) {
        /*123:340 virtual-76:3:1|--lvl:2=>• = expression
        124:341 virtual-85:1:1|--lvl:2=>•*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if (l.current_byte == 61/*[=]*/) {
            /*
               123:340 virtual-76:3:1|--lvl:2=>• = expression
               124:341 virtual-85:1:1|--lvl:2=>•
            */
            /*123:340 virtual-76:3:1|--lvl:2=>• = expression*/
            let pk = l.copy();
            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, false);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if ((((((((((((((/*[if]*/cmpr_set(pk, data, 142, 2, 2) ||/*[match]*/cmpr_set(pk, data, 66, 5, 5)) || dt_bcea2102060eab13(pk, data)) || dt_6ae31dd85a62ef5c(pk, data)) ||/*[true]*/cmpr_set(pk, data, 94, 4, 4)) ||/*[null]*/cmpr_set(pk, data, 34, 4, 4)) ||/*[<<--]*/cmpr_set(pk, data, 19, 4, 4)) ||/*[break]*/cmpr_set(pk, data, 71, 5, 5)) ||/*[return]*/cmpr_set(pk, data, 76, 6, 6)) ||/*[continue]*/cmpr_set(pk, data, 38, 8, 8)) ||/*[loop]*/cmpr_set(pk, data, 62, 4, 4)) || assert_ascii(pk, 0x0, 0x20000194, 0x88000000, 0x8000000)) || pk.isUniID(data)) || pk.isNum(data)) || pk.isSym(true, data)) {
                /*
                   123:340 virtual-76:3:1|--lvl:2=>• = expression
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                /*123:340 virtual-76:3:1|--lvl:2=>• = expression*/
                consume(l, data, state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                pushFN(data, branch_3205c0ded576131e);
                pushFN(data, $expression);
                return 0;
            }
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*
               124:341 virtual-85:1:1|--lvl:2=>•
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*124:341 virtual-85:1:1|--lvl:2=>•*/
            pushFN(data, branch_f557979c122cc8c0);
            return 27;
        }
        return -1;
        /*36356984c95e7c2cb84aa87b609055e2*/
    }
    function branch_36dfcf8821ceaa50(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        pushFN(data, branch_f1ee391f92f003e7);
        pushFN(data, $type_group_091_122);
        return 0;
        /*36dfcf8821ceaa50ed4ea15d1bd44701*/
    }
    function branch_38121111c23993e5(l, data, state, prod) {
        skip_6c02533b5dc0d802(l/*[ ws ][ 71 ]*/, data, true);
        pushFN(data, branch_e9b913e5644de2ed);
        pushFN(data, $comment_group_0143_133);
        return 0;
        /*38121111c23993e5a65344e6e437e762*/
    }
    function branch_3879c03d7a2c7a9e(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
            add_reduce(state, data, 3, 47);
            pushFN(data, $unary_value_goto);
            return 27;
        }
        /*3879c03d7a2c7a9e8ee5ee63b983f01c*/
    }
    function branch_38c5fdfd910fbb12(l, data, state, prod) {
        add_reduce(state, data, 4, 73);
        return 43;
        /*38c5fdfd910fbb124235ea1607440a58*/
    }
    function branch_38dcf650f8497618(l, data, state, prod) {
        add_reduce(state, data, 2, 2);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $comment_HC_listbody1_131_goto);
        return 68;
        /*38dcf650f84976185f27c0a1d3c8c7be*/
    }
    function branch_398d9230ecf58463(l, data, state, prod) {
        add_reduce(state, data, 3, 0);
        return 48;
        /*398d9230ecf58463cef6787e4958c074*/
    }
    function branch_3b323cb13dff0150(l, data, state, prod) {
        /*13:37 function=>fn identifier : type • ( parameters ) { expression_statements }
        13:40 function=>fn identifier : type • ( ) { expression_statements }
        13:41 function=>fn identifier : type • ( parameters ) { }
        13:43 function=>fn identifier : type • ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 40/*[(]*/) {
            /*
               13:37 function=>fn identifier : type ( • parameters ) { expression_statements }
               13:40 function=>fn identifier : type ( • ) { expression_statements }
               13:41 function=>fn identifier : type ( • parameters ) { }
               13:43 function=>fn identifier : type ( • ) { }
            */
            consume(l, data, state);
            /*13:37 function=>fn identifier : type ( • parameters ) { expression_statements }
            13:41 function=>fn identifier : type ( • parameters ) { }
            13:40 function=>fn identifier : type ( • ) { expression_statements }
            13:43 function=>fn identifier : type ( • ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (l.current_byte == 41/*[)]*/) {
                /*
                   13:40 function=>fn identifier : type ( • ) { expression_statements }
                   13:43 function=>fn identifier : type ( • ) { }
                */
                /*13:40 function=>fn identifier : type ( • ) { expression_statements }
                13:43 function=>fn identifier : type ( • ) { }*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l, data, state);
                /*13:40 function=>fn identifier : type ( ) • { expression_statements }
                13:43 function=>fn identifier : type ( ) • { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                if (l.current_byte == 123/*[{]*/) {
                    /*
                       13:40 function=>fn identifier : type ( ) { • expression_statements }
                       13:43 function=>fn identifier : type ( ) { • }
                    */
                    consume(l, data, state);
                    /*13:40 function=>fn identifier : type ( ) { • expression_statements }
                    13:43 function=>fn identifier : type ( ) { • }*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    if (l.current_byte == 125/*[}]*/) {
                        /*
                           13:43 function=>fn identifier : type ( ) { • }
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert ⤋⤋⤋*/
                        /*13:43 function=>fn identifier : type ( ) { • }*/
                        consume(l, data, state);
                        add_reduce(state, data, 8, 26);
                        return 13;
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    } else {
                        /*
                           13:40 function=>fn identifier : type ( ) { • expression_statements }
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                        /*13:40 function=>fn identifier : type ( ) { • expression_statements }*/
                        pushFN(data, branch_dc0325cf695ea04c);
                        pushFN(data, $expression_statements);
                        return 0;
                    }
                }
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   13:37 function=>fn identifier : type ( • parameters ) { expression_statements }
                   13:41 function=>fn identifier : type ( • parameters ) { }
                */
                /*13:37 function=>fn identifier : type ( • parameters ) { expression_statements }
                13:41 function=>fn identifier : type ( • parameters ) { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                pushFN(data, branch_67765c2136ebd189);
                pushFN(data, $parameters);
                return 0;
            }
        }
        /*3b323cb13dff01502a2ccdc33dcc451c*/
    }
    function branch_3cc627c3e362113a(l, data, state, prod) {
        /*110:327 virtual-137:3:1|--lvl:0=>• identifier_token_HC_listbody1_118 identifier_token_group_079_119
        111:328 virtual-139:2:1|--lvl:0=>• identifier_token_HC_listbody1_118*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if ((l.current_byte == 95/*[_]*/) || (l.current_byte == 36/*[$]*/)) {
            /*
               110:327 virtual-137:3:1|--lvl:0=>• identifier_token_HC_listbody1_118 identifier_token_group_079_119
               111:328 virtual-139:2:1|--lvl:0=>• identifier_token_HC_listbody1_118
            */
            /*110:327 virtual-137:3:1|--lvl:0=>• identifier_token_HC_listbody1_118 identifier_token_group_079_119
            111:328 virtual-139:2:1|--lvl:0=>• identifier_token_HC_listbody1_118*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_7e6e473a12f5754c);
            pushFN(data, $identifier_token_HC_listbody1_118);
            return 0;
        }
        return -1;
        /*3cc627c3e362113a22008c48b286b4d9*/
    }
    function branch_3dcc2e9c33ef9ef7(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 61/*[=]*/) && consume(l, data, state)) {
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_780374fd5be39be5);
            pushFN(data, $expression);
            return 0;
        }
        /*3dcc2e9c33ef9ef71b025906e080a247*/
    }
    function branch_3e6ee8775062329c(l, data, state, prod) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $def$defaultproductions_HC_listbody1_100_goto);
        return 74;
        /*3e6ee8775062329c28be70c9457025bc*/
    }
    function branch_40c5ff801836a1f7(l, data, state, prod) {
        add_reduce(state, data, 3, 46);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $expression_statements_group_023_108_goto);
        return 18;
        /*40c5ff801836a1f76dbae00dff5aa21c*/
    }
    function branch_413721b69b4b8263(l, data, state, prod) {
        add_reduce(state, data, 2, 45);
        return 26;
        /*413721b69b4b826332dfc9280f5addc2*/
    }
    function branch_4246da6fe7b5dad2(l, data, state, prod) {
        add_reduce(state, data, 1, 66);
        pushFN(data, $member_expression_goto);
        return 37;
        /*4246da6fe7b5dad25dde91d51cb3242f*/
    }
    function branch_432ec7452c86add4(l, data, state, prod) {
        /*11:25 class=>cls identifier class_group_113_103 • { class_HC_listbody1_105 }
        11:29 class=>cls identifier class_group_113_103 • { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 123/*[{]*/) {
            /*
               11:25 class=>cls identifier class_group_113_103 { • class_HC_listbody1_105 }
               11:29 class=>cls identifier class_group_113_103 { • }
            */
            consume(l, data, state);
            /*11:25 class=>cls identifier class_group_113_103 { • class_HC_listbody1_105 }
            11:29 class=>cls identifier class_group_113_103 { • }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if (l.current_byte == 125/*[}]*/) {
                /*
                   11:29 class=>cls identifier class_group_113_103 { • }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*11:29 class=>cls identifier class_group_113_103 { • }*/
                consume(l, data, state);
                add_reduce(state, data, 5, 12);
                return 11;
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   11:25 class=>cls identifier class_group_113_103 { • class_HC_listbody1_105 }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*11:25 class=>cls identifier class_group_113_103 { • class_HC_listbody1_105 }*/
                pushFN(data, branch_4f859722ebf3c831);
                pushFN(data, $class_HC_listbody1_105);
                return 0;
            }
        }
        /*432ec7452c86add436efc958764ef202*/
    }
    function branch_44a426357f6f6a27(l, data, state, prod) {
        /*43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
        43:128 primitive_declaration=>identifier • : type*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 58/*[:]*/) {
            /*
               43:126 primitive_declaration=>identifier : • type primitive_declaration_group_169_116
               43:128 primitive_declaration=>identifier : • type
            */
            consume(l, data, state);
            /*43:126 primitive_declaration=>identifier : • type primitive_declaration_group_169_116
            43:128 primitive_declaration=>identifier : • type*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_1709b75fc70b68e5);
            pushFN(data, $type);
            return 0;
        }
        /*44a426357f6f6a2712e79f95cff48666*/
    }
    function branch_44b44c160d469289(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
            add_reduce(state, data, 4, 62);
            /*-------------INDIRECT-------------------*/
            pushFN(data, $unary_value_goto);
            return 27;
        }
        /*44b44c160d4692893794b4d4e779967c*/
    }
    function branch_44fc0a336466d84a(l, data, state, prod) {
        /*24:78 if_expression=>if expression • : expression if_expression_group_139_110
        24:79 if_expression=>if expression • : expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 58/*[:]*/) {
            /*
               24:78 if_expression=>if expression : • expression if_expression_group_139_110
               24:79 if_expression=>if expression : • expression
            */
            consume(l, data, state);
            /*24:78 if_expression=>if expression : • expression if_expression_group_139_110
            24:79 if_expression=>if expression : • expression*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_af103e7f249a99a8);
            pushFN(data, $expression);
            return 0;
        }
        /*44fc0a336466d84a0bc275e146d79d3e*/
    }
    function branch_463a609a91f9c965(l, data, state, prod) {
        add_reduce(state, data, 7, 56);
        return 31;
        /*463a609a91f9c965cd204434b7fa4cd2*/
    }
    function branch_47941f6b8bbc7250(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 5, 5);
            return 7;
        }
        /*47941f6b8bbc7250e4e66c6c713a0c8a*/
    }
    function branch_47f6df334226208e(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 93/*[]]*/) && consume(l, data, state)) {
            add_reduce(state, data, 4, 65);
            /*-------------INDIRECT-------------------*/
            pushFN(data, branch_f557979c122cc8c0);
            return 37;
        }
        /*47f6df334226208e9ac6cc5b293080a0*/
    }
    function branch_4a236324dddf6f01(l, data, state, prod) {
        /*-------------INDIRECT-------------------*/
        add_reduce(state, data, 7, 51);
        return 31;
        /*4a236324dddf6f01ce53814836f27067*/
    }
    function branch_4a365d9ac60db21d(l, data, state, prod) {
        add_reduce(state, data, 1, 77);
        return 55;
        /*4a365d9ac60db21d576be2cfb94427db*/
    }
    function branch_4b0edc44e83efea2(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 6, 15);
            return 12;
        }
        /*4b0edc44e83efea228d1d369e3fb051e*/
    }
    function branch_4cc48863826efbc1(l, data, state, prod) {
        /*43:126 primitive_declaration=>identifier : type • primitive_declaration_group_169_116
        43:128 primitive_declaration=>identifier : type •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 61/*[=]*/) {
            /*
               43:126 primitive_declaration=>identifier : type • primitive_declaration_group_169_116
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*43:126 primitive_declaration=>identifier : type • primitive_declaration_group_169_116*/
            pushFN(data, branch_ee95c97c1366e769);
            pushFN(data, $primitive_declaration_group_169_116);
            return 0;
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*
               43:128 primitive_declaration=>identifier : type •
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*43:128 primitive_declaration=>identifier : type •*/
            add_reduce(state, data, 3, 75);
            /*-------------INDIRECT-------------------*/
            pushFN(data, branch_f557979c122cc8c0);
            return 43;
        }
        /*4cc48863826efbc16d9bb0848264a09d*/
    }
    function branch_4db389afdb5f8499(l, data, state, prod) {
        add_reduce(state, data, 2, 0);
        return 92;
        /*4db389afdb5f8499a2d9ca0c66579d61*/
    }
    function branch_4e61e6c3ff64b530(l, data, state, prod) {
        add_reduce(state, data, 2, 0);
        return 86;
        /*4e61e6c3ff64b530ceea0bc369a8d661*/
    }
    function branch_4f859722ebf3c831(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 6, 8);
            return 11;
        }
        /*4f859722ebf3c831c92ab34b7e1bfccf*/
    }
    function branch_4ffb307f9a642c98(l, data, state, prod) {
        /*14:44 function_expression=>modifier_list fn : type ( parameters • ) { expression_statements }
        14:47 function_expression=>modifier_list fn : type ( parameters • ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 41/*[)]*/) {
            /*
               14:44 function_expression=>modifier_list fn : type ( parameters ) • { expression_statements }
               14:47 function_expression=>modifier_list fn : type ( parameters ) • { }
            */
            consume(l, data, state);
            /*14:44 function_expression=>modifier_list fn : type ( parameters ) • { expression_statements }
            14:47 function_expression=>modifier_list fn : type ( parameters ) • { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if (l.current_byte == 123/*[{]*/) {
                /*
                   14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }
                   14:47 function_expression=>modifier_list fn : type ( parameters ) { • }
                */
                consume(l, data, state);
                /*14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }
                14:47 function_expression=>modifier_list fn : type ( parameters ) { • }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if (l.current_byte == 125/*[}]*/) {
                    /*
                       14:47 function_expression=>modifier_list fn : type ( parameters ) { • }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    /*14:47 function_expression=>modifier_list fn : type ( parameters ) { • }*/
                    consume(l, data, state);
                    add_reduce(state, data, 9, 30);
                    return 14;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else {
                    /*
                       14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    /*14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }*/
                    pushFN(data, branch_0f7b03818ed6fa30);
                    pushFN(data, $expression_statements);
                    return 0;
                }
            }
        }
        /*4ffb307f9a642c98493cdf6d4a0623b5*/
    }
    function branch_5060fb87b4359d4c(l, data, state, prod) {
        /*109:326 virtual-97:9:1|--lvl:0=>( parameters • ; expression ; loop_expression_HC_listbody6_112 ) expression
        110:327 virtual-100:8:1|--lvl:0=>( parameters • ; ; loop_expression_HC_listbody6_112 ) expression
        111:328 virtual-101:8:1|--lvl:0=>( parameters • ; expression ; ) expression
        112:329 virtual-104:7:1|--lvl:0=>( parameters • ; ; ) expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 59/*[;]*/) {
            /*
               109:326 virtual-97:9:1|--lvl:0=>( parameters ; • expression ; loop_expression_HC_listbody6_112 ) expression
               110:327 virtual-100:8:1|--lvl:0=>( parameters ; • ; loop_expression_HC_listbody6_112 ) expression
               111:328 virtual-101:8:1|--lvl:0=>( parameters ; • expression ; ) expression
               112:329 virtual-104:7:1|--lvl:0=>( parameters ; • ; ) expression
            */
            consume(l, data, state);
            /*109:326 virtual-97:9:1|--lvl:0=>( parameters ; • expression ; loop_expression_HC_listbody6_112 ) expression
            111:328 virtual-101:8:1|--lvl:0=>( parameters ; • expression ; ) expression
            110:327 virtual-100:8:1|--lvl:0=>( parameters ; • ; loop_expression_HC_listbody6_112 ) expression
            112:329 virtual-104:7:1|--lvl:0=>( parameters ; • ; ) expression*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (l.current_byte == 59/*[;]*/) {
                /*
                   110:327 virtual-100:8:1|--lvl:0=>( parameters ; • ; loop_expression_HC_listbody6_112 ) expression
                   112:329 virtual-104:7:1|--lvl:0=>( parameters ; • ; ) expression
                */
                /*110:327 virtual-100:8:1|--lvl:0=>( parameters ; • ; loop_expression_HC_listbody6_112 ) expression
                112:329 virtual-104:7:1|--lvl:0=>( parameters ; • ; ) expression*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l, data, state);
                /*110:327 virtual-100:8:1|--lvl:0=>( parameters ; ; • loop_expression_HC_listbody6_112 ) expression
                112:329 virtual-104:7:1|--lvl:0=>( parameters ; ; • ) expression*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if (l.current_byte == 41/*[)]*/) {
                    /*
                       112:329 virtual-104:7:1|--lvl:0=>( parameters ; ; • ) expression
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    /*112:329 virtual-104:7:1|--lvl:0=>( parameters ; ; • ) expression*/
                    consume(l, data, state);
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    pushFN(data, branch_3205c0ded576131e);
                    pushFN(data, $expression);
                    return 0;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else {
                    /*
                       110:327 virtual-100:8:1|--lvl:0=>( parameters ; ; • loop_expression_HC_listbody6_112 ) expression
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    /*110:327 virtual-100:8:1|--lvl:0=>( parameters ; ; • loop_expression_HC_listbody6_112 ) expression*/
                    pushFN(data, branch_21d011590bad51a3);
                    pushFN(data, $loop_expression_HC_listbody6_112);
                    return 0;
                }
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   109:326 virtual-97:9:1|--lvl:0=>( parameters ; • expression ; loop_expression_HC_listbody6_112 ) expression
                   111:328 virtual-101:8:1|--lvl:0=>( parameters ; • expression ; ) expression
                */
                /*109:326 virtual-97:9:1|--lvl:0=>( parameters ; • expression ; loop_expression_HC_listbody6_112 ) expression
                111:328 virtual-101:8:1|--lvl:0=>( parameters ; • expression ; ) expression*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                pushFN(data, branch_9d78e95a51c9affd);
                pushFN(data, $expression);
                return 0;
            }
        }
        /*5060fb87b4359d4cf957daed55429e3b*/
    }
    function branch_50da32212a93f324(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 93/*[]]*/) && consume(l, data, state)) {
            add_reduce(state, data, 4, 65);
            /*-------------INDIRECT-------------------*/
            pushFN(data, $unary_value_goto);
            return 37;
        }
        /*50da32212a93f3243f49dbc16329ac56*/
    }
    function branch_50f99c46d94b1746(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 3, 39);
            pushFN(data, $expression_goto);
            return 21;
        }
        /*50f99c46d94b1746d18c4d055250aef3*/
    }
    function branch_51a03d86d608f1f7(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
            add_reduce(state, data, 3, 36);
        }
        /*51a03d86d608f1f717602fb198a036cb*/
    }
    function branch_52c337927313e58e(l, data, state, prod) {
        add_reduce(state, data, 3, 0);
        return 48;
        /*52c337927313e58e0571fbb2f6e6dc69*/
    }
    function branch_53c288e720b933ec(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 5, 16);
            return 12;
        }
        /*53c288e720b933ec273472250add48e4*/
    }
    function branch_54a2284eebb4a6fc(l, data, state, prod) {
        add_reduce(state, data, 2, 0);
        return 42;
        /*54a2284eebb4a6fc8019193b670397e6*/
    }
    function branch_559c77aa585df3f1(l, data, state, prod) {
        /*108:325 virtual-126:4:1|--lvl:0=>• : type primitive_declaration_group_169_116
        109:326 virtual-128:3:1|--lvl:0=>• : type
        110:327 virtual-117:1:1|--lvl:0=>•*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        if (!(l.current_byte == 58/*[:]*/) || l.END(data)) {
            /*
               110:327 virtual-117:1:1|--lvl:0=>•
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*110:327 virtual-117:1:1|--lvl:0=>•*/
            add_reduce(state, data, 1, 66);
            pushFN(data, $expression_statements_goto);
            return 37;
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else {
            /*
               108:325 virtual-126:4:1|--lvl:0=>• : type primitive_declaration_group_169_116
               109:326 virtual-128:3:1|--lvl:0=>• : type
               110:327 virtual-117:1:1|--lvl:0=>•
            */
            /*108:325 virtual-126:4:1|--lvl:0=>• : type primitive_declaration_group_169_116
            109:326 virtual-128:3:1|--lvl:0=>• : type*/
            let pk = l.copy();
            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, false);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (((((/*[uint]*/cmpr_set(pk, data, 82, 4, 4) ||/*[int]*/cmpr_set(pk, data, 83, 3, 3)) ||/*[flt]*/cmpr_set(pk, data, 124, 3, 3)) || dt_1e3f2d5b696b270e(pk, data)) || assert_ascii(pk, 0x0, 0x10, 0x80000000, 0x200240)) || pk.isUniID(data)) {
                /*
                   108:325 virtual-126:4:1|--lvl:0=>• : type primitive_declaration_group_169_116
                   109:326 virtual-128:3:1|--lvl:0=>• : type
                */
                /*108:325 virtual-126:4:1|--lvl:0=>• : type primitive_declaration_group_169_116
                109:326 virtual-128:3:1|--lvl:0=>• : type*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l, data, state);
                /*108:325 virtual-126:4:1|--lvl:0=>: • type primitive_declaration_group_169_116
                109:326 virtual-128:3:1|--lvl:0=>: • type*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                pushFN(data, branch_2016706f46c983fa);
                pushFN(data, $type);
                return 0;
            }
        }
        return -1;
        /*559c77aa585df3f1d69b7b08ade23a8b*/
    }
    function branch_581f79584ec0465c(l, data, state, prod) {
        /*114:331 virtual-92:3:1|--lvl:1=>• expression )
        115:332 virtual-326:8:1|--lvl:1=>• parameters ; expression ; loop_expression_HC_listbody6_112 ) expression
        116:333 virtual-327:7:1|--lvl:1=>• parameters ; ; loop_expression_HC_listbody6_112 ) expression
        117:334 virtual-328:7:1|--lvl:1=>• parameters ; expression ; ) expression
        118:335 virtual-329:6:1|--lvl:1=>• parameters ; ; ) expression
        119:336 virtual-330:6:1|--lvl:1=>• primitive_declaration in expression ) expression*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if (assert_ascii(l, 0x0, 0x10, 0x88000000, 0x0) || l.isUniID(data)) {
            /*
               114:331 virtual-92:3:1|--lvl:1=>• expression )
               115:332 virtual-326:8:1|--lvl:1=>• parameters ; expression ; loop_expression_HC_listbody6_112 ) expression
               116:333 virtual-327:7:1|--lvl:1=>• parameters ; ; loop_expression_HC_listbody6_112 ) expression
               117:334 virtual-328:7:1|--lvl:1=>• parameters ; expression ; ) expression
               118:335 virtual-329:6:1|--lvl:1=>• parameters ; ; ) expression
               119:336 virtual-330:6:1|--lvl:1=>• primitive_declaration in expression ) expression
            */
            /*44:129 identifier=>• tk:identifier_token
            50:143 modifier_list=>• [ modifier_list_HC_listbody1_120 ]*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if (l.current_byte == 91/*[[]*/) {
                /*
                   50:143 modifier_list=>• [ modifier_list_HC_listbody1_120 ]
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*50:143 modifier_list=>• [ modifier_list_HC_listbody1_120 ]*/
                pushFN(data, branch_999aaae91431ed93);
                pushFN(data, $modifier_list);
                return 0;
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   44:129 identifier=>• tk:identifier_token
                */
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*44:129 identifier=>• tk:identifier_token*/
                pushFN(data, branch_25c8b278264d80f2);
                pushFN(data, $identifier);
                return 0;
            }
        }
        return -1;
        /*581f79584ec0465c84f7ff44af279e96*/
    }
    function branch_586392cbdde1c8d7(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
            add_reduce(state, data, 4, 62);
            /*-------------INDIRECT-------------------*/
            pushFN(data, $expression_goto);
            return 26;
        }
        /*586392cbdde1c8d79d102869113d0383*/
    }
    function branch_58a4b098067f580f(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 93/*[]]*/) && consume(l, data, state)) {
            add_reduce(state, data, 4, 65);
            /*-------------INDIRECT-------------------*/
            pushFN(data, $expression_goto);
            return 37;
        }
        /*58a4b098067f580fc6fe20cbbe745eee*/
    }
    function branch_5acf30e2ab16c6bb(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*108:325 virtual-96:3:1|--lvl:0=>loop_expression_group_254_111 • expression*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        if ((((((((((((((tk_896177e00f155ef3(l, data) || tk_b838139d0d011665(l, data)) || tk_f70d460017f6375f(l, data)) ||/*[if]*/cmpr_set(l, data, 142, 2, 2)) ||/*[match]*/cmpr_set(l, data, 66, 5, 5)) || dt_bcea2102060eab13(l, data)) ||/*[true]*/cmpr_set(l, data, 94, 4, 4)) ||/*[null]*/cmpr_set(l, data, 34, 4, 4)) ||/*[<<--]*/cmpr_set(l, data, 19, 4, 4)) ||/*[break]*/cmpr_set(l, data, 71, 5, 5)) ||/*[return]*/cmpr_set(l, data, 76, 6, 6)) ||/*[continue]*/cmpr_set(l, data, 38, 8, 8)) ||/*[loop]*/cmpr_set(l, data, 62, 4, 4)) || assert_ascii(l, 0x0, 0x20000100, 0x8000000, 0x8000000)) || l.isSym(true, data)) {
            /*
               108:325 virtual-96:3:1|--lvl:0=>loop_expression_group_254_111 • expression
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
            /*108:325 virtual-96:3:1|--lvl:0=>loop_expression_group_254_111 • expression*/
            pushFN(data, branch_bd9df05ec0ff89c0);
            pushFN(data, $expression);
            return 0;
        }
        /*5acf30e2ab16c6bbf8cf079c0c0957ab*/
    }
    function branch_5b49665f15aed749(l, data, state, prod) {
        /*14:44 function_expression=>modifier_list fn : type • ( parameters ) { expression_statements }
        14:46 function_expression=>modifier_list fn : type • ( ) { expression_statements }
        14:47 function_expression=>modifier_list fn : type • ( parameters ) { }
        14:50 function_expression=>modifier_list fn : type • ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 40/*[(]*/) {
            /*
               14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
               14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
               14:47 function_expression=>modifier_list fn : type ( • parameters ) { }
               14:50 function_expression=>modifier_list fn : type ( • ) { }
            */
            consume(l, data, state);
            /*14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
            14:47 function_expression=>modifier_list fn : type ( • parameters ) { }
            14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
            14:50 function_expression=>modifier_list fn : type ( • ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (l.current_byte == 41/*[)]*/) {
                /*
                   14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
                   14:50 function_expression=>modifier_list fn : type ( • ) { }
                */
                /*14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
                14:50 function_expression=>modifier_list fn : type ( • ) { }*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l, data, state);
                /*14:46 function_expression=>modifier_list fn : type ( ) • { expression_statements }
                14:50 function_expression=>modifier_list fn : type ( ) • { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                if (l.current_byte == 123/*[{]*/) {
                    /*
                       14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }
                       14:50 function_expression=>modifier_list fn : type ( ) { • }
                    */
                    consume(l, data, state);
                    /*14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }
                    14:50 function_expression=>modifier_list fn : type ( ) { • }*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    if (l.current_byte == 125/*[}]*/) {
                        /*
                           14:50 function_expression=>modifier_list fn : type ( ) { • }
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert ⤋⤋⤋*/
                        /*14:50 function_expression=>modifier_list fn : type ( ) { • }*/
                        consume(l, data, state);
                        add_reduce(state, data, 8, 33);
                        return 14;
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    } else {
                        /*
                           14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                        /*14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }*/
                        pushFN(data, branch_19c074d3aef73be7);
                        pushFN(data, $expression_statements);
                        return 0;
                    }
                }
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
                   14:47 function_expression=>modifier_list fn : type ( • parameters ) { }
                */
                /*14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
                14:47 function_expression=>modifier_list fn : type ( • parameters ) { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                pushFN(data, branch_4ffb307f9a642c98);
                pushFN(data, $parameters);
                return 0;
            }
        }
        /*5b49665f15aed749326125c407d3e51b*/
    }
    function branch_5bc30bc1f1600300(l, data, state, prod) {
        /*120:337 virtual-117:1:1|--lvl:2=>•
        121:338 virtual-126:4:1|--lvl:2=>• : type primitive_declaration_group_169_116
        122:339 virtual-128:3:1|--lvl:2=>• : type*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        if (!(l.current_byte == 58/*[:]*/) || l.END(data)) {
            /*
               120:337 virtual-117:1:1|--lvl:2=>•
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*120:337 virtual-117:1:1|--lvl:2=>•*/
            pushFN(data, branch_f557979c122cc8c0);
            return 37;
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else {
            /*
               120:337 virtual-117:1:1|--lvl:2=>•
               121:338 virtual-126:4:1|--lvl:2=>• : type primitive_declaration_group_169_116
               122:339 virtual-128:3:1|--lvl:2=>• : type
            */
            /*121:338 virtual-126:4:1|--lvl:2=>• : type primitive_declaration_group_169_116
            122:339 virtual-128:3:1|--lvl:2=>• : type*/
            let pk = l.copy();
            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, false);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (((((/*[uint]*/cmpr_set(pk, data, 82, 4, 4) ||/*[int]*/cmpr_set(pk, data, 83, 3, 3)) ||/*[flt]*/cmpr_set(pk, data, 124, 3, 3)) || dt_1e3f2d5b696b270e(pk, data)) || assert_ascii(pk, 0x0, 0x10, 0x80000000, 0x200240)) || pk.isUniID(data)) {
                /*
                   121:338 virtual-126:4:1|--lvl:2=>• : type primitive_declaration_group_169_116
                   122:339 virtual-128:3:1|--lvl:2=>• : type
                */
                /*121:338 virtual-126:4:1|--lvl:2=>• : type primitive_declaration_group_169_116
                122:339 virtual-128:3:1|--lvl:2=>• : type*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l, data, state);
                /*121:338 virtual-126:4:1|--lvl:2=>: • type primitive_declaration_group_169_116
                122:339 virtual-128:3:1|--lvl:2=>: • type*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                pushFN(data, branch_830af79666527fcd);
                pushFN(data, $type);
                return 0;
            }
        }
        return -1;
        /*5bc30bc1f1600300fde8ee1ae4e79c84*/
    }
    function branch_5d9ae19a27aa9899(l, data, state, prod) {
        /*108:325 virtual-191:3:1|--lvl:0=>• operator_HC_listbody1_128 identifier_token_group_079_119
        109:326 virtual-194:2:1|--lvl:0=>• operator_HC_listbody1_128*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.isSym(true, data)) {
            /*
               108:325 virtual-191:3:1|--lvl:0=>• operator_HC_listbody1_128 identifier_token_group_079_119
               109:326 virtual-194:2:1|--lvl:0=>• operator_HC_listbody1_128
            */
            /*108:325 virtual-191:3:1|--lvl:0=>• operator_HC_listbody1_128 identifier_token_group_079_119
            109:326 virtual-194:2:1|--lvl:0=>• operator_HC_listbody1_128*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_f8424b2f1865a099);
            pushFN(data, $operator_HC_listbody1_128);
            return 0;
        }
        return -1;
        /*5d9ae19a27aa98997464108f4eb24a75*/
    }
    function branch_5dab52696e076a7b(l, data, state, prod) {
        /*48:137 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118 identifier_token_group_079_119
        48:139 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118
        48:140 identifier_token=>identifier_token_group_074_117 •
        48:138 identifier_token=>identifier_token_group_074_117 • identifier_token_group_079_119*/
        skip_db1786a8af54d666(l/*[ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if (l.isUniID(data)) {
            /*
               48:137 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118 identifier_token_group_079_119
               48:139 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118
               48:140 identifier_token=>identifier_token_group_074_117 •
            */
            /*48:137 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118 identifier_token_group_079_119
            48:139 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118
            48:140 identifier_token=>identifier_token_group_074_117 •*/
            let pk = l.copy();
            skip_db1786a8af54d666(pk.next(data)/*[ 71 ]*/, data, false);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            if (nocap_b2eb52235ee30b8a(pk)/*[ws] [nl]*/) {
                /*
                   48:137 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118 identifier_token_group_079_119
                   48:139 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118
                */
                /*48:137 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118 identifier_token_group_079_119
                48:139 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                pushFN(data, branch_1003a49dd535a3e0);
                pushFN(data, $identifier_token_HC_listbody1_118);
                return 0;
                /*⤋⤋⤋ peek-unresolved ⤋⤋⤋*/
            } else {
                /*
                   48:137 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118 identifier_token_group_079_119
                   48:139 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118
                   48:140 identifier_token=>identifier_token_group_074_117 •
                */
                /*-------------VPROD-------------------------*/
                /*48:137 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118 identifier_token_group_079_119
                48:139 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118*/
                pushFN(data, branch_244d69143320cb4d);
                return 0;
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/) {
            /*
               48:138 identifier_token=>identifier_token_group_074_117 • identifier_token_group_079_119
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*48:138 identifier_token=>identifier_token_group_074_117 • identifier_token_group_079_119*/
            pushFN(data, branch_92afc2d9878633ca);
            pushFN(data, $identifier_token_group_079_119);
            return 0;
            /*⤋⤋⤋ peek-unresolved ⤋⤋⤋*/
        } else if ((l.current_byte == 95/*[_]*/) || (l.current_byte == 36/*[$]*/)) {
            /*
               48:137 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118 identifier_token_group_079_119
               48:139 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118
               48:140 identifier_token=>identifier_token_group_074_117 •
            */
            /*-------------VPROD-------------------------*/
            /*48:137 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118 identifier_token_group_079_119
            48:139 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118*/
            pushFN(data, branch_3cc627c3e362113a);
            return 0;
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*
               48:140 identifier_token=>identifier_token_group_074_117 •
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*48:140 identifier_token=>identifier_token_group_074_117 •*/
            return 48;
        }
        /*5dab52696e076a7b61fa3a2ca7d7b2ff*/
    }
    function branch_5db3d6f6738c1965(l, data, state, prod) {
        /*11:24 class=>modifier_list cls identifier • class_group_113_103 { class_HC_listbody1_105 }
        11:27 class=>modifier_list cls identifier • class_group_113_103 { }
        11:26 class=>modifier_list cls identifier • { class_HC_listbody1_105 }
        11:30 class=>modifier_list cls identifier • { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if (l.current_byte == 123/*[{]*/) {
            /*
               11:26 class=>modifier_list cls identifier • { class_HC_listbody1_105 }
               11:30 class=>modifier_list cls identifier • { }
            */
            /*11:26 class=>modifier_list cls identifier • { class_HC_listbody1_105 }
            11:30 class=>modifier_list cls identifier • { }*/
            let pk = l.copy();
            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, false);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (pk.current_byte == 125/*[}]*/) {
                /*
                   11:30 class=>modifier_list cls identifier • { }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                /*11:30 class=>modifier_list cls identifier • { }*/
                consume(l, data, state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
                    add_reduce(state, data, 5, 13);
                    /*-------------INDIRECT-------------------*/
                    pushFN(data, $statements_goto);
                    return 4;
                }
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            } else {
                /*
                   11:26 class=>modifier_list cls identifier • { class_HC_listbody1_105 }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                /*11:26 class=>modifier_list cls identifier • { class_HC_listbody1_105 }*/
                consume(l, data, state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                pushFN(data, branch_faf51e1820faf277);
                pushFN(data, $class_HC_listbody1_105);
                return 0;
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               11:24 class=>modifier_list cls identifier • class_group_113_103 { class_HC_listbody1_105 }
               11:27 class=>modifier_list cls identifier • class_group_113_103 { }
            */
            /*11:24 class=>modifier_list cls identifier • class_group_113_103 { class_HC_listbody1_105 }
            11:27 class=>modifier_list cls identifier • class_group_113_103 { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_ebf24d528bf754f0);
            pushFN(data, $class_group_113_103);
            return 0;
        }
        /*5db3d6f6738c19650d12453cd2907a27*/
    }
    function branch_5e20402ff8e2ff2f(l, data, state, prod) {
        add_reduce(state, data, 3, 42);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $expression_statements_group_023_108_goto);
        return 18;
        /*5e20402ff8e2ff2f38510e6ba57a05ea*/
    }
    function branch_5e45dd2f3023abf3(l, data, state, prod) {
        /*25:80 binary_expression=>unary_expression operator •
        25:81 binary_expression=>unary_expression operator • expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        switch (sym_map_ad191553025cd3be(l, data)) {
            default:
            case 0:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                /*25:80 binary_expression=>unary_expression operator •*/
                add_reduce(state, data, 2, 45);
                /*-------------INDIRECT-------------------*/
                pushFN(data, branch_f557979c122cc8c0);
                return 21;
            case 1:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*25:81 binary_expression=>unary_expression operator • expression*/
                pushFN(data, branch_8c47f9c06dc32a73);
                pushFN(data, $expression);
                return 0;
            case 2:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                /*25:81 binary_expression=>unary_expression operator • expression*/
                pushFN(data, branch_8c47f9c06dc32a73);
                pushFN(data, $expression);
                return 0;
        }
        /*5e45dd2f3023abf3ed620908a11877db*/
    }
    function branch_5e5281a8817cd878(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 34/*["]*/) && consume(l, data, state)) {
            add_reduce(state, data, 3, 36);
            return 97;
        }
        /*5e5281a8817cd878c4f5d5ced795603c*/
    }
    function branch_5f3464810796e1f8(l, data, state, prod) {
        add_reduce(state, data, 7, 57);
        /*5f3464810796e1f8da0a3f5f0eac4967*/
    }
    function branch_602f1906c5ebdd6c(l, data, state, prod) {
        add_reduce(state, data, 7, 55);
        return 31;
        /*602f1906c5ebdd6c0c15f7a1e80c596d*/
    }
    function branch_6039570ac1ec94fc(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
            add_reduce(state, data, 4, 62);
            /*-------------INDIRECT-------------------*/
            pushFN(data, $expression_statements_group_023_108_goto);
            return 26;
        }
        /*6039570ac1ec94fc46155d61a31d2482*/
    }
    function branch_603d19d840e04474(l, data, state, prod) {
        return 28;
        /*603d19d840e044740538584f7ede8eeb*/
    }
    function branch_610cf5def71ef4b0(l, data, state, prod) {
        /*14:44 function_expression=>modifier_list fn : type • ( parameters ) { expression_statements }
        14:46 function_expression=>modifier_list fn : type • ( ) { expression_statements }
        14:47 function_expression=>modifier_list fn : type • ( parameters ) { }
        14:50 function_expression=>modifier_list fn : type • ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 40/*[(]*/) {
            /*
               14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
               14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
               14:47 function_expression=>modifier_list fn : type ( • parameters ) { }
               14:50 function_expression=>modifier_list fn : type ( • ) { }
            */
            consume(l, data, state);
            /*14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
            14:47 function_expression=>modifier_list fn : type ( • parameters ) { }
            14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
            14:50 function_expression=>modifier_list fn : type ( • ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (l.current_byte == 41/*[)]*/) {
                /*
                   14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
                   14:50 function_expression=>modifier_list fn : type ( • ) { }
                */
                /*14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
                14:50 function_expression=>modifier_list fn : type ( • ) { }*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l, data, state);
                /*14:46 function_expression=>modifier_list fn : type ( ) • { expression_statements }
                14:50 function_expression=>modifier_list fn : type ( ) • { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                if (l.current_byte == 123/*[{]*/) {
                    /*
                       14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }
                       14:50 function_expression=>modifier_list fn : type ( ) { • }
                    */
                    consume(l, data, state);
                    /*14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }
                    14:50 function_expression=>modifier_list fn : type ( ) { • }*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    if (l.current_byte == 125/*[}]*/) {
                        /*
                           14:50 function_expression=>modifier_list fn : type ( ) { • }
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert ⤋⤋⤋*/
                        /*14:50 function_expression=>modifier_list fn : type ( ) { • }*/
                        consume(l, data, state);
                        add_reduce(state, data, 8, 33);
                        /*-------------INDIRECT-------------------*/
                        pushFN(data, $expression_statements_goto);
                        return 26;
                    }
                }
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
                   14:47 function_expression=>modifier_list fn : type ( • parameters ) { }
                */
                /*14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
                14:47 function_expression=>modifier_list fn : type ( • parameters ) { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                pushFN(data, branch_0a729fd49cbaf9d2);
                pushFN(data, $parameters);
                return 0;
            }
        }
        /*610cf5def71ef4b0c6a5aa0eaf61d120*/
    }
    function branch_626cdf3f87255c10(l, data, state, prod) {
        add_reduce(state, data, 2, 86);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $string_HC_listbody1_127_goto);
        return 59;
        /*626cdf3f87255c1069433680cc511812*/
    }
    function branch_62724c152cb74d3f(l, data, state, prod) {
        /*11:24 class=>modifier_list • cls identifier class_group_113_103 { class_HC_listbody1_105 }
        11:26 class=>modifier_list • cls identifier { class_HC_listbody1_105 }
        11:27 class=>modifier_list • cls identifier class_group_113_103 { }
        11:30 class=>modifier_list • cls identifier { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (/*[cls]*/cmpr_set(l, data, 121, 3, 3)) {
            /*
               11:24 class=>modifier_list cls • identifier class_group_113_103 { class_HC_listbody1_105 }
               11:26 class=>modifier_list cls • identifier { class_HC_listbody1_105 }
               11:27 class=>modifier_list cls • identifier class_group_113_103 { }
               11:30 class=>modifier_list cls • identifier { }
            */
            consume(l, data, state);
            /*11:24 class=>modifier_list cls • identifier class_group_113_103 { class_HC_listbody1_105 }
            11:26 class=>modifier_list cls • identifier { class_HC_listbody1_105 }
            11:27 class=>modifier_list cls • identifier class_group_113_103 { }
            11:30 class=>modifier_list cls • identifier { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_165bdecb6736c7db);
            pushFN(data, $identifier);
            return 0;
        }
        /*62724c152cb74d3fe6c04b88c4cc2973*/
    }
    function branch_6295ce119e5b66ef(l, data, state, prod) {
        add_reduce(state, data, 1, 85);
        return 56;
        /*6295ce119e5b66ef15680bfc0d751fe1*/
    }
    function branch_638895d2bbd14b91(l, data, state, prod) {
        /*108:325 virtual-137:3:1|--lvl:0=>identifier_token_HC_listbody1_118 • identifier_token_group_079_119
        109:326 virtual-139:2:1|--lvl:0=>identifier_token_HC_listbody1_118 •*/
        skip_db1786a8af54d666(l/*[ 71 ]*/, data, true);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/) {
            /*
               108:325 virtual-137:3:1|--lvl:0=>identifier_token_HC_listbody1_118 • identifier_token_group_079_119
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*108:325 virtual-137:3:1|--lvl:0=>identifier_token_HC_listbody1_118 • identifier_token_group_079_119*/
            pushFN(data, branch_398d9230ecf58463);
            pushFN(data, $identifier_token_group_079_119);
            return 0;
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*
               109:326 virtual-139:2:1|--lvl:0=>identifier_token_HC_listbody1_118 •
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*109:326 virtual-139:2:1|--lvl:0=>identifier_token_HC_listbody1_118 •*/
            add_reduce(state, data, 2, 0);
            return 48;
        }
        /*638895d2bbd14b91a75411e97680c199*/
    }
    function branch_639299995443b2b6(l, data, state, prod) {
        /*31:99 loop_expression=>loop ( ; expression • ; loop_expression_HC_listbody6_112 ) expression
        31:103 loop_expression=>loop ( ; expression • ; ) expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 59/*[;]*/) {
            /*
               31:99 loop_expression=>loop ( ; expression ; • loop_expression_HC_listbody6_112 ) expression
               31:103 loop_expression=>loop ( ; expression ; • ) expression
            */
            consume(l, data, state);
            /*31:99 loop_expression=>loop ( ; expression ; • loop_expression_HC_listbody6_112 ) expression
            31:103 loop_expression=>loop ( ; expression ; • ) expression*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if (l.current_byte == 41/*[)]*/) {
                /*
                   31:103 loop_expression=>loop ( ; expression ; • ) expression
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*31:103 loop_expression=>loop ( ; expression ; • ) expression*/
                consume(l, data, state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                pushFN(data, branch_463a609a91f9c965);
                pushFN(data, $expression);
                return 0;
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   31:99 loop_expression=>loop ( ; expression ; • loop_expression_HC_listbody6_112 ) expression
                */
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*31:99 loop_expression=>loop ( ; expression ; • loop_expression_HC_listbody6_112 ) expression*/
                pushFN(data, branch_f1ed5c6c9d81ab5d);
                pushFN(data, $loop_expression_HC_listbody6_112);
                return 0;
            }
        }
        /*639299995443b2b6f3f36a6f583bf474*/
    }
    function branch_63d29c07dd268054(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 39/*[']*/) && consume(l, data, state)) {
            add_reduce(state, data, 3, 88);
            return 60;
        }
        /*63d29c07dd268054e042ccc4eab1a59e*/
    }
    function branch_64d9dc8e979119ea(l, data, state, prod) {
        /*43:125 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_169_116
        43:127 primitive_declaration=>modifier_list identifier : type •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 61/*[=]*/) {
            /*
               43:125 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_169_116
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*43:125 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_169_116*/
            pushFN(data, branch_209d29fe94151c58);
            pushFN(data, $primitive_declaration_group_169_116);
            return 0;
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*
               43:127 primitive_declaration=>modifier_list identifier : type •
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*43:127 primitive_declaration=>modifier_list identifier : type •*/
            add_reduce(state, data, 4, 74);
            add_reduce(state, data, 1, 3);
            /*-------------INDIRECT-------------------*/
            return 20;
        }
        /*64d9dc8e979119eab33b50400125bd5d*/
    }
    function branch_65667afc550320cc(l, data, state, prod) {
        /*12:32 struct=>modifier_list str identifier • { parameters }
        12:34 struct=>modifier_list str identifier • { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 123/*[{]*/) {
            /*
               12:32 struct=>modifier_list str identifier { • parameters }
               12:34 struct=>modifier_list str identifier { • }
            */
            consume(l, data, state);
            /*12:32 struct=>modifier_list str identifier { • parameters }
            12:34 struct=>modifier_list str identifier { • }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if (l.current_byte == 125/*[}]*/) {
                /*
                   12:34 struct=>modifier_list str identifier { • }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*12:34 struct=>modifier_list str identifier { • }*/
                consume(l, data, state);
                add_reduce(state, data, 5, 17);
                /*-------------INDIRECT-------------------*/
                pushFN(data, $statements_goto);
                return 4;
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   12:32 struct=>modifier_list str identifier { • parameters }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*12:32 struct=>modifier_list str identifier { • parameters }*/
                pushFN(data, branch_2e70fd316ce2baa3);
                pushFN(data, $parameters);
                return 0;
            }
        }
        /*65667afc550320cc7bb66b38be339656*/
    }
    function branch_67765c2136ebd189(l, data, state, prod) {
        /*13:37 function=>fn identifier : type ( parameters • ) { expression_statements }
        13:41 function=>fn identifier : type ( parameters • ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 41/*[)]*/) {
            /*
               13:37 function=>fn identifier : type ( parameters ) • { expression_statements }
               13:41 function=>fn identifier : type ( parameters ) • { }
            */
            consume(l, data, state);
            /*13:37 function=>fn identifier : type ( parameters ) • { expression_statements }
            13:41 function=>fn identifier : type ( parameters ) • { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if (l.current_byte == 123/*[{]*/) {
                /*
                   13:37 function=>fn identifier : type ( parameters ) { • expression_statements }
                   13:41 function=>fn identifier : type ( parameters ) { • }
                */
                consume(l, data, state);
                /*13:37 function=>fn identifier : type ( parameters ) { • expression_statements }
                13:41 function=>fn identifier : type ( parameters ) { • }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if (l.current_byte == 125/*[}]*/) {
                    /*
                       13:41 function=>fn identifier : type ( parameters ) { • }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    /*13:41 function=>fn identifier : type ( parameters ) { • }*/
                    consume(l, data, state);
                    add_reduce(state, data, 9, 24);
                    return 13;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else {
                    /*
                       13:37 function=>fn identifier : type ( parameters ) { • expression_statements }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    /*13:37 function=>fn identifier : type ( parameters ) { • expression_statements }*/
                    pushFN(data, branch_03d55556b8274032);
                    pushFN(data, $expression_statements);
                    return 0;
                }
            }
        }
        /*67765c2136ebd189184290053124d17f*/
    }
    function branch_67f89e583d60ca28(l, data, state, prod) {
        /*11:25 class=>cls identifier • class_group_113_103 { class_HC_listbody1_105 }
        11:29 class=>cls identifier • class_group_113_103 { }
        11:28 class=>cls identifier • { class_HC_listbody1_105 }
        11:31 class=>cls identifier • { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if (l.current_byte == 123/*[{]*/) {
            /*
               11:28 class=>cls identifier • { class_HC_listbody1_105 }
               11:31 class=>cls identifier • { }
            */
            /*11:28 class=>cls identifier • { class_HC_listbody1_105 }
            11:31 class=>cls identifier • { }*/
            let pk = l.copy();
            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, false);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (pk.current_byte == 125/*[}]*/) {
                /*
                   11:31 class=>cls identifier • { }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                /*11:31 class=>cls identifier • { }*/
                consume(l, data, state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
                    add_reduce(state, data, 4, 14);
                    return 11;
                }
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            } else {
                /*
                   11:28 class=>cls identifier • { class_HC_listbody1_105 }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                /*11:28 class=>cls identifier • { class_HC_listbody1_105 }*/
                consume(l, data, state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                pushFN(data, branch_6ab8c6d3fc6a956d);
                pushFN(data, $class_HC_listbody1_105);
                return 0;
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               11:25 class=>cls identifier • class_group_113_103 { class_HC_listbody1_105 }
               11:29 class=>cls identifier • class_group_113_103 { }
            */
            /*11:25 class=>cls identifier • class_group_113_103 { class_HC_listbody1_105 }
            11:29 class=>cls identifier • class_group_113_103 { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_432ec7452c86add4);
            pushFN(data, $class_group_113_103);
            return 0;
        }
        /*67f89e583d60ca287bbcdc8a70ddaeb4*/
    }
    function branch_6979de51244c9f74(l, data, state, prod) {
        /*43:126 primitive_declaration=>identifier : type • primitive_declaration_group_169_116
        43:128 primitive_declaration=>identifier : type •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 61/*[=]*/) {
            /*
               43:126 primitive_declaration=>identifier : type • primitive_declaration_group_169_116
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*43:126 primitive_declaration=>identifier : type • primitive_declaration_group_169_116*/
            pushFN(data, branch_dc58d4d8db41e78b);
            pushFN(data, $primitive_declaration_group_169_116);
            return 0;
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*
               43:128 primitive_declaration=>identifier : type •
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*43:128 primitive_declaration=>identifier : type •*/
            add_reduce(state, data, 3, 75);
            add_reduce(state, data, 1, 3);
            /*-------------INDIRECT-------------------*/
            return 20;
        }
        /*6979de51244c9f7420ba7789494e58df*/
    }
    function branch_6a9db12bab3062d9(l, data, state, prod) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $def$string_token_HC_listbody3_111_goto);
        return 98;
        /*6a9db12bab3062d979ce648500daaa02*/
    }
    function branch_6ab8c6d3fc6a956d(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 5, 11);
            return 11;
        }
        /*6ab8c6d3fc6a956dd61dc38817fcb7e3*/
    }
    function branch_6b46cc2cdf8dc740(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 9, 29);
            /*-------------INDIRECT-------------------*/
            pushFN(data, $expression_statements_group_023_108_goto);
            return 26;
        }
        /*6b46cc2cdf8dc74098270048bdcf2efd*/
    }
    function branch_6daab6971c75715b(l, data, state, prod) {
        pushFN(data, $expression_statements_group_023_108_goto);
        return 50;
        /*6daab6971c75715ba440511f225a2e62*/
    }
    function branch_6e97f8b54b05c9cb(l, data, state, prod) {
        /*43:126 primitive_declaration=>identifier : type • primitive_declaration_group_169_116
        43:128 primitive_declaration=>identifier : type •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 61/*[=]*/) {
            /*
               43:126 primitive_declaration=>identifier : type • primitive_declaration_group_169_116
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*43:126 primitive_declaration=>identifier : type • primitive_declaration_group_169_116*/
            pushFN(data, branch_dca75710b3e3c7ef);
            pushFN(data, $primitive_declaration_group_169_116);
            return 0;
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*
               43:128 primitive_declaration=>identifier : type •
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*43:128 primitive_declaration=>identifier : type •*/
            add_reduce(state, data, 3, 75);
        }
        /*6e97f8b54b05c9cb7e47c4090f2ec091*/
    }
    function branch_6ea9c551086a9b7b(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 11, 19);
            /*-------------INDIRECT-------------------*/
            pushFN(data, $statements_goto);
            return 4;
        }
        /*6ea9c551086a9b7be2bf0b834c6c3122*/
    }
    function branch_6ec33e9cdb4649e2(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 93/*[]]*/) && consume(l, data, state)) {
            add_reduce(state, data, 4, 65);
            /*-------------INDIRECT-------------------*/
            pushFN(data, $member_expression_goto);
            return 37;
        }
        /*6ec33e9cdb4649e2ce1aa7f0ca732cc5*/
    }
    function branch_71318b3fdb03d356(l, data, state, prod) {
        /*25:80 binary_expression=>unary_expression operator •
        25:81 binary_expression=>unary_expression operator • expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        switch (sym_map_ad191553025cd3be(l, data)) {
            default:
            case 0:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                /*25:80 binary_expression=>unary_expression operator •*/
                add_reduce(state, data, 2, 45);
                add_reduce(state, data, 1, 3);
                /*-------------INDIRECT-------------------*/
                return 20;
            case 1:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*25:81 binary_expression=>unary_expression operator • expression*/
                pushFN(data, branch_dd33ff05dfe6a2e3);
                pushFN(data, $expression);
                return 0;
            case 2:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                /*25:81 binary_expression=>unary_expression operator • expression*/
                pushFN(data, branch_dd33ff05dfe6a2e3);
                pushFN(data, $expression);
                return 0;
        }
        /*71318b3fdb03d3567cc56adb30dd6aa7*/
    }
    function branch_71e4ab2f932282c9(l, data, state, prod) {
        add_reduce(state, data, 5, 72);
        /*-------------INDIRECT-------------------*/
        pushFN(data, branch_f557979c122cc8c0);
        return 43;
        /*71e4ab2f932282c9f5272d485c945548*/
    }
    function branch_71ffa1e91e4c72ff(l, data, state, prod) {
        add_reduce(state, data, 2, 2);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $class_HC_listbody1_105_goto);
        return 10;
        /*71ffa1e91e4c72ff2bb5872f04bd238f*/
    }
    function branch_732068abaedf0507(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
            add_reduce(state, data, 4, 62);
            /*-------------INDIRECT-------------------*/
            pushFN(data, $expression_statements_goto);
            return 26;
        }
        /*732068abaedf05071a0ae00d3ddcf2e9*/
    }
    function branch_73836dabb810b0e0(l, data, state, prod) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $comment_HC_listbody1_131_goto);
        return 68;
        /*73836dabb810b0e0b1fdb471deb17be2*/
    }
    function branch_73b8ea077c729a29(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 10, 21);
            /*-------------INDIRECT-------------------*/
            pushFN(data, $class_group_016_104_goto);
            return 9;
        }
        /*73b8ea077c729a29f4ef5c4cac28898c*/
    }
    function branch_75a35c38bf32d743(l, data, state, prod) {
        /*43:125 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_169_116
        43:127 primitive_declaration=>modifier_list identifier : type •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 61/*[=]*/) {
            /*
               43:125 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_169_116
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*43:125 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_169_116*/
            pushFN(data, branch_71e4ab2f932282c9);
            pushFN(data, $primitive_declaration_group_169_116);
            return 0;
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*
               43:127 primitive_declaration=>modifier_list identifier : type •
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*43:127 primitive_declaration=>modifier_list identifier : type •*/
            add_reduce(state, data, 4, 74);
            /*-------------INDIRECT-------------------*/
            pushFN(data, branch_f557979c122cc8c0);
            return 43;
        }
        /*75a35c38bf32d743042d643644fd5cd5*/
    }
    function branch_760893d357a620de(l, data, state, prod) {
        /*12:32 struct=>modifier_list str identifier • { parameters }
        12:34 struct=>modifier_list str identifier • { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 123/*[{]*/) {
            /*
               12:32 struct=>modifier_list str identifier { • parameters }
               12:34 struct=>modifier_list str identifier { • }
            */
            consume(l, data, state);
            /*12:32 struct=>modifier_list str identifier { • parameters }
            12:34 struct=>modifier_list str identifier { • }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if (l.current_byte == 125/*[}]*/) {
                /*
                   12:34 struct=>modifier_list str identifier { • }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*12:34 struct=>modifier_list str identifier { • }*/
                consume(l, data, state);
                add_reduce(state, data, 5, 17);
                return 12;
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   12:32 struct=>modifier_list str identifier { • parameters }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*12:32 struct=>modifier_list str identifier { • parameters }*/
                pushFN(data, branch_4b0edc44e83efea2);
                pushFN(data, $parameters);
                return 0;
            }
        }
        /*760893d357a620de058a1326754a59f4*/
    }
    function branch_780374fd5be39be5(l, data, state, prod) {
        add_reduce(state, data, 3, 42);
        return 22;
        /*780374fd5be39be542fac992274043f7*/
    }
    function branch_78aa7468cfc4789b(l, data, state, prod) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $match_expression_HC_listbody3_113_goto);
        return 32;
        /*78aa7468cfc4789b495e29c5a67a12f7*/
    }
    function branch_7a4ba2e124eec285(l, data, state, prod) {
        add_reduce(state, data, 1, 80);
        return 56;
        /*7a4ba2e124eec2851b1c1ef7f986c3e1*/
    }
    function branch_7a8be2c54a4d26e4(l, data, state, prod) {
        pushFN(data, $class_group_016_104_goto);
        return 50;
        /*7a8be2c54a4d26e4693c3a0a89e60743*/
    }
    function branch_7bd41de4c3b97b3a(l, data, state, prod) {
        return 62;
        /*7bd41de4c3b97b3a1e5aaf8dd0db1c0b*/
    }
    function branch_7c5044a70fbaa6bb(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        pushFN(data, branch_413721b69b4b8263);
        pushFN(data, $unary_value);
        return 0;
        /*7c5044a70fbaa6bbecf377c5310985d6*/
    }
    function branch_7cdc3f87dbdf1f7f(l, data, state, prod) {
        add_reduce(state, data, 3, 64);
        /*-------------INDIRECT-------------------*/
        pushFN(data, branch_f557979c122cc8c0);
        return 37;
        /*7cdc3f87dbdf1f7f7ce6639273fe7440*/
    }
    function branch_7d515c25abc23648(l, data, state, prod) {
        add_reduce(state, data, 3, 35);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $match_expression_HC_listbody3_113_goto);
        return 32;
        /*7d515c25abc236484212fc4fb7d1e5fe*/
    }
    function branch_7e5b06e2e73c7ad3(l, data, state, prod) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $class_HC_listbody1_105_goto);
        return 10;
        /*7e5b06e2e73c7ad3bb8d1f5d414026c0*/
    }
    function branch_7e6e473a12f5754c(l, data, state, prod) {
        /*110:327 virtual-137:3:1|--lvl:0=>identifier_token_HC_listbody1_118 • identifier_token_group_079_119
        111:328 virtual-139:2:1|--lvl:0=>identifier_token_HC_listbody1_118 •*/
        skip_db1786a8af54d666(l/*[ 71 ]*/, data, true);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/) {
            /*
               110:327 virtual-137:3:1|--lvl:0=>identifier_token_HC_listbody1_118 • identifier_token_group_079_119
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*110:327 virtual-137:3:1|--lvl:0=>identifier_token_HC_listbody1_118 • identifier_token_group_079_119*/
            pushFN(data, branch_398d9230ecf58463);
            pushFN(data, $identifier_token_group_079_119);
            return 0;
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*
               111:328 virtual-139:2:1|--lvl:0=>identifier_token_HC_listbody1_118 •
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*111:328 virtual-139:2:1|--lvl:0=>identifier_token_HC_listbody1_118 •*/
            add_reduce(state, data, 2, 0);
            return 48;
        }
        /*7e6e473a12f5754cf21ffb44e238d598*/
    }
    function branch_7f0a7c317efe91d9(l, data, state, prod) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $module_HC_listbody1_101_goto);
        return 2;
        /*7f0a7c317efe91d93f70ee062c75a1c0*/
    }
    function branch_7f4b50af82489706(l, data, state, prod) {
        add_reduce(state, data, 2, 86);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $def$string_value_goto);
        return 103;
        /*7f4b50af824897064f827faf30a42b5f*/
    }
    function branch_7fc4c7ff3183bbc8(l, data, state, prod) {
        add_reduce(state, data, 4, 73);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $expression_statements_group_023_108_goto);
        return 18;
        /*7fc4c7ff3183bbc853adda02b56eb7f3*/
    }
    function branch_8059258321b9902f(l, data, state, prod) {
        /*13:37 function=>fn identifier • : type ( parameters ) { expression_statements }
        13:40 function=>fn identifier • : type ( ) { expression_statements }
        13:41 function=>fn identifier • : type ( parameters ) { }
        13:43 function=>fn identifier • : type ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 58/*[:]*/) {
            /*
               13:37 function=>fn identifier : • type ( parameters ) { expression_statements }
               13:40 function=>fn identifier : • type ( ) { expression_statements }
               13:41 function=>fn identifier : • type ( parameters ) { }
               13:43 function=>fn identifier : • type ( ) { }
            */
            consume(l, data, state);
            /*13:37 function=>fn identifier : • type ( parameters ) { expression_statements }
            13:40 function=>fn identifier : • type ( ) { expression_statements }
            13:41 function=>fn identifier : • type ( parameters ) { }
            13:43 function=>fn identifier : • type ( ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_3b323cb13dff0150);
            pushFN(data, $type);
            return 0;
        }
        /*8059258321b9902ffa71e2ea3c9f79b4*/
    }
    function branch_816dccba9447c3cd(l, data, state, prod) {
        /*13:36 function=>modifier_list fn identifier : type ( parameters • ) { expression_statements }
        13:39 function=>modifier_list fn identifier : type ( parameters • ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 41/*[)]*/) {
            /*
               13:36 function=>modifier_list fn identifier : type ( parameters ) • { expression_statements }
               13:39 function=>modifier_list fn identifier : type ( parameters ) • { }
            */
            consume(l, data, state);
            /*13:36 function=>modifier_list fn identifier : type ( parameters ) • { expression_statements }
            13:39 function=>modifier_list fn identifier : type ( parameters ) • { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if (l.current_byte == 123/*[{]*/) {
                /*
                   13:36 function=>modifier_list fn identifier : type ( parameters ) { • expression_statements }
                   13:39 function=>modifier_list fn identifier : type ( parameters ) { • }
                */
                consume(l, data, state);
                /*13:36 function=>modifier_list fn identifier : type ( parameters ) { • expression_statements }
                13:39 function=>modifier_list fn identifier : type ( parameters ) { • }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if (l.current_byte == 125/*[}]*/) {
                    /*
                       13:39 function=>modifier_list fn identifier : type ( parameters ) { • }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    /*13:39 function=>modifier_list fn identifier : type ( parameters ) { • }*/
                    consume(l, data, state);
                    add_reduce(state, data, 10, 22);
                    return 13;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else {
                    /*
                       13:36 function=>modifier_list fn identifier : type ( parameters ) { • expression_statements }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    /*13:36 function=>modifier_list fn identifier : type ( parameters ) { • expression_statements }*/
                    pushFN(data, branch_d62b5b8cbd7267e5);
                    pushFN(data, $expression_statements);
                    return 0;
                }
            }
        }
        /*816dccba9447c3cd1ee4d47b72d773f8*/
    }
    function branch_818d14bff9153d48(l, data, state, prod) {
        add_reduce(state, data, 9, 50);
        /*818d14bff9153d480ff0f43e3f5ee895*/
    }
    function branch_82609636a97ae3c0(l, data, state, prod) {
        /*25:80 binary_expression=>unary_expression • operator
        25:81 binary_expression=>unary_expression • operator expression
        25:82 binary_expression=>unary_expression •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        if (!((l.current_byte == 61/*[=]*/) || l.isSym(true, data)) || (/*[<<--]*/cmpr_set(l, data, 19, 4, 4) || assert_ascii(l, 0x0, 0xc001210, 0xa8000000, 0x20000000))) {
            /*
               25:82 binary_expression=>unary_expression •
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*25:82 binary_expression=>unary_expression •*/
            return 25;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               25:80 binary_expression=>unary_expression • operator
               25:81 binary_expression=>unary_expression • operator expression
            */
            /*25:80 binary_expression=>unary_expression • operator
            25:81 binary_expression=>unary_expression • operator expression*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_1564fea44ed58d5a);
            pushFN(data, $operator);
            return 0;
        }
        /*82609636a97ae3c058b9e5c4af34612b*/
    }
    function branch_82d768f65ad7b061(l, data, state, prod) {
        /*13:36 function=>modifier_list fn identifier • : type ( parameters ) { expression_statements }
        13:38 function=>modifier_list fn identifier • : type ( ) { expression_statements }
        13:39 function=>modifier_list fn identifier • : type ( parameters ) { }
        13:42 function=>modifier_list fn identifier • : type ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 58/*[:]*/) {
            /*
               13:36 function=>modifier_list fn identifier : • type ( parameters ) { expression_statements }
               13:38 function=>modifier_list fn identifier : • type ( ) { expression_statements }
               13:39 function=>modifier_list fn identifier : • type ( parameters ) { }
               13:42 function=>modifier_list fn identifier : • type ( ) { }
            */
            consume(l, data, state);
            /*13:36 function=>modifier_list fn identifier : • type ( parameters ) { expression_statements }
            13:38 function=>modifier_list fn identifier : • type ( ) { expression_statements }
            13:39 function=>modifier_list fn identifier : • type ( parameters ) { }
            13:42 function=>modifier_list fn identifier : • type ( ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_fbb0ad0f021e53c6);
            pushFN(data, $type);
            return 0;
        }
        /*82d768f65ad7b061cee4f81ddc8dc06c*/
    }
    function branch_830af79666527fcd(l, data, state, prod) {
        /*121:338 virtual-126:4:1|--lvl:2=>: type • primitive_declaration_group_169_116
        122:339 virtual-128:3:1|--lvl:2=>: type •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        if (!(l.current_byte == 61/*[=]*/) || l.END(data)) {
            /*
               122:339 virtual-128:3:1|--lvl:2=>: type •
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*122:339 virtual-128:3:1|--lvl:2=>: type •*/
            pushFN(data, branch_f557979c122cc8c0);
            return 43;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               121:338 virtual-126:4:1|--lvl:2=>: type • primitive_declaration_group_169_116
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*121:338 virtual-126:4:1|--lvl:2=>: type • primitive_declaration_group_169_116*/
            pushFN(data, branch_3205c0ded576131e);
            pushFN(data, $primitive_declaration_group_169_116);
            return 0;
        }
        /*830af79666527fcde06c065a21eaad6c*/
    }
    function branch_85479b24ccc90691(l, data, state, prod) {
        add_reduce(state, data, 3, 35);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $loop_expression_HC_listbody6_112_goto);
        return 30;
        /*85479b24ccc906918bd44c94fd66a581*/
    }
    function branch_859a73d5c409fc4a(l, data, state, prod) {
        add_reduce(state, data, 2, 2);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $def$hex_token_HC_listbody1_105_goto);
        return 88;
        /*859a73d5c409fc4ad3ea80ad7fdbb05b*/
    }
    function branch_86602c22e8a35896(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 10, 27);
            /*-------------INDIRECT-------------------*/
            pushFN(data, branch_f557979c122cc8c0);
            return 26;
        }
        /*86602c22e8a358960497f1da3ef15a61*/
    }
    function branch_868b83cdab6a1ed6(l, data, state, prod) {
        add_reduce(state, data, 3, 35);
        /*-------------INDIRECT-------------------*/
        pushFN(data, branch_f557979c122cc8c0);
        return 16;
        /*868b83cdab6a1ed6c737d9e21c7154bd*/
    }
    function branch_86b9d47a2c99c413(l, data, state, prod) {
        add_reduce(state, data, 3, 35);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $def$defaultproductions_goto);
        return 75;
        /*86b9d47a2c99c413ae2247abb9d9c2b1*/
    }
    function branch_88a0b5c0814835ce(l, data, state, prod) {
        add_reduce(state, data, 4, 73);
        add_reduce(state, data, 1, 3);
        pushFN(data, $expression_statements_goto);
        return 20;
        /*88a0b5c0814835ced12c2661b5543199*/
    }
    function branch_8b75a3e6e7885b90(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 9, 28);
            return 14;
        }
        /*8b75a3e6e7885b90dadd4c57bf17c8fa*/
    }
    function branch_8bf7f3e4c05b5cac(l, data, state, prod) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $def$defaultproductions_goto);
        return 75;
        /*8bf7f3e4c05b5cac0b06c5055d7fd92e*/
    }
    function branch_8c1124384beb40f7(l, data, state, prod) {
        /*43:125 primitive_declaration=>modifier_list identifier • : type primitive_declaration_group_169_116
        43:127 primitive_declaration=>modifier_list identifier • : type*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 58/*[:]*/) {
            /*
               43:125 primitive_declaration=>modifier_list identifier : • type primitive_declaration_group_169_116
               43:127 primitive_declaration=>modifier_list identifier : • type
            */
            consume(l, data, state);
            /*43:125 primitive_declaration=>modifier_list identifier : • type primitive_declaration_group_169_116
            43:127 primitive_declaration=>modifier_list identifier : • type*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_64d9dc8e979119ea);
            pushFN(data, $type);
            return 0;
        }
        /*8c1124384beb40f7be9022ef1508c4c4*/
    }
    function branch_8c24c0c94360cb7f(l, data, state, prod) {
        /*13:36 function=>modifier_list fn identifier • : type ( parameters ) { expression_statements }
        13:38 function=>modifier_list fn identifier • : type ( ) { expression_statements }
        13:39 function=>modifier_list fn identifier • : type ( parameters ) { }
        13:42 function=>modifier_list fn identifier • : type ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 58/*[:]*/) {
            /*
               13:36 function=>modifier_list fn identifier : • type ( parameters ) { expression_statements }
               13:38 function=>modifier_list fn identifier : • type ( ) { expression_statements }
               13:39 function=>modifier_list fn identifier : • type ( parameters ) { }
               13:42 function=>modifier_list fn identifier : • type ( ) { }
            */
            consume(l, data, state);
            /*13:36 function=>modifier_list fn identifier : • type ( parameters ) { expression_statements }
            13:38 function=>modifier_list fn identifier : • type ( ) { expression_statements }
            13:39 function=>modifier_list fn identifier : • type ( parameters ) { }
            13:42 function=>modifier_list fn identifier : • type ( ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_0635284bed9fda5f);
            pushFN(data, $type);
            return 0;
        }
        /*8c24c0c94360cb7f8385ad512066c6cc*/
    }
    function branch_8c47f9c06dc32a73(l, data, state, prod) {
        add_reduce(state, data, 3, 46);
        /*-------------INDIRECT-------------------*/
        pushFN(data, branch_f557979c122cc8c0);
        return 21;
        /*8c47f9c06dc32a731e5937f6bc6d6aef*/
    }
    function branch_8c57d1885b959d2a(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 10, 27);
            /*-------------INDIRECT-------------------*/
            pushFN(data, $expression_statements_group_023_108_goto);
            return 26;
        }
        /*8c57d1885b959d2ab3a777ec50f34433*/
    }
    function branch_8cc0b8a3fa90694a(l, data, state, prod) {
        /*115:332 virtual-326:8:1|--lvl:1=>parameters ; expression • ; loop_expression_HC_listbody6_112 ) expression
        117:334 virtual-328:7:1|--lvl:1=>parameters ; expression • ; ) expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 59/*[;]*/) {
            /*
               115:332 virtual-326:8:1|--lvl:1=>parameters ; expression ; • loop_expression_HC_listbody6_112 ) expression
               117:334 virtual-328:7:1|--lvl:1=>parameters ; expression ; • ) expression
            */
            consume(l, data, state);
            /*115:332 virtual-326:8:1|--lvl:1=>parameters ; expression ; • loop_expression_HC_listbody6_112 ) expression
            117:334 virtual-328:7:1|--lvl:1=>parameters ; expression ; • ) expression*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if (l.current_byte == 41/*[)]*/) {
                /*
                   117:334 virtual-328:7:1|--lvl:1=>parameters ; expression ; • ) expression
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*117:334 virtual-328:7:1|--lvl:1=>parameters ; expression ; • ) expression*/
                consume(l, data, state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                pushFN(data, branch_4a236324dddf6f01);
                pushFN(data, $expression);
                return 0;
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   115:332 virtual-326:8:1|--lvl:1=>parameters ; expression ; • loop_expression_HC_listbody6_112 ) expression
                */
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*115:332 virtual-326:8:1|--lvl:1=>parameters ; expression ; • loop_expression_HC_listbody6_112 ) expression*/
                pushFN(data, branch_f622ff7d2b5a7360);
                pushFN(data, $loop_expression_HC_listbody6_112);
                return 0;
            }
        }
        /*8cc0b8a3fa90694aeb0f2faf6909fd5c*/
    }
    function branch_8da952aa6fb1066e(l, data, state, prod) {
        /*43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
        43:127 primitive_declaration=>modifier_list • identifier : type*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        pushFN(data, branch_0bbbbac616724bc0);
        pushFN(data, $identifier);
        return 0;
        /*8da952aa6fb1066e82ae68e649d3c06c*/
    }
    function branch_8edd769bb0a9267b(l, data, state, prod) {
        /*12:32 struct=>modifier_list • str identifier { parameters }
        12:34 struct=>modifier_list • str identifier { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (/*[str]*/cmpr_set(l, data, 46, 3, 3)) {
            /*
               12:32 struct=>modifier_list str • identifier { parameters }
               12:34 struct=>modifier_list str • identifier { }
            */
            consume(l, data, state);
            /*12:32 struct=>modifier_list str • identifier { parameters }
            12:34 struct=>modifier_list str • identifier { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_760893d357a620de);
            pushFN(data, $identifier);
            return 0;
        }
        /*8edd769bb0a9267b183721e730b529c5*/
    }
    function branch_8ef88dea09c04d33(l, data, state, prod) {
        /*111:328 virtual-76:3:1|--lvl:0=>• = expression
        112:329 virtual-85:1:1|--lvl:0=>•*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if (l.current_byte == 61/*[=]*/) {
            /*
               111:328 virtual-76:3:1|--lvl:0=>• = expression
               112:329 virtual-85:1:1|--lvl:0=>•
            */
            /*111:328 virtual-76:3:1|--lvl:0=>• = expression*/
            let pk = l.copy();
            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, false);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if ((((((((((((((/*[if]*/cmpr_set(pk, data, 142, 2, 2) ||/*[match]*/cmpr_set(pk, data, 66, 5, 5)) || dt_bcea2102060eab13(pk, data)) || dt_6ae31dd85a62ef5c(pk, data)) ||/*[true]*/cmpr_set(pk, data, 94, 4, 4)) ||/*[null]*/cmpr_set(pk, data, 34, 4, 4)) ||/*[<<--]*/cmpr_set(pk, data, 19, 4, 4)) ||/*[break]*/cmpr_set(pk, data, 71, 5, 5)) ||/*[return]*/cmpr_set(pk, data, 76, 6, 6)) ||/*[continue]*/cmpr_set(pk, data, 38, 8, 8)) ||/*[loop]*/cmpr_set(pk, data, 62, 4, 4)) || assert_ascii(pk, 0x0, 0x20000194, 0x88000000, 0x8000000)) || pk.isUniID(data)) || pk.isNum(data)) || pk.isSym(true, data)) {
                /*
                   111:328 virtual-76:3:1|--lvl:0=>• = expression
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                /*111:328 virtual-76:3:1|--lvl:0=>• = expression*/
                consume(l, data, state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                pushFN(data, branch_aa3116d56547b12e);
                pushFN(data, $expression);
                return 0;
            }
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*
               112:329 virtual-85:1:1|--lvl:0=>•
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*112:329 virtual-85:1:1|--lvl:0=>•*/
            pushFN(data, $expression_statements_group_023_108_goto);
            return 26;
        }
        return -1;
        /*8ef88dea09c04d339bb145d856d6488a*/
    }
    function branch_907da7cc882c4c7b(l, data, state, prod) {
        add_reduce(state, data, 7, 51);
        /*907da7cc882c4c7b0860d866f0862a07*/
    }
    function branch_90dae087c6326af9(l, data, state, prod) {
        add_reduce(state, data, 3, 64);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $expression_statements_goto);
        return 37;
        /*90dae087c6326af9f76514c821f41d67*/
    }
    function branch_91c08442b016d0bc(l, data, state, prod) {
        add_reduce(state, data, 5, 72);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $class_group_016_104_goto);
        return 9;
        /*91c08442b016d0bc55412b25d8480f6f*/
    }
    function branch_92afc2d9878633ca(l, data, state, prod) {
        add_reduce(state, data, 2, 0);
        return 48;
        /*92afc2d9878633ca560dbab5e7300421*/
    }
    function branch_9326ced0ea767996(l, data, state, prod) {
        add_reduce(state, data, 1, 4);
        pushFN(data, $statements_goto);
        return 4;
        /*9326ced0ea7679968e0e77e8340732d9*/
    }
    function branch_932813fce4f93f5b(l, data, state, prod) {
        /*43:125 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_169_116
        43:127 primitive_declaration=>modifier_list identifier : type •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 61/*[=]*/) {
            /*
               43:125 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_169_116
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*43:125 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_169_116*/
            pushFN(data, branch_91c08442b016d0bc);
            pushFN(data, $primitive_declaration_group_169_116);
            return 0;
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*
               43:127 primitive_declaration=>modifier_list identifier : type •
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*43:127 primitive_declaration=>modifier_list identifier : type •*/
            add_reduce(state, data, 4, 74);
            /*-------------INDIRECT-------------------*/
            return 9;
        }
        /*932813fce4f93f5b34b0a7012c54ce2a*/
    }
    function branch_932a47b157fc4242(l, data, state, prod) {
        add_reduce(state, data, 3, 35);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $parameters_HC_listbody10_106_goto);
        return 15;
        /*932a47b157fc42422e7412dbd8156b8c*/
    }
    function branch_94c1cb08609ba6b1(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if (/*[in]*/cmpr_set(l, data, 42, 2, 2) && consume(l, data, state)) {
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_21d011590bad51a3);
            pushFN(data, $expression);
            return 0;
        }
        /*94c1cb08609ba6b17e1ab0375bf484a1*/
    }
    function branch_9634317f03e0b010(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 8, 31);
            return 14;
        }
        /*9634317f03e0b01047c114adcffb4adb*/
    }
    function branch_9689810ad262b5fb(l, data, state, prod) {
        /*12:33 struct=>str identifier • { parameters }
        12:35 struct=>str identifier • { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 123/*[{]*/) {
            /*
               12:33 struct=>str identifier { • parameters }
               12:35 struct=>str identifier { • }
            */
            consume(l, data, state);
            /*12:33 struct=>str identifier { • parameters }
            12:35 struct=>str identifier { • }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if (l.current_byte == 125/*[}]*/) {
                /*
                   12:35 struct=>str identifier { • }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*12:35 struct=>str identifier { • }*/
                consume(l, data, state);
                add_reduce(state, data, 4, 18);
                return 12;
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   12:33 struct=>str identifier { • parameters }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*12:33 struct=>str identifier { • parameters }*/
                pushFN(data, branch_53c288e720b933ec);
                pushFN(data, $parameters);
                return 0;
            }
        }
        /*9689810ad262b5fbe44655e6feaa8755*/
    }
    function branch_97946dd38e34dd15(l, data, state, prod) {
        pushFN(data, $expression_statements_goto);
        return 44;
        /*97946dd38e34dd15fca388ad27f0753f*/
    }
    function branch_97d12074ee5984bb(l, data, state, prod) {
        /*43:125 primitive_declaration=>modifier_list identifier • : type primitive_declaration_group_169_116
        43:127 primitive_declaration=>modifier_list identifier • : type*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 58/*[:]*/) {
            /*
               43:125 primitive_declaration=>modifier_list identifier : • type primitive_declaration_group_169_116
               43:127 primitive_declaration=>modifier_list identifier : • type
            */
            consume(l, data, state);
            /*43:125 primitive_declaration=>modifier_list identifier : • type primitive_declaration_group_169_116
            43:127 primitive_declaration=>modifier_list identifier : • type*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_1c1e5087c2744b35);
            pushFN(data, $type);
            return 0;
        }
        /*97d12074ee5984bbfbbb36eefe443551*/
    }
    function branch_98d96b9e3b2e6979(l, data, state, prod) {
        add_reduce(state, data, 2, 2);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $def$octal_token_HC_listbody1_110_goto);
        return 95;
        /*98d96b9e3b2e6979e6076b8170dbb59f*/
    }
    function branch_999aaae91431ed93(l, data, state, prod) {
        pushFN(data, branch_f557979c122cc8c0);
        return 50;
        /*999aaae91431ed934a559151d91aca25*/
    }
    function branch_9b47db19a59c28fd(l, data, state, prod) {
        /*43:125 primitive_declaration=>modifier_list identifier • : type primitive_declaration_group_169_116
        43:127 primitive_declaration=>modifier_list identifier • : type*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 58/*[:]*/) {
            /*
               43:125 primitive_declaration=>modifier_list identifier : • type primitive_declaration_group_169_116
               43:127 primitive_declaration=>modifier_list identifier : • type
            */
            consume(l, data, state);
            /*43:125 primitive_declaration=>modifier_list identifier : • type primitive_declaration_group_169_116
            43:127 primitive_declaration=>modifier_list identifier : • type*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_75a35c38bf32d743);
            pushFN(data, $type);
            return 0;
        }
        /*9b47db19a59c28fd9bc5625b644eab1e*/
    }
    function branch_9d78e95a51c9affd(l, data, state, prod) {
        /*109:326 virtual-97:9:1|--lvl:0=>( parameters ; expression • ; loop_expression_HC_listbody6_112 ) expression
        111:328 virtual-101:8:1|--lvl:0=>( parameters ; expression • ; ) expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 59/*[;]*/) {
            /*
               109:326 virtual-97:9:1|--lvl:0=>( parameters ; expression ; • loop_expression_HC_listbody6_112 ) expression
               111:328 virtual-101:8:1|--lvl:0=>( parameters ; expression ; • ) expression
            */
            consume(l, data, state);
            /*109:326 virtual-97:9:1|--lvl:0=>( parameters ; expression ; • loop_expression_HC_listbody6_112 ) expression
            111:328 virtual-101:8:1|--lvl:0=>( parameters ; expression ; • ) expression*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if (l.current_byte == 41/*[)]*/) {
                /*
                   111:328 virtual-101:8:1|--lvl:0=>( parameters ; expression ; • ) expression
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*111:328 virtual-101:8:1|--lvl:0=>( parameters ; expression ; • ) expression*/
                consume(l, data, state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                pushFN(data, branch_3205c0ded576131e);
                pushFN(data, $expression);
                return 0;
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   109:326 virtual-97:9:1|--lvl:0=>( parameters ; expression ; • loop_expression_HC_listbody6_112 ) expression
                */
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*109:326 virtual-97:9:1|--lvl:0=>( parameters ; expression ; • loop_expression_HC_listbody6_112 ) expression*/
                pushFN(data, branch_21d011590bad51a3);
                pushFN(data, $loop_expression_HC_listbody6_112);
                return 0;
            }
        }
        /*9d78e95a51c9affd651d0c99fda6966b*/
    }
    function branch_9dd2822300e6d441(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 10, 21);
            /*-------------INDIRECT-------------------*/
            pushFN(data, $statements_goto);
            return 4;
        }
        /*9dd2822300e6d4413894a564cde53234*/
    }
    function branch_9e5fbae7373ee27c(l, data, state, prod) {
        add_reduce(state, data, 2, 2);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $modifier_list_HC_listbody1_120_goto);
        return 49;
        /*9e5fbae7373ee27c0ca394a335dbae92*/
    }
    function branch_9eeb00e35cd81d29(l, data, state, prod) {
        /*43:125 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_169_116
        43:127 primitive_declaration=>modifier_list identifier : type •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 61/*[=]*/) {
            /*
               43:125 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_169_116
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*43:125 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_169_116*/
            pushFN(data, branch_fad7f40b4be4fcf4);
            pushFN(data, $primitive_declaration_group_169_116);
            return 0;
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*
               43:127 primitive_declaration=>modifier_list identifier : type •
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*43:127 primitive_declaration=>modifier_list identifier : type •*/
            add_reduce(state, data, 4, 74);
            return 43;
        }
        /*9eeb00e35cd81d29ba65d1bb32461d49*/
    }
    function branch_a16221fa8db16fb7(l, data, state, prod) {
        add_reduce(state, data, 3, 61);
        return 34;
        /*a16221fa8db16fb74528582dac40c364*/
    }
    function branch_a201144ddb2803ba(l, data, state, prod) {
        /*43:125 primitive_declaration=>modifier_list identifier • : type primitive_declaration_group_169_116
        43:127 primitive_declaration=>modifier_list identifier • : type*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 58/*[:]*/) {
            /*
               43:125 primitive_declaration=>modifier_list identifier : • type primitive_declaration_group_169_116
               43:127 primitive_declaration=>modifier_list identifier : • type
            */
            consume(l, data, state);
            /*43:125 primitive_declaration=>modifier_list identifier : • type primitive_declaration_group_169_116
            43:127 primitive_declaration=>modifier_list identifier : • type*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_932813fce4f93f5b);
            pushFN(data, $type);
            return 0;
        }
        /*a201144ddb2803ba847bfa2906d17d6d*/
    }
    function branch_a280998f5fd578b8(l, data, state, prod) {
        add_reduce(state, data, 2, 0);
        return 38;
        /*a280998f5fd578b8f6d7f5e060c281db*/
    }
    function branch_a2ade393e0ff2119(l, data, state, prod) {
        add_reduce(state, data, 2, 0);
        return 96;
        /*a2ade393e0ff2119b3fa1b310e414095*/
    }
    function branch_a325368242806460(l, data, state, prod) {
        /*14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
        14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
        14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
        14:50 function_expression=>modifier_list • fn : type ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (/*[fn]*/cmpr_set(l, data, 143, 2, 2)) {
            /*
               14:44 function_expression=>modifier_list fn • : type ( parameters ) { expression_statements }
               14:46 function_expression=>modifier_list fn • : type ( ) { expression_statements }
               14:47 function_expression=>modifier_list fn • : type ( parameters ) { }
               14:50 function_expression=>modifier_list fn • : type ( ) { }
            */
            consume(l, data, state);
            /*14:44 function_expression=>modifier_list fn • : type ( parameters ) { expression_statements }
            14:46 function_expression=>modifier_list fn • : type ( ) { expression_statements }
            14:47 function_expression=>modifier_list fn • : type ( parameters ) { }
            14:50 function_expression=>modifier_list fn • : type ( ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if (l.current_byte == 58/*[:]*/) {
                /*
                   14:44 function_expression=>modifier_list fn : • type ( parameters ) { expression_statements }
                   14:46 function_expression=>modifier_list fn : • type ( ) { expression_statements }
                   14:47 function_expression=>modifier_list fn : • type ( parameters ) { }
                   14:50 function_expression=>modifier_list fn : • type ( ) { }
                */
                consume(l, data, state);
                /*14:44 function_expression=>modifier_list fn : • type ( parameters ) { expression_statements }
                14:46 function_expression=>modifier_list fn : • type ( ) { expression_statements }
                14:47 function_expression=>modifier_list fn : • type ( parameters ) { }
                14:50 function_expression=>modifier_list fn : • type ( ) { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                pushFN(data, branch_5b49665f15aed749);
                pushFN(data, $type);
                return 0;
            }
        }
        /*a325368242806460bd3ec46e2b184fb8*/
    }
    function branch_a344a7e7c13713a7(l, data, state, prod) {
        add_reduce(state, data, 3, 35);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $call_expression_HC_listbody2_114_goto);
        return 35;
        /*a344a7e7c13713a7f247c5c0f4fb1e43*/
    }
    function branch_a367c2885e5a992a(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 10, 21);
            return 13;
        }
        /*a367c2885e5a992a8a177239d68b6595*/
    }
    function branch_a4106e14bfe619c8(l, data, state, prod) {
        add_reduce(state, data, 1, 87);
        pushFN(data, $string_HC_listbody1_127_goto);
        return 59;
        /*a4106e14bfe619c8641f0b993dfad635*/
    }
    function branch_a443d094a8c7e898(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 7, 7);
            /*-------------INDIRECT-------------------*/
            pushFN(data, $statements_goto);
            return 4;
        }
        /*a443d094a8c7e898e01632e0e7ac16b9*/
    }
    function branch_a53e7529dd2a9359(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
            add_reduce(state, data, 4, 62);
            /*-------------INDIRECT-------------------*/
            pushFN(data, branch_f557979c122cc8c0);
            return 26;
        }
        /*a53e7529dd2a9359fec74f9e7dc5be1c*/
    }
    function branch_a640133248876788(l, data, state, prod) {
        /*48:137 identifier_token=>identifier_token_group_074_117 identifier_token_HC_listbody1_118 • identifier_token_group_079_119
        48:139 identifier_token=>identifier_token_group_074_117 identifier_token_HC_listbody1_118 •*/
        skip_db1786a8af54d666(l/*[ 71 ]*/, data, true);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/) {
            /*
               48:137 identifier_token=>identifier_token_group_074_117 identifier_token_HC_listbody1_118 • identifier_token_group_079_119
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*48:137 identifier_token=>identifier_token_group_074_117 identifier_token_HC_listbody1_118 • identifier_token_group_079_119*/
            pushFN(data, branch_398d9230ecf58463);
            pushFN(data, $identifier_token_group_079_119);
            return 0;
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*
               48:139 identifier_token=>identifier_token_group_074_117 identifier_token_HC_listbody1_118 •
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*48:139 identifier_token=>identifier_token_group_074_117 identifier_token_HC_listbody1_118 •*/
            add_reduce(state, data, 2, 0);
        }
        /*a640133248876788edd0832fd56e9e46*/
    }
    function branch_a6a82a9baab43c58(l, data, state, prod) {
        add_reduce(state, data, 2, 0);
        return 101;
        /*a6a82a9baab43c5822362b1805558cf1*/
    }
    function branch_a6b376ed0bf34743(l, data, state, prod) {
        add_reduce(state, data, 2, 0);
        return 89;
        /*a6b376ed0bf34743cfdd9c0272c37bee*/
    }
    function branch_a6f489c38be28a8a(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
            add_reduce(state, data, 3, 36);
            return 29;
        }
        /*a6f489c38be28a8aae95417a04cd2613*/
    }
    function branch_a6f8c459a3e3352c(l, data, state, prod) {
        add_reduce(state, data, 2, 69);
        return 40;
        /*a6f8c459a3e3352c773c2ac08ed2f653*/
    }
    function branch_a84d18e40d92f232(l, data, state, prod) {
        /*12:32 struct=>modifier_list str identifier • { parameters }
        12:34 struct=>modifier_list str identifier • { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 123/*[{]*/) {
            /*
               12:32 struct=>modifier_list str identifier { • parameters }
               12:34 struct=>modifier_list str identifier { • }
            */
            consume(l, data, state);
            /*12:32 struct=>modifier_list str identifier { • parameters }
            12:34 struct=>modifier_list str identifier { • }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if (l.current_byte == 125/*[}]*/) {
                /*
                   12:34 struct=>modifier_list str identifier { • }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*12:34 struct=>modifier_list str identifier { • }*/
                consume(l, data, state);
                add_reduce(state, data, 5, 17);
                /*-------------INDIRECT-------------------*/
                pushFN(data, $class_group_016_104_goto);
                return 9;
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   12:32 struct=>modifier_list str identifier { • parameters }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*12:32 struct=>modifier_list str identifier { • parameters }*/
                pushFN(data, branch_c17cd9799d850159);
                pushFN(data, $parameters);
                return 0;
            }
        }
        /*a84d18e40d92f232caff0e7dc92d04c5*/
    }
    function branch_a96d7c2556c7c082(l, data, state, prod) {
        add_reduce(state, data, 2, 2);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $comment_HC_listbody1_132_goto);
        return 69;
        /*a96d7c2556c7c0826d6c173e1a8df992*/
    }
    function branch_aa3116d56547b12e(l, data, state, prod) {
        add_reduce(state, data, 3, 42);
        pushFN(data, $expression_goto);
        return 21;
        /*aa3116d56547b12e86044408aa6f0a1a*/
    }
    function branch_aa893c04c09c8ca3(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        pushFN(data, branch_f1ee391f92f003e7);
        pushFN(data, $type_group_097_124);
        return 0;
        /*aa893c04c09c8ca36ce6fe04c677e38b*/
    }
    function branch_abeac2fc1a8042a7(l, data, state, prod) {
        /*36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
        36:114 call_expression=>member_expression • ( )*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 40/*[(]*/) {
            /*
               36:113 call_expression=>member_expression ( • call_expression_HC_listbody2_114 )
               36:114 call_expression=>member_expression ( • )
            */
            consume(l, data, state);
            /*36:113 call_expression=>member_expression ( • call_expression_HC_listbody2_114 )
            36:114 call_expression=>member_expression ( • )*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if (l.current_byte == 41/*[)]*/) {
                /*
                   36:114 call_expression=>member_expression ( • )
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*36:114 call_expression=>member_expression ( • )*/
                consume(l, data, state);
                add_reduce(state, data, 3, 63);
                return 36;
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   36:113 call_expression=>member_expression ( • call_expression_HC_listbody2_114 )
                */
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*36:113 call_expression=>member_expression ( • call_expression_HC_listbody2_114 )*/
                pushFN(data, branch_f5ea04fd0ffadf55);
                pushFN(data, $call_expression_HC_listbody2_114);
                return 0;
            }
        }
        /*abeac2fc1a8042a70db2b6f5b3553d9e*/
    }
    function branch_ada79735e77a7e70(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
            add_reduce(state, data, 3, 36);
            pushFN(data, branch_5acf30e2ab16c6bb);
            return 29;
        }
        /*ada79735e77a7e70c5e6a57beeedfad3*/
    }
    function branch_adbd08e4801cc051(l, data, state, prod) {
        add_reduce(state, data, 3, 90);
        return 65;
        /*adbd08e4801cc0519cda1179231cc1fa*/
    }
    function branch_ae5ecc9a7289734c(l, data, state, prod) {
        /*33:108 match_expression=>match expression • : match_expression_HC_listbody3_113
        33:109 match_expression=>match expression • :*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 58/*[:]*/) {
            /*
               33:108 match_expression=>match expression : • match_expression_HC_listbody3_113
               33:109 match_expression=>match expression : •
            */
            consume(l, data, state);
            /*33:108 match_expression=>match expression : • match_expression_HC_listbody3_113
            33:109 match_expression=>match expression : •*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            switch (sym_map_6086d4345ad4efc2(l, data)) {
                default:
                case 0:
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    /*33:109 match_expression=>match expression : •*/
                    add_reduce(state, data, 3, 60);
                    return 33;
                case 1:
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                    /*33:108 match_expression=>match expression : • match_expression_HC_listbody3_113*/
                    pushFN(data, branch_0ac4de478f2a0502);
                    pushFN(data, $match_expression_HC_listbody3_113);
                    return 0;
                case 2:
                    /*--LEAF--*/
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    /*33:108 match_expression=>match expression : • match_expression_HC_listbody3_113*/
                    pushFN(data, branch_0ac4de478f2a0502);
                    pushFN(data, $match_expression_HC_listbody3_113);
                    return 0;
            }
        }
        /*ae5ecc9a7289734cc2f06d4f39d3a9f5*/
    }
    function branch_af103e7f249a99a8(l, data, state, prod) {
        /*24:78 if_expression=>if expression : expression • if_expression_group_139_110
        24:79 if_expression=>if expression : expression •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
        if (/*[else]*/cmpr_set(l, data, 127, 4, 4)) {
            /*
               24:78 if_expression=>if expression : expression • if_expression_group_139_110
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
            /*24:78 if_expression=>if expression : expression • if_expression_group_139_110*/
            pushFN(data, branch_3006927599d5524c);
            pushFN(data, $if_expression_group_139_110);
            return 0;
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*
               24:79 if_expression=>if expression : expression •
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*24:79 if_expression=>if expression : expression •*/
            add_reduce(state, data, 4, 44);
            return 24;
        }
        /*af103e7f249a99a8d253ff7e0f0a3e67*/
    }
    function branch_afd1d9907e70a95b(l, data, state, prod) {
        add_reduce(state, data, 2, 86);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $def$string_value_HC_listbody2_114_goto);
        return 102;
        /*afd1d9907e70a95b0bf2611bfd49b8da*/
    }
    function branch_b09b16aad1bdc0ca(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_818d14bff9153d48);
            pushFN(data, $expression);
            return 0;
        }
        /*b09b16aad1bdc0cadf88b5a0a18acc90*/
    }
    function branch_b0c4365fc53124e4(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if (/*[in]*/cmpr_set(l, data, 42, 2, 2) && consume(l, data, state)) {
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_184068955d11f054);
            pushFN(data, $expression);
            return 0;
        }
        /*b0c4365fc53124e437ba3a73a842ecfe*/
    }
    function branch_b16f5597ded685c8(l, data, state, prod) {
        add_reduce(state, data, 3, 35);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $parameters_goto);
        return 16;
        /*b16f5597ded685c8101bd16938b63c5b*/
    }
    function branch_b3c25f685864ed15(l, data, state, prod) {
        add_reduce(state, data, 3, 42);
        /*-------------INDIRECT-------------------*/
        pushFN(data, branch_f557979c122cc8c0);
        return 21;
        /*b3c25f685864ed15493cd38b82e6a582*/
    }
    function branch_b45982591ba147c7(l, data, state, prod) {
        add_reduce(state, data, 3, 90);
        return 65;
        /*b45982591ba147c73ed62ef6a9469972*/
    }
    function branch_b92f5e276fda3d40(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 93/*[]]*/) && consume(l, data, state)) {
            add_reduce(state, data, 4, 65);
            /*-------------INDIRECT-------------------*/
            pushFN(data, $expression_statements_group_023_108_goto);
            return 37;
        }
        /*b92f5e276fda3d401022fafcbb3ba9e1*/
    }
    function branch_ba3eec6214f6ee12(l, data, state, prod) {
        /*14:45 function_expression=>fn : type • ( parameters ) { expression_statements }
        14:48 function_expression=>fn : type • ( ) { expression_statements }
        14:49 function_expression=>fn : type • ( parameters ) { }
        14:51 function_expression=>fn : type • ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 40/*[(]*/) {
            /*
               14:45 function_expression=>fn : type ( • parameters ) { expression_statements }
               14:48 function_expression=>fn : type ( • ) { expression_statements }
               14:49 function_expression=>fn : type ( • parameters ) { }
               14:51 function_expression=>fn : type ( • ) { }
            */
            consume(l, data, state);
            /*14:45 function_expression=>fn : type ( • parameters ) { expression_statements }
            14:49 function_expression=>fn : type ( • parameters ) { }
            14:48 function_expression=>fn : type ( • ) { expression_statements }
            14:51 function_expression=>fn : type ( • ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (l.current_byte == 41/*[)]*/) {
                /*
                   14:48 function_expression=>fn : type ( • ) { expression_statements }
                   14:51 function_expression=>fn : type ( • ) { }
                */
                /*14:48 function_expression=>fn : type ( • ) { expression_statements }
                14:51 function_expression=>fn : type ( • ) { }*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l, data, state);
                /*14:48 function_expression=>fn : type ( ) • { expression_statements }
                14:51 function_expression=>fn : type ( ) • { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                if (l.current_byte == 123/*[{]*/) {
                    /*
                       14:48 function_expression=>fn : type ( ) { • expression_statements }
                       14:51 function_expression=>fn : type ( ) { • }
                    */
                    consume(l, data, state);
                    /*14:48 function_expression=>fn : type ( ) { • expression_statements }
                    14:51 function_expression=>fn : type ( ) { • }*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    if (l.current_byte == 125/*[}]*/) {
                        /*
                           14:51 function_expression=>fn : type ( ) { • }
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert ⤋⤋⤋*/
                        /*14:51 function_expression=>fn : type ( ) { • }*/
                        consume(l, data, state);
                        add_reduce(state, data, 7, 34);
                        return 14;
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    } else {
                        /*
                           14:48 function_expression=>fn : type ( ) { • expression_statements }
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                        /*14:48 function_expression=>fn : type ( ) { • expression_statements }*/
                        pushFN(data, branch_9634317f03e0b010);
                        pushFN(data, $expression_statements);
                        return 0;
                    }
                }
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   14:45 function_expression=>fn : type ( • parameters ) { expression_statements }
                   14:49 function_expression=>fn : type ( • parameters ) { }
                */
                /*14:45 function_expression=>fn : type ( • parameters ) { expression_statements }
                14:49 function_expression=>fn : type ( • parameters ) { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                pushFN(data, branch_e5458ab46cb68439);
                pushFN(data, $parameters);
                return 0;
            }
        }
        /*ba3eec6214f6ee124493b2076caf74a7*/
    }
    function branch_bbaaf5e2ac261f99(l, data, state, prod) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $module_goto);
        return 3;
        /*bbaaf5e2ac261f999f1a18fd29356b5a*/
    }
    function branch_bc642d2c3a78962a(l, data, state, prod) {
        add_reduce(state, data, 5, 72);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $statements_goto);
        return 4;
        /*bc642d2c3a78962ad821e4ad84ee62af*/
    }
    function branch_bd41394530f64266(l, data, state, prod) {
        pushFN(data, $expression_statements_group_023_108_goto);
        return 18;
        /*bd41394530f6426639e277142ef64a8d*/
    }
    function branch_bd933351f038ae42(l, data, state, prod) {
        add_reduce(state, data, 3, 35);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $def$defaultproductions_HC_listbody1_100_goto);
        return 74;
        /*bd933351f038ae42b8ccf4a00a9b718a*/
    }
    function branch_bd9df05ec0ff89c0(l, data, state, prod) {
        /*-------------INDIRECT-------------------*/
        add_reduce(state, data, 3, 49);
        return 31;
        /*bd9df05ec0ff89c0c851717f15e7d861*/
    }
    function branch_be0df9815fa5883a(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 34/*["]*/) && consume(l, data, state)) {
            add_reduce(state, data, 3, 88);
            return 60;
        }
        /*be0df9815fa5883a2f7e180e2c966e00*/
    }
    function branch_bf312da1e8e7a614(l, data, state, prod) {
        return 26;
        /*bf312da1e8e7a61405660afe1d95f62f*/
    }
    function branch_c05d04c0757c411b(l, data, state, prod) {
        add_reduce(state, data, 2, 67);
        return 39;
        /*c05d04c0757c411b7cb99013e5d03b5c*/
    }
    function branch_c065289f9bc15f46(l, data, state, prod) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $def$string_token_goto);
        return 99;
        /*c065289f9bc15f4631010d12b3fff3b5*/
    }
    function branch_c0e3727d9ff912b9(l, data, state, prod) {
        pushFN(data, $expression_statements_goto);
        return 50;
        /*c0e3727d9ff912b905b2aed2c2721065*/
    }
    function branch_c14febbb36ab321c(l, data, state, prod) {
        /*13:36 function=>modifier_list fn identifier : type ( parameters • ) { expression_statements }
        13:39 function=>modifier_list fn identifier : type ( parameters • ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 41/*[)]*/) {
            /*
               13:36 function=>modifier_list fn identifier : type ( parameters ) • { expression_statements }
               13:39 function=>modifier_list fn identifier : type ( parameters ) • { }
            */
            consume(l, data, state);
            /*13:36 function=>modifier_list fn identifier : type ( parameters ) • { expression_statements }
            13:39 function=>modifier_list fn identifier : type ( parameters ) • { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if (l.current_byte == 123/*[{]*/) {
                /*
                   13:36 function=>modifier_list fn identifier : type ( parameters ) { • expression_statements }
                   13:39 function=>modifier_list fn identifier : type ( parameters ) { • }
                */
                consume(l, data, state);
                /*13:36 function=>modifier_list fn identifier : type ( parameters ) { • expression_statements }
                13:39 function=>modifier_list fn identifier : type ( parameters ) { • }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if (l.current_byte == 125/*[}]*/) {
                    /*
                       13:39 function=>modifier_list fn identifier : type ( parameters ) { • }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    /*13:39 function=>modifier_list fn identifier : type ( parameters ) { • }*/
                    consume(l, data, state);
                    add_reduce(state, data, 10, 22);
                    /*-------------INDIRECT-------------------*/
                    pushFN(data, $class_group_016_104_goto);
                    return 9;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else {
                    /*
                       13:36 function=>modifier_list fn identifier : type ( parameters ) { • expression_statements }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    /*13:36 function=>modifier_list fn identifier : type ( parameters ) { • expression_statements }*/
                    pushFN(data, branch_2ee20e42b6f5801d);
                    pushFN(data, $expression_statements);
                    return 0;
                }
            }
        }
        /*c14febbb36ab321c7f8d5b94d13398d0*/
    }
    function branch_c17cd9799d850159(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 6, 15);
            /*-------------INDIRECT-------------------*/
            pushFN(data, $class_group_016_104_goto);
            return 9;
        }
        /*c17cd9799d8501592be7d94952220213*/
    }
    function branch_c1d1bde8a1ade4c6(l, data, state, prod) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $def$hex_token_HC_listbody1_105_goto);
        return 88;
        /*c1d1bde8a1ade4c6c059841de06484c1*/
    }
    function branch_c1f053b9b39c8a71(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 9, 29);
            /*-------------INDIRECT-------------------*/
            pushFN(data, branch_f557979c122cc8c0);
            return 26;
        }
        /*c1f053b9b39c8a71b4e89cf6d0ad634a*/
    }
    function branch_c24f274588f75184(l, data, state, prod) {
        add_reduce(state, data, 3, 42);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $expression_goto);
        return 21;
        /*c24f274588f75184646dccb3b6fa3c8c*/
    }
    function branch_c595dca81d549584(l, data, state, prod) {
        add_reduce(state, data, 2, 2);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $module_HC_listbody1_101_goto);
        return 2;
        /*c595dca81d5495849012ff3620ac747b*/
    }
    function branch_c5ae726346b1a8db(l, data, state, prod) {
        /*43:126 primitive_declaration=>identifier : type • primitive_declaration_group_169_116
        43:128 primitive_declaration=>identifier : type •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 61/*[=]*/) {
            /*
               43:126 primitive_declaration=>identifier : type • primitive_declaration_group_169_116
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*43:126 primitive_declaration=>identifier : type • primitive_declaration_group_169_116*/
            pushFN(data, branch_88a0b5c0814835ce);
            pushFN(data, $primitive_declaration_group_169_116);
            return 0;
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*
               43:128 primitive_declaration=>identifier : type •
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*43:128 primitive_declaration=>identifier : type •*/
            add_reduce(state, data, 3, 75);
            add_reduce(state, data, 1, 3);
        }
        /*c5ae726346b1a8db2d89707506d8f406*/
    }
    function branch_c602d0d09fc69271(l, data, state, prod) {
        /*43:125 primitive_declaration=>modifier_list identifier • : type primitive_declaration_group_169_116
        43:127 primitive_declaration=>modifier_list identifier • : type*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 58/*[:]*/) {
            /*
               43:125 primitive_declaration=>modifier_list identifier : • type primitive_declaration_group_169_116
               43:127 primitive_declaration=>modifier_list identifier : • type
            */
            consume(l, data, state);
            /*43:125 primitive_declaration=>modifier_list identifier : • type primitive_declaration_group_169_116
            43:127 primitive_declaration=>modifier_list identifier : • type*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_0672f32c0002f802);
            pushFN(data, $type);
            return 0;
        }
        /*c602d0d09fc69271e97c969e690df679*/
    }
    function branch_c7782fe38088e5d9(l, data, state, prod) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $def$octal_token_HC_listbody1_110_goto);
        return 95;
        /*c7782fe38088e5d9a3974c09963645ae*/
    }
    function branch_c7d51075521c4454(l, data, state, prod) {
        /*25:80 binary_expression=>unary_expression operator •
        25:81 binary_expression=>unary_expression operator • expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        switch (sym_map_ad191553025cd3be(l, data)) {
            default:
            case 0:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                /*25:80 binary_expression=>unary_expression operator •*/
                add_reduce(state, data, 2, 45);
                /*-------------INDIRECT-------------------*/
                return 21;
            case 1:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*25:81 binary_expression=>unary_expression operator • expression*/
                pushFN(data, branch_c9fc0b5ae608e956);
                pushFN(data, $expression);
                return 0;
            case 2:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                /*25:81 binary_expression=>unary_expression operator • expression*/
                pushFN(data, branch_c9fc0b5ae608e956);
                pushFN(data, $expression);
                return 0;
        }
        /*c7d51075521c4454b7b263a9aa8240d2*/
    }
    function branch_c7d6c0b0a737d7c8(l, data, state, prod) {
        add_reduce(state, data, 2, 2);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $def$string_token_HC_listbody3_111_goto);
        return 98;
        /*c7d6c0b0a737d7c8134ad20b69a1507f*/
    }
    function branch_c8c25e5cf7f5e2f5(l, data, state, prod) {
        /*14:44 function_expression=>modifier_list fn : type ( parameters • ) { expression_statements }
        14:47 function_expression=>modifier_list fn : type ( parameters • ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 41/*[)]*/) {
            /*
               14:44 function_expression=>modifier_list fn : type ( parameters ) • { expression_statements }
               14:47 function_expression=>modifier_list fn : type ( parameters ) • { }
            */
            consume(l, data, state);
            /*14:44 function_expression=>modifier_list fn : type ( parameters ) • { expression_statements }
            14:47 function_expression=>modifier_list fn : type ( parameters ) • { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if (l.current_byte == 123/*[{]*/) {
                /*
                   14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }
                   14:47 function_expression=>modifier_list fn : type ( parameters ) { • }
                */
                consume(l, data, state);
                /*14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }
                14:47 function_expression=>modifier_list fn : type ( parameters ) { • }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if (l.current_byte == 125/*[}]*/) {
                    /*
                       14:47 function_expression=>modifier_list fn : type ( parameters ) { • }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    /*14:47 function_expression=>modifier_list fn : type ( parameters ) { • }*/
                    consume(l, data, state);
                    add_reduce(state, data, 9, 30);
                    /*-------------INDIRECT-------------------*/
                    pushFN(data, branch_f557979c122cc8c0);
                    return 26;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else {
                    /*
                       14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    /*14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }*/
                    pushFN(data, branch_86602c22e8a35896);
                    pushFN(data, $expression_statements);
                    return 0;
                }
            }
        }
        /*c8c25e5cf7f5e2f5a950d4789dc3d31e*/
    }
    function branch_c8c377fde95c32f5(l, data, state, prod) {
        add_reduce(state, data, 8, 53);
        /*c8c377fde95c32f5f6630d4d45090d9e*/
    }
    function branch_c8fc5dc6f9a4578e(l, data, state, prod) {
        add_reduce(state, data, 1, 66);
        pushFN(data, $unary_value_goto);
        return 37;
        /*c8fc5dc6f9a4578e2082b577ec89b198*/
    }
    function branch_c9075c8e9d64ed65(l, data, state, prod) {
        /*13:36 function=>modifier_list fn identifier : type • ( parameters ) { expression_statements }
        13:38 function=>modifier_list fn identifier : type • ( ) { expression_statements }
        13:39 function=>modifier_list fn identifier : type • ( parameters ) { }
        13:42 function=>modifier_list fn identifier : type • ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 40/*[(]*/) {
            /*
               13:36 function=>modifier_list fn identifier : type ( • parameters ) { expression_statements }
               13:38 function=>modifier_list fn identifier : type ( • ) { expression_statements }
               13:39 function=>modifier_list fn identifier : type ( • parameters ) { }
               13:42 function=>modifier_list fn identifier : type ( • ) { }
            */
            consume(l, data, state);
            /*13:36 function=>modifier_list fn identifier : type ( • parameters ) { expression_statements }
            13:39 function=>modifier_list fn identifier : type ( • parameters ) { }
            13:38 function=>modifier_list fn identifier : type ( • ) { expression_statements }
            13:42 function=>modifier_list fn identifier : type ( • ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (l.current_byte == 41/*[)]*/) {
                /*
                   13:38 function=>modifier_list fn identifier : type ( • ) { expression_statements }
                   13:42 function=>modifier_list fn identifier : type ( • ) { }
                */
                /*13:38 function=>modifier_list fn identifier : type ( • ) { expression_statements }
                13:42 function=>modifier_list fn identifier : type ( • ) { }*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l, data, state);
                /*13:38 function=>modifier_list fn identifier : type ( ) • { expression_statements }
                13:42 function=>modifier_list fn identifier : type ( ) • { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                if (l.current_byte == 123/*[{]*/) {
                    /*
                       13:38 function=>modifier_list fn identifier : type ( ) { • expression_statements }
                       13:42 function=>modifier_list fn identifier : type ( ) { • }
                    */
                    consume(l, data, state);
                    /*13:38 function=>modifier_list fn identifier : type ( ) { • expression_statements }
                    13:42 function=>modifier_list fn identifier : type ( ) { • }*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    if (l.current_byte == 125/*[}]*/) {
                        /*
                           13:42 function=>modifier_list fn identifier : type ( ) { • }
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert ⤋⤋⤋*/
                        /*13:42 function=>modifier_list fn identifier : type ( ) { • }*/
                        consume(l, data, state);
                        add_reduce(state, data, 9, 25);
                        /*-------------INDIRECT-------------------*/
                        pushFN(data, $class_group_016_104_goto);
                        return 9;
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    } else {
                        /*
                           13:38 function=>modifier_list fn identifier : type ( ) { • expression_statements }
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                        /*13:38 function=>modifier_list fn identifier : type ( ) { • expression_statements }*/
                        pushFN(data, branch_73b8ea077c729a29);
                        pushFN(data, $expression_statements);
                        return 0;
                    }
                }
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   13:36 function=>modifier_list fn identifier : type ( • parameters ) { expression_statements }
                   13:39 function=>modifier_list fn identifier : type ( • parameters ) { }
                */
                /*13:36 function=>modifier_list fn identifier : type ( • parameters ) { expression_statements }
                13:39 function=>modifier_list fn identifier : type ( • parameters ) { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                pushFN(data, branch_c14febbb36ab321c);
                pushFN(data, $parameters);
                return 0;
            }
        }
        /*c9075c8e9d64ed656395ad4bda4af227*/
    }
    function branch_c9fc0b5ae608e956(l, data, state, prod) {
        add_reduce(state, data, 3, 46);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $expression_goto);
        return 21;
        /*c9fc0b5ae608e956098e55e7c8767b1e*/
    }
    function branch_ca3a5796d9b8ad4d(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        pushFN(data, branch_2fa9779782f73a91);
        pushFN(data, $expression);
        return 0;
        /*ca3a5796d9b8ad4dbb5328d162c9dc19*/
    }
    function branch_ca7dd33b2d3dc0c1(l, data, state, prod) {
        /*7:16 namespace=>ns identifier • { namespace_HC_listbody3_102 }
        7:17 namespace=>ns identifier • { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 123/*[{]*/) {
            /*
               7:16 namespace=>ns identifier { • namespace_HC_listbody3_102 }
               7:17 namespace=>ns identifier { • }
            */
            consume(l, data, state);
            /*7:16 namespace=>ns identifier { • namespace_HC_listbody3_102 }
            7:17 namespace=>ns identifier { • }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if (l.current_byte == 125/*[}]*/) {
                /*
                   7:17 namespace=>ns identifier { • }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*7:17 namespace=>ns identifier { • }*/
                consume(l, data, state);
                add_reduce(state, data, 4, 6);
                return 7;
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   7:16 namespace=>ns identifier { • namespace_HC_listbody3_102 }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*7:16 namespace=>ns identifier { • namespace_HC_listbody3_102 }*/
                pushFN(data, branch_47941f6b8bbc7250);
                pushFN(data, $namespace_HC_listbody3_102);
                return 0;
            }
        }
        /*ca7dd33b2d3dc0c1f1076c1100b445ec*/
    }
    function branch_cabfca63de10cd14(l, data, state, prod) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $parameters_HC_listbody10_106_goto);
        return 15;
        /*cabfca63de10cd142417053dfa4a00f1*/
    }
    function branch_cad3222afff33c8d(l, data, state, prod) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $call_expression_HC_listbody2_114_goto);
        return 35;
        /*cad3222afff33c8da03c45714c17f596*/
    }
    function branch_cc3439f4db3f3190(l, data, state, prod) {
        return 76;
        /*cc3439f4db3f3190bf2ef7bd336cf9b7*/
    }
    function branch_cc9e8eab54dacbec(l, data, state, prod) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $namespace_HC_listbody3_102_goto);
        return 6;
        /*cc9e8eab54dacbec6317f4e9e1dffb6f*/
    }
    function branch_cf17702f971644c3(l, data, state, prod) {
        /*108:325 virtual-117:1:1|--lvl:0=>•
        109:326 virtual-126:4:1|--lvl:0=>• : type primitive_declaration_group_169_116
        110:327 virtual-128:3:1|--lvl:0=>• : type*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        if (!(l.current_byte == 58/*[:]*/) || l.END(data)) {
            /*
               108:325 virtual-117:1:1|--lvl:0=>•
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*108:325 virtual-117:1:1|--lvl:0=>•*/
            add_reduce(state, data, 1, 66);
            pushFN(data, $expression_statements_group_023_108_goto);
            return 37;
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else {
            /*
               108:325 virtual-117:1:1|--lvl:0=>•
               109:326 virtual-126:4:1|--lvl:0=>• : type primitive_declaration_group_169_116
               110:327 virtual-128:3:1|--lvl:0=>• : type
            */
            /*109:326 virtual-126:4:1|--lvl:0=>• : type primitive_declaration_group_169_116
            110:327 virtual-128:3:1|--lvl:0=>• : type*/
            let pk = l.copy();
            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, false);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (((((/*[uint]*/cmpr_set(pk, data, 82, 4, 4) ||/*[int]*/cmpr_set(pk, data, 83, 3, 3)) ||/*[flt]*/cmpr_set(pk, data, 124, 3, 3)) || dt_1e3f2d5b696b270e(pk, data)) || assert_ascii(pk, 0x0, 0x10, 0x80000000, 0x200240)) || pk.isUniID(data)) {
                /*
                   109:326 virtual-126:4:1|--lvl:0=>• : type primitive_declaration_group_169_116
                   110:327 virtual-128:3:1|--lvl:0=>• : type
                */
                /*109:326 virtual-126:4:1|--lvl:0=>• : type primitive_declaration_group_169_116
                110:327 virtual-128:3:1|--lvl:0=>• : type*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l, data, state);
                /*109:326 virtual-126:4:1|--lvl:0=>: • type primitive_declaration_group_169_116
                110:327 virtual-128:3:1|--lvl:0=>: • type*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                pushFN(data, branch_e10ce949f4d1aa40);
                pushFN(data, $type);
                return 0;
            }
        }
        return -1;
        /*cf17702f971644c30598c7e288507bfa*/
    }
    function branch_cf1acfcb741737a6(l, data, state, prod) {
        skip_a294e41529bc9275(l/*[ nl ][ 71 ]*/, data, true);
        pushFN(data, branch_a2ade393e0ff2119);
        pushFN(data, $def$octal_token_HC_listbody1_110);
        return 0;
        /*cf1acfcb741737a67eaa0d9ba7120e11*/
    }
    function branch_d06ef62b982f7192(l, data, state, prod) {
        /*14:44 function_expression=>modifier_list fn : type • ( parameters ) { expression_statements }
        14:46 function_expression=>modifier_list fn : type • ( ) { expression_statements }
        14:47 function_expression=>modifier_list fn : type • ( parameters ) { }
        14:50 function_expression=>modifier_list fn : type • ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 40/*[(]*/) {
            /*
               14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
               14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
               14:47 function_expression=>modifier_list fn : type ( • parameters ) { }
               14:50 function_expression=>modifier_list fn : type ( • ) { }
            */
            consume(l, data, state);
            /*14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
            14:47 function_expression=>modifier_list fn : type ( • parameters ) { }
            14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
            14:50 function_expression=>modifier_list fn : type ( • ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (l.current_byte == 41/*[)]*/) {
                /*
                   14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
                   14:50 function_expression=>modifier_list fn : type ( • ) { }
                */
                /*14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
                14:50 function_expression=>modifier_list fn : type ( • ) { }*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l, data, state);
                /*14:46 function_expression=>modifier_list fn : type ( ) • { expression_statements }
                14:50 function_expression=>modifier_list fn : type ( ) • { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                if (l.current_byte == 123/*[{]*/) {
                    /*
                       14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }
                       14:50 function_expression=>modifier_list fn : type ( ) { • }
                    */
                    consume(l, data, state);
                    /*14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }
                    14:50 function_expression=>modifier_list fn : type ( ) { • }*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    if (l.current_byte == 125/*[}]*/) {
                        /*
                           14:50 function_expression=>modifier_list fn : type ( ) { • }
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert ⤋⤋⤋*/
                        /*14:50 function_expression=>modifier_list fn : type ( ) { • }*/
                        consume(l, data, state);
                        add_reduce(state, data, 8, 33);
                        /*-------------INDIRECT-------------------*/
                        pushFN(data, branch_f557979c122cc8c0);
                        return 26;
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    } else {
                        /*
                           14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                        /*14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }*/
                        pushFN(data, branch_c1f053b9b39c8a71);
                        pushFN(data, $expression_statements);
                        return 0;
                    }
                }
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
                   14:47 function_expression=>modifier_list fn : type ( • parameters ) { }
                */
                /*14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
                14:47 function_expression=>modifier_list fn : type ( • parameters ) { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                pushFN(data, branch_c8c25e5cf7f5e2f5);
                pushFN(data, $parameters);
                return 0;
            }
        }
        /*d06ef62b982f7192994021f75dbd8a5c*/
    }
    function branch_d2901b16f2a97667(l, data, state, prod) {
        /*13:36 function=>modifier_list fn identifier • : type ( parameters ) { expression_statements }
        13:38 function=>modifier_list fn identifier • : type ( ) { expression_statements }
        13:39 function=>modifier_list fn identifier • : type ( parameters ) { }
        13:42 function=>modifier_list fn identifier • : type ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 58/*[:]*/) {
            /*
               13:36 function=>modifier_list fn identifier : • type ( parameters ) { expression_statements }
               13:38 function=>modifier_list fn identifier : • type ( ) { expression_statements }
               13:39 function=>modifier_list fn identifier : • type ( parameters ) { }
               13:42 function=>modifier_list fn identifier : • type ( ) { }
            */
            consume(l, data, state);
            /*13:36 function=>modifier_list fn identifier : • type ( parameters ) { expression_statements }
            13:38 function=>modifier_list fn identifier : • type ( ) { expression_statements }
            13:39 function=>modifier_list fn identifier : • type ( parameters ) { }
            13:42 function=>modifier_list fn identifier : • type ( ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_c9075c8e9d64ed65);
            pushFN(data, $type);
            return 0;
        }
        /*d2901b16f2a976670d4c1475ea43d41f*/
    }
    function branch_d503e53484b96c4c(l, data, state, prod) {
        /*65:191 operator=>θsym operator_HC_listbody1_128 • identifier_token_group_079_119
        65:194 operator=>θsym operator_HC_listbody1_128 •*/
        skip_db1786a8af54d666(l/*[ 71 ]*/, data, true);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/) {
            /*
               65:191 operator=>θsym operator_HC_listbody1_128 • identifier_token_group_079_119
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*65:191 operator=>θsym operator_HC_listbody1_128 • identifier_token_group_079_119*/
            pushFN(data, branch_b45982591ba147c7);
            pushFN(data, $identifier_token_group_079_119);
            return 0;
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*
               65:194 operator=>θsym operator_HC_listbody1_128 •
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*65:194 operator=>θsym operator_HC_listbody1_128 •*/
            add_reduce(state, data, 2, 90);
        }
        /*d503e53484b96c4cc1eb26eaaf9a94f0*/
    }
    function branch_d52c8d5260420d05(l, data, state, prod) {
        add_reduce(state, data, 8, 52);
        return 31;
        /*d52c8d5260420d05dd2932dd1c56205e*/
    }
    function branch_d5e7716c2a7c7576(l, data, state, prod) {
        /*14:44 function_expression=>modifier_list fn : type • ( parameters ) { expression_statements }
        14:46 function_expression=>modifier_list fn : type • ( ) { expression_statements }
        14:47 function_expression=>modifier_list fn : type • ( parameters ) { }
        14:50 function_expression=>modifier_list fn : type • ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 40/*[(]*/) {
            /*
               14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
               14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
               14:47 function_expression=>modifier_list fn : type ( • parameters ) { }
               14:50 function_expression=>modifier_list fn : type ( • ) { }
            */
            consume(l, data, state);
            /*14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
            14:47 function_expression=>modifier_list fn : type ( • parameters ) { }
            14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
            14:50 function_expression=>modifier_list fn : type ( • ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (l.current_byte == 41/*[)]*/) {
                /*
                   14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
                   14:50 function_expression=>modifier_list fn : type ( • ) { }
                */
                /*14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
                14:50 function_expression=>modifier_list fn : type ( • ) { }*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l, data, state);
                /*14:46 function_expression=>modifier_list fn : type ( ) • { expression_statements }
                14:50 function_expression=>modifier_list fn : type ( ) • { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                if (l.current_byte == 123/*[{]*/) {
                    /*
                       14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }
                       14:50 function_expression=>modifier_list fn : type ( ) { • }
                    */
                    consume(l, data, state);
                    /*14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }
                    14:50 function_expression=>modifier_list fn : type ( ) { • }*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    if (l.current_byte == 125/*[}]*/) {
                        /*
                           14:50 function_expression=>modifier_list fn : type ( ) { • }
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert ⤋⤋⤋*/
                        /*14:50 function_expression=>modifier_list fn : type ( ) { • }*/
                        consume(l, data, state);
                        add_reduce(state, data, 8, 33);
                        /*-------------INDIRECT-------------------*/
                        pushFN(data, $expression_statements_group_023_108_goto);
                        return 26;
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    } else {
                        /*
                           14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                        /*14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }*/
                        pushFN(data, branch_6b46cc2cdf8dc740);
                        pushFN(data, $expression_statements);
                        return 0;
                    }
                }
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
                   14:47 function_expression=>modifier_list fn : type ( • parameters ) { }
                */
                /*14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
                14:47 function_expression=>modifier_list fn : type ( • parameters ) { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                pushFN(data, branch_278919c62116ea81);
                pushFN(data, $parameters);
                return 0;
            }
        }
        /*d5e7716c2a7c7576a32fabf65564e7c0*/
    }
    function branch_d62b5b8cbd7267e5(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 11, 19);
            return 13;
        }
        /*d62b5b8cbd7267e5b51595af2b308e52*/
    }
    function branch_d6adce891265bf33(l, data, state, prod) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $identifier_token_HC_listbody1_118_goto);
        return 46;
        /*d6adce891265bf3355c131f97fff2a99*/
    }
    function branch_da4737880b1bd090(l, data, state, prod) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $def$binary_token_HC_listbody1_107_goto);
        return 91;
        /*da4737880b1bd090a143da7229a7c174*/
    }
    function branch_dac9d2928bf85808(l, data, state, prod) {
        add_reduce(state, data, 3, 64);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $expression_statements_group_023_108_goto);
        return 37;
        /*dac9d2928bf858089835aa83eb29c89e*/
    }
    function branch_dc0325cf695ea04c(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 9, 23);
            return 13;
        }
        /*dc0325cf695ea04c6e790ca377236176*/
    }
    function branch_dc58d4d8db41e78b(l, data, state, prod) {
        add_reduce(state, data, 4, 73);
        add_reduce(state, data, 1, 3);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $expression_statements_goto);
        return 20;
        /*dc58d4d8db41e78b63cd7d5f7aeaaedc*/
    }
    function branch_dc83f428871b16c3(l, data, state, prod) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $modifier_list_HC_listbody1_120_goto);
        return 49;
        /*dc83f428871b16c3ca4861f792af39bd*/
    }
    function branch_dc9a149972249bc1(l, data, state, prod) {
        add_reduce(state, data, 3, 64);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $unary_value_goto);
        return 37;
        /*dc9a149972249bc1da7ed80c0a280267*/
    }
    function branch_dca75710b3e3c7ef(l, data, state, prod) {
        add_reduce(state, data, 4, 73);
        pushFN(data, $expression_statements_group_023_108_goto);
        return 18;
        /*dca75710b3e3c7ef7e5272497156a015*/
    }
    function branch_dd33ff05dfe6a2e3(l, data, state, prod) {
        add_reduce(state, data, 3, 46);
        add_reduce(state, data, 1, 3);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $expression_statements_goto);
        return 20;
        /*dd33ff05dfe6a2e35379594d46fd6b3f*/
    }
    function branch_dd5c1e4a566fe3e5(l, data, state, prod) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $expression_statements_goto);
        return 20;
        /*dd5c1e4a566fe3e5592b2f39aeb7de67*/
    }
    function branch_df956a767aa948ca(l, data, state, prod) {
        add_reduce(state, data, 1, 66);
        pushFN(data, $expression_goto);
        return 37;
        /*df956a767aa948ca1f8ea7e857f438c6*/
    }
    function branch_e039b76c18d3b4c7(l, data, state, prod) {
        /*83:247 def$scientific_token_group_228_102=>def$scientific_token_group_027_101 • - θnum
        83:248 def$scientific_token_group_228_102=>def$scientific_token_group_027_101 • θnum*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if (l.isNum(data)) {
            /*
               83:248 def$scientific_token_group_228_102=>def$scientific_token_group_027_101 • θnum
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*83:248 def$scientific_token_group_228_102=>def$scientific_token_group_027_101 • θnum*/
            consume(l, data, state);
            add_reduce(state, data, 2, 0);
            return 83;
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.current_byte == 45/*[-]*/) {
            /*
               83:247 def$scientific_token_group_228_102=>def$scientific_token_group_027_101 • - θnum
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*83:247 def$scientific_token_group_228_102=>def$scientific_token_group_027_101 • - θnum*/
            consume(l, data, state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            if (l.isNum(data) && consume(l, data, state)) {
                add_reduce(state, data, 3, 0);
                return 83;
            }
        }
        /*e039b76c18d3b4c7486df66a703820ef*/
    }
    function branch_e065d9119934ceb8(l, data, state, prod) {
        add_reduce(state, data, 2, 0);
        return 23;
        /*e065d9119934ceb8f451e9563fdee717*/
    }
    function branch_e10ce949f4d1aa40(l, data, state, prod) {
        /*109:326 virtual-126:4:1|--lvl:0=>: type • primitive_declaration_group_169_116
        110:327 virtual-128:3:1|--lvl:0=>: type •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        if (!(l.current_byte == 61/*[=]*/) || l.END(data)) {
            /*
               110:327 virtual-128:3:1|--lvl:0=>: type •
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*110:327 virtual-128:3:1|--lvl:0=>: type •*/
            add_reduce(state, data, 3, 75);
            pushFN(data, $expression_statements_group_023_108_goto);
            return 18;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               109:326 virtual-126:4:1|--lvl:0=>: type • primitive_declaration_group_169_116
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*109:326 virtual-126:4:1|--lvl:0=>: type • primitive_declaration_group_169_116*/
            pushFN(data, branch_dca75710b3e3c7ef);
            pushFN(data, $primitive_declaration_group_169_116);
            return 0;
        }
        /*e10ce949f4d1aa40b7335be3732d404a*/
    }
    function branch_e134459c2d0235d8(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 39/*[']*/) && consume(l, data, state)) {
            add_reduce(state, data, 3, 36);
            return 97;
        }
        /*e134459c2d0235d8872fbe18c16ef673*/
    }
    function branch_e187025a283f9525(l, data, state, prod) {
        add_reduce(state, data, 2, 0);
        return 84;
        /*e187025a283f95257620ce1cfca131a1*/
    }
    function branch_e2fcda1d061b3a22(l, data, state, prod) {
        /*84:249 def$scientific_token=>def$float_token • def$scientific_token_group_228_102
        84:250 def$scientific_token=>def$float_token •*/
        skip_a294e41529bc9275(l/*[ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if ((l.current_byte == 101/*[e]*/) || (l.current_byte == 69/*[E]*/)) {
            /*
               84:249 def$scientific_token=>def$float_token • def$scientific_token_group_228_102
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*84:249 def$scientific_token=>def$float_token • def$scientific_token_group_228_102*/
            pushFN(data, branch_e187025a283f9525);
            pushFN(data, $def$scientific_token_group_228_102);
            return 0;
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*
               84:250 def$scientific_token=>def$float_token •
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*84:250 def$scientific_token=>def$float_token •*/
            return 84;
        }
        /*e2fcda1d061b3a22602933e9ebaf7d39*/
    }
    function branch_e4c5eddd3c274d0e(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 58/*[:]*/) && consume(l, data, state)) {
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_a16221fa8db16fb7);
            pushFN(data, $expression);
            return 0;
        }
        /*e4c5eddd3c274d0e7505c31aab800cd8*/
    }
    function branch_e5458ab46cb68439(l, data, state, prod) {
        /*14:45 function_expression=>fn : type ( parameters • ) { expression_statements }
        14:49 function_expression=>fn : type ( parameters • ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 41/*[)]*/) {
            /*
               14:45 function_expression=>fn : type ( parameters ) • { expression_statements }
               14:49 function_expression=>fn : type ( parameters ) • { }
            */
            consume(l, data, state);
            /*14:45 function_expression=>fn : type ( parameters ) • { expression_statements }
            14:49 function_expression=>fn : type ( parameters ) • { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if (l.current_byte == 123/*[{]*/) {
                /*
                   14:45 function_expression=>fn : type ( parameters ) { • expression_statements }
                   14:49 function_expression=>fn : type ( parameters ) { • }
                */
                consume(l, data, state);
                /*14:45 function_expression=>fn : type ( parameters ) { • expression_statements }
                14:49 function_expression=>fn : type ( parameters ) { • }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if (l.current_byte == 125/*[}]*/) {
                    /*
                       14:49 function_expression=>fn : type ( parameters ) { • }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    /*14:49 function_expression=>fn : type ( parameters ) { • }*/
                    consume(l, data, state);
                    add_reduce(state, data, 8, 32);
                    return 14;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else {
                    /*
                       14:45 function_expression=>fn : type ( parameters ) { • expression_statements }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    /*14:45 function_expression=>fn : type ( parameters ) { • expression_statements }*/
                    pushFN(data, branch_8b75a3e6e7885b90);
                    pushFN(data, $expression_statements);
                    return 0;
                }
            }
        }
        /*e5458ab46cb684397c6b57a8fdd99732*/
    }
    function branch_e56bbc7571cdf1e6(l, data, state, prod) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $loop_expression_HC_listbody6_112_goto);
        return 30;
        /*e56bbc7571cdf1e6a198a438a58ece8a*/
    }
    function branch_e5d37b956339712f(l, data, state, prod) {
        add_reduce(state, data, 6, 58);
        return 31;
        /*e5d37b956339712fb95ec7009559251d*/
    }
    function branch_e6ca468c39009342(l, data, state, prod) {
        return 1;
        /*e6ca468c39009342aa556361b9a54b1c*/
    }
    function branch_e890ce566b605dc3(l, data, state, prod) {
        add_reduce(state, data, 2, 2);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $def$string_token_goto);
        return 99;
        /*e890ce566b605dc3241379be8f368518*/
    }
    function branch_e8b252a4f58d33c8(l, data, state, prod) {
        add_reduce(state, data, 2, 2);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $def$binary_token_HC_listbody1_107_goto);
        return 91;
        /*e8b252a4f58d33c86dd33c171efa2967*/
    }
    function branch_e9132cf2af900310(l, data, state, prod) {
        add_reduce(state, data, 3, 49);
        return 31;
        /*e9132cf2af900310511eb4333930baee*/
    }
    function branch_e9b913e5644de2ed(l, data, state, prod) {
        add_reduce(state, data, 3, 0);
        return 71;
        /*e9b913e5644de2ed60831b41ebdb52e3*/
    }
    function branch_ea7ab158647a8bdb(l, data, state, prod) {
        /*108:325 virtual-96:3:1|--lvl:0=>• loop_expression_group_254_111 expression
        109:326 virtual-97:9:1|--lvl:0=>• ( parameters ; expression ; loop_expression_HC_listbody6_112 ) expression
        110:327 virtual-100:8:1|--lvl:0=>• ( parameters ; ; loop_expression_HC_listbody6_112 ) expression
        111:328 virtual-101:8:1|--lvl:0=>• ( parameters ; expression ; ) expression
        112:329 virtual-104:7:1|--lvl:0=>• ( parameters ; ; ) expression
        113:330 virtual-98:7:1|--lvl:0=>• ( primitive_declaration in expression ) expression*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if (l.current_byte == 40/*[(]*/) {
            /*
               108:325 virtual-96:3:1|--lvl:0=>• loop_expression_group_254_111 expression
               109:326 virtual-97:9:1|--lvl:0=>• ( parameters ; expression ; loop_expression_HC_listbody6_112 ) expression
               110:327 virtual-100:8:1|--lvl:0=>• ( parameters ; ; loop_expression_HC_listbody6_112 ) expression
               111:328 virtual-101:8:1|--lvl:0=>• ( parameters ; expression ; ) expression
               112:329 virtual-104:7:1|--lvl:0=>• ( parameters ; ; ) expression
               113:330 virtual-98:7:1|--lvl:0=>• ( primitive_declaration in expression ) expression
            */
            /*108:325 virtual-96:3:1|--lvl:0=>• loop_expression_group_254_111 expression
            109:326 virtual-97:9:1|--lvl:0=>• ( parameters ; expression ; loop_expression_HC_listbody6_112 ) expression
            110:327 virtual-100:8:1|--lvl:0=>• ( parameters ; ; loop_expression_HC_listbody6_112 ) expression
            111:328 virtual-101:8:1|--lvl:0=>• ( parameters ; expression ; ) expression
            112:329 virtual-104:7:1|--lvl:0=>• ( parameters ; ; ) expression
            113:330 virtual-98:7:1|--lvl:0=>• ( primitive_declaration in expression ) expression*/
            let pk = l.copy();
            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, false);
            switch (sym_map_6e7f87b3c415ac34(pk, data)) {
                case 0:
                    /*--LEAF--*/
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    /*108:325 virtual-96:3:1|--lvl:0=>• loop_expression_group_254_111 expression*/
                    pushFN(data, branch_ca3a5796d9b8ad4d);
                    pushFN(data, $loop_expression_group_254_111);
                    return 0;
                case 1:
                    /*29:92 loop_expression_group_254_111=>• ( expression )
                    109:326 virtual-97:9:1|--lvl:0=>• ( parameters ; expression ; loop_expression_HC_listbody6_112 ) expression
                    110:327 virtual-100:8:1|--lvl:0=>• ( parameters ; ; loop_expression_HC_listbody6_112 ) expression
                    111:328 virtual-101:8:1|--lvl:0=>• ( parameters ; expression ; ) expression
                    112:329 virtual-104:7:1|--lvl:0=>• ( parameters ; ; ) expression
                    113:330 virtual-98:7:1|--lvl:0=>• ( primitive_declaration in expression ) expression*/
                    /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                    consume(l, data, state);
                    /*29:92 loop_expression_group_254_111=>( • expression )
                    109:326 virtual-97:9:1|--lvl:0=>( • parameters ; expression ; loop_expression_HC_listbody6_112 ) expression
                    110:327 virtual-100:8:1|--lvl:0=>( • parameters ; ; loop_expression_HC_listbody6_112 ) expression
                    111:328 virtual-101:8:1|--lvl:0=>( • parameters ; expression ; ) expression
                    112:329 virtual-104:7:1|--lvl:0=>( • parameters ; ; ) expression
                    113:330 virtual-98:7:1|--lvl:0=>( • primitive_declaration in expression ) expression*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    switch (sym_map_5724501439696105(l, data)) {
                        case 0:
                            /*--LEAF--*/
                            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                            /*29:92 loop_expression_group_254_111=>( • expression )*/
                            pushFN(data, branch_ada79735e77a7e70);
                            pushFN(data, $expression);
                            return 0;
                        case 1:
                            /*-------------VPROD-------------------------*/
                            /*29:92 loop_expression_group_254_111=>( • expression )
                            109:326 virtual-97:9:1|--lvl:0=>( • parameters ; expression ; loop_expression_HC_listbody6_112 ) expression
                            110:327 virtual-100:8:1|--lvl:0=>( • parameters ; ; loop_expression_HC_listbody6_112 ) expression
                            111:328 virtual-101:8:1|--lvl:0=>( • parameters ; expression ; ) expression
                            112:329 virtual-104:7:1|--lvl:0=>( • parameters ; ; ) expression
                            113:330 virtual-98:7:1|--lvl:0=>( • primitive_declaration in expression ) expression*/
                            pushFN(data, branch_581f79584ec0465c);
                            return 0;
                        default:
                            break;
                    }
                default:
                    break;
            }
        }
        return -1;
        /*ea7ab158647a8bdbdcf71c364388285f*/
    }
    function branch_eadb44ad4e55e10b(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 93/*[]]*/) && consume(l, data, state)) {
            add_reduce(state, data, 3, 36);
            return 50;
        }
        /*eadb44ad4e55e10b993994698e7f0af1*/
    }
    function branch_ebf24d528bf754f0(l, data, state, prod) {
        /*11:24 class=>modifier_list cls identifier class_group_113_103 • { class_HC_listbody1_105 }
        11:27 class=>modifier_list cls identifier class_group_113_103 • { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 123/*[{]*/) {
            /*
               11:24 class=>modifier_list cls identifier class_group_113_103 { • class_HC_listbody1_105 }
               11:27 class=>modifier_list cls identifier class_group_113_103 { • }
            */
            consume(l, data, state);
            /*11:24 class=>modifier_list cls identifier class_group_113_103 { • class_HC_listbody1_105 }
            11:27 class=>modifier_list cls identifier class_group_113_103 { • }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if (l.current_byte == 125/*[}]*/) {
                /*
                   11:27 class=>modifier_list cls identifier class_group_113_103 { • }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*11:27 class=>modifier_list cls identifier class_group_113_103 { • }*/
                consume(l, data, state);
                add_reduce(state, data, 6, 10);
                /*-------------INDIRECT-------------------*/
                pushFN(data, $statements_goto);
                return 4;
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   11:24 class=>modifier_list cls identifier class_group_113_103 { • class_HC_listbody1_105 }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*11:24 class=>modifier_list cls identifier class_group_113_103 { • class_HC_listbody1_105 }*/
                pushFN(data, branch_a443d094a8c7e898);
                pushFN(data, $class_HC_listbody1_105);
                return 0;
            }
        }
        /*ebf24d528bf754f07868a2ad75d94aeb*/
    }
    function branch_ee95c97c1366e769(l, data, state, prod) {
        add_reduce(state, data, 4, 73);
        /*-------------INDIRECT-------------------*/
        pushFN(data, branch_f557979c122cc8c0);
        return 43;
        /*ee95c97c1366e7690114d7cf3ed7bc12*/
    }
    function branch_eebd0dd73f9d54cd(l, data, state, prod) {
        add_reduce(state, data, 2, 91);
        return 65;
        /*eebd0dd73f9d54cdc96a93af689dd711*/
    }
    function branch_ef2dc6f8b6dc9a12(l, data, state, prod) {
        pushFN(data, $expression_goto);
        return 72;
        /*ef2dc6f8b6dc9a12a0d2e861dcf58334*/
    }
    function branch_f0778db151911113(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 93/*[]]*/) && consume(l, data, state)) {
            add_reduce(state, data, 4, 65);
            /*-------------INDIRECT-------------------*/
            pushFN(data, $expression_statements_goto);
            return 37;
        }
        /*f0778db1519111133ee51162490753df*/
    }
    function branch_f14c9e5173466901(l, data, state, prod) {
        add_reduce(state, data, 2, 38);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $expression_statements_goto);
        return 20;
        /*f14c9e5173466901c7fa911e71f6a283*/
    }
    function branch_f1ed5c6c9d81ab5d(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_d52c8d5260420d05);
            pushFN(data, $expression);
            return 0;
        }
        /*f1ed5c6c9d81ab5d2d667eb5d76bcfeb*/
    }
    function branch_f1ee391f92f003e7(l, data, state, prod) {
        add_reduce(state, data, 2, 78);
        return 55;
        /*f1ee391f92f003e779453f62b6aa2c1a*/
    }
    function branch_f2315401e44245fc(l, data, state, prod) {
        /*13:36 function=>modifier_list fn identifier : type ( parameters • ) { expression_statements }
        13:39 function=>modifier_list fn identifier : type ( parameters • ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 41/*[)]*/) {
            /*
               13:36 function=>modifier_list fn identifier : type ( parameters ) • { expression_statements }
               13:39 function=>modifier_list fn identifier : type ( parameters ) • { }
            */
            consume(l, data, state);
            /*13:36 function=>modifier_list fn identifier : type ( parameters ) • { expression_statements }
            13:39 function=>modifier_list fn identifier : type ( parameters ) • { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if (l.current_byte == 123/*[{]*/) {
                /*
                   13:36 function=>modifier_list fn identifier : type ( parameters ) { • expression_statements }
                   13:39 function=>modifier_list fn identifier : type ( parameters ) { • }
                */
                consume(l, data, state);
                /*13:36 function=>modifier_list fn identifier : type ( parameters ) { • expression_statements }
                13:39 function=>modifier_list fn identifier : type ( parameters ) { • }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if (l.current_byte == 125/*[}]*/) {
                    /*
                       13:39 function=>modifier_list fn identifier : type ( parameters ) { • }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    /*13:39 function=>modifier_list fn identifier : type ( parameters ) { • }*/
                    consume(l, data, state);
                    add_reduce(state, data, 10, 22);
                    /*-------------INDIRECT-------------------*/
                    pushFN(data, $statements_goto);
                    return 4;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else {
                    /*
                       13:36 function=>modifier_list fn identifier : type ( parameters ) { • expression_statements }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    /*13:36 function=>modifier_list fn identifier : type ( parameters ) { • expression_statements }*/
                    pushFN(data, branch_6ea9c551086a9b7b);
                    pushFN(data, $expression_statements);
                    return 0;
                }
            }
        }
        /*f2315401e44245fcf6c1521f171fb47d*/
    }
    function branch_f294346e45fb95b8(l, data, state, prod) {
        add_reduce(state, data, 2, 2);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $module_goto);
        return 3;
        /*f294346e45fb95b825417a55edd51141*/
    }
    function branch_f557979c122cc8c0(l, data, state, prod) {
        while (1) {
            switch (prod) {
                case 16:
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    /*115:332 virtual-326:8:1|--lvl:1=>parameters • ; expression ; loop_expression_HC_listbody6_112 ) expression
                    116:333 virtual-327:7:1|--lvl:1=>parameters • ; ; loop_expression_HC_listbody6_112 ) expression
                    117:334 virtual-328:7:1|--lvl:1=>parameters • ; expression ; ) expression
                    118:335 virtual-329:6:1|--lvl:1=>parameters • ; ; ) expression
                    16:54 parameters=>parameters • , primitive_declaration*/
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    if (l.current_byte == 59/*[;]*/) {
                        /*
                           115:332 virtual-326:8:1|--lvl:1=>parameters • ; expression ; loop_expression_HC_listbody6_112 ) expression
                           116:333 virtual-327:7:1|--lvl:1=>parameters • ; ; loop_expression_HC_listbody6_112 ) expression
                           117:334 virtual-328:7:1|--lvl:1=>parameters • ; expression ; ) expression
                           118:335 virtual-329:6:1|--lvl:1=>parameters • ; ; ) expression
                        */
                        /*115:332 virtual-326:8:1|--lvl:1=>parameters • ; expression ; loop_expression_HC_listbody6_112 ) expression
                        117:334 virtual-328:7:1|--lvl:1=>parameters • ; expression ; ) expression
                        116:333 virtual-327:7:1|--lvl:1=>parameters • ; ; loop_expression_HC_listbody6_112 ) expression
                        118:335 virtual-329:6:1|--lvl:1=>parameters • ; ; ) expression*/
                        let pk = l.copy();
                        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, false);
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        if (pk.current_byte == 59/*[;]*/) {
                            /*
                               116:333 virtual-327:7:1|--lvl:1=>parameters • ; ; loop_expression_HC_listbody6_112 ) expression
                               118:335 virtual-329:6:1|--lvl:1=>parameters • ; ; ) expression
                            */
                            /*116:333 virtual-327:7:1|--lvl:1=>parameters • ; ; loop_expression_HC_listbody6_112 ) expression
                            118:335 virtual-329:6:1|--lvl:1=>parameters • ; ; ) expression*/
                            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                            consume(l, data, state);
                            /*116:333 virtual-327:7:1|--lvl:1=>parameters ; • ; loop_expression_HC_listbody6_112 ) expression
                            118:335 virtual-329:6:1|--lvl:1=>parameters ; • ; ) expression*/
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                            if (l.current_byte == 59/*[;]*/) {
                                /*
                                   116:333 virtual-327:7:1|--lvl:1=>parameters ; ; • loop_expression_HC_listbody6_112 ) expression
                                   118:335 virtual-329:6:1|--lvl:1=>parameters ; ; • ) expression
                                */
                                consume(l, data, state);
                                /*116:333 virtual-327:7:1|--lvl:1=>parameters ; ; • loop_expression_HC_listbody6_112 ) expression
                                118:335 virtual-329:6:1|--lvl:1=>parameters ; ; • ) expression*/
                                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                                /*⤋⤋⤋ assert ⤋⤋⤋*/
                                if (l.current_byte == 41/*[)]*/) {
                                    /*
                                       118:335 virtual-329:6:1|--lvl:1=>parameters ; ; • ) expression
                                    */
                                    /*--LEAF--*/
                                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                                    /*118:335 virtual-329:6:1|--lvl:1=>parameters ; ; • ) expression*/
                                    consume(l, data, state);
                                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                                    pushFN(data, branch_4a236324dddf6f01);
                                    pushFN(data, $expression);
                                    return 0;
                                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                                } else {
                                    /*
                                       116:333 virtual-327:7:1|--lvl:1=>parameters ; ; • loop_expression_HC_listbody6_112 ) expression
                                    */
                                    /*--LEAF--*/
                                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                                    /*116:333 virtual-327:7:1|--lvl:1=>parameters ; ; • loop_expression_HC_listbody6_112 ) expression*/
                                    pushFN(data, branch_f622ff7d2b5a7360);
                                    pushFN(data, $loop_expression_HC_listbody6_112);
                                    return 0;
                                }
                            }
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        } else {
                            /*
                               115:332 virtual-326:8:1|--lvl:1=>parameters • ; expression ; loop_expression_HC_listbody6_112 ) expression
                               117:334 virtual-328:7:1|--lvl:1=>parameters • ; expression ; ) expression
                            */
                            /*115:332 virtual-326:8:1|--lvl:1=>parameters • ; expression ; loop_expression_HC_listbody6_112 ) expression
                            117:334 virtual-328:7:1|--lvl:1=>parameters • ; expression ; ) expression*/
                            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                            consume(l, data, state);
                            /*115:332 virtual-326:8:1|--lvl:1=>parameters ; • expression ; loop_expression_HC_listbody6_112 ) expression
                            117:334 virtual-328:7:1|--lvl:1=>parameters ; • expression ; ) expression*/
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                            pushFN(data, branch_8cc0b8a3fa90694a);
                            pushFN(data, $expression);
                            return 0;
                        }
                        /*⤋⤋⤋ assert ⤋⤋⤋*/
                    } else if (l.current_byte == 44/*[,]*/) {
                        /*
                           16:54 parameters=>parameters • , primitive_declaration
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert ⤋⤋⤋*/
                        /*16:54 parameters=>parameters • , primitive_declaration*/
                        consume(l, data, state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                        pushFN(data, branch_868b83cdab6a1ed6);
                        pushFN(data, $primitive_declaration);
                        return 0;
                    }
                    break;
                case 21:
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    /*114:331 virtual-92:3:1|--lvl:1=>expression • )*/
                    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                    if (l.current_byte == 41/*[)]*/) {
                        /*
                           114:331 virtual-92:3:1|--lvl:1=>expression ) •
                        */
                        consume(l, data, state);
                        consume(l, data, state);
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                        /*114:331 virtual-92:3:1|--lvl:1=>expression ) •*/
                        pushFN(data, branch_5acf30e2ab16c6bb);
                        return 29;
                    }
                    break;
                case 26:
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    /*25:80 binary_expression=>unary_expression • operator
                    25:81 binary_expression=>unary_expression • operator expression
                    25:82 binary_expression=>unary_expression •*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    if (!((l.current_byte == 61/*[=]*/) || l.isSym(true, data)) || (/*[<<--]*/cmpr_set(l, data, 19, 4, 4) || assert_ascii(l, 0x0, 0xc001210, 0xa8000000, 0x20000000))) {
                        /*
                           25:82 binary_expression=>unary_expression •
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*25:82 binary_expression=>unary_expression •*/
                        prod = 21;
                        continue;;
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    } else if ((l.current_byte == 61/*[=]*/) || l.isSym(true, data)) {
                        /*
                           25:80 binary_expression=>unary_expression • operator
                           25:81 binary_expression=>unary_expression • operator expression
                        */
                        /*25:80 binary_expression=>unary_expression • operator
                        25:81 binary_expression=>unary_expression • operator expression*/
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                        pushFN(data, branch_5e45dd2f3023abf3);
                        pushFN(data, $operator);
                        return 0;
                    }
                    break;
                case 28:
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    /*22:76 assignment_expression=>left_hand_expression • = expression
                    27:85 unary_value=>left_hand_expression •*/
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    if (l.current_byte == 61/*[=]*/) {
                        /*
                           22:76 assignment_expression=>left_hand_expression • = expression
                           27:85 unary_value=>left_hand_expression •
                        */
                        /*22:76 assignment_expression=>left_hand_expression • = expression
                        27:85 unary_value=>left_hand_expression •*/
                        let pk = l.copy();
                        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, false);
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        if (((((((((((((/*[if]*/cmpr_set(pk, data, 142, 2, 2) ||/*[match]*/cmpr_set(pk, data, 66, 5, 5)) || dt_bcea2102060eab13(pk, data)) || dt_6ae31dd85a62ef5c(pk, data)) ||/*[true]*/cmpr_set(pk, data, 94, 4, 4)) ||/*[null]*/cmpr_set(pk, data, 34, 4, 4)) ||/*[<<--]*/cmpr_set(pk, data, 19, 4, 4)) ||/*[break]*/cmpr_set(pk, data, 71, 5, 5)) ||/*[return]*/cmpr_set(pk, data, 76, 6, 6)) ||/*[continue]*/cmpr_set(pk, data, 38, 8, 8)) ||/*[loop]*/cmpr_set(pk, data, 62, 4, 4)) || assert_ascii(pk, 0x0, 0x20000194, 0x88000000, 0x8000000)) || pk.isUniID(data)) || pk.isNum(data)) {
                            /*
                               22:76 assignment_expression=>left_hand_expression • = expression
                            */
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                            /*22:76 assignment_expression=>left_hand_expression • = expression*/
                            consume(l, data, state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                            pushFN(data, branch_b3c25f685864ed15);
                            pushFN(data, $expression);
                            return 0;
                            /*⤋⤋⤋ peek-unresolved ⤋⤋⤋*/
                        } else {
                            /*
                               22:76 assignment_expression=>left_hand_expression • = expression
                               27:85 unary_value=>left_hand_expression •
                            */
                            /*-------------VPROD-------------------------*/
                            /*22:76 assignment_expression=>left_hand_expression • = expression
                            27:85 unary_value=>left_hand_expression •*/
                            pushFN(data, branch_36356984c95e7c2c);
                            return 0;
                        }
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    } else {
                        /*
                           27:85 unary_value=>left_hand_expression •
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*27:85 unary_value=>left_hand_expression •*/
                        prod = 26;
                        continue;;
                    }
                    break;
                case 37:
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    /*28:91 left_hand_expression=>member_expression •
                    37:116 member_expression=>member_expression • [ expression ]
                    37:115 member_expression=>member_expression • . identifier
                    36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                    36:114 call_expression=>member_expression • ( )*/
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    if (l.current_byte == 91/*[[]*/) {
                        /*
                           28:91 left_hand_expression=>member_expression •
                           37:116 member_expression=>member_expression • [ expression ]
                        */
                        /*28:91 left_hand_expression=>member_expression •
                        37:116 member_expression=>member_expression • [ expression ]*/
                        let pk = l.copy();
                        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, false);
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        if (!((((((((((((((/*[if]*/cmpr_set(pk, data, 142, 2, 2) ||/*[match]*/cmpr_set(pk, data, 66, 5, 5)) || dt_bcea2102060eab13(pk, data)) || dt_6ae31dd85a62ef5c(pk, data)) ||/*[true]*/cmpr_set(pk, data, 94, 4, 4)) ||/*[null]*/cmpr_set(pk, data, 34, 4, 4)) ||/*[<<--]*/cmpr_set(pk, data, 19, 4, 4)) ||/*[break]*/cmpr_set(pk, data, 71, 5, 5)) ||/*[return]*/cmpr_set(pk, data, 76, 6, 6)) ||/*[continue]*/cmpr_set(pk, data, 38, 8, 8)) ||/*[loop]*/cmpr_set(pk, data, 62, 4, 4)) || assert_ascii(pk, 0x0, 0x20000194, 0x88000000, 0x8000000)) || pk.isUniID(data)) || pk.isNum(data)) || pk.isSym(true, data)) || (((dt_a0570d6d5c8952c6(pk, data) ||/*[export]*/cmpr_set(pk, data, 56, 6, 6)) ||/*[mut]*/cmpr_set(pk, data, 116, 3, 3)) ||/*[imut]*/cmpr_set(pk, data, 115, 4, 4))) {
                            /*
                               28:91 left_hand_expression=>member_expression •
                            */
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                            /*28:91 left_hand_expression=>member_expression •*/
                            prod = 28;
                            continue;;
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        } else if (((((((((((((/*[if]*/cmpr_set(pk, data, 142, 2, 2) ||/*[match]*/cmpr_set(pk, data, 66, 5, 5)) || dt_bcea2102060eab13(pk, data)) || dt_6ae31dd85a62ef5c(pk, data)) ||/*[true]*/cmpr_set(pk, data, 94, 4, 4)) ||/*[null]*/cmpr_set(pk, data, 34, 4, 4)) ||/*[<<--]*/cmpr_set(pk, data, 19, 4, 4)) ||/*[break]*/cmpr_set(pk, data, 71, 5, 5)) ||/*[return]*/cmpr_set(pk, data, 76, 6, 6)) ||/*[continue]*/cmpr_set(pk, data, 38, 8, 8)) ||/*[loop]*/cmpr_set(pk, data, 62, 4, 4)) || assert_ascii(pk, 0x0, 0x20000194, 0x88000000, 0x8000000)) || pk.isNum(data)) || pk.isSym(true, data)) {
                            /*
                               37:116 member_expression=>member_expression • [ expression ]
                            */
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                            /*37:116 member_expression=>member_expression • [ expression ]*/
                            consume(l, data, state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                            pushFN(data, branch_47f6df334226208e);
                            pushFN(data, $expression);
                            return 0;
                            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                        } else {
                            /*
                               37:116 member_expression=>member_expression • [ expression ]
                            */
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                            /*37:116 member_expression=>member_expression • [ expression ]*/
                            consume(l, data, state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                            pushFN(data, branch_47f6df334226208e);
                            pushFN(data, $expression);
                            return 0;
                        }
                        /*⤋⤋⤋ assert ⤋⤋⤋*/
                    } else if (l.current_byte == 46/*[.]*/) {
                        /*
                           37:115 member_expression=>member_expression • . identifier
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert ⤋⤋⤋*/
                        /*37:115 member_expression=>member_expression • . identifier*/
                        consume(l, data, state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                        pushFN(data, branch_7cdc3f87dbdf1f7f);
                        pushFN(data, $identifier);
                        return 0;
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    } else if (l.current_byte == 40/*[(]*/) {
                        /*
                           36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                           36:114 call_expression=>member_expression • ( )
                        */
                        /*36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                        36:114 call_expression=>member_expression • ( )*/
                        let pk = l.copy();
                        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, false);
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        if (pk.current_byte == 41/*[)]*/) {
                            /*
                               36:114 call_expression=>member_expression • ( )
                            */
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                            /*36:114 call_expression=>member_expression • ( )*/
                            consume(l, data, state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                            if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
                                add_reduce(state, data, 3, 63);
                                pushFN(data, branch_f557979c122cc8c0);
                                return 26;
                            }
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        } else {
                            /*
                               36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                            */
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                            /*36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )*/
                            consume(l, data, state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                            pushFN(data, branch_a53e7529dd2a9359);
                            pushFN(data, $call_expression_HC_listbody2_114);
                            return 0;
                        }
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    } else {
                        /*
                           28:91 left_hand_expression=>member_expression •
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*28:91 left_hand_expression=>member_expression •*/
                        prod = 28;
                        continue;;
                    }
                    break;
                case 43:
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    /*16:55 parameters=>primitive_declaration •
                    119:336 virtual-330:6:1|--lvl:1=>primitive_declaration • in expression ) expression*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    if (!/*[in]*/cmpr_set(l, data, 42, 2, 2)) {
                        /*
                           16:55 parameters=>primitive_declaration •
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*16:55 parameters=>primitive_declaration •*/
                        add_reduce(state, data, 1, 3);
                        prod = 16;
                        continue;;
                        /*⤋⤋⤋ assert ⤋⤋⤋*/
                    } else if (/*[in]*/cmpr_set(l, data, 42, 2, 2)) {
                        /*
                           119:336 virtual-330:6:1|--lvl:1=>primitive_declaration • in expression ) expression
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert ⤋⤋⤋*/
                        /*119:336 virtual-330:6:1|--lvl:1=>primitive_declaration • in expression ) expression*/
                        consume(l, data, state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                        pushFN(data, branch_f622ff7d2b5a7360);
                        pushFN(data, $expression);
                        return 0;
                    }
                    break;
                case 44:
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    /*37:117 member_expression=>identifier •
                    43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                    43:128 primitive_declaration=>identifier • : type*/
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    if (l.current_byte == 58/*[:]*/) {
                        /*
                           37:117 member_expression=>identifier •
                           43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                           43:128 primitive_declaration=>identifier • : type
                        */
                        /*37:117 member_expression=>identifier •
                        43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                        43:128 primitive_declaration=>identifier • : type*/
                        let pk = l.copy();
                        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, false);
                        switch (sym_map_722a1ff9847f6380(pk, data)) {
                            case 0:
                                /*43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                                43:128 primitive_declaration=>identifier • : type*/
                                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                                consume(l, data, state);
                                /*43:126 primitive_declaration=>identifier : • type primitive_declaration_group_169_116
                                43:128 primitive_declaration=>identifier : • type*/
                                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                                pushFN(data, branch_4cc48863826efbc1);
                                pushFN(data, $type);
                                return 0;
                            default:
                            case 1:
                                /*--LEAF--*/
                                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                                /*37:117 member_expression=>identifier •*/
                                add_reduce(state, data, 1, 66);
                                prod = 37;
                                continue;;
                            case 2:
                                /*-------------VPROD-------------------------*/
                                /*37:117 member_expression=>identifier •
                                43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                                43:128 primitive_declaration=>identifier • : type*/
                                pushFN(data, branch_5bc30bc1f1600300);
                                return 0;
                        }
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    } else {
                        /*
                           37:117 member_expression=>identifier •
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*37:117 member_expression=>identifier •*/
                        add_reduce(state, data, 1, 66);
                        prod = 37;
                        continue;;
                    }
                    break;
                case 50:
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    /*14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
                    14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
                    14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
                    14:50 function_expression=>modifier_list • fn : type ( ) { }
                    43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
                    43:127 primitive_declaration=>modifier_list • identifier : type*/
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    if (/*[fn]*/cmpr_set(l, data, 143, 2, 2)) {
                        /*
                           14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
                           14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
                           14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
                           14:50 function_expression=>modifier_list • fn : type ( ) { }
                        */
                        /*14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
                        14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
                        14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
                        14:50 function_expression=>modifier_list • fn : type ( ) { }*/
                        /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                        consume(l, data, state);
                        /*14:44 function_expression=>modifier_list fn • : type ( parameters ) { expression_statements }
                        14:46 function_expression=>modifier_list fn • : type ( ) { expression_statements }
                        14:47 function_expression=>modifier_list fn • : type ( parameters ) { }
                        14:50 function_expression=>modifier_list fn • : type ( ) { }*/
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                        if (l.current_byte == 58/*[:]*/) {
                            /*
                               14:44 function_expression=>modifier_list fn : • type ( parameters ) { expression_statements }
                               14:46 function_expression=>modifier_list fn : • type ( ) { expression_statements }
                               14:47 function_expression=>modifier_list fn : • type ( parameters ) { }
                               14:50 function_expression=>modifier_list fn : • type ( ) { }
                            */
                            consume(l, data, state);
                            /*14:44 function_expression=>modifier_list fn : • type ( parameters ) { expression_statements }
                            14:46 function_expression=>modifier_list fn : • type ( ) { expression_statements }
                            14:47 function_expression=>modifier_list fn : • type ( parameters ) { }
                            14:50 function_expression=>modifier_list fn : • type ( ) { }*/
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                            pushFN(data, branch_d06ef62b982f7192);
                            pushFN(data, $type);
                            return 0;
                        }
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    } else if (((l.current_byte == 95/*[_]*/) || (l.current_byte == 36/*[$]*/)) || l.isUniID(data)) {
                        /*
                           43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
                           43:127 primitive_declaration=>modifier_list • identifier : type
                        */
                        /*43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
                        43:127 primitive_declaration=>modifier_list • identifier : type*/
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                        pushFN(data, branch_9b47db19a59c28fd);
                        pushFN(data, $identifier);
                        return 0;
                    }
                    break;
            }
            break;
        }
        /*f557979c122cc8c04e2ce3dcb7c2ff69*/
    }
    function branch_f5ea04fd0ffadf55(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
            add_reduce(state, data, 4, 62);
            return 36;
        }
        /*f5ea04fd0ffadf559f31c55bbe834a1a*/
    }
    function branch_f622ff7d2b5a7360(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_4a236324dddf6f01);
            pushFN(data, $expression);
            return 0;
        }
        /*f622ff7d2b5a7360ad61d9e568601fee*/
    }
    function branch_f66e9dbe46e8f961(l, data, state, prod) {
        add_reduce(state, data, 3, 64);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $expression_goto);
        return 37;
        /*f66e9dbe46e8f961f69de95ba4fbadae*/
    }
    function branch_f8424b2f1865a099(l, data, state, prod) {
        /*108:325 virtual-191:3:1|--lvl:0=>operator_HC_listbody1_128 • identifier_token_group_079_119
        109:326 virtual-194:2:1|--lvl:0=>operator_HC_listbody1_128 •*/
        skip_db1786a8af54d666(l/*[ 71 ]*/, data, true);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/) {
            /*
               108:325 virtual-191:3:1|--lvl:0=>operator_HC_listbody1_128 • identifier_token_group_079_119
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*108:325 virtual-191:3:1|--lvl:0=>operator_HC_listbody1_128 • identifier_token_group_079_119*/
            pushFN(data, branch_b45982591ba147c7);
            pushFN(data, $identifier_token_group_079_119);
            return 0;
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*
               109:326 virtual-194:2:1|--lvl:0=>operator_HC_listbody1_128 •
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*109:326 virtual-194:2:1|--lvl:0=>operator_HC_listbody1_128 •*/
            add_reduce(state, data, 2, 90);
            return 65;
        }
        /*f8424b2f1865a099bc0f60d687b8d847*/
    }
    function branch_f91ebab657293c51(l, data, state, prod) {
        add_reduce(state, data, 8, 54);
        /*f91ebab657293c51b3e537c12fd9cc4b*/
    }
    function branch_fad7f40b4be4fcf4(l, data, state, prod) {
        add_reduce(state, data, 5, 72);
        return 43;
        /*fad7f40b4be4fcf4626c382b757114c5*/
    }
    function branch_fae31d7d67e9f5f8(l, data, state, prod) {
        add_reduce(state, data, 1, 87);
        pushFN(data, $def$string_value_HC_listbody2_114_goto);
        return 102;
        /*fae31d7d67e9f5f891c30ef60b6b1bb4*/
    }
    function branch_faf51e1820faf277(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if ((l.current_byte == 125/*[}]*/) && consume(l, data, state)) {
            add_reduce(state, data, 6, 9);
            /*-------------INDIRECT-------------------*/
            pushFN(data, $statements_goto);
            return 4;
        }
        /*faf51e1820faf277d7edf57c330a5c8b*/
    }
    function branch_fbb0ad0f021e53c6(l, data, state, prod) {
        /*13:36 function=>modifier_list fn identifier : type • ( parameters ) { expression_statements }
        13:38 function=>modifier_list fn identifier : type • ( ) { expression_statements }
        13:39 function=>modifier_list fn identifier : type • ( parameters ) { }
        13:42 function=>modifier_list fn identifier : type • ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 40/*[(]*/) {
            /*
               13:36 function=>modifier_list fn identifier : type ( • parameters ) { expression_statements }
               13:38 function=>modifier_list fn identifier : type ( • ) { expression_statements }
               13:39 function=>modifier_list fn identifier : type ( • parameters ) { }
               13:42 function=>modifier_list fn identifier : type ( • ) { }
            */
            consume(l, data, state);
            /*13:36 function=>modifier_list fn identifier : type ( • parameters ) { expression_statements }
            13:39 function=>modifier_list fn identifier : type ( • parameters ) { }
            13:38 function=>modifier_list fn identifier : type ( • ) { expression_statements }
            13:42 function=>modifier_list fn identifier : type ( • ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (l.current_byte == 41/*[)]*/) {
                /*
                   13:38 function=>modifier_list fn identifier : type ( • ) { expression_statements }
                   13:42 function=>modifier_list fn identifier : type ( • ) { }
                */
                /*13:38 function=>modifier_list fn identifier : type ( • ) { expression_statements }
                13:42 function=>modifier_list fn identifier : type ( • ) { }*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l, data, state);
                /*13:38 function=>modifier_list fn identifier : type ( ) • { expression_statements }
                13:42 function=>modifier_list fn identifier : type ( ) • { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                if (l.current_byte == 123/*[{]*/) {
                    /*
                       13:38 function=>modifier_list fn identifier : type ( ) { • expression_statements }
                       13:42 function=>modifier_list fn identifier : type ( ) { • }
                    */
                    consume(l, data, state);
                    /*13:38 function=>modifier_list fn identifier : type ( ) { • expression_statements }
                    13:42 function=>modifier_list fn identifier : type ( ) { • }*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    if (l.current_byte == 125/*[}]*/) {
                        /*
                           13:42 function=>modifier_list fn identifier : type ( ) { • }
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert ⤋⤋⤋*/
                        /*13:42 function=>modifier_list fn identifier : type ( ) { • }*/
                        consume(l, data, state);
                        add_reduce(state, data, 9, 25);
                        /*-------------INDIRECT-------------------*/
                        pushFN(data, $statements_goto);
                        return 4;
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    } else {
                        /*
                           13:38 function=>modifier_list fn identifier : type ( ) { • expression_statements }
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                        /*13:38 function=>modifier_list fn identifier : type ( ) { • expression_statements }*/
                        pushFN(data, branch_9dd2822300e6d441);
                        pushFN(data, $expression_statements);
                        return 0;
                    }
                }
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   13:36 function=>modifier_list fn identifier : type ( • parameters ) { expression_statements }
                   13:39 function=>modifier_list fn identifier : type ( • parameters ) { }
                */
                /*13:36 function=>modifier_list fn identifier : type ( • parameters ) { expression_statements }
                13:39 function=>modifier_list fn identifier : type ( • parameters ) { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                pushFN(data, branch_f2315401e44245fc);
                pushFN(data, $parameters);
                return 0;
            }
        }
        /*fbb0ad0f021e53c687c197e15b17db81*/
    }
    function branch_fc3089e8ba238415(l, data, state, prod) {
        pushFN(data, $class_group_016_104_goto);
        return 9;
        /*fc3089e8ba238415307d1c965288ff81*/
    }
    function branch_fce1e3d0be59e67d(l, data, state, prod) {
        add_reduce(state, data, 3, 64);
        /*-------------INDIRECT-------------------*/
        pushFN(data, $member_expression_goto);
        return 37;
        /*fce1e3d0be59e67d54baac690edd52bd*/
    }
    function dt_1e3f2d5b696b270e(l, data) {
        if (3 == compare(data, l.byte_offset + 0, 46, 3)) {
            if (3 == compare(data, l.byte_offset + 3, 49, 3)) {
                /*string*/
                l.type = TokenSymbol;
                l.byte_length = 6;
                l.token_length = 6;
                return true;
            }
            /*str*/
            l.type = TokenSymbol;
            l.byte_length = 3;
            l.token_length = 3;
            return true;
        }
        return false;
    }
    function dt_1f145d506cf02379(l, data) {
        if (2 == compare(data, l.byte_offset + 0, 16, 2)) {
            /*/**/
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return true;
        } else if (2 == compare(data, l.byte_offset + 0, 111, 2)) {
            /*//*/
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return true;
        }
        return false;
    }
    function dt_2515e70ab3ebd4a1(l, data) {
        if (2 == compare(data, l.byte_offset + 0, 140, 2)) {
            /*is*/
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return true;
        } else if (2 == compare(data, l.byte_offset + 0, 42, 2)) {
            /*in*/
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return true;
        } else if (6 == compare(data, l.byte_offset + 0, 28, 6)) {
            /*import*/
            l.type = TokenSymbol;
            l.byte_length = 6;
            l.token_length = 6;
            return true;
        }
        return false;
    }
    function dt_4a7a9d3748ba691e(l, data) {
        if (4 == compare(data, l.byte_offset + 0, 34, 4)) {
            /*null*/
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            return true;
        } else if (2 == compare(data, l.byte_offset + 0, 119, 2)) {
            /*ns*/
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return true;
        }
        return false;
    }
    function dt_4a896e8627f36237(l, data) {
        if (2 == compare(data, l.byte_offset + 0, 42, 2)) {
            /*in*/
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return true;
        } else if (6 == compare(data, l.byte_offset + 0, 28, 6)) {
            /*import*/
            l.type = TokenSymbol;
            l.byte_length = 6;
            l.token_length = 6;
            return true;
        }
        return false;
    }
    function dt_6ae31dd85a62ef5c(l, data) {
        if (2 == compare(data, l.byte_offset + 0, 26, 2)) {
            /*0x*/
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return true;
        } else if (2 == compare(data, l.byte_offset + 0, 113, 2)) {
            /*0b*/
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return true;
        } else if (2 == compare(data, l.byte_offset + 0, 136, 2)) {
            /*0o*/
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return true;
        } else if (2 == compare(data, l.byte_offset + 0, 138, 2)) {
            /*0O*/
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return true;
        }
        return false;
    }
    function dt_932b61f7da2ee520(l, data) {
        if (2 == compare(data, l.byte_offset + 0, 142, 2)) {
            /*if*/
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return true;
        } else if (2 == compare(data, l.byte_offset + 0, 42, 2)) {
            /*in*/
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return true;
        } else if (6 == compare(data, l.byte_offset + 0, 28, 6)) {
            /*import*/
            l.type = TokenSymbol;
            l.byte_length = 6;
            l.token_length = 6;
            return true;
        }
        return false;
    }
    function dt_a0570d6d5c8952c6(l, data) {
        if (3 == compare(data, l.byte_offset + 0, 133, 3)) {
            /*pub*/
            l.type = TokenSymbol;
            l.byte_length = 3;
            l.token_length = 3;
            return true;
        } else if (4 == compare(data, l.byte_offset + 0, 98, 4)) {
            /*priv*/
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            return true;
        }
        return false;
    }
    function dt_bc3480b75045e0d0(l, data) {
        if (2 == compare(data, l.byte_offset + 0, 136, 2)) {
            /*0o*/
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return true;
        } else if (2 == compare(data, l.byte_offset + 0, 138, 2)) {
            /*0O*/
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return true;
        }
        return false;
    }
    function dt_bcea2102060eab13(l, data) {
        if (2 == compare(data, l.byte_offset + 0, 143, 2)) {
            /*fn*/
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return true;
        } else if (5 == compare(data, l.byte_offset + 0, 52, 5)) {
            /*false*/
            l.type = TokenSymbol;
            l.byte_length = 5;
            l.token_length = 5;
            return true;
        }
        return false;
    }
    function dt_e181bb338a5d8909(l, data) {
        if (8 == compare(data, l.byte_offset + 0, 38, 8)) {
            /*continue*/
            l.type = TokenSymbol;
            l.byte_length = 8;
            l.token_length = 8;
            return true;
        } else if (3 == compare(data, l.byte_offset + 0, 121, 3)) {
            /*cls*/
            l.type = TokenSymbol;
            l.byte_length = 3;
            l.token_length = 3;
            return true;
        }
        return false;
    }
    function nocap_108e16629a73e761(l) {
        let a = l.token_length;
        let b = l.byte_length;
        if (l.isSP(true, data)) {
            l.token_length = a;
            l.byte_length = b;
            return true;
        }
        return false;
    }
    function nocap_9b1ef04606bbaa09(l) {
        let a = l.token_length;
        let b = l.byte_length;
        if (l.isNL()) {
            l.token_length = a;
            l.byte_length = b;
            return true;
        }
        return false;
    }
    function nocap_b2eb52235ee30b8a(l) {
        let a = l.token_length;
        let b = l.byte_length;
        if (l.isNL() || l.isSP(true, data)) {
            l.token_length = a;
            l.byte_length = b;
            return true;
        }
        return false;
    }
    function skip_6c02533b5dc0d802(l, data, APPLY) {
        const off = l.token_offset;
        while (1) {
            if (!(tk_e216f7e76b2d5e60(l, data) || l.isSP(true, data))) {
                break;
            }
            l.next(data);
        }
        if (APPLY) {
            add_skip(l, data, l.token_offset - off);
        }
    }
    function skip_9184d3c96b70653a(l, data, APPLY) {
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
    function skip_a294e41529bc9275(l, data, APPLY) {
        const off = l.token_offset;
        while (1) {
            if (!(tk_e216f7e76b2d5e60(l, data) || l.isNL())) {
                break;
            }
            l.next(data);
        }
        if (APPLY) {
            add_skip(l, data, l.token_offset - off);
        }
    }
    function skip_db1786a8af54d666(l, data, APPLY) {
        const off = l.token_offset;
        while (1) {
            if (!(tk_e216f7e76b2d5e60(l, data))) {
                break;
            }
            l.next(data);
        }
        if (APPLY) {
            add_skip(l, data, l.token_offset - off);
        }
    }
    function sym_map_5724501439696105(l, data) {
        /*if match sym = fn num 0x 0b 0o 0O " ' true false null <<-- ( break return continue loop { id _ $ [*/
        if (data.input[l.byte_offset + 0] == 105) {
            if (data.input[l.byte_offset + 1] == 102) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*if*/
                    l.type = TokenSymbol;
                    l.byte_length = 2;
                    l.token_length = 2;
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 109) {
            if (4 == compare(data, l.byte_offset + 1, 67, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*match*/
                    l.type = TokenSymbol;
                    l.byte_length = 5;
                    l.token_length = 5;
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 61) {
            /*=*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 0;
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*fn*/
                    l.type = TokenSymbol;
                    l.byte_length = 2;
                    l.token_length = 2;
                    return 0;
                }
            } else if (data.input[l.byte_offset + 1] == 97) {
                if (3 == compare(data, l.byte_offset + 2, 54, 3)) {
                    if (l.isDiscrete(data, TokenIdentifier, 5)) {
                        /*false*/
                        l.type = TokenSymbol;
                        l.byte_length = 5;
                        l.token_length = 5;
                        return 0;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 48) {
            if (data.input[l.byte_offset + 1] == 120) {
                /*0x*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 0;
            } else if (data.input[l.byte_offset + 1] == 98) {
                /*0b*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 0;
            } else if (data.input[l.byte_offset + 1] == 111) {
                /*0o*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 0;
            } else if (data.input[l.byte_offset + 1] == 79) {
                /*0O*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 34) {
            /*"*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 0;
        } else if (data.input[l.byte_offset + 0] == 39) {
            /*'*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 0;
        } else if (data.input[l.byte_offset + 0] == 116) {
            if (3 == compare(data, l.byte_offset + 1, 95, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*true*/
                    l.type = TokenSymbol;
                    l.byte_length = 4;
                    l.token_length = 4;
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 110) {
            if (3 == compare(data, l.byte_offset + 1, 35, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*null*/
                    l.type = TokenSymbol;
                    l.byte_length = 4;
                    l.token_length = 4;
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 60) {
            if (3 == compare(data, l.byte_offset + 1, 20, 3)) {
                /*<<--*/
                l.type = TokenSymbol;
                l.byte_length = 4;
                l.token_length = 4;
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 40) {
            /*(*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 0;
        } else if (data.input[l.byte_offset + 0] == 98) {
            if (4 == compare(data, l.byte_offset + 1, 72, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*break*/
                    l.type = TokenSymbol;
                    l.byte_length = 5;
                    l.token_length = 5;
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 114) {
            if (5 == compare(data, l.byte_offset + 1, 77, 5)) {
                if (l.isDiscrete(data, TokenIdentifier, 6)) {
                    /*return*/
                    l.type = TokenSymbol;
                    l.byte_length = 6;
                    l.token_length = 6;
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 99) {
            if (7 == compare(data, l.byte_offset + 1, 39, 7)) {
                if (l.isDiscrete(data, TokenIdentifier, 8)) {
                    /*continue*/
                    l.type = TokenSymbol;
                    l.byte_length = 8;
                    l.token_length = 8;
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 108) {
            if (3 == compare(data, l.byte_offset + 1, 63, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*loop*/
                    l.type = TokenSymbol;
                    l.byte_length = 4;
                    l.token_length = 4;
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 123) {
            /*{*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 0;
        } else if (data.input[l.byte_offset + 0] == 95) {
            /*_*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 36) {
            /*$*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        }
        if (l.isSym(true, data)) {
            return 0;
        } else if (l.isNum(data)) {
            return 0;
        } else if (l.isUniID(data)) {
            return 1;
        }
    }
    function sym_map_5d08f7d316aa60f4(l, data) {
        /*0 1 2 3 4 5 6 7*/
        if (data.input[l.byte_offset + 0] == 48) {
            /*0*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 0;
        } else if (data.input[l.byte_offset + 0] == 49) {
            /*1*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 50) {
            /*2*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 2;
        } else if (data.input[l.byte_offset + 0] == 51) {
            /*3*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 3;
        } else if (data.input[l.byte_offset + 0] == 52) {
            /*4*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 4;
        } else if (data.input[l.byte_offset + 0] == 53) {
            /*5*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 5;
        } else if (data.input[l.byte_offset + 0] == 54) {
            /*6*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 6;
        } else if (data.input[l.byte_offset + 0] == 55) {
            /*7*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 7;
        }
    }
    function sym_map_6086d4345ad4efc2(l, data) {
        /*: else ) ; ] } , in str import cls ns <<-- fn id _ $ [ { if match break return continue loop sym = ( " ' true false null num 0x 0b 0o 0O*/
        if (data.input[l.byte_offset + 0] == 58) {
            /*:*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 0;
        } else if (data.input[l.byte_offset + 0] == 101) {
            if (3 == compare(data, l.byte_offset + 1, 128, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*else*/
                    l.type = TokenSymbol;
                    l.byte_length = 4;
                    l.token_length = 4;
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 41) {
            /*)*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 0;
        } else if (data.input[l.byte_offset + 0] == 59) {
            /*;*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 0;
        } else if (data.input[l.byte_offset + 0] == 93) {
            /*]*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 0;
        } else if (data.input[l.byte_offset + 0] == 125) {
            /*}*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 0;
        } else if (data.input[l.byte_offset + 0] == 44) {
            /*,*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 0;
        } else if (data.input[l.byte_offset + 0] == 105) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*in*/
                    l.type = TokenSymbol;
                    l.byte_length = 2;
                    l.token_length = 2;
                    return 0;
                }
            } else if (data.input[l.byte_offset + 1] == 102) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*if*/
                    l.type = TokenSymbol;
                    l.byte_length = 2;
                    l.token_length = 2;
                    return 2;
                }
            } else if (data.input[l.byte_offset + 1] == 109) {
                if (4 == compare(data, l.byte_offset + 2, 30, 4)) {
                    if (l.isDiscrete(data, TokenIdentifier, 6)) {
                        /*import*/
                        l.type = TokenSymbol;
                        l.byte_length = 6;
                        l.token_length = 6;
                        return 0;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 115) {
            if (2 == compare(data, l.byte_offset + 1, 47, 2)) {
                if (l.isDiscrete(data, TokenIdentifier, 3)) {
                    /*str*/
                    l.type = TokenSymbol;
                    l.byte_length = 3;
                    l.token_length = 3;
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 99) {
            if (data.input[l.byte_offset + 1] == 108) {
                if (data.input[l.byte_offset + 2] == 115) {
                    if (l.isDiscrete(data, TokenIdentifier, 3)) {
                        /*cls*/
                        l.type = TokenSymbol;
                        l.byte_length = 3;
                        l.token_length = 3;
                        return 0;
                    }
                }
            } else if (data.input[l.byte_offset + 1] == 111) {
                if (6 == compare(data, l.byte_offset + 2, 40, 6)) {
                    if (l.isDiscrete(data, TokenIdentifier, 8)) {
                        /*continue*/
                        l.type = TokenSymbol;
                        l.byte_length = 8;
                        l.token_length = 8;
                        return 2;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 110) {
            if (data.input[l.byte_offset + 1] == 115) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*ns*/
                    l.type = TokenSymbol;
                    l.byte_length = 2;
                    l.token_length = 2;
                    return 0;
                }
            } else if (data.input[l.byte_offset + 1] == 117) {
                if (2 == compare(data, l.byte_offset + 2, 36, 2)) {
                    if (l.isDiscrete(data, TokenIdentifier, 4)) {
                        /*null*/
                        l.type = TokenSymbol;
                        l.byte_length = 4;
                        l.token_length = 4;
                        return 2;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 60) {
            if (3 == compare(data, l.byte_offset + 1, 20, 3)) {
                /*<<--*/
                l.type = TokenSymbol;
                l.byte_length = 4;
                l.token_length = 4;
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*fn*/
                    l.type = TokenSymbol;
                    l.byte_length = 2;
                    l.token_length = 2;
                    return 1;
                }
            } else if (data.input[l.byte_offset + 1] == 97) {
                if (3 == compare(data, l.byte_offset + 2, 54, 3)) {
                    if (l.isDiscrete(data, TokenIdentifier, 5)) {
                        /*false*/
                        l.type = TokenSymbol;
                        l.byte_length = 5;
                        l.token_length = 5;
                        return 2;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 95) {
            /*_*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 36) {
            /*$*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 123) {
            /*{*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 2;
        } else if (data.input[l.byte_offset + 0] == 109) {
            if (4 == compare(data, l.byte_offset + 1, 67, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*match*/
                    l.type = TokenSymbol;
                    l.byte_length = 5;
                    l.token_length = 5;
                    return 2;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 98) {
            if (4 == compare(data, l.byte_offset + 1, 72, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*break*/
                    l.type = TokenSymbol;
                    l.byte_length = 5;
                    l.token_length = 5;
                    return 2;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 114) {
            if (5 == compare(data, l.byte_offset + 1, 77, 5)) {
                if (l.isDiscrete(data, TokenIdentifier, 6)) {
                    /*return*/
                    l.type = TokenSymbol;
                    l.byte_length = 6;
                    l.token_length = 6;
                    return 2;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 108) {
            if (3 == compare(data, l.byte_offset + 1, 63, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*loop*/
                    l.type = TokenSymbol;
                    l.byte_length = 4;
                    l.token_length = 4;
                    return 2;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 61) {
            /*=*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 2;
        } else if (data.input[l.byte_offset + 0] == 40) {
            /*(*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 2;
        } else if (data.input[l.byte_offset + 0] == 34) {
            /*"*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 2;
        } else if (data.input[l.byte_offset + 0] == 39) {
            /*'*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 2;
        } else if (data.input[l.byte_offset + 0] == 116) {
            if (3 == compare(data, l.byte_offset + 1, 95, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*true*/
                    l.type = TokenSymbol;
                    l.byte_length = 4;
                    l.token_length = 4;
                    return 2;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 48) {
            if (data.input[l.byte_offset + 1] == 120) {
                /*0x*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 2;
            } else if (data.input[l.byte_offset + 1] == 98) {
                /*0b*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 2;
            } else if (data.input[l.byte_offset + 1] == 111) {
                /*0o*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 2;
            } else if (data.input[l.byte_offset + 1] == 79) {
                /*0O*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 2;
            }
        }
        if (l.isUniID(data)) {
            return 1;
        } else if (l.isSym(true, data)) {
            return 2;
        } else if (l.isNum(data)) {
            return 2;
        }
    }
    function sym_map_6e7f87b3c415ac34(l, data) {
        /*if match sym = fn num 0x 0b 0o 0O " ' true false null <<-- ( break return continue loop { ) id _ $ [*/
        if (data.input[l.byte_offset + 0] == 105) {
            if (data.input[l.byte_offset + 1] == 102) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*if*/
                    l.type = TokenSymbol;
                    l.byte_length = 2;
                    l.token_length = 2;
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 109) {
            if (4 == compare(data, l.byte_offset + 1, 67, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*match*/
                    l.type = TokenSymbol;
                    l.byte_length = 5;
                    l.token_length = 5;
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 61) {
            /*=*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 0;
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*fn*/
                    l.type = TokenSymbol;
                    l.byte_length = 2;
                    l.token_length = 2;
                    return 0;
                }
            } else if (data.input[l.byte_offset + 1] == 97) {
                if (3 == compare(data, l.byte_offset + 2, 54, 3)) {
                    if (l.isDiscrete(data, TokenIdentifier, 5)) {
                        /*false*/
                        l.type = TokenSymbol;
                        l.byte_length = 5;
                        l.token_length = 5;
                        return 0;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 48) {
            if (data.input[l.byte_offset + 1] == 120) {
                /*0x*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 0;
            } else if (data.input[l.byte_offset + 1] == 98) {
                /*0b*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 0;
            } else if (data.input[l.byte_offset + 1] == 111) {
                /*0o*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 0;
            } else if (data.input[l.byte_offset + 1] == 79) {
                /*0O*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 34) {
            /*"*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 0;
        } else if (data.input[l.byte_offset + 0] == 39) {
            /*'*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 0;
        } else if (data.input[l.byte_offset + 0] == 116) {
            if (3 == compare(data, l.byte_offset + 1, 95, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*true*/
                    l.type = TokenSymbol;
                    l.byte_length = 4;
                    l.token_length = 4;
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 110) {
            if (3 == compare(data, l.byte_offset + 1, 35, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*null*/
                    l.type = TokenSymbol;
                    l.byte_length = 4;
                    l.token_length = 4;
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 60) {
            if (3 == compare(data, l.byte_offset + 1, 20, 3)) {
                /*<<--*/
                l.type = TokenSymbol;
                l.byte_length = 4;
                l.token_length = 4;
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 40) {
            /*(*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 0;
        } else if (data.input[l.byte_offset + 0] == 98) {
            if (4 == compare(data, l.byte_offset + 1, 72, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*break*/
                    l.type = TokenSymbol;
                    l.byte_length = 5;
                    l.token_length = 5;
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 114) {
            if (5 == compare(data, l.byte_offset + 1, 77, 5)) {
                if (l.isDiscrete(data, TokenIdentifier, 6)) {
                    /*return*/
                    l.type = TokenSymbol;
                    l.byte_length = 6;
                    l.token_length = 6;
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 99) {
            if (7 == compare(data, l.byte_offset + 1, 39, 7)) {
                if (l.isDiscrete(data, TokenIdentifier, 8)) {
                    /*continue*/
                    l.type = TokenSymbol;
                    l.byte_length = 8;
                    l.token_length = 8;
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 108) {
            if (3 == compare(data, l.byte_offset + 1, 63, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*loop*/
                    l.type = TokenSymbol;
                    l.byte_length = 4;
                    l.token_length = 4;
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 123) {
            /*{*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 0;
        } else if (data.input[l.byte_offset + 0] == 41) {
            /*)*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 0;
        } else if (data.input[l.byte_offset + 0] == 95) {
            /*_*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 36) {
            /*$*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        }
        if (l.isSym(true, data)) {
            return 0;
        } else if (l.isNum(data)) {
            return 0;
        } else if (l.isUniID(data)) {
            return 1;
        }
    }
    function sym_map_722a1ff9847f6380(l, data) {
        /*u i uint int f flt string if match sym = [ fn num 0x 0b 0o 0O " ' true false null <<-- ( break return continue loop { : else ) ; ] } , in import cls ns id _ $ str*/
        if (data.input[l.byte_offset + 0] == 117) {
            if (l.isDiscrete(data, TokenIdentifier, 1)) {
                if (data.input[l.byte_offset + 1] == 105) {
                    if (2 == compare(data, l.byte_offset + 2, 84, 2)) {
                        if (l.isDiscrete(data, TokenIdentifier, 4)) {
                            /*uint*/
                            l.type = TokenSymbol;
                            l.byte_length = 4;
                            l.token_length = 4;
                            return 0;
                        }
                    }
                }
                /*u*/
                l.type = TokenSymbol;
                l.byte_length = 1;
                l.token_length = 1;
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 105) {
            if (l.isDiscrete(data, TokenIdentifier, 1)) {
                if (data.input[l.byte_offset + 1] == 102) {
                    if (l.isDiscrete(data, TokenIdentifier, 2)) {
                        /*if*/
                        l.type = TokenSymbol;
                        l.byte_length = 2;
                        l.token_length = 2;
                        return 1;
                    }
                } else if (data.input[l.byte_offset + 1] == 110) {
                    if (l.isDiscrete(data, TokenIdentifier, 2)) {
                        if (data.input[l.byte_offset + 2] == 116) {
                            if (l.isDiscrete(data, TokenIdentifier, 3)) {
                                /*int*/
                                l.type = TokenSymbol;
                                l.byte_length = 3;
                                l.token_length = 3;
                                return 0;
                            }
                        }
                        /*in*/
                        l.type = TokenSymbol;
                        l.byte_length = 2;
                        l.token_length = 2;
                        return 1;
                    }
                } else if (data.input[l.byte_offset + 1] == 109) {
                    if (4 == compare(data, l.byte_offset + 2, 30, 4)) {
                        if (l.isDiscrete(data, TokenIdentifier, 6)) {
                            /*import*/
                            l.type = TokenSymbol;
                            l.byte_length = 6;
                            l.token_length = 6;
                            return 1;
                        }
                    }
                }
                /*i*/
                l.type = TokenSymbol;
                l.byte_length = 1;
                l.token_length = 1;
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (l.isDiscrete(data, TokenIdentifier, 1)) {
                if (data.input[l.byte_offset + 1] == 110) {
                    if (l.isDiscrete(data, TokenIdentifier, 2)) {
                        /*fn*/
                        l.type = TokenSymbol;
                        l.byte_length = 2;
                        l.token_length = 2;
                        return 1;
                    }
                } else if (data.input[l.byte_offset + 1] == 108) {
                    if (data.input[l.byte_offset + 2] == 116) {
                        if (l.isDiscrete(data, TokenIdentifier, 3)) {
                            /*flt*/
                            l.type = TokenSymbol;
                            l.byte_length = 3;
                            l.token_length = 3;
                            return 0;
                        }
                    }
                } else if (data.input[l.byte_offset + 1] == 97) {
                    if (3 == compare(data, l.byte_offset + 2, 54, 3)) {
                        if (l.isDiscrete(data, TokenIdentifier, 5)) {
                            /*false*/
                            l.type = TokenSymbol;
                            l.byte_length = 5;
                            l.token_length = 5;
                            return 1;
                        }
                    }
                }
                /*f*/
                l.type = TokenSymbol;
                l.byte_length = 1;
                l.token_length = 1;
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 115) {
            if (data.input[l.byte_offset + 1] == 116) {
                if (data.input[l.byte_offset + 2] == 114) {
                    if (l.isDiscrete(data, TokenIdentifier, 3)) {
                        if (data.input[l.byte_offset + 3] == 105) {
                            if (2 == compare(data, l.byte_offset + 4, 50, 2)) {
                                if (l.isDiscrete(data, TokenIdentifier, 6)) {
                                    /*string*/
                                    l.type = TokenSymbol;
                                    l.byte_length = 6;
                                    l.token_length = 6;
                                    return 0;
                                }
                            }
                        }
                        /*str*/
                        l.type = TokenSymbol;
                        l.byte_length = 3;
                        l.token_length = 3;
                        return 2;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 109) {
            if (4 == compare(data, l.byte_offset + 1, 67, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*match*/
                    l.type = TokenSymbol;
                    l.byte_length = 5;
                    l.token_length = 5;
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 61) {
            /*=*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 48) {
            if (data.input[l.byte_offset + 1] == 120) {
                /*0x*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 1;
            } else if (data.input[l.byte_offset + 1] == 98) {
                /*0b*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 1;
            } else if (data.input[l.byte_offset + 1] == 111) {
                /*0o*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 1;
            } else if (data.input[l.byte_offset + 1] == 79) {
                /*0O*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 34) {
            /*"*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 39) {
            /*'*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 116) {
            if (3 == compare(data, l.byte_offset + 1, 95, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*true*/
                    l.type = TokenSymbol;
                    l.byte_length = 4;
                    l.token_length = 4;
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 110) {
            if (data.input[l.byte_offset + 1] == 115) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*ns*/
                    l.type = TokenSymbol;
                    l.byte_length = 2;
                    l.token_length = 2;
                    return 1;
                }
            } else if (data.input[l.byte_offset + 1] == 117) {
                if (2 == compare(data, l.byte_offset + 2, 36, 2)) {
                    if (l.isDiscrete(data, TokenIdentifier, 4)) {
                        /*null*/
                        l.type = TokenSymbol;
                        l.byte_length = 4;
                        l.token_length = 4;
                        return 1;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 60) {
            if (3 == compare(data, l.byte_offset + 1, 20, 3)) {
                /*<<--*/
                l.type = TokenSymbol;
                l.byte_length = 4;
                l.token_length = 4;
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 40) {
            /*(*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 98) {
            if (4 == compare(data, l.byte_offset + 1, 72, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*break*/
                    l.type = TokenSymbol;
                    l.byte_length = 5;
                    l.token_length = 5;
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 114) {
            if (5 == compare(data, l.byte_offset + 1, 77, 5)) {
                if (l.isDiscrete(data, TokenIdentifier, 6)) {
                    /*return*/
                    l.type = TokenSymbol;
                    l.byte_length = 6;
                    l.token_length = 6;
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 99) {
            if (data.input[l.byte_offset + 1] == 108) {
                if (data.input[l.byte_offset + 2] == 115) {
                    if (l.isDiscrete(data, TokenIdentifier, 3)) {
                        /*cls*/
                        l.type = TokenSymbol;
                        l.byte_length = 3;
                        l.token_length = 3;
                        return 1;
                    }
                }
            } else if (data.input[l.byte_offset + 1] == 111) {
                if (6 == compare(data, l.byte_offset + 2, 40, 6)) {
                    if (l.isDiscrete(data, TokenIdentifier, 8)) {
                        /*continue*/
                        l.type = TokenSymbol;
                        l.byte_length = 8;
                        l.token_length = 8;
                        return 1;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 108) {
            if (3 == compare(data, l.byte_offset + 1, 63, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*loop*/
                    l.type = TokenSymbol;
                    l.byte_length = 4;
                    l.token_length = 4;
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 123) {
            /*{*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 58) {
            /*:*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 101) {
            if (3 == compare(data, l.byte_offset + 1, 128, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*else*/
                    l.type = TokenSymbol;
                    l.byte_length = 4;
                    l.token_length = 4;
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 41) {
            /*)*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 59) {
            /*;*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 93) {
            /*]*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 125) {
            /*}*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 44) {
            /*,*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 95) {
            /*_*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 2;
        } else if (data.input[l.byte_offset + 0] == 36) {
            /*$*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 2;
        }
        if (l.isSym(true, data)) {
            return 1;
        } else if (l.isNum(data)) {
            return 1;
        } else if (l.isUniID(data)) {
            return 2;
        }
    }
    function sym_map_7627bccd5d23a320(l, data) {
        /*u i uint int f flt string if match sym = [ fn num 0x 0b 0o 0O " ' true false null <<-- ( break return continue loop { ] : ; ) else in } , import cls ns id _ $ str*/
        if (data.input[l.byte_offset + 0] == 117) {
            if (l.isDiscrete(data, TokenIdentifier, 1)) {
                if (data.input[l.byte_offset + 1] == 105) {
                    if (2 == compare(data, l.byte_offset + 2, 84, 2)) {
                        if (l.isDiscrete(data, TokenIdentifier, 4)) {
                            /*uint*/
                            l.type = TokenSymbol;
                            l.byte_length = 4;
                            l.token_length = 4;
                            return 0;
                        }
                    }
                }
                /*u*/
                l.type = TokenSymbol;
                l.byte_length = 1;
                l.token_length = 1;
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 105) {
            if (l.isDiscrete(data, TokenIdentifier, 1)) {
                if (data.input[l.byte_offset + 1] == 102) {
                    if (l.isDiscrete(data, TokenIdentifier, 2)) {
                        /*if*/
                        l.type = TokenSymbol;
                        l.byte_length = 2;
                        l.token_length = 2;
                        return 1;
                    }
                } else if (data.input[l.byte_offset + 1] == 110) {
                    if (l.isDiscrete(data, TokenIdentifier, 2)) {
                        if (data.input[l.byte_offset + 2] == 116) {
                            if (l.isDiscrete(data, TokenIdentifier, 3)) {
                                /*int*/
                                l.type = TokenSymbol;
                                l.byte_length = 3;
                                l.token_length = 3;
                                return 0;
                            }
                        }
                        /*in*/
                        l.type = TokenSymbol;
                        l.byte_length = 2;
                        l.token_length = 2;
                        return 1;
                    }
                } else if (data.input[l.byte_offset + 1] == 109) {
                    if (4 == compare(data, l.byte_offset + 2, 30, 4)) {
                        if (l.isDiscrete(data, TokenIdentifier, 6)) {
                            /*import*/
                            l.type = TokenSymbol;
                            l.byte_length = 6;
                            l.token_length = 6;
                            return 1;
                        }
                    }
                }
                /*i*/
                l.type = TokenSymbol;
                l.byte_length = 1;
                l.token_length = 1;
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (l.isDiscrete(data, TokenIdentifier, 1)) {
                if (data.input[l.byte_offset + 1] == 110) {
                    if (l.isDiscrete(data, TokenIdentifier, 2)) {
                        /*fn*/
                        l.type = TokenSymbol;
                        l.byte_length = 2;
                        l.token_length = 2;
                        return 1;
                    }
                } else if (data.input[l.byte_offset + 1] == 108) {
                    if (data.input[l.byte_offset + 2] == 116) {
                        if (l.isDiscrete(data, TokenIdentifier, 3)) {
                            /*flt*/
                            l.type = TokenSymbol;
                            l.byte_length = 3;
                            l.token_length = 3;
                            return 0;
                        }
                    }
                } else if (data.input[l.byte_offset + 1] == 97) {
                    if (3 == compare(data, l.byte_offset + 2, 54, 3)) {
                        if (l.isDiscrete(data, TokenIdentifier, 5)) {
                            /*false*/
                            l.type = TokenSymbol;
                            l.byte_length = 5;
                            l.token_length = 5;
                            return 1;
                        }
                    }
                }
                /*f*/
                l.type = TokenSymbol;
                l.byte_length = 1;
                l.token_length = 1;
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 115) {
            if (data.input[l.byte_offset + 1] == 116) {
                if (data.input[l.byte_offset + 2] == 114) {
                    if (l.isDiscrete(data, TokenIdentifier, 3)) {
                        if (data.input[l.byte_offset + 3] == 105) {
                            if (2 == compare(data, l.byte_offset + 4, 50, 2)) {
                                if (l.isDiscrete(data, TokenIdentifier, 6)) {
                                    /*string*/
                                    l.type = TokenSymbol;
                                    l.byte_length = 6;
                                    l.token_length = 6;
                                    return 0;
                                }
                            }
                        }
                        /*str*/
                        l.type = TokenSymbol;
                        l.byte_length = 3;
                        l.token_length = 3;
                        return 2;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 109) {
            if (4 == compare(data, l.byte_offset + 1, 67, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*match*/
                    l.type = TokenSymbol;
                    l.byte_length = 5;
                    l.token_length = 5;
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 61) {
            /*=*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 48) {
            if (data.input[l.byte_offset + 1] == 120) {
                /*0x*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 1;
            } else if (data.input[l.byte_offset + 1] == 98) {
                /*0b*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 1;
            } else if (data.input[l.byte_offset + 1] == 111) {
                /*0o*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 1;
            } else if (data.input[l.byte_offset + 1] == 79) {
                /*0O*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 34) {
            /*"*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 39) {
            /*'*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 116) {
            if (3 == compare(data, l.byte_offset + 1, 95, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*true*/
                    l.type = TokenSymbol;
                    l.byte_length = 4;
                    l.token_length = 4;
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 110) {
            if (data.input[l.byte_offset + 1] == 115) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*ns*/
                    l.type = TokenSymbol;
                    l.byte_length = 2;
                    l.token_length = 2;
                    return 1;
                }
            } else if (data.input[l.byte_offset + 1] == 117) {
                if (2 == compare(data, l.byte_offset + 2, 36, 2)) {
                    if (l.isDiscrete(data, TokenIdentifier, 4)) {
                        /*null*/
                        l.type = TokenSymbol;
                        l.byte_length = 4;
                        l.token_length = 4;
                        return 1;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 60) {
            if (3 == compare(data, l.byte_offset + 1, 20, 3)) {
                /*<<--*/
                l.type = TokenSymbol;
                l.byte_length = 4;
                l.token_length = 4;
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 40) {
            /*(*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 98) {
            if (4 == compare(data, l.byte_offset + 1, 72, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*break*/
                    l.type = TokenSymbol;
                    l.byte_length = 5;
                    l.token_length = 5;
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 114) {
            if (5 == compare(data, l.byte_offset + 1, 77, 5)) {
                if (l.isDiscrete(data, TokenIdentifier, 6)) {
                    /*return*/
                    l.type = TokenSymbol;
                    l.byte_length = 6;
                    l.token_length = 6;
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 99) {
            if (data.input[l.byte_offset + 1] == 108) {
                if (data.input[l.byte_offset + 2] == 115) {
                    if (l.isDiscrete(data, TokenIdentifier, 3)) {
                        /*cls*/
                        l.type = TokenSymbol;
                        l.byte_length = 3;
                        l.token_length = 3;
                        return 1;
                    }
                }
            } else if (data.input[l.byte_offset + 1] == 111) {
                if (6 == compare(data, l.byte_offset + 2, 40, 6)) {
                    if (l.isDiscrete(data, TokenIdentifier, 8)) {
                        /*continue*/
                        l.type = TokenSymbol;
                        l.byte_length = 8;
                        l.token_length = 8;
                        return 1;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 108) {
            if (3 == compare(data, l.byte_offset + 1, 63, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*loop*/
                    l.type = TokenSymbol;
                    l.byte_length = 4;
                    l.token_length = 4;
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 123) {
            /*{*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 93) {
            /*]*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 58) {
            /*:*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 59) {
            /*;*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 41) {
            /*)*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 101) {
            if (3 == compare(data, l.byte_offset + 1, 128, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*else*/
                    l.type = TokenSymbol;
                    l.byte_length = 4;
                    l.token_length = 4;
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 125) {
            /*}*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 44) {
            /*,*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 95) {
            /*_*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 2;
        } else if (data.input[l.byte_offset + 0] == 36) {
            /*$*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 2;
        }
        if (l.isSym(true, data)) {
            return 1;
        } else if (l.isNum(data)) {
            return 1;
        } else if (l.isUniID(data)) {
            return 2;
        }
    }
    function sym_map_9af7659b5c440478(l, data) {
        /*<<-- { if match break return continue loop id _ $ sym = [ fn num 0x 0b 0o 0O " ' true false null (*/
        if (data.input[l.byte_offset + 0] == 60) {
            if (3 == compare(data, l.byte_offset + 1, 20, 3)) {
                /*<<--*/
                l.type = TokenSymbol;
                l.byte_length = 4;
                l.token_length = 4;
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 123) {
            /*{*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 105) {
            if (data.input[l.byte_offset + 1] == 102) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*if*/
                    l.type = TokenSymbol;
                    l.byte_length = 2;
                    l.token_length = 2;
                    return 2;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 109) {
            if (4 == compare(data, l.byte_offset + 1, 67, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*match*/
                    l.type = TokenSymbol;
                    l.byte_length = 5;
                    l.token_length = 5;
                    return 3;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 98) {
            if (4 == compare(data, l.byte_offset + 1, 72, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*break*/
                    l.type = TokenSymbol;
                    l.byte_length = 5;
                    l.token_length = 5;
                    return 4;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 114) {
            if (5 == compare(data, l.byte_offset + 1, 77, 5)) {
                if (l.isDiscrete(data, TokenIdentifier, 6)) {
                    /*return*/
                    l.type = TokenSymbol;
                    l.byte_length = 6;
                    l.token_length = 6;
                    return 5;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 99) {
            if (7 == compare(data, l.byte_offset + 1, 39, 7)) {
                if (l.isDiscrete(data, TokenIdentifier, 8)) {
                    /*continue*/
                    l.type = TokenSymbol;
                    l.byte_length = 8;
                    l.token_length = 8;
                    return 6;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 108) {
            if (3 == compare(data, l.byte_offset + 1, 63, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*loop*/
                    l.type = TokenSymbol;
                    l.byte_length = 4;
                    l.token_length = 4;
                    return 7;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 95) {
            /*_*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 8;
        } else if (data.input[l.byte_offset + 0] == 36) {
            /*$*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 8;
        } else if (data.input[l.byte_offset + 0] == 61) {
            /*=*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 9;
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 9;
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*fn*/
                    l.type = TokenSymbol;
                    l.byte_length = 2;
                    l.token_length = 2;
                    return 9;
                }
            } else if (data.input[l.byte_offset + 1] == 97) {
                if (3 == compare(data, l.byte_offset + 2, 54, 3)) {
                    if (l.isDiscrete(data, TokenIdentifier, 5)) {
                        /*false*/
                        l.type = TokenSymbol;
                        l.byte_length = 5;
                        l.token_length = 5;
                        return 9;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 48) {
            if (data.input[l.byte_offset + 1] == 120) {
                /*0x*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 9;
            } else if (data.input[l.byte_offset + 1] == 98) {
                /*0b*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 9;
            } else if (data.input[l.byte_offset + 1] == 111) {
                /*0o*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 9;
            } else if (data.input[l.byte_offset + 1] == 79) {
                /*0O*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 9;
            }
        } else if (data.input[l.byte_offset + 0] == 34) {
            /*"*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 9;
        } else if (data.input[l.byte_offset + 0] == 39) {
            /*'*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 9;
        } else if (data.input[l.byte_offset + 0] == 116) {
            if (3 == compare(data, l.byte_offset + 1, 95, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*true*/
                    l.type = TokenSymbol;
                    l.byte_length = 4;
                    l.token_length = 4;
                    return 9;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 110) {
            if (3 == compare(data, l.byte_offset + 1, 35, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*null*/
                    l.type = TokenSymbol;
                    l.byte_length = 4;
                    l.token_length = 4;
                    return 9;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 40) {
            /*(*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 9;
        }
        if (l.isUniID(data)) {
            return 8;
        } else if (l.isSym(true, data)) {
            return 9;
        } else if (l.isNum(data)) {
            return 9;
        }
    }
    function sym_map_ad191553025cd3be(l, data) {
        /*: else ) ; ] } , in str import cls ns if match sym = num 0x 0b 0o 0O " ' true false null ( break return continue loop { [ id _ $ fn <<--*/
        if (data.input[l.byte_offset + 0] == 58) {
            /*:*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 0;
        } else if (data.input[l.byte_offset + 0] == 101) {
            if (3 == compare(data, l.byte_offset + 1, 128, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*else*/
                    l.type = TokenSymbol;
                    l.byte_length = 4;
                    l.token_length = 4;
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 41) {
            /*)*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 0;
        } else if (data.input[l.byte_offset + 0] == 59) {
            /*;*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 0;
        } else if (data.input[l.byte_offset + 0] == 93) {
            /*]*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 0;
        } else if (data.input[l.byte_offset + 0] == 125) {
            /*}*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 0;
        } else if (data.input[l.byte_offset + 0] == 44) {
            /*,*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 0;
        } else if (data.input[l.byte_offset + 0] == 105) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*in*/
                    l.type = TokenSymbol;
                    l.byte_length = 2;
                    l.token_length = 2;
                    return 0;
                }
            } else if (data.input[l.byte_offset + 1] == 102) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*if*/
                    l.type = TokenSymbol;
                    l.byte_length = 2;
                    l.token_length = 2;
                    return 1;
                }
            } else if (data.input[l.byte_offset + 1] == 109) {
                if (4 == compare(data, l.byte_offset + 2, 30, 4)) {
                    if (l.isDiscrete(data, TokenIdentifier, 6)) {
                        /*import*/
                        l.type = TokenSymbol;
                        l.byte_length = 6;
                        l.token_length = 6;
                        return 0;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 115) {
            if (2 == compare(data, l.byte_offset + 1, 47, 2)) {
                if (l.isDiscrete(data, TokenIdentifier, 3)) {
                    /*str*/
                    l.type = TokenSymbol;
                    l.byte_length = 3;
                    l.token_length = 3;
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 99) {
            if (data.input[l.byte_offset + 1] == 108) {
                if (data.input[l.byte_offset + 2] == 115) {
                    if (l.isDiscrete(data, TokenIdentifier, 3)) {
                        /*cls*/
                        l.type = TokenSymbol;
                        l.byte_length = 3;
                        l.token_length = 3;
                        return 0;
                    }
                }
            } else if (data.input[l.byte_offset + 1] == 111) {
                if (6 == compare(data, l.byte_offset + 2, 40, 6)) {
                    if (l.isDiscrete(data, TokenIdentifier, 8)) {
                        /*continue*/
                        l.type = TokenSymbol;
                        l.byte_length = 8;
                        l.token_length = 8;
                        return 1;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 110) {
            if (data.input[l.byte_offset + 1] == 115) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*ns*/
                    l.type = TokenSymbol;
                    l.byte_length = 2;
                    l.token_length = 2;
                    return 0;
                }
            } else if (data.input[l.byte_offset + 1] == 117) {
                if (2 == compare(data, l.byte_offset + 2, 36, 2)) {
                    if (l.isDiscrete(data, TokenIdentifier, 4)) {
                        /*null*/
                        l.type = TokenSymbol;
                        l.byte_length = 4;
                        l.token_length = 4;
                        return 1;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 109) {
            if (4 == compare(data, l.byte_offset + 1, 67, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*match*/
                    l.type = TokenSymbol;
                    l.byte_length = 5;
                    l.token_length = 5;
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 61) {
            /*=*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 48) {
            if (data.input[l.byte_offset + 1] == 120) {
                /*0x*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 1;
            } else if (data.input[l.byte_offset + 1] == 98) {
                /*0b*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 1;
            } else if (data.input[l.byte_offset + 1] == 111) {
                /*0o*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 1;
            } else if (data.input[l.byte_offset + 1] == 79) {
                /*0O*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 34) {
            /*"*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 39) {
            /*'*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 116) {
            if (3 == compare(data, l.byte_offset + 1, 95, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*true*/
                    l.type = TokenSymbol;
                    l.byte_length = 4;
                    l.token_length = 4;
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*fn*/
                    l.type = TokenSymbol;
                    l.byte_length = 2;
                    l.token_length = 2;
                    return 2;
                }
            } else if (data.input[l.byte_offset + 1] == 97) {
                if (3 == compare(data, l.byte_offset + 2, 54, 3)) {
                    if (l.isDiscrete(data, TokenIdentifier, 5)) {
                        /*false*/
                        l.type = TokenSymbol;
                        l.byte_length = 5;
                        l.token_length = 5;
                        return 1;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 40) {
            /*(*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 98) {
            if (4 == compare(data, l.byte_offset + 1, 72, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*break*/
                    l.type = TokenSymbol;
                    l.byte_length = 5;
                    l.token_length = 5;
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 114) {
            if (5 == compare(data, l.byte_offset + 1, 77, 5)) {
                if (l.isDiscrete(data, TokenIdentifier, 6)) {
                    /*return*/
                    l.type = TokenSymbol;
                    l.byte_length = 6;
                    l.token_length = 6;
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 108) {
            if (3 == compare(data, l.byte_offset + 1, 63, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*loop*/
                    l.type = TokenSymbol;
                    l.byte_length = 4;
                    l.token_length = 4;
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 123) {
            /*{*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 2;
        } else if (data.input[l.byte_offset + 0] == 95) {
            /*_*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 2;
        } else if (data.input[l.byte_offset + 0] == 36) {
            /*$*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 2;
        } else if (data.input[l.byte_offset + 0] == 60) {
            if (3 == compare(data, l.byte_offset + 1, 20, 3)) {
                /*<<--*/
                l.type = TokenSymbol;
                l.byte_length = 4;
                l.token_length = 4;
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
    function sym_map_bcb6538966fe2bad(l, data) {
        /*num a b c d e f A B C D E F*/
        if (data.input[l.byte_offset + 0] == 97) {
            /*a*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 98) {
            /*b*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 2;
        } else if (data.input[l.byte_offset + 0] == 99) {
            /*c*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 3;
        } else if (data.input[l.byte_offset + 0] == 100) {
            /*d*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 4;
        } else if (data.input[l.byte_offset + 0] == 101) {
            /*e*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 5;
        } else if (data.input[l.byte_offset + 0] == 102) {
            /*f*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 6;
        } else if (data.input[l.byte_offset + 0] == 65) {
            /*A*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 7;
        } else if (data.input[l.byte_offset + 0] == 66) {
            /*B*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 8;
        } else if (data.input[l.byte_offset + 0] == 67) {
            /*C*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 9;
        } else if (data.input[l.byte_offset + 0] == 68) {
            /*D*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 10;
        } else if (data.input[l.byte_offset + 0] == 69) {
            /*E*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 11;
        } else if (data.input[l.byte_offset + 0] == 70) {
            /*F*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 12;
        }
        if (l.isNum(data)) {
            return 0;
        }
    }
    function sym_map_c75b750e9764b157(l, data) {
        /*; if match sym = fn num 0x 0b 0o 0O " ' true false null <<-- ( break return continue loop { ) id _ $ [*/
        if (data.input[l.byte_offset + 0] == 59) {
            /*;*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 0;
        } else if (data.input[l.byte_offset + 0] == 105) {
            if (data.input[l.byte_offset + 1] == 102) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*if*/
                    l.type = TokenSymbol;
                    l.byte_length = 2;
                    l.token_length = 2;
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 109) {
            if (4 == compare(data, l.byte_offset + 1, 67, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*match*/
                    l.type = TokenSymbol;
                    l.byte_length = 5;
                    l.token_length = 5;
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 61) {
            /*=*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*fn*/
                    l.type = TokenSymbol;
                    l.byte_length = 2;
                    l.token_length = 2;
                    return 1;
                }
            } else if (data.input[l.byte_offset + 1] == 97) {
                if (3 == compare(data, l.byte_offset + 2, 54, 3)) {
                    if (l.isDiscrete(data, TokenIdentifier, 5)) {
                        /*false*/
                        l.type = TokenSymbol;
                        l.byte_length = 5;
                        l.token_length = 5;
                        return 1;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 48) {
            if (data.input[l.byte_offset + 1] == 120) {
                /*0x*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 1;
            } else if (data.input[l.byte_offset + 1] == 98) {
                /*0b*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 1;
            } else if (data.input[l.byte_offset + 1] == 111) {
                /*0o*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 1;
            } else if (data.input[l.byte_offset + 1] == 79) {
                /*0O*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 34) {
            /*"*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 39) {
            /*'*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 116) {
            if (3 == compare(data, l.byte_offset + 1, 95, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*true*/
                    l.type = TokenSymbol;
                    l.byte_length = 4;
                    l.token_length = 4;
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 110) {
            if (3 == compare(data, l.byte_offset + 1, 35, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*null*/
                    l.type = TokenSymbol;
                    l.byte_length = 4;
                    l.token_length = 4;
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 60) {
            if (3 == compare(data, l.byte_offset + 1, 20, 3)) {
                /*<<--*/
                l.type = TokenSymbol;
                l.byte_length = 4;
                l.token_length = 4;
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 40) {
            /*(*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 98) {
            if (4 == compare(data, l.byte_offset + 1, 72, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*break*/
                    l.type = TokenSymbol;
                    l.byte_length = 5;
                    l.token_length = 5;
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 114) {
            if (5 == compare(data, l.byte_offset + 1, 77, 5)) {
                if (l.isDiscrete(data, TokenIdentifier, 6)) {
                    /*return*/
                    l.type = TokenSymbol;
                    l.byte_length = 6;
                    l.token_length = 6;
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 99) {
            if (7 == compare(data, l.byte_offset + 1, 39, 7)) {
                if (l.isDiscrete(data, TokenIdentifier, 8)) {
                    /*continue*/
                    l.type = TokenSymbol;
                    l.byte_length = 8;
                    l.token_length = 8;
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 108) {
            if (3 == compare(data, l.byte_offset + 1, 63, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*loop*/
                    l.type = TokenSymbol;
                    l.byte_length = 4;
                    l.token_length = 4;
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 123) {
            /*{*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 41) {
            /*)*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 95) {
            /*_*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 2;
        } else if (data.input[l.byte_offset + 0] == 36) {
            /*$*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 2;
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 2;
        }
        if (l.isSym(true, data)) {
            return 1;
        } else if (l.isNum(data)) {
            return 1;
        } else if (l.isUniID(data)) {
            return 2;
        }
    }
    function sym_map_d84211c6e69b218c(l, data) {
        /*[ <<-- import cls str fn ns id _ $*/
        if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 0;
        } else if (data.input[l.byte_offset + 0] == 60) {
            if (3 == compare(data, l.byte_offset + 1, 20, 3)) {
                /*<<--*/
                l.type = TokenSymbol;
                l.byte_length = 4;
                l.token_length = 4;
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 105) {
            if (5 == compare(data, l.byte_offset + 1, 29, 5)) {
                if (l.isDiscrete(data, TokenIdentifier, 6)) {
                    /*import*/
                    l.type = TokenSymbol;
                    l.byte_length = 6;
                    l.token_length = 6;
                    return 2;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 99) {
            if (2 == compare(data, l.byte_offset + 1, 122, 2)) {
                if (l.isDiscrete(data, TokenIdentifier, 3)) {
                    /*cls*/
                    l.type = TokenSymbol;
                    l.byte_length = 3;
                    l.token_length = 3;
                    return 3;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 115) {
            if (2 == compare(data, l.byte_offset + 1, 47, 2)) {
                if (l.isDiscrete(data, TokenIdentifier, 3)) {
                    /*str*/
                    l.type = TokenSymbol;
                    l.byte_length = 3;
                    l.token_length = 3;
                    return 4;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*fn*/
                    l.type = TokenSymbol;
                    l.byte_length = 2;
                    l.token_length = 2;
                    return 5;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 110) {
            if (data.input[l.byte_offset + 1] == 115) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*ns*/
                    l.type = TokenSymbol;
                    l.byte_length = 2;
                    l.token_length = 2;
                    return 6;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 95) {
            /*_*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 7;
        } else if (data.input[l.byte_offset + 0] == 36) {
            /*$*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 7;
        }
        if (l.isUniID(data)) {
            return 7;
        }
    }
    function sym_map_d91b3248f12ee50f(l, data) {
        /*] : ; ) else in } , str import cls ns if match sym = num 0x 0b 0o 0O " ' true false null ( break return continue loop { [ id _ $ fn <<--*/
        if (data.input[l.byte_offset + 0] == 93) {
            /*]*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 0;
        } else if (data.input[l.byte_offset + 0] == 58) {
            /*:*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 0;
        } else if (data.input[l.byte_offset + 0] == 59) {
            /*;*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 0;
        } else if (data.input[l.byte_offset + 0] == 41) {
            /*)*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 0;
        } else if (data.input[l.byte_offset + 0] == 101) {
            if (3 == compare(data, l.byte_offset + 1, 128, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*else*/
                    l.type = TokenSymbol;
                    l.byte_length = 4;
                    l.token_length = 4;
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 105) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*in*/
                    l.type = TokenSymbol;
                    l.byte_length = 2;
                    l.token_length = 2;
                    return 0;
                }
            } else if (data.input[l.byte_offset + 1] == 102) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*if*/
                    l.type = TokenSymbol;
                    l.byte_length = 2;
                    l.token_length = 2;
                    return 1;
                }
            } else if (data.input[l.byte_offset + 1] == 109) {
                if (4 == compare(data, l.byte_offset + 2, 30, 4)) {
                    if (l.isDiscrete(data, TokenIdentifier, 6)) {
                        /*import*/
                        l.type = TokenSymbol;
                        l.byte_length = 6;
                        l.token_length = 6;
                        return 0;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 125) {
            /*}*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 0;
        } else if (data.input[l.byte_offset + 0] == 44) {
            /*,*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 0;
        } else if (data.input[l.byte_offset + 0] == 115) {
            if (2 == compare(data, l.byte_offset + 1, 47, 2)) {
                if (l.isDiscrete(data, TokenIdentifier, 3)) {
                    /*str*/
                    l.type = TokenSymbol;
                    l.byte_length = 3;
                    l.token_length = 3;
                    return 0;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 99) {
            if (data.input[l.byte_offset + 1] == 108) {
                if (data.input[l.byte_offset + 2] == 115) {
                    if (l.isDiscrete(data, TokenIdentifier, 3)) {
                        /*cls*/
                        l.type = TokenSymbol;
                        l.byte_length = 3;
                        l.token_length = 3;
                        return 0;
                    }
                }
            } else if (data.input[l.byte_offset + 1] == 111) {
                if (6 == compare(data, l.byte_offset + 2, 40, 6)) {
                    if (l.isDiscrete(data, TokenIdentifier, 8)) {
                        /*continue*/
                        l.type = TokenSymbol;
                        l.byte_length = 8;
                        l.token_length = 8;
                        return 1;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 110) {
            if (data.input[l.byte_offset + 1] == 115) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*ns*/
                    l.type = TokenSymbol;
                    l.byte_length = 2;
                    l.token_length = 2;
                    return 0;
                }
            } else if (data.input[l.byte_offset + 1] == 117) {
                if (2 == compare(data, l.byte_offset + 2, 36, 2)) {
                    if (l.isDiscrete(data, TokenIdentifier, 4)) {
                        /*null*/
                        l.type = TokenSymbol;
                        l.byte_length = 4;
                        l.token_length = 4;
                        return 1;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 109) {
            if (4 == compare(data, l.byte_offset + 1, 67, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*match*/
                    l.type = TokenSymbol;
                    l.byte_length = 5;
                    l.token_length = 5;
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 61) {
            /*=*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 48) {
            if (data.input[l.byte_offset + 1] == 120) {
                /*0x*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 1;
            } else if (data.input[l.byte_offset + 1] == 98) {
                /*0b*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 1;
            } else if (data.input[l.byte_offset + 1] == 111) {
                /*0o*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 1;
            } else if (data.input[l.byte_offset + 1] == 79) {
                /*0O*/
                l.type = TokenSymbol;
                l.byte_length = 2;
                l.token_length = 2;
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 34) {
            /*"*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 39) {
            /*'*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 116) {
            if (3 == compare(data, l.byte_offset + 1, 95, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*true*/
                    l.type = TokenSymbol;
                    l.byte_length = 4;
                    l.token_length = 4;
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (data.input[l.byte_offset + 1] == 110) {
                if (l.isDiscrete(data, TokenIdentifier, 2)) {
                    /*fn*/
                    l.type = TokenSymbol;
                    l.byte_length = 2;
                    l.token_length = 2;
                    return 2;
                }
            } else if (data.input[l.byte_offset + 1] == 97) {
                if (3 == compare(data, l.byte_offset + 2, 54, 3)) {
                    if (l.isDiscrete(data, TokenIdentifier, 5)) {
                        /*false*/
                        l.type = TokenSymbol;
                        l.byte_length = 5;
                        l.token_length = 5;
                        return 1;
                    }
                }
            }
        } else if (data.input[l.byte_offset + 0] == 40) {
            /*(*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 98) {
            if (4 == compare(data, l.byte_offset + 1, 72, 4)) {
                if (l.isDiscrete(data, TokenIdentifier, 5)) {
                    /*break*/
                    l.type = TokenSymbol;
                    l.byte_length = 5;
                    l.token_length = 5;
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 114) {
            if (5 == compare(data, l.byte_offset + 1, 77, 5)) {
                if (l.isDiscrete(data, TokenIdentifier, 6)) {
                    /*return*/
                    l.type = TokenSymbol;
                    l.byte_length = 6;
                    l.token_length = 6;
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 108) {
            if (3 == compare(data, l.byte_offset + 1, 63, 3)) {
                if (l.isDiscrete(data, TokenIdentifier, 4)) {
                    /*loop*/
                    l.type = TokenSymbol;
                    l.byte_length = 4;
                    l.token_length = 4;
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 123) {
            /*{*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 1;
        } else if (data.input[l.byte_offset + 0] == 91) {
            /*[*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 2;
        } else if (data.input[l.byte_offset + 0] == 95) {
            /*_*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 2;
        } else if (data.input[l.byte_offset + 0] == 36) {
            /*$*/
            l.type = TokenSymbol;
            l.byte_length = 1;
            l.token_length = 1;
            return 2;
        } else if (data.input[l.byte_offset + 0] == 60) {
            if (3 == compare(data, l.byte_offset + 1, 20, 3)) {
                /*<<--*/
                l.type = TokenSymbol;
                l.byte_length = 4;
                l.token_length = 4;
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
    function tk_0f3d9e998d4e8303(l, data) {
        if (/*[0b]*/cmpr_set(l, data, 113, 2, 2)) {

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
    function tk_14644998c4b8d451(l, data) {
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
    function tk_5b3ed459478d3672(l, data) {
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
    function tk_61a31e0cd3675f53(l, data) {
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
    function tk_896177e00f155ef3(l, data) {
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
    function tk_8fcdaaaa197aa76f(l, data) {
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
    function tk_b838139d0d011665(l, data) {
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
    function tk_e216f7e76b2d5e60(l, data) {
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
    function tk_f545b90791fd2d3f(l, data) {
        if (/*[0x]*/cmpr_set(l, data, 26, 2, 2)) {

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
    function tk_f70d460017f6375f(l, data) {
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
/*production name: skribble
            grammar index: 0
            bodies:
	0:0 skribble=>• module - 
            compile time: 12.74ms*/;
    function $skribble(l, data, state) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*0:0 skribble=>• module*/
        pushFN(data, branch_0fdc5c5b577f7e48);
        pushFN(data, $module);
        return 0;
        return -1;
    }
/*production name: module_group_02_100
            grammar index: 1
            bodies:
	1:1 module_group_02_100=>• statements - 
            compile time: 13.209ms*/;
    function $module_group_02_100(l, data, state) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*1:1 module_group_02_100=>• statements*/
        pushFN(data, branch_e6ca468c39009342);
        pushFN(data, $statements);
        return 0;
        return -1;
    }
/*production name: module
            grammar index: 3
            bodies:
	3:4 module=>• module module_group_02_100 - 
		3:5 module=>• module_group_02_100 - 
            compile time: 27.549ms*/;
    function $module(l, data, state) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*3:5 module=>• module_group_02_100*/
        pushFN(data, branch_bbaaf5e2ac261f99);
        pushFN(data, $statements);
        return 0;
        return -1;
    }
    function $module_goto(l, data, state, prod) {
        while (1) {
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*3:4 module=>module • module_group_02_100
            0:0 skribble=>module •*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            if (((((((/*[import]*/cmpr_set(l, data, 28, 6, 6) ||/*[cls]*/cmpr_set(l, data, 121, 3, 3)) ||/*[str]*/cmpr_set(l, data, 46, 3, 3)) ||/*[fn]*/cmpr_set(l, data, 143, 2, 2)) ||/*[ns]*/cmpr_set(l, data, 119, 2, 2)) ||/*[<<--]*/cmpr_set(l, data, 19, 4, 4)) || assert_ascii(l, 0x0, 0x10, 0x88000000, 0x0)) || l.isUniID(data)) {
                /*
                   3:4 module=>module • module_group_02_100
                */
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*3:4 module=>module • module_group_02_100*/
                pushFN(data, branch_f294346e45fb95b8);
                pushFN(data, $statements);
                return 0;
            }
            break;
        }
        return prod == 3 ? prod : -1;
    }
/*production name: statements
            grammar index: 4
            bodies:
	4:6 statements=>• import - 
		4:7 statements=>• class - 
		4:8 statements=>• primitive_declaration - 
		4:9 statements=>• struct - 
		4:10 statements=>• function - 
		4:11 statements=>• namespace - 
		4:12 statements=>• template - 
            compile time: 884.189ms*/;
    function $statements(l, data, state) {
        /*4:6 statements=>• import
        50:143 modifier_list=>• [ modifier_list_HC_listbody1_120 ]
        4:7 statements=>• class
        4:8 statements=>• primitive_declaration
        4:9 statements=>• struct
        4:10 statements=>• function
        4:11 statements=>• namespace
        4:12 statements=>• template*/
        switch (sym_map_d84211c6e69b218c(l, data)) {
            case 0:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                /*50:143 modifier_list=>• [ modifier_list_HC_listbody1_120 ]*/
                pushFN(data, branch_28c5dc3955a9ede3);
                pushFN(data, $modifier_list);
                return 0;
            case 1:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*4:12 statements=>• template*/
                pushFN(data, branch_9326ced0ea767996);
                pushFN(data, $template);
                return 0;
            case 2:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*4:6 statements=>• import*/
                pushFN(data, branch_29bbdf58183bc8d7);
                pushFN(data, $import);
                return 0;
            case 3:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*4:7 statements=>• class*/
                pushFN(data, branch_29bbdf58183bc8d7);
                pushFN(data, $class);
                return 0;
            case 4:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*4:9 statements=>• struct*/
                pushFN(data, branch_29bbdf58183bc8d7);
                pushFN(data, $struct);
                return 0;
            case 5:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*4:10 statements=>• function*/
                pushFN(data, branch_29bbdf58183bc8d7);
                pushFN(data, $function);
                return 0;
            case 6:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*4:11 statements=>• namespace*/
                pushFN(data, branch_29bbdf58183bc8d7);
                pushFN(data, $namespace);
                return 0;
            case 7:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*4:8 statements=>• primitive_declaration*/
                pushFN(data, branch_29bbdf58183bc8d7);
                pushFN(data, $primitive_declaration);
                return 0;
            default:
                break;
        }
        return -1;
    }
    function $statements_goto(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*11:24 class=>modifier_list • cls identifier class_group_113_103 { class_HC_listbody1_105 }
        11:26 class=>modifier_list • cls identifier { class_HC_listbody1_105 }
        11:27 class=>modifier_list • cls identifier class_group_113_103 { }
        11:30 class=>modifier_list • cls identifier { }
        43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
        43:127 primitive_declaration=>modifier_list • identifier : type
        12:32 struct=>modifier_list • str identifier { parameters }
        12:34 struct=>modifier_list • str identifier { }
        13:36 function=>modifier_list • fn identifier : type ( parameters ) { expression_statements }
        13:38 function=>modifier_list • fn identifier : type ( ) { expression_statements }
        13:39 function=>modifier_list • fn identifier : type ( parameters ) { }
        13:42 function=>modifier_list • fn identifier : type ( ) { }*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if (/*[cls]*/cmpr_set(l, data, 121, 3, 3)) {
            /*
               11:24 class=>modifier_list • cls identifier class_group_113_103 { class_HC_listbody1_105 }
               11:26 class=>modifier_list • cls identifier { class_HC_listbody1_105 }
               11:27 class=>modifier_list • cls identifier class_group_113_103 { }
               11:30 class=>modifier_list • cls identifier { }
            */
            /*11:24 class=>modifier_list • cls identifier class_group_113_103 { class_HC_listbody1_105 }
            11:26 class=>modifier_list • cls identifier { class_HC_listbody1_105 }
            11:27 class=>modifier_list • cls identifier class_group_113_103 { }
            11:30 class=>modifier_list • cls identifier { }*/
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l, data, state);
            /*11:24 class=>modifier_list cls • identifier class_group_113_103 { class_HC_listbody1_105 }
            11:26 class=>modifier_list cls • identifier { class_HC_listbody1_105 }
            11:27 class=>modifier_list cls • identifier class_group_113_103 { }
            11:30 class=>modifier_list cls • identifier { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_5db3d6f6738c1965);
            pushFN(data, $identifier);
            return 0;
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else if (/*[str]*/cmpr_set(l, data, 46, 3, 3)) {
            /*
               12:32 struct=>modifier_list • str identifier { parameters }
               12:34 struct=>modifier_list • str identifier { }
            */
            /*12:32 struct=>modifier_list • str identifier { parameters }
            12:34 struct=>modifier_list • str identifier { }*/
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l, data, state);
            /*12:32 struct=>modifier_list str • identifier { parameters }
            12:34 struct=>modifier_list str • identifier { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_65667afc550320cc);
            pushFN(data, $identifier);
            return 0;
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else if (/*[fn]*/cmpr_set(l, data, 143, 2, 2)) {
            /*
               13:36 function=>modifier_list • fn identifier : type ( parameters ) { expression_statements }
               13:38 function=>modifier_list • fn identifier : type ( ) { expression_statements }
               13:39 function=>modifier_list • fn identifier : type ( parameters ) { }
               13:42 function=>modifier_list • fn identifier : type ( ) { }
            */
            /*13:36 function=>modifier_list • fn identifier : type ( parameters ) { expression_statements }
            13:38 function=>modifier_list • fn identifier : type ( ) { expression_statements }
            13:39 function=>modifier_list • fn identifier : type ( parameters ) { }
            13:42 function=>modifier_list • fn identifier : type ( ) { }*/
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l, data, state);
            /*13:36 function=>modifier_list fn • identifier : type ( parameters ) { expression_statements }
            13:38 function=>modifier_list fn • identifier : type ( ) { expression_statements }
            13:39 function=>modifier_list fn • identifier : type ( parameters ) { }
            13:42 function=>modifier_list fn • identifier : type ( ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_82d768f65ad7b061);
            pushFN(data, $identifier);
            return 0;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (((l.current_byte == 95/*[_]*/) || (l.current_byte == 36/*[$]*/)) || l.isUniID(data)) {
            /*
               43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
               43:127 primitive_declaration=>modifier_list • identifier : type
            */
            /*43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
            43:127 primitive_declaration=>modifier_list • identifier : type*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_c602d0d09fc69271);
            pushFN(data, $identifier);
            return 0;
        }
        return prod == 4 ? prod : -1;
    }
/*production name: import
            grammar index: 5
            bodies:
	5:13 import=>• import tk:string - 
            compile time: 14.017ms*/;
    function $import(l, data, state) {
        /*5:13 import=>• import tk:string*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (/*[import]*/cmpr_set(l, data, 28, 6, 6)) {
            /*
               5:13 import=>import • tk:string
            */
            consume(l, data, state);
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*5:13 import=>import • tk:string*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            if (tk_f70d460017f6375f(l, data) && consume(l, data, state)) {
                add_reduce(state, data, 2, 0);
                return 5;
            }
        }
        return -1;
    }
/*production name: namespace_HC_listbody3_102
            grammar index: 6
            bodies:
	6:14 namespace_HC_listbody3_102=>• namespace_HC_listbody3_102 statements - 
		6:15 namespace_HC_listbody3_102=>• statements - 
            compile time: 29.459ms*/;
    function $namespace_HC_listbody3_102(l, data, state) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*6:15 namespace_HC_listbody3_102=>• statements*/
        pushFN(data, branch_cc9e8eab54dacbec);
        pushFN(data, $statements);
        return 0;
        return -1;
    }
    function $namespace_HC_listbody3_102_goto(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*6:14 namespace_HC_listbody3_102=>namespace_HC_listbody3_102 • statements
        7:16 namespace=>ns identifier { namespace_HC_listbody3_102 • }*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (((((((/*[import]*/cmpr_set(l, data, 28, 6, 6) ||/*[cls]*/cmpr_set(l, data, 121, 3, 3)) ||/*[str]*/cmpr_set(l, data, 46, 3, 3)) ||/*[fn]*/cmpr_set(l, data, 143, 2, 2)) ||/*[ns]*/cmpr_set(l, data, 119, 2, 2)) ||/*[<<--]*/cmpr_set(l, data, 19, 4, 4)) || assert_ascii(l, 0x0, 0x10, 0x88000000, 0x0)) || l.isUniID(data)) {
            /*
               6:14 namespace_HC_listbody3_102=>namespace_HC_listbody3_102 • statements
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*6:14 namespace_HC_listbody3_102=>namespace_HC_listbody3_102 • statements*/
            pushFN(data, branch_242856005a2da596);
            pushFN(data, $statements);
            return 0;
        }
        return prod == 6 ? prod : -1;
    }
/*production name: namespace
            grammar index: 7
            bodies:
	7:16 namespace=>• ns identifier { namespace_HC_listbody3_102 } - 
		7:17 namespace=>• ns identifier { } - 
            compile time: 25.973ms*/;
    function $namespace(l, data, state) {
        /*7:16 namespace=>• ns identifier { namespace_HC_listbody3_102 }
        7:17 namespace=>• ns identifier { }*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (/*[ns]*/cmpr_set(l, data, 119, 2, 2)) {
            /*
               7:16 namespace=>ns • identifier { namespace_HC_listbody3_102 }
               7:17 namespace=>ns • identifier { }
            */
            consume(l, data, state);
            /*7:16 namespace=>ns • identifier { namespace_HC_listbody3_102 }
            7:17 namespace=>ns • identifier { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_ca7dd33b2d3dc0c1);
            pushFN(data, $identifier);
            return 0;
        }
        return -1;
    }
/*production name: class_group_113_103
            grammar index: 8
            bodies:
	8:18 class_group_113_103=>• is θid - 
            compile time: 17.052ms*/;
    function $class_group_113_103(l, data, state) {
        /*8:18 class_group_113_103=>• is θid*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (/*[is]*/cmpr_set(l, data, 140, 2, 2)) {
            /*
               8:18 class_group_113_103=>is • θid
            */
            consume(l, data, state);
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*8:18 class_group_113_103=>is • θid*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            if (l.isUniID(data) && consume(l, data, state)) {
                add_reduce(state, data, 2, 0);
                return 8;
            }
        }
        return -1;
    }
/*production name: class_group_016_104
            grammar index: 9
            bodies:
	9:19 class_group_016_104=>• struct - 
		9:20 class_group_016_104=>• primitive_declaration - 
		9:21 class_group_016_104=>• function - 
            compile time: 719.564ms*/;
    function $class_group_016_104(l, data, state) {
        /*50:143 modifier_list=>• [ modifier_list_HC_listbody1_120 ]
        9:19 class_group_016_104=>• struct
        9:20 class_group_016_104=>• primitive_declaration
        9:21 class_group_016_104=>• function*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 91/*[[]*/) {
            /*
               50:143 modifier_list=>• [ modifier_list_HC_listbody1_120 ]
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
            /*50:143 modifier_list=>• [ modifier_list_HC_listbody1_120 ]*/
            pushFN(data, branch_7a8be2c54a4d26e4);
            pushFN(data, $modifier_list);
            return 0;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (/*[str]*/cmpr_set(l, data, 46, 3, 3)) {
            /*
               9:19 class_group_016_104=>• struct
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*9:19 class_group_016_104=>• struct*/
            pushFN(data, branch_fc3089e8ba238415);
            pushFN(data, $struct);
            return 0;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (/*[fn]*/cmpr_set(l, data, 143, 2, 2)) {
            /*
               9:21 class_group_016_104=>• function
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*9:21 class_group_016_104=>• function*/
            pushFN(data, branch_fc3089e8ba238415);
            pushFN(data, $function);
            return 0;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               9:20 class_group_016_104=>• primitive_declaration
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*9:20 class_group_016_104=>• primitive_declaration*/
            pushFN(data, branch_fc3089e8ba238415);
            pushFN(data, $primitive_declaration);
            return 0;
        }
        return -1;
    }
    function $class_group_016_104_goto(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*12:32 struct=>modifier_list • str identifier { parameters }
        12:34 struct=>modifier_list • str identifier { }
        43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
        43:127 primitive_declaration=>modifier_list • identifier : type
        13:36 function=>modifier_list • fn identifier : type ( parameters ) { expression_statements }
        13:38 function=>modifier_list • fn identifier : type ( ) { expression_statements }
        13:39 function=>modifier_list • fn identifier : type ( parameters ) { }
        13:42 function=>modifier_list • fn identifier : type ( ) { }*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if (/*[str]*/cmpr_set(l, data, 46, 3, 3)) {
            /*
               12:32 struct=>modifier_list • str identifier { parameters }
               12:34 struct=>modifier_list • str identifier { }
            */
            /*12:32 struct=>modifier_list • str identifier { parameters }
            12:34 struct=>modifier_list • str identifier { }*/
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l, data, state);
            /*12:32 struct=>modifier_list str • identifier { parameters }
            12:34 struct=>modifier_list str • identifier { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_a84d18e40d92f232);
            pushFN(data, $identifier);
            return 0;
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else if (/*[fn]*/cmpr_set(l, data, 143, 2, 2)) {
            /*
               13:36 function=>modifier_list • fn identifier : type ( parameters ) { expression_statements }
               13:38 function=>modifier_list • fn identifier : type ( ) { expression_statements }
               13:39 function=>modifier_list • fn identifier : type ( parameters ) { }
               13:42 function=>modifier_list • fn identifier : type ( ) { }
            */
            /*13:36 function=>modifier_list • fn identifier : type ( parameters ) { expression_statements }
            13:38 function=>modifier_list • fn identifier : type ( ) { expression_statements }
            13:39 function=>modifier_list • fn identifier : type ( parameters ) { }
            13:42 function=>modifier_list • fn identifier : type ( ) { }*/
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l, data, state);
            /*13:36 function=>modifier_list fn • identifier : type ( parameters ) { expression_statements }
            13:38 function=>modifier_list fn • identifier : type ( ) { expression_statements }
            13:39 function=>modifier_list fn • identifier : type ( parameters ) { }
            13:42 function=>modifier_list fn • identifier : type ( ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_d2901b16f2a97667);
            pushFN(data, $identifier);
            return 0;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (((l.current_byte == 95/*[_]*/) || (l.current_byte == 36/*[$]*/)) || l.isUniID(data)) {
            /*
               43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
               43:127 primitive_declaration=>modifier_list • identifier : type
            */
            /*43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
            43:127 primitive_declaration=>modifier_list • identifier : type*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_a201144ddb2803ba);
            pushFN(data, $identifier);
            return 0;
        }
        return prod == 9 ? prod : -1;
    }
/*production name: class_HC_listbody1_105
            grammar index: 10
            bodies:
	10:22 class_HC_listbody1_105=>• class_HC_listbody1_105 class_group_016_104 - 
		10:23 class_HC_listbody1_105=>• class_group_016_104 - 
            compile time: 353.926ms*/;
    function $class_HC_listbody1_105(l, data, state) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*10:23 class_HC_listbody1_105=>• class_group_016_104*/
        pushFN(data, branch_7e5b06e2e73c7ad3);
        pushFN(data, $class_group_016_104);
        return 0;
        return -1;
    }
    function $class_HC_listbody1_105_goto(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*10:22 class_HC_listbody1_105=>class_HC_listbody1_105 • class_group_016_104
        11:24 class=>modifier_list cls identifier class_group_113_103 { class_HC_listbody1_105 • }
        11:25 class=>cls identifier class_group_113_103 { class_HC_listbody1_105 • }
        11:26 class=>modifier_list cls identifier { class_HC_listbody1_105 • }
        11:28 class=>cls identifier { class_HC_listbody1_105 • }*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (((/*[str]*/cmpr_set(l, data, 46, 3, 3) ||/*[fn]*/cmpr_set(l, data, 143, 2, 2)) || assert_ascii(l, 0x0, 0x10, 0x88000000, 0x0)) || l.isUniID(data)) {
            /*
               10:22 class_HC_listbody1_105=>class_HC_listbody1_105 • class_group_016_104
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*10:22 class_HC_listbody1_105=>class_HC_listbody1_105 • class_group_016_104*/
            pushFN(data, branch_71ffa1e91e4c72ff);
            pushFN(data, $class_group_016_104);
            return 0;
        }
        return prod == 10 ? prod : -1;
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
            compile time: 286.304ms*/;
    function $class(l, data, state) {
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
            /*
               11:24 class=>• modifier_list cls identifier class_group_113_103 { class_HC_listbody1_105 }
               11:26 class=>• modifier_list cls identifier { class_HC_listbody1_105 }
               11:27 class=>• modifier_list cls identifier class_group_113_103 { }
               11:30 class=>• modifier_list cls identifier { }
            */
            /*11:24 class=>• modifier_list cls identifier class_group_113_103 { class_HC_listbody1_105 }
            11:26 class=>• modifier_list cls identifier { class_HC_listbody1_105 }
            11:27 class=>• modifier_list cls identifier class_group_113_103 { }
            11:30 class=>• modifier_list cls identifier { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_62724c152cb74d3f);
            pushFN(data, $modifier_list);
            return 0;
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else {
            /*
               11:25 class=>• cls identifier class_group_113_103 { class_HC_listbody1_105 }
               11:28 class=>• cls identifier { class_HC_listbody1_105 }
               11:29 class=>• cls identifier class_group_113_103 { }
               11:31 class=>• cls identifier { }
            */
            /*11:25 class=>• cls identifier class_group_113_103 { class_HC_listbody1_105 }
            11:28 class=>• cls identifier { class_HC_listbody1_105 }
            11:29 class=>• cls identifier class_group_113_103 { }
            11:31 class=>• cls identifier { }*/
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l, data, state);
            /*11:25 class=>cls • identifier class_group_113_103 { class_HC_listbody1_105 }
            11:28 class=>cls • identifier { class_HC_listbody1_105 }
            11:29 class=>cls • identifier class_group_113_103 { }
            11:31 class=>cls • identifier { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_67f89e583d60ca28);
            pushFN(data, $identifier);
            return 0;
        }
        return -1;
    }
/*production name: struct
            grammar index: 12
            bodies:
	12:32 struct=>• modifier_list str identifier { parameters } - 
		12:33 struct=>• str identifier { parameters } - 
		12:34 struct=>• modifier_list str identifier { } - 
		12:35 struct=>• str identifier { } - 
            compile time: 222.412ms*/;
    function $struct(l, data, state) {
        /*12:32 struct=>• modifier_list str identifier { parameters }
        12:34 struct=>• modifier_list str identifier { }
        12:33 struct=>• str identifier { parameters }
        12:35 struct=>• str identifier { }*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 91/*[[]*/) {
            /*
               12:32 struct=>• modifier_list str identifier { parameters }
               12:34 struct=>• modifier_list str identifier { }
            */
            /*12:32 struct=>• modifier_list str identifier { parameters }
            12:34 struct=>• modifier_list str identifier { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_8edd769bb0a9267b);
            pushFN(data, $modifier_list);
            return 0;
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else {
            /*
               12:33 struct=>• str identifier { parameters }
               12:35 struct=>• str identifier { }
            */
            /*12:33 struct=>• str identifier { parameters }
            12:35 struct=>• str identifier { }*/
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l, data, state);
            /*12:33 struct=>str • identifier { parameters }
            12:35 struct=>str • identifier { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_9689810ad262b5fb);
            pushFN(data, $identifier);
            return 0;
        }
        return -1;
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
            compile time: 1041.32ms*/;
    function $function(l, data, state) {
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
            /*
               13:36 function=>• modifier_list fn identifier : type ( parameters ) { expression_statements }
               13:38 function=>• modifier_list fn identifier : type ( ) { expression_statements }
               13:39 function=>• modifier_list fn identifier : type ( parameters ) { }
               13:42 function=>• modifier_list fn identifier : type ( ) { }
            */
            /*13:36 function=>• modifier_list fn identifier : type ( parameters ) { expression_statements }
            13:38 function=>• modifier_list fn identifier : type ( ) { expression_statements }
            13:39 function=>• modifier_list fn identifier : type ( parameters ) { }
            13:42 function=>• modifier_list fn identifier : type ( ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_0c7e6ede7c6bf26a);
            pushFN(data, $modifier_list);
            return 0;
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else {
            /*
               13:37 function=>• fn identifier : type ( parameters ) { expression_statements }
               13:40 function=>• fn identifier : type ( ) { expression_statements }
               13:41 function=>• fn identifier : type ( parameters ) { }
               13:43 function=>• fn identifier : type ( ) { }
            */
            /*13:37 function=>• fn identifier : type ( parameters ) { expression_statements }
            13:40 function=>• fn identifier : type ( ) { expression_statements }
            13:41 function=>• fn identifier : type ( parameters ) { }
            13:43 function=>• fn identifier : type ( ) { }*/
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l, data, state);
            /*13:37 function=>fn • identifier : type ( parameters ) { expression_statements }
            13:40 function=>fn • identifier : type ( ) { expression_statements }
            13:41 function=>fn • identifier : type ( parameters ) { }
            13:43 function=>fn • identifier : type ( ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_8059258321b9902f);
            pushFN(data, $identifier);
            return 0;
        }
        return -1;
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
            compile time: 1006.843ms*/;
    function $function_expression(l, data, state) {
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
            /*
               14:44 function_expression=>• modifier_list fn : type ( parameters ) { expression_statements }
               14:46 function_expression=>• modifier_list fn : type ( ) { expression_statements }
               14:47 function_expression=>• modifier_list fn : type ( parameters ) { }
               14:50 function_expression=>• modifier_list fn : type ( ) { }
            */
            /*14:44 function_expression=>• modifier_list fn : type ( parameters ) { expression_statements }
            14:46 function_expression=>• modifier_list fn : type ( ) { expression_statements }
            14:47 function_expression=>• modifier_list fn : type ( parameters ) { }
            14:50 function_expression=>• modifier_list fn : type ( ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_a325368242806460);
            pushFN(data, $modifier_list);
            return 0;
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else {
            /*
               14:45 function_expression=>• fn : type ( parameters ) { expression_statements }
               14:48 function_expression=>• fn : type ( ) { expression_statements }
               14:49 function_expression=>• fn : type ( parameters ) { }
               14:51 function_expression=>• fn : type ( ) { }
            */
            /*14:45 function_expression=>• fn : type ( parameters ) { expression_statements }
            14:48 function_expression=>• fn : type ( ) { expression_statements }
            14:49 function_expression=>• fn : type ( parameters ) { }
            14:51 function_expression=>• fn : type ( ) { }*/
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l, data, state);
            /*14:45 function_expression=>fn • : type ( parameters ) { expression_statements }
            14:48 function_expression=>fn • : type ( ) { expression_statements }
            14:49 function_expression=>fn • : type ( parameters ) { }
            14:51 function_expression=>fn • : type ( ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if (l.current_byte == 58/*[:]*/) {
                /*
                   14:45 function_expression=>fn : • type ( parameters ) { expression_statements }
                   14:48 function_expression=>fn : • type ( ) { expression_statements }
                   14:49 function_expression=>fn : • type ( parameters ) { }
                   14:51 function_expression=>fn : • type ( ) { }
                */
                consume(l, data, state);
                /*14:45 function_expression=>fn : • type ( parameters ) { expression_statements }
                14:48 function_expression=>fn : • type ( ) { expression_statements }
                14:49 function_expression=>fn : • type ( parameters ) { }
                14:51 function_expression=>fn : • type ( ) { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                pushFN(data, branch_ba3eec6214f6ee12);
                pushFN(data, $type);
                return 0;
            }
        }
        return -1;
    }
/*production name: parameters
            grammar index: 16
            bodies:
	16:54 parameters=>• parameters , primitive_declaration - 
		16:55 parameters=>• primitive_declaration - 
            compile time: 807.872ms*/;
    function $parameters(l, data, state) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*16:55 parameters=>• primitive_declaration*/
        pushFN(data, branch_1f0e8a0854632fda);
        pushFN(data, $primitive_declaration);
        return 0;
        return -1;
    }
    function $parameters_goto(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
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
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if (l.current_byte == 44/*[,]*/) {
            /*
               16:54 parameters=>parameters • , primitive_declaration
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*16:54 parameters=>parameters • , primitive_declaration*/
            consume(l, data, state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_b16f5597ded685c8);
            pushFN(data, $primitive_declaration);
            return 0;
        }
        return prod == 16 ? prod : -1;
    }
/*production name: expression_statements_HC_listbody1_107
            grammar index: 17
            bodies:
	17:56 expression_statements_HC_listbody1_107=>• expression_statements_HC_listbody1_107 ; - 
		17:57 expression_statements_HC_listbody1_107=>• ; - 
            compile time: 317.54ms*/;
    function $expression_statements_HC_listbody1_107(l, data, state) {
        /*17:57 expression_statements_HC_listbody1_107=>• ;*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 59/*[;]*/) {
            /*
               17:57 expression_statements_HC_listbody1_107=>; •
            */
            consume(l, data, state);
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*17:57 expression_statements_HC_listbody1_107=>; •*/
            add_reduce(state, data, 1, 3);
            pushFN(data, $expression_statements_HC_listbody1_107_goto);
            return 17;
        }
        return -1;
    }
    function $expression_statements_HC_listbody1_107_goto(l, data, state, prod) {
        while (1) {
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            if (l.current_byte == 125/*[}]*/) {
                return 17;
            }
            /*17:56 expression_statements_HC_listbody1_107=>expression_statements_HC_listbody1_107 • ;
            19:60 expression_statements_group_124_109=>expression_statements_HC_listbody1_107 • expression_statements_group_023_108
            19:61 expression_statements_group_124_109=>expression_statements_HC_listbody1_107 •*/
            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
            if (l.current_byte == 59/*[;]*/) {
                /*
                   17:56 expression_statements_HC_listbody1_107=>expression_statements_HC_listbody1_107 • ;
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                /*17:56 expression_statements_HC_listbody1_107=>expression_statements_HC_listbody1_107 • ;*/
                consume(l, data, state);
                add_reduce(state, data, 2, 2);
                pushFN(data, $expression_statements_HC_listbody1_107_goto);
                return 17;
            }
            break;
        }
        return prod == 17 ? prod : -1;
    }
/*production name: expression_statements_group_023_108
            grammar index: 18
            bodies:
	18:58 expression_statements_group_023_108=>• expression - 
		18:59 expression_statements_group_023_108=>• primitive_declaration - 
            compile time: 2840.131ms*/;
    function $expression_statements_group_023_108(l, data, state) {
        /*18:58 expression_statements_group_023_108=>• expression
        18:59 expression_statements_group_023_108=>• primitive_declaration*/
        switch (sym_map_5724501439696105(l, data)) {
            case 0:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*18:58 expression_statements_group_023_108=>• expression*/
                pushFN(data, branch_bd41394530f64266);
                pushFN(data, $expression);
                return 0;
            case 1:
                /*44:129 identifier=>• tk:identifier_token
                50:143 modifier_list=>• [ modifier_list_HC_listbody1_120 ]*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if (l.current_byte == 91/*[[]*/) {
                    /*
                       50:143 modifier_list=>• [ modifier_list_HC_listbody1_120 ]
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    /*50:143 modifier_list=>• [ modifier_list_HC_listbody1_120 ]*/
                    pushFN(data, branch_6daab6971c75715b);
                    pushFN(data, $modifier_list);
                    return 0;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else {
                    /*
                       44:129 identifier=>• tk:identifier_token
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    /*44:129 identifier=>• tk:identifier_token*/
                    pushFN(data, branch_11d890e1265c30e7);
                    pushFN(data, $identifier);
                    return 0;
                }
            default:
                break;
        }
        return -1;
    }
    function $expression_statements_group_023_108_goto(l, data, state, prod) {
        while (1) {
            switch (prod) {
                case 26:
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    /*25:80 binary_expression=>unary_expression • operator
                    25:81 binary_expression=>unary_expression • operator expression
                    25:82 binary_expression=>unary_expression •*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    if (!((l.current_byte == 61/*[=]*/) || l.isSym(true, data)) || (/*[<<--]*/cmpr_set(l, data, 19, 4, 4) || assert_ascii(l, 0x0, 0xc001210, 0xa8000000, 0x20000000))) {
                        /*
                           25:82 binary_expression=>unary_expression •
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*25:82 binary_expression=>unary_expression •*/
                        return 18;
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    } else if ((l.current_byte == 61/*[=]*/) || l.isSym(true, data)) {
                        /*
                           25:80 binary_expression=>unary_expression • operator
                           25:81 binary_expression=>unary_expression • operator expression
                        */
                        /*25:80 binary_expression=>unary_expression • operator
                        25:81 binary_expression=>unary_expression • operator expression*/
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                        pushFN(data, branch_26d65826c7f31d39);
                        pushFN(data, $operator);
                        return 0;
                    }
                    break;
                case 28:
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    /*22:76 assignment_expression=>left_hand_expression • = expression
                    27:85 unary_value=>left_hand_expression •*/
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    if (l.current_byte == 61/*[=]*/) {
                        /*
                           22:76 assignment_expression=>left_hand_expression • = expression
                           27:85 unary_value=>left_hand_expression •
                        */
                        /*22:76 assignment_expression=>left_hand_expression • = expression
                        27:85 unary_value=>left_hand_expression •*/
                        let pk = l.copy();
                        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, false);
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        if (((((((((((((/*[if]*/cmpr_set(pk, data, 142, 2, 2) ||/*[match]*/cmpr_set(pk, data, 66, 5, 5)) || dt_bcea2102060eab13(pk, data)) || dt_6ae31dd85a62ef5c(pk, data)) ||/*[true]*/cmpr_set(pk, data, 94, 4, 4)) ||/*[null]*/cmpr_set(pk, data, 34, 4, 4)) ||/*[<<--]*/cmpr_set(pk, data, 19, 4, 4)) ||/*[break]*/cmpr_set(pk, data, 71, 5, 5)) ||/*[return]*/cmpr_set(pk, data, 76, 6, 6)) ||/*[continue]*/cmpr_set(pk, data, 38, 8, 8)) ||/*[loop]*/cmpr_set(pk, data, 62, 4, 4)) || assert_ascii(pk, 0x0, 0x20000194, 0x88000000, 0x8000000)) || pk.isUniID(data)) || pk.isNum(data)) {
                            /*
                               22:76 assignment_expression=>left_hand_expression • = expression
                            */
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                            /*22:76 assignment_expression=>left_hand_expression • = expression*/
                            consume(l, data, state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                            pushFN(data, branch_5e20402ff8e2ff2f);
                            pushFN(data, $expression);
                            return 0;
                            /*⤋⤋⤋ peek-unresolved ⤋⤋⤋*/
                        } else {
                            /*
                               22:76 assignment_expression=>left_hand_expression • = expression
                               27:85 unary_value=>left_hand_expression •
                            */
                            /*-------------VPROD-------------------------*/
                            /*22:76 assignment_expression=>left_hand_expression • = expression
                            27:85 unary_value=>left_hand_expression •*/
                            pushFN(data, branch_8ef88dea09c04d33);
                            return 0;
                        }
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    } else {
                        /*
                           27:85 unary_value=>left_hand_expression •
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*27:85 unary_value=>left_hand_expression •*/
                        prod = 26;
                        continue;;
                    }
                    break;
                case 37:
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    /*28:91 left_hand_expression=>member_expression •
                    37:116 member_expression=>member_expression • [ expression ]
                    37:115 member_expression=>member_expression • . identifier
                    36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                    36:114 call_expression=>member_expression • ( )*/
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    if (l.current_byte == 91/*[[]*/) {
                        /*
                           28:91 left_hand_expression=>member_expression •
                           37:116 member_expression=>member_expression • [ expression ]
                        */
                        /*28:91 left_hand_expression=>member_expression •
                        37:116 member_expression=>member_expression • [ expression ]*/
                        let pk = l.copy();
                        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, false);
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        if (!((((((((((((((/*[if]*/cmpr_set(pk, data, 142, 2, 2) ||/*[match]*/cmpr_set(pk, data, 66, 5, 5)) || dt_bcea2102060eab13(pk, data)) || dt_6ae31dd85a62ef5c(pk, data)) ||/*[true]*/cmpr_set(pk, data, 94, 4, 4)) ||/*[null]*/cmpr_set(pk, data, 34, 4, 4)) ||/*[<<--]*/cmpr_set(pk, data, 19, 4, 4)) ||/*[break]*/cmpr_set(pk, data, 71, 5, 5)) ||/*[return]*/cmpr_set(pk, data, 76, 6, 6)) ||/*[continue]*/cmpr_set(pk, data, 38, 8, 8)) ||/*[loop]*/cmpr_set(pk, data, 62, 4, 4)) || assert_ascii(pk, 0x0, 0x20000194, 0x88000000, 0x8000000)) || pk.isUniID(data)) || pk.isNum(data)) || pk.isSym(true, data)) || (((dt_a0570d6d5c8952c6(pk, data) ||/*[export]*/cmpr_set(pk, data, 56, 6, 6)) ||/*[mut]*/cmpr_set(pk, data, 116, 3, 3)) ||/*[imut]*/cmpr_set(pk, data, 115, 4, 4))) {
                            /*
                               28:91 left_hand_expression=>member_expression •
                            */
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                            /*28:91 left_hand_expression=>member_expression •*/
                            prod = 28;
                            continue;;
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        } else if (((((((((((((/*[if]*/cmpr_set(pk, data, 142, 2, 2) ||/*[match]*/cmpr_set(pk, data, 66, 5, 5)) || dt_bcea2102060eab13(pk, data)) || dt_6ae31dd85a62ef5c(pk, data)) ||/*[true]*/cmpr_set(pk, data, 94, 4, 4)) ||/*[null]*/cmpr_set(pk, data, 34, 4, 4)) ||/*[<<--]*/cmpr_set(pk, data, 19, 4, 4)) ||/*[break]*/cmpr_set(pk, data, 71, 5, 5)) ||/*[return]*/cmpr_set(pk, data, 76, 6, 6)) ||/*[continue]*/cmpr_set(pk, data, 38, 8, 8)) ||/*[loop]*/cmpr_set(pk, data, 62, 4, 4)) || assert_ascii(pk, 0x0, 0x20000194, 0x88000000, 0x8000000)) || pk.isNum(data)) || pk.isSym(true, data)) {
                            /*
                               37:116 member_expression=>member_expression • [ expression ]
                            */
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                            /*37:116 member_expression=>member_expression • [ expression ]*/
                            consume(l, data, state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                            pushFN(data, branch_b92f5e276fda3d40);
                            pushFN(data, $expression);
                            return 0;
                            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                        } else {
                            /*
                               37:116 member_expression=>member_expression • [ expression ]
                            */
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                            /*37:116 member_expression=>member_expression • [ expression ]*/
                            consume(l, data, state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                            pushFN(data, branch_b92f5e276fda3d40);
                            pushFN(data, $expression);
                            return 0;
                        }
                        /*⤋⤋⤋ assert ⤋⤋⤋*/
                    } else if (l.current_byte == 46/*[.]*/) {
                        /*
                           37:115 member_expression=>member_expression • . identifier
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert ⤋⤋⤋*/
                        /*37:115 member_expression=>member_expression • . identifier*/
                        consume(l, data, state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                        pushFN(data, branch_dac9d2928bf85808);
                        pushFN(data, $identifier);
                        return 0;
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    } else if (l.current_byte == 40/*[(]*/) {
                        /*
                           36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                           36:114 call_expression=>member_expression • ( )
                        */
                        /*36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                        36:114 call_expression=>member_expression • ( )*/
                        let pk = l.copy();
                        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, false);
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        if (pk.current_byte == 41/*[)]*/) {
                            /*
                               36:114 call_expression=>member_expression • ( )
                            */
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                            /*36:114 call_expression=>member_expression • ( )*/
                            consume(l, data, state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                            if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
                                add_reduce(state, data, 3, 63);
                                pushFN(data, $expression_statements_group_023_108_goto);
                                return 26;
                            }
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        } else {
                            /*
                               36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                            */
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                            /*36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )*/
                            consume(l, data, state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                            pushFN(data, branch_6039570ac1ec94fc);
                            pushFN(data, $call_expression_HC_listbody2_114);
                            return 0;
                        }
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    } else {
                        /*
                           28:91 left_hand_expression=>member_expression •
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*28:91 left_hand_expression=>member_expression •*/
                        prod = 28;
                        continue;;
                    }
                    break;
                case 44:
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    /*37:117 member_expression=>identifier •
                    43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                    43:128 primitive_declaration=>identifier • : type*/
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    if (l.current_byte == 58/*[:]*/) {
                        /*
                           37:117 member_expression=>identifier •
                           43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                           43:128 primitive_declaration=>identifier • : type
                        */
                        /*37:117 member_expression=>identifier •
                        43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                        43:128 primitive_declaration=>identifier • : type*/
                        let pk = l.copy();
                        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, false);
                        switch (sym_map_7627bccd5d23a320(pk, data)) {
                            case 0:
                                /*43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                                43:128 primitive_declaration=>identifier • : type*/
                                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                                consume(l, data, state);
                                /*43:126 primitive_declaration=>identifier : • type primitive_declaration_group_169_116
                                43:128 primitive_declaration=>identifier : • type*/
                                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                                pushFN(data, branch_2cf4b2ac4601be86);
                                pushFN(data, $type);
                                return 0;
                            default:
                            case 1:
                                /*--LEAF--*/
                                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                                /*37:117 member_expression=>identifier •*/
                                add_reduce(state, data, 1, 66);
                                prod = 37;
                                continue;;
                            case 2:
                                /*-------------VPROD-------------------------*/
                                /*37:117 member_expression=>identifier •
                                43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                                43:128 primitive_declaration=>identifier • : type*/
                                pushFN(data, branch_cf17702f971644c3);
                                return 0;
                        }
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    } else {
                        /*
                           37:117 member_expression=>identifier •
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*37:117 member_expression=>identifier •*/
                        add_reduce(state, data, 1, 66);
                        prod = 37;
                        continue;;
                    }
                    break;
                case 50:
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    /*14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
                    14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
                    14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
                    14:50 function_expression=>modifier_list • fn : type ( ) { }
                    43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
                    43:127 primitive_declaration=>modifier_list • identifier : type*/
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    if (/*[fn]*/cmpr_set(l, data, 143, 2, 2)) {
                        /*
                           14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
                           14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
                           14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
                           14:50 function_expression=>modifier_list • fn : type ( ) { }
                        */
                        /*14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
                        14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
                        14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
                        14:50 function_expression=>modifier_list • fn : type ( ) { }*/
                        /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                        consume(l, data, state);
                        /*14:44 function_expression=>modifier_list fn • : type ( parameters ) { expression_statements }
                        14:46 function_expression=>modifier_list fn • : type ( ) { expression_statements }
                        14:47 function_expression=>modifier_list fn • : type ( parameters ) { }
                        14:50 function_expression=>modifier_list fn • : type ( ) { }*/
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                        if (l.current_byte == 58/*[:]*/) {
                            /*
                               14:44 function_expression=>modifier_list fn : • type ( parameters ) { expression_statements }
                               14:46 function_expression=>modifier_list fn : • type ( ) { expression_statements }
                               14:47 function_expression=>modifier_list fn : • type ( parameters ) { }
                               14:50 function_expression=>modifier_list fn : • type ( ) { }
                            */
                            consume(l, data, state);
                            /*14:44 function_expression=>modifier_list fn : • type ( parameters ) { expression_statements }
                            14:46 function_expression=>modifier_list fn : • type ( ) { expression_statements }
                            14:47 function_expression=>modifier_list fn : • type ( parameters ) { }
                            14:50 function_expression=>modifier_list fn : • type ( ) { }*/
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                            pushFN(data, branch_d5e7716c2a7c7576);
                            pushFN(data, $type);
                            return 0;
                        }
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    } else if (((l.current_byte == 95/*[_]*/) || (l.current_byte == 36/*[$]*/)) || l.isUniID(data)) {
                        /*
                           43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
                           43:127 primitive_declaration=>modifier_list • identifier : type
                        */
                        /*43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
                        43:127 primitive_declaration=>modifier_list • identifier : type*/
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                        pushFN(data, branch_97d12074ee5984bb);
                        pushFN(data, $identifier);
                        return 0;
                    }
                    break;
            }
            break;
        }
        return prod == 18 ? prod : -1;
    }
/*production name: expression_statements_group_124_109
            grammar index: 19
            bodies:
	19:60 expression_statements_group_124_109=>• expression_statements_HC_listbody1_107 expression_statements_group_023_108 - 
		19:61 expression_statements_group_124_109=>• expression_statements_HC_listbody1_107 - 
            compile time: 19.931ms*/;
    function $expression_statements_group_124_109(l, data, state) {
        /*19:60 expression_statements_group_124_109=>• expression_statements_HC_listbody1_107 expression_statements_group_023_108
        19:61 expression_statements_group_124_109=>• expression_statements_HC_listbody1_107*/
        pushFN(data, branch_2e5412a0cf7f9dc2);
        pushFN(data, $expression_statements_HC_listbody1_107);
        return 0;
        return -1;
    }
/*production name: expression_statements
            grammar index: 20
            bodies:
	20:62 expression_statements=>• expression_statements expression_statements_group_124_109 - 
		20:63 expression_statements=>• expression - 
		20:64 expression_statements=>• primitive_declaration - 
            compile time: 4068.577ms*/;
    function $expression_statements(l, data, state) {
        /*20:63 expression_statements=>• expression
        20:64 expression_statements=>• primitive_declaration*/
        switch (sym_map_5724501439696105(l, data)) {
            case 0:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*20:63 expression_statements=>• expression*/
                pushFN(data, branch_dd5c1e4a566fe3e5);
                pushFN(data, $expression);
                return 0;
            case 1:
                /*44:129 identifier=>• tk:identifier_token
                50:143 modifier_list=>• [ modifier_list_HC_listbody1_120 ]*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if (l.current_byte == 91/*[[]*/) {
                    /*
                       50:143 modifier_list=>• [ modifier_list_HC_listbody1_120 ]
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    /*50:143 modifier_list=>• [ modifier_list_HC_listbody1_120 ]*/
                    pushFN(data, branch_c0e3727d9ff912b9);
                    pushFN(data, $modifier_list);
                    return 0;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else {
                    /*
                       44:129 identifier=>• tk:identifier_token
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    /*44:129 identifier=>• tk:identifier_token*/
                    pushFN(data, branch_97946dd38e34dd15);
                    pushFN(data, $identifier);
                    return 0;
                }
            default:
                break;
        }
        return -1;
    }
    function $expression_statements_goto(l, data, state, prod) {
        while (1) {
            switch (prod) {
                case 20:
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
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
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    if (l.current_byte == 59/*[;]*/) {
                        /*
                           20:62 expression_statements=>expression_statements • expression_statements_group_124_109
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                        /*20:62 expression_statements=>expression_statements • expression_statements_group_124_109*/
                        pushFN(data, branch_f14c9e5173466901);
                        pushFN(data, $expression_statements_group_124_109);
                        return 0;
                    }
                    break;
                case 26:
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    /*25:80 binary_expression=>unary_expression • operator
                    25:81 binary_expression=>unary_expression • operator expression
                    25:82 binary_expression=>unary_expression •*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    if (!((l.current_byte == 61/*[=]*/) || l.isSym(true, data)) || (/*[<<--]*/cmpr_set(l, data, 19, 4, 4) || assert_ascii(l, 0x0, 0xc001210, 0xa8000000, 0x20000000))) {
                        /*
                           25:82 binary_expression=>unary_expression •
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*25:82 binary_expression=>unary_expression •*/
                        add_reduce(state, data, 1, 3);
                        return 20;
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    } else if ((l.current_byte == 61/*[=]*/) || l.isSym(true, data)) {
                        /*
                           25:80 binary_expression=>unary_expression • operator
                           25:81 binary_expression=>unary_expression • operator expression
                        */
                        /*25:80 binary_expression=>unary_expression • operator
                        25:81 binary_expression=>unary_expression • operator expression*/
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                        pushFN(data, branch_71318b3fdb03d356);
                        pushFN(data, $operator);
                        return 0;
                    }
                    break;
                case 28:
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    /*22:76 assignment_expression=>left_hand_expression • = expression
                    27:85 unary_value=>left_hand_expression •*/
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    if (l.current_byte == 61/*[=]*/) {
                        /*
                           22:76 assignment_expression=>left_hand_expression • = expression
                           27:85 unary_value=>left_hand_expression •
                        */
                        /*22:76 assignment_expression=>left_hand_expression • = expression
                        27:85 unary_value=>left_hand_expression •*/
                        let pk = l.copy();
                        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, false);
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        if (((((((((((((/*[if]*/cmpr_set(pk, data, 142, 2, 2) ||/*[match]*/cmpr_set(pk, data, 66, 5, 5)) || dt_bcea2102060eab13(pk, data)) || dt_6ae31dd85a62ef5c(pk, data)) ||/*[true]*/cmpr_set(pk, data, 94, 4, 4)) ||/*[null]*/cmpr_set(pk, data, 34, 4, 4)) ||/*[<<--]*/cmpr_set(pk, data, 19, 4, 4)) ||/*[break]*/cmpr_set(pk, data, 71, 5, 5)) ||/*[return]*/cmpr_set(pk, data, 76, 6, 6)) ||/*[continue]*/cmpr_set(pk, data, 38, 8, 8)) ||/*[loop]*/cmpr_set(pk, data, 62, 4, 4)) || assert_ascii(pk, 0x0, 0x20000194, 0x88000000, 0x8000000)) || pk.isUniID(data)) || pk.isNum(data)) {
                            /*
                               22:76 assignment_expression=>left_hand_expression • = expression
                            */
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                            /*22:76 assignment_expression=>left_hand_expression • = expression*/
                            consume(l, data, state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                            pushFN(data, branch_1b02061e2d759869);
                            pushFN(data, $expression);
                            return 0;
                            /*⤋⤋⤋ peek-unresolved ⤋⤋⤋*/
                        } else {
                            /*
                               22:76 assignment_expression=>left_hand_expression • = expression
                               27:85 unary_value=>left_hand_expression •
                            */
                            /*-------------VPROD-------------------------*/
                            /*22:76 assignment_expression=>left_hand_expression • = expression
                            27:85 unary_value=>left_hand_expression •*/
                            pushFN(data, branch_09e6facc48babb83);
                            return 0;
                        }
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    } else {
                        /*
                           27:85 unary_value=>left_hand_expression •
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*27:85 unary_value=>left_hand_expression •*/
                        prod = 26;
                        continue;;
                    }
                    break;
                case 37:
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    /*28:91 left_hand_expression=>member_expression •
                    37:116 member_expression=>member_expression • [ expression ]
                    37:115 member_expression=>member_expression • . identifier
                    36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                    36:114 call_expression=>member_expression • ( )*/
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    if (l.current_byte == 91/*[[]*/) {
                        /*
                           28:91 left_hand_expression=>member_expression •
                           37:116 member_expression=>member_expression • [ expression ]
                        */
                        /*28:91 left_hand_expression=>member_expression •
                        37:116 member_expression=>member_expression • [ expression ]*/
                        let pk = l.copy();
                        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, false);
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        if (!((((((((((((((/*[if]*/cmpr_set(pk, data, 142, 2, 2) ||/*[match]*/cmpr_set(pk, data, 66, 5, 5)) || dt_bcea2102060eab13(pk, data)) || dt_6ae31dd85a62ef5c(pk, data)) ||/*[true]*/cmpr_set(pk, data, 94, 4, 4)) ||/*[null]*/cmpr_set(pk, data, 34, 4, 4)) ||/*[<<--]*/cmpr_set(pk, data, 19, 4, 4)) ||/*[break]*/cmpr_set(pk, data, 71, 5, 5)) ||/*[return]*/cmpr_set(pk, data, 76, 6, 6)) ||/*[continue]*/cmpr_set(pk, data, 38, 8, 8)) ||/*[loop]*/cmpr_set(pk, data, 62, 4, 4)) || assert_ascii(pk, 0x0, 0x20000194, 0x88000000, 0x8000000)) || pk.isUniID(data)) || pk.isNum(data)) || pk.isSym(true, data)) || (((dt_a0570d6d5c8952c6(pk, data) ||/*[export]*/cmpr_set(pk, data, 56, 6, 6)) ||/*[mut]*/cmpr_set(pk, data, 116, 3, 3)) ||/*[imut]*/cmpr_set(pk, data, 115, 4, 4))) {
                            /*
                               28:91 left_hand_expression=>member_expression •
                            */
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                            /*28:91 left_hand_expression=>member_expression •*/
                            prod = 28;
                            continue;;
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        } else if (((((((((((((/*[if]*/cmpr_set(pk, data, 142, 2, 2) ||/*[match]*/cmpr_set(pk, data, 66, 5, 5)) || dt_bcea2102060eab13(pk, data)) || dt_6ae31dd85a62ef5c(pk, data)) ||/*[true]*/cmpr_set(pk, data, 94, 4, 4)) ||/*[null]*/cmpr_set(pk, data, 34, 4, 4)) ||/*[<<--]*/cmpr_set(pk, data, 19, 4, 4)) ||/*[break]*/cmpr_set(pk, data, 71, 5, 5)) ||/*[return]*/cmpr_set(pk, data, 76, 6, 6)) ||/*[continue]*/cmpr_set(pk, data, 38, 8, 8)) ||/*[loop]*/cmpr_set(pk, data, 62, 4, 4)) || assert_ascii(pk, 0x0, 0x20000194, 0x88000000, 0x8000000)) || pk.isNum(data)) || pk.isSym(true, data)) {
                            /*
                               37:116 member_expression=>member_expression • [ expression ]
                            */
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                            /*37:116 member_expression=>member_expression • [ expression ]*/
                            consume(l, data, state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                            pushFN(data, branch_f0778db151911113);
                            pushFN(data, $expression);
                            return 0;
                            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                        } else {
                            /*
                               37:116 member_expression=>member_expression • [ expression ]
                            */
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                            /*37:116 member_expression=>member_expression • [ expression ]*/
                            consume(l, data, state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                            pushFN(data, branch_f0778db151911113);
                            pushFN(data, $expression);
                            return 0;
                        }
                        /*⤋⤋⤋ assert ⤋⤋⤋*/
                    } else if (l.current_byte == 46/*[.]*/) {
                        /*
                           37:115 member_expression=>member_expression • . identifier
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert ⤋⤋⤋*/
                        /*37:115 member_expression=>member_expression • . identifier*/
                        consume(l, data, state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                        pushFN(data, branch_90dae087c6326af9);
                        pushFN(data, $identifier);
                        return 0;
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    } else if (l.current_byte == 40/*[(]*/) {
                        /*
                           36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                           36:114 call_expression=>member_expression • ( )
                        */
                        /*36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                        36:114 call_expression=>member_expression • ( )*/
                        let pk = l.copy();
                        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, false);
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        if (pk.current_byte == 41/*[)]*/) {
                            /*
                               36:114 call_expression=>member_expression • ( )
                            */
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                            /*36:114 call_expression=>member_expression • ( )*/
                            consume(l, data, state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                            if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
                                add_reduce(state, data, 3, 63);
                                pushFN(data, $expression_statements_goto);
                                return 26;
                            }
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        } else {
                            /*
                               36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                            */
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                            /*36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )*/
                            consume(l, data, state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                            pushFN(data, branch_732068abaedf0507);
                            pushFN(data, $call_expression_HC_listbody2_114);
                            return 0;
                        }
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    } else {
                        /*
                           28:91 left_hand_expression=>member_expression •
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*28:91 left_hand_expression=>member_expression •*/
                        prod = 28;
                        continue;;
                    }
                    break;
                case 44:
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    /*43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                    43:128 primitive_declaration=>identifier • : type
                    37:117 member_expression=>identifier •*/
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    if (l.current_byte == 58/*[:]*/) {
                        /*
                           43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                           43:128 primitive_declaration=>identifier • : type
                           37:117 member_expression=>identifier •
                        */
                        /*43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                        43:128 primitive_declaration=>identifier • : type
                        37:117 member_expression=>identifier •*/
                        let pk = l.copy();
                        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, false);
                        switch (sym_map_7627bccd5d23a320(pk, data)) {
                            case 0:
                                /*43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                                43:128 primitive_declaration=>identifier • : type*/
                                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                                consume(l, data, state);
                                /*43:126 primitive_declaration=>identifier : • type primitive_declaration_group_169_116
                                43:128 primitive_declaration=>identifier : • type*/
                                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                                pushFN(data, branch_6979de51244c9f74);
                                pushFN(data, $type);
                                return 0;
                            default:
                            case 1:
                                /*--LEAF--*/
                                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                                /*37:117 member_expression=>identifier •*/
                                add_reduce(state, data, 1, 66);
                                prod = 37;
                                continue;;
                            case 2:
                                /*-------------VPROD-------------------------*/
                                /*43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                                43:128 primitive_declaration=>identifier • : type
                                37:117 member_expression=>identifier •*/
                                pushFN(data, branch_559c77aa585df3f1);
                                return 0;
                        }
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    } else {
                        /*
                           37:117 member_expression=>identifier •
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*37:117 member_expression=>identifier •*/
                        add_reduce(state, data, 1, 66);
                        prod = 37;
                        continue;;
                    }
                    break;
                case 50:
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    /*43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
                    43:127 primitive_declaration=>modifier_list • identifier : type
                    14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
                    14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
                    14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
                    14:50 function_expression=>modifier_list • fn : type ( ) { }*/
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    if (/*[fn]*/cmpr_set(l, data, 143, 2, 2)) {
                        /*
                           14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
                           14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
                           14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
                           14:50 function_expression=>modifier_list • fn : type ( ) { }
                        */
                        /*14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
                        14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
                        14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
                        14:50 function_expression=>modifier_list • fn : type ( ) { }*/
                        /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                        consume(l, data, state);
                        /*14:44 function_expression=>modifier_list fn • : type ( parameters ) { expression_statements }
                        14:46 function_expression=>modifier_list fn • : type ( ) { expression_statements }
                        14:47 function_expression=>modifier_list fn • : type ( parameters ) { }
                        14:50 function_expression=>modifier_list fn • : type ( ) { }*/
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                        if (l.current_byte == 58/*[:]*/) {
                            /*
                               14:44 function_expression=>modifier_list fn : • type ( parameters ) { expression_statements }
                               14:46 function_expression=>modifier_list fn : • type ( ) { expression_statements }
                               14:47 function_expression=>modifier_list fn : • type ( parameters ) { }
                               14:50 function_expression=>modifier_list fn : • type ( ) { }
                            */
                            consume(l, data, state);
                            /*14:44 function_expression=>modifier_list fn : • type ( parameters ) { expression_statements }
                            14:46 function_expression=>modifier_list fn : • type ( ) { expression_statements }
                            14:47 function_expression=>modifier_list fn : • type ( parameters ) { }
                            14:50 function_expression=>modifier_list fn : • type ( ) { }*/
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                            pushFN(data, branch_610cf5def71ef4b0);
                            pushFN(data, $type);
                            return 0;
                        }
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    } else if (((l.current_byte == 95/*[_]*/) || (l.current_byte == 36/*[$]*/)) || l.isUniID(data)) {
                        /*
                           43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
                           43:127 primitive_declaration=>modifier_list • identifier : type
                        */
                        /*43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
                        43:127 primitive_declaration=>modifier_list • identifier : type*/
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                        pushFN(data, branch_8c1124384beb40f7);
                        pushFN(data, $identifier);
                        return 0;
                    }
                    break;
            }
            break;
        }
        return prod == 20 ? prod : -1;
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
            compile time: 1582.329ms*/;
    function $expression(l, data, state) {
        /*44:129 identifier=>• tk:identifier_token
        21:66 expression=>• if_expression
        21:67 expression=>• match_expression
        21:68 expression=>• binary_expression
        72:215 template=>• <<-- θnum -->>
        21:69 expression=>• break_expression
        21:70 expression=>• return_expression
        21:71 expression=>• continue_expression
        21:72 expression=>• loop_expression
        21:73 expression=>• { expression_statements }
        21:75 expression=>• { }*/
        switch (sym_map_9af7659b5c440478(l, data)) {
            case 0:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                /*72:215 template=>• <<-- θnum -->>*/
                pushFN(data, branch_ef2dc6f8b6dc9a12);
                pushFN(data, $template);
                return 0;
            case 1:
                /*21:73 expression=>• { expression_statements }
                21:75 expression=>• { }*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l, data, state);
                /*21:73 expression=>{ • expression_statements }
                21:75 expression=>{ • }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if (l.current_byte == 125/*[}]*/) {
                    /*
                       21:75 expression=>{ • }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    /*21:75 expression=>{ • }*/
                    consume(l, data, state);
                    add_reduce(state, data, 2, 41);
                    pushFN(data, $expression_goto);
                    return 21;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else {
                    /*
                       21:73 expression=>{ • expression_statements }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    /*21:73 expression=>{ • expression_statements }*/
                    pushFN(data, branch_50f99c46d94b1746);
                    pushFN(data, $expression_statements);
                    return 0;
                }
            case 2:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*21:66 expression=>• if_expression*/
                pushFN(data, branch_038b1722715d8efb);
                pushFN(data, $if_expression);
                return 0;
            case 3:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*21:67 expression=>• match_expression*/
                pushFN(data, branch_038b1722715d8efb);
                pushFN(data, $match_expression);
                return 0;
            case 4:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*21:69 expression=>• break_expression*/
                pushFN(data, branch_038b1722715d8efb);
                pushFN(data, $break_expression);
                return 0;
            case 5:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*21:70 expression=>• return_expression*/
                pushFN(data, branch_038b1722715d8efb);
                pushFN(data, $return_expression);
                return 0;
            case 6:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*21:71 expression=>• continue_expression*/
                pushFN(data, branch_038b1722715d8efb);
                pushFN(data, $continue_expression);
                return 0;
            case 7:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*21:72 expression=>• loop_expression*/
                pushFN(data, branch_038b1722715d8efb);
                pushFN(data, $loop_expression);
                return 0;
            case 8:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                /*44:129 identifier=>• tk:identifier_token*/
                pushFN(data, branch_df956a767aa948ca);
                pushFN(data, $identifier);
                return 0;
            case 9:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*21:68 expression=>• binary_expression*/
                pushFN(data, branch_038b1722715d8efb);
                pushFN(data, $binary_expression);
                return 0;
            default:
                break;
        }
        return -1;
    }
    function $expression_goto(l, data, state, prod) {
        while (1) {
            switch (prod) {
                case 26:
                    pushFN(data, $expression_goto);
                    pushFN(data, branch_038b1722715d8efb);
                    pushFN(data, branch_038b1722715d8efb);
                    return 21;
                case 28:
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    /*22:76 assignment_expression=>left_hand_expression • = expression
                    27:85 unary_value=>left_hand_expression •*/
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    if (l.current_byte == 61/*[=]*/) {
                        /*
                           22:76 assignment_expression=>left_hand_expression • = expression
                           27:85 unary_value=>left_hand_expression •
                        */
                        /*22:76 assignment_expression=>left_hand_expression • = expression
                        27:85 unary_value=>left_hand_expression •*/
                        let pk = l.copy();
                        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, false);
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        if (((((((((((((/*[if]*/cmpr_set(pk, data, 142, 2, 2) ||/*[match]*/cmpr_set(pk, data, 66, 5, 5)) || dt_bcea2102060eab13(pk, data)) || dt_6ae31dd85a62ef5c(pk, data)) ||/*[true]*/cmpr_set(pk, data, 94, 4, 4)) ||/*[null]*/cmpr_set(pk, data, 34, 4, 4)) ||/*[<<--]*/cmpr_set(pk, data, 19, 4, 4)) ||/*[break]*/cmpr_set(pk, data, 71, 5, 5)) ||/*[return]*/cmpr_set(pk, data, 76, 6, 6)) ||/*[continue]*/cmpr_set(pk, data, 38, 8, 8)) ||/*[loop]*/cmpr_set(pk, data, 62, 4, 4)) || assert_ascii(pk, 0x0, 0x20000194, 0x88000000, 0x8000000)) || pk.isUniID(data)) || pk.isNum(data)) {
                            /*
                               22:76 assignment_expression=>left_hand_expression • = expression
                            */
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                            /*22:76 assignment_expression=>left_hand_expression • = expression*/
                            consume(l, data, state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                            pushFN(data, branch_c24f274588f75184);
                            pushFN(data, $expression);
                            return 0;
                            /*⤋⤋⤋ peek-unresolved ⤋⤋⤋*/
                        } else {
                            /*
                               22:76 assignment_expression=>left_hand_expression • = expression
                               27:85 unary_value=>left_hand_expression •
                            */
                            /*-------------VPROD-------------------------*/
                            /*22:76 assignment_expression=>left_hand_expression • = expression
                            27:85 unary_value=>left_hand_expression •*/
                            pushFN(data, branch_1b4a3e6a54087dcc);
                            return 0;
                        }
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    } else {
                        /*
                           27:85 unary_value=>left_hand_expression •
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*27:85 unary_value=>left_hand_expression •*/
                        prod = 26;
                        continue;;
                    }
                    break;
                case 37:
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    /*28:91 left_hand_expression=>member_expression •
                    37:116 member_expression=>member_expression • [ expression ]
                    37:115 member_expression=>member_expression • . identifier
                    36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                    36:114 call_expression=>member_expression • ( )*/
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    if (l.current_byte == 91/*[[]*/) {
                        /*
                           28:91 left_hand_expression=>member_expression •
                           37:116 member_expression=>member_expression • [ expression ]
                        */
                        /*28:91 left_hand_expression=>member_expression •
                        37:116 member_expression=>member_expression • [ expression ]*/
                        let pk = l.copy();
                        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, false);
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        if (!((((((((((((((/*[if]*/cmpr_set(pk, data, 142, 2, 2) ||/*[match]*/cmpr_set(pk, data, 66, 5, 5)) || dt_bcea2102060eab13(pk, data)) || dt_6ae31dd85a62ef5c(pk, data)) ||/*[true]*/cmpr_set(pk, data, 94, 4, 4)) ||/*[null]*/cmpr_set(pk, data, 34, 4, 4)) ||/*[<<--]*/cmpr_set(pk, data, 19, 4, 4)) ||/*[break]*/cmpr_set(pk, data, 71, 5, 5)) ||/*[return]*/cmpr_set(pk, data, 76, 6, 6)) ||/*[continue]*/cmpr_set(pk, data, 38, 8, 8)) ||/*[loop]*/cmpr_set(pk, data, 62, 4, 4)) || assert_ascii(pk, 0x0, 0x20000194, 0x88000000, 0x8000000)) || pk.isUniID(data)) || pk.isNum(data)) || pk.isSym(true, data)) || (((dt_a0570d6d5c8952c6(pk, data) ||/*[export]*/cmpr_set(pk, data, 56, 6, 6)) ||/*[mut]*/cmpr_set(pk, data, 116, 3, 3)) ||/*[imut]*/cmpr_set(pk, data, 115, 4, 4))) {
                            /*
                               28:91 left_hand_expression=>member_expression •
                            */
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                            /*28:91 left_hand_expression=>member_expression •*/
                            prod = 28;
                            continue;;
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        } else if (((((((((((((/*[if]*/cmpr_set(pk, data, 142, 2, 2) ||/*[match]*/cmpr_set(pk, data, 66, 5, 5)) || dt_bcea2102060eab13(pk, data)) || dt_6ae31dd85a62ef5c(pk, data)) ||/*[true]*/cmpr_set(pk, data, 94, 4, 4)) ||/*[null]*/cmpr_set(pk, data, 34, 4, 4)) ||/*[<<--]*/cmpr_set(pk, data, 19, 4, 4)) ||/*[break]*/cmpr_set(pk, data, 71, 5, 5)) ||/*[return]*/cmpr_set(pk, data, 76, 6, 6)) ||/*[continue]*/cmpr_set(pk, data, 38, 8, 8)) ||/*[loop]*/cmpr_set(pk, data, 62, 4, 4)) || assert_ascii(pk, 0x0, 0x20000194, 0x88000000, 0x8000000)) || pk.isNum(data)) || pk.isSym(true, data)) {
                            /*
                               37:116 member_expression=>member_expression • [ expression ]
                            */
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                            /*37:116 member_expression=>member_expression • [ expression ]*/
                            consume(l, data, state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                            pushFN(data, branch_58a4b098067f580f);
                            pushFN(data, $expression);
                            return 0;
                            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                        } else {
                            /*
                               37:116 member_expression=>member_expression • [ expression ]
                            */
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                            /*37:116 member_expression=>member_expression • [ expression ]*/
                            consume(l, data, state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                            pushFN(data, branch_58a4b098067f580f);
                            pushFN(data, $expression);
                            return 0;
                        }
                        /*⤋⤋⤋ assert ⤋⤋⤋*/
                    } else if (l.current_byte == 46/*[.]*/) {
                        /*
                           37:115 member_expression=>member_expression • . identifier
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert ⤋⤋⤋*/
                        /*37:115 member_expression=>member_expression • . identifier*/
                        consume(l, data, state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                        pushFN(data, branch_f66e9dbe46e8f961);
                        pushFN(data, $identifier);
                        return 0;
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    } else if (l.current_byte == 40/*[(]*/) {
                        /*
                           36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                           36:114 call_expression=>member_expression • ( )
                        */
                        /*36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                        36:114 call_expression=>member_expression • ( )*/
                        let pk = l.copy();
                        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, false);
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        if (pk.current_byte == 41/*[)]*/) {
                            /*
                               36:114 call_expression=>member_expression • ( )
                            */
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                            /*36:114 call_expression=>member_expression • ( )*/
                            consume(l, data, state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                            if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
                                add_reduce(state, data, 3, 63);
                                pushFN(data, $expression_goto);
                                return 26;
                            }
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        } else {
                            /*
                               36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                            */
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                            /*36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )*/
                            consume(l, data, state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                            pushFN(data, branch_586392cbdde1c8d7);
                            pushFN(data, $call_expression_HC_listbody2_114);
                            return 0;
                        }
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    } else {
                        /*
                           28:91 left_hand_expression=>member_expression •
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*28:91 left_hand_expression=>member_expression •*/
                        prod = 28;
                        continue;;
                    }
                    break;
                case 72:
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    /*56:168 value=>template •
                    21:74 expression=>template •*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    if (!((l.current_byte == 61/*[=]*/) || l.isSym(true, data)) || ((/*[<<--]*/cmpr_set(l, data, 19, 4, 4) || assert_ascii(l, 0x0, 0xc001200, 0x28000000, 0x20000000)) || l.END(data))) {
                        /*
                           21:74 expression=>template •
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*21:74 expression=>template •*/
                        add_reduce(state, data, 1, 40);
                        return 21;
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    } else {
                        /*
                           56:168 value=>template •
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*56:168 value=>template •*/
                        add_reduce(state, data, 1, 85);
                        prod = 26;
                        continue;;
                    }
                    break;
            }
            break;
        }
        return prod == 21 ? prod : -1;
    }
/*production name: if_expression_group_139_110
            grammar index: 23
            bodies:
	23:77 if_expression_group_139_110=>• else expression - 
            compile time: 4.338ms*/;
    function $if_expression_group_139_110(l, data, state) {
        /*23:77 if_expression_group_139_110=>• else expression*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (/*[else]*/cmpr_set(l, data, 127, 4, 4)) {
            /*
               23:77 if_expression_group_139_110=>else • expression
            */
            consume(l, data, state);
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*23:77 if_expression_group_139_110=>else • expression*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_e065d9119934ceb8);
            pushFN(data, $expression);
            return 0;
        }
        return -1;
    }
/*production name: if_expression
            grammar index: 24
            bodies:
	24:78 if_expression=>• if expression : expression if_expression_group_139_110 - 
		24:79 if_expression=>• if expression : expression - 
            compile time: 244.418ms*/;
    function $if_expression(l, data, state) {
        /*24:78 if_expression=>• if expression : expression if_expression_group_139_110
        24:79 if_expression=>• if expression : expression*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (/*[if]*/cmpr_set(l, data, 142, 2, 2)) {
            /*
               24:78 if_expression=>if • expression : expression if_expression_group_139_110
               24:79 if_expression=>if • expression : expression
            */
            consume(l, data, state);
            /*24:78 if_expression=>if • expression : expression if_expression_group_139_110
            24:79 if_expression=>if • expression : expression*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_44fc0a336466d84a);
            pushFN(data, $expression);
            return 0;
        }
        return -1;
    }
/*production name: binary_expression
            grammar index: 25
            bodies:
	25:80 binary_expression=>• unary_expression operator - 
		25:81 binary_expression=>• unary_expression operator expression - 
		25:82 binary_expression=>• unary_expression - 
            compile time: 593.456ms*/;
    function $binary_expression(l, data, state) {
        /*25:80 binary_expression=>• unary_expression operator
        25:81 binary_expression=>• unary_expression operator expression
        25:82 binary_expression=>• unary_expression*/
        pushFN(data, branch_82609636a97ae3c0);
        pushFN(data, $unary_expression);
        return 0;
        return -1;
    }
/*production name: unary_expression
            grammar index: 26
            bodies:
	26:83 unary_expression=>• operator unary_value - 
		26:84 unary_expression=>• unary_value - 
            compile time: 20.99ms*/;
    function $unary_expression(l, data, state) {
        /*26:83 unary_expression=>• operator unary_value
        26:84 unary_expression=>• unary_value*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (((((((dt_bcea2102060eab13(l, data) || dt_6ae31dd85a62ef5c(l, data)) ||/*[true]*/cmpr_set(l, data, 94, 4, 4)) ||/*[null]*/cmpr_set(l, data, 34, 4, 4)) ||/*[<<--]*/cmpr_set(l, data, 19, 4, 4)) || assert_ascii(l, 0x0, 0x194, 0x88000000, 0x0)) || l.isUniID(data)) || l.isNum(data)) {
            /*
               26:84 unary_expression=>• unary_value
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*26:84 unary_expression=>• unary_value*/
            pushFN(data, branch_bf312da1e8e7a614);
            pushFN(data, $unary_value);
            return 0;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               26:83 unary_expression=>• operator unary_value
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*26:83 unary_expression=>• operator unary_value*/
            pushFN(data, branch_7c5044a70fbaa6bb);
            pushFN(data, $operator);
            return 0;
        }
        return -1;
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
            compile time: 340.092ms*/;
    function $unary_value(l, data, state) {
        /*44:129 identifier=>• tk:identifier_token
        27:87 unary_value=>• function_expression
        27:88 unary_value=>• value
        27:89 unary_value=>• ( expression_statements_group_023_108 )
        27:90 unary_value=>• ( )*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if (l.current_byte == 40/*[(]*/) {
            /*
               27:89 unary_value=>• ( expression_statements_group_023_108 )
               27:90 unary_value=>• ( )
            */
            /*27:89 unary_value=>• ( expression_statements_group_023_108 )
            27:90 unary_value=>• ( )*/
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l, data, state);
            /*27:89 unary_value=>( • expression_statements_group_023_108 )
            27:90 unary_value=>( • )*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if (l.current_byte == 41/*[)]*/) {
                /*
                   27:90 unary_value=>( • )
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*27:90 unary_value=>( • )*/
                consume(l, data, state);
                add_reduce(state, data, 2, 48);
                pushFN(data, $unary_value_goto);
                return 27;
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   27:89 unary_value=>( • expression_statements_group_023_108 )
                */
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*27:89 unary_value=>( • expression_statements_group_023_108 )*/
                pushFN(data, branch_3879c03d7a2c7a9e);
                pushFN(data, $expression_statements_group_023_108);
                return 0;
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (/*[fn]*/cmpr_set(l, data, 143, 2, 2) || (l.current_byte == 91/*[[]*/)) {
            /*
               27:87 unary_value=>• function_expression
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*27:87 unary_value=>• function_expression*/
            pushFN(data, branch_07c4b2a266e81cdd);
            pushFN(data, $function_expression);
            return 0;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (((((((dt_6ae31dd85a62ef5c(l, data) ||/*[true]*/cmpr_set(l, data, 94, 4, 4)) ||/*[false]*/cmpr_set(l, data, 52, 5, 5)) ||/*[null]*/cmpr_set(l, data, 34, 4, 4)) ||/*[<<--]*/cmpr_set(l, data, 19, 4, 4)) || (l.current_byte == 34/*["]*/)) || (l.current_byte == 39/*[']*/)) || l.isNum(data)) {
            /*
               27:88 unary_value=>• value
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*27:88 unary_value=>• value*/
            pushFN(data, branch_07c4b2a266e81cdd);
            pushFN(data, $value);
            return 0;
            /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        } else {
            /*
               44:129 identifier=>• tk:identifier_token
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
            /*44:129 identifier=>• tk:identifier_token*/
            pushFN(data, branch_c8fc5dc6f9a4578e);
            pushFN(data, $identifier);
            return 0;
        }
        return -1;
    }
    function $unary_value_goto(l, data, state, prod) {
        while (1) {
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*28:91 left_hand_expression=>member_expression •
            37:116 member_expression=>member_expression • [ expression ]
            37:115 member_expression=>member_expression • . identifier
            36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
            36:114 call_expression=>member_expression • ( )*/
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (l.current_byte == 91/*[[]*/) {
                /*
                   28:91 left_hand_expression=>member_expression •
                   37:116 member_expression=>member_expression • [ expression ]
                */
                /*28:91 left_hand_expression=>member_expression •
                37:116 member_expression=>member_expression • [ expression ]*/
                let pk = l.copy();
                skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, false);
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                if (!((((((((((((((/*[if]*/cmpr_set(pk, data, 142, 2, 2) ||/*[match]*/cmpr_set(pk, data, 66, 5, 5)) || dt_bcea2102060eab13(pk, data)) || dt_6ae31dd85a62ef5c(pk, data)) ||/*[true]*/cmpr_set(pk, data, 94, 4, 4)) ||/*[null]*/cmpr_set(pk, data, 34, 4, 4)) ||/*[<<--]*/cmpr_set(pk, data, 19, 4, 4)) ||/*[break]*/cmpr_set(pk, data, 71, 5, 5)) ||/*[return]*/cmpr_set(pk, data, 76, 6, 6)) ||/*[continue]*/cmpr_set(pk, data, 38, 8, 8)) ||/*[loop]*/cmpr_set(pk, data, 62, 4, 4)) || assert_ascii(pk, 0x0, 0x20000194, 0x88000000, 0x8000000)) || pk.isUniID(data)) || pk.isNum(data)) || pk.isSym(true, data)) || (((dt_a0570d6d5c8952c6(pk, data) ||/*[export]*/cmpr_set(pk, data, 56, 6, 6)) ||/*[mut]*/cmpr_set(pk, data, 116, 3, 3)) ||/*[imut]*/cmpr_set(pk, data, 115, 4, 4))) {
                    /*
                       28:91 left_hand_expression=>member_expression •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    /*28:91 left_hand_expression=>member_expression •*/
                    return 27;
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                } else if (((((((((((((/*[if]*/cmpr_set(pk, data, 142, 2, 2) ||/*[match]*/cmpr_set(pk, data, 66, 5, 5)) || dt_bcea2102060eab13(pk, data)) || dt_6ae31dd85a62ef5c(pk, data)) ||/*[true]*/cmpr_set(pk, data, 94, 4, 4)) ||/*[null]*/cmpr_set(pk, data, 34, 4, 4)) ||/*[<<--]*/cmpr_set(pk, data, 19, 4, 4)) ||/*[break]*/cmpr_set(pk, data, 71, 5, 5)) ||/*[return]*/cmpr_set(pk, data, 76, 6, 6)) ||/*[continue]*/cmpr_set(pk, data, 38, 8, 8)) ||/*[loop]*/cmpr_set(pk, data, 62, 4, 4)) || assert_ascii(pk, 0x0, 0x20000194, 0x88000000, 0x8000000)) || pk.isNum(data)) || pk.isSym(true, data)) {
                    /*
                       37:116 member_expression=>member_expression • [ expression ]
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    /*37:116 member_expression=>member_expression • [ expression ]*/
                    consume(l, data, state);
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    pushFN(data, branch_50da32212a93f324);
                    pushFN(data, $expression);
                    return 0;
                    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                } else {
                    /*
                       37:116 member_expression=>member_expression • [ expression ]
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                    /*37:116 member_expression=>member_expression • [ expression ]*/
                    consume(l, data, state);
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    pushFN(data, branch_50da32212a93f324);
                    pushFN(data, $expression);
                    return 0;
                }
                /*⤋⤋⤋ assert ⤋⤋⤋*/
            } else if (l.current_byte == 46/*[.]*/) {
                /*
                   37:115 member_expression=>member_expression • . identifier
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*37:115 member_expression=>member_expression • . identifier*/
                consume(l, data, state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                pushFN(data, branch_dc9a149972249bc1);
                pushFN(data, $identifier);
                return 0;
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            } else if (l.current_byte == 40/*[(]*/) {
                /*
                   36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                   36:114 call_expression=>member_expression • ( )
                */
                /*36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                36:114 call_expression=>member_expression • ( )*/
                let pk = l.copy();
                skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, false);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if (pk.current_byte == 41/*[)]*/) {
                    /*
                       36:114 call_expression=>member_expression • ( )
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    /*36:114 call_expression=>member_expression • ( )*/
                    consume(l, data, state);
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    if ((l.current_byte == 41/*[)]*/) && consume(l, data, state)) {
                        add_reduce(state, data, 3, 63);
                        pushFN(data, $unary_value_goto);
                        return 27;
                    }
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                } else {
                    /*
                       36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    /*36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )*/
                    consume(l, data, state);
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                    pushFN(data, branch_44b44c160d469289);
                    pushFN(data, $call_expression_HC_listbody2_114);
                    return 0;
                }
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            } else {
                /*
                   28:91 left_hand_expression=>member_expression •
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                /*28:91 left_hand_expression=>member_expression •*/
                return 27;
            }
            break;
        }
        return prod == 27 ? prod : -1;
    }
/*production name: loop_expression_group_254_111
            grammar index: 29
            bodies:
	29:92 loop_expression_group_254_111=>• ( expression ) - 
		29:93 loop_expression_group_254_111=>• ( ) - 
            compile time: 8.222ms*/;
    function $loop_expression_group_254_111(l, data, state) {
        /*29:92 loop_expression_group_254_111=>• ( expression )
        29:93 loop_expression_group_254_111=>• ( )*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 40/*[(]*/) {
            /*
               29:92 loop_expression_group_254_111=>( • expression )
               29:93 loop_expression_group_254_111=>( • )
            */
            consume(l, data, state);
            /*29:92 loop_expression_group_254_111=>( • expression )
            29:93 loop_expression_group_254_111=>( • )*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if (l.current_byte == 41/*[)]*/) {
                /*
                   29:93 loop_expression_group_254_111=>( • )
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*29:93 loop_expression_group_254_111=>( • )*/
                consume(l, data, state);
                add_reduce(state, data, 2, 37);
                return 29;
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   29:92 loop_expression_group_254_111=>( • expression )
                */
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*29:92 loop_expression_group_254_111=>( • expression )*/
                pushFN(data, branch_a6f489c38be28a8a);
                pushFN(data, $expression);
                return 0;
            }
        }
        return -1;
    }
/*production name: loop_expression_HC_listbody6_112
            grammar index: 30
            bodies:
	30:94 loop_expression_HC_listbody6_112=>• loop_expression_HC_listbody6_112 , expression - 
		30:95 loop_expression_HC_listbody6_112=>• expression - 
            compile time: 270.961ms*/;
    function $loop_expression_HC_listbody6_112(l, data, state) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*30:95 loop_expression_HC_listbody6_112=>• expression*/
        pushFN(data, branch_e56bbc7571cdf1e6);
        pushFN(data, $expression);
        return 0;
        return -1;
    }
    function $loop_expression_HC_listbody6_112_goto(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*30:94 loop_expression_HC_listbody6_112=>loop_expression_HC_listbody6_112 • , expression
        31:97 loop_expression=>loop ( parameters ; expression ; loop_expression_HC_listbody6_112 • ) expression
        31:99 loop_expression=>loop ( ; expression ; loop_expression_HC_listbody6_112 • ) expression
        31:100 loop_expression=>loop ( parameters ; ; loop_expression_HC_listbody6_112 • ) expression
        31:102 loop_expression=>loop ( ; ; loop_expression_HC_listbody6_112 • ) expression*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if (l.current_byte == 44/*[,]*/) {
            /*
               30:94 loop_expression_HC_listbody6_112=>loop_expression_HC_listbody6_112 • , expression
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*30:94 loop_expression_HC_listbody6_112=>loop_expression_HC_listbody6_112 • , expression*/
            consume(l, data, state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_85479b24ccc90691);
            pushFN(data, $expression);
            return 0;
        }
        return prod == 30 ? prod : -1;
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
            compile time: 6461.989ms*/;
    function $loop_expression(l, data, state) {
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
        if (/*[loop]*/cmpr_set(l, data, 62, 4, 4)) {
            /*
               31:96 loop_expression=>loop • loop_expression_group_254_111 expression
               31:97 loop_expression=>loop • ( parameters ; expression ; loop_expression_HC_listbody6_112 ) expression
               31:98 loop_expression=>loop • ( primitive_declaration in expression ) expression
               31:99 loop_expression=>loop • ( ; expression ; loop_expression_HC_listbody6_112 ) expression
               31:100 loop_expression=>loop • ( parameters ; ; loop_expression_HC_listbody6_112 ) expression
               31:101 loop_expression=>loop • ( parameters ; expression ; ) expression
               31:102 loop_expression=>loop • ( ; ; loop_expression_HC_listbody6_112 ) expression
               31:103 loop_expression=>loop • ( ; expression ; ) expression
               31:104 loop_expression=>loop • ( parameters ; ; ) expression
               31:105 loop_expression=>loop • ( ; ; ) expression
            */
            consume(l, data, state);
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
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (l.current_byte == 40/*[(]*/) {
                /*
                   31:96 loop_expression=>loop • loop_expression_group_254_111 expression
                   31:97 loop_expression=>loop • ( parameters ; expression ; loop_expression_HC_listbody6_112 ) expression
                   31:98 loop_expression=>loop • ( primitive_declaration in expression ) expression
                   31:99 loop_expression=>loop • ( ; expression ; loop_expression_HC_listbody6_112 ) expression
                   31:100 loop_expression=>loop • ( parameters ; ; loop_expression_HC_listbody6_112 ) expression
                   31:101 loop_expression=>loop • ( parameters ; expression ; ) expression
                   31:102 loop_expression=>loop • ( ; ; loop_expression_HC_listbody6_112 ) expression
                   31:103 loop_expression=>loop • ( ; expression ; ) expression
                   31:104 loop_expression=>loop • ( parameters ; ; ) expression
                   31:105 loop_expression=>loop • ( ; ; ) expression
                */
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
                let pk = l.copy();
                skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, false);
                switch (sym_map_c75b750e9764b157(pk, data)) {
                    case 0:
                        /*31:99 loop_expression=>loop • ( ; expression ; loop_expression_HC_listbody6_112 ) expression
                        31:102 loop_expression=>loop • ( ; ; loop_expression_HC_listbody6_112 ) expression
                        31:103 loop_expression=>loop • ( ; expression ; ) expression
                        31:105 loop_expression=>loop • ( ; ; ) expression*/
                        /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                        consume(l, data, state);
                        /*31:99 loop_expression=>loop ( • ; expression ; loop_expression_HC_listbody6_112 ) expression
                        31:102 loop_expression=>loop ( • ; ; loop_expression_HC_listbody6_112 ) expression
                        31:103 loop_expression=>loop ( • ; expression ; ) expression
                        31:105 loop_expression=>loop ( • ; ; ) expression*/
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                        if (l.current_byte == 59/*[;]*/) {
                            /*
                               31:99 loop_expression=>loop ( ; • expression ; loop_expression_HC_listbody6_112 ) expression
                               31:102 loop_expression=>loop ( ; • ; loop_expression_HC_listbody6_112 ) expression
                               31:103 loop_expression=>loop ( ; • expression ; ) expression
                               31:105 loop_expression=>loop ( ; • ; ) expression
                            */
                            consume(l, data, state);
                            /*31:99 loop_expression=>loop ( ; • expression ; loop_expression_HC_listbody6_112 ) expression
                            31:103 loop_expression=>loop ( ; • expression ; ) expression
                            31:102 loop_expression=>loop ( ; • ; loop_expression_HC_listbody6_112 ) expression
                            31:105 loop_expression=>loop ( ; • ; ) expression*/
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                            if (l.current_byte == 59/*[;]*/) {
                                /*
                                   31:102 loop_expression=>loop ( ; • ; loop_expression_HC_listbody6_112 ) expression
                                   31:105 loop_expression=>loop ( ; • ; ) expression
                                */
                                /*31:102 loop_expression=>loop ( ; • ; loop_expression_HC_listbody6_112 ) expression
                                31:105 loop_expression=>loop ( ; • ; ) expression*/
                                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                                consume(l, data, state);
                                /*31:102 loop_expression=>loop ( ; ; • loop_expression_HC_listbody6_112 ) expression
                                31:105 loop_expression=>loop ( ; ; • ) expression*/
                                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                                /*⤋⤋⤋ assert ⤋⤋⤋*/
                                if (l.current_byte == 41/*[)]*/) {
                                    /*
                                       31:105 loop_expression=>loop ( ; ; • ) expression
                                    */
                                    /*--LEAF--*/
                                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                                    /*31:105 loop_expression=>loop ( ; ; • ) expression*/
                                    consume(l, data, state);
                                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                                    pushFN(data, branch_e5d37b956339712f);
                                    pushFN(data, $expression);
                                    return 0;
                                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                                } else {
                                    /*
                                       31:102 loop_expression=>loop ( ; ; • loop_expression_HC_listbody6_112 ) expression
                                    */
                                    /*--LEAF--*/
                                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                                    /*31:102 loop_expression=>loop ( ; ; • loop_expression_HC_listbody6_112 ) expression*/
                                    pushFN(data, branch_12d4d051e95c361b);
                                    pushFN(data, $loop_expression_HC_listbody6_112);
                                    return 0;
                                }
                                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                            } else {
                                /*
                                   31:99 loop_expression=>loop ( ; • expression ; loop_expression_HC_listbody6_112 ) expression
                                   31:103 loop_expression=>loop ( ; • expression ; ) expression
                                */
                                /*31:99 loop_expression=>loop ( ; • expression ; loop_expression_HC_listbody6_112 ) expression
                                31:103 loop_expression=>loop ( ; • expression ; ) expression*/
                                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                                pushFN(data, branch_639299995443b2b6);
                                pushFN(data, $expression);
                                return 0;
                            }
                        }
                    case 1:
                        /*--LEAF--*/
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                        /*31:96 loop_expression=>loop • loop_expression_group_254_111 expression*/
                        pushFN(data, branch_0a63f05ef1aa2163);
                        pushFN(data, $loop_expression_group_254_111);
                        return 0;
                    case 2:
                        /*-------------VPROD-------------------------*/
                        /*31:96 loop_expression=>loop • loop_expression_group_254_111 expression
                        31:97 loop_expression=>loop • ( parameters ; expression ; loop_expression_HC_listbody6_112 ) expression
                        31:100 loop_expression=>loop • ( parameters ; ; loop_expression_HC_listbody6_112 ) expression
                        31:101 loop_expression=>loop • ( parameters ; expression ; ) expression
                        31:104 loop_expression=>loop • ( parameters ; ; ) expression
                        31:98 loop_expression=>loop • ( primitive_declaration in expression ) expression*/
                        pushFN(data, branch_ea7ab158647a8bdb);
                        return 0;
                    default:
                        break;
                }
            }
        }
        return -1;
    }
/*production name: match_expression_HC_listbody3_113
            grammar index: 32
            bodies:
	32:106 match_expression_HC_listbody3_113=>• match_expression_HC_listbody3_113 , match_clause - 
		32:107 match_expression_HC_listbody3_113=>• match_clause - 
            compile time: 217.188ms*/;
    function $match_expression_HC_listbody3_113(l, data, state) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*32:107 match_expression_HC_listbody3_113=>• match_clause*/
        pushFN(data, branch_78aa7468cfc4789b);
        pushFN(data, $match_clause);
        return 0;
        return -1;
    }
    function $match_expression_HC_listbody3_113_goto(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*32:106 match_expression_HC_listbody3_113=>match_expression_HC_listbody3_113 • , match_clause
        33:108 match_expression=>match expression : match_expression_HC_listbody3_113 •*/
        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
        if (l.current_byte == 44/*[,]*/) {
            /*
               32:106 match_expression_HC_listbody3_113=>match_expression_HC_listbody3_113 • , match_clause
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
            /*32:106 match_expression_HC_listbody3_113=>match_expression_HC_listbody3_113 • , match_clause*/
            consume(l, data, state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_7d515c25abc23648);
            pushFN(data, $match_clause);
            return 0;
        }
        return prod == 32 ? prod : -1;
    }
/*production name: match_expression
            grammar index: 33
            bodies:
	33:108 match_expression=>• match expression : match_expression_HC_listbody3_113 - 
		33:109 match_expression=>• match expression : - 
            compile time: 218.119ms*/;
    function $match_expression(l, data, state) {
        /*33:108 match_expression=>• match expression : match_expression_HC_listbody3_113
        33:109 match_expression=>• match expression :*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (/*[match]*/cmpr_set(l, data, 66, 5, 5)) {
            /*
               33:108 match_expression=>match • expression : match_expression_HC_listbody3_113
               33:109 match_expression=>match • expression :
            */
            consume(l, data, state);
            /*33:108 match_expression=>match • expression : match_expression_HC_listbody3_113
            33:109 match_expression=>match • expression :*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_ae5ecc9a7289734c);
            pushFN(data, $expression);
            return 0;
        }
        return -1;
    }
/*production name: match_clause
            grammar index: 34
            bodies:
	34:110 match_clause=>• expression : expression - 
            compile time: 4.435ms*/;
    function $match_clause(l, data, state) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*34:110 match_clause=>• expression : expression*/
        pushFN(data, branch_e4c5eddd3c274d0e);
        pushFN(data, $expression);
        return 0;
        return -1;
    }
/*production name: call_expression_HC_listbody2_114
            grammar index: 35
            bodies:
	35:111 call_expression_HC_listbody2_114=>• call_expression_HC_listbody2_114 , expression - 
		35:112 call_expression_HC_listbody2_114=>• expression - 
            compile time: 23.065ms*/;
    function $call_expression_HC_listbody2_114(l, data, state) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*35:112 call_expression_HC_listbody2_114=>• expression*/
        pushFN(data, branch_cad3222afff33c8d);
        pushFN(data, $expression);
        return 0;
        return -1;
    }
    function $call_expression_HC_listbody2_114_goto(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*35:111 call_expression_HC_listbody2_114=>call_expression_HC_listbody2_114 • , expression
        36:113 call_expression=>member_expression ( call_expression_HC_listbody2_114 • )*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if (l.current_byte == 44/*[,]*/) {
            /*
               35:111 call_expression_HC_listbody2_114=>call_expression_HC_listbody2_114 • , expression
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*35:111 call_expression_HC_listbody2_114=>call_expression_HC_listbody2_114 • , expression*/
            consume(l, data, state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_a344a7e7c13713a7);
            pushFN(data, $expression);
            return 0;
        }
        return prod == 35 ? prod : -1;
    }
/*production name: break_expression_group_164_115
            grammar index: 38
            bodies:
	38:118 break_expression_group_164_115=>• : expression - 
            compile time: 2.703ms*/;
    function $break_expression_group_164_115(l, data, state) {
        /*38:118 break_expression_group_164_115=>• : expression*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 58/*[:]*/) {
            /*
               38:118 break_expression_group_164_115=>: • expression
            */
            consume(l, data, state);
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*38:118 break_expression_group_164_115=>: • expression*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_a280998f5fd578b8);
            pushFN(data, $expression);
            return 0;
        }
        return -1;
    }
/*production name: break_expression
            grammar index: 39
            bodies:
	39:119 break_expression=>• break break_expression_group_164_115 - 
		39:120 break_expression=>• break - 
            compile time: 400.621ms*/;
    function $break_expression(l, data, state) {
        /*39:119 break_expression=>• break break_expression_group_164_115
        39:120 break_expression=>• break*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (/*[break]*/cmpr_set(l, data, 71, 5, 5)) {
            /*
               39:119 break_expression=>break • break_expression_group_164_115
               39:120 break_expression=>break •
            */
            consume(l, data, state);
            /*39:119 break_expression=>break • break_expression_group_164_115
            39:120 break_expression=>break •*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (l.current_byte == 58/*[:]*/) {
                /*
                   39:119 break_expression=>break • break_expression_group_164_115
                   39:120 break_expression=>break •
                */
                /*39:119 break_expression=>break • break_expression_group_164_115
                39:120 break_expression=>break •*/
                let pk = l.copy();
                skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, false);
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                if (!((((((((((((((/*[if]*/cmpr_set(pk, data, 142, 2, 2) ||/*[match]*/cmpr_set(pk, data, 66, 5, 5)) || dt_bcea2102060eab13(pk, data)) || dt_6ae31dd85a62ef5c(pk, data)) ||/*[true]*/cmpr_set(pk, data, 94, 4, 4)) ||/*[null]*/cmpr_set(pk, data, 34, 4, 4)) ||/*[<<--]*/cmpr_set(pk, data, 19, 4, 4)) ||/*[break]*/cmpr_set(pk, data, 71, 5, 5)) ||/*[return]*/cmpr_set(pk, data, 76, 6, 6)) ||/*[continue]*/cmpr_set(pk, data, 38, 8, 8)) ||/*[loop]*/cmpr_set(pk, data, 62, 4, 4)) || assert_ascii(pk, 0x0, 0x20000194, 0x88000000, 0x8000000)) || pk.isUniID(data)) || pk.isNum(data)) || pk.isSym(true, data)) || (((((/*[else]*/cmpr_set(pk, data, 127, 4, 4) || dt_4a896e8627f36237(pk, data)) ||/*[str]*/cmpr_set(pk, data, 46, 3, 3)) ||/*[cls]*/cmpr_set(pk, data, 121, 3, 3)) ||/*[ns]*/cmpr_set(pk, data, 119, 2, 2)) || assert_ascii(pk, 0x0, 0xc001200, 0x20000000, 0x20000000))) {
                    /*
                       39:120 break_expression=>break •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    /*39:120 break_expression=>break •*/
                    add_reduce(state, data, 1, 68);
                    return 39;
                    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                } else {
                    /*
                       39:119 break_expression=>break • break_expression_group_164_115
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                    /*39:119 break_expression=>break • break_expression_group_164_115*/
                    pushFN(data, branch_c05d04c0757c411b);
                    pushFN(data, $break_expression_group_164_115);
                    return 0;
                }
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            } else {
                /*
                   39:120 break_expression=>break •
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                /*39:120 break_expression=>break •*/
                add_reduce(state, data, 1, 68);
                return 39;
            }
        }
        return -1;
    }
/*production name: return_expression
            grammar index: 40
            bodies:
	40:121 return_expression=>• return break_expression_group_164_115 - 
		40:122 return_expression=>• return - 
            compile time: 370.963ms*/;
    function $return_expression(l, data, state) {
        /*40:121 return_expression=>• return break_expression_group_164_115
        40:122 return_expression=>• return*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (/*[return]*/cmpr_set(l, data, 76, 6, 6)) {
            /*
               40:121 return_expression=>return • break_expression_group_164_115
               40:122 return_expression=>return •
            */
            consume(l, data, state);
            /*40:121 return_expression=>return • break_expression_group_164_115
            40:122 return_expression=>return •*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (l.current_byte == 58/*[:]*/) {
                /*
                   40:121 return_expression=>return • break_expression_group_164_115
                   40:122 return_expression=>return •
                */
                /*40:121 return_expression=>return • break_expression_group_164_115
                40:122 return_expression=>return •*/
                let pk = l.copy();
                skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, false);
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                if (!((((((((((((((/*[if]*/cmpr_set(pk, data, 142, 2, 2) ||/*[match]*/cmpr_set(pk, data, 66, 5, 5)) || dt_bcea2102060eab13(pk, data)) || dt_6ae31dd85a62ef5c(pk, data)) ||/*[true]*/cmpr_set(pk, data, 94, 4, 4)) ||/*[null]*/cmpr_set(pk, data, 34, 4, 4)) ||/*[<<--]*/cmpr_set(pk, data, 19, 4, 4)) ||/*[break]*/cmpr_set(pk, data, 71, 5, 5)) ||/*[return]*/cmpr_set(pk, data, 76, 6, 6)) ||/*[continue]*/cmpr_set(pk, data, 38, 8, 8)) ||/*[loop]*/cmpr_set(pk, data, 62, 4, 4)) || assert_ascii(pk, 0x0, 0x20000194, 0x88000000, 0x8000000)) || pk.isUniID(data)) || pk.isNum(data)) || pk.isSym(true, data)) || (((((/*[else]*/cmpr_set(pk, data, 127, 4, 4) || dt_4a896e8627f36237(pk, data)) ||/*[str]*/cmpr_set(pk, data, 46, 3, 3)) ||/*[cls]*/cmpr_set(pk, data, 121, 3, 3)) ||/*[ns]*/cmpr_set(pk, data, 119, 2, 2)) || assert_ascii(pk, 0x0, 0xc001200, 0x20000000, 0x20000000))) {
                    /*
                       40:122 return_expression=>return •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    /*40:122 return_expression=>return •*/
                    add_reduce(state, data, 1, 70);
                    return 40;
                    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                } else {
                    /*
                       40:121 return_expression=>return • break_expression_group_164_115
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                    /*40:121 return_expression=>return • break_expression_group_164_115*/
                    pushFN(data, branch_a6f8c459a3e3352c);
                    pushFN(data, $break_expression_group_164_115);
                    return 0;
                }
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            } else {
                /*
                   40:122 return_expression=>return •
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                /*40:122 return_expression=>return •*/
                add_reduce(state, data, 1, 70);
                return 40;
            }
        }
        return -1;
    }
/*production name: continue_expression
            grammar index: 41
            bodies:
	41:123 continue_expression=>• continue - 
            compile time: 2.216ms*/;
    function $continue_expression(l, data, state) {
        /*41:123 continue_expression=>• continue*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (/*[continue]*/cmpr_set(l, data, 38, 8, 8)) {
            /*
               41:123 continue_expression=>continue •
            */
            consume(l, data, state);
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*41:123 continue_expression=>continue •*/
            add_reduce(state, data, 1, 71);
            return 41;
        }
        return -1;
    }
/*production name: primitive_declaration_group_169_116
            grammar index: 42
            bodies:
	42:124 primitive_declaration_group_169_116=>• = expression - 
            compile time: 3.336ms*/;
    function $primitive_declaration_group_169_116(l, data, state) {
        /*42:124 primitive_declaration_group_169_116=>• = expression*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 61/*[=]*/) {
            /*
               42:124 primitive_declaration_group_169_116=>= • expression
            */
            consume(l, data, state);
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*42:124 primitive_declaration_group_169_116=>= • expression*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_54a2284eebb4a6fc);
            pushFN(data, $expression);
            return 0;
        }
        return -1;
    }
/*production name: primitive_declaration
            grammar index: 43
            bodies:
	43:125 primitive_declaration=>• modifier_list identifier : type primitive_declaration_group_169_116 - 
		43:126 primitive_declaration=>• identifier : type primitive_declaration_group_169_116 - 
		43:127 primitive_declaration=>• modifier_list identifier : type - 
		43:128 primitive_declaration=>• identifier : type - 
            compile time: 277.136ms*/;
    function $primitive_declaration(l, data, state) {
        /*43:125 primitive_declaration=>• modifier_list identifier : type primitive_declaration_group_169_116
        43:127 primitive_declaration=>• modifier_list identifier : type
        43:126 primitive_declaration=>• identifier : type primitive_declaration_group_169_116
        43:128 primitive_declaration=>• identifier : type*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.current_byte == 91/*[[]*/) {
            /*
               43:125 primitive_declaration=>• modifier_list identifier : type primitive_declaration_group_169_116
               43:127 primitive_declaration=>• modifier_list identifier : type
            */
            /*43:125 primitive_declaration=>• modifier_list identifier : type primitive_declaration_group_169_116
            43:127 primitive_declaration=>• modifier_list identifier : type*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_8da952aa6fb1066e);
            pushFN(data, $modifier_list);
            return 0;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               43:126 primitive_declaration=>• identifier : type primitive_declaration_group_169_116
               43:128 primitive_declaration=>• identifier : type
            */
            /*43:126 primitive_declaration=>• identifier : type primitive_declaration_group_169_116
            43:128 primitive_declaration=>• identifier : type*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_44a426357f6f6a27);
            pushFN(data, $identifier);
            return 0;
        }
        return -1;
    }
/*production name: identifier
            grammar index: 44
            bodies:
	44:129 identifier=>• tk:identifier_token - 
            compile time: 1.673ms*/;
    function $identifier(l, data, state) {
        /*44:129 identifier=>• tk:identifier_token*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (tk_896177e00f155ef3(l, data)) {
            /*
               44:129 identifier=>tk:identifier_token •
            */
            consume(l, data, state);
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*44:129 identifier=>tk:identifier_token •*/
            add_reduce(state, data, 1, 76);
            return 44;
        }
        return -1;
    }
/*production name: identifier_token_group_074_117
            grammar index: 45
            bodies:
	45:130 identifier_token_group_074_117=>• θid - 
		45:131 identifier_token_group_074_117=>• _ - 
		45:132 identifier_token_group_074_117=>• $ - 
            compile time: 5.892ms*/;
    function $identifier_token_group_074_117(l, data, state) {
        /*45:130 identifier_token_group_074_117=>• θid
        45:131 identifier_token_group_074_117=>• _
        45:132 identifier_token_group_074_117=>• $*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if (l.isUniID(data)) {
            /*
               45:130 identifier_token_group_074_117=>• θid
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*45:130 identifier_token_group_074_117=>• θid*/
            consume(l, data, state);
            return 45;
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.current_byte == 95/*[_]*/) {
            /*
               45:131 identifier_token_group_074_117=>• _
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*45:131 identifier_token_group_074_117=>• _*/
            consume(l, data, state);
            return 45;
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.current_byte == 36/*[$]*/) {
            /*
               45:132 identifier_token_group_074_117=>• $
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*45:132 identifier_token_group_074_117=>• $*/
            consume(l, data, state);
            return 45;
        }
        return -1;
    }
/*production name: identifier_token_HC_listbody1_118
            grammar index: 46
            bodies:
	46:133 identifier_token_HC_listbody1_118=>• identifier_token_HC_listbody1_118 identifier_token_group_074_117 - 
		46:134 identifier_token_HC_listbody1_118=>• identifier_token_group_074_117 - 
            compile time: 287.413ms*/;
    function $identifier_token_HC_listbody1_118(l, data, state) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*46:134 identifier_token_HC_listbody1_118=>• identifier_token_group_074_117*/
        pushFN(data, branch_d6adce891265bf33);
        pushFN(data, $identifier_token_group_074_117);
        return 0;
        return -1;
    }
    function $identifier_token_HC_listbody1_118_goto(l, data, state, prod) {
        skip_db1786a8af54d666(l/*[ 71 ]*/, data, true);
        if (nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/) {
            return 46;
        }
        /*46:133 identifier_token_HC_listbody1_118=>identifier_token_HC_listbody1_118 • identifier_token_group_074_117
        48:139 identifier_token=>identifier_token_group_074_117 identifier_token_HC_listbody1_118 •
        48:137 identifier_token=>identifier_token_group_074_117 identifier_token_HC_listbody1_118 • identifier_token_group_079_119*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if (l.isUniID(data)) {
            /*
               46:133 identifier_token_HC_listbody1_118=>identifier_token_HC_listbody1_118 • identifier_token_group_074_117
               48:139 identifier_token=>identifier_token_group_074_117 identifier_token_HC_listbody1_118 •
            */
            /*46:133 identifier_token_HC_listbody1_118=>identifier_token_HC_listbody1_118 • identifier_token_group_074_117*/
            let pk = l.copy();
            skip_db1786a8af54d666(pk.next(data)/*[ 71 ]*/, data, false);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            if (nocap_b2eb52235ee30b8a(pk)/*[ws] [nl]*/) {
                /*
                   46:133 identifier_token_HC_listbody1_118=>identifier_token_HC_listbody1_118 • identifier_token_group_074_117
                */
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*46:133 identifier_token_HC_listbody1_118=>identifier_token_HC_listbody1_118 • identifier_token_group_074_117*/
                pushFN(data, branch_2e223495b08c92ba);
                pushFN(data, $identifier_token_group_074_117);
                return 0;
                /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
            } else {
                /*
                   46:133 identifier_token_HC_listbody1_118=>identifier_token_HC_listbody1_118 • identifier_token_group_074_117
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                /*46:133 identifier_token_HC_listbody1_118=>identifier_token_HC_listbody1_118 • identifier_token_group_074_117*/
                pushFN(data, branch_2e223495b08c92ba);
                pushFN(data, $identifier_token_group_074_117);
                return 0;
            }
            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
        } else if ((l.current_byte == 95/*[_]*/) || (l.current_byte == 36/*[$]*/)) {
            /*
               46:133 identifier_token_HC_listbody1_118=>identifier_token_HC_listbody1_118 • identifier_token_group_074_117
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
            /*46:133 identifier_token_HC_listbody1_118=>identifier_token_HC_listbody1_118 • identifier_token_group_074_117*/
            pushFN(data, branch_2e223495b08c92ba);
            pushFN(data, $identifier_token_group_074_117);
            return 0;
        }
        return prod == 46 ? prod : -1;
    }
/*production name: identifier_token_group_079_119
            grammar index: 47
            bodies:
	47:135 identifier_token_group_079_119=>• θws - 
		47:136 identifier_token_group_079_119=>• θnl - 
            compile time: 2.357ms*/;
    function $identifier_token_group_079_119(l, data, state) {
        /*47:135 identifier_token_group_079_119=>• θws
        47:136 identifier_token_group_079_119=>• θnl*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if (nocap_108e16629a73e761(l)/*[ws]*/) {
            /*
               47:135 identifier_token_group_079_119=>• θws
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*47:135 identifier_token_group_079_119=>• θws*/
            consume(l, data, state);
            return 47;
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (nocap_9b1ef04606bbaa09(l)/*[nl]*/) {
            /*
               47:136 identifier_token_group_079_119=>• θnl
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*47:136 identifier_token_group_079_119=>• θnl*/
            consume(l, data, state);
            return 47;
        }
        return -1;
    }
/*production name: identifier_token
            grammar index: 48
            bodies:
	48:137 identifier_token=>• identifier_token_group_074_117 identifier_token_HC_listbody1_118 identifier_token_group_079_119 - 
		48:138 identifier_token=>• identifier_token_group_074_117 identifier_token_group_079_119 - 
		48:139 identifier_token=>• identifier_token_group_074_117 identifier_token_HC_listbody1_118 - 
		48:140 identifier_token=>• identifier_token_group_074_117 - 
            compile time: 770.372ms*/;
    function $identifier_token(l, data, state) {
        /*48:137 identifier_token=>• identifier_token_group_074_117 identifier_token_HC_listbody1_118 identifier_token_group_079_119
        48:138 identifier_token=>• identifier_token_group_074_117 identifier_token_group_079_119
        48:139 identifier_token=>• identifier_token_group_074_117 identifier_token_HC_listbody1_118
        48:140 identifier_token=>• identifier_token_group_074_117*/
        pushFN(data, branch_5dab52696e076a7b);
        pushFN(data, $identifier_token_group_074_117);
        return 0;
        return -1;
    }
/*production name: modifier_list_HC_listbody1_120
            grammar index: 49
            bodies:
	49:141 modifier_list_HC_listbody1_120=>• modifier_list_HC_listbody1_120 modifier - 
		49:142 modifier_list_HC_listbody1_120=>• modifier - 
            compile time: 5.464ms*/;
    function $modifier_list_HC_listbody1_120(l, data, state) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*49:142 modifier_list_HC_listbody1_120=>• modifier*/
        pushFN(data, branch_dc83f428871b16c3);
        pushFN(data, $modifier);
        return 0;
        return -1;
    }
    function $modifier_list_HC_listbody1_120_goto(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        /*49:141 modifier_list_HC_listbody1_120=>modifier_list_HC_listbody1_120 • modifier
        50:143 modifier_list=>[ modifier_list_HC_listbody1_120 • ]*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if ((((dt_a0570d6d5c8952c6(l, data) ||/*[export]*/cmpr_set(l, data, 56, 6, 6)) ||/*[mut]*/cmpr_set(l, data, 116, 3, 3)) ||/*[imut]*/cmpr_set(l, data, 115, 4, 4)) || l.isUniID(data)) {
            /*
               49:141 modifier_list_HC_listbody1_120=>modifier_list_HC_listbody1_120 • modifier
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*49:141 modifier_list_HC_listbody1_120=>modifier_list_HC_listbody1_120 • modifier*/
            pushFN(data, branch_9e5fbae7373ee27c);
            pushFN(data, $modifier);
            return 0;
        }
        return prod == 49 ? prod : -1;
    }
/*production name: modifier_list
            grammar index: 50
            bodies:
	50:143 modifier_list=>• [ modifier_list_HC_listbody1_120 ] - 
            compile time: 2.112ms*/;
    function $modifier_list(l, data, state) {
        /*50:143 modifier_list=>• [ modifier_list_HC_listbody1_120 ]*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 91/*[[]*/) {
            /*
               50:143 modifier_list=>[ • modifier_list_HC_listbody1_120 ]
            */
            consume(l, data, state);
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*50:143 modifier_list=>[ • modifier_list_HC_listbody1_120 ]*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_eadb44ad4e55e10b);
            pushFN(data, $modifier_list_HC_listbody1_120);
            return 0;
        }
        return -1;
    }
/*production name: type_group_086_121
            grammar index: 51
            bodies:
	51:144 type_group_086_121=>• u - 
		51:145 type_group_086_121=>• i - 
		51:146 type_group_086_121=>• uint - 
		51:147 type_group_086_121=>• int - 
            compile time: 2.134ms*/;
    function $type_group_086_121(l, data, state) {
        /*51:144 type_group_086_121=>• u
        51:145 type_group_086_121=>• i
        51:146 type_group_086_121=>• uint
        51:147 type_group_086_121=>• int*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if (l.current_byte == 117/*[u]*/) {
            /*
               51:144 type_group_086_121=>• u
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*51:144 type_group_086_121=>• u*/
            consume(l, data, state);
            return 51;
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.current_byte == 105/*[i]*/) {
            /*
               51:145 type_group_086_121=>• i
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*51:145 type_group_086_121=>• i*/
            consume(l, data, state);
            return 51;
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (/*[uint]*/cmpr_set(l, data, 82, 4, 4)) {
            /*
               51:146 type_group_086_121=>• uint
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*51:146 type_group_086_121=>• uint*/
            consume(l, data, state);
            return 51;
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (/*[int]*/cmpr_set(l, data, 83, 3, 3)) {
            /*
               51:147 type_group_086_121=>• int
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*51:147 type_group_086_121=>• int*/
            consume(l, data, state);
            return 51;
        }
        return -1;
    }
/*production name: type_group_091_122
            grammar index: 52
            bodies:
	52:148 type_group_091_122=>• 8 - 
		52:149 type_group_091_122=>• 16 - 
		52:150 type_group_091_122=>• 32 - 
		52:151 type_group_091_122=>• 64 - 
		52:152 type_group_091_122=>• 128 - 
            compile time: 2.7ms*/;
    function $type_group_091_122(l, data, state) {
        /*52:148 type_group_091_122=>• 8
        52:149 type_group_091_122=>• 16
        52:150 type_group_091_122=>• 32
        52:151 type_group_091_122=>• 64
        52:152 type_group_091_122=>• 128*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if (l.current_byte == 56/*[8]*/) {
            /*
               52:148 type_group_091_122=>• 8
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*52:148 type_group_091_122=>• 8*/
            consume(l, data, state);
            return 52;
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (/*[16]*/cmpr_set(l, data, 131, 2, 2)) {
            /*
               52:149 type_group_091_122=>• 16
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*52:149 type_group_091_122=>• 16*/
            consume(l, data, state);
            return 52;
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (/*[32]*/cmpr_set(l, data, 90, 2, 2)) {
            /*
               52:150 type_group_091_122=>• 32
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*52:150 type_group_091_122=>• 32*/
            consume(l, data, state);
            return 52;
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (/*[64]*/cmpr_set(l, data, 92, 2, 2)) {
            /*
               52:151 type_group_091_122=>• 64
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*52:151 type_group_091_122=>• 64*/
            consume(l, data, state);
            return 52;
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (/*[128]*/cmpr_set(l, data, 87, 3, 3)) {
            /*
               52:152 type_group_091_122=>• 128
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*52:152 type_group_091_122=>• 128*/
            consume(l, data, state);
            return 52;
        }
        return -1;
    }
/*production name: type_group_094_123
            grammar index: 53
            bodies:
	53:153 type_group_094_123=>• f - 
		53:154 type_group_094_123=>• flt - 
            compile time: 1.261ms*/;
    function $type_group_094_123(l, data, state) {
        /*53:153 type_group_094_123=>• f
        53:154 type_group_094_123=>• flt*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if (l.current_byte == 102/*[f]*/) {
            /*
               53:153 type_group_094_123=>• f
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*53:153 type_group_094_123=>• f*/
            consume(l, data, state);
            return 53;
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (/*[flt]*/cmpr_set(l, data, 124, 3, 3)) {
            /*
               53:154 type_group_094_123=>• flt
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*53:154 type_group_094_123=>• flt*/
            consume(l, data, state);
            return 53;
        }
        return -1;
    }
/*production name: type_group_097_124
            grammar index: 54
            bodies:
	54:155 type_group_097_124=>• 32 - 
		54:156 type_group_097_124=>• 64 - 
		54:157 type_group_097_124=>• 128 - 
            compile time: 1.931ms*/;
    function $type_group_097_124(l, data, state) {
        /*54:155 type_group_097_124=>• 32
        54:156 type_group_097_124=>• 64
        54:157 type_group_097_124=>• 128*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if (/*[32]*/cmpr_set(l, data, 90, 2, 2)) {
            /*
               54:155 type_group_097_124=>• 32
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*54:155 type_group_097_124=>• 32*/
            consume(l, data, state);
            return 54;
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (/*[64]*/cmpr_set(l, data, 92, 2, 2)) {
            /*
               54:156 type_group_097_124=>• 64
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*54:156 type_group_097_124=>• 64*/
            consume(l, data, state);
            return 54;
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (/*[128]*/cmpr_set(l, data, 87, 3, 3)) {
            /*
               54:157 type_group_097_124=>• 128
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*54:157 type_group_097_124=>• 128*/
            consume(l, data, state);
            return 54;
        }
        return -1;
    }
/*production name: type
            grammar index: 55
            bodies:
	55:158 type=>• identifier - 
		55:159 type=>• type_group_086_121 type_group_091_122 - 
		55:160 type=>• type_group_094_123 type_group_097_124 - 
		55:161 type=>• string - 
		55:162 type=>• str - 
            compile time: 4.619ms*/;
    function $type(l, data, state) {
        /*55:158 type=>• identifier
        55:159 type=>• type_group_086_121 type_group_091_122
        55:160 type=>• type_group_094_123 type_group_097_124
        55:161 type=>• string
        55:162 type=>• str*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if (/*[str]*/cmpr_set(l, data, 46, 3, 3)) {
            /*
               55:162 type=>• str
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*55:162 type=>• str*/
            consume(l, data, state);
            add_reduce(state, data, 1, 79);
            return 55;
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (/*[string]*/cmpr_set(l, data, 46, 6, 6)) {
            /*
               55:161 type=>• string
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*55:161 type=>• string*/
            consume(l, data, state);
            add_reduce(state, data, 1, 79);
            return 55;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (/*[flt]*/cmpr_set(l, data, 124, 3, 3) || (l.current_byte == 102/*[f]*/)) {
            /*
               55:160 type=>• type_group_094_123 type_group_097_124
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*55:160 type=>• type_group_094_123 type_group_097_124*/
            pushFN(data, branch_aa893c04c09c8ca3);
            pushFN(data, $type_group_094_123);
            return 0;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (((/*[uint]*/cmpr_set(l, data, 82, 4, 4) ||/*[int]*/cmpr_set(l, data, 83, 3, 3)) || (l.current_byte == 117/*[u]*/)) || (l.current_byte == 105/*[i]*/)) {
            /*
               55:159 type=>• type_group_086_121 type_group_091_122
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*55:159 type=>• type_group_086_121 type_group_091_122*/
            pushFN(data, branch_36dfcf8821ceaa50);
            pushFN(data, $type_group_086_121);
            return 0;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               55:158 type=>• identifier
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*55:158 type=>• identifier*/
            pushFN(data, branch_4a365d9ac60db21d);
            pushFN(data, $identifier);
            return 0;
        }
        return -1;
    }
/*production name: value
            grammar index: 56
            bodies:
	56:163 value=>• num - 
		56:164 value=>• tk:string - 
		56:165 value=>• true - 
		56:166 value=>• false - 
		56:167 value=>• null - 
		56:168 value=>• template - 
            compile time: 5.453ms*/;
    function $value(l, data, state) {
        /*56:163 value=>• num
        56:164 value=>• tk:string
        56:165 value=>• true
        56:166 value=>• false
        56:167 value=>• null
        56:168 value=>• template*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (/*[<<--]*/cmpr_set(l, data, 19, 4, 4)) {
            /*
               56:168 value=>• template
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*56:168 value=>• template*/
            pushFN(data, branch_6295ce119e5b66ef);
            pushFN(data, $template);
            return 0;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if ((l.current_byte == 34/*["]*/) || (l.current_byte == 39/*[']*/)) {
            /*
               56:164 value=>• tk:string
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*56:164 value=>• tk:string*/
            if (tk_f70d460017f6375f(l, data) && consume(l, data, state)) {
                add_reduce(state, data, 1, 81);
                return 56;
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (dt_6ae31dd85a62ef5c(l, data) || l.isNum(data)) {
            /*
               56:163 value=>• num
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*56:163 value=>• num*/
            pushFN(data, branch_7a4ba2e124eec285);
            pushFN(data, $num);
            return 0;
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (/*[true]*/cmpr_set(l, data, 94, 4, 4)) {
            /*
               56:165 value=>• true
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*56:165 value=>• true*/
            consume(l, data, state);
            add_reduce(state, data, 1, 82);
            return 56;
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (/*[false]*/cmpr_set(l, data, 52, 5, 5)) {
            /*
               56:166 value=>• false
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*56:166 value=>• false*/
            consume(l, data, state);
            add_reduce(state, data, 1, 83);
            return 56;
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (/*[null]*/cmpr_set(l, data, 34, 4, 4)) {
            /*
               56:167 value=>• null
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*56:167 value=>• null*/
            consume(l, data, state);
            add_reduce(state, data, 1, 84);
            return 56;
        }
        return -1;
    }
/*production name: string_group_0111_125
            grammar index: 57
            bodies:
	57:169 string_group_0111_125=>• θws - 
		57:170 string_group_0111_125=>• θnl - 
		57:171 string_group_0111_125=>• θid - 
		57:172 string_group_0111_125=>• θsym - 
		57:173 string_group_0111_125=>• \" - 
            compile time: 2.06ms*/;
    function $string_group_0111_125(l, data, state) {
        /*57:169 string_group_0111_125=>• θws
        57:170 string_group_0111_125=>• θnl
        57:171 string_group_0111_125=>• θid
        57:172 string_group_0111_125=>• θsym
        57:173 string_group_0111_125=>• \"*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if (l.isSP(true, data)) {
            /*
               57:169 string_group_0111_125=>• θws
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*57:169 string_group_0111_125=>• θws*/
            consume(l, data, state);
            return 57;
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.isNL()) {
            /*
               57:170 string_group_0111_125=>• θnl
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*57:170 string_group_0111_125=>• θnl*/
            consume(l, data, state);
            return 57;
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.isUniID(data)) {
            /*
               57:171 string_group_0111_125=>• θid
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*57:171 string_group_0111_125=>• θid*/
            consume(l, data, state);
            return 57;
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (/*[\"]*/cmpr_set(l, data, 13, 2, 2)) {
            /*
               57:173 string_group_0111_125=>• \"
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*57:173 string_group_0111_125=>• \"*/
            consume(l, data, state);
            return 57;
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.isSym(true, data)) {
            /*
               57:172 string_group_0111_125=>• θsym
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*57:172 string_group_0111_125=>• θsym*/
            consume(l, data, state);
            return 57;
        }
        return -1;
    }
/*production name: string_HC_listbody1_126
            grammar index: 58
            bodies:
	58:174 string_HC_listbody1_126=>• string_HC_listbody1_126 string_group_0111_125 - 
		58:175 string_HC_listbody1_126=>• string_group_0111_125 - 
            compile time: 4.619ms*/;
    function $string_HC_listbody1_126(l, data, state) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*58:175 string_HC_listbody1_126=>• string_group_0111_125*/
        pushFN(data, branch_227c616e124e1e0b);
        pushFN(data, $string_group_0111_125);
        return 0;
        return -1;
    }
    function $string_HC_listbody1_126_goto(l, data, state, prod) {
        skip_db1786a8af54d666(l/*[ 71 ]*/, data, true);
        if (l.current_byte == 34/*["]*/) {
            return 58;
        }
        /*58:174 string_HC_listbody1_126=>string_HC_listbody1_126 • string_group_0111_125
        60:178 string=>" string_HC_listbody1_126 • "*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if ((((/*[\"]*/cmpr_set(l, data, 13, 2, 2) || l.isUniID(data)) || l.isNL()) || l.isSym(true, data)) || l.isSP(true, data)) {
            /*
               58:174 string_HC_listbody1_126=>string_HC_listbody1_126 • string_group_0111_125
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*58:174 string_HC_listbody1_126=>string_HC_listbody1_126 • string_group_0111_125*/
            pushFN(data, branch_1120e25a74dade0c);
            pushFN(data, $string_group_0111_125);
            return 0;
        }
        return prod == 58 ? prod : -1;
    }
/*production name: string_HC_listbody1_127
            grammar index: 59
            bodies:
	59:176 string_HC_listbody1_127=>• string_HC_listbody1_127 string_group_0111_125 - 
		59:177 string_HC_listbody1_127=>• string_group_0111_125 - 
            compile time: 5.558ms*/;
    function $string_HC_listbody1_127(l, data, state) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*59:177 string_HC_listbody1_127=>• string_group_0111_125*/
        pushFN(data, branch_a4106e14bfe619c8);
        pushFN(data, $string_group_0111_125);
        return 0;
        return -1;
    }
    function $string_HC_listbody1_127_goto(l, data, state, prod) {
        skip_db1786a8af54d666(l/*[ 71 ]*/, data, true);
        if (l.current_byte == 39/*[']*/) {
            return 59;
        }
        /*59:176 string_HC_listbody1_127=>string_HC_listbody1_127 • string_group_0111_125
        60:179 string=>' string_HC_listbody1_127 • '*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if ((((/*[\"]*/cmpr_set(l, data, 13, 2, 2) || l.isUniID(data)) || l.isNL()) || l.isSym(true, data)) || l.isSP(true, data)) {
            /*
               59:176 string_HC_listbody1_127=>string_HC_listbody1_127 • string_group_0111_125
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*59:176 string_HC_listbody1_127=>string_HC_listbody1_127 • string_group_0111_125*/
            pushFN(data, branch_626cdf3f87255c10);
            pushFN(data, $string_group_0111_125);
            return 0;
        }
        return prod == 59 ? prod : -1;
    }
/*production name: string
            grammar index: 60
            bodies:
	60:178 string=>• " string_HC_listbody1_126 " - 
		60:179 string=>• ' string_HC_listbody1_127 ' - 
		60:180 string=>• " " - 
		60:181 string=>• ' ' - 
            compile time: 9.386ms*/;
    function $string(l, data, state) {
        /*60:178 string=>• " string_HC_listbody1_126 "
        60:180 string=>• " "
        60:179 string=>• ' string_HC_listbody1_127 '
        60:181 string=>• ' '*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if (l.current_byte == 34/*["]*/) {
            /*
               60:178 string=>• " string_HC_listbody1_126 "
               60:180 string=>• " "
            */
            /*60:178 string=>• " string_HC_listbody1_126 "
            60:180 string=>• " "*/
            let pk = l.copy();
            skip_db1786a8af54d666(pk.next(data)/*[ 71 ]*/, data, false);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (pk.current_byte == 34/*["]*/) {
                /*
                   60:180 string=>• " "
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                /*60:180 string=>• " "*/
                consume(l, data, state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                if ((l.current_byte == 34/*["]*/) && consume(l, data, state)) {
                    add_reduce(state, data, 2, 89);
                    return 60;
                }
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            } else {
                /*
                   60:178 string=>• " string_HC_listbody1_126 "
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                /*60:178 string=>• " string_HC_listbody1_126 "*/
                consume(l, data, state);
                skip_db1786a8af54d666(l/*[ 71 ]*/, data, true);
                pushFN(data, branch_be0df9815fa5883a);
                pushFN(data, $string_HC_listbody1_126);
                return 0;
            }
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else {
            /*
               60:179 string=>• ' string_HC_listbody1_127 '
               60:181 string=>• ' '
            */
            /*60:179 string=>• ' string_HC_listbody1_127 '
            60:181 string=>• ' '*/
            let pk = l.copy();
            skip_db1786a8af54d666(pk.next(data)/*[ 71 ]*/, data, false);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (pk.current_byte == 39/*[']*/) {
                /*
                   60:181 string=>• ' '
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                /*60:181 string=>• ' '*/
                consume(l, data, state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                if ((l.current_byte == 39/*[']*/) && consume(l, data, state)) {
                    add_reduce(state, data, 2, 89);
                    return 60;
                }
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            } else {
                /*
                   60:179 string=>• ' string_HC_listbody1_127 '
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                /*60:179 string=>• ' string_HC_listbody1_127 '*/
                consume(l, data, state);
                skip_db1786a8af54d666(l/*[ 71 ]*/, data, true);
                pushFN(data, branch_63d29c07dd268054);
                pushFN(data, $string_HC_listbody1_127);
                return 0;
            }
        }
        return -1;
    }
/*production name: num
            grammar index: 61
            bodies:
	61:182 num=>• tk:num_tok - 
            compile time: 1.764ms*/;
    function $num(l, data, state) {
        /*61:182 num=>• tk:num_tok*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (tk_b838139d0d011665(l, data)) {
            /*
               61:182 num=>tk:num_tok •
            */
            consume(l, data, state);
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*61:182 num=>tk:num_tok •*/
            return 61;
        }
        return -1;
    }
/*production name: num_tok
            grammar index: 62
            bodies:
	62:183 num_tok=>• def$number - 
		62:184 num_tok=>• def$hex - 
		62:185 num_tok=>• def$binary - 
		62:186 num_tok=>• def$octal - 
            compile time: 3.843ms*/;
    function $num_tok(l, data, state) {
        /*62:183 num_tok=>• def$number
        62:184 num_tok=>• def$hex
        62:185 num_tok=>• def$binary
        62:186 num_tok=>• def$octal*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (l.isNum(data)) {
            /*
               62:183 num_tok=>• def$number
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*62:183 num_tok=>• def$number*/
            pushFN(data, branch_7bd41de4c3b97b3a);
            pushFN(data, $def$number);
            return 0;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (/*[0x]*/cmpr_set(l, data, 26, 2, 2)) {
            /*
               62:184 num_tok=>• def$hex
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*62:184 num_tok=>• def$hex*/
            pushFN(data, branch_7bd41de4c3b97b3a);
            pushFN(data, $def$hex);
            return 0;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if (/*[0b]*/cmpr_set(l, data, 113, 2, 2)) {
            /*
               62:185 num_tok=>• def$binary
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*62:185 num_tok=>• def$binary*/
            pushFN(data, branch_7bd41de4c3b97b3a);
            pushFN(data, $def$binary);
            return 0;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               62:186 num_tok=>• def$octal
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*62:186 num_tok=>• def$octal*/
            pushFN(data, branch_7bd41de4c3b97b3a);
            pushFN(data, $def$octal);
            return 0;
        }
        return -1;
    }
/*production name: operator_HC_listbody1_128
            grammar index: 63
            bodies:
	63:187 operator_HC_listbody1_128=>• operator_HC_listbody1_128 θsym - 
		63:188 operator_HC_listbody1_128=>• θsym - 
            compile time: 216.852ms*/;
    function $operator_HC_listbody1_128(l, data, state) {
        /*63:188 operator_HC_listbody1_128=>• θsym*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.isSym(true, data)) {
            /*
               63:188 operator_HC_listbody1_128=>θsym •
            */
            consume(l, data, state);
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*63:188 operator_HC_listbody1_128=>θsym •*/
            add_reduce(state, data, 1, 87);
            pushFN(data, $operator_HC_listbody1_128_goto);
            return 63;
        }
        return -1;
    }
    function $operator_HC_listbody1_128_goto(l, data, state, prod) {
        skip_db1786a8af54d666(l/*[ 71 ]*/, data, true);
        if ((nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/ ||/*[<<--]*/cmpr_set(l, data, 19, 4, 4)) || assert_ascii(l, 0x0, 0x2c001300, 0x28000000, 0x28000000)) {
            return 63;
        }
        /*63:187 operator_HC_listbody1_128=>operator_HC_listbody1_128 • θsym
        65:191 operator=>θsym operator_HC_listbody1_128 • identifier_token_group_079_119
        65:194 operator=>θsym operator_HC_listbody1_128 •*/
        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
        if (l.isSym(true, data)) {
            /*
               63:187 operator_HC_listbody1_128=>operator_HC_listbody1_128 • θsym
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
            /*63:187 operator_HC_listbody1_128=>operator_HC_listbody1_128 • θsym*/
            consume(l, data, state);
            add_reduce(state, data, 2, 86);
            pushFN(data, $operator_HC_listbody1_128_goto);
            return 63;
        }
        return prod == 63 ? prod : -1;
    }
/*production name: operator_HC_listbody1_129
            grammar index: 64
            bodies:
	64:189 operator_HC_listbody1_129=>• operator_HC_listbody1_129 θsym - 
		64:190 operator_HC_listbody1_129=>• θsym - 
            compile time: 209.716ms*/;
    function $operator_HC_listbody1_129(l, data, state) {
        /*64:190 operator_HC_listbody1_129=>• θsym*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.isSym(true, data)) {
            /*
               64:190 operator_HC_listbody1_129=>θsym •
            */
            consume(l, data, state);
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*64:190 operator_HC_listbody1_129=>θsym •*/
            add_reduce(state, data, 1, 87);
            pushFN(data, $operator_HC_listbody1_129_goto);
            return 64;
        }
        return -1;
    }
    function $operator_HC_listbody1_129_goto(l, data, state, prod) {
        skip_db1786a8af54d666(l/*[ 71 ]*/, data, true);
        if ((nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/ ||/*[<<--]*/cmpr_set(l, data, 19, 4, 4)) || assert_ascii(l, 0x0, 0x2c001300, 0x28000000, 0x28000000)) {
            return 64;
        }
        /*64:189 operator_HC_listbody1_129=>operator_HC_listbody1_129 • θsym
        65:192 operator=>= operator_HC_listbody1_129 • identifier_token_group_079_119
        65:195 operator=>= operator_HC_listbody1_129 •*/
        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
        if (l.isSym(true, data)) {
            /*
               64:189 operator_HC_listbody1_129=>operator_HC_listbody1_129 • θsym
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
            /*64:189 operator_HC_listbody1_129=>operator_HC_listbody1_129 • θsym*/
            consume(l, data, state);
            add_reduce(state, data, 2, 86);
            pushFN(data, $operator_HC_listbody1_129_goto);
            return 64;
        }
        return prod == 64 ? prod : -1;
    }
/*production name: operator
            grammar index: 65
            bodies:
	65:191 operator=>• θsym operator_HC_listbody1_128 identifier_token_group_079_119 - 
		65:192 operator=>• = operator_HC_listbody1_129 identifier_token_group_079_119 - 
		65:193 operator=>• θsym identifier_token_group_079_119 - 
		65:194 operator=>• θsym operator_HC_listbody1_128 - 
		65:195 operator=>• = operator_HC_listbody1_129 - 
		65:196 operator=>• θsym - 
            compile time: 655.215ms*/;
    function $operator(l, data, state) {
        /*65:191 operator=>• θsym operator_HC_listbody1_128 identifier_token_group_079_119
        65:193 operator=>• θsym identifier_token_group_079_119
        65:194 operator=>• θsym operator_HC_listbody1_128
        65:196 operator=>• θsym
        65:192 operator=>• = operator_HC_listbody1_129 identifier_token_group_079_119
        65:195 operator=>• = operator_HC_listbody1_129*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if (l.current_byte == 61/*[=]*/) {
            /*
               65:192 operator=>• = operator_HC_listbody1_129 identifier_token_group_079_119
               65:195 operator=>• = operator_HC_listbody1_129
            */
            /*65:192 operator=>• = operator_HC_listbody1_129 identifier_token_group_079_119
            65:195 operator=>• = operator_HC_listbody1_129*/
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l, data, state);
            /*65:192 operator=>= • operator_HC_listbody1_129 identifier_token_group_079_119
            65:195 operator=>= • operator_HC_listbody1_129*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_1c227c92dd77aed8);
            pushFN(data, $operator_HC_listbody1_129);
            return 0;
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else {
            /*
               65:191 operator=>• θsym operator_HC_listbody1_128 identifier_token_group_079_119
               65:193 operator=>• θsym identifier_token_group_079_119
               65:194 operator=>• θsym operator_HC_listbody1_128
               65:196 operator=>• θsym
            */
            /*65:191 operator=>• θsym operator_HC_listbody1_128 identifier_token_group_079_119
            65:194 operator=>• θsym operator_HC_listbody1_128
            65:196 operator=>• θsym
            65:193 operator=>• θsym identifier_token_group_079_119*/
            let pk = l.copy();
            skip_db1786a8af54d666(pk.next(data)/*[ 71 ]*/, data, false);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (pk.isSym(true, data)) {
                /*
                   65:191 operator=>• θsym operator_HC_listbody1_128 identifier_token_group_079_119
                   65:194 operator=>• θsym operator_HC_listbody1_128
                   65:196 operator=>• θsym
                */
                /*65:191 operator=>• θsym operator_HC_listbody1_128 identifier_token_group_079_119
                65:194 operator=>• θsym operator_HC_listbody1_128
                65:196 operator=>• θsym*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l, data, state);
                /*65:191 operator=>θsym • operator_HC_listbody1_128 identifier_token_group_079_119
                65:194 operator=>θsym • operator_HC_listbody1_128
                65:196 operator=>θsym •*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                if (!(l.isSym(true, data)) || ((dt_6ae31dd85a62ef5c(l, data) ||/*[<<--]*/cmpr_set(l, data, 19, 4, 4)) || assert_ascii(l, 0x0, 0x2c001394, 0xa8000000, 0x28000000))) {
                    /*
                       65:196 operator=>θsym •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    /*65:196 operator=>θsym •*/
                    add_reduce(state, data, 1, 91);
                    return 65;
                    /*⤋⤋⤋ peek-unresolved ⤋⤋⤋*/
                } else {
                    /*
                       65:191 operator=>θsym • operator_HC_listbody1_128 identifier_token_group_079_119
                       65:194 operator=>θsym • operator_HC_listbody1_128
                       65:196 operator=>θsym •
                    */
                    /*-------------VPROD-------------------------*/
                    /*65:191 operator=>θsym • operator_HC_listbody1_128 identifier_token_group_079_119
                    65:194 operator=>θsym • operator_HC_listbody1_128*/
                    pushFN(data, branch_5d9ae19a27aa9899);
                    return 0;
                }
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            } else if (nocap_b2eb52235ee30b8a(pk)/*[ws] [nl]*/) {
                /*
                   65:193 operator=>• θsym identifier_token_group_079_119
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                /*65:193 operator=>• θsym identifier_token_group_079_119*/
                consume(l, data, state);
                skip_db1786a8af54d666(l/*[ 71 ]*/, data, true);
                pushFN(data, branch_eebd0dd73f9d54cd);
                pushFN(data, $identifier_token_group_079_119);
                return 0;
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            } else {
                /*
                   65:196 operator=>• θsym
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                /*65:196 operator=>• θsym*/
                consume(l, data, state);
                add_reduce(state, data, 1, 91);
                return 65;
            }
        }
        return -1;
    }
/*production name: modifier
            grammar index: 66
            bodies:
	66:197 modifier=>• pub - 
		66:198 modifier=>• priv - 
		66:199 modifier=>• export - 
		66:200 modifier=>• mut - 
		66:201 modifier=>• imut - 
		66:202 modifier=>• θid - 
            compile time: 3.431ms*/;
    function $modifier(l, data, state) {
        /*66:197 modifier=>• pub
        66:198 modifier=>• priv
        66:199 modifier=>• export
        66:200 modifier=>• mut
        66:201 modifier=>• imut
        66:202 modifier=>• θid*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if (/*[pub]*/cmpr_set(l, data, 133, 3, 3)) {
            /*
               66:197 modifier=>• pub
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*66:197 modifier=>• pub*/
            consume(l, data, state);
            return 66;
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (/*[priv]*/cmpr_set(l, data, 98, 4, 4)) {
            /*
               66:198 modifier=>• priv
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*66:198 modifier=>• priv*/
            consume(l, data, state);
            return 66;
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (/*[export]*/cmpr_set(l, data, 56, 6, 6)) {
            /*
               66:199 modifier=>• export
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*66:199 modifier=>• export*/
            consume(l, data, state);
            return 66;
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (/*[mut]*/cmpr_set(l, data, 116, 3, 3)) {
            /*
               66:200 modifier=>• mut
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*66:200 modifier=>• mut*/
            consume(l, data, state);
            return 66;
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (/*[imut]*/cmpr_set(l, data, 115, 4, 4)) {
            /*
               66:201 modifier=>• imut
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*66:201 modifier=>• imut*/
            consume(l, data, state);
            return 66;
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.isUniID(data)) {
            /*
               66:202 modifier=>• θid
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*66:202 modifier=>• θid*/
            consume(l, data, state);
            return 66;
        }
        return -1;
    }
/*production name: comment_group_0138_130
            grammar index: 67
            bodies:
	67:203 comment_group_0138_130=>• θid - 
		67:204 comment_group_0138_130=>• θsym - 
		67:205 comment_group_0138_130=>• θnum - 
            compile time: 2.058ms*/;
    function $comment_group_0138_130(l, data, state) {
        /*67:203 comment_group_0138_130=>• θid
        67:204 comment_group_0138_130=>• θsym
        67:205 comment_group_0138_130=>• θnum*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if (l.isUniID(data)) {
            /*
               67:203 comment_group_0138_130=>• θid
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*67:203 comment_group_0138_130=>• θid*/
            consume(l, data, state);
            return 67;
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.isSym(true, data)) {
            /*
               67:204 comment_group_0138_130=>• θsym
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*67:204 comment_group_0138_130=>• θsym*/
            consume(l, data, state);
            return 67;
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.isNum(data)) {
            /*
               67:205 comment_group_0138_130=>• θnum
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*67:205 comment_group_0138_130=>• θnum*/
            consume(l, data, state);
            return 67;
        }
        return -1;
    }
/*production name: comment_HC_listbody1_131
            grammar index: 68
            bodies:
	68:206 comment_HC_listbody1_131=>• comment_HC_listbody1_131 comment_group_0138_130 - 
		68:207 comment_HC_listbody1_131=>• comment_group_0138_130 - 
            compile time: 5.485ms*/;
    function $comment_HC_listbody1_131(l, data, state) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*68:207 comment_HC_listbody1_131=>• comment_group_0138_130*/
        pushFN(data, branch_73836dabb810b0e0);
        pushFN(data, $comment_group_0138_130);
        return 0;
        return -1;
    }
    function $comment_HC_listbody1_131_goto(l, data, state, prod) {
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
        if (/*[asterisk/]*/cmpr_set(l, data, 17, 2, 2)) {
            return 68;
        }
        /*68:206 comment_HC_listbody1_131=>comment_HC_listbody1_131 • comment_group_0138_130
        71:211 comment=>/* comment_HC_listbody1_131 • * /*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if ((l.isUniID(data) || l.isNum(data)) || l.isSym(true, data)) {
            /*
               68:206 comment_HC_listbody1_131=>comment_HC_listbody1_131 • comment_group_0138_130
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*68:206 comment_HC_listbody1_131=>comment_HC_listbody1_131 • comment_group_0138_130*/
            pushFN(data, branch_38dcf650f8497618);
            pushFN(data, $comment_group_0138_130);
            return 0;
        }
        return prod == 68 ? prod : -1;
    }
/*production name: comment_HC_listbody1_132
            grammar index: 69
            bodies:
	69:208 comment_HC_listbody1_132=>• comment_HC_listbody1_132 comment_group_0138_130 - 
		69:209 comment_HC_listbody1_132=>• comment_group_0138_130 - 
            compile time: 4.921ms*/;
    function $comment_HC_listbody1_132(l, data, state) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*69:209 comment_HC_listbody1_132=>• comment_group_0138_130*/
        pushFN(data, branch_13f6c10119d024c3);
        pushFN(data, $comment_group_0138_130);
        return 0;
        return -1;
    }
    function $comment_HC_listbody1_132_goto(l, data, state, prod) {
        skip_6c02533b5dc0d802(l/*[ ws ][ 71 ]*/, data, true);
        if (nocap_9b1ef04606bbaa09(l)/*[nl]*/) {
            return 69;
        }
        /*69:208 comment_HC_listbody1_132=>comment_HC_listbody1_132 • comment_group_0138_130
        71:212 comment=>// comment_HC_listbody1_132 • comment_group_0143_133*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if ((l.isUniID(data) || l.isNum(data)) || l.isSym(true, data)) {
            /*
               69:208 comment_HC_listbody1_132=>comment_HC_listbody1_132 • comment_group_0138_130
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*69:208 comment_HC_listbody1_132=>comment_HC_listbody1_132 • comment_group_0138_130*/
            pushFN(data, branch_a96d7c2556c7c082);
            pushFN(data, $comment_group_0138_130);
            return 0;
        }
        return prod == 69 ? prod : -1;
    }
/*production name: comment_group_0143_133
            grammar index: 70
            bodies:
	70:210 comment_group_0143_133=>• θnl - 
            compile time: 2.172ms*/;
    function $comment_group_0143_133(l, data, state) {
        /*70:210 comment_group_0143_133=>• θnl*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (nocap_9b1ef04606bbaa09(l)/*[nl]*/) {
            /*
               70:210 comment_group_0143_133=>θnl •
            */
            consume(l, data, state);
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*70:210 comment_group_0143_133=>θnl •*/
            return 70;
        }
        return -1;
    }
/*production name: comment
            grammar index: 71
            bodies:
	71:211 comment=>• /* comment_HC_listbody1_131 * / - 
		71:212 comment=>• // comment_HC_listbody1_132 comment_group_0143_133 - 
		71:213 comment=>• /* * / - 
		71:214 comment=>• // comment_group_0143_133 - 
            compile time: 6.92ms*/;
    function $comment(l, data, state) {
        /*71:211 comment=>• /* comment_HC_listbody1_131 * /
        71:213 comment=>• /* * /
        71:212 comment=>• // comment_HC_listbody1_132 comment_group_0143_133
        71:214 comment=>• // comment_group_0143_133*/
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if (/*[/asterisk]*/cmpr_set(l, data, 16, 2, 2)) {
            /*
               71:211 comment=>• /* comment_HC_listbody1_131 * /
               71:213 comment=>• /* * /
            */
            /*71:211 comment=>• /* comment_HC_listbody1_131 * /
            71:213 comment=>• /* * /*/
            let pk = l.copy();
            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/, data, false);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if (/*[asterisk/]*/cmpr_set(pk, data, 17, 2, 2)) {
                /*
                   71:213 comment=>• /* * /
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                /*71:213 comment=>• /* * /*/
                consume(l, data, state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                if (/*[asterisk/]*/cmpr_set(l, data, 17, 2, 2) && consume(l, data, state)) {
                    add_reduce(state, data, 2, 0);
                    return 71;
                }
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            } else {
                /*
                   71:211 comment=>• /* comment_HC_listbody1_131 * /
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                /*71:211 comment=>• /* comment_HC_listbody1_131 * /*/
                consume(l, data, state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                pushFN(data, branch_2408e2022b83f3d6);
                pushFN(data, $comment_HC_listbody1_131);
                return 0;
            }
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else {
            /*
               71:212 comment=>• // comment_HC_listbody1_132 comment_group_0143_133
               71:214 comment=>• // comment_group_0143_133
            */
            /*71:212 comment=>• // comment_HC_listbody1_132 comment_group_0143_133
            71:214 comment=>• // comment_group_0143_133*/
            let pk = l.copy();
            skip_6c02533b5dc0d802(pk.next(data)/*[ ws ][ 71 ]*/, data, false);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if ((pk.isUniID(data) || pk.isNum(data)) || pk.isSym(true, data)) {
                /*
                   71:212 comment=>• // comment_HC_listbody1_132 comment_group_0143_133
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                /*71:212 comment=>• // comment_HC_listbody1_132 comment_group_0143_133*/
                consume(l, data, state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                pushFN(data, branch_38121111c23993e5);
                pushFN(data, $comment_HC_listbody1_132);
                return 0;
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            } else {
                /*
                   71:214 comment=>• // comment_group_0143_133
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                /*71:214 comment=>• // comment_group_0143_133*/
                consume(l, data, state);
                skip_6c02533b5dc0d802(l/*[ ws ][ 71 ]*/, data, true);
                pushFN(data, branch_298174b4face442a);
                pushFN(data, $comment_group_0143_133);
                return 0;
            }
        }
        return -1;
    }
/*production name: template
            grammar index: 72
            bodies:
	72:215 template=>• <<-- θnum -->> - 
		72:216 template=>• <<-- -->> - 
            compile time: 3.526ms*/;
    function $template(l, data, state) {
        /*72:215 template=>• <<-- θnum -->>
        72:216 template=>• <<-- -->>*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (/*[<<--]*/cmpr_set(l, data, 19, 4, 4)) {
            /*
               72:215 template=><<-- • θnum -->>
               72:216 template=><<-- • -->>
            */
            consume(l, data, state);
            /*72:215 template=><<-- • θnum -->>
            72:216 template=><<-- • -->>*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if (l.isNum(data)) {
                /*
                   72:215 template=><<-- • θnum -->>
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*72:215 template=><<-- • θnum -->>*/
                consume(l, data, state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
                if (/*[-->>]*/cmpr_set(l, data, 22, 4, 4) && consume(l, data, state)) {
                    add_reduce(state, data, 3, 0);
                    return 72;
                }
                /*⤋⤋⤋ assert ⤋⤋⤋*/
            } else if (/*[-->>]*/cmpr_set(l, data, 22, 4, 4)) {
                /*
                   72:216 template=><<-- • -->>
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*72:216 template=><<-- • -->>*/
                consume(l, data, state);
                add_reduce(state, data, 2, 0);
                return 72;
            }
        }
        return -1;
    }
/*production name: def$hex
            grammar index: 78
            bodies:
	78:241 def$hex=>• tk:def$hex_token - 
            compile time: 1.217ms*/;
    function $def$hex(l, data, state) {
        /*78:241 def$hex=>• tk:def$hex_token*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (tk_f545b90791fd2d3f(l, data)) {
            /*
               78:241 def$hex=>tk:def$hex_token •
            */
            consume(l, data, state);
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*78:241 def$hex=>tk:def$hex_token •*/
            return 78;
        }
        return -1;
    }
/*production name: def$binary
            grammar index: 79
            bodies:
	79:242 def$binary=>• tk:def$binary_token - 
            compile time: 0.836ms*/;
    function $def$binary(l, data, state) {
        /*79:242 def$binary=>• tk:def$binary_token*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (tk_0f3d9e998d4e8303(l, data)) {
            /*
               79:242 def$binary=>tk:def$binary_token •
            */
            consume(l, data, state);
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*79:242 def$binary=>tk:def$binary_token •*/
            return 79;
        }
        return -1;
    }
/*production name: def$octal
            grammar index: 80
            bodies:
	80:243 def$octal=>• tk:def$octal_token - 
            compile time: 1.82ms*/;
    function $def$octal(l, data, state) {
        /*80:243 def$octal=>• tk:def$octal_token*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (tk_61a31e0cd3675f53(l, data)) {
            /*
               80:243 def$octal=>tk:def$octal_token •
            */
            consume(l, data, state);
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*80:243 def$octal=>tk:def$octal_token •*/
            return 80;
        }
        return -1;
    }
/*production name: def$number
            grammar index: 81
            bodies:
	81:244 def$number=>• tk:def$scientific_token - 
            compile time: 1.311ms*/;
    function $def$number(l, data, state) {
        /*81:244 def$number=>• tk:def$scientific_token*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (tk_5b3ed459478d3672(l, data)) {
            /*
               81:244 def$number=>tk:def$scientific_token •
            */
            consume(l, data, state);
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*81:244 def$number=>tk:def$scientific_token •*/
            return 81;
        }
        return -1;
    }
/*production name: def$scientific_token_group_027_101
            grammar index: 82
            bodies:
	82:245 def$scientific_token_group_027_101=>• e - 
		82:246 def$scientific_token_group_027_101=>• E - 
            compile time: 1.714ms*/;
    function $def$scientific_token_group_027_101(l, data, state) {
        /*82:245 def$scientific_token_group_027_101=>• e
        82:246 def$scientific_token_group_027_101=>• E*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if (l.current_byte == 101/*[e]*/) {
            /*
               82:245 def$scientific_token_group_027_101=>• e
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*82:245 def$scientific_token_group_027_101=>• e*/
            consume(l, data, state);
            return 82;
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.current_byte == 69/*[E]*/) {
            /*
               82:246 def$scientific_token_group_027_101=>• E
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*82:246 def$scientific_token_group_027_101=>• E*/
            consume(l, data, state);
            return 82;
        }
        return -1;
    }
/*production name: def$scientific_token_group_228_102
            grammar index: 83
            bodies:
	83:247 def$scientific_token_group_228_102=>• def$scientific_token_group_027_101 - θnum - 
		83:248 def$scientific_token_group_228_102=>• def$scientific_token_group_027_101 θnum - 
            compile time: 3.125ms*/;
    function $def$scientific_token_group_228_102(l, data, state) {
        /*83:247 def$scientific_token_group_228_102=>• def$scientific_token_group_027_101 - θnum
        83:248 def$scientific_token_group_228_102=>• def$scientific_token_group_027_101 θnum*/
        pushFN(data, branch_e039b76c18d3b4c7);
        pushFN(data, $def$scientific_token_group_027_101);
        return 0;
        return -1;
    }
/*production name: def$scientific_token
            grammar index: 84
            bodies:
	84:249 def$scientific_token=>• def$float_token def$scientific_token_group_228_102 - 
		84:250 def$scientific_token=>• def$float_token - 
            compile time: 8.867ms*/;
    function $def$scientific_token(l, data, state) {
        /*84:249 def$scientific_token=>• def$float_token def$scientific_token_group_228_102
        84:250 def$scientific_token=>• def$float_token*/
        pushFN(data, branch_e2fcda1d061b3a22);
        pushFN(data, $def$float_token);
        return 0;
        return -1;
    }
/*production name: def$float_token_group_130_103
            grammar index: 85
            bodies:
	85:251 def$float_token_group_130_103=>• . θnum - 
            compile time: 1.834ms*/;
    function $def$float_token_group_130_103(l, data, state) {
        /*85:251 def$float_token_group_130_103=>• . θnum*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.current_byte == 46/*[.]*/) {
            /*
               85:251 def$float_token_group_130_103=>. • θnum
            */
            consume(l, data, state);
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*85:251 def$float_token_group_130_103=>. • θnum*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/, data, true);
            if (l.isNum(data) && consume(l, data, state)) {
                add_reduce(state, data, 2, 0);
                return 85;
            }
        }
        return -1;
    }
/*production name: def$float_token
            grammar index: 86
            bodies:
	86:252 def$float_token=>• θnum def$float_token_group_130_103 - 
		86:253 def$float_token=>• θnum - 
            compile time: 6.98ms*/;
    function $def$float_token(l, data, state) {
        /*86:252 def$float_token=>• θnum def$float_token_group_130_103
        86:253 def$float_token=>• θnum*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (l.isNum(data)) {
            /*
               86:252 def$float_token=>θnum • def$float_token_group_130_103
               86:253 def$float_token=>θnum •
            */
            consume(l, data, state);
            /*86:252 def$float_token=>θnum • def$float_token_group_130_103
            86:253 def$float_token=>θnum •*/
            skip_db1786a8af54d666(l/*[ 71 ]*/, data, true);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            if (l.current_byte == 46/*[.]*/) {
                /*
                   86:252 def$float_token=>θnum • def$float_token_group_130_103
                */
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*86:252 def$float_token=>θnum • def$float_token_group_130_103*/
                pushFN(data, branch_4e61e6c3ff64b530);
                pushFN(data, $def$float_token_group_130_103);
                return 0;
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            } else {
                /*
                   86:253 def$float_token=>θnum •
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                /*86:253 def$float_token=>θnum •*/
                return 86;
            }
        }
        return -1;
    }
/*production name: def$hex_token_group_044_104
            grammar index: 87
            bodies:
	87:254 def$hex_token_group_044_104=>• θnum - 
		87:255 def$hex_token_group_044_104=>• a - 
		87:256 def$hex_token_group_044_104=>• b - 
		87:257 def$hex_token_group_044_104=>• c - 
		87:258 def$hex_token_group_044_104=>• d - 
		87:259 def$hex_token_group_044_104=>• e - 
		87:260 def$hex_token_group_044_104=>• f - 
		87:261 def$hex_token_group_044_104=>• A - 
		87:262 def$hex_token_group_044_104=>• B - 
		87:263 def$hex_token_group_044_104=>• C - 
		87:264 def$hex_token_group_044_104=>• D - 
		87:265 def$hex_token_group_044_104=>• E - 
		87:266 def$hex_token_group_044_104=>• F - 
            compile time: 6.896ms*/;
    function $def$hex_token_group_044_104(l, data, state) {
        /*87:254 def$hex_token_group_044_104=>• θnum
        87:255 def$hex_token_group_044_104=>• a
        87:256 def$hex_token_group_044_104=>• b
        87:257 def$hex_token_group_044_104=>• c
        87:258 def$hex_token_group_044_104=>• d
        87:259 def$hex_token_group_044_104=>• e
        87:260 def$hex_token_group_044_104=>• f
        87:261 def$hex_token_group_044_104=>• A
        87:262 def$hex_token_group_044_104=>• B
        87:263 def$hex_token_group_044_104=>• C
        87:264 def$hex_token_group_044_104=>• D
        87:265 def$hex_token_group_044_104=>• E
        87:266 def$hex_token_group_044_104=>• F*/
        switch (sym_map_bcb6538966fe2bad(l, data)) {
            case 0:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*87:254 def$hex_token_group_044_104=>• θnum*/
                consume(l, data, state);
                return 87;
            case 1:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*87:255 def$hex_token_group_044_104=>• a*/
                consume(l, data, state);
                return 87;
            case 2:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*87:256 def$hex_token_group_044_104=>• b*/
                consume(l, data, state);
                return 87;
            case 3:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*87:257 def$hex_token_group_044_104=>• c*/
                consume(l, data, state);
                return 87;
            case 4:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*87:258 def$hex_token_group_044_104=>• d*/
                consume(l, data, state);
                return 87;
            case 5:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*87:259 def$hex_token_group_044_104=>• e*/
                consume(l, data, state);
                return 87;
            case 6:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*87:260 def$hex_token_group_044_104=>• f*/
                consume(l, data, state);
                return 87;
            case 7:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*87:261 def$hex_token_group_044_104=>• A*/
                consume(l, data, state);
                return 87;
            case 8:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*87:262 def$hex_token_group_044_104=>• B*/
                consume(l, data, state);
                return 87;
            case 9:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*87:263 def$hex_token_group_044_104=>• C*/
                consume(l, data, state);
                return 87;
            case 10:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*87:264 def$hex_token_group_044_104=>• D*/
                consume(l, data, state);
                return 87;
            case 11:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*87:265 def$hex_token_group_044_104=>• E*/
                consume(l, data, state);
                return 87;
            case 12:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*87:266 def$hex_token_group_044_104=>• F*/
                consume(l, data, state);
                return 87;
            default:
                break;
        }
        return -1;
    }
/*production name: def$hex_token_HC_listbody1_105
            grammar index: 88
            bodies:
	88:267 def$hex_token_HC_listbody1_105=>• def$hex_token_HC_listbody1_105 def$hex_token_group_044_104 - 
		88:268 def$hex_token_HC_listbody1_105=>• def$hex_token_group_044_104 - 
            compile time: 12.586ms*/;
    function $def$hex_token_HC_listbody1_105(l, data, state) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*88:268 def$hex_token_HC_listbody1_105=>• def$hex_token_group_044_104*/
        pushFN(data, branch_c1d1bde8a1ade4c6);
        pushFN(data, $def$hex_token_group_044_104);
        return 0;
        return -1;
    }
    function $def$hex_token_HC_listbody1_105_goto(l, data, state, prod) {
        skip_a294e41529bc9275(l/*[ nl ][ 71 ]*/, data, true);
        if (l.isSP(true, data)) {
            return 88;
        }
        /*88:267 def$hex_token_HC_listbody1_105=>def$hex_token_HC_listbody1_105 • def$hex_token_group_044_104
        89:269 def$hex_token=>0x def$hex_token_HC_listbody1_105 •*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (assert_ascii(l, 0x0, 0x0, 0x7e, 0x7e) || l.isNum(data)) {
            /*
               88:267 def$hex_token_HC_listbody1_105=>def$hex_token_HC_listbody1_105 • def$hex_token_group_044_104
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*88:267 def$hex_token_HC_listbody1_105=>def$hex_token_HC_listbody1_105 • def$hex_token_group_044_104*/
            pushFN(data, branch_859a73d5c409fc4a);
            pushFN(data, $def$hex_token_group_044_104);
            return 0;
        }
        return prod == 88 ? prod : -1;
    }
/*production name: def$hex_token
            grammar index: 89
            bodies:
	89:269 def$hex_token=>• 0x def$hex_token_HC_listbody1_105 - 
            compile time: 2.079ms*/;
    function $def$hex_token(l, data, state) {
        /*89:269 def$hex_token=>• 0x def$hex_token_HC_listbody1_105*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (/*[0x]*/cmpr_set(l, data, 26, 2, 2)) {
            /*
               89:269 def$hex_token=>0x • def$hex_token_HC_listbody1_105
            */
            consume(l, data, state);
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*89:269 def$hex_token=>0x • def$hex_token_HC_listbody1_105*/
            skip_a294e41529bc9275(l/*[ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_a6b376ed0bf34743);
            pushFN(data, $def$hex_token_HC_listbody1_105);
            return 0;
        }
        return -1;
    }
/*production name: def$binary_token_group_047_106
            grammar index: 90
            bodies:
	90:270 def$binary_token_group_047_106=>• 0 - 
		90:271 def$binary_token_group_047_106=>• 1 - 
            compile time: 1.055ms*/;
    function $def$binary_token_group_047_106(l, data, state) {
        /*90:270 def$binary_token_group_047_106=>• 0
        90:271 def$binary_token_group_047_106=>• 1*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if (l.current_byte == 48/*[0]*/) {
            /*
               90:270 def$binary_token_group_047_106=>• 0
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*90:270 def$binary_token_group_047_106=>• 0*/
            consume(l, data, state);
            return 90;
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (l.current_byte == 49/*[1]*/) {
            /*
               90:271 def$binary_token_group_047_106=>• 1
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*90:271 def$binary_token_group_047_106=>• 1*/
            consume(l, data, state);
            return 90;
        }
        return -1;
    }
/*production name: def$binary_token_HC_listbody1_107
            grammar index: 91
            bodies:
	91:272 def$binary_token_HC_listbody1_107=>• def$binary_token_HC_listbody1_107 def$binary_token_group_047_106 - 
		91:273 def$binary_token_HC_listbody1_107=>• def$binary_token_group_047_106 - 
            compile time: 11.456ms*/;
    function $def$binary_token_HC_listbody1_107(l, data, state) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*91:273 def$binary_token_HC_listbody1_107=>• def$binary_token_group_047_106*/
        pushFN(data, branch_da4737880b1bd090);
        pushFN(data, $def$binary_token_group_047_106);
        return 0;
        return -1;
    }
    function $def$binary_token_HC_listbody1_107_goto(l, data, state, prod) {
        skip_a294e41529bc9275(l/*[ nl ][ 71 ]*/, data, true);
        if (l.isSP(true, data)) {
            return 91;
        }
        /*91:272 def$binary_token_HC_listbody1_107=>def$binary_token_HC_listbody1_107 • def$binary_token_group_047_106
        92:274 def$binary_token=>0b def$binary_token_HC_listbody1_107 •*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if ((l.current_byte == 48/*[0]*/) || (l.current_byte == 49/*[1]*/)) {
            /*
               91:272 def$binary_token_HC_listbody1_107=>def$binary_token_HC_listbody1_107 • def$binary_token_group_047_106
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*91:272 def$binary_token_HC_listbody1_107=>def$binary_token_HC_listbody1_107 • def$binary_token_group_047_106*/
            pushFN(data, branch_e8b252a4f58d33c8);
            pushFN(data, $def$binary_token_group_047_106);
            return 0;
        }
        return prod == 91 ? prod : -1;
    }
/*production name: def$binary_token
            grammar index: 92
            bodies:
	92:274 def$binary_token=>• 0b def$binary_token_HC_listbody1_107 - 
            compile time: 2.033ms*/;
    function $def$binary_token(l, data, state) {
        /*92:274 def$binary_token=>• 0b def$binary_token_HC_listbody1_107*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if (/*[0b]*/cmpr_set(l, data, 113, 2, 2)) {
            /*
               92:274 def$binary_token=>0b • def$binary_token_HC_listbody1_107
            */
            consume(l, data, state);
            /*--LEAF--*/
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            /*92:274 def$binary_token=>0b • def$binary_token_HC_listbody1_107*/
            skip_a294e41529bc9275(l/*[ nl ][ 71 ]*/, data, true);
            pushFN(data, branch_4db389afdb5f8499);
            pushFN(data, $def$binary_token_HC_listbody1_107);
            return 0;
        }
        return -1;
    }
/*production name: def$octal_token_group_050_108
            grammar index: 93
            bodies:
	93:275 def$octal_token_group_050_108=>• 0o - 
		93:276 def$octal_token_group_050_108=>• 0O - 
            compile time: 3.66ms*/;
    function $def$octal_token_group_050_108(l, data, state) {
        /*93:275 def$octal_token_group_050_108=>• 0o
        93:276 def$octal_token_group_050_108=>• 0O*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if (/*[0o]*/cmpr_set(l, data, 136, 2, 2)) {
            /*
               93:275 def$octal_token_group_050_108=>• 0o
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*93:275 def$octal_token_group_050_108=>• 0o*/
            consume(l, data, state);
            return 93;
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if (/*[0O]*/cmpr_set(l, data, 138, 2, 2)) {
            /*
               93:276 def$octal_token_group_050_108=>• 0O
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*93:276 def$octal_token_group_050_108=>• 0O*/
            consume(l, data, state);
            return 93;
        }
        return -1;
    }
/*production name: def$octal_token_group_058_109
            grammar index: 94
            bodies:
	94:277 def$octal_token_group_058_109=>• 0 - 
		94:278 def$octal_token_group_058_109=>• 1 - 
		94:279 def$octal_token_group_058_109=>• 2 - 
		94:280 def$octal_token_group_058_109=>• 3 - 
		94:281 def$octal_token_group_058_109=>• 4 - 
		94:282 def$octal_token_group_058_109=>• 5 - 
		94:283 def$octal_token_group_058_109=>• 6 - 
		94:284 def$octal_token_group_058_109=>• 7 - 
            compile time: 6.875ms*/;
    function $def$octal_token_group_058_109(l, data, state) {
        /*94:277 def$octal_token_group_058_109=>• 0
        94:278 def$octal_token_group_058_109=>• 1
        94:279 def$octal_token_group_058_109=>• 2
        94:280 def$octal_token_group_058_109=>• 3
        94:281 def$octal_token_group_058_109=>• 4
        94:282 def$octal_token_group_058_109=>• 5
        94:283 def$octal_token_group_058_109=>• 6
        94:284 def$octal_token_group_058_109=>• 7*/
        switch (sym_map_5d08f7d316aa60f4(l, data)) {
            case 0:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*94:277 def$octal_token_group_058_109=>• 0*/
                consume(l, data, state);
                return 94;
            case 1:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*94:278 def$octal_token_group_058_109=>• 1*/
                consume(l, data, state);
                return 94;
            case 2:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*94:279 def$octal_token_group_058_109=>• 2*/
                consume(l, data, state);
                return 94;
            case 3:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*94:280 def$octal_token_group_058_109=>• 3*/
                consume(l, data, state);
                return 94;
            case 4:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*94:281 def$octal_token_group_058_109=>• 4*/
                consume(l, data, state);
                return 94;
            case 5:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*94:282 def$octal_token_group_058_109=>• 5*/
                consume(l, data, state);
                return 94;
            case 6:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*94:283 def$octal_token_group_058_109=>• 6*/
                consume(l, data, state);
                return 94;
            case 7:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*94:284 def$octal_token_group_058_109=>• 7*/
                consume(l, data, state);
                return 94;
            default:
                break;
        }
        return -1;
    }
/*production name: def$octal_token_HC_listbody1_110
            grammar index: 95
            bodies:
	95:285 def$octal_token_HC_listbody1_110=>• def$octal_token_HC_listbody1_110 def$octal_token_group_058_109 - 
		95:286 def$octal_token_HC_listbody1_110=>• def$octal_token_group_058_109 - 
            compile time: 11.895ms*/;
    function $def$octal_token_HC_listbody1_110(l, data, state) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*95:286 def$octal_token_HC_listbody1_110=>• def$octal_token_group_058_109*/
        pushFN(data, branch_c7782fe38088e5d9);
        pushFN(data, $def$octal_token_group_058_109);
        return 0;
        return -1;
    }
    function $def$octal_token_HC_listbody1_110_goto(l, data, state, prod) {
        skip_a294e41529bc9275(l/*[ nl ][ 71 ]*/, data, true);
        if (l.isSP(true, data)) {
            return 95;
        }
        /*95:285 def$octal_token_HC_listbody1_110=>def$octal_token_HC_listbody1_110 • def$octal_token_group_058_109
        96:287 def$octal_token=>def$octal_token_group_050_108 def$octal_token_HC_listbody1_110 •*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if (assert_ascii(l, 0x0, 0xff0000, 0x0, 0x0)) {
            /*
               95:285 def$octal_token_HC_listbody1_110=>def$octal_token_HC_listbody1_110 • def$octal_token_group_058_109
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*95:285 def$octal_token_HC_listbody1_110=>def$octal_token_HC_listbody1_110 • def$octal_token_group_058_109*/
            pushFN(data, branch_98d96b9e3b2e6979);
            pushFN(data, $def$octal_token_group_058_109);
            return 0;
        }
        return prod == 95 ? prod : -1;
    }
/*production name: def$octal_token
            grammar index: 96
            bodies:
	96:287 def$octal_token=>• def$octal_token_group_050_108 def$octal_token_HC_listbody1_110 - 
            compile time: 2.126ms*/;
    function $def$octal_token(l, data, state) {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        /*96:287 def$octal_token=>• def$octal_token_group_050_108 def$octal_token_HC_listbody1_110*/
        pushFN(data, branch_cf1acfcb741737a6);
        pushFN(data, $def$octal_token_group_050_108);
        return 0;
        return -1;
    }
    function recognizer(data, input_byte_length, production) {
        data.input_len = input_byte_length;
        data.lexer.next(data);
        skip_9184d3c96b70653a(data.lexer/*[ ws ][ nl ][ 71 ]*/, data, true);
        dispatch(data, 0);
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

        data.stack_ptr--;

        const result = fn(data.lexer, data, data.state, data.prod);

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
            case 0: pushFN(data, $skribble); return;
            case 1: pushFN(data, $module_group_02_100); return;
            case 2: pushFN(data, $module); return;
            case 3: pushFN(data, $statements); return;
            case 4: pushFN(data, $import); return;
            case 5: pushFN(data, $namespace_HC_listbody3_102); return;
            case 6: pushFN(data, $namespace); return;
            case 7: pushFN(data, $class_group_113_103); return;
            case 8: pushFN(data, $class_group_016_104); return;
            case 9: pushFN(data, $class_HC_listbody1_105); return;
            case 10: pushFN(data, $class); return;
            case 11: pushFN(data, $struct); return;
            case 12: pushFN(data, $function); return;
            case 13: pushFN(data, $function_expression); return;
            case 14: pushFN(data, $parameters); return;
            case 15: pushFN(data, $expression_statements_HC_listbody1_107); return;
            case 16: pushFN(data, $expression_statements_group_023_108); return;
            case 17: pushFN(data, $expression_statements_group_124_109); return;
            case 18: pushFN(data, $expression_statements); return;
            case 19: pushFN(data, $expression); return;
            case 20: pushFN(data, $if_expression_group_139_110); return;
            case 21: pushFN(data, $if_expression); return;
            case 22: pushFN(data, $binary_expression); return;
            case 23: pushFN(data, $unary_expression); return;
            case 24: pushFN(data, $unary_value); return;
            case 25: pushFN(data, $loop_expression_group_254_111); return;
            case 26: pushFN(data, $loop_expression_HC_listbody6_112); return;
            case 27: pushFN(data, $loop_expression); return;
            case 28: pushFN(data, $match_expression_HC_listbody3_113); return;
            case 29: pushFN(data, $match_expression); return;
            case 30: pushFN(data, $match_clause); return;
            case 31: pushFN(data, $call_expression_HC_listbody2_114); return;
            case 32: pushFN(data, $break_expression_group_164_115); return;
            case 33: pushFN(data, $break_expression); return;
            case 34: pushFN(data, $return_expression); return;
            case 35: pushFN(data, $continue_expression); return;
            case 36: pushFN(data, $primitive_declaration_group_169_116); return;
            case 37: pushFN(data, $primitive_declaration); return;
            case 38: pushFN(data, $identifier); return;
            case 39: pushFN(data, $identifier_token_group_074_117); return;
            case 40: pushFN(data, $identifier_token_HC_listbody1_118); return;
            case 41: pushFN(data, $identifier_token_group_079_119); return;
            case 42: pushFN(data, $identifier_token); return;
            case 43: pushFN(data, $modifier_list_HC_listbody1_120); return;
            case 44: pushFN(data, $modifier_list); return;
            case 45: pushFN(data, $type_group_086_121); return;
            case 46: pushFN(data, $type_group_091_122); return;
            case 47: pushFN(data, $type_group_094_123); return;
            case 48: pushFN(data, $type_group_097_124); return;
            case 49: pushFN(data, $type); return;
            case 50: pushFN(data, $value); return;
            case 51: pushFN(data, $string_group_0111_125); return;
            case 52: pushFN(data, $string_HC_listbody1_126); return;
            case 53: pushFN(data, $string_HC_listbody1_127); return;
            case 54: pushFN(data, $string); return;
            case 55: pushFN(data, $num); return;
            case 56: pushFN(data, $num_tok); return;
            case 57: pushFN(data, $operator_HC_listbody1_128); return;
            case 58: pushFN(data, $operator_HC_listbody1_129); return;
            case 59: pushFN(data, $operator); return;
            case 60: pushFN(data, $modifier); return;
            case 61: pushFN(data, $comment_group_0138_130); return;
            case 62: pushFN(data, $comment_HC_listbody1_131); return;
            case 63: pushFN(data, $comment_HC_listbody1_132); return;
            case 64: pushFN(data, $comment_group_0143_133); return;
            case 65: pushFN(data, $comment); return;
            case 66: pushFN(data, $template); return;
            case 67: pushFN(data, $def$hex); return;
            case 68: pushFN(data, $def$binary); return;
            case 69: pushFN(data, $def$octal); return;
            case 70: pushFN(data, $def$number); return;
            case 71: pushFN(data, $def$scientific_token_group_027_101); return;
            case 72: pushFN(data, $def$scientific_token_group_228_102); return;
            case 73: pushFN(data, $def$scientific_token); return;
            case 74: pushFN(data, $def$float_token_group_130_103); return;
            case 75: pushFN(data, $def$float_token); return;
            case 76: pushFN(data, $def$hex_token_group_044_104); return;
            case 77: pushFN(data, $def$hex_token_HC_listbody1_105); return;
            case 78: pushFN(data, $def$hex_token); return;
            case 79: pushFN(data, $def$binary_token_group_047_106); return;
            case 80: pushFN(data, $def$binary_token_HC_listbody1_107); return;
            case 81: pushFN(data, $def$binary_token); return;
            case 82: pushFN(data, $def$octal_token_group_050_108); return;
            case 83: pushFN(data, $def$octal_token_group_058_109); return;
            case 84: pushFN(data, $def$octal_token_HC_listbody1_110); return;
            case 85: pushFN(data, $def$octal_token); return;
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
    , (env, sym, pos) => (env.grabTemplateNode("template-statement"))/*3*/
    , (env, sym, pos) => ({ type: "namespace", name: sym[1], statements: sym[3] })/*4*/
    , (env, sym, pos) => ({ type: "namespace", name: sym[1] })/*5*/
    , (env, sym, pos) => ({ type: "class", name: sym[2], inherits: sym[3], modifiers: sym[0] || [], members: sym[5] || [] })/*6*/
    , (env, sym, pos) => ({ type: "class", name: sym[1], inherits: sym[2], modifiers: [], members: sym[4] || [] })/*7*/
    , (env, sym, pos) => ({ type: "class", name: sym[2], inherits: null, modifiers: sym[0] || [], members: sym[4] || [] })/*8*/
    , (env, sym, pos) => ({ type: "class", name: sym[2], inherits: sym[3], modifiers: sym[0] || [], members: [] })/*9*/
    , (env, sym, pos) => ({ type: "class", name: sym[1], inherits: null, modifiers: [], members: sym[3] || [] })/*10*/
    , (env, sym, pos) => ({ type: "class", name: sym[1], inherits: sym[2], modifiers: [], members: [] })/*11*/
    , (env, sym, pos) => ({ type: "class", name: sym[2], inherits: null, modifiers: sym[0] || [], members: [] })/*12*/
    , (env, sym, pos) => ({ type: "class", name: sym[1], inherits: null, modifiers: [], members: [] })/*13*/
    , (env, sym, pos) => ({ type: "structure", name: sym[2], modifiers: sym[0] || [], properties: sym[4] || [] })/*14*/
    , (env, sym, pos) => ({ type: "structure", name: sym[1], modifiers: [], properties: sym[3] || [] })/*15*/
    , (env, sym, pos) => ({ type: "structure", name: sym[2], modifiers: sym[0] || [], properties: [] })/*16*/
    , (env, sym, pos) => ({ type: "structure", name: sym[1], modifiers: [], properties: [] })/*17*/
    , (env, sym, pos) => ({ type: "function", return_type: sym[4], name: sym[2], modifiers: sym[0] || [], parameters: sym[6] || [], expressions: sym[9] || [] })/*18*/
    , (env, sym, pos) => ({ type: "function", return_type: sym[3], name: sym[1], modifiers: [], parameters: sym[5] || [], expressions: sym[8] || [] })/*19*/
    , (env, sym, pos) => ({ type: "function", return_type: sym[4], name: sym[2], modifiers: sym[0] || [], parameters: [], expressions: sym[8] || [] })/*20*/
    , (env, sym, pos) => ({ type: "function", return_type: sym[4], name: sym[2], modifiers: sym[0] || [], parameters: sym[6] || [], expressions: [] })/*21*/
    , (env, sym, pos) => ({ type: "function", return_type: sym[3], name: sym[1], modifiers: [], parameters: [], expressions: sym[7] || [] })/*22*/
    , (env, sym, pos) => ({ type: "function", return_type: sym[3], name: sym[1], modifiers: [], parameters: sym[5] || [], expressions: [] })/*23*/
    , (env, sym, pos) => ({ type: "function", return_type: sym[4], name: sym[2], modifiers: sym[0] || [], parameters: [], expressions: [] })/*24*/
    , (env, sym, pos) => ({ type: "function", return_type: sym[3], name: sym[1], modifiers: [], parameters: [], expressions: [] })/*25*/
    , (env, sym, pos) => ({ type: "lambda", return_type: sym[3], modifiers: sym[0] || [], parameters: sym[5] || [], expressions: sym[8] || [] })/*26*/
    , (env, sym, pos) => ({ type: "lambda", return_type: sym[2], modifiers: [], parameters: sym[4] || [], expressions: sym[7] || [] })/*27*/
    , (env, sym, pos) => ({ type: "lambda", return_type: sym[3], modifiers: sym[0] || [], parameters: [], expressions: sym[7] || [] })/*28*/
    , (env, sym, pos) => ({ type: "lambda", return_type: sym[3], modifiers: sym[0] || [], parameters: sym[5] || [], expressions: [] })/*29*/
    , (env, sym, pos) => ({ type: "lambda", return_type: sym[2], modifiers: [], parameters: [], expressions: sym[6] || [] })/*30*/
    , (env, sym, pos) => ({ type: "lambda", return_type: sym[2], modifiers: [], parameters: sym[4] || [], expressions: [] })/*31*/
    , (env, sym, pos) => ({ type: "lambda", return_type: sym[3], modifiers: sym[0] || [], parameters: [], expressions: [] })/*32*/
    , (env, sym, pos) => ({ type: "lambda", return_type: sym[2], modifiers: [], parameters: [], expressions: [] })/*33*/
    , (env, sym, pos) => ((sym[0].push(sym[2]), sym[0]))/*34*/
    , (env, sym, pos) => (sym[1])/*35*/
    , (env, sym, pos) => (null)/*36*/
    , (env, sym, pos) => (sym[1] ? (sym[0].push(sym[1]), sym[0]) : sym[0])/*37*/
    , (env, sym, pos) => ({ type: "block", expression: sym[1] || [] })/*38*/
    , (env, sym, pos) => (env.grabTemplateNode("template-expression"))/*39*/
    , (env, sym, pos) => ({ type: "block", expression: [] })/*40*/
    , (env, sym, pos) => ({ type: "assignment", target: (sym[0]), expression: sym[2] })/*41*/
    , (env, sym, pos) => ({ type: "if", assertion: sym[1], expression: sym[3], else: sym[4] })/*42*/
    , (env, sym, pos) => ({ type: "if", assertion: sym[1], expression: sym[3], else: null })/*43*/
    , (env, sym, pos) => ({ type: "operator-expression", list: [sym[0], sym[1]] })/*44*/
    , (env, sym, pos) => (sym[0].list ? (sym[0].list.push(sym[1], sym[2]), sym[0]) : { type: "operator-expression", list: [sym[0], sym[1], ...(sym[2].type == "operator-expression" ? sym[2].list : [sym[2]])] })/*45*/
    , (env, sym, pos) => ({ type: "parenthesis", expression: sym[1] })/*46*/
    , (env, sym, pos) => ({ type: "parenthesis" })/*47*/
    , (env, sym, pos) => ({ type: "loop", assertion: sym[1], expression: sym[2] })/*48*/
    , (env, sym, pos) => ({ type: "for-loop", initializers: sym[2], assertion: sym[4], post_iteration: sym[6], expression: sym[8] })/*49*/
    , (env, sym, pos) => ({ type: "in-loop", initializer: sym[2], target: sym[4], expression: sym[6] })/*50*/
    , (env, sym, pos) => ({ type: "for-loop", assertion: sym[3], post_iteration: sym[5], expression: sym[7] })/*51*/
    , (env, sym, pos) => ({ type: "for-loop", initializers: sym[2], assertion: null, post_iteration: sym[5], expression: sym[7] })/*52*/
    , (env, sym, pos) => ({ type: "for-loop", initializers: sym[2], assertion: sym[4], post_iteration: null, expression: sym[7] })/*53*/
    , (env, sym, pos) => ({ type: "for-loop", assertion: null, post_iteration: sym[4], expression: sym[6] })/*54*/
    , (env, sym, pos) => ({ type: "for-loop", assertion: sym[3], post_iteration: null, expression: sym[6] })/*55*/
    , (env, sym, pos) => ({ type: "for-loop", initializers: sym[2], assertion: null, post_iteration: null, expression: sym[6] })/*56*/
    , (env, sym, pos) => ({ type: "for-loop", assertion: null, post_iteration: null, expression: sym[5] })/*57*/
    , (env, sym, pos) => ({ type: "match", match_expression: sym[0], matches: sym[3] })/*58*/
    , (env, sym, pos) => ({ type: "match", match_expression: sym[0], matches: null })/*59*/
    , (env, sym, pos) => ({ type: "match-clause", match: sym[0], expression: sym[2] })/*60*/
    , (env, sym, pos) => ({ type: "call", reference: sym[0], parameters: sym[2] })/*61*/
    , (env, sym, pos) => ({ type: "call", reference: sym[0], parameters: null })/*62*/
    , (env, sym, pos) => ({ type: "member-reference", reference: sym[0], property: sym[2] })/*63*/
    , (env, sym, pos) => ({ type: "member-expression", reference: sym[0], expression: sym[2] })/*64*/
    , (env, sym, pos) => ((sym[0].type = "reference", sym[0]))/*65*/
    , (env, sym, pos) => ({ type: "break", expression: sym[1] })/*66*/
    , (env, sym, pos) => ({ type: "break", expression: null })/*67*/
    , (env, sym, pos) => ({ type: "return", expression: sym[1] })/*68*/
    , (env, sym, pos) => ({ type: "return", expression: null })/*69*/
    , (env, sym, pos) => ({ type: "continue" })/*70*/
    , (env, sym, pos) => ({ type: "declaration", name: (sym[1]), primitive_type: sym[3], modifiers: sym[0] || [], initialization: sym[4] })/*71*/
    , (env, sym, pos) => ({ type: "declaration", name: (sym[0]), primitive_type: sym[2], modifiers: [], initialization: sym[3] })/*72*/
    , (env, sym, pos) => ({ type: "declaration", name: (sym[1]), primitive_type: sym[3], modifiers: sym[0] || [] })/*73*/
    , (env, sym, pos) => ({ type: "declaration", name: (sym[0]), primitive_type: sym[2], modifiers: [] })/*74*/
    , (env, sym, pos) => ({ type: "identifier", value: sym[0] })/*75*/
    , (env, sym, pos) => ((sym[0].type = "type-reference", sym[0]))/*76*/
    , (env, sym, pos) => ({ type: "type-" + sym[0][0] + sym[1] })/*77*/
    , (env, sym, pos) => ({ type: "type-string" })/*78*/
    , (env, sym, pos) => ({ type: "number", value: sym[0] })/*79*/
    , (env, sym, pos) => ({ type: "string", value: sym[0] })/*80*/
    , (env, sym, pos) => ({ type: "boolean", value: true })/*81*/
    , (env, sym, pos) => ({ type: "boolean", value: false })/*82*/
    , (env, sym, pos) => ({ type: "null" })/*83*/
    , (env, sym, pos) => (env.grabTemplateNode("template-value"))/*84*/
    , (env, sym, pos) => (sym[0] + sym[1])/*85*/
    , (env, sym, pos) => (sym[0] + "")/*86*/
    , (env, sym, pos) => ({ type: "string", value: sym[1] })/*87*/
    , (env, sym, pos) => ({ type: "string", value: null })/*88*/
    , (env, sym, pos) => ({ type: "operator", val: sym[0] + sym[1], precedence: 0 })/*89*/
    , (env, sym, pos) => ({ type: "operator", val: sym[0], precedence: 0 })/*90*/];

const parser_factory = ParserFactory(fns, undefined, data);

export { fns as parser_functions, data as parser_data, parser_factory }; 