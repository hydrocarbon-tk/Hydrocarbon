import { ParserFactory } from "@candlelib/hydrocarbon";

const data = (()=>{
        
    const lookup_table = new Uint8Array(382976);
    const sequence_lookup = [91,93,38,44,43,43,45,45,40,41,61,62,61,47,42,47,46,48,120,34,39,92,95,36,105,102,116,104,101,110,101,108,115,101,109,97,121,98,101,112,114,105,118,97,116,101,111,114,99,100,65,66,67,68,69,70,49,50,51,52,53,54,55,48,98,48,111,48,79];
    const TokenSpace = 1;
    const TokenNewLine = 2;
    const TokenSymbol = 4;
    const TokenNumber = 8;
    const TokenIdentifier = 16;
    const TokenIdentifierUnicode = (1 << 8 )| TokenIdentifier;
    const TokenFullNumber = (2 << 8) | TokenNumber;
    const UNICODE_ID_START = 16;
    const UNICODE_ID_CONTINUE = 32;
    //[javascript_only]
    function print(l,s){
        console.log([...s.input.slice(l.byte_offset, l.byte_offset+5)].map(i=>String.fromCharCode(i)).join(""))
    }

    function compare(data, data_offset, sequence_offset, length) {
        let i = data_offset;
        let j = sequence_offset;
        let len = j + length;

        for (; j < len; i++, j++)
            if (data.input[i] != sequence_lookup[j]) return j - sequence_offset;

        return length;
    }

    function cmpr_set(l, data, sequence_offset, length, tk_len){
        if(length == compare(data, l.byte_offset, sequence_offset, length)){
            l.byte_length = length;
            l.token_length = tk_len;
            return true;
        }
        return false;
    }

    function getUTF8ByteLengthFromCodePoint(code_point){

        if(code_point == 0) {
            return 1;
       } else  if ((code_point & 0x7F) == code_point) {
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
    
            const b = buffer[index+1];
    
            if (flag & 0xE0) {
    
                flag = a & 0xF8;
    
                const c = buffer[index+2];
    
                if (flag == 0xF0){
                    return ((a & 0x7) << 18) | ((b & 0x3F) << 12) | ((c & 0x3F) << 6) | (buffer[index+3] & 0x3F);
                }
    
                else if (flag == 0xE0){
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

    class Lexer{

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

            if(offset >= data.input_len) return true;

            let current_byte = data.input[offset];

            if (!USE_UNICODE || current_byte < 128) {
                type = getTypeAt(current_byte);
            } else {
                type = getTypeAt(utf8ToCodePoint(offset, data));
            }
            
            return (type & assert_class) == 0;
        }

        setToken(type, byte_length, token_length){
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

        copy(){
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

        sync(source){
            this.byte_offset = source.byte_offset;
            this.byte_length = source.byte_length;
            
            this.token_length = source.token_length;
            this.token_offset = source.token_offset;
            this.prev_token_offset = source.prev_token_offset;
            
            this.type = source.type;
            this.current_byte = source.current_byte;
            return this;
        }

        next(data){
            
            this.byte_offset += this.byte_length;
            this.token_offset += this.token_length;
            
            if(data.input_len < this.byte_offset){
                this.type = 0;
                this.byte_length = 0;
                this.token_length = 0;
            }else{
                this.current_byte = data.input[this.byte_offset];
                this.type = 0;
                this.byte_length = 1;
                this.token_length = 1;
            }

            return this;
        }

        END(data){
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

    function init_data(input_len, rules_len, error_len, debug_len){

        let 
            input = new Uint8Array(input_len),
            rules = new Uint16Array(rules_len),
            error = new Uint8Array(error_len),
            debug = new Uint16Array(debug_len),
            stack = [],
            stash = [];

        return {
            valid:false,
            lexer: new Lexer,
            state: createState(true),
            prop: 0,
            stack_ptr: -1,
            input_ptr: 0,
            rules_ptr: 0,
            input_len: input_len,
            rules_len: rules_len,
            input: input,
            rules: rules,
            stash: stash,
            stack: stack,
            origin_fork:0,
            origin: null,
            alternate: null
        }
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

    function add_reduce(state, data,sym_len, body, DNP = false) {
        if (isOutputEnabled(state)) {

            let total = body + sym_len;

            if(total == 0) return;
        
            if(body > 0xFF || sym_len > 0x1F){
                const low = (1 << 2) | (body & 0xFFF8);
                const high = sym_len;
                set_action(low, data);
                set_action(high, data);
            }else {
                const low = ((sym_len & 0x1F) << 3) | ( (body & 0xFF) << 8);
                set_action(low, data);
            }
        }
    }

    function add_shift(l, data, tok_len) {

        if(tok_len < 1) return;
        
        if(tok_len > 0x1FFF){
            const low = 1 | (1 << 2) | ((tok_len >> 13) & 0xFFF8);
            const high = (tok_len & 0xFFFF);
            set_action(low, data);
            set_action(high, data);
        }else {
            const low = 1 | ((tok_len << 3) & 0xFFF8);
            set_action(low, data);
        }
    }

    function add_skip(l, data, skip_delta){

        if(skip_delta < 1) return;
        
        if(skip_delta > 0x1FFF){
            const low = 2 | (1 << 2) | ((skip_delta >> 13) & 0xFFF8);
            const high = (skip_delta & 0xFFFF);
            set_action(low, data);
            set_action(high, data);
        }else {
            const low = 2 | ((skip_delta << 3) & 0xFFF8);
            set_action(low, data);
        }
    }

    function set_error(val, data) {
        if(data.error_ptr > data.error_len) return;
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
        
        if(data.debug_ptr + 1 >= data.debug_len) 
            return;

        const local_pointer = data.debug_ptr;
        
        if(delta_char_offset > 62){

            data.debug[local_pointer+1] = delta_char_offset;

            delta_char_offset = 63;

            data.debug_ptr++;
        }

        data.debug[local_pointer] = ((number_of_items && 0x3F) 
            | ( delta_char_offset << 6) 
            | ((peek_start & 0x1) << 12) 
            | ((peek_end & 0x1) << 13)
            | ((fork_start & 0x1) << 14) 
            | ((fork_end & 0x1) << 15));

        data.debug_ptr++;
    }

    function debug_add_item(data, item_index) { data.debug[data.debug_ptr++] = item_index; }
    
    ;
function branch_003866e5f13c0fae(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*38:102 def$hex_token_group_044_104=>• f*/
    puid |=64;
    consume(l,data,state);
    return prod;
    return -1;
    /*003866e5f13c0fae231de458daba3c67*/
}
function branch_0068265f76323ae8(l,data,state,prod,puid){
    return 38;
    /*0068265f76323ae8d9cfefafef810889*/
}
function branch_00d179128876570a(l,data,state,prod,puid){
    add_reduce(state,data,6,0);
    return prod;
    /*00d179128876570aa9e987a626f811a1*/
}
function branch_037f4e26f07644d8(l,data,state,prod,puid){
    add_reduce(state,data,3,1);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$id_sequence_HC_listbody1_103_goto);
    return 7;
    /*037f4e26f07644d800dbebb3465ae76d*/
}
function branch_063c26611b6f5f75(l,data,state,prod,puid){
    return 12;
    /*063c26611b6f5f7518549285ff2a363e*/
}
function branch_06925892f9159902(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$def$binary_token_HC_listbody1_107_goto);
    return 42;
    /*06925892f9159902d819ccfaf9442752*/
}
function branch_0c3a198b92ffb270(l,data,state,prod,puid){
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=8;
    if(false&&consume(l,data,state)){
        skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
        puid |=16;
        pushFN(data1,branch_afe848085ed70cab);
        pushFN(data3,$blocks);
        return puid;
    }
    return -1;
    /*0c3a198b92ffb270c7232a4b9467fee1*/
}
function branch_0d9c67e4ed206e1e(l,data,state,prod,puid){
    pushFN(data,$def$js_id_symbols_goto);
    return 56;
    /*0d9c67e4ed206e1e183a95a85b1bd40f*/
}
function branch_0e835803faaa761c(l,data,state,prod,puid){
    /*10:18 additive=>multiplicative • + additive
    10:19 additive=>multiplicative •*/
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
    if(l.current_byte==43/*[+]*/){
        pushFN(data,branch_3205c0ded576131e);
        return branch_46c0b51c8437e465(l,data,state,prod,1);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*10:19 additive=>multiplicative •*/
        return 6;
    }
    return -1;
    /*0e835803faaa761c7fb3dcf013613ce0*/
}
function branch_0fad42d4cc3420dd(l,data,state,prod,puid){
    return 51;
    /*0fad42d4cc3420ddeffb4a6edf9a491a*/
}
function branch_1136edc0a0da8964(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
    /*54:148 def$string_value=>def$string_value • def$string_value_group_172_113*/
    puid |=2;
    pushFN(data1,branch_3bdf434b5778a3c9);
    pushFN(data3,$def$string_value_group_172_113);
    return puid;
    return -1;
    return -1;
    /*1136edc0a0da89647a962bc259c69bd1*/
}
function branch_12743fa1aa413ad8(l,data,state,prod,puid){
    return 20;
    /*12743fa1aa413ad8319bfb50fc6dcde9*/
}
function branch_144e5be1c2186845(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$expression_goto);
    return 13;
    /*144e5be1c2186845945a5e55dd60b9de*/
}
function branch_14c32e3cfc4cb69f(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$def$identifier_symbols_goto);
    return 58;
    /*14c32e3cfc4cb69f097e56581e1ef82f*/
}
function branch_17b08110a44e3baa(l,data,state,prod,puid){
    /*59:167 virtual-33:6:1|--lvl:0=>• => identifier reserved_word θvoid blocks
    60:168 virtual-36:6:1|--lvl:0=>• fnB_group_026_104 identifier reserved_word θactive blocks*/
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(/*[=>]*/cmpr_set(l,data,10,2,2)){
        /*59:167 virtual-33:6:1|--lvl:0=>• => identifier reserved_word θvoid blocks
        15:34 fnB_group_026_104=>• =>*/
        /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
        consume(l,data,state);
        puid |=2;
        /*59:167 virtual-33:6:1|--lvl:0=>=> • identifier reserved_word θvoid blocks
        15:34 fnB_group_026_104=>=> •*/
        skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
        /*⤋⤋⤋ peek-unresolved ⤋⤋⤋*/
        if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
            /*-------------VPROD-------------------------*/
            /*59:167 virtual-33:6:1|--lvl:0=>=> • identifier reserved_word θvoid blocks
            15:34 fnB_group_026_104=>=> •*/
            pushFN(data,branch_b23c65bca0cf11f6);
            return 0;
        }
    }
    return -1;
    /*17b08110a44e3baa532882baf36ca6b1*/
}
function branch_17ec808d31868fe1(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$def$octal_token_HC_listbody1_110_goto);
    return 46;
    /*17ec808d31868fe1ae91dc88ead31f16*/
}
function branch_182aa74f9353388c(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*45:124 def$octal_token_group_058_109=>• 5*/
    puid |=32;
    consume(l,data,state);
    return prod;
    return -1;
    /*182aa74f9353388c322679f2b4d6427f*/
}
function branch_18728529e4616a97(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*6:12 expression=>• math_expression*/
    puid |=2;
    pushFN(data1,branch_1f9ddf3c27180aa0);
    pushFN(data3,$additive);
    return puid;
    return -1;
    /*18728529e4616a97ba2efca79939a3a6*/
}
function branch_1aa0fc6f9431dcc9(l,data,state,prod,puid){
    return 41;
    /*1aa0fc6f9431dcc9842faf0187227121*/
}
function branch_1af256ab0327d1ed(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*52:143 def$string_value_group_172_113=>• θsym*/
    puid |=4;
    consume(l,data,state);
    return prod;
    return -1;
    /*1af256ab0327d1edaf011674c515824b*/
}
function branch_1d621c607d7a9b60(l,data,state,prod,puid){
    add_reduce(state,data,1,2);
    pushFN(data,$def$hex_token_HC_listbody1_105_goto);
    return 39;
    /*1d621c607d7a9b601c1b281e9ac815a9*/
}
function branch_1dfa094374155dd3(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*18:43 reserved_word=>• then*/
    puid |=2;
    consume(l,data,state);
    return prod;
    return -1;
    /*1dfa094374155dd38e36c7ff7401777a*/
}
function branch_1f9ddf3c27180aa0(l,data,state,prod,puid){
    return prod;
    /*1f9ddf3c27180aa0dff88bc66c940765*/
}
function branch_20d0478bbad7272b(l,data,state,prod,puid){
    add_reduce(state,data,3,1);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$blocks_HC_listbody3_101_goto);
    return 2;
    /*20d0478bbad7272be209bb79e8c1a1c3*/
}
function branch_231416ab109e374c(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*51:138 def$string_value_group_071_112=>• θsym*/
    puid |=4;
    consume(l,data,state);
    return prod;
    return -1;
    /*231416ab109e374c5ce938f8003ec8df*/
}
function branch_2341f8efe0bbd795(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*12:24 unary=>closure • --*/
    puid |=4;
    consume(l,data,state);
    add_reduce(state,data,2,0);
    return prod;
    return -1;
    /*2341f8efe0bbd7959e2fa1de58bfd106*/
}
function branch_2362b97368713236(l,data,state,prod,puid){
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=2;
    if(/*[=>]*/cmpr_set(l,data,10,2,2)&&consume(l,data,state)){
        skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
        puid |=1;
        pushFN(data1,branch_e5119ed183220650);
        pushFN(data3,$def$js_identifier);
        return puid;
    }
    return -1;
    /*2362b97368713236f1c619f5da4b9a52*/
}
function branch_2497256af0a7d670(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*81:189 virtual-187:5:1|--lvl:1=>• identifier reserved_word θvoid blocks*/
    puid |=1;
    pushFN(data1,branch_429b6eb39ea905e9);
    pushFN(data3,$def$js_identifier);
    return puid;
    return -1;
    /*2497256af0a7d6707f802bfeb2c14c14*/
}
function branch_253645ba8707f546(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*18:45 reserved_word=>• maybe*/
    puid |=8;
    consume(l,data,state);
    return prod;
    return -1;
    /*253645ba8707f54665778d6cd9b9075e*/
}
function branch_2568ca3904a27972(l,data,state,prod,puid){
    add_reduce(state,data,2,3);
    return prod;
    /*2568ca3904a2797221c7b0c9206d7879*/
}
function branch_27c79cb0e75f959b(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*58:161 def$identifier_symbols=>def$identifier_symbols • -*/
    puid |=8;
    consume(l,data,state);
    add_reduce(state,data,2,5);
    return prod;
    return -1;
    return -1;
    /*27c79cb0e75f959b0b086d8e3bae4737*/
}
function branch_2b1338328efc96b7(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*38:103 def$hex_token_group_044_104=>• A*/
    puid |=128;
    consume(l,data,state);
    return prod;
    return -1;
    /*2b1338328efc96b76e8aed8489ccdd34*/
}
function branch_2d4ff674007d174e(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*38:106 def$hex_token_group_044_104=>• D*/
    puid |=1024;
    consume(l,data,state);
    return prod;
    return -1;
    /*2d4ff674007d174ece1b494ffce3fbb6*/
}
function branch_2d76dd1ed4cdbdbc(l,data,state,prod,puid){
    add_reduce(state,data,2,3);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$def$string_token_HC_listbody3_111_goto);
    return 49;
    /*2d76dd1ed4cdbdbcce1d1b5665e98c31*/
}
function branch_2d88b1c3ea6eb977(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$def$string_token_goto);
    return 50;
    /*2d88b1c3ea6eb977cf1bc3377398b524*/
}
function branch_308bdd9a72b6d6bd(l,data,state,prod,puid){
    return 45;
    /*308bdd9a72b6d6bdae6b49b62a281501*/
}
function branch_318161b76adcc77c(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$comment_HC_listbody1_107_goto);
    return 22;
    /*318161b76adcc77c63d413c8a8269306*/
}
function branch_3205c0ded576131e(l,data,state,prod,puid){
    add_reduce(state,data,6,0);
    pushFN(data,$expression_goto);
    return 13;
    /*3205c0ded576131ea255ad2bd38b0fb2*/
}
function branch_32c16ff65f0c4c5c(l,data,state,prod,puid){
    add_reduce(state,data,1,2);
    pushFN(data,$def$octal_token_HC_listbody1_110_goto);
    return 46;
    /*32c16ff65f0c4c5cbe0a9d1a99a76917*/
}
function branch_32cfac86e44021aa(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*51:139 def$string_value_group_071_112=>• θws*/
    puid |=8;
    consume(l,data,state);
    return prod;
    return -1;
    /*32cfac86e44021aabad4f6a9702c6a6d*/
}
function branch_33110ec465cce631(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*38:107 def$hex_token_group_044_104=>• E*/
    puid |=2048;
    consume(l,data,state);
    return prod;
    return -1;
    /*33110ec465cce631e4ce40eccf3a7c57*/
}
function branch_356e3bde34ad469f(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*50:134 def$string_token=>def$string_token • def$string_value*/
    puid |=2;
    pushFN(data1,branch_2568ca3904a27972);
    pushFN(data3,$def$string_value);
    return puid;
    return -1;
    return -1;
    /*356e3bde34ad469f9f4df744a38134e6*/
}
function branch_35fe06c0433d357f(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*28:81 def$hex_digit=>• τE*/
    puid |=2048;
    consume(l,data,state);
    return prod;
    return -1;
    /*35fe06c0433d357f0d714a9ac3a96825*/
}
function branch_360209ba110cf999(l,data,state,prod,puid){
    pushFN(data,$closure_goto);
    return 20;
    /*360209ba110cf9997adb1c305ef742ea*/
}
function branch_36e8090044886c4c(l,data,state,prod,puid){
    /*12:24 unary=>closure • --
    12:25 unary=>closure • ++
    12:26 unary=>closure •*/
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(/*[--]*/cmpr_set(l,data,6,2,2)){
        pushFN(data,branch_3205c0ded576131e);
        return branch_8ffa5b2550ac5b1a(l,data,state,prod,2);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else if(!(/*[++]*/cmpr_set(l,data,4,2,2))||(l.current_byte==43/*[+]*/)){
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*12:26 unary=>closure •*/
        prod = 12;
        continue;;
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(/*[++]*/cmpr_set(l,data,4,2,2)){
        pushFN(data,branch_9e0d908cde5fc8cf);
        return branch_68e4c3bb339bc0b3(l,data,state,prod,2);
    }
    return -1;
    /*36e8090044886c4c6c44a6d54241fb1b*/
}
function branch_37335f44f4748896(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*38:97 def$hex_token_group_044_104=>• a*/
    puid |=2;
    consume(l,data,state);
    return prod;
    return -1;
    /*37335f44f4748896513b2089aac68e30*/
}
function branch_375ff6bb19ad7447(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*27:67 def$defaultproduction=>• def$octal*/
    puid |=8;
    pushFN(data1,branch_1f9ddf3c27180aa0);
    pushFN(data3,$def$octal);
    return puid;
    return -1;
    /*375ff6bb19ad744793229b08a86c9783*/
}
function branch_392167c0733bccc6(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*27:69 def$defaultproduction=>• def$string*/
    puid |=32;
    pushFN(data1,branch_1f9ddf3c27180aa0);
    pushFN(data3,$def$string);
    return puid;
    return -1;
    /*392167c0733bccc622f1e067c52f1df6*/
}
function branch_3bdf434b5778a3c9(l,data,state,prod,puid){
    add_reduce(state,data,2,5);
    return prod;
    /*3bdf434b5778a3c906dd44308e283198*/
}
function branch_3d90cbf905d60205(l,data,state,prod,puid){
    return 15;
    /*3d90cbf905d60205e401fd89b68409b3*/
}
function branch_3ea38decf42bcbd1(l,data,state,prod,puid){
    pushFN(data,$expression_goto);
    return 6;
    /*3ea38decf42bcbd1b54b98a44644b581*/
}
function branch_3fbc5a7d58ed794e(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*42:114 def$binary_token_HC_listbody1_107=>def$binary_token_HC_listbody1_107 • def$binary_token_group_047_106*/
    puid |=2;
    pushFN(data1,branch_2568ca3904a27972);
    pushFN(data3,$def$binary_token_group_047_106);
    return puid;
    return -1;
    return -1;
    /*3fbc5a7d58ed794e55ca0ca76be1f208*/
}
function branch_3ff78bcd6d844082(l,data,state,prod,puid){
    add_reduce(state,data,1,2);
    pushFN(data,$def$binary_token_HC_listbody1_107_goto);
    return 42;
    /*3ff78bcd6d844082e0ffc56b85cdf840*/
}
function branch_405a6f3334254c06(l,data,state,prod,puid){
    skip_41e306b5d22e0b8a(l/*[ num ][ 23 ][ nl ]*/,data,true);
    puid |=2;
    pushFN(data1,branch_5677e1e47f0debe5);
    pushFN(data3,$def$octal_token_HC_listbody1_110);
    return puid;
    return -1;
    /*405a6f3334254c0694f84f9bffa8abb1*/
}
function branch_408ea13cae24275e(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*28:75 def$hex_digit=>• τe*/
    puid |=32;
    consume(l,data,state);
    return prod;
    return -1;
    /*408ea13cae24275ebda2f240fd46ea93*/
}
function branch_41dd6edc9d94aedc(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*60:168 virtual-36:6:1|--lvl:0=>fnB_group_026_104 • identifier reserved_word θactive blocks*/
    puid |=1;
    pushFN(data1,branch_c5ee3c5c2e0b4835);
    pushFN(data3,$def$js_identifier);
    return puid;
    /*41dd6edc9d94aedc321dd9dce3441846*/
}
function branch_41ff52b1bc0fd96e(l,data,state,prod,puid){
    add_reduce(state,data,3,0);
    return prod;
    /*41ff52b1bc0fd96eb7dd8c252a6f7e4b*/
}
function branch_429b6eb39ea905e9(l,data,state,prod,puid){
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=4;
    pushFN(data1,branch_8e6eb97f727bd345);
    pushFN(data3,$reserved_word);
    return puid;
    return -1;
    /*429b6eb39ea905e967d524d43223e528*/
}
function branch_43e59f30776c2366(l,data,state,prod,puid){
    return 24;
    /*43e59f30776c2366f0b2b4267fd2ee28*/
}
function branch_4554c92ac9ee7370(l,data,state,prod,puid){
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=4;
    if((l.current_byte==93/*[]]*/)&&consume(l,data,state)){
        add_reduce(state,data,3,0);
        return prod;
    }
    return -1;
    /*4554c92ac9ee737055e065fbc6c53e5f*/
}
function branch_45b5a3d639c0c54a(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*56:152 def$js_id_symbols=>def$js_id_symbols • _*/
    puid |=4;
    consume(l,data,state);
    add_reduce(state,data,2,5);
    return prod;
    return -1;
    return -1;
    /*45b5a3d639c0c54ae403d78090c84ee8*/
}
function branch_45d514e8ca635a5b(l,data,state,prod,puid){
    add_reduce(state,data,1,6);
    pushFN(data,$def$string_value_goto);
    return 54;
    /*45d514e8ca635a5b238bbb430574b9a8*/
}
function branch_46c0b51c8437e465(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
    /*10:18 additive=>multiplicative • + additive*/
    puid |=2;
    consume(l,data,state);
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=4;
    pushFN(data1,branch_41ff52b1bc0fd96e);
    pushFN(data3,$additive);
    return puid;
    return -1;
    return -1;
    /*46c0b51c8437e465b66b8bfa3593018d*/
}
function branch_47111c0f4d627e5f(l,data,state,prod,puid){
    add_reduce(state,data,1,6);
    pushFN(data,$def$string_value_HC_listbody2_114_goto);
    return 53;
    /*47111c0f4d627e5f00f8f6335e35cbc9*/
}
function branch_4743ed6f49357bf9(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*45:126 def$octal_token_group_058_109=>• 7*/
    puid |=128;
    consume(l,data,state);
    return prod;
    return -1;
    /*4743ed6f49357bf97575bd289777ae48*/
}
function branch_47b716891c38b543(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*58:164 def$identifier_symbols=>• _*/
    puid |=4;
    consume(l,data,state);
    return prod;
    return -1;
    /*47b716891c38b543e62a93db3c97d2b9*/
}
function branch_480872a42458ede1(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*3:5 blocks=>blocks • & blocks_group_22_100*/
    puid |=2;
    consume(l,data,state);
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=4;
    pushFN(data1,branch_d2df981d115c0c94);
    pushFN(data3,$blocks_group_22_100);
    return puid;
    return -1;
    return -1;
    /*480872a42458ede1b5a321f47e322c52*/
}
function branch_48c9f5655e4967e5(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*34:89 def$scientific_token_group_228_102=>def$scientific_token_group_027_101 • - θnum*/
    puid |=2;
    consume(l,data,state);
    skip_a391223c0048eca8(l/*[ ws ][ 23 ][ nl ]*/,data,true);
    puid |=4;
    if(l.isNum(data)&&consume(l,data,state)){
        add_reduce(state,data,3,0);
        return prod;
    }
    return -1;
    /*48c9f5655e4967e566429ce3d5d9d8b3*/
}
function branch_48eee5a8b7b20ac6(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*27:65 def$defaultproduction=>• def$hex*/
    puid |=2;
    pushFN(data1,branch_1f9ddf3c27180aa0);
    pushFN(data3,$def$hex);
    return puid;
    return -1;
    /*48eee5a8b7b20ac6260409d10b368a5c*/
}
function branch_499ca913f0560dae(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*38:101 def$hex_token_group_044_104=>• e*/
    puid |=32;
    consume(l,data,state);
    return prod;
    return -1;
    /*499ca913f0560daebefde11b225aff6c*/
}
function branch_4a07849d9379ebd9(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*38:96 def$hex_token_group_044_104=>• θnum*/
    puid |=1;
    consume(l,data,state);
    return prod;
    return -1;
    /*4a07849d9379ebd92421c550201abba2*/
}
function branch_4afbc65c2a545063(l,data,state,prod,puid){
    return 10;
    /*4afbc65c2a545063c50f41dcc262be24*/
}
function branch_4bae298d266a2064(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*21:53 comment_group_045_106=>• θws*/
    puid |=8;
    consume(l,data,state);
    return prod;
    return -1;
    /*4bae298d266a206448f20457a9c777df*/
}
function branch_4c9cc06d1347d38a(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*28:71 def$hex_digit=>• τa*/
    puid |=2;
    consume(l,data,state);
    return prod;
    return -1;
    /*4c9cc06d1347d38a1de2a45415bea97c*/
}
function branch_4e21588bca1f3fc9(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*38:108 def$hex_token_group_044_104=>• F*/
    puid |=4096;
    consume(l,data,state);
    return prod;
    return -1;
    /*4e21588bca1f3fc908aaa17266d1ab7d*/
}
function branch_5017c84d418643ed(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$expression_goto);
    return 11;
    /*5017c84d418643edcc1b663cab1f5e8a*/
}
function branch_513086d6ea5b82aa(l,data,state,prod,puid){
    add_reduce(state,data,1,2);
    pushFN(data,$def$defaultproductions_HC_listbody1_100_goto);
    return 25;
    /*513086d6ea5b82aa62dea203beb0291b*/
}
function branch_5177f82fd659c862(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*45:119 def$octal_token_group_058_109=>• 0*/
    puid |=1;
    consume(l,data,state);
    return prod;
    return -1;
    /*5177f82fd659c862a49aa97220d8329e*/
}
function branch_51c7426fffbcf37f(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*28:74 def$hex_digit=>• τd*/
    puid |=16;
    consume(l,data,state);
    return prod;
    return -1;
    /*51c7426fffbcf37fdacbf82cd42c65ce*/
}
function branch_532758d58e229ba9(l,data,state,prod,puid){
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=1;
    pushFN(data1,branch_d115714366c1d3f6);
    pushFN(data3,$def$js_identifier);
    return puid;
    return -1;
    /*532758d58e229ba9f4048816bedaaa26*/
}
function branch_5677e1e47f0debe5(l,data,state,prod,puid){
    add_reduce(state,data,2,0);
    return 47;
    /*5677e1e47f0debe5ef3af3e10dd5d1c3*/
}
function branch_56938ce1a95a1c1a(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*58:160 def$identifier_symbols=>def$identifier_symbols • _*/
    puid |=4;
    consume(l,data,state);
    add_reduce(state,data,2,5);
    return prod;
    return -1;
    return -1;
    /*56938ce1a95a1c1a9319738190bf6c54*/
}
function branch_581583e410a9d2ce(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*48:131 def$string=>• ' def$string_token '*/
    puid |=4;
    consume(l,data,state);
    skip_1a45429b83435415(l/*[ 23 ][ nl ]*/,data,true);
    puid |=2;
    pushFN(data1,branch_a16461ceea0a298e);
    pushFN(data3,$def$string_token);
    return puid;
    return -1;
    /*581583e410a9d2cebff96b6643d83c94*/
}
function branch_5b6c4e9dd6e0d7ac(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*44:117 def$octal_token_group_050_108=>• 0o*/
    puid |=1;
    consume(l,data,state);
    return prod;
    return -1;
    /*5b6c4e9dd6e0d7ac4753625647c012a2*/
}
function branch_5cb6155cd0b28085(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*26:62 def$defaultproductions=>def$defaultproductions • θws def$defaultproduction*/
    puid |=2;
    consume(l,data,state);
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=4;
    pushFN(data1,branch_d2df981d115c0c94);
    pushFN(data3,$def$defaultproduction);
    return puid;
    return -1;
    return -1;
    /*5cb6155cd0b28085a1cbf8e60c8c13ff*/
}
function branch_5d41fe0149df9210(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*27:68 def$defaultproduction=>• def$identifier*/
    puid |=16;
    pushFN(data1,branch_1f9ddf3c27180aa0);
    pushFN(data3,$def$identifier);
    return puid;
    return -1;
    /*5d41fe0149df9210abf05812c00e663a*/
}
function branch_5ecc1b0455a1fee7(l,data,state,prod,puid){
    pushFN(data,$expression_goto);
    return 20;
    /*5ecc1b0455a1fee7c05cf089aa5edd9e*/
}
function branch_603d19d840e04474(l,data,state,prod,puid){
    return 28;
    /*603d19d840e044740538584f7ede8eeb*/
}
function branch_6330ec7a5b95b490(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$def$js_id_symbols_goto);
    return 56;
    /*6330ec7a5b95b4903374f5cb6e2507d7*/
}
function branch_6418dcb2961dec9f(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*61:169 virtual-167:5:1|--lvl:1=>• identifier reserved_word θvoid blocks*/
    puid |=1;
    pushFN(data1,branch_429b6eb39ea905e9);
    pushFN(data3,$def$js_identifier);
    return puid;
    return -1;
    /*6418dcb2961dec9f8affb43acbfe63a5*/
}
function branch_64c6db0043a95bab(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*15:35 fnB_group_026_104=>• >=*/
    puid |=2;
    consume(l,data,state);
    return prod;
    return -1;
    /*64c6db0043a95bab471f2be5c2be4a52*/
}
function branch_660937025204b103(l,data,state,prod,puid){
    add_reduce(state,data,1,2);
    pushFN(data,$expressions_HC_listbody1_102_goto);
    return 4;
    /*660937025204b10345f9f78296a67210*/
}
function branch_664f929ed263db42(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*17:40 literal=>• def$octal*/
    puid |=8;
    pushFN(data1,branch_1f9ddf3c27180aa0);
    pushFN(data3,$def$octal);
    return puid;
    return -1;
    /*664f929ed263db425bef54ed375eb2b5*/
}
function branch_68e4c3bb339bc0b3(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*12:25 unary=>closure • ++*/
    puid |=1;
    consume(l,data,state);
    add_reduce(state,data,2,0);
    return prod;
    return -1;
    return -1;
    /*68e4c3bb339bc0b32bb82964975c5f28*/
}
function branch_691ae7300bee27bf(l,data,state,prod,puid){
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=1;
    pushFN(data1,branch_9b0ff9d3b6c43611);
    pushFN(data3,$def$js_identifier);
    return puid;
    return -1;
    /*691ae7300bee27bffcfb81c910c438c0*/
}
function branch_6930f2dc4c926fa3(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*17:39 literal=>• def$binary*/
    puid |=4;
    pushFN(data1,branch_1f9ddf3c27180aa0);
    pushFN(data3,$def$binary);
    return puid;
    return -1;
    /*6930f2dc4c926fa32c1c6cad521d3871*/
}
function branch_6978cae11a6552b2(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*28:72 def$hex_digit=>• τb*/
    puid |=4;
    consume(l,data,state);
    return prod;
    return -1;
    /*6978cae11a6552b2b798c07c3a76197d*/
}
function branch_69d7de832d4bcac4(l,data,state,prod,puid){
    add_reduce(state,data,1,2);
    pushFN(data,$def$defaultproductions_goto);
    return 26;
    /*69d7de832d4bcac4285f7f8752078a32*/
}
function branch_69f3b07784067b13(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*16:36 fnB=>identifier • fnB_group_026_104 identifier reserved_word θactive blocks*/
    puid |=2;
    pushFN(data1,branch_6c5298264f05fb04);
    pushFN(data3,$fnB_group_026_104);
    return puid;
    return -1;
    return -1;
    /*69f3b07784067b132e158d9bf1e51ef6*/
}
function branch_6a866010abea12c8(l,data,state,prod,puid){
    return 23;
    /*6a866010abea12c89482c09de5aa94c1*/
}
function branch_6b21d5a0d5035df5(l,data,state,prod,puid){
    /*79:187 virtual-33:6:1|--lvl:0=>• => identifier reserved_word θvoid blocks
    80:188 virtual-36:6:1|--lvl:0=>• fnB_group_026_104 identifier reserved_word θactive blocks*/
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(/*[=>]*/cmpr_set(l,data,10,2,2)){
        /*79:187 virtual-33:6:1|--lvl:0=>• => identifier reserved_word θvoid blocks
        15:34 fnB_group_026_104=>• =>*/
        /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
        consume(l,data,state);
        puid |=2;
        /*79:187 virtual-33:6:1|--lvl:0=>=> • identifier reserved_word θvoid blocks
        15:34 fnB_group_026_104=>=> •*/
        skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
        /*⤋⤋⤋ peek-unresolved ⤋⤋⤋*/
        if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
            /*-------------VPROD-------------------------*/
            /*79:187 virtual-33:6:1|--lvl:0=>=> • identifier reserved_word θvoid blocks
            15:34 fnB_group_026_104=>=> •*/
            pushFN(data,branch_b719eab0baa8cc3f);
            return 0;
        }
    }
    return -1;
    /*6b21d5a0d5035df5b725d67587907fe1*/
}
function branch_6b7e12f34652d379(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*1:2 blocks_group_22_100=>[ • ]*/
    puid |=4;
    consume(l,data,state);
    add_reduce(state,data,2,0);
    return prod;
    return -1;
    /*6b7e12f34652d3799a7af9cced76a7d3*/
}
function branch_6bffe2b7f9da4ffd(l,data,state,prod,puid){
    return 44;
    /*6bffe2b7f9da4ffd8df7d75fb9f0ae3d*/
}
function branch_6c5298264f05fb04(l,data,state,prod,puid){
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=1;
    pushFN(data1,branch_e7fb51722bf71275);
    pushFN(data3,$def$js_identifier);
    return puid;
    return -1;
    /*6c5298264f05fb04e373eedcf7ea591d*/
}
function branch_6d8044605cfe2254(l,data,state,prod,puid){
    add_reduce(state,data,1,2);
    pushFN(data,$def$string_token_HC_listbody3_111_goto);
    return 49;
    /*6d8044605cfe225462f1f496e86e3e80*/
}
function branch_6df401b0a0db4a8c(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*38:99 def$hex_token_group_044_104=>• c*/
    puid |=8;
    consume(l,data,state);
    return prod;
    return -1;
    /*6df401b0a0db4a8c7a164e6abf58f7fa*/
}
function branch_6ea5587bedf07118(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*56:156 def$js_id_symbols=>• $*/
    puid |=8;
    consume(l,data,state);
    return prod;
    return -1;
    /*6ea5587bedf071186d4d41d260d69c54*/
}
function branch_6f5cc2aafed76b71(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*52:142 def$string_value_group_172_113=>• θid*/
    puid |=2;
    consume(l,data,state);
    return prod;
    return -1;
    /*6f5cc2aafed76b713abff0940ceee0ab*/
}
function branch_6f8d4d65a823b0cf(l,data,state,prod,puid){
    add_reduce(state,data,1,2);
    pushFN(data,$id_sequence_goto);
    return 8;
    /*6f8d4d65a823b0cf0cdbc72c2607c106*/
}
function branch_710629940f6173f7(l,data,state,prod,puid){
    add_reduce(state,data,1,2);
    pushFN(data,$blocks_goto);
    return 3;
    /*710629940f6173f74a71d8a8312c66ab*/
}
function branch_71eef275b5ae193c(l,data,state,prod,puid){
    return 35;
    /*71eef275b5ae193c299d6ce060006b6f*/
}
function branch_720a6963212b8031(l,data,state,prod,puid){
    return 18;
    /*720a6963212b8031bdad1d574944cf7d*/
}
function branch_72348d66249b777e(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*45:122 def$octal_token_group_058_109=>• 3*/
    puid |=8;
    consume(l,data,state);
    return prod;
    return -1;
    /*72348d66249b777e98988bcef84b80db*/
}
function branch_735080cef15756c8(l,data,state,prod,puid){
    return 9;
    /*735080cef15756c8a52ab7a3ec95c2c1*/
}
function branch_73df4fa2a9e9bee1(l,data,state,prod,puid){
    return 48;
    /*73df4fa2a9e9bee1744f8587dac49594*/
}
function branch_752594a82e956202(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*58:162 def$identifier_symbols=>def$identifier_symbols • $*/
    puid |=16;
    consume(l,data,state);
    add_reduce(state,data,2,5);
    return prod;
    return -1;
    return -1;
    /*752594a82e95620258715a3ded0d6f3d*/
}
function branch_7589d196fa8431fc(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*56:151 def$js_id_symbols=>def$js_id_symbols • θid*/
    puid |=2;
    consume(l,data,state);
    add_reduce(state,data,2,5);
    return prod;
    return -1;
    return -1;
    /*7589d196fa8431fc7d746f62ed918a1a*/
}
function branch_7737f48ce5df0b93(l,data,state,prod,puid){
    return 17;
    /*7737f48ce5df0b93a393610a78845b59*/
}
function branch_78fd50053d9df479(l,data,state,prod,puid){
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=4;
    pushFN(data1,branch_eb1832156ba2e37d);
    pushFN(data3,$reserved_word);
    return puid;
    return -1;
    /*78fd50053d9df47910fd3c74ba78feb2*/
}
function branch_7944504494b74c83(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*28:79 def$hex_digit=>• τC*/
    puid |=512;
    consume(l,data,state);
    return prod;
    return -1;
    /*7944504494b74c83acc488d3d0985d1b*/
}
function branch_7981387988817612(l,data,state,prod,puid){
    add_reduce(state,data,2,5);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$def$string_value_HC_listbody2_114_goto);
    return 53;
    /*79813879888176121d6f5f7f6fe3fad2*/
}
function branch_7b42329645c94739(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*38:98 def$hex_token_group_044_104=>• b*/
    puid |=4;
    consume(l,data,state);
    return prod;
    return -1;
    /*7b42329645c94739bb3a13341377e45a*/
}
function branch_7cb831b3ecb387cd(l,data,state,prod,puid){
    add_reduce(state,data,1,2);
    pushFN(data,$comment_HC_listbody1_107_goto);
    return 22;
    /*7cb831b3ecb387cd1e7cac65ed57de5f*/
}
function branch_7cc3b86200fe9cff(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*18:46 reserved_word=>• private*/
    puid |=16;
    consume(l,data,state);
    return prod;
    return -1;
    /*7cc3b86200fe9cff64f6f1339dfbc3d3*/
}
function branch_7dcd4e56969f4413(l,data,state,prod,puid){
    return 11;
    /*7dcd4e56969f44130342b866c7e73e16*/
}
function branch_7e5db33ab38760b2(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*39:109 def$hex_token_HC_listbody1_105=>def$hex_token_HC_listbody1_105 • def$hex_token_group_044_104*/
    puid |=2;
    pushFN(data1,branch_2568ca3904a27972);
    pushFN(data3,$def$hex_token_group_044_104);
    return puid;
    return -1;
    return -1;
    /*7e5db33ab38760b209dc14703a27b6ff*/
}
function branch_7fe3eae917c31513(l,data,state,prod,puid){
    return 19;
    /*7fe3eae917c31513a9ca9681abae581a*/
}
function branch_802f96b401835633(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*45:121 def$octal_token_group_058_109=>• 2*/
    puid |=4;
    consume(l,data,state);
    return prod;
    return -1;
    /*802f96b401835633eb3eb632bd44b16e*/
}
function branch_809cf9e5b4c911c0(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$id_sequence_goto);
    return 8;
    /*809cf9e5b4c911c02ea5c3fbb7384e13*/
}
function branch_85f05d5c20628d5b(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*28:82 def$hex_digit=>• τF*/
    puid |=4096;
    consume(l,data,state);
    return prod;
    return -1;
    /*85f05d5c20628d5bec419283f97765cc*/
}
function branch_864448a27e005a7c(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
    /*11:20 multiplicative=>unary • + additive*/
    puid |=2;
    consume(l,data,state);
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=4;
    pushFN(data1,branch_41ff52b1bc0fd96e);
    pushFN(data3,$additive);
    return puid;
    return -1;
    return -1;
    /*864448a27e005a7cf7040b55f7909a22*/
}
function branch_8674238ec147c066(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*5:9 expressions=>expressions • , expression*/
    puid |=2;
    consume(l,data,state);
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=4;
    pushFN(data1,branch_d2df981d115c0c94);
    pushFN(data3,$expression);
    return puid;
    return -1;
    return -1;
    /*8674238ec147c066b5a94c9ddf9002a4*/
}
function branch_87455207ddf57c93(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*17:37 literal=>• identifier*/
    puid |=1;
    pushFN(data1,branch_1f9ddf3c27180aa0);
    pushFN(data3,$def$js_identifier);
    return puid;
    return -1;
    /*87455207ddf57c93dc5f4545931e47d6*/
}
function branch_87e8402495867cb0(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$expressions_goto);
    return 5;
    /*87e8402495867cb06e4db9fea8199258*/
}
function branch_88b494782d31573a(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*58:166 def$identifier_symbols=>• θid*/
    puid |=2;
    consume(l,data,state);
    return prod;
    return -1;
    /*88b494782d31573aee692c807704b5cc*/
}
function branch_8b46815c0b6f87a9(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$blocks_goto);
    return 3;
    /*8b46815c0b6f87a99537720b13a02c6a*/
}
function branch_8c506c3da724ba2f(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*23:57 comment=>/* • comment_HC_listbody1_107 * /*/
    puid |=2;
    pushFN(data1,branch_9edf75ba21706368);
    pushFN(data3,$comment_HC_listbody1_107);
    return puid;
    return -1;
    /*8c506c3da724ba2fc565b6766ed640d6*/
}
function branch_8cbf7fbd4d0eebd8(l,data,state,prod,puid){
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=32;
    if((l.current_byte==93/*[]]*/)&&consume(l,data,state)){
        add_reduce(state,data,3,0);
        pushFN(data,$closure_goto);
        return 13;
    }
    return -1;
    /*8cbf7fbd4d0eebd8be7bf218e5a754d6*/
}
function branch_8d0ec6cb288eafb4(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*13:27 closure=>• ( expressions )*/
    puid |=1;
    consume(l,data,state);
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=2;
    pushFN(data1,branch_c78a2608ed47c8fe);
    pushFN(data3,$expressions);
    return puid;
    return -1;
    /*8d0ec6cb288eafb4b3857d096050fb88*/
}
function branch_8e481b910ee2b69a(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*35:91 def$scientific_token=>def$float_token • def$scientific_token_group_228_102*/
    puid |=2;
    pushFN(data1,branch_f3c5df3271892b40);
    pushFN(data3,$def$scientific_token_group_228_102);
    return puid;
    return -1;
    /*8e481b910ee2b69aace01cca9fe08b8b*/
}
function branch_8e6eb97f727bd345(l,data,state,prod,puid){
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=8;
    if(false&&consume(l,data,state)){
        skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
        puid |=16;
        pushFN(data1,branch_1f9ddf3c27180aa0);
        pushFN(data3,$blocks);
        return puid;
    }
    return -1;
    /*8e6eb97f727bd34537463a6abda35156*/
}
function branch_8ea29ecc5c1ef510(l,data,state,prod,puid){
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=8;
    if(false&&consume(l,data,state)){
        skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
        puid |=16;
        pushFN(data1,branch_d53acfe642cefcf7);
        pushFN(data3,$blocks);
        return puid;
    }
    return -1;
    /*8ea29ecc5c1ef51092efcff8dd2e1312*/
}
function branch_8f8ccebd90df3669(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*15:34 fnB_group_026_104=>• =>*/
    puid |=1;
    consume(l,data,state);
    return prod;
    return -1;
    /*8f8ccebd90df3669f838421d9d2e9788*/
}
function branch_8f932f9f300ead18(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*22:55 comment_HC_listbody1_107=>comment_HC_listbody1_107 • comment_group_045_106*/
    puid |=2;
    pushFN(data1,branch_2568ca3904a27972);
    pushFN(data3,$comment_group_045_106);
    return puid;
    return -1;
    return -1;
    /*8f932f9f300ead18298b63c31f921be8*/
}
function branch_8ffa5b2550ac5b1a(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*12:24 unary=>closure • --*/
    puid |=4;
    consume(l,data,state);
    add_reduce(state,data,2,0);
    return prod;
    return -1;
    return -1;
    /*8ffa5b2550ac5b1a7ad8b512a7cdcdc4*/
}
function branch_92ccdeac69bd1cbd(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*1:1 blocks_group_22_100=>[ • expressions ]*/
    puid |=2;
    pushFN(data1,branch_9ab7f1d25dae8919);
    pushFN(data3,$expressions);
    return puid;
    /*92ccdeac69bd1cbdc9f2ee9e31a7af76*/
}
function branch_9481f6bfa7c58125(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*41:112 def$binary_token_group_047_106=>• 0*/
    puid |=1;
    consume(l,data,state);
    return prod;
    return -1;
    /*9481f6bfa7c5812563efb9b2912bebdd*/
}
function branch_952c501382c49da3(l,data,state,prod,puid){
    return 0;
    /*952c501382c49da35d2c26e433279d89*/
}
function branch_95bffdb621cd63c5(l,data,state,prod,puid){
    pushFN(data,$closure_goto);
    return 13;
    /*95bffdb621cd63c52270edc8d4139e16*/
}
function branch_98a313cc99318ecc(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*55:150 def$js_identifier=>• tk:def$js_id_symbols*/
    puid |=1;
    pushFN(data1,branch_1f9ddf3c27180aa0);
    pushFN(data2,$def$js_identifier);
    return puid;
    return -1;
    /*98a313cc99318ecc2d0480332127d957*/
}
function branch_9a8e67dbf14cb1cc(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*23:58 comment=>/* • * /*/
    puid |=4;
    consume(l,data,state);
    add_reduce(state,data,2,0);
    return prod;
    return -1;
    /*9a8e67dbf14cb1cc7ef117b458eee692*/
}
function branch_9ab7f1d25dae8919(l,data,state,prod,puid){
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=4;
    if((l.current_byte==93/*[]]*/)&&consume(l,data,state)){
        add_reduce(state,data,3,0);
        pushFN(data,$closure_goto);
        return 3;
    }
    return -1;
    /*9ab7f1d25dae8919a7d9aa82b4b1f7c2*/
}
function branch_9b0ff9d3b6c43611(l,data,state,prod,puid){
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=4;
    pushFN(data1,branch_b4b9a3616cbddffd);
    pushFN(data3,$reserved_word);
    return puid;
    return -1;
    /*9b0ff9d3b6c43611b9b8f092debcba4f*/
}
function branch_9b7d08ac86af3b88(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*18:42 reserved_word=>• if*/
    puid |=1;
    consume(l,data,state);
    return prod;
    return -1;
    /*9b7d08ac86af3b88f1d39557db8097b3*/
}
function branch_9b8603456683d69e(l,data,state,prod,puid){
    add_reduce(state,data,3,1);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$expressions_HC_listbody1_102_goto);
    return 4;
    /*9b8603456683d69e734b6d459c044c03*/
}
function branch_9d915508a4633d80(l,data,state,prod,puid){
    /*10:18 additive=>multiplicative • + additive
    10:19 additive=>multiplicative •*/
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
    if(l.current_byte==43/*[+]*/){
        pushFN(data,branch_4afbc65c2a545063);
        return branch_9e345de404161a56(l,data,state,prod,1);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*10:19 additive=>multiplicative •*/
        return 10;
    }
    return -1;
    /*9d915508a4633d80ea3cb1c444ca5d8f*/
}
function branch_9e0d908cde5fc8cf(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$expression_goto);
    return 12;
    /*9e0d908cde5fc8cfd03c03df37731462*/
}
function branch_9e345de404161a56(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
    /*10:18 additive=>multiplicative • + additive*/
    puid |=2;
    consume(l,data,state);
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=4;
    pushFN(data1,branch_41ff52b1bc0fd96e);
    pushFN(data3,$additive);
    return puid;
    return -1;
    /*9e345de404161a56dae3f75c53e6f800*/
}
function branch_9edf75ba21706368(l,data,state,prod,puid){
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=4;
    if(/*[asterisk/]*/cmpr_set(l,data,14,2,2)&&consume(l,data,state)){
        add_reduce(state,data,3,0);
        return prod;
    }
    return -1;
    /*9edf75ba217063689adb80f8a7482548*/
}
function branch_9f99f0dc14c474c1(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*33:88 def$scientific_token_group_027_101=>• E*/
    puid |=2;
    consume(l,data,state);
    return prod;
    return -1;
    /*9f99f0dc14c474c168d59f41e665639d*/
}
function branch_9fcdb8f4bf446802(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*34:90 def$scientific_token_group_228_102=>def$scientific_token_group_027_101 • θnum*/
    puid |=4;
    consume(l,data,state);
    add_reduce(state,data,2,0);
    return prod;
    return -1;
    /*9fcdb8f4bf446802425b99122d9c32f1*/
}
function branch_a12e8ce91807e9a5(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$closure_goto);
    return 3;
    /*a12e8ce91807e9a533e73ca8b777e08f*/
}
function branch_a16461ceea0a298e(l,data,state,prod,puid){
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=4;
    if((l.current_byte==39/*[']*/)&&consume(l,data,state)){
        add_reduce(state,data,3,4);
        return prod;
    }
    return -1;
    /*a16461ceea0a298ed5d9ca6d760440bc*/
}
function branch_a37bd75dfdfa5e41(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*28:70 def$hex_digit=>• θnum*/
    puid |=1;
    consume(l,data,state);
    return prod;
    return -1;
    /*a37bd75dfdfa5e41ef68d36bb263d8ab*/
}
function branch_a3b388d5be971f55(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*27:64 def$defaultproduction=>• def$number*/
    puid |=1;
    pushFN(data1,branch_1f9ddf3c27180aa0);
    pushFN(data3,$def$number);
    return puid;
    return -1;
    /*a3b388d5be971f5536fdc6649149fd07*/
}
function branch_a3bb1039c7409cb7(l,data,state,prod,puid){
    add_reduce(state,data,2,0);
    return 43;
    /*a3bb1039c7409cb76468dd6a85253ae2*/
}
function branch_a491c3d95391604f(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*45:123 def$octal_token_group_058_109=>• 4*/
    puid |=16;
    consume(l,data,state);
    return prod;
    return -1;
    /*a491c3d95391604fc78f05a49dacc978*/
}
function branch_a5820cbcb1dc1e71(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*51:140 def$string_value_group_071_112=>• θnl*/
    puid |=16;
    consume(l,data,state);
    return prod;
    return -1;
    /*a5820cbcb1dc1e716dd7fa99a68e97de*/
}
function branch_aa0980f1a84edc4b(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$expression_goto);
    return 8;
    /*aa0980f1a84edc4badec2fe50063468a*/
}
function branch_ab63dff9a72416ad(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*28:80 def$hex_digit=>• τD*/
    puid |=1024;
    consume(l,data,state);
    return prod;
    return -1;
    /*ab63dff9a72416adc6096abe20645af5*/
}
function branch_ae0d573ccd784687(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*12:25 unary=>closure • ++*/
    puid |=1;
    consume(l,data,state);
    add_reduce(state,data,2,0);
    return prod;
    return -1;
    /*ae0d573ccd78468754f619c4e826eebd*/
}
function branch_aefbbcc3befb3344(l,data,state,prod,puid){
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=2;
    pushFN(data1,branch_532758d58e229ba9);
    pushFN(data3,$fnB_group_026_104);
    return puid;
    return -1;
    /*aefbbcc3befb3344d33c497f2dcf0dee*/
}
function branch_afe848085ed70cab(l,data,state,prod,puid){
    add_reduce(state,data,6,0);
    return 14;
    /*afe848085ed70cab03b24a3f352fd28c*/
}
function branch_b11cd2d9749d17dc(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*56:157 def$js_id_symbols=>• θid*/
    puid |=2;
    consume(l,data,state);
    return prod;
    return -1;
    /*b11cd2d9749d17dc370368927d2e4807*/
}
function branch_b1642434434a7c43(l,data,state,prod,puid){
    add_reduce(state,data,1,2);
    pushFN(data,$def$string_token_goto);
    return 50;
    /*b1642434434a7c438c0991adca59a664*/
}
function branch_b23c65bca0cf11f6(l,data,state,prod,puid){
    /*61:169 virtual-167:5:1|--lvl:1=>• identifier reserved_word θvoid blocks
    62:170 virtual-34:1:1|--lvl:1=>•*/
    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    if(!(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data))||l.END(data)){
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*62:170 virtual-34:1:1|--lvl:1=>•*/
        pushFN(data,branch_41dd6edc9d94aedc);
        return 15;
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else {
        pushFN(data,branch_3205c0ded576131e);
        return branch_6418dcb2961dec9f(l,data,state,prod,1);
    }
    return -1;
    /*b23c65bca0cf11f60505dba584ef3041*/
}
function branch_b417a0cea491d72c(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*27:66 def$defaultproduction=>• def$binary*/
    puid |=4;
    pushFN(data1,branch_1f9ddf3c27180aa0);
    pushFN(data3,$def$binary);
    return puid;
    return -1;
    /*b417a0cea491d72c4f783a14d41c8446*/
}
function branch_b4b9a3616cbddffd(l,data,state,prod,puid){
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=8;
    if(false&&consume(l,data,state)){
        skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
        puid |=16;
        pushFN(data1,branch_de3b71065ab2a33f);
        pushFN(data3,$blocks);
        return puid;
    }
    return -1;
    /*b4b9a3616cbddffdee34ec9a67206215*/
}
function branch_b4d93cfb34352f09(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$expression_goto);
    return 6;
    /*b4d93cfb34352f0945be6e4a2652d114*/
}
function branch_b5ac183ac62b8d9d(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*52:144 def$string_value_group_172_113=>• θws*/
    puid |=8;
    consume(l,data,state);
    return prod;
    return -1;
    /*b5ac183ac62b8d9dc336c2acaac471e3*/
}
function branch_b5ecc46624a85ae6(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*21:52 comment_group_045_106=>• θsym*/
    puid |=4;
    consume(l,data,state);
    return prod;
    return -1;
    /*b5ecc46624a85ae6fefa208a66e55a05*/
}
function branch_b719eab0baa8cc3f(l,data,state,prod,puid){
    /*81:189 virtual-187:5:1|--lvl:1=>• identifier reserved_word θvoid blocks
    82:190 virtual-34:1:1|--lvl:1=>•*/
    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    if(!(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data))||l.END(data)){
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*82:190 virtual-34:1:1|--lvl:1=>•*/
        pushFN(data,branch_d7eda89f396c87a1);
        return 15;
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else {
        pushFN(data,branch_3205c0ded576131e);
        return branch_2497256af0a7d670(l,data,state,prod,1);
    }
    return -1;
    /*b719eab0baa8cc3ff6ce15807c6c9f4f*/
}
function branch_b7dede1b8b1301e3(l,data,state,prod,puid){
    add_reduce(state,data,6,0);
    return 16;
    /*b7dede1b8b1301e3f426b0180129f409*/
}
function branch_b9f8e5d82f7d9108(l,data,state,prod,puid){
    return 52;
    /*b9f8e5d82f7d9108743dcfc464a19dfe*/
}
function branch_ba0188199e744db1(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*13:30 closure=>• blocks*/
    puid |=128;
    pushFN(data1,branch_1f9ddf3c27180aa0);
    pushFN(data3,$blocks);
    return puid;
    return -1;
    /*ba0188199e744db1616660762cbd72c7*/
}
function branch_ba1dfcfa496edada(l,data,state,prod,puid){
    /*11:20 multiplicative=>unary • + additive
    11:21 multiplicative=>unary •*/
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
    if(l.current_byte==43/*[+]*/){
        pushFN(data,branch_3205c0ded576131e);
        return branch_864448a27e005a7c(l,data,state,prod,1);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*11:21 multiplicative=>unary •*/
        prod = 11;
        continue;;
    }
    return -1;
    /*ba1dfcfa496edadad54516cb15d16d94*/
}
function branch_ba90c1f261436246(l,data,state,prod,puid){
    pushFN(data,$def$identifier_symbols_goto);
    return 58;
    /*ba90c1f261436246fc45d7ff4b1d16ba*/
}
function branch_bc1c3af3f8a28eba(l,data,state,prod,puid){
    add_reduce(state,data,2,0);
    return 40;
    /*bc1c3af3f8a28eba82806c7fe7eb0c15*/
}
function branch_bc1fc1a25a0352e5(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$def$string_value_goto);
    return 54;
    /*bc1fc1a25a0352e5ca0c878e92ba60eb*/
}
function branch_bd748bdc8b9ffed2(l,data,state,prod,puid){
    /*11:20 multiplicative=>unary • + additive
    11:21 multiplicative=>unary •*/
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
    if(l.current_byte==43/*[+]*/){
        pushFN(data,branch_7dcd4e56969f4413);
        return branch_ee4e777e8a444c1e(l,data,state,prod,1);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*11:21 multiplicative=>unary •*/
        return 11;
    }
    return -1;
    /*bd748bdc8b9ffed21b60e8045d36e169*/
}
function branch_bdcbba1d338025e3(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*38:104 def$hex_token_group_044_104=>• B*/
    puid |=256;
    consume(l,data,state);
    return prod;
    return -1;
    /*bdcbba1d338025e3de886649fbdccc3e*/
}
function branch_bef161f8414e5b0b(l,data,state,prod,puid){
    /*35:91 def$scientific_token=>def$float_token • def$scientific_token_group_228_102
    35:92 def$scientific_token=>def$float_token •*/
    skip_41e306b5d22e0b8a(l/*[ num ][ 23 ][ nl ]*/,data,true);
    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    if(!(l.current_byte==101/*[e]*/)||(l.current_byte==69/*[E]*/)){
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*35:92 def$scientific_token=>def$float_token •*/
        return 35;
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else {
        pushFN(data,branch_71eef275b5ae193c);
        return branch_8e481b910ee2b69a(l,data,state,prod,1);
    }
    return -1;
    /*bef161f8414e5b0b2accf0b42d91d15a*/
}
function branch_c077d972bc6da303(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*38:105 def$hex_token_group_044_104=>• C*/
    puid |=512;
    consume(l,data,state);
    return prod;
    return -1;
    /*c077d972bc6da30349991e5fff5c586c*/
}
function branch_c1b2da5638746a12(l,data,state,prod,puid){
    return 27;
    /*c1b2da5638746a12cc8c1232f773a065*/
}
function branch_c294508ee51f3b31(l,data,state,prod,puid){
    return 34;
    /*c294508ee51f3b31bf77962b7b6dab52*/
}
function branch_c31798adbb29ef00(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*58:163 def$identifier_symbols=>def$identifier_symbols • θnum*/
    puid |=32;
    consume(l,data,state);
    add_reduce(state,data,2,5);
    return prod;
    return -1;
    return -1;
    /*c31798adbb29ef0015f86722c0992c49*/
}
function branch_c3859feb35f63496(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*56:155 def$js_id_symbols=>• _*/
    puid |=4;
    consume(l,data,state);
    return prod;
    return -1;
    /*c3859feb35f634967d40706fb432a488*/
}
function branch_c3f8359bd507ae23(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*21:54 comment_group_045_106=>• θnl*/
    puid |=16;
    consume(l,data,state);
    return prod;
    return -1;
    /*c3f8359bd507ae23fcd3e3c2d847d01e*/
}
function branch_c48a0e3ff0974d75(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*45:120 def$octal_token_group_058_109=>• 1*/
    puid |=2;
    consume(l,data,state);
    return prod;
    return -1;
    /*c48a0e3ff0974d75512dedf5857277c5*/
}
function branch_c58b24a3a258302e(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*18:47 reserved_word=>• or*/
    puid |=32;
    consume(l,data,state);
    return prod;
    return -1;
    /*c58b24a3a258302e4df096981965c207*/
}
function branch_c5ee3c5c2e0b4835(l,data,state,prod,puid){
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=4;
    pushFN(data1,branch_8ea29ecc5c1ef510);
    pushFN(data3,$reserved_word);
    return puid;
    return -1;
    /*c5ee3c5c2e0b4835c59c1a3562db1ee8*/
}
function branch_c67fbbc7d9b5d48e(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*21:51 comment_group_045_106=>• θid*/
    puid |=2;
    consume(l,data,state);
    return prod;
    return -1;
    /*c67fbbc7d9b5d48e2d61d5dab4af636a*/
}
function branch_c78a2608ed47c8fe(l,data,state,prod,puid){
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=4;
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        add_reduce(state,data,3,0);
        return prod;
    }
    return -1;
    /*c78a2608ed47c8fef766fa0979b82650*/
}
function branch_c83f8f1b7a974cea(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*28:77 def$hex_digit=>• τA*/
    puid |=128;
    consume(l,data,state);
    return prod;
    return -1;
    /*c83f8f1b7a974ceac4e1126e3fb18304*/
}
function branch_c84a7c673a69b4b7(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*21:50 comment_group_045_106=>• θnum*/
    puid |=1;
    consume(l,data,state);
    return prod;
    return -1;
    /*c84a7c673a69b4b7d8884c37be34aec7*/
}
function branch_cabb1ebadf014f59(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*56:154 def$js_id_symbols=>def$js_id_symbols • θnum*/
    puid |=16;
    consume(l,data,state);
    add_reduce(state,data,2,5);
    return prod;
    return -1;
    return -1;
    /*cabb1ebadf014f59cb5752657ca200f7*/
}
function branch_cb18de2aaeb58a81(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*12:22 unary=>• ++ closure*/
    puid |=1;
    consume(l,data,state);
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=2;
    pushFN(data1,branch_f3c5df3271892b40);
    pushFN(data3,$closure);
    return puid;
    return -1;
    /*cb18de2aaeb58a81c5c6c5697abba2bc*/
}
function branch_ccbd2078ecfe001e(l,data,state,prod,puid){
    add_reduce(state,data,1,2);
    pushFN(data,$id_sequence_HC_listbody1_103_goto);
    return 7;
    /*ccbd2078ecfe001e6bc54c909214f772*/
}
function branch_cd0be914132510c9(l,data,state,prod,puid){
    return 33;
    /*cd0be914132510c9553b230d4fe082dd*/
}
function branch_ce8e5b3cfda6f6e6(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*1:1 blocks_group_22_100=>[ • expressions ]*/
    puid |=2;
    pushFN(data1,branch_4554c92ac9ee7370);
    pushFN(data3,$expressions);
    return puid;
    return -1;
    /*ce8e5b3cfda6f6e60dcdc8eee555e4fe*/
}
function branch_ceb5941866114e1d(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*33:87 def$scientific_token_group_027_101=>• e*/
    puid |=1;
    consume(l,data,state);
    return prod;
    return -1;
    /*ceb5941866114e1df07212e0d03f5ef3*/
}
function branch_cf4c76dad282dcb2(l,data,state,prod,puid){
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=8;
    if(false&&consume(l,data,state)){
        skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
        puid |=16;
        pushFN(data1,branch_00d179128876570a);
        pushFN(data3,$blocks);
        return puid;
    }
    return -1;
    /*cf4c76dad282dcb256042c51ba9be125*/
}
function branch_cf5c7dfb45fd7f44(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*46:127 def$octal_token_HC_listbody1_110=>def$octal_token_HC_listbody1_110 • def$octal_token_group_058_109*/
    puid |=2;
    pushFN(data1,branch_2568ca3904a27972);
    pushFN(data3,$def$octal_token_group_058_109);
    return puid;
    return -1;
    return -1;
    /*cf5c7dfb45fd7f441d48b10bffcf2554*/
}
function branch_d115714366c1d3f6(l,data,state,prod,puid){
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=4;
    pushFN(data1,branch_e1aca7f88b3a7ae8);
    pushFN(data3,$reserved_word);
    return puid;
    return -1;
    /*d115714366c1d3f6689ca1f6ac614af7*/
}
function branch_d1ab254073739e05(l,data,state,prod,puid){
    /*34:89 def$scientific_token_group_228_102=>def$scientific_token_group_027_101 • - θnum
    34:90 def$scientific_token_group_228_102=>def$scientific_token_group_027_101 • θnum*/
    skip_a391223c0048eca8(l/*[ ws ][ 23 ][ nl ]*/,data,true);
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(l.isNum(data)){
        pushFN(data,branch_c294508ee51f3b31);
        return branch_9fcdb8f4bf446802(l,data,state,prod,1);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==45/*[-]*/){
        pushFN(data,branch_c294508ee51f3b31);
        return branch_48c9f5655e4967e5(l,data,state,prod,1);
    }
    return -1;
    /*d1ab254073739e05be6d3d0461e29c08*/
}
function branch_d2df981d115c0c94(l,data,state,prod,puid){
    add_reduce(state,data,3,1);
    return prod;
    /*d2df981d115c0c94b52dda33f68a3001*/
}
function branch_d4bb848ab2ba8a25(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*44:118 def$octal_token_group_050_108=>• 0O*/
    puid |=2;
    consume(l,data,state);
    return prod;
    return -1;
    /*d4bb848ab2ba8a25ed2cb77588464ba0*/
}
function branch_d4e42c2d0ff8d130(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*48:130 def$string=>• " def$string_token "*/
    puid |=1;
    consume(l,data,state);
    skip_1a45429b83435415(l/*[ 23 ][ nl ]*/,data,true);
    puid |=2;
    pushFN(data1,branch_f9ae7be2d137547a);
    pushFN(data3,$def$string_token);
    return puid;
    return -1;
    /*d4e42c2d0ff8d130feaeeb994f9d4499*/
}
function branch_d53acfe642cefcf7(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    add_reduce(state,data,6,0);
    pushFN(data,$expression_goto);
    return 13;
    /*d53acfe642cefcf7aaaca47ebb15190c*/
}
function branch_d55d63e46b6b3aca(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*52:145 def$string_value_group_172_113=>• \ def$string_value_group_071_112*/
    puid |=16;
    consume(l,data,state);
    skip_93ed4c5eed930820(l/*[ 23 ]*/,data,true);
    puid |=32;
    pushFN(data1,branch_f3c5df3271892b40);
    pushFN(data3,$def$string_value_group_071_112);
    return puid;
    return -1;
    /*d55d63e46b6b3aca7a6c3564c4abb8bc*/
}
function branch_d745d950d914391f(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*28:73 def$hex_digit=>• τc*/
    puid |=8;
    consume(l,data,state);
    return prod;
    return -1;
    /*d745d950d914391f83640fcda0ab9fd5*/
}
function branch_d7eda89f396c87a1(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*80:188 virtual-36:6:1|--lvl:0=>fnB_group_026_104 • identifier reserved_word θactive blocks*/
    puid |=1;
    pushFN(data1,branch_c5ee3c5c2e0b4835);
    pushFN(data3,$def$js_identifier);
    return puid;
    /*d7eda89f396c87a1fe2f7ded57026ab2*/
}
function branch_d97c8f44cf6963ef(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*38:100 def$hex_token_group_044_104=>• d*/
    puid |=16;
    consume(l,data,state);
    return prod;
    return -1;
    /*d97c8f44cf6963ef459e83ca7be19b0f*/
}
function branch_d9bc194f109698ab(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*12:23 unary=>• -- closure*/
    puid |=4;
    consume(l,data,state);
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=2;
    pushFN(data1,branch_f3c5df3271892b40);
    pushFN(data3,$closure);
    return puid;
    return -1;
    /*d9bc194f109698ab2d07b81e9cbb37bd*/
}
function branch_dadc55bce7436d71(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*17:38 literal=>• def$number*/
    puid |=2;
    pushFN(data1,branch_1f9ddf3c27180aa0);
    pushFN(data3,$def$number);
    return puid;
    return -1;
    /*dadc55bce7436d717457ee0f7487ecc8*/
}
function branch_dd8b8d0fc9a3e7f1(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*37:94 def$float_token=>θnum • def$float_token_group_130_103*/
    puid |=2;
    pushFN(data1,branch_f3c5df3271892b40);
    pushFN(data3,$def$float_token_group_130_103);
    return puid;
    return -1;
    /*dd8b8d0fc9a3e7f18b01aaea7fc12c7a*/
}
function branch_ddc52552ed241de3(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*51:137 def$string_value_group_071_112=>• θid*/
    puid |=2;
    consume(l,data,state);
    return prod;
    return -1;
    /*ddc52552ed241de3124e360a255a507c*/
}
function branch_de3b71065ab2a33f(l,data,state,prod,puid){
    add_reduce(state,data,6,0);
    /*de3b71065ab2a33f202d5135df51d750*/
}
function branch_e0b918be7a27b9fe(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*17:41 literal=>• def$hex*/
    puid |=16;
    pushFN(data1,branch_1f9ddf3c27180aa0);
    pushFN(data3,$def$hex);
    return puid;
    return -1;
    /*e0b918be7a27b9fe4a21d2ddf881921f*/
}
function branch_e130320c599df953(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*13:28 closure=>[ • expression ]*/
    puid |=16;
    pushFN(data1,branch_8cbf7fbd4d0eebd8);
    pushFN(data3,$expression);
    return puid;
    /*e130320c599df9530293c913c1c97382*/
}
function branch_e1aca7f88b3a7ae8(l,data,state,prod,puid){
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=8;
    if(false&&consume(l,data,state)){
        skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
        puid |=16;
        pushFN(data1,branch_b7dede1b8b1301e3);
        pushFN(data3,$blocks);
        return puid;
    }
    return -1;
    /*e1aca7f88b3a7ae8c9d872c803469fd0*/
}
function branch_e1fad3a62d722adc(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*13:29 closure=>• literal*/
    puid |=64;
    pushFN(data1,branch_1f9ddf3c27180aa0);
    pushFN(data3,$literal);
    return puid;
    return -1;
    /*e1fad3a62d722adcc3a5f5e9937011dc*/
}
function branch_e23c3ab7b39f0868(l,data,state,prod,puid){
    add_reduce(state,data,1,2);
    pushFN(data,$blocks_HC_listbody3_101_goto);
    return 2;
    /*e23c3ab7b39f08688dc015b00b160b44*/
}
function branch_e416e6c7a0d65a1b(l,data,state,prod,puid){
    return 21;
    /*e416e6c7a0d65a1b3adedd7efa6e13b0*/
}
function branch_e5119ed183220650(l,data,state,prod,puid){
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=4;
    pushFN(data1,branch_0c3a198b92ffb270);
    pushFN(data3,$reserved_word);
    return puid;
    return -1;
    /*e5119ed183220650ccb3da33d78fa507*/
}
function branch_e5a69d74b8b4b0ff(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*58:165 def$identifier_symbols=>• $*/
    puid |=16;
    consume(l,data,state);
    return prod;
    return -1;
    /*e5a69d74b8b4b0ffb85e1b273f216135*/
}
function branch_e6ca468c39009342(l,data,state,prod,puid){
    return 1;
    /*e6ca468c39009342aa556361b9a54b1c*/
}
function branch_e7fb51722bf71275(l,data,state,prod,puid){
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=4;
    pushFN(data1,branch_cf4c76dad282dcb2);
    pushFN(data3,$reserved_word);
    return puid;
    return -1;
    /*e7fb51722bf7127537b04e1d2eea986b*/
}
function branch_e9fd2933af78d6f4(l,data,state,prod,puid){
    return 37;
    /*e9fd2933af78d6f420d3b848b6c191b1*/
}
function branch_ea617b2a8027ddc8(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$def$defaultproductions_goto);
    return 26;
    /*ea617b2a8027ddc8a512a2b69281ec2d*/
}
function branch_ea721e043d17f113(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*28:78 def$hex_digit=>• τB*/
    puid |=256;
    consume(l,data,state);
    return prod;
    return -1;
    /*ea721e043d17f1138c536fb317561042*/
}
function branch_eae26e18056d8fd7(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*28:76 def$hex_digit=>• τf*/
    puid |=64;
    consume(l,data,state);
    return prod;
    return -1;
    /*eae26e18056d8fd7579f574d54aa4de8*/
}
function branch_eb1832156ba2e37d(l,data,state,prod,puid){
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=8;
    if(false&&consume(l,data,state)){
        skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
        puid |=16;
        pushFN(data1,branch_3205c0ded576131e);
        pushFN(data3,$blocks);
        return puid;
    }
    return -1;
    /*eb1832156ba2e37d12a2769209fe3fef*/
}
function branch_ecc9e5ccc2d1b10b(l,data,state,prod,puid){
    add_reduce(state,data,3,1);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$def$defaultproductions_HC_listbody1_100_goto);
    return 25;
    /*ecc9e5ccc2d1b10bbaf017750ccb8201*/
}
function branch_ed22316b9946832c(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*18:44 reserved_word=>• else*/
    puid |=4;
    consume(l,data,state);
    return prod;
    return -1;
    /*ed22316b9946832c155ec0f782307f56*/
}
function branch_ee4e777e8a444c1e(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
    /*11:20 multiplicative=>unary • + additive*/
    puid |=2;
    consume(l,data,state);
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=4;
    pushFN(data1,branch_41ff52b1bc0fd96e);
    pushFN(data3,$additive);
    return puid;
    return -1;
    /*ee4e777e8a444c1ed2331581eb45e845*/
}
function branch_f08ef7120a7f420c(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*45:125 def$octal_token_group_058_109=>• 6*/
    puid |=64;
    consume(l,data,state);
    return prod;
    return -1;
    /*f08ef7120a7f420c0bd538e48bafd16f*/
}
function branch_f147f4f44035aadc(l,data,state,prod,puid){
    /*12:24 unary=>closure • --
    12:25 unary=>closure • ++
    12:26 unary=>closure •*/
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(/*[--]*/cmpr_set(l,data,6,2,2)){
        pushFN(data,branch_063c26611b6f5f75);
        return branch_2341f8efe0bbd795(l,data,state,prod,2);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else if(!(/*[++]*/cmpr_set(l,data,4,2,2))||(l.current_byte==43/*[+]*/)){
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*12:26 unary=>closure •*/
        return 12;
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(/*[++]*/cmpr_set(l,data,4,2,2)){
        pushFN(data,branch_063c26611b6f5f75);
        return branch_ae0d573ccd784687(l,data,state,prod,2);
    }
    return -1;
    /*f147f4f44035aadc1c52ef4559044870*/
}
function branch_f1d04cf35d9adae9(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$def$hex_token_HC_listbody1_105_goto);
    return 39;
    /*f1d04cf35d9adae92f8e44407a101f08*/
}
function branch_f3c5df3271892b40(l,data,state,prod,puid){
    add_reduce(state,data,2,0);
    return prod;
    /*f3c5df3271892b40c21bd3a22c3cb7f7*/
}
function branch_f459e5fe34568aec(l,data,state,prod,puid){
    add_reduce(state,data,1,2);
    pushFN(data,$expressions_goto);
    return 5;
    /*f459e5fe34568aecc473cde8eefdfb2e*/
}
function branch_f6b1a245c1889ce4(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*8:15 id_sequence=>id_sequence • θws identifier*/
    puid |=2;
    consume(l,data,state);
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=4;
    pushFN(data1,branch_d2df981d115c0c94);
    pushFN(data3,$def$js_identifier);
    return puid;
    return -1;
    return -1;
    /*f6b1a245c1889ce4ebe298b789c904b9*/
}
function branch_f8510753c1fbdf8d(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*52:141 def$string_value_group_172_113=>• θnum*/
    puid |=1;
    consume(l,data,state);
    return prod;
    return -1;
    /*f8510753c1fbdf8dfd5fb30f50a0464b*/
}
function branch_f868f67f46dfc95e(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*58:159 def$identifier_symbols=>def$identifier_symbols • θid*/
    puid |=2;
    consume(l,data,state);
    add_reduce(state,data,2,5);
    return prod;
    return -1;
    return -1;
    /*f868f67f46dfc95eccd390f7d30f05ac*/
}
function branch_f9ae7be2d137547a(l,data,state,prod,puid){
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    puid |=1;
    if((l.current_byte==34/*["]*/)&&consume(l,data,state)){
        add_reduce(state,data,3,4);
        return prod;
    }
    return -1;
    /*f9ae7be2d137547aa31707708cd3fc1d*/
}
function branch_fc98acdbe39fb0e1(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$closure_goto);
    return 13;
    /*fc98acdbe39fb0e17605ff2b37da3a75*/
}
function branch_fd45fb23d91bdec8(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*41:113 def$binary_token_group_047_106=>• 1*/
    puid |=2;
    consume(l,data,state);
    return prod;
    return -1;
    /*fd45fb23d91bdec8424597407d953231*/
}
function branch_ff10e4686defaf36(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*56:153 def$js_id_symbols=>def$js_id_symbols • $*/
    puid |=8;
    consume(l,data,state);
    add_reduce(state,data,2,5);
    return prod;
    return -1;
    return -1;
    /*ff10e4686defaf3649bb0705bb094c28*/
}
function branch_ffee82f4afd301cc(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*51:136 def$string_value_group_071_112=>• θnum*/
    puid |=1;
    consume(l,data,state);
    return prod;
    return -1;
    /*ffee82f4afd301cc3d322d01aa144ab9*/
}
function dt_6ae31dd85a62ef5c(l,data){
    if(2==compare(data,l.byte_offset +0,63,2)){
        /*0b*/
        l.setToken(TokenSymbol, 2, 2);
        return true;
    } else if(2==compare(data,l.byte_offset +0,65,2)){
        /*0o*/
        l.setToken(TokenSymbol, 2, 2);
        return true;
    } else if(2==compare(data,l.byte_offset +0,67,2)){
        /*0O*/
        l.setToken(TokenSymbol, 2, 2);
        return true;
    } else if(2==compare(data,l.byte_offset +0,17,2)){
        /*0x*/
        l.setToken(TokenSymbol, 2, 2);
        return true;
    }
    return false;
}
function dt_bc3480b75045e0d0(l,data){
    if(2==compare(data,l.byte_offset +0,65,2)){
        /*0o*/
        l.setToken(TokenSymbol, 2, 2);
        return true;
    } else if(2==compare(data,l.byte_offset +0,67,2)){
        /*0O*/
        l.setToken(TokenSymbol, 2, 2);
        return true;
    }
    return false;
}
function skip_1a45429b83435415(l,data,APPLY){
    const off = l.token_offset;
    while(1){
        if(!(tk_e81d7e72d5dfef95(l,data)||l.isNL())){
            break;
        }
        l.next(data);
    }
    if(APPLY){
        add_skip(l,data,l.token_offset - off);
    }
}
function skip_41e306b5d22e0b8a(l,data,APPLY){
    const off = l.token_offset;
    while(1){
        if(!((tk_e81d7e72d5dfef95(l,data)||l.isNL())||l.isNum(data))){
            break;
        }
        l.next(data);
    }
    if(APPLY){
        add_skip(l,data,l.token_offset - off);
    }
}
function skip_4632a552a92a99ca(l,data,APPLY){
    const off = l.token_offset;
    while(1){
        if(!(tk_e81d7e72d5dfef95(l,data)||l.isNum(data))){
            break;
        }
        l.next(data);
    }
    if(APPLY){
        add_skip(l,data,l.token_offset - off);
    }
}
function skip_93ed4c5eed930820(l,data,APPLY){
    const off = l.token_offset;
    while(1){
        if(!(tk_e81d7e72d5dfef95(l,data))){
            break;
        }
        l.next(data);
    }
    if(APPLY){
        add_skip(l,data,l.token_offset - off);
    }
}
function skip_a391223c0048eca8(l,data,APPLY){
    const off = l.token_offset;
    while(1){
        if(!((tk_e81d7e72d5dfef95(l,data)||l.isNL())||l.isSP(true,data))){
            break;
        }
        l.next(data);
    }
    if(APPLY){
        add_skip(l,data,l.token_offset - off);
    }
}
function skip_c7e5e40af478ecc8(l,data,APPLY){
    const off = l.token_offset;
    while(1){
        if(!(((tk_e81d7e72d5dfef95(l,data)||l.isNL())||l.isNum(data))||l.isSP(true,data))){
            break;
        }
        l.next(data);
    }
    if(APPLY){
        add_skip(l,data,l.token_offset - off);
    }
}
function tk_0d899a748a870a4c(l,data){
    if(dt_bc3480b75045e0d0(l,data)){
                        
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

        if (data.prod == 47) {
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
function tk_59143f4e6231a5e8(l,data){
    if(/*[0b]*/cmpr_set(l,data,63,2,2)){
                        
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

        if (data.prod == 43) {
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
function tk_92d190f27f0da1c0(l,data){
    if(l.isNum(data)){
                        
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

        if (data.prod == 35) {
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
function tk_96cbe68da5cded78(l,data){
    if(/*[0x]*/cmpr_set(l,data,17,2,2)){
                        
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

        if (data.prod == 40) {
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
function tk_c0be937e31ebe138(l,data){
    if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
                        
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

        if (data.prod == 56) {
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
function tk_e81d7e72d5dfef95(l,data){
    if(/*[/asterisk]*/cmpr_set(l,data,13,2,2)){
                        
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

        if (data.prod == 23) {
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
function tk_f1c62529db8a6752(l,data){
    if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
                        
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

        if (data.prod == 58) {
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
/*production name: start
            grammar index: 0
            bodies:
	0:0 start=>• blocks - 
            compile time: 8.992ms*/;
function $start(l,data,state){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*0:0 start=>• blocks*/
    puid |=1;
    pushFN(data1,branch_952c501382c49da3);
    pushFN(data3,$blocks);
    return puid;
    return -1;
}
function $start_reducer(l,data,state,prod,puid){
    return 0;
}
/*production name: blocks_group_22_100
            grammar index: 1
            bodies:
	1:1 blocks_group_22_100=>• [ expressions ] - 
		1:2 blocks_group_22_100=>• [ ] - 
            compile time: 25.399ms*/;
function $blocks_group_22_100(l,data,state){
    /*1:1 blocks_group_22_100=>• [ expressions ]
    1:2 blocks_group_22_100=>• [ ]*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==91/*[[]*/){
        consume(l,data,state);
        puid |=1;
        /*1:1 blocks_group_22_100=>[ • expressions ]
        1:2 blocks_group_22_100=>[ • ]*/
        skip_a391223c0048eca8(l/*[ ws ][ 23 ][ nl ]*/,data,true);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.current_byte==93/*[]]*/){
            pushFN(data,branch_e6ca468c39009342);
            return branch_6b7e12f34652d379(l,data,state,prod,1);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            pushFN(data,branch_e6ca468c39009342);
            return branch_ce8e5b3cfda6f6e6(l,data,state,prod,1);
        }
    }
    return -1;
}
function $blocks_group_22_100_reducer(l,data,state,prod,puid){
    if(7 == puid){
        /*1:1 blocks_group_22_100=>[ expressions ] •*/
        add_reduce(state,data,3,0);
    } else if(5 == puid){
        /*1:2 blocks_group_22_100=>[ ] •*/
        add_reduce(state,data,2,0);
    }
    return 1;
}
/*production name: blocks
            grammar index: 3
            bodies:
	3:5 blocks=>• blocks & blocks_group_22_100 - 
		3:6 blocks=>• blocks_group_22_100 - 
            compile time: 220.675ms*/;
function $blocks(l,data,state){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*3:6 blocks=>• blocks_group_22_100*/
    puid |=4;
    pushFN(data1,branch_710629940f6173f7);
    pushFN(data3,$blocks_group_22_100);
    return puid;
    return -1;
}
function $blocks_goto(l,data,state,prod){
    while(1){
        /*3:5 blocks=>blocks • & blocks_group_22_100
        0:0 start=>blocks •
        13:30 closure=>blocks •
        14:33 fnA=>identifier => identifier reserved_word θvoid blocks •
        16:36 fnB=>identifier fnB_group_026_104 identifier reserved_word θactive blocks •*/
        skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.current_byte==38/*[&]*/){
            pushFN(data,branch_8b46815c0b6f87a9);
            return branch_480872a42458ede1(l,data,state,prod,1);
        }
        break;
    }
    return prod == 3 ? prod : -1;
}
function $blocks_reducer(l,data,state,prod,puid){
    if(7 == puid){
        /*3:5 blocks=>blocks & blocks_group_22_100 •*/
        add_reduce(state,data,3,1);
    } else if(4 == puid){
        /*3:6 blocks=>blocks_group_22_100 •*/
        add_reduce(state,data,1,2);
    }
    return 3;
}
/*production name: expressions
            grammar index: 5
            bodies:
	5:9 expressions=>• expressions , expression - 
		5:10 expressions=>• expression - 
            compile time: 21.023ms*/;
function $expressions(l,data,state){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*5:10 expressions=>• expression*/
    puid |=4;
    pushFN(data1,branch_f459e5fe34568aec);
    pushFN(data3,$expression);
    return puid;
    return -1;
}
function $expressions_goto(l,data,state,prod){
    /*5:9 expressions=>expressions • , expression
    1:1 blocks_group_22_100=>[ expressions • ]
    13:27 closure=>( expressions • )*/
    skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(l.current_byte==44/*[,]*/){
        pushFN(data,branch_87e8402495867cb0);
        return branch_8674238ec147c066(l,data,state,prod,1);
    }
    return prod == 5 ? prod : -1;
}
function $expressions_reducer(l,data,state,prod,puid){
    if(7 == puid){
        /*5:9 expressions=>expressions , expression •*/
        add_reduce(state,data,3,1);
    } else if(4 == puid){
        /*5:10 expressions=>expression •*/
        add_reduce(state,data,1,2);
    }
    return 5;
}
/*production name: expression
            grammar index: 6
            bodies:
	6:11 expression=>• id_sequence - 
		6:12 expression=>• math_expression - 
            compile time: 1101.23ms*/;
function $expression(l,data,state){
    /*55:150 def$js_identifier=>• tk:def$js_id_symbols
    6:12 expression=>• math_expression*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
        pushFN(data,branch_5ecc1b0455a1fee7);
        return branch_98a313cc99318ecc(l,data,state,prod,1);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else {
        pushFN(data,branch_3ea38decf42bcbd1);
        return branch_18728529e4616a97(l,data,state,prod,2);
    }
    return -1;
}
function $expression_goto(l,data,state,prod){
    while(1){
        switch(prod){
            case 8:
                /*6:11 expression=>id_sequence •
                8:15 id_sequence=>id_sequence • θws identifier*/
                skip_41e306b5d22e0b8a(l/*[ num ][ 23 ][ nl ]*/,data,true);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if(l.isSP(true,data)){
                    pushFN(data,branch_aa0980f1a84edc4b);
                    return branch_f6b1a245c1889ce4(l,data,state,prod,1);
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                } else {
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    /*6:11 expression=>id_sequence •*/
                    return 6;
                }
                break;
            case 11:
                pushFN(data,branch_b4d93cfb34352f09);
                return branch_0e835803faaa761c(l,data,state,prod,1);
                break;
            case 12:
                pushFN(data,branch_5017c84d418643ed);
                return branch_ba1dfcfa496edada(l,data,state,prod,1);
                break;
            case 13:
                pushFN(data,branch_9e0d908cde5fc8cf);
                return branch_36e8090044886c4c(l,data,state,prod,2);
                break;
            case 20:
                /*8:16 id_sequence=>identifier •
                17:37 literal=>identifier •
                14:33 fnA=>identifier • => identifier reserved_word θvoid blocks
                16:36 fnB=>identifier • fnB_group_026_104 identifier reserved_word θactive blocks*/
                skip_41e306b5d22e0b8a(l/*[ num ][ 23 ][ nl ]*/,data,true);
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                if(!(((/*[=>]*/cmpr_set(l,data,10,2,2)||/*[>=]*/cmpr_set(l,data,11,2,2))||/*[--]*/cmpr_set(l,data,6,2,2))||/*[++]*/cmpr_set(l,data,4,2,2))||assert_ascii(l,0x0,0x1a00,0x20000000,0x0)){
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    /*8:16 id_sequence=>identifier •*/
                    add_reduce(state,data,1,2);
                    prod = 8;
                    continue;;
                    /*⤋⤋⤋ peek-unresolved ⤋⤋⤋*/
                } else if(/*[=>]*/cmpr_set(l,data,10,2,2)){
                    /*-------------VPROD-------------------------*/
                    /*14:33 fnA=>identifier • => identifier reserved_word θvoid blocks
                    16:36 fnB=>identifier • fnB_group_026_104 identifier reserved_word θactive blocks*/
                    pushFN(data,branch_17b08110a44e3baa);
                    return 0;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if(/*[>=]*/cmpr_set(l,data,11,2,2)){
                    pushFN(data,branch_144e5be1c2186845);
                    return branch_69f3b07784067b13(l,data,state,prod,1);
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                } else if(assert_ascii(l,0x0,0x1200,0x20000000,0x0)){
                    /*17:37 literal=>identifier •
                    8:16 id_sequence=>identifier •*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    if(!(/*[--]*/cmpr_set(l,data,6,2,2)||/*[++]*/cmpr_set(l,data,4,2,2))||(l.current_byte==43/*[+]*/)){
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*8:16 id_sequence=>identifier •*/
                        add_reduce(state,data,1,2);
                        prod = 8;
                        continue;;
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    } else {
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*17:37 literal=>identifier •*/
                        prod = 13;
                        continue;;
                    }
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                } else {
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    /*17:37 literal=>identifier •*/
                    prod = 13;
                    continue;;
                }
                break;
        }
        break;
    }
    return prod == 6 ? prod : -1;
}
function $expression_reducer(l,data,state,prod,puid){
    return 6;
}
/*production name: math_expression
            grammar index: 9
            bodies:
	9:17 math_expression=>• additive - 
            compile time: 11.643ms*/;
function $math_expression(l,data,state){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*9:17 math_expression=>• additive*/
    puid |=1;
    pushFN(data1,branch_735080cef15756c8);
    pushFN(data3,$additive);
    return puid;
    return -1;
}
function $math_expression_reducer(l,data,state,prod,puid){
    return 9;
}
/*production name: additive
            grammar index: 10
            bodies:
	10:18 additive=>• multiplicative + additive - 
		10:19 additive=>• multiplicative - 
            compile time: 211.885ms*/;
function $additive(l,data,state){
    /*10:18 additive=>• multiplicative + additive
    10:19 additive=>• multiplicative*/
    pushFN(data,branch_9d915508a4633d80);
    pushFN(data,$multiplicative);
    puid |=1;
    return puid;
    return -1;
}
function $additive_reducer(l,data,state,prod,puid){
    if(7 == puid){
        /*10:18 additive=>multiplicative + additive •*/
        add_reduce(state,data,3,0);
    }
    return 10;
}
/*production name: multiplicative
            grammar index: 11
            bodies:
	11:20 multiplicative=>• unary + additive - 
		11:21 multiplicative=>• unary - 
            compile time: 214.974ms*/;
function $multiplicative(l,data,state){
    /*11:20 multiplicative=>• unary + additive
    11:21 multiplicative=>• unary*/
    pushFN(data,branch_bd748bdc8b9ffed2);
    pushFN(data,$unary);
    puid |=1;
    return puid;
    return -1;
}
function $multiplicative_reducer(l,data,state,prod,puid){
    if(7 == puid){
        /*11:20 multiplicative=>unary + additive •*/
        add_reduce(state,data,3,0);
    }
    return 11;
}
/*production name: unary
            grammar index: 12
            bodies:
	12:22 unary=>• ++ closure - 
		12:23 unary=>• -- closure - 
		12:24 unary=>• closure -- - 
		12:25 unary=>• closure ++ - 
		12:26 unary=>• closure - 
            compile time: 219.719ms*/;
function $unary(l,data,state){
    /*12:22 unary=>• ++ closure
    12:23 unary=>• -- closure
    12:24 unary=>• closure --
    12:25 unary=>• closure ++
    12:26 unary=>• closure*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(/*[++]*/cmpr_set(l,data,4,2,2)){
        pushFN(data,branch_063c26611b6f5f75);
        return branch_cb18de2aaeb58a81(l,data,state,prod,1);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(/*[--]*/cmpr_set(l,data,6,2,2)){
        pushFN(data,branch_063c26611b6f5f75);
        return branch_d9bc194f109698ab(l,data,state,prod,4);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else {
        /*12:24 unary=>• closure --
        12:25 unary=>• closure ++
        12:26 unary=>• closure*/
        skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
        pushFN(data,branch_f147f4f44035aadc);
        pushFN(data,$closure);
        puid |=2;
        return puid;
    }
    return -1;
}
function $unary_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*12:22 unary=>++ closure •*/
        add_reduce(state,data,2,0);
    } else if(6 == puid){
        /*12:23 unary=>-- closure •*/
        add_reduce(state,data,2,0);
    } else if(6 == puid){
        /*12:24 unary=>closure -- •*/
        add_reduce(state,data,2,0);
    } else if(3 == puid){
        /*12:25 unary=>closure ++ •*/
        add_reduce(state,data,2,0);
    }
    return 12;
}
/*production name: closure
            grammar index: 13
            bodies:
	13:27 closure=>• ( expressions ) - 
		13:28 closure=>• [ expression ] - 
		13:29 closure=>• literal - 
		13:30 closure=>• blocks - 
		13:31 closure=>• fnA - 
		13:32 closure=>• fnB - 
            compile time: 8100.37ms*/;
function $closure(l,data,state){
    /*13:27 closure=>• ( expressions )
    13:28 closure=>• [ expression ]
    13:30 closure=>• blocks
    55:150 def$js_identifier=>• tk:def$js_id_symbols
    13:29 closure=>• literal*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(l.current_byte==40/*[(]*/){
        pushFN(data,branch_95bffdb621cd63c5);
        return branch_8d0ec6cb288eafb4(l,data,state,prod,1);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    } else if(l.current_byte==91/*[[]*/){
        /*13:28 closure=>• [ expression ]
        13:30 closure=>• blocks*/
        let pk = l.copy();
        skip_a391223c0048eca8(pk.next(data)/*[ ws ][ 23 ][ nl ]*/,data,false);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if(pk.current_byte==93/*[]]*/){
            pushFN(data,branch_95bffdb621cd63c5);
            return branch_ba0188199e744db1(l,data,state,prod,128);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else {
            /*13:28 closure=>• [ expression ]
            1:1 blocks_group_22_100=>• [ expressions ]*/
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            puid |=8;
            /*13:28 closure=>[ • expression ]
            1:1 blocks_group_22_100=>[ • expressions ]*/
            skip_a391223c0048eca8(l/*[ ws ][ 23 ][ nl ]*/,data,true);
            /*⤋⤋⤋ peek-unresolved ⤋⤋⤋*/
            if(((((/*[++]*/cmpr_set(l,data,4,2,2)||/*[--]*/cmpr_set(l,data,6,2,2))||dt_6ae31dd85a62ef5c(l,data))||assert_ascii(l,0x0,0x110,0x88000000,0x0))||l.isUniID(data))||l.isNum(data)){
                /*Error: Virtual production level too high
                    at createVirtualProductionSequence (file:///home/anthony/work/active/apps/cfw.workspace/packages/hydrocarbon/build/library/compiler/function_constructor.js:73:15)
                    at default_resolveUnresolvedLeaves (file:///home/anthony/work/active/apps/cfw.workspace/packages/hydrocarbon/build/library/compiler/transitions/default_unresolved_leaves_resolution.js:21:13)
                    at processTransitionNodes (file:///home/anthony/work/active/apps/cfw.workspace/packages/hydrocarbon/build/library/compiler/transitions/process_transition_nodes.js:64:45)
                    at compileProductionFunctions (file:///home/anthony/work/active/apps/cfw.workspace/packages/hydrocarbon/build/library/compiler/function_constructor.js:115:127)
                    at createVirtualProductionSequence (file:///home/anthony/work/active/apps/cfw.workspace/packages/hydrocarbon/build/library/compiler/function_constructor.js:74:75)
                    at default_resolveUnresolvedLeaves (file:///home/anthony/work/active/apps/cfw.workspace/packages/hydrocarbon/build/library/compiler/transitions/default_unresolved_leaves_resolution.js:21:13)
                    at processTransitionNodes (file:///home/anthony/work/active/apps/cfw.workspace/packages/hydrocarbon/build/library/compiler/transitions/process_transition_nodes.js:64:45)
                    at compileProductionFunctions (file:///home/anthony/work/active/apps/cfw.workspace/packages/hydrocarbon/build/library/compiler/function_constructor.js:115:127)
                    at createVirtualProductionSequence (file:///home/anthony/work/active/apps/cfw.workspace/packages/hydrocarbon/build/library/compiler/function_constructor.js:74:75)
                    at default_resolveUnresolvedLeaves (file:///home/anthony/work/active/apps/cfw.workspace/packages/hydrocarbon/build/library/compiler/transitions/default_unresolved_leaves_resolution.js:21:13)*/
                {
                    const fk = fork(data);;
                    pushFN(fk,branch_e130320c599df953);
                }
                pushFN(data,branch_92ccdeac69bd1cbd);
                return 0;
            }
        }
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    } else if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
        pushFN(data,branch_360209ba110cf999);
        return branch_98a313cc99318ecc(l,data,state,prod,1);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else {
        pushFN(data,branch_95bffdb621cd63c5);
        return branch_e1fad3a62d722adc(l,data,state,prod,64);
    }
    return -1;
}
function $closure_goto(l,data,state,prod){
    while(1){
        switch(prod){
            case 3:
                /*13:30 closure=>blocks •
                3:5 blocks=>blocks • & blocks_group_22_100*/
                skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if(l.current_byte==38/*[&]*/){
                    pushFN(data,branch_a12e8ce91807e9a5);
                    return branch_480872a42458ede1(l,data,state,prod,1);
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                } else {
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    /*13:30 closure=>blocks •*/
                    return 13;
                }
                break;
            case 20:
                /*17:37 literal=>identifier •
                14:33 fnA=>identifier • => identifier reserved_word θvoid blocks
                16:36 fnB=>identifier • fnB_group_026_104 identifier reserved_word θactive blocks*/
                skip_c7e5e40af478ecc8(l/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
                /*⤋⤋⤋ peek-unresolved ⤋⤋⤋*/
                if(/*[=>]*/cmpr_set(l,data,10,2,2)){
                    /*-------------VPROD-------------------------*/
                    /*14:33 fnA=>identifier • => identifier reserved_word θvoid blocks
                    16:36 fnB=>identifier • fnB_group_026_104 identifier reserved_word θactive blocks*/
                    pushFN(data,branch_6b21d5a0d5035df5);
                    return 0;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if(/*[>=]*/cmpr_set(l,data,11,2,2)){
                    pushFN(data,branch_fc98acdbe39fb0e1);
                    return branch_69f3b07784067b13(l,data,state,prod,1);
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                } else {
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    /*17:37 literal=>identifier •*/
                    return 13;
                }
                break;
        }
        break;
    }
    return prod == 13 ? prod : -1;
}
function $closure_reducer(l,data,state,prod,puid){
    if(7 == puid){
        /*13:27 closure=>( expressions ) •*/
        add_reduce(state,data,3,0);
    } else if(56 == puid){
        /*13:28 closure=>[ expression ] •*/
        add_reduce(state,data,3,0);
    }
    return 13;
}
/*production name: fnB_group_026_104
            grammar index: 15
            bodies:
	15:34 fnB_group_026_104=>• => - 
		15:35 fnB_group_026_104=>• >= - 
            compile time: 7.416ms*/;
function $fnB_group_026_104(l,data,state){
    /*15:34 fnB_group_026_104=>• =>
    15:35 fnB_group_026_104=>• >=*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(/*[=>]*/cmpr_set(l,data,10,2,2)){
        pushFN(data,branch_3d90cbf905d60205);
        return branch_8f8ccebd90df3669(l,data,state,prod,1);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(/*[>=]*/cmpr_set(l,data,11,2,2)){
        pushFN(data,branch_3d90cbf905d60205);
        return branch_64c6db0043a95bab(l,data,state,prod,2);
    }
    return -1;
}
function $fnB_group_026_104_reducer(l,data,state,prod,puid){
    return 15;
}
/*production name: literal
            grammar index: 17
            bodies:
	17:37 literal=>• identifier - 
		17:38 literal=>• def$number - 
		17:39 literal=>• def$binary - 
		17:40 literal=>• def$octal - 
		17:41 literal=>• def$hex - 
            compile time: 15.193ms*/;
function $literal(l,data,state){
    /*17:37 literal=>• identifier
    17:38 literal=>• def$number
    17:39 literal=>• def$binary
    17:40 literal=>• def$octal
    17:41 literal=>• def$hex*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.isNum(data)){
        pushFN(data,branch_7737f48ce5df0b93);
        return branch_dadc55bce7436d71(l,data,state,prod,2);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(/*[0b]*/cmpr_set(l,data,63,2,2)){
        pushFN(data,branch_7737f48ce5df0b93);
        return branch_6930f2dc4c926fa3(l,data,state,prod,4);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(/*[0x]*/cmpr_set(l,data,17,2,2)){
        pushFN(data,branch_7737f48ce5df0b93);
        return branch_e0b918be7a27b9fe(l,data,state,prod,16);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
        pushFN(data,branch_7737f48ce5df0b93);
        return branch_87455207ddf57c93(l,data,state,prod,1);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else {
        pushFN(data,branch_7737f48ce5df0b93);
        return branch_664f929ed263db42(l,data,state,prod,8);
    }
    return -1;
}
function $literal_reducer(l,data,state,prod,puid){
    return 17;
}
/*production name: reserved_word
            grammar index: 18
            bodies:
	18:42 reserved_word=>• if - 
		18:43 reserved_word=>• then - 
		18:44 reserved_word=>• else - 
		18:45 reserved_word=>• maybe - 
		18:46 reserved_word=>• private - 
		18:47 reserved_word=>• or - 
            compile time: 7.802ms*/;
function $reserved_word(l,data,state){
    /*18:42 reserved_word=>• if
    18:43 reserved_word=>• then
    18:44 reserved_word=>• else
    18:45 reserved_word=>• maybe
    18:46 reserved_word=>• private
    18:47 reserved_word=>• or*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(/*[if]*/cmpr_set(l,data,24,2,2)){
        pushFN(data,branch_720a6963212b8031);
        return branch_9b7d08ac86af3b88(l,data,state,prod,1);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(/*[then]*/cmpr_set(l,data,26,4,4)){
        pushFN(data,branch_720a6963212b8031);
        return branch_1dfa094374155dd3(l,data,state,prod,2);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(/*[else]*/cmpr_set(l,data,30,4,4)){
        pushFN(data,branch_720a6963212b8031);
        return branch_ed22316b9946832c(l,data,state,prod,4);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(/*[maybe]*/cmpr_set(l,data,34,5,5)){
        pushFN(data,branch_720a6963212b8031);
        return branch_253645ba8707f546(l,data,state,prod,8);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(/*[private]*/cmpr_set(l,data,39,7,7)){
        pushFN(data,branch_720a6963212b8031);
        return branch_7cc3b86200fe9cff(l,data,state,prod,16);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(/*[or]*/cmpr_set(l,data,46,2,2)){
        pushFN(data,branch_720a6963212b8031);
        return branch_c58b24a3a258302e(l,data,state,prod,32);
    }
    return -1;
}
function $reserved_word_reducer(l,data,state,prod,puid){
    return 18;
}
/*production name: identifier_group_039_105
            grammar index: 19
            bodies:
	19:48 identifier_group_039_105=>• def$js_identifier - 
            compile time: 1.598ms*/;
function $identifier_group_039_105(l,data,state){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*19:48 identifier_group_039_105=>• def$js_identifier*/
    puid |=1;
    pushFN(data1,branch_7fe3eae917c31513);
    pushFN(data3,$def$js_identifier);
    return puid;
    return -1;
}
function $identifier_group_039_105_reducer(l,data,state,prod,puid){
    return 19;
}
/*production name: identifier
            grammar index: 20
            bodies:
	20:49 identifier=>• identifier_group_039_105 - 
            compile time: 1.648ms*/;
function $identifier(l,data,state){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*20:49 identifier=>• identifier_group_039_105*/
    puid |=1;
    pushFN(data1,branch_12743fa1aa413ad8);
    pushFN(data3,$def$js_identifier);
    return puid;
    return -1;
}
function $identifier_reducer(l,data,state,prod,puid){
    return 20;
}
/*production name: comment_group_045_106
            grammar index: 21
            bodies:
	21:50 comment_group_045_106=>• θnum - 
		21:51 comment_group_045_106=>• θid - 
		21:52 comment_group_045_106=>• θsym - 
		21:53 comment_group_045_106=>• θws - 
		21:54 comment_group_045_106=>• θnl - 
            compile time: 4.919ms*/;
function $comment_group_045_106(l,data,state){
    /*21:50 comment_group_045_106=>• θnum
    21:51 comment_group_045_106=>• θid
    21:52 comment_group_045_106=>• θsym
    21:53 comment_group_045_106=>• θws
    21:54 comment_group_045_106=>• θnl*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(l.isNum(data)){
        pushFN(data,branch_e416e6c7a0d65a1b);
        return branch_c84a7c673a69b4b7(l,data,state,prod,1);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.isUniID(data)){
        pushFN(data,branch_e416e6c7a0d65a1b);
        return branch_c67fbbc7d9b5d48e(l,data,state,prod,2);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.isSym(true,data)){
        pushFN(data,branch_e416e6c7a0d65a1b);
        return branch_b5ecc46624a85ae6(l,data,state,prod,4);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.isSP(true,data)){
        pushFN(data,branch_e416e6c7a0d65a1b);
        return branch_4bae298d266a2064(l,data,state,prod,8);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.isNL()){
        pushFN(data,branch_e416e6c7a0d65a1b);
        return branch_c3f8359bd507ae23(l,data,state,prod,16);
    }
    return -1;
}
function $comment_group_045_106_reducer(l,data,state,prod,puid){
    return 21;
}
/*production name: comment_HC_listbody1_107
            grammar index: 22
            bodies:
	22:55 comment_HC_listbody1_107=>• comment_HC_listbody1_107 comment_group_045_106 - 
		22:56 comment_HC_listbody1_107=>• comment_group_045_106 - 
            compile time: 10.007ms*/;
function $comment_HC_listbody1_107(l,data,state){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*22:56 comment_HC_listbody1_107=>• comment_group_045_106*/
    puid |=2;
    pushFN(data1,branch_7cb831b3ecb387cd);
    pushFN(data3,$comment_group_045_106);
    return puid;
    return -1;
}
function $comment_HC_listbody1_107_goto(l,data,state,prod){
    if(/*[asterisk/]*/cmpr_set(l,data,14,2,2)){
        return 22;
    }
    /*22:55 comment_HC_listbody1_107=>comment_HC_listbody1_107 • comment_group_045_106
    23:57 comment=>/* comment_HC_listbody1_107 • * /*/
    skip_93ed4c5eed930820(l/*[ 23 ]*/,data,true);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if((((l.isUniID(data)||l.isNL())||l.isNum(data))||l.isSym(true,data))||l.isSP(true,data)){
        pushFN(data,branch_318161b76adcc77c);
        return branch_8f932f9f300ead18(l,data,state,prod,1);
    }
    return prod == 22 ? prod : -1;
}
function $comment_HC_listbody1_107_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*22:55 comment_HC_listbody1_107=>comment_HC_listbody1_107 comment_group_045_106 •*/
        add_reduce(state,data,2,3);
    } else if(2 == puid){
        /*22:56 comment_HC_listbody1_107=>comment_group_045_106 •*/
        add_reduce(state,data,1,2);
    }
    return 22;
}
/*production name: comment
            grammar index: 23
            bodies:
	23:57 comment=>• /* comment_HC_listbody1_107 * / - 
		23:58 comment=>• /* * / - 
            compile time: 7.706ms*/;
function $comment(l,data,state){
    /*23:57 comment=>• /* comment_HC_listbody1_107 * /
    23:58 comment=>• /* * /*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(/*[/asterisk]*/cmpr_set(l,data,13,2,2)){
        consume(l,data,state);
        puid |=1;
        /*23:57 comment=>/* • comment_HC_listbody1_107 * /
        23:58 comment=>/* • * /*/
        skip_93ed4c5eed930820(l/*[ 23 ]*/,data,true);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(/*[asterisk/]*/cmpr_set(l,data,14,2,2)){
            pushFN(data,branch_6a866010abea12c8);
            return branch_9a8e67dbf14cb1cc(l,data,state,prod,1);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            pushFN(data,branch_6a866010abea12c8);
            return branch_8c506c3da724ba2f(l,data,state,prod,1);
        }
    }
    return -1;
}
function $comment_reducer(l,data,state,prod,puid){
    if(7 == puid){
        /*23:57 comment=>/* comment_HC_listbody1_107 * / •*/
        add_reduce(state,data,3,0);
    } else if(5 == puid){
        /*23:58 comment=>/* * / •*/
        add_reduce(state,data,2,0);
    }
    return 23;
}
/*production name: def$hex
            grammar index: 29
            bodies:
	29:83 def$hex=>• tk:def$hex_token - 
            compile time: 1.592ms*/;
function $def$hex(l,data,state){
    /*29:83 def$hex=>• tk:def$hex_token*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(tk_96cbe68da5cded78(l,data)){
        consume(l,data,state);
        puid |=1;
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        /*29:83 def$hex=>tk:def$hex_token •*/
        return 29;
    }
    return -1;
}
function $def$hex_reducer(l,data,state,prod,puid){
    return 29;
}
/*production name: def$binary
            grammar index: 30
            bodies:
	30:84 def$binary=>• tk:def$binary_token - 
            compile time: 3.844ms*/;
function $def$binary(l,data,state){
    /*30:84 def$binary=>• tk:def$binary_token*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(tk_59143f4e6231a5e8(l,data)){
        consume(l,data,state);
        puid |=1;
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        /*30:84 def$binary=>tk:def$binary_token •*/
        return 30;
    }
    return -1;
}
function $def$binary_reducer(l,data,state,prod,puid){
    return 30;
}
/*production name: def$octal
            grammar index: 31
            bodies:
	31:85 def$octal=>• tk:def$octal_token - 
            compile time: 1.927ms*/;
function $def$octal(l,data,state){
    /*31:85 def$octal=>• tk:def$octal_token*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(tk_0d899a748a870a4c(l,data)){
        consume(l,data,state);
        puid |=1;
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        /*31:85 def$octal=>tk:def$octal_token •*/
        return 31;
    }
    return -1;
}
function $def$octal_reducer(l,data,state,prod,puid){
    return 31;
}
/*production name: def$number
            grammar index: 32
            bodies:
	32:86 def$number=>• tk:def$scientific_token - 
            compile time: 1.448ms*/;
function $def$number(l,data,state){
    /*32:86 def$number=>• tk:def$scientific_token*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(tk_92d190f27f0da1c0(l,data)){
        consume(l,data,state);
        puid |=1;
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        /*32:86 def$number=>tk:def$scientific_token •*/
        return 32;
    }
    return -1;
}
function $def$number_reducer(l,data,state,prod,puid){
    return 32;
}
/*production name: def$scientific_token_group_027_101
            grammar index: 33
            bodies:
	33:87 def$scientific_token_group_027_101=>• e - 
		33:88 def$scientific_token_group_027_101=>• E - 
            compile time: 3.175ms*/;
function $def$scientific_token_group_027_101(l,data,state){
    /*33:87 def$scientific_token_group_027_101=>• e
    33:88 def$scientific_token_group_027_101=>• E*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(l.current_byte==101/*[e]*/){
        pushFN(data,branch_cd0be914132510c9);
        return branch_ceb5941866114e1d(l,data,state,prod,1);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==69/*[E]*/){
        pushFN(data,branch_cd0be914132510c9);
        return branch_9f99f0dc14c474c1(l,data,state,prod,2);
    }
    return -1;
}
function $def$scientific_token_group_027_101_reducer(l,data,state,prod,puid){
    return 33;
}
/*production name: def$scientific_token_group_228_102
            grammar index: 34
            bodies:
	34:89 def$scientific_token_group_228_102=>• def$scientific_token_group_027_101 - θnum - 
		34:90 def$scientific_token_group_228_102=>• def$scientific_token_group_027_101 θnum - 
            compile time: 6.503ms*/;
function $def$scientific_token_group_228_102(l,data,state){
    /*34:89 def$scientific_token_group_228_102=>• def$scientific_token_group_027_101 - θnum
    34:90 def$scientific_token_group_228_102=>• def$scientific_token_group_027_101 θnum*/
    pushFN(data,branch_d1ab254073739e05);
    pushFN(data,$def$scientific_token_group_027_101);
    puid |=1;
    return puid;
    return -1;
}
function $def$scientific_token_group_228_102_reducer(l,data,state,prod,puid){
    if(7 == puid){
        /*34:89 def$scientific_token_group_228_102=>def$scientific_token_group_027_101 - θnum •*/
        add_reduce(state,data,3,0);
    } else if(5 == puid){
        /*34:90 def$scientific_token_group_228_102=>def$scientific_token_group_027_101 θnum •*/
        add_reduce(state,data,2,0);
    }
    return 34;
}
/*production name: def$scientific_token
            grammar index: 35
            bodies:
	35:91 def$scientific_token=>• def$float_token def$scientific_token_group_228_102 - 
		35:92 def$scientific_token=>• def$float_token - 
            compile time: 8.494ms*/;
function $def$scientific_token(l,data,state){
    /*35:91 def$scientific_token=>• def$float_token def$scientific_token_group_228_102
    35:92 def$scientific_token=>• def$float_token*/
    pushFN(data,branch_bef161f8414e5b0b);
    pushFN(data,$def$float_token);
    puid |=1;
    return puid;
    return -1;
}
function $def$scientific_token_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*35:91 def$scientific_token=>def$float_token def$scientific_token_group_228_102 •*/
        add_reduce(state,data,2,0);
    }
    return 35;
}
/*production name: def$float_token_group_130_103
            grammar index: 36
            bodies:
	36:93 def$float_token_group_130_103=>• . θnum - 
            compile time: 2.247ms*/;
function $def$float_token_group_130_103(l,data,state){
    /*36:93 def$float_token_group_130_103=>• . θnum*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==46/*[.]*/){
        consume(l,data,state);
        puid |=1;
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        /*36:93 def$float_token_group_130_103=>. • θnum*/
        skip_a391223c0048eca8(l/*[ ws ][ 23 ][ nl ]*/,data,true);
        puid |=2;
        if(l.isNum(data)&&consume(l,data,state)){
            add_reduce(state,data,2,0);
            return 36;
        }
    }
    return -1;
}
function $def$float_token_group_130_103_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*36:93 def$float_token_group_130_103=>. θnum •*/
        add_reduce(state,data,2,0);
    }
    return 36;
}
/*production name: def$float_token
            grammar index: 37
            bodies:
	37:94 def$float_token=>• θnum def$float_token_group_130_103 - 
		37:95 def$float_token=>• θnum - 
            compile time: 16.243ms*/;
function $def$float_token(l,data,state){
    /*37:94 def$float_token=>• θnum def$float_token_group_130_103
    37:95 def$float_token=>• θnum*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.isNum(data)){
        consume(l,data,state);
        puid |=1;
        /*37:94 def$float_token=>θnum • def$float_token_group_130_103
        37:95 def$float_token=>θnum •*/
        skip_4632a552a92a99ca(l/*[ num ][ 23 ]*/,data,true);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if(l.current_byte==46/*[.]*/){
            pushFN(data,branch_e9fd2933af78d6f4);
            return branch_dd8b8d0fc9a3e7f1(l,data,state,prod,1);
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*37:95 def$float_token=>θnum •*/
            return 37;
        }
    }
    return -1;
}
function $def$float_token_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*37:94 def$float_token=>θnum def$float_token_group_130_103 •*/
        add_reduce(state,data,2,0);
    }
    return 37;
}
/*production name: def$hex_token_group_044_104
            grammar index: 38
            bodies:
	38:96 def$hex_token_group_044_104=>• θnum - 
		38:97 def$hex_token_group_044_104=>• a - 
		38:98 def$hex_token_group_044_104=>• b - 
		38:99 def$hex_token_group_044_104=>• c - 
		38:100 def$hex_token_group_044_104=>• d - 
		38:101 def$hex_token_group_044_104=>• e - 
		38:102 def$hex_token_group_044_104=>• f - 
		38:103 def$hex_token_group_044_104=>• A - 
		38:104 def$hex_token_group_044_104=>• B - 
		38:105 def$hex_token_group_044_104=>• C - 
		38:106 def$hex_token_group_044_104=>• D - 
		38:107 def$hex_token_group_044_104=>• E - 
		38:108 def$hex_token_group_044_104=>• F - 
            compile time: 19.619ms*/;
function $def$hex_token_group_044_104(l,data,state){
    /*38:96 def$hex_token_group_044_104=>• θnum
    38:97 def$hex_token_group_044_104=>• a
    38:98 def$hex_token_group_044_104=>• b
    38:99 def$hex_token_group_044_104=>• c
    38:100 def$hex_token_group_044_104=>• d
    38:101 def$hex_token_group_044_104=>• e
    38:102 def$hex_token_group_044_104=>• f
    38:103 def$hex_token_group_044_104=>• A
    38:104 def$hex_token_group_044_104=>• B
    38:105 def$hex_token_group_044_104=>• C
    38:106 def$hex_token_group_044_104=>• D
    38:107 def$hex_token_group_044_104=>• E
    38:108 def$hex_token_group_044_104=>• F*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(l.isNum(data)){
        pushFN(data,branch_0068265f76323ae8);
        return branch_4a07849d9379ebd9(l,data,state,prod,1);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==97/*[a]*/){
        pushFN(data,branch_0068265f76323ae8);
        return branch_37335f44f4748896(l,data,state,prod,2);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==98/*[b]*/){
        pushFN(data,branch_0068265f76323ae8);
        return branch_7b42329645c94739(l,data,state,prod,4);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==99/*[c]*/){
        pushFN(data,branch_0068265f76323ae8);
        return branch_6df401b0a0db4a8c(l,data,state,prod,8);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==100/*[d]*/){
        pushFN(data,branch_0068265f76323ae8);
        return branch_d97c8f44cf6963ef(l,data,state,prod,16);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==101/*[e]*/){
        pushFN(data,branch_0068265f76323ae8);
        return branch_499ca913f0560dae(l,data,state,prod,32);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==102/*[f]*/){
        pushFN(data,branch_0068265f76323ae8);
        return branch_003866e5f13c0fae(l,data,state,prod,64);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==65/*[A]*/){
        pushFN(data,branch_0068265f76323ae8);
        return branch_2b1338328efc96b7(l,data,state,prod,128);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==66/*[B]*/){
        pushFN(data,branch_0068265f76323ae8);
        return branch_bdcbba1d338025e3(l,data,state,prod,256);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==67/*[C]*/){
        pushFN(data,branch_0068265f76323ae8);
        return branch_c077d972bc6da303(l,data,state,prod,512);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==68/*[D]*/){
        pushFN(data,branch_0068265f76323ae8);
        return branch_2d4ff674007d174e(l,data,state,prod,1024);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==69/*[E]*/){
        pushFN(data,branch_0068265f76323ae8);
        return branch_33110ec465cce631(l,data,state,prod,2048);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==70/*[F]*/){
        pushFN(data,branch_0068265f76323ae8);
        return branch_4e21588bca1f3fc9(l,data,state,prod,4096);
    }
    return -1;
}
function $def$hex_token_group_044_104_reducer(l,data,state,prod,puid){
    return 38;
}
/*production name: def$hex_token_HC_listbody1_105
            grammar index: 39
            bodies:
	39:109 def$hex_token_HC_listbody1_105=>• def$hex_token_HC_listbody1_105 def$hex_token_group_044_104 - 
		39:110 def$hex_token_HC_listbody1_105=>• def$hex_token_group_044_104 - 
            compile time: 12.507ms*/;
function $def$hex_token_HC_listbody1_105(l,data,state){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*39:110 def$hex_token_HC_listbody1_105=>• def$hex_token_group_044_104*/
    puid |=2;
    pushFN(data1,branch_1d621c607d7a9b60);
    pushFN(data3,$def$hex_token_group_044_104);
    return puid;
    return -1;
}
function $def$hex_token_HC_listbody1_105_goto(l,data,state,prod){
    if(l.isSP(true,data)){
        return 39;
    }
    /*39:109 def$hex_token_HC_listbody1_105=>def$hex_token_HC_listbody1_105 • def$hex_token_group_044_104
    40:111 def$hex_token=>0x def$hex_token_HC_listbody1_105 •*/
    skip_1a45429b83435415(l/*[ 23 ][ nl ]*/,data,true);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(assert_ascii(l,0x0,0x0,0x7e,0x7e)||l.isNum(data)){
        pushFN(data,branch_f1d04cf35d9adae9);
        return branch_7e5db33ab38760b2(l,data,state,prod,1);
    }
    return prod == 39 ? prod : -1;
}
function $def$hex_token_HC_listbody1_105_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*39:109 def$hex_token_HC_listbody1_105=>def$hex_token_HC_listbody1_105 def$hex_token_group_044_104 •*/
        add_reduce(state,data,2,3);
    } else if(2 == puid){
        /*39:110 def$hex_token_HC_listbody1_105=>def$hex_token_group_044_104 •*/
        add_reduce(state,data,1,2);
    }
    return 39;
}
/*production name: def$hex_token
            grammar index: 40
            bodies:
	40:111 def$hex_token=>• 0x def$hex_token_HC_listbody1_105 - 
            compile time: 2.199ms*/;
function $def$hex_token(l,data,state){
    /*40:111 def$hex_token=>• 0x def$hex_token_HC_listbody1_105*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(/*[0x]*/cmpr_set(l,data,17,2,2)){
        consume(l,data,state);
        puid |=1;
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        /*40:111 def$hex_token=>0x • def$hex_token_HC_listbody1_105*/
        skip_1a45429b83435415(l/*[ 23 ][ nl ]*/,data,true);
        puid |=2;
        pushFN(data1,branch_bc1c3af3f8a28eba);
        pushFN(data3,$def$hex_token_HC_listbody1_105);
        return puid;
    }
    return -1;
}
function $def$hex_token_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*40:111 def$hex_token=>0x def$hex_token_HC_listbody1_105 •*/
        add_reduce(state,data,2,0);
    }
    return 40;
}
/*production name: def$binary_token_group_047_106
            grammar index: 41
            bodies:
	41:112 def$binary_token_group_047_106=>• 0 - 
		41:113 def$binary_token_group_047_106=>• 1 - 
            compile time: 2.888ms*/;
