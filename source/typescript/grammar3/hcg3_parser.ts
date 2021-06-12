
import { ParserFactory } from "../runtime/parser_loader_alpha.js";

const recognizer_initializer = (() => {
    var lookup_table = new Uint8Array(382976);
    var sequence_lookup = new Uint8Array(84);
    var TokenSymbol = 1;
    var TokenIdentifier = 2;
    var TokenSpace = 4;
    var TokenNewLine = 8;
    var TokenNumber = 16;
    var TokenIdentifierUnicode = 32 | TokenIdentifier;
    var TokenFullNumber = 128 | TokenNumber;
    var UNICODE_ID_CONTINUE = 32;
    var UNICODE_ID_START = 64;
    var NULL_STATE = 0;
    var STATE_ALLOW_SKIP = 1;
    var STATE_ALLOW_OUTPUT = 2;
    function compare(data, data_offset, sequence_offset, byte_length) {
        var i = data_offset;
        var j = sequence_offset;
        var len = j + byte_length;
        for (; j < len; i++, j++)
            if ((data.input[i] != sequence_lookup[j])) return j - sequence_offset;;
        return byte_length;
    }
    function cmpr_set(l, data, sequence_offset, byte_length, token_length) {
        if ((byte_length) == compare(data, l.byte_offset, sequence_offset, byte_length)) {
            l.byte_length = byte_length;
            l.token_length = token_length;
            return true;
        };
        return false;
    }
    function getUTF8ByteLengthFromCodePoint(code_point) {
        if ((code_point) == 0) return 1
            ; else if ((code_point & 0x7F) == code_point) {
                return 1;
            } else if ((code_point & 0x7FF) == code_point) {
                return 2;
            } else if ((code_point & 0xFFFF) == code_point) {
                return 3;
            } else {
            return 4;
        }
    }
    function utf8ToCodePoint(l, data) {
        var buffer = data.input;
        var index = l.byte_offset + l.byte_length;
        var a = buffer[index];
        var flag = 14;
        if (a & 0x80) {
            flag = a & 0xF0;
            var b = buffer[index + 1];
            if (flag & 0xE0) {
                flag = a & 0xF8;
                var c = buffer[index + 2];
                if ((flag) == 0xF0) {
                    return ((a & 0x7) << 18) | ((b & 0x3F) << 12) | ((c & 0x3F) << 6) | (buffer[index + 3] & 0x3F);
                } else if ((flag) == 0xE0) {
                    return ((a & 0xF) << 12) | ((b & 0x3F) << 6) | (c & 0x3F);
                }
            } else if ((flag) == 0xC) {
                return ((a & 0x1F) << 6) | b & 0x3F;
            }
        } else return a;
        return 0;
    }
    function getTypeAt(code_point) {
        return (lookup_table[code_point] & 0x1F);
    }
    class Lexer {
        constructor() {
            this.byte_offset = 0;
            this.byte_length = 0;
            this.token_length = 0;
            this.token_offset = 0;
            this.prev_token_offset = 0;
            this.type = 0;
            this.line = 0;
            this.current_byte = 0;
        };
        isDiscrete(data, assert_class, offset = 0, USE_UNICODE = false) {
            var type = 0;
            offset += this.byte_offset;
            if ((offset >= data.input_len)) return true;;
            var current_byte = data.input[offset];
            if ((!USE_UNICODE || current_byte < 128)) {
                type = getTypeAt(current_byte);
            } else type = getTypeAt(utf8ToCodePoint(offset, data));
            return (type & assert_class) == 0;
        };
        setToken(type, byte_length, token_length) {
            this.type = type;
            this.byte_length = byte_length;
            this.token_length = token_length;
        };
        getType(USE_UNICODE, data) {
            if (this.END(data)) return 0;;
            if ((this.type) == 0) if ((!(USE_UNICODE) || this.current_byte < 128)) this.type = getTypeAt(this.current_byte); else {
                var index = this.byte_offset;
                this.type = getTypeAt(utf8ToCodePoint(this, data));
            };;
            return this.type;
        };
        isSym(USE_UNICODE, data) {
            return (!this.END(data)) && this.getType(USE_UNICODE, data) == TokenSymbol;
        };
        isNL() {
            return (this.current_byte) == 10 || (this.current_byte) == 13;

        };
        isSP(USE_UNICODE, data) {
            return (this.current_byte) == 32 || USE_UNICODE && (TokenSpace) == this.getType(USE_UNICODE, data);
        };
        isNum(data) {
            if ((this.type) == 0 || (this.type) == TokenNumber) {
                if (this.getType(false, data) == TokenNumber) {
                    var l = data.input_len;
                    var off = this.byte_offset;
                    while ((off++ < l) && 47 < data.input[off] && data.input[off] < 58) {
                        this.byte_length += 1;
                        this.token_length += 1;
                    };
                    this.type = TokenFullNumber;
                    return true;
                } else return false;
            } else return (this.type) == TokenFullNumber;

        };
        isUniID(data) {
            if (((this.type) == 0 || (this.type) == TokenIdentifier)) {
                if ((this.getType(true, data) == TokenIdentifier)) {
                    var l = data.input_len;
                    var off = this.byte_offset;
                    var prev_byte_len = this.byte_length;
                    while (((off + this.byte_length) < l) && ((UNICODE_ID_START | UNICODE_ID_CONTINUE) & lookup_table[utf8ToCodePoint(this, data)]) > 0) {
                        this.byte_length += 1;
                        prev_byte_len = this.byte_length;
                        this.token_length += 1;
                    };
                    this.byte_length = prev_byte_len;
                    this.type = TokenIdentifierUnicode;
                    return true;
                } else return false;
            } else return (this.type) == TokenIdentifierUnicode;
        };
        copy() {
            var destination = new Lexer();
            destination.byte_offset = this.byte_offset;
            destination.byte_length = this.byte_length;
            destination.token_length = this.token_length;
            destination.token_offset = this.token_offset;
            destination.prev_token_offset = this.prev_token_offset;
            destination.line = this.line;
            destination.byte_length = this.byte_length;
            destination.current_byte = this.current_byte;
            return destination;

        };
        sync(source) {
            this.byte_offset = source.byte_offset;
            this.byte_length = source.byte_length;
            this.token_length = source.token_length;
            this.token_offset = source.token_offset;
            this.prev_token_offset = source.prev_token_offset;
            this.line = source.line;
            this.type = source.type;
            this.current_byte = source.current_byte;
            return this;

        };
        slice(source) {
            this.byte_length = this.byte_offset - source.byte_offset;
            this.token_length = this.token_offset - source.token_offset;
            this.byte_offset = source.byte_offset;
            this.token_offset = source.token_offset;
            this.line = source.line;
            return this;
        };
        next(data) {
            this.byte_offset += this.byte_length;
            this.token_offset += this.token_length;
            if ((data.input_len < this.byte_offset)) {
                this.type = 0;
                this.byte_length = 0;
                this.token_length = 0;
            } else {
                this.current_byte = data.input[this.byte_offset];
                if ((this.current_byte) == 10) this.line += 1;;
                this.type = 0;
                this.byte_length = 1;
                this.token_length = 1;
            };
            return this;

        };
        END(data) {
            return this.byte_offset >= data.input_len;

        }
    }
    class ParserData {
        constructor(input_len, rules_len, error_len) {
            this.state = createState(1);
            this.prop = 0;
            this.valid = false;
            this.stack_ptr = 0;
            this.input_ptr = 0;
            this.rules_ptr = 0;
            this.error_ptr = 0;
            this.input_len = input_len;
            this.rules_len = rules_len;
            this.error_len = error_len;
            this.debug_len = 0;
            this.origin_fork = 0;
            this.origin = 0;
            this.alternate = 0;
            this.lexer = new Lexer();
            this.input = new Uint8Array(input_len);
            this.rules = new Uint16Array(rules_len);
            this.error = new Uint8Array(error_len);
            this.stash = new Uint32Array(256);
            this.stack = new Array();
        }
    }
    class ForkData {
        constructor(ptr, valid, depth, byte_offset, byte_length, line) {
            this.byte_offset = byte_offset;
            this.byte_length = byte_length;
            this.line = line;
            this.ptr = ptr;
            this.valid = valid;
            this.depth = depth;
            this.command_offset = 0;
            this.command_block = new Uint16Array(64);
        }
    }
    function fork(data) {
        var fork = new ParserData(data.input_len, data.rules_len, data.error_len - data.error_ptr
        );
        var i = 0;
        for (; i < data.stack_ptr; i++) {
            fork.stash[i] = data.stash[i];
            fork.stack[i] = data.stack[i];
        };
        fork.stack_ptr = data.stack_ptr;
        fork.input_ptr = data.input_ptr;
        fork.origin_fork = data.rules_ptr + data.origin_fork;
        fork.origin = data;
        fork.lexer = data.lexer.copy();
        fork.state = data.state;
        fork.prop = data.prop;
        fork.input = data.input;
        while ((data.alternate)) {
            data = data.alternate;
        };
        data.alternate = fork;
        return fork;
    }
    function init_data(input_len, rules_len, error_len) {
        var parser_data = new ParserData(input_len, rules_len, error_len);
        return parser_data;

    }
    function assert_ascii(l, a, b, c, d) {
        var ascii = l.current_byte;
        if (ascii < 32) return ((a & (1 << ascii)) != 0); else if (ascii < 64) return ((b & (1 << (ascii - 32))) != 0); else if (ascii < 96) return ((c & (1 << (ascii - 64))) != 0); else if (ascii < 128) return ((d & (1 << (ascii - 96))) != 0);;
        return false;
    }
    function add_reduce(state, data, sym_len, body, DNP = false) {
        if (isOutputEnabled(state)) {
            var total = body + sym_len;
            if ((total) == 0) return;;
            if (body > 0xFF || sym_len > 0x1F) {
                var low = (1 << 2) | (body & 0xFFF8);
                var high = sym_len;
                set_action(low, data);
                set_action(high, data);
            } else {
                var low = ((sym_len & 0x1F) << 3) | ((body & 0xFF) << 8);
                set_action(low, data);
            }
        }
    }
    function add_shift(l, data, tok_len) {
        if (tok_len < 0) return;;
        if (tok_len > 0x1FFF) {
            var low = 1 | (1 << 2) | ((tok_len >> 13) & 0xFFF8);
            var high = (tok_len & 0xFFFF);
            set_action(low, data);
            set_action(high, data);
        } else {
            var low = 1 | ((tok_len << 3) & 0xFFF8);
            set_action(low, data);
        }
    }
    function add_skip(l, data, skip_delta) {
        if (skip_delta < 1) return;;
        if (skip_delta > 0x1FFF) {
            var low = 2 | (1 << 2) | ((skip_delta >> 13) & 0xFFF8);
            var high = (skip_delta & 0xFFFF);
            set_action(low, data);
            set_action(high, data);
        } else {
            var low = 2 | ((skip_delta << 3) & 0xFFF8);
            set_action(low, data);
        }
    }
    function set_error(val, data) {
        if ((data.error_ptr > data.error_len)) return;;
        data.error[data.error_ptr++] = val;
    }
    function set_action(val, data) {
        if ((data.rules_ptr > data.rules_len)) return;;
        data.rules[data.rules_ptr++] = val;
    }
    function createState(ENABLE_STACK_OUTPUT) {
        return STATE_ALLOW_SKIP | (ENABLE_STACK_OUTPUT << 1);
    }
    function hasStateFailed(state) {
        var IS_STATE_VALID = 1;
        return 0 == (state & IS_STATE_VALID);
    }
    function mark(val, data) {
        return action_ptr;
    }
    function isOutputEnabled(state) {
        return NULL_STATE != (state & STATE_ALLOW_OUTPUT);
    }
    function reset(mark, origin, advanced, state) {
        action_ptr = mark;
        advanced.sync(origin);
        return state;

    }
    function consume(l, data, state) {
        if (isOutputEnabled(state)) add_shift(l, data, l.token_length);;
        l.next(data);
        return true;
    }
    function assertSuccess(l, data, condition) {
        if ((condition || hasStateFailed(state))) return fail(l, state); else return state;

    }
    function debug_add_header(data, number_of_items, delta_char_offset, peek_start, peek_end, fork_start, fork_end) {
        if ((data.debug_ptr + 1 >= data.debug_len)) return;;
        var local_pointer = data.debug_ptr;
        if ((delta_char_offset > 62)) {
            data.debug[local_pointer + 1] = delta_char_offset;
            delta_char_offset = 63;
            data.debug_ptr++;
        };
        data.debug[local_pointer] = ((number_of_items && 2) | (delta_char_offset << 6) | ((peek_start & 1) << 12) | ((peek_end & 1) << 13) | ((fork_start & 1) << 14) | ((fork_end & 1) << 15));
        data.debug_ptr++;
    }
    function pushFN(data, _fn_ref) {
        data.stack[++data.stack_ptr] = _fn_ref;
    }
    function init_table() {
        return lookup_table;
    }
    var data_stack = new Array();
    function run(data) {
        data_stack.length = 0;
        data_stack.push(data);
        var ACTIVE = true;
        while ((ACTIVE)) {
            for (var data of data_stack) {
                ACTIVE = stepKernel(data, 0);
            }
        }
    }
    function stepKernel(data, stack_base) {
        var ptr = data.stack_ptr;
        var _fn = data.stack[ptr];
        var stash = data.stash[ptr];
        data.stack_ptr--;
        var result = _fn(data.lexer, data, data.state, data.prod, stash);
        data.stash[ptr] = result;
        data.prod = result;
        if ((result < 0 || data.stack_ptr < stack_base)) {
            data.valid = data.lexer.END(data);
            return false;
        };
        return true;
    }
    function get_fork_information() {
        var i = 0;
        var fork_data = Array();
        for (var data of data_stack) {
            var fork = new ForkData((i++), (data.valid), (data.origin_fork + data.rules_ptr), data.lexer.byte_offset, data.lexer.byte_length, data.lexer.line
            );
            fork_data.push(fork);
        };
        return fork_data;
    }
    function block64Consume(data, block, offset, block_offset, limit) {
        var containing_data = data;
        var end = containing_data.origin_fork + data.rules_ptr;
        while ((containing_data.origin_fork > offset)) {
            end = containing_data.origin_fork;
            containing_data = containing_data.origin;
        };
        var start = containing_data.origin_fork;
        offset -= start;
        end -= start;
        var ptr = offset;
        if ((ptr >= end)) return limit - block_offset;;
        while ((block_offset < limit)) {
            block[block_offset++] = containing_data.rules[ptr++];
            if ((ptr >= end)) return block64Consume(data, block, ptr + start, block_offset, limit);
        };
        return 0;
    }
    function get_next_command_block(fork) {
        var remainder = block64Consume(data_stack[fork.ptr], fork.command_block, fork.command_offset, 0, 64);
        fork.command_offset += 64 - remainder;
        if ((remainder > 0)) fork.command_block[64 - remainder] = 0;;
        return fork.command_block;
    }
    function recognizer(data, input_byte_length, production) {
        data.input_len = input_byte_length;
        data.lexer.next(data);
        dispatch(data, production);
        run(data);
    }
    function branch_01185330acd32382(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 54);
        return 48;
    }
    function branch_02bdaf733bfaa415(l, data, state, prod, puid) {
        puid |= 512;
        consume(l, data, state);
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 4;
        if ((((l.current_byte == 123) && consume(l, data, state)))) {
            skip_6725b1140c2474a9(l/*[ nl ]*/, data, state);
            puid |= 8;
            pushFN(data, branch_f71335583ba512d9);
            pushFN(data, $functions__js_data);
            return puid;
        }
    }
    function branch_02db936feb4d9fe2(l, data, state, prod, puid) {
        puid |= 2;
        consume(l, data, state);
        add_reduce(state, data, 2, 35);
        return prod;
    }
    function branch_04128000a201edb7(l, data, state, prod, puid) {
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 4;
        pushFN(data, branch_0e49e83d7dacb92d);
        pushFN(data, $productions__production_start_symbol);
        return puid;
    }
    function branch_0433f9ca88ab0c07(l, data, state, prod, puid) {
        puid |= 4;
        consume(l, data, state);
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 8;
        pushFN(data, branch_8c481e505eac5c5f);
        pushFN(data, $production_bodies__production_body);
        return puid;
    }
    function branch_045c6fa564f4be71(l, data, state, prod, puid) {
        add_reduce(state, data, 4, 20);
        return prod;
    }
    function branch_0476eb443b0be28f(l, data, state, prod, puid) {
        '"-------------INDIRECT-------------------"';
        pushFN(data, $default_productions__js_id_symbols_goto);
        return 10;
    }
    function branch_04fde24ccb5e2755(l, data, state, prod, puid) {
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 8;
        if ((((l.current_byte == 41) && consume(l, data, state)))) {
            add_reduce(state, data, 4, 31);
            return 28;
        }
    }
    function branch_051dcdd7da7c034f(l, data, state, prod, puid) {
        add_reduce(state, data, 4, 19);
        return 21;
    }
    function branch_057a75aa199702ae(l, data, state, prod, puid) {
        return 0;
    }
    function branch_0947409ab739201d(l, data, state, prod, puid) {
        add_reduce(state, data, 2, 4);
        return prod;
    }
    function branch_096c2a72305a0df6(l, data, state, prod, puid) {
        return 3;
    }
    function branch_0b55ac6b9f65db08(l, data, state, prod, puid) {
        puid |= 512;
        consume(l, data, state);
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 128;
        if ((((cmpr_set(l, data, 32, 2, 2)) && consume(l, data, state)))) {
            skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
            puid |= 64;
            pushFN(data, branch_0eab8e2b65a0c963);
            pushFN(data, $symbols__js_identifier);
            return puid;
        }
    }
    function branch_0bc625d43a900ade(l, data, state, prod, puid) {
        puid |= 128;
        consume(l, data, state);
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 32;
        pushFN(data, branch_c75da5a5cb818137);
        pushFN(data, $symbols__identifier);
        return puid;
    }
    function branch_0e09482691fb7844(l, data, state, prod, puid) {
        puid |= 65536;
        consume(l, data, state);
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 4096;
        if ((((l.current_byte == 41) && consume(l, data, state)))) {
            add_reduce(state, data, 3, 40);
            return prod;
        }
    }
    function branch_0e25b8d11d484d7b(l, data, state, prod, puid) {
        return 15;
    }
    function branch_0e49e83d7dacb92d(l, data, state, prod, puid) {
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 8;
        pushFN(data, branch_045c6fa564f4be71);
        pushFN(data, $production_bodies__production_bodies);
        return puid;
    }
    function branch_0eab8e2b65a0c963(l, data, state, prod, puid) {
        add_reduce(state, data, 4, 47);
        return prod;
    }
    function branch_0f284a6c127abef4(l, data, state, prod, puid) {
        puid |= 1;
        pushFN(data, branch_c87f7ff160b07dfe);
        pushFN(data, $symbols__generated_symbol);
        return puid;
    }
    function branch_1005266db479efc4(l, data, state, prod, puid) {
        puid |= 2;
        consume(l, data, state);
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 4;
        if ((((l.current_byte == 123) && consume(l, data, state)))) {
            skip_6725b1140c2474a9(l/*[ nl ]*/, data, state);
            puid |= 8;
            pushFN(data, branch_f71335583ba512d9);
            pushFN(data, $functions__js_data);
            return puid;
        }
    }
    function branch_125efd3faab5f5e5(l, data, state, prod, puid) {
        puid |= 1024;
        consume(l, data, state);
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 32;
        if ((((l.current_byte == 94) && consume(l, data, state)))) {
            skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
            puid |= 64;
            pushFN(data, branch_6ad5b555db566ccc);
            pushFN(data, $symbols__js_identifier);
            return puid;
        }
    }
    function branch_14a5617bbdea784b(l, data, state, prod, puid) {
        puid |= 8;
        consume(l, data, state);
        add_reduce(state, data, 1, 52);
        return prod;
    }
    function branch_14dddc39c731a844(l, data, state, prod, puid) {
        skip_6725b1140c2474a9(l/*[ nl ]*/, data, state);
        pushFN(data, branch_ee47e56ff9bd35e7);
        pushFN(data, $preambles__import_preamble_list_54);
        puid |= 4;
        return puid;
    }
    function branch_156d6b74cee8e2c1(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $preambles__preamble_goto);
        return 2;
    }
    function branch_179cf42c039f199d(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 2);
        return prod;
    }
    function branch_1814f5f1aa277ddf(l, data, state, prod, puid) {
        add_reduce(state, data, 2, 7);
        return prod;
    }
    function branch_1ab2b70946de8d86(l, data, state, prod, puid) {
        puid |= 1;
        pushFN(data, branch_0947409ab739201d);
        pushFN(data, $preambles__preamble_clause);
        return puid;
    }
    function branch_1b3f907633016209(l, data, state, prod, puid) {
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 4;
        if ((((l.current_byte == 123) && consume(l, data, state)))) {
            skip_6725b1140c2474a9(l/*[ nl ]*/, data, state);
            puid |= 8;
            pushFN(data, branch_abbdb83b816c5317);
            pushFN(data, $functions__js_data);
            return puid;
        }
    }
    function branch_1c01020cda388d60(l, data, state, prod, puid) {
        puid |= 8;
        pushFN(data, branch_c87f7ff160b07dfe);
        pushFN(data, $symbols__production_token_symbol);
        return puid;
    }
    function branch_2117e6b923c2d45a(l, data, state, prod, puid) {
        if ((l.isNL() || l.isSP(true, data))) {
            var pk = l.copy();
            pk.next(data);
            if ((dt_1dfefb30107f3630(pk, data) || dt_4636ef6b23fcb656(pk, data) || cmpr_set(pk, data, 25, 2, 2) || cmpr_set(pk, data, 15, 2, 2) || cmpr_set(pk, data, 17, 2, 2) || cmpr_set(pk, data, 1, 2, 2) || cmpr_set(pk, data, 65, 4, 4) || assert_ascii(pk, 0x0, 0x80000318, 0xb8000000, 0x38000040) || pk.isUniID(data) || pk.isNL() || pk.isNum(data) || pk.isSym(true, data) || pk.isSP(true, data))) {
                pushFN(data, branch_fe93755efb2539f6);
                return branch_b97f98668aa5b639(l, data, state, prod, 8);
            }
        } else if ((l.END(data))) {
            pushFN(data, branch_fe93755efb2539f6);
            return branch_b97f98668aa5b639(l, data, state, prod, 8);
        } else if ((sym_map_bba38ae7f7052d4b(l, data) == 1)) {
            add_reduce(state, data, 2, 8);
            return 11;
        }
    }
    function branch_22d5d610a081b1fd(l, data, state, prod, puid) {
        puid |= 256;
        consume(l, data, state);
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 4;
        if ((((l.current_byte == 123) && consume(l, data, state)))) {
            skip_6725b1140c2474a9(l/*[ nl ]*/, data, state);
            puid |= 8;
            pushFN(data, branch_f71335583ba512d9);
            pushFN(data, $functions__js_data);
            return puid;
        }
    }
    function branch_2312ff272abe83c7(l, data, state, prod, puid) {
        puid |= 16;
        consume(l, data, state);
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 32;
        pushFN(data, branch_58e22fe3422b4fd7);
        pushFN(data, $symbols__identifier);
        return puid;
    }
    function branch_235d1a59bde2b405(l, data, state, prod, puid) {
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 8;
        if ((((l.current_byte == 41) && consume(l, data, state)))) {
            add_reduce(state, data, 4, 33);
            return 28;
        }
    }
    function branch_23667e56244f0c77(l, data, state, prod, puid) {
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        pushFN(data, branch_77af361f57de5414);
        pushFN(data, $productions__production_start_symbol);
        puid |= 4;
        return puid;
    }
    function branch_281211993c7e1b75(l, data, state, prod, puid) {
        puid |= 1;
        consume(l, data, state);
        add_reduce(state, data, 2, 7);
        return prod;
    }
    function branch_2aaa74d306d3315e(l, data, state, prod, puid) {
        '"-------------INDIRECT-------------------"';
        pushFN(data, $production_bodies__entries_goto);
        return 26;
    }
    function branch_2b1f52e8ce7d3145(l, data, state, prod, puid) {
        '"-------------INDIRECT-------------------"';
        pushFN(data, $comments__cm_list_71_goto);
        return 46;
    }
    function branch_2b4b778fcfc79f4c(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 53);
        return 47;
    }
    function branch_2dcd0f298868c53c(l, data, state, prod, puid) {
        puid |= 8;
        pushFN(data, branch_8d9df987b86a8587);
        pushFN(data, $comments__comment);
        return puid;
    }
    function branch_2e85125c6400c808(l, data, state, prod, puid) {
        puid |= 2;
        consume(l, data, state);
        puid |= 4;
        pushFN(data, branch_414650389f1a9bb3);
        pushFN(data, $symbols__sym_delimiter);
        return puid;
    }
    function branch_2ebfe580b98a9a7f(l, data, state, prod, puid) {
        puid |= 1;
        pushFN(data, branch_0947409ab739201d);
        pushFN(data, $symbols__ignore_symbol);
        return puid;
    }
    function branch_3031de7b56dd2506(l, data, state, prod, puid) {
        add_reduce(state, data, 2, 18);
        return prod;
    }
    function branch_355d0cd3d29c7396(l, data, state, prod, puid) {
        pushFN(data, $symbols__escaped_symbol_list_48_goto);
        return 43;
    }
    function branch_3824178b99f2c682(l, data, state, prod, puid) {
        return 6;
    }
    function branch_3a1cbc949fc8b95d(l, data, state, prod, puid) {
        puid |= 4;
        consume(l, data, state);
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 8;
        pushFN(data, branch_6c31ac6f7b9f2ee3);
        pushFN(data, $production_bodies__body_entry_list_124);
        return puid;
    }
    function branch_3a3b05edc9dc1610(l, data, state, prod, puid) {
        puid |= 1;
        pushFN(data, branch_0947409ab739201d);
        pushFN(data, $symbols__terminal_symbol);
        return puid;
    }
    function branch_3ae48ae85badf17d(l, data, state, prod, puid) {
        puid |= 1;
        pushFN(data, branch_b7a32555662f2776);
        pushFN(data, $preambles__preamble);
        return puid;
    }
    function branch_3c2ffba1c1892598(l, data, state, prod, puid) {
        puid |= 2;
        consume(l, data, state);
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 32;
        if ((((l.current_byte == 94) && consume(l, data, state)))) {
            skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
            puid |= 64;
            pushFN(data, branch_6ad5b555db566ccc);
            pushFN(data, $symbols__js_identifier);
            return puid;
        }
    }
    function branch_3ec57237f6375970(l, data, state, prod, puid) {
        puid |= 2;
        consume(l, data, state);
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 1;
        pushFN(data, branch_8946837e5520479c);
        pushFN(data, $symbols__identifier);
        return puid;
    }
    function branch_414650389f1a9bb3(l, data, state, prod, puid) {
        add_reduce(state, data, 3, 8);
        return prod;
    }
    function branch_430f62fc0e835934(l, data, state, prod, puid) {
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 4096;
        if ((((l.current_byte == 41) && consume(l, data, state)))) {
            add_reduce(state, data, 3, 37);
            pushFN(data, $symbols__symbol_goto);
            return 31;
        }
    }
    function branch_44232392d8af3f34(l, data, state, prod, puid) {
        return 12;
    }
    function branch_4650505de5796604(l, data, state, prod, puid) {
        puid |= 1;
        pushFN(data, branch_0947409ab739201d);
        pushFN(data, $production_bodies__body_entry);
        return puid;
    }
    function branch_468cf5dac8194177(l, data, state, prod, puid) {
        '"-------------INDIRECT-------------------"';
        pushFN(data, $productions__productions_goto);
        return 20;
    }
    function branch_4737a8dafefb83c5(l, data, state, prod, puid) {
        return 18;
    }
    function branch_4a62559de26784e8(l, data, state, prod, puid) {
        puid |= 1;
        pushFN(data, branch_d31d99908115a613);
        pushFN(data, $productions__production);
        return puid;
    }
    function branch_4d4281980be003fa(l, data, state, prod, puid) {
        skip_d4bd762c514693b7(l/*[ ws ]*/, data, state);
        puid |= 4;
        pushFN(data, branch_877eb8ecfd4501b3);
        pushFN(data, $comments__comment_delimiter);
        return puid;
    }
    function branch_4e7b1d63c4233efc(l, data, state, prod, puid) {
        pushFN(data, $functions__js_data_goto);
        return 38;
    }
    function branch_4f9386beb0ccb3d3(l, data, state, prod, puid) {
        add_reduce(state, data, 2, 16);
        return prod;
    }
    function branch_50bbc1b45a7d0e84(l, data, state, prod, puid) {
        puid |= 1;
        consume(l, data, state);
        add_reduce(state, data, 1, 52);
        return prod;
    }
    function branch_52a1b98e3a899f95(l, data, state, prod, puid) {
        puid |= 4;
        pushFN(data, branch_c87f7ff160b07dfe);
        pushFN(data, $comments__comment);
        return puid;
    }
    function branch_5647ba8923cc55dc(l, data, state, prod, puid) {
        add_reduce(state, data, 2, 6);
        return 7;
    }
    function branch_56af79c239dbe4ca(l, data, state, prod, puid) {
        puid |= 256;
        consume(l, data, state);
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 32;
        if ((((l.current_byte == 94) && consume(l, data, state)))) {
            skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
            puid |= 64;
            pushFN(data, branch_6ad5b555db566ccc);
            pushFN(data, $symbols__js_identifier);
            return puid;
        }
    }
    function branch_58e22fe3422b4fd7(l, data, state, prod, puid) {
        skip_d4bd762c514693b7(l/*[ ws ]*/, data, state);
        puid |= 64;
        if ((((l.isNL()) && consume(l, data, state)))) {
            add_reduce(state, data, 8, 11);
            return prod;
        }
    }
    function branch_599fa571c70519de(l, data, state, prod, puid) {
        '"-------------INDIRECT-------------------"';
        pushFN(data, $functions__js_data_goto);
        return 38;
    }
    function branch_59ebf03284c2e51a(l, data, state, prod, puid) {
        '"-------------INDIRECT-------------------"';
        pushFN(data, $preambles__import_preamble_list_54_goto);
        return 44;
    }
    function branch_59f20d9b567de150(l, data, state, prod, puid) {
        pushFN(data, $default_productions__js_id_symbols_goto);
        return 10;
    }
    function branch_5b40abfba9c1d7fa(l, data, state, prod, puid) {
        return 36;
    }
    function branch_5bc1625c551818db(l, data, state, prod, puid) {
        puid |= 1;
        consume(l, data, state);
        add_reduce(state, data, 2, 4);
        return prod;
    }
    function branch_60683dc2cc08007c(l, data, state, prod, puid) {
        pushFN(data, $productions__productions_goto);
        return 20;
    }
    function branch_659295cd363b1618(l, data, state, prod, puid) {
        puid |= 1;
        pushFN(data, branch_c87f7ff160b07dfe);
        pushFN(data, $functions__js_primitive);
        return puid;
    }
    function branch_66dcc36dff0ab254(l, data, state, prod, puid) {
        puid |= 1;
        pushFN(data, branch_cde0f3697c246d01);
        pushFN(data, $comments__comment);
        return puid;
    }
    function branch_6a363a77a5d6873d(l, data, state, prod, puid) {
        return 16;
    }
    function branch_6ad5b555db566ccc(l, data, state, prod, puid) {
        add_reduce(state, data, 4, 46);
        return prod;
    }
    function branch_6b2e343eacea4736(l, data, state, prod, puid) {
        puid |= 2;
        pushFN(data, branch_cde0f3697c246d01);
        pushFN(data, $symbols__symbol);
        return puid;
    }
    function branch_6b898dd2704529c6(l, data, state, prod, puid) {
        pushFN(data, $preambles__import_preamble_list_55_goto);
        return 45;
    }
    function branch_6bc3f91c2dcbc621(l, data, state, prod, puid) {
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 4096;
        if ((((l.current_byte == 41) && consume(l, data, state)))) {
            add_reduce(state, data, 4, 38);
            return prod;
        }
    }
    function branch_6c31ac6f7b9f2ee3(l, data, state, prod, puid) {
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 16;
        if ((((l.current_byte == 93) && consume(l, data, state)))) {
            add_reduce(state, data, 3, 29);
            return prod;
        }
    }
    function branch_6dd62f4df44385d0(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 55);
        return 50;
    }
    function branch_6ee45952341f824d(l, data, state, prod, puid) {
        add_reduce(state, data, 3, 8);
        return 11;
    }
    function branch_6f2875ea620ed3e2(l, data, state, prod, puid) {
        puid |= 4;
        consume(l, data, state);
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 1;
        pushFN(data, branch_8c481e505eac5c5f);
        pushFN(data, $comments__comment);
        return puid;
    }
    function branch_7361681ac09951c6(l, data, state, prod, puid) {
        '"-------------INDIRECT-------------------"';
        pushFN(data, $symbols__ignore_symbols_goto);
        return 5;
    }
    function branch_77af361f57de5414(l, data, state, prod, puid) {
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        switch (sym_map_31e5d09dd4089237(l, data)) {
            default:
            case 0:
                {
                    add_reduce(state, data, 3, 21);
                    return 21;
                }
            case 1:
                {
                    puid |= 8;
                    pushFN(data, branch_051dcdd7da7c034f);
                    pushFN(data, $production_bodies__production_bodies);
                    return puid;
                }
        }
    }
    function branch_78ce8ea802abedaf(l, data, state, prod, puid) {
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        switch (sym_map_243df2c5c28b070c(l, data)) {
            case 0:
                {
                    puid |= 16;
                    pushFN(data, branch_c0f65244f58d0309);
                    pushFN(data, $functions__reduce_function);
                    return puid;
                }
            default:
            case 1:
                {
                    add_reduce(state, data, 4, 25);
                    return 25;
                }
        }
    }
    function branch_79317aabcdf59047(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $symbols__condition_symbol_list_goto);
        return 29;
    }
    function branch_7af4ffd47fc8ee8f(l, data, state, prod, puid) {
        puid |= 2;
        pushFN(data, branch_179cf42c039f199d);
        pushFN(data, $productions__productions);
        return puid;
    }
    function branch_7b4066419573fedd(l, data, state, prod, puid) {
        '"-------------INDIRECT-------------------"';
        pushFN(data, $symbols__condition_symbol_list_goto);
        return 29;
    }
    function branch_7cdb6c4b3d074a49(l, data, state, prod, puid) {
        skip_6725b1140c2474a9(l/*[ nl ]*/, data, state);
        pushFN(data, branch_f58cad6ed426268d);
        pushFN(data, $preambles__import_preamble_list_54);
        puid |= 4;
        return puid;
    }
    function branch_81685e7b6a8a4573(l, data, state, prod, puid) {
        return 1;
    }
    function branch_81d41930eb47d90e(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 28);
        return prod;
    }
    function branch_826b87b9be26d3a9(l, data, state, prod, puid) {
        puid |= 1;
        pushFN(data, branch_cde0f3697c246d01);
        pushFN(data, $production_bodies__condition_clause);
        return puid;
    }
    function branch_846a90ef8e657721(l, data, state, prod, puid) {
        '"-------------INDIRECT-------------------"';
        pushFN(data, $symbols__escaped_symbol_list_48_goto);
        return 43;
    }
    function branch_8555a06bd8da8654(l, data, state, prod, puid) {
        puid |= 1;
        pushFN(data, branch_c87f7ff160b07dfe);
        pushFN(data, $preambles__ignore_preamble);
        return puid;
    }
    function branch_86f6998dc1615c33(l, data, state, prod, puid) {
        puid |= 1;
        pushFN(data, branch_4f9386beb0ccb3d3);
        pushFN(data, $productions__production);
        return puid;
    }
    function branch_877eb8ecfd4501b3(l, data, state, prod, puid) {
        add_reduce(state, data, 3, 13);
        return 17;
    }
    function branch_894314f7184a8ff8(l, data, state, prod, puid) {
        puid |= 16;
        consume(l, data, state);
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 32;
        pushFN(data, branch_c75da5a5cb818137);
        pushFN(data, $symbols__identifier);
        return puid;
    }
    function branch_8946837e5520479c(l, data, state, prod, puid) {
        add_reduce(state, data, 3, 42);
        return prod;
    }
    function branch_8a065385b774962e(l, data, state, prod, puid) {
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 8;
        if ((((l.current_byte == 41) && consume(l, data, state)))) {
            add_reduce(state, data, 4, 30);
            return 28;
        }
    }
    function branch_8c481e505eac5c5f(l, data, state, prod, puid) {
        add_reduce(state, data, 3, 22);
        return prod;
    }
    function branch_8cc27ab15c5524f8(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 49);
        return 39;
    }
    function branch_8d512b13ebd01d1b(l, data, state, prod, puid) {
        return 8;
    }
    function branch_8d9df987b86a8587(l, data, state, prod, puid) {
        add_reduce(state, data, 2, 17);
        return prod;
    }
    function branch_900af65e85901fee(l, data, state, prod, puid) {
        pushFN(data, $symbols__symbol_goto);
        return 8;
    }
    function branch_90aaa2333d90b1d7(l, data, state, prod, puid) {
        puid |= 2;
        pushFN(data, branch_eb8c68a8cbcf8f7b);
        pushFN(data, $production_bodies__body_entry);
        return puid;
    }
    function branch_90fc2b73b49088ce(l, data, state, prod, puid) {
        puid |= 8;
        consume(l, data, state);
        return prod;
    }
    function branch_91bf73fef1a5e435(l, data, state, prod, puid) {
        puid |= 2;
        pushFN(data, branch_1814f5f1aa277ddf);
        pushFN(data, $functions__js_data_block);
        return puid;
    }
    function branch_93c5669620f042b5(l, data, state, prod, puid) {
        puid |= 256;
        consume(l, data, state);
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 128;
        if ((((cmpr_set(l, data, 32, 2, 2)) && consume(l, data, state)))) {
            skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
            puid |= 64;
            pushFN(data, branch_0eab8e2b65a0c963);
            pushFN(data, $symbols__js_identifier);
            return puid;
        }
    }
    function branch_97d546b3446dcbb8(l, data, state, prod, puid) {
        puid |= 4;
        consume(l, data, state);
        return prod;
    }
    function branch_98628b1ab9abb2f0(l, data, state, prod, puid) {
        puid |= 2;
        pushFN(data, branch_c87f7ff160b07dfe);
        pushFN(data, $functions__js_data_block);
        return puid;
    }
    function branch_99afa145831a4aad(l, data, state, prod, puid) {
        '"-------------INDIRECT-------------------"';
        pushFN(data, $symbols__symbol_goto);
        return 31;
    }
    function branch_9be932b0fd3603a6(l, data, state, prod, puid) {
        add_reduce(state, data, 2, 1);
        return prod;
    }
    function branch_9e5c5755e3e00fc4(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $production_bodies__body_entry_list_124_goto);
        return 49;
    }
    function branch_a0d510288dad7759(l, data, state, prod, puid) {
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        switch (sym_map_1c05b0750ce90fe2(l, data)) {
            case 0:
                {
                    var pk = l.copy();
                    skip_27d8e42c3256622b(pk.next(data), data, STATE_ALLOW_SKIP);
                    if ((pk.current_byte == 123)) {
                        pushFN(data, branch_5b40abfba9c1d7fa);
                        return branch_1005266db479efc4(l, data, state, prod, 1);
                    } else if ((pk.current_byte == 94)) {
                        pushFN(data, branch_5b40abfba9c1d7fa);
                        return branch_3c2ffba1c1892598(l, data, state, prod, 1);
                    } else if ((cmpr_set(pk, data, 32, 2, 2))) {
                        pushFN(data, branch_5b40abfba9c1d7fa);
                        return branch_c6ed50aa92102ba7(l, data, state, prod, 1);
                    }
                }
            case 1:
                {
                    var pk = l.copy();
                    skip_27d8e42c3256622b(pk.next(data), data, STATE_ALLOW_SKIP);
                    if ((pk.current_byte == 123)) {
                        pushFN(data, branch_5b40abfba9c1d7fa);
                        return branch_02bdaf733bfaa415(l, data, state, prod, 1);
                    } else if ((pk.current_byte == 94)) {
                        pushFN(data, branch_5b40abfba9c1d7fa);
                        return branch_dfc3188cf1a1e04f(l, data, state, prod, 1);
                    } else if ((cmpr_set(pk, data, 32, 2, 2))) {
                        pushFN(data, branch_5b40abfba9c1d7fa);
                        return branch_0b55ac6b9f65db08(l, data, state, prod, 1);
                    }
                }
            case 2:
                {
                    var pk = l.copy();
                    skip_27d8e42c3256622b(pk.next(data), data, STATE_ALLOW_SKIP);
                    if ((pk.current_byte == 123)) {
                        pushFN(data, branch_5b40abfba9c1d7fa);
                        return branch_22d5d610a081b1fd(l, data, state, prod, 1);
                    } else if ((pk.current_byte == 94)) {
                        pushFN(data, branch_5b40abfba9c1d7fa);
                        return branch_56af79c239dbe4ca(l, data, state, prod, 1);
                    } else if ((cmpr_set(pk, data, 32, 2, 2))) {
                        pushFN(data, branch_5b40abfba9c1d7fa);
                        return branch_93c5669620f042b5(l, data, state, prod, 1);
                    }
                }
            case 3:
                {
                    var pk = l.copy();
                    skip_27d8e42c3256622b(pk.next(data), data, STATE_ALLOW_SKIP);
                    if ((pk.current_byte == 123)) {
                        pushFN(data, branch_5b40abfba9c1d7fa);
                        return branch_cedbf5aa18b253d8(l, data, state, prod, 1);
                    } else if ((pk.current_byte == 94)) {
                        pushFN(data, branch_5b40abfba9c1d7fa);
                        return branch_125efd3faab5f5e5(l, data, state, prod, 1);
                    } else if ((cmpr_set(pk, data, 32, 2, 2))) {
                        pushFN(data, branch_5b40abfba9c1d7fa);
                        return branch_ffc507d53125c845(l, data, state, prod, 1);
                    }
                }
            default:
                break;
        }
    }
    function branch_a1a914cd39ca1a43(l, data, state, prod, puid) {
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 8;
        if ((((l.current_byte == 41) && consume(l, data, state)))) {
            add_reduce(state, data, 4, 32);
            return 28;
        }
    }
    function branch_a22590ec25240743(l, data, state, prod, puid) {
        puid |= 16;
        consume(l, data, state);
        add_reduce(state, data, 2, 7);
        return prod;
    }
    function branch_a25b83c36b7add7b(l, data, state, prod, puid) {
        puid |= 2;
        consume(l, data, state);
        add_reduce(state, data, 2, 7);
        return prod;
    }
    function branch_abbdb83b816c5317(l, data, state, prod, puid) {
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 16;
        if ((((l.current_byte == 125) && consume(l, data, state)))) {
            add_reduce(state, data, 5, 51);
            return 42;
        }
    }
    function branch_adc19d145f82bf5a(l, data, state, prod, puid) {
        puid |= 8;
        pushFN(data, branch_cde0f3697c246d01);
        pushFN(data, $production_bodies__production_body);
        return puid;
    }
    function branch_ae77cfd8a3d33a1c(l, data, state, prod, puid) {
        add_reduce(state, data, 3, 9);
        return 13;
    }
    function branch_b0dd4b0a54d162b6(l, data, state, prod, puid) {
        return 27;
    }
    function branch_b217ff17bd8e39fa(l, data, state, prod, puid) {
        return 41;
    }
    function branch_b43d464283be97f2(l, data, state, prod, puid) {
        puid |= 2;
        consume(l, data, state);
        return prod;
    }
    function branch_b4932c1a84180dd0(l, data, state, prod, puid) {
        add_reduce(state, data, 2, 24);
        return 25;
    }
    function branch_b4be9c594153d66a(l, data, state, prod, puid) {
        puid |= 4;
        consume(l, data, state);
        add_reduce(state, data, 2, 7);
        return prod;
    }
    function branch_b572c2e06337878e(l, data, state, prod, puid) {
        '"-------------INDIRECT-------------------"';
        pushFN(data, $production_bodies__production_bodies_goto);
        return 24;
    }
    function branch_b6ab240fd169d593(l, data, state, prod, puid) {
        puid |= 65536;
        consume(l, data, state);
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 16384;
        pushFN(data, branch_6bc3f91c2dcbc621);
        pushFN(data, $symbols__terminal_symbol);
        return puid;
    }
    function branch_b6e6be42df627e76(l, data, state, prod, puid) {
        '"-------------INDIRECT-------------------"';
        pushFN(data, $preambles__preamble_goto);
        return 2;
    }
    function branch_b7a32555662f2776(l, data, state, prod, puid) {
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 2;
        pushFN(data, branch_9be932b0fd3603a6);
        pushFN(data, $productions__productions);
        return puid;
    }
    function branch_b7c349247d69ad93(l, data, state, prod, puid) {
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        pushFN(data, branch_7cdb6c4b3d074a49);
        pushFN(data, $preambles__import_preamble_list_55);
        puid |= 8;
        return puid;
    }
    function branch_b97f98668aa5b639(l, data, state, prod, puid) {
        puid |= 4;
        pushFN(data, branch_414650389f1a9bb3);
        pushFN(data, $symbols__sym_delimiter);
        return puid;
    }
    function branch_b98e5f677a2a8eb2(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 52);
        pushFN(data, $comments__cm_list_71_goto);
        return 46;
    }
    function branch_be050e18b1dae7da(l, data, state, prod, puid) {
        puid |= 4;
        pushFN(data, branch_81d41930eb47d90e);
        pushFN(data, $symbols__empty_symbol);
        return puid;
    }
    function branch_c0f65244f58d0309(l, data, state, prod, puid) {
        add_reduce(state, data, 5, 23);
        return 25;
    }
    function branch_c175a6daf89c34b0(l, data, state, prod, puid) {
        puid |= 1;
        pushFN(data, branch_1814f5f1aa277ddf);
        pushFN(data, $comments__comment_primitive);
        return puid;
    }
    function branch_c2643f1ab5de2b75(l, data, state, prod, puid) {
        add_reduce(state, data, 2, 10);
        return 14;
    }
    function branch_c504274fef8dc459(l, data, state, prod, puid) {
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 8;
        if ((((l.current_byte == 41) && consume(l, data, state)))) {
            add_reduce(state, data, 4, 34);
            return 28;
        }
    }
    function branch_c5173a6558ea6023(l, data, state, prod, puid) {
        return 22;
    }
    function branch_c65131567c09d34c(l, data, state, prod, puid) {
        puid |= 2;
        pushFN(data, branch_c87f7ff160b07dfe);
        pushFN(data, $symbols__literal_symbol);
        return puid;
    }
    function branch_c678eb9c04d3c7d4(l, data, state, prod, puid) {
        '"-------------INDIRECT-------------------"';
        pushFN(data, $preambles__import_preamble_list_55_goto);
        return 45;
    }
    function branch_c6ed50aa92102ba7(l, data, state, prod, puid) {
        puid |= 2;
        consume(l, data, state);
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 128;
        if ((((cmpr_set(l, data, 32, 2, 2)) && consume(l, data, state)))) {
            skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
            puid |= 64;
            pushFN(data, branch_0eab8e2b65a0c963);
            pushFN(data, $symbols__js_identifier);
            return puid;
        }
    }
    function branch_c75da5a5cb818137(l, data, state, prod, puid) {
        skip_d4bd762c514693b7(l/*[ ws ]*/, data, state);
        puid |= 64;
        if ((((l.isNL()) && consume(l, data, state)))) {
            add_reduce(state, data, 7, 12);
            return prod;
        }
    }
    function branch_c7a4b3f5ff02d93d(l, data, state, prod, puid) {
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 2;
        if ((((cmpr_set(l, data, 27, 2, 2)) && consume(l, data, state)))) {
            skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
            puid |= 1;
            pushFN(data, branch_d4aa20c36a8f2288);
            pushFN(data, $symbols__identifier);
            return puid;
        }
    }
    function branch_c87f7ff160b07dfe(l, data, state, prod, puid) {
        return prod;
    }
    function branch_ca85d69693cada14(l, data, state, prod, puid) {
        return 30;
    }
    function branch_ca991aa43916bf4c(l, data, state, prod, puid) {
        puid |= 4;
        consume(l, data, state);
        add_reduce(state, data, 1, 52);
        return prod;
    }
    function branch_cd5afda4dbab1ae3(l, data, state, prod, puid) {
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 2;
        pushFN(data, branch_1b3f907633016209);
        pushFN(data, $symbols__identifier);
        return puid;
    }
    function branch_cde0f3697c246d01(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 3);
        return prod;
    }
    function branch_ce15cdf7daff286b(l, data, state, prod, puid) {
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        switch (sym_map_243df2c5c28b070c(l, data)) {
            case 0:
                {
                    puid |= 16;
                    pushFN(data, branch_b4932c1a84180dd0);
                    pushFN(data, $functions__reduce_function);
                    return puid;
                }
            default:
            case 1:
                {
                    add_reduce(state, data, 1, 26);
                    return 25;
                }
        }
    }
    function branch_cedbf5aa18b253d8(l, data, state, prod, puid) {
        puid |= 1024;
        consume(l, data, state);
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 4;
        if ((((l.current_byte == 123) && consume(l, data, state)))) {
            skip_6725b1140c2474a9(l/*[ nl ]*/, data, state);
            puid |= 8;
            pushFN(data, branch_f71335583ba512d9);
            pushFN(data, $functions__js_data);
            return puid;
        }
    }
    function branch_cf750a8edfb59b02(l, data, state, prod, puid) {
        puid |= 2;
        pushFN(data, branch_dbc6224e086c1b1d);
        pushFN(data, $production_bodies__body_entry);
        return puid;
    }
    function branch_d0238310ec87f2e9(l, data, state, prod, puid) {
        skip_d4bd762c514693b7(l/*[ ws ]*/, data, state);
        puid |= 8;
        if ((((l.isNL()) && consume(l, data, state)))) {
            add_reduce(state, data, 4, 5);
            return 4;
        }
    }
    function branch_d0c988690b51e659(l, data, state, prod, puid) {
        pushFN(data, $production_bodies__production_bodies_goto);
        return 24;
    }
    function branch_d1cc9a46ed534a71(l, data, state, prod, puid) {
        puid |= 2;
        pushFN(data, branch_3031de7b56dd2506);
        pushFN(data, $functions__referenced_function);
        return puid;
    }
    function branch_d23835acb03488f1(l, data, state, prod, puid) {
        puid |= 1;
        consume(l, data, state);
        return prod;
    }
    function branch_d31d99908115a613(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 14);
        return prod;
    }
    function branch_d4aa20c36a8f2288(l, data, state, prod, puid) {
        add_reduce(state, data, 3, 42);
        return 33;
    }
    function branch_d760475894a00139(l, data, state, prod, puid) {
        puid |= 1;
        pushFN(data, branch_1814f5f1aa277ddf);
        pushFN(data, $functions__js_primitive);
        return puid;
    }
    function branch_da0a56a4faa5afe8(l, data, state, prod, puid) {
        add_reduce(state, data, 2, 36);
        pushFN(data, $symbols__symbol_goto);
        return 31;
    }
    function branch_dbc6224e086c1b1d(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 17);
        return prod;
    }
    function branch_dd4e42a28025d3b8(l, data, state, prod, puid) {
        return 21;
    }
    function branch_df184234645d9254(l, data, state, prod, puid) {
        puid |= 128;
        consume(l, data, state);
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 32;
        pushFN(data, branch_58e22fe3422b4fd7);
        pushFN(data, $symbols__identifier);
        return puid;
    }
    function branch_dfc3188cf1a1e04f(l, data, state, prod, puid) {
        puid |= 512;
        consume(l, data, state);
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 32;
        if ((((l.current_byte == 94) && consume(l, data, state)))) {
            skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
            puid |= 64;
            pushFN(data, branch_6ad5b555db566ccc);
            pushFN(data, $symbols__js_identifier);
            return puid;
        }
    }
    function branch_dfc39e036a46551d(l, data, state, prod, puid) {
        puid |= 4;
        pushFN(data, branch_ae77cfd8a3d33a1c);
        pushFN(data, $symbols__sym_delimiter);
        return puid;
    }
    function branch_dff6c1299fc320e7(l, data, state, prod, puid) {
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 4;
        if ((((l.current_byte == 125) && consume(l, data, state)))) {
            add_reduce(state, data, 3, 50);
            return 40;
        }
    }
    function branch_e0964953d1827b08(l, data, state, prod, puid) {
        puid |= 4;
        pushFN(data, branch_c87f7ff160b07dfe);
        pushFN(data, $symbols__escaped_symbol);
        return puid;
    }
    function branch_e0ef2296bb74d893(l, data, state, prod, puid) {
        puid |= 16;
        consume(l, data, state);
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 2;
        pushFN(data, branch_04128000a201edb7);
        pushFN(data, $productions__production_group_1_0_);
        return puid;
    }
    function branch_e32e3d437aacc083(l, data, state, prod, puid) {
        puid |= 2;
        pushFN(data, branch_c87f7ff160b07dfe);
        pushFN(data, $preambles__import_preamble);
        return puid;
    }
    function branch_e38dfa0a987cd1c5(l, data, state, prod, puid) {
        '"-------------INDIRECT-------------------"';
        pushFN(data, $production_bodies__body_entry_list_124_goto);
        return 49;
    }
    function branch_e8fa6fae7db24859(l, data, state, prod, puid) {
        pushFN(data, $symbols__symbol_goto);
        return 31;
    }
    function branch_eb8c68a8cbcf8f7b(l, data, state, prod, puid) {
        add_reduce(state, data, 2, 27);
        return prod;
    }
    function branch_edc46cfe2f2f664d(l, data, state, prod, puid) {
        puid |= 8;
        consume(l, data, state);
        add_reduce(state, data, 2, 7);
        return prod;
    }
    function branch_ee47e56ff9bd35e7(l, data, state, prod, puid) {
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        if ((cmpr_set(l, data, 40, 2, 2))) {
            pushFN(data, branch_0e25b8d11d484d7b);
            return branch_894314f7184a8ff8(l, data, state, prod, 4);
        } else if ((cmpr_set(l, data, 42, 2, 2))) {
            pushFN(data, branch_0e25b8d11d484d7b);
            return branch_0bc625d43a900ade(l, data, state, prod, 4);
        }
    }
    function branch_ee77d57dfde7356b(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 15);
        return prod;
    }
    function branch_efb6a2c078cd4f57(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 41);
        return 32;
    }
    function branch_efd6c1c2f8880140(l, data, state, prod, puid) {
        puid |= 2;
        consume(l, data, state);
        add_reduce(state, data, 2, 8);
        return prod;
    }
    function branch_f506b4f233a6c494(l, data, state, prod, puid) {
        pushFN(data, $production_bodies__entries_goto);
        return 26;
    }
    function branch_f58cad6ed426268d(l, data, state, prod, puid) {
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        if ((cmpr_set(l, data, 40, 2, 2))) {
            pushFN(data, branch_0e25b8d11d484d7b);
            return branch_2312ff272abe83c7(l, data, state, prod, 4);
        } else if ((cmpr_set(l, data, 42, 2, 2))) {
            pushFN(data, branch_0e25b8d11d484d7b);
            return branch_df184234645d9254(l, data, state, prod, 4);
        }
    }
    function branch_f71335583ba512d9(l, data, state, prod, puid) {
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 16;
        if ((((l.current_byte == 125) && consume(l, data, state)))) {
            add_reduce(state, data, 5, 45);
            return prod;
        }
    }
    function branch_f9a2946b3f9a2c57(l, data, state, prod, puid) {
        puid |= 8192;
        consume(l, data, state);
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 16384;
        pushFN(data, branch_6bc3f91c2dcbc621);
        pushFN(data, $symbols__terminal_symbol);
        return puid;
    }
    function branch_fd54c7d8333f5b7d(l, data, state, prod, puid) {
        puid |= 2;
        pushFN(data, branch_ee77d57dfde7356b);
        pushFN(data, $functions__referenced_function);
        return puid;
    }
    function branch_fd5e64877e7b610b(l, data, state, prod, puid) {
        puid |= 8192;
        consume(l, data, state);
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 4096;
        if ((((l.current_byte == 41) && consume(l, data, state)))) {
            add_reduce(state, data, 3, 40);
            return prod;
        }
    }
    function branch_fe93755efb2539f6(l, data, state, prod, puid) {
        return 11;
    }
    function branch_fe9cc600f05b68f2(l, data, state, prod, puid) {
        add_reduce(state, data, 1, 3);
        pushFN(data, $symbols__ignore_symbols_goto);
        return 5;
    }
    function branch_ffc507d53125c845(l, data, state, prod, puid) {
        puid |= 1024;
        consume(l, data, state);
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        puid |= 128;
        if ((((cmpr_set(l, data, 32, 2, 2)) && consume(l, data, state)))) {
            skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
            puid |= 64;
            pushFN(data, branch_0eab8e2b65a0c963);
            pushFN(data, $symbols__js_identifier);
            return puid;
        }
    }
    function dt_1dfefb30107f3630(l, data) {
        if ((2 == compare(data, l.byte_offset + 0, 69, 2))) {
            l.setToken(TokenSymbol, 2, 2);
            return true;
        } else if ((3 == compare(data, l.byte_offset + 0, 10, 3))) {
            l.setToken(TokenSymbol, 3, 3);
            return true;
        };
        return false;
    }
    function dt_4636ef6b23fcb656(l, data) {
        if ((2 == compare(data, l.byte_offset + 0, 20, 2))) {
            l.setToken(TokenSymbol, 2, 2);
            return true;
        } else if ((2 == compare(data, l.byte_offset + 0, 71, 2))) {
            l.setToken(TokenSymbol, 2, 2);
            return true;
        };
        return false;
    }
    function dt_921036fe73bf6b58(l, data) {
        if ((3 == compare(data, l.byte_offset + 0, 48, 3))) {
            l.setToken(TokenSymbol, 3, 3);
            return true;
        } else if ((3 == compare(data, l.byte_offset + 0, 79, 3))) {
            l.setToken(TokenSymbol, 3, 3);
            return true;
        };
        return false;
    }
    function dt_c4d86883f3cfa0b1(l, data) {
        if ((3 == compare(data, l.byte_offset + 0, 51, 3))) {
            l.setToken(TokenSymbol, 3, 3);
            return true;
        } else if ((3 == compare(data, l.byte_offset + 0, 81, 3))) {
            l.setToken(TokenSymbol, 3, 3);
            return true;
        };
        return false;
    }
    function dt_fc634e416ff59fd1(l, data) {
        if ((6 == compare(data, l.byte_offset + 0, 4, 6))) {
            l.setToken(TokenSymbol, 6, 6);
            return true;
        } else if ((4 == compare(data, l.byte_offset + 0, 65, 4))) {
            l.setToken(TokenSymbol, 4, 4);
            return true;
        };
        return false;
    }
    function skip_27d8e42c3256622b(l, data, state) {
        if (((state) == NULL_STATE)) return;;
        var off = l.token_offset;
        while (1) {
            if ((!(l.isNL() || l.isSP(true, data)))) {
                break;
            };
            l.next(data);
        };
        if (isOutputEnabled(state)) add_skip(l, data, l.token_offset - off);
    }
    function skip_6725b1140c2474a9(l, data, state) {
        if (((state) == NULL_STATE)) return;;
        var off = l.token_offset;
        while (1) {
            if ((!(l.isNL()))) {
                break;
            };
            l.next(data);
        };
        if (isOutputEnabled(state)) add_skip(l, data, l.token_offset - off);
    }
    function skip_d4bd762c514693b7(l, data, state) {
        if (((state) == NULL_STATE)) return;;
        var off = l.token_offset;
        while (1) {
            if ((!(l.isSP(true, data)))) {
                break;
            };
            l.next(data);
        };
        if (isOutputEnabled(state)) add_skip(l, data, l.token_offset - off);
    }
    function sym_map_09247d97e0941ed1(l, data) {
        if (data.input[l.byte_offset + 0] == 63) {
            if ((data.input[l.byte_offset + 1] == 61)) {
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 103) {
            if ((data.input[l.byte_offset + 1] == 58)) {
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 116) {
            if (data.input[l.byte_offset + 1] == 58) {
                l.setToken(TokenSymbol, 2, 2);
                return 3;
            } else if (data.input[l.byte_offset + 1] == 107) {
                if ((data.input[l.byte_offset + 2] == 58)) {
                    l.setToken(TokenSymbol, 3, 3);
                    return 2;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 92) {
            l.setToken(TokenSymbol, 1, 1);
            return 4;
        } else if (data.input[l.byte_offset + 0] == 40) {
            l.setToken(TokenSymbol, 1, 1);
            return 5;
        } else if (data.input[l.byte_offset + 0] == 95) {
            l.setToken(TokenSymbol, 1, 1);
            return 6;
        } else if (data.input[l.byte_offset + 0] == 36) {
            if (data.input[l.byte_offset + 1] == 101) {
                if ((2 == compare(data, l.byte_offset + 2, 67, 2))) {
                    l.setToken(TokenSymbol, 4, 4);
                    return 7;
                }
            };
            l.setToken(TokenSymbol, 1, 1);
            return 6;
        };
        if ((l.isUniID(data))) {
            return 6;
        } else if ((l.isSym(true, data))) {
            return 8;
        };
        return -1;
    }
    function sym_map_1c05b0750ce90fe2(l, data) {
        if (data.input[l.byte_offset + 0] == 114) {
            if (data.input[l.byte_offset + 1] == 101) {
                if ((4 == compare(data, l.byte_offset + 2, 56, 4))) {
                    l.setToken(TokenSymbol, 6, 6);
                    return 3;
                }
            };
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        } else if (data.input[l.byte_offset + 0] == 99) {
            if (data.input[l.byte_offset + 1] == 115) {
                if ((2 == compare(data, l.byte_offset + 2, 62, 2))) {
                    l.setToken(TokenSymbol, 4, 4);
                    return 2;
                }
            };
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        };
        return -1;
    }
    function sym_map_243df2c5c28b070c(l, data) {
        if (data.input[l.byte_offset + 0] == 102) {
            l.setToken(TokenSymbol, 1, 1);
            return 0;
        };
        return -1;
    }
    function sym_map_31e5d09dd4089237(l, data) {
        if (data.input[l.byte_offset + 0] == 60) {
            if ((data.input[l.byte_offset + 1] == 62)) {
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 43) {
            if ((data.input[l.byte_offset + 1] == 62)) {
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (l.isDiscrete(data, TokenIdentifier, 1)) {
                l.setToken(TokenSymbol, 1, 1);
                return 0;
            }
        } else if (data.input[l.byte_offset + 0] == 35) {
            l.setToken(TokenSymbol, 1, 1);
            return 1;
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 40) {
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 91) {
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 36) {
            if (data.input[l.byte_offset + 1] == 101) {
                if (data.input[l.byte_offset + 2] == 111) {
                    if ((data.input[l.byte_offset + 3] == 102)) {
                        l.setToken(TokenSymbol, 4, 4);
                        return 1;
                    }
                } else if (data.input[l.byte_offset + 2] == 109) {
                    if ((3 == compare(data, l.byte_offset + 3, 7, 3))) {
                        l.setToken(TokenSymbol, 6, 6);
                        return 1;
                    }
                }
            };
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 63) {
            if ((data.input[l.byte_offset + 1] == 61)) {
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 103) {
            if ((data.input[l.byte_offset + 1] == 58)) {
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 116) {
            if (data.input[l.byte_offset + 1] == 58) {
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            } else if (data.input[l.byte_offset + 1] == 107) {
                if ((data.input[l.byte_offset + 2] == 58)) {
                    l.setToken(TokenSymbol, 3, 3);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 92) {
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 95) {
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        };
        if ((l.isSym(true, data))) {
            return 1;
        } else if ((l.isUniID(data))) {
            return 1;
        };
        return -1;
    }
    function sym_map_331365130e60e794(l, data) {
        if (data.input[l.byte_offset + 0] == 40) {
            if (data.input[l.byte_offset + 1] == 43) {
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            } else if (data.input[l.byte_offset + 1] == 42) {
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            };
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 63) {
            if (data.input[l.byte_offset + 1] == 61) {
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            };
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 41) {
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 103) {
            if ((data.input[l.byte_offset + 1] == 58)) {
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 116) {
            if (data.input[l.byte_offset + 1] == 58) {
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            } else if (data.input[l.byte_offset + 1] == 107) {
                if ((data.input[l.byte_offset + 2] == 58)) {
                    l.setToken(TokenSymbol, 3, 3);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 92) {
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 36) {
            if (data.input[l.byte_offset + 1] == 101) {
                if ((2 == compare(data, l.byte_offset + 2, 67, 2))) {
                    l.setToken(TokenSymbol, 4, 4);
                    return 1;
                }
            };
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 95) {
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 91) {
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (l.isDiscrete(data, TokenIdentifier, 1)) {
                l.setToken(TokenSymbol, 1, 1);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 124) {
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 35) {
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 60) {
            if ((data.input[l.byte_offset + 1] == 62)) {
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 43) {
            if ((data.input[l.byte_offset + 1] == 62)) {
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 93) {
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        };
        if ((l.isSym(true, data))) {
            return 1;
        } else if ((l.isUniID(data))) {
            return 1;
        } else if ((l.END(data))) {
            return 1;
        };
        return 1;
    }
    function sym_map_542573164c419a99(l, data) {
        if (data.input[l.byte_offset + 0] == 36) {
            if ((3 == compare(data, l.byte_offset + 1, 66, 3))) {
                l.setToken(TokenSymbol, 4, 4);
                return 3;
            }
        } else if (data.input[l.byte_offset + 0] == 103) {
            if ((data.input[l.byte_offset + 1] == 58)) {
                l.setToken(TokenSymbol, 2, 2);
                return 4;
            }
        } else if (data.input[l.byte_offset + 0] == 116) {
            if ((data.input[l.byte_offset + 1] == 58)) {
                l.setToken(TokenSymbol, 2, 2);
                return 5;
            }
        } else if (data.input[l.byte_offset + 0] == 92) {
            l.setToken(TokenSymbol, 1, 1);
            return 6;
        };
        if ((l.isUniID(data))) {
            return 0;
        } else if ((l.isNum(data))) {
            return 1;
        } else if ((l.isSP(true, data))) {
            return 2;
        } else if ((l.isSym(true, data))) {
            return 7;
        };
        return -1;
    }
    function sym_map_a29bd6613299782a(l, data) {
        if (data.input[l.byte_offset + 0] == 69) {
            if (data.input[l.byte_offset + 1] == 88) {
                if ((data.input[l.byte_offset + 2] == 67)) {
                    l.setToken(TokenSymbol, 3, 3);
                    return 0;
                }
            } else if (data.input[l.byte_offset + 1] == 82) {
                if ((data.input[l.byte_offset + 2] == 82)) {
                    l.setToken(TokenSymbol, 3, 3);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 73) {
            if ((2 == compare(data, l.byte_offset + 1, 35, 2))) {
                l.setToken(TokenSymbol, 3, 3);
                return 2;
            }
        } else if (data.input[l.byte_offset + 0] == 82) {
            if (data.input[l.byte_offset + 1] == 83) {
                if ((data.input[l.byte_offset + 2] == 84)) {
                    l.setToken(TokenSymbol, 3, 3);
                    return 3;
                }
            } else if (data.input[l.byte_offset + 1] == 69) {
                if ((data.input[l.byte_offset + 2] == 68)) {
                    l.setToken(TokenSymbol, 3, 3);
                    return 4;
                }
            }
        };
        return -1;
    }
    function sym_map_b427593efc6624ec(l, data) {
        if (data.input[l.byte_offset + 0] == 125) {
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 123) {
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 36) {
            if (data.input[l.byte_offset + 1] == 101) {
                if ((2 == compare(data, l.byte_offset + 2, 67, 2))) {
                    l.setToken(TokenSymbol, 4, 4);
                    return 1;
                }
            };
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 103) {
            if ((data.input[l.byte_offset + 1] == 58)) {
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 116) {
            if (data.input[l.byte_offset + 1] == 58) {
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            } else if (data.input[l.byte_offset + 1] == 107) {
                if ((data.input[l.byte_offset + 2] == 58)) {
                    l.setToken(TokenSymbol, 3, 3);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 92) {
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 41) {
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 63) {
            if (data.input[l.byte_offset + 1] == 61) {
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            };
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 40) {
            if (data.input[l.byte_offset + 1] == 42) {
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            } else if (data.input[l.byte_offset + 1] == 43) {
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            };
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 93) {
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 95) {
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 91) {
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (l.isDiscrete(data, TokenIdentifier, 1)) {
                l.setToken(TokenSymbol, 1, 1);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 124) {
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 35) {
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 60) {
            if ((data.input[l.byte_offset + 1] == 62)) {
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 43) {
            if ((data.input[l.byte_offset + 1] == 62)) {
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        };
        if ((l.isUniID(data))) {
            return 1;
        } else if ((l.isNum(data))) {
            return 1;
        } else if ((l.isSym(true, data))) {
            return 1;
        } else if ((l.isNL())) {
            return 1;
        } else if ((l.isSP(true, data))) {
            return 1;
        } else if ((l.END(data))) {
            return 1;
        };
        return 1;
    }
    function sym_map_bba38ae7f7052d4b(l, data) {
        if (data.input[l.byte_offset + 0] == 103) {
            if ((data.input[l.byte_offset + 1] == 58)) {
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 116) {
            if (data.input[l.byte_offset + 1] == 58) {
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            } else if (data.input[l.byte_offset + 1] == 107) {
                if ((data.input[l.byte_offset + 2] == 58)) {
                    l.setToken(TokenSymbol, 3, 3);
                    return 1;
                }
            }
        } else if (data.input[l.byte_offset + 0] == 92) {
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 41) {
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 40) {
            if (data.input[l.byte_offset + 1] == 43) {
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            } else if (data.input[l.byte_offset + 1] == 42) {
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            };
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 63) {
            if (data.input[l.byte_offset + 1] == 61) {
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            };
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 36) {
            if (data.input[l.byte_offset + 1] == 101) {
                if ((2 == compare(data, l.byte_offset + 2, 67, 2))) {
                    l.setToken(TokenSymbol, 4, 4);
                    return 1;
                }
            };
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 95) {
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 91) {
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 102) {
            if (l.isDiscrete(data, TokenIdentifier, 1)) {
                l.setToken(TokenSymbol, 1, 1);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 124) {
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 35) {
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 60) {
            if ((data.input[l.byte_offset + 1] == 62)) {
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 43) {
            if ((data.input[l.byte_offset + 1] == 62)) {
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if (data.input[l.byte_offset + 0] == 93) {
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 125) {
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        } else if (data.input[l.byte_offset + 0] == 123) {
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        };
        if ((l.isSym(true, data))) {
            return 1;
        } else if ((l.isUniID(data))) {
            return 1;
        } else if ((l.isNum(data))) {
            return 1;
        } else if ((l.isNL())) {
            return 1;
        } else if ((l.isSP(true, data))) {
            return 1;
        } else if ((l.END(data))) {
            return 1;
        };
        return 1;
    }
    function tk_5600d875a17e7855(l, data) {
        if (l.current_byte == 95 || l.current_byte == 36 || l.isUniID(data)) {
            var stack_ptr = data.stack_ptr;
            var input_ptr = data.input_ptr;
            var state = data.state;
            var copy = l.copy();
            pushFN(data, $default_productions__js_id_symbols);
            data.state = NULL_STATE;
            var ACTIVE = true;
            while ((ACTIVE)) {
                ACTIVE = stepKernel(data, stack_ptr + 1);
            };
            data.state = state;
            if (data.prod == 10) {
                data.stack_ptr = stack_ptr;
                data.input_ptr = input_ptr;
                l.slice(copy);
                return true;
            } else {
                l.sync(copy);
                data.stack_ptr = stack_ptr;
                data.input_ptr = input_ptr;
                return false;
            }
        };
        return false;
    }
    function $hydrocarbon(l, data, state, prod, puid) {
        puid |= 1;
        pushFN(data, branch_057a75aa199702ae);
        pushFN(data, $head);
        return puid;
        return -1;
    }
    function $hydrocarbon_reducer(l, data, state, prod, puid) {
        return 0;

    }
    function $head(l, data, state, prod, puid) {
        if ((l.current_byte == 64 || l.current_byte == 35)) {
            pushFN(data, branch_81685e7b6a8a4573);
            return branch_3ae48ae85badf17d(l, data, state, prod, 1);
        } else if ((cmpr_set(l, data, 15, 2, 2) || cmpr_set(l, data, 17, 2, 2) || l.current_byte == 102)) {
            pushFN(data, branch_81685e7b6a8a4573);
            return branch_7af4ffd47fc8ee8f(l, data, state, prod, 2);
        };
        return -1;
    }
    function $head_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            add_reduce(state, data, 2, 1);
        } else if (2 == puid) {
            add_reduce(state, data, 1, 2);
        };
        return 1;

    }
    function $preambles__preamble(l, data, state, prod, puid) {
        puid |= 1;
        pushFN(data, branch_156d6b74cee8e2c1);
        pushFN(data, $preambles__preamble_clause);
        return puid;
        return -1;
    }
    function $preambles__preamble_goto(l, data, state, prod, puid) {
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        if ((l.current_byte == 64 || l.current_byte == 35)) {
            pushFN(data, branch_b6e6be42df627e76);
            return branch_1ab2b70946de8d86(l, data, state, prod, 2);
        };
        return (prod == 2) ? prod : 1;
    }
    function $preambles__preamble_reducer(l, data, state, prod, puid) {
        if (1 == puid) {
            add_reduce(state, data, 1, 3);
        } else if (3 == puid) {
            add_reduce(state, data, 2, 4);
        };
        return 2;

    }
    function $preambles__preamble_clause(l, data, state, prod, puid) {
        if ((l.current_byte == 64)) {
            var pk = l.copy();
            skip_27d8e42c3256622b(pk.next(data), data, STATE_ALLOW_SKIP);
            if ((cmpr_set(pk, data, 34, 6, 6))) {
                pushFN(data, branch_096c2a72305a0df6);
                return branch_8555a06bd8da8654(l, data, state, prod, 1);
            } else if ((cmpr_set(pk, data, 73, 6, 6))) {
                pushFN(data, branch_096c2a72305a0df6);
                return branch_e32e3d437aacc083(l, data, state, prod, 2);
            }
        } else if ((l.current_byte == 35)) {
            pushFN(data, branch_096c2a72305a0df6);
            return branch_52a1b98e3a899f95(l, data, state, prod, 4);
        };
        return -1;
    }
    function $preambles__preamble_clause_reducer(l, data, state, prod, puid) {
        return 3;

    }
    function $preambles__ignore_preamble(l, data, state, prod, puid) {
        if ((l.current_byte == 64)) {
            consume(l, data, state);
            puid |= 1;
            skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
            puid |= 2;
            if ((((cmpr_set(l, data, 34, 6, 6)) && consume(l, data, state)))) {
                skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
                puid |= 4;
                pushFN(data, branch_d0238310ec87f2e9);
                pushFN(data, $symbols__ignore_symbols);
                return puid;
            }
        };
        return -1;
    }
    function $preambles__ignore_preamble_reducer(l, data, state, prod, puid) {
        if (15 == puid) {
            add_reduce(state, data, 4, 5);
        };
        return 4;

    }
    function $symbols__ignore_symbols(l, data, state, prod, puid) {
        puid |= 1;
        pushFN(data, branch_fe9cc600f05b68f2);
        pushFN(data, $symbols__ignore_symbol);
        return puid;
        return -1;
    }
    function $symbols__ignore_symbols_goto(l, data, state, prod, puid) {
        skip_d4bd762c514693b7(l/*[ ws ]*/, data, state);
        if ((l.isNL())) return 5;;
        if ((cmpr_set(l, data, 1, 2, 2) || dt_1dfefb30107f3630(l, data) || l.current_byte == 92)) {
            pushFN(data, branch_7361681ac09951c6);
            return branch_2ebfe580b98a9a7f(l, data, state, prod, 2);
        };
        return (prod == 5) ? prod : 1;
    }
    function $symbols__ignore_symbols_reducer(l, data, state, prod, puid) {
        if (1 == puid) {
            add_reduce(state, data, 1, 3);
        } else if (3 == puid) {
            add_reduce(state, data, 2, 4);
        };
        return 5;

    }
    function $symbols__ignore_symbol(l, data, state, prod, puid) {
        if ((cmpr_set(l, data, 1, 2, 2))) {
            pushFN(data, branch_3824178b99f2c682);
            return branch_0f284a6c127abef4(l, data, state, prod, 1);
        } else if ((cmpr_set(l, data, 69, 2, 2))) {
            pushFN(data, branch_3824178b99f2c682);
            return branch_c65131567c09d34c(l, data, state, prod, 2);
        } else if ((l.current_byte == 92)) {
            pushFN(data, branch_3824178b99f2c682);
            return branch_e0964953d1827b08(l, data, state, prod, 4);
        } else if ((cmpr_set(l, data, 10, 3, 3))) {
            pushFN(data, branch_3824178b99f2c682);
            return branch_1c01020cda388d60(l, data, state, prod, 8);
        };
        return -1;
    }
    function $symbols__ignore_symbol_reducer(l, data, state, prod, puid) {
        return 6;

    }
    function $symbols__generated_symbol(l, data, state, prod, puid) {
        if ((cmpr_set(l, data, 1, 2, 2))) {
            consume(l, data, state);
            puid |= 1;
            skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
            puid |= 2;
            pushFN(data, branch_5647ba8923cc55dc);
            pushFN(data, $symbols__identifier);
            return puid;
        };
        return -1;
    }
    function $symbols__generated_symbol_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            add_reduce(state, data, 2, 6);
        };
        return 7;

    }
    function $symbols__identifier(l, data, state, prod, puid) {
        puid |= 1;
        pushFN(data, branch_8d512b13ebd01d1b);
        pushFN(data, $default_productions__js_identifier);
        return puid;
        return -1;
    }
    function $symbols__identifier_reducer(l, data, state, prod, puid) {
        return 8;

    }
    function $default_productions__js_identifier(l, data, state, prod, puid) {
        if ((tk_5600d875a17e7855(l, data))) {
            consume(l, data, state);
            puid |= 1;
            return 9;
        };
        return -1;
    }
    function $default_productions__js_identifier_reducer(l, data, state, prod, puid) {
        return 9;

    }
    function $default_productions__js_id_symbols(l, data, state, prod, puid) {
        if ((l.isUniID(data))) {
            pushFN(data, branch_59f20d9b567de150);
            return branch_b43d464283be97f2(l, data, state, prod, 2);
        } else if ((l.current_byte == 95)) {
            pushFN(data, branch_59f20d9b567de150);
            return branch_97d546b3446dcbb8(l, data, state, prod, 4);
        } else if ((l.current_byte == 36)) {
            pushFN(data, branch_59f20d9b567de150);
            return branch_90fc2b73b49088ce(l, data, state, prod, 8);
        };
        return -1;
    }
    function $default_productions__js_id_symbols_goto(l, data, state, prod, puid) {
        while (1) {
            switch (prod) {
                case 10:
                    {
                        if ((l.isNL() || l.isSP(true, data))) return 10;;
                        if ((l.isUniID(data))) {
                            pushFN(data, branch_0476eb443b0be28f);
                            return branch_a25b83c36b7add7b(l, data, state, prod, 1);
                        } else if ((l.isNum(data))) {
                            pushFN(data, branch_0476eb443b0be28f);
                            return branch_a22590ec25240743(l, data, state, prod, 1);
                        } else if ((l.current_byte == 95)) {
                            pushFN(data, branch_0476eb443b0be28f);
                            return branch_b4be9c594153d66a(l, data, state, prod, 1);
                        } else if ((l.current_byte == 36)) {
                            pushFN(data, branch_0476eb443b0be28f);
                            return branch_edc46cfe2f2f664d(l, data, state, prod, 1);
                        }
                    }
            };
            break;
        };
        return (prod == 10) ? prod : 1;
    }
    function $default_productions__js_id_symbols_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            add_reduce(state, data, 2, 7);
        } else if (5 == puid) {
            add_reduce(state, data, 2, 7);
        } else if (9 == puid) {
            add_reduce(state, data, 2, 7);
        } else if (17 == puid) {
            add_reduce(state, data, 2, 7);
        };
        return 10;

    }
    function $symbols__literal_symbol(l, data, state, prod, puid) {
        if ((cmpr_set(l, data, 69, 2, 2))) {
            consume(l, data, state);
            puid |= 1;
            skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
            if ((l.isNum(data))) {
                var pk = l.copy();
                pk.next(data);
                if ((pk.isNL() || pk.isSP(true, data))) {
                    consume(l, data, state);
                    puid |= 2;
                    '"-"';
                    if ((l.isNL() || l.isSP(true, data))) {
                        var pk = l.copy();
                        pk.next(data);
                        if ((cmpr_set(pk, data, 65, 4, 4) || cmpr_set(pk, data, 1, 2, 2) || dt_1dfefb30107f3630(pk, data) || dt_4636ef6b23fcb656(pk, data) || cmpr_set(pk, data, 25, 2, 2) || cmpr_set(pk, data, 15, 2, 2) || cmpr_set(pk, data, 17, 2, 2) || assert_ascii(pk, 0x0, 0x80000318, 0xb8000000, 0x38000040) || pk.isUniID(data) || pk.isNL() || pk.isNum(data) || pk.isSym(true, data) || pk.isSP(true, data))) {
                            pushFN(data, branch_fe93755efb2539f6);
                            return branch_b97f98668aa5b639(l, data, state, prod, 2);
                        }
                    } else if ((l.END(data))) {
                        pushFN(data, branch_fe93755efb2539f6);
                        return branch_b97f98668aa5b639(l, data, state, prod, 2);
                    } else if ((sym_map_b427593efc6624ec(l, data) == 1)) {
                        add_reduce(state, data, 2, 8);
                        return 11;
                    }
                } else if ((pk.END(data))) {
                    pushFN(data, branch_fe93755efb2539f6);
                    return branch_2e85125c6400c808(l, data, state, prod, 1);
                } else if ((cmpr_set(pk, data, 65, 4, 4) || cmpr_set(pk, data, 1, 2, 2) || dt_1dfefb30107f3630(pk, data) || dt_4636ef6b23fcb656(pk, data) || cmpr_set(pk, data, 25, 2, 2) || cmpr_set(pk, data, 15, 2, 2) || cmpr_set(pk, data, 17, 2, 2) || assert_ascii(pk, 0x0, 0x80000318, 0xb8000000, 0x38000040) || pk.isUniID(data) || pk.isNum(data) || pk.isSym(true, data))) {
                    pushFN(data, branch_fe93755efb2539f6);
                    return branch_efd6c1c2f8880140(l, data, state, prod, 1);
                }
            } else if ((l.current_byte == 95 || l.current_byte == 36 || l.isUniID(data))) {
                skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
                pushFN(data, branch_2117e6b923c2d45a);
                pushFN(data, $symbols__identifier);
                puid |= 8;
                return puid;
            }
        };
        return -1;
    }
    function $symbols__literal_symbol_reducer(l, data, state, prod, puid) {
        if (7 == puid) {
            add_reduce(state, data, 3, 8);
        } else if (13 == puid) {
            add_reduce(state, data, 3, 8);
        } else if (3 == puid) {
            add_reduce(state, data, 2, 8);
        } else if (9 == puid) {
            add_reduce(state, data, 2, 8);
        };
        return 11;

    }
    function $symbols__sym_delimiter(l, data, state, prod, puid) {
        if ((l.isSP(true, data))) {
            pushFN(data, branch_44232392d8af3f34);
            return branch_d23835acb03488f1(l, data, state, prod, 1);
        } else if ((l.END(data))) {
            pushFN(data, branch_44232392d8af3f34);
            return branch_b43d464283be97f2(l, data, state, prod, 2);
        } else if ((l.isNL())) {
            pushFN(data, branch_44232392d8af3f34);
            return branch_97d546b3446dcbb8(l, data, state, prod, 4);
        };
        return -1;
    }
    function $symbols__sym_delimiter_reducer(l, data, state, prod, puid) {
        return 12;

    }
    function $symbols__escaped_symbol(l, data, state, prod, puid) {
        if ((l.current_byte == 92)) {
            consume(l, data, state);
            puid |= 1;
            skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
            puid |= 2;
            pushFN(data, branch_dfc39e036a46551d);
            pushFN(data, $symbols__escaped_symbol_list_48);
            return puid;
        };
        return -1;
    }
    function $symbols__escaped_symbol_reducer(l, data, state, prod, puid) {
        if (7 == puid) {
            add_reduce(state, data, 3, 9);
        };
        return 13;

    }
    function $symbols__production_token_symbol(l, data, state, prod, puid) {
        if ((cmpr_set(l, data, 10, 3, 3))) {
            consume(l, data, state);
            puid |= 1;
            skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
            puid |= 2;
            pushFN(data, branch_c2643f1ab5de2b75);
            pushFN(data, $symbols__identifier);
            return puid;
        };
        return -1;
    }
    function $symbols__production_token_symbol_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            add_reduce(state, data, 2, 10);
        };
        return 14;

    }
    function $preambles__import_preamble(l, data, state, prod, puid) {
        if ((l.current_byte == 64)) {
            consume(l, data, state);
            puid |= 1;
            skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
            if ((cmpr_set(l, data, 73, 6, 6))) {
                consume(l, data, state);
                puid |= 2;
                skip_6725b1140c2474a9(l/*[ nl ]*/, data, state);
                if ((l.isSP(true, data))) {
                    skip_6725b1140c2474a9(l/*[ nl ]*/, data, state);
                    pushFN(data, branch_b7c349247d69ad93);
                    pushFN(data, $preambles__import_preamble_list_54);
                    puid |= 4;
                    return puid;
                } else if ((l.isUniID(data) || l.isSym(true, data))) {
                    skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
                    pushFN(data, branch_14dddc39c731a844);
                    pushFN(data, $preambles__import_preamble_list_55);
                    puid |= 8;
                    return puid;
                }
            }
        };
        return -1;
    }
    function $preambles__import_preamble_reducer(l, data, state, prod, puid) {
        if (127 == puid) {
            add_reduce(state, data, 8, 11);
        } else if (239 == puid) {
            add_reduce(state, data, 8, 11);
        } else if (127 == puid) {
            add_reduce(state, data, 7, 12);
        } else if (239 == puid) {
            add_reduce(state, data, 7, 12);
        };
        return 15;

    }
    function $comments__comment(l, data, state, prod, puid) {
        puid |= 1;
        pushFN(data, branch_6a363a77a5d6873d);
        pushFN(data, $comments__cm);
        return puid;
        return -1;
    }
    function $comments__comment_reducer(l, data, state, prod, puid) {
        return 16;

    }
    function $comments__cm(l, data, state, prod, puid) {
        if ((l.current_byte == 35)) {
            consume(l, data, state);
            puid |= 1;
            skip_6725b1140c2474a9(l/*[ nl ]*/, data, state);
            puid |= 2;
            pushFN(data, branch_4d4281980be003fa);
            pushFN(data, $comments__cm_list_71);
            return puid;
        };
        return -1;
    }
    function $comments__cm_reducer(l, data, state, prod, puid) {
        if (7 == puid) {
            add_reduce(state, data, 3, 13);
        };
        return 17;

    }
    function $comments__comment_primitive(l, data, state, prod, puid) {
        if ((l.isSym(true, data))) {
            pushFN(data, branch_4737a8dafefb83c5);
            return branch_d23835acb03488f1(l, data, state, prod, 1);
        } else if ((l.isUniID(data))) {
            pushFN(data, branch_4737a8dafefb83c5);
            return branch_b43d464283be97f2(l, data, state, prod, 2);
        } else if ((l.isNum(data))) {
            pushFN(data, branch_4737a8dafefb83c5);
            return branch_97d546b3446dcbb8(l, data, state, prod, 4);
        } else if ((l.isSP(true, data))) {
            pushFN(data, branch_4737a8dafefb83c5);
            return branch_90fc2b73b49088ce(l, data, state, prod, 8);
        };
        return -1;
    }
    function $comments__comment_primitive_reducer(l, data, state, prod, puid) {
        return 18;

    }
    function $comments__comment_delimiter(l, data, state, prod, puid) {
        if ((l.isNL())) {
            consume(l, data, state);
            puid |= 1;
            return 19;
        };
        return -1;
    }
    function $comments__comment_delimiter_reducer(l, data, state, prod, puid) {
        return 19;

    }
    function $productions__productions(l, data, state, prod, puid) {
        if ((cmpr_set(l, data, 15, 2, 2) || cmpr_set(l, data, 17, 2, 2))) {
            pushFN(data, branch_60683dc2cc08007c);
            return branch_4a62559de26784e8(l, data, state, prod, 1);
        } else if ((l.current_byte == 102)) {
            pushFN(data, branch_60683dc2cc08007c);
            return branch_fd54c7d8333f5b7d(l, data, state, prod, 2);
        };
        return -1;
    }
    function $productions__productions_goto(l, data, state, prod, puid) {
        while (1) {
            switch (prod) {
                case 20:
                    {
                        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
                        if ((l.current_byte == 35)) {
                            pushFN(data, branch_468cf5dac8194177);
                            return branch_2dcd0f298868c53c(l, data, state, prod, 4);
                        } else if ((cmpr_set(l, data, 15, 2, 2) || cmpr_set(l, data, 17, 2, 2))) {
                            pushFN(data, branch_468cf5dac8194177);
                            return branch_86f6998dc1615c33(l, data, state, prod, 4);
                        } else if ((l.current_byte == 102)) {
                            pushFN(data, branch_468cf5dac8194177);
                            return branch_d1cc9a46ed534a71(l, data, state, prod, 4);
                        }
                    }
            };
            break;
        };
        return (prod == 20) ? prod : 1;
    }
    function $productions__productions_reducer(l, data, state, prod, puid) {
        if (1 == puid) {
            add_reduce(state, data, 1, 14);
        } else if (2 == puid) {
            add_reduce(state, data, 1, 15);
        } else if (5 == puid) {
            add_reduce(state, data, 2, 16);
        } else if (12 == puid) {
            add_reduce(state, data, 2, 17);
        } else if (6 == puid) {
            add_reduce(state, data, 2, 18);
        };
        return 20;

    }
    function $productions__production(l, data, state, prod, puid) {
        if ((cmpr_set(l, data, 15, 2, 2))) {
            consume(l, data, state);
            puid |= 1;
            '"-"';
            skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
            pushFN(data, branch_23667e56244f0c77);
            pushFN(data, $productions__production_group_1_0_);
            puid |= 2;
            return puid;
        } else if ((cmpr_set(l, data, 17, 2, 2))) {
            pushFN(data, branch_dd4e42a28025d3b8);
            return branch_e0ef2296bb74d893(l, data, state, prod, 16);
        };
        return -1;
    }
    function $productions__production_reducer(l, data, state, prod, puid) {
        if (15 == puid) {
            add_reduce(state, data, 4, 19);
        } else if (30 == puid) {
            add_reduce(state, data, 4, 20);
        } else if (7 == puid) {
            add_reduce(state, data, 3, 21);
        };
        return 21;

    }
    function $symbols__production_id(l, data, state, prod, puid) {
        puid |= 1;
        pushFN(data, branch_c5173a6558ea6023);
        pushFN(data, $symbols__identifier);
        return puid;
        return -1;
    }
    function $symbols__production_id_reducer(l, data, state, prod, puid) {
        return 22;

    }
    function $productions__production_start_symbol(l, data, state, prod, puid) {
        if ((l.current_byte == 62)) {
            consume(l, data, state);
            puid |= 1;
            return 23;
        };
        return -1;
    }
    function $productions__production_start_symbol_reducer(l, data, state, prod, puid) {
        return 23;

    }
    function $production_bodies__production_bodies(l, data, state, prod, puid) {
        if ((l.current_byte == 35)) {
            pushFN(data, branch_d0c988690b51e659);
            return branch_66dcc36dff0ab254(l, data, state, prod, 1);
        } else if ((dt_fc634e416ff59fd1(l, data) || cmpr_set(l, data, 25, 2, 2) || cmpr_set(l, data, 1, 2, 2) || dt_1dfefb30107f3630(l, data) || assert_ascii(l, 0x0, 0x110, 0x98000000, 0x0) || l.isUniID(data) || l.isSym(true, data))) {
            pushFN(data, branch_d0c988690b51e659);
            return branch_adc19d145f82bf5a(l, data, state, prod, 8);
        };
        return -1;
    }
    function $production_bodies__production_bodies_goto(l, data, state, prod, puid) {
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        if ((l.current_byte == 124)) {
            var pk = l.copy();
            skip_27d8e42c3256622b(pk.next(data), data, STATE_ALLOW_SKIP);
            if ((pk.current_byte == 35)) {
                pushFN(data, branch_b572c2e06337878e);
                return branch_6f2875ea620ed3e2(l, data, state, prod, 2);
            } else if ((dt_fc634e416ff59fd1(pk, data) || cmpr_set(pk, data, 25, 2, 2) || cmpr_set(pk, data, 1, 2, 2) || dt_1dfefb30107f3630(pk, data) || assert_ascii(pk, 0x0, 0x110, 0x98000000, 0x0) || pk.isUniID(data) || pk.isSym(true, data))) {
                pushFN(data, branch_b572c2e06337878e);
                return branch_0433f9ca88ab0c07(l, data, state, prod, 2);
            }
        };
        return (prod == 24) ? prod : 1;
    }
    function $production_bodies__production_bodies_reducer(l, data, state, prod, puid) {
        if (1 == puid) {
            add_reduce(state, data, 1, 3);
        } else if (7 == puid) {
            add_reduce(state, data, 3, 22);
        } else if (8 == puid) {
            add_reduce(state, data, 1, 3);
        } else if (14 == puid) {
            add_reduce(state, data, 3, 22);
        };
        return 24;

    }
    function $production_bodies__production_body(l, data, state, prod, puid) {
        if ((l.current_byte == 40)) {
            var pk = l.copy();
            skip_27d8e42c3256622b(pk.next(data), data, STATE_ALLOW_SKIP);
            if ((cmpr_set(pk, data, 44, 4, 4))) {
                consume(l, data, state);
                puid |= 1;
                '"-"';
                skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
                if ((cmpr_set(l, data, 44, 4, 4))) {
                    consume(l, data, state);
                    puid |= 2;
                    skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
                    if ((l.current_byte == 41)) {
                        consume(l, data, state);
                        puid |= 4;
                        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
                        pushFN(data, branch_78ce8ea802abedaf);
                        pushFN(data, $production_bodies__entries);
                        puid |= 8;
                        return puid;
                    }
                }
            } else if ((dt_921036fe73bf6b58(pk, data) || cmpr_set(pk, data, 34, 3, 3) || dt_c4d86883f3cfa0b1(pk, data) || dt_fc634e416ff59fd1(pk, data) || cmpr_set(pk, data, 25, 2, 2) || cmpr_set(pk, data, 1, 2, 2) || dt_1dfefb30107f3630(pk, data) || assert_ascii(pk, 0x0, 0x118, 0x98000000, 0x0) || pk.isUniID(data) || pk.isSym(true, data))) {
                skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
                pushFN(data, branch_ce15cdf7daff286b);
                pushFN(data, $production_bodies__entries);
                puid |= 8;
                return puid;
            }
        } else if ((dt_fc634e416ff59fd1(l, data) || cmpr_set(l, data, 25, 2, 2) || cmpr_set(l, data, 1, 2, 2) || dt_1dfefb30107f3630(l, data) || assert_ascii(l, 0x0, 0x10, 0x98000000, 0x0) || l.isUniID(data) || l.isSym(true, data))) {
            skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
            pushFN(data, branch_ce15cdf7daff286b);
            pushFN(data, $production_bodies__entries);
            puid |= 8;
            return puid;
        };
        return -1;
    }
    function $production_bodies__production_body_reducer(l, data, state, prod, puid) {
        if (31 == puid) {
            add_reduce(state, data, 5, 23);
        } else if (24 == puid) {
            add_reduce(state, data, 2, 24);
        } else if (15 == puid) {
            add_reduce(state, data, 4, 25);
        } else if (8 == puid) {
            add_reduce(state, data, 1, 26);
        };
        return 25;

    }
    function $production_bodies__entries(l, data, state, prod, puid) {
        if ((cmpr_set(l, data, 4, 6, 6))) {
            pushFN(data, branch_f506b4f233a6c494);
            return branch_be050e18b1dae7da(l, data, state, prod, 4);
        } else if ((cmpr_set(l, data, 25, 2, 2) || cmpr_set(l, data, 1, 2, 2) || dt_1dfefb30107f3630(l, data) || cmpr_set(l, data, 65, 4, 4) || assert_ascii(l, 0x0, 0x110, 0x98000000, 0x0) || l.isUniID(data) || l.isSym(true, data))) {
            pushFN(data, branch_f506b4f233a6c494);
            return branch_cf750a8edfb59b02(l, data, state, prod, 2);
        };
        return -1;
    }
    function $production_bodies__entries_goto(l, data, state, prod, puid) {
        while (1) {
            switch (prod) {
                case 26:
                    {
                        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
                        if ((cmpr_set(l, data, 15, 2, 2) || cmpr_set(l, data, 17, 2, 2) || assert_ascii(l, 0x0, 0x208, 0x0, 0x10000040))) return 26;;
                        if ((cmpr_set(l, data, 25, 2, 2) || cmpr_set(l, data, 1, 2, 2) || dt_1dfefb30107f3630(l, data) || cmpr_set(l, data, 65, 4, 4) || assert_ascii(l, 0x0, 0x110, 0x98000000, 0x0) || l.isUniID(data) || l.isSym(true, data))) {
                            pushFN(data, branch_2aaa74d306d3315e);
                            return branch_90aaa2333d90b1d7(l, data, state, prod, 1);
                        }
                    }
            };
            break;
        };
        return (prod == 26) ? prod : 1;
    }
    function $production_bodies__entries_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            add_reduce(state, data, 2, 27);
        } else if (2 == puid) {
            add_reduce(state, data, 1, 17);
        } else if (4 == puid) {
            add_reduce(state, data, 1, 28);
        };
        return 26;

    }
    function $production_bodies__body_entry(l, data, state, prod, puid) {
        if ((l.current_byte == 40)) {
            var pk = l.copy();
            skip_27d8e42c3256622b(pk.next(data), data, STATE_ALLOW_SKIP);
            if ((dt_921036fe73bf6b58(pk, data) || cmpr_set(pk, data, 34, 3, 3) || dt_c4d86883f3cfa0b1(pk, data))) {
                pushFN(data, branch_b0dd4b0a54d162b6);
                return branch_826b87b9be26d3a9(l, data, state, prod, 1);
            } else if ((dt_fc634e416ff59fd1(pk, data) || cmpr_set(pk, data, 25, 2, 2) || cmpr_set(pk, data, 1, 2, 2) || dt_1dfefb30107f3630(pk, data) || assert_ascii(pk, 0x0, 0x118, 0x98000000, 0x0) || pk.isUniID(data) || pk.isSym(true, data))) {
                pushFN(data, branch_b0dd4b0a54d162b6);
                return branch_6b2e343eacea4736(l, data, state, prod, 2);
            }
        } else if ((l.current_byte == 91)) {
            pushFN(data, branch_b0dd4b0a54d162b6);
            return branch_3a1cbc949fc8b95d(l, data, state, prod, 4);
        } else if ((cmpr_set(l, data, 25, 2, 2) || cmpr_set(l, data, 1, 2, 2) || dt_1dfefb30107f3630(l, data) || cmpr_set(l, data, 65, 4, 4) || assert_ascii(l, 0x0, 0x10, 0x90000000, 0x0) || l.isUniID(data) || l.isSym(true, data))) {
            pushFN(data, branch_b0dd4b0a54d162b6);
            return branch_6b2e343eacea4736(l, data, state, prod, 2);
        };
        return -1;
    }
    function $production_bodies__body_entry_reducer(l, data, state, prod, puid) {
        if (1 == puid) {
            add_reduce(state, data, 1, 3);
        } else if (2 == puid) {
            add_reduce(state, data, 1, 3);
        } else if (28 == puid) {
            add_reduce(state, data, 3, 29);
        };
        return 27;

    }
    function $production_bodies__condition_clause(l, data, state, prod, puid) {
        if ((l.current_byte == 40)) {
            consume(l, data, state);
            puid |= 1;
            skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
            switch (sym_map_a29bd6613299782a(l, data)) {
                case 0:
                    {
                        puid |= 2;
                        consume(l, data, state);
                        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
                        puid |= 4;
                        pushFN(data, branch_8a065385b774962e);
                        pushFN(data, $symbols__condition_symbol_list);
                        return puid;
                    }
                case 1:
                    {
                        puid |= 16;
                        consume(l, data, state);
                        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
                        puid |= 4;
                        pushFN(data, branch_04fde24ccb5e2755);
                        pushFN(data, $symbols__condition_symbol_list);
                        return puid;
                    }
                case 2:
                    {
                        puid |= 32;
                        consume(l, data, state);
                        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
                        puid |= 4;
                        pushFN(data, branch_a1a914cd39ca1a43);
                        pushFN(data, $symbols__condition_symbol_list);
                        return puid;
                    }
                case 3:
                    {
                        puid |= 64;
                        consume(l, data, state);
                        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
                        puid |= 4;
                        pushFN(data, branch_235d1a59bde2b405);
                        pushFN(data, $symbols__condition_symbol_list);
                        return puid;
                    }
                case 4:
                    {
                        puid |= 128;
                        consume(l, data, state);
                        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
                        puid |= 256;
                        pushFN(data, branch_c504274fef8dc459);
                        pushFN(data, $symbols__symbol);
                        return puid;
                    }
                default:
                    break;
            }
        };
        return -1;
    }
    function $production_bodies__condition_clause_reducer(l, data, state, prod, puid) {
        if (15 == puid) {
            add_reduce(state, data, 4, 30);
        } else if (29 == puid) {
            add_reduce(state, data, 4, 31);
        } else if (45 == puid) {
            add_reduce(state, data, 4, 32);
        } else if (77 == puid) {
            add_reduce(state, data, 4, 33);
        } else if (393 == puid) {
            add_reduce(state, data, 4, 34);
        };
        return 28;

    }
    function $symbols__condition_symbol_list(l, data, state, prod, puid) {
        puid |= 1;
        pushFN(data, branch_79317aabcdf59047);
        pushFN(data, $symbols__terminal_symbol);
        return puid;
        return -1;
    }
    function $symbols__condition_symbol_list_goto(l, data, state, prod, puid) {
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        if ((cmpr_set(l, data, 1, 2, 2) || cmpr_set(l, data, 69, 2, 2) || l.current_byte == 92)) {
            pushFN(data, branch_7b4066419573fedd);
            return branch_3a3b05edc9dc1610(l, data, state, prod, 2);
        };
        return (prod == 29) ? prod : 1;
    }
    function $symbols__condition_symbol_list_reducer(l, data, state, prod, puid) {
        if (1 == puid) {
            add_reduce(state, data, 1, 3);
        } else if (3 == puid) {
            add_reduce(state, data, 2, 4);
        };
        return 29;

    }
    function $symbols__terminal_symbol(l, data, state, prod, puid) {
        if ((cmpr_set(l, data, 1, 2, 2))) {
            pushFN(data, branch_ca85d69693cada14);
            return branch_0f284a6c127abef4(l, data, state, prod, 1);
        } else if ((cmpr_set(l, data, 69, 2, 2))) {
            pushFN(data, branch_ca85d69693cada14);
            return branch_c65131567c09d34c(l, data, state, prod, 2);
        } else if ((l.current_byte == 92)) {
            pushFN(data, branch_ca85d69693cada14);
            return branch_e0964953d1827b08(l, data, state, prod, 4);
        };
        return -1;
    }
    function $symbols__terminal_symbol_reducer(l, data, state, prod, puid) {
        return 30;

    }
    function $symbols__symbol(l, data, state, prod, puid) {
        switch (sym_map_09247d97e0941ed1(l, data)) {
            case 0:
                {
                    puid |= 4;
                    consume(l, data, state);
                    skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
                    puid |= 1;
                    pushFN(data, branch_da0a56a4faa5afe8);
                    pushFN(data, $symbols__symbol);
                    return puid;
                }
            case 1:
                {
                    puid |= 8;
                    pushFN(data, branch_e8fa6fae7db24859);
                    pushFN(data, $symbols__generated_symbol);
                    return puid;
                }
            case 2:
                {
                    puid |= 32;
                    pushFN(data, branch_e8fa6fae7db24859);
                    pushFN(data, $symbols__production_token_symbol);
                    return puid;
                }
            case 3:
                {
                    puid |= 128;
                    pushFN(data, branch_e8fa6fae7db24859);
                    pushFN(data, $symbols__literal_symbol);
                    return puid;
                }
            case 4:
                {
                    puid |= 256;
                    pushFN(data, branch_e8fa6fae7db24859);
                    pushFN(data, $symbols__escaped_symbol);
                    return puid;
                }
            case 5:
                {
                    puid |= 1024;
                    consume(l, data, state);
                    skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
                    puid |= 2048;
                    pushFN(data, branch_430f62fc0e835934);
                    pushFN(data, $production_bodies__production_bodies);
                    return puid;
                }
            case 6:
                {
                    puid |= 1;
                    pushFN(data, branch_900af65e85901fee);
                    pushFN(data, $default_productions__js_identifier);
                    return puid;
                }
            case 7:
                {
                    puid |= 512;
                    pushFN(data, branch_e8fa6fae7db24859);
                    pushFN(data, $symbols__EOF_symbol);
                    return puid;
                }
            case 8:
                {
                    puid |= 32768;
                    consume(l, data, state);
                    add_reduce(state, data, 1, 39);
                    pushFN(data, $symbols__symbol_goto);
                    return 31;
                }
            default:
                break;
        };
        return -1;
    }
    function $symbols__symbol_goto(l, data, state, prod, puid) {
        while (1) {
            switch (prod) {
                case 8:
                    {
                        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
                        if ((cmpr_set(l, data, 27, 2, 2))) {
                            pushFN(data, branch_99afa145831a4aad);
                            return branch_3ec57237f6375970(l, data, state, prod, 1);
                        } else if ((sym_map_331365130e60e794(l, data) == 1)) {
                            add_reduce(state, data, 1, 41);
                            pushFN(data, $symbols__symbol_goto);
                            return 31;
                        };
                        break;
                    }
                case 31:
                    {
                        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
                        if ((l.current_byte == 63)) {
                            pushFN(data, branch_99afa145831a4aad);
                            return branch_02db936feb4d9fe2(l, data, state, prod, 1);
                        } else if ((cmpr_set(l, data, 20, 2, 2))) {
                            var pk = l.copy();
                            skip_27d8e42c3256622b(pk.next(data), data, STATE_ALLOW_SKIP);
                            if ((pk.current_byte == 41)) {
                                pushFN(data, branch_99afa145831a4aad);
                                return branch_fd5e64877e7b610b(l, data, state, prod, 1);
                            } else if ((cmpr_set(pk, data, 1, 2, 2) || cmpr_set(pk, data, 69, 2, 2) || pk.current_byte == 92)) {
                                pushFN(data, branch_99afa145831a4aad);
                                return branch_f9a2946b3f9a2c57(l, data, state, prod, 1);
                            }
                        } else if ((cmpr_set(l, data, 71, 2, 2))) {
                            var pk = l.copy();
                            skip_27d8e42c3256622b(pk.next(data), data, STATE_ALLOW_SKIP);
                            if ((pk.current_byte == 41)) {
                                pushFN(data, branch_99afa145831a4aad);
                                return branch_0e09482691fb7844(l, data, state, prod, 1);
                            } else if ((cmpr_set(pk, data, 1, 2, 2) || cmpr_set(pk, data, 69, 2, 2) || pk.current_byte == 92)) {
                                pushFN(data, branch_99afa145831a4aad);
                                return branch_b6ab240fd169d593(l, data, state, prod, 1);
                            }
                        };
                        break;
                    }
            };
            break;
        };
        return (prod == 31) ? prod : 1;
    }
    function $symbols__symbol_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            add_reduce(state, data, 2, 35);
        } else if (5 == puid) {
            add_reduce(state, data, 2, 36);
        } else if (7168 == puid) {
            add_reduce(state, data, 3, 37);
        } else if (28673 == puid) {
            add_reduce(state, data, 4, 38);
        } else if (32768 == puid) {
            add_reduce(state, data, 1, 39);
        } else if (86017 == puid) {
            add_reduce(state, data, 4, 38);
        } else if (12289 == puid) {
            add_reduce(state, data, 3, 40);
        } else if (69633 == puid) {
            add_reduce(state, data, 3, 40);
        };
        return 31;

    }
    function $symbols__production_symbol(l, data, state, prod, puid) {
        puid |= 1;
        pushFN(data, branch_efb6a2c078cd4f57);
        pushFN(data, $symbols__identifier);
        return puid;
        return -1;
    }
    function $symbols__production_symbol_reducer(l, data, state, prod, puid) {
        if (1 == puid) {
            add_reduce(state, data, 1, 41);
        };
        return 32;

    }
    function $symbols__imported_production_symbol(l, data, state, prod, puid) {
        puid |= 1;
        pushFN(data, branch_c7a4b3f5ff02d93d);
        pushFN(data, $symbols__identifier);
        return puid;
        return -1;
    }
    function $symbols__imported_production_symbol_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            add_reduce(state, data, 3, 42);
        };
        return 33;

    }
    function $symbols__EOF_symbol(l, data, state, prod, puid) {
        if ((cmpr_set(l, data, 65, 4, 4))) {
            consume(l, data, state);
            puid |= 1;
            add_reduce(state, data, 1, 43);
            return 34;
        };
        return -1;
    }
    function $symbols__EOF_symbol_reducer(l, data, state, prod, puid) {
        if (1 == puid) {
            add_reduce(state, data, 1, 43);
        };
        return 34;

    }
    function $symbols__empty_symbol(l, data, state, prod, puid) {
        if ((cmpr_set(l, data, 4, 6, 6))) {
            consume(l, data, state);
            puid |= 1;
            add_reduce(state, data, 1, 44);
            return 35;
        };
        return -1;
    }
    function $symbols__empty_symbol_reducer(l, data, state, prod, puid) {
        if (1 == puid) {
            add_reduce(state, data, 1, 44);
        };
        return 35;

    }
    function $functions__reduce_function(l, data, state, prod, puid) {
        pushFN(data, branch_a0d510288dad7759);
        pushFN(data, $functions__js_function_start_symbol);
        puid |= 1;
        return puid;
        return -1;
    }
    function $functions__reduce_function_reducer(l, data, state, prod, puid) {
        if (31 == puid) {
            add_reduce(state, data, 5, 45);
        } else if (99 == puid) {
            add_reduce(state, data, 4, 46);
        } else if (195 == puid) {
            add_reduce(state, data, 4, 47);
        } else if (285 == puid) {
            add_reduce(state, data, 5, 45);
        } else if (541 == puid) {
            add_reduce(state, data, 5, 45);
        } else if (1053 == puid) {
            add_reduce(state, data, 5, 45);
        } else if (353 == puid) {
            add_reduce(state, data, 4, 46);
        } else if (609 == puid) {
            add_reduce(state, data, 4, 46);
        } else if (1121 == puid) {
            add_reduce(state, data, 4, 46);
        } else if (449 == puid) {
            add_reduce(state, data, 4, 47);
        } else if (705 == puid) {
            add_reduce(state, data, 4, 47);
        } else if (1217 == puid) {
            add_reduce(state, data, 4, 47);
        };
        return 36;

    }
    function $functions__js_function_start_symbol(l, data, state, prod, puid) {
        if ((l.current_byte == 102)) {
            consume(l, data, state);
            puid |= 1;
            skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
            puid |= 2;
            if ((((l.current_byte == 58) && consume(l, data, state)))) {
                add_reduce(state, data, 2, 48);
                return 37;
            }
        };
        return -1;
    }
    function $functions__js_function_start_symbol_reducer(l, data, state, prod, puid) {
        if (3 == puid) {
            add_reduce(state, data, 2, 48);
        };
        return 37;

    }
    function $functions__js_data(l, data, state, prod, puid) {
        if ((l.END(data))) {
            pushFN(data, branch_4e7b1d63c4233efc);
            return branch_90fc2b73b49088ce(l, data, state, prod, 8);
        } else if ((l.current_byte == 123)) {
            pushFN(data, branch_4e7b1d63c4233efc);
            return branch_98628b1ab9abb2f0(l, data, state, prod, 2);
        } else if ((cmpr_set(l, data, 65, 4, 4) || cmpr_set(l, data, 1, 2, 2) || cmpr_set(l, data, 69, 2, 2) || l.current_byte == 92 || l.isUniID(data) || l.isNum(data) || l.isSym(true, data) || l.isSP(true, data))) {
            pushFN(data, branch_4e7b1d63c4233efc);
            return branch_659295cd363b1618(l, data, state, prod, 1);
        };
        return -1;
    }
    function $functions__js_data_goto(l, data, state, prod, puid) {
        skip_6725b1140c2474a9(l/*[ nl ]*/, data, state);
        if ((l.current_byte == 125)) return 38;;
        if ((l.current_byte == 123)) {
            pushFN(data, branch_599fa571c70519de);
            return branch_91bf73fef1a5e435(l, data, state, prod, 4);
        } else if ((cmpr_set(l, data, 65, 4, 4) || cmpr_set(l, data, 1, 2, 2) || cmpr_set(l, data, 69, 2, 2) || l.current_byte == 92 || l.isUniID(data) || l.isNum(data) || l.isSym(true, data) || l.isSP(true, data))) {
            pushFN(data, branch_599fa571c70519de);
            return branch_d760475894a00139(l, data, state, prod, 4);
        };
        return (prod == 38) ? prod : 1;
    }
    function $functions__js_data_reducer(l, data, state, prod, puid) {
        if (5 == puid) {
            add_reduce(state, data, 2, 7);
        } else if (6 == puid) {
            add_reduce(state, data, 2, 7);
        };
        return 38;

    }
    function $functions__js_primitive(l, data, state, prod, puid) {
        switch (sym_map_542573164c419a99(l, data)) {
            case 0:
                {
                    puid |= 1;
                    consume(l, data, state);
                    return 39;
                }
            case 1:
                {
                    puid |= 2;
                    consume(l, data, state);
                    return 39;
                }
            case 2:
                {
                    puid |= 4;
                    consume(l, data, state);
                    return 39;
                }
            case 3:
                {
                    puid |= 16;
                    pushFN(data, branch_8cc27ab15c5524f8);
                    pushFN(data, $symbols__EOF_symbol);
                    return puid;
                }
            case 4:
                {
                    puid |= 32;
                    pushFN(data, branch_8cc27ab15c5524f8);
                    pushFN(data, $symbols__generated_symbol);
                    return puid;
                }
            case 5:
                {
                    puid |= 64;
                    pushFN(data, branch_8cc27ab15c5524f8);
                    pushFN(data, $symbols__literal_symbol);
                    return puid;
                }
            case 6:
                {
                    puid |= 128;
                    pushFN(data, branch_8cc27ab15c5524f8);
                    pushFN(data, $symbols__escaped_symbol);
                    return puid;
                }
            case 7:
                {
                    puid |= 8;
                    consume(l, data, state);
                    return 39;
                }
            default:
                break;
        };
        return -1;
    }
    function $functions__js_primitive_reducer(l, data, state, prod, puid) {
        if (16 == puid) {
            add_reduce(state, data, 1, 49);
        } else if (32 == puid) {
            add_reduce(state, data, 1, 49);
        } else if (64 == puid) {
            add_reduce(state, data, 1, 49);
        } else if (128 == puid) {
            add_reduce(state, data, 1, 49);
        };
        return 39;

    }
    function $functions__js_data_block(l, data, state, prod, puid) {
        if ((l.current_byte == 123)) {
            consume(l, data, state);
            puid |= 1;
            skip_6725b1140c2474a9(l/*[ nl ]*/, data, state);
            puid |= 2;
            pushFN(data, branch_dff6c1299fc320e7);
            pushFN(data, $functions__js_data);
            return puid;
        };
        return -1;
    }
    function $functions__js_data_block_reducer(l, data, state, prod, puid) {
        if (7 == puid) {
            add_reduce(state, data, 3, 50);
        };
        return 40;

    }
    function $symbols__js_identifier(l, data, state, prod, puid) {
        puid |= 1;
        pushFN(data, branch_b217ff17bd8e39fa);
        pushFN(data, $default_productions__js_identifier);
        return puid;
        return -1;
    }
    function $symbols__js_identifier_reducer(l, data, state, prod, puid) {
        return 41;

    }
    function $functions__referenced_function(l, data, state, prod, puid) {
        puid |= 1;
        pushFN(data, branch_cd5afda4dbab1ae3);
        pushFN(data, $functions__referenced_function_group_0_0_);
        return puid;
        return -1;
    }
    function $functions__referenced_function_reducer(l, data, state, prod, puid) {
        if (31 == puid) {
            add_reduce(state, data, 5, 51);
        };
        return 42;

    }
    function $symbols__escaped_symbol_list_48(l, data, state, prod, puid) {
        if ((l.isNum(data))) {
            pushFN(data, branch_355d0cd3d29c7396);
            return branch_50bbc1b45a7d0e84(l, data, state, prod, 1);
        } else if ((l.isUniID(data))) {
            pushFN(data, branch_355d0cd3d29c7396);
            return branch_ca991aa43916bf4c(l, data, state, prod, 4);
        } else if ((l.isSym(true, data))) {
            pushFN(data, branch_355d0cd3d29c7396);
            return branch_14a5617bbdea784b(l, data, state, prod, 8);
        };
        return -1;
    }
    function $symbols__escaped_symbol_list_48_goto(l, data, state, prod, puid) {
        if ((l.isNL() || l.isSP(true, data))) return 43;;
        if ((l.isNum(data))) {
            pushFN(data, branch_846a90ef8e657721);
            return branch_281211993c7e1b75(l, data, state, prod, 2);
        } else if ((l.isUniID(data))) {
            pushFN(data, branch_846a90ef8e657721);
            return branch_b4be9c594153d66a(l, data, state, prod, 2);
        } else if ((l.isSym(true, data))) {
            pushFN(data, branch_846a90ef8e657721);
            return branch_edc46cfe2f2f664d(l, data, state, prod, 2);
        };
        return (prod == 43) ? prod : 1;
    }
    function $symbols__escaped_symbol_list_48_reducer(l, data, state, prod, puid) {
        if (1 == puid) {
            add_reduce(state, data, 1, 52);
        } else if (3 == puid) {
            add_reduce(state, data, 2, 7);
        } else if (4 == puid) {
            add_reduce(state, data, 1, 52);
        } else if (8 == puid) {
            add_reduce(state, data, 1, 52);
        } else if (6 == puid) {
            add_reduce(state, data, 2, 7);
        } else if (10 == puid) {
            add_reduce(state, data, 2, 7);
        };
        return 43;

    }
    function $preambles__import_preamble_list_54(l, data, state, prod, puid) {
        if ((l.isSP(true, data))) {
            consume(l, data, state);
            puid |= 1;
            add_reduce(state, data, 1, 3);
            pushFN(data, $preambles__import_preamble_list_54_goto);
            return 44;
        };
        return -1;
    }
    function $preambles__import_preamble_list_54_goto(l, data, state, prod, puid) {
        skip_6725b1140c2474a9(l/*[ nl ]*/, data, state);
        if ((l.isSP(true, data))) {
            pushFN(data, branch_59ebf03284c2e51a);
            return branch_5bc1625c551818db(l, data, state, prod, 2);
        };
        return (prod == 44) ? prod : 1;
    }
    function $preambles__import_preamble_list_54_reducer(l, data, state, prod, puid) {
        if (1 == puid) {
            add_reduce(state, data, 1, 3);
        } else if (3 == puid) {
            add_reduce(state, data, 2, 4);
        };
        return 44;

    }
    function $preambles__import_preamble_list_55(l, data, state, prod, puid) {
        if ((l.isSym(true, data))) {
            pushFN(data, branch_6b898dd2704529c6);
            return branch_50bbc1b45a7d0e84(l, data, state, prod, 1);
        } else if ((l.isUniID(data))) {
            pushFN(data, branch_6b898dd2704529c6);
            return branch_ca991aa43916bf4c(l, data, state, prod, 4);
        };
        return -1;
    }
    function $preambles__import_preamble_list_55_goto(l, data, state, prod, puid) {
        skip_6725b1140c2474a9(l/*[ nl ]*/, data, state);
        if ((l.isSP(true, data))) return 45;;
        if ((l.isSym(true, data))) {
            pushFN(data, branch_c678eb9c04d3c7d4);
            return branch_281211993c7e1b75(l, data, state, prod, 2);
        } else if ((l.isUniID(data))) {
            pushFN(data, branch_c678eb9c04d3c7d4);
            return branch_b4be9c594153d66a(l, data, state, prod, 2);
        };
        return (prod == 45) ? prod : 1;
    }
    function $preambles__import_preamble_list_55_reducer(l, data, state, prod, puid) {
        if (1 == puid) {
            add_reduce(state, data, 1, 52);
        } else if (3 == puid) {
            add_reduce(state, data, 2, 7);
        } else if (4 == puid) {
            add_reduce(state, data, 1, 52);
        } else if (6 == puid) {
            add_reduce(state, data, 2, 7);
        };
        return 45;

    }
    function $comments__cm_list_71(l, data, state, prod, puid) {
        puid |= 1;
        pushFN(data, branch_b98e5f677a2a8eb2);
        pushFN(data, $comments__comment_primitive);
        return puid;
        return -1;
    }
    function $comments__cm_list_71_goto(l, data, state, prod, puid) {
        if ((l.isNL())) return 46;;
        if ((l.isUniID(data) || l.isNum(data) || l.isSym(true, data) || l.isSP(true, data))) {
            pushFN(data, branch_2b1f52e8ce7d3145);
            return branch_c175a6daf89c34b0(l, data, state, prod, 2);
        };
        return (prod == 46) ? prod : 1;
    }
    function $comments__cm_list_71_reducer(l, data, state, prod, puid) {
        if (1 == puid) {
            add_reduce(state, data, 1, 52);
        } else if (3 == puid) {
            add_reduce(state, data, 2, 7);
        };
        return 46;

    }
    function $productions__production_group_1_0_(l, data, state, prod, puid) {
        puid |= 1;
        pushFN(data, branch_2b4b778fcfc79f4c);
        pushFN(data, $symbols__production_id);
        return puid;
        return -1;
    }
    function $productions__production_group_1_0__reducer(l, data, state, prod, puid) {
        if (1 == puid) {
            add_reduce(state, data, 1, 53);
        };
        return 47;

    }
    function $productions__production_group_1_0_(l, data, state, prod, puid) {
        puid |= 1;
        pushFN(data, branch_01185330acd32382);
        pushFN(data, $symbols__imported_production_symbol);
        return puid;
        return -1;
    }
    function $productions__production_group_1_0__reducer(l, data, state, prod, puid) {
        if (1 == puid) {
            add_reduce(state, data, 1, 54);
        };
        return 48;

    }
    function $production_bodies__body_entry_list_124(l, data, state, prod, puid) {
        puid |= 1;
        pushFN(data, branch_9e5c5755e3e00fc4);
        pushFN(data, $production_bodies__body_entry);
        return puid;
        return -1;
    }
    function $production_bodies__body_entry_list_124_goto(l, data, state, prod, puid) {
        skip_27d8e42c3256622b(l/*[ ws ][ nl ]*/, data, state);
        if ((l.current_byte == 93)) return 49;;
        if ((cmpr_set(l, data, 25, 2, 2) || cmpr_set(l, data, 1, 2, 2) || dt_1dfefb30107f3630(l, data) || cmpr_set(l, data, 65, 4, 4) || assert_ascii(l, 0x0, 0x110, 0x98000000, 0x0) || l.isUniID(data) || l.isSym(true, data))) {
            pushFN(data, branch_e38dfa0a987cd1c5);
            return branch_4650505de5796604(l, data, state, prod, 2);
        };
        return (prod == 49) ? prod : 1;
    }
    function $production_bodies__body_entry_list_124_reducer(l, data, state, prod, puid) {
        if (1 == puid) {
            add_reduce(state, data, 1, 3);
        } else if (3 == puid) {
            add_reduce(state, data, 2, 4);
        };
        return 49;

    }
    function $functions__referenced_function_group_0_0_(l, data, state, prod, puid) {
        puid |= 1;
        pushFN(data, branch_6dd62f4df44385d0);
        pushFN(data, $functions__js_function_start_symbol);
        return puid;
        return -1;
    }
    function $functions__referenced_function_group_0_0__reducer(l, data, state, prod, puid) {
        if (1 == puid) {
            add_reduce(state, data, 1, 55);
        };
        return 50;

    }
    function dispatch(data, production_index) {
        switch (production_index) {
            case 0:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $hydrocarbon;
                    data.stash[0] = 0;
                    return;
                }
            case 1:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $head;
                    data.stash[0] = 0;
                    return;
                }
            case 2:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $preambles__preamble;
                    data.stash[0] = 0;
                    return;
                }
            case 3:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $preambles__preamble_clause;
                    data.stash[0] = 0;
                    return;
                }
            case 4:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $preambles__ignore_preamble;
                    data.stash[0] = 0;
                    return;
                }
            case 5:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $symbols__ignore_symbols;
                    data.stash[0] = 0;
                    return;
                }
            case 6:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $symbols__ignore_symbol;
                    data.stash[0] = 0;
                    return;
                }
            case 7:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $symbols__generated_symbol;
                    data.stash[0] = 0;
                    return;
                }
            case 8:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $symbols__identifier;
                    data.stash[0] = 0;
                    return;
                }
            case 9:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $default_productions__js_identifier;
                    data.stash[0] = 0;
                    return;
                }
            case 10:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $default_productions__js_id_symbols;
                    data.stash[0] = 0;
                    return;
                }
            case 11:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $symbols__literal_symbol;
                    data.stash[0] = 0;
                    return;
                }
            case 12:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $symbols__sym_delimiter;
                    data.stash[0] = 0;
                    return;
                }
            case 13:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $symbols__escaped_symbol;
                    data.stash[0] = 0;
                    return;
                }
            case 14:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $symbols__production_token_symbol;
                    data.stash[0] = 0;
                    return;
                }
            case 15:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $preambles__import_preamble;
                    data.stash[0] = 0;
                    return;
                }
            case 16:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $comments__comment;
                    data.stash[0] = 0;
                    return;
                }
            case 17:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $comments__cm;
                    data.stash[0] = 0;
                    return;
                }
            case 18:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $comments__comment_primitive;
                    data.stash[0] = 0;
                    return;
                }
            case 19:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $comments__comment_delimiter;
                    data.stash[0] = 0;
                    return;
                }
            case 20:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $productions__productions;
                    data.stash[0] = 0;
                    return;
                }
            case 21:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $productions__production;
                    data.stash[0] = 0;
                    return;
                }
            case 22:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $productions__production_start_symbol;
                    data.stash[0] = 0;
                    return;
                }
            case 23:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $production_bodies__production_bodies;
                    data.stash[0] = 0;
                    return;
                }
            case 24:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $production_bodies__production_body;
                    data.stash[0] = 0;
                    return;
                }
            case 25:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $production_bodies__entries;
                    data.stash[0] = 0;
                    return;
                }
            case 26:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $production_bodies__body_entry;
                    data.stash[0] = 0;
                    return;
                }
            case 27:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $production_bodies__condition_clause;
                    data.stash[0] = 0;
                    return;
                }
            case 28:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $symbols__condition_symbol_list;
                    data.stash[0] = 0;
                    return;
                }
            case 29:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $symbols__terminal_symbol;
                    data.stash[0] = 0;
                    return;
                }
            case 30:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $symbols__symbol;
                    data.stash[0] = 0;
                    return;
                }
            case 31:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $symbols__imported_production_symbol;
                    data.stash[0] = 0;
                    return;
                }
            case 32:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $symbols__EOF_symbol;
                    data.stash[0] = 0;
                    return;
                }
            case 33:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $symbols__empty_symbol;
                    data.stash[0] = 0;
                    return;
                }
            case 34:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $functions__reduce_function;
                    data.stash[0] = 0;
                    return;
                }
            case 35:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $functions__js_function_start_symbol;
                    data.stash[0] = 0;
                    return;
                }
            case 36:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $functions__js_data;
                    data.stash[0] = 0;
                    return;
                }
            case 37:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $functions__js_primitive;
                    data.stash[0] = 0;
                    return;
                }
            case 38:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $functions__js_data_block;
                    data.stash[0] = 0;
                    return;
                }
            case 39:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $symbols__js_identifier;
                    data.stash[0] = 0;
                    return;
                }
            case 40:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $functions__referenced_function;
                    data.stash[0] = 0;
                    return;
                }
            case 41:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $symbols__escaped_symbol_list_48;
                    data.stash[0] = 0;
                    return;
                }
            case 42:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $preambles__import_preamble_list_54;
                    data.stash[0] = 0;
                    return;
                }
            case 43:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $preambles__import_preamble_list_55;
                    data.stash[0] = 0;
                    return;
                }
            case 44:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $comments__cm_list_71;
                    data.stash[0] = 0;
                    return;
                }
            case 45:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $productions__production_group_1_0_;
                    data.stash[0] = 0;
                    return;
                }
            case 46:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $production_bodies__body_entry_list_124;
                    data.stash[0] = 0;
                    return;
                }
            case 47:
                {
                    skip_27d8e42c3256622b(data.lexer/*[ ws ][ nl ]*/, data, 16777215);
                    data.stack[0] = $functions__referenced_function_group_0_0_;
                    data.stash[0] = 0;
                    return;
                }
        }
    };
    sequence_lookup = [64, 103, 58, 95, 36, 101, 109, 112, 116, 121, 116, 107, 58, 92, 35, 60, 62, 43, 62, 124, 40, 42, 41, 91, 93, 63, 61, 58, 58, 123, 125, 94, 61, 62, 73, 71, 78, 79, 82, 69, 97, 115, 65, 83, 70, 79, 82, 75, 69, 88, 67, 82, 83, 84, 114, 101, 116, 117, 114, 110, 99, 115, 116, 114, 102, 36, 101, 111, 102, 116, 58, 40, 43, 73, 77, 80, 79, 82, 84, 69, 82, 82, 69, 68];

    return {
        get_next_command_block,
        sequence_lookup,
        lookup_table,
        run,
        dispatch,
        init_table,
        init_data,
        delete_data: _ => _,
        recognizer,
        get_fork_information
    };
});

