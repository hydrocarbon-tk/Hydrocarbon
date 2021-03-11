import {ParserFactory} from "@candlefw/hydrocarbon"; 

const data = (()=>{
        
    const lookup_table = new Uint8Array(382976);
    const sequence_lookup = [59,123,125,58,40,41,44,61,61,46,91,93,95,36,92,34,39,47,42,47,60,60,45,45,45,62,62,48,120,105,109,112,111,114,116,110,117,108,108,99,111,110,116,105,110,117,101,115,116,114,105,110,103,102,97,108,115,101,120,112,111,114,116,108,111,111,112,109,97,116,99,104,98,114,101,97,107,114,101,116,117,114,110,117,105,110,116,56,49,50,56,51,50,54,52,116,114,117,101,112,114,105,118,100,65,66,67,68,69,70,53,55,47,47,48,98,105,109,117,116,110,115,99,108,115,102,108,116,101,108,115,101,49,54,112,117,98,48,111,48,79,105,115,105,102,110];
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
            stack_ptr: 0,
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
function branch_001daf9c0d47d623(l,data,state,prod,puid){
    skip_6c02533b5dc0d802(l/*[ ws ][ 71 ]*/,data,state);
    puid |=32;
    pushFN(data,branch_be96c9171385ef22);
    pushFN(data,$comment_group_0143_133);
    return puid;
    return -1;
    /*001daf9c0d47d6237f3400c30da61d97*/
}
function branch_00da74118df8f839(l,data,state,prod,puid){
    skip_a294e41529bc9275(l/*[ nl ][ 71 ]*/,data,state);
    puid |=2;
    pushFN(data,branch_bfb681f46c628980);
    pushFN(data,$def$octal_token_HC_listbody1_110);
    return puid;
    return -1;
    /*00da74118df8f839ae542634e8067a76*/
}
function branch_014397e248dfbf1e(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*90:273 def$binary_token_group_047_106=>• 1*/
    puid |=2;
    consume(l,data,state);
    /*[90]*/
    return prod;
    return -1;
    /*014397e248dfbf1e99f200021a011bb5*/
}
function branch_025777a2fa528643(l,data,state,prod,puid){
    /*36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
    36:114 call_expression=>member_expression • ( )*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==40/*[(]*/){
        consume(l,data,state);
        puid |=2;
        /*36:113 call_expression=>member_expression ( • call_expression_HC_listbody2_114 )
        36:114 call_expression=>member_expression ( • )*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.current_byte==41/*[)]*/){
            pushFN(data,branch_556d6adae510d753);
            return branch_ed9ab7b2c8fd3ab4(l,data,state,prod,2);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if(((((((((((((((/*[if]*/cmpr_set(l,data,143,2,2)||/*[match]*/cmpr_set(l,data,67,5,5))||/*[break]*/cmpr_set(l,data,72,5,5))||/*[return]*/cmpr_set(l,data,77,6,6))||/*[continue]*/cmpr_set(l,data,39,8,8))||/*[loop]*/cmpr_set(l,data,63,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[==]*/cmpr_set(l,data,7,2,2))||dt_bcea2102060eab13(l,data))||/*[true]*/cmpr_set(l,data,95,4,4))||/*[null]*/cmpr_set(l,data,35,4,4))||dt_6ae31dd85a62ef5c(l,data))||assert_ascii(l,0x0,0x194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
            pushFN(data,branch_556d6adae510d753);
            return branch_85e80e0b1ee638b6(l,data,state,prod,2);
        }
    }
    return -1;
    /*025777a2fa528643edf610cee2e2cdc0*/
}
function branch_02d5e18a2428b482(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*7:16 namespace=>ns identifier { • namespace_HC_listbody3_102 }*/
    puid |=8;
    pushFN(data,branch_e190ab952f911801);
    pushFN(data,$namespace_HC_listbody3_102);
    return puid;
    return -1;
    /*02d5e18a2428b482e14728e211e5eb0b*/
}
function branch_0372dbd01ff9f446(l,data,state,prod,puid){
    return 43;
    /*0372dbd01ff9f44628548cae2fe7e1e6*/
}
function branch_038b1722715d8efb(l,data,state,prod,puid){
    pushFN(data,$expression_goto);
    return 21;
    /*038b1722715d8efb9ed568e83d0a0a33*/
}
function branch_03f003fce46af034(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*107:321 def$identifier_symbols=>def$identifier_symbols • -*/
    puid |=8;
    consume(l,data,state);
    add_reduce(state,data,2,87);
    /*[107]*/
    return prod;
    return -1;
    /*03f003fce46af0340c8a7337fb0fefc7*/
}
function branch_041ca6562744cb9c(l,data,state,prod,puid){
    add_reduce(state,data,4,60);
    /*[33]*/
    return 33;
    /*041ca6562744cb9c525ee7ac98f7ebd6*/
}
function branch_04b7db6045e02466(l,data,state,prod,puid){
    add_reduce(state,data,2,87);
    /*[58]*/
    return prod;
    /*04b7db6045e02466088f5a45ce78b966*/
}
function branch_054b65b0befd8913(l,data,state,prod,puid){
    add_reduce(state,data,1,3);
    /*[16]*/
    pushFN(data,$parameters_goto);
    return 16;
    /*054b65b0befd89136bcbafeb9d9422cb*/
}
function branch_054c896f3ff6ceda(l,data,state,prod,puid){
    /*14:44 function_expression=>modifier_list fn : type • ( parameters ) { expression_statements }
    14:46 function_expression=>modifier_list fn : type • ( ) { expression_statements }
    14:47 function_expression=>modifier_list fn : type • ( parameters ) { }
    14:50 function_expression=>modifier_list fn : type • ( ) { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==40/*[(]*/){
        consume(l,data,state);
        puid |=16;
        /*14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
        14:47 function_expression=>modifier_list fn : type ( • parameters ) { }
        14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
        14:50 function_expression=>modifier_list fn : type ( • ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(l.current_byte==41/*[)]*/){
            /*14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
            14:50 function_expression=>modifier_list fn : type ( • ) { }*/
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            puid |=64;
            /*14:46 function_expression=>modifier_list fn : type ( ) • { expression_statements }
            14:50 function_expression=>modifier_list fn : type ( ) • { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if(l.current_byte==123/*[{]*/){
                consume(l,data,state);
                puid |=128;
                /*14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }
                14:50 function_expression=>modifier_list fn : type ( ) { • }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if(l.current_byte==125/*[}]*/){
                    pushFN(data,branch_c3b494f09f364853);
                    return branch_4f452b9fa5813076(l,data,state,prod,128);
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if(((((((((((((((/*[if]*/cmpr_set(l,data,143,2,2)||/*[match]*/cmpr_set(l,data,67,5,5))||/*[break]*/cmpr_set(l,data,72,5,5))||/*[return]*/cmpr_set(l,data,77,6,6))||/*[continue]*/cmpr_set(l,data,39,8,8))||/*[loop]*/cmpr_set(l,data,63,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[==]*/cmpr_set(l,data,7,2,2))||dt_bcea2102060eab13(l,data))||/*[true]*/cmpr_set(l,data,95,4,4))||/*[null]*/cmpr_set(l,data,35,4,4))||dt_6ae31dd85a62ef5c(l,data))||assert_ascii(l,0x0,0x194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
                    pushFN(data,branch_c3b494f09f364853);
                    return branch_3265a14e2ed4539a(l,data,state,prod,128);
                }
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if(assert_ascii(l,0x0,0x10,0x88000000,0x0)||l.isUniID(data)){
            /*14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
            14:47 function_expression=>modifier_list fn : type ( • parameters ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            pushFN(data,branch_935fd6d169e716cd);
            pushFN(data,$parameters);
            puid |=32;
            return puid;
        }
    }
    return -1;
    /*054c896f3ff6cedac564be9c2359060a*/
}
function branch_0585cde914761373(l,data,state,prod,puid){
    add_reduce(state,data,1,88);
    /*[58]*/
    pushFN(data,$string_HC_listbody1_126_goto);
    return 58;
    /*0585cde914761373b39eeb2c150d3916*/
}
function branch_05c2b43331558a0c(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*13:41 function=>fn identifier : type ( parameters ) { • }*/
    puid |=1024;
    consume(l,data,state);
    add_reduce(state,data,9,25);
    /*[13]*/
    return prod;
    return -1;
    /*05c2b43331558a0c3d677a0ee11da269*/
}
function branch_063c26611b6f5f75(l,data,state,prod,puid){
    return 12;
    /*063c26611b6f5f7518549285ff2a363e*/
}
function branch_06cfe146e7444a88(l,data,state,prod,puid){
    /*[21]*/
    pushFN(data,$expression_goto);
    return 21;
    /*06cfe146e7444a88911fddd1a227ab52*/
}
function branch_06d39f12ebd6fe90(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*4:9 statements=>• struct*/
    puid |=16;
    pushFN(data,branch_cbc9ddb32c7cd341);
    pushFN(data,$struct);
    return puid;
    return -1;
    /*06d39f12ebd6fe90fa5a73edad9b1f79*/
}
function branch_075e823756dc8b4f(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=128;
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        puid |=4;
        pushFN(data,branch_be1b240e43f2d413);
        pushFN(data,$expression);
        return puid;
    }
    return -1;
    /*075e823756dc8b4f82513ef906a73fdf*/
}
function branch_076850827979972c(l,data,state,prod,puid){
    add_reduce(state,data,3,0);
    /*[48]*/
    return prod;
    /*076850827979972cb58d13b38796f36e*/
}
function branch_0784b039a84827f7(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*112:331 virtual-104:7:1|--lvl:0=>( parameters ; ; • ) expression*/
    puid |=128;
    consume(l,data,state);
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=4;
    pushFN(data,branch_316bc9033b90f20c);
    pushFN(data,$expression);
    return puid;
    return -1;
    /*0784b039a84827f74440e06bc38624de*/
}
function branch_07c4b2a266e81cdd(l,data,state,prod,puid){
    pushFN(data,$unary_value_goto);
    return 27;
    /*07c4b2a266e81cdd4fa52870e019ca27*/
}
function branch_08f4de060d4411dd(l,data,state,prod,puid){
    /*13:37 function=>fn identifier • : type ( parameters ) { expression_statements }
    13:40 function=>fn identifier • : type ( ) { expression_statements }
    13:41 function=>fn identifier • : type ( parameters ) { }
    13:43 function=>fn identifier • : type ( ) { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==58/*[:]*/){
        consume(l,data,state);
        puid |=8;
        /*13:37 function=>fn identifier : • type ( parameters ) { expression_statements }
        13:40 function=>fn identifier : • type ( ) { expression_statements }
        13:41 function=>fn identifier : • type ( parameters ) { }
        13:43 function=>fn identifier : • type ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_6d07be730d81f9e5);
        pushFN(data,$type);
        puid |=16;
        return puid;
    }
    return -1;
    /*08f4de060d4411ddcf93441b2dcad840*/
}
function branch_092f1a91216dbe81(l,data,state,prod,puid){
    add_reduce(state,data,2,2);
    /*[68]*/
    return prod;
    /*092f1a91216dbe81fe1c19332d6e66b0*/
}
function branch_094c8d184a7eb042(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*12:35 struct=>str identifier { • }*/
    puid |=32;
    consume(l,data,state);
    add_reduce(state,data,4,19);
    /*[12]*/
    return prod;
    return -1;
    /*094c8d184a7eb0426f058ad555cb75de*/
}
function branch_0a5b9c282ee399c8(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$statements_goto);
    return 4;
    /*0a5b9c282ee399c85eb4968a34ce9e70*/
}
function branch_0ae82042e3a9a0e3(l,data,state,prod,puid){
    add_reduce(state,data,2,2);
    /*[95]*/
    return prod;
    /*0ae82042e3a9a0e3820d088faff49726*/
}
function branch_0afc4377b5d1e6da(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*105:316 def$js_id_symbols=>• $*/
    puid |=8;
    consume(l,data,state);
    /*[105]*/
    return prod;
    return -1;
    /*0afc4377b5d1e6da06123affda69b9bc*/
}
function branch_0b080d7abb9c02f6(l,data,state,prod,puid){
    /*25:80 binary_expression=>unary_expression operator •
    25:81 binary_expression=>unary_expression operator • expression*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    switch(sym_map_174451ba753fe315(l,data)){
        default:
        case 0:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*25:80 binary_expression=>unary_expression operator •*/
            add_reduce(state,data,2,46);
            /*[25]*/
            /*-------------INDIRECT-------------------*/
            return 18;
        case 1:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*25:81 binary_expression=>unary_expression operator • expression*/
            puid |=4;
            pushFN(data,branch_de69aa6e18d139e1);
            pushFN(data,$expression);
            return puid;
        case 2:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
            /*25:81 binary_expression=>unary_expression operator • expression*/
            puid |=4;
            pushFN(data,branch_de69aa6e18d139e1);
            pushFN(data,$expression);
            return puid;
    }
    return -1;
    /*0b080d7abb9c02f6d86a3825a20a7343*/
}
function branch_0cb4bad8128c2031(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*87:262 def$hex_token_group_044_104=>• f*/
    puid |=64;
    consume(l,data,state);
    /*[87]*/
    return prod;
    return -1;
    /*0cb4bad8128c2031a553cd0d152784de*/
}
function branch_0cf9847d87517f16(l,data,state,prod,puid){
    /*12:32 struct=>modifier_list str identifier • { parameters }
    12:34 struct=>modifier_list str identifier • { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==123/*[{]*/){
        consume(l,data,state);
        puid |=8;
        /*12:32 struct=>modifier_list str identifier { • parameters }
        12:34 struct=>modifier_list str identifier { • }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.current_byte==125/*[}]*/){
            pushFN(data,branch_063c26611b6f5f75);
            return branch_738e78cb42aaca73(l,data,state,prod,8);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if(assert_ascii(l,0x0,0x10,0x88000000,0x0)||l.isUniID(data)){
            pushFN(data,branch_063c26611b6f5f75);
            return branch_221aa0935ee3496d(l,data,state,prod,8);
        }
    }
    return -1;
    /*0cf9847d87517f16395fdf3dd533f55b*/
}
function branch_0d024cc2430f08e1(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=64;
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,7,8);
        /*[11]*/
        return prod;
    }
    return -1;
    /*0d024cc2430f08e19071ec650003e2be*/
}
function branch_0e3ffad796871f90(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*77:237 def$hex_digit=>• τA*/
    puid |=128;
    consume(l,data,state);
    /*[77]*/
    return prod;
    return -1;
    /*0e3ffad796871f901c0967bba208a2af*/
}
function branch_0e72a2eac35a2fe0(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=64;
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        add_reduce(state,data,3,48);
        /*[27]*/
        return prod;
    }
    return -1;
    /*0e72a2eac35a2fe0d66c7fa8e463e31b*/
}
function branch_0e92d280c0af4e55(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*90:272 def$binary_token_group_047_106=>• 0*/
    puid |=1;
    consume(l,data,state);
    /*[90]*/
    return prod;
    return -1;
    /*0e92d280c0af4e559f48595360c1decc*/
}
function branch_0eb1d8d7c3f2f971(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*94:284 def$octal_token_group_058_109=>• 5*/
    puid |=32;
    consume(l,data,state);
    /*[94]*/
    return prod;
    return -1;
    /*0eb1d8d7c3f2f971ed0fc8d931cf8f0b*/
}
function branch_0ebec1e141e70718(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*87:265 def$hex_token_group_044_104=>• C*/
    puid |=512;
    consume(l,data,state);
    /*[87]*/
    return prod;
    return -1;
    /*0ebec1e141e70718871b7d17237dfa28*/
}
function branch_0edcadab50da60bf(l,data,state,prod,puid){
    /*11:24 class=>modifier_list cls identifier • class_group_113_103 { class_HC_listbody1_105 }
    11:27 class=>modifier_list cls identifier • class_group_113_103 { }
    11:26 class=>modifier_list cls identifier • { class_HC_listbody1_105 }
    11:30 class=>modifier_list cls identifier • { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(l.current_byte==123/*[{]*/){
        /*11:26 class=>modifier_list cls identifier • { class_HC_listbody1_105 }
        11:30 class=>modifier_list cls identifier • { }*/
        var pk = l.copy();
        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,0);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(pk.current_byte==125/*[}]*/){
            pushFN(data,branch_0a5b9c282ee399c8);
            return branch_701a22a9bee4a5f7(l,data,state,prod,4);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else if(((/*[str]*/cmpr_set(pk,data,47,3,3)||/*[fn]*/cmpr_set(pk,data,144,2,2))||assert_ascii(pk,0x0,0x10,0x88000000,0x0))||pk.isUniID(data)){
            pushFN(data,branch_0a5b9c282ee399c8);
            return branch_4e99431b189bbea4(l,data,state,prod,4);
        }
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(/*[is]*/cmpr_set(l,data,141,2,2)){
        /*11:24 class=>modifier_list cls identifier • class_group_113_103 { class_HC_listbody1_105 }
        11:27 class=>modifier_list cls identifier • class_group_113_103 { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_ed882407141495fd);
        pushFN(data,$class_group_113_103);
        puid |=8;
        return puid;
    }
    return -1;
    /*0edcadab50da60bfeb932224e7957cab*/
}
function branch_0f549cade71dd166(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*56:166 value=>• false*/
    puid |=8;
    consume(l,data,state);
    add_reduce(state,data,1,84);
    /*[56]*/
    return prod;
    return -1;
    /*0f549cade71dd166cd401c66f3126d0e*/
}
function branch_101831d684b1ae70(l,data,state,prod,puid){
    /*31:97 loop_expression=>loop ( parameters • ; expression ; loop_expression_HC_listbody6_112 ) expression
    31:100 loop_expression=>loop ( parameters • ; ; loop_expression_HC_listbody6_112 ) expression
    31:101 loop_expression=>loop ( parameters • ; expression ; ) expression
    31:104 loop_expression=>loop ( parameters • ; ; ) expression*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==59/*[;]*/){
        consume(l,data,state);
        puid |=32;
        /*31:97 loop_expression=>loop ( parameters ; • expression ; loop_expression_HC_listbody6_112 ) expression
        31:101 loop_expression=>loop ( parameters ; • expression ; ) expression
        31:100 loop_expression=>loop ( parameters ; • ; loop_expression_HC_listbody6_112 ) expression
        31:104 loop_expression=>loop ( parameters ; • ; ) expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(l.current_byte==59/*[;]*/){
            /*31:100 loop_expression=>loop ( parameters ; • ; loop_expression_HC_listbody6_112 ) expression
            31:104 loop_expression=>loop ( parameters ; • ; ) expression*/
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            puid |=32;
            /*31:100 loop_expression=>loop ( parameters ; ; • loop_expression_HC_listbody6_112 ) expression
            31:104 loop_expression=>loop ( parameters ; ; • ) expression*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if(l.current_byte==41/*[)]*/){
                pushFN(data,branch_3205c0ded576131e);
                return branch_945d145bb77360a1(l,data,state,prod,32);
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if(((((((((((((((/*[if]*/cmpr_set(l,data,143,2,2)||/*[match]*/cmpr_set(l,data,67,5,5))||/*[break]*/cmpr_set(l,data,72,5,5))||/*[return]*/cmpr_set(l,data,77,6,6))||/*[continue]*/cmpr_set(l,data,39,8,8))||/*[loop]*/cmpr_set(l,data,63,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[==]*/cmpr_set(l,data,7,2,2))||dt_bcea2102060eab13(l,data))||/*[true]*/cmpr_set(l,data,95,4,4))||/*[null]*/cmpr_set(l,data,35,4,4))||dt_6ae31dd85a62ef5c(l,data))||assert_ascii(l,0x0,0x194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
                pushFN(data,branch_3205c0ded576131e);
                return branch_cdf07204c86063f9(l,data,state,prod,32);
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if(((((((((((((((/*[if]*/cmpr_set(l,data,143,2,2)||/*[match]*/cmpr_set(l,data,67,5,5))||/*[==]*/cmpr_set(l,data,7,2,2))||dt_bcea2102060eab13(l,data))||dt_6ae31dd85a62ef5c(l,data))||/*[true]*/cmpr_set(l,data,95,4,4))||/*[null]*/cmpr_set(l,data,35,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[break]*/cmpr_set(l,data,72,5,5))||/*[return]*/cmpr_set(l,data,77,6,6))||/*[continue]*/cmpr_set(l,data,39,8,8))||/*[loop]*/cmpr_set(l,data,63,4,4))||assert_ascii(l,0x0,0x194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
            /*31:97 loop_expression=>loop ( parameters ; • expression ; loop_expression_HC_listbody6_112 ) expression
            31:101 loop_expression=>loop ( parameters ; • expression ; ) expression*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            pushFN(data,branch_10d6c2558f44bee8);
            pushFN(data,$expression);
            puid |=4;
            return puid;
        }
    }
    return -1;
    /*101831d684b1ae709ae4ddc227690610*/
}
function branch_104689cb2c001c22(l,data,state,prod,puid){
    add_reduce(state,data,3,91);
    /*[65]*/
    return 65;
    /*104689cb2c001c22562d6734b0807ef5*/
}
function branch_104d5a190a45ad94(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$expression_statements_group_023_108_goto);
    return 18;
    /*104d5a190a45ad9453e0fbad80387357*/
}
function branch_105597e1c2057714(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$string_HC_listbody1_126_goto);
    return 58;
    /*105597e1c20577140410bb17afb41add*/
}
function branch_1066f2a4cb876358(l,data,state,prod,puid){
    add_reduce(state,data,3,65);
    /*[37]*/
    /*-------------INDIRECT-------------------*/
    pushFN(data,$expression_goto);
    return 37;
    /*1066f2a4cb87635821406522eb18166d*/
}
function branch_108221e7792dbbc3(l,data,state,prod,puid){
    add_reduce(state,data,2,46);
    /*[26]*/
    return prod;
    /*108221e7792dbbc3ac388ba53a4ee484*/
}
function branch_10c2d2124b1a4c0e(l,data,state,prod,puid){
    /*13:36 function=>modifier_list fn identifier : type • ( parameters ) { expression_statements }
    13:38 function=>modifier_list fn identifier : type • ( ) { expression_statements }
    13:39 function=>modifier_list fn identifier : type • ( parameters ) { }
    13:42 function=>modifier_list fn identifier : type • ( ) { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==40/*[(]*/){
        consume(l,data,state);
        puid |=32;
        /*13:36 function=>modifier_list fn identifier : type ( • parameters ) { expression_statements }
        13:39 function=>modifier_list fn identifier : type ( • parameters ) { }
        13:38 function=>modifier_list fn identifier : type ( • ) { expression_statements }
        13:42 function=>modifier_list fn identifier : type ( • ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(l.current_byte==41/*[)]*/){
            /*13:38 function=>modifier_list fn identifier : type ( • ) { expression_statements }
            13:42 function=>modifier_list fn identifier : type ( • ) { }*/
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            puid |=128;
            /*13:38 function=>modifier_list fn identifier : type ( ) • { expression_statements }
            13:42 function=>modifier_list fn identifier : type ( ) • { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if(l.current_byte==123/*[{]*/){
                consume(l,data,state);
                puid |=256;
                /*13:38 function=>modifier_list fn identifier : type ( ) { • expression_statements }
                13:42 function=>modifier_list fn identifier : type ( ) { • }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if(l.current_byte==125/*[}]*/){
                    pushFN(data,branch_cbc044c8c9b81bf7);
                    return branch_7cfa07d08abada9e(l,data,state,prod,256);
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if(((((((((((((((/*[if]*/cmpr_set(l,data,143,2,2)||/*[match]*/cmpr_set(l,data,67,5,5))||/*[break]*/cmpr_set(l,data,72,5,5))||/*[return]*/cmpr_set(l,data,77,6,6))||/*[continue]*/cmpr_set(l,data,39,8,8))||/*[loop]*/cmpr_set(l,data,63,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[==]*/cmpr_set(l,data,7,2,2))||dt_bcea2102060eab13(l,data))||/*[true]*/cmpr_set(l,data,95,4,4))||/*[null]*/cmpr_set(l,data,35,4,4))||dt_6ae31dd85a62ef5c(l,data))||assert_ascii(l,0x0,0x194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
                    pushFN(data,branch_cbc044c8c9b81bf7);
                    return branch_74c9dcedde02724c(l,data,state,prod,256);
                }
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if(assert_ascii(l,0x0,0x10,0x88000000,0x0)||l.isUniID(data)){
            /*13:36 function=>modifier_list fn identifier : type ( • parameters ) { expression_statements }
            13:39 function=>modifier_list fn identifier : type ( • parameters ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            pushFN(data,branch_f39324a528fa60e6);
            pushFN(data,$parameters);
            puid |=64;
            return puid;
        }
    }
    return -1;
    /*10c2d2124b1a4c0ec158ca9f7c157dc1*/
}
function branch_10d6c2558f44bee8(l,data,state,prod,puid){
    /*31:97 loop_expression=>loop ( parameters ; expression • ; loop_expression_HC_listbody6_112 ) expression
    31:101 loop_expression=>loop ( parameters ; expression • ; ) expression*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==59/*[;]*/){
        consume(l,data,state);
        puid |=32;
        /*31:97 loop_expression=>loop ( parameters ; expression ; • loop_expression_HC_listbody6_112 ) expression
        31:101 loop_expression=>loop ( parameters ; expression ; • ) expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.current_byte==41/*[)]*/){
            pushFN(data,branch_3205c0ded576131e);
            return branch_e8975322cbc36b12(l,data,state,prod,32);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if(((((((((((((((/*[if]*/cmpr_set(l,data,143,2,2)||/*[match]*/cmpr_set(l,data,67,5,5))||/*[break]*/cmpr_set(l,data,72,5,5))||/*[return]*/cmpr_set(l,data,77,6,6))||/*[continue]*/cmpr_set(l,data,39,8,8))||/*[loop]*/cmpr_set(l,data,63,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[==]*/cmpr_set(l,data,7,2,2))||dt_bcea2102060eab13(l,data))||/*[true]*/cmpr_set(l,data,95,4,4))||/*[null]*/cmpr_set(l,data,35,4,4))||dt_6ae31dd85a62ef5c(l,data))||assert_ascii(l,0x0,0x194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
            pushFN(data,branch_3205c0ded576131e);
            return branch_aea534ce4c958f57(l,data,state,prod,32);
        }
    }
    return -1;
    /*10d6c2558f44bee8a14c216abee2e425*/
}
function branch_10fdc71a0d85872b(l,data,state,prod,puid){
    /*[109]*/
    return prod;
    /*10fdc71a0d85872b48feb05600a14bd6*/
}
function branch_115f6d84935ced8f(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*87:266 def$hex_token_group_044_104=>• D*/
    puid |=1024;
    consume(l,data,state);
    /*[87]*/
    return prod;
    return -1;
    /*115f6d84935ced8f6983783afff982a1*/
}
function branch_11d890e1265c30e7(l,data,state,prod,puid){
    pushFN(data,$expression_statements_group_023_108_goto);
    return 44;
    /*11d890e1265c30e7b243cc2af04fe35b*/
}
function branch_1202bfb712d31996(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$unary_value_goto);
    return 27;
    /*1202bfb712d31996ec80d4368861e54a*/
}
function branch_1260e9368afd7229(l,data,state,prod,puid){
    add_reduce(state,data,2,2);
    /*[99]*/
    return prod;
    /*1260e9368afd7229874bb33670ae0b98*/
}
function branch_12a689fd4ff74029(l,data,state,prod,puid){
    /*[9]*/
    return prod;
    /*12a689fd4ff740297e424064fdf422fc*/
}
function branch_12c35f486abaab8c(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    /*36:114 call_expression=>member_expression • ( )*/
    puid |=2;
    consume(l,data,state);
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=8;
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        add_reduce(state,data,3,64);
        /*[36]*/
        return prod;
    }
    return -1;
    /*12c35f486abaab8ce1d4cd9595ddc640*/
}
function branch_12faf4a3684793de(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*77:241 def$hex_digit=>• τE*/
    puid |=2048;
    consume(l,data,state);
    /*[77]*/
    return prod;
    return -1;
    /*12faf4a3684793de7c60d92b71e072ec*/
}
function branch_1452a70aa69fc4d3(l,data,state,prod,puid){
    add_reduce(state,data,1,3);
    /*[6]*/
    pushFN(data,$namespace_HC_listbody3_102_goto);
    return 6;
    /*1452a70aa69fc4d35efd7146e14c9654*/
}
function branch_145356fed6e0a55b(l,data,state,prod,puid){
    add_reduce(state,data,1,88);
    /*[102]*/
    pushFN(data,$def$string_value_HC_listbody2_114_goto);
    return 102;
    /*145356fed6e0a55bd919a02283267de6*/
}
function branch_1459c7d2ca7026a1(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*67:207 comment_group_0138_130=>• θnum*/
    puid |=4;
    consume(l,data,state);
    /*[67]*/
    return prod;
    return -1;
    /*1459c7d2ca7026a17244e05e1bfb9542*/
}
function branch_148f8b6b7ea6c5cd(l,data,state,prod,puid){
    add_reduce(state,data,2,0);
    /*[89]*/
    return 89;
    /*148f8b6b7ea6c5cde410f0ae1e095311*/
}
function branch_14901645889b85d3(l,data,state,prod,puid){
    /*[18]*/
    pushFN(data,$expression_statements_group_023_108_goto);
    return 18;
    /*14901645889b85d38131e08c4db7341a*/
}
function branch_14bba0ad9ca93537(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*105:313 def$js_id_symbols=>def$js_id_symbols • $*/
    puid |=8;
    consume(l,data,state);
    add_reduce(state,data,2,87);
    /*[105]*/
    return prod;
    return -1;
    /*14bba0ad9ca93537d4db1aa7ca7de6a6*/
}
function branch_155449b593c9e03d(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*14:48 function_expression=>fn : type ( ) { • expression_statements }*/
    puid |=256;
    pushFN(data,branch_b88ca848a1175e09);
    pushFN(data,$expression_statements);
    return puid;
    return -1;
    /*155449b593c9e03df492ba0d1859fb5e*/
}
function branch_15c73062595875da(l,data,state,prod,puid){
    add_reduce(state,data,2,39);
    /*[20]*/
    return prod;
    /*15c73062595875da4a974f76a89124da*/
}
function branch_1628d244e672d0a0(l,data,state,prod,puid){
    /*12:32 struct=>modifier_list • str identifier { parameters }
    12:34 struct=>modifier_list • str identifier { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(/*[str]*/cmpr_set(l,data,47,3,3)){
        consume(l,data,state);
        puid |=2;
        /*12:32 struct=>modifier_list str • identifier { parameters }
        12:34 struct=>modifier_list str • identifier { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_0cf9847d87517f16);
        pushFN(data,$identifier);
        puid |=4;
        return puid;
    }
    return -1;
    /*1628d244e672d0a036ba7b5573651ad4*/
}
function branch_16ce239ddb9771e1(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*97:291 def$string=>• ' def$string_token '*/
    puid |=4;
    consume(l,data,state);
    skip_a294e41529bc9275(l/*[ nl ][ 71 ]*/,data,state);
    puid |=2;
    pushFN(data,branch_9360f80350dce697);
    pushFN(data,$def$string_token);
    return puid;
    return -1;
    /*16ce239ddb9771e108e462ab048a2022*/
}
function branch_1709042e778d5127(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=128;
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        puid |=4;
        pushFN(data,branch_6d263a3bd11654e3);
        pushFN(data,$expression);
        return puid;
    }
    return -1;
    /*1709042e778d5127815ef1f7f61976f9*/
}
function branch_182fbd57c7171eea(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*4:12 statements=>• template*/
    puid |=128;
    pushFN(data,branch_defe7f8a739c3919);
    pushFN(data,$template);
    return puid;
    return -1;
    /*182fbd57c7171eea86628c2415cfea55*/
}
function branch_18a5ece9623c6cf7(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    /*65:197 operator=>• θsym*/
    puid |=1;
    consume(l,data,state);
    add_reduce(state,data,1,92);
    /*[65]*/
    return prod;
    return -1;
    /*18a5ece9623c6cf74bca0af275cb6ad7*/
}
function branch_18d86dfd14efd6df(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*9:21 class_group_016_104=>• function*/
    puid |=4;
    pushFN(data,branch_12a689fd4ff74029);
    pushFN(data,$function);
    return puid;
    return -1;
    /*18d86dfd14efd6df5587b44493d635cd*/
}
function branch_192ab89f18f9d91c(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*26:84 unary_expression=>• unary_value*/
    puid |=2;
    pushFN(data,branch_b5e9476a4c00af0a);
    pushFN(data,$unary_value);
    return puid;
    return -1;
    /*192ab89f18f9d91c09b3adc7ccf589e5*/
}
function branch_199c281bdc387c44(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*66:203 modifier=>• imut*/
    puid |=16;
    consume(l,data,state);
    /*[66]*/
    return prod;
    return -1;
    /*199c281bdc387c445c8cc0c5e62a5f51*/
}
function branch_1a855fd31e8b5ab3(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    /*60:181 string=>• ' '*/
    puid |=4;
    consume(l,data,state);
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=4;
    if((l.current_byte==39/*[']*/)&&consume(l,data,state)){
        add_reduce(state,data,2,90);
        /*[60]*/
        return prod;
    }
    return -1;
    /*1a855fd31e8b5ab3c0e8ec6463b03108*/
}
function branch_1a9b92d8e81556d6(l,data,state,prod,puid){
    return 72;
    /*1a9b92d8e81556d673610a8dbda1fcf5*/
}
function branch_1ac32cd10b3e6d0e(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=32;
    if((l.current_byte==93/*[]]*/)&&consume(l,data,state)){
        add_reduce(state,data,4,66);
        /*[37]*/
        /*-------------INDIRECT-------------------*/
        pushFN(data,$unary_value_goto);
        return 37;
    }
    return -1;
    /*1ac32cd10b3e6d0e2a940fa9bd982aff*/
}
function branch_1cb22634391af254(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*6:14 namespace_HC_listbody3_102=>namespace_HC_listbody3_102 • statements*/
    puid |=2;
    pushFN(data,branch_e30e6d3550ca9c55);
    pushFN(data,$statements);
    return puid;
    return -1;
    /*1cb22634391af2541067c9a8ca2d40b0*/
}
function branch_1cb932d4add48d2f(l,data,state,prod,puid){
    add_reduce(state,data,7,57);
    /*[31]*/
    return prod;
    /*1cb932d4add48d2f22b0cc92ee98e704*/
}
function branch_1d51f74a2236a4f8(l,data,state,prod,puid){
    add_reduce(state,data,2,2);
    /*[88]*/
    return prod;
    /*1d51f74a2236a4f82dfc1cb303a4924e*/
}
function branch_1d70c16834b7f911(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=2;
    if((l.current_byte==58/*[:]*/)&&consume(l,data,state)){
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        puid |=1;
        pushFN(data,branch_9d20a12beef95619);
        pushFN(data,$expression);
        return puid;
    }
    return -1;
    /*1d70c16834b7f91195ebeef8079e8a88*/
}
function branch_1d85cb19320ba2ff(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*75:222 def$defaultproductions=>def$defaultproductions • θws def$defaultproduction*/
    puid |=2;
    consume(l,data,state);
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=4;
    pushFN(data,branch_5176e61dd17d4eba);
    pushFN(data,$def$defaultproduction);
    return puid;
    return -1;
    /*1d85cb19320ba2ff9215f13eaf87597a*/
}
function branch_1da7362f23bcdcc2(l,data,state,prod,puid){
    /*110:329 virtual-192:3:1|--lvl:0=>• operator_HC_listbody1_129 identifier_token_group_079_119
    111:330 virtual-196:2:1|--lvl:0=>• operator_HC_listbody1_129*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.isSym(true,data)){
        /*110:329 virtual-192:3:1|--lvl:0=>• operator_HC_listbody1_129 identifier_token_group_079_119
        111:330 virtual-196:2:1|--lvl:0=>• operator_HC_listbody1_129*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_7754ee6681a28e7f);
        pushFN(data,$operator_HC_listbody1_129);
        puid |=16;
        return puid;
    }
    return -1;
    /*1da7362f23bcdcc2af41a77248130db2*/
}
function branch_1ef98ba8b0defeed(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    /*37:116 member_expression=>member_expression • [ expression ]*/
    puid |=8;
    consume(l,data,state);
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=16;
    pushFN(data,branch_ad1ea6e91f9a5850);
    pushFN(data,$expression);
    return puid;
    return -1;
    /*1ef98ba8b0defeed6c740d9a1e38b46d*/
}
function branch_1f9ddf3c27180aa0(l,data,state,prod,puid){
    return prod;
    /*1f9ddf3c27180aa0dff88bc66c940765*/
}
function branch_1fd0233e235cc36b(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*118:337 virtual-331:6:1|--lvl:1=>parameters ; ; • ) expression*/
    puid |=128;
    consume(l,data,state);
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=4;
    pushFN(data,branch_c4b62b3103720aeb);
    pushFN(data,$expression);
    return puid;
    return -1;
    /*1fd0233e235cc36b61274c4a5e956217*/
}
function branch_210c2a4c4c8c80e1(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*82:248 def$scientific_token_group_027_101=>• E*/
    puid |=2;
    consume(l,data,state);
    /*[82]*/
    return prod;
    return -1;
    /*210c2a4c4c8c80e1c5ace0720ffc85ae*/
}
function branch_2140a947a49cd129(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*62:186 num_tok=>• def$octal*/
    puid |=8;
    pushFN(data,branch_91f6e30711bde8c4);
    pushFN(data,$def$octal);
    return puid;
    return -1;
    /*2140a947a49cd12984efc4f205e53b13*/
}
function branch_218771f40836dff0(l,data,state,prod,puid){
    /*14:44 function_expression=>modifier_list fn : type ( parameters • ) { expression_statements }
    14:47 function_expression=>modifier_list fn : type ( parameters • ) { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==41/*[)]*/){
        consume(l,data,state);
        puid |=64;
        /*14:44 function_expression=>modifier_list fn : type ( parameters ) • { expression_statements }
        14:47 function_expression=>modifier_list fn : type ( parameters ) • { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if(l.current_byte==123/*[{]*/){
            consume(l,data,state);
            puid |=128;
            /*14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }
            14:47 function_expression=>modifier_list fn : type ( parameters ) { • }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if(l.current_byte==125/*[}]*/){
                pushFN(data,branch_74c8218421c7bef8);
                return branch_44d39e4d2e186b48(l,data,state,prod,128);
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if(((((((((((((((/*[if]*/cmpr_set(l,data,143,2,2)||/*[match]*/cmpr_set(l,data,67,5,5))||/*[break]*/cmpr_set(l,data,72,5,5))||/*[return]*/cmpr_set(l,data,77,6,6))||/*[continue]*/cmpr_set(l,data,39,8,8))||/*[loop]*/cmpr_set(l,data,63,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[==]*/cmpr_set(l,data,7,2,2))||dt_bcea2102060eab13(l,data))||/*[true]*/cmpr_set(l,data,95,4,4))||/*[null]*/cmpr_set(l,data,35,4,4))||dt_6ae31dd85a62ef5c(l,data))||assert_ascii(l,0x0,0x194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
                pushFN(data,branch_74c8218421c7bef8);
                return branch_60927a7f49a5a57b(l,data,state,prod,128);
            }
        }
    }
    return -1;
    /*218771f40836dff00e9524130f0cfa23*/
}
function branch_221aa0935ee3496d(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*12:32 struct=>modifier_list str identifier { • parameters }*/
    puid |=16;
    pushFN(data,branch_b1c7f28f94201acb);
    pushFN(data,$parameters);
    return puid;
    return -1;
    /*221aa0935ee3496d1b14627bb2818686*/
}
function branch_229d035f52468bb9(l,data,state,prod,puid){
    /*12:33 struct=>str identifier • { parameters }
    12:35 struct=>str identifier • { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==123/*[{]*/){
        consume(l,data,state);
        puid |=8;
        /*12:33 struct=>str identifier { • parameters }
        12:35 struct=>str identifier { • }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.current_byte==125/*[}]*/){
            pushFN(data,branch_063c26611b6f5f75);
            return branch_094c8d184a7eb042(l,data,state,prod,8);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if(assert_ascii(l,0x0,0x10,0x88000000,0x0)||l.isUniID(data)){
            pushFN(data,branch_063c26611b6f5f75);
            return branch_9afa4e6850eb2793(l,data,state,prod,8);
        }
    }
    return -1;
    /*229d035f52468bb9547987a792839928*/
}
function branch_2309075b495b632b(l,data,state,prod,puid){
    /*[121]*/
    return prod;
    /*2309075b495b632b9134251eebcb07e7*/
}
function branch_235b65124f414af8(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*52:148 type_group_091_122=>• 8*/
    puid |=1;
    consume(l,data,state);
    /*[52]*/
    return prod;
    return -1;
    /*235b65124f414af84489930c5d4f4c75*/
}
function branch_23682326cb240dce(l,data,state,prod,puid){
    return 100;
    /*23682326cb240dce38a8bf2dbb1ba6ba*/
}
function branch_2392b7b3a01e4cef(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,branch_7eb1981bd29a0a82);
    return 26;
    /*2392b7b3a01e4cef2130119012984ed8*/
}
function branch_23c8fe0c669262f0(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*31:105 loop_expression=>loop ( ; ; • ) expression*/
    puid |=128;
    consume(l,data,state);
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=4;
    pushFN(data,branch_9199c6e5ff3d6206);
    pushFN(data,$expression);
    return puid;
    return -1;
    /*23c8fe0c669262f0ee3f119d105fb831*/
}
function branch_25caec2d87c1b4d8(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*46:133 identifier_token_HC_listbody1_118=>identifier_token_HC_listbody1_118 • identifier_token_group_074_117*/
    puid |=2;
    pushFN(data,branch_691d347940964966);
    pushFN(data,$identifier_token_group_074_117);
    return puid;
    return -1;
    /*25caec2d87c1b4d8540ff47a2cc9f948*/
}
function branch_2609292db6fd2ae2(l,data,state,prod,puid){
    add_reduce(state,data,3,65);
    /*[37]*/
    /*-------------INDIRECT-------------------*/
    pushFN(data,branch_7eb1981bd29a0a82);
    return 37;
    /*2609292db6fd2ae28fabe38c23d12a2c*/
}
function branch_2613e402373430d1(l,data,state,prod,puid){
    add_reduce(state,data,2,0);
    /*[71]*/
    return prod;
    /*2613e402373430d11f1852931e3b89fd*/
}
function branch_2642273e9d37bde9(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*93:278 def$octal_token_group_050_108=>• 0O*/
    puid |=2;
    consume(l,data,state);
    /*[93]*/
    return prod;
    return -1;
    /*2642273e9d37bde9e4f161d12aaf276d*/
}
function branch_2723d54886e8ee23(l,data,state,prod,puid){
    pushFN(data,$def$js_id_symbols_goto);
    return 105;
    /*2723d54886e8ee235f797a651a055287*/
}
function branch_2785e1f0c964013a(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*94:282 def$octal_token_group_058_109=>• 3*/
    puid |=8;
    consume(l,data,state);
    /*[94]*/
    return prod;
    return -1;
    /*2785e1f0c964013a7065f394db7d1ddc*/
}
function branch_27c82a8b9221ece8(l,data,state,prod,puid){
    add_reduce(state,data,1,3);
    /*[91]*/
    pushFN(data,$def$binary_token_HC_listbody1_107_goto);
    return 91;
    /*27c82a8b9221ece87fcdac8e52c1440e*/
}
function branch_284859c41cd04d90(l,data,state,prod,puid){
    /*12:32 struct=>modifier_list str identifier • { parameters }
    12:34 struct=>modifier_list str identifier • { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==123/*[{]*/){
        consume(l,data,state);
        puid |=8;
        /*12:32 struct=>modifier_list str identifier { • parameters }
        12:34 struct=>modifier_list str identifier { • }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.current_byte==125/*[}]*/){
            pushFN(data,branch_cbc044c8c9b81bf7);
            return branch_738e78cb42aaca73(l,data,state,prod,8);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if(assert_ascii(l,0x0,0x10,0x88000000,0x0)||l.isUniID(data)){
            pushFN(data,branch_cbc044c8c9b81bf7);
            return branch_221aa0935ee3496d(l,data,state,prod,8);
        }
    }
    return -1;
    /*284859c41cd04d90a5410f257f4d337a*/
}
function branch_28c5dc3955a9ede3(l,data,state,prod,puid){
    pushFN(data,$statements_goto);
    return 50;
    /*28c5dc3955a9ede301c5ab8f3b51de91*/
}
function branch_28cb46e37bbb9f8c(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*115:334 virtual-328:8:1|--lvl:1=>parameters ; expression ; • loop_expression_HC_listbody6_112 ) expression*/
    puid |=64;
    pushFN(data,branch_a519c87d3f7d1f9c);
    pushFN(data,$loop_expression_HC_listbody6_112);
    return puid;
    return -1;
    /*28cb46e37bbb9f8cc1cf4e95f647206a*/
}
function branch_28cc5ae95187f867(l,data,state,prod,puid){
    add_reduce(state,data,1,67);
    /*[37]*/
    pushFN(data,$member_expression_goto);
    return 37;
    /*28cc5ae95187f8677037d71656ce0000*/
}
function branch_28ed74bf96b1a974(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    add_reduce(state,data,1,3);
    pushFN(data,$expression_statements_goto);
    return 20;
    /*28ed74bf96b1a97473e32cb4767531db*/
}
function branch_29110ea098e39fbc(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*45:132 identifier_token_group_074_117=>• $*/
    puid |=4;
    consume(l,data,state);
    /*[45]*/
    return prod;
    return -1;
    /*29110ea098e39fbc8874536c8bc5bf82*/
}
function branch_2959660f57d39533(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$def$string_value_goto);
    return 103;
    /*2959660f57d39533f0f994813e644e32*/
}
function branch_2968f1d85e88b624(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=2;
    pushFN(data,branch_108221e7792dbbc3);
    pushFN(data,$unary_value);
    return puid;
    return -1;
    /*2968f1d85e88b62451113cfe4487b42c*/
}
function branch_29bbdc70dcef3ee4(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$operator_HC_listbody1_129_goto);
    return 64;
    /*29bbdc70dcef3ee49cc0234380000d7b*/
}
function branch_29bbdf58183bc8d7(l,data,state,prod,puid){
    pushFN(data,$statements_goto);
    return 4;
    /*29bbdf58183bc8d7e7031e798ef6fa26*/
}
function branch_29e57603c3f39f3b(l,data,state,prod,puid){
    /*14:44 function_expression=>modifier_list fn : type ( parameters • ) { expression_statements }
    14:47 function_expression=>modifier_list fn : type ( parameters • ) { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==41/*[)]*/){
        consume(l,data,state);
        puid |=64;
        /*14:44 function_expression=>modifier_list fn : type ( parameters ) • { expression_statements }
        14:47 function_expression=>modifier_list fn : type ( parameters ) • { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if(l.current_byte==123/*[{]*/){
            consume(l,data,state);
            puid |=128;
            /*14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }
            14:47 function_expression=>modifier_list fn : type ( parameters ) { • }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if(l.current_byte==125/*[}]*/){
                pushFN(data,branch_521f65aff0d7939b);
                return branch_44d39e4d2e186b48(l,data,state,prod,128);
            }
        }
    }
    return -1;
    /*29e57603c3f39f3badc8d8ba81fd05d9*/
}
function branch_2a33947dd011020b(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$identifier_token_HC_listbody1_118_goto);
    return 46;
    /*2a33947dd011020b9c52725d27fab463*/
}
function branch_2d61734a600d2ee0(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*82:247 def$scientific_token_group_027_101=>• e*/
    puid |=1;
    consume(l,data,state);
    /*[82]*/
    return prod;
    return -1;
    /*2d61734a600d2ee0dbb01a72e19cae49*/
}
function branch_2d618ac67858219f(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*107:324 def$identifier_symbols=>• _*/
    puid |=4;
    consume(l,data,state);
    /*[107]*/
    return prod;
    return -1;
    /*2d618ac67858219fba5d172591495017*/
}
function branch_2d70052e1cc76d5c(l,data,state,prod,puid){
    return 13;
    /*2d70052e1cc76d5ca68f75375edd7e05*/
}
function branch_2d91057f5b4b0977(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=8;
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        add_reduce(state,data,4,63);
        /*[36]*/
        return prod;
    }
    return -1;
    /*2d91057f5b4b09771d275b90c2b5b62b*/
}
function branch_2e15118ce65949ae(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*4:8 statements=>• primitive_declaration ;*/
    puid |=4;
    pushFN(data,branch_f561d50216546003);
    pushFN(data,$primitive_declaration);
    return puid;
    return -1;
    /*2e15118ce65949aea2c270132fa2dcea*/
}
function branch_2ebb3dacba020113(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*14:49 function_expression=>fn : type ( parameters ) { • }*/
    puid |=512;
    consume(l,data,state);
    add_reduce(state,data,8,33);
    /*[14]*/
    return prod;
    return -1;
    /*2ebb3dacba020113215cb610ac8abea0*/
}
function branch_2efddd458ddec2fb(l,data,state,prod,puid){
    add_reduce(state,data,3,36);
    /*[16]*/
    return prod;
    /*2efddd458ddec2fb78c381d150ceb0d5*/
}
function branch_2f0ee969552d9363(l,data,state,prod,puid){
    /*48:137 identifier_token=>identifier_token_group_074_117 identifier_token_HC_listbody1_118 • identifier_token_group_079_119
    48:139 identifier_token=>identifier_token_group_074_117 identifier_token_HC_listbody1_118 •*/
    skip_db1786a8af54d666(l/*[ 71 ]*/,data,state);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/){
        pushFN(data,branch_73df4fa2a9e9bee1);
        return branch_ebcd0697220bc3cf(l,data,state,prod,2);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*48:139 identifier_token=>identifier_token_group_074_117 identifier_token_HC_listbody1_118 •*/
        add_reduce(state,data,2,0);
        /*[48]*/
        return 48;
    }
    return -1;
    /*2f0ee969552d936373d90a59ef0ed10e*/
}
function branch_3008f2fb2bb017b3(l,data,state,prod,puid){
    add_reduce(state,data,1,3);
    /*[30]*/
    pushFN(data,$loop_expression_HC_listbody6_112_goto);
    return 30;
    /*3008f2fb2bb017b3a29c3ea206d79e89*/
}
function branch_305989209a33623b(l,data,state,prod,puid){
    add_reduce(state,data,2,0);
    /*[42]*/
    return 42;
    /*305989209a33623bccdb0b94459ee47d*/
}
function branch_308bdd9a72b6d6bd(l,data,state,prod,puid){
    return 45;
    /*308bdd9a72b6d6bdae6b49b62a281501*/
}
function branch_309c5df4432cbec2(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*11:24 class=>modifier_list cls identifier class_group_113_103 { • class_HC_listbody1_105 }*/
    puid |=32;
    pushFN(data,branch_0d024cc2430f08e1);
    pushFN(data,$class_HC_listbody1_105);
    return puid;
    return -1;
    /*309c5df4432cbec2bded39fd5c5d2f2d*/
}
function branch_30ea0a2a208c1527(l,data,state,prod,puid){
    add_reduce(state,data,1,3);
    /*[2]*/
    pushFN(data,$module_HC_listbody1_101_goto);
    return 2;
    /*30ea0a2a208c1527715be95cec27595e*/
}
function branch_310cb76c8fb0aa32(l,data,state,prod,puid){
    /*11:24 class=>modifier_list cls identifier class_group_113_103 • { class_HC_listbody1_105 }
    11:27 class=>modifier_list cls identifier class_group_113_103 • { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==123/*[{]*/){
        consume(l,data,state);
        puid |=16;
        /*11:24 class=>modifier_list cls identifier class_group_113_103 { • class_HC_listbody1_105 }
        11:27 class=>modifier_list cls identifier class_group_113_103 { • }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.current_byte==125/*[}]*/){
            pushFN(data,branch_7dcd4e56969f4413);
            return branch_3f1d54319119cb30(l,data,state,prod,16);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if(((/*[str]*/cmpr_set(l,data,47,3,3)||/*[fn]*/cmpr_set(l,data,144,2,2))||assert_ascii(l,0x0,0x10,0x88000000,0x0))||l.isUniID(data)){
            pushFN(data,branch_7dcd4e56969f4413);
            return branch_309c5df4432cbec2(l,data,state,prod,16);
        }
    }
    return -1;
    /*310cb76c8fb0aa3266f3cd885ce28099*/
}
function branch_314cbbc9412fc117(l,data,state,prod,puid){
    add_reduce(state,data,3,36);
    /*[35]*/
    return prod;
    /*314cbbc9412fc1175f1ac44d478d4edd*/
}
function branch_316bc9033b90f20c(l,data,state,prod,puid){
    /*[112]*/
    return prod;
    /*316bc9033b90f20cb7c8a8b97d51e427*/
}
function branch_3205c0ded576131e(l,data,state,prod,puid){
    /*3205c0ded576131ea255ad2bd38b0fb2*/
}
function branch_3265a14e2ed4539a(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }*/
    puid |=256;
    pushFN(data,branch_c72422ee35ca2262);
    pushFN(data,$expression_statements);
    return puid;
    return -1;
    /*3265a14e2ed4539abda5e54e67ad55d4*/
}
function branch_34dc087b648697b1(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*52:150 type_group_091_122=>• 32*/
    puid |=4;
    consume(l,data,state);
    /*[52]*/
    return prod;
    return -1;
    /*34dc087b648697b182d7f4d7c93c18e8*/
}
function branch_3542cba400bdc4b9(l,data,state,prod,puid){
    return 67;
    /*3542cba400bdc4b9ce1e16224c015816*/
}
function branch_37379fecdf80f257(l,data,state,prod,puid){
    add_reduce(state,data,3,91);
    /*[65]*/
    return prod;
    /*37379fecdf80f257720a6f9b70f9344f*/
}
function branch_37f9c24b9f945923(l,data,state,prod,puid){
    pushFN(data,branch_7eb1981bd29a0a82);
    return 44;
    /*37f9c24b9f9459230546e1332c418709*/
}
function branch_38be0adead57effb(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*62:183 num_tok=>• def$number*/
    puid |=1;
    pushFN(data,branch_91f6e30711bde8c4);
    pushFN(data,$def$number);
    return puid;
    return -1;
    /*38be0adead57effb801866c4fc3ea7a9*/
}
function branch_39cd0577e37e3812(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*4:10 statements=>• function*/
    puid |=32;
    pushFN(data,branch_cbc9ddb32c7cd341);
    pushFN(data,$function);
    return puid;
    return -1;
    /*39cd0577e37e38122e78951524e41af9*/
}
function branch_3a6903a3d6448ba8(l,data,state,prod,puid){
    /*114:333 virtual-92:3:1|--lvl:1=>• expression )
    115:334 virtual-328:8:1|--lvl:1=>• parameters ; expression ; loop_expression_HC_listbody6_112 ) expression
    116:335 virtual-329:7:1|--lvl:1=>• parameters ; ; loop_expression_HC_listbody6_112 ) expression
    117:336 virtual-330:7:1|--lvl:1=>• parameters ; expression ; ) expression
    118:337 virtual-331:6:1|--lvl:1=>• parameters ; ; ) expression
    119:338 virtual-332:6:1|--lvl:1=>• primitive_declaration in expression ) expression*/
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(assert_ascii(l,0x0,0x10,0x88000000,0x0)||l.isUniID(data)){
        /*44:129 identifier=>• tk:identifier_token
        50:143 modifier_list=>• [ modifier_list_HC_listbody1_120 ]*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.current_byte==91/*[[]*/){
            pushFN(data,branch_e529322d3d6793d1);
            return branch_f0133d64f87a5b0d(l,data,state,prod,1);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
            pushFN(data,branch_37f9c24b9f945923);
            return branch_f1b14c28a5ec39ac(l,data,state,prod,1);
        }
    }
    return -1;
    /*3a6903a3d6448ba8a070e256f1895773*/
}
function branch_3a6f16dffc9e0e08(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*56:167 value=>• null*/
    puid |=16;
    consume(l,data,state);
    add_reduce(state,data,1,85);
    /*[56]*/
    return prod;
    return -1;
    /*3a6f16dffc9e0e088029a2a65c062287*/
}
function branch_3a985b31481fef67(l,data,state,prod,puid){
    return 97;
    /*3a985b31481fef67dda8ad342da78931*/
}
function branch_3aa9d1696f0d18cf(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*10:22 class_HC_listbody1_105=>class_HC_listbody1_105 • class_group_016_104*/
    puid |=2;
    pushFN(data,branch_cf11d39a6eea6b7f);
    pushFN(data,$class_group_016_104);
    return puid;
    return -1;
    /*3aa9d1696f0d18cf79c4f4d0c6cd423f*/
}
function branch_3adb2cd1ecf94854(l,data,state,prod,puid){
    add_reduce(state,data,8,55);
    /*[31]*/
    return prod;
    /*3adb2cd1ecf94854b7119d3d7ae91921*/
}
function branch_3bf7fe2d5ab97910(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*76:229 def$defaultproduction=>• def$string*/
    puid |=32;
    pushFN(data,branch_8a57482f2f0b103f);
    pushFN(data,$def$string);
    return puid;
    return -1;
    /*3bf7fe2d5ab9791009fff4c3a2e96e5b*/
}
function branch_3c5e060d4d2de989(l,data,state,prod,puid){
    add_reduce(state,data,1,3);
    /*[68]*/
    pushFN(data,$comment_HC_listbody1_131_goto);
    return 68;
    /*3c5e060d4d2de989c811bde565409307*/
}
function branch_3cd7a73e1c203544(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*87:264 def$hex_token_group_044_104=>• B*/
    puid |=256;
    consume(l,data,state);
    /*[87]*/
    return prod;
    return -1;
    /*3cd7a73e1c203544cc6f3e89069d7780*/
}
function branch_3d1d1dd2035e1efd(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*52:151 type_group_091_122=>• 64*/
    puid |=8;
    consume(l,data,state);
    /*[52]*/
    return prod;
    return -1;
    /*3d1d1dd2035e1efdd0b95ac88f5beed1*/
}
function branch_3dbd6f595af296d6(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*62:185 num_tok=>• def$binary*/
    puid |=4;
    pushFN(data,branch_91f6e30711bde8c4);
    pushFN(data,$def$binary);
    return puid;
    return -1;
    /*3dbd6f595af296d63b09d81a7b9df24a*/
}
function branch_3ee169cb980a5898(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*45:130 identifier_token_group_074_117=>• θid*/
    puid |=1;
    consume(l,data,state);
    /*[45]*/
    return prod;
    return -1;
    /*3ee169cb980a58988d6ea126ea039db5*/
}
function branch_3ef340740569328c(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*87:261 def$hex_token_group_044_104=>• e*/
    puid |=32;
    consume(l,data,state);
    /*[87]*/
    return prod;
    return -1;
    /*3ef340740569328c447dd09a987d2dc9*/
}
function branch_3f1d54319119cb30(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*11:27 class=>modifier_list cls identifier class_group_113_103 { • }*/
    puid |=64;
    consume(l,data,state);
    add_reduce(state,data,6,11);
    /*[11]*/
    return prod;
    return -1;
    /*3f1d54319119cb303f748f87af18bf19*/
}
function branch_3fa42f1010d68298(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*13:36 function=>modifier_list fn identifier : type ( parameters ) { • expression_statements }*/
    puid |=512;
    pushFN(data,branch_c3ac347b869d9bed);
    pushFN(data,$expression_statements);
    return puid;
    return -1;
    /*3fa42f1010d6829805eeb3346c685092*/
}
function branch_41f0dd8f6f30c6e7(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*77:238 def$hex_digit=>• τB*/
    puid |=256;
    consume(l,data,state);
    /*[77]*/
    return prod;
    return -1;
    /*41f0dd8f6f30c6e7f893f52c44150e4d*/
}
function branch_422b46df4c667337(l,data,state,prod,puid){
    /*108:327 virtual-96:3:1|--lvl:0=>loop_expression_group_254_111 • expression*/
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*108:327 virtual-96:3:1|--lvl:0=>loop_expression_group_254_111 • expression*/
    puid |=4;
    pushFN(data,branch_4cd21d6b600ee36a);
    pushFN(data,$expression);
    return puid;
    /*422b46df4c6673372f0d5607ced5d97e*/
}
function branch_425efa1cfc8ffc16(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$def$binary_token_HC_listbody1_107_goto);
    return 91;
    /*425efa1cfc8ffc16fc6203a3c9b369a1*/
}
function branch_4266d6976f2fc09b(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
    /*63:187 operator_HC_listbody1_128=>operator_HC_listbody1_128 • θsym*/
    puid |=2;
    consume(l,data,state);
    add_reduce(state,data,2,87);
    /*[63]*/
    return prod;
    return -1;
    /*4266d6976f2fc09b78123aa9408ce3ad*/
}
function branch_4316c2d0c3aa5e7a(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*54:155 type_group_097_124=>• 32*/
    puid |=1;
    consume(l,data,state);
    /*[54]*/
    return prod;
    return -1;
    /*4316c2d0c3aa5e7a9a96507f865650c4*/
}
function branch_4333f87cdb989db7(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*14:45 function_expression=>fn : type ( parameters ) { • expression_statements }*/
    puid |=256;
    pushFN(data,branch_be0b9fe3c777e4c8);
    pushFN(data,$expression_statements);
    return puid;
    return -1;
    /*4333f87cdb989db73accd9026e1e3c31*/
}
function branch_4362b80f6cbd9c89(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$call_expression_HC_listbody2_114_goto);
    return 35;
    /*4362b80f6cbd9c89e35b4472ffd19cab*/
}
function branch_44384df8d540dc12(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*110:329 virtual-192:3:1|--lvl:0=>operator_HC_listbody1_129 • identifier_token_group_079_119*/
    puid |=4;
    pushFN(data,branch_49a46d9fb3405fea);
    pushFN(data,$identifier_token_group_079_119);
    return puid;
    return -1;
    /*44384df8d540dc12a56b5def47943b20*/
}
function branch_447920a661b3711d(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*91:274 def$binary_token_HC_listbody1_107=>def$binary_token_HC_listbody1_107 • def$binary_token_group_047_106*/
    puid |=2;
    pushFN(data,branch_4548a753dc9c4546);
    pushFN(data,$def$binary_token_group_047_106);
    return puid;
    return -1;
    /*447920a661b3711df4717cb0ec0d6bb2*/
}
function branch_44826ab9ae94eaaa(l,data,state,prod,puid){
    add_reduce(state,data,2,2);
    /*[49]*/
    return prod;
    /*44826ab9ae94eaaafae09b7bdf2b95c2*/
}
function branch_44d39e4d2e186b48(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*14:47 function_expression=>modifier_list fn : type ( parameters ) { • }*/
    puid |=512;
    consume(l,data,state);
    add_reduce(state,data,9,31);
    /*[14]*/
    return prod;
    return -1;
    /*44d39e4d2e186b4885a24834db910114*/
}
function branch_453542ac0943c713(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*121:340 virtual-126:4:1|--lvl:2=>: type • primitive_declaration_group_169_116*/
    puid |=16;
    pushFN(data,branch_2309075b495b632b);
    pushFN(data,$primitive_declaration_group_169_116);
    return puid;
    return -1;
    /*453542ac0943c713b6063a32dd516082*/
}
function branch_4548a753dc9c4546(l,data,state,prod,puid){
    add_reduce(state,data,2,2);
    /*[91]*/
    return prod;
    /*4548a753dc9c4546a5b2f90886c0f4bc*/
}
function branch_45734e4fc3f72f11(l,data,state,prod,puid){
    /*43:126 primitive_declaration=>identifier : type • primitive_declaration_group_169_116
    43:128 primitive_declaration=>identifier : type •*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        pushFN(data,branch_104d5a190a45ad94);
        return branch_5ebfbb554475da4a(l,data,state,prod,8);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*43:128 primitive_declaration=>identifier : type •*/
        add_reduce(state,data,3,76);
        /*[43]*/
        /*-------------INDIRECT-------------------*/
        return 18;
    }
    return -1;
    /*45734e4fc3f72f11af98c02e83ba8ddf*/
}
function branch_45773516bd54a32b(l,data,state,prod,puid){
    /*43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
    43:128 primitive_declaration=>identifier • : type*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==58/*[:]*/){
        consume(l,data,state);
        puid |=4;
        /*43:126 primitive_declaration=>identifier : • type primitive_declaration_group_169_116
        43:128 primitive_declaration=>identifier : • type*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_cea7f385fdc7932d);
        pushFN(data,$type);
        puid |=8;
        return puid;
    }
    return -1;
    /*45773516bd54a32bdab0a44c0e886f33*/
}
function branch_4582a2d0187e8064(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*105:317 def$js_id_symbols=>• θid*/
    puid |=2;
    consume(l,data,state);
    /*[105]*/
    return prod;
    return -1;
    /*4582a2d0187e80644e1f6b29cd316965*/
}
function branch_465e426d388a08ff(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*3:4 module=>module • module_group_02_100*/
    puid |=2;
    pushFN(data,branch_f367f74f171b1875);
    pushFN(data,$statements);
    return puid;
    return -1;
    /*465e426d388a08ff9eedbb40ae3bc4dd*/
}
function branch_468359d7834577f1(l,data,state,prod,puid){
    /*108:327 virtual-137:3:1|--lvl:0=>identifier_token_HC_listbody1_118 • identifier_token_group_079_119
    109:328 virtual-139:2:1|--lvl:0=>identifier_token_HC_listbody1_118 •*/
    skip_db1786a8af54d666(l/*[ 71 ]*/,data,state);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/){
        pushFN(data,branch_79692bd029113770);
        return branch_483e49205ff0b9a0(l,data,state,prod,2);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*109:328 virtual-139:2:1|--lvl:0=>identifier_token_HC_listbody1_118 •*/
        /*[109]*/
        add_reduce(state,data,2,0);
        /*[48]*/
        return 48;
    }
    return -1;
    /*468359d7834577f154e4e248b5a1472d*/
}
function branch_47ffbf99639be8c6(l,data,state,prod,puid){
    /*109:328 virtual-97:9:1|--lvl:0=>( parameters • ; expression ; loop_expression_HC_listbody6_112 ) expression
    110:329 virtual-100:8:1|--lvl:0=>( parameters • ; ; loop_expression_HC_listbody6_112 ) expression
    111:330 virtual-101:8:1|--lvl:0=>( parameters • ; expression ; ) expression
    112:331 virtual-104:7:1|--lvl:0=>( parameters • ; ; ) expression*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==59/*[;]*/){
        consume(l,data,state);
        puid |=32;
        /*109:328 virtual-97:9:1|--lvl:0=>( parameters ; • expression ; loop_expression_HC_listbody6_112 ) expression
        111:330 virtual-101:8:1|--lvl:0=>( parameters ; • expression ; ) expression
        110:329 virtual-100:8:1|--lvl:0=>( parameters ; • ; loop_expression_HC_listbody6_112 ) expression
        112:331 virtual-104:7:1|--lvl:0=>( parameters ; • ; ) expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(l.current_byte==59/*[;]*/){
            /*110:329 virtual-100:8:1|--lvl:0=>( parameters ; • ; loop_expression_HC_listbody6_112 ) expression
            112:331 virtual-104:7:1|--lvl:0=>( parameters ; • ; ) expression*/
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            puid |=32;
            /*110:329 virtual-100:8:1|--lvl:0=>( parameters ; ; • loop_expression_HC_listbody6_112 ) expression
            112:331 virtual-104:7:1|--lvl:0=>( parameters ; ; • ) expression*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if(l.current_byte==41/*[)]*/){
                pushFN(data,branch_3205c0ded576131e);
                return branch_0784b039a84827f7(l,data,state,prod,32);
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if(((((((((((((((/*[if]*/cmpr_set(l,data,143,2,2)||/*[match]*/cmpr_set(l,data,67,5,5))||/*[break]*/cmpr_set(l,data,72,5,5))||/*[return]*/cmpr_set(l,data,77,6,6))||/*[continue]*/cmpr_set(l,data,39,8,8))||/*[loop]*/cmpr_set(l,data,63,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[==]*/cmpr_set(l,data,7,2,2))||dt_bcea2102060eab13(l,data))||/*[true]*/cmpr_set(l,data,95,4,4))||/*[null]*/cmpr_set(l,data,35,4,4))||dt_6ae31dd85a62ef5c(l,data))||assert_ascii(l,0x0,0x194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
                pushFN(data,branch_3205c0ded576131e);
                return branch_823771e7a5146f1a(l,data,state,prod,32);
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if(((((((((((((((/*[if]*/cmpr_set(l,data,143,2,2)||/*[match]*/cmpr_set(l,data,67,5,5))||/*[==]*/cmpr_set(l,data,7,2,2))||dt_bcea2102060eab13(l,data))||dt_6ae31dd85a62ef5c(l,data))||/*[true]*/cmpr_set(l,data,95,4,4))||/*[null]*/cmpr_set(l,data,35,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[break]*/cmpr_set(l,data,72,5,5))||/*[return]*/cmpr_set(l,data,77,6,6))||/*[continue]*/cmpr_set(l,data,39,8,8))||/*[loop]*/cmpr_set(l,data,63,4,4))||assert_ascii(l,0x0,0x194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
            /*109:328 virtual-97:9:1|--lvl:0=>( parameters ; • expression ; loop_expression_HC_listbody6_112 ) expression
            111:330 virtual-101:8:1|--lvl:0=>( parameters ; • expression ; ) expression*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            pushFN(data,branch_979319b0c549d0c7);
            pushFN(data,$expression);
            puid |=4;
            return puid;
        }
    }
    return -1;
    /*47ffbf99639be8c63ae600f2425f015f*/
}
function branch_483e49205ff0b9a0(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*108:327 virtual-137:3:1|--lvl:0=>identifier_token_HC_listbody1_118 • identifier_token_group_079_119*/
    puid |=4;
    pushFN(data,branch_dca1b9a3dd99b59c);
    pushFN(data,$identifier_token_group_079_119);
    return puid;
    return -1;
    /*483e49205ff0b9a02789d1d7adaf4eb1*/
}
function branch_485e7848dc9e7e5b(l,data,state,prod,puid){
    return 57;
    /*485e7848dc9e7e5b8cd6ca1ebdc37e42*/
}
function branch_4952e647a70e4e9c(l,data,state,prod,puid){
    /*48:137 identifier_token=>identifier_token_group_074_117 identifier_token_HC_listbody1_118 • identifier_token_group_079_119
    48:139 identifier_token=>identifier_token_group_074_117 identifier_token_HC_listbody1_118 •*/
    skip_db1786a8af54d666(l/*[ 71 ]*/,data,state);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/){
        pushFN(data,branch_3205c0ded576131e);
        return branch_ebcd0697220bc3cf(l,data,state,prod,2);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*48:139 identifier_token=>identifier_token_group_074_117 identifier_token_HC_listbody1_118 •*/
        add_reduce(state,data,2,0);
        /*[48]*/
    }
    return -1;
    /*4952e647a70e4e9c5650de0cca48677a*/
}
function branch_499b936f8e6084df(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*47:135 identifier_token_group_079_119=>• θws*/
    puid |=1;
    consume(l,data,state);
    /*[47]*/
    return prod;
    return -1;
    /*499b936f8e6084dfcdf35137a1e3eb67*/
}
function branch_49a36ea7058e16fb(l,data,state,prod,puid){
    add_reduce(state,data,1,3);
    /*[88]*/
    pushFN(data,$def$hex_token_HC_listbody1_105_goto);
    return 88;
    /*49a36ea7058e16fb5a84743b8205d59b*/
}
function branch_49a46d9fb3405fea(l,data,state,prod,puid){
    /*[110]*/
    return prod;
    /*49a46d9fb3405fea640aefb385989146*/
}
function branch_49c15d1218acdade(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*54:156 type_group_097_124=>• 64*/
    puid |=2;
    consume(l,data,state);
    /*[54]*/
    return prod;
    return -1;
    /*49c15d1218acdade6fa91ac13e2215b7*/
}
function branch_4a236324dddf6f01(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    add_reduce(state,data,7,52);
    /*[31]*/
    return 31;
    /*4a236324dddf6f01ce53814836f27067*/
}
function branch_4a34f977929a3738(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$def$js_id_symbols_goto);
    return 105;
    /*4a34f977929a3738cccdac0e2185e15e*/
}
function branch_4a5dae1a31e6e58a(l,data,state,prod,puid){
    add_reduce(state,data,1,3);
    /*[69]*/
    pushFN(data,$comment_HC_listbody1_132_goto);
    return 69;
    /*4a5dae1a31e6e58aaf2ce3ae4d5e6c3b*/
}
function branch_4bdf7a450c230f77(l,data,state,prod,puid){
    return 90;
    /*4bdf7a450c230f77f2251e98093845ad*/
}
function branch_4befa0cae2f0dcb4(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=1024;
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,10,22);
        /*[13]*/
        return prod;
    }
    return -1;
    /*4befa0cae2f0dcb406e9cc629695a66f*/
}
function branch_4c681830e2bcb8cf(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*45:131 identifier_token_group_074_117=>• _*/
    puid |=2;
    consume(l,data,state);
    /*[45]*/
    return prod;
    return -1;
    /*4c681830e2bcb8cf838d460130d02694*/
}
function branch_4c79766ca3411d9f(l,data,state,prod,puid){
    add_reduce(state,data,9,51);
    /*[31]*/
    return prod;
    /*4c79766ca3411d9f4b283d6614080c17*/
}
function branch_4cd21d6b600ee36a(l,data,state,prod,puid){
    /*[108]*/
    /*-------------INDIRECT-------------------*/
    add_reduce(state,data,3,50);
    /*[31]*/
    return 31;
    /*4cd21d6b600ee36addad6068c0d4d6da*/
}
function branch_4d67938cff066b46(l,data,state,prod,puid){
    add_reduce(state,data,3,47);
    /*[25]*/
    /*-------------INDIRECT-------------------*/
    add_reduce(state,data,1,3);
    pushFN(data,$expression_statements_goto);
    return 20;
    /*4d67938cff066b46ac339b19ede8770e*/
}
function branch_4db7765786d1a76d(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*43:125 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_169_116*/
    puid |=16;
    pushFN(data,branch_d18aa6c090f740a2);
    pushFN(data,$primitive_declaration_group_169_116);
    return puid;
    return -1;
    /*4db7765786d1a76d25868b0f2cc32dcc*/
}
function branch_4dcc18167384c0b1(l,data,state,prod,puid){
    return 86;
    /*4dcc18167384c0b1063e9dea329edb6b*/
}
function branch_4e502534fa641d2b(l,data,state,prod,puid){
    /*43:125 primitive_declaration=>modifier_list identifier • : type primitive_declaration_group_169_116
    43:127 primitive_declaration=>modifier_list identifier • : type*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==58/*[:]*/){
        consume(l,data,state);
        puid |=4;
        /*43:125 primitive_declaration=>modifier_list identifier : • type primitive_declaration_group_169_116
        43:127 primitive_declaration=>modifier_list identifier : • type*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_9dd97da06b20e5c9);
        pushFN(data,$type);
        puid |=8;
        return puid;
    }
    return -1;
    /*4e502534fa641d2bb0f7d20a0cded025*/
}
function branch_4e8e646808561b32(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    /*11:28 class=>cls identifier • { class_HC_listbody1_105 }*/
    puid |=16;
    consume(l,data,state);
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=32;
    pushFN(data,branch_fe607864e49c5cd0);
    pushFN(data,$class_HC_listbody1_105);
    return puid;
    return -1;
    /*4e8e646808561b3202d3a80e50ad082e*/
}
function branch_4e942b265da6886a(l,data,state,prod,puid){
    /*25:80 binary_expression=>unary_expression operator •
    25:81 binary_expression=>unary_expression operator • expression*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    switch(sym_map_340cc91326eab71f(l,data)){
        default:
        case 0:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*25:80 binary_expression=>unary_expression operator •*/
            add_reduce(state,data,2,46);
            /*[25]*/
            /*-------------INDIRECT-------------------*/
            return 21;
        case 1:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*25:81 binary_expression=>unary_expression operator • expression*/
            puid |=4;
            pushFN(data,branch_dfe476cfeb3d733c);
            pushFN(data,$expression);
            return puid;
        case 2:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
            /*25:81 binary_expression=>unary_expression operator • expression*/
            puid |=4;
            pushFN(data,branch_dfe476cfeb3d733c);
            pushFN(data,$expression);
            return puid;
    }
    return -1;
    /*4e942b265da6886a0f4c0e745a835d4f*/
}
function branch_4e99431b189bbea4(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    /*11:26 class=>modifier_list cls identifier • { class_HC_listbody1_105 }*/
    puid |=16;
    consume(l,data,state);
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=32;
    pushFN(data,branch_91c75c4b2b49defd);
    pushFN(data,$class_HC_listbody1_105);
    return puid;
    return -1;
    /*4e99431b189bbea4ee5298fea35f60d2*/
}
function branch_4efdbb5c9dee38e5(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*21:73 expression=>{ • expression_statements }*/
    puid |=512;
    pushFN(data,branch_98aa00dc12a9cf26);
    pushFN(data,$expression_statements);
    return puid;
    return -1;
    /*4efdbb5c9dee38e520eeda1ee7f355f5*/
}
function branch_4f452b9fa5813076(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*14:50 function_expression=>modifier_list fn : type ( ) { • }*/
    puid |=512;
    consume(l,data,state);
    add_reduce(state,data,8,34);
    /*[14]*/
    return prod;
    return -1;
    /*4f452b9fa5813076b27c836d05e35a83*/
}
function branch_4f7e5dd4981eba91(l,data,state,prod,puid){
    /*108:327 virtual-191:3:1|--lvl:0=>operator_HC_listbody1_128 • identifier_token_group_079_119
    109:328 virtual-194:2:1|--lvl:0=>operator_HC_listbody1_128 •*/
    skip_db1786a8af54d666(l/*[ 71 ]*/,data,state);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/){
        pushFN(data,branch_104689cb2c001c22);
        return branch_fd5ee5d7402de31d(l,data,state,prod,2);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*109:328 virtual-194:2:1|--lvl:0=>operator_HC_listbody1_128 •*/
        /*[109]*/
        add_reduce(state,data,2,91);
        /*[65]*/
        return 65;
    }
    return -1;
    /*4f7e5dd4981eba91b7c67a9d1f0ab35a*/
}
function branch_50da06a9f53cf781(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    /*60:179 string=>• ' string_HC_listbody1_127 '*/
    puid |=4;
    consume(l,data,state);
    skip_db1786a8af54d666(l/*[ 71 ]*/,data,state);
    puid |=8;
    pushFN(data,branch_700da797ce4580f4);
    pushFN(data,$string_HC_listbody1_127);
    return puid;
    return -1;
    /*50da06a9f53cf7810ad40fe22e3787a1*/
}
function branch_5176e61dd17d4eba(l,data,state,prod,puid){
    add_reduce(state,data,3,36);
    /*[75]*/
    return prod;
    /*5176e61dd17d4eba89d149d9c298befa*/
}
function branch_5194f5fa10f99f55(l,data,state,prod,puid){
    /*121:340 virtual-126:4:1|--lvl:2=>: type • primitive_declaration_group_169_116
    122:341 virtual-128:3:1|--lvl:2=>: type •*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        pushFN(data,branch_3205c0ded576131e);
        return branch_453542ac0943c713(l,data,state,prod,8);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*122:341 virtual-128:3:1|--lvl:2=>: type •*/
        /*[122]*/
        pushFN(data,branch_7eb1981bd29a0a82);
        return 43;
    }
    return -1;
    /*5194f5fa10f99f55b37b941691efabd3*/
}
function branch_521f65aff0d7939b(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$expression_statements_goto);
    return 26;
    /*521f65aff0d7939bee7202ac130582d4*/
}
function branch_5289262b0f51b588(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=1;
    if((l.current_byte==34/*["]*/)&&consume(l,data,state)){
        add_reduce(state,data,3,89);
        /*[60]*/
        return prod;
    }
    return -1;
    /*5289262b0f51b5886a211198c6a69297*/
}
function branch_534054c7147497d8(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
    /*46:133 identifier_token_HC_listbody1_118=>identifier_token_HC_listbody1_118 • identifier_token_group_074_117*/
    puid |=2;
    pushFN(data,branch_691d347940964966);
    pushFN(data,$identifier_token_group_074_117);
    return puid;
    return -1;
    /*534054c7147497d8ef14383998850d9c*/
}
function branch_53a1020719a7db2e(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*109:328 virtual-97:9:1|--lvl:0=>( parameters ; expression ; • loop_expression_HC_listbody6_112 ) expression*/
    puid |=64;
    pushFN(data,branch_b7e7636fa822a2e8);
    pushFN(data,$loop_expression_HC_listbody6_112);
    return puid;
    return -1;
    /*53a1020719a7db2e76f40884fd71bb58*/
}
function branch_53ecf5481f303c86(l,data,state,prod,puid){
    /*25:80 binary_expression=>unary_expression operator •
    25:81 binary_expression=>unary_expression operator • expression*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    switch(sym_map_340cc91326eab71f(l,data)){
        default:
        case 0:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*25:80 binary_expression=>unary_expression operator •*/
            add_reduce(state,data,2,46);
            /*[25]*/
            /*-------------INDIRECT-------------------*/
            pushFN(data,branch_7eb1981bd29a0a82);
            return 21;
        case 1:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*25:81 binary_expression=>unary_expression operator • expression*/
            puid |=4;
            pushFN(data,branch_b246e8a43052c1e6);
            pushFN(data,$expression);
            return puid;
        case 2:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
            /*25:81 binary_expression=>unary_expression operator • expression*/
            puid |=4;
            pushFN(data,branch_b246e8a43052c1e6);
            pushFN(data,$expression);
            return puid;
    }
    return -1;
    /*53ecf5481f303c86d3bb55915f03725e*/
}
function branch_54aada398c3450ab(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*101:301 def$string_value_group_172_113=>• θnum*/
    puid |=1;
    consume(l,data,state);
    /*[101]*/
    return prod;
    return -1;
    /*54aada398c3450abe64edb1ef5fb53ae*/
}
function branch_556d6adae510d753(l,data,state,prod,puid){
    return 36;
    /*556d6adae510d753b58dac1ab147cd5b*/
}
function branch_557118a17d00e8ca(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*94:286 def$octal_token_group_058_109=>• 7*/
    puid |=128;
    consume(l,data,state);
    /*[94]*/
    return prod;
    return -1;
    /*557118a17d00e8ca5498fd306ac9bef7*/
}
function branch_5595ae6d63a385da(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*105:314 def$js_id_symbols=>def$js_id_symbols • θnum*/
    puid |=16;
    consume(l,data,state);
    add_reduce(state,data,2,87);
    /*[105]*/
    return prod;
    return -1;
    /*5595ae6d63a385daf5d2037c727d8d06*/
}
function branch_56aae7267d9f7ff5(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=32;
    if((l.current_byte==93/*[]]*/)&&consume(l,data,state)){
        add_reduce(state,data,4,66);
        /*[37]*/
        /*-------------INDIRECT-------------------*/
        pushFN(data,$expression_statements_group_023_108_goto);
        return 37;
    }
    return -1;
    /*56aae7267d9f7ff54177d914ce3c7722*/
}
function branch_56de27721a2105bd(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*93:277 def$octal_token_group_050_108=>• 0o*/
    puid |=1;
    consume(l,data,state);
    /*[93]*/
    return prod;
    return -1;
    /*56de27721a2105bd93f67b4a0a27db15*/
}
function branch_56ea7a47b85970be(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=4;
    pushFN(data,branch_7d4b362c2acf2890);
    pushFN(data,$expression);
    return puid;
    return -1;
    /*56ea7a47b85970be5725964ac04b7d7e*/
}
function branch_5725d6225969df91(l,data,state,prod,puid){
    return 87;
    /*5725d6225969df91176abe45c76aaeda*/
}
function branch_57366786353b5641(l,data,state,prod,puid){
    /*[108]*/
    add_reduce(state,data,3,50);
    /*[31]*/
    return 31;
    /*57366786353b5641097a15ba8647a5f6*/
}
function branch_57b67f757a8b369b(l,data,state,prod,puid){
    return 83;
    /*57b67f757a8b369b0611733f7ff5598d*/
}
function branch_5814d05b2ded1273(l,data,state,prod,puid){
    return 31;
    /*5814d05b2ded1273c41ef132ab8abc90*/
}
function branch_584051a55d809a1f(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$loop_expression_HC_listbody6_112_goto);
    return 30;
    /*584051a55d809a1f9d2c8b33ad391f10*/
}
function branch_586655cede959332(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$def$octal_token_HC_listbody1_110_goto);
    return 95;
    /*586655cede9593322e25e11d28a8e248*/
}
function branch_58befcfe7c0c615e(l,data,state,prod,puid){
    add_reduce(state,data,1,1);
    /*[0]*/
    return 0;
    /*58befcfe7c0c615e3b15ca465060ceb7*/
}
function branch_590840d9d6fa7989(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*87:268 def$hex_token_group_044_104=>• F*/
    puid |=4096;
    consume(l,data,state);
    /*[87]*/
    return prod;
    return -1;
    /*590840d9d6fa7989a9df42c2978703a6*/
}
function branch_590ed757bb827c26(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*87:256 def$hex_token_group_044_104=>• θnum*/
    puid |=1;
    consume(l,data,state);
    /*[87]*/
    return prod;
    return -1;
    /*590ed757bb827c26f06280238f642678*/
}
function branch_5a63fd0f5ce8c55b(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*94:280 def$octal_token_group_058_109=>• 1*/
    puid |=2;
    consume(l,data,state);
    /*[94]*/
    return prod;
    return -1;
    /*5a63fd0f5ce8c55b6921fab20b7922cf*/
}
function branch_5b05f5056e86d777(l,data,state,prod,puid){
    /*43:125 primitive_declaration=>modifier_list identifier • : type primitive_declaration_group_169_116
    43:127 primitive_declaration=>modifier_list identifier • : type*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==58/*[:]*/){
        consume(l,data,state);
        puid |=4;
        /*43:125 primitive_declaration=>modifier_list identifier : • type primitive_declaration_group_169_116
        43:127 primitive_declaration=>modifier_list identifier : • type*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_9273f06644cfc323);
        pushFN(data,$type);
        puid |=8;
        return puid;
    }
    return -1;
    /*5b05f5056e86d777a99f0afb69402447*/
}
function branch_5b2d0f943a8b2c4f(l,data,state,prod,puid){
    add_reduce(state,data,2,2);
    /*[98]*/
    /*-------------INDIRECT-------------------*/
    pushFN(data,$def$string_token_HC_listbody3_111_goto);
    return 98;
    /*5b2d0f943a8b2c4fa7217e877c9cb421*/
}
function branch_5b38259785133ae3(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*105:312 def$js_id_symbols=>def$js_id_symbols • _*/
    puid |=4;
    consume(l,data,state);
    add_reduce(state,data,2,87);
    /*[105]*/
    return prod;
    return -1;
    /*5b38259785133ae3d246542b00436d7e*/
}
function branch_5ba3cb59e15b58fe(l,data,state,prod,puid){
    return 66;
    /*5ba3cb59e15b58fed5a19252ee4ed357*/
}
function branch_5bfc8f68271cf93d(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*4:11 statements=>• namespace*/
    puid |=64;
    pushFN(data,branch_cbc9ddb32c7cd341);
    pushFN(data,$namespace);
    return puid;
    return -1;
    /*5bfc8f68271cf93d2b1264033c4a9606*/
}
function branch_5cd2eec51e92f8d8(l,data,state,prod,puid){
    add_reduce(state,data,2,87);
    /*[102]*/
    /*-------------INDIRECT-------------------*/
    pushFN(data,$def$string_value_HC_listbody2_114_goto);
    return 102;
    /*5cd2eec51e92f8d8fa49cf9ee189887b*/
}
function branch_5e169833ae72a0c6(l,data,state,prod,puid){
    /*43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
    43:127 primitive_declaration=>modifier_list • identifier : type*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    pushFN(data,branch_76f08b36d7ba8013);
    pushFN(data,$identifier);
    puid |=2;
    return puid;
    return -1;
    /*5e169833ae72a0c68af872d7fa2cb911*/
}
function branch_5e75bda40ef17a39(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=4;
    pushFN(data,branch_9b1c689c57e42d57);
    pushFN(data,$expression);
    return puid;
    return -1;
    /*5e75bda40ef17a3982bb4213a14acc50*/
}
function branch_5ebfbb554475da4a(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*43:126 primitive_declaration=>identifier : type • primitive_declaration_group_169_116*/
    puid |=16;
    pushFN(data,branch_7b4c140a66109b8c);
    pushFN(data,$primitive_declaration_group_169_116);
    return puid;
    return -1;
    /*5ebfbb554475da4a68a02f71aca796c6*/
}
function branch_5ecedf6a3cbdeffa(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*87:263 def$hex_token_group_044_104=>• A*/
    puid |=128;
    consume(l,data,state);
    /*[87]*/
    return prod;
    return -1;
    /*5ecedf6a3cbdeffa7044a2fde7b94b3b*/
}
function branch_5f56a2330947cc54(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*100:296 def$string_value_group_071_112=>• θnum*/
    puid |=1;
    consume(l,data,state);
    /*[100]*/
    return prod;
    return -1;
    /*5f56a2330947cc54da7dd69e124a89b5*/
}
function branch_5f86abcc6b22ca54(l,data,state,prod,puid){
    /*11:25 class=>cls identifier • class_group_113_103 { class_HC_listbody1_105 }
    11:29 class=>cls identifier • class_group_113_103 { }
    11:28 class=>cls identifier • { class_HC_listbody1_105 }
    11:31 class=>cls identifier • { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(l.current_byte==123/*[{]*/){
        /*11:28 class=>cls identifier • { class_HC_listbody1_105 }
        11:31 class=>cls identifier • { }*/
        var pk = l.copy();
        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,0);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(pk.current_byte==125/*[}]*/){
            pushFN(data,branch_7dcd4e56969f4413);
            return branch_9c5c4ae7d3431d14(l,data,state,prod,4);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else if(((/*[str]*/cmpr_set(pk,data,47,3,3)||/*[fn]*/cmpr_set(pk,data,144,2,2))||assert_ascii(pk,0x0,0x10,0x88000000,0x0))||pk.isUniID(data)){
            pushFN(data,branch_7dcd4e56969f4413);
            return branch_4e8e646808561b32(l,data,state,prod,4);
        }
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(/*[is]*/cmpr_set(l,data,141,2,2)){
        /*11:25 class=>cls identifier • class_group_113_103 { class_HC_listbody1_105 }
        11:29 class=>cls identifier • class_group_113_103 { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_8ffb637978bca250);
        pushFN(data,$class_group_113_103);
        puid |=8;
        return puid;
    }
    return -1;
    /*5f86abcc6b22ca5444aaa5b88ebce35f*/
}
function branch_5fa0246fc427c62b(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*99:294 def$string_token=>def$string_token • def$string_value*/
    puid |=2;
    pushFN(data,branch_1260e9368afd7229);
    pushFN(data,$def$string_value);
    return puid;
    return -1;
    /*5fa0246fc427c62b55da8e5707de5918*/
}
function branch_6070646d2b8eb37d(l,data,state,prod,puid){
    return 101;
    /*6070646d2b8eb37d941a653ba1011346*/
}
function branch_607f1c19786e09a9(l,data,state,prod,puid){
    add_reduce(state,data,7,56);
    /*[31]*/
    return prod;
    /*607f1c19786e09a9d79ceb9cb871612f*/
}
function branch_60927a7f49a5a57b(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }*/
    puid |=256;
    pushFN(data,branch_76ec4ae29d63772d);
    pushFN(data,$expression_statements);
    return puid;
    return -1;
    /*60927a7f49a5a57b4ca867c7f035b38f*/
}
function branch_60a0d7e0c6e15dc4(l,data,state,prod,puid){
    add_reduce(state,data,3,36);
    /*[32]*/
    return prod;
    /*60a0d7e0c6e15dc45a58146ce5d85290*/
}
function branch_60b7306e07145e72(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=128;
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        puid |=4;
        pushFN(data,branch_8d7d93db08459d1a);
        pushFN(data,$expression);
        return puid;
    }
    return -1;
    /*60b7306e07145e7211429165c8f945fd*/
}
function branch_614618963d5fc947(l,data,state,prod,puid){
    add_reduce(state,data,1,3);
    /*[3]*/
    pushFN(data,$module_goto);
    return 3;
    /*614618963d5fc947b6a1df7ee229a43f*/
}
function branch_61ac8beb3d7a0fc1(l,data,state,prod,puid){
    /*[111]*/
    return prod;
    /*61ac8beb3d7a0fc18ed254d94a796003*/
}
function branch_6273212a0843d505(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    /*36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )*/
    puid |=2;
    consume(l,data,state);
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=4;
    pushFN(data,branch_2d91057f5b4b0977);
    pushFN(data,$call_expression_HC_listbody2_114);
    return puid;
    return -1;
    /*6273212a0843d505b1b63ada036a0f26*/
}
function branch_62e92fbdf74aad60(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*14:51 function_expression=>fn : type ( ) { • }*/
    puid |=512;
    consume(l,data,state);
    add_reduce(state,data,7,35);
    /*[14]*/
    return prod;
    return -1;
    /*62e92fbdf74aad608b3b18cdcaf8674d*/
}
function branch_6356265d9720e789(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$def$identifier_symbols_goto);
    return 107;
    /*6356265d9720e789e036fcf0316914d5*/
}
function branch_63f171bf36492849(l,data,state,prod,puid){
    /*110:329 virtual-137:3:1|--lvl:0=>identifier_token_HC_listbody1_118 • identifier_token_group_079_119
    111:330 virtual-139:2:1|--lvl:0=>identifier_token_HC_listbody1_118 •*/
    skip_db1786a8af54d666(l/*[ 71 ]*/,data,state);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/){
        pushFN(data,branch_79692bd029113770);
        return branch_b84a2262f54d4e98(l,data,state,prod,7);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*111:330 virtual-139:2:1|--lvl:0=>identifier_token_HC_listbody1_118 •*/
        /*[111]*/
        add_reduce(state,data,2,0);
        /*[48]*/
        return 48;
    }
    return -1;
    /*63f171bf364928491abcb6016b3cbaeb*/
}
function branch_642e59bb993053b7(l,data,state,prod,puid){
    /*13:36 function=>modifier_list fn identifier • : type ( parameters ) { expression_statements }
    13:38 function=>modifier_list fn identifier • : type ( ) { expression_statements }
    13:39 function=>modifier_list fn identifier • : type ( parameters ) { }
    13:42 function=>modifier_list fn identifier • : type ( ) { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==58/*[:]*/){
        consume(l,data,state);
        puid |=8;
        /*13:36 function=>modifier_list fn identifier : • type ( parameters ) { expression_statements }
        13:38 function=>modifier_list fn identifier : • type ( ) { expression_statements }
        13:39 function=>modifier_list fn identifier : • type ( parameters ) { }
        13:42 function=>modifier_list fn identifier : • type ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_10c2d2124b1a4c0e);
        pushFN(data,$type);
        puid |=16;
        return puid;
    }
    return -1;
    /*642e59bb993053b73d7b279d91719f35*/
}
function branch_65cfc9ad33d7b7ba(l,data,state,prod,puid){
    /*83:249 def$scientific_token_group_228_102=>def$scientific_token_group_027_101 • - θnum
    83:250 def$scientific_token_group_228_102=>def$scientific_token_group_027_101 • θnum*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(l.isNum(data)){
        pushFN(data,branch_57b67f757a8b369b);
        return branch_9e7659f116d67506(l,data,state,prod,1);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==45/*[-]*/){
        pushFN(data,branch_57b67f757a8b369b);
        return branch_f43a4858a4c5560c(l,data,state,prod,1);
    }
    return -1;
    /*65cfc9ad33d7b7ba83077371edc1c94a*/
}
function branch_6615cd6cfaeaf9bc(l,data,state,prod,puid){
    add_reduce(state,data,1,3);
    /*[99]*/
    pushFN(data,$def$string_token_goto);
    return 99;
    /*6615cd6cfaeaf9bcf76aa535dd46b1e1*/
}
function branch_664e24a2b2c0a66f(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=128;
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        puid |=4;
        pushFN(data,branch_607f1c19786e09a9);
        pushFN(data,$expression);
        return puid;
    }
    return -1;
    /*664e24a2b2c0a66f22d859313e265c07*/
}
function branch_668c1fcd2b30f57a(l,data,state,prod,puid){
    /*19:60 expression_statements_group_124_109=>expression_statements_HC_listbody1_107 • expression_statements_group_023_108
    19:61 expression_statements_group_124_109=>expression_statements_HC_listbody1_107 •*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    if(sym_map_2a63be30b8838971(l,data)==1){
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*19:61 expression_statements_group_124_109=>expression_statements_HC_listbody1_107 •*/
        add_reduce(state,data,1,38);
        /*[19]*/
        return 19;
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(((((((((((((((/*[if]*/cmpr_set(l,data,143,2,2)||/*[match]*/cmpr_set(l,data,67,5,5))||/*[==]*/cmpr_set(l,data,7,2,2))||dt_bcea2102060eab13(l,data))||dt_6ae31dd85a62ef5c(l,data))||/*[true]*/cmpr_set(l,data,95,4,4))||/*[null]*/cmpr_set(l,data,35,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[break]*/cmpr_set(l,data,72,5,5))||/*[return]*/cmpr_set(l,data,77,6,6))||/*[continue]*/cmpr_set(l,data,39,8,8))||/*[loop]*/cmpr_set(l,data,63,4,4))||assert_ascii(l,0x0,0x194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
        pushFN(data,branch_7fe3eae917c31513);
        return branch_d24e5c8a9179f1ec(l,data,state,prod,1);
    }
    return -1;
    /*668c1fcd2b30f57a3fe7019a891c45ea*/
}
function branch_6748c488c97c5b1f(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*87:260 def$hex_token_group_044_104=>• d*/
    puid |=16;
    consume(l,data,state);
    /*[87]*/
    return prod;
    return -1;
    /*6748c488c97c5b1fb6da046146737038*/
}
function branch_67d65f2aa32bbda4(l,data,state,prod,puid){
    /*108:327 virtual-126:4:1|--lvl:0=>: type • primitive_declaration_group_169_116
    109:328 virtual-128:3:1|--lvl:0=>: type •*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        pushFN(data,branch_8b26069ce7eab8c5);
        return branch_aa5f420c0dbdad59(l,data,state,prod,8);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*109:328 virtual-128:3:1|--lvl:0=>: type •*/
        /*[109]*/
        add_reduce(state,data,3,76);
        /*[43]*/
        add_reduce(state,data,1,3);
        pushFN(data,$expression_statements_goto);
        return 20;
    }
    return -1;
    /*67d65f2aa32bbda403c7a696b5c22ecb*/
}
function branch_67f4b094560b4f05(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=4;
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        add_reduce(state,data,3,37);
        /*[29]*/
        pushFN(data,branch_422b46df4c667337);
        return 29;
    }
    return -1;
    /*67f4b094560b4f0511da2b30263952ba*/
}
function branch_691d347940964966(l,data,state,prod,puid){
    add_reduce(state,data,2,2);
    /*[46]*/
    return prod;
    /*691d347940964966a11bf5802f7cb601*/
}
function branch_69435f7bfd5d9a97(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*77:231 def$hex_digit=>• τa*/
    puid |=2;
    consume(l,data,state);
    /*[77]*/
    return prod;
    return -1;
    /*69435f7bfd5d9a9777a216e5e37745ec*/
}
function branch_699bcd7a028ab4ef(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*77:230 def$hex_digit=>• θnum*/
    puid |=1;
    consume(l,data,state);
    /*[77]*/
    return prod;
    return -1;
    /*699bcd7a028ab4ef5c0a760c64abeeb6*/
}
function branch_69b20f82bd102217(l,data,state,prod,puid){
    /*108:327 virtual-96:3:1|--lvl:0=>• loop_expression_group_254_111 expression
    109:328 virtual-97:9:1|--lvl:0=>• ( parameters ; expression ; loop_expression_HC_listbody6_112 ) expression
    110:329 virtual-100:8:1|--lvl:0=>• ( parameters ; ; loop_expression_HC_listbody6_112 ) expression
    111:330 virtual-101:8:1|--lvl:0=>• ( parameters ; expression ; ) expression
    112:331 virtual-104:7:1|--lvl:0=>• ( parameters ; ; ) expression
    113:332 virtual-98:7:1|--lvl:0=>• ( primitive_declaration in expression ) expression*/
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(l.current_byte==40/*[(]*/){
        /*108:327 virtual-96:3:1|--lvl:0=>• loop_expression_group_254_111 expression
        109:328 virtual-97:9:1|--lvl:0=>• ( parameters ; expression ; loop_expression_HC_listbody6_112 ) expression
        110:329 virtual-100:8:1|--lvl:0=>• ( parameters ; ; loop_expression_HC_listbody6_112 ) expression
        111:330 virtual-101:8:1|--lvl:0=>• ( parameters ; expression ; ) expression
        112:331 virtual-104:7:1|--lvl:0=>• ( parameters ; ; ) expression
        113:332 virtual-98:7:1|--lvl:0=>• ( primitive_declaration in expression ) expression*/
        var pk = l.copy();
        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,0);
        switch(sym_map_a837a60965d5e452(pk,data)){
            case 0:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*108:327 virtual-96:3:1|--lvl:0=>• loop_expression_group_254_111 expression*/
                puid |=2;
                pushFN(data,branch_6d6d6d1ed566460d);
                pushFN(data,$loop_expression_group_254_111);
                return puid;
            case 1:
                /*29:92 loop_expression_group_254_111=>• ( expression )
                109:328 virtual-97:9:1|--lvl:0=>• ( parameters ; expression ; loop_expression_HC_listbody6_112 ) expression
                110:329 virtual-100:8:1|--lvl:0=>• ( parameters ; ; loop_expression_HC_listbody6_112 ) expression
                111:330 virtual-101:8:1|--lvl:0=>• ( parameters ; expression ; ) expression
                112:331 virtual-104:7:1|--lvl:0=>• ( parameters ; ; ) expression
                113:332 virtual-98:7:1|--lvl:0=>• ( primitive_declaration in expression ) expression*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l,data,state);
                puid |=1;
                /*29:92 loop_expression_group_254_111=>( • expression )
                109:328 virtual-97:9:1|--lvl:0=>( • parameters ; expression ; loop_expression_HC_listbody6_112 ) expression
                110:329 virtual-100:8:1|--lvl:0=>( • parameters ; ; loop_expression_HC_listbody6_112 ) expression
                111:330 virtual-101:8:1|--lvl:0=>( • parameters ; expression ; ) expression
                112:331 virtual-104:7:1|--lvl:0=>( • parameters ; ; ) expression
                113:332 virtual-98:7:1|--lvl:0=>( • primitive_declaration in expression ) expression*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                switch(sym_map_b9a34db74685e187(l,data)){
                    case 0:
                        /*--LEAF--*/
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                        /*29:92 loop_expression_group_254_111=>( • expression )*/
                        puid |=2;
                        pushFN(data,branch_67f4b094560b4f05);
                        pushFN(data,$expression);
                        return puid;
                    case 1:
                        /*-------------VPROD-------------------------*/
                        /*29:92 loop_expression_group_254_111=>( • expression )
                        109:328 virtual-97:9:1|--lvl:0=>( • parameters ; expression ; loop_expression_HC_listbody6_112 ) expression
                        110:329 virtual-100:8:1|--lvl:0=>( • parameters ; ; loop_expression_HC_listbody6_112 ) expression
                        111:330 virtual-101:8:1|--lvl:0=>( • parameters ; expression ; ) expression
                        112:331 virtual-104:7:1|--lvl:0=>( • parameters ; ; ) expression
                        113:332 virtual-98:7:1|--lvl:0=>( • primitive_declaration in expression ) expression*/
                        pushFN(data,branch_3a6903a3d6448ba8);
                        return 0;
                    default:
                        break;
                }
            default:
                break;
        }
    }
    return -1;
    /*69b20f82bd10221758d77fb7a6c14120*/
}
function branch_69e9e20fb324bacf(l,data,state,prod,puid){
    /*43:125 primitive_declaration=>modifier_list identifier • : type primitive_declaration_group_169_116
    43:127 primitive_declaration=>modifier_list identifier • : type*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==58/*[:]*/){
        consume(l,data,state);
        puid |=4;
        /*43:125 primitive_declaration=>modifier_list identifier : • type primitive_declaration_group_169_116
        43:127 primitive_declaration=>modifier_list identifier : • type*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_f586fa0da1151edb);
        pushFN(data,$type);
        puid |=8;
        return puid;
    }
    return -1;
    /*69e9e20fb324bacf446513e523f52ea6*/
}
function branch_6ac460297b8be248(l,data,state,prod,puid){
    add_reduce(state,data,1,3);
    /*[98]*/
    pushFN(data,$def$string_token_HC_listbody3_111_goto);
    return 98;
    /*6ac460297b8be2482c6d49ef13a0f90d*/
}
function branch_6b1b550c641e00c8(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*66:199 modifier=>• pub*/
    puid |=1;
    consume(l,data,state);
    /*[66]*/
    return prod;
    return -1;
    /*6b1b550c641e00c8808b5b1c70bfa148*/
}
function branch_6b34f6d635fcea01(l,data,state,prod,puid){
    add_reduce(state,data,1,3);
    /*[15]*/
    pushFN(data,$parameters_HC_listbody10_106_goto);
    return 15;
    /*6b34f6d635fcea015b208575f87abd14*/
}
function branch_6b59628e43702acb(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*107:326 def$identifier_symbols=>• θid*/
    puid |=2;
    consume(l,data,state);
    /*[107]*/
    return prod;
    return -1;
    /*6b59628e43702acbe90bd70f9aee6793*/
}
function branch_6bbc85f5d082869e(l,data,state,prod,puid){
    add_reduce(state,data,1,88);
    /*[103]*/
    pushFN(data,$def$string_value_goto);
    return 103;
    /*6bbc85f5d082869eb20e84d9c13ac296*/
}
function branch_6c0c4c6cf3e7959e(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*56:168 value=>• template*/
    puid |=32;
    pushFN(data,branch_decbb0e7baad5cf5);
    pushFN(data,$template);
    return puid;
    return -1;
    /*6c0c4c6cf3e7959e241b398b6f212861*/
}
function branch_6c87544f6da2f95e(l,data,state,prod,puid){
    /*43:125 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_169_116
    43:127 primitive_declaration=>modifier_list identifier : type •*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        pushFN(data,branch_8ada6b34c1f213b0);
        return branch_4db7765786d1a76d(l,data,state,prod,8);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*43:127 primitive_declaration=>modifier_list identifier : type •*/
        add_reduce(state,data,4,75);
        /*[43]*/
        /*-------------INDIRECT-------------------*/
        pushFN(data,branch_7eb1981bd29a0a82);
        return 43;
    }
    return -1;
    /*6c87544f6da2f95ee90c7fa26a108dc2*/
}
function branch_6cff2b8305c085c0(l,data,state,prod,puid){
    /*109:328 virtual-126:4:1|--lvl:0=>: type • primitive_declaration_group_169_116
    110:329 virtual-128:3:1|--lvl:0=>: type •*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        pushFN(data,branch_8b26069ce7eab8c5);
        return branch_a95176c7bfbb8a2d(l,data,state,prod,8);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*110:329 virtual-128:3:1|--lvl:0=>: type •*/
        /*[110]*/
        add_reduce(state,data,3,76);
        /*[43]*/
        pushFN(data,$expression_statements_group_023_108_goto);
        return 18;
    }
    return -1;
    /*6cff2b8305c085c0a3a86e80c15620f6*/
}
function branch_6d07be730d81f9e5(l,data,state,prod,puid){
    /*13:37 function=>fn identifier : type • ( parameters ) { expression_statements }
    13:40 function=>fn identifier : type • ( ) { expression_statements }
    13:41 function=>fn identifier : type • ( parameters ) { }
    13:43 function=>fn identifier : type • ( ) { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==40/*[(]*/){
        consume(l,data,state);
        puid |=32;
        /*13:37 function=>fn identifier : type ( • parameters ) { expression_statements }
        13:41 function=>fn identifier : type ( • parameters ) { }
        13:40 function=>fn identifier : type ( • ) { expression_statements }
        13:43 function=>fn identifier : type ( • ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(l.current_byte==41/*[)]*/){
            /*13:40 function=>fn identifier : type ( • ) { expression_statements }
            13:43 function=>fn identifier : type ( • ) { }*/
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            puid |=128;
            /*13:40 function=>fn identifier : type ( ) • { expression_statements }
            13:43 function=>fn identifier : type ( ) • { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if(l.current_byte==123/*[{]*/){
                consume(l,data,state);
                puid |=256;
                /*13:40 function=>fn identifier : type ( ) { • expression_statements }
                13:43 function=>fn identifier : type ( ) { • }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if(l.current_byte==125/*[}]*/){
                    pushFN(data,branch_2d70052e1cc76d5c);
                    return branch_870d867151eaf8cd(l,data,state,prod,256);
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if(((((((((((((((/*[if]*/cmpr_set(l,data,143,2,2)||/*[match]*/cmpr_set(l,data,67,5,5))||/*[break]*/cmpr_set(l,data,72,5,5))||/*[return]*/cmpr_set(l,data,77,6,6))||/*[continue]*/cmpr_set(l,data,39,8,8))||/*[loop]*/cmpr_set(l,data,63,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[==]*/cmpr_set(l,data,7,2,2))||dt_bcea2102060eab13(l,data))||/*[true]*/cmpr_set(l,data,95,4,4))||/*[null]*/cmpr_set(l,data,35,4,4))||dt_6ae31dd85a62ef5c(l,data))||assert_ascii(l,0x0,0x194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
                    pushFN(data,branch_2d70052e1cc76d5c);
                    return branch_88be945da9cb3ed2(l,data,state,prod,256);
                }
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if(assert_ascii(l,0x0,0x10,0x88000000,0x0)||l.isUniID(data)){
            /*13:37 function=>fn identifier : type ( • parameters ) { expression_statements }
            13:41 function=>fn identifier : type ( • parameters ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            pushFN(data,branch_80a7002bfa60e996);
            pushFN(data,$parameters);
            puid |=64;
            return puid;
        }
    }
    return -1;
    /*6d07be730d81f9e531b884559493c342*/
}
function branch_6d263a3bd11654e3(l,data,state,prod,puid){
    add_reduce(state,data,7,52);
    /*[31]*/
    /*6d263a3bd11654e30933b33a2ee6f78b*/
}
function branch_6d6d6d1ed566460d(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=4;
    pushFN(data,branch_57366786353b5641);
    pushFN(data,$expression);
    return puid;
    return -1;
    /*6d6d6d1ed566460d75ccfe211344fb01*/
}
function branch_6d86748e68a8c7d7(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*37:115 member_expression=>member_expression • . identifier*/
    puid |=2;
    consume(l,data,state);
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=4;
    pushFN(data,branch_c02fb8bab7ec7632);
    pushFN(data,$identifier);
    return puid;
    return -1;
    /*6d86748e68a8c7d7b7b4978a7f65fe3f*/
}
function branch_6daab6971c75715b(l,data,state,prod,puid){
    pushFN(data,$expression_statements_group_023_108_goto);
    return 50;
    /*6daab6971c75715ba440511f225a2e62*/
}
function branch_6f2ea2c70840295b(l,data,state,prod,puid){
    add_reduce(state,data,3,43);
    /*[22]*/
    /*-------------INDIRECT-------------------*/
    add_reduce(state,data,1,3);
    pushFN(data,$expression_statements_goto);
    return 20;
    /*6f2ea2c70840295b6dce580f2679221b*/
}
function branch_6f5e28771e67ac14(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*67:206 comment_group_0138_130=>• θsym*/
    puid |=2;
    consume(l,data,state);
    /*[67]*/
    return prod;
    return -1;
    /*6f5e28771e67ac14bc14fc344e97e4f5*/
}
function branch_6ff9c5253d7f8da3(l,data,state,prod,puid){
    add_reduce(state,data,3,36);
    /*[74]*/
    /*-------------INDIRECT-------------------*/
    pushFN(data,$def$defaultproductions_HC_listbody1_100_goto);
    return 74;
    /*6ff9c5253d7f8da322e0769e93cd6438*/
}
function branch_700da797ce4580f4(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=4;
    if((l.current_byte==39/*[']*/)&&consume(l,data,state)){
        add_reduce(state,data,3,89);
        /*[60]*/
        return prod;
    }
    return -1;
    /*700da797ce4580f480729b1126d3dc9e*/
}
function branch_701a22a9bee4a5f7(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    /*11:30 class=>modifier_list cls identifier • { }*/
    puid |=16;
    consume(l,data,state);
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=64;
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,5,14);
        /*[11]*/
        return prod;
    }
    return -1;
    /*701a22a9bee4a5f70448cd2505e1f946*/
}
function branch_70487b9d04cbdc54(l,data,state,prod,puid){
    /*13:36 function=>modifier_list fn identifier : type • ( parameters ) { expression_statements }
    13:38 function=>modifier_list fn identifier : type • ( ) { expression_statements }
    13:39 function=>modifier_list fn identifier : type • ( parameters ) { }
    13:42 function=>modifier_list fn identifier : type • ( ) { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==40/*[(]*/){
        consume(l,data,state);
        puid |=32;
        /*13:36 function=>modifier_list fn identifier : type ( • parameters ) { expression_statements }
        13:39 function=>modifier_list fn identifier : type ( • parameters ) { }
        13:38 function=>modifier_list fn identifier : type ( • ) { expression_statements }
        13:42 function=>modifier_list fn identifier : type ( • ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(l.current_byte==41/*[)]*/){
            /*13:38 function=>modifier_list fn identifier : type ( • ) { expression_statements }
            13:42 function=>modifier_list fn identifier : type ( • ) { }*/
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            puid |=128;
            /*13:38 function=>modifier_list fn identifier : type ( ) • { expression_statements }
            13:42 function=>modifier_list fn identifier : type ( ) • { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if(l.current_byte==123/*[{]*/){
                consume(l,data,state);
                puid |=256;
                /*13:38 function=>modifier_list fn identifier : type ( ) { • expression_statements }
                13:42 function=>modifier_list fn identifier : type ( ) { • }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if(l.current_byte==125/*[}]*/){
                    pushFN(data,branch_2d70052e1cc76d5c);
                    return branch_7cfa07d08abada9e(l,data,state,prod,256);
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if(((((((((((((((/*[if]*/cmpr_set(l,data,143,2,2)||/*[match]*/cmpr_set(l,data,67,5,5))||/*[break]*/cmpr_set(l,data,72,5,5))||/*[return]*/cmpr_set(l,data,77,6,6))||/*[continue]*/cmpr_set(l,data,39,8,8))||/*[loop]*/cmpr_set(l,data,63,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[==]*/cmpr_set(l,data,7,2,2))||dt_bcea2102060eab13(l,data))||/*[true]*/cmpr_set(l,data,95,4,4))||/*[null]*/cmpr_set(l,data,35,4,4))||dt_6ae31dd85a62ef5c(l,data))||assert_ascii(l,0x0,0x194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
                    pushFN(data,branch_2d70052e1cc76d5c);
                    return branch_74c9dcedde02724c(l,data,state,prod,256);
                }
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if(assert_ascii(l,0x0,0x10,0x88000000,0x0)||l.isUniID(data)){
            /*13:36 function=>modifier_list fn identifier : type ( • parameters ) { expression_statements }
            13:39 function=>modifier_list fn identifier : type ( • parameters ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            pushFN(data,branch_df850a3afb2abdc7);
            pushFN(data,$parameters);
            puid |=64;
            return puid;
        }
    }
    return -1;
    /*70487b9d04cbdc5476c9feda0b94271b*/
}
function branch_70a6d49de7de19a8(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=4;
    pushFN(data,branch_fdb237871e61c2a7);
    pushFN(data,$type_group_091_122);
    return puid;
    return -1;
    /*70a6d49de7de19a8b4b9fee1b8dc9d6d*/
}
function branch_72781c6b60c036b7(l,data,state,prod,puid){
    /*7:16 namespace=>ns identifier • { namespace_HC_listbody3_102 }
    7:17 namespace=>ns identifier • { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==123/*[{]*/){
        consume(l,data,state);
        puid |=4;
        /*7:16 namespace=>ns identifier { • namespace_HC_listbody3_102 }
        7:17 namespace=>ns identifier { • }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.current_byte==125/*[}]*/){
            pushFN(data,branch_d239b9dc91064a7d);
            return branch_d2c6d519cf7571ee(l,data,state,prod,4);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if(((((((/*[import]*/cmpr_set(l,data,29,6,6)||/*[cls]*/cmpr_set(l,data,122,3,3))||/*[str]*/cmpr_set(l,data,47,3,3))||/*[fn]*/cmpr_set(l,data,144,2,2))||/*[ns]*/cmpr_set(l,data,120,2,2))||/*[<<--]*/cmpr_set(l,data,20,4,4))||assert_ascii(l,0x0,0x10,0x88000000,0x0))||l.isUniID(data)){
            pushFN(data,branch_d239b9dc91064a7d);
            return branch_02d5e18a2428b482(l,data,state,prod,4);
        }
    }
    return -1;
    /*72781c6b60c036b725c40b417c0955b2*/
}
function branch_738e78cb42aaca73(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*12:34 struct=>modifier_list str identifier { • }*/
    puid |=32;
    consume(l,data,state);
    add_reduce(state,data,5,18);
    /*[12]*/
    return prod;
    return -1;
    /*738e78cb42aaca73db12d88ad2543bf2*/
}
function branch_73df4fa2a9e9bee1(l,data,state,prod,puid){
    return 48;
    /*73df4fa2a9e9bee1744f8587dac49594*/
}
function branch_741e3108e294d70e(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*107:323 def$identifier_symbols=>def$identifier_symbols • θnum*/
    puid |=32;
    consume(l,data,state);
    add_reduce(state,data,2,87);
    /*[107]*/
    return prod;
    return -1;
    /*741e3108e294d70e61de5289d486c2e0*/
}
function branch_744b33150361e31f(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*29:92 loop_expression_group_254_111=>( • expression )*/
    puid |=2;
    pushFN(data,branch_ee07032c1218f694);
    pushFN(data,$expression);
    return puid;
    return -1;
    /*744b33150361e31ff7d136bb8b206ee4*/
}
function branch_74c8218421c7bef8(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$expression_statements_group_023_108_goto);
    return 26;
    /*74c8218421c7bef80493a1e1dd58d02d*/
}
function branch_74c9dcedde02724c(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*13:38 function=>modifier_list fn identifier : type ( ) { • expression_statements }*/
    puid |=512;
    pushFN(data,branch_4befa0cae2f0dcb4);
    pushFN(data,$expression_statements);
    return puid;
    return -1;
    /*74c9dcedde02724c40eb270abfb05774*/
}
function branch_761715d9ba159589(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*87:267 def$hex_token_group_044_104=>• E*/
    puid |=2048;
    consume(l,data,state);
    /*[87]*/
    return prod;
    return -1;
    /*761715d9ba1595893beaa116dec679f2*/
}
function branch_76ec4ae29d63772d(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=512;
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,10,28);
        /*[14]*/
        return prod;
    }
    return -1;
    /*76ec4ae29d63772d82fb4ba2d60cd8d7*/
}
function branch_76f08b36d7ba8013(l,data,state,prod,puid){
    /*43:125 primitive_declaration=>modifier_list identifier • : type primitive_declaration_group_169_116
    43:127 primitive_declaration=>modifier_list identifier • : type*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==58/*[:]*/){
        consume(l,data,state);
        puid |=4;
        /*43:125 primitive_declaration=>modifier_list identifier : • type primitive_declaration_group_169_116
        43:127 primitive_declaration=>modifier_list identifier : • type*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_e4c6cbcf646800d8);
        pushFN(data,$type);
        puid |=8;
        return puid;
    }
    return -1;
    /*76f08b36d7ba8013fcfbf0bde9030bad*/
}
function branch_77021102c0ebad84(l,data,state,prod,puid){
    add_reduce(state,data,2,0);
    /*[48]*/
    return prod;
    /*77021102c0ebad8430dac006269ad615*/
}
function branch_7754ee6681a28e7f(l,data,state,prod,puid){
    /*110:329 virtual-192:3:1|--lvl:0=>operator_HC_listbody1_129 • identifier_token_group_079_119
    111:330 virtual-196:2:1|--lvl:0=>operator_HC_listbody1_129 •*/
    skip_db1786a8af54d666(l/*[ 71 ]*/,data,state);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/){
        pushFN(data,branch_104689cb2c001c22);
        return branch_44384df8d540dc12(l,data,state,prod,16);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*111:330 virtual-196:2:1|--lvl:0=>operator_HC_listbody1_129 •*/
        /*[111]*/
        add_reduce(state,data,2,91);
        /*[65]*/
        return 65;
    }
    return -1;
    /*7754ee6681a28e7f4e53a8bb343895f6*/
}
function branch_7767d3c74fd76f36(l,data,state,prod,puid){
    /*43:126 primitive_declaration=>identifier : type • primitive_declaration_group_169_116
    43:128 primitive_declaration=>identifier : type •*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        pushFN(data,branch_3205c0ded576131e);
        return branch_5ebfbb554475da4a(l,data,state,prod,8);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*43:128 primitive_declaration=>identifier : type •*/
        add_reduce(state,data,3,76);
        /*[43]*/
    }
    return -1;
    /*7767d3c74fd76f365ff63581b4705018*/
}
function branch_78c0177f3f3b49f8(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*27:88 unary_value=>• value*/
    puid |=8;
    pushFN(data,branch_983cfa18d3366990);
    pushFN(data,$value);
    return puid;
    return -1;
    /*78c0177f3f3b49f8c7665eb30b87aab9*/
}
function branch_79692bd029113770(l,data,state,prod,puid){
    add_reduce(state,data,3,0);
    /*[48]*/
    return 48;
    /*79692bd029113770933881c743302d07*/
}
function branch_798031375f905384(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*47:136 identifier_token_group_079_119=>• θnl*/
    puid |=2;
    consume(l,data,state);
    /*[47]*/
    return prod;
    return -1;
    /*798031375f9053843193d45fd63c356b*/
}
function branch_79f7ddcfe867ba26(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*31:102 loop_expression=>loop ( ; ; • loop_expression_HC_listbody6_112 ) expression*/
    puid |=64;
    pushFN(data,branch_664e24a2b2c0a66f);
    pushFN(data,$loop_expression_HC_listbody6_112);
    return puid;
    return -1;
    /*79f7ddcfe867ba267c2151bdf06ac8fb*/
}
function branch_79fc893000608c8d(l,data,state,prod,puid){
    return 93;
    /*79fc893000608c8da613679846f07cca*/
}
function branch_7a8be2c54a4d26e4(l,data,state,prod,puid){
    pushFN(data,$class_group_016_104_goto);
    return 50;
    /*7a8be2c54a4d26e4693c3a0a89e60743*/
}
function branch_7a957cbb337480a9(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*56:165 value=>• true*/
    puid |=4;
    consume(l,data,state);
    add_reduce(state,data,1,83);
    /*[56]*/
    return prod;
    return -1;
    /*7a957cbb337480a90652f1ca3f0223c4*/
}
function branch_7aa32f5c9ec33c40(l,data,state,prod,puid){
    add_reduce(state,data,2,0);
    /*[84]*/
    return 84;
    /*7aa32f5c9ec33c40cc432cb2bfe3ef05*/
}
function branch_7abe37b49929c439(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*13:39 function=>modifier_list fn identifier : type ( parameters ) { • }*/
    puid |=1024;
    consume(l,data,state);
    add_reduce(state,data,10,23);
    /*[13]*/
    return prod;
    return -1;
    /*7abe37b49929c4397f60af55b36f5d8d*/
}
function branch_7b4c140a66109b8c(l,data,state,prod,puid){
    add_reduce(state,data,4,74);
    /*[43]*/
    return prod;
    /*7b4c140a66109b8c3d3e34ad6153bc05*/
}
function branch_7bd41de4c3b97b3a(l,data,state,prod,puid){
    return 62;
    /*7bd41de4c3b97b3a1e5aaf8dd0db1c0b*/
}
function branch_7cfa07d08abada9e(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*13:42 function=>modifier_list fn identifier : type ( ) { • }*/
    puid |=1024;
    consume(l,data,state);
    add_reduce(state,data,9,26);
    /*[13]*/
    return prod;
    return -1;
    /*7cfa07d08abada9efccbc380f8378599*/
}
function branch_7d4b362c2acf2890(l,data,state,prod,puid){
    add_reduce(state,data,3,50);
    /*[31]*/
    return 31;
    /*7d4b362c2acf2890c1aa7ac24dd2f3cd*/
}
function branch_7d65472d38dcaab1(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    /*60:180 string=>• " "*/
    puid |=1;
    consume(l,data,state);
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=1;
    if((l.current_byte==34/*["]*/)&&consume(l,data,state)){
        add_reduce(state,data,2,90);
        /*[60]*/
        return prod;
    }
    return -1;
    /*7d65472d38dcaab143ad46954ab6578a*/
}
function branch_7d7917e7f9ab4bb6(l,data,state,prod,puid){
    add_reduce(state,data,1,3);
    /*[74]*/
    pushFN(data,$def$defaultproductions_HC_listbody1_100_goto);
    return 74;
    /*7d7917e7f9ab4bb680819c76fec7cc19*/
}
function branch_7dcd4e56969f4413(l,data,state,prod,puid){
    return 11;
    /*7dcd4e56969f44130342b866c7e73e16*/
}
function branch_7e0d2ce0f884b7a8(l,data,state,prod,puid){
    add_reduce(state,data,1,88);
    /*[59]*/
    pushFN(data,$string_HC_listbody1_127_goto);
    return 59;
    /*7e0d2ce0f884b7a8709cb553e9ef6e74*/
}
function branch_7e5a50f34c79f7dd(l,data,state,prod,puid){
    /*14:44 function_expression=>modifier_list fn : type • ( parameters ) { expression_statements }
    14:46 function_expression=>modifier_list fn : type • ( ) { expression_statements }
    14:47 function_expression=>modifier_list fn : type • ( parameters ) { }
    14:50 function_expression=>modifier_list fn : type • ( ) { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==40/*[(]*/){
        consume(l,data,state);
        puid |=16;
        /*14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
        14:47 function_expression=>modifier_list fn : type ( • parameters ) { }
        14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
        14:50 function_expression=>modifier_list fn : type ( • ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(l.current_byte==41/*[)]*/){
            /*14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
            14:50 function_expression=>modifier_list fn : type ( • ) { }*/
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            puid |=64;
            /*14:46 function_expression=>modifier_list fn : type ( ) • { expression_statements }
            14:50 function_expression=>modifier_list fn : type ( ) • { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if(l.current_byte==123/*[{]*/){
                consume(l,data,state);
                puid |=128;
                /*14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }
                14:50 function_expression=>modifier_list fn : type ( ) { • }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if(l.current_byte==125/*[}]*/){
                    pushFN(data,branch_521f65aff0d7939b);
                    return branch_4f452b9fa5813076(l,data,state,prod,128);
                }
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if(assert_ascii(l,0x0,0x10,0x88000000,0x0)||l.isUniID(data)){
            /*14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
            14:47 function_expression=>modifier_list fn : type ( • parameters ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            pushFN(data,branch_29e57603c3f39f3b);
            pushFN(data,$parameters);
            puid |=32;
            return puid;
        }
    }
    return -1;
    /*7e5a50f34c79f7dd823e5498a7b41904*/
}
function branch_7eb1981bd29a0a82(l,data,state,prod,puid){
    while(1){
        switch(prod){
            case 16:
                /*115:334 virtual-328:8:1|--lvl:1=>parameters • ; expression ; loop_expression_HC_listbody6_112 ) expression
                16:54 parameters=>parameters • , primitive_declaration
                116:335 virtual-329:7:1|--lvl:1=>parameters • ; ; loop_expression_HC_listbody6_112 ) expression
                117:336 virtual-330:7:1|--lvl:1=>parameters • ; expression ; ) expression
                118:337 virtual-331:6:1|--lvl:1=>parameters • ; ; ) expression*/
                /*115:334 virtual-328:8:1|--lvl:1=>parameters • ; expression ; loop_expression_HC_listbody6_112 ) expression
                116:335 virtual-329:7:1|--lvl:1=>parameters • ; ; loop_expression_HC_listbody6_112 ) expression
                117:336 virtual-330:7:1|--lvl:1=>parameters • ; expression ; ) expression
                118:337 virtual-331:6:1|--lvl:1=>parameters • ; ; ) expression
                16:54 parameters=>parameters • , primitive_declaration*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(l.current_byte==59/*[;]*/){
                    /*115:334 virtual-328:8:1|--lvl:1=>parameters • ; expression ; loop_expression_HC_listbody6_112 ) expression
                    117:336 virtual-330:7:1|--lvl:1=>parameters • ; expression ; ) expression
                    116:335 virtual-329:7:1|--lvl:1=>parameters • ; ; loop_expression_HC_listbody6_112 ) expression
                    118:337 virtual-331:6:1|--lvl:1=>parameters • ; ; ) expression*/
                    var pk = l.copy();
                    skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,0);
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    if(pk.current_byte==59/*[;]*/){
                        /*116:335 virtual-329:7:1|--lvl:1=>parameters • ; ; loop_expression_HC_listbody6_112 ) expression
                        118:337 virtual-331:6:1|--lvl:1=>parameters • ; ; ) expression*/
                        /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                        consume(l,data,state);
                        puid |=32;
                        /*116:335 virtual-329:7:1|--lvl:1=>parameters ; • ; loop_expression_HC_listbody6_112 ) expression
                        118:337 virtual-331:6:1|--lvl:1=>parameters ; • ; ) expression*/
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                        if(l.current_byte==59/*[;]*/){
                            consume(l,data,state);
                            puid |=32;
                            /*116:335 virtual-329:7:1|--lvl:1=>parameters ; ; • loop_expression_HC_listbody6_112 ) expression
                            118:337 virtual-331:6:1|--lvl:1=>parameters ; ; • ) expression*/
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                            /*⤋⤋⤋ assert ⤋⤋⤋*/
                            if(l.current_byte==41/*[)]*/){
                                pushFN(data,branch_4a236324dddf6f01);
                                return branch_1fd0233e235cc36b(l,data,state,prod,32);
                                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                            } else if(((((((((((((((/*[if]*/cmpr_set(l,data,143,2,2)||/*[match]*/cmpr_set(l,data,67,5,5))||/*[break]*/cmpr_set(l,data,72,5,5))||/*[return]*/cmpr_set(l,data,77,6,6))||/*[continue]*/cmpr_set(l,data,39,8,8))||/*[loop]*/cmpr_set(l,data,63,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[==]*/cmpr_set(l,data,7,2,2))||dt_bcea2102060eab13(l,data))||/*[true]*/cmpr_set(l,data,95,4,4))||/*[null]*/cmpr_set(l,data,35,4,4))||dt_6ae31dd85a62ef5c(l,data))||assert_ascii(l,0x0,0x194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
                                pushFN(data,branch_4a236324dddf6f01);
                                return branch_ba51a3dd41c87eef(l,data,state,prod,32);
                            }
                        }
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                    } else if(((((((((((((((/*[if]*/cmpr_set(pk,data,143,2,2)||/*[match]*/cmpr_set(pk,data,67,5,5))||/*[==]*/cmpr_set(pk,data,7,2,2))||dt_bcea2102060eab13(pk,data))||dt_6ae31dd85a62ef5c(pk,data))||/*[true]*/cmpr_set(pk,data,95,4,4))||/*[null]*/cmpr_set(pk,data,35,4,4))||/*[<<--]*/cmpr_set(pk,data,20,4,4))||/*[break]*/cmpr_set(pk,data,72,5,5))||/*[return]*/cmpr_set(pk,data,77,6,6))||/*[continue]*/cmpr_set(pk,data,39,8,8))||/*[loop]*/cmpr_set(pk,data,63,4,4))||assert_ascii(pk,0x0,0x194,0x88000000,0x8000000))||pk.isUniID(data))||pk.isNum(data))||pk.isSym(true,data)){
                        /*115:334 virtual-328:8:1|--lvl:1=>parameters • ; expression ; loop_expression_HC_listbody6_112 ) expression
                        117:336 virtual-330:7:1|--lvl:1=>parameters • ; expression ; ) expression*/
                        /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                        consume(l,data,state);
                        puid |=32;
                        /*115:334 virtual-328:8:1|--lvl:1=>parameters ; • expression ; loop_expression_HC_listbody6_112 ) expression
                        117:336 virtual-330:7:1|--lvl:1=>parameters ; • expression ; ) expression*/
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                        pushFN(data,branch_96d52134ce3831f4);
                        pushFN(data,$expression);
                        puid |=4;
                        return puid;
                    }
                    /*⤋⤋⤋ assert ⤋⤋⤋*/
                } else if(l.current_byte==44/*[,]*/){
                    pushFN(data,branch_8ca9437796b31cbf);
                    return branch_b3028ea0f4458d82(l,data,state,prod,1);
                }
                break;
            case 21:
                /*114:333 virtual-92:3:1|--lvl:1=>expression • )*/
                /*114:333 virtual-92:3:1|--lvl:1=>expression • )*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                if(l.current_byte==41/*[)]*/){
                    consume(l,data,state);
                    puid |=4;
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                    /*114:333 virtual-92:3:1|--lvl:1=>expression ) •*/
                    /*[114]*/
                    pushFN(data,branch_422b46df4c667337);
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
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                if(sym_map_e58af9c6fd146069(l,data)==1){
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    /*25:82 binary_expression=>unary_expression •*/
                    /*[25]*/
                    prod = 21;
                    continue;;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if(/*[==]*/cmpr_set(l,data,7,2,2)||l.isSym(true,data)){
                    /*25:80 binary_expression=>unary_expression • operator
                    25:81 binary_expression=>unary_expression • operator expression*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                    pushFN(data,branch_53ecf5481f303c86);
                    pushFN(data,$operator);
                    puid |=2;
                    return puid;
                }
                break;
            case 28:
                /*22:76 assignment_expression=>left_hand_expression • = expression
                27:85 unary_value=>left_hand_expression •*/
                /*22:76 assignment_expression=>left_hand_expression • = expression
                27:85 unary_value=>left_hand_expression •*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                switch(sym_map_00f57473245d5924(l,data)){
                    case 0:
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert ⤋⤋⤋*/
                        /*22:76 assignment_expression=>left_hand_expression • = expression*/
                        puid |=2;
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                        puid |=4;
                        pushFN(data,branch_fea8e7c51f5b74ce);
                        pushFN(data,$expression);
                        return puid;
                    default:
                    case 1:
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*27:85 unary_value=>left_hand_expression •*/
                        /*[27]*/
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
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                switch(sym_map_c82afb129e509311(l,data)){
                    case 0:
                        /*28:91 left_hand_expression=>member_expression •
                        37:116 member_expression=>member_expression • [ expression ]*/
                        var pk = l.copy();
                        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,0);
                        switch(sym_map_5f25d3b4480e3a7f(pk,data)){
                            case 0:
                                /*--LEAF--*/
                                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                                /*37:116 member_expression=>member_expression • [ expression ]*/
                                puid |=8;
                                consume(l,data,state);
                                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                                puid |=16;
                                pushFN(data,branch_c63f9575bdce92ba);
                                pushFN(data,$expression);
                                return puid;
                            default:
                            case 1:
                                /*--LEAF--*/
                                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                                /*28:91 left_hand_expression=>member_expression •*/
                                /*[28]*/
                                prod = 28;
                                continue;;
                            case 2:
                                /*--LEAF--*/
                                /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                                /*37:116 member_expression=>member_expression • [ expression ]*/
                                puid |=8;
                                consume(l,data,state);
                                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                                puid |=16;
                                pushFN(data,branch_c63f9575bdce92ba);
                                pushFN(data,$expression);
                                return puid;
                        }
                    case 1:
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert ⤋⤋⤋*/
                        /*37:115 member_expression=>member_expression • . identifier*/
                        puid |=2;
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                        puid |=4;
                        pushFN(data,branch_2609292db6fd2ae2);
                        pushFN(data,$identifier);
                        return puid;
                    case 2:
                        /*36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                        36:114 call_expression=>member_expression • ( )*/
                        var pk = l.copy();
                        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,0);
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        if(pk.current_byte==41/*[)]*/){
                            pushFN(data,branch_2392b7b3a01e4cef);
                            return branch_12c35f486abaab8c(l,data,state,prod,1);
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        } else if(((((((((((((((/*[if]*/cmpr_set(pk,data,143,2,2)||/*[match]*/cmpr_set(pk,data,67,5,5))||/*[break]*/cmpr_set(pk,data,72,5,5))||/*[return]*/cmpr_set(pk,data,77,6,6))||/*[continue]*/cmpr_set(pk,data,39,8,8))||/*[loop]*/cmpr_set(pk,data,63,4,4))||/*[<<--]*/cmpr_set(pk,data,20,4,4))||/*[==]*/cmpr_set(pk,data,7,2,2))||dt_bcea2102060eab13(pk,data))||/*[true]*/cmpr_set(pk,data,95,4,4))||/*[null]*/cmpr_set(pk,data,35,4,4))||dt_6ae31dd85a62ef5c(pk,data))||assert_ascii(pk,0x0,0x194,0x88000000,0x8000000))||pk.isUniID(data))||pk.isNum(data))||pk.isSym(true,data)){
                            pushFN(data,branch_2392b7b3a01e4cef);
                            return branch_6273212a0843d505(l,data,state,prod,1);
                        }
                    default:
                    case 3:
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*28:91 left_hand_expression=>member_expression •*/
                        /*[28]*/
                        prod = 28;
                        continue;;
                }
                break;
            case 43:
                /*16:55 parameters=>primitive_declaration •
                119:338 virtual-332:6:1|--lvl:1=>primitive_declaration • in expression ) expression*/
                /*16:55 parameters=>primitive_declaration •
                119:338 virtual-332:6:1|--lvl:1=>primitive_declaration • in expression ) expression*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if(/*[in]*/cmpr_set(l,data,43,2,2)){
                    pushFN(data,branch_4a236324dddf6f01);
                    return branch_cdb6cd975ad71487(l,data,state,prod,256);
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                } else {
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    /*16:55 parameters=>primitive_declaration •*/
                    add_reduce(state,data,1,3);
                    /*[16]*/
                    prod = 16;
                    continue;;
                }
                break;
            case 44:
                /*37:117 member_expression=>identifier •
                43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                43:128 primitive_declaration=>identifier • : type*/
                /*37:117 member_expression=>identifier •
                43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                43:128 primitive_declaration=>identifier • : type*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                switch(sym_map_9fff07fe93fb5f87(l,data)){
                    case 0:
                        /*37:117 member_expression=>identifier •
                        43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                        43:128 primitive_declaration=>identifier • : type*/
                        var pk = l.copy();
                        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,0);
                        switch(sym_map_28592a8cdba54a6c(pk,data)){
                            case 0:
                                /*43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                                43:128 primitive_declaration=>identifier • : type*/
                                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                                consume(l,data,state);
                                puid |=4;
                                /*43:126 primitive_declaration=>identifier : • type primitive_declaration_group_169_116
                                43:128 primitive_declaration=>identifier : • type*/
                                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                                pushFN(data,branch_a3c705480549ad3d);
                                pushFN(data,$type);
                                puid |=8;
                                return puid;
                            default:
                            case 1:
                                /*--LEAF--*/
                                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                                /*37:117 member_expression=>identifier •*/
                                add_reduce(state,data,1,67);
                                /*[37]*/
                                prod = 37;
                                continue;;
                            case 2:
                                /*-------------VPROD-------------------------*/
                                /*37:117 member_expression=>identifier •
                                43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                                43:128 primitive_declaration=>identifier • : type*/
                                pushFN(data,branch_90b0fe29fbf02159);
                                return 0;
                        }
                    default:
                    case 1:
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*37:117 member_expression=>identifier •*/
                        add_reduce(state,data,1,67);
                        /*[37]*/
                        prod = 37;
                        continue;;
                }
                break;
            case 50:
                /*14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
                14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
                14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
                14:50 function_expression=>modifier_list • fn : type ( ) { }
                43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
                43:127 primitive_declaration=>modifier_list • identifier : type*/
                /*14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
                14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
                14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
                14:50 function_expression=>modifier_list • fn : type ( ) { }
                43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
                43:127 primitive_declaration=>modifier_list • identifier : type*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(/*[fn]*/cmpr_set(l,data,144,2,2)){
                    /*14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
                    14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
                    14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
                    14:50 function_expression=>modifier_list • fn : type ( ) { }*/
                    /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                    consume(l,data,state);
                    puid |=2;
                    /*14:44 function_expression=>modifier_list fn • : type ( parameters ) { expression_statements }
                    14:46 function_expression=>modifier_list fn • : type ( ) { expression_statements }
                    14:47 function_expression=>modifier_list fn • : type ( parameters ) { }
                    14:50 function_expression=>modifier_list fn • : type ( ) { }*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                    if(l.current_byte==58/*[:]*/){
                        consume(l,data,state);
                        puid |=4;
                        /*14:44 function_expression=>modifier_list fn : • type ( parameters ) { expression_statements }
                        14:46 function_expression=>modifier_list fn : • type ( ) { expression_statements }
                        14:47 function_expression=>modifier_list fn : • type ( parameters ) { }
                        14:50 function_expression=>modifier_list fn : • type ( ) { }*/
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                        pushFN(data,branch_faddd047c41de2c5);
                        pushFN(data,$type);
                        puid |=8;
                        return puid;
                    }
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
                    /*43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
                    43:127 primitive_declaration=>modifier_list • identifier : type*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                    pushFN(data,branch_b51affde31ea4bf3);
                    pushFN(data,$identifier);
                    puid |=2;
                    return puid;
                }
                break;
        }
        break;
    }
    /*7eb1981bd29a0a82c2253c3463723260*/
}
function branch_7ebf556a2d595773(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*21:75 expression=>{ • }*/
    puid |=1024;
    consume(l,data,state);
    add_reduce(state,data,2,42);
    /*[21]*/
    return prod;
    return -1;
    /*7ebf556a2d5957738773964f47fc80de*/
}
function branch_7ecaeae0c5962361(l,data,state,prod,puid){
    /*65:191 operator=>θsym operator_HC_listbody1_128 • identifier_token_group_079_119
    65:194 operator=>θsym operator_HC_listbody1_128 •*/
    skip_db1786a8af54d666(l/*[ 71 ]*/,data,state);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/){
        pushFN(data,branch_3205c0ded576131e);
        return branch_a3260e1db671c1f2(l,data,state,prod,2);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*65:194 operator=>θsym operator_HC_listbody1_128 •*/
        add_reduce(state,data,2,91);
        /*[65]*/
    }
    return -1;
    /*7ecaeae0c59623617cdca391184527fa*/
}
function branch_7ecdaf05f5bfbada(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=512;
    if(/*[in]*/cmpr_set(l,data,43,2,2)&&consume(l,data,state)){
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        puid |=4;
        pushFN(data,branch_075e823756dc8b4f);
        pushFN(data,$expression);
        return puid;
    }
    return -1;
    /*7ecdaf05f5bfbada79f4843277b7d1e4*/
}
function branch_7f884ce191790bd2(l,data,state,prod,puid){
    add_reduce(state,data,2,2);
    /*[69]*/
    return prod;
    /*7f884ce191790bd21afd96249f4d12b5*/
}
function branch_7fe2059f09133bde(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$operator_HC_listbody1_128_goto);
    return 63;
    /*7fe2059f09133bdeaee44d0182f6596d*/
}
function branch_7fe3eae917c31513(l,data,state,prod,puid){
    return 19;
    /*7fe3eae917c31513a9ca9681abae581a*/
}
function branch_800ab341c1d5f272(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*26:83 unary_expression=>• operator unary_value*/
    puid |=1;
    pushFN(data,branch_2968f1d85e88b624);
    pushFN(data,$operator);
    return puid;
    return -1;
    /*800ab341c1d5f27218468b6b7769ee57*/
}
function branch_80915c2dc1b0f8ab(l,data,state,prod,puid){
    add_reduce(state,data,5,44);
    /*[24]*/
    return 24;
    /*80915c2dc1b0f8abfca8140aa3f18f9a*/
}
function branch_80a7002bfa60e996(l,data,state,prod,puid){
    /*13:37 function=>fn identifier : type ( parameters • ) { expression_statements }
    13:41 function=>fn identifier : type ( parameters • ) { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==41/*[)]*/){
        consume(l,data,state);
        puid |=128;
        /*13:37 function=>fn identifier : type ( parameters ) • { expression_statements }
        13:41 function=>fn identifier : type ( parameters ) • { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if(l.current_byte==123/*[{]*/){
            consume(l,data,state);
            puid |=256;
            /*13:37 function=>fn identifier : type ( parameters ) { • expression_statements }
            13:41 function=>fn identifier : type ( parameters ) { • }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if(l.current_byte==125/*[}]*/){
                pushFN(data,branch_2d70052e1cc76d5c);
                return branch_05c2b43331558a0c(l,data,state,prod,256);
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if(((((((((((((((/*[if]*/cmpr_set(l,data,143,2,2)||/*[match]*/cmpr_set(l,data,67,5,5))||/*[break]*/cmpr_set(l,data,72,5,5))||/*[return]*/cmpr_set(l,data,77,6,6))||/*[continue]*/cmpr_set(l,data,39,8,8))||/*[loop]*/cmpr_set(l,data,63,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[==]*/cmpr_set(l,data,7,2,2))||dt_bcea2102060eab13(l,data))||/*[true]*/cmpr_set(l,data,95,4,4))||/*[null]*/cmpr_set(l,data,35,4,4))||dt_6ae31dd85a62ef5c(l,data))||assert_ascii(l,0x0,0x194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
                pushFN(data,branch_2d70052e1cc76d5c);
                return branch_964751f46347f460(l,data,state,prod,256);
            }
        }
    }
    return -1;
    /*80a7002bfa60e9964b5f54c1d096916d*/
}
function branch_8138879e1d427f9d(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=128;
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        puid |=4;
        pushFN(data,branch_cf808672b5bab9d7);
        pushFN(data,$expression);
        return puid;
    }
    return -1;
    /*8138879e1d427f9dc634fff7838ae545*/
}
function branch_823771e7a5146f1a(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*110:329 virtual-100:8:1|--lvl:0=>( parameters ; ; • loop_expression_HC_listbody6_112 ) expression*/
    puid |=64;
    pushFN(data,branch_98da65c52e9c8411);
    pushFN(data,$loop_expression_HC_listbody6_112);
    return puid;
    return -1;
    /*823771e7a5146f1aaab61e66a9c90258*/
}
function branch_82e02779e31fa094(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*58:174 string_HC_listbody1_126=>string_HC_listbody1_126 • string_group_0111_125*/
    puid |=2;
    pushFN(data,branch_04b7db6045e02466);
    pushFN(data,$string_group_0111_125);
    return puid;
    return -1;
    /*82e02779e31fa09456a6967bef33aba2*/
}
function branch_82f1db0813af9681(l,data,state,prod,puid){
    /*[115]*/
    return prod;
    /*82f1db0813af9681178f63684a28ebd2*/
}
function branch_833469dae973f71e(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=128;
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        puid |=4;
        pushFN(data,branch_e810bf88c11bf1f7);
        pushFN(data,$expression);
        return puid;
    }
    return -1;
    /*833469dae973f71ec0ce77a4a051cf4f*/
}
function branch_83a8971da481bd2c(l,data,state,prod,puid){
    /*13:36 function=>modifier_list fn identifier : type • ( parameters ) { expression_statements }
    13:38 function=>modifier_list fn identifier : type • ( ) { expression_statements }
    13:39 function=>modifier_list fn identifier : type • ( parameters ) { }
    13:42 function=>modifier_list fn identifier : type • ( ) { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==40/*[(]*/){
        consume(l,data,state);
        puid |=32;
        /*13:36 function=>modifier_list fn identifier : type ( • parameters ) { expression_statements }
        13:39 function=>modifier_list fn identifier : type ( • parameters ) { }
        13:38 function=>modifier_list fn identifier : type ( • ) { expression_statements }
        13:42 function=>modifier_list fn identifier : type ( • ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(l.current_byte==41/*[)]*/){
            /*13:38 function=>modifier_list fn identifier : type ( • ) { expression_statements }
            13:42 function=>modifier_list fn identifier : type ( • ) { }*/
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            puid |=128;
            /*13:38 function=>modifier_list fn identifier : type ( ) • { expression_statements }
            13:42 function=>modifier_list fn identifier : type ( ) • { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if(l.current_byte==123/*[{]*/){
                consume(l,data,state);
                puid |=256;
                /*13:38 function=>modifier_list fn identifier : type ( ) { • expression_statements }
                13:42 function=>modifier_list fn identifier : type ( ) { • }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if(l.current_byte==125/*[}]*/){
                    pushFN(data,branch_0a5b9c282ee399c8);
                    return branch_7cfa07d08abada9e(l,data,state,prod,256);
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if(((((((((((((((/*[if]*/cmpr_set(l,data,143,2,2)||/*[match]*/cmpr_set(l,data,67,5,5))||/*[break]*/cmpr_set(l,data,72,5,5))||/*[return]*/cmpr_set(l,data,77,6,6))||/*[continue]*/cmpr_set(l,data,39,8,8))||/*[loop]*/cmpr_set(l,data,63,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[==]*/cmpr_set(l,data,7,2,2))||dt_bcea2102060eab13(l,data))||/*[true]*/cmpr_set(l,data,95,4,4))||/*[null]*/cmpr_set(l,data,35,4,4))||dt_6ae31dd85a62ef5c(l,data))||assert_ascii(l,0x0,0x194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
                    pushFN(data,branch_0a5b9c282ee399c8);
                    return branch_74c9dcedde02724c(l,data,state,prod,256);
                }
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if(assert_ascii(l,0x0,0x10,0x88000000,0x0)||l.isUniID(data)){
            /*13:36 function=>modifier_list fn identifier : type ( • parameters ) { expression_statements }
            13:39 function=>modifier_list fn identifier : type ( • parameters ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            pushFN(data,branch_cc7c66b5d101dfcb);
            pushFN(data,$parameters);
            puid |=64;
            return puid;
        }
    }
    return -1;
    /*83a8971da481bd2c1ff29eee082bd2e2*/
}
function branch_842687b83573bfa1(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*76:225 def$defaultproduction=>• def$hex*/
    puid |=2;
    pushFN(data,branch_8a57482f2f0b103f);
    pushFN(data,$def$hex);
    return puid;
    return -1;
    /*842687b83573bfa12d4ba65cea226897*/
}
function branch_849029a2066d2c91(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*94:283 def$octal_token_group_058_109=>• 4*/
    puid |=16;
    consume(l,data,state);
    /*[94]*/
    return prod;
    return -1;
    /*849029a2066d2c91f2f60902acf6059f*/
}
function branch_84fa922c5c4d7b9b(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*57:173 string_group_0111_125=>• \"*/
    puid |=16;
    consume(l,data,state);
    /*[57]*/
    return prod;
    return -1;
    /*84fa922c5c4d7b9ba4af87570398b307*/
}
function branch_85698f8b4db6cf7a(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*77:242 def$hex_digit=>• τF*/
    puid |=4096;
    consume(l,data,state);
    /*[77]*/
    return prod;
    return -1;
    /*85698f8b4db6cf7a296a1a8848070edf*/
}
function branch_85e80e0b1ee638b6(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*36:113 call_expression=>member_expression ( • call_expression_HC_listbody2_114 )*/
    puid |=4;
    pushFN(data,branch_2d91057f5b4b0977);
    pushFN(data,$call_expression_HC_listbody2_114);
    return puid;
    return -1;
    /*85e80e0b1ee638b6a416d59c65d0098a*/
}
function branch_860bac5cf31d5fbc(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*87:259 def$hex_token_group_044_104=>• c*/
    puid |=8;
    consume(l,data,state);
    /*[87]*/
    return prod;
    return -1;
    /*860bac5cf31d5fbc5b216964595cc845*/
}
function branch_869fef6fa980a0b2(l,data,state,prod,puid){
    add_reduce(state,data,2,87);
    /*[59]*/
    return prod;
    /*869fef6fa980a0b2e956fb2b8755073c*/
}
function branch_86d8752e71a39e7a(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*56:164 value=>• tk:string*/
    puid |=2;
    if(tk_f70d460017f6375f(l,data)&&consume(l,data,state)){
        add_reduce(state,data,1,82);
        /*[56]*/
        return prod;
    }
    return -1;
    /*86d8752e71a39e7a4333f31708482875*/
}
function branch_870b9591079c3e66(l,data,state,prod,puid){
    add_reduce(state,data,2,87);
    /*[103]*/
    return prod;
    /*870b9591079c3e6674f58b687643622b*/
}
function branch_870d867151eaf8cd(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*13:43 function=>fn identifier : type ( ) { • }*/
    puid |=1024;
    consume(l,data,state);
    add_reduce(state,data,8,27);
    /*[13]*/
    return prod;
    return -1;
    /*870d867151eaf8cd59db7c007de44964*/
}
function branch_87acff1332a9df27(l,data,state,prod,puid){
    /*14:45 function_expression=>fn : type ( parameters • ) { expression_statements }
    14:49 function_expression=>fn : type ( parameters • ) { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==41/*[)]*/){
        consume(l,data,state);
        puid |=64;
        /*14:45 function_expression=>fn : type ( parameters ) • { expression_statements }
        14:49 function_expression=>fn : type ( parameters ) • { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if(l.current_byte==123/*[{]*/){
            consume(l,data,state);
            puid |=128;
            /*14:45 function_expression=>fn : type ( parameters ) { • expression_statements }
            14:49 function_expression=>fn : type ( parameters ) { • }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if(l.current_byte==125/*[}]*/){
                pushFN(data,branch_c3b494f09f364853);
                return branch_2ebb3dacba020113(l,data,state,prod,128);
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if(((((((((((((((/*[if]*/cmpr_set(l,data,143,2,2)||/*[match]*/cmpr_set(l,data,67,5,5))||/*[break]*/cmpr_set(l,data,72,5,5))||/*[return]*/cmpr_set(l,data,77,6,6))||/*[continue]*/cmpr_set(l,data,39,8,8))||/*[loop]*/cmpr_set(l,data,63,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[==]*/cmpr_set(l,data,7,2,2))||dt_bcea2102060eab13(l,data))||/*[true]*/cmpr_set(l,data,95,4,4))||/*[null]*/cmpr_set(l,data,35,4,4))||dt_6ae31dd85a62ef5c(l,data))||assert_ascii(l,0x0,0x194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
                pushFN(data,branch_c3b494f09f364853);
                return branch_4333f87cdb989db7(l,data,state,prod,128);
            }
        }
    }
    return -1;
    /*87acff1332a9df2737b65de6b927fcf5*/
}
function branch_88be945da9cb3ed2(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*13:40 function=>fn identifier : type ( ) { • expression_statements }*/
    puid |=512;
    pushFN(data,branch_8f153077c98cfb12);
    pushFN(data,$expression_statements);
    return puid;
    return -1;
    /*88be945da9cb3ed2789566c5efbc82af*/
}
function branch_8a57482f2f0b103f(l,data,state,prod,puid){
    /*[76]*/
    return prod;
    /*8a57482f2f0b103fb27cf8088eebec4d*/
}
function branch_8ada6b34c1f213b0(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,branch_7eb1981bd29a0a82);
    return 43;
    /*8ada6b34c1f213b017c1f6bee62c3d68*/
}
function branch_8b26069ce7eab8c5(l,data,state,prod,puid){
    add_reduce(state,data,4,74);
    /*[43]*/
    pushFN(data,$expression_statements_group_023_108_goto);
    return 18;
    /*8b26069ce7eab8c58cc0394c703f0309*/
}
function branch_8b63b777dc5bd4aa(l,data,state,prod,puid){
    add_reduce(state,data,1,3);
    /*[32]*/
    pushFN(data,$match_expression_HC_listbody3_113_goto);
    return 32;
    /*8b63b777dc5bd4aa78b973b385aa26f3*/
}
function branch_8c2f1a4f40eaeb66(l,data,state,prod,puid){
    add_reduce(state,data,1,3);
    /*[20]*/
    pushFN(data,$expression_statements_goto);
    return 20;
    /*8c2f1a4f40eaeb660c13ac2bc5051f2a*/
}
function branch_8c4716e79a4b9ed6(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*66:201 modifier=>• export*/
    puid |=4;
    consume(l,data,state);
    /*[66]*/
    return prod;
    return -1;
    /*8c4716e79a4b9ed64be9d4f462eddc64*/
}
function branch_8ca9437796b31cbf(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,branch_7eb1981bd29a0a82);
    return 16;
    /*8ca9437796b31cbfc23ea75ebdda77d2*/
}
function branch_8d651696aa703a04(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*77:232 def$hex_digit=>• τb*/
    puid |=4;
    consume(l,data,state);
    /*[77]*/
    return prod;
    return -1;
    /*8d651696aa703a04a93acd6f169f870f*/
}
function branch_8d7d93db08459d1a(l,data,state,prod,puid){
    /*[119]*/
    return prod;
    /*8d7d93db08459d1ab1bd2451fbbd3f1e*/
}
function branch_8d8962ad46c1a268(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*30:94 loop_expression_HC_listbody6_112=>loop_expression_HC_listbody6_112 • , expression*/
    puid |=2;
    consume(l,data,state);
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=4;
    pushFN(data,branch_ded6e101b197b126);
    pushFN(data,$expression);
    return puid;
    return -1;
    /*8d8962ad46c1a26826bf34e517e5b19a*/
}
function branch_8de46b48db2ae3fb(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$module_goto);
    return 3;
    /*8de46b48db2ae3fbaa99caa2a9860fab*/
}
function branch_8e080789bfc9483b(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    /*60:178 string=>• " string_HC_listbody1_126 "*/
    puid |=1;
    consume(l,data,state);
    skip_db1786a8af54d666(l/*[ 71 ]*/,data,state);
    puid |=2;
    pushFN(data,branch_5289262b0f51b588);
    pushFN(data,$string_HC_listbody1_126);
    return puid;
    return -1;
    /*8e080789bfc9483b2b0c25c33a87ced1*/
}
function branch_8f153077c98cfb12(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=1024;
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,9,24);
        /*[13]*/
        return prod;
    }
    return -1;
    /*8f153077c98cfb122ea1219984bfa0be*/
}
function branch_8fde9a40ce864be3(l,data,state,prod,puid){
    pushFN(data,$def$identifier_symbols_goto);
    return 107;
    /*8fde9a40ce864be3bb2a2c38489c0e61*/
}
function branch_8ffb637978bca250(l,data,state,prod,puid){
    /*11:25 class=>cls identifier class_group_113_103 • { class_HC_listbody1_105 }
    11:29 class=>cls identifier class_group_113_103 • { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==123/*[{]*/){
        consume(l,data,state);
        puid |=16;
        /*11:25 class=>cls identifier class_group_113_103 { • class_HC_listbody1_105 }
        11:29 class=>cls identifier class_group_113_103 { • }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.current_byte==125/*[}]*/){
            pushFN(data,branch_7dcd4e56969f4413);
            return branch_c0b1a9a514dfb29e(l,data,state,prod,16);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if(((/*[str]*/cmpr_set(l,data,47,3,3)||/*[fn]*/cmpr_set(l,data,144,2,2))||assert_ascii(l,0x0,0x10,0x88000000,0x0))||l.isUniID(data)){
            pushFN(data,branch_7dcd4e56969f4413);
            return branch_cbce39a7fc1f6e7e(l,data,state,prod,16);
        }
    }
    return -1;
    /*8ffb637978bca250bedb1f4191af90fa*/
}
function branch_90b0fe29fbf02159(l,data,state,prod,puid){
    /*120:339 virtual-117:1:1|--lvl:2=>•
    121:340 virtual-126:4:1|--lvl:2=>• : type primitive_declaration_group_169_116
    122:341 virtual-128:3:1|--lvl:2=>• : type*/
    switch(sym_map_9fff07fe93fb5f87(l,data)){
        case 0:
            /*121:340 virtual-126:4:1|--lvl:2=>• : type primitive_declaration_group_169_116
            122:341 virtual-128:3:1|--lvl:2=>• : type*/
            var pk = l.copy();
            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,0);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if(((((/*[uint]*/cmpr_set(pk,data,83,4,4)||/*[int]*/cmpr_set(pk,data,84,3,3))||/*[flt]*/cmpr_set(pk,data,125,3,3))||dt_1e3f2d5b696b270e(pk,data))||assert_ascii(pk,0x0,0x10,0x80000000,0x200240))||pk.isUniID(data)){
                /*121:340 virtual-126:4:1|--lvl:2=>• : type primitive_declaration_group_169_116
                122:341 virtual-128:3:1|--lvl:2=>• : type*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l,data,state);
                puid |=4;
                /*121:340 virtual-126:4:1|--lvl:2=>: • type primitive_declaration_group_169_116
                122:341 virtual-128:3:1|--lvl:2=>: • type*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                pushFN(data,branch_5194f5fa10f99f55);
                pushFN(data,$type);
                puid |=8;
                return puid;
            }
        default:
        case 1:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*120:339 virtual-117:1:1|--lvl:2=>•*/
            /*[120]*/
            pushFN(data,branch_7eb1981bd29a0a82);
            return 37;
    }
    return -1;
    /*90b0fe29fbf021593f1e3161e8147672*/
}
function branch_91221d68990b2da2(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*52:152 type_group_091_122=>• 128*/
    puid |=16;
    consume(l,data,state);
    /*[52]*/
    return prod;
    return -1;
    /*91221d68990b2da216ed69674adcc633*/
}
function branch_9199c6e5ff3d6206(l,data,state,prod,puid){
    add_reduce(state,data,6,59);
    /*[31]*/
    return prod;
    /*9199c6e5ff3d620693405dc328ffa860*/
}
function branch_91c75c4b2b49defd(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=64;
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,6,10);
        /*[11]*/
        return prod;
    }
    return -1;
    /*91c75c4b2b49defd299a67aa13c4d5bd*/
}
function branch_91f6e30711bde8c4(l,data,state,prod,puid){
    /*[62]*/
    return prod;
    /*91f6e30711bde8c4ece8d4133dad12a8*/
}
function branch_9207737c4c22fa32(l,data,state,prod,puid){
    add_reduce(state,data,3,65);
    /*[37]*/
    /*-------------INDIRECT-------------------*/
    pushFN(data,$expression_statements_group_023_108_goto);
    return 37;
    /*9207737c4c22fa325eb28085c3987e81*/
}
function branch_9238e068c5f9ea12(l,data,state,prod,puid){
    add_reduce(state,data,3,36);
    /*[15]*/
    /*-------------INDIRECT-------------------*/
    pushFN(data,$parameters_HC_listbody10_106_goto);
    return 15;
    /*9238e068c5f9ea12fe216bbf0c96402f*/
}
function branch_926c368886c7cc2d(l,data,state,prod,puid){
    add_reduce(state,data,1,3);
    /*[35]*/
    pushFN(data,$call_expression_HC_listbody2_114_goto);
    return 35;
    /*926c368886c7cc2d6129b8fd3bf2a4b1*/
}
function branch_9273f06644cfc323(l,data,state,prod,puid){
    /*43:125 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_169_116
    43:127 primitive_declaration=>modifier_list identifier : type •*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        pushFN(data,branch_eca1b2fa9939e9a9);
        return branch_4db7765786d1a76d(l,data,state,prod,8);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*43:127 primitive_declaration=>modifier_list identifier : type •*/
        add_reduce(state,data,4,75);
        /*[43]*/
        /*-------------INDIRECT-------------------*/
        pushFN(data,$statements_goto);
        return 43;
    }
    return -1;
    /*9273f06644cfc323efd451143a6190ea*/
}
function branch_934a35c8dc8a8ebf(l,data,state,prod,puid){
    /*84:251 def$scientific_token=>def$float_token • def$scientific_token_group_228_102
    84:252 def$scientific_token=>def$float_token •*/
    skip_a294e41529bc9275(l/*[ nl ][ 71 ]*/,data,state);
    switch(sym_map_937c28530cf66b31(l,data)){
        case 0:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*84:251 def$scientific_token=>def$float_token • def$scientific_token_group_228_102*/
            puid |=2;
            pushFN(data,branch_7aa32f5c9ec33c40);
            pushFN(data,$def$scientific_token_group_228_102);
            return puid;
        default:
        case 1:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*84:252 def$scientific_token=>def$float_token •*/
            /*[84]*/
            return 84;
    }
    return -1;
    /*934a35c8dc8a8ebf025ca807990e5f66*/
}
function branch_935fd6d169e716cd(l,data,state,prod,puid){
    /*14:44 function_expression=>modifier_list fn : type ( parameters • ) { expression_statements }
    14:47 function_expression=>modifier_list fn : type ( parameters • ) { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==41/*[)]*/){
        consume(l,data,state);
        puid |=64;
        /*14:44 function_expression=>modifier_list fn : type ( parameters ) • { expression_statements }
        14:47 function_expression=>modifier_list fn : type ( parameters ) • { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if(l.current_byte==123/*[{]*/){
            consume(l,data,state);
            puid |=128;
            /*14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }
            14:47 function_expression=>modifier_list fn : type ( parameters ) { • }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if(l.current_byte==125/*[}]*/){
                pushFN(data,branch_c3b494f09f364853);
                return branch_44d39e4d2e186b48(l,data,state,prod,128);
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if(((((((((((((((/*[if]*/cmpr_set(l,data,143,2,2)||/*[match]*/cmpr_set(l,data,67,5,5))||/*[break]*/cmpr_set(l,data,72,5,5))||/*[return]*/cmpr_set(l,data,77,6,6))||/*[continue]*/cmpr_set(l,data,39,8,8))||/*[loop]*/cmpr_set(l,data,63,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[==]*/cmpr_set(l,data,7,2,2))||dt_bcea2102060eab13(l,data))||/*[true]*/cmpr_set(l,data,95,4,4))||/*[null]*/cmpr_set(l,data,35,4,4))||dt_6ae31dd85a62ef5c(l,data))||assert_ascii(l,0x0,0x194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
                pushFN(data,branch_c3b494f09f364853);
                return branch_60927a7f49a5a57b(l,data,state,prod,128);
            }
        }
    }
    return -1;
    /*935fd6d169e716cd9ba767266dcd6b41*/
}
function branch_9360f80350dce697(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=4;
    if((l.current_byte==39/*[']*/)&&consume(l,data,state)){
        add_reduce(state,data,3,37);
        /*[97]*/
        return prod;
    }
    return -1;
    /*9360f80350dce6979ba299c4a118b9b9*/
}
function branch_938885233cf99faa(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*77:239 def$hex_digit=>• τC*/
    puid |=512;
    consume(l,data,state);
    /*[77]*/
    return prod;
    return -1;
    /*938885233cf99faaeb8b8b0c19d1860b*/
}
function branch_93995390a0daada0(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*35:111 call_expression_HC_listbody2_114=>call_expression_HC_listbody2_114 • , expression*/
    puid |=2;
    consume(l,data,state);
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=4;
    pushFN(data,branch_314cbbc9412fc117);
    pushFN(data,$expression);
    return puid;
    return -1;
    /*93995390a0daada01f2d00ed622416e2*/
}
function branch_93e110ed574c987e(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$def$hex_token_HC_listbody1_105_goto);
    return 88;
    /*93e110ed574c987ecf9ef13507524cab*/
}
function branch_9429112a783f1f03(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=4;
    if((l.current_byte==93/*[]]*/)&&consume(l,data,state)){
        add_reduce(state,data,3,37);
        /*[50]*/
        return 50;
    }
    return -1;
    /*9429112a783f1f032d7c3ac23e4bbb68*/
}
function branch_945d145bb77360a1(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*31:104 loop_expression=>loop ( parameters ; ; • ) expression*/
    puid |=128;
    consume(l,data,state);
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=4;
    pushFN(data,branch_ecc42e37bd51afdc);
    pushFN(data,$expression);
    return puid;
    return -1;
    /*945d145bb77360a10fe6e65cf748ced9*/
}
function branch_948deab801c790fb(l,data,state,prod,puid){
    add_reduce(state,data,2,70);
    /*[40]*/
    return 40;
    /*948deab801c790fb5e3b14aff5f2f25f*/
}
function branch_94c3f837681a6d57(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*27:87 unary_value=>• function_expression*/
    puid |=4;
    pushFN(data,branch_983cfa18d3366990);
    pushFN(data,$function_expression);
    return puid;
    return -1;
    /*94c3f837681a6d572a7df0ad0577620e*/
}
function branch_94fd660a5f5694c4(l,data,state,prod,puid){
    return 56;
    /*94fd660a5f5694c48043661f5e87a341*/
}
function branch_953325efa0d36ff1(l,data,state,prod,puid){
    return 65;
    /*953325efa0d36ff1cf52b091a40d0fde*/
}
function branch_9617773e93a87e23(l,data,state,prod,puid){
    add_reduce(state,data,3,65);
    /*[37]*/
    /*-------------INDIRECT-------------------*/
    pushFN(data,$expression_statements_goto);
    return 37;
    /*9617773e93a87e23d5d7d9a52e10a999*/
}
function branch_964751f46347f460(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*13:37 function=>fn identifier : type ( parameters ) { • expression_statements }*/
    puid |=512;
    pushFN(data,branch_9c8c7fe06014f37d);
    pushFN(data,$expression_statements);
    return puid;
    return -1;
    /*964751f46347f460cfc01309fd75aa14*/
}
function branch_965da54cfd0e44a2(l,data,state,prod,puid){
    /*31:99 loop_expression=>loop ( ; expression • ; loop_expression_HC_listbody6_112 ) expression
    31:103 loop_expression=>loop ( ; expression • ; ) expression*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==59/*[;]*/){
        consume(l,data,state);
        puid |=32;
        /*31:99 loop_expression=>loop ( ; expression ; • loop_expression_HC_listbody6_112 ) expression
        31:103 loop_expression=>loop ( ; expression ; • ) expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.current_byte==41/*[)]*/){
            pushFN(data,branch_5814d05b2ded1273);
            return branch_ec09ac0061673a0c(l,data,state,prod,32);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if(((((((((((((((/*[if]*/cmpr_set(l,data,143,2,2)||/*[match]*/cmpr_set(l,data,67,5,5))||/*[break]*/cmpr_set(l,data,72,5,5))||/*[return]*/cmpr_set(l,data,77,6,6))||/*[continue]*/cmpr_set(l,data,39,8,8))||/*[loop]*/cmpr_set(l,data,63,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[==]*/cmpr_set(l,data,7,2,2))||dt_bcea2102060eab13(l,data))||/*[true]*/cmpr_set(l,data,95,4,4))||/*[null]*/cmpr_set(l,data,35,4,4))||dt_6ae31dd85a62ef5c(l,data))||assert_ascii(l,0x0,0x194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
            pushFN(data,branch_5814d05b2ded1273);
            return branch_af600368dc94937c(l,data,state,prod,32);
        }
    }
    return -1;
    /*965da54cfd0e44a201343fbbb8f46847*/
}
function branch_96d52134ce3831f4(l,data,state,prod,puid){
    /*115:334 virtual-328:8:1|--lvl:1=>parameters ; expression • ; loop_expression_HC_listbody6_112 ) expression
    117:336 virtual-330:7:1|--lvl:1=>parameters ; expression • ; ) expression*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==59/*[;]*/){
        consume(l,data,state);
        puid |=32;
        /*115:334 virtual-328:8:1|--lvl:1=>parameters ; expression ; • loop_expression_HC_listbody6_112 ) expression
        117:336 virtual-330:7:1|--lvl:1=>parameters ; expression ; • ) expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.current_byte==41/*[)]*/){
            pushFN(data,branch_4a236324dddf6f01);
            return branch_f49a61a0b0ce7aab(l,data,state,prod,32);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if(((((((((((((((/*[if]*/cmpr_set(l,data,143,2,2)||/*[match]*/cmpr_set(l,data,67,5,5))||/*[break]*/cmpr_set(l,data,72,5,5))||/*[return]*/cmpr_set(l,data,77,6,6))||/*[continue]*/cmpr_set(l,data,39,8,8))||/*[loop]*/cmpr_set(l,data,63,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[==]*/cmpr_set(l,data,7,2,2))||dt_bcea2102060eab13(l,data))||/*[true]*/cmpr_set(l,data,95,4,4))||/*[null]*/cmpr_set(l,data,35,4,4))||dt_6ae31dd85a62ef5c(l,data))||assert_ascii(l,0x0,0x194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
            pushFN(data,branch_4a236324dddf6f01);
            return branch_28cb46e37bbb9f8c(l,data,state,prod,32);
        }
    }
    return -1;
    /*96d52134ce3831f423c8a394f8146a41*/
}
function branch_97595c541a25c591(l,data,state,prod,puid){
    return 54;
    /*97595c541a25c591101437e76a669f2d*/
}
function branch_979319b0c549d0c7(l,data,state,prod,puid){
    /*109:328 virtual-97:9:1|--lvl:0=>( parameters ; expression • ; loop_expression_HC_listbody6_112 ) expression
    111:330 virtual-101:8:1|--lvl:0=>( parameters ; expression • ; ) expression*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==59/*[;]*/){
        consume(l,data,state);
        puid |=32;
        /*109:328 virtual-97:9:1|--lvl:0=>( parameters ; expression ; • loop_expression_HC_listbody6_112 ) expression
        111:330 virtual-101:8:1|--lvl:0=>( parameters ; expression ; • ) expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.current_byte==41/*[)]*/){
            pushFN(data,branch_3205c0ded576131e);
            return branch_ef126c2dad667aa6(l,data,state,prod,32);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if(((((((((((((((/*[if]*/cmpr_set(l,data,143,2,2)||/*[match]*/cmpr_set(l,data,67,5,5))||/*[break]*/cmpr_set(l,data,72,5,5))||/*[return]*/cmpr_set(l,data,77,6,6))||/*[continue]*/cmpr_set(l,data,39,8,8))||/*[loop]*/cmpr_set(l,data,63,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[==]*/cmpr_set(l,data,7,2,2))||dt_bcea2102060eab13(l,data))||/*[true]*/cmpr_set(l,data,95,4,4))||/*[null]*/cmpr_set(l,data,35,4,4))||dt_6ae31dd85a62ef5c(l,data))||assert_ascii(l,0x0,0x194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
            pushFN(data,branch_3205c0ded576131e);
            return branch_53a1020719a7db2e(l,data,state,prod,32);
        }
    }
    return -1;
    /*979319b0c549d0c725371debbcd37cdf*/
}
function branch_97946dd38e34dd15(l,data,state,prod,puid){
    pushFN(data,$expression_statements_goto);
    return 44;
    /*97946dd38e34dd15fca388ad27f0753f*/
}
function branch_983cfa18d3366990(l,data,state,prod,puid){
    /*[27]*/
    return prod;
    /*983cfa18d3366990df86ad41b4461ec4*/
}
function branch_985fde960bcf25f5(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*4:7 statements=>• class*/
    puid |=2;
    pushFN(data,branch_cbc9ddb32c7cd341);
    pushFN(data,$class);
    return puid;
    return -1;
    /*985fde960bcf25f5f4fc8b5365d19539*/
}
function branch_98aa00dc12a9cf26(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=1024;
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,3,40);
        /*[21]*/
        return prod;
    }
    return -1;
    /*98aa00dc12a9cf26e9c858be5f29adbe*/
}
function branch_98da65c52e9c8411(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=128;
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        puid |=4;
        pushFN(data,branch_49a46d9fb3405fea);
        pushFN(data,$expression);
        return puid;
    }
    return -1;
    /*98da65c52e9c84116d880309c245f685*/
}
function branch_98dd98f800e8c1de(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*100:298 def$string_value_group_071_112=>• θsym*/
    puid |=4;
    consume(l,data,state);
    /*[100]*/
    return prod;
    return -1;
    /*98dd98f800e8c1de2d3541e49edc25bc*/
}
function branch_995577f63a2dac51(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$namespace_HC_listbody3_102_goto);
    return 6;
    /*995577f63a2dac51758fd4f85acbc5bc*/
}
function branch_99be3d4f8d888fcc(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    /*65:193 operator=>• θsym identifier_token_group_079_119*/
    puid |=1;
    consume(l,data,state);
    skip_db1786a8af54d666(l/*[ 71 ]*/,data,state);
    puid |=4;
    pushFN(data,branch_c02239ccf58d6599);
    pushFN(data,$identifier_token_group_079_119);
    return puid;
    return -1;
    /*99be3d4f8d888fccd5f783c0f5067798*/
}
function branch_9a8b6249e01fc24c(l,data,state,prod,puid){
    /*108:327 virtual-137:3:1|--lvl:0=>• identifier_token_HC_listbody1_118 identifier_token_group_079_119
    109:328 virtual-139:2:1|--lvl:0=>• identifier_token_HC_listbody1_118*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
        /*108:327 virtual-137:3:1|--lvl:0=>• identifier_token_HC_listbody1_118 identifier_token_group_079_119
        109:328 virtual-139:2:1|--lvl:0=>• identifier_token_HC_listbody1_118*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_468359d7834577f1);
        pushFN(data,$identifier_token_HC_listbody1_118);
        puid |=2;
        return puid;
    }
    return -1;
    /*9a8b6249e01fc24c97bd0390c61c4067*/
}
function branch_9afa4e6850eb2793(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*12:33 struct=>str identifier { • parameters }*/
    puid |=16;
    pushFN(data,branch_c7fe8d3a67ebf157);
    pushFN(data,$parameters);
    return puid;
    return -1;
    /*9afa4e6850eb279332d1a950fa12a4dd*/
}
function branch_9b1c689c57e42d57(l,data,state,prod,puid){
    add_reduce(state,data,3,50);
    /*[31]*/
    /*9b1c689c57e42d5700f54236e54cda1d*/
}
function branch_9b7fc969504a1509(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    /*71:215 comment=>• /* * /*/
    puid |=1;
    consume(l,data,state);
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=4;
    if(/*[asterisk/]*/cmpr_set(l,data,18,2,2)&&consume(l,data,state)){
        add_reduce(state,data,2,0);
        /*[71]*/
        return prod;
    }
    return -1;
    /*9b7fc969504a15097e8b7a1118299fcb*/
}
function branch_9c5c4ae7d3431d14(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    /*11:31 class=>cls identifier • { }*/
    puid |=16;
    consume(l,data,state);
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=64;
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,4,15);
        /*[11]*/
        return prod;
    }
    return -1;
    /*9c5c4ae7d3431d14bf6c8c267372ab49*/
}
function branch_9c8c7fe06014f37d(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=1024;
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,10,21);
        /*[13]*/
        return prod;
    }
    return -1;
    /*9c8c7fe06014f37d7113fbf58d4c737d*/
}
function branch_9ccf045621edc1f2(l,data,state,prod,puid){
    add_reduce(state,data,3,65);
    /*[37]*/
    /*-------------INDIRECT-------------------*/
    pushFN(data,$unary_value_goto);
    return 37;
    /*9ccf045621edc1f2eac403dddb929be2*/
}
function branch_9d20a12beef95619(l,data,state,prod,puid){
    add_reduce(state,data,3,62);
    /*[34]*/
    return 34;
    /*9d20a12beef956193c93fea8b19589d2*/
}
function branch_9d2b22f60d0d79bb(l,data,state,prod,puid){
    add_reduce(state,data,1,3);
    /*[95]*/
    pushFN(data,$def$octal_token_HC_listbody1_110_goto);
    return 95;
    /*9d2b22f60d0d79bbceec6212c7566642*/
}
function branch_9d3cbdbdbb29c84a(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*87:257 def$hex_token_group_044_104=>• a*/
    puid |=2;
    consume(l,data,state);
    /*[87]*/
    return prod;
    return -1;
    /*9d3cbdbdbb29c84a4c1b1bfa54d3e501*/
}
function branch_9dd97da06b20e5c9(l,data,state,prod,puid){
    /*43:125 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_169_116
    43:127 primitive_declaration=>modifier_list identifier : type •*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        pushFN(data,branch_cbc044c8c9b81bf7);
        return branch_4db7765786d1a76d(l,data,state,prod,8);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*43:127 primitive_declaration=>modifier_list identifier : type •*/
        add_reduce(state,data,4,75);
        /*[43]*/
        /*-------------INDIRECT-------------------*/
        return 9;
    }
    return -1;
    /*9dd97da06b20e5c90ba109bd89320b0e*/
}
function branch_9e7659f116d67506(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*83:250 def$scientific_token_group_228_102=>def$scientific_token_group_027_101 • θnum*/
    puid |=4;
    consume(l,data,state);
    add_reduce(state,data,2,0);
    /*[83]*/
    return prod;
    return -1;
    /*9e7659f116d6750678500ddff3f2d91b*/
}
function branch_9ebcaffd71102f54(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$match_expression_HC_listbody3_113_goto);
    return 32;
    /*9ebcaffd71102f54f17757ddc0c53252*/
}
function branch_9f0a04323a32a77b(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$parameters_goto);
    return 16;
    /*9f0a04323a32a77b22c0c86d4982d704*/
}
function branch_9f1bb30dc3bbc3b6(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*105:315 def$js_id_symbols=>• _*/
    puid |=4;
    consume(l,data,state);
    /*[105]*/
    return prod;
    return -1;
    /*9f1bb30dc3bbc3b6f83a54195d214811*/
}
function branch_a0647a95e40570a9(l,data,state,prod,puid){
    /*110:329 virtual-137:3:1|--lvl:0=>• identifier_token_HC_listbody1_118 identifier_token_group_079_119
    111:330 virtual-139:2:1|--lvl:0=>• identifier_token_HC_listbody1_118*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/)){
        /*110:329 virtual-137:3:1|--lvl:0=>• identifier_token_HC_listbody1_118 identifier_token_group_079_119
        111:330 virtual-139:2:1|--lvl:0=>• identifier_token_HC_listbody1_118*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_63f171bf36492849);
        pushFN(data,$identifier_token_HC_listbody1_118);
        puid |=7;
        return puid;
    }
    return -1;
    /*a0647a95e40570a9812af7af0bc60b99*/
}
function branch_a146d1d770af3dab(l,data,state,prod,puid){
    /*[117]*/
    return prod;
    /*a146d1d770af3dabce9e958b346bf4bd*/
}
function branch_a159faaa8b4d52a5(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$string_HC_listbody1_127_goto);
    return 59;
    /*a159faaa8b4d52a5478f896a87ee8035*/
}
function branch_a25481eaf4ab00c4(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    /*71:213 comment=>• /* comment_HC_listbody1_131 * /*/
    puid |=1;
    consume(l,data,state);
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=2;
    pushFN(data,branch_aded7d5f4449f343);
    pushFN(data,$comment_HC_listbody1_131);
    return puid;
    return -1;
    /*a25481eaf4ab00c45e9d30108f07350c*/
}
function branch_a27fcfa33dc4a021(l,data,state,prod,puid){
    add_reduce(state,data,1,3);
    /*[10]*/
    pushFN(data,$class_HC_listbody1_105_goto);
    return 10;
    /*a27fcfa33dc4a021d22ebf898f8ef918*/
}
function branch_a31682fadf547063(l,data,state,prod,puid){
    /*25:80 binary_expression=>unary_expression • operator
    25:81 binary_expression=>unary_expression • operator expression
    25:82 binary_expression=>unary_expression •*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    if(sym_map_e58af9c6fd146069(l,data)==1){
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*25:82 binary_expression=>unary_expression •*/
        /*[25]*/
        return 25;
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(/*[==]*/cmpr_set(l,data,7,2,2)||l.isSym(true,data)){
        /*25:80 binary_expression=>unary_expression • operator
        25:81 binary_expression=>unary_expression • operator expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_aac0448efa3326e8);
        pushFN(data,$operator);
        puid |=2;
        return puid;
    }
    return -1;
    /*a31682fadf547063dadd80cbee66e183*/
}
function branch_a3260e1db671c1f2(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*65:191 operator=>θsym operator_HC_listbody1_128 • identifier_token_group_079_119*/
    puid |=4;
    pushFN(data,branch_37379fecdf80f257);
    pushFN(data,$identifier_token_group_079_119);
    return puid;
    return -1;
    /*a3260e1db671c1f2d068c9a35f9e95d0*/
}
function branch_a36d02a55137bb00(l,data,state,prod,puid){
    add_reduce(state,data,2,2);
    /*[2]*/
    /*-------------INDIRECT-------------------*/
    pushFN(data,$module_HC_listbody1_101_goto);
    return 2;
    /*a36d02a55137bb007d27bf5eeffd2d91*/
}
function branch_a3c705480549ad3d(l,data,state,prod,puid){
    /*43:126 primitive_declaration=>identifier : type • primitive_declaration_group_169_116
    43:128 primitive_declaration=>identifier : type •*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        pushFN(data,branch_8ada6b34c1f213b0);
        return branch_5ebfbb554475da4a(l,data,state,prod,8);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*43:128 primitive_declaration=>identifier : type •*/
        add_reduce(state,data,3,76);
        /*[43]*/
        /*-------------INDIRECT-------------------*/
        pushFN(data,branch_7eb1981bd29a0a82);
        return 43;
    }
    return -1;
    /*a3c705480549ad3d641baa2874e1bd9b*/
}
function branch_a3f83ce8a766bcd6(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*76:226 def$defaultproduction=>• def$binary*/
    puid |=4;
    pushFN(data,branch_8a57482f2f0b103f);
    pushFN(data,$def$binary);
    return puid;
    return -1;
    /*a3f83ce8a766bcd6923e2b8fcc6bf85d*/
}
function branch_a4110c873d7d06d7(l,data,state,prod,puid){
    add_reduce(state,data,1,78);
    /*[55]*/
    return 55;
    /*a4110c873d7d06d74b952c523a918367*/
}
function branch_a4af532373357db3(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*77:235 def$hex_digit=>• τe*/
    puid |=32;
    consume(l,data,state);
    /*[77]*/
    return prod;
    return -1;
    /*a4af532373357db3735db2c3c4463786*/
}
function branch_a517d1aa452b9992(l,data,state,prod,puid){
    /*[1]*/
    return 1;
    /*a517d1aa452b9992f3aba651a202bf2e*/
}
function branch_a519c87d3f7d1f9c(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=128;
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        puid |=4;
        pushFN(data,branch_82f1db0813af9681);
        pushFN(data,$expression);
        return puid;
    }
    return -1;
    /*a519c87d3f7d1f9c595da044e5839682*/
}
function branch_a51e8785cfab81f2(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=64;
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,6,9);
        /*[11]*/
        return prod;
    }
    return -1;
    /*a51e8785cfab81f251b06cdcca3a92e0*/
}
function branch_a591f94caaeda968(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*97:290 def$string=>• " def$string_token "*/
    puid |=1;
    consume(l,data,state);
    skip_a294e41529bc9275(l/*[ nl ][ 71 ]*/,data,state);
    puid |=2;
    pushFN(data,branch_d50793919de0bb4d);
    pushFN(data,$def$string_token);
    return puid;
    return -1;
    /*a591f94caaeda968e2a1cf73029dc12b*/
}
function branch_a5b0f86d1e8799e7(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*65:192 operator=>== operator_HC_listbody1_129 • identifier_token_group_079_119*/
    puid |=4;
    pushFN(data,branch_37379fecdf80f257);
    pushFN(data,$identifier_token_group_079_119);
    return puid;
    return -1;
    /*a5b0f86d1e8799e7d1362969cae93cda*/
}
function branch_a62d2891a3e60f0d(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*77:234 def$hex_digit=>• τd*/
    puid |=16;
    consume(l,data,state);
    /*[77]*/
    return prod;
    return -1;
    /*a62d2891a3e60f0d940e300f9bae00c8*/
}
function branch_a6ed7b43c3e39170(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
    /*17:56 expression_statements_HC_listbody1_107=>expression_statements_HC_listbody1_107 • ;*/
    puid |=2;
    consume(l,data,state);
    add_reduce(state,data,2,2);
    /*[17]*/
    return prod;
    return -1;
    /*a6ed7b43c3e391705660778521edcf0c*/
}
function branch_a95176c7bfbb8a2d(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*109:328 virtual-126:4:1|--lvl:0=>: type • primitive_declaration_group_169_116*/
    puid |=16;
    pushFN(data,branch_10fdc71a0d85872b);
    pushFN(data,$primitive_declaration_group_169_116);
    return puid;
    return -1;
    /*a95176c7bfbb8a2d7f3870ed6d60b6fc*/
}
function branch_a9833e98e62f92d8(l,data,state,prod,puid){
    /*43:125 primitive_declaration=>modifier_list identifier • : type primitive_declaration_group_169_116
    43:127 primitive_declaration=>modifier_list identifier • : type*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==58/*[:]*/){
        consume(l,data,state);
        puid |=4;
        /*43:125 primitive_declaration=>modifier_list identifier : • type primitive_declaration_group_169_116
        43:127 primitive_declaration=>modifier_list identifier : • type*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_d2e97e3141477434);
        pushFN(data,$type);
        puid |=8;
        return puid;
    }
    return -1;
    /*a9833e98e62f92d87c64161246f50196*/
}
function branch_aa5f420c0dbdad59(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*108:327 virtual-126:4:1|--lvl:0=>: type • primitive_declaration_group_169_116*/
    puid |=16;
    pushFN(data,branch_dca1b9a3dd99b59c);
    pushFN(data,$primitive_declaration_group_169_116);
    return puid;
    return -1;
    /*aa5f420c0dbdad59993a6c6f956bd0d9*/
}
function branch_aa7c4f75ff727919(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*101:304 def$string_value_group_172_113=>• θws*/
    puid |=8;
    consume(l,data,state);
    /*[101]*/
    return prod;
    return -1;
    /*aa7c4f75ff72791966b989fe1619bfcd*/
}
function branch_aaa43733a017e186(l,data,state,prod,puid){
    /*14:44 function_expression=>modifier_list fn : type • ( parameters ) { expression_statements }
    14:46 function_expression=>modifier_list fn : type • ( ) { expression_statements }
    14:47 function_expression=>modifier_list fn : type • ( parameters ) { }
    14:50 function_expression=>modifier_list fn : type • ( ) { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==40/*[(]*/){
        consume(l,data,state);
        puid |=16;
        /*14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
        14:47 function_expression=>modifier_list fn : type ( • parameters ) { }
        14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
        14:50 function_expression=>modifier_list fn : type ( • ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(l.current_byte==41/*[)]*/){
            /*14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
            14:50 function_expression=>modifier_list fn : type ( • ) { }*/
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            puid |=64;
            /*14:46 function_expression=>modifier_list fn : type ( ) • { expression_statements }
            14:50 function_expression=>modifier_list fn : type ( ) • { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if(l.current_byte==123/*[{]*/){
                consume(l,data,state);
                puid |=128;
                /*14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }
                14:50 function_expression=>modifier_list fn : type ( ) { • }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if(l.current_byte==125/*[}]*/){
                    pushFN(data,branch_74c8218421c7bef8);
                    return branch_4f452b9fa5813076(l,data,state,prod,128);
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if(((((((((((((((/*[if]*/cmpr_set(l,data,143,2,2)||/*[match]*/cmpr_set(l,data,67,5,5))||/*[break]*/cmpr_set(l,data,72,5,5))||/*[return]*/cmpr_set(l,data,77,6,6))||/*[continue]*/cmpr_set(l,data,39,8,8))||/*[loop]*/cmpr_set(l,data,63,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[==]*/cmpr_set(l,data,7,2,2))||dt_bcea2102060eab13(l,data))||/*[true]*/cmpr_set(l,data,95,4,4))||/*[null]*/cmpr_set(l,data,35,4,4))||dt_6ae31dd85a62ef5c(l,data))||assert_ascii(l,0x0,0x194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
                    pushFN(data,branch_74c8218421c7bef8);
                    return branch_3265a14e2ed4539a(l,data,state,prod,128);
                }
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if(assert_ascii(l,0x0,0x10,0x88000000,0x0)||l.isUniID(data)){
            /*14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
            14:47 function_expression=>modifier_list fn : type ( • parameters ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            pushFN(data,branch_218771f40836dff0);
            pushFN(data,$parameters);
            puid |=32;
            return puid;
        }
    }
    return -1;
    /*aaa43733a017e18635825db2bddea5f8*/
}
function branch_aac0448efa3326e8(l,data,state,prod,puid){
    /*25:80 binary_expression=>unary_expression operator •
    25:81 binary_expression=>unary_expression operator • expression*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    switch(sym_map_174451ba753fe315(l,data)){
        default:
        case 0:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*25:80 binary_expression=>unary_expression operator •*/
            add_reduce(state,data,2,46);
            /*[25]*/
            return 25;
        case 1:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*25:81 binary_expression=>unary_expression operator • expression*/
            puid |=4;
            pushFN(data,branch_d177746be1ee355c);
            pushFN(data,$expression);
            return puid;
        case 2:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
            /*25:81 binary_expression=>unary_expression operator • expression*/
            puid |=4;
            pushFN(data,branch_d177746be1ee355c);
            pushFN(data,$expression);
            return puid;
    }
    return -1;
    /*aac0448efa3326e8b4c4b2bd3f8b2af9*/
}
function branch_ac8c29e43821baf7(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*86:254 def$float_token=>θnum • def$float_token_group_130_103*/
    puid |=2;
    pushFN(data,branch_ec11fc60d4fcc2e0);
    pushFN(data,$def$float_token_group_130_103);
    return puid;
    return -1;
    /*ac8c29e43821baf79571ca234cffa3d7*/
}
function branch_ac98dd9c4e5d1a20(l,data,state,prod,puid){
    add_reduce(state,data,3,43);
    /*[22]*/
    return 22;
    /*ac98dd9c4e5d1a209fd4a0a1322e5edd*/
}
function branch_ad1ea6e91f9a5850(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=32;
    if((l.current_byte==93/*[]]*/)&&consume(l,data,state)){
        add_reduce(state,data,4,66);
        /*[37]*/
        return prod;
    }
    return -1;
    /*ad1ea6e91f9a5850da4a920638d01456*/
}
function branch_aded7d5f4449f343(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=4;
    if(/*[asterisk/]*/cmpr_set(l,data,18,2,2)&&consume(l,data,state)){
        add_reduce(state,data,3,0);
        /*[71]*/
        return prod;
    }
    return -1;
    /*aded7d5f4449f343575434c38da729dc*/
}
function branch_ae3144e9e413a00d(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
    /*32:106 match_expression_HC_listbody3_113=>match_expression_HC_listbody3_113 • , match_clause*/
    puid |=2;
    consume(l,data,state);
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=4;
    pushFN(data,branch_60a0d7e0c6e15dc4);
    pushFN(data,$match_clause);
    return puid;
    return -1;
    /*ae3144e9e413a00da5e67f44d3f1b27a*/
}
function branch_aea534ce4c958f57(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*31:97 loop_expression=>loop ( parameters ; expression ; • loop_expression_HC_listbody6_112 ) expression*/
    puid |=64;
    pushFN(data,branch_f2a28a6d01733506);
    pushFN(data,$loop_expression_HC_listbody6_112);
    return puid;
    return -1;
    /*aea534ce4c958f573153c7e85f09a26d*/
}
function branch_af600368dc94937c(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*31:99 loop_expression=>loop ( ; expression ; • loop_expression_HC_listbody6_112 ) expression*/
    puid |=64;
    pushFN(data,branch_8138879e1d427f9d);
    pushFN(data,$loop_expression_HC_listbody6_112);
    return puid;
    return -1;
    /*af600368dc94937ca73e0b8c953456f1*/
}
function branch_b0016a63eef6ed7f(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$comment_HC_listbody1_131_goto);
    return 68;
    /*b0016a63eef6ed7f2b8efc43788d7b10*/
}
function branch_b0193ac109573cd3(l,data,state,prod,puid){
    /*13:36 function=>modifier_list • fn identifier : type ( parameters ) { expression_statements }
    13:38 function=>modifier_list • fn identifier : type ( ) { expression_statements }
    13:39 function=>modifier_list • fn identifier : type ( parameters ) { }
    13:42 function=>modifier_list • fn identifier : type ( ) { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(/*[fn]*/cmpr_set(l,data,144,2,2)){
        consume(l,data,state);
        puid |=2;
        /*13:36 function=>modifier_list fn • identifier : type ( parameters ) { expression_statements }
        13:38 function=>modifier_list fn • identifier : type ( ) { expression_statements }
        13:39 function=>modifier_list fn • identifier : type ( parameters ) { }
        13:42 function=>modifier_list fn • identifier : type ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_d1cbad639e13f630);
        pushFN(data,$identifier);
        puid |=4;
        return puid;
    }
    return -1;
    /*b0193ac109573cd3d80ecd7d7e332606*/
}
function branch_b0455ab380c02369(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*29:93 loop_expression_group_254_111=>( • )*/
    puid |=4;
    consume(l,data,state);
    add_reduce(state,data,2,38);
    /*[29]*/
    return prod;
    return -1;
    /*b0455ab380c02369d55eb7993407048e*/
}
function branch_b0b72ac3ae560402(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$member_expression_goto);
    return 37;
    /*b0b72ac3ae56040272f440b961e4c86a*/
}
function branch_b1c7f28f94201acb(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=32;
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,6,16);
        /*[12]*/
        return prod;
    }
    return -1;
    /*b1c7f28f94201acb82be50c9974e5ef4*/
}
function branch_b246e8a43052c1e6(l,data,state,prod,puid){
    add_reduce(state,data,3,47);
    /*[25]*/
    /*-------------INDIRECT-------------------*/
    pushFN(data,branch_7eb1981bd29a0a82);
    return 21;
    /*b246e8a43052c1e6a62bf2bb1389b804*/
}
function branch_b2e2f0ce0d2240b4(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*76:228 def$defaultproduction=>• def$identifier*/
    puid |=16;
    pushFN(data,branch_8a57482f2f0b103f);
    pushFN(data,$def$identifier);
    return puid;
    return -1;
    /*b2e2f0ce0d2240b45a89b1524ae84dc6*/
}
function branch_b2f1e7a14d93676a(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*50:143 modifier_list=>• [ modifier_list_HC_listbody1_120 ]*/
    puid |=1;
    pushFN(data,branch_1f9ddf3c27180aa0);
    pushFN(data,$modifier_list);
    return puid;
    return -1;
    /*b2f1e7a14d93676a90b348e7d921a4e1*/
}
function branch_b3028ea0f4458d82(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*16:54 parameters=>parameters • , primitive_declaration*/
    puid |=2;
    consume(l,data,state);
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=4;
    pushFN(data,branch_2efddd458ddec2fb);
    pushFN(data,$primitive_declaration);
    return puid;
    return -1;
    /*b3028ea0f4458d82ff0e6974e1d47c20*/
}
function branch_b33c031c1594b433(l,data,state,prod,puid){
    add_reduce(state,data,2,0);
    /*[23]*/
    return 23;
    /*b33c031c1594b433845343b38f05315c*/
}
function branch_b35fc2cb3b2850ec(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*94:285 def$octal_token_group_058_109=>• 6*/
    puid |=64;
    consume(l,data,state);
    /*[94]*/
    return prod;
    return -1;
    /*b35fc2cb3b2850ec10ae194c229a8a50*/
}
function branch_b378dbdde936f9c8(l,data,state,prod,puid){
    add_reduce(state,data,1,3);
    /*[46]*/
    pushFN(data,$identifier_token_HC_listbody1_118_goto);
    return 46;
    /*b378dbdde936f9c8384ea3925eeababe*/
}
function branch_b41128aad158965f(l,data,state,prod,puid){
    add_reduce(state,data,2,0);
    /*[38]*/
    return 38;
    /*b41128aad158965f4fcb0c2c1f5c20a4*/
}
function branch_b4b667e4616f8c11(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*76:227 def$defaultproduction=>• def$octal*/
    puid |=8;
    pushFN(data,branch_8a57482f2f0b103f);
    pushFN(data,$def$octal);
    return puid;
    return -1;
    /*b4b667e4616f8c11da117c5bf66638d6*/
}
function branch_b51affde31ea4bf3(l,data,state,prod,puid){
    /*43:125 primitive_declaration=>modifier_list identifier • : type primitive_declaration_group_169_116
    43:127 primitive_declaration=>modifier_list identifier • : type*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==58/*[:]*/){
        consume(l,data,state);
        puid |=4;
        /*43:125 primitive_declaration=>modifier_list identifier : • type primitive_declaration_group_169_116
        43:127 primitive_declaration=>modifier_list identifier : • type*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_6c87544f6da2f95e);
        pushFN(data,$type);
        puid |=8;
        return puid;
    }
    return -1;
    /*b51affde31ea4bf31a1209f21b97d83e*/
}
function branch_b5e9476a4c00af0a(l,data,state,prod,puid){
    /*[26]*/
    return prod;
    /*b5e9476a4c00af0a9972b2beb28eb56a*/
}
function branch_b60e1bb25efbee57(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*27:89 unary_value=>( • expression_statements_group_023_108 )*/
    puid |=32;
    pushFN(data,branch_0e72a2eac35a2fe0);
    pushFN(data,$expression_statements_group_023_108);
    return puid;
    return -1;
    /*b60e1bb25efbee574a94b6393d8136c1*/
}
function branch_b63d7f48232e6678(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*94:281 def$octal_token_group_058_109=>• 2*/
    puid |=4;
    consume(l,data,state);
    /*[94]*/
    return prod;
    return -1;
    /*b63d7f48232e6678bffcb5b50daa6f69*/
}
function branch_b6429eb3c6827a44(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$expression_goto);
    return 26;
    /*b6429eb3c6827a44d544b6cad0001781*/
}
function branch_b7e7636fa822a2e8(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=128;
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        puid |=4;
        pushFN(data,branch_10fdc71a0d85872b);
        pushFN(data,$expression);
        return puid;
    }
    return -1;
    /*b7e7636fa822a2e80d3ebb5c5f88edaa*/
}
function branch_b84a2262f54d4e98(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*110:329 virtual-137:3:1|--lvl:0=>identifier_token_HC_listbody1_118 • identifier_token_group_079_119*/
    puid |=undefined;
    pushFN(data,branch_49a46d9fb3405fea);
    pushFN(data,$identifier_token_group_079_119);
    return puid;
    return -1;
    /*b84a2262f54d4e9848cd29cdb39b4d1b*/
}
function branch_b88ca848a1175e09(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=512;
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,8,32);
        /*[14]*/
        return prod;
    }
    return -1;
    /*b88ca848a1175e09fb6df8ebcd65014a*/
}
function branch_b9f8e5d82f7d9108(l,data,state,prod,puid){
    return 52;
    /*b9f8e5d82f7d9108743dcfc464a19dfe*/
}
function branch_ba51a3dd41c87eef(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*116:335 virtual-329:7:1|--lvl:1=>parameters ; ; • loop_expression_HC_listbody6_112 ) expression*/
    puid |=64;
    pushFN(data,branch_833469dae973f71e);
    pushFN(data,$loop_expression_HC_listbody6_112);
    return puid;
    return -1;
    /*ba51a3dd41c87eefdd010c296f9c1959*/
}
function branch_bc0969d4544a379c(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=128;
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        puid |=4;
        pushFN(data,branch_e9281085d0f15e09);
        pushFN(data,$expression);
        return puid;
    }
    return -1;
    /*bc0969d4544a379c8a30bac0047d6e79*/
}
function branch_bcf2526debbe588a(l,data,state,prod,puid){
    /*13:36 function=>modifier_list fn identifier • : type ( parameters ) { expression_statements }
    13:38 function=>modifier_list fn identifier • : type ( ) { expression_statements }
    13:39 function=>modifier_list fn identifier • : type ( parameters ) { }
    13:42 function=>modifier_list fn identifier • : type ( ) { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==58/*[:]*/){
        consume(l,data,state);
        puid |=8;
        /*13:36 function=>modifier_list fn identifier : • type ( parameters ) { expression_statements }
        13:38 function=>modifier_list fn identifier : • type ( ) { expression_statements }
        13:39 function=>modifier_list fn identifier : • type ( parameters ) { }
        13:42 function=>modifier_list fn identifier : • type ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_83a8971da481bd2c);
        pushFN(data,$type);
        puid |=16;
        return puid;
    }
    return -1;
    /*bcf2526debbe588a1a1b178ad919895e*/
}
function branch_bd425dd3e7a5fa9c(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=512;
    if(/*[in]*/cmpr_set(l,data,43,2,2)&&consume(l,data,state)){
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        puid |=4;
        pushFN(data,branch_1709042e778d5127);
        pushFN(data,$expression);
        return puid;
    }
    return -1;
    /*bd425dd3e7a5fa9cfb07e24242d7c940*/
}
function branch_bd593ed6ddb0b062(l,data,state,prod,puid){
    /*25:80 binary_expression=>unary_expression operator •
    25:81 binary_expression=>unary_expression operator • expression*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    switch(sym_map_174451ba753fe315(l,data)){
        default:
        case 0:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*25:80 binary_expression=>unary_expression operator •*/
            add_reduce(state,data,2,46);
            /*[25]*/
            /*-------------INDIRECT-------------------*/
            add_reduce(state,data,1,3);
            pushFN(data,$expression_statements_goto);
            return 20;
        case 1:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*25:81 binary_expression=>unary_expression operator • expression*/
            puid |=4;
            pushFN(data,branch_4d67938cff066b46);
            pushFN(data,$expression);
            return puid;
        case 2:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
            /*25:81 binary_expression=>unary_expression operator • expression*/
            puid |=4;
            pushFN(data,branch_4d67938cff066b46);
            pushFN(data,$expression);
            return puid;
    }
    return -1;
    /*bd593ed6ddb0b062d6c5e99ca15ff4e9*/
}
function branch_bd7181a6789cdf53(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*94:279 def$octal_token_group_058_109=>• 0*/
    puid |=1;
    consume(l,data,state);
    /*[94]*/
    return prod;
    return -1;
    /*bd7181a6789cdf53d61e8e73f2d20cf5*/
}
function branch_be0b9fe3c777e4c8(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=512;
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,9,29);
        /*[14]*/
        return prod;
    }
    return -1;
    /*be0b9fe3c777e4c8da5fec1453be626b*/
}
function branch_be0eb48b27d687bc(l,data,state,prod,puid){
    return 82;
    /*be0eb48b27d687bc1407309f6e524f70*/
}
function branch_be1b240e43f2d413(l,data,state,prod,puid){
    /*[113]*/
    /*be1b240e43f2d413670dbb020eedf531*/
}
function branch_be96c9171385ef22(l,data,state,prod,puid){
    add_reduce(state,data,3,0);
    /*[71]*/
    return prod;
    /*be96c9171385ef22088a2e533fae0a91*/
}
function branch_beb6074e150a3c2e(l,data,state,prod,puid){
    add_reduce(state,data,2,0);
    /*[92]*/
    return 92;
    /*beb6074e150a3c2e5efe9c9c8427bcef*/
}
function branch_bee10bf7d5376036(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*57:170 string_group_0111_125=>• θnl*/
    puid |=2;
    consume(l,data,state);
    /*[57]*/
    return prod;
    return -1;
    /*bee10bf7d53760366b7f825e67153850*/
}
function branch_bf312da1e8e7a614(l,data,state,prod,puid){
    return 26;
    /*bf312da1e8e7a61405660afe1d95f62f*/
}
function branch_bf60c80149b74072(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$expression_statements_HC_listbody1_107_goto);
    return 17;
    /*bf60c80149b7407217fba9f602366bd6*/
}
function branch_bf8e71a01f2eba15(l,data,state,prod,puid){
    return 29;
    /*bf8e71a01f2eba156e77e0fc11bb971f*/
}
function branch_bfb17e535f287a90(l,data,state,prod,puid){
    return 94;
    /*bfb17e535f287a903a5093e34dfe201a*/
}
function branch_bfb681f46c628980(l,data,state,prod,puid){
    add_reduce(state,data,2,0);
    /*[96]*/
    return 96;
    /*bfb681f46c628980e5ae24ff7feb9dd1*/
}
function branch_bfd772be8d43598a(l,data,state,prod,puid){
    add_reduce(state,data,2,37);
    /*[19]*/
    return prod;
    /*bfd772be8d43598a8300997d27374940*/
}
function branch_c02239ccf58d6599(l,data,state,prod,puid){
    add_reduce(state,data,2,92);
    /*[65]*/
    return prod;
    /*c02239ccf58d6599b9cc6abb2aceb1b7*/
}
function branch_c02fb8bab7ec7632(l,data,state,prod,puid){
    add_reduce(state,data,3,65);
    /*[37]*/
    return prod;
    /*c02fb8bab7ec7632abe53ca18714f176*/
}
function branch_c039347047679c50(l,data,state,prod,puid){
    /*33:108 match_expression=>match expression • : match_expression_HC_listbody3_113
    33:109 match_expression=>match expression • :*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==58/*[:]*/){
        consume(l,data,state);
        puid |=4;
        /*33:108 match_expression=>match expression : • match_expression_HC_listbody3_113
        33:109 match_expression=>match expression : •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        switch(sym_map_1015cbb2bf16c5e8(l,data)){
            case 0:
                /*33:108 match_expression=>match expression : • match_expression_HC_listbody3_113
                33:109 match_expression=>match expression : •*/
                var pk = l.copy();
                skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,0);
                switch(sym_map_9fff07fe93fb5f87(pk,data)){
                    case 0:
                        /*--LEAF--*/
                        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                        /*33:108 match_expression=>match expression : • match_expression_HC_listbody3_113*/
                        puid |=8;
                        pushFN(data,branch_041ca6562744cb9c);
                        pushFN(data,$match_expression_HC_listbody3_113);
                        return puid;
                    default:
                    case 1:
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*33:109 match_expression=>match expression : •*/
                        add_reduce(state,data,3,61);
                        /*[33]*/
                        return 33;
                }
            default:
            case 1:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                /*33:109 match_expression=>match expression : •*/
                add_reduce(state,data,3,61);
                /*[33]*/
                return 33;
            case 2:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*33:108 match_expression=>match expression : • match_expression_HC_listbody3_113*/
                puid |=8;
                pushFN(data,branch_041ca6562744cb9c);
                pushFN(data,$match_expression_HC_listbody3_113);
                return puid;
            case 3:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                /*33:108 match_expression=>match expression : • match_expression_HC_listbody3_113*/
                puid |=8;
                pushFN(data,branch_041ca6562744cb9c);
                pushFN(data,$match_expression_HC_listbody3_113);
                return puid;
        }
    }
    return -1;
    /*c039347047679c506e07101d24543628*/
}
function branch_c08b39a165ece913(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*57:171 string_group_0111_125=>• θid*/
    puid |=4;
    consume(l,data,state);
    /*[57]*/
    return prod;
    return -1;
    /*c08b39a165ece913dd05cc0b785e5003*/
}
function branch_c0b1a9a514dfb29e(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*11:29 class=>cls identifier class_group_113_103 { • }*/
    puid |=64;
    consume(l,data,state);
    add_reduce(state,data,5,13);
    /*[11]*/
    return prod;
    return -1;
    /*c0b1a9a514dfb29e85ff63fcc9089615*/
}
function branch_c0e3727d9ff912b9(l,data,state,prod,puid){
    pushFN(data,$expression_statements_goto);
    return 50;
    /*c0e3727d9ff912b905b2aed2c2721065*/
}
function branch_c0ecc69d8f741695(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*77:236 def$hex_digit=>• τf*/
    puid |=64;
    consume(l,data,state);
    /*[77]*/
    return prod;
    return -1;
    /*c0ecc69d8f74169512967d70099181f5*/
}
function branch_c17969f5ec90c498(l,data,state,prod,puid){
    return 77;
    /*c17969f5ec90c498f9afe2141fffce6c*/
}
function branch_c2144dc458d9b458(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*66:202 modifier=>• mut*/
    puid |=8;
    consume(l,data,state);
    /*[66]*/
    return prod;
    return -1;
    /*c2144dc458d9b4583506acf4fbcb277a*/
}
function branch_c2312c72da68c3a6(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*107:319 def$identifier_symbols=>def$identifier_symbols • θid*/
    puid |=2;
    consume(l,data,state);
    add_reduce(state,data,2,87);
    /*[107]*/
    return prod;
    return -1;
    /*c2312c72da68c3a62a94b18d84abdf09*/
}
function branch_c253ee1ffc835768(l,data,state,prod,puid){
    /*108:327 virtual-126:4:1|--lvl:0=>• : type primitive_declaration_group_169_116
    109:328 virtual-128:3:1|--lvl:0=>• : type
    110:329 virtual-117:1:1|--lvl:0=>•*/
    switch(sym_map_9fff07fe93fb5f87(l,data)){
        case 0:
            /*108:327 virtual-126:4:1|--lvl:0=>• : type primitive_declaration_group_169_116
            109:328 virtual-128:3:1|--lvl:0=>• : type*/
            var pk = l.copy();
            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,0);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if(((((/*[uint]*/cmpr_set(pk,data,83,4,4)||/*[int]*/cmpr_set(pk,data,84,3,3))||/*[flt]*/cmpr_set(pk,data,125,3,3))||dt_1e3f2d5b696b270e(pk,data))||assert_ascii(pk,0x0,0x10,0x80000000,0x200240))||pk.isUniID(data)){
                /*108:327 virtual-126:4:1|--lvl:0=>• : type primitive_declaration_group_169_116
                109:328 virtual-128:3:1|--lvl:0=>• : type*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l,data,state);
                puid |=4;
                /*108:327 virtual-126:4:1|--lvl:0=>: • type primitive_declaration_group_169_116
                109:328 virtual-128:3:1|--lvl:0=>: • type*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                pushFN(data,branch_67d65f2aa32bbda4);
                pushFN(data,$type);
                puid |=8;
                return puid;
            }
        default:
        case 1:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*110:329 virtual-117:1:1|--lvl:0=>•*/
            /*[110]*/
            add_reduce(state,data,1,67);
            /*[37]*/
            pushFN(data,$expression_statements_goto);
            return 37;
    }
    return -1;
    /*c253ee1ffc8357681c6b16f7ab556a93*/
}
function branch_c254e571baecca8e(l,data,state,prod,puid){
    add_reduce(state,data,3,43);
    /*[22]*/
    /*-------------INDIRECT-------------------*/
    pushFN(data,$expression_statements_group_023_108_goto);
    return 18;
    /*c254e571baecca8e1d8af0abffad6076*/
}
function branch_c3351ba9da7fb6e6(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*76:224 def$defaultproduction=>• def$number*/
    puid |=1;
    pushFN(data,branch_8a57482f2f0b103f);
    pushFN(data,$def$number);
    return puid;
    return -1;
    /*c3351ba9da7fb6e6776d3b5a3b8270cc*/
}
function branch_c354136a0f6bca6b(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$def$string_token_goto);
    return 99;
    /*c354136a0f6bca6bb5656c76ed267f4c*/
}
function branch_c3ac347b869d9bed(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=1024;
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,11,20);
        /*[13]*/
        return prod;
    }
    return -1;
    /*c3ac347b869d9bed991bb124170ff48b*/
}
function branch_c3b494f09f364853(l,data,state,prod,puid){
    return 14;
    /*c3b494f09f36485336df3d705d5e35e4*/
}
function branch_c480684fc6a4f58d(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*105:311 def$js_id_symbols=>def$js_id_symbols • θid*/
    puid |=2;
    consume(l,data,state);
    add_reduce(state,data,2,87);
    /*[105]*/
    return prod;
    return -1;
    /*c480684fc6a4f58d425652d2dcf1991c*/
}
function branch_c48ec47f4ada1fcb(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*66:200 modifier=>• priv*/
    puid |=2;
    consume(l,data,state);
    /*[66]*/
    return prod;
    return -1;
    /*c48ec47f4ada1fcb254f1b7d20db0fc5*/
}
function branch_c4b62b3103720aeb(l,data,state,prod,puid){
    /*[118]*/
    return prod;
    /*c4b62b3103720aeb86440750af0ebb0b*/
}
function branch_c63f9575bdce92ba(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=32;
    if((l.current_byte==93/*[]]*/)&&consume(l,data,state)){
        add_reduce(state,data,4,66);
        /*[37]*/
        /*-------------INDIRECT-------------------*/
        pushFN(data,branch_7eb1981bd29a0a82);
        return 37;
    }
    return -1;
    /*c63f9575bdce92bac6a9b89c2fa80a2b*/
}
function branch_c658420abf54850b(l,data,state,prod,puid){
    /*[28]*/
    return 28;
    /*c658420abf54850bd0b69827ed928b80*/
}
function branch_c72422ee35ca2262(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=512;
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,9,30);
        /*[14]*/
        return prod;
    }
    return -1;
    /*c72422ee35ca226215b3ee41f989509a*/
}
function branch_c7fe8d3a67ebf157(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=32;
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,5,17);
        /*[12]*/
        return prod;
    }
    return -1;
    /*c7fe8d3a67ebf157ce3d33a8f4291c15*/
}
function branch_c810b4dab2bf7a57(l,data,state,prod,puid){
    /*[73]*/
    return 73;
    /*c810b4dab2bf7a57519fe76f0bef426e*/
}
function branch_c82dc4a81cc2db7e(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*66:204 modifier=>• θid*/
    puid |=32;
    consume(l,data,state);
    /*[66]*/
    return prod;
    return -1;
    /*c82dc4a81cc2db7e13945b709dc08910*/
}
function branch_c9320fb80d30383f(l,data,state,prod,puid){
    add_reduce(state,data,1,3);
    /*[75]*/
    pushFN(data,$def$defaultproductions_goto);
    return 75;
    /*c9320fb80d30383ffc1903d77599bc8b*/
}
function branch_c93b7becf0e36405(l,data,state,prod,puid){
    add_reduce(state,data,2,92);
    /*[65]*/
    return 65;
    /*c93b7becf0e3640502cbb3fb7ee2a394*/
}
function branch_c9fbafe8a503384d(l,data,state,prod,puid){
    add_reduce(state,data,3,43);
    /*[22]*/
    /*-------------INDIRECT-------------------*/
    pushFN(data,$expression_goto);
    return 21;
    /*c9fbafe8a503384d7e5f231b722122c6*/
}
function branch_ca058e4bc0b61737(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*100:299 def$string_value_group_071_112=>• θws*/
    puid |=8;
    consume(l,data,state);
    /*[100]*/
    return prod;
    return -1;
    /*ca058e4bc0b617375be36f50143f2c7e*/
}
function branch_ca29124f1bf003e4(l,data,state,prod,puid){
    /*24:78 if_expression=>if expression • : expression if_expression_group_139_110
    24:79 if_expression=>if expression • : expression*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==58/*[:]*/){
        consume(l,data,state);
        puid |=4;
        /*24:78 if_expression=>if expression : • expression if_expression_group_139_110
        24:79 if_expression=>if expression : • expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_fc5ae545c07fed0f);
        pushFN(data,$expression);
        puid |=2;
        return puid;
    }
    return -1;
    /*ca29124f1bf003e49bb205beccebd832*/
}
function branch_ca9eb6d8fc6ce6d7(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*57:169 string_group_0111_125=>• θws*/
    puid |=1;
    consume(l,data,state);
    /*[57]*/
    return prod;
    return -1;
    /*ca9eb6d8fc6ce6d74c1e226e247b25e6*/
}
function branch_cb6f2beb6b754054(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*44:129 identifier=>• tk:identifier_token*/
    puid |=1;
    pushFN(data,branch_1f9ddf3c27180aa0);
    pushFN(data,$identifier);
    return puid;
    return -1;
    /*cb6f2beb6b7540541b6ba7d6f6f9a8dc*/
}
function branch_cbc044c8c9b81bf7(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$class_group_016_104_goto);
    return 9;
    /*cbc044c8c9b81bf7be723a9cb9fc2e11*/
}
function branch_cbc9ddb32c7cd341(l,data,state,prod,puid){
    /*[4]*/
    return prod;
    /*cbc9ddb32c7cd3415326a840183d0649*/
}
function branch_cbce39a7fc1f6e7e(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*11:25 class=>cls identifier class_group_113_103 { • class_HC_listbody1_105 }*/
    puid |=32;
    pushFN(data,branch_a51e8785cfab81f2);
    pushFN(data,$class_HC_listbody1_105);
    return puid;
    return -1;
    /*cbce39a7fc1f6e7e441eb783ff47c95a*/
}
function branch_cbd95ed6c98c2884(l,data,state,prod,puid){
    return 71;
    /*cbd95ed6c98c28845606ab4be3ed231e*/
}
function branch_cbf1e60b49bba616(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$comment_HC_listbody1_132_goto);
    return 69;
    /*cbf1e60b49bba616dc5193b806c2168a*/
}
function branch_cbfe724e4e447837(l,data,state,prod,puid){
    add_reduce(state,data,2,0);
    /*[101]*/
    return prod;
    /*cbfe724e4e44783747a80eee665042b2*/
}
function branch_cc3439f4db3f3190(l,data,state,prod,puid){
    return 76;
    /*cc3439f4db3f3190bf2ef7bd336cf9b7*/
}
function branch_cc4b612b6b7ec408(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$def$defaultproductions_goto);
    return 75;
    /*cc4b612b6b7ec408d6ec9ecfb574ea25*/
}
function branch_cc7c66b5d101dfcb(l,data,state,prod,puid){
    /*13:36 function=>modifier_list fn identifier : type ( parameters • ) { expression_statements }
    13:39 function=>modifier_list fn identifier : type ( parameters • ) { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==41/*[)]*/){
        consume(l,data,state);
        puid |=128;
        /*13:36 function=>modifier_list fn identifier : type ( parameters ) • { expression_statements }
        13:39 function=>modifier_list fn identifier : type ( parameters ) • { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if(l.current_byte==123/*[{]*/){
            consume(l,data,state);
            puid |=256;
            /*13:36 function=>modifier_list fn identifier : type ( parameters ) { • expression_statements }
            13:39 function=>modifier_list fn identifier : type ( parameters ) { • }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if(l.current_byte==125/*[}]*/){
                pushFN(data,branch_0a5b9c282ee399c8);
                return branch_7abe37b49929c439(l,data,state,prod,256);
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if(((((((((((((((/*[if]*/cmpr_set(l,data,143,2,2)||/*[match]*/cmpr_set(l,data,67,5,5))||/*[break]*/cmpr_set(l,data,72,5,5))||/*[return]*/cmpr_set(l,data,77,6,6))||/*[continue]*/cmpr_set(l,data,39,8,8))||/*[loop]*/cmpr_set(l,data,63,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[==]*/cmpr_set(l,data,7,2,2))||dt_bcea2102060eab13(l,data))||/*[true]*/cmpr_set(l,data,95,4,4))||/*[null]*/cmpr_set(l,data,35,4,4))||dt_6ae31dd85a62ef5c(l,data))||assert_ascii(l,0x0,0x194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
                pushFN(data,branch_0a5b9c282ee399c8);
                return branch_3fa42f1010d68298(l,data,state,prod,256);
            }
        }
    }
    return -1;
    /*cc7c66b5d101dfcb001c4c33a7bd4fc9*/
}
function branch_cdb6cd975ad71487(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*119:338 virtual-332:6:1|--lvl:1=>primitive_declaration • in expression ) expression*/
    puid |=512;
    consume(l,data,state);
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=4;
    pushFN(data,branch_60b7306e07145e72);
    pushFN(data,$expression);
    return puid;
    return -1;
    /*cdb6cd975ad71487bc52d21fe2dfb073*/
}
function branch_cdf07204c86063f9(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*31:100 loop_expression=>loop ( parameters ; ; • loop_expression_HC_listbody6_112 ) expression*/
    puid |=64;
    pushFN(data,branch_bc0969d4544a379c);
    pushFN(data,$loop_expression_HC_listbody6_112);
    return puid;
    return -1;
    /*cdf07204c86063f9ce0d91872eae951b*/
}
function branch_cea7f385fdc7932d(l,data,state,prod,puid){
    /*43:126 primitive_declaration=>identifier : type • primitive_declaration_group_169_116
    43:128 primitive_declaration=>identifier : type •*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        pushFN(data,branch_0372dbd01ff9f446);
        return branch_5ebfbb554475da4a(l,data,state,prod,8);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*43:128 primitive_declaration=>identifier : type •*/
        add_reduce(state,data,3,76);
        /*[43]*/
        return 43;
    }
    return -1;
    /*cea7f385fdc7932d286883a11160abd1*/
}
function branch_cf11d39a6eea6b7f(l,data,state,prod,puid){
    add_reduce(state,data,2,2);
    /*[10]*/
    return prod;
    /*cf11d39a6eea6b7fc33b20813179b683*/
}
function branch_cf4169e688143911(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    /*71:216 comment=>• // comment_group_0143_133*/
    puid |=8;
    consume(l,data,state);
    skip_6c02533b5dc0d802(l/*[ ws ][ 71 ]*/,data,state);
    puid |=32;
    pushFN(data,branch_2613e402373430d1);
    pushFN(data,$comment_group_0143_133);
    return puid;
    return -1;
    /*cf4169e68814391177ba8b5f805895cf*/
}
function branch_cf58ea85ec38a788(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*88:269 def$hex_token_HC_listbody1_105=>def$hex_token_HC_listbody1_105 • def$hex_token_group_044_104*/
    puid |=2;
    pushFN(data,branch_1d51f74a2236a4f8);
    pushFN(data,$def$hex_token_group_044_104);
    return puid;
    return -1;
    /*cf58ea85ec38a788b3affb37ea2f47c5*/
}
function branch_cf808672b5bab9d7(l,data,state,prod,puid){
    add_reduce(state,data,8,53);
    /*[31]*/
    return prod;
    /*cf808672b5bab9d7ffd5676242fea3f7*/
}
function branch_d0a2a5ef6d3b2710(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*20:62 expression_statements=>expression_statements • expression_statements_group_124_109*/
    puid |=2;
    pushFN(data,branch_15c73062595875da);
    pushFN(data,$expression_statements_group_124_109);
    return puid;
    return -1;
    /*d0a2a5ef6d3b271005b8fbb027c5eea8*/
}
function branch_d177746be1ee355c(l,data,state,prod,puid){
    add_reduce(state,data,3,47);
    /*[25]*/
    return 25;
    /*d177746be1ee355cf070b2a9d0afa90a*/
}
function branch_d18aa6c090f740a2(l,data,state,prod,puid){
    add_reduce(state,data,5,73);
    /*[43]*/
    return prod;
    /*d18aa6c090f740a2aa02e905f0af36ab*/
}
function branch_d1b417e20a9bd046(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*67:205 comment_group_0138_130=>• θid*/
    puid |=1;
    consume(l,data,state);
    /*[67]*/
    return prod;
    return -1;
    /*d1b417e20a9bd04635570d46e4641dd3*/
}
function branch_d1cbad639e13f630(l,data,state,prod,puid){
    /*13:36 function=>modifier_list fn identifier • : type ( parameters ) { expression_statements }
    13:38 function=>modifier_list fn identifier • : type ( ) { expression_statements }
    13:39 function=>modifier_list fn identifier • : type ( parameters ) { }
    13:42 function=>modifier_list fn identifier • : type ( ) { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==58/*[:]*/){
        consume(l,data,state);
        puid |=8;
        /*13:36 function=>modifier_list fn identifier : • type ( parameters ) { expression_statements }
        13:38 function=>modifier_list fn identifier : • type ( ) { expression_statements }
        13:39 function=>modifier_list fn identifier : • type ( parameters ) { }
        13:42 function=>modifier_list fn identifier : • type ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_70487b9d04cbdc54);
        pushFN(data,$type);
        puid |=16;
        return puid;
    }
    return -1;
    /*d1cbad639e13f630af8b0ab67f038650*/
}
function branch_d1cfa7d2150e033a(l,data,state,prod,puid){
    pushFN(data,$unary_value_goto);
    return 37;
    /*d1cfa7d2150e033a37407c86f24f818a*/
}
function branch_d239b9dc91064a7d(l,data,state,prod,puid){
    return 7;
    /*d239b9dc91064a7db8927a46bc6965d0*/
}
function branch_d24e5c8a9179f1ec(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*19:60 expression_statements_group_124_109=>expression_statements_HC_listbody1_107 • expression_statements_group_023_108*/
    puid |=2;
    pushFN(data,branch_bfd772be8d43598a);
    pushFN(data,$expression_statements_group_023_108);
    return puid;
    return -1;
    /*d24e5c8a9179f1ec1caef4da4d9d984c*/
}
function branch_d2bd478d3a4a66be(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$expression_statements_goto);
    return 20;
    /*d2bd478d3a4a66be38097051785fc558*/
}
function branch_d2c6d519cf7571ee(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*7:17 namespace=>ns identifier { • }*/
    puid |=16;
    consume(l,data,state);
    add_reduce(state,data,4,7);
    /*[7]*/
    return prod;
    return -1;
    /*d2c6d519cf7571eefd8a3b82cf0bd5e6*/
}
function branch_d2c740e2895aefc6(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
    /*103:308 def$string_value=>def$string_value • def$string_value_group_172_113*/
    puid |=2;
    pushFN(data,branch_870b9591079c3e66);
    pushFN(data,$def$string_value_group_172_113);
    return puid;
    return -1;
    /*d2c740e2895aefc64144bc5deb0a3dd9*/
}
function branch_d2e97e3141477434(l,data,state,prod,puid){
    /*43:125 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_169_116
    43:127 primitive_declaration=>modifier_list identifier : type •*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        pushFN(data,branch_104d5a190a45ad94);
        return branch_4db7765786d1a76d(l,data,state,prod,8);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*43:127 primitive_declaration=>modifier_list identifier : type •*/
        add_reduce(state,data,4,75);
        /*[43]*/
        /*-------------INDIRECT-------------------*/
        return 18;
    }
    return -1;
    /*d2e97e314147743455081f21e0186a54*/
}
function branch_d3d44c1ecb2f6a76(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*77:240 def$hex_digit=>• τD*/
    puid |=1024;
    consume(l,data,state);
    /*[77]*/
    return prod;
    return -1;
    /*d3d44c1ecb2f6a76697df3fe4f4cf011*/
}
function branch_d48f358d2c1e2641(l,data,state,prod,puid){
    /*65:192 operator=>== operator_HC_listbody1_129 • identifier_token_group_079_119
    65:196 operator=>== operator_HC_listbody1_129 •*/
    skip_db1786a8af54d666(l/*[ 71 ]*/,data,state);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/){
        pushFN(data,branch_3205c0ded576131e);
        return branch_a5b0f86d1e8799e7(l,data,state,prod,16);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*65:196 operator=>== operator_HC_listbody1_129 •*/
        add_reduce(state,data,2,91);
        /*[65]*/
    }
    return -1;
    /*d48f358d2c1e2641bcc1e13eb72081b9*/
}
function branch_d4db2f1e23e0aa87(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*4:6 statements=>• import*/
    puid |=1;
    pushFN(data,branch_cbc9ddb32c7cd341);
    pushFN(data,$import);
    return puid;
    return -1;
    /*d4db2f1e23e0aa8761df3ec57337b289*/
}
function branch_d50793919de0bb4d(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=1;
    if((l.current_byte==34/*["]*/)&&consume(l,data,state)){
        add_reduce(state,data,3,37);
        /*[97]*/
        return prod;
    }
    return -1;
    /*d50793919de0bb4d80885a28b0f0f6e1*/
}
function branch_d517ec8557c6a81d(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*69:210 comment_HC_listbody1_132=>comment_HC_listbody1_132 • comment_group_0138_130*/
    puid |=2;
    pushFN(data,branch_7f884ce191790bd2);
    pushFN(data,$comment_group_0138_130);
    return puid;
    return -1;
    /*d517ec8557c6a81de5b4ea6c13c0ba8f*/
}
function branch_d54ecf6c2941c966(l,data,state,prod,puid){
    /*12:32 struct=>modifier_list str identifier • { parameters }
    12:34 struct=>modifier_list str identifier • { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==123/*[{]*/){
        consume(l,data,state);
        puid |=8;
        /*12:32 struct=>modifier_list str identifier { • parameters }
        12:34 struct=>modifier_list str identifier { • }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.current_byte==125/*[}]*/){
            pushFN(data,branch_0a5b9c282ee399c8);
            return branch_738e78cb42aaca73(l,data,state,prod,8);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if(assert_ascii(l,0x0,0x10,0x88000000,0x0)||l.isUniID(data)){
            pushFN(data,branch_0a5b9c282ee399c8);
            return branch_221aa0935ee3496d(l,data,state,prod,8);
        }
    }
    return -1;
    /*d54ecf6c2941c966980d77070ee7a840*/
}
function branch_d55ca1ce5b5d08ad(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*101:303 def$string_value_group_172_113=>• θsym*/
    puid |=4;
    consume(l,data,state);
    /*[101]*/
    return prod;
    return -1;
    /*d55ca1ce5b5d08adc30c16e44bf741a0*/
}
function branch_d57ced1311a1cf9b(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*54:157 type_group_097_124=>• 128*/
    puid |=4;
    consume(l,data,state);
    /*[54]*/
    return prod;
    return -1;
    /*d57ced1311a1cf9bb011d283637d9d26*/
}
function branch_d5ba2d1d1c1d649b(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=2;
    if((l.current_byte==61/*[=]*/)&&consume(l,data,state)){
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        puid |=4;
        pushFN(data,branch_ac98dd9c4e5d1a20);
        pushFN(data,$expression);
        return puid;
    }
    return -1;
    /*d5ba2d1d1c1d649b098e42de511adfba*/
}
function branch_d785a07b6d58d4de(l,data,state,prod,puid){
    /*11:24 class=>modifier_list cls identifier • class_group_113_103 { class_HC_listbody1_105 }
    11:27 class=>modifier_list cls identifier • class_group_113_103 { }
    11:26 class=>modifier_list cls identifier • { class_HC_listbody1_105 }
    11:30 class=>modifier_list cls identifier • { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(l.current_byte==123/*[{]*/){
        /*11:26 class=>modifier_list cls identifier • { class_HC_listbody1_105 }
        11:30 class=>modifier_list cls identifier • { }*/
        var pk = l.copy();
        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,0);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(pk.current_byte==125/*[}]*/){
            pushFN(data,branch_7dcd4e56969f4413);
            return branch_701a22a9bee4a5f7(l,data,state,prod,4);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else if(((/*[str]*/cmpr_set(pk,data,47,3,3)||/*[fn]*/cmpr_set(pk,data,144,2,2))||assert_ascii(pk,0x0,0x10,0x88000000,0x0))||pk.isUniID(data)){
            pushFN(data,branch_7dcd4e56969f4413);
            return branch_4e99431b189bbea4(l,data,state,prod,4);
        }
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(/*[is]*/cmpr_set(l,data,141,2,2)){
        /*11:24 class=>modifier_list cls identifier • class_group_113_103 { class_HC_listbody1_105 }
        11:27 class=>modifier_list cls identifier • class_group_113_103 { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_310cb76c8fb0aa32);
        pushFN(data,$class_group_113_103);
        puid |=8;
        return puid;
    }
    return -1;
    /*d785a07b6d58d4deff6c55b9b6d2abee*/
}
function branch_d896d30b01780566(l,data,state,prod,puid){
    return 60;
    /*d896d30b017805665ee927a8bba0f6b5*/
}
function branch_daf991d561b5e03f(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=4;
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        add_reduce(state,data,3,37);
        /*[29]*/
    }
    return -1;
    /*daf991d561b5e03f59dc5e6a40807485*/
}
function branch_db86d33d92d5e26d(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*27:90 unary_value=>( • )*/
    puid |=64;
    consume(l,data,state);
    add_reduce(state,data,2,49);
    /*[27]*/
    return prod;
    return -1;
    /*db86d33d92d5e26d9b6b6666869730bc*/
}
function branch_dbe970d3d9d64f55(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*107:322 def$identifier_symbols=>def$identifier_symbols • $*/
    puid |=16;
    consume(l,data,state);
    add_reduce(state,data,2,87);
    /*[107]*/
    return prod;
    return -1;
    /*dbe970d3d9d64f5546d6ec831cdbca90*/
}
function branch_dca1b9a3dd99b59c(l,data,state,prod,puid){
    /*[108]*/
    return prod;
    /*dca1b9a3dd99b59c5ca859b05c3c4c3d*/
}
function branch_dcc7cd59193ed8e1(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=32;
    if((l.current_byte==93/*[]]*/)&&consume(l,data,state)){
        add_reduce(state,data,4,66);
        /*[37]*/
        /*-------------INDIRECT-------------------*/
        pushFN(data,$expression_goto);
        return 37;
    }
    return -1;
    /*dcc7cd59193ed8e1e20520a010ef1728*/
}
function branch_ddc01e19c9392030(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*9:19 class_group_016_104=>• struct*/
    puid |=1;
    pushFN(data,branch_12a689fd4ff74029);
    pushFN(data,$struct);
    return puid;
    return -1;
    /*ddc01e19c9392030d577cdee1da915d0*/
}
function branch_dde02119f29f21a5(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*95:287 def$octal_token_HC_listbody1_110=>def$octal_token_HC_listbody1_110 • def$octal_token_group_058_109*/
    puid |=2;
    pushFN(data,branch_0ae82042e3a9a0e3);
    pushFN(data,$def$octal_token_group_058_109);
    return puid;
    return -1;
    /*dde02119f29f21a58996f7221312493b*/
}
function branch_de69aa6e18d139e1(l,data,state,prod,puid){
    add_reduce(state,data,3,47);
    /*[25]*/
    /*-------------INDIRECT-------------------*/
    pushFN(data,$expression_statements_group_023_108_goto);
    return 18;
    /*de69aa6e18d139e1ef4432a0be98a343*/
}
function branch_decbb0e7baad5cf5(l,data,state,prod,puid){
    add_reduce(state,data,1,86);
    /*[56]*/
    return prod;
    /*decbb0e7baad5cf5d6c356b187b2cac1*/
}
function branch_ded6e101b197b126(l,data,state,prod,puid){
    add_reduce(state,data,3,36);
    /*[30]*/
    return prod;
    /*ded6e101b197b126bfb4fa6843c5f671*/
}
function branch_defe7f8a739c3919(l,data,state,prod,puid){
    add_reduce(state,data,1,5);
    /*[4]*/
    return prod;
    /*defe7f8a739c3919f82b9020054a4d65*/
}
function branch_df473bc2188c8d41(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*107:325 def$identifier_symbols=>• $*/
    puid |=16;
    consume(l,data,state);
    /*[107]*/
    return prod;
    return -1;
    /*df473bc2188c8d41c90ea8b2d8f43c66*/
}
function branch_df850a3afb2abdc7(l,data,state,prod,puid){
    /*13:36 function=>modifier_list fn identifier : type ( parameters • ) { expression_statements }
    13:39 function=>modifier_list fn identifier : type ( parameters • ) { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==41/*[)]*/){
        consume(l,data,state);
        puid |=128;
        /*13:36 function=>modifier_list fn identifier : type ( parameters ) • { expression_statements }
        13:39 function=>modifier_list fn identifier : type ( parameters ) • { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if(l.current_byte==123/*[{]*/){
            consume(l,data,state);
            puid |=256;
            /*13:36 function=>modifier_list fn identifier : type ( parameters ) { • expression_statements }
            13:39 function=>modifier_list fn identifier : type ( parameters ) { • }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if(l.current_byte==125/*[}]*/){
                pushFN(data,branch_2d70052e1cc76d5c);
                return branch_7abe37b49929c439(l,data,state,prod,256);
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if(((((((((((((((/*[if]*/cmpr_set(l,data,143,2,2)||/*[match]*/cmpr_set(l,data,67,5,5))||/*[break]*/cmpr_set(l,data,72,5,5))||/*[return]*/cmpr_set(l,data,77,6,6))||/*[continue]*/cmpr_set(l,data,39,8,8))||/*[loop]*/cmpr_set(l,data,63,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[==]*/cmpr_set(l,data,7,2,2))||dt_bcea2102060eab13(l,data))||/*[true]*/cmpr_set(l,data,95,4,4))||/*[null]*/cmpr_set(l,data,35,4,4))||dt_6ae31dd85a62ef5c(l,data))||assert_ascii(l,0x0,0x194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
                pushFN(data,branch_2d70052e1cc76d5c);
                return branch_3fa42f1010d68298(l,data,state,prod,256);
            }
        }
    }
    return -1;
    /*df850a3afb2abdc740c2d58ea9d291d8*/
}
function branch_df9f6863c7454e16(l,data,state,prod,puid){
    pushFN(data,$expression_goto);
    return 37;
    /*df9f6863c7454e16d8e0360436e045f0*/
}
function branch_dfe476cfeb3d733c(l,data,state,prod,puid){
    add_reduce(state,data,3,47);
    /*[25]*/
    /*-------------INDIRECT-------------------*/
    pushFN(data,$expression_goto);
    return 21;
    /*dfe476cfeb3d733c4120ba04773cf0d5*/
}
function branch_e190ab952f911801(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=16;
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,5,6);
        /*[7]*/
        return prod;
    }
    return -1;
    /*e190ab952f91180181e1cf522524f5dc*/
}
function branch_e2f0c96db59810c2(l,data,state,prod,puid){
    /*11:24 class=>modifier_list • cls identifier class_group_113_103 { class_HC_listbody1_105 }
    11:26 class=>modifier_list • cls identifier { class_HC_listbody1_105 }
    11:27 class=>modifier_list • cls identifier class_group_113_103 { }
    11:30 class=>modifier_list • cls identifier { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(/*[cls]*/cmpr_set(l,data,122,3,3)){
        consume(l,data,state);
        puid |=2;
        /*11:24 class=>modifier_list cls • identifier class_group_113_103 { class_HC_listbody1_105 }
        11:26 class=>modifier_list cls • identifier { class_HC_listbody1_105 }
        11:27 class=>modifier_list cls • identifier class_group_113_103 { }
        11:30 class=>modifier_list cls • identifier { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_d785a07b6d58d4de);
        pushFN(data,$identifier);
        puid |=4;
        return puid;
    }
    return -1;
    /*e2f0c96db59810c296ba4533a426129e*/
}
function branch_e30e6d3550ca9c55(l,data,state,prod,puid){
    add_reduce(state,data,2,2);
    /*[6]*/
    return prod;
    /*e30e6d3550ca9c553c5b8827ee8c91b5*/
}
function branch_e31a0d366a42ffa8(l,data,state,prod,puid){
    /*108:327 virtual-191:3:1|--lvl:0=>• operator_HC_listbody1_128 identifier_token_group_079_119
    109:328 virtual-194:2:1|--lvl:0=>• operator_HC_listbody1_128*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.isSym(true,data)){
        /*108:327 virtual-191:3:1|--lvl:0=>• operator_HC_listbody1_128 identifier_token_group_079_119
        109:328 virtual-194:2:1|--lvl:0=>• operator_HC_listbody1_128*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_4f7e5dd4981eba91);
        pushFN(data,$operator_HC_listbody1_128);
        puid |=2;
        return puid;
    }
    return -1;
    /*e31a0d366a42ffa80fed68de13834f4d*/
}
function branch_e4c6cbcf646800d8(l,data,state,prod,puid){
    /*43:125 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_169_116
    43:127 primitive_declaration=>modifier_list identifier : type •*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        pushFN(data,branch_0372dbd01ff9f446);
        return branch_4db7765786d1a76d(l,data,state,prod,8);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*43:127 primitive_declaration=>modifier_list identifier : type •*/
        add_reduce(state,data,4,75);
        /*[43]*/
        return 43;
    }
    return -1;
    /*e4c6cbcf646800d8a516acfca233088a*/
}
function branch_e529322d3d6793d1(l,data,state,prod,puid){
    pushFN(data,branch_7eb1981bd29a0a82);
    return 50;
    /*e529322d3d6793d1019aead71d4ea432*/
}
function branch_e6262d2fc73c8fb2(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$modifier_list_HC_listbody1_120_goto);
    return 49;
    /*e6262d2fc73c8fb2e87db7a99e517735*/
}
function branch_e66d737c6db3fc33(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*59:176 string_HC_listbody1_127=>string_HC_listbody1_127 • string_group_0111_125*/
    puid |=2;
    pushFN(data,branch_869fef6fa980a0b2);
    pushFN(data,$string_group_0111_125);
    return puid;
    return -1;
    /*e66d737c6db3fc33c9bfd0f891e28937*/
}
function branch_e672b6e7092fdea4(l,data,state,prod,puid){
    /*14:44 function_expression=>modifier_list fn : type ( parameters • ) { expression_statements }
    14:47 function_expression=>modifier_list fn : type ( parameters • ) { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==41/*[)]*/){
        consume(l,data,state);
        puid |=64;
        /*14:44 function_expression=>modifier_list fn : type ( parameters ) • { expression_statements }
        14:47 function_expression=>modifier_list fn : type ( parameters ) • { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if(l.current_byte==123/*[{]*/){
            consume(l,data,state);
            puid |=128;
            /*14:44 function_expression=>modifier_list fn : type ( parameters ) { • expression_statements }
            14:47 function_expression=>modifier_list fn : type ( parameters ) { • }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if(l.current_byte==125/*[}]*/){
                pushFN(data,branch_2392b7b3a01e4cef);
                return branch_44d39e4d2e186b48(l,data,state,prod,128);
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if(((((((((((((((/*[if]*/cmpr_set(l,data,143,2,2)||/*[match]*/cmpr_set(l,data,67,5,5))||/*[break]*/cmpr_set(l,data,72,5,5))||/*[return]*/cmpr_set(l,data,77,6,6))||/*[continue]*/cmpr_set(l,data,39,8,8))||/*[loop]*/cmpr_set(l,data,63,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[==]*/cmpr_set(l,data,7,2,2))||dt_bcea2102060eab13(l,data))||/*[true]*/cmpr_set(l,data,95,4,4))||/*[null]*/cmpr_set(l,data,35,4,4))||dt_6ae31dd85a62ef5c(l,data))||assert_ascii(l,0x0,0x194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
                pushFN(data,branch_2392b7b3a01e4cef);
                return branch_60927a7f49a5a57b(l,data,state,prod,128);
            }
        }
    }
    return -1;
    /*e672b6e7092fdea4cf05de6f51c34b4d*/
}
function branch_e6dd069d66fdbfd2(l,data,state,prod,puid){
    add_reduce(state,data,2,68);
    /*[39]*/
    return 39;
    /*e6dd069d66fdbfd2f6d6faed4eafd1bc*/
}
function branch_e724ae03a0b81049(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*100:297 def$string_value_group_071_112=>• θid*/
    puid |=2;
    consume(l,data,state);
    /*[100]*/
    return prod;
    return -1;
    /*e724ae03a0b81049b5e8d2004c90df2e*/
}
function branch_e810bf88c11bf1f7(l,data,state,prod,puid){
    /*[116]*/
    return prod;
    /*e810bf88c11bf1f7840736349af4b5e8*/
}
function branch_e8975322cbc36b12(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*31:101 loop_expression=>loop ( parameters ; expression ; • ) expression*/
    puid |=128;
    consume(l,data,state);
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=4;
    pushFN(data,branch_3adb2cd1ecf94854);
    pushFN(data,$expression);
    return puid;
    return -1;
    /*e8975322cbc36b127e3539bf19115f39*/
}
function branch_e9281085d0f15e09(l,data,state,prod,puid){
    add_reduce(state,data,8,54);
    /*[31]*/
    return prod;
    /*e9281085d0f15e0915d560fc55771e4f*/
}
function branch_e988f810b13d5747(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*72:218 template=><<-- • -->>*/
    puid |=4;
    consume(l,data,state);
    add_reduce(state,data,2,0);
    /*[72]*/
    return prod;
    return -1;
    /*e988f810b13d5747bcc09872aad66c22*/
}
function branch_ea2d14a513934484(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    /*71:214 comment=>• // comment_HC_listbody1_132 comment_group_0143_133*/
    puid |=8;
    consume(l,data,state);
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=16;
    pushFN(data,branch_001daf9c0d47d623);
    pushFN(data,$comment_HC_listbody1_132);
    return puid;
    return -1;
    /*ea2d14a5139344847a7c96149f7e98a0*/
}
function branch_ea77dbdfd41fc3f4(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*101:305 def$string_value_group_172_113=>• \ def$string_value_group_071_112*/
    puid |=16;
    consume(l,data,state);
    skip_db1786a8af54d666(l/*[ 71 ]*/,data,state);
    puid |=32;
    pushFN(data,branch_cbfe724e4e447837);
    pushFN(data,$def$string_value_group_071_112);
    return puid;
    return -1;
    /*ea77dbdfd41fc3f46f89e7258737be25*/
}
function branch_eaa5246efb1f8163(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
    /*37:116 member_expression=>member_expression • [ expression ]*/
    puid |=8;
    consume(l,data,state);
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=16;
    pushFN(data,branch_ad1ea6e91f9a5850);
    pushFN(data,$expression);
    return puid;
    return -1;
    /*eaa5246efb1f81639680141f667a0d87*/
}
function branch_eac0bc336efecb18(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=16;
    pushFN(data,branch_fdb237871e61c2a7);
    pushFN(data,$type_group_097_124);
    return puid;
    return -1;
    /*eac0bc336efecb18c8c67cd2f4c3c331*/
}
function branch_ebcd0697220bc3cf(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*48:137 identifier_token=>identifier_token_group_074_117 identifier_token_HC_listbody1_118 • identifier_token_group_079_119*/
    puid |=4;
    pushFN(data,branch_076850827979972c);
    pushFN(data,$identifier_token_group_079_119);
    return puid;
    return -1;
    /*ebcd0697220bc3cfb243992d0572584b*/
}
function branch_ebdd61da7282b4bb(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*107:320 def$identifier_symbols=>def$identifier_symbols • _*/
    puid |=4;
    consume(l,data,state);
    add_reduce(state,data,2,87);
    /*[107]*/
    return prod;
    return -1;
    /*ebdd61da7282b4bbbf859d8b319c6842*/
}
function branch_ec09ac0061673a0c(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*31:103 loop_expression=>loop ( ; expression ; • ) expression*/
    puid |=128;
    consume(l,data,state);
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=4;
    pushFN(data,branch_1cb932d4add48d2f);
    pushFN(data,$expression);
    return puid;
    return -1;
    /*ec09ac0061673a0cf3e76ad03a33938b*/
}
function branch_ec11fc60d4fcc2e0(l,data,state,prod,puid){
    add_reduce(state,data,2,0);
    /*[86]*/
    return prod;
    /*ec11fc60d4fcc2e0c79950072ce43970*/
}
function branch_ec2b5f4221092348(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*57:172 string_group_0111_125=>• θsym*/
    puid |=8;
    consume(l,data,state);
    /*[57]*/
    return prod;
    return -1;
    /*ec2b5f4221092348181979c30ebc33d4*/
}
function branch_ec379f19573cea01(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*48:138 identifier_token=>identifier_token_group_074_117 • identifier_token_group_079_119*/
    puid |=4;
    pushFN(data,branch_77021102c0ebad84);
    pushFN(data,$identifier_token_group_079_119);
    return puid;
    return -1;
    /*ec379f19573cea018570532b98ab0720*/
}
function branch_eca1b2fa9939e9a9(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$statements_goto);
    return 43;
    /*eca1b2fa9939e9a954e1572f236f688a*/
}
function branch_ecc42e37bd51afdc(l,data,state,prod,puid){
    add_reduce(state,data,7,58);
    /*[31]*/
    return prod;
    /*ecc42e37bd51afdc7186ada656c8e845*/
}
function branch_ed882407141495fd(l,data,state,prod,puid){
    /*11:24 class=>modifier_list cls identifier class_group_113_103 • { class_HC_listbody1_105 }
    11:27 class=>modifier_list cls identifier class_group_113_103 • { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==123/*[{]*/){
        consume(l,data,state);
        puid |=16;
        /*11:24 class=>modifier_list cls identifier class_group_113_103 { • class_HC_listbody1_105 }
        11:27 class=>modifier_list cls identifier class_group_113_103 { • }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.current_byte==125/*[}]*/){
            pushFN(data,branch_0a5b9c282ee399c8);
            return branch_3f1d54319119cb30(l,data,state,prod,16);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if(((/*[str]*/cmpr_set(l,data,47,3,3)||/*[fn]*/cmpr_set(l,data,144,2,2))||assert_ascii(l,0x0,0x10,0x88000000,0x0))||l.isUniID(data)){
            pushFN(data,branch_0a5b9c282ee399c8);
            return branch_309c5df4432cbec2(l,data,state,prod,16);
        }
    }
    return -1;
    /*ed882407141495fd3ed8a4b40207dbca*/
}
function branch_ed9ab7b2c8fd3ab4(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*36:114 call_expression=>member_expression ( • )*/
    puid |=8;
    consume(l,data,state);
    add_reduce(state,data,3,64);
    /*[36]*/
    return prod;
    return -1;
    /*ed9ab7b2c8fd3ab4d9418360dc22cf76*/
}
function branch_eddeb0387459255d(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*77:233 def$hex_digit=>• τc*/
    puid |=8;
    consume(l,data,state);
    /*[77]*/
    return prod;
    return -1;
    /*eddeb0387459255d1ef62c28a51345d0*/
}
function branch_ee07032c1218f694(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=4;
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        add_reduce(state,data,3,37);
        /*[29]*/
        return prod;
    }
    return -1;
    /*ee07032c1218f6940422762672479b62*/
}
function branch_ef126c2dad667aa6(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*111:330 virtual-101:8:1|--lvl:0=>( parameters ; expression ; • ) expression*/
    puid |=128;
    consume(l,data,state);
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=4;
    pushFN(data,branch_61ac8beb3d7a0fc1);
    pushFN(data,$expression);
    return puid;
    return -1;
    /*ef126c2dad667aa65c1180416ceac89b*/
}
function branch_ef2dc6f8b6dc9a12(l,data,state,prod,puid){
    pushFN(data,$expression_goto);
    return 72;
    /*ef2dc6f8b6dc9a12a0d2e861dcf58334*/
}
function branch_f0133d64f87a5b0d(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*50:143 modifier_list=>• [ modifier_list_HC_listbody1_120 ]*/
    puid |=1;
    pushFN(data,branch_1f9ddf3c27180aa0);
    pushFN(data,$modifier_list);
    return puid;
    return -1;
    /*f0133d64f87a5b0d238ca8c4c2b02cc5*/
}
function branch_f068cad16e805a7e(l,data,state,prod,puid){
    /*-------------INDIRECT-------------------*/
    pushFN(data,$class_HC_listbody1_105_goto);
    return 10;
    /*f068cad16e805a7ee11939b83d3f2c58*/
}
function branch_f068dbf20a6c2fc7(l,data,state,prod,puid){
    /*14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
    14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
    14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
    14:50 function_expression=>modifier_list • fn : type ( ) { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(/*[fn]*/cmpr_set(l,data,144,2,2)){
        consume(l,data,state);
        puid |=2;
        /*14:44 function_expression=>modifier_list fn • : type ( parameters ) { expression_statements }
        14:46 function_expression=>modifier_list fn • : type ( ) { expression_statements }
        14:47 function_expression=>modifier_list fn • : type ( parameters ) { }
        14:50 function_expression=>modifier_list fn • : type ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if(l.current_byte==58/*[:]*/){
            consume(l,data,state);
            puid |=4;
            /*14:44 function_expression=>modifier_list fn : • type ( parameters ) { expression_statements }
            14:46 function_expression=>modifier_list fn : • type ( ) { expression_statements }
            14:47 function_expression=>modifier_list fn : • type ( parameters ) { }
            14:50 function_expression=>modifier_list fn : • type ( ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            pushFN(data,branch_054c896f3ff6ceda);
            pushFN(data,$type);
            puid |=8;
            return puid;
        }
    }
    return -1;
    /*f068dbf20a6c2fc72f2f929e6efd2786*/
}
function branch_f18f4305a86a598a(l,data,state,prod,puid){
    /*108:327 virtual-117:1:1|--lvl:0=>•
    109:328 virtual-126:4:1|--lvl:0=>• : type primitive_declaration_group_169_116
    110:329 virtual-128:3:1|--lvl:0=>• : type*/
    switch(sym_map_9fff07fe93fb5f87(l,data)){
        case 0:
            /*109:328 virtual-126:4:1|--lvl:0=>• : type primitive_declaration_group_169_116
            110:329 virtual-128:3:1|--lvl:0=>• : type*/
            var pk = l.copy();
            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,0);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if(((((/*[uint]*/cmpr_set(pk,data,83,4,4)||/*[int]*/cmpr_set(pk,data,84,3,3))||/*[flt]*/cmpr_set(pk,data,125,3,3))||dt_1e3f2d5b696b270e(pk,data))||assert_ascii(pk,0x0,0x10,0x80000000,0x200240))||pk.isUniID(data)){
                /*109:328 virtual-126:4:1|--lvl:0=>• : type primitive_declaration_group_169_116
                110:329 virtual-128:3:1|--lvl:0=>• : type*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l,data,state);
                puid |=4;
                /*109:328 virtual-126:4:1|--lvl:0=>: • type primitive_declaration_group_169_116
                110:329 virtual-128:3:1|--lvl:0=>: • type*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                pushFN(data,branch_6cff2b8305c085c0);
                pushFN(data,$type);
                puid |=8;
                return puid;
            }
        default:
        case 1:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*108:327 virtual-117:1:1|--lvl:0=>•*/
            /*[108]*/
            add_reduce(state,data,1,67);
            /*[37]*/
            pushFN(data,$expression_statements_group_023_108_goto);
            return 37;
    }
    return -1;
    /*f18f4305a86a598a7eb2cb73f6346bad*/
}
function branch_f1b14c28a5ec39ac(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*44:129 identifier=>• tk:identifier_token*/
    puid |=1;
    pushFN(data,branch_1f9ddf3c27180aa0);
    pushFN(data,$identifier);
    return puid;
    return -1;
    /*f1b14c28a5ec39ac9078e6f30465863b*/
}
function branch_f25e17acd1a4c826(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*56:163 value=>• num*/
    puid |=1;
    pushFN(data,branch_f989d5104c30708e);
    pushFN(data,$num);
    return puid;
    return -1;
    /*f25e17acd1a4c8260a957758b89b6938*/
}
function branch_f269923af5297955(l,data,state,prod,puid){
    /*14:45 function_expression=>fn : type • ( parameters ) { expression_statements }
    14:48 function_expression=>fn : type • ( ) { expression_statements }
    14:49 function_expression=>fn : type • ( parameters ) { }
    14:51 function_expression=>fn : type • ( ) { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==40/*[(]*/){
        consume(l,data,state);
        puid |=16;
        /*14:45 function_expression=>fn : type ( • parameters ) { expression_statements }
        14:49 function_expression=>fn : type ( • parameters ) { }
        14:48 function_expression=>fn : type ( • ) { expression_statements }
        14:51 function_expression=>fn : type ( • ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(l.current_byte==41/*[)]*/){
            /*14:48 function_expression=>fn : type ( • ) { expression_statements }
            14:51 function_expression=>fn : type ( • ) { }*/
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            puid |=64;
            /*14:48 function_expression=>fn : type ( ) • { expression_statements }
            14:51 function_expression=>fn : type ( ) • { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if(l.current_byte==123/*[{]*/){
                consume(l,data,state);
                puid |=128;
                /*14:48 function_expression=>fn : type ( ) { • expression_statements }
                14:51 function_expression=>fn : type ( ) { • }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if(l.current_byte==125/*[}]*/){
                    pushFN(data,branch_c3b494f09f364853);
                    return branch_62e92fbdf74aad60(l,data,state,prod,128);
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if(((((((((((((((/*[if]*/cmpr_set(l,data,143,2,2)||/*[match]*/cmpr_set(l,data,67,5,5))||/*[break]*/cmpr_set(l,data,72,5,5))||/*[return]*/cmpr_set(l,data,77,6,6))||/*[continue]*/cmpr_set(l,data,39,8,8))||/*[loop]*/cmpr_set(l,data,63,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[==]*/cmpr_set(l,data,7,2,2))||dt_bcea2102060eab13(l,data))||/*[true]*/cmpr_set(l,data,95,4,4))||/*[null]*/cmpr_set(l,data,35,4,4))||dt_6ae31dd85a62ef5c(l,data))||assert_ascii(l,0x0,0x194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
                    pushFN(data,branch_c3b494f09f364853);
                    return branch_155449b593c9e03d(l,data,state,prod,128);
                }
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if(assert_ascii(l,0x0,0x10,0x88000000,0x0)||l.isUniID(data)){
            /*14:45 function_expression=>fn : type ( • parameters ) { expression_statements }
            14:49 function_expression=>fn : type ( • parameters ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            pushFN(data,branch_87acff1332a9df27);
            pushFN(data,$parameters);
            puid |=32;
            return puid;
        }
    }
    return -1;
    /*f269923af529795529e620337723d24c*/
}
function branch_f2a28a6d01733506(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=128;
    if((l.current_byte==41/*[)]*/)&&consume(l,data,state)){
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        puid |=4;
        pushFN(data,branch_4c79766ca3411d9f);
        pushFN(data,$expression);
        return puid;
    }
    return -1;
    /*f2a28a6d01733506cef41631df398a72*/
}
function branch_f32b95de568955a1(l,data,state,prod,puid){
    /*48:137 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118 identifier_token_group_079_119
    48:139 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118
    48:140 identifier_token=>identifier_token_group_074_117 •
    48:138 identifier_token=>identifier_token_group_074_117 • identifier_token_group_079_119*/
    skip_db1786a8af54d666(l/*[ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(l.isUniID(data)){
        /*48:137 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118 identifier_token_group_079_119
        48:139 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118
        48:140 identifier_token=>identifier_token_group_074_117 •*/
        var pk = l.copy();
        skip_db1786a8af54d666(pk.next(data)/*[ 71 ]*/,data,0);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if(nocap_b2eb52235ee30b8a(pk)/*[ws] [nl]*/){
            /*48:137 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118 identifier_token_group_079_119
            48:139 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            pushFN(data,branch_2f0ee969552d9363);
            pushFN(data,$identifier_token_HC_listbody1_118);
            puid |=2;
            return puid;
            /*⤋⤋⤋ peek-unresolved ⤋⤋⤋*/
        } else if(((((((dt_dc6530084293e429(pk,data)||/*[str]*/cmpr_set(pk,data,47,3,3))||/*[fn]*/cmpr_set(pk,data,144,2,2))||/*[==]*/cmpr_set(pk,data,7,2,2))||/*[else]*/cmpr_set(pk,data,128,4,4))||assert_ascii(pk,0x0,0x2c005310,0xa8000000,0x28000000))||pk.isUniID(data))||pk.isSym(true,data)){
            /*-------------VPROD-------------------------*/
            /*48:137 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118 identifier_token_group_079_119
            48:139 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118*/
            pushFN(data,branch_9a8b6249e01fc24c);
            return 0;
        }
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/){
        pushFN(data,branch_73df4fa2a9e9bee1);
        return branch_ec379f19573cea01(l,data,state,prod,1);
        /*⤋⤋⤋ peek-unresolved ⤋⤋⤋*/
    } else if((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/)){
        /*-------------VPROD-------------------------*/
        /*48:137 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118 identifier_token_group_079_119
        48:139 identifier_token=>identifier_token_group_074_117 • identifier_token_HC_listbody1_118*/
        pushFN(data,branch_a0647a95e40570a9);
        return 0;
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*48:140 identifier_token=>identifier_token_group_074_117 •*/
        /*[48]*/
        return 48;
    }
    return -1;
    /*f32b95de568955a1324d3c9ef1694e2d*/
}
function branch_f367f74f171b1875(l,data,state,prod,puid){
    add_reduce(state,data,2,2);
    /*[3]*/
    return prod;
    /*f367f74f171b18750869582b04364411*/
}
function branch_f39324a528fa60e6(l,data,state,prod,puid){
    /*13:36 function=>modifier_list fn identifier : type ( parameters • ) { expression_statements }
    13:39 function=>modifier_list fn identifier : type ( parameters • ) { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==41/*[)]*/){
        consume(l,data,state);
        puid |=128;
        /*13:36 function=>modifier_list fn identifier : type ( parameters ) • { expression_statements }
        13:39 function=>modifier_list fn identifier : type ( parameters ) • { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if(l.current_byte==123/*[{]*/){
            consume(l,data,state);
            puid |=256;
            /*13:36 function=>modifier_list fn identifier : type ( parameters ) { • expression_statements }
            13:39 function=>modifier_list fn identifier : type ( parameters ) { • }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if(l.current_byte==125/*[}]*/){
                pushFN(data,branch_cbc044c8c9b81bf7);
                return branch_7abe37b49929c439(l,data,state,prod,256);
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if(((((((((((((((/*[if]*/cmpr_set(l,data,143,2,2)||/*[match]*/cmpr_set(l,data,67,5,5))||/*[break]*/cmpr_set(l,data,72,5,5))||/*[return]*/cmpr_set(l,data,77,6,6))||/*[continue]*/cmpr_set(l,data,39,8,8))||/*[loop]*/cmpr_set(l,data,63,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[==]*/cmpr_set(l,data,7,2,2))||dt_bcea2102060eab13(l,data))||/*[true]*/cmpr_set(l,data,95,4,4))||/*[null]*/cmpr_set(l,data,35,4,4))||dt_6ae31dd85a62ef5c(l,data))||assert_ascii(l,0x0,0x194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
                pushFN(data,branch_cbc044c8c9b81bf7);
                return branch_3fa42f1010d68298(l,data,state,prod,256);
            }
        }
    }
    return -1;
    /*f39324a528fa60e665cf6c88cd4026d0*/
}
function branch_f43a4858a4c5560c(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*83:249 def$scientific_token_group_228_102=>def$scientific_token_group_027_101 • - θnum*/
    puid |=2;
    consume(l,data,state);
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=4;
    if(l.isNum(data)&&consume(l,data,state)){
        add_reduce(state,data,3,0);
        /*[83]*/
        return prod;
    }
    return -1;
    /*f43a4858a4c5560c413efac8ce3c3b81*/
}
function branch_f49a61a0b0ce7aab(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*117:336 virtual-330:7:1|--lvl:1=>parameters ; expression ; • ) expression*/
    puid |=128;
    consume(l,data,state);
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=4;
    pushFN(data,branch_a146d1d770af3dab);
    pushFN(data,$expression);
    return puid;
    return -1;
    /*f49a61a0b0ce7aab94f08d0e510dcaa4*/
}
function branch_f4c3b3ae016b2f8c(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*101:302 def$string_value_group_172_113=>• θid*/
    puid |=2;
    consume(l,data,state);
    /*[101]*/
    return prod;
    return -1;
    /*f4c3b3ae016b2f8c373229213e4b20cf*/
}
function branch_f561d50216546003(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=8;
    if((l.current_byte==59/*[;]*/)&&consume(l,data,state)){
        add_reduce(state,data,2,4);
        /*[4]*/
        return prod;
    }
    return -1;
    /*f561d5021654600366c3cbf6c93e1f47*/
}
function branch_f56e73d66e0b95bd(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*9:20 class_group_016_104=>• primitive_declaration*/
    puid |=2;
    pushFN(data,branch_12a689fd4ff74029);
    pushFN(data,$primitive_declaration);
    return puid;
    return -1;
    /*f56e73d66e0b95bd065c15eeadca91fe*/
}
function branch_f586fa0da1151edb(l,data,state,prod,puid){
    /*43:125 primitive_declaration=>modifier_list identifier : type • primitive_declaration_group_169_116
    43:127 primitive_declaration=>modifier_list identifier : type •*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        pushFN(data,branch_28ed74bf96b1a974);
        return branch_4db7765786d1a76d(l,data,state,prod,8);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*43:127 primitive_declaration=>modifier_list identifier : type •*/
        add_reduce(state,data,4,75);
        /*[43]*/
        /*-------------INDIRECT-------------------*/
        add_reduce(state,data,1,3);
        pushFN(data,$expression_statements_goto);
        return 20;
    }
    return -1;
    /*f586fa0da1151edb6c9b6b2838670704*/
}
function branch_f5a96a0bed604d7d(l,data,state,prod,puid){
    add_reduce(state,data,1,3);
    /*[49]*/
    pushFN(data,$modifier_list_HC_listbody1_120_goto);
    return 49;
    /*f5a96a0bed604d7ded9d516c9c6e407d*/
}
function branch_f74c3bed1eecf572(l,data,state,prod,puid){
    return 47;
    /*f74c3bed1eecf572eea36f92e58e88d8*/
}
function branch_f88a7c2c1769b4e9(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*52:149 type_group_091_122=>• 16*/
    puid |=2;
    consume(l,data,state);
    /*[52]*/
    return prod;
    return -1;
    /*f88a7c2c1769b4e9b5cab06b451df4f7*/
}
function branch_f8e019e50fc2f915(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*68:208 comment_HC_listbody1_131=>comment_HC_listbody1_131 • comment_group_0138_130*/
    puid |=2;
    pushFN(data,branch_092f1a91216dbe81);
    pushFN(data,$comment_group_0138_130);
    return puid;
    return -1;
    /*f8e019e50fc2f9158e1e622079bba5ae*/
}
function branch_f989d5104c30708e(l,data,state,prod,puid){
    add_reduce(state,data,1,81);
    /*[56]*/
    return prod;
    /*f989d5104c30708e6e3e3b11949c4085*/
}
function branch_fa9d7870a6207cd9(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*49:141 modifier_list_HC_listbody1_120=>modifier_list_HC_listbody1_120 • modifier*/
    puid |=2;
    pushFN(data,branch_44826ab9ae94eaaa);
    pushFN(data,$modifier);
    return puid;
    return -1;
    /*fa9d7870a6207cd9ddf424797fbd6147*/
}
function branch_faddd047c41de2c5(l,data,state,prod,puid){
    /*14:44 function_expression=>modifier_list fn : type • ( parameters ) { expression_statements }
    14:46 function_expression=>modifier_list fn : type • ( ) { expression_statements }
    14:47 function_expression=>modifier_list fn : type • ( parameters ) { }
    14:50 function_expression=>modifier_list fn : type • ( ) { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==40/*[(]*/){
        consume(l,data,state);
        puid |=16;
        /*14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
        14:47 function_expression=>modifier_list fn : type ( • parameters ) { }
        14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
        14:50 function_expression=>modifier_list fn : type ( • ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(l.current_byte==41/*[)]*/){
            /*14:46 function_expression=>modifier_list fn : type ( • ) { expression_statements }
            14:50 function_expression=>modifier_list fn : type ( • ) { }*/
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            puid |=64;
            /*14:46 function_expression=>modifier_list fn : type ( ) • { expression_statements }
            14:50 function_expression=>modifier_list fn : type ( ) • { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if(l.current_byte==123/*[{]*/){
                consume(l,data,state);
                puid |=128;
                /*14:46 function_expression=>modifier_list fn : type ( ) { • expression_statements }
                14:50 function_expression=>modifier_list fn : type ( ) { • }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                if(l.current_byte==125/*[}]*/){
                    pushFN(data,branch_2392b7b3a01e4cef);
                    return branch_4f452b9fa5813076(l,data,state,prod,128);
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if(((((((((((((((/*[if]*/cmpr_set(l,data,143,2,2)||/*[match]*/cmpr_set(l,data,67,5,5))||/*[break]*/cmpr_set(l,data,72,5,5))||/*[return]*/cmpr_set(l,data,77,6,6))||/*[continue]*/cmpr_set(l,data,39,8,8))||/*[loop]*/cmpr_set(l,data,63,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[==]*/cmpr_set(l,data,7,2,2))||dt_bcea2102060eab13(l,data))||/*[true]*/cmpr_set(l,data,95,4,4))||/*[null]*/cmpr_set(l,data,35,4,4))||dt_6ae31dd85a62ef5c(l,data))||assert_ascii(l,0x0,0x194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
                    pushFN(data,branch_2392b7b3a01e4cef);
                    return branch_3265a14e2ed4539a(l,data,state,prod,128);
                }
            }
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if(assert_ascii(l,0x0,0x10,0x88000000,0x0)||l.isUniID(data)){
            /*14:44 function_expression=>modifier_list fn : type ( • parameters ) { expression_statements }
            14:47 function_expression=>modifier_list fn : type ( • parameters ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            pushFN(data,branch_e672b6e7092fdea4);
            pushFN(data,$parameters);
            puid |=32;
            return puid;
        }
    }
    return -1;
    /*faddd047c41de2c56df2a3dfe6a5fcca*/
}
function branch_fae99b3998280ff3(l,data,state,prod,puid){
    /*43:126 primitive_declaration=>identifier : type • primitive_declaration_group_169_116
    43:128 primitive_declaration=>identifier : type •*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        pushFN(data,branch_28ed74bf96b1a974);
        return branch_5ebfbb554475da4a(l,data,state,prod,8);
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
    } else {
        /*--LEAF--*/
        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        /*43:128 primitive_declaration=>identifier : type •*/
        add_reduce(state,data,3,76);
        /*[43]*/
        /*-------------INDIRECT-------------------*/
        add_reduce(state,data,1,3);
        pushFN(data,$expression_statements_goto);
        return 20;
    }
    return -1;
    /*fae99b3998280ff3d47e201578e8f348*/
}
function branch_fb6844173b548b18(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*87:258 def$hex_token_group_044_104=>• b*/
    puid |=4;
    consume(l,data,state);
    /*[87]*/
    return prod;
    return -1;
    /*fb6844173b548b18888b1d3db379bf83*/
}
function branch_fc1da5737a8004ee(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*62:184 num_tok=>• def$hex*/
    puid |=2;
    pushFN(data,branch_91f6e30711bde8c4);
    pushFN(data,$def$hex);
    return puid;
    return -1;
    /*fc1da5737a8004eed952c74090bd3703*/
}
function branch_fc3089e8ba238415(l,data,state,prod,puid){
    pushFN(data,$class_group_016_104_goto);
    return 9;
    /*fc3089e8ba238415307d1c965288ff81*/
}
function branch_fc5ae545c07fed0f(l,data,state,prod,puid){
    /*24:78 if_expression=>if expression : expression • if_expression_group_139_110
    24:79 if_expression=>if expression : expression •*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    switch(sym_map_eeb5218ed312146c(l,data)){
        case 0:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
            /*24:78 if_expression=>if expression : expression • if_expression_group_139_110*/
            puid |=8;
            pushFN(data,branch_80915c2dc1b0f8ab);
            pushFN(data,$if_expression_group_139_110);
            return puid;
        default:
        case 1:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*24:79 if_expression=>if expression : expression •*/
            add_reduce(state,data,4,45);
            /*[24]*/
            return 24;
    }
    return -1;
    /*fc5ae545c07fed0f8eeae2be0047cdd9*/
}
function branch_fd0f8a3a8bcb2596(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*100:300 def$string_value_group_071_112=>• θnl*/
    puid |=16;
    consume(l,data,state);
    /*[100]*/
    return prod;
    return -1;
    /*fd0f8a3a8bcb25962e0dc28479f05293*/
}
function branch_fd3c988095ac72a6(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
    /*64:189 operator_HC_listbody1_129=>operator_HC_listbody1_129 • θsym*/
    puid |=2;
    consume(l,data,state);
    add_reduce(state,data,2,87);
    /*[64]*/
    return prod;
    return -1;
    /*fd3c988095ac72a64307c9376e17ee52*/
}
function branch_fd5ee5d7402de31d(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    /*108:327 virtual-191:3:1|--lvl:0=>operator_HC_listbody1_128 • identifier_token_group_079_119*/
    puid |=4;
    pushFN(data,branch_dca1b9a3dd99b59c);
    pushFN(data,$identifier_token_group_079_119);
    return puid;
    return -1;
    /*fd5ee5d7402de31d48fbc23cd4efb2cc*/
}
function branch_fdb237871e61c2a7(l,data,state,prod,puid){
    add_reduce(state,data,2,79);
    /*[55]*/
    return 55;
    /*fdb237871e61c2a7010c479bd6779c6a*/
}
function branch_fe607864e49c5cd0(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=64;
    if((l.current_byte==125/*[}]*/)&&consume(l,data,state)){
        add_reduce(state,data,5,12);
        /*[11]*/
        return prod;
    }
    return -1;
    /*fe607864e49c5cd0108e814e4c7fd309*/
}
function branch_fea8e7c51f5b74ce(l,data,state,prod,puid){
    add_reduce(state,data,3,43);
    /*[22]*/
    /*-------------INDIRECT-------------------*/
    pushFN(data,branch_7eb1981bd29a0a82);
    return 21;
    /*fea8e7c51f5b74ced60f3cecdd6d5540*/
}
function branch_ff30a7070c50665a(l,data,state,prod,puid){
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=32;
    if((l.current_byte==93/*[]]*/)&&consume(l,data,state)){
        add_reduce(state,data,4,66);
        /*[37]*/
        /*-------------INDIRECT-------------------*/
        pushFN(data,$expression_statements_goto);
        return 37;
    }
    return -1;
    /*ff30a7070c50665adc2e28942ead0e6e*/
}
function branch_ff338b2751eb47b5(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    /*72:217 template=><<-- • θnum -->>*/
    puid |=2;
    consume(l,data,state);
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    puid |=4;
    if(/*[-->>]*/cmpr_set(l,data,23,4,4)&&consume(l,data,state)){
        add_reduce(state,data,3,0);
        /*[72]*/
        return prod;
    }
    return -1;
    /*ff338b2751eb47b57e69171e9b508f1d*/
}
function dt_1e3f2d5b696b270e(l,data){
    if(3==compare(data,l.byte_offset +0,47,3)){
        if(3==compare(data,l.byte_offset +3,50,3)){
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
function dt_1f145d506cf02379(l,data){
    if(2==compare(data,l.byte_offset +0,17,2)){
        /*/**/
        l.setToken(TokenSymbol, 2, 2);
        return true;
    } else if(2==compare(data,l.byte_offset +0,112,2)){
        /*//*/
        l.setToken(TokenSymbol, 2, 2);
        return true;
    }
    return false;
}
function dt_6ae31dd85a62ef5c(l,data){
    if(2==compare(data,l.byte_offset +0,27,2)){
        /*0x*/
        l.setToken(TokenSymbol, 2, 2);
        return true;
    } else if(2==compare(data,l.byte_offset +0,114,2)){
        /*0b*/
        l.setToken(TokenSymbol, 2, 2);
        return true;
    } else if(2==compare(data,l.byte_offset +0,137,2)){
        /*0o*/
        l.setToken(TokenSymbol, 2, 2);
        return true;
    } else if(2==compare(data,l.byte_offset +0,139,2)){
        /*0O*/
        l.setToken(TokenSymbol, 2, 2);
        return true;
    }
    return false;
}
function dt_8411d8c5b1c2ec8c(l,data){
    if(2==compare(data,l.byte_offset +0,143,2)){
        /*if*/
        l.setToken(TokenSymbol, 2, 2);
        return true;
    } else if(2==compare(data,l.byte_offset +0,43,2)){
        /*in*/
        l.setToken(TokenSymbol, 2, 2);
        return true;
    }
    return false;
}
function dt_a0570d6d5c8952c6(l,data){
    if(3==compare(data,l.byte_offset +0,134,3)){
        /*pub*/
        l.setToken(TokenSymbol, 3, 3);
        return true;
    } else if(4==compare(data,l.byte_offset +0,99,4)){
        /*priv*/
        l.setToken(TokenSymbol, 4, 4);
        return true;
    }
    return false;
}
function dt_bc3480b75045e0d0(l,data){
    if(2==compare(data,l.byte_offset +0,137,2)){
        /*0o*/
        l.setToken(TokenSymbol, 2, 2);
        return true;
    } else if(2==compare(data,l.byte_offset +0,139,2)){
        /*0O*/
        l.setToken(TokenSymbol, 2, 2);
        return true;
    }
    return false;
}
function dt_bcea2102060eab13(l,data){
    if(2==compare(data,l.byte_offset +0,144,2)){
        /*fn*/
        l.setToken(TokenSymbol, 2, 2);
        return true;
    } else if(5==compare(data,l.byte_offset +0,53,5)){
        /*false*/
        l.setToken(TokenSymbol, 5, 5);
        return true;
    }
    return false;
}
function dt_dc6530084293e429(l,data){
    if(2==compare(data,l.byte_offset +0,141,2)){
        /*is*/
        l.setToken(TokenSymbol, 2, 2);
        return true;
    } else if(2==compare(data,l.byte_offset +0,43,2)){
        /*in*/
        l.setToken(TokenSymbol, 2, 2);
        return true;
    }
    return false;
}
function nocap_108e16629a73e761(l){
    var a = l.token_length;
    var b = l.byte_length;
    if(l.isSP(true,data)){
        l.token_length = a;
        l.byte_length = b;
        return true;
    }
    return false;
}
function nocap_9b1ef04606bbaa09(l){
    var a = l.token_length;
    var b = l.byte_length;
    if(l.isNL()){
        l.token_length = a;
        l.byte_length = b;
        return true;
    }
    return false;
}
function nocap_b2eb52235ee30b8a(l){
    var a = l.token_length;
    var b = l.byte_length;
    if(l.isNL()||l.isSP(true,data)){
        l.token_length = a;
        l.byte_length = b;
        return true;
    }
    return false;
}
function skip_6c02533b5dc0d802(l,data,state){
    const off = l.token_offset;
    while(1){
        if(!(tk_b495469acbac99fd(l,data)||l.isSP(true,data))){
            break;
        }
        l.next(data);
    }
    if(isOutputEnabled(state)){
        add_skip(l,data,l.token_offset - off);
    }
}
function skip_9184d3c96b70653a(l,data,state){
    const off = l.token_offset;
    while(1){
        if(!((tk_b495469acbac99fd(l,data)||l.isNL())||l.isSP(true,data))){
            break;
        }
        l.next(data);
    }
    if(isOutputEnabled(state)){
        add_skip(l,data,l.token_offset - off);
    }
}
function skip_a294e41529bc9275(l,data,state){
    const off = l.token_offset;
    while(1){
        if(!(tk_b495469acbac99fd(l,data)||l.isNL())){
            break;
        }
        l.next(data);
    }
    if(isOutputEnabled(state)){
        add_skip(l,data,l.token_offset - off);
    }
}
function skip_db1786a8af54d666(l,data,state){
    const off = l.token_offset;
    while(1){
        if(!(tk_b495469acbac99fd(l,data))){
            break;
        }
        l.next(data);
    }
    if(isOutputEnabled(state)){
        add_skip(l,data,l.token_offset - off);
    }
}
function sym_map_00f57473245d5924(l,data){
    /*=*/
    if(data.input[l.byte_offset + 0] == 61){
        /*=*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    }
    return -1;
}
function sym_map_1015cbb2bf16c5e8(l,data){
    /*fn : else ) ; ] } , in str [ fn { if match break return continue loop <<-- sym == ( " ' true false null num 0x 0b 0o 0O id _ $ [*/
    if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*fn*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
                /*fn*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if(data.input[l.byte_offset + 1] == 97){
            if(3==compare(data,l.byte_offset +2,55,3)){
                if(l.isDiscrete(data, TokenIdentifier,5)){
                    /*false*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 2;
                }
            }
        }
    } else if(data.input[l.byte_offset + 0] == 58){
        /*:*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 101){
        if(3==compare(data,l.byte_offset +1,129,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*else*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 41){
        /*)*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 59){
        /*;*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 93){
        /*]*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 125){
        /*}*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 44){
        /*,*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 110){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*in*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if(data.input[l.byte_offset + 1] == 102){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*if*/
                l.setToken(TokenSymbol, 2, 2);
                return 2;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 115){
        if(2==compare(data,l.byte_offset +1,48,2)){
            if(l.isDiscrete(data, TokenIdentifier,3)){
                /*str*/
                l.setToken(TokenSymbol, 3, 3);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 91){
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 3;
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 3;
    } else if(data.input[l.byte_offset + 0] == 123){
        /*{*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
    } else if(data.input[l.byte_offset + 0] == 109){
        if(4==compare(data,l.byte_offset +1,68,4)){
            if(l.isDiscrete(data, TokenIdentifier,5)){
                /*match*/
                l.setToken(TokenSymbol, 5, 5);
                return 2;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 98){
        if(4==compare(data,l.byte_offset +1,73,4)){
            if(l.isDiscrete(data, TokenIdentifier,5)){
                /*break*/
                l.setToken(TokenSymbol, 5, 5);
                return 2;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 114){
        if(5==compare(data,l.byte_offset +1,78,5)){
            if(l.isDiscrete(data, TokenIdentifier,6)){
                /*return*/
                l.setToken(TokenSymbol, 6, 6);
                return 2;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 99){
        if(7==compare(data,l.byte_offset +1,40,7)){
            if(l.isDiscrete(data, TokenIdentifier,8)){
                /*continue*/
                l.setToken(TokenSymbol, 8, 8);
                return 2;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 108){
        if(3==compare(data,l.byte_offset +1,64,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*loop*/
                l.setToken(TokenSymbol, 4, 4);
                return 2;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 60){
        if(3==compare(data,l.byte_offset +1,21,3)){
            /*<<--*/
            l.setToken(TokenSymbol, 4, 4);
            return 2;
        }
    } else if(data.input[l.byte_offset + 0] == 61){
        if(data.input[l.byte_offset + 1] == 61){
            /*==*/
            l.setToken(TokenSymbol, 2, 2);
            return 2;
        }
    } else if(data.input[l.byte_offset + 0] == 40){
        /*(*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
    } else if(data.input[l.byte_offset + 0] == 34){
        /*"*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
    } else if(data.input[l.byte_offset + 0] == 39){
        /*'*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
    } else if(data.input[l.byte_offset + 0] == 116){
        if(3==compare(data,l.byte_offset +1,96,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*true*/
                l.setToken(TokenSymbol, 4, 4);
                return 2;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 110){
        if(3==compare(data,l.byte_offset +1,36,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*null*/
                l.setToken(TokenSymbol, 4, 4);
                return 2;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 48){
        if(data.input[l.byte_offset + 1] == 120){
            /*0x*/
            l.setToken(TokenSymbol, 2, 2);
            return 2;
        } else if(data.input[l.byte_offset + 1] == 98){
            /*0b*/
            l.setToken(TokenSymbol, 2, 2);
            return 2;
        } else if(data.input[l.byte_offset + 1] == 111){
            /*0o*/
            l.setToken(TokenSymbol, 2, 2);
            return 2;
        } else if(data.input[l.byte_offset + 1] == 79){
            /*0O*/
            l.setToken(TokenSymbol, 2, 2);
            return 2;
        }
    } else if(data.input[l.byte_offset + 0] == 95){
        /*_*/
        l.setToken(TokenSymbol, 1, 1);
        return 3;
    } else if(data.input[l.byte_offset + 0] == 36){
        /*$*/
        l.setToken(TokenSymbol, 1, 1);
        return 3;
    }
    if(l.isSym(true,data)){
        return 2;
    } else if(l.isNum(data)){
        return 2;
    } else if(l.isUniID(data)){
        return 3;
    }
    return -1;
}
function sym_map_174451ba753fe315(l,data){
    /*] : ; ) else in } , str [ fn if match sym == num 0x 0b 0o 0O " ' true false null <<-- ( break return continue loop { [ id _ $ fn*/
    if(data.input[l.byte_offset + 0] == 93){
        /*]*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 58){
        /*:*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 59){
        /*;*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 41){
        /*)*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 101){
        if(3==compare(data,l.byte_offset +1,129,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*else*/
                l.setToken(TokenSymbol, 4, 4);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 110){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*in*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            }
        } else if(data.input[l.byte_offset + 1] == 102){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*if*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 125){
        /*}*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 44){
        /*,*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 115){
        if(2==compare(data,l.byte_offset +1,48,2)){
            if(l.isDiscrete(data, TokenIdentifier,3)){
                /*str*/
                l.setToken(TokenSymbol, 3, 3);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 91){
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*fn*/
                l.setToken(TokenSymbol, 2, 2);
                return 2;
                /*fn*/
                l.setToken(TokenSymbol, 2, 2);
                return 2;
            }
        } else if(data.input[l.byte_offset + 1] == 97){
            if(3==compare(data,l.byte_offset +2,55,3)){
                if(l.isDiscrete(data, TokenIdentifier,5)){
                    /*false*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 1;
                }
            }
        }
    } else if(data.input[l.byte_offset + 0] == 109){
        if(4==compare(data,l.byte_offset +1,68,4)){
            if(l.isDiscrete(data, TokenIdentifier,5)){
                /*match*/
                l.setToken(TokenSymbol, 5, 5);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 61){
        if(data.input[l.byte_offset + 1] == 61){
            /*==*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 48){
        if(data.input[l.byte_offset + 1] == 120){
            /*0x*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        } else if(data.input[l.byte_offset + 1] == 98){
            /*0b*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        } else if(data.input[l.byte_offset + 1] == 111){
            /*0o*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        } else if(data.input[l.byte_offset + 1] == 79){
            /*0O*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 34){
        /*"*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 39){
        /*'*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 116){
        if(3==compare(data,l.byte_offset +1,96,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*true*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 110){
        if(3==compare(data,l.byte_offset +1,36,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*null*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 60){
        if(3==compare(data,l.byte_offset +1,21,3)){
            /*<<--*/
            l.setToken(TokenSymbol, 4, 4);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 40){
        /*(*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 98){
        if(4==compare(data,l.byte_offset +1,73,4)){
            if(l.isDiscrete(data, TokenIdentifier,5)){
                /*break*/
                l.setToken(TokenSymbol, 5, 5);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 114){
        if(5==compare(data,l.byte_offset +1,78,5)){
            if(l.isDiscrete(data, TokenIdentifier,6)){
                /*return*/
                l.setToken(TokenSymbol, 6, 6);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 99){
        if(7==compare(data,l.byte_offset +1,40,7)){
            if(l.isDiscrete(data, TokenIdentifier,8)){
                /*continue*/
                l.setToken(TokenSymbol, 8, 8);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 108){
        if(3==compare(data,l.byte_offset +1,64,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*loop*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 123){
        /*{*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 95){
        /*_*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
    } else if(data.input[l.byte_offset + 0] == 36){
        /*$*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
    }
    if(l.isSym(true,data)){
        return 1;
    } else if(l.isNum(data)){
        return 1;
    } else if(l.isUniID(data)){
        return 2;
    }
    return -1;
}
function sym_map_1a453afd76b3985a(l,data){
    /*f flt*/
    if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 108){
            if(data.input[l.byte_offset + 2] == 116){
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
function sym_map_28592a8cdba54a6c(l,data){
    /*u i uint int f flt string if match fn true false null break return continue loop else in str id _ $ str*/
    if(data.input[l.byte_offset + 0] == 117){
        if(l.isDiscrete(data, TokenIdentifier,1)){
            if(data.input[l.byte_offset + 1] == 105){
                if(2==compare(data,l.byte_offset +2,85,2)){
                    if(l.isDiscrete(data, TokenIdentifier,4)){
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
    } else if(data.input[l.byte_offset + 0] == 105){
        if(l.isDiscrete(data, TokenIdentifier,1)){
            if(data.input[l.byte_offset + 1] == 102){
                if(l.isDiscrete(data, TokenIdentifier,2)){
                    /*if*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 1;
                }
            } else if(data.input[l.byte_offset + 1] == 110){
                if(l.isDiscrete(data, TokenIdentifier,2)){
                    if(data.input[l.byte_offset + 2] == 116){
                        if(l.isDiscrete(data, TokenIdentifier,3)){
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
    } else if(data.input[l.byte_offset + 0] == 102){
        if(l.isDiscrete(data, TokenIdentifier,1)){
            if(data.input[l.byte_offset + 1] == 110){
                if(l.isDiscrete(data, TokenIdentifier,2)){
                    /*fn*/
                    l.setToken(TokenSymbol, 2, 2);
                    return 1;
                }
            } else if(data.input[l.byte_offset + 1] == 108){
                if(data.input[l.byte_offset + 2] == 116){
                    if(l.isDiscrete(data, TokenIdentifier,3)){
                        /*flt*/
                        l.setToken(TokenSymbol, 3, 3);
                        return 0;
                    }
                }
            } else if(data.input[l.byte_offset + 1] == 97){
                if(3==compare(data,l.byte_offset +2,55,3)){
                    if(l.isDiscrete(data, TokenIdentifier,5)){
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
    } else if(data.input[l.byte_offset + 0] == 115){
        if(data.input[l.byte_offset + 1] == 116){
            if(data.input[l.byte_offset + 2] == 114){
                if(l.isDiscrete(data, TokenIdentifier,3)){
                    if(data.input[l.byte_offset + 3] == 105){
                        if(2==compare(data,l.byte_offset +4,51,2)){
                            if(l.isDiscrete(data, TokenIdentifier,6)){
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
    } else if(data.input[l.byte_offset + 0] == 109){
        if(4==compare(data,l.byte_offset +1,68,4)){
            if(l.isDiscrete(data, TokenIdentifier,5)){
                /*match*/
                l.setToken(TokenSymbol, 5, 5);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 116){
        if(3==compare(data,l.byte_offset +1,96,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*true*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 110){
        if(3==compare(data,l.byte_offset +1,36,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*null*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 98){
        if(4==compare(data,l.byte_offset +1,73,4)){
            if(l.isDiscrete(data, TokenIdentifier,5)){
                /*break*/
                l.setToken(TokenSymbol, 5, 5);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 114){
        if(5==compare(data,l.byte_offset +1,78,5)){
            if(l.isDiscrete(data, TokenIdentifier,6)){
                /*return*/
                l.setToken(TokenSymbol, 6, 6);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 99){
        if(7==compare(data,l.byte_offset +1,40,7)){
            if(l.isDiscrete(data, TokenIdentifier,8)){
                /*continue*/
                l.setToken(TokenSymbol, 8, 8);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 108){
        if(3==compare(data,l.byte_offset +1,64,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*loop*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 101){
        if(3==compare(data,l.byte_offset +1,129,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*else*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 95){
        /*_*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
    } else if(data.input[l.byte_offset + 0] == 36){
        /*$*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
    }
    if(l.isUniID(data)){
        return 2;
    }
    return -1;
}
function sym_map_2a63be30b8838971(l,data){
    /*} ; END_OF_FILE id _ $ if match sym == [ fn num 0x 0b 0o 0O " ' true false null <<-- ( break return continue loop {*/
    if(data.input[l.byte_offset + 0] == 125){
        /*}*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 59){
        /*;*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 95){
        /*_*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 36){
        /*$*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 102){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*if*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 109){
        if(4==compare(data,l.byte_offset +1,68,4)){
            if(l.isDiscrete(data, TokenIdentifier,5)){
                /*match*/
                l.setToken(TokenSymbol, 5, 5);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 61){
        if(data.input[l.byte_offset + 1] == 61){
            /*==*/
            l.setToken(TokenSymbol, 2, 2);
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 91){
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*fn*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            }
        } else if(data.input[l.byte_offset + 1] == 97){
            if(3==compare(data,l.byte_offset +2,55,3)){
                if(l.isDiscrete(data, TokenIdentifier,5)){
                    /*false*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 0;
                }
            }
        }
    } else if(data.input[l.byte_offset + 0] == 48){
        if(data.input[l.byte_offset + 1] == 120){
            /*0x*/
            l.setToken(TokenSymbol, 2, 2);
            return 0;
        } else if(data.input[l.byte_offset + 1] == 98){
            /*0b*/
            l.setToken(TokenSymbol, 2, 2);
            return 0;
        } else if(data.input[l.byte_offset + 1] == 111){
            /*0o*/
            l.setToken(TokenSymbol, 2, 2);
            return 0;
        } else if(data.input[l.byte_offset + 1] == 79){
            /*0O*/
            l.setToken(TokenSymbol, 2, 2);
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 34){
        /*"*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 39){
        /*'*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 116){
        if(3==compare(data,l.byte_offset +1,96,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*true*/
                l.setToken(TokenSymbol, 4, 4);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 110){
        if(3==compare(data,l.byte_offset +1,36,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*null*/
                l.setToken(TokenSymbol, 4, 4);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 60){
        if(3==compare(data,l.byte_offset +1,21,3)){
            /*<<--*/
            l.setToken(TokenSymbol, 4, 4);
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 40){
        /*(*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 98){
        if(4==compare(data,l.byte_offset +1,73,4)){
            if(l.isDiscrete(data, TokenIdentifier,5)){
                /*break*/
                l.setToken(TokenSymbol, 5, 5);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 114){
        if(5==compare(data,l.byte_offset +1,78,5)){
            if(l.isDiscrete(data, TokenIdentifier,6)){
                /*return*/
                l.setToken(TokenSymbol, 6, 6);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 99){
        if(7==compare(data,l.byte_offset +1,40,7)){
            if(l.isDiscrete(data, TokenIdentifier,8)){
                /*continue*/
                l.setToken(TokenSymbol, 8, 8);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 108){
        if(3==compare(data,l.byte_offset +1,64,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*loop*/
                l.setToken(TokenSymbol, 4, 4);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 123){
        /*{*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    }
    if(l.END(data)){
        return 1;
    } else if(l.isUniID(data)){
        return 0;
    } else if(l.isSym(true,data)){
        return 0;
    } else if(l.isNum(data)){
        return 0;
    }
    return 1;
}
function sym_map_340cc91326eab71f(l,data){
    /*: else ) ; ] } , in str [ fn if match sym == num 0x 0b 0o 0O " ' true false null <<-- ( break return continue loop { [ id _ $ fn*/
    if(data.input[l.byte_offset + 0] == 58){
        /*:*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 101){
        if(3==compare(data,l.byte_offset +1,129,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*else*/
                l.setToken(TokenSymbol, 4, 4);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 41){
        /*)*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 59){
        /*;*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 93){
        /*]*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 125){
        /*}*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 44){
        /*,*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 110){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*in*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            }
        } else if(data.input[l.byte_offset + 1] == 102){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*if*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 115){
        if(2==compare(data,l.byte_offset +1,48,2)){
            if(l.isDiscrete(data, TokenIdentifier,3)){
                /*str*/
                l.setToken(TokenSymbol, 3, 3);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 91){
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*fn*/
                l.setToken(TokenSymbol, 2, 2);
                return 2;
                /*fn*/
                l.setToken(TokenSymbol, 2, 2);
                return 2;
            }
        } else if(data.input[l.byte_offset + 1] == 97){
            if(3==compare(data,l.byte_offset +2,55,3)){
                if(l.isDiscrete(data, TokenIdentifier,5)){
                    /*false*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 1;
                }
            }
        }
    } else if(data.input[l.byte_offset + 0] == 109){
        if(4==compare(data,l.byte_offset +1,68,4)){
            if(l.isDiscrete(data, TokenIdentifier,5)){
                /*match*/
                l.setToken(TokenSymbol, 5, 5);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 61){
        if(data.input[l.byte_offset + 1] == 61){
            /*==*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 48){
        if(data.input[l.byte_offset + 1] == 120){
            /*0x*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        } else if(data.input[l.byte_offset + 1] == 98){
            /*0b*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        } else if(data.input[l.byte_offset + 1] == 111){
            /*0o*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        } else if(data.input[l.byte_offset + 1] == 79){
            /*0O*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 34){
        /*"*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 39){
        /*'*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 116){
        if(3==compare(data,l.byte_offset +1,96,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*true*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 110){
        if(3==compare(data,l.byte_offset +1,36,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*null*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 60){
        if(3==compare(data,l.byte_offset +1,21,3)){
            /*<<--*/
            l.setToken(TokenSymbol, 4, 4);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 40){
        /*(*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 98){
        if(4==compare(data,l.byte_offset +1,73,4)){
            if(l.isDiscrete(data, TokenIdentifier,5)){
                /*break*/
                l.setToken(TokenSymbol, 5, 5);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 114){
        if(5==compare(data,l.byte_offset +1,78,5)){
            if(l.isDiscrete(data, TokenIdentifier,6)){
                /*return*/
                l.setToken(TokenSymbol, 6, 6);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 99){
        if(7==compare(data,l.byte_offset +1,40,7)){
            if(l.isDiscrete(data, TokenIdentifier,8)){
                /*continue*/
                l.setToken(TokenSymbol, 8, 8);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 108){
        if(3==compare(data,l.byte_offset +1,64,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*loop*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 123){
        /*{*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 95){
        /*_*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
    } else if(data.input[l.byte_offset + 0] == 36){
        /*$*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
    }
    if(l.isSym(true,data)){
        return 1;
    } else if(l.isNum(data)){
        return 1;
    } else if(l.isUniID(data)){
        return 2;
    }
    return -1;
}
function sym_map_3f1906a33bff1b18(l,data){
    /*] : ; ) else in } , str [ fn id _ $ if match sym == [ fn num 0x 0b 0o 0O " ' true false null <<-- ( break return continue loop {*/
    if(data.input[l.byte_offset + 0] == 93){
        /*]*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 58){
        /*:*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 59){
        /*;*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 41){
        /*)*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 101){
        if(3==compare(data,l.byte_offset +1,129,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*else*/
                l.setToken(TokenSymbol, 4, 4);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 110){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*in*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            }
        } else if(data.input[l.byte_offset + 1] == 102){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*if*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 125){
        /*}*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 44){
        /*,*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 115){
        if(2==compare(data,l.byte_offset +1,48,2)){
            if(l.isDiscrete(data, TokenIdentifier,3)){
                /*str*/
                l.setToken(TokenSymbol, 3, 3);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 91){
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*fn*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
                /*fn*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if(data.input[l.byte_offset + 1] == 97){
            if(3==compare(data,l.byte_offset +2,55,3)){
                if(l.isDiscrete(data, TokenIdentifier,5)){
                    /*false*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 1;
                }
            }
        }
    } else if(data.input[l.byte_offset + 0] == 95){
        /*_*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 36){
        /*$*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 109){
        if(4==compare(data,l.byte_offset +1,68,4)){
            if(l.isDiscrete(data, TokenIdentifier,5)){
                /*match*/
                l.setToken(TokenSymbol, 5, 5);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 61){
        if(data.input[l.byte_offset + 1] == 61){
            /*==*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 48){
        if(data.input[l.byte_offset + 1] == 120){
            /*0x*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        } else if(data.input[l.byte_offset + 1] == 98){
            /*0b*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        } else if(data.input[l.byte_offset + 1] == 111){
            /*0o*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        } else if(data.input[l.byte_offset + 1] == 79){
            /*0O*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 34){
        /*"*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 39){
        /*'*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 116){
        if(3==compare(data,l.byte_offset +1,96,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*true*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 110){
        if(3==compare(data,l.byte_offset +1,36,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*null*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 60){
        if(3==compare(data,l.byte_offset +1,21,3)){
            /*<<--*/
            l.setToken(TokenSymbol, 4, 4);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 40){
        /*(*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 98){
        if(4==compare(data,l.byte_offset +1,73,4)){
            if(l.isDiscrete(data, TokenIdentifier,5)){
                /*break*/
                l.setToken(TokenSymbol, 5, 5);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 114){
        if(5==compare(data,l.byte_offset +1,78,5)){
            if(l.isDiscrete(data, TokenIdentifier,6)){
                /*return*/
                l.setToken(TokenSymbol, 6, 6);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 99){
        if(7==compare(data,l.byte_offset +1,40,7)){
            if(l.isDiscrete(data, TokenIdentifier,8)){
                /*continue*/
                l.setToken(TokenSymbol, 8, 8);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 108){
        if(3==compare(data,l.byte_offset +1,64,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*loop*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 123){
        /*{*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    }
    if(l.isUniID(data)){
        return 1;
    } else if(l.isSym(true,data)){
        return 1;
    } else if(l.isNum(data)){
        return 1;
    }
    return -1;
}
function sym_map_452608436dcadf92(l,data){
    /*u i uint int*/
    if(data.input[l.byte_offset + 0] == 117){
        if(data.input[l.byte_offset + 1] == 105){
            if(2==compare(data,l.byte_offset +2,85,2)){
                /*uint*/
                l.setToken(TokenSymbol, 4, 4);
                return 2;
            }
        }
        /*u*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 110){
            if(data.input[l.byte_offset + 2] == 116){
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
function sym_map_4854a1a997047714(l,data){
    /*END_OF_FILE is { : = . [ sym == ( ; in ) } , ] else str fn*/
    if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 115){
            /*is*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        } else if(data.input[l.byte_offset + 1] == 110){
            /*in*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 123){
        /*{*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 58){
        /*:*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 61){
        if(data.input[l.byte_offset + 1] == 61){
            /*==*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        }
        /*=*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 46){
        /*.*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 91){
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 40){
        /*(*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 59){
        /*;*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 41){
        /*)*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 125){
        /*}*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 44){
        /*,*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 93){
        /*]*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 101){
        if(3==compare(data,l.byte_offset +1,129,3)){
            /*else*/
            l.setToken(TokenSymbol, 4, 4);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 115){
        if(2==compare(data,l.byte_offset +1,48,2)){
            /*str*/
            l.setToken(TokenSymbol, 3, 3);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            /*fn*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        }
    }
    if(l.END(data)){
        return 1;
    } else if(l.isSym(true,data)){
        return 1;
    }
    return 1;
}
function sym_map_48bb833610b884c3(l,data){
    /*. [ sym == ( in ; } , ) ] else : = str fn END_OF_FILE*/
    if(data.input[l.byte_offset + 0] == 46){
        /*.*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 91){
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 61){
        if(data.input[l.byte_offset + 1] == 61){
            /*==*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        }
        /*=*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 40){
        /*(*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 110){
            /*in*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 59){
        /*;*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 125){
        /*}*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 44){
        /*,*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 41){
        /*)*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 93){
        /*]*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 101){
        if(3==compare(data,l.byte_offset +1,129,3)){
            /*else*/
            l.setToken(TokenSymbol, 4, 4);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 58){
        /*:*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 115){
        if(2==compare(data,l.byte_offset +1,48,2)){
            /*str*/
            l.setToken(TokenSymbol, 3, 3);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            /*fn*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        }
    }
    if(l.isSym(true,data)){
        return 1;
    } else if(l.END(data)){
        return 1;
    }
    return 1;
}
function sym_map_4a712987575743d0(l,data){
    /*sym ==*/
    if(data.input[l.byte_offset + 0] == 61){
        if(data.input[l.byte_offset + 1] == 61){
            /*==*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        }
    }
    if(l.isSym(true,data)){
        return 1;
    }
    return 1;
}
function sym_map_5f25d3b4480e3a7f(l,data){
    /*_ $ if match sym == [ fn num 0x 0b 0o 0O " ' true false null <<-- ( break return continue loop { pub priv export mut imut = in ; } , ) ] == else : [ str fn id*/
    if(data.input[l.byte_offset + 0] == 95){
        /*_*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 36){
        /*$*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 102){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*if*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            }
        } else if(data.input[l.byte_offset + 1] == 110){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*in*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if(data.input[l.byte_offset + 1] == 109){
            if(2==compare(data,l.byte_offset +2,118,2)){
                if(l.isDiscrete(data, TokenIdentifier,4)){
                    /*imut*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 1;
                }
            }
        }
    } else if(data.input[l.byte_offset + 0] == 109){
        if(data.input[l.byte_offset + 1] == 117){
            if(data.input[l.byte_offset + 2] == 116){
                if(l.isDiscrete(data, TokenIdentifier,3)){
                    /*mut*/
                    l.setToken(TokenSymbol, 3, 3);
                    return 1;
                }
            }
        } else if(data.input[l.byte_offset + 1] == 97){
            if(3==compare(data,l.byte_offset +2,69,3)){
                if(l.isDiscrete(data, TokenIdentifier,5)){
                    /*match*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 0;
                }
            }
        }
    } else if(data.input[l.byte_offset + 0] == 61){
        if(data.input[l.byte_offset + 1] == 61){
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
    } else if(data.input[l.byte_offset + 0] == 91){
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*fn*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
                /*fn*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if(data.input[l.byte_offset + 1] == 97){
            if(3==compare(data,l.byte_offset +2,55,3)){
                if(l.isDiscrete(data, TokenIdentifier,5)){
                    /*false*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 0;
                }
            }
        }
    } else if(data.input[l.byte_offset + 0] == 48){
        if(data.input[l.byte_offset + 1] == 120){
            /*0x*/
            l.setToken(TokenSymbol, 2, 2);
            return 0;
        } else if(data.input[l.byte_offset + 1] == 98){
            /*0b*/
            l.setToken(TokenSymbol, 2, 2);
            return 0;
        } else if(data.input[l.byte_offset + 1] == 111){
            /*0o*/
            l.setToken(TokenSymbol, 2, 2);
            return 0;
        } else if(data.input[l.byte_offset + 1] == 79){
            /*0O*/
            l.setToken(TokenSymbol, 2, 2);
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 34){
        /*"*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 39){
        /*'*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 116){
        if(3==compare(data,l.byte_offset +1,96,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*true*/
                l.setToken(TokenSymbol, 4, 4);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 110){
        if(3==compare(data,l.byte_offset +1,36,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*null*/
                l.setToken(TokenSymbol, 4, 4);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 60){
        if(3==compare(data,l.byte_offset +1,21,3)){
            /*<<--*/
            l.setToken(TokenSymbol, 4, 4);
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 40){
        /*(*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 98){
        if(4==compare(data,l.byte_offset +1,73,4)){
            if(l.isDiscrete(data, TokenIdentifier,5)){
                /*break*/
                l.setToken(TokenSymbol, 5, 5);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 114){
        if(5==compare(data,l.byte_offset +1,78,5)){
            if(l.isDiscrete(data, TokenIdentifier,6)){
                /*return*/
                l.setToken(TokenSymbol, 6, 6);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 99){
        if(7==compare(data,l.byte_offset +1,40,7)){
            if(l.isDiscrete(data, TokenIdentifier,8)){
                /*continue*/
                l.setToken(TokenSymbol, 8, 8);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 108){
        if(3==compare(data,l.byte_offset +1,64,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*loop*/
                l.setToken(TokenSymbol, 4, 4);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 123){
        /*{*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 112){
        if(data.input[l.byte_offset + 1] == 117){
            if(data.input[l.byte_offset + 2] == 98){
                if(l.isDiscrete(data, TokenIdentifier,3)){
                    /*pub*/
                    l.setToken(TokenSymbol, 3, 3);
                    return 1;
                }
            }
        } else if(data.input[l.byte_offset + 1] == 114){
            if(2==compare(data,l.byte_offset +2,101,2)){
                if(l.isDiscrete(data, TokenIdentifier,4)){
                    /*priv*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 1;
                }
            }
        }
    } else if(data.input[l.byte_offset + 0] == 101){
        if(data.input[l.byte_offset + 1] == 108){
            if(2==compare(data,l.byte_offset +2,130,2)){
                if(l.isDiscrete(data, TokenIdentifier,4)){
                    /*else*/
                    l.setToken(TokenSymbol, 4, 4);
                    return 1;
                }
            }
        } else if(data.input[l.byte_offset + 1] == 120){
            if(4==compare(data,l.byte_offset +2,59,4)){
                if(l.isDiscrete(data, TokenIdentifier,6)){
                    /*export*/
                    l.setToken(TokenSymbol, 6, 6);
                    return 1;
                }
            }
        }
    } else if(data.input[l.byte_offset + 0] == 59){
        /*;*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 125){
        /*}*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 44){
        /*,*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 41){
        /*)*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 93){
        /*]*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 58){
        /*:*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 115){
        if(2==compare(data,l.byte_offset +1,48,2)){
            if(l.isDiscrete(data, TokenIdentifier,3)){
                /*str*/
                l.setToken(TokenSymbol, 3, 3);
                return 1;
            }
        }
    }
    if(l.isSym(true,data)){
        return 0;
    } else if(l.isNum(data)){
        return 0;
    } else if(l.isUniID(data)){
        return 2;
    }
    return -1;
}
function sym_map_6c16c7754ec41e3b(l,data){
    /*END_OF_FILE ; in ) } , [ str fn*/
    if(data.input[l.byte_offset + 0] == 59){
        /*;*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 110){
            /*in*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 41){
        /*)*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 125){
        /*}*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 44){
        /*,*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 91){
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 115){
        if(2==compare(data,l.byte_offset +1,48,2)){
            /*str*/
            l.setToken(TokenSymbol, 3, 3);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            /*fn*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        }
    }
    if(l.END(data)){
        return 1;
    }
    return 1;
}
function sym_map_71218632d17276c3(l,data){
    /*_ $ [ 0x 0b 0o 0O " ' <<-- ( == { ] : ; ) } , sym*/
    if(data.input[l.byte_offset + 0] == 95){
        /*_*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 36){
        /*$*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 91){
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 48){
        if(data.input[l.byte_offset + 1] == 120){
            /*0x*/
            l.setToken(TokenSymbol, 2, 2);
            return 0;
        } else if(data.input[l.byte_offset + 1] == 98){
            /*0b*/
            l.setToken(TokenSymbol, 2, 2);
            return 0;
        } else if(data.input[l.byte_offset + 1] == 111){
            /*0o*/
            l.setToken(TokenSymbol, 2, 2);
            return 0;
        } else if(data.input[l.byte_offset + 1] == 79){
            /*0O*/
            l.setToken(TokenSymbol, 2, 2);
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 34){
        /*"*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 39){
        /*'*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 60){
        if(3==compare(data,l.byte_offset +1,21,3)){
            /*<<--*/
            l.setToken(TokenSymbol, 4, 4);
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 40){
        /*(*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 61){
        if(data.input[l.byte_offset + 1] == 61){
            /*==*/
            l.setToken(TokenSymbol, 2, 2);
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 123){
        /*{*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 93){
        /*]*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 58){
        /*:*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 59){
        /*;*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 41){
        /*)*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 125){
        /*}*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 44){
        /*,*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    }
    if(l.isSym(true,data)){
        return 1;
    }
    return -1;
}
function sym_map_913e141603679c43(l,data){
    /*: { is ( = in ; } ) , [ str id _ $ fn . sym == else ] END_OF_FILE*/
    if(data.input[l.byte_offset + 0] == 58){
        /*:*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 123){
        /*{*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 115){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*is*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if(data.input[l.byte_offset + 1] == 110){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*in*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 40){
        /*(*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 61){
        if(data.input[l.byte_offset + 1] == 61){
            /*==*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        }
        /*=*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 59){
        /*;*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 125){
        /*}*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 41){
        /*)*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 44){
        /*,*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 91){
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 115){
        if(2==compare(data,l.byte_offset +1,48,2)){
            if(l.isDiscrete(data, TokenIdentifier,3)){
                /*str*/
                l.setToken(TokenSymbol, 3, 3);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 95){
        /*_*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 36){
        /*$*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*fn*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 46){
        /*.*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 101){
        if(3==compare(data,l.byte_offset +1,129,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*else*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 93){
        /*]*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    }
    if(l.isUniID(data)){
        return 1;
    } else if(l.isSym(true,data)){
        return 1;
    } else if(l.END(data)){
        return 1;
    }
    return 1;
}
function sym_map_937c28530cf66b31(l,data){
    /*e E*/
    if(data.input[l.byte_offset + 0] == 101){
        /*e*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 69){
        /*E*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    }
    return -1;
}
function sym_map_957fe013814af5bc(l,data){
    /*str string f flt u i uint int id _ $*/
    if(data.input[l.byte_offset + 0] == 115){
        if(data.input[l.byte_offset + 1] == 116){
            if(data.input[l.byte_offset + 2] == 114){
                if(l.isDiscrete(data, TokenIdentifier,3)){
                    if(data.input[l.byte_offset + 3] == 105){
                        if(2==compare(data,l.byte_offset +4,51,2)){
                            if(l.isDiscrete(data, TokenIdentifier,6)){
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
    } else if(data.input[l.byte_offset + 0] == 102){
        if(l.isDiscrete(data, TokenIdentifier,1)){
            if(data.input[l.byte_offset + 1] == 108){
                if(data.input[l.byte_offset + 2] == 116){
                    if(l.isDiscrete(data, TokenIdentifier,3)){
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
    } else if(data.input[l.byte_offset + 0] == 117){
        if(l.isDiscrete(data, TokenIdentifier,1)){
            if(data.input[l.byte_offset + 1] == 105){
                if(2==compare(data,l.byte_offset +2,85,2)){
                    if(l.isDiscrete(data, TokenIdentifier,4)){
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
    } else if(data.input[l.byte_offset + 0] == 105){
        if(l.isDiscrete(data, TokenIdentifier,1)){
            if(data.input[l.byte_offset + 1] == 110){
                if(data.input[l.byte_offset + 2] == 116){
                    if(l.isDiscrete(data, TokenIdentifier,3)){
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
    } else if(data.input[l.byte_offset + 0] == 95){
        /*_*/
        l.setToken(TokenSymbol, 1, 1);
        return 4;
    } else if(data.input[l.byte_offset + 0] == 36){
        /*$*/
        l.setToken(TokenSymbol, 1, 1);
        return 4;
    }
    if(l.isUniID(data)){
        return 4;
    }
    return -1;
}
function sym_map_9fff07fe93fb5f87(l,data){
    /*:*/
    if(data.input[l.byte_offset + 0] == 58){
        /*:*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    }
    return -1;
}
function sym_map_a18dc5662a85e9f8(l,data){
    /*id _ $ [ fn num 0x 0b 0o 0O " ' true false null <<-- ( if match sym == break return continue loop { ] : ; ) else in } , str END_OF_FILE*/
    if(data.input[l.byte_offset + 0] == 95){
        /*_*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 36){
        /*$*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 91){
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*fn*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if(data.input[l.byte_offset + 1] == 97){
            if(3==compare(data,l.byte_offset +2,55,3)){
                if(l.isDiscrete(data, TokenIdentifier,5)){
                    /*false*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 1;
                }
            }
        }
    } else if(data.input[l.byte_offset + 0] == 48){
        if(data.input[l.byte_offset + 1] == 120){
            /*0x*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        } else if(data.input[l.byte_offset + 1] == 98){
            /*0b*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        } else if(data.input[l.byte_offset + 1] == 111){
            /*0o*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        } else if(data.input[l.byte_offset + 1] == 79){
            /*0O*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 34){
        /*"*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 39){
        /*'*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 116){
        if(3==compare(data,l.byte_offset +1,96,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*true*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 110){
        if(3==compare(data,l.byte_offset +1,36,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*null*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 60){
        if(3==compare(data,l.byte_offset +1,21,3)){
            /*<<--*/
            l.setToken(TokenSymbol, 4, 4);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 40){
        /*(*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 102){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*if*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if(data.input[l.byte_offset + 1] == 110){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*in*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 109){
        if(4==compare(data,l.byte_offset +1,68,4)){
            if(l.isDiscrete(data, TokenIdentifier,5)){
                /*match*/
                l.setToken(TokenSymbol, 5, 5);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 61){
        if(data.input[l.byte_offset + 1] == 61){
            /*==*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 98){
        if(4==compare(data,l.byte_offset +1,73,4)){
            if(l.isDiscrete(data, TokenIdentifier,5)){
                /*break*/
                l.setToken(TokenSymbol, 5, 5);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 114){
        if(5==compare(data,l.byte_offset +1,78,5)){
            if(l.isDiscrete(data, TokenIdentifier,6)){
                /*return*/
                l.setToken(TokenSymbol, 6, 6);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 99){
        if(7==compare(data,l.byte_offset +1,40,7)){
            if(l.isDiscrete(data, TokenIdentifier,8)){
                /*continue*/
                l.setToken(TokenSymbol, 8, 8);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 108){
        if(3==compare(data,l.byte_offset +1,64,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*loop*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 123){
        /*{*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 93){
        /*]*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 58){
        /*:*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 59){
        /*;*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 41){
        /*)*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 101){
        if(3==compare(data,l.byte_offset +1,129,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*else*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 125){
        /*}*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 44){
        /*,*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 115){
        if(2==compare(data,l.byte_offset +1,48,2)){
            if(l.isDiscrete(data, TokenIdentifier,3)){
                /*str*/
                l.setToken(TokenSymbol, 3, 3);
                return 1;
            }
        }
    }
    if(l.isUniID(data)){
        return 1;
    } else if(l.isNum(data)){
        return 1;
    } else if(l.isSym(true,data)){
        return 1;
    } else if(l.END(data)){
        return 1;
    }
    return 1;
}
function sym_map_a6e19c42d2a4699a(l,data){
    /*] : ; ) else in } , [ str id _ $ fn END_OF_FILE sym ==*/
    if(data.input[l.byte_offset + 0] == 93){
        /*]*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 58){
        /*:*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 59){
        /*;*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 41){
        /*)*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 101){
        if(3==compare(data,l.byte_offset +1,129,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*else*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 110){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*in*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 125){
        /*}*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 44){
        /*,*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 91){
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 115){
        if(2==compare(data,l.byte_offset +1,48,2)){
            if(l.isDiscrete(data, TokenIdentifier,3)){
                /*str*/
                l.setToken(TokenSymbol, 3, 3);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 95){
        /*_*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 36){
        /*$*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*fn*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 61){
        if(data.input[l.byte_offset + 1] == 61){
            /*==*/
            l.setToken(TokenSymbol, 2, 2);
            return 0;
        }
    }
    if(l.isUniID(data)){
        return 1;
    } else if(l.END(data)){
        return 1;
    } else if(l.isSym(true,data)){
        return 0;
    }
    return 1;
}
function sym_map_a837a60965d5e452(l,data){
    /*if match sym == fn num 0x 0b 0o 0O " ' true false null <<-- ( break return continue loop { ) id _ $ [*/
    if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 102){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*if*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 109){
        if(4==compare(data,l.byte_offset +1,68,4)){
            if(l.isDiscrete(data, TokenIdentifier,5)){
                /*match*/
                l.setToken(TokenSymbol, 5, 5);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 61){
        if(data.input[l.byte_offset + 1] == 61){
            /*==*/
            l.setToken(TokenSymbol, 2, 2);
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*fn*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            }
        } else if(data.input[l.byte_offset + 1] == 97){
            if(3==compare(data,l.byte_offset +2,55,3)){
                if(l.isDiscrete(data, TokenIdentifier,5)){
                    /*false*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 0;
                }
            }
        }
    } else if(data.input[l.byte_offset + 0] == 48){
        if(data.input[l.byte_offset + 1] == 120){
            /*0x*/
            l.setToken(TokenSymbol, 2, 2);
            return 0;
        } else if(data.input[l.byte_offset + 1] == 98){
            /*0b*/
            l.setToken(TokenSymbol, 2, 2);
            return 0;
        } else if(data.input[l.byte_offset + 1] == 111){
            /*0o*/
            l.setToken(TokenSymbol, 2, 2);
            return 0;
        } else if(data.input[l.byte_offset + 1] == 79){
            /*0O*/
            l.setToken(TokenSymbol, 2, 2);
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 34){
        /*"*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 39){
        /*'*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 116){
        if(3==compare(data,l.byte_offset +1,96,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*true*/
                l.setToken(TokenSymbol, 4, 4);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 110){
        if(3==compare(data,l.byte_offset +1,36,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*null*/
                l.setToken(TokenSymbol, 4, 4);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 60){
        if(3==compare(data,l.byte_offset +1,21,3)){
            /*<<--*/
            l.setToken(TokenSymbol, 4, 4);
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 40){
        /*(*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 98){
        if(4==compare(data,l.byte_offset +1,73,4)){
            if(l.isDiscrete(data, TokenIdentifier,5)){
                /*break*/
                l.setToken(TokenSymbol, 5, 5);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 114){
        if(5==compare(data,l.byte_offset +1,78,5)){
            if(l.isDiscrete(data, TokenIdentifier,6)){
                /*return*/
                l.setToken(TokenSymbol, 6, 6);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 99){
        if(7==compare(data,l.byte_offset +1,40,7)){
            if(l.isDiscrete(data, TokenIdentifier,8)){
                /*continue*/
                l.setToken(TokenSymbol, 8, 8);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 108){
        if(3==compare(data,l.byte_offset +1,64,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*loop*/
                l.setToken(TokenSymbol, 4, 4);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 123){
        /*{*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 41){
        /*)*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 95){
        /*_*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 36){
        /*$*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 91){
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    }
    if(l.isSym(true,data)){
        return 0;
    } else if(l.isNum(data)){
        return 0;
    } else if(l.isUniID(data)){
        return 1;
    }
    return -1;
}
function sym_map_b405ff5da734a5dd(l,data){
    /*e E ws sym == : else ) ; ] } , in [ str id _ $ fn END_OF_FILE*/
    if(data.input[l.byte_offset + 0] == 101){
        if(l.isDiscrete(data, TokenIdentifier,1)){
            if(data.input[l.byte_offset + 1] == 108){
                if(2==compare(data,l.byte_offset +2,130,2)){
                    if(l.isDiscrete(data, TokenIdentifier,4)){
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
    } else if(data.input[l.byte_offset + 0] == 69){
        if(l.isDiscrete(data, TokenIdentifier,1)){
            /*E*/
            l.setToken(TokenSymbol, 1, 1);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 61){
        if(data.input[l.byte_offset + 1] == 61){
            /*==*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 58){
        /*:*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 41){
        /*)*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 59){
        /*;*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 93){
        /*]*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 125){
        /*}*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 44){
        /*,*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 110){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*in*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 91){
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 115){
        if(2==compare(data,l.byte_offset +1,48,2)){
            if(l.isDiscrete(data, TokenIdentifier,3)){
                /*str*/
                l.setToken(TokenSymbol, 3, 3);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 95){
        /*_*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 36){
        /*$*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*fn*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        }
    }
    if(l.isSP(true,data)){
        return 1;
    } else if(l.isSym(true,data)){
        return 1;
    } else if(l.isUniID(data)){
        return 1;
    } else if(l.END(data)){
        return 1;
    }
    return 1;
}
function sym_map_b9a34db74685e187(l,data){
    /*if match sym == fn num 0x 0b 0o 0O " ' true false null <<-- ( break return continue loop { id _ $ [*/
    if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 102){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*if*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 109){
        if(4==compare(data,l.byte_offset +1,68,4)){
            if(l.isDiscrete(data, TokenIdentifier,5)){
                /*match*/
                l.setToken(TokenSymbol, 5, 5);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 61){
        if(data.input[l.byte_offset + 1] == 61){
            /*==*/
            l.setToken(TokenSymbol, 2, 2);
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*fn*/
                l.setToken(TokenSymbol, 2, 2);
                return 0;
            }
        } else if(data.input[l.byte_offset + 1] == 97){
            if(3==compare(data,l.byte_offset +2,55,3)){
                if(l.isDiscrete(data, TokenIdentifier,5)){
                    /*false*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 0;
                }
            }
        }
    } else if(data.input[l.byte_offset + 0] == 48){
        if(data.input[l.byte_offset + 1] == 120){
            /*0x*/
            l.setToken(TokenSymbol, 2, 2);
            return 0;
        } else if(data.input[l.byte_offset + 1] == 98){
            /*0b*/
            l.setToken(TokenSymbol, 2, 2);
            return 0;
        } else if(data.input[l.byte_offset + 1] == 111){
            /*0o*/
            l.setToken(TokenSymbol, 2, 2);
            return 0;
        } else if(data.input[l.byte_offset + 1] == 79){
            /*0O*/
            l.setToken(TokenSymbol, 2, 2);
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 34){
        /*"*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 39){
        /*'*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 116){
        if(3==compare(data,l.byte_offset +1,96,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*true*/
                l.setToken(TokenSymbol, 4, 4);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 110){
        if(3==compare(data,l.byte_offset +1,36,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*null*/
                l.setToken(TokenSymbol, 4, 4);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 60){
        if(3==compare(data,l.byte_offset +1,21,3)){
            /*<<--*/
            l.setToken(TokenSymbol, 4, 4);
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 40){
        /*(*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 98){
        if(4==compare(data,l.byte_offset +1,73,4)){
            if(l.isDiscrete(data, TokenIdentifier,5)){
                /*break*/
                l.setToken(TokenSymbol, 5, 5);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 114){
        if(5==compare(data,l.byte_offset +1,78,5)){
            if(l.isDiscrete(data, TokenIdentifier,6)){
                /*return*/
                l.setToken(TokenSymbol, 6, 6);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 99){
        if(7==compare(data,l.byte_offset +1,40,7)){
            if(l.isDiscrete(data, TokenIdentifier,8)){
                /*continue*/
                l.setToken(TokenSymbol, 8, 8);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 108){
        if(3==compare(data,l.byte_offset +1,64,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*loop*/
                l.setToken(TokenSymbol, 4, 4);
                return 0;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 123){
        /*{*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 95){
        /*_*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 36){
        /*$*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 91){
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    }
    if(l.isSym(true,data)){
        return 0;
    } else if(l.isNum(data)){
        return 0;
    } else if(l.isUniID(data)){
        return 1;
    }
    return -1;
}
function sym_map_c4b3dccaa10a8245(l,data){
    /*<<-- { if match break return continue loop id _ $ sym == [ fn num 0x 0b 0o 0O " ' true false null (*/
    if(data.input[l.byte_offset + 0] == 60){
        if(3==compare(data,l.byte_offset +1,21,3)){
            /*<<--*/
            l.setToken(TokenSymbol, 4, 4);
            return 0;
        }
    } else if(data.input[l.byte_offset + 0] == 123){
        /*{*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 102){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*if*/
                l.setToken(TokenSymbol, 2, 2);
                return 2;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 109){
        if(4==compare(data,l.byte_offset +1,68,4)){
            if(l.isDiscrete(data, TokenIdentifier,5)){
                /*match*/
                l.setToken(TokenSymbol, 5, 5);
                return 3;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 98){
        if(4==compare(data,l.byte_offset +1,73,4)){
            if(l.isDiscrete(data, TokenIdentifier,5)){
                /*break*/
                l.setToken(TokenSymbol, 5, 5);
                return 4;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 114){
        if(5==compare(data,l.byte_offset +1,78,5)){
            if(l.isDiscrete(data, TokenIdentifier,6)){
                /*return*/
                l.setToken(TokenSymbol, 6, 6);
                return 5;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 99){
        if(7==compare(data,l.byte_offset +1,40,7)){
            if(l.isDiscrete(data, TokenIdentifier,8)){
                /*continue*/
                l.setToken(TokenSymbol, 8, 8);
                return 6;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 108){
        if(3==compare(data,l.byte_offset +1,64,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*loop*/
                l.setToken(TokenSymbol, 4, 4);
                return 7;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 95){
        /*_*/
        l.setToken(TokenSymbol, 1, 1);
        return 8;
    } else if(data.input[l.byte_offset + 0] == 36){
        /*$*/
        l.setToken(TokenSymbol, 1, 1);
        return 8;
    } else if(data.input[l.byte_offset + 0] == 61){
        if(data.input[l.byte_offset + 1] == 61){
            /*==*/
            l.setToken(TokenSymbol, 2, 2);
            return 9;
        }
    } else if(data.input[l.byte_offset + 0] == 91){
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 9;
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*fn*/
                l.setToken(TokenSymbol, 2, 2);
                return 9;
            }
        } else if(data.input[l.byte_offset + 1] == 97){
            if(3==compare(data,l.byte_offset +2,55,3)){
                if(l.isDiscrete(data, TokenIdentifier,5)){
                    /*false*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 9;
                }
            }
        }
    } else if(data.input[l.byte_offset + 0] == 48){
        if(data.input[l.byte_offset + 1] == 120){
            /*0x*/
            l.setToken(TokenSymbol, 2, 2);
            return 9;
        } else if(data.input[l.byte_offset + 1] == 98){
            /*0b*/
            l.setToken(TokenSymbol, 2, 2);
            return 9;
        } else if(data.input[l.byte_offset + 1] == 111){
            /*0o*/
            l.setToken(TokenSymbol, 2, 2);
            return 9;
        } else if(data.input[l.byte_offset + 1] == 79){
            /*0O*/
            l.setToken(TokenSymbol, 2, 2);
            return 9;
        }
    } else if(data.input[l.byte_offset + 0] == 34){
        /*"*/
        l.setToken(TokenSymbol, 1, 1);
        return 9;
    } else if(data.input[l.byte_offset + 0] == 39){
        /*'*/
        l.setToken(TokenSymbol, 1, 1);
        return 9;
    } else if(data.input[l.byte_offset + 0] == 116){
        if(3==compare(data,l.byte_offset +1,96,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*true*/
                l.setToken(TokenSymbol, 4, 4);
                return 9;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 110){
        if(3==compare(data,l.byte_offset +1,36,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*null*/
                l.setToken(TokenSymbol, 4, 4);
                return 9;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 40){
        /*(*/
        l.setToken(TokenSymbol, 1, 1);
        return 9;
    }
    if(l.isUniID(data)){
        return 8;
    } else if(l.isSym(true,data)){
        return 9;
    } else if(l.isNum(data)){
        return 9;
    }
    return -1;
}
function sym_map_c82afb129e509311(l,data){
    /*[ . (*/
    if(data.input[l.byte_offset + 0] == 91){
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 46){
        /*.*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 40){
        /*(*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
    }
    return -1;
}
function sym_map_cc1c813b4210953a(l,data){
    /*} ) , ; END_OF_FILE*/
    if(data.input[l.byte_offset + 0] == 125){
        /*}*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 41){
        /*)*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 44){
        /*,*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 59){
        /*;*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    }
    if(l.END(data)){
        return 1;
    }
    return 1;
}
function sym_map_cd68132adf65e929(l,data){
    /*; if match sym == fn num 0x 0b 0o 0O " ' true false null <<-- ( break return continue loop { ) id _ $ [*/
    if(data.input[l.byte_offset + 0] == 59){
        /*;*/
        l.setToken(TokenSymbol, 1, 1);
        return 0;
    } else if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 102){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*if*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 109){
        if(4==compare(data,l.byte_offset +1,68,4)){
            if(l.isDiscrete(data, TokenIdentifier,5)){
                /*match*/
                l.setToken(TokenSymbol, 5, 5);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 61){
        if(data.input[l.byte_offset + 1] == 61){
            /*==*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*fn*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        } else if(data.input[l.byte_offset + 1] == 97){
            if(3==compare(data,l.byte_offset +2,55,3)){
                if(l.isDiscrete(data, TokenIdentifier,5)){
                    /*false*/
                    l.setToken(TokenSymbol, 5, 5);
                    return 1;
                }
            }
        }
    } else if(data.input[l.byte_offset + 0] == 48){
        if(data.input[l.byte_offset + 1] == 120){
            /*0x*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        } else if(data.input[l.byte_offset + 1] == 98){
            /*0b*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        } else if(data.input[l.byte_offset + 1] == 111){
            /*0o*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        } else if(data.input[l.byte_offset + 1] == 79){
            /*0O*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 34){
        /*"*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 39){
        /*'*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 116){
        if(3==compare(data,l.byte_offset +1,96,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*true*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 110){
        if(3==compare(data,l.byte_offset +1,36,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*null*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 60){
        if(3==compare(data,l.byte_offset +1,21,3)){
            /*<<--*/
            l.setToken(TokenSymbol, 4, 4);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 40){
        /*(*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 98){
        if(4==compare(data,l.byte_offset +1,73,4)){
            if(l.isDiscrete(data, TokenIdentifier,5)){
                /*break*/
                l.setToken(TokenSymbol, 5, 5);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 114){
        if(5==compare(data,l.byte_offset +1,78,5)){
            if(l.isDiscrete(data, TokenIdentifier,6)){
                /*return*/
                l.setToken(TokenSymbol, 6, 6);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 99){
        if(7==compare(data,l.byte_offset +1,40,7)){
            if(l.isDiscrete(data, TokenIdentifier,8)){
                /*continue*/
                l.setToken(TokenSymbol, 8, 8);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 108){
        if(3==compare(data,l.byte_offset +1,64,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*loop*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 123){
        /*{*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 41){
        /*)*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 95){
        /*_*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
    } else if(data.input[l.byte_offset + 0] == 36){
        /*$*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
    } else if(data.input[l.byte_offset + 0] == 91){
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
    }
    if(l.isSym(true,data)){
        return 1;
    } else if(l.isNum(data)){
        return 1;
    } else if(l.isUniID(data)){
        return 2;
    }
    return -1;
}
function sym_map_ddb9a19c91b727a9(l,data){
    /*END_OF_FILE [ fn true false null <<-- ( , if match sym == break return continue loop { } ; in ) ] else : str*/
    if(data.input[l.byte_offset + 0] == 91){
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            /*fn*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        } else if(data.input[l.byte_offset + 1] == 97){
            if(3==compare(data,l.byte_offset +2,55,3)){
                /*false*/
                l.setToken(TokenSymbol, 5, 5);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 116){
        if(3==compare(data,l.byte_offset +1,96,3)){
            /*true*/
            l.setToken(TokenSymbol, 4, 4);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 110){
        if(3==compare(data,l.byte_offset +1,36,3)){
            /*null*/
            l.setToken(TokenSymbol, 4, 4);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 60){
        if(3==compare(data,l.byte_offset +1,21,3)){
            /*<<--*/
            l.setToken(TokenSymbol, 4, 4);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 40){
        /*(*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 44){
        /*,*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 102){
            /*if*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        } else if(data.input[l.byte_offset + 1] == 110){
            /*in*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 109){
        if(4==compare(data,l.byte_offset +1,68,4)){
            /*match*/
            l.setToken(TokenSymbol, 5, 5);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 61){
        if(data.input[l.byte_offset + 1] == 61){
            /*==*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 98){
        if(4==compare(data,l.byte_offset +1,73,4)){
            /*break*/
            l.setToken(TokenSymbol, 5, 5);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 114){
        if(5==compare(data,l.byte_offset +1,78,5)){
            /*return*/
            l.setToken(TokenSymbol, 6, 6);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 99){
        if(7==compare(data,l.byte_offset +1,40,7)){
            /*continue*/
            l.setToken(TokenSymbol, 8, 8);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 108){
        if(3==compare(data,l.byte_offset +1,64,3)){
            /*loop*/
            l.setToken(TokenSymbol, 4, 4);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 123){
        /*{*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 125){
        /*}*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 59){
        /*;*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 41){
        /*)*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 93){
        /*]*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 101){
        if(3==compare(data,l.byte_offset +1,129,3)){
            /*else*/
            l.setToken(TokenSymbol, 4, 4);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 58){
        /*:*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 115){
        if(2==compare(data,l.byte_offset +1,48,2)){
            /*str*/
            l.setToken(TokenSymbol, 3, 3);
            return 1;
        }
    }
    if(l.END(data)){
        return 1;
    } else if(l.isSym(true,data)){
        return 1;
    }
    return 1;
}
function sym_map_e58af9c6fd146069(l,data){
    /*: else ) ; ] } , in [ str id _ $ fn END_OF_FILE sym ==*/
    if(data.input[l.byte_offset + 0] == 58){
        /*:*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 101){
        if(3==compare(data,l.byte_offset +1,129,3)){
            if(l.isDiscrete(data, TokenIdentifier,4)){
                /*else*/
                l.setToken(TokenSymbol, 4, 4);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 41){
        /*)*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 59){
        /*;*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 93){
        /*]*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 125){
        /*}*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 44){
        /*,*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 110){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*in*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 91){
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 115){
        if(2==compare(data,l.byte_offset +1,48,2)){
            if(l.isDiscrete(data, TokenIdentifier,3)){
                /*str*/
                l.setToken(TokenSymbol, 3, 3);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 95){
        /*_*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 36){
        /*$*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*fn*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 61){
        if(data.input[l.byte_offset + 1] == 61){
            /*==*/
            l.setToken(TokenSymbol, 2, 2);
            return 0;
        }
    }
    if(l.isUniID(data)){
        return 1;
    } else if(l.END(data)){
        return 1;
    } else if(l.isSym(true,data)){
        return 0;
    }
    return 1;
}
function sym_map_eeb5218ed312146c(l,data){
    /*else*/
    if(data.input[l.byte_offset + 0] == 101){
        if(3==compare(data,l.byte_offset +1,129,3)){
            /*else*/
            l.setToken(TokenSymbol, 4, 4);
            return 0;
        }
    }
    return -1;
}
function sym_map_f1b7f378696f9453(l,data){
    /*; in [ str id _ $ fn } , ) END_OF_FILE*/
    if(data.input[l.byte_offset + 0] == 59){
        /*;*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 110){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*in*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 91){
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 115){
        if(2==compare(data,l.byte_offset +1,48,2)){
            if(l.isDiscrete(data, TokenIdentifier,3)){
                /*str*/
                l.setToken(TokenSymbol, 3, 3);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 95){
        /*_*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 36){
        /*$*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*fn*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 125){
        /*}*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 44){
        /*,*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 41){
        /*)*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    }
    if(l.isUniID(data)){
        return 1;
    } else if(l.END(data)){
        return 1;
    }
    return 1;
}
function sym_map_f37de846387deb5d(l,data){
    /*sym ws nl _ $ [ 0x 0b 0o 0O " ' <<-- ( == { ] : ; ) } ,*/
    if(data.input[l.byte_offset + 0] == 95){
        /*_*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
    } else if(data.input[l.byte_offset + 0] == 36){
        /*$*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
    } else if(data.input[l.byte_offset + 0] == 91){
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
    } else if(data.input[l.byte_offset + 0] == 48){
        if(data.input[l.byte_offset + 1] == 120){
            /*0x*/
            l.setToken(TokenSymbol, 2, 2);
            return 2;
        } else if(data.input[l.byte_offset + 1] == 98){
            /*0b*/
            l.setToken(TokenSymbol, 2, 2);
            return 2;
        } else if(data.input[l.byte_offset + 1] == 111){
            /*0o*/
            l.setToken(TokenSymbol, 2, 2);
            return 2;
        } else if(data.input[l.byte_offset + 1] == 79){
            /*0O*/
            l.setToken(TokenSymbol, 2, 2);
            return 2;
        }
    } else if(data.input[l.byte_offset + 0] == 34){
        /*"*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
    } else if(data.input[l.byte_offset + 0] == 39){
        /*'*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
    } else if(data.input[l.byte_offset + 0] == 60){
        if(3==compare(data,l.byte_offset +1,21,3)){
            /*<<--*/
            l.setToken(TokenSymbol, 4, 4);
            return 2;
        }
    } else if(data.input[l.byte_offset + 0] == 40){
        /*(*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
    } else if(data.input[l.byte_offset + 0] == 61){
        if(data.input[l.byte_offset + 1] == 61){
            /*==*/
            l.setToken(TokenSymbol, 2, 2);
            return 2;
        }
    } else if(data.input[l.byte_offset + 0] == 123){
        /*{*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
    } else if(data.input[l.byte_offset + 0] == 93){
        /*]*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
    } else if(data.input[l.byte_offset + 0] == 58){
        /*:*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
    } else if(data.input[l.byte_offset + 0] == 59){
        /*;*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
    } else if(data.input[l.byte_offset + 0] == 41){
        /*)*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
    } else if(data.input[l.byte_offset + 0] == 125){
        /*}*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
    } else if(data.input[l.byte_offset + 0] == 44){
        /*,*/
        l.setToken(TokenSymbol, 1, 1);
        return 2;
    }
    if(l.isSym(true,data)){
        return 0;
    } else if(nocap_108e16629a73e761(l)/*[ws]*/){
        return 1;
    } else if(nocap_9b1ef04606bbaa09(l)/*[nl]*/){
        return 1;
    }
    return -1;
}
function sym_map_f58418e3a6868944(l,data){
    /*in ; } ) , [ str id _ $ fn END_OF_FILE*/
    if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 110){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*in*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 59){
        /*;*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 125){
        /*}*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 41){
        /*)*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 44){
        /*,*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 91){
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 115){
        if(2==compare(data,l.byte_offset +1,48,2)){
            if(l.isDiscrete(data, TokenIdentifier,3)){
                /*str*/
                l.setToken(TokenSymbol, 3, 3);
                return 1;
            }
        }
    } else if(data.input[l.byte_offset + 0] == 95){
        /*_*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 36){
        /*$*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            if(l.isDiscrete(data, TokenIdentifier,2)){
                /*fn*/
                l.setToken(TokenSymbol, 2, 2);
                return 1;
            }
        }
    }
    if(l.isUniID(data)){
        return 1;
    } else if(l.END(data)){
        return 1;
    }
    return 1;
}
function sym_map_f7132f7e7856eabb(l,data){
    /*{ is : [ . ( = sym == else ) ; ] } , in str fn END_OF_FILE*/
    if(data.input[l.byte_offset + 0] == 123){
        /*{*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 115){
            /*is*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        } else if(data.input[l.byte_offset + 1] == 110){
            /*in*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 58){
        /*:*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 91){
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 46){
        /*.*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 40){
        /*(*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 61){
        if(data.input[l.byte_offset + 1] == 61){
            /*==*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        }
        /*=*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 101){
        if(3==compare(data,l.byte_offset +1,129,3)){
            /*else*/
            l.setToken(TokenSymbol, 4, 4);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 41){
        /*)*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 59){
        /*;*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 93){
        /*]*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 125){
        /*}*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 44){
        /*,*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 115){
        if(2==compare(data,l.byte_offset +1,48,2)){
            /*str*/
            l.setToken(TokenSymbol, 3, 3);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            /*fn*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        }
    }
    if(l.isSym(true,data)){
        return 1;
    } else if(l.END(data)){
        return 1;
    }
    return 1;
}
function sym_map_f9b1ea7f7d1d130b(l,data){
    /*] : ) ; else , } in [ str fn END_OF_FILE sym ==*/
    if(data.input[l.byte_offset + 0] == 93){
        /*]*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 58){
        /*:*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 41){
        /*)*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 59){
        /*;*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 101){
        if(3==compare(data,l.byte_offset +1,129,3)){
            /*else*/
            l.setToken(TokenSymbol, 4, 4);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 44){
        /*,*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 125){
        /*}*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 105){
        if(data.input[l.byte_offset + 1] == 110){
            /*in*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 91){
        /*[*/
        l.setToken(TokenSymbol, 1, 1);
        return 1;
    } else if(data.input[l.byte_offset + 0] == 115){
        if(2==compare(data,l.byte_offset +1,48,2)){
            /*str*/
            l.setToken(TokenSymbol, 3, 3);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 102){
        if(data.input[l.byte_offset + 1] == 110){
            /*fn*/
            l.setToken(TokenSymbol, 2, 2);
            return 1;
        }
    } else if(data.input[l.byte_offset + 0] == 61){
        if(data.input[l.byte_offset + 1] == 61){
            /*==*/
            l.setToken(TokenSymbol, 2, 2);
            return 0;
        }
    }
    if(l.END(data)){
        return 1;
    } else if(l.isSym(true,data)){
        return 0;
    }
    return 1;
}
function tk_2f515e58b15d487f(l,data){
    if(/*[0b]*/cmpr_set(l,data,114,2,2)){
                        
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
function tk_3999c4fcc0085d27(l,data){
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
function tk_52302cb4b3affc2c(l,data){
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
function tk_63ad4c5612f74208(l,data){
    if(/*[0x]*/cmpr_set(l,data,27,2,2)){
                        
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
function tk_75cdb915d57db20f(l,data){
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
function tk_9ba3f87b97077738(l,data){
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
function tk_b1b10eb2e83a1bcd(l,data){
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
function tk_b495469acbac99fd(l,data){
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
            compile time: 14.449ms*/;
function $skribble(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*0:0 skribble=>• module*/
    puid |=1;
    pushFN(data,branch_58befcfe7c0c615e);
    pushFN(data,$module);
    return puid;
    return -1;
}
function $skribble_reducer(l,data,state,prod,puid){
    if(1 == puid){
        /*0:0 skribble=>module •*/
        add_reduce(state,data,1,1);
    }
    return 0;
}
/*production name: module_group_02_100
            grammar index: 1
            bodies:
	1:1 module_group_02_100=>• statements - 
            compile time: 13.226ms*/;
function $module_group_02_100(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*1:1 module_group_02_100=>• statements*/
    puid |=1;
    pushFN(data,branch_a517d1aa452b9992);
    pushFN(data,$statements);
    return puid;
    return -1;
}
function $module_group_02_100_reducer(l,data,state,prod,puid){
    return 1;
}
/*production name: module
            grammar index: 3
            bodies:
	3:4 module=>• module module_group_02_100 - 
		3:5 module=>• module_group_02_100 - 
            compile time: 32.722ms*/;
function $module(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*3:5 module=>• module_group_02_100*/
    puid |=2;
    pushFN(data,branch_614618963d5fc947);
    pushFN(data,$statements);
    return puid;
    return -1;
}
function $module_goto(l,data,state,prod,puid){
    while(1){
        /*3:4 module=>module • module_group_02_100
        0:0 skribble=>module •*/
        /*3:4 module=>module • module_group_02_100
        0:0 skribble=>module •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if(((((((/*[import]*/cmpr_set(l,data,29,6,6)||/*[cls]*/cmpr_set(l,data,122,3,3))||/*[str]*/cmpr_set(l,data,47,3,3))||/*[fn]*/cmpr_set(l,data,144,2,2))||/*[ns]*/cmpr_set(l,data,120,2,2))||/*[<<--]*/cmpr_set(l,data,20,4,4))||assert_ascii(l,0x0,0x10,0x88000000,0x0))||l.isUniID(data)){
            pushFN(data,branch_8de46b48db2ae3fb);
            return branch_465e426d388a08ff(l,data,state,prod,1);
        }
        break;
    }
    return prod == 3 ? prod : -1;
}
function $module_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*3:4 module=>module module_group_02_100 •*/
        add_reduce(state,data,2,2);
    } else if(2 == puid){
        /*3:5 module=>module_group_02_100 •*/
        add_reduce(state,data,1,3);
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
            compile time: 938.789ms*/;
function $statements(l,data,state,prod,puid){
    /*4:6 statements=>• import
    50:143 modifier_list=>• [ modifier_list_HC_listbody1_120 ]
    4:7 statements=>• class
    4:8 statements=>• primitive_declaration ;
    4:9 statements=>• struct
    4:10 statements=>• function
    4:11 statements=>• namespace
    4:12 statements=>• template*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    if(l.current_byte==91/*[[]*/){
        pushFN(data,branch_28c5dc3955a9ede3);
        return branch_b2f1e7a14d93676a(l,data,state,prod,1);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(/*[<<--]*/cmpr_set(l,data,20,4,4)){
        pushFN(data,branch_29bbdf58183bc8d7);
        return branch_182fbd57c7171eea(l,data,state,prod,128);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(/*[import]*/cmpr_set(l,data,29,6,6)){
        pushFN(data,branch_29bbdf58183bc8d7);
        return branch_d4db2f1e23e0aa87(l,data,state,prod,1);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(/*[cls]*/cmpr_set(l,data,122,3,3)){
        pushFN(data,branch_29bbdf58183bc8d7);
        return branch_985fde960bcf25f5(l,data,state,prod,2);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(/*[str]*/cmpr_set(l,data,47,3,3)){
        pushFN(data,branch_29bbdf58183bc8d7);
        return branch_06d39f12ebd6fe90(l,data,state,prod,16);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(/*[fn]*/cmpr_set(l,data,144,2,2)){
        pushFN(data,branch_29bbdf58183bc8d7);
        return branch_39cd0577e37e3812(l,data,state,prod,32);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(/*[ns]*/cmpr_set(l,data,120,2,2)){
        pushFN(data,branch_29bbdf58183bc8d7);
        return branch_5bfc8f68271cf93d(l,data,state,prod,64);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
        pushFN(data,branch_29bbdf58183bc8d7);
        return branch_2e15118ce65949ae(l,data,state,prod,4);
    }
    return -1;
}
function $statements_goto(l,data,state,prod,puid){
    switch(prod){
        case 43:
            /*4:8 statements=>primitive_declaration • ;*/
            /*4:8 statements=>primitive_declaration • ;*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
            if(l.current_byte==59/*[;]*/){
                consume(l,data,state);
                puid |=8;
                /*--LEAF--*/
                /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                /*4:8 statements=>primitive_declaration ; •*/
                add_reduce(state,data,2,4);
                /*[4]*/
                pushFN(data,$statements_goto);
                return 4;
            }
            break;
        case 50:
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
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            if(/*[cls]*/cmpr_set(l,data,122,3,3)){
                /*11:24 class=>modifier_list • cls identifier class_group_113_103 { class_HC_listbody1_105 }
                11:26 class=>modifier_list • cls identifier { class_HC_listbody1_105 }
                11:27 class=>modifier_list • cls identifier class_group_113_103 { }
                11:30 class=>modifier_list • cls identifier { }*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l,data,state);
                puid |=2;
                /*11:24 class=>modifier_list cls • identifier class_group_113_103 { class_HC_listbody1_105 }
                11:26 class=>modifier_list cls • identifier { class_HC_listbody1_105 }
                11:27 class=>modifier_list cls • identifier class_group_113_103 { }
                11:30 class=>modifier_list cls • identifier { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                pushFN(data,branch_0edcadab50da60bf);
                pushFN(data,$identifier);
                puid |=4;
                return puid;
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            } else if(/*[str]*/cmpr_set(l,data,47,3,3)){
                /*12:32 struct=>modifier_list • str identifier { parameters }
                12:34 struct=>modifier_list • str identifier { }*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l,data,state);
                puid |=2;
                /*12:32 struct=>modifier_list str • identifier { parameters }
                12:34 struct=>modifier_list str • identifier { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                pushFN(data,branch_d54ecf6c2941c966);
                pushFN(data,$identifier);
                puid |=4;
                return puid;
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
            } else if(/*[fn]*/cmpr_set(l,data,144,2,2)){
                /*13:36 function=>modifier_list • fn identifier : type ( parameters ) { expression_statements }
                13:38 function=>modifier_list • fn identifier : type ( ) { expression_statements }
                13:39 function=>modifier_list • fn identifier : type ( parameters ) { }
                13:42 function=>modifier_list • fn identifier : type ( ) { }*/
                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                consume(l,data,state);
                puid |=2;
                /*13:36 function=>modifier_list fn • identifier : type ( parameters ) { expression_statements }
                13:38 function=>modifier_list fn • identifier : type ( ) { expression_statements }
                13:39 function=>modifier_list fn • identifier : type ( parameters ) { }
                13:42 function=>modifier_list fn • identifier : type ( ) { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                pushFN(data,branch_bcf2526debbe588a);
                pushFN(data,$identifier);
                puid |=4;
                return puid;
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
                /*43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
                43:127 primitive_declaration=>modifier_list • identifier : type*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                pushFN(data,branch_5b05f5056e86d777);
                pushFN(data,$identifier);
                puid |=2;
                return puid;
            }
            break;
        default:
            break;
    }
    return prod == 4 ? prod : -1;
}
function $statements_reducer(l,data,state,prod,puid){
    if(12 == puid){
        /*4:8 statements=>primitive_declaration ; •*/
        add_reduce(state,data,2,4);
    } else if(128 == puid){
        /*4:12 statements=>template •*/
        add_reduce(state,data,1,5);
    }
    return 4;
}
/*production name: import
            grammar index: 5
            bodies:
	5:13 import=>• import tk:string - 
            compile time: 34.922ms*/;
function $import(l,data,state,prod,puid){
    /*5:13 import=>• import tk:string*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(/*[import]*/cmpr_set(l,data,29,6,6)){
        consume(l,data,state);
        puid |=1;
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        /*5:13 import=>import • tk:string*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        puid |=2;
        if(tk_f70d460017f6375f(l,data)&&consume(l,data,state)){
            add_reduce(state,data,2,0);
            /*[5]*/
            return 5;
        }
    }
    return -1;
}
function $import_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*5:13 import=>import tk:string •*/
        add_reduce(state,data,2,0);
    }
    return 5;
}
/*production name: namespace_HC_listbody3_102
            grammar index: 6
            bodies:
	6:14 namespace_HC_listbody3_102=>• namespace_HC_listbody3_102 statements - 
		6:15 namespace_HC_listbody3_102=>• statements - 
            compile time: 33.94ms*/;
function $namespace_HC_listbody3_102(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*6:15 namespace_HC_listbody3_102=>• statements*/
    puid |=2;
    pushFN(data,branch_1452a70aa69fc4d3);
    pushFN(data,$statements);
    return puid;
    return -1;
}
function $namespace_HC_listbody3_102_goto(l,data,state,prod,puid){
    /*6:14 namespace_HC_listbody3_102=>namespace_HC_listbody3_102 • statements*/
    /*6:14 namespace_HC_listbody3_102=>namespace_HC_listbody3_102 • statements
    7:16 namespace=>ns identifier { namespace_HC_listbody3_102 • }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(((((((/*[import]*/cmpr_set(l,data,29,6,6)||/*[cls]*/cmpr_set(l,data,122,3,3))||/*[str]*/cmpr_set(l,data,47,3,3))||/*[fn]*/cmpr_set(l,data,144,2,2))||/*[ns]*/cmpr_set(l,data,120,2,2))||/*[<<--]*/cmpr_set(l,data,20,4,4))||assert_ascii(l,0x0,0x10,0x88000000,0x0))||l.isUniID(data)){
        pushFN(data,branch_995577f63a2dac51);
        return branch_1cb22634391af254(l,data,state,prod,1);
    }
    return prod == 6 ? prod : -1;
}
function $namespace_HC_listbody3_102_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*6:14 namespace_HC_listbody3_102=>namespace_HC_listbody3_102 statements •*/
        add_reduce(state,data,2,2);
    } else if(2 == puid){
        /*6:15 namespace_HC_listbody3_102=>statements •*/
        add_reduce(state,data,1,3);
    }
    return 6;
}
/*production name: namespace
            grammar index: 7
            bodies:
	7:16 namespace=>• ns identifier { namespace_HC_listbody3_102 } - 
		7:17 namespace=>• ns identifier { } - 
            compile time: 37.809ms*/;
function $namespace(l,data,state,prod,puid){
    /*7:16 namespace=>• ns identifier { namespace_HC_listbody3_102 }
    7:17 namespace=>• ns identifier { }*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(/*[ns]*/cmpr_set(l,data,120,2,2)){
        consume(l,data,state);
        puid |=1;
        /*7:16 namespace=>ns • identifier { namespace_HC_listbody3_102 }
        7:17 namespace=>ns • identifier { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_72781c6b60c036b7);
        pushFN(data,$identifier);
        puid |=2;
        return puid;
    }
    return -1;
}
function $namespace_reducer(l,data,state,prod,puid){
    if(31 == puid){
        /*7:16 namespace=>ns identifier { namespace_HC_listbody3_102 } •*/
        add_reduce(state,data,5,6);
    } else if(23 == puid){
        /*7:17 namespace=>ns identifier { } •*/
        add_reduce(state,data,4,7);
    }
    return 7;
}
/*production name: class_group_113_103
            grammar index: 8
            bodies:
	8:18 class_group_113_103=>• is θid - 
            compile time: 19.831ms*/;
function $class_group_113_103(l,data,state,prod,puid){
    /*8:18 class_group_113_103=>• is θid*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(/*[is]*/cmpr_set(l,data,141,2,2)){
        consume(l,data,state);
        puid |=1;
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        /*8:18 class_group_113_103=>is • θid*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        puid |=2;
        if(l.isUniID(data)&&consume(l,data,state)){
            add_reduce(state,data,2,0);
            /*[8]*/
            return 8;
        }
    }
    return -1;
}
function $class_group_113_103_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*8:18 class_group_113_103=>is θid •*/
        add_reduce(state,data,2,0);
    }
    return 8;
}
/*production name: class_group_016_104
            grammar index: 9
            bodies:
	9:19 class_group_016_104=>• struct - 
		9:20 class_group_016_104=>• primitive_declaration - 
		9:21 class_group_016_104=>• function - 
            compile time: 925.432ms*/;
function $class_group_016_104(l,data,state,prod,puid){
    /*50:143 modifier_list=>• [ modifier_list_HC_listbody1_120 ]
    9:19 class_group_016_104=>• struct
    9:20 class_group_016_104=>• primitive_declaration
    9:21 class_group_016_104=>• function*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    if(l.current_byte==91/*[[]*/){
        pushFN(data,branch_7a8be2c54a4d26e4);
        return branch_b2f1e7a14d93676a(l,data,state,prod,1);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(/*[str]*/cmpr_set(l,data,47,3,3)){
        pushFN(data,branch_fc3089e8ba238415);
        return branch_ddc01e19c9392030(l,data,state,prod,1);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(/*[fn]*/cmpr_set(l,data,144,2,2)){
        pushFN(data,branch_fc3089e8ba238415);
        return branch_18d86dfd14efd6df(l,data,state,prod,4);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
        pushFN(data,branch_fc3089e8ba238415);
        return branch_f56e73d66e0b95bd(l,data,state,prod,2);
    }
    return -1;
}
function $class_group_016_104_goto(l,data,state,prod,puid){
    /*12:32 struct=>modifier_list • str identifier { parameters }
    12:34 struct=>modifier_list • str identifier { }
    43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
    43:127 primitive_declaration=>modifier_list • identifier : type
    13:36 function=>modifier_list • fn identifier : type ( parameters ) { expression_statements }
    13:38 function=>modifier_list • fn identifier : type ( ) { expression_statements }
    13:39 function=>modifier_list • fn identifier : type ( parameters ) { }
    13:42 function=>modifier_list • fn identifier : type ( ) { }*/
    /*12:32 struct=>modifier_list • str identifier { parameters }
    12:34 struct=>modifier_list • str identifier { }
    43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
    43:127 primitive_declaration=>modifier_list • identifier : type
    13:36 function=>modifier_list • fn identifier : type ( parameters ) { expression_statements }
    13:38 function=>modifier_list • fn identifier : type ( ) { expression_statements }
    13:39 function=>modifier_list • fn identifier : type ( parameters ) { }
    13:42 function=>modifier_list • fn identifier : type ( ) { }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(/*[str]*/cmpr_set(l,data,47,3,3)){
        /*12:32 struct=>modifier_list • str identifier { parameters }
        12:34 struct=>modifier_list • str identifier { }*/
        /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
        consume(l,data,state);
        puid |=2;
        /*12:32 struct=>modifier_list str • identifier { parameters }
        12:34 struct=>modifier_list str • identifier { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_284859c41cd04d90);
        pushFN(data,$identifier);
        puid |=4;
        return puid;
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    } else if(/*[fn]*/cmpr_set(l,data,144,2,2)){
        /*13:36 function=>modifier_list • fn identifier : type ( parameters ) { expression_statements }
        13:38 function=>modifier_list • fn identifier : type ( ) { expression_statements }
        13:39 function=>modifier_list • fn identifier : type ( parameters ) { }
        13:42 function=>modifier_list • fn identifier : type ( ) { }*/
        /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
        consume(l,data,state);
        puid |=2;
        /*13:36 function=>modifier_list fn • identifier : type ( parameters ) { expression_statements }
        13:38 function=>modifier_list fn • identifier : type ( ) { expression_statements }
        13:39 function=>modifier_list fn • identifier : type ( parameters ) { }
        13:42 function=>modifier_list fn • identifier : type ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_642e59bb993053b7);
        pushFN(data,$identifier);
        puid |=4;
        return puid;
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
        /*43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
        43:127 primitive_declaration=>modifier_list • identifier : type*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_4e502534fa641d2b);
        pushFN(data,$identifier);
        puid |=2;
        return puid;
    }
    return prod == 9 ? prod : -1;
}
function $class_group_016_104_reducer(l,data,state,prod,puid){
    return 9;
}
/*production name: class_HC_listbody1_105
            grammar index: 10
            bodies:
	10:22 class_HC_listbody1_105=>• class_HC_listbody1_105 class_group_016_104 - 
		10:23 class_HC_listbody1_105=>• class_group_016_104 - 
            compile time: 358.129ms*/;
function $class_HC_listbody1_105(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*10:23 class_HC_listbody1_105=>• class_group_016_104*/
    puid |=2;
    pushFN(data,branch_a27fcfa33dc4a021);
    pushFN(data,$class_group_016_104);
    return puid;
    return -1;
}
function $class_HC_listbody1_105_goto(l,data,state,prod,puid){
    /*10:22 class_HC_listbody1_105=>class_HC_listbody1_105 • class_group_016_104*/
    /*10:22 class_HC_listbody1_105=>class_HC_listbody1_105 • class_group_016_104
    11:24 class=>modifier_list cls identifier class_group_113_103 { class_HC_listbody1_105 • }
    11:25 class=>cls identifier class_group_113_103 { class_HC_listbody1_105 • }
    11:26 class=>modifier_list cls identifier { class_HC_listbody1_105 • }
    11:28 class=>cls identifier { class_HC_listbody1_105 • }*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(((/*[str]*/cmpr_set(l,data,47,3,3)||/*[fn]*/cmpr_set(l,data,144,2,2))||assert_ascii(l,0x0,0x10,0x88000000,0x0))||l.isUniID(data)){
        pushFN(data,branch_f068cad16e805a7e);
        return branch_3aa9d1696f0d18cf(l,data,state,prod,1);
    }
    return prod == 10 ? prod : -1;
}
function $class_HC_listbody1_105_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*10:22 class_HC_listbody1_105=>class_HC_listbody1_105 class_group_016_104 •*/
        add_reduce(state,data,2,2);
    } else if(2 == puid){
        /*10:23 class_HC_listbody1_105=>class_group_016_104 •*/
        add_reduce(state,data,1,3);
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
            compile time: 287.948ms*/;
function $class(l,data,state,prod,puid){
    /*11:24 class=>• modifier_list cls identifier class_group_113_103 { class_HC_listbody1_105 }
    11:26 class=>• modifier_list cls identifier { class_HC_listbody1_105 }
    11:27 class=>• modifier_list cls identifier class_group_113_103 { }
    11:30 class=>• modifier_list cls identifier { }
    11:25 class=>• cls identifier class_group_113_103 { class_HC_listbody1_105 }
    11:28 class=>• cls identifier { class_HC_listbody1_105 }
    11:29 class=>• cls identifier class_group_113_103 { }
    11:31 class=>• cls identifier { }*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==91/*[[]*/){
        /*11:24 class=>• modifier_list cls identifier class_group_113_103 { class_HC_listbody1_105 }
        11:26 class=>• modifier_list cls identifier { class_HC_listbody1_105 }
        11:27 class=>• modifier_list cls identifier class_group_113_103 { }
        11:30 class=>• modifier_list cls identifier { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_e2f0c96db59810c2);
        pushFN(data,$modifier_list);
        puid |=1;
        return puid;
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    } else if(/*[cls]*/cmpr_set(l,data,122,3,3)){
        /*11:25 class=>• cls identifier class_group_113_103 { class_HC_listbody1_105 }
        11:28 class=>• cls identifier { class_HC_listbody1_105 }
        11:29 class=>• cls identifier class_group_113_103 { }
        11:31 class=>• cls identifier { }*/
        /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
        consume(l,data,state);
        puid |=2;
        /*11:25 class=>cls • identifier class_group_113_103 { class_HC_listbody1_105 }
        11:28 class=>cls • identifier { class_HC_listbody1_105 }
        11:29 class=>cls • identifier class_group_113_103 { }
        11:31 class=>cls • identifier { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_5f86abcc6b22ca54);
        pushFN(data,$identifier);
        puid |=4;
        return puid;
    }
    return -1;
}
function $class_reducer(l,data,state,prod,puid){
    if(127 == puid){
        /*11:24 class=>modifier_list cls identifier class_group_113_103 { class_HC_listbody1_105 } •*/
        add_reduce(state,data,7,8);
    } else if(126 == puid){
        /*11:25 class=>cls identifier class_group_113_103 { class_HC_listbody1_105 } •*/
        add_reduce(state,data,6,9);
    } else if(119 == puid){
        /*11:26 class=>modifier_list cls identifier { class_HC_listbody1_105 } •*/
        add_reduce(state,data,6,10);
    } else if(95 == puid){
        /*11:27 class=>modifier_list cls identifier class_group_113_103 { } •*/
        add_reduce(state,data,6,11);
    } else if(118 == puid){
        /*11:28 class=>cls identifier { class_HC_listbody1_105 } •*/
        add_reduce(state,data,5,12);
    } else if(94 == puid){
        /*11:29 class=>cls identifier class_group_113_103 { } •*/
        add_reduce(state,data,5,13);
    } else if(87 == puid){
        /*11:30 class=>modifier_list cls identifier { } •*/
        add_reduce(state,data,5,14);
    } else if(86 == puid){
        /*11:31 class=>cls identifier { } •*/
        add_reduce(state,data,4,15);
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
            compile time: 396.098ms*/;
function $struct(l,data,state,prod,puid){
    /*12:32 struct=>• modifier_list str identifier { parameters }
    12:34 struct=>• modifier_list str identifier { }
    12:33 struct=>• str identifier { parameters }
    12:35 struct=>• str identifier { }*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==91/*[[]*/){
        /*12:32 struct=>• modifier_list str identifier { parameters }
        12:34 struct=>• modifier_list str identifier { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_1628d244e672d0a0);
        pushFN(data,$modifier_list);
        puid |=1;
        return puid;
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    } else if(/*[str]*/cmpr_set(l,data,47,3,3)){
        /*12:33 struct=>• str identifier { parameters }
        12:35 struct=>• str identifier { }*/
        /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
        consume(l,data,state);
        puid |=2;
        /*12:33 struct=>str • identifier { parameters }
        12:35 struct=>str • identifier { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_229d035f52468bb9);
        pushFN(data,$identifier);
        puid |=4;
        return puid;
    }
    return -1;
}
function $struct_reducer(l,data,state,prod,puid){
    if(63 == puid){
        /*12:32 struct=>modifier_list str identifier { parameters } •*/
        add_reduce(state,data,6,16);
    } else if(62 == puid){
        /*12:33 struct=>str identifier { parameters } •*/
        add_reduce(state,data,5,17);
    } else if(47 == puid){
        /*12:34 struct=>modifier_list str identifier { } •*/
        add_reduce(state,data,5,18);
    } else if(46 == puid){
        /*12:35 struct=>str identifier { } •*/
        add_reduce(state,data,4,19);
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
            compile time: 1005.446ms*/;
function $function(l,data,state,prod,puid){
    /*13:36 function=>• modifier_list fn identifier : type ( parameters ) { expression_statements }
    13:38 function=>• modifier_list fn identifier : type ( ) { expression_statements }
    13:39 function=>• modifier_list fn identifier : type ( parameters ) { }
    13:42 function=>• modifier_list fn identifier : type ( ) { }
    13:37 function=>• fn identifier : type ( parameters ) { expression_statements }
    13:40 function=>• fn identifier : type ( ) { expression_statements }
    13:41 function=>• fn identifier : type ( parameters ) { }
    13:43 function=>• fn identifier : type ( ) { }*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==91/*[[]*/){
        /*13:36 function=>• modifier_list fn identifier : type ( parameters ) { expression_statements }
        13:38 function=>• modifier_list fn identifier : type ( ) { expression_statements }
        13:39 function=>• modifier_list fn identifier : type ( parameters ) { }
        13:42 function=>• modifier_list fn identifier : type ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_b0193ac109573cd3);
        pushFN(data,$modifier_list);
        puid |=1;
        return puid;
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    } else if(/*[fn]*/cmpr_set(l,data,144,2,2)){
        /*13:37 function=>• fn identifier : type ( parameters ) { expression_statements }
        13:40 function=>• fn identifier : type ( ) { expression_statements }
        13:41 function=>• fn identifier : type ( parameters ) { }
        13:43 function=>• fn identifier : type ( ) { }*/
        /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
        consume(l,data,state);
        puid |=2;
        /*13:37 function=>fn • identifier : type ( parameters ) { expression_statements }
        13:40 function=>fn • identifier : type ( ) { expression_statements }
        13:41 function=>fn • identifier : type ( parameters ) { }
        13:43 function=>fn • identifier : type ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_08f4de060d4411dd);
        pushFN(data,$identifier);
        puid |=4;
        return puid;
    }
    return -1;
}
function $function_reducer(l,data,state,prod,puid){
    if(2047 == puid){
        /*13:36 function=>modifier_list fn identifier : type ( parameters ) { expression_statements } •*/
        add_reduce(state,data,11,20);
    } else if(2046 == puid){
        /*13:37 function=>fn identifier : type ( parameters ) { expression_statements } •*/
        add_reduce(state,data,10,21);
    } else if(1983 == puid){
        /*13:38 function=>modifier_list fn identifier : type ( ) { expression_statements } •*/
        add_reduce(state,data,10,22);
    } else if(1535 == puid){
        /*13:39 function=>modifier_list fn identifier : type ( parameters ) { } •*/
        add_reduce(state,data,10,23);
    } else if(1982 == puid){
        /*13:40 function=>fn identifier : type ( ) { expression_statements } •*/
        add_reduce(state,data,9,24);
    } else if(1534 == puid){
        /*13:41 function=>fn identifier : type ( parameters ) { } •*/
        add_reduce(state,data,9,25);
    } else if(1471 == puid){
        /*13:42 function=>modifier_list fn identifier : type ( ) { } •*/
        add_reduce(state,data,9,26);
    } else if(1470 == puid){
        /*13:43 function=>fn identifier : type ( ) { } •*/
        add_reduce(state,data,8,27);
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
            compile time: 1076.109ms*/;
function $function_expression(l,data,state,prod,puid){
    /*14:44 function_expression=>• modifier_list fn : type ( parameters ) { expression_statements }
    14:46 function_expression=>• modifier_list fn : type ( ) { expression_statements }
    14:47 function_expression=>• modifier_list fn : type ( parameters ) { }
    14:50 function_expression=>• modifier_list fn : type ( ) { }
    14:45 function_expression=>• fn : type ( parameters ) { expression_statements }
    14:48 function_expression=>• fn : type ( ) { expression_statements }
    14:49 function_expression=>• fn : type ( parameters ) { }
    14:51 function_expression=>• fn : type ( ) { }*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==91/*[[]*/){
        /*14:44 function_expression=>• modifier_list fn : type ( parameters ) { expression_statements }
        14:46 function_expression=>• modifier_list fn : type ( ) { expression_statements }
        14:47 function_expression=>• modifier_list fn : type ( parameters ) { }
        14:50 function_expression=>• modifier_list fn : type ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_f068dbf20a6c2fc7);
        pushFN(data,$modifier_list);
        puid |=1;
        return puid;
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    } else if(/*[fn]*/cmpr_set(l,data,144,2,2)){
        /*14:45 function_expression=>• fn : type ( parameters ) { expression_statements }
        14:48 function_expression=>• fn : type ( ) { expression_statements }
        14:49 function_expression=>• fn : type ( parameters ) { }
        14:51 function_expression=>• fn : type ( ) { }*/
        /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
        consume(l,data,state);
        puid |=2;
        /*14:45 function_expression=>fn • : type ( parameters ) { expression_statements }
        14:48 function_expression=>fn • : type ( ) { expression_statements }
        14:49 function_expression=>fn • : type ( parameters ) { }
        14:51 function_expression=>fn • : type ( ) { }*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        if(l.current_byte==58/*[:]*/){
            consume(l,data,state);
            puid |=4;
            /*14:45 function_expression=>fn : • type ( parameters ) { expression_statements }
            14:48 function_expression=>fn : • type ( ) { expression_statements }
            14:49 function_expression=>fn : • type ( parameters ) { }
            14:51 function_expression=>fn : • type ( ) { }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            pushFN(data,branch_f269923af5297955);
            pushFN(data,$type);
            puid |=8;
            return puid;
        }
    }
    return -1;
}
function $function_expression_reducer(l,data,state,prod,puid){
    if(1023 == puid){
        /*14:44 function_expression=>modifier_list fn : type ( parameters ) { expression_statements } •*/
        add_reduce(state,data,10,28);
    } else if(1022 == puid){
        /*14:45 function_expression=>fn : type ( parameters ) { expression_statements } •*/
        add_reduce(state,data,9,29);
    } else if(991 == puid){
        /*14:46 function_expression=>modifier_list fn : type ( ) { expression_statements } •*/
        add_reduce(state,data,9,30);
    } else if(767 == puid){
        /*14:47 function_expression=>modifier_list fn : type ( parameters ) { } •*/
        add_reduce(state,data,9,31);
    } else if(990 == puid){
        /*14:48 function_expression=>fn : type ( ) { expression_statements } •*/
        add_reduce(state,data,8,32);
    } else if(766 == puid){
        /*14:49 function_expression=>fn : type ( parameters ) { } •*/
        add_reduce(state,data,8,33);
    } else if(735 == puid){
        /*14:50 function_expression=>modifier_list fn : type ( ) { } •*/
        add_reduce(state,data,8,34);
    } else if(734 == puid){
        /*14:51 function_expression=>fn : type ( ) { } •*/
        add_reduce(state,data,7,35);
    }
    return 14;
}
/*production name: parameters
            grammar index: 16
            bodies:
	16:54 parameters=>• parameters , primitive_declaration - 
		16:55 parameters=>• primitive_declaration - 
            compile time: 693.031ms*/;
function $parameters(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*16:55 parameters=>• primitive_declaration*/
    puid |=4;
    pushFN(data,branch_054b65b0befd8913);
    pushFN(data,$primitive_declaration);
    return puid;
    return -1;
}
function $parameters_goto(l,data,state,prod,puid){
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
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(l.current_byte==44/*[,]*/){
        pushFN(data,branch_9f0a04323a32a77b);
        return branch_b3028ea0f4458d82(l,data,state,prod,1);
    }
    return prod == 16 ? prod : -1;
}
function $parameters_reducer(l,data,state,prod,puid){
    if(7 == puid){
        /*16:54 parameters=>parameters , primitive_declaration •*/
        add_reduce(state,data,3,36);
    } else if(4 == puid){
        /*16:55 parameters=>primitive_declaration •*/
        add_reduce(state,data,1,3);
    }
    return 16;
}
/*production name: expression_statements_HC_listbody1_107
            grammar index: 17
            bodies:
	17:56 expression_statements_HC_listbody1_107=>• expression_statements_HC_listbody1_107 ; - 
		17:57 expression_statements_HC_listbody1_107=>• ; - 
            compile time: 334.143ms*/;
function $expression_statements_HC_listbody1_107(l,data,state,prod,puid){
    /*17:57 expression_statements_HC_listbody1_107=>• ;*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==59/*[;]*/){
        consume(l,data,state);
        puid |=2;
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        /*17:57 expression_statements_HC_listbody1_107=>; •*/
        add_reduce(state,data,1,3);
        /*[17]*/
        pushFN(data,$expression_statements_HC_listbody1_107_goto);
        return 17;
    }
    return -1;
}
function $expression_statements_HC_listbody1_107_goto(l,data,state,prod,puid){
    while(1){
        /*17:56 expression_statements_HC_listbody1_107=>expression_statements_HC_listbody1_107 • ;
        19:60 expression_statements_group_124_109=>expression_statements_HC_listbody1_107 • expression_statements_group_023_108
        19:61 expression_statements_group_124_109=>expression_statements_HC_listbody1_107 •*/
        if(l.current_byte==125/*[}]*/){
            return 17;
        }
        /*17:56 expression_statements_HC_listbody1_107=>expression_statements_HC_listbody1_107 • ;
        19:60 expression_statements_group_124_109=>expression_statements_HC_listbody1_107 • expression_statements_group_023_108
        19:61 expression_statements_group_124_109=>expression_statements_HC_listbody1_107 •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
        if(l.current_byte==59/*[;]*/){
            pushFN(data,branch_bf60c80149b74072);
            return branch_a6ed7b43c3e39170(l,data,state,prod,1);
        }
        break;
    }
    return prod == 17 ? prod : -1;
}
function $expression_statements_HC_listbody1_107_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*17:56 expression_statements_HC_listbody1_107=>expression_statements_HC_listbody1_107 ; •*/
        add_reduce(state,data,2,2);
    } else if(2 == puid){
        /*17:57 expression_statements_HC_listbody1_107=>; •*/
        add_reduce(state,data,1,3);
    }
    return 17;
}
/*production name: expression_statements_group_023_108
            grammar index: 18
            bodies:
	18:58 expression_statements_group_023_108=>• expression - 
		18:59 expression_statements_group_023_108=>• primitive_declaration - 
            compile time: 2586.519ms*/;
function $expression_statements_group_023_108(l,data,state,prod,puid){
    /*18:58 expression_statements_group_023_108=>• expression
    18:59 expression_statements_group_023_108=>• primitive_declaration*/
    switch(sym_map_b9a34db74685e187(l,data)){
        case 0:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*18:58 expression_statements_group_023_108=>• expression*/
            puid |=1;
            pushFN(data,branch_14901645889b85d3);
            pushFN(data,$expression);
            return puid;
        case 1:
            /*44:129 identifier=>• tk:identifier_token
            50:143 modifier_list=>• [ modifier_list_HC_listbody1_120 ]*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if(l.current_byte==91/*[[]*/){
                pushFN(data,branch_6daab6971c75715b);
                return branch_f0133d64f87a5b0d(l,data,state,prod,1);
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
                pushFN(data,branch_11d890e1265c30e7);
                return branch_f1b14c28a5ec39ac(l,data,state,prod,1);
            }
        default:
            break;
    }
    return -1;
}
function $expression_statements_group_023_108_goto(l,data,state,prod,puid){
    while(1){
        switch(prod){
            case 26:
                /*25:80 binary_expression=>unary_expression • operator
                25:81 binary_expression=>unary_expression • operator expression
                25:82 binary_expression=>unary_expression •*/
                /*25:80 binary_expression=>unary_expression • operator
                25:81 binary_expression=>unary_expression • operator expression
                25:82 binary_expression=>unary_expression •*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                if(sym_map_e58af9c6fd146069(l,data)==1){
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    /*25:82 binary_expression=>unary_expression •*/
                    /*[25]*/
                    return 18;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if(/*[==]*/cmpr_set(l,data,7,2,2)||l.isSym(true,data)){
                    /*25:80 binary_expression=>unary_expression • operator
                    25:81 binary_expression=>unary_expression • operator expression*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                    pushFN(data,branch_0b080d7abb9c02f6);
                    pushFN(data,$operator);
                    puid |=2;
                    return puid;
                }
                break;
            case 28:
                /*22:76 assignment_expression=>left_hand_expression • = expression
                27:85 unary_value=>left_hand_expression •*/
                /*22:76 assignment_expression=>left_hand_expression • = expression
                27:85 unary_value=>left_hand_expression •*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                switch(sym_map_00f57473245d5924(l,data)){
                    case 0:
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert ⤋⤋⤋*/
                        /*22:76 assignment_expression=>left_hand_expression • = expression*/
                        puid |=2;
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                        puid |=4;
                        pushFN(data,branch_c254e571baecca8e);
                        pushFN(data,$expression);
                        return puid;
                    default:
                    case 1:
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*27:85 unary_value=>left_hand_expression •*/
                        /*[27]*/
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
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                switch(sym_map_c82afb129e509311(l,data)){
                    case 0:
                        /*28:91 left_hand_expression=>member_expression •
                        37:116 member_expression=>member_expression • [ expression ]*/
                        var pk = l.copy();
                        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,0);
                        switch(sym_map_5f25d3b4480e3a7f(pk,data)){
                            case 0:
                                /*--LEAF--*/
                                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                                /*37:116 member_expression=>member_expression • [ expression ]*/
                                puid |=8;
                                consume(l,data,state);
                                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                                puid |=16;
                                pushFN(data,branch_56aae7267d9f7ff5);
                                pushFN(data,$expression);
                                return puid;
                            default:
                            case 1:
                                /*--LEAF--*/
                                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                                /*28:91 left_hand_expression=>member_expression •*/
                                /*[28]*/
                                prod = 28;
                                continue;;
                            case 2:
                                /*--LEAF--*/
                                /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                                /*37:116 member_expression=>member_expression • [ expression ]*/
                                puid |=8;
                                consume(l,data,state);
                                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                                puid |=16;
                                pushFN(data,branch_56aae7267d9f7ff5);
                                pushFN(data,$expression);
                                return puid;
                        }
                    case 1:
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert ⤋⤋⤋*/
                        /*37:115 member_expression=>member_expression • . identifier*/
                        puid |=2;
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                        puid |=4;
                        pushFN(data,branch_9207737c4c22fa32);
                        pushFN(data,$identifier);
                        return puid;
                    case 2:
                        /*36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                        36:114 call_expression=>member_expression • ( )*/
                        var pk = l.copy();
                        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,0);
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        if(pk.current_byte==41/*[)]*/){
                            pushFN(data,branch_74c8218421c7bef8);
                            return branch_12c35f486abaab8c(l,data,state,prod,1);
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        } else if(((((((((((((((/*[if]*/cmpr_set(pk,data,143,2,2)||/*[match]*/cmpr_set(pk,data,67,5,5))||/*[break]*/cmpr_set(pk,data,72,5,5))||/*[return]*/cmpr_set(pk,data,77,6,6))||/*[continue]*/cmpr_set(pk,data,39,8,8))||/*[loop]*/cmpr_set(pk,data,63,4,4))||/*[<<--]*/cmpr_set(pk,data,20,4,4))||/*[==]*/cmpr_set(pk,data,7,2,2))||dt_bcea2102060eab13(pk,data))||/*[true]*/cmpr_set(pk,data,95,4,4))||/*[null]*/cmpr_set(pk,data,35,4,4))||dt_6ae31dd85a62ef5c(pk,data))||assert_ascii(pk,0x0,0x194,0x88000000,0x8000000))||pk.isUniID(data))||pk.isNum(data))||pk.isSym(true,data)){
                            pushFN(data,branch_74c8218421c7bef8);
                            return branch_6273212a0843d505(l,data,state,prod,1);
                        }
                    default:
                    case 3:
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*28:91 left_hand_expression=>member_expression •*/
                        /*[28]*/
                        prod = 28;
                        continue;;
                }
                break;
            case 44:
                /*37:117 member_expression=>identifier •
                43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                43:128 primitive_declaration=>identifier • : type*/
                /*37:117 member_expression=>identifier •
                43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                43:128 primitive_declaration=>identifier • : type*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                switch(sym_map_9fff07fe93fb5f87(l,data)){
                    case 0:
                        /*37:117 member_expression=>identifier •
                        43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                        43:128 primitive_declaration=>identifier • : type*/
                        var pk = l.copy();
                        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,0);
                        switch(sym_map_28592a8cdba54a6c(pk,data)){
                            case 0:
                                /*43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                                43:128 primitive_declaration=>identifier • : type*/
                                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                                consume(l,data,state);
                                puid |=4;
                                /*43:126 primitive_declaration=>identifier : • type primitive_declaration_group_169_116
                                43:128 primitive_declaration=>identifier : • type*/
                                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                                pushFN(data,branch_45734e4fc3f72f11);
                                pushFN(data,$type);
                                puid |=8;
                                return puid;
                            default:
                            case 1:
                                /*--LEAF--*/
                                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                                /*37:117 member_expression=>identifier •*/
                                add_reduce(state,data,1,67);
                                /*[37]*/
                                prod = 37;
                                continue;;
                            case 2:
                                /*-------------VPROD-------------------------*/
                                /*37:117 member_expression=>identifier •
                                43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                                43:128 primitive_declaration=>identifier • : type*/
                                pushFN(data,branch_f18f4305a86a598a);
                                return 0;
                        }
                    default:
                    case 1:
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*37:117 member_expression=>identifier •*/
                        add_reduce(state,data,1,67);
                        /*[37]*/
                        prod = 37;
                        continue;;
                }
                break;
            case 50:
                /*14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
                14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
                14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
                14:50 function_expression=>modifier_list • fn : type ( ) { }
                43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
                43:127 primitive_declaration=>modifier_list • identifier : type*/
                /*14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
                14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
                14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
                14:50 function_expression=>modifier_list • fn : type ( ) { }
                43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
                43:127 primitive_declaration=>modifier_list • identifier : type*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(/*[fn]*/cmpr_set(l,data,144,2,2)){
                    /*14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
                    14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
                    14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
                    14:50 function_expression=>modifier_list • fn : type ( ) { }*/
                    /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                    consume(l,data,state);
                    puid |=2;
                    /*14:44 function_expression=>modifier_list fn • : type ( parameters ) { expression_statements }
                    14:46 function_expression=>modifier_list fn • : type ( ) { expression_statements }
                    14:47 function_expression=>modifier_list fn • : type ( parameters ) { }
                    14:50 function_expression=>modifier_list fn • : type ( ) { }*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                    if(l.current_byte==58/*[:]*/){
                        consume(l,data,state);
                        puid |=4;
                        /*14:44 function_expression=>modifier_list fn : • type ( parameters ) { expression_statements }
                        14:46 function_expression=>modifier_list fn : • type ( ) { expression_statements }
                        14:47 function_expression=>modifier_list fn : • type ( parameters ) { }
                        14:50 function_expression=>modifier_list fn : • type ( ) { }*/
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                        pushFN(data,branch_aaa43733a017e186);
                        pushFN(data,$type);
                        puid |=8;
                        return puid;
                    }
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
                    /*43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
                    43:127 primitive_declaration=>modifier_list • identifier : type*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                    pushFN(data,branch_a9833e98e62f92d8);
                    pushFN(data,$identifier);
                    puid |=2;
                    return puid;
                }
                break;
        }
        break;
    }
    return prod == 18 ? prod : -1;
}
function $expression_statements_group_023_108_reducer(l,data,state,prod,puid){
    return 18;
}
/*production name: expression_statements_group_124_109
            grammar index: 19
            bodies:
	19:60 expression_statements_group_124_109=>• expression_statements_HC_listbody1_107 expression_statements_group_023_108 - 
		19:61 expression_statements_group_124_109=>• expression_statements_HC_listbody1_107 - 
            compile time: 21.571ms*/;
function $expression_statements_group_124_109(l,data,state,prod,puid){
    /*19:60 expression_statements_group_124_109=>• expression_statements_HC_listbody1_107 expression_statements_group_023_108
    19:61 expression_statements_group_124_109=>• expression_statements_HC_listbody1_107*/
    pushFN(data,branch_668c1fcd2b30f57a);
    pushFN(data,$expression_statements_HC_listbody1_107);
    puid |=1;
    return puid;
    return -1;
}
function $expression_statements_group_124_109_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*19:60 expression_statements_group_124_109=>expression_statements_HC_listbody1_107 expression_statements_group_023_108 •*/
        add_reduce(state,data,2,37);
    } else if(1 == puid){
        /*19:61 expression_statements_group_124_109=>expression_statements_HC_listbody1_107 •*/
        add_reduce(state,data,1,38);
    }
    return 19;
}
/*production name: expression_statements
            grammar index: 20
            bodies:
	20:62 expression_statements=>• expression_statements expression_statements_group_124_109 - 
		20:63 expression_statements=>• expression - 
		20:64 expression_statements=>• primitive_declaration - 
            compile time: 5324.509ms*/;
function $expression_statements(l,data,state,prod,puid){
    /*20:63 expression_statements=>• expression
    20:64 expression_statements=>• primitive_declaration*/
    switch(sym_map_b9a34db74685e187(l,data)){
        case 0:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*20:63 expression_statements=>• expression*/
            puid |=4;
            pushFN(data,branch_8c2f1a4f40eaeb66);
            pushFN(data,$expression);
            return puid;
        case 1:
            /*44:129 identifier=>• tk:identifier_token
            50:143 modifier_list=>• [ modifier_list_HC_listbody1_120 ]*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if(l.current_byte==91/*[[]*/){
                pushFN(data,branch_c0e3727d9ff912b9);
                return branch_f0133d64f87a5b0d(l,data,state,prod,1);
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
                pushFN(data,branch_97946dd38e34dd15);
                return branch_f1b14c28a5ec39ac(l,data,state,prod,1);
            }
        default:
            break;
    }
    return -1;
}
function $expression_statements_goto(l,data,state,prod,puid){
    while(1){
        switch(prod){
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
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                if(l.current_byte==59/*[;]*/){
                    pushFN(data,branch_d2bd478d3a4a66be);
                    return branch_d0a2a5ef6d3b2710(l,data,state,prod,1);
                }
                break;
            case 26:
                /*25:80 binary_expression=>unary_expression • operator
                25:81 binary_expression=>unary_expression • operator expression
                25:82 binary_expression=>unary_expression •*/
                /*25:80 binary_expression=>unary_expression • operator
                25:81 binary_expression=>unary_expression • operator expression
                25:82 binary_expression=>unary_expression •*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                if(sym_map_e58af9c6fd146069(l,data)==1){
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    /*25:82 binary_expression=>unary_expression •*/
                    /*[25]*/
                    add_reduce(state,data,1,3);
                    pushFN(data,$expression_statements_goto);
                    return 20;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if(/*[==]*/cmpr_set(l,data,7,2,2)||l.isSym(true,data)){
                    /*25:80 binary_expression=>unary_expression • operator
                    25:81 binary_expression=>unary_expression • operator expression*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                    pushFN(data,branch_bd593ed6ddb0b062);
                    pushFN(data,$operator);
                    puid |=2;
                    return puid;
                }
                break;
            case 28:
                /*22:76 assignment_expression=>left_hand_expression • = expression
                27:85 unary_value=>left_hand_expression •*/
                /*22:76 assignment_expression=>left_hand_expression • = expression
                27:85 unary_value=>left_hand_expression •*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                switch(sym_map_00f57473245d5924(l,data)){
                    case 0:
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert ⤋⤋⤋*/
                        /*22:76 assignment_expression=>left_hand_expression • = expression*/
                        puid |=2;
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                        puid |=4;
                        pushFN(data,branch_6f2ea2c70840295b);
                        pushFN(data,$expression);
                        return puid;
                    default:
                    case 1:
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*27:85 unary_value=>left_hand_expression •*/
                        /*[27]*/
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
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                switch(sym_map_c82afb129e509311(l,data)){
                    case 0:
                        /*28:91 left_hand_expression=>member_expression •
                        37:116 member_expression=>member_expression • [ expression ]*/
                        var pk = l.copy();
                        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,0);
                        switch(sym_map_5f25d3b4480e3a7f(pk,data)){
                            case 0:
                                /*--LEAF--*/
                                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                                /*37:116 member_expression=>member_expression • [ expression ]*/
                                puid |=8;
                                consume(l,data,state);
                                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                                puid |=16;
                                pushFN(data,branch_ff30a7070c50665a);
                                pushFN(data,$expression);
                                return puid;
                            default:
                            case 1:
                                /*--LEAF--*/
                                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                                /*28:91 left_hand_expression=>member_expression •*/
                                /*[28]*/
                                prod = 28;
                                continue;;
                            case 2:
                                /*--LEAF--*/
                                /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                                /*37:116 member_expression=>member_expression • [ expression ]*/
                                puid |=8;
                                consume(l,data,state);
                                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                                puid |=16;
                                pushFN(data,branch_ff30a7070c50665a);
                                pushFN(data,$expression);
                                return puid;
                        }
                    case 1:
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert ⤋⤋⤋*/
                        /*37:115 member_expression=>member_expression • . identifier*/
                        puid |=2;
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                        puid |=4;
                        pushFN(data,branch_9617773e93a87e23);
                        pushFN(data,$identifier);
                        return puid;
                    case 2:
                        /*36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                        36:114 call_expression=>member_expression • ( )*/
                        var pk = l.copy();
                        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,0);
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        if(pk.current_byte==41/*[)]*/){
                            pushFN(data,branch_521f65aff0d7939b);
                            return branch_12c35f486abaab8c(l,data,state,prod,1);
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        } else if(((((((((((((((/*[if]*/cmpr_set(pk,data,143,2,2)||/*[match]*/cmpr_set(pk,data,67,5,5))||/*[break]*/cmpr_set(pk,data,72,5,5))||/*[return]*/cmpr_set(pk,data,77,6,6))||/*[continue]*/cmpr_set(pk,data,39,8,8))||/*[loop]*/cmpr_set(pk,data,63,4,4))||/*[<<--]*/cmpr_set(pk,data,20,4,4))||/*[==]*/cmpr_set(pk,data,7,2,2))||dt_bcea2102060eab13(pk,data))||/*[true]*/cmpr_set(pk,data,95,4,4))||/*[null]*/cmpr_set(pk,data,35,4,4))||dt_6ae31dd85a62ef5c(pk,data))||assert_ascii(pk,0x0,0x194,0x88000000,0x8000000))||pk.isUniID(data))||pk.isNum(data))||pk.isSym(true,data)){
                            pushFN(data,branch_521f65aff0d7939b);
                            return branch_6273212a0843d505(l,data,state,prod,1);
                        }
                    default:
                    case 3:
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*28:91 left_hand_expression=>member_expression •*/
                        /*[28]*/
                        prod = 28;
                        continue;;
                }
                break;
            case 44:
                /*43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                43:128 primitive_declaration=>identifier • : type
                37:117 member_expression=>identifier •*/
                /*43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                43:128 primitive_declaration=>identifier • : type
                37:117 member_expression=>identifier •*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                switch(sym_map_9fff07fe93fb5f87(l,data)){
                    case 0:
                        /*43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                        43:128 primitive_declaration=>identifier • : type
                        37:117 member_expression=>identifier •*/
                        var pk = l.copy();
                        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,0);
                        switch(sym_map_28592a8cdba54a6c(pk,data)){
                            case 0:
                                /*43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                                43:128 primitive_declaration=>identifier • : type*/
                                /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                                consume(l,data,state);
                                puid |=4;
                                /*43:126 primitive_declaration=>identifier : • type primitive_declaration_group_169_116
                                43:128 primitive_declaration=>identifier : • type*/
                                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                                pushFN(data,branch_fae99b3998280ff3);
                                pushFN(data,$type);
                                puid |=8;
                                return puid;
                            default:
                            case 1:
                                /*--LEAF--*/
                                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                                /*37:117 member_expression=>identifier •*/
                                add_reduce(state,data,1,67);
                                /*[37]*/
                                prod = 37;
                                continue;;
                            case 2:
                                /*-------------VPROD-------------------------*/
                                /*43:126 primitive_declaration=>identifier • : type primitive_declaration_group_169_116
                                43:128 primitive_declaration=>identifier • : type
                                37:117 member_expression=>identifier •*/
                                pushFN(data,branch_c253ee1ffc835768);
                                return 0;
                        }
                    default:
                    case 1:
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*37:117 member_expression=>identifier •*/
                        add_reduce(state,data,1,67);
                        /*[37]*/
                        prod = 37;
                        continue;;
                }
                break;
            case 50:
                /*43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
                43:127 primitive_declaration=>modifier_list • identifier : type
                14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
                14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
                14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
                14:50 function_expression=>modifier_list • fn : type ( ) { }*/
                /*43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
                43:127 primitive_declaration=>modifier_list • identifier : type
                14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
                14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
                14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
                14:50 function_expression=>modifier_list • fn : type ( ) { }*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(/*[fn]*/cmpr_set(l,data,144,2,2)){
                    /*14:44 function_expression=>modifier_list • fn : type ( parameters ) { expression_statements }
                    14:46 function_expression=>modifier_list • fn : type ( ) { expression_statements }
                    14:47 function_expression=>modifier_list • fn : type ( parameters ) { }
                    14:50 function_expression=>modifier_list • fn : type ( ) { }*/
                    /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                    consume(l,data,state);
                    puid |=2;
                    /*14:44 function_expression=>modifier_list fn • : type ( parameters ) { expression_statements }
                    14:46 function_expression=>modifier_list fn • : type ( ) { expression_statements }
                    14:47 function_expression=>modifier_list fn • : type ( parameters ) { }
                    14:50 function_expression=>modifier_list fn • : type ( ) { }*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                    if(l.current_byte==58/*[:]*/){
                        consume(l,data,state);
                        puid |=4;
                        /*14:44 function_expression=>modifier_list fn : • type ( parameters ) { expression_statements }
                        14:46 function_expression=>modifier_list fn : • type ( ) { expression_statements }
                        14:47 function_expression=>modifier_list fn : • type ( parameters ) { }
                        14:50 function_expression=>modifier_list fn : • type ( ) { }*/
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                        pushFN(data,branch_7e5a50f34c79f7dd);
                        pushFN(data,$type);
                        puid |=8;
                        return puid;
                    }
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
                    /*43:125 primitive_declaration=>modifier_list • identifier : type primitive_declaration_group_169_116
                    43:127 primitive_declaration=>modifier_list • identifier : type*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                    pushFN(data,branch_69e9e20fb324bacf);
                    pushFN(data,$identifier);
                    puid |=2;
                    return puid;
                }
                break;
        }
        break;
    }
    return prod == 20 ? prod : -1;
}
function $expression_statements_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*20:62 expression_statements=>expression_statements expression_statements_group_124_109 •*/
        add_reduce(state,data,2,39);
    } else if(4 == puid){
        /*20:63 expression_statements=>expression •*/
        add_reduce(state,data,1,3);
    } else if(8 == puid){
        /*20:64 expression_statements=>primitive_declaration •*/
        add_reduce(state,data,1,3);
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
            compile time: 1077.403ms*/;
function $expression(l,data,state,prod,puid){
    /*44:129 identifier=>• tk:identifier_token
    21:66 expression=>• if_expression
    21:67 expression=>• match_expression
    21:68 expression=>• binary_expression
    72:217 template=>• <<-- θnum -->>
    21:69 expression=>• break_expression
    21:70 expression=>• return_expression
    21:71 expression=>• continue_expression
    21:72 expression=>• loop_expression
    21:73 expression=>• { expression_statements }
    21:75 expression=>• { }*/
    switch(sym_map_c4b3dccaa10a8245(l,data)){
        case 0:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
            /*72:217 template=>• <<-- θnum -->>*/
            puid |=1;
            pushFN(data,branch_ef2dc6f8b6dc9a12);
            pushFN(data,$template);
            return puid;
        case 1:
            /*21:73 expression=>• { expression_statements }
            21:75 expression=>• { }*/
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            puid |=256;
            /*21:73 expression=>{ • expression_statements }
            21:75 expression=>{ • }*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            if(l.current_byte==125/*[}]*/){
                pushFN(data,branch_038b1722715d8efb);
                return branch_7ebf556a2d595773(l,data,state,prod,256);
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            } else if(((((((((((((((/*[if]*/cmpr_set(l,data,143,2,2)||/*[match]*/cmpr_set(l,data,67,5,5))||/*[break]*/cmpr_set(l,data,72,5,5))||/*[return]*/cmpr_set(l,data,77,6,6))||/*[continue]*/cmpr_set(l,data,39,8,8))||/*[loop]*/cmpr_set(l,data,63,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[==]*/cmpr_set(l,data,7,2,2))||dt_bcea2102060eab13(l,data))||/*[true]*/cmpr_set(l,data,95,4,4))||/*[null]*/cmpr_set(l,data,35,4,4))||dt_6ae31dd85a62ef5c(l,data))||assert_ascii(l,0x0,0x194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
                pushFN(data,branch_038b1722715d8efb);
                return branch_4efdbb5c9dee38e5(l,data,state,prod,256);
            }
        case 2:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*21:66 expression=>• if_expression*/
            puid |=2;
            pushFN(data,branch_06cfe146e7444a88);
            pushFN(data,$if_expression);
            return puid;
        case 3:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*21:67 expression=>• match_expression*/
            puid |=4;
            pushFN(data,branch_06cfe146e7444a88);
            pushFN(data,$match_expression);
            return puid;
        case 4:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*21:69 expression=>• break_expression*/
            puid |=16;
            pushFN(data,branch_06cfe146e7444a88);
            pushFN(data,$break_expression);
            return puid;
        case 5:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*21:70 expression=>• return_expression*/
            puid |=32;
            pushFN(data,branch_06cfe146e7444a88);
            pushFN(data,$return_expression);
            return puid;
        case 6:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*21:71 expression=>• continue_expression*/
            puid |=64;
            pushFN(data,branch_06cfe146e7444a88);
            pushFN(data,$continue_expression);
            return puid;
        case 7:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*21:72 expression=>• loop_expression*/
            puid |=128;
            pushFN(data,branch_06cfe146e7444a88);
            pushFN(data,$loop_expression);
            return puid;
        case 8:
            /*--LEAF--*/
            /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
            /*44:129 identifier=>• tk:identifier_token*/
            puid |=1;
            pushFN(data,branch_df9f6863c7454e16);
            pushFN(data,$identifier);
            return puid;
        case 9:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*21:68 expression=>• binary_expression*/
            puid |=8;
            pushFN(data,branch_06cfe146e7444a88);
            pushFN(data,$binary_expression);
            return puid;
        default:
            break;
    }
    return -1;
}
function $expression_goto(l,data,state,prod,puid){
    while(1){
        switch(prod){
            case 26:
                /*25:80 binary_expression=>unary_expression • operator
                25:81 binary_expression=>unary_expression • operator expression
                25:82 binary_expression=>unary_expression •*/
                /*25:80 binary_expression=>unary_expression • operator
                25:81 binary_expression=>unary_expression • operator expression
                25:82 binary_expression=>unary_expression •*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                if(sym_map_a6e19c42d2a4699a(l,data)==1){
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    /*25:82 binary_expression=>unary_expression •*/
                    /*[25]*/
                    return 21;
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                } else if(/*[==]*/cmpr_set(l,data,7,2,2)||l.isSym(true,data)){
                    /*25:80 binary_expression=>unary_expression • operator
                    25:81 binary_expression=>unary_expression • operator expression*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                    pushFN(data,branch_4e942b265da6886a);
                    pushFN(data,$operator);
                    puid |=2;
                    return puid;
                }
                break;
            case 28:
                /*22:76 assignment_expression=>left_hand_expression • = expression
                27:85 unary_value=>left_hand_expression •*/
                /*22:76 assignment_expression=>left_hand_expression • = expression
                27:85 unary_value=>left_hand_expression •*/
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                switch(sym_map_00f57473245d5924(l,data)){
                    case 0:
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert ⤋⤋⤋*/
                        /*22:76 assignment_expression=>left_hand_expression • = expression*/
                        puid |=2;
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                        puid |=4;
                        pushFN(data,branch_c9fbafe8a503384d);
                        pushFN(data,$expression);
                        return puid;
                    default:
                    case 1:
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*27:85 unary_value=>left_hand_expression •*/
                        /*[27]*/
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
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                switch(sym_map_c82afb129e509311(l,data)){
                    case 0:
                        /*28:91 left_hand_expression=>member_expression •
                        37:116 member_expression=>member_expression • [ expression ]*/
                        var pk = l.copy();
                        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,0);
                        switch(sym_map_5f25d3b4480e3a7f(pk,data)){
                            case 0:
                                /*--LEAF--*/
                                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                                /*37:116 member_expression=>member_expression • [ expression ]*/
                                puid |=8;
                                consume(l,data,state);
                                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                                puid |=16;
                                pushFN(data,branch_dcc7cd59193ed8e1);
                                pushFN(data,$expression);
                                return puid;
                            default:
                            case 1:
                                /*--LEAF--*/
                                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                                /*28:91 left_hand_expression=>member_expression •*/
                                /*[28]*/
                                prod = 28;
                                continue;;
                            case 2:
                                /*--LEAF--*/
                                /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                                /*37:116 member_expression=>member_expression • [ expression ]*/
                                puid |=8;
                                consume(l,data,state);
                                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                                puid |=16;
                                pushFN(data,branch_dcc7cd59193ed8e1);
                                pushFN(data,$expression);
                                return puid;
                        }
                    case 1:
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert ⤋⤋⤋*/
                        /*37:115 member_expression=>member_expression • . identifier*/
                        puid |=2;
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                        puid |=4;
                        pushFN(data,branch_1066f2a4cb876358);
                        pushFN(data,$identifier);
                        return puid;
                    case 2:
                        /*36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                        36:114 call_expression=>member_expression • ( )*/
                        var pk = l.copy();
                        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,0);
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        if(pk.current_byte==41/*[)]*/){
                            pushFN(data,branch_b6429eb3c6827a44);
                            return branch_12c35f486abaab8c(l,data,state,prod,1);
                            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        } else if(((((((((((((((/*[if]*/cmpr_set(pk,data,143,2,2)||/*[match]*/cmpr_set(pk,data,67,5,5))||/*[break]*/cmpr_set(pk,data,72,5,5))||/*[return]*/cmpr_set(pk,data,77,6,6))||/*[continue]*/cmpr_set(pk,data,39,8,8))||/*[loop]*/cmpr_set(pk,data,63,4,4))||/*[<<--]*/cmpr_set(pk,data,20,4,4))||/*[==]*/cmpr_set(pk,data,7,2,2))||dt_bcea2102060eab13(pk,data))||/*[true]*/cmpr_set(pk,data,95,4,4))||/*[null]*/cmpr_set(pk,data,35,4,4))||dt_6ae31dd85a62ef5c(pk,data))||assert_ascii(pk,0x0,0x194,0x88000000,0x8000000))||pk.isUniID(data))||pk.isNum(data))||pk.isSym(true,data)){
                            pushFN(data,branch_b6429eb3c6827a44);
                            return branch_6273212a0843d505(l,data,state,prod,1);
                        }
                    default:
                    case 3:
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*28:91 left_hand_expression=>member_expression •*/
                        /*[28]*/
                        prod = 28;
                        continue;;
                }
                break;
            case 72:
                /*56:168 value=>template •
                21:74 expression=>template •*/
                /*56:168 value=>template •
                21:74 expression=>template •*/
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                if(sym_map_f9b1ea7f7d1d130b(l,data)==1){
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    /*21:74 expression=>template •*/
                    add_reduce(state,data,1,41);
                    /*[21]*/
                    return 21;
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                } else {
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    /*56:168 value=>template •*/
                    add_reduce(state,data,1,86);
                    /*[56]*/
                    prod = 26;
                    continue;;
                }
                break;
        }
        break;
    }
    return prod == 21 ? prod : -1;
}
function $expression_reducer(l,data,state,prod,puid){
    if(1792 == puid){
        /*21:73 expression=>{ expression_statements } •*/
        add_reduce(state,data,3,40);
    } else if(2048 == puid){
        /*21:74 expression=>template •*/
        add_reduce(state,data,1,41);
    } else if(1280 == puid){
        /*21:75 expression=>{ } •*/
        add_reduce(state,data,2,42);
    }
    return 21;
}
/*production name: if_expression_group_139_110
            grammar index: 23
            bodies:
	23:77 if_expression_group_139_110=>• else expression - 
            compile time: 3.472ms*/;
function $if_expression_group_139_110(l,data,state,prod,puid){
    /*23:77 if_expression_group_139_110=>• else expression*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(/*[else]*/cmpr_set(l,data,128,4,4)){
        consume(l,data,state);
        puid |=1;
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        /*23:77 if_expression_group_139_110=>else • expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        puid |=2;
        pushFN(data,branch_b33c031c1594b433);
        pushFN(data,$expression);
        return puid;
    }
    return -1;
}
function $if_expression_group_139_110_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*23:77 if_expression_group_139_110=>else expression •*/
        add_reduce(state,data,2,0);
    }
    return 23;
}
/*production name: if_expression
            grammar index: 24
            bodies:
	24:78 if_expression=>• if expression : expression if_expression_group_139_110 - 
		24:79 if_expression=>• if expression : expression - 
            compile time: 212.37ms*/;
function $if_expression(l,data,state,prod,puid){
    /*24:78 if_expression=>• if expression : expression if_expression_group_139_110
    24:79 if_expression=>• if expression : expression*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(/*[if]*/cmpr_set(l,data,143,2,2)){
        consume(l,data,state);
        puid |=1;
        /*24:78 if_expression=>if • expression : expression if_expression_group_139_110
        24:79 if_expression=>if • expression : expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_ca29124f1bf003e4);
        pushFN(data,$expression);
        puid |=2;
        return puid;
    }
    return -1;
}
function $if_expression_reducer(l,data,state,prod,puid){
    if(15 == puid){
        /*24:78 if_expression=>if expression : expression if_expression_group_139_110 •*/
        add_reduce(state,data,5,44);
    } else if(7 == puid){
        /*24:79 if_expression=>if expression : expression •*/
        add_reduce(state,data,4,45);
    }
    return 24;
}
/*production name: binary_expression
            grammar index: 25
            bodies:
	25:80 binary_expression=>• unary_expression operator - 
		25:81 binary_expression=>• unary_expression operator expression - 
		25:82 binary_expression=>• unary_expression - 
            compile time: 547.596ms*/;
function $binary_expression(l,data,state,prod,puid){
    /*25:80 binary_expression=>• unary_expression operator
    25:81 binary_expression=>• unary_expression operator expression
    25:82 binary_expression=>• unary_expression*/
    pushFN(data,branch_a31682fadf547063);
    pushFN(data,$unary_expression);
    puid |=1;
    return puid;
    return -1;
}
function $binary_expression_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*25:80 binary_expression=>unary_expression operator •*/
        add_reduce(state,data,2,46);
    } else if(7 == puid){
        /*25:81 binary_expression=>unary_expression operator expression •*/
        add_reduce(state,data,3,47);
    }
    return 25;
}
/*production name: unary_expression
            grammar index: 26
            bodies:
	26:83 unary_expression=>• operator unary_value - 
		26:84 unary_expression=>• unary_value - 
            compile time: 12.714ms*/;
function $unary_expression(l,data,state,prod,puid){
    /*26:83 unary_expression=>• operator unary_value
    26:84 unary_expression=>• unary_value*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(((((((dt_bcea2102060eab13(l,data)||dt_6ae31dd85a62ef5c(l,data))||/*[true]*/cmpr_set(l,data,95,4,4))||/*[null]*/cmpr_set(l,data,35,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||assert_ascii(l,0x0,0x194,0x88000000,0x0))||l.isUniID(data))||l.isNum(data)){
        pushFN(data,branch_bf312da1e8e7a614);
        return branch_192ab89f18f9d91c(l,data,state,prod,2);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(/*[==]*/cmpr_set(l,data,7,2,2)||l.isSym(true,data)){
        pushFN(data,branch_bf312da1e8e7a614);
        return branch_800ab341c1d5f272(l,data,state,prod,1);
    }
    return -1;
}
function $unary_expression_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*26:83 unary_expression=>operator unary_value •*/
        add_reduce(state,data,2,46);
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
            compile time: 357.396ms*/;
function $unary_value(l,data,state,prod,puid){
    /*44:129 identifier=>• tk:identifier_token
    27:87 unary_value=>• function_expression
    27:88 unary_value=>• value
    27:89 unary_value=>• ( expression_statements_group_023_108 )
    27:90 unary_value=>• ( )*/
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(l.current_byte==40/*[(]*/){
        /*27:89 unary_value=>• ( expression_statements_group_023_108 )
        27:90 unary_value=>• ( )*/
        /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
        consume(l,data,state);
        puid |=16;
        /*27:89 unary_value=>( • expression_statements_group_023_108 )
        27:90 unary_value=>( • )*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.current_byte==41/*[)]*/){
            pushFN(data,branch_07c4b2a266e81cdd);
            return branch_db86d33d92d5e26d(l,data,state,prod,16);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if(((((((((((((((/*[if]*/cmpr_set(l,data,143,2,2)||/*[match]*/cmpr_set(l,data,67,5,5))||/*[==]*/cmpr_set(l,data,7,2,2))||dt_bcea2102060eab13(l,data))||dt_6ae31dd85a62ef5c(l,data))||/*[true]*/cmpr_set(l,data,95,4,4))||/*[null]*/cmpr_set(l,data,35,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[break]*/cmpr_set(l,data,72,5,5))||/*[return]*/cmpr_set(l,data,77,6,6))||/*[continue]*/cmpr_set(l,data,39,8,8))||/*[loop]*/cmpr_set(l,data,63,4,4))||assert_ascii(l,0x0,0x194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
            pushFN(data,branch_07c4b2a266e81cdd);
            return branch_b60e1bb25efbee57(l,data,state,prod,16);
        }
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(/*[fn]*/cmpr_set(l,data,144,2,2)||(l.current_byte==91/*[[]*/)){
        pushFN(data,branch_07c4b2a266e81cdd);
        return branch_94c3f837681a6d57(l,data,state,prod,4);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(((((((dt_6ae31dd85a62ef5c(l,data)||/*[true]*/cmpr_set(l,data,95,4,4))||/*[false]*/cmpr_set(l,data,53,5,5))||/*[null]*/cmpr_set(l,data,35,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||(l.current_byte==34/*["]*/))||(l.current_byte==39/*[']*/))||l.isNum(data)){
        pushFN(data,branch_07c4b2a266e81cdd);
        return branch_78c0177f3f3b49f8(l,data,state,prod,8);
        /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    } else if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
        pushFN(data,branch_d1cfa7d2150e033a);
        return branch_cb6f2beb6b754054(l,data,state,prod,1);
    }
    return -1;
}
function $unary_value_goto(l,data,state,prod,puid){
    while(1){
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
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        switch(sym_map_c82afb129e509311(l,data)){
            case 0:
                /*28:91 left_hand_expression=>member_expression •
                37:116 member_expression=>member_expression • [ expression ]*/
                var pk = l.copy();
                skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,0);
                switch(sym_map_5f25d3b4480e3a7f(pk,data)){
                    case 0:
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        /*37:116 member_expression=>member_expression • [ expression ]*/
                        puid |=8;
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                        puid |=16;
                        pushFN(data,branch_1ac32cd10b3e6d0e);
                        pushFN(data,$expression);
                        return puid;
                    default:
                    case 1:
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*28:91 left_hand_expression=>member_expression •*/
                        /*[28]*/
                        return 27;
                    case 2:
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                        /*37:116 member_expression=>member_expression • [ expression ]*/
                        puid |=8;
                        consume(l,data,state);
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                        puid |=16;
                        pushFN(data,branch_1ac32cd10b3e6d0e);
                        pushFN(data,$expression);
                        return puid;
                }
            case 1:
                /*--LEAF--*/
                /*⤋⤋⤋ assert ⤋⤋⤋*/
                /*37:115 member_expression=>member_expression • . identifier*/
                puid |=2;
                consume(l,data,state);
                skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                puid |=4;
                pushFN(data,branch_9ccf045621edc1f2);
                pushFN(data,$identifier);
                return puid;
            case 2:
                /*36:113 call_expression=>member_expression • ( call_expression_HC_listbody2_114 )
                36:114 call_expression=>member_expression • ( )*/
                var pk = l.copy();
                skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,0);
                /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                if(pk.current_byte==41/*[)]*/){
                    pushFN(data,branch_1202bfb712d31996);
                    return branch_12c35f486abaab8c(l,data,state,prod,1);
                    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                } else if(((((((((((((((/*[if]*/cmpr_set(pk,data,143,2,2)||/*[match]*/cmpr_set(pk,data,67,5,5))||/*[break]*/cmpr_set(pk,data,72,5,5))||/*[return]*/cmpr_set(pk,data,77,6,6))||/*[continue]*/cmpr_set(pk,data,39,8,8))||/*[loop]*/cmpr_set(pk,data,63,4,4))||/*[<<--]*/cmpr_set(pk,data,20,4,4))||/*[==]*/cmpr_set(pk,data,7,2,2))||dt_bcea2102060eab13(pk,data))||/*[true]*/cmpr_set(pk,data,95,4,4))||/*[null]*/cmpr_set(pk,data,35,4,4))||dt_6ae31dd85a62ef5c(pk,data))||assert_ascii(pk,0x0,0x194,0x88000000,0x8000000))||pk.isUniID(data))||pk.isNum(data))||pk.isSym(true,data)){
                    pushFN(data,branch_1202bfb712d31996);
                    return branch_6273212a0843d505(l,data,state,prod,1);
                }
            default:
            case 3:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                /*28:91 left_hand_expression=>member_expression •*/
                /*[28]*/
                return 27;
        }
        break;
    }
    return prod == 27 ? prod : -1;
}
function $unary_value_reducer(l,data,state,prod,puid){
    if(112 == puid){
        /*27:89 unary_value=>( expression_statements_group_023_108 ) •*/
        add_reduce(state,data,3,48);
    } else if(80 == puid){
        /*27:90 unary_value=>( ) •*/
        add_reduce(state,data,2,49);
    }
    return 27;
}
/*production name: loop_expression_group_254_111
            grammar index: 29
            bodies:
	29:92 loop_expression_group_254_111=>• ( expression ) - 
		29:93 loop_expression_group_254_111=>• ( ) - 
            compile time: 26.11ms*/;
function $loop_expression_group_254_111(l,data,state,prod,puid){
    /*29:92 loop_expression_group_254_111=>• ( expression )
    29:93 loop_expression_group_254_111=>• ( )*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==40/*[(]*/){
        consume(l,data,state);
        puid |=1;
        /*29:92 loop_expression_group_254_111=>( • expression )
        29:93 loop_expression_group_254_111=>( • )*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.current_byte==41/*[)]*/){
            pushFN(data,branch_bf8e71a01f2eba15);
            return branch_b0455ab380c02369(l,data,state,prod,1);
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        } else if(((((((((((((((/*[if]*/cmpr_set(l,data,143,2,2)||/*[match]*/cmpr_set(l,data,67,5,5))||/*[==]*/cmpr_set(l,data,7,2,2))||dt_bcea2102060eab13(l,data))||dt_6ae31dd85a62ef5c(l,data))||/*[true]*/cmpr_set(l,data,95,4,4))||/*[null]*/cmpr_set(l,data,35,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[break]*/cmpr_set(l,data,72,5,5))||/*[return]*/cmpr_set(l,data,77,6,6))||/*[continue]*/cmpr_set(l,data,39,8,8))||/*[loop]*/cmpr_set(l,data,63,4,4))||assert_ascii(l,0x0,0x194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
            pushFN(data,branch_bf8e71a01f2eba15);
            return branch_744b33150361e31f(l,data,state,prod,1);
        }
    }
    return -1;
}
function $loop_expression_group_254_111_reducer(l,data,state,prod,puid){
    if(7 == puid){
        /*29:92 loop_expression_group_254_111=>( expression ) •*/
        add_reduce(state,data,3,37);
    } else if(5 == puid){
        /*29:93 loop_expression_group_254_111=>( ) •*/
        add_reduce(state,data,2,38);
    }
    return 29;
}
/*production name: loop_expression_HC_listbody6_112
            grammar index: 30
            bodies:
	30:94 loop_expression_HC_listbody6_112=>• loop_expression_HC_listbody6_112 , expression - 
		30:95 loop_expression_HC_listbody6_112=>• expression - 
            compile time: 309.506ms*/;
function $loop_expression_HC_listbody6_112(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*30:95 loop_expression_HC_listbody6_112=>• expression*/
    puid |=4;
    pushFN(data,branch_3008f2fb2bb017b3);
    pushFN(data,$expression);
    return puid;
    return -1;
}
function $loop_expression_HC_listbody6_112_goto(l,data,state,prod,puid){
    /*30:94 loop_expression_HC_listbody6_112=>loop_expression_HC_listbody6_112 • , expression*/
    /*30:94 loop_expression_HC_listbody6_112=>loop_expression_HC_listbody6_112 • , expression
    31:97 loop_expression=>loop ( parameters ; expression ; loop_expression_HC_listbody6_112 • ) expression
    31:99 loop_expression=>loop ( ; expression ; loop_expression_HC_listbody6_112 • ) expression
    31:100 loop_expression=>loop ( parameters ; ; loop_expression_HC_listbody6_112 • ) expression
    31:102 loop_expression=>loop ( ; ; loop_expression_HC_listbody6_112 • ) expression*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(l.current_byte==44/*[,]*/){
        pushFN(data,branch_584051a55d809a1f);
        return branch_8d8962ad46c1a268(l,data,state,prod,1);
    }
    return prod == 30 ? prod : -1;
}
function $loop_expression_HC_listbody6_112_reducer(l,data,state,prod,puid){
    if(7 == puid){
        /*30:94 loop_expression_HC_listbody6_112=>loop_expression_HC_listbody6_112 , expression •*/
        add_reduce(state,data,3,36);
    } else if(4 == puid){
        /*30:95 loop_expression_HC_listbody6_112=>expression •*/
        add_reduce(state,data,1,3);
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
            compile time: 5981.561ms*/;
function $loop_expression(l,data,state,prod,puid){
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
    if(/*[loop]*/cmpr_set(l,data,63,4,4)){
        consume(l,data,state);
        puid |=1;
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
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(l.current_byte==40/*[(]*/){
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
            skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,0);
            switch(sym_map_cd68132adf65e929(pk,data)){
                case 0:
                    /*31:99 loop_expression=>loop • ( ; expression ; loop_expression_HC_listbody6_112 ) expression
                    31:102 loop_expression=>loop • ( ; ; loop_expression_HC_listbody6_112 ) expression
                    31:103 loop_expression=>loop • ( ; expression ; ) expression
                    31:105 loop_expression=>loop • ( ; ; ) expression*/
                    /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                    consume(l,data,state);
                    puid |=8;
                    /*31:99 loop_expression=>loop ( • ; expression ; loop_expression_HC_listbody6_112 ) expression
                    31:102 loop_expression=>loop ( • ; ; loop_expression_HC_listbody6_112 ) expression
                    31:103 loop_expression=>loop ( • ; expression ; ) expression
                    31:105 loop_expression=>loop ( • ; ; ) expression*/
                    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
                    if(l.current_byte==59/*[;]*/){
                        consume(l,data,state);
                        puid |=32;
                        /*31:99 loop_expression=>loop ( ; • expression ; loop_expression_HC_listbody6_112 ) expression
                        31:103 loop_expression=>loop ( ; • expression ; ) expression
                        31:102 loop_expression=>loop ( ; • ; loop_expression_HC_listbody6_112 ) expression
                        31:105 loop_expression=>loop ( ; • ; ) expression*/
                        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
                        if(l.current_byte==59/*[;]*/){
                            /*31:102 loop_expression=>loop ( ; • ; loop_expression_HC_listbody6_112 ) expression
                            31:105 loop_expression=>loop ( ; • ; ) expression*/
                            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
                            consume(l,data,state);
                            puid |=32;
                            /*31:102 loop_expression=>loop ( ; ; • loop_expression_HC_listbody6_112 ) expression
                            31:105 loop_expression=>loop ( ; ; • ) expression*/
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                            /*⤋⤋⤋ assert ⤋⤋⤋*/
                            if(l.current_byte==41/*[)]*/){
                                pushFN(data,branch_5814d05b2ded1273);
                                return branch_23c8fe0c669262f0(l,data,state,prod,32);
                                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                            } else if(((((((((((((((/*[if]*/cmpr_set(l,data,143,2,2)||/*[match]*/cmpr_set(l,data,67,5,5))||/*[break]*/cmpr_set(l,data,72,5,5))||/*[return]*/cmpr_set(l,data,77,6,6))||/*[continue]*/cmpr_set(l,data,39,8,8))||/*[loop]*/cmpr_set(l,data,63,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[==]*/cmpr_set(l,data,7,2,2))||dt_bcea2102060eab13(l,data))||/*[true]*/cmpr_set(l,data,95,4,4))||/*[null]*/cmpr_set(l,data,35,4,4))||dt_6ae31dd85a62ef5c(l,data))||assert_ascii(l,0x0,0x194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
                                pushFN(data,branch_5814d05b2ded1273);
                                return branch_79f7ddcfe867ba26(l,data,state,prod,32);
                            }
                            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                        } else if(((((((((((((((/*[if]*/cmpr_set(l,data,143,2,2)||/*[match]*/cmpr_set(l,data,67,5,5))||/*[==]*/cmpr_set(l,data,7,2,2))||dt_bcea2102060eab13(l,data))||dt_6ae31dd85a62ef5c(l,data))||/*[true]*/cmpr_set(l,data,95,4,4))||/*[null]*/cmpr_set(l,data,35,4,4))||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[break]*/cmpr_set(l,data,72,5,5))||/*[return]*/cmpr_set(l,data,77,6,6))||/*[continue]*/cmpr_set(l,data,39,8,8))||/*[loop]*/cmpr_set(l,data,63,4,4))||assert_ascii(l,0x0,0x194,0x88000000,0x8000000))||l.isUniID(data))||l.isNum(data))||l.isSym(true,data)){
                            /*31:99 loop_expression=>loop ( ; • expression ; loop_expression_HC_listbody6_112 ) expression
                            31:103 loop_expression=>loop ( ; • expression ; ) expression*/
                            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
                            pushFN(data,branch_965da54cfd0e44a2);
                            pushFN(data,$expression);
                            puid |=4;
                            return puid;
                        }
                    }
                case 1:
                    /*--LEAF--*/
                    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                    /*31:96 loop_expression=>loop • loop_expression_group_254_111 expression*/
                    puid |=2;
                    pushFN(data,branch_56ea7a47b85970be);
                    pushFN(data,$loop_expression_group_254_111);
                    return puid;
                case 2:
                    /*-------------VPROD-------------------------*/
                    /*31:96 loop_expression=>loop • loop_expression_group_254_111 expression
                    31:97 loop_expression=>loop • ( parameters ; expression ; loop_expression_HC_listbody6_112 ) expression
                    31:100 loop_expression=>loop • ( parameters ; ; loop_expression_HC_listbody6_112 ) expression
                    31:101 loop_expression=>loop • ( parameters ; expression ; ) expression
                    31:104 loop_expression=>loop • ( parameters ; ; ) expression
                    31:98 loop_expression=>loop • ( primitive_declaration in expression ) expression*/
                    pushFN(data,branch_69b20f82bd102217);
                    return 0;
                default:
                    break;
            }
        }
    }
    return -1;
}
function $loop_expression_reducer(l,data,state,prod,puid){
    if(7 == puid){
        /*31:96 loop_expression=>loop loop_expression_group_254_111 expression •*/
        add_reduce(state,data,3,50);
    } else if(253 == puid){
        /*31:97 loop_expression=>loop ( parameters ; expression ; loop_expression_HC_listbody6_112 ) expression •*/
        add_reduce(state,data,9,51);
    } else if(909 == puid){
        /*31:98 loop_expression=>loop ( primitive_declaration in expression ) expression •*/
        add_reduce(state,data,7,52);
    } else if(237 == puid){
        /*31:99 loop_expression=>loop ( ; expression ; loop_expression_HC_listbody6_112 ) expression •*/
        add_reduce(state,data,8,53);
    } else if(253 == puid){
        /*31:100 loop_expression=>loop ( parameters ; ; loop_expression_HC_listbody6_112 ) expression •*/
        add_reduce(state,data,8,54);
    } else if(189 == puid){
        /*31:101 loop_expression=>loop ( parameters ; expression ; ) expression •*/
        add_reduce(state,data,8,55);
    } else if(237 == puid){
        /*31:102 loop_expression=>loop ( ; ; loop_expression_HC_listbody6_112 ) expression •*/
        add_reduce(state,data,7,56);
    } else if(173 == puid){
        /*31:103 loop_expression=>loop ( ; expression ; ) expression •*/
        add_reduce(state,data,7,57);
    } else if(189 == puid){
        /*31:104 loop_expression=>loop ( parameters ; ; ) expression •*/
        add_reduce(state,data,7,58);
    } else if(173 == puid){
        /*31:105 loop_expression=>loop ( ; ; ) expression •*/
        add_reduce(state,data,6,59);
    }
    return 31;
}
/*production name: match_expression_HC_listbody3_113
            grammar index: 32
            bodies:
	32:106 match_expression_HC_listbody3_113=>• match_expression_HC_listbody3_113 , match_clause - 
		32:107 match_expression_HC_listbody3_113=>• match_clause - 
            compile time: 231.52ms*/;
function $match_expression_HC_listbody3_113(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*32:107 match_expression_HC_listbody3_113=>• match_clause*/
    puid |=4;
    pushFN(data,branch_8b63b777dc5bd4aa);
    pushFN(data,$match_clause);
    return puid;
    return -1;
}
function $match_expression_HC_listbody3_113_goto(l,data,state,prod,puid){
    /*32:106 match_expression_HC_listbody3_113=>match_expression_HC_listbody3_113 • , match_clause*/
    /*32:106 match_expression_HC_listbody3_113=>match_expression_HC_listbody3_113 • , match_clause
    33:108 match_expression=>match expression : match_expression_HC_listbody3_113 •*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
    if(l.current_byte==44/*[,]*/){
        pushFN(data,branch_9ebcaffd71102f54);
        return branch_ae3144e9e413a00d(l,data,state,prod,1);
    }
    return prod == 32 ? prod : -1;
}
function $match_expression_HC_listbody3_113_reducer(l,data,state,prod,puid){
    if(7 == puid){
        /*32:106 match_expression_HC_listbody3_113=>match_expression_HC_listbody3_113 , match_clause •*/
        add_reduce(state,data,3,36);
    } else if(4 == puid){
        /*32:107 match_expression_HC_listbody3_113=>match_clause •*/
        add_reduce(state,data,1,3);
    }
    return 32;
}
/*production name: match_expression
            grammar index: 33
            bodies:
	33:108 match_expression=>• match expression : match_expression_HC_listbody3_113 - 
		33:109 match_expression=>• match expression : - 
            compile time: 407.923ms*/;
function $match_expression(l,data,state,prod,puid){
    /*33:108 match_expression=>• match expression : match_expression_HC_listbody3_113
    33:109 match_expression=>• match expression :*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(/*[match]*/cmpr_set(l,data,67,5,5)){
        consume(l,data,state);
        puid |=1;
        /*33:108 match_expression=>match • expression : match_expression_HC_listbody3_113
        33:109 match_expression=>match • expression :*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_c039347047679c50);
        pushFN(data,$expression);
        puid |=2;
        return puid;
    }
    return -1;
}
function $match_expression_reducer(l,data,state,prod,puid){
    if(15 == puid){
        /*33:108 match_expression=>match expression : match_expression_HC_listbody3_113 •*/
        add_reduce(state,data,4,60);
    } else if(7 == puid){
        /*33:109 match_expression=>match expression : •*/
        add_reduce(state,data,3,61);
    }
    return 33;
}
/*production name: match_clause
            grammar index: 34
            bodies:
	34:110 match_clause=>• expression : expression - 
            compile time: 2.902ms*/;
function $match_clause(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*34:110 match_clause=>• expression : expression*/
    puid |=1;
    pushFN(data,branch_1d70c16834b7f911);
    pushFN(data,$expression);
    return puid;
    return -1;
}
function $match_clause_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*34:110 match_clause=>expression : expression •*/
        add_reduce(state,data,3,62);
    }
    return 34;
}
/*production name: call_expression_HC_listbody2_114
            grammar index: 35
            bodies:
	35:111 call_expression_HC_listbody2_114=>• call_expression_HC_listbody2_114 , expression - 
		35:112 call_expression_HC_listbody2_114=>• expression - 
            compile time: 8.259ms*/;
function $call_expression_HC_listbody2_114(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*35:112 call_expression_HC_listbody2_114=>• expression*/
    puid |=4;
    pushFN(data,branch_926c368886c7cc2d);
    pushFN(data,$expression);
    return puid;
    return -1;
}
function $call_expression_HC_listbody2_114_goto(l,data,state,prod,puid){
    /*35:111 call_expression_HC_listbody2_114=>call_expression_HC_listbody2_114 • , expression*/
    /*35:111 call_expression_HC_listbody2_114=>call_expression_HC_listbody2_114 • , expression
    36:113 call_expression=>member_expression ( call_expression_HC_listbody2_114 • )*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(l.current_byte==44/*[,]*/){
        pushFN(data,branch_4362b80f6cbd9c89);
        return branch_93995390a0daada0(l,data,state,prod,1);
    }
    return prod == 35 ? prod : -1;
}
function $call_expression_HC_listbody2_114_reducer(l,data,state,prod,puid){
    if(7 == puid){
        /*35:111 call_expression_HC_listbody2_114=>call_expression_HC_listbody2_114 , expression •*/
        add_reduce(state,data,3,36);
    } else if(4 == puid){
        /*35:112 call_expression_HC_listbody2_114=>expression •*/
        add_reduce(state,data,1,3);
    }
    return 35;
}
/*production name: break_expression_group_164_115
            grammar index: 38
            bodies:
	38:118 break_expression_group_164_115=>• : expression - 
            compile time: 2.934ms*/;
function $break_expression_group_164_115(l,data,state,prod,puid){
    /*38:118 break_expression_group_164_115=>• : expression*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==58/*[:]*/){
        consume(l,data,state);
        puid |=1;
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        /*38:118 break_expression_group_164_115=>: • expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        puid |=2;
        pushFN(data,branch_b41128aad158965f);
        pushFN(data,$expression);
        return puid;
    }
    return -1;
}
function $break_expression_group_164_115_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*38:118 break_expression_group_164_115=>: expression •*/
        add_reduce(state,data,2,0);
    }
    return 38;
}
/*production name: break_expression
            grammar index: 39
            bodies:
	39:119 break_expression=>• break break_expression_group_164_115 - 
		39:120 break_expression=>• break - 
            compile time: 236.756ms*/;
function $break_expression(l,data,state,prod,puid){
    /*39:119 break_expression=>• break break_expression_group_164_115
    39:120 break_expression=>• break*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(/*[break]*/cmpr_set(l,data,72,5,5)){
        consume(l,data,state);
        puid |=1;
        /*39:119 break_expression=>break • break_expression_group_164_115
        39:120 break_expression=>break •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        switch(sym_map_9fff07fe93fb5f87(l,data)){
            case 0:
                /*39:119 break_expression=>break • break_expression_group_164_115
                39:120 break_expression=>break •*/
                var pk = l.copy();
                skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,0);
                switch(sym_map_3f1906a33bff1b18(pk,data)){
                    default:
                    case 0:
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*39:120 break_expression=>break •*/
                        add_reduce(state,data,1,69);
                        /*[39]*/
                        return 39;
                    case 1:
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                        /*39:119 break_expression=>break • break_expression_group_164_115*/
                        puid |=2;
                        pushFN(data,branch_e6dd069d66fdbfd2);
                        pushFN(data,$break_expression_group_164_115);
                        return puid;
                }
            default:
            case 1:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                /*39:120 break_expression=>break •*/
                add_reduce(state,data,1,69);
                /*[39]*/
                return 39;
        }
    }
    return -1;
}
function $break_expression_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*39:119 break_expression=>break break_expression_group_164_115 •*/
        add_reduce(state,data,2,68);
    } else if(1 == puid){
        /*39:120 break_expression=>break •*/
        add_reduce(state,data,1,69);
    }
    return 39;
}
/*production name: return_expression
            grammar index: 40
            bodies:
	40:121 return_expression=>• return break_expression_group_164_115 - 
		40:122 return_expression=>• return - 
            compile time: 377.19ms*/;
function $return_expression(l,data,state,prod,puid){
    /*40:121 return_expression=>• return break_expression_group_164_115
    40:122 return_expression=>• return*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(/*[return]*/cmpr_set(l,data,77,6,6)){
        consume(l,data,state);
        puid |=1;
        /*40:121 return_expression=>return • break_expression_group_164_115
        40:122 return_expression=>return •*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        switch(sym_map_9fff07fe93fb5f87(l,data)){
            case 0:
                /*40:121 return_expression=>return • break_expression_group_164_115
                40:122 return_expression=>return •*/
                var pk = l.copy();
                skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,0);
                switch(sym_map_3f1906a33bff1b18(pk,data)){
                    default:
                    case 0:
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                        /*40:122 return_expression=>return •*/
                        add_reduce(state,data,1,71);
                        /*[40]*/
                        return 40;
                    case 1:
                        /*--LEAF--*/
                        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
                        /*40:121 return_expression=>return • break_expression_group_164_115*/
                        puid |=2;
                        pushFN(data,branch_948deab801c790fb);
                        pushFN(data,$break_expression_group_164_115);
                        return puid;
                }
            default:
            case 1:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                /*40:122 return_expression=>return •*/
                add_reduce(state,data,1,71);
                /*[40]*/
                return 40;
        }
    }
    return -1;
}
function $return_expression_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*40:121 return_expression=>return break_expression_group_164_115 •*/
        add_reduce(state,data,2,70);
    } else if(1 == puid){
        /*40:122 return_expression=>return •*/
        add_reduce(state,data,1,71);
    }
    return 40;
}
/*production name: continue_expression
            grammar index: 41
            bodies:
	41:123 continue_expression=>• continue - 
            compile time: 1.938ms*/;
function $continue_expression(l,data,state,prod,puid){
    /*41:123 continue_expression=>• continue*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(/*[continue]*/cmpr_set(l,data,39,8,8)){
        consume(l,data,state);
        puid |=1;
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        /*41:123 continue_expression=>continue •*/
        add_reduce(state,data,1,72);
        /*[41]*/
        return 41;
    }
    return -1;
}
function $continue_expression_reducer(l,data,state,prod,puid){
    if(1 == puid){
        /*41:123 continue_expression=>continue •*/
        add_reduce(state,data,1,72);
    }
    return 41;
}
/*production name: primitive_declaration_group_169_116
            grammar index: 42
            bodies:
	42:124 primitive_declaration_group_169_116=>• = expression - 
            compile time: 5.781ms*/;
function $primitive_declaration_group_169_116(l,data,state,prod,puid){
    /*42:124 primitive_declaration_group_169_116=>• = expression*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==61/*[=]*/){
        consume(l,data,state);
        puid |=1;
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        /*42:124 primitive_declaration_group_169_116=>= • expression*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        puid |=2;
        pushFN(data,branch_305989209a33623b);
        pushFN(data,$expression);
        return puid;
    }
    return -1;
}
function $primitive_declaration_group_169_116_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*42:124 primitive_declaration_group_169_116=>= expression •*/
        add_reduce(state,data,2,0);
    }
    return 42;
}
/*production name: primitive_declaration
            grammar index: 43
            bodies:
	43:125 primitive_declaration=>• modifier_list identifier : type primitive_declaration_group_169_116 - 
		43:126 primitive_declaration=>• identifier : type primitive_declaration_group_169_116 - 
		43:127 primitive_declaration=>• modifier_list identifier : type - 
		43:128 primitive_declaration=>• identifier : type - 
            compile time: 390.367ms*/;
function $primitive_declaration(l,data,state,prod,puid){
    /*43:125 primitive_declaration=>• modifier_list identifier : type primitive_declaration_group_169_116
    43:127 primitive_declaration=>• modifier_list identifier : type
    43:126 primitive_declaration=>• identifier : type primitive_declaration_group_169_116
    43:128 primitive_declaration=>• identifier : type*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.current_byte==91/*[[]*/){
        /*43:125 primitive_declaration=>• modifier_list identifier : type primitive_declaration_group_169_116
        43:127 primitive_declaration=>• modifier_list identifier : type*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_5e169833ae72a0c6);
        pushFN(data,$modifier_list);
        puid |=1;
        return puid;
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/))||l.isUniID(data)){
        /*43:126 primitive_declaration=>• identifier : type primitive_declaration_group_169_116
        43:128 primitive_declaration=>• identifier : type*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        pushFN(data,branch_45773516bd54a32b);
        pushFN(data,$identifier);
        puid |=2;
        return puid;
    }
    return -1;
}
function $primitive_declaration_reducer(l,data,state,prod,puid){
    if(31 == puid){
        /*43:125 primitive_declaration=>modifier_list identifier : type primitive_declaration_group_169_116 •*/
        add_reduce(state,data,5,73);
    } else if(30 == puid){
        /*43:126 primitive_declaration=>identifier : type primitive_declaration_group_169_116 •*/
        add_reduce(state,data,4,74);
    } else if(15 == puid){
        /*43:127 primitive_declaration=>modifier_list identifier : type •*/
        add_reduce(state,data,4,75);
    } else if(14 == puid){
        /*43:128 primitive_declaration=>identifier : type •*/
        add_reduce(state,data,3,76);
    }
    return 43;
}
/*production name: identifier
            grammar index: 44
            bodies:
	44:129 identifier=>• tk:identifier_token - 
            compile time: 1.902ms*/;
function $identifier(l,data,state,prod,puid){
    /*44:129 identifier=>• tk:identifier_token*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(tk_896177e00f155ef3(l,data)){
        consume(l,data,state);
        puid |=1;
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        /*44:129 identifier=>tk:identifier_token •*/
        add_reduce(state,data,1,77);
        /*[44]*/
        return 44;
    }
    return -1;
}
function $identifier_reducer(l,data,state,prod,puid){
    if(1 == puid){
        /*44:129 identifier=>tk:identifier_token •*/
        add_reduce(state,data,1,77);
    }
    return 44;
}
/*production name: identifier_token_group_074_117
            grammar index: 45
            bodies:
	45:130 identifier_token_group_074_117=>• θid - 
		45:131 identifier_token_group_074_117=>• _ - 
		45:132 identifier_token_group_074_117=>• $ - 
            compile time: 3.421ms*/;
function $identifier_token_group_074_117(l,data,state,prod,puid){
    /*45:130 identifier_token_group_074_117=>• θid
    45:131 identifier_token_group_074_117=>• _
    45:132 identifier_token_group_074_117=>• $*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(l.isUniID(data)){
        pushFN(data,branch_308bdd9a72b6d6bd);
        return branch_3ee169cb980a5898(l,data,state,prod,1);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==95/*[_]*/){
        pushFN(data,branch_308bdd9a72b6d6bd);
        return branch_4c681830e2bcb8cf(l,data,state,prod,2);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==36/*[$]*/){
        pushFN(data,branch_308bdd9a72b6d6bd);
        return branch_29110ea098e39fbc(l,data,state,prod,4);
    }
    return -1;
}
function $identifier_token_group_074_117_reducer(l,data,state,prod,puid){
    return 45;
}
/*production name: identifier_token_HC_listbody1_118
            grammar index: 46
            bodies:
	46:133 identifier_token_HC_listbody1_118=>• identifier_token_HC_listbody1_118 identifier_token_group_074_117 - 
		46:134 identifier_token_HC_listbody1_118=>• identifier_token_group_074_117 - 
            compile time: 242.437ms*/;
function $identifier_token_HC_listbody1_118(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*46:134 identifier_token_HC_listbody1_118=>• identifier_token_group_074_117*/
    puid |=2;
    pushFN(data,branch_b378dbdde936f9c8);
    pushFN(data,$identifier_token_group_074_117);
    return puid;
    return -1;
}
function $identifier_token_HC_listbody1_118_goto(l,data,state,prod,puid){
    /*46:133 identifier_token_HC_listbody1_118=>identifier_token_HC_listbody1_118 • identifier_token_group_074_117*/
    if(nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/){
        return 46;
    }
    /*46:133 identifier_token_HC_listbody1_118=>identifier_token_HC_listbody1_118 • identifier_token_group_074_117
    48:139 identifier_token=>identifier_token_group_074_117 identifier_token_HC_listbody1_118 •
    48:137 identifier_token=>identifier_token_group_074_117 identifier_token_HC_listbody1_118 • identifier_token_group_079_119*/
    skip_db1786a8af54d666(l/*[ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(l.isUniID(data)){
        /*46:133 identifier_token_HC_listbody1_118=>identifier_token_HC_listbody1_118 • identifier_token_group_074_117*/
        var pk = l.copy();
        skip_db1786a8af54d666(pk.next(data)/*[ 71 ]*/,data,0);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if(nocap_b2eb52235ee30b8a(pk)/*[ws] [nl]*/){
            pushFN(data,branch_2a33947dd011020b);
            return branch_25caec2d87c1b4d8(l,data,state,prod,1);
            /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
        } else if(((((((dt_dc6530084293e429(pk,data)||/*[str]*/cmpr_set(pk,data,47,3,3))||/*[fn]*/cmpr_set(pk,data,144,2,2))||/*[==]*/cmpr_set(pk,data,7,2,2))||/*[else]*/cmpr_set(pk,data,128,4,4))||assert_ascii(pk,0x0,0x2c005310,0xa8000000,0x28000000))||pk.isUniID(data))||pk.isSym(true,data)){
            pushFN(data,branch_2a33947dd011020b);
            return branch_534054c7147497d8(l,data,state,prod,1);
        }
        /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
    } else if((l.current_byte==95/*[_]*/)||(l.current_byte==36/*[$]*/)){
        pushFN(data,branch_2a33947dd011020b);
        return branch_534054c7147497d8(l,data,state,prod,1);
    }
    return prod == 46 ? prod : -1;
}
function $identifier_token_HC_listbody1_118_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*46:133 identifier_token_HC_listbody1_118=>identifier_token_HC_listbody1_118 identifier_token_group_074_117 •*/
        add_reduce(state,data,2,2);
    } else if(2 == puid){
        /*46:134 identifier_token_HC_listbody1_118=>identifier_token_group_074_117 •*/
        add_reduce(state,data,1,3);
    }
    return 46;
}
/*production name: identifier_token_group_079_119
            grammar index: 47
            bodies:
	47:135 identifier_token_group_079_119=>• θws - 
		47:136 identifier_token_group_079_119=>• θnl - 
            compile time: 7.428ms*/;
function $identifier_token_group_079_119(l,data,state,prod,puid){
    /*47:135 identifier_token_group_079_119=>• θws
    47:136 identifier_token_group_079_119=>• θnl*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(nocap_108e16629a73e761(l)/*[ws]*/){
        pushFN(data,branch_f74c3bed1eecf572);
        return branch_499b936f8e6084df(l,data,state,prod,1);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(nocap_9b1ef04606bbaa09(l)/*[nl]*/){
        pushFN(data,branch_f74c3bed1eecf572);
        return branch_798031375f905384(l,data,state,prod,2);
    }
    return -1;
}
function $identifier_token_group_079_119_reducer(l,data,state,prod,puid){
    return 47;
}
/*production name: identifier_token
            grammar index: 48
            bodies:
	48:137 identifier_token=>• identifier_token_group_074_117 identifier_token_HC_listbody1_118 identifier_token_group_079_119 - 
		48:138 identifier_token=>• identifier_token_group_074_117 identifier_token_group_079_119 - 
		48:139 identifier_token=>• identifier_token_group_074_117 identifier_token_HC_listbody1_118 - 
		48:140 identifier_token=>• identifier_token_group_074_117 - 
            compile time: 734.381ms*/;
function $identifier_token(l,data,state,prod,puid){
    /*48:137 identifier_token=>• identifier_token_group_074_117 identifier_token_HC_listbody1_118 identifier_token_group_079_119
    48:138 identifier_token=>• identifier_token_group_074_117 identifier_token_group_079_119
    48:139 identifier_token=>• identifier_token_group_074_117 identifier_token_HC_listbody1_118
    48:140 identifier_token=>• identifier_token_group_074_117*/
    pushFN(data,branch_f32b95de568955a1);
    pushFN(data,$identifier_token_group_074_117);
    puid |=1;
    return puid;
    return -1;
}
function $identifier_token_reducer(l,data,state,prod,puid){
    if(7 == puid){
        /*48:137 identifier_token=>identifier_token_group_074_117 identifier_token_HC_listbody1_118 identifier_token_group_079_119 •*/
        add_reduce(state,data,3,0);
    } else if(5 == puid){
        /*48:138 identifier_token=>identifier_token_group_074_117 identifier_token_group_079_119 •*/
        add_reduce(state,data,2,0);
    } else if(3 == puid){
        /*48:139 identifier_token=>identifier_token_group_074_117 identifier_token_HC_listbody1_118 •*/
        add_reduce(state,data,2,0);
    }
    return 48;
}
/*production name: modifier_list_HC_listbody1_120
            grammar index: 49
            bodies:
	49:141 modifier_list_HC_listbody1_120=>• modifier_list_HC_listbody1_120 modifier - 
		49:142 modifier_list_HC_listbody1_120=>• modifier - 
            compile time: 3.654ms*/;
function $modifier_list_HC_listbody1_120(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*49:142 modifier_list_HC_listbody1_120=>• modifier*/
    puid |=2;
    pushFN(data,branch_f5a96a0bed604d7d);
    pushFN(data,$modifier);
    return puid;
    return -1;
}
function $modifier_list_HC_listbody1_120_goto(l,data,state,prod,puid){
    /*49:141 modifier_list_HC_listbody1_120=>modifier_list_HC_listbody1_120 • modifier*/
    /*49:141 modifier_list_HC_listbody1_120=>modifier_list_HC_listbody1_120 • modifier
    50:143 modifier_list=>[ modifier_list_HC_listbody1_120 • ]*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if((((dt_a0570d6d5c8952c6(l,data)||/*[export]*/cmpr_set(l,data,57,6,6))||/*[mut]*/cmpr_set(l,data,117,3,3))||/*[imut]*/cmpr_set(l,data,116,4,4))||l.isUniID(data)){
        pushFN(data,branch_e6262d2fc73c8fb2);
        return branch_fa9d7870a6207cd9(l,data,state,prod,1);
    }
    return prod == 49 ? prod : -1;
}
function $modifier_list_HC_listbody1_120_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*49:141 modifier_list_HC_listbody1_120=>modifier_list_HC_listbody1_120 modifier •*/
        add_reduce(state,data,2,2);
    } else if(2 == puid){
        /*49:142 modifier_list_HC_listbody1_120=>modifier •*/
        add_reduce(state,data,1,3);
    }
    return 49;
}
/*production name: modifier_list
            grammar index: 50
            bodies:
	50:143 modifier_list=>• [ modifier_list_HC_listbody1_120 ] - 
            compile time: 2.546ms*/;
function $modifier_list(l,data,state,prod,puid){
    /*50:143 modifier_list=>• [ modifier_list_HC_listbody1_120 ]*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==91/*[[]*/){
        consume(l,data,state);
        puid |=1;
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        /*50:143 modifier_list=>[ • modifier_list_HC_listbody1_120 ]*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        puid |=2;
        pushFN(data,branch_9429112a783f1f03);
        pushFN(data,$modifier_list_HC_listbody1_120);
        return puid;
    }
    return -1;
}
function $modifier_list_reducer(l,data,state,prod,puid){
    if(7 == puid){
        /*50:143 modifier_list=>[ modifier_list_HC_listbody1_120 ] •*/
        add_reduce(state,data,3,37);
    }
    return 50;
}
/*production name: type_group_086_121
            grammar index: 51
            bodies:
	51:144 type_group_086_121=>• u - 
		51:145 type_group_086_121=>• i - 
		51:146 type_group_086_121=>• uint - 
		51:147 type_group_086_121=>• int - 
            compile time: 3.051ms*/;
function $type_group_086_121(l,data,state,prod,puid){
    /*51:144 type_group_086_121=>• u
    51:145 type_group_086_121=>• i
    51:146 type_group_086_121=>• uint
    51:147 type_group_086_121=>• int*/
    switch(sym_map_452608436dcadf92(l,data)){
        case 0:
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*51:144 type_group_086_121=>• u*/
            puid |=1;
            consume(l,data,state);
            /*[51]*/
            return 51;
        case 1:
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*51:145 type_group_086_121=>• i*/
            puid |=2;
            consume(l,data,state);
            /*[51]*/
            return 51;
        case 2:
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*51:146 type_group_086_121=>• uint*/
            puid |=4;
            consume(l,data,state);
            /*[51]*/
            return 51;
        case 3:
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*51:147 type_group_086_121=>• int*/
            puid |=8;
            consume(l,data,state);
            /*[51]*/
            return 51;
        default:
            break;
    }
    return -1;
}
function $type_group_086_121_reducer(l,data,state,prod,puid){
    return 51;
}
/*production name: type_group_091_122
            grammar index: 52
            bodies:
	52:148 type_group_091_122=>• 8 - 
		52:149 type_group_091_122=>• 16 - 
		52:150 type_group_091_122=>• 32 - 
		52:151 type_group_091_122=>• 64 - 
		52:152 type_group_091_122=>• 128 - 
            compile time: 5.089ms*/;
function $type_group_091_122(l,data,state,prod,puid){
    /*52:148 type_group_091_122=>• 8
    52:149 type_group_091_122=>• 16
    52:150 type_group_091_122=>• 32
    52:151 type_group_091_122=>• 64
    52:152 type_group_091_122=>• 128*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(l.current_byte==56/*[8]*/){
        pushFN(data,branch_b9f8e5d82f7d9108);
        return branch_235b65124f414af8(l,data,state,prod,1);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(/*[16]*/cmpr_set(l,data,132,2,2)){
        pushFN(data,branch_b9f8e5d82f7d9108);
        return branch_f88a7c2c1769b4e9(l,data,state,prod,2);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(/*[32]*/cmpr_set(l,data,91,2,2)){
        pushFN(data,branch_b9f8e5d82f7d9108);
        return branch_34dc087b648697b1(l,data,state,prod,4);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(/*[64]*/cmpr_set(l,data,93,2,2)){
        pushFN(data,branch_b9f8e5d82f7d9108);
        return branch_3d1d1dd2035e1efd(l,data,state,prod,8);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(/*[128]*/cmpr_set(l,data,88,3,3)){
        pushFN(data,branch_b9f8e5d82f7d9108);
        return branch_91221d68990b2da2(l,data,state,prod,16);
    }
    return -1;
}
function $type_group_091_122_reducer(l,data,state,prod,puid){
    return 52;
}
/*production name: type_group_094_123
            grammar index: 53
            bodies:
	53:153 type_group_094_123=>• f - 
		53:154 type_group_094_123=>• flt - 
            compile time: 1.704ms*/;
function $type_group_094_123(l,data,state,prod,puid){
    /*53:153 type_group_094_123=>• f
    53:154 type_group_094_123=>• flt*/
    switch(sym_map_1a453afd76b3985a(l,data)){
        case 0:
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*53:153 type_group_094_123=>• f*/
            puid |=1;
            consume(l,data,state);
            /*[53]*/
            return 53;
        case 1:
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*53:154 type_group_094_123=>• flt*/
            puid |=2;
            consume(l,data,state);
            /*[53]*/
            return 53;
        default:
            break;
    }
    return -1;
}
function $type_group_094_123_reducer(l,data,state,prod,puid){
    return 53;
}
/*production name: type_group_097_124
            grammar index: 54
            bodies:
	54:155 type_group_097_124=>• 32 - 
		54:156 type_group_097_124=>• 64 - 
		54:157 type_group_097_124=>• 128 - 
            compile time: 3.54ms*/;
function $type_group_097_124(l,data,state,prod,puid){
    /*54:155 type_group_097_124=>• 32
    54:156 type_group_097_124=>• 64
    54:157 type_group_097_124=>• 128*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(/*[32]*/cmpr_set(l,data,91,2,2)){
        pushFN(data,branch_97595c541a25c591);
        return branch_4316c2d0c3aa5e7a(l,data,state,prod,1);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(/*[64]*/cmpr_set(l,data,93,2,2)){
        pushFN(data,branch_97595c541a25c591);
        return branch_49c15d1218acdade(l,data,state,prod,2);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(/*[128]*/cmpr_set(l,data,88,3,3)){
        pushFN(data,branch_97595c541a25c591);
        return branch_d57ced1311a1cf9b(l,data,state,prod,4);
    }
    return -1;
}
function $type_group_097_124_reducer(l,data,state,prod,puid){
    return 54;
}
/*production name: type
            grammar index: 55
            bodies:
	55:158 type=>• identifier - 
		55:159 type=>• type_group_086_121 type_group_091_122 - 
		55:160 type=>• type_group_094_123 type_group_097_124 - 
		55:161 type=>• string - 
		55:162 type=>• str - 
            compile time: 8.67ms*/;
function $type(l,data,state,prod,puid){
    /*55:158 type=>• identifier
    55:159 type=>• type_group_086_121 type_group_091_122
    55:160 type=>• type_group_094_123 type_group_097_124
    55:161 type=>• string
    55:162 type=>• str*/
    switch(sym_map_957fe013814af5bc(l,data)){
        case 0:
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*55:162 type=>• str*/
            puid |=64;
            consume(l,data,state);
            add_reduce(state,data,1,80);
            /*[55]*/
            return 55;
        case 1:
            /*--LEAF--*/
            /*⤋⤋⤋ assert ⤋⤋⤋*/
            /*55:161 type=>• string*/
            puid |=32;
            consume(l,data,state);
            add_reduce(state,data,1,80);
            /*[55]*/
            return 55;
        case 2:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*55:160 type=>• type_group_094_123 type_group_097_124*/
            puid |=8;
            pushFN(data,branch_eac0bc336efecb18);
            pushFN(data,$type_group_094_123);
            return puid;
        case 3:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*55:159 type=>• type_group_086_121 type_group_091_122*/
            puid |=2;
            pushFN(data,branch_70a6d49de7de19a8);
            pushFN(data,$type_group_086_121);
            return puid;
        case 4:
            /*--LEAF--*/
            /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
            /*55:158 type=>• identifier*/
            puid |=1;
            pushFN(data,branch_a4110c873d7d06d7);
            pushFN(data,$identifier);
            return puid;
        default:
            break;
    }
    return -1;
}
function $type_reducer(l,data,state,prod,puid){
    if(1 == puid){
        /*55:158 type=>identifier •*/
        add_reduce(state,data,1,78);
    } else if(6 == puid){
        /*55:159 type=>type_group_086_121 type_group_091_122 •*/
        add_reduce(state,data,2,79);
    } else if(24 == puid){
        /*55:160 type=>type_group_094_123 type_group_097_124 •*/
        add_reduce(state,data,2,79);
    } else if(32 == puid){
        /*55:161 type=>string •*/
        add_reduce(state,data,1,80);
    } else if(64 == puid){
        /*55:162 type=>str •*/
        add_reduce(state,data,1,80);
    }
    return 55;
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
            compile time: 11.773ms*/;
function $value(l,data,state,prod,puid){
    /*56:163 value=>• num
    56:164 value=>• tk:string
    56:165 value=>• true
    56:166 value=>• false
    56:167 value=>• null
    56:168 value=>• template*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(/*[<<--]*/cmpr_set(l,data,20,4,4)){
        pushFN(data,branch_94fd660a5f5694c4);
        return branch_6c0c4c6cf3e7959e(l,data,state,prod,32);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if((l.current_byte==34/*["]*/)||(l.current_byte==39/*[']*/)){
        pushFN(data,branch_94fd660a5f5694c4);
        return branch_86d8752e71a39e7a(l,data,state,prod,2);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(dt_6ae31dd85a62ef5c(l,data)||l.isNum(data)){
        pushFN(data,branch_94fd660a5f5694c4);
        return branch_f25e17acd1a4c826(l,data,state,prod,1);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(/*[true]*/cmpr_set(l,data,95,4,4)){
        pushFN(data,branch_94fd660a5f5694c4);
        return branch_7a957cbb337480a9(l,data,state,prod,4);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(/*[false]*/cmpr_set(l,data,53,5,5)){
        pushFN(data,branch_94fd660a5f5694c4);
        return branch_0f549cade71dd166(l,data,state,prod,8);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(/*[null]*/cmpr_set(l,data,35,4,4)){
        pushFN(data,branch_94fd660a5f5694c4);
        return branch_3a6f16dffc9e0e08(l,data,state,prod,16);
    }
    return -1;
}
function $value_reducer(l,data,state,prod,puid){
    if(1 == puid){
        /*56:163 value=>num •*/
        add_reduce(state,data,1,81);
    } else if(2 == puid){
        /*56:164 value=>tk:string •*/
        add_reduce(state,data,1,82);
    } else if(4 == puid){
        /*56:165 value=>true •*/
        add_reduce(state,data,1,83);
    } else if(8 == puid){
        /*56:166 value=>false •*/
        add_reduce(state,data,1,84);
    } else if(16 == puid){
        /*56:167 value=>null •*/
        add_reduce(state,data,1,85);
    } else if(32 == puid){
        /*56:168 value=>template •*/
        add_reduce(state,data,1,86);
    }
    return 56;
}
/*production name: string_group_0111_125
            grammar index: 57
            bodies:
	57:169 string_group_0111_125=>• θws - 
		57:170 string_group_0111_125=>• θnl - 
		57:171 string_group_0111_125=>• θid - 
		57:172 string_group_0111_125=>• θsym - 
		57:173 string_group_0111_125=>• \" - 
            compile time: 3.883ms*/;
function $string_group_0111_125(l,data,state,prod,puid){
    /*57:169 string_group_0111_125=>• θws
    57:170 string_group_0111_125=>• θnl
    57:171 string_group_0111_125=>• θid
    57:172 string_group_0111_125=>• θsym
    57:173 string_group_0111_125=>• \"*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(l.isSP(true,data)){
        pushFN(data,branch_485e7848dc9e7e5b);
        return branch_ca9eb6d8fc6ce6d7(l,data,state,prod,1);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.isNL()){
        pushFN(data,branch_485e7848dc9e7e5b);
        return branch_bee10bf7d5376036(l,data,state,prod,2);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.isUniID(data)){
        pushFN(data,branch_485e7848dc9e7e5b);
        return branch_c08b39a165ece913(l,data,state,prod,4);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(/*[\"]*/cmpr_set(l,data,14,2,2)){
        pushFN(data,branch_485e7848dc9e7e5b);
        return branch_84fa922c5c4d7b9b(l,data,state,prod,16);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.isSym(true,data)){
        pushFN(data,branch_485e7848dc9e7e5b);
        return branch_ec2b5f4221092348(l,data,state,prod,8);
    }
    return -1;
}
function $string_group_0111_125_reducer(l,data,state,prod,puid){
    return 57;
}
/*production name: string_HC_listbody1_126
            grammar index: 58
            bodies:
	58:174 string_HC_listbody1_126=>• string_HC_listbody1_126 string_group_0111_125 - 
		58:175 string_HC_listbody1_126=>• string_group_0111_125 - 
            compile time: 5.816ms*/;
function $string_HC_listbody1_126(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*58:175 string_HC_listbody1_126=>• string_group_0111_125*/
    puid |=2;
    pushFN(data,branch_0585cde914761373);
    pushFN(data,$string_group_0111_125);
    return puid;
    return -1;
}
function $string_HC_listbody1_126_goto(l,data,state,prod,puid){
    /*58:174 string_HC_listbody1_126=>string_HC_listbody1_126 • string_group_0111_125*/
    if(l.current_byte==34/*["]*/){
        return 58;
    }
    /*58:174 string_HC_listbody1_126=>string_HC_listbody1_126 • string_group_0111_125
    60:178 string=>" string_HC_listbody1_126 • "*/
    skip_db1786a8af54d666(l/*[ 71 ]*/,data,state);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if((((/*[\"]*/cmpr_set(l,data,14,2,2)||l.isUniID(data))||l.isNL())||l.isSym(true,data))||l.isSP(true,data)){
        pushFN(data,branch_105597e1c2057714);
        return branch_82e02779e31fa094(l,data,state,prod,1);
    }
    return prod == 58 ? prod : -1;
}
function $string_HC_listbody1_126_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*58:174 string_HC_listbody1_126=>string_HC_listbody1_126 string_group_0111_125 •*/
        add_reduce(state,data,2,87);
    } else if(2 == puid){
        /*58:175 string_HC_listbody1_126=>string_group_0111_125 •*/
        add_reduce(state,data,1,88);
    }
    return 58;
}
/*production name: string_HC_listbody1_127
            grammar index: 59
            bodies:
	59:176 string_HC_listbody1_127=>• string_HC_listbody1_127 string_group_0111_125 - 
		59:177 string_HC_listbody1_127=>• string_group_0111_125 - 
            compile time: 5.749ms*/;
function $string_HC_listbody1_127(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*59:177 string_HC_listbody1_127=>• string_group_0111_125*/
    puid |=2;
    pushFN(data,branch_7e0d2ce0f884b7a8);
    pushFN(data,$string_group_0111_125);
    return puid;
    return -1;
}
function $string_HC_listbody1_127_goto(l,data,state,prod,puid){
    /*59:176 string_HC_listbody1_127=>string_HC_listbody1_127 • string_group_0111_125*/
    if(l.current_byte==39/*[']*/){
        return 59;
    }
    /*59:176 string_HC_listbody1_127=>string_HC_listbody1_127 • string_group_0111_125
    60:179 string=>' string_HC_listbody1_127 • '*/
    skip_db1786a8af54d666(l/*[ 71 ]*/,data,state);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if((((/*[\"]*/cmpr_set(l,data,14,2,2)||l.isUniID(data))||l.isNL())||l.isSym(true,data))||l.isSP(true,data)){
        pushFN(data,branch_a159faaa8b4d52a5);
        return branch_e66d737c6db3fc33(l,data,state,prod,1);
    }
    return prod == 59 ? prod : -1;
}
function $string_HC_listbody1_127_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*59:176 string_HC_listbody1_127=>string_HC_listbody1_127 string_group_0111_125 •*/
        add_reduce(state,data,2,87);
    } else if(2 == puid){
        /*59:177 string_HC_listbody1_127=>string_group_0111_125 •*/
        add_reduce(state,data,1,88);
    }
    return 59;
}
/*production name: string
            grammar index: 60
            bodies:
	60:178 string=>• " string_HC_listbody1_126 " - 
		60:179 string=>• ' string_HC_listbody1_127 ' - 
		60:180 string=>• " " - 
		60:181 string=>• ' ' - 
            compile time: 11.42ms*/;
function $string(l,data,state,prod,puid){
    /*60:178 string=>• " string_HC_listbody1_126 "
    60:180 string=>• " "
    60:179 string=>• ' string_HC_listbody1_127 '
    60:181 string=>• ' '*/
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(l.current_byte==34/*["]*/){
        /*60:178 string=>• " string_HC_listbody1_126 "
        60:180 string=>• " "*/
        var pk = l.copy();
        skip_db1786a8af54d666(pk.next(data)/*[ 71 ]*/,data,0);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(pk.current_byte==34/*["]*/){
            pushFN(data,branch_d896d30b01780566);
            return branch_7d65472d38dcaab1(l,data,state,prod,1);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else if((((/*[\"]*/cmpr_set(pk,data,14,2,2)||pk.isUniID(data))||pk.isNL())||pk.isSym(true,data))||pk.isSP(true,data)){
            pushFN(data,branch_d896d30b01780566);
            return branch_8e080789bfc9483b(l,data,state,prod,1);
        }
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    } else if(l.current_byte==39/*[']*/){
        /*60:179 string=>• ' string_HC_listbody1_127 '
        60:181 string=>• ' '*/
        var pk = l.copy();
        skip_db1786a8af54d666(pk.next(data)/*[ 71 ]*/,data,0);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(pk.current_byte==39/*[']*/){
            pushFN(data,branch_d896d30b01780566);
            return branch_1a855fd31e8b5ab3(l,data,state,prod,4);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else if((((/*[\"]*/cmpr_set(pk,data,14,2,2)||pk.isUniID(data))||pk.isNL())||pk.isSym(true,data))||pk.isSP(true,data)){
            pushFN(data,branch_d896d30b01780566);
            return branch_50da06a9f53cf781(l,data,state,prod,4);
        }
    }
    return -1;
}
function $string_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*60:178 string=>" string_HC_listbody1_126 " •*/
        add_reduce(state,data,3,89);
    } else if(12 == puid){
        /*60:179 string=>' string_HC_listbody1_127 ' •*/
        add_reduce(state,data,3,89);
    } else if(1 == puid){
        /*60:180 string=>" " •*/
        add_reduce(state,data,2,90);
    } else if(4 == puid){
        /*60:181 string=>' ' •*/
        add_reduce(state,data,2,90);
    }
    return 60;
}
/*production name: num
            grammar index: 61
            bodies:
	61:182 num=>• tk:num_tok - 
            compile time: 1.913ms*/;
function $num(l,data,state,prod,puid){
    /*61:182 num=>• tk:num_tok*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(tk_b1b10eb2e83a1bcd(l,data)){
        consume(l,data,state);
        puid |=1;
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        /*61:182 num=>tk:num_tok •*/
        /*[61]*/
        return 61;
    }
    return -1;
}
function $num_reducer(l,data,state,prod,puid){
    return 61;
}
/*production name: num_tok
            grammar index: 62
            bodies:
	62:183 num_tok=>• def$number - 
		62:184 num_tok=>• def$hex - 
		62:185 num_tok=>• def$binary - 
		62:186 num_tok=>• def$octal - 
            compile time: 5.938ms*/;
function $num_tok(l,data,state,prod,puid){
    /*62:183 num_tok=>• def$number
    62:184 num_tok=>• def$hex
    62:185 num_tok=>• def$binary
    62:186 num_tok=>• def$octal*/
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(l.isNum(data)){
        pushFN(data,branch_7bd41de4c3b97b3a);
        return branch_38be0adead57effb(l,data,state,prod,1);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(/*[0x]*/cmpr_set(l,data,27,2,2)){
        pushFN(data,branch_7bd41de4c3b97b3a);
        return branch_fc1da5737a8004ee(l,data,state,prod,2);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(/*[0b]*/cmpr_set(l,data,114,2,2)){
        pushFN(data,branch_7bd41de4c3b97b3a);
        return branch_3dbd6f595af296d6(l,data,state,prod,4);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    } else if(dt_bc3480b75045e0d0(l,data)){
        pushFN(data,branch_7bd41de4c3b97b3a);
        return branch_2140a947a49cd129(l,data,state,prod,8);
    }
    return -1;
}
function $num_tok_reducer(l,data,state,prod,puid){
    return 62;
}
/*production name: operator_HC_listbody1_128
            grammar index: 63
            bodies:
	63:187 operator_HC_listbody1_128=>• operator_HC_listbody1_128 θsym - 
		63:188 operator_HC_listbody1_128=>• θsym - 
            compile time: 212.001ms*/;
function $operator_HC_listbody1_128(l,data,state,prod,puid){
    /*63:188 operator_HC_listbody1_128=>• θsym*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.isSym(true,data)){
        consume(l,data,state);
        puid |=2;
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        /*63:188 operator_HC_listbody1_128=>θsym •*/
        add_reduce(state,data,1,88);
        /*[63]*/
        pushFN(data,$operator_HC_listbody1_128_goto);
        return 63;
    }
    return -1;
}
function $operator_HC_listbody1_128_goto(l,data,state,prod,puid){
    /*63:187 operator_HC_listbody1_128=>operator_HC_listbody1_128 • θsym*/
    if(((nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[==]*/cmpr_set(l,data,7,2,2))||assert_ascii(l,0x0,0xc001300,0x28000000,0x28000000)){
        return 63;
    }
    /*63:187 operator_HC_listbody1_128=>operator_HC_listbody1_128 • θsym
    65:191 operator=>θsym operator_HC_listbody1_128 • identifier_token_group_079_119
    65:194 operator=>θsym operator_HC_listbody1_128 •*/
    skip_db1786a8af54d666(l/*[ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
    if(l.isSym(true,data)){
        pushFN(data,branch_7fe2059f09133bde);
        return branch_4266d6976f2fc09b(l,data,state,prod,1);
    }
    return prod == 63 ? prod : -1;
}
function $operator_HC_listbody1_128_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*63:187 operator_HC_listbody1_128=>operator_HC_listbody1_128 θsym •*/
        add_reduce(state,data,2,87);
    } else if(2 == puid){
        /*63:188 operator_HC_listbody1_128=>θsym •*/
        add_reduce(state,data,1,88);
    }
    return 63;
}
/*production name: operator_HC_listbody1_129
            grammar index: 64
            bodies:
	64:189 operator_HC_listbody1_129=>• operator_HC_listbody1_129 θsym - 
		64:190 operator_HC_listbody1_129=>• θsym - 
            compile time: 212.371ms*/;
function $operator_HC_listbody1_129(l,data,state,prod,puid){
    /*64:190 operator_HC_listbody1_129=>• θsym*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.isSym(true,data)){
        consume(l,data,state);
        puid |=2;
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        /*64:190 operator_HC_listbody1_129=>θsym •*/
        add_reduce(state,data,1,88);
        /*[64]*/
        pushFN(data,$operator_HC_listbody1_129_goto);
        return 64;
    }
    return -1;
}
function $operator_HC_listbody1_129_goto(l,data,state,prod,puid){
    /*64:189 operator_HC_listbody1_129=>operator_HC_listbody1_129 • θsym*/
    if(((nocap_b2eb52235ee30b8a(l)/*[ws] [nl]*/||/*[<<--]*/cmpr_set(l,data,20,4,4))||/*[==]*/cmpr_set(l,data,7,2,2))||assert_ascii(l,0x0,0xc001300,0x28000000,0x28000000)){
        return 64;
    }
    /*64:189 operator_HC_listbody1_129=>operator_HC_listbody1_129 • θsym
    65:192 operator=>== operator_HC_listbody1_129 • identifier_token_group_079_119
    65:196 operator=>== operator_HC_listbody1_129 •*/
    skip_db1786a8af54d666(l/*[ 71 ]*/,data,state);
    /*⤋⤋⤋ assert-peek-vp ⤋⤋⤋*/
    if(l.isSym(true,data)){
        pushFN(data,branch_29bbdc70dcef3ee4);
        return branch_fd3c988095ac72a6(l,data,state,prod,1);
    }
    return prod == 64 ? prod : -1;
}
function $operator_HC_listbody1_129_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*64:189 operator_HC_listbody1_129=>operator_HC_listbody1_129 θsym •*/
        add_reduce(state,data,2,87);
    } else if(2 == puid){
        /*64:190 operator_HC_listbody1_129=>θsym •*/
        add_reduce(state,data,1,88);
    }
    return 64;
}
/*production name: operator
            grammar index: 65
            bodies:
	65:191 operator=>• θsym operator_HC_listbody1_128 identifier_token_group_079_119 - 
		65:192 operator=>• == operator_HC_listbody1_129 identifier_token_group_079_119 - 
		65:193 operator=>• θsym identifier_token_group_079_119 - 
		65:194 operator=>• θsym operator_HC_listbody1_128 - 
		65:195 operator=>• == identifier_token_group_079_119 - 
		65:196 operator=>• == operator_HC_listbody1_129 - 
		65:197 operator=>• θsym - 
		65:198 operator=>• == - 
            compile time: 1079.798ms*/;
function $operator(l,data,state,prod,puid){
    /*65:191 operator=>• θsym operator_HC_listbody1_128 identifier_token_group_079_119
    65:193 operator=>• θsym identifier_token_group_079_119
    65:194 operator=>• θsym operator_HC_listbody1_128
    65:197 operator=>• θsym
    65:192 operator=>• == operator_HC_listbody1_129 identifier_token_group_079_119
    65:195 operator=>• == identifier_token_group_079_119
    65:196 operator=>• == operator_HC_listbody1_129
    65:198 operator=>• ==*/
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(/*[==]*/cmpr_set(l,data,7,2,2)){
        /*65:192 operator=>• == operator_HC_listbody1_129 identifier_token_group_079_119
        65:195 operator=>• == identifier_token_group_079_119
        65:196 operator=>• == operator_HC_listbody1_129
        65:198 operator=>• ==*/
        /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
        consume(l,data,state);
        puid |=8;
        /*65:192 operator=>== • operator_HC_listbody1_129 identifier_token_group_079_119
        65:196 operator=>== • operator_HC_listbody1_129
        65:198 operator=>== •
        65:195 operator=>== • identifier_token_group_079_119*/
        skip_db1786a8af54d666(l/*[ 71 ]*/,data,state);
        switch(sym_map_f37de846387deb5d(l,data)){
            case 0:
                /*-------------VPROD-------------------------*/
                /*65:192 operator=>== • operator_HC_listbody1_129 identifier_token_group_079_119
                65:196 operator=>== • operator_HC_listbody1_129*/
                pushFN(data,branch_1da7362f23bcdcc2);
                return 0;
            case 1:
                /*--LEAF--*/
                /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
                /*65:195 operator=>== • identifier_token_group_079_119*/
                puid |=4;
                pushFN(data,branch_c93b7becf0e36405);
                pushFN(data,$identifier_token_group_079_119);
                return puid;
            default:
            case 2:
                /*--LEAF--*/
                /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                /*65:198 operator=>== •*/
                add_reduce(state,data,1,92);
                /*[65]*/
                return 65;
        }
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    } else if(l.isSym(true,data)){
        /*65:191 operator=>• θsym operator_HC_listbody1_128 identifier_token_group_079_119
        65:194 operator=>• θsym operator_HC_listbody1_128
        65:197 operator=>• θsym
        65:193 operator=>• θsym identifier_token_group_079_119*/
        var pk = l.copy();
        skip_db1786a8af54d666(pk.next(data)/*[ 71 ]*/,data,0);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(pk.isSym(true,data)){
            /*65:191 operator=>• θsym operator_HC_listbody1_128 identifier_token_group_079_119
            65:194 operator=>• θsym operator_HC_listbody1_128
            65:197 operator=>• θsym*/
            /*⤋⤋⤋ post-peek-consume ⤋⤋⤋*/
            consume(l,data,state);
            puid |=1;
            /*65:191 operator=>θsym • operator_HC_listbody1_128 identifier_token_group_079_119
            65:194 operator=>θsym • operator_HC_listbody1_128
            65:197 operator=>θsym •*/
            skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
            switch(sym_map_71218632d17276c3(l,data)){
                default:
                case 0:
                    /*--LEAF--*/
                    /*⤋⤋⤋ assert-end ⤋⤋⤋*/
                    /*65:197 operator=>θsym •*/
                    add_reduce(state,data,1,92);
                    /*[65]*/
                    return 65;
                case 1:
                    /*-------------VPROD-------------------------*/
                    /*65:191 operator=>θsym • operator_HC_listbody1_128 identifier_token_group_079_119
                    65:194 operator=>θsym • operator_HC_listbody1_128*/
                    pushFN(data,branch_e31a0d366a42ffa8);
                    return 0;
            }
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else if(nocap_b2eb52235ee30b8a(pk)/*[ws] [nl]*/){
            pushFN(data,branch_953325efa0d36ff1);
            return branch_99be3d4f8d888fcc(l,data,state,prod,1);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else if((((((((((((((((dt_bcea2102060eab13(pk,data)||dt_6ae31dd85a62ef5c(pk,data))||/*[true]*/cmpr_set(pk,data,95,4,4))||/*[null]*/cmpr_set(pk,data,35,4,4))||/*[<<--]*/cmpr_set(pk,data,20,4,4))||dt_8411d8c5b1c2ec8c(pk,data))||/*[match]*/cmpr_set(pk,data,67,5,5))||/*[==]*/cmpr_set(pk,data,7,2,2))||/*[break]*/cmpr_set(pk,data,72,5,5))||/*[return]*/cmpr_set(pk,data,77,6,6))||/*[continue]*/cmpr_set(pk,data,39,8,8))||/*[loop]*/cmpr_set(pk,data,63,4,4))||/*[else]*/cmpr_set(pk,data,128,4,4))||/*[str]*/cmpr_set(pk,data,47,3,3))||assert_ascii(pk,0x0,0xc001394,0xa8000000,0x28000000))||pk.isUniID(data))||pk.isNum(data)){
            pushFN(data,branch_953325efa0d36ff1);
            return branch_18a5ece9623c6cf7(l,data,state,prod,1);
        }
    }
    return -1;
}
function $operator_reducer(l,data,state,prod,puid){
    if(7 == puid){
        /*65:191 operator=>θsym operator_HC_listbody1_128 identifier_token_group_079_119 •*/
        add_reduce(state,data,3,91);
    } else if(28 == puid){
        /*65:192 operator=>== operator_HC_listbody1_129 identifier_token_group_079_119 •*/
        add_reduce(state,data,3,91);
    } else if(5 == puid){
        /*65:193 operator=>θsym identifier_token_group_079_119 •*/
        add_reduce(state,data,2,92);
    } else if(3 == puid){
        /*65:194 operator=>θsym operator_HC_listbody1_128 •*/
        add_reduce(state,data,2,91);
    } else if(12 == puid){
        /*65:195 operator=>== identifier_token_group_079_119 •*/
        add_reduce(state,data,2,92);
    } else if(24 == puid){
        /*65:196 operator=>== operator_HC_listbody1_129 •*/
        add_reduce(state,data,2,91);
    } else if(1 == puid){
        /*65:197 operator=>θsym •*/
        add_reduce(state,data,1,92);
    } else if(8 == puid){
        /*65:198 operator=>== •*/
        add_reduce(state,data,1,92);
    }
    return 65;
}
/*production name: modifier
            grammar index: 66
            bodies:
	66:199 modifier=>• pub - 
		66:200 modifier=>• priv - 
		66:201 modifier=>• export - 
		66:202 modifier=>• mut - 
		66:203 modifier=>• imut - 
		66:204 modifier=>• θid - 
            compile time: 11.221ms*/;
function $modifier(l,data,state,prod,puid){
    /*66:199 modifier=>• pub
    66:200 modifier=>• priv
    66:201 modifier=>• export
    66:202 modifier=>• mut
    66:203 modifier=>• imut
    66:204 modifier=>• θid*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(/*[pub]*/cmpr_set(l,data,134,3,3)){
        pushFN(data,branch_5ba3cb59e15b58fe);
        return branch_6b1b550c641e00c8(l,data,state,prod,1);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(/*[priv]*/cmpr_set(l,data,99,4,4)){
        pushFN(data,branch_5ba3cb59e15b58fe);
        return branch_c48ec47f4ada1fcb(l,data,state,prod,2);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(/*[export]*/cmpr_set(l,data,57,6,6)){
        pushFN(data,branch_5ba3cb59e15b58fe);
        return branch_8c4716e79a4b9ed6(l,data,state,prod,4);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(/*[mut]*/cmpr_set(l,data,117,3,3)){
        pushFN(data,branch_5ba3cb59e15b58fe);
        return branch_c2144dc458d9b458(l,data,state,prod,8);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(/*[imut]*/cmpr_set(l,data,116,4,4)){
        pushFN(data,branch_5ba3cb59e15b58fe);
        return branch_199c281bdc387c44(l,data,state,prod,16);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.isUniID(data)){
        pushFN(data,branch_5ba3cb59e15b58fe);
        return branch_c82dc4a81cc2db7e(l,data,state,prod,32);
    }
    return -1;
}
function $modifier_reducer(l,data,state,prod,puid){
    return 66;
}
/*production name: comment_group_0138_130
            grammar index: 67
            bodies:
	67:205 comment_group_0138_130=>• θid - 
		67:206 comment_group_0138_130=>• θsym - 
		67:207 comment_group_0138_130=>• θnum - 
            compile time: 4.005ms*/;
function $comment_group_0138_130(l,data,state,prod,puid){
    /*67:205 comment_group_0138_130=>• θid
    67:206 comment_group_0138_130=>• θsym
    67:207 comment_group_0138_130=>• θnum*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(l.isUniID(data)){
        pushFN(data,branch_3542cba400bdc4b9);
        return branch_d1b417e20a9bd046(l,data,state,prod,1);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.isSym(true,data)){
        pushFN(data,branch_3542cba400bdc4b9);
        return branch_6f5e28771e67ac14(l,data,state,prod,2);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.isNum(data)){
        pushFN(data,branch_3542cba400bdc4b9);
        return branch_1459c7d2ca7026a1(l,data,state,prod,4);
    }
    return -1;
}
function $comment_group_0138_130_reducer(l,data,state,prod,puid){
    return 67;
}
/*production name: comment_HC_listbody1_131
            grammar index: 68
            bodies:
	68:208 comment_HC_listbody1_131=>• comment_HC_listbody1_131 comment_group_0138_130 - 
		68:209 comment_HC_listbody1_131=>• comment_group_0138_130 - 
            compile time: 4.556ms*/;
function $comment_HC_listbody1_131(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*68:209 comment_HC_listbody1_131=>• comment_group_0138_130*/
    puid |=2;
    pushFN(data,branch_3c5e060d4d2de989);
    pushFN(data,$comment_group_0138_130);
    return puid;
    return -1;
}
function $comment_HC_listbody1_131_goto(l,data,state,prod,puid){
    /*68:208 comment_HC_listbody1_131=>comment_HC_listbody1_131 • comment_group_0138_130*/
    if(/*[asterisk/]*/cmpr_set(l,data,18,2,2)){
        return 68;
    }
    /*68:208 comment_HC_listbody1_131=>comment_HC_listbody1_131 • comment_group_0138_130
    71:213 comment=>/* comment_HC_listbody1_131 • * /*/
    skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if((l.isUniID(data)||l.isNum(data))||l.isSym(true,data)){
        pushFN(data,branch_b0016a63eef6ed7f);
        return branch_f8e019e50fc2f915(l,data,state,prod,1);
    }
    return prod == 68 ? prod : -1;
}
function $comment_HC_listbody1_131_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*68:208 comment_HC_listbody1_131=>comment_HC_listbody1_131 comment_group_0138_130 •*/
        add_reduce(state,data,2,2);
    } else if(2 == puid){
        /*68:209 comment_HC_listbody1_131=>comment_group_0138_130 •*/
        add_reduce(state,data,1,3);
    }
    return 68;
}
/*production name: comment_HC_listbody1_132
            grammar index: 69
            bodies:
	69:210 comment_HC_listbody1_132=>• comment_HC_listbody1_132 comment_group_0138_130 - 
		69:211 comment_HC_listbody1_132=>• comment_group_0138_130 - 
            compile time: 5.923ms*/;
function $comment_HC_listbody1_132(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*69:211 comment_HC_listbody1_132=>• comment_group_0138_130*/
    puid |=2;
    pushFN(data,branch_4a5dae1a31e6e58a);
    pushFN(data,$comment_group_0138_130);
    return puid;
    return -1;
}
function $comment_HC_listbody1_132_goto(l,data,state,prod,puid){
    /*69:210 comment_HC_listbody1_132=>comment_HC_listbody1_132 • comment_group_0138_130*/
    if(nocap_9b1ef04606bbaa09(l)/*[nl]*/){
        return 69;
    }
    /*69:210 comment_HC_listbody1_132=>comment_HC_listbody1_132 • comment_group_0138_130
    71:214 comment=>// comment_HC_listbody1_132 • comment_group_0143_133*/
    skip_6c02533b5dc0d802(l/*[ ws ][ 71 ]*/,data,state);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if((l.isUniID(data)||l.isNum(data))||l.isSym(true,data)){
        pushFN(data,branch_cbf1e60b49bba616);
        return branch_d517ec8557c6a81d(l,data,state,prod,1);
    }
    return prod == 69 ? prod : -1;
}
function $comment_HC_listbody1_132_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*69:210 comment_HC_listbody1_132=>comment_HC_listbody1_132 comment_group_0138_130 •*/
        add_reduce(state,data,2,2);
    } else if(2 == puid){
        /*69:211 comment_HC_listbody1_132=>comment_group_0138_130 •*/
        add_reduce(state,data,1,3);
    }
    return 69;
}
/*production name: comment_group_0143_133
            grammar index: 70
            bodies:
	70:212 comment_group_0143_133=>• θnl - 
            compile time: 1.031ms*/;
function $comment_group_0143_133(l,data,state,prod,puid){
    /*70:212 comment_group_0143_133=>• θnl*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(nocap_9b1ef04606bbaa09(l)/*[nl]*/){
        consume(l,data,state);
        puid |=1;
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        /*70:212 comment_group_0143_133=>θnl •*/
        /*[70]*/
        return 70;
    }
    return -1;
}
function $comment_group_0143_133_reducer(l,data,state,prod,puid){
    return 70;
}
/*production name: comment
            grammar index: 71
            bodies:
	71:213 comment=>• /* comment_HC_listbody1_131 * / - 
		71:214 comment=>• // comment_HC_listbody1_132 comment_group_0143_133 - 
		71:215 comment=>• /* * / - 
		71:216 comment=>• // comment_group_0143_133 - 
            compile time: 35.238ms*/;
function $comment(l,data,state,prod,puid){
    /*71:213 comment=>• /* comment_HC_listbody1_131 * /
    71:215 comment=>• /* * /
    71:214 comment=>• // comment_HC_listbody1_132 comment_group_0143_133
    71:216 comment=>• // comment_group_0143_133*/
    /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    if(/*[/asterisk]*/cmpr_set(l,data,17,2,2)){
        /*71:213 comment=>• /* comment_HC_listbody1_131 * /
        71:215 comment=>• /* * /*/
        var pk = l.copy();
        skip_9184d3c96b70653a(pk.next(data)/*[ ws ][ nl ][ 71 ]*/,data,0);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if(/*[asterisk/]*/cmpr_set(pk,data,18,2,2)){
            pushFN(data,branch_cbd95ed6c98c2884);
            return branch_9b7fc969504a1509(l,data,state,prod,1);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else if((pk.isUniID(data)||pk.isNum(data))||pk.isSym(true,data)){
            pushFN(data,branch_cbd95ed6c98c2884);
            return branch_a25481eaf4ab00c4(l,data,state,prod,1);
        }
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
    } else if(/*[//]*/cmpr_set(l,data,112,2,2)){
        /*71:214 comment=>• // comment_HC_listbody1_132 comment_group_0143_133
        71:216 comment=>• // comment_group_0143_133*/
        var pk = l.copy();
        skip_6c02533b5dc0d802(pk.next(data)/*[ ws ][ 71 ]*/,data,0);
        /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        if((pk.isUniID(data)||pk.isNum(data))||pk.isSym(true,data)){
            pushFN(data,branch_cbd95ed6c98c2884);
            return branch_ea2d14a513934484(l,data,state,prod,8);
            /*⤋⤋⤋ assert-peek ⤋⤋⤋*/
        } else if(nocap_9b1ef04606bbaa09(pk)/*[nl]*/){
            pushFN(data,branch_cbd95ed6c98c2884);
            return branch_cf4169e688143911(l,data,state,prod,8);
        }
    }
    return -1;
}
function $comment_reducer(l,data,state,prod,puid){
    if(7 == puid){
        /*71:213 comment=>/* comment_HC_listbody1_131 * / •*/
        add_reduce(state,data,3,0);
    } else if(56 == puid){
        /*71:214 comment=>// comment_HC_listbody1_132 comment_group_0143_133 •*/
        add_reduce(state,data,3,0);
    } else if(5 == puid){
        /*71:215 comment=>/* * / •*/
        add_reduce(state,data,2,0);
    } else if(40 == puid){
        /*71:216 comment=>// comment_group_0143_133 •*/
        add_reduce(state,data,2,0);
    }
    return 71;
}
/*production name: template
            grammar index: 72
            bodies:
	72:217 template=>• <<-- θnum -->> - 
		72:218 template=>• <<-- -->> - 
            compile time: 2.655ms*/;
function $template(l,data,state,prod,puid){
    /*72:217 template=>• <<-- θnum -->>
    72:218 template=>• <<-- -->>*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(/*[<<--]*/cmpr_set(l,data,20,4,4)){
        consume(l,data,state);
        puid |=1;
        /*72:217 template=><<-- • θnum -->>
        72:218 template=><<-- • -->>*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
        if(l.isNum(data)){
            pushFN(data,branch_1a9b92d8e81556d6);
            return branch_ff338b2751eb47b5(l,data,state,prod,1);
            /*⤋⤋⤋ assert ⤋⤋⤋*/
        } else if(/*[-->>]*/cmpr_set(l,data,23,4,4)){
            pushFN(data,branch_1a9b92d8e81556d6);
            return branch_e988f810b13d5747(l,data,state,prod,1);
        }
    }
    return -1;
}
function $template_reducer(l,data,state,prod,puid){
    if(7 == puid){
        /*72:217 template=><<-- θnum -->> •*/
        add_reduce(state,data,3,0);
    } else if(5 == puid){
        /*72:218 template=><<-- -->> •*/
        add_reduce(state,data,2,0);
    }
    return 72;
}
/*production name: def$hex
            grammar index: 78
            bodies:
	78:243 def$hex=>• tk:def$hex_token - 
            compile time: 1.412ms*/;
function $def$hex(l,data,state,prod,puid){
    /*78:243 def$hex=>• tk:def$hex_token*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(tk_63ad4c5612f74208(l,data)){
        consume(l,data,state);
        puid |=1;
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        /*78:243 def$hex=>tk:def$hex_token •*/
        /*[78]*/
        return 78;
    }
    return -1;
}
function $def$hex_reducer(l,data,state,prod,puid){
    return 78;
}
/*production name: def$binary
            grammar index: 79
            bodies:
	79:244 def$binary=>• tk:def$binary_token - 
            compile time: 1.41ms*/;
function $def$binary(l,data,state,prod,puid){
    /*79:244 def$binary=>• tk:def$binary_token*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(tk_2f515e58b15d487f(l,data)){
        consume(l,data,state);
        puid |=1;
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        /*79:244 def$binary=>tk:def$binary_token •*/
        /*[79]*/
        return 79;
    }
    return -1;
}
function $def$binary_reducer(l,data,state,prod,puid){
    return 79;
}
/*production name: def$octal
            grammar index: 80
            bodies:
	80:245 def$octal=>• tk:def$octal_token - 
            compile time: 1.867ms*/;
function $def$octal(l,data,state,prod,puid){
    /*80:245 def$octal=>• tk:def$octal_token*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(tk_75cdb915d57db20f(l,data)){
        consume(l,data,state);
        puid |=1;
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        /*80:245 def$octal=>tk:def$octal_token •*/
        /*[80]*/
        return 80;
    }
    return -1;
}
function $def$octal_reducer(l,data,state,prod,puid){
    return 80;
}
/*production name: def$number
            grammar index: 81
            bodies:
	81:246 def$number=>• tk:def$scientific_token - 
            compile time: 2.011ms*/;
function $def$number(l,data,state,prod,puid){
    /*81:246 def$number=>• tk:def$scientific_token*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(tk_52302cb4b3affc2c(l,data)){
        consume(l,data,state);
        puid |=1;
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        /*81:246 def$number=>tk:def$scientific_token •*/
        /*[81]*/
        return 81;
    }
    return -1;
}
function $def$number_reducer(l,data,state,prod,puid){
    return 81;
}
/*production name: def$scientific_token_group_027_101
            grammar index: 82
            bodies:
	82:247 def$scientific_token_group_027_101=>• e - 
		82:248 def$scientific_token_group_027_101=>• E - 
            compile time: 2.139ms*/;
function $def$scientific_token_group_027_101(l,data,state,prod,puid){
    /*82:247 def$scientific_token_group_027_101=>• e
    82:248 def$scientific_token_group_027_101=>• E*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(l.current_byte==101/*[e]*/){
        pushFN(data,branch_be0eb48b27d687bc);
        return branch_2d61734a600d2ee0(l,data,state,prod,1);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==69/*[E]*/){
        pushFN(data,branch_be0eb48b27d687bc);
        return branch_210c2a4c4c8c80e1(l,data,state,prod,2);
    }
    return -1;
}
function $def$scientific_token_group_027_101_reducer(l,data,state,prod,puid){
    return 82;
}
/*production name: def$scientific_token_group_228_102
            grammar index: 83
            bodies:
	83:249 def$scientific_token_group_228_102=>• def$scientific_token_group_027_101 - θnum - 
		83:250 def$scientific_token_group_228_102=>• def$scientific_token_group_027_101 θnum - 
            compile time: 4.497ms*/;
function $def$scientific_token_group_228_102(l,data,state,prod,puid){
    /*83:249 def$scientific_token_group_228_102=>• def$scientific_token_group_027_101 - θnum
    83:250 def$scientific_token_group_228_102=>• def$scientific_token_group_027_101 θnum*/
    pushFN(data,branch_65cfc9ad33d7b7ba);
    pushFN(data,$def$scientific_token_group_027_101);
    puid |=1;
    return puid;
    return -1;
}
function $def$scientific_token_group_228_102_reducer(l,data,state,prod,puid){
    if(7 == puid){
        /*83:249 def$scientific_token_group_228_102=>def$scientific_token_group_027_101 - θnum •*/
        add_reduce(state,data,3,0);
    } else if(5 == puid){
        /*83:250 def$scientific_token_group_228_102=>def$scientific_token_group_027_101 θnum •*/
        add_reduce(state,data,2,0);
    }
    return 83;
}
/*production name: def$scientific_token
            grammar index: 84
            bodies:
	84:251 def$scientific_token=>• def$float_token def$scientific_token_group_228_102 - 
		84:252 def$scientific_token=>• def$float_token - 
            compile time: 7.703ms*/;
function $def$scientific_token(l,data,state,prod,puid){
    /*84:251 def$scientific_token=>• def$float_token def$scientific_token_group_228_102
    84:252 def$scientific_token=>• def$float_token*/
    pushFN(data,branch_934a35c8dc8a8ebf);
    pushFN(data,$def$float_token);
    puid |=1;
    return puid;
    return -1;
}
function $def$scientific_token_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*84:251 def$scientific_token=>def$float_token def$scientific_token_group_228_102 •*/
        add_reduce(state,data,2,0);
    }
    return 84;
}
/*production name: def$float_token_group_130_103
            grammar index: 85
            bodies:
	85:253 def$float_token_group_130_103=>• . θnum - 
            compile time: 2.269ms*/;
function $def$float_token_group_130_103(l,data,state,prod,puid){
    /*85:253 def$float_token_group_130_103=>• . θnum*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.current_byte==46/*[.]*/){
        consume(l,data,state);
        puid |=1;
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        /*85:253 def$float_token_group_130_103=>. • θnum*/
        skip_9184d3c96b70653a(l/*[ ws ][ nl ][ 71 ]*/,data,state);
        puid |=2;
        if(l.isNum(data)&&consume(l,data,state)){
            add_reduce(state,data,2,0);
            /*[85]*/
            return 85;
        }
    }
    return -1;
}
function $def$float_token_group_130_103_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*85:253 def$float_token_group_130_103=>. θnum •*/
        add_reduce(state,data,2,0);
    }
    return 85;
}
/*production name: def$float_token
            grammar index: 86
            bodies:
	86:254 def$float_token=>• θnum def$float_token_group_130_103 - 
		86:255 def$float_token=>• θnum - 
            compile time: 10.24ms*/;
function $def$float_token(l,data,state,prod,puid){
    /*86:254 def$float_token=>• θnum def$float_token_group_130_103
    86:255 def$float_token=>• θnum*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(l.isNum(data)){
        consume(l,data,state);
        puid |=1;
        /*86:254 def$float_token=>θnum • def$float_token_group_130_103
        86:255 def$float_token=>θnum •*/
        skip_db1786a8af54d666(l/*[ 71 ]*/,data,state);
        /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
        if(l.current_byte==46/*[.]*/){
            pushFN(data,branch_4dcc18167384c0b1);
            return branch_ac8c29e43821baf7(l,data,state,prod,1);
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
        } else {
            /*--LEAF--*/
            /*⤋⤋⤋ assert-end ⤋⤋⤋*/
            /*86:255 def$float_token=>θnum •*/
            /*[86]*/
            return 86;
        }
    }
    return -1;
}
function $def$float_token_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*86:254 def$float_token=>θnum def$float_token_group_130_103 •*/
        add_reduce(state,data,2,0);
    }
    return 86;
}
/*production name: def$hex_token_group_044_104
            grammar index: 87
            bodies:
	87:256 def$hex_token_group_044_104=>• θnum - 
		87:257 def$hex_token_group_044_104=>• a - 
		87:258 def$hex_token_group_044_104=>• b - 
		87:259 def$hex_token_group_044_104=>• c - 
		87:260 def$hex_token_group_044_104=>• d - 
		87:261 def$hex_token_group_044_104=>• e - 
		87:262 def$hex_token_group_044_104=>• f - 
		87:263 def$hex_token_group_044_104=>• A - 
		87:264 def$hex_token_group_044_104=>• B - 
		87:265 def$hex_token_group_044_104=>• C - 
		87:266 def$hex_token_group_044_104=>• D - 
		87:267 def$hex_token_group_044_104=>• E - 
		87:268 def$hex_token_group_044_104=>• F - 
            compile time: 9.44ms*/;
function $def$hex_token_group_044_104(l,data,state,prod,puid){
    /*87:256 def$hex_token_group_044_104=>• θnum
    87:257 def$hex_token_group_044_104=>• a
    87:258 def$hex_token_group_044_104=>• b
    87:259 def$hex_token_group_044_104=>• c
    87:260 def$hex_token_group_044_104=>• d
    87:261 def$hex_token_group_044_104=>• e
    87:262 def$hex_token_group_044_104=>• f
    87:263 def$hex_token_group_044_104=>• A
    87:264 def$hex_token_group_044_104=>• B
    87:265 def$hex_token_group_044_104=>• C
    87:266 def$hex_token_group_044_104=>• D
    87:267 def$hex_token_group_044_104=>• E
    87:268 def$hex_token_group_044_104=>• F*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(l.isNum(data)){
        pushFN(data,branch_5725d6225969df91);
        return branch_590ed757bb827c26(l,data,state,prod,1);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==97/*[a]*/){
        pushFN(data,branch_5725d6225969df91);
        return branch_9d3cbdbdbb29c84a(l,data,state,prod,2);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==98/*[b]*/){
        pushFN(data,branch_5725d6225969df91);
        return branch_fb6844173b548b18(l,data,state,prod,4);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==99/*[c]*/){
        pushFN(data,branch_5725d6225969df91);
        return branch_860bac5cf31d5fbc(l,data,state,prod,8);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==100/*[d]*/){
        pushFN(data,branch_5725d6225969df91);
        return branch_6748c488c97c5b1f(l,data,state,prod,16);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==101/*[e]*/){
        pushFN(data,branch_5725d6225969df91);
        return branch_3ef340740569328c(l,data,state,prod,32);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==102/*[f]*/){
        pushFN(data,branch_5725d6225969df91);
        return branch_0cb4bad8128c2031(l,data,state,prod,64);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==65/*[A]*/){
        pushFN(data,branch_5725d6225969df91);
        return branch_5ecedf6a3cbdeffa(l,data,state,prod,128);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==66/*[B]*/){
        pushFN(data,branch_5725d6225969df91);
        return branch_3cd7a73e1c203544(l,data,state,prod,256);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==67/*[C]*/){
        pushFN(data,branch_5725d6225969df91);
        return branch_0ebec1e141e70718(l,data,state,prod,512);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==68/*[D]*/){
        pushFN(data,branch_5725d6225969df91);
        return branch_115f6d84935ced8f(l,data,state,prod,1024);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==69/*[E]*/){
        pushFN(data,branch_5725d6225969df91);
        return branch_761715d9ba159589(l,data,state,prod,2048);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==70/*[F]*/){
        pushFN(data,branch_5725d6225969df91);
        return branch_590840d9d6fa7989(l,data,state,prod,4096);
    }
    return -1;
}
function $def$hex_token_group_044_104_reducer(l,data,state,prod,puid){
    return 87;
}
/*production name: def$hex_token_HC_listbody1_105
            grammar index: 88
            bodies:
	88:269 def$hex_token_HC_listbody1_105=>• def$hex_token_HC_listbody1_105 def$hex_token_group_044_104 - 
		88:270 def$hex_token_HC_listbody1_105=>• def$hex_token_group_044_104 - 
            compile time: 6.921ms*/;
function $def$hex_token_HC_listbody1_105(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*88:270 def$hex_token_HC_listbody1_105=>• def$hex_token_group_044_104*/
    puid |=2;
    pushFN(data,branch_49a36ea7058e16fb);
    pushFN(data,$def$hex_token_group_044_104);
    return puid;
    return -1;
}
function $def$hex_token_HC_listbody1_105_goto(l,data,state,prod,puid){
    /*88:269 def$hex_token_HC_listbody1_105=>def$hex_token_HC_listbody1_105 • def$hex_token_group_044_104*/
    if(l.isSP(true,data)){
        return 88;
    }
    /*88:269 def$hex_token_HC_listbody1_105=>def$hex_token_HC_listbody1_105 • def$hex_token_group_044_104
    89:271 def$hex_token=>0x def$hex_token_HC_listbody1_105 •*/
    skip_a294e41529bc9275(l/*[ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(assert_ascii(l,0x0,0x0,0x7e,0x7e)||l.isNum(data)){
        pushFN(data,branch_93e110ed574c987e);
        return branch_cf58ea85ec38a788(l,data,state,prod,1);
    }
    return prod == 88 ? prod : -1;
}
function $def$hex_token_HC_listbody1_105_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*88:269 def$hex_token_HC_listbody1_105=>def$hex_token_HC_listbody1_105 def$hex_token_group_044_104 •*/
        add_reduce(state,data,2,2);
    } else if(2 == puid){
        /*88:270 def$hex_token_HC_listbody1_105=>def$hex_token_group_044_104 •*/
        add_reduce(state,data,1,3);
    }
    return 88;
}
/*production name: def$hex_token
            grammar index: 89
            bodies:
	89:271 def$hex_token=>• 0x def$hex_token_HC_listbody1_105 - 
            compile time: 2.316ms*/;
function $def$hex_token(l,data,state,prod,puid){
    /*89:271 def$hex_token=>• 0x def$hex_token_HC_listbody1_105*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(/*[0x]*/cmpr_set(l,data,27,2,2)){
        consume(l,data,state);
        puid |=1;
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        /*89:271 def$hex_token=>0x • def$hex_token_HC_listbody1_105*/
        skip_a294e41529bc9275(l/*[ nl ][ 71 ]*/,data,state);
        puid |=2;
        pushFN(data,branch_148f8b6b7ea6c5cd);
        pushFN(data,$def$hex_token_HC_listbody1_105);
        return puid;
    }
    return -1;
}
function $def$hex_token_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*89:271 def$hex_token=>0x def$hex_token_HC_listbody1_105 •*/
        add_reduce(state,data,2,0);
    }
    return 89;
}
/*production name: def$binary_token_group_047_106
            grammar index: 90
            bodies:
	90:272 def$binary_token_group_047_106=>• 0 - 
		90:273 def$binary_token_group_047_106=>• 1 - 
            compile time: 2.259ms*/;
function $def$binary_token_group_047_106(l,data,state,prod,puid){
    /*90:272 def$binary_token_group_047_106=>• 0
    90:273 def$binary_token_group_047_106=>• 1*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(l.current_byte==48/*[0]*/){
        pushFN(data,branch_4bdf7a450c230f77);
        return branch_0e92d280c0af4e55(l,data,state,prod,1);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==49/*[1]*/){
        pushFN(data,branch_4bdf7a450c230f77);
        return branch_014397e248dfbf1e(l,data,state,prod,2);
    }
    return -1;
}
function $def$binary_token_group_047_106_reducer(l,data,state,prod,puid){
    return 90;
}
/*production name: def$binary_token_HC_listbody1_107
            grammar index: 91
            bodies:
	91:274 def$binary_token_HC_listbody1_107=>• def$binary_token_HC_listbody1_107 def$binary_token_group_047_106 - 
		91:275 def$binary_token_HC_listbody1_107=>• def$binary_token_group_047_106 - 
            compile time: 8.425ms*/;
function $def$binary_token_HC_listbody1_107(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*91:275 def$binary_token_HC_listbody1_107=>• def$binary_token_group_047_106*/
    puid |=2;
    pushFN(data,branch_27c82a8b9221ece8);
    pushFN(data,$def$binary_token_group_047_106);
    return puid;
    return -1;
}
function $def$binary_token_HC_listbody1_107_goto(l,data,state,prod,puid){
    /*91:274 def$binary_token_HC_listbody1_107=>def$binary_token_HC_listbody1_107 • def$binary_token_group_047_106*/
    if(l.isSP(true,data)){
        return 91;
    }
    /*91:274 def$binary_token_HC_listbody1_107=>def$binary_token_HC_listbody1_107 • def$binary_token_group_047_106
    92:276 def$binary_token=>0b def$binary_token_HC_listbody1_107 •*/
    skip_a294e41529bc9275(l/*[ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if((l.current_byte==48/*[0]*/)||(l.current_byte==49/*[1]*/)){
        pushFN(data,branch_425efa1cfc8ffc16);
        return branch_447920a661b3711d(l,data,state,prod,1);
    }
    return prod == 91 ? prod : -1;
}
function $def$binary_token_HC_listbody1_107_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*91:274 def$binary_token_HC_listbody1_107=>def$binary_token_HC_listbody1_107 def$binary_token_group_047_106 •*/
        add_reduce(state,data,2,2);
    } else if(2 == puid){
        /*91:275 def$binary_token_HC_listbody1_107=>def$binary_token_group_047_106 •*/
        add_reduce(state,data,1,3);
    }
    return 91;
}
/*production name: def$binary_token
            grammar index: 92
            bodies:
	92:276 def$binary_token=>• 0b def$binary_token_HC_listbody1_107 - 
            compile time: 2.342ms*/;
function $def$binary_token(l,data,state,prod,puid){
    /*92:276 def$binary_token=>• 0b def$binary_token_HC_listbody1_107*/
    /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
    if(/*[0b]*/cmpr_set(l,data,114,2,2)){
        consume(l,data,state);
        puid |=1;
        /*--LEAF--*/
        /*⤋⤋⤋ assert-consume ⤋⤋⤋*/
        /*92:276 def$binary_token=>0b • def$binary_token_HC_listbody1_107*/
        skip_a294e41529bc9275(l/*[ nl ][ 71 ]*/,data,state);
        puid |=2;
        pushFN(data,branch_beb6074e150a3c2e);
        pushFN(data,$def$binary_token_HC_listbody1_107);
        return puid;
    }
    return -1;
}
function $def$binary_token_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*92:276 def$binary_token=>0b def$binary_token_HC_listbody1_107 •*/
        add_reduce(state,data,2,0);
    }
    return 92;
}
/*production name: def$octal_token_group_050_108
            grammar index: 93
            bodies:
	93:277 def$octal_token_group_050_108=>• 0o - 
		93:278 def$octal_token_group_050_108=>• 0O - 
            compile time: 2.156ms*/;
function $def$octal_token_group_050_108(l,data,state,prod,puid){
    /*93:277 def$octal_token_group_050_108=>• 0o
    93:278 def$octal_token_group_050_108=>• 0O*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(/*[0o]*/cmpr_set(l,data,137,2,2)){
        pushFN(data,branch_79fc893000608c8d);
        return branch_56de27721a2105bd(l,data,state,prod,1);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(/*[0O]*/cmpr_set(l,data,139,2,2)){
        pushFN(data,branch_79fc893000608c8d);
        return branch_2642273e9d37bde9(l,data,state,prod,2);
    }
    return -1;
}
function $def$octal_token_group_050_108_reducer(l,data,state,prod,puid){
    return 93;
}
/*production name: def$octal_token_group_058_109
            grammar index: 94
            bodies:
	94:279 def$octal_token_group_058_109=>• 0 - 
		94:280 def$octal_token_group_058_109=>• 1 - 
		94:281 def$octal_token_group_058_109=>• 2 - 
		94:282 def$octal_token_group_058_109=>• 3 - 
		94:283 def$octal_token_group_058_109=>• 4 - 
		94:284 def$octal_token_group_058_109=>• 5 - 
		94:285 def$octal_token_group_058_109=>• 6 - 
		94:286 def$octal_token_group_058_109=>• 7 - 
            compile time: 20.817ms*/;
function $def$octal_token_group_058_109(l,data,state,prod,puid){
    /*94:279 def$octal_token_group_058_109=>• 0
    94:280 def$octal_token_group_058_109=>• 1
    94:281 def$octal_token_group_058_109=>• 2
    94:282 def$octal_token_group_058_109=>• 3
    94:283 def$octal_token_group_058_109=>• 4
    94:284 def$octal_token_group_058_109=>• 5
    94:285 def$octal_token_group_058_109=>• 6
    94:286 def$octal_token_group_058_109=>• 7*/
    /*⤋⤋⤋ assert ⤋⤋⤋*/
    if(l.current_byte==48/*[0]*/){
        pushFN(data,branch_bfb17e535f287a90);
        return branch_bd7181a6789cdf53(l,data,state,prod,1);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==49/*[1]*/){
        pushFN(data,branch_bfb17e535f287a90);
        return branch_5a63fd0f5ce8c55b(l,data,state,prod,2);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==50/*[2]*/){
        pushFN(data,branch_bfb17e535f287a90);
        return branch_b63d7f48232e6678(l,data,state,prod,4);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==51/*[3]*/){
        pushFN(data,branch_bfb17e535f287a90);
        return branch_2785e1f0c964013a(l,data,state,prod,8);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==52/*[4]*/){
        pushFN(data,branch_bfb17e535f287a90);
        return branch_849029a2066d2c91(l,data,state,prod,16);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==53/*[5]*/){
        pushFN(data,branch_bfb17e535f287a90);
        return branch_0eb1d8d7c3f2f971(l,data,state,prod,32);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==54/*[6]*/){
        pushFN(data,branch_bfb17e535f287a90);
        return branch_b35fc2cb3b2850ec(l,data,state,prod,64);
        /*⤋⤋⤋ assert ⤋⤋⤋*/
    } else if(l.current_byte==55/*[7]*/){
        pushFN(data,branch_bfb17e535f287a90);
        return branch_557118a17d00e8ca(l,data,state,prod,128);
    }
    return -1;
}
function $def$octal_token_group_058_109_reducer(l,data,state,prod,puid){
    return 94;
}
/*production name: def$octal_token_HC_listbody1_110
            grammar index: 95
            bodies:
	95:287 def$octal_token_HC_listbody1_110=>• def$octal_token_HC_listbody1_110 def$octal_token_group_058_109 - 
		95:288 def$octal_token_HC_listbody1_110=>• def$octal_token_group_058_109 - 
            compile time: 9.784ms*/;
function $def$octal_token_HC_listbody1_110(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*95:288 def$octal_token_HC_listbody1_110=>• def$octal_token_group_058_109*/
    puid |=2;
    pushFN(data,branch_9d2b22f60d0d79bb);
    pushFN(data,$def$octal_token_group_058_109);
    return puid;
    return -1;
}
function $def$octal_token_HC_listbody1_110_goto(l,data,state,prod,puid){
    /*95:287 def$octal_token_HC_listbody1_110=>def$octal_token_HC_listbody1_110 • def$octal_token_group_058_109*/
    if(l.isSP(true,data)){
        return 95;
    }
    /*95:287 def$octal_token_HC_listbody1_110=>def$octal_token_HC_listbody1_110 • def$octal_token_group_058_109
    96:289 def$octal_token=>def$octal_token_group_050_108 def$octal_token_HC_listbody1_110 •*/
    skip_a294e41529bc9275(l/*[ nl ][ 71 ]*/,data,state);
    /*⤋⤋⤋ peek-production-symbols ⤋⤋⤋*/
    if(assert_ascii(l,0x0,0xff0000,0x0,0x0)){
        pushFN(data,branch_586655cede959332);
        return branch_dde02119f29f21a5(l,data,state,prod,1);
    }
    return prod == 95 ? prod : -1;
}
function $def$octal_token_HC_listbody1_110_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*95:287 def$octal_token_HC_listbody1_110=>def$octal_token_HC_listbody1_110 def$octal_token_group_058_109 •*/
        add_reduce(state,data,2,2);
    } else if(2 == puid){
        /*95:288 def$octal_token_HC_listbody1_110=>def$octal_token_group_058_109 •*/
        add_reduce(state,data,1,3);
    }
    return 95;
}
/*production name: def$octal_token
            grammar index: 96
            bodies:
	96:289 def$octal_token=>• def$octal_token_group_050_108 def$octal_token_HC_listbody1_110 - 
            compile time: 2.24ms*/;
function $def$octal_token(l,data,state,prod,puid){
    /*--LEAF--*/
    /*⤋⤋⤋ assert-production-symbols ⤋⤋⤋*/
    /*96:289 def$octal_token=>• def$octal_token_group_050_108 def$octal_token_HC_listbody1_110*/
    puid |=1;
    pushFN(data,branch_00da74118df8f839);
    pushFN(data,$def$octal_token_group_050_108);
    return puid;
    return -1;
}
function $def$octal_token_reducer(l,data,state,prod,puid){
    if(3 == puid){
        /*96:289 def$octal_token=>def$octal_token_group_050_108 def$octal_token_HC_listbody1_110 •*/
        add_reduce(state,data,2,0);
    }
    return 96;
}
function recognizer(data,input_byte_length,production){
    data.input_len = input_byte_length;
    data.lexer.next(data);
    skip_9184d3c96b70653a(data.lexer/*[ ws ][ nl ][ 71 ]*/,data,16777215);
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

    function pushFN(data, fn_ref){ data.stack[++data.stack_ptr] = fn_ref; }

    function init_table(){ return lookup_table;  }
    
  
    function dispatch(data, production_index){
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
case 32: data.stack[0] = $break_expression_group_164_115; data.stash[0] = 0; return;            
case 33: data.stack[0] = $break_expression; data.stash[0] = 0; return;            
case 34: data.stack[0] = $return_expression; data.stash[0] = 0; return;            
case 35: data.stack[0] = $continue_expression; data.stash[0] = 0; return;            
case 36: data.stack[0] = $primitive_declaration_group_169_116; data.stash[0] = 0; return;            
case 37: data.stack[0] = $primitive_declaration; data.stash[0] = 0; return;            
case 38: data.stack[0] = $identifier; data.stash[0] = 0; return;            
case 39: data.stack[0] = $identifier_token_group_074_117; data.stash[0] = 0; return;            
case 40: data.stack[0] = $identifier_token_HC_listbody1_118; data.stash[0] = 0; return;            
case 41: data.stack[0] = $identifier_token_group_079_119; data.stash[0] = 0; return;            
case 42: data.stack[0] = $identifier_token; data.stash[0] = 0; return;            
case 43: data.stack[0] = $modifier_list_HC_listbody1_120; data.stash[0] = 0; return;            
case 44: data.stack[0] = $modifier_list; data.stash[0] = 0; return;            
case 45: data.stack[0] = $type_group_086_121; data.stash[0] = 0; return;            
case 46: data.stack[0] = $type_group_091_122; data.stash[0] = 0; return;            
case 47: data.stack[0] = $type_group_094_123; data.stash[0] = 0; return;            
case 48: data.stack[0] = $type_group_097_124; data.stash[0] = 0; return;            
case 49: data.stack[0] = $type; data.stash[0] = 0; return;            
case 50: data.stack[0] = $value; data.stash[0] = 0; return;            
case 51: data.stack[0] = $string_group_0111_125; data.stash[0] = 0; return;            
case 52: data.stack[0] = $string_HC_listbody1_126; data.stash[0] = 0; return;            
case 53: data.stack[0] = $string_HC_listbody1_127; data.stash[0] = 0; return;            
case 54: data.stack[0] = $string; data.stash[0] = 0; return;            
case 55: data.stack[0] = $num; data.stash[0] = 0; return;            
case 56: data.stack[0] = $num_tok; data.stash[0] = 0; return;            
case 57: data.stack[0] = $operator_HC_listbody1_128; data.stash[0] = 0; return;            
case 58: data.stack[0] = $operator_HC_listbody1_129; data.stash[0] = 0; return;            
case 59: data.stack[0] = $operator; data.stash[0] = 0; return;            
case 60: data.stack[0] = $modifier; data.stash[0] = 0; return;            
case 61: data.stack[0] = $comment_group_0138_130; data.stash[0] = 0; return;            
case 62: data.stack[0] = $comment_HC_listbody1_131; data.stash[0] = 0; return;            
case 63: data.stack[0] = $comment_HC_listbody1_132; data.stash[0] = 0; return;            
case 64: data.stack[0] = $comment_group_0143_133; data.stash[0] = 0; return;            
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
,(env, sym, pos)=>( sym[0])/*3*/
,(env, sym, pos)=>( env.grabTemplateNode("template-statement"))/*4*/
,(env, sym, pos)=>( {type:"namespace",name:sym[1],statements:sym[3]})/*5*/
,(env, sym, pos)=>( {type:"namespace",name:sym[1]})/*6*/
,(env, sym, pos)=>( {type:"class",name:sym[2],inherits:sym[3],modifiers:sym[0]||[],members:sym[5]||[]})/*7*/
,(env, sym, pos)=>( {type:"class",name:sym[1],inherits:sym[2],modifiers:[],members:sym[4]||[]})/*8*/
,(env, sym, pos)=>( {type:"class",name:sym[2],inherits:null,modifiers:sym[0]||[],members:sym[4]||[]})/*9*/
,(env, sym, pos)=>( {type:"class",name:sym[2],inherits:sym[3],modifiers:sym[0]||[],members:[]})/*10*/
,(env, sym, pos)=>( {type:"class",name:sym[1],inherits:null,modifiers:[],members:sym[3]||[]})/*11*/
,(env, sym, pos)=>( {type:"class",name:sym[1],inherits:sym[2],modifiers:[],members:[]})/*12*/
,(env, sym, pos)=>( {type:"class",name:sym[2],inherits:null,modifiers:sym[0]||[],members:[]})/*13*/
,(env, sym, pos)=>( {type:"class",name:sym[1],inherits:null,modifiers:[],members:[]})/*14*/
,(env, sym, pos)=>( {type:"structure",name:sym[2],modifiers:sym[0]||[],properties:sym[4]||[]})/*15*/
,(env, sym, pos)=>( {type:"structure",name:sym[1],modifiers:[],properties:sym[3]||[]})/*16*/
,(env, sym, pos)=>( {type:"structure",name:sym[2],modifiers:sym[0]||[],properties:[]})/*17*/
,(env, sym, pos)=>( {type:"structure",name:sym[1],modifiers:[],properties:[]})/*18*/
,(env, sym, pos)=>( {type:"function",return_type:sym[4],name:sym[2],modifiers:sym[0]||[],parameters:sym[6]||[],expressions:sym[9]||[]})/*19*/
,(env, sym, pos)=>( {type:"function",return_type:sym[3],name:sym[1],modifiers:[],parameters:sym[5]||[],expressions:sym[8]||[]})/*20*/
,(env, sym, pos)=>( {type:"function",return_type:sym[4],name:sym[2],modifiers:sym[0]||[],parameters:[],expressions:sym[8]||[]})/*21*/
,(env, sym, pos)=>( {type:"function",return_type:sym[4],name:sym[2],modifiers:sym[0]||[],parameters:sym[6]||[],expressions:[]})/*22*/
,(env, sym, pos)=>( {type:"function",return_type:sym[3],name:sym[1],modifiers:[],parameters:[],expressions:sym[7]||[]})/*23*/
,(env, sym, pos)=>( {type:"function",return_type:sym[3],name:sym[1],modifiers:[],parameters:sym[5]||[],expressions:[]})/*24*/
,(env, sym, pos)=>( {type:"function",return_type:sym[4],name:sym[2],modifiers:sym[0]||[],parameters:[],expressions:[]})/*25*/
,(env, sym, pos)=>( {type:"function",return_type:sym[3],name:sym[1],modifiers:[],parameters:[],expressions:[]})/*26*/
,(env, sym, pos)=>( {type:"lambda",return_type:sym[3],modifiers:sym[0]||[],parameters:sym[5]||[],expressions:sym[8]||[]})/*27*/
,(env, sym, pos)=>( {type:"lambda",return_type:sym[2],modifiers:[],parameters:sym[4]||[],expressions:sym[7]||[]})/*28*/
,(env, sym, pos)=>( {type:"lambda",return_type:sym[3],modifiers:sym[0]||[],parameters:[],expressions:sym[7]||[]})/*29*/
,(env, sym, pos)=>( {type:"lambda",return_type:sym[3],modifiers:sym[0]||[],parameters:sym[5]||[],expressions:[]})/*30*/
,(env, sym, pos)=>( {type:"lambda",return_type:sym[2],modifiers:[],parameters:[],expressions:sym[6]||[]})/*31*/
,(env, sym, pos)=>( {type:"lambda",return_type:sym[2],modifiers:[],parameters:sym[4]||[],expressions:[]})/*32*/
,(env, sym, pos)=>( {type:"lambda",return_type:sym[3],modifiers:sym[0]||[],parameters:[],expressions:[]})/*33*/
,(env, sym, pos)=>( {type:"lambda",return_type:sym[2],modifiers:[],parameters:[],expressions:[]})/*34*/
,(env, sym, pos)=>( (sym[0].push(sym[2]),sym[0]))/*35*/
,(env, sym, pos)=>( sym[1])/*36*/
,(env, sym, pos)=>( null)/*37*/
,(env, sym, pos)=>( sym[1]?(sym[0].push(sym[1]),sym[0]):sym[0])/*38*/
,(env, sym, pos)=>( {type:"block",expression:sym[1]||[]})/*39*/
,(env, sym, pos)=>( env.grabTemplateNode("template-expression"))/*40*/
,(env, sym, pos)=>( {type:"block",expression:[]})/*41*/
,(env, sym, pos)=>( {type:"assignment",target:(sym[0]),expression:sym[2]})/*42*/
,(env, sym, pos)=>( {type:"if",assertion:sym[1],expression:sym[3],else:sym[4]})/*43*/
,(env, sym, pos)=>( {type:"if",assertion:sym[1],expression:sym[3],else:null})/*44*/
,(env, sym, pos)=>( {type:"operator-expression",list:[sym[0],sym[1]]})/*45*/
,(env, sym, pos)=>( sym[0].list?(sym[0].list.push(sym[1],sym[2]),sym[0]):{type:"operator-expression",list:[sym[0],sym[1],...(sym[2].type=="operator-expression"?sym[2].list:[sym[2]])]})/*46*/
,(env, sym, pos)=>( {type:"parenthesis",expression:sym[1]})/*47*/
,(env, sym, pos)=>( {type:"parenthesis"})/*48*/
,(env, sym, pos)=>( {type:"loop",assertion:sym[1],expression:sym[2]})/*49*/
,(env, sym, pos)=>( {type:"for-loop",initializers:sym[2],assertion:sym[4],post_iteration:sym[6],expression:sym[8]})/*50*/
,(env, sym, pos)=>( {type:"in-loop",initializer:sym[2],target:sym[4],expression:sym[6]})/*51*/
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