function $def$binary_token_group_047_106(l,data,state){
    /*41:112 def$binary_token_group_047_106=>• 0
    41:113 def$binary_token_group_047_106=>• 1*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(l.current_byte==48/*[0]*/){
        pushFN(data,branch_1aa0fc6f9431dcc9);
        return branch_9481f6bfa7c58125(l,data,state,prod,1);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==49/*[1]*/){
        pushFN(data,branch_1aa0fc6f9431dcc9);
        return branch_fd45fb23d91bdec8(l,data,state,prod,2);
    }
    return -1;
}
function $def$binary_token_group_047_106_reducer(l,data,state,prod,puid){
    return 41;
}
/*production name: def$binary_token_HC_listbody1_107
            grammar index: 42
            bodies:
	42:114 def$binary_token_HC_listbody1_107=>• def$binary_token_HC_listbody1_107 def$binary_token_group_047_106 - 
		42:115 def$binary_token_HC_listbody1_107=>• def$binary_token_group_047_106 - 
            compile time: 8.971ms*/;
function $def$binary_token_HC_listbody1_107(l,data,state){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*42:115 def$binary_token_HC_listbody1_107=>• def$binary_token_group_047_106*/
    puid |=2;
    pushFN(data1,branch_3ff78bcd6d844082);
    pushFN(data3,$def$binary_token_group_047_106);
    return puid;
    return -1;
}
function $def$binary_token_HC_listbody1_107_goto(l,data,state,prod){
    if(l.isSP(true,data)){
        return 42;
    }
    /*42:114 def$binary_token_HC_listbody1_107=>def$binary_token_HC_listbody1_107 • def$binary_token_group_047_106
    43:116 def$binary_token=>0b def$binary_token_HC_listbody1_107 •*/
    skip_41e306b5d22e0b8a(l/*[ num ][ 23 ][ nl ]*/,data,true);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if((l.current_byte==48/*[0]*/)||(l.current_byte==49/*[1]*/)){
        pushFN(data,branch_06925892f9159902);
        return branch_3fbc5a7d58ed794e(l,data,state,prod,1);
    }
    return prod == 42 ? prod : -1;
}
function $def$binary_token_HC_listbody1_107_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*42:114 def$binary_token_HC_listbody1_107=>def$binary_token_HC_listbody1_107 def$binary_token_group_047_106 •*/
        add_reduce(state,data,2,3);
    } else if(2 == puid){
        /*42:115 def$binary_token_HC_listbody1_107=>def$binary_token_group_047_106 •*/
        add_reduce(state,data,1,2);
    }
    return 42;
}
/*production name: def$binary_token
            grammar index: 43
            bodies:
	43:116 def$binary_token=>• 0b def$binary_token_HC_listbody1_107 - 
            compile time: 2.217ms*/;