const reduce_functions = [(_, s) => s[s.length - 1], (env, sym, pos) => ({ type: "hc-grammar-3", preamble: sym[0] || [], productions: sym[1].productions, functions: sym[1].functions, imported_grammars: [], meta: null, ignore: [], all_symbols: [], bodies: [] })/*0*/
    , (env, sym, pos) => ({ type: "hc-grammar-3", preamble: null || [], productions: sym[0].productions, functions: sym[0].functions, imported_grammars: [], meta: null, ignore: [], all_symbols: [], bodies: [] })/*1*/
    , (env, sym, pos) => ([sym[0]])/*2*/
    , (env, sym, pos) => (sym[0].push(sym[1]), sym[0])/*3*/
    , (env, sym, pos) => ({ type: "ignore", symbols: sym[2] })/*4*/
    , (env, sym, pos) => ({ type: "generated", val: sym[1], pos: pos })/*5*/
    , (env, sym, pos) => (sym[0] + sym[1])/*6*/
    , (env, sym, pos) => ({ type: "literal", val: "" + sym[1], pos: pos })/*7*/
    , (env, sym, pos) => ({ type: "literal", val: sym[1], pos: pos })/*8*/
    , (env, sym, pos) => ({ type: "production_token", name: sym[1], production: null, val: -1, pos: pos })/*9*/
    , (env, sym, pos) => ({ type: "import", uri: sym[3], reference: sym[6] })/*10*/
    , (env, sym, pos) => ({ type: "import", uri: sym[2], reference: sym[5] })/*11*/
    , (env, sym, pos) => ({ type: "comment", value: sym[1] })/*12*/
    , (env, sym, pos) => ({ type: "production-section", functions: [], productions: [sym[0]] })/*13*/
    , (env, sym, pos) => ({ type: "production-section", functions: [sym[0]], productions: [] })/*14*/
    , (env, sym, pos) => (sym[0].productions.push(sym[1]), sym[0])/*15*/
    , (env, sym, pos) => (sym[0])/*16*/
    , (env, sym, pos) => (sym[0].functions.push(sym[1]), sym[0])/*17*/
    , (env, sym, pos) => ({ type: "production", name: sym[1], bodies: sym[3], id: -1, recovery_handler: sym[4], pos: pos })/*18*/
    , (env, sym, pos) => ({ type: "production-merged-import", name: sym[1], bodies: sym[3], id: -1, recovery_handler: sym[4] })/*19*/
    , (env, sym, pos) => ({ type: "production", name: sym[1], id: -1, recovery_handler: sym[3], pos: pos })/*20*/
    , (env, sym, pos) => (sym[0].push(sym[2]), sym[0])/*21*/
    , (env, sym, pos) => ({ type: "body", sym: sym[3], reduce_function: sym[4], FORCE_FORK: !!sym[2], id: -1, production: null })/*22*/
    , (env, sym, pos) => ({ type: "body", sym: sym[0], reduce_function: sym[1], FORCE_FORK: !!null, id: -1, production: null })/*23*/
    , (env, sym, pos) => ({ type: "body", sym: sym[3], reduce_function: null, FORCE_FORK: !!sym[2], id: -1, production: null })/*24*/
    , (env, sym, pos) => ({ type: "body", sym: sym[0], reduce_function: null, FORCE_FORK: !!null, id: -1, production: null })/*25*/
    , (env, sym, pos) => (sym[0].concat(sym[1]))/*26*/
    , (env, sym, pos) => ([])/*27*/
    , (env, sym, pos) => (sym[1].flat().map(e => (e.NO_BLANK = true, e)))/*28*/
    , (env, sym, pos) => ({ type: "condition-exclude", sym: sym[2], offset: -1 })/*29*/
    , (env, sym, pos) => ({ type: "condition-error", sym: sym[2], offset: -1 })/*30*/
    , (env, sym, pos) => ({ type: "condition-ignore", sym: sym[2], offset: -1 })/*31*/
    , (env, sym, pos) => ({ type: "condition-reset", sym: sym[2], offset: -1 })/*32*/
    , (env, sym, pos) => ({ type: "condition-reduce", sym: sym[2], offset: -1 })/*33*/
    , (env, sym, pos) => (sym[0].IS_OPTIONAL = true, sym[0])/*34*/
    , (env, sym, pos) => (sym[1].IS_NON_CAPTURE = true, sym[1])/*35*/
    , (env, sym, pos) => ({ type: "group-production", val: sym[1], pos: pos })/*36*/
    , (env, sym, pos) => ({ type: "list-production", terminal_symbol: sym[2], IS_OPTIONAL: (sym[1] == "(*"), val: sym[0], pos: pos })/*37*/
    , (env, sym, pos) => ({ type: "literal", val: sym[0], pos: pos })/*38*/
    , (env, sym, pos) => ({ type: "list-production", terminal_symbol: null, IS_OPTIONAL: (sym[1] == "(*"), val: sym[0], pos: pos })/*39*/
    , (env, sym, pos) => ({ type: "sym-production", name: sym[0], production: null, val: -1, pos: pos })/*40*/
    , (env, sym, pos) => ({ type: "sym-production-import", module: sym[0], production: sym[2], name: "", pos: pos })/*41*/
    , (env, sym, pos) => ({ type: "eof", val: "END_OF_FILE", pos: pos })/*42*/
    , (env, sym, pos) => ({ type: "empty", val: "", pos: pos })/*43*/
    , (env, sym, pos) => ({ type: (sym[1][0] == "c") ? "CLASS" : "RETURNED", txt: sym[3], name: "", env: false, ref: "", IS_CONDITION: true })/*44*/
    , (env, sym, pos) => ({ type: (sym[1][0] == "c") ? "CLASS" : "RETURNED", txt: "", name: sym[3], env: true, ref: "", IS_CONDITION: true })/*45*/
    , (env, sym, pos) => ({ type: (sym[1][0] == "c") ? "CLASS" : "RETURNED", ref: sym[3], txt: "", name: "", env: true, IS_CONDITION: true })/*46*/
    , (env, sym, pos) => ("FN:F")/*47*/
    , (env, sym, pos) => ("<--" + sym[0].type + "^^" + sym[0].val + "-->")/*48*/
    , (env, sym, pos) => (sym[0] + sym[1] + sym[2])/*49*/
    , (env, sym, pos) => ({ type: "ref-function", id: sym[1], txt: sym[3], env: false, name: "", IS_CONDITION: true })/*50*/
    , (env, sym, pos) => (sym[0] + "")/*51*/
    , (env, sym, pos) => (env.prod_name = sym[0])/*52*/
    , (env, sym, pos) => (env.prod_name = sym[0].val, sym[0])/*53*/
    , (env, sym, pos) => (sym[0] + "GG")/*54*/];

export default ParserFactory(reduce_functions, undefined, recognizer_initializer);
