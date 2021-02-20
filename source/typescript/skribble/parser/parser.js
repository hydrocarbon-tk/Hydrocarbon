import {ParserFactory} from "@candlefw/hydrocarbon"; 

const data = (()=>{
        
    const lookup_table = new Uint8Array(382976);
    const sequence_lookup = [123,125,58,40,41,44,59,61,46,91,93,95,36,92,34,39,47,42,47,60,60,45,45,45,62,62,48,120,105,109,112,111,114,116,110,117,108,108,99,111,110,116,105,110,117,101,115,116,114,105,110,103,102,97,108,115,101,120,112,111,114,116,108,111,111,112,109,97,116,99,104,98,114,101,97,107,114,101,116,117,114,110,117,105,110,116,56,49,50,56,51,50,54,52,116,114,117,101,112,114,105,118,100,65,66,67,68,69,70,53,55,47,47,48,98,105,109,117,116,110,115,99,108,115,102,108,116,101,108,115,101,49,54,112,117,98,48,111,48,79,105,115,105,102,110];
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
        // the byte length is of the passed in type
        isDiscrete(data, assert_class, USE_UNICODE) {

            let type = 0;

            let offset = this.byte_offset + this.byte_length;

            if(offset >= data.input_len) return true;

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
            stack = [];

        return {
            valid:false,
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
function branch_02eb391527603263(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==58/*[:]*/){
        /*
           43:125 primitive_declaration=>modifier_list identifier : • type primitive_declaration_group_169_116
           43:127 primitive_declaration=>modifier_list identifier : • type
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_733dda514d501201);
        pushFN(data,$type);
        return 0;
    }
    /*02eb391527603263046b2747f3de0250*/
}
function branch_036ea9fff19e1e00(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==58/*[:]*/){
        /*
           43:125 primitive_declaration=>modifier_list identifier : • type primitive_declaration_group_169_116
           43:127 primitive_declaration=>modifier_list identifier : • type
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_784316aebe56b368);
        pushFN(data,$type);
        return 0;
    }
    /*036ea9fff19e1e00e3e89f129a6d3c8c*/
}
function branch_03805b72892b5f19(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    switch(sym_map_c889cd6dda6b71c6(l,data)){
        default:
        case 0:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            add_reduce(state,data,2,45);
            /*-------------INDIRECT-------------------*/
            return 18;
        case 1:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_40c5ff801836a1f7);
            pushFN(data,$expression);
            return 0;
        case 2:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
            pushFN(data,branch_40c5ff801836a1f7);
            pushFN(data,$expression);
            return 0;
    }
    /*03805b72892b5f195804251550b8216d*/
}
function branch_038b1722715d8efb(l,data,state,prod){
    pushFN(data,$expression_goto);
    return 21;
    /*038b1722715d8efb9ed568e83d0a0a33*/
}
function branch_038fc405f6451b6c(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,10,27);
        /*-------------INDIRECT-------------------*/
        pushFN(data,branch_5421d5d86a2a00b8);
        return 26;
    }
    /*038fc405f6451b6c8d745ad13aba4915*/
}
function branch_039604f80d45143d(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(cmpr_set(l,data,121,3,3)){
        /*
           11:24 class=>modifier_list cls • identifier class_group_113_103 { class_HC_listbody1_105 }
           11:26 class=>modifier_list cls • identifier { class_HC_listbody1_105 }
           11:27 class=>modifier_list cls • identifier class_group_113_103 { }
           11:30 class=>modifier_list cls • identifier { }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_2987b5a20b363d81);
        pushFN(data,$identifier);
        return 0;
    }
    /*039604f80d45143d6ed055ed3e4e0a97*/
}
function branch_03d55556b8274032(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,10,20);
        return 13;
    }
    /*03d55556b827403254ce4bdc58098fe5*/
}
function branch_044401f378a8c0e6(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        /*
           43:125 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_169_116
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_7edcada999e77066);
        pushFN(data,$primitive_declaration_group_169_116);
        return 0;
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*
           43:127 primitive_declaration=>modifier_list identifier : type •
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        add_reduce(state,data,4,75);
        return 43;
    }
    /*044401f378a8c0e6b9390198ab988242*/
}
function branch_04515de74b4995c1(l,data,state,prod){
    pushFN(data,branch_45b78c1aca41cc8a);
    return 26;
    /*04515de74b4995c172c42ccef5ef3bf3*/
}
function branch_05fab80da325e5d3(l,data,state,prod){
    add_reduce(state,data,3,46);
    /*-------------INDIRECT-------------------*/
    pushFN(data,branch_45b78c1aca41cc8a);
    return 21;
    /*05fab80da325e5d32c2c20cf337b1538*/
}
function branch_062cf06014c92bd4(l,data,state,prod){
    add_reduce(state,data,1,88);
    pushFN(data,$string_HC_listbody1_126_goto);
    return 58;
    /*062cf06014c92bd433ba0be6e6fe6477*/
}
function branch_064958dada8081eb(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        /*
           43:126 primitive_declaration=>identifier : type • primitive_declaration_group_169_116
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_1e7893ab66a1cbfd);
        pushFN(data,$primitive_declaration_group_169_116);
        return 0;
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*
           43:128 primitive_declaration=>identifier : type •
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        add_reduce(state,data,3,76);
    }
    /*064958dada8081eb73ebaf0f242a5359*/
}
function branch_068c592ce9232acd(l,data,state,prod){
    add_reduce(state,data,1,67);
    pushFN(data,$unary_value_goto);
    return 37;
    /*068c592ce9232acd09fc83ae4d2eef03*/
}
function branch_06cb1680ebf4efdd(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    switch(sym_map_595f96e39304d306(l,data)){
        default:
        case 0:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            add_reduce(state,data,2,45);
            /*-------------INDIRECT-------------------*/
            /*31:98 loop_expression=>loop expression •*/
            /*VL:0*/
            add_reduce(state,data,2,52);
            return 31;
        case 1:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_88bbcc9023e955e5);
            pushFN(data,$expression);
            return 0;
        case 2:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
            pushFN(data,branch_88bbcc9023e955e5);
            pushFN(data,$expression);
            return 0;
    }
    /*06cb1680ebf4efddc26be3973dbb3ab5*/
}
function branch_06fb8b673d2402f8(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==41/*[)]*/){
        /*
           13:36 function=>modifier_list fn identifier : type ( parameters ) • { expression_statements }
           13:39 function=>modifier_list fn identifier : type ( parameters ) • { }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if(l.current_byte==123/*[{]*/){
            /*
               13:36 function=>modifier_list fn identifier : type ( parameters ) { • expression_statements }
               13:39 function=>modifier_list fn identifier : type ( parameters ) { • }
            */
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if(l.current_byte==125/*[}]*/){
                /*
                   13:39 function=>modifier_list fn identifier : type ( parameters ) { • }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                consume(l,data,state);
                add_reduce(state,data,10,22);
                /*-------------INDIRECT-------------------*/
                pushFN(data,$statements_goto);
                return 4;
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   13:36 function=>modifier_list fn identifier : type ( parameters ) { • expression_statements }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_6ea9c551086a9b7b);
                pushFN(data,$expression_statements);
                return 0;
            }
        }
    }
    /*06fb8b673d2402f8614ff09c011ec681*/
}
function branch_07626bd16c9eede0(l,data,state,prod){
    add_reduce(state,data,3,46);
    return 25;
    /*07626bd16c9eede00d6a99ce4b3d3b8d*/
}
function branch_07c4b2a266e81cdd(l,data,state,prod){
    pushFN(data,$unary_value_goto);
    return 27;
    /*07c4b2a266e81cdd4fa52870e019ca27*/
}
function branch_0887d0c4ca0085d1(l,data,state,prod){
    add_reduce(state,data,3,42);
    add_reduce(state,data,1,3);
    /*0887d0c4ca0085d1ea37c430aaefbd25*/
}
function branch_0a448c75b1ecf242(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==58/*[:]*/){
        /*
           13:36 function=>modifier_list fn identifier : • type ( parameters ) { expression_statements }
           13:38 function=>modifier_list fn identifier : • type ( ) { expression_statements }
           13:39 function=>modifier_list fn identifier : • type ( parameters ) { }
           13:42 function=>modifier_list fn identifier : • type ( ) { }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_99b1a244a91348da);
        pushFN(data,$type);
        return 0;
    }
    /*0a448c75b1ecf2424f14ba506d991a7d*/
}
function branch_0bb84167e13a1c29(l,data,state,prod){
    add_reduce(state,data,4,74);
    return 43;
    /*0bb84167e13a1c29e7a5357cfa2dbf68*/
}
function branch_0befa22b18dc0d64(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==40/*[(]*/){
        /*
           14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
           14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
           14:47 function_expression=>modifier_list fn : type ( • parameters ) { }
           14:50 function_expression=>modifier_list fn : type ( • ) { }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(l.current_byte==41/*[)]*/){
            /*
               14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
               14:50 function_expression=>modifier_list fn : type ( • ) { }
            */
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if(l.current_byte==123/*[{]*/){
                /*
                   14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }
                   14:50 function_expression=>modifier_list fn : type ( ) { • }
                */
                consume(l,data,state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if(l.current_byte==125/*[}]*/){
                    /*
                       14:50 function_expression=>modifier_list fn : type ( ) { • }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    consume(l,data,state);
                    add_reduce(state,data,8,33);
                    /*-------------INDIRECT-------------------*/
                    pushFN(data,branch_ee044d7019e306de);
                    return 26;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else {
                    /*
                       14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    pushFN(data,branch_11aa42ad7a0b684b);
                    pushFN(data,$expression_statements);
                    return 0;
                }
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
               14:47 function_expression=>modifier_list fn : type ( • parameters ) { }
            */
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_fb7a8f03b09e8c97);
            pushFN(data,$parameters);
            return 0;
        }
    }
    /*0befa22b18dc0d64e303c5208bc30344*/
}
function branch_0dbe0f35579ae63c(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        add_reduce(state,data,4,63);
        /*-------------INDIRECT-------------------*/
        pushFN(data,branch_ee044d7019e306de);
        return 26;
    }
    /*0dbe0f35579ae63cf9b802a4288d8dbc*/
}
function branch_0f7b03818ed6fa30(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,10,27);
        return 14;
    }
    /*0f7b03818ed6fa30c3155d343a804d63*/
}
function branch_0fdc5c5b577f7e48(l,data,state,prod){
    add_reduce(state,data,1,1);
    return 0;
    /*0fdc5c5b577f7e481c47b8e3e546f5f3*/
}
function branch_114bb222a4e1db2d(l,data,state,prod){
    pushFN(data,branch_e39790d5d793cb80);
    return 21;
    /*114bb222a4e1db2d6bdafc3e30b73579*/
}
function branch_11aa42ad7a0b684b(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,9,29);
        /*-------------INDIRECT-------------------*/
        pushFN(data,branch_ee044d7019e306de);
        return 26;
    }
    /*11aa42ad7a0b684b5c495428af53aa41*/
}
function branch_11ac48de192eee3d(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    pushFN(data,branch_c2432a04915ec0d0);
    pushFN(data,$type_group_097_124);
    return 0;
    /*11ac48de192eee3d05a67ecbf65e999f*/
}
function branch_11d890e1265c30e7(l,data,state,prod){
    pushFN(data,$expression_statements_group_023_108_goto);
    return 44;
    /*11d890e1265c30e7b243cc2af04fe35b*/
}
function branch_13452c6b0d137070(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,6,9);
        return 11;
    }
    /*13452c6b0d13707044524434228b6a1c*/
}
function branch_13ee8f2cbddfffa6(l,data,state,prod){
    add_reduce(state,data,4,74);
    add_reduce(state,data,1,3);
    /*13ee8f2cbddfffa639963baea4ac8499*/
}
function branch_13f6c10119d024c3(l,data,state,prod){
    add_reduce(state,data,1,3);
    pushFN(data,$comment_HC_listbody1_132_goto);
    return 69;
    /*13f6c10119d024c3feaafa524bb10e22*/
}
function branch_15d8af44efc142b0(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if(cmpr_set(l,data,17,2,2)&&consume(l,data,state)){
        add_reduce(state,data,3,0);
        return 71;
    }
    /*15d8af44efc142b03cec1b65be13cc72*/
}
function branch_160fff8c8a8384c1(l,data,state,prod){
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(l.current_byte==40/*[(]*/){
        /*
           142:359 virtual-95:3:1|-=>• loop_expression_group_254_111 expression
           143:360 virtual-98:2:1|-=>• expression
        */
        let pk = l.copy();
        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if(pk.current_byte==41/*[)]*/){
            /*
               143:360 virtual-98:2:1|-=>• expression
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_b8a7c3cf5d96bb89);
            pushFN(data,$expression);
            return 0;
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else {
            /*
               142:359 virtual-95:3:1|-=>• loop_expression_group_254_111 expression
               143:360 virtual-98:2:1|-=>• expression
            */
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            /*⤋⤋⤋ peek-unresolved ⤋⤋⤋*/
            if(((((dt_6ae31dd85a62ef5c(l,data)||cmpr_set(l,data,19,4,4))||assert_ascii(l,0x0,0x20000194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
                /*
                   29:92 loop_expression_group_254_111=>( • expression )
                   27:89 unary_value=>( • expression_statements_group_023_108 )
                */
                /*-------------VPROD-------------------------*/
                pushFN(data,branch_37b58e1db9e92a7b);
                return 0;
            }
        }
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else {
        /*
           143:360 virtual-98:2:1|-=>• expression
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_b8a7c3cf5d96bb89);
        pushFN(data,$expression);
        return 0;
    }
    return -1;
    /*160fff8c8a8384c1c55843148b24678d*/
}
function branch_1756bc6b46158c90(l,data,state,prod){
    add_reduce(state,data,3,46);
    /*-------------INDIRECT-------------------*/
    pushFN(data,branch_5421d5d86a2a00b8);
    return 21;
    /*1756bc6b46158c903796cb0394d8110a*/
}
function branch_17adc88335dcd394(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_f91ebab657293c51);
        pushFN(data,$expression);
        return 0;
    }
    /*17adc88335dcd394acd8663a02a0edba*/
}
function branch_17b826865a71f383(l,data,state,prod){
    add_reduce(state,data,2,87);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$def$string_value_HC_listbody2_114_goto);
    return 102;
    /*17b826865a71f383addb2ffeca58d7a5*/
}
function branch_184068955d11f054(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_907da7cc882c4c7b);
        pushFN(data,$expression);
        return 0;
    }
    /*184068955d11f054f3d2af337928a02c*/
}
function branch_192d4c70bbc2c906(l,data,state,prod){
    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    if(!(l.current_byte==58/*[:]*/)||l.END(data)){
        /*
           108:325 virtual-117:1:1|-=>•
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*37:117 member_expression=>identifier •*/
        /*VL:0*/
        add_reduce(state,data,1,67);
        pushFN(data,$expression_statements_group_023_108_goto);
        return 37;
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    } else {
        /*
           108:325 virtual-117:1:1|-=>•
           109:326 virtual-126:4:1|-=>• : type primitive_declaration_group_169_116
           110:327 virtual-128:3:1|-=>• : type
        */
        let pk = l.copy();
        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(((pk.current_byte==95/*[_]*/)||(pk.current_byte==36/*[$]*/))||pk.isUniID(data)){
            /*
               109:326 virtual-126:4:1|-=>• : type primitive_declaration_group_169_116
               110:327 virtual-128:3:1|-=>• : type
            */
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_e093aff9b89513a1);
            pushFN(data,$type);
            return 0;
        }
    }
    return -1;
    /*192d4c70bbc2c906fca9fac39b12d622*/
}
function branch_19c074d3aef73be7(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,9,29);
        return 14;
    }
    /*19c074d3aef73be7f92f54f23f4c1325*/
}
function branch_1b02061e2d759869(l,data,state,prod){
    add_reduce(state,data,3,42);
    add_reduce(state,data,1,3);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$expression_statements_goto);
    return 20;
    /*1b02061e2d759869ba7382d25bb36ddd*/
}
function branch_1d1f55b29f4c0c5e(l,data,state,prod){
    add_reduce(state,data,3,65);
    /*-------------INDIRECT-------------------*/
    pushFN(data,branch_5421d5d86a2a00b8);
    return 37;
    /*1d1f55b29f4c0c5efd115fe16d327286*/
}
function branch_1d4995829d243c99(l,data,state,prod){
    while(1){
        /*[142] [143]*/
        switch(prod){
            case 26:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                if(!((l.current_byte==61/*[=]*/)||l.isSym(true,data))||(cmpr_set(l,data,19,4,4)||assert_ascii(l,0x0,0xc001210,0xa8000000,0x20000000))){
                    /*
                       25:82 binary_expression=>unary_expression •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    /*31:98 loop_expression=>loop expression •*/
                    /*VL:0*/
                    add_reduce(state,data,2,52);
                    return 31;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if((l.current_byte==61/*[=]*/)||l.isSym(true,data)){
                    /*
                       25:80 binary_expression=>unary_expression • operator
                       25:81 binary_expression=>unary_expression • operator expression
                    */
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                    pushFN(data,branch_06cb1680ebf4efdd);
                    pushFN(data,$operator);
                    return 0;
                }
                break;
            case 29:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                if((((((((((((((tk_896177e00f155ef3(l,data)||tk_b838139d0d011665(l,data))||tk_f70d460017f6375f(l,data))||cmpr_set(l,data,142,2,2))||cmpr_set(l,data,66,5,5))||dt_bcea2102060eab13(l,data))||cmpr_set(l,data,94,4,4))||cmpr_set(l,data,34,4,4))||cmpr_set(l,data,19,4,4))||cmpr_set(l,data,71,5,5))||cmpr_set(l,data,76,6,6))||cmpr_set(l,data,38,8,8))||cmpr_set(l,data,62,4,4))||assert_ascii(l,0x0,0x20000100,0x8000000,0x8000000))||l.isSym(true,data)){
                    /*
                       142:359 virtual-95:3:1|-=>loop_expression_group_254_111 • expression
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                    pushFN(data,branch_cd0797f2f8c9681c);
                    pushFN(data,$expression);
                    return 0;
                }
                break;
        }
        break;
    }
    /*1d4995829d243c99c23351d0d1c63030*/
}
function branch_1e27bcd8c4931847(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    switch(sym_map_439a05cca98595e4(l,data)){
        default:
        case 0:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            add_reduce(state,data,2,45);
            add_reduce(state,data,1,3);
            /*-------------INDIRECT-------------------*/
            return 20;
        case 1:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_dd33ff05dfe6a2e3);
            pushFN(data,$expression);
            return 0;
        case 2:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
            pushFN(data,branch_dd33ff05dfe6a2e3);
            pushFN(data,$expression);
            return 0;
    }
    /*1e27bcd8c49318479fb17352e99855e6*/
}
function branch_1e7893ab66a1cbfd(l,data,state,prod){
    add_reduce(state,data,4,74);
    /*1e7893ab66a1cbfd29d02933d130daee*/
}
function branch_1e7e85452384a7b4(l,data,state,prod){
    skip_db1786a8af54d666(l/*[ 71 ]*/,data,true);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/){
        /*
           65:192 operator=>= operator_HC_listbody1_129 • identifier_token_group_079_119
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_34759af13d94fb85);
        pushFN(data,$identifier_token_group_079_119);
        return 0;
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*
           65:195 operator=>= operator_HC_listbody1_129 •
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        add_reduce(state,data,2,91);
        return 65;
    }
    /*1e7e85452384a7b46938039c51f2f6a9*/
}
function branch_1f0e8a0854632fda(l,data,state,prod){
    add_reduce(state,data,1,3);
    pushFN(data,$parameters_goto);
    return 16;
    /*1f0e8a0854632fdab5aca1813b55c705*/
}
function branch_2045222aad947cac(l,data,state,prod){
    pushFN(data,branch_5421d5d86a2a00b8);
    return 21;
    /*2045222aad947cacb594b453f69ee60a*/
}
function branch_210f970a58cb09ad(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,7,7);
        return 11;
    }
    /*210f970a58cb09ad34f5b47f81c87348*/
}
function branch_21d011590bad51a3(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_3205c0ded576131e);
        pushFN(data,$expression);
        return 0;
    }
    /*21d011590bad51a32273a62f36f86065*/
}
function branch_2301b1e5768ad852(l,data,state,prod){
    add_reduce(state,data,3,42);
    /*-------------INDIRECT-------------------*/
    pushFN(data,branch_5421d5d86a2a00b8);
    return 21;
    /*2301b1e5768ad8521c82412f2cd61b24*/
}
function branch_242856005a2da596(l,data,state,prod){
    add_reduce(state,data,2,2);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$namespace_HC_listbody3_102_goto);
    return 6;
    /*242856005a2da596104c599c86c6db4d*/
}
function branch_26cc5d061a038e2d(l,data,state,prod){
    skip_db1786a8af54d666(l/*[ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(l.isUniID(data)){
        /*
           48:137 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118 identifier_token_group_079_119
           48:139 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118
           48:140 identifier_token=>identifier_token_group_074_117 •
        */
        let pk = l.copy();
        skip_db1786a8af54d666(pk.next(data)/*[ 71 ]*/,data,false);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if(nocap_b2eb52235ee30b8a(pk)/*[ws] [nl]*/){
            /*
               48:137 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118 identifier_token_group_079_119
               48:139 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118
            */
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_c47e489f27fa73a8);
            pushFN(data,$identifier_token_HC_listbody1_118);
            return 0;
            /*⤋⤋⤋ peek-unresolved ⤋⤋⤋*/
        } else {
            /*
               48:137 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118 identifier_token_group_079_119
               48:139 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118
               48:140 identifier_token=>identifier_token_group_074_117 •
            */
            /*-------------VPROD-------------------------*/
            pushFN(data,branch_ed596ab4839b89f7);
            return 0;
        }
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/){
        /*
           48:138 identifier_token=>identifier_token_group_074_117 • identifier_token_group_079_119
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_92afc2d9878633ca);
        pushFN(data,$identifier_token_group_079_119);
        return 0;
        /*⤋⤋⤋ peek-unresolved ⤋⤋⤋*/
    } else if((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/)){
        /*
           48:137 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118 identifier_token_group_079_119
           48:139 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118
           48:140 identifier_token=>identifier_token_group_074_117 •
        */
        /*-------------VPROD-------------------------*/
        pushFN(data,branch_ef615d481f986166);
        return 0;
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*
           48:140 identifier_token=>identifier_token_group_074_117 •
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        return 48;
    }
    /*26cc5d061a038e2d4150fb981a12fef4*/
}
function branch_28441fe4dc9706e4(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==41/*[)]*/){
        /*
           14:44 function_expression=>modifier_list fn : type ( parameters ) • { expression_statements }
           14:47 function_expression=>modifier_list fn : type ( parameters ) • { }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if(l.current_byte==123/*[{]*/){
            /*
               14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }
               14:47 function_expression=>modifier_list fn : type ( parameters ) { • }
            */
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if(l.current_byte==125/*[}]*/){
                /*
                   14:47 function_expression=>modifier_list fn : type ( parameters ) { • }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                consume(l,data,state);
                add_reduce(state,data,9,30);
                return 14;
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_0f7b03818ed6fa30);
                pushFN(data,$expression_statements);
                return 0;
            }
        }
    }
    /*28441fe4dc9706e40e18a3bf9bb9d34b*/
}
function branch_28a5f499792ccaf8(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==58/*[:]*/)&&consume(l,data,state)){
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_69da744e43e07c30);
        pushFN(data,$expression);
        return 0;
    }
    /*28a5f499792ccaf830c882ea96ac93a4*/
}
function branch_28c5dc3955a9ede3(l,data,state,prod){
    pushFN(data,$statements_goto);
    return 50;
    /*28c5dc3955a9ede301c5ab8f3b51de91*/
}
function branch_294d2bc0d3721b32(l,data,state,prod){
    add_reduce(state,data,5,73);
    /*-------------INDIRECT-------------------*/
    pushFN(data,branch_5421d5d86a2a00b8);
    return 18;
    /*294d2bc0d3721b32496b9cdfdd6411db*/
}
function branch_298174b4face442a(l,data,state,prod){
    add_reduce(state,data,2,0);
    return 71;
    /*298174b4face442a2af2412e6606570e*/
}
function branch_2987b5a20b363d81(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(l.current_byte==123/*[{]*/){
        /*
           11:26 class=>modifier_list cls identifier • { class_HC_listbody1_105 }
           11:30 class=>modifier_list cls identifier • { }
        */
        let pk = l.copy();
        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(pk.current_byte==125/*[}]*/){
            /*
               11:30 class=>modifier_list cls identifier • { }
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
                add_reduce(state,data,5,13);
                return 11;
            }
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else {
            /*
               11:26 class=>modifier_list cls identifier • { class_HC_listbody1_105 }
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_13452c6b0d137070);
            pushFN(data,$class_HC_listbody1_105);
            return 0;
        }
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else {
        /*
           11:24 class=>modifier_list cls identifier • class_group_113_103 { class_HC_listbody1_105 }
           11:27 class=>modifier_list cls identifier • class_group_113_103 { }
        */
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_a49526eea2b79a2d);
        pushFN(data,$class_group_113_103);
        return 0;
    }
    /*2987b5a20b363d81c62f0a30d40a9420*/
}
function branch_29bbdf58183bc8d7(l,data,state,prod){
    pushFN(data,$statements_goto);
    return 4;
    /*29bbdf58183bc8d7e7031e798ef6fa26*/
}
function branch_29edd0f5b6da7777(l,data,state,prod){
    add_reduce(state,data,3,42);
    /*-------------INDIRECT-------------------*/
    pushFN(data,branch_ee044d7019e306de);
    return 21;
    /*29edd0f5b6da7777a2d12b50f1d1054e*/
}
function branch_2a06e3a7cc649a30(l,data,state,prod){
    /*43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116*/
    /*VL:0*/
    add_reduce(state,data,4,74);
    add_reduce(state,data,1,3);
    pushFN(data,$expression_statements_goto);
    return 20;
    /*2a06e3a7cc649a30b95b1273f2cfc95e*/
}
function branch_2cd334718ac51419(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    if(!(l.current_byte==61/*[=]*/)||l.END(data)){
        /*
           148:365 virtual-128:3:1|-=>: type •
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*43:128 primitive_declaration=>identifier • : type*/
        /*VL:2*/
        pushFN(data,branch_5421d5d86a2a00b8);
        return 43;
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else {
        /*
           147:364 virtual-126:4:1|-=>: type • primitive_declaration_group_169_116
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_6b4090ab809cd455);
        pushFN(data,$primitive_declaration_group_169_116);
        return 0;
    }
    /*2cd334718ac51419de96812c1496b1ee*/
}
function branch_2d28f14224cb4074(l,data,state,prod){
    add_reduce(state,data,1,88);
    pushFN(data,$def$string_value_HC_listbody2_114_goto);
    return 102;
    /*2d28f14224cb4074693e12102a54ec6a*/
}
function branch_2d42a0ce2f6d106e(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==40/*[(]*/){
        /*
           14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
           14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
           14:47 function_expression=>modifier_list fn : type ( • parameters ) { }
           14:50 function_expression=>modifier_list fn : type ( • ) { }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(l.current_byte==41/*[)]*/){
            /*
               14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
               14:50 function_expression=>modifier_list fn : type ( • ) { }
            */
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if(l.current_byte==123/*[{]*/){
                /*
                   14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }
                   14:50 function_expression=>modifier_list fn : type ( ) { • }
                */
                consume(l,data,state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if(l.current_byte==125/*[}]*/){
                    /*
                       14:50 function_expression=>modifier_list fn : type ( ) { • }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    consume(l,data,state);
                    add_reduce(state,data,8,33);
                    /*-------------INDIRECT-------------------*/
                    pushFN(data,$expression_statements_group_023_108_goto);
                    return 26;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else {
                    /*
                       14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    pushFN(data,branch_6b46cc2cdf8dc740);
                    pushFN(data,$expression_statements);
                    return 0;
                }
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
               14:47 function_expression=>modifier_list fn : type ( • parameters ) { }
            */
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_e2998f7b425d8def);
            pushFN(data,$parameters);
            return 0;
        }
    }
    /*2d42a0ce2f6d106ec022af7158199163*/
}
function branch_2d9e766cbeea47a1(l,data,state,prod){
    return 73;
    /*2d9e766cbeea47a1d3540bfd6ed6c1af*/
}
function branch_2e223495b08c92ba(l,data,state,prod){
    add_reduce(state,data,2,2);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$identifier_token_HC_listbody1_118_goto);
    return 46;
    /*2e223495b08c92ba968c7f2e2b62ee0e*/
}
function branch_2e70fd316ce2baa3(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,6,15);
        /*-------------INDIRECT-------------------*/
        pushFN(data,$statements_goto);
        return 4;
    }
    /*2e70fd316ce2baa3566ef4ee19a3c699*/
}
function branch_2e7fb3c467cc3310(l,data,state,prod){
    add_reduce(state,data,2,36);
    return 19;
    /*2e7fb3c467cc3310b8664b7514dbc7e2*/
}
function branch_2ed037f2f98ad90e(l,data,state,prod){
    pushFN(data,branch_45b78c1aca41cc8a);
    return 65;
    /*2ed037f2f98ad90ef96060d6ea9070ff*/
}
function branch_2ee20e42b6f5801d(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,11,19);
        /*-------------INDIRECT-------------------*/
        pushFN(data,$class_group_016_104_goto);
        return 9;
    }
    /*2ee20e42b6f5801d2bdfa913bedcae30*/
}
function branch_2f4a9b0567013e9e(l,data,state,prod){
    add_reduce(state,data,1,88);
    pushFN(data,$def$string_value_goto);
    return 103;
    /*2f4a9b0567013e9e80ba784115d10f9f*/
}
function branch_2fa9779782f73a91(l,data,state,prod){
    add_reduce(state,data,3,49);
    /*2fa9779782f73a911d1e7bf70ccf1ac6*/
}
function branch_3006927599d5524c(l,data,state,prod){
    add_reduce(state,data,5,43);
    return 24;
    /*3006927599d5524ce0102d99962b248e*/
}
function branch_30a8ac2a61770e68(l,data,state,prod){
    /*22:76 assignment_expression=>left_hand_expression • = expression*/
    /*VL:2*/
    pushFN(data,branch_ee044d7019e306de);
    return 22;
    /*30a8ac2a61770e681ca90e421f644a9f*/
}
function branch_30fc2faf140166c8(l,data,state,prod){
    pushFN(data,branch_45b78c1aca41cc8a);
    return 21;
    /*30fc2faf140166c8d21958d335afc1da*/
}
function branch_3205c0ded576131e(l,data,state,prod){
    /*3205c0ded576131ea255ad2bd38b0fb2*/
}
function branch_326c350dfceb65d4(l,data,state,prod){
    add_reduce(state,data,5,73);
    /*-------------INDIRECT-------------------*/
    pushFN(data,branch_e39790d5d793cb80);
    return 18;
    /*326c350dfceb65d4012b98efbd1e656a*/
}
function branch_32fed3b75d1e1c96(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    if(!((l.current_byte==61/*[=]*/)||l.isSym(true,data))||(cmpr_set(l,data,19,4,4)||assert_ascii(l,0x0,0xc001210,0xa8000000,0x20000000))){
        /*
           25:82 binary_expression=>unary_expression •
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        return 25;
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else {
        /*
           25:80 binary_expression=>unary_expression • operator
           25:81 binary_expression=>unary_expression • operator expression
        */
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_951bba39efc47946);
        pushFN(data,$operator);
        return 0;
    }
    /*32fed3b75d1e1c96d906108bad06bc9e*/
}
function branch_3350dfea3de5dd8e(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==34/*["]*/)&&consume(l,data,state)){
        add_reduce(state,data,3,89);
        return 60;
    }
    /*3350dfea3de5dd8eb678c606280da2a5*/
}
function branch_33cc01c56694466e(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==58/*[:]*/){
        /*
           43:125 primitive_declaration=>modifier_list identifier : • type primitive_declaration_group_169_116
           43:127 primitive_declaration=>modifier_list identifier : • type
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_044401f378a8c0e6);
        pushFN(data,$type);
        return 0;
    }
    /*33cc01c56694466e4c0fc4a75c982b13*/
}
function branch_341cac8b072a369a(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==40/*[(]*/){
        /*
           14:45 function_expression=>fn : type ( • parameters ) { expression_statements }
           14:48 function_expression=>fn : type ( • ) { expression_statements }
           14:49 function_expression=>fn : type ( • parameters ) { }
           14:51 function_expression=>fn : type ( • ) { }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(l.current_byte==41/*[)]*/){
            /*
               14:48 function_expression=>fn : type ( • ) { expression_statements }
               14:51 function_expression=>fn : type ( • ) { }
            */
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if(l.current_byte==123/*[{]*/){
                /*
                   14:48 function_expression=>fn : type ( ) { • expression_statements }
                   14:51 function_expression=>fn : type ( ) { • }
                */
                consume(l,data,state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if(l.current_byte==125/*[}]*/){
                    /*
                       14:51 function_expression=>fn : type ( ) { • }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    consume(l,data,state);
                    add_reduce(state,data,7,34);
                    return 14;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else {
                    /*
                       14:48 function_expression=>fn : type ( ) { • expression_statements }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    pushFN(data,branch_9634317f03e0b010);
                    pushFN(data,$expression_statements);
                    return 0;
                }
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               14:45 function_expression=>fn : type ( • parameters ) { expression_statements }
               14:49 function_expression=>fn : type ( • parameters ) { }
            */
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_7618a45e1838f182);
            pushFN(data,$parameters);
            return 0;
        }
    }
    /*341cac8b072a369a29acd8224ee11522*/
}
function branch_34759af13d94fb85(l,data,state,prod){
    add_reduce(state,data,3,91);
    return 65;
    /*34759af13d94fb8507085946470331e4*/
}
function branch_37b58e1db9e92a7b(l,data,state,prod){
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(((((dt_6ae31dd85a62ef5c(l,data)||cmpr_set(l,data,19,4,4))||assert_ascii(l,0x0,0x20000194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
        /*
           144:361 virtual-92:3:1|-=>• expression )
           145:362 virtual-89:3:1|-=>• expression_statements_group_023_108 )
        */
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        switch(sym_map_4b46f94478f33fdf(l,data)){
            case 0:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                pushFN(data,branch_4f3202e947b98707);
                pushFN(data,$modifier_list);
                return 0;
            case 1:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_ba43c8afd37cf702);
                pushFN(data,$template);
                return 0;
            case 2:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_7b3ff986842915d5);
                pushFN(data,$unary_value);
                return 0;
            case 3:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_2045222aad947cac);
                pushFN(data,$expression);
                return 0;
            case 4:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_7b3ff986842915d5);
                pushFN(data,$value);
                return 0;
            case 5:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_5b2fb20d23d0d533);
                pushFN(data,$num);
                return 0;
            case 6:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_90c38ebe7f441106);
                pushFN(data,$operator);
                return 0;
            case 7:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_2045222aad947cac);
                pushFN(data,$if_expression);
                return 0;
            case 8:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_2045222aad947cac);
                pushFN(data,$match_expression);
                return 0;
            case 9:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_7b3ff986842915d5);
                pushFN(data,$function_expression);
                return 0;
            case 10:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_2045222aad947cac);
                pushFN(data,$break_expression);
                return 0;
            case 11:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_2045222aad947cac);
                pushFN(data,$return_expression);
                return 0;
            case 12:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                pushFN(data,branch_2045222aad947cac);
                pushFN(data,$continue_expression);
                return 0;
            case 13:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_2045222aad947cac);
                pushFN(data,$loop_expression);
                return 0;
            case 14:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                pushFN(data,branch_7b3ff986842915d5);
                pushFN(data,$value);
                return 0;
            case 15:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_c31a3bda3a58be29);
                pushFN(data,$identifier);
                return 0;
            default:
                break;
        }
    }
    return -1;
    /*37b58e1db9e92a7becc35469091ba162*/
}
function branch_37bc2cfca2cd3d74(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==41/*[)]*/){
        /*
           13:37 function=>fn identifier : type ( parameters ) • { expression_statements }
           13:41 function=>fn identifier : type ( parameters ) • { }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if(l.current_byte==123/*[{]*/){
            /*
               13:37 function=>fn identifier : type ( parameters ) { • expression_statements }
               13:41 function=>fn identifier : type ( parameters ) { • }
            */
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if(l.current_byte==125/*[}]*/){
                /*
                   13:41 function=>fn identifier : type ( parameters ) { • }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                consume(l,data,state);
                add_reduce(state,data,9,24);
                return 13;
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   13:37 function=>fn identifier : type ( parameters ) { • expression_statements }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_03d55556b8274032);
                pushFN(data,$expression_statements);
                return 0;
            }
        }
    }
    /*37bc2cfca2cd3d745f102f3b574d43e0*/
}
function branch_38121111c23993e5(l,data,state,prod){
    skip_6c02533b5dc0d802(l/*[ ws ][ 71 ]*/,data,true);
    pushFN(data,branch_e9b913e5644de2ed);
    pushFN(data,$comment_group_0143_133);
    return 0;
    /*38121111c23993e5a65344e6e437e762*/
}
function branch_3879c03d7a2c7a9e(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        add_reduce(state,data,3,47);
        pushFN(data,$unary_value_goto);
        return 27;
    }
    /*3879c03d7a2c7a9e8ee5ee63b983f01c*/
}
function branch_38dcf650f8497618(l,data,state,prod){
    add_reduce(state,data,2,2);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$comment_HC_listbody1_131_goto);
    return 68;
    /*38dcf650f84976185f27c0a1d3c8c7be*/
}
function branch_38e13489f9599f57(l,data,state,prod){
    /*31:98 loop_expression=>loop • expression*/
    /*VL:0*/
    add_reduce(state,data,2,52);
    return 31;
    /*38e13489f9599f578be12b887de02d5e*/
}
function branch_398d9230ecf58463(l,data,state,prod){
    add_reduce(state,data,3,0);
    /*398d9230ecf58463cef6787e4958c074*/
}
function branch_39fb81d9009bc25d(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==93/*[]]*/)&&consume(l,data,state)){
        add_reduce(state,data,4,66);
        /*-------------INDIRECT-------------------*/
        pushFN(data,$expression_goto);
        return 37;
    }
    /*39fb81d9009bc25db7aa39045d1620f4*/
}
function branch_3a4c5635f3d27ac2(l,data,state,prod){
    while(1){
        /*[108] [114]*/
        switch(prod){
            case 26:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                if(!((l.current_byte==61/*[=]*/)||l.isSym(true,data))||(cmpr_set(l,data,19,4,4)||assert_ascii(l,0x0,0xc001210,0xa8000000,0x20000000))){
                    /*
                       25:82 binary_expression=>unary_expression •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    /*31:98 loop_expression=>loop expression •*/
                    /*VL:0*/
                    add_reduce(state,data,2,52);
                    return 31;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if((l.current_byte==61/*[=]*/)||l.isSym(true,data)){
                    /*
                       25:80 binary_expression=>unary_expression • operator
                       25:81 binary_expression=>unary_expression • operator expression
                    */
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                    pushFN(data,branch_06cb1680ebf4efdd);
                    pushFN(data,$operator);
                    return 0;
                }
                break;
            case 29:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                if((((((((((((((tk_896177e00f155ef3(l,data)||tk_b838139d0d011665(l,data))||tk_f70d460017f6375f(l,data))||cmpr_set(l,data,142,2,2))||cmpr_set(l,data,66,5,5))||dt_bcea2102060eab13(l,data))||cmpr_set(l,data,94,4,4))||cmpr_set(l,data,34,4,4))||cmpr_set(l,data,19,4,4))||cmpr_set(l,data,71,5,5))||cmpr_set(l,data,76,6,6))||cmpr_set(l,data,38,8,8))||cmpr_set(l,data,62,4,4))||assert_ascii(l,0x0,0x20000100,0x8000000,0x8000000))||l.isSym(true,data)){
                    /*
                       108:325 virtual-95:3:1|-=>loop_expression_group_254_111 • expression
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                    pushFN(data,branch_b5331b67398b2b54);
                    pushFN(data,$expression);
                    return 0;
                }
                break;
        }
        break;
    }
    /*3a4c5635f3d27ac296cef671f0bf4c6f*/
}
function branch_3babe8c55953e091(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==59/*[;]*/){
        /*
           116:333 virtual-326:8:1|-=>parameters ; expression ; • loop_expression_HC_listbody6_112 ) expression
           118:335 virtual-328:7:1|-=>parameters ; expression ; • ) expression
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.current_byte==41/*[)]*/){
            /*
               118:335 virtual-328:7:1|-=>parameters ; expression ; • ) expression
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_3fab7f836bdb22b2);
            pushFN(data,$expression);
            return 0;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               116:333 virtual-326:8:1|-=>parameters ; expression ; • loop_expression_HC_listbody6_112 ) expression
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_67293a14fcdd752c);
            pushFN(data,$loop_expression_HC_listbody6_112);
            return 0;
        }
    }
    /*3babe8c55953e09117d9591753b3d6db*/
}
function branch_3c772c542ecd74c3(l,data,state,prod){
    add_reduce(state,data,5,73);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$class_group_016_104_goto);
    return 9;
    /*3c772c542ecd74c3fa5bfa897627e555*/
}
function branch_3ca79fffa5a3a758(l,data,state,prod){
    add_reduce(state,data,2,87);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$string_HC_listbody1_126_goto);
    return 58;
    /*3ca79fffa5a3a758102c2e9526eb3376*/
}
function branch_3dcc2e9c33ef9ef7(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==61/*[=]*/)&&consume(l,data,state)){
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_780374fd5be39be5);
        pushFN(data,$expression);
        return 0;
    }
    /*3dcc2e9c33ef9ef71b025906e080a247*/
}
function branch_3e6ee8775062329c(l,data,state,prod){
    add_reduce(state,data,1,3);
    pushFN(data,$def$defaultproductions_HC_listbody1_100_goto);
    return 74;
    /*3e6ee8775062329c28be70c9457025bc*/
}
function branch_3eb0fd6505d41490(l,data,state,prod){
    add_reduce(state,data,3,65);
    /*-------------INDIRECT-------------------*/
    pushFN(data,branch_ee044d7019e306de);
    return 37;
    /*3eb0fd6505d414905452ab848ae8a584*/
}
function branch_3fab7f836bdb22b2(l,data,state,prod){
    /*-------------INDIRECT-------------------*/
    /*111:328 virtual-101:8:1|-=>( • parameters ; expression ; ) expression*/
    /*VL:1*/
    /*31:101 loop_expression=>loop • ( parameters ; expression ; ) expression*/
    /*VL:0*/
    add_reduce(state,data,8,55);
    return 31;
    /*3fab7f836bdb22b28e8d25235aa5b5dc*/
}
function branch_3fe26e3198c2d658(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        /*
           43:126 primitive_declaration=>identifier : type • primitive_declaration_group_169_116
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_802895e897fe5195);
        pushFN(data,$primitive_declaration_group_169_116);
        return 0;
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*
           43:128 primitive_declaration=>identifier : type •
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        add_reduce(state,data,3,76);
        /*-------------INDIRECT-------------------*/
        return 18;
    }
    /*3fe26e3198c2d6583372a67ff250b36c*/
}
function branch_3feb5021871d7628(l,data,state,prod){
    add_reduce(state,data,2,87);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$string_HC_listbody1_127_goto);
    return 59;
    /*3feb5021871d7628fd763c81e26f6448*/
}
function branch_4032aaa93148caae(l,data,state,prod){
    add_reduce(state,data,7,57);
    return 31;
    /*4032aaa93148caae7069a1fc1d8a6b5f*/
}
function branch_40c5ff801836a1f7(l,data,state,prod){
    add_reduce(state,data,3,46);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$expression_statements_group_023_108_goto);
    return 18;
    /*40c5ff801836a1f76dbae00dff5aa21c*/
}
function branch_413721b69b4b8263(l,data,state,prod){
    add_reduce(state,data,2,45);
    return 26;
    /*413721b69b4b826332dfc9280f5addc2*/
}
function branch_419a924bdbcf84bb(l,data,state,prod){
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(assert_ascii(l,0x0,0x10,0x88000000,0x0)||l.isUniID(data)){
        /*
           115:332 virtual-92:3:1|-=>• expression )
           116:333 virtual-326:8:1|-=>• parameters ; expression ; loop_expression_HC_listbody6_112 ) expression
           117:334 virtual-327:7:1|-=>• parameters ; ; loop_expression_HC_listbody6_112 ) expression
           118:335 virtual-328:7:1|-=>• parameters ; expression ; ) expression
           119:336 virtual-329:6:1|-=>• parameters ; ; ) expression
           120:337 virtual-330:6:1|-=>• primitive_declaration in expression ) expression
           121:338 virtual-89:3:1|-=>• expression_statements_group_023_108 )
        */
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.current_byte==91/*[[]*/){
            /*
               50:143 modifier_list=>• [ modifier_list_HC_listbody1_120 ]
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            pushFN(data,branch_a4b8d46738701bdc);
            pushFN(data,$modifier_list);
            return 0;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               44:129 identifier=>• tk:identifier_token
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_d21d3a4193eb251c);
            pushFN(data,$identifier);
            return 0;
        }
    }
    return -1;
    /*419a924bdbcf84bbb28454f655705cde*/
}
function branch_41d65d377ff9ca0a(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==58/*[:]*/){
        /*
           43:125 primitive_declaration=>modifier_list identifier : • type primitive_declaration_group_169_116
           43:127 primitive_declaration=>modifier_list identifier : • type
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_f473cb821f4b2122);
        pushFN(data,$type);
        return 0;
    }
    /*41d65d377ff9ca0aa9bae8a1a7fbeeb1*/
}
function branch_4315b390198abc43(l,data,state,prod){
    /*48:137 identifier_token=>identifier_token_group_074_117 identifier_token_HC_listbody1_118 identifier_token_group_079_119 •*/
    /*VL:0*/
    add_reduce(state,data,3,0);
    return 48;
    /*4315b390198abc43a5abd6741604e0be*/
}
function branch_43f5323ae3031eba(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==58/*[:]*/){
        /*
           13:37 function=>fn identifier : • type ( parameters ) { expression_statements }
           13:40 function=>fn identifier : • type ( ) { expression_statements }
           13:41 function=>fn identifier : • type ( parameters ) { }
           13:43 function=>fn identifier : • type ( ) { }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_8dc9de93c0c5b63e);
        pushFN(data,$type);
        return 0;
    }
    /*43f5323ae3031eba0177312937ff28d5*/
}
function branch_44b59b9f3ae48ad4(l,data,state,prod){
    /*43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116*/
    /*VL:0*/
    add_reduce(state,data,4,74);
    pushFN(data,$expression_statements_group_023_108_goto);
    return 18;
    /*44b59b9f3ae48ad40ce8df4741ba7af4*/
}
function branch_45b78c1aca41cc8a(l,data,state,prod){
    while(1){
        /*[129] [18] [26] [21] [21] [26] [130]*/
        switch(prod){
            case 18:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                if(l.current_byte==41/*[)]*/){
                    /*
                       130:347 virtual-89:3:1|-=>expression_statements_group_023_108 ) •
                    */
                    consume(l,data,state);
                    consume(l,data,state);
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                    /*27:89 unary_value=>( • expression_statements_group_023_108 )*/
                    /*VL:1*/
                    pushFN(data,branch_3a4c5635f3d27ac2);
                    return 27;
                }
                break;
            case 21:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(l.current_byte==41/*[)]*/){
                    /*
                       129:346 virtual-92:3:1|-=>expression • )
                       18:58 expression_statements_group_023_108=>expression •
                    */
                    let pk = l.copy();
                    skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
                    switch(sym_map_faa21e6586619fc7(pk,data)){
                        case 0:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                            consume(l,data,state);
                            /*29:92 loop_expression_group_254_111=>( • expression )*/
                            /*VL:1*/
                            pushFN(data,branch_3a4c5635f3d27ac2);
                            return 29;
                        default:
                        case 1:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                            prod = 18;
                            continue;;
                        case 2:
                            /*-------------VPROD-------------------------*/
                            pushFN(data,branch_a47e22360bc8eb23);
                            return 0;
                    }
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                } else {
                    /*
                       18:58 expression_statements_group_023_108=>expression •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    prod = 18;
                    continue;;
                }
                break;
            case 26:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                if(!((l.current_byte==61/*[=]*/)||l.isSym(true,data))||(cmpr_set(l,data,19,4,4)||assert_ascii(l,0x0,0xc001210,0xa8000000,0x20000000))){
                    /*
                       25:82 binary_expression=>unary_expression •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    prod = 21;
                    continue;;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if((l.current_byte==61/*[=]*/)||l.isSym(true,data)){
                    /*
                       25:80 binary_expression=>unary_expression • operator
                       25:81 binary_expression=>unary_expression • operator expression
                    */
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                    pushFN(data,branch_bf406d1372596829);
                    pushFN(data,$operator);
                    return 0;
                }
                break;
            case 65:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                if((((((((tk_896177e00f155ef3(l,data)||tk_b838139d0d011665(l,data))||tk_f70d460017f6375f(l,data))||dt_bcea2102060eab13(l,data))||cmpr_set(l,data,94,4,4))||cmpr_set(l,data,34,4,4))||cmpr_set(l,data,19,4,4))||(l.current_byte==91/*[[]*/))||(l.current_byte==40/*[(]*/)){
                    /*
                       26:83 unary_expression=>operator • unary_value
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                    pushFN(data,branch_ad374eed04dd5afe);
                    pushFN(data,$unary_value);
                    return 0;
                }
                break;
            case 72:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(l.current_byte==41/*[)]*/){
                    /*
                       21:74 expression=>template •
                       56:168 value=>template •
                    */
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    {
                        /*
                           21:74 expression=>template •
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        add_reduce(state,data,1,40);
                        prod = 21;
                        continue;;
                    }
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                } else {
                    /*
                       56:168 value=>template •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    add_reduce(state,data,1,86);
                    prod = 26;
                    continue;;
                }
                break;
        }
        break;
    }
    /*45b78c1aca41cc8adcf6e38dbb99b918*/
}
function branch_462bfca52e81452e(l,data,state,prod){
    skip_a294e41529bc9275(l/*[ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if((l.current_byte==101/*[e]*/)||(l.current_byte==69/*[E]*/)){
        /*
           84:249 def$scientific_token=>def$float_token • def$scientific_token_group_228_102
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_e187025a283f9525);
        pushFN(data,$def$scientific_token_group_228_102);
        return 0;
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*
           84:250 def$scientific_token=>def$float_token •
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        return 84;
    }
    /*462bfca52e81452ede0520fb34b6096d*/
}
function branch_463a609a91f9c965(l,data,state,prod){
    add_reduce(state,data,7,56);
    return 31;
    /*463a609a91f9c965cd204434b7fa4cd2*/
}
function branch_4646738a4386c43b(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    pushFN(data,branch_c2432a04915ec0d0);
    pushFN(data,$type_group_091_122);
    return 0;
    /*4646738a4386c43b7cb1ae5f8ac4499b*/
}
function branch_46cd05da50cafcb8(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==40/*[(]*/){
        /*
           14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
           14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
           14:47 function_expression=>modifier_list fn : type ( • parameters ) { }
           14:50 function_expression=>modifier_list fn : type ( • ) { }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(l.current_byte==41/*[)]*/){
            /*
               14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
               14:50 function_expression=>modifier_list fn : type ( • ) { }
            */
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if(l.current_byte==123/*[{]*/){
                /*
                   14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }
                   14:50 function_expression=>modifier_list fn : type ( ) { • }
                */
                consume(l,data,state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if(l.current_byte==125/*[}]*/){
                    /*
                       14:50 function_expression=>modifier_list fn : type ( ) { • }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    consume(l,data,state);
                    add_reduce(state,data,8,33);
                    /*-------------INDIRECT-------------------*/
                    pushFN(data,branch_5421d5d86a2a00b8);
                    return 26;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else {
                    /*
                       14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    pushFN(data,branch_e6735c67a528007e);
                    pushFN(data,$expression_statements);
                    return 0;
                }
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
               14:47 function_expression=>modifier_list fn : type ( • parameters ) { }
            */
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_ed16a8455d8c2f0a);
            pushFN(data,$parameters);
            return 0;
        }
    }
    /*46cd05da50cafcb8a9ef42df291851eb*/
}
function branch_46fa69b5e7bafaed(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    switch(sym_map_439a05cca98595e4(l,data)){
        default:
        case 0:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            add_reduce(state,data,2,45);
            /*-------------INDIRECT-------------------*/
            pushFN(data,branch_5421d5d86a2a00b8);
            return 21;
        case 1:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_1756bc6b46158c90);
            pushFN(data,$expression);
            return 0;
        case 2:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
            pushFN(data,branch_1756bc6b46158c90);
            pushFN(data,$expression);
            return 0;
    }
    /*46fa69b5e7bafaedf5ad3d3648dbb5c8*/
}
function branch_472123bab218a576(l,data,state,prod){
    add_reduce(state,data,1,81);
    pushFN(data,branch_45b78c1aca41cc8a);
    return 26;
    /*472123bab218a576405d6b5bc9e4fa96*/
}
function branch_47941f6b8bbc7250(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,5,5);
        return 7;
    }
    /*47941f6b8bbc7250e4e66c6c713a0c8a*/
}
function branch_47c545d1d18f125f(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==59/*[;]*/){
        /*
           31:99 loop_expression=>loop ( ; expression ; • loop_expression_HC_listbody6_112 ) expression
           31:103 loop_expression=>loop ( ; expression ; • ) expression
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.current_byte==41/*[)]*/){
            /*
               31:103 loop_expression=>loop ( ; expression ; • ) expression
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_4032aaa93148caae);
            pushFN(data,$expression);
            return 0;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               31:99 loop_expression=>loop ( ; expression ; • loop_expression_HC_listbody6_112 ) expression
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_9b7f66694e8c6d9b);
            pushFN(data,$loop_expression_HC_listbody6_112);
            return 0;
        }
    }
    /*47c545d1d18f125fca20028ffe5888dd*/
}
function branch_48b0a1358e8d8722(l,data,state,prod){
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        /*
           108:325 virtual-76:3:1|-=>• = expression
           109:326 virtual-85:1:1|-=>•
        */
        let pk = l.copy();
        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(((((dt_6ae31dd85a62ef5c(pk,data)||cmpr_set(pk,data,19,4,4))||assert_ascii(pk,0x0,0x20000194,0x88000000,0x8000000))||pk.isUniID(data))||pk.isNum(data))||pk.isSym(true,data)){
            /*
               108:325 virtual-76:3:1|-=>• = expression
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_9ed088d0c21de14b);
            pushFN(data,$expression);
            return 0;
        }
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*
           109:326 virtual-85:1:1|-=>•
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*27:85 unary_value=>left_hand_expression •*/
        /*VL:0*/
        pushFN(data,$expression_goto);
        return 26;
    }
    return -1;
    /*48b0a1358e8d8722d92410ffdfa31b83*/
}
function branch_4a9eba3e6a2b94a5(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        add_reduce(state,data,3,47);
    }
    /*4a9eba3e6a2b94a53c84a6d8b1760255*/
}
function branch_4b0edc44e83efea2(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,6,15);
        return 12;
    }
    /*4b0edc44e83efea228d1d369e3fb051e*/
}
function branch_4bc3fe2167c00039(l,data,state,prod){
    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    if(!(l.current_byte==58/*[:]*/)||l.END(data)){
        /*
           110:327 virtual-117:1:1|-=>•
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*37:117 member_expression=>identifier •*/
        /*VL:0*/
        add_reduce(state,data,1,67);
        pushFN(data,$expression_statements_goto);
        return 37;
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    } else {
        /*
           108:325 virtual-126:4:1|-=>• : type primitive_declaration_group_169_116
           109:326 virtual-128:3:1|-=>• : type
           110:327 virtual-117:1:1|-=>•
        */
        let pk = l.copy();
        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(((pk.current_byte==95/*[_]*/)||(pk.current_byte==36/*[$]*/))||pk.isUniID(data)){
            /*
               108:325 virtual-126:4:1|-=>• : type primitive_declaration_group_169_116
               109:326 virtual-128:3:1|-=>• : type
            */
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_da16dbec8b45d61a);
            pushFN(data,$type);
            return 0;
        }
    }
    return -1;
    /*4bc3fe2167c000397a316fb31c66824f*/
}
function branch_4bcef3d8f2a9eecb(l,data,state,prod){
    /*22:76 assignment_expression=>left_hand_expression • = expression*/
    /*VL:0*/
    add_reduce(state,data,3,42);
    add_reduce(state,data,1,3);
    pushFN(data,$expression_statements_goto);
    return 20;
    /*4bcef3d8f2a9eecbd3a509247581d466*/
}
function branch_4db389afdb5f8499(l,data,state,prod){
    add_reduce(state,data,2,0);
    return 92;
    /*4db389afdb5f8499a2d9ca0c66579d61*/
}
function branch_4e61e6c3ff64b530(l,data,state,prod){
    add_reduce(state,data,2,0);
    return 86;
    /*4e61e6c3ff64b530ceea0bc369a8d661*/
}
function branch_4eb0425186f1cb79(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        add_reduce(state,data,4,63);
        /*-------------INDIRECT-------------------*/
        pushFN(data,$unary_value_goto);
        return 27;
    }
    /*4eb0425186f1cb7916292431b00541c2*/
}
function branch_4f293cfdd441fd62(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==39/*[']*/)&&consume(l,data,state)){
        add_reduce(state,data,3,89);
        return 60;
    }
    /*4f293cfdd441fd6239efbd784b25a81e*/
}
function branch_4f3202e947b98707(l,data,state,prod){
    pushFN(data,branch_5421d5d86a2a00b8);
    return 50;
    /*4f3202e947b98707aa78ea2cdc426477*/
}
function branch_4f859722ebf3c831(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,6,8);
        return 11;
    }
    /*4f859722ebf3c831c92ab34b7e1bfccf*/
}
function branch_4fcbae1b50b020a4(l,data,state,prod){
    add_reduce(state,data,3,46);
    /*-------------INDIRECT-------------------*/
    pushFN(data,branch_ee044d7019e306de);
    return 21;
    /*4fcbae1b50b020a48d3c06482aa16704*/
}
function branch_50f99c46d94b1746(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,3,39);
        pushFN(data,$expression_goto);
        return 21;
    }
    /*50f99c46d94b1746d18c4d055250aef3*/
}
function branch_51a03d86d608f1f7(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        add_reduce(state,data,3,36);
    }
    /*51a03d86d608f1f717602fb198a036cb*/
}
function branch_51b6062c81564560(l,data,state,prod){
    add_reduce(state,data,3,42);
    /*-------------INDIRECT-------------------*/
    pushFN(data,branch_e39790d5d793cb80);
    return 21;
    /*51b6062c81564560b84fcc8cbb30cfef*/
}
function branch_5245eb7cd56c8e3e(l,data,state,prod){
    add_reduce(state,data,7,58);
    /*5245eb7cd56c8e3eecad30d863b49001*/
}
function branch_52c337927313e58e(l,data,state,prod){
    add_reduce(state,data,3,0);
    return 48;
    /*52c337927313e58e0571fbb2f6e6dc69*/
}
function branch_532766fb61bef13c(l,data,state,prod){
    add_reduce(state,data,2,70);
    return 40;
    /*532766fb61bef13c294cd6ac793311ef*/
}
function branch_53c288e720b933ec(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,5,16);
        return 12;
    }
    /*53c288e720b933ec273472250add48e4*/
}
function branch_53ee877ca347844f(l,data,state,prod){
    add_reduce(state,data,1,81);
    pushFN(data,branch_e39790d5d793cb80);
    return 26;
    /*53ee877ca347844fbf7a5aa69e2067c5*/
}
function branch_5421d5d86a2a00b8(l,data,state,prod){
    while(1){
        /*[37] [18] [144] [18] [26] [26] [18] [21] [21] [26] [28] [37] [26] [145] [21] [26]*/
        switch(prod){
            case 18:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                if(l.current_byte==41/*[)]*/){
                    /*
                       145:362 virtual-89:3:1|-=>expression_statements_group_023_108 ) •
                    */
                    consume(l,data,state);
                    consume(l,data,state);
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                    /*27:89 unary_value=>( • expression_statements_group_023_108 )*/
                    /*VL:1*/
                    pushFN(data,branch_1d4995829d243c99);
                    return 27;
                }
                break;
            case 21:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(l.current_byte==41/*[)]*/){
                    /*
                       144:361 virtual-92:3:1|-=>expression • )
                       18:58 expression_statements_group_023_108=>expression •
                    */
                    let pk = l.copy();
                    skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
                    switch(sym_map_faa21e6586619fc7(pk,data)){
                        case 0:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                            consume(l,data,state);
                            /*29:92 loop_expression_group_254_111=>( • expression )*/
                            /*VL:1*/
                            pushFN(data,branch_1d4995829d243c99);
                            return 29;
                        default:
                        case 1:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                            prod = 18;
                            continue;;
                        case 2:
                            /*-------------VPROD-------------------------*/
                            pushFN(data,branch_9cd5fb059f7c0033);
                            return 0;
                    }
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                } else {
                    /*
                       18:58 expression_statements_group_023_108=>expression •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    prod = 18;
                    continue;;
                }
                break;
            case 26:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                if(!((l.current_byte==61/*[=]*/)||l.isSym(true,data))||(cmpr_set(l,data,19,4,4)||assert_ascii(l,0x0,0xc001210,0xa8000000,0x20000000))){
                    /*
                       25:82 binary_expression=>unary_expression •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    prod = 21;
                    continue;;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if((l.current_byte==61/*[=]*/)||l.isSym(true,data)){
                    /*
                       25:80 binary_expression=>unary_expression • operator
                       25:81 binary_expression=>unary_expression • operator expression
                    */
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                    pushFN(data,branch_46fa69b5e7bafaed);
                    pushFN(data,$operator);
                    return 0;
                }
                break;
            case 28:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(l.current_byte==61/*[=]*/){
                    /*
                       22:76 assignment_expression=>left_hand_expression • = expression
                       27:85 unary_value=>left_hand_expression •
                    */
                    let pk = l.copy();
                    skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    if((((dt_6ae31dd85a62ef5c(pk,data)||cmpr_set(pk,data,19,4,4))||assert_ascii(pk,0x0,0x20000194,0x88000000,0x8000000))||pk.isUniID(data))||pk.isNum(data)){
                        /*
                           22:76 assignment_expression=>left_hand_expression • = expression
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        pushFN(data,branch_2301b1e5768ad852);
                        pushFN(data,$expression);
                        return 0;
                        /*⤋⤋⤋ peek-unresolved ⤋⤋⤋*/
                    } else {
                        /*
                           22:76 assignment_expression=>left_hand_expression • = expression
                           27:85 unary_value=>left_hand_expression •
                        */
                        /*-------------VPROD-------------------------*/
                        pushFN(data,branch_e6b0a378ae4ddea9);
                        return 0;
                    }
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                } else {
                    /*
                       27:85 unary_value=>left_hand_expression •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    prod = 26;
                    continue;;
                }
                break;
            case 37:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(l.current_byte==91/*[[]*/){
                    /*
                       28:91 left_hand_expression=>member_expression •
                       37:116 member_expression=>member_expression • [ expression ]
                    */
                    let pk = l.copy();
                    skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    if(!(((((dt_6ae31dd85a62ef5c(pk,data)||cmpr_set(pk,data,19,4,4))||assert_ascii(pk,0x0,0x20000194,0x88000000,0x8000000))||pk.isUniID(data))||pk.isNum(data))||pk.isSym(true,data))||(((dt_a0570d6d5c8952c6(pk,data)||cmpr_set(pk,data,56,6,6))||cmpr_set(pk,data,116,3,3))||cmpr_set(pk,data,115,4,4))){
                        /*
                           28:91 left_hand_expression=>member_expression •
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        prod = 28;
                        continue;;
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    } else if(((((((((((((cmpr_set(pk,data,142,2,2)||cmpr_set(pk,data,66,5,5))||dt_bcea2102060eab13(pk,data))||dt_6ae31dd85a62ef5c(pk,data))||cmpr_set(pk,data,94,4,4))||cmpr_set(pk,data,34,4,4))||cmpr_set(pk,data,19,4,4))||cmpr_set(pk,data,71,5,5))||cmpr_set(pk,data,76,6,6))||cmpr_set(pk,data,38,8,8))||cmpr_set(pk,data,62,4,4))||assert_ascii(pk,0x0,0x20000194,0x88000000,0x8000000))||pk.isNum(data))||pk.isSym(true,data)){
                        /*
                           37:116 member_expression=>member_expression • [ expression ]
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        pushFN(data,branch_d7ea96fd3976e324);
                        pushFN(data,$expression);
                        return 0;
                        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                    } else {
                        /*
                           37:116 member_expression=>member_expression • [ expression ]
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        pushFN(data,branch_d7ea96fd3976e324);
                        pushFN(data,$expression);
                        return 0;
                    }
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                } else if(l.current_byte==46/*[.]*/){
                    /*
                       37:115 member_expression=>member_expression • . identifier
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    consume(l,data,state);
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                    pushFN(data,branch_1d1f55b29f4c0c5e);
                    pushFN(data,$identifier);
                    return 0;
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                } else if(l.current_byte==40/*[(]*/){
                    /*
                       36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                       36:114 call_expression=>member_expression • ( )
                    */
                    let pk = l.copy();
                    skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    if(pk.current_byte==41/*[)]*/){
                        /*
                           36:114 call_expression=>member_expression • ( )
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
                            add_reduce(state,data,3,64);
                            pushFN(data,branch_5421d5d86a2a00b8);
                            return 26;
                        }
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    } else {
                        /*
                           36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        pushFN(data,branch_680b46a2133a4291);
                        pushFN(data,$call_expression_HC_listbody2_114);
                        return 0;
                    }
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                } else {
                    /*
                       28:91 left_hand_expression=>member_expression •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    prod = 28;
                    continue;;
                }
                break;
            case 44:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(l.current_byte==58/*[:]*/){
                    /*
                       37:117 member_expression=>identifier •
                       43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                       43:128 primitive_declaration=>identifier • : type
                    */
                    let pk = l.copy();
                    skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
                    switch(sym_map_c9c12240e0caee46(pk,data)){
                        case 0:
                            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                            consume(l,data,state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                            pushFN(data,branch_b860b664828fdbf3);
                            pushFN(data,$type);
                            return 0;
                        default:
                        case 1:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                            add_reduce(state,data,1,67);
                            prod = 37;
                            continue;;
                        case 2:
                            /*-------------VPROD-------------------------*/
                            pushFN(data,branch_d4985b5a2253e444);
                            return 0;
                    }
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                } else {
                    /*
                       37:117 member_expression=>identifier •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    add_reduce(state,data,1,67);
                    prod = 37;
                    continue;;
                }
                break;
            case 50:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(cmpr_set(l,data,143,2,2)){
                    /*
                       14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
                       14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
                       14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
                       14:50 function_expression=>modifier_list • fn : type ( ) { }
                    */
                    /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                    consume(l,data,state);
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                    if(l.current_byte==58/*[:]*/){
                        /*
                           14:44 function_expression=>modifier_list fn : • type ( parameters ) { expression_statements }
                           14:46 function_expression=>modifier_list fn : • type ( ) { expression_statements }
                           14:47 function_expression=>modifier_list fn : • type ( parameters ) { }
                           14:50 function_expression=>modifier_list fn : • type ( ) { }
                        */
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        pushFN(data,branch_46cd05da50cafcb8);
                        pushFN(data,$type);
                        return 0;
                    }
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
                    /*
                       43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
                       43:127 primitive_declaration=>modifier_list • identifier : type
                    */
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                    pushFN(data,branch_02eb391527603263);
                    pushFN(data,$identifier);
                    return 0;
                }
                break;
            case 65:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                if((((((((tk_896177e00f155ef3(l,data)||tk_b838139d0d011665(l,data))||tk_f70d460017f6375f(l,data))||dt_bcea2102060eab13(l,data))||cmpr_set(l,data,94,4,4))||cmpr_set(l,data,34,4,4))||cmpr_set(l,data,19,4,4))||(l.current_byte==91/*[[]*/))||(l.current_byte==40/*[(]*/)){
                    /*
                       26:83 unary_expression=>operator • unary_value
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                    pushFN(data,branch_fbae9373be316b4e);
                    pushFN(data,$unary_value);
                    return 0;
                }
                break;
            case 72:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(l.current_byte==41/*[)]*/){
                    /*
                       21:74 expression=>template •
                       56:168 value=>template •
                    */
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    {
                        /*
                           21:74 expression=>template •
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        add_reduce(state,data,1,40);
                        prod = 21;
                        continue;;
                    }
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                } else {
                    /*
                       56:168 value=>template •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    add_reduce(state,data,1,86);
                    prod = 26;
                    continue;;
                }
                break;
        }
        break;
    }
    /*5421d5d86a2a00b8e2b456752baaeb8a*/
}
function branch_54424efcf731c3ab(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if(cmpr_set(l,data,42,2,2)&&consume(l,data,state)){
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_184068955d11f054);
        pushFN(data,$expression);
        return 0;
    }
    /*54424efcf731c3abb327d1d65cc5840c*/
}
function branch_5489c742cef19a4d(l,data,state,prod){
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(l.current_byte==40/*[(]*/){
        /*
           108:325 virtual-95:3:1|-=>• loop_expression_group_254_111 expression
           109:326 virtual-96:9:1|-=>• ( parameters ; expression ; loop_expression_HC_listbody6_112 ) expression
           110:327 virtual-100:8:1|-=>• ( parameters ; ; loop_expression_HC_listbody6_112 ) expression
           111:328 virtual-101:8:1|-=>• ( parameters ; expression ; ) expression
           112:329 virtual-104:7:1|-=>• ( parameters ; ; ) expression
           113:330 virtual-97:7:1|-=>• ( primitive_declaration in expression ) expression
           114:331 virtual-98:2:1|-=>• expression
        */
        let pk = l.copy();
        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
        switch(sym_map_3bcb1be30ed60ba3(pk,data)){
            case 0:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_38e13489f9599f57);
                pushFN(data,$expression);
                return 0;
            case 1:
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l,data,state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ peek-unresolved ⤋⤋⤋*/
                if(((((dt_6ae31dd85a62ef5c(l,data)||cmpr_set(l,data,19,4,4))||assert_ascii(l,0x0,0x20000194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
                    /*
                       29:92 loop_expression_group_254_111=>( • expression )
                       27:89 unary_value=>( • expression_statements_group_023_108 )
                    */
                    /*-------------VPROD-------------------------*/
                    pushFN(data,branch_fe61174d9519f362);
                    return 0;
                }
            case 2:
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l,data,state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                switch(sym_map_aaf5d00b8db9faac(l,data)){
                    case 0:
                        /*-------------VPROD-------------------------*/
                        pushFN(data,branch_cdc32f1f47f4669f);
                        return 0;
                    case 1:
                        /*-------------VPROD-------------------------*/
                        pushFN(data,branch_419a924bdbcf84bb);
                        return 0;
                    default:
                        break;
                }
            default:
                break;
        }
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else {
        /*
           114:331 virtual-98:2:1|-=>• expression
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_b8a7c3cf5d96bb89);
        pushFN(data,$expression);
        return 0;
    }
    return -1;
    /*5489c742cef19a4d72415d28e0529244*/
}
function branch_54a2284eebb4a6fc(l,data,state,prod){
    add_reduce(state,data,2,0);
    return 42;
    /*54a2284eebb4a6fc8019193b670397e6*/
}
function branch_561d8f461799c842(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,10,27);
        /*-------------INDIRECT-------------------*/
        pushFN(data,branch_ee044d7019e306de);
        return 26;
    }
    /*561d8f461799c84257476b7239e1267e*/
}
function branch_5b2fb20d23d0d533(l,data,state,prod){
    add_reduce(state,data,1,81);
    pushFN(data,branch_5421d5d86a2a00b8);
    return 26;
    /*5b2fb20d23d0d5334618ec972c59537d*/
}
function branch_5e20402ff8e2ff2f(l,data,state,prod){
    add_reduce(state,data,3,42);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$expression_statements_group_023_108_goto);
    return 18;
    /*5e20402ff8e2ff2f38510e6ba57a05ea*/
}
function branch_5e427256d793b21f(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    switch(sym_map_439a05cca98595e4(l,data)){
        default:
        case 0:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            add_reduce(state,data,2,45);
            /*-------------INDIRECT-------------------*/
            pushFN(data,branch_e39790d5d793cb80);
            return 21;
        case 1:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_a21d1b46c25036ab);
            pushFN(data,$expression);
            return 0;
        case 2:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
            pushFN(data,branch_a21d1b46c25036ab);
            pushFN(data,$expression);
            return 0;
    }
    /*5e427256d793b21f27663b09fd92a3ae*/
}
function branch_5e5281a8817cd878(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==34/*["]*/)&&consume(l,data,state)){
        add_reduce(state,data,3,36);
        return 97;
    }
    /*5e5281a8817cd878c4f5d5ced795603c*/
}
function branch_603d19d840e04474(l,data,state,prod){
    return 28;
    /*603d19d840e044740538584f7ede8eeb*/
}
function branch_6585176de4ac1689(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==93/*[]]*/)&&consume(l,data,state)){
        add_reduce(state,data,4,66);
        /*-------------INDIRECT-------------------*/
        pushFN(data,branch_e39790d5d793cb80);
        return 37;
    }
    /*6585176de4ac1689ec8191032271964d*/
}
function branch_66e71b93e033352b(l,data,state,prod){
    add_reduce(state,data,5,73);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$statements_goto);
    return 4;
    /*66e71b93e033352bbad80fd057ac54da*/
}
function branch_67293a14fcdd752c(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_93b7d445e0f273d3);
        pushFN(data,$expression);
        return 0;
    }
    /*67293a14fcdd752cba938263ae950874*/
}
function branch_6768f12162f599d2(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==40/*[(]*/){
        /*
           13:36 function=>modifier_list fn identifier : type ( • parameters ) { expression_statements }
           13:38 function=>modifier_list fn identifier : type ( • ) { expression_statements }
           13:39 function=>modifier_list fn identifier : type ( • parameters ) { }
           13:42 function=>modifier_list fn identifier : type ( • ) { }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(l.current_byte==41/*[)]*/){
            /*
               13:38 function=>modifier_list fn identifier : type ( • ) { expression_statements }
               13:42 function=>modifier_list fn identifier : type ( • ) { }
            */
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if(l.current_byte==123/*[{]*/){
                /*
                   13:38 function=>modifier_list fn identifier : type ( ) { • expression_statements }
                   13:42 function=>modifier_list fn identifier : type ( ) { • }
                */
                consume(l,data,state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if(l.current_byte==125/*[}]*/){
                    /*
                       13:42 function=>modifier_list fn identifier : type ( ) { • }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    consume(l,data,state);
                    add_reduce(state,data,9,25);
                    return 13;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else {
                    /*
                       13:38 function=>modifier_list fn identifier : type ( ) { • expression_statements }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    pushFN(data,branch_a367c2885e5a992a);
                    pushFN(data,$expression_statements);
                    return 0;
                }
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               13:36 function=>modifier_list fn identifier : type ( • parameters ) { expression_statements }
               13:39 function=>modifier_list fn identifier : type ( • parameters ) { }
            */
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_a4384264bf5c7ab7);
            pushFN(data,$parameters);
            return 0;
        }
    }
    /*6768f12162f599d24c8709180c25cc2e*/
}
function branch_680b46a2133a4291(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        add_reduce(state,data,4,63);
        /*-------------INDIRECT-------------------*/
        pushFN(data,branch_5421d5d86a2a00b8);
        return 26;
    }
    /*680b46a2133a429130f0dc846d5c502f*/
}
function branch_68ba36d7477bbfd7(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==58/*[:]*/){
        /*
           43:125 primitive_declaration=>modifier_list identifier : • type primitive_declaration_group_169_116
           43:127 primitive_declaration=>modifier_list identifier : • type
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_7c73794220aa4308);
        pushFN(data,$type);
        return 0;
    }
    /*68ba36d7477bbfd76b62de1bf8886d63*/
}
function branch_6948bbd7e3182d6d(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==58/*[:]*/){
        /*
           43:125 primitive_declaration=>modifier_list identifier : • type primitive_declaration_group_169_116
           43:127 primitive_declaration=>modifier_list identifier : • type
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_8bb728d0418c3ab8);
        pushFN(data,$type);
        return 0;
    }
    /*6948bbd7e3182d6ded1c26944fc62a3d*/
}
function branch_69da744e43e07c30(l,data,state,prod){
    add_reduce(state,data,3,62);
    return 34;
    /*69da744e43e07c305b2e940659971c0b*/
}
function branch_6a9db12bab3062d9(l,data,state,prod){
    add_reduce(state,data,1,3);
    pushFN(data,$def$string_token_HC_listbody3_111_goto);
    return 98;
    /*6a9db12bab3062d979ce648500daaa02*/
}
function branch_6ab8c6d3fc6a956d(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,5,11);
        return 11;
    }
    /*6ab8c6d3fc6a956dd61dc38817fcb7e3*/
}
function branch_6b4090ab809cd455(l,data,state,prod){
    /*43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116*/
    /*VL:2*/
    pushFN(data,branch_ee044d7019e306de);
    return 43;
    /*6b4090ab809cd45570afab0688c3c5e8*/
}
function branch_6b46cc2cdf8dc740(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,9,29);
        /*-------------INDIRECT-------------------*/
        pushFN(data,$expression_statements_group_023_108_goto);
        return 26;
    }
    /*6b46cc2cdf8dc74098270048bdcf2efd*/
}
function branch_6daab6971c75715b(l,data,state,prod){
    pushFN(data,$expression_statements_group_023_108_goto);
    return 50;
    /*6daab6971c75715ba440511f225a2e62*/
}
function branch_6dc5b15c967df6d7(l,data,state,prod){
    add_reduce(state,data,1,67);
    pushFN(data,$member_expression_goto);
    return 37;
    /*6dc5b15c967df6d71efb27601039e971*/
}
function branch_6e2042fdcddfc65d(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        add_reduce(state,data,4,63);
        /*-------------INDIRECT-------------------*/
        pushFN(data,$expression_goto);
        return 26;
    }
    /*6e2042fdcddfc65d583e2bef4adb8405*/
}
function branch_6ea9c551086a9b7b(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,11,19);
        /*-------------INDIRECT-------------------*/
        pushFN(data,$statements_goto);
        return 4;
    }
    /*6ea9c551086a9b7be2bf0b834c6c3122*/
}
function branch_6ee66156d2334d5a(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        add_reduce(state,data,4,63);
        /*-------------INDIRECT-------------------*/
        pushFN(data,$expression_statements_goto);
        return 26;
    }
    /*6ee66156d2334d5a172289c207625645*/
}
function branch_71ffa1e91e4c72ff(l,data,state,prod){
    add_reduce(state,data,2,2);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$class_HC_listbody1_105_goto);
    return 10;
    /*71ffa1e91e4c72ff2bb5872f04bd238f*/
}
function branch_726a3904d833b747(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    if(!(l.current_byte==61/*[=]*/)||l.END(data)){
        /*
           124:341 virtual-128:3:1|-=>: type •
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*43:128 primitive_declaration=>identifier • : type*/
        /*VL:2*/
        pushFN(data,branch_ee044d7019e306de);
        return 43;
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else {
        /*
           123:340 virtual-126:4:1|-=>: type • primitive_declaration_group_169_116
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_6b4090ab809cd455);
        pushFN(data,$primitive_declaration_group_169_116);
        return 0;
    }
    /*726a3904d833b7470983443bb1c3042b*/
}
function branch_733dda514d501201(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        /*
           43:125 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_169_116
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_294d2bc0d3721b32);
        pushFN(data,$primitive_declaration_group_169_116);
        return 0;
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*
           43:127 primitive_declaration=>modifier_list identifier : type •
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        add_reduce(state,data,4,75);
        /*-------------INDIRECT-------------------*/
        pushFN(data,branch_5421d5d86a2a00b8);
        return 18;
    }
    /*733dda514d501201e3da93eb0a1d32ff*/
}
function branch_735762f53f607f70(l,data,state,prod){
    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    if(!(l.current_byte==58/*[:]*/)||l.END(data)){
        /*
           122:339 virtual-117:1:1|-=>•
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*37:117 member_expression=>identifier •*/
        /*VL:2*/
        pushFN(data,branch_ee044d7019e306de);
        return 37;
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    } else {
        /*
           122:339 virtual-117:1:1|-=>•
           123:340 virtual-126:4:1|-=>• : type primitive_declaration_group_169_116
           124:341 virtual-128:3:1|-=>• : type
        */
        let pk = l.copy();
        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(((pk.current_byte==95/*[_]*/)||(pk.current_byte==36/*[$]*/))||pk.isUniID(data)){
            /*
               123:340 virtual-126:4:1|-=>• : type primitive_declaration_group_169_116
               124:341 virtual-128:3:1|-=>• : type
            */
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_726a3904d833b747);
            pushFN(data,$type);
            return 0;
        }
    }
    return -1;
    /*735762f53f607f707b752c1cc557ce72*/
}
function branch_73836dabb810b0e0(l,data,state,prod){
    add_reduce(state,data,1,3);
    pushFN(data,$comment_HC_listbody1_131_goto);
    return 68;
    /*73836dabb810b0e0b1fdb471deb17be2*/
}
function branch_73b8ea077c729a29(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,10,21);
        /*-------------INDIRECT-------------------*/
        pushFN(data,$class_group_016_104_goto);
        return 9;
    }
    /*73b8ea077c729a29f4ef5c4cac28898c*/
}
function branch_73fe87daeebb95ac(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==40/*[(]*/){
        /*
           14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
           14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
           14:47 function_expression=>modifier_list fn : type ( • parameters ) { }
           14:50 function_expression=>modifier_list fn : type ( • ) { }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(l.current_byte==41/*[)]*/){
            /*
               14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
               14:50 function_expression=>modifier_list fn : type ( • ) { }
            */
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if(l.current_byte==123/*[{]*/){
                /*
                   14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }
                   14:50 function_expression=>modifier_list fn : type ( ) { • }
                */
                consume(l,data,state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if(l.current_byte==125/*[}]*/){
                    /*
                       14:50 function_expression=>modifier_list fn : type ( ) { • }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    consume(l,data,state);
                    add_reduce(state,data,8,33);
                    /*-------------INDIRECT-------------------*/
                    pushFN(data,branch_e39790d5d793cb80);
                    return 26;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else {
                    /*
                       14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    pushFN(data,branch_ed646011f3430e8a);
                    pushFN(data,$expression_statements);
                    return 0;
                }
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
               14:47 function_expression=>modifier_list fn : type ( • parameters ) { }
            */
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_c96fc0b01a0bb86b);
            pushFN(data,$parameters);
            return 0;
        }
    }
    /*73fe87daeebb95ac6edfac296edd25a1*/
}
function branch_747666e752112bf3(l,data,state,prod){
    add_reduce(state,data,3,65);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$expression_statements_goto);
    return 37;
    /*747666e752112bf3390391e8bf5ea7b4*/
}
function branch_74cbd9ffdcc4aecc(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==58/*[:]*/){
        /*
           43:126 primitive_declaration=>identifier : • type primitive_declaration_group_169_116
           43:128 primitive_declaration=>identifier : • type
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_a9b6266f9c3ac9b2);
        pushFN(data,$type);
        return 0;
    }
    /*74cbd9ffdcc4aecca470200b08f875a6*/
}
function branch_75dcdaa282cbb6b8(l,data,state,prod){
    add_reduce(state,data,2,92);
    return 65;
    /*75dcdaa282cbb6b883538a38ae2decaa*/
}
function branch_7618a45e1838f182(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==41/*[)]*/){
        /*
           14:45 function_expression=>fn : type ( parameters ) • { expression_statements }
           14:49 function_expression=>fn : type ( parameters ) • { }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if(l.current_byte==123/*[{]*/){
            /*
               14:45 function_expression=>fn : type ( parameters ) { • expression_statements }
               14:49 function_expression=>fn : type ( parameters ) { • }
            */
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if(l.current_byte==125/*[}]*/){
                /*
                   14:49 function_expression=>fn : type ( parameters ) { • }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                consume(l,data,state);
                add_reduce(state,data,8,32);
                return 14;
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   14:45 function_expression=>fn : type ( parameters ) { • expression_statements }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_8b75a3e6e7885b90);
                pushFN(data,$expression_statements);
                return 0;
            }
        }
    }
    /*7618a45e1838f18245b3e0d5d9584498*/
}
function branch_773c1b7212e8475b(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_e8d67fae4d7d2b82);
        pushFN(data,$expression);
        return 0;
    }
    /*773c1b7212e8475b4b0a423b5a6e1feb*/
}
function branch_775d5e5d4ad8c944(l,data,state,prod){
    add_reduce(state,data,5,73);
    add_reduce(state,data,1,3);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$expression_statements_goto);
    return 20;
    /*775d5e5d4ad8c9446f640c98303e9fda*/
}
function branch_780374fd5be39be5(l,data,state,prod){
    add_reduce(state,data,3,42);
    return 22;
    /*780374fd5be39be542fac992274043f7*/
}
function branch_784316aebe56b368(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        /*
           43:125 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_169_116
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_3c772c542ecd74c3);
        pushFN(data,$primitive_declaration_group_169_116);
        return 0;
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*
           43:127 primitive_declaration=>modifier_list identifier : type •
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        add_reduce(state,data,4,75);
        /*-------------INDIRECT-------------------*/
        return 9;
    }
    /*784316aebe56b36801b87a3af3a29bda*/
}
function branch_78715fd408bc8129(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==58/*[:]*/){
        /*
           43:125 primitive_declaration=>modifier_list identifier : • type primitive_declaration_group_169_116
           43:127 primitive_declaration=>modifier_list identifier : • type
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_e160362a74d4d7ef);
        pushFN(data,$type);
        return 0;
    }
    /*78715fd408bc81295a4a6859898a0b5f*/
}
function branch_78aa7468cfc4789b(l,data,state,prod){
    add_reduce(state,data,1,3);
    pushFN(data,$match_expression_HC_listbody3_113_goto);
    return 32;
    /*78aa7468cfc4789b495e29c5a67a12f7*/
}
function branch_7a56f01423f65eb9(l,data,state,prod){
    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    if(!(l.current_byte==41/*[)]*/)||l.END(data)){
        /*
           128:345 virtual-58:1:1|-=>•
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*18:58 expression_statements_group_023_108=>expression •*/
        /*VL:2*/
        pushFN(data,branch_ee044d7019e306de);
        return 18;
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    } else {
        /*
           127:344 virtual-332:2:1|-=>• )
           128:345 virtual-58:1:1|-=>•
        */
        let pk = l.copy();
        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if((((((((((((cmpr_set(pk,data,142,2,2)||cmpr_set(pk,data,66,5,5))||dt_bcea2102060eab13(pk,data))||cmpr_set(pk,data,94,4,4))||cmpr_set(pk,data,34,4,4))||cmpr_set(pk,data,19,4,4))||cmpr_set(pk,data,71,5,5))||cmpr_set(pk,data,76,6,6))||cmpr_set(pk,data,38,8,8))||cmpr_set(pk,data,62,4,4))||assert_ascii(pk,0x0,0x20000100,0x8000000,0x8000000))||pk.END(data))||pk.isSym(true,data)){
            /*
               127:344 virtual-332:2:1|-=>• )
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            consume(l,data,state);
            /*115:332 virtual-92:3:1|-=>expression • )*/
            /*VL:2*/
            /*29:92 loop_expression_group_254_111=>( • expression )*/
            /*VL:1*/
            pushFN(data,branch_3a4c5635f3d27ac2);
            return 29;
        }
    }
    return -1;
    /*7a56f01423f65eb935e005954e8e35b6*/
}
function branch_7a8be2c54a4d26e4(l,data,state,prod){
    pushFN(data,$class_group_016_104_goto);
    return 50;
    /*7a8be2c54a4d26e4693c3a0a89e60743*/
}
function branch_7aec22af26f85298(l,data,state,prod){
    add_reduce(state,data,4,60);
    return 33;
    /*7aec22af26f852982cb8c10588097bb6*/
}
function branch_7afd9b02530fef2e(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    if(!(((((dt_6ae31dd85a62ef5c(l,data)||cmpr_set(l,data,19,4,4))||assert_ascii(l,0x0,0x20000194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data))||((l.current_byte==125/*[}]*/)||(l.current_byte==59/*[;]*/))){
        /*
           19:61 expression_statements_group_124_109=>expression_statements_HC_listbody1_107 •
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        add_reduce(state,data,1,37);
        return 19;
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else {
        /*
           19:60 expression_statements_group_124_109=>expression_statements_HC_listbody1_107 • expression_statements_group_023_108
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_2e7fb3c467cc3310);
        pushFN(data,$expression_statements_group_023_108);
        return 0;
    }
    /*7afd9b02530fef2ee45b75cfb409587d*/
}
function branch_7b3ff986842915d5(l,data,state,prod){
    pushFN(data,branch_5421d5d86a2a00b8);
    return 26;
    /*7b3ff986842915d5027f9109195a9b27*/
}
function branch_7bd41de4c3b97b3a(l,data,state,prod){
    return 62;
    /*7bd41de4c3b97b3a1e5aaf8dd0db1c0b*/
}
function branch_7c5044a70fbaa6bb(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    pushFN(data,branch_413721b69b4b8263);
    pushFN(data,$unary_value);
    return 0;
    /*7c5044a70fbaa6bbecf377c5310985d6*/
}
function branch_7c73794220aa4308(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        /*
           43:125 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_169_116
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_ba09f2b9da5d73e5);
        pushFN(data,$primitive_declaration_group_169_116);
        return 0;
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*
           43:127 primitive_declaration=>modifier_list identifier : type •
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        add_reduce(state,data,4,75);
        /*-------------INDIRECT-------------------*/
        pushFN(data,branch_ee044d7019e306de);
        return 43;
    }
    /*7c73794220aa4308abcc4481cbee95ac*/
}
function branch_7ce3c892e937c246(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==59/*[;]*/){
        /*
           31:96 loop_expression=>loop ( parameters ; • expression ; loop_expression_HC_listbody6_112 ) expression
           31:100 loop_expression=>loop ( parameters ; • ; loop_expression_HC_listbody6_112 ) expression
           31:101 loop_expression=>loop ( parameters ; • expression ; ) expression
           31:104 loop_expression=>loop ( parameters ; • ; ) expression
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(l.current_byte==59/*[;]*/){
            /*
               31:100 loop_expression=>loop ( parameters ; • ; loop_expression_HC_listbody6_112 ) expression
               31:104 loop_expression=>loop ( parameters ; • ; ) expression
            */
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if(l.current_byte==41/*[)]*/){
                /*
                   31:104 loop_expression=>loop ( parameters ; ; • ) expression
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                consume(l,data,state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                pushFN(data,branch_5245eb7cd56c8e3e);
                pushFN(data,$expression);
                return 0;
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   31:100 loop_expression=>loop ( parameters ; ; • loop_expression_HC_listbody6_112 ) expression
                */
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_17adc88335dcd394);
                pushFN(data,$loop_expression_HC_listbody6_112);
                return 0;
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               31:96 loop_expression=>loop ( parameters ; • expression ; loop_expression_HC_listbody6_112 ) expression
               31:101 loop_expression=>loop ( parameters ; • expression ; ) expression
            */
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_ab75aaf9aa885333);
            pushFN(data,$expression);
            return 0;
        }
    }
    /*7ce3c892e937c246d9b815fd7f65a974*/
}
function branch_7d515c25abc23648(l,data,state,prod){
    add_reduce(state,data,3,35);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$match_expression_HC_listbody3_113_goto);
    return 32;
    /*7d515c25abc236484212fc4fb7d1e5fe*/
}
function branch_7d5450869ddbe2bd(l,data,state,prod){
    skip_db1786a8af54d666(l/*[ 71 ]*/,data,true);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/){
        /*
           108:325 virtual-191:3:1|-=>operator_HC_listbody1_128 • identifier_token_group_079_119
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_8c21ad31388b0104);
        pushFN(data,$identifier_token_group_079_119);
        return 0;
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*
           109:326 virtual-194:2:1|-=>operator_HC_listbody1_128 •
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*65:194 operator=>θsym • operator_HC_listbody1_128*/
        /*VL:0*/
        add_reduce(state,data,2,91);
        return 65;
    }
    /*7d5450869ddbe2bd8199ccdb1cd29399*/
}
function branch_7e5b06e2e73c7ad3(l,data,state,prod){
    add_reduce(state,data,1,3);
    pushFN(data,$class_HC_listbody1_105_goto);
    return 10;
    /*7e5b06e2e73c7ad3bb8d1f5d414026c0*/
}
function branch_7edcada999e77066(l,data,state,prod){
    add_reduce(state,data,5,73);
    return 43;
    /*7edcada999e77066064588b12e44d140*/
}
function branch_7f0a7c317efe91d9(l,data,state,prod){
    add_reduce(state,data,1,3);
    pushFN(data,$module_HC_listbody1_101_goto);
    return 2;
    /*7f0a7c317efe91d93f70ee062c75a1c0*/
}
function branch_802895e897fe5195(l,data,state,prod){
    add_reduce(state,data,4,74);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$expression_statements_group_023_108_goto);
    return 18;
    /*802895e897fe51951d5d4cb296fe1db4*/
}
function branch_80892866db558b25(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==58/*[:]*/){
        /*
           24:78 if_expression=>if expression : • expression if_expression_group_139_110
           24:79 if_expression=>if expression : • expression
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_ff5f88324af8291b);
        pushFN(data,$expression);
        return 0;
    }
    /*80892866db558b2517256f3f48efce7e*/
}
function branch_80e5d6e7810be94e(l,data,state,prod){
    pushFN(data,branch_e39790d5d793cb80);
    return 26;
    /*80e5d6e7810be94e4373411e12edc183*/
}
function branch_818d14bff9153d48(l,data,state,prod){
    add_reduce(state,data,9,50);
    /*818d14bff9153d480ff0f43e3f5ee895*/
}
function branch_844dc852f21c4995(l,data,state,prod){
    add_reduce(state,data,3,65);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$expression_statements_group_023_108_goto);
    return 37;
    /*844dc852f21c499565cacaf8c40c0b19*/
}
function branch_85479b24ccc90691(l,data,state,prod){
    add_reduce(state,data,3,35);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$loop_expression_HC_listbody6_112_goto);
    return 30;
    /*85479b24ccc906918bd44c94fd66a581*/
}
function branch_855d8df26ec02ced(l,data,state,prod){
    /*-------------INDIRECT-------------------*/
    /*112:329 virtual-104:7:1|-=>( • parameters ; ; ) expression*/
    /*VL:1*/
    /*31:104 loop_expression=>loop • ( parameters ; ; ) expression*/
    /*VL:0*/
    add_reduce(state,data,7,58);
    return 31;
    /*855d8df26ec02cede1ef2f4dcd059a6c*/
}
function branch_859a73d5c409fc4a(l,data,state,prod){
    add_reduce(state,data,2,2);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$def$hex_token_HC_listbody1_105_goto);
    return 88;
    /*859a73d5c409fc4ad3ea80ad7fdbb05b*/
}
function branch_86b9d47a2c99c413(l,data,state,prod){
    add_reduce(state,data,3,35);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$def$defaultproductions_goto);
    return 75;
    /*86b9d47a2c99c413ae2247abb9d9c2b1*/
}
function branch_88bbcc9023e955e5(l,data,state,prod){
    add_reduce(state,data,3,46);
    /*-------------INDIRECT-------------------*/
    /*31:98 loop_expression=>loop expression •*/
    /*VL:0*/
    add_reduce(state,data,2,52);
    return 31;
    /*88bbcc9023e955e5f3393f5bd13430af*/
}
function branch_898554f87ba1478b(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==93/*[]]*/)&&consume(l,data,state)){
        add_reduce(state,data,4,66);
        /*-------------INDIRECT-------------------*/
        pushFN(data,$expression_statements_group_023_108_goto);
        return 37;
    }
    /*898554f87ba1478b8c9b6a0520f731e1*/
}
function branch_8b75a3e6e7885b90(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,9,28);
        return 14;
    }
    /*8b75a3e6e7885b90dadd4c57bf17c8fa*/
}
function branch_8b8dd7066e507d3d(l,data,state,prod){
    add_reduce(state,data,2,52);
    return 31;
    /*8b8dd7066e507d3dc3e1998fd8a87515*/
}
function branch_8bb728d0418c3ab8(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        /*
           43:125 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_169_116
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_775d5e5d4ad8c944);
        pushFN(data,$primitive_declaration_group_169_116);
        return 0;
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*
           43:127 primitive_declaration=>modifier_list identifier : type •
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        add_reduce(state,data,4,75);
        add_reduce(state,data,1,3);
        /*-------------INDIRECT-------------------*/
        return 20;
    }
    /*8bb728d0418c3ab844329bfb1100ba37*/
}
function branch_8bf7f3e4c05b5cac(l,data,state,prod){
    add_reduce(state,data,1,3);
    pushFN(data,$def$defaultproductions_goto);
    return 75;
    /*8bf7f3e4c05b5cac0b06c5055d7fd92e*/
}
function branch_8c21ad31388b0104(l,data,state,prod){
    /*65:191 operator=>θsym • operator_HC_listbody1_128 identifier_token_group_079_119*/
    /*VL:0*/
    add_reduce(state,data,3,91);
    return 65;
    /*8c21ad31388b010461d1f5ecd5325d86*/
}
function branch_8c334c504ba4dbdf(l,data,state,prod){
    add_reduce(state,data,3,65);
    /*-------------INDIRECT-------------------*/
    pushFN(data,branch_e39790d5d793cb80);
    return 37;
    /*8c334c504ba4dbdf9d0bf1b8f5894c60*/
}
function branch_8c57d1885b959d2a(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,10,27);
        /*-------------INDIRECT-------------------*/
        pushFN(data,$expression_statements_group_023_108_goto);
        return 26;
    }
    /*8c57d1885b959d2ab3a777ec50f34433*/
}
function branch_8c9ab25df4a17c06(l,data,state,prod){
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        /*
           111:328 virtual-76:3:1|-=>• = expression
           112:329 virtual-85:1:1|-=>•
        */
        let pk = l.copy();
        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(((((dt_6ae31dd85a62ef5c(pk,data)||cmpr_set(pk,data,19,4,4))||assert_ascii(pk,0x0,0x20000194,0x88000000,0x8000000))||pk.isUniID(data))||pk.isNum(data))||pk.isSym(true,data)){
            /*
               111:328 virtual-76:3:1|-=>• = expression
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_4bcef3d8f2a9eecb);
            pushFN(data,$expression);
            return 0;
        }
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*
           112:329 virtual-85:1:1|-=>•
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*27:85 unary_value=>left_hand_expression •*/
        /*VL:0*/
        pushFN(data,$expression_statements_goto);
        return 26;
    }
    return -1;
    /*8c9ab25df4a17c062e3d3d57a41a2e04*/
}
function branch_8dc9de93c0c5b63e(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==40/*[(]*/){
        /*
           13:37 function=>fn identifier : type ( • parameters ) { expression_statements }
           13:40 function=>fn identifier : type ( • ) { expression_statements }
           13:41 function=>fn identifier : type ( • parameters ) { }
           13:43 function=>fn identifier : type ( • ) { }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(l.current_byte==41/*[)]*/){
            /*
               13:40 function=>fn identifier : type ( • ) { expression_statements }
               13:43 function=>fn identifier : type ( • ) { }
            */
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if(l.current_byte==123/*[{]*/){
                /*
                   13:40 function=>fn identifier : type ( ) { • expression_statements }
                   13:43 function=>fn identifier : type ( ) { • }
                */
                consume(l,data,state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if(l.current_byte==125/*[}]*/){
                    /*
                       13:43 function=>fn identifier : type ( ) { • }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    consume(l,data,state);
                    add_reduce(state,data,8,26);
                    return 13;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else {
                    /*
                       13:40 function=>fn identifier : type ( ) { • expression_statements }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    pushFN(data,branch_dc0325cf695ea04c);
                    pushFN(data,$expression_statements);
                    return 0;
                }
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               13:37 function=>fn identifier : type ( • parameters ) { expression_statements }
               13:41 function=>fn identifier : type ( • parameters ) { }
            */
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_37bc2cfca2cd3d74);
            pushFN(data,$parameters);
            return 0;
        }
    }
    /*8dc9de93c0c5b63efd302839e4ec1b2f*/
}
function branch_8e52f3d918ebbf7d(l,data,state,prod){
    add_reduce(state,data,5,73);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$expression_statements_group_023_108_goto);
    return 18;
    /*8e52f3d918ebbf7d34b012514d6cf953*/
}
function branch_8ea67d1f97947eef(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        /*
           43:126 primitive_declaration=>identifier : type • primitive_declaration_group_169_116
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_ca5d812a50c21a37);
        pushFN(data,$primitive_declaration_group_169_116);
        return 0;
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*
           43:128 primitive_declaration=>identifier : type •
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        add_reduce(state,data,3,76);
        /*-------------INDIRECT-------------------*/
        pushFN(data,branch_ee044d7019e306de);
        return 43;
    }
    /*8ea67d1f97947eef07a468ed3307664a*/
}
function branch_8ef1d6900037cd4e(l,data,state,prod){
    add_reduce(state,data,3,35);
    /*-------------INDIRECT-------------------*/
    pushFN(data,branch_ee044d7019e306de);
    return 16;
    /*8ef1d6900037cd4e10c99f3977be661b*/
}
function branch_8fad89624a9aa97d(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(l.current_byte==123/*[{]*/){
        /*
           11:28 class=>cls identifier • { class_HC_listbody1_105 }
           11:31 class=>cls identifier • { }
        */
        let pk = l.copy();
        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(pk.current_byte==125/*[}]*/){
            /*
               11:31 class=>cls identifier • { }
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
                add_reduce(state,data,4,14);
                return 11;
            }
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else {
            /*
               11:28 class=>cls identifier • { class_HC_listbody1_105 }
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_6ab8c6d3fc6a956d);
            pushFN(data,$class_HC_listbody1_105);
            return 0;
        }
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else {
        /*
           11:25 class=>cls identifier • class_group_113_103 { class_HC_listbody1_105 }
           11:29 class=>cls identifier • class_group_113_103 { }
        */
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_9562d80b8e7712f2);
        pushFN(data,$class_group_113_103);
        return 0;
    }
    /*8fad89624a9aa97d6cf630a8cbc354dd*/
}
function branch_902df008a70a405c(l,data,state,prod){
    add_reduce(state,data,2,87);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$def$string_value_goto);
    return 103;
    /*902df008a70a405cc948531adc46405e*/
}
function branch_907da7cc882c4c7b(l,data,state,prod){
    add_reduce(state,data,7,51);
    /*907da7cc882c4c7b0860d866f0862a07*/
}
function branch_90c38ebe7f441106(l,data,state,prod){
    pushFN(data,branch_5421d5d86a2a00b8);
    return 65;
    /*90c38ebe7f441106e188e46fccded971*/
}
function branch_91069d246f9ac9b9(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,10,27);
        /*-------------INDIRECT-------------------*/
        pushFN(data,branch_e39790d5d793cb80);
        return 26;
    }
    /*91069d246f9ac9b942a66fb7bf0f0473*/
}
function branch_912ec2aa6d77c4c2(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    pushFN(data,branch_33cc01c56694466e);
    pushFN(data,$identifier);
    return 0;
    /*912ec2aa6d77c4c21d0b6d4e7df93921*/
}
function branch_91702d133f840d06(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==93/*[]]*/)&&consume(l,data,state)){
        add_reduce(state,data,4,66);
        /*-------------INDIRECT-------------------*/
        pushFN(data,branch_ee044d7019e306de);
        return 37;
    }
    /*91702d133f840d069ba9cba97b90c02f*/
}
function branch_91bd6de142fc31b3(l,data,state,prod){
    add_reduce(state,data,1,88);
    pushFN(data,$string_HC_listbody1_127_goto);
    return 59;
    /*91bd6de142fc31b389ffad694c2371ba*/
}
function branch_92afc2d9878633ca(l,data,state,prod){
    add_reduce(state,data,2,0);
    return 48;
    /*92afc2d9878633ca560dbab5e7300421*/
}
function branch_92eec2aad9aebf10(l,data,state,prod){
    add_reduce(state,data,3,65);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$member_expression_goto);
    return 37;
    /*92eec2aad9aebf10982146bf7ed2938e*/
}
function branch_9326ced0ea767996(l,data,state,prod){
    add_reduce(state,data,1,4);
    pushFN(data,$statements_goto);
    return 4;
    /*9326ced0ea7679968e0e77e8340732d9*/
}
function branch_932a47b157fc4242(l,data,state,prod){
    add_reduce(state,data,3,35);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$parameters_HC_listbody10_106_goto);
    return 15;
    /*932a47b157fc42422e7412dbd8156b8c*/
}
function branch_93b7d445e0f273d3(l,data,state,prod){
    /*-------------INDIRECT-------------------*/
    /*109:326 virtual-96:9:1|-=>( • parameters ; expression ; loop_expression_HC_listbody6_112 ) expression*/
    /*VL:1*/
    /*31:96 loop_expression=>loop • ( parameters ; expression ; loop_expression_HC_listbody6_112 ) expression*/
    /*VL:0*/
    add_reduce(state,data,9,50);
    return 31;
    /*93b7d445e0f273d33c57addc8999c82b*/
}
function branch_94acace019097f67(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    if(!(l.current_byte==61/*[=]*/)||l.END(data)){
        /*
           137:354 virtual-128:3:1|-=>: type •
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*43:128 primitive_declaration=>identifier • : type*/
        /*VL:2*/
        pushFN(data,branch_e39790d5d793cb80);
        return 43;
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else {
        /*
           136:353 virtual-126:4:1|-=>: type • primitive_declaration_group_169_116
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_6b4090ab809cd455);
        pushFN(data,$primitive_declaration_group_169_116);
        return 0;
    }
    /*94acace019097f6763919ea11d5e8ee5*/
}
function branch_951bba39efc47946(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    switch(sym_map_c889cd6dda6b71c6(l,data)){
        default:
        case 0:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            add_reduce(state,data,2,45);
            return 25;
        case 1:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_07626bd16c9eede0);
            pushFN(data,$expression);
            return 0;
        case 2:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
            pushFN(data,branch_07626bd16c9eede0);
            pushFN(data,$expression);
            return 0;
    }
    /*951bba39efc47946dab955a3a32e32b2*/
}
function branch_953281d6bef44d25(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==40/*[(]*/){
        /*
           36:113 call_expression=>member_expression ( • call_expression_HC_listbody2_114 )
           36:114 call_expression=>member_expression ( • )
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.current_byte==41/*[)]*/){
            /*
               36:114 call_expression=>member_expression ( • )
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            consume(l,data,state);
            add_reduce(state,data,3,64);
            return 36;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               36:113 call_expression=>member_expression ( • call_expression_HC_listbody2_114 )
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_ac27fc87d010b2ae);
            pushFN(data,$call_expression_HC_listbody2_114);
            return 0;
        }
    }
    /*953281d6bef44d2521a692f420600c3d*/
}
function branch_9562d80b8e7712f2(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==123/*[{]*/){
        /*
           11:25 class=>cls identifier class_group_113_103 { • class_HC_listbody1_105 }
           11:29 class=>cls identifier class_group_113_103 { • }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.current_byte==125/*[}]*/){
            /*
               11:29 class=>cls identifier class_group_113_103 { • }
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            consume(l,data,state);
            add_reduce(state,data,5,12);
            return 11;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               11:25 class=>cls identifier class_group_113_103 { • class_HC_listbody1_105 }
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_4f859722ebf3c831);
            pushFN(data,$class_HC_listbody1_105);
            return 0;
        }
    }
    /*9562d80b8e7712f298250cd628f7bbff*/
}
function branch_9634317f03e0b010(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,8,31);
        return 14;
    }
    /*9634317f03e0b01047c114adcffb4adb*/
}
function branch_96e26b3f3308f7c6(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==40/*[(]*/){
        /*
           13:36 function=>modifier_list fn identifier : type ( • parameters ) { expression_statements }
           13:38 function=>modifier_list fn identifier : type ( • ) { expression_statements }
           13:39 function=>modifier_list fn identifier : type ( • parameters ) { }
           13:42 function=>modifier_list fn identifier : type ( • ) { }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(l.current_byte==41/*[)]*/){
            /*
               13:38 function=>modifier_list fn identifier : type ( • ) { expression_statements }
               13:42 function=>modifier_list fn identifier : type ( • ) { }
            */
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if(l.current_byte==123/*[{]*/){
                /*
                   13:38 function=>modifier_list fn identifier : type ( ) { • expression_statements }
                   13:42 function=>modifier_list fn identifier : type ( ) { • }
                */
                consume(l,data,state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if(l.current_byte==125/*[}]*/){
                    /*
                       13:42 function=>modifier_list fn identifier : type ( ) { • }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    consume(l,data,state);
                    add_reduce(state,data,9,25);
                    /*-------------INDIRECT-------------------*/
                    pushFN(data,$statements_goto);
                    return 4;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else {
                    /*
                       13:38 function=>modifier_list fn identifier : type ( ) { • expression_statements }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    pushFN(data,branch_9dd2822300e6d441);
                    pushFN(data,$expression_statements);
                    return 0;
                }
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               13:36 function=>modifier_list fn identifier : type ( • parameters ) { expression_statements }
               13:39 function=>modifier_list fn identifier : type ( • parameters ) { }
            */
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_06fb8b673d2402f8);
            pushFN(data,$parameters);
            return 0;
        }
    }
    /*96e26b3f3308f7c6514f47670745a841*/
}
function branch_97946dd38e34dd15(l,data,state,prod){
    pushFN(data,$expression_statements_goto);
    return 44;
    /*97946dd38e34dd15fca388ad27f0753f*/
}
function branch_9820193bad075219(l,data,state,prod){
    skip_db1786a8af54d666(l/*[ 71 ]*/,data,true);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/){
        /*
           48:137 identifier_token=>identifier_token_group_074_117 identifier_token_HC_listbody1_118 • identifier_token_group_079_119
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_398d9230ecf58463);
        pushFN(data,$identifier_token_group_079_119);
        return 0;
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*
           48:139 identifier_token=>identifier_token_group_074_117 identifier_token_HC_listbody1_118 •
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        add_reduce(state,data,2,0);
    }
    /*9820193bad075219d3390128e6c7bce4*/
}
function branch_98d96b9e3b2e6979(l,data,state,prod){
    add_reduce(state,data,2,2);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$def$octal_token_HC_listbody1_110_goto);
    return 95;
    /*98d96b9e3b2e6979e6076b8170dbb59f*/
}
function branch_99b1a244a91348da(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==40/*[(]*/){
        /*
           13:36 function=>modifier_list fn identifier : type ( • parameters ) { expression_statements }
           13:38 function=>modifier_list fn identifier : type ( • ) { expression_statements }
           13:39 function=>modifier_list fn identifier : type ( • parameters ) { }
           13:42 function=>modifier_list fn identifier : type ( • ) { }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(l.current_byte==41/*[)]*/){
            /*
               13:38 function=>modifier_list fn identifier : type ( • ) { expression_statements }
               13:42 function=>modifier_list fn identifier : type ( • ) { }
            */
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if(l.current_byte==123/*[{]*/){
                /*
                   13:38 function=>modifier_list fn identifier : type ( ) { • expression_statements }
                   13:42 function=>modifier_list fn identifier : type ( ) { • }
                */
                consume(l,data,state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if(l.current_byte==125/*[}]*/){
                    /*
                       13:42 function=>modifier_list fn identifier : type ( ) { • }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    consume(l,data,state);
                    add_reduce(state,data,9,25);
                    /*-------------INDIRECT-------------------*/
                    pushFN(data,$class_group_016_104_goto);
                    return 9;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else {
                    /*
                       13:38 function=>modifier_list fn identifier : type ( ) { • expression_statements }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    pushFN(data,branch_73b8ea077c729a29);
                    pushFN(data,$expression_statements);
                    return 0;
                }
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               13:36 function=>modifier_list fn identifier : type ( • parameters ) { expression_statements }
               13:39 function=>modifier_list fn identifier : type ( • parameters ) { }
            */
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_d0f82b198075315f);
            pushFN(data,$parameters);
            return 0;
        }
    }
    /*99b1a244a91348da20b77c4908d36f74*/
}
function branch_9b7f66694e8c6d9b(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_c4beae2f461d992b);
        pushFN(data,$expression);
        return 0;
    }
    /*9b7f66694e8c6d9b61165a632e4016ac*/
}
function branch_9c0cdd675efd2996(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        add_reduce(state,data,4,63);
        /*-------------INDIRECT-------------------*/
        pushFN(data,$expression_statements_group_023_108_goto);
        return 26;
    }
    /*9c0cdd675efd2996a08289d82a11f543*/
}
function branch_9cd5fb059f7c0033(l,data,state,prod){
    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    if(!(l.current_byte==41/*[)]*/)||l.END(data)){
        /*
           150:367 virtual-58:1:1|-=>•
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*18:58 expression_statements_group_023_108=>expression •*/
        /*VL:2*/
        pushFN(data,branch_5421d5d86a2a00b8);
        return 18;
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    } else {
        /*
           149:366 virtual-361:2:1|-=>• )
           150:367 virtual-58:1:1|-=>•
        */
        let pk = l.copy();
        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if((((((((((((cmpr_set(pk,data,142,2,2)||cmpr_set(pk,data,66,5,5))||dt_bcea2102060eab13(pk,data))||cmpr_set(pk,data,94,4,4))||cmpr_set(pk,data,34,4,4))||cmpr_set(pk,data,19,4,4))||cmpr_set(pk,data,71,5,5))||cmpr_set(pk,data,76,6,6))||cmpr_set(pk,data,38,8,8))||cmpr_set(pk,data,62,4,4))||assert_ascii(pk,0x0,0x20000100,0x8000000,0x8000000))||pk.END(data))||pk.isSym(true,data)){
            /*
               149:366 virtual-361:2:1|-=>• )
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            consume(l,data,state);
            /*144:361 virtual-92:3:1|-=>expression • )*/
            /*VL:2*/
            /*29:92 loop_expression_group_254_111=>( • expression )*/
            /*VL:1*/
            pushFN(data,branch_1d4995829d243c99);
            return 29;
        }
    }
    return -1;
    /*9cd5fb059f7c003398f541d844dca0b5*/
}
function branch_9dd2822300e6d441(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,10,21);
        /*-------------INDIRECT-------------------*/
        pushFN(data,$statements_goto);
        return 4;
    }
    /*9dd2822300e6d4413894a564cde53234*/
}
function branch_9e0195d83997353c(l,data,state,prod){
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        /*
           140:357 virtual-76:3:1|-=>• = expression
           141:358 virtual-85:1:1|-=>•
        */
        let pk = l.copy();
        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(((((dt_6ae31dd85a62ef5c(pk,data)||cmpr_set(pk,data,19,4,4))||assert_ascii(pk,0x0,0x20000194,0x88000000,0x8000000))||pk.isUniID(data))||pk.isNum(data))||pk.isSym(true,data)){
            /*
               140:357 virtual-76:3:1|-=>• = expression
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_30a8ac2a61770e68);
            pushFN(data,$expression);
            return 0;
        }
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*
           141:358 virtual-85:1:1|-=>•
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*27:85 unary_value=>left_hand_expression •*/
        /*VL:2*/
        pushFN(data,branch_e39790d5d793cb80);
        return 27;
    }
    return -1;
    /*9e0195d83997353c19e1d4c9706c27c3*/
}
function branch_9e5fbae7373ee27c(l,data,state,prod){
    add_reduce(state,data,2,2);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$modifier_list_HC_listbody1_120_goto);
    return 49;
    /*9e5fbae7373ee27c0ca394a335dbae92*/
}
function branch_9ed088d0c21de14b(l,data,state,prod){
    /*22:76 assignment_expression=>left_hand_expression • = expression*/
    /*VL:0*/
    add_reduce(state,data,3,42);
    pushFN(data,$expression_goto);
    return 21;
    /*9ed088d0c21de14bc873841b90cb1934*/
}
function branch_9edb7834ab882959(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==40/*[(]*/){
        /*
           14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
           14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
           14:47 function_expression=>modifier_list fn : type ( • parameters ) { }
           14:50 function_expression=>modifier_list fn : type ( • ) { }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(l.current_byte==41/*[)]*/){
            /*
               14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
               14:50 function_expression=>modifier_list fn : type ( • ) { }
            */
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if(l.current_byte==123/*[{]*/){
                /*
                   14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }
                   14:50 function_expression=>modifier_list fn : type ( ) { • }
                */
                consume(l,data,state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if(l.current_byte==125/*[}]*/){
                    /*
                       14:50 function_expression=>modifier_list fn : type ( ) { • }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    consume(l,data,state);
                    add_reduce(state,data,8,33);
                    return 14;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else {
                    /*
                       14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    pushFN(data,branch_19c074d3aef73be7);
                    pushFN(data,$expression_statements);
                    return 0;
                }
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
               14:47 function_expression=>modifier_list fn : type ( • parameters ) { }
            */
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_28441fe4dc9706e4);
            pushFN(data,$parameters);
            return 0;
        }
    }
    /*9edb7834ab882959d440676a2af442e2*/
}
function branch_9fe340c77d37e69a(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==123/*[{]*/){
        /*
           12:32 struct=>modifier_list str identifier { • parameters }
           12:34 struct=>modifier_list str identifier { • }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.current_byte==125/*[}]*/){
            /*
               12:34 struct=>modifier_list str identifier { • }
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            consume(l,data,state);
            add_reduce(state,data,5,17);
            /*-------------INDIRECT-------------------*/
            pushFN(data,$class_group_016_104_goto);
            return 9;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               12:32 struct=>modifier_list str identifier { • parameters }
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_c17cd9799d850159);
            pushFN(data,$parameters);
            return 0;
        }
    }
    /*9fe340c77d37e69ac12aa427a94b490e*/
}
function branch_9fea2735762a3227(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==123/*[{]*/){
        /*
           7:16 namespace=>ns identifier { • namespace_HC_listbody3_102 }
           7:17 namespace=>ns identifier { • }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.current_byte==125/*[}]*/){
            /*
               7:17 namespace=>ns identifier { • }
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            consume(l,data,state);
            add_reduce(state,data,4,6);
            return 7;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               7:16 namespace=>ns identifier { • namespace_HC_listbody3_102 }
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_47941f6b8bbc7250);
            pushFN(data,$namespace_HC_listbody3_102);
            return 0;
        }
    }
    /*9fea2735762a3227a40cb028c4a6ea31*/
}
function branch_a1b35c95932e2573(l,data,state,prod){
    pushFN(data,branch_e39790d5d793cb80);
    return 65;
    /*a1b35c95932e257378dee23bd1951ddb*/
}
function branch_a200ff284705e6f2(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if(cmpr_set(l,data,42,2,2)&&consume(l,data,state)){
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_21d011590bad51a3);
        pushFN(data,$expression);
        return 0;
    }
    /*a200ff284705e6f2eaa5448928955132*/
}
function branch_a21d1b46c25036ab(l,data,state,prod){
    add_reduce(state,data,3,46);
    /*-------------INDIRECT-------------------*/
    pushFN(data,branch_e39790d5d793cb80);
    return 21;
    /*a21d1b46c25036ab5b1fa32ada8ecca2*/
}
function branch_a280998f5fd578b8(l,data,state,prod){
    add_reduce(state,data,2,0);
    return 38;
    /*a280998f5fd578b8f6d7f5e060c281db*/
}
function branch_a2ade393e0ff2119(l,data,state,prod){
    add_reduce(state,data,2,0);
    return 96;
    /*a2ade393e0ff2119b3fa1b310e414095*/
}
function branch_a344a7e7c13713a7(l,data,state,prod){
    add_reduce(state,data,3,35);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$call_expression_HC_listbody2_114_goto);
    return 35;
    /*a344a7e7c13713a7f247c5c0f4fb1e43*/
}
function branch_a361b6ba667a3ff7(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==58/*[:]*/){
        /*
           13:36 function=>modifier_list fn identifier : • type ( parameters ) { expression_statements }
           13:38 function=>modifier_list fn identifier : • type ( ) { expression_statements }
           13:39 function=>modifier_list fn identifier : • type ( parameters ) { }
           13:42 function=>modifier_list fn identifier : • type ( ) { }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_96e26b3f3308f7c6);
        pushFN(data,$type);
        return 0;
    }
    /*a361b6ba667a3ff7943231e1a1a1a566*/
}
function branch_a367c2885e5a992a(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,10,21);
        return 13;
    }
    /*a367c2885e5a992a8a177239d68b6595*/
}
function branch_a4384264bf5c7ab7(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==41/*[)]*/){
        /*
           13:36 function=>modifier_list fn identifier : type ( parameters ) • { expression_statements }
           13:39 function=>modifier_list fn identifier : type ( parameters ) • { }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if(l.current_byte==123/*[{]*/){
            /*
               13:36 function=>modifier_list fn identifier : type ( parameters ) { • expression_statements }
               13:39 function=>modifier_list fn identifier : type ( parameters ) { • }
            */
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if(l.current_byte==125/*[}]*/){
                /*
                   13:39 function=>modifier_list fn identifier : type ( parameters ) { • }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                consume(l,data,state);
                add_reduce(state,data,10,22);
                return 13;
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   13:36 function=>modifier_list fn identifier : type ( parameters ) { • expression_statements }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_d62b5b8cbd7267e5);
                pushFN(data,$expression_statements);
                return 0;
            }
        }
    }
    /*a4384264bf5c7ab72c0ce328cfd9fa35*/
}
function branch_a443d094a8c7e898(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,7,7);
        /*-------------INDIRECT-------------------*/
        pushFN(data,$statements_goto);
        return 4;
    }
    /*a443d094a8c7e898e01632e0e7ac16b9*/
}
function branch_a47e22360bc8eb23(l,data,state,prod){
    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    if(!(l.current_byte==41/*[)]*/)||l.END(data)){
        /*
           132:349 virtual-58:1:1|-=>•
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*18:58 expression_statements_group_023_108=>expression •*/
        /*VL:2*/
        pushFN(data,branch_45b78c1aca41cc8a);
        return 18;
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    } else {
        /*
           131:348 virtual-346:2:1|-=>• )
           132:349 virtual-58:1:1|-=>•
        */
        let pk = l.copy();
        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if((((((((((((cmpr_set(pk,data,142,2,2)||cmpr_set(pk,data,66,5,5))||dt_bcea2102060eab13(pk,data))||cmpr_set(pk,data,94,4,4))||cmpr_set(pk,data,34,4,4))||cmpr_set(pk,data,19,4,4))||cmpr_set(pk,data,71,5,5))||cmpr_set(pk,data,76,6,6))||cmpr_set(pk,data,38,8,8))||cmpr_set(pk,data,62,4,4))||assert_ascii(pk,0x0,0x20000100,0x8000000,0x8000000))||pk.END(data))||pk.isSym(true,data)){
            /*
               131:348 virtual-346:2:1|-=>• )
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            consume(l,data,state);
            /*129:346 virtual-92:3:1|-=>expression • )*/
            /*VL:2*/
            /*29:92 loop_expression_group_254_111=>( • expression )*/
            /*VL:1*/
            pushFN(data,branch_3a4c5635f3d27ac2);
            return 29;
        }
    }
    return -1;
    /*a47e22360bc8eb23797c61542a79aaff*/
}
function branch_a49526eea2b79a2d(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==123/*[{]*/){
        /*
           11:24 class=>modifier_list cls identifier class_group_113_103 { • class_HC_listbody1_105 }
           11:27 class=>modifier_list cls identifier class_group_113_103 { • }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.current_byte==125/*[}]*/){
            /*
               11:27 class=>modifier_list cls identifier class_group_113_103 { • }
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            consume(l,data,state);
            add_reduce(state,data,6,10);
            return 11;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               11:24 class=>modifier_list cls identifier class_group_113_103 { • class_HC_listbody1_105 }
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_210f970a58cb09ad);
            pushFN(data,$class_HC_listbody1_105);
            return 0;
        }
    }
    /*a49526eea2b79a2df579af1d0f1ff799*/
}
function branch_a4b8d46738701bdc(l,data,state,prod){
    pushFN(data,branch_ee044d7019e306de);
    return 50;
    /*a4b8d46738701bdcef2475d99f3233c1*/
}
function branch_a6a82a9baab43c58(l,data,state,prod){
    add_reduce(state,data,2,0);
    return 101;
    /*a6a82a9baab43c5822362b1805558cf1*/
}
function branch_a6b376ed0bf34743(l,data,state,prod){
    add_reduce(state,data,2,0);
    return 89;
    /*a6b376ed0bf34743cfdd9c0272c37bee*/
}
function branch_a6f489c38be28a8a(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        add_reduce(state,data,3,36);
        return 29;
    }
    /*a6f489c38be28a8aae95417a04cd2613*/
}
function branch_a80aeda0d4128b25(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==123/*[{]*/){
        /*
           12:32 struct=>modifier_list str identifier { • parameters }
           12:34 struct=>modifier_list str identifier { • }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.current_byte==125/*[}]*/){
            /*
               12:34 struct=>modifier_list str identifier { • }
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            consume(l,data,state);
            add_reduce(state,data,5,17);
            return 12;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               12:32 struct=>modifier_list str identifier { • parameters }
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_4b0edc44e83efea2);
            pushFN(data,$parameters);
            return 0;
        }
    }
    /*a80aeda0d4128b2509dd09095f201c68*/
}
function branch_a88e40286a4a7bea(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(l.current_byte==123/*[{]*/){
        /*
           11:26 class=>modifier_list cls identifier • { class_HC_listbody1_105 }
           11:30 class=>modifier_list cls identifier • { }
        */
        let pk = l.copy();
        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(pk.current_byte==125/*[}]*/){
            /*
               11:30 class=>modifier_list cls identifier • { }
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
                add_reduce(state,data,5,13);
                /*-------------INDIRECT-------------------*/
                pushFN(data,$statements_goto);
                return 4;
            }
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else {
            /*
               11:26 class=>modifier_list cls identifier • { class_HC_listbody1_105 }
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_faf51e1820faf277);
            pushFN(data,$class_HC_listbody1_105);
            return 0;
        }
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else {
        /*
           11:24 class=>modifier_list cls identifier • class_group_113_103 { class_HC_listbody1_105 }
           11:27 class=>modifier_list cls identifier • class_group_113_103 { }
        */
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_cf2510584ec88340);
        pushFN(data,$class_group_113_103);
        return 0;
    }
    /*a88e40286a4a7bea863a536c433d78c9*/
}
function branch_a94b062fa788e748(l,data,state,prod){
    add_reduce(state,data,2,68);
    return 39;
    /*a94b062fa788e7488781b0ddd4a117ca*/
}
function branch_a96d7c2556c7c082(l,data,state,prod){
    add_reduce(state,data,2,2);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$comment_HC_listbody1_132_goto);
    return 69;
    /*a96d7c2556c7c0826d6c173e1a8df992*/
}
function branch_a9b6266f9c3ac9b2(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        /*
           43:126 primitive_declaration=>identifier : type • primitive_declaration_group_169_116
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_0bb84167e13a1c29);
        pushFN(data,$primitive_declaration_group_169_116);
        return 0;
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*
           43:128 primitive_declaration=>identifier : type •
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        add_reduce(state,data,3,76);
        return 43;
    }
    /*a9b6266f9c3ac9b2173ee3c93e1085a7*/
}
function branch_aa3116d56547b12e(l,data,state,prod){
    add_reduce(state,data,3,42);
    /*aa3116d56547b12e86044408aa6f0a1a*/
}
function branch_ab75aaf9aa885333(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==59/*[;]*/){
        /*
           31:96 loop_expression=>loop ( parameters ; expression ; • loop_expression_HC_listbody6_112 ) expression
           31:101 loop_expression=>loop ( parameters ; expression ; • ) expression
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.current_byte==41/*[)]*/){
            /*
               31:101 loop_expression=>loop ( parameters ; expression ; • ) expression
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_f7d89ae45c18d577);
            pushFN(data,$expression);
            return 0;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               31:96 loop_expression=>loop ( parameters ; expression ; • loop_expression_HC_listbody6_112 ) expression
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_b09b16aad1bdc0ca);
            pushFN(data,$loop_expression_HC_listbody6_112);
            return 0;
        }
    }
    /*ab75aaf9aa88533304738f949aa0b82b*/
}
function branch_ac215d0e3b47a515(l,data,state,prod){
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        /*
           111:328 virtual-76:3:1|-=>• = expression
           112:329 virtual-85:1:1|-=>•
        */
        let pk = l.copy();
        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(((((dt_6ae31dd85a62ef5c(pk,data)||cmpr_set(pk,data,19,4,4))||assert_ascii(pk,0x0,0x20000194,0x88000000,0x8000000))||pk.isUniID(data))||pk.isNum(data))||pk.isSym(true,data)){
            /*
               111:328 virtual-76:3:1|-=>• = expression
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_9ed088d0c21de14b);
            pushFN(data,$expression);
            return 0;
        }
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*
           112:329 virtual-85:1:1|-=>•
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*27:85 unary_value=>left_hand_expression •*/
        /*VL:0*/
        pushFN(data,$expression_statements_group_023_108_goto);
        return 26;
    }
    return -1;
    /*ac215d0e3b47a515445648879849e191*/
}
function branch_ac27fc87d010b2ae(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        add_reduce(state,data,4,63);
        return 36;
    }
    /*ac27fc87d010b2aebc02e7288a157622*/
}
function branch_ac9ab9bb8c931351(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==58/*[:]*/){
        /*
           13:36 function=>modifier_list fn identifier : • type ( parameters ) { expression_statements }
           13:38 function=>modifier_list fn identifier : • type ( ) { expression_statements }
           13:39 function=>modifier_list fn identifier : • type ( parameters ) { }
           13:42 function=>modifier_list fn identifier : • type ( ) { }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_6768f12162f599d2);
        pushFN(data,$type);
        return 0;
    }
    /*ac9ab9bb8c931351b994375e6d36fc79*/
}
function branch_ad374eed04dd5afe(l,data,state,prod){
    add_reduce(state,data,2,45);
    /*-------------INDIRECT-------------------*/
    pushFN(data,branch_45b78c1aca41cc8a);
    return 26;
    /*ad374eed04dd5afe7f2927cb888b3294*/
}
function branch_ae5da528e918ff49(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(cmpr_set(l,data,143,2,2)){
        /*
           13:36 function=>modifier_list fn • identifier : type ( parameters ) { expression_statements }
           13:38 function=>modifier_list fn • identifier : type ( ) { expression_statements }
           13:39 function=>modifier_list fn • identifier : type ( parameters ) { }
           13:42 function=>modifier_list fn • identifier : type ( ) { }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_ac9ab9bb8c931351);
        pushFN(data,$identifier);
        return 0;
    }
    /*ae5da528e918ff498bfaf277dcad6e96*/
}
function branch_ae67350a4d28d5cb(l,data,state,prod){
    add_reduce(state,data,2,52);
    /*ae67350a4d28d5cbeb666eed6f46b907*/
}
function branch_aed06f5703c2fc50(l,data,state,prod){
    /*48:137 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118 identifier_token_group_079_119*/
    /*VL:0*/
    add_reduce(state,data,3,0);
    return 48;
    /*aed06f5703c2fc50ec933c7ee762a3a1*/
}
function branch_af823fa490722217(l,data,state,prod){
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        /*
           125:342 virtual-76:3:1|-=>• = expression
           126:343 virtual-85:1:1|-=>•
        */
        let pk = l.copy();
        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(((((dt_6ae31dd85a62ef5c(pk,data)||cmpr_set(pk,data,19,4,4))||assert_ascii(pk,0x0,0x20000194,0x88000000,0x8000000))||pk.isUniID(data))||pk.isNum(data))||pk.isSym(true,data)){
            /*
               125:342 virtual-76:3:1|-=>• = expression
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_30a8ac2a61770e68);
            pushFN(data,$expression);
            return 0;
        }
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*
           126:343 virtual-85:1:1|-=>•
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*27:85 unary_value=>left_hand_expression •*/
        /*VL:2*/
        pushFN(data,branch_ee044d7019e306de);
        return 27;
    }
    return -1;
    /*af823fa490722217ab9661df7e7be29a*/
}
function branch_af9fb711723f52aa(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    switch(sym_map_c889cd6dda6b71c6(l,data)){
        default:
        case 0:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            add_reduce(state,data,2,45);
            /*-------------INDIRECT-------------------*/
            return 21;
        case 1:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_c9fc0b5ae608e956);
            pushFN(data,$expression);
            return 0;
        case 2:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
            pushFN(data,branch_c9fc0b5ae608e956);
            pushFN(data,$expression);
            return 0;
    }
    /*af9fb711723f52aae65bd8f8a78dc5e9*/
}
function branch_affaae5e0c71984b(l,data,state,prod){
    add_reduce(state,data,1,86);
    return 56;
    /*affaae5e0c71984b135690b4878f9853*/
}
function branch_b09b16aad1bdc0ca(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_818d14bff9153d48);
        pushFN(data,$expression);
        return 0;
    }
    /*b09b16aad1bdc0cadf88b5a0a18acc90*/
}
function branch_b134f4a772a6e4ee(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==58/*[:]*/){
        /*
           33:108 match_expression=>match expression : • match_expression_HC_listbody3_113
           33:109 match_expression=>match expression : •
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        switch(sym_map_e18247bca4934e42(l,data)){
            default:
            case 0:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                add_reduce(state,data,3,61);
                return 33;
            case 1:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                pushFN(data,branch_7aec22af26f85298);
                pushFN(data,$match_expression_HC_listbody3_113);
                return 0;
            case 2:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_7aec22af26f85298);
                pushFN(data,$match_expression_HC_listbody3_113);
                return 0;
        }
    }
    /*b134f4a772a6e4ee47afe4856488f361*/
}
function branch_b16f5597ded685c8(l,data,state,prod){
    add_reduce(state,data,3,35);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$parameters_goto);
    return 16;
    /*b16f5597ded685c8101bd16938b63c5b*/
}
function branch_b3ae70a7497236c4(l,data,state,prod){
    pushFN(data,branch_e39790d5d793cb80);
    return 72;
    /*b3ae70a7497236c4f459420b5364de82*/
}
function branch_b5331b67398b2b54(l,data,state,prod){
    /*-------------INDIRECT-------------------*/
    /*31:95 loop_expression=>loop • loop_expression_group_254_111 expression*/
    /*VL:0*/
    add_reduce(state,data,3,49);
    return 31;
    /*b5331b67398b2b54169ce2ad67e49e7a*/
}
function branch_b81c58d52edda0e7(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        /*
           43:126 primitive_declaration=>identifier : type • primitive_declaration_group_169_116
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_ca129518982c23c4);
        pushFN(data,$primitive_declaration_group_169_116);
        return 0;
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*
           43:128 primitive_declaration=>identifier : type •
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        add_reduce(state,data,3,76);
        add_reduce(state,data,1,3);
        /*-------------INDIRECT-------------------*/
        return 20;
    }
    /*b81c58d52edda0e76b7a1a3bd966e32f*/
}
function branch_b8287790df61d451(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==59/*[;]*/){
        /*
           109:326 virtual-96:9:1|-=>( parameters ; • expression ; loop_expression_HC_listbody6_112 ) expression
           110:327 virtual-100:8:1|-=>( parameters ; • ; loop_expression_HC_listbody6_112 ) expression
           111:328 virtual-101:8:1|-=>( parameters ; • expression ; ) expression
           112:329 virtual-104:7:1|-=>( parameters ; • ; ) expression
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(l.current_byte==59/*[;]*/){
            /*
               110:327 virtual-100:8:1|-=>( parameters ; • ; loop_expression_HC_listbody6_112 ) expression
               112:329 virtual-104:7:1|-=>( parameters ; • ; ) expression
            */
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if(l.current_byte==41/*[)]*/){
                /*
                   112:329 virtual-104:7:1|-=>( parameters ; ; • ) expression
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                consume(l,data,state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                pushFN(data,branch_3205c0ded576131e);
                pushFN(data,$expression);
                return 0;
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   110:327 virtual-100:8:1|-=>( parameters ; ; • loop_expression_HC_listbody6_112 ) expression
                */
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_21d011590bad51a3);
                pushFN(data,$loop_expression_HC_listbody6_112);
                return 0;
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               109:326 virtual-96:9:1|-=>( parameters ; • expression ; loop_expression_HC_listbody6_112 ) expression
               111:328 virtual-101:8:1|-=>( parameters ; • expression ; ) expression
            */
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_d355a11855ee0854);
            pushFN(data,$expression);
            return 0;
        }
    }
    /*b8287790df61d45141e2be1a1ccc18cf*/
}
function branch_b860b664828fdbf3(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        /*
           43:126 primitive_declaration=>identifier : type • primitive_declaration_group_169_116
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_ff920a370adc3c6a);
        pushFN(data,$primitive_declaration_group_169_116);
        return 0;
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*
           43:128 primitive_declaration=>identifier : type •
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        add_reduce(state,data,3,76);
        /*-------------INDIRECT-------------------*/
        pushFN(data,branch_5421d5d86a2a00b8);
        return 18;
    }
    /*b860b664828fdbf33bc8008e9becf408*/
}
function branch_b8a7c3cf5d96bb89(l,data,state,prod){
    /*31:98 loop_expression=>loop expression •*/
    /*VL:0*/
    add_reduce(state,data,2,52);
    return 31;
    /*b8a7c3cf5d96bb8910d7585a5533f41f*/
}
function branch_b99eeae70c02602e(l,data,state,prod){
    add_reduce(state,data,6,59);
    return 31;
    /*b99eeae70c02602e495072e870c35a68*/
}
function branch_ba09f2b9da5d73e5(l,data,state,prod){
    add_reduce(state,data,5,73);
    /*-------------INDIRECT-------------------*/
    pushFN(data,branch_ee044d7019e306de);
    return 43;
    /*ba09f2b9da5d73e579f2230712d97278*/
}
function branch_ba43c8afd37cf702(l,data,state,prod){
    pushFN(data,branch_5421d5d86a2a00b8);
    return 72;
    /*ba43c8afd37cf7022c3cae9a3926ff4d*/
}
function branch_ba637a426869287c(l,data,state,prod){
    add_reduce(state,data,1,67);
    pushFN(data,$expression_goto);
    return 37;
    /*ba637a426869287c08eb958ff59b2185*/
}
function branch_bb4a0fd4c800480d(l,data,state,prod){
    add_reduce(state,data,3,65);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$expression_goto);
    return 37;
    /*bb4a0fd4c800480d31dcad2e11400547*/
}
function branch_bb584f291ea8bb60(l,data,state,prod){
    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    if(!(l.current_byte==58/*[:]*/)||l.END(data)){
        /*
           135:352 virtual-117:1:1|-=>•
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*37:117 member_expression=>identifier •*/
        /*VL:2*/
        pushFN(data,branch_e39790d5d793cb80);
        return 37;
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    } else {
        /*
           135:352 virtual-117:1:1|-=>•
           136:353 virtual-126:4:1|-=>• : type primitive_declaration_group_169_116
           137:354 virtual-128:3:1|-=>• : type
        */
        let pk = l.copy();
        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(((pk.current_byte==95/*[_]*/)||(pk.current_byte==36/*[$]*/))||pk.isUniID(data)){
            /*
               136:353 virtual-126:4:1|-=>• : type primitive_declaration_group_169_116
               137:354 virtual-128:3:1|-=>• : type
            */
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_94acace019097f67);
            pushFN(data,$type);
            return 0;
        }
    }
    return -1;
    /*bb584f291ea8bb600c563a5b5fdf0c30*/
}
function branch_bbaaf5e2ac261f99(l,data,state,prod){
    add_reduce(state,data,1,3);
    pushFN(data,$module_goto);
    return 3;
    /*bbaaf5e2ac261f999f1a18fd29356b5a*/
}
function branch_bc6ea5b413b36169(l,data,state,prod){
    /*-------------INDIRECT-------------------*/
    /*110:327 virtual-100:8:1|-=>( • parameters ; ; loop_expression_HC_listbody6_112 ) expression*/
    /*VL:1*/
    /*31:100 loop_expression=>loop • ( parameters ; ; loop_expression_HC_listbody6_112 ) expression*/
    /*VL:0*/
    add_reduce(state,data,8,54);
    return 31;
    /*bc6ea5b413b36169aaa1e2b21ce3c565*/
}
function branch_bd41394530f64266(l,data,state,prod){
    pushFN(data,$expression_statements_group_023_108_goto);
    return 18;
    /*bd41394530f6426639e277142ef64a8d*/
}
function branch_bd933351f038ae42(l,data,state,prod){
    add_reduce(state,data,3,35);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$def$defaultproductions_HC_listbody1_100_goto);
    return 74;
    /*bd933351f038ae42b8ccf4a00a9b718a*/
}
function branch_bd9cd0221b948fc4(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_463a609a91f9c965);
        pushFN(data,$expression);
        return 0;
    }
    /*bd9cd0221b948fc45c766032372251cd*/
}
function branch_bf312da1e8e7a614(l,data,state,prod){
    return 26;
    /*bf312da1e8e7a61405660afe1d95f62f*/
}
function branch_bf406d1372596829(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    switch(sym_map_439a05cca98595e4(l,data)){
        default:
        case 0:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            add_reduce(state,data,2,45);
            /*-------------INDIRECT-------------------*/
            pushFN(data,branch_45b78c1aca41cc8a);
            return 21;
        case 1:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_05fab80da325e5d3);
            pushFN(data,$expression);
            return 0;
        case 2:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
            pushFN(data,branch_05fab80da325e5d3);
            pushFN(data,$expression);
            return 0;
    }
    /*bf406d137259682964b43336abc71281*/
}
function branch_c065289f9bc15f46(l,data,state,prod){
    add_reduce(state,data,1,3);
    pushFN(data,$def$string_token_goto);
    return 99;
    /*c065289f9bc15f4631010d12b3fff3b5*/
}
function branch_c0e3727d9ff912b9(l,data,state,prod){
    pushFN(data,$expression_statements_goto);
    return 50;
    /*c0e3727d9ff912b905b2aed2c2721065*/
}
function branch_c17cd9799d850159(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,6,15);
        /*-------------INDIRECT-------------------*/
        pushFN(data,$class_group_016_104_goto);
        return 9;
    }
    /*c17cd9799d8501592be7d94952220213*/
}
function branch_c1d1bde8a1ade4c6(l,data,state,prod){
    add_reduce(state,data,1,3);
    pushFN(data,$def$hex_token_HC_listbody1_105_goto);
    return 88;
    /*c1d1bde8a1ade4c6c059841de06484c1*/
}
function branch_c2432a04915ec0d0(l,data,state,prod){
    add_reduce(state,data,2,79);
    return 55;
    /*c2432a04915ec0d08a51e4c48a9ddc09*/
}
function branch_c24f274588f75184(l,data,state,prod){
    add_reduce(state,data,3,42);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$expression_goto);
    return 21;
    /*c24f274588f75184646dccb3b6fa3c8c*/
}
function branch_c31a3bda3a58be29(l,data,state,prod){
    pushFN(data,branch_5421d5d86a2a00b8);
    return 44;
    /*c31a3bda3a58be294208a85126c98c6f*/
}
function branch_c3acb534cc34eb19(l,data,state,prod){
    skip_db1786a8af54d666(l/*[ 71 ]*/,data,true);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/){
        /*
           108:325 virtual-137:3:1|-=>identifier_token_HC_listbody1_118 • identifier_token_group_079_119
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_aed06f5703c2fc50);
        pushFN(data,$identifier_token_group_079_119);
        return 0;
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*
           109:326 virtual-139:2:1|-=>identifier_token_HC_listbody1_118 •
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*48:139 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118*/
        /*VL:0*/
        add_reduce(state,data,2,0);
        return 48;
    }
    /*c3acb534cc34eb19947a878259f1735e*/
}
function branch_c47e489f27fa73a8(l,data,state,prod){
    skip_db1786a8af54d666(l/*[ 71 ]*/,data,true);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/){
        /*
           48:137 identifier_token=>identifier_token_group_074_117 identifier_token_HC_listbody1_118 • identifier_token_group_079_119
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_52c337927313e58e);
        pushFN(data,$identifier_token_group_079_119);
        return 0;
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*
           48:139 identifier_token=>identifier_token_group_074_117 identifier_token_HC_listbody1_118 •
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        add_reduce(state,data,2,0);
        return 48;
    }
    /*c47e489f27fa73a8a3ffdc5c378966c5*/
}
function branch_c4beae2f461d992b(l,data,state,prod){
    add_reduce(state,data,8,53);
    return 31;
    /*c4beae2f461d992b0a628569679bf0cd*/
}
function branch_c595dca81d549584(l,data,state,prod){
    add_reduce(state,data,2,2);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$module_HC_listbody1_101_goto);
    return 2;
    /*c595dca81d5495849012ff3620ac747b*/
}
function branch_c7782fe38088e5d9(l,data,state,prod){
    add_reduce(state,data,1,3);
    pushFN(data,$def$octal_token_HC_listbody1_110_goto);
    return 95;
    /*c7782fe38088e5d9a3974c09963645ae*/
}
function branch_c7b759beb1f3603a(l,data,state,prod){
    add_reduce(state,data,3,65);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$unary_value_goto);
    return 37;
    /*c7b759beb1f3603a92f670ed2f3ac5ad*/
}
function branch_c7d6c0b0a737d7c8(l,data,state,prod){
    add_reduce(state,data,2,2);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$def$string_token_HC_listbody3_111_goto);
    return 98;
    /*c7d6c0b0a737d7c8134ad20b69a1507f*/
}
function branch_c96fc0b01a0bb86b(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==41/*[)]*/){
        /*
           14:44 function_expression=>modifier_list fn : type ( parameters ) • { expression_statements }
           14:47 function_expression=>modifier_list fn : type ( parameters ) • { }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if(l.current_byte==123/*[{]*/){
            /*
               14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }
               14:47 function_expression=>modifier_list fn : type ( parameters ) { • }
            */
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if(l.current_byte==125/*[}]*/){
                /*
                   14:47 function_expression=>modifier_list fn : type ( parameters ) { • }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                consume(l,data,state);
                add_reduce(state,data,9,30);
                /*-------------INDIRECT-------------------*/
                pushFN(data,branch_e39790d5d793cb80);
                return 26;
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_91069d246f9ac9b9);
                pushFN(data,$expression_statements);
                return 0;
            }
        }
    }
    /*c96fc0b01a0bb86b1c008cdc19f9a3bc*/
}
function branch_c9fc0b5ae608e956(l,data,state,prod){
    add_reduce(state,data,3,46);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$expression_goto);
    return 21;
    /*c9fc0b5ae608e956098e55e7c8767b1e*/
}
function branch_ca129518982c23c4(l,data,state,prod){
    add_reduce(state,data,4,74);
    add_reduce(state,data,1,3);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$expression_statements_goto);
    return 20;
    /*ca129518982c23c41783a94cd344bef7*/
}
function branch_ca3a5796d9b8ad4d(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    pushFN(data,branch_2fa9779782f73a91);
    pushFN(data,$expression);
    return 0;
    /*ca3a5796d9b8ad4dbb5328d162c9dc19*/
}
function branch_ca5d812a50c21a37(l,data,state,prod){
    add_reduce(state,data,4,74);
    /*-------------INDIRECT-------------------*/
    pushFN(data,branch_ee044d7019e306de);
    return 43;
    /*ca5d812a50c21a37ac8740b8130a353b*/
}
function branch_cabfca63de10cd14(l,data,state,prod){
    add_reduce(state,data,1,3);
    pushFN(data,$parameters_HC_listbody10_106_goto);
    return 15;
    /*cabfca63de10cd142417053dfa4a00f1*/
}
function branch_cad3222afff33c8d(l,data,state,prod){
    add_reduce(state,data,1,3);
    pushFN(data,$call_expression_HC_listbody2_114_goto);
    return 35;
    /*cad3222afff33c8da03c45714c17f596*/
}
function branch_cc3439f4db3f3190(l,data,state,prod){
    return 76;
    /*cc3439f4db3f3190bf2ef7bd336cf9b7*/
}
function branch_cc9e8eab54dacbec(l,data,state,prod){
    add_reduce(state,data,1,3);
    pushFN(data,$namespace_HC_listbody3_102_goto);
    return 6;
    /*cc9e8eab54dacbec6317f4e9e1dffb6f*/
}
function branch_cceb33b8a550bfef(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==123/*[{]*/){
        /*
           12:32 struct=>modifier_list str identifier { • parameters }
           12:34 struct=>modifier_list str identifier { • }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.current_byte==125/*[}]*/){
            /*
               12:34 struct=>modifier_list str identifier { • }
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            consume(l,data,state);
            add_reduce(state,data,5,17);
            /*-------------INDIRECT-------------------*/
            pushFN(data,$statements_goto);
            return 4;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               12:32 struct=>modifier_list str identifier { • parameters }
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_2e70fd316ce2baa3);
            pushFN(data,$parameters);
            return 0;
        }
    }
    /*cceb33b8a550bfefe904ff24a4c04b3a*/
}
function branch_cd032d48a8135d9c(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    switch(sym_map_595f96e39304d306(l,data)){
        default:
        case 0:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            add_reduce(state,data,2,45);
            /*-------------INDIRECT-------------------*/
            pushFN(data,branch_ee044d7019e306de);
            return 21;
        case 1:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_4fcbae1b50b020a4);
            pushFN(data,$expression);
            return 0;
        case 2:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
            pushFN(data,branch_4fcbae1b50b020a4);
            pushFN(data,$expression);
            return 0;
    }
    /*cd032d48a8135d9cea5ebfb0b8763440*/
}
function branch_cd0797f2f8c9681c(l,data,state,prod){
    /*-------------INDIRECT-------------------*/
    /*31:95 loop_expression=>loop loop_expression_group_254_111 expression •*/
    /*VL:0*/
    add_reduce(state,data,3,49);
    return 31;
    /*cd0797f2f8c9681ca67d4537b76de508*/
}
function branch_cdc32f1f47f4669f(l,data,state,prod){
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(((((((((((((cmpr_set(l,data,142,2,2)||cmpr_set(l,data,66,5,5))||dt_bcea2102060eab13(l,data))||dt_6ae31dd85a62ef5c(l,data))||cmpr_set(l,data,94,4,4))||cmpr_set(l,data,34,4,4))||cmpr_set(l,data,19,4,4))||cmpr_set(l,data,71,5,5))||cmpr_set(l,data,76,6,6))||cmpr_set(l,data,38,8,8))||cmpr_set(l,data,62,4,4))||assert_ascii(l,0x0,0x20000184,0x0,0x8000000))||l.isNum(data))||l.isSym(true,data)){
        /*
           129:346 virtual-92:3:1|-=>• expression )
           130:347 virtual-89:3:1|-=>• expression_statements_group_023_108 )
        */
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        switch(sym_map_f296a22137236439(l,data)){
            case 0:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_d171640e9f40e212);
                pushFN(data,$template);
                return 0;
            case 1:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_04515de74b4995c1);
                pushFN(data,$unary_value);
                return 0;
            case 2:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_30fc2faf140166c8);
                pushFN(data,$expression);
                return 0;
            case 3:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_04515de74b4995c1);
                pushFN(data,$value);
                return 0;
            case 4:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_472123bab218a576);
                pushFN(data,$num);
                return 0;
            case 5:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_2ed037f2f98ad90e);
                pushFN(data,$operator);
                return 0;
            case 6:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_30fc2faf140166c8);
                pushFN(data,$if_expression);
                return 0;
            case 7:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_30fc2faf140166c8);
                pushFN(data,$match_expression);
                return 0;
            case 8:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_04515de74b4995c1);
                pushFN(data,$function_expression);
                return 0;
            case 9:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_30fc2faf140166c8);
                pushFN(data,$break_expression);
                return 0;
            case 10:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_30fc2faf140166c8);
                pushFN(data,$return_expression);
                return 0;
            case 11:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                pushFN(data,branch_30fc2faf140166c8);
                pushFN(data,$continue_expression);
                return 0;
            case 12:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_30fc2faf140166c8);
                pushFN(data,$loop_expression);
                return 0;
            case 13:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                pushFN(data,branch_04515de74b4995c1);
                pushFN(data,$value);
                return 0;
            default:
                break;
        }
    }
    return -1;
    /*cdc32f1f47f4669f0e41ce63e8689a93*/
}
function branch_cdd47e4e9e9b86fc(l,data,state,prod){
    add_reduce(state,data,2,45);
    /*-------------INDIRECT-------------------*/
    pushFN(data,branch_e39790d5d793cb80);
    return 26;
    /*cdd47e4e9e9b86fca5e5aa1db4e7130c*/
}
function branch_ce10ae3c0bee5fe8(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==41/*[)]*/){
        /*
           14:44 function_expression=>modifier_list fn : type ( parameters ) • { expression_statements }
           14:47 function_expression=>modifier_list fn : type ( parameters ) • { }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if(l.current_byte==123/*[{]*/){
            /*
               14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }
               14:47 function_expression=>modifier_list fn : type ( parameters ) { • }
            */
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if(l.current_byte==125/*[}]*/){
                /*
                   14:47 function_expression=>modifier_list fn : type ( parameters ) { • }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                consume(l,data,state);
                add_reduce(state,data,9,30);
                /*-------------INDIRECT-------------------*/
                pushFN(data,$expression_statements_goto);
                return 26;
            }
        }
    }
    /*ce10ae3c0bee5fe8bec18a3ca5fbe47b*/
}
function branch_cf1acfcb741737a6(l,data,state,prod){
    skip_a294e41529bc9275(l/*[ nl ][ 71 ]*/,data,true);
    pushFN(data,branch_a2ade393e0ff2119);
    pushFN(data,$def$octal_token_HC_listbody1_110);
    return 0;
    /*cf1acfcb741737a67eaa0d9ba7120e11*/
}
function branch_cf2510584ec88340(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==123/*[{]*/){
        /*
           11:24 class=>modifier_list cls identifier class_group_113_103 { • class_HC_listbody1_105 }
           11:27 class=>modifier_list cls identifier class_group_113_103 { • }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.current_byte==125/*[}]*/){
            /*
               11:27 class=>modifier_list cls identifier class_group_113_103 { • }
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            consume(l,data,state);
            add_reduce(state,data,6,10);
            /*-------------INDIRECT-------------------*/
            pushFN(data,$statements_goto);
            return 4;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               11:24 class=>modifier_list cls identifier class_group_113_103 { • class_HC_listbody1_105 }
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_a443d094a8c7e898);
            pushFN(data,$class_HC_listbody1_105);
            return 0;
        }
    }
    /*cf2510584ec8834000e751f38a0c7f78*/
}
function branch_d06a5f8a79dc9f69(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==93/*[]]*/)&&consume(l,data,state)){
        add_reduce(state,data,4,66);
        /*-------------INDIRECT-------------------*/
        pushFN(data,$expression_statements_goto);
        return 37;
    }
    /*d06a5f8a79dc9f6941e2531e71335d32*/
}
function branch_d0f82b198075315f(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==41/*[)]*/){
        /*
           13:36 function=>modifier_list fn identifier : type ( parameters ) • { expression_statements }
           13:39 function=>modifier_list fn identifier : type ( parameters ) • { }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if(l.current_byte==123/*[{]*/){
            /*
               13:36 function=>modifier_list fn identifier : type ( parameters ) { • expression_statements }
               13:39 function=>modifier_list fn identifier : type ( parameters ) { • }
            */
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if(l.current_byte==125/*[}]*/){
                /*
                   13:39 function=>modifier_list fn identifier : type ( parameters ) { • }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                consume(l,data,state);
                add_reduce(state,data,10,22);
                /*-------------INDIRECT-------------------*/
                pushFN(data,$class_group_016_104_goto);
                return 9;
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   13:36 function=>modifier_list fn identifier : type ( parameters ) { • expression_statements }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_2ee20e42b6f5801d);
                pushFN(data,$expression_statements);
                return 0;
            }
        }
    }
    /*d0f82b198075315fa991432ad4138a6d*/
}
function branch_d171640e9f40e212(l,data,state,prod){
    pushFN(data,branch_45b78c1aca41cc8a);
    return 72;
    /*d171640e9f40e2126cd203ea72efe0d6*/
}
function branch_d21d3a4193eb251c(l,data,state,prod){
    pushFN(data,branch_ee044d7019e306de);
    return 44;
    /*d21d3a4193eb251c98f95bb772b38274*/
}
function branch_d2b52ff9b7bc04b7(l,data,state,prod){
    pushFN(data,branch_e39790d5d793cb80);
    return 44;
    /*d2b52ff9b7bc04b7f37f2966a20d73f3*/
}
function branch_d355a11855ee0854(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==59/*[;]*/){
        /*
           109:326 virtual-96:9:1|-=>( parameters ; expression ; • loop_expression_HC_listbody6_112 ) expression
           111:328 virtual-101:8:1|-=>( parameters ; expression ; • ) expression
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.current_byte==41/*[)]*/){
            /*
               111:328 virtual-101:8:1|-=>( parameters ; expression ; • ) expression
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_3205c0ded576131e);
            pushFN(data,$expression);
            return 0;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               109:326 virtual-96:9:1|-=>( parameters ; expression ; • loop_expression_HC_listbody6_112 ) expression
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_21d011590bad51a3);
            pushFN(data,$loop_expression_HC_listbody6_112);
            return 0;
        }
    }
    /*d355a11855ee08546d110c2802507c4f*/
}
function branch_d4985b5a2253e444(l,data,state,prod){
    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    if(!(l.current_byte==58/*[:]*/)||l.END(data)){
        /*
           146:363 virtual-117:1:1|-=>•
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*37:117 member_expression=>identifier •*/
        /*VL:2*/
        pushFN(data,branch_5421d5d86a2a00b8);
        return 37;
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    } else {
        /*
           146:363 virtual-117:1:1|-=>•
           147:364 virtual-126:4:1|-=>• : type primitive_declaration_group_169_116
           148:365 virtual-128:3:1|-=>• : type
        */
        let pk = l.copy();
        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(((pk.current_byte==95/*[_]*/)||(pk.current_byte==36/*[$]*/))||pk.isUniID(data)){
            /*
               147:364 virtual-126:4:1|-=>• : type primitive_declaration_group_169_116
               148:365 virtual-128:3:1|-=>• : type
            */
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_2cd334718ac51419);
            pushFN(data,$type);
            return 0;
        }
    }
    return -1;
    /*d4985b5a2253e444b61fe021cdb9e9a3*/
}
function branch_d62650cd6011d320(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==40/*[(]*/){
        /*
           14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
           14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
           14:47 function_expression=>modifier_list fn : type ( • parameters ) { }
           14:50 function_expression=>modifier_list fn : type ( • ) { }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(l.current_byte==41/*[)]*/){
            /*
               14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
               14:50 function_expression=>modifier_list fn : type ( • ) { }
            */
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if(l.current_byte==123/*[{]*/){
                /*
                   14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }
                   14:50 function_expression=>modifier_list fn : type ( ) { • }
                */
                consume(l,data,state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if(l.current_byte==125/*[}]*/){
                    /*
                       14:50 function_expression=>modifier_list fn : type ( ) { • }
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    consume(l,data,state);
                    add_reduce(state,data,8,33);
                    /*-------------INDIRECT-------------------*/
                    pushFN(data,$expression_statements_goto);
                    return 26;
                }
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
               14:47 function_expression=>modifier_list fn : type ( • parameters ) { }
            */
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_ce10ae3c0bee5fe8);
            pushFN(data,$parameters);
            return 0;
        }
    }
    /*d62650cd6011d32074a8421813ed8522*/
}
function branch_d62b5b8cbd7267e5(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,11,19);
        return 13;
    }
    /*d62b5b8cbd7267e5b51595af2b308e52*/
}
function branch_d6adce891265bf33(l,data,state,prod){
    add_reduce(state,data,1,3);
    pushFN(data,$identifier_token_HC_listbody1_118_goto);
    return 46;
    /*d6adce891265bf3355c131f97fff2a99*/
}
function branch_d7ea96fd3976e324(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==93/*[]]*/)&&consume(l,data,state)){
        add_reduce(state,data,4,66);
        /*-------------INDIRECT-------------------*/
        pushFN(data,branch_5421d5d86a2a00b8);
        return 37;
    }
    /*d7ea96fd3976e3244e8fc0e5069bd6b7*/
}
function branch_da16dbec8b45d61a(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    if(!(l.current_byte==61/*[=]*/)||l.END(data)){
        /*
           109:326 virtual-128:3:1|-=>: type •
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*43:128 primitive_declaration=>identifier • : type*/
        /*VL:0*/
        add_reduce(state,data,3,76);
        add_reduce(state,data,1,3);
        pushFN(data,$expression_statements_goto);
        return 20;
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else {
        /*
           108:325 virtual-126:4:1|-=>: type • primitive_declaration_group_169_116
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_2a06e3a7cc649a30);
        pushFN(data,$primitive_declaration_group_169_116);
        return 0;
    }
    /*da16dbec8b45d61a24b9ccd429b85910*/
}
function branch_da4737880b1bd090(l,data,state,prod){
    add_reduce(state,data,1,3);
    pushFN(data,$def$binary_token_HC_listbody1_107_goto);
    return 91;
    /*da4737880b1bd090a143da7229a7c174*/
}
function branch_dc001ff53e1cedd2(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(cmpr_set(l,data,46,3,3)){
        /*
           12:32 struct=>modifier_list str • identifier { parameters }
           12:34 struct=>modifier_list str • identifier { }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_a80aeda0d4128b25);
        pushFN(data,$identifier);
        return 0;
    }
    /*dc001ff53e1cedd211094b578d9423ee*/
}
function branch_dc0325cf695ea04c(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,9,23);
        return 13;
    }
    /*dc0325cf695ea04c6e790ca377236176*/
}
function branch_dc6294aaa5e84999(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==93/*[]]*/)&&consume(l,data,state)){
        add_reduce(state,data,4,66);
        /*-------------INDIRECT-------------------*/
        pushFN(data,$unary_value_goto);
        return 37;
    }
    /*dc6294aaa5e849999a0893713729e424*/
}
function branch_dc83f428871b16c3(l,data,state,prod){
    add_reduce(state,data,1,3);
    pushFN(data,$modifier_list_HC_listbody1_120_goto);
    return 49;
    /*dc83f428871b16c3ca4861f792af39bd*/
}
function branch_dd33ff05dfe6a2e3(l,data,state,prod){
    add_reduce(state,data,3,46);
    add_reduce(state,data,1,3);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$expression_statements_goto);
    return 20;
    /*dd33ff05dfe6a2e35379594d46fd6b3f*/
}
function branch_dd48f7fc4430872e(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(cmpr_set(l,data,143,2,2)){
        /*
           14:44 function_expression=>modifier_list fn • : type ( parameters ) { expression_statements }
           14:46 function_expression=>modifier_list fn • : type ( ) { expression_statements }
           14:47 function_expression=>modifier_list fn • : type ( parameters ) { }
           14:50 function_expression=>modifier_list fn • : type ( ) { }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if(l.current_byte==58/*[:]*/){
            /*
               14:44 function_expression=>modifier_list fn : • type ( parameters ) { expression_statements }
               14:46 function_expression=>modifier_list fn : • type ( ) { expression_statements }
               14:47 function_expression=>modifier_list fn : • type ( parameters ) { }
               14:50 function_expression=>modifier_list fn : • type ( ) { }
            */
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_9edb7834ab882959);
            pushFN(data,$type);
            return 0;
        }
    }
    /*dd48f7fc4430872eacedb4b3b8762879*/
}
function branch_dd5c1e4a566fe3e5(l,data,state,prod){
    add_reduce(state,data,1,3);
    pushFN(data,$expression_statements_goto);
    return 20;
    /*dd5c1e4a566fe3e5592b2f39aeb7de67*/
}
function branch_e065d9119934ceb8(l,data,state,prod){
    add_reduce(state,data,2,0);
    return 23;
    /*e065d9119934ceb8f451e9563fdee717*/
}
function branch_e093aff9b89513a1(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    if(!(l.current_byte==61/*[=]*/)||l.END(data)){
        /*
           110:327 virtual-128:3:1|-=>: type •
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*43:128 primitive_declaration=>identifier • : type*/
        /*VL:0*/
        add_reduce(state,data,3,76);
        pushFN(data,$expression_statements_group_023_108_goto);
        return 18;
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else {
        /*
           109:326 virtual-126:4:1|-=>: type • primitive_declaration_group_169_116
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_44b59b9f3ae48ad4);
        pushFN(data,$primitive_declaration_group_169_116);
        return 0;
    }
    /*e093aff9b89513a13cb1955f69faf23e*/
}
function branch_e134459c2d0235d8(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==39/*[']*/)&&consume(l,data,state)){
        add_reduce(state,data,3,36);
        return 97;
    }
    /*e134459c2d0235d8872fbe18c16ef673*/
}
function branch_e160362a74d4d7ef(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        /*
           43:125 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_169_116
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_326c350dfceb65d4);
        pushFN(data,$primitive_declaration_group_169_116);
        return 0;
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*
           43:127 primitive_declaration=>modifier_list identifier : type •
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        add_reduce(state,data,4,75);
        /*-------------INDIRECT-------------------*/
        pushFN(data,branch_e39790d5d793cb80);
        return 18;
    }
    /*e160362a74d4d7ef1000ac58dbe50df7*/
}
function branch_e187025a283f9525(l,data,state,prod){
    add_reduce(state,data,2,0);
    return 84;
    /*e187025a283f95257620ce1cfca131a1*/
}
function branch_e2998f7b425d8def(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==41/*[)]*/){
        /*
           14:44 function_expression=>modifier_list fn : type ( parameters ) • { expression_statements }
           14:47 function_expression=>modifier_list fn : type ( parameters ) • { }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if(l.current_byte==123/*[{]*/){
            /*
               14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }
               14:47 function_expression=>modifier_list fn : type ( parameters ) { • }
            */
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if(l.current_byte==125/*[}]*/){
                /*
                   14:47 function_expression=>modifier_list fn : type ( parameters ) { • }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                consume(l,data,state);
                add_reduce(state,data,9,30);
                /*-------------INDIRECT-------------------*/
                pushFN(data,$expression_statements_group_023_108_goto);
                return 26;
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_8c57d1885b959d2a);
                pushFN(data,$expression_statements);
                return 0;
            }
        }
    }
    /*e2998f7b425d8deff7485141e4bc41c7*/
}
function branch_e2bf1a2fbc8c4ac7(l,data,state,prod){
    add_reduce(state,data,3,91);
    /*e2bf1a2fbc8c4ac77454db4c06824a87*/
}
function branch_e39790d5d793cb80(l,data,state,prod){
    while(1){
        /*[37] [18] [133] [18] [26] [26] [18] [21] [21] [26] [28] [37] [26] [134] [21] [26]*/
        switch(prod){
            case 18:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                if(l.current_byte==41/*[)]*/){
                    /*
                       134:351 virtual-89:3:1|-=>expression_statements_group_023_108 ) •
                    */
                    consume(l,data,state);
                    consume(l,data,state);
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                    /*27:89 unary_value=>( • expression_statements_group_023_108 )*/
                    /*VL:1*/
                    pushFN(data,branch_3a4c5635f3d27ac2);
                    return 27;
                }
                break;
            case 21:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(l.current_byte==41/*[)]*/){
                    /*
                       133:350 virtual-92:3:1|-=>expression • )
                       18:58 expression_statements_group_023_108=>expression •
                    */
                    let pk = l.copy();
                    skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
                    switch(sym_map_b46ea86743f23b38(pk,data)){
                        case 0:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                            consume(l,data,state);
                            /*29:92 loop_expression_group_254_111=>( • expression )*/
                            /*VL:1*/
                            pushFN(data,branch_3a4c5635f3d27ac2);
                            return 29;
                        default:
                        case 1:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                            prod = 18;
                            continue;;
                        case 2:
                            /*-------------VPROD-------------------------*/
                            pushFN(data,branch_f701e17b03aefb8f);
                            return 0;
                    }
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                } else {
                    /*
                       18:58 expression_statements_group_023_108=>expression •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    prod = 18;
                    continue;;
                }
                break;
            case 26:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                if(!((l.current_byte==61/*[=]*/)||l.isSym(true,data))||(cmpr_set(l,data,19,4,4)||assert_ascii(l,0x0,0xc001210,0xa8000000,0x20000000))){
                    /*
                       25:82 binary_expression=>unary_expression •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    prod = 21;
                    continue;;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if((l.current_byte==61/*[=]*/)||l.isSym(true,data)){
                    /*
                       25:80 binary_expression=>unary_expression • operator
                       25:81 binary_expression=>unary_expression • operator expression
                    */
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                    pushFN(data,branch_5e427256d793b21f);
                    pushFN(data,$operator);
                    return 0;
                }
                break;
            case 28:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(l.current_byte==61/*[=]*/){
                    /*
                       22:76 assignment_expression=>left_hand_expression • = expression
                       27:85 unary_value=>left_hand_expression •
                    */
                    let pk = l.copy();
                    skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    if((((dt_6ae31dd85a62ef5c(pk,data)||cmpr_set(pk,data,19,4,4))||assert_ascii(pk,0x0,0x20000194,0x88000000,0x8000000))||pk.isUniID(data))||pk.isNum(data)){
                        /*
                           22:76 assignment_expression=>left_hand_expression • = expression
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        pushFN(data,branch_51b6062c81564560);
                        pushFN(data,$expression);
                        return 0;
                        /*⤋⤋⤋ peek-unresolved ⤋⤋⤋*/
                    } else {
                        /*
                           22:76 assignment_expression=>left_hand_expression • = expression
                           27:85 unary_value=>left_hand_expression •
                        */
                        /*-------------VPROD-------------------------*/
                        pushFN(data,branch_9e0195d83997353c);
                        return 0;
                    }
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                } else {
                    /*
                       27:85 unary_value=>left_hand_expression •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    prod = 26;
                    continue;;
                }
                break;
            case 37:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(l.current_byte==91/*[[]*/){
                    /*
                       28:91 left_hand_expression=>member_expression •
                       37:116 member_expression=>member_expression • [ expression ]
                    */
                    let pk = l.copy();
                    skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    if(!(((((dt_6ae31dd85a62ef5c(pk,data)||cmpr_set(pk,data,19,4,4))||assert_ascii(pk,0x0,0x20000194,0x88000000,0x8000000))||pk.isUniID(data))||pk.isNum(data))||pk.isSym(true,data))||(((dt_a0570d6d5c8952c6(pk,data)||cmpr_set(pk,data,56,6,6))||cmpr_set(pk,data,116,3,3))||cmpr_set(pk,data,115,4,4))){
                        /*
                           28:91 left_hand_expression=>member_expression •
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        prod = 28;
                        continue;;
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    } else if(((((((((((((cmpr_set(pk,data,142,2,2)||cmpr_set(pk,data,66,5,5))||dt_bcea2102060eab13(pk,data))||dt_6ae31dd85a62ef5c(pk,data))||cmpr_set(pk,data,94,4,4))||cmpr_set(pk,data,34,4,4))||cmpr_set(pk,data,19,4,4))||cmpr_set(pk,data,71,5,5))||cmpr_set(pk,data,76,6,6))||cmpr_set(pk,data,38,8,8))||cmpr_set(pk,data,62,4,4))||assert_ascii(pk,0x0,0x20000194,0x88000000,0x8000000))||pk.isNum(data))||pk.isSym(true,data)){
                        /*
                           37:116 member_expression=>member_expression • [ expression ]
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        pushFN(data,branch_6585176de4ac1689);
                        pushFN(data,$expression);
                        return 0;
                        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                    } else {
                        /*
                           37:116 member_expression=>member_expression • [ expression ]
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        pushFN(data,branch_6585176de4ac1689);
                        pushFN(data,$expression);
                        return 0;
                    }
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                } else if(l.current_byte==46/*[.]*/){
                    /*
                       37:115 member_expression=>member_expression • . identifier
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    consume(l,data,state);
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                    pushFN(data,branch_8c334c504ba4dbdf);
                    pushFN(data,$identifier);
                    return 0;
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                } else if(l.current_byte==40/*[(]*/){
                    /*
                       36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                       36:114 call_expression=>member_expression • ( )
                    */
                    let pk = l.copy();
                    skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    if(pk.current_byte==41/*[)]*/){
                        /*
                           36:114 call_expression=>member_expression • ( )
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
                            add_reduce(state,data,3,64);
                            pushFN(data,branch_e39790d5d793cb80);
                            return 26;
                        }
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    } else {
                        /*
                           36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        pushFN(data,branch_ee5542eb378ae21b);
                        pushFN(data,$call_expression_HC_listbody2_114);
                        return 0;
                    }
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                } else {
                    /*
                       28:91 left_hand_expression=>member_expression •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    prod = 28;
                    continue;;
                }
                break;
            case 44:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(l.current_byte==58/*[:]*/){
                    /*
                       37:117 member_expression=>identifier •
                       43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                       43:128 primitive_declaration=>identifier • : type
                    */
                    let pk = l.copy();
                    skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
                    switch(sym_map_c9c12240e0caee46(pk,data)){
                        case 0:
                            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                            consume(l,data,state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                            pushFN(data,branch_fbaffdd99f7cd390);
                            pushFN(data,$type);
                            return 0;
                        default:
                        case 1:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                            add_reduce(state,data,1,67);
                            prod = 37;
                            continue;;
                        case 2:
                            /*-------------VPROD-------------------------*/
                            pushFN(data,branch_bb584f291ea8bb60);
                            return 0;
                    }
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                } else {
                    /*
                       37:117 member_expression=>identifier •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    add_reduce(state,data,1,67);
                    prod = 37;
                    continue;;
                }
                break;
            case 50:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(cmpr_set(l,data,143,2,2)){
                    /*
                       14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
                       14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
                       14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
                       14:50 function_expression=>modifier_list • fn : type ( ) { }
                    */
                    /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                    consume(l,data,state);
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                    if(l.current_byte==58/*[:]*/){
                        /*
                           14:44 function_expression=>modifier_list fn : • type ( parameters ) { expression_statements }
                           14:46 function_expression=>modifier_list fn : • type ( ) { expression_statements }
                           14:47 function_expression=>modifier_list fn : • type ( parameters ) { }
                           14:50 function_expression=>modifier_list fn : • type ( ) { }
                        */
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        pushFN(data,branch_73fe87daeebb95ac);
                        pushFN(data,$type);
                        return 0;
                    }
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
                    /*
                       43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
                       43:127 primitive_declaration=>modifier_list • identifier : type
                    */
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                    pushFN(data,branch_78715fd408bc8129);
                    pushFN(data,$identifier);
                    return 0;
                }
                break;
            case 65:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                if((((((((tk_896177e00f155ef3(l,data)||tk_b838139d0d011665(l,data))||tk_f70d460017f6375f(l,data))||dt_bcea2102060eab13(l,data))||cmpr_set(l,data,94,4,4))||cmpr_set(l,data,34,4,4))||cmpr_set(l,data,19,4,4))||(l.current_byte==91/*[[]*/))||(l.current_byte==40/*[(]*/)){
                    /*
                       26:83 unary_expression=>operator • unary_value
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                    pushFN(data,branch_cdd47e4e9e9b86fc);
                    pushFN(data,$unary_value);
                    return 0;
                }
                break;
            case 72:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(l.current_byte==41/*[)]*/){
                    /*
                       21:74 expression=>template •
                       56:168 value=>template •
                    */
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    {
                        /*
                           21:74 expression=>template •
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        add_reduce(state,data,1,40);
                        prod = 21;
                        continue;;
                    }
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                } else {
                    /*
                       56:168 value=>template •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    add_reduce(state,data,1,86);
                    prod = 26;
                    continue;;
                }
                break;
        }
        break;
    }
    /*e39790d5d793cb802ecc9cbba68aa97c*/
}
function branch_e3d260324303a784(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(l.isNum(data)){
        /*
           83:248 def$scientific_token_group_228_102=>def$scientific_token_group_027_101 • θnum
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        consume(l,data,state);
        add_reduce(state,data,2,0);
        return 83;
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==45/*[-]*/){
        /*
           83:247 def$scientific_token_group_228_102=>def$scientific_token_group_027_101 • - θnum
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        if(l.isNum(data)&&consume(l,data,state)){
            add_reduce(state,data,3,0);
            return 83;
        }
    }
    /*e3d260324303a784f197363548288aec*/
}
function branch_e56bbc7571cdf1e6(l,data,state,prod){
    add_reduce(state,data,1,3);
    pushFN(data,$loop_expression_HC_listbody6_112_goto);
    return 30;
    /*e56bbc7571cdf1e6a198a438a58ece8a*/
}
function branch_e6735c67a528007e(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,9,29);
        /*-------------INDIRECT-------------------*/
        pushFN(data,branch_5421d5d86a2a00b8);
        return 26;
    }
    /*e6735c67a528007e6b004fee1053d01b*/
}
function branch_e6b0a378ae4ddea9(l,data,state,prod){
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        /*
           151:368 virtual-76:3:1|-=>• = expression
           152:369 virtual-85:1:1|-=>•
        */
        let pk = l.copy();
        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(((((dt_6ae31dd85a62ef5c(pk,data)||cmpr_set(pk,data,19,4,4))||assert_ascii(pk,0x0,0x20000194,0x88000000,0x8000000))||pk.isUniID(data))||pk.isNum(data))||pk.isSym(true,data)){
            /*
               151:368 virtual-76:3:1|-=>• = expression
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_30a8ac2a61770e68);
            pushFN(data,$expression);
            return 0;
        }
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*
           152:369 virtual-85:1:1|-=>•
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*27:85 unary_value=>left_hand_expression •*/
        /*VL:2*/
        pushFN(data,branch_5421d5d86a2a00b8);
        return 27;
    }
    return -1;
    /*e6b0a378ae4ddea937d9ee1675773e3f*/
}
function branch_e6ca468c39009342(l,data,state,prod){
    return 1;
    /*e6ca468c39009342aa556361b9a54b1c*/
}
function branch_e85d01fb275ffeb1(l,data,state,prod){
    pushFN(data,branch_e39790d5d793cb80);
    return 50;
    /*e85d01fb275ffeb10e34a117de363fb3*/
}
function branch_e86edee18105034f(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        /*
           43:125 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_169_116
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_66e71b93e033352b);
        pushFN(data,$primitive_declaration_group_169_116);
        return 0;
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*
           43:127 primitive_declaration=>modifier_list identifier : type •
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        add_reduce(state,data,4,75);
        /*-------------INDIRECT-------------------*/
        return 4;
    }
    /*e86edee18105034f025f58f38b9b77b8*/
}
function branch_e890ce566b605dc3(l,data,state,prod){
    add_reduce(state,data,2,2);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$def$string_token_goto);
    return 99;
    /*e890ce566b605dc3241379be8f368518*/
}
function branch_e8b252a4f58d33c8(l,data,state,prod){
    add_reduce(state,data,2,2);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$def$binary_token_HC_listbody1_107_goto);
    return 91;
    /*e8b252a4f58d33c86dd33c171efa2967*/
}
function branch_e8d67fae4d7d2b82(l,data,state,prod){
    /*-------------INDIRECT-------------------*/
    /*113:330 virtual-97:7:1|-=>( • primitive_declaration in expression ) expression*/
    /*VL:1*/
    /*31:97 loop_expression=>loop • ( primitive_declaration in expression ) expression*/
    /*VL:0*/
    add_reduce(state,data,7,51);
    return 31;
    /*e8d67fae4d7d2b82bbe3c06a8b99af9e*/
}
function branch_e9b913e5644de2ed(l,data,state,prod){
    add_reduce(state,data,3,0);
    return 71;
    /*e9b913e5644de2ed60831b41ebdb52e3*/
}
function branch_ea1fb4b6c37c97a3(l,data,state,prod){
    skip_db1786a8af54d666(l/*[ 71 ]*/,data,true);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/){
        /*
           110:327 virtual-137:3:1|-=>identifier_token_HC_listbody1_118 • identifier_token_group_079_119
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_4315b390198abc43);
        pushFN(data,$identifier_token_group_079_119);
        return 0;
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*
           111:328 virtual-139:2:1|-=>identifier_token_HC_listbody1_118 •
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*48:139 identifier_token=>identifier_token_group_074_117 identifier_token_HC_listbody1_118 •*/
        /*VL:0*/
        add_reduce(state,data,2,0);
        return 48;
    }
    /*ea1fb4b6c37c97a38c8bb06893c34bbd*/
}
function branch_eadb44ad4e55e10b(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==93/*[]]*/)&&consume(l,data,state)){
        add_reduce(state,data,3,36);
        return 50;
    }
    /*eadb44ad4e55e10b993994698e7f0af1*/
}
function branch_ed16a8455d8c2f0a(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==41/*[)]*/){
        /*
           14:44 function_expression=>modifier_list fn : type ( parameters ) • { expression_statements }
           14:47 function_expression=>modifier_list fn : type ( parameters ) • { }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if(l.current_byte==123/*[{]*/){
            /*
               14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }
               14:47 function_expression=>modifier_list fn : type ( parameters ) { • }
            */
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if(l.current_byte==125/*[}]*/){
                /*
                   14:47 function_expression=>modifier_list fn : type ( parameters ) { • }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                consume(l,data,state);
                add_reduce(state,data,9,30);
                /*-------------INDIRECT-------------------*/
                pushFN(data,branch_5421d5d86a2a00b8);
                return 26;
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_038fc405f6451b6c);
                pushFN(data,$expression_statements);
                return 0;
            }
        }
    }
    /*ed16a8455d8c2f0af277cd18c9bd973c*/
}
function branch_ed596ab4839b89f7(l,data,state,prod){
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
        /*
           108:325 virtual-137:3:1|-=>• identifier_token_HC_listbody1_118 identifier_token_group_079_119
           109:326 virtual-139:2:1|-=>• identifier_token_HC_listbody1_118
        */
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_c3acb534cc34eb19);
        pushFN(data,$identifier_token_HC_listbody1_118);
        return 0;
    }
    return -1;
    /*ed596ab4839b89f757292bd3a07cd932*/
}
function branch_ed646011f3430e8a(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,9,29);
        /*-------------INDIRECT-------------------*/
        pushFN(data,branch_e39790d5d793cb80);
        return 26;
    }
    /*ed646011f3430e8a9cd150df804ac33c*/
}
function branch_ee044d7019e306de(l,data,state,prod){
    while(1){
        /*[37] [43] [26] [43] [28] [37] [26] [16] [18] [120] [21] [21] [26] [116] [118] [117] [119] [16] [121] [115] [18]*/
        switch(prod){
            case 16:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(l.current_byte==59/*[;]*/){
                    /*
                       116:333 virtual-326:8:1|-=>parameters • ; expression ; loop_expression_HC_listbody6_112 ) expression
                       117:334 virtual-327:7:1|-=>parameters • ; ; loop_expression_HC_listbody6_112 ) expression
                       118:335 virtual-328:7:1|-=>parameters • ; expression ; ) expression
                       119:336 virtual-329:6:1|-=>parameters • ; ; ) expression
                    */
                    let pk = l.copy();
                    skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    if(pk.current_byte==59/*[;]*/){
                        /*
                           117:334 virtual-327:7:1|-=>parameters • ; ; loop_expression_HC_listbody6_112 ) expression
                           119:336 virtual-329:6:1|-=>parameters • ; ; ) expression
                        */
                        /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                        if(l.current_byte==59/*[;]*/){
                            /*
                               117:334 virtual-327:7:1|-=>parameters ; ; • loop_expression_HC_listbody6_112 ) expression
                               119:336 virtual-329:6:1|-=>parameters ; ; • ) expression
                            */
                            consume(l,data,state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                            /*⤋⤋⤋ assert ⤋⤋⤋*/
                            if(l.current_byte==41/*[)]*/){
                                /*
                                   119:336 virtual-329:6:1|-=>parameters ; ; • ) expression
                                */
                                /*--LEAF--*/
                                /*⤋⤋⤋ assert ⤋⤋⤋*/
                                consume(l,data,state);
                                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                                pushFN(data,branch_855d8df26ec02ced);
                                pushFN(data,$expression);
                                return 0;
                                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                            } else {
                                /*
                                   117:334 virtual-327:7:1|-=>parameters ; ; • loop_expression_HC_listbody6_112 ) expression
                                */
                                /*--LEAF--*/
                                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                                pushFN(data,branch_f6e901132e7e95e6);
                                pushFN(data,$loop_expression_HC_listbody6_112);
                                return 0;
                            }
                        }
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    } else {
                        /*
                           116:333 virtual-326:8:1|-=>parameters • ; expression ; loop_expression_HC_listbody6_112 ) expression
                           118:335 virtual-328:7:1|-=>parameters • ; expression ; ) expression
                        */
                        /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        pushFN(data,branch_3babe8c55953e091);
                        pushFN(data,$expression);
                        return 0;
                    }
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                } else if(l.current_byte==44/*[,]*/){
                    /*
                       16:54 parameters=>parameters • , primitive_declaration
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    consume(l,data,state);
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                    pushFN(data,branch_8ef1d6900037cd4e);
                    pushFN(data,$primitive_declaration);
                    return 0;
                }
                break;
            case 18:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                if(l.current_byte==41/*[)]*/){
                    /*
                       121:338 virtual-89:3:1|-=>expression_statements_group_023_108 ) •
                    */
                    consume(l,data,state);
                    consume(l,data,state);
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                    /*27:89 unary_value=>( • expression_statements_group_023_108 )*/
                    /*VL:1*/
                    pushFN(data,branch_3a4c5635f3d27ac2);
                    return 27;
                }
                break;
            case 21:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(l.current_byte==41/*[)]*/){
                    /*
                       115:332 virtual-92:3:1|-=>expression • )
                       18:58 expression_statements_group_023_108=>expression •
                    */
                    let pk = l.copy();
                    skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
                    switch(sym_map_b46ea86743f23b38(pk,data)){
                        case 0:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                            consume(l,data,state);
                            /*29:92 loop_expression_group_254_111=>( • expression )*/
                            /*VL:1*/
                            pushFN(data,branch_3a4c5635f3d27ac2);
                            return 29;
                        default:
                        case 1:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                            prod = 18;
                            continue;;
                        case 2:
                            /*-------------VPROD-------------------------*/
                            pushFN(data,branch_7a56f01423f65eb9);
                            return 0;
                    }
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                } else {
                    /*
                       18:58 expression_statements_group_023_108=>expression •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    prod = 18;
                    continue;;
                }
                break;
            case 26:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                if(!((l.current_byte==61/*[=]*/)||l.isSym(true,data))||(cmpr_set(l,data,19,4,4)||assert_ascii(l,0x0,0xc001210,0xa8000000,0x20000000))){
                    /*
                       25:82 binary_expression=>unary_expression •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    prod = 21;
                    continue;;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if((l.current_byte==61/*[=]*/)||l.isSym(true,data)){
                    /*
                       25:80 binary_expression=>unary_expression • operator
                       25:81 binary_expression=>unary_expression • operator expression
                    */
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                    pushFN(data,branch_cd032d48a8135d9c);
                    pushFN(data,$operator);
                    return 0;
                }
                break;
            case 28:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(l.current_byte==61/*[=]*/){
                    /*
                       22:76 assignment_expression=>left_hand_expression • = expression
                       27:85 unary_value=>left_hand_expression •
                    */
                    let pk = l.copy();
                    skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    if((((dt_6ae31dd85a62ef5c(pk,data)||cmpr_set(pk,data,19,4,4))||assert_ascii(pk,0x0,0x20000194,0x88000000,0x8000000))||pk.isUniID(data))||pk.isNum(data)){
                        /*
                           22:76 assignment_expression=>left_hand_expression • = expression
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        pushFN(data,branch_29edd0f5b6da7777);
                        pushFN(data,$expression);
                        return 0;
                        /*⤋⤋⤋ peek-unresolved ⤋⤋⤋*/
                    } else {
                        /*
                           22:76 assignment_expression=>left_hand_expression • = expression
                           27:85 unary_value=>left_hand_expression •
                        */
                        /*-------------VPROD-------------------------*/
                        pushFN(data,branch_af823fa490722217);
                        return 0;
                    }
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                } else {
                    /*
                       27:85 unary_value=>left_hand_expression •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    prod = 26;
                    continue;;
                }
                break;
            case 37:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(l.current_byte==91/*[[]*/){
                    /*
                       28:91 left_hand_expression=>member_expression •
                       37:116 member_expression=>member_expression • [ expression ]
                    */
                    let pk = l.copy();
                    skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    if(!(((((dt_6ae31dd85a62ef5c(pk,data)||cmpr_set(pk,data,19,4,4))||assert_ascii(pk,0x0,0x20000194,0x88000000,0x8000000))||pk.isUniID(data))||pk.isNum(data))||pk.isSym(true,data))||(((dt_a0570d6d5c8952c6(pk,data)||cmpr_set(pk,data,56,6,6))||cmpr_set(pk,data,116,3,3))||cmpr_set(pk,data,115,4,4))){
                        /*
                           28:91 left_hand_expression=>member_expression •
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        prod = 28;
                        continue;;
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    } else if(((((((((((((cmpr_set(pk,data,142,2,2)||cmpr_set(pk,data,66,5,5))||dt_bcea2102060eab13(pk,data))||dt_6ae31dd85a62ef5c(pk,data))||cmpr_set(pk,data,94,4,4))||cmpr_set(pk,data,34,4,4))||cmpr_set(pk,data,19,4,4))||cmpr_set(pk,data,71,5,5))||cmpr_set(pk,data,76,6,6))||cmpr_set(pk,data,38,8,8))||cmpr_set(pk,data,62,4,4))||assert_ascii(pk,0x0,0x20000194,0x88000000,0x8000000))||pk.isNum(data))||pk.isSym(true,data)){
                        /*
                           37:116 member_expression=>member_expression • [ expression ]
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        pushFN(data,branch_91702d133f840d06);
                        pushFN(data,$expression);
                        return 0;
                        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                    } else {
                        /*
                           37:116 member_expression=>member_expression • [ expression ]
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        pushFN(data,branch_91702d133f840d06);
                        pushFN(data,$expression);
                        return 0;
                    }
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                } else if(l.current_byte==46/*[.]*/){
                    /*
                       37:115 member_expression=>member_expression • . identifier
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    consume(l,data,state);
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                    pushFN(data,branch_3eb0fd6505d41490);
                    pushFN(data,$identifier);
                    return 0;
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                } else if(l.current_byte==40/*[(]*/){
                    /*
                       36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                       36:114 call_expression=>member_expression • ( )
                    */
                    let pk = l.copy();
                    skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    if(pk.current_byte==41/*[)]*/){
                        /*
                           36:114 call_expression=>member_expression • ( )
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
                            add_reduce(state,data,3,64);
                            pushFN(data,branch_ee044d7019e306de);
                            return 26;
                        }
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    } else {
                        /*
                           36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        pushFN(data,branch_0dbe0f35579ae63c);
                        pushFN(data,$call_expression_HC_listbody2_114);
                        return 0;
                    }
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                } else {
                    /*
                       28:91 left_hand_expression=>member_expression •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    prod = 28;
                    continue;;
                }
                break;
            case 43:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(l.current_byte==59/*[;]*/){
                    /*
                       16:55 parameters=>primitive_declaration •
                       18:59 expression_statements_group_023_108=>primitive_declaration •
                    */
                    let pk = l.copy();
                    skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    if(!(((((dt_6ae31dd85a62ef5c(pk,data)||cmpr_set(pk,data,19,4,4))||assert_ascii(pk,0x0,0x28000194,0x88000000,0x8000000))||pk.isUniID(data))||pk.isNum(data))||pk.isSym(true,data))||(pk.current_byte==125/*[}]*/)){
                        /*
                           18:59 expression_statements_group_023_108=>primitive_declaration •
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        prod = 18;
                        continue;;
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    } else {
                        /*
                           16:55 parameters=>primitive_declaration •
                           18:59 expression_statements_group_023_108=>primitive_declaration •
                        */
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        if(!(l.current_byte==59/*[;]*/)||(l.current_byte==44/*[,]*/)){
                            /*
                               18:59 expression_statements_group_023_108=>primitive_declaration •
                            */
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                            prod = 18;
                            continue;;
                            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        } else {
                            /*
                               16:55 parameters=>primitive_declaration •
                            */
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                            add_reduce(state,data,1,3);
                            prod = 16;
                            continue;;
                        }
                    }
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                } else if(!(cmpr_set(l,data,42,2,2)||(l.current_byte==41/*[)]*/))||(l.current_byte==125/*[}]*/)){
                    /*
                       16:55 parameters=>primitive_declaration •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    add_reduce(state,data,1,3);
                    prod = 16;
                    continue;;
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                } else if((l.current_byte==41/*[)]*/)||(l.current_byte==125/*[}]*/)){
                    /*
                       16:55 parameters=>primitive_declaration •
                       18:59 expression_statements_group_023_108=>primitive_declaration •
                    */
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    if(!(l.current_byte==59/*[;]*/)||(l.current_byte==44/*[,]*/)){
                        /*
                           18:59 expression_statements_group_023_108=>primitive_declaration •
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        prod = 18;
                        continue;;
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    } else {
                        /*
                           16:55 parameters=>primitive_declaration •
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        add_reduce(state,data,1,3);
                        prod = 16;
                        continue;;
                    }
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                } else if(cmpr_set(l,data,42,2,2)){
                    /*
                       120:337 virtual-330:6:1|-=>primitive_declaration • in expression ) expression
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    consume(l,data,state);
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                    pushFN(data,branch_773c1b7212e8475b);
                    pushFN(data,$expression);
                    return 0;
                }
                break;
            case 44:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(l.current_byte==58/*[:]*/){
                    /*
                       37:117 member_expression=>identifier •
                       43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                       43:128 primitive_declaration=>identifier • : type
                    */
                    let pk = l.copy();
                    skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
                    switch(sym_map_c9c12240e0caee46(pk,data)){
                        case 0:
                            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                            consume(l,data,state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                            pushFN(data,branch_8ea67d1f97947eef);
                            pushFN(data,$type);
                            return 0;
                        default:
                        case 1:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                            add_reduce(state,data,1,67);
                            prod = 37;
                            continue;;
                        case 2:
                            /*-------------VPROD-------------------------*/
                            pushFN(data,branch_735762f53f607f70);
                            return 0;
                    }
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                } else {
                    /*
                       37:117 member_expression=>identifier •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    add_reduce(state,data,1,67);
                    prod = 37;
                    continue;;
                }
                break;
            case 50:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(cmpr_set(l,data,143,2,2)){
                    /*
                       14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
                       14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
                       14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
                       14:50 function_expression=>modifier_list • fn : type ( ) { }
                    */
                    /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                    consume(l,data,state);
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                    if(l.current_byte==58/*[:]*/){
                        /*
                           14:44 function_expression=>modifier_list fn : • type ( parameters ) { expression_statements }
                           14:46 function_expression=>modifier_list fn : • type ( ) { expression_statements }
                           14:47 function_expression=>modifier_list fn : • type ( parameters ) { }
                           14:50 function_expression=>modifier_list fn : • type ( ) { }
                        */
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        pushFN(data,branch_0befa22b18dc0d64);
                        pushFN(data,$type);
                        return 0;
                    }
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
                    /*
                       43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
                       43:127 primitive_declaration=>modifier_list • identifier : type
                    */
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                    pushFN(data,branch_68ba36d7477bbfd7);
                    pushFN(data,$identifier);
                    return 0;
                }
                break;
        }
        break;
    }
    /*ee044d7019e306de74940f460c4fe486*/
}
function branch_ee5542eb378ae21b(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        add_reduce(state,data,4,63);
        /*-------------INDIRECT-------------------*/
        pushFN(data,branch_e39790d5d793cb80);
        return 26;
    }
    /*ee5542eb378ae21b6ec7b39c182e66de*/
}
function branch_ef2dc6f8b6dc9a12(l,data,state,prod){
    pushFN(data,$expression_goto);
    return 72;
    /*ef2dc6f8b6dc9a12a0d2e861dcf58334*/
}
function branch_ef615d481f986166(l,data,state,prod){
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/)){
        /*
           110:327 virtual-137:3:1|-=>• identifier_token_HC_listbody1_118 identifier_token_group_079_119
           111:328 virtual-139:2:1|-=>• identifier_token_HC_listbody1_118
        */
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_ea1fb4b6c37c97a3);
        pushFN(data,$identifier_token_HC_listbody1_118);
        return 0;
    }
    return -1;
    /*ef615d481f986166cedb4ca70cf46bac*/
}
function branch_ef7fd26222b6db24(l,data,state,prod){
    add_reduce(state,data,1,81);
    return 56;
    /*ef7fd26222b6db24299459288eced4c8*/
}
function branch_f14c9e5173466901(l,data,state,prod){
    add_reduce(state,data,2,38);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$expression_statements_goto);
    return 20;
    /*f14c9e5173466901c7fa911e71f6a283*/
}
function branch_f20c76a27e73f0f2(l,data,state,prod){
    add_reduce(state,data,4,74);
    /*-------------INDIRECT-------------------*/
    pushFN(data,branch_e39790d5d793cb80);
    return 18;
    /*f20c76a27e73f0f283befeb5d2510872*/
}
function branch_f294346e45fb95b8(l,data,state,prod){
    add_reduce(state,data,2,2);
    /*-------------INDIRECT-------------------*/
    pushFN(data,$module_goto);
    return 3;
    /*f294346e45fb95b825417a55edd51141*/
}
function branch_f473cb821f4b2122(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        /*
           43:125 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_169_116
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_8e52f3d918ebbf7d);
        pushFN(data,$primitive_declaration_group_169_116);
        return 0;
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*
           43:127 primitive_declaration=>modifier_list identifier : type •
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        add_reduce(state,data,4,75);
        /*-------------INDIRECT-------------------*/
        return 18;
    }
    /*f473cb821f4b21228a9af12520a7d9df*/
}
function branch_f5d6bb296fec92eb(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        /*
           43:126 primitive_declaration=>identifier : type • primitive_declaration_group_169_116
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_13ee8f2cbddfffa6);
        pushFN(data,$primitive_declaration_group_169_116);
        return 0;
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*
           43:128 primitive_declaration=>identifier : type •
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        add_reduce(state,data,3,76);
        add_reduce(state,data,1,3);
    }
    /*f5d6bb296fec92eb73b284885eeb2575*/
}
function branch_f6e901132e7e95e6(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_bc6ea5b413b36169);
        pushFN(data,$expression);
        return 0;
    }
    /*f6e901132e7e95e60b46af7ee8d7c46e*/
}
function branch_f701e17b03aefb8f(l,data,state,prod){
    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    if(!(l.current_byte==41/*[)]*/)||l.END(data)){
        /*
           139:356 virtual-58:1:1|-=>•
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*18:58 expression_statements_group_023_108=>expression •*/
        /*VL:2*/
        pushFN(data,branch_e39790d5d793cb80);
        return 18;
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    } else {
        /*
           138:355 virtual-350:2:1|-=>• )
           139:356 virtual-58:1:1|-=>•
        */
        let pk = l.copy();
        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if((((((((((((cmpr_set(pk,data,142,2,2)||cmpr_set(pk,data,66,5,5))||dt_bcea2102060eab13(pk,data))||cmpr_set(pk,data,94,4,4))||cmpr_set(pk,data,34,4,4))||cmpr_set(pk,data,19,4,4))||cmpr_set(pk,data,71,5,5))||cmpr_set(pk,data,76,6,6))||cmpr_set(pk,data,38,8,8))||cmpr_set(pk,data,62,4,4))||assert_ascii(pk,0x0,0x20000100,0x8000000,0x8000000))||pk.END(data))||pk.isSym(true,data)){
            /*
               138:355 virtual-350:2:1|-=>• )
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            consume(l,data,state);
            /*133:350 virtual-92:3:1|-=>expression • )*/
            /*VL:2*/
            /*29:92 loop_expression_group_254_111=>( • expression )*/
            /*VL:1*/
            pushFN(data,branch_3a4c5635f3d27ac2);
            return 29;
        }
    }
    return -1;
    /*f701e17b03aefb8fae97e95ea23cb170*/
}
function branch_f7cef3226b00786c(l,data,state,prod){
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.isSym(true,data)){
        /*
           108:325 virtual-191:3:1|-=>• operator_HC_listbody1_128 identifier_token_group_079_119
           109:326 virtual-194:2:1|-=>• operator_HC_listbody1_128
        */
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_7d5450869ddbe2bd);
        pushFN(data,$operator_HC_listbody1_128);
        return 0;
    }
    return -1;
    /*f7cef3226b00786cca0d1b6142ce2627*/
}
function branch_f7d89ae45c18d577(l,data,state,prod){
    add_reduce(state,data,8,55);
    /*f7d89ae45c18d577975a6ab4d0442a3d*/
}
function branch_f91ebab657293c51(l,data,state,prod){
    add_reduce(state,data,8,54);
    /*f91ebab657293c51b3e537c12fd9cc4b*/
}
function branch_f92291714d6350ed(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==58/*[:]*/){
        /*
           43:125 primitive_declaration=>modifier_list identifier : • type primitive_declaration_group_169_116
           43:127 primitive_declaration=>modifier_list identifier : • type
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_e86edee18105034f);
        pushFN(data,$type);
        return 0;
    }
    /*f92291714d6350ed2fe7c63577acbf8a*/
}
function branch_faf51e1820faf277(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,6,9);
        /*-------------INDIRECT-------------------*/
        pushFN(data,$statements_goto);
        return 4;
    }
    /*faf51e1820faf277d7edf57c330a5c8b*/
}
function branch_fb2ce6c9a3baded0(l,data,state,prod){
    skip_db1786a8af54d666(l/*[ 71 ]*/,data,true);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/){
        /*
           65:191 operator=>θsym operator_HC_listbody1_128 • identifier_token_group_079_119
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_e2bf1a2fbc8c4ac7);
        pushFN(data,$identifier_token_group_079_119);
        return 0;
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*
           65:194 operator=>θsym operator_HC_listbody1_128 •
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        add_reduce(state,data,2,91);
    }
    /*fb2ce6c9a3baded0779af23b30543aeb*/
}
function branch_fb7a8f03b09e8c97(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==41/*[)]*/){
        /*
           14:44 function_expression=>modifier_list fn : type ( parameters ) • { expression_statements }
           14:47 function_expression=>modifier_list fn : type ( parameters ) • { }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if(l.current_byte==123/*[{]*/){
            /*
               14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }
               14:47 function_expression=>modifier_list fn : type ( parameters ) { • }
            */
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if(l.current_byte==125/*[}]*/){
                /*
                   14:47 function_expression=>modifier_list fn : type ( parameters ) { • }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                consume(l,data,state);
                add_reduce(state,data,9,30);
                /*-------------INDIRECT-------------------*/
                pushFN(data,branch_ee044d7019e306de);
                return 26;
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_561d8f461799c842);
                pushFN(data,$expression_statements);
                return 0;
            }
        }
    }
    /*fb7a8f03b09e8c974d822eb3d6e8ebab*/
}
function branch_fbae9373be316b4e(l,data,state,prod){
    add_reduce(state,data,2,45);
    /*-------------INDIRECT-------------------*/
    pushFN(data,branch_5421d5d86a2a00b8);
    return 26;
    /*fbae9373be316b4ea82624be4a468001*/
}
function branch_fbaffdd99f7cd390(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        /*
           43:126 primitive_declaration=>identifier : type • primitive_declaration_group_169_116
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_f20c76a27e73f0f2);
        pushFN(data,$primitive_declaration_group_169_116);
        return 0;
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*
           43:128 primitive_declaration=>identifier : type •
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        add_reduce(state,data,3,76);
        /*-------------INDIRECT-------------------*/
        pushFN(data,branch_e39790d5d793cb80);
        return 18;
    }
    /*fbaffdd99f7cd390f2bbf9c2f44df4df*/
}
function branch_fc3089e8ba238415(l,data,state,prod){
    pushFN(data,$class_group_016_104_goto);
    return 9;
    /*fc3089e8ba238415307d1c965288ff81*/
}
function branch_fc940c1dec3689bf(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==123/*[{]*/){
        /*
           12:33 struct=>str identifier { • parameters }
           12:35 struct=>str identifier { • }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.current_byte==125/*[}]*/){
            /*
               12:35 struct=>str identifier { • }
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            consume(l,data,state);
            add_reduce(state,data,4,18);
            return 12;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               12:33 struct=>str identifier { • parameters }
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_53c288e720b933ec);
            pushFN(data,$parameters);
            return 0;
        }
    }
    /*fc940c1dec3689bfdbb2d3ea4e9b1c1f*/
}
function branch_fdb70d9e86e3929d(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if((l.current_byte==93/*[]]*/)&&consume(l,data,state)){
        add_reduce(state,data,4,66);
        /*-------------INDIRECT-------------------*/
        pushFN(data,$member_expression_goto);
        return 37;
    }
    /*fdb70d9e86e3929d303afb1bf0a6884c*/
}
function branch_fe61174d9519f362(l,data,state,prod){
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(((((dt_6ae31dd85a62ef5c(l,data)||cmpr_set(l,data,19,4,4))||assert_ascii(l,0x0,0x20000194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
        /*
           133:350 virtual-92:3:1|-=>• expression )
           134:351 virtual-89:3:1|-=>• expression_statements_group_023_108 )
        */
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        switch(sym_map_4b46f94478f33fdf(l,data)){
            case 0:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                pushFN(data,branch_e85d01fb275ffeb1);
                pushFN(data,$modifier_list);
                return 0;
            case 1:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_b3ae70a7497236c4);
                pushFN(data,$template);
                return 0;
            case 2:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_80e5d6e7810be94e);
                pushFN(data,$unary_value);
                return 0;
            case 3:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_114bb222a4e1db2d);
                pushFN(data,$expression);
                return 0;
            case 4:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_80e5d6e7810be94e);
                pushFN(data,$value);
                return 0;
            case 5:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_53ee877ca347844f);
                pushFN(data,$num);
                return 0;
            case 6:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_a1b35c95932e2573);
                pushFN(data,$operator);
                return 0;
            case 7:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_114bb222a4e1db2d);
                pushFN(data,$if_expression);
                return 0;
            case 8:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_114bb222a4e1db2d);
                pushFN(data,$match_expression);
                return 0;
            case 9:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_80e5d6e7810be94e);
                pushFN(data,$function_expression);
                return 0;
            case 10:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_114bb222a4e1db2d);
                pushFN(data,$break_expression);
                return 0;
            case 11:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_114bb222a4e1db2d);
                pushFN(data,$return_expression);
                return 0;
            case 12:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                pushFN(data,branch_114bb222a4e1db2d);
                pushFN(data,$continue_expression);
                return 0;
            case 13:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_114bb222a4e1db2d);
                pushFN(data,$loop_expression);
                return 0;
            case 14:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                pushFN(data,branch_80e5d6e7810be94e);
                pushFN(data,$value);
                return 0;
            case 15:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_d2b52ff9b7bc04b7);
                pushFN(data,$identifier);
                return 0;
            default:
                break;
        }
    }
    return -1;
    /*fe61174d9519f362ef4ea52a9e2207bd*/
}
function branch_fe7e48edaa56a85c(l,data,state,prod){
    add_reduce(state,data,1,78);
    return 55;
    /*fe7e48edaa56a85cdd0fe8fd0cb84a3c*/
}
function branch_ff5f88324af8291b(l,data,state,prod){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
    if(cmpr_set(l,data,127,4,4)){
        /*
           24:78 if_expression=>if expression : expression • if_expression_group_139_110
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
        pushFN(data,branch_3006927599d5524c);
        pushFN(data,$if_expression_group_139_110);
        return 0;
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*
           24:79 if_expression=>if expression : expression •
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        add_reduce(state,data,4,44);
        return 24;
    }
    /*ff5f88324af8291bcc7eeadc87ffc813*/
}
function branch_ff920a370adc3c6a(l,data,state,prod){
    add_reduce(state,data,4,74);
    /*-------------INDIRECT-------------------*/
    pushFN(data,branch_5421d5d86a2a00b8);
    return 18;
    /*ff920a370adc3c6aea0d290c7501f022*/
}
function dt_1e3f2d5b696b270e(l,data){
    if(3==compare(data,l.byte_offset +0,46,3)){
        if(3==compare(data,l.byte_offset +3,49,3)){
            l.type = TokenSymbol;
            l.byte_length = 6;
            l.token_length = 6;
            return true;
        }
        l.type = TokenSymbol;
        l.byte_length = 3;
        l.token_length = 3;
        return true;
    }
    return false;
}
function dt_1f145d506cf02379(l,data){
    if(2==compare(data,l.byte_offset +0,16,2)){
        l.type = TokenSymbol;
        l.byte_length = 2;
        l.token_length = 2;
        return true;
    } else if(2==compare(data,l.byte_offset +0,111,2)){
        l.type = TokenSymbol;
        l.byte_length = 2;
        l.token_length = 2;
        return true;
    }
    return false;
}
function dt_49ab5c8c65528b83(l,data){
    if(2==compare(data,l.byte_offset +0,131,2)){
        l.type = TokenSymbol;
        l.byte_length = 2;
        l.token_length = 2;
        return true;
    } else if(3==compare(data,l.byte_offset +0,87,3)){
        l.type = TokenSymbol;
        l.byte_length = 3;
        l.token_length = 3;
        return true;
    }
    return false;
}
function dt_4a896e8627f36237(l,data){
    if(2==compare(data,l.byte_offset +0,42,2)){
        l.type = TokenSymbol;
        l.byte_length = 2;
        l.token_length = 2;
        return true;
    } else if(6==compare(data,l.byte_offset +0,28,6)){
        l.type = TokenSymbol;
        l.byte_length = 6;
        l.token_length = 6;
        return true;
    }
    return false;
}
function dt_6ae31dd85a62ef5c(l,data){
    if(2==compare(data,l.byte_offset +0,26,2)){
        l.type = TokenSymbol;
        l.byte_length = 2;
        l.token_length = 2;
        return true;
    } else if(2==compare(data,l.byte_offset +0,113,2)){
        l.type = TokenSymbol;
        l.byte_length = 2;
        l.token_length = 2;
        return true;
    } else if(2==compare(data,l.byte_offset +0,136,2)){
        l.type = TokenSymbol;
        l.byte_length = 2;
        l.token_length = 2;
        return true;
    } else if(2==compare(data,l.byte_offset +0,138,2)){
        l.type = TokenSymbol;
        l.byte_length = 2;
        l.token_length = 2;
        return true;
    }
    return false;
}
function dt_a0570d6d5c8952c6(l,data){
    if(3==compare(data,l.byte_offset +0,133,3)){
        l.type = TokenSymbol;
        l.byte_length = 3;
        l.token_length = 3;
        return true;
    } else if(4==compare(data,l.byte_offset +0,98,4)){
        l.type = TokenSymbol;
        l.byte_length = 4;
        l.token_length = 4;
        return true;
    }
    return false;
}
function dt_bc3480b75045e0d0(l,data){
    if(2==compare(data,l.byte_offset +0,136,2)){
        l.type = TokenSymbol;
        l.byte_length = 2;
        l.token_length = 2;
        return true;
    } else if(2==compare(data,l.byte_offset +0,138,2)){
        l.type = TokenSymbol;
        l.byte_length = 2;
        l.token_length = 2;
        return true;
    }
    return false;
}
function dt_bcea2102060eab13(l,data){
    if(2==compare(data,l.byte_offset +0,143,2)){
        l.type = TokenSymbol;
        l.byte_length = 2;
        l.token_length = 2;
        return true;
    } else if(5==compare(data,l.byte_offset +0,52,5)){
        l.type = TokenSymbol;
        l.byte_length = 5;
        l.token_length = 5;
        return true;
    }
    return false;
}
function nocap_9b1ef04606bbaa09(l){
    let a = l.token_length;
    let b = l.byte_length;
    if(l.isNL()){
        l.token_length = a;
        l.byte_length = b;
        return true;
    }
    return false;
}
function nocap_b2eb52235ee30b8a(l){
    let a = l.token_length;
    let b = l.byte_length;
    if(l.isNL()||l.isSP(true,data)){
        l.token_length = a;
        l.byte_length = b;
        return true;
    }
    return false;
}
function skip_6c02533b5dc0d802(l,data,APPLY){
    const off = l.token_offset;
    while(1){
        if(!(tk_e216f7e76b2d5e60(l,data)||l.isSP(true,data))){
            break;
        }
        l.next(data);
    }
    if(APPLY){
        add_skip(l,data,l.token_offset - off);
    }
}
function skip_9184d3c96b70653a(l,data,APPLY){
    const off = l.token_offset;
    while(1){
        if(!((tk_e216f7e76b2d5e60(l,data)||l.isNL())||l.isSP(true,data))){
            break;
        }
        l.next(data);
    }
    if(APPLY){
        add_skip(l,data,l.token_offset - off);
    }
}
function skip_a294e41529bc9275(l,data,APPLY){
    const off = l.token_offset;
    while(1){
        if(!(tk_e216f7e76b2d5e60(l,data)||l.isNL())){
            break;
        }
        l.next(data);
    }
    if(APPLY){
        add_skip(l,data,l.token_offset - off);
    }
}
function skip_db1786a8af54d666(l,data,APPLY){
    const off = l.token_offset;
    while(1){
        if(!(tk_e216f7e76b2d5e60(l,data))){
            break;
        }
        l.next(data);
    }
    if(APPLY){
        add_skip(l,data,l.token_offset - off);
    }
}
function sym_map_2ce6da43b14e1682(l,data){
    if(data.input[l.byte_offset + 0] == 117){
        if(data.input[l.byte_offset + 1] == 105){
            if(2==compare(data,l.byte_offset +2,84,2)){
                l.type = TokenSymbol;
                l.byte_length = 4;
                l.token_length = 4;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 0;
            }
        }
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        if(!l.isDiscrete(data, TokenIdentifier)){
            return 0xFFFFFF;
        }
        return 0;
    } else if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 102){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        } else if(data.input[l.byte_offset + 1] == 110){
            if(data.input[l.byte_offset + 2] == 116){
                l.type = TokenSymbol;
                l.byte_length = 3;
                l.token_length = 3;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 0;
            }
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        } else if(data.input[l.byte_offset + 1] == 109){
            if(4==compare(data,l.byte_offset +2,30,4)){
                l.type = TokenSymbol;
                l.byte_length = 6;
                l.token_length = 6;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 1;
            }
        }
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        if(!l.isDiscrete(data, TokenIdentifier)){
            return 0xFFFFFF;
        }
        return 0;
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        } else if(data.input[l.byte_offset + 1] == 108){
            if(data.input[l.byte_offset + 2] == 116){
                l.type = TokenSymbol;
                l.byte_length = 3;
                l.token_length = 3;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 0;
            }
        } else if(data.input[l.byte_offset + 1] == 97){
            if(3==compare(data,l.byte_offset +2,54,3)){
                l.type = TokenSymbol;
                l.byte_length = 5;
                l.token_length = 5;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 1;
            }
        }
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        if(!l.isDiscrete(data, TokenIdentifier)){
            return 0xFFFFFF;
        }
        return 0;
    } else if(data.input[l.byte_offset + 0] == 115){
        if(data.input[l.byte_offset + 1] == 116){
            if(data.input[l.byte_offset + 2] == 114){
                if(data.input[l.byte_offset + 3] == 105){
                    if(2==compare(data,l.byte_offset +4,50,2)){
                        l.type = TokenSymbol;
                        l.byte_length = 6;
                        l.token_length = 6;
                        if(!l.isDiscrete(data, TokenIdentifier)){
                            return 0xFFFFFF;
                        }
                        return 0;
                    }
                }
                l.type = TokenSymbol;
                l.byte_length = 3;
                l.token_length = 3;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 2;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 109){
        if(4==compare(data,l.byte_offset +1,67,4)){
            l.type = TokenSymbol;
            l.byte_length = 5;
            l.token_length = 5;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 61){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 91){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 48){
        if(data.input[l.byte_offset + 1] == 120){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 1;
        } else if(data.input[l.byte_offset + 1] == 98){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 1;
        } else if(data.input[l.byte_offset + 1] == 111){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 1;
        } else if(data.input[l.byte_offset + 1] == 79){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 34){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 39){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 116){
        if(3==compare(data,l.byte_offset +1,95,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 110){
        if(data.input[l.byte_offset + 1] == 115){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        } else if(data.input[l.byte_offset + 1] == 117){
            if(2==compare(data,l.byte_offset +2,36,2)){
                l.type = TokenSymbol;
                l.byte_length = 4;
                l.token_length = 4;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 60){
        if(3==compare(data,l.byte_offset +1,20,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 40){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 98){
        if(4==compare(data,l.byte_offset +1,72,4)){
            l.type = TokenSymbol;
            l.byte_length = 5;
            l.token_length = 5;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 114){
        if(5==compare(data,l.byte_offset +1,77,5)){
            l.type = TokenSymbol;
            l.byte_length = 6;
            l.token_length = 6;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 99){
        if(data.input[l.byte_offset + 1] == 108){
            if(data.input[l.byte_offset + 2] == 115){
                l.type = TokenSymbol;
                l.byte_length = 3;
                l.token_length = 3;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 1;
            }
        } else if(data.input[l.byte_offset + 1] == 111){
            if(6==compare(data,l.byte_offset +2,40,6)){
                l.type = TokenSymbol;
                l.byte_length = 8;
                l.token_length = 8;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 108){
        if(3==compare(data,l.byte_offset +1,63,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 123){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 93){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 58){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 59){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 41){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 101){
        if(3==compare(data,l.byte_offset +1,128,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 125){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 44){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 95){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 2;
    } else if(data.input[l.byte_offset + 0] == 36){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 2;
    }
    if(l.isSym(true,data)){
        return 1;
    } else if(l.isNum(data)){
        return 1;
    } else if(l.isUniID(data)){
        return 2;
    }
}
function sym_map_3bcb1be30ed60ba3(l,data){
    if(data.input[l.byte_offset + 0] == 41){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 102){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 109){
        if(4==compare(data,l.byte_offset +1,67,4)){
            l.type = TokenSymbol;
            l.byte_length = 5;
            l.token_length = 5;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 61){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        } else if(data.input[l.byte_offset + 1] == 97){
            if(3==compare(data,l.byte_offset +2,54,3)){
                l.type = TokenSymbol;
                l.byte_length = 5;
                l.token_length = 5;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 48){
        if(data.input[l.byte_offset + 1] == 120){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 1;
        } else if(data.input[l.byte_offset + 1] == 98){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 1;
        } else if(data.input[l.byte_offset + 1] == 111){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 1;
        } else if(data.input[l.byte_offset + 1] == 79){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 34){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 39){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 116){
        if(3==compare(data,l.byte_offset +1,95,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 110){
        if(3==compare(data,l.byte_offset +1,35,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 60){
        if(3==compare(data,l.byte_offset +1,20,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 40){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 98){
        if(4==compare(data,l.byte_offset +1,72,4)){
            l.type = TokenSymbol;
            l.byte_length = 5;
            l.token_length = 5;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 114){
        if(5==compare(data,l.byte_offset +1,77,5)){
            l.type = TokenSymbol;
            l.byte_length = 6;
            l.token_length = 6;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 99){
        if(7==compare(data,l.byte_offset +1,39,7)){
            l.type = TokenSymbol;
            l.byte_length = 8;
            l.token_length = 8;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 108){
        if(3==compare(data,l.byte_offset +1,63,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 123){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 95){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 2;
    } else if(data.input[l.byte_offset + 0] == 36){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 2;
    } else if(data.input[l.byte_offset + 0] == 91){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 2;
    }
    if(l.isSym(true,data)){
        return 1;
    } else if(l.isNum(data)){
        return 1;
    } else if(l.isUniID(data)){
        return 2;
    }
}
function sym_map_3dd6ef2b3a49ff7e(l,data){
    if(data.input[l.byte_offset + 0] == 41){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 59){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 102){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 2;
        }
    } else if(data.input[l.byte_offset + 0] == 109){
        if(4==compare(data,l.byte_offset +1,67,4)){
            l.type = TokenSymbol;
            l.byte_length = 5;
            l.token_length = 5;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 2;
        }
    } else if(data.input[l.byte_offset + 0] == 61){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 2;
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 2;
        } else if(data.input[l.byte_offset + 1] == 97){
            if(3==compare(data,l.byte_offset +2,54,3)){
                l.type = TokenSymbol;
                l.byte_length = 5;
                l.token_length = 5;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 2;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 48){
        if(data.input[l.byte_offset + 1] == 120){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 2;
        } else if(data.input[l.byte_offset + 1] == 98){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 2;
        } else if(data.input[l.byte_offset + 1] == 111){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 2;
        } else if(data.input[l.byte_offset + 1] == 79){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 2;
        }
    } else if(data.input[l.byte_offset + 0] == 34){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 2;
    } else if(data.input[l.byte_offset + 0] == 39){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 2;
    } else if(data.input[l.byte_offset + 0] == 116){
        if(3==compare(data,l.byte_offset +1,95,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 2;
        }
    } else if(data.input[l.byte_offset + 0] == 110){
        if(3==compare(data,l.byte_offset +1,35,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 2;
        }
    } else if(data.input[l.byte_offset + 0] == 60){
        if(3==compare(data,l.byte_offset +1,20,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            return 2;
        }
    } else if(data.input[l.byte_offset + 0] == 40){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 2;
    } else if(data.input[l.byte_offset + 0] == 98){
        if(4==compare(data,l.byte_offset +1,72,4)){
            l.type = TokenSymbol;
            l.byte_length = 5;
            l.token_length = 5;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 2;
        }
    } else if(data.input[l.byte_offset + 0] == 114){
        if(5==compare(data,l.byte_offset +1,77,5)){
            l.type = TokenSymbol;
            l.byte_length = 6;
            l.token_length = 6;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 2;
        }
    } else if(data.input[l.byte_offset + 0] == 99){
        if(7==compare(data,l.byte_offset +1,39,7)){
            l.type = TokenSymbol;
            l.byte_length = 8;
            l.token_length = 8;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 2;
        }
    } else if(data.input[l.byte_offset + 0] == 108){
        if(3==compare(data,l.byte_offset +1,63,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 2;
        }
    } else if(data.input[l.byte_offset + 0] == 123){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 2;
    } else if(data.input[l.byte_offset + 0] == 95){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 3;
    } else if(data.input[l.byte_offset + 0] == 36){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 3;
    } else if(data.input[l.byte_offset + 0] == 91){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 3;
    }
    if(l.isSym(true,data)){
        return 2;
    } else if(l.isNum(data)){
        return 2;
    } else if(l.isUniID(data)){
        return 3;
    }
}
function sym_map_439a05cca98595e4(l,data){
    if(data.input[l.byte_offset + 0] == 58){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 101){
        if(3==compare(data,l.byte_offset +1,128,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 41){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 59){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 93){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 125){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 44){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 110){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        } else if(data.input[l.byte_offset + 1] == 102){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        } else if(data.input[l.byte_offset + 1] == 109){
            if(4==compare(data,l.byte_offset +2,30,4)){
                l.type = TokenSymbol;
                l.byte_length = 6;
                l.token_length = 6;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 115){
        if(2==compare(data,l.byte_offset +1,47,2)){
            l.type = TokenSymbol;
            l.byte_length = 3;
            l.token_length = 3;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 99){
        if(data.input[l.byte_offset + 1] == 108){
            if(data.input[l.byte_offset + 2] == 115){
                l.type = TokenSymbol;
                l.byte_length = 3;
                l.token_length = 3;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 0;
            }
        } else if(data.input[l.byte_offset + 1] == 111){
            if(6==compare(data,l.byte_offset +2,40,6)){
                l.type = TokenSymbol;
                l.byte_length = 8;
                l.token_length = 8;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 110){
        if(data.input[l.byte_offset + 1] == 115){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        } else if(data.input[l.byte_offset + 1] == 117){
            if(2==compare(data,l.byte_offset +2,36,2)){
                l.type = TokenSymbol;
                l.byte_length = 4;
                l.token_length = 4;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 109){
        if(4==compare(data,l.byte_offset +1,67,4)){
            l.type = TokenSymbol;
            l.byte_length = 5;
            l.token_length = 5;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 61){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 48){
        if(data.input[l.byte_offset + 1] == 120){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 1;
        } else if(data.input[l.byte_offset + 1] == 98){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 1;
        } else if(data.input[l.byte_offset + 1] == 111){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 1;
        } else if(data.input[l.byte_offset + 1] == 79){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 34){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 39){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 116){
        if(3==compare(data,l.byte_offset +1,95,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 2;
        } else if(data.input[l.byte_offset + 1] == 97){
            if(3==compare(data,l.byte_offset +2,54,3)){
                l.type = TokenSymbol;
                l.byte_length = 5;
                l.token_length = 5;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 40){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 98){
        if(4==compare(data,l.byte_offset +1,72,4)){
            l.type = TokenSymbol;
            l.byte_length = 5;
            l.token_length = 5;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 114){
        if(5==compare(data,l.byte_offset +1,77,5)){
            l.type = TokenSymbol;
            l.byte_length = 6;
            l.token_length = 6;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 108){
        if(3==compare(data,l.byte_offset +1,63,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 123){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 91){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 2;
    } else if(data.input[l.byte_offset + 0] == 95){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 2;
    } else if(data.input[l.byte_offset + 0] == 36){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 2;
    } else if(data.input[l.byte_offset + 0] == 60){
        if(3==compare(data,l.byte_offset +1,20,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            return 2;
        }
    }
    if(l.isSym(true,data)){
        return 1;
    } else if(l.isNum(data)){
        return 1;
    } else if(l.isUniID(data)){
        return 2;
    }
}
function sym_map_4b46f94478f33fdf(l,data){
    if(data.input[l.byte_offset + 0] == 91){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 60){
        if(3==compare(data,l.byte_offset +1,20,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 40){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 2;
    } else if(data.input[l.byte_offset + 0] == 123){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 3;
    } else if(data.input[l.byte_offset + 0] == 34){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 4;
    } else if(data.input[l.byte_offset + 0] == 39){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 4;
    } else if(data.input[l.byte_offset + 0] == 48){
        if(data.input[l.byte_offset + 1] == 120){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 5;
        } else if(data.input[l.byte_offset + 1] == 98){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 5;
        } else if(data.input[l.byte_offset + 1] == 111){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 5;
        } else if(data.input[l.byte_offset + 1] == 79){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 5;
        }
    } else if(data.input[l.byte_offset + 0] == 61){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 6;
    } else if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 102){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 7;
        }
    } else if(data.input[l.byte_offset + 0] == 109){
        if(4==compare(data,l.byte_offset +1,67,4)){
            l.type = TokenSymbol;
            l.byte_length = 5;
            l.token_length = 5;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 8;
        }
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 9;
        } else if(data.input[l.byte_offset + 1] == 97){
            if(3==compare(data,l.byte_offset +2,54,3)){
                l.type = TokenSymbol;
                l.byte_length = 5;
                l.token_length = 5;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 14;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 98){
        if(4==compare(data,l.byte_offset +1,72,4)){
            l.type = TokenSymbol;
            l.byte_length = 5;
            l.token_length = 5;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 10;
        }
    } else if(data.input[l.byte_offset + 0] == 114){
        if(5==compare(data,l.byte_offset +1,77,5)){
            l.type = TokenSymbol;
            l.byte_length = 6;
            l.token_length = 6;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 11;
        }
    } else if(data.input[l.byte_offset + 0] == 99){
        if(7==compare(data,l.byte_offset +1,39,7)){
            l.type = TokenSymbol;
            l.byte_length = 8;
            l.token_length = 8;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 12;
        }
    } else if(data.input[l.byte_offset + 0] == 108){
        if(3==compare(data,l.byte_offset +1,63,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 13;
        }
    } else if(data.input[l.byte_offset + 0] == 116){
        if(3==compare(data,l.byte_offset +1,95,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 14;
        }
    } else if(data.input[l.byte_offset + 0] == 110){
        if(3==compare(data,l.byte_offset +1,35,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 14;
        }
    } else if(data.input[l.byte_offset + 0] == 95){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 15;
    } else if(data.input[l.byte_offset + 0] == 36){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 15;
    }
    if(l.isNum(data)){
        return 5;
    } else if(l.isSym(true,data)){
        return 6;
    } else if(l.isUniID(data)){
        return 15;
    }
}
function sym_map_57db70ddd657b805(l,data){
    if(data.input[l.byte_offset + 0] == 60){
        if(3==compare(data,l.byte_offset +1,20,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 123){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 102){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 2;
        }
    } else if(data.input[l.byte_offset + 0] == 109){
        if(4==compare(data,l.byte_offset +1,67,4)){
            l.type = TokenSymbol;
            l.byte_length = 5;
            l.token_length = 5;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 3;
        }
    } else if(data.input[l.byte_offset + 0] == 98){
        if(4==compare(data,l.byte_offset +1,72,4)){
            l.type = TokenSymbol;
            l.byte_length = 5;
            l.token_length = 5;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 4;
        }
    } else if(data.input[l.byte_offset + 0] == 114){
        if(5==compare(data,l.byte_offset +1,77,5)){
            l.type = TokenSymbol;
            l.byte_length = 6;
            l.token_length = 6;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 5;
        }
    } else if(data.input[l.byte_offset + 0] == 99){
        if(7==compare(data,l.byte_offset +1,39,7)){
            l.type = TokenSymbol;
            l.byte_length = 8;
            l.token_length = 8;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 6;
        }
    } else if(data.input[l.byte_offset + 0] == 108){
        if(3==compare(data,l.byte_offset +1,63,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 7;
        }
    } else if(data.input[l.byte_offset + 0] == 95){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 8;
    } else if(data.input[l.byte_offset + 0] == 36){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 8;
    } else if(data.input[l.byte_offset + 0] == 61){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 9;
    } else if(data.input[l.byte_offset + 0] == 91){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 9;
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 9;
        } else if(data.input[l.byte_offset + 1] == 97){
            if(3==compare(data,l.byte_offset +2,54,3)){
                l.type = TokenSymbol;
                l.byte_length = 5;
                l.token_length = 5;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 9;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 48){
        if(data.input[l.byte_offset + 1] == 120){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 9;
        } else if(data.input[l.byte_offset + 1] == 98){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 9;
        } else if(data.input[l.byte_offset + 1] == 111){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 9;
        } else if(data.input[l.byte_offset + 1] == 79){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 9;
        }
    } else if(data.input[l.byte_offset + 0] == 34){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 9;
    } else if(data.input[l.byte_offset + 0] == 39){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 9;
    } else if(data.input[l.byte_offset + 0] == 116){
        if(3==compare(data,l.byte_offset +1,95,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 9;
        }
    } else if(data.input[l.byte_offset + 0] == 110){
        if(3==compare(data,l.byte_offset +1,35,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 9;
        }
    } else if(data.input[l.byte_offset + 0] == 40){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 9;
    }
    if(l.isUniID(data)){
        return 8;
    } else if(l.isSym(true,data)){
        return 9;
    } else if(l.isNum(data)){
        return 9;
    }
}
function sym_map_595f96e39304d306(l,data){
    if(data.input[l.byte_offset + 0] == 41){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 59){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 93){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 58){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 101){
        if(3==compare(data,l.byte_offset +1,128,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 110){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        } else if(data.input[l.byte_offset + 1] == 102){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        } else if(data.input[l.byte_offset + 1] == 109){
            if(4==compare(data,l.byte_offset +2,30,4)){
                l.type = TokenSymbol;
                l.byte_length = 6;
                l.token_length = 6;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 125){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 44){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 115){
        if(2==compare(data,l.byte_offset +1,47,2)){
            l.type = TokenSymbol;
            l.byte_length = 3;
            l.token_length = 3;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 99){
        if(data.input[l.byte_offset + 1] == 108){
            if(data.input[l.byte_offset + 2] == 115){
                l.type = TokenSymbol;
                l.byte_length = 3;
                l.token_length = 3;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 0;
            }
        } else if(data.input[l.byte_offset + 1] == 111){
            if(6==compare(data,l.byte_offset +2,40,6)){
                l.type = TokenSymbol;
                l.byte_length = 8;
                l.token_length = 8;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 110){
        if(data.input[l.byte_offset + 1] == 115){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        } else if(data.input[l.byte_offset + 1] == 117){
            if(2==compare(data,l.byte_offset +2,36,2)){
                l.type = TokenSymbol;
                l.byte_length = 4;
                l.token_length = 4;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 109){
        if(4==compare(data,l.byte_offset +1,67,4)){
            l.type = TokenSymbol;
            l.byte_length = 5;
            l.token_length = 5;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 61){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 48){
        if(data.input[l.byte_offset + 1] == 120){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 1;
        } else if(data.input[l.byte_offset + 1] == 98){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 1;
        } else if(data.input[l.byte_offset + 1] == 111){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 1;
        } else if(data.input[l.byte_offset + 1] == 79){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 34){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 39){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 116){
        if(3==compare(data,l.byte_offset +1,95,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 2;
        } else if(data.input[l.byte_offset + 1] == 97){
            if(3==compare(data,l.byte_offset +2,54,3)){
                l.type = TokenSymbol;
                l.byte_length = 5;
                l.token_length = 5;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 40){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 98){
        if(4==compare(data,l.byte_offset +1,72,4)){
            l.type = TokenSymbol;
            l.byte_length = 5;
            l.token_length = 5;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 114){
        if(5==compare(data,l.byte_offset +1,77,5)){
            l.type = TokenSymbol;
            l.byte_length = 6;
            l.token_length = 6;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 108){
        if(3==compare(data,l.byte_offset +1,63,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 123){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 91){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 2;
    } else if(data.input[l.byte_offset + 0] == 95){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 2;
    } else if(data.input[l.byte_offset + 0] == 36){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 2;
    } else if(data.input[l.byte_offset + 0] == 60){
        if(3==compare(data,l.byte_offset +1,20,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            return 2;
        }
    }
    if(l.isSym(true,data)){
        return 1;
    } else if(l.isNum(data)){
        return 1;
    } else if(l.isUniID(data)){
        return 2;
    }
}
function sym_map_6308103595c2139f(l,data){
    if(data.input[l.byte_offset + 0] == 91){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 60){
        if(3==compare(data,l.byte_offset +1,20,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 105){
        if(5==compare(data,l.byte_offset +1,29,5)){
            l.type = TokenSymbol;
            l.byte_length = 6;
            l.token_length = 6;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 2;
        }
    } else if(data.input[l.byte_offset + 0] == 99){
        if(2==compare(data,l.byte_offset +1,122,2)){
            l.type = TokenSymbol;
            l.byte_length = 3;
            l.token_length = 3;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 3;
        }
    } else if(data.input[l.byte_offset + 0] == 115){
        if(2==compare(data,l.byte_offset +1,47,2)){
            l.type = TokenSymbol;
            l.byte_length = 3;
            l.token_length = 3;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 4;
        }
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 5;
        }
    } else if(data.input[l.byte_offset + 0] == 110){
        if(data.input[l.byte_offset + 1] == 115){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 6;
        }
    } else if(data.input[l.byte_offset + 0] == 95){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 7;
    } else if(data.input[l.byte_offset + 0] == 36){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 7;
    }
    if(l.isUniID(data)){
        return 7;
    }
}
function sym_map_aaf5d00b8db9faac(l,data){
    if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 102){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 109){
        if(4==compare(data,l.byte_offset +1,67,4)){
            l.type = TokenSymbol;
            l.byte_length = 5;
            l.token_length = 5;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 61){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        } else if(data.input[l.byte_offset + 1] == 97){
            if(3==compare(data,l.byte_offset +2,54,3)){
                l.type = TokenSymbol;
                l.byte_length = 5;
                l.token_length = 5;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 48){
        if(data.input[l.byte_offset + 1] == 120){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 0;
        } else if(data.input[l.byte_offset + 1] == 98){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 0;
        } else if(data.input[l.byte_offset + 1] == 111){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 0;
        } else if(data.input[l.byte_offset + 1] == 79){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 34){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 39){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 116){
        if(3==compare(data,l.byte_offset +1,95,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 110){
        if(3==compare(data,l.byte_offset +1,35,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 60){
        if(3==compare(data,l.byte_offset +1,20,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 40){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 98){
        if(4==compare(data,l.byte_offset +1,72,4)){
            l.type = TokenSymbol;
            l.byte_length = 5;
            l.token_length = 5;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 114){
        if(5==compare(data,l.byte_offset +1,77,5)){
            l.type = TokenSymbol;
            l.byte_length = 6;
            l.token_length = 6;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 99){
        if(7==compare(data,l.byte_offset +1,39,7)){
            l.type = TokenSymbol;
            l.byte_length = 8;
            l.token_length = 8;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 108){
        if(3==compare(data,l.byte_offset +1,63,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 123){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 95){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 36){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 91){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    }
    if(l.isSym(true,data)){
        return 0;
    } else if(l.isNum(data)){
        return 0;
    } else if(l.isUniID(data)){
        return 1;
    }
}
function sym_map_b46ea86743f23b38(l,data){
    if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 102){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        } else if(data.input[l.byte_offset + 1] == 110){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        } else if(data.input[l.byte_offset + 1] == 109){
            if(4==compare(data,l.byte_offset +2,30,4)){
                l.type = TokenSymbol;
                l.byte_length = 6;
                l.token_length = 6;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 109){
        if(4==compare(data,l.byte_offset +1,67,4)){
            l.type = TokenSymbol;
            l.byte_length = 5;
            l.token_length = 5;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 116){
        if(3==compare(data,l.byte_offset +1,95,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 2;
        } else if(data.input[l.byte_offset + 1] == 97){
            if(3==compare(data,l.byte_offset +2,54,3)){
                l.type = TokenSymbol;
                l.byte_length = 5;
                l.token_length = 5;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 110){
        if(data.input[l.byte_offset + 1] == 115){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        } else if(data.input[l.byte_offset + 1] == 117){
            if(2==compare(data,l.byte_offset +2,36,2)){
                l.type = TokenSymbol;
                l.byte_length = 4;
                l.token_length = 4;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 40){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 98){
        if(4==compare(data,l.byte_offset +1,72,4)){
            l.type = TokenSymbol;
            l.byte_length = 5;
            l.token_length = 5;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 114){
        if(5==compare(data,l.byte_offset +1,77,5)){
            l.type = TokenSymbol;
            l.byte_length = 6;
            l.token_length = 6;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 99){
        if(data.input[l.byte_offset + 1] == 108){
            if(data.input[l.byte_offset + 2] == 115){
                l.type = TokenSymbol;
                l.byte_length = 3;
                l.token_length = 3;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 1;
            }
        } else if(data.input[l.byte_offset + 1] == 111){
            if(6==compare(data,l.byte_offset +2,40,6)){
                l.type = TokenSymbol;
                l.byte_length = 8;
                l.token_length = 8;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 108){
        if(3==compare(data,l.byte_offset +1,63,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 123){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 41){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 59){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 93){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 58){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 101){
        if(3==compare(data,l.byte_offset +1,128,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 125){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 44){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 115){
        if(2==compare(data,l.byte_offset +1,47,2)){
            l.type = TokenSymbol;
            l.byte_length = 3;
            l.token_length = 3;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 95){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 36){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 61){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 2;
    } else if(data.input[l.byte_offset + 0] == 91){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 2;
    } else if(data.input[l.byte_offset + 0] == 60){
        if(3==compare(data,l.byte_offset +1,20,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            return 2;
        }
    }
    if(l.isUniID(data)){
        return 1;
    } else if(l.END(data)){
        return 2;
    } else if(l.isSym(true,data)){
        return 2;
    }
}
function sym_map_c889cd6dda6b71c6(l,data){
    if(data.input[l.byte_offset + 0] == 93){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 58){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 59){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 41){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 101){
        if(3==compare(data,l.byte_offset +1,128,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 110){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        } else if(data.input[l.byte_offset + 1] == 102){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        } else if(data.input[l.byte_offset + 1] == 109){
            if(4==compare(data,l.byte_offset +2,30,4)){
                l.type = TokenSymbol;
                l.byte_length = 6;
                l.token_length = 6;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 125){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 44){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 115){
        if(2==compare(data,l.byte_offset +1,47,2)){
            l.type = TokenSymbol;
            l.byte_length = 3;
            l.token_length = 3;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 99){
        if(data.input[l.byte_offset + 1] == 108){
            if(data.input[l.byte_offset + 2] == 115){
                l.type = TokenSymbol;
                l.byte_length = 3;
                l.token_length = 3;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 0;
            }
        } else if(data.input[l.byte_offset + 1] == 111){
            if(6==compare(data,l.byte_offset +2,40,6)){
                l.type = TokenSymbol;
                l.byte_length = 8;
                l.token_length = 8;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 110){
        if(data.input[l.byte_offset + 1] == 115){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        } else if(data.input[l.byte_offset + 1] == 117){
            if(2==compare(data,l.byte_offset +2,36,2)){
                l.type = TokenSymbol;
                l.byte_length = 4;
                l.token_length = 4;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 109){
        if(4==compare(data,l.byte_offset +1,67,4)){
            l.type = TokenSymbol;
            l.byte_length = 5;
            l.token_length = 5;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 61){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 48){
        if(data.input[l.byte_offset + 1] == 120){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 1;
        } else if(data.input[l.byte_offset + 1] == 98){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 1;
        } else if(data.input[l.byte_offset + 1] == 111){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 1;
        } else if(data.input[l.byte_offset + 1] == 79){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 34){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 39){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 116){
        if(3==compare(data,l.byte_offset +1,95,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 2;
        } else if(data.input[l.byte_offset + 1] == 97){
            if(3==compare(data,l.byte_offset +2,54,3)){
                l.type = TokenSymbol;
                l.byte_length = 5;
                l.token_length = 5;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 40){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 98){
        if(4==compare(data,l.byte_offset +1,72,4)){
            l.type = TokenSymbol;
            l.byte_length = 5;
            l.token_length = 5;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 114){
        if(5==compare(data,l.byte_offset +1,77,5)){
            l.type = TokenSymbol;
            l.byte_length = 6;
            l.token_length = 6;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 108){
        if(3==compare(data,l.byte_offset +1,63,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 123){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 91){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 2;
    } else if(data.input[l.byte_offset + 0] == 95){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 2;
    } else if(data.input[l.byte_offset + 0] == 36){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 2;
    } else if(data.input[l.byte_offset + 0] == 60){
        if(3==compare(data,l.byte_offset +1,20,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            return 2;
        }
    }
    if(l.isSym(true,data)){
        return 1;
    } else if(l.isNum(data)){
        return 1;
    } else if(l.isUniID(data)){
        return 2;
    }
}
function sym_map_c9c12240e0caee46(l,data){
    if(data.input[l.byte_offset + 0] == 117){
        if(data.input[l.byte_offset + 1] == 105){
            if(2==compare(data,l.byte_offset +2,84,2)){
                l.type = TokenSymbol;
                l.byte_length = 4;
                l.token_length = 4;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 0;
            }
        }
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        if(!l.isDiscrete(data, TokenIdentifier)){
            return 0xFFFFFF;
        }
        return 0;
    } else if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 102){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        } else if(data.input[l.byte_offset + 1] == 110){
            if(data.input[l.byte_offset + 2] == 116){
                l.type = TokenSymbol;
                l.byte_length = 3;
                l.token_length = 3;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 0;
            }
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        } else if(data.input[l.byte_offset + 1] == 109){
            if(4==compare(data,l.byte_offset +2,30,4)){
                l.type = TokenSymbol;
                l.byte_length = 6;
                l.token_length = 6;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 1;
            }
        }
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        if(!l.isDiscrete(data, TokenIdentifier)){
            return 0xFFFFFF;
        }
        return 0;
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        } else if(data.input[l.byte_offset + 1] == 108){
            if(data.input[l.byte_offset + 2] == 116){
                l.type = TokenSymbol;
                l.byte_length = 3;
                l.token_length = 3;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 0;
            }
        } else if(data.input[l.byte_offset + 1] == 97){
            if(3==compare(data,l.byte_offset +2,54,3)){
                l.type = TokenSymbol;
                l.byte_length = 5;
                l.token_length = 5;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 1;
            }
        }
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        if(!l.isDiscrete(data, TokenIdentifier)){
            return 0xFFFFFF;
        }
        return 0;
    } else if(data.input[l.byte_offset + 0] == 115){
        if(data.input[l.byte_offset + 1] == 116){
            if(data.input[l.byte_offset + 2] == 114){
                if(data.input[l.byte_offset + 3] == 105){
                    if(2==compare(data,l.byte_offset +4,50,2)){
                        l.type = TokenSymbol;
                        l.byte_length = 6;
                        l.token_length = 6;
                        if(!l.isDiscrete(data, TokenIdentifier)){
                            return 0xFFFFFF;
                        }
                        return 0;
                    }
                }
                l.type = TokenSymbol;
                l.byte_length = 3;
                l.token_length = 3;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 2;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 109){
        if(4==compare(data,l.byte_offset +1,67,4)){
            l.type = TokenSymbol;
            l.byte_length = 5;
            l.token_length = 5;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 61){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 91){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 48){
        if(data.input[l.byte_offset + 1] == 120){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 1;
        } else if(data.input[l.byte_offset + 1] == 98){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 1;
        } else if(data.input[l.byte_offset + 1] == 111){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 1;
        } else if(data.input[l.byte_offset + 1] == 79){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 34){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 39){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 116){
        if(3==compare(data,l.byte_offset +1,95,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 110){
        if(data.input[l.byte_offset + 1] == 115){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        } else if(data.input[l.byte_offset + 1] == 117){
            if(2==compare(data,l.byte_offset +2,36,2)){
                l.type = TokenSymbol;
                l.byte_length = 4;
                l.token_length = 4;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 60){
        if(3==compare(data,l.byte_offset +1,20,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 40){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 98){
        if(4==compare(data,l.byte_offset +1,72,4)){
            l.type = TokenSymbol;
            l.byte_length = 5;
            l.token_length = 5;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 114){
        if(5==compare(data,l.byte_offset +1,77,5)){
            l.type = TokenSymbol;
            l.byte_length = 6;
            l.token_length = 6;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 99){
        if(data.input[l.byte_offset + 1] == 108){
            if(data.input[l.byte_offset + 2] == 115){
                l.type = TokenSymbol;
                l.byte_length = 3;
                l.token_length = 3;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 1;
            }
        } else if(data.input[l.byte_offset + 1] == 111){
            if(6==compare(data,l.byte_offset +2,40,6)){
                l.type = TokenSymbol;
                l.byte_length = 8;
                l.token_length = 8;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 108){
        if(3==compare(data,l.byte_offset +1,63,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 123){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 41){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 59){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 93){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 58){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 101){
        if(3==compare(data,l.byte_offset +1,128,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 125){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 44){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 95){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 2;
    } else if(data.input[l.byte_offset + 0] == 36){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 2;
    }
    if(l.isSym(true,data)){
        return 1;
    } else if(l.isNum(data)){
        return 1;
    } else if(l.isUniID(data)){
        return 2;
    }
}
function sym_map_e18247bca4934e42(l,data){
    if(data.input[l.byte_offset + 0] == 58){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 101){
        if(3==compare(data,l.byte_offset +1,128,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 41){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 59){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 93){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 125){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 44){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 110){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        } else if(data.input[l.byte_offset + 1] == 102){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 2;
        } else if(data.input[l.byte_offset + 1] == 109){
            if(4==compare(data,l.byte_offset +2,30,4)){
                l.type = TokenSymbol;
                l.byte_length = 6;
                l.token_length = 6;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 115){
        if(2==compare(data,l.byte_offset +1,47,2)){
            l.type = TokenSymbol;
            l.byte_length = 3;
            l.token_length = 3;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 99){
        if(data.input[l.byte_offset + 1] == 108){
            if(data.input[l.byte_offset + 2] == 115){
                l.type = TokenSymbol;
                l.byte_length = 3;
                l.token_length = 3;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 0;
            }
        } else if(data.input[l.byte_offset + 1] == 111){
            if(6==compare(data,l.byte_offset +2,40,6)){
                l.type = TokenSymbol;
                l.byte_length = 8;
                l.token_length = 8;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 2;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 110){
        if(data.input[l.byte_offset + 1] == 115){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        } else if(data.input[l.byte_offset + 1] == 117){
            if(2==compare(data,l.byte_offset +2,36,2)){
                l.type = TokenSymbol;
                l.byte_length = 4;
                l.token_length = 4;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 2;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 60){
        if(3==compare(data,l.byte_offset +1,20,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        } else if(data.input[l.byte_offset + 1] == 97){
            if(3==compare(data,l.byte_offset +2,54,3)){
                l.type = TokenSymbol;
                l.byte_length = 5;
                l.token_length = 5;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 2;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 95){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 36){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 91){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 123){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 2;
    } else if(data.input[l.byte_offset + 0] == 109){
        if(4==compare(data,l.byte_offset +1,67,4)){
            l.type = TokenSymbol;
            l.byte_length = 5;
            l.token_length = 5;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 2;
        }
    } else if(data.input[l.byte_offset + 0] == 98){
        if(4==compare(data,l.byte_offset +1,72,4)){
            l.type = TokenSymbol;
            l.byte_length = 5;
            l.token_length = 5;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 2;
        }
    } else if(data.input[l.byte_offset + 0] == 114){
        if(5==compare(data,l.byte_offset +1,77,5)){
            l.type = TokenSymbol;
            l.byte_length = 6;
            l.token_length = 6;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 2;
        }
    } else if(data.input[l.byte_offset + 0] == 108){
        if(3==compare(data,l.byte_offset +1,63,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 2;
        }
    } else if(data.input[l.byte_offset + 0] == 61){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 2;
    } else if(data.input[l.byte_offset + 0] == 40){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 2;
    } else if(data.input[l.byte_offset + 0] == 34){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 2;
    } else if(data.input[l.byte_offset + 0] == 39){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 2;
    } else if(data.input[l.byte_offset + 0] == 116){
        if(3==compare(data,l.byte_offset +1,95,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 2;
        }
    } else if(data.input[l.byte_offset + 0] == 48){
        if(data.input[l.byte_offset + 1] == 120){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 2;
        } else if(data.input[l.byte_offset + 1] == 98){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 2;
        } else if(data.input[l.byte_offset + 1] == 111){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 2;
        } else if(data.input[l.byte_offset + 1] == 79){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 2;
        }
    }
    if(l.isUniID(data)){
        return 1;
    } else if(l.isSym(true,data)){
        return 2;
    } else if(l.isNum(data)){
        return 2;
    }
}
function sym_map_f296a22137236439(l,data){
    if(data.input[l.byte_offset + 0] == 60){
        if(3==compare(data,l.byte_offset +1,20,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 40){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 123){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 2;
    } else if(data.input[l.byte_offset + 0] == 34){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 3;
    } else if(data.input[l.byte_offset + 0] == 39){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 3;
    } else if(data.input[l.byte_offset + 0] == 48){
        if(data.input[l.byte_offset + 1] == 120){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 4;
        } else if(data.input[l.byte_offset + 1] == 98){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 4;
        } else if(data.input[l.byte_offset + 1] == 111){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 4;
        } else if(data.input[l.byte_offset + 1] == 79){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 4;
        }
    } else if(data.input[l.byte_offset + 0] == 61){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 5;
    } else if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 102){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 6;
        }
    } else if(data.input[l.byte_offset + 0] == 109){
        if(4==compare(data,l.byte_offset +1,67,4)){
            l.type = TokenSymbol;
            l.byte_length = 5;
            l.token_length = 5;
            return 7;
        }
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            return 8;
        } else if(data.input[l.byte_offset + 1] == 97){
            if(3==compare(data,l.byte_offset +2,54,3)){
                l.type = TokenSymbol;
                l.byte_length = 5;
                l.token_length = 5;
                return 13;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 98){
        if(4==compare(data,l.byte_offset +1,72,4)){
            l.type = TokenSymbol;
            l.byte_length = 5;
            l.token_length = 5;
            return 9;
        }
    } else if(data.input[l.byte_offset + 0] == 114){
        if(5==compare(data,l.byte_offset +1,77,5)){
            l.type = TokenSymbol;
            l.byte_length = 6;
            l.token_length = 6;
            return 10;
        }
    } else if(data.input[l.byte_offset + 0] == 99){
        if(7==compare(data,l.byte_offset +1,39,7)){
            l.type = TokenSymbol;
            l.byte_length = 8;
            l.token_length = 8;
            return 11;
        }
    } else if(data.input[l.byte_offset + 0] == 108){
        if(3==compare(data,l.byte_offset +1,63,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            return 12;
        }
    } else if(data.input[l.byte_offset + 0] == 116){
        if(3==compare(data,l.byte_offset +1,95,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            return 13;
        }
    } else if(data.input[l.byte_offset + 0] == 110){
        if(3==compare(data,l.byte_offset +1,35,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            return 13;
        }
    }
    if(l.isNum(data)){
        return 4;
    } else if(l.isSym(true,data)){
        return 5;
    }
}
function sym_map_faa21e6586619fc7(l,data){
    if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 102){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        } else if(data.input[l.byte_offset + 1] == 110){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        } else if(data.input[l.byte_offset + 1] == 109){
            if(4==compare(data,l.byte_offset +2,30,4)){
                l.type = TokenSymbol;
                l.byte_length = 6;
                l.token_length = 6;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 109){
        if(4==compare(data,l.byte_offset +1,67,4)){
            l.type = TokenSymbol;
            l.byte_length = 5;
            l.token_length = 5;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 116){
        if(3==compare(data,l.byte_offset +1,95,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 2;
        } else if(data.input[l.byte_offset + 1] == 97){
            if(3==compare(data,l.byte_offset +2,54,3)){
                l.type = TokenSymbol;
                l.byte_length = 5;
                l.token_length = 5;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 110){
        if(data.input[l.byte_offset + 1] == 115){
            l.type = TokenSymbol;
            l.byte_length = 2;
            l.token_length = 2;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        } else if(data.input[l.byte_offset + 1] == 117){
            if(2==compare(data,l.byte_offset +2,36,2)){
                l.type = TokenSymbol;
                l.byte_length = 4;
                l.token_length = 4;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 40){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 98){
        if(4==compare(data,l.byte_offset +1,72,4)){
            l.type = TokenSymbol;
            l.byte_length = 5;
            l.token_length = 5;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 114){
        if(5==compare(data,l.byte_offset +1,77,5)){
            l.type = TokenSymbol;
            l.byte_length = 6;
            l.token_length = 6;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 99){
        if(data.input[l.byte_offset + 1] == 108){
            if(data.input[l.byte_offset + 2] == 115){
                l.type = TokenSymbol;
                l.byte_length = 3;
                l.token_length = 3;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 1;
            }
        } else if(data.input[l.byte_offset + 1] == 111){
            if(6==compare(data,l.byte_offset +2,40,6)){
                l.type = TokenSymbol;
                l.byte_length = 8;
                l.token_length = 8;
                if(!l.isDiscrete(data, TokenIdentifier)){
                    return 0xFFFFFF;
                }
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 108){
        if(3==compare(data,l.byte_offset +1,63,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 123){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 0;
    } else if(data.input[l.byte_offset + 0] == 59){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 125){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 41){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 44){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 93){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 101){
        if(3==compare(data,l.byte_offset +1,128,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 58){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 115){
        if(2==compare(data,l.byte_offset +1,47,2)){
            l.type = TokenSymbol;
            l.byte_length = 3;
            l.token_length = 3;
            if(!l.isDiscrete(data, TokenIdentifier)){
                return 0xFFFFFF;
            }
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 95){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 36){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 1;
    } else if(data.input[l.byte_offset + 0] == 61){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 2;
    } else if(data.input[l.byte_offset + 0] == 91){
        l.type = TokenSymbol;
        l.byte_length = 1;
        l.token_length = 1;
        return 2;
    } else if(data.input[l.byte_offset + 0] == 60){
        if(3==compare(data,l.byte_offset +1,20,3)){
            l.type = TokenSymbol;
            l.byte_length = 4;
            l.token_length = 4;
            return 2;
        }
    }
    if(l.isUniID(data)){
        return 1;
    } else if(l.END(data)){
        return 2;
    } else if(l.isSym(true,data)){
        return 2;
    }
}
function tk_0f3d9e998d4e8303(l,data){
    if(cmpr_set(l,data,113,2,2)){
                        
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
function tk_14644998c4b8d451(l,data){
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
function tk_5b3ed459478d3672(l,data){
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
function tk_61a31e0cd3675f53(l,data){
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
function tk_896177e00f155ef3(l,data){
    if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
                        
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
function tk_8fcdaaaa197aa76f(l,data){
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
function tk_b838139d0d011665(l,data){
    if(dt_6ae31dd85a62ef5c(l,data)||l.isNum(data)){
                        
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
function tk_e216f7e76b2d5e60(l,data){
    if(dt_1f145d506cf02379(l,data)){
                        
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
function tk_f545b90791fd2d3f(l,data){
    if(cmpr_set(l,data,26,2,2)){
                        
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
function tk_f70d460017f6375f(l,data){
    if((l.current_byte==34/*["]*/)||(l.current_byte==39/*[']*/)){
                        
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
            compile time: 10.842ms*/;
function $skribble(l,data,state){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    pushFN(data,branch_0fdc5c5b577f7e48);
    pushFN(data,$module);
    return 0;
    return -1;
}
/*production name: module_group_02_100
            grammar index: 1
            bodies:
	1:1 module_group_02_100=>• statements - 
            compile time: 10.926ms*/;
function $module_group_02_100(l,data,state){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    pushFN(data,branch_e6ca468c39009342);
    pushFN(data,$statements);
    return 0;
    return -1;
}
/*production name: module
            grammar index: 3
            bodies:
	3:4 module=>• module module_group_02_100 - 
		3:5 module=>• module_group_02_100 - 
            compile time: 25.389ms*/;
function $module(l,data,state){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    pushFN(data,branch_bbaaf5e2ac261f99);
    pushFN(data,$statements);
    return 0;
    return -1;
}
function $module_goto(l,data,state,prod){
    while(1){
        /*[3]*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if((cmpr_set(l,data,19,4,4)||assert_ascii(l,0x0,0x10,0x88000000,0x0))||l.isUniID(data)){
            /*
               3:4 module=>module • module_group_02_100
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_f294346e45fb95b8);
            pushFN(data,$statements);
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
            compile time: 869.583ms*/;
function $statements(l,data,state){
    switch(sym_map_6308103595c2139f(l,data)){
        case 0:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_28c5dc3955a9ede3);
            pushFN(data,$modifier_list);
            return 0;
        case 1:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_9326ced0ea767996);
            pushFN(data,$template);
            return 0;
        case 2:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_29bbdf58183bc8d7);
            pushFN(data,$import);
            return 0;
        case 3:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_29bbdf58183bc8d7);
            pushFN(data,$class);
            return 0;
        case 4:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_29bbdf58183bc8d7);
            pushFN(data,$struct);
            return 0;
        case 5:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_29bbdf58183bc8d7);
            pushFN(data,$function);
            return 0;
        case 6:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_29bbdf58183bc8d7);
            pushFN(data,$namespace);
            return 0;
        case 7:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_29bbdf58183bc8d7);
            pushFN(data,$primitive_declaration);
            return 0;
        default:
            break;
    }
    return -1;
}
function $statements_goto(l,data,state,prod){
    /*[4]*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(cmpr_set(l,data,121,3,3)){
        /*
           11:24 class=>modifier_list • cls identifier class_group_113_103 { class_HC_listbody1_105 }
           11:26 class=>modifier_list • cls identifier { class_HC_listbody1_105 }
           11:27 class=>modifier_list • cls identifier class_group_113_103 { }
           11:30 class=>modifier_list • cls identifier { }
        */
        /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_a88e40286a4a7bea);
        pushFN(data,$identifier);
        return 0;
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    } else if(cmpr_set(l,data,46,3,3)){
        /*
           12:32 struct=>modifier_list • str identifier { parameters }
           12:34 struct=>modifier_list • str identifier { }
        */
        /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_cceb33b8a550bfef);
        pushFN(data,$identifier);
        return 0;
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    } else if(cmpr_set(l,data,143,2,2)){
        /*
           13:36 function=>modifier_list • fn identifier : type ( parameters ) { expression_statements }
           13:38 function=>modifier_list • fn identifier : type ( ) { expression_statements }
           13:39 function=>modifier_list • fn identifier : type ( parameters ) { }
           13:42 function=>modifier_list • fn identifier : type ( ) { }
        */
        /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_a361b6ba667a3ff7);
        pushFN(data,$identifier);
        return 0;
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
        /*
           43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
           43:127 primitive_declaration=>modifier_list • identifier : type
        */
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_f92291714d6350ed);
        pushFN(data,$identifier);
        return 0;
    }
    return prod == 4 ? prod : -1;
}
/*production name: import
            grammar index: 5
            bodies:
	5:13 import=>• import tk:string - 
            compile time: 17.932ms*/;
function $import(l,data,state){
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(cmpr_set(l,data,28,6,6)){
        /*
           5:13 import=>import • tk:string
        */
        consume(l,data,state);
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        if(tk_f70d460017f6375f(l,data)&&consume(l,data,state)){
            add_reduce(state,data,2,0);
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
            compile time: 35.987ms*/;
function $namespace_HC_listbody3_102(l,data,state){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    pushFN(data,branch_cc9e8eab54dacbec);
    pushFN(data,$statements);
    return 0;
    return -1;
}
function $namespace_HC_listbody3_102_goto(l,data,state,prod){
    /*[6]*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if((cmpr_set(l,data,19,4,4)||assert_ascii(l,0x0,0x10,0x88000000,0x0))||l.isUniID(data)){
        /*
           6:14 namespace_HC_listbody3_102=>namespace_HC_listbody3_102 • statements
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_242856005a2da596);
        pushFN(data,$statements);
        return 0;
    }
    return prod == 6 ? prod : -1;
}
/*production name: namespace
            grammar index: 7
            bodies:
	7:16 namespace=>• ns identifier { namespace_HC_listbody3_102 } - 
		7:17 namespace=>• ns identifier { } - 
            compile time: 34.881ms*/;
function $namespace(l,data,state){
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(cmpr_set(l,data,119,2,2)){
        /*
           7:16 namespace=>ns • identifier { namespace_HC_listbody3_102 }
           7:17 namespace=>ns • identifier { }
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_9fea2735762a3227);
        pushFN(data,$identifier);
        return 0;
    }
    return -1;
}
/*production name: class_group_113_103
            grammar index: 8
            bodies:
	8:18 class_group_113_103=>• is θid - 
            compile time: 18.405ms*/;
function $class_group_113_103(l,data,state){
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(cmpr_set(l,data,140,2,2)){
        /*
           8:18 class_group_113_103=>is • θid
        */
        consume(l,data,state);
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        if(l.isUniID(data)&&consume(l,data,state)){
            add_reduce(state,data,2,0);
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
            compile time: 780.376ms*/;
function $class_group_016_104(l,data,state){
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    if(l.current_byte==91/*[[]*/){
        /*
           50:143 modifier_list=>• [ modifier_list_HC_listbody1_120 ]
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_7a8be2c54a4d26e4);
        pushFN(data,$modifier_list);
        return 0;
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(cmpr_set(l,data,46,3,3)){
        /*
           9:19 class_group_016_104=>• struct
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_fc3089e8ba238415);
        pushFN(data,$struct);
        return 0;
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(cmpr_set(l,data,143,2,2)){
        /*
           9:21 class_group_016_104=>• function
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_fc3089e8ba238415);
        pushFN(data,$function);
        return 0;
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else {
        /*
           9:20 class_group_016_104=>• primitive_declaration
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_fc3089e8ba238415);
        pushFN(data,$primitive_declaration);
        return 0;
    }
    return -1;
}
function $class_group_016_104_goto(l,data,state,prod){
    /*[9]*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(cmpr_set(l,data,46,3,3)){
        /*
           12:32 struct=>modifier_list • str identifier { parameters }
           12:34 struct=>modifier_list • str identifier { }
        */
        /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_9fe340c77d37e69a);
        pushFN(data,$identifier);
        return 0;
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    } else if(cmpr_set(l,data,143,2,2)){
        /*
           13:36 function=>modifier_list • fn identifier : type ( parameters ) { expression_statements }
           13:38 function=>modifier_list • fn identifier : type ( ) { expression_statements }
           13:39 function=>modifier_list • fn identifier : type ( parameters ) { }
           13:42 function=>modifier_list • fn identifier : type ( ) { }
        */
        /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_0a448c75b1ecf242);
        pushFN(data,$identifier);
        return 0;
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
        /*
           43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
           43:127 primitive_declaration=>modifier_list • identifier : type
        */
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_036ea9fff19e1e00);
        pushFN(data,$identifier);
        return 0;
    }
    return prod == 9 ? prod : -1;
}
/*production name: class_HC_listbody1_105
            grammar index: 10
            bodies:
	10:22 class_HC_listbody1_105=>• class_HC_listbody1_105 class_group_016_104 - 
		10:23 class_HC_listbody1_105=>• class_group_016_104 - 
            compile time: 312.475ms*/;
function $class_HC_listbody1_105(l,data,state){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    pushFN(data,branch_7e5b06e2e73c7ad3);
    pushFN(data,$class_group_016_104);
    return 0;
    return -1;
}
function $class_HC_listbody1_105_goto(l,data,state,prod){
    /*[10]*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(assert_ascii(l,0x0,0x10,0x88000000,0x0)||l.isUniID(data)){
        /*
           10:22 class_HC_listbody1_105=>class_HC_listbody1_105 • class_group_016_104
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_71ffa1e91e4c72ff);
        pushFN(data,$class_group_016_104);
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
            compile time: 238.894ms*/;
function $class(l,data,state){
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==91/*[[]*/){
        /*
           11:24 class=>• modifier_list cls identifier class_group_113_103 { class_HC_listbody1_105 }
           11:26 class=>• modifier_list cls identifier { class_HC_listbody1_105 }
           11:27 class=>• modifier_list cls identifier class_group_113_103 { }
           11:30 class=>• modifier_list cls identifier { }
        */
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_039604f80d45143d);
        pushFN(data,$modifier_list);
        return 0;
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    } else {
        /*
           11:25 class=>• cls identifier class_group_113_103 { class_HC_listbody1_105 }
           11:28 class=>• cls identifier { class_HC_listbody1_105 }
           11:29 class=>• cls identifier class_group_113_103 { }
           11:31 class=>• cls identifier { }
        */
        /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_8fad89624a9aa97d);
        pushFN(data,$identifier);
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
            compile time: 246.736ms*/;
function $struct(l,data,state){
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==91/*[[]*/){
        /*
           12:32 struct=>• modifier_list str identifier { parameters }
           12:34 struct=>• modifier_list str identifier { }
        */
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_dc001ff53e1cedd2);
        pushFN(data,$modifier_list);
        return 0;
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    } else {
        /*
           12:33 struct=>• str identifier { parameters }
           12:35 struct=>• str identifier { }
        */
        /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_fc940c1dec3689bf);
        pushFN(data,$identifier);
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
            compile time: 813.178ms*/;
function $function(l,data,state){
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==91/*[[]*/){
        /*
           13:36 function=>• modifier_list fn identifier : type ( parameters ) { expression_statements }
           13:38 function=>• modifier_list fn identifier : type ( ) { expression_statements }
           13:39 function=>• modifier_list fn identifier : type ( parameters ) { }
           13:42 function=>• modifier_list fn identifier : type ( ) { }
        */
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_ae5da528e918ff49);
        pushFN(data,$modifier_list);
        return 0;
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    } else {
        /*
           13:37 function=>• fn identifier : type ( parameters ) { expression_statements }
           13:40 function=>• fn identifier : type ( ) { expression_statements }
           13:41 function=>• fn identifier : type ( parameters ) { }
           13:43 function=>• fn identifier : type ( ) { }
        */
        /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_43f5323ae3031eba);
        pushFN(data,$identifier);
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
            compile time: 880.801ms*/;
function $function_expression(l,data,state){
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==91/*[[]*/){
        /*
           14:44 function_expression=>• modifier_list fn : type ( parameters ) { expression_statements }
           14:46 function_expression=>• modifier_list fn : type ( ) { expression_statements }
           14:47 function_expression=>• modifier_list fn : type ( parameters ) { }
           14:50 function_expression=>• modifier_list fn : type ( ) { }
        */
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_dd48f7fc4430872e);
        pushFN(data,$modifier_list);
        return 0;
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    } else {
        /*
           14:45 function_expression=>• fn : type ( parameters ) { expression_statements }
           14:48 function_expression=>• fn : type ( ) { expression_statements }
           14:49 function_expression=>• fn : type ( parameters ) { }
           14:51 function_expression=>• fn : type ( ) { }
        */
        /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if(l.current_byte==58/*[:]*/){
            /*
               14:45 function_expression=>fn : • type ( parameters ) { expression_statements }
               14:48 function_expression=>fn : • type ( ) { expression_statements }
               14:49 function_expression=>fn : • type ( parameters ) { }
               14:51 function_expression=>fn : • type ( ) { }
            */
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_341cac8b072a369a);
            pushFN(data,$type);
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
            compile time: 741.852ms*/;
function $parameters(l,data,state){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    pushFN(data,branch_1f0e8a0854632fda);
    pushFN(data,$primitive_declaration);
    return 0;
    return -1;
}
function $parameters_goto(l,data,state,prod){
    /*[16]*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(l.current_byte==44/*[,]*/){
        /*
           16:54 parameters=>parameters • , primitive_declaration
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_b16f5597ded685c8);
        pushFN(data,$primitive_declaration);
        return 0;
    }
    return prod == 16 ? prod : -1;
}
/*production name: expression_statements_HC_listbody1_107
            grammar index: 17
            bodies:
	17:56 expression_statements_HC_listbody1_107=>• expression_statements_HC_listbody1_107 ; - 
		17:57 expression_statements_HC_listbody1_107=>• ; - 
            compile time: 228.46ms*/;
function $expression_statements_HC_listbody1_107(l,data,state){
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==59/*[;]*/){
        /*
           17:57 expression_statements_HC_listbody1_107=>; •
        */
        consume(l,data,state);
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        add_reduce(state,data,1,3);
        pushFN(data,$expression_statements_HC_listbody1_107_goto);
        return 17;
    }
    return -1;
}
function $expression_statements_HC_listbody1_107_goto(l,data,state,prod){
    while(1){
        /*[17]*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        if(l.current_byte==125/*[}]*/){
            return 17;
        }
        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
        if(l.current_byte==59/*[;]*/){
            /*
               17:56 expression_statements_HC_listbody1_107=>expression_statements_HC_listbody1_107 • ;
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
            consume(l,data,state);
            add_reduce(state,data,2,2);
            pushFN(data,$expression_statements_HC_listbody1_107_goto);
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
            compile time: 3036.245ms*/;
function $expression_statements_group_023_108(l,data,state){
    switch(sym_map_aaf5d00b8db9faac(l,data)){
        case 0:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_bd41394530f64266);
            pushFN(data,$expression);
            return 0;
        case 1:
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if(l.current_byte==91/*[[]*/){
                /*
                   50:143 modifier_list=>• [ modifier_list_HC_listbody1_120 ]
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                pushFN(data,branch_6daab6971c75715b);
                pushFN(data,$modifier_list);
                return 0;
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   44:129 identifier=>• tk:identifier_token
                */
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_11d890e1265c30e7);
                pushFN(data,$identifier);
                return 0;
            }
        default:
            break;
    }
    return -1;
}
function $expression_statements_group_023_108_goto(l,data,state,prod){
    while(1){
        /*[37] [18] [26] [18] [28] [37] [26] [18] [18] [26]*/
        switch(prod){
            case 26:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                if(!((l.current_byte==61/*[=]*/)||l.isSym(true,data))||(cmpr_set(l,data,19,4,4)||assert_ascii(l,0x0,0xc001210,0xa8000000,0x20000000))){
                    /*
                       25:82 binary_expression=>unary_expression •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    return 18;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if((l.current_byte==61/*[=]*/)||l.isSym(true,data)){
                    /*
                       25:80 binary_expression=>unary_expression • operator
                       25:81 binary_expression=>unary_expression • operator expression
                    */
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                    pushFN(data,branch_03805b72892b5f19);
                    pushFN(data,$operator);
                    return 0;
                }
                break;
            case 28:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(l.current_byte==61/*[=]*/){
                    /*
                       22:76 assignment_expression=>left_hand_expression • = expression
                       27:85 unary_value=>left_hand_expression •
                    */
                    let pk = l.copy();
                    skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    if((((dt_6ae31dd85a62ef5c(pk,data)||cmpr_set(pk,data,19,4,4))||assert_ascii(pk,0x0,0x20000194,0x88000000,0x8000000))||pk.isUniID(data))||pk.isNum(data)){
                        /*
                           22:76 assignment_expression=>left_hand_expression • = expression
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        pushFN(data,branch_5e20402ff8e2ff2f);
                        pushFN(data,$expression);
                        return 0;
                        /*⤋⤋⤋ peek-unresolved ⤋⤋⤋*/
                    } else {
                        /*
                           22:76 assignment_expression=>left_hand_expression • = expression
                           27:85 unary_value=>left_hand_expression •
                        */
                        /*-------------VPROD-------------------------*/
                        pushFN(data,branch_ac215d0e3b47a515);
                        return 0;
                    }
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                } else {
                    /*
                       27:85 unary_value=>left_hand_expression •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    prod = 26;
                    continue;;
                }
                break;
            case 37:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(l.current_byte==91/*[[]*/){
                    /*
                       28:91 left_hand_expression=>member_expression •
                       37:116 member_expression=>member_expression • [ expression ]
                    */
                    let pk = l.copy();
                    skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    if(!(((((dt_6ae31dd85a62ef5c(pk,data)||cmpr_set(pk,data,19,4,4))||assert_ascii(pk,0x0,0x20000194,0x88000000,0x8000000))||pk.isUniID(data))||pk.isNum(data))||pk.isSym(true,data))||(((dt_a0570d6d5c8952c6(pk,data)||cmpr_set(pk,data,56,6,6))||cmpr_set(pk,data,116,3,3))||cmpr_set(pk,data,115,4,4))){
                        /*
                           28:91 left_hand_expression=>member_expression •
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        prod = 28;
                        continue;;
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    } else if(((((((((((((cmpr_set(pk,data,142,2,2)||cmpr_set(pk,data,66,5,5))||dt_bcea2102060eab13(pk,data))||dt_6ae31dd85a62ef5c(pk,data))||cmpr_set(pk,data,94,4,4))||cmpr_set(pk,data,34,4,4))||cmpr_set(pk,data,19,4,4))||cmpr_set(pk,data,71,5,5))||cmpr_set(pk,data,76,6,6))||cmpr_set(pk,data,38,8,8))||cmpr_set(pk,data,62,4,4))||assert_ascii(pk,0x0,0x20000194,0x88000000,0x8000000))||pk.isNum(data))||pk.isSym(true,data)){
                        /*
                           37:116 member_expression=>member_expression • [ expression ]
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        pushFN(data,branch_898554f87ba1478b);
                        pushFN(data,$expression);
                        return 0;
                        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                    } else {
                        /*
                           37:116 member_expression=>member_expression • [ expression ]
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        pushFN(data,branch_898554f87ba1478b);
                        pushFN(data,$expression);
                        return 0;
                    }
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                } else if(l.current_byte==46/*[.]*/){
                    /*
                       37:115 member_expression=>member_expression • . identifier
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    consume(l,data,state);
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                    pushFN(data,branch_844dc852f21c4995);
                    pushFN(data,$identifier);
                    return 0;
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                } else if(l.current_byte==40/*[(]*/){
                    /*
                       36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                       36:114 call_expression=>member_expression • ( )
                    */
                    let pk = l.copy();
                    skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    if(pk.current_byte==41/*[)]*/){
                        /*
                           36:114 call_expression=>member_expression • ( )
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
                            add_reduce(state,data,3,64);
                            pushFN(data,$expression_statements_group_023_108_goto);
                            return 26;
                        }
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    } else {
                        /*
                           36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        pushFN(data,branch_9c0cdd675efd2996);
                        pushFN(data,$call_expression_HC_listbody2_114);
                        return 0;
                    }
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                } else {
                    /*
                       28:91 left_hand_expression=>member_expression •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    prod = 28;
                    continue;;
                }
                break;
            case 44:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(l.current_byte==58/*[:]*/){
                    /*
                       37:117 member_expression=>identifier •
                       43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                       43:128 primitive_declaration=>identifier • : type
                    */
                    let pk = l.copy();
                    skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
                    switch(sym_map_2ce6da43b14e1682(pk,data)){
                        case 0:
                            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                            consume(l,data,state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                            pushFN(data,branch_3fe26e3198c2d658);
                            pushFN(data,$type);
                            return 0;
                        default:
                        case 1:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                            add_reduce(state,data,1,67);
                            prod = 37;
                            continue;;
                        case 2:
                            /*-------------VPROD-------------------------*/
                            pushFN(data,branch_192d4c70bbc2c906);
                            return 0;
                    }
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                } else {
                    /*
                       37:117 member_expression=>identifier •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    add_reduce(state,data,1,67);
                    prod = 37;
                    continue;;
                }
                break;
            case 50:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(cmpr_set(l,data,143,2,2)){
                    /*
                       14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
                       14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
                       14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
                       14:50 function_expression=>modifier_list • fn : type ( ) { }
                    */
                    /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                    consume(l,data,state);
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                    if(l.current_byte==58/*[:]*/){
                        /*
                           14:44 function_expression=>modifier_list fn : • type ( parameters ) { expression_statements }
                           14:46 function_expression=>modifier_list fn : • type ( ) { expression_statements }
                           14:47 function_expression=>modifier_list fn : • type ( parameters ) { }
                           14:50 function_expression=>modifier_list fn : • type ( ) { }
                        */
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        pushFN(data,branch_2d42a0ce2f6d106e);
                        pushFN(data,$type);
                        return 0;
                    }
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
                    /*
                       43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
                       43:127 primitive_declaration=>modifier_list • identifier : type
                    */
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                    pushFN(data,branch_41d65d377ff9ca0a);
                    pushFN(data,$identifier);
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
            compile time: 20.356ms*/;
function $expression_statements_group_124_109(l,data,state){
    pushFN(data,branch_7afd9b02530fef2e);
    pushFN(data,$expression_statements_HC_listbody1_107);
    return 0;
    return -1;
}
/*production name: expression_statements
            grammar index: 20
            bodies:
	20:62 expression_statements=>• expression_statements expression_statements_group_124_109 - 
		20:63 expression_statements=>• expression - 
		20:64 expression_statements=>• primitive_declaration - 
            compile time: 3994.863ms*/;
function $expression_statements(l,data,state){
    switch(sym_map_aaf5d00b8db9faac(l,data)){
        case 0:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_dd5c1e4a566fe3e5);
            pushFN(data,$expression);
            return 0;
        case 1:
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if(l.current_byte==91/*[[]*/){
                /*
                   50:143 modifier_list=>• [ modifier_list_HC_listbody1_120 ]
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                pushFN(data,branch_c0e3727d9ff912b9);
                pushFN(data,$modifier_list);
                return 0;
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   44:129 identifier=>• tk:identifier_token
                */
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_97946dd38e34dd15);
                pushFN(data,$identifier);
                return 0;
            }
        default:
            break;
    }
    return -1;
}
function $expression_statements_goto(l,data,state,prod){
    while(1){
        /*[20] [37] [20] [26] [20] [28] [37] [26] [20] [20] [26]*/
        switch(prod){
            case 20:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                if(l.current_byte==59/*[;]*/){
                    /*
                       20:62 expression_statements=>expression_statements • expression_statements_group_124_109
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    pushFN(data,branch_f14c9e5173466901);
                    pushFN(data,$expression_statements_group_124_109);
                    return 0;
                }
                break;
            case 26:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                if(!((l.current_byte==61/*[=]*/)||l.isSym(true,data))||(cmpr_set(l,data,19,4,4)||assert_ascii(l,0x0,0xc001210,0xa8000000,0x20000000))){
                    /*
                       25:82 binary_expression=>unary_expression •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    add_reduce(state,data,1,3);
                    return 20;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if((l.current_byte==61/*[=]*/)||l.isSym(true,data)){
                    /*
                       25:80 binary_expression=>unary_expression • operator
                       25:81 binary_expression=>unary_expression • operator expression
                    */
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                    pushFN(data,branch_1e27bcd8c4931847);
                    pushFN(data,$operator);
                    return 0;
                }
                break;
            case 28:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(l.current_byte==61/*[=]*/){
                    /*
                       22:76 assignment_expression=>left_hand_expression • = expression
                       27:85 unary_value=>left_hand_expression •
                    */
                    let pk = l.copy();
                    skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    if((((dt_6ae31dd85a62ef5c(pk,data)||cmpr_set(pk,data,19,4,4))||assert_ascii(pk,0x0,0x20000194,0x88000000,0x8000000))||pk.isUniID(data))||pk.isNum(data)){
                        /*
                           22:76 assignment_expression=>left_hand_expression • = expression
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        pushFN(data,branch_1b02061e2d759869);
                        pushFN(data,$expression);
                        return 0;
                        /*⤋⤋⤋ peek-unresolved ⤋⤋⤋*/
                    } else {
                        /*
                           22:76 assignment_expression=>left_hand_expression • = expression
                           27:85 unary_value=>left_hand_expression •
                        */
                        /*-------------VPROD-------------------------*/
                        pushFN(data,branch_8c9ab25df4a17c06);
                        return 0;
                    }
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                } else {
                    /*
                       27:85 unary_value=>left_hand_expression •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    prod = 26;
                    continue;;
                }
                break;
            case 37:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(l.current_byte==91/*[[]*/){
                    /*
                       28:91 left_hand_expression=>member_expression •
                       37:116 member_expression=>member_expression • [ expression ]
                    */
                    let pk = l.copy();
                    skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    if(!(((((dt_6ae31dd85a62ef5c(pk,data)||cmpr_set(pk,data,19,4,4))||assert_ascii(pk,0x0,0x20000194,0x88000000,0x8000000))||pk.isUniID(data))||pk.isNum(data))||pk.isSym(true,data))||(((dt_a0570d6d5c8952c6(pk,data)||cmpr_set(pk,data,56,6,6))||cmpr_set(pk,data,116,3,3))||cmpr_set(pk,data,115,4,4))){
                        /*
                           28:91 left_hand_expression=>member_expression •
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        prod = 28;
                        continue;;
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    } else if(((((((((((((cmpr_set(pk,data,142,2,2)||cmpr_set(pk,data,66,5,5))||dt_bcea2102060eab13(pk,data))||dt_6ae31dd85a62ef5c(pk,data))||cmpr_set(pk,data,94,4,4))||cmpr_set(pk,data,34,4,4))||cmpr_set(pk,data,19,4,4))||cmpr_set(pk,data,71,5,5))||cmpr_set(pk,data,76,6,6))||cmpr_set(pk,data,38,8,8))||cmpr_set(pk,data,62,4,4))||assert_ascii(pk,0x0,0x20000194,0x88000000,0x8000000))||pk.isNum(data))||pk.isSym(true,data)){
                        /*
                           37:116 member_expression=>member_expression • [ expression ]
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        pushFN(data,branch_d06a5f8a79dc9f69);
                        pushFN(data,$expression);
                        return 0;
                        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                    } else {
                        /*
                           37:116 member_expression=>member_expression • [ expression ]
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        pushFN(data,branch_d06a5f8a79dc9f69);
                        pushFN(data,$expression);
                        return 0;
                    }
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                } else if(l.current_byte==46/*[.]*/){
                    /*
                       37:115 member_expression=>member_expression • . identifier
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    consume(l,data,state);
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                    pushFN(data,branch_747666e752112bf3);
                    pushFN(data,$identifier);
                    return 0;
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                } else if(l.current_byte==40/*[(]*/){
                    /*
                       36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                       36:114 call_expression=>member_expression • ( )
                    */
                    let pk = l.copy();
                    skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    if(pk.current_byte==41/*[)]*/){
                        /*
                           36:114 call_expression=>member_expression • ( )
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
                            add_reduce(state,data,3,64);
                            pushFN(data,$expression_statements_goto);
                            return 26;
                        }
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    } else {
                        /*
                           36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        pushFN(data,branch_6ee66156d2334d5a);
                        pushFN(data,$call_expression_HC_listbody2_114);
                        return 0;
                    }
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                } else {
                    /*
                       28:91 left_hand_expression=>member_expression •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    prod = 28;
                    continue;;
                }
                break;
            case 44:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(l.current_byte==58/*[:]*/){
                    /*
                       43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                       43:128 primitive_declaration=>identifier • : type
                       37:117 member_expression=>identifier •
                    */
                    let pk = l.copy();
                    skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
                    switch(sym_map_2ce6da43b14e1682(pk,data)){
                        case 0:
                            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                            consume(l,data,state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                            pushFN(data,branch_b81c58d52edda0e7);
                            pushFN(data,$type);
                            return 0;
                        default:
                        case 1:
                            /*--LEAF--*/
                            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                            add_reduce(state,data,1,67);
                            prod = 37;
                            continue;;
                        case 2:
                            /*-------------VPROD-------------------------*/
                            pushFN(data,branch_4bc3fe2167c00039);
                            return 0;
                    }
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                } else {
                    /*
                       37:117 member_expression=>identifier •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    add_reduce(state,data,1,67);
                    prod = 37;
                    continue;;
                }
                break;
            case 50:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(cmpr_set(l,data,143,2,2)){
                    /*
                       14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
                       14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
                       14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
                       14:50 function_expression=>modifier_list • fn : type ( ) { }
                    */
                    /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                    consume(l,data,state);
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                    if(l.current_byte==58/*[:]*/){
                        /*
                           14:44 function_expression=>modifier_list fn : • type ( parameters ) { expression_statements }
                           14:46 function_expression=>modifier_list fn : • type ( ) { expression_statements }
                           14:47 function_expression=>modifier_list fn : • type ( parameters ) { }
                           14:50 function_expression=>modifier_list fn : • type ( ) { }
                        */
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        pushFN(data,branch_d62650cd6011d320);
                        pushFN(data,$type);
                        return 0;
                    }
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
                    /*
                       43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
                       43:127 primitive_declaration=>modifier_list • identifier : type
                    */
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                    pushFN(data,branch_6948bbd7e3182d6d);
                    pushFN(data,$identifier);
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
            compile time: 1639.239ms*/;
function $expression(l,data,state){
    switch(sym_map_57db70ddd657b805(l,data)){
        case 0:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_ef2dc6f8b6dc9a12);
            pushFN(data,$template);
            return 0;
        case 1:
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if(l.current_byte==125/*[}]*/){
                /*
                   21:75 expression=>{ • }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                consume(l,data,state);
                add_reduce(state,data,2,41);
                pushFN(data,$expression_goto);
                return 21;
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else {
                /*
                   21:73 expression=>{ • expression_statements }
                */
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                pushFN(data,branch_50f99c46d94b1746);
                pushFN(data,$expression_statements);
                return 0;
            }
        case 2:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_038b1722715d8efb);
            pushFN(data,$if_expression);
            return 0;
        case 3:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_038b1722715d8efb);
            pushFN(data,$match_expression);
            return 0;
        case 4:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_038b1722715d8efb);
            pushFN(data,$break_expression);
            return 0;
        case 5:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_038b1722715d8efb);
            pushFN(data,$return_expression);
            return 0;
        case 6:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_038b1722715d8efb);
            pushFN(data,$continue_expression);
            return 0;
        case 7:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_038b1722715d8efb);
            pushFN(data,$loop_expression);
            return 0;
        case 8:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_ba637a426869287c);
            pushFN(data,$identifier);
            return 0;
        case 9:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_038b1722715d8efb);
            pushFN(data,$binary_expression);
            return 0;
        default:
            break;
    }
    return -1;
}
function $expression_goto(l,data,state,prod){
    while(1){
        /*[28] [37] [26] [26] [21] [21] [26] [21]*/
        switch(prod){
            case 26:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                if(!((l.current_byte==61/*[=]*/)||l.isSym(true,data))||(cmpr_set(l,data,19,4,4)||assert_ascii(l,0x0,0xc001210,0xa8000000,0x20000000))){
                    /*
                       25:82 binary_expression=>unary_expression •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    return 21;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if((l.current_byte==61/*[=]*/)||l.isSym(true,data)){
                    /*
                       25:80 binary_expression=>unary_expression • operator
                       25:81 binary_expression=>unary_expression • operator expression
                    */
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                    pushFN(data,branch_af9fb711723f52aa);
                    pushFN(data,$operator);
                    return 0;
                }
                break;
            case 28:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(l.current_byte==61/*[=]*/){
                    /*
                       22:76 assignment_expression=>left_hand_expression • = expression
                       27:85 unary_value=>left_hand_expression •
                    */
                    let pk = l.copy();
                    skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    if((((dt_6ae31dd85a62ef5c(pk,data)||cmpr_set(pk,data,19,4,4))||assert_ascii(pk,0x0,0x20000194,0x88000000,0x8000000))||pk.isUniID(data))||pk.isNum(data)){
                        /*
                           22:76 assignment_expression=>left_hand_expression • = expression
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        pushFN(data,branch_c24f274588f75184);
                        pushFN(data,$expression);
                        return 0;
                        /*⤋⤋⤋ peek-unresolved ⤋⤋⤋*/
                    } else {
                        /*
                           22:76 assignment_expression=>left_hand_expression • = expression
                           27:85 unary_value=>left_hand_expression •
                        */
                        /*-------------VPROD-------------------------*/
                        pushFN(data,branch_48b0a1358e8d8722);
                        return 0;
                    }
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                } else {
                    /*
                       27:85 unary_value=>left_hand_expression •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    prod = 26;
                    continue;;
                }
                break;
            case 37:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(l.current_byte==91/*[[]*/){
                    /*
                       28:91 left_hand_expression=>member_expression •
                       37:116 member_expression=>member_expression • [ expression ]
                    */
                    let pk = l.copy();
                    skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    if(!(((((dt_6ae31dd85a62ef5c(pk,data)||cmpr_set(pk,data,19,4,4))||assert_ascii(pk,0x0,0x20000194,0x88000000,0x8000000))||pk.isUniID(data))||pk.isNum(data))||pk.isSym(true,data))||(((dt_a0570d6d5c8952c6(pk,data)||cmpr_set(pk,data,56,6,6))||cmpr_set(pk,data,116,3,3))||cmpr_set(pk,data,115,4,4))){
                        /*
                           28:91 left_hand_expression=>member_expression •
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        prod = 28;
                        continue;;
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    } else if(((((((((((((cmpr_set(pk,data,142,2,2)||cmpr_set(pk,data,66,5,5))||dt_bcea2102060eab13(pk,data))||dt_6ae31dd85a62ef5c(pk,data))||cmpr_set(pk,data,94,4,4))||cmpr_set(pk,data,34,4,4))||cmpr_set(pk,data,19,4,4))||cmpr_set(pk,data,71,5,5))||cmpr_set(pk,data,76,6,6))||cmpr_set(pk,data,38,8,8))||cmpr_set(pk,data,62,4,4))||assert_ascii(pk,0x0,0x20000194,0x88000000,0x8000000))||pk.isNum(data))||pk.isSym(true,data)){
                        /*
                           37:116 member_expression=>member_expression • [ expression ]
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        pushFN(data,branch_39fb81d9009bc25d);
                        pushFN(data,$expression);
                        return 0;
                        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                    } else {
                        /*
                           37:116 member_expression=>member_expression • [ expression ]
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        pushFN(data,branch_39fb81d9009bc25d);
                        pushFN(data,$expression);
                        return 0;
                    }
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                } else if(l.current_byte==46/*[.]*/){
                    /*
                       37:115 member_expression=>member_expression • . identifier
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                    consume(l,data,state);
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                    pushFN(data,branch_bb4a0fd4c800480d);
                    pushFN(data,$identifier);
                    return 0;
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                } else if(l.current_byte==40/*[(]*/){
                    /*
                       36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                       36:114 call_expression=>member_expression • ( )
                    */
                    let pk = l.copy();
                    skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    if(pk.current_byte==41/*[)]*/){
                        /*
                           36:114 call_expression=>member_expression • ( )
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
                            add_reduce(state,data,3,64);
                            pushFN(data,$expression_goto);
                            return 26;
                        }
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    } else {
                        /*
                           36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                        */
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        pushFN(data,branch_6e2042fdcddfc65d);
                        pushFN(data,$call_expression_HC_listbody2_114);
                        return 0;
                    }
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                } else {
                    /*
                       28:91 left_hand_expression=>member_expression •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    prod = 28;
                    continue;;
                }
                break;
            case 72:
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                if(!((l.current_byte==61/*[=]*/)||l.isSym(true,data))||((cmpr_set(l,data,19,4,4)||assert_ascii(l,0x0,0xc001200,0x28000000,0x20000000))||l.END(data))){
                    /*
                       21:74 expression=>template •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    add_reduce(state,data,1,40);
                    return 21;
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                } else {
                    /*
                       56:168 value=>template •
                    */
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    add_reduce(state,data,1,86);
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
            compile time: 2.886ms*/;
function $if_expression_group_139_110(l,data,state){
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(cmpr_set(l,data,127,4,4)){
        /*
           23:77 if_expression_group_139_110=>else • expression
        */
        consume(l,data,state);
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_e065d9119934ceb8);
        pushFN(data,$expression);
        return 0;
    }
    return -1;
}
/*production name: if_expression
            grammar index: 24
            bodies:
	24:78 if_expression=>• if expression : expression if_expression_group_139_110 - 
		24:79 if_expression=>• if expression : expression - 
            compile time: 230.5ms*/;
function $if_expression(l,data,state){
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(cmpr_set(l,data,142,2,2)){
        /*
           24:78 if_expression=>if • expression : expression if_expression_group_139_110
           24:79 if_expression=>if • expression : expression
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_80892866db558b25);
        pushFN(data,$expression);
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
            compile time: 562.165ms*/;
function $binary_expression(l,data,state){
    pushFN(data,branch_32fed3b75d1e1c96);
    pushFN(data,$unary_expression);
    return 0;
    return -1;
}
/*production name: unary_expression
            grammar index: 26
            bodies:
	26:83 unary_expression=>• operator unary_value - 
		26:84 unary_expression=>• unary_value - 
            compile time: 5.327ms*/;
function $unary_expression(l,data,state){
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if((((dt_6ae31dd85a62ef5c(l,data)||cmpr_set(l,data,19,4,4))||assert_ascii(l,0x0,0x194,0x88000000,0x0))||l.isUniID(data))||l.isNum(data)){
        /*
           26:84 unary_expression=>• unary_value
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_bf312da1e8e7a614);
        pushFN(data,$unary_value);
        return 0;
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else {
        /*
           26:83 unary_expression=>• operator unary_value
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_7c5044a70fbaa6bb);
        pushFN(data,$operator);
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
            compile time: 335.051ms*/;
function $unary_value(l,data,state){
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(l.current_byte==40/*[(]*/){
        /*
           27:89 unary_value=>• ( expression_statements_group_023_108 )
           27:90 unary_value=>• ( )
        */
        /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.current_byte==41/*[)]*/){
            /*
               27:90 unary_value=>( • )
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            consume(l,data,state);
            add_reduce(state,data,2,48);
            pushFN(data,$unary_value_goto);
            return 27;
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               27:89 unary_value=>( • expression_statements_group_023_108 )
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_3879c03d7a2c7a9e);
            pushFN(data,$expression_statements_group_023_108);
            return 0;
        }
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(cmpr_set(l,data,143,2,2)||(l.current_byte==91/*[[]*/)){
        /*
           27:87 unary_value=>• function_expression
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_07c4b2a266e81cdd);
        pushFN(data,$function_expression);
        return 0;
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(((((((dt_6ae31dd85a62ef5c(l,data)||cmpr_set(l,data,94,4,4))||cmpr_set(l,data,52,5,5))||cmpr_set(l,data,34,4,4))||cmpr_set(l,data,19,4,4))||(l.current_byte==34/*["]*/))||(l.current_byte==39/*[']*/))||l.isNum(data)){
        /*
           27:88 unary_value=>• value
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_07c4b2a266e81cdd);
        pushFN(data,$value);
        return 0;
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    } else {
        /*
           44:129 identifier=>• tk:identifier_token
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_068c592ce9232acd);
        pushFN(data,$identifier);
        return 0;
    }
    return -1;
}
function $unary_value_goto(l,data,state,prod){
    while(1){
        /*[27] [37]*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(l.current_byte==91/*[[]*/){
            /*
               28:91 left_hand_expression=>member_expression •
               37:116 member_expression=>member_expression • [ expression ]
            */
            let pk = l.copy();
            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            if(!(((((dt_6ae31dd85a62ef5c(pk,data)||cmpr_set(pk,data,19,4,4))||assert_ascii(pk,0x0,0x20000194,0x88000000,0x8000000))||pk.isUniID(data))||pk.isNum(data))||pk.isSym(true,data))||(((dt_a0570d6d5c8952c6(pk,data)||cmpr_set(pk,data,56,6,6))||cmpr_set(pk,data,116,3,3))||cmpr_set(pk,data,115,4,4))){
                /*
                   28:91 left_hand_expression=>member_expression •
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                return 27;
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            } else if(((((((((((((cmpr_set(pk,data,142,2,2)||cmpr_set(pk,data,66,5,5))||dt_bcea2102060eab13(pk,data))||dt_6ae31dd85a62ef5c(pk,data))||cmpr_set(pk,data,94,4,4))||cmpr_set(pk,data,34,4,4))||cmpr_set(pk,data,19,4,4))||cmpr_set(pk,data,71,5,5))||cmpr_set(pk,data,76,6,6))||cmpr_set(pk,data,38,8,8))||cmpr_set(pk,data,62,4,4))||assert_ascii(pk,0x0,0x20000194,0x88000000,0x8000000))||pk.isNum(data))||pk.isSym(true,data)){
                /*
                   37:116 member_expression=>member_expression • [ expression ]
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                consume(l,data,state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                pushFN(data,branch_dc6294aaa5e84999);
                pushFN(data,$expression);
                return 0;
                /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
            } else {
                /*
                   37:116 member_expression=>member_expression • [ expression ]
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                consume(l,data,state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                pushFN(data,branch_dc6294aaa5e84999);
                pushFN(data,$expression);
                return 0;
            }
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if(l.current_byte==46/*[.]*/){
            /*
               37:115 member_expression=>member_expression • . identifier
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_c7b759beb1f3603a);
            pushFN(data,$identifier);
            return 0;
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else if(l.current_byte==40/*[(]*/){
            /*
               36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
               36:114 call_expression=>member_expression • ( )
            */
            let pk = l.copy();
            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if(pk.current_byte==41/*[)]*/){
                /*
                   36:114 call_expression=>member_expression • ( )
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                consume(l,data,state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
                    add_reduce(state,data,3,64);
                    pushFN(data,$unary_value_goto);
                    return 27;
                }
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            } else {
                /*
                   36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                consume(l,data,state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                pushFN(data,branch_4eb0425186f1cb79);
                pushFN(data,$call_expression_HC_listbody2_114);
                return 0;
            }
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*
               28:91 left_hand_expression=>member_expression •
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
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
            compile time: 3.789ms*/;
function $loop_expression_group_254_111(l,data,state){
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==40/*[(]*/){
        /*
           29:92 loop_expression_group_254_111=>( • expression )
        */
        consume(l,data,state);
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_a6f489c38be28a8a);
        pushFN(data,$expression);
        return 0;
    }
    return -1;
}
/*production name: loop_expression_HC_listbody6_112
            grammar index: 30
            bodies:
	30:93 loop_expression_HC_listbody6_112=>• loop_expression_HC_listbody6_112 , expression - 
		30:94 loop_expression_HC_listbody6_112=>• expression - 
            compile time: 254.175ms*/;
function $loop_expression_HC_listbody6_112(l,data,state){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    pushFN(data,branch_e56bbc7571cdf1e6);
    pushFN(data,$expression);
    return 0;
    return -1;
}
function $loop_expression_HC_listbody6_112_goto(l,data,state,prod){
    /*[30]*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(l.current_byte==44/*[,]*/){
        /*
           30:93 loop_expression_HC_listbody6_112=>loop_expression_HC_listbody6_112 • , expression
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_85479b24ccc90691);
        pushFN(data,$expression);
        return 0;
    }
    return prod == 30 ? prod : -1;
}
/*production name: loop_expression
            grammar index: 31
            bodies:
	31:95 loop_expression=>• loop loop_expression_group_254_111 expression - 
		31:96 loop_expression=>• loop ( parameters ; expression ; loop_expression_HC_listbody6_112 ) expression - 
		31:97 loop_expression=>• loop ( primitive_declaration in expression ) expression - 
		31:98 loop_expression=>• loop expression - 
		31:99 loop_expression=>• loop ( ; expression ; loop_expression_HC_listbody6_112 ) expression - 
		31:100 loop_expression=>• loop ( parameters ; ; loop_expression_HC_listbody6_112 ) expression - 
		31:101 loop_expression=>• loop ( parameters ; expression ; ) expression - 
		31:102 loop_expression=>• loop ( ; ; loop_expression_HC_listbody6_112 ) expression - 
		31:103 loop_expression=>• loop ( ; expression ; ) expression - 
		31:104 loop_expression=>• loop ( parameters ; ; ) expression - 
		31:105 loop_expression=>• loop ( ; ; ) expression - 
            compile time: 16143.515ms*/;
function $loop_expression(l,data,state){
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(cmpr_set(l,data,62,4,4)){
        /*
           31:95 loop_expression=>loop • loop_expression_group_254_111 expression
           31:96 loop_expression=>loop • ( parameters ; expression ; loop_expression_HC_listbody6_112 ) expression
           31:97 loop_expression=>loop • ( primitive_declaration in expression ) expression
           31:98 loop_expression=>loop • expression
           31:99 loop_expression=>loop • ( ; expression ; loop_expression_HC_listbody6_112 ) expression
           31:100 loop_expression=>loop • ( parameters ; ; loop_expression_HC_listbody6_112 ) expression
           31:101 loop_expression=>loop • ( parameters ; expression ; ) expression
           31:102 loop_expression=>loop • ( ; ; loop_expression_HC_listbody6_112 ) expression
           31:103 loop_expression=>loop • ( ; expression ; ) expression
           31:104 loop_expression=>loop • ( parameters ; ; ) expression
           31:105 loop_expression=>loop • ( ; ; ) expression
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(l.current_byte==40/*[(]*/){
            /*
               31:95 loop_expression=>loop • loop_expression_group_254_111 expression
               31:96 loop_expression=>loop • ( parameters ; expression ; loop_expression_HC_listbody6_112 ) expression
               31:97 loop_expression=>loop • ( primitive_declaration in expression ) expression
               31:98 loop_expression=>loop • expression
               31:99 loop_expression=>loop • ( ; expression ; loop_expression_HC_listbody6_112 ) expression
               31:100 loop_expression=>loop • ( parameters ; ; loop_expression_HC_listbody6_112 ) expression
               31:101 loop_expression=>loop • ( parameters ; expression ; ) expression
               31:102 loop_expression=>loop • ( ; ; loop_expression_HC_listbody6_112 ) expression
               31:103 loop_expression=>loop • ( ; expression ; ) expression
               31:104 loop_expression=>loop • ( parameters ; ; ) expression
               31:105 loop_expression=>loop • ( ; ; ) expression
            */
            let pk = l.copy();
            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
            switch(sym_map_3dd6ef2b3a49ff7e(pk,data)){
                case 0:
                    /*--LEAF--*/
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    pushFN(data,branch_8b8dd7066e507d3d);
                    pushFN(data,$expression);
                    return 0;
                case 1:
                    /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                    consume(l,data,state);
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                    if(l.current_byte==59/*[;]*/){
                        /*
                           31:99 loop_expression=>loop ( ; • expression ; loop_expression_HC_listbody6_112 ) expression
                           31:102 loop_expression=>loop ( ; • ; loop_expression_HC_listbody6_112 ) expression
                           31:103 loop_expression=>loop ( ; • expression ; ) expression
                           31:105 loop_expression=>loop ( ; • ; ) expression
                        */
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        if(l.current_byte==59/*[;]*/){
                            /*
                               31:102 loop_expression=>loop ( ; • ; loop_expression_HC_listbody6_112 ) expression
                               31:105 loop_expression=>loop ( ; • ; ) expression
                            */
                            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                            consume(l,data,state);
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                            /*⤋⤋⤋ assert ⤋⤋⤋*/
                            if(l.current_byte==41/*[)]*/){
                                /*
                                   31:105 loop_expression=>loop ( ; ; • ) expression
                                */
                                /*--LEAF--*/
                                /*⤋⤋⤋ assert ⤋⤋⤋*/
                                consume(l,data,state);
                                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                                pushFN(data,branch_b99eeae70c02602e);
                                pushFN(data,$expression);
                                return 0;
                                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                            } else {
                                /*
                                   31:102 loop_expression=>loop ( ; ; • loop_expression_HC_listbody6_112 ) expression
                                */
                                /*--LEAF--*/
                                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                                pushFN(data,branch_bd9cd0221b948fc4);
                                pushFN(data,$loop_expression_HC_listbody6_112);
                                return 0;
                            }
                            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                        } else {
                            /*
                               31:99 loop_expression=>loop ( ; • expression ; loop_expression_HC_listbody6_112 ) expression
                               31:103 loop_expression=>loop ( ; • expression ; ) expression
                            */
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
                            pushFN(data,branch_47c545d1d18f125f);
                            pushFN(data,$expression);
                            return 0;
                        }
                    }
                case 2:
                    /*-------------VPROD-------------------------*/
                    pushFN(data,branch_160fff8c8a8384c1);
                    return 0;
                case 3:
                    /*-------------VPROD-------------------------*/
                    pushFN(data,branch_5489c742cef19a4d);
                    return 0;
                default:
                    break;
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else {
            /*
               31:98 loop_expression=>loop • expression
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_8b8dd7066e507d3d);
            pushFN(data,$expression);
            return 0;
        }
    }
    return -1;
}
/*production name: match_expression_HC_listbody3_113
            grammar index: 32
            bodies:
	32:106 match_expression_HC_listbody3_113=>• match_expression_HC_listbody3_113 , match_clause - 
		32:107 match_expression_HC_listbody3_113=>• match_clause - 
            compile time: 225.127ms*/;
function $match_expression_HC_listbody3_113(l,data,state){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    pushFN(data,branch_78aa7468cfc4789b);
    pushFN(data,$match_clause);
    return 0;
    return -1;
}
function $match_expression_HC_listbody3_113_goto(l,data,state,prod){
    /*[32]*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
    if(l.current_byte==44/*[,]*/){
        /*
           32:106 match_expression_HC_listbody3_113=>match_expression_HC_listbody3_113 • , match_clause
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_7d515c25abc23648);
        pushFN(data,$match_clause);
        return 0;
    }
    return prod == 32 ? prod : -1;
}
/*production name: match_expression
            grammar index: 33
            bodies:
	33:108 match_expression=>• match expression : match_expression_HC_listbody3_113 - 
		33:109 match_expression=>• match expression : - 
            compile time: 245.027ms*/;
function $match_expression(l,data,state){
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(cmpr_set(l,data,66,5,5)){
        /*
           33:108 match_expression=>match • expression : match_expression_HC_listbody3_113
           33:109 match_expression=>match • expression :
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_b134f4a772a6e4ee);
        pushFN(data,$expression);
        return 0;
    }
    return -1;
}
/*production name: match_clause
            grammar index: 34
            bodies:
	34:110 match_clause=>• expression : expression - 
            compile time: 2.488ms*/;
function $match_clause(l,data,state){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    pushFN(data,branch_28a5f499792ccaf8);
    pushFN(data,$expression);
    return 0;
    return -1;
}
/*production name: call_expression_HC_listbody2_114
            grammar index: 35
            bodies:
	35:111 call_expression_HC_listbody2_114=>• call_expression_HC_listbody2_114 , expression - 
		35:112 call_expression_HC_listbody2_114=>• expression - 
            compile time: 5.452ms*/;
function $call_expression_HC_listbody2_114(l,data,state){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    pushFN(data,branch_cad3222afff33c8d);
    pushFN(data,$expression);
    return 0;
    return -1;
}
function $call_expression_HC_listbody2_114_goto(l,data,state,prod){
    /*[35]*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(l.current_byte==44/*[,]*/){
        /*
           35:111 call_expression_HC_listbody2_114=>call_expression_HC_listbody2_114 • , expression
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_a344a7e7c13713a7);
        pushFN(data,$expression);
        return 0;
    }
    return prod == 35 ? prod : -1;
}
/*production name: break_expression_group_164_115
            grammar index: 38
            bodies:
	38:118 break_expression_group_164_115=>• : expression - 
            compile time: 2.312ms*/;
function $break_expression_group_164_115(l,data,state){
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==58/*[:]*/){
        /*
           38:118 break_expression_group_164_115=>: • expression
        */
        consume(l,data,state);
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_a280998f5fd578b8);
        pushFN(data,$expression);
        return 0;
    }
    return -1;
}
/*production name: break_expression
            grammar index: 39
            bodies:
	39:119 break_expression=>• break break_expression_group_164_115 - 
		39:120 break_expression=>• break - 
            compile time: 233.16ms*/;
function $break_expression(l,data,state){
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(cmpr_set(l,data,71,5,5)){
        /*
           39:119 break_expression=>break • break_expression_group_164_115
           39:120 break_expression=>break •
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(l.current_byte==58/*[:]*/){
            /*
               39:119 break_expression=>break • break_expression_group_164_115
               39:120 break_expression=>break •
            */
            let pk = l.copy();
            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            if(!(((((dt_6ae31dd85a62ef5c(pk,data)||cmpr_set(pk,data,19,4,4))||assert_ascii(pk,0x0,0x20000194,0x88000000,0x8000000))||pk.isUniID(data))||pk.isNum(data))||pk.isSym(true,data))||(((((cmpr_set(pk,data,127,4,4)||dt_4a896e8627f36237(pk,data))||cmpr_set(pk,data,46,3,3))||cmpr_set(pk,data,121,3,3))||cmpr_set(pk,data,119,2,2))||assert_ascii(pk,0x0,0xc001200,0x20000000,0x20000000))){
                /*
                   39:120 break_expression=>break •
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                add_reduce(state,data,1,69);
                return 39;
                /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
            } else {
                /*
                   39:119 break_expression=>break • break_expression_group_164_115
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                pushFN(data,branch_a94b062fa788e748);
                pushFN(data,$break_expression_group_164_115);
                return 0;
            }
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*
               39:120 break_expression=>break •
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            add_reduce(state,data,1,69);
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
            compile time: 357.029ms*/;
function $return_expression(l,data,state){
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(cmpr_set(l,data,76,6,6)){
        /*
           40:121 return_expression=>return • break_expression_group_164_115
           40:122 return_expression=>return •
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(l.current_byte==58/*[:]*/){
            /*
               40:121 return_expression=>return • break_expression_group_164_115
               40:122 return_expression=>return •
            */
            let pk = l.copy();
            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            if(!(((((dt_6ae31dd85a62ef5c(pk,data)||cmpr_set(pk,data,19,4,4))||assert_ascii(pk,0x0,0x20000194,0x88000000,0x8000000))||pk.isUniID(data))||pk.isNum(data))||pk.isSym(true,data))||(((((cmpr_set(pk,data,127,4,4)||dt_4a896e8627f36237(pk,data))||cmpr_set(pk,data,46,3,3))||cmpr_set(pk,data,121,3,3))||cmpr_set(pk,data,119,2,2))||assert_ascii(pk,0x0,0xc001200,0x20000000,0x20000000))){
                /*
                   40:122 return_expression=>return •
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                add_reduce(state,data,1,71);
                return 40;
                /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
            } else {
                /*
                   40:121 return_expression=>return • break_expression_group_164_115
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                pushFN(data,branch_532766fb61bef13c);
                pushFN(data,$break_expression_group_164_115);
                return 0;
            }
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*
               40:122 return_expression=>return •
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            add_reduce(state,data,1,71);
            return 40;
        }
    }
    return -1;
}
/*production name: continue_expression
            grammar index: 41
            bodies:
	41:123 continue_expression=>• continue - 
            compile time: 1.571ms*/;
function $continue_expression(l,data,state){
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(cmpr_set(l,data,38,8,8)){
        /*
           41:123 continue_expression=>continue •
        */
        consume(l,data,state);
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        add_reduce(state,data,1,72);
        return 41;
    }
    return -1;
}
/*production name: primitive_declaration_group_169_116
            grammar index: 42
            bodies:
	42:124 primitive_declaration_group_169_116=>• = expression - 
            compile time: 2.482ms*/;
function $primitive_declaration_group_169_116(l,data,state){
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        /*
           42:124 primitive_declaration_group_169_116=>= • expression
        */
        consume(l,data,state);
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_54a2284eebb4a6fc);
        pushFN(data,$expression);
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
            compile time: 327.676ms*/;
function $primitive_declaration(l,data,state){
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==91/*[[]*/){
        /*
           43:125 primitive_declaration=>• modifier_list identifier : type primitive_declaration_group_169_116
           43:127 primitive_declaration=>• modifier_list identifier : type
        */
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_912ec2aa6d77c4c2);
        pushFN(data,$modifier_list);
        return 0;
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else {
        /*
           43:126 primitive_declaration=>• identifier : type primitive_declaration_group_169_116
           43:128 primitive_declaration=>• identifier : type
        */
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_74cbd9ffdcc4aecc);
        pushFN(data,$identifier);
        return 0;
    }
    return -1;
}
/*production name: identifier
            grammar index: 44
            bodies:
	44:129 identifier=>• tk:identifier_token - 
            compile time: 1.593ms*/;
function $identifier(l,data,state){
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(tk_896177e00f155ef3(l,data)){
        /*
           44:129 identifier=>tk:identifier_token •
        */
        consume(l,data,state);
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        add_reduce(state,data,1,77);
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
            compile time: 1.988ms*/;
function $identifier_token_group_074_117(l,data,state){
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
        /*
           45:130 identifier_token_group_074_117=>• θid
           45:131 identifier_token_group_074_117=>• _
           45:132 identifier_token_group_074_117=>• $
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        consume(l,data,state);
        return 45;
    }
    return -1;
}
/*production name: identifier_token_HC_listbody1_118
            grammar index: 46
            bodies:
	46:133 identifier_token_HC_listbody1_118=>• identifier_token_HC_listbody1_118 identifier_token_group_074_117 - 
		46:134 identifier_token_HC_listbody1_118=>• identifier_token_group_074_117 - 
            compile time: 256.126ms*/;
function $identifier_token_HC_listbody1_118(l,data,state){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    pushFN(data,branch_d6adce891265bf33);
    pushFN(data,$identifier_token_group_074_117);
    return 0;
    return -1;
}
function $identifier_token_HC_listbody1_118_goto(l,data,state,prod){
    /*[46]*/
    skip_db1786a8af54d666(l/*[ 71 ]*/,data,true);
    if(nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/){
        return 46;
    }
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(l.isUniID(data)){
        /*
           46:133 identifier_token_HC_listbody1_118=>identifier_token_HC_listbody1_118 • identifier_token_group_074_117
           48:139 identifier_token=>identifier_token_group_074_117 identifier_token_HC_listbody1_118 •
        */
        let pk = l.copy();
        skip_db1786a8af54d666(pk.next(data)/*[ 71 ]*/,data,false);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if(nocap_b2eb52235ee30b8a(pk)/*[ws] [nl]*/){
            /*
               46:133 identifier_token_HC_listbody1_118=>identifier_token_HC_listbody1_118 • identifier_token_group_074_117
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_2e223495b08c92ba);
            pushFN(data,$identifier_token_group_074_117);
            return 0;
            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
        } else {
            /*
               46:133 identifier_token_HC_listbody1_118=>identifier_token_HC_listbody1_118 • identifier_token_group_074_117
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
            pushFN(data,branch_2e223495b08c92ba);
            pushFN(data,$identifier_token_group_074_117);
            return 0;
        }
        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
    } else if((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/)){
        /*
           46:133 identifier_token_HC_listbody1_118=>identifier_token_HC_listbody1_118 • identifier_token_group_074_117
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
        pushFN(data,branch_2e223495b08c92ba);
        pushFN(data,$identifier_token_group_074_117);
        return 0;
    }
    return prod == 46 ? prod : -1;
}
/*production name: identifier_token_group_079_119
            grammar index: 47
            bodies:
	47:135 identifier_token_group_079_119=>• θws - 
		47:136 identifier_token_group_079_119=>• θnl - 
            compile time: 2.773ms*/;
function $identifier_token_group_079_119(l,data,state){
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/){
        /*
           47:135 identifier_token_group_079_119=>• θws
           47:136 identifier_token_group_079_119=>• θnl
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        consume(l,data,state);
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
            compile time: 729.944ms*/;
function $identifier_token(l,data,state){
    pushFN(data,branch_26cc5d061a038e2d);
    pushFN(data,$identifier_token_group_074_117);
    return 0;
    return -1;
}
/*production name: modifier_list_HC_listbody1_120
            grammar index: 49
            bodies:
	49:141 modifier_list_HC_listbody1_120=>• modifier_list_HC_listbody1_120 modifier - 
		49:142 modifier_list_HC_listbody1_120=>• modifier - 
            compile time: 5.696ms*/;
function $modifier_list_HC_listbody1_120(l,data,state){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    pushFN(data,branch_dc83f428871b16c3);
    pushFN(data,$modifier);
    return 0;
    return -1;
}
function $modifier_list_HC_listbody1_120_goto(l,data,state,prod){
    /*[49]*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.isUniID(data)){
        /*
           49:141 modifier_list_HC_listbody1_120=>modifier_list_HC_listbody1_120 • modifier
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_9e5fbae7373ee27c);
        pushFN(data,$modifier);
        return 0;
    }
    return prod == 49 ? prod : -1;
}
/*production name: modifier_list
            grammar index: 50
            bodies:
	50:143 modifier_list=>• [ modifier_list_HC_listbody1_120 ] - 
            compile time: 2.969ms*/;
function $modifier_list(l,data,state){
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==91/*[[]*/){
        /*
           50:143 modifier_list=>[ • modifier_list_HC_listbody1_120 ]
        */
        consume(l,data,state);
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_eadb44ad4e55e10b);
        pushFN(data,$modifier_list_HC_listbody1_120);
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
            compile time: 12.884ms*/;
function $type_group_086_121(l,data,state){
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(((cmpr_set(l,data,82,4,4)||cmpr_set(l,data,83,3,3))||(l.current_byte==117/*[u]*/))||(l.current_byte==105/*[i]*/)){
        /*
           51:144 type_group_086_121=>• u
           51:145 type_group_086_121=>• i
           51:146 type_group_086_121=>• uint
           51:147 type_group_086_121=>• int
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        consume(l,data,state);
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
            compile time: 2.839ms*/;
function $type_group_091_122(l,data,state){
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(((dt_49ab5c8c65528b83(l,data)||cmpr_set(l,data,90,2,2))||cmpr_set(l,data,92,2,2))||(l.current_byte==56/*[8]*/)){
        /*
           52:148 type_group_091_122=>• 8
           52:149 type_group_091_122=>• 16
           52:150 type_group_091_122=>• 32
           52:151 type_group_091_122=>• 64
           52:152 type_group_091_122=>• 128
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        consume(l,data,state);
        return 52;
    }
    return -1;
}
/*production name: type_group_094_123
            grammar index: 53
            bodies:
	53:153 type_group_094_123=>• f - 
		53:154 type_group_094_123=>• flt - 
            compile time: 1.323ms*/;
function $type_group_094_123(l,data,state){
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(cmpr_set(l,data,124,3,3)||(l.current_byte==102/*[f]*/)){
        /*
           53:153 type_group_094_123=>• f
           53:154 type_group_094_123=>• flt
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        consume(l,data,state);
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
            compile time: 1.923ms*/;
function $type_group_097_124(l,data,state){
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if((cmpr_set(l,data,90,2,2)||cmpr_set(l,data,92,2,2))||cmpr_set(l,data,87,3,3)){
        /*
           54:155 type_group_097_124=>• 32
           54:156 type_group_097_124=>• 64
           54:157 type_group_097_124=>• 128
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        consume(l,data,state);
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
            compile time: 7.434ms*/;
function $type(l,data,state){
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(cmpr_set(l,data,124,3,3)||(l.current_byte==102/*[f]*/)){
        /*
           55:160 type=>• type_group_094_123 type_group_097_124
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_11ac48de192eee3d);
        pushFN(data,$type_group_094_123);
        return 0;
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(dt_1e3f2d5b696b270e(l,data)){
        /*
           55:161 type=>• string
           55:162 type=>• str
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        consume(l,data,state);
        add_reduce(state,data,1,80);
        return 55;
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(((cmpr_set(l,data,82,4,4)||cmpr_set(l,data,83,3,3))||(l.current_byte==117/*[u]*/))||(l.current_byte==105/*[i]*/)){
        /*
           55:159 type=>• type_group_086_121 type_group_091_122
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_4646738a4386c43b);
        pushFN(data,$type_group_086_121);
        return 0;
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else {
        /*
           55:158 type=>• identifier
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_fe7e48edaa56a85c);
        pushFN(data,$identifier);
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
            compile time: 6.091ms*/;
function $value(l,data,state){
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(cmpr_set(l,data,19,4,4)){
        /*
           56:168 value=>• template
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_affaae5e0c71984b);
        pushFN(data,$template);
        return 0;
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if((l.current_byte==34/*["]*/)||(l.current_byte==39/*[']*/)){
        /*
           56:164 value=>• tk:string
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if(tk_f70d460017f6375f(l,data)&&consume(l,data,state)){
            add_reduce(state,data,1,82);
            return 56;
        }
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(dt_6ae31dd85a62ef5c(l,data)||l.isNum(data)){
        /*
           56:163 value=>• num
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_ef7fd26222b6db24);
        pushFN(data,$num);
        return 0;
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(cmpr_set(l,data,94,4,4)){
        /*
           56:165 value=>• true
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        consume(l,data,state);
        add_reduce(state,data,1,83);
        return 56;
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(cmpr_set(l,data,52,5,5)){
        /*
           56:166 value=>• false
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        consume(l,data,state);
        add_reduce(state,data,1,84);
        return 56;
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(cmpr_set(l,data,34,4,4)){
        /*
           56:167 value=>• null
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        consume(l,data,state);
        add_reduce(state,data,1,85);
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
            compile time: 2.213ms*/;
function $string_group_0111_125(l,data,state){
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if((((cmpr_set(l,data,13,2,2)||l.isUniID(data))||l.isNL())||l.isSym(true,data))||l.isSP(true,data)){
        /*
           57:169 string_group_0111_125=>• θws
           57:170 string_group_0111_125=>• θnl
           57:171 string_group_0111_125=>• θid
           57:172 string_group_0111_125=>• θsym
           57:173 string_group_0111_125=>• \"
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        consume(l,data,state);
        return 57;
    }
    return -1;
}
/*production name: string_HC_listbody1_126
            grammar index: 58
            bodies:
	58:174 string_HC_listbody1_126=>• string_HC_listbody1_126 string_group_0111_125 - 
		58:175 string_HC_listbody1_126=>• string_group_0111_125 - 
            compile time: 4.358ms*/;
function $string_HC_listbody1_126(l,data,state){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    pushFN(data,branch_062cf06014c92bd4);
    pushFN(data,$string_group_0111_125);
    return 0;
    return -1;
}
function $string_HC_listbody1_126_goto(l,data,state,prod){
    /*[58]*/
    skip_db1786a8af54d666(l/*[ 71 ]*/,data,true);
    if(l.current_byte==34/*["]*/){
        return 58;
    }
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if((((cmpr_set(l,data,13,2,2)||l.isUniID(data))||l.isNL())||l.isSym(true,data))||l.isSP(true,data)){
        /*
           58:174 string_HC_listbody1_126=>string_HC_listbody1_126 • string_group_0111_125
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_3ca79fffa5a3a758);
        pushFN(data,$string_group_0111_125);
        return 0;
    }
    return prod == 58 ? prod : -1;
}
/*production name: string_HC_listbody1_127
            grammar index: 59
            bodies:
	59:176 string_HC_listbody1_127=>• string_HC_listbody1_127 string_group_0111_125 - 
		59:177 string_HC_listbody1_127=>• string_group_0111_125 - 
            compile time: 5.448ms*/;
function $string_HC_listbody1_127(l,data,state){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    pushFN(data,branch_91bd6de142fc31b3);
    pushFN(data,$string_group_0111_125);
    return 0;
    return -1;
}
function $string_HC_listbody1_127_goto(l,data,state,prod){
    /*[59]*/
    skip_db1786a8af54d666(l/*[ 71 ]*/,data,true);
    if(l.current_byte==39/*[']*/){
        return 59;
    }
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if((((cmpr_set(l,data,13,2,2)||l.isUniID(data))||l.isNL())||l.isSym(true,data))||l.isSP(true,data)){
        /*
           59:176 string_HC_listbody1_127=>string_HC_listbody1_127 • string_group_0111_125
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_3feb5021871d7628);
        pushFN(data,$string_group_0111_125);
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
            compile time: 4.949ms*/;
function $string(l,data,state){
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(l.current_byte==34/*["]*/){
        /*
           60:178 string=>• " string_HC_listbody1_126 "
           60:180 string=>• " "
        */
        let pk = l.copy();
        skip_db1786a8af54d666(pk.next(data)/*[ 71 ]*/,data,false);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(pk.current_byte==34/*["]*/){
            /*
               60:180 string=>• " "
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            if((l.current_byte==34/*["]*/)&&consume(l,data,state)){
                add_reduce(state,data,2,90);
                return 60;
            }
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else {
            /*
               60:178 string=>• " string_HC_listbody1_126 "
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            consume(l,data,state);
            skip_db1786a8af54d666(l/*[ 71 ]*/,data,true);
            pushFN(data,branch_3350dfea3de5dd8e);
            pushFN(data,$string_HC_listbody1_126);
            return 0;
        }
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    } else {
        /*
           60:179 string=>• ' string_HC_listbody1_127 '
           60:181 string=>• ' '
        */
        let pk = l.copy();
        skip_db1786a8af54d666(pk.next(data)/*[ 71 ]*/,data,false);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(pk.current_byte==39/*[']*/){
            /*
               60:181 string=>• ' '
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            if((l.current_byte==39/*[']*/)&&consume(l,data,state)){
                add_reduce(state,data,2,90);
                return 60;
            }
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else {
            /*
               60:179 string=>• ' string_HC_listbody1_127 '
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            consume(l,data,state);
            skip_db1786a8af54d666(l/*[ 71 ]*/,data,true);
            pushFN(data,branch_4f293cfdd441fd62);
            pushFN(data,$string_HC_listbody1_127);
            return 0;
        }
    }
    return -1;
}
/*production name: num
            grammar index: 61
            bodies:
	61:182 num=>• tk:num_tok - 
            compile time: 1.911ms*/;
function $num(l,data,state){
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(tk_b838139d0d011665(l,data)){
        /*
           61:182 num=>tk:num_tok •
        */
        consume(l,data,state);
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
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
            compile time: 3.18ms*/;
function $num_tok(l,data,state){
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.isNum(data)){
        /*
           62:183 num_tok=>• def$number
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_7bd41de4c3b97b3a);
        pushFN(data,$def$number);
        return 0;
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(cmpr_set(l,data,26,2,2)){
        /*
           62:184 num_tok=>• def$hex
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_7bd41de4c3b97b3a);
        pushFN(data,$def$hex);
        return 0;
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(cmpr_set(l,data,113,2,2)){
        /*
           62:185 num_tok=>• def$binary
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_7bd41de4c3b97b3a);
        pushFN(data,$def$binary);
        return 0;
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else {
        /*
           62:186 num_tok=>• def$octal
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_7bd41de4c3b97b3a);
        pushFN(data,$def$octal);
        return 0;
    }
    return -1;
}
/*production name: operator_HC_listbody1_128
            grammar index: 63
            bodies:
	63:187 operator_HC_listbody1_128=>• operator_HC_listbody1_128 θsym - 
		63:188 operator_HC_listbody1_128=>• θsym - 
            compile time: 214.924ms*/;
function $operator_HC_listbody1_128(l,data,state){
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.isSym(true,data)){
        /*
           63:188 operator_HC_listbody1_128=>θsym •
        */
        consume(l,data,state);
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        add_reduce(state,data,1,88);
        pushFN(data,$operator_HC_listbody1_128_goto);
        return 63;
    }
    return -1;
}
function $operator_HC_listbody1_128_goto(l,data,state,prod){
    /*[63]*/
    skip_db1786a8af54d666(l/*[ 71 ]*/,data,true);
    if((nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/||cmpr_set(l,data,19,4,4))||assert_ascii(l,0x0,0x2c001300,0x28000000,0x28000000)){
        return 63;
    }
    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
    if(l.isSym(true,data)){
        /*
           63:187 operator_HC_listbody1_128=>operator_HC_listbody1_128 • θsym
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
        consume(l,data,state);
        add_reduce(state,data,2,87);
        pushFN(data,$operator_HC_listbody1_128_goto);
        return 63;
    }
    return prod == 63 ? prod : -1;
}
/*production name: operator_HC_listbody1_129
            grammar index: 64
            bodies:
	64:189 operator_HC_listbody1_129=>• operator_HC_listbody1_129 θsym - 
		64:190 operator_HC_listbody1_129=>• θsym - 
            compile time: 219.47ms*/;
function $operator_HC_listbody1_129(l,data,state){
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.isSym(true,data)){
        /*
           64:190 operator_HC_listbody1_129=>θsym •
        */
        consume(l,data,state);
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        add_reduce(state,data,1,88);
        pushFN(data,$operator_HC_listbody1_129_goto);
        return 64;
    }
    return -1;
}
function $operator_HC_listbody1_129_goto(l,data,state,prod){
    /*[64]*/
    skip_db1786a8af54d666(l/*[ 71 ]*/,data,true);
    if((nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/||cmpr_set(l,data,19,4,4))||assert_ascii(l,0x0,0x2c001300,0x28000000,0x28000000)){
        return 64;
    }
    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
    if(l.isSym(true,data)){
        /*
           64:189 operator_HC_listbody1_129=>operator_HC_listbody1_129 • θsym
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
        consume(l,data,state);
        add_reduce(state,data,2,87);
        pushFN(data,$operator_HC_listbody1_129_goto);
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
            compile time: 659.883ms*/;
function $operator(l,data,state){
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        /*
           65:192 operator=>• = operator_HC_listbody1_129 identifier_token_group_079_119
           65:195 operator=>• = operator_HC_listbody1_129
        */
        /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_1e7e85452384a7b4);
        pushFN(data,$operator_HC_listbody1_129);
        return 0;
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    } else {
        /*
           65:191 operator=>• θsym operator_HC_listbody1_128 identifier_token_group_079_119
           65:193 operator=>• θsym identifier_token_group_079_119
           65:194 operator=>• θsym operator_HC_listbody1_128
           65:196 operator=>• θsym
        */
        let pk = l.copy();
        skip_db1786a8af54d666(pk.next(data)/*[ 71 ]*/,data,false);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(pk.isSym(true,data)){
            /*
               65:191 operator=>• θsym operator_HC_listbody1_128 identifier_token_group_079_119
               65:194 operator=>• θsym operator_HC_listbody1_128
               65:196 operator=>• θsym
            */
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            if(!(l.isSym(true,data))||((dt_6ae31dd85a62ef5c(l,data)||cmpr_set(l,data,19,4,4))||assert_ascii(l,0x0,0x2c001394,0xa8000000,0x28000000))){
                /*
                   65:196 operator=>θsym •
                */
                /*--LEAF--*/
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                add_reduce(state,data,1,92);
                return 65;
                /*⤋⤋⤋ peek-unresolved ⤋⤋⤋*/
            } else {
                /*
                   65:191 operator=>θsym • operator_HC_listbody1_128 identifier_token_group_079_119
                   65:194 operator=>θsym • operator_HC_listbody1_128
                   65:196 operator=>θsym •
                */
                /*-------------VPROD-------------------------*/
                pushFN(data,branch_f7cef3226b00786c);
                return 0;
            }
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else if(nocap_b2eb52235ee30b8a(pk)/*[ws] [nl]*/){
            /*
               65:193 operator=>• θsym identifier_token_group_079_119
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            consume(l,data,state);
            skip_db1786a8af54d666(l/*[ 71 ]*/,data,true);
            pushFN(data,branch_75dcdaa282cbb6b8);
            pushFN(data,$identifier_token_group_079_119);
            return 0;
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else {
            /*
               65:196 operator=>• θsym
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            consume(l,data,state);
            add_reduce(state,data,1,92);
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
            compile time: 2.465ms*/;
function $modifier(l,data,state){
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(l.isUniID(data)){
        /*
           66:197 modifier=>• pub
           66:198 modifier=>• priv
           66:199 modifier=>• export
           66:200 modifier=>• mut
           66:201 modifier=>• imut
           66:202 modifier=>• θid
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        consume(l,data,state);
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
            compile time: 1.935ms*/;
function $comment_group_0138_130(l,data,state){
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if((l.isUniID(data)||l.isNum(data))||l.isSym(true,data)){
        /*
           67:203 comment_group_0138_130=>• θid
           67:204 comment_group_0138_130=>• θsym
           67:205 comment_group_0138_130=>• θnum
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        consume(l,data,state);
        return 67;
    }
    return -1;
}
/*production name: comment_HC_listbody1_131
            grammar index: 68
            bodies:
	68:206 comment_HC_listbody1_131=>• comment_HC_listbody1_131 comment_group_0138_130 - 
		68:207 comment_HC_listbody1_131=>• comment_group_0138_130 - 
            compile time: 6.385ms*/;
function $comment_HC_listbody1_131(l,data,state){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    pushFN(data,branch_73836dabb810b0e0);
    pushFN(data,$comment_group_0138_130);
    return 0;
    return -1;
}
function $comment_HC_listbody1_131_goto(l,data,state,prod){
    /*[68]*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
    if(cmpr_set(l,data,17,2,2)){
        return 68;
    }
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if((l.isUniID(data)||l.isNum(data))||l.isSym(true,data)){
        /*
           68:206 comment_HC_listbody1_131=>comment_HC_listbody1_131 • comment_group_0138_130
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_38dcf650f8497618);
        pushFN(data,$comment_group_0138_130);
        return 0;
    }
    return prod == 68 ? prod : -1;
}
/*production name: comment_HC_listbody1_132
            grammar index: 69
            bodies:
	69:208 comment_HC_listbody1_132=>• comment_HC_listbody1_132 comment_group_0138_130 - 
		69:209 comment_HC_listbody1_132=>• comment_group_0138_130 - 
            compile time: 4.198ms*/;
function $comment_HC_listbody1_132(l,data,state){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    pushFN(data,branch_13f6c10119d024c3);
    pushFN(data,$comment_group_0138_130);
    return 0;
    return -1;
}
function $comment_HC_listbody1_132_goto(l,data,state,prod){
    /*[69]*/
    skip_6c02533b5dc0d802(l/*[ ws ][ 71 ]*/,data,true);
    if(nocap_9b1ef04606bbaa09(l)/*[nl]*/){
        return 69;
    }
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if((l.isUniID(data)||l.isNum(data))||l.isSym(true,data)){
        /*
           69:208 comment_HC_listbody1_132=>comment_HC_listbody1_132 • comment_group_0138_130
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_a96d7c2556c7c082);
        pushFN(data,$comment_group_0138_130);
        return 0;
    }
    return prod == 69 ? prod : -1;
}
/*production name: comment_group_0143_133
            grammar index: 70
            bodies:
	70:210 comment_group_0143_133=>• θnl - 
            compile time: 2.219ms*/;
function $comment_group_0143_133(l,data,state){
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(nocap_9b1ef04606bbaa09(l)/*[nl]*/){
        /*
           70:210 comment_group_0143_133=>θnl •
        */
        consume(l,data,state);
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
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
            compile time: 7.22ms*/;
function $comment(l,data,state){
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(cmpr_set(l,data,16,2,2)){
        /*
           71:211 comment=>• /* comment_HC_listbody1_131 * /
           71:213 comment=>• /* * /
        */
        let pk = l.copy();
        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,false);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(cmpr_set(pk,data,17,2,2)){
            /*
               71:213 comment=>• /* * /
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            if(cmpr_set(l,data,17,2,2)&&consume(l,data,state)){
                add_reduce(state,data,2,0);
                return 71;
            }
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else {
            /*
               71:211 comment=>• /* comment_HC_listbody1_131 * /
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_15d8af44efc142b0);
            pushFN(data,$comment_HC_listbody1_131);
            return 0;
        }
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    } else {
        /*
           71:212 comment=>• // comment_HC_listbody1_132 comment_group_0143_133
           71:214 comment=>• // comment_group_0143_133
        */
        let pk = l.copy();
        skip_6c02533b5dc0d802(pk.next(data)/*[ ws ][ 71 ]*/,data,false);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if((pk.isUniID(data)||pk.isNum(data))||pk.isSym(true,data)){
            /*
               71:212 comment=>• // comment_HC_listbody1_132 comment_group_0143_133
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            pushFN(data,branch_38121111c23993e5);
            pushFN(data,$comment_HC_listbody1_132);
            return 0;
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else {
            /*
               71:214 comment=>• // comment_group_0143_133
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            consume(l,data,state);
            skip_6c02533b5dc0d802(l/*[ ws ][ 71 ]*/,data,true);
            pushFN(data,branch_298174b4face442a);
            pushFN(data,$comment_group_0143_133);
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
            compile time: 3.437ms*/;
function $template(l,data,state){
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(cmpr_set(l,data,19,4,4)){
        /*
           72:215 template=><<-- • θnum -->>
           72:216 template=><<-- • -->>
        */
        consume(l,data,state);
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.isNum(data)){
            /*
               72:215 template=><<-- • θnum -->>
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            consume(l,data,state);
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
            if(cmpr_set(l,data,22,4,4)&&consume(l,data,state)){
                add_reduce(state,data,3,0);
                return 72;
            }
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if(cmpr_set(l,data,22,4,4)){
            /*
               72:216 template=><<-- • -->>
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            consume(l,data,state);
            add_reduce(state,data,2,0);
            return 72;
        }
    }
    return -1;
}
/*production name: def$hex
            grammar index: 78
            bodies:
	78:241 def$hex=>• tk:def$hex_token - 
            compile time: 1.053ms*/;
function $def$hex(l,data,state){
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(tk_f545b90791fd2d3f(l,data)){
        /*
           78:241 def$hex=>tk:def$hex_token •
        */
        consume(l,data,state);
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        return 78;
    }
    return -1;
}
/*production name: def$binary
            grammar index: 79
            bodies:
	79:242 def$binary=>• tk:def$binary_token - 
            compile time: 1.268ms*/;
function $def$binary(l,data,state){
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(tk_0f3d9e998d4e8303(l,data)){
        /*
           79:242 def$binary=>tk:def$binary_token •
        */
        consume(l,data,state);
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        return 79;
    }
    return -1;
}
/*production name: def$octal
            grammar index: 80
            bodies:
	80:243 def$octal=>• tk:def$octal_token - 
            compile time: 1.536ms*/;
function $def$octal(l,data,state){
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(tk_61a31e0cd3675f53(l,data)){
        /*
           80:243 def$octal=>tk:def$octal_token •
        */
        consume(l,data,state);
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        return 80;
    }
    return -1;
}
/*production name: def$number
            grammar index: 81
            bodies:
	81:244 def$number=>• tk:def$scientific_token - 
            compile time: 1.236ms*/;
function $def$number(l,data,state){
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(tk_5b3ed459478d3672(l,data)){
        /*
           81:244 def$number=>tk:def$scientific_token •
        */
        consume(l,data,state);
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        return 81;
    }
    return -1;
}
/*production name: def$scientific_token_group_027_101
            grammar index: 82
            bodies:
	82:245 def$scientific_token_group_027_101=>• e - 
		82:246 def$scientific_token_group_027_101=>• E - 
            compile time: 1.474ms*/;
function $def$scientific_token_group_027_101(l,data,state){
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if((l.current_byte==101/*[e]*/)||(l.current_byte==69/*[E]*/)){
        /*
           82:245 def$scientific_token_group_027_101=>• e
           82:246 def$scientific_token_group_027_101=>• E
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        consume(l,data,state);
        return 82;
    }
    return -1;
}
/*production name: def$scientific_token_group_228_102
            grammar index: 83
            bodies:
	83:247 def$scientific_token_group_228_102=>• def$scientific_token_group_027_101 - θnum - 
		83:248 def$scientific_token_group_228_102=>• def$scientific_token_group_027_101 θnum - 
            compile time: 3.35ms*/;
function $def$scientific_token_group_228_102(l,data,state){
    pushFN(data,branch_e3d260324303a784);
    pushFN(data,$def$scientific_token_group_027_101);
    return 0;
    return -1;
}
/*production name: def$scientific_token
            grammar index: 84
            bodies:
	84:249 def$scientific_token=>• def$float_token def$scientific_token_group_228_102 - 
		84:250 def$scientific_token=>• def$float_token - 
            compile time: 7.565ms*/;
function $def$scientific_token(l,data,state){
    pushFN(data,branch_462bfca52e81452e);
    pushFN(data,$def$float_token);
    return 0;
    return -1;
}
/*production name: def$float_token_group_130_103
            grammar index: 85
            bodies:
	85:251 def$float_token_group_130_103=>• . θnum - 
            compile time: 2.179ms*/;
function $def$float_token_group_130_103(l,data,state){
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==46/*[.]*/){
        /*
           85:251 def$float_token_group_130_103=>. • θnum
        */
        consume(l,data,state);
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,true);
        if(l.isNum(data)&&consume(l,data,state)){
            add_reduce(state,data,2,0);
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
            compile time: 8.451ms*/;
function $def$float_token(l,data,state){
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.isNum(data)){
        /*
           86:252 def$float_token=>θnum • def$float_token_group_130_103
           86:253 def$float_token=>θnum •
        */
        consume(l,data,state);
        skip_db1786a8af54d666(l/*[ 71 ]*/,data,true);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if(l.current_byte==46/*[.]*/){
            /*
               86:252 def$float_token=>θnum • def$float_token_group_130_103
            */
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            pushFN(data,branch_4e61e6c3ff64b530);
            pushFN(data,$def$float_token_group_130_103);
            return 0;
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*
               86:253 def$float_token=>θnum •
            */
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
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
            compile time: 3.22ms*/;
function $def$hex_token_group_044_104(l,data,state){
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(assert_ascii(l,0x0,0x0,0x7e,0x7e)||l.isNum(data)){
        /*
           87:254 def$hex_token_group_044_104=>• θnum
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
           87:266 def$hex_token_group_044_104=>• F
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        consume(l,data,state);
        return 87;
    }
    return -1;
}
/*production name: def$hex_token_HC_listbody1_105
            grammar index: 88
            bodies:
	88:267 def$hex_token_HC_listbody1_105=>• def$hex_token_HC_listbody1_105 def$hex_token_group_044_104 - 
		88:268 def$hex_token_HC_listbody1_105=>• def$hex_token_group_044_104 - 
            compile time: 11.447ms*/;
function $def$hex_token_HC_listbody1_105(l,data,state){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    pushFN(data,branch_c1d1bde8a1ade4c6);
    pushFN(data,$def$hex_token_group_044_104);
    return 0;
    return -1;
}
function $def$hex_token_HC_listbody1_105_goto(l,data,state,prod){
    /*[88]*/
    skip_a294e41529bc9275(l/*[ nl ][ 71 ]*/,data,true);
    if(l.isSP(true,data)){
        return 88;
    }
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(assert_ascii(l,0x0,0x0,0x7e,0x7e)||l.isNum(data)){
        /*
           88:267 def$hex_token_HC_listbody1_105=>def$hex_token_HC_listbody1_105 • def$hex_token_group_044_104
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_859a73d5c409fc4a);
        pushFN(data,$def$hex_token_group_044_104);
        return 0;
    }
    return prod == 88 ? prod : -1;
}
/*production name: def$hex_token
            grammar index: 89
            bodies:
	89:269 def$hex_token=>• 0x def$hex_token_HC_listbody1_105 - 
            compile time: 2.028ms*/;
function $def$hex_token(l,data,state){
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(cmpr_set(l,data,26,2,2)){
        /*
           89:269 def$hex_token=>0x • def$hex_token_HC_listbody1_105
        */
        consume(l,data,state);
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        skip_a294e41529bc9275(l/*[ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_a6b376ed0bf34743);
        pushFN(data,$def$hex_token_HC_listbody1_105);
        return 0;
    }
    return -1;
}
/*production name: def$binary_token_group_047_106
            grammar index: 90
            bodies:
	90:270 def$binary_token_group_047_106=>• 0 - 
		90:271 def$binary_token_group_047_106=>• 1 - 
            compile time: 1.462ms*/;
function $def$binary_token_group_047_106(l,data,state){
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if((l.current_byte==48/*[0]*/)||(l.current_byte==49/*[1]*/)){
        /*
           90:270 def$binary_token_group_047_106=>• 0
           90:271 def$binary_token_group_047_106=>• 1
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        consume(l,data,state);
        return 90;
    }
    return -1;
}
/*production name: def$binary_token_HC_listbody1_107
            grammar index: 91
            bodies:
	91:272 def$binary_token_HC_listbody1_107=>• def$binary_token_HC_listbody1_107 def$binary_token_group_047_106 - 
		91:273 def$binary_token_HC_listbody1_107=>• def$binary_token_group_047_106 - 
            compile time: 16.303ms*/;
function $def$binary_token_HC_listbody1_107(l,data,state){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    pushFN(data,branch_da4737880b1bd090);
    pushFN(data,$def$binary_token_group_047_106);
    return 0;
    return -1;
}
function $def$binary_token_HC_listbody1_107_goto(l,data,state,prod){
    /*[91]*/
    skip_a294e41529bc9275(l/*[ nl ][ 71 ]*/,data,true);
    if(l.isSP(true,data)){
        return 91;
    }
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if((l.current_byte==48/*[0]*/)||(l.current_byte==49/*[1]*/)){
        /*
           91:272 def$binary_token_HC_listbody1_107=>def$binary_token_HC_listbody1_107 • def$binary_token_group_047_106
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_e8b252a4f58d33c8);
        pushFN(data,$def$binary_token_group_047_106);
        return 0;
    }
    return prod == 91 ? prod : -1;
}
/*production name: def$binary_token
            grammar index: 92
            bodies:
	92:274 def$binary_token=>• 0b def$binary_token_HC_listbody1_107 - 
            compile time: 2.017ms*/;
function $def$binary_token(l,data,state){
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(cmpr_set(l,data,113,2,2)){
        /*
           92:274 def$binary_token=>0b • def$binary_token_HC_listbody1_107
        */
        consume(l,data,state);
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        skip_a294e41529bc9275(l/*[ nl ][ 71 ]*/,data,true);
        pushFN(data,branch_4db389afdb5f8499);
        pushFN(data,$def$binary_token_HC_listbody1_107);
        return 0;
    }
    return -1;
}
/*production name: def$octal_token_group_050_108
            grammar index: 93
            bodies:
	93:275 def$octal_token_group_050_108=>• 0o - 
		93:276 def$octal_token_group_050_108=>• 0O - 
            compile time: 1.58ms*/;
function $def$octal_token_group_050_108(l,data,state){
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(dt_bc3480b75045e0d0(l,data)){
        /*
           93:275 def$octal_token_group_050_108=>• 0o
           93:276 def$octal_token_group_050_108=>• 0O
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        consume(l,data,state);
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
            compile time: 2.577ms*/;
function $def$octal_token_group_058_109(l,data,state){
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(assert_ascii(l,0x0,0xff0000,0x0,0x0)){
        /*
           94:277 def$octal_token_group_058_109=>• 0
           94:278 def$octal_token_group_058_109=>• 1
           94:279 def$octal_token_group_058_109=>• 2
           94:280 def$octal_token_group_058_109=>• 3
           94:281 def$octal_token_group_058_109=>• 4
           94:282 def$octal_token_group_058_109=>• 5
           94:283 def$octal_token_group_058_109=>• 6
           94:284 def$octal_token_group_058_109=>• 7
        */
        /*--LEAF--*/
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        consume(l,data,state);
        return 94;
    }
    return -1;
}
/*production name: def$octal_token_HC_listbody1_110
            grammar index: 95
            bodies:
	95:285 def$octal_token_HC_listbody1_110=>• def$octal_token_HC_listbody1_110 def$octal_token_group_058_109 - 
		95:286 def$octal_token_HC_listbody1_110=>• def$octal_token_group_058_109 - 
            compile time: 11.56ms*/;
function $def$octal_token_HC_listbody1_110(l,data,state){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    pushFN(data,branch_c7782fe38088e5d9);
    pushFN(data,$def$octal_token_group_058_109);
    return 0;
    return -1;
}
function $def$octal_token_HC_listbody1_110_goto(l,data,state,prod){
    /*[95]*/
    skip_a294e41529bc9275(l/*[ nl ][ 71 ]*/,data,true);
    if(l.isSP(true,data)){
        return 95;
    }
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(assert_ascii(l,0x0,0xff0000,0x0,0x0)){
        /*
           95:285 def$octal_token_HC_listbody1_110=>def$octal_token_HC_listbody1_110 • def$octal_token_group_058_109
        */
        /*--LEAF--*/
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        pushFN(data,branch_98d96b9e3b2e6979);
        pushFN(data,$def$octal_token_group_058_109);
        return 0;
    }
    return prod == 95 ? prod : -1;
}
/*production name: def$octal_token
            grammar index: 96
            bodies:
	96:287 def$octal_token=>• def$octal_token_group_050_108 def$octal_token_HC_listbody1_110 - 
            compile time: 3.536ms*/;
function $def$octal_token(l,data,state){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    pushFN(data,branch_cf1acfcb741737a6);
    pushFN(data,$def$octal_token_group_050_108);
    return 0;
    return -1;
}
function recognizer(data,input_byte_length,production){
    data.input_len = input_byte_length;
    data.lexer.next(data);
    skip_9184d3c96b70653a(data.lexer/*[ ws ][ nl ][ 71 ]*/,data,true);
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

    function pushFN(data, fn_ref){ data.stack[++data.stack_ptr] = fn_ref; }

    function init_table(){ return lookup_table;  }
    
  
    function dispatch(data, production_index){
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
(env, sym, pos)=>( {type:"module",statements:sym[0]})/*0*/
,(env, sym, pos)=>( (sym[0].push(sym[1]),sym[0]))/*1*/
,(env, sym, pos)=>( [sym[0]])/*2*/
,(env, sym, pos)=>( env.grabTemplateNode("template-statement"))/*3*/
,(env, sym, pos)=>( {type:"namespace",name:sym[1],statements:sym[3]})/*4*/
,(env, sym, pos)=>( {type:"namespace",name:sym[1]})/*5*/
,(env, sym, pos)=>( {type:"class",name:sym[2],inherits:sym[3],modifiers:sym[0]||[],members:sym[5]||[]})/*6*/
,(env, sym, pos)=>( {type:"class",name:sym[1],inherits:sym[2],modifiers:[],members:sym[4]||[]})/*7*/
,(env, sym, pos)=>( {type:"class",name:sym[2],inherits:null,modifiers:sym[0]||[],members:sym[4]||[]})/*8*/
,(env, sym, pos)=>( {type:"class",name:sym[2],inherits:sym[3],modifiers:sym[0]||[],members:[]})/*9*/
,(env, sym, pos)=>( {type:"class",name:sym[1],inherits:null,modifiers:[],members:sym[3]||[]})/*10*/
,(env, sym, pos)=>( {type:"class",name:sym[1],inherits:sym[2],modifiers:[],members:[]})/*11*/
,(env, sym, pos)=>( {type:"class",name:sym[2],inherits:null,modifiers:sym[0]||[],members:[]})/*12*/
,(env, sym, pos)=>( {type:"class",name:sym[1],inherits:null,modifiers:[],members:[]})/*13*/
,(env, sym, pos)=>( {type:"structure",name:sym[2],modifiers:sym[0]||[],properties:sym[4]||[]})/*14*/
,(env, sym, pos)=>( {type:"structure",name:sym[1],modifiers:[],properties:sym[3]||[]})/*15*/
,(env, sym, pos)=>( {type:"structure",name:sym[2],modifiers:sym[0]||[],properties:[]})/*16*/
,(env, sym, pos)=>( {type:"structure",name:sym[1],modifiers:[],properties:[]})/*17*/
,(env, sym, pos)=>( {type:"function",return_type:sym[4],name:sym[2],modifiers:sym[0]||[],parameters:sym[6]||[],expressions:sym[9]||[]})/*18*/
,(env, sym, pos)=>( {type:"function",return_type:sym[3],name:sym[1],modifiers:[],parameters:sym[5]||[],expressions:sym[8]||[]})/*19*/
,(env, sym, pos)=>( {type:"function",return_type:sym[4],name:sym[2],modifiers:sym[0]||[],parameters:[],expressions:sym[8]||[]})/*20*/
,(env, sym, pos)=>( {type:"function",return_type:sym[4],name:sym[2],modifiers:sym[0]||[],parameters:sym[6]||[],expressions:[]})/*21*/
,(env, sym, pos)=>( {type:"function",return_type:sym[3],name:sym[1],modifiers:[],parameters:[],expressions:sym[7]||[]})/*22*/
,(env, sym, pos)=>( {type:"function",return_type:sym[3],name:sym[1],modifiers:[],parameters:sym[5]||[],expressions:[]})/*23*/
,(env, sym, pos)=>( {type:"function",return_type:sym[4],name:sym[2],modifiers:sym[0]||[],parameters:[],expressions:[]})/*24*/
,(env, sym, pos)=>( {type:"function",return_type:sym[3],name:sym[1],modifiers:[],parameters:[],expressions:[]})/*25*/
,(env, sym, pos)=>( {type:"lambda",return_type:sym[3],modifiers:sym[0]||[],parameters:sym[5]||[],expressions:sym[8]||[]})/*26*/
,(env, sym, pos)=>( {type:"lambda",return_type:sym[2],modifiers:[],parameters:sym[4]||[],expressions:sym[7]||[]})/*27*/
,(env, sym, pos)=>( {type:"lambda",return_type:sym[3],modifiers:sym[0]||[],parameters:[],expressions:sym[7]||[]})/*28*/
,(env, sym, pos)=>( {type:"lambda",return_type:sym[3],modifiers:sym[0]||[],parameters:sym[5]||[],expressions:[]})/*29*/
,(env, sym, pos)=>( {type:"lambda",return_type:sym[2],modifiers:[],parameters:[],expressions:sym[6]||[]})/*30*/
,(env, sym, pos)=>( {type:"lambda",return_type:sym[2],modifiers:[],parameters:sym[4]||[],expressions:[]})/*31*/
,(env, sym, pos)=>( {type:"lambda",return_type:sym[3],modifiers:sym[0]||[],parameters:[],expressions:[]})/*32*/
,(env, sym, pos)=>( {type:"lambda",return_type:sym[2],modifiers:[],parameters:[],expressions:[]})/*33*/
,(env, sym, pos)=>( (sym[0].push(sym[2]),sym[0]))/*34*/
,(env, sym, pos)=>( sym[1])/*35*/
,(env, sym, pos)=>( null)/*36*/
,(env, sym, pos)=>( sym[1]?(sym[0].push(sym[1]),sym[0]):sym[0])/*37*/
,(env, sym, pos)=>( {type:"block",expression:sym[1]||[]})/*38*/
,(env, sym, pos)=>( env.grabTemplateNode("template-expression"))/*39*/
,(env, sym, pos)=>( {type:"block",expression:[]})/*40*/
,(env, sym, pos)=>( {type:"assignment",target:(sym[0]),expression:sym[2]})/*41*/
,(env, sym, pos)=>( {type:"if",assertion:sym[1],expression:sym[3],else:sym[4]})/*42*/
,(env, sym, pos)=>( {type:"if",assertion:sym[1],expression:sym[3],else:null})/*43*/
,(env, sym, pos)=>( {type:"operator-expression",list:[sym[0],sym[1]]})/*44*/
,(env, sym, pos)=>( sym[0].list?(sym[0].list.push(sym[1],sym[2]),sym[0]):{type:"operator-expression",list:[sym[0],sym[1],...(sym[2].type=="operator-expression"?sym[2].list:[sym[2]])]})/*45*/
,(env, sym, pos)=>( {type:"parenthesis",expression:sym[1]})/*46*/
,(env, sym, pos)=>( {type:"parenthesis"})/*47*/
,(env, sym, pos)=>( {type:"loop",assertion:sym[1],expression:sym[2]})/*48*/
,(env, sym, pos)=>( {type:"for-loop",initializers:sym[2],assertion:sym[4],post_iteration:sym[6],expression:sym[8]})/*49*/
,(env, sym, pos)=>( {type:"in-loop",initializer:sym[2],target:sym[4],expression:sym[6]})/*50*/
,(env, sym, pos)=>( {type:"loop",assertion:null,expression:sym[1]})/*51*/
,(env, sym, pos)=>( {type:"for-loop",assertion:sym[3],post_iteration:sym[5],expression:sym[7]})/*52*/
,(env, sym, pos)=>( {type:"for-loop",initializers:sym[2],assertion:null,post_iteration:sym[5],expression:sym[7]})/*53*/
,(env, sym, pos)=>( {type:"for-loop",initializers:sym[2],assertion:sym[4],post_iteration:null,expression:sym[7]})/*54*/
,(env, sym, pos)=>( {type:"for-loop",assertion:null,post_iteration:sym[4],expression:sym[6]})/*55*/
,(env, sym, pos)=>( {type:"for-loop",assertion:sym[3],post_iteration:null,expression:sym[6]})/*56*/
,(env, sym, pos)=>( {type:"for-loop",initializers:sym[2],assertion:null,post_iteration:null,expression:sym[6]})/*57*/
,(env, sym, pos)=>( {type:"for-loop",assertion:null,post_iteration:null,expression:sym[5]})/*58*/
,(env, sym, pos)=>( {type:"match",match_expression:sym[0],matches:sym[3]})/*59*/
,(env, sym, pos)=>( {type:"match",match_expression:sym[0],matches:null})/*60*/
,(env, sym, pos)=>( {type:"match-clause",match:sym[0],expression:sym[2]})/*61*/
,(env, sym, pos)=>( {type:"call",reference:sym[0],parameters:sym[2]})/*62*/
,(env, sym, pos)=>( {type:"call",reference:sym[0],parameters:null})/*63*/
,(env, sym, pos)=>( {type:"member-reference",reference:sym[0],property:sym[2]})/*64*/
,(env, sym, pos)=>( {type:"member-expression",reference:sym[0],expression:sym[2]})/*65*/
,(env, sym, pos)=>( (sym[0].type="reference",sym[0]))/*66*/
,(env, sym, pos)=>( {type:"break",expression:sym[1]})/*67*/
,(env, sym, pos)=>( {type:"break",expression:null})/*68*/
,(env, sym, pos)=>( {type:"return",expression:sym[1]})/*69*/
,(env, sym, pos)=>( {type:"return",expression:null})/*70*/
,(env, sym, pos)=>( {type:"continue"})/*71*/
,(env, sym, pos)=>( {type:"declaration",name:(sym[1]),primitive_type:sym[3],modifiers:sym[0]||[],initialization:sym[4]})/*72*/
,(env, sym, pos)=>( {type:"declaration",name:(sym[0]),primitive_type:sym[2],modifiers:[],initialization:sym[3]})/*73*/
,(env, sym, pos)=>( {type:"declaration",name:(sym[1]),primitive_type:sym[3],modifiers:sym[0]||[]})/*74*/
,(env, sym, pos)=>( {type:"declaration",name:(sym[0]),primitive_type:sym[2],modifiers:[]})/*75*/
,(env, sym, pos)=>( {type:"identifier",value:sym[0]})/*76*/
,(env, sym, pos)=>( (sym[0].type="type-reference",sym[0]))/*77*/
,(env, sym, pos)=>( {type:"type-"+sym[0][0]+sym[1]})/*78*/
,(env, sym, pos)=>( {type:"type-string"})/*79*/
,(env, sym, pos)=>( {type:"number",value:sym[0]})/*80*/
,(env, sym, pos)=>( {type:"string",value:sym[0]})/*81*/
,(env, sym, pos)=>( {type:"boolean",value:true})/*82*/
,(env, sym, pos)=>( {type:"boolean",value:false})/*83*/
,(env, sym, pos)=>( {type:"null"})/*84*/
,(env, sym, pos)=>( env.grabTemplateNode("template-value"))/*85*/
,(env, sym, pos)=>( sym[0]+sym[1])/*86*/
,(env, sym, pos)=>( sym[0]+"")/*87*/
,(env, sym, pos)=>( {type:"string",value:sym[1]})/*88*/
,(env, sym, pos)=>( {type:"string",value:null})/*89*/
,(env, sym, pos)=>( {type:"operator",val:sym[0]+sym[1],precedence:0})/*90*/
,(env, sym, pos)=>( {type:"operator",val:sym[0],precedence:0})/*91*/]; 

const parser_factory = ParserFactory(fns, undefined, data);

export { fns as parser_functions, data as parser_data, parser_factory }; 