function $def$binary_token(l,data,state){
    /*43:116 def$binary_token=>• 0b def$binary_token_HC_listbody1_107*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(/*[0b]*/cmpr_set(l,data,63,2,2)){
        consume(l,data,state);
        puid |=1;
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        /*43:116 def$binary_token=>0b • def$binary_token_HC_listbody1_107*/
        skip_41e306b5d22e0b8a(l/*[ num ][ 23 ][ nl ]*/,data,true);
        puid |=2;
        pushFN(data1,branch_a3bb1039c7409cb7);
        pushFN(data3,$def$binary_token_HC_listbody1_107);
        return puid;
    }
    return -1;
}
function $def$binary_token_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*43:116 def$binary_token=>0b def$binary_token_HC_listbody1_107 •*/
        add_reduce(state,data,2,0);
    }
    return 43;
}
/*production name: def$octal_token_group_050_108
            grammar index: 44
            bodies:
	44:117 def$octal_token_group_050_108=>• 0o - 
		44:118 def$octal_token_group_050_108=>• 0O - 
            compile time: 3.081ms*/;
function $def$octal_token_group_050_108(l,data,state){
    /*44:117 def$octal_token_group_050_108=>• 0o
    44:118 def$octal_token_group_050_108=>• 0O*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(/*[0o]*/cmpr_set(l,data,65,2,2)){
        pushFN(data,branch_6bffe2b7f9da4ffd);
        return branch_5b6c4e9dd6e0d7ac(l,data,state,prod,1);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(/*[0O]*/cmpr_set(l,data,67,2,2)){
        pushFN(data,branch_6bffe2b7f9da4ffd);
        return branch_d4bb848ab2ba8a25(l,data,state,prod,2);
    }
    return -1;
}
function $def$octal_token_group_050_108_reducer(l,data,state,prod,puid){
    return 44;
}
/*production name: def$octal_token_group_058_109
            grammar index: 45
            bodies:
	45:119 def$octal_token_group_058_109=>• 0 - 
		45:120 def$octal_token_group_058_109=>• 1 - 
		45:121 def$octal_token_group_058_109=>• 2 - 
		45:122 def$octal_token_group_058_109=>• 3 - 
		45:123 def$octal_token_group_058_109=>• 4 - 
		45:124 def$octal_token_group_058_109=>• 5 - 
		45:125 def$octal_token_group_058_109=>• 6 - 
		45:126 def$octal_token_group_058_109=>• 7 - 
            compile time: 7.864ms*/;
function $def$octal_token_group_058_109(l,data,state){
    /*45:119 def$octal_token_group_058_109=>• 0
    45:120 def$octal_token_group_058_109=>• 1
    45:121 def$octal_token_group_058_109=>• 2
    45:122 def$octal_token_group_058_109=>• 3
    45:123 def$octal_token_group_058_109=>• 4
    45:124 def$octal_token_group_058_109=>• 5
    45:125 def$octal_token_group_058_109=>• 6
    45:126 def$octal_token_group_058_109=>• 7*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(l.current_byte==48/*[0]*/){
        pushFN(data,branch_308bdd9a72b6d6bd);
        return branch_5177f82fd659c862(l,data,state,prod,1);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==49/*[1]*/){
        pushFN(data,branch_308bdd9a72b6d6bd);
        return branch_c48a0e3ff0974d75(l,data,state,prod,2);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==50/*[2]*/){
        pushFN(data,branch_308bdd9a72b6d6bd);
        return branch_802f96b401835633(l,data,state,prod,4);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==51/*[3]*/){
        pushFN(data,branch_308bdd9a72b6d6bd);
        return branch_72348d66249b777e(l,data,state,prod,8);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==52/*[4]*/){
        pushFN(data,branch_308bdd9a72b6d6bd);
        return branch_a491c3d95391604f(l,data,state,prod,16);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==53/*[5]*/){
        pushFN(data,branch_308bdd9a72b6d6bd);
        return branch_182aa74f9353388c(l,data,state,prod,32);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==54/*[6]*/){
        pushFN(data,branch_308bdd9a72b6d6bd);
        return branch_f08ef7120a7f420c(l,data,state,prod,64);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==55/*[7]*/){
        pushFN(data,branch_308bdd9a72b6d6bd);
        return branch_4743ed6f49357bf9(l,data,state,prod,128);
    }
    return -1;
}
function $def$octal_token_group_058_109_reducer(l,data,state,prod,puid){
    return 45;
}
/*production name: def$octal_token_HC_listbody1_110
            grammar index: 46
            bodies:
	46:127 def$octal_token_HC_listbody1_110=>• def$octal_token_HC_listbody1_110 def$octal_token_group_058_109 - 
		46:128 def$octal_token_HC_listbody1_110=>• def$octal_token_group_058_109 - 
            compile time: 11.421ms*/;
function $def$octal_token_HC_listbody1_110(l,data,state){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*46:128 def$octal_token_HC_listbody1_110=>• def$octal_token_group_058_109*/
    puid |=2;
    pushFN(data1,branch_32c16ff65f0c4c5c);
    pushFN(data3,$def$octal_token_group_058_109);
    return puid;
    return -1;
}
function $def$octal_token_HC_listbody1_110_goto(l,data,state,prod){
    if(l.isSP(true,data)){
        return 46;
    }
    /*46:127 def$octal_token_HC_listbody1_110=>def$octal_token_HC_listbody1_110 • def$octal_token_group_058_109
    47:129 def$octal_token=>def$octal_token_group_050_108 def$octal_token_HC_listbody1_110 •*/
    skip_41e306b5d22e0b8a(l/*[ num ][ 23 ][ nl ]*/,data,true);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(assert_ascii(l,0x0,0xff0000,0x0,0x0)){
        pushFN(data,branch_17ec808d31868fe1);
        return branch_cf5c7dfb45fd7f44(l,data,state,prod,1);
    }
    return prod == 46 ? prod : -1;
}
function $def$octal_token_HC_listbody1_110_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*46:127 def$octal_token_HC_listbody1_110=>def$octal_token_HC_listbody1_110 def$octal_token_group_058_109 •*/
        add_reduce(state,data,2,3);
    } else if(2 == puid){
        /*46:128 def$octal_token_HC_listbody1_110=>def$octal_token_group_058_109 •*/
        add_reduce(state,data,1,2);
    }
    return 46;
}
/*production name: def$octal_token
            grammar index: 47
            bodies:
	47:129 def$octal_token=>• def$octal_token_group_050_108 def$octal_token_HC_listbody1_110 - 
            compile time: 3.081ms*/;
function $def$octal_token(l,data,state){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*47:129 def$octal_token=>• def$octal_token_group_050_108 def$octal_token_HC_listbody1_110*/
    puid |=1;
    pushFN(data1,branch_405a6f3334254c06);
    pushFN(data3,$def$octal_token_group_050_108);
    return puid;
    return -1;
}
function $def$octal_token_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*47:129 def$octal_token=>def$octal_token_group_050_108 def$octal_token_HC_listbody1_110 •*/
        add_reduce(state,data,2,0);
    }
    return 47;
}
/*production name: def$js_identifier
            grammar index: 55
            bodies:
	55:150 def$js_identifier=>• tk:def$js_id_symbols - 
            compile time: 1.925ms*/;
function $def$js_identifier(l,data,state){
    /*55:150 def$js_identifier=>• tk:def$js_id_symbols*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(tk_c0be937e31ebe138(l,data)){
        consume(l,data,state);
        puid |=1;
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        /*55:150 def$js_identifier=>tk:def$js_id_symbols •*/
        return 55;
    }
    return -1;
}
function $def$js_identifier_reducer(l,data,state,prod,puid){
    return 55;
}
/*production name: def$js_id_symbols
            grammar index: 56
            bodies:
	56:151 def$js_id_symbols=>• def$js_id_symbols θid - 
		56:152 def$js_id_symbols=>• def$js_id_symbols _ - 
		56:153 def$js_id_symbols=>• def$js_id_symbols $ - 
		56:154 def$js_id_symbols=>• def$js_id_symbols θnum - 
		56:155 def$js_id_symbols=>• _ - 
		56:156 def$js_id_symbols=>• $ - 
		56:157 def$js_id_symbols=>• θid - 
            compile time: 16.112ms*/;
function $def$js_id_symbols(l,data,state){
    /*56:155 def$js_id_symbols=>• _
    56:156 def$js_id_symbols=>• $
    56:157 def$js_id_symbols=>• θid*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(l.isUniID(data)){
        pushFN(data,branch_0d9c67e4ed206e1e);
        return branch_b11cd2d9749d17dc(l,data,state,prod,2);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==95/*[_]*/){
        pushFN(data,branch_0d9c67e4ed206e1e);
        return branch_c3859feb35f63496(l,data,state,prod,4);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==36/*[$]*/){
        pushFN(data,branch_0d9c67e4ed206e1e);
        return branch_6ea5587bedf07118(l,data,state,prod,8);
    }
    return -1;
}
function $def$js_id_symbols_goto(l,data,state,prod){
    while(1){
        if(l.isSP(true,data)){
            return 56;
        }
        /*56:151 def$js_id_symbols=>def$js_id_symbols • θid
        56:152 def$js_id_symbols=>def$js_id_symbols • _
        56:153 def$js_id_symbols=>def$js_id_symbols • $
        56:154 def$js_id_symbols=>def$js_id_symbols • θnum
        55:150 def$js_identifier=>tk:def$js_id_symbols •*/
        skip_1a45429b83435415(l/*[ 23 ][ nl ]*/,data,true);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.isUniID(data)){
            pushFN(data,branch_6330ec7a5b95b490);
            return branch_7589d196fa8431fc(l,data,state,prod,1);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if(l.isNum(data)){
            pushFN(data,branch_6330ec7a5b95b490);
            return branch_cabb1ebadf014f59(l,data,state,prod,1);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if(l.current_byte==95/*[_]*/){
            pushFN(data,branch_6330ec7a5b95b490);
            return branch_45b5a3d639c0c54a(l,data,state,prod,1);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if(l.current_byte==36/*[$]*/){
            pushFN(data,branch_6330ec7a5b95b490);
            return branch_ff10e4686defaf36(l,data,state,prod,1);
        }
        break;
    }
    return prod == 56 ? prod : -1;
}
function $def$js_id_symbols_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*56:151 def$js_id_symbols=>def$js_id_symbols θid •*/
        add_reduce(state,data,2,5);
    } else if(5 == puid){
        /*56:152 def$js_id_symbols=>def$js_id_symbols _ •*/
        add_reduce(state,data,2,5);
    } else if(9 == puid){
        /*56:153 def$js_id_symbols=>def$js_id_symbols $ •*/
        add_reduce(state,data,2,5);
    } else if(17 == puid){
        /*56:154 def$js_id_symbols=>def$js_id_symbols θnum •*/
        add_reduce(state,data,2,5);
    }
    return 56;
}
function recognizer(data,input_byte_length,production){
    data.input_len = input_byte_length;
    data.lexer.next(data);
    skip_c7e5e40af478ecc8(data.lexer/*[ ws ][ num ][ 23 ][ nl ]*/,data,true);
    dispatch(data,0);
    run(data);
}

    const data_stack = [];
    function run(data) {
        data_stack.length = 0;
        data_stack.push(data);
        let ACTIVE = true;
        while (ACTIVE) {
            for (const data of data_stack)
                ACTIVE = stepKernel(data,0);
        }
    }

    function stepKernel(data, stack_base) {

        let ptr = data.stack_ptr;

        const fn = data.stack[ptr];
        const stash = data.stash[ptr];
        data.stack_ptr--;

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

    function pushFN(data, fn_ref){ data.stack[++data.stack_ptr] = fn_ref; }

    function init_table(){ return lookup_table;  }
    
  
    function dispatch(data, production_index){
        switch (production_index) {
            case 0: data.stack[0] = $start; data.stash = -1; return;            
case 1: data.stack[0] = $blocks_group_22_100; data.stash = -1; return;            
case 2: data.stack[0] = $blocks; data.stash = -1; return;            
case 3: data.stack[0] = $expressions; data.stash = -1; return;            
case 4: data.stack[0] = $expression; data.stash = -1; return;            
case 5: data.stack[0] = $math_expression; data.stash = -1; return;            
case 6: data.stack[0] = $additive; data.stash = -1; return;            
case 7: data.stack[0] = $multiplicative; data.stash = -1; return;            
case 8: data.stack[0] = $unary; data.stash = -1; return;            
case 9: data.stack[0] = $closure; data.stash = -1; return;            
case 10: data.stack[0] = $fnB_group_026_104; data.stash = -1; return;            
case 11: data.stack[0] = $literal; data.stash = -1; return;            
case 12: data.stack[0] = $reserved_word; data.stash = -1; return;            
case 13: data.stack[0] = $identifier_group_039_105; data.stash = -1; return;            
case 14: data.stack[0] = $identifier; data.stash = -1; return;            
case 15: data.stack[0] = $comment_group_045_106; data.stash = -1; return;            
case 16: data.stack[0] = $comment_HC_listbody1_107; data.stash = -1; return;            
case 17: data.stack[0] = $comment; data.stash = -1; return;            
case 18: data.stack[0] = $def$hex; data.stash = -1; return;            
case 19: data.stack[0] = $def$binary; data.stash = -1; return;            
case 20: data.stack[0] = $def$octal; data.stash = -1; return;            
case 21: data.stack[0] = $def$number; data.stash = -1; return;            
case 22: data.stack[0] = $def$scientific_token_group_027_101; data.stash = -1; return;            
case 23: data.stack[0] = $def$scientific_token_group_228_102; data.stash = -1; return;            
case 24: data.stack[0] = $def$scientific_token; data.stash = -1; return;            
case 25: data.stack[0] = $def$float_token_group_130_103; data.stash = -1; return;            
case 26: data.stack[0] = $def$float_token; data.stash = -1; return;            
case 27: data.stack[0] = $def$hex_token_group_044_104; data.stash = -1; return;            
case 28: data.stack[0] = $def$hex_token_HC_listbody1_105; data.stash = -1; return;            
case 29: data.stack[0] = $def$hex_token; data.stash = -1; return;            
case 30: data.stack[0] = $def$binary_token_group_047_106; data.stash = -1; return;            
case 31: data.stack[0] = $def$binary_token_HC_listbody1_107; data.stash = -1; return;            
case 32: data.stack[0] = $def$binary_token; data.stash = -1; return;            
case 33: data.stack[0] = $def$octal_token_group_050_108; data.stash = -1; return;            
case 34: data.stack[0] = $def$octal_token_group_058_109; data.stash = -1; return;            
case 35: data.stack[0] = $def$octal_token_HC_listbody1_110; data.stash = -1; return;            
case 36: data.stack[0] = $def$octal_token; data.stash = -1; return;            
case 37: data.stack[0] = $def$js_identifier; data.stash = -1; return;            
case 38: data.stack[0] = $def$js_id_symbols; data.stash = -1; return;
        }
    }

    

    function delete_data(){};
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

const fns = [(e,sym)=>sym[sym.length-1], 
(env, sym, pos)=>( (sym[0].push(sym[2]),sym[0]))/*0*/
,(env, sym, pos)=>( [sym[0]])/*1*/
,(env, sym, pos)=>( (sym[0].push(sym[1]),sym[0]))/*2*/
,(env, sym, pos)=>( sym[1])/*3*/
,(env, sym, pos)=>( sym[0]+sym[1])/*4*/
,(env, sym, pos)=>( sym[0]+"")/*5*/]; 

const parser_factory = ParserFactory(fns, undefined, data);

export { fns as parser_functions, data as parser_data, parser_factory }